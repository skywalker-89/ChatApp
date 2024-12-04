import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import LoginPageStyle from "../styles/LoginPageStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CURRENTIP } from "../../config";

const LoginPage = ({ navigation }: any) => {
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [email, setEmail] = useState(""); // State to track email
  const [password, setPassword] = useState(""); // State to track password

  const handleLogin = async () => {
    setIsLoading(true); // Set loading state to true

    try {
      // Log the request payload to ensure correctness
      console.log("Request body:", { email, password });

      // API request to login
      const response = await fetch(`http://${CURRENTIP}:1234/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Login Response Data:", data); // Debugging the response

      // Check if the token exists in the response
      if (data.token) {
        // Save user data and token
        await saveUserData(data.user);
        await AsyncStorage.setItem("userToken", data.token); // Save token

        console.log("User data saved and token set!");

        // Navigate to the main screen
        navigation.replace("Main");
      } else {
        // Show error message if no token is returned
        Alert.alert("Login Failed", data.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", "An error occurred. Please try again.");
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  const saveUserData = async (user: any) => {
    try {
      const userData = {
        name: user.name,
        profile_pic: user.profile_pic, // Assuming these are part of the response
        id: user.id,
      };
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      console.log("User data saved!");
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  return (
    <View style={LoginPageStyle.container}>
      {/* Header Section */}
      <Text style={LoginPageStyle.title}>Welcome Back</Text>
      <Text style={LoginPageStyle.subtitle}>
        Log in to continue to your account
      </Text>

      {/* Input Fields */}
      <TextInput
        style={LoginPageStyle.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail} // Handle email input
        keyboardType="email-address"
      />
      <TextInput
        style={LoginPageStyle.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword} // Handle password input
        secureTextEntry
      />

      {/* Login Button */}
      <TouchableOpacity
        style={LoginPageStyle.loginButton}
        onPress={handleLogin} // Trigger handleLogin function
        disabled={isLoading} // Disable button while loading
      >
        <Text style={LoginPageStyle.loginButtonText}>
          {isLoading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      {/* Forgot Password and Register */}
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={LoginPageStyle.registerText}>
          Don't have an account?{" "}
          <Text style={LoginPageStyle.registerLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginPage;
