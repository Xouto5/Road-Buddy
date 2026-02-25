// LoginScreen.js
// Login screen for RoadBuddy app. Users can enter their username and password to log in, or use social login options. The screen also includes links for password recovery and account creation.
// RoadBuddy Logo is at the top.
// White back button is also at the top left corner of the screen to allow users to navigate back to the weclome screen.

// By: Keith Marco Acob
// Finished on 02/24/2026
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, } from "react-native";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>{'<'}</Text>
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image 
          source={require('../../../../assets/images/RoadBuddyLogoText.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#9CA3AF"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
      </View>

      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.linksContainer}>
        <TouchableOpacity>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity>
          <Text style={styles.linkText}>Create New Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Login with X</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Login with Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Login with Apple</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 240,
    height: 100,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    color: '#FFFFFF',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 25,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linksContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 10,
  },
  socialContainer: {
    width: '100%',
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  socialButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});