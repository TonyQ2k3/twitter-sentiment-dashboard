from pydantic import BaseModel, Field, root_validator
from typing import Literal, Union, Optional

class UserBase(BaseModel):
    username: str
    password: str
    role: Literal["normal", "enterprise"] = "normal"

class UserLogin(BaseModel):
    username: str
    password: str

class NormalUserCreate(UserBase):
    role: Literal["normal"] = "normal"

class EnterpriseUserCreate(UserBase):
    role: Literal["enterprise"] = "enterprise"
    company_name: str
    business_address: str
    tax_id: str

UserCreate = Union[NormalUserCreate, EnterpriseUserCreate]