import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { useSelector } from "react-redux";

// Services (pointing to your converted mobile service modules)
import authService from "../../backend/auth";
import recentService from "../../backend/recent";

// Pin Color definitions (matching web)
const PIN_COLORS = {
  image: "#22c55e", // 🟢 Photo
  text: "#a855f7",  // 🟣 Text
  both: "#f59e0b",  // 🟠 Photo + Text
  me: "#3b82f6",    // 🔵 Your Post
};

export default function RecentsMapScreen({ navigation, route }) {
  // Redux user
  const currentUser = useSelector((state) => state.auth.userData);

  // ====================================================
  // STATES
  // ====================================================
  const [recents, setRecents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [authors, setAuthors] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const mapRef = useRef(null);

  // ====================================================
  // CURRENT LOCATION
  // ====================================================
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Location permission denied.");
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch (error) {
        console.error("Location acquisition error:", error);
      }
    })();
  }, []);

  // ====================================================
  // LOAD RECENTS
  // ====================================================
  const loadRecents = async () => {
    try {
      setLoading(true);
      const response = await recentService.allRecent();

      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.recents)) {
        data = response.recents;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response?.data?.recents)) {
        data = response.data.recents;
      }

      setRecents(data);
    } catch (error) {
      console.error("Error loading recents:", error);
      setRecents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecents();
  }, []);

  // ====================================================
  // OPEN RECENT DETAILS / FETCH AUTHOR
  // ====================================================
  const handleOpen = async (item) => {
    setSelected(item);

    // Animate map camera to clicked marker
    if (mapRef.current && item.latitude && item.longitude) {
      mapRef.current.animateToRegion({
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

    if (!item.userID || authors[item.userID]) return;

    try {
      const user = await authService.get_user_by_id(item.userID);
      setAuthors((prev) => ({
        ...prev,
        [item.userID]: user,
      }));
    } catch (error) {
      console.error("Error getting author details:", error);
    }
  };

  // ====================================================
  // DELETE RECENT
  // ====================================================
  const handleDelete = (id) => {
    if (!id || deleting) return;

    Alert.alert(
      "Delete Recent",
      "Are you sure you want to delete this recent post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await recentService.deleteRecent(id);
              setRecents((prev) => prev.filter((item) => item.recentId !== id));
              setSelected(null);
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete recent.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // ====================================================
  // MARKERS COMPUTATION
  // ====================================================
  const markers = useMemo(() => {
    if (!Array.isArray(recents)) return [];

    return recents
      .filter((item) => {
        return (
          item &&
          item.latitude !== null &&
          item.longitude !== null &&
          !Number.isNaN(Number(item.latitude)) &&
          !Number.isNaN(Number(item.longitude))
        );
      })
      .map((item) => {
        const isMe = String(currentUser?.id) === String(item.userID);

        const hasImage =
          item.image !== null &&
          item.image !== undefined &&
          String(item.image).trim() !== "";

        const hasText =
          item.text !== null &&
          item.text !== undefined &&
          String(item.text).trim() !== "";

        let type = "text";
        if (hasImage && hasText) {
          type = "both";
        } else if (hasImage) {
          type = "image";
        }

        const color = isMe ? PIN_COLORS.me : PIN_COLORS[type];

        return {
          ...item,
          isMe,
          type,
          pinColor: color,
        };
      });
  }, [recents, currentUser]);

  const author = selected ? authors[selected.userID] : null;

  return (
    <View style={styles.container}>
      {/* =========================================
          TOP TAB BAR
      ========================================= */}
      <View style={styles.navBar}>
  <TouchableOpacity
    style={[
      styles.navTab,
      route.name === "AllPost" && styles.activeTab,
    ]}
    onPress={() => navigation.navigate("AllPost")}
  >
    <Text
      style={[
        styles.navTabText,
        route.name === "AllPost" && styles.activeTabText,
      ]}
    >
      All Post
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.navTab,
      route.name === "RecentMap" && styles.activeTab,
    ]}
    onPress={() => navigation.navigate("RecentMap")}
  >
    <Text
      style={[
        styles.navTabText,
        route.name === "RecentMap" && styles.activeTabText,
      ]}
    >
      Recents
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.navTab,
      route.name === "Nearby" && styles.activeTab,
    ]}
    onPress={() => navigation.navigate("Nearby")}
  >
    <Text
      style={[
        styles.navTabText,
        route.name === "Nearby" && styles.activeTabText,
      ]}
    >
      Nearby
    </Text>
  </TouchableOpacity>
</View>

      {/* =========================================
          ACTION BAR
      ========================================= */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AddRecent")}
        >
          <Text style={styles.addBtnIcon}>+</Text>
          <Text style={styles.addBtnText}>Add Recent</Text>
        </TouchableOpacity>
      </View>

      {/* =========================================
          MAP CONTAINER
      ========================================= */}
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={{
            latitude: currentLocation ? currentLocation.latitude : 17.385,
            longitude: currentLocation ? currentLocation.longitude : 78.4867,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/* CURRENT LOCATION MARKER */}
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="📍 Current Location"
              description={`${currentLocation.latitude.toFixed(
                5
              )}, ${currentLocation.longitude.toFixed(5)}`}
              pinColor="#2196F3"
            />
          )}

          {/* RECENT MARKERS */}
          {markers.map((item) => (
            <Marker
              key={item.recentId}
              coordinate={{
                latitude: Number(item.latitude),
                longitude: Number(item.longitude),
              }}
              pinColor={item.pinColor}
              onPress={() => handleOpen(item)}
            />
          ))}
        </MapView>

        {/* LOADING INDICATOR */}
        {loading && (
          <View style={styles.statusBox}>
            <ActivityIndicator color="#E50914" size="small" />
            <Text style={styles.statusText}>Loading recents...</Text>
          </View>
        )}

        {/* EMPTY STATE */}
        {!loading && markers.length === 0 && (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>No recent posts available.</Text>
          </View>
        )}

        {/* =========================================
            LEGEND OVERLAY
        ========================================= */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Recents</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PIN_COLORS.me }]} />
            <Text style={styles.legendText}>Your Post</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PIN_COLORS.image }]} />
            <Text style={styles.legendText}>Photo</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PIN_COLORS.text }]} />
            <Text style={styles.legendText}>Text</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PIN_COLORS.both }]} />
            <Text style={styles.legendText}>Photo + Text</Text>
          </View>
        </View>
      </View>

      {/* =========================================
          SELECTED RECENT MODAL / CARD
      ========================================= */}
      {selected && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selected}
          onRequestClose={() => setSelected(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelected(null)}
          >
            <View
              style={styles.popupCard}
              onStartShouldSetResponder={() => true}
            >
              {/* USER INFO */}
              <View style={styles.userInfoRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {author?.username
                      ? author.username.charAt(0).toUpperCase()
                      : "U"}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userNameText}>
                    {author?.username || "Loading..."}
                  </Text>
                  <Text style={styles.userSubText}>Location Recent</Text>
                </View>
              </View>

              {/* IMAGE */}
              {selected.image ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: selected.image }}
                    style={styles.popupImage}
                    resizeMode="cover"
                  />
                </View>
              ) : null}

              {/* TEXT */}
              {selected.text ? (
                <Text style={styles.popupText}>{selected.text}</Text>
              ) : null}

              {/* LOCATION COORDINATES */}
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <View>
                  <Text style={styles.locationLabel}>Current Location</Text>
                  <Text style={styles.locationCoords}>
                    {Number(selected.latitude).toFixed(5)},{" "}
                    {Number(selected.longitude).toFixed(5)}
                  </Text>
                </View>
              </View>

              {/* DELETE BUTTON (OWNER ONLY) */}
              {String(currentUser?.id) === String(selected.userID) && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(selected.recentId)}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.deleteBtnText}>🗑 Delete Recent</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 10,
  },
  navBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  navBar: {
  flexDirection: "row",
  backgroundColor: "#fff",
  padding: 5,
  borderRadius: 12,
  marginHorizontal: 15,
  marginVertical: 10,
  elevation: 3,
},

navTab: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 12,
  borderRadius: 10,
},

activeTab: {
  backgroundColor: "#6C63FF",
},

navTabText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#555",
},

activeTabText: {
  color: "#fff",
},
  actionBar: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333333",
  },
  addBtnIcon: {
    color: "#E50914",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 6,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  mapWrapper: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  statusBox: {
    position: "absolute",
    top: 16,
    alignSelf: "center",
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginLeft: 6,
  },
  legendContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "rgba(20, 20, 20, 0.88)",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333333",
  },
  legendTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    color: "#CCCCCC",
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  popupCard: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333333",
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  userNameText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  userSubText: {
    color: "#AAAAAA",
    fontSize: 12,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  popupImage: {
    width: "100%",
    height: "100%",
  },
  popupText: {
    color: "#EEEEEE",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  locationLabel: {
    color: "#AAAAAA",
    fontSize: 10,
  },
  locationCoords: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  deleteBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});