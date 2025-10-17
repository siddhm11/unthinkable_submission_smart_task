import React, { useState } from 'react';
import { goalService } from '../../services/api';
import { X, Target, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateGoalModal = ({ onClose, onGoalCreated }) => {
  const [goalText, setGoalText] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!goalText.trim()) {
      toast.error('Please enter a goal');
      return;
    }

    try {
      setIsCreating(true);
      await goalService.createGoal({ text: goalText.trim() });
      toast.success('Goal created! AI is generating tasks...');
      onGoalCreated();
    } catch (error) {
      toast.error('Failed to create goal');
      console.error('Error creating goal:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Example goals for inspiration
  const exampleGoals = [
    "Launch a mobile app in 3 months",
    "Build and launch a SaaS product in 6 months",
    "Complete my online course platform",
    "Organize a tech conference with 500 attendees",
    "Write and publish my first book",
  ];

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <Target className="modal-icon" />
            <h2>Create New Goal</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="goal-description">
            <p>
              Describe your project or goal in a sentence or two. Our AI will break it down into 
              actionable tasks with timelines and dependencies.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="goalText">What do you want to achieve?</label>
              <textarea
                id="goalText"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="e.g., Launch a mobile app in 3 months, Build a personal website, Organize a team retreat..."
                rows={4}
                maxLength={500}
                required
                disabled={isCreating}
              />
              <div className="char-count">
                {goalText.length}/500 characters
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={onClose}
                disabled={isCreating}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="create-btn"
                disabled={isCreating || !goalText.trim()}
              >
                {isCreating ? (
                  <>
                    <div className="button-spinner"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Create Goal
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="examples-section">
            <h4>Need inspiration? Try these examples:</h4>
            <div className="examples-list">
              {exampleGoals.map((example, index) => (
                <button
                  key={index}
                  className="example-btn"
                  onClick={() => setGoalText(example)}
                  disabled={isCreating}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="ai-notice">
            <div className="ai-notice-content">
              <Zap className="ai-icon" />
              <p>
                <strong>Powered by Groq's Lightning-Fast LLMs</strong><br />
                Tasks will be generated in seconds, not minutes!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGoalModal;