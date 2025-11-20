from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import shutil
import os
import json
from stream_manager import manager, CONFIG_FILE

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure videos directory exists
VIDEOS_DIR = "videos"
if not os.path.exists(VIDEOS_DIR):
    os.makedirs(VIDEOS_DIR)

class ConfigUpdate(BaseModel):
    stream_key: str
    video_file: str
    stream_duration: int
    upload_pause: int
    rtmp_url: str
    performance_profile: str = "vps_optimized"
    channel_id: str = ""

@app.get("/status")
def get_status():
    return manager.get_status()

@app.post("/start")
def start_stream():
    success, message = manager.start()
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message}

@app.post("/stop")
def stop_stream():
    success, message = manager.stop()
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message}

@app.get("/config")
def get_config():
    return manager.load_config()

@app.post("/config")
def update_config(config: ConfigUpdate):
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config.dict(), f, indent=4)
        return {"message": "Configuration updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/videos")
def list_videos():
    videos = []
    if os.path.exists(VIDEOS_DIR):
        for f in os.listdir(VIDEOS_DIR):
            if f.endswith(('.mp4', '.mkv', '.avi', '.mov', '.flv')):
                path = os.path.join(VIDEOS_DIR, f)
                size_mb = os.path.getsize(path) / (1024 * 1024)
                videos.append({
                    "name": f,
                    "path": path,
                    "size_mb": round(size_mb, 2)
                })
    return videos

@app.delete("/videos/{filename}")
def delete_video(filename: str):
    # Security check: prevent directory traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    path = os.path.join(VIDEOS_DIR, filename)
    if os.path.exists(path):
        try:
            os.remove(path)
            return {"status": "deleted", "filename": filename}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(status_code=404, detail="File not found")

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    try:
        # Save to videos directory
        file_location = os.path.join(VIDEOS_DIR, file.filename)
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        
        return {"info": f"file '{file.filename}' saved at '{file_location}'", "path": file_location}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Serve Frontend (Must be last)
if os.path.exists("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")
else:
    print("Warning: frontend/dist not found. Run 'npm run build' in frontend directory.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
