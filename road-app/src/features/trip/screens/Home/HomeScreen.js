/*
HomeScreen Component                      
Default screen when authenticated.
Prompts user for trip information and displays brief estimate.

Author: Bryan Cardeno                               
Date: 02-21-2026 
*/

import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { DARK_THEME } from "../../../../shared/style/ColorScheme";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import TripDetailsScreen from "../TripDetailsScreen";
import TextInputField from "../../../../shared/component/TextInputField";
import SelectField from "../../../../shared/component/SelectField";
import { useState, useEffect } from "react";

const Tab = createBottomTabNavigator();

export default function HomeScreen({ userName }) {
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicle, setVehicle] = useState("");

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
    console.log("vehicle select pressed");
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

      <View style={styles.content}>
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
        />

        <Pressable onPress={onQuickCalc}>
          <View style={styles.caclBtnContainer}>
            <Text style={styles.calcBtn}>Quick calculate</Text>
          </View>
        </Pressable>

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

          <Pressable onPress={onSave}>
            <View style={styles.saveBtnContainer}>
              <Text style={styles.calcBtn}>Save</Text>
            </View>
          </Pressable>
        </View>
      </View>
      <Pressable onPress={onViewOverview}>
        <View style={styles.caclBtnContainer}>
          <Text style={styles.calcBtn}>View Overview</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.primaryBackground,
    gap: 20,
    // alignItems: "center",
    // paddingHorizontal: 10,
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
  content: {
    // borderColor: "lightblue",
    // borderWidth: 1,
    paddingHorizontal: 40,
    gap: 20,
    flex: 1,
    paddingTop: 20,
  },
  text: {
    color: DARK_THEME.primaryText,
  },
  title: {
    color: DARK_THEME.primaryText,
    fontSize: 24,
  },
  inputContainer: {
    borderColor: "#fafafa",
    borderWidth: 1,
    borderRadius: 6,
    height: 50,
    justifyContent: "center",
  },
  inputLabel: {
    position: "absolute",
    top: -20,
    left: 10,
    fontWeight: "bold",
    fontSize: 18,
    color: "#fafafa",
    // backgroundColor: "#fafafa",
    backgroundColor: DARK_THEME.primaryBackground,
    // borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 3,
    // borderRadius: 6,
  },
  overviewContainer: {
    justifyContent: "flex-end",
    // borderColor: "red",
    borderWidth: 1,
  },
  overviewBtn: {},
  bottomNav: {
    height: 100,
    // borderColor: "pink",
    borderWidth: 1,
    justifyContent: "flex-end",
    fontSize: 16,
    fontFamily: "Georgia",
    fontWeight: 300,
  },
  caclBtnContainer: {
    height: 50,
    // borderColor: "pink",
    borderWidth: 1,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  calcBtn: {
    fontSize: 18,
    fontWeight: "bold",
  },
  quickEstimateContainer: {
    // flex: 1,
    height: 180,
    borderColor: "#fafafa",
    borderWidth: 1,
    // backgroundColor: "red",
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
    // borderColor: "pink",
    borderWidth: 0,
    backgroundColor: "#fafafa",
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
  vechileText: {
    // paddingHorizontal: 15,
    // backgroundColor: "red",
    // flexBasis: "100%",
    color: "#94a3b8",
  },
  vechileInputContainer: {
    // backgroundColor: "red",
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
});
