import { db } from "./db.js";

async function migrate() {
    try {
        console.log("Dropping existing team_groups table if exists...");
        await db.query("DROP TABLE IF EXISTS team_groups");

        console.log("Creating team_groups table...");
        await db.query(`
      CREATE TABLE team_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

        console.log("Dropping existing team_group_members table if exists...");
        await db.query("DROP TABLE IF EXISTS team_group_members");

        console.log("Creating team_group_members table...");
        await db.query(`
      CREATE TABLE team_group_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        user_id INT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES team_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_member (group_id, user_id)
      )
    `);

        console.log("Team groups tables created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
