import { db } from "./db.js";

const email = "nlaasya.04@gmail.com";

try {
    const [users] = await db.query("SELECT id, email, created_at, password_hash FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
        console.log("User not found");
    } else {
        const user = users[0];
        console.log("User found:");
        console.log("ID:", user.id);
        console.log("Email:", user.email);
        console.log("Created:", user.created_at);
        console.log("Has password hash:", !!user.password_hash);
        console.log("Password hash length:", user.password_hash ? user.password_hash.length : 0);
    }

    process.exit(0);
} catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
}
