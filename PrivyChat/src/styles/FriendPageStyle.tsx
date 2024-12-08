import { StyleSheet } from "react-native";

const FriendPageStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9fb", // Light background for a clean look
    paddingHorizontal: 15,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    height: 45,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#dcdcdc", // Subtle border for depth
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  addButton: {
    backgroundColor: "#007bff",
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    elevation: 6,
    shadowColor: "#007bff",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  friendList: {
    flex: 1,
    marginTop: 10,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eaeaea", // Subtle border for definition
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    position: "relative", // Ensure position is relative for the dot
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#dddddd",
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333", // Darker color for text
  },
  friendOrganization: {
    fontSize: 14,
    color: "#888888",
    marginTop: 4,
  },
  unfriendButton: {
    backgroundColor: "#ff4d4f",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 81.5,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#ff4d4f",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  unfriendText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: "#ff9800",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 81.5,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#ff9800",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  editText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 12,
    backgroundColor: "green", // You can use 'red' or 'green' for online/offline status
    position: "absolute",
    // top: 3, // Position it at the top-right corner of the profile image
    // right: 3, // Position it at the top-right corner of the profile image
    borderWidth: 1,
    borderColor: "#ffffff", // Add a white border to make it stand out on different backgrounds
  },
});

export default FriendPageStyle;
