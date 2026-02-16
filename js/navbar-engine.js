/**
 * CK STYLE - Signature Navbar Engine
 * Single Source of Truth for Navigation
 */

(function () {
    const PATHS = {
        HOME: 'index.html',
        COLLECTION: 'collection.html',
        MEASURE: 'measure-me.html',
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

    const createNavbar = async () => {
        const navContainer = document.getElementById('main-nav') || (() => {
            const nav = document.createElement('nav');
            nav.id = 'main-nav';
            document.body.prepend(nav);
            return nav;
        })();

        navContainer.className = 'navbar navbar-expand-lg tailored-navbar';

        const supabase = window.supabaseClient;
        let user = null;
        let isAdmin = false;

        if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            user = session?.user;
            if (user) {
                const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
                isAdmin = roleData?.role === 'admin' || roleData?.role === 'super_admin';
            }
        }

        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

        const navHtml = `
            <div class="container">
                <a class="navbar-brand" href="${resolvePath(PATHS.HOME)}">
                    <span class="needle-thread nav-decoration"></span>
                    CK STYLE
                </a>
                
                <button class="navbar-toggler tailored-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent" aria-controls="navContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navContent">
                    <ul class="navbar-nav ms-auto align-items-center">
                        <li class="nav-item">
                            <a class="nav-link tailored-nav-link ${isLinkActive(PATHS.HOME)}" href="${resolvePath(PATHS.HOME)}">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link tailored-nav-link ${isLinkActive(PATHS.COLLECTION)}" href="${resolvePath(PATHS.COLLECTION)}">Collection</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link tailored-nav-link ${isLinkActive(PATHS.MEASURE)}" href="${resolvePath(PATHS.MEASURE)}">Measure Me</a>
                        </li>
                        
                        ${isAdmin ? `
                        <li class="nav-item">
                            <a class="nav-link tailored-nav-link ${isLinkActive(PATHS.ADMIN.split('/').pop())}" href="${resolvePath(PATHS.ADMIN)}">Admin</a>
                        </li>` : ''}

                        <!-- Theme Toggle -->
                        <li class="nav-item ms-lg-3">
                            <button class="btn btn-link nav-link p-2" id="theme-toggle-btn" 
                                    aria-label="Toggle light and dark mode" 
                                    aria-pressed="${currentTheme === 'dark'}"
                                    style="border:none; text-decoration:none;">
                                <span id="theme-icon" aria-hidden="true">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
                            </button>
                        </li>

                        ${user ? `
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
                            <a class="nav-link dropdown-toggle tailored-nav-link" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
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
                        ` : `
                        <li class="nav-item ms-lg-3">
                            <a class="nav-link tailored-nav-link ${isLinkActive(PATHS.LOGIN)}" href="${resolvePath(PATHS.LOGIN)}">Login</a>
                        </li>
                        <li class="nav-item">
                            <a class="btn btn-primary ms-lg-2 mt-3 mt-lg-0 rounded-pill px-4" href="${resolvePath(PATHS.SIGNUP)}">Sign Up</a>
                        </li>
                        `}
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

        navContainer.innerHTML = navHtml;

        // Auto-Popup Logic
        const autoPopupUnread = async () => {
            if (!user) return;
            // Check session storage to avoid popping up on EVERY page load if they've already dismissed it in this session
            if (sessionStorage.getItem('notif_popup_shown')) return;

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_read', false)
                .order('created_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                const n = data[0];
                window.currentPopupId = n.id;
                document.getElementById('popup-title').innerText = n.title;
                document.getElementById('popup-message').innerText = n.message;

                const modal = new bootstrap.Modal(document.getElementById('globalNotifModal'));
                modal.show();
                sessionStorage.setItem('notif_popup_shown', 'true');
            }
        };

        // Initialize Logic
        const toggleBtn = document.getElementById('theme-toggle-btn');
        autoPopupUnread(); // Check for unread alerts immediately
        if (toggleBtn) {
            toggleBtn.onclick = async () => {
                const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                window.CK_THEME.apply(nextTheme);
                document.getElementById('theme-icon').innerText = nextTheme === 'dark' ? '☀️' : '🌙';
                toggleBtn.setAttribute('aria-pressed', nextTheme === 'dark');

                if (user) {
                    await supabase.from('profiles').update({ theme: nextTheme }).eq('id', user.id);
                }
            };
        }

        // Notification Fetching & Management
        if (user) {
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
                            <li class="p-3 border-bottom d-flex justify-content-between align-items-center bg-dark">
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
        }

        // Logout Logic
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = async (e) => {
                e.preventDefault();
                logoutBtn.textContent = 'Signing out...';

                try {
                    const { error } = await supabase.auth.signOut();
                    if (error) throw error;
                    console.log('Navbar: Sign Out successful');
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

        // Listen for global theme changes
        window.addEventListener('theme-changed', (e) => {
            const theme = e.detail;
            const icon = document.getElementById('theme-icon');
            if (icon) icon.innerText = theme === 'dark' ? '☀️' : '🌙';
            const btn = document.getElementById('theme-toggle-btn');
            if (btn) btn.setAttribute('aria-pressed', theme === 'dark');
        });
    };

    // Re-run on auth state change
    const initNavbar = () => {
        const checkReady = setInterval(() => {
            // WAIT FOR SUPABASE AND BOOTSTRAP TO BE DEFINED
            if (window.supabaseClient && window.bootstrap) {
                clearInterval(checkReady);
                createNavbar();
                window.supabaseClient.auth.onAuthStateChange(() => createNavbar());
            }
        }, 100);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
})();
