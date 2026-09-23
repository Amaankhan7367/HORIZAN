from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):
        # user_id -> websocket
        self.active_connections = {}

        # room_id -> set of user_ids
        self.room_connections = {}

    # =========================================================
    # USER CONNECTION
    # =========================================================

    async def connect(
        self,
        user_id: str,
        websocket: WebSocket
    ):
        await websocket.accept()

        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        # Remove user websocket
        if user_id in self.active_connections:
            del self.active_connections[user_id]

        # Remove user from every room
        self.remove_user_from_all_rooms(user_id)

    # =========================================================
    # ONE-TO-ONE MESSAGE
    # =========================================================

    async def send_to_user(
        self,
        user_id: str,
        message: dict
    ):
        websocket = self.active_connections.get(user_id)

        if websocket:
            await websocket.send_json(message)

    # =========================================================
    # ROOM MANAGEMENT
    # =========================================================

    def join_room(
        self,
        room_id: str,
        user_id: str
    ):
        if room_id not in self.room_connections:
            self.room_connections[room_id] = set()

        self.room_connections[room_id].add(user_id)

    def leave_room(
        self,
        room_id: str,
        user_id: str
    ):
        if room_id not in self.room_connections:
            return

        self.room_connections[room_id].discard(user_id)

        # Delete empty room from memory
        if not self.room_connections[room_id]:
            del self.room_connections[room_id]

    def remove_user_from_all_rooms(
        self,
        user_id: str
    ):
        empty_rooms = []

        for room_id, users in self.room_connections.items():
            users.discard(user_id)

            if not users:
                empty_rooms.append(room_id)

        for room_id in empty_rooms:
            del self.room_connections[room_id]

    # =========================================================
    # ROOM BROADCAST
    # =========================================================

    async def send_to_room(
        self,
        room_id: str,
        message: dict,
        exclude_user_id: str | None = None
    ):
        users = self.room_connections.get(room_id, set())

        disconnected_users = []

        for user_id in users:

            # Don't send to sender if requested
            if exclude_user_id and user_id == exclude_user_id:
                continue

            websocket = self.active_connections.get(user_id)

            if websocket:
                try:
                    await websocket.send_json(message)

                except Exception:
                    disconnected_users.append(user_id)

        # Clean disconnected users
        for user_id in disconnected_users:
            self.remove_user_from_all_rooms(user_id)
            self.active_connections.pop(user_id, None)

    # =========================================================
    # ROOM MEMBERS
    # =========================================================

    def get_room_members(
        self,
        room_id: str
    ):
        return list(
            self.room_connections.get(room_id, set())
        )

    def is_user_in_room(
        self,
        room_id: str,
        user_id: str
    ):
        return user_id in self.room_connections.get(
            room_id,
            set()
        )