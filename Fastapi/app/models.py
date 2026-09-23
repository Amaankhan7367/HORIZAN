from pydantic import BaseModel, Field
from uuid import uuid4
from datetime import  datetime


# class user(BaseModel):
#     id: str = Field(default_factory=lambda: str(uuid4()))
#     username : str
#     name:str
#     gmail : str
#     password : str

class user(BaseModel):
    username : str
    name:str
    gmail : str

class new_user(user):
    password : str

class login_user(BaseModel):
    username :str
    password :str

class UserUpdate(BaseModel):
    username: str | None = None
    name: str | None = None
    gmail: str | None = None
    password: str | None = None

class UserResponse(user):
    id: str



#===============POSTS===============#

class post(BaseModel):
    title: str
    content: str


class AddPost(post):
    image: str

class postResponse(post):
    postId: str
    image: str
    userId: str
    created_at: datetime = Field(default_factory=datetime.now)

class PostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    image: str | None = None



#====================MESSAGE================#


class MessageCreate(BaseModel):
    ciphertext: str
    messageType: str = "text"

class MessageResponse(MessageCreate):
    messageId: str
    conversationId: str
    senderId: str
    createdAt: datetime = Field(default_factory=datetime.now)

class MessageUpdate(BaseModel):
    ciphertext: str



#===============ROOM/GROUP CHAT===============#

class RoomCreate(BaseModel):
    name:str
    latitude: float
    longitude: float

class RoomResponse(BaseModel):
    name:str
    latitude: float
    longitude: float
    roomId:str
    creatorId:str
    createdAt:datetime
    expiresAt:datetime

class RoomJoin(BaseModel):
    roomId:str
    latitude: float
    longitude: float

class GroupMembers(BaseModel):
    userId:str
    roomId:str
    joinedAt:datetime = Field(default_factory=datetime.now)

class RoomMessageCreate(BaseModel):
    ciphertext: str
    messageType: str = "text"


class RoomMessageResponse(RoomMessageCreate):
    messageId: str
    roomId: str
    senderId: str
    createdAt: datetime = Field(default_factory=datetime.now)

