
import { db } from "../db.js";
import dotenv from "dotenv";
dotenv.config();

async function checkFeedback() {
    try {
        console.log("------------------------------------------------");
        console.log("DIAGNOSTIC: Checking Database Connectivity");
        console.log("------------------------------------------------");
        console.log("Target Database Host:", process.env.DB_HOST || "localhost (default)");
        console.log("Target Database Name:", process.env.DB_NAME);
        console.log("------------------------------------------------");

        console.log("Connecting...");
        const [rows] = await db.query("SELECT * FROM feedback");

        console.log("Connection Successful!");
        console.log(`Feedback Table Count: ${rows.length}`);

        if (rows.length > 0) {
            console.log("Latest Feedback Item:", rows[0]);
        } else {
            console.log("The 'feedback' table is empty in THIS database.");
        }
        console.log("------------------------------------------------");
        process.exit(0);
    } catch (err) {
        console.error("Error checking feedback:", err.message);
        process.exit(1);
    }
}

checkFeedback();
