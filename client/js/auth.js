import { updateAuthToken, updateCurrentUser, authToken } from './state.js';
import { updateNav, showSection } from './ui.js';

export async function fetchUserProfile() {
    try {
        console.log('[Auth Client] Fetching user profile');
        const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (data.success) {
            console.log('[Auth Client] User profile fetched successfully');
            updateCurrentUser(data.data);
            updateNav();
        } else {
            console.warn('[Auth Client] Profile fetch failed, logging out');
            logout();
        }
    } catch (err) {
        console.error('[Auth Client Error] Profile fetch failed:', err);
        logout();
    }
}

export function setupAuthForms() {
    console.log('[Auth Client] Setting up auth forms');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            console.log('[Auth Client] Login attempt for:', email);
            
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (data.success) {
                    console.log('[Auth Client] Login successful');
                    updateAuthToken(data.token);
                    await fetchUserProfile();
                    showSection('main');
                } else {
                    console.warn('[Auth Client] Login failed:', data.error);
                    alert(data.error);
                }
            } catch (err) {
                console.error('[Auth Client Error] Login failed:', err);
                alert('Login failed');
            }
        };
    }

    if (registerForm) {
        registerForm.onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            console.log('[Auth Client] Registration attempt for:', email);
            
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await res.json();
                if (data.success) {
                    console.log('[Auth Client] Registration successful');
                    updateAuthToken(data.token);
                    await fetchUserProfile();
                    showSection('main');
                } else {
                    console.warn('[Auth Client] Registration failed:', data.error);
                    alert(data.error);
                }
            } catch (err) {
                console.error('[Auth Client Error] Registration failed:', err);
                alert('Registration failed');
            }
        };
    }
}

export function logout() {
    console.log('[Auth Client] Logging out user');
    updateCurrentUser(null);
    updateAuthToken(null);
    updateNav();
    showSection('main');
}
