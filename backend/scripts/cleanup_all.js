
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env from backend root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

async function cleanup() {
    console.log("Starting DB Cleanup...");

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    const PRESERVED_EMAILS = [
        '1bi22cs095@bit-bangalore.edu.in',
        'nlaasya.04@gmail.com'
    ];

    const safeTruncate = async (table) => {
        try {
            await connection.query(`TRUNCATE TABLE ${table};`);
            console.log(`- Truncated ${table}`);
        } catch (err) {
            if (err.code === 'ER_NO_SUCH_TABLE') {
                console.warn(`- Table ${table} does not exist. Skipping.`);
            } else {
                console.error(`- Error truncating ${table}:`, err.message);
            }
        }
    };

    try {
        // 1. Disable Foreign Key Checks to allow massive deletion
        await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

        console.log("Deleting all content (Chats, Posts, etc)...");

        // Clear Communications
        await safeTruncate("messages");
        await safeTruncate("team_messages");
        await safeTruncate("chats");

        // Clear Social Interactions
        await safeTruncate("comments");
        await safeTruncate("post_likes");
        await safeTruncate("connections");
        await safeTruncate("swipes");

        // Clear Teams & Groups
        await safeTruncate("team_members");
        await safeTruncate("team_groups");
        await safeTruncate("teams");

        // Clear Posts
        await safeTruncate("posts");

        // Clear Notification/Feedback/etc (Optional but safer for 'clean slate')
        await safeTruncate("notifications");
        await safeTruncate("feedback"); // Was feedbacks
        await safeTruncate("announcements");

        console.log("Content deleted.");

        // 2. Delete Test Users
        console.log(`Deleting all users except: ${PRESERVED_EMAILS.join(", ")}`);

        // Get IDs of preserved users
        const [rows] = await connection.query(`SELECT id FROM users WHERE email IN (?)`, [PRESERVED_EMAILS]);
        const preservedIds = rows.map(r => r.id);

        if (preservedIds.length === 0) {
            console.warn("WARNING: None of the preserved users found in DB!");
        } else {
            console.log(`Preserved User IDs: ${preservedIds.join(", ")}`);
        }

        const notInClause = preservedIds.length > 0 ? `WHERE user_id NOT IN (${preservedIds.join(',')})` : "";
        const usersNotInClause = preservedIds.length > 0 ? `WHERE id NOT IN (${preservedIds.join(',')})` : "";

        // Delete user specific data
        // (Note: Since we truncated most tables above, we just need to clean profile/skills/interests)
        if (preservedIds.length > 0) {
            await connection.query(`DELETE FROM user_skills WHERE user_id NOT IN (${preservedIds.join(',')})`);
            await connection.query(`DELETE FROM user_interests WHERE user_id NOT IN (${preservedIds.join(',')})`);
            await connection.query(`DELETE FROM profiles WHERE user_id NOT IN (${preservedIds.join(',')})`);
            await connection.query(`DELETE FROM blocked_users WHERE blocker_id NOT IN (${preservedIds.join(',')}) OR blocked_id NOT IN (${preservedIds.join(',')})`);
            await connection.query(`DELETE FROM users WHERE id NOT IN (${preservedIds.join(',')})`);
            console.log(`- Deleted users not in preserved list.`);
        } else {
            // If no preserved users found, delete ALL users? 
            // User asked to 'remove all test users except...', if exception doesn't exist, we delete all.
            await safeTruncate("user_skills");
            await safeTruncate("user_interests");
            await safeTruncate("profiles");
            await safeTruncate("blocked_users");
            await connection.query("DELETE FROM users;");
            console.log(`- Deleted ALL users (no preserved users found).`);
        }

        console.log("Test users deleted.");

        // 3. Re-enable FK Checks
        await connection.query("SET FOREIGN_KEY_CHECKS = 1;");

        console.log("Cleanup Complete!");
        process.exit(0);

    } catch (err) {
        console.error("Cleanup Failed:", err);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

cleanup();
