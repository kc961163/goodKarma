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
    // Always use noqueue=1 to avoid polling and get immediate results
    const response = await lifeCoachApi.post('/getLifeAdvice?noqueue=1', userData);
    return response.data;
  } catch (error) {
    return logError(error, 'getLifeAdvice', { userData });
  }
};

/**
 * Updates and tracks user progress towards goals
 * @param {Object} progressData - Current progress, achievements, and setbacks
 * @returns {Promise<Object>} - Updated recommendations based on progress
 */
export const updateProgress = async (progressData) => {
  try {
    // Always use noqueue=1 to avoid polling and get immediate results
    const response = await lifeCoachApi.post('/updateProgress?noqueue=1', progressData);
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
    
    // Just check if we can connect without using a real call
    const response = await lifeCoachApi.options('/getLifeAdvice');
    
    return response.status === 200;
  } catch (error) {
    logError(error, 'testApiConnection');
    return false;
  }
};