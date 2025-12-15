
import { db } from './db.js';

async function list() {
    console.log("Allowed Domains:");
    const [rows] = await db.query("SELECT * FROM allowed_domains");
    console.table(rows);
    process.exit();
}
list();
