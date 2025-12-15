import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/* ============================================================
   CREATE CONNECTION (Send Request)
   ============================================================ */
router.post("/create", auth, async (req, res) => {
    try {
        const { target_user_id } = req.body;

        if (!target_user_id) {
            return res.status(400).json({ message: "Target user ID is required" });
        }

        // Check if connection already exists
        const [existing] = await db.query(
            "SELECT * FROM connections WHERE user_id = ? AND target_user_id = ?",
            [req.user.id, target_user_id]
        );

        if (existing.length > 0) {
            return res.json({ success: true, message: "Request already sent" });
        }

        // Create the connection (Request)
        await db.query(
            "INSERT INTO connections (user_id, target_user_id) VALUES (?, ?)",
            [req.user.id, target_user_id]
        );

        // Check for mutual (did they already add me?)
        const [reverse] = await db.query(
            "SELECT * FROM connections WHERE user_id = ? AND target_user_id = ?",
            [target_user_id, req.user.id]
        );

        const isMutual = reverse.length > 0;

        res.json({ success: true, message: "Connection request sent", isMutual });
    } catch (err) {
        console.error("Error creating connection:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   GET PENDING REQUESTS (People who added me, but I haven't added back)
   ============================================================ */
router.get("/requests", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const [requests] = await db.query(
            `SELECT p.*, u.email
             FROM connections c
             INNER JOIN profiles p ON p.user_id = c.user_id
             INNER JOIN users u ON u.id = p.user_id
             WHERE c.target_user_id = ? 
             AND NOT EXISTS (
                 SELECT 1 FROM connections m 
                 WHERE m.user_id = ? AND m.target_user_id = c.user_id
             )`,
            [userId, userId]
        );
        res.json(requests);
    } catch (err) {
        console.error("Error fetching requests:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   ACCEPT REQUEST (Same as create, just semantic wrapper)
   ============================================================ */
router.post("/accept", auth, async (req, res) => {
    try {
        const { target_user_id } = req.body;
        // Logic is identical to create: insert my row
        const [existing] = await db.query(
            "SELECT * FROM connections WHERE user_id = ? AND target_user_id = ?",
            [req.user.id, target_user_id]
        );
        if (existing.length === 0) {
            await db.query(
                "INSERT INTO connections (user_id, target_user_id) VALUES (?, ?)",
                [req.user.id, target_user_id]
            );
        }
        res.json({ success: true, message: "Connection accepted" });
    } catch (err) {
        console.error("Error accepting request:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   REJECT REQUEST (Delete the incoming row)
   ============================================================ */
router.post("/reject", auth, async (req, res) => {
    try {
        const { target_user_id } = req.body;
        // Delete the row where THEY connected to ME
        await db.query(
            "DELETE FROM connections WHERE user_id = ? AND target_user_id = ?",
            [target_user_id, req.user.id]
        );
        res.json({ success: true, message: "Request rejected" });
    } catch (err) {
        console.error("Error rejecting request:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   GET MY CONNECTIONS (Mutual Only - for 'My Connections' list)
   ============================================================ */
router.get("/", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const [mutualConnections] = await db.query(
            `SELECT DISTINCT p.*, u.email,
              (SELECT CASE WHEN content IS NOT NULL AND content != '' THEN content ELSE '[Attachment]' END FROM messages m 
               WHERE (m.sender_id = ? AND m.receiver_id = p.user_id) 
                  OR (m.sender_id = p.user_id AND m.receiver_id = ?)
               ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM messages m 
               WHERE (m.sender_id = ? AND m.receiver_id = p.user_id) 
                  OR (m.sender_id = p.user_id AND m.receiver_id = ?)
               ORDER BY created_at DESC LIMIT 1) as last_message_time,
              (SELECT COUNT(*) FROM messages m
               WHERE m.sender_id = p.user_id AND m.receiver_id = ? AND m.is_read = FALSE) as unread_count
             FROM connections c1
             INNER JOIN connections c2 
               ON c1.user_id = c2.target_user_id 
               AND c1.target_user_id = c2.user_id
             INNER JOIN profiles p ON p.user_id = c1.target_user_id
             INNER JOIN users u ON u.id = p.user_id
             WHERE c1.user_id = ?`,
            [userId, userId, userId, userId, userId, userId]
        );
        res.json(mutualConnections);
    } catch (err) {
        console.error("Error fetching connections:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   REMOVE CONNECTION (Disconnect)
   ============================================================ */
router.delete("/:target_user_id", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const targetUserId = req.params.target_user_id;

        // Delete MY row (this breaks the mutual link)
        await db.query(
            "DELETE FROM connections WHERE user_id = ? AND target_user_id = ?",
            [userId, targetUserId]
        );

        // Delete THEIR row too (complete disconnection)
        await db.query(
            "DELETE FROM connections WHERE user_id = ? AND target_user_id = ?",
            [targetUserId, userId]
        );

        res.json({ success: true, message: "Connection removed" });
    } catch (err) {
        console.error("Error removing connection:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   GET CONNECTION COUNT (Public)
   ============================================================ */
router.get("/count/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const [result] = await db.query(
            `SELECT COUNT(*) as count 
            FROM connections c1
            INNER JOIN connections c2 
              ON c1.user_id = c2.target_user_id 
              AND c1.target_user_id = c2.user_id
            WHERE c1.user_id = ?`,
            [userId]
        );
        res.json({ count: result[0].count });
    } catch (err) {
        console.error("Error fetching connection count:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
