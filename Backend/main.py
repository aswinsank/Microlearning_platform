from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import lessons
from fastapi.staticfiles import StaticFiles
import os
from routes import auth




app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update later for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router, prefix="/api")
app.include_router(lessons.router, prefix="/api")
os.makedirs("uploaded_videos", exist_ok=True)
os.makedirs("uploaded_quiz", exist_ok=True)

app.mount("/uploaded_videos", StaticFiles(directory="uploaded_videos"), name="videos")
app.mount("/uploaded_quiz", StaticFiles(directory="uploaded_quiz"), name="quiz")
