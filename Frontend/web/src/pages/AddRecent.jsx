import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import recent from "../backend/recent";
import "./AddRecent.css";


function AddRecent() {

    const navigate = useNavigate();

    const fileInputRef = useRef(null);

    const [text, setText] = useState("");
    const [image, setImage] = useState(null);

    const [imagePreview, setImagePreview] = useState("");

    const [location, setLocation] = useState(null);

    const [locationLoading, setLocationLoading] = useState(true);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // =================================================
    // GET CURRENT LOCATION
    // =================================================

    useEffect(() => {

        if (!navigator.geolocation) {

            setError(
                "Geolocation is not supported by this browser."
            );

            setLocationLoading(false);

            return;
        }


        navigator.geolocation.getCurrentPosition(

            (position) => {

                setLocation({

                    latitude: position.coords.latitude,

                    longitude: position.coords.longitude,

                });

                setLocationLoading(false);

            },

            (error) => {

                console.error(
                    "Location error:",
                    error
                );

                setError(
                    "Location permission is required to create a Live Post."
                );

                setLocationLoading(false);

            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }

        );

    }, []);


    // =================================================
    // IMAGE SELECT
    // =================================================

    const handleImageChange = (event) => {

        const file = event.target.files?.[0];

        if (!file) {
            return;
        }


        // Check image type

        if (!file.type.startsWith("image/")) {

            setError(
                "Please select a valid image."
            );

            return;
        }


        setError("");

        setImage(file);


        // Preview

        const preview =
            URL.createObjectURL(file);

        setImagePreview(preview);

    };


    // =================================================
    // REMOVE IMAGE
    // =================================================

    const removeImage = () => {

        setImage(null);

        setImagePreview("");

        if (fileInputRef.current) {

            fileInputRef.current.value = "";

        }

    };


    // =================================================
    // CREATE RECENT
    // =================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        setSuccess("");


        // Location check

        if (!location) {

            setError(
                "Your current location is required."
            );

            return;

        }


        // Content check

        if (!text.trim() && !image) {

            setError(
                "Add some text or select an image."
            );

            return;

        }


        setLoading(true);


        try {

            // =========================================
            // TEXT ONLY
            // =========================================

            if (
                text.trim() &&
                !image
            ) {

                await recent.addTextRecent({

                    text: text.trim(),

                    latitude:
                        location.latitude,

                    longitude:
                        location.longitude,

                });

            }


            // =========================================
            // IMAGE / IMAGE + TEXT
            // =========================================

            else {

                /*
                 * IMPORTANT:
                 *
                 * Your current backend schema expects
                 * "image" as a value.
                 *
                 * If your backend stores an image URL,
                 * put the uploaded image URL here.
                 *
                 * This example converts the selected
                 * image to a data URL.
                 */

                const imageData =
                    await fileToDataURL(image);


                await recent.addImageRecent({

                    image: imageData,

                    text:
                        text.trim() || null,

                    latitude:
                        location.latitude,

                    longitude:
                        location.longitude,

                });

            }


            // =========================================
            // SUCCESS
            // =========================================

            setSuccess(
                "Live Post created successfully!"
            );


            setText("");

            removeImage();


            // Go back after short delay

            setTimeout(() => {

                navigate("/recents");

            }, 1000);


        } catch (err) {

            console.error(
                "Failed to create recent:",
                err
            );


            setError(
                err?.response?.data?.detail ||
                "Failed to create Live Post."
            );

        } finally {

            setLoading(false);

        }

    };


    // =================================================
    // FILE → DATA URL
    // =================================================

    const fileToDataURL = (file) => {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();

                reader.onload = () =>
                    resolve(
                        reader.result
                    );

                reader.onerror = reject;

                reader.readAsDataURL(file);

            }
        );

    };


    // =================================================
    // UI
    // =================================================

    return (

        <div className="add-recent-page">


            {/* =========================================
                HEADER
            ========================================= */}

            <div className="add-recent-header">

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate("/recents")
                    }
                >
                    ←
                </button>


                <div>

                    <h1>
                        Add Recent
                    </h1>

                    <p>
                        Share what is happening right now.
                    </p>

                </div>

            </div>


            {/* =========================================
                FORM
            ========================================= */}

            <form
                className="add-recent-card"
                onSubmit={handleSubmit}
            >


                {/* =====================================
                    LOCATION
                ===================================== */}

                <div className="recent-location-box">

                    <div className="location-icon">
                        📍
                    </div>

                    <div>

                        <strong>
                            Current Location
                        </strong>

                        <p>

                            {locationLoading
                                ? "Getting your location..."
                                : location
                                    ? "Location attached automatically"
                                    : "Location unavailable"
                            }

                        </p>

                    </div>

                    {location && (
                        <span className="location-check">
                            ✓
                        </span>
                    )}

                </div>


                {/* =====================================
                    TEXT
                ===================================== */}

                <div className="recent-input-section">

                    <label>
                        What's happening?
                    </label>

                    <textarea
                        value={text}
                        onChange={(event) =>
                            setText(event.target.value)
                        }
                        placeholder="Share something happening here..."
                        maxLength={500}
                    />

                    <div className="character-count">

                        {text.length}/500

                    </div>

                </div>


                {/* =====================================
                    IMAGE
                ===================================== */}

                <div className="recent-image-section">

                    <label>
                        Add Image
                    </label>


                    {!imagePreview ? (

                        <button
                            type="button"
                            className="image-select-btn"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                        >

                            <span className="upload-icon">
                                +
                            </span>

                            <span>
                                Add a photo
                            </span>

                        </button>

                    ) : (

                        <div className="image-preview-container">

                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="image-preview"
                            />

                            <button
                                type="button"
                                className="remove-image-btn"
                                onClick={removeImage}
                            >
                                ×
                            </button>

                        </div>

                    )}


                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                    />

                </div>


                {/* =====================================
                    ERROR
                ===================================== */}

                {error && (

                    <div className="add-recent-error">

                        {error}

                    </div>

                )}


                {/* =====================================
                    SUCCESS
                ===================================== */}

                {success && (

                    <div className="add-recent-success">

                        ✓ {success}

                    </div>

                )}


                {/* =====================================
                    SUBMIT
                ===================================== */}

                <button
                    type="submit"
                    className="publish-recent-btn"
                    disabled={
                        loading ||
                        locationLoading ||
                        !location
                    }
                >

                    {loading
                        ? "Publishing..."
                        : "🔴 Publish Live Post"
                    }

                </button>


                <p className="expiry-info">

                    ⏱️ Live Posts automatically disappear
                    after 24 hours.

                </p>

            </form>

        </div>

    );

}


export default AddRecent;