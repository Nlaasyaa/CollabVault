import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Get all available skills
router.get("/", async (req, res) => {
  try {
    const [skills] = await db.query("SELECT * FROM skills ORDER BY name ASC");
    res.json(skills);
  } catch (err) {
    console.error("Error fetching skills:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a skill
router.post("/add", auth, async (req, res) => {
  const { skill, proficiency } = req.body;

  let [skillRow] = await db.query(
    "SELECT id FROM skills WHERE name = ?",
    [skill]
  );

  let skillId;

  if (skillRow.length === 0) {
    const [result] = await db.query(
      "INSERT INTO skills (name) VALUES (?)",
      [skill]
    );
    skillId = result.insertId;
  } else {
    skillId = skillRow[0].id;
  }

  await db.query(
    `REPLACE INTO user_skills (user_id, skill_id, proficiency) VALUES (?, ?, ?)`,
    [req.user.id, skillId, proficiency]
  );

  res.json({ message: "Skill added" });
});

// Get all skills of a user
router.get("/me", auth, async (req, res) => {
  const [skills] = await db.query(
    `SELECT skills.name, user_skills.proficiency 
     FROM user_skills 
     JOIN skills ON skills.id = user_skills.skill_id 
     WHERE user_id = ?`,
    [req.user.id]
  );

  res.json(skills);
});

export default router;
