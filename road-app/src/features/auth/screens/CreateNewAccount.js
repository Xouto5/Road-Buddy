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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// Shared dark theme colors used across app screens
import { DARK_THEME } from "../../../shared/style/ColorScheme";

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

	// Placeholder submit handler until auth service is connected
	const handleCreateAccount = () => {
		// Placeholder for account creation service integration.
		navigation.goBack();
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
					onChangeText={setFirstName}
				/>

				<TextInput
					style={styles.input}
					placeholder="Last Name"
					placeholderTextColor={DARK_THEME.placeholder}
					value={lastName}
					onChangeText={setLastName}
				/>

				{/* Car selector dropdown */}
				<View style={styles.dropdownContainer}>
					<TouchableOpacity
						style={styles.dropdownTrigger}
						onPress={() => setIsCarDropdownOpen((prev) => !prev)}
						activeOpacity={0.85}
					>
						<Text
							style={carList ? styles.dropdownValueText : styles.dropdownPlaceholderText}
						>
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
					onChangeText={setPhone}
					keyboardType="phone-pad"
				/>

				<TextInput
					style={styles.input}
					placeholder="Email"
					placeholderTextColor={DARK_THEME.placeholder}
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
				/>

				<TextInput
					style={styles.input}
					placeholder="Password"
					placeholderTextColor={DARK_THEME.placeholder}
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>

				<TextInput
					style={styles.input}
					placeholder="Confirm Password"
					placeholderTextColor={DARK_THEME.placeholder}
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					secureTextEntry
				/>

				{/* Primary account creation action */}
				<TouchableOpacity style={styles.createButton} onPress={handleCreateAccount}>
					<Text style={styles.createButtonText}>Create Account</Text>
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