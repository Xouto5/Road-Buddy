/*
Trip Summary Screen Component
Displays past and upcoming trips in an organized, expandable list format.
Users can tap on each trip to view or hide detailed information.

Author: Brian Siebert
Date: 02-24-2026
*/

/*
Modified the UI to be consistent with the other newly updated screens.
Saved trips now pull from firestore and show up on the screen.
Users can now edit selected trips and delete them.
Minimap of trip shows in the dropdown.

Author: Nathan Rochel
Date: 05-07-2026
*/

import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../../../core/firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { DARK_THEME } from "../../../shared/style/ColorScheme"; 
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import polyline from "@mapbox/polyline";

const withAlpha = (hexColor, alpha) => {
  const hex = (hexColor || "").replace("#", "");
  if (hex.length !== 6) return hexColor;
  const int = Number.parseInt(hex, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function TripSection({ title, items, onToggle, onDelete, onEdit, onMapPress }) {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View>
        {items.map((item) => {
          const displayDate = item.updatedAt?.toDate
            ? `Last Edited: ${item.updatedAt
                .toDate()
                .toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`
            : item.createdAt?.toDate
            ? `Created: ${item.createdAt
                .toDate()
                .toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`
            : "Recent";

          const points = item.overviewPolyline
            ? polyline.decode(item.overviewPolyline).map((p) => ({
                latitude: p[0],
                longitude: p[1],
              }))
            : [];

          return (
            <View key={item.id} style={styles.bubbleCard}>
              <View style={styles.rowWrapper}>
                <Pressable style={styles.row} onPress={() => onToggle(item.id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel} numberOfLines={1}>
                      {item.destination || "Unnamed Trip"}
                    </Text>
                    <Text style={styles.rowSubLabel}>{displayDate}</Text>
                  </View>

                  <Ionicons
                    name={item.expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={DARK_THEME.primaryText}
                    style={{ marginHorizontal: 10 }}
                  />
                </Pressable>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEdit(item)}
                >
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={DARK_THEME.primaryText}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {item.expanded && (
                <View style={styles.expandedContent}>
                  {points.length > 0 ? (
                    <TouchableOpacity 
                      activeOpacity={0.9} 
                      onPress={() => onMapPress(item)}
                    >
                      <MapView
                        style={styles.mapPreview}
                        provider={PROVIDER_GOOGLE}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        pitchEnabled={false}
                        rotateEnabled={false}
                        initialRegion={{
                          latitude: points[Math.floor(points.length / 2)].latitude,
                          longitude:
                            points[Math.floor(points.length / 2)].longitude,
                          latitudeDelta: 0.1,
                          longitudeDelta: 0.1,
                        }}
                      >
                        <Polyline
                          coordinates={points}
                          strokeColor={DARK_THEME.primaryText}
                          strokeWidth={3}
                        />
                      </MapView>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.mapPlaceholder}>
                      <Text style={styles.detailText}>
                        No route data available
                      </Text>
                    </View>
                  )}

                  <View style={styles.details}>
                    <Text style={styles.detailText}>
                      From: {item.startLocation}
                    </Text>
                    <Text style={styles.detailText}>
                      Distance: {item.distance} mi
                    </Text>
                    <Text style={styles.detailText}>
                      Fuel Cost: ${item.totalCost}
                    </Text>
                    <Text style={styles.detailText}>
                      Vehicle: {item.vehicle} ({item.mpg} MPG)
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function TripsSummaryScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    primaryBtnText: "Done",
    onPrimaryPress: () => setModalVisible(false),
    secondaryBtnText: null,
    onSecondaryPress: null,
  });

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "trips"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const tripsData = [];

        querySnapshot.forEach((tripDoc) => {
          tripsData.push({
            id: tripDoc.id,
            ...tripDoc.data(),
            expanded: false,
          });
        });

        setTrips(tripsData);
        setLoading(false);
      },
      (error) => {
        console.error("Firebase Sync Error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleTrip = (id) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.id === id ? { ...trip, expanded: !trip.expanded } : trip
      )
    );
  };

  const handleEdit = (trip) => {
    navigation.navigate("Estimate", {
      tripId: trip.id,
      startLocation: trip.startLocation,
      destination: trip.destination,
      vehicle: trip.vehicle,
      mpg: trip.mpg,
      gasPrice: `$${trip.gasPrice}`,
      fuelType: trip.fuelType,
      distance: trip.distance,
    });
  };

  const handleMapPress = (trip) => {
    navigation.navigate("Home", {
      screen: "Overview",
      params: {
        tripId: trip.id, 
        estDetail: {
          distance: parseFloat(trip.distance) || 0,
          duration: parseInt(trip.duration) || 0,
          gasPrice: parseFloat(trip.gasPrice) || 0,
          polylines: {
            encodedPolyline: trip.overviewPolyline,
          },
        },
        pointA: {
          placePrediction: {
            text: { text: trip.startLocation },
          },
        },
        pointB: {
          placePrediction: {
            text: { text: trip.destination },
          },
        },
        car: {
          mpg_combined: parseFloat(trip.mpg) || 25,
          label: trip.vehicle || "Vehicle",
        },
      },
    });
  };

  const confirmDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "trips", id));
      setModalVisible(false);
    } catch (e) {
      setModalConfig({
        title: "Error",
        message: "Could not delete trip.",
        primaryBtnText: "Okay",
        onPrimaryPress: () => setModalVisible(false)
      });
    }
  };

  const handleDeleteRequest = (id) => {
    setModalConfig({
      title: "Delete Trip",
      message: "Are you sure you want to discard this trip? This action cannot be undone.",
      primaryBtnText: "Delete",
      onPrimaryPress: () => confirmDelete(id),
      secondaryBtnText: "Cancel",
      onSecondaryPress: () => setModalVisible(false)
    });
    setModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]} edges={["left", "right", "top", "bottom"]}>
        <ActivityIndicator size="large" color={DARK_THEME.primaryText} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "top", "bottom"]}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.titleHeaderContainer}>
            <Text style={styles.mainTitle}>Trip History</Text>
            <Text style={styles.mainSubtitle}>
              View and manage your saved trips.
            </Text>
          </View>

          <TripSection
            title="Your Saved Trips"
            items={trips}
            onToggle={toggleTrip}
            onDelete={handleDeleteRequest}
            onEdit={handleEdit}
            onMapPress={handleMapPress}
          />

          {trips.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No saved trips yet.
              </Text>
              <TouchableOpacity 
                style={styles.startPlanningBtn}
                onPress={() => navigation.navigate("Estimate")}
              >
                <Text style={styles.startPlanningBtnText}>Start Planning</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>
            
            <View style={styles.modalActionRow}>
                {modalConfig.secondaryBtnText && (
                    <TouchableOpacity
                        style={[styles.modalBtn, styles.modalSecondaryBtn]}
                        onPress={modalConfig.onSecondaryPress}
                    >
                        <Text style={styles.modalSecondaryBtnText}>{modalConfig.secondaryBtnText}</Text>
                    </TouchableOpacity>
                )}
                
                <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={modalConfig.onPrimaryPress}
                >
                    <Text style={styles.modalBtnText}>{modalConfig.primaryBtnText}</Text>
                </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleHeaderContainer: {
    marginBottom: 28,
    alignItems: "center",
    marginTop: 10,
  },
  mainTitle: {
    color: DARK_THEME.primaryText,
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  mainSubtitle: {
    color: DARK_THEME.placeholder,
    fontSize: 15,
    textAlign: "center",
  },
  rowWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowLabel: {
    color: DARK_THEME.primaryText,
    fontSize: 16,
    fontWeight: "600",
  },
  rowSubLabel: {
    color: DARK_THEME.placeholder,
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    padding: 10,
  },
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.primaryBackground,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: DARK_THEME.primaryText,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  bubbleCard: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    backgroundColor: DARK_THEME.primaryBackground,
  },
  expandedContent: {
    backgroundColor: DARK_THEME.primaryBackground,
    paddingBottom: 4,
  },
  mapPreview: {
    height: 120,
    marginHorizontal: 14,
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
  },
  mapPlaceholder: {
    height: 120,
    marginHorizontal: 14,
    marginTop: 4,
    backgroundColor: DARK_THEME.modalBackground,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
  },
  details: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  detailText: {
    color: DARK_THEME.primaryText,
    fontSize: 13,
    marginBottom: 2,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
    gap: 20,
  },
  emptyText: {
    color: DARK_THEME.placeholder,
    textAlign: "center",
    fontSize: 16,
  },
  startPlanningBtn: {
    backgroundColor: DARK_THEME.primaryText,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    maxWidth: 250,
    alignItems: "center",
  },
  startPlanningBtnText: {
    color: DARK_THEME.primaryBackground,
    fontSize: 16,
    fontWeight: "bold",
  },
  safeArea: {
    flex: 1,
    backgroundColor: DARK_THEME.primaryBackground,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DARK_THEME.primaryBackground,
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: withAlpha(DARK_THEME.primaryBackground, 0.75), 
    justifyContent: "center", 
    alignItems: "center" 
  },
  modalBox: { 
    backgroundColor: DARK_THEME.modalBackground, 
    borderRadius: 14, 
    padding: 28, 
    width: "85%", 
    alignItems: "center", 
    gap: 12 
  },
  modalTitle: { 
    color: DARK_THEME.primaryText, 
    fontSize: 20, 
    fontWeight: "bold" 
  },
  modalMessage: { 
    color: DARK_THEME.placeholder, 
    fontSize: 15, 
    textAlign: "center",
    lineHeight: 20
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    width: '100%',
    justifyContent: 'center'
  },
  modalBtn: { 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8, 
    backgroundColor: DARK_THEME.primaryText,
    minWidth: 100,
    alignItems: 'center'
  },
  modalBtnText: { 
    color: DARK_THEME.primaryBackground, 
    fontWeight: "bold", 
    fontSize: 15 
  },
  modalSecondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder
  },
  modalSecondaryBtnText: {
    color: DARK_THEME.primaryText,
    fontWeight: "bold",
    fontSize: 15
  }
});