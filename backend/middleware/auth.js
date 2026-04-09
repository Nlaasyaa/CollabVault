import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../db.js"; // ✅ IMPORTANT

dotenv.config();

// 🔐 AUTH MIDDLEWARE
export const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role? }
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};

// 🔒 ADMIN CHECK (ROBUST VERSION)
export const isAdmin = async (req, res, next) => {
  try {
    // ✅ Case 1: role exists in JWT
    if (req.user?.role === "admin") {
      return next();
    }

    // ✅ Case 2: fallback → check DB
    const userId = req.user?.id;

    if (!userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const [rows] = await db.query(
      "SELECT role FROM users WHERE id = ?",
      [userId]
    );

    if (!rows.length) {
      return res.status(403).json({ error: "User not found" });
    }

    if (rows[0].role === "admin") {
      return next();
    }

    return res.status(403).json({
      error: "Access denied. Admin privileges required.",
    });

  } catch (err) {
    console.error("Admin check error:", err);
    res.status(500).json({ error: "Server error" });
  }
};