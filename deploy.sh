#!/bin/bash

# StreamCenter Deployment Script for Ubuntu VPS
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e  # Exit on error

echo "=========================================="
echo "   StreamCenter Deployment (Ubuntu)       "
echo "=========================================="

# 1. Update System & Install Dependencies
echo "[1/5] Installing System Dependencies..."
sudo apt-get update
sudo apt-get install -y python3 python3-pip ffmpeg nodejs npm git

# 2. Install Python Dependencies
echo "[2/5] Installing Python Dependencies..."
pip3 install fastapi uvicorn pydantic

# 3. Build Frontend
echo "[3/5] Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# 4. Create Systemd Service
echo "[4/5] Configuring Systemd Service..."
SERVICE_FILE="/etc/systemd/system/streamcenter.service"
CURRENT_DIR=$(pwd)
USER=$(whoami)

# Create service file content
sudo bash -c "cat > $SERVICE_FILE" <<EOL
[Unit]
Description=StreamCenter 24/7 Livestream Manager
After=network.target

[Service]
User=$USER
WorkingDirectory=$CURRENT_DIR
ExecStart=/usr/bin/python3 $CURRENT_DIR/server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

echo "Service file created at $SERVICE_FILE"

# 5. Enable and Start Service
echo "[5/5] Starting Service..."
sudo systemctl daemon-reload
sudo systemctl enable streamcenter
sudo systemctl restart streamcenter

echo "=========================================="
echo "   Deployment Complete!                   "
echo "=========================================="
echo "Status: sudo systemctl status streamcenter"
echo "Logs:   sudo journalctl -u streamcenter -f"
echo "Access: http://$(curl -s ifconfig.me):5000"
