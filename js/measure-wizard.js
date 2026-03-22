/**
 * CK STYLE - Measurement Wizard (Rebuilt for Reliability)
 * Sex-based dynamic measurement flow with normalized database storage
 */

const MeasurementWizard = {
    // Configuration
    config: {
        FEMALE_MEASUREMENTS: [
            // Top
            { category: 'top', key: 'hand_length', name: 'Hand Length', desc: '1. Stand up straight with your arm relaxed at your side.<br>2. Find your shoulder joint (where the shoulder meets the arm).<br>3. Measure from the shoulder joint down to your wrist bone.<br>💡 Keep the tape straight and do not bend the arm.' },
            { category: 'top', key: 'hand_round', name: 'Hand Round', desc: '1. Wrap the tape measure around the widest part of your upper arm (bicep).<br>2. Ensure the tape is level all the way around.<br>3. Keep it snug but not tight enough to pinch the skin.<br>💡 Leave enough room to slide one finger under the tape.' },
            { category: 'top', key: 'wrist_round', name: 'Wrist Round', desc: '1. Measure exactly around the wrist bone.<br>2. Keep the tape measure comfortably flush against the skin.<br>💡 This ensures the sleeve cuff will fit perfectly without being too loose or tight.' },
            { category: 'top', key: 'chest', name: 'Chest', desc: '1. Empty your lungs by exhaling normally.<br>2. Wrap the tape around the fullest part of your chest (usually across the nipples).<br>3. Make sure the tape is perfectly horizontal across your back.<br>💡 Do not pull the tape too tight; stand naturally without puffing out your chest.' },
            { category: 'top', key: 'shoulder', name: 'Shoulder', desc: '1. Have someone help you measure across your back.<br>2. Find the prominent bone at the tip of each shoulder.<br>3. Measure directly from one shoulder bone to the other across the natural curve of the back.' },
            { category: 'top', key: 'neck', name: 'Neck Round', desc: '1. Wrap the tape around the base of your neck where a collar would naturally sit.<br>2. Keep the tape level.<br>3. Insert two fingers between the tape and your neck to ensure a comfortable breathing fit.' },
            { category: 'top', key: 'stomach', name: 'Stomach', desc: '1. Wrap the tape around the widest part of your stomach/abdomen.<br>2. This is usually around the belly button area.<br>3. Do not suck your stomach in; stand in a natural, relaxed posture.' },
            { category: 'top', key: 'top_length', name: 'Top Length', desc: '1. Start the tape at the highest point of your shoulder (near the base of the neck).<br>2. Let the tape fall straight down your front.<br>3. Measure down to your desired length (e.g., hip level or below).' },

            // Gown
            { category: 'gown', key: 'gown_length', name: 'Gown Length', desc: '1. Wear shoes with the heel height you intend to wear with the gown.<br>2. Measure from the top of the shoulder (near the neck base).<br>3. Drop the tape straight down over the chest to your desired gown hem level (floor, ankle, etc.).' },
            { category: 'gown', key: 'gown_shoulder', name: 'Gown Shoulder', desc: '1. Stand straight and tall.<br>2. Have a helper measure across your back from the exact tip of one shoulder bone to the tip of the other.' },
            { category: 'gown', key: 'gown_chest', name: 'Gown Chest', desc: '1. Wearing a standard, unpadded bra, wrap the tape around the fullest part of your bust.<br>2. Keep the tape completely level parallel to the floor around your back.' },

            // Trousers
            { category: 'trousers', key: 'trouser_length', name: 'Trouser Length', desc: '1. Stand barefoot or in typical shoes.<br>2. Measure from your natural waistline (the narrowest part of your torso).<br>3. Run the tape down the side of your leg to your ankle bone or desired trouser length.' },
            { category: 'trousers', key: 'lap', name: 'Lap (Thigh)', desc: '1. Stand with feet slightly apart.<br>2. Wrap the tape around the absolute thickest part of your upper thigh.<br>3. Ensure the tape is level and snug, but not constricting.' },
            { category: 'trousers', key: 'waist', name: 'Waist', desc: '1. Locate your natural waistline (usually just above the belly button and below the rib cage).<br>2. Wrap the tape around this point.<br>3. Breathe out normally and keep one finger under the tape for comfort.' },
            { category: 'trousers', key: 'back_foot', name: 'Back Foot', desc: '1. Measure starting right at the waistline on your back.<br>2. Tape should run straight down the back of your leg to the floor/ankle.<br>💡 This is crucial for trouser rise and drop measurements.' },
            { category: 'trousers', key: 'foot_round', name: 'Foot Round', desc: '1. Measure around the tip of your heel and the top of your foot.<br>2. Keep the tape wrapped diagonally around the ankle opening area.<br>💡 This ensures your foot can easily slip through the trouser hem.' },
            { category: 'trousers', key: 'knee_round', name: 'Knee Round', desc: '1. Stand naturally with your leg unbent.<br>2. Measure around your kneecap and the back of your knee.<br>3. Do not pull too tight; leave a bit of ease for sitting and walking.' },
            { category: 'trousers', key: 'hips', name: 'Hips', desc: '1. Remove any bulky items from your pockets.<br>2. Stand with your feet together.<br>3. Wrap the tape measure securely around the fullest, widest part of your hips and buttocks.' }
        ],
        MALE_MEASUREMENTS: [
            // Top
            { category: 'top', key: 'hand_length', name: 'Hand Length', desc: '1. Keep your arm relaxed down at your side.<br>2. Start the tape exactly where the shoulder seam of a well-fitting shirt would sit.<br>3. Measure straight down to the wrist bone where you want the cuff to end.' },
            { category: 'top', key: 'hand_round', name: 'Hand Round', desc: '1. Wrap the tape around the thickest part of your bicep.<br>2. Relax the arm (do not flex).<br>3. Keep the tape horizontal and snug, and slide two fingers underneath for comfort ease.' },
            { category: 'top', key: 'wrist_round', name: 'Wrist Round', desc: '1. Wrap the tape precisely around the wrist bone.<br>2. Keep it snug.<br>💡 We will automatically add the necessary ease for your shirt/suit cuffs.' },
            { category: 'top', key: 'chest', name: 'Chest', desc: '1. Relax and breathe out naturally.<br>2. Wrap the tape around the fullest part of your chest, right under the armpits.<br>3. Ensure the tape is horizontal across your shoulder blades in the back.' },
            { category: 'top', key: 'shoulder', name: 'Shoulder', desc: '1. Have a friend measure across your upper back.<br>2. Start at the outer tip of one shoulder bone.<br>3. Measure across the natural curve of the shoulders to the outer tip of the other shoulder bone.' },
            { category: 'top', key: 'neck', name: 'Neck Round', desc: '1. Measure around the lower part of your neck, slightly below the Adams apple.<br>2. Keep the tape level.<br>3. Insert exactly two fingers flat between the tape and your neck for breathing room.' },
            { category: 'top', key: 'stomach', name: 'Stomach', desc: '1. Measure around your waist/stomach at its widest point.<br>2. This is usually at or just below the belly button.<br>3. Do NOT suck in your stomach; stand relaxed and breathe normally.' },
            { category: 'top', key: 'top_length', name: 'Top Length', desc: '1. Find the base of the back of your neck (where the collar sits).<br>2. Run the tape straight down the center of your back.<br>3. Stop at the point where you want the shirt or suit jacket to end (typically mid-crotch level).' },

            // Trousers
            { category: 'trousers', key: 'trouser_length', name: 'Trouser Length', desc: '1. Stand straight in bare feet or socks.<br>2. Start the tape at your natural waistline or where you normally wear your trousers.<br>3. Measure down the outside of your leg to the top of the shoe/ankle.' },
            { category: 'trousers', key: 'lap', name: 'Lap (Thigh)', desc: '1. Stand with legs slightly apart.<br>2. Measure around the very thickest part of your thigh, just below the crotch.<br>3. Ensure the tape is horizontal and not pulling aggressively against the skin.' },
            { category: 'trousers', key: 'waist', name: 'Waist', desc: '1. Measure around where you normally wear the waistband of your trousers.<br>2. Insert one finger between the tape and your body.<br>3. Keep the tape level and snug, but not cutting in.' },
            { category: 'trousers', key: 'back_foot', name: 'Back Foot', desc: '1. This is the outseam back measurement.<br>2. Measure from your trouser waistline at the back, straight down the leg to the back of the heel.' },
            { category: 'trousers', key: 'foot_round', name: 'Foot Round', desc: '1. Wrap the tape diagonally around your heel and instep (top of foot).<br>2. This ensures the pant leg opening will be wide enough to pass your foot through comfortably.' },
            { category: 'trousers', key: 'knee_round', name: 'Knee Round', desc: '1. Stand naturally without bending the knee.<br>2. Measure exactly around the center of the kneecap.<br>3. Leave a little bit of slack for sitting down comfortably.' },
            { category: 'trousers', key: 'hips', name: 'Hips', desc: '1. Empty your pockets completely.<br>2. Stand with your feet close together.<br>3. Wrap the tape around the very fullest part of your buttocks and hips, keeping the tape level parallel to the floor.' }
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
                    
                    <!-- How to Measure (Left on Desktop, Bottom on Mobile) -->
                    <div class="col-md-6 mb-4 mb-md-0 order-last order-md-first">
                        <div class="glass p-4 rounded-4 border-start border-4 border-warning">
                            <h5 class="text-gold mb-3">📏 How to Measure</h5>
                            <div class="mb-0 text-muted" style="line-height: 1.6;">${measurement.desc}</div>
                        </div>
                    </div>
                    
                    <!-- Input & Skip Button (Right on Desktop, Top on Mobile) -->
                    <div class="col-md-6 order-first order-md-last mb-4 mb-md-0">
                        <div class="input-group input-group-lg mb-3">
                            <input type="number" id="measurement_input" class="form-control text-center fw-bold" 
                                value="${value}" placeholder="0.0 (optional)" step="0.1" autofocus>
                            <span class="input-group-text" style="background: var(--bg-card); color: var(--text-main); border-color: var(--glass-border);">${this.state.data.unit}</span>
                        </div>
                        <button class="btn btn-outline-secondary btn-sm w-100 mb-2 py-2 fw-bold" onclick="MeasurementWizard.skipCurrent()">
                            Skip This Measurement
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.dom.prevBtn.style.display = 'block';
        this.dom.nextBtn.textContent = this.state.currentIndex < this.state.measurements.length - 1 ? 'Next' : 'Review';
        this.dom.nextBtn.disabled = false;

        document.getElementById('measurement_input').focus();
        // Scroll the measurement heading into view on mobile so users can see what they're measuring
        setTimeout(() => {
            const container = document.querySelector('.animate-fade-up');
            if (container) {
                container.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300);
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
                
                <div class="card border-0" style="background: var(--bg-card); border: 1px solid var(--glass-border) !important; border-radius: 16px;">
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
                    <table class="table table-borderless mb-0" style="color: var(--text-main);">
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
                measurement_value: parseFloat(this.state.data[m.key]) || 0,
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
