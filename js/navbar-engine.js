/**
 * CK STYLE - Signature Navbar Engine
 * Single Source of Truth for Navigation
 * Optimized: instant shell render, async auth hydration
 */

(function () {
    const PATHS = {
        HOME: 'index.html',
        COLLECTION: 'collection.html',
        MEASURE: 'measure-me.html',
        CONTACT: 'contact.html',
        PREDICT: 'predict-measurements.html',
        PROFILE: 'profile.html',
        ADMIN: 'admin/index.html',
        LOGIN: 'login.html',
        SIGNUP: 'signup.html'
    };

    const isSubDir = window.location.pathname.includes('/admin/');
    const base = isSubDir ? '../' : '';

    const getActivePath = () => {
        const path = window.location.pathname;
        return path.split('/').pop() || 'index.html';
    };

    const isLinkActive = (path) => getActivePath() === path ? 'active' : '';

    const resolvePath = (path) => {
        if (path === 'admin/index.html' && isSubDir) return 'index.html';
        return base + path;
    };

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

    /**
     * Build the static navbar HTML (no auth state needed).
     * This renders instantly — brand, links, theme toggle, and a login skeleton.
     */
    const buildNavShell = () => `
        <div class="container">
            <a class="navbar-brand fw-bold" href="${resolvePath(PATHS.HOME)}">
                <span class="needle-thread nav-decoration"></span>
                CK STYLE
            </a>
            
            <div class="d-flex align-items-center">
                <!-- Mobile Theme Toggle -->
                <div class="d-lg-none me-2">
                     <button class="btn btn-link p-2 theme-toggle-btn-mobile" 
                             aria-label="Toggle theme" 
                             style="border:none; text-decoration:none; font-size: 1.2rem;">
                        <span>${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
                    </button>
                </div>

                <button class="navbar-toggler tailored-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent" aria-controls="navContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>

            <div class="collapse navbar-collapse" id="navContent">
                <ul class="navbar-nav ms-auto align-items-center">
                    <li class="nav-item">
                        <a class="nav-link tailored-nav-link fw-bold ${isLinkActive(PATHS.HOME)}" href="${resolvePath(PATHS.HOME)}">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link tailored-nav-link fw-bold ${isLinkActive(PATHS.COLLECTION)}" href="${resolvePath(PATHS.COLLECTION)}">Collection</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link tailored-nav-link fw-bold ${isLinkActive(PATHS.MEASURE)}" href="${resolvePath(PATHS.MEASURE)}">Measure Me</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link tailored-nav-link fw-bold ${isLinkActive(PATHS.CONTACT)}" href="${resolvePath(PATHS.CONTACT)}">Contact</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link tailored-nav-link fw-bold ${isLinkActive(PATHS.PREDICT)}" href="${resolvePath(PATHS.PREDICT)}">Predict</a>
                    </li>
                    
                    <!-- Admin link placeholder (hidden by default, shown after auth check) -->
                    <li class="nav-item d-none" id="nav-admin-link">
                        <a class="nav-link tailored-nav-link fw-bold ${isLinkActive(PATHS.ADMIN.split('/').pop())}" href="${resolvePath(PATHS.ADMIN)}">Admin</a>
                    </li>

                    <!-- Theme Toggle (Desktop) -->
                    <li class="nav-item ms-lg-3 d-none d-lg-block">
                        <button class="btn btn-link nav-link p-2" id="theme-toggle-btn" 
                                aria-label="Toggle light and dark mode" 
                                aria-pressed="${currentTheme === 'dark'}"
                                style="border:none; text-decoration:none;">
                            <span id="theme-icon" aria-hidden="true">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
                        </button>
                    </li>

                    <!-- Auth area: shows login/signup by default, replaced by user menu after auth -->
                    <li class="nav-item ms-lg-3" id="nav-auth-area">
                        <a class="nav-link tailored-nav-link fw-bold ${isLinkActive(PATHS.LOGIN)}" href="${resolvePath(PATHS.LOGIN)}">Login</a>
                    </li>
                    <li class="nav-item" id="nav-signup-area">
                        <a class="btn btn-primary ms-lg-2 mt-3 mt-lg-0 rounded-pill px-4 fw-bold" href="${resolvePath(PATHS.SIGNUP)}">Sign Up</a>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Global Notification Popup Modal -->
        <div class="modal fade" id="globalNotifModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content glass border-0 rounded-4">
                    <div class="modal-header border-0 pb-0">
                        <h5 class="modal-title fw-bold text-gold">System Alert</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4 text-center">
                        <div class="mb-3">
                            <i class="bi bi-bell-fill fs-1 text-gold"></i>
                        </div>
                        <h4 id="popup-title" class="mb-2">New Notification</h4>
                        <p id="popup-message" class="text-white opacity-75 mb-4"></p>
                        <button class="btn btn-gold w-100 py-2 fw-bold rounded-pill" data-bs-dismiss="modal" onclick="window.markNotifRead(window.currentPopupId)">Got it!</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    /**
     * Build the authenticated user menu HTML (replaces login/signup links).
     */
    const buildUserMenu = (user, isAdmin) => `
        <!-- Notifications -->
        <li class="nav-item dropdown ms-lg-3 d-none d-lg-block">
            <a class="nav-link tailored-nav-link position-relative px-2" href="#" id="notifyDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-bell-fill"></i>
                <span id="notif-badge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none" style="font-size: 0.6rem; padding: 0.25em 0.5em;">
                    0
                </span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end tailored-dropdown animate-fade-up p-0" id="notif-list" style="width: 300px; max-height: 400px; overflow-y: auto;">
                <li class="p-4 text-center text-muted small">No new notifications</li>
            </ul>
        </li>

        <li class="nav-item dropdown ms-lg-3">
            <a class="nav-link dropdown-toggle tailored-nav-link fw-bold" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                ${user.email.split('@')[0]}
            </a>
            <ul class="dropdown-menu tailored-dropdown animate-fade-up" aria-labelledby="userDropdown">
                <li><a class="dropdown-item d-lg-none" href="#">Notifications <span class="badge bg-danger ms-2 d-none" id="notif-mobile-badge">0</span></a></li>
                <li><hr class="dropdown-divider d-lg-none border-secondary opacity-25"></li>
                <li><a class="dropdown-item" href="${resolvePath(PATHS.PROFILE)}">My Profile</a></li>
                <li><hr class="dropdown-divider border-secondary opacity-25"></li>
                <li><button class="dropdown-item text-danger" id="logout-btn">Sign Out</button></li>
            </ul>
        </li>
    `;

    /**
     * Phase 1: Render the static navbar shell instantly.
     */
    const renderNavShell = () => {
        const navContainer = document.getElementById('main-nav') || (() => {
            const nav = document.createElement('nav');
            nav.id = 'main-nav';
            document.body.prepend(nav);
            return nav;
        })();

        navContainer.className = 'navbar navbar-expand-lg tailored-navbar';
        navContainer.innerHTML = buildNavShell();

        // Bind theme toggles immediately
        const applyThemeToggle = (btn) => {
            btn.onclick = async () => {
                const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                window.CK_THEME.apply(nextTheme);
                btn.querySelector('span').innerText = nextTheme === 'dark' ? '☀️' : '🌙';
                if (btn.id === 'theme-toggle-btn') {
                    btn.setAttribute('aria-pressed', nextTheme === 'dark');
                }
                // Sync with Supabase if logged in
                if (window._navbarUser && window.supabaseClient) {
                    await window.supabaseClient.from('profiles').update({ theme: nextTheme }).eq('id', window._navbarUser.id);
                }
            };
        };

        const desktopToggle = document.getElementById('theme-toggle-btn');
        if (desktopToggle) applyThemeToggle(desktopToggle);

        const mobileToggle = document.querySelector('.theme-toggle-btn-mobile');
        if (mobileToggle) applyThemeToggle(mobileToggle);
    };

    /**
     * Phase 2: Hydrate with auth state once Supabase is ready.
     * This runs async in the background — navbar is already visible.
     */
    const hydrateAuth = async () => {
        const supabase = window.supabaseClient;
        if (!supabase) return;

        let sessionResult;
        if (window._supabaseSessionPromise) {
            sessionResult = await window._supabaseSessionPromise;
        } else {
            sessionResult = await supabase.auth.getSession();
        }
        const { data: { session } } = sessionResult;
        const user = session?.user;

        if (!user) return; // Guest — shell already shows login/signup

        // Store user for theme sync
        window._navbarUser = user;

        // Check admin role (non-blocking for navbar render)
        let isAdmin = false;
        const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
        isAdmin = roleData?.role === 'admin' || roleData?.role === 'super_admin';

        // Show admin link if applicable
        if (isAdmin) {
            const adminLink = document.getElementById('nav-admin-link');
            if (adminLink) adminLink.classList.remove('d-none');
        }

        // Replace login/signup with user menu
        const authArea = document.getElementById('nav-auth-area');
        const signupArea = document.getElementById('nav-signup-area');
        const navList = authArea?.parentElement;

        if (navList && authArea) {
            // Remove login and signup links
            if (signupArea) signupArea.remove();
            
            // Replace auth area with user menu
            const userMenuFragment = document.createElement('div');
            userMenuFragment.innerHTML = buildUserMenu(user, isAdmin);
            
            // Insert all new elements before the auth area, then remove it
            const newItems = userMenuFragment.querySelectorAll('li');
            newItems.forEach(item => navList.insertBefore(item, authArea));
            authArea.remove();
        }

        // Bind logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = async (e) => {
                e.preventDefault();
                logoutBtn.textContent = 'Signing out...';
                try {
                    const { error } = await supabase.auth.signOut();
                    if (error) throw error;
                } catch (err) {
                    console.error('Navbar: Sign Out error, forcing cleanup', err);
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('sb-')) localStorage.removeItem(key);
                    });
                } finally {
                    window.location.href = resolvePath(PATHS.HOME);
                }
            };
        }

        // Fetch notifications (non-blocking)
        fetchNotifications(supabase, user);
    };

    /**
     * Notification system — runs completely in background after auth hydration.
     */
    const fetchNotifications = (supabase, user) => {
        const fetchNotifs = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_read', false)
                .order('created_at', { ascending: false });

            if (error) return;

            const badge = document.getElementById('notif-badge');
            const mobileBadge = document.getElementById('notif-mobile-badge');
            const list = document.getElementById('notif-list');

            if (data && data.length > 0) {
                if (badge) {
                    badge.textContent = data.length;
                    badge.classList.remove('d-none');
                }
                if (mobileBadge) {
                    mobileBadge.textContent = data.length;
                    mobileBadge.classList.remove('d-none');
                }

                if (list) {
                    list.innerHTML = `
                        <li class="p-3 border-bottom d-flex justify-content-between align-items-center" style="background: var(--bg-card);">
                            <span class="fw-bold small text-gold">NOTIFICATIONS</span>
                            <button class="btn btn-link btn-sm text-muted p-0 text-decoration-none" id="clear-all-notifs">Clear All</button>
                        </li>
                    ` + data.slice(0, 5).map(n => `
                        <li>
                            <div class="dropdown-item p-3 border-bottom text-wrap" style="cursor: pointer;" onclick="window.markNotifRead('${n.id}')">
                                <div class="d-flex justify-content-between align-items-start">
                                    <h6 class="mb-1 fw-bold small text-${n.type === 'danger' ? 'danger' : (n.type === 'success' ? 'gold' : 'primary')}">${n.title}</h6>
                                    <i class="bi bi-check2 text-muted ms-2" title="Click to Read"></i>
                                </div>
                                <p class="mb-1 small opacity-75">${n.message}</p>
                                <p class="mb-0 x-small text-muted" style="font-size: 0.7rem;">${new Date(n.created_at).toLocaleTimeString()}</p>
                            </div>
                        </li>
                    `).join('') + `
                        <li class="p-2 text-center small"><a href="${resolvePath(PATHS.PROFILE)}" class="text-muted text-decoration-none">View All in Profile</a></li>
                    `;

                    document.getElementById('clear-all-notifs')?.addEventListener('click', async () => {
                        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
                        fetchNotifs();
                    });
                }
            } else {
                if (badge) badge.classList.add('d-none');
                if (mobileBadge) mobileBadge.classList.add('d-none');
                if (list) list.innerHTML = '<li class="p-4 text-center text-muted small">No new notifications</li>';
            }
        };

        window.markNotifRead = async (id) => {
            await supabase.from('notifications').update({ is_read: true }).eq('id', id);
            fetchNotifs();
        };

        fetchNotifs();
        setInterval(fetchNotifs, 30000);
    };

    /**
     * Initialization — two-phase: instant render + async hydration.
     */
    const initNavbar = () => {
        // Phase 1: Instant shell render (no network calls)
        renderNavShell();

        // Phase 2: Hydrate with auth (async, non-blocking)
        if (window.supabaseClient) {
            hydrateAuth();
            window.supabaseClient.auth.onAuthStateChange(() => {
                // On auth change, re-render fully
                renderNavShell();
                hydrateAuth();
            });
        } else {
            window.addEventListener('supabase-ready', () => {
                hydrateAuth();
                window.supabaseClient.auth.onAuthStateChange(() => {
                    renderNavShell();
                    hydrateAuth();
                });
            }, { once: true });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
})();
