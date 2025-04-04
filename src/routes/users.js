const express = require("express");
const { db } = require("../../firebaseConfig");
const admin = require("firebase-admin");
const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of all users
 *     description: Fetches all registered users from the database.
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique user ID.
 *                   name:
 *                     type: string
 *                     description: The name of the user.
 *                   email:
 *                     type: string
 *                     description: The email of the user.
 *       404:
 *         description: No users found.
 *       500:
 *         description: Server error.
 */
router.get("/", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    if (usersSnapshot.empty) {
      return res.status(404).json({ message: "No users found" });
    }

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{userId}/bookmark/{sessionId}:
 *   post:
 *     summary: Bookmark a session
 *     description: Adds a session to the user's savedSessions array.
 */
router.post("/:userId/bookmark/:sessionId", async (req, res) => {
  try {
    const { userId, sessionId } = req.params;

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const savedSessions = userDoc.data().savedSessions || [];
    if (savedSessions.includes(sessionId)) {
      return res.status(400).json({ error: "Session already bookmarked" });
    }

    await userRef.update({
      savedSessions: admin.firestore.FieldValue.arrayUnion(sessionId)
    });

    res.status(201).json({ message: "Session bookmarked successfully." });
  } catch (error) {
    console.error("Error bookmarking session:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /users/{userId}/bookmark/{sessionId}:
 *   delete:
 *     summary: Remove a bookmarked session
 */
router.delete("/:userId/bookmark/:sessionId", async (req, res) => {
  try {
    const { userId, sessionId } = req.params;

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const savedSessions = userDoc.data().savedSessions || [];
    if (!savedSessions.includes(sessionId)) {
      return res.status(404).json({ error: "Session not bookmarked" });
    }

    await userRef.update({
      savedSessions: savedSessions.filter(s => s !== sessionId)
    });

    res.status(200).json({ message: "Session removed from bookmarks." });
  } catch (error) {
    console.error("Error removing bookmarked session:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /users/{userId}/bookmarks:
 *   get:
 *     summary: Retrieve all bookmarked sessions
 */
router.get("/:userId/bookmarks", async (req, res) => {
  try {
    const { userId } = req.params;

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const savedSessions = userDoc.data().savedSessions || [];
    if (savedSessions.length === 0) {
      return res.status(200).json({ sessions: [] });
    }

    const sessionPromises = savedSessions.map(sessionId => db.collection("sessions").doc(sessionId).get());
    const sessionDocs = await Promise.all(sessionPromises);

    const sessions = sessionDocs
      .filter(doc => doc.exists)
      .map(doc => ({ sessionId: doc.id, ...doc.data() }));

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error retrieving bookmarked sessions:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      return res.status(404).json({ message: "No users found" });
    }

    const batch = db.batch();
    usersSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    res.status(200).json({ message: "All users deleted successfully." });
  } catch (error) {
    console.error("Error deleting all users:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:userId/bookmark-event/:eventId", async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const savedEvents = userDoc.data().savedEvents || [];
    if (savedEvents.includes(eventId)) {
      return res.status(400).json({ error: "Event already bookmarked" });
    }

    await userRef.update({
      savedEvents: admin.firestore.FieldValue.arrayUnion(eventId)
    });

    res.status(201).json({ message: "Event bookmarked successfully." });
  } catch (error) {
    console.error("Error bookmarking event:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:userId/bookmark-event/:eventId", async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const savedEvents = userDoc.data().savedEvents || [];
    if (!savedEvents.includes(eventId)) {
      return res.status(404).json({ error: "Event not bookmarked" });
    }

    await userRef.update({
      savedEvents: savedEvents.filter(e => e !== eventId)
    });

    res.status(200).json({ message: "Event removed from bookmarks." });
  } catch (error) {
    console.error("Error removing bookmarked event:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId/bookmarked-events", async (req, res) => {
  try {
    const { userId } = req.params;

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const savedEvents = userDoc.data().savedEvents || [];
    if (savedEvents.length === 0) {
      return res.status(200).json({ events: [] });
    }

    const eventPromises = savedEvents.map(eventId => db.collection("events").doc(eventId).get());
    const eventDocs = await Promise.all(eventPromises);

    const events = eventDocs
      .filter(doc => doc.exists)
      .map(doc => ({ eventId: doc.id, ...doc.data() }));

    res.status(200).json({ events });
  } catch (error) {
    console.error("Error retrieving bookmarked events:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * @swagger
 * /users/{userId}/join-event/{eventId}:
 *   post:
 *     summary: User joins an event
 *     description: Adds the event ID to the user's registeredEvents array.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: User joined event successfully.
 *       400:
 *         description: Already joined or missing data.
 *       500:
 *         description: Server error.
 */
router.post("/:userId/join-event/:eventId", async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const registeredEvents = userDoc.data().registeredEvents || [];
    if (registeredEvents.includes(eventId)) {
      return res.status(400).json({ error: "User already joined this event" });
    }

    await userRef.update({
      registeredEvents: admin.firestore.FieldValue.arrayUnion(eventId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection("events")
      .doc(eventId)
      .collection("attendees")
      .doc(userId)
      .set({ userId, joinedAt: admin.firestore.FieldValue.serverTimestamp() });


    res.status(201).json({ message: "User joined the event successfully" });
  } catch (error) {
    console.error("Join event error:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /users/{userId}/leave-event/{eventId}:
 *   delete:
 *     summary: User leaves an event
 *     description: Removes the event ID from the user's registeredEvents array.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User left the event successfully.
 *       400:
 *         description: Event not joined.
 *       500:
 *         description: Server error.
 */
router.delete("/:userId/leave-event/:eventId", async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const registeredEvents = userDoc.data().registeredEvents || [];
    if (!registeredEvents.includes(eventId)) {
      return res.status(400).json({ error: "User has not joined this event" });
    }

    await userRef.update({
      registeredEvents: registeredEvents.filter(e => e !== eventId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await db.collection("events")
      .doc(eventId)
      .collection("attendees")
      .doc(userId)
      .delete();


    res.status(200).json({ message: "User left the event successfully" });
  } catch (error) {
    console.error("Leave event error:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId/registered-events", async (req, res) => {
  try {
    const { userId } = req.params;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return res.status(404).json({ error: "User not found" });

    const registeredEvents = userDoc.data().registeredEvents || [];

    const eventDocs = await Promise.all(
      registeredEvents.map(eventId => db.collection("events").doc(eventId).get())
    );

    const events = eventDocs
      .filter(doc => doc.exists)
      .map(doc => ({ eventId: doc.id, ...doc.data() }));

    res.status(200).json({ events });
  } catch (error) {
    console.error("Error getting registered events:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /users/by-ids:
 *   post:
 *     summary: Get users by an array of userIds
 *     description: Fetches user documents based on an array of user IDs.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: List of users
 *       400:
 *         description: Missing or invalid userIds
 *       500:
 *         description: Server error
 */
router.post("/multiple-users/by-ids", async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "userIds array is required" });
    }

    const userPromises = userIds.map((id) => db.collection("users").doc(id).get());
    const userDocs = await Promise.all(userPromises);

    const users = userDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users by IDs:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Retrieve a specific user by ID
 *     description: Fetches the details of a user by their userId.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the user.
 *     responses:
 *       200:
 *         description: The user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique user ID.
 *                 name:
 *                   type: string
 *                   description: The name of the user.
 *                 email:
 *                   type: string
 *                   description: The email of the user.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;