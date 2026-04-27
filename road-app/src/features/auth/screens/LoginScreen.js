/* ======================================== //
CREDITS:

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { loginUser } from '../services/authServices';
// Set username and password of user
KEITH: Login screen for RoadBuddy app. Users can enter their username and password to log in, 
       or use social login options. The screen also includes links for password recovery and account creation.
       RoadBuddy Logo is at the top. White back button is also at the top left corner of the screen to allow users 
       to navigate back to the weclome screen.

       Date completed: 02/24/2026

MANUEL:
  I have created the text boxes for username and passowrd outline. Added barely any CSS to it too


// ======================================== */

import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

import { DARK_THEME } from "../../../shared/style/ColorScheme";
import {
  loginUser,
  observeAuthState,
  handleGoogleAuth,
} from "../services/authServices";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // SESSION PERSISTENCE
  useEffect(() => {
    let isActive = true;

    const unsub = observeAuthState((user) => {
      if (user && isActive) {
        navigation.replace("TempMenu");
      }
    });

    return () => {
      isActive = false;
      unsub();
    };
  }, []);

  // GOOGLE LOGIN
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "944461914532-jnl46dug30ngr3v3m5en7e7n1fpi691e.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID",
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    webClientId: "944461914532-jnl46dug30ngr3v3m5en7e7n1fpi691e.apps.googleusercontent.com",
  });

  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (response?.type === "success") {
        const idToken = response.authentication?.idToken;
        const accessToken = response.authentication?.accessToken;

        const result = await handleGoogleAuth(idToken, accessToken);

        if (!result.success) {
          Alert.alert("Login Failed", result.error);
        }
      }
    };

    handleGoogleLogin();
  }, [response]);

  // EMAIL LOGIN
  const handleEmailLogin = async () => {
    const email = username.trim();

    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter email and password.");
      return;
    }

    const result = await loginUser(email, password);

    if (!result.success) {
      Alert.alert("Login Failed", result.error);
      return;
    }

    navigation.replace("TempMenu");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../assets/images/RoadBuddyLogoText.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={DARK_THEME.placeholder}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={DARK_THEME.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* EMAIL LOGIN */}
        <TouchableOpacity style={styles.loginButton} onPress={handleEmailLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* GOOGLE LOGIN */}
        <TouchableOpacity
          style={[styles.socialButton, !request && { opacity: 0.5 }]}
          disabled={!request}
          onPress={() => promptAsync()}
        >
          <Text style={styles.socialButtonText}>Login with Google</Text>
        </TouchableOpacity>

        {/* PLACEHOLDERS */}
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Login with X</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Login with Apple</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.primaryBackground,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 330,
    height: 190,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    color: DARK_THEME.primaryText,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  socialButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  socialButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  safeArea: {
    flex: 1,
  },
});


