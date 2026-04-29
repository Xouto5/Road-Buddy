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
  
        Date completed: 04/26/2026

// ======================================== */

import React, { useState, useEffect, useRef } from "react";
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
import { geocodeAddress } from "../../trip/services/geocodeService";
import { getDirections } from "../../trip/services/directionsService";
import { milesToGallons, tripFuelCost, costPerMile } from "../services/calc";

const GOOGLE_PLACES_ENDPOINT = "https://places.googleapis.com/v1/places:autocomplete";
const AUTOCOMPLETE_FIELD_MASK = [
  "suggestions.placePrediction.placeId",
  "suggestions.placePrediction.text.text",
].join(",");
const PLACES_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID;

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
  const [calculationLoading, setCalculationLoading] = useState(false);
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [startAutocompleteLoading, setStartAutocompleteLoading] = useState(false);
  const [destinationAutocompleteLoading, setDestinationAutocompleteLoading] = useState(false);
  const debounceRef = useRef(null);
  const sessionTokenRef = useRef(`estimate-${Date.now()}`);

  // Repopulate fields when returning from TripResults via Edit Trip
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
      // When pressed, request location permission and autofill using GPS.
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
      setValidationErrors((e) => ({ ...e, startLocation: undefined }));
    } catch (err) {
      setLocationError("Could not retrieve location. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleUseLocalPrice = async () => {
    try {
      setGasPriceLoading(true);
      setValidationErrors((e) => ({ ...e, gasPrice: undefined }));
      // When pressed, autofill gas price value (use of API).

      // Request location permission to determine the user's state for regional pricing.
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setValidationErrors((e) => ({
          ...e,
          gasPrice: "Location permission denied. Enable it in settings to use local price.",
        }));
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const googleApiKey =
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID;

      if (!googleApiKey) {
        throw new Error("Missing Google Maps API key. Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.");
      }

      const params = new URLSearchParams({
        location: `${pos.coords.latitude},${pos.coords.longitude}`,
        radius: "5000",
        type: "gas_station",
        key: googleApiKey,
      });

      const placesResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`,
      );

      if (!placesResponse.ok) {
        throw new Error(`Gas station lookup failed (${placesResponse.status}).`);
      }

      const placesData = await placesResponse.json();

      if (placesData.status !== "OK" && placesData.status !== "ZERO_RESULTS") {
        throw new Error(placesData.error_message || `Places API error: ${placesData.status}`);
      }

      const stations = placesData.results || [];
      const priceLevels = stations
        .map((s) => s.price_level)
        .filter((p) => Number.isInteger(p) && p >= 0 && p <= 4);

      let localPrice = null;
      if (priceLevels.length > 0) {
        const avgPriceLevel =
          priceLevels.reduce((sum, level) => sum + level, 0) / priceLevels.length;

        // Google price_level is 0-4, so convert it to a practical per-gallon estimate.
        const fuelTypeOffsets = { Regular: 0.0, Premium: 0.55, Diesel: 0.35 };
        const estimatedRegular = 2.85 + avgPriceLevel * 0.45;
        localPrice = estimatedRegular + (fuelTypeOffsets[fuelType] || 0);
      }

      if (localPrice === null) {
        throw new Error("Local gas pricing is unavailable for nearby stations. Enter gas price manually.");
      }

      setGasPrice(`$${localPrice.toFixed(2)}`);
      setValidationErrors((e) => ({ ...e, gasPrice: undefined }));
    } catch (err) {
      setValidationErrors((e) => ({
        ...e,
        gasPrice: err.message || "Could not fetch local gas price. Please enter manually.",
      }));
    } finally {
      setGasPriceLoading(false);
    }
  };

  const normalizeGasPriceInput = (value) => {
    const cleaned = (value || "").replace(/[^0-9.]/g, "");
    const [whole = "", ...rest] = cleaned.split(".");
    const normalized = rest.length > 0 ? `${whole}.${rest.join("")}` : whole;
    return normalized ? `$${normalized}` : "";
  };

  const parseGasPriceValue = (value) => {
    const numeric = (value || "").replace(/[^0-9.]/g, "");
    return parseFloat(numeric);
  };

  const validateStartLocation = (value) => {
    if (!value || !value.trim()) return "Start location is required.";
    return undefined;
  };

  const handleAutocompleteLookup = async (field, rawText) => {
    const text = (rawText || "").trim();

    if (text.length < 3) {
      if (field === "start") {
        setStartSuggestions([]);
      } else {
        setDestinationSuggestions([]);
      }
      return;
    }

    if (field === "start") {
      setStartAutocompleteLoading(true);
    } else {
      setDestinationAutocompleteLoading(true);
    }

    try {
      const response = await fetch(GOOGLE_PLACES_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": PLACES_API_KEY,
          "X-Goog-FieldMask": AUTOCOMPLETE_FIELD_MASK,
        },
        body: JSON.stringify({
          input: text,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ["us"],
        }),
      });

      if (!response.ok) {
        throw new Error(`Autocomplete request failed (${response.status})`);
      }

      const result = await response.json();
      const suggestions = result?.suggestions || [];

      if (field === "start") {
        setStartSuggestions(suggestions);
      } else {
        setDestinationSuggestions(suggestions);
      }
    } catch {
      if (field === "start") {
        setStartSuggestions([]);
      } else {
        setDestinationSuggestions([]);
      }
    } finally {
      if (field === "start") {
        setStartAutocompleteLoading(false);
      } else {
        setDestinationAutocompleteLoading(false);
      }
    }
  };

  const handleAddressTyping = (field, text) => {
    if (field === "start") {
      setStartLocation(text);
      setLocationError("");
      setValidationErrors((e) => ({ ...e, startLocation: undefined }));
    } else {
      setDestination(text);
      setValidationErrors((e) => ({ ...e, destination: undefined }));
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleAutocompleteLookup(field, text);
    }, 400);
  };

  const handleSelectSuggestion = (field, suggestion) => {
    const selectedText = suggestion?.placePrediction?.text?.text || "";
    if (!selectedText) return;

    if (field === "start") {
      setStartLocation(selectedText);
      setStartSuggestions([]);
      setValidationErrors((e) => ({ ...e, startLocation: undefined }));
    } else {
      setDestination(selectedText);
      setDestinationSuggestions([]);
      setValidationErrors((e) => ({ ...e, destination: undefined }));
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleRecalculate = async () => {
    const errors = {};
    const gasPriceNumber = parseGasPriceValue(gasPrice);
    const startLocationError = validateStartLocation(startLocation);
    if (startLocationError) errors.startLocation = startLocationError;
    if (!destination.trim()) errors.destination = "Destination is required.";
    if (!mpg.trim() || isNaN(parseFloat(mpg)) || parseFloat(mpg) <= 0)
      errors.mpg = "Enter a valid MPG.";
    if (!gasPrice.trim() || isNaN(gasPriceNumber) || gasPriceNumber <= 0)
      errors.gasPrice = "Enter a valid gas price.";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setCalculationLoading(true);
      
      // Geocode both addresses to get lat/lng
      const startCoords = await geocodeAddress(startLocation);
      const destCoords = await geocodeAddress(destination);

      // Get directions to calculate distance
      const directionsData = await getDirections({
        origin: { lat: startCoords.lat, lng: startCoords.lng },
        destination: { lat: destCoords.lat, lng: destCoords.lng },
      });

      const distance = directionsData.distanceMiles;
      const duration = directionsData.durationMinutes;
      const mpgNumber = parseFloat(mpg);
      
      // Calculate gallons, cost per mile, and total cost
      const gallonsUsed = milesToGallons(distance, mpgNumber);
      const totalTripCost = tripFuelCost(distance, mpgNumber, gasPriceNumber);
      const costMileValue = costPerMile(mpgNumber, gasPriceNumber);

      // Format values for display
      const gallonsDisplay = gallonsUsed !== null ? gallonsUsed.toFixed(2) : "0.00";
      const costPerMileDisplay = costMileValue !== null ? costMileValue.toFixed(2) : "0.00";
      const totalCostDisplay = totalTripCost !== null ? totalTripCost.toFixed(2) : "0.00";

      navigation.navigate("TripResults", {
        startLocation,
        destination,
        vehicle,
        mpg,
        gasPrice,
        fuelType,
        distance: distance.toFixed(2),
        duration: Number.isFinite(duration) ? Math.ceil(duration) : 0,
        overviewPolyline: directionsData.polyline || "",
        gallons: gallonsDisplay,
        costPerMile: costPerMileDisplay,
        totalCost: totalCostDisplay,
      });
    } catch (error) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        calculation: error.message || "Failed to calculate trip. Please try again.",
      }));
    } finally {
      setCalculationLoading(false);
    }
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
                style={[styles.input, styles.locationInput, validationErrors.startLocation && styles.inputError]}
                placeholder="e.g., New York, NY"
                placeholderTextColor={DARK_THEME.placeholder}
                value={startLocation}
                onChangeText={(v) => handleAddressTyping("start", v)}
                onBlur={() => {
                  const startLocationError = validateStartLocation(startLocation);
                  setValidationErrors((e) => ({ ...e, startLocation: startLocationError }));
                }}
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
            {startAutocompleteLoading ? (
              <Text style={styles.helperText}>Loading suggestions...</Text>
            ) : null}
            {startSuggestions.length > 0 ? (
              <View style={styles.suggestionsBox}>
                {startSuggestions.slice(0, 5).map((item, idx) => (
                  <TouchableOpacity
                    key={item?.placePrediction?.placeId || `${item?.placePrediction?.text?.text || "place"}-${idx}`}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion("start", item)}
                  >
                    <Text style={styles.suggestionText}>{item?.placePrediction?.text?.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            {locationError ? (
              <Text style={styles.fieldError}>{locationError}</Text>
            ) : null}
            {validationErrors.startLocation ? (
              <Text style={styles.fieldError}>{validationErrors.startLocation}</Text>
            ) : null}

            {/* Destination input labeled "Destination" below start location. */}
            <Text style={styles.label}>Destination</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.destination && styles.inputError,
                validationErrors.destination && styles.destinationInputErrorSpacing,
              ]}
              placeholder="e.g., Los Angeles, CA"
              placeholderTextColor={DARK_THEME.placeholder}
              value={destination}
              onChangeText={(v) => handleAddressTyping("destination", v)}
            />
            {destinationAutocompleteLoading ? (
              <Text style={styles.helperText}>Loading suggestions...</Text>
            ) : null}
            {destinationSuggestions.length > 0 ? (
              <View style={styles.suggestionsBox}>
                {destinationSuggestions.slice(0, 5).map((item, idx) => (
                  <TouchableOpacity
                    key={item?.placePrediction?.placeId || `${item?.placePrediction?.text?.text || "place"}-${idx}`}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion("destination", item)}
                  >
                    <Text style={styles.suggestionText}>{item?.placePrediction?.text?.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
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
                placeholder="e.g., $4.25"
                placeholderTextColor={DARK_THEME.placeholder}
                value={gasPrice}
                onChangeText={(v) => {
                  setGasPrice(normalizeGasPriceInput(v));
                  setValidationErrors((e) => ({ ...e, gasPrice: undefined }));
                }}
                onBlur={() => {
                  const n = parseGasPriceValue(gasPrice);
                  if (!isNaN(n) && n > 0) setGasPrice(`$${n.toFixed(2)}`);
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

          {validationErrors.calculation ? (
            <Text style={styles.fieldError}>{validationErrors.calculation}</Text>
          ) : null}

          {/* Add "Calculate" button at the bottom of the screen. */}
          {/* This should be the primary button and visually emphasized. */}
          {/* When pressed, validate required inputs before proceeding. */}
          {/* If valid, navigate to a new Results screen. */}
          {/* Do not display results on the same screen. */}
          <View style={styles.calculateContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, calculationLoading && styles.primaryButtonDisabled]}
              onPress={handleRecalculate}
              disabled={calculationLoading}
            >
              <Text style={styles.primaryButtonText}>
                {calculationLoading ? "Calculating…" : "Calculate"}
              </Text>
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
  helperText: {
    color: DARK_THEME.placeholder,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  suggestionsBox: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 10,
    backgroundColor: DARK_THEME.modalBackground,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.primaryBorder,
  },
  suggestionText: {
    color: DARK_THEME.primaryText,
    fontSize: 14,
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
  primaryButtonDisabled: {
    opacity: 0.5,
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
    color: "#EF4444",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 12,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  destinationInputErrorSpacing: {
    marginBottom: 8,
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