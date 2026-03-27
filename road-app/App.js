import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import LoginScreen from "./src/features/auth/screens/LoginScreen";
import SettingsScreen from "./src/features/settings/screens/SettingsScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/features/trip/screens/Home/HomeScreen";
import TripsSummaryScreen from "./src/features/trip/screens/TripsSummaryScreen";
import TripDetailsScreen from "./src/features/trip/screens/TripDetails/TripDetailsScreen";
import ProfileSetupScreen from "./src/features/auth/screens/ProfileSetupScreen";
import CreateNewAccountScreen from "./src/features/auth/screens/CreateNewAccount";
import CostScreen from "./src/features/cost/screens/CostScreen";
import EstimateScreen from "./src/features/cost/screens/EstimateScreen";
import ResetPasswordScreen from "./src/features/auth/screens/ResetPassword";
import { SafeAreaView } from "react-native-safe-area-context";
import TempMenuScreen from "./src/navigation/TempMenu";
import BottomNav from "./src/navigation/BottomNav";
import AuthStack from "./src/navigation/AuthStack";
import { onAuthStateChanged } from "firebase/auth";
import { getAuth } from "firebase/auth";
//import { performFirestoreOperations } from "./src/core/firebase/firebaseConfig";

// Create a stack navigator instance
const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user.uid);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={BottomNav}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
