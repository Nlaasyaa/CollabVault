import { db } from "./db.js";

async function migrate() {
    try {
        console.log("Checking for comments table...");

        const [tables] = await db.query("SHOW TABLES LIKE 'comments'");

        if (tables.length === 0) {
            console.log("Creating comments table...");
            await db.query(`
        CREATE TABLE comments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          post_id INT NOT NULL,
          user_id INT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
        } else {
            console.log("comments table already exists.");
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
