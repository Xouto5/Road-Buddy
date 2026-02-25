/* ======================================== //
CREDITS:

JERRY: UI-only screen for RoadBuddy cost estimation (no working logic yet, needed this so I can start calc.js)


// ======================================== */

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
import useLocation from "../../../core/hooks/useLocation";
import { geocodeAddress } from "../../trip/services/geocodeService";
import { getDirections } from "../../trip/services/directionsService";
import { milesToGallons, tripFuelCost, costPerMile } from "../services/calc";

export default function CostScreen({ navigation }) {
  const { coords, loading, error } = useLocation();
  // UI-only state
  const [destination, setDestination] = useState("");
  const [mpg, setMpg] = useState("");
  const [gasPrice, setGasPrice] = useState("");
  const [distance, setDistance] = useState(""); // optional manual entry for now
  const [destCoords, setDestCoords] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeError, setRouteError] = useState(null);
  const [calcResult, setCalcResult] = useState(null);
  const [calcError, setCalcError] = useState(null);

  //TEMP (TESTING FOR LA COORDS)
  const mockDestination = { lat: 34.0522, lng: -118.2437 };

  //HANDLERS
  const handleGeocode = async () => {
    try {
        setGeoError(null);
        setDestCoords(null);

        const result = await geocodeAddress(destination);
        setDestCoords(result);
        console.log("✅ Geocode result:", result);
    } catch (e) {
        setGeoError(e.message);
        console.error("❌ Geocode error:", e.message);
    }
  };

  const handleGetDistance = async () => {
    try {
      setRouteError(null);
      setRouteInfo(null);

      if (!coords) throw new Error("No current location coords yet");

      const origin = { lat: coords.latitude, lng: coords.longitude };
      const result = await getDirections({ origin, destination: mockDestination });

      setRouteInfo(result);
      console.log("✅ Directions result:", result);
    } catch (e) {
      setRouteError(e.message);
      console.error("❌ Directions error:", e.message);
    }
  };


  const handleCalculate = () => {
    try {
      setCalcError(null);

      if (!routeInfo?.distanceMiles) {
        throw new Error("Please get distance first.");
      }

      const miles = Number(routeInfo.distanceMiles);
      const mpgNum = Number(mpg);
      const priceNum = Number(gasPrice);

      const gallons = milesToGallons(miles, mpgNum);
      const totalCost = tripFuelCost(miles, mpgNum, priceNum);
      const perMile = costPerMile(mpgNum, priceNum);

      if (!Number.isFinite(miles) || miles <= 0) throw new Error("Enter a valid distance in miles.");
      if (!Number.isFinite(mpgNum) || mpgNum <= 0) throw new Error("Enter a valid MPG (example: 28).");
      if (!Number.isFinite(priceNum) || priceNum <= 0) throw new Error("Enter a valid gas price (example: 5.00).");

      setCalcResult({
        miles,
        gallons,
        totalCost,
        perMile,
      });
    } catch (e) {
      setCalcResult(null);
      setCalcError(e.message);
    }
  };

  //SCREEN RENDER
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"} // put IOS only for now
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>

        {/* TEMPORARY FOR DEBUGGING */}
        <Text style={{ color: "white", marginBottom: 10 }}>
          {loading && "Getting location..."}
          {error && `Location error: ${error}`}
          {coords && `Lat: ${coords.latitude.toFixed(5)}  Lng: ${coords.longitude.toFixed(5)}`}
        </Text>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Trip Cost Estimate</Text>
          <Text style={styles.subtitle}>
            Enter trip + vehicle details.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleGeocode}>
            <Text style={styles.primaryButtonText}>Geocode Destination</Text>
        </TouchableOpacity>

        <Text style={{ color: "white", marginBottom: 10 }}> 
            {geoError ? `Geocode error: ${geoError}` : ""}
            {destCoords ? `Dest: ${destCoords.lat.toFixed(5)}, ${destCoords.lng.toFixed(5)}` : ""}
        </Text>

        {/* Input Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Destination (Point B)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter address or place"
            placeholderTextColor="#9CA3AF"
            value={destination}
            onChangeText={setDestination}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Vehicle MPG</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 28"
            placeholderTextColor="#9CA3AF"
            value={mpg}
            onChangeText={setMpg}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Gas Price (per gallon)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 4.25"
            placeholderTextColor="#9CA3AF"
            value={gasPrice}
            onChangeText={setGasPrice}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Distance (miles) — optional manual input</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 12.4"
            placeholderTextColor="#9CA3AF"
            value={distance}
            onChangeText={setDistance}
            keyboardType="numeric"
          />
        </View>

        {/* Action Buttons (Local Gas Price is placeholders) */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetDistance}>
            <Text style={styles.primaryButtonText}>Get Distance (Google Maps)</Text>
          </TouchableOpacity>

          <Text style={{ color: "white", marginBottom: 10 }}>
            {routeError ? `Route error: ${routeError}` : ""}
            {routeInfo
              ? `Distance: ${routeInfo.distanceMiles.toFixed(2)} mi  |  Time: ${routeInfo.durationMinutes.toFixed(0)} min`
              : ""}
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={() => {}}>
            <Text style={styles.primaryButtonText}>Get Local Gas Price</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleCalculate}>
            <Text style={styles.primaryButtonText}>Calculate Trip Cost</Text>
          </TouchableOpacity>
        </View>

        {/* Results Preview */}
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>Preview</Text>

          {/* Show calc errors (if any) */}
          {calcError ? (
            <Text style={{ color: "white", marginBottom: 10 }}>
              {`Calc error: ${calcError}`}
            </Text>
          ) : null}

          <View style={styles.resultsRow}>
            <Text style={styles.resultsLabel}>Distance:</Text>
            <Text style={styles.resultsValue}>
              {routeInfo ? `${routeInfo.distanceMiles.toFixed(2)} mi` : "—"}
            </Text>
          </View>

          <View style={styles.resultsRow}>
            <Text style={styles.resultsLabel}>Estimated gallons:</Text>
            <Text style={styles.resultsValue}>
              {calcResult ? `${calcResult.gallons.toFixed(2)} gal` : "—"}
            </Text>
          </View>

          <View style={styles.resultsRow}>
            <Text style={styles.resultsLabel}>Cost / mile:</Text>
            <Text style={styles.resultsValue}>
              {calcResult ? `$${calcResult.perMile.toFixed(2)}` : "—"}
            </Text>
          </View>

          <View style={[styles.resultsRow, styles.resultsRowLast]}>
            <Text style={styles.resultsLabel}>Total fuel cost:</Text>
            <Text style={styles.resultsValue}>
              {calcResult ? `$${calcResult.totalCost.toFixed(2)}` : "—"}
            </Text>
          </View>
        </View>

        {/* Secondary Links (UI placeholders) */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.linkText}>Save Trip (placeholder)</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.linkText}>View Last Saved Trip (placeholder)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E293B",
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  headerContainer: {
    marginTop: 10,
    marginBottom: 25,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    color: "#CBD5E1",
    fontSize: 14,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 10,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 18,
    color: "#FFFFFF",
    fontSize: 16,
  },
  actionsContainer: {
    width: "100%",
    marginTop: 6,
    marginBottom: 18,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultsCard: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  resultsTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  resultsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  resultsRowLast: {
    borderBottomWidth: 0,
  },
  resultsLabel: {
    color: "#CBD5E1",
    fontSize: 14,
  },
  resultsValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  linksContainer: {
    alignItems: "center",
    marginTop: 5,
  },
  linkText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 10,
    textDecorationLine: "underline",
  },
});