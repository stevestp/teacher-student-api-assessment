/**
 * Utility functions for the application
 */

/**
 * Extract email addresses mentioned in a notification text
 * Looks for patterns like @email@domain.com
 * @param {string} text - The notification text
 * @returns {string[]} - Array of mentioned email addresses
 */
const extractMentionedEmails = text => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const emailRegex = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const matches = text.match(emailRegex);

  if (!matches) {
    return [];
  }

  // Remove the @ symbol and get unique emails
  return [...new Set(matches.map(match => match.substring(1)))];
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
const isValidEmail = email => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Normalize email addresses (convert to lowercase)
 * @param {string|string[]} emails - Email or array of emails
 * @returns {string|string[]} - Normalized email(s)
 */
const normalizeEmails = emails => {
  if (Array.isArray(emails)) {
    return emails.map(email => email.toLowerCase().trim());
  }
  return emails.toLowerCase().trim();
};

/**
 * Remove duplicate values from array
 * @param {any[]} array - Array with potential duplicates
 * @returns {any[]} - Array with unique values
 */
const removeDuplicates = array => {
  return [...new Set(array)];
};

/**
 * Create a standardized API response
 * @param {boolean} success - Whether the operation was successful
 * @param {any} data - Response data
 * @param {string} message - Response message
 * @param {number} statusCode - HTTP status code
 * @returns {object} - Standardized response object
 */
const createResponse = (success, data = null, message = '', statusCode = 200) => {
  const response = {
    success,
    statusCode
  };

  if (message) {
    response.message = message;
  }

  if (data !== null) {
    response.data = data;
  }

  return response;
};

/**
 * Sleep function for testing purposes
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  extractMentionedEmails,
  isValidEmail,
  normalizeEmails,
  removeDuplicates,
  createResponse,
  sleep
};
