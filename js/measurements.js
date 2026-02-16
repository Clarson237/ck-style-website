// measurements.js - Measurement handling logic for CK STYLE

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('measure-form');
    const msgDiv = document.getElementById('measure-msg');
    const saveBtn = document.getElementById('save-btn');

    const fields = ['height', 'shoulder', 'chest', 'waist', 'hips', 'sleeve', 'inseam'];

    const showMsg = (text, type = 'info') => {
        msgDiv.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
        msgDiv.scrollIntoView({ behavior: 'smooth' });
    };

    const whenSupabaseReady = (fn) => {
        if (window.supabaseClient) fn();
        else window.addEventListener('supabase-ready', fn, { once: true });
    };

    whenSupabaseReady(async () => {
        const supabase = window.supabaseClient;

        // Check for pending measurements in localStorage
        const pending = localStorage.getItem('pending_measurements');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Load existing measurements
            const { data, error } = await supabase
                .from('measurements')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (data) {
                fields.forEach(f => {
                    const el = document.getElementById(f);
                    if (el && data[f]) el.value = data[f];
                });
            }

            // Auto-save if pending
            if (pending) {
                const pendingData = JSON.parse(pending);
                showMsg('Saving your measurements from before login...', 'info');
                const { error: saveErr } = await supabase
                    .from('measurements')
                    .upsert({ user_id: user.id, ...pendingData }, { onConflict: 'user_id' });

                if (!saveErr) {
                    showMsg('Successfully saved your measurements!', 'success');
                    localStorage.removeItem('pending_measurements');
                    // Refresh fields with the pending data
                    fields.forEach(f => {
                        const el = document.getElementById(f);
                        if (el && pendingData[f]) el.value = pendingData[f];
                    });
                } else {
                    console.error('Auto-save error:', saveErr);
                    showMsg('Failed to auto-save measurements: ' + saveErr.message, 'danger');
                }
            }
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';

            const formData = {};
            fields.forEach(f => {
                formData[f] = parseFloat(document.getElementById(f).value);
            });

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Not logged in: save to localStorage and redirect
                localStorage.setItem('pending_measurements', JSON.stringify(formData));
                showMsg('Measurements saved temporarily. Redirecting to login to save permanently...', 'warning');
                setTimeout(() => {
                    window.location.href = 'login.html?redirect=measure-me.html';
                }, 2000);
                return;
            }

            // Logged in: save to Supabase
            const { error } = await supabase
                .from('measurements')
                .upsert({ user_id: user.id, ...formData }, { onConflict: 'user_id' });

            if (error) {
                showMsg('Error saving measurements: ' + error.message, 'danger');
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Measurements';
            } else {
                showMsg('Measurements saved successfully!', 'success');
                saveBtn.disabled = false;
                saveBtn.textContent = 'Update Measurements';
                localStorage.removeItem('pending_measurements');
            }
        });
    });
});
