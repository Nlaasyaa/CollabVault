import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// GET MY PROFILE
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [profile] = await db.query(
      `SELECT p.*, u.email, u.phone_number, u.role 
       FROM profiles p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.user_id = ?`,
      [userId]
    );

    if (profile.length === 0) {
      // Should not happen if auth middleware works
      return res.status(404).json({ error: "Profile not found" });
    }

    // Get skills
    const [skills] = await db.query(
      `SELECT s.name 
       FROM user_skills us
       JOIN skills s ON s.id = us.skill_id
       WHERE us.user_id = ?`,
      [userId]
    );

    // Get interests
    const [interests] = await db.query(
      `SELECT i.name 
       FROM user_interests ui
       JOIN interests i ON i.id = ui.interest_id
       WHERE ui.user_id = ?`,
      [userId]
    );

    // Get connection count
    const [connCount] = await db.query(
      `SELECT COUNT(*) as count 
       FROM connections c1
       INNER JOIN connections c2 
         ON c1.user_id = c2.target_user_id 
         AND c1.target_user_id = c2.user_id
       WHERE c1.user_id = ?`,
      [userId]
    );

    res.json({
      ...profile[0],
      skills: skills.map((s) => s.name),
      interests: interests.map((i) => i.name),
      connection_count: connCount[0]?.count || 0
    });
  } catch (err) {
    console.error("Error fetching my profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET BROWSE PROFILES (Authenticated - includes connection status)
router.get("/browse", auth, async (req, res) => {
  try {
    const userId = req.user.id; // Me

    const [profiles] = await db.query(`
      SELECT p.*, u.email, u.phone_number 
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id != ? -- Exclude myself
    `, [userId]);

    // Enhance profiles
    const enhancedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        // Get skills
        const [skills] = await db.query(
          `SELECT s.name 
           FROM user_skills us
           JOIN skills s ON s.id = us.skill_id
           WHERE us.user_id = ?`,
          [profile.user_id]
        );

        // Get interests
        const [interests] = await db.query(
          `SELECT i.name 
           FROM user_interests ui
           JOIN interests i ON i.id = ui.interest_id
           WHERE ui.user_id = ?`,
          [profile.user_id]
        );

        // Get connection count (Total mutuals for this user)
        const [connCount] = await db.query(
          `SELECT COUNT(*) as count 
             FROM connections c1
             INNER JOIN connections c2 
               ON c1.user_id = c2.target_user_id 
               AND c1.target_user_id = c2.user_id
             WHERE c1.user_id = ?`,
          [profile.user_id]
        );

        // Check MY connection status with them
        const [myConn] = await db.query("SELECT 1 FROM connections WHERE user_id = ? AND target_user_id = ?", [userId, profile.user_id]);
        const [theirConn] = await db.query("SELECT 1 FROM connections WHERE user_id = ? AND target_user_id = ?", [profile.user_id, userId]);

        let status = 'NONE';
        if (myConn.length > 0 && theirConn.length > 0) status = 'CONNECTED';
        else if (myConn.length > 0) status = 'SENT';
        else if (theirConn.length > 0) status = 'RECEIVED';

        return {
          ...profile,
          skills: skills.map((s) => s.name),
          interests: interests.map((i) => i.name),
          connection_count: connCount[0]?.count || 0,
          connection_status: status
        };
      })
    );

    res.json(enhancedProfiles);
  } catch (err) {
    console.error("Error fetching browse profiles:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// GET ALL PROFILES (Public fallback)
router.get("/", async (req, res) => {
  try {
    const [profiles] = await db.query(`
      SELECT p.*, u.email, u.phone_number 
      FROM profiles p
      JOIN users u ON p.user_id = u.id
    `);

    // Enhance profiles with skills and interests
    const enhancedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        // Get skills
        const [skills] = await db.query(
          `SELECT s.name 
           FROM user_skills us
           JOIN skills s ON s.id = us.skill_id
           WHERE us.user_id = ?`,
          [profile.user_id]
        );

        // Get interests
        const [interests] = await db.query(
          `SELECT i.name 
           FROM user_interests ui
           JOIN interests i ON i.id = ui.interest_id
           WHERE ui.user_id = ?`,
          [profile.user_id]
        );

        // Get connection count
        const [connCount] = await db.query(
          `SELECT COUNT(*) as count 
             FROM connections c1
             INNER JOIN connections c2 
               ON c1.user_id = c2.target_user_id 
               AND c1.target_user_id = c2.user_id
             WHERE c1.user_id = ?`,
          [profile.user_id]
        );

        return {
          ...profile,
          skills: skills.map((s) => s.name),
          interests: interests.map((i) => i.name),
          connection_count: connCount[0]?.count || 0
        };
      })
    );

    res.json(enhancedProfiles);
  } catch (err) {
    console.error("Error fetching all profiles:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET PROFILE BY ID (with skills and interests)
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get profile
    const [profile] = await db.query(`
      SELECT p.*, u.email, u.phone_number 
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `, [userId]);

    if (profile.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Get skills
    const [skills] = await db.query(
      `SELECT s.name 
       FROM user_skills us
       JOIN skills s ON s.id = us.skill_id
       WHERE us.user_id = ?`,
      [userId]
    );

    // Get interests
    const [interests] = await db.query(
      `SELECT i.name 
       FROM user_interests ui
       JOIN interests i ON i.id = ui.interest_id
       WHERE ui.user_id = ?`,
      [userId]
    );

    // Get connection count
    const [connCount] = await db.query(
      `SELECT COUNT(*) as count 
        FROM connections c1
        INNER JOIN connections c2 
        ON c1.user_id = c2.target_user_id 
        AND c1.target_user_id = c2.user_id
        WHERE c1.user_id = ?`,
      [userId]
    );

    const fullProfile = {
      ...profile[0],
      skills: skills.map(s => s.name),
      interests: interests.map(i => i.name),
      connection_count: connCount[0]?.count || 0
    };

    res.json(fullProfile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE PROFILE
router.put("/", auth, async (req, res) => {
  const { display_name, college, branch, year, bio, open_for, skills, interests } = req.body;
  const userId = req.user.id;

  try {
    // 1. Update Profile Basics
    // Ensure open_for is stored as JSON array string
    const openForJson = Array.isArray(open_for) ? JSON.stringify(open_for) : JSON.stringify([]);

    await db.query(
      `UPDATE profiles 
       SET display_name=?, college=?, branch=?, year=?, bio=?, open_for=? 
       WHERE user_id=?`,
      [display_name, college, branch, year, bio, openForJson, userId]
    );

    // Update phone number if provided
    if (req.body.phone_number !== undefined) {
      await db.query(
        "UPDATE users SET phone_number = ? WHERE id = ?",
        [req.body.phone_number, userId]
      );
    }

    // 2. Update Skills
    if (Array.isArray(skills)) {
      // Remove old skills
      await db.query("DELETE FROM user_skills WHERE user_id = ?", [userId]);

      // Add new skills
      for (const skillName of skills) {
        // Ensure skill exists in master table (case-insensitive check ideally, but here using INSERT IGNORE if unique constraint exists, else check)
        // Assuming 'name' is unique in 'skills' table
        await db.query("INSERT IGNORE INTO skills (name) VALUES (?)", [skillName]);

        // Get the skill ID
        const [rows] = await db.query("SELECT id FROM skills WHERE name = ?", [skillName]);
        if (rows.length > 0) {
          const skillId = rows[0].id;
          await db.query("INSERT INTO user_skills (user_id, skill_id) VALUES (?, ?)", [userId, skillId]);
        }
      }
    }

    // 3. Update Interests
    if (Array.isArray(interests)) {
      // Remove old interests
      await db.query("DELETE FROM user_interests WHERE user_id = ?", [userId]);

      // Add new interests
      for (const interestName of interests) {
        await db.query("INSERT IGNORE INTO interests (name) VALUES (?)", [interestName]);

        const [rows] = await db.query("SELECT id FROM interests WHERE name = ?", [interestName]);
        if (rows.length > 0) {
          const interestId = rows[0].id;
          await db.query("INSERT INTO user_interests (user_id, interest_id) VALUES (?, ?)", [userId, interestId]);
        }
      }
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Server error while updating profile" });
  }
});

// GET USER PROFILE BY ID (Public or Authenticated)
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const [profile] = await db.query(
      `SELECT p.display_name, p.college, p.branch, p.year, p.bio, p.open_for, u.email, u.phone_number, u.role, u.created_at
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.id = ?`,
      [userId]
    );

    if (profile.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get skills
    const [skills] = await db.query(
      `SELECT s.name 
       FROM user_skills us
       JOIN skills s ON s.id = us.skill_id
       WHERE us.user_id = ?`,
      [userId]
    );

    // Get interests
    const [interests] = await db.query(
      `SELECT i.name 
       FROM user_interests ui
       JOIN interests i ON i.id = ui.interest_id
       WHERE ui.user_id = ?`,
      [userId]
    );

    // Get connection count
    const [connCount] = await db.query(
      `SELECT COUNT(*) as count 
            FROM connections c1
            INNER JOIN connections c2 
            ON c1.user_id = c2.target_user_id 
            AND c1.target_user_id = c2.user_id
            WHERE c1.user_id = ?`,
      [userId]
    );

    res.json({
      ...profile[0],
      skills: skills.map((s) => s.name),
      interests: interests.map((i) => i.name),
      connection_count: connCount[0]?.count || 0
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
