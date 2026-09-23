from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user

from app.crud import (
    create_room,
    get_room,
    get_all_rooms,
    join_room,
    get_room_members,
    is_room_member,
    delete_room,
    is_room_expired
)

from app.models import RoomCreate, RoomJoin


routes = APIRouter(
    prefix="/room",
    tags=["Room"]
)


# ================= CREATE ROOM ================= #

@routes.post("/create")
def create_new_room(
    room_data: RoomCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_room = create_room(
        db,
        current_user.id,
        room_data
    )

    return {
        "message": "Room created successfully",
        "roomId": new_room.roomId,
        "name": new_room.name,
        "creatorId": new_room.creatorId,
        "latitude": new_room.latitude,
        "longitude": new_room.longitude,
        "radius": new_room.radius,
        "createdAt": new_room.createdAt,
        "expiresAt": new_room.expiresAt
    }


# ================= GET ALL ROOMS ================= #

@routes.get("/")
def get_rooms(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_all_rooms(db)


# ================= GET ROOM ================= #

@routes.get("/{room_id}")
def get_room_details(
    room_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_room = get_room(db, room_id)

    if not db_room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    if is_room_expired(db, room_id):
        raise HTTPException(
            status_code=410,
            detail="Room has expired"
        )

    return db_room


# ================= JOIN ROOM ================= #

@routes.post("/{room_id}/join")
def join_existing_room(
    room_id: str,
    room_data: RoomJoin,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # Check Room ID
    if room_data.roomId != room_id:
        raise HTTPException(
            status_code=400,
            detail="Room ID mismatch"
        )

    # Check room exists
    db_room = get_room(db, room_id)

    if not db_room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    # Check expiry
    if is_room_expired(db, room_id):
        raise HTTPException(
            status_code=410,
            detail="Room has expired"
        )

    # Check already member
    existing_member = is_room_member(
        db,
        room_id,
        current_user.id
    )

    if existing_member:
        return {
            "message": "Already a member",
            "roomId": room_id,
            "userId": current_user.id
        }

    # ================= LOCATION CHECK ================= #

    member = join_room(
        db,
        room_id,
        current_user.id,
        room_data.latitude,
        room_data.longitude
    )

    # Room expired
    if member == "expired":
        raise HTTPException(
            status_code=410,
            detail="Room has expired"
        )

    # Outside 500 meter radius
    if isinstance(member, dict) and member.get("error") == "outside_radius":
        raise HTTPException(
            status_code=403,
            detail={
                "message": "You are outside the 500 meter room radius",
                "distance": member["distance"],
                "allowed_radius": member["radius"]
            }
        )

    return {
        "message": "Joined room successfully",
        "roomId": room_id,
        "userId": current_user.id
    }


# ================= ROOM MEMBERS ================= #

@routes.get("/{room_id}/members")
def get_members(
    room_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_room = get_room(db, room_id)

    if not db_room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    if is_room_expired(db, room_id):
        raise HTTPException(
            status_code=410,
            detail="Room has expired"
        )

    members = get_room_members(db, room_id)

    return members


# ================= DELETE ROOM ================= #

@routes.delete("/{room_id}")
def remove_room(
    room_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_room = get_room(db, room_id)

    if not db_room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    # Only creator can delete
    if str(db_room.creatorId) != str(current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Only room creator can delete the room"
        )

    delete_room(db, room_id)

    return {
        "message": "Room deleted successfully"
    }