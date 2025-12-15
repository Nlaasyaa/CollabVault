import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Get all available interests
router.get("/", async (req, res) => {
  try {
    const [interests] = await db.query("SELECT * FROM interests ORDER BY name ASC");
    res.json(interests);
  } catch (err) {
    console.error("Error fetching interests:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/add", auth, async (req, res) => {
  const { interest } = req.body;

  let [row] = await db.query(
    "SELECT id FROM interests WHERE name = ?",
    [interest]
  );

  let id;

  if (row.length === 0) {
    const [result] = await db.query(
      "INSERT INTO interests (name) VALUES (?)",
      [interest]
    );
    id = result.insertId;
  } else {
    id = row[0].id;
  }

  await db.query(
    `REPLACE INTO user_interests (user_id, interest_id) VALUES (?, ?)`,
    [req.user.id, id]
  );

  res.json({ message: "Interest added" });
});

export default router;
