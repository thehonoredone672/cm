import React from 'react';
import './QuickInfo.css';

const QuickInfo = ({ stats, codingSummary }) => {
  return (
    <>
      <div className="quick-info-card">
        <h3>Match Summary</h3>
        <div className="metrics-list">
          <div className="metric-row">
            <span>Total Matches:</span>
            <strong>{stats?.matchesCount || 0} peers</strong>
          </div>
          <div className="metric-row">
            <span>Streaks Solved:</span>
            <strong>{codingSummary?.streak || 0} days</strong>
          </div>
        </div>
      </div>
      <div className="quick-info-card">
        <h3>Team Directory</h3>
        <div className="metrics-list">
          <div className="metric-row">
            <span>Joined Teams:</span>
            <strong>{stats?.teamsJoinedCount || 0}</strong>
          </div>
          <div className="metric-row">
            <span>Pending Invites:</span>
            <strong>{stats?.pendingInvites || 0}</strong>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickInfo;
