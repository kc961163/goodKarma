// src/utils/deedUtils.js
import { GOOD_DEEDS } from "../config/goodDeeds";

/**
 * Extract deed metadata from content string
 */
export const extractDeedMetadata = (contentStr) => {
  if (!contentStr) return null;
  
  const metadataMatch = contentStr.match(/<!-- DEED_METADATA:(.*?) -->/);
  if (!metadataMatch || !metadataMatch[1]) return null;
  
  try {
    return JSON.parse(metadataMatch[1]);
  } catch (e) {
    console.error("Error parsing deed metadata:", e);
    return null;
  }
};

/**
 * Get clean content without metadata
 */
export const getCleanContent = (contentStr) => {
  if (!contentStr) return "";
  return contentStr.replace(/<!-- DEED_METADATA:.*? -->/, "").trim();
};

/**
 * Get basic deed info (name, color, icon) for a post
 */
export const getDeedInfo = (post) => {
  const metadata = extractDeedMetadata(post.content);
  if (!metadata || !metadata.deedType || !GOOD_DEEDS[metadata.deedType]) {
    return null;
  }
  
  const deed = GOOD_DEEDS[metadata.deedType];
  return {
    name: deed.name,
    color: deed.color,
    icon: deed.icon
  };
};

/**
 * Get full deed information with option labels
 */
export const getFullDeedInfo = (metadata) => {
  if (!metadata || !metadata.deedType || !GOOD_DEEDS[metadata.deedType]) {
    return null;
  }
  
  return {
    name: GOOD_DEEDS[metadata.deedType].name,
    icon: GOOD_DEEDS[metadata.deedType].icon,
    color: GOOD_DEEDS[metadata.deedType].color,
    
    // Get option labels from values
    primaryLabel: metadata.primaryOption && GOOD_DEEDS[metadata.deedType].options.primary
      ? GOOD_DEEDS[metadata.deedType].options.primary.values.find(v => v.value === metadata.primaryOption)?.label
      : null,
    
    secondaryLabel: metadata.secondaryOption && GOOD_DEEDS[metadata.deedType].options.secondary
      ? GOOD_DEEDS[metadata.deedType].options.secondary.values.find(v => v.value === metadata.secondaryOption)?.label
      : null,
    
    primaryName: GOOD_DEEDS[metadata.deedType].options.primary?.label,
    secondaryName: GOOD_DEEDS[metadata.deedType].options.secondary?.label
  };
};