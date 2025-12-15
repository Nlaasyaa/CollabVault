
import { db } from "./db.js";

async function migrate() {
    try {
        console.log("Migrating database for unread counts and roles...");

        // 1. messages.is_read
        try {
            await db.query("ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE");
            console.log("Added is_read to messages table.");
        } catch (e) {
            console.log("is_read column might already exist in messages table.");
        }

        // 2. team_group_members.last_read_at
        try {
            await db.query("ALTER TABLE team_group_members ADD COLUMN last_read_at TIMESTAMP NULL DEFAULT NULL");
            console.log("Added last_read_at to team_group_members table.");
        } catch (e) {
            console.log("last_read_at column might already exist in team_group_members table.");
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
