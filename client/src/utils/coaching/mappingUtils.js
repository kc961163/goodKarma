// src/utils/coaching/mappingUtils.js
import { GOOD_DEEDS } from "../../config/goodDeeds";
import { extractDeedMetadata } from "../deedUtils";

/**
 * Maps Good Karma deed types to Life Coach API focus areas
 */
export const DEED_TO_FOCUS_AREA = {
  meditation: "mindfulness",
  journaling: "personal_growth",
  yoga: "physical_health",
  volunteering: "contribution",
  donation: "generosity"
};

/**
 * Maps Good Karma deed types to personality traits
 */
export const DEED_TO_PERSONALITY_TRAITS = {
  meditation: ["mindful", "calm", "reflective"],
  journaling: ["introspective", "thoughtful", "organized"],
  yoga: ["disciplined", "balanced", "health-conscious"],
  volunteering: ["compassionate", "generous", "community-oriented"],
  donation: ["generous", "altruistic", "supportive"]
};

/**
 * Maps Good Karma deed types to personal values
 */
export const DEED_TO_VALUES = {
  meditation: ["inner peace", "mindfulness", "presence"],
  journaling: ["self-awareness", "reflection", "growth"],
  yoga: ["health", "balance", "discipline"],
  volunteering: ["community", "service", "connection"],
  donation: ["generosity", "impact", "support"]
};

/**
 * Converts user posts to Life Coach API profile format
 * @param {Array} posts - User's Good Karma posts
 * @returns {Object} - Formatted profile data for Life Coach API
 */
export const convertPostsToCoachingProfile = (posts) => {
  if (!posts || !posts.length) {
    return {
      userProfile: {
        personalityTraits: ["growth-oriented"],
        values: ["personal growth"],
        interests: ["self-improvement"]
      },
      focusAreas: ["personal_growth"],
      goals: []
    };
  }

  // Analyze posts to determine personality traits, values, and focus areas
  const deedCounts = {};
  
  // Count posts by deed type
  posts.forEach(post => {
    const metadata = extractDeedMetadata(post.content);
    if (metadata && metadata.deedType) {
      deedCounts[metadata.deedType] = (deedCounts[metadata.deedType] || 0) + 1;
    }
  });

  // Extract personality traits based on most frequent deeds (up to 3)
  const traits = new Set();
  const deedTypes = Object.keys(deedCounts).sort((a, b) => deedCounts[b] - deedCounts[a]);
  deedTypes.slice(0, 3).forEach(deedType => {
    const deedTraits = DEED_TO_PERSONALITY_TRAITS[deedType] || [];
    deedTraits.forEach(trait => traits.add(trait));
  });

  // Extract values based on most frequent deeds (up to 3)
  const values = new Set();
  deedTypes.slice(0, 3).forEach(deedType => {
    const deedValues = DEED_TO_VALUES[deedType] || [];
    deedValues.forEach(value => values.add(value));
  });

  // Create focus areas based on deed types
  const focusAreas = deedTypes
    .map(deedType => DEED_TO_FOCUS_AREA[deedType])
    .filter(Boolean);

  // Map interests to deed names
  const interests = deedTypes
    .map(deedType => GOOD_DEEDS[deedType]?.name)
    .filter(Boolean);

  return {
    userProfile: {
      personalityTraits: Array.from(traits).slice(0, 5),
      values: Array.from(values).slice(0, 5),
      interests: interests.length ? interests : ["personal growth"]
    },
    focusAreas: focusAreas.length ? focusAreas : ["personal_growth"]
  };
};

/**
 * Extracts implicit goals from user's posts
 * @param {Array} posts - User's Good Karma posts
 * @returns {Array} - Potential goals based on activity patterns
 */
