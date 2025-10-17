import React, { useState, useEffect } from 'react';
import { goalService } from '../services/api';
import GoalCard from '../components/goals/GoalCard';
import CreateGoalModal from '../components/goals/CreateGoalModal';
import StatsCard from '../components/dashboard/StatsCard';
import { Plus, Target, Clock, CheckCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    totalTasks: 0,
    completedTasks: 0,
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const response = await goalService.getGoals();
      setGoals(response.data);
      calculateStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch goals');
      console.error('Error fetching goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (goalsData) => {
    const totalGoals = goalsData.length;
    const activeGoals = goalsData.filter(goal => goal.status === 'active').length;
    const completedGoals = goalsData.filter(goal => goal.status === 'completed').length;
    const totalTasks = goalsData.reduce((sum, goal) => sum + (goal.task_count || 0), 0);
    const completedTasks = goalsData.reduce((sum, goal) => sum + (goal.completed_tasks || 0), 0);

    setStats({
      totalGoals,
      activeGoals,
      completedGoals,
      totalTasks,
      completedTasks,
    });
  };

  const handleGoalCreated = () => {
    fetchGoals(); // Refresh the goals list
    setShowCreateModal(false);
  };

  const handleGoalDeleted = () => {
    fetchGoals(); // Refresh the goals list
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your goals...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p>Manage your AI-powered project plans</p>
        </div>
        <div className="header-actions">
          <button 
            className="create-goal-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            New Goal
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <StatsCard
          title="Total Goals"
          value={stats.totalGoals}
          icon={<Target />}
          color="#3b82f6"
        />
        <StatsCard
          title="Active Goals"
          value={stats.activeGoals}
          icon={<Clock />}
          color="#f59e0b"
        />
        <StatsCard
          title="Completed Goals"
          value={stats.completedGoals}
          icon={<CheckCircle />}
          color="#10b981"
        />
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          subtitle={`${stats.completedTasks} completed`}
          icon={<Zap />}
          color="#8b5cf6"
        />
      </div>

      {/* Goals Section */}
      <div className="goals-section">
        <div className="section-header">
          <h2>Your Goals</h2>
          {goals.length > 0 && (
            <p>{goals.length} goal{goals.length !== 1 ? 's' : ''} total</p>
          )}
        </div>

        {goals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <Target className="empty-icon" />
              <h3>No goals yet</h3>
              <p>Create your first goal and let AI break it down into actionable tasks</p>
              <button 
                className="create-goal-btn"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={20} />
                Create Your First Goal
              </button>
            </div>
          </div>
        ) : (
          <div className="goals-grid">
            {goals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onDeleted={handleGoalDeleted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <CreateGoalModal
          onClose={() => setShowCreateModal(false)}
          onGoalCreated={handleGoalCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;