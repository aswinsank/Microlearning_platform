# db.py
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()  # Load from .env

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["microlearning"]
users_collection = db["users"]



lessons_collection = db["lessons"]  # Ready for use
