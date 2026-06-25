import React from 'react';
import { esc } from '../utils.js';
import '../css/dashboard.css';

export default function Dashboard({ roadmaps, user, loading, setQOpen, openViewer, doBookmark, doSave }) {
  const isBm = (id) => roadmaps.bookmarked.some(r => (r._id || r.id) === id);

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
          <p>Loading...</p>
        </div>
      )}
      {user && (
        <div className="dashboard-section" id="personal-section">
          <div className="section-header-row">
            <h2>My Roadmaps</h2>
            <button className="btn-primary" onClick={() => setQOpen(true)}><i className="fas fa-plus"></i> New Roadmap</button>
          </div>
          <div className="card-grid">
            {roadmaps.personal.length === 0
              ? <p className="empty-state">No roadmaps yet. Create your first one!</p>
              : roadmaps.personal.map(r => (
                  <div key={r._id || r.id} className="roadmap-card" onClick={() => openViewer(r._id || r.id)}>
                    <div className="roadmap-card-top">
                      <h3>{esc(r.title || r.topic)}</h3>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: '0%' }}></div>
                      </div>
                      <span className="progress-label">0%</span>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      )}

      {user && (
        <div className="dashboard-section">
          <h2>Bookmarked</h2>
          <div className="card-grid">
            {roadmaps.bookmarked.length === 0
              ? <p className="empty-state">No bookmarked roadmaps.</p>
              : roadmaps.bookmarked.map(r => (
                  <div key={r._id || r.id} className="roadmap-card" onClick={() => openViewer(r._id || r.id)}>
                    <div className="roadmap-card-top">
                      <h3>{esc(r.title)}</h3>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: '0%' }}></div>
                      </div>
                      <span className="progress-label">0%</span>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      )}

      <SectionBlock title="Role Based Roadmaps" items={roadmaps.role} openViewer={openViewer} doBookmark={doBookmark} isBm={isBm} user={user} doSave={doSave} />
      <SectionBlock title="Skill Based Roadmaps" items={roadmaps.skill} openViewer={openViewer} doBookmark={doBookmark} isBm={isBm} user={user} doSave={doSave} />

      <footer className="app-footer"><p>MapMyLearning</p></footer>
    </>
  );
}

function SectionBlock({ title, items, openViewer, doBookmark, isBm, user, doSave }) {
  return (
    <div className="dashboard-section">
      <div className="badge-header"><span>{title}</span></div>
      <div className="card-grid">
        {items.length === 0
          ? <p className="empty-state">No roadmaps yet.</p>
          : items.map(r => (
              <div key={r._id} className="roadmap-card" onClick={() => openViewer(r._id)}>
                <div className="roadmap-card-top">
                  <h3>{esc(r.title)}</h3>
                  <div className="card-actions">
                    {user && (
                      <button className="bookmark-btn" onClick={(e) => { e.stopPropagation(); doBookmark(r._id); }}>
                        <i className={isBm(r._id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                      </button>
                    )}
                  </div>
                </div>
                <div className="roadmap-card-meta">{esc(r.topic)}</div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
