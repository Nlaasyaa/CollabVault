import express from "express";
import { db } from "../db.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /api/admin/allowed-domains
router.get("/allowed-domains", auth, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM allowed_domains");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/allowed-domains
router.post("/allowed-domains", auth, isAdmin, async (req, res) => {
    try {
        const { domain, display_name } = req.body;
        if (!domain) return res.status(400).json({ error: "Domain is required" });

        const normalizedDomain = domain.toLowerCase().trim();

        await db.query(
            "INSERT INTO allowed_domains (domain, display_name) VALUES (?, ?)",
            [normalizedDomain, display_name]
        );

        res.status(201).json({ message: "Domain added successfully" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Domain already exists" });
        }
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/users
router.get("/users", auth, isAdmin, async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.id, u.email, u.role, u.is_blocked, u.email_verified, u.created_at, p.display_name, u.college_domain 
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            ORDER BY u.created_at DESC
        `);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/users/:id/block
router.post("/users/:id/block", auth, isAdmin, async (req, res) => {
    try {
        await db.query("UPDATE users SET is_blocked = 1 WHERE id = ?", [req.params.id]);
        res.json({ message: "User blocked successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/users/:id/unblock
router.post("/users/:id/unblock", auth, isAdmin, async (req, res) => {
    try {
        await db.query("UPDATE users SET is_blocked = 0 WHERE id = ?", [req.params.id]);
        res.json({ message: "User unblocked successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/users/:id/verify
router.post("/users/:id/verify", auth, isAdmin, async (req, res) => {
    try {
        await db.query("UPDATE users SET email_verified = 1 WHERE id = ?", [req.params.id]);
        res.json({ message: "User verified successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/users/:id/unverify
router.post("/users/:id/unverify", auth, isAdmin, async (req, res) => {
    try {
        await db.query("UPDATE users SET email_verified = 0 WHERE id = ?", [req.params.id]);
        res.json({ message: "User unverified successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", auth, isAdmin, async (req, res) => {
    try {
        // This will cascade delete profiles, posts etc if foreign keys are set up correctly.
        // If not, we might need manual cleanup. Assuming standard FKs for now.
        // Actually, let's play safe and allow DB to handle or error.
        await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/feedback/:id/reply
router.post("/feedback/:id/reply", auth, isAdmin, async (req, res) => {
    try {
        const { reply } = req.body;
        // Assuming we add a 'admin_reply' column to feedback table
        await db.query("UPDATE feedback SET admin_reply = ?, replied_at = NOW() WHERE id = ?", [reply, req.params.id]);
        res.json({ message: "Reply sent successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/feedback
router.get("/feedback", auth, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT f.*, u.email, p.display_name 
            FROM feedback f
            LEFT JOIN users u ON f.user_id = u.id
            LEFT JOIN profiles p ON f.user_id = p.user_id
            ORDER BY f.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/posts/:id
router.delete("/posts/:id", auth, isAdmin, async (req, res) => {
    try {
        await db.query("DELETE FROM posts WHERE id = ?", [req.params.id]);
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/comments/:id
router.delete("/comments/:id", auth, isAdmin, async (req, res) => {
    try {
        await db.query("DELETE FROM comments WHERE id = ?", [req.params.id]);
        res.json({ message: "Comment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/analytics - Get platform stats
router.get("/analytics", auth, isAdmin, async (req, res) => {
    try {
        const [userCount] = await db.query("SELECT COUNT(*) as count FROM users");
        const [postCount] = await db.query("SELECT COUNT(*) as count FROM posts");
        const [feedbackCount] = await db.query("SELECT COUNT(*) as count FROM feedback");
        const [domainCount] = await db.query("SELECT COUNT(*) as count FROM allowed_domains");

        res.json({
            totalUsers: userCount[0].count,
            totalPosts: postCount[0].count,
            totalFeedback: feedbackCount[0].count,
            totalDomains: domainCount[0].count
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/announcements - Create announcement
router.post("/announcements", auth, isAdmin, async (req, res) => {
    try {
        const { title, content, is_pinned } = req.body;
        if (!title || !content) return res.status(400).json({ error: "Title and content are required" });

        await db.query(
            "INSERT INTO announcements (title, content, is_pinned) VALUES (?, ?, ?)",
            [title, content, is_pinned || false]
        );
        res.status(201).json({ message: "Announcement created" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/announcements/:id
router.delete("/announcements/:id", auth, isAdmin, async (req, res) => {
    try {
        await db.query("DELETE FROM announcements WHERE id = ?", [req.params.id]);
        res.json({ message: "Announcement deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
