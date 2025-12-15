
import { db } from './db.js';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000/auth';
const TEST_EMAIL = 'test_user_v2@bit.edu.in';
const TEST_PASS = 'password123';

async function testAuth() {
    try {
        console.log("--- Starting Auth Flow Test (Strict) ---");
        const log = (msg) => {
            console.log(msg);
            fs.appendFileSync('test_log.txt', msg + '\n');
        };

        // 1. Cleanup
        log("Cleaning up previous test user...");
        await db.query("DELETE FROM users WHERE email = ?", [TEST_EMAIL]);
        // await db.query("DELETE FROM profiles WHERE user_id NOT IN (SELECT id FROM users)");

        // 2. Register
        log("Testing Registration...");
        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASS,
                display_name: "Test User V2"
            })
        });

        let regData = await regRes.json();
        log(`Registration Response: ${regRes.status} ${JSON.stringify(regData)}`);

        if (regRes.status !== 201) {
            log("Registration failed, aborting.");
            process.exit();
        }

        // ... truncated rest for now to focus on reg failure ...
        log("Registration success!");

    } catch (err) {
        console.error("Test failed:", err);
        fs.appendFileSync('test_log.txt', `Error: ${err}\n`);
    } finally {
        process.exit();
    }
}

testAuth();
