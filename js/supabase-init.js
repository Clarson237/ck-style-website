// Load Supabase client (ESM). Use only the PUBLISHABLE key; never put the secret key in frontend code.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://eyonfjtquutggtxnvvyl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2OO4Xgabkjh1Gr0h82_RSw_PwzNvs6P';

window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.dispatchEvent(new Event('supabase-ready'));
console.log('Supabase: Client initialized');
