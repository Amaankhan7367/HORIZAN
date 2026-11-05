import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate, useLocation } from "react-router-dom";

import authService from "../backend/auth";
import recent from "../backend/recent";

import "./RecentMap.css";


// ======================================================
// PIN COLORS
// ======================================================

const COLORS = {
  image: "#22c55e",  // 🟢 Photo
  text: "#a855f7",   // 🟣 Text
  both: "#f59e0b",   // 🟠 Photo + Text
  me: "#3b82f6",     // 🔵 Your Post
};


// ======================================================
// RECENT PIN
// ======================================================
function createPin(color) {
  const pin = document.createElement("div");

  pin.className = "recent-pin";
  pin.style.setProperty("--pin-color", color);

  const inner = document.createElement("div");
  inner.className = "recent-pin-inner";

  pin.appendChild(inner);

  return L.divIcon({
    className: "recent-pin-wrapper",
    html: pin.outerHTML,
    iconSize: [42, 52],
    iconAnchor: [21, 51],
    popupAnchor: [0, -48],
  });
}

// ======================================================
// CURRENT LOCATION PIN
// ======================================================

function createCurrentLocationPin() {
  const pin = document.createElement("div");

  pin.className = "current-location-pin";

  const dot = document.createElement("div");

  dot.className = "current-location-dot";

  pin.appendChild(dot);

  return L.divIcon({
    className: "",
    html: pin.outerHTML,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}


// ======================================================
// FLY TO
// ======================================================

function FlyTo({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.flyTo(position, 15, {
      duration: 0.8,
    });
  }, [position, map]);

  return null;
}


// ======================================================
// MAIN
// ======================================================

export default function RecentsMap() {
const currentUser = useSelector(
    (state) => state.auth.userData
  );
  const navigate = useNavigate();
  const location = useLocation();


  // ====================================================
  // STATES
  // ====================================================

  const [recents, setRecents] = useState([]);

  const [selected, setSelected] = useState(null);

  const [authors, setAuthors] = useState({});

  const [loading, setLoading] = useState(true);

  const [deleting, setDeleting] = useState(false);

  const [currentLocation, setCurrentLocation] =
    useState(null);


  // ====================================================
  // CURRENT LOCATION
  // ====================================================

  useEffect(() => {

    if (!navigator.geolocation) {

      console.error(
        "Geolocation is not supported."
      );

      return;
    }


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        // console.log(
        //   "CURRENT LOCATION:",
        //   latitude,
        //   longitude
        // );


        setCurrentLocation({
          latitude,
          longitude,
        });

      },


      (error) => {

        console.error(
          "Location error:",
          error
        );

      },


      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }

    );

  }, []);


  // ====================================================
  // LOAD RECENTS
  // ====================================================

  useEffect(() => {

    loadRecents();

  }, []);


  async function loadRecents() {

    try {

      setLoading(true);


      const response =
        await recent.allRecent();


    //   console.log(
    //     "RECENTS RESPONSE:",
    //     response
    //   );


      let data = [];


      if (Array.isArray(response)) {

        data = response;

      }

      else if (
        Array.isArray(response?.recents)
      ) {

        data = response.recents;

      }

      else if (
        Array.isArray(response?.data)
      ) {

        data = response.data;

      }

      else if (
        Array.isArray(
          response?.data?.recents
        )
      ) {

        data =
          response.data.recents;

      }


      setRecents(data);

    }

    catch (error) {

      console.error(
        "Error loading recents:",
        error
      );

      setRecents([]);

    }

    finally {

      setLoading(false);

    }

  }


  // ====================================================
  // OPEN RECENT
  // ====================================================

  async function handleOpen(item) {

    setSelected(item);


    if (!item.userID) {

      console.error(
        "User ID missing:",
        item
      );

      return;
    }


    if (authors[item.userID]) {

      return;
    }


    try {

      const user =
        await authService.get_user_by_id(
          item.userID
        );


    //   console.log(
    //     "AUTHOR:",
    //     user
    //   );


      setAuthors(
        (previous) => ({
          ...previous,

          [item.userID]: user,
        })
      );

    }

    catch (error) {

      console.error(
        "Error getting author:",
        error
      );

    }

  }


  // ====================================================
  // DELETE
  // ====================================================

  async function handleDelete(id) {

    if (!id) {

      console.error(
        "Recent ID missing:",
        selected
      );

      return;
    }


    if (deleting) return;


    const confirmed =
      window.confirm(
        "Delete this recent?"
      );


    if (!confirmed) return;


    try {

      setDeleting(true);


      console.log(
        "Deleting:",
        id
      );


      await recent.deleteRecent(id);


      setRecents(
        (previous) =>
          previous.filter(
            (item) =>
              item.recentId !== id
          )
      );


      setSelected(null);

    }

    catch (error) {

      console.error(
        "Delete error:",
        error
      );

      alert(
        "Failed to delete recent."
      );

    }

    finally {

      setDeleting(false);

    }

  }


  // ====================================================
  // MARKERS
  // ====================================================

  const markers = useMemo(() => {

    if (!Array.isArray(recents)) {

      return [];

    }


    return recents

      .filter((item) => {

        return (
          item &&
          item.latitude !== null &&
          item.longitude !== null &&
          !Number.isNaN(
            Number(item.latitude)
          ) &&
          !Number.isNaN(
            Number(item.longitude)
          )
        );

      })


      .map((item) => {

        const isMe =
  String(currentUser?.id) === String(item.userID);

const hasImage =
  item.image !== null &&
  item.image !== undefined &&
  String(item.image).trim() !== "";

const hasText =
  item.text !== null &&
  item.text !== undefined &&
  String(item.text).trim() !== "";

let type;

if (hasImage && hasText) {
  type = "both";
} else if (hasImage) {
  type = "image";
} else {
  type = "text";
}

const color = COLORS[type];




        return {

          ...item,

          isMe,

          type,

          icon:
            createPin(color),

        };

      });

  }, [
    recents,
    currentUser,
  ]);


  // ====================================================
  // RENDER
  // ====================================================

  return (

    <div className="recent-map-page">


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


      {/* =================================================
          ADD RECENT
      ================================================= */}

      <div className="recent-action-bar">

        <button
          className="add-recent-btn"
          onClick={() =>
            navigate("/add-recent")
          }
        >

          <span className="add-recent-icon">
            +
          </span>

          Add Recent

        </button>

      </div>


      {/* =================================================
          MAP
      ================================================= */}

      <div className="recent-map-container">


        <MapContainer
          center={[
            17.385,
            78.4867,
          ]}
          zoom={12}
          className="recents-map"
        >


          {/* =================================================
              MAP TILES
          ================================================= */}

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          {/* =================================================
              FLY TO SELECTED
          ================================================= */}

          <FlyTo
            position={
              selected
                ? [
                    Number(
                      selected.latitude
                    ),
                    Number(
                      selected.longitude
                    ),
                  ]
                : null
            }
          />


          {/* =================================================
              CURRENT LOCATION
          ================================================= */}

          {currentLocation && (

            <Marker
              position={[
                currentLocation.latitude,
                currentLocation.longitude,
              ]}
              icon={
                createCurrentLocationPin()
              }
            >

              <Popup>

                <div className="current-location-popup">

                  <div className="current-location-title">
                    📍 Current Location
                  </div>

                  <div className="current-location-coordinates">

                    {currentLocation.latitude.toFixed(
                      5
                    )}

                    {" , "}

                    {currentLocation.longitude.toFixed(
                      5
                    )}

                  </div>

                </div>

              </Popup>

            </Marker>

          )}


          {/* =================================================
              RECENT MARKERS
          ================================================= */}

          {markers.map((item) => {

            const author =
              authors[item.userID];


            return (

              <Marker
                key={item.recentId}
                position={[
                  Number(
                    item.latitude
                  ),
                  Number(
                    item.longitude
                  ),
                ]}
                icon={item.icon}
                eventHandlers={{
                  click: () =>
                    handleOpen(item),
                }}
              >


                {/* =================================================
                    POPUP
                ================================================= */}

                <Popup
                  className="recent-popup"
                  closeButton={false}
                >

                  <div className="recent-popup-card">


                    {/* =================================================
                        USER NAME
                    ================================================= */}

                    <div className="recent-user">

                      <div className="recent-avatar">

                        {author?.username
                          ? author.username
                              .charAt(0)
                              .toUpperCase()
                          : "U"}

                      </div>


                      <div className="recent-user-info">

                        <strong>

                          {author?.username ||
                            "Loading..."}

                        </strong>


                        <span>
                          Location Recent
                        </span>

                      </div>

                    </div>


                    {/* =================================================
                        IMAGE
                    ================================================= */}

                    {item.image && (

                      <div className="recent-popup-image">

                        <img
                          src={item.image}
                          alt="Recent"
                        />

                      </div>

                    )}


                    {/* =================================================
                        TEXT
                    ================================================= */}

                    {item.text && (

                      <div className="recent-text">

                        {item.text}

                      </div>

                    )}


                    {/* =================================================
                        LOCATION
                    ================================================= */}

                    <div className="recent-location">

                      <span className="location-icon">
                        📍
                      </span>


                      <div>

                        <small>
                          Current Location
                        </small>


                        <p>

                          {Number(
                            item.latitude
                          ).toFixed(5)}

                          {" , "}

                          {Number(
                            item.longitude
                          ).toFixed(5)}

                        </p>

                      </div>

                    </div>


                    {/* =================================================
                        DELETE OWNER ONLY
                    ================================================= */}
{String(currentUser?.id) === String(item.userID) && (
  <button
    type="button"
    className="recent-delete-btn"
    onClick={() => handleDelete(item.recentId)}
    disabled={deleting}
  >
    {deleting ? "Deleting..." : "🗑 Delete Recent"}
  </button>
)}

                  </div>

                </Popup>

              </Marker>

            );

          })}


        </MapContainer>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="recents-status">

            Loading recents...

          </div>

        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          markers.length === 0 && (

            <div className="recents-status">

              No recent posts available.

            </div>

        )}


        {/* =================================================
            LEGEND
        ================================================= */}

        <div className="recents-legend">

          <div className="legend-title">
            Recents
          </div>


          <div className="legend-item">

            <span className="legend-dot blue" />

            Your Post

          </div>


          <div className="legend-item">

            <span className="legend-dot green" />

            Photo

          </div>


          <div className="legend-item">

            <span className="legend-dot purple" />

            Text

          </div>


          <div className="legend-item">

            <span className="legend-dot orange" />

            Photo + Text

          </div>

        </div>


      </div>

    </div>

  );

}