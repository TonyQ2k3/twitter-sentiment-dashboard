from fastapi import APIRouter, HTTPException, Depends
from auth.models import UserCreate, UserLogin
from auth.utils import hash_password, verify_password, create_access_token, get_current_user
from database import db_users
from datetime import timedelta

router = APIRouter()

# Register a new user
@router.post("/register")
def register(user: UserCreate):
    if db_users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    db_users.insert_one({
        "username": user.username,
        "hashed_password": hash_password(user.password)
    })
    return {"msg": "User registered successfully"}

# Login a user and return a JWT token
@router.post("/login")
def login(user: UserLogin):
    db_user = db_users.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.username}, expires_delta=timedelta(minutes=60))
    return {"access_token": token, "token_type": "bearer"}

# Logout a user (client must discard the token)
@router.post("/logout")
def logout(current_user: str = Depends(get_current_user)):
    return {"msg": f"User '{current_user}' logged out (client must discard token)."}

@router.get("/me")
def read_users_me(current_user: str = Depends(get_current_user)):
    return {"username": current_user}
