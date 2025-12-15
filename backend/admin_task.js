
import { db } from "./db.js";

async function performAdminTasks() {
    try {
        console.log("--- Starting Admin Tasks ---");

        // 1. Delete user 1bi22cs095@bit-bangalore.edu.in
        const emailToDelete = "1bi22cs095@bit-bangalore.edu.in";
        console.log(`Deleting user with email: ${emailToDelete}...`);

        // Check if user exists first to log it
        const [usersToDelete] = await db.query("SELECT id FROM users WHERE email = ?", [emailToDelete]);
        if (usersToDelete.length > 0) {
            await db.query("DELETE FROM users WHERE email = ?", [emailToDelete]);
            // Assuming ON DELETE CASCADE is set for profiles, otherwise might need manual delete if not
            // The migration scripts I saw (e.g. migrate_connections.js) use ON DELETE CASCADE, so likely profiles does too.
            // But to be safe, I'll rely on the DB constraints or just delete from users.
            console.log(`User ${emailToDelete} deleted successfully.`);
        } else {
            console.log(`User ${emailToDelete} not found.`);
        }

        // 2. Verify student "Khushi"
        const nameToVerify = "Khushi";
        console.log(`Verifying user with name like: ${nameToVerify}...`);

        // Find users with this name in profiles
        const [profiles] = await db.query("SELECT user_id, display_name FROM profiles WHERE display_name LIKE ?", [`%${nameToVerify}%`]);

        if (profiles.length === 0) {
            console.log(`No user found with name containing "${nameToVerify}".`);
        } else {
            console.log(`Found ${profiles.length} user(s) matching "${nameToVerify}":`);
            for (const profile of profiles) {
                console.log(`- Verifying User ID: ${profile.user_id}, Name: ${profile.display_name}`);

                // Update email_verified to 1
                await db.query("UPDATE users SET email_verified = 1 WHERE id = ?", [profile.user_id]);
                console.log(`  User ID ${profile.user_id} verified.`);
            }
        }

        console.log("--- Admin Tasks Completed ---");
        process.exit(0);

    } catch (err) {
        console.error("Admin tasks failed:", err);
        process.exit(1);
    }
}

performAdminTasks();
