import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "../db.js";
import { generateSlug } from "../utils/generateSlug.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

router.post("/register", async (req, res) => {
    try {
        let { email, password, display_name, phone_number, college, branch, year } = req.body;

        if (!email || !password || !display_name || !phone_number || !college || !branch || !year) {
            return res.status(400).json({ error: "All fields are required (Email, Password, Name, Phone, College, Branch, Year)" });
        }

        // Normalize email
        email = email.toLowerCase().trim();

        // 1. Domain Verification
        const domain = email.split('@')[1];
        if (!domain) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        console.log(`[DEBUG] Checking domain: ${domain}`);

        const [allowedDomains] = await db.query(
            "SELECT * FROM allowed_domains WHERE domain = ? AND is_active = 1",
            [domain]
        );
        console.log(`[DEBUG] Domains found: ${allowedDomains.length}`);

        if (allowedDomains.length === 0) {
            return res.status(400).json({
                error: "Only college email allowed"
            });
        }

        // 2. Check if email already exists
        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // 3. Hash Password (Salt 12) & Generate Token
        const passwordHash = await bcrypt.hash(password, 12);

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenHash = hashToken(verificationToken);
        const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // 4. Insert User
        const [result] = await db.query(
            `INSERT INTO users (
                email, 
                password_hash, 
                email_verified, 
                verification_token_hash, 
                token_expires_at,
                college_domain,
                phone_number,
                phone_verified
            ) VALUES (?, ?, 0, ?, ?, ?, ?, 0)`,
            [email, passwordHash, verificationTokenHash, tokenExpiresAt, domain, phone_number || null]
        );

        const userId = result.insertId;

        // Create Profile
        const usernameSlug = generateSlug(email.split("@")[0]);
        const { bio } = req.body;

        await db.query(
            "INSERT INTO profiles (user_id, username_slug, display_name, college, branch, year, bio) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [userId, usernameSlug, display_name || "User", college || null, branch || null, year || null, bio || null]
        );

        // 5. Send Email
        await sendVerificationEmail(email, verificationToken);

        return res.status(201).json({
            message: "Verification email sent."
        });

    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /verify-email?token=...&email=...
router.get("/verify-email", async (req, res) => {
    try {
        const { token, email } = req.query; // Using query params
        if (!token || !email) return res.status(400).json({ error: "Missing token or email" });

        const tokenHash = hashToken(token);

        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ? AND verification_token_hash = ? AND token_expires_at > NOW()",
            [email, tokenHash]
        );

        if (users.length === 0) {
            // Check if already verified to avoid "Invalid token" error for double clicks
            const [alreadyVerified] = await db.query(
                "SELECT * FROM users WHERE email = ? AND email_verified = 1",
                [email]
            );
            if (alreadyVerified.length > 0) {
                // User is already verified, just return success + tokens so they can log in
                const user = alreadyVerified[0];
                const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
                const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });

                return res.json({
                    message: "Email already verified.",
                    accessToken,
                    refreshToken,
                    user: { phone_verified: user.phone_verified }
                });
            }
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        const user = users[0];

        // Update user status
        await db.query(
            "UPDATE users SET email_verified = 1, verification_token_hash = NULL, token_expires_at = NULL WHERE id = ?",
            [user.id]
        );

        // Generate Tokens for Auto-Login
        const accessToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

        return res.json({
            message: "Email verified successfully.",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                phone_verified: user.phone_verified,
            }
        });

    } catch (err) {
        console.error("Verification error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email ? email.toLowerCase().trim() : '';

        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = users[0];

        // Check if email verified
        if (!user.email_verified) {
            return res.status(403).json({ error: "Please verify your college email first." });
        }

        // Check if user is blocked
        if (user.is_blocked) {
            return res.status(403).json({ error: "Your account has been blocked. Please contact support." });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Generate Tokens
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

        await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

        return res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                display_name: user.display_name,
                college_domain: user.college_domain
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/refresh-token", async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: "Refresh Token required" });

    try {
        const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
        const decoded = jwt.verify(refreshToken, secret);

        const [users] = await db.query("SELECT * FROM users WHERE id = ?", [decoded.id]);
        if (users.length === 0) return res.status(403).json({ error: "User not found" });

        const accessToken = jwt.sign(
            { id: users[0].id, email: users[0].email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
        );

        return res.json({ accessToken });

    } catch (err) {
        return res.status(403).json({ error: "Invalid Refresh Token" });
    }
});


router.post("/resend-verification", async (req, res) => {
    try {
        let { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        email = email.toLowerCase().trim();

        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = users[0];
        if (user.email_verified) {
            return res.status(400).json({ error: "Email already verified" });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenHash = hashToken(verificationToken);
        const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await db.query(
            "UPDATE users SET verification_token_hash = ?, token_expires_at = ? WHERE id = ?",
            [verificationTokenHash, tokenExpiresAt, user.id]
        );

        await sendVerificationEmail(email, verificationToken);

        return res.json({ message: "Verification email resent." });

    } catch (err) {
        console.error("Resend error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});


router.post("/forgot-password", async (req, res) => {
    try {
        let { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        email = email.toLowerCase().trim();

        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            // Security: Don't reveal if user exists. Just say email sent.
            return res.json({ message: "If an account exists with this email, a reset link has been sent." });
        }

        const user = users[0];

        // Generate Token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = hashToken(resetToken);
        const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Reuse verification columns for password reset
        await db.query(
            "UPDATE users SET verification_token_hash = ?, token_expires_at = ? WHERE id = ?",
            [resetTokenHash, tokenExpiresAt, user.id]
        );

        await sendPasswordResetEmail(email, resetToken);

        return res.json({ message: "If an account exists with this email, a reset link has been sent." });

    } catch (err) {
        console.error("Forgot password error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        const { token, email, newPassword } = req.body;

        if (!token || !email || !newPassword) {
            return res.status(400).json({ error: "Token, email, and new password are required" });
        }

        const tokenHash = hashToken(token);

        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ? AND verification_token_hash = ? AND token_expires_at > NOW()",
            [email, tokenHash]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        const user = users[0];
        const passwordHash = await bcrypt.hash(newPassword, 12);

        // Update password and clear token
        await db.query(
            "UPDATE users SET password_hash = ?, verification_token_hash = NULL, token_expires_at = NULL WHERE id = ?",
            [passwordHash, user.id]
        );

        return res.json({ message: "Password reset successfully. You can now log in." });

    } catch (err) {
        console.error("Reset password error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;

