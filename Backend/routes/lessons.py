from fastapi import APIRouter, UploadFile, Form, File, HTTPException
from typing import Optional
from uuid import uuid4
from datetime import datetime
import os
import shutil

router = APIRouter()

UPLOAD_FOLDER = "uploaded_videos"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Temporary in-memory store
LESSONS_DB = []

@router.post("/lessons/upload_video")
async def upload_video_lesson(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    tutor_id: str = Form(...),
    video_type: str = Form(...),  # "local" or "youtube"
    youtube_url: Optional[str] = Form(None),
    video_file: Optional[UploadFile] = File(None)
):
    lesson_id = str(uuid4())
    created_at = datetime.utcnow()

    if video_type == "local":
        if not video_file:
            raise HTTPException(status_code=400, detail="Video file is required.")
        filename = f"{lesson_id}_{video_file.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(video_file.file, buffer)
        content_url = f"/uploaded_videos/{filename}"
    elif video_type == "youtube":
        if not youtube_url:
            raise HTTPException(status_code=400, detail="YouTube URL is required.")
        content_url = youtube_url
    else:
        raise HTTPException(status_code=400, detail="Invalid video_type (must be 'local' or 'youtube')")

    lesson = {
        "_id": lesson_id,
        "title": title,
        "description": description,
        "format": "video",
        "video_type": video_type,
        "content_url": content_url,
        "category": category,
        "tutor_id": tutor_id,
        "created_at": created_at.isoformat()
    }

    LESSONS_DB.append(lesson)

    return {"message": "Video uploaded successfully", "lesson": lesson}
