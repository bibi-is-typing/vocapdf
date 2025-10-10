require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MAX_WORDS: 500,
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB

  // Legacy Free Dictionary API (fallback)
  DICTIONARY_API_URL: process.env.DICTIONARY_API_URL || 'https://api.dictionaryapi.dev/api/v2/entries/en',

  // Lingua Robot API (primary)
  LINGUA_ROBOT_API_URL: process.env.LINGUA_ROBOT_API_URL || 'https://lingua-robot.p.rapidapi.com',
  LINGUA_ROBOT_API_KEY: process.env.LINGUA_ROBOT_API_KEY || '',
  LINGUA_ROBOT_API_HOST: process.env.LINGUA_ROBOT_API_HOST || 'lingua-robot.p.rapidapi.com',

  // Google Gemini API (fallback for Free Dictionary API)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

  // Oxford Dictionaries API (CEFR level-based definitions)
  OXFORD_APP_ID: process.env.OXFORD_APP_ID || '',
  OXFORD_APP_KEY: process.env.OXFORD_APP_KEY || '',

  API_TIMEOUT: 10000, // 10초
  MAX_RETRIES: 2,
  RETRY_DELAY: 500 // 500ms
};
