import { db } from "../db.js";

async function makeAdmin(email) {
    if (!email) {
        console.error("Please provide an email address.");
        process.exit(1);
    }

    console.log(`Making ${email} an admin...`);

    try {
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            console.error("User not found!");
            process.exit(1);
        }

        await db.query("UPDATE users SET role = 'admin' WHERE email = ?", [email]);
        console.log("Success! User is now an admin.");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

const email = process.argv[2];
makeAdmin(email);
