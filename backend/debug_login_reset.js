import { db } from "./db.js";
import bcrypt from "bcryptjs";

async function checkAndReset() {
    try {
        // Check users
        const [users] = await db.query("SELECT id, email FROM users");
        console.log("Current Users:", users);

        const targetEmails = ["daiwik@gmail.com", "nlaasya.04@gmail.com"];
        const newPassword = "password123";
        const newHash = await bcrypt.hash(newPassword, 10);

        for (const email of targetEmails) {
            const [u] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
            if (u.length > 0) {
                await db.query("UPDATE users SET password_hash = ? WHERE email = ?", [newHash, email]);
                console.log(`Reset password for ${email} to '${newPassword}'`);
            } else {
                console.log(`User ${email} not found.`);
            }
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit(0);
    }
}

checkAndReset();
