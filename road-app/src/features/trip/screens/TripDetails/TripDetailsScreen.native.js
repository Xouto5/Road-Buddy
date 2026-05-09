/*
Trip Detail Screen
Provides map view from point A to point B, including trip details

Author: Bryan Cardeno
Date: 03-12-2026
*/

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView, { Polyline } from "react-native-maps";
import { AntDesign } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import Fontisto from "@expo/vector-icons/Fontisto";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { decode } from "@googlemaps/polyline-codec";

import { calcGasCost } from "../../../../shared/utility/utils";
import { DARK_THEME } from "../../../../shared/style/ColorScheme";

export default function TripDetailsScreen({ route }) {
  const navigation = useNavigation();

  const bottomSheetRef = useRef(null);

  const { tripId = null } = route.params ?? {};

  const [polylines, setPolylines] = useState([]);
  const [estimate, setEstimate] = useState(null);
  const [initRegion, setInitRegion] = useState({
    latitude: 34.18069650767359,
    longitude: -117.32523415647755,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const snapPoints = useMemo(() => ["16%", "45%"], []);

  const handleSheetChanges = useCallback((index) => {
    console.log("Bottom sheet index:", index);
  }, []);

  const openInMaps = async () => {
    if (!polylines || polylines.length === 0) {
      Alert.alert("Route unavailable", "No route is available to open in Maps.");
      return;
    }

    const origin = polylines[0];
    const destination = polylines[polylines.length - 1];

    let url;

    if (Platform.OS === "ios") {
      url = `http://maps.apple.com/?saddr=${origin.latitude},${origin.longitude}&daddr=${destination.latitude},${destination.longitude}&dirflg=d`;
    } else {
      url = `google.navigation:q=${destination.latitude},${destination.longitude}&mode=d`;
    }

    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert("Maps unavailable", "Could not open this route in Maps.");
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.log(error);
      Alert.alert("Maps Error", "Could not open Maps.");
    }
  };

  const constructEstimateObject = () => {
    if (!estimate) return {};

    const {
      startName,
      destinationName,
      gasPrice,
      vehicle,
    } = estimate;

    return {
      startLocation: startName || "",
      destination: destinationName || "",
      vehicle:
        vehicle?.year && vehicle?.make && vehicle?.model
          ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
          : vehicle?.label || "",
      mpg: vehicle?.mpg_combined ? vehicle.mpg_combined.toString() : "",
      gasPrice: gasPrice ? gasPrice.toString() : "",
    };
  };

  useEffect(() => {
    if (!route?.params) return;

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
      destinationName:
        pointB?.placePrediction?.text?.text || "Unknown destination",
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
          <MapView style={styles.map} initialRegion={initRegion}>
            {polylines.length > 0 && (
              <Polyline
                coordinates={polylines}
                strokeColor="red"
                strokeWidth={5}
              />
            )}
          </MapView>

          <View style={styles.tripDetail}>
            <View style={styles.buttonContainer}>
              <Pressable onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="#fafafa" />
              </Pressable>
            </View>

            <View style={styles.info}>
              <View style={styles.textContainer}>
                <Text style={styles.text}>
                  Distance: {estimate?.distance || 0} mi
                </Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.text}>Estimated Cost: ${estimatedCost}</Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.text}>Start: </Text>
                <ScrollView style={styles.scroll} horizontal>
                  <Text style={styles.text}>{estimate?.startName || ""}</Text>
                </ScrollView>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.text}>Destination: </Text>
                <ScrollView style={styles.scroll} horizontal>
                  <Text style={styles.text}>
                    {estimate?.destinationName || ""}
                  </Text>
                </ScrollView>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.text}>
                  Time: {estimate?.duration || 0} min
                </Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                onPress={() =>
                  navigation.navigate("Estimate", constructEstimateObject())
                }
              >
                <Fontisto name="more-v" size={30} color="#fafafa" />
              </Pressable>
            </View>
          </View>

          <View style={styles.utilButtonsContainer}>
            <View style={styles.iconContainer}>
              <Feather name="star" size={30} color="#fafafa" />
            </View>

            <View style={styles.iconContainer}>
              <AntDesign name="car" size={30} color="#fafafa" />
            </View>
          </View>

          <BottomSheet
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            index={1}
            onChange={handleSheetChanges}
            backgroundStyle={styles.bottomSheet}
            handleIndicatorStyle={styles.bottomSheetHandle}
            enablePanDownToClose={false}
          >
            <BottomSheetView style={styles.bottomSheetContent}>
              <Pressable style={styles.btnContainer} onPress={openInMaps}>
                <View style={styles.bottomSheetBtn}>
                  <Text style={styles.calcBtn}>Open in Maps</Text>
                </View>
              </Pressable>

              {/* Only show Save Trip if the trip is not yet saved in database */}
              {!tripId && (
                <Pressable
                  style={styles.btnContainer}
                  onPress={() => console.log("save pressed")}
                >
                  <View style={styles.bottomSheetBtn}>
                    <Text style={styles.calcBtn}>Save Trip</Text>
                  </View>
                </Pressable>
              )}

              <Pressable
                style={styles.btnContainer}
                onPress={() => navigation.navigate("Plan")}
              >
                <View style={styles.bottomSheetBtn}>
                  <Text style={styles.calcBtn}>Add Stop</Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.btnContainer}
                onPress={() => {
                  console.log("discard pressed");
                  navigation.goBack();
                }}
              >
                <View style={styles.bottomSheetBtn}>
                  <Text style={styles.calcBtn}>Discard Trip</Text>
                </View>
              </Pressable>
            </BottomSheetView>
          </BottomSheet>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: DARK_THEME.primaryBackground,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  tripDetail: {
    position: "absolute",
    zIndex: 100,
    elevation: 100,
    backgroundColor: "rgba(125,125,125, 0.9)",
    width: "100%",
    top: 0,
    flexDirection: "row",
    padding: 5,
  },
  buttonContainer: {
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    paddingHorizontal: 10,
  },
  utilButtonsContainer: {
    position: "absolute",
    bottom: "50%",
    right: 10,
    gap: 20,
    zIndex: 50,
    elevation: 50,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 50,
    backgroundColor: "rgba(125,125,125, 0.65)",
  },
  text: {
    color: "#fafafa",
  },
  textContainer: {
    flexDirection: "row",
  },
  scroll: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: "rgba(125,125,125, 0.97)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  bottomSheetHandle: {
    backgroundColor: "#fafafa",
  },
  bottomSheetContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  bottomSheetBtn: {
    height: 48,
    borderWidth: 0,
    backgroundColor: "#e4e4e4",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  btnContainer: {
    width: "100%",
  },
  calcBtn: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});