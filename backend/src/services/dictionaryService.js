const axios = require('axios');
const { DICTIONARY_API_URL, API_TIMEOUT, MAX_RETRIES, RETRY_DELAY, LINGUA_ROBOT_API_KEY, ANTHROPIC_API_KEY, OXFORD_APP_ID, OXFORD_APP_KEY } = require('../config/constants');
const { extractMeanings, extractMeaningsFromClaude, extractMeaningsFromOxford, validateApiResponse } = require('../utils/meaningExtractor');
const { categorizeInputs, getTypeStats } = require('../utils/inputTypeDetector');
const { fetchFromLinguaRobotWithRetry, transformLinguaRobotResponse } = require('./linguaRobotService');
const { fetchFromClaudeWithRetry, transformClaudeResponse, translateKoreanToEnglishWithRetry } = require('./claudeService');
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
 * 단일 입력 조회 (단어/숙어/문장)
 *
 * @param {Object} item - 조회할 항목 {original, normalized, type, inputIndex}
 * @param {Object} options - 사용자 옵션
 * @returns {Promise<Object>} 조회 결과 (inputIndex 포함)
 */
async function fetchSingleItem(item, options) {
  console.log(`\n[${item.original}] 조회 시작 (타입: ${item.type}, 순서: ${item.inputIndex})`);

  try {
    // 🇰🇷 한글 입력: Claude API로 번역
    if (item.type === 'korean') {
      if (!ANTHROPIC_API_KEY) {
        console.error(`  [${item.original}] ❌ Claude API key가 없어 한글 번역 불가`);
        return {
          word: item.original,
          type: item.type,
          error: '한글 번역에는 Claude API가 필요합니다',
          meanings: [],
          source: 'none',
          success: false,
          inputIndex: item.inputIndex
        };
      }

      try {
        console.log(`  [${item.original}] 🤖 Claude API로 한글→영어 번역 시도 중...`);
        const translationData = await translateKoreanToEnglishWithRetry(item.original);

        if (translationData) {
          console.log(`  [${item.original}] ✅ 번역 성공: ${translationData.english}`);
          return {
            word: translationData.korean,
            englishWord: translationData.english,
            phonetic: translationData.phonetic || '',
            type: item.type,
            meanings: [
              {
                partOfSpeech: '',
                meaning: translationData.english,
                definition: translationData.definition || '',
                example: translationData.example || ''
              }
            ],
            source: 'claude-api',
            success: true,
            inputIndex: item.inputIndex
          };
        }
      } catch (translationError) {
        console.warn(`  [${item.original}] ⚠️ 번역 실패:`, translationError.message);
        return {
          word: item.original,
          type: item.type,
          error: '번역에 실패했습니다',
          meanings: [],
          source: 'error',
          success: false,
          inputIndex: item.inputIndex
        };
      }
    }

    // 🎯 Priority 1: Free Dictionary API (무료, 단어/숙어만 가능)
    if (item.type !== 'sentence' && item.type !== 'korean') {
      try {
        console.log(`  [${item.original}] 📖 Free Dictionary API 시도 중...`);
        const apiData = await fetchWordWithRetry(item.normalized);
        console.log(`  [${item.original}] Free API 응답:`, apiData ? 'Data received' : 'null');

        if (apiData && validateApiResponse(apiData)) {
          console.log(`  [${item.original}] ✅ Free Dictionary API 성공!`);
          const extracted = extractMeanings(apiData, options);
          extracted.type = item.type;
          extracted.source = 'free-api';
          extracted.success = true;
          extracted.inputIndex = item.inputIndex;
          console.log(`  [${item.original}] meanings 개수:`, extracted.meanings?.length || 0);
          return extracted;
        } else {
          console.log(`  [${item.original}] ❌ Free Dictionary API 실패 (validateApiResponse: ${validateApiResponse(apiData)})`);
        }
      } catch (freeError) {
        console.warn(`  [${item.original}] ⚠️ Free Dictionary API 에러:`, freeError.message);
      }
    }

    // 🎯 Priority 2: Oxford Dictionaries API (CEFR 레벨별 정의)
    // meaningDisplay가 english 또는 both일 때만 Oxford API 사용 (영영뜻 제공)
    if (item.type !== 'sentence' && item.type !== 'korean' &&
        (options.meaningDisplay === 'english' || options.meaningDisplay === 'both') &&
        (OXFORD_APP_ID && OXFORD_APP_KEY)) {
      try {
        console.log(`  [${item.original}] 📚 Oxford API 시도 중... (CEFR: ${options.cefrLevel})`);
        const oxfordData = await fetchFromOxfordWithRetry(item.normalized, options.cefrLevel);

        if (oxfordData) {
          const transformed = transformOxfordResponse(oxfordData, options.cefrLevel);
          if (transformed && transformed.meanings && transformed.meanings.length > 0) {
            console.log(`  [${item.original}] ✅ Oxford API 성공! (CEFR: ${options.cefrLevel})`);
            const extracted = extractMeaningsFromOxford(transformed, options);
            extracted.type = item.type;
            extracted.source = 'oxford-api';
            extracted.success = true;
            extracted.inputIndex = item.inputIndex;
            return extracted;
          }
        }
      } catch (oxfordError) {
        console.warn(`  [${item.original}] ⚠️ Oxford API 에러:`, oxfordError.message);
      }
    }

    // 🔄 Fallback: Claude API (비용 발생, 모든 타입 지원, CEFR 레벨 지원)
    // meaningDisplay가 korean일 때도 Claude API를 사용 (한국어 번역 제공)
    if (ANTHROPIC_API_KEY) {
      try {
        console.log(`  [${item.original}] 🤖 Claude API 시도 중... (CEFR: ${options.cefrLevel})`);
        const claudeData = await fetchFromClaudeWithRetry(item.normalized, item.type, options);

        if (claudeData) {
          // Claude API 성공
          if (item.type === 'sentence') {
            // 문장 활용 예시
            console.log(`  [${item.original}] ✅ Claude API 성공 (문장 활용 예시)`);
            return {
              word: item.original,
              type: item.type,
              examples: claudeData.examples || [],
              similarExpressions: claudeData.similarExpressions || [],
              original: claudeData.original,
              source: 'claude-api',
              success: true,
              inputIndex: item.inputIndex
            };
          } else {
            // 단어/숙어
            const extracted = extractMeaningsFromClaude(claudeData, options);
            extracted.type = item.type;
            extracted.source = 'claude-api';
            extracted.success = true;
            extracted.inputIndex = item.inputIndex;
            console.log(`  [${item.original}] ✅ Claude API 성공 (단어/숙어)`);
            return extracted;
          }
        }
      } catch (claudeError) {
        console.warn(`  [${item.original}] ⚠️ Claude API 에러:`, claudeError.message);
      }
    }

    // ❌ 모든 API 실패
    console.error(`❌ All APIs failed for "${item.original}"`);
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

  // 입력 유형 분류
  const categorized = categorizeInputs(inputs);
  const typeStats = getTypeStats(categorized);

  console.log('🔍 [dictionaryService] 입력 분류 결과:');
  console.log('  - 단어:', categorized.words.map(w => w.original));
  console.log('  - 숙어:', categorized.phrases.map(p => p.original));
  console.log('  - 문장:', categorized.sentences.map(s => s.original));
  console.log('  - 한글:', categorized.korean?.map(k => k.original) || []);
  console.log('📊 [dictionaryService] 타입별 통계:', typeStats);

  const results = [];
  let processedCount = 0;
  let failedCount = 0;

  // 순서를 유지하는 allItems 사용 (중복이 이미 제거됨)
  const allInputs = categorized.allItems;

  const BATCH_SIZE = 10; // 10개씩 병렬 처리
  const batches = chunkArray(allInputs, BATCH_SIZE);
  const totalItems = allInputs.length;

  console.log(`📦 [dictionaryService] ${totalItems}개 항목을 ${batches.length}개 배치로 처리`);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`🚀 [Batch ${batchIndex + 1}/${batches.length}] ${batch.length}개 항목 병렬 처리 시작`);

    // Promise.allSettled로 배치 내 모든 항목 병렬 처리
    const batchResults = await Promise.allSettled(
      batch.map(item => fetchSingleItem(item, options))
    );

    // 결과 수집
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
        // Promise 자체가 reject된 경우 (매우 드물지만)
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

    // 진행률 콜백 호출
    if (onProgress && typeof onProgress === 'function') {
      const progress = Math.min(((batchIndex + 1) * batch.length) / totalItems * 100, 100);
      onProgress({
        processed: results.length,
        total: totalItems,
        percentage: Math.round(progress)
      });
    }

    console.log(`✅ [Batch ${batchIndex + 1}/${batches.length}] 완료 (누적: ${results.length}/${totalItems})`);

    // 배치 간 딜레이 (Rate Limit 방지)
    if (batchIndex < batches.length - 1) {
      console.log(`⏳ [Batch ${batchIndex + 1}] 다음 배치 전 1초 대기...`);
      await sleep(1000); // 1초 대기
    }
  }

  // 결과를 원래 입력 순서대로 정렬
  results.sort((a, b) => (a.inputIndex || 0) - (b.inputIndex || 0));

  const endTime = Date.now();
  const processingTime = ((endTime - startTime) / 1000).toFixed(1) + 's';

  console.log(`🎉 [dictionaryService] 모든 처리 완료: 성공 ${processedCount}, 실패 ${failedCount}, 소요시간 ${processingTime}`);
  console.log(`📋 [dictionaryService] 결과 순서:`, results.map(r => r.word));

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
