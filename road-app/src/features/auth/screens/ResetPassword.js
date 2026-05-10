import { useState } from "react";
import { resetPassword } from "../services/authServices";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { DARK_THEME } from "../../../shared/style/ColorScheme";

const withAlpha = (hexColor, alpha) => {
  const hex = (hexColor || "").replace("#", "");
  if (hex.length !== 6) return hexColor;
  const int = Number.parseInt(hex, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    primaryBtnText: "Done",
    onPrimaryPress: () => setModalVisible(false),
  });

  const handleResetPassword = async () => {
    if (!email) {
      setModalConfig({
        title: "Missing Email",
        message: "Please enter your email address.",
        primaryBtnText: "Okay",
        onPrimaryPress: () => setModalVisible(false),
      });
      setModalVisible(true);
      return;
    }

    try {
      await resetPassword(email);
      setModalConfig({
        title: "Link Sent",
        message: "A password reset link has been sent to your email.",
        primaryBtnText: "Done",
        onPrimaryPress: () => {
          setModalVisible(false);
          navigation.goBack();
        },
      });
      setModalVisible(true);
    } catch (error) {
      setModalConfig({
        title: "Error",
        message: "Could not send reset link. Please try again.",
        primaryBtnText: "Okay",
        onPrimaryPress: () => setModalVisible(false),
      });
      setModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={28} color={DARK_THEME.primaryText} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={styles.screen}>
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>Forgot your Password?</Text>
            <Text style={styles.subTitle}>
              Enter your email to request a reset link.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.fieldRow}>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Email Address"
                  placeholderTextColor={DARK_THEME.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleResetPassword}
              >
                <Text style={styles.primaryButtonText}>Reset Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal transparent animationType="fade" visible={modalVisible}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={modalConfig.onPrimaryPress}>
                <Text style={styles.modalBtnText}>{modalConfig.primaryBtnText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: DARK_THEME.primaryBackground },
  screen: { flex: 1, backgroundColor: DARK_THEME.primaryBackground },
  backButton: { paddingHorizontal: 16, paddingTop: 10 },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 12,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  mainTitle: { color: DARK_THEME.primaryText, fontSize: 26, fontWeight: "700" },
  subTitle: { color: DARK_THEME.placeholder, fontSize: 15, marginTop: 12, textAlign: "center" },
  form: { flex: 1, width: "100%", maxWidth: 360, alignSelf: "center", paddingHorizontal: 16, paddingTop: 26 },
  inputGroup: { gap: 16 },
  fieldRow: { height: 54, borderRadius: 12, borderWidth: 1, borderColor: DARK_THEME.primaryBorder, paddingHorizontal: 14, justifyContent: "center" },
  fieldInput: { color: DARK_THEME.primaryText, fontSize: 16 },
  primaryButton: { backgroundColor: DARK_THEME.primaryText, padding: 16, borderRadius: 10, alignItems: "center" },
  primaryButtonText: { color: DARK_THEME.primaryBackground, fontWeight: "bold", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: withAlpha(DARK_THEME.primaryBackground, 0.75), justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: DARK_THEME.modalBackground, borderRadius: 14, padding: 28, width: "85%", alignItems: "center", gap: 12, borderWidth: 1, borderColor: DARK_THEME.primaryBorder },
  modalTitle: { color: DARK_THEME.primaryText, fontSize: 20, fontWeight: "bold" },
  modalMessage: { color: DARK_THEME.placeholder, fontSize: 15, textAlign: "center" },
  modalActionRow: { marginTop: 10, width: "100%", alignItems: "center" },
  modalBtn: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 8, backgroundColor: DARK_THEME.primaryText },
  modalBtnText: { color: DARK_THEME.primaryBackground, fontWeight: "bold", fontSize: 15 },
});