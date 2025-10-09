require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MAX_WORDS: 500,
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  DICTIONARY_API_URL: process.env.DICTIONARY_API_URL || 'https://api.dictionaryapi.dev/api/v2/entries/en',
  API_TIMEOUT: 10000, // 10초
  MAX_RETRIES: 2,
  RETRY_DELAY: 500 // 500ms
};
