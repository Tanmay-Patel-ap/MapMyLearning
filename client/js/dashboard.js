import { authToken, currentUser } from './state.js';
import { openViewer } from './viewer.js';

export async function loadDashboard() {
    console.log('[Dashboard] Loading dashboard data');

    const personalEl = document.getElementById('personal-roadmaps');
    const bookmarkedEl = document.getElementById('bookmarked-roadmaps');
    const roleEl = document.getElementById('role-roadmaps');
    const skillEl = document.getElementById('skill-roadmaps');

    const personalSection = document.getElementById('personal-section');
    const bookmarkedSection = document.getElementById('bookmarked-section');

    if (!currentUser) {
        personalSection.classList.add('hidden');
        bookmarkedSection.classList.add('hidden');
    } else {
        personalSection.classList.remove('hidden');
        bookmarkedSection.classList.remove('hidden');
    }

    const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};

    try {
        const [personalRes, bookmarkedRes, publicRes] = await Promise.all([
            currentUser
                ? fetch('/api/roadmap/my', { headers }).then(r => r.json())
                : Promise.resolve({ success: true, data: [] }),
            currentUser
                ? fetch('/api/roadmap/bookmarked', { headers }).then(r => r.json())
                : Promise.resolve({ success: true, data: [] }),
            fetch('/api/roadmap/public').then(r => r.json())
        ]);

        let bookmarkedIds = [];
        if (currentUser && bookmarkedRes.success) {
            bookmarkedIds = (bookmarkedRes.data || []).map(r => r._id || r.id);
        }

        if (currentUser) {
            renderPersonalRoadmaps(personalEl, personalRes.data || []);
            renderBookmarked(bookmarkedEl, bookmarkedRes.data || []);
        }

        if (publicRes.success && publicRes.data) {
            renderPublicRoadmaps(roleEl, publicRes.data.role || [], 'role', bookmarkedIds);
            renderPublicRoadmaps(skillEl, publicRes.data.skill || [], 'skill', bookmarkedIds);
        }
    } catch (err) {
        console.error('[Dashboard Error]', err);
        [personalEl, bookmarkedEl, roleEl, skillEl].forEach(el => {
            if (el) el.innerHTML = '<p class="empty-state">Failed to load roadmaps.</p>';
        });
    }
}

function renderPersonalRoadmaps(container, roadmaps) {
    if (!roadmaps.length) {
        container.innerHTML = '<p class="empty-state">No roadmaps yet. Create your first one!</p>';
        return;
    }
    container.innerHTML = roadmaps.map(r => cardHtml(r, 'personal')).join('');
}

function renderBookmarked(container, roadmaps) {
    if (!roadmaps.length) {
        container.innerHTML = '<p class="empty-state">No bookmarked roadmaps.</p>';
        return;
    }
    container.innerHTML = roadmaps.map(r => cardHtml(r, 'bookmarked')).join('');
}

function renderPublicRoadmaps(container, roadmaps, category, bookmarkedIds) {
    if (!roadmaps.length) {
        container.innerHTML = '<p class="empty-state">No roadmaps yet.</p>';
        return;
    }
    container.innerHTML = roadmaps.map(r => {
        const bm = bookmarkedIds.includes(r._id);
        return `
        <div class="roadmap-card" data-id="${r._id}" data-title="${esc(r.title)}">
            <div class="roadmap-card-top">
                <h3>${esc(r.title)}</h3>
                ${currentUser ? `
                <button class="bookmark-btn ${bm ? 'on' : ''}" onclick="event.stopPropagation(); toggleCardBookmark('${r._id}', this, '${esc(r.title)}')">
                    <i class="${bm ? 'fas' : 'far'} fa-heart"></i>
                </button>` : ''}
            </div>
        </div>
    `}).join('');
}

function cardHtml(r, type) {
    const title = r.title || r.topic || 'Untitled';
    const id = r._id || r.id;
    return `
    <div class="roadmap-card" onclick="openViewerById('${id}', '${type}')">
        <div class="roadmap-card-top">
            <h3>${esc(title)}</h3>
        </div>
        <div class="progress-bar">
            <div class="progress-track">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <span class="progress-label">0%</span>
        </div>
    </div>
    `;
}

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

window.openViewerById = async (id, type) => {
    console.log('[Dashboard] Opening viewer for', id, type);
    try {
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
        const res = await fetch(`/api/roadmap/view/${id}`, { headers });
        const result = await res.json();
        if (result.success) {
            result.data._type = result.data._type || type;
            openViewer(result.data);
        }
    } catch (err) {
        console.error('[Dashboard] Viewer open failed', err);
    }
};

window.toggleCardBookmark = async (id, btn, title) => {
    btn.disabled = true;
    try {
        const res = await fetch(`/api/roadmap/bookmark/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
        });
        const result = await res.json();
        if (result.success) {
            const icon = btn.querySelector('i');
            const bookmarkedEl = document.getElementById('bookmarked-roadmaps');

            if (result.bookmarked) {
                icon.className = 'fas fa-heart';
                btn.classList.add('on');
                const emptyState = bookmarkedEl.querySelector('.empty-state');
                if (emptyState) bookmarkedEl.innerHTML = '';
                const card = document.createElement('div');
                card.className = 'roadmap-card';
                card.setAttribute('onclick', `openViewerById('${id}', 'bookmarked')`);
                card.innerHTML = `
                    <div class="roadmap-card-top">
                        <h3>${esc(title)}</h3>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-track">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <span class="progress-label">0%</span>
                    </div>
                `;
                bookmarkedEl.prepend(card);
            } else {
                icon.className = 'far fa-heart';
                btn.classList.remove('on');
                const bmCard = bookmarkedEl.querySelector(`.roadmap-card[onclick*="'${id}'"]`);
                if (bmCard) bmCard.remove();
                if (!bookmarkedEl.querySelector('.roadmap-card')) {
                    bookmarkedEl.innerHTML = '<p class="empty-state">No bookmarked roadmaps.</p>';
                }
            }
        }
        btn.disabled = false;
    } catch (err) {
        btn.disabled = false;
    }
};
