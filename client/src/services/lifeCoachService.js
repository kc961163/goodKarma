// src/services/lifeCoachService.js
import axios from 'axios';
import { logError } from '../utils/errors/errorLogger';

// Create an axios instance for the Life Coach API
const lifeCoachApi = axios.create({
  baseURL: 'https://ai-life-coach-api-personal-development-online-coaching.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
    'X-RapidAPI-Host': process.env.REACT_APP_RAPID_API_HOST || 'ai-life-coach-api-personal-development-online-coaching.p.rapidapi.com',
    'Content-Type': 'application/json'
  }
});

/**
 * Fetches personalized life advice based on user profile and goals
 * @param {Object} userData - User profile, goals, and preferences
 * @returns {Promise<Object>} - Life coaching advice
 */
export const getLifeAdvice = async (userData) => {
    try {
      // Initial request
      const initialResponse = await lifeCoachApi.post('/getLifeAdvice', userData);
      
      // Check if we got a direct result or need to poll
      if (initialResponse.data.status === 'success' && initialResponse.data.result) {
        return initialResponse.data;
      }
      
      // Get queue information
      const queueId = initialResponse.data.queueId;
      if (!queueId) {
        throw new Error('No queue ID returned from API');
      }
      
      // Return the queue information so the caller can handle polling
      return {
        status: 'queued',
        queueId,
        message: initialResponse.data.message || 'Request queued',
        pollUrl: `/getLifeAdvice?queueId=${queueId}`
      };
    } catch (error) {
      return logError(error, 'getLifeAdvice', { userData });
    }
  };
  
  // New function to check queue status
  export const checkQueueStatus = async (queueId) => {
    try {
      // Use POST with the queueId in the request body
      const response = await lifeCoachApi.post('/getLifeAdvice', {
        queueId: queueId
      });
      return response.data;
    } catch (error) {
      return logError(error, 'checkQueueStatus', { queueId });
    }
  };

/**
 * Updates and tracks user progress towards goals
 * @param {Object} progressData - Current progress, achievements, and setbacks
 * @returns {Promise<Object>} - Updated recommendations based on progress
 */
export const updateProgress = async (progressData) => {
  try {
    const response = await lifeCoachApi.post('/updateProgress', progressData);
    return response.data;
  } catch (error) {
    return logError(error, 'updateProgress', { progressData });
  }
};

/**
 * Test function to verify API connectivity
 * @returns {Promise<boolean>} - True if connection is successful
 */
export const testApiConnection = async () => {
  try {
    // Simple test request with minimal data
    const testData = {
      userProfile: {
        age: 30,
        occupation: "Software Developer",
        personalityTraits: ["focused"],
        values: ["growth"],
        interests: ["technology"]
      },
      goals: [{
        area: "career",
        description: "Test connection",
        priority: "low",
        timeline: "1 month"
      }],
      timeframe: "1 month",
      focusAreas: ["career"],
      lang: "en"
    };
    
    // We'll just check if we can connect, but won't use the full response
    const response = await lifeCoachApi.post('/getLifeAdvice?noqueue=1', testData);
    
    return response.status === 200;
  } catch (error) {
    logError(error, 'testApiConnection');
    return false;
  }
};