import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "../data");
const RECOMMENDATIONS_FILE = path.join(DATA_DIR, "teamup_recommendation_summary.json");

/* ============================================================
   GET RECOMMENDATIONS
   ============================================================ */
router.get("/", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        let recommendedUserIds = [];
        const RECOMMENDATIONS_JSON = path.join(DATA_DIR, "recommendations.json");
        const SCRIPT_PATH = path.join(__dirname, "../scripts/recommender.js");

        // Helper to run the script
        const generateRecommendations = () => {
            return new Promise((resolve, reject) => {
                console.log("Generating fresh recommendations...");
                // Use 'node' to run the script
                import('child_process').then(cp => {
                    cp.exec(`node "${SCRIPT_PATH}"`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`exec error: ${error}`);
                            console.error(`stderr: ${stderr}`);
                            // Don't reject, just resolve so we can try to return partial/old data or fallback
                            resolve(false);
                            return;
                        }
                        console.log(`stdout: ${stdout}`);
                        resolve(true);
                    });
                });
            });
        };

        // Check if file exists and is fresh (e.g., < 10 mins old)
        let shouldGenerate = true;
        if (fs.existsSync(RECOMMENDATIONS_JSON)) {
            const stats = fs.statSync(RECOMMENDATIONS_JSON);
            const now = new Date().getTime();
            const mtime = new Date(stats.mtime).getTime();
            if (now - mtime < 10 * 60 * 1000) { // 10 minutes
                shouldGenerate = false;
            }
        }

        if (shouldGenerate) {
            await generateRecommendations();
        }

        // Read recommendations
        if (fs.existsSync(RECOMMENDATIONS_JSON)) {
            try {
                const fileContent = fs.readFileSync(RECOMMENDATIONS_JSON, "utf-8");
                const recommendations = JSON.parse(fileContent);
                if (recommendations[userId]) {
                    recommendedUserIds = recommendations[userId];
                }
            } catch (err) {
                console.error("Error parsing recommendations file:", err);
            }
        }

        // --- FILTER OUT EXISTING CONNECTIONS / REQUESTS ---
        const [existingConnections] = await db.query(
            "SELECT target_user_id FROM connections WHERE user_id = ? UNION SELECT user_id FROM connections WHERE target_user_id = ?",
            [userId, userId]
        );
        const excludedIds = new Set(existingConnections.map(row => row.target_user_id || row.user_id));
        excludedIds.add(userId); // Exclude self

        // Filter recommended list
        recommendedUserIds = recommendedUserIds.filter(id => !excludedIds.has(id));

        // Fallback if still empty
        if (!recommendedUserIds || recommendedUserIds.length === 0) {
            // Get random users who are NOT in excluded list
            const placeholders = Array.from(excludedIds).map(() => "?").join(",");
            const query = excludedIds.size > 0
                ? `SELECT id FROM users WHERE id NOT IN (${placeholders}) LIMIT 20`
                : "SELECT id FROM users WHERE id != ? LIMIT 20";

            const params = excludedIds.size > 0
                ? Array.from(excludedIds)
                : [userId];

            const [allUsers] = await db.query(query, params);
            recommendedUserIds = allUsers.map(u => u.id);
        }

        if (recommendedUserIds.length === 0) {
            return res.json([]);
        }

        // Fetch profile details for recommended users
        const placeholders = recommendedUserIds.map(() => "?").join(",");
        if (placeholders.length === 0) return res.json([]);

        const [profiles] = await db.query(
            `SELECT * FROM profiles WHERE user_id IN (${placeholders})`,
            recommendedUserIds
        );

        // Fetch skills and interests
        const profilesWithDetails = await Promise.all(profiles.map(async (profile) => {
            const [skills] = await db.query(
                `SELECT s.name 
                 FROM user_skills us
                 JOIN skills s ON s.id = us.skill_id
                 WHERE us.user_id = ?`,
                [profile.user_id]
            );

            const [interests] = await db.query(
                `SELECT i.name 
                 FROM user_interests ui
                 JOIN interests i ON i.id = ui.interest_id
                 WHERE ui.user_id = ?`,
                [profile.user_id]
            );

            // Fetch connection count for badge
            const [connCount] = await db.query(
                `SELECT COUNT(*) as count 
                 FROM connections c1
                 INNER JOIN connections c2 
                   ON c1.user_id = c2.target_user_id 
                   AND c1.target_user_id = c2.user_id
                 WHERE c1.user_id = ?`,
                [profile.user_id]
            );

            return {
                ...profile,
                skills: skills.map(s => s.name),
                interests: interests.map(i => i.name),
                connection_count: connCount[0]?.count || 0,
                is_recommended: true
            };
        }));

        // Sort based on recommendation order
        profilesWithDetails.sort((a, b) => {
            return recommendedUserIds.indexOf(a.user_id) - recommendedUserIds.indexOf(b.user_id);
        });

        res.json(profilesWithDetails);

    } catch (err) {
        console.error("Error fetching recommendations:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
