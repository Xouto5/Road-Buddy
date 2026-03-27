/*
BottomNav component
Used to navigate from screens to screen

Author: Bryan Cardeno                               
Date: 03-26-2026
*/

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import HomeScreen from "../features/trip/screens/Home/HomeScreen";
import TripDetailsScreen from "../features/trip/screens/TripDetails/TripDetailsScreen";
import TripsSummaryScreen from "../features/trip/screens/TripsSummaryScreen";
import EstimateScreen from "../features/cost/screens/EstimateScreen";
import ProfileScreen from "../features/settings/screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function BottomNav() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarInactiveBackgroundColor: "rgba(84,84,84,0.8)",
        tabBarInactiveTintColor: "#fafafa",
      }}
    >
      <Tab.Screen
        name="Plan"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <SimpleLineIcons name="paper-plane" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Overview"
        component={TripDetailsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="bar-chart-o" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Trips"
        component={TripsSummaryScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Estimate"
        component={EstimateScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="calculator" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
