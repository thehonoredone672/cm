import React from 'react';
import './StatsGrid.css';

const StatCard = ({ icon, label, value }) => (
  <div className="stat-card">
    <span className="stat-icon">{icon}</span>
    <div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
    </div>
  </div>
);

const StatsGrid = ({ stats }) => {
  const {
    solvedCount,
    matchesCount,
    teamsJoinedCount,
    projectsCount,
  } = stats;

  return (
    <div className="profile-stats-grid">
      <StatCard icon="⚔️" label="Solved" value={solvedCount} />
      <StatCard icon="🤝" label="Matches" value={matchesCount} />
      <StatCard icon="👥" label="Teams" value={teamsJoinedCount} />
      <StatCard icon="📂" label="Projects" value={projectsCount} />
    </div>
  );
};

export default StatsGrid;
