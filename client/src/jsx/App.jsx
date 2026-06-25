import React, { useState, useEffect, useCallback } from 'react';
import { esc } from '../utils.js';
import '../css/app.css';
import Dashboard from './Dashboard.jsx';
import Viewer from './Viewer.jsx';
import Questionnaire from './Questionnaire.jsx';

const API = '';

export default function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [roadmaps, setRoadmaps] = useState({ personal: [], bookmarked: [], role: [], skill: [] });
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qOpen, setQOpen] = useState(false);

  /* ───── API helper ───── */

  const fetchApi = useCallback(async (path, opts = {}) => {
    const headers = { 'Content-Type': 'application/json', ...opts.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API}${path}`, { ...opts, headers });
    return res.json();
  }, [token]);

  /* ───── Auth ───── */

  const doLogin = async (email, password) => {
    setLoading(true);
    try {
      const r = await fetchApi('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      if (r.success) {
        localStorage.setItem('authToken', r.token);
        setToken(r.token);
        await loadUser(r.token);
      } else { alert(r.error); }
    } finally { setLoading(false); }
  };

  const doRegister = async (name, email, password) => {
    setLoading(true);
    try {
      const r = await fetchApi('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
      if (r.success) {
        localStorage.setItem('authToken', r.token);
        setToken(r.token);
        await loadUser(r.token);
      } else { alert(r.error); }
    } finally { setLoading(false); }
  };

  const doLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setView('login');
  };

  const loadUser = async (t) => {
    const headers = { 'Authorization': `Bearer ${t || token}` };
    const r = await fetch(`${API}/api/auth/me`, { headers });
    const d = await r.json();
    if (d.success) {
      setUser(d.data);
      setView('dashboard');
    } else {
      localStorage.removeItem('authToken');
      setToken(null);
    }
  };

  /* ───── Roadmaps ───── */

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [personalRes, bookmarkedRes, publicRes] = await Promise.all([
        token ? fetchApi('/api/roadmap/my') : Promise.resolve({ data: [] }),
        token ? fetchApi('/api/roadmap/bookmarked') : Promise.resolve({ data: [] }),
        fetchApi('/api/roadmap/public')
      ]);
      setRoadmaps({
        personal: personalRes.data || [],
        bookmarked: bookmarkedRes.data || [],
        role: publicRes.data?.role || [],
        skill: publicRes.data?.skill || []
      });
    } finally { setLoading(false); }
  }, [token, fetchApi]);

  useEffect(() => {
    if (view === 'dashboard') loadDashboard();
  }, [view, loadDashboard]);

  useEffect(() => {
    if (token) loadUser();
  }, []);

  /* ───── Generate ───── */

  const doGenerate = async (topic, goal, visibility, category) => {
    setLoading(true);
    try {
      const r = await fetchApi('/api/roadmap/generate', {
        method: 'POST',
        body: JSON.stringify({ topic, goal, visibility, category })
      });
      if (r.success) {
        setQOpen(false);
        setCurrentRoadmap(r.data);
        setView('viewer');
      } else { alert(r.error); }
    } finally { setLoading(false); }
  };

  /* ───── View / Save / Bookmark ───── */

  const openViewer = async (id) => {
    setLoading(true);
    try {
      const r = await fetchApi(`/api/roadmap/view/${id}`);
      if (r.success) { setCurrentRoadmap(r.data); setView('viewer'); }
    } finally { setLoading(false); }
  };

  const doSave = async (id) => {
    const r = await fetchApi(`/api/roadmap/save/${id}`, { method: 'POST' });
    if (r.success) { alert('Saved to your roadmaps!'); loadDashboard(); }
    else alert(r.error);
  };

  const doBookmark = async (id) => {
    const r = await fetchApi(`/api/roadmap/bookmark/${id}`, { method: 'POST' });
    if (r.success) loadDashboard();
  };

  /* ───── Render ───── */

  return (
    <div className="app">
      <Navbar user={user} view={view} setView={setView} doLogout={doLogout} setQOpen={setQOpen} />

      <main className="app-shell">
        {!token && view === 'login' && <LoginForm doLogin={doLogin} setView={setView} loading={loading} />}
        {!token && view === 'register' && <RegisterForm doRegister={doRegister} setView={setView} loading={loading} />}
        {view === 'dashboard' && (
          <Dashboard
            roadmaps={roadmaps}
            user={user}
            loading={loading}
            setQOpen={setQOpen}
            openViewer={openViewer}
            doBookmark={doBookmark}
            doSave={doSave}
          />
        )}
        {view === 'viewer' && currentRoadmap && (
          <Viewer roadmap={currentRoadmap} setView={setView} user={user} doSave={doSave} />
        )}
      </main>

      {qOpen && <Questionnaire doGenerate={doGenerate} onClose={() => setQOpen(false)} loading={loading} />}
    </div>
  );
}

/* ─────────── NAVBAR ─────────── */

function Navbar({ user, view, setView, doLogout, setQOpen }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); setView('dashboard'); }}>
          <i className="fas fa-bolt"></i> MapMyLearning
        </a>
        <div className="nav-links">
          {user ? (
            <div className="user-menu" onClick={() => setShowMenu(!showMenu)}>
              <div className="user-badge">
                <i className="fas fa-user-circle"></i>
                <span>{user.name}</span>
                <i className="fas fa-chevron-down"></i>
              </div>
              {showMenu && (
                <div className="dropdown active" onClick={e => e.stopPropagation()}>
                  <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); setView('dashboard'); setShowMenu(false); }}>
                    <i className="fas fa-home"></i> Home
                  </a>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); setQOpen(true); setShowMenu(false); }}>
                    <i className="fas fa-plus"></i> New Roadmap
                  </a>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="dropdown-item" style={{ color: 'var(--danger)' }} onClick={(e) => { e.preventDefault(); doLogout(); setShowMenu(false); }}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </a>
                </div>
              )}
            </div>
          ) : view !== 'login' ? (
            <button className="btn-secondary" onClick={() => setView('login')}>Login</button>
          ) : null}
          {!user && view !== 'register' && (
            <button className="btn-primary" onClick={() => setView('register')}>Get Started</button>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ─────────── AUTH ─────────── */

function LoginForm({ doLogin, setView, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e) => { e.preventDefault(); doLogin(email, password); };

  return (
    <div className="auth-card">
      <h2>Welcome back</h2>
      <p>Login to your account to continue</p>
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
      </form>
      <div className="auth-footer">
        Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setView('register'); }}>Register</a>
      </div>
    </div>
  );
}

function RegisterForm({ doRegister, setView, loading }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e) => { e.preventDefault(); doRegister(name, email, password); };

  return (
    <div className="auth-card">
      <h2>Create an account</h2>
      <p>Start your learning journey today</p>
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" required placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required minLength={6} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Loading...' : 'Register'}</button>
      </form>
      <div className="auth-footer">
        Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }}>Login</a>
      </div>
    </div>
  );
}
