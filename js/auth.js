// CK STYLE – Supabase Auth + Data
// No email confirmation required. Signup = immediate login. Email used only for password reset.

// Show exact Supabase error message; log full error to console for debugging.
function authErrorMessage(error, logLabel) {
    if (error == null) return 'Something went wrong.';
    var exact = error.message || error.msg || error.error_description || error.reason;
    if (!exact && typeof error === 'object') {
        try { exact = JSON.stringify(error); } catch (e) { exact = String(error); }
        if (exact === '{}') exact = null;
    }
    if (!exact) exact = typeof error === 'string' ? error : 'Something went wrong.';
    console.error(logLabel || 'Auth error', error);
    return exact;
}

const Auth = {
    getSupabase() {
        return window.supabaseClient;
    },

    getCurrentUser() {
        return window.supabaseClient?.auth?.user ?? null;
    },

    async getSession() {
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        return { session, error };
    },

    async signUp(email, password) {
        console.log("Auth: Supabase signUp for:", email);
        const supabase = window.supabaseClient;
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: undefined }
            });
            if (error) {
                console.error("Auth: signUp API error", error);
                return { user: null, error };
            }

            const user = data?.user;
            if (!user) {
                console.error("Auth: signUp no user in response", data);
                return { user: null, error: data?.error || new Error('Signup failed') };
            }

            // Session: when email confirmation is OFF in Supabase, data.session is set and user is logged in immediately.
            if (data.session) {
                console.log("Auth: signUp session created, user is logged in");
            } else {
                console.warn("Auth: signUp no session (enable 'Confirm email' OFF in Supabase Auth → Providers → Email for immediate login)");
            }

            // Create profile row (RLS must allow insert for auth.uid())
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: user.id,
                email: email,
                full_name: '',
                avatar_url: '',
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

            if (profileError) console.warn("Auth: Profile create warning (user still created):", profileError);

            return { user, error: null };
        } catch (err) {
            console.error("Auth: signUp error:", err);
            return { user: null, error: err };
        }
    },

    async logIn(email, password) {
        console.log("Auth: Supabase logIn for:", email);
        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
            if (error) return { user: null, error };
            return { user: data?.user ?? null, error: null };
        } catch (err) {
            console.error("Auth: logIn error:", err);
            return { user: null, error: err };
        }
    },

    async logOut() {
        console.log("Auth: Supabase logOut");
        try {
            await window.supabaseClient.auth.signOut();
            window.location.href = 'index.html';
            return { error: null };
        } catch (err) {
            console.error("Auth: logOut error:", err);
            return { error: err };
        }
    },

    async resetPassword(email) {
        console.log("Auth: Supabase resetPassword for:", email);
        var options = {};
        var origin = typeof window !== 'undefined' && window.location && window.location.origin;
        if (origin && (origin.startsWith('http://') || origin.startsWith('https://'))) {
            options.redirectTo = new URL('reset-password.html', window.location.href).href;
            console.log("Auth: resetPassword redirectTo:", options.redirectTo);
        }
        try {
            var out = await window.supabaseClient.auth.resetPasswordForEmail(email, options);
            console.log("Auth: resetPasswordForEmail response:", { data: out.data, error: out.error });
            var err = out.error;
            if (err && typeof err === 'object' && !err.message && !err.msg && !err.error_description && Object.keys(err).length === 0) {
                err = null;
            }
            return { error: err || null };
        } catch (err) {
            console.error("Auth: resetPassword error:", err);
            return { error: err };
        }
    },

    async updatePassword(newPassword) {
        try {
            const { error } = await window.supabaseClient.auth.updateUser({ password: newPassword });
            return { error: error || null };
        } catch (err) {
            console.error("Auth: updatePassword error:", err);
            return { error: err };
        }
    }
};

window.CK_Auth_Module = Auth;

function whenSupabaseReady(fn) {
    if (window.supabaseClient) {
        fn();
    } else {
        window.addEventListener('supabase-ready', fn, { once: true });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Auth: Initializing handlers...");
    runAuthHandlers();
});

function getSupabaseOrShowError(msgDivId) {
    if (window.supabaseClient) return window.supabaseClient;
    const el = msgDivId ? document.getElementById(msgDivId) : null;
    if (el) el.innerHTML = '<div class="alert alert-warning">Auth is still loading. Wait a few seconds and try again.</div>';
    return null;
}

