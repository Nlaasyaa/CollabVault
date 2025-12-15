import { db } from "./db.js";

async function migrateAttachments() {
    try {
        console.log("Starting migration for attachments...");

        // Add columns to messages table
        try {
            await db.query(`
        ALTER TABLE messages
        ADD COLUMN attachment_url VARCHAR(255) DEFAULT NULL,
        ADD COLUMN attachment_type VARCHAR(50) DEFAULT NULL
      `);
            console.log("Added attachment columns to messages table.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("Attachment columns already exist in messages table.");
            } else {
                throw err;
            }
        }

        // Add columns to team_messages table
        try {
            await db.query(`
        ALTER TABLE team_messages
        ADD COLUMN attachment_url VARCHAR(255) DEFAULT NULL,
        ADD COLUMN attachment_type VARCHAR(50) DEFAULT NULL
      `);
            console.log("Added attachment columns to team_messages table.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("Attachment columns already exist in team_messages table.");
            } else {
                throw err;
            }
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrateAttachments();
