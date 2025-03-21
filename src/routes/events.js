const express = require("express");
const { db } = require("../../firebaseConfig");
const admin = require("firebase-admin");

const router = express.Router();

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     description: Allows organizers to create a new conference event.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startDate
 *               - endDate
 *               - organizerId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               timezone:
 *                 type: string
 *               venue:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               venueMapUrl:
 *                 type: string
 *               organizerId:
 *                 type: string
 *               organizerName:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               keynoteSpeakers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     speakerId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     profilePicture:
 *                       type: string
 *               sessions:
 *                 type: array
 *                 items:
 *                   type: string
 *               registrationRequired:
 *                 type: boolean
 *               registrationFee:
 *                 type: number
 *               currency:
 *                 type: string
 *               paymentMethods:
 *                 type: string
 *                 items:
 *                   type: string
 *               maxAttendees:
 *                 type: number
 *     responses:
 *       201:
 *         description: Event created successfully.
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Internal server error.
 */
router.post("/", async (req, res) => {
    try {
        const { name, startDate, endDate, organizerId } = req.body;

        if (!name || !startDate || !endDate || !organizerId) {
            return res.status(400).json({ error: "Missing required fields: name, startDate, endDate, or organizerId" });
        }

        const eventData = {
            ...req.body,
            startDate: admin.firestore.Timestamp.fromDate(new Date(startDate)),
            endDate: admin.firestore.Timestamp.fromDate(new Date(endDate)),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const eventRef = await db.collection("events").add(eventData);

        res.status(201).json({ message: "Event created successfully", eventId: eventRef.id });
    } catch (error) {
        console.error("Error creating event:", error.stack);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     summary: Retrieve a single event by ID
 */
router.get("/:eventId", async (req, res) => {
    try {
        const { eventId } = req.params;
        const eventRef = db.collection("events").doc(eventId);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.status(200).json({ eventId, ...eventDoc.data() });
    } catch (error) {
        console.error("Error fetching event:", error.stack);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve all events
 */
router.get("/", async (req, res) => {
    try {
        const eventsSnapshot = await db.collection("events").orderBy("startDate", "asc").get();
        const events = eventsSnapshot.docs.map(doc => ({ eventId: doc.id, ...doc.data() }));

        res.status(200).json({ events });
    } catch (error) {
        console.error("Error fetching events:", error.stack);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /events/upcoming:
 *   get:
 *     summary: Retrieve upcoming events (Past 24h - Future)
 */
router.get("/upcoming", async (req, res) => {
    try {
        const now = admin.firestore.Timestamp.now();
        const past24h = admin.firestore.Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000);

        const eventsSnapshot = await db.collection("events")
            .where("startDate", ">=", past24h)
            .orderBy("startDate", "asc")
            .get();

        const events = eventsSnapshot.docs.map(doc => ({ eventId: doc.id, ...doc.data() }));

        res.status(200).json({ events });
    } catch (error) {
        console.error("Error fetching upcoming events:", error.stack);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /events/{eventId}:
 *   put:
 *     summary: Update an existing event
 */
router.put("/:eventId", async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!Object.keys(req.body).length) {
            return res.status(400).json({ error: "No fields to update" });
        }

        const eventRef = db.collection("events").doc(eventId);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).json({ error: "Event not found" });
        }

        await eventRef.update({ ...req.body, lastUpdated: admin.firestore.FieldValue.serverTimestamp() });

        res.status(200).json({ message: "Event updated successfully" });
    } catch (error) {
        console.error("Error updating event:", error.stack);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /events/{eventId}:
 *   delete:
 *     summary: Delete an event (Cascade delete sessions & attendees)
 */
router.delete("/:eventId", async (req, res) => {
    try {
        const { eventId } = req.params;
        const eventRef = db.collection("events").doc(eventId);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).json({ error: "Event not found" });
        }

        const batch = db.batch();
        const sessionsSnapshot = await db.collection(`events/${eventId}/sessions`).get();
        sessionsSnapshot.forEach(doc => batch.delete(doc.ref));

        const attendeesSnapshot = await db.collection(`events/${eventId}/attendees`).get();
        attendeesSnapshot.forEach(doc => batch.delete(doc.ref));

        batch.delete(eventRef);
        await batch.commit();

        res.status(200).json({ message: "Event and related data deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error.stack);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
