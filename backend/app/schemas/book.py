from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

# Base Schema: যেসব ফিল্ড একাধিক জায়গায় কমন থাকবে
class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="বইয়ের নাম")
    author: str = Field(..., min_length=1, max_length=255, description="লেখকের নাম")
    isbn: str = Field(..., min_length=10, max_length=13, description="১৩ বা ১০ ডিজিটের অনন্য ISBN নাম্বার")
    available_copies: int = Field(default=1, ge=0, description="বইয়ের স্টকের সংখ্যা (০ বা তার বেশি হতে হবে)")

# Schema for Creating a Book (POST)
class BookCreate(BookBase):
    pass

# Schema for Updating a Book (PATCH - সব ফিল্ড অপশনাল)
class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    author: Optional[str] = Field(None, min_length=1, max_length=255)
    isbn: Optional[str] = Field(None, min_length=10, max_length=13)
    available_copies: Optional[int] = Field(None, ge=0)

# Schema for Response (GET/POST/PATCH থেকে যে ডাটা ক্লায়েন্টকে ফেরত দেয়া হবে)
class BookResponse(BookBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # SQLAlchemy ORM model-কে Pydantic schema-তে রূপান্তর করার জন্য