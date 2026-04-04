import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────────────────────────
// Replace these with your actual Supabase project credentials.
// Dashboard → Settings → API
// ─────────────────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
export const API_URL = import.meta.env.VITE_API_URL || 'https://arka-backend-8bgc.onrender.com'
export const FRONTEND_URL = 'https://arka-5m1l.onrender.com'
// Set to 'false' for dev/testing to skip email verification
export const REQUIRE_EMAIL_VERIFICATION = import.meta.env.VITE_REQUIRE_EMAIL_VERIFICATION !== 'false'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
