import React from 'react';
import { Calendar, Target, CheckCircle, Clock } from 'lucide-react';
import { formatDate, calculateGoalProgress } from '../../utils/helpers';

const GoalHeader = ({ goal }) => {
  const progress = calculateGoalProgress(goal.tasks || []);
  const taskCount = goal.tasks?.length || 0;
  const completedTasks = goal.tasks?.filter(task => task.status === 'completed').length || 0;
  const inProgressTasks = goal.tasks?.filter(task => task.status === 'in_progress').length || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'active':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'active':
        return 'Active';
      default:
        return 'Draft';
    }
  };

  return (
    <div className="goal-header">
      <div className="goal-main-info">
        <div className="goal-status-badge" style={{ backgroundColor: getStatusColor(goal.status) }}>
          {getStatusText(goal.status)}
        </div>

        <h1 className="goal-title">{goal.text}</h1>

        <div className="goal-meta-info">
          <div className="meta-item">
            <Calendar size={16} />
            <span>Created {formatDate(goal.created_at)}</span>
          </div>

          <div className="meta-item">
            <Target size={16} />
            <span>{taskCount} task{taskCount !== 1 ? 's' : ''} total</span>
          </div>
        </div>
      </div>

      {taskCount > 0 && (
        <div className="goal-stats">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon completed">
                <CheckCircle size={16} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{completedTasks}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon in-progress">
                <Clock size={16} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{inProgressTasks}</span>
                <span className="stat-label">In Progress</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon pending">
                <Target size={16} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{taskCount - completedTasks - inProgressTasks}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-text">Overall Progress</span>
              <span className="progress-percentage">{progress}%</span>
            </div>
            <div className="progress-bar-large">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalHeader;