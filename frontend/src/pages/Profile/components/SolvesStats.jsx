import React from 'react';
import './SolvesStats.css';

const SolvesStats = ({ codingSummary }) => {
  const {
    successRate,
    solvedCount,
    submissionsCount,
    easySolved,
    mediumSolved,
    hardSolved,
  } = codingSummary;

  return (
    <div className="coding-statistics-card">
      <h3>Solves Statistics Dashboard</h3>
      <div className="stats-dashboard-grid">
        <div className="stat-card">
          <span>Success Rate</span>
          <strong>{successRate}%</strong>
        </div>
        <div className="stat-card">
          <span>Solved Count</span>
          <strong>{solvedCount} problems</strong>
        </div>
        <div className="stat-card">
          <span>Submissions</span>
          <strong>{submissionsCount} submissions</strong>
        </div>
      </div>

      <div className="stats-breakdown-row">
        <div className="diff-stat-item">
          <span className="lbl-easy">🟢 Easy:</span>
          <strong>{easySolved} solves</strong>
        </div>
        <div className="diff-stat-item">
          <span className="lbl-medium">🟡 Medium:</span>
          <strong>{mediumSolved} solves</strong>
        </div>
        <div className="diff-stat-item">
          <span className="lbl-hard">🔴 Hard:</span>
          <strong>{hardSolved} solves</strong>
        </div>
      </div>
    </div>
  );
};

export default SolvesStats;
