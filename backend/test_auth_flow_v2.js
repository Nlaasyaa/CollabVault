
import { db } from './db.js';

const BASE_URL = 'http://localhost:5000/auth';
const TEST_EMAIL = 'test_user_v2@bit.edu.in';
const TEST_PASS = 'password123';

async function testAuth() {
    try {
        console.log("--- Starting Auth Flow Test ---");

        // 1. Cleanup
        console.log("Cleaning up previous test user...");
        await db.query("DELETE FROM users WHERE email = ?", [TEST_EMAIL]);
        // Also cleanup profiles
        // (Assuming CASCADE or just ignore for test)

        // 2. Register
        console.log("Testing Registration...");
        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASS,
                display_name: "Test User V2"
            })
        });

        let regData;
        try {
            regData = await regRes.json();
        } catch (e) {
            console.log("Could not parse JSON", await regRes.text());
        }
        console.log("Registration Response:", regRes.status, regData);

        if (regRes.status !== 201) {
            console.log("Registration failed, aborting.");
            // process.exit(); // Let's keep going just to see errors
        }

        // 4. Try Login (Should Fail)
        console.log("Testing Login (Unverified)...");
        const loginFailRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS })
        });
        const loginFailData = await loginFailRes.json();
        console.log("Login (Unverified) Response:", loginFailRes.status, loginFailData);

        // 5. Manually Verify
        console.log("Manually verifying user in DB...");
        await db.query("UPDATE users SET email_verified = 1 WHERE email = ?", [TEST_EMAIL]);

        // 6. Try Login (Should Success)
        console.log("Testing Login (Verified)...");
        const loginSuccessRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS })
        });
        const loginSuccessData = await loginSuccessRes.json();
        console.log("Login (Verified) Response:", loginSuccessRes.status, loginSuccessData);

        // 7. Test Refresh
        if (loginSuccessData.refreshToken) {
            console.log("Testing Refresh Token...");
            const refreshRes = await fetch(`${BASE_URL}/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: loginSuccessData.refreshToken })
            });
            const refreshData = await refreshRes.json();
            console.log("Refresh Response:", refreshRes.status, refreshData);
        }

    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        process.exit();
    }
}

testAuth();
