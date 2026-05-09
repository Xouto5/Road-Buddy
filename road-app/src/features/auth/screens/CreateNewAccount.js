/*
Create New Account Screen Component
Displays the account registration form for first-time users.
Users can enter profile details and submit to create an account.

Author: Brian Siebert
Date: 03-11-2026
*/

// Import React hooks and React Native building blocks for form layout
import React, { useState } from "react";
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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth, createUserWithEmailAndPassword , sendEmailVerification} from "firebase/auth";
import { DARK_THEME } from "../../../shared/style/ColorScheme";
import { performFirestoreOperations } from "../../../core/firebase/firebaseConfig";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+.[^\s@]+$/;

import { createUser } from "../services/authServices";

// Main Create Account screen component
export default function CreateNewAccountScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Basic validation
  const validate = () => {
    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return false;
    }
    if (!lastName.trim()) {
      setError("Please enter your last name.");
      return false;
    }
    if (!email.trim() || !EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setError("Please enter a password.");
      return false;
    }

    // Requirement: at least 6 characters
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    setError("");
    return true;
  };

  const handleCreateAccount = async () => {
    if (!validate()) return;

    setLoading(true);
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      performFirestoreOperations(firstName, lastName, email, "", "");
      sendEmailVerification(auth.currentUser)

      setLoading(false);
      Alert.alert("Account created", "Your account was created successfully.");
      navigation.goBack();
    } catch (err) {
      setLoading(false);
      let message = "An error occurred while creating your account.";
      if (err.code) {
        switch (err.code) {
          case "auth/email-already-in-use":
            message = "The email address is already in use.";
            break;
          case "auth/invalid-email":
            message = "The email address is invalid.";
            break;
          case "auth/weak-password":
            message = "The password is too weak. Try a longer password.";
            break;
          default:
            message = err.message || message;
        }
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      {/* Header bar with icon + screen title */}
      <View style={styles.header}>
        <View style={styles.headerIconCell}>
          <Ionicons
            name="person-outline"
            size={18}
            color={DARK_THEME.primaryText}
          />
        </View>
        <Text style={styles.headerTitle}>Create Account</Text>
      </View>

      {/* Scrollable form body */}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor={DARK_THEME.placeholder}
          value={firstName}
          onChangeText={(t) => setFirstName(t)}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor={DARK_THEME.placeholder}
          value={lastName}
          onChangeText={(t) => setLastName(t)}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={DARK_THEME.placeholder}
          value={email}
          onChangeText={(t) => setEmail(t)}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={DARK_THEME.placeholder}
          value={password}
          onChangeText={(t) => setPassword(t)}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={DARK_THEME.placeholder}
          value={confirmPassword}
          onChangeText={(t) => setConfirmPassword(t)}
          secureTextEntry
        />

        {/* Error message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Primary account creation action */}
        <TouchableOpacity
          style={[
            styles.createButton,
            loading ? styles.createButtonDisabled : null,
          ]}
          onPress={handleCreateAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={DARK_THEME.primaryBackground} />
          ) : (
            <Text style={styles.createButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DARK_THEME.primaryBackground,
    paddingTop: 20,
  },
  header: {
    marginTop: 0,
    marginHorizontal: 18,
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 8,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DARK_THEME.primaryBackground,
  },
  headerIconCell: {
    width: 46,
    height: "100%",
    borderRightWidth: 1,
    borderRightColor: DARK_THEME.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    marginLeft: 16,
    color: DARK_THEME.primaryText,
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 44,
    paddingBottom: 36,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 6,
    marginBottom: 12,
    color: DARK_THEME.primaryText,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: DARK_THEME.primaryBackground,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
  },
  createButton: {
    marginTop: 6,
    backgroundColor: DARK_THEME.primaryText,
    borderRadius: 6,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: DARK_THEME.primaryBackground,
    fontSize: 14,
    fontWeight: "700",
  },
});