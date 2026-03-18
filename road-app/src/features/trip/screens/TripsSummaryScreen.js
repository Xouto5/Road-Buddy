/*
Trip Summary Screen Component
Displays past and upcoming trips in an organized, expandable list format.
Users can tap on each trip to view or hide detailed information.

Author: Brian Siebert
Date: 02-24-2026
*/

// Import necessary React hooks and React Native components
import { useState } from "react"; // State management for expandable trips
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { DARK_THEME } from "../../../shared/style/ColorScheme"; // Consistent dark theme styling

// Sample trip with mock data
// TODO: Will need to be able to pull data from backend and update this structure accordingly
const sampleTrips = [
  {
    id: "1",
    label: "Trip A",
    date: "Feb 13, 2026",
    expanded: false,
    status: "past",
    details: [
      "Destination: Los Angeles, CA",
      "Total Fuel Cost: $12.40",
      "Total Distance: 62 mi",
    ],
  },
  {
    id: "2",
    label: "Trip B",
    date: "Jan 16, 2026",
    expanded: false,
    status: "past",
    details: [
      "Destination: San Diego, CA",
      "Total Fuel Cost: $22.60",
      "Total Distance: 113 mi",
    ],
  },
  {
    id: "3",
    label: "Trip C",
    date: "Dec 19, 2025",
    expanded: false,
    status: "past",
    details: [
      "Destination: San Jose, CA",
      "Total Fuel Cost: $78.20",
      "Total Distance: 391 mi",
    ],
  },
  {
    id: "4",
    label: "Trip A",
    date: "Apr 10, 2026",
    expanded: false,
    status: "upcoming",
    details: [
      "Destination: San Francisco, CA",
      "Total Fuel Cost: $86.60",
      "Total Distance: 433 mi",
    ],
  },
  {
    id: "5",
    label: "Trip B",
    date: "May 15, 2026",
    expanded: false,
    status: "upcoming",
    details: [
      "Destination: Fresno, CA",
      "Total Fuel Cost: $53.20",
      "Total Distance: 266 mi",
    ],
  },
  {
    id: "6",
    label: "Trip C",
    date: "Jun 12, 2026",
    expanded: false,
    status: "upcoming",
    details: [
      "Destination: Sacramento, CA",
      "Total Fuel Cost: $87.00",
      "Total Distance: 435 mi",
    ],
  },
];

