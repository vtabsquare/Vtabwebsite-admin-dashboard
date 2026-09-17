import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: 'postgresql://postgres.doazlhotvvzmsngjbfne:Vtab%401234square@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres', ssl: { rejectUnauthorized: false } });
async function run() {
  await client.connect();
  await client.query('CREATE POLICY "Enable read for public" ON visitor_sessions FOR SELECT TO public USING (true);');
  await client.query('CREATE POLICY "Enable read for public" ON page_views FOR SELECT TO public USING (true);');
  await client.query('CREATE POLICY "Enable read for public" ON analytics_events FOR SELECT TO public USING (true);');
  console.log('Policies added');
  await client.end();
}
run().catch(console.error);
