// State Management
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Selectors
const navLinks = document.getElementById('nav-links');
const statusMsg = document.getElementById('status-message');
const roadmapResult = document.getElementById('roadmap-result');
const roadmapForm = document.getElementById('roadmap-form');
const submitBtn = document.getElementById('submit-button');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (authToken) {
    fetchUserProfile();
  } else {
    updateNav();
  }
});

// Navigation Handling
function updateNav() {
  if (currentUser) {
    navLinks.innerHTML = `
      <div class="user-menu" id="user-menu-trigger">
        <div class="user-badge">
          <i class="fas fa-user-circle"></i>
          <span>${currentUser.name}</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="dropdown" id="user-dropdown">
          <a href="#" class="dropdown-item" onclick="showSection('profile')">
            <i class="fas fa-user"></i> My Profile
          </a>
          <a href="#" class="dropdown-item" onclick="showSection('dashboard')">
            <i class="fas fa-columns"></i> Dashboard
          </a>
          <a href="#" class="dropdown-item" onclick="showSection('settings')">
            <i class="fas fa-cog"></i> Settings
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item" onclick="showSection('main')">
            <i class="fas fa-plus"></i> New Roadmap
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item" style="color: var(--danger)" onclick="logout()">
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
    navLinks.innerHTML = `
      <button class="btn-secondary" onclick="showSection('login')">Login</button>
      <button class="btn-primary" onclick="showSection('register')">Get Started</button>
    `;
  }
}

function showSection(sectionId) {
  // Hide all main sections
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

  // Show target section
  if (sectionId === 'main') {
    document.getElementById('main-content').classList.remove('hidden');
  } else {
    const target = document.getElementById(`${sectionId}-section`);
    if (target) target.classList.remove('hidden');
  }
}

// Auth Handlers
async function fetchUserProfile() {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.data;
      updateNav();
    } else {
      logout();
    }
  } catch (err) {
    console.error('Profile fetch failed', err);
    logout();
  }
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        await fetchUserProfile();
        showSection('main');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Login failed');
    }
  };
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.success) {
        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        await fetchUserProfile();
        showSection('main');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Registration failed');
    }
  };
}

function logout() {
  currentUser = null;
  authToken = null;
  localStorage.removeItem('authToken');
  updateNav();
  showSection('main');
}

// Roadmap Generation Logic
if (roadmapForm) {
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

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? 'Generating...' : 'Generate';
  if (isLoading) {
    statusMsg.textContent = 'This may take up to 30 seconds...';
    statusMsg.classList.remove('error');
  }
}

function renderRoadmap(data) {
  console.log('[UI] Rendering roadmap steps');
  const { title, steps } = data;

  const stepsHtml = steps
    .map(
      (step, index) => `
      <div class="step">
        <div class="step-number">${index + 1}</div>
        <div class="step-content">
          <h3>${step.title}</h3>
          <p>${step.description}</p>
          <ul class="resources">
            ${step.resources
              .map(
                (res) => `
              <li>
                <a href="https://www.google.com/search?q=${encodeURIComponent(res)}" 
                   target="_blank" 
                   class="resource-link">
                   <i class="fas fa-external-link-alt"></i> ${res}
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
    <h2 class="roadmap-title">${title}</h2>
    <div class="steps">${stepsHtml}</div>
  `;
}
