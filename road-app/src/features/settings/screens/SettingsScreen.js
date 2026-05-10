//Josh - I have created a first draft of the User Settings screen which includes:
//Text boxes that show your first name, last name, phone number, and email
//There is a pencil icon that you can click on to edit your account details, these changes aren't saved until you press save
//If there are unsaved changes on attempted logout, there is a popup warning to save or discard changes, or cancel

import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { logOut, isUserVerified, verifyEmail } from "../../auth/services/authServices";
import { getUserData, updateUserData } from "../../../core/firebase/firebaseConfig";
import { DARK_THEME } from "../../../shared/style/ColorScheme";

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
              Alert.alert(
                'Email is not verified',
                'Please verify your email.',
                [{ text: 'Okay' }, { text: 'Send Again', onPress: () => verifyEmail() }],
                { cancelable: false },
              );
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
      Alert.alert("Success", "Profile updated!");
    } catch (error) {
      Alert.alert("Error", "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    if (!hasUnsavedChanges) {
      logOut();
      return;
    }
    Alert.alert("Unsaved changes", "Discard or save?", [
      { text: "Cancel", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => logOut() },
      { text: "Save", onPress: async () => { await onSaveChanges(); logOut(); } },
    ]);
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
          <Pressable onPress={() => startEditing(key)} disabled={lockThisRow} style={styles.pencilBtn}>
            <Image
              source={require("../../../../assets/images/pencil-edit-icon.png")}
              style={[styles.pencilImage, { tintColor: DARK_THEME.primaryText }]}
            />
          </Pressable>
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

                <Pressable style={styles.saveBtn} onPress={onSaveChanges} disabled={loading}>
                  {loading ? <ActivityIndicator color={DARK_THEME.primaryBackground} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                </Pressable>
                {hasUnsavedChanges && !loading && <Text style={styles.unsavedText}>You have unsaved changes</Text>}
              </View>

              <View style={styles.footerGroup}>
                <Pressable style={styles.logoutBtn} onPress={onLogout}>
                  <Text style={styles.logoutBtnText}>Logout</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
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
  saveBtn: { height: 52, borderRadius: 12, backgroundColor: DARK_THEME.primaryText, alignItems: "center", justifyContent: "center", marginTop: 10 },
  saveBtnText: { color: DARK_THEME.primaryBackground, fontSize: 16, fontWeight: "700" },
  unsavedText: { color: DARK_THEME.placeholder, textAlign: "center", fontSize: 12.5, marginTop: 4 },
  footerGroup: { marginTop: 60 },
  logoutBtn: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: DARK_THEME.primaryBorder, alignItems: "center", justifyContent: "center" },
  logoutBtnText: { color: DARK_THEME.primaryText, fontSize: 15, fontWeight: "600" },
});