// Expandable Trip Section Component
function TripSection({ title, items, onToggle }) {
  // Don't render section if there are no items
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      {/* Section Header (e.g., "Past", "Upcoming") */}
      <Text style={styles.sectionTitle}>{title}</Text>

      {/* Card container with border - holds all trip items */}
      <View style={styles.card}>
        {items.map((item, index) => {
          // Check if this is the last item to conditionally render divider
          const isLast = index === items.length - 1;

          return (
            <View key={item.id}>
              {/* Pressable row - tapping toggles expand/collapse */}
              <Pressable
                style={styles.row}
                onPress={() => onToggle(item.id)}
              >
                {/* Display trip date as the primary row label */}
                <View>
                  <Text style={styles.rowLabel}>{item.date || "Date TBD"}</Text>
                </View>

                {/* Chevron indicator - points up when expanded, down when collapsed */}
                <Text style={styles.chevron}>{item.expanded ? "^" : "v"}</Text>
              </Pressable>

              {/* Conditionally render map preview + trip details when expanded */}
              {item.expanded ? (
                <>
                  <View style={styles.mapPreview}>
                    <Text style={styles.mapPreviewTitle}>Mini Map Preview</Text>
                  </View>

                  {item.details ? (
                    <View style={styles.details}>
                      {/* Map through each detail line and display it */}
                      {item.details.map((line, idx) => (
                        <Text key={idx} style={styles.detailText}>
                          {line}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </>
              ) : null}

              {/* Divider line between trips (not shown after last item) */}
              {!isLast ? <View style={styles.divider} /> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Main Trips Summary Screen Component
export default function TripsSummaryScreen({ navigation }) {
  const [trips, setTrips] = useState(sampleTrips);

// Toggle function to expand/collapse trip details
  const toggleTrip = (id) => {
    setTrips((currentTrips) =>
      currentTrips.map((trip) =>
        trip.id === id ? { ...trip, expanded: !trip.expanded } : trip
      )
    );
  };

  // Filter trips into past and upcoming categories
  const pastTrips = trips.filter((trip) => trip.status === "past");
  const upcomingTrips = trips.filter((trip) => trip.status === "upcoming");

  return (
    <View style={styles.container}>
      {/* Back arrow - sits above scroll content at top of screen */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>{"<"}</Text>
      </TouchableOpacity>

      {/* Scrollable container for when content exceeds screen height */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header bar with icon + screen title */}
        <View style={styles.header}>
          <View style={styles.headerIconCell}>
            <Ionicons name="briefcase-outline" size={18} color={DARK_THEME.primaryText} />
          </View>
          <Text style={styles.headerTitle}>Trip History</Text>
        </View>

        {/* Past Trips Section */}
        <TripSection title="Past" items={pastTrips} onToggle={toggleTrip} />

        {/* Upcoming Trips Section */}
        <TripSection
          title="Upcoming"
          items={upcomingTrips}
          onToggle={toggleTrip}
        />
      </ScrollView>
    </View>
  );
}

// Styles for the Trips Summary Screen components
const styles = StyleSheet.create({
  // Main container - fills the screen with dark background
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.primaryBackground,
  },

  // ScrollView content padding and spacing
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
  },

  // Top-left back arrow, matching Create Account screen
  backButton: {
    marginTop: 10,
    marginLeft: 18,
    marginBottom: 4,
    alignSelf: "flex-start",
  },

  backText: {
    color: DARK_THEME.primaryText,
    fontSize: 28,
    fontWeight: "bold",
  },

  // Top header card matching Create Account screen pattern
  header: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 8,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DARK_THEME.primaryBackground,
  },

  // Left icon cell in the header
  headerIconCell: {
    width: 46,
    height: "100%",
    borderRightWidth: 1,
    borderRightColor: DARK_THEME.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  // Header title text
  headerTitle: {
    marginLeft: 16,
    color: DARK_THEME.primaryText,
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Container for each section (Past/Upcoming)
  section: {
    marginBottom: 24,
  },

  // Section header text ("Past" or "Upcoming")
  sectionTitle: {
    color: DARK_THEME.primaryText,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  // Card container that holds all trip items in a section
  card: {
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 12,
    overflow: "hidden", // Ensures content respects border radius
  },

  // Individual trip row (clickable area)
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },

  // Trip name/label text
  rowLabel: {
    color: DARK_THEME.primaryText,
    fontSize: 16,
    fontWeight: "600",
  },

  // Chevron icon (^/v indicator)
  chevron: {
    color: DARK_THEME.primaryText,
    fontSize: 16,
    fontWeight: "700",
  },

  // Horizontal divider between trip items
  divider: {
    height: 1,
    backgroundColor: DARK_THEME.primaryBorder,
  },

  // Container for expanded trip details
  details: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: DARK_THEME.primaryBackground,
  },

  // Mini map placeholder block shown on each card
  mapPreview: {
    marginHorizontal: 14,
    marginBottom: 8,
    minHeight: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    backgroundColor: DARK_THEME.previewOverlay,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  mapPreviewTitle: {
    color: DARK_THEME.primaryText,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },

  mapPreviewSubtitle: {
    color: DARK_THEME.primaryText,
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: DARK_THEME.primaryBackground,
    borderWidth: 1,
    borderColor: DARK_THEME.primaryBorder,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  // Individual detail text lines
  detailText: {
    color: DARK_THEME.primaryText,
    fontSize: 13,
    marginBottom: 2,
  },
});