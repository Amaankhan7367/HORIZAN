import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import authService from "../backend/auth";
import messageService from "../backend/message";

import {
    FaArrowLeft,
    FaPaperPlane,
    FaUserCircle,
} from "react-icons/fa";

import "./Chat.css";


function Chat() {
    const { conversationId } = useParams();
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const messagesEndRef = useRef(null);


    // =========================
    // LOAD CHAT
    // =========================

    useEffect(() => {
        loadChat();
    }, [conversationId]);


    const loadChat = async () => {
        try {
            setLoading(true);
            setError("");

            const user = await authService.getCurrentUser();

            if (!user) {
                setError("Please login again.");
                return;
            }

            setCurrentUser(user);

            const data =
                await messageService.getMessages(conversationId);

            setMessages(data || []);

        } catch (error) {
            console.error("Chat load error:", error);

            setError(
                error.response?.data?.detail ||
                "Failed to load messages"
            );

        } finally {
            setLoading(false);
        }
    };


    // =========================
    // AUTO SCROLL
    // =========================

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);


    // =========================
    // SEND MESSAGE
    // =========================

    const handleSend = async (e) => {
        e.preventDefault();

        const text = newMessage.trim();

        if (!text || sending) return;

        try {
            setSending(true);
            setError("");

            const messageData = {
                ciphertext: text,
                messageType: "text",
            };

            const createdMessage =
                await messageService.createMessage(
                    conversationId,
                    messageData
                );

            setMessages((previousMessages) => [
                ...previousMessages,
                createdMessage,
            ]);

            setNewMessage("");

        } catch (error) {
            console.error("Send message error:", error);

            setError(
                error.response?.data?.detail ||
                "Failed to send message"
            );

        } finally {
            setSending(false);
        }
    };


    // =========================
    // FORMAT TIME
    // =========================

    const formatTime = (dateValue) => {
        if (!dateValue) return "";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };


    return (
        <div className="chat-page">

            <div className="chat-container">

                {/* ================= HEADER ================= */}

                <div className="chat-header">

                    <button
                        className="back-button"
                        onClick={() => navigate("/message")}
                        type="button"
                    >
                        <FaArrowLeft />
                    </button>


                    <div className="chat-user-avatar">
                        <FaUserCircle />
                    </div>


                    <div className="chat-user-info">
                        <h2>Conversation</h2>
                        <p>Start chatting</p>
                    </div>

                </div>


                {/* ================= ERROR ================= */}

                {error && (
                    <div className="chat-error">
                        {error}
                    </div>
                )}


                {/* ================= MESSAGES ================= */}

                <div className="messages-area">

                    {loading && (
                        <div className="chat-loading">
                            <div className="chat-loader"></div>
                            <p>Loading messages...</p>
                        </div>
                    )}


                    {!loading && messages.length === 0 && (
                        <div className="empty-chat">

                            <FaUserCircle />

                            <h3>No messages yet</h3>

                            <p>
                                Say hello and start the conversation.
                            </p>

                        </div>
                    )}


                    {!loading &&
                        messages.map((message) => {

                            const isMine =
                                String(message.senderId) ===
                                String(currentUser?.id);

                            return (
                                <div
                                    key={message.messageId}
                                    className={
                                        isMine
                                            ? "message-row mine"
                                            : "message-row other"
                                    }
                                >

                                    <div className="message-bubble">

                                        <p>
                                            {message.ciphertext}
                                        </p>

                                        <span className="message-time">
                                            {formatTime(
                                                message.createdAt
                                            )}
                                        </span>

                                    </div>

                                </div>
                            );
                        })}

                    <div ref={messagesEndRef}></div>

                </div>


                {/* ================= INPUT ================= */}

                <form
                    className="message-input-area"
                    onSubmit={handleSend}
                >

                    <input
                        type="text"
                        placeholder="Write a message..."
                        value={newMessage}
                        onChange={(e) =>
                            setNewMessage(e.target.value)
                        }
                        disabled={sending}
                    />

                    <button
                        className="send-button"
                        type="submit"
                        disabled={
                            sending ||
                            !newMessage.trim()
                        }
                    >
                        <FaPaperPlane />
                    </button>

                </form>

            </div>

        </div>
    );
}


export default Chat;