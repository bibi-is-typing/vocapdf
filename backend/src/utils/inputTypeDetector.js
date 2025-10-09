/**
 * 입력 유형 자동 감지 유틸리티
 *
 * 단어, 숙어, 문장을 자동으로 구분합니다.
 */

/**
 * 입력 텍스트의 유형을 감지합니다
 *
 * @param {string} input - 감지할 입력 텍스트
 * @returns {'word'|'phrase'|'sentence'} 입력 유형
 */
function detectInputType(input) {
  const trimmed = input.trim();
  const wordCount = trimmed.split(/\s+/).length;

  // 문장: 대문자 시작 + 문장 부호 끝 + 3개 이상의 단어
  if (
    /^[A-Z]/.test(trimmed) &&
    /[.!?]$/.test(trimmed) &&
    wordCount >= 3
  ) {
    return 'sentence';
  }

  // 숙어: 2~5개 단어로 구성된 구 (관용구 패턴)
  // 예: "kick the bucket", "break the ice", "piece of cake"
  if (wordCount >= 2 && wordCount <= 5) {
    // 전치사나 관사가 포함된 경우 숙어로 판단
    const commonPhraseWords = /\b(a|an|the|of|in|on|at|to|for|with|by|from)\b/i;
    if (commonPhraseWords.test(trimmed)) {
      return 'phrase';
    }

    // 하이픈으로 연결된 복합어는 단어로 처리
    // 예: "mother-in-law", "well-known"
    if (wordCount === 1 || /^\w+(-\w+)+$/.test(trimmed)) {
      return 'word';
    }

    // 2개 단어로만 구성되고 전치사/관사가 없으면 숙어로 처리
    // 예: "give up", "look after"
    return 'phrase';
  }

  // 단어: 공백 없음 또는 하이픈으로 연결된 복합어
  return 'word';
}

/**
 * 여러 입력을 배치로 분류합니다
 *
 * @param {Array<string>} inputs - 입력 배열
 * @returns {Object} 유형별로 그룹화된 객체
 */
function categorizeInputs(inputs) {
  const categorized = {
    words: [],
    phrases: [],
    sentences: []
  };

  inputs.forEach(input => {
    const type = detectInputType(input);
    const trimmed = input.trim();

    const item = {
      original: trimmed,
      normalized: trimmed.toLowerCase(),
      type: type
    };

    if (type === 'word') {
      categorized.words.push(item);
    } else if (type === 'phrase') {
      categorized.phrases.push(item);
    } else {
      categorized.sentences.push(item);
    }
  });

  return categorized;
}

/**
 * 입력 유형에 대한 통계를 반환합니다
 *
 * @param {Object} categorized - categorizeInputs의 결과
 * @returns {Object} 통계 정보
 */
function getTypeStats(categorized) {
  return {
    total: categorized.words.length + categorized.phrases.length + categorized.sentences.length,
    words: categorized.words.length,
    phrases: categorized.phrases.length,
    sentences: categorized.sentences.length
  };
}

module.exports = {
  detectInputType,
  categorizeInputs,
  getTypeStats
};
