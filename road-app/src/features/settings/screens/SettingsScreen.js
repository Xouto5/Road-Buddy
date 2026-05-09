//Josh - I have created a first draft of the User Settings screen which includes:
//Text boxes that show your first name, last name, phone number, and email
//There is a pencil icon that you can click on to edit your account details, these changes aren't saved until you press save
//If there are unsaved changes on attempted logout, there is a popup warning to save or discard changes, or cancel

import React, { useEffect, useRef, useState } from "react";
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

export default function ProfileScreen() {
  const navigation = useNavigation();
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserData();
        if (data) {
          setFirstName(data.firstname || "");
          setLastName(data.lastname || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Saved values
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Draft values
  const [firstNameDraft, setFirstNameDraft] = useState(firstName);
  const [lastNameDraft, setLastNameDraft] = useState(lastName);
  const [phoneDraft, setPhoneDraft] = useState(phone);
  const [emailDraft, setEmailDraft] = useState(email);

  useEffect(() => setFirstNameDraft(firstName), [firstName]);
  useEffect(() => setLastNameDraft(lastName), [lastName]);
  useEffect(() => setPhoneDraft(phone), [phone]);
  useEffect(() => setEmailDraft(email), [email]);

  const [editingKey, setEditingKey] = useState(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isUserVerified() && !hasRun.current) {
      hasRun.current = true;
      setTimeout(() => {
        Alert.alert(
          'Email is not verified',
          'Please verify your email. Check your email for an existing link, or click send again to receive a new one.',
          [{ text: 'Okay' }, { text: 'Send Again', onPress: () => verifyEmail() }],
          { cancelable: false },
        );
      }, 5000);
    }
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
      inputRef.current?.blur?.();
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const discardDraftChanges = () => {
    setFirstNameDraft(firstName);
    setLastNameDraft(lastName);
    setPhoneDraft(phone);
    setEmailDraft(email);
    setEditingKey(null);
    inputRef.current?.blur?.();
  };

  const onLogout = () => {
    if (!hasUnsavedChanges) {
      logOut();
      return;
    }

    Alert.alert(
      "Unsaved changes",
      "You have unsaved changes. What would you like to do?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            discardDraftChanges();
            logOut();
          },
        },
        {
          text: "Save",
          onPress: async () => {
            await onSaveChanges();
            logOut();
          },
        },
      ],
    );
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
            placeholderTextColor={COLORS.placeholder}
            autoCapitalize={key === "email" ? "none" : "words"}
            keyboardType={keyboardType}
            returnKeyType="done"
            onSubmitEditing={stopEditing}
            onBlur={stopEditing}
            blurOnSubmit
          />
        ) : (
          <Text style={[styles.fieldText, !draft && styles.placeholderText]} numberOfLines={1}>
            {draft ? draft : placeholder}
          </Text>
        )}

        {!isEditingThis && (
          <Pressable
            onPress={() => startEditing(key)}
            hitSlop={10}
            disabled={lockThisRow}
            style={[styles.pencilBtn, lockThisRow && styles.disabledBtn]}
          >
            <Image
              source={require("../../../../assets/images/pencil-edit-icon.png")}
              style={styles.pencilImage}
              resizeMode="contain"
            />
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
      <View style={styles.screen}>
        <View style={styles.topbar}>
          <Image
            source={require("../../../../assets/images/user-settings-icon.png")}
            style={styles.iconSmall}
            resizeMode="contain"
          />
          <Text style={styles.title}>Profile Settings</Text>
          <Pressable
            style={styles.infoBtn}
            hitSlop={10}
            onPress={() => navigation.navigate("AboutScreen")}
          >
            <Image
              source={require("../../../../assets/images/info-icon.png")}
              style={styles.iconSmall}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                {renderPencilRow("firstName", "First Name", firstNameDraft, setFirstNameDraft)}
                {renderPencilRow("lastName", "Last Name", lastNameDraft, setLastNameDraft)}
                {renderPencilRow("phone", "Phone Number", phoneDraft, setPhoneDraft, "phone-pad")}
                {renderPencilRow("email", "Email", emailDraft, setEmailDraft, "email-address")}

                <Pressable
                  style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                  onPress={onSaveChanges}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.darkText} />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </Pressable>
                
                {hasUnsavedChanges && !loading && (
                  <Text style={styles.unsavedText}>You have unsaved changes</Text>
                )}
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

const COLORS = {
  bg: "#1B2435",
  stroke: "#FFFFFF", 
  text: "#FFFFFF",
  placeholder: "rgba(232, 238, 252, 0.65)",
  white: "#FFFFFF",
  darkText: "#1B2435",
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  screen: { flex: 1, backgroundColor: COLORS.bg },
  topbar: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  iconSmall: { width: 28, height: 28, tintColor: COLORS.text },
  title: { color: COLORS.text, fontSize: 20, fontWeight: "700" },
  content: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 26, paddingBottom: 40 },
  form: { flex: 1, width: "100%", maxWidth: 360, alignSelf: "center", justifyContent: "space-between" },
  inputGroup: { gap: 14 },
  fieldRow: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.0, 
    borderColor: COLORS.stroke,
    backgroundColor: "transparent",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lockedRow: { opacity: 0.45 },
  fieldText: { flex: 1, color: COLORS.text, fontSize: 15 },
  placeholderText: { color: COLORS.placeholder },
  fieldInput: { flex: 1, color: COLORS.text, fontSize: 15 },
  pencilBtn: { paddingLeft: 8 },
  disabledBtn: { opacity: 0.4 },
  pencilImage: { width: 20, height: 20, tintColor: COLORS.text },
  saveBtn: { height: 52, borderRadius: 12, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", marginTop: 10 },
  saveBtnText: { color: COLORS.darkText, fontSize: 16, fontWeight: "700" },
  unsavedText: { color: COLORS.placeholder, textAlign: "center", fontSize: 12.5, marginTop: 4 },
  footerGroup: { marginTop: 60 },
  logoutBtn: { height: 48, borderRadius: 12, borderWidth: 1.0, borderColor: COLORS.stroke, alignItems: "center", justifyContent: "center" },
  logoutBtnText: { color: COLORS.text, fontSize: 15, fontWeight: "600" },
});