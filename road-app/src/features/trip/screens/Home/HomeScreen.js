/*
HomeScreen Component                      
Default screen when authenticated.
Prompts user for trip information and displays brief estimate.

Author: Bryan Cardeno                               
Date: 02-21-2026 
*/

import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Crypto from "expo-crypto";

import {
  getGoogleDistance,
  getGoogleGasStationNearbyFromLocation,
  getGooglePlaceLongLat,
} from "../../services/googleAPIService";

import VehicleSelection from "./VehicleSelection";
import AddressSelection from "./AddressSelection";
import SelectField from "../../../../shared/component/SelectField";

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

  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContext, setModalContext] = useState(null);
  const [sessionToken, setSessionToken] = useState(() => Crypto.randomUUID());
  const [estimate, setEstimate] = useState("");
  const [longLat, setLongLat] = useState("");
  const [gasStations, setGasStations] = useState([]);

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

  const onSave = () => {
    console.log("save pressed");
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
      const data = await getGooglePlaceLongLat(
        startLocation.placePrediction.placeId,
      );

      setLongLat(data.location);

      const { places } = await getGoogleGasStationNearbyFromLocation(
        data.location,
      );

      setGasStations(places);
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
          <Text style={styles.title}>Welcome {userName || "Road Buddy"}</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.contents}>
            <SelectField
              label="Starting Location"
              placeholder="Enter starting location"
              handlePress={onStartLocationChange}
              labelBgColor={DARK_THEME.primaryBackground}
              value={startLocation && startLocation.placePrediction.text.text}
            />

            <SelectField
              label="Destination"
              placeholder="Enter destination"
              handlePress={onDestinationChange}
              labelBgColor={DARK_THEME.primaryBackground}
              value={destination && destination.placePrediction.text.text}
            />

            <SelectField
              label="Vehicle"
              placeholder="Select a vehicle"
              handlePress={onSelectVehicle}
              labelBgColor={DARK_THEME.primaryBackground}
              value={
                vehicle && `${vehicle.year} ${vehicle.make} ${vehicle.model}`
              }
            />
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
            )}
          </View>

          <View style={styles.caclBtnContainer}>
            <Pressable onPress={onViewOverview}>
              <Text style={styles.calcBtn}>View Overview</Text>
            </Pressable>
          </View>
        </View>

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
    height: 50,
    width: "90%",
    alignSelf: "center",
  },
  contentContainer: {
    paddingHorizontal: 40,
    paddingVertical: 10,
    flex: 1,
    justifyContent: "space-between",
  },
  contents: {
    gap: 20,
  },
  title: {
    color: DARK_THEME.primaryText,
    fontSize: 24,
  },
  overviewContainer: {
    justifyContent: "flex-end",
    borderWidth: 1,
  },
  caclBtnContainer: {
    height: 50,
    borderWidth: 1,
    backgroundColor: "#e4e4e4",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  calcBtn: {
    fontSize: 18,
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
  textInput: {
    color: "#fafafa",
    paddingHorizontal: 15,
  },
  modal: {
    // backgroundColor: DARK_THEME.modalBackground,
  },
  safeArea: {
    flex: 1,
  },
});
