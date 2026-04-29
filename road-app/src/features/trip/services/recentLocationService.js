/*  Added a recent location storage that stores the user's recent locations locally

    Author: Joshua Swineford
    Date: 4-29-2026

*/
import AsyncStorage from "@react-native-async-storage/async-storage";

const RECENT_LOCATIONS_KEY = "recent_locations";
const MAX_RECENT_LOCATIONS = 5;

export const getRecentLocations = async () => {
  try {
    const stored = await AsyncStorage.getItem(RECENT_LOCATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load recent locations:", error);
    return [];
  }
};

export const saveRecentLocation = async (location) => {
  try {
    const existing = await getRecentLocations();

    const filtered = existing.filter((item) => {
      if (location.placeId && item.placeId) {
        return item.placeId !== location.placeId;
      }

      if (location.description && item.description) {
        return item.description !== location.description;
      }

      return true;
    });

    const updated = [
      {
        ...location,
        usedAt: Date.now(),
      },
      ...filtered,
    ].slice(0, MAX_RECENT_LOCATIONS);

    await AsyncStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save recent location:", error);
  }
};

export const clearRecentLocations = async () => {
  try {
    await AsyncStorage.removeItem(RECENT_LOCATIONS_KEY);
  } catch (error) {
    console.error("Failed to clear recent locations:", error);
  }
};