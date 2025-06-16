from fastapi import APIRouter, HTTPException, Depends, Body
from auth.models import UserCreate, UserLogin, UserProfileUpdate, ChangePasswordRequest
from auth.utils import hash_password, verify_password, create_access_token, get_current_user
from database import db_users, redis
from datetime import timedelta

router = APIRouter()

# Register a new user
@router.post("/register")
def register(user: UserCreate = Body(...)):
    if db_users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "email": user.email,
        "username": user.username,
        "hashed_password": hash_password(user.password),
        "role": user.role
    }

    if user.role == "enterprise":
        user_doc.update({
            "company_name": user.company_name,
            "business_address": user.business_address,
            "tax_id": user.tax_id,
            "tracked_products": []
        })

    db_users.insert_one(user_doc)
    return {"msg": f"{user.role.capitalize()} user registered successfully"}

# Login a user and return a JWT token
@router.post("/login")
def login(user: UserLogin):
    db_user = db_users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.email}, expires_delta=timedelta(minutes=60))
    return {"access_token": token, "token_type": "bearer"}

# Logout a user
@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    cache_key = f"user:{current_user['email'].lower()}"
    redis.delete(cache_key)
    return {"message": "User logged out successfully"}


@router.get("/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    result = {
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user.get("role", "normal")
    }
    if result["role"] == "enterprise":
        result.update({
            "company_name": current_user.get("company_name"),
            "business_address": current_user.get("business_address"),
            "tax_id": current_user.get("tax_id"),
            "tracked_products": current_user.get("tracked_products", [])
        })
    return result


# Edit user profile
@router.put("/me")
def update_profile(
    updates: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    update_fields = {k: v for k, v in updates.dict().items() if v is not None}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    db_users.update_one({"email": current_user["email"]}, {"$set": update_fields})
    cache_key = f"user:{current_user['email'].lower()}"
    redis.delete(cache_key)
    return {"msg": "Profile updated successfully"}


# Change password
@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    if not verify_password(payload.old_password, current_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Old password is incorrect")
    
    new_hashed = hash_password(payload.new_password)
    db_users.update_one({"email": current_user["email"]}, {"$set": {"hashed_password": new_hashed}})
    cache_key = f"user:{current_user['email'].lower()}"
    redis.delete(cache_key)
    return {"msg": "Password changed successfully"}
