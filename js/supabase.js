// Initialize Supabase Client (auth + data)
// Use only the PUBLISHABLE (anon) key here. Never put the secret key in frontend code.
(function () {
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase: CDN script not loaded. Add <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> before this file.');
        return;
    }
    const { createClient } = window.supabase;
    // Publishable (anon) key only. Never use secret key in frontend.
    const SUPABASE_URL = 'https://xlrzoylmgwsrxjcdwsos.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_2OO4Xgabkjh1Gr0h82_RSw_PwzNvs6P';
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Pre-fetch session immediately so downstream code can reuse it
    window._supabaseSessionPromise = window.supabaseClient.auth.getSession();

    window.dispatchEvent(new Event('supabase-ready'));
})();
