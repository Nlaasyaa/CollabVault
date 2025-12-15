
import { db } from "./db.js";

async function migrateAuth() {
    const connection = await db.getConnection();
    try {
        console.log("Starting Auth V2 Migration...");

        // 1. Create allowed_domains
        console.log("Creating/Updating allowed_domains table...");
        await connection.query(`
      CREATE TABLE IF NOT EXISTS allowed_domains (
        id INT AUTO_INCREMENT PRIMARY KEY,
        domain VARCHAR(255) NOT NULL UNIQUE,
        display_name VARCHAR(255),
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        added_by INT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Seed allowed_domains if empty
        const [domains] = await connection.query("SELECT * FROM allowed_domains");
        if (domains.length === 0) {
            console.log("Seeding allowed_domains...");
            await connection.query(`
        INSERT INTO allowed_domains (domain, display_name) VALUES 
        ('gmail.com', 'Gmail (Test)'),
        ('university.edu', 'Test University'),
        ('outfit.edu', 'Outfit University')
      `);
        }

        // 2. Create email_verifications
        console.log("Creating/Updating email_verifications table...");
        await connection.query(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash CHAR(64) NOT NULL,
        otp VARCHAR(10) NULL,
        otp_expires_at DATETIME NULL,
        token_expires_at DATETIME NOT NULL,
        attempts INT NOT NULL DEFAULT 0,
        used TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

        // 3. Update users table
        console.log("Updating users table schema...");

        // Helper to check if column exists
        async function columnExists(tableName, columnName) {
            const [rows] = await connection.query(`
        SELECT count(*) as count FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = ? 
        AND column_name = ?
      `, [tableName, columnName]);
            return rows[0].count > 0;
        }

        const columnsToAdd = [
            { name: 'email_verified', def: 'TINYINT(1) NOT NULL DEFAULT 0' },
            { name: 'verification_token_hash', def: 'CHAR(64) DEFAULT NULL' },
            { name: 'token_expires_at', def: 'DATETIME DEFAULT NULL' },
            { name: 'college_domain', def: 'VARCHAR(255) DEFAULT NULL' },
            // created_at / updated_at might exist depending on previoussetup, but usually users table has them. 
            // The prompt asks to ADD them, implying they might not exist or need to be ensured.
            // We'll check carefully.
        ];

        for (const col of columnsToAdd) {
            if (!(await columnExists('users', col.name))) {
                console.log(`Adding column ${col.name} to users...`);
                await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.def}`);
            } else {
                console.log(`Column ${col.name} already exists in users.`);
            }
        }

        // Check created_at (often exists)
        if (!(await columnExists('users', 'created_at'))) {
            console.log('Adding created_at...');
            await connection.query(`ALTER TABLE users ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        }

        // Check updated_at
        if (!(await columnExists('users', 'updated_at'))) {
            console.log('Adding updated_at...');
            await connection.query(`ALTER TABLE users ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        }

        // Index
        // creating index only if not exists is tricky in standard SQL without custom procedure, 
        // but try/catch block is easiest way in a script.
        try {
            await connection.query(`CREATE INDEX idx_users_college_domain ON users(college_domain)`);
            console.log("Created index idx_users_college_domain");
        } catch (e) {
            if (e.code === 'ER_DUP_KEYNAME') {
                console.log("Index idx_users_college_domain already exists.");
            } else {
                console.warn("Could not create index:", e.message);
            }
        }

        console.log("Migration completed successfully.");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        connection.release();
        process.exit();
    }
}

migrateAuth();
