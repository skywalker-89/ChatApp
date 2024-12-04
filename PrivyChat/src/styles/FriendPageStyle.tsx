import { StyleSheet } from "react-native";

const FriendPageStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
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
    height: 40,
    borderRadius: 10,
    backgroundColor: "#e8e8e8",
    paddingHorizontal: 15,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#007bff",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
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
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    overflow: "hidden",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  friendOrganization: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  unfriendButton: {
    backgroundColor: "#ff4d4f", // Red for unfriend button
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 81.5, // Ensure it matches the height of the friendItem
    borderRadius: 8, // Maintain rounded corners
    paddingHorizontal: 10, // Adjust padding for a consistent look
  },
  unfriendText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: "#ffa500", // Red for unfriend button
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 81.5, // Ensure it matches the height of the friendItem
    borderRadius: 8, // Maintain rounded corners
    paddingHorizontal: 10, // Adjust padding for a consistent look
  },
  editText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default FriendPageStyle;
