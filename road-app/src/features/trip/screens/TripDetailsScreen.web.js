/*
Trip Detail Screen
Provides map view from point A to point B, including trip details

Author: Bryan Cardeno                               
Date: 03-12-2026
*/

import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { useState, useEffect } from "react";
import { DARK_THEME } from "../../../shared/style/ColorScheme";
import { decode } from "@googlemaps/polyline-codec";
import { AntDesign } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useNavigation } from "@react-navigation/native";

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

  // let MapView, Polyline;

  // if (Platform.OS !== "web") {
  //   const Maps = require("react-native-maps");
  //   MapView = Maps.default;
  //   Polyline = Maps.Polyline;
  // }

  // used for debugging
  // const runDecode = () => {
  //   console.log(polylines);

  //   const mappedDecode = polylines.map((ar) => {
  //     const latLong = { latitude: ar[0], longitude: ar[1] };

  //     return latLong;
  //   });

  //   setPolylines(mappedDecode);

  //   console.log(polylines);
  // };

  useEffect(() => {
    const decoded = decode(route.params.estDetail.polylines.encodedPolyline);

    const mappedDecode = decoded.map((ar) => {
      const latLong = { latitude: ar[0], longitude: ar[1] };

      return latLong;
    });

    setPolylines(mappedDecode);

    // TODO: CREATE STATE IN HOMESCREEN
    // const {distance: dis, duration: dur, gasPrice: gas} = route.params.estDetail;
    // setEstimate({
    //   distance: dis,
    //   duration: dur,
    //   cost: (
    //                   (dis/ vehicle.mpg_combined) *
    //                   estimate.gasPrice
    //                 ).toFixed(2)
    // })
  }, [route.params.estDetail]);

  return (
    <View style={styles.container}>
      <View style={styles.tripDetail}>
        <View style={styles.buttonContainer}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color="#fafafa" />
          </Pressable>
        </View>
        <View style={styles.info}>
          <Text style={styles.text}>Distance: {} mi</Text>
          <Text style={styles.text}>Estimated Cost: $50.00</Text>
          <Text style={styles.text}>Start: Point A</Text>
          <Text style={styles.text}>Destination: Point B</Text>
          <Text style={styles.text}>Time: 40 min</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Fontisto name="more-v" size={30} color="#fafafa" />
        </View>
      </View>
      {/* {Platform.OS !== "web" && (
        <MapView style={styles.map} initialRegion={initRegion}>
          {polylines && (
            <Polyline
              coordinates={polylines}
              strokeColor="red"
              strokeWidth={5}
            />
          )}
        </MapView>
      )} */}

      <View style={styles.utilButtonsContainer}>
        <View style={styles.iconContainer}>
          <Feather name="star" size={30} color="#fafafa" />
        </View>

        <View style={styles.iconContainer}>
          <AntDesign name="car" size={30} color="#fafafa" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    width: "100%",
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
    backgroundColor: "rgba(125,125,125, 0.9)",
    padding: 6,
    borderRadius: 50,
  },
  text: {
    color: "#fafafa",
  },
});
