import { db } from "../db.js";

async function verifyDidika() {
    const email = "didikadiscodancer@gmail.com";
    try {
        console.log(`Manually verifying user: ${email}`);

        // 1. Get user
        const [users] = await db.query("SELECT id, email_verified FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            console.log("User not found!");
            process.exit(1);
        }

        const user = users[0];
        console.log(`User ID: ${user.id}, Currently Verified: ${user.email_verified}`);

        // 2. Update to verified
        await db.query("UPDATE users SET email_verified = 1 WHERE id = ?", [user.id]);

        console.log("SUCCESS: User marked as verified.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

verifyDidika();
