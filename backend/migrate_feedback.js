
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

async function migrateFeedbackReply() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected to database.");

        const [columns] = await connection.execute("SHOW COLUMNS FROM feedback LIKE 'admin_reply'");

        if (columns.length === 0) {
            console.log("Adding 'admin_reply' and 'replied_at' columns to feedback table...");
            await connection.execute("ALTER TABLE feedback ADD COLUMN admin_reply TEXT DEFAULT NULL, ADD COLUMN replied_at DATETIME DEFAULT NULL");
            console.log("Columns added successfully.");
        } else {
            console.log("Feedback columns already exist.");
        }

    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

migrateFeedbackReply();
