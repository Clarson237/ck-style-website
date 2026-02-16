// Profile Route Guard (Supabase)
// We do NOT require email verification: if Supabase returns a user, they can access protected pages.
function whenSupabaseReady(fn) {
    if (window.supabaseClient) fn(); else window.addEventListener('supabase-ready', fn, { once: true });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Guard: Checking authentication state...");
    whenSupabaseReady(() => {
        const supabase = window.supabaseClient;
        const check = () => {
            supabase.auth.getUser().then(({ data: { user }, error }) => {
                if (error || !user) {
                    console.log("Guard: No user detected, redirecting to login...");
                    window.location.href = 'login.html';
                } else {
                    console.log("Guard: Authenticated as", user.email);
                }
            });
        };
        check();
        supabase.auth.onAuthStateChange((event, session) => {
            if (!session?.user) {
                console.log("Guard: Auth state changed, no user, redirecting...");
                window.location.href = 'login.html';
            }
        });
    });
});
