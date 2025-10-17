import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { goalService } from '../../services/api';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Target, 
  MoreVertical, 
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import { formatDate, calculateGoalProgress, truncateText } from '../../utils/helpers';
import toast from 'react-hot-toast';

const GoalCard = ({ goal, onDeleted }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const progress = calculateGoalProgress(goal.tasks || []);
  const taskCount = goal.task_count || 0;
  const completedTasks = goal.completed_tasks || 0;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await goalService.deleteGoal(goal.id);
      toast.success('Goal deleted successfully');
      onDeleted();
    } catch (error) {
      toast.error('Failed to delete goal');
      console.error('Error deleting goal:', error);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

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
    <div className="goal-card">
      <div className="goal-card-header">
        <div className="goal-status" style={{ backgroundColor: getStatusColor(goal.status) }}>
          {getStatusText(goal.status)}
        </div>
        <div className="goal-menu">
          <button 
            className="menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={18} />
          </button>
          {showMenu && (
            <div className="goal-menu-dropdown">
              <Link 
                to={`/goals/${goal.id}`}
                className="menu-item"
                onClick={() => setShowMenu(false)}
              >
                <Eye size={16} />
                View Details
              </Link>
              <button 
                className="menu-item delete"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 size={16} />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="goal-content">
        <h3 className="goal-title">
          {truncateText(goal.text, 80)}
        </h3>

        <div className="goal-meta">
          <div className="meta-item">
            <Calendar size={16} />
            <span>{formatDate(goal.created_at)}</span>
          </div>

          <div className="meta-item">
            <Target size={16} />
            <span>{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {taskCount > 0 && (
          <div className="goal-progress">
            <div className="progress-header">
              <span className="progress-text">
                {completedTasks} of {taskCount} completed
              </span>
              <span className="progress-percentage">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="goal-actions">
        <Link 
          to={`/goals/${goal.id}`}
          className="view-btn"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default GoalCard;