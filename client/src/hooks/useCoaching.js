// src/hooks/useCoaching.js
import { useState, useEffect, useCallback } from 'react';
import { useAuthUser } from '../security/AuthContext';
import { fetchGetWithAuth, fetchPostWithAuth } from '../security/fetchWithAuth';
import { getLifeAdvice, checkQueueStatus, updateProgress } from '../services/lifeCoachService';

import { 
  formatLifeAdviceRequest, 
  formatProgressUpdateRequest 
} from '../utils/coaching/mappingUtils';
import { 
  parseLifeCoachResponse,
  extractActionableInsights,
  createProgressSummary
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
  const [queueStatus, setQueueStatus] = useState(null);
  
  // Track when we last called the external API to avoid rate limits
  const [lastApiCallTime, setLastApiCallTime] = useState(0);
  
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
      // First load coaching data
      fetchCoachingData().then(() => {
        // Then load posts
        fetchUserPosts();
      });
    }
  }, [user?.id, fetchCoachingData, fetchUserPosts]);
  
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
      
      // Ensure we have user posts
      const posts = userPosts.length > 0 ? userPosts : await fetchUserPosts();
      
      // Combine profile data with posts data
      const request = formatLifeAdviceRequest(profileData, posts);
      
      // Add rate limiting to avoid hitting API too frequently
      const now = Date.now();
      if ((now - lastApiCallTime) < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setLastApiCallTime(Date.now());
      
      // Call the Life Coach API
      const response = await getLifeAdvice(request);
      
      // Check if queued or immediate result
      if (response.status === 'queued') {
        // Start polling
        setQueueStatus({
          queueId: response.queueId,
          message: response.message,
          progress: 0
        });
        
        // Start polling in the background
        pollForResults(response.queueId, profileData, request);
        
        return null; // Return null for now, will update state when results arrive
      }
      
      // If we got immediate results, process them
      if (response.status === 'success' && response.result) {
        const adviceResult = response.result;
        
        // Extract actionable insights
        const insights = extractActionableInsights(adviceResult);
        
        // Save to backend
        await fetchPostWithAuth(
          `${process.env.REACT_APP_API_URL}/users/${user.id}/coaching`,
          { 
            userProfile: request,
            advice: adviceResult,
            insights
          }
        );
        
        // Update local state
        await fetchCoachingData(true);
        
        return adviceResult;
      }
      
      throw new Error('Unexpected response format from API');
    } catch (err) {
      setError('Failed to get coaching advice');
      logError(err, 'getCoachingAdvice', { profileData });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const pollForResults = async (queueId, profileData, originalRequest) => {
    try {
      // Initial delay
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Start polling loop
      let attempts = 0;
      const maxAttempts = 12; // 1 minute (12 x 5 seconds)
      
      while (attempts < maxAttempts) {
        const result = await checkQueueStatus(queueId);
        
        // Update queue status with progress
        setQueueStatus(prev => ({
          ...prev,
          progress: Math.min(90, attempts * 10), // Estimate progress percentage
          message: result.message || prev.message
        }));
        
        // Check if results are ready
        if (result.status === 'success' && result.result) {
          const adviceResult = result.result;
          
          // Extract actionable insights
          const insights = extractActionableInsights(adviceResult);
          
          // Save to backend
          await fetchPostWithAuth(
            `${process.env.REACT_APP_API_URL}/users/${user.id}/coaching`,
            { 
              userProfile: originalRequest,
              advice: adviceResult,
              insights
            }
          );
          
          // Update local state
          await fetchCoachingData(true);
          
          // Clear queue status
          setQueueStatus(null);
          return;
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
      
      // If we reach maximum attempts
      setError('Timed out waiting for coaching advice');
      setQueueStatus(null);
    } catch (err) {
      setError('Error checking queue status');
      logError(err, 'pollForResults', { queueId });
      setQueueStatus(null);
    }
  };
  
  // Update coaching progress
  const updateCoachingProgress = async (progressData) => {
    if (!user?.id) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      // Ensure we have coaching data
      const coaching = coachingData || await fetchCoachingData();
      
      if (!coaching || !coaching.userProfile) {
        throw new Error('No coaching profile found. Please set up coaching first.');
      }
      
      // Format progress update request
      const request = formatProgressUpdateRequest(progressData, coaching.userProfile);
      
      // Add rate limiting
      const now = Date.now();
      if ((now - lastApiCallTime) < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Call the Life Coach API
      const response = await updateProgress(request);
      setLastApiCallTime(Date.now());
      
      // Parse and validate response
      const progressResult = parseLifeCoachResponse(response);
      
      if (!progressResult) {
        throw new Error('Failed to get valid progress update');
      }
      
      // Create progress summary
      const progressSummary = createProgressSummary(progressResult);
      
      // Save to backend
      await fetchPostWithAuth(
        `${process.env.REACT_APP_API_URL}/users/${user.id}/coaching/progress`,
        { 
          progress: progressResult,
          summary: progressSummary
        }
      );
      
      // Update local state
      await fetchCoachingData(true);
      
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
    loading,                  // Loading state
    error,                    // Error state
    coachingData,             // Current coaching data
    userPosts,                // User's karma posts
    queueStatus,              // Add this line to export queue status
    refreshData: fetchCoachingData,
    saveCoachingProfile,
    getCoachingAdvice,
    updateCoachingProgress
  };
}