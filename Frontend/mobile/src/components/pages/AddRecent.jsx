import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    ScrollView,
    Alert,
} from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import recent from "../../backend/recent"; // Tera converted mobile Recents service

export default function AddRecentScreen({ navigation }) {
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [location, setLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =================================================
    // GET CURRENT LOCATION
    // =================================================
    useEffect(() => {
        getLocationPermissionAndPosition();
    }, []);

    const getLocationPermissionAndPosition = async () => {
        setLocationLoading(true);
        setError("");

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                setError("Location permission is required to create a Live Post.");
                setLocationLoading(false);
                return;
            }

            const currentPosition = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            setLocation({
                latitude: currentPosition.coords.latitude,
                longitude: currentPosition.coords.longitude,
            });
        } catch (err) {
            console.error("Location error:", err);
            setError("Location permission is required to create a Live Post.");
        } finally {
            setLocationLoading(false);
        }
    };

    // =================================================
    // IMAGE PICKER (Gallery / Camera)
    // =================================================
    const handlePickImage = async (useCamera = false) => {
        setError("");

        try {
            const permissionResult = useCamera
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                setError("Permission to access media/camera was denied.");
                return;
            }

            const result = useCamera
                ? await ImagePicker.launchCameraAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      quality: 0.7,
                      base64: true,
                  })
                : await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      quality: 0.7,
                      base64: true,
                  });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                // Web ki tarah Data URL string bana rahe hain taaki backend same receive kare
                const mimeType = asset.mimeType || "image/jpeg";
                const base64Data = `data:${mimeType};base64,${asset.base64}`;
                setImage(base64Data);
            }
        } catch (err) {
            console.error("Image pick error:", err);
            setError("Failed to select image.");
        }
    };

    // =================================================
    // REMOVE IMAGE
    // =================================================
    const removeImage = () => {
        setImage(null);
    };

    // =================================================
    // CREATE RECENT (Submit)
    // =================================================
    const handleSubmit = async () => {
        setError("");
        setSuccess("");

        // Location check
        if (!location) {
            setError("Your current location is required.");
            return;
        }

        // Content check
        if (!text.trim() && !image) {
            setError("Add some text or select an image.");
            return;
        }

        setLoading(true);

        try {
            // TEXT ONLY
            if (text.trim() && !image) {
                await recent.addTextRecent({
                    text: text.trim(),
                    latitude: location.latitude,
                    longitude: location.longitude,
                });
            }
            // IMAGE / IMAGE + TEXT
            else {
                await recent.addImageRecent({
                    image: image,
                    text: text.trim() || null,
                    latitude: location.latitude,
                    longitude: location.longitude,
                });
            }

            setSuccess("Live Post created successfully!");
            setText("");
            removeImage();

            // Go back after short delay (Web `navigate("/recents")` ka counterpart)
            setTimeout(() => {
                if (navigation && navigation.canGoBack()) {
                    navigation.goBack();
                } else if (navigation) {
                    navigation.navigate("Recents");
                }
            }, 1000);
        } catch (err) {
            console.error("Failed to create recent:", err);
            setError(
                err?.response?.data?.detail || "Failed to create Live Post."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* =========================================
                HEADER
            ========================================= */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation && navigation.goBack()}
                >
                    <Text style={styles.backBtnText}>←</Text>
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <Text style={styles.title}>Add Recent</Text>
                    <Text style={styles.subtitle}>
                        Share what is happening right now.
                    </Text>
                </View>
            </View>

            {/* =========================================
                FORM CARD
            ========================================= */}
            <View style={styles.card}>
                {/* LOCATION BOX */}
                <View style={styles.locationBox}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <View style={styles.locationTextWrapper}>
                        <Text style={styles.locationTitle}>Current Location</Text>
                        <Text style={styles.locationSub}>
                            {locationLoading
                                ? "Getting your location..."
                                : location
                                ? "Location attached automatically"
                                : "Location unavailable"}
                        </Text>
                    </View>
                    {location && (
                        <Text style={styles.locationCheck}>✓</Text>
                    )}
                </View>

                {/* TEXT INPUT */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>What's happening?</Text>
                    <TextInput
                        style={styles.textarea}
                        value={text}
                        onChangeText={setText}
                        placeholder="Share something happening here..."
                        placeholderTextColor="#888"
                        multiline
                        maxLength={500}
                    />
                    <Text style={styles.characterCount}>{text.length}/500</Text>
                </View>

                {/* IMAGE INPUT & PREVIEW */}
                <View style={styles.imageSection}>
                    <Text style={styles.label}>Add Image</Text>

                    {!image ? (
                        <View style={styles.mediaActionsRow}>
                            <TouchableOpacity
                                style={styles.imageSelectBtn}
                                onPress={() => handlePickImage(false)}
                            >
                                <Text style={styles.uploadIcon}>🖼️</Text>
                                <Text style={styles.btnText}>Gallery</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.imageSelectBtn}
                                onPress={() => handlePickImage(true)}
                            >
                                <Text style={styles.uploadIcon}>📷</Text>
                                <Text style={styles.btnText}>Camera</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.imagePreviewContainer}>
                            <Image
                                source={{ uri: image }}
                                style={styles.imagePreview}
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                style={styles.removeImageBtn}
                                onPress={removeImage}
                            >
                                <Text style={styles.removeText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* ERROR MESSAGE */}
                {error ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {/* SUCCESS MESSAGE */}
                {success ? (
                    <View style={styles.successBox}>
                        <Text style={styles.successText}>✓ {success}</Text>
                    </View>
                ) : null}

                {/* SUBMIT BUTTON */}
                <TouchableOpacity
                    style={[
                        styles.publishBtn,
                        (loading || locationLoading || !location) &&
                            styles.disabledBtn,
                    ]}
                    onPress={handleSubmit}
                    disabled={loading || locationLoading || !location}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.publishBtnText}>
                            🔴 Publish Live Post
                        </Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.expiryInfo}>
                    ⏱️ Live Posts automatically disappear after 24 hours.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#121212",
        flexGrow: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        marginTop: 10,
    },
    backBtn: {
        paddingRight: 15,
        paddingVertical: 5,
    },
    backBtnText: {
        fontSize: 24,
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    headerTitleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    subtitle: {
        fontSize: 13,
        color: "#AAAAAA",
        marginTop: 2,
    },
    card: {
        backgroundColor: "#1E1E1E",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#2C2C2C",
    },
    locationBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2A2A2A",
        padding: 12,
        borderRadius: 8,
        marginBottom: 18,
    },
    locationIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    locationTextWrapper: {
        flex: 1,
    },
    locationTitle: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold",
    },
    locationSub: {
        color: "#AAAAAA",
        fontSize: 12,
        marginTop: 2,
    },
    locationCheck: {
        color: "#4CAF50",
        fontSize: 18,
        fontWeight: "bold",
    },
    inputSection: {
        marginBottom: 18,
    },
    label: {
        color: "#DDDDDD",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    textarea: {
        backgroundColor: "#2A2A2A",
        color: "#FFFFFF",
        borderRadius: 8,
        padding: 12,
        minHeight: 110,
        textAlignVertical: "top",
        fontSize: 14,
    },
    characterCount: {
        color: "#888888",
        fontSize: 12,
        textAlign: "right",
        marginTop: 4,
    },
    imageSection: {
        marginBottom: 18,
    },
    mediaActionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    imageSelectBtn: {
        flex: 0.48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2A2A2A",
        borderWidth: 1,
        borderColor: "#3A3A3A",
        borderStyle: "dashed",
        borderRadius: 8,
        paddingVertical: 14,
    },
    uploadIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    btnText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
    },
    imagePreviewContainer: {
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        marginTop: 4,
    },
    imagePreview: {
        width: "100%",
        height: 200,
        borderRadius: 8,
    },
    removeImageBtn: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "rgba(0,0,0,0.75)",
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    removeText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
        lineHeight: 20,
    },
    errorBox: {
        backgroundColor: "rgba(244, 67, 54, 0.15)",
        borderColor: "#F44336",
        borderWidth: 1,
        borderRadius: 6,
        padding: 10,
        marginBottom: 14,
    },
    errorText: {
        color: "#FF6B6B",
        fontSize: 13,
    },
    successBox: {
        backgroundColor: "rgba(76, 175, 80, 0.15)",
        borderColor: "#4CAF50",
        borderWidth: 1,
        borderRadius: 6,
        padding: 10,
        marginBottom: 14,
    },
    successText: {
        color: "#81C784",
        fontSize: 13,
    },
    publishBtn: {
        backgroundColor: "#E50914",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 4,
    },
    disabledBtn: {
        backgroundColor: "#555555",
        opacity: 0.6,
    },
    publishBtnText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "bold",
    },
    expiryInfo: {
        color: "#888888",
        fontSize: 12,
        textAlign: "center",
        marginTop: 14,
    },
});