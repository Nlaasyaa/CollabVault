import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// YES/NO swipe
router.post("/", auth, async (req, res) => {
  const { target, post_id, response } = req.body;

  try {
    await db.query(
      `INSERT INTO swipes (swiper, target, post_id, response)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE response = VALUES(response)`,
      [req.user.id, target, post_id, response]
    );

    res.json({ message: "Swipe recorded" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
