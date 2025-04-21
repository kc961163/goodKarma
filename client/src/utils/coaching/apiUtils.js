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

/**
 * Extracts updated insights from progress response and merges with existing advice
 * @param {Object} progressData - Progress update response data
 * @param {Object} existingAdvice - Existing advice data to merge with
 * @returns {Object} - Merged insights for the advice field
 */
export const extractProgressInsights = (progressData, existingAdvice = {}) => {
  if (!progressData) return existingAdvice;
  
  try {
    // Create a deep copy of the existing advice
    const mergedAdvice = JSON.parse(JSON.stringify(existingAdvice || {}));
    
    // Ensure necessary structure exists
    mergedAdvice.analysis = mergedAdvice.analysis || {};
    mergedAdvice.recommendations = mergedAdvice.recommendations || {};
    mergedAdvice.actionPlan = mergedAdvice.actionPlan || {};
    mergedAdvice.analysis.strengthsAndWeaknesses = mergedAdvice.analysis.strengthsAndWeaknesses || 
      { strengths: [], areasForImprovement: [] };
    
    // UPDATE: Map from "Progress Assessment" to currentSituation
    if (progressData["Progress Assessment"]) {
      const assessmentValues = Object.values(progressData["Progress Assessment"]);
      if (assessmentValues.length > 0) {
        mergedAdvice.analysis.currentSituation = assessmentValues.join(' ');
      }
    }
    
    // UPDATE: Map from "Achievement Analysis" to strengths
    if (progressData["Achievement Analysis"]) {
      const achievements = [];
      Object.entries(progressData["Achievement Analysis"]).forEach(([area, details]) => {
        if (details && details.description) {
          achievements.push(details.description);
        }
      });
      
      if (achievements.length > 0) {
        mergedAdvice.analysis.strengthsAndWeaknesses.strengths = achievements;
      }
    }
    
    // UPDATE: Map from "Setback Evaluation" to areasForImprovement
    if (progressData["Setback Evaluation"]) {
      const setbacks = [];
      Object.entries(progressData["Setback Evaluation"]).forEach(([area, details]) => {
        if (details && details.description) {
          setbacks.push(details.description);
        }
      });
      
      if (setbacks.length > 0) {
        mergedAdvice.analysis.strengthsAndWeaknesses.areasForImprovement = setbacks;
      }
    }
    
    // UPDATE: Map from "Adjusted Recommendations" to shortTerm recommendations
    if (progressData["Adjusted Recommendations"]) {
      const recommendations = [];
      Object.entries(progressData["Adjusted Recommendations"]).forEach(([area, recommendation]) => {
        if (typeof recommendation === 'string') {
          recommendations.push({
            area: area,
            action: recommendation,
            timeline: "1-3 months"
          });
        }
      });
      
      if (recommendations.length > 0) {
        mergedAdvice.recommendations.shortTerm = recommendations;
      }
    }
    
    // UPDATE: Map from "Next Steps" to immediate action plan
    if (progressData["Next Steps"]) {
      const nextSteps = Object.values(progressData["Next Steps"]);
      if (nextSteps.length > 0) {
        mergedAdvice.actionPlan.immediate = nextSteps;
      }
    }
    
    return mergedAdvice;
  } catch (error) {
    logError(error, 'extractProgressInsights', { progressData });
    return existingAdvice; // Return original advice if we encounter an error
  }
};