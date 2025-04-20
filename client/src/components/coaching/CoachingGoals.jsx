// src/components/coaching/CoachingGoals.jsx
import { useState } from 'react';

export default function CoachingGoals({ 
  existingGoals = [],
  onSaveGoals,
  isLoading = false
}) {
  const [goals, setGoals] = useState(existingGoals.length > 0 ? existingGoals : [
    { area: '', description: '', priority: 'medium', timeline: '3 months' }
  ]);
  
  const handleGoalChange = (index, field, value) => {
    const updatedGoals = [...goals];
    updatedGoals[index] = { ...updatedGoals[index], [field]: value };
    setGoals(updatedGoals);
  };
  
  const addGoal = () => {
    setGoals([...goals, { area: '', description: '', priority: 'medium', timeline: '3 months' }]);
  };
  
  const removeGoal = (index) => {
    if (goals.length <= 1) return; // Keep at least one goal
    const updatedGoals = [...goals];
    updatedGoals.splice(index, 1);
    setGoals(updatedGoals);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveGoals(goals);
  };
  
  return (
    <div className="coaching-goals">
      <h3>Define Your Personal Goals</h3>
      <p>Setting clear goals helps your AI coach provide personalized guidance:</p>
      
      <form onSubmit={handleSubmit}>
        {goals.map((goal, index) => (
          <div className="goal-form-section" key={`goal-${index}`}>
            <div className="goal-header">
              <h4>Goal {index + 1}</h4>
              {goals.length > 1 && (
                <button 
                  type="button" 
                  className="remove-goal-btn"
                  onClick={() => removeGoal(index)}
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="form-group">
              <label>Area</label>
              <select
                value={goal.area}
                onChange={(e) => handleGoalChange(index, 'area', e.target.value)}
                required
              >
                <option value="">Select an area</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="health">Health & Wellness</option>
                <option value="career">Career</option>
                <option value="relationships">Relationships</option>
                <option value="personal_growth">Personal Growth</option>
                <option value="contribution">Contribution</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={goal.description}
                onChange={(e) => handleGoalChange(index, 'description', e.target.value)}
                placeholder="What specifically do you want to achieve?"
                required
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label>Priority</label>
                <select
                  value={goal.priority}
                  onChange={(e) => handleGoalChange(index, 'priority', e.target.value)}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="form-group half">
                <label>Timeline</label>
                <select
                  value={goal.timeline}
                  onChange={(e) => handleGoalChange(index, 'timeline', e.target.value)}
                >
                  <option value="1 month">1 month</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="1 year">1 year</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        
        <div className="goals-form-actions">
          <button
            type="button"
            onClick={addGoal}
            className="btn-secondary add-goal-btn"
          >
            Add Another Goal
          </button>
          
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Goals & Get Coaching'}
          </button>
        </div>
      </form>
    </div>
  );
}