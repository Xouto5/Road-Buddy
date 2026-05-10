/*
BottomNav component
Used to navigate from screens to screen

Author: Bryan Cardeno                               
Date: 03-26-2026
*/

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import HomeScreen from "../features/trip/screens/Home/HomeScreen";
import TripDetailsScreen from "../features/trip/screens/TripDetails/TripDetailsScreen";
import TripsSummaryScreen from "../features/trip/screens/TripsSummaryScreen";
import EstimateScreen from "../features/cost/screens/EstimateScreen";
import ProfileScreen from "../features/settings/screens/SettingsScreen";

const Tab = createBottomTabNavigator();

const THEME_COLOR = "#1B2435";

export default function BottomNav() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "#fafafa",
        tabBarStyle: {
          backgroundColor: THEME_COLOR,
          borderTopWidth: 0,        
          elevation: 0,             
          shadowOpacity: 0,         
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        },
        tabBarItemStyle: {
          backgroundColor: THEME_COLOR,
        },
      }}
    >
      <Tab.Screen
        name="Plan"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <SimpleLineIcons name="paper-plane" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Overview"
        component={TripDetailsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="bar-chart-o" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Trips"
        component={TripsSummaryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Estimate"
        component={EstimateScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="calculator" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}