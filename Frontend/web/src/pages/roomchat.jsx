
import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    useSelector
} from "react-redux";

import {
    FaArrowLeft,
    FaPaperPlane,
    FaUsers,
    FaCircle
} from "react-icons/fa";

import roomService from "../backend/room";
import "./RoomChat.css";


export default function RoomChat() {

    /* =========================
       ROUTER
    ========================= */

    const { roomId } = useParams();

    const navigate = useNavigate();


    /* =========================
       REDUX USER
    ========================= */

    const userData = useSelector(
        (state) => state.auth.userData
    );


    /* =========================
       USER ID
    ========================= */

    const userId =
        userData?.id ||
        userData?.user_id ||
        userData?.userId ||
        null;


    /* =========================
       REFS
    ========================= */

    const socketRef = useRef(null);

    const reconnectTimerRef = useRef(null);

    const reconnectAttemptsRef = useRef(0);

    const isUnmountedRef = useRef(false);

    const manuallyClosedRef = useRef(false);

    const messagesEndRef = useRef(null);

    const messageIdsRef = useRef(new Set());


    /* =========================
       STATE
    ========================= */

    const [room, setRoom] = useState(null);

    const [members, setMembers] = useState([]);

    const [messages, setMessages] = useState([]);

    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(true);

    const [sending, setSending] = useState(false);

    const [error, setError] = useState("");

    const [connected, setConnected] = useState(false);


    /* =========================
       CONSTANTS
    ========================= */

    const MAX_RECONNECT_ATTEMPTS = 5;

    const BASE_RECONNECT_DELAY = 1000;

    const MAX_RECONNECT_DELAY = 10000;


    /* =========================
       SCROLL
    ========================= */

    const scrollToBottom = useCallback(() => {

        requestAnimationFrame(() => {

            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth"
            });

        });

    }, []);


    /* =========================
       LOAD ROOM
    ========================= */

    const loadRoom = useCallback(async () => {

        if (!roomId) {
            return;
        }

        try {

            setLoading(true);

            setError("");

            const roomData =
                await roomService.get_room_details(
                    roomId
                );

            if (
                roomData?.expired === true ||
                roomData?.isExpired === true
            ) {

                setError(
                    "This room has expired."
                );

                return;
            }

            setRoom(roomData);

        } catch (error) {

            console.error(
                "Room details error:",
                error
            );

            const status =
                error?.response?.status;

            if (status === 404) {

                setError(
                    "Room not found."
                );

            } else if (status === 401) {

                setError(
                    "Session expired. Please login again."
                );

            } else {

                setError(
                    error?.response?.data?.detail ||
                    "Unable to load room."
                );
            }

        } finally {

            setLoading(false);
        }

    }, [roomId]);


    /* =========================
       LOAD MEMBERS
    ========================= */

    const loadMembers = useCallback(async () => {

        if (!roomId) {
            return;
        }

        try {

            const membersData =
                await roomService.get_members(
                    roomId
                );

            const memberList =
                Array.isArray(membersData)
                    ? membersData
                    : membersData?.members || [];

            setMembers(memberList);

        } catch (error) {

            console.error(
                "Members error:",
                error
            );

        }

    }, [roomId]);


    /* =========================
       CLEAR RECONNECT TIMER
    ========================= */

    const clearReconnectTimer = useCallback(() => {

        if (reconnectTimerRef.current) {

            clearTimeout(
                reconnectTimerRef.current
            );

            reconnectTimerRef.current = null;
        }

    }, []);


    /* =========================
       CLOSE SOCKET
    ========================= */

    const closeSocket = useCallback(() => {

        clearReconnectTimer();

        const socket =
            socketRef.current;

        if (!socket) {
            return;
        }

        socketRef.current = null;

        try {

            socket.onopen = null;

            socket.onmessage = null;

            socket.onerror = null;

            socket.onclose = null;

            if (
                socket.readyState ===
                    WebSocket.OPEN ||
                socket.readyState ===
                    WebSocket.CONNECTING
            ) {

                socket.close(1000, "Client closed");

            }

        } catch (error) {

            console.error(
                "WebSocket close error:",
                error
            );
        }

        setConnected(false);

    }, [clearReconnectTimer]);


    /* =========================
       CONNECT WEBSOCKET
    ========================= */

    const connectWebSocket = useCallback(() => {

        if (
            isUnmountedRef.current ||
            manuallyClosedRef.current
        ) {
            return;
        }


        if (!userId) {

            console.error(
                "User ID not found.",
                userData
            );

            setError(
                "User information not found."
            );

            setConnected(false);

            return;
        }


        if (!roomId) {
            return;
        }


        /* =========================
           PREVENT DUPLICATE SOCKET
        ========================= */

        const existingSocket =
            socketRef.current;

        if (
            existingSocket &&
            (
                existingSocket.readyState ===
                    WebSocket.OPEN ||
                existingSocket.readyState ===
                    WebSocket.CONNECTING
            )
        ) {

            return;
        }


        clearReconnectTimer();


        /* =========================
           PROTOCOL
        ========================= */

        const protocol =
            window.location.protocol === "https:"
                ? "wss:"
                : "ws:";


        const wsUrl =
            `${protocol}//127.0.0.1:8000/ws/${userId}`;


        console.log(
            "Connecting WebSocket:",
            wsUrl
        );


        let socket;

        try {

            socket =
                new WebSocket(wsUrl);

        } catch (error) {

            console.error(
                "WebSocket creation error:",
                error
            );

            return;
        }


        socketRef.current = socket;


        /* =========================
           OPEN
        ========================= */

        socket.onopen = () => {

            if (
                isUnmountedRef.current ||
                socketRef.current !== socket
            ) {
                return;
            }


            console.log(
                "WebSocket connected"
            );


            reconnectAttemptsRef.current = 0;

            setConnected(true);

            setError("");


            /* =========================
               JOIN ROOM
            ========================= */

            try {

                socket.send(
                    JSON.stringify({
                        type: "join_room",
                        roomId: roomId
                    })
                );

            } catch (error) {

                console.error(
                    "Join room send error:",
                    error
                );
            }


            /* =========================
               REFRESH MEMBERS
            ========================= */

            loadMembers();

        };


        /* =========================
           MESSAGE
        ========================= */

        socket.onmessage = (event) => {

            if (
                isUnmountedRef.current ||
                socketRef.current !== socket
            ) {
                return;
            }


            try {

                const data =
                    JSON.parse(event.data);


                console.log(
                    "WebSocket message:",
                    data
                );


                /* =========================
                   ROOM MESSAGE
                ========================= */

                if (
                    data.type ===
                        "room_message" ||
                    data.type ===
                        "message"
                ) {


                    /* =========================
                       ROOM CHECK
                    ========================= */

                    if (
                        data.roomId &&
                        String(data.roomId) !==
                            String(roomId)
                    ) {

                        return;
                    }


                    /* =========================
                       MESSAGE ID
                    ========================= */

                    const messageId =
                        data.id ||
                        data.messageId ||
                        data.message_id ||
                        `${data.senderId || data.userId}-${data.createdAt || Date.now()}-${data.content || data.message}`;


                    /* =========================
                       DUPLICATE CHECK
                    ========================= */

                    if (
                        messageIdsRef.current.has(
                            String(messageId)
                        )
                    ) {

                        return;
                    }


                    messageIdsRef.current.add(
                        String(messageId)
                    );


                    /* =========================
                       NORMALIZE MESSAGE
                    ========================= */

                    const newMessage = {

                        id: messageId,

                        senderId:
                            data.senderId ||
                            data.userId ||
                            data.sender_id ||
                            data.user_id ||
                            null,

                        senderName:
                            data.senderName ||
                            data.username ||
                            data.sender_name ||
                            "User",

                        content:
                            data.content ??
                            data.message ??
                            "",

                        createdAt:
                            data.createdAt ||
                            data.created_at ||
                            new Date().toISOString()
                    };


                    /* =========================
                       ADD MESSAGE
                    ========================= */

                    setMessages(
                        (prev) => [
                            ...prev,
                            newMessage
                        ]
                    );


                    scrollToBottom();

                    return;
                }


                /* =========================
                   MEMBER JOINED
                ========================= */

                if (
                    data.type ===
                        "member_joined"
                ) {

                    loadMembers();

                    return;
                }


                /* =========================
                   MEMBER LEFT
                ========================= */

                if (
                    data.type ===
                        "member_left"
                ) {

                    loadMembers();

                    return;
                }


                /* =========================
                   ROOM EXPIRED
                ========================= */

                if (
                    data.type ===
                        "room_expired"
                ) {

                    setConnected(false);

                    setError(
                        "This room has expired."
                    );

                    closeSocket();

                    return;
                }

            } catch (error) {

                console.error(
                    "WebSocket message parsing error:",
                    error
                );
            }

        };


        /* =========================
           ERROR
        ========================= */

        socket.onerror = (error) => {

            if (
                isUnmountedRef.current ||
                socketRef.current !== socket
            ) {
                return;
            }


            console.error(
                "WebSocket error:",
                error
            );


            setConnected(false);

        };


        /* =========================
           CLOSE
        ========================= */

        socket.onclose = (event) => {

            if (
                socketRef.current !== socket
            ) {
                return;
            }


            socketRef.current = null;


            setConnected(false);


            console.log(
                "WebSocket disconnected:",
                event.code,
                event.reason
            );


            /* =========================
               DO NOT RECONNECT
               IF COMPONENT CLOSED
            ========================= */

            if (
                isUnmountedRef.current ||
                manuallyClosedRef.current
            ) {
                return;
            }


            /* =========================
               RECONNECT LIMIT
            ========================= */

            if (
                reconnectAttemptsRef.current >=
                    MAX_RECONNECT_ATTEMPTS
            ) {

                setError(
                    "Unable to connect to chat server."
                );

                return;
            }


            /* =========================
               EXPONENTIAL BACKOFF
            ========================= */

            const attempt =
                reconnectAttemptsRef.current;

            const delay =
                Math.min(
                    BASE_RECONNECT_DELAY *
                        Math.pow(2, attempt),
                    MAX_RECONNECT_DELAY
                );


            reconnectAttemptsRef.current += 1;


            console.log(
                `Reconnecting in ${delay}ms...`
            );


            reconnectTimerRef.current =
                setTimeout(() => {

                    if (
                        !isUnmountedRef.current &&
                        !manuallyClosedRef.current
                    ) {

                        connectWebSocket();
                    }

                }, delay);

        };


    }, [
        userId,
        userData,
        roomId,
        clearReconnectTimer,
        loadMembers,
        scrollToBottom,
        closeSocket
    ]);


    /* =========================
       SEND MESSAGE
    ========================= */

    const sendMessage = useCallback(() => {

        const text =
            message.trim();


        if (!text) {
            return;
        }


        const socket =
            socketRef.current;


        if (
            !socket ||
            socket.readyState !==
                WebSocket.OPEN
        ) {

            setError(
                "Chat is not connected."
            );

            return;
        }


        if (!roomId) {

            setError(
                "Room ID is missing."
            );

            return;
        }


        setSending(true);


        const payload = {

            type: "room_message",

            roomId: roomId,

            message: text
        };


        try {

            console.log(
                "Sending:",
                payload
            );


            socket.send(
                JSON.stringify(payload)
            );


            setMessage("");

            setError("");

            scrollToBottom();

        } catch (error) {

            console.error(
                "Send message error:",
                error
            );

            setError(
                "Failed to send message."
            );

        } finally {

            setSending(false);
        }

    }, [
        message,
        roomId,
        scrollToBottom
    ]);


    /* =========================
       ENTER KEY
    ========================= */

    const handleKeyDown = useCallback(
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();
            }

        },
        [sendMessage]
    );


    /* =========================
       INITIALIZE ROOM
    ========================= */

    useEffect(() => {

        isUnmountedRef.current = false;

        manuallyClosedRef.current = false;

        reconnectAttemptsRef.current = 0;


        if (!roomId) {

            navigate("/room");

            return;
        }


        let cancelled = false;


        const initializeRoom =
            async () => {

                try {

                    await loadRoom();

                    if (cancelled) {
                        return;
                    }


                    await loadMembers();

                    if (cancelled) {
                        return;
                    }


                    if (!userId) {

                        console.error(
                            "Cannot connect WebSocket: user ID missing."
                        );

                        setError(
                            "User information not found."
                        );

                        return;
                    }


                    connectWebSocket();

                } catch (error) {

                    console.error(
                        "Room initialization error:",
                        error
                    );

                    if (!cancelled) {

                        setError(
                            "Unable to initialize room."
                        );
                    }
                }
            };


        initializeRoom();


        /* =========================
           CLEANUP
        ========================= */

        return () => {

            cancelled = true;

            isUnmountedRef.current = true;

            manuallyClosedRef.current = true;


            clearReconnectTimer();


            const socket =
                socketRef.current;


            socketRef.current = null;


            if (socket) {

                try {

                    socket.onopen = null;

                    socket.onmessage = null;

                    socket.onerror = null;

                    socket.onclose = null;


                    if (
                        socket.readyState ===
                            WebSocket.OPEN ||
                        socket.readyState ===
                            WebSocket.CONNECTING
                    ) {

                        socket.close(
                            1000,
                            "RoomChat cleanup"
                        );
                    }

                } catch (error) {

                    console.error(
                        "WebSocket cleanup error:",
                        error
                    );
                }
            }


            setConnected(false);

        };

    }, [
        roomId,
        userId,
        loadRoom,
        loadMembers,
        connectWebSocket,
        clearReconnectTimer,
        navigate
    ]);


    /* =========================
       CLEAN MESSAGE IDS
    ========================= */

    useEffect(() => {

        return () => {

            messageIdsRef.current.clear();

        };

    }, [roomId]);


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (

            <div className="room-chat-page">

                <div className="room-chat-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading room...
                    </p>

                </div>

            </div>
        );
    }


    /* =========================
       ROOM ERROR
    ========================= */

    if (error && !room) {

        return (

            <div className="room-chat-page">

                <div className="room-chat-error">

                    <h2>
                        Unable to open room
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/room")
                        }
                    >
                        Back to Rooms
                    </button>

                </div>

            </div>
        );
    }


    /* =========================
       CHAT UI
    ========================= */

    return (

        <div className="room-chat-page">


            {/* =====================
                HEADER
            ===================== */}

            <header className="room-chat-header">


                <div className="room-chat-header-left">

                    <button
                        className="room-back-btn"
                        onClick={() =>
                            navigate("/room")
                        }
                        aria-label="Back to rooms"
                    >
                        <FaArrowLeft />
                    </button>


                    <div className="room-chat-title">

                        <h2>
                            {room?.name ||
                                `Room ${roomId}`}
                        </h2>


                        <div className="room-status">

                            <FaCircle
                                className={
                                    connected
                                        ? "status-online"
                                        : "status-offline"
                                }
                            />


                            <span>

                                {
                                    connected
                                        ? "Connected"
                                        : "Connecting..."
                                }

                            </span>

                        </div>

                    </div>

                </div>


                {/* =====================
                    MEMBERS
                ===================== */}

                <div className="room-members-count">

                    <FaUsers />

                    <span>
                        {members.length}
                    </span>

                </div>

            </header>


            {/* =====================
                ROOM INFO
            ===================== */}

            <div className="room-chat-info">

                <span>
                    Room ID:
                </span>


                <strong>
                    {roomId}
                </strong>

            </div>


            {/* =====================
                ERROR
            ===================== */}

            {error && (

                <div className="room-chat-warning">

                    {error}

                </div>

            )}


            {/* =====================
                CHAT BODY
            ===================== */}

            <main className="room-chat-body">


                {/* =====================
                    EMPTY
                ===================== */}

                {messages.length === 0 && (

                    <div className="empty-room-chat">

                        <div className="empty-icon">
                            💬
                        </div>


                        <h3>
                            Welcome to the room
                        </h3>


                        <p>
                            Start a conversation
                            with people in this room.
                        </p>

                    </div>

                )}


                {/* =====================
                    MESSAGES
                ===================== */}

                {messages.map(
                    (msg, index) => {

                        const isMine =
                            String(
                                msg.senderId
                            ) ===
                            String(userId);


                        return (

                            <div
                                key={
                                    msg.id ||
                                    index
                                }
                                className={
                                    `room-message-row ${
                                        isMine
                                            ? "mine"
                                            : "other"
                                    }`
                                }
                            >

                                <div className="room-message">


                                    {!isMine && (

                                        <div className="message-sender">

                                            {
                                                msg.senderName
                                            }

                                        </div>

                                    )}


                                    <div className="message-content">

                                        {
                                            msg.content
                                        }

                                    </div>


                                    <div className="message-time">

                                        {
                                            msg.createdAt
                                                ? new Date(
                                                    msg.createdAt
                                                ).toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour:
                                                            "2-digit",
                                                        minute:
                                                            "2-digit"
                                                    }
                                                )
                                                : ""
                                        }

                                    </div>

                                </div>

                            </div>

                        );

                    }
                )}


                <div
                    ref={messagesEndRef}
                />

            </main>


            {/* =====================
                MESSAGE INPUT
            ===================== */}

            <footer className="room-chat-input-area">

                <div className="room-chat-input-wrapper">


                    <textarea
                        value={message}
                        onChange={(event) =>
                            setMessage(
                                event.target.value
                            )
                        }
                        onKeyDown={
                            handleKeyDown
                        }
                        placeholder="Type a message..."
                        rows={1}
                        disabled={!connected}
                        maxLength={2000}
                        aria-label="Message"
                    />


                    <button
                        className="room-send-btn"
                        onClick={
                            sendMessage
                        }
                        disabled={
                            !connected ||
                            !message.trim() ||
                            sending
                        }
                        aria-label="Send message"
                    >

                        <FaPaperPlane />

                    </button>

                </div>

            </footer>

        </div>
    );
}