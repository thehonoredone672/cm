import React from 'react';
import './SocialLinks.css';

const SocialLinks = ({ githubUrl, linkedinUrl }) => {
  return (
    <div className="social-links-card">
      <h3>Social Links</h3>
      <div className="social-links-list">
        {githubUrl ? (
          <a href={githubUrl} target="_blank" rel="noreferrer" className="social-link-item">
            <span>🐈 GitHub Profile</span>
            <span className="arrow">➔</span>
          </a>
        ) : (
          <span className="social-link-item inactive">🐈 GitHub: not configured</span>
        )}
        {linkedinUrl ? (
          <a href={linkedinUrl} target="_blank" rel="noreferrer" className="social-link-item">
            <span>💼 LinkedIn Profile</span>
            <span className="arrow">➔</span>
          </a>
        ) : (
          <span className="social-link-item inactive">💼 LinkedIn: not configured</span>
        )}
      </div>
    </div>
  );
};

export default SocialLinks;
