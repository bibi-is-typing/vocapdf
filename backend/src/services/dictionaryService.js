const axios = require('axios');
const { DICTIONARY_API_URL, API_TIMEOUT, MAX_RETRIES, RETRY_DELAY } = require('../config/constants');
const { extractMeanings, validateApiResponse } = require('../utils/meaningExtractor');
const { AppError } = require('../middleware/errorHandler');

/**
 * 단일 단어를 Free Dictionary API로 조회
 *
 * @param {string} word - 조회할 단어
 * @returns {Promise<Object>} API 응답 데이터
 */
async function fetchWordFromAPI(word) {
  const url = `${DICTIONARY_API_URL}/${word}`;

  try {
    const response = await axios.get(url, {
      timeout: API_TIMEOUT,
      validateStatus: (status) => {
        // 200과 404는 정상적으로 처리 (404는 단어가 없는 경우)
        return status === 200 || status === 404;
      }
    });

    // 404인 경우 null 반환
    if (response.status === 404) {
      return null;
    }

    // 응답이 배열 형태인지 확인
    if (!Array.isArray(response.data) || response.data.length === 0) {
      return null;
    }

    return response.data[0]; // 첫 번째 결과 반환
  } catch (error) {
    // 네트워크 오류나 타임아웃
    console.error(`API fetch error for word "${word}":`, error.message);
    throw error;
  }
}

/**
 * 재시도 로직이 포함된 단어 조회
 *
 * @param {string} word - 조회할 단어
 * @returns {Promise<Object|null>} API 응답 데이터 또는 null
 */
async function fetchWordWithRetry(word) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await fetchWordFromAPI(word);
      return result;
    } catch (error) {
      lastError = error;

      // 마지막 시도가 아니면 대기 후 재시도
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying word "${word}" (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        await sleep(RETRY_DELAY);
      }
    }
  }

  // 모든 재시도 실패
  console.error(`All retries failed for word "${word}"`);
  throw lastError;
}

/**
 * 여러 단어를 조회하고 사용자 옵션에 맞게 가공
 *
 * @param {Array<string>} words - 조회할 단어 배열
 * @param {Object} options - 사용자 선택 옵션
 * @returns {Promise<Object>} 가공된 결과 객체
 */
async function lookupWords(words, options) {
  const startTime = Date.now();

  const results = [];
  let processedCount = 0;
  let failedCount = 0;

  // 각 단어를 순차적으로 조회 (병렬 처리 시 API 부하 방지)
  for (const word of words) {
    try {
      const apiData = await fetchWordWithRetry(word.trim().toLowerCase());

      if (!apiData || !validateApiResponse(apiData)) {
        // 단어를 찾을 수 없거나 응답이 유효하지 않음
        results.push({
          word: word,
          error: '사전에서 찾을 수 없습니다',
          meanings: []
        });
        failedCount++;
      } else {
        // 정상 응답 - 의미 추출
        const extracted = extractMeanings(apiData, options);
        results.push(extracted);
        processedCount++;
      }
    } catch (error) {
      // API 호출 자체가 실패 (네트워크 오류 등)
      results.push({
        word: word,
        error: 'API 연결에 실패했습니다',
        meanings: []
      });
      failedCount++;
    }
  }

  const endTime = Date.now();
  const processingTime = ((endTime - startTime) / 1000).toFixed(1) + 's';

  return {
    success: true,
    data: results,
    meta: {
      totalWords: words.length,
      processedWords: processedCount,
      failedWords: failedCount,
      processingTime: processingTime
    }
  };
}

/**
 * 지연 함수 (재시도 대기용)
 *
 * @param {number} ms - 대기 시간 (밀리초)
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  lookupWords,
  fetchWordFromAPI,
  fetchWordWithRetry
};
