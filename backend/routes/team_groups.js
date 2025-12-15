import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/* ============================================================
   CREATE TEAM GROUP
   ============================================================ */
router.post("/create", auth, async (req, res) => {
    try {
        const { name, members } = req.body;

        if (!name || !members || members.length === 0) {
            return res.status(400).json({ message: "Group name and members are required" });
        }

        // Create the group
        const [result] = await db.query(
            "INSERT INTO team_groups (name, created_by) VALUES (?, ?)",
            [name, req.user.id]
        );

        const groupId = result.insertId;

        // Add creator to the group
        await db.query(
            "INSERT INTO team_group_members (group_id, user_id) VALUES (?, ?)",
            [groupId, req.user.id]
        );

        // Add all members to the group
        for (const memberId of members) {
            // Skip if member is the creator (already added)
            if (parseInt(memberId) !== req.user.id) {
                await db.query(
                    "INSERT INTO team_group_members (group_id, user_id) VALUES (?, ?)",
                    [groupId, memberId]
                );
            }
        }

        res.json({
            success: true,
            message: "Group created successfully",
            groupId
        });
    } catch (err) {
        console.error("Error creating team group:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   GET MY TEAM GROUPS
   ============================================================ */
router.get("/", auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all groups where user is a member
        const [groups] = await db.query(
            `SELECT DISTINCT tg.id, tg.name, tg.created_at, tg.created_by,
              (SELECT COUNT(*) FROM team_group_members WHERE group_id = tg.id) as member_count,
              (SELECT content FROM team_messages WHERE group_id = tg.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM team_messages WHERE group_id = tg.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
              (SELECT COUNT(*) FROM team_messages WHERE group_id = tg.id AND created_at > COALESCE((SELECT last_read_at FROM team_group_members WHERE group_id = tg.id AND user_id = ?), '1970-01-01')) as unread_count
       FROM team_groups tg
       INNER JOIN team_group_members tgm ON tg.id = tgm.group_id
       WHERE tgm.user_id = ?
       ORDER BY COALESCE(last_message_time, tg.created_at) DESC`,
            [userId, userId]
        );

        res.json(groups);
    } catch (err) {
        console.error("Error fetching team groups:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   GET GROUP MEMBERS
   ============================================================ */
router.get("/:groupId/members", auth, async (req, res) => {
    try {
        const groupId = req.params.groupId;

        const [members] = await db.query(
            `SELECT u.id, u.email, p.display_name
       FROM team_group_members tgm
       INNER JOIN users u ON tgm.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE tgm.group_id = ?`,
            [groupId]
        );

        res.json(members);
    } catch (err) {
        console.error("Error fetching group members:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   SEND MESSAGE TO GROUP
   ============================================================ */
router.post("/:groupId/messages/send", auth, upload.single("file"), async (req, res) => {
    try {
        const { groupId } = req.params;
        const { content } = req.body;
        const file = req.file;

        if (!content && !file) {
            return res.status(400).json({ message: "Message content or file is required" });
        }

        // Verify user is a member of the group
        const [membership] = await db.query(
            "SELECT * FROM team_group_members WHERE group_id = ? AND user_id = ?",
            [groupId, req.user.id]
        );

        if (membership.length === 0) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        let attachment_url = null;
        let attachment_type = null;

        if (file) {
            attachment_url = `/uploads/${file.filename}`;
            attachment_type = file.mimetype;
        }

        // Insert message
        await db.query(
            "INSERT INTO team_messages (group_id, sender_id, content, attachment_url, attachment_type) VALUES (?, ?, ?, ?, ?)",
            [groupId, req.user.id, content || "", attachment_url, attachment_type]
        );

        res.json({ success: true, message: "Message sent", attachment_url, attachment_type });
    } catch (err) {
        console.error("Error sending team message:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   GET GROUP MESSAGES
   ============================================================ */
router.get("/:groupId/messages", auth, async (req, res) => {
    try {
        const { groupId } = req.params;

        // Verify user is a member of the group
        const [membership] = await db.query(
            "SELECT * FROM team_group_members WHERE group_id = ? AND user_id = ?",
            [groupId, req.user.id]
        );

        if (membership.length === 0) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        // Get messages with sender info
        const [messages] = await db.query(
            `SELECT tm.id, tm.content, tm.created_at, tm.sender_id, tm.attachment_url, tm.attachment_type,
              p.display_name as sender_name
       FROM team_messages tm
       LEFT JOIN profiles p ON tm.sender_id = p.user_id
       WHERE tm.group_id = ?
       ORDER BY tm.created_at ASC`,
            [groupId]
        );

        res.json(messages);
    } catch (err) {
        console.error("Error fetching team messages:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   DELETE TEAM GROUP
   ============================================================ */
router.delete("/:groupId", auth, async (req, res) => {
    try {
        const { groupId } = req.params;

        // Verify user is the creator of the group
        const [group] = await db.query(
            "SELECT * FROM team_groups WHERE id = ? AND created_by = ?",
            [groupId, req.user.id]
        );

        if (group.length === 0) {
            return res.status(403).json({ message: "Only the group creator can delete this group" });
        }

        // Delete the group (cascade will delete members and messages)
        await db.query("DELETE FROM team_groups WHERE id = ?", [groupId]);

        res.json({ success: true, message: "Group deleted successfully" });
    } catch (err) {
        console.error("Error deleting team group:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   ADD MEMBER TO GROUP
   ============================================================ */
router.post("/:groupId/members/add", auth, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Verify the requester is a member of the group
        const [membership] = await db.query(
            "SELECT * FROM team_group_members WHERE group_id = ? AND user_id = ?",
            [groupId, req.user.id]
        );

        if (membership.length === 0) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        // Verify the requester is the creator of the group
        const [group] = await db.query("SELECT * FROM team_groups WHERE id = ?", [groupId]);
        if (group.length === 0 || group[0].created_by !== req.user.id) {
            return res.status(403).json({ message: "Only the Team Lead can add members." });
        }

        // Check if user is already a member
        const [existingMember] = await db.query(
            "SELECT * FROM team_group_members WHERE group_id = ? AND user_id = ?",
            [groupId, userId]
        );

        if (existingMember.length > 0) {
            return res.status(400).json({ message: "User is already a member of this group" });
        }

        // Add the member
        await db.query(
            "INSERT INTO team_group_members (group_id, user_id) VALUES (?, ?)",
            [groupId, userId]
        );

        res.json({ success: true, message: "Member added successfully" });
    } catch (err) {
        console.error("Error adding member to group:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   MARK GROUP AS READ
   ============================================================ */
router.post("/:groupId/mark-read", auth, async (req, res) => {
    try {
        const { groupId } = req.params;
        await db.query(
            "UPDATE team_group_members SET last_read_at = NOW() WHERE group_id = ? AND user_id = ?",
            [groupId, req.user.id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Error marking group as read:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   LEAVE GROUP (with optional Admin Transfer)
   ============================================================ */
router.post("/:groupId/leave", auth, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { new_admin_id } = req.body;
        const userId = req.user.id;

        const [group] = await db.query("SELECT * FROM team_groups WHERE id = ?", [groupId]);
        if (group.length === 0) return res.status(404).json({ message: "Group not found" });

        const isCreator = group[0].created_by === userId;

        if (isCreator) {
            // Check if there are other members
            const [members] = await db.query("SELECT * FROM team_group_members WHERE group_id = ? AND user_id != ?", [groupId, userId]);

            if (members.length > 0) {
                if (!new_admin_id) {
                    return res.status(400).json({ message: "You are the Team Lead. Please assign a new lead before leaving." });
                }

                // Validate new admin is a member
                const isMember = members.find(m => m.user_id === parseInt(new_admin_id));
                if (!isMember) {
                    return res.status(400).json({ message: "New Team Lead must be a member of the group." });
                }

                // Transfer ownership
                await db.query("UPDATE team_groups SET created_by = ? WHERE id = ?", [new_admin_id, groupId]);
            } else {
                // If no other members, delete the group
                await db.query("DELETE FROM team_groups WHERE id = ?", [groupId]);
                return res.json({ success: true, message: "Group deleted as you were the last member." });
            }
        }

        // Leave group
        await db.query("DELETE FROM team_group_members WHERE group_id = ? AND user_id = ?", [groupId, userId]);

        res.json({ success: true, message: "Left group successfully" });

    } catch (err) {
        console.error("Error leaving group:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================================================
   REMOVE MEMBER FROM GROUP
   ============================================================ */
router.delete("/:groupId/members/:userId", auth, async (req, res) => {
    try {
        const { groupId, userId } = req.params;

        // Verify the requester is the creator of the group (or the user removing themselves)
        // For now, let's allow any member to remove themselves, but only creator can remove others
        // Actually, the requirement implies "Delete Member" button, usually for admins.
        // Let's check if requester is creator.

        const [group] = await db.query(
            "SELECT * FROM team_groups WHERE id = ?",
            [groupId]
        );

        if (group.length === 0) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isCreator = group[0].created_by === req.user.id;
        const isSelf = parseInt(userId) === req.user.id;

        if (!isCreator && !isSelf) {
            return res.status(403).json({ message: "Only the group creator can remove other members" });
        }

        // Remove the member
        await db.query(
            "DELETE FROM team_group_members WHERE group_id = ? AND user_id = ?",
            [groupId, userId]
        );

        res.json({ success: true, message: "Member removed successfully" });
    } catch (err) {
        console.error("Error removing member from group:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
