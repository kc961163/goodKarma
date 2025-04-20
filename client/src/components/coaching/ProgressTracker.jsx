// src/components/coaching/ProgressTracker.jsx
import { useState } from 'react';

export default function ProgressTracker({ 
  goals = [], 
  progress = null,
  onUpdateProgress,
  isLoading = false
}) {
  const [achievements, setAchievements] = useState([
    { area: '', description: '', impact: 'medium', date: getCurrentDate() }
  ]);
  
  const [setbacks, setSetbacks] = useState([
    { area: '', description: '', impact: 'medium', recovery: '' }
  ]);
  
  // Helper to get current date in YYYY-MM-DD format
  function getCurrentDate() {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }
  
  // Handle changes to achievements
  const handleAchievementChange = (index, field, value) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };
  
  // Add new achievement
  const addAchievement = () => {
    setAchievements([
      ...achievements,
      { area: '', description: '', impact: 'medium', date: getCurrentDate() }
    ]);
  };
  
  // Remove achievement
  const removeAchievement = (index) => {
    if (achievements.length <= 1) return;
    const updated = [...achievements];
    updated.splice(index, 1);
    setAchievements(updated);
  };
  
  // Handle changes to setbacks
  const handleSetbackChange = (index, field, value) => {
    const updated = [...setbacks];
    updated[index] = { ...updated[index], [field]: value };
    setSetbacks(updated);
  };
  
  // Add new setback
  const addSetback = () => {
    setSetbacks([
      ...setbacks,
      { area: '', description: '', impact: 'medium', recovery: '' }
    ]);
  };
  
  // Remove setback
  const removeSetback = (index) => {
    if (setbacks.length <= 1) return;
    const updated = [...setbacks];
    updated.splice(index, 1);
    setSetbacks(updated);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare progress data
    const progressData = {
      achievements: achievements.filter(a => a.description.trim() !== ''),
      setbacks: setbacks.filter(s => s.description.trim() !== ''),
      currentProgress: {
        // Map areas from goals for tracking
        ...goals.reduce((acc, goal) => {
          if (goal.area) {
            acc[goal.area] = { status: 'in_progress' };
          }
          return acc;
        }, {})
      }
    };
    
    onUpdateProgress(progressData);
  };
  
  return (
    <div className="progress-tracker">
      <h3>Track Your Progress</h3>
      <p>Update your coach about your achievements and challenges:</p>
      
      {/* Display existing progress summary if available */}
      {progress && progress.progressAssessment && (
        <div className="progress-summary">
          <h4>Current Progress Assessment</h4>
          <div className="progress-areas">
            {Object.entries(progress.progressAssessment).map(([area, assessment]) => (
              <div className="progress-area" key={`progress-${area}`}>
                <div className="area-name">{area}</div>
                <div className="area-status">{assessment.currentStatus}</div>
              </div>
            ))}
          </div>
          
          {progress.nextSteps && (
            <div className="progress-next-steps">
              <h4>Recommended Next Steps</h4>
              <div className="next-steps-list">
                {Object.entries(progress.nextSteps).map(([area, step]) => (
                  <div className="next-step" key={`next-${area}`}>
                    <div className="step-area">{area}</div>
                    <div className="step-description">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="progress-form">
        <div className="form-section">
          <h4>Achievements</h4>
          <p>What have you accomplished since your last update?</p>
          
          {achievements.map((achievement, index) => (
            <div className="achievement-item" key={`achievement-${index}`}>
              <div className="achievement-header">
                <h5>Achievement {index + 1}</h5>
                {achievements.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeAchievement(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Area</label>
                  <select
                    value={achievement.area}
                    onChange={(e) => handleAchievementChange(index, 'area', e.target.value)}
                    required
                  >
                    <option value="">Select area</option>
                    {goals.map((goal, i) => (
                      <option key={`goal-option-${i}`} value={goal.area}>
                        {goal.area.charAt(0).toUpperCase() + goal.area.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={achievement.date}
                    onChange={(e) => handleAchievementChange(index, 'date', e.target.value)}
                    max={getCurrentDate()}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={achievement.description}
                  onChange={(e) => handleAchievementChange(index, 'description', e.target.value)}
                  placeholder="What did you accomplish?"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label>Impact</label>
                <select
                  value={achievement.impact}
                  onChange={(e) => handleAchievementChange(index, 'impact', e.target.value)}
                >
                  <option value="low">Small win</option>
                  <option value="medium">Significant progress</option>
                  <option value="high">Major milestone</option>
                </select>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            className="btn-secondary add-btn"
            onClick={addAchievement}
          >
            Add Another Achievement
          </button>
        </div>
        
        <div className="form-section">
          <h4>Challenges</h4>
          <p>What obstacles have you encountered?</p>
          
          {setbacks.map((setback, index) => (
            <div className="setback-item" key={`setback-${index}`}>
              <div className="setback-header">
                <h5>Challenge {index + 1}</h5>
                {setbacks.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeSetback(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-group">
                <label>Area</label>
                <select
                  value={setback.area}
                  onChange={(e) => handleSetbackChange(index, 'area', e.target.value)}
                  required
                >
                  <option value="">Select area</option>
                  {goals.map((goal, i) => (
                    <option key={`goal-setback-${i}`} value={goal.area}>
                      {goal.area.charAt(0).toUpperCase() + goal.area.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={setback.description}
                  onChange={(e) => handleSetbackChange(index, 'description', e.target.value)}
                  placeholder="What challenge did you face?"
                  required
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Impact</label>
                  <select
                    value={setback.impact}
                    onChange={(e) => handleSetbackChange(index, 'impact', e.target.value)}
                  >
                    <option value="low">Minor obstacle</option>
                    <option value="medium">Significant challenge</option>
                    <option value="high">Major setback</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Recovery Plan</label>
                <textarea
                  value={setback.recovery}
                  onChange={(e) => handleSetbackChange(index, 'recovery', e.target.value)}
                  placeholder="How are you addressing this challenge?"
                ></textarea>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            className="btn-secondary add-btn"
            onClick={addSetback}
          >
            Add Another Challenge
          </button>
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Progress & Get New Insights'}
          </button>
        </div>
      </form>
    </div>
  );
}