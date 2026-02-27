import { View, StyleSheet, Text, Button, TextInput } from "react-native";
import API_KEY from "../../services/googleAutocomplete";

import getGoogleAutocomplete from "../../services/googleAutocomplete";

function AddressSelection({ setVisibility }) {
  const handleModalVisibility = () => {
    setVisibility(false);
  };

  console.log(getGoogleAutocomplete());

  return (
    <View style={styles.container}>
      <TextInput style={styles.textInput} placeholder="Enter address" />
      <Text>test</Text>
      <View>
        <Button title="done" onPress={handleModalVisibility} />
      </View>
    </View>
  );
}

export default AddressSelection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    flex: 1,
  },
  textInput: {
    backgroundColor: "#fafafa",
  },
});
