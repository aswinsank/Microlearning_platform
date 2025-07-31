from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from routes import lessons, quiz, text_lessons, auth, lesson_management  # Add lesson_management

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(lessons.router, prefix="/api")  # Your existing video upload routes
app.include_router(lesson_management.router, prefix="/api")  # Add this new line
app.include_router(quiz.router, prefix="/api")     
app.include_router(text_lessons.router, prefix="/api")  

os.makedirs("uploaded_videos", exist_ok=True)
os.makedirs("uploaded_quiz", exist_ok=True)
os.makedirs("uploaded_texts", exist_ok=True)  

app.mount("/uploaded_videos", StaticFiles(directory="uploaded_videos"), name="videos")
app.mount("/uploaded_quiz", StaticFiles(directory="uploaded_quiz"), name="quiz")
app.mount("/uploaded_texts", StaticFiles(directory="uploaded_texts"), name="texts") 

@app.get("/")
async def root():
    return {"message": "Microlearning Platform API"}
