
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to point to backend root .env
dotenv.config({ path: path.join(__dirname, "../.env") });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'techtribe',
    port: process.env.DB_PORT || 3306,
    // Add SSL support for Aiven Cloud DB
    ssl: process.env.DB_HOST?.includes('aivencloud.com') ? { rejectUnauthorized: false } : undefined,
};

async function main() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected to database.");

        // 1. Fetch Users
        const [users] = await connection.execute("SELECT id FROM users");
        const userIds = users.map(u => u.id);

        // 2. Fetch User Skills
        const [userSkillsRows] = await connection.execute(`
            SELECT us.user_id, s.name 
            FROM user_skills us 
            JOIN skills s ON us.skill_id = s.id
        `);
        const userSkills = {}; // userId -> Set(skill names)
        userSkillsRows.forEach(row => {
            if (!userSkills[row.user_id]) userSkills[row.user_id] = new Set();
            userSkills[row.user_id].add(row.name.toLowerCase());
        });

        // 3. Fetch User Interests
        const [userInterestsRows] = await connection.execute(`
            SELECT ui.user_id, i.name 
            FROM user_interests ui 
            JOIN interests i ON ui.interest_id = i.id
        `);
        const userInterests = {}; // userId -> Set(interest names)
        userInterestsRows.forEach(row => {
            if (!userInterests[row.user_id]) userInterests[row.user_id] = new Set();
            userInterests[row.user_id].add(row.name.toLowerCase());
        });

        const recommendations = {}; // userId -> [rec_id1, rec_id2, ...]

        // 4. Calculate Scores
        for (const userId of userIds) {
            const mySkills = userSkills[userId] || new Set();
            const myInterests = userInterests[userId] || new Set();
            const candidates = [];

            for (const candId of userIds) {
                if (candId === userId) continue;

                const candSkills = userSkills[candId] || new Set();
                const candInterests = userInterests[candId] || new Set();

                // Logic:
                // Complementary Skills: candidate has it, I don't.
                let uniqueSkillsCount = 0;
                candSkills.forEach(s => {
                    if (!mySkills.has(s)) uniqueSkillsCount++;
                });

                // Shared Interests
                let sharedInterestsCount = 0;
                candInterests.forEach(i => {
                    if (myInterests.has(i)) sharedInterestsCount++;
                });

                // Weighted Score
                // User wants "different set of skills" (complementary) OR "same interests"
                const score = (uniqueSkillsCount * 2.0) + (sharedInterestsCount * 1.5);

                candidates.push({ id: candId, score });
            }

            // Sort descending
            candidates.sort((a, b) => b.score - a.score);

            // Take top 20
            recommendations[userId] = candidates.slice(0, 20).map(c => c.id);
        }

        // 5. Write to JSON
        const dataDir = path.join(__dirname, "../data");
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const outFile = path.join(dataDir, "recommendations.json");
        fs.writeFileSync(outFile, JSON.stringify(recommendations, null, 2));
        console.log(`Successfully generated recommendations for ${userIds.length} users.`);
        console.log(`Saved to ${outFile}`);

    } catch (err) {
        console.error("Error generating recommendations:", err);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

main();
