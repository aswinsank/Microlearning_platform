from fastapi import APIRouter, UploadFile, Form, File, HTTPException
from typing import Optional
from uuid import uuid4
from datetime import datetime
import os
import shutil
import json
from db import lessons_collection

router = APIRouter()



LESSONS_DB = []

@router.post("/lessons/upload_quiz")
async def upload_quiz_lesson(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    tutor_id: str = Form(...),
    quiz_data: str = Form(...)
):
    lesson_id = str(uuid4())
    created_at = datetime.utcnow()

    try:
        quiz_questions = json.loads(quiz_data)
        if not isinstance(quiz_questions, list) or len(quiz_questions) == 0:
            raise HTTPException(status_code=400, detail="Quiz must contain at least one question.")
        for i, question in enumerate(quiz_questions):
            required_fields = ["question", "options", "correct_answer"]
            if not all(key in question for key in required_fields):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Question {i+1} is missing required fields (question, options, correct_answer)."
                )
            if not isinstance(question["options"], list) or len(question["options"]) < 2:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Question {i+1} must have at least 2 options."
                )
            if question["correct_answer"] not in question["options"]:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Question {i+1}: correct_answer must be one of the provided options."
                )
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for quiz data.")

    lesson = {
        "_id": lesson_id,
        "title": title,
        "description": description,
        "format": "quiz",
        "quiz_data": quiz_questions,
        "total_questions": len(quiz_questions),
        "category": category,
        "tutor_id": tutor_id,
        "created_at": created_at.isoformat()
    }

    lessons_collection.insert_one(lesson)

    return {"message": "Quiz uploaded and saved to MongoDB", "lesson": lesson}

@router.get("/lessons")
async def get_lessons(category: Optional[str] = None, format: Optional[str] = None):
    """Get all lessons with optional filtering by category and format"""
    filtered_lessons = LESSONS_DB.copy()
    
    if category:
        filtered_lessons = [lesson for lesson in filtered_lessons if lesson["category"].lower() == category.lower()]
    
    if format:
        filtered_lessons = [lesson for lesson in filtered_lessons if lesson["format"] == format]
    
    return {"lessons": filtered_lessons, "total": len(filtered_lessons)}

@router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    """Get a specific lesson by ID"""
    lesson = next((lesson for lesson in LESSONS_DB if lesson["_id"] == lesson_id), None)
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")
    
    return {"lesson": lesson}