import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: 'postgresql://postgres.doazlhotvvzmsngjbfne:Vtab%401234square@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres', ssl: { rejectUnauthorized: false } });

async function run() {
  await client.connect();
  
  const sql = `
    CREATE TABLE IF NOT EXISTS iot_content (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      header_badge VARCHAR NOT NULL,
      header_title VARCHAR NOT NULL,
      header_highlight VARCHAR NOT NULL,
      header_description TEXT NOT NULL,
      reference_app_badge VARCHAR NOT NULL,
      reference_app_title VARCHAR NOT NULL,
      benefits JSONB NOT NULL,
      capabilities JSONB NOT NULL,
      signals JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE iot_content ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Enable read for public" ON iot_content;
    CREATE POLICY "Enable read for public" ON iot_content FOR SELECT TO public USING (true);
    
    DROP POLICY IF EXISTS "Enable full access for admin" ON iot_content;
    CREATE POLICY "Enable full access for admin" ON iot_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- Insert default row if table is empty
    INSERT INTO iot_content (
      header_badge, header_title, header_highlight, header_description,
      reference_app_badge, reference_app_title, benefits, capabilities, signals
    )
    SELECT
      'Industrial IoT & Edge AI',
      'AI-powered IoT for ',
      'real-time operations',
      'VTab Square engineers intelligent IoT applications that connect physical infrastructure with AI—helping industrial teams monitor health, identify risks, and act on live operational signals.',
      'Reference application',
      'AI Server Health Command Center',
      '["24/7 Monitoring", "Early Risk Alerts", "Edge + Cloud"]'::jsonb,
      '[
        {
          "icon": "ServerCog",
          "title": "AI Server Room Health Management",
          "description": "Continuously monitor infrastructure health, environmental conditions, and equipment telemetry from one intelligent operations layer."
        },
        {
          "icon": "Gauge",
          "title": "Predictive Asset Intelligence",
          "description": "Detect unusual patterns early and turn sensor signals into maintenance priorities before operational issues escalate."
        },
        {
          "icon": "RadioTower",
          "title": "Real-Time Industrial Monitoring",
          "description": "Connect machines, gateways, and facility sensors for live status visibility across industrial environments."
        },
        {
          "icon": "CloudCog",
          "title": "Edge-to-Cloud Automation",
          "description": "Run time-sensitive decisions at the edge while synchronizing events, insights, and audit history with cloud platforms."
        }
      ]'::jsonb,
      '[
        { "icon": "Thermometer", "label": "Environment", "detail": "Temperature · Humidity · Airflow", "color": "text-cyan-400" },
        { "icon": "Activity", "label": "Equipment Health", "detail": "Load · Vibration · Runtime", "color": "text-emerald-400" },
        { "icon": "ShieldAlert", "label": "Risk Detection", "detail": "Anomalies · Thresholds · Escalation", "color": "text-amber-400" }
      ]'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM iot_content);
  `;
  
  await client.query(sql);
  console.log('iot_content table created and seeded successfully.');
  await client.end();
}
run().catch(console.error);
