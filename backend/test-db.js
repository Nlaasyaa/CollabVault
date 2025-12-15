import { db } from "./db.js";

console.log("Testing database connection...\n");

try {
    // Test 1: Check connection
    const [result] = await db.query("SELECT 1 as test");
    console.log("✓ Database connection successful");

    // Test 2: Check users table
    const [users] = await db.query("SELECT COUNT(*) as count FROM users");
    console.log(`✓ Users table: ${users[0].count} users`);

    // Test 3: Check profiles table
    const [profiles] = await db.query("SELECT COUNT(*) as count FROM profiles");
    console.log(`✓ Profiles table: ${profiles[0].count} profiles`);

    // Test 4: Check posts table
    const [posts] = await db.query("SELECT COUNT(*) as count FROM posts");
    console.log(`✓ Posts table: ${posts[0].count} posts`);

    // Test 5: Check messages table
    const [messages] = await db.query("SELECT COUNT(*) as count FROM messages");
    console.log(`✓ Messages table: ${messages[0].count} messages`);

    // Test 6: Check connections table
    const [connections] = await db.query("SELECT COUNT(*) as count FROM connections");
    console.log(`✓ Connections table: ${connections[0].count} connections`);

    // Test 7: Check team_groups table
    const [teams] = await db.query("SELECT COUNT(*) as count FROM team_groups");
    console.log(`✓ Team groups table: ${teams[0].count} groups`);

    // Test 8: Check team_messages table
    const [teamMsgs] = await db.query("SELECT COUNT(*) as count FROM team_messages");
    console.log(`✓ Team messages table: ${teamMsgs[0].count} messages`);

    console.log("\n✓ All database tables are accessible!");

    process.exit(0);
} catch (err) {
    console.error("✗ Database error:", err.message);
    process.exit(1);
}
