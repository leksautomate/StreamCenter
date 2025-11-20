import subprocess
import time
import json
import os
import sys
import threading
from datetime import datetime, timedelta

CONFIG_FILE = 'config.json'

class StreamManager:
    def __init__(self):
        self.process = None
        self.running = False
        self.stop_event = threading.Event()
        self.thread = None
        self.start_time = None
        self.next_restart = None
        self.status = "Stopped"

    def load_config(self):
        if not os.path.exists(CONFIG_FILE):
            return {}
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)

    def get_ffmpeg_command(self, config):
        video_file = config.get('video_file', 'video.mp4')
        stream_key = config.get('stream_key', '')
        rtmp_url = config.get('rtmp_url', 'rtmp://a.rtmp.youtube.com/live2')
        profile = config.get('performance_profile', 'vps_optimized') # Default to vps_optimized
        
        if not stream_key or stream_key == "YOUR_STREAM_KEY_HERE":
            print("Error: Please set your valid stream_key in config.json")
            return None

        if not os.path.exists(video_file):
            print(f"Error: Video file '{video_file}' not found.")
            return None

        # Performance Profile Settings
        # System Specs: 4 vCPUs, ~4GB RAM (2.2GB Available)
        # Strategy: 
        # - Threads: 3 (Leave 1 for OS/API)
        # - Preset: veryfast (Low CPU usage)
        # - Bufsize: 6000k (Standard 2x bitrate, safe for memory)
        
        threads = '3' 
        preset = 'veryfast'
        
        if profile == 'balanced':
            preset = 'medium'
            threads = '0' # Let FFmpeg decide
        elif profile == 'high_quality':
            preset = 'slow'
            threads = '0'
        # 'vps_optimized' (formerly low_cpu) uses default settings above

        command = [
            'ffmpeg',
            '-re',
            '-stream_loop', '-1',
            '-i', video_file,
            '-c:v', 'libx264',
            '-preset', preset,
            '-threads', threads,
            '-maxrate', '3000k',
            '-bufsize', '6000k',
            '-pix_fmt', 'yuv420p',
            '-g', '50',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-ar', '44100',
            '-f', 'flv',
            f'{rtmp_url}/{stream_key}'
        ]
        return command

    def start(self):
        if self.running:
            return False, "Stream is already running"
        
        self.stop_event.clear()
        self.running = True
        self.thread = threading.Thread(target=self._run_loop)
        self.thread.daemon = True
        self.thread.start()
        return True, "Stream started"

    def stop(self):
        if not self.running:
            return False, "Stream is not running"
        
        self.status = "Stopping..."
        self.stop_event.set()
        if self.process:
            self.process.terminate()
        
        if self.thread:
            self.thread.join(timeout=5)
        
        self.running = False
        self.status = "Stopped"
        return True, "Stream stopped"

    def _run_loop(self):
        print("Stream Manager Thread Started")
        while not self.stop_event.is_set():
            config = self.load_config()
            if not config:
                time.sleep(5)
                continue

            cmd = self.get_ffmpeg_command(config)
            if not cmd:
                self.status = "Config Error"
                time.sleep(5)
                continue

            stream_duration = config.get('stream_duration', 11 * 60 * 60)
            upload_pause = config.get('upload_pause', 5 * 60)

            self.start_time = datetime.now()
            self.next_restart = self.start_time + timedelta(seconds=stream_duration)
            self.status = "Streaming"
            
            print(f"Starting FFmpeg... Next restart at {self.next_restart.strftime('%H:%M:%S')}")
            
            # WATCHDOG IMPLEMENTATION
            # We capture stderr because FFmpeg writes stats there.
            self.process = subprocess.Popen(
                cmd, 
                stdout=subprocess.DEVNULL, 
                stderr=subprocess.PIPE, 
                universal_newlines=True,
                bufsize=1
            )

            last_activity = datetime.now()
            
            # Non-blocking read loop
            while datetime.now() < self.next_restart and not self.stop_event.is_set():
                if self.process.poll() is not None:
                    print("FFmpeg exited unexpectedly. Restarting...")
                    break
                
                # Check for output (activity)
                # We use a simple poll on stderr to avoid blocking indefinitely
                # Note: On Windows, select() only works on sockets, so we use a slightly different approach 
                # or rely on the fact that we are reading line by line. 
                # Ideally, we'd use a separate thread for reading, but for simplicity in this script:
                # We will assume that if the process is running, it SHOULD be outputting stats every second.
                
                # However, reading stderr.readline() IS blocking. 
                # To make it robust without complex async/threading, we'll trust the process state 
                # but implement a "soft" watchdog if we were doing more advanced log parsing.
                # For this version, we will stick to basic process health + restart loop.
                
                # UPGRADE: To implement true freeze detection (Watchdog), we need to read without blocking.
                # Since Python's subprocess read is blocking, we can use a thread to read lines and update a timestamp.
                
                # Let's spawn a reader thread for this process instance
                def reader_thread(proc, last_activity_ref):
                    try:
                        for line in iter(proc.stderr.readline, ''):
                            if not line: break
                            last_activity_ref[0] = datetime.now()
                            # Optional: Print stats to console for debugging
                            # print(line.strip()) 
                    except:
                        pass

                last_activity_ref = [datetime.now()]
                t = threading.Thread(target=reader_thread, args=(self.process, last_activity_ref))
                t.daemon = True
                t.start()

                while datetime.now() < self.next_restart and not self.stop_event.is_set():
                    if self.process.poll() is not None:
                        break
                    
                    # WATCHDOG CHECK
                    time_since_activity = (datetime.now() - last_activity_ref[0]).total_seconds()
                    if time_since_activity > 30: # 30 seconds timeout
                        print(f"WATCHDOG: FFmpeg frozen for {time_since_activity}s. Killing...")
                        self.status = "Frozen (Restarting...)"
                        self.process.kill()
                        break
                    
                    time.sleep(1)
                
                break # Exit the inner loop to restart or stop

            if self.stop_event.is_set():
                if self.process and self.process.poll() is None:
                    self.process.terminate()
                break

            if self.process and self.process.poll() is None:
                print("Stopping for upload pause...")
                self.process.terminate()
                try:
                    self.process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    self.process.kill()

            self.status = "Paused (Upload Window)"
            pause_end = datetime.now() + timedelta(seconds=upload_pause)
            while datetime.now() < pause_end and not self.stop_event.is_set():
                time.sleep(1)
        
        if self.process and self.process.poll() is None:
            self.process.terminate()
        self.running = False
        self.status = "Stopped"
        print("Stream Manager Thread Stopped")

    def get_status(self):
        return {
            "running": self.running,
            "status": self.status,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "next_restart": self.next_restart.isoformat() if self.next_restart else None
        }

# Global instance for API usage
manager = StreamManager()

if __name__ == "__main__":
    # Legacy support for running directly
    try:
        manager.start()
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        manager.stop()
