import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaMapMarkerAlt,
    FaPlus,
    FaUsers,
    FaClock,
    FaComments,
    FaTimes,
} from "react-icons/fa";

import roomService from "../backend/room";

import { getCurrentLocation } from "../backend/location";

import "./Room.css";

function Room() {
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [roomName, setRoomName] = useState("");

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [joiningRoom, setJoiningRoom] = useState(null);

    const [showCreate, setShowCreate] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =========================
    // LOAD ROOMS
    // =========================

    const loadRooms = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await roomService.get_rooms();
            setRooms(data || []);
        } catch (error) {
            console.error("Load rooms error:", error);

            setError(
                error.response?.data?.detail ||
                "Failed to load rooms"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRooms();
    }, []);

    // =========================
    // CREATE ROOM
    // =========================

    const handleCreateRoom = async () => {
        if (!roomName.trim()) {
            setError("Please enter a room name");
            return;
        }

        try {
            setCreating(true);
            setError("");
            setMessage("");

            const location = await getCurrentLocation();

            const data = await roomService.createRoom(
    roomName.trim(),
    location.latitude,
    location.longitude
);

            setMessage(
                `Room "${data.name}" created successfully`
            );

            setRoomName("");
            setShowCreate(false);

            await loadRooms();
        } catch (error) {
            console.error("Create room error:", error);

            setError(
                error.response?.data?.detail ||
                error.message ||
                "Failed to create room"
            );
        } finally {
            setCreating(false);
        }
    };

    // =========================
    // JOIN ROOM
    // =========================

//     const handleJoinRoom = async (roomId) => {
//     try {
//         setJoiningRoom(roomId);
//         setError("");
//         setMessage("");

//         const location = await getCurrentLocation();

//         await roomService.join_existing_room(
//     roomId,
//     location.latitude,
//     location.longitude
// );

// setMessage(`Successfully joined room ${roomId}`);
// console.log("hello")
// // JOIN SUCCESS → ROOM CHAT
// navigate(`/room/${roomId}`);
// console.log("hello")

//     } catch (error) {
//         console.error("Join room error:", error);

//         setError(
//             error.response?.data?.detail ||
//             "Failed to join room"
//         );
//     } finally {
//         setJoiningRoom(null);
//     }
// };

