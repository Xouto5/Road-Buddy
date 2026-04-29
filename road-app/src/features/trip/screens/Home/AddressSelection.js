/*
AddressSelection Component
Used in retrieving starting/destination address information, required to calculate cost/distance.

Author: Bryan Cardeno                               
Date: 02-26-2026 

AddressSelection Component updated to include recent locations
Author: Joshua Swineford
Date: 4-29-2026
*/
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import * as Crypto from "expo-crypto";
import {
  View,
  StyleSheet,
  Text,
  Button,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";

import {
  getGoogleAutocomplete,
  completeGoogleAddress,
} from "../../services/googleAPIService";

import {
  getRecentLocations,
  saveRecentLocation,
} from "../../services/recentLocationService";

import { DARK_THEME } from "../../../../shared/style/ColorScheme";

function AddressSelection({
  setVisibility,
  sessToken,
  setAddress,
  setSessToken,
}) {
  const [places, setPlaces] = useState([]);
  const [recentLocations, setRecentLocations] = useState([]);
  const [searchText, setSearchText] = useState("");

  const inputRef = useRef(null);

  const closeModal = () => setVisibility(false);

  useEffect(() => {
    const loadRecentLocations = async () => {
      const recents = await getRecentLocations();
      setRecentLocations(recents);
    };

    loadRecentLocations();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        const trimmed = searchText.trim();

        if (trimmed.length > 2) {
          const result = await getGoogleAutocomplete(trimmed, sessToken);
          setPlaces(result.suggestions || []);
        } else {
          setPlaces([]);
        }
      } catch (error) {
        console.log(error);
      }
    }, 400); {/* the amount of milliseconds of delay after typing before making the API call, can adjust as needed */}

    return () => clearTimeout(timeoutId);
  }, [searchText, sessToken]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // small delay helps with modal timing

    return () => clearTimeout(timeout);
  }, []);

  const handleAddressPress = async (item) => {
    try {
      await completeGoogleAddress(item.placePrediction.placeId);

      setAddress(item);

      await saveRecentLocation({
        placeId: item.placePrediction.placeId,
        description: item.placePrediction.text.text,
        type: "place",
      });

      setSessToken(() => Crypto.randomUUID());
      closeModal();
    } catch (error) {
      console.log(error);
    }
  };

  const handleRecentLocationPress = (item) => {
    if (item.type === "current_location") {
      setAddress({
        placePrediction: {
          text: {
            text: item.description,
          },
        },
        coordinates: {
          latitude: item.latitude,
          longitude: item.longitude,
        },
        isCurrentLocation: true,
      });
    } else {
      setAddress({
        placePrediction: {
          placeId: item.placeId,
          text: {
            text: item.description,
          },
        },
      });
    }

    setSessToken(() => Crypto.randomUUID());
    closeModal();
  };

  const renderPlaces = ({ item }) => {
    return (
      <Pressable onPress={() => handleAddressPress(item)}>
        <View style={styles.itemContainer}>
          <Text style={styles.itemText}>{item.placePrediction.text.text}</Text>
        </View>
      </Pressable>
    );
  };

  const renderRecentLocation = ({ item }) => {
    return (
      <Pressable onPress={() => handleRecentLocationPress(item)}>
        <View style={styles.itemContainer}>
          <Text style={styles.recentTag}>Recent</Text>
          <Text style={styles.itemText}>{item.description}</Text>
        </View>
      </Pressable>
    );
  };

  const showRecentLocations = searchText.trim().length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.textInputContainer}>
        <Ionicons name="search" size={20} color={"#fafafa"} />
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder="Enter address"
          placeholderTextColor={DARK_THEME.primaryText}
          onChangeText={setSearchText}
          value={searchText}
        />
      </View>

      {showRecentLocations ? (
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Recent</Text>

          {recentLocations.length > 0 ? (
            <FlatList
              data={recentLocations}
              renderItem={renderRecentLocation}
              keyExtractor={(item, index) =>
                `${item.placeId || item.description}-${index}`
              }
            />
          ) : (
            <Text style={styles.emptyText}>No recent locations yet.</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={places}
          renderItem={renderPlaces}
          keyExtractor={(item) => item.placePrediction.placeId}
          contentContainerStyle={styles.contentContainer}
        />
      )}

      <View>
        <Button title="done" onPress={closeModal} />
      </View>
    </View>
  );
}

export default AddressSelection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: DARK_THEME.modalBackground,
    flex: 1,
    gap: 20,
  },
  textInputContainer: {
    backgroundColor: DARK_THEME.primaryBackground,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 8,
    height: 50,
  },
  contentContainer: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 20,
    flexGrow: 1,
  },
  itemContainer: {
    paddingVertical: 10,
    borderBottomColor: "#475569",
    borderBottomWidth: 1,
  },
  textInput: {
    color: DARK_THEME.primaryText,
    fontSize: 16,
    flex: 1,
  },
  itemText: {
    color: "#E2E8F0",
  },
  sectionTitle: {
    color: "#93C5FD",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyText: {
    color: "#CBD5E1",
    fontSize: 15,
    marginTop: 8,
  },
  recentTag: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
});