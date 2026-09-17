-- 1. Visitor Sessions Table
CREATE TABLE IF NOT EXISTS visitor_sessions (
  session_id UUID PRIMARY KEY,
  visitor_id UUID NOT NULL,
  browser VARCHAR,
  browser_version VARCHAR,
  os VARCHAR,
  device_type VARCHAR,
  screen_width INT,
  screen_height INT,
  language VARCHAR,
  traffic_source VARCHAR,
  referrer TEXT,
  landing_page VARCHAR,
  page_count INT DEFAULT 1,
  duration_seconds INT DEFAULT 0,
  ip_address VARCHAR,
  country VARCHAR,
  country_code VARCHAR,
  region VARCHAR,
  city VARCHAR,
  timezone VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Page Views Table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL,
  page_name VARCHAR,
  page_title VARCHAR,
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  time_on_page INT
);

-- 3. Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL,
  event_name VARCHAR NOT NULL,
  event_data JSONB,
  page_name VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RPC Function to update page counts
CREATE OR REPLACE FUNCTION increment_session_page_count(p_session_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE visitor_sessions
  SET page_count = page_count + 1
  WHERE session_id = p_session_id;
$$;

-- 5. Set up Security Policies (RLS)
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow the website to insert/update visitor data anonymously
CREATE POLICY "Enable insert for public" ON visitor_sessions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for public" ON visitor_sessions FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable insert for public" ON page_views FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for public" ON page_views FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable insert for public" ON analytics_events FOR INSERT TO public WITH CHECK (true);

-- Allow authenticated Admins to read the data for the Dashboard
CREATE POLICY "Enable read for admin" ON visitor_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for admin" ON page_views FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for admin" ON analytics_events FOR SELECT TO authenticated USING (true);
