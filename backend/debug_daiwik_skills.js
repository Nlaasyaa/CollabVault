import { db } from "./db.js";

async function checkData() {
    try {
        // 1. Find user 'Daiwik' - fetching all columns to avoid guessing column names
        const [profiles] = await db.query("SELECT * FROM profiles WHERE display_name LIKE '%Daiwik%'");
        console.log("Found Profiles:", profiles);

        if (profiles.length === 0) {
            console.log("Profile 'Daiwik' not found.");
            process.exit(0);
        }

        const targetUserId = profiles[0].user_id;
        console.log(`Checking data for User ID: ${targetUserId}`);


        // 2. Check Raw User Skills 
        const [rawSkills] = await db.query("SELECT * FROM user_skills WHERE user_id = ?", [targetUserId]);
        console.log("Raw User Skills entries:", rawSkills);

        // 3. Check Raw User Interests
        const [rawInterests] = await db.query("SELECT * FROM user_interests WHERE user_id = ?", [targetUserId]);
        console.log("Raw User Interests entries:", rawInterests);

        // 4. Try the JOIN queries again
        if (rawSkills.length > 0) {
            const [skills] = await db.query(`
        SELECT s.name 
        FROM user_skills us
        JOIN skills s ON s.id = us.skill_id
        WHERE us.user_id = ?
        `, [targetUserId]);
            console.log("Joined Skills:", skills);
        }

        if (rawInterests.length > 0) {
            const [interests] = await db.query(`
        SELECT i.name 
        FROM user_interests ui
        JOIN interests i ON i.id = ui.interest_id
        WHERE ui.user_id = ?
        `, [targetUserId]);
            console.log("Joined Interests:", interests);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit(0);
    }
}

checkData();
