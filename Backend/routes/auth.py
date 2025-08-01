import os
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import bcrypt
import jwt
from dotenv import load_dotenv

from db import users_collection  # Ensure this is your PyMongo collection

# ---------- Load settings ----------
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

router = APIRouter()

# ---------- JWT Utilities ----------
def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(request: Request):
    auth: str = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization required")
    token = auth.split(" ")[1]
    payload = decode_access_token(token)
    return payload["sub"]

# ---------- Models ----------
class UserRegister(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email_or_username: str
    password: str

# ---------- Register ----------
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

# ---------- Login ----------
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

    token_data = {"sub": user["username"]}
    access_token = create_access_token(data=token_data)

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "name": user["name"],
            "username": user["username"],
            "email": user["email"],
        }
    }

# ---------- Protected Tutors Page ----------
@router.get("/tutors")
async def tutors_page(current_user: str = Depends(get_current_user)):
    # List of tutor usernames
    tutor_usernames = ["tutor123", "tutor234"]
    tutors = [
        {"tutor123": "tutor123"},
        {"tutor234": "tutor234"},
    ]
    if current_user in tutor_usernames:
        return {"tutors": tutors}
    else:
        return {"message": "Incorrect: You are not a tutor."}
