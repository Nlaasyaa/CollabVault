
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to point to backend root .env
dotenv.config({ path: path.join(__dirname, ".env") });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'techtribe',
};

async function migrateAdmin() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected to database.");

        // 1. Check if 'role' column exists
        const [columns] = await connection.execute("SHOW COLUMNS FROM users LIKE 'role'");

        if (columns.length === 0) {
            console.log("Adding 'role' column to users table...");
            await connection.execute("ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user'");
            console.log("Column 'role' added successfully.");
        } else {
            console.log("'role' column already exists.");
        }

        // 2. Set specific user as admin (e.g., nlaasya.04@gmail.com)
        // You can change this email to whoever should be the super admin
        const adminEmail = "nlaasya.04@gmail.com";
        console.log(`Promoting ${adminEmail} to admin...`);

        const [result] = await connection.execute(
            "UPDATE users SET role = 'admin' WHERE email = ?",
            [adminEmail]
        );

        if (result.affectedRows > 0) {
            console.log(`User ${adminEmail} is now an ADMIN.`);
        } else {
            console.log(`User ${adminEmail} not found. Please register first.`);
        }

    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

migrateAdmin();
