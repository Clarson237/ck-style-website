// Profile Route Guard (Supabase)
// We do NOT require email verification: if Supabase returns a user, they can access protected pages.
// Note: whenSupabaseReady is defined in auth.js — avoid re-declaring it here.
(function () {
    const onReady = (fn) => {
        if (window.supabaseClient) fn();
        else window.addEventListener('supabase-ready', fn, { once: true });
    };

    document.addEventListener('DOMContentLoaded', () => {
        onReady(() => {
            const supabase = window.supabaseClient;
            const check = () => {
                supabase.auth.getUser().then(({ data: { user }, error }) => {
                    if (error || !user) {
                        window.location.href = 'login.html';
                    }
                });
            };
            check();
            supabase.auth.onAuthStateChange((_event, session) => {
                if (!session?.user) {
                    window.location.href = 'login.html';
                }
            });
        });
    });
})();
