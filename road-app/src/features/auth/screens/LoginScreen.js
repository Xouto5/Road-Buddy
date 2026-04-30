/* ======================================== //
CREDITS:


KEITH: Login screen for RoadBuddy app. Users can enter their username and password to log in, 
        or use social login options. The screen also includes links for password recovery and account creation.
        RoadBuddy Logo is at the top. White back button is also at the top left corner of the screen to allow users 
        to navigate back to the welcome screen.

        Date completed: 02/24/2026

MANUEL:
  I have created the text boxes for username and password outline. Added barely any CSS to it too


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
  Modal, 
} from "react-native";
import { DARK_THEME } from "../../../shared/style/ColorScheme";
import { loginUser } from "../services/authServices";
import { checkIfUserSignedIn } from "../services/authServices";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [showError, setShowError] = useState(false); 
  const [errors, setErrors] = useState({ username: false, password: false }); 
  
  const [modalVisible, setModalVisible] = useState(false);

  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleLogin = (username, password) => {
    setShowError(false);
    setErrors({ username: false, password: false });

    if (!username || !password) {
      setShowError(true); 
      setErrors({
        username: !username, 
        password: !password,
      });
      return; 
    }

    loginAsync(username, password);
  };

  async function loginAsync(username, password) {
    await loginUser(username, password);
    console.log("Logging in with:", username, password);
    
    if (checkIfUserSignedIn() == false) {
      setFailedAttempts(prev => prev + 1);
      setModalVisible(true); 
    } else {
      // NEW: Reset failed attempts on success
      setFailedAttempts(0);
      window.location.href = "TempMenu.js";
    }
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["left", "right", "bottom", "top"]}
    >
      <KeyboardAvoidingView style={styles.container}>
        
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Username or password is incorrect</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../assets/images/RoadBuddyLogoText.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.inputContainer}>
          {showError && (
            <Text style={styles.errorMessage}>Please fill all required fields</Text>
          )}

          <TextInput
            style={[
              styles.input,
              errors.username && { borderColor: 'red', borderWidth: 2 }
            ]}
            placeholder="Username"
            placeholderTextColor={DARK_THEME.placeholder}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              errors.password && { borderColor: 'red', borderWidth: 2 }
            ]}
            placeholder="Password"
            placeholderTextColor={DARK_THEME.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
        </View>

        <View style={styles.linksContainer}>
          {failedAttempts >= 3 && (
            <Text style={styles.guidanceText}>
              Having trouble? Try resetting your password.
            </Text>
          )}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => handleLogin(username, password)}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ResetPassword")}
            >
              <Text style={[
                styles.linkText, 
                failedAttempts >= 3 && styles.highlightedLink
              ]}>
                Forgot your Password?
              </Text>
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
  errorMessage: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  guidanceText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  highlightedLink: {
    color: '#FFD700',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 25,
    alignItems: "center",
    elevation: 5,
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#000",
  },
  modalButton: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  modalButtonText: {
    color: "white",
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