import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js"; // Optional, depending on if you want to enforce login

const router = express.Router();

// POST /feedback - Submit feedback
router.post("/", auth, async (req, res) => {
    try {
        console.log("POST /feedback hit. Body:", req.body);
        console.log("User:", req.user);

        const { subject, message, rating } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!subject || !message) {
            console.log("Missing subject or message");
            return res.status(400).json({ error: "Subject and message are required" });
        }

        console.log("Executing insert query...");
        const [result] = await db.query(
            "INSERT INTO feedback (user_id, subject, message, rating) VALUES (?, ?, ?, ?)",
            [userId, subject, message, rating || null]
        );
        console.log("Insert result:", result);

        res.status(201).json({ message: "Feedback submitted successfully" });

    } catch (err) {
        console.error("Error submitting feedback:", err);
        res.status(500).json({ error: "Internal server error: " + err.message });
    }
});

// GET /feedback/history - Get my feedback history
router.get("/history", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            "SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching feedback history:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
