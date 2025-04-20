// src/components/coaching/CoachingInsights.jsx
import { useState } from 'react';

export default function CoachingInsights({ insights }) {
  const [expandedSection, setExpandedSection] = useState('strengths');
  
  if (!insights) {
    return (
      <div className="no-insights">
        <p>No coaching insights available. Complete your coaching profile to receive personalized advice.</p>
      </div>
    );
  }
  
  // Extract data from insights
  const {
    analysis = {},
    recommendations = {},
    actionPlan = {}
  } = insights;
  
  const {
    personalityInsights = '',
    strengthsAndWeaknesses = { strengths: [], areasForImprovement: [] },
    currentSituation = ''
  } = analysis;
  
  const {
    shortTerm = [],
    longTerm = []
  } = recommendations;
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  return (
    <div className="coaching-insights">
      <div className="insights-header">
        <h2>Your Growth Insights</h2>
        <p>Based on your goals and karma activities, your personal AI coach has created these tailored insights:</p>
      </div>
      
      <div className="insights-container">
        {/* Personality Section */}
        {personalityInsights && (
          <div className="insight-card">
            <div 
              className={`card-header ${expandedSection === 'personality' ? 'expanded' : ''}`}
              onClick={() => toggleSection('personality')}
            >
              <h3>Personal Analysis</h3>
              <span className="toggle-icon">{expandedSection === 'personality' ? '−' : '+'}</span>
            </div>
            
            {expandedSection === 'personality' && (
              <div className="card-content">
                <p className="personality-insights">{personalityInsights}</p>
                
                {currentSituation && (
                  <div className="current-situation">
                    <h4>Current Situation</h4>
                    <p>{currentSituation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Strengths Section */}
        {strengthsAndWeaknesses.strengths?.length > 0 && (
          <div className="insight-card">
            <div 
              className={`card-header ${expandedSection === 'strengths' ? 'expanded' : ''}`}
              onClick={() => toggleSection('strengths')}
            >
              <h3>Your Strengths</h3>
              <span className="toggle-icon">{expandedSection === 'strengths' ? '−' : '+'}</span>
            </div>
            
            {expandedSection === 'strengths' && (
              <div className="card-content">
                <ul className="strengths-list">
                  {strengthsAndWeaknesses.strengths.map((strength, index) => (
                    <li key={`strength-${index}`}>
                      <div className="strength-icon">✓</div>
                      <div className="strength-text">{strength}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Growth Areas */}
        {strengthsAndWeaknesses.areasForImprovement?.length > 0 && (
          <div className="insight-card">
            <div 
              className={`card-header ${expandedSection === 'improvements' ? 'expanded' : ''}`}
              onClick={() => toggleSection('improvements')}
            >
              <h3>Growth Opportunities</h3>
              <span className="toggle-icon">{expandedSection === 'improvements' ? '−' : '+'}</span>
            </div>
            
            {expandedSection === 'improvements' && (
              <div className="card-content">
                <ul className="improvements-list">
                  {strengthsAndWeaknesses.areasForImprovement.map((area, index) => (
                    <li key={`improve-${index}`}>
                      <div className="improvement-icon">↗</div>
                      <div className="improvement-text">{area}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Short-term Recommendations */}
        {shortTerm?.length > 0 && (
          <div className="insight-card">
            <div 
              className={`card-header ${expandedSection === 'shortTerm' ? 'expanded' : ''}`}
              onClick={() => toggleSection('shortTerm')}
            >
              <h3>Recommended Actions</h3>
              <span className="toggle-icon">{expandedSection === 'shortTerm' ? '−' : '+'}</span>
            </div>
            
            {expandedSection === 'shortTerm' && (
              <div className="card-content">
                {shortTerm.map((rec, index) => (
                  <div className="action-item" key={`rec-${index}`}>
                    <div className="action-header">
                      <span className="action-number">{index + 1}</span>
                      <span className="action-area">{rec.area}</span>
                      {rec.timeline && <span className="action-timeline">{rec.timeline}</span>}
                    </div>
                    <div className="action-description">{rec.action}</div>
                    {rec.expectedOutcome && (
                      <div className="action-outcome">
                        Expected outcome: {rec.expectedOutcome}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Long-term Strategies */}
        {longTerm?.length > 0 && (
          <div className="insight-card">
            <div 
              className={`card-header ${expandedSection === 'longTerm' ? 'expanded' : ''}`}
              onClick={() => toggleSection('longTerm')}
            >
              <h3>Long-Term Strategies</h3>
              <span className="toggle-icon">{expandedSection === 'longTerm' ? '−' : '+'}</span>
            </div>
            
            {expandedSection === 'longTerm' && (
              <div className="card-content">
                {longTerm.map((strategy, index) => (
                  <div className="strategy-item" key={`strategy-${index}`}>
                    <div className="strategy-header">
                      <span className="strategy-area">{strategy.area}</span>
                    </div>
                    <div className="strategy-description">{strategy.strategy}</div>
                    
                    {strategy.milestones?.length > 0 && (
                      <div className="strategy-milestones">
                        <h4>Key Milestones</h4>
                        <ul>
                          {strategy.milestones.map((milestone, j) => (
                            <li key={`milestone-${index}-${j}`}>{milestone}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Action Plan */}
        {(actionPlan.immediate?.length > 0 || actionPlan['30days']?.length > 0) && (
          <div className="insight-card">
            <div 
              className={`card-header ${expandedSection === 'actionPlan' ? 'expanded' : ''}`}
              onClick={() => toggleSection('actionPlan')}
            >
              <h3>Your Action Plan</h3>
              <span className="toggle-icon">{expandedSection === 'actionPlan' ? '−' : '+'}</span>
            </div>
            
            {expandedSection === 'actionPlan' && (
              <div className="card-content">
                <div className="action-plan-timeline">
                  {actionPlan.immediate?.length > 0 && (
                    <div className="timeline-section">
                      <h4>Start Now</h4>
                      <ul>
                        {actionPlan.immediate.map((action, i) => (
                          <li key={`now-${i}`}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {actionPlan['30days']?.length > 0 && (
                    <div className="timeline-section">
                      <h4>Next 30 Days</h4>
                      <ul>
                        {actionPlan['30days'].map((action, i) => (
                          <li key={`30d-${i}`}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {actionPlan['90days']?.length > 0 && (
                    <div className="timeline-section">
                      <h4>90-Day Goals</h4>
                      <ul>
                        {actionPlan['90days'].map((action, i) => (
                          <li key={`90d-${i}`}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}