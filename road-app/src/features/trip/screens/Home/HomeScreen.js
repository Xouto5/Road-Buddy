/*
HomeScreen Component                      
Default screen when authenticated.
Prompts user for trip information and displays brief estimate.

Author: Bryan Cardeno                               
Date: 02-21-2026 

Removed estimate function.
Recent locations are shown when selecting a start location and destination, saved in recentLocationService in services.
Added start trip button which takes you to the overview screen with current locations and vehicle configuration.
Added a save trip button with accompanying modal, which still needs to be hooked up to backend

Author: Joshua Swineford
Date: 04-29-2026
*/

import { View, Text, StyleSheet, Pressable, Modal, Alert, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Crypto from "expo-crypto";
import { verifyEmail, isUserVerified } from "../../../auth/services/authServices";
import * as Location from "expo-location";
import { getRecentLocations } from "../../services/recentLocationService";

import {
  getGoogleDistance,
  getGoogleGasStationNearbyFromLocation,
  getGooglePlaceLongLat,
} from "../../services/googleAPIService";

import { getAuth } from "firebase/auth";

import VehicleSelection from "./VehicleSelection";
import AddressSelection from "./AddressSelection";
import SelectField from "../../../../shared/component/SelectField";
import { saveRecentLocation } from "../../services/recentLocationService";

import { DARK_THEME } from "../../../../shared/style/ColorScheme";

import {
  metersToMiles,
  secondsToMinutes,
  calcGasCost,
} from "../../../../shared/utility/utils";

// TODO: Create state for all the calculated estimate values to be passed to overview.
export default function HomeScreen({ userName }) {
  const MODAL_CONTEXT = {
    START_LOC: "start",
    END_LOC: "end",
    CAR_SELECT: "vehicle",
  };

  const GOOGLE_PLACES_ENDPOINT = "https://places.googleapis.com/v1/places:autocomplete";

  const AUTOCOMPLETE_FIELD_MASK = [
    "suggestions.placePrediction.placeId",
    "suggestions.placePrediction.text.text",
  ].join(",");

  const PLACES_API_KEY =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID;

  const navigation = useNavigation();

  const auth = getAuth();
  const user = auth.currentUser;

  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [mpg, setMpg] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContext, setModalContext] = useState(null);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [sessionToken, setSessionToken] = useState(() => Crypto.randomUUID());
  const [estimate, setEstimate] = useState("");
  const [longLat, setLongLat] = useState("");
  const [gasStations, setGasStations] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [startAutocompleteLoading, setStartAutocompleteLoading] = useState(false);
  const [destinationAutocompleteLoading, setDestinationAutocompleteLoading] = useState(false);
  const [recentLocations, setRecentLocations] = useState([]);
  const [activeLocationField, setActiveLocationField] = useState(null);

  const debounceRef = useRef(null);
  const sessionTokenRef = useRef(`home-${Date.now()}`);

  if(!isUserVerified){
    Alert.alert(
      'Email is not verified',
      'Please verify your email. Check your email for an existing link, or click send again to receive a new one',
      [
        {
          text: 'Okay', 
        },
        {
          text: 'Send Again', 
          onPress: () => verifyEmail
        },
      ],
      {cancelable: false},
      );
  }


  const onQuickCalc = async () => {
    const findCheapest = (ar) => {
      let val = 999;

      ar.forEach((element) => {
        const regular = element.fuelOptions.fuelPrices.filter(
          (gasType) => gasType.type == "REGULAR_UNLEADED",
        );

        const wholePrice = parseInt(regular[0].price.units);
        const decimal = parseInt(regular[0].price.nanos) / 1000000000;

        const price = wholePrice + decimal;

        if (price < val) val = price;
      });

      return val;
    };

    if (!startLocation || !destination) {
      console.log("invalid start or destination");
      return;
    }

    

    if (!longLat) {
      console.log("long lat invalid", longLat);
      return;
    }

    const filterStations = gasStations.filter((gas) => gas.fuelOptions);
    const cheapest = findCheapest(filterStations);

    const routeDistance = await getGoogleDistance(
      startLocation.placePrediction.placeId,
      destination.placePrediction.placeId,
    );

    const { distanceMeters, duration, polyline } = routeDistance.routes[0];

    setEstimate(() => ({
      distance: Math.ceil(metersToMiles(distanceMeters)),
      duration: Math.ceil(secondsToMinutes(duration)),
      gasPrice: cheapest,
      polylines: polyline,
    }));
  };
  const handleUseMyLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError("");

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("Location permission denied. Enable it in your device settings.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      const formattedLocation = place
        ? [place.street, place.city, place.region].filter(Boolean).join(", ")
        : `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;

      const currentLocationData = {
        placePrediction: {
          text: {
            text: formattedLocation,
          },
        },
        coordinates: {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        },
        isCurrentLocation: true,
      };

      setStartLocation(currentLocationData);

      await saveRecentLocation({
        placeId: null,
        description: formattedLocation,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        type: "current_location",
      });

      setValidationErrors((prev) => ({
        ...prev,
        startLocation: undefined,
      }));
    } catch (err) {
      console.error("Location error:", err);
      setLocationError("Could not retrieve location. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleStartTrip = async () => {
    try {
      const findCheapest = (ar) => {
        let val = 999;

        ar.forEach((element) => {
          const regular = element.fuelOptions?.fuelPrices?.filter(
            (gasType) => gasType.type === "REGULAR_UNLEADED"
          );

          if (!regular || regular.length === 0) return;

          const wholePrice = parseInt(regular[0].price.units);
          const decimal = parseInt(regular[0].price.nanos) / 1000000000;
          const price = wholePrice + decimal;

          if (price < val) val = price;
        });

        return val;
      };

      if (!startLocation || !destination || !vehicle) {
        console.log("Missing start location, destination, or vehicle");
        return;
      }

      if (!destination?.placePrediction?.placeId) {
        console.log("Destination placeId missing");
        return;
      }

      const filterStations = gasStations.filter((gas) => gas.fuelOptions);
      const cheapest = findCheapest(filterStations);

      let routeDistance;

      if (startLocation?.isCurrentLocation && startLocation?.coordinates) {
        console.log("Current location selected as start.");
        console.log("Your getGoogleDistance service currently needs a placeId-based start.");
        return;
      }

      if (!startLocation?.placePrediction?.placeId) {
        console.log("Start location placeId missing");
        return;
      }

      routeDistance = await getGoogleDistance(
        startLocation.placePrediction.placeId,
        destination.placePrediction.placeId
      );

      const { distanceMeters, duration, polyline } = routeDistance.routes[0];

      const estDetail = {
        distance: Math.ceil(metersToMiles(distanceMeters)),
        duration: Math.ceil(secondsToMinutes(duration)),
        gasPrice: cheapest,
        polylines: polyline,
      };

      navigation.navigate("Overview", {
        estDetail,
        pointA: {
          placePrediction: {
            text: {
              text: startLocation?.placePrediction?.text?.text || "Unknown start",
            },
          },
        },
        pointB: {
          placePrediction: {
            text: {
              text: destination?.placePrediction?.text?.text || "Unknown destination",
            },
          },
        },
        car: {
          label: vehicle,
          mpg_combined: Number(mpg) || 25,
        },
      });
    } catch (error) {
      console.error("Start trip error:", error);
    }
  };

  const onSave = () => {
    setSaveModalVisible(true);
  };

  const onViewOverview = () => {
    console.log("view overview pressed");
    console.log(estimate);

    if (estimate.polylines) {
      navigation.navigate("Overview", {
        estDetail: estimate,
        pointA: startLocation,
        pointB: destination,
        car: vehicle,
      });
    }
  };

  const onSelectVehicle = () => {
    setModalContext(MODAL_CONTEXT.CAR_SELECT);
    setIsModalVisible(true);
  };

  const onStartLocationChange = (e) => {
    setModalContext(MODAL_CONTEXT.START_LOC);
    setIsModalVisible(true);
  };

  const onDestinationChange = (e) => {
    setModalContext(MODAL_CONTEXT.END_LOC);
    setIsModalVisible(true);
  };

  const handleAddressTyping = (field, text) => {
    const typedLocation = {
      placePrediction: {
        text: {
          text,
        },
      },
    };

    if (field === "start") {
      setStartLocation(typedLocation);
      setLocationError("");
      setValidationErrors((e) => ({ ...e, startLocation: undefined }));
    } else {
      setDestination(typedLocation);
      setValidationErrors((e) => ({ ...e, destination: undefined }));
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleAutocompleteLookup(field, text);
    }, 400);
  };

  const handleAutocompleteLookup = async (field, rawText) => {
    const text = (rawText || "").trim();

    if (text.length < 3) {
      if (field === "start") {
        setStartSuggestions([]);
      } else {
        setDestinationSuggestions([]);
      }
      return;
    }

    if (field === "start") {
      setStartAutocompleteLoading(true);
    } else {
      setDestinationAutocompleteLoading(true);
    }

    try {
      const response = await fetch(GOOGLE_PLACES_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": PLACES_API_KEY,
          "X-Goog-FieldMask": AUTOCOMPLETE_FIELD_MASK,
        },
        body: JSON.stringify({
          input: text,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ["us"],
        }),
      });

      if (!response.ok) {
        throw new Error(`Autocomplete request failed (${response.status})`);
      }

      const result = await response.json();
      const suggestions = result?.suggestions || [];

      if (field === "start") {
        setStartSuggestions(suggestions);
      } else {
        setDestinationSuggestions(suggestions);
      }
    } catch (error) {
      console.log(error);

      if (field === "start") {
        setStartSuggestions([]);
      } else {
        setDestinationSuggestions([]);
      }
    } finally {
      if (field === "start") {
        setStartAutocompleteLoading(false);
      } else {
        setDestinationAutocompleteLoading(false);
      }
    }
  };

  const handleSelectSuggestion = async (field, suggestion) => {
    const selectedText = suggestion?.placePrediction?.text?.text || "";

    if (field === "start") {
      setStartLocation(suggestion);
      setStartSuggestions([]);
    } else {
      setDestination(suggestion);
      setDestinationSuggestions([]);
    }

    await saveRecentLocation({
      placeId: suggestion?.placePrediction?.placeId || null,
      description: selectedText,
      type: "place",
    });

    await refreshRecentLocations();

    setActiveLocationField(null);
  };

  const getFilteredRecents = (field) => {
    const text =
      field === "start"
        ? startLocation?.placePrediction?.text?.text || ""
        : destination?.placePrediction?.text?.text || "";

    if (text.trim().length === 0) {
      return recentLocations.slice(0, 3);
    }

    return recentLocations
      .filter((item) =>
        item.description?.toLowerCase().includes(text.toLowerCase())
      )
      .slice(0, 3);
  };

  const handleSelectRecentLocation = (field, item) => {
    const selectedLocation =
      item.type === "current_location"
        ? {
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
          }
        : {
            placePrediction: {
              placeId: item.placeId,
              text: {
                text: item.description,
              },
            },
          };

    if (field === "start") {
      setStartLocation(selectedLocation);
      setStartSuggestions([]);
    } else {
      setDestination(selectedLocation);
      setDestinationSuggestions([]);
    }

    Keyboard.dismiss();
    setActiveLocationField(null);
  };

  const refreshRecentLocations = async () => {
    const recents = await getRecentLocations();
    setRecentLocations(recents);
  };

  useEffect(() => {
    refreshRecentLocations();
  }, []);

  useEffect(() => {
    if (!startLocation) return;

    const getLongLat = async () => {
      if (startLocation?.isCurrentLocation && startLocation?.coordinates) {
        const coords = {
          latitude: startLocation.coordinates.latitude,
          longitude: startLocation.coordinates.longitude,
        };

        setLongLat(coords);

        const { places } = await getGoogleGasStationNearbyFromLocation(coords);
        setGasStations(places);
        return;
      }

      if (startLocation?.placePrediction?.placeId) {
        const data = await getGooglePlaceLongLat(
          startLocation.placePrediction.placeId
        );

        setLongLat(data.location);

        const { places } = await getGoogleGasStationNearbyFromLocation(
          data.location
        );

        setGasStations(places);
      }
    };

      getLongLat();
  }, [startLocation]);

  useEffect(() => {
    if (!startLocation || !destination) return;
  }, [startLocation, destination]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const loadRecents = async () => {
      const recents = await getRecentLocations();
      setRecentLocations(recents);
    };

    loadRecents();
  }, []);

  return (
    
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
      <View style={styles.container}>
        <View style={styles.screenTitle}>
          <Text style={styles.title}>Welcome</Text> 
          <Text style={styles.title}>{user?.email}</Text>
        </View>

        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.formScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentContainer}>
            <View style={styles.contents}>
              <Text style={styles.welcomeMsg}>Where do you want to go?</Text>

              <View style={styles.startLocationBlock}>
                <View style={styles.locationRow}>
                  <View style={styles.locationInputWrapper}>
                    <Text style={styles.inputLabel}>Start Location</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter starting location"
                      placeholderTextColor={DARK_THEME.placeholder}
                      value={startLocation?.placePrediction?.text?.text || ""}
                      onFocus={() => setActiveLocationField("start")}
                      onBlur={() => {
                        setTimeout(() => setActiveLocationField(null), 250);
                      }}
                      onChangeText={(text) => {
                        setActiveLocationField("start");
                        handleAddressTyping("start", text);
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.locationButton, locationLoading && styles.locationButtonDisabled]}
                    onPress={handleUseMyLocation}
                    disabled={locationLoading}
                  >
                    <Text style={styles.locationButtonText}>
                      {locationLoading ? "Locating…" : "Use my location"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {activeLocationField === "start" &&
                  getFilteredRecents("start").length > 0 && (
                    <View style={styles.recentBox}>
                      {getFilteredRecents("start").map((item, index) => (
                        <TouchableOpacity
                          key={`${item.placeId || item.description}-${index}`}
                          style={styles.recentItem}
                          onPressIn={() => handleSelectRecentLocation("start", item)}
                        >
                          <Text style={styles.recentLabel}>Recent</Text>
                          <Text style={styles.recentText}>{item.description}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                {startSuggestions.length > 0 && (
                  <View style={styles.fullWidthSuggestionsBox}>
                    {startSuggestions.slice(0, 5).map((item, index) => (
                      <TouchableOpacity
                        key={item?.placePrediction?.placeId || index}
                        style={styles.suggestionItem}
                        onPress={() => handleSelectSuggestion("start", item)}
                      >
                        <Text style={styles.suggestionText}>
                          {item?.placePrediction?.text?.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>


              <View>
                <Text style={styles.inputLabel}>Destination</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter destination"
                  placeholderTextColor={DARK_THEME.placeholder}
                  value={destination?.placePrediction?.text?.text || ""}
                  onFocus={() => setActiveLocationField("destination")}
                  onBlur={() => {
                    setTimeout(() => setActiveLocationField(null), 250);
                  }}
                  onChangeText={(text) => {
                    setActiveLocationField("destination");
                    handleAddressTyping("destination", text);
                  }}
                />

                {activeLocationField === "destination" &&
                  getFilteredRecents("destination").length > 0 && (
                    <View style={styles.recentBox}>
                      {getFilteredRecents("destination").map((item, index) => (
                        <TouchableOpacity
                          key={`${item.placeId || item.description}-${index}`}
                          style={styles.recentItem}
                          onPressIn={() => handleSelectRecentLocation("destination", item)}
                        >
                          <Text style={styles.recentLabel}>Recent</Text>
                          <Text style={styles.recentText}>{item.description}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                {destinationAutocompleteLoading ? (
                  <Text style={styles.helperText}>Loading suggestions...</Text>
                ) : null}

                {destinationSuggestions.length > 0 ? (
                  <View style={styles.suggestionsBox}>
                    {destinationSuggestions.slice(0, 5).map((item, idx) => (
                      <TouchableOpacity
                        key={
                          item?.placePrediction?.placeId ||
                          `${item?.placePrediction?.text?.text || "place"}-${idx}`
                        }
                        style={styles.suggestionItem}
                        onPress={() => handleSelectSuggestion("destination", item)}
                      >
                        <Text style={styles.suggestionText}>
                          {item?.placePrediction?.text?.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </View>

              <View style={styles.vehicleRow}>
                <View style={styles.vehicleField}>
                  <Text style={styles.inputLabel}>Vehicle</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter vehicle"
                    placeholderTextColor={DARK_THEME.placeholder}
                    value={vehicle}
                    onChangeText={setVehicle}
                  />
                </View>

                <View style={styles.mpgField}>
                  <Text style={styles.inputLabel}>MPG</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="28"
                    placeholderTextColor={DARK_THEME.placeholder}
                    value={mpg}
                    onChangeText={setMpg}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              {/*
              <Pressable onPress={onQuickCalc}>
                <View style={styles.caclBtnContainer}>
                  <Text style={styles.calcBtn}>Quick calculate</Text>
                </View>
              </Pressable>
              

              {estimate && (
                <View style={styles.quickEstimateContainer}>
                  <View style={styles.estimateDetail}>
                    <View style={styles.estimateRow}>
                      <Text style={styles.estimateLabel}>Distance: </Text>
                      <Text style={styles.estimateData}>
                        {Math.ceil(estimate.distance)} mi
                      </Text>
                    </View>
                    <View style={styles.estimateRow}>
                      <Text style={styles.estimateLabel}>Estimated Cost : </Text>
                      <Text style={styles.estimateData}>
                        ${" "}
                        {calcGasCost(
                          estimate.distance,
                          vehicle.mpg_combined,
                          estimate.gasPrice,
                        )}
                      </Text>
                    </View>
                    <View style={styles.estimateRow}>
                      <Text style={styles.estimateLabel}>ETA: </Text>
                      <Text style={styles.estimateData}>
                        {Math.ceil(estimate.duration)} min
                      </Text>
                    </View>
                  </View>

                  <Pressable onPress={onSave}>
                    <View style={styles.saveBtnContainer}>
                      <Text style={styles.calcBtn}>Save</Text>
                    </View>
                  </Pressable>
                </View>
              )} */}
            </View>

            <View style={styles.bottomButtonRow}>
              <Pressable style={styles.startTripButton} onPress={handleStartTrip}>
                <Text style={styles.startTripText}>Start Trip</Text>
              </Pressable>

              <Pressable style={styles.saveTripButton} onPress={onSave}>
                <Text style={styles.saveTripText}>Save Trip</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* render location and car select modals */}
        <Modal
          style={styles.modal}
          visible={isModalVisible}
          animationType="slide"
        >
          {modalContext === MODAL_CONTEXT.CAR_SELECT && (
            <VehicleSelection
              setVisibility={setIsModalVisible}
              onVehicleSelect={setVehicle}
            />
          )}

          {modalContext === MODAL_CONTEXT.START_LOC && (
            <AddressSelection
              setVisibility={setIsModalVisible}
              sessToken={sessionToken}
              setAddress={setStartLocation}
              setSessToken={setSessionToken}
            />
          )}

          {modalContext === MODAL_CONTEXT.END_LOC && (
            <AddressSelection
              setVisibility={setIsModalVisible}
              sessToken={sessionToken}
              setAddress={setDestination}
              setSessToken={setSessionToken}
            />
          )}
        </Modal>

        {/* render save modal */}
        <Modal
          transparent
          animationType="fade"
          visible={saveModalVisible}
          onRequestClose={() => setSaveModalVisible(false)}
        >
          <Pressable
            style={styles.saveModalOverlay}
            onPress={() => setSaveModalVisible(false)}
          >
            <Pressable style={styles.saveModalBox} onPress={() => {}}>
              <Text style={styles.saveModalTitle}>Trip Saved!</Text>
              <Text style={styles.saveModalMessage}>
                Look at the Trips section to see your saved trips.
              </Text>
              <TouchableOpacity
                style={styles.saveModalCloseButton}
                onPress={() => setSaveModalVisible(false)}
              >
                <Text style={styles.saveModalCloseText}>Close</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.primaryBackground,
    gap: 20,
  },
  screenTitle: {
    alignItems: "center",
    justifyContent: "center",
    border: "black",
    borderWidth: 2,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    height: 80,
    width: "90%",
    alignSelf: "center",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 1,
    justifyContent: "space-between",
  },
  contents: {
    gap: 20,
  },
  title: {
    color: DARK_THEME.primaryText,
    fontSize: 26,
    textAlign: "center",
    flexWrap: "wrap",
    fontWeight: "bold",
  },
  welcomeMsg: {
    color: DARK_THEME.primaryText,
    fontSize: 20,
    paddingVertical: 5,
    paddingHorizontal: 3,
    textAlign: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  locationInputWrapper: {
    flex: 1,
  },
  overviewContainer: {
    justifyContent: "flex-end",
    borderWidth: 1,
  },
  bottomButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  startTripButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  startTripText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveTripButton: {
    flex: 1,
    backgroundColor: "#e4e4e4",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveTripText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  quickEstimateContainer: {
    height: 180,
    borderColor: "#fafafa",
    borderWidth: 1,
    justifyContent: "space-between",
    borderRadius: 10,
    borderBottomWidth: 0,
  },
  estimateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  estimateDetail: {
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  estimateLabel: { color: "#fafafa", fontSize: 18, fontWeight: "bold" },
  estimateData: {
    color: "#fafafa",
    fontSize: 18,
  },
  saveBtnContainer: {
    height: 50,
    borderWidth: 0,
    backgroundColor: "#e4e4e4",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  locationButton: {
    backgroundColor: DARK_THEME.primaryText,
    paddingHorizontal: 8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 56,
    marginBottom: 0,
    marginTop: 28,
  },
  fullWidthSuggestionsBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 10,
    backgroundColor: DARK_THEME.modalBackground,
  },
  locationButtonDisabled: {
    opacity: 0.5,
  },
  locationButtonText: {
    color: DARK_THEME.primaryBackground,
    fontSize: 13,
    fontWeight: "bold",
  },
  textInput: {
    color: "#fafafa",
    paddingHorizontal: 15,
  },
  modal: {
    // backgroundColor: DARK_THEME.modalBackground,
  },
  saveModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  saveModalBox: {
    backgroundColor: DARK_THEME.modalBackground || DARK_THEME.primaryBackground,
    borderRadius: 14,
    padding: 28,
    width: "80%",
    alignItems: "center",
    gap: 12,
  },
  startLocationBlock: {
    width: "100%",
  },
  saveModalTitle: {
    color: DARK_THEME.primaryText,
    fontSize: 20,
    fontWeight: "bold",
  },

  saveModalMessage: {
    color: DARK_THEME.placeholder,
    fontSize: 15,
    textAlign: "center",
  },

  saveModalCloseButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: DARK_THEME.primaryText,
  },

  saveModalCloseText: {
    color: DARK_THEME.primaryBackground,
    fontWeight: "bold",
    fontSize: 15,
  },
  inputLabel: {
    color: DARK_THEME.primaryText,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 14,
    color: DARK_THEME.primaryText,
    fontSize: 16,
    minHeight: 52,
  },

  suggestionsBox: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 6,
    backgroundColor: DARK_THEME.modalBackground,
  },

  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.primaryBorder,
  },

  suggestionText: {
    color: DARK_THEME.primaryText,
    fontSize: 14,
  },
  helperText: {
    color: DARK_THEME.placeholder,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 8,
  },

  suggestionsBox: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 10,
    backgroundColor: DARK_THEME.modalBackground,
  },

  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.primaryBorder,
  },

  suggestionText: {
    color: DARK_THEME.primaryText,
    fontSize: 14,
  },
  vehicleRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },

  vehicleField: {
    flex: 3,
  },

  mpgField: {
    flex: 1,
  },
  recentBox: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 10,
    backgroundColor: DARK_THEME.modalBackground,
  },

  recentItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.primaryBorder,
  },

  recentLabel: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3,
  },

  recentText: {
    color: DARK_THEME.primaryText,
    fontSize: 14,
  },
  safeArea: {
    flex: 1,
  },
  formScroll: {
    flex: 1,
  },

  formScrollContent: {
    flexGrow: 1,
  },
});
