from app.database import session
from app.schemas import user,post,message,conversations,room,RoomMember
from app.auth import hashing_password
from datetime import datetime,timedelta
import random
import string
import math
db = session 

#------ users ------#

def create_user(db, new_user):
    db_user =user(
        username =new_user.username,
        name = new_user.name ,
        gmail = new_user.gmail ,
        password = hashing_password(new_user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db ,user_id:str,updated_user):
    db_user = db.query(user).filter(user.id ==user_id).first()

    if not db_user :
        return None
    
    db_user.username = updated_user.username
    db_user.gmail = updated_user.gmail
    db_user.name = updated_user.name
    db_user.password = hashing_password(updated_user.password)

    db.commit()
    db.refresh(db_user)

def delet_user(db , user_id:str):
    db_user = db.query(user).filter(user.id == user_id).first()

    if not user:
        return None
    
    db.delete(db_user)
    db.commit()
    return True

def get_user_by_username (db,username):
    return db.query(user).filter(user.username == username).first()

def get_user_by_id(db,user_id:str):
    return db.query(user).filter(user.id == user_id).first()

def get_user_by_gmail (db ,gmail):
    return db.query(user).filter(user.gmail == gmail).first()

def get_all_users (db):
    return db.query(user).all()


def login_user(db,login_data):
    return get_user_by_username(db,login_data.username)

#------ Posts ------#

def add_post(db,new_post,user_id):
    db_post =post(
    title = new_post.title,
    content = new_post.content,
    image = new_post.image,
    userID = user_id
    )

    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post



def update_post(db,post_id, updated_post):
    db_post = db.query(post).filter(post.postId ==post_id).first()
    if not post:
        return None

    db_post.title = updated_post.title
    db_post.content=updated_post.content
    db_post.image = updated_post.image

    db.commit()
    db.refresh(db_post)
    return db_post

def delete_post(db , post_ID:str):
    db_post = db.query(post).filter(post.postId == post_ID).first()

    if not db_post:
        return None
    
    db.delete(db_post)
    db.commit()
    return post

def get_post_by_id(db,post_ID):
    return db.query(post).filter(post.postId == post_ID).first()

def get_post_by_title(db,title):
    return db.query(post).filter(post.title == title).first()

def get_all_post(db):
    return db.query(post).all()


#================MESSAGE===============#

def create_message(db,conversation_id,Message,sender_id):
    new_message =message(
        conversationId= conversation_id,
        senderId=sender_id,
        ciphertext=Message.ciphertext,
        messageType = Message.messageType
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message


def get_messages(db,conversation_id):
    return db.query(message).filter(message.conversationId == conversation_id).order_by(message.createdAt.asc()).all()

def delete_message(db,message_id,sender_id):
    Message =(db.query(message).filter(message.messageId==message_id,message.senderId==sender_id)).first()

    if not message:
        return None

    db.delete(Message)
    db.commit()
    return Message


def update_message(db,message_id,sender_id,Message):
    db_message =(
        db.query(message).filter(message.messageId==message_id,message.senderId==sender_id).first()
    )
    db_message.ciphertext =Message.ciphertext
    Message.edited_at = datetime.utcnow()
    db.commit()
    db.refresh(db_message)
    return db_message








#===============conservation===============#



def create_conversation(db, user1_id: str, user2_id: str):

    # Check existing conversation
    existing = (
        db.query(conversations)
        .filter(
            (
                (conversations.user1_id == user1_id) &
                (conversations.user2_id == user2_id)
            )
            |
            (
                (conversations.user1_id == user2_id) &
                (conversations.user2_id == user1_id)
            )
        )
        .first()
    )

    if existing:
        return existing

    new_conversation = conversations(
        user1_id=user1_id,
        user2_id=user2_id
    )

    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)

    return new_conversation


def get_conversation(db, conversation_id: str):

    return (
        db.query(conversations)
        .filter(
            conversations.id == conversation_id
        )
        .first()
    )


def get_user_conversations(db, user_id: str):

    return (
        db.query(conversations)
        .filter(
            (conversations.user1_id == user_id) |
            (conversations.user2_id == user_id)
        )
        .all()
    )


def delete_conversation(db, conversation_id: str, user_id: str ):
    conversation = (db.query(conversations).filter(conversations.id == conversation_id,(
                (conversations.user1_id == user_id) |
                (conversations.user2_id == user_id)
            )
        ).first()
    )

    if not conversation:
        return None

    db.delete(conversation)
    db.commit()

    return conversation


#===============ROOM===============#



# Generate unique 6-character Room ID
def generate_room_id(db):
    characters = string.ascii_uppercase + string.digits

    while True:
        room_id = ''.join(random.choices(characters, k=6))

        existing_room = (
            db.query(room)
            .filter(room.roomId == room_id)
            .first()
        )

        if not existing_room:
            return room_id


# Create Room
def create_room(db, creator_id: str, room_data):

    room_id = generate_room_id(db)

    now = datetime.utcnow()
    expires_at = now + timedelta(hours=24)

    new_room = room(
        roomId=room_id,
        name=room_data.name,
        creatorId=creator_id,
        latitude=room_data.latitude,
        longitude=room_data.longitude,
        radius=500,
        createdAt=now,
        expiresAt=expires_at
    )

    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    # Creator automatically becomes a member
    new_member = RoomMember(
        roomId=room_id,
        userId=creator_id,
        joinedAt=now
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_room


# Get Room by Room ID
def get_room(db, room_id: str):

    return (
        db.query(room)
        .filter(room.roomId == room_id)
        .first()
    )


# Get all active rooms
def get_all_rooms(db):

    now = datetime.utcnow()

    return (
        db.query(room)
        .filter(room.expiresAt > now)
        .order_by(room.createdAt.desc())
        .all()
    )


# Check whether room is expired
def is_room_expired(db, room_id: str):

    db_room = get_room(db, room_id)

    if not db_room:
        return None

    return datetime.utcnow() >= db_room.expiresAt

# Join Room with 500 meter location validation
def join_room(
    db,
    room_id: str,
    user_id: str,
    user_latitude: float,
    user_longitude: float
):

    db_room = get_room(db, room_id)

    if not db_room:
        return None

    # Room expired
    if datetime.utcnow() >= db_room.expiresAt:
        return "expired"

    # Check already joined
    existing_member = (
        db.query(RoomMember)
        .filter(
            RoomMember.roomId == room_id,
            RoomMember.userId == user_id
        )
        .first()
    )

    if existing_member:
        return existing_member

    # ================= LOCATION CHECK ================= #

    room_latitude = db_room.latitude
    room_longitude = db_room.longitude

    # Convert degrees to radians
    lat1 = math.radians(room_latitude)
    lon1 = math.radians(room_longitude)

    lat2 = math.radians(user_latitude)
    lon2 = math.radians(user_longitude)

    # Difference
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    # Haversine formula
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    # Earth radius in meters
    earth_radius = 6371000

    distance = earth_radius * c

    # Check room radius
    if distance > db_room.radius:
        return {
            "error": "outside_radius",
            "distance": round(distance, 2),
            "radius": db_room.radius
        }

    # ================= ADD MEMBER ================= #

    new_member = RoomMember(
        roomId=room_id,
        userId=user_id,
        joinedAt=datetime.utcnow()
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member

# Get Room Members
def get_room_members(db, room_id: str):

    return (
        db.query(RoomMember)
        .filter(RoomMember.roomId == room_id)
        .all()
    )


# Check whether user is a member
def is_room_member(db, room_id: str, user_id: str):

    return (
        db.query(RoomMember)
        .filter(
            RoomMember.roomId == room_id,
            RoomMember.userId == user_id
        )
        .first()
    )


# Delete Room
def delete_room(db, room_id: str):

    db_room = get_room(db, room_id)

    if not db_room:
        return None

    db.delete(db_room)
    db.commit()

    return db_room


# Delete expired rooms
def delete_expired_rooms(db):

    now = datetime.utcnow()

    expired_rooms = (
        db.query(room)
        .filter(room.expiresAt <= now)
        .all()
    )

    for db_room in expired_rooms:
        db.delete(db_room)

    db.commit()

    return len(expired_rooms)