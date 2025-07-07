import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.Mode === "development"? "http://localhost:5001":"/";

// This Zustand store manages authentication and real-time socket connection state.
// It handles login, signup, logout, checking auth, and syncing online users using socket.io.

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningup: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    // When the app loads or refreshes, this checks if the user is still logged in (auth session).
    // If the user is logged in, it stores user data in the auth store and connects to the socket server.
    try {
      const response = await axiosInstance.get("/auth/check");
      set({ authUser: response.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    // Sends signup data to backend.
    // On success, saves the user in the auth store and connects to the socket server.
    // Shows success or error toast messages accordingly.
    set({ isSigningup: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created Successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningup: false });
    }
  },

  logout: async () => {
    // Sends logout request to backend.
    // On success, removes user from the auth store and disconnects socket connection.
    // Shows success or error toast.
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out Succesfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  login: async (data) => {
    // Sends login credentials to backend.
    // If login is successful, saves user data and connects to socket server.
    // Shows toast messages for success or failure.
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    // Sends profile update request to backend.
    // If successful, updates the user data in the auth store.
    // Shows a success or error toast.
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated SuccessFully");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    // Connects to the Socket.IO server using the logged-in user's ID.
    // Prevents multiple connections if one is already active.
    // On successful connection, listens for "getOnlineUser" event from server.
    // Stores the list of online user IDs in the state.

    const { authUser } = get();
    if (!authUser || get().socket?.connected) {
      return;
    }

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id, // Sends the userId in the socket connection query to help the backend identify this user.
      },
    });

    socket.connect(); // Connects the socket.
    set({ socket: socket }); // Stores the connected socket in the state.

    socket.on("getOnlineUser", (userIds) => {
      // Receives a list of online user IDs from the server (userSocketMap keys in socket.js) and stores them.
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    // If socket is connected, disconnect it and remove the connection.
    if (get().socket?.connected) {
      get().socket.disconnect();
    }
  },
}));
