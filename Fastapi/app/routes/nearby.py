from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Nearby
from app.crud import (
    create_nearby,
    get_nearby,
    get_enabled_nearby_users,
    update_nearby,
    update_nearby_status,
    delete_nearby
)

router = APIRouter(
    prefix="/nearby",
    tags=["Nearby"]
)


# CREATE
@router.post("/")
def create_nearby_location(
    data: Nearby,
    userId: str,
    db: Session = Depends(get_db)
):
    existing = get_nearby(db, userId)

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Nearby location already exists"
        )

    return create_nearby(
        db=db,
        userId=userId,
        latitude=data.latitude,
        longitude=data.longitude,
        location_enabled=data.location_enabled
    )


# GET CURRENT USER'S NEARBY DATA
@router.get("/me")
def get_my_nearby(
    userId: str,
    db: Session = Depends(get_db)
):
    nearby = get_nearby(db, userId)

    if not nearby:
        raise HTTPException(
            status_code=404,
            detail="Nearby location not found"
        )

    return nearby


# GET ENABLED USERS
@router.get("/users")
def get_nearby_users(
    userId: str,
    db: Session = Depends(get_db)
):
    return get_enabled_nearby_users(
        db=db,
        userId=userId
    )


# UPDATE LOCATION + TOGGLE
@router.put("/")
def update_nearby_location(
    data: Nearby,
    userId: str,
    db: Session = Depends(get_db)
):
    nearby = update_nearby(
        db=db,
        userId=userId,
        latitude=data.latitude,
        longitude=data.longitude,
        location_enabled=data.location_enabled
    )

    if not nearby:
        raise HTTPException(
            status_code=404,
            detail="Nearby location not found"
        )

    return nearby


# UPDATE TOGGLE ONLY
@router.patch("/status")
def update_nearby_toggle(
    location_enabled: bool,
    userId: str,
    db: Session = Depends(get_db)
):
    nearby = update_nearby_status(
        db=db,
        userId=userId,
        location_enabled=location_enabled
    )

    if not nearby:
        raise HTTPException(
            status_code=404,
            detail="Nearby location not found"
        )

    return nearby


# DELETE
@router.delete("/")
def delete_nearby_location(
    userId: str,
    db: Session = Depends(get_db)
):
    nearby = delete_nearby(
        db=db,
        userId=userId
    )

    if not nearby:
        raise HTTPException(
            status_code=404,
            detail="Nearby location not found"
        )

    return {
        "message": "Nearby location deleted successfully"
    }