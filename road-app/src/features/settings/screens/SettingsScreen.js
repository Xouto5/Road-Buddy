//Josh - I have created a first draft of the User Settings screen which includes:
//Text boxes that show your current username, first name, last name, phone number, and email
//There is a popup window that allows you to add, edit, or delete your saved cars and their MPG
//There is a pencil icon that you can click on to edit your account details, these changes aren't saved until you press save
//If there are unsaved changes on attempted logout, there is a popup warning to save or discard changes, or cancel

//FOR BACKEND:
//Items to pull: username, password,, list of cars, phone number, email
//Line 54: saved car data
//Line 105: Save button functionality
//Line 126: Logout button functionality
//Lines 139, 154, 161: Replace console.log with onLogout()

import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { logOut } from "../../auth/services/authServices";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const inputRef = useRef(null);

  // Saved values
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Draft values
  const [usernameDraft, setUsernameDraft] = useState(username);
  const [firstNameDraft, setFirstNameDraft] = useState(firstName);
  const [lastNameDraft, setLastNameDraft] = useState(lastName);
  const [phoneDraft, setPhoneDraft] = useState(phone);
  const [emailDraft, setEmailDraft] = useState(email);

  useEffect(() => setUsernameDraft(username), [username]);
  useEffect(() => setFirstNameDraft(firstName), [firstName]);
  useEffect(() => setLastNameDraft(lastName), [lastName]);
  useEffect(() => setPhoneDraft(phone), [phone]);
  useEffect(() => setEmailDraft(email), [email]);

  // Car data
  const [carOptions, setCarOptions] = useState([
    { name: "Tesla", mpg: "120" },
    { name: "Honda", mpg: "32" },
    { name: "Ford", mpg: "25" },
  ]);
  const [selectedCar, setSelectedCar] = useState(null);

  // Car modal state
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [newCarNameDraft, setNewCarNameDraft] = useState("");
  const [newCarMpgDraft, setNewCarMpgDraft] = useState("");
  const [editingCar, setEditingCar] = useState(null);

  // Delete car modal state
  const [deleteCarModalOpen, setDeleteCarModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);

  // Allow only one field to be edited at a time
  const [editingKey, setEditingKey] = useState(null);
  const isEditingAny = editingKey !== null;

  const hasUnsavedChanges =
    usernameDraft !== username ||
    firstNameDraft !== firstName ||
    lastNameDraft !== lastName ||
    phoneDraft !== phone ||
    emailDraft !== email;

  const startEditing = (key) => {
    if (editingKey && editingKey !== key) return;
    setEditingKey(key);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const stopEditing = () => {
    setEditingKey(null);
  };

  const cancelEditing = (key) => {
    if (key === "username") setUsernameDraft(username);
    else if (key === "firstName") setFirstNameDraft(firstName);
    else if (key === "lastName") setLastNameDraft(lastName);
    else if (key === "phone") setPhoneDraft(phone);
    else if (key === "email") setEmailDraft(email);

    inputRef.current?.blur?.();
    setEditingKey(null);
  };

  const onSaveChanges = async () => { // TODO: Backend implement Save Button functionality
    inputRef.current?.blur?.();
    setEditingKey(null);

    setUsername(usernameDraft.trim());
    setFirstName(firstNameDraft.trim());
    setLastName(lastNameDraft.trim());
    setPhone(phoneDraft.trim());
    setEmail(emailDraft.trim());
  };

  const discardDraftChanges = () => {
    setUsernameDraft(username);
    setFirstNameDraft(firstName);
    setLastNameDraft(lastName);
    setPhoneDraft(phone);
    setEmailDraft(email);
    setEditingKey(null);
    inputRef.current?.blur?.();
  };

  const onLogout = () => { // TODO: Backend implement Logout functionality
    if (!hasUnsavedChanges) {
      logOut();
      navigation.navigate("Login")
      return;
    }

    if (Platform.OS === "web") {
      const shouldSave = window.confirm(
        "You have unsaved changes.\n\nPress OK to save before logout, or Cancel to stay on the page."
      );

      if (shouldSave) {
        onSaveChanges();
        console.log("logout"); //TODO: replace with onLogout
        navigation.navigate("Login")
      }
      return;
    }

    Alert.alert(
      "Unsaved changes",
      "You have unsaved changes. What would you like to do?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            discardDraftChanges();
            console.log("logout"); //TODO: replace with onLogout
            navigation.navigate("Login")
          },
        },
        {
          text: "Save",
          onPress: async () => {
            await onSaveChanges();
            console.log("logout"); //TODO: replace with onLogout
            navigation.navigate("Login")
          },
        },
      ]
    );
  };

  const resetCarDrafts = () => {
    setNewCarNameDraft("");
    setNewCarMpgDraft("");
  };

  const openCarModal = () => {
    if (isEditingAny) return;
    setCarModalOpen(true);
    setIsAddingCar(false);
    resetCarDrafts();
  };

  const saveCarDetails = () => {
    const cleanedName = newCarNameDraft.trim();
    const cleanedMpg = newCarMpgDraft.trim();

    if (!cleanedName || !cleanedMpg) return;

    const updatedCar = {
      name: cleanedName,
      mpg: cleanedMpg,
    };

    if (editingCar) {
      const updatedCars = carOptions.map((car) =>
      car.name === editingCar.name ? updatedCar : car
      );

      setCarOptions(updatedCars);

      if (selectedCar?.name === editingCar.name) {
        setSelectedCar(updatedCar);
      }
      } else {
      setCarOptions((prev) => [...prev, updatedCar]);
      setSelectedCar(updatedCar);
      setCarModalOpen(false);
    }

    setEditingCar(null);
    setIsAddingCar(false);
    resetCarDrafts();
  };

  const confirmDeleteCar = (car) => {
    setCarToDelete(car);
    setDeleteCarModalOpen(true);
  };

  const deleteCar = () => {
    if (!carToDelete) return;

    setCarOptions((prev) =>
      prev.filter((car) => car.name !== carToDelete.name)
    );

    if (selectedCar?.name === carToDelete.name) {
      setSelectedCar(null);
    }

    setDeleteCarModalOpen(false);
    setCarToDelete(null);
    setIsAddingCar(false);
    resetCarDrafts();
  };

  const renderCarDropdownRow = () => {
    const lockThisRow = isEditingAny;

    return (
      <>
        <Pressable
          onPress={openCarModal}
          style={[styles.fieldRow, lockThisRow && styles.lockedRow]}
          disabled={lockThisRow}
        >
          <Text
            style={[
              styles.fieldText,
              !selectedCar && styles.placeholderText,
            ]}
            numberOfLines={1}
          >
            {selectedCar
              ? `${selectedCar.name} (${selectedCar.mpg} MPG)`
              : "Car List"}
          </Text>

          <Text style={styles.chevron}>▾</Text>
        </Pressable>

        <Modal
          visible={carModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCarModalOpen(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setCarModalOpen(false)}
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Select a car</Text>

              {carOptions.map((car) => (
                <View key={car.name} style={styles.modalItemRow}>
                  <Pressable
                    style={styles.modalItemMain}
                    onPress={() => {
                      setSelectedCar(car);
                      setCarModalOpen(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>
                      {car.name} ({car.mpg} MPG)
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.modalIconBtn}
                    onPress={() => {
                      setEditingCar(car);
                      setNewCarNameDraft(car.name);
                      setNewCarMpgDraft(car.mpg);
                      setIsAddingCar(true);
                    }}
                    hitSlop={10}
                  >
                    <Image
                      source={require("../../../../assets/images/pencil-edit-icon.png")}
                      style={styles.modalActionIcon}
                      resizeMode="contain"
                    />
                  </Pressable>

                  <Pressable
                    style={styles.modalIconBtn}
                    onPress={() => confirmDeleteCar(car)}
                    hitSlop={10}
                  >
                    <Image
                      source={require("../../../../assets/images/delete-icon.png")}
                      style={styles.modalActionIcon}
                      resizeMode="contain"
                    />
                  </Pressable>
                </View>
              ))}

              {!isAddingCar ? (
                <Pressable
                  style={[styles.modalItem, styles.addNewItem]}
                  onPress={() => {
                    setEditingCar(null);
                    setIsAddingCar(true);
                    resetCarDrafts();
                  }}
                >
                  <Text style={styles.modalItemText}>+ Add new...</Text>
                </Pressable>
              ) : (
                <View style={styles.addNewWrap}>
                  <Text style={styles.addNewLabel}>Car Name</Text>
                  <TextInput
                    style={styles.addNewInput}
                    value={newCarNameDraft}
                    onChangeText={setNewCarNameDraft}
                    placeholder="Enter car name"
                    placeholderTextColor={COLORS.placeholder}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />

                  <Text style={styles.addNewLabel}>Miles Per Gallon</Text>
                  <TextInput
                    style={styles.addNewInput}
                    value={newCarMpgDraft}
                    onChangeText={setNewCarMpgDraft}
                    placeholder="Enter MPG"
                    placeholderTextColor={COLORS.placeholder}
                    keyboardType="numeric"
                    returnKeyType="done"
                    onSubmitEditing={saveCarDetails}
                  />

                  <View style={styles.addNewActions}>
                    <Pressable onPress={saveCarDetails} style={styles.addNewBtn}>
                      <Text style={styles.addNewBtnText}>Save</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        setIsAddingCar(false);
                        resetCarDrafts();
                      }}
                      style={styles.addNewBtn}
                    >
                      <Text style={[styles.addNewBtnText, styles.actionMuted]}>
                        Cancel
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              <Pressable
                style={styles.modalClose}
                onPress={() => setCarModalOpen(false)}
              >
                <Text style={[styles.modalItemText, styles.actionMuted]}>
                  Close
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal
          visible={deleteCarModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteCarModalOpen(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setDeleteCarModalOpen(false)}
          >
            <Pressable style={styles.confirmModalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Delete Car</Text>

              <Text style={styles.confirmText}>
                Would you like to delete the car?
              </Text>

              <View style={styles.confirmActions}>
                <Pressable
                  style={styles.confirmBtn}
                  onPress={() => {
                    setDeleteCarModalOpen(false);
                    setCarToDelete(null);
                  }}
                >
                  <Text style={[styles.addNewBtnText, styles.actionMuted]}>
                    No
                  </Text>
                </Pressable>

                <Pressable style={styles.confirmBtn} onPress={deleteCar}>
                  <Text style={[styles.addNewBtnText, styles.deleteText]}>
                    Yes
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </>
    );
  };

  const renderPencilRow = (
    key,
    placeholder,
    draft,
    setDraft,
    keyboardType = "default"
  ) => {
    const isEditingThis = editingKey === key;
    const lockThisRow = editingKey !== null && !isEditingThis;

    return (
      <View style={[styles.fieldRow, lockThisRow && styles.lockedRow]}>
        {isEditingThis ? (
          <TextInput
            ref={inputRef}
            style={styles.fieldInput}
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={COLORS.placeholder}
            autoCapitalize={key === "email" || key === "username" ? "none" : "words"}
            keyboardType={keyboardType}
            returnKeyType="done"
            onSubmitEditing={stopEditing}
            onBlur={stopEditing}
            blurOnSubmit
          />
        ) : (
          <Text
            style={[styles.fieldText, !draft && styles.placeholderText]}
            numberOfLines={1}
          >
            {draft ? draft : placeholder}
          </Text>
        )}

        {isEditingThis ? (
          <View style={styles.actions}>
            <Pressable onPress={stopEditing} hitSlop={10} style={styles.actionBtn}>
              <Text style={styles.actionText}>Done</Text>
            </Pressable>

            <Pressable
              onPress={() => cancelEditing(key)}
              hitSlop={10}
              style={styles.actionBtn}
            >
              <Text style={[styles.actionText, styles.actionMuted]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => startEditing(key)}
            hitSlop={10}
            disabled={lockThisRow}
            style={[styles.pencilBtn, lockThisRow && styles.disabledBtn]}
          >
            <Image
              source={require("../../../../assets/images/pencil-edit-icon.png")}
              style={styles.pencilImage}
              resizeMode="contain"
            />
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.topbar}>
          <Image
              source={require("../../../../assets/images/user-settings-icon.png")}
              style={styles.infoImage}
              resizeMode="contain"
            />

          <Text style={styles.title}>Profile</Text>

          <Pressable
            style={styles.infoBtn}
            hitSlop={10}
            onPress={() => navigation.navigate("AboutScreen")}
          >
            <Image
              source={require("../../../../assets/images/info-icon.png")}
              style={styles.infoImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.form}>
              {renderPencilRow(
                "username",
                "Username",
                usernameDraft,
                setUsernameDraft,
                "default"
              )}

              {renderPencilRow(
                "firstName",
                "First Name",
                firstNameDraft,
                setFirstNameDraft,
                "default"
              )}

              {renderPencilRow(
                "lastName",
                "Last Name",
                lastNameDraft,
                setLastNameDraft,
                "default"
              )}

              {renderCarDropdownRow()}

              {renderPencilRow(
                "phone",
                "Phone Number",
                phoneDraft,
                setPhoneDraft,
                "phone-pad"
              )}

              {renderPencilRow(
                "email",
                "Email",
                emailDraft,
                setEmailDraft,
                "email-address"
              )}

              <Pressable
                style={[styles.saveBtn, !hasUnsavedChanges && styles.saveBtnDisabled,]}
                onPress={onSaveChanges}
                disabled={!hasUnsavedChanges}
              >
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </Pressable>

              {hasUnsavedChanges && (
                <Text style={styles.unsavedText}>You have unsaved changes</Text>
              )}

              <View style={styles.bigSpacer} />

              <Pressable style={styles.logoutBtn} onPress={onLogout}>
                <Text style={styles.logoutBtnText}>Logout</Text>
              </Pressable>

              <View style={styles.bottomPadding} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const COLORS = {
  topbar: "#1C2A3C",
  bg: "#141B2B",
  stroke: "rgba(232,238,252,0.35)",
  strokeSoft: "rgba(232,238,252,0.22)",
  text: "#E8EEFC",
  placeholder: "rgba(232,238,252,0.65)",
  white: "#FFFFFF",
  darkText: "#111827",
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safe: {
    flex: 1,
    backgroundColor: COLORS.topbar,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  topbar: {
    height: 64,
    backgroundColor: COLORS.topbar,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBtn: {
    minWidth: 80,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
  },

  infoBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  infoImage: {
    width: 28,
    height: 28,
  },

  iconPlaceholder: {
    color: COLORS.text,
    fontSize: 14,
    opacity: 0.9,
  },

  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  content: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 26,
    paddingBottom: 26,
    paddingHorizontal: 16,
  },

  form: {
    width: "100%",
    maxWidth: 360,
    gap: 14,
  },

  fieldRow: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.stroke,
    backgroundColor: "rgba(255,255,255,0.02)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  lockedRow: {
    opacity: 0.45,
  },

  fieldText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13.5,
    paddingRight: 10,
  },

  placeholderText: {
    color: COLORS.placeholder,
  },

  fieldInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13.5,
    paddingVertical: Platform.OS === "ios" ? 8 : 0,
    paddingRight: 10,
  },

  pencilBtn: {
    paddingLeft: 8,
    paddingVertical: 6,
  },

  disabledBtn: {
    opacity: 0.4,
  },

  pencilImage: {
    width: 18,
    height: 18,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
  },

  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginLeft: 10,
  },

  actionText: {
    color: COLORS.text,
    fontSize: 12.5,
    fontWeight: "700",
  },

  actionMuted: {
    color: COLORS.placeholder,
    fontWeight: "600",
  },

  chevron: {
    color: COLORS.placeholder,
    fontSize: 16,
    marginLeft: 10,
  },

  saveBtn: {
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  saveBtnDisabled: {
    opacity: 0.55,
  },

  saveBtnText: {
    color: COLORS.darkText,
    fontSize: 13.5,
    fontWeight: "700",
  },

  unsavedText: {
    color: COLORS.placeholder,
    textAlign: "center",
    fontSize: 12.5,
    marginTop: -4,
  },

  bigSpacer: {
    height: 26,
  },

  logoutBtn: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.strokeSoft,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutBtnText: {
    color: COLORS.text,
    fontSize: 13.5,
    fontWeight: "600",
  },

  bottomPadding: {
    height: 10,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 18,
  },

  modalCard: {
    backgroundColor: "#0F1624",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(232,238,252,0.18)",
    paddingVertical: 12,
    overflow: "hidden",
  },

  modalTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 14,
    paddingBottom: 8,
  },

  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.10)",
  },

  modalItemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.10)",
    paddingLeft: 14,
    paddingRight: 8,
    minHeight: 48,
  },

  modalItemMain: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 8,
  },

  modalIconBtn: {
    width: 32,
    height: 32,
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  modalActionIcon: {
    width: 16,
    height: 16,
  },

  addNewItem: {
    backgroundColor: "rgba(255,255,255,0.02)",
  },

  modalItemText: {
    color: COLORS.text,
    fontSize: 14,
  },

  addNewWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.10)",
    padding: 12,
  },

  addNewLabel: {
    color: COLORS.placeholder,
    fontSize: 12,
    marginBottom: 6,
  },

  addNewInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(232,238,252,0.25)",
    backgroundColor: "rgba(255,255,255,0.02)",
    paddingHorizontal: 12,
    color: COLORS.text,
    marginBottom: 12,
  },

  addNewActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 2,
  },

  addNewBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginLeft: 12,
  },

  addNewBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },

  modalClose: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.10)",
    paddingVertical: 12,
    alignItems: "center",
  },

  confirmModalCard: {
    backgroundColor: "#0F1624",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(232,238,252,0.18)",
    width: "100%",
    maxWidth: 320,
    alignSelf: "center",
    padding: 16,
  },

  confirmText: {
    color: COLORS.text,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 18,
  },

  confirmActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  confirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginLeft: 12,
  },

  deleteText: {
    color: "#FF7A7A",
  },
});