/*
AuthStack component
Wraps Authentication related screens.

Author: Bryan Cardeno                               
Date: 03-26-2026
*/
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../features/auth/screens/LoginScreen";
import ForgotPasswordScreen from "../features/auth/screens/ResetPassword";
import CreateNewAccountScreen from "../features/auth/screens/CreateNewAccount";

export default function AuthStack() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ResetPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="CreateAccount" component={CreateNewAccountScreen} />
    </Stack.Navigator>
  );
}
