import React, { useState } from 'react';
import { taskService } from '../../services/api';
import { 
  CheckCircle, 
  Clock, 
  Circle, 
  Calendar, 
  ArrowRight,
  MoreVertical,
  Edit2,
  Trash2
} from 'lucide-react';
import { getTaskStatusColor, getTaskStatusText } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TaskCard = ({ task, allTasks, onUpdate, showDependencies = false, orderNumber }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(task.name);

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      await taskService.updateTask(task.id, { status: newStatus });
      toast.success('Task status updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update task status');
      console.error('Error updating task:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNameUpdate = async () => {
    if (editedName.trim() === task.name) {
      setIsEditing(false);
      return;
    }

    try {
      setIsUpdating(true);
      await taskService.updateTask(task.id, { name: editedName.trim() });
      toast.success('Task name updated');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update task name');
      console.error('Error updating task:', error);
      setEditedName(task.name); // Reset to original name
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNameUpdate();
    } else if (e.key === 'Escape') {
      setEditedName(task.name);
      setIsEditing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="status-icon completed" />;
      case 'in_progress':
        return <Clock className="status-icon in-progress" />;
      default:
        return <Circle className="status-icon pending" />;
    }
  };

  const getDependentTasks = () => {
    if (!task.dependencies || !allTasks) return [];

    return task.dependencies.map(dep => {
      return allTasks.find(t => t.id === dep.depends_on_task_id);
    }).filter(Boolean);
  };

  const dependentTasks = getDependentTasks();

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return [
          { value: 'in_progress', label: 'Start Task', icon: <Clock size={14} /> },
          { value: 'completed', label: 'Mark Complete', icon: <CheckCircle size={14} /> }
        ];
      case 'in_progress':
        return [
          { value: 'completed', label: 'Mark Complete', icon: <CheckCircle size={14} /> },
          { value: 'pending', label: 'Move to Pending', icon: <Circle size={14} /> }
        ];
      case 'completed':
        return [
          { value: 'in_progress', label: 'Reopen', icon: <Clock size={14} /> },
          { value: 'pending', label: 'Move to Pending', icon: <Circle size={14} /> }
        ];
      default:
        return [];
    }
  };

  const statusOptions = getNextStatusOptions(task.status);

  return (
    <div className={`task-card ${task.status}`}>
      {showDependencies && orderNumber && (
        <div className="task-order">
          {orderNumber}
        </div>
      )}

      <div className="task-header">
        <div className="task-status-section">
          {getStatusIcon(task.status)}
          <div className="task-main-content">
            {isEditing ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleNameUpdate}
                onKeyPress={handleKeyPress}
                className="task-name-input"
                autoFocus
                disabled={isUpdating}
              />
            ) : (
              <h4 className="task-name">{task.name}</h4>
            )}

            {task.description && (
              <p className="task-description">{task.description}</p>
            )}
          </div>
        </div>

        <div className="task-actions">
          <div className="task-menu">
            <button 
              className="menu-btn"
              onClick={() => setShowMenu(!showMenu)}
              disabled={isUpdating}
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <div className="task-menu-dropdown">
                <button 
                  className="menu-item"
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  disabled={isUpdating}
                >
                  <Edit2 size={14} />
                  Edit Name
                </button>

                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    className="menu-item"
                    onClick={() => {
                      handleStatusChange(option.value);
                      setShowMenu(false);
                    }}
                    disabled={isUpdating}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="task-meta">
        <div className="task-info">
          <div className="info-item">
            <Calendar size={14} />
            <span>{task.duration_days} day{task.duration_days !== 1 ? 's' : ''}</span>
          </div>

          <div className="status-badge" style={{ backgroundColor: getTaskStatusColor(task.status) }}>
            {getTaskStatusText(task.status)}
          </div>
        </div>

        {showDependencies && dependentTasks.length > 0 && (
          <div className="task-dependencies">
            <div className="dependencies-header">
              <span>Depends on:</span>
            </div>
            <div className="dependencies-list">
              {dependentTasks.map((depTask, index) => (
                <div key={depTask.id} className="dependency-item">
                  <span className="dependency-name">{depTask.name}</span>
                  <span className={`dependency-status ${depTask.status}`}>
                    {getStatusIcon(depTask.status)}
                  </span>
                  {index < dependentTasks.length - 1 && (
                    <ArrowRight size={12} className="dependency-arrow" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUpdating && (
        <div className="task-updating">
          <div className="updating-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;