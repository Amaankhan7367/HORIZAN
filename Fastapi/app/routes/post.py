from fastapi import APIRouter,HTTPException,Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.crud import add_post,delete_post,update_post,get_post_by_id,get_all_post
from app.models import AddPost,PostUpdate
from app.database import get_db
from app.auth import get_current_user
import os
import uuid
from pathlib import Path
import shutil


routes = APIRouter(
    prefix="/post",
    tags=["Post"]
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


#upload file 

@routes.post("/uploads")
async def upload_file(file: UploadFile = File(...)):
    try:

        # Check file
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="No file selected"
            )

        # Get extension
        file_extension = Path(file.filename).suffix

        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_extension}"

        # Complete path
        file_path = UPLOAD_DIR / unique_filename

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {
            "message": "File uploaded successfully",
            "filename": unique_filename,
            "url": f"/uploads/{unique_filename}"
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@routes.delete("/uploads/{filename}")
def delete_file(filename:str,):
    try:
        file_path = UPLOAD_DIR / filename

        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="File not found"
            )

        file_path.unlink(missing_ok=True)
        return {
            "message": "File deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


#upload post 

@routes.post("/")
def create_post(post:AddPost, db:Session = Depends(get_db), current_user = Depends(get_current_user)):
    return add_post(db,post,current_user.id)
    

# @routes.post("/")
# async def create_post(
#     title: str = Form(...),
#     content: str = Form(...),
#     image: UploadFile = File(...),
#     db: Session = Depends(get_db),
#     current_user = Depends(get_current_user)
# ):
#      # File extension nikalna
#     #file_extension = image.filename.split(".")[-1]
#     if image.filename is None:
#         raise HTTPException(
#             status_code=400,
#             detail="No file selected"
#         )
#     file_extension = image.filename.rsplit(".", 1)[-1]

#     # Unique filename banana
#     filename = f"{uuid.uuid4()}.{file_extension}"

#     # Uploads folder ka path
#     file_path = os.path.join(UPLOAD_DIR, filename)

#     # Image save karna
#     contents = await image.read()

#     with open(file_path, "wb") as file:
#         file.write(contents)

#     # Database me save hone wala path
#     image_path = file_path

#     # CRUD function call
#     new_post = add_post(
#         db=db,
#         title=title,
#         content=content,
#         image=image_path,
#         user_id=current_user.id
#     )

#     return new_post


@routes.get("/")
def all_posts(db:Session = Depends(get_db)):
    return get_all_post(db)

@routes.get("/{post_id}")
def view_post(post_id:str, db:Session =Depends(get_db)):
    post = get_post_by_id(db,post_id)

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )
    return post

@routes.put("/{post_id}")
def edit_post(post_id:str,editPost:PostUpdate, db:Session  = Depends(get_db)):
    updated_post= update_post(db,post_id,editPost)

    if not updated_post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )
    return updated_post

@routes.delete("/{post_id}")
def remove_post(post_id:str, db:Session = Depends(get_db)):
    post = delete_post(db,post_id)

    if not post :
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )
    return {
    "message": "Post deleted successfully"
}