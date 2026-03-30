//KEITH:
// WelcomeScreen.js
// Welcome screen for RoadBuddy app. Displays the app logo and a "Start" button that navigates to the login screen.
// App.js has also been edited to include the appropriate changes.
// Finished on 02/25/2026

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image,ImageBackground} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <ImageBackground 
      source={require('../../../../assets/images/RoadBuddyLogoNoText.png')} 
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Image 
          source={require('../../../../assets/images/RoadBuddyLogoText.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.startButtonText}>Start</Text>
      </TouchableOpacity>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    transform: [
      { scale: 1.15 },
      { translateX: -21 },
      { translateY: -13 } 
    ]
  },
  headerContainer: {
    position: 'absolute',
    top: 10,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  logo: {
    width: 380,
    height: 170,
    transform: [{ translateX: 10 }],
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    position: 'absolute',
    bottom: 80,
  },
  startButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});