/* ======================================== //
CREDITS:
BRIAN:  Created Trips Results sub-screen, added navigation from 
        Estimate screen, added Save Trip modal.
  
        Date completed: 04/26/2026
// ======================================== */

import { saveTrip } from "../../trip/services/tripServices";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Alert,
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
  const [currentTripId, setCurrentTripId] = useState(route.params?.tripId || null);

  const isEditMode = !!route.params?.tripId;
  
  const {
    startLocation = "",
    destination = "",
    vehicle = "",
    mpg = "",
    distance = "",
    duration = 0,
    gasPrice = "",
    fuelType = "Regular",
    overviewPolyline = "",
    gallons = "0.00",
    costPerMile = "0.00",
    totalCost = "0.00",
    titleOverride = "Trip Results",
  } = route.params ?? {};

  const gasPriceNumber = parseFloat(String(gasPrice || "").replace(/[^0-9.]/g, ""));

  const handleShowInOverview = () => {
    const mpgNumber = parseFloat(String(mpg || "").replace(/[^0-9.]/g, ""));
    const distanceNumber = parseFloat(String(distance || "").replace(/[^0-9.]/g, ""));
    const durationNumber = parseFloat(String(duration || "").replace(/[^0-9.]/g, ""));

    if (!overviewPolyline) {
      Alert.alert("Overview unavailable", "Route details are missing.");
      return;
    }

    navigation.navigate("Home", {
      screen: "Overview",
      params: {
        estDetail: {
          distance: Number.isFinite(distanceNumber) ? Math.ceil(distanceNumber) : 0,
          duration: Number.isFinite(durationNumber) ? Math.ceil(durationNumber) : 0,
          gasPrice: Number.isFinite(gasPriceNumber) ? gasPriceNumber : 0,
          polylines: { encodedPolyline: overviewPolyline },
        },
        pointA: { placePrediction: { text: { text: startLocation } } },
        pointB: { placePrediction: { text: { text: destination } } },
        car: {
          mpg_combined: Number.isFinite(mpgNumber) && mpgNumber > 0 ? mpgNumber : 25,
          label: vehicle || "Vehicle",
        },
      },
    });
  };

  const handleSaveToDatabase = async () => {
    const tripData = {
      startLocation,
      destination,
      vehicle,
      mpg,
      distance,
      duration,
      gasPrice: gasPriceNumber,
      fuelType,
      totalCost,
      overviewPolyline
    };

    const result = await saveTrip(tripData, currentTripId);

    if (result.success) {
      setCurrentTripId(result.id);
      setModalVisible(true);
    }
  };

  const navigateToHistory = () => {
    setModalVisible(false);
    navigation.navigate("Home", {
      screen: "Trips",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{titleOverride}</Text>
          <Text style={styles.subtitle}>Here are your trip details.</Text>
        </View>

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsHeader}>Results:</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Distance</Text>
            <Text style={styles.rowValue}>{distance || "—"} mi</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Estimated gallons used</Text>
            <Text style={styles.rowValue}>{gallons} gal</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Gas price ({fuelType})</Text>
            <Text style={styles.rowValue}>
                ${!isNaN(gasPriceNumber) ? gasPriceNumber.toFixed(2) : "0.00"} / gal
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>MPG</Text>
            <Text style={styles.rowValue}>{mpg || "—"}</Text>
          </View>

          {/* FIXED: Replaced div with View */}
          <View style={styles.divider} />

          <View style={[styles.row, styles.rowLast, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total trip cost</Text>
            <Text style={styles.totalValue}>${totalCost}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleShowInOverview}>
            <Text style={styles.primaryButtonText}>Show in Overview</Text>
          </TouchableOpacity>

          {!isEditMode && (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={handleSaveToDatabase}>
                <Text style={styles.primaryButtonText}>Save Trip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1 }]}
                onPress={() =>
                  navigation.navigate("Home", {
                    screen: "Estimate",
                    params: { tripId: currentTripId, startLocation, destination, vehicle, mpg, gasPrice, fuelType, distance },
                  })
                }
              >
                <Text style={styles.primaryButtonText}>Edit Trip</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={navigateToHistory}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={navigateToHistory}
      >
        <Pressable style={styles.modalOverlay} onPress={navigateToHistory}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{isEditMode ? "Trip Updated!" : "Saved Trip!"}</Text>
            <Text style={styles.modalMessage}>
                {isEditMode 
                    ? "Your changes have been successfully saved." 
                    : "You can find this trip in your trip history."}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={navigateToHistory}
            >
              <Text style={styles.modalCloseText}>View Trips</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: DARK_THEME.primaryBackground,
  },
  resultsHeader: {
    color: DARK_THEME.primaryText,
    fontSize: 17,
    fontWeight: "bold",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: withAlpha(DARK_THEME.primaryBackground, 0.75),
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