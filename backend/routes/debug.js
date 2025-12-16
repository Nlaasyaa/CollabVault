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

// Test Email Configuration
router.post("/test-email", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        // Import transporter dynamically to avoid circular deps if necessary, 
        // or just import at top if possible. For now, let's reuse the one from utils/email.js
        // We need to export transporter from utils/email.js to use it here or create a new one.
        // Let's create a new one to show exactly what's checking.

        const nodemailer = await import("nodemailer");

        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            return res.status(400).json({
                error: "Missing credentials",
                details: "GMAIL_USER or GMAIL_APP_PASSWORD not set in environment"
            });
        }

        const transporter = nodemailer.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        // Verify connection configuration
        await transporter.verify();

        const info = await transporter.sendMail({
            from: '"Debug Mail" <no-reply@collabvault.com>',
            to: email,
            subject: "Test Email from CollabVault",
            text: "If you received this, your email configuration is working perfectly!",
        });

        res.json({
            success: true,
            message: "Email sent successfully",
            messageId: info.messageId
        });

    } catch (err) {
        console.error("EMAIL TEST ERROR:", err);
        res.status(500).json({
            error: "Email sending failed",
            details: err.message,
            stack: err.stack
        });
    }
});

export default router;
