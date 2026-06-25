import { authToken } from './state.js';
import { showSection } from './ui.js';

export async function openViewer(roadmap) {
    console.log('[Viewer] Opening roadmap:', roadmap.title);

    const content = document.getElementById('viewer-content');
    const steps = roadmap.steps || [];

    const isPublic = roadmap._type === 'public' || roadmap._type === 'bookmarked';
    const topic = roadmap.topic || '';
    const description = roadmap.description || '';

    const stepsHtml = steps.map((step, i) => `
        <div class="step">
            <div class="step-number">${i + 1}</div>
            <div class="step-content">
                <h3>${esc(step.title)}</h3>
                <p>${esc(step.description)}</p>
                ${step.resources && step.resources.length ? `
                <ul class="resources">
                    ${step.resources.map(r => `
                        <li>
                            <a href="https://www.google.com/search?q=${encodeURIComponent(r)}"
                               target="_blank" class="resource-link">
                                <i class="fas fa-external-link-alt"></i> ${esc(r)}
                            </a>
                        </li>
                    `).join('')}
                </ul>
                ` : ''}
            </div>
        </div>
    `).join('');

    content.innerHTML = `
        <div class="viewer-header">
            <h2>${esc(roadmap.title)}</h2>
            <div class="viewer-meta">
                ${topic ? `<span><i class="fas fa-tag"></i> ${esc(topic)}</span>` : ''}
                <span><i class="fas fa-list-ol"></i> ${steps.length} steps</span>
                ${roadmap.createdAt ? `<span><i class="fas fa-calendar"></i> ${new Date(roadmap.createdAt).toLocaleDateString()}</span>` : ''}
            </div>
            ${description ? `<p class="viewer-description">${esc(description)}</p>` : ''}
        </div>
        ${authToken && isPublic ? `
        <div class="viewer-actions">
            <button id="save-roadmap-btn" class="btn-primary" onclick="window.saveRoadmap('${roadmap._id}')">
                <i class="fas fa-bookmark"></i> Save to My Roadmaps
            </button>
        </div>
        ` : ''}
        <div class="steps">${stepsHtml}</div>
    `;

    showSection('viewer');
}

window.saveRoadmap = async (id) => {
    const btn = document.getElementById('save-roadmap-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    try {
        const res = await fetch(`/api/roadmap/save/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
        });
        const result = await res.json();
        if (result.success) {
            btn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            btn.style.background = 'var(--accent-dark)';
        } else {
            btn.innerHTML = `<i class="fas fa-exclamation"></i> ${result.error || 'Already saved'}`;
            btn.disabled = false;
        }
    } catch (err) {
        btn.innerHTML = '<i class="fas fa-exclamation"></i> Failed';
        btn.disabled = false;
    }
};

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
