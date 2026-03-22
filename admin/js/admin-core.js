// admin-core.js - Admin Access Control
(function () {
    // Hide UI initially until admin role is verified
    document.documentElement.style.display = 'none';

    const whenSupabaseReady = (fn) => {
        if (window.supabaseClient) fn();
        else window.addEventListener('supabase-ready', fn, { once: true });
    };

    whenSupabaseReady(async () => {
        const supabase = window.supabaseClient;

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error('Admin: Session retrieval error:', sessionError);
                alert('Security Error: Could not retrieve session.');
                window.location.href = '../login.html';
                return;
            }

            if (!session) {
                console.warn('Admin: No active session found. Redirecting to login...');
                window.location.href = '../login.html?redirect=' + encodeURIComponent(window.location.pathname);
                return;
            }

            const user = session.user;

            // Check admin role
            const { data: roleData, error: dbError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .maybeSingle();

            if (dbError) {
                console.error('Admin: Database Error during role check:', dbError);
                await window.logAdminAction('SECURITY_BREACH_DB_ERROR', 'admin_access', { error: dbError });
                alert(`🚨 SECURITY BREACH ATTEMPT DETECTED 🚨\n\nAccess to this area is strictly RESTRICTED. Your attempt has been logged.\n\nDatabase Error: ${dbError.message}`);
                window.location.href = '../index.html';
                return;
            }

            if (!roleData) {
                console.warn('Admin: No role found for this user in public.user_roles');
                await window.logAdminAction('UNAUTHORIZED_ACCESS_ATTEMPT', 'admin_access', { email: user.email });
                alert(`⛔ ACCESS DENIED: RESTRICTED AREA ⛔\n\nIdentification failed for ${user.email}.\n\n⚠️ Unauthorized access to the Admin Panel is strictly prohibited and monitored. Please return to the main site immediately. 🛑`);
                window.location.href = '../index.html';
                return;
            }

            if (roleData.role !== 'super_admin' && roleData.role !== 'admin') {
                console.warn('Admin: Role found but insufficient privileges:', roleData.role);
                window.location.href = '../index.html';
                return;
            }

            // SUCCESS — reveal the page
            window.adminRole = roleData.role;
            window.adminUser = user;
            document.documentElement.style.display = '';
        } catch (err) {
            console.error('Admin: Unexpected error during access check:', err);
            window.location.href = '../login.html';
        }
    });

    // Export audit log utility
    window.logAdminAction = async (action, resource, details = {}) => {
        const supabase = window.supabaseClient;
        if (!supabase) return;
        try {
            await supabase.from('admin_audit_logs').insert({
                user_id: window.adminUser?.id,
                action,
                resource,
                details
            });
        } catch (err) {
            console.error('Admin Audit Error:', err);
        }
    };
})();