function runAuthHandlers() {
    const supabase = window.supabaseClient;

    // --- SIGNUP FORM ---
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!getSupabaseOrShowError('signup-msg')) return;
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const msgDiv = document.getElementById('signup-msg');
            const btn = document.getElementById('signup-btn');

            if (password !== confirmPassword) {
                msgDiv.innerHTML = '<div class="alert alert-danger">Passwords do not match!</div>';
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Creating Account...';

            try {
                const { user, error } = await Auth.signUp(email, password);

                if (error) {
                    var errMsg = authErrorMessage(error, 'Signup error');
                    msgDiv.innerHTML = '<div class="alert alert-danger">' + errMsg + '</div>';
                    btn.disabled = false;
                    btn.textContent = 'Create Account';
                } else {
                    msgDiv.innerHTML = `
                        <div class="alert alert-success">
                            <h4 class="alert-heading">Registration Successful!</h4>
                            <p>Welcome to CK STYLE. Redirecting to your dashboard...</p>
                        </div>
                    `;
                    const urlParams = new URLSearchParams(window.location.search);
                    const redirect = urlParams.get('redirect') || 'index.html';
                    setTimeout(() => { window.location.href = redirect; }, 1500);
                }
            } catch (err) {
                console.error('Signup error:', err);
                msgDiv.innerHTML = '<div class="alert alert-danger">' + (err && err.message ? err.message : 'Signup failed. Please try again.') + '</div>';
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
        });
    }

    // --- LOGIN FORM ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!getSupabaseOrShowError('login-msg')) return;
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const msgDiv = document.getElementById('login-msg');
            const btn = document.getElementById('login-btn');

            btn.disabled = true;
            btn.textContent = 'Signing In...';

            const { user, error } = await Auth.logIn(email, password);

            if (error) {
                var errMsg = authErrorMessage(error, 'Login error');
                msgDiv.innerHTML = '<div class="alert alert-danger">' + errMsg + '</div>';
                btn.disabled = false;
                btn.textContent = 'Sign In';
            } else {
                msgDiv.innerHTML = '<div class="alert alert-success">Login successful! Redirecting...</div>';
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect') || 'index.html';
                setTimeout(() => { window.location.href = redirect; }, 1000);
            }
        });
    }

    // --- FORGOT PASSWORD ---
    const resetBtn = document.getElementById('reset-btn');
    const forgotEmailInput = document.getElementById('forgot-email');
    if (resetBtn && forgotEmailInput) {
        resetBtn.addEventListener('click', async () => {
            if (!getSupabaseOrShowError('error-msg')) {
                var errEl = document.getElementById('error-msg');
                if (errEl) errEl.textContent = 'Auth is still loading. Wait a moment and try again.';
                return;
            }
            const email = forgotEmailInput.value.trim();
            const errorDiv = document.getElementById('error-msg');
            const successDiv = document.getElementById('success-msg');
            if (!email) {
                if (errorDiv) errorDiv.textContent = 'Please enter your email address.';
                if (successDiv) successDiv.textContent = '';
                return;
            }
            resetBtn.disabled = true;
            resetBtn.textContent = 'Sending...';
            if (errorDiv) errorDiv.textContent = '';
            if (successDiv) successDiv.textContent = '';

            try {
                const { error } = await Auth.resetPassword(email);

                if (error) {
                    var errMsg = authErrorMessage(error, 'Forgot password error');
                    if (errorDiv) errorDiv.textContent = errMsg;
                    resetBtn.disabled = false;
                    resetBtn.textContent = 'Send Reset Link';
                } else {
                    if (successDiv) successDiv.textContent = 'If an account exists for that email, you will receive a reset link. Check your inbox and spam folder.';
                    resetBtn.disabled = false;
                    resetBtn.textContent = 'Send Reset Link';
                }
            } catch (err) {
                console.error('Forgot password request failed:', err);
                var msg = (err && err.message) ? err.message : 'Request failed.';
                if (errorDiv) {
                    if (msg === 'Failed to fetch') {
                        errorDiv.innerHTML = 'Network error (Failed to fetch). Use a local server (e.g. <code>http://localhost</code>) and add that URL to Supabase: Auth → URL Configuration → Redirect URLs.';
                    } else {
                        errorDiv.textContent = msg;
                    }
                }
                resetBtn.disabled = false;
                resetBtn.textContent = 'Send Reset Link';
            }
        });
    }

    // --- RESET PASSWORD (Supabase: user lands from email link with tokens in hash or query) ---
    const updatePasswordBtn = document.getElementById('update-password-btn');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInputReset = document.getElementById('confirm-password');
    if (updatePasswordBtn && newPasswordInput) {
        const errorDiv = document.getElementById('error-msg');
        const successDiv = document.getElementById('success-msg');

        (async function initResetPasswordPage() {
            function getParamsFromSource(source) {
                if (!source || source.length < 2) return null;
                var q = source.charAt(0) === '#' ? source.substring(1) : source;
                try { return new URLSearchParams(q); } catch (e) { return null; }
            }
            function getTokenParams() {
                var hashParams = getParamsFromSource(window.location.hash);
                var queryParams = getParamsFromSource(window.location.search);
                var access_token = (hashParams && hashParams.get('access_token')) || (queryParams && queryParams.get('access_token'));
                var refresh_token = (hashParams && hashParams.get('refresh_token')) || (queryParams && queryParams.get('refresh_token'));
                var type = (hashParams && hashParams.get('type')) || (queryParams && queryParams.get('type'));
                if (access_token && refresh_token && type === 'recovery') return { access_token: access_token, refresh_token: refresh_token };
                return null;
            }

            var session = (await supabase.auth.getSession()).data.session;
            var tokenParams = getTokenParams();

            if (!session && tokenParams) {
                if (errorDiv) errorDiv.textContent = 'Verifying reset link...';
                var setResult = await supabase.auth.setSession({
                    access_token: tokenParams.access_token,
                    refresh_token: tokenParams.refresh_token
                });
                if (setResult.error) {
                    console.error('Reset page setSession error:', setResult.error);
                    if (errorDiv) errorDiv.textContent = authErrorMessage(setResult.error, 'Reset link verification failed');
                    updatePasswordBtn.disabled = true;
                    var requestNewLink = document.getElementById('request-new-link');
                    if (requestNewLink) requestNewLink.classList.remove('d-none');
                    return;
                }
                session = setResult.data.session;
                if (window.history && window.history.replaceState) {
                    try { window.history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) { }
                }
            }

            if (session) {
                if (errorDiv) errorDiv.textContent = '';
                updatePasswordBtn.disabled = false;
                updatePasswordBtn.addEventListener('click', async function onSubmitNewPassword() {
                    var newPassword = newPasswordInput.value;
                    var confirmPassword = confirmPasswordInputReset ? confirmPasswordInputReset.value : '';
                    if (newPassword.length < 6) {
                        if (errorDiv) errorDiv.textContent = 'Password must be at least 6 characters.';
                        return;
                    }
                    if (confirmPasswordInputReset && newPassword !== confirmPassword) {
                        if (errorDiv) errorDiv.textContent = 'Passwords do not match.';
                        return;
                    }

                    updatePasswordBtn.disabled = true;
                    updatePasswordBtn.textContent = 'Updating...';
                    if (errorDiv) errorDiv.textContent = '';
                    if (successDiv) successDiv.textContent = '';

                    var updateResult = await Auth.updatePassword(newPassword);

                    if (updateResult.error) {
                        if (errorDiv) errorDiv.textContent = authErrorMessage(updateResult.error, 'Update password error');
                        updatePasswordBtn.disabled = false;
                        updatePasswordBtn.textContent = 'Update Password';
                    } else {
                        if (successDiv) successDiv.textContent = 'Password updated successfully. Redirecting to login...';
                        var backLogin = document.getElementById('back-login');
                        if (backLogin) backLogin.classList.remove('d-none');
                        updatePasswordBtn.disabled = false;
                        updatePasswordBtn.textContent = 'Update Password';
                        setTimeout(function () { window.location.href = 'login.html'; }, 2000);
                    }
                });
            } else {
                if (errorDiv) errorDiv.textContent = 'Invalid or missing reset link. Use the link from your password reset email, or request a new one below.';
                updatePasswordBtn.disabled = true;
                var requestNewLink = document.getElementById('request-new-link');
                if (requestNewLink) requestNewLink.classList.remove('d-none');
            }
        })();
    }

    // --- PROFILE PAGE: show user email and optional profile data ---
    const userEmailEl = document.getElementById('user-email');
    if (userEmailEl) {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                userEmailEl.textContent = user.email || 'Signed in';
                const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).maybeSingle();
                if (profile?.full_name) {
                    const nameEl = document.getElementById('user-full-name');
                    if (nameEl) nameEl.textContent = profile.full_name;
                }
            } else {
                userEmailEl.textContent = 'Not signed in';
            }
        })();
    }
}