export const extractImplicitGoals = (posts) => {
  if (!posts || !posts.length) {
    return [];
  }

  // Count posts by deed type
  const deedCounts = {};
  posts.forEach(post => {
    const metadata = extractDeedMetadata(post.content);
    if (metadata && metadata.deedType) {
      deedCounts[metadata.deedType] = (deedCounts[metadata.deedType] || 0) + 1;
    }
  });

  // Create potential goals based on most frequent activities
  const goals = [];
  
  // Find most consistent practice
  const mostFrequentDeed = Object.keys(deedCounts)
    .sort((a, b) => deedCounts[b] - deedCounts[a])[0];
    
  if (mostFrequentDeed) {
    const focusArea = DEED_TO_FOCUS_AREA[mostFrequentDeed] || "personal_growth";
    const deedName = GOOD_DEEDS[mostFrequentDeed]?.name || mostFrequentDeed;
    
    goals.push({
      area: focusArea,
      description: `Maintain consistent ${deedName.toLowerCase()} practice`,
      priority: "high",
      timeline: "3 months"
    });
  }
  
  // Look for areas with less activity that might be growth opportunities
  const lessFrequentDeeds = Object.keys(deedCounts)
    .filter(deed => deedCounts[deed] <= 2)
    .slice(0, 1);
    
  if (lessFrequentDeeds.length) {
    const focusArea = DEED_TO_FOCUS_AREA[lessFrequentDeeds[0]] || "personal_growth";
    const deedName = GOOD_DEEDS[lessFrequentDeeds[0]]?.name || lessFrequentDeeds[0];
    
    goals.push({
      area: focusArea,
      description: `Increase ${deedName.toLowerCase()} activity`,
      priority: "medium",
      timeline: "6 months"
    });
  }
  
  // Look for deed types not yet tried
  const unusedDeedTypes = Object.keys(GOOD_DEEDS)
    .filter(deed => !deedCounts[deed])
    .slice(0, 1);
    
  if (unusedDeedTypes.length) {
    const focusArea = DEED_TO_FOCUS_AREA[unusedDeedTypes[0]] || "personal_growth";
    const deedName = GOOD_DEEDS[unusedDeedTypes[0]]?.name || unusedDeedTypes[0];
    
    goals.push({
      area: focusArea,
      description: `Explore ${deedName.toLowerCase()} practice`,
      priority: "low",
      timeline: "6 months"
    });
  }

  return goals;
};

/**
 * Formats coaching data for the Life Coach API's getLifeAdvice endpoint
 * @param {Object} userData - User profile data
 * @param {Array} posts - User's Good Karma posts
 * @returns {Object} - Formatted request data for Life Coach API
 */
export const formatLifeAdviceRequest = (userData, posts = []) => {
  // Get basic profile and focus areas from posts
  const baseProfile = convertPostsToCoachingProfile(posts);
  
  // Extract implicit goals if no explicit goals provided
  const implicitGoals = extractImplicitGoals(posts);
  
  // Combine with provided user data
  return {
    userProfile: {
      ...baseProfile.userProfile,
      ...(userData?.userProfile || {})
    },
    goals: userData?.goals?.length ? userData.goals : implicitGoals,
    challenges: userData?.challenges || [],
    timeframe: userData?.timeframe || "6 months",
    focusAreas: [
      ...baseProfile.focusAreas,
      ...(userData?.focusAreas || [])
    ],
    lang: userData?.lang || "en"
  };
};

/**
 * Formats progress data for the Life Coach API's updateProgress endpoint
 * @param {Object} progressData - User's progress update
 * @param {Object} coachingProfile - Existing coaching profile
 * @returns {Object} - Formatted request data for Life Coach API
 */
export const formatProgressUpdateRequest = (progressData, coachingProfile) => {
  return {
    currentProgress: progressData.currentProgress || {},
    initialPlan: {
      ...(coachingProfile?.goals ? { goals: coachingProfile.goals } : {}),
      timeline: coachingProfile?.timeframe || "6 months"
    },
    achievements: progressData.achievements || [],
    setbacks: progressData.setbacks || [],
    nextMilestones: progressData.nextMilestones || [],
    lang: progressData.lang || "en"
  };
};