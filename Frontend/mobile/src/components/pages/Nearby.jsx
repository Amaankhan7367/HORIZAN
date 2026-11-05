import React, { useEffect, useState, useRef } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { useSelector } from "react-redux";

import nearby from "../../backend/nearby";
import userApi from "../../backend/auth";


const { width } = Dimensions.get("window");

function Nearby() {
  const route = useRoute();
  const navigation = useNavigation();
  // =================================================
  // REDUX USER
  // =================================================
  const userData = useSelector((state) => state.auth.userData);
  const userId = userData?.id;

  // =================================================
  // REFS & STATES
  // =================================================
  const mapRef = useRef(null);

  const [enabled, setEnabled] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userNames, setUserNames] = useState({});

  // =================================================
  // GET CURRENT LOCATION (EXPO LOCATION)
  // =================================================
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permission to access location was denied.");
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  // =================================================
  // GET MY NEARBY DATA
  // =================================================
  const loadMyNearby = async () => {
    if (!userId) return;

    try {
      const response = await nearby.getMyNearby(userId);

      if (response?.latitude != null && response?.longitude != null) {
        const coords = {
          latitude: Number(response.latitude),
          longitude: Number(response.longitude),
        };
        setMyLocation(coords);
        setEnabled(response.location_enabled === true);
      }
    } catch (err) {
      if (err?.response?.status !== 404) {
        console.error("Load my nearby error:", err);
      }
    }
  };

  // =================================================
  // GET USERNAME FROM USER ID
  // =================================================
  const getUsername = async (id) => {
    if (userNames[id]) {
      return userNames[id];
    }

    try {
      const response = await userApi.get_user_by_id(id);
      const username =
        response?.username || response?.name || "HORIZAN User";

      setUserNames((previous) => ({
        ...previous,
        [id]: username,
      }));

      return username;
    } catch (err) {
      console.error("Username fetch error:", id, err);
      setUserNames((previous) => ({
        ...previous,
        [id]: "HORIZAN User",
      }));
      return "HORIZAN User";
    }
  };

  // =================================================
  // LOAD NEARBY USERS
  // =================================================
  const loadNearbyUsers = async () => {
    if (!userId) return;

    try {
      const response = await nearby.getNearbyUsers(userId);
      const users = Array.isArray(response) ? response : [];

      const validUsers = users.filter(
        (item) =>
          item?.userId &&
          item?.latitude != null &&
          item?.longitude != null &&
          item.userId !== userId
      );

      const usersWithNames = await Promise.all(
        validUsers.map(async (item) => {
          const username = await getUsername(item.userId);
          return {
            ...item,
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            username,
          };
        })
      );

      setNearbyUsers(usersWithNames);
    } catch (err) {
      console.error("Load nearby users error:", err);
      setNearbyUsers([]);
    }
  };

  // =================================================
  // ENABLE NEARBY
  // =================================================
  const enableNearby = async () => {
    if (!userId) {
      setError("User information not available.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const location = await getCurrentLocation();
      const nearbyData = {
        latitude: location.latitude,
        longitude: location.longitude,
        location_enabled: true,
      };

      let existing = null;
      try {
        existing = await nearby.getMyNearby(userId);
      } catch (err) {
        if (err?.response?.status !== 404) throw err;
      }

      if (existing) {
        await nearby.updateNearby(nearbyData, userId);
      } else {
        await nearby.createNearby(nearbyData, userId);
      }

      setMyLocation(location);
      setEnabled(true);

      // Animate map camera to current location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }

      await loadNearbyUsers();
    } catch (err) {
      console.error("Enable nearby error:", err);
      setError(err?.message || "Unable to enable Nearby.");
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  // =================================================
  // DISABLE NEARBY
  // =================================================
  const disableNearby = async () => {
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      await nearby.updateNearbyStatus(false, userId);
      setEnabled(false);
      setNearbyUsers([]);
    } catch (err) {
      console.error("Disable nearby error:", err);
      setError("Unable to disable Nearby.");
    } finally {
      setLoading(false);
    }
  };

  // =================================================
  // TOGGLE
  // =================================================
  const handleToggle = async () => {
    if (loading) return;

    if (enabled) {
      await disableNearby();
    } else {
      await enableNearby();
    }
  };

  // =================================================
  // INITIAL LOAD & POLLING
  // =================================================
  useEffect(() => {
    if (userId) {
      loadMyNearby();
    }
  }, [userId]);

  useEffect(() => {
    if (!enabled || !userId) return;

    loadNearbyUsers();

    const interval = setInterval(() => {
      loadNearbyUsers();
    }, 5000);

    return () => clearInterval(interval);
  }, [enabled, userId]);

  // =================================================
  // REGION CONFIG
  // =================================================
  const initialRegion = myLocation
    ? {
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 17.385,
        longitude: 78.4867,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  // =================================================
  // UI
  // =================================================
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
  <TouchableOpacity
    style={[styles.navTab, route.name === "AllPost" && styles.activeTab]}
    onPress={() => navigation.navigate("AllPost")}
  >
    <Text style={[styles.navTabText, route.name === "AllPost" && styles.activeTabText]}>
      All Post
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.navTab, route.name === "RecentMap" && styles.activeTab]}
    onPress={() => navigation.navigate("RecentMap")}
  >
    <Text style={[styles.navTabText, route.name === "RecentMap" && styles.activeTabText]}>
      Recents
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.navTab, route.name === "Nearby" && styles.activeTab]}
    onPress={() => navigation.navigate("Nearby")}
  >
    <Text style={[styles.navTabText, route.name === "Nearby" && styles.activeTabText]}>
      Nearby
    </Text>
  </TouchableOpacity>
