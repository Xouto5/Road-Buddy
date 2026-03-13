/*
Trip Detail Screen
Provides map view from point A to point B, including trip details

Author: Bryan Cardeno                               
Date: 03-12-2026
*/

import { View, Text, StyleSheet, Button } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { useState, useEffect } from "react";
import { DARK_THEME } from "../../../shared/style/ColorScheme";
import { decode } from "@googlemaps/polyline-codec";

export default function TripDetailsScreen({ route }) {
  const [polylines, setPolylines] = useState([]);

  // CSUSB
  const [initRegion, setInitRegion] = useState({
    latitude: 34.18069650767359,
    longitude: -117.32523415647755,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
    // Delta values are for zoom levels.
    // Need to look into it more
  });

  const runDecode = () => {
    console.log(polylines);

    const mappedDecode = polylines.map((ar) => {
      const latLong = { latitude: ar[0], longitude: ar[1] };

      return latLong;
    });

    setPolylines(mappedDecode);

    console.log(polylines);
  };

  useEffect(() => {
    const decoded = decode(route.params.polyline.encodedPolyline);

    // const mappedDecode = decoded.map((ar) => {
    //   const latLong = ar.map((loc) => ({ lat: loc[0], long: loc[1] }));

    //   return latLong;
    // });

    const mappedDecode = decoded.map((ar) => {
      const latLong = { latitude: ar[0], longitude: ar[1] };

      return latLong;
    });

    setPolylines(mappedDecode);
  }, [route.params.polyline.encodedPolyline]);

  return (
    <View style={styles.container}>
      <View style={styles.tripDetail}>
        <View style={styles.button}>
          <Text>back</Text>
        </View>
        <View style={styles.info}>
          <Text>Distance: 50 mi</Text>
          <Text>Estimated Cost: $50.00</Text>
          <Text>Start: Point A</Text>
          <Text>Destination: Point B</Text>
          <Text>Time: 40 min</Text>
        </View>
        <View style={styles.button}>
          <Button title="click me" onPress={runDecode} />
          <Text>more</Text>
        </View>
      </View>
      <MapView style={styles.map} initialRegion={initRegion}>
        {polylines && <Polyline coordinates={polylines} strokeColor="red" />}
      </MapView>
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
  button: {
    backgroundColor: "green",
  },
  info: {
    backgroundColor: "red",
    flex: 1,
  },
});
