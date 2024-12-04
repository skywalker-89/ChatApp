import { StyleSheet } from "react-native";

const HomePageStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4", // Light background
    paddingHorizontal: 15,
    paddingTop: 50, // Match the same top padding as the friend list page
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000", // Black header text
  },
  searchBar: {
    height: 40,
    borderRadius: 10,
    backgroundColor: "#e8e8e8", // Light gray background for search bar
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  chatList: {
    flex: 1,
    marginTop: 10,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff", // White background for chat items
    borderRadius: 8,
    marginBottom: 10, // Space between items
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 2, // Subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Circular profile image
    marginRight: 15,
  },
  chatDetails: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000", // Black text for name
    marginBottom: 2,
  },
  chatMessage: {
    fontSize: 14,
    color: "#666", // Gray text for message
  },
  badge: {
    backgroundColor: "#007bff", // Blue badge
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff", // White text for badge
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default HomePageStyle;
