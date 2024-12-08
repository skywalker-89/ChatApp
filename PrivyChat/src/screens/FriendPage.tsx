import React, { useState, useEffect, useRef } from "react";
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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { CURRENTIP } from "../../config";

const FriendPage = () => {
  const [friendsData, setFriendsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [friendStatus, setFriendStatus] = useState({}); // Track online/offline status and inRoom status of friends
  const navigation = useNavigation();
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("John Doe");

  const fetchFriends = async () => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      const response = await fetch(`http://${CURRENTIP}:1234/auth/friends`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch friends");
      }

      const data = await response.json();

      setFriendsData(data); // Assuming the API returns an array of friends
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Fetch user data (id and name) and friends data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;

        if (user) {
          setUserName(user.name || "John Doe");
          setUserId(user.id || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchFriends = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        // console.log(userToken);
        const response = await fetch(`http://${CURRENTIP}:1234/auth/friends`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch friends");
        }

        const data = await response.json();

        setFriendsData(data); // Assuming the API returns an array of friends
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    };

    fetchFriends();
    fetchUserData();
  }, []);

  // Refresh friends data when the page is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchFriendsData = async () => {
        try {
          const userToken = await AsyncStorage.getItem("userToken");
          const response = await fetch(
            `http://${CURRENTIP}:1234/auth/friends`,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch friends");
          }

          const data = await response.json();
          // console.log(data);
          setFriendsData(data);
        } catch (error) {
          Alert.alert("Error", error.message);
        }
      };

      fetchFriendsData(); // Fetch friends data when the page is focused
    }, [])
  );

  // Add a new friend
  const handleAddFriend = async () => {
    try {
      Alert.prompt(
        "Add Friend",
        "Enter the ID of the friend you want to add:",
        async (friendId) => {
          if (!friendId) return;

          const userToken = await AsyncStorage.getItem("userToken");

          try {
            const response = await fetch(
              `http://${CURRENTIP}:1234/auth/friends`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({ friendId }),
              }
            );

            const result = await response.json();

            if (response.ok) {
              // Fetch updated friends list
              fetchFriends();
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

  // Unfriend a friend
  const handleUnfriend = async (id) => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");

      const response = await fetch(
        `http://${CURRENTIP}:1234/auth/friends/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setFriendsData((prev) => prev.filter((friend) => friend.id !== id));
        Alert.alert("Success", "Friend removed successfully");
      } else {
        Alert.alert("Error", result.error || "Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      Alert.alert("Error", "Failed to remove friend");
    }
  };

  // Edit the organization of a friend
  const handleEditOrganization = async (id) => {
    const friend = friendsData.find((friend) => friend.id === id);
    const userToken = await AsyncStorage.getItem("userToken");

    Alert.prompt(
      "Edit Organization",
      `Update organization for ${friend.name}:`,
      async (newOrganization) => {
        if (newOrganization) {
          try {
            const response = await fetch(
              `http://${CURRENTIP}:1234/auth/friends/${id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({ organization: newOrganization }),
              }
            );

            const result = await response.json();

            if (response.ok) {
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

  // Render friend item
  const renderFriendItem = ({ item }) => {
    return (
      <Swipeable
        renderLeftActions={() => (
          <TouchableOpacity
            style={FriendPageStyle.editButton}
            onPress={() => handleEditOrganization(item.id)}
          >
            <Text style={FriendPageStyle.editText}>Edit</Text>
          </TouchableOpacity>
        )}
        renderRightActions={() => (
          <TouchableOpacity
            style={FriendPageStyle.unfriendButton}
            onPress={() => handleUnfriend(item.id)}
          >
            <Text style={FriendPageStyle.unfriendText}>Unfriend</Text>
          </TouchableOpacity>
        )}
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
            <Text style={FriendPageStyle.friendName}>
              {item.name}
              {item.active_status === "active" && (
                <View style={FriendPageStyle.onlineIndicator} />
              )}
            </Text>
            <Text style={FriendPageStyle.friendOrganization}>
              {item.organization}
            </Text>
          </View>
          {/* Red dot for online and in room */}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const filteredFriends = friendsData.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={FriendPageStyle.container}>
      <View style={FriendPageStyle.header}>
        <TextInput
          style={FriendPageStyle.searchBar}
          placeholder="Search for a friend here"
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
