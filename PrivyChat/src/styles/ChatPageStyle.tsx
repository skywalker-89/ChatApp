import { StyleSheet } from "react-native";

const ChatPageStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7", // Light background for a clean look
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginHorizontal: 20,
    textAlign: "center",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: "#e1ffc7",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderTopWidth: 0,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: "#f9f9f9",
    marginTop: 20,
    marginBottom: 50,
  },
  sendButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 50,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ChatPageStyle;
