/*
HomeScreen Component                      
Default screen when authenticated.
Prompts user for trip information and displays brief estimate.

Author: Bryan Cardeno                               
Date: 02-21-2026 
*/

import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { DARK_THEME } from "../../../../shared/style/ColorScheme";
import { useNavigation } from "@react-navigation/native";

import TripDetailsScreen from "../TripDetailsScreen";
import VehicleSelection from "./VehicleSelection";
import TextInputField from "../../../../shared/component/TextInputField";
import SelectField from "../../../../shared/component/SelectField";
import { useState, useEffect } from "react";

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

  const onQuickCalc = () => {
    console.log("quick save pressed");
  };

  const onSave = () => {
    console.log("save pressed");
  };

  const onViewOverview = () => {
    console.log("view overview pressed");
  };

  const onSelectVehicle = () => {
    console.log("test");
    setModalContext(MODAL_CONTEXT.CAR_SELECT);
    setIsModalVisible(true);
  };

  const onStartLocationChange = (e) => {
    console.log("startlocation input changed", e);
    setStartLocation(e);
  };

  useEffect(() => {
    console.log("startlocation value:", startLocation);
  }, [startLocation]);

  const onDestinationChange = (e) => {
    console.log("destination input changed", e);
    setDestination(e);
    console.log("destination value:", destination);
  };

  useEffect(() => {
    console.log("destination value:", destination);
  }, [destination]);

  return (
    <View style={styles.container}>
      <View style={styles.screenTitle}>
        <Text style={styles.title}>Welcome {userName || "Road Buddy"}</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.contents}>
          <TextInputField
            label="Starting Location"
            placeholder="Enter starting location"
            handleInputChange={onStartLocationChange}
          />

          <TextInputField
            label="Destination"
            placeholder="Enter destination"
            handleInputChange={onDestinationChange}
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

          <View style={styles.caclBtnContainer}>
            <Pressable onPress={onQuickCalc}>
              <Text style={styles.calcBtn}>Quick calculate</Text>
            </Pressable>
          </View>

          <View style={styles.quickEstimateContainer}>
            <View style={styles.estimateDetail}>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLabel}>Distance: </Text>
                <Text style={styles.estimateData}>50 mi</Text>
              </View>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLabel}>Estimated Cost : </Text>
                <Text style={styles.estimateData}>$50.00</Text>
              </View>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLabel}>ETA: </Text>
                <Text style={styles.estimateData}>40 min</Text>
              </View>
            </View>

            <View style={styles.saveBtnContainer}>
              <Pressable onPress={onSave}>
                <Text style={styles.calcBtn}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.caclBtnContainer}>
          <Pressable onPress={() => navigation.navigate("Overview")}>
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
      </Modal>
    </View>
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
  // not impelemented yet
  // bottomNav: {
  //   height: 100,
  //   // borderColor: "pink",
  //   borderWidth: 1,
  //   justifyContent: "flex-end",
  //   fontSize: 16,
  //   fontFamily: "Georgia",
  //   fontWeight: 300,
  // },
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
});
