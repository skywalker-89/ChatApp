import { StyleSheet } from "react-native";

const ChatPageStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9", // Soft light background for a clean, modern feel
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700", // Bolder title for emphasis
    color: "#333",
    marginVertical: 15,
    textAlign: "center",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: "flex-end", // Ensure messages are at the bottom
  },
  message: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginVertical: 8,
    maxWidth: "80%",
    alignSelf: "flex-start",
    backgroundColor: "#ffffff", // Default message color
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  myMessage: {
    backgroundColor: "#007BFF", // Blue color for own messages
    alignSelf: "flex-end",
  },
  myMessageText: {
    color: "#fff", // White text for own messages
    fontSize: 16,
  },
  theirMessage: {
    backgroundColor: "#f1f1f1", // Light gray for received messages
    borderColor: "#ddd",
    borderWidth: 1,
  },
  theirMessageText: {
    color: "#333", // Dark text for received messages
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "#fff", // Solid white background for the input area
    borderTopWidth: 1,
    borderTopColor: "#ddd", // Light border for separation
    paddingVertical: 12,
    justifyContent: "space-between", // Aligns input field and send button nicely
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 }, // Add a little shadow to the input area for depth
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9", // Light gray background for input
    fontSize: 16,
    color: "#333",
    marginRight: 5,
    marginBottom: 10,
  },
  sendButton: {
    padding: 10,
    backgroundColor: "#007BFF", // Vibrant blue for the mic button
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 18,
    color: "#ff4d4f",
    fontWeight: "bold",
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
  },
  voiceMessageButton: {
    marginLeft: 5,
    padding: 10,
    backgroundColor: "#007BFF", // Vibrant blue for the mic button
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
    marginHorizontal: 2,
  },
  imageMessageButton: {
    marginLeft: 5,
    padding: 10,
    backgroundColor: "#007BFF", // Vibrant blue for the mic button
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
    // marginHorizontal: 2,
  },
  micButtonText: {
    fontSize: 18, // Increase size for mic icon
    color: "#fff",
  },
  recordingContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF", // Slight gray background for recording mode
    padding: 10,
    borderRadius: 30,
  },
  recordingAnimation: {
    height: 6,
    backgroundColor: "#FF5722", // Bright orange to indicate recording
    borderRadius: 3,
    marginTop: 10,
    transition: "width 0.5s", // Smooth width transition
  },
  recordingText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 5,
  },

  duringRecord: {
    marginLeft: 5,
    padding: 5,
    backgroundColor: "#fff", // Vibrant blue for the mic button
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    marginBottom: -1,
    marginHorizontal: 2,
  },
  myAudioMessageContainer: {
    width: 100,
    height: 30,
    backgroundColor: "#007BFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  theirAudioMessageContainer: {
    width: 100,
    height: 30,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
});

export default ChatPageStyle;
