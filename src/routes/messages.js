const express = require("express");
const { db } = require("../../firebaseConfig");

const router = express.Router();

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a message between users
 *     description: Stores a message in the conversation subcollection and updates the conversation document.
 */
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const conversationId = [senderId, receiverId].sort().join("_");

    const messageData = {
      senderId,
      receiverId,
      message,
      timestamp: new Date(),
    };

    await db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .add(messageData);

    await db
      .collection("conversations")
      .doc(conversationId)
      .set(
        {
          participants: [senderId, receiverId],
          lastMessage: message,
          lastSender: senderId,
          timestamp: new Date(),
        },
        { merge: true }
      );

    res.status(201).json(messageData);
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /messages/{userId}/conversations:
 *   get:
 *     summary: Retrieve all users a user has messaged
 *     description: Fetches all conversations where the user is a participant.
 */
router.get("/:userId/conversations", async (req, res) => {
  try {
    const { userId } = req.params;

    const conversationsSnapshot = await db
      .collection("conversations")
      .where("participants", "array-contains", userId)
      .orderBy("timestamp", "desc")
      .get();

    if (conversationsSnapshot.empty) {
      return res.status(404).json({ message: "No conversations found." });
    }

    const conversations = conversationsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const otherUserId = data.participants.find((p) => p !== userId);

      return {
        id: doc.id,
        otherUserId,
        lastMessage: data.lastMessage,
        lastSender: data.lastSender,
        timestamp: data.timestamp,
      };
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /messages/{user1}/{user2}/history:
 *   get:
 *     summary: Retrieve chat history between two users
 *     description: Fetches messages between two users.
 */
router.get("/:user1/:user2/history", async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const conversationId = [user1, user2].sort().join("_");

    const messagesSnapshot = await db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .get();

    if (messagesSnapshot.empty) {
      return res.status(404).json({ message: "No messages found." });
    }

    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching chat history:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
