import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: 'postgresql://postgres.doazlhotvvzmsngjbfne:Vtab%401234square@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres', ssl: { rejectUnauthorized: false } });

async function run() {
  await client.connect();
  console.log('Connected to DB. Fixing career_roles table id type...');
  
  await client.query(`
    DROP TABLE IF EXISTS public.career_roles CASCADE;

    CREATE TABLE public.career_roles (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        title TEXT NOT NULL,
        description TEXT,
        department TEXT,
        location TEXT,
        type TEXT,
        experience TEXT,
        requirements JSONB DEFAULT '[]'::jsonb
    );

    ALTER TABLE public.career_roles ENABLE ROW LEVEL SECURITY;

    DO $$ BEGIN
      CREATE POLICY "Allow public read access to career_roles" ON public.career_roles FOR SELECT USING (true);
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE POLICY "Allow authenticated insert to career_roles" ON public.career_roles FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    
    DO $$ BEGIN
      CREATE POLICY "Allow authenticated update to career_roles" ON public.career_roles FOR UPDATE TO authenticated USING (true);
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE POLICY "Allow authenticated delete to career_roles" ON public.career_roles FOR DELETE TO authenticated USING (true);
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  console.log('Table career_roles fixed successfully.');
  await client.end();
}

run().catch(console.error);
