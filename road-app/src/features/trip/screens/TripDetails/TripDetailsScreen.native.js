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
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const [polylines, setPolylines] = useState([]);
  const [estimate, setEstimate] = useState("");

  // CSUSB
  const [initRegion, setInitRegion] = useState({
    latitude: 34.18069650767359,
    longitude: -117.32523415647755,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
    // Delta values are for zoom levels.
    // Need to look into it more
  });

  const openInMaps = () => {
    if (polylines.length === 0) return;

    const origin = { ...polylines[0] };
    const destination = { ...polylines[polylines.length - 1] };

    let url;

    if (Platform.OS === "ios") {
      url = `http://maps.apple.com/?saddr=${originLatLng.latitude},${originLatLng.longitude}&daddr=${destLatLng.latitude},${destLatLng.longitude}&dirflg=d`;
    } else {
      url = `google.navigation:q=${destination.latitude},${destination.longitude}&mode=d`;
    }

    Linking.openURL(url);
  };

  const bottomSheetRef = useRef(null);

  const handleSheetChanges = useCallback((index) => {}, []);

  const constructEstimateObject = () => {
    const {
      distance,
      duration,
      startName,
      destinationName,
      gasPrice,
      vehicle,
    } = estimate;

    return {
      startLocation: startName,
      destination: destinationName,
      vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      mpg: vehicle.mpg_combined.toString(),
      gasPrice: gasPrice.toString(),
    };
  };

  useEffect(() => {
    if (!route.params) return;

    const { estDetail, pointA, pointB, car } = route.params;

    const decoded = decode(
      route?.params?.estDetail?.polylines?.encodedPolyline,
    );

    const mappedDecode = decoded.map((ar) => {
      const latLong = { latitude: ar[0], longitude: ar[1] };

      return latLong;
    });

    if (decoded) {
      setPolylines(mappedDecode);
    }

    setEstimate(() => ({
      distance: estDetail.distance,
      duration: estDetail.duration,
      startName: pointA.placePrediction.text.text,
      destinationName: pointB.placePrediction.text.text,
      gasPrice: estDetail.gasPrice,
      vehicle: car,
    }));
  }, [route.params]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
      <View style={styles.container}>
        <View style={styles.tripDetail}>
          <View style={styles.buttonContainer}>
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={30} color="#fafafa" />
            </Pressable>
          </View>

          <View style={styles.info}>
            <View style={styles.textContainer}>
              <Text style={styles.text}>Distance: {estimate?.distance} mi</Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.text}>
                Estimated Cost: $
                {estimate &&
                  calcGasCost(
                    estimate.distance,
                    estimate.vehicle.mpg_combined,
                    estimate.gasPrice,
                  )}
              </Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.text}>Start: </Text>
              <ScrollView style={styles.scroll} horizontal>
                <Text style={styles.text}>{estimate?.startName}</Text>
              </ScrollView>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.text}>Destination: </Text>
              <ScrollView style={styles.scroll} horizontal>
                <Text style={styles.text}>{estimate?.destinationName}</Text>
              </ScrollView>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.text}>Time: {estimate?.duration} min</Text>
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

        <MapView style={styles.map} initialRegion={initRegion}>
          {polylines && (
            <Polyline
              coordinates={polylines}
              strokeColor="red"
              strokeWidth={5}
            />
          )}
        </MapView>

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
          snapPoints={["4%", "40%"]}
          index={0}
          backgroundStyle={styles.bottomSheet}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            <Pressable style={styles.btnContainer} onPress={openInMaps}>
              <View style={styles.bottomSheetBtn}>
                <Text style={styles.calcBtn}>Open in Maps</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.btnContainer}
              onPress={() => console.log("save pressed")}
            >
              <View style={styles.bottomSheetBtn}>
                <Text style={styles.calcBtn}>Save Trip</Text>
              </View>
            </Pressable>
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
              onPress={() => console.log("discard pressed")}
            >
              <View style={styles.bottomSheetBtn}>
                <Text style={styles.calcBtn}>Discard Trip</Text>
              </View>
            </Pressable>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    // ...StyleSheet.absoluteFillObject,
    height: "100%",
  },
  tripDetail: {
    position: "absolute",
    zIndex: 100,
    backgroundColor: "rgba(125,125,125, 0.9)",
    width: "100%",
    top: 0,
    flex: 1,
    flexDirection: "row",
    padding: 5,
    // borderBottomLeftRadius: 40,
    // borderBottomRightRadius: 16,
    // borderRadius: 50,
    // marginHorizontal: "3%",
    // boxSizing: "border-box",
    // marginTop: 10,
  },
  buttonContainer: {
    // backgroundColor: "green",
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    // backgroundColor: "red",
    flex: 1,
    paddingHorizontal: 10,
  },
  utilButtonsContainer: {
    // backgroundColor: "red",
    position: "absolute",
    bottom: "50%",
    right: 10,
    gap: 20,
  },
  iconContainer: {
    // backgroundColor: "rgba(125,125,125, 0.9)",
    padding: 6,
    borderRadius: 50,
  },
  text: {
    color: "#fafafa",
  },
  safeArea: {
    flex: 1,
  },
  textContainer: {
    flexDirection: "row",
  },
  bottomSheetContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  bottomSheet: {
    backgroundColor: "rgba(125,125,125, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  bottomSheetBtn: {
    height: 50,
    borderWidth: 0,
    backgroundColor: "#e4e4e4",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  btnContainer: {
    // backgroundColor: "red",
    width: "100%",
  },
});
