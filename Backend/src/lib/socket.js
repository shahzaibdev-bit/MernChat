import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Create a Socket.IO server and allow requests from the frontend at localhost:5173
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// Function to get the receiver's socket ID using their userId
export function getReciverSocketId(userId) {
  return userSocketMap[userId];
}

// Object to store online users: maps userId => socket.id
const userSocketMap = {};

//! Runs when a new user connects to the socket server
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Get the userId from the connection query (sent from frontend)
  const userId = socket.handshake.query.userId;
  // If userId exists, save the socket.id against it
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Send the updated list of online userIds to all connected clients
  io.emit("getOnlineUser", Object.keys(userSocketMap));
  // io.emit sends a message/event to all connected clients

  // When a user disconnects (closes tab, refreshes, etc.)
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);

    // Remove the user's socket ID from the map
    delete userSocketMap[userId];

    // Notify all clients about the updated online user list
    io.emit("getOnlineUser", Object.keys(userSocketMap));
  });
});

export { io, server, app };
