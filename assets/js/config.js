const SUPABASE_URL = 'https://mveqaasxeexsqyzsfwvm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12ZXFhYXN4ZWV4c3F5enNmd3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2OTc4MzQsImV4cCI6MjA1MjI3MzgzNH0.oqfgmJD6PKwRyy5m1PUkBZ85KHOr9HJ2CqYF_V45Ijk';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getSessionId() {
  let sessionId = localStorage.getItem('baqati_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('baqati_session_id', sessionId);
  }
  return sessionId;
}

export { supabase, getSessionId };