const handleJoinRoom = async (roomId) => {
    try {
        console.log("1. JOIN CLICKED for Room:", roomId);

        setJoiningRoom(roomId);
        setError("");
        setMessage("");

        console.log("2. Getting location...");
        const location = await getCurrentLocation();
        console.log("3. LOCATION OBTAINED:", location);

        console.log("4. Calling join_existing_room API...");
        const response = await roomService.join_existing_room(
            roomId,
            location.latitude,
            location.longitude
        );
        console.log("5. JOIN API RESPONSE:", response);

        setMessage(`Successfully joined room ${roomId}`);

        console.log("6. Navigating to route:", `/room/${roomId}`);
        navigate(`/room/${roomId}`);
        console.log("7. NAVIGATION CALLED SUCCESS");

    } catch (error) {
        console.error("❌ JOIN ROOM ERROR:", error);
        console.error("❌ Error Detail:", error.response?.data);

        setError(
            error.response?.data?.detail || "Failed to join room"
        );
    } finally {
        setJoiningRoom(null);
    }
};
    // =========================
    // FORMAT TIME
    // =========================

    const formatExpiry = (date) => {
        return new Date(date).toLocaleString([], {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // =========================
    // UI
    // =========================

    return (
        <div className="room-page">

            {/* ================= NAV ================= */}

            <div className="message-room-nav">

                <button
                    className="message-room-tab"
                    onClick={() => navigate("/message")}
                >
                    <FaComments />
                    Message
                </button>

                <button
                    className="message-room-tab active"
                    onClick={() => navigate("/room")}
                >
                    Room
                </button>

            </div>


            {/* ================= MAIN ================= */}

            <div className="room-container">

                {/* ================= HEADER ================= */}

                <div className="room-header">

                    <div className="room-title-section">

                        <div className="room-icon">
                            <FaUsers />
                        </div>

                        <div>
                            <h1>Rooms</h1>

                            <p>
                                Connect with people around you
                            </p>
                        </div>

                    </div>


                    <button
                        className="create-room-button"
                        onClick={() => {
                            setShowCreate(true);
                            setError("");
                            setMessage("");
                        }}
                    >
                        <FaPlus />
                        Create Room
                    </button>

                </div>


                {/* ================= CREATE ROOM ================= */}

                {showCreate && (
                    <div className="create-room-card">

                        <div className="create-room-top">

                            <div>
                                <h2>Create a Room</h2>

                                <p>
                                    Your current location will be used
                                    as the room location.
                                </p>
                            </div>

                            <button
                                className="close-create"
                                onClick={() => {
                                    setShowCreate(false);
                                    setRoomName("");
                                }}
                            >
                                <FaTimes />
                            </button>

                        </div>


                        <div className="room-input-wrapper">

                            <input
                                type="text"
                                placeholder="Enter room name..."
                                value={roomName}
                                maxLength={50}
                                onChange={(e) =>
                                    setRoomName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        !creating
                                    ) {
                                        handleCreateRoom();
                                    }
                                }}
                            />

                            <span>
                                {roomName.length}/50
                            </span>

                        </div>


                        <div className="create-info">

                            <div>
                                <FaMapMarkerAlt />
                                <span>
                                    500m join radius
                                </span>
                            </div>

                            <div>
                                <FaClock />
                                <span>
                                    Expires after 24 hours
                                </span>
                            </div>

                        </div>


                        <button
                            className="confirm-create-button"
                            onClick={handleCreateRoom}
                            disabled={
                                creating ||
                                !roomName.trim()
                            }
                        >
                            {creating
                                ? "Creating..."
                                : "Create Room"
                            }
                        </button>

                    </div>
                )}


                {/* ================= MESSAGE ================= */}

                {message && (
                    <div className="room-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="room-error">
                        {error}
                    </div>
                )}


                {/* ================= ROOM LIST ================= */}

                <div className="rooms-section">

                    <div className="rooms-section-header">

                        <div>
                            <h2>Nearby Rooms</h2>

                            <p>
                                Join a room within 500 meters
                            </p>
                        </div>

                        <div className="room-count">
                            {rooms.length}
                        </div>

                    </div>


                    {/* LOADING */}

                    {loading && (
                        <div className="room-state">

                            <div className="room-loader"></div>

                            <p>
                                Loading active rooms...
                            </p>

                        </div>
                    )}


                    {/* EMPTY */}

                    {!loading && rooms.length === 0 && (
                        <div className="room-empty">

                            <div className="empty-room-icon">
                                <FaUsers />
                            </div>

                            <h3>
                                No active rooms
                            </h3>

                            <p>
                                Create the first room around
                                your current location.
                            </p>

                            <button
                                onClick={() =>
                                    setShowCreate(true)
                                }
                            >
                                <FaPlus />
                                Create Room
                            </button>

                        </div>
                    )}


                    {/* ROOMS */}

                    {!loading && rooms.length > 0 && (
                        <div className="room-grid">

                            {rooms.map((room) => (

                                <div
                                    className="room-card"
                                    key={room.roomId}
                                >

                                    <div className="room-card-glow"></div>


                                    {/* CARD TOP */}

                                    <div className="room-card-top">

                                        <div className="room-card-icon">
                                            <FaUsers />
                                        </div>

                                        <div className="room-status">
                                            <span></span>
                                            Active
                                        </div>

                                    </div>


                                    {/* ROOM NAME */}

                                    <h3>
                                        {room.name}
                                    </h3>


                                    {/* ROOM ID */}

                                    <div className="room-id">
                                        <span>ROOM ID</span>

                                        <strong>
                                            {room.roomId}
                                        </strong>
                                    </div>


                                    {/* INFO */}

                                    <div className="room-details">

                                        <div>
                                            <FaMapMarkerAlt />

                                            <span>
                                                500m radius
                                            </span>
                                        </div>

                                        <div>
                                            <FaClock />

                                            <span>
                                                Expires{" "}
                                                {formatExpiry(
                                                    room.expiresAt
                                                )}
                                            </span>
                                        </div>

                                    </div>


                                    {/* JOIN */}

                                    {/* <button
                                        className="join-room-button"
                                        onClick={() =>
                                            
                                            handleJoinRoom(
                                                room.roomId
                                            )
                                        }
                                        disabled={
                                            joiningRoom ===
                                            room.roomId
                                        }
                                    >
                                        {joiningRoom ===
                                        room.roomId
                                            ? "Checking location..."
                                            : "Join Room"
                                        }
                                    </button> */}
<button
    type="button"
    className="join-room-button"
    onClick={() => {
        alert("BUTTON HIT!"); // Fallback if browser console filter is hiding logs
        console.log("Direct button clicked. Room object:", room);
        
        // Pass room.roomId or fallbacks
        const targetId = room?.roomId || room?.id || room?._id;
        console.log("Extracted Room ID:", targetId);
        
        if (targetId) {
            handleJoinRoom(targetId);
        } else {
            console.error("Room ID property missing on object!");
        }
    }}
>
    Join Room
</button>
                                </div>

                            ))}

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}

export default Room;
