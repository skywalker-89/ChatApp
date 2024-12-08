import { StyleSheet } from "react-native";

const AccountPageStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f4f4f7", // Soft off-white background for a clean, modern look
    paddingTop: 70,
    paddingBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // Circular profile image
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#007bff", // Add a subtle border around the profile image
    shadowColor: "#007bff",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  userName: {
    fontSize: 24,
    fontWeight: "700", // Slightly bolder font for emphasis
    color: "#333",
    marginBottom: 8,
  },
  userId: {
    fontSize: 16,
    fontWeight: "400", // Lighter weight for the ID
    color: "#888", // Lighter color for secondary info
    marginBottom: 20,
  },
  optionsContainer: {
    width: "90%",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12, // Softer rounded corners
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    alignItems: "center",
    justifyContent: "center",
  },
  optionButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007bff", // Consistent color theme for buttons
  },
  optionButtonLogout: {
    backgroundColor: "#ff4d4f", // Red for logout for emphasis
    borderColor: "#ff4d4f",
    borderWidth: 1,
  },
  optionButtonLogoutText: {
    color: "#fff", // White text for contrast
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 30,
    marginBottom: 10,
  },
});

export default AccountPageStyle;
