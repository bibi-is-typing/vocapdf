const axios = require('axios');
const { OXFORD_APP_ID, OXFORD_APP_KEY, API_TIMEOUT, MAX_RETRIES, RETRY_DELAY } = require('../config/constants');

/**
 * Oxford Dictionaries API 서비스
 *
 * CEFR 레벨별 정의를 제공하는 고급 사전 API
 * - A2, B1, B2, C1 레벨별 정의 지원
 * - 음성, 예문, 동의어, 반의어 제공
 */

const OXFORD_BASE_URL = 'https://od-api-sandbox.oxforddictionaries.com/api/v2';

/**
 * Oxford API로 단어 조회 (CEFR 레벨별 정의)
 *
 * @param {string} word - 조회할 단어
 * @param {string} cefrLevel - CEFR 레벨 (A2, B1, B2, C1)
 * @returns {Promise<Object|null>} Oxford API 응답 데이터
 */
async function fetchFromOxfordAPI(word, cefrLevel = 'B1') {
  if (!OXFORD_APP_ID || !OXFORD_APP_KEY) {
    console.warn('⚠️ Oxford API credentials not configured');
    return null;
  }

  const url = `${OXFORD_BASE_URL}/entries/en-us/${word.toLowerCase()}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'app_id': OXFORD_APP_ID,
        'app_key': OXFORD_APP_KEY
      },
      timeout: API_TIMEOUT,
      validateStatus: (status) => status === 200 || status === 404
    });

    if (response.status === 404) {
      console.log(`  [${word}] Oxford API: Not found (404)`);
      return null;
    }

    if (!response.data || !response.data.results) {
      console.log(`  [${word}] Oxford API: Invalid response structure`);
      return null;
    }

    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      console.error(`  [${word}] ❌ Oxford API: Authentication failed (403)`);
    } else if (error.response?.status === 414) {
      console.error(`  [${word}] ❌ Oxford API: URL too long (414)`);
    } else if (error.response?.status === 429) {
      console.error(`  [${word}] ❌ Oxford API: Rate limit exceeded (429)`);
    } else {
      console.error(`  [${word}] ❌ Oxford API error:`, error.message);
    }
    throw error;
  }
}

/**
 * 재시도 로직이 포함된 Oxford API 조회
 *
 * @param {string} word - 조회할 단어
 * @param {string} cefrLevel - CEFR 레벨
 * @returns {Promise<Object|null>}
 */
async function fetchFromOxfordWithRetry(word, cefrLevel = 'B1') {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await fetchFromOxfordAPI(word, cefrLevel);
      return result;
    } catch (error) {
      lastError = error;

      // 403, 414는 재시도해도 소용없음
      if (error.response?.status === 403 || error.response?.status === 414) {
        console.error(`  [${word}] Oxford API: Non-retryable error (${error.response.status})`);
        return null;
      }

      // 마지막 시도가 아니면 대기 후 재시도
      if (attempt < MAX_RETRIES) {
        console.log(`  [${word}] Retrying Oxford API (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        await sleep(RETRY_DELAY);
      }
    }
  }

  console.error(`  [${word}] All Oxford API retries failed`);
  return null;
}

/**
 * Oxford API 응답을 공통 포맷으로 변환
 *
 * @param {Object} oxfordData - Oxford API 응답
 * @param {string} cefrLevel - CEFR 레벨
 * @returns {Object} 변환된 데이터
 */
function transformOxfordResponse(oxfordData, cefrLevel = 'B1') {
  if (!oxfordData || !oxfordData.results || oxfordData.results.length === 0) {
    return null;
  }

  const result = oxfordData.results[0];
  const lexicalEntries = result.lexicalEntries || [];

  const word = result.word || result.id;
  const meanings = [];

  // 각 lexicalEntry (품사별) 순회
  for (const entry of lexicalEntries) {
    const partOfSpeech = entry.lexicalCategory?.text || '';
    const senses = entry.entries?.[0]?.senses || [];

    // CEFR 레벨에 맞는 정의 필터링
    const filteredSenses = senses.filter(sense => {
      // CEFR 레벨 정보가 있는 경우 필터링
      if (sense.registers) {
        const hasLevel = sense.registers.some(reg =>
          reg.id === cefrLevel.toLowerCase() || reg.text === cefrLevel
        );
        return hasLevel;
      }
      // CEFR 정보가 없으면 모두 포함 (기본 정의로 간주)
      return true;
    });

    // 정의 추출
    const sensesToUse = filteredSenses.length > 0 ? filteredSenses : senses;

    for (const sense of sensesToUse.slice(0, 1)) { // 첫 번째 정의만
      const definitions = sense.definitions || [];
      const examples = sense.examples || [];
      const synonyms = sense.synonyms || [];
      const antonyms = sense.antonyms || [];

      meanings.push({
        partOfSpeech: partOfSpeech,
        definitions: definitions.map(def => ({
          definition: def,
          example: examples[0]?.text || ''
        })),
        synonyms: synonyms.map(syn => syn.text).slice(0, 3),
        antonyms: antonyms.map(ant => ant.text).slice(0, 3)
      });
    }
  }

  // 발음 정보 추출
  const pronunciations = result.lexicalEntries?.[0]?.entries?.[0]?.pronunciations || [];
  const phonetic = pronunciations.find(p => p.phoneticNotation === 'IPA')?.phoneticSpelling || '';

  return {
    word: word,
    phonetic: phonetic,
    meanings: meanings,
    cefrLevel: cefrLevel,
    source: 'oxford-api'
  };
}

/**
 * 지연 함수
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  fetchFromOxfordAPI,
  fetchFromOxfordWithRetry,
  transformOxfordResponse
};
