// Dynamic Navbar (Supabase)
function whenSupabaseReady(fn) {
    if (window.supabaseClient) fn(); else window.addEventListener('supabase-ready', fn, { once: true });
}

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    whenSupabaseReady(() => {
        const supabase = window.supabaseClient;

        const updateNavbar = async (user) => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const themeBtn = `
                <li class="nav-item ms-lg-3">
                    <button class="btn btn-link nav-link p-2" id="theme-toggle-btn" 
                            aria-label="Toggle light and dark mode" 
                            aria-pressed="${currentTheme === 'dark'}"
                            style="border:none; text-decoration:none;">
                        <span id="theme-icon" aria-hidden="true">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
                    </button>
                </li>
            `;

            if (user) {
                // Fetch user theme preference from profile
                const { data, error } = await supabase.from('profiles').select('theme').eq('id', user.id).single();
                if (!error && data?.theme) {
                    window.CK_THEME.syncWithProfile(data.theme);
                }

                navLinks.innerHTML = `
                    <li class="nav-item"><a class="nav-link" href="index.html">Dashboard</a></li>
                    <li class="nav-item"><a class="nav-link" href="collection.html">Collection</a></li>
                    <li class="nav-item"><a class="nav-link" href="measure-me.html">Measure Me</a></li>
                    <li class="nav-item"><a class="nav-link" href="profile.html">Profile</a></li>
                    ${themeBtn}
                    <li class="nav-item"><button class="btn btn-primary ms-lg-2" id="logout-btn">Logout</button></li>
                `;
            } else {
                navLinks.innerHTML = `
                    <li class="nav-item"><a class="nav-link" href="index.html">Dashboard</a></li>
                    <li class="nav-item"><a class="nav-link" href="collection.html">Collection</a></li>
                    <li class="nav-item"><a class="nav-link" href="measure-me.html">Measure Me</a></li>
                    <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
                    ${themeBtn}
                    <li class="nav-item"><a class="nav-link btn btn-primary ms-lg-2" href="signup.html">Signup</a></li>
                `;
            }

            // Theme Toggle Logic
            const toggleBtn = document.getElementById('theme-toggle-btn');
            if (toggleBtn) {
                toggleBtn.onclick = async () => {
                    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                    window.CK_THEME.apply(nextTheme);

                    // Update UI immediately (Optimistic)
                    document.getElementById('theme-icon').innerText = nextTheme === 'dark' ? '☀️' : '🌙';
                    toggleBtn.setAttribute('aria-pressed', nextTheme === 'dark');

                    // If logged in, sync to Supabase
                    const { data: { user: currentUser } } = await supabase.auth.getUser();
                    if (currentUser) {
                        await supabase.from('profiles').update({ theme: nextTheme }).eq('id', currentUser.id);
                    }
                };
            }

            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.onclick = async () => {
                    await supabase.auth.signOut();
                    window.location.href = 'index.html';
                };
            }
        };

        // Listen for global theme changes to sync icon
        window.addEventListener('theme-changed', (e) => {
            const theme = e.detail;
            const icon = document.getElementById('theme-icon');
            if (icon) icon.innerText = theme === 'dark' ? '☀️' : '🌙';
            const btn = document.getElementById('theme-toggle-btn');
            if (btn) btn.setAttribute('aria-pressed', theme === 'dark');
        });

        supabase.auth.getUser().then(({ data: { user } }) => {
            updateNavbar(user);
        });

        supabase.auth.onAuthStateChange((event, session) => {
            updateNavbar(session?.user ?? null);
        });
    });
});
