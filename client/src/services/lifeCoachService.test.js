// src/services/lifeCoachService.test.js
import { testApiConnection, getLifeAdvice } from './lifeCoachService';

/**
 * Simple function to test API connectivity from the browser console
 * This is not a formal test, just a utility to verify connectivity
 */
export const runApiConnectionTest = async () => {
  console.log('Testing Life Coach API connection...');
  
  try {
    const isConnected = await testApiConnection();
    
    if (isConnected) {
      console.log('%c ✅ API Connection Successful', 'color: green; font-weight: bold');
      return true;
    } else {
      console.log('%c ❌ API Connection Failed', 'color: red; font-weight: bold');
      return false;
    }
  } catch (error) {
    console.error('API connection test error:', error);
    return false;
  }
};

/**
 * Test function to get a sample coaching advice
 * This uses minimal data to test the actual response format
 */
export const runSampleAdviceTest = async () => {
  console.log('Requesting sample coaching advice...');
  
  const sampleData = {
    userProfile: {
      age: 35,
      occupation: "Product Manager",
      currentSituation: "Looking to improve work-life balance",
      personalityTraits: ["analytical", "dedicated"],
      values: ["family", "growth", "health"],
      interests: ["technology", "fitness", "reading"]
    },
    goals: [
      {
        area: "health",
        description: "Establish a regular exercise routine",
        priority: "high",
        timeline: "3 months"
      }
    ],
    challenges: [
      {
        area: "time_management",
        description: "Finding time for personal activities with busy work schedule",
        impact: "high"
      }
    ],
    timeframe: "6 months",
    focusAreas: ["health", "work_life_balance"],
    lang: "en"
  };
  
  try {
    const response = await getLifeAdvice(sampleData);
    
    if (response && response.status === 'success') {
      console.log('%c ✅ Advice API Call Successful', 'color: green; font-weight: bold');
      console.log('Response preview:', {
        status: response.status,
        analysisPreview: response.result?.analysis?.personalityInsights?.substring(0, 100) + '...',
        hasRecommendations: !!response.result?.recommendations,
        hasActionPlan: !!response.result?.actionPlan
      });
      return response;
    } else {
      console.log('%c ❌ Advice API Call Failed', 'color: red; font-weight: bold', response);
      return null;
    }
  } catch (error) {
    console.error('Sample advice test error:', error);
    return null;
  }
};

// Expose these functions to the browser console for easy testing
if (typeof window !== 'undefined') {
  window.testLifeCoachApi = {
    testConnection: runApiConnectionTest,
    testAdvice: runSampleAdviceTest
  };
  
  console.log(
    '%c Life Coach API Test Functions Available',
    'background: #4CAF50; color: white; padding: 5px; border-radius: 3px;',
    '\n\nRun tests in console with:\n',
    '- window.testLifeCoachApi.testConnection()\n',
    '- window.testLifeCoachApi.testAdvice()'
  );
}