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

GEMINI: Integrated "Edit Mode" logic and updated placeholders to match 
        provided UI design reference.
// ======================================== */

import { useState, useEffect, useRef } from "react";
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
  Alert
} from "react-native";
import { DARK_THEME } from "../../../shared/style/ColorScheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { geocodeAddress } from "../../trip/services/geocodeService";
import { getDirections } from "../../trip/services/directionsService";
import { milesToGallons, tripFuelCost, costPerMile } from "../services/calc";
import { verifyEmail, isUserVerified } from "../../auth/services/authServices";

const GOOGLE_PLACES_ENDPOINT =
  "https://places.googleapis.com/v1/places:autocomplete";
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
  const [isEditing, setIsEditing] = useState(false);
  const [startAutocompleteLoading, setStartAutocompleteLoading] =
    useState(false);
  const [destinationAutocompleteLoading, setDestinationAutocompleteLoading] =
    useState(false);
  const debounceRef = useRef(null);
  const sessionTokenRef = useRef(`estimate-${Date.now()}`);

  const hasRun = useRef(false);

  useEffect(() => {
    if(!isUserVerified() && !hasRun.current){
      hasRun.current = true;
      setTimeout(() => {
        Alert.alert(
          'Email is not verified',
          'Please verify your email. Check your email for an existing link, or click send again to receive a new one.',
          [
            { text: 'Okay' },
            { text: 'Send Again', onPress: () => verifyEmail() },
          ],
          { cancelable: false },
        );
      }, 5000);
    }
  }, []);

  useEffect(() => {
    const p = route?.params;
    if (!p) return;

    if (p.tripId) {
      setIsEditing(true);
    }

    if (p.startLocation !== undefined) setStartLocation(p.startLocation);
    if (p.destination !== undefined) setDestination(p.destination);
    if (p.vehicle !== undefined) setVehicle(p.vehicle);
    if (p.mpg !== undefined) setMpg(p.mpg);
    if (p.gasPrice !== undefined) setGasPrice(p.gasPrice);
    if (p.fuelType !== undefined) setFuelType(p.fuelType);
  }, [route?.params]);

  const resetForm = () => {
    setStartLocation("");
    setDestination("");
    setVehicle("");
    setMpg("");
    setGasPrice("");
    setFuelType("Regular");
    setValidationErrors({});
    setIsEditing(false);
    navigation.setParams({ 
        tripId: undefined, 
        startLocation: undefined, 
        destination: undefined,
        vehicle: undefined,
        mpg: undefined,
        gasPrice: undefined,
        fuelType: undefined
    });
  };

  const handleUseMyLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError("");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission denied.");
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
      setLocationError("Could not retrieve location.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleUseLocalPrice = async () => {
    try {
      setGasPriceLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const params = new URLSearchParams({
        location: `${pos.coords.latitude},${pos.coords.longitude}`,
        radius: "5000",
        type: "gas_station",
        key: PLACES_API_KEY,
      });

      const res = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`);
      const data = await res.json();
      const stations = data.results || [];
      const priceLevels = stations.map((s) => s.price_level).filter((p) => Number.isInteger(p));

      if (priceLevels.length > 0) {
        const avg = priceLevels.reduce((a, b) => a + b, 0) / priceLevels.length;
        const offset = { Regular: 0.0, Premium: 0.55, Diesel: 0.35 }[fuelType] || 0;
        const est = 2.85 + avg * 0.45 + offset;
        setGasPrice(`$${est.toFixed(2)}`);
      }
    } catch (err) {
      setValidationErrors((e) => ({ ...e, gasPrice: "Could not fetch local price." }));
    } finally {
      setGasPriceLoading(false);
    }
  };

  const normalizeGasPriceInput = (value) => {
    const cleaned = (value || "").replace(/[^0-9.]/g, "");
    return cleaned ? `$${cleaned}` : "";
  };

  const parseGasPriceValue = (value) => {
    const numeric = (value || "").replace(/[^0-9.]/g, "");
    return parseFloat(numeric);
  };

  const handleAddressTyping = (field, text) => {
    if (field === "start") setStartLocation(text);
    else setDestination(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleAutocompleteLookup(field, text), 400);
  };

  const handleAutocompleteLookup = async (field, rawText) => {
    const text = (rawText || "").trim();
    if (text.length < 3) return;

    field === "start" ? setStartAutocompleteLoading(true) : setDestinationAutocompleteLoading(true);
    try {
      const response = await fetch(GOOGLE_PLACES_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": PLACES_API_KEY, "X-Goog-FieldMask": AUTOCOMPLETE_FIELD_MASK },
        body: JSON.stringify({ input: text, sessionToken: sessionTokenRef.current, includedRegionCodes: ["us"] }),
      });
      const result = await response.json();
      field === "start" ? setStartSuggestions(result.suggestions || []) : setDestinationSuggestions(result.suggestions || []);
    } finally {
      field === "start" ? setStartAutocompleteLoading(false) : setDestinationAutocompleteLoading(false);
    }
  };

  const handleSelectSuggestion = (field, suggestion) => {
    const selectedText = suggestion?.placePrediction?.text?.text || "";
    if (field === "start") {
      setStartLocation(selectedText);
      setStartSuggestions([]);
    } else {
      setDestination(selectedText);
      setDestinationSuggestions([]);
    }
  };

  const handleRecalculate = async () => {
    const errors = {};
    const gasPriceNumber = parseGasPriceValue(gasPrice);
    if (!startLocation.trim()) errors.startLocation = "Start location is required.";
    if (!destination.trim()) errors.destination = "Destination is required.";
    if (!mpg.trim() || isNaN(parseFloat(mpg))) errors.mpg = "Enter valid MPG.";
    if (!gasPrice.trim() || isNaN(gasPriceNumber)) errors.gasPrice = "Enter valid gas price.";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setCalculationLoading(true);
      const startCoords = await geocodeAddress(startLocation);
      const destCoords = await geocodeAddress(destination);
      const directionsData = await getDirections({
        origin: { lat: startCoords.lat, lng: startCoords.lng },
        destination: { lat: destCoords.lat, lng: destCoords.lng },
      });

      const distance = directionsData.distanceMiles;
      const mpgNumber = parseFloat(mpg);

      navigation.navigate("TripResults", {
        tripId: route.params?.tripId,
        startLocation,
        destination,
        vehicle,
        mpg,
        gasPrice,
        fuelType,
        distance: distance.toFixed(2),
        duration: Math.ceil(directionsData.durationMinutes),
        overviewPolyline: directionsData.polyline || "",
        gallons: milesToGallons(distance, mpgNumber).toFixed(2),
        totalCost: tripFuelCost(distance, mpgNumber, gasPriceNumber).toFixed(2),
      });
    } catch (error) {
      setValidationErrors({ calculation: "Calculation failed." });
    } finally {
      setCalculationLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{isEditing ? "Edit Your Trip" : "Estimate Your Trip"}</Text>
            <Text style={styles.subtitle}>{isEditing ? "Update your trip details below." : "Enter trip details below."}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Start location</Text>
            <View style={styles.locationRow}>
              <TextInput
                style={[styles.input, styles.locationInput, validationErrors.startLocation && styles.inputError]}
                placeholder="e.g., New York, NY"
                placeholderTextColor={DARK_THEME.placeholder}
                value={startLocation}
                onChangeText={(v) => handleAddressTyping("start", v)}
              />
              <TouchableOpacity style={styles.locationButton} onPress={handleUseMyLocation} disabled={locationLoading}>
                <Text style={styles.locationButtonText}>{locationLoading ? "Locating…" : "Use my location"}</Text>
              </TouchableOpacity>
            </View>
            {startSuggestions.length > 0 && (
              <View style={styles.suggestionsBox}>
                {startSuggestions.slice(0, 5).map((item, idx) => (
                  <TouchableOpacity key={idx} style={styles.suggestionItem} onPress={() => handleSelectSuggestion("start", item)}>
                    <Text style={styles.suggestionText}>{item?.placePrediction?.text?.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Destination</Text>
            <TextInput
              style={[styles.input, validationErrors.destination && styles.inputError]}
              placeholder="e.g., Los Angeles, CA"
              placeholderTextColor={DARK_THEME.placeholder}
              value={destination}
              onChangeText={(v) => handleAddressTyping("destination", v)}
            />
            {destinationSuggestions.length > 0 && (
              <View style={styles.suggestionsBox}>
                {destinationSuggestions.slice(0, 5).map((item, idx) => (
                  <TouchableOpacity key={idx} style={styles.suggestionItem} onPress={() => handleSelectSuggestion("destination", item)}>
                    <Text style={styles.suggestionText}>{item?.placePrediction?.text?.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.inlineRow}>
              <View style={styles.inlineLeft}>
                <Text style={styles.label}>Vehicle</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g., 2023 Toyota Camry" 
                  placeholderTextColor={DARK_THEME.placeholder} 
                  value={vehicle} 
                  onChangeText={setVehicle} 
                />
              </View>
              <View style={styles.inlineRight}>
                <Text style={styles.label}>MPG</Text>
                <TextInput 
                  style={[styles.input, validationErrors.mpg && styles.inputError]} 
                  keyboardType="numeric" 
                  placeholder="e.g., 28"
                  placeholderTextColor={DARK_THEME.placeholder}
                  value={mpg} 
                  onChangeText={setMpg} 
                />
              </View>
            </View>

            <Text style={styles.label}>Gas Price (per gallon)</Text>
            <View style={styles.fuelTypeRow}>
              {["Regular", "Premium", "Diesel"].map((type) => (
                <TouchableOpacity key={type} style={[styles.fuelTypeButton, fuelType === type && styles.fuelTypeButtonActive]} onPress={() => setFuelType(type)}>
                  <Text style={[styles.fuelTypeText, fuelType === type && styles.fuelTypeTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.locationRow}>
              <TextInput 
                style={[styles.input, styles.locationInput]} 
                keyboardType="numeric" 
                placeholder="e.g., $4.25"
                placeholderTextColor={DARK_THEME.placeholder}
                value={gasPrice} 
                onChangeText={(v) => setGasPrice(normalizeGasPriceInput(v))} 
              />
              <TouchableOpacity style={styles.locationButton} onPress={handleUseLocalPrice} disabled={gasPriceLoading}>
                <Text style={styles.locationButtonText}>Use local price</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.calculateContainer}>
            {isEditing ? (
              <View style={styles.editButtonRow}>
                <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={handleRecalculate}>
                  <Text style={styles.primaryButtonText}>Update Trip</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={resetForm}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={handleRecalculate}>
                <Text style={styles.primaryButtonText}>Calculate</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_THEME.primaryBackground, paddingHorizontal: 20 },
  scrollContent: { paddingTop: 16, paddingBottom: 40 },
  headerContainer: { marginBottom: 28, alignItems: "center" },
  title: { color: DARK_THEME.primaryText, fontSize: 26, fontWeight: "bold", textAlign: "center" },
  subtitle: { color: DARK_THEME.placeholder, fontSize: 15, textAlign: "center" },
  inputContainer: { marginBottom: 20 },
  label: { color: DARK_THEME.primaryText, fontSize: 15, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: DARK_THEME.primaryBorder, borderRadius: 10, padding: 14, color: DARK_THEME.primaryText, fontSize: 16, marginBottom: 20 },
  locationRow: { flexDirection: "row", gap: 10, marginBottom: 6 },
  locationInput: { flex: 1, marginBottom: 0 },
  locationButton: { backgroundColor: DARK_THEME.primaryText, paddingHorizontal: 14, borderRadius: 10, justifyContent: "center" },
  locationButtonText: { color: DARK_THEME.primaryBackground, fontSize: 13, fontWeight: "bold" },
  suggestionsBox: { backgroundColor: DARK_THEME.modalBackground, borderRadius: 10, marginBottom: 10 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: DARK_THEME.primaryBorder },
  suggestionText: { color: DARK_THEME.primaryText },
  inlineRow: { flexDirection: "row", gap: 12 },
  inlineLeft: { flex: 3 },
  inlineRight: { flex: 1 },
  fuelTypeRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  fuelTypeButton: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: DARK_THEME.primaryBorder, alignItems: "center" },
  fuelTypeButtonActive: { backgroundColor: DARK_THEME.primaryText },
  fuelTypeText: { color: DARK_THEME.primaryText },
  fuelTypeTextActive: { color: DARK_THEME.primaryBackground },
  calculateContainer: { marginBottom: 24 },
  primaryButton: { backgroundColor: DARK_THEME.primaryText, padding: 16, borderRadius: 10, alignItems: "center" },
  primaryButtonText: { color: DARK_THEME.primaryBackground, fontWeight: "bold", fontSize: 16 },
  secondaryButton: { borderWidth: 1, borderColor: DARK_THEME.primaryBorder, padding: 16, borderRadius: 10, alignItems: "center" },
  secondaryButtonText: { color: DARK_THEME.primaryText, fontSize: 16 },
  editButtonRow: { flexDirection: "row", gap: 12 },
  safeArea: { flex: 1 },
  inputError: { borderColor: "#EF4444" }
});