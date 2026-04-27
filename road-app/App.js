import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomNav from "./src/navigation/BottomNav";
import TripResults from "./src/features/cost/screens/TripResults";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {isAuthenticated ? (
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={BottomNav}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TripResults"
              component={TripResults}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
