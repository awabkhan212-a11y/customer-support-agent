/**
 * AgriGuard | Multi-Agent Agriculture Logic
 */

// --- Knowledge Base ---
const CROP_DISEASES = {
    "Nutrient Deficiency": {
        symptoms: ["yellow leaves"],
        treatment: ["Apply N-P-K fertilizer", "Check soil pH levels", "Use organic compost"],
        actions: ["Monitor leaf color weekly", "Ensure proper sunlight exposure"],
        insight: "Yellowing of leaves often indicates a lack of essential nutrients like Nitrogen or Iron, preventing chlorophyll production."
    },
    "Fungal Infection": {
        symptoms: ["brown spots", "fungus"],
        treatment: ["Apply copper-based fungicide", "Remove infected leaves immediately", "Improve air circulation"],
        actions: ["Sanitize garden tools", "Avoid overhead watering to keep leaves dry"],
        insight: "Moist and humid conditions promote fungal spore growth, which manifests as dark spots or visible fuzzy patches."
    },
    "Powdery Mildew": {
        symptoms: ["white powder"],
        treatment: ["Apply sulfur-based spray", "Mix neem oil with water and spray", "Thin out plants to improve airflow"],
        actions: ["Move plant to a less humid area", "Monitor new growth for signs of spread"],
        insight: "White powdery coating is a specific fungal growth that thrives in high humidity but dry leaf surfaces."
    },
    "Water Stress": {
        symptoms: ["wilting", "dryness"],
        treatment: ["Adjust irrigation schedule", "Deep water the roots early morning", "Apply mulch to retain moisture"],
        actions: ["Check soil moisture depth regularly", "Protect from extreme midday sun"],
        insight: "Wilting and dryness occur when the plant's transpiration rate exceeds its water uptake, leading to cell turgor loss."
    },
    "Bacterial Wilt": {
        symptoms: ["wilting", "yellow leaves"],
        treatment: ["Isolate infected plants", "Improve soil drainage", "Use disease-resistant varieties next season"],
        actions: ["Avoid moving soil from infected areas", "Sterilize pots and tools"],
        insight: "Bacterial pathogens can clog the plant's vascular system, preventing water flow even if the soil is wet."
    }
};

const DEFAULT_DIAGNOSIS = {
    disease: "Undetermined Condition",
    treatment: ["Consult a local agricultural expert", "Check for pests or root issues"],
    actions: ["Keep a daily log of changes", "Isolate the plant if possible"],
    insight: "Your symptoms don't clearly match a common disease. This could be a combination of factors or a specific local issue."
};

// --- Agent Systems ---

const InputAgent = {
    getData() {
        const crop = document.getElementById('crop-type').value;
        const symptoms = Array.from(document.querySelectorAll('input[name="symptom"]:checked')).map(cb => cb.value);
        return { crop, symptoms };
    },
    saveData(data) {
        localStorage.setItem('agri_last_scan', JSON.stringify(data));
    },
    loadLast() {
        const last = localStorage.getItem('agri_last_scan');
        return last ? JSON.parse(last) : null;
    }
};

const DiagnosisAgent = {
    diagnose(symptoms) {
        if (symptoms.length === 0) return null;

        // Simple scoring based on symptom overlap
        let bestMatch = null;
        let highestScore = 0;

        for (const [disease, data] of Object.entries(CROP_DISEASES)) {
            const overlap = symptoms.filter(s => data.symptoms.includes(s)).length;
            if (overlap > highestScore) {
                highestScore = overlap;
                bestMatch = { disease, ...data };
            }
        }

        return bestMatch || { disease: "General Stress", ...DEFAULT_DIAGNOSIS };
    }
};

// --- Orchestrator & UI Controller ---

const AgriController = {
    init() {
        const form = document.getElementById('agri-form');
        form.addEventListener('submit', (e) => this.handleAnalysis(e));

        // Load last session
        const lastData = InputAgent.loadLast();
        if (lastData) {
            this.fillForm(lastData);
        }
    },

    fillForm(data) {
        document.getElementById('crop-type').value = data.crop;
        data.symptoms.forEach(s => {
            const cb = document.querySelector(`input[value="${s}"]`);
            if (cb) cb.checked = true;
        });
    },

    async handleAnalysis(e) {
        e.preventDefault();
        const { crop, symptoms } = InputAgent.getData();

        if (symptoms.length === 0) {
            alert("Please select at least one symptom.");
            return;
        }

        const btn = document.getElementById('analyze-btn');
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader"></i> Analyzing...';
        lucide.createIcons();

        // Simulate agent processing
        this.resetAgentIndicators();
        await this.runStep('agent-input', 500);
        
        const diagnosis = DiagnosisAgent.diagnose(symptoms);
        await this.runStep('agent-diagnosis', 800);
        await this.runStep('agent-treatment', 600);
        await this.runStep('agent-action', 600);
        await this.runStep('agent-insight', 500);

        this.renderResults(diagnosis);
        InputAgent.saveData({ crop, symptoms });

        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="microscope"></i> Analyze Crop Health';
        lucide.createIcons();
    },

    async runStep(id, delay) {
        const el = document.getElementById(id);
        el.classList.add('active');
        await new Promise(r => setTimeout(r, delay));
        el.classList.remove('active');
        el.classList.add('complete');
    },

    resetAgentIndicators() {
        document.querySelectorAll('.agent-item').forEach(el => {
            el.classList.remove('active', 'complete');
        });
    },

    renderResults(data) {
        const results = document.getElementById('results-section');
        results.classList.remove('hidden');

        // Diagnosis
        document.getElementById('diagnosis-text').innerText = `Based on the symptoms, your ${document.getElementById('crop-type').value} is likely suffering from:`;
        document.getElementById('disease-badge').innerText = data.disease;

        // Treatment
        const treatmentList = document.getElementById('treatment-list');
        treatmentList.innerHTML = data.treatment.map(t => `<li>${t}</li>`).join('');

        // Action
        const actionList = document.getElementById('action-list');
        actionList.innerHTML = data.actions.map(a => `<li>${a}</li>`).join('');

        // Insight
        document.getElementById('insight-text').innerText = data.insight;

        // Smooth scroll
        results.scrollIntoView({ behavior: 'smooth' });
    }
};

AgriController.init();
