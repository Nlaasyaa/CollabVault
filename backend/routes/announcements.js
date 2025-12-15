import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/announcements - Fetch all announcements
router.get("/", auth, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM announcements ORDER BY is_pinned DESC, created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
