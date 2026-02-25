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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Safe area handling for notches/status bars
import { DARK_THEME } from "../../../shared/style/ColorScheme"; // Consistent dark theme styling

// Sample trip with mock data
// TODO: Will need to be able to pull data from backend and update this structure accordingly
const sampleTrips = [
  {
    id: "1",
    label: "Trip A",
    expanded: false,
    status: "past",
    details: [
      "Distance: 5 mi",
      "Estimated Cost: $5.00",
      "From: Point A",
      "To: Point B",
      "Time: 5 min",
      "Car: 2016 Honda Civic",
    ],
  },
  {
    id: "2",
    label: "Trip B",
    expanded: false,
    status: "past",
    details: [
      "Distance: 10 mi",
      "Estimated Cost: $10.00",
      "From: Point A",
      "To: Point B",
      "Time: 10 min",
      "Car: 2017 Nissan Versa",
    ],
  },
  {
    id: "3",
    label: "Trip C",
    expanded: false,
    status: "past",
    details: [
      "Distance: 15 mi",
      "Estimated Cost: $15.00",
      "From: Point A",
      "To: Point B",
      "Time: 15 min",
      "Car: 2018 Honda Accord",
    ],
  },
  {
    id: "4",
    label: "Trip A",
    expanded: false,
    status: "upcoming",
    details: [
      "Distance: 20 mi",
      "Estimated Cost: $20.00",
      "From: Point A",
      "To: Point B",
      "Car: 2019 Hyundai Sonata",
    ],
  },
  {
    id: "5",
    label: "Trip B",
    expanded: false,
    status: "upcoming",
    details: [
      "Distance: 25 mi",
      "Estimated Cost: $25.00",
      "From: Point A",
      "To: Point B",
      "Car: 2020 Dodge Charger",
    ],
  },
  {
    id: "6",
    label: "Trip C",
    expanded: false,
    status: "upcoming",
    details: [
      "Distance: 50 mi",
      "Estimated Cost: $50.00",
      "From: Point A",
      "To: Point B",
      "Car: 2021 Toyota Prius",
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
                {/* Trip label/name */}
                <Text style={styles.rowLabel}>{item.label}</Text>

                {/* Chevron indicator - points up when expanded, down when collapsed */}
                <Text style={styles.chevron}>{item.expanded ? "^" : "v"}</Text>
              </Pressable>

              {/* Conditionally render trip details when expanded */}
              {item.expanded && item.details ? (
                <View style={styles.details}>
                  {/* Map through each detail line and display it */}
                  {item.details.map((line, idx) => (
                    <Text key={idx} style={styles.detailText}>
                      {line}
                    </Text>
                  ))}
                </View>
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
export default function TripsSummaryScreen() {
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
    <SafeAreaView style={styles.container}>
      {/* Scrollable container for when content exceeds screen height */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Screen Title */}
        <Text style={styles.title}>Trips</Text>

        {/* Past Trips Section */}
        <TripSection title="Past" items={pastTrips} onToggle={toggleTrip} />

        {/* Upcoming Trips Section */}
        <TripSection
          title="Upcoming"
          items={upcomingTrips}
          onToggle={toggleTrip}
        />
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // Main "Trips" title at the top of the screen
  title: {
    color: DARK_THEME.primaryText,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
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
    paddingVertical: 12,
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
    paddingBottom: 12,
    backgroundColor: DARK_THEME.primaryBackground,
  },

  // Individual detail text lines
  detailText: {
    color: DARK_THEME.primaryText,
    fontSize: 13,
    marginBottom: 2,
  },
});