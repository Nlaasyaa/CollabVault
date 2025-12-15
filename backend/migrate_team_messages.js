import { db } from "./db.js";

async function migrate() {
    try {
        console.log("Dropping existing team_messages table if exists...");
        await db.query("DROP TABLE IF EXISTS team_messages");

        console.log("Creating team_messages table...");
        await db.query(`
      CREATE TABLE team_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        sender_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES team_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

        console.log("Team messages table created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
