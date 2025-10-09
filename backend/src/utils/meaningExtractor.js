/**
 * Free Dictionary API 응답에서 의미를 추출하고 가공하는 유틸리티
 *
 * 참조: .claude/03_pdf_spec/03_meaning_handling.md
 */

/**
 * API 응답 데이터에서 사용자 옵션에 맞게 의미를 추출
 *
 * @param {Object} apiData - Free Dictionary API 응답 데이터 (배열의 첫 번째 요소)
 * @param {Object} options - 사용자 선택 옵션
 * @param {number} options.meanings - 추출할 의미 개수 (1 또는 2)
 * @param {number} options.definitions - 추출할 영영뜻 개수 (0, 1, 2)
 * @param {number} options.synonyms - 추출할 유의어 개수 (0, 1, 2)
 * @param {number} options.antonyms - 추출할 반의어 개수 (0, 1, 2)
 * @param {number} options.related - 추출할 관계어 개수 (0, 1, 2)
 * @param {string} options.meaningDisplay - 의미 표시 옵션 ('english-only', 'korean-only', 'both')
 * @returns {Object} 가공된 단어 데이터
 */
function extractMeanings(apiData, options) {
  const word = apiData.word;
  const allMeanings = apiData.meanings || [];

  const result = {
    word: word,
    meanings: []
  };

  // 추출할 의미 개수 결정 (사용자 요청 vs API 제공 중 작은 값)
  const meaningsCount = Math.min(options.meanings, allMeanings.length);

  // 의미별로 순회하며 데이터 추출
  for (let i = 0; i < meaningsCount; i++) {
    const meaning = allMeanings[i];
    const definitions = meaning.definitions || [];

    // 첫 번째 definition을 기본으로 사용 (대부분의 경우 가장 일반적인 의미)
    const firstDefinition = definitions[0] || {};

    // 의미 객체 구성
    const meaningData = {
      meaningNumber: i + 1,
      partOfSpeech: meaning.partOfSpeech || ''
    };

    // meaningDisplay 옵션에 따라 영영뜻 포함 여부 결정
    if (options.meaningDisplay !== 'korean-only') {
      meaningData.definition = firstDefinition.definition || '';
    }

    // meaningDisplay 옵션에 따라 한영 뜻 포함 여부 결정
    // 주의: Free Dictionary API는 한국어 번역을 제공하지 않음
    // Lingua Robot API를 사용해야 함
    if (options.meaningDisplay !== 'english-only') {
      meaningData.meaning = ''; // Lingua Robot API에서 제공
    }

    meaningData.synonyms = extractArray(firstDefinition.synonyms, options.synonyms);
    meaningData.antonyms = extractArray(firstDefinition.antonyms, options.antonyms);
    meaningData.related = []; // Free Dictionary API는 관계어를 직접 제공하지 않음

    result.meanings.push(meaningData);
  }

  return result;
}

/**
 * 배열에서 지정된 개수만큼 요소를 추출
 *
 * @param {Array} array - 원본 배열
 * @param {number} count - 추출할 개수
 * @returns {Array} 추출된 배열
 */
function extractArray(array, count) {
  if (!array || !Array.isArray(array)) {
    return [];
  }
  return array.slice(0, count);
}

/**
 * 여러 definition에서 유의어/반의어를 수집
 * (단어에 따라 여러 definition에 분산되어 있을 수 있음)
 *
 * @param {Array} definitions - definition 배열
 * @param {number} count - 추출할 개수
 * @param {string} type - 'synonyms' 또는 'antonyms'
 * @returns {Array} 수집된 배열
 */
function collectFromDefinitions(definitions, count, type) {
  const collected = [];

  for (const def of definitions) {
    if (!def[type]) continue;

    for (const item of def[type]) {
      if (collected.length >= count) break;
      if (!collected.includes(item)) {
        collected.push(item);
      }
    }

    if (collected.length >= count) break;
  }

  return collected;
}

/**
 * API 응답이 올바른 형식인지 검증
 *
 * @param {*} data - 검증할 데이터
 * @returns {boolean} 유효성 여부
 */
function validateApiResponse(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!data.word || typeof data.word !== 'string') {
    return false;
  }

  if (!data.meanings || !Array.isArray(data.meanings)) {
    return false;
  }

  return true;
}

module.exports = {
  extractMeanings,
  extractArray,
  collectFromDefinitions,
  validateApiResponse
};
