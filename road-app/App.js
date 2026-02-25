import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import LoginScreen from "./src/features/auth/screens/LoginScreen";
import SettingsScreen from "./src/features/settings/screens/SettingsScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/features/trip/screens/HomeScreen";
import TripsSummaryScreen from "./src/features/trip/screens/TripsSummaryScreen";
import TripDetailsScreen from "./src/features/trip/screens/TripDetailsScreen";
import ProfileSetupScreen from "./src/features/auth/screens/ProfileSetupScreen";
import TempMenuScreen from "./src/navigation/TempMenu"; 
//import { performFirestoreOperations } from "./src/core/firebase/firebaseConfig"; 

// Create a stack navigator instance
const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const fetchData = async () => {
      // Example: Only call if specific condition
      // await performFirestoreOperations(); 
    };
    fetchData();
  }, []);

  return (
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

