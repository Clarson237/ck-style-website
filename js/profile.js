/**
 * CK STYLE - Profile Logic
 * Handles loading user profile data and measurements with export functionality.
 */

// Global variable to store current measurement for exports
let currentMeasurementData = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Supabase to be ready
    if (!window.supabaseClient) {
        await new Promise(resolve => window.addEventListener('supabase-ready', resolve, { once: true }));
    }

    const supabase = window.supabaseClient;
    const emailEl = document.getElementById('user-email');

    // 1. Check Session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        console.warn('Profile: No active session', error);
        window.location.href = 'login.html?redirect=profile.html';
        return;
    }

    const user = session.user;
    console.log('Profile: User found', user.email);

    // 2. Display user email
    emailEl.textContent = user.email;
    emailEl.classList.remove('text-muted');
    emailEl.classList.add('text-white');

    // 3. Fetch extra profile data if needed
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile && profile.full_name) {
            // Could display full name somewhere if needed
            console.log('User profile:', profile);
        }
    } catch (err) {
        console.error('Profile fetch error:', err);
    }

    // 4. Load Data
    await Promise.all([
        loadMeasurements(supabase, user.id),
        loadProfileNotifications(supabase, user.id)
    ]);
});

async function loadProfileNotifications(supabase, userId) {
    const container = document.getElementById('profile-notif-list');
    if (!container) return;

    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="text-muted small text-center py-3">No notifications yet.</p>';
            return;
        }

        container.innerHTML = data.map(n => `
            <div class="p-2 mb-2 border-bottom border-secondary border-opacity-25">
                <div class="d-flex justify-content-between align-items-start">
                    <h6 class="mb-1 small fw-bold text-${n.type === 'danger' ? 'danger' : (n.type === 'success' ? 'gold' : 'primary')}">
                        ${n.title}
                        ${!n.is_read ? '<span class="badge bg-danger ms-1" style="font-size: 0.5rem;">NEW</span>' : ''}
                    </h6>
                    <small class="text-muted" style="font-size: 0.7rem;">${new Date(n.created_at).toLocaleDateString()}</small>
                </div>
                <p class="mb-0 small opacity-75">${n.message}</p>
            </div>
        `).join('');

    } catch (err) {
        console.error('Failed to load profile notifications:', err);
        container.innerHTML = '<p class="text-danger small py-3">Error loading notifications.</p>';
    }
}

