// if Home is “Start a trip / Continue / Saved trips”. Basically the trip entry pointimport { View, Text, StyleSheet } from "react-native";

import { View, Text, StyleSheet, Pressable } from "react-native";
import { DARK_THEME } from "../../../shared/ColorScheme";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import TripDetailsScreen from "./TripDetailsScreen";

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  const userName = "USER"; // temporary. gonna be replaced by props

  return (
    <View style={styles.container}>
      <View style={styles.screenTitle}>
        <Text style={styles.title}>Welcome User</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>From</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>To</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Select Car</Text>
        </View>

        <Pressable>
          <View style={styles.caclBtnContainer}>
            <Text style={styles.calcBtn}>Quick calculate</Text>
          </View>
        </Pressable>
      </View>
      <Pressable>
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
    borderColor: "lightblue",
    borderWidth: 1,
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
  },
  inputLabel: {
    position: "absolute",
    top: -16,
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
    borderColor: "red",
    borderWidth: 1,
  },
  overviewBtn: {},
  bottomNav: {
    height: 100,
    borderColor: "pink",
    borderWidth: 1,
    justifyContent: "flex-end",
    fontSize: 16,
    fontFamily: "Georgia",
    fontWeight: 300,
  },
  caclBtnContainer: {
    height: 50,
    borderColor: "pink",
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
});
