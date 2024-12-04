import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import AccountPageStyle from "../styles/AccountPageStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { CURRENTIP } from "../../config";

const AccountPage = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("John Doe"); // Default name
  const [profilePicture, setProfilePicture] = useState(
    "https://via.placeholder.com/100" // Default profile picture
  );
  const [userId, setUserId] = useState(""); // Add state for userId

  useEffect(() => {
    const debugAsyncStorage = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      console.log("Stored user data:", storedUser);
    };
    debugAsyncStorage();
  }, []);
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data from AsyncStorage
        const storedUser = await AsyncStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;

        if (user) {
          setUserName(user.name || "John Doe");
          setProfilePicture(user.profile_pic || profilePicture); // Use profile_pic
          setUserId(user.id || ""); // Set userId in state
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

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

  return (
    <View style={AccountPageStyle.container}>
      {/* Profile Picture and Name */}
      <Image
        source={{ uri: profilePicture }} // Display the user's profile picture
        style={AccountPageStyle.profileImage}
      />
      <Text style={AccountPageStyle.userName}>{userName}</Text>
      <Text style={AccountPageStyle.userId}>{`ID: ${userId}`}</Text>

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

export default AccountPage;
