import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AccountPageStyle from "../styles/AccountPageStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { CURRENTIP } from "../../config";
import axios from "axios";

const AccountPage = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("John Doe"); // Default name
  const [profilePicture, setProfilePicture] = useState(
    "https://via.placeholder.com/100" // Default profile picture
  );
  const [userId, setUserId] = useState(""); // Add state for userId
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");

        // Check if userToken exists
        if (!userToken) {
          console.error("No user token found!");
          return;
        }

        // Call the backend to fetch user profile data
        const response = await fetch(`http://${CURRENTIP}:1234/auth/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch user data:", response.status);
          return;
        }

        const result = await response.json();
        console.log(result);

        if (result) {
          setUserName(result.user.name || "John Doe");
          setProfilePicture(result.user.profile_pic || null); // Set the profile picture or default value
          setUserId(result.user.id || ""); // Set the userId
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Refresh friends data when the page is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        try {
          const userToken = await AsyncStorage.getItem("userToken");

          // Check if userToken exists
          if (!userToken) {
            console.error("No user token found!");
            return;
          }

          // Call the backend to fetch user profile data
          const response = await fetch(
            `http://${CURRENTIP}:1234/auth/profile`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
            }
          );

          if (!response.ok) {
            console.error("Failed to fetch user data:", response.status);
            return;
          }

          const result = await response.json();
          console.log(result);

          if (result) {
            setUserName(result.user.name || "John Doe");
            setProfilePicture(result.user.profile_pic || null); // Set the profile picture or default value
            setUserId(result.user.id || ""); // Set the userId
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData(); // Fetch friends data when the page is focused
    }, [])
  );

  const handleChangePassword = async () => {
    const userToken = await AsyncStorage.getItem("userToken");

    // Prompt the user to enter their old password first
    Alert.prompt(
      "Old Password",
      "Please enter your current password:",
      async (oldPassword) => {
        if (oldPassword) {
          // After old password is entered, ask for new password and confirmation
          Alert.prompt(
            "New Password",
            "Please enter your new password:",
            async (newPassword) => {
              if (newPassword) {
                // Prompt for confirmation of the new password
                Alert.prompt(
                  "Confirm New Password",
                  "Please confirm your new password:",
                  async (confirmPassword) => {
                    if (confirmPassword === newPassword) {
                      try {
                        // Call the backend to change the password
                        const response = await fetch(
                          `http://${CURRENTIP}:1234/auth/change-password`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${userToken}`,
                            },
                            body: JSON.stringify({
                              oldPassword,
                              newPassword,
                            }),
                          }
                        );

                        const result = await response.json();

                        if (response.ok) {
                          Alert.alert(
                            "Success",
                            "Password changed successfully"
                          );
                        } else {
                          Alert.alert(
                            "Error",
                            result.error || "Failed to change password"
                          );
                        }
                      } catch (error) {
                        Alert.alert("Error", "Failed to change password");
                      }
                    } else {
                      Alert.alert("Error", "New passwords do not match");
                    }
                  },
                  "secure-text"
                );
              } else {
                Alert.alert("Error", "New password cannot be empty");
              }
            },
            "secure-text"
          );
        } else {
          Alert.alert("Error", "Old password cannot be empty");
        }
      },
      "secure-text"
    );
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            // Clear user data and token
            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("userToken");

            // Navigate to login screen
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });

            console.log("User logged out!");
          } catch (error) {
            console.error("Error during logout:", error);
          }
        },
      },
    ]);
  };

  const handleProfilePictureChange = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      const formData = new FormData();
      formData.append("profile_pic", {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.fileName || "profile_picture.jpg",
      });

      setIsLoading(true); // Set loading to true while uploading

      const userToken = await AsyncStorage.getItem("userToken");
      try {
        const response = await fetch(
          `http://${CURRENTIP}:1234/auth/update-profile-pic`,
          {
            method: "POST",
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${userToken}`,
            },
            body: formData,
          }
        );

        const data = await response.json();
        setIsLoading(false); // Reset loading

        if (response.ok) {
          setProfilePicture(data.user.profile_pic); // Update profile picture in state
          Alert.alert("Success", "Profile picture updated successfully!");
        } else {
          Alert.alert(
            "Error",
            data.error || "Failed to update profile picture."
          );
        }
      } catch (error) {
        setIsLoading(false);
        console.error("Error uploading profile picture:", error);
        Alert.alert("Error", "Failed to upload profile picture.");
      }
    }
  };

  return (
    <View style={AccountPageStyle.container}>
      {/* Profile Picture and Name */}
      <TouchableOpacity onPress={handleProfilePictureChange}>
        <Image
          source={{ uri: profilePicture }} // Display the user's profile picture
          style={AccountPageStyle.profileImage}
        />
      </TouchableOpacity>
      <Text style={AccountPageStyle.userName}>{userName}</Text>
      <Text style={AccountPageStyle.userId}>{`ID: ${userId}`}</Text>

      {isLoading && <ActivityIndicator style={styles.loadingIndicator} />}

      <View style={AccountPageStyle.optionsContainer}>
        <TouchableOpacity
          style={AccountPageStyle.optionButton}
          onPress={handleChangePassword}
        >
          <Text style={AccountPageStyle.optionButtonText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={AccountPageStyle.optionButton}
          onPress={handleLogout}
        >
          <Text
            style={[AccountPageStyle.optionButtonText, { color: "#ff4d4f" }]}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingIndicator: {
    marginTop: 20,
    color: "#007BFF", // Keep the blue color
    fontSize: 18, // Smaller font size for a more compact look
    fontWeight: "bold", // Bold for emphasis
    textAlign: "center", // Center the text
    letterSpacing: 0.5, // Add a bit of spacing to make it look cleaner
    opacity: 0.8, // Slight transparency for a smoother look
  },
});

export default AccountPage;
