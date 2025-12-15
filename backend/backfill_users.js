
import { db } from "./db.js";

async function backfillUserData() {
    try {
        console.log("--- Starting User Data Backfill ---");

        // 1. Fetch all profiles
        const [profiles] = await db.query("SELECT * FROM profiles");
        console.log(`Found ${profiles.length} profiles to check.`);

        // Default Data Constants
        const DEFAULT_COLLEGE = "BIT Bangalore";
        const DEFAULT_BRANCH = "CSE";
        const DEFAULT_YEAR = "3rd Year";
        const DEFAULT_BIO = "Passionate developer looking for teammates to build cool projects.";
        const DEFAULT_OPEN_FOR = JSON.stringify(["Hackathons", "Projects"]);

        const DEFAULT_SKILLS = ["JavaScript", "React", "Node.js"];
        const DEFAULT_INTERESTS = ["Web Development", "AI/ML", "Open Source"];

        // Helper to get or create ID for skill/interest
        async function getOrCreateId(tableName, name) {
            // Check if exists
            const [existing] = await db.query(`SELECT id FROM ${tableName} WHERE name = ?`, [name]);
            if (existing.length > 0) return existing[0].id;

            // Create if not
            const [result] = await db.query(`INSERT INTO ${tableName} (name) VALUES (?)`, [name]);
            return result.insertId;
        }

        for (const profile of profiles) {
            const userId = profile.user_id; // profiles table column is usually user_id based on previous reads, let's verify. 
            // Looking at routes/profile.js: "JOIN users u ON p.user_id = u.id" - Yes, it is user_id.

            console.log(`Checking User ID: ${userId} (${profile.display_name})...`);
            let profileUpdated = false;
            let updates = [];
            let values = [];

            // 2. Check and Prepare Profile Updates
            if (!profile.college) {
                updates.push("college = ?");
                values.push(DEFAULT_COLLEGE);
                profileUpdated = true;
            }
            if (!profile.branch) {
                updates.push("branch = ?");
                values.push(DEFAULT_BRANCH);
                profileUpdated = true;
            }
            if (!profile.year) {
                updates.push("year = ?");
                values.push(DEFAULT_YEAR);
                profileUpdated = true;
            }
            if (!profile.bio) {
                updates.push("bio = ?");
                values.push(DEFAULT_BIO);
                profileUpdated = true;
            }

            // open_for handling: might be null or empty string or empty json array
            let needsOpenFor = false;
            if (!profile.open_for) needsOpenFor = true;
            else {
                try {
                    const parsed = JSON.parse(profile.open_for);
                    if (Array.isArray(parsed) && parsed.length === 0) needsOpenFor = true;
                } catch (e) {
                    needsOpenFor = true; // Invalid JSON, overwrite
                }
            }

            if (needsOpenFor) {
                updates.push("open_for = ?");
                values.push(DEFAULT_OPEN_FOR);
                profileUpdated = true;
            }

            // Execute Profile Update
            if (profileUpdated) {
                values.push(userId);
                await db.query(`UPDATE profiles SET ${updates.join(", ")} WHERE user_id = ?`, values);
                console.log(`  -> Updated profile fields.`);
            }

            // 3. Backfill Skills
            const [existingSkills] = await db.query("SELECT * FROM user_skills WHERE user_id = ?", [userId]);
            if (existingSkills.length === 0) {
                console.log(`  -> No skills found. Adding defaults...`);
                for (const skill of DEFAULT_SKILLS) {
                    const skillId = await getOrCreateId("skills", skill);
                    // Avoid duplicate key errors if logic is slightly off, though count check should prevent it
                    try {
                        await db.query("INSERT INTO user_skills (user_id, skill_id) VALUES (?, ?)", [userId, skillId]);
                    } catch (e) {
                        // Ignore if already exists (safe fallback)
                    }
                }
            }

            // 4. Backfill Interests
            const [existingInterests] = await db.query("SELECT * FROM user_interests WHERE user_id = ?", [userId]);
            if (existingInterests.length === 0) {
                console.log(`  -> No interests found. Adding defaults...`);
                for (const interest of DEFAULT_INTERESTS) {
                    const interestId = await getOrCreateId("interests", interest);
                    try {
                        await db.query("INSERT INTO user_interests (user_id, interest_id) VALUES (?, ?)", [userId, interestId]);
                    } catch (e) {
                        // Ignore
                    }
                }
            }
        }

        console.log("--- Backfill Completed Successfully ---");
        process.exit(0);

    } catch (err) {
        console.error("Backfill failed:", err);
        process.exit(1);
    }
}

backfillUserData();
