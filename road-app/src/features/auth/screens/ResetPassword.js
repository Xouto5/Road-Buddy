import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { DARK_THEME } from "../../../shared/style/ColorScheme";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      setModalMessage("Please enter your email");
      setModalVisible(true);
      return;
    }

    try {
      console.log("Sending reset to:", email);

      // 🔥 Replace this later with real backend call
      // await resetPassword(email);

      setModalMessage("Password reset link sent to your email");
      setModalVisible(true);
    } catch (error) {
      console.log(error);
      setModalMessage("Something went wrong. Try again.");
      setModalVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >

      {/* MODAL */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{modalMessage}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Forgot your Password?</Text>
        <Text style={styles.subtitle}>
          Please enter the email associated with your account to request a
          password reset link.
        </Text>
      </View>

      {/* INPUT */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor={DARK_THEME.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetPassword}
      >
        <Text style={styles.resetButtonText}>Reset Password</Text>
      </TouchableOpacity>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.primaryBackground,
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 30,
    marginTop: 20,
    alignItems: "center",
  },
  title: {
    color: DARK_THEME.primaryText,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    color: DARK_THEME.primaryText,
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
    textAlign: "center",
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
    color: DARK_THEME.primaryText,
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
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
});