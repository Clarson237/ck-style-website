/**
 * CK STYLE - Admin UI Utilities
 * Handles mobile sidebar toggle and secure sign-out
 */
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        initMobileSidebar();
        initSecureSignOut();
    });

    /**
     * Mobile sidebar: use existing HTML collapse and toggle.
     * Works with Bootstrap 5 collapse component.
     */
    function initMobileSidebar() {
        const sidebarNav = document.getElementById('adminSidebarNav');
        const toggle = document.querySelector('.admin-sidebar-toggle');
        if (!sidebarNav || !toggle) return;

        // Auto-close sidebar on mobile when a link is clicked
        const links = sidebarNav.querySelectorAll('.sidebar-link');
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    const bsCollapse = bootstrap.Collapse.getInstance(sidebarNav);
                    if (bsCollapse) bsCollapse.hide();
                }
            });
        });
    }

    /**
     * Secure sign-out: replaces inline onclick handlers with proper event listeners.
     * Finds any sign-out link (identified by text content) and binds a clean handler.
     */
    function initSecureSignOut() {
        const signOutLinks = document.querySelectorAll('.sidebar-link.text-danger');
        signOutLinks.forEach(link => {
            // Remove any inline onclick
            link.removeAttribute('onclick');
            link.href = '#';

            link.addEventListener('click', async (e) => {
                e.preventDefault();
                link.textContent = 'Signing out...';
                link.style.pointerEvents = 'none';

                try {
                    if (window.supabaseClient) {
                        await window.supabaseClient.auth.signOut();
                    }
                } catch (err) {
                    console.error('Admin: Sign out error, clearing tokens:', err);
                    // Force cleanup if API call fails
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('sb-')) localStorage.removeItem(key);
                    });
                } finally {
                    window.location.href = '../login.html';
                }
            });
        });
    }
})();
