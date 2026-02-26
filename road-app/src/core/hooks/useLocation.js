// This hook is responsible for getting the user's current location using the Expo Location API.
//  It will return the current coordinates, any error that occurred, and a loading state. 
// We will use this in TripMapScreen to get the user's location and display it on the map as 
// the starting point for directions.

import { useState, useEffect } from "react";
import * as Location from "expo-location";

export default function useLocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission denied");
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setCoords(location.coords);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  return { coords, error, loading };
}