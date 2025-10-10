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

  // 문장: 문장 부호로 끝나고 3개 이상의 단어 (대문자 시작 조건 제거)
  // 예: "How are you?", "how are you?", "I love you."
  if (/[.!?]$/.test(trimmed) && wordCount >= 3) {
    return 'sentence';
  }

  // 숙어: 2~5개 단어로 구성된 구 (관용구 패턴)
  // 예: "kick the bucket", "break the ice", "piece of cake"
  if (wordCount >= 2 && wordCount <= 5) {
    // 하이픈으로 연결된 복합어는 단어로 처리
    // 예: "mother-in-law", "well-known"
    if (wordCount === 1 || /^\w+(-\w+)+$/.test(trimmed)) {
      return 'word';
    }

    // 문장 부호가 없으면 숙어로 처리
    // 예: "give up", "look after", "break the ice"
    if (!/[.!?]$/.test(trimmed)) {
      return 'phrase';
    }

    // 여기까지 왔다면 짧은 문장 (위에서 이미 처리됨)
    return 'sentence';
  }

  // 단어: 공백 없음 또는 하이픈으로 연결된 복합어
  return 'word';
}

/**
 * 여러 입력을 배치로 분류합니다
 *
 * @param {Array<string>} inputs - 입력 배열
 * @returns {Object} 유형별로 그룹화된 객체 + 순서 보존용 allItems 배열
 */
function categorizeInputs(inputs) {
  const categorized = {
    words: [],
    phrases: [],
    sentences: [],
    allItems: [] // 순서를 유지하는 전체 항목 배열
  };

  // 중복 제거: 첫 번째 등장만 유지
  const seen = new Set();
  const uniqueInputs = [];

  inputs.forEach(input => {
    const trimmed = input.trim();
    const normalized = trimmed.toLowerCase();

    // 중복 체크 (대소문자 구분 없이)
    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueInputs.push(trimmed);
    }
  });

  uniqueInputs.forEach((input, index) => {
    const type = detectInputType(input);
    const trimmed = input.trim();

    const item = {
      original: trimmed,
      normalized: trimmed.toLowerCase(),
      type: type,
      inputIndex: index // 원래 입력 순서 저장
    };

    // 타입별 분류
    if (type === 'word') {
      categorized.words.push(item);
    } else if (type === 'phrase') {
      categorized.phrases.push(item);
    } else if (type === 'sentence') {
      categorized.sentences.push(item);
    }

    // 전체 항목 배열에 추가 (순서 유지)
    categorized.allItems.push(item);
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
