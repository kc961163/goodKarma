// src/utils/errors/errorLogger.js

/**
 * Centralized error logging function
 * @param {Error} error - The error object
 * @param {string} context - Where the error occurred
 * @param {Object} additionalData - Any extra information about the error
 */
export const logError = (error, context, additionalData = {}) => {
    // In development, log to console with formatting
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `%c Error in ${context} `,
        'background: #FF0000; color: white; font-weight: bold',
        {
          message: error.message,
          stack: error.stack,
          ...additionalData
        }
      );
    }
    
    // In production, you might want to send to a logging service
    // This could be expanded to use Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      console.error(`Error in ${context}:`, error);
      
      // Example integration point for future error tracking services
      // sendToErrorService({
      //   error,
      //   context,
      //   additionalData
      // });
    }
    
    return error; // Return the error for further handling if needed
  };