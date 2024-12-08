import React from "react";
import { View, Image, Text } from "react-native";
import ChatPageStyle from "../styles/ChatPageStyle";

const PictureMessage = ({ message, isMyMessage, friendName }) => {
  return (
    <View
      style={[
        ChatPageStyle.message,
        isMyMessage ? ChatPageStyle.myMessage : ChatPageStyle.theirMessage,
      ]}
    >
      <Image source={{ uri: message.uri }} style={ChatPageStyle.imageMessage} />
      <Text
        style={[
          isMyMessage
            ? ChatPageStyle.myMessageText
            : ChatPageStyle.theirMessageText,
        ]}
      >
        {isMyMessage ? "You" : friendName}
      </Text>
    </View>
  );
};

export default PictureMessage;
