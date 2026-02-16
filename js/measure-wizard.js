/**
 * CK STYLE - Measurement Wizard (Rebuilt for Reliability)
 * Sex-based dynamic measurement flow with normalized database storage
 */

const MeasurementWizard = {
    // Configuration
    config: {
        FEMALE_MEASUREMENTS: [
            // Top
            { category: 'top', key: 'hand_length', name: 'Hand Length', desc: 'Measure from shoulder joint to wrist bone. Arm relaxed, not bent.' },
            { category: 'top', key: 'hand_round', name: 'Hand Round', desc: 'Wrap tape around widest part of upper arm. Snug but not tight.' },
            { category: 'top', key: 'wrist_round', name: 'Wrist Round', desc: 'Measure around the wrist at its narrowest point.' },
            { category: 'top', key: 'chest', name: 'Chest', desc: 'Measure around fullest part of chest, under arms, tape level.' },
            { category: 'top', key: 'shoulder', name: 'Shoulder', desc: 'Measure from one shoulder bone to the other across back.' },
            { category: 'top', key: 'neck', name: 'Neck Round', desc: 'Measure around base of neck. Leave one finger space.' },
            { category: 'top', key: 'stomach', name: 'Stomach', desc: 'Measure around fullest part of stomach. Stand naturally.' },
            { category: 'top', key: 'top_length', name: 'Top Length', desc: 'Measure from shoulder down to desired top length.' },

            // Gown
            { category: 'gown', key: 'gown_length', name: 'Gown Length', desc: 'Measure from shoulder to desired gown length.' },
            { category: 'gown', key: 'gown_shoulder', name: 'Gown Shoulder', desc: 'Measure shoulder to shoulder across back.' },
            { category: 'gown', key: 'gown_chest', name: 'Gown Chest', desc: 'Measure around fullest part of chest.' },

            // Trousers
            { category: 'trousers', key: 'trouser_length', name: 'Trouser Length', desc: 'Measure from waist to ankle. Stand straight.' },
            { category: 'trousers', key: 'lap', name: 'Lap (Thigh)', desc: 'Measure around widest part of thigh.' },
            { category: 'trousers', key: 'waist', name: 'Waist', desc: 'Measure around natural waistline. No tightening.' },
            { category: 'trousers', key: 'back_foot', name: 'Back Foot', desc: 'Measure from waist (back) down to ankle.' },
            { category: 'trousers', key: 'foot_round', name: 'Foot Round', desc: 'Measure around ankle opening.' },
            { category: 'trousers', key: 'knee_round', name: 'Knee Round', desc: 'Measure around knee while standing.' },
            { category: 'trousers', key: 'hips', name: 'Hips', desc: 'Measure around fullest part of hips/buttocks.' }
        ],
        MALE_MEASUREMENTS: [
            // Top
            { category: 'top', key: 'hand_length', name: 'Hand Length', desc: 'Measure from shoulder joint to wrist bone.' },
            { category: 'top', key: 'hand_round', name: 'Hand Round', desc: 'Wrap tape around widest part of upper arm.' },
            { category: 'top', key: 'wrist_round', name: 'Wrist Round', desc: 'Measure around the wrist at its narrowest point.' },
            { category: 'top', key: 'chest', name: 'Chest', desc: 'Measure around fullest part of chest.' },
            { category: 'top', key: 'shoulder', name: 'Shoulder', desc: 'Measure from one shoulder bone to the other.' },
            { category: 'top', key: 'neck', name: 'Neck Round', desc: 'Measure around base of neck.' },
            { category: 'top', key: 'stomach', name: 'Stomach', desc: 'Measure around fullest part of stomach.' },
            { category: 'top', key: 'top_length', name: 'Top Length', desc: 'Measure from shoulder down to desired length.' },

            // Trousers
            { category: 'trousers', key: 'trouser_length', name: 'Trouser Length', desc: 'Measure from waist to ankle.' },
            { category: 'trousers', key: 'lap', name: 'Lap (Thigh)', desc: 'Measure around widest part of thigh.' },
            { category: 'trousers', key: 'waist', name: 'Waist', desc: 'Measure around natural waistline.' },
            { category: 'trousers', key: 'back_foot', name: 'Back Foot', desc: 'Measure from waist (back) to ankle.' },
            { category: 'trousers', key: 'foot_round', name: 'Foot Round', desc: 'Measure around ankle opening.' },
            { category: 'trousers', key: 'knee_round', name: 'Knee Round', desc: 'Measure around knee while standing.' },
            { category: 'trousers', key: 'hips', name: 'Hips', desc: 'Measure around fullest part of hips.' }
        ]
    },

    // State
    state: {
        stage: 'intro', // intro | measuring | review | complete
        currentIndex: 0,
        measurements: [],
        data: {}
    },

    // DOM cache
    dom: {},

    // Initialize
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.showIntro();
    },

    cacheDOM() {
        this.dom = {
            container: document.getElementById('wizard-container'),
            progressBar: document.getElementById('progress-fill'),
            stepIndicator: document.getElementById('step-indicator'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            msgContainer: document.getElementById('msg-container'),
            nav: document.getElementById('wizard-nav')
        };
    },

    bindEvents() {
        this.dom.nextBtn.addEventListener('click', () => this.handleNext());
        this.dom.prevBtn.addEventListener('click', () => this.handlePrev());
    },

    // Render intro form
    showIntro() {
        this.state.stage = 'intro';
        this.updateProgress();

        this.dom.container.innerHTML = `
            <div class="animate-fade-up text-center">
                <div class="mb-4" style="font-size: 3rem;">✂️</div>
                <h2 class="mb-3">Welcome to CK Style</h2>
                <p class="text-muted mb-5">Let's create your perfect fit profile</p>
                
                <div class="row justify-content-center">
                    <div class="col-md-6 text-start">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Measurement For</label>
                            <input type="text" id="full_name" class="form-control form-control-lg" 
                                placeholder="e.g. Mr. John Married" value="${this.state.data.full_name || ''}">
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label fw-bold">Client Name</label>
                            <input type="text" id="profile_name" class="form-control form-control-lg" 
                                placeholder="e.g. My Wedding Suit" value="${this.state.data.profile_name || ''}">
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label fw-bold">Sex</label>
                            <select id="sex" class="form-select form-select-lg">
                                <option value="">Select Sex</option>
                                <option value="male" ${this.state.data.sex === 'male' ? 'selected' : ''}>Male</option>
                                <option value="female" ${this.state.data.sex === 'female' ? 'selected' : ''}>Female</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label fw-bold">Measurement Unit</label>
                            <select id="unit" class="form-select form-select-lg">
                                <option value="cm" ${this.state.data.unit === 'cm' ? 'selected' : ''}>Centimeters (cm)</option>
                                <option value="inch" ${this.state.data.unit === 'inch' ? 'selected' : ''}>Inches</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.dom.prevBtn.style.display = 'none';
        this.dom.nextBtn.textContent = 'Start Measuring';
        this.dom.nextBtn.disabled = false;
    },

    // Show measurement step
    showMeasurement() {
        const measurement = this.state.measurements[this.state.currentIndex];
        const value = this.state.data[measurement.key] || '';

        this.dom.container.innerHTML = `
            <div class="animate-fade-up">
                <div class="text-center mb-4">
                    <span class="badge bg-secondary mb-2">${measurement.category.toUpperCase()}</span>
                    <h2 class="mb-3">${measurement.name}</h2>
                </div>
                
                <div class="row align-items-center">
                    <div class="col-md-6 mb-4 mb-md-0">
                        <div class="glass p-4 rounded-4 border-start border-4 border-warning">
                            <h5 class="text-gold mb-3">📏 How to Measure</h5>
                            <p class="mb-0">${measurement.desc}</p>
                            <p class="text-muted small mt-3 mb-0">💡 Tip: You can skip this measurement and come back later</p>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="input-group input-group-lg mb-3">
                            <input type="number" id="measurement_input" class="form-control text-center fw-bold" 
                                value="${value}" placeholder="0.0 (optional)" step="0.1" autofocus>
                            <span class="input-group-text bg-dark text-white">${this.state.data.unit}</span>
                        </div>
                        <button class="btn btn-outline-secondary btn-sm w-100" onclick="MeasurementWizard.skipCurrent()">Skip This Measurement</button>
                    </div>
                </div>
            </div>
        `;

        this.dom.prevBtn.style.display = 'block';
        this.dom.nextBtn.textContent = this.state.currentIndex < this.state.measurements.length - 1 ? 'Next' : 'Review';
        this.dom.nextBtn.disabled = false;

        document.getElementById('measurement_input').focus();
    },

    // Show review
    showReview() {
        const rows = this.state.measurements.map((m, i) => {
            const hasValue = this.state.data[m.key] !== undefined && this.state.data[m.key] !== null && this.state.data[m.key] !== '';
            return `
            <tr class="${!hasValue ? 'opacity-50' : ''}">
                <td class="text-muted small">${m.category.toUpperCase()}</td>
                <td class="fw-bold">${m.name}</td>
                <td class="text-end ${hasValue ? 'text-gold' : 'text-muted'}">${hasValue ? this.state.data[m.key] + ' ' + this.state.data.unit : 'Skipped'}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-link" onclick="MeasurementWizard.editMeasurement(${i})">✏️</button>
                </td>
            </tr>
        `;
        }).join('');

        this.dom.container.innerHTML = `
            <div class="animate-fade-up">
                <div class="text-center mb-4">
                    <h2 class="mb-2">Review Your Profile</h2>
                    <p class="text-muted">Please verify before saving</p>
                </div>
                
                <div class="card bg-dark border-secondary mb-4">
                    <div class="card-body">
                        <div class="row text-center">
                            <div class="col-3">
                                <small class="text-muted d-block">NAME</small>
                                <strong>${this.state.data.full_name}</strong>
                            </div>
                            <div class="col-3">
                                <small class="text-muted d-block">PROFILE</small>
                                <strong>${this.state.data.profile_name}</strong>
                            </div>
                            <div class="col-3">
                                <small class="text-muted d-block">SEX</small>
                                <strong>${this.state.data.sex.toUpperCase()}</strong>
                            </div>
                            <div class="col-3">
                                <small class="text-muted d-block">UNIT</small>
                                <strong>${this.state.data.unit}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="table-responsive glass rounded-4 p-3">
                    <table class="table table-dark table-borderless mb-0">
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
        `;

        this.dom.prevBtn.style.display = 'block';
        this.dom.nextBtn.textContent = 'Save Profile';
        this.dom.nextBtn.disabled = false;
    },

    // Skip current measurement
    skipCurrent() {
        const measurement = this.state.measurements[this.state.currentIndex];
        this.state.data[measurement.key] = 0; // Auto-fill with 0 as requested

        // Move to next step or review
        if (this.state.currentIndex < this.state.measurements.length - 1) {
            this.state.currentIndex++;
            this.showMeasurement();
            this.updateProgress();
        } else {
            this.state.stage = 'review';
            this.showReview();
            this.updateProgress();
        }
    },

    editMeasurement(index) {
        this.state.stage = 'measuring';
        this.state.currentIndex = index;
        this.showMeasurement();
        this.updateProgress();
    },

    // Progress
    updateProgress() {
        if (this.state.stage === 'intro') {
            this.dom.progressBar.style.width = '0%';
            this.dom.stepIndicator.textContent = 'Getting Started';
        } else if (this.state.stage === 'measuring') {
            const total = this.state.measurements.length;
            const current = this.state.currentIndex + 1;
            const percent = (current / total) * 100;
            this.dom.progressBar.style.width = `${percent}%`;
            this.dom.stepIndicator.textContent = `Step ${current} of ${total}`;
        } else if (this.state.stage === 'review') {
            this.dom.progressBar.style.width = '100%';
            this.dom.stepIndicator.textContent = 'Final Review';
        }
    },

    // Navigation
    handleNext() {
        this.dom.msgContainer.innerHTML = '';

        if (this.state.stage === 'intro') {
            if (!this.validateIntro()) return;
            this.startMeasuring();
        } else if (this.state.stage === 'measuring') {
            if (!this.validateMeasurement()) return;

            if (this.state.currentIndex < this.state.measurements.length - 1) {
                this.state.currentIndex++;
                this.showMeasurement();
                this.updateProgress();
            } else {
                this.state.stage = 'review';
                this.showReview();
                this.updateProgress();
            }
        } else if (this.state.stage === 'review') {
            this.saveMeasurements();
        }
    },

    handlePrev() {
        if (this.state.stage === 'measuring' && this.state.currentIndex > 0) {
            this.state.currentIndex--;
            this.showMeasurement();
            this.updateProgress();
        } else if (this.state.stage === 'measuring' && this.state.currentIndex === 0) {
            this.showIntro();
        } else if (this.state.stage === 'review') {
            this.state.stage = 'measuring';
            this.state.currentIndex = this.state.measurements.length - 1;
            this.showMeasurement();
            this.updateProgress();
        }
    },

    // Validation
    validateIntro() {
        const fullName = document.getElementById('full_name').value.trim();
        const profileName = document.getElementById('profile_name').value.trim();
        const sex = document.getElementById('sex').value;
        const unit = document.getElementById('unit').value;

        if (!fullName || !profileName || !sex || !unit) {
            this.showError('Please complete all fields');
            return false;
        }

        this.state.data.full_name = fullName;
        this.state.data.profile_name = profileName;
        this.state.data.sex = sex;
        this.state.data.unit = unit;

        return true;
    },

    validateMeasurement() {
        const input = document.getElementById('measurement_input');
        const value = parseFloat(input.value);

        if (isNaN(value) || value <= 0) {
            this.showError('Please enter a valid positive number');
            return false;
        }

        const measurement = this.state.measurements[this.state.currentIndex];
        this.state.data[measurement.key] = value;

        return true;
    },

    startMeasuring() {
        const sex = this.state.data.sex;
        this.state.measurements = sex === 'female' ?
            this.config.FEMALE_MEASUREMENTS :
            this.config.MALE_MEASUREMENTS;

        this.state.stage = 'measuring';
        this.state.currentIndex = 0;
        this.showMeasurement();
        this.updateProgress();
    },

    // Save to database
    async saveMeasurements() {
        this.dom.nextBtn.disabled = true;
        this.dom.nextBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

        const supabase = window.supabaseClient;
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            this.dom.container.innerHTML = `
                <div class="text-center animate-fade-up py-5">
                    <div class="mb-4" style="font-size: 4rem;">🔒</div>
                    <h2 class="mb-3">Login Required</h2>
                    <p class="text-muted mb-4">Please log in to save your measurements</p>
                    <a href="login.html?redirect=measure-me.html" class="btn btn-primary btn-lg">Log In / Sign Up</a>
                </div>
            `;
            this.dom.nav.style.display = 'none';
            return;
        }

        try {
            // Insert measurement session
            const { data: session_record, error: sessionError } = await supabase
                .from('measurements')
                .insert({
                    user_id: session.user.id,
                    full_name: this.state.data.full_name,
                    profile_name: this.state.data.profile_name,
                    sex: this.state.data.sex,
                    unit: this.state.data.unit
                })
                .select()
                .single();

            if (sessionError) throw sessionError;

            // Insert individual measurements
            const items = this.state.measurements.map(m => ({
                measurement_id: session_record.id,
                category: m.category,
                measurement_key: m.key,
                measurement_value: this.state.data[m.key],
                display_name: m.name
            }));

            const { error: itemsError } = await supabase
                .from('measurement_items')
                .insert(items);

            if (itemsError) throw itemsError;

            this.showSuccess();

        } catch (error) {
            console.error('Save failed:', error);
            this.showError('Save failed: ' + error.message);
            this.dom.nextBtn.disabled = false;
            this.dom.nextBtn.textContent = 'Try Again';
        }
    },

    showSuccess() {
        this.dom.nav.style.display = 'none';
        this.dom.container.innerHTML = `
            <div class="text-center animate-fade-up py-5">
                <div class="mb-4" style="font-size: 5rem; color: var(--accent-color);">✓</div>
                <h2 class="mb-3">Profile Saved!</h2>
                <p class="text-muted mb-4">Your measurements are securely stored</p>
                <div class="d-flex justify-content-center gap-3">
                    <a href="profile.html" class="btn btn-secondary">My Profile</a>
                    <a href="collection.html" class="btn btn-primary">Shop Collection</a>
                </div>
            </div>
        `;
    },

    showError(msg) {
        this.dom.msgContainer.innerHTML = `<div class="alert alert-danger animate-fade-up">${msg}</div>`;
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    MeasurementWizard.init();
});
