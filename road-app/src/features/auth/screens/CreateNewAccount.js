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
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// Shared dark theme colors used across app screens
import { DARK_THEME } from "../../../shared/style/ColorScheme";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+.[^\s@]+$/;

import { createUser } from "../services/authServices";
// Temporary options for selecting a vehicle type
const carListOptions = ["Sedan", "SUV", "Truck", "Van"];

// Main Create Account screen component
export default function CreateNewAccountScreen({ navigation }) {
	// Form state for each registration field
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [carList, setCarList] = useState("");
	const [isCarDropdownOpen, setIsCarDropdownOpen] = useState(false);
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");


	// UI / validation state
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	// Basic client-side validation
	const validate = () => {
	if (!firstName.trim()) {
	setError("Please enter your first name.");
	return false;
	}
	if (!lastName.trim()) {
	setError("Please enter your last name.");
	return false;
	}
	if (!carList) {
	setError("Please select a vehicle type.");
	return false;
	}
	if (!phone.trim()) {
	setError("Please enter your phone number.");
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
	
	// requirement: at least 6 characters
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

	// Placeholder submit handler until auth service is connected
	const handleCreateAccount = async () => {
		// Placeholder for account creation service integration.
		if (!validate()) return;

		setLoading(true);
		const auth = getAuth();
		try {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;

		// Feedback / navigation after successful signup
		setLoading(false);
		Alert.alert("Account created", "Your account was created successfully.");
		// Navigate back or to main/home screen:
		navigation.goBack();
		} catch (err) {
		setLoading(false);
		// Map common Firebase errors to readable messages
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
			<TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
				<Text style={styles.backText}>{"<"}</Text>
			</TouchableOpacity>

			{/* Header bar with icon + screen title */}
			<View style={styles.header}>
				<View style={styles.headerIconCell}>
				<Ionicons name="person-outline" size={18} color={DARK_THEME.primaryText} />
				</View>
				<Text style={styles.headerTitle}>Create Account</Text>
			</View>

			{/* Scrollable form body for smaller screens and keyboard safety */}
			<ScrollView
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				{/* Basic profile fields */}
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

				{/* Car selector dropdown */}
				<View style={styles.dropdownContainer}>
				<TouchableOpacity
					style={styles.dropdownTrigger}
					onPress={() => setIsCarDropdownOpen((prev) => !prev)}
					activeOpacity={0.85}
				>
					<Text style={carList ? styles.dropdownValueText : styles.dropdownPlaceholderText}>
					{carList || "Car List"}
					</Text>
					<Ionicons
					name={isCarDropdownOpen ? "chevron-up" : "chevron-down"}
					size={16}
					color={DARK_THEME.primaryText}
					/>
				</TouchableOpacity>

				{isCarDropdownOpen ? (
					<View style={styles.dropdownMenu}>
					{carListOptions.map((option, index) => (
						<TouchableOpacity
						key={option}
						style={[
							styles.dropdownOption,
							index === carListOptions.length - 1 ? styles.dropdownOptionLast : null,
						]}
						onPress={() => {
							setCarList(option);
							setIsCarDropdownOpen(false);
						}}
						>
						<Text style={styles.dropdownOptionText}>{option}</Text>
						</TouchableOpacity>
					))}
					</View>
				) : null}
				</View>

				{/* Contact and credential fields */}
				<TextInput
				style={styles.input}
				placeholder="Phone"
				placeholderTextColor={DARK_THEME.placeholder}
				value={phone}
				onChangeText={(t) => setPhone(t)}
				keyboardType="phone-pad"
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
				style={[styles.createButton, loading ? styles.createButtonDisabled : null]}
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

// Styles for Create New Account screen components
const styles = StyleSheet.create({
	// Root screen container
	screen: {
		flex: 1,
		backgroundColor: DARK_THEME.primaryBackground,
	},
	// Top-left back arrow, matching Login and Estimate screens
	backButton: {
		marginTop: 10,
		marginBottom: 20,
		marginLeft: 20,
		alignSelf: "flex-start",
	},
	backText: {
		color: DARK_THEME.primaryText,
		fontSize: 28,
		fontWeight: "bold",
	},
	// Top header card
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
	// Left icon cell in the header
	headerIconCell: {
		width: 46,
		height: "100%",
		borderRightWidth: 1,
		borderRightColor: DARK_THEME.primaryBorder,
		alignItems: "center",
		justifyContent: "center",
	},
	// Header title text
	headerTitle: {
		marginLeft: 16,
		color: DARK_THEME.primaryText,
		fontSize: 19,
		fontWeight: "700",
		letterSpacing: 0.3,
	},
	// Scrollable content padding
	content: {
		paddingHorizontal: 28,
		paddingTop: 44,
		paddingBottom: 36,
	},
	// Shared text input style
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
	// Container for dropdown field and expanded options
	dropdownContainer: {
		marginBottom: 12,
	},
	// Dropdown trigger field
	dropdownTrigger: {
		height: 40,
		borderWidth: 1,
		borderColor: DARK_THEME.primaryBorder,
		borderRadius: 6,
		paddingHorizontal: 12,
		backgroundColor: DARK_THEME.primaryBackground,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	// Placeholder text shown before user picks a car type
	dropdownPlaceholderText: {
		color: DARK_THEME.placeholder,
		fontSize: 14,
	},
	// Selected value text in dropdown trigger
	dropdownValueText: {
		color: DARK_THEME.primaryText,
		fontSize: 14,
	},
	// Expanded dropdown menu card
	dropdownMenu: {
		marginTop: 6,
		borderWidth: 1,
		borderColor: DARK_THEME.primaryBorder,
		borderRadius: 6,
		backgroundColor: DARK_THEME.modalBackground,
	},
	// Each selectable option row
	dropdownOption: {
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: DARK_THEME.primaryBorder,
	},
	// Option text style
	dropdownOptionText: {
		color: DARK_THEME.primaryText,
		fontSize: 14,
	},
	// Remove divider from last menu item
	dropdownOptionLast: {
		borderBottomWidth: 0,
	},
	// Main submit button style
	createButton: {
		marginTop: 6,
		backgroundColor: DARK_THEME.primaryText,
		borderRadius: 6,
		height: 38,
		alignItems: "center",
		justifyContent: "center",
	},
	// Main submit button text
	createButtonText: {
		color: DARK_THEME.primaryBackground,
		fontSize: 14,
		fontWeight: "700",
	},
});