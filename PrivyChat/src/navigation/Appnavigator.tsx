import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // For persistent storage
import HomePage from "../screens/HomePage";
import AccountPage from "../screens/AccountPage";
import FriendPage from "../screens/FriendPage";
import Icon from "react-native-vector-icons/Ionicons";
import LoginPage from "../screens/LoginPage";
import RegisterPage from "../screens/RegisterPage";
import { View, ActivityIndicator } from "react-native"; // Loader component
import ChatPage from "../screens/ChatPage";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true); // For showing the loader
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Tracks user login state

  // Check login status on app start
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Assume we store a "userToken" when logged in
        const token = await AsyncStorage.getItem("userToken");
        setIsLoggedIn(!!token); // If token exists, user is logged in
      } catch (error) {
        console.error("Failed to check login status", error);
      } finally {
        setIsLoading(false); // Hide loader once the check is complete
      }
    };

    checkLoginStatus();
  }, []);

  // Main tabs for authenticated users
  const MainTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Friends") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Account") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "#6c757d",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Friends" component={FriendPage} />
      <Tab.Screen name="Account" component={AccountPage} />
    </Tab.Navigator>
  );

  // Show a loader while checking the authentication status
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? "Main" : "Login"}>
        <Stack.Screen
          name="Login"
          component={LoginPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatPage"
          component={ChatPage}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
