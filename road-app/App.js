// Manuel

//import navigation, StatusBar for handling status bar and screens
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from "./src/features/auth/screens/LoginScreen";
import ProfileSetupScreen from "./src/features/auth/screens/ProfileSetupScreen";

// Create a stack navigator instance
const Stack = createNativeStackNavigator();


export default function App() {
  return (
    // Wrap the app in NavigationContainer to enable navigation for login, setting profile and
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

