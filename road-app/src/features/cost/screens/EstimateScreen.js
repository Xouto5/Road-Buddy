/* ======================================== //
CREDITS:
KEITH: Estimate screen for RoadBuddy app. Users can enter their trip distance, vehicle MPG, 
       and current gas price to get an estimate of fuel cost for the trip. UI only screen. 
       No calculations will be done as of 03/11/26.
        
       Date completed: 03/11/2026

BRIAN:  Modified screen as per parameters on ticket FE-2. Changed display title, 
        added "Use my location button", Added Vehicle field, removed Destination field,
        added Gas price type buttons, added "Use local price" button, split Trip Results,
        into seperate subscreen.
  
        Date completed: 04/24/2026

        TODO: When pressed, request location permission and autofill using GPS.
        TODO: When pressed, autofill gas price value (use of API).

// ======================================== */

import React, { useState, useEffect } from "react";
import * as Location from "expo-location";
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
import { DARK_THEME } from "../../../shared/style/ColorScheme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EstimateScreen({ navigation, route }) {
  const [mpg, setMpg] = useState("");
  const [gasPrice, setGasPrice] = useState("");
  const [fuelType, setFuelType] = useState("Regular");
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [gasPriceLoading, setGasPriceLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Repopulate fields when returning from TripResults via Edit Trip
  // When returning via Edit Trip, repopulate all fields with previous values (so they don't start over!)
  useEffect(() => {
    const p = route?.params;
    if (!p) return;
    if (p.startLocation !== undefined) setStartLocation(p.startLocation);
    if (p.destination !== undefined) setDestination(p.destination);
    if (p.vehicle !== undefined) setVehicle(p.vehicle);
    if (p.mpg !== undefined) setMpg(p.mpg);
    if (p.gasPrice !== undefined) setGasPrice(p.gasPrice);
    if (p.fuelType !== undefined) setFuelType(p.fuelType);
  }, [route?.params]);

  const handleUseMyLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError("");
      const { status } = await Location.requestForegroundPermissionsAsync();
      // If permission is denied, fail gracefully without breaking the UI.
      if (status !== "granted") {
        setLocationError("Location permission denied. Enable it in your device settings.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      if (place) {
        const parts = [place.street, place.city, place.region].filter(Boolean);
        setStartLocation(parts.join(", "));
      } else {
        setStartLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
      }
    } catch (err) {
      setLocationError("Could not retrieve location. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleUseLocalPrice = async () => {
    // Gas price API not yet integrated — placeholder
    console.log("Use local price pressed");
  };

  const handleRecalculate = () => {
    const errors = {};
    if (!destination.trim()) errors.destination = "Destination is required.";
    if (!mpg.trim() || isNaN(parseFloat(mpg)) || parseFloat(mpg) <= 0)
      errors.mpg = "Enter a valid MPG.";
    if (!gasPrice.trim() || isNaN(parseFloat(gasPrice)) || parseFloat(gasPrice) <= 0)
      errors.gasPrice = "Enter a valid gas price.";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // When navigating to Results screen, pass all input values.
    // Include start location, destination, MPG, gas type, and gas price.
    navigation.navigate("TripResults", {
      startLocation,
      destination,
      vehicle,
      mpg,
      gasPrice,
      fuelType,
      gallons: "0.00",
      costPerMile: "0.00",
      totalCost: "0.00",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Commented out since the bottom nav has been implemented. Bryan Cardeno */}
          {/* <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity> */}

          <View style={styles.headerContainer}>
            {/* Display title: "Estimate your Trip" at the top of the screen. */}
            <Text style={styles.title}>Estimate Your Trip</Text>
            {/* Display supporting text: "Enter trip details below." under the title. */}
            <Text style={styles.subtitle}>Enter trip details below.</Text>
          </View>

          <View style={styles.inputContainer}>
            {/* Start Location input labeled "Start location". */}
            <Text style={styles.label}>Start location</Text>
            <View style={styles.locationRow}>
              <TextInput
                style={[styles.input, styles.locationInput]}
                placeholder="e.g., New York, NY"
                placeholderTextColor={DARK_THEME.placeholder}
                value={startLocation}
                onChangeText={setStartLocation}
              />
              {/* Include "Use my location" button to the right of the input field. */}
              {/* TODO: When pressed, request location permission and autofill using GPS. */}
              <TouchableOpacity
                style={[styles.locationButton, locationLoading && styles.locationButtonDisabled]}
                onPress={handleUseMyLocation}
                disabled={locationLoading}
              >
                <Text style={styles.locationButtonText}>
                  {locationLoading ? "Locating…" : "Use my location"}
                </Text>
              </TouchableOpacity>
            </View>
            {locationError ? (
              <Text style={styles.locationError}>{locationError}</Text>
            ) : null}

            {/* Destination input labeled "Destination" below start location. */}
            <Text style={styles.label}>Destination</Text>
            <TextInput
              style={[styles.input, validationErrors.destination && styles.inputError]}
              placeholder="e.g., Los Angeles, CA"
              placeholderTextColor={DARK_THEME.placeholder}
              value={destination}
              onChangeText={(v) => { setDestination(v); setValidationErrors((e) => ({ ...e, destination: undefined })); }}
            />
            {validationErrors.destination ? (
              <Text style={styles.fieldError}>{validationErrors.destination}</Text>
            ) : null}

            <View style={styles.inlineRow}>
              <View style={styles.inlineLeft}>
                {/* Vehicle input labeled "Vehicle". */}
                <Text style={styles.label}>Vehicle</Text>
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  placeholder="e.g., 2023 Toyota Camry"
                  placeholderTextColor={DARK_THEME.placeholder}
                  value={vehicle}
                  onChangeText={setVehicle}
                />
              </View>
              <View style={styles.inlineRight}>
                {/* Include MPG input field next to vehicle input. */}
                <Text style={styles.label}>MPG</Text>
                {/* MPG should allow manual input from the user. */}
                <TextInput
                  style={[styles.input, styles.inlineInput, validationErrors.mpg && styles.inputError]}
                  placeholder="e.g., 28"
                  placeholderTextColor={DARK_THEME.placeholder}
                  value={mpg}
                  onChangeText={(v) => { setMpg(v); setValidationErrors((e) => ({ ...e, mpg: undefined })); }}
                  keyboardType="numeric"
                />
                {validationErrors.mpg ? (
                  <Text style={styles.fieldError}>{validationErrors.mpg}</Text>
                ) : null}
              </View>
            </View>

            <Text style={styles.label}>Gas Price (per gallon)</Text>
            {/* Provide selectable buttons: Regular, Premium, Diesel. */}
            {/* Only one option can be selected at a time. */}
            {/* Selected option should be visually highlighted. */}
            <View style={styles.fuelTypeRow}>
              {["Regular", "Premium", "Diesel"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.fuelTypeButton, fuelType === type && styles.fuelTypeButtonActive]}
                  onPress={() => setFuelType(type)}
                >
                  <Text style={[styles.fuelTypeText, fuelType === type && styles.fuelTypeTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.locationRow}>
              {/* Provide input field labeled "Gas Price (per gallon)". */}
              {/* If user manually edits the gas price, it should override autofill! */}
              <TextInput
                style={[styles.input, styles.locationInput, validationErrors.gasPrice && styles.inputError]}
                placeholder="e.g., 4.25"
                placeholderTextColor={DARK_THEME.placeholder}
                value={gasPrice}
                onChangeText={(v) => { setGasPrice(v); setValidationErrors((e) => ({ ...e, gasPrice: undefined })); }}
                onBlur={() => {
                  const n = parseFloat(gasPrice);
                  if (!isNaN(n) && n > 0) setGasPrice(n.toFixed(2));
                }}
                keyboardType="numeric"
              />
              {/* Include button "Use local price" next to gas price input. */}
              {/* TODO: When pressed, autofill gas price value (use of API). */}
              <TouchableOpacity
                style={[styles.locationButton, gasPriceLoading && styles.locationButtonDisabled]}
                onPress={handleUseLocalPrice}
                disabled={gasPriceLoading}
              >
                <Text style={styles.locationButtonText}>
                  {gasPriceLoading ? "Loading\u2026" : "Use local price"}
                </Text>
              </TouchableOpacity>
            </View>
            {validationErrors.gasPrice ? (
              <Text style={styles.fieldError}>{validationErrors.gasPrice}</Text>
            ) : null}
          </View>

          {/* Add "Calculate" button at the bottom of the screen. */}
          {/* This should be the primary button and visually emphasized. */}
          {/* When pressed, validate required inputs before proceeding. */}
          {/* If valid, navigate to a new Results screen. */}
          {/* Do not display results on the same screen. */}
          <View style={styles.calculateContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRecalculate}
            >
              <Text style={styles.primaryButtonText}>Calculate</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.primaryBackground,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 10,
  },
  backText: {
    color: DARK_THEME.primaryText,
    fontSize: 28,
    fontWeight: "bold",
  },
  headerContainer: {
    marginBottom: 28,
    alignItems: "center",
  },
  title: {
    color: DARK_THEME.primaryText,
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    color: DARK_THEME.placeholder,
    fontSize: 15,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inlineRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  inlineLeft: {
    flex: 3,
  },
  inlineRight: {
    flex: 1,
  },
  inlineInput: {
    marginBottom: 0,
  },
  label: {
    color: DARK_THEME.primaryText,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    color: DARK_THEME.primaryText,
    fontSize: 16,
    minHeight: 52,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    marginBottom: 6,
  },
  locationInput: {
    flex: 1,
    marginBottom: 0,
  },
  locationButton: {
    backgroundColor: DARK_THEME.primaryText,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 52,
  },
  locationButtonDisabled: {
    opacity: 0.5,
  },
  locationButtonText: {
    color: DARK_THEME.primaryBackground,
    fontSize: 13,
    fontWeight: "bold",
  },
  calculateContainer: {
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: DARK_THEME.primaryText,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  primaryButtonText: {
    color: DARK_THEME.primaryBackground,
    fontSize: 16,
    fontWeight: "bold",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 20,
  },
  inputFlex: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  locationError: {
    color: DARK_THEME.primaryBorder,
    fontSize: 13,
    marginBottom: 12,
    marginTop: -10,
  },
  fieldError: {
    color: DARK_THEME.primaryBorder,
    fontSize: 13,
    marginTop: -16,
    marginBottom: 12,
  },
  inputError: {
    borderColor: DARK_THEME.primaryBorder,
  },
  fuelTypeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  fuelTypeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    alignItems: "center",
  },
  fuelTypeButtonActive: {
    backgroundColor: DARK_THEME.primaryText,
    borderColor: DARK_THEME.primaryText,
  },
  fuelTypeText: {
    color: DARK_THEME.primaryText,
    fontSize: 14,
    fontWeight: "600",
  },
  fuelTypeTextActive: {
    color: DARK_THEME.primaryBackground,
  },
  safeArea: {
    flex: 1,
  },
});
