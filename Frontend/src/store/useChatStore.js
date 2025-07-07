import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoding: false,

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const response = await axiosInstance.get("/messages/users");
      set({ users: response.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoding: true });
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: response.data }); // ✅ fixed missing await
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoding: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();

    // ✅ Guard against null selected user
    if (!selectedUser) {
      toast.error("No user selected to send message");
      throw new Error("No selected user");
    }

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      set({ messages: [...messages, res.data] });
      return res.data; // ✅ return result so caller knows it's successful
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
      throw error; // ✅ rethrow to allow form to detect failure
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) {
      return;
    }

    const socket = useAuthStore.getState().socket; // 🔌 Get the active socket connection from the auth store

    // 🔔 Listen for the 'newMessage' event sent from the server via socket.io
    socket.on("newMessage", (newMessage) => {
      // 📩 Only process the message if it's from the selected chat user
      if (newMessage.senderId !== selectedUser._id) {
        return;
      }

      // 🧠 Append the real-time incoming message to the current message list
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unSubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    // 📴 Remove the socket listener to prevent memory leaks and duplication
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
