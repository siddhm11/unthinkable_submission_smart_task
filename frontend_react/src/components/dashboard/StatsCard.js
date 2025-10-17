import React from 'react';

const StatsCard = ({ title, value, subtitle, icon, color = '#3b82f6' }) => {
  return (
    <div className="stats-card">
      <div className="stats-icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="stats-content">
        <h3 className="stats-title">{title}</h3>
        <div className="stats-value">{value}</div>
        {subtitle && <p className="stats-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatsCard;