
import * as Location from "expo-location";

export const getCurrentLocation = async () => {
  try {
    // Request foreground location permission
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      throw new Error("Location permission denied");
    }

    // Get current GPS location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.log("getCurrentLocation :: error", error);
    throw error;
  }
};
