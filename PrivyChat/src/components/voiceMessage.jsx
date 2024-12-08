import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Audio } from "expo-av";
import ChatPageStyle from "../styles/ChatPageStyle";

const VoiceMessage = ({ message, isMyMessage, friendName }) => {
  const [sound, setSound] = React.useState();

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: message.uri },
      { shouldPlay: true }
    );
    setSound(sound);
  };

  return (
    <View
      style={[
        ChatPageStyle.message,
        isMyMessage ? ChatPageStyle.myMessage : ChatPageStyle.theirMessage,
      ]}
    >
      <TouchableOpacity onPress={playSound}>
        <Text
          style={[
            ChatPageStyle.messageText,
            { color: isMyMessage ? "white" : "black" },
          ]}
        >
          {isMyMessage ? "You" : friendName}
        </Text>
        <Text>Tap to play voice message</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VoiceMessage;
