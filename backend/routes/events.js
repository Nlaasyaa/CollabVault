import express from "express";
import { db } from "../db.js";
import { auth as verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// =======================================
// 🔥 GET ALL EVENTS
// =======================================
router.get("/", async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT e.*, p.display_name AS creator_name
      FROM events e
      JOIN profiles p ON e.created_by = p.user_id
      ORDER BY e.created_at DESC
    `);

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching events" });
  }
});

// =======================================
// 🔥 GET SINGLE EVENT
// =======================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [event] = await db.query(`
      SELECT e.*, p.display_name AS creator_name
      FROM events e
      JOIN profiles p ON e.created_by = p.user_id
      WHERE e.id = ?
    `, [id]);

    if (event.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching event" });
  }
});

// =======================================
// 🔥 CREATE EVENT (ADMIN)
// =======================================
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      required_skills,
      team_size,
      location,
      event_date,
      deadline,
      registration_link
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    const [result] = await db.query(`
      INSERT INTO events 
      (title, description, required_skills, team_size, location, event_date, deadline, registration_link, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      description,
      required_skills,
      team_size,
      location,
      event_date,
      deadline,
      registration_link,
      userId
    ]);

    res.json({
      message: "Event created successfully",
      eventId: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating event" });
  }
});

// DELETE an event (Admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query("DELETE FROM events WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting event" });
  }
});

export default router;