from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.websocket.manager import ConnectionManager
from app.database import session
from app.crud import create_message
from app.models import MessageCreate


router = APIRouter()

manager = ConnectionManager()


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str
):
    await manager.connect(user_id, websocket)

    print(f"User {user_id} connected")

    db: Session = session()

    try:

        while True:

            data = await websocket.receive_json()

            message_type = data.get("type")

            # =====================================================
            # ROOM JOIN
            # =====================================================

            if message_type == "join_room":

                room_id = data.get("roomId")

                if not room_id:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Room ID is required"
                    })
                    continue

                manager.join_room(
                    room_id,
                    user_id
                )

                print(
                    f"User {user_id} joined room {room_id}"
                )

                await manager.send_to_room(
                    room_id,
                    {
                        "type": "member_joined",
                        "userId": user_id
                    },
                    exclude_user_id=user_id
                )

                continue

            # =====================================================
            # ROOM MESSAGE
            # =====================================================

            if message_type == "room_message":

                room_id = data.get("roomId")
                message = data.get("message")

                if not room_id or not message:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Room ID and message are required"
                    })
                    continue

                # Check user is connected to this room
                if not manager.is_user_in_room(
                    room_id,
                    user_id
                ):
                    await websocket.send_json({
                        "type": "error",
                        "message": "You are not connected to this room"
                    })
                    continue

                room_message = {
                    "type": "room_message",
                    "id": None,
                    "senderId": user_id,
                    "senderName": None,
                    "content": message
                }

                print(
                    f"Room message: {user_id} -> {room_id}: {message}"
                )

                # Send message to everyone in room
                await manager.send_to_room(
                    room_id,
                    room_message
                )

                continue

            # =====================================================
            # NORMAL ONE-TO-ONE MESSAGE
            # =====================================================

            conversation_id = data.get("conversation_id")
            receiver_id = data.get("receiver_id")
            ciphertext = data.get("ciphertext")
            message_type_value = data.get("messageType")

            # Ignore unknown payloads instead of crashing
            if not conversation_id or not receiver_id:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid WebSocket message"
                })
                continue

            if not ciphertext or not message_type_value:
                await websocket.send_json({
                    "type": "error",
                    "message": "Message content is required"
                })
                continue

            message_data = MessageCreate(
                ciphertext=ciphertext,
                messageType=message_type_value
            )

            # Save normal message
            new_message = create_message(
                db=db,
                conversation_id=conversation_id,
                Message=message_data,
                sender_id=user_id
            )

            # Send normal message to receiver
            await manager.send_to_user(
                receiver_id,
                {
                    "messageId": new_message.messageId,
                    "conversationId": new_message.conversationId,
                    "senderId": new_message.senderId,
                    "ciphertext": new_message.ciphertext,
                    "messageType": new_message.messageType,
                    "status": "sent"
                }
            )

    except WebSocketDisconnect:

        print(
            f"User {user_id} disconnected"
        )

        manager.disconnect(user_id)

    except Exception as e:

        print(
            f"WebSocket error for user {user_id}: {e}"
        )

        manager.disconnect(user_id)

    finally:

        db.close()