import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/* ============================================================
   BLOCK USER
   ============================================================ */
router.post("/block", auth, async (req, res) => {
    try {
        const { target_user_id } = req.body;

        if (!target_user_id) {
            return res.status(400).json({ message: "Target user ID is required" });
        }

        if (parseInt(target_user_id) === req.user.id) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        // Check if already blocked
        const [existing] = await db.query(
            "SELECT * FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?",
            [req.user.id, target_user_id]
        );

        if (existing.length > 0) {
            return res.json({ success: true, message: "User already blocked" });
        }

        // Block the user
        await db.query(
            "INSERT INTO blocked_users (blocker_id, blocked_id) VALUES (?, ?)",
            [req.user.id, target_user_id]
        );

        res.json({ success: true, message: "User blocked successfully" });
    } catch (err) {
        console.error("Error blocking user:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   UNBLOCK USER
   ============================================================ */
router.post("/unblock", auth, async (req, res) => {
    try {
        const { target_user_id } = req.body;

        if (!target_user_id) {
            return res.status(400).json({ message: "Target user ID is required" });
        }

        // Unblock the user
        await db.query(
            "DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?",
            [req.user.id, target_user_id]
        );

        res.json({ success: true, message: "User unblocked successfully" });
    } catch (err) {
        console.error("Error unblocking user:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   CHECK IF BLOCKED
   ============================================================ */
router.get("/check/:targetUserId", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const targetUserId = req.params.targetUserId;

        // Check if I blocked them
        const [iBlocked] = await db.query(
            "SELECT * FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?",
            [userId, targetUserId]
        );

        // Check if they blocked me
        const [theyBlocked] = await db.query(
            "SELECT * FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?",
            [targetUserId, userId]
        );

        res.json({
            iBlocked: iBlocked.length > 0,
            theyBlocked: theyBlocked.length > 0,
            isBlocked: iBlocked.length > 0 || theyBlocked.length > 0
        });
    } catch (err) {
        console.error("Error checking block status:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
