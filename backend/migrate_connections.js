import { db } from "./db.js";

async function migrate() {
    try {
        console.log("Dropping existing connections table if exists...");
        await db.query("DROP TABLE IF EXISTS connections");

        console.log("Creating connections table...");
        await db.query(`
      CREATE TABLE connections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        target_user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_connection (user_id, target_user_id)
      )
    `);

        console.log("Connections table created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
