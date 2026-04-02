import { db } from "../db.js";
import fs from "fs";
import path from "path";

const OUTPUT_FILE = path.join(process.cwd(), "data/recommendations.json");

// ------------------------
// HELPERS
// ------------------------

const intersectionSize = (setA, setB) => {
  let count = 0;
  for (let val of setA) {
    if (setB.has(val)) count++;
  }
  return count;
};

const getSkillOverlap = (userSkills, targetSkills) => {
  if (!userSkills.size || !targetSkills.size) return 0;
  return intersectionSize(userSkills, targetSkills) / userSkills.size;
};

const getInterestOverlap = (a, b) => {
  if (!a.size || !b.size) return 0;
  return intersectionSize(a, b) / a.size;
};

// Complementary roles
const getComplementaryScore = (userSkills, targetSkills) => {
  let score = 0;

  const frontend = new Set(["react", "html", "css", "frontend"]);
  const backend = new Set(["node", "django", "flask", "backend"]);
  const ml = new Set(["ml", "ai", "python"]);
  const design = new Set(["ui", "ux", "figma"]);

  const has = (skills, group) => intersectionSize(skills, group) > 0;

  if (has(userSkills, frontend) && has(targetSkills, backend)) score += 1;
  if (has(userSkills, backend) && has(targetSkills, frontend)) score += 1;
  if (has(userSkills, ml) && has(targetSkills, design)) score += 0.5;

  return Math.min(score, 1);
};

const getSwipeAffinity = (userId, targetId, swipeMap) => {
  const swiped = swipeMap.get(userId);
  if (!swiped) return 0.1; // small base score

  return swiped.has(targetId) ? 1 : 0.1;
};

// ------------------------
// MAIN FUNCTION
// ------------------------

const generateRecommendations = async () => {
  try {
    console.log("🚀 Generating optimized recommendations...");

    // 1️⃣ Get all users
    const [users] = await db.query("SELECT id FROM users");

    if (!users.length) {
      console.log("⚠️ No users found");
      return;
    }

    const userIds = users.map(u => u.id);

    // 2️⃣ Fetch ALL skills in ONE query
    const [skillsRows] = await db.query(`
      SELECT us.user_id, LOWER(s.name) as skill
      FROM user_skills us
      JOIN skills s ON s.id = us.skill_id
    `);

    const skillMap = new Map();
    for (let row of skillsRows) {
      if (!skillMap.has(row.user_id)) {
        skillMap.set(row.user_id, new Set());
      }
      skillMap.get(row.user_id).add(row.skill);
    }

    // 3️⃣ Fetch ALL interests in ONE query
    const [interestRows] = await db.query(`
      SELECT ui.user_id, LOWER(i.name) as interest
      FROM user_interests ui
      JOIN interests i ON i.id = ui.interest_id
    `);

    const interestMap = new Map();
    for (let row of interestRows) {
      if (!interestMap.has(row.user_id)) {
        interestMap.set(row.user_id, new Set());
      }
      interestMap.get(row.user_id).add(row.interest);
    }

    // 4️⃣ Fetch swipe data
    const [swipes] = await db.query(`
      SELECT swiper, target 
      FROM swipes 
      WHERE response = 'yes'
    `);

    const swipeMap = new Map();
    for (let swipe of swipes) {
      if (!swipeMap.has(swipe.swiper)) {
        swipeMap.set(swipe.swiper, new Set());
      }
      swipeMap.get(swipe.swiper).add(swipe.target);
    }

    // 5️⃣ Generate recommendations
    const recommendations = {};

    for (let userId of userIds) {
      const userSkills = skillMap.get(userId) || new Set();
      const userInterests = interestMap.get(userId) || new Set();

      const scores = [];

      for (let targetId of userIds) {
        if (userId === targetId) continue;

        const targetSkills = skillMap.get(targetId) || new Set();
        const targetInterests = interestMap.get(targetId) || new Set();

        const skillOverlap = getSkillOverlap(userSkills, targetSkills);
        const complementaryScore = getComplementaryScore(userSkills, targetSkills);
        const interestOverlap = getInterestOverlap(userInterests, targetInterests);
        const swipeAffinity = getSwipeAffinity(userId, targetId, swipeMap);

        const score =
          skillOverlap * 0.35 +
          complementaryScore * 0.25 +
          interestOverlap * 0.15 +
          swipeAffinity * 0.25;

        scores.push({ userId: targetId, score });
      }

      // Sort + top 20
      scores.sort((a, b) => b.score - a.score);

      recommendations[userId] = scores
        .slice(0, 20)
        .map(s => s.userId);
    }

    // 6️⃣ Ensure folder exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 7️⃣ Save file
    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(recommendations, null, 2)
    );

    console.log("✅ Optimized recommendations generated!");
  } catch (err) {
    console.error("❌ Error generating recommendations:", err);
  }
};

// Run
generateRecommendations();

