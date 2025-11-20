import React, { createContext, useState, useEffect, useContext } from 'react';

const StreamContext = createContext();

// Use relative URL in production (served by FastAPI)
// In DEV, use the current hostname (VPS IP) but port 5000
const API_URL = import.meta.env.DEV ? `http://${window.location.hostname}:5000` : '';

export function StreamProvider({ children }) {
    const [status, setStatus] = useState(null);
    const [config, setConfig] = useState(null);
    const [logs, setLogs] = useState([]);
    const [videos, setVideos] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Initial Fetch & Polling
    useEffect(() => {
        fetchStatus();
        fetchConfig();
        fetchVideos();

        const interval = setInterval(() => {
            fetchStatus();
            fetchVideos();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const addLog = (msg) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
    };

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/status`);
            const data = await res.json();
            setStatus(data);
        } catch (err) {
            console.error("Failed to fetch status", err);
        }
    };

    const fetchConfig = async () => {
        try {
            const res = await fetch(`${API_URL}/config`);
            const data = await res.json();
            if (!data.performance_profile) data.performance_profile = 'vps_optimized';
            setConfig(data);
        } catch (err) {
            console.error("Failed to fetch config", err);
        }
    };

    const fetchVideos = async () => {
        try {
            const res = await fetch(`${API_URL}/videos`);
            const data = await res.json();
            setVideos(data);
        } catch (err) {
            console.error("Failed to fetch videos", err);
        }
    };

    const startStream = async () => {
        try {
            const res = await fetch(`${API_URL}/start`, { method: 'POST' });
            const data = await res.json();
            addLog(`Command: Start - ${data.message}`);
            fetchStatus();
        } catch (err) {
            addLog(`Error starting stream: ${err.message}`);
        }
    };

    const stopStream = async () => {
        try {
            const res = await fetch(`${API_URL}/stop`, { method: 'POST' });
            const data = await res.json();
            addLog(`Command: Stop - ${data.message}`);
            fetchStatus();
        } catch (err) {
            addLog(`Error stopping stream: ${err.message}`);
        }
    };

    const saveConfig = async (newConfig) => {
        try {
            const res = await fetch(`${API_URL}/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig),
            });
            addLog("Configuration saved successfully.");
            setConfig(newConfig);
        } catch (err) {
            addLog(`Error saving config: ${err.message}`);
        }
    };

    const uploadVideo = async (file) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            addLog(`Upload: ${data.message}`);
            fetchVideos();
            return data;
        } catch (err) {
            addLog(`Upload failed: ${err.message}`);
            throw err;
        } finally {
            setUploading(false);
        }
    };

    const deleteVideo = async (filename) => {
        try {
            const res = await fetch(`${API_URL}/videos/${filename}`, { method: 'DELETE' });
            if (res.ok) {
                addLog(`Deleted video: ${filename}`);
                fetchVideos();
                if (config?.video_file?.includes(filename)) {
                    addLog("Warning: Deleted currently active video file.");
                }
                return true;
            } else {
                throw new Error("Delete failed");
            }
        } catch (err) {
            addLog(`Error deleting video: ${err.message}`);
            return false;
        }
    };

    const selectVideo = (path) => {
        const newConfig = { ...config, video_file: path };
        setConfig(newConfig);
        addLog(`Selected video source: ${path}`);
        // Optional: Auto-save config when selecting?
        // saveConfig(newConfig); 
    };

    return (
        <StreamContext.Provider value={{
            status,
            config,
            setConfig,
            logs,
            videos,
            uploading,
            startStream,
            stopStream,
            saveConfig,
            uploadVideo,
            deleteVideo,
            selectVideo
        }}>
            {children}
        </StreamContext.Provider>
    );
}

export function useStream() {
    return useContext(StreamContext);
}
