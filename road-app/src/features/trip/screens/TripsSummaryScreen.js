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

// Import necessary React hooks and React Native components
import { useState, useEffect } from "react"; 
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Pressable, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../../../core/firebase/firebaseConfig";
import { collection, query, where, onSnapshot, doc, deleteDoc, orderBy } from "firebase/firestore";
import { DARK_THEME } from "../../../shared/style/ColorScheme";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import polyline from "@mapbox/polyline"; 

function TripSection({ title, items, onToggle, onDelete, onEdit }) {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          //Determine which date to show
          const displayDate = item.updatedAt?.toDate 
            ? `Last Edited: ${item.updatedAt.toDate().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
            : item.createdAt?.toDate 
            ? `Created: ${item.createdAt.toDate().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}` 
            : "Recent";

          //Decode polyline for the map
          const points = item.overviewPolyline 
            ? polyline.decode(item.overviewPolyline).map(p => ({ latitude: p[0], longitude: p[1] }))
            : [];

          return (
            <View key={item.id}>
              <View style={styles.rowWrapper}>
                <Pressable style={styles.row} onPress={() => onToggle(item.id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel} numberOfLines={1}>{item.destination || "Unnamed Trip"}</Text>
                    <Text style={styles.rowSubLabel}>{displayDate}</Text>
                  </View>
                  <Ionicons 
                    name={item.expanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={DARK_THEME.primaryText} 
                    style={{ marginHorizontal: 10 }}
                  />
                </Pressable>
                
                <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(item)}>
                  <Ionicons name="create-outline" size={20} color={DARK_THEME.primaryText} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {item.expanded && (
                <View style={styles.expandedContent}>
                  {}
                  {points.length > 0 ? (
                    <MapView
                      style={styles.mapPreview}
                      provider={PROVIDER_GOOGLE}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      pitchEnabled={false}
                      rotateEnabled={false}
                      initialRegion={{
                        latitude: points[Math.floor(points.length / 2)].latitude,
                        longitude: points[Math.floor(points.length / 2)].longitude,
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
                  ) : (
                    <View style={styles.mapPlaceholder}>
                      <Text style={styles.detailText}>No route data available</Text>
                    </View>
                  )}

                  <View style={styles.details}>
                    <Text style={styles.detailText}>From: {item.startLocation}</Text>
                    <Text style={styles.detailText}>Distance: {item.distance} mi</Text>
                    <Text style={styles.detailText}>Fuel Cost: ${item.totalCost}</Text>
                    <Text style={styles.detailText}>Vehicle: {item.vehicle} ({item.mpg} MPG)</Text>
                  </View>
                </View>
              )}
              {!isLast && <View style={styles.divider} />}
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

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "trips"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tripsData = [];
      querySnapshot.forEach((doc) => {
        tripsData.push({ id: doc.id, ...doc.data(), expanded: false });
      });
      setTrips(tripsData);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Sync Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleTrip = (id) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, expanded: !t.expanded } : t));
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
      distance: trip.distance
    });
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Trip", "Are you sure you want to discard this trip?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "trips", id));
          } catch (e) {
            Alert.alert("Error", "Could not delete trip.");
          }
        } 
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, {justifyContent: 'center'}]}>
        <ActivityIndicator size="large" color={DARK_THEME.primaryText} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.titleHeaderContainer}>
            <Text style={styles.mainTitle}>Trip History</Text>
            <Text style={styles.mainSubtitle}>View and manage your saved trips.</Text>
          </View>

          <TripSection 
            title="Your Saved Trips" 
            items={trips} 
            onToggle={toggleTrip} 
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          
          {trips.length === 0 && (
            <Text style={styles.emptyText}>No saved trips yet. Start planning!</Text>
          )}
        </ScrollView>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
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

  card: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 12,
    overflow: "hidden",
  },

  divider: {
    height: 1,
    backgroundColor: DARK_THEME.primaryBorder,
  },

  //Expanded Container Styles
  expandedContent: {
    backgroundColor: DARK_THEME.primaryBackground,
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
    justifyContent: 'center',
    alignItems: 'center',
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

  emptyText: {
    color: DARK_THEME.placeholder,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },

  safeArea: {
    flex: 1,
  },

});
