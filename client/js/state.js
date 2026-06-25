export let currentUser = null;
export let authToken = localStorage.getItem('authToken');
console.log('[State] Initial auth token:', authToken ? 'present' : 'not present');

export const navLinks = document.getElementById('nav-links');

export function updateAuthToken(newToken) {
    console.log('[State] Updating auth token:', newToken ? 'setting' : 'removing');
    authToken = newToken;
    if (newToken) {
        localStorage.setItem('authToken', newToken);
    } else {
        localStorage.removeItem('authToken');
    }
}

export function updateCurrentUser(user) {
    console.log('[State] Updating current user:', user?.name || 'null');
    currentUser = user;
}
