const testLogin = async () => {
    try {
        const response = await fetch("http://localhost:5000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: "nlaasya.04@gmail.com",
                password: "12345678"
            })
        });

        console.log("Status:", response.status);
        console.log("Status Text:", response.statusText);

        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log("\n✓ Login successful!");
            console.log("Token:", data.token);
        } else {
            console.log("\n✗ Login failed!");
            console.log("Error:", data.error);
        }
    } catch (err) {
        console.error("Request failed:", err.message);
    }
};

testLogin();
