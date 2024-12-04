import { StyleSheet } from "react-native";

const RegisterPageStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4", // Matches the light theme
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333", // Dark text color for the title
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d", // Subtle gray for subtitle
    marginBottom: 30,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: "#007bff", // Green button for registration
    paddingVertical: 15,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  registerButtonText: {
    color: "#fff", // White text for the button
    fontSize: 16,
    fontWeight: "bold",
  },
  loginText: {
    fontSize: 14,
    color: "#6c757d",
  },
  loginLink: {
    color: "#007bff",
    fontWeight: "bold",
  },
  profilePictureContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePictureText: {
    color: "#6c757d",
    textAlign: "center",
    fontSize: 12,
  },
});

export default RegisterPageStyle;
