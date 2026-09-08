from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

# Base Schema: সাধারণ ক্ষেত্রসমূহ
class MemberBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="সদস্যের নাম")
    email: EmailStr = Field(..., description="সঠিক ইমেইল এড্রেস")

# Schema for Creating a Member (POST)
class MemberCreate(MemberBase):
    pass

# Schema for Updating a Member (PATCH - অপশনাল ফিল্ড)
class MemberUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = Field(None)

# Schema for Response
class MemberResponse(MemberBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True