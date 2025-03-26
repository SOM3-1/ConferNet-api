const express = require("express");
const multer = require("multer");
const { uploadFileToAzure, deleteFileFromAzure } = require("./../utils/azureBlob");
const { db } = require("../../firebaseConfig");

const router = express.Router();
const upload = multer();

/**
 * @swagger
 * /keynote/upload/{eventId}/{userId}:
 *   post:
 *     summary: Upload a keynote speaker file
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       500:
 *         description: Internal server error
 */
router.post("/upload/:eventId/:userId", upload.single("file"), async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    const file = req.file;

    const fileUrl = await uploadFileToAzure(file);

    const fileMeta = {
      url: fileUrl,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
    };

    await db.collection("events").doc(eventId)
      .collection("speakerFiles").add(fileMeta);

    res.status(201).json({ message: "File uploaded successfully", fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /keynote/delete/{eventId}/{userId}:
 *   delete:
 *     summary: Delete a keynote speaker file
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: file
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             fileUrl:
 *               type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       500:
 *         description: Internal server error
 */
router.delete("/delete/:eventId/:userId", async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    const { fileUrl } = req.body;

    await deleteFileFromAzure(fileUrl);

    const filesRef = db.collection("events").doc(eventId).collection("speakerFiles");
    const snapshot = await filesRef.where("url", "==", fileUrl).where("uploadedBy", "==", userId).get();

    snapshot.forEach(doc => doc.ref.delete());

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /keynote/files/{eventId}:
 *   get:
 *     summary: Get all keynote speaker files for an event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of files
 *       500:
 *         description: Internal server error
 */
router.get("/files/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const snapshot = await db.collection("events")
      .doc(eventId).collection("speakerFiles").get();

    const files = snapshot.docs.map(doc => doc.data());
    res.status(200).json({ files });
  } catch (err) {
    console.error("Fetch files error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router; 
