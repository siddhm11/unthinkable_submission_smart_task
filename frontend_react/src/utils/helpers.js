import { format, parseISO } from 'date-fns';

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch (error) {
    return dateString;
  }
};

// Format date with time
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
  } catch (error) {
    return dateString;
  }
};

// Get task status color
export const getTaskStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return '#10b981'; // green
    case 'in_progress':
      return '#f59e0b'; // amber
    case 'pending':
      return '#6b7280'; // gray
    default:
      return '#6b7280'; // gray
  }
};

// Get task status display text
export const getTaskStatusText = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In Progress';
    case 'pending':
      return 'Pending';
    default:
      return 'Pending';
  }
};

// Calculate goal progress
export const calculateGoalProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  return Math.round((completedTasks / tasks.length) * 100);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sort tasks by dependencies (topological sort)
export const sortTasksByDependencies = (tasks) => {
  if (!tasks || tasks.length === 0) return [];

  // Create a map of task names to tasks for quick lookup
  const taskMap = {};
  tasks.forEach(task => {
    taskMap[task.name] = task;
  });

  // Simple sorting: tasks with no dependencies first, then others
  const sorted = [];
  const visited = new Set();

  const visit = (task) => {
    if (visited.has(task.id)) return;
    visited.add(task.id);

    // Add dependencies first (if they exist in our task list)
    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach(dep => {
        const depTask = tasks.find(t => t.id === dep.depends_on_task_id);
        if (depTask && !visited.has(depTask.id)) {
          visit(depTask);
        }
      });
    }

    sorted.push(task);
  };

  tasks.forEach(task => visit(task));
  return sorted;
};