import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import * as Notifications from "expo-notifications";
import io from "socket.io-client";
import ChatPageStyle from "../styles/ChatPageStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CURRENTIP } from "../../config";

const ChatPage = ({ route }) => {
  const { friendId, name: friendName } = route.params || {}; // Safely destructure route params
  const [ownId, setOwnId] = useState("");
  const [ownName, setOwnName] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const socket = useRef(null);

  // Request notification permission when the component mounts
  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Notification permission not granted");
      }
    };
    requestPermission();
  }, []);

  // Fetch own user ID from AsyncStorage on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        if (user?.id) {
          setOwnId(user.id);
          setOwnName(user.name);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  // Initialize socket connection after ownId is available
  useEffect(() => {
    if (!ownId || !friendId) return;

    socket.current = io(`http://${CURRENTIP}:3001`);

    socket.current.on("connect", () => {
      console.log("Connected to server");

      // Register user with the socket
      socket.current.emit("register_user", ownId);
      const roomId = [ownId, friendId].sort().join("_");
      socket.current.emit("join_room", { roomId, userId: ownId });
      console.log(`Joined room: ${roomId}`);

      // Notify the friend (using dynamic names)
      socket.current.emit("notify_friend", {
        senderId: ownId,
        receiverId: friendId,
        message: `Hi, ${friendName} wants to chat with you!`,
      });
    });

    // Handle receiving messages
    socket.current.on("receive_message", (message) => {
      console.log("Received message:", message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: message.text, sender: message.sender },
      ]);
    });

    // Listen for notifications
    socket.current.on("notification", (data) => {
      console.log("Notification received:", data);

      // Show a local notification (using Expo's local notifications)
      Notifications.scheduleNotificationAsync({
        content: {
          title: "New Chat Message",
          body: data.message,
        },
        trigger: { seconds: 1 }, // Show immediately
      });

      // Optionally, you can also show an alert for debugging
      Alert.alert("New Message", data.message);
    });

    return () => {
      socket.current.disconnect();
      console.log("Socket disconnected");
    };
  }, [ownId, friendId, friendName]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const roomId = [ownId, friendId].sort().join("_");
      const messageData = { text: newMessage, room: roomId, sender: ownId };
      socket.current.emit("send_message", messageData);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: newMessage, sender: "You" },
      ]);
      setNewMessage("");
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender === "You";
    return (
      <View
        style={[
          ChatPageStyle.message,
          isMyMessage ? ChatPageStyle.myMessage : ChatPageStyle.theirMessage,
        ]}
      >
        <Text>{isMyMessage ? item.text : `${friendName}: ${item.text}`}</Text>
      </View>
    );
  };

  // If friendId or name is missing, show an error
  if (!friendId || !friendName) {
    return (
      <View style={ChatPageStyle.errorContainer}>
        <Text>Error: Friend data is missing.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={ChatPageStyle.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={ChatPageStyle.title}>Chat with {friendName}</Text>
      <FlatList
        contentContainerStyle={ChatPageStyle.messagesContainer}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
      />
      <View style={ChatPageStyle.inputContainer}>
        <TextInput
          style={ChatPageStyle.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
        />
        <TouchableOpacity
          style={ChatPageStyle.sendButton}
          onPress={sendMessage}
        >
          <Text style={ChatPageStyle.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatPage;
