import { db } from "./db.js";
import bcrypt from "bcryptjs";

const email = "nlaasya.04@gmail.com";
const password = "12345678";

try {
    const [users] = await db.query("SELECT id, email, password_hash FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
        console.log("User not found");
    } else {
        const user = users[0];
        console.log("User found:", user.email);

        const match = await bcrypt.compare(password, user.password_hash);
        console.log("Password match:", match);

        if (!match) {
            console.log("\nPassword does NOT match. Resetting to: 12345678");
            const newHash = await bcrypt.hash(password, 10);
            await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, user.id]);
            console.log("Password has been reset successfully!");
        } else {
            console.log("\nPassword already matches!");
        }
    }

    process.exit(0);
} catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
}
