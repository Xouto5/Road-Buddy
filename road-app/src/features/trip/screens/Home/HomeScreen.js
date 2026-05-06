/*
HomeScreen Component                      
Default screen when authenticated.
Prompts user for trip information and displays brief estimate.

Author: Bryan Cardeno                               
Date: 02-21-2026 
*/

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Crypto from "expo-crypto";

import {
  getGoogleRoutes,
  getGoogleGasStationNearbyFromLocation,
  getGooglePlaceLongLat,
} from "../../services/googleAPIService";

import FontAwesome from "@expo/vector-icons/FontAwesome";

import VehicleSelection from "./VehicleSelection";
import AddressSelection from "./AddressSelection";
import SelectField from "../../../../shared/component/SelectField";

import { DARK_THEME } from "../../../../shared/style/ColorScheme";

import {
  metersToMiles,
  secondsToMinutes,
  calcGasCost,
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

  const navigation = useNavigation();

  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContext, setModalContext] = useState(null);
  const [sessionToken, setSessionToken] = useState(() => Crypto.randomUUID());
  const [estimate, setEstimate] = useState("");
  const [longLat, setLongLat] = useState("");
  const [gasStations, setGasStations] = useState([]);

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
  const onQuickCalc = async () => {
    // if (!startLocation || !destination) {
    //   console.log("invalid start or destination");
    //   return;
    // }

    if (!longLat) {
      console.log("long lat invalid", longLat);
      return;
    }

    const filterStations = gasStations.filter((gas) => gas.fuelOptions);
    const cheapest = findCheapest(filterStations);

    const intermediates = stops.map((stop) => {
      placeId: stop.placeId;
    });

    const routeDistance = await getGoogleRoutes(
      startLocation.placePrediction.placeId,
      destination.placePrediction.placeId,
      intermediates,
    );

    const { distanceMeters, duration, polyline } = routeDistance.routes[0];

    const result = {
      distance: Math.ceil(metersToMiles(distanceMeters)),
      duration: Math.ceil(secondsToMinutes(duration)),
      gasPrice: cheapest,
      polylines: polyline,
    };

    setEstimate(result);
    return result;
  };

  const onSave = () => {
    console.log("save pressed");
  };

  const onViewOverview = async () => {
    if (!startLocation || !destination || !vehicle) return;

    const est = await onQuickCalc();

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

  // useEffect(() => {
  //   if (!startLocation || !destination) return;
  // }, [startLocation, destination]);

  const handleAddStop = () => {
    if (stops.length === 25) return;

    setStops((prevStops) => [...prevStops, createStopObject()]);
  };

  const handleStopAddress = (item) => {
    console.log("item", item);
    console.log("selected stop", selectedStop);

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
    console.log(id);

    setStops((prevStops) => {
      const newStops = prevStops.filter((stop) => stop.id != id);

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

            {stops.length > 0 && (
              <FlatList
                style={styles.flatListContainer}
                contentContainerStyle={styles.flatListContent}
                data={stops}
                renderItem={renderStops}
                keyExtractor={(item) => item.id}
                scrollEnabled={true}
              />
            )}

            <SelectField
              placeholder="Add a stop +"
              handlePress={handleAddStop}
              labelBgColor={DARK_THEME.primaryBackground}
              value={
                vehicle && `${vehicle.year} ${vehicle.make} ${vehicle.model}`
              }
              isPlaceholderCenter={true}
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
            {/* <Pressable onPress={onQuickCalc}>
              <View style={styles.caclBtnContainer}>
                <Text style={styles.calcBtn}>Quick calculate</Text>
              </View>
            </Pressable> */}

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
          <Pressable onPress={onViewOverview}>
            <View style={styles.caclBtnContainer}>
              <Text style={styles.calcBtn}>Done</Text>
            </View>
          </Pressable>
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

          {modalContext === MODAL_CONTEXT.STOP_LOC && (
            <AddressSelection
              setVisibility={setIsModalVisible}
              sessToken={sessionToken}
              setAddress={handleStopAddress}
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
    // backgroundColor: "pink",
  },
  trashContainer: {
    // backgroundColor: "red",
    justifyContent: "center",
    flex: 1,
  },
});
