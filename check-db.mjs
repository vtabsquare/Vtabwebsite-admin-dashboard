import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: 'postgresql://postgres.doazlhotvvzmsngjbfne:Vtab%401234square@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres', ssl: { rejectUnauthorized: false } });
async function run() {
  await client.connect();
  const res = await client.query('SELECT count(*) FROM visitor_sessions');
  console.log('Sessions count:', res.rows[0].count);
  await client.end();
}
run().catch(console.error);
