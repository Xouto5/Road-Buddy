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

import React, { useState } from "react";
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
} from "react-native";
import { DARK_THEME } from "../../../shared/style/ColorScheme";
import { loginUser } from "../services/authServices";
import { checkIfUserSignedIn } from "../services/authServices";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (username, password) => {
    loginAsync(username, password);
  };

  async function loginAsync(username, password) {
    await loginUser(username, password);
    console.log("Logging in with:", username, password);
    if (checkIfUserSignedIn() == false) {
      console.log(checkIfUserSignedIn());
      console.log("yippe");
      const popupElement = document.getElementById("my-dialog");
      popupElement.showModal();
    } else {
      window.location.href = "TempMenu.js";
    }
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["left", "right", "bottom", "top"]}
    >
      <KeyboardAvoidingView style={styles.container}>
        <dialog id="my-dialog">
          <p>Invalid credentials, please try again!</p>
          <button commandfor="my-dialog" command="close">
            Close
          </button>
        </dialog>

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
            placeholder="Username"
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
            secureTextEntry={true}
          />
        </View>

        <View style={styles.linksContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => loginUser(username, password)}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ResetPassword")}
            >
              <Text style={styles.linkText}>Forgot your Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("CreateAccount")}
            >
              <Text style={styles.linkText}>Create New Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>Login with X</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>Login with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>Login with Apple</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  backButton: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backText: {
    color: DARK_THEME.primaryText,
    fontSize: 28,
    fontWeight: "bold",
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
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 25,
  },
  loginButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
  },
  linksContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  linkText: {
    color: DARK_THEME.primaryText,
    fontSize: 14,
    marginBottom: 10,
  },
  socialContainer: {
    width: "100%",
  },
  socialButton: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  socialButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  safeArea: {
    flex: 1,
  },
});
