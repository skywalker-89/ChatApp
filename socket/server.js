const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

app.use(cors());

const server = http.createServer(app);

const CURRENTIP = process.env.CURRENTIP;
const io = new Server(server, {
  cors: {
    origin: `http://${CURRENTIP}:3000`, // React Native URL or the appropriate one
    methods: ["GET", "POST"],
  },
});

let users = {}; // Store user socket ids and user info

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Store user information for socket notifications
  socket.on("register_user", (userId, username) => {
    users[userId] = { socketId: socket.id, username }; // Save socket ID and username for the user
    console.log(
      `User ${username} (${userId}) registered with socket ID: ${socket.id}`
    );
  });

  // Handle room joining
  socket.on("join_room", ({ roomId, userId }) => {
    console.log(`User ${userId} joined room: ${roomId}`);
    socket.join(roomId); // Ensure the user joins the correct room
    socket.room = roomId; // Save room info for the socket
  });

  // Handle message sending
  socket.on("send_message", (data) => {
    const { room, text, sender } = data;
    console.log(`Message received in room ${room}: ${text}`);

    // Broadcast the message to everyone in the room except the sender
    socket.to(room).emit("receive_message", { text, sender });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
    // Remove user from the list when disconnected
    for (let userId in users) {
      if (users[userId].socketId === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
