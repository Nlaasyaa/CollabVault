import { db } from "./db.js";

async function migrateEvents() {
  try {
    console.log("Checking for events table...");

    const createEventsTable = `
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        required_skills TEXT,
        team_size INT DEFAULT 1,
        location VARCHAR(255),
        event_date DATETIME,
        deadline DATETIME,
        registration_link VARCHAR(500),
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;

    await db.query(createEventsTable);
    console.log("Events table ready!");

    // Optional: Add a sample event if table is empty
    const [rows] = await db.query("SELECT COUNT(*) as count FROM events");
    if (rows[0].count === 0) {
      console.log("Adding sample event...");
      
      // Get an admin user ID
      const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
      let creatorId;
      
      if (admins.length > 0) {
        creatorId = admins[0].id;
      } else {
        // Fallback to any user
        const [users] = await db.query("SELECT id FROM users LIMIT 1");
        if (users.length > 0) {
          creatorId = users[0].id;
        }
      }

      if (creatorId) {
        await db.query(`
          INSERT INTO events (title, description, required_skills, location, event_date, created_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          "CollabVault Launch Event",
          "Welcome to our platform! Join us for a demo and networking session.",
          "React, Node.js",
          "Online",
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          creatorId
        ]);
        console.log("Sample event added!");
      } else {
          console.log("No users found to assign sample event to.");
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrateEvents();
