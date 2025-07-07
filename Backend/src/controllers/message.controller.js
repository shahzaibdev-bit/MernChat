import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReciverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedUserId = req.user._id;

    const fillteredUsers = await User.find({
      _id: { $ne: loggedUserId },
    }).select("-password");
    //This tells moongose fetch all user from db but $ne(not equal) LoggedUserId means all user except current logged in user and select everything from those -(minus) password
    res.status(200).json(fillteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSlidebar:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      //$or is just a condition like in ifelse but in this case it is user to filter our search
      //Means find all the messages where i'm the sender and other is receiver also find find messages where i'm the reciver and other is sender this means the api is finding a full chat between me and another user where some times i send message and where some time i recieve message like a whats app chat
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      //upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReciverSocketId(receiverId);
    //This uses the function from your socket.js file to get the socket.id of the user you are sending a message to.
    // Example:
    // If receiverId = "abc123" and they are online, this returns something like "socket456".
    // If they're offline, receiverSocketId will be undefined.
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      //io.to(receiverSocketId)
      // Targets only that one specific user's socket connection.
      // .emit("newMessage", newMessage)
      // Sends a "newMessage" event with the message data.
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in newMessage:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
