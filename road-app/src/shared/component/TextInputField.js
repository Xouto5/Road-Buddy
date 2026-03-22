/*
TextInputField Component                           
Reusable container for TextInput                     
Standardized layout, colors, and functionality     

Props:                                             
label (string) - input field label            
placeholder (string) - input field placeholder 
handleInputChange (function) - callback function on text change. Receives updated value.

Author: Bryan Cardeno                               
Date: 02-23-2026 
*/

import { View, Text, TextInput, StyleSheet } from "react-native";
import { DARK_THEME } from "../style/ColorScheme";

function TextInputField({ label, placeholder, handleInputChange }) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.inputText}
        placeholder={placeholder}
        placeholderTextColor={DARK_THEME.placeholder}
        onChangeText={handleInputChange}
      />
    </View>
  );
}

export default TextInputField;

const styles = StyleSheet.create({
  inputContainer: {
    borderColor: DARK_THEME.primaryBorder,
    borderWidth: 1,
    borderRadius: 6,
    height: 50,
    justifyContent: "center",
    flexShrink: 1,
  },
  inputLabel: {
    color: DARK_THEME.primaryText,
    backgroundColor: DARK_THEME.primaryBackground,
    position: "absolute",
    top: -20,
    left: 10,
    fontWeight: "bold",
    fontSize: 18,
    paddingVertical: 5,
    paddingHorizontal: 3,
  },
  inputText: {
    color: DARK_THEME.primaryText,
    paddingHorizontal: 15,
  },
});
