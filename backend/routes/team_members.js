import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// JOIN TEAM
router.post("/join", auth, async (req, res) => {
  try {
    const { team_id, role } = req.body;
    const user_id = req.user.id;

    await db.query(
      "INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)",
      [team_id, user_id, role || "member"]
    );

    return res.json({ message: "Joined team" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LEAVE TEAM
router.post("/leave", auth, async (req, res) => {
  try {
    const { team_id } = req.body;
    const user_id = req.user.id;

    await db.query(
      "DELETE FROM team_members WHERE team_id=? AND user_id=?",
      [team_id, user_id]
    );

    return res.json({ message: "Left team" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET TEAM MEMBERS
router.get("/:teamId", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT tm.*, u.email, p.display_name 
       FROM team_members tm 
       JOIN users u ON tm.user_id = u.id 
       LEFT JOIN profiles p ON p.user_id = u.id 
       WHERE tm.team_id = ?`,
      [req.params.teamId]
    );

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;