import React from "react";
import { StatusBar } from "expo-status-bar";
import LoginScreen from "./src/features/auth/screens/LoginScreen";
import SettingsScreen from "./src/features/settings/screens/SettingsScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./src/features/trip/screens/HomeScreen";
import TripsSummaryScreen from "./src/features/trip/screens/TripsSummaryScreen";
import TripDetailsScreen from "./src/features/trip/screens/TripDetailsScreen";
import ProfileSetupScreen from "./src/features/auth/screens/ProfileSetupScreen";

// Temporary Menu Screen. Will be removed
import TempMenuScreen from "./src/navigation/TempMenu";

// Create a stack navigator instance
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // Added temporary navigation to each screens. Added Manuel's changes.
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TempMenu">
        <Stack.Screen name="TempMenu" component={TempMenuScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Plan" component={HomeScreen} />
        <Stack.Screen name="Overview" component={TripDetailsScreen} />
        <Stack.Screen name="Trips" component={TripsSummaryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
