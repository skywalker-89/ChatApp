import React from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import HomePageStyle from "../styles/HomePageStyle";
import { SafeAreaView } from "react-native-safe-area-context"; // Import SafeAreaView

const chatData = [
  {
    id: "1",
    name: "Lana Adams",
    message: "👋",
    count: 3,
    image: "https://via.placeholder.com/50",
  },
  {
    id: "2",
    name: "Gloria Watson",
    message: "Have a nice day 😊",
    count: 1,
    image: "https://via.placeholder.com/50",
  },
  {
    id: "3",
    name: "Evan Warren",
    message: "Hey, it’s time to start your workout!",
    count: 2,
    image: "https://via.placeholder.com/50",
  },
  {
    id: "4",
    name: "Jane Smith",
    message: "See you later!",
    count: 0,
    image: "https://via.placeholder.com/50",
  },
  {
    id: "5",
    name: "Gloria Black",
    message: "Fine! Keep it up 💪",
    count: 0,
    image: "https://via.placeholder.com/50",
  },
  {
    id: "6",
    name: "Audrey Watson",
    message: "Thanks!",
    count: 0,
    image: "https://via.placeholder.com/50",
  },
];

const HomePage = () => {
  const [friendsData, setFriendsData] = useState(chatData);
  const [searchQuery, setSearchQuery] = useState("");

  const renderChatItem = ({ item }: any) => (
    <TouchableOpacity style={HomePageStyle.chatItem}>
      <Image source={{ uri: item.image }} style={HomePageStyle.profileImage} />
      <View style={HomePageStyle.chatDetails}>
        <Text style={HomePageStyle.chatName}>{item.name}</Text>
        <Text style={HomePageStyle.chatMessage}>{item.message}</Text>
      </View>
      {item.count > 0 && (
        <View style={HomePageStyle.badge}>
          <Text style={HomePageStyle.badgeText}>{item.count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const filteredFriends = friendsData.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={HomePageStyle.container}>
      {/* <Text style={HomePageStyle.header}>Chat</Text> */}
      <TextInput
        style={HomePageStyle.searchBar}
        onChangeText={setSearchQuery}
        value={searchQuery}
        placeholder="Search..."
      />
      <FlatList
        data={filteredFriends}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        style={HomePageStyle.chatList}
      />
    </SafeAreaView>
  );
};

export default HomePage;
