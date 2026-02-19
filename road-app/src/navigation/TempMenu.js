// This screen is temporary so we could work on different screens.
// This will be removed once login page is completed so that we can get to the main screen

import { View, Button, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function TempMenuScreen() {
  const navigation = useNavigation();
  return (
    <>
      <View style={styles.container}>
        <Button
          style={styles.buttons}
          title="Login"
          onPress={() => navigation.navigate("Login")}
        />
        <Button
          style={styles.buttons}
          title="Home/Plan"
          onPress={() => navigation.navigate("Plan")}
        />
        <Button
          style={styles.buttons}
          title="Settings"
          onPress={() => navigation.navigate("Settings")}
        />
        <Button
          style={styles.buttons}
          title="Overview"
          onPress={() => navigation.navigate("Overview")}
        />
        <Button
          style={styles.buttons}
          title="Trips"
          onPress={() => navigation.navigate("Trips")}
        />

        <Text style={{ color: "#fafafa", fontSize: 25 }}>
          This page is temporary. Will be removed once Login is completed
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    gap: 10,
  },
  buttons: {
    marginBottom: 10,
  },
});
