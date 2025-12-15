import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Create team
router.post("/create", auth, async (req, res) => {
  const { post_id, name } = req.body;

  const invite = Math.random().toString(36).substring(2, 10);

  const [result] = await db.query(
    `INSERT INTO teams (post_id, name, leader_user, invite_code)
     VALUES (?, ?, ?, ?)`,
    [post_id, name, req.user.id, invite]
  );

  await db.query(
    `INSERT INTO team_members (team_id, user_id, role)
     VALUES (?, ?, 'lead')`,
    [result.insertId, req.user.id]
  );

  res.json({ teamId: result.insertId, invite });
});

export default router;
