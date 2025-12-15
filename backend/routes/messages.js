import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/* ============================================================
   SEND MESSAGE
   ============================================================ */
router.post("/send", auth, upload.single("file"), async (req, res) => {
  try {
    console.log("Sending message:", req.body);
    const { receiver_id, content } = req.body;
    const file = req.file;

    if (!receiver_id || (!content && !file)) {
      return res.status(400).json({ message: "Receiver ID and content or file are required" });
    }

    // Check if blocked
    const [blocked] = await db.query(
      "SELECT * FROM blocked_users WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)",
      [req.user.id, receiver_id, receiver_id, req.user.id]
    );

    if (blocked.length > 0) {
      return res.status(403).json({ message: "Cannot send message. User is blocked or has blocked you." });
    }

    // Check for mutual connection
    const [connection] = await db.query(
      `SELECT 1 
       FROM connections c1
       JOIN connections c2 ON c1.user_id = c2.target_user_id AND c1.target_user_id = c2.user_id
       WHERE c1.user_id = ? AND c1.target_user_id = ?`,
      [req.user.id, receiver_id]
    );

    if (connection.length === 0) {
      return res.status(403).json({ message: "You must be connected to send a message." });
    }

    let attachment_url = null;
    let attachment_type = null;

    if (file) {
      attachment_url = `/uploads/${file.filename}`;
      attachment_type = file.mimetype;
    }

    await db.query(
      "INSERT INTO messages (sender_id, receiver_id, content, attachment_url, attachment_type) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, receiver_id, content || "", attachment_url, attachment_type]
    );

    res.json({ success: true, message: "Message sent", attachment_url, attachment_type });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   GET MESSAGES WITH USER
   ============================================================ */
router.get("/history/:otherUserId", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;
    console.log(`Fetching messages between ${userId} and ${otherUserId}`);

    const [messages] = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [userId, otherUserId, otherUserId, userId]
    );

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   MARK MESSAGES AS READ
   ============================================================ */
router.post("/mark-read/:otherUserId", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;

    await db.query(
      "UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE",
      [otherUserId, userId]
    );

    res.json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    console.error("Error marking messages as read:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
