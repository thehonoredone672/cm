import React from 'react';
import './ProfileCompletion.css';

const ChecklistItem = ({ checked, children }) => (
  <div className="checklist-item">
    <span className={`checklist-icon ${checked ? 'checked' : ''}`}>
      {checked ? '✓' : '○'}
    </span>
    <span>{children}</span>
  </div>
);

const ProfileCompletion = ({ completionPercentage, missingItems }) => {
  return (
    <div className="completion-card">
      <div className="completion-card-header">
        <h3>Profile Completion</h3>
        <span className="completion-pct-badge">{completionPercentage}%</span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${completionPercentage}%` }} />
      </div>
      <div className="completion-checklist">
        <ChecklistItem checked={!missingItems.includes("Bio")}>Bio Statement</ChecklistItem>
        <ChecklistItem checked={!missingItems.includes("Skills Tags")}>Skills Tags</ChecklistItem>
        <ChecklistItem checked={!missingItems.includes("Interests")}>Interests Tags</ChecklistItem>
        <ChecklistItem checked={!missingItems.includes("GitHub Link")}>GitHub Link</ChecklistItem>
        <ChecklistItem checked={!missingItems.includes("Projects")}>Projects</ChecklistItem>
      </div>
    </div>
  );
};

export default ProfileCompletion;
