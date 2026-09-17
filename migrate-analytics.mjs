import pg from 'pg';
const { Client } = pg;

const OLD_REF = 'kpsdjobokwiohxxcatdw';
const OLD_DB_PASSWORD = 'Vtabsquare@123';
const OLD_POOLER_HOST = 'aws-0-ap-southeast-1.pooler.supabase.com';

const NEW_REF = 'doazlhotvvzmsngjbfne';
const NEW_DB_PASSWORD = 'Vtab@1234square';
const NEW_POOLER_HOST = 'aws-0-ap-southeast-1.pooler.supabase.com';

const TABLES = ['visitor_sessions', 'page_views', 'analytics_events'];

function connStr(ref, password, host) {
  return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${host}:5432/postgres`;
}

async function getColumns(client, table) {
  const res = await client.query(
    `SELECT column_name, data_type, udt_name, is_nullable, column_default, character_maximum_length
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table]
  );
  return res.rows;
}

async function getPrimaryKey(client, table) {
  const res = await client.query(
    `SELECT a.attname AS column_name
     FROM pg_index i
     JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
     WHERE i.indrelid = $1::regclass AND i.indisprimary`,
    [table]
  );
  return res.rows.map(r => r.column_name);
}

function colTypeSql(col) {
  if (col.data_type === 'USER-DEFINED') return col.udt_name;
  if (col.data_type === 'character varying') {
    return col.character_maximum_length ? `varchar(${col.character_maximum_length})` : 'varchar';
  }
  if (col.data_type === 'ARRAY') return `${col.udt_name.replace(/^_/, '')}[]`;
  if (col.data_type === 'timestamp with time zone') return 'timestamptz';
  if (col.data_type === 'timestamp without time zone') return 'timestamp';
  return col.data_type;
}

async function main() {
  const oldClient = new Client({ connectionString: connStr(OLD_REF, OLD_DB_PASSWORD, OLD_POOLER_HOST), ssl: { rejectUnauthorized: false } });
  const newClient = new Client({ connectionString: connStr(NEW_REF, NEW_DB_PASSWORD, NEW_POOLER_HOST), ssl: { rejectUnauthorized: false } });

  await oldClient.connect();
  await newClient.connect();
  console.log("Connected to both DBs");

  for (const table of TABLES) {
    try {
      const cols = await getColumns(oldClient, table);
      if (cols.length === 0) {
        console.log(`Table ${table} not found in OLD DB`);
        continue;
      }
      const pk = await getPrimaryKey(oldClient, table);
      
      const colDefs = cols.map(c => {
        let def = `"${c.column_name}" ${colTypeSql(c)}`;
        if (c.column_default && !c.column_default.includes('nextval') && !c.column_default.includes('uuid_generate')) {
          def += ` DEFAULT ${c.column_default}`;
        }
        if (c.is_nullable === 'NO' && !pk.includes(c.column_name)) def += ' NOT NULL';
        return def;
      });
      if (pk.length) {
        colDefs.push(`PRIMARY KEY (${pk.map(k => `"${k}"`).join(', ')})`);
      }
      
      await newClient.query(`CREATE TABLE IF NOT EXISTS "${table}" (\n  ${colDefs.join(',\n  ')}\n);`);
      console.log(`Created table ${table}`);

      const { rows } = await oldClient.query(`SELECT * FROM "${table}"`);
      console.log(`Copying ${rows.length} rows into ${table}...`);
      
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        for (const row of rows) {
          const vals = columns.map(c => row[c]);
          const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
          try {
            await newClient.query(
              `INSERT INTO "${table}" ("${columns.join('", "')}") VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
              vals
            );
          } catch (e) {
            console.error(`Error inserting row into ${table}:`, e.message);
          }
        }
      }
      
      // RLS policies
      await newClient.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      try { await newClient.query(`CREATE POLICY "Enable all for ${table}" ON "${table}" FOR ALL USING (true) WITH CHECK (true);`); } catch(e) {}
      
    } catch(e) {
      console.error(`Error processing ${table}:`, e.message);
    }
  }

  await oldClient.end();
  await newClient.end();
  console.log("Done");
}

main().catch(console.error);
