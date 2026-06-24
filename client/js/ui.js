import { currentUser, navLinks } from './state.js';
import { logout } from './auth.js';

export function updateNav() {
    console.log('[UI] Updating navigation');
    if (currentUser) {
        console.log('[UI] User logged in, showing user menu');
        navLinks.innerHTML = `
        <div class="user-menu" id="user-menu-trigger">
            <div class="user-badge">
            <i class="fas fa-user-circle"></i>
            <span>${currentUser.name}</span>
            <i class="fas fa-chevron-down"></i>
            </div>
            <div class="dropdown" id="user-dropdown">
            <a href="javascript:void(0)" class="dropdown-item" onclick="window.showSection('profile')">
                <i class="fas fa-user"></i> My Profile
            </a>
            <a href="javascript:void(0)" class="dropdown-item" onclick="window.showSection('dashboard')">
                <i class="fas fa-columns"></i> Dashboard
            </a>
            <div class="dropdown-divider"></div>
            <a href="javascript:void(0)" class="dropdown-item" onclick="window.showSection('main')">
                <i class="fas fa-plus"></i> New Roadmap
            </a>
            <div class="dropdown-divider"></div>
            <a href="javascript:void(0)" class="dropdown-item" style="color: var(--danger)" onclick="window.logout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
            </div>
        </div>
        `;
        
        // Add dropdown toggle logic
        const trigger = document.getElementById('user-menu-trigger');
        const dropdown = document.getElementById('user-dropdown');
        if (trigger && dropdown) {
            trigger.onclick = (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            };
            document.onclick = () => dropdown.classList.remove('active');
        }
    } else {
        console.log('[UI] User not logged in, showing auth buttons');
        navLinks.innerHTML = `
        <button class="btn-secondary" onclick="window.showSection('login')">Login</button>
        <button class="btn-primary" onclick="window.showSection('register')">Get Started</button>
        `;
    }
}

export function showSection(sectionId) {
    console.log('[UI] Showing section:', sectionId);
    const sections = [
        'login-section', 
        'register-section', 
        'main-content', 
        'dashboard-section', 
        'profile-section'
    ];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    if (sectionId === 'main') {
        document.getElementById('main-content').classList.remove('hidden');
    } else {
        const target = document.getElementById(`${sectionId}-section`);
        if (target) target.classList.remove('hidden');
    }
}

// Make functions available globally for inline onclick handlers
window.showSection = showSection;
window.logout = logout;
