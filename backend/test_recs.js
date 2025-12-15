
const testRecommendations = async () => {
    try {
        // 1. Login
        console.log("Logging in...");
        const loginRes = await fetch("http://localhost:5000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "nlaasya.04@gmail.com",
                password: "12345678"
            })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.statusText}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.accessToken;
        console.log("Login successful. Token acquired.");

        // 2. Fetch Recommendations
        console.log("\nFetching recommendations...");
        const recsRes = await fetch("http://localhost:5000/recommendations", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!recsRes.ok) {
            const err = await recsRes.text();
            throw new Error(`Recommendations fetch failed: ${recsRes.status} ${recsRes.statusText} - ${err}`);
        }

        const recs = await recsRes.json();
        console.log("\n✓ SUCCESS: Recommendations endpoint is working!");
        console.log(`Received ${recs.length} recommended profiles.`);

        if (recs.length > 0) {
            console.log("\nTop Recommendation:");
            const topRec = recs[0];
            console.log(`- Name: ${topRec.display_name}`);
            console.log(`- Skills: ${topRec.skills.join(", ")}`);
            console.log(`- Interests: ${topRec.interests.join(", ")}`);
            console.log(`- Is Recommended Flag: ${topRec.is_recommended}`);
        } else {
            console.log("No recommendations found (this might be normal if there are no other users or data).");
        }

    } catch (err) {
        console.error("\n❌ FAILED:", err.message);
    }
};

testRecommendations();
