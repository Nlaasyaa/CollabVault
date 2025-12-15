
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'techtribe',
};

async function migrateBlocked() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected to database.");

        const [columns] = await connection.execute("SHOW COLUMNS FROM users LIKE 'is_blocked'");

        if (columns.length === 0) {
            console.log("Adding 'is_blocked' column to users table...");
            await connection.execute("ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT 0");
            console.log("Column 'is_blocked' added successfully.");
        } else {
            console.log("'is_blocked' column already exists.");
        }

    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

migrateBlocked();
