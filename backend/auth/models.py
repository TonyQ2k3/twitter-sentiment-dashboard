from pydantic import BaseModel, Field, root_validator
from typing import Literal, Union, Optional

class UserBase(BaseModel):
    email: str
    username: str
    password: str
    role: Literal["normal", "enterprise", "admin"] = "normal"

class UserLogin(BaseModel):
    email: str
    password: str

class NormalUserCreate(UserBase):
    role: Literal["normal"] = "normal"

class EnterpriseUserCreate(UserBase):
    role: Literal["enterprise"] = "enterprise"
    company_name: str
    business_address: str
    tax_id: str
    tracked_products: list[str] = Field(default_factory=list)

UserCreate = Union[NormalUserCreate, EnterpriseUserCreate]

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    company_name: Optional[str] = None
    business_address: Optional[str] = None
    tax_id: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
