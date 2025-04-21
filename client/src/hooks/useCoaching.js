// src/hooks/useCoaching.js
import { useState, useEffect, useCallback } from 'react';
import { useAuthUser } from '../security/AuthContext';
import { fetchGetWithAuth, fetchPostWithAuth } from '../security/fetchWithAuth';
import { getLifeAdvice, updateProgress } from '../services/lifeCoachService';

import { 
  formatLifeAdviceRequest, 
  formatProgressUpdateRequest 
} from '../utils/coaching/mappingUtils';
import { 
  parseLifeCoachResponse,
  extractActionableInsights,
  createProgressSummary,
  extractProgressInsights
} from '../utils/coaching/apiUtils';
import { logError } from '../utils/errors/errorLogger';

// Cache duration in milliseconds (10 minutes)
const CACHE_DURATION = 10 * 60 * 1000;

export default function useCoaching() {
  const { user } = useAuthUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coachingData, setCoachingData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
  // New state variables for API limit tracking
  const [canMakeAdviceCall, setCanMakeAdviceCall] = useState(true);
  const [canMakeProgressCall, setCanMakeProgressCall] = useState(true);
  const [nextResetDate, setNextResetDate] = useState(null);
  
  // Fetch coaching data from backend
  const fetchCoachingData = useCallback(async (force = false) => {
    if (!user?.id) return null;
    
    // Check cache unless force refresh is requested
    const now = Date.now();
    if (!force && lastFetchTime > 0 && (now - lastFetchTime) < CACHE_DURATION) {
      return coachingData;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchGetWithAuth(
        `${process.env.REACT_APP_API_URL}/users/${user.id}/coaching`
      );
      
      setCoachingData(data);
      setLastFetchTime(now);
      return data;
    } catch (err) {
      // If it's a 404, it just means no coaching data yet - not an error
      if (err.message && !err.message.includes('404')) {
        setError('Failed to load coaching data');
        logError(err, 'fetchCoachingData');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, lastFetchTime, coachingData]);
  
  // New function to check API limits
  const checkApiLimits = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetchGetWithAuth(
        `${process.env.REACT_APP_API_URL}/users/${user.id}/coaching/api-status`
      );
      
      setCanMakeAdviceCall(response.canMakeAdviceCall);
      setCanMakeProgressCall(response.canMakeProgressCall);
      setNextResetDate(response.nextResetDate);
      
      return response;
    } catch (err) {
      logError(err, 'checkApiLimits');
      return null;
    }
  }, [user?.id]);
  
  // Fetch user posts to analyze for coaching
  const fetchUserPosts = useCallback(async () => {
    if (!user?.id) return [];
    
    try {
      const posts = await fetchGetWithAuth(
        `${process.env.REACT_APP_API_URL}/posts`
      );
      
      setUserPosts(posts);
      return posts;
    } catch (err) {
      logError(err, 'fetchUserPosts');
      return [];
    }
  }, [user?.id]);
  
  // Initialize hook by loading data
  useEffect(() => {
    if (user?.id) {
      // Check API limits first
      checkApiLimits().then(() => {
        // Then load coaching data
        fetchCoachingData().then(() => {
          // Then load posts
          fetchUserPosts();
        });
      });
    }
  }, [user?.id, fetchCoachingData, fetchUserPosts, checkApiLimits]);
  
  // Save coaching profile to the backend
  const saveCoachingProfile = async (profileData) => {
    if (!user?.id) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      // Format the data before saving
      const formattedProfile = {
        userProfile: profileData.userProfile || {},
        goals: profileData.goals || [],
        challenges: profileData.challenges || [],
        timeframe: profileData.timeframe || '6 months',
        focusAreas: profileData.focusAreas || []
      };
      
      const result = await fetchPostWithAuth(
        `${process.env.REACT_APP_API_URL}/users/${user.id}/coaching`,
        { userProfile: formattedProfile }
      );
      
      // Update local state
      setCoachingData(prevData => ({
        ...prevData,
        userProfile: formattedProfile
      }));
      
      return result;
    } catch (err) {
      setError('Failed to save coaching profile');
      logError(err, 'saveCoachingProfile', { profileData });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const getCoachingAdvice = async (profileData = {}) => {
    if (!user?.id) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if user has used their advice API call this month
      await checkApiLimits();
      
      if (!canMakeAdviceCall) {
        setError('You have already used your monthly coaching advice. Next reset: ' + 
          new Date(nextResetDate).toLocaleDateString());
        return null;
      }
      
      // Ensure we have user posts
      const posts = userPosts.length > 0 ? userPosts : await fetchUserPosts();
      
      // Combine profile data with posts data
      const request = formatLifeAdviceRequest(profileData, posts);
      
      // Call the Life Coach API - results should be immediate now with noqueue=1
      const response = await getLifeAdvice(request);
      
      // Process successful response
      if (response.status === 'success' && response.result) {
        const adviceResult = response.result;
        
        // Extract actionable insights
        const insights = extractActionableInsights(adviceResult);
        
        // Save to backend and mark monthly call as used
        await fetchPostWithAuth(
          `${process.env.REACT_APP_API_URL}/users/${user.id}/coaching`,
          { 
            userProfile: request.userProfile,
            goals: request.goals,             
            advice: adviceResult,
            insights
          }
        );
        
        // Update local state
        await fetchCoachingData(true);
        await checkApiLimits();
        
        return adviceResult;
      }
      
      throw new Error('Failed to get coaching advice');
    } catch (err) {
      setError('Failed to get coaching advice');
      logError(err, 'getCoachingAdvice', { profileData });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Update coaching progress
const updateCoachingProgress = async (progressData) => {
  if (!user?.id) return null;
  
  try {
    setLoading(true);
    setError(null);
    
    // Check if user has used their progress API call this month
    await checkApiLimits();
    
    if (!canMakeProgressCall) {
      setError('You have already used your monthly progress update. Next reset: ' + 
        new Date(nextResetDate).toLocaleDateString());
      return null;
    }
    
    // Ensure we have coaching data with advice
    const coaching = coachingData || await fetchCoachingData();
    
    if (!coaching || !coaching.userProfile) {
      throw new Error('No coaching profile found. Please set up coaching first.');
    }
    
    // Format progress update request
    const request = formatProgressUpdateRequest(progressData, coaching.userProfile);
    
    // Call the Life Coach API with immediate results
    const response = await updateProgress(request);
    
    // Parse and validate response
    const progressResult = parseLifeCoachResponse(response);
    
    if (!progressResult) {
      throw new Error('Failed to get valid progress update');
    }
    
    // Create progress summary
    const progressSummary = createProgressSummary(progressResult);
    
    // Extract and merge progress insights with existing advice
    const updatedAdvice = extractProgressInsights(progressResult, coaching.advice);
    
    // Save to backend with both progress data and merged advice
    await fetchPostWithAuth(
      `${process.env.REACT_APP_API_URL}/users/${user.id}/coaching/progress`,
      { 
        progress: progressResult,
        summary: progressSummary,
        updatedAdvice: updatedAdvice
      }
    );
    
    // Update local state
    await fetchCoachingData(true);
    await checkApiLimits();
    
    return progressResult;
  } catch (err) {
    setError('Failed to update coaching progress');
    logError(err, 'updateCoachingProgress', { progressData });
    return null;
  } finally {
    setLoading(false);
  }
};
  
  return {
    loading,
    error,
    coachingData,
    userPosts,
    canMakeAdviceCall,
    canMakeProgressCall,
    nextResetDate,
    refreshData: fetchCoachingData,
    saveCoachingProfile,
    getCoachingAdvice,
    updateCoachingProgress
  };
}