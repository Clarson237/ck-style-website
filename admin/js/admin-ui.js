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
     * Mobile sidebar: wrap sidebar in a collapse and add a toggle button.
     * Works with Bootstrap 5 collapse component.
     */
    function initMobileSidebar() {
        const sidebar = document.querySelector('.col-lg-3');
        if (!sidebar) return;

        // Add class for CSS targeting
        sidebar.classList.add('admin-sidebar');

        const sidebarContent = sidebar.querySelector('.glass');
        if (!sidebarContent) return;

        // Create toggle button (only visible on mobile via CSS)
        const toggle = document.createElement('button');
        toggle.className = 'admin-sidebar-toggle';
        toggle.type = 'button';
        toggle.setAttribute('data-bs-toggle', 'collapse');
        toggle.setAttribute('data-bs-target', '#adminSidebarCollapse');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'adminSidebarCollapse');
        toggle.innerHTML = `
            <span>☰ Navigation</span>
            <span class="toggle-icon">▼</span>
        `;

        // Wrap sidebar content in a collapse div
        const collapseWrapper = document.createElement('div');
        collapseWrapper.className = 'collapse d-lg-block';
        collapseWrapper.id = 'adminSidebarCollapse';

        // Move the glass panel inside the collapse wrapper
        sidebar.insertBefore(toggle, sidebarContent);
        sidebar.insertBefore(collapseWrapper, sidebarContent);
        collapseWrapper.appendChild(sidebarContent);

        // Auto-close sidebar on mobile when a link is clicked
        const links = sidebar.querySelectorAll('.sidebar-link');
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    const collapse = bootstrap.Collapse.getInstance(collapseWrapper);
                    if (collapse) collapse.hide();
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
