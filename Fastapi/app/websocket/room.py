from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.database import session
from app.crud import (
    get_room,
    is_room_expired,
    is_room_member
)


router = APIRouter()

# room_id -> {user_id: websocket}
room_connections = {}


@router.websocket("/ws/room/{room_id}/{user_id}")
async def room_websocket(
    websocket: WebSocket,
    room_id: str,
    user_id: str
):

    db = session()

    try:

        # =========================
        # CHECK ROOM
        # =========================

        db_room = get_room(db, room_id)

        if not db_room:
            await websocket.close(
                code=1008,
                reason="Room not found"
            )
            return

        # =========================
        # CHECK ROOM EXPIRY
        # =========================

        if is_room_expired(db, room_id):
            await websocket.close(
                code=1008,
                reason="Room expired"
            )
            return

        # =========================
        # CHECK MEMBER
        # =========================

        member = is_room_member(
            db,
            room_id,
            user_id
        )

        if not member:
            await websocket.close(
                code=1008,
                reason="User is not a room member"
            )
            return

        # =========================
        # ACCEPT CONNECTION
        # =========================

        await websocket.accept()

        # Create room connection
        if room_id not in room_connections:
            room_connections[room_id] = {}

        room_connections[room_id][user_id] = websocket

        print(
            f"User {user_id} connected to room {room_id}"
        )

        # =========================
        # CONNECTED RESPONSE
        # =========================

        await websocket.send_json({
            "type": "connected",
            "roomId": room_id,
            "userId": user_id
        })

        # =========================
        # RECEIVE MESSAGES
        # =========================

        while True:

            data = await websocket.receive_json()

            # Check expiry again
            if is_room_expired(db, room_id):

                await websocket.send_json({
                    "type": "room_expired",
                    "roomId": room_id
                })

                break

            ciphertext = data.get("ciphertext")

            if not ciphertext:
                await websocket.send_json({
                    "type": "error",
                    "message": "Ciphertext is required"
                })
                continue

            message_type = data.get(
                "messageType",
                "text"
            )

            # =========================
            # MESSAGE
            # =========================

            message = {
                "type": "message",
                "roomId": room_id,
                "senderId": user_id,
                "ciphertext": ciphertext,
                "messageType": message_type
            }

            # =========================
            # BROADCAST
            # =========================

            connections = room_connections.get(
                room_id,
                {}
            )

            for connected_user_id, connection in list(
                connections.items()
            ):

                try:

                    await connection.send_json(message)

                except Exception as e:

                    print(
                        f"Failed to send message to "
                        f"{connected_user_id}: {e}"
                    )

    except WebSocketDisconnect:

        print(
            f"User {user_id} disconnected "
            f"from room {room_id}"
        )

    except Exception as e:

        print(
            f"Room WebSocket error: {e}"
        )

    finally:

        # =========================
        # REMOVE CONNECTION
        # =========================

        if room_id in room_connections:

            room_connections[room_id].pop(
                user_id,
                None
            )

            # Remove empty room connection list
            if not room_connections[room_id]:

                del room_connections[room_id]

        db.close()