import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import authService from "../backend/auth";
import conversationApi from "../backend/conversation";

import {
    FaSearch,
    FaUserCircle,
    FaComments,
    FaTimes,
} from "react-icons/fa";

import "./Inbox.css";

function Inbox() {
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [conversationUsers, setConversationUsers] = useState({});

    const [username, setUsername] = useState("");
    const [searchUser, setSearchUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [startingChat, setStartingChat] = useState(false);

    const [error, setError] = useState("");

    // =========================
    // LOAD INBOX
    // =========================

    useEffect(() => {
        loadInbox();
    }, []);

    const loadInbox = async () => {
        try {
            setLoading(true);
            setError("");

            // Get logged-in user
            const user = await authService.getCurrentUser();

            if (!user) {
                setError("Please login again.");
                return;
            }

            setCurrentUser(user);

            // Get user's conversations
            const data =
                await conversationApi.getConversations(user.id);

            setConversations(data || []);

            const usersData = {};

for (const conversation of data || []) {

    // Find other user's UUID
    const otherUserId =
        String(conversation.user1_id) === String(user.id)
            ? conversation.user2_id
            : conversation.user1_id;

    // UUID se user details lao
    const otherUser =
        await authService.get_user_by_id(otherUserId);

    // Is conversation ke saath user save karo
    usersData[conversation.id] = otherUser;
}

setConversationUsers(usersData);

        } catch (error) {
            console.error("Inbox load error:", error);

            setError(
                error.response?.data?.detail ||
                "Failed to load conversations"
            );
        } finally {
            setLoading(false);
        }
    };

    

    // =========================
    // SEARCH USER
    // =========================

    const handleSearch = async () => {
        const value = username.trim();

        if (!value) {
            setSearchUser(null);
            setError("");
            return;
        }

        try {
            setSearching(true);
            setError("");
            setSearchUser(null);

            // Search username using AuthService
            const foundUser =
                await authService.searchUser(value);

            setSearchUser(foundUser);

        } catch (error) {
            console.error("Search user error:", error);

            setError(
                error.response?.data?.detail ||
                "User not found"
            );
        } finally {
            setSearching(false);
        }
    };

    // =========================
    // START CONVERSATION
    // =========================

    const handleMessage = async () => {
        if (!currentUser || !searchUser) {
            return;
        }

        try {
            setStartingChat(true);
            setError("");

            /*
             * Backend checks if conversation already exists.
             *
             * If it exists:
             *     existing conversation returned
             *
             * If it doesn't:
             *     new conversation created
             */

            const conversation =
                await conversationApi.new_conversation(
                    currentUser.id,
                    searchUser.id
                );

            console.log(
                "Conversation:",
                conversation
            );

            // Open Chat page
            navigate(`/message/${conversation.id}`);
            
            

        } catch (error) {
            console.error(
                "Start conversation error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Could not start conversation"
            );
        } finally {
            setStartingChat(false);
        }
    };

    // =========================
    // OPEN EXISTING CHAT
    // =========================

    const openConversation = (conversation) => {
        navigate(`/message/${conversation.id}`);
        
    };

    // =========================
    // CLEAR SEARCH
    // =========================

    const clearSearch = () => {
        setUsername("");
        setSearchUser(null);
        setError("");
    };

    // =========================
    // UI
    // =========================

    return (
        <div className="inbox-page">

          <div className="message-room-nav">

            <button
                className="message-room-tab active"
                onClick={() => navigate("/message")}
            >
                Message
            </button>

            <button
                className="message-room-tab"
                onClick={() => navigate("/room")}
            >
                Room
            </button>

        </div>

            <div className="inbox-container">

                {/* ================= HEADER ================= */}

                <div className="inbox-header">

                    <div>
                        <h1>Messages</h1>

                        <p>
                            Search users and start a conversation
                        </p>
                    </div>

                    <div className="conversation-count">
                        {conversations.length}
                    </div>

                </div>


                {/* ================= SEARCH ================= */}

                <div className="inbox-search">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search username..."
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setError("");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSearch();
                            }
                        }}
                    />

                    {username && (
                        <button
                            className="clear-search"
                            onClick={clearSearch}
                            type="button"
                        >
                            <FaTimes />
                        </button>
                    )}

                    <button
                        className="search-button"
                        onClick={handleSearch}
                        disabled={
                            searching ||
                            !username.trim()
                        }
                        type="button"
                    >
                        {searching
                            ? "Searching..."
                            : "Search"}
                    </button>

                </div>


                {/* ================= ERROR ================= */}

                {error && (
                    <div className="inbox-error">
                        {error}
                    </div>
                )}


                {/* ================= SEARCH RESULT ================= */}

                {searchUser && (
                    <div className="search-result">

                        <div className="search-user-avatar">

                            {searchUser.name
                                ?.charAt(0)
                                ?.toUpperCase() || (
                                    <FaUserCircle />
                                )}

                        </div>


                        <div className="search-user-info">

                            <h3>
                                {searchUser.name ||
                                    searchUser.username}
                            </h3>

                            <p>
                                @{searchUser.username}
                            </p>

                        </div>


                        <button
                            className="message-btn"
                            onClick={handleMessage}
                            disabled={startingChat}
                            type="button"
                        >
                            {startingChat
                                ? "Opening..."
                                : "Message"}
                        </button>

                    </div>
                )}


                {/* ================= CONVERSATIONS ================= */}

                <div className="conversation-section">

                    <div className="section-title">
                        <h2>
                            Recent Conversations
                        </h2>
                    </div>


                    {/* LOADING */}

                    {loading && (
                        <div className="inbox-state">

                            <div className="loader"></div>

                            <p>
                                Loading conversations...
                            </p>

                        </div>
                    )}


                    {/* EMPTY */}

                    {!loading &&
                        conversations.length === 0 && (
                            <div className="empty-inbox">

                                <FaComments />

                                <h3>
                                    No conversations yet
                                </h3>

                                <p>
                                    Search a username to start
                                    chatting.
                                </p>

                            </div>
                        )}


                    {/* CONVERSATIONS */}

                    {!loading &&
                        conversations.length > 0 &&
                        conversations.map(
                            (conversation) => {

                                /*
                                 * Find other user's ID
                                 */

                                // const otherUserId =
                                //     String(
                                //         conversation.user1_id
                                //     ) ===
                                //     String(
                                //         currentUser?.id
                                //     )
                                //         ? conversation.user2_id
                                //         : conversation.user1_id;

                                const otherUser = conversationUsers[conversation.id];


                                return (
                                    <div
                                        key={
                                            conversation.id
                                        }
                                        className="conversation-card"
                                        onClick={() =>
                                            openConversation(
                                                conversation
                                            )
                                        }
                                    >

                                        {/* Avatar */}

                                        <div className="conversation-avatar">
                                            <FaUserCircle />
                                        </div>


                                        {/* Conversation info */}

                                        <div className="conversation-content">

                                            {/* <h3>
                                                User{" "}
                                                {otherUserId}
                                            </h3> */}
                                            <h3>
                                                {otherUser?.name || "Loading..."}
                                            </h3>

                                            <p>
                                                @{otherUser?.username || "Loading..."}
                                            </p>

                                            <p>
                                                Tap to open
                                                conversation
                                            </p>

                                        </div>


                                        {/* Arrow */}

                                        <div className="conversation-arrow">
                                            ›
                                        </div>

                                    </div>
                                );
                            }
                        )}

                </div>

            </div>

        </div>
    );
}

export default Inbox;
