from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.book import BookResponse
from app.schemas.member import MemberResponse

# Schema for Borrowing Request (POST)
class BorrowingCreate(BaseModel):
    member_id: int
    book_id: int

# Schema for Borrowing Response
class BorrowingResponse(BaseModel):
    id: int
    member_id: int
    book_id: int
    borrowed_at: datetime
    returned_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Extended Response with Book and Member Information (Frontend-এর সুবিধার্থে)
class BorrowingDetailResponse(BorrowingResponse):
    book: BookResponse
    member: MemberResponse

    class Config:
        from_attributes = True