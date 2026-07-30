import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function checkLeads() {
  console.log("Checking demo_requests...");
  const { data, error } = await supabase.from('demo_requests').select('*');
  console.log("Error:", error);
  console.log("Data count:", data ? data.length : 0);
  console.log("Data:", data);
}

checkLeads();
