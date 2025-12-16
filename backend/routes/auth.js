import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "../db.js";
import { generateSlug } from "../utils/generateSlug.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/email.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/* =======================
   HELPERS
======================= */

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const signAccessToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );

/* =======================
   REGISTER
======================= */
router.post("/register", async (req, res) => {
  try {
    let {
      email,
      password,
      display_name,
      phone_number,
      college,
      branch,
      year,
      bio,
    } = req.body;

    if (!email || !password || !display_name) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    email = email.toLowerCase().trim();
    const domain = email.split("@")[1];

    const [allowed] = await db.query(
      "SELECT id FROM allowed_domains WHERE domain = ? AND is_active = 1",
      [domain]
    );

    if (allowed.length === 0 && domain !== 'gmail.com') {
      return res.status(400).json({ error: "Only college email allowed" });
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    const [result] = await db.query(
      `INSERT INTO users 
        (email, password_hash, email_verified, verification_token_hash, token_expires_at, college_domain, phone_number, phone_verified)
       VALUES (?, ?, 0, ?, ?, ?, ?, 0)`,
      [email, passwordHash, tokenHash, expires, domain, phone_number || null]
    );

    const userId = result.insertId;

    await db.query(
      `INSERT INTO profiles 
        (user_id, username_slug, display_name, college, branch, year, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        generateSlug(email.split("@")[0]),
        display_name,
        college || null,
        branch || null,
        year || null,
        bio || null,
      ]
    );

    console.log("Starting email send...");
    await sendVerificationEmail(email, token);
    console.log("Email sent successfully");

    res.status(201).json({
      message: "Verification email sent",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Internal server error: " + err.message });
  }
});

/* =======================
   VERIFY EMAIL
======================= */
router.get("/verify-email", async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token || !email)
      return res.status(400).json({ error: "Invalid verification link" });

    const tokenHash = hashToken(token);

    const [users] = await db.query(
      `SELECT id, email_verified 
       FROM users 
       WHERE email = ? AND verification_token_hash = ? AND token_expires_at > NOW()`,
      [email, tokenHash]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    await db.query(
      `UPDATE users 
       SET email_verified = 1, verification_token_hash = NULL, token_expires_at = NULL 
       WHERE email = ?`,
      [email]
    );

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* =======================
   LOGIN
======================= */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.toLowerCase().trim();

    const [users] = await db.query(
      `SELECT u.*, p.display_name
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0)
      return res.status(400).json({ error: "Invalid credentials" });

    const user = users[0];

    if (!user.email_verified) {
      return res
        .status(403)
        .json({ error: "Please verify your email first" });
    }

    if (user.is_blocked) {
      return res
        .status(403)
        .json({ error: "Account blocked. Contact support." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(400).json({ error: "Invalid credentials" });

    await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    res.json({
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Internal server error: " + err.message });
  }
});

/* =======================
   FORGOT PASSWORD
======================= */
router.post("/forgot-password", async (req, res) => {
  try {
    let { email } = req.body;
    email = email?.toLowerCase().trim();

    const [users] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.json({
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await db.query(
      `UPDATE users 
       SET verification_token_hash = ?, token_expires_at = ? 
       WHERE email = ?`,
      [tokenHash, expires, email]
    );

    await sendPasswordResetEmail(email, token);

    res.json({
      message:
        "If an account exists with this email, a reset link has been sent.",
    });
  } catch (err) {
    console.error("FORGOT ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* =======================
   RESET PASSWORD
======================= */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const tokenHash = hashToken(token);

    const [users] = await db.query(
      `SELECT id 
       FROM users 
       WHERE email = ? AND verification_token_hash = ? AND token_expires_at > NOW()`,
      [email, tokenHash]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await db.query(
      `UPDATE users 
       SET password_hash = ?, verification_token_hash = NULL, token_expires_at = NULL 
       WHERE email = ?`,
      [passwordHash, email]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* =======================
   RESEND VERIFICATION
======================= */
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0)
      return res.status(400).json({ error: "User not found" });

    const user = users[0];
    if (user.email_verified)
      return res.status(400).json({ error: "Email already verified" });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      "UPDATE users SET verification_token_hash = ?, token_expires_at = ? WHERE id = ?",
      [tokenHash, expires, user.id]
    );

    console.log("Resending verification email to:", user.email);
    await sendVerificationEmail(user.email, token);

    res.json({ message: "Verification email resent" });
  } catch (err) {
    console.error("RESEND ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