</View>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Nearby</Text>
          <Text style={styles.headerSubtitle}>
            Discover HORIZAN users around you
          </Text>
        </View>

        {/* TOGGLE BUTTON */}
        <TouchableOpacity
          style={[styles.toggleBtn, enabled && styles.toggleBtnActive]}
          onPress={handleToggle}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.toggleBtnText}>
              {enabled ? "Nearby ON" : "Nearby OFF"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ERROR MSG */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* MAP / OFF STATE */}
      {enabled && myLocation ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={false}
          >
            {/* RADIUS CIRCLE */}
            <Circle
              center={myLocation}
              radius={500}
              fillColor="rgba(0, 122, 255, 0.12)"
              strokeColor="rgba(0, 122, 255, 0.4)"
              strokeWidth={1}
            />

            {/* MY LOCATION MARKER */}
            <Marker
              coordinate={myLocation}
              title="Your Location"
              description="Nearby is ON"
              pinColor="blue"
            />

            {/* NEARBY USERS MARKERS */}
            {nearbyUsers.map((user) => (
              <Marker
                key={user.userId}
                coordinate={{
                  latitude: user.latitude,
                  longitude: user.longitude,
                }}
                title={`@${user.username}`}
                description="HORIZAN user"
                pinColor="red"
              />
            ))}
          </MapView>

          {/* OVERLAY INFO CARD */}
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoNumber}>{nearbyUsers.length}</Text>
              <Text style={styles.infoLabel}>Nearby users</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoNumber}>500m</Text>
              <Text style={styles.infoLabel}>Nearby radius</Text>
            </View>
          </View>
        </View>
      ) : (
        /* OFF SCREEN */
        <View style={styles.offContainer}>
          <Text style={styles.offIcon}>📍</Text>
          <Text style={styles.offTitle}>Nearby is turned off</Text>
          <Text style={styles.offDescription}>
            Turn on Nearby to see HORIZAN users around your location.
          </Text>

          <TouchableOpacity
            style={styles.turnOnBtn}
            onPress={handleToggle}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.turnOnBtnText}>Turn On Nearby</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// =====================================================
// STYLESHEET
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: "#1e293b",
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  toggleBtn: {
    backgroundColor: "#475569",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: "#2563eb",
  },
  toggleBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13,
  },
  errorContainer: {
    backgroundColor: "#7f1d1d",
    padding: 10,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
  },
  errorText: {
    color: "#fecaca",
    fontSize: 13,
    textAlign: "center",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  infoCard: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    flexDirection: "row",
    paddingVertical: 14,
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  infoItem: {
    alignItems: "center",
  },
  infoNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  infoLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  infoDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "#334155",
  },
  offContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  offIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  offTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  offDescription: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 24,
  },
  turnOnBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  turnOnBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
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
});

export default Nearby;