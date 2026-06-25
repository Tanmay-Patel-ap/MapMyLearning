import { authToken } from './state.js';
import { updateNav, showSection } from './ui.js';
import { fetchUserProfile, setupAuthForms } from './auth.js';
import { setupRoadmapForm, openQuestionnaire } from './roadmap.js';
import { loadDashboard } from './dashboard.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Main] DOM fully loaded and parsed');

    setupAuthForms();
    setupRoadmapForm();
    setupBackButton();

    if (authToken) {
        console.log('[Main] Auth token found, fetching user profile');
        fetchUserProfile().then(() => {
            showSection('dashboard');
        });
    } else {
        console.log('[Main] No auth token, showing default navigation');
        updateNav();
    }

    console.log('[Main] App initialization complete');
});

function setupBackButton() {
    const backBtn = document.getElementById('back-to-dashboard');
    if (backBtn) {
        backBtn.onclick = () => showSection('dashboard');
    }
}

window.openQuestionnaire = openQuestionnaire;
