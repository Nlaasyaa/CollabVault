import express from "express";
import { db } from "../db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Check if user exists and verify password
router.post("/check-login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query("SELECT id, email, password_hash FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }

        const user = users[0];

        // Check if password_hash exists
        if (!user.password_hash) {
            return res.json({ success: false, message: "No password set for this user" });
        }

        // Verify password
        const match = await bcrypt.compare(password, user.password_hash);

        res.json({
            success: match,
            message: match ? "Password correct" : "Password incorrect",
            hasPasswordHash: !!user.password_hash
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check DB Connection & Stats
router.get("/db-check", async (req, res) => {
    try {
        const [users] = await db.query("SELECT COUNT(*) as count FROM users");
        const [feedback] = await db.query("SELECT COUNT(*) as count FROM feedback");

        // Host masking
        const dbHost = process.env.DB_HOST || "unknown";
        const maskedHost = dbHost.length > 10 ?
            `${dbHost.substring(0, 4)}...${dbHost.substring(dbHost.length - 4)}` :
            "local/short";

        res.json({
            status: "Connected",
            dbHost: maskedHost,
            dbName: process.env.DB_NAME || "not set",
            userCount: users[0].count,
            feedbackCount: feedback[0].count,
            env_api_url: process.env.NEXT_PUBLIC_API_URL || "not set"
        });
    } catch (err) {
        res.status(500).json({ error: "DB Connection Failed: " + err.message });
    }
});

export default router;
