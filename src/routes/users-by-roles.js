const express = require("express");
const { db } = require("../../firebaseConfig");

const router = express.Router();
/**
 * @swagger
 * /{roleId}:
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
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *       404:
 *         description: Role not found.
 *       500:
 *         description: Server error.
 */
router.get("/:roleId", async (req, res) => {
    try {
        const { roleId } = req.params;
        const roleRef = db.collection("userRoles").doc(roleId);
        const roleDoc = await roleRef.get();

        if (!roleDoc.exists) {
            return res.status(404).json({ error: "Role not found" });
        }

        res.status(200).json({ users: roleDoc.data().users || {} });
    } catch (error) {
        console.error("Error fetching users by role:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;