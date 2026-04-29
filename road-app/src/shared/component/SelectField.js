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

Updated to have better spacing for phones
Author: Joshua Swineford
Date: 04-29-2026
*/

import { View, Text, StyleSheet, Pressable, useWindowDimensions } from "react-native";
import { DARK_THEME } from "../style/ColorScheme";

function SelectField({ label, value, placeholder, handlePress, labelBgColor }) {
  const hasValue = typeof value === "string" && value.trim().length > 0;
  const displayText = hasValue ? value : placeholder || "";
  const { width } = useWindowDimensions();
  const topPadding = width < 500 ? 14 : 8;

  return (
    <View style={styles.inputContainer}>
      <Pressable style={styles.pressable} onPress={handlePress}>
        <View style={[styles.labelContainer, { backgroundColor: labelBgColor }]}>
          <Text style={styles.inputLabel}>{label}</Text>
        </View>

        <Text
          numberOfLines={3}
          ellipsizeMode="tail"
          style={hasValue ? styles.textInput : styles.placeholder}
        >
          {displayText}
        </Text>
      </Pressable>
    </View>
  );
}

export default SelectField;

const styles = StyleSheet.create({
  inputContainer: {
    borderColor: DARK_THEME.primaryBorder,
    borderWidth: 1,
    borderRadius: 6,
    minHeight: 56,
    width: "100%",
    position: "relative",
    justifyContent: "center",
  },
  pressable: {
    minHeight: 56,
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  inputLabel: {
    color: DARK_THEME.primaryText,
    fontWeight: "bold",
    fontSize: 18,
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  labelContainer: {
    position: "absolute",
    top: -20,
    left: 10,
    zIndex: 2,
  },
  textInput: {
    color: DARK_THEME.primaryText,
    fontSize: 16,
    lineHeight: 20,
  },
  placeholder: {
    color: DARK_THEME.placeholder,
    fontSize: 16,
    lineHeight: 20,
  },
});
