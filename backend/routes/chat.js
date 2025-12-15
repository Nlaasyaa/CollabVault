import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Create chat (1:1 or group)
router.post("/create", auth, async (req, res) => {
  const { team_id, is_group } = req.body;

  const [result] = await db.query(
    `INSERT INTO chats (team_id, is_group) VALUES (?, ?)`,
    [team_id, is_group]
  );

  res.json({ chatId: result.insertId });
});

export default router;
