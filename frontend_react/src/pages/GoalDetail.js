import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { goalService } from '../services/api';
import TaskList from '../components/tasks/TaskList';
import GoalHeader from '../components/goals/GoalHeader';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const GoalDetail = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    fetchGoal();
  }, [goalId]);

  const fetchGoal = async () => {
    try {
      setIsLoading(true);
      const response = await goalService.getGoal(goalId);
      setGoal(response.data);
    } catch (error) {
      toast.error('Failed to fetch goal details');
      console.error('Error fetching goal:', error);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateTasks = async () => {
    try {
      setIsRegenerating(true);
      await goalService.regenerateTasks(goalId);
      toast.success('Tasks are being regenerated...');

      // Refresh goal after a short delay to show updated tasks
      setTimeout(() => {
        fetchGoal();
      }, 2000);
    } catch (error) {
      toast.error('Failed to regenerate tasks');
      console.error('Error regenerating tasks:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleTaskUpdate = () => {
    // Refresh goal to get updated task statuses
    fetchGoal();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading goal details...</p>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="error-container">
        <h2>Goal not found</h2>
        <button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="goal-detail">
      <div className="goal-detail-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="header-actions">
          <button 
            className="regenerate-btn"
            onClick={handleRegenerateTasks}
            disabled={isRegenerating}
          >
            <RotateCcw size={16} className={isRegenerating ? 'spinning' : ''} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate Tasks'}
          </button>
        </div>
      </div>

      <GoalHeader goal={goal} />

      <div className="goal-content">
        <div className="tasks-section">
          <div className="section-header">
            <h2>Tasks</h2>
            <p>
              {goal.tasks?.length || 0} task{(goal.tasks?.length || 0) !== 1 ? 's' : ''} total
            </p>
          </div>

          {goal.tasks && goal.tasks.length > 0 ? (
            <TaskList 
              tasks={goal.tasks} 
              goalId={goalId}
              onTaskUpdate={handleTaskUpdate}
            />
          ) : (
            <div className="empty-tasks">
              <div className="empty-tasks-content">
                <p>No tasks generated yet</p>
                <button 
                  className="regenerate-btn"
                  onClick={handleRegenerateTasks}
                  disabled={isRegenerating}
                >
                  <RotateCcw size={16} className={isRegenerating ? 'spinning' : ''} />
                  Generate Tasks with AI
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalDetail;