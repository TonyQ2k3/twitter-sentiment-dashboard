from fastapi import APIRouter, HTTPException, Depends, Body
from auth.models import UserCreate, UserLogin
from auth.utils import hash_password, verify_password, create_access_token, get_current_user
from database import db_users
from datetime import timedelta

router = APIRouter()

# Register a new user
@router.post("/register")
def register(user: UserCreate = Body(...)):
    if db_users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")

    user_doc = {
        "username": user.username,
        "hashed_password": hash_password(user.password),
        "role": user.role
    }

    if user.role == "enterprise":
        user_doc.update({
            "company_name": user.companyName,
            "business_address": user.businessAddress,
            "tax_id": user.taxId
        })

    db_users.insert_one(user_doc)
    return {"msg": f"{user.role.capitalize()} user registered successfully"}

# Login a user and return a JWT token
@router.post("/login")
def login(user: UserLogin):
    db_user = db_users.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.username}, expires_delta=timedelta(minutes=60))
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    result = {
        "username": current_user["username"],
        "role": current_user.get("role", "normal")
    }
    if result["role"] == "enterprise":
        result.update({
            "company_name": current_user.get("company_name"),
            "business_address": current_user.get("business_address"),
            "tax_id": current_user.get("tax_id")
        })
    return result
