import { authToken } from './state.js';
import { updateNav } from './ui.js';
import { fetchUserProfile, setupAuthForms } from './auth.js';
import { setupRoadmapForm } from './roadmap.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Main] DOM fully loaded and parsed');
    if (authToken) {
        console.log('[Main] Auth token found, fetching user profile');
        fetchUserProfile();
    } else {
        console.log('[Main] No auth token, showing default navigation');
        updateNav();
    }
    
    console.log('[Main] Setting up auth forms');
    setupAuthForms();
    console.log('[Main] Setting up roadmap form');
    setupRoadmapForm();
    console.log('[Main] App initialization complete');
});
