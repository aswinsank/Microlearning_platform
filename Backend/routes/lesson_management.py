# routes/lesson_management.py
from fastapi import APIRouter, HTTPException
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional
import datetime
from db import lessons_collection

router = APIRouter()

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    type: Optional[str] = None
    duration: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    thumbnail: Optional[str] = None
    video_type: Optional[str] = None
    content_url: Optional[str] = None

# Get lesson by ID (for viewing)
@router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    try:
        lesson = lessons_collection.find_one({"_id": ObjectId(lesson_id)})
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        # Convert ObjectId to string for JSON serialization
        lesson["_id"] = str(lesson["_id"])
        return {"lesson": lesson}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Add test data endpoint
@router.post("/lessons/add_test_data")
async def add_test_data():
    try:
        test_lessons = [
            {
                "title": "Linear Algebra Basics",
                "description": "Introduction to linear algebra concepts",
                "format": "video",
                "video_type": "youtube",
                "content_url": "https://youtube.com/watch?v=example1",
                "category": "Math",
                "tutor_id": "tutor123",
                "created_at": datetime.datetime.utcnow().isoformat(),
                "views": 150,
                "completions": 120,
                "rating": 4.5,
                "status": "published",
                "duration": "45 min"
            },
            {
                "title": "Advanced Calculus",
                "description": "Deep dive into calculus",
                "format": "video", 
                "video_type": "local",
                "content_url": "/uploaded_videos/calculus.mp4",
                "category": "Math",
                "tutor_id": "tutor123",
                "created_at": datetime.datetime.utcnow().isoformat(),
                "views": 89,
                "completions": 67,
                "rating": 4.2,
                "status": "published",
                "duration": "60 min"
            },
            {
                "title": "Programming Fundamentals",
                "description": "Learn programming basics",
                "format": "video",
                "video_type": "youtube", 
                "content_url": "https://youtube.com/watch?v=example2",
                "category": "Programming",
                "tutor_id": "tutor234",
                "created_at": datetime.datetime.utcnow().isoformat(),
                "views": 234,
                "completions": 178,
                "rating": 4.7,
                "status": "published",
                "duration": "30 min"
            }
        ]
        
        result = lessons_collection.insert_many(test_lessons)
        return {
            "message": "Test data added successfully",
            "inserted_count": len(result.inserted_ids),
            "inserted_ids": [str(id) for id in result.inserted_ids]
        }
    except Exception as e:
        return {"error": str(e)}

# Simple test endpoint to see all lessons
@router.get("/lessons/test/all")
async def get_all_lessons_test():
    try:
        lessons = list(lessons_collection.find({}))
        for lesson in lessons:
            lesson["_id"] = str(lesson["_id"])
        return {
            "total_count": len(lessons),
            "lessons": lessons
        }
    except Exception as e:
        return {"error": str(e)}

# Debug endpoint to see raw data
@router.get("/lessons/debug/{tutor_id}")
async def debug_lessons_by_tutor(tutor_id: str):
    try:
        # First, let's see what's actually in the database
        all_lessons = list(lessons_collection.find({}))
        filtered_lessons = list(lessons_collection.find({"tutor_id": tutor_id}))
        
        for lesson in all_lessons:
            lesson["_id"] = str(lesson["_id"])
        for lesson in filtered_lessons:
            lesson["_id"] = str(lesson["_id"])
            
        return {
            "tutor_id_searched": tutor_id,
            "total_lessons_in_db": len(all_lessons),
            "all_lessons": all_lessons[:3],  # Show first 3 for debugging
            "filtered_lessons_count": len(filtered_lessons),
            "filtered_lessons": filtered_lessons
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get lessons by tutor ID (modified to match your existing structure)
@router.get("/lessons/by_tutor/{tutor_id}")
async def get_lessons_by_tutor(tutor_id: str):
    try:
        print(f"Searching for lessons with tutor_id: {tutor_id}")  # Debug print
        
        # Try both field names in case there's inconsistency
        lessons = list(lessons_collection.find({
            "$or": [
                {"tutor_id": tutor_id},
                {"tutorId": tutor_id}
            ]
        }))
        
        print(f"Found {len(lessons)} lessons")  # Debug print
        
        # Convert and map your data structure to what frontend expects
        mapped_lessons = []
        for lesson in lessons:
            mapped_lesson = {
                "_id": str(lesson["_id"]),
                "id": str(lesson["_id"]),  # Also provide 'id' for compatibility
                "title": lesson.get("title", "Untitled"),
                "description": lesson.get("description", ""),
                "category": lesson.get("category", "Uncategorized"),
                "type": lesson.get("format", "video"),  # Map 'format' to 'type'
                "status": lesson.get("status", "published"),
                "duration": lesson.get("duration", "N/A"),
                "uploadDate": lesson.get("created_at", "Unknown"),
                "views": lesson.get("views", 0),
                "completions": lesson.get("completions", 0),
                "rating": lesson.get("rating", 0),
                # Handle thumbnail based on content type
                "thumbnail": get_thumbnail_for_content(lesson),
                # Keep original fields for editing
                "content_url": lesson.get("content_url", ""),
                "video_type": lesson.get("video_type", ""),
                "text_content": lesson.get("text_content", ""),
                "quiz_data": lesson.get("quiz_data", []),
                "total_questions": lesson.get("total_questions", 0),
                "content_type": lesson.get("content_type", ""),
                "created_at": lesson.get("created_at", ""),
            }
            mapped_lessons.append(mapped_lesson)
        
        return {"lessons": mapped_lessons}
    except Exception as e:
        print(f"Error in get_lessons_by_tutor: {str(e)}")  # Debug print
        raise HTTPException(status_code=400, detail=str(e))

def get_thumbnail_for_content(lesson):
    """Generate appropriate thumbnail based on content type"""
    format_type = lesson.get("format", "video")
    
    if format_type == "video":
        if lesson.get("video_type") == "youtube":
            # Extract YouTube video ID and create thumbnail
            url = lesson.get("content_url", "")
            if "youtube.com/watch?v=" in url:
                video_id = url.split("watch?v=")[1].split("&")[0]
                return f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
            elif "youtu.be/" in url:
                video_id = url.split("youtu.be/")[1].split("?")[0]
                return f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
        # For local videos, use a simple video placeholder with light color
        return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE1MCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPuKWtjwvdGV4dD4KPC9zdmc+"
    elif format_type == "quiz":
        # Light orange/peach color for quiz
        return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE1MCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkVEN0Q3Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0M3NEIzQyIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPj88L3RleHQ+Cjwvc3ZnPg=="
    elif format_type == "text":
        # Light blue color for text content
        return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE1MCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTAwIiBmaWxsPSIjREVGN0ZGIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzMwNjVBQiIgZm9udC1zaXplPSIyMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkE8L3RleHQ+Cjwvc3ZnPg=="
    elif format_type == "audio":
        # Light purple color for audio content
        return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE1MCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNFOEZGIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzc5MzNCNyIgZm9udC1zaXplPSIxOCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPuKZqzwvdGV4dD4KPC9zdmc+"
    else:
        # Light gray for unknown content types
        return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE1MCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="