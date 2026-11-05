from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.models import TextRecent, PhotoRecent
from app.crud import addRecent, deleteRecent, allRecents

router = APIRouter(
    prefix="/recent",
    tags=["Recents"]
)

# =====================================================
# TEXT LIVE POST
# =====================================================
@router.post("/text")
def create_text_recent(
    new_recent: TextRecent,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not new_recent.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text is required"
        )

    recent = addRecent(
        db=db,
        new_recent=new_recent,
        user_id=current_user.id,
        latitude=new_recent.latitude,
        longitude=new_recent.longitude,
    )

    return {
        "message": "Live text posted successfully",
        "recent": recent
    }


# =====================================================
# PHOTO LIVE POST (IMAGE ONLY / IMAGE + TEXT)
# =====================================================
@router.post("/photo")
def create_photo_recent(
    new_recent: PhotoRecent,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # At least one field required
    if not new_recent.text and not new_recent.image:
        raise HTTPException(
            status_code=400,
            detail="Text or Image required"
        )

    recent = addRecent(
        db=db,
        new_recent=new_recent,
        user_id=current_user.id,
        latitude=new_recent.latitude,
        longitude=new_recent.longitude
    )

    return {
        "message": "Live photo posted successfully",
        "recent": recent
    }


# =====================================================
# GET ALL ACTIVE LIVE POSTS
# =====================================================
@router.get("/all")
def get_all_live_posts(
    db: Session = Depends(get_db)
):
    recents = allRecents(db)

    return {
        "count": len(recents),
        "recents": recents
    }


# =====================================================
# DELETE LIVE POST
# =====================================================
@router.delete("/{recent_id}")
def remove_live_post(
    recent_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    recent = deleteRecent(db, recent_id)

    if not recent:
        raise HTTPException(
            status_code=404,
            detail="Live post not found"
        )

    return {
        "message": "Live post deleted successfully"
    }