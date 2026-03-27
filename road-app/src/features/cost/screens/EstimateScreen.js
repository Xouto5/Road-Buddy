/* ======================================== //
CREDITS:
KEITH: Estimate screen for RoadBuddy app. Users can enter their trip distance, vehicle MPG, 
       and current gas price to get an estimate of fuel cost for the trip. UI only screen. 
       No calculations will be done as of 03/11/26.
        
       Date completed: 03/11/2026


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
import { DARK_THEME } from "../../../shared/style/ColorScheme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EstimateScreen({ navigation }) {
  const [mpg, setMpg] = useState("");
  const [gasPrice, setGasPrice] = useState("");
  const [distance, setDistance] = useState("");

  const [results, setResults] = useState({
    gallons: "0.00",
    costPerMile: "0.00",
    totalCost: "0.00",
  });

  const handleRecalculate = () => {
    // Calculations will go here
    console.log("Recalculating");
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
            <Text style={styles.title}>Trip Cost Estimate</Text>
            <Text style={styles.subtitle}>Enter trip details below</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Distance (miles)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 100"
              placeholderTextColor={DARK_THEME.placeholder}
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Vehicle MPG</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 28"
              placeholderTextColor={DARK_THEME.placeholder}
              value={mpg}
              onChangeText={setMpg}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Gas Price (per gallon)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 4.25"
              placeholderTextColor={DARK_THEME.placeholder}
              value={gasPrice}
              onChangeText={setGasPrice}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.calculateContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRecalculate}
            >
              <Text style={styles.primaryButtonText}>Calculate</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Results</Text>

            <View style={styles.resultsRow}>
              <Text style={styles.resultsLabel}>Distance:</Text>
              <Text style={styles.resultsValue}>{distance || "0"} mi</Text>
            </View>

            <View style={styles.resultsRow}>
              <Text style={styles.resultsLabel}>Estimated gallons:</Text>
              <Text style={styles.resultsValue}>{results.gallons} gal</Text>
            </View>

            <View style={styles.resultsRow}>
              <Text style={styles.resultsLabel}>Cost / mile:</Text>
              <Text style={styles.resultsValue}>${results.costPerMile}</Text>
            </View>

            <View style={[styles.resultsRow, styles.resultsRowLast]}>
              <Text style={styles.resultsLabel}>Total fuel cost:</Text>
              <Text style={styles.resultsValue}>${results.totalCost}</Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => console.log("Trip saved")}
            >
              <Text style={styles.primaryButtonText}>Save Trip</Text>
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
    marginBottom: 25,
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
    fontSize: 14,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    color: DARK_THEME.primaryText,
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 8,
    padding: 16,
    marginBottom: 18,
    color: DARK_THEME.primaryText,
    fontSize: 16,
  },
  calculateContainer: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultsCard: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
  },
  resultsTitle: {
    color: DARK_THEME.primaryText,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  resultsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  resultsRowLast: {
    borderBottomWidth: 0,
  },
  resultsLabel: {
    color: DARK_THEME.placeholder,
    fontSize: 14,
  },
  resultsValue: {
    color: DARK_THEME.primaryText,
    fontSize: 14,
    fontWeight: "bold",
  },
  actionsContainer: {
    marginTop: 10,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: DARK_THEME.primaryText,
    fontSize: 16,
    fontWeight: "600",
  },
  safeArea: {
    flex: 1,
  },
});
