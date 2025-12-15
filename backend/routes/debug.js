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

export default router;
