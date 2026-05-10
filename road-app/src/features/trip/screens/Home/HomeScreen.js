/*
HomeScreen Component
Default screen when authenticated.
Prompts user for trip information and displays brief estimate.

Author: Bryan Cardeno
Date: 02-21-2026 
*/

/*
Removed estimate function.
Recent locations are shown when selecting a start location and destination, saved in recentLocationService in services.
Added start trip button which takes you to the overview screen with current locations and vehicle configuration.
Added a save trip button with accompanying modal, which still needs to be hooked up to backend

Author: Joshua Swineford
Date: 04-29-2026
*/

/*
Modified to provide a personalized dashboard experience.
Displays a welcome message and a summary of the most recent trip.
Updated to handle new user welcome popup via AsyncStorage.

Author: Nathan Rochel
Date: 05-09-2026
*/

import { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Image,
  Modal,
  Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth, getUserData } from "../../../../core/firebase/firebaseConfig";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from "firebase/firestore";
import { DARK_THEME } from "../../../../shared/style/ColorScheme";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import polyline from "@mapbox/polyline";

// Helper for modal overlay transparency
const withAlpha = (hexColor, alpha) => {
  const hex = (hexColor || "").replace("#", "");
  if (hex.length !== 6) return hexColor;
  const int = Number.parseInt(hex, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function HomeScreen({ navigation }) {
  const [recentTrip, setRecentTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [welcomeModalVisible, setWelcomeModalVisible] = useState(false);
  
  const user = auth.currentUser;

  // Check for the "New User" flag set during account creation
  useEffect(() => {
    const checkWelcome = async () => {
      const shouldShow = await AsyncStorage.getItem('showWelcomePopup');
      if (shouldShow === 'true') {
        setWelcomeModalVisible(true);
        await AsyncStorage.removeItem('showWelcomePopup');
      }
    };
    checkWelcome();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchName = async () => {
        try {
          const data = await getUserData();
          setFirstName(data?.firstname || user?.email?.split('@')[0] || "Buddy");
        } catch (error) {
          console.error("Error fetching updated name:", error);
          setFirstName("Buddy");
        }
      };
      
      if (user) {
        fetchName();
      }
    }, [user])
  );

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "trips"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setRecentTrip({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setRecentTrip(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const points = recentTrip?.overviewPolyline
    ? polyline.decode(recentTrip.overviewPolyline).map((p) => ({
        latitude: p[0],
        longitude: p[1],
      }))
    : [];

  const getMapRegion = () => {
    if (points.length === 0) return null;
    const midPoint = points[Math.floor(points.length / 2)];
    return {
      latitude: midPoint.latitude,
      longitude: midPoint.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  };

  const handleNewTrip = () => navigation.navigate("Estimate");
  const handleHistoryPress = () => navigation.navigate("Trips");

  const handleRecentTripPress = () => {
    if (!recentTrip) return;

    navigation.navigate("Home", {
      screen: "Overview",
      params: {
        tripId: recentTrip.id, 
        estDetail: {
          distance: parseFloat(recentTrip.distance) || 0,
          duration: parseInt(recentTrip.duration) || 0,
          gasPrice: parseFloat(recentTrip.gasPrice) || 0,
          polylines: {
            encodedPolyline: recentTrip.overviewPolyline || "",
          },
        },
        pointA: {
          placePrediction: {
            text: { text: recentTrip.startLocation || "Unknown Start" },
          },
        },
        pointB: {
          placePrediction: {
            text: { text: recentTrip.destination || "Unknown Destination" },
          },
        },
        car: {
          mpg_combined: parseFloat(recentTrip.mpg) || 25,
          label: recentTrip.vehicle || "Vehicle",
        },
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Image 
              source={require("../../../../../assets/images/RoadBuddyLogoText.png")} 
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
                <Text style={styles.welcomeText}>Hello, {firstName}!</Text>
                <Text style={styles.subtitle}>Ready for your next journey?</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="person-circle-outline" size={42} color={DARK_THEME.primaryText} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActionRow}>
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={handleNewTrip}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#3B82F6' }]}>
              <Ionicons name="add" size={28} color="#FFF" />
            </View>
            <Text style={styles.actionLabel}>New Trip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={handleHistoryPress}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#10B981' }]}>
              <Ionicons name="list" size={24} color="#FFF" />
            </View>
            <Text style={styles.actionLabel}>History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Latest Trip</Text>
          
          {loading ? (
            <ActivityIndicator size="small" color={DARK_THEME.primaryText} style={{ marginTop: 20 }} />
          ) : recentTrip ? (
            <TouchableOpacity 
              style={styles.recentCard}
              activeOpacity={0.9}
              onPress={handleRecentTripPress}
            >
              {points.length > 0 ? (
                <MapView
                  style={styles.miniMap}
                  provider={PROVIDER_GOOGLE}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  region={getMapRegion()} 
                >
                  <Polyline coordinates={points} strokeColor={DARK_THEME.primaryText} strokeWidth={3} />
                </MapView>
              ) : (
                <View style={styles.mapPlaceholder} />
              )}
              
              <View style={styles.cardDetails}>
                <Text style={styles.destText} numberOfLines={1}>{recentTrip.destination}</Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statItem}>{recentTrip.distance} miles</Text>
                  <Text style={styles.statDot}>•</Text>
                  <Text style={styles.statItem}>${recentTrip.totalCost}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="map-outline" size={48} color={DARK_THEME.placeholder} />
              <Text style={styles.emptyText}>You haven't saved any trips yet.</Text>
            </View>
          )}
        </View>

      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={welcomeModalVisible}
        onRequestClose={() => setWelcomeModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setWelcomeModalVisible(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Welcome to RoadBuddy!</Text>
            <Text style={styles.modalMessage}>
              Your account was created successfully. We're excited to help you plan your journeys!
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setWelcomeModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: DARK_THEME.primaryBackground },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 32 
  },
  welcomeContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 50, height: 50 }, 
  welcomeText: { color: DARK_THEME.primaryText, fontSize: 30, fontWeight: "bold" },
  subtitle: { color: DARK_THEME.placeholder, fontSize: 16, marginTop: 2 },
  
  quickActionRow: { flexDirection: "row", gap: 16, marginBottom: 32 },
  actionCard: {
    flex: 1,
    backgroundColor: DARK_THEME.modalBackground,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
  },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { color: DARK_THEME.primaryText, fontWeight: "600", fontSize: 15 },

  recentSection: { flex: 1 },
  sectionTitle: { color: DARK_THEME.primaryText, fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  recentCard: {
    backgroundColor: DARK_THEME.modalBackground,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
  },
  miniMap: { height: 160, width: "100%" },
  mapPlaceholder: { height: 160, backgroundColor: '#2A2A2A' },
  cardDetails: { padding: 16 },
  destText: { color: DARK_THEME.primaryText, fontSize: 18, fontWeight: "bold" },
  statsRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  statItem: { color: DARK_THEME.placeholder, fontSize: 14 },
  statDot: { color: DARK_THEME.placeholder, marginHorizontal: 8 },
  
  emptyCard: { 
    padding: 40, 
    alignItems: "center", 
    justifyContent: 'center',
    borderStyle: "dashed", 
    borderWidth: 1, 
    borderColor: DARK_THEME.primaryBorder, 
    borderRadius: 20 
  },
  emptyText: { color: DARK_THEME.placeholder, textAlign: "center", marginTop: 12, fontSize: 15 },
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
    width: "85%",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    color: DARK_THEME.primaryText,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center"
  },
  modalMessage: {
    color: DARK_THEME.placeholder,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22
  },
  modalCloseButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
    backgroundColor: DARK_THEME.primaryText,
  },
  modalCloseText: {
    color: DARK_THEME.primaryBackground,
    fontWeight: "bold",
    fontSize: 15,
  },
});