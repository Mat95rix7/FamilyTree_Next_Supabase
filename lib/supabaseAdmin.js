import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ PAS de NEXT_PUBLIC_

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables d\'environnement admin Supabase manquantes')
}

// Client admin pour les API routes uniquement
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})