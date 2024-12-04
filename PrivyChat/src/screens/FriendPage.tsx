import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swipeable from "react-native-gesture-handler/Swipeable";
import FriendPageStyle from "../styles/FriendPageStyle";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { CURRENTIP } from "../../config";

const FriendPage = () => {
  const [friendsData, setFriendsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        const response = await fetch(`http://${CURRENTIP}:1234/auth/friends`, {
          headers: {
            Authorization: `Bearer ${userToken}`, // Replace with your auth token
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch friends");
        }

        const data = await response.json();
        setFriendsData(data); // Assuming the API returns an array of friends
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleUnfriend = async (id) => {
    try {
      const userToken = await AsyncStorage.getItem("userToken"); // Fetch token for authentication

      // Call the backend API to delete the friend
      const response = await fetch(
        `http://${CURRENTIP}:1234/auth/friends/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userToken}`, // Include token in headers
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        // On success, update the local friendsData state
        setFriendsData((prev) => prev.filter((friend) => friend.id !== id));
        Alert.alert("Success", "Friend removed successfully");
      } else {
        // Handle errors
        Alert.alert("Error", result.error || "Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      Alert.alert("Error", "Failed to remove friend");
    }
  };

  const fetchFriendsData = async () => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      const response = await fetch(`http://${CURRENTIP}:1234/auth/friends`, {
        headers: {
          Authorization: `Bearer ${userToken}`, // Replace with your auth token
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch friends");
      }

      const data = await response.json();
      setFriendsData(data); // Assuming the API returns an array of friends
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    try {
      // Prompt the user to enter the friend's ID
      Alert.prompt(
        "Add Friend",
        "Enter the ID of the friend you want to add:",
        async (friendId) => {
          if (!friendId) return; // If input is empty, do nothing

          const userToken = await AsyncStorage.getItem("userToken"); // Get user token from AsyncStorage

          try {
            const response = await fetch(
              `http://${CURRENTIP}:1234/auth/friends`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${userToken}`, // Add the authorization token
                },
                body: JSON.stringify({ friendId }), // Send the friend's ID
              }
            );

            const result = await response.json();

            if (response.ok) {
              fetchFriendsData();
              Alert.alert("Success", "Friend added successfully!");
            } else {
              Alert.alert("Error", result.error || "Failed to add friend.");
            }
          } catch (error) {
            Alert.alert("Error", "An unexpected error occurred.");
            console.error("Add friend error:", error);
          }
        },
        "plain-text"
      );
    } catch (error) {
      console.error("Error showing prompt:", error);
    }
  };

  const handleEditOrganization = async (id) => {
    const friend = friendsData.find((friend) => friend.id === id);
    const userToken = await AsyncStorage.getItem("userToken");

    // Prompt the user to enter a new organization
    Alert.prompt(
      "Edit Organization",
      `Update organization for ${friend.name}:`,
      async (newOrganization) => {
        if (newOrganization) {
          try {
            // Call the backend to update the organization
            const response = await fetch(
              `http://${CURRENTIP}:1234/auth/friends/${id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${userToken}`, // Or use your token method
                },
                body: JSON.stringify({ organization: newOrganization }),
              }
            );

            const result = await response.json();

            if (response.ok) {
              // If successful, update the local state with the new organization
              setFriendsData((prev) =>
                prev.map((friend) =>
                  friend.id === id
                    ? { ...friend, organization: newOrganization }
                    : friend
                )
              );
              Alert.alert("Success", "Organization updated successfully");
            } else {
              Alert.alert(
                "Error",
                result.error || "Failed to update organization"
              );
            }
          } catch (error) {
            Alert.alert("Error", "Failed to update organization");
          }
        }
      },
      "plain-text",
      friend.organization || ""
    );
  };

  const renderLeftActions = (id) => (
    <TouchableOpacity
      style={FriendPageStyle.editButton} // Orange for Edit button
      onPress={() => handleEditOrganization(id)}
    >
      <Text style={FriendPageStyle.editText}>Edit</Text>
    </TouchableOpacity>
  );

  const renderRightActions = (id) => (
    <TouchableOpacity
      style={FriendPageStyle.unfriendButton}
      onPress={() => handleUnfriend(id)}
    >
      <Text style={FriendPageStyle.unfriendText}>Unfriend</Text>
    </TouchableOpacity>
  );

  const filteredFriends = friendsData.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFriendItem = ({ item }) => (
    <Swipeable
      renderLeftActions={() => renderLeftActions(item.id)}
      renderRightActions={() => renderRightActions(item.id)}
    >
      <TouchableOpacity
        style={FriendPageStyle.friendItem}
        onPress={() =>
          navigation.navigate("ChatPage", {
            friendId: item.id,
            name: item.name,
          })
        }
      >
        <Image
          source={{ uri: item.profile_pic }}
          style={FriendPageStyle.profileImage}
        />
        <View style={FriendPageStyle.friendDetails}>
          <Text style={FriendPageStyle.friendName}>{item.name}</Text>
          <Text style={FriendPageStyle.friendOrganization}>
            {item.organization}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <SafeAreaView style={FriendPageStyle.container}>
      <View style={FriendPageStyle.header}>
        <TextInput
          style={FriendPageStyle.searchBar}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={FriendPageStyle.addButton}
          onPress={handleAddFriend}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredFriends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.id}
        style={FriendPageStyle.friendList}
      />
    </SafeAreaView>
  );
};

export default FriendPage;
