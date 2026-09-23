import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import roomService from "../../backend/room";


// Fallback configuration for WebSocket endpoint
// Note: Use your local IP (e.g. ws://192.168.x.x:8000) or 'ws://127.0.0.1:8000' if using adb reverse
const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || "ws://127.0.0.1:8000";

export default function RoomChat() {
    const route = useRoute();
    const navigation = useNavigation();

    // Extract roomId from React Navigation params
    const { roomId } = route.params || {};

    const socketRef = useRef(null);
    const flatListRef = useRef(null);
    const isComponentMounted = useRef(true);

    const [currentUserId, setCurrentUserId] = useState(null);
    const [room, setRoom] = useState(null);
    const [members, setMembers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [connected, setConnected] = useState(false);

    useEffect(() => {
  const checkSession = async () => {
    const token = await AsyncStorage.getItem("token");
    console.log("ROOM CHAT TOKEN:", token);
  };

  checkSession();
}, []);

    /* =========================
       USER AUTH & HELPERS
    ========================= */
   const loadCurrentUserId = useCallback(async () => {
    try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
            console.log("No token found");
            return null;
        }

        console.log("ROOM CHAT TOKEN FOUND");

        const response = await fetch(
            "http://127.0.0.1:8000/user/me",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            console.log(
                "USER ME ERROR:",
                response.status,
                errorText
            );

            return null;
        }

        const user = await response.json();

        console.log("CURRENT USER:", user);

        const uid =
            user?.id ||
            user?.user_id ||
            user?._id;

        if (!uid) {
            console.log("User ID not found in /user/me response");
            return null;
        }

        setCurrentUserId(uid);

        // Also save user data for future use
        await AsyncStorage.setItem(
            "userData",
            JSON.stringify(user)
        );

        return uid;

    } catch (error) {
        console.error(
            "loadCurrentUserId error:",
            error
        );

        return null;
    }
}, []);

    const scrollToBottom = (animated = true) => {
        requestAnimationFrame(() => {
            if (flatListRef.current && messages.length > 0) {
                flatListRef.current.scrollToEnd({ animated });
            }
        });
    };

    /* =========================
       DATA FETCHING
    ========================= */
    const loadRoomData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [roomData, membersData, historyData] = await Promise.all([
                roomService.get_room_details(roomId),
                roomService.get_members(roomId).catch(() => []),
                roomService.get_messages
                    ? roomService.get_messages(roomId).catch(() => [])
                    : Promise.resolve([]),
            ]);

            if (!isComponentMounted.current) return;

            setRoom(roomData);
            setMembers(
                Array.isArray(membersData)
                    ? membersData
                    : membersData?.members || []
            );

            if (Array.isArray(historyData) && historyData.length > 0) {
                setMessages(historyData);
                scrollToBottom(false);
            }
        } catch (err) {
            if (!isComponentMounted.current) return;
            console.error("Room initialization error:", err);
            setError(err.response?.data?.detail || "Unable to load room details.");
        } finally {
            if (isComponentMounted.current) {
                setLoading(false);
            }
        }
    }, [roomId]);

    const reloadMembers = useCallback(async () => {
        try {
            const membersData = await roomService.get_members(roomId);
            if (!isComponentMounted.current) return;
            setMembers(
                Array.isArray(membersData)
                    ? membersData
                    : membersData?.members || []
            );
        } catch (err) {
            console.error("Failed to update members list:", err);
        }
    }, [roomId]);

    /* =========================
       WEBSOCKET HANDLING
    ========================= */
    useEffect(() => {
        isComponentMounted.current = true;

        if (!roomId) {
            navigation.navigate("Room");
            return;
        }

        let socket = null;

        const initChat = async () => {
            const userId = await loadCurrentUserId();

            if (!userId) {
                setError("Authentication error: User session not found.");
                setLoading(false);
                return;
            }

            await loadRoomData();

            const wsUrl = `${WS_BASE_URL}/ws/${userId}`;
            socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                if (!isComponentMounted.current) return;
                setConnected(true);

                socket.send(
                    JSON.stringify({
                        type: "join_room",
                        roomId: roomId,
                    })
                );
            };

            socket.onmessage = (event) => {
                if (!isComponentMounted.current) return;

                try {
                    const data = JSON.parse(event.data);

                    if (data.roomId && String(data.roomId) !== String(roomId)) {
                        return;
                    }

                    switch (data.type) {
                        case "room_message":
                        case "message": {
                            const newMessage = {
                                id:
                                    data.id ||
                                    `msg_${Date.now()}_${Math.random()
                                        .toString(36)
                                        .substr(2, 9)}`,
                                senderId:
                                    data.senderId || data.userId || data.sender_id,
                                senderName:
                                    data.senderName || data.username || "User",
                                content: data.content || data.message || "",
                                createdAt:
                                    data.createdAt ||
                                    data.created_at ||
                                    new Date().toISOString(),
                            };

                            setMessages((prevMessages) => {
                                if (
                                    prevMessages.some(
                                        (m) => m.id === newMessage.id
                                    )
                                ) {
                                    return prevMessages;
                                }
                                return [...prevMessages, newMessage];
                            });

                            scrollToBottom();
                            break;
                        }
                        case "member_joined":
                        case "member_left":
                            reloadMembers();
                            break;
                        default:
                            break;
                    }
                } catch (err) {
                    console.error("Error parsing WebSocket message:", err);
                }
            };

            socket.onerror = (err) => {
                console.error("WebSocket connection error:", err);
                if (isComponentMounted.current) setConnected(false);
            };

            socket.onclose = () => {
                if (isComponentMounted.current) setConnected(false);
            };
        };

        initChat();

        return () => {
            isComponentMounted.current = false;
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [roomId, navigation, loadCurrentUserId, loadRoomData, reloadMembers]);

    /* =========================
       ACTIONS
    ========================= */
    const sendMessage = () => {
        const text = message.trim();
        if (!text) return;

        if (
            !socketRef.current ||
            socketRef.current.readyState !== WebSocket.OPEN
        ) {
            setError("Chat connection lost. Reconnecting...");
            return;
        }

        setSending(true);

        const payload = {
            type: "room_message",
            roomId: roomId,
            message: text,
        };

        socketRef.current.send(JSON.stringify(payload));

        setMessage("");
        setSending(false);
        scrollToBottom();
    };

    /* =========================
       RENDER ITEMS
    ========================= */
    const renderItem = ({ item }) => {
        const isMine = String(item.senderId) === String(currentUserId);
        const timeStr = item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "";

        return (
            <View
                style={[
                    styles.messageRow,
                    isMine ? styles.mineRow : styles.otherRow,
                ]}
            >
                <View
                    style={[
                        styles.messageBubble,
                        isMine ? styles.mineBubble : styles.otherBubble,
                    ]}
                >
                    {!isMine && (
                        <Text style={styles.senderName}>{item.senderName}</Text>
                    )}
                    <Text style={[styles.messageText, isMine && styles.mineText]}>
                        {item.content}
                    </Text>

                    {timeStr ? (
                        <Text
                            style={[
                                styles.messageTime,
                                isMine && styles.mineTime,
                            ]}
                        >
                            {timeStr}
                        </Text>
                    ) : null}
                </View>
            </View>
        );
    };

    /* =========================
       RENDER GUARDS
    ========================= */
    if (loading) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Loading room...</Text>
            </SafeAreaView>
        );
    }

    if (error && !room) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <Text style={styles.errorTitle}>Unable to open room</Text>
                <Text style={styles.errorSub}>{error}</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate("Room")}
                >
                    <Text style={styles.backButtonText}>Back to Rooms</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    /* =========================
       MAIN RENDER
    ========================= */
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.headerBackBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={22} color="#ffffff" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleArea}>
                        <Text style={styles.roomTitle} numberOfLines={1}>
                            {room?.name || `Room ${roomId}`}
                        </Text>
                        <View style={styles.statusBadge}>
                            <View
                                style={[
                                    styles.statusDot,
                                    connected
                                        ? styles.dotOnline
                                        : styles.dotOffline,
                                ]}
                            />
                            <Text style={styles.statusText}>
                                {connected ? "Connected" : "Connecting..."}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.membersBadge}>
                    <Ionicons name="people" size={16} color="#94a3b8" />
                    <Text style={styles.membersCount}>{members.length}</Text>
                </View>
            </View>

            {/* ROOM ID SUB-HEADER */}
            <View style={styles.subHeader}>
                <Text style={styles.subHeaderLabel}>Room ID: </Text>
                <Text style={styles.subHeaderValue}>{roomId}</Text>
            </View>

            {/* ERROR BANNER */}
            {error ? (
                <View style={styles.warningBanner}>
                    <Text style={styles.warningText}>{error}</Text>
                </View>
            ) : null}

            {/* CHAT MESSAGES BODY */}
            <KeyboardAvoidingView
                style={styles.chatBody}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                {messages.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>💬</Text>
                        <Text style={styles.emptyTitle}>Welcome to the room</Text>
                        <Text style={styles.emptySub}>
                            Start a conversation with people in this room.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item, idx) => item.id || String(idx)}
                        renderItem={renderItem}
                        contentContainerStyle={styles.messagesList}
                        onContentSizeChange={() => scrollToBottom(true)}
                        onLayout={() => scrollToBottom(false)}
                    />
                )}

                {/* INPUT FOOTER */}
                <View style={styles.inputArea}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Type a message..."
                            placeholderTextColor="#64748b"
                            multiline
                            maxLength={2000}
                            editable={connected}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendBtn,
                                (!connected || !message.trim() || sending) &&
                                    styles.sendBtnDisabled,
                            ]}
                            onPress={sendMessage}
                            disabled={!connected || !message.trim() || sending}
                        >
                            <Ionicons name="send" size={18} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/* =========================
   DARK / GLASSY STYLES
========================= */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    centeredContainer: {
        flex: 1,
        backgroundColor: "#0f172a",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        color: "#94a3b8",
        marginTop: 12,
        fontSize: 15,
    },
    errorTitle: {
        color: "#f87171",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    errorSub: {
        color: "#94a3b8",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: "#6366f1",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: "#ffffff",
        fontWeight: "600",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#1e293b",
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    headerBackBtn: {
        padding: 6,
        marginRight: 8,
    },
    headerTitleArea: {
        flex: 1,
    },
    roomTitle: {
        color: "#f8fafc",
        fontSize: 18,
        fontWeight: "bold",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    dotOnline: {
        backgroundColor: "#22c55e",
    },
    dotOffline: {
        backgroundColor: "#ef4444",
    },
    statusText: {
        color: "#94a3b8",
        fontSize: 12,
    },
    membersBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#334155",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    membersCount: {
        color: "#e2e8f0",
        fontWeight: "600",
        fontSize: 13,
        marginLeft: 6,
    },
    subHeader: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1e293b",
        paddingHorizontal: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
    },
    subHeaderLabel: {
        color: "#64748b",
        fontSize: 13,
    },
    subHeaderValue: {
        color: "#38bdf8",
        fontSize: 13,
        fontWeight: "600",
    },
    warningBanner: {
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(239, 68, 68, 0.3)",
    },
    warningText: {
        color: "#fca5a5",
        fontSize: 12,
        textAlign: "center",
    },
    chatBody: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyIcon: {
        fontSize: 40,
        marginBottom: 12,
    },
    emptyTitle: {
        color: "#f8fafc",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 6,
    },
    emptySub: {
        color: "#64748b",
        fontSize: 14,
        textAlign: "center",
    },
    messagesList: {
        paddingHorizontal: 12,
        paddingVertical: 16,
    },
    messageRow: {
        marginVertical: 4,
        flexDirection: "row",
    },
    mineRow: {
        justifyContent: "flex-end",
    },
    otherRow: {
        justifyContent: "flex-start",
    },
    messageBubble: {
        maxWidth: "80%",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    mineBubble: {
        backgroundColor: "#6366f1",
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: "#334155",
        borderBottomLeftRadius: 4,
    },
    senderName: {
        color: "#38bdf8",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 4,
    },
    messageText: {
        color: "#f8fafc",
        fontSize: 15,
        lineHeight: 20,
    },
    mineText: {
        color: "#ffffff",
    },
    messageTime: {
        color: "#94a3b8",
        fontSize: 10,
        alignSelf: "flex-end",
        marginTop: 4,
    },
    mineTime: {
        color: "#c7d2fe",
    },
    inputArea: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#1e293b",
        borderTopWidth: 1,
        borderTopColor: "#334155",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0f172a",
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === "ios" ? 8 : 4,
        borderWidth: 1,
        borderColor: "#334155",
    },
    textInput: {
        flex: 1,
        color: "#f8fafc",
        fontSize: 15,
        maxHeight: 100,
        paddingHorizontal: 8,
    },
    sendBtn: {
        backgroundColor: "#6366f1",
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    sendBtnDisabled: {
        backgroundColor: "#475569",
        opacity: 0.6,
    },
});