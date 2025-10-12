const axios = require('axios');
const { DICTIONARY_API_URL, API_TIMEOUT, MAX_RETRIES, RETRY_DELAY, LINGUA_ROBOT_API_KEY, GEMINI_API_KEY, OXFORD_APP_ID, OXFORD_APP_KEY } = require('../config/constants');
const { extractMeanings, extractMeaningsFromClaude, extractMeaningsFromOxford, validateApiResponse } = require('../utils/meaningExtractor');
const { categorizeInputs, getTypeStats } = require('../utils/inputTypeDetector');
const { fetchFromLinguaRobotWithRetry, transformLinguaRobotResponse } = require('./linguaRobotService');
const { fetchFromGeminiWithRetry, transformGeminiResponse } = require('./geminiService');
const { fetchFromOxfordWithRetry, transformOxfordResponse } = require('./oxfordDictionaryService');
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

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY);
      }
    }
  }

  throw lastError;
}

/**
 * 단일 입력 조회 (단어/숙어/문장)
 *
 * @param {Object} item - 조회할 항목 {original, normalized, type, inputIndex}
 * @param {Object} options - 사용자 옵션
 * @returns {Promise<Object>} 조회 결과 (inputIndex 포함)
 */
async function fetchSingleItem(item, options) {
  try {
    if (item.type !== 'sentence') {
      try {
        const apiData = await fetchWordWithRetry(item.normalized);

        if (apiData && validateApiResponse(apiData)) {
          const extracted = extractMeanings(apiData, options);
          extracted.type = item.type;
          extracted.source = 'free-api';
          extracted.success = true;
          extracted.inputIndex = item.inputIndex;
          return extracted;
        }
      } catch (freeError) {
      }
    }

    if (item.type !== 'sentence' &&
        (options.meaningDisplay === 'english' || options.meaningDisplay === 'both') &&
        (OXFORD_APP_ID && OXFORD_APP_KEY)) {
      try {
        const oxfordData = await fetchFromOxfordWithRetry(item.normalized, options.cefrLevel);

        if (oxfordData) {
          const transformed = transformOxfordResponse(oxfordData, options.cefrLevel);
          if (transformed && transformed.meanings && transformed.meanings.length > 0) {
            const extracted = extractMeaningsFromOxford(transformed, options);
            extracted.type = item.type;
            extracted.source = 'oxford-api';
            extracted.success = true;
            extracted.inputIndex = item.inputIndex;
            return extracted;
          }
        }
      } catch (oxfordError) {
      }
    }

    if (GEMINI_API_KEY) {
      try {
        const geminiData = await fetchFromGeminiWithRetry(item.normalized, item.type, options);

        if (geminiData) {
          if (item.type === 'sentence') {
            return {
              word: item.original,
              type: item.type,
              examples: geminiData.examples || [],
              similarExpressions: geminiData.similarExpressions || [],
              original: geminiData.original,
              source: 'gemini-api',
              success: true,
              inputIndex: item.inputIndex
            };
          } else {
            const extracted = extractMeaningsFromClaude(geminiData, options);
            extracted.type = item.type;
            extracted.source = 'gemini-api';
            extracted.success = true;
            extracted.inputIndex = item.inputIndex;
            return extracted;
          }
        }
      } catch (geminiError) {
      }
    }
    return {
      word: item.original,
      type: item.type,
      error: item.type === 'sentence' ? '문장 번역을 지원하지 않습니다' : '사전에서 찾을 수 없습니다',
      meanings: [],
      source: 'none',
      success: false,
      inputIndex: item.inputIndex
    };
  } catch (error) {
    // API 호출 자체가 실패 (네트워크 오류 등)
    return {
      word: item.original,
      type: item.type,
      error: 'API 연결에 실패했습니다',
      meanings: [],
      source: 'error',
      success: false,
      inputIndex: item.inputIndex
    };
  }
}

/**
 * 배열을 배치로 나누기
 *
 * @param {Array} array - 나눌 배열
 * @param {number} size - 배치 크기
 * @returns {Array<Array>} 배치 배열
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 여러 단어를 조회하고 사용자 옵션에 맞게 가공
 *
 * @param {Array<string>} inputs - 조회할 입력 배열 (단어/숙어/문장)
 * @param {Object} options - 사용자 선택 옵션
 * @param {Function} onProgress - 진행률 콜백 (선택)
 * @returns {Promise<Object>} 가공된 결과 객체
 */
async function lookupWords(inputs, options, onProgress) {
  const startTime = Date.now();

  const categorized = categorizeInputs(inputs);
  const typeStats = getTypeStats(categorized);

  const results = [];
  let processedCount = 0;
  let failedCount = 0;

  const allInputs = categorized.allItems;

  // Rate limit 회피하면서 timeout 방지를 위한 최적 배치 크기
  const BATCH_SIZE = 10;
  const batches = chunkArray(allInputs, BATCH_SIZE);
  const totalItems = allInputs.length;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];

    // Promise.allSettled로 배치 내 모든 항목 병렬 처리
    const batchResults = await Promise.allSettled(
      batch.map(item => fetchSingleItem(item, options))
    );

    batchResults.forEach((promiseResult, index) => {
      if (promiseResult.status === 'fulfilled') {
        const result = promiseResult.value;
        results.push(result);

        if (result.success) {
          processedCount++;
        } else {
          failedCount++;
        }
      } else {
        const currentItem = batch[index];
        failedCount++;
        results.push({
          word: currentItem?.original || 'Unknown',
          type: currentItem?.type || 'word',
          error: '처리 중 오류가 발생했습니다',
          meanings: [],
          source: 'error',
          success: false,
          inputIndex: currentItem?.inputIndex || 0
        });
      }
    });

    if (onProgress && typeof onProgress === 'function') {
      const progress = Math.min(((batchIndex + 1) * batch.length) / totalItems * 100, 100);
      onProgress({
        processed: results.length,
        total: totalItems,
        percentage: Math.round(progress)
      });
    }

    if (batchIndex < batches.length - 1) {
      await sleep(500);
    }
  }

  results.sort((a, b) => (a.inputIndex || 0) - (b.inputIndex || 0));

  const endTime = Date.now();
  const processingTime = ((endTime - startTime) / 1000).toFixed(1) + 's';

  return {
    success: true,
    data: results,
    meta: {
      totalInputs: inputs.length,
      processedInputs: processedCount,
      failedInputs: failedCount,
      typeStats: typeStats,
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
