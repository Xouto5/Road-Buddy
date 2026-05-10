/*
AuthStack component
Wraps Authentication related screens and handles the Gatekeeper transition.

Author: Bryan Cardeno                               
Date: 03-26-2026

*/

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../features/auth/screens/LoginScreen";
import ForgotPasswordScreen from "../features/auth/screens/ResetPassword";
import CreateNewAccountScreen from "../features/auth/screens/CreateNewAccount";
import WelcomeScreen from "../features/auth/screens/WelcomeScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack({ setIsReady }) {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }} 
      />
      
      <Stack.Screen name="Login" options={{ headerShown: false }}>
        {(props) => <LoginScreen {...props} setIsReady={setIsReady} />}
      </Stack.Screen>

      <Stack.Screen 
        name="ResetPassword" 
        component={ForgotPasswordScreen} 
        options={{ headerShown: false }}
      />
      
      <Stack.Screen name="CreateAccount" options={{ headerShown: false }}>
        {(props) => <CreateNewAccountScreen {...props} setIsReady={setIsReady} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}