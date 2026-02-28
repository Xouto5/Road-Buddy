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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import getGoogleAutocomplete from "../../services/googleAutocomplete";
import { useState } from "react";
import { DARK_THEME } from "../../../../shared/style/ColorScheme";

const mockAutocompleteResponse = {
  suggestions: [
    {
      placePrediction: {
        placeId: "ChIJVTPokywQkFQRmtVEaUZlJRA",
        text: {
          text: "Seattle, WA, USA",
        },
      },
    },
    {
      placePrediction: {
        placeId: "ChIJP3Sa8ziYEmsRUKgyFmh9AQM",
        text: {
          text: "Sydney NSW, Australia",
        },
      },
    },
    {
      placePrediction: {
        placeId: "ChIJIQBpAG2ahYAR_6128GcTUEo",
        text: {
          text: "San Francisco, CA, USA",
        },
      },
    },
    {
      placePrediction: {
        placeId: "ChIJyWEHuEmuEmsRm9hTkapTCrk",
        text: {
          text: "New York, NY, USA",
        },
      },
    },
  ],
};

function AddressSelection({ setVisibility }) {
  const [places, setPlaces] = useState(mockAutocompleteResponse.suggestions);
  const handleModalVisibility = () => {
    setVisibility(false);
  };

  // TODO: Add a timer, prevents sending request on the 4th letter. Should be sent after a second or 2 not typing.
  const onSearchTextChange = async (text) => {
    try {
      // console.log(e.length);
      if (text.length > 3) {
        const result = await getGoogleAutocomplete(text);
        console.log("google place result", result);
        setPlaces(result.suggestions);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderPlaces = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>{item.placePrediction.text.text}</Text>
      </View>
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
        <Button title="done" onPress={handleModalVisibility} />
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
    // textAlign: "center",
  },
});
