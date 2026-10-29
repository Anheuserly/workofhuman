import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:AnheVps2022@vps.amcmep.in:5432/workofhuman"
});

async function main() {
  await client.connect();

  console.log("=== Checking All Database Schemas ===");
  const schemas = await client.query(`
    SELECT schema_name FROM information_schema.schemata 
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
  `);
  console.log("Active Schemas:", schemas.rows.map(r => r.schema_name));

  console.log("\n=== Checking Columns Matching 'email' ===");
  const emailCols = await client.query(`
    SELECT table_schema, table_name, column_name 
    FROM information_schema.columns 
    WHERE column_name ILIKE '%email%'
  `);
  console.log("Email Columns found:", emailCols.rows);

  let totalEmails = 0;
  for (const col of emailCols.rows) {
    const q = `SELECT "${col.column_name}" as email_val FROM "${col.table_schema}"."${col.table_name}" WHERE "${col.column_name}" IS NOT NULL`;
    const res = await client.query(q);
    console.log(`- ${col.table_schema}.${col.table_name}.${col.column_name}: ${res.rows.length} rows found`);
    if (res.rows.length > 0) {
      console.log("  Values:", res.rows);
      totalEmails += res.rows.length;
    }
  }

  console.log("\n=== Scanning all text/json fields for '@' symbol ===");
  // Check profiles table for any mention of an email in bio, social_links, etc.
  const profiles = await client.query(`SELECT username, email, bio, social_links FROM workofhuman.profiles`);
  for (const p of profiles.rows) {
    const str = JSON.stringify(p);
    const emailsFound = str.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailsFound) {
      console.log(`Profile @${p.username} has email reference:`, emailsFound);
      totalEmails += emailsFound.length;
    }
  }

  console.log("\n=== TOTAL EMAILS DISCOVERED ===", totalEmails);

  await client.end();
}

main().catch(console.error);