async function loadMeasurements(supabase, userId) {
    const container = document.getElementById('measurements-list');

    try {
        // Fetch user's measurements
        const { data: measurements, error } = await supabase
            .from('measurements')
            .select(`
                id,
                profile_name,
                full_name,
                sex,
                unit,
                created_at
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!measurements || measurements.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-muted mb-3">No measurements saved yet</p>
                    <a href="measure-me.html" class="btn btn-primary">Create Your First Profile</a>
                </div>
            `;
            return;
        }

        // Display measurements
        const html = measurements.map(m => `
            <div class="glass p-3 mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${m.profile_name}</h5>
                        <small class="text-muted">
                            ${m.full_name} • ${m.sex.toUpperCase()} • ${m.unit}
                            <span class="ms-2">📅 ${new Date(m.created_at).toLocaleDateString()}</span>
                        </small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-gold" onclick="viewMeasurementDetails('${m.id}')">View Details</button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;

    } catch (error) {
        console.error('Failed to load measurements:', error);
        container.innerHTML = `<p class="text-danger">Failed to load measurements: ${error.message}</p>`;
    }
}

async function viewMeasurementDetails(measurementId) {
    const supabase = window.supabaseClient;
    const modal = new bootstrap.Modal(document.getElementById('measurementModal'));
    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');

    // Show loading state
    modalBody.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-gold" role="status"></div>
            <p class="text-muted mt-3">Loading measurements...</p>
        </div>
    `;
    modal.show();

    try {
        // Fetch measurement session info
        const { data: measurement, error: mainError } = await supabase
            .from('measurements')
            .select('*')
            .eq('id', measurementId)
            .single();

        if (mainError) throw mainError;

        // Fetch individual measurement items
        const { data: items, error: itemsError } = await supabase
            .from('measurement_items')
            .select('*')
            .eq('measurement_id', measurementId)
            .order('category', { ascending: true });

        if (itemsError) throw itemsError;

        // Store for export functions
        currentMeasurementData = { measurement, items };

        // Update modal title
        modalTitle.textContent = measurement.profile_name;

        // Group by category
        const categories = {
            'top': [],
            'gown': [],
            'trousers': []
        };

        items.forEach(item => {
            if (categories[item.category]) {
                categories[item.category].push(item);
            }
        });

        // Build HTML
        let html = `
            <div class="mb-4">
                <div class="row text-center">
                    <div class="col-3">
                        <small class="text-muted d-block">NAME</small>
                        <strong>${measurement.full_name}</strong>
                    </div>
                    <div class="col-3">
                        <small class="text-muted d-block">SEX</small>
                        <strong>${measurement.sex.toUpperCase()}</strong>
                    </div>
                    <div class="col-3">
                        <small class="text-muted d-block">UNIT</small>
                        <strong>${measurement.unit}</strong>
                    </div>
                    <div class="col-3">
                        <small class="text-muted d-block">DATE</small>
                        <strong>${new Date(measurement.created_at).toLocaleDateString()}</strong>
                    </div>
                </div>
            </div>
        `;

        // Display each category
        Object.keys(categories).forEach(category => {
            if (categories[category].length > 0) {
                html += `
                    <div class="mb-4">
                        <h6 class="text-gold text-uppercase mb-3">${category}</h6>
                        <div class="table-responsive">
                            <table class="table table-dark table-sm">
                                <tbody>
                                    ${categories[category].map(item => `
                                        <tr>
                                            <td class="fw-bold">${item.display_name}</td>
                                            <td class="text-end text-gold">${item.measurement_value} ${measurement.unit}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }
        });

        if (items.length === 0) {
            html += '<p class="text-muted text-center py-4">No measurements recorded</p>';
        }

        modalBody.innerHTML = html;

    } catch (error) {
        console.error('Failed to load measurement details:', error);
        modalBody.innerHTML = `
            <div class="alert alert-danger">
                Failed to load details: ${error.message}
            </div>
        `;
    }
}

// Export Functions
function downloadCSV() {
    if (!currentMeasurementData) return;

    const { measurement, items } = currentMeasurementData;

    // Build CSV content
    let csv = 'CK STYLE - Measurement Profile\n\n';
    csv += `Profile Name,${measurement.profile_name}\n`;
    csv += `Full Name,${measurement.full_name}\n`;
    csv += `Sex,${measurement.sex.toUpperCase()}\n`;
    csv += `Unit,${measurement.unit}\n`;
    csv += `Date,${new Date(measurement.created_at).toLocaleDateString()}\n\n`;

    csv += 'Category,Measurement,Value\n';
    items.forEach(item => {
        csv += `${item.category},${item.display_name},${item.measurement_value} ${measurement.unit}\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${measurement.profile_name.replace(/\s+/g, '_')}_CK_STYLE.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function downloadPDF() {
    if (!currentMeasurementData) return;

    // Use browser print functionality
    const printContent = document.getElementById('modalBody').innerHTML;
    const { measurement } = currentMeasurementData;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${measurement.profile_name} - CK STYLE</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #d4af37; text-align: center; }
                h6 { color: #d4af37; text-transform: uppercase; margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                td { padding: 8px; border-bottom: 1px solid #ddd; }
                .text-gold { color: #d4af37; }
                .info-row { display: flex; justify-content: space-around; margin: 20px 0; }
                .info-item { text-align: center; }
                small { display: block; color: #666; font-size: 12px; }
                strong { font-size: 16px; }
            </style>
        </head>
        <body>
            <h1>CK STYLE - ${measurement.profile_name}</h1>
            ${printContent}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function downloadImage() {
    if (!currentMeasurementData || !window.html2canvas) {
        alert('Image export library not loaded');
        return;
    }

    const { measurement } = currentMeasurementData;
    const modalBody = document.getElementById('modalBody');

    html2canvas(modalBody, {
        backgroundColor: '#1a1a1a',
        scale: 2
    }).then(canvas => {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${measurement.profile_name.replace(/\s+/g, '_')}_CK_STYLE.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
    });
}
