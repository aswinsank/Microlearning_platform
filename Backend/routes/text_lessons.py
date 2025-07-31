from fastapi import APIRouter, UploadFile, Form, File, HTTPException
from typing import Optional
from uuid import uuid4
from datetime import datetime
import os
import shutil
from bson.binary import Binary
from db import lessons_collection

router = APIRouter()

UPLOAD_FOLDER = "uploaded_texts"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/lessons/upload_text")
async def upload_text_lesson(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    tutor_id: str = Form(...),
    content_type: str = Form(...),  # "plain" or "file"
    text_content: Optional[str] = Form(None),
    text_file: Optional[UploadFile] = File(None)
):
    lesson_id = str(uuid4())
    created_at = datetime.utcnow()

    if content_type == "plain":
        if not text_content or not text_content.strip():
            raise HTTPException(status_code=400, detail="Text content is required.")

        filename = f"{lesson_id}_plain.txt"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(text_content.strip())

        content_url = f"/uploaded_texts/{filename}"
        final_text_content = text_content.strip()
        file_data = None  # No file data for plain text

    elif content_type == "file":
        if not text_file:
            raise HTTPException(status_code=400, detail="File is required.")

        allowed_extensions = ['.txt', '.md', '.doc', '.docx', '.pdf']
        file_extension = os.path.splitext(text_file.filename)[1].lower()

        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )

        filename = f"{lesson_id}_{text_file.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(text_file.file, buffer)

        content_url = f"/uploaded_texts/{filename}"

        # Read file content for DB storage
        with open(file_path, "rb") as f:
            file_data = Binary(f.read())

        if file_extension in ['.txt', '.md']:
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    final_text_content = f.read()
            except UnicodeDecodeError:
                try:
                    with open(file_path, "r", encoding="latin-1") as f:
                        final_text_content = f.read()
                except:
                    final_text_content = "File uploaded successfully. Content preview not available."
        else:
            final_text_content = f"File uploaded: {text_file.filename}. Content extraction not implemented for this file type."

    else:
        raise HTTPException(status_code=400, detail="Invalid content_type (must be 'plain' or 'file')")

    lesson = {
        "_id": lesson_id,
        "title": title,
        "description": description,
        "format": "text",
        "content_type": content_type,
        "text_content": final_text_content,
        "content_url": content_url,
        "category": category,
        "tutor_id": tutor_id,
        "created_at": created_at.isoformat()
    }

    lessons_collection.insert_one(lesson)

    return {"message": "Text lesson uploaded successfully", "lesson": lesson}

@router.get("/lessons/text")
async def get_text_lessons():
    """Get all text lessons"""
    lessons = list(lessons_collection.find({"format": "text"}, {"_id": 0}))
    return {"lessons": lessons}

@router.get("/lessons/text/{lesson_id}")
async def get_text_lesson(lesson_id: str):
    """Get a specific text lesson by ID"""
    lesson = lessons_collection.find_one({"_id": lesson_id, "format": "text"}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"lesson": lesson}
