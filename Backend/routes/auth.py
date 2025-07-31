from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from db import users_collection
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os

router = APIRouter()
security = HTTPBearer()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ----- Models -----
class UserRegister(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email_or_username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    name: str
    username: str
    email: str

# ----- JWT Utility Functions -----
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user data"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"username": token_data.username})
    if user is None:
        raise credentials_exception
    
    return User(
        name=user["name"],
        username=user["username"],
        email=user["email"]
    )

def get_current_user(current_user: User = Depends(verify_token)):
    """Dependency to get current authenticated user"""
    return current_user

# ----- Register ----- 
@router.post("/auth/register")
async def register_user(user: UserRegister):
    # Check if email already exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Hash password
    hashed_pw = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())
    
    # Create new user
    new_user = {
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "password": hashed_pw.decode("utf-8"),
        "created_at": datetime.utcnow()
    }
    
    users_collection.insert_one(new_user)
    return {"message": "User registered successfully"}

# ----- Login -----
@router.post("/auth/login", response_model=Token)
async def login_user(credentials: UserLogin):
    # Find user by email or username
    user = users_collection.find_one({
        "$or": [
            {"email": credentials.email_or_username},
            {"username": credentials.email_or_username}
        ]
    })
    
    # Verify user exists and password is correct
    if not user or not bcrypt.checkpw(credentials.password.encode("utf-8"), user["password"].encode("utf-8")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# ----- Protected Routes Examples -----
@router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information (requires authentication)"""
    return current_user

@router.get("/auth/protected")
async def protected_route(current_user: User = Depends(get_current_user)):
    """Example protected route that requires authentication"""
    return {
        "message": f"Hello {current_user.name}, this is a protected route!",
        "user": current_user.username
    }

# ----- Logout (Optional - for token blacklisting) -----
@router.post("/auth/logout")
async def logout_user(current_user: User = Depends(get_current_user)):
    """Logout user (in a real app, you might want to blacklist the token)"""
    return {"message": "Successfully logged out"}

# ----- Refresh Token (Optional) -----
@router.post("/auth/refresh", response_model=Token)
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }