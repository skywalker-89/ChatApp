import { StyleSheet } from "react-native";

const AccountPageStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingTop: 60,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  userId: {
    fontSize: 22,
    fontWeight: "light",
    color: "#333",
    marginBottom: 10,
  },
  // editButton: {
  //   backgroundColor: "#007bff",
  //   paddingVertical: 10,
  //   paddingHorizontal: 20,
  //   borderRadius: 8,
  //   marginBottom: 20,
  // },
  // editButtonText: {
  //   color: "#fff",
  //   fontSize: 16,
  //   fontWeight: "600",
  // },
  optionsContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
  },
  optionButtonText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "600",
  },
});

export default AccountPageStyle;
