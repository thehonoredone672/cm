import React from 'react';
import './ProfileHeader.css';

const ProfileHeader = ({ profile, onEdit, onShare }) => {
  const {
    name,
    profession,
    email,
    bio,
    college,
    department,
    academicYear,
    createdAt,
    githubUrl,
    linkedinUrl,
  } = profile;

  const memberSince = createdAt 
    ? new Date(createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : 'N/A';

  return (
    <div className="profile-hero-section">
      <div className="profile-hero-banner" />
      <div className="profile-hero-content">
        <div className="profile-hero-main">
          <div className="profile-avatar-large">
            {name ? name.slice(0, 2).toUpperCase() : 'CM'}
          </div>
          <div className="profile-info-block">
            <div className="profile-name-row">
              <h2>{name}</h2>
              <span className="profile-role-badge">{profession || 'Developer'}</span>
            </div>
            <span className="profile-email-lbl">{email}</span>
            <p className="profile-bio-text">{bio || 'Write a brief description in your biography settings.'}</p>
            
            <div className="profile-meta-row">
              {college && (
                <span className="meta-item">🏫 {college} {department ? `(${department})` : ''} {academicYear ? `— Year ${academicYear}` : ''}</span>
              )}
              {createdAt && (
                <span className="meta-item">📅 Member since {memberSince}</span>
              )}
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noreferrer" className="meta-item github-link">🐈 GitHub</a>
              )}
              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noreferrer" className="meta-item linkedin-link">💼 LinkedIn</a>
              )}
            </div>
          </div>
        </div>

        <div className="profile-hero-actions">
          <button className="btn-primary" onClick={onEdit}>Edit Profile</button>
          <button className="btn-secondary" onClick={onShare}>Share Profile</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
