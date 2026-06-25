import React, { useState } from 'react';
import '../css/questionnaire.css';

export default function Questionnaire({ doGenerate, onClose, loading }) {
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('role');
  const [goal, setGoal] = useState('');
  const [visibility, setVisibility] = useState('private');

  const canNext = step === 1 ? topic.trim() : step === 2 ? goal : true;

  const handleGenerate = () => {
    if (!topic || !goal) return;
    doGenerate(topic, goal, visibility, category);
  };

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create a Learning Roadmap</h2>
          <button className="btn-icon" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>

        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>2</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div>
              <p className="question-label">What do you want to learn?</p>
              <input type="text" placeholder="e.g. Python, JavaScript, Machine Learning..." value={topic} onChange={e => setTopic(e.target.value)} />
              <div className="category-toggle">
                <span className="category-toggle-label">This is a:</span>
                <div className="category-options">
                  <label className={`category-option ${category === 'role' ? 'active' : ''}`} onClick={() => setCategory('role')}>
                    <i className="fas fa-briefcase"></i> Role Based
                  </label>
                  <label className={`category-option ${category === 'skill' ? 'active' : ''}`} onClick={() => setCategory('skill')}>
                    <i className="fas fa-code"></i> Skill Based
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="question-label">What is your primary goal?</p>
              <div className="goal-options">
                {[
                  { value: 'web-development', icon: 'fa-globe', title: 'Web Development', desc: 'Build websites & web apps' },
                  { value: 'data-science-ai', icon: 'fa-brain', title: 'Data Science & AI', desc: 'Analyze data, build models' },
                  { value: 'automation-scripting', icon: 'fa-robot', title: 'Automation & Scripting', desc: 'Automate tasks & workflows' },
                  { value: 'software-engineering', icon: 'fa-code', title: 'Software Engineering', desc: 'Build desktop & backend apps' },
                  { value: 'game-development', icon: 'fa-gamepad', title: 'Game Development', desc: 'Create games & interactive experiences' },
                ].map(g => (
                  <label key={g.value} className={`goal-card ${goal === g.value ? 'selected' : ''}`} onClick={() => setGoal(g.value)}>
                    <i className={`fas ${g.icon}`}></i>
                    <div>
                      <span className="goal-title">{g.title}</span>
                      <span className="goal-desc">{g.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="question-label">Visibility</p>
              <div className="visibility-options">
                {['private', 'public'].map(v => (
                  <label key={v} className={`visibility-card ${visibility === v ? 'active' : ''}`} onClick={() => setVisibility(v)}>
                    <i className={`fas ${v === 'private' ? 'fa-lock' : 'fa-globe-asia'}`}></i>
                    <div>
                      <span className="visibility-title">{v === 'private' ? 'Private' : 'Public'}</span>
                      <span className="visibility-desc">{v === 'private' ? 'Only you can see this roadmap' : 'Share with the community'}</span>
                    </div>
                    <i className={`fas fa-check-circle check-icon`}></i>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" disabled={step === 1} onClick={() => setStep(step - 1)}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
          {step < 3 ? (
            <button className="btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
              Next <i className="fas fa-arrow-right"></i>
            </button>
          ) : (
            <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Generating...</> : <><i className="fas fa-magic"></i> Generate</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
