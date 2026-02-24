// if Home is “Start a trip / Continue / Saved trips”. Basically the trip entry pointimport { View, Text, StyleSheet } from "react-native";

import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { DARK_THEME } from "../../../../shared/style/ColorScheme";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import TripDetailsScreen from "../TripDetailsScreen";
import { useState } from "react";

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  const [userName, setUserName] = useState("Road Buddy"); // temporary. gonna be replaced by props
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

  return (
    <View style={styles.container}>
      <View style={styles.screenTitle}>
        <Text style={styles.title}>Welcome {userName}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Starting Location</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter starting location"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Destination</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter destination"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <Pressable onPress={onSelectVehicle}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Vehicle</Text>

            <View style={styles.vechileInputContainer}>
              <Text style={styles.vechileText}>Select a vehicle</Text>
            </View>
          </View>
        </Pressable>

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
    borderRadius: 6,
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
