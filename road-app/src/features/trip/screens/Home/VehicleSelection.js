import {
  View,
  Button,
  StyleSheet,
  FlatList,
  Text,
  Pressable,
} from "react-native";
import SelectField from "../../../../shared/component/SelectField";
import { DARK_THEME } from "../../../../shared/style/ColorScheme";
import sampleCarData from "../../../../shared/sample-data/CarData";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

function VehicleSelection({ setVisibility, onVehicleSelect }) {
  const { carData, userSavedCarId } = sampleCarData; // mock data
  const vehicleList = carData
    .filter((car) => userSavedCarId.indexOf(Number(car.id)) > -1)
    .map((car) => ({ ...car, selected: false }));

  const [savedVehicle, setSavedVehicle] = useState(vehicleList);
  const [selectedVehicle, setSelectedVehicle] = useState({});

  const onItemPress = (id) => {
    console.log("item  is pressed", id);
    setSavedVehicle((vehicles) => {
      const newVehicles = vehicles.map((car) => {
        if (car.id == id) setSelectedVehicle(car);

        return {
          ...car,
          selected: car.id == id,
        };
      });

      newVehicles.forEach((car) => console.log(car));
      return newVehicles;
    });
  };

  const renderListItems = ({ item }) => {
    return (
      <Pressable
        onPress={() => onItemPress(item.id)}
        style={({ pressed }) => pressed && { opacity: 0.5 }}
      >
        <View style={styles.itemContainer}>
          <Text style={styles.itemText}>
            {`${item.year}  ${item.make}  ${item.model}`}
          </Text>

          {item.selected && (
            <Ionicons name="checkmark-circle" size={20} color={"#16a34a"} />
          )}
        </View>
      </Pressable>
    );
  };

  const handleModalVisibility = () => {
    onVehicleSelect(selectedVehicle);
    setVisibility(false);
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={savedVehicle}
        renderItem={renderListItems}
        keyExtractor={(item, index) => item.id}
        contentContainerStyle={styles.contentContainer}
      ></FlatList>
      <View>
        <Button title="done" onPress={handleModalVisibility} />
      </View>
    </View>
  );
}

export default VehicleSelection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.modalBackground,
    padding: 20,
    padding: 20,
  },
  forms: {
    flex: 1,
    gap: 20,
  },
  itemContainer: {
    backgroundColor: DARK_THEME.modalBackground,
    borderRadius: 8,
    height: 40,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 20,
    paddingRight: 30,
  },
  contentContainer: {
    flex: 1,
    gap: 20,
    width: "100%",
    backgroundColor: DARK_THEME.primaryBackground,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  itemText: {
    fontSize: 16,
    color: "#E2E8F0",
  },
});
