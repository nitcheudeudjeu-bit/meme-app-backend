const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const path = require('path');

// Force Node to look for the .env file exactly in your project's root folder
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_KEY || '').trim();

// 🔍 Debug log to verify if your variables are loading into the system
console.log("\n==========================================");
console.log("🔍 [ENV CHECK] Supabase URL:", supabaseUrl ? "FOUND ✅" : "NOT FOUND ❌");
console.log("🔍 [ENV CHECK] Supabase Key:", supabaseKey ? "FOUND ✅" : "NOT FOUND ❌");
console.log("==========================================\n");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Missing Supabase credentials. Check your .env file variable names!");
  process.exit(1);
}

let supabase;

try {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    },
    realtime: {
      transport: ws
    }
  });
  console.log("⚡ Supabase Client initialized successfully!");
} catch (initError) {
  console.error("❌ Supabase Initialization Failed:", initError.message);
  process.exit(1);
}

module.exports = supabase;