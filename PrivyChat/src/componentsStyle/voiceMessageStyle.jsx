import { StyleSheet } from "react-native";

const VoiceMessageStyle = StyleSheet.create({
  voiceMessageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  voiceMessageButton: {
    backgroundColor: "#007BFF",
    borderRadius: 50,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default VoiceMessageStyle;
