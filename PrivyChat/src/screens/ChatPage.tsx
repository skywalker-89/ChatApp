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
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import * as Notifications from "expo-notifications"; // If needed later
import * as ImagePicker from "expo-image-picker";
import io from "socket.io-client";
import ChatPageStyle from "../styles/ChatPageStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CURRENTIP } from "../../config";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import EnhancedImageViewing from "react-native-image-viewing";

const ChatPage = ({ route }) => {
  const { friendId, name: friendName } = route.params || {}; // Safely destructure route params
  const [ownId, setOwnId] = useState("");
  const [ownName, setOwnName] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); // New state for recording time
  const timerRef = useRef(null); // Reference for the timer interval
  const [currentRecording, setCurrentRecording] = useState(null); // Single recording state
  const [sound, setSound] = useState(null); // State to store sound instance
  const [zoomImageVisible, setZoomImageVisible] = useState(false); // State to control zoom modal
  const [currentImage, setCurrentImage] = useState(null); // Store the current image to zoom

  // Function to handle image click
  const handleImagePress = (imageUrl) => {
    setCurrentImage([{ uri: imageUrl }]); // Set the image to display in the zoom modal
    setZoomImageVisible(true); // Show the zoom modal
  };

  // pick image
  const handleImagePick = async () => {
    // Request permission to access the gallery
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access the gallery is required!");
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      // Image selected, send the URI and roomId to the server
      const roomId = [ownId, friendId].sort().join("_"); // Format room ID
      // console.log(roomId);
      if (!result.cancelled) {
        const uploadedImageUrl = await uploadImage(result); // Ensure this function returns the uploaded image URL
        if (uploadedImageUrl) {
          sendMessage("image", null, uploadedImageUrl);
        }
      }
    }
  };

  const uploadImage = async (result) => {
    const userToken = await AsyncStorage.getItem("userToken");
    const selectedImage = result.assets[0];
    const roomId = [ownId, friendId].sort().join("_");
    const formData = new FormData();
    formData.append("file", {
      uri: selectedImage.uri,
      type: selectedImage.type,
      name: selectedImage.fileName || "file.jpg",
    });
    formData.append("roomId", roomId);
    const response = await fetch(`http://${CURRENTIP}:1234/auth/image-upload`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${userToken}`,
      },
      body: formData,
    });
    const data = await response.json();
    if (response.ok) {
      console.log(data);
      return data.imageUrl;
    } else {
      Alert.alert("Error", data.error || "Failed to update profile picture.");
    }
  };

  const handleMicPressIn = async () => {
    if (isRecording) return; // Prevent starting recording if already in progress

    setIsRecording(true);
    setRecordingTime(0);

    // Clear any existing intervals before starting a new one
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1); // Increment every second
    }, 1000);

    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== "granted") {
        console.error("Permission not granted for audio recording");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setCurrentRecording(recording); // Store the current recording instance
    } catch (err) {
      console.error("Error starting recording", err);
      setIsRecording(false); // Reset the state if an error occurs
    }
  };

  const handleMicPressOut = async () => {
    if (!isRecording) return; // Prevent stopping if not recording

    setIsRecording(false);
    clearInterval(timerRef.current); // Stop the timer

    try {
      if (currentRecording) {
        await currentRecording.stopAndUnloadAsync();
        const uri = currentRecording.getURI();
        const roomId = [ownId, friendId].sort().join("_");
        const { sound, status } =
          await currentRecording.createNewLoadedSoundAsync();

        const duration = formatTime(Math.floor(status.durationMillis / 1000));
        const newRecording = { sound, duration, file: uri };

        setCurrentRecording(newRecording); // Make sure to update currentRecording with the new sound object

        // Send the recorded audio message
        // Upload Audio File
        const formData = new FormData();
        formData.append("file", {
          uri,
          type: "audio/mpeg",
          name: "audio-message.mp3",
        });
        formData.append("roomId", roomId);

        const userToken = await AsyncStorage.getItem("userToken");
        const response = await fetch(
          `http://${CURRENTIP}:1234/auth/audio-upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
            body: formData,
          }
        );
        const data = await response.json();
        if (response.ok) {
          sendMessage("audio", null, data.audioUrl);
        } else {
          Alert.alert("Error", data.error || "Failed to upload audio.");
        }
      }
    } catch (err) {
      console.error("Error stopping recording", err);
    }
  };

  // Format the timer as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
  };
  const playRecording = async (uri) => {
    try {
      // Set the audio mode to ensure playback uses the phone speaker
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, // Disable recording during playback
        playsInSilentModeIOS: true, // Allow playback in silent mode (iOS)
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false, // Use the speaker on Android
      });

      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
      setSound(sound);

      // Cleanup when the audio finishes playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          setSound(null);
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  // Stop the current sound
  const stopPlaying = async () => {
    try {
      if (sound) {
        await sound.stopAsync(); // Stop the sound
        setSound(null); // Reset the sound state
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const socket = useRef(null);

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

      // Set user status to 'active' when entering the chat
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        const response = await fetch(
          `http://${CURRENTIP}:1234/auth/user/active`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`, // Replace with actual JWT token
            },
          }
        );
        if (!response.ok) {
          console.error("Failed to mark user as active");
        }
        console.log("User marked as active");
      } catch (error) {
        console.error("Error setting active status:", error);
      }
    };
    fetchUserData();
  }, []);

  // Initialize socket connection after ownId is available
  useEffect(() => {
    if (!ownId || !friendId) return;

    socket.current = io(`http://${CURRENTIP}:3001`);

    socket.current.on("connect", async () => {
      console.log("Connected to server");

      // Register user with the socket
      socket.current.emit("register_user", ownId);
      const roomId = [ownId, friendId].sort().join("_");
      socket.current.emit("join_room", { roomId, userId: ownId });
      console.log(`Joined room: ${roomId}`);
    });

    // Handle receiving messages
    socket.current.on("receive_message", (message) => {
      console.log("Received message:", message);

      // Validate the message content
      if (message.type === "text" && message.text) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "text", text: message.text, sender: message.sender },
        ]);
      } else if (message.type === "image" && message.mediaUrl) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "image", mediaUrl: message.mediaUrl, sender: message.sender },
        ]);
      } else if (message.type === "audio" && message.mediaUrl) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "audio", mediaUrl: message.mediaUrl, sender: message.sender },
        ]);
      } else {
        console.warn("Invalid message data received:", message);
      }
    });

    // Cleanup: Set user status to 'inactive' when leaving the chat
    return async () => {
      const roomId = [ownId, friendId].sort().join("_");
      console.log(roomId);
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        const response = await fetch(
          `http://${CURRENTIP}:1234/auth/user/inactive`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`, // Replace with actual JWT token
            },
          }
        );
        if (!response.ok) {
          console.error("Failed to mark user as inactive");
        }
        console.log("User marked as inactive");
        // Emit a custom event to inform the server about disconnection
        socket.current.emit("disconnect_room", {
          roomId: roomId,
          userId: ownId,
        });
        console.log("Sent disconnect event with roomId");
      } catch (error) {
        console.error("Error setting inactive status:", error);
      }

      socket.current.disconnect({ roomId: roomId });
      console.log("Socket disconnected");
    };
  }, [ownId, friendId]);

  const sendMessage = (type, text = null, mediaUrl = null) => {
    if (
      (type === "text" && text) ||
      (type === "image" && mediaUrl) ||
      (type === "audio" && mediaUrl)
    ) {
      const roomId = [ownId, friendId].sort().join("_");
      const messageData = {
        type, // "text", "image", or "audio"
        text,
        mediaUrl, // Unified media field for image and audio URLs
        room: roomId,
        sender: ownId,
      };

      // Emit the message to the server
      socket.current.emit("send_message", messageData);

      // Update local state with the new message
      setMessages((prevMessages) => [
        ...prevMessages,
        { type, text, mediaUrl, sender: "You" },
      ]);

      // Clear the input field if it was a text message
      if (type === "text") {
        setNewMessage("");
      }
    } else {
      console.error(
        "Invalid message data. Text, imageUrl, or audioUrl is required."
      );
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender === "You";

    console.log("This is the Item", item);

    if (item.type === "text" && item.text) {
      return (
        <View
          style={[
            ChatPageStyle.message,
            isMyMessage ? ChatPageStyle.myMessage : ChatPageStyle.theirMessage,
          ]}
        >
          <Text
            style={[
              isMyMessage
                ? ChatPageStyle.myMessageText
                : ChatPageStyle.theirMessageText,
            ]}
          >
            {isMyMessage ? item.text : `${item.text}`}
          </Text>
        </View>
      );
    } else if (item.type === "image" && item.mediaUrl) {
      return (
        <View
          style={[
            ChatPageStyle.message,
            isMyMessage ? ChatPageStyle.myMessage : ChatPageStyle.theirMessage,
          ]}
        >
          <TouchableOpacity onPress={() => handleImagePress(item.mediaUrl)}>
            <Image
              source={{ uri: item.mediaUrl }}
              style={ChatPageStyle.imageMessage}
            />
          </TouchableOpacity>
        </View>
      );
    } else if (item.type === "audio" && item.mediaUrl) {
      return (
        <View
          style={[
            ChatPageStyle.message,
            isMyMessage ? ChatPageStyle.myMessage : ChatPageStyle.theirMessage,
          ]}
        >
          <TouchableOpacity
            onPressIn={() => playRecording(item.mediaUrl)}
            onPressOut={stopPlaying}
          >
            <View
              style={
                isMyMessage
                  ? ChatPageStyle.myAudioMessageContainer
                  : ChatPageStyle.theirAudioMessageContainer
              }
            >
              <MaterialCommunityIcons
                name="play"
                size={24}
                color={isMyMessage ? "white" : "#007BFF"}
              />
            </View>
          </TouchableOpacity>
        </View>
      );
    } else {
      // Log unexpected messages for debugging
      console.warn("Unexpected message format:", item);
      return null; // Don't render anything for invalid messages
    }
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <Text style={ChatPageStyle.title}>Chat with {friendName}</Text>
          <FlatList
            contentContainerStyle={ChatPageStyle.messagesContainer}
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderMessage}
          />
          <View style={ChatPageStyle.inputContainer}>
            {!isRecording ? (
              <>
                <TextInput
                  style={[
                    ChatPageStyle.input,
                    newMessage.length > 0 && { width: "100%" },
                  ]}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Type a message..."
                />
                {newMessage.length === 0 && (
                  <>
                    <TouchableOpacity
                      style={ChatPageStyle.imageMessageButton}
                      onPress={handleImagePick}
                    >
                      <MaterialCommunityIcons
                        name="image"
                        size={22}
                        color="white"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={ChatPageStyle.voiceMessageButton}
                      onPressIn={handleMicPressIn}
                      onPressOut={handleMicPressOut}
                    >
                      <MaterialCommunityIcons
                        name="microphone"
                        size={22}
                        color="white"
                      />
                    </TouchableOpacity>
                  </>
                )}
                {newMessage.length > 0 && (
                  <TouchableOpacity
                    style={ChatPageStyle.sendButton}
                    onPress={() => sendMessage("text", newMessage)}
                  >
                    <MaterialCommunityIcons
                      name="send"
                      size={22}
                      color="white"
                    />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity
                // style={ChatPageStyle.duringRecord}
                onPressIn={handleMicPressIn}
                onPressOut={handleMicPressOut}
                style={ChatPageStyle.recordingContainer}
              >
                <Text style={ChatPageStyle.recordingText}>
                  Recording: {formatTime(recordingTime)}{" "}
                  {/* Display formatted time */}
                </Text>

                {/* <MaterialCommunityIcons
                    name="microphone"
                    size={22}
                    color="#007BFF"
                  /> */}
              </TouchableOpacity>
            )}
          </View>
          {/* Image zoom modal */}
          <EnhancedImageViewing
            images={currentImage || []}
            imageIndex={0}
            visible={zoomImageVisible}
            onRequestClose={() => setZoomImageVisible(false)} // Close the modal
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ChatPage;
