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

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Crypto from "expo-crypto";
import { verifyEmail, isUserVerified } from "../../../auth/services/authServices";
import * as Location from "expo-location";
import {
  getRecentLocations,
  saveRecentLocation,
} from "../../services/recentLocationService";

import {
  getGoogleRoutes,
  getGoogleGasStationNearbyFromLocation,
  getGooglePlaceLongLat,
} from "../../services/googleAPIService";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { getAuth } from "firebase/auth";

import VehicleSelection from "./VehicleSelection";
import AddressSelection from "./AddressSelection";
import SelectField from "../../../../shared/component/SelectField";

import { DARK_THEME } from "../../../../shared/style/ColorScheme";

import {
  metersToMiles,
  secondsToMinutes,
} from "../../../../shared/utility/utils";

const createStopObject = () => ({
  id: Crypto.randomUUID(),
  placeId: null,
  text: null,
});

export default function HomeScreen({ userName }) {
  const MODAL_CONTEXT = {
    START_LOC: "start",
    END_LOC: "end",
    CAR_SELECT: "vehicle",
    STOP_LOC: "stop",
  };

  const GOOGLE_PLACES_ENDPOINT =
    "https://places.googleapis.com/v1/places:autocomplete";

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
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState("");
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
  const [startAutocompleteLoading, setStartAutocompleteLoading] =
    useState(false);
  const [destinationAutocompleteLoading, setDestinationAutocompleteLoading] =
    useState(false);
  const [recentLocations, setRecentLocations] = useState([]);
  const [activeLocationField, setActiveLocationField] = useState(null);

  const debounceRef = useRef(null);
  const sessionTokenRef = useRef(`home-${Date.now()}`);
  const emailVerificationAlertShownRef = useRef(false);

  const resetSessionToken = () => {
    const newToken = Crypto.randomUUID();
    sessionTokenRef.current = newToken;
    setSessionToken(newToken);
  };

  const getLocationText = (location) => {
    return location?.placePrediction?.text?.text || "";
  };

  useEffect(() => {
    if (emailVerificationAlertShownRef.current) return;
    if (!user) return;
    if (isUserVerified()) return;

    emailVerificationAlertShownRef.current = true;

    Alert.alert(
      "Email is not verified",
      "Please verify your email. Check your email for an existing link, or click send again to receive a new one.",
      [
        {
          text: "Okay",
        },
        {
          text: "Send Again",
          onPress: async () => {
            const result = await verifyEmail();

            if (result && result.success === false) {
              Alert.alert(
                "Verification Error",
                result.error || "Could not send verification email."
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  }, [user]);

  const findCheapest = (ar) => {
    let val = 999;

    ar.forEach((element) => {
      const regular = element?.fuelOptions?.fuelPrices?.find(
        (gasType) => gasType.type === "REGULAR_UNLEADED"
      );

      if (!regular?.price) return;

      const wholePrice = Number(regular.price.units || 0);
      const decimal = Number(regular.price.nanos || 0) / 1000000000;
      const price = wholePrice + decimal;

      if (Number.isFinite(price) && price < val) {
        val = price;
      }
    });

    return val === 999 ? 0 : val;
  };

  const onQuickCalc = async () => {
    if (!longLat) {
      console.log("long lat invalid", longLat);
      return;
    }

    if (
      !startLocation?.placePrediction?.placeId ||
      !destination?.placePrediction?.placeId
    ) {
      console.log("Missing start or destination placeId");
      return;
    }

    try {
      const filterStations = gasStations.filter((gas) => gas.fuelOptions);
      const cheapest = findCheapest(filterStations);

      const intermediates = stops
        .filter((stop) => stop.placeId)
        .map((stop) => ({
          placeId: stop.placeId,
        }));

      const routeDistance = await getGoogleRoutes(
        startLocation.placePrediction.placeId,
        destination.placePrediction.placeId,
        intermediates
      );

      const route = routeDistance?.routes?.[0];

      if (!route) {
        console.log("No route found");
        return;
      }

      const { distanceMeters, duration, polyline } = route;

      const result = {
        distance: Math.ceil(metersToMiles(distanceMeters)),
        duration: Math.ceil(secondsToMinutes(duration)),
        gasPrice: cheapest,
        polylines: polyline,
      };

      setEstimate(result);
      return result;
    } catch (error) {
      console.error("Quick calc error:", error);
    }
  };

  const handleUseMyLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError("");

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError(
          "Location permission denied. Enable it in your device settings."
        );
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
        : `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(
            5
          )}`;

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
      setActiveLocationField(null);
      Keyboard.dismiss();

      await saveRecentLocation({
        placeId: null,
        description: formattedLocation,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        type: "current_location",
      });

      await refreshRecentLocations();

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
      if (!startLocation || !destination || !vehicle) {
        Alert.alert(
          "Missing Trip Info",
          "Please select a starting location, destination, and vehicle."
        );
        return;
      }

      if (!destination?.placePrediction?.placeId) {
        Alert.alert("Missing Destination", "Please select a valid destination.");
        return;
      }

      if (startLocation?.isCurrentLocation && startLocation?.coordinates) {
        Alert.alert(
          "Current Location Selected",
          "Starting a trip from current location is not supported by this route service yet. Please select a saved place instead."
        );
        return;
      }

      if (!startLocation?.placePrediction?.placeId) {
        Alert.alert(
          "Missing Starting Location",
          "Please select a valid starting location."
        );
        return;
      }

      const filterStations = gasStations.filter((gas) => gas.fuelOptions);
      const cheapest = findCheapest(filterStations);

      const intermediates = stops
        .filter((stop) => stop.placeId)
        .map((stop) => ({
          placeId: stop.placeId,
        }));

      const routeDistance = await getGoogleRoutes(
        startLocation.placePrediction.placeId,
        destination.placePrediction.placeId,
        intermediates
      );

      const route = routeDistance?.routes?.[0];

      if (!route) {
        Alert.alert("Route Error", "Could not calculate this route.");
        return;
      }

      const { distanceMeters, duration, polyline } = route;

      const estDetail = {
        distance: Math.ceil(metersToMiles(distanceMeters)),
        duration: Math.ceil(secondsToMinutes(duration)),
        gasPrice: cheapest,
        polylines: polyline,
      };

      const vehicleLabel =
        typeof vehicle === "string"
          ? vehicle
          : `${vehicle?.year || ""} ${vehicle?.make || ""} ${
              vehicle?.model || ""
            }`.trim();

      navigation.navigate("Overview", {
        estDetail,
        pointA: {
          placePrediction: {
            text: {
              text:
                startLocation?.placePrediction?.text?.text || "Unknown start",
            },
          },
        },
        pointB: {
          placePrediction: {
            text: {
              text:
                destination?.placePrediction?.text?.text ||
                "Unknown destination",
            },
          },
        },
        car: {
          ...(typeof vehicle === "object" && vehicle ? vehicle : {}),
          label: vehicleLabel,
          mpg_combined: Number(vehicle?.mpg_combined || mpg) || 25,
        },
      });
    } catch (error) {
      console.error("Start trip error:", error);
      Alert.alert("Trip Error", "Could not start this trip.");
    }
  };

  const onSave = () => {
    setSaveModalVisible(true);
  };

  const onViewOverview = async () => {
    if (!startLocation || !destination || !vehicle) return;

    const est = await onQuickCalc();

    if (!est) return;

    navigation.navigate("Overview", {
      estDetail: est,
      pointA: startLocation,
      pointB: destination,
      car: vehicle,
    });
  };

  const onSelectVehicle = () => {
    setModalContext(MODAL_CONTEXT.CAR_SELECT);
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

    if (!PLACES_API_KEY) {
      console.log("Missing Google Places API key");
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
      setValidationErrors((e) => ({ ...e, startLocation: undefined }));
    } else {
      setDestination(suggestion);
      setDestinationSuggestions([]);
      setValidationErrors((e) => ({ ...e, destination: undefined }));
    }

    await saveRecentLocation({
      placeId: suggestion?.placePrediction?.placeId || null,
      description: selectedText,
      type: "place",
    });

    await refreshRecentLocations();

    resetSessionToken();
    setActiveLocationField(null);
    Keyboard.dismiss();
  };

  const getFilteredRecents = (field) => {
    const text =
      field === "start"
        ? getLocationText(startLocation)
        : getLocationText(destination);

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
      setValidationErrors((e) => ({ ...e, startLocation: undefined }));
    } else {
      setDestination(selectedLocation);
      setDestinationSuggestions([]);
      setValidationErrors((e) => ({ ...e, destination: undefined }));
    }

    resetSessionToken();
    Keyboard.dismiss();
    setActiveLocationField(null);
  };

  const refreshRecentLocations = async () => {
    const recents = await getRecentLocations();
    setRecentLocations(recents || []);
  };

  useEffect(() => {
    refreshRecentLocations();
  }, []);

  useEffect(() => {
    if (!startLocation) return;

    const getLongLat = async () => {
      try {
        if (startLocation?.isCurrentLocation && startLocation?.coordinates) {
          const coords = {
            latitude: startLocation.coordinates.latitude,
            longitude: startLocation.coordinates.longitude,
          };

          setLongLat(coords);

          const { places } = await getGoogleGasStationNearbyFromLocation(
            coords
          );
          setGasStations(places || []);
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

          setGasStations(places || []);
        }
      } catch (error) {
        console.error("Location lookup error:", error);
      }
    };

    getLongLat();
  }, [startLocation]);

  const handleAddStop = () => {
    if (stops.length === 25) return;

    setStops((prevStops) => [...prevStops, createStopObject()]);
  };

  const handleStopAddress = (item) => {
    setStops((prevStops) => {
      const newStops = prevStops.map((stop) => {
        if (stop.id !== selectedStop) return stop;

        return {
          ...stop,
          placeId: item.placePrediction.placeId,
          text: item.placePrediction.text.text,
        };
      });

      return newStops;
    });
  };

  const onTrashPress = (id) => {
    setStops((prevStops) => {
      const newStops = prevStops.filter((stop) => stop.id !== id);

      return newStops;
    });
  };

  const onStopChange = (id) => {
    setSelectedStop(id);
    setModalContext(MODAL_CONTEXT.STOP_LOC);
    setIsModalVisible(true);
  };

  const renderStops = ({ item, index }) => (
    <View style={styles.stopContainer}>
      <SelectField
        label={`Stop ${index + 1}`}
        placeholder="Enter a stop"
        handlePress={() => onStopChange(item.id)}
        labelBgColor={DARK_THEME.primaryBackground}
        containerStyle={{ flex: 1 }}
        value={item.text}
      />
      <Pressable onPress={() => onTrashPress(item.id)}>
        <View style={styles.trashContainer}>
          <FontAwesome name="trash-o" size={24} color="#fafafa" />
        </View>
      </Pressable>
    </View>
  );

  const renderLocationResults = (field) => {
    if (activeLocationField !== field) return null;

    const recents = getFilteredRecents(field);
    const suggestions =
      field === "start" ? startSuggestions : destinationSuggestions;
    const loading =
      field === "start"
        ? startAutocompleteLoading
        : destinationAutocompleteLoading;
    const fieldText =
      field === "start"
        ? getLocationText(startLocation)
        : getLocationText(destination);

    return (
      <View style={styles.resultsContainer}>
        {recents.length > 0 ? (
          <View style={styles.resultsBox}>
            <Text style={styles.resultSectionTitle}>Recent</Text>
            {recents.map((item, index) => (
              <TouchableOpacity
                key={`recent-${item.placeId || item.description}-${index}`}
                style={styles.resultItem}
                onPressIn={() => handleSelectRecentLocation(field, item)}
              >
                <Text style={styles.recentTag}>Recent</Text>
                <Text style={styles.itemText}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {loading ? (
          <Text style={styles.helperText}>Loading suggestions...</Text>
        ) : null}

        {suggestions.length > 0 ? (
          <View style={styles.resultsBox}>
            <Text style={styles.resultSectionTitle}>Suggestions</Text>
            {suggestions.slice(0, 5).map((item, index) => (
              <TouchableOpacity
                key={
                  item?.placePrediction?.placeId ||
                  `suggestion-${field}-${index}`
                }
                style={styles.resultItem}
                onPressIn={() => handleSelectSuggestion(field, item)}
              >
                <Text style={styles.suggestionText}>
                  {item?.placePrediction?.text?.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {fieldText.trim().length > 2 &&
        !loading &&
        suggestions.length === 0 &&
        recents.length === 0 ? (
          <Text style={styles.helperText}>No locations found.</Text>
        ) : null}
      </View>
    );
  };

  const renderLocationInput = (field) => {
    const isStart = field === "start";
    const label = isStart ? "Starting Location" : "Destination";
    const placeholder = isStart
      ? "Enter starting location"
      : "Enter destination";
    const value = isStart
      ? getLocationText(startLocation)
      : getLocationText(destination);

    const inputContent = (
      <View
        style={
          isStart ? styles.locationInputWrapper : styles.locationInputFull
        }
      >
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={[
            styles.input,
            activeLocationField === field && styles.activeInput,
            validationErrors[isStart ? "startLocation" : "destination"] &&
              styles.inputError,
          ]}
          placeholder={placeholder}
          placeholderTextColor={DARK_THEME.placeholder}
          value={value}
          onFocus={() => setActiveLocationField(field)}
          onBlur={() => {
            setTimeout(() => {
              setActiveLocationField((current) =>
                current === field ? null : current
              );
            }, 250);
          }}
          onChangeText={(text) => {
            setActiveLocationField(field);
            handleAddressTyping(field, text);
          }}
        />
      </View>
    );

    return (
      <View style={styles.locationInputBlock}>
        {isStart ? (
          <View style={styles.locationRow}>
            {inputContent}

            <TouchableOpacity
              style={[
                styles.locationButton,
                locationLoading && styles.locationButtonDisabled,
              ]}
              onPress={handleUseMyLocation}
              disabled={locationLoading}
            >
              <Text style={styles.locationButtonText}>
                {locationLoading ? "Locating..." : "Use my location"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          inputContent
        )}

        {isStart && locationError ? (
          <Text style={styles.helperText}>{locationError}</Text>
        ) : null}

        {renderLocationResults(field)}
      </View>
    );
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
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
              {renderLocationInput("start")}

              {renderLocationInput("destination")}

              {stops.length > 0 && (
                <View style={styles.stopsList}>
                  {stops.map((item, index) => (
                    <View key={item.id}>{renderStops({ item, index })}</View>
                  ))}
                </View>
              )}

              <SelectField
                placeholder="Add a stop +"
                handlePress={handleAddStop}
                labelBgColor={DARK_THEME.primaryBackground}
                isPlaceholderCenter={true}
              />

              <SelectField
                label="Vehicle"
                placeholder="Select a vehicle"
                handlePress={onSelectVehicle}
                labelBgColor={DARK_THEME.primaryBackground}
                value={
                  typeof vehicle === "string"
                    ? vehicle
                    : vehicle
                    ? `${vehicle.year || ""} ${vehicle.make || ""} ${
                        vehicle.model || ""
                      }`.trim()
                    : ""
                }
              />
            </View>

            <View style={styles.bottomButtonRow}>
              <Pressable
                style={styles.startTripButton}
                onPress={handleStartTrip}
              >
                <Text style={styles.startTripText}>Start Trip</Text>
              </Pressable>

              <Pressable style={styles.saveTripButton} onPress={onSave}>
                <Text style={styles.saveTripText}>Save Trip</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <Modal
          style={styles.modal}
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
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

          {modalContext === MODAL_CONTEXT.STOP_LOC && (
            <AddressSelection
              setVisibility={setIsModalVisible}
              sessToken={sessionToken}
              setAddress={handleStopAddress}
              setSessToken={setSessionToken}
            />
          )}
        </Modal>

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
  },
  screenTitle: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: "black",
    borderWidth: 2,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    height: 76,
    width: "90%",
    alignSelf: "center",
    marginTop: 8,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  contents: {
    gap: 16,
  },
  title: {
    color: DARK_THEME.primaryText,
    fontSize: 24,
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
  locationInputBlock: {
    width: "100%",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  locationInputWrapper: {
    flex: 1,
  },
  locationInputFull: {
    width: "100%",
  },
  activeInput: {
    borderColor: "#93C5FD",
  },
  inputError: {
    borderColor: "red",
    borderWidth: 2,
  },
  overviewContainer: {
    justifyContent: "flex-end",
    borderWidth: 1,
  },
  bottomButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
    marginBottom: 10,
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
  estimateLabel: {
    color: "#fafafa",
    fontSize: 18,
    fontWeight: "bold",
  },
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
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 52,
    width: 96,
    marginTop: 27,
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
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  textInput: {
    color: "#fafafa",
    paddingHorizontal: 15,
  },
  modal: {},
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
  resultsContainer: {
    marginTop: 8,
    gap: 8,
  },
  resultsBox: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: DARK_THEME.modalBackground || "#1e293b",
  },
  resultSectionTitle: {
    color: "#93C5FD",
    fontSize: 13,
    fontWeight: "bold",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  resultItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: DARK_THEME.primaryBorder,
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
  itemText: {
    color: DARK_THEME.primaryText,
    fontSize: 14,
  },
  helperText: {
    color: DARK_THEME.placeholder,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 8,
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
  recentTag: {
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
  stopsList: {
    gap: 10,
  },
  flatListContainer: {
    height: 300,
  },
  flatListContent: {
    gap: 10,
    paddingVertical: 10,
  },
  stopContainer: {
    flexDirection: "row",
    flexGrow: 1,
    gap: 10,
  },
  trashContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 4,
  },
  formScroll: {
    flex: 1,
  },
  formScrollContent: {
    flexGrow: 1,
  },
});