from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import create_user,get_user_by_username,delet_user,update_user,get_user_by_id
from app.models import new_user,login_user,UserUpdate
from app.auth import verify_password,create_token,get_current_user
import random
from app.schemas import user
from sqlalchemy.exc import IntegrityError

routes = APIRouter(
    prefix = "/user",
    tags= ["User"]
)


def generate_username_suggestions(username: str, db: Session):
    suggestions = []

    # username ke end me number add karenge
    while len(suggestions) < 4:

        number = random.randint(10, 9999)
        suggestion = f"{username}{number}"

        # Check karo suggestion already exist to nahi
        exists = db.query(user).filter(
            user.username == suggestion
        ).first()

        if not exists and suggestion not in suggestions:
            suggestions.append(suggestion)

    return suggestions


@routes.post("/signup")
def signup(
    new_user_data: new_user,
    db: Session = Depends(get_db)
):

    # Check username already exists
    existing_user = db.query(user).filter(
        user.username == new_user_data.username
    ).first()

    if existing_user:

        suggestions = generate_username_suggestions(
            new_user_data.username,
            db
        )

        raise HTTPException(
            status_code=409,
            detail={
                "message": "Username already taken",
                "suggestions": suggestions
            }
        )

    # Create user
    try:
        return create_user(db, new_user_data)

    except IntegrityError:
        # Safety: UNIQUE constraint violation
        db.rollback()

        suggestions = generate_username_suggestions(
            new_user_data.username,
            db
        )

        raise HTTPException(
            status_code=409,
            detail={
                "message": "Username already taken",
                "suggestions": suggestions
            }
        )

# @routes.post("/signup")
# def signup(user: new_user,db : Session= Depends(get_db)):
#     return create_user(db,user)

@routes.post("/login")
def login(loginUser:login_user,db : Session= Depends(get_db)):
    db_user = get_user_by_username(db, loginUser.username)

    if not db_user:
        raise HTTPException( 
            status_code=401,
            detail="Invalid Username"
            )
    
    if not verify_password(loginUser.password,db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid Password"
        )
        
    
    access_token = create_token(
        {"sub": db_user.username}
    )
    return{
        "access_token":access_token,
        "token_type": "bearer"
    }

# @routes.get("/{user_id}")
# def grt_current_user(user_id:str, db:Session=Depends(get_db)):
#     user = get_user_by_id(db,user_id)

#     if not user:
#         raise HTTPException(
#             status_code= 404,
#             detail="User not found"
#         )
#     return user

@routes.get("/search")
def search_user(
    username: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    found_user = get_user_by_username(db, username)

    if not found_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Apne aap ko search karne se rokna
    if found_user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot message yourself"
        )

    return {
        "id": str(found_user.id),
        "username": found_user.username,
        "name": found_user.name
    }

@routes.get("/search-id")
def search_user_by_id(user_id:str,db:Session =Depends(get_db)):
    db_user = get_user_by_id(db,user_id)
    if not db_user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
    return {
        "id": str(db_user.id),
        "username": db_user.username,
        "name": db_user.name
    }

@routes.get("/me")
def get_me(current_user = Depends(get_current_user)):
    return current_user

@routes.put("/update_user")
def edit_user(user_id:str, edit_user:UserUpdate, db:Session=Depends(get_db)):
    updated_user = update_user(db,user_id,edit_user)

    if not update_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return updated_user

@routes.delete("/delet_user")
def remove_user(user_id:str, db:Session=Depends(get_db)):
    db_user = delet_user(db,user_id)

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return{
        "User deleted sucessfully"
    }