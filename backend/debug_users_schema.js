
import { db } from './db.js';

async function checkSchema() {
    console.log("Users Table Columns:");
    const [rows] = await db.query("DESCRIBE users");
    rows.forEach(r => console.log(r.Field, r.Type));
    process.exit();
}
checkSchema();
