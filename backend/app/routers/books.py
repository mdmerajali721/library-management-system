from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app.models.book import Book
from app.schemas.book import BookCreate, BookUpdate, BookResponse

router = APIRouter(
    prefix="/api/v1/books",
    tags=["Books"]
)

# 1. Create a New Book (POST /api/v1/books)
@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(book_in: BookCreate, db: Session = Depends(get_db)):
    # Duplicate ISBN Check
    existing_book = db.scalar(select(Book).where(Book.isbn == book_in.isbn))
    if existing_book:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Book with this ISBN already exists."
        )

    db_book = Book(**book_in.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


# 2. Get All Books with Search, Filter & Pagination (GET /api/v1/books)
@router.get("", response_model=List[BookResponse])
def get_all_books(
    title: Optional[str] = Query(None, description="Search by book title"),
    author: Optional[str] = Query(None, description="Filter by author name"),
    skip: int = Query(0, ge=0, description="Skip offset for pagination"),
    limit: int = Query(10, ge=1, le=100, description="Limit amount for pagination"),
    db: Session = Depends(get_db)
):
    query = select(Book)

    # Search by Title (Case-insensitive)
    if title:
        query = query.where(Book.title.ilike(f"%{title}%"))

    # Filter by Author (Case-insensitive)
    if author:
        query = query.where(Book.author.ilike(f"%{author}%"))

    # Pagination & Execution
    books = db.scalars(query.offset(skip).limit(limit)).all()
    return books


# 3. Get Single Book by ID (GET /api/v1/books/{book_id})
@router.get("/{book_id}", response_model=BookResponse)
def get_book_by_id(book_id: int, db: Session = Depends(get_db)):
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID {book_id} not found."
        )
    return book


# 4. Partial Update Book (PATCH /api/v1/books/{book_id})
@router.patch("/{book_id}", response_model=BookResponse)
def update_book(book_id: int, book_in: BookUpdate, db: Session = Depends(get_db)):
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID {book_id} not found."
        )

    update_data = book_in.model_dump(exclude_unset=True)

    # If updating ISBN, check if it duplicates another book's ISBN
    if "isbn" in update_data and update_data["isbn"] != book.isbn:
        existing_isbn = db.scalar(select(Book).where(Book.isbn == update_data["isbn"]))
        if existing_isbn:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Another book with this ISBN already exists."
            )

    for field, value in update_data.items():
        setattr(book, field, value)

    db.commit()
    db.refresh(book)
    return book


# 5. Delete Book (DELETE /api/v1/books/{book_id})
@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID {book_id} not found."
        )

    db.delete(book)
    db.commit()
    return None