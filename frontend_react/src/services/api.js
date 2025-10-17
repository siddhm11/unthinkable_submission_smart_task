import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please log in again.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// API service functions
export const authService = {
  login: (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return api.post('/auth/login', formData);
  },
  register: (userData) => api.post('/auth/register', userData),
  testToken: () => api.post('/auth/test-token'),
};

export const goalService = {
  getGoals: () => api.get('/goals/'),
  getGoal: (goalId) => api.get(`/goals/${goalId}`),
  createGoal: (goalData) => api.post('/goals/', goalData),
  updateGoal: (goalId, goalData) => api.put(`/goals/${goalId}`, goalData),
  deleteGoal: (goalId) => api.delete(`/goals/${goalId}`),
  regenerateTasks: (goalId) => api.post(`/goals/${goalId}/regenerate-tasks`),
};

export const taskService = {
  getTask: (taskId) => api.get(`/tasks/${taskId}`),
  updateTask: (taskId, taskData) => api.patch(`/tasks/${taskId}`, taskData),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  addDependency: (taskId, dependsOnTaskId) => 
    api.post(`/tasks/${taskId}/dependencies`, { depends_on_task_id: dependsOnTaskId }),
  removeDependency: (taskId, dependsOnTaskId) => 
    api.delete(`/tasks/${taskId}/dependencies/${dependsOnTaskId}`),
  createTask: (taskData, goalId) => 
    api.post(`/tasks/?goal_id=${goalId}`, taskData),
  getGoalTasks: (goalId) => api.get(`/tasks/goal/${goalId}`),
};