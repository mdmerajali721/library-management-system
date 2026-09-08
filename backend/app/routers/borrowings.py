from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app.models.book import Book
from app.models.member import Member
from app.models.borrowing import Borrowing
from app.schemas.borrowing import BorrowingCreate, BorrowingResponse, BorrowingDetailResponse

router = APIRouter(
    prefix="/api/v1/borrowings",
    tags=["Borrowings"]
)

# 1. Borrow a Book (POST /api/v1/borrowings)
@router.post("", response_model=BorrowingResponse, status_code=status.HTTP_201_CREATED)
def borrow_book(borrow_in: BorrowingCreate, db: Session = Depends(get_db)):
    # 1. Check if Member exists
    member = db.get(Member, borrow_in.member_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with ID {borrow_in.member_id} not found."
        )

    # 2. Check if Book exists
    book = db.get(Book, borrow_in.book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID {borrow_in.book_id} not found."
        )

    # 3. Check if Book is available
    if book.available_copies <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book is out of stock and currently unavailable for borrowing."
        )

    # 4. Create Borrowing Record
    db_borrowing = Borrowing(
        member_id=borrow_in.member_id,
        book_id=borrow_in.book_id
    )
    db.add(db_borrowing)

    # 5. Decrement Available Copies
    book.available_copies -= 1

    # 6. Safe Database Transaction
    db.commit()
    db.refresh(db_borrowing)
    return db_borrowing


# 2. Return a Book (PATCH /api/v1/borrowings/{borrowing_id}/return)
@router.patch("/{borrowing_id}/return", response_model=BorrowingResponse)
def return_book(borrowing_id: int, db: Session = Depends(get_db)):
    # 1. Check if Borrowing record exists
    borrowing = db.get(Borrowing, borrowing_id)
    if not borrowing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Borrowing record with ID {borrowing_id} not found."
        )

    # 2. Check if already returned
    if borrowing.returned_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This book has already been returned."
        )

    # 3. Update returned_at time
    borrowing.returned_at = datetime.now(timezone.utc)

    # 4. Increment Available Copies of the Book
    book = db.get(Book, borrowing.book_id)
    if book:
        book.available_copies += 1

    db.commit()
    db.refresh(borrowing)
    return borrowing


# 3. Get All Borrowings (GET /api/v1/borrowings)
@router.get("", response_model=List[BorrowingDetailResponse])
def get_all_borrowings(db: Session = Depends(get_db)):
    borrowings = db.scalars(select(Borrowing).order_by(Borrowing.borrowed_at.desc())).all()
    return borrowings