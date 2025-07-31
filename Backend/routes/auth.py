from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from db import users_collection
import bcrypt

router = APIRouter()

# ----- Models -----
class UserRegister(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email_or_username: str
    password: str

# ----- Register -----
@router.post("/auth/register")
async def register_user(user: UserRegister):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_pw = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())

    new_user = {
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "password": hashed_pw.decode("utf-8"),
    }

    users_collection.insert_one(new_user)
    return {"message": "User registered successfully"}

# ----- Login -----
@router.post("/auth/login")
async def login_user(credentials: UserLogin):
    user = users_collection.find_one({
        "$or": [
            {"email": credentials.email_or_username},
            {"username": credentials.email_or_username}
        ]
    })

    if not user or not bcrypt.checkpw(credentials.password.encode("utf-8"), user["password"].encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    return {
        "message": "Login successful",
        "user": {
            "name": user["name"],
            "username": user["username"],
            "email": user["email"],
        }
    }
