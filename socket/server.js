const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const cloudinary = require("../PrivyChat_auth/config/cloudinary");

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
let userRooms = {}; // Track which room a user is in
let roomUsers = {}; // Track users in each room (roomId -> [userId1, userId2, ...])

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Store user information for socket notifications
  socket.on("register_user", (userId) => {
    users[userId] = { socketId: socket.id }; // Save socket ID and username for the user
    console.log(`User (${userId}) registered with socket ID: ${socket.id}`);
  });

  // Handle room joining
  socket.on("join_room", ({ roomId, userId }) => {
    console.log(`User ${userId} joined room: ${roomId}`);

    // Ensure the user joins the correct room
    socket.join(roomId); // The user joins the room
    socket.room = roomId; // Save room info for the socket

    // Add the user to the room's user list
    if (!roomUsers[roomId]) {
      roomUsers[roomId] = []; // Create the array if it doesn't exist
    }
    if (!roomUsers[roomId].includes(userId)) {
      roomUsers[roomId].push(userId); // Add the user to the room
    }

    console.log(`Users in room ${roomId}:`, roomUsers[roomId]);

    // Create a folder in Cloudinary by uploading a dummy file to the roomId folder
    cloudinary.uploader
      .upload("dummy.jpg", {
        folder: `rooms/${roomId}`, // Folder name will be rooms/roomId (e.g., rooms/6_7)
      })
      .then((result) => {
        console.log(`Folder for room ${roomId} created successfully`);
      })
      .catch((err) => {
        // Handle any errors that may occur
        if (err.message.includes("already exists")) {
          console.log(`Folder for room ${roomId} already exists.`);
        } else {
          console.error("Error creating Cloudinary folder:", err);
        }
      });
  });

  socket.on("send_message", (data) => {
    const { room, type, text, sender, mediaUrl } = data;

    console.log(
      `Message received in room ${room}: ${
        type === "image" ? "Image" : type === "audio" ? "Audio" : text
      }`
    );

    // Broadcast the message to everyone in the room except the sender
    socket.to(room).emit("receive_message", { type, text, sender, mediaUrl });
  });

  // delete folder
  const deleteCloudinaryFolder = (roomId) => {
    // Delete all assets (images, videos, etc.) in the folder
    const deleteResources = async (resourceType) => {
      cloudinary.api.delete_resources_by_prefix(
        `rooms/${roomId}/`,
        { resource_type: resourceType }, // Specify resource type explicitly
        (err, result) => {
          if (err) {
            console.error(
              `Error deleting resources (type: ${resourceType}) in folder rooms/${roomId}:`,
              err
            );
          } else {
            console.log(
              `Resources (type: ${resourceType}) in folder rooms/${roomId} deleted successfully.`,
              result
            );

            // After deleting resources, try deleting the folder
            cloudinary.api.delete_folder(`rooms/${roomId}`, (err, result) => {
              if (err) {
                console.error(
                  `Error deleting Cloudinary folder rooms/${roomId}:`,
                  err
                );
              } else {
                console.log(
                  `Cloudinary folder rooms/${roomId} deleted successfully.`
                );
              }
            });
          }
        }
      );
    };

    // Delete resources for both "image" and "video" types
    deleteResources("image");
    deleteResources("video");
  };

  // Handle disconnection and folder cleanup
  socket.on("disconnect_room", ({ roomId, userId }) => {
    console.log(`User disconnected from room: ${roomId}`);

    // Remove the user from the room's user list
    if (roomUsers[roomId]) {
      roomUsers[roomId] = roomUsers[roomId].filter((id) => id !== userId);

      console.log(`Updated users in room ${roomId}:`, roomUsers[roomId]);

      // If no users are left in the room, delete the folder in Cloudinary
      if (roomUsers[roomId].length === 0) {
        // No users left in the room, delete the folder in Cloudinary
        deleteCloudinaryFolder(roomId); // Call the delete function to clean up resources and folder

        // Clean up the room data
        delete roomUsers[roomId];
      }
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
