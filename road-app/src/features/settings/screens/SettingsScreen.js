/* ======================================== //
CREDITS:
Josh: Initial draft of User Settings. Text boxes for user info, 
      pencil icon for editing, unsaved changes warnings.

// ======================================== */

import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { logOut, isUserVerified, verifyEmail } from "../../auth/services/authServices";
import { getUserData, updateUserData } from "../../../core/firebase/firebaseConfig";
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

export default function ProfileScreen() {
  const navigation = useNavigation();
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // States for saved values
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // States for draft values
  const [firstNameDraft, setFirstNameDraft] = useState("");
  const [lastNameDraft, setLastNameDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");

  const [editingKey, setEditingKey] = useState(null);
  const hasRun = useRef(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    primaryBtnText: "Done",
    onPrimaryPress: () => setModalVisible(false),
    secondaryBtnText: null,
    onSecondaryPress: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserData();
        if (data) {
          const fn = data.firstname || "";
          const ln = data.lastname || "";
          const ph = data.phone || "";
          const em = data.email || "";
          
          setFirstName(fn);
          setLastName(ln);
          setPhone(ph);
          setEmail(em);

          setFirstNameDraft(fn);
          setLastNameDraft(ln);
          setPhoneDraft(ph);
          setEmailDraft(em);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const checkVerification = async () => {
        const verified = await isUserVerified();
        if (!verified && !hasRun.current) {
            hasRun.current = true;
            setTimeout(() => {
              setModalConfig({
                title: "Email Not Verified",
                message: "Please verify your email to secure your account.",
                primaryBtnText: "Okay",
                onPrimaryPress: () => setModalVisible(false),
                secondaryBtnText: "Send Again",
                onSecondaryPress: () => {
                    verifyEmail();
                    setModalVisible(false);
                }
              });
              setModalVisible(true);
            }, 5000);
        }
    }
    checkVerification();
  }, []);

  const hasUnsavedChanges =
    firstNameDraft !== firstName ||
    lastNameDraft !== lastName ||
    phoneDraft !== phone ||
    emailDraft !== email;

  const startEditing = (key) => {
    if (editingKey && editingKey !== key) return;
    setEditingKey(key);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const stopEditing = () => setEditingKey(null);

  const onSaveChanges = async () => {
    if (!hasUnsavedChanges) return;
    setLoading(true);
    try {
      const updatedData = {
        firstname: firstNameDraft.trim(),
        lastname: lastNameDraft.trim(),
        phone: phoneDraft.trim(),
        email: emailDraft.trim(),
      };
      await updateUserData(updatedData);
      setFirstName(updatedData.firstname);
      setLastName(updatedData.lastname);
      setPhone(updatedData.phone);
      setEmail(updatedData.email);
      setEditingKey(null);
      
      setModalConfig({
        title: "Success",
        message: "Profile updated successfully!",
        primaryBtnText: "Done",
        onPrimaryPress: () => setModalVisible(false)
      });
      setModalVisible(true);
    } catch (error) {
      setModalConfig({
        title: "Error",
        message: "Failed to save profile changes.",
        primaryBtnText: "Okay",
        onPrimaryPress: () => setModalVisible(false)
      });
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    if (!hasUnsavedChanges) {
      logOut();
      return;
    }
    setModalConfig({
        title: "Unsaved Changes",
        message: "Would you like to save your changes or discard them before logging out?",
        primaryBtnText: "Save & Logout",
        onPrimaryPress: async () => { 
            await onSaveChanges(); 
            logOut(); 
        },
        secondaryBtnText: "Discard",
        onSecondaryPress: () => logOut()
    });
    setModalVisible(true);
  };

  const renderPencilRow = (key, placeholder, draft, setDraft, keyboardType = "default") => {
    const isEditingThis = editingKey === key;
    const lockThisRow = editingKey !== null && !isEditingThis;

    return (
      <View style={[styles.fieldRow, lockThisRow && styles.lockedRow]}>
        {isEditingThis ? (
          <TextInput
            ref={inputRef}
            style={styles.fieldInput}
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={DARK_THEME.placeholder}
            autoCapitalize={key === "email" ? "none" : "words"}
            keyboardType={keyboardType}
            onBlur={stopEditing}
          />
        ) : (
          <Text style={[styles.fieldText, !draft && styles.placeholderText]}>
            {draft ? draft : placeholder}
          </Text>
        )}
        {!isEditingThis && (
          <TouchableOpacity onPress={() => startEditing(key)} disabled={lockThisRow} style={styles.pencilBtn}>
            <Image
              source={require("../../../../assets/images/pencil-edit-icon.png")}
              style={[styles.pencilImage, { tintColor: DARK_THEME.primaryText }]}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
      <View style={styles.screen}>
        <View style={styles.headerContainer}>
          <Text style={styles.mainTitle}>User Settings</Text>
          <Text style={styles.subTitle}>View and manage your account details.</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                {renderPencilRow("firstName", "First Name", firstNameDraft, setFirstNameDraft)}
                {renderPencilRow("lastName", "Last Name", lastNameDraft, setLastNameDraft)}
                {renderPencilRow("phone", "Phone Number", phoneDraft, setPhoneDraft, "phone-pad")}
                {renderPencilRow("email", "Email", emailDraft, setEmailDraft, "email-address")}

                <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={onSaveChanges} 
                    disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={DARK_THEME.primaryBackground} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
                
                {hasUnsavedChanges && !loading && (
                    <Text style={styles.unsavedText}>You have unsaved changes</Text>
                )}
              </View>

              <View style={styles.footerGroup}>
                <TouchableOpacity style={styles.secondaryButton} onPress={onLogout}>
                  <Text style={styles.secondaryButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>
            
            <View style={styles.modalActionRow}>
                {modalConfig.secondaryBtnText && (
                    <TouchableOpacity
                        style={[styles.modalBtn, styles.modalSecondaryBtn]}
                        onPress={modalConfig.onSecondaryPress}
                    >
                        <Text style={styles.modalSecondaryBtnText}>{modalConfig.secondaryBtnText}</Text>
                    </TouchableOpacity>
                )}
                
                <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={modalConfig.onPrimaryPress}
                >
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
  headerContainer: { paddingTop: 24, paddingBottom: 12, alignItems: "center" },
  mainTitle: { color: DARK_THEME.primaryText, fontSize: 28, fontWeight: "700" },
  subTitle: { color: DARK_THEME.placeholder, fontSize: 15, marginTop: 6 },
  content: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 26, paddingBottom: 40 },
  form: { flex: 1, width: "100%", maxWidth: 360, alignSelf: "center", justifyContent: "space-between" },
  inputGroup: { gap: 14 },
  fieldRow: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1, 
    borderColor: DARK_THEME.primaryBorder,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  lockedRow: { opacity: 0.45 },
  fieldText: { flex: 1, color: DARK_THEME.primaryText, fontSize: 15 },
  placeholderText: { color: DARK_THEME.placeholder },
  fieldInput: { flex: 1, color: DARK_THEME.primaryText, fontSize: 15 },
  pencilBtn: { paddingLeft: 8 },
  pencilImage: { width: 20, height: 20 },
  unsavedText: { color: DARK_THEME.placeholder, textAlign: "center", fontSize: 12.5, marginTop: 4 },
  footerGroup: { marginTop: 60 },
  primaryButton: { 
    backgroundColor: DARK_THEME.primaryText, 
    padding: 16, 
    borderRadius: 10, 
    alignItems: "center", 
    marginTop: 10 
  },
  primaryButtonText: { 
    color: DARK_THEME.primaryBackground, 
    fontWeight: "bold", 
    fontSize: 16 
  },
  secondaryButton: { 
    height: 48, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: DARK_THEME.primaryBorder, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  secondaryButtonText: { 
    color: DARK_THEME.primaryText, 
    fontSize: 15, 
    fontWeight: "600" 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: withAlpha(DARK_THEME.primaryBackground, 0.75), 
    justifyContent: "center", 
    alignItems: "center" 
  },
  modalBox: { 
    backgroundColor: DARK_THEME.modalBackground, 
    borderRadius: 14, 
    padding: 28, 
    width: "85%", 
    alignItems: "center", 
    gap: 12 
  },
  modalTitle: { 
    color: DARK_THEME.primaryText, 
    fontSize: 20, 
    fontWeight: "bold" 
  },
  modalMessage: { 
    color: DARK_THEME.placeholder, 
    fontSize: 15, 
    textAlign: "center",
    lineHeight: 20
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    width: '100%',
    justifyContent: 'center'
  },
  modalBtn: { 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8, 
    backgroundColor: DARK_THEME.primaryText,
    minWidth: 100,
    alignItems: 'center'
  },
  modalBtnText: { 
    color: DARK_THEME.primaryBackground, 
    fontWeight: "bold", 
    fontSize: 15 
  },
  modalSecondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder
  },
  modalSecondaryBtnText: {
    color: DARK_THEME.primaryText,
    fontWeight: "bold",
    fontSize: 15
  }
});