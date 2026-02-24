/*
SelectField Component                       
Reusable component and executes callback function when pressed
Standardized layout, colors, and functionality     

Props:                                             
label (string) - input field label
value (string) - input field value displayed
placeholder (string) - input field placeholder. displayed when value is null
handlePress (function) - callback function. Custom behavior provided by parent component

Author: Bryan Cardeno                               
Date: 02-23-2026 
*/

import { View, Text, StyleSheet, Pressable } from "react-native";
import { DARK_THEME } from "../style/ColorScheme";

function SelectField({ label, value, placeholder, handlePress, labelBgColor }) {
  return (
    <Pressable onPress={handlePress}>
      <View style={styles.inputContainer}>
        <Text
          style={[
            styles.inputLabel,
            {
              backgroundColor: labelBgColor,
            },
          ]}
        >
          {label}
        </Text>

        <View style={styles.textContainer}>
          <Text style={value ? styles.textInput : styles.placeholder}>
            {value || placeholder}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default SelectField;

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
  textContainer: {
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  textInput: {
    color: DARK_THEME.primaryText,
  },
  placeholder: {
    color: DARK_THEME.placeholder,
  },
});
