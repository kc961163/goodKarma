// src/components/Profile.jsx
import { useState, useEffect } from "react";
import { useAuthUser } from "../security/AuthContext";
import { fetchGetWithAuth } from "../security/fetchWithAuth";
import useCoaching from "../hooks/useCoaching";
import CoachingGoals from "./coaching/CoachingGoals";
import CoachingInsights from "./coaching/CoachingInsights";
import ProgressTracker from "./coaching/ProgressTracker";
import "../style/profile.css";

export default function Profile() {
  const { user } = useAuthUser();
  const { 
    loading: coachingLoading, 
    error: coachingError, 
    coachingData,
    getCoachingAdvice,
    updateCoachingProgress,
    canMakeAdviceCall,
    canMakeProgressCall,
    nextResetDate
  } = useCoaching();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [karmaStats, setKarmaStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [setupData, setSetupData] = useState({
    age: "",
    occupation: "",
    currentSituation: ""
  });
  
  // Fetch karma statistics
  useEffect(() => {
    const fetchKarmaStats = async () => {
      if (!user?.id) return;
      
      try {
        setStatsLoading(true);
        // Replace placeholder with actual API call
        const data = await fetchGetWithAuth(
          `${process.env.REACT_APP_API_URL}/users/${user.id}/karma-stats`
        );
        
        setKarmaStats(data);
      } catch (err) {
        console.error("Error fetching karma stats:", err);
        // Optionally set a default or error state
        setKarmaStats({
          categories: {
            meditation: 0,
            journaling: 0,
            yoga: 0,
            volunteering: 0,
            donation: 0
          },
          totalPoints: 0,
          postCount: 0
        });
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchKarmaStats();
  }, [user?.id]);
  
  // Handle coaching setup
  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const profileData = {
        userProfile: {
          age: parseInt(setupData.age) || null,
          occupation: setupData.occupation,
          currentSituation: setupData.currentSituation
        }
      };
      
      // Get coaching advice
      await getCoachingAdvice(profileData);
      
      // Navigate to goals tab
      setActiveTab("goals");
    } catch (err) {
      console.error("Error setting up coaching:", err);
    }
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSetupData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle saving goals
  const handleSaveGoals = async (goals) => {
    try {
      const profileData = {
        userProfile: coachingData?.userProfile || {},
        goals: goals
      };
      
      // Get coaching advice
      await getCoachingAdvice(profileData);
      
      // Navigate to insights tab
      setActiveTab("insights");
    } catch (err) {
      console.error("Error saving goals:", err);
    }
  };
  
  // Handle progress update
  const handleUpdateProgress = async (progressData) => {
    try {
      // Update progress
      await updateCoachingProgress(progressData);
      
      // Navigate to insights tab to show updated recommendations
      setActiveTab("insights");
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };
  
  // Loading state
  if (statsLoading || coachingLoading) {
    return <div className="loading-container">Loading profile data...</div>;
  }

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      
      {/* Profile Tabs */}
      <div className="profile-tabs">
        <button 
          className={activeTab === "profile" ? "tab-active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile Info
        </button>
        
        <button 
          className={activeTab === "karma" ? "tab-active" : ""}
          onClick={() => setActiveTab("karma")}
        >
          Karma Stats
        </button>
        
        <button 
          className={activeTab === "coaching" ? "tab-active" : ""}
          onClick={() => setActiveTab("coaching")}
        >
          Life Coaching
        </button>
        
        {/* Only show these tabs if coaching is set up */}
        {coachingData?.userProfile && (
          <>
            <button 
              className={activeTab === "goals" ? "tab-active" : ""}
              onClick={() => setActiveTab("goals")}
            >
              Goals
            </button>
            
            {coachingData?.advice && (
              <>
                <button 
                  className={activeTab === "insights" ? "tab-active" : ""}
                  onClick={() => setActiveTab("insights")}
                >
                  Insights
                </button>
                
                <button 
                  className={activeTab === "progress" ? "tab-active" : ""}
                  onClick={() => setActiveTab("progress")}
                >
                  Progress
                </button>
              </>
            )}
          </>
        )}
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {/* Profile Info Tab */}
        {activeTab === "profile" && (
          <div className="profile-info">
            <div className="profile-field">
              <span className="profile-label">Name:</span>
              <span className="profile-value">{user?.name || "Not provided"}</span>
            </div>
            
            <div className="profile-field">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{user?.email}</span>
            </div>
          </div>
        )}
        
        {/* Karma Stats Tab */}
        {activeTab === "karma" && karmaStats && (
          <div className="profile-stats">
            <h2>Karma Stats</h2>
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-value">{karmaStats.categories.meditation}</span>
                <span className="stat-label">Meditations</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{karmaStats.categories.journaling}</span>
                <span className="stat-label">Journaling</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{karmaStats.categories.yoga}</span>
                <span className="stat-label">Yoga/Exercise</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{karmaStats.categories.volunteering}</span>
                <span className="stat-label">Volunteering</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{karmaStats.categories.donation}</span>
                <span className="stat-label">Donations</span>
              </div>
            </div>
            
            <div className="karma-total">
              <h3>Total Karma Points</h3>
              <div className="karma-badge">{karmaStats.totalPoints}</div>
            </div>
            <div className="karma-post-count">
              <p>Total Good Deeds: {karmaStats.postCount}</p>
            </div>
          </div>
        )}
        
        {/* Life Coaching Tab */}
        {activeTab === "coaching" && (
          <div className="coaching-section">
            <div className="coaching-intro">
              <h2>Personal Growth Coaching</h2>
              <p>Get personalized coaching based on your karma activities and goals. Our AI coach analyzes your patterns and provides actionable insights to help you grow.</p>
              
              {/* API limit status indicator */}
              {(!canMakeAdviceCall || !canMakeProgressCall) && (
                <div className="api-limit-notice">
                  <h4>Monthly API Calls</h4>
                  <ul>
                    <li>Coaching Advice: {canMakeAdviceCall ? '✅ Available' : '❌ Used for this month'}</li>
                    <li>Progress Updates: {canMakeProgressCall ? '✅ Available' : '❌ Used for this month'}</li>
                    {nextResetDate && (
                      <li>Next reset: {new Date(nextResetDate).toLocaleDateString()}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            
            {coachingData?.userProfile ? (
              <div className="coaching-active">
                <h3>Your Coaching Journey is Active</h3>
                <p>You've already started your personal growth journey. Continue by setting specific goals or checking your insights.</p>
                <div className="coaching-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab("goals")}
                  >
                    Manage Goals
                  </button>
                  
                  {coachingData?.advice && (
                    <button 
                      className="btn-secondary"
                      onClick={() => setActiveTab("insights")}
                    >
                      View Insights
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="coaching-setup">
                <h3>Start Your Coaching Journey</h3>
                <p>Tell us a bit about yourself to get personalized coaching insights:</p>
                
                <form className="coaching-form" onSubmit={handleSetupSubmit}>
                  <div className="form-group">
                    <label htmlFor="age">Age (optional)</label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={setupData.age}
                      onChange={handleInputChange}
                      placeholder="Your age"
                      min="13"
                      max="120"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="occupation">Occupation (optional)</label>
                    <input
                      type="text"
                      id="occupation"
                      name="occupation"
                      value={setupData.occupation}
                      onChange={handleInputChange}
                      placeholder="Your occupation"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="currentSituation">Current Situation</label>
                    <textarea
                      id="currentSituation"
                      name="currentSituation"
                      value={setupData.currentSituation}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Briefly describe your current life situation, goals, or challenges"
                      required
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={!canMakeAdviceCall}
                  >
                    {!canMakeAdviceCall 
                      ? "Monthly Advice Call Used" 
                      : "Start My Coaching Journey"}
                  </button>
                  
                  {!canMakeAdviceCall && (
                    <p className="limit-message">
                      You've used your monthly coaching advice call. Please try again next month.
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
        )}
        
        {/* Goals Tab */}
        {activeTab === "goals" && (
          coachingLoading ? (
            <div className="loading-container">
              <p>Loading coaching data...</p>
            </div>
          ) : (
            <>
              {!canMakeAdviceCall && (
                <div className="api-limit-notice">
                  <h4>Monthly Coaching Advice Limit Reached</h4>
                  <p>You've already received personalized coaching this month. Your next coaching refresh will be available on {nextResetDate ? new Date(nextResetDate).toLocaleDateString() : 'the first of next month'}.</p>
                </div>
              )}
              <CoachingGoals
                existingGoals={coachingData?.goals || []}
                onSaveGoals={handleSaveGoals}
                isLoading={coachingLoading}
                canMakeAdviceCall={canMakeAdviceCall}
              />
            </>
          )
        )}
        
        {/* Insights Tab */}
        {activeTab === "insights" && coachingData?.advice && (
          <CoachingInsights insights={coachingData.advice} />
        )}
        
        {/* Progress Tab */}
        {activeTab === "progress" && coachingData?.advice && (
          <>
            {!canMakeProgressCall && (
              <div className="api-limit-notice">
                <h4>Monthly Progress Update Limit Reached</h4>
                <p>You've already submitted a progress update this month. Your next progress update will be available on {nextResetDate ? new Date(nextResetDate).toLocaleDateString() : 'the first of next month'}.</p>
              </div>
            )}
            <ProgressTracker
              goals={coachingData?.goals || []}
              progress={coachingData?.progress}
              onUpdateProgress={handleUpdateProgress}
              isLoading={coachingLoading}
              canMakeProgressCall={canMakeProgressCall}
            />
          </>
        )}
        
        {/* Handle error state */}
        {coachingError && (
          <div className="error-message">
            {coachingError}
          </div>
        )}
      </div>
    </div>
  );
}