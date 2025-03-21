const express = require("express");
const { db } = require("../../firebaseConfig");

const router = express.Router();

/**
 * @swagger
 * /users-by-roleid/role/{roleId}:
 *   get:
 *     summary: Retrieve users by role
 *     description: Fetches a list of users belonging to a specific role.
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The role ID to fetch users for.
 *     responses:
 *       200:
 *         description: Users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         example: "user123"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "johndoe@example.com"
 *                       profilePicture:
 *                         type: string
 *                         example: "https://example.com/profile.jpg"
 *       400:
 *         description: Invalid role ID.
 *       404:
 *         description: No users found for this role.
 *       500:
 *         description: Server error.
 */
router.get("/role/:roleId", async (req, res) => {  
    try {
        const { roleId } = req.params;

        const roleNumber = Number(roleId);
        if (isNaN(roleNumber)) {
            return res.status(400).json({ error: "Invalid role ID. Must be a number." });
        }

        const usersSnapshot = await db.collection("users").where("role", "==", roleNumber).get();

        if (usersSnapshot.empty) {
            return res.status(404).json({ error: "No users found for this role." });
        }

        const users = usersSnapshot.docs.map((doc) => ({
            userId: doc.id,
            name: doc.data().name,
            email: doc.data().email,
            profilePicture: doc.data().profilePicture || null,
        }));

        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users by role:", error.stack);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
