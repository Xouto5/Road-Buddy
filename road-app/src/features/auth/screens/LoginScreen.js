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
  Modal,
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

  const [showError, setShowError] = useState(false);
  const [errors, setErrors] = useState({ username: false, password: false });

  const [modalVisible, setModalVisible] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

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
          setModalVisible(true);
        }
      }
    };
    handleGoogleLogin();
  }, [response]);

  const handleLogin = async () => {
    setShowError(false);
    setErrors({ username: false, password: false });

    if (!username || !password) {
      setShowError(true);
      setErrors({ username: !username, password: !password });
      return;
    }

    try {
      const result = await loginUser(username.trim(), password);

      if (!result || result.success === false) {
        setFailedAttempts((prev) => prev + 1);
        setErrors({ username: true, password: true });
        setShowError(true);
        setModalVisible(true);
      } 
    } catch (error) {
      setFailedAttempts((prev) => prev + 1);
      setErrors({ username: true, password: true });
      setModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                Username or password is incorrect
              </Text>
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
            <Text style={styles.errorMessage}>
              {!username || !password
                ? "Please fill all required fields"
                : "Incorrect username or password"}
            </Text>
          )}

          <TextInput
            style={[styles.input, errors.username && { borderColor: "red", borderWidth: 2 }]}
            placeholder="Username"
            placeholderTextColor={DARK_THEME.placeholder}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setErrors((prev) => ({ ...prev, username: false }));
              setShowError(false);
            }}
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, errors.password && { borderColor: "red", borderWidth: 2 }]}
            placeholder="Password"
            placeholderTextColor={DARK_THEME.placeholder}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: false }));
              setShowError(false);
            }}
            secureTextEntry
          />
        </View>

        {failedAttempts >= 3 && (
          <Text style={styles.guidanceText}>
            Having trouble? Try resetting your password.
          </Text>
        )}

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={[styles.socialButton, !request && { opacity: 0.5 }]}
            disabled={!request}
            onPress={() => promptAsync()}
          >
            <Text style={styles.socialButtonText}>Login with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialButtonText}>Login with X</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialButtonText}>Login with Apple</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("ResetPassword")}>
          <Text style={[styles.linkText, failedAttempts >= 3 && styles.highlightedLink]}>
            Forgot your Password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("CreateAccount")}>
          <Text style={styles.linkText}>Create New Account</Text>
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
    justifyContent: "center",
  },
  errorMessage: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  guidanceText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
    fontStyle: "italic",
  },
  highlightedLink: {
    color: "#FFD700",
    fontWeight: "bold",
    textDecorationLine: "underline",
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
    marginBottom: 20,
    marginTop: 20,
  },
  logo: {
    width: 300,
    height: 150,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 8,
    padding: 16,
    marginBottom: 15,
    color: DARK_THEME.primaryText,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  loginButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  socialContainer: {
    width: "100%",
    marginTop: 5,
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
  linkText: {
    color: DARK_THEME.primaryText,
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: DARK_THEME.primaryBackground,
  },
});