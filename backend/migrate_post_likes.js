import { db } from "./db.js";

async function migrate() {
    try {
        console.log("Checking for post_likes table...");

        const [tables] = await db.query("SHOW TABLES LIKE 'post_likes'");

        if (tables.length === 0) {
            console.log("Creating post_likes table...");
            await db.query(`
        CREATE TABLE post_likes (
          user_id INT NOT NULL,
          post_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, post_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        )
      `);
        } else {
            console.log("post_likes table already exists.");
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
