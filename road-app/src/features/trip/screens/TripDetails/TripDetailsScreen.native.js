import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView, { Polyline } from "react-native-maps";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { decode } from "@googlemaps/polyline-codec";
import { calcGasCost } from "../../../../shared/utility/utils";
import { DARK_THEME } from "../../../../shared/style/ColorScheme";

export default function TripDetailsScreen({ route }) {
  const navigation = useNavigation();
  const bottomSheetRef = useRef(null);

  const { tripId = null, isFromEditMode = false } = route.params ?? {};

  const [polylines, setPolylines] = useState([]);
  const [estimate, setEstimate] = useState(null);
  
  const [initRegion, setInitRegion] = useState({
    latitude: 34.18069650767359,
    longitude: -117.32523415647755,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const snapPoints = useMemo(() => ["4%", "45%"], []);
  const hasTripSelected = polylines.length > 0 && estimate !== null;

  const openInMaps = async () => {
    if (!polylines || polylines.length === 0) return;

    const origin = polylines[0];
    const destination = polylines[polylines.length - 1];

    let url = Platform.OS === "ios" 
      ? `http://maps.apple.com/?saddr=${origin.latitude},${origin.longitude}&daddr=${destination.latitude},${destination.longitude}&dirflg=d`
      : `google.navigation:q=${destination.latitude},${destination.longitude}&mode=d`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Maps Error", "Could not open Maps.");
    }
  };

  useEffect(() => {
    if (!route?.params || !route.params.estDetail) {
      setPolylines([]);
      setEstimate(null);
      return;
    }

    const { estDetail, pointA, pointB, car } = route.params;

    const encodedPolyline =
      estDetail?.polylines?.encodedPolyline ||
      estDetail?.polyline?.encodedPolyline ||
      estDetail?.polylines;

    if (encodedPolyline) {
      try {
        const decoded = decode(encodedPolyline);
        const mappedDecode = decoded.map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));

        if (mappedDecode.length > 0) {
          setPolylines(mappedDecode);
          setInitRegion({
            latitude: mappedDecode[0].latitude,
            longitude: mappedDecode[0].longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          });
        }
      } catch (error) {
        console.log("Polyline decode error:", error);
      }
    }

    setEstimate({
      distance: estDetail?.distance || 0,
      duration: estDetail?.duration || 0,
      startName: pointA?.placePrediction?.text?.text || "Unknown start",
      destinationName: pointB?.placePrediction?.text?.text || "Unknown destination",
      gasPrice: estDetail?.gasPrice || 0,
      vehicle: car || {},
    });
  }, [route?.params]);

  const estimatedCost =
    estimate?.vehicle?.mpg_combined && estimate?.gasPrice
      ? calcGasCost(
          estimate.distance,
          estimate.vehicle.mpg_combined,
          estimate.gasPrice
        )
      : "0.00";

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
        <View style={styles.container}>
          
          <MapView 
            style={styles.map} 
            region={hasTripSelected ? undefined : initRegion}
            initialRegion={hasTripSelected ? initRegion : undefined}
          >
            {hasTripSelected && (
              <Polyline
                coordinates={polylines}
                strokeColor="red"
                strokeWidth={5}
              />
            )}
          </MapView>

          {hasTripSelected && (
            <View style={styles.tripDetail}>
              <View style={styles.info}>
                <View style={styles.metricsRow}>
                  <Text style={styles.text}>{estimate?.distance || 0} mi</Text>
                  <Text style={styles.text}>Cost ${estimatedCost}</Text>
                  <Text style={styles.text}>{estimate?.duration || 0} min</Text>
                </View>

                <View style={styles.addressRow}>
                  <Text style={styles.label}>From: </Text>
                  <ScrollView style={styles.scroll} horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={styles.text}>{estimate?.startName || ""}</Text>
                  </ScrollView>
                </View>

                <View style={styles.addressRow}>
                  <Text style={styles.label}>To: </Text>
                  <ScrollView style={styles.scroll} horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={styles.text}>
                      {estimate?.destinationName || ""}
                    </Text>
                  </ScrollView>
                </View>
              </View>
            </View>
          )}

          <BottomSheet
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            index={1}
            backgroundStyle={styles.bottomSheet}
            handleIndicatorStyle={styles.bottomSheetHandle}
            enablePanDownToClose={false}
          >
            <BottomSheetView style={styles.bottomSheetContent}>
              {hasTripSelected ? (
                <>
                  <TouchableOpacity style={styles.primaryButton} onPress={openInMaps}>
                    <Text style={styles.primaryButtonText}>Open in Maps</Text>
                  </TouchableOpacity>
                  
                  {!tripId && !isFromEditMode && (
                    <TouchableOpacity style={styles.primaryButton} onPress={() => console.log("save pressed")}>
                      <Text style={styles.primaryButtonText}>Save Trip</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate("Home", { screen: "Plan" })}
                  >
                    <Text style={styles.primaryButtonText}>Add Stop</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      setPolylines([]);
                      setEstimate(null);
                    }}
                  >
                    <Text style={styles.primaryButtonText}>Close Trip</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => navigation.navigate("Home", { screen: "Trips" })}
                >
                  <Text style={styles.primaryButtonText}>Select a Trip</Text>
                </TouchableOpacity>
              )}
            </BottomSheetView>
          </BottomSheet>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: DARK_THEME.primaryBackground },
  container: { flex: 1, position: "relative", backgroundColor: DARK_THEME.primaryBackground },
  map: { ...StyleSheet.absoluteFillObject },
  tripDetail: { position: "absolute", zIndex: 100, backgroundColor: DARK_THEME.primaryBackground, borderBottomWidth: 1, borderBottomColor: DARK_THEME.primaryBorder, width: "100%", top: 0, padding: 15 },
  metricsRow: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.1)", paddingBottom: 8, marginBottom: 4 },
  addressRow: { flexDirection: "row", alignItems: "center" },
  label: { color: DARK_THEME.primaryText, fontWeight: "800", fontSize: 13, width: 45 },
  text: { color: DARK_THEME.primaryText, fontWeight: "500", fontSize: 13 },
  scroll: { flex: 1 },
  bottomSheet: { backgroundColor: DARK_THEME.primaryBackground, borderTopWidth: 1, borderTopColor: DARK_THEME.primaryBorder },
  bottomSheetHandle: { backgroundColor: DARK_THEME.primaryText, width: 40 },
  bottomSheetContent: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 10 },
  primaryButton: { backgroundColor: DARK_THEME.primaryText, padding: 16, borderRadius: 10, alignItems: "center", width: "100%" },
  primaryButtonText: { color: DARK_THEME.primaryBackground, fontWeight: "bold", fontSize: 16 },
});