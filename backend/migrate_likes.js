import { db } from "./db.js";

async function migrate() {
    try {
        console.log("Checking for likes and comments columns...");

        // Check if columns exist
        const [columns] = await db.query("SHOW COLUMNS FROM posts");
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes("likes")) {
            console.log("Adding likes column...");
            await db.query("ALTER TABLE posts ADD COLUMN likes INT DEFAULT 0");
        } else {
            console.log("likes column already exists.");
        }

        if (!columnNames.includes("comments")) {
            console.log("Adding comments column...");
            await db.query("ALTER TABLE posts ADD COLUMN comments INT DEFAULT 0");
        } else {
            console.log("comments column already exists.");
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
