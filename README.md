# StreamCenter - 24/7 YouTube Livestream Manager

StreamCenter is a professional, self-hosted web interface for managing 24/7 YouTube livestreams. It is designed for stability on VPS environments, featuring auto-healing capabilities, performance tuning, and a modern dashboard.

![StreamCenter Dashboard](https://via.placeholder.com/800x450?text=StreamCenter+Dashboard)

## Features

- **Professional Dashboard**: Real-time status monitoring, uptime tracking, and system logs.
- **VPS Optimized**: Tuned specifically for limited-resource environments (e.g., 4GB RAM, 4 vCPUs).
- **Auto-Healing Watchdog**: Automatically detects stream freezes (30s timeout) and restarts FFmpeg to ensure maximum uptime.
- **Live Preview**: Embeds your YouTube livestream directly in the dashboard for easy monitoring.
- **Performance Profiles**:
  - **VPS Optimized (Default)**: Uses `veryfast` preset and 3 threads (leaves 1 core for OS).
  - **Balanced**: `medium` preset.
  - **High Quality**: `slow` preset.
- **Configurable**: Adjust stream keys, video files, and upload pauses directly from the UI.

## Prerequisites

- **Python 3.8+**
- **Node.js 16+** (for building the frontend)
- **FFmpeg** (must be installed and in your system PATH)

## Installation

### 1. Backend Setup

```bash
# Install Python dependencies
pip install fastapi uvicorn pydantic
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run build
cd ..
```

## Usage

### Starting the Server

You can start the server using the provided batch file or directly via Python:

```bash
# Windows
python server.py

# Linux / VPS
python3 server.py
```

The web interface will be available at: `http://localhost:8000`

### Configuration

1.  **Stream Key**: Enter your YouTube Stream Key in the "Configuration" tab.
2.  **Video Source**: Ensure your video file (e.g., `video.mp4`) is in the project root or upload one via the "Media" tab.
3.  **Channel ID**: Enter your YouTube Channel ID (e.g., `UC...`) to enable the Live Preview on the dashboard.

## VPS Deployment (Ubuntu 24/7)

For a professional 24/7 deployment, use the included automated script to set up a **Systemd Service**. This ensures the stream restarts automatically if the server reboots or crashes.

### Automated Deployment

1.  **Upload the code** to your VPS.
2.  **Run the deployment script**:

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
1.  Install all dependencies (FFmpeg, Python, Node.js).
2.  Build the frontend.
3.  Create and start a background service (`streamcenter`).

### Managing the Service

-   **Check Status**: `sudo systemctl status streamcenter`
-   **View Logs**: `sudo journalctl -u streamcenter -f`
-   **Stop**: `sudo systemctl stop streamcenter`
-   **Restart**: `sudo systemctl restart streamcenter`

### Manual Setup (Alternative)

If you prefer `screen`:

```bash
screen -S streamcenter
python3 server.py
# Press Ctrl+A, then D to detach
```

## Troubleshooting

- **Stream Freezes**: The built-in Watchdog will attempt to restart the stream after 30 seconds of inactivity. Check the "Logs" console in the dashboard for "WATCHDOG" events.
- **High CPU Usage**: Ensure "Performance Profile" is set to **"VPS Optimized"** in the settings.
- **Black Screen on Dashboard**: Ensure you have run `npm run build` in the `frontend` directory.

## License

MIT

---

<div align="center">

### Developed by [@leksautomate](https://youtube.com/@leksautomate)

[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/@leksautomate)
[![TikTok](https://img.shields.io/badge/TikTok-000000?style=for-the-badge&logo=tiktok&logoColor=white)](https://tiktok.com/@leksautomate)

</div>
