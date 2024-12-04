import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Expo image picker
import axios from "axios"; // Axios for API requests
import RegisterPageStyle from "../styles/RegisterPageStyle";
import { CURRENTIP } from "../../config";

const RegisterPage = ({ navigation }: any) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle image selection
  const selectProfilePicture = async () => {
    // Request permissions
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to upload a profile picture."
      );
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Make it square
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.log("Selected Image: ", result.assets[0]);
      setProfilePicture(result.assets[0]); // Set the selected image
    } else {
      console.log("Image picker canceled");
    }
  };

  // Function to handle registration
  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      if (profilePicture) {
        formData.append("profile_pic", {
          uri: profilePicture.uri,
          name: profilePicture.fileName || "profile_pic.jpg",
          type: profilePicture.type || "image/jpeg",
        });
      }

      // API call to register the user
      const response = await axios.post(
        `http://${CURRENTIP}:1234/auth/register`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        Alert.alert("Success", "Registration successful!");
        navigation.replace("Login");
      } else {
        throw new Error(response.data.error || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration Error:", error);
      Alert.alert(
        "Registration Failed",
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={RegisterPageStyle.container}>
      {/* Header Section */}
      <Text style={RegisterPageStyle.title}>Create an Account</Text>
      <Text style={RegisterPageStyle.subtitle}>
        Sign up to get started with your account
      </Text>

      {/* Profile Picture Selector */}
      <TouchableOpacity onPress={selectProfilePicture}>
        <View style={RegisterPageStyle.profilePictureContainer}>
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture.uri }}
              style={RegisterPageStyle.profilePicture}
            />
          ) : (
            <Text style={RegisterPageStyle.profilePictureText}>
              Select Profile Picture
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Input Fields */}
      <TextInput
        style={RegisterPageStyle.input}
        placeholder="Full Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />
      <TextInput
        style={RegisterPageStyle.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={RegisterPageStyle.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TextInput
        style={RegisterPageStyle.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
      />

      {/* Register Button */}
      <TouchableOpacity
        style={RegisterPageStyle.registerButton}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={RegisterPageStyle.registerButtonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      {/* Already Have an Account */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={RegisterPageStyle.loginText}>
          Already have an account?{" "}
          <Text style={RegisterPageStyle.loginLink}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterPage;
