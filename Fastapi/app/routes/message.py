from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from app.crud import create_message, update_message,get_messages,delete_message,mark_messages_seen
from app.models import MessageCreate,MessageUpdate
from app.database import get_db
from app.auth import get_current_user


routes = APIRouter(
    prefix="/message",
    tags=["message"]
)

@routes.post("/{conversation_id}")
def new_message(conversation_id:str,message: MessageCreate,sender_id=  Depends(get_current_user), db: Session = Depends(get_db)):
    new = create_message(
        db=db,
        conversation_id = conversation_id,
        Message = message,
        sender_id= sender_id.id
    )
    return new

@routes.get("/{conversation_id}")
def all_messages(conversation_id:str,db:Session=Depends(get_db)):
    return get_messages(
        db=db,
        conversation_id=conversation_id
    )

@routes.put("/{message_id}")
def edit_message(message_id:str,Message:MessageUpdate, sender_id = Depends(get_current_user),db:Session= Depends(get_db)):
    db_message=update_message(db,message_id,sender_id.id,Message)
    if not db_message:
            raise HTTPException(
                status_code=404,
                detail="Message not found"
            )
    return db_message

@routes.delete("/{message_id}")
def remove_message(message_id:str,sender_id=Depends(get_current_user),db:Session = Depends(get_db)):
    db_message =delete_message(db,message_id,sender_id.id)
    if not db_message:
                raise HTTPException(
                    status_code=404,
                    detail="Message not found or you are not auther"
                )
    return {
        "message":"Message deleted successfully"
    }


@routes.put("/{conversation_id}/seen")
def mark_seen(
    conversation_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    result = mark_messages_seen(
        db,
        conversation_id,
        current_user.id
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found or unauthorized"
        )

    return result