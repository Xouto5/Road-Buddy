// if it’s user/account setup like name, default people count, car MPG preferences, etc.
// Manuel

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { createUser} from '../services/authServices.js'

// Set username and password of user
export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleProfileSetup = () => {
    console.log(createUser)
    console.log(createUser(email, password))
  
  };
  /*
  const handleProfileSetup = async () => {
    console.log('Profile set up with:', name, email, password);
    // Call the Firestore operation to save the name and email
    await performFirestoreOperations(name, email);
  };
  */

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Setup</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Save Profile" onPress={handleProfileSetup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
});

