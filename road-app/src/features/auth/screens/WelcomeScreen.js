//KEITH:
// WelcomeScreen.js
// Welcome screen for RoadBuddy app. Displays the app logo and a "Start" button that navigates to the login screen.
// App.js has also been edited to include the appropriate changes.
// Finished on 02/25/2026

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Image, ImageBackground, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function WelcomeScreen() {
  const navigation = useNavigation();
  
  // Create animated values for fade and scale 
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2500, 
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');  
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, navigation]);

  return (
    <ImageBackground 
      source={require('../../../../assets/images/RoadBuddyLogoNoText.png')} 
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <Animated.View style={[
        styles.centerContainer, 
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}>
        <Image 
          source={require('../../../../assets/images/RoadBuddyLogoText.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
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
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 380,
    height: 170,
  },
});