import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    useMap,
} from "react-leaflet";

import L from "leaflet";

import nearby from "../backend/nearby";
import userApi from "../backend/auth";

import "leaflet/dist/leaflet.css";
import "./Nearby.css"


// =====================================================
// LEAFLET DEFAULT ICON FIX
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// =====================================================
// MAP CENTER
// =====================================================

function MapCenter({ position }) {
    
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, 16);
        }
    }, [position, map]);

    return null;
}


// =====================================================
// NEARBY COMPONENT
// =====================================================

function Nearby() {
const navigate = useNavigate();
    // =================================================
    // REDUX USER
    // =================================================

    const userData = useSelector(
        (state) => state.auth.userData
    );

    const userId = userData?.id;


    // =================================================
    // STATES
    // =================================================

    const [enabled, setEnabled] = useState(false);

    const [myLocation, setMyLocation] = useState(null);

    const [nearbyUsers, setNearbyUsers] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    // userId -> username
    const [userNames, setUserNames] = useState({});


    // =================================================
    // GET CURRENT LOCATION
    // =================================================

    const getCurrentLocation = () => {

        return new Promise((resolve, reject) => {

            if (!navigator.geolocation) {

                reject(
                    new Error(
                        "Geolocation is not supported."
                    )
                );

                return;
            }


            navigator.geolocation.getCurrentPosition(

                (position) => {

                    resolve({
                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude,
                    });

                },

                (err) => {

                    console.error(
                        "Location error:",
                        err
                    );

                    reject(
                        new Error(
                            "Unable to get your current location."
                        )
                    );
                },

                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0,
                }
            );
        });
    };


    // =================================================
    // GET MY NEARBY DATA
    // =================================================

    const loadMyNearby = async () => {

        if (!userId) {
            return;
        }

        try {

            const response =
                await nearby.getMyNearby(userId);


            if (
                response?.latitude != null &&
                response?.longitude != null
            ) {

                setMyLocation({
                    latitude: Number(
                        response.latitude
                    ),

                    longitude: Number(
                        response.longitude
                    ),
                });

                setEnabled(
                    response.location_enabled === true
                );
            }

        } catch (err) {

            // 404 simply means no Nearby record yet
            if (err?.response?.status !== 404) {

                console.error(
                    "Load my nearby error:",
                    err
                );
            }
        }
    };


    // =================================================
    // GET USERNAME FROM USER ID
    // =================================================

    const getUsername = async (id) => {

        // Already loaded
        if (userNames[id]) {
            return userNames[id];
        }


        try {

            const response =
                await userApi.get_user_by_id(id);


            /*
                Depending on your backend response,
                username can be directly available as:

                {
                    username: "test123"
                }

                or inside another object.
            */

            const username =
                response?.username ||
                response?.name ||
                "HORIZAN User";


            // Save username
            setUserNames((previous) => ({
                ...previous,

                [id]: username,
            }));


            return username;

        } catch (err) {

            console.error(
                "Username fetch error:",
                id,
                err
            );

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

        if (!userId) {
            return;
        }


        try {

            const response =
                await nearby.getNearbyUsers(userId);


            console.log(
                "NEARBY USERS RESPONSE:",
                response
            );


            // Backend should return array
            const users = Array.isArray(response)
                ? response
                : [];


            // Remove invalid users
            const validUsers = users.filter(
                (item) =>
                    item?.userId &&
                    item?.latitude != null &&
                    item?.longitude != null &&
                    item.userId !== userId
            );


            // =================================================
            // FETCH USERNAME FOR EVERY NEARBY USER
            // =================================================

            const usersWithNames =
                await Promise.all(

                    validUsers.map(
                        async (item) => {

                            const username =
                                await getUsername(
                                    item.userId
                                );


                            return {
                                ...item,

                                latitude:
                                    Number(
                                        item.latitude
                                    ),

                                longitude:
                                    Number(
                                        item.longitude
                                    ),

                                username,
                            };
                        }
                    )
                );


            console.log(
                "NEARBY USERS WITH USERNAMES:",
                usersWithNames
            );


            setNearbyUsers(
                usersWithNames
            );

        } catch (err) {

            console.error(
                "Load nearby users error:",
                err
            );

            setNearbyUsers([]);
        }
    };


    // =================================================
    // ENABLE NEARBY
    // =================================================

    const enableNearby = async () => {

        if (!userId) {

            setError(
                "User information not available."
            );

            return;
        }


        setLoading(true);

        setError("");


        try {

            // Get browser/device location
            const location =
                await getCurrentLocation();


            const nearbyData = {

                latitude:
                    location.latitude,

                longitude:
                    location.longitude,

                location_enabled: true,
            };


            // =================================================
            // CHECK IF RECORD ALREADY EXISTS
            // =================================================

            let existing = null;


            try {

                existing =
                    await nearby.getMyNearby(
                        userId
                    );

            } catch (err) {

                if (
                    err?.response?.status !== 404
                ) {

                    throw err;
                }
            }


            // =================================================
            // CREATE OR UPDATE
            // =================================================

            if (existing) {

                await nearby.updateNearby(
                    nearbyData,
                    userId
                );

            } else {

                await nearby.createNearby(
                    nearbyData,
                    userId
                );
            }


            // Set local state
            setMyLocation(location);

            setEnabled(true);


            // Load nearby users
            await loadNearbyUsers();

        } catch (err) {

            console.error(
                "Enable nearby error:",
                err
            );


            setError(
                err?.message ||
                "Unable to enable Nearby."
            );

            setEnabled(false);

        } finally {

            setLoading(false);
        }
    };


    // =================================================
    // DISABLE NEARBY
    // =================================================

    const disableNearby = async () => {

        if (!userId) {
            return;
        }


        setLoading(true);

        setError("");


        try {

            await nearby.updateNearbyStatus(
                false,
                userId
            );


            setEnabled(false);

            setNearbyUsers([]);

        } catch (err) {

            console.error(
                "Disable nearby error:",
                err
            );


            setError(
                "Unable to disable Nearby."
            );

        } finally {

            setLoading(false);
        }
    };


    // =================================================
    // TOGGLE
    // =================================================

    const handleToggle = async () => {

        if (loading) {
            return;
        }


        if (enabled) {

            await disableNearby();

        } else {

            await enableNearby();
        }
    };


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        if (!userId) {
            return;
        }

        loadMyNearby();

    }, [userId]);


    // =================================================
    // LOAD USERS WHEN ENABLED
    // =================================================

    useEffect(() => {

        if (!enabled || !userId) {
            return;
        }


        loadNearbyUsers();


        // Refresh every 5 seconds
        const interval =
            setInterval(() => {

                loadNearbyUsers();

            }, 5000);


        return () => {

            clearInterval(interval);
        };

    }, [enabled, userId]);


    // =================================================
    // MAP POSITION
    // =================================================

    const mapPosition = myLocation
        ? [
            myLocation.latitude,
            myLocation.longitude,
        ]
        : [17.385, 78.4867];


    // =================================================
    // UI
    // =================================================

    return (
        <div className="nearby-page">

{/* =================================================
          NAVBAR
      ================================================= */}

      <div className="all-nav">

        <button
          className={`nav-tab ${
            location.pathname ===
            "/all-posts"
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/all-posts")
          }
        >
          All Post
        </button>


        <button
          className={`nav-tab ${
            location.pathname ===
            "/recents"
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/recents")
          }
        >
          Recents
        </button>

        <button
          className={`nav-tab ${
            location.pathname ===
            "/nearby"
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/nearby")
          }
        >
          Nearby
        </button>

      </div>

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="nearby-header">

                <div>

                    <h1>
                        Nearby
                    </h1>

                    <p>
                        Discover HORIZAN users around you
                    </p>

                </div>


                {/* TOGGLE */}

                <button
                    className={
                        enabled
                            ? "nearby-toggle active"
                            : "nearby-toggle"
                    }
                    onClick={handleToggle}
                    disabled={loading}
                >

                    <span
                        className="toggle-circle"
                    />

                    <span>
                        {loading
                            ? "Loading..."
                            : enabled
                                ? "Nearby ON"
                                : "Nearby OFF"
                        }
                    </span>

                </button>

            </div>


            {/* =========================================
                ERROR
            ========================================= */}

            {error && (

                <div className="nearby-error">

                    {error}

                </div>
            )}


            {/* =========================================
                MAP
            ========================================= */}

            {enabled && myLocation ? (

                <div className="nearby-map-wrapper">

                    <MapContainer
                        center={mapPosition}
                        zoom={16}
                        scrollWheelZoom={true}
                        className="nearby-map"
                    >

                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />


                        <MapCenter
                            position={mapPosition}
                        />


                        {/* =================================
                            MY LOCATION
                        ================================= */}

                        <Circle
                            center={mapPosition}
                            radius={500}
                            pathOptions={{
                                fillOpacity: 0.08,
                            }}
                        />


                        <Marker
                            position={mapPosition}
                        >

                            <Popup>

                                <div>

                                    <strong>
                                        Your Location
                                    </strong>

                                    <br />

                                    <span>
                                        Nearby is ON
                                    </span>

                                </div>

                            </Popup>

                        </Marker>


                        {/* =================================
                            OTHER HORIZAN USERS
                        ================================= */}

                        {nearbyUsers.map((user) => (

                            <Marker
                                key={user.userId}
                                position={[
                                    user.latitude,
                                    user.longitude,
                                ]}
                            >

                                <Popup>

                                    <div className="nearby-popup">

                                        <div className="nearby-popup-name">

                                            @{user.username}

                                        </div>


                                        <div className="nearby-popup-status">

                                            HORIZAN user

                                        </div>

                                    </div>

                                </Popup>

                            </Marker>

                        ))}

                    </MapContainer>


                    {/* =================================
                        MAP INFO
                    ================================= */}

                    <div className="nearby-map-info">

                        <div>
                            <strong>
                                {nearbyUsers.length}
                            </strong>

                            <span>
                                Nearby users
                            </span>
                        </div>


                        <div>
                            <strong>
                                500m
                            </strong>

                            <span>
                                Nearby radius
                            </span>
                        </div>

                    </div>

                </div>

            ) : (

                /* =====================================
                   OFF SCREEN
                ===================================== */

                <div className="nearby-off">

                    <div className="nearby-off-icon">
                        📍
                    </div>

                    <h2>
                        Nearby is turned off
                    </h2>

                    <p>
                        Turn on Nearby to see HORIZAN
                        users around your location.
                    </p>


                    <button
                        onClick={handleToggle}
                        disabled={loading}
                    >

                        {loading
                            ? "Getting location..."
                            : "Turn On Nearby"
                        }

                    </button>

                </div>

            )}

        </div>
    );
}


export default Nearby;