const testLogin = async () => {
    const credentials = {
        email: "nlaasya.04@gmail.com",
        password: "12345678"
    };

    console.log("Testing login with:", credentials.email);
    console.log("Password:", credentials.password);
    console.log("");

    try {
        const response = await fetch("http://localhost:5000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credentials)
        });

        console.log("Response status:", response.status);
        console.log("Response status text:", response.statusText);

        const data = await response.json();
        console.log("\nResponse data:");
        console.log(JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log("\n✓ LOGIN SUCCESSFUL!");
            console.log("Token received:", data.token ? "Yes" : "No");
            console.log("User ID:", data.userId);
        } else {
            console.log("\n✗ LOGIN FAILED!");
            console.log("Error:", data.error);
        }
    } catch (err) {
        console.error("\n✗ Request failed:", err.message);
    }
};

testLogin();
