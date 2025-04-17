from datetime import datetime, timedelta
from typing import Optional, Dict, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
import os
import logging

logger = logging.getLogger(__name__)

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# User models
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    disabled: bool = False

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    disabled: Optional[bool] = None

class User(UserBase):
    pass

# In-memory user database (replace with real database in production)
users_db = {
    "admin": {
        "username": "admin",
        "full_name": "Administrator",
        "email": "admin@example.com",
        "hashed_password": pwd_context.hash("admin123"),  # Change this in production
        "disabled": False,
    }
}

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_user(username: str) -> Optional[User]:
    if username in users_db:
        user_dict = users_db[username]
        return User(
            username=user_dict["username"],
            full_name=user_dict["full_name"],
            email=user_dict["email"],
            disabled=user_dict["disabled"]
        )
    return None

def get_all_users() -> List[User]:
    return [
        User(
            username=username,
            full_name=user_dict["full_name"],
            email=user_dict["email"],
            disabled=user_dict["disabled"]
        )
        for username, user_dict in users_db.items()
    ]

def create_user(user: UserCreate) -> User:
    if user.username in users_db:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict.pop("password")
    user_dict["hashed_password"] = hashed_password
    
    users_db[user.username] = user_dict
    logger.info(f"Created new user: {user.username}")
    
    return User(**user_dict)

def update_user(username: str, user_update: UserUpdate) -> User:
    if username not in users_db:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    stored_user = users_db[username]
    update_data = user_update.dict(exclude_unset=True)
    
    if "password" in update_data:
        hashed_password = get_password_hash(update_data["password"])
        update_data["hashed_password"] = hashed_password
        del update_data["password"]
    
    users_db[username].update(update_data)
    logger.info(f"Updated user: {username}")
    
    return get_user(username)

def delete_user(username: str):
    if username not in users_db:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if username == "admin":
        raise HTTPException(
            status_code=400,
            detail="Cannot delete admin user"
        )
    
    del users_db[username]
    logger.info(f"Deleted user: {username}")

def authenticate_user(username: str, password: str) -> Optional[User]:
    user = get_user(username)
    if not user:
        return None
    if not verify_password(password, users_db[username]["hashed_password"]):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(username=username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Check if user is admin
def is_admin(username: str) -> bool:
    return username == "admin" 