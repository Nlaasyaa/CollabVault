import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ============================================================
   CREATE POST
   ============================================================ */
router.post("/create", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      required_skills,
      team_size,
      deadline,
      location,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const [result] = await db.query(
      `INSERT INTO posts 
        (creator_id, title, description, required_skills, team_size, deadline, location) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        description || "",
        required_skills || "",
        team_size || 1,
        deadline || null,
        location || "",
      ]
    );

    res.json({
      success: true,
      message: "Post created successfully",
      postId: result.insertId,
    });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   GET ALL POSTS
   ============================================================ */
/* ============================================================
   GET ALL POSTS
   ============================================================ */
router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Token invalid or expired, proceed as guest
      }
    }

    const [posts] = await db.query(
      `SELECT posts.*, 
              profiles.display_name as creator_name, 
              profiles.user_id as creator_user_id,
              (CASE WHEN post_likes.post_id IS NOT NULL THEN 1 ELSE 0 END) as is_liked
       FROM posts 
       LEFT JOIN profiles ON posts.creator_id = profiles.user_id 
       LEFT JOIN post_likes ON posts.id = post_likes.post_id AND post_likes.user_id = ?
       ORDER BY posts.created_at DESC`,
      [userId]
    );

    // Convert is_liked to boolean (MySQL might return 1/0)
    const formattedPosts = posts.map(post => ({
      ...post,
      is_liked: !!post.is_liked
    }));

    res.json(formattedPosts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   LIKE POST
   ============================================================ */
router.post("/:id/like", auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Check if already liked
    const [existing] = await db.query(
      "SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?",
      [userId, postId]
    );

    if (existing.length > 0) {
      // Unlike
      await db.query(
        "DELETE FROM post_likes WHERE user_id = ? AND post_id = ?",
        [userId, postId]
      );
      await db.query("UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = ?", [postId]);
      return res.json({ success: true, message: "Post unliked", liked: false });
    } else {
      // Like
      await db.query(
        "INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)",
        [userId, postId]
      );
      await db.query("UPDATE posts SET likes = likes + 1 WHERE id = ?", [postId]);
      return res.json({ success: true, message: "Post liked", liked: true });
    }
  } catch (err) {
    console.error("Error liking post:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   COMMENT ON POST
   ============================================================ */
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    await db.query(
      "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
      [req.params.id, req.user.id, content]
    );

    // Update comment count on post
    await db.query("UPDATE posts SET comments = comments + 1 WHERE id = ?", [req.params.id]);

    res.json({ success: true, message: "Comment added" });
  } catch (err) {
    console.error("Error commenting post:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   GET COMMENTS FOR POST
   ============================================================ */
router.get("/:id/comments", async (req, res) => {
  try {
    const [comments] = await db.query(
      `SELECT comments.*, profiles.display_name as author_name 
       FROM comments 
       LEFT JOIN profiles ON comments.user_id = profiles.user_id 
       WHERE post_id = ? 
       ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Token invalid or expired
      }
    }

    const [rows] = await db.query(
      `SELECT posts.*, 
              profiles.display_name as creator_name, 
              profiles.user_id as creator_user_id,
              (CASE WHEN post_likes.post_id IS NOT NULL THEN 1 ELSE 0 END) as is_liked
       FROM posts 
       LEFT JOIN profiles ON posts.creator_id = profiles.user_id 
       LEFT JOIN post_likes ON posts.id = post_likes.post_id AND post_likes.user_id = ?
       WHERE posts.id = ?`,
      [userId, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = rows[0];
    post.is_liked = !!post.is_liked;

    res.json(post);
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   UPDATE POST
   ============================================================ */
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      required_skills,
      team_size,
      deadline,
      location,
    } = req.body;

    const [existing] = await db.query(
      "SELECT * FROM posts WHERE id = ?",
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (existing[0].creator_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await db.query(
      `UPDATE posts 
       SET title=?, description=?, required_skills=?, team_size=?, deadline=?, location=? 
       WHERE id=?`,
      [
        title,
        description,
        required_skills,
        team_size,
        deadline,
        location,
        req.params.id,
      ]
    );

    res.json({ success: true, message: "Post updated" });
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   DELETE POST
   ============================================================ */
router.delete("/:id", auth, async (req, res) => {
  try {
    const [existing] = await db.query(
      "SELECT * FROM posts WHERE id = ?",
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (existing[0].creator_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await db.query("DELETE FROM posts WHERE id = ?", [req.params.id]);

    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
