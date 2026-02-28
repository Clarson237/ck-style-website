// Profile Route Guard (Supabase)
// We do NOT require email verification: if Supabase returns a user, they can access protected pages.
function whenSupabaseReady(fn) {
    if (window.supabaseClient) fn(); else window.addEventListener('supabase-ready', fn, { once: true });
}

document.addEventListener('DOMContentLoaded', () => {
    whenSupabaseReady(() => {
        const supabase = window.supabaseClient;
        const check = () => {
            supabase.auth.getUser().then(({ data: { user }, error }) => {
                if (error || !user) {
                    window.location.href = 'login.html';
                }
            });
        };
        check();
        supabase.auth.onAuthStateChange((event, session) => {
            if (!session?.user) {
                window.location.href = 'login.html';
            }
        });
    });
});
