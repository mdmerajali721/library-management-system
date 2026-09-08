from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app.models.member import Member
from app.schemas.member import MemberCreate, MemberUpdate, MemberResponse

router = APIRouter(
    prefix="/api/v1/members",
    tags=["Members"]
)

# 1. Create a New Member (POST /api/v1/members)
@router.post("", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(member_in: MemberCreate, db: Session = Depends(get_db)):
    # Duplicate Email Check
    existing_member = db.scalar(select(Member).where(Member.email == member_in.email))
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Member with this email already exists."
        )

    db_member = Member(**member_in.model_dump())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


# 2. Get All Members with Pagination (GET /api/v1/members)
@router.get("", response_model=List[MemberResponse])
def get_all_members(
    skip: int = Query(0, ge=0, description="Skip offset"),
    limit: int = Query(10, ge=1, le=100, description="Limit size"),
    db: Session = Depends(get_db)
):
    members = db.scalars(select(Member).offset(skip).limit(limit)).all()
    return members


# 3. Get Single Member by ID (GET /api/v1/members/{member_id})
@router.get("/{member_id}", response_model=MemberResponse)
def get_member_by_id(member_id: int, db: Session = Depends(get_db)):
    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with ID {member_id} not found."
        )
    return member


# 4. Partial Update Member (PATCH /api/v1/members/{member_id})
@router.patch("/{member_id}", response_model=MemberResponse)
def update_member(member_id: int, member_in: MemberUpdate, db: Session = Depends(get_db)):
    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with ID {member_id} not found."
        )

    update_data = member_in.model_dump(exclude_unset=True)

    # If updating email, check for duplicate email
    if "email" in update_data and update_data["email"] != member.email:
        existing_email = db.scalar(select(Member).where(Member.email == update_data["email"]))
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Another member with this email already exists."
            )

    for field, value in update_data.items():
        setattr(member, field, value)

    db.commit()
    db.refresh(member)
    return member


# 5. Delete Member (DELETE /api/v1/members/{member_id})
@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(member_id: int, db: Session = Depends(get_db)):
    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with ID {member_id} not found."
        )

    db.delete(member)
    db.commit()
    return None

from app.schemas.borrowing import BorrowingDetailResponse

# 6. Get All Borrowings for a Specific Member (GET /api/v1/members/{member_id}/borrowings)
@router.get("/{member_id}/borrowings", response_model=List[BorrowingDetailResponse])
def get_member_borrowings(member_id: int, db: Session = Depends(get_db)):
    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with ID {member_id} not found."
        )
    return member.borrowings