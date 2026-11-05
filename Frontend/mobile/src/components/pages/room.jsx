import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import roomService from "../../backend/room";
import { getCurrentLocation } from "../../backend/location";

export default function Room({ navigation }) {
    const [rooms, setRooms] = useState([]);
    const [roomName, setRoomName] = useState("");

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [joiningRoom, setJoiningRoom] = useState(null);

    const [showCreate, setShowCreate] = useState(false);

    // =========================
    // LOAD ROOMS
    // =========================

    const loadRooms = async () => {
        try {
            setLoading(true);

            const data = await roomService.get_rooms();

            setRooms(data || []);
        } catch (error) {
            console.error(
                "Load rooms error:",
                error.response?.data || error.message
            );

            Alert.alert(
                "Error",
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
            Alert.alert("Room Name", "Please enter a room name");
            return;
        }

        try {
            setCreating(true);

            // Get current location
            const location = await getCurrentLocation();

            console.log("Location:", location);

            // Create room
            const data = await roomService.createRoom(
                roomName.trim(),
                location.latitude,
                location.longitude
            );

            console.log("Room created:", data);

            setRoomName("");
            setShowCreate(false);

            Alert.alert(
                "Success",
                `Room "${data.name}" created successfully`
            );

            await loadRooms();

        } catch (error) {
            console.error(
                "Create room error:",
                error.response?.data || error.message
            );

            Alert.alert(
                "Error",
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

    const handleJoinRoom = async (roomId) => {
        try {
            console.log("1. JOIN CLICKED:", roomId);

            setJoiningRoom(roomId);

            console.log("2. Getting location...");

            const location = await getCurrentLocation();

            console.log("3. LOCATION:", location);

            console.log("4. Calling join API...");

            const response =
                await roomService.join_existing_room(
                    roomId,
                    location.latitude,
                    location.longitude
                );

            console.log("5. JOIN RESPONSE:", response);

            Alert.alert(
                "Success",
                `Successfully joined room ${roomId}`,
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // ROOM CHAT
                            navigation.navigate(
                                "RoomChat",
                                {
                                    roomId: roomId,
                                }
                            );
                        },
                    },
                ]
            );

        } catch (error) {
            console.error(
                "JOIN ROOM ERROR:",
                error.response?.data || error.message
            );

            Alert.alert(
                "Unable to Join",
                error.response?.data?.detail ||
                    error.message ||
                    "Failed to join room"
            );
        } finally {
            setJoiningRoom(null);
        }
    };

    // =========================
    // FORMAT TIME
    // =========================

    const formatExpiry = (date) => {
        if (!date) return "Unknown";

        return new Date(date).toLocaleString([], {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // =========================
    // ROOM CARD
    // =========================

    const renderRoom = (room) => {
        const roomId =
            room?.roomId ||
            room?.id ||
            room?._id;

        return (
            <View
                key={roomId}
                style={styles.roomCard}
            >
                {/* TOP */}
                <View style={styles.roomCardTop}>

                    <View style={styles.roomIcon}>
                        <Ionicons
                            name="people"
                            size={24}
                            color="#ffffff"
                        />
                    </View>

                    <View style={styles.activeContainer}>
                        <View style={styles.activeDot} />

                        <Text style={styles.activeText}>
                            Active
                        </Text>
                    </View>

                </View>

                {/* ROOM NAME */}

                <Text style={styles.roomName}>
                    {room.name}
                </Text>

                {/* ROOM ID */}

                <View style={styles.roomIdContainer}>
                    <Text style={styles.roomIdLabel}>
                        ROOM ID
                    </Text>

                    <Text style={styles.roomId}>
                        {roomId}
                    </Text>
                </View>

                {/* DETAILS */}

                <View style={styles.detailsContainer}>

                    <View style={styles.detailRow}>

                        <Ionicons
                            name="location-outline"
                            size={18}
                            color="#8b5cf6"
                        />

                        <Text style={styles.detailText}>
                            500m radius
                        </Text>

                    </View>

                    <View style={styles.detailRow}>

                        <Ionicons
                            name="time-outline"
                            size={18}
                            color="#8b5cf6"
                        />

                        <Text style={styles.detailText}>
                            Expires{" "}
                            {formatExpiry(
                                room.expiresAt
                            )}
                        </Text>

                    </View>

                </View>

                {/* JOIN */}

                <TouchableOpacity
                    style={[
                        styles.joinButton,
                        joiningRoom === roomId &&
                            styles.joinButtonDisabled,
                    ]}
                    disabled={
                        joiningRoom === roomId
                    }
                    onPress={() => {
                        console.log(
                            "Direct button clicked:",
                            room
                        );

                        if (!roomId) {
                            Alert.alert(
                                "Error",
                                "Room ID is missing"
                            );

                            return;
                        }

                        handleJoinRoom(roomId);
                    }}
                >
                    {joiningRoom === roomId ? (
                        <ActivityIndicator
                            color="#ffffff"
                        />
                    ) : (
                        <Text style={styles.joinButtonText}>
                            Join Room
                        </Text>
                    )}
                </TouchableOpacity>

            </View>
        );
    };

    // =========================
    // UI
    // =========================

    return (
        <View style={styles.container}>

            {/* ================= NAV ================= */}

            <View style={styles.nav}>

                <TouchableOpacity
                    style={styles.navTab}
                    onPress={() =>
                        navigation.navigate("Inbox")
                    }
                >
                    <Ionicons
                        name="chatbubbles-outline"
                        size={20}
                        color="#9ca3af"
                    />

                    <Text style={styles.navText}>
                        Message
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.navTab,
                        styles.activeNavTab,
                    ]}
                    onPress={() =>
                        navigation.navigate("Room")
                    }
                >
                    <Ionicons
                        name="people-outline"
                        size={20}
                        color="#ffffff"
                    />

                    <Text style={styles.activeNavText}>
                        Room
                    </Text>
                </TouchableOpacity>

            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={
                    styles.scrollContent
                }
                showsVerticalScrollIndicator={false}
            >

                {/* ================= HEADER ================= */}

                <View style={styles.header}>

                    <View style={styles.titleSection}>

                        <View style={styles.titleIcon}>
                            <Ionicons
                                name="people"
                                size={28}
                                color="#ffffff"
                            />
                        </View>

                        <View>
                            <Text style={styles.title}>
                                Rooms
                            </Text>

                            <Text style={styles.subtitle}>
                                Connect with people around you
                            </Text>
                        </View>

                    </View>

                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => {
                            setShowCreate(true);
                        }}
                    >
                        <Ionicons
                            name="add"
                            size={22}
                            color="#ffffff"
                        />

                        <Text style={styles.createButtonText}>
                            Create
                        </Text>
                    </TouchableOpacity>

                </View>

                {/* ================= CREATE ROOM ================= */}

                {showCreate && (
                    <View style={styles.createCard}>

                        <View style={styles.createTop}>

                            <View style={{ flex: 1 }}>
                                <Text style={styles.createTitle}>
                                    Create a Room
                                </Text>

                                <Text style={styles.createDescription}>
                                    Your current location will be
                                    used as the room location.
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => {
                                    setShowCreate(false);
                                    setRoomName("");
                                }}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color="#9ca3af"
                                />
                            </TouchableOpacity>

                        </View>

                        {/* INPUT */}

                        <View style={styles.inputWrapper}>

                            <TextInput
                                style={styles.input}
                                placeholder="Enter room name..."
                                placeholderTextColor="#6b7280"
                                value={roomName}
                                maxLength={50}
                                onChangeText={setRoomName}
                            />

                            <Text style={styles.counter}>
                                {roomName.length}/50
                            </Text>

                        </View>

                        {/* INFO */}

                        <View style={styles.infoContainer}>

                            <View style={styles.infoRow}>

                                <Ionicons
                                    name="location-outline"
                                    size={18}
                                    color="#8b5cf6"
                                />

                                <Text style={styles.infoText}>
                                    500m join radius
                                </Text>

                            </View>

                            <View style={styles.infoRow}>

                                <Ionicons
                                    name="time-outline"
                                    size={18}
                                    color="#8b5cf6"
                                />

                                <Text style={styles.infoText}>
                                    Expires after 24 hours
                                </Text>

                            </View>

                        </View>

                        {/* CREATE */}

                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                (creating ||
                                    !roomName.trim()) &&
                                    styles.disabledButton,
                            ]}
                            disabled={
                                creating ||
                                !roomName.trim()
                            }
                            onPress={handleCreateRoom}
                        >
                            {creating ? (
                                <ActivityIndicator
                                    color="#ffffff"
                                />
                            ) : (
                                <Text style={styles.confirmText}>
                                    Create Room
                                </Text>
                            )}
                        </TouchableOpacity>

                    </View>
                )}

                {/* ================= ROOM SECTION ================= */}

                <View style={styles.roomsSection}>

                    <View style={styles.sectionHeader}>

                        <View>
                            <Text style={styles.sectionTitle}>
                                Nearby Rooms
                            </Text>

                            <Text style={styles.sectionSubtitle}>
                                Join a room within 500 meters
                            </Text>
                        </View>

                        <View style={styles.roomCount}>
                            <Text style={styles.roomCountText}>
                                {rooms.length}
                            </Text>
                        </View>

                    </View>

                    {/* ================= LOADING ================= */}

                    {loading && (
                        <View style={styles.stateContainer}>

                            <ActivityIndicator
                                size="large"
                                color="#8b5cf6"
                            />

                            <Text style={styles.stateText}>
                                Loading active rooms...
                            </Text>

                        </View>
                    )}

                    {/* ================= EMPTY ================= */}

                    {!loading &&
                        rooms.length === 0 && (
                            <View style={styles.emptyContainer}>

                                <View style={styles.emptyIcon}>
                                    <Ionicons
                                        name="people-outline"
                                        size={40}
                                        color="#8b5cf6"
                                    />
                                </View>

                                <Text style={styles.emptyTitle}>
                                    No active rooms
                                </Text>

                                <Text style={styles.emptyText}>
                                    Create the first room around
                                    your current location.
                                </Text>

                                <TouchableOpacity
                                    style={styles.emptyButton}
                                    onPress={() =>
                                        setShowCreate(true)
                                    }
                                >
                                    <Ionicons
                                        name="add"
                                        size={20}
                                        color="#ffffff"
                                    />

                                    <Text style={styles.emptyButtonText}>
                                        Create Room
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        )}

                    {/* ================= ROOMS ================= */}

                    {!loading &&
                        rooms.length > 0 && (
                            <View>
                                {rooms.map(renderRoom)}
                            </View>
                        )}

                </View>

            </ScrollView>

        </View>
    );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#080b14",
    },

    scroll: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 40,
    },

    // ================= NAV =================

    nav: {
        flexDirection: "row",
        marginHorizontal: 16,
        marginTop: 15,
        marginBottom: 10,
        padding: 5,
        borderRadius: 14,
        backgroundColor: "#111522",
    },

    navTab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        paddingVertical: 12,
        borderRadius: 10,
    },

    activeNavTab: {
        backgroundColor: "#242938",
    },

    navText: {
        color: "#9ca3af",
        fontSize: 15,
        fontWeight: "600",
    },

    activeNavText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },

    // ================= HEADER =================

    header: {
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    titleSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    titleIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: "#6d28d9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    title: {
        color: "#ffffff",
        fontSize: 28,
        fontWeight: "800",
    },

    subtitle: {
        color: "#9ca3af",
        fontSize: 13,
        marginTop: 3,
    },

    createButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#6d28d9",
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 12,
        gap: 5,
    },

    createButtonText: {
        color: "#ffffff",
        fontWeight: "700",
    },

    // ================= CREATE =================

    createCard: {
        marginHorizontal: 16,
        marginBottom: 20,
        padding: 18,
        borderRadius: 18,
        backgroundColor: "#111522",
        borderWidth: 1,
        borderColor: "#292e3d",
    },

    createTop: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 18,
    },

    createTitle: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
    },

    createDescription: {
        color: "#9ca3af",
        fontSize: 13,
        marginTop: 5,
        lineHeight: 19,
    },

    inputWrapper: {
        position: "relative",
        marginBottom: 18,
    },

    input: {
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#303647",
        backgroundColor: "#0b0f19",
        color: "#ffffff",
        paddingHorizontal: 15,
        paddingRight: 55,
        fontSize: 15,
    },

    counter: {
        position: "absolute",
        right: 14,
        top: 17,
        color: "#6b7280",
        fontSize: 12,
    },

    infoContainer: {
        gap: 12,
        marginBottom: 18,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
    },

    infoText: {
        color: "#c4c8d2",
        fontSize: 13,
    },

    confirmButton: {
        height: 50,
        borderRadius: 12,
        backgroundColor: "#6d28d9",
        justifyContent: "center",
        alignItems: "center",
    },

    confirmText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "700",
    },

    disabledButton: {
        opacity: 0.45,
    },

    // ================= SECTION =================

    roomsSection: {
        paddingHorizontal: 16,
    },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },

    sectionTitle: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
    },

    sectionSubtitle: {
        color: "#777f91",
        fontSize: 13,
        marginTop: 3,
    },

    roomCount: {
        minWidth: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#20183b",
        justifyContent: "center",
        alignItems: "center",
    },

    roomCountText: {
        color: "#a78bfa",
        fontWeight: "700",
    },

    // ================= ROOM CARD =================

    roomCard: {
        backgroundColor: "#111522",
        borderRadius: 18,
        padding: 17,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#272d3c",
    },

    roomCardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    roomIcon: {
        width: 45,
        height: 45,
        borderRadius: 14,
        backgroundColor: "#6d28d9",
        justifyContent: "center",
        alignItems: "center",
    },

    activeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#22c55e",
    },

    activeText: {
        color: "#22c55e",
        fontSize: 12,
        fontWeight: "600",
    },

    roomName: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
        marginTop: 15,
    },

    roomIdContainer: {
        marginTop: 12,
        padding: 12,
        borderRadius: 10,
        backgroundColor: "#0b0f19",
    },

    roomIdLabel: {
        color: "#6b7280",
        fontSize: 10,
        fontWeight: "700",
    },

    roomId: {
        color: "#a78bfa",
        fontSize: 17,
        fontWeight: "800",
        letterSpacing: 2,
        marginTop: 4,
    },

    detailsContainer: {
        marginTop: 15,
        gap: 10,
    },

    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
    },

    detailText: {
        color: "#aeb4c1",
        fontSize: 13,
    },

    joinButton: {
        height: 48,
        marginTop: 17,
        borderRadius: 12,
        backgroundColor: "#6d28d9",
        justifyContent: "center",
        alignItems: "center",
    },

    joinButtonDisabled: {
        opacity: 0.6,
    },

    joinButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "700",
    },

    // ================= STATES =================

    stateContainer: {
        alignItems: "center",
        paddingVertical: 50,
    },

    stateText: {
        color: "#8d94a3",
        marginTop: 12,
        fontSize: 14,
    },

    emptyContainer: {
        alignItems: "center",
        paddingVertical: 50,
        paddingHorizontal: 30,
    },

    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 25,
        backgroundColor: "#171329",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },

    emptyTitle: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
    },

    emptyText: {
        color: "#8d94a3",
        textAlign: "center",
        marginTop: 7,
        lineHeight: 20,
    },

    emptyButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#6d28d9",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 18,
    },

    emptyButtonText: {
        color: "#ffffff",
        fontWeight: "700",
    },
});