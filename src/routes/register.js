const express = require("express");
const { db } = require("../../firebaseConfig");
const admin = require("firebase-admin");

const router = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Adds a new user to Firestore, assigns them to a role, and updates the userRoles collection.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - name
 *               - email
 *               - dob
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The unique user ID from Firebase Auth.
 *                 example: "user123"
 *               name:
 *                 type: string
 *                 description: Full name of the user.
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 description: Email address of the user.
 *                 example: "john.doe@example.com"
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Date of birth (YYYY-MM-DD).
 *                 example: "1995-06-15"
 *               role:
 *                 type: integer
 *                 description: User role (1 = Admin, 2 = Organizer, 3 = Speaker, 4 = Attendee, 5 = Keynote Speaker).
 *                 example: 4
 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number.
 *                 example: "+1234567890"
 *               organization:
 *                 type: string
 *                 description: The company or institution the user is associated with.
 *                 example: "TechConf Inc."
 *               jobTitle:
 *                 type: string
 *                 description: User's job title.
 *                 example: "Software Engineer"
 *               country:
 *                 type: string
 *                 description: Country of residence.
 *                 example: "United States"
 *               city:
 *                 type: string
 *                 description: City of residence.
 *                 example: "New York"
 *               bio:
 *                 type: string
 *                 description: Short biography of the user.
 *                 example: "Tech enthusiast and speaker at various conferences."
 *               profilePicture:
 *                 type: string
 *                 format: url
 *                 description: URL of the user's profile picture.
 *                 example: "https://example.com/profile.jpg"
 *     responses:
 *       201:
 *         description: User registered successfully and added to userRoles.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully and added to userRoles."
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     dob:
 *                       type: string
 *                     role:
 *                       type: integer
 *                     phoneNumber:
 *                       type: string
 *                     organization:
 *                       type: string
 *                     jobTitle:
 *                       type: string
 *                     country:
 *                       type: string
 *                     city:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     profilePicture:
 *                       type: string
 *                     registeredEvents:
 *                       type: array
 *                       items:
 *                         type: string
 *                     sessionsBooked:
 *                       type: array
 *                       items:
 *                         type: string
 *                     notificationsEnabled:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing required fields (userId, name, email, or dob).
 *       500:
 *         description: Server error.
 */
router.post("/", async (req, res) => {
  try {
    const { userId, name, email, dob, role = 5, phoneNumber, organization, jobTitle, country, city, bio, profilePicture } = req.body;

    if (!userId || !name || !email ||!dob) {
      return res.status(400).json({ error: "Missing required fields: userId, name, email, or dob" });
    }

    const userRef = db.collection("users").doc(userId);
    
    const userData = {
      name,
      email,
      dob: dob || null,
      role,
      phoneNumber: phoneNumber || null,
      organization: organization || null,
      jobTitle: jobTitle || null,
      country: country || null,
      city: city || null,
      bio: bio || null,
      profilePicture: profilePicture || null,
      registeredEvents: [],
      sessionsBooked: [],
      notificationsEnabled: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await userRef.set(userData, { merge: true });

    const roleRef = db.collection("userRoles").doc(role.toString());

    await roleRef.set(
      {
        users: {
          [userId]: { name }
        }
      },
      { merge: true }
    );

    res.status(201).json({
      message: "User registered successfully and added to userRoles.",
      user: userData,
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
