/* ======================================== //
CREDITS:
BRIAN:  Created Trips Results sub-screen, added navigation from 
        Estimate screen, added Save Trip modal.
  
        Date completed: 04/26/2026

// ======================================== */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DARK_THEME } from "../../../shared/style/ColorScheme";

const withAlpha = (hexColor, alpha) => {
  const hex = (hexColor || "").replace("#", "");
  if (hex.length !== 6) return hexColor;
  const int = Number.parseInt(hex, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function TripResults({ route, navigation }) {
  const [modalVisible, setModalVisible] = useState(false);

  const {
    startLocation = "",
    destination = "",
    vehicle = "",
    mpg = "",
    distance = "",
    gasPrice = "",
    fuelType = "Regular",
    gallons = "0.00",
    costPerMile = "0.00",
    totalCost = "0.00",
  } = route.params ?? {};

  const gasPriceNumber = parseFloat(String(gasPrice || "").replace(/[^0-9.]/g, ""));

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          {/* Display title: "Trip Results" at the top of the screen. */}
          <Text style={styles.title}>Trip Results</Text>
          {/* Display subtitle: "Here are your trip details." */}
          <Text style={styles.subtitle}>Here are your trip details.</Text>
        </View>

        {/* Create a results container to organize information. */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsHeader}>Results:</Text>
          {/* Display Distance in miles. */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Distance</Text>
            <Text style={styles.rowValue}>{distance || "—"} mi</Text>
          </View>
          {/* Display Estimated gallons used. */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Estimated gallons used</Text>
            <Text style={styles.rowValue}>{gallons} gal</Text>
          </View>
          {/* Display Gas price used and include selected type (Regular, Premium, Diesel). */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Gas price ({fuelType})</Text>
            <Text style={styles.rowValue}>${!isNaN(gasPriceNumber) ? gasPriceNumber.toFixed(2) : "0.00"} / gal</Text>
          </View>
          {/* Display MPG used for calculation. */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>MPG</Text>
            <Text style={styles.rowValue}>{mpg || "—"}</Text>
          </View>
          <View style={styles.divider} />
          {/* Display Total trip cost. */}
          {/* Total trip cost should be visually emphasized (larger or bold). */}
          <View style={[styles.row, styles.rowLast, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total trip cost</Text>
            <Text style={styles.totalValue}>${totalCost}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <View style={styles.buttonRow}>
            {/* Add "Save Trip" button at bottom of screen. */}
            {/* When pressed, show modal popup. */}
            {/* Modal should display bold title: "Saved Trip!" */}
            {/* Modal should display message: "Go to Trips to see your saved trips." */}
            {/* Modal should be dismissible by tapping outside or pressing a close button. */}
            <TouchableOpacity
              style={[styles.primaryButton, { flex: 1 }]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.primaryButtonText}>Save Trip</Text>
            </TouchableOpacity>

            {/* Add "Edit Trip" button next to Save Trip. */}
            {/* When pressed, navigate back to Estimate screen with all inputs preserved. */}
            <TouchableOpacity
              style={[styles.primaryButton, { flex: 1 }]}
              onPress={() =>
                navigation.navigate("Home", {
                  screen: "Estimate",
                  params: { startLocation, destination, vehicle, mpg, gasPrice, fuelType, distance },
                })
              }
            >
              <Text style={styles.primaryButtonText}>Edit Trip</Text>
            </TouchableOpacity>
          </View>

          {/* Add "Done" button below. */}
          {/* When pressed, exit the Results screen to main flow. */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Home", { screen: "Plan" })}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <Text style={styles.modalTitle}>Saved Trip!</Text>
            <Text style={styles.modalMessage}>Go to Trips to see your saved trips.</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK_THEME.primaryBackground,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
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
  resultsContainer: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 16,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 24,
  },
  resultsHeader: {
    color: DARK_THEME.primaryText,
    fontSize: 17,
    fontWeight: "bold",
  },
  cardTitle: {
    color: DARK_THEME.primaryText,
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: withAlpha(DARK_THEME.primaryText, 0.1),
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    color: DARK_THEME.primaryText,
    fontSize: 14,
    flexShrink: 1,
    marginRight: 12,
  },
  rowValue: {
    color: DARK_THEME.primaryText,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
  },
  totalRow: {
    marginTop: 6,
  },
  divider: {
    borderBottomWidth: 3,
    borderBottomColor: DARK_THEME.primaryText,
    marginVertical: 8,
  },
  totalLabel: {
    color: DARK_THEME.primaryText,
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    color: DARK_THEME.primaryText,
    fontSize: 18,
    fontWeight: "bold",
  },
  actions: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
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
  secondaryButton: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: DARK_THEME.primaryText,
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: withAlpha(DARK_THEME.primaryBackground, 0.6),
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: DARK_THEME.modalBackground,
    borderRadius: 14,
    padding: 28,
    width: "80%",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    color: DARK_THEME.primaryText,
    fontSize: 20,
    fontWeight: "bold",
  },
  modalMessage: {
    color: DARK_THEME.placeholder,
    fontSize: 15,
    textAlign: "center",
  },
  modalCloseButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: DARK_THEME.primaryText,
  },
  modalCloseText: {
    color: DARK_THEME.primaryBackground,
    fontWeight: "bold",
    fontSize: 15,
  },
});
