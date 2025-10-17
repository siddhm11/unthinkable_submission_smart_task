import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { sortTasksByDependencies } from '../../utils/helpers';
import { List, Network } from 'lucide-react';

const TaskList = ({ tasks, goalId, onTaskUpdate }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'dependency'

  const sortedTasks = sortTasksByDependencies(tasks);

  const groupTasksByStatus = (tasks) => {
    return {
      pending: tasks.filter(task => task.status === 'pending'),
      in_progress: tasks.filter(task => task.status === 'in_progress'),
      completed: tasks.filter(task => task.status === 'completed'),
    };
  };

  const groupedTasks = groupTasksByStatus(sortedTasks);

  if (!tasks || tasks.length === 0) {
    return (
      <div className="empty-tasks">
        <p>No tasks found for this goal.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <div className="task-list-header">
        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
            By Status
          </button>
          <button
            className={`view-btn ${viewMode === 'dependency' ? 'active' : ''}`}
            onClick={() => setViewMode('dependency')}
          >
            <Network size={16} />
            By Dependencies
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="tasks-by-status">
          {/* Pending Tasks */}
          {groupedTasks.pending.length > 0 && (
            <div className="task-group">
              <div className="task-group-header">
                <h3>Pending ({groupedTasks.pending.length})</h3>
                <div className="status-indicator pending"></div>
              </div>
              <div className="task-group-content">
                {groupedTasks.pending.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    allTasks={tasks}
                    onUpdate={onTaskUpdate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* In Progress Tasks */}
          {groupedTasks.in_progress.length > 0 && (
            <div className="task-group">
              <div className="task-group-header">
                <h3>In Progress ({groupedTasks.in_progress.length})</h3>
                <div className="status-indicator in-progress"></div>
              </div>
              <div className="task-group-content">
                {groupedTasks.in_progress.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    allTasks={tasks}
                    onUpdate={onTaskUpdate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {groupedTasks.completed.length > 0 && (
            <div className="task-group">
              <div className="task-group-header">
                <h3>Completed ({groupedTasks.completed.length})</h3>
                <div className="status-indicator completed"></div>
              </div>
              <div className="task-group-content">
                {groupedTasks.completed.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    allTasks={tasks}
                    onUpdate={onTaskUpdate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="tasks-by-dependency">
          <div className="dependency-note">
            <p>Tasks are ordered by dependencies - complete tasks from top to bottom for optimal workflow.</p>
          </div>
          <div className="task-group-content">
            {sortedTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                allTasks={tasks}
                onUpdate={onTaskUpdate}
                showDependencies={true}
                orderNumber={index + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;