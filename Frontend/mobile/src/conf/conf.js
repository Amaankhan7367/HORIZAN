const USE_LOCAL = process.env.EXPO_PUBLIC_USE_LOCAL === "true";

export const API_URL = USE_LOCAL
    ? process.env.EXPO_PUBLIC_LOCAL_API_URL
    : process.env.EXPO_PUBLIC_NETWORK_API_URL;