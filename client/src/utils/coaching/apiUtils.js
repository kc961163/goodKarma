// src/utils/coaching/apiUtils.js
import { logError } from '../errors/errorLogger';

/**
 * Parses and validates a Life Coach API response
 * @param {Object} response - API response data
 * @returns {Object|null} - Parsed response or null if invalid
 */
export const parseLifeCoachResponse = (response) => {
  try {
    if (!response) {
      return null;
    }
    
    // Check for API error response
    if (response.status === 'error') {
      logError(
        new Error(response.message || 'Unknown API error'), 
        'parseLifeCoachResponse',
        { response }
      );
      return null;
    }
    
    // Basic validation of result structure
    if (!response.result) {
      logError(
        new Error('API response missing result object'), 
        'parseLifeCoachResponse',
        { response }
      );
      return null;
    }
    
    return response.result;
  } catch (error) {
    logError(error, 'parseLifeCoachResponse', { response });
    return null;
  }
};

/**
 * Extracts actionable insights from coaching advice
 * @param {Object} advice - Life Coach API advice result
 * @returns {Object} - Simplified insights for display
 */
export const extractActionableInsights = (advice) => {
  if (!advice) {
    return null;
  }
  
  try {
    // Extract key insights
    return {
      strengths: advice.analysis?.strengthsAndWeaknesses?.strengths || [],
      improvements: advice.analysis?.strengthsAndWeaknesses?.areasForImprovement || [],
      shortTermActions: advice.recommendations?.shortTerm?.map(rec => ({
        area: rec.area,
        action: rec.action,
        timeline: rec.timeline
      })) || [],
      longTermStrategies: advice.recommendations?.longTerm?.map(strat => ({
        area: strat.area,
        strategy: strat.strategy,
        milestones: strat.milestones || []
      })) || [],
      immediateSteps: advice.actionPlan?.immediate || []
    };
  } catch (error) {
    logError(error, 'extractActionableInsights', { advice });
    return null;
  }
};

/**
 * Creates a summary of coaching progress
 * @param {Object} progress - Progress update result from API
 * @returns {Object} - Formatted progress summary
 */
export const createProgressSummary = (progress) => {
  if (!progress) {
    return null;
  }
  
  try {
    return {
      statusByArea: Object.entries(progress.progressAssessment || {})
        .reduce((acc, [area, assessment]) => {
          acc[area] = assessment.currentStatus;
          return acc;
        }, {}),
      achievements: Object.entries(progress.achievementAnalysis || {})
        .reduce((acc, [area, analysis]) => {
          acc[area] = analysis;
          return acc;
        }, {}),
      recommendations: Object.entries(progress.adjustedRecommendations || {})
        .reduce((acc, [area, recs]) => {
          acc[area] = recs.suggestions || [];
          return acc;
        }, {}),
      nextSteps: progress.nextSteps || {}
    };
  } catch (error) {
    logError(error, 'createProgressSummary', { progress });
    return null;
  }
};