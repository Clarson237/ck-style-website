/**
 * CK STYLE - Advanced Theme Engine
 * Designed for <head> injection to prevent theme flicker (FOUC).
 */
(function () {
    const STORAGE_KEY = 'ck-style-theme';
    const THEMES = { LIGHT: 'light', DARK: 'dark' };

    // 1. Resolve Initial Theme (Blocking)
    const getInitialTheme = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return saved;

        // Default to Light Mode as per user request
        return THEMES.LIGHT;
    };

    const initialTheme = getInitialTheme();
    document.documentElement.setAttribute('data-theme', initialTheme);

    // 2. Global Theme Manager
    window.CK_THEME = {
        apply: (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem(STORAGE_KEY, theme);
            window.dispatchEvent(new CustomEvent('theme-changed', { detail: theme }));
        },

        toggle: async () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
            window.CK_THEME.apply(next);

            // Sync with Supabase if logged in (handled by navbar/auth logic)
            window.dispatchEvent(new CustomEvent('theme-toggle-request', { detail: next }));
        },

        /**
         * Syncs specific user preference from Supabase.
         * Called by auth listener after session load.
         */
        syncWithProfile: (profileTheme) => {
            if (profileTheme && profileTheme !== document.documentElement.getAttribute('data-theme')) {
                window.CK_THEME.apply(profileTheme);
            }
        }
    };
})();
