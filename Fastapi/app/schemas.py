from sqlalchemy.orm import declarative_base ,Mapped, mapped_column,relationship
from sqlalchemy import Column,String,Text, ForeignKey,DateTime,Float,Boolean
from uuid import uuid4
from datetime import datetime,timedelta


base = declarative_base()

#===============USER===============#

class user(base):

    __tablename__ = "users" 

    id:Mapped[str] = mapped_column(String, primary_key=True,nullable=False,default=lambda: str(uuid4()))
    username:Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name:Mapped[str] = mapped_column(String,nullable=False )
    gmail:Mapped[str]  = mapped_column(String, unique=True, nullable=False)
    password:Mapped[str] = mapped_column(String, nullable=False)

#===============POSTS===============#

class post(base):

    __tablename__ = "post"

    postId = Column(String, nullable=False, unique=True, primary_key=True, default=lambda: str(uuid4()))
    title = Column(String, nullable=False)
    content = Column(String)
    image = Column(String, nullable=False)
    userID = Column(String,ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow,nullable=False)



#================MESSAGE===============#

class message(base):

    __tablename__= "message"

    messageId = Column(String,nullable=False,primary_key=True,default=lambda:str(uuid4()))
    conversationId= Column(String,ForeignKey("conversations.id"),nullable=False)
    senderId =Column(String,ForeignKey("users.id"),nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow,nullable=False)
    ciphertext =Column(Text,nullable=False)
    messageType =Column(String,default="text",nullable=False)
    edited_at = Column(DateTime, nullable=True)
    status = Column(String,nullable=False,default="sent")


#===============conversation===============#
class conversations(base):

    __tablename__ ="conversations"

    id = Column(String,primary_key=True,default=lambda: str(uuid4()))
    user1_id = Column(String, ForeignKey("users.id"), nullable=False)
    user2_id = Column(String, ForeignKey("users.id"), nullable=False)

    user1_last_read_at = Column(DateTime, nullable=True)
    user2_last_read_at = Column(DateTime, nullable=True)


#===============ROOM===============#

class room(base):

    __tablename__ = "rooms"

    roomId = Column(String(6),primary_key=True,index=True,)
    name = Column(String,nullable=False,)
    creatorId = Column(String,ForeignKey("users.id"),nullable=False)
    latitude = Column(Float,nullable=False)
    longitude = Column(Float,nullable=False)
    radius = Column(Float,default=500)
    createdAt = Column(DateTime,default=datetime.utcnow,nullable=False)
    expiresAt = Column(DateTime,nullable=False)
    members = relationship("RoomMember",back_populates="room",cascade="all, delete-orphan")
    messages = relationship("RoomMessage",back_populates="room",cascade="all, delete-orphan")

class RoomMember(base):

    __tablename__ = "room_members"

    id =Column(String,primary_key=True,index=True,default=lambda: str(uuid4()))
    roomId = Column(String,ForeignKey(room.roomId),nullable=False)
    userId =Column(String, ForeignKey(user.id),nullable=False)
    joinedAt =Column(DateTime, default= datetime.utcnow,nullable=False)
    room = relationship("room",back_populates="members")

class RoomMessage(base):

    __tablename__ = "room_messages"

    messageId = Column(String,primary_key=True,index=True)
    roomId = Column(String, ForeignKey(room.roomId), nullable=False)
    senderId =Column(String,ForeignKey(user.id),nullable=False)
    ciphertext = Column(String,nullable=False)
    messageType = Column(String,default="text")
    createdAt = Column(DateTime,default=datetime.now)
    room = relationship("room",back_populates="messages")

#===============RECENTS===============#

class recents(base):
    __tablename__="recents"

    recentId = Column(String, nullable=False, unique=True, primary_key=True, default=lambda: str(uuid4()))
    text = Column(String,nullable=True)
    image = Column(String, nullable=True)
    userID = Column(String,ForeignKey("users.id"))
    latitude = Column(Float,nullable=False)
    longitude = Column(Float,nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow,nullable=False)
    expiresAt = Column(DateTime,nullable=False)

class Nearby(base):
    __tablename__ = "nearby"

    userId = Column(
        String,
        ForeignKey("users.id"),
        primary_key=True
    )

    latitude = Column(
        Float,
        nullable=False
    )

    longitude = Column(
        Float,
        nullable=False
    )

    location_enabled = Column(
        Boolean,
        default=False,
        nullable=False
    )