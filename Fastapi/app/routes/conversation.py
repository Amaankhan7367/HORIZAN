from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from app.crud import create_conversation,get_user_conversations,delete_conversation,get_conversation
from app.database import get_db

routes = APIRouter(
    prefix="/conversation",
    tags=["conversation"]
)

@routes.post("/")
def new_conversation(user1_id:str,user2_id:str,db: Session = Depends(get_db)):
    if user1_id == user2_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot create conversation with yourself"
        )

    return create_conversation(db, user1_id, user2_id )

@routes.get("/user/{user_id}")
def get_user_convs(user_id: str, db: Session = Depends(get_db)):
    return get_user_conversations(db, user_id)

@routes.get("/{conversation_id}")
def get_one( conversation_id : str,db: Session = Depends(get_db)):
    conversation = get_conversation(db,conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )
    return conversation

@routes.delete("/{conversation_id}")
def delete_conv(conversation_id:str,user_id:str, db : Session = Depends(get_db)):
    conversation = delete_conversation(db,conversation_id,user_id)

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )
    return {
        "message": "Conversation deleted successfully"
    }