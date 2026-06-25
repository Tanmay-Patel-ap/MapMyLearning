import { authToken } from './state.js';
import { showSection } from './ui.js';

let currentStep = 1;
const totalSteps = 3;
const formData = { visibility: 'private', category: 'role' };

function updateStep() {
    document.querySelectorAll('.question-step').forEach(el => {
        el.classList.toggle('active', parseInt(el.dataset.step) === currentStep);
    });
    document.querySelectorAll('.step-dot').forEach(el => {
        const step = parseInt(el.dataset.step);
        el.classList.toggle('active', step === currentStep);
        el.classList.toggle('done', step < currentStep);
    });
    document.getElementById('prev-step').disabled = currentStep === 1;
    document.getElementById('next-step').classList.toggle('hidden', currentStep === totalSteps);
    document.getElementById('generate-btn').classList.toggle('hidden', currentStep !== totalSteps);
}

export function openQuestionnaire() {
    currentStep = 1;
    formData.topic = '';
    formData.goal = '';
    formData.visibility = 'private';
    formData.category = 'role';
    document.getElementById('q-topic').value = '';
    document.querySelectorAll('.goal-card.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.visibility-card').forEach(el => el.classList.remove('active'));
    document.querySelector('.visibility-card[data-value="private"]').classList.add('active');
    document.querySelectorAll('.category-option').forEach(el => el.classList.remove('active'));
    document.querySelector('.category-option[data-value="role"]').classList.add('active');
    document.getElementById('questionnaire-overlay').classList.remove('hidden');
    updateStep();
    setTimeout(() => document.getElementById('q-topic').focus(), 100);
}

function closeQuestionnaire() {
    document.getElementById('questionnaire-overlay').classList.add('hidden');
}

function nextStep() {
    if (currentStep === 1) {
        const topic = document.getElementById('q-topic').value.trim();
        if (!topic) {
            document.getElementById('q-topic').style.borderColor = 'var(--danger)';
            return;
        }
        document.getElementById('q-topic').style.borderColor = '';
        formData.topic = topic;
    }
    if (currentStep === 2) {
        if (!formData.goal) {
            return;
        }
    }
    if (currentStep < totalSteps) {
        currentStep++;
        updateStep();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStep();
    }
}

async function generateRoadmap() {
    const generateBtn = document.getElementById('generate-btn');
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    try {
        const response = await fetch('/api/roadmap/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken ? `Bearer ${authToken}` : ''
            },
            body: JSON.stringify({
                topic: formData.topic,
                goal: formData.goal,
                visibility: formData.visibility,
                category: formData.category
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            const errorMsg = result.error || 'Failed to generate roadmap.';
            console.error(`[API Error] Status ${response.status}: ${errorMsg}`);
            if (response.status === 401) {
                closeQuestionnaire();
                setTimeout(() => showSection('login'), 500);
                return;
            }
            throw new Error(errorMsg);
        }

        console.log(`[API Success] Roadmap received: "${result.data.title}"`);
        closeQuestionnaire();
        window.openViewerById(result.data._id, 'personal');
    } catch (error) {
        console.error('[Client Error]', error.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate';
    }
}

export function setupRoadmapForm() {
    document.getElementById('close-questionnaire').onclick = closeQuestionnaire;
    document.getElementById('prev-step').onclick = prevStep;
    document.getElementById('next-step').onclick = nextStep;
    document.getElementById('generate-btn').onclick = generateRoadmap;

    document.getElementById('questionnaire-overlay').onclick = (e) => {
        if (e.target === e.currentTarget) closeQuestionnaire();
    };

    document.getElementById('q-topic').onkeydown = (e) => {
        if (e.key === 'Enter') nextStep();
    };

    document.querySelectorAll('.category-option').forEach(el => {
        el.onclick = () => {
            document.querySelectorAll('.category-option').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
            formData.category = el.dataset.value;
        };
    });

    document.querySelectorAll('.goal-card').forEach(card => {
        card.onclick = () => {
            document.querySelectorAll('.goal-card').forEach(el => el.classList.remove('selected'));
            card.classList.add('selected');
            formData.goal = card.dataset.value;
        };
    });

    document.querySelectorAll('.visibility-card').forEach(card => {
        card.onclick = () => {
            document.querySelectorAll('.visibility-card').forEach(el => el.classList.remove('active'));
            card.classList.add('active');
            formData.visibility = card.dataset.value;
        };
    });
}
