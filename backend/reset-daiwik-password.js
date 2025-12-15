import { db } from "./db.js";
import bcrypt from "bcryptjs";

async function resetDaiwikPassword() {
    try {
        // 1. Find Daiwik's email
        const [profiles] = await db.query("SELECT p.user_id, u.email FROM profiles p JOIN users u ON p.user_id = u.id WHERE p.display_name LIKE '%Daiwik%'");

        if (profiles.length === 0) {
            console.log("No user found with display name similar to 'Daiwik'");
            process.exit(1);
        }

        const { email, user_id } = profiles[0];
        console.log(`Found Daiwik (User ID: ${user_id}) with email: ${email}`);

        // 2. Reset Password
        const newPassword = "password123";
        const newHash = await bcrypt.hash(newPassword, 10);

        await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, user_id]);
        console.log(`Password for ${email} has been reset to: ${newPassword}`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit(0);
    }
}

resetDaiwikPassword();
