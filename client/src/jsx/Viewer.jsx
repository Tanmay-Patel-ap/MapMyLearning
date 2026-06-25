import React from 'react';
import { esc } from '../utils.js';
import '../css/viewer.css';

export default function Viewer({ roadmap, setView, user, doSave }) {
  const steps = roadmap.steps || [];
  const isPublic = roadmap._type === 'public';

  return (
    <div className="viewer">
      <button className="btn-secondary back-btn" onClick={() => setView('dashboard')}>
        <i className="fas fa-arrow-left"></i> Back
      </button>

      <div className="viewer-header">
        <h2>{esc(roadmap.title)}</h2>
        {roadmap.description && <p className="viewer-description">{esc(roadmap.description)}</p>}
        {roadmap.topic && <span className="viewer-meta">{esc(roadmap.topic)}</span>}
      </div>

      {isPublic && user && (
        <div className="viewer-actions">
          <button className="btn-primary" onClick={() => doSave(roadmap._id)}>
            <i className="fas fa-save"></i> Save to My Roadmaps
          </button>
        </div>
      )}

      {roadmap.user && (
        <p className="viewer-meta">Created by {esc(roadmap.user.name || 'Unknown')}</p>
      )}

      <div className="steps">
        {steps.map((step, i) => (
          <div key={step.stepId || i} className="step">
            <div className="step-number">{i + 1}</div>
            <div className="step-content">
              <h3>{esc(step.title)}</h3>
              {step.description && <p>{esc(step.description)}</p>}
              {step.resources && step.resources.length > 0 && (
                <ul className="resources">
                  {step.resources.map((r, j) => (
                    <li key={j}><a href={r.url} target="_blank" rel="noopener" className="resource-link">{esc(r.title || r)}</a></li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
