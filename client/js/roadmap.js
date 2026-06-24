import { roadmapForm, submitBtn, statusMsg, roadmapResult, authToken } from './state.js';
import { showSection } from './ui.js';

export function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Generating...' : 'Generate';
    if (isLoading) {
        statusMsg.textContent = 'This may take up to 30 seconds...';
        statusMsg.classList.remove('error');
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function renderRoadmap(data) {
    console.log('[UI] Rendering roadmap steps');
    const { title, steps } = data;

    const stepsHtml = steps
        .map(
            (step, index) => `
            <div class="step">
                <div class="step-number">${escapeHtml(index + 1)}</div>
                <div class="step-content">
                <h3>${escapeHtml(step.title)}</h3>
                <p>${escapeHtml(step.description)}</p>
                <ul class="resources">
                    ${step.resources
                    .map(
                        (res) => `
                    <li>
                        <a href="https://www.google.com/search?q=${encodeURIComponent(res)}" 
                        target="_blank" 
                        class="resource-link">
                        <i class="fas fa-external-link-alt"></i> ${escapeHtml(res)}
                        </a>
                    </li>`
                    )
                    .join('')}
                </ul>
                </div>
            </div>
        `
        )
        .join('');

    roadmapResult.innerHTML = `
        <h2 class="roadmap-title">${escapeHtml(title)}</h2>
        <div class="steps">${stepsHtml}</div>
    `;
}

export function setupRoadmapForm() {
    if (!roadmapForm) return;

    roadmapForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const topicInput = document.getElementById('topic');
        const topic = topicInput.value.trim();

        if (!topic) return;

        setLoading(true);
        roadmapResult.classList.add('hidden');
        
        console.log(`[User Action] Form submitted for topic: "${topic}"`);

        try {
            console.log('[API Request] Fetching roadmap from /api/roadmap/generate');
            const response = await fetch('/api/roadmap/generate', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': authToken ? `Bearer ${authToken}` : ''
                },
                body: JSON.stringify({ topic })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                const errorMsg = result.error || 'Failed to generate roadmap.';
                console.error(`[API Error] Status ${response.status}: ${errorMsg}`);
                if (response.status === 401) {
                    statusMsg.textContent = 'Please login first to generate a roadmap.';
                    statusMsg.classList.add('error');
                    setTimeout(() => showSection('login'), 1500);
                    return;
                }
                throw new Error(errorMsg);
            }

            console.log(`[API Success] Roadmap received: "${result.data.title}"`);
            renderRoadmap(result.data);
            roadmapResult.classList.remove('hidden');
            statusMsg.textContent = '';
        } catch (error) {
            console.error('[Client Error]', error.message);
            statusMsg.textContent = error.message;
            statusMsg.classList.add('error');
        } finally {
            setLoading(false);
        }
    });
}
