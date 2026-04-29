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

import { View, Text, StyleSheet, Pressable, Modal, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Crypto from "expo-crypto";
import * as Location from "expo-location";

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

  const navigation = useNavigation();

  const auth = getAuth();
  const user = auth.currentUser;

  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicle, setVehicle] = useState("");
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

  /*const onQuickCalc = async () => {
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
*/
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
        car: vehicle,
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
      <View style={styles.container}>
        <View style={styles.screenTitle}>
          <Text style={styles.title}>Welcome</Text> 
          <Text style={styles.title}>{user?.email}</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.contents}>
            <Text style={styles.welcomeMsg}>Where do you want to go?</Text>

            <View style={styles.locationRow}>
              <View style={{ flex: 1 }}>
                <SelectField
                  label="Start Location"
                  placeholder="Enter starting location"
                  handlePress={onStartLocationChange}
                  labelBgColor={DARK_THEME.primaryBackground}
                  value={startLocation?.placePrediction?.text?.text || ""}
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


            <SelectField
                label="Destination"
                placeholder="Enter destination"
                handlePress={onDestinationChange}
                labelBgColor={DARK_THEME.primaryBackground}
                value={destination?.placePrediction?.text?.text || ""}
              />

            <SelectField
              label="Vehicle"
              placeholder="Select a vehicle"
              handlePress={onSelectVehicle}
              labelBgColor={DARK_THEME.primaryBackground}
              value={
                vehicle
                  ? `${vehicle.year ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""}`.trim()
                  : ""
              }
            />
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
    alignItems: "stretch",
    gap: 10,
    marginBottom: 6,
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
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 52,
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
  safeArea: {
    flex: 1,
  },
});
