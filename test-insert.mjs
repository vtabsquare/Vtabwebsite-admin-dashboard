async function testInsert() {
  const SUPA_URL = 'https://doazlhotvvzmsngjbfne.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYXpsaG90dnZ6bXNuZ2piZm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMjU4MDksImV4cCI6MjEwMjYwMTgwOX0.udo2LDr0xOvAtO9jCp0GEIIVWpzyt4J4P2iAyQ4oMWg';
  const sessionId = crypto.randomUUID();
  const visitorId = crypto.randomUUID();
  
  const res = await fetch(`${SUPA_URL}/rest/v1/visitor_sessions?on_conflict=session_id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Prefer': 'return=minimal,resolution=merge-duplicates'
    },
    body: JSON.stringify({
      session_id: sessionId,
      visitor_id: visitorId,
      landing_page: 'home'
    })
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}
testInsert().catch(console.error);
