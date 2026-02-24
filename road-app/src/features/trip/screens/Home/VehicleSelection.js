import { View, Button, StyleSheet } from "react-native";
import SelectField from "../../../../shared/component/SelectField";
import { DARK_THEME } from "../../../../shared/style/ColorScheme";

function VehicleSelection({ setVisibility, bgColor }) {
  const handleModalVisibility = () => setVisibility(false);

  console.log(DARK_THEME);
  return (
    <View style={styles.container}>
      <View style={styles.forms}>
        <SelectField
          label="Year"
          placeholder="Select year"
          labelBgColor={DARK_THEME.modalBackground}
        />
        <SelectField
          label="Make"
          placeholder="Select make"
          labelBgColor={DARK_THEME.modalBackground}
        />
        <SelectField
          label="Model"
          placeholder="Select model"
          labelBgColor={DARK_THEME.modalBackground}
        />
      </View>
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
  },
  forms: {
    flex: 1,
    gap: 20,
  },
});
