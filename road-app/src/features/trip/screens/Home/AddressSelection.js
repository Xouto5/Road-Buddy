/*
AddressSelection Component
Used in retrieving starting/destination address information, required to calculate cost/distance.

Author: Bryan Cardeno                               
Date: 02-26-2026 
*/

import {
  View,
  StyleSheet,
  Text,
  Button,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getGoogleAutocomplete,
  completeGoogleAddress,
} from "../../services/googleAPIService";
import { useState } from "react";
import { DARK_THEME } from "../../../../shared/style/ColorScheme";

function AddressSelection({
  setVisibility,
  sessToken,
  setAddress,
  setSessToken,
}) {
  const [places, setPlaces] = useState([]);
  const closeModal = () => {
    setVisibility(false);
  };

  const handleAddressPress = async (item) => {
    await completeGoogleAddress(item.placePrediction.placeId);

    setAddress(item);
    setSessToken(() => Crypto.randomUUID());
    closeModal();
  };

  // TODO: Add a timer, prevents sending request on the 4th letter. Should be sent after a second or 2 not typing.
  const onSearchTextChange = async (text) => {
    try {
      // console.log(e.length);
      if (text.length > 3) {
        const result = await getGoogleAutocomplete(text, sessToken);
        console.log("google place result", result);
        setPlaces(result.suggestions);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderPlaces = ({ item }) => {
    return (
      <Pressable onPress={() => handleAddressPress(item)}>
        <View style={styles.itemContainer}>
          <Text style={styles.itemText}>{item.placePrediction.text.text}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.textInputContainer}>
        <Ionicons name="search" size={20} color={"#fafafa"} />
        <TextInput
          style={styles.textInput}
          placeholder="Enter address"
          placeholderTextColor={DARK_THEME.primaryText}
          onChangeText={onSearchTextChange}
        />
      </View>
      <FlatList
        data={places}
        renderItem={renderPlaces}
        keyExtractor={(item, index) => item.placePrediction.placeId}
        contentContainerStyle={styles.contentContainer}
      ></FlatList>
      <View>
        <Button title="done" onPress={closeModal} />
      </View>
    </View>
  );
}

export default AddressSelection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: DARK_THEME.modalBackground,
    flex: 1,
    gap: 20,
  },
  textInputContainer: {
    backgroundColor: DARK_THEME.primaryBackground,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 8,
    height: 50,
  },
  contentContainer: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 20,
  },
  itemContainer: {
    paddingVertical: 10,
    borderBottomColor: "#475569",
    borderBottomWidth: 1,
    // backgroundColor: "red",
  },
  textInput: {
    color: DARK_THEME.primaryText,
    fontSize: 16,
  },
  itemText: {
    color: "#E2E8F0",
    // height: "100%",
    // backgroundColor: "red",
    // textAlign: "center",
  },
});
