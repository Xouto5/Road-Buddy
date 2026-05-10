/*
Create New Account Screen Component
Displays the account registration form for first-time users.
Users can enter profile details and submit to create an account.

Author: Brian Siebert
Date: 03-11-2026
*/

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { DARK_THEME } from "../../../shared/style/ColorScheme";
import { performFirestoreOperations } from "../../../core/firebase/firebaseConfig";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const withAlpha = (hexColor, alpha) => {
  const hex = (hexColor || "").replace("#", "");
  if (hex.length !== 6) return hexColor;
  const int = Number.parseInt(hex, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function CreateNewAccountScreen({ navigation, setIsReady }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    primaryBtnText: "Done",
    onPrimaryPress: () => setModalVisible(false),
  });

  const showAlert = (title, message, btnText = "Okay", onPress = () => setModalVisible(false)) => {
    setModalConfig({
      title,
      message,
      primaryBtnText: btnText,
      onPrimaryPress: onPress,
    });
    setModalVisible(true);
  };

  const validate = () => {
    if (!firstName.trim() || !lastName.trim()) {
      showAlert("Missing Info", "Please enter your full name.");
      return false;
    }
    if (!email.trim() || !EMAIL_REGEX.test(email)) {
      showAlert("Invalid Email", "Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      showAlert("Weak Password", "Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      showAlert("Mismatch", "Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleCreateAccount = async () => {
    if (!validate()) return;

    setLoading(true);
    const auth = getAuth();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await performFirestoreOperations(firstName, lastName, email, "", "");
      
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      }
      
      setLoading(false);

      showAlert(
        "Welcome to Road Buddy!", 
        "Your account has been created. Tap below to start planning your first trip.",
        "Continue to Home",
        () => {
            setModalVisible(false);
            if (setIsReady) setIsReady(true);
        }
      );

    } catch (err) {
      setLoading(false);
      let message = "An error occurred.";
      if (err.code === "auth/email-already-in-use") message = "Email already in use.";
      showAlert("Account Error", message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color={DARK_THEME.primaryText} />
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>Create Account</Text>
            <Text style={styles.subTitle}>Join us to start planning your next trip.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.fieldRow}>
                <TextInput style={styles.fieldInput} placeholder="First Name" placeholderTextColor={DARK_THEME.placeholder} value={firstName} onChangeText={setFirstName} />
              </View>
              <View style={styles.fieldRow}>
                <TextInput style={styles.fieldInput} placeholder="Last Name" placeholderTextColor={DARK_THEME.placeholder} value={lastName} onChangeText={setLastName} />
              </View>
              <View style={styles.fieldRow}>
                <TextInput style={styles.fieldInput} placeholder="Email" placeholderTextColor={DARK_THEME.placeholder} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              </View>
              <View style={styles.fieldRow}>
                <TextInput style={styles.fieldInput} placeholder="Password" placeholderTextColor={DARK_THEME.placeholder} value={password} onChangeText={setPassword} secureTextEntry />
              </View>
              <View style={styles.fieldRow}>
                <TextInput style={styles.fieldInput} placeholder="Confirm Password" placeholderTextColor={DARK_THEME.placeholder} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleCreateAccount} disabled={loading}>
                {loading ? <ActivityIndicator color={DARK_THEME.primaryBackground} /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal transparent animationType="fade" visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={modalConfig.onPrimaryPress}>
                <Text style={styles.modalBtnText}>{modalConfig.primaryBtnText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: DARK_THEME.primaryBackground },
  backButton: { paddingHorizontal: 16, paddingTop: 10 },
  scrollContent: { paddingBottom: 40 },
  headerContainer: { paddingTop: 20, paddingBottom: 12, alignItems: "center", paddingHorizontal: 20 },
  mainTitle: { color: DARK_THEME.primaryText, fontSize: 28, fontWeight: "700" },
  subTitle: { color: DARK_THEME.placeholder, fontSize: 15, marginTop: 8, textAlign: "center" },
  form: { width: "100%", maxWidth: 360, alignSelf: "center", paddingHorizontal: 16, paddingTop: 20 },
  inputGroup: { gap: 14 },
  fieldRow: { height: 54, borderRadius: 12, borderWidth: 1, borderColor: DARK_THEME.primaryBorder, paddingHorizontal: 14, justifyContent: "center" },
  fieldInput: { color: DARK_THEME.primaryText, fontSize: 16 },
  primaryButton: { backgroundColor: DARK_THEME.primaryText, padding: 16, borderRadius: 10, alignItems: "center", marginTop: 10 },
  primaryButtonText: { color: DARK_THEME.primaryBackground, fontWeight: "bold", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: withAlpha(DARK_THEME.primaryBackground, 0.85), justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: DARK_THEME.modalBackground, borderRadius: 14, padding: 28, width: "85%", alignItems: "center", gap: 12, borderWidth: 1, borderColor: DARK_THEME.primaryBorder },
  modalTitle: { color: DARK_THEME.primaryText, fontSize: 20, fontWeight: "bold" },
  modalMessage: { color: DARK_THEME.placeholder, fontSize: 15, textAlign: "center", lineHeight: 20 },
  modalActionRow: { marginTop: 10, width: "100%", alignItems: "center" },
  modalBtn: { paddingVertical: 14, paddingHorizontal: 30, borderRadius: 10, backgroundColor: DARK_THEME.primaryText, width: '100%', alignItems: 'center' },
  modalBtnText: { color: DARK_THEME.primaryBackground, fontWeight: "bold", fontSize: 16 }
});