const axios = require('axios');
const {
  LINGUA_ROBOT_API_URL,
  LINGUA_ROBOT_API_KEY,
  LINGUA_ROBOT_API_HOST,
  API_TIMEOUT,
  MAX_RETRIES,
  RETRY_DELAY
} = require('../config/constants');

/**
 * Lingua Robot API로 단어/숙어/문장 조회
 *
 * @param {string} input - 조회할 입력 (단어/숙어/문장)
 * @param {string} type - 입력 유형 ('word', 'phrase', 'sentence')
 * @returns {Promise<Object>} API 응답 데이터
 */
async function fetchFromLinguaRobot(input, type) {
  // API 키가 설정되지 않은 경우
  if (!LINGUA_ROBOT_API_KEY) {
    throw new Error('Lingua Robot API key is not configured');
  }

  try {
    // 유형에 따라 다른 엔드포인트 사용
    let endpoint;
    if (type === 'word' || type === 'phrase') {
      // 단어 및 숙어 조회: 사전 API
      endpoint = `/language/v1/entries/en/${encodeURIComponent(input)}`;
    } else {
      // 문장: 번역 API
      endpoint = `/translate/v1/text`;
    }

    const url = `${LINGUA_ROBOT_API_URL}${endpoint}`;

    const config = {
      method: type === 'sentence' ? 'POST' : 'GET',
      url: url,
      headers: {
        'X-RapidAPI-Key': LINGUA_ROBOT_API_KEY,
        'X-RapidAPI-Host': LINGUA_ROBOT_API_HOST,
        'Content-Type': 'application/json'
      },
      timeout: API_TIMEOUT
    };

    // 문장 번역의 경우 request body 추가
    if (type === 'sentence') {
      config.data = {
        text: input,
        source: 'en',
        target: 'ko'
      };
    }

    const response = await axios(config);

    if (response.status === 200 && response.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    // 404: 사전에 없는 단어
    if (error.response && error.response.status === 404) {
      return null;
    }

    console.error(`Lingua Robot API error for "${input}":`, error.message);
    throw error;
  }
}

/**
 * 재시도 로직이 포함된 Lingua Robot API 호출
 *
 * @param {string} input - 조회할 입력
 * @param {string} type - 입력 유형
 * @returns {Promise<Object|null>} API 응답 데이터 또는 null
 */
async function fetchFromLinguaRobotWithRetry(input, type) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await fetchFromLinguaRobot(input, type);
      return result;
    } catch (error) {
      lastError = error;

      // API 키 오류는 재시도하지 않음
      if (error.message.includes('API key')) {
        throw error;
      }

      // 마지막 시도가 아니면 대기 후 재시도
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying "${input}" (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        await sleep(RETRY_DELAY);
      }
    }
  }

  // 모든 재시도 실패
  console.error(`All retries failed for "${input}"`);
  throw lastError;
}

/**
 * Lingua Robot API 응답을 표준 형식으로 변환
 *
 * @param {Object} apiData - Lingua Robot API 응답
 * @param {string} type - 입력 유형
 * @param {Object} options - 사용자 옵션
 * @returns {Object} 표준화된 데이터
 */
function transformLinguaRobotResponse(apiData, type, options) {
  if (type === 'sentence') {
    // 문장 번역 응답 처리
    return {
      translation: apiData.translation || apiData.text || '',
      original: apiData.source || ''
    };
  }

  // 단어/숙어 사전 응답 처리
  const transformed = {
    meanings: []
  };

  if (apiData.entries && Array.isArray(apiData.entries)) {
    const limitedEntries = apiData.entries.slice(0, options.meanings || 2);

    limitedEntries.forEach(entry => {
      const meaningObj = {};

      // 한국어 번역 (meaningDisplay 옵션에 따라 포함 여부 결정)
      if (options.meaningDisplay !== 'english-only' && entry.translations) {
        meaningObj.meaning = entry.translations.ko || entry.translations[0] || '';
      }

      // 영영 뜻 (meaningDisplay 옵션에 따라 포함 여부 결정)
      if (options.meaningDisplay !== 'korean-only' && entry.definitions) {
        const definitions = Array.isArray(entry.definitions) ? entry.definitions : [entry.definitions];
        meaningObj.definition = definitions.slice(0, options.definitions || 1).join('; ');
      }

      // 유의어
      if (entry.synonyms && options.synonyms > 0) {
        meaningObj.synonyms = entry.synonyms.slice(0, options.synonyms);
      } else {
        meaningObj.synonyms = [];
      }

      // 반의어
      if (entry.antonyms && options.antonyms > 0) {
        meaningObj.antonyms = entry.antonyms.slice(0, options.antonyms);
      } else {
        meaningObj.antonyms = [];
      }

      // 관계어
      if (entry.related && options.related > 0) {
        meaningObj.related = entry.related.slice(0, options.related);
      } else {
        meaningObj.related = [];
      }

      transformed.meanings.push(meaningObj);
    });
  }

  return transformed;
}

/**
 * 지연 함수
 *
 * @param {number} ms - 대기 시간 (밀리초)
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  fetchFromLinguaRobot,
  fetchFromLinguaRobotWithRetry,
  transformLinguaRobotResponse
};
