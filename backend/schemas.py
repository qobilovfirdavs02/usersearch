from pydantic import BaseModel
from typing import Optional
from datetime import date

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    middle_name: str
    birth_date: date
    nationality: str
    citizenship: str
    address: str
    passport_id: str
    photo: Optional[str] = None

class UserResponse(UserCreate):
    id: int

    class Config:
        from_attributes = True
