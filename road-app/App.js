import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import BottomNav from "./src/navigation/BottomNav";
import AuthStack from "./src/navigation/AuthStack";
import TripResults from "./src/features/cost/screens/TripResults";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setIsReady(false);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {isAuthenticated && isReady ? (
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
          <AuthStack setIsReady={setIsReady} />
        )}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}