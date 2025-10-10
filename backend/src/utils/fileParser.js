/**
 * 업로드된 파일에서 단어를 추출하는 유틸리티
 */

/**
 * 텍스트 파일 내용을 파싱하여 단어 배열 반환
 *
 * @param {string} content - 파일 내용 (문자열)
 * @param {string} filename - 파일명
 * @returns {Array<string>} 추출된 단어 배열
 */
function parseTextFile(content, filename) {
  const ext = filename.split('.').pop().toLowerCase();

  let words = [];

  switch (ext) {
    case 'txt':
    case 'md':
      // 줄바꿈, 쉼표, 세미콜론으로 구분
      words = content
        .split(/[\n,;]+/)
        .map((word) => word.trim())
        .filter((word) => word.length > 0);
      break;

    case 'csv':
      // CSV는 쉼표로 구분 (간단한 파싱)
      words = content
        .split(/[,\n]+/)
        .map((word) => word.trim())
        .filter((word) => word.length > 0);
      break;

    default:
      // 지원하지 않는 형식
      throw new Error(`지원하지 않는 파일 형식입니다: ${ext}`);
  }

  return words;
}

/**
 * 단어 배열을 정제 (중복 제거, 정규화)
 *
 * @param {Array<string>} words - 단어 배열
 * @returns {Array<string>} 정제된 단어 배열
 */
function sanitizeWords(words) {
  console.log('🔍 [fileParser] 원본 입력:', words.slice(0, 10));

  // 중복 제거 (대소문자 구분 유지 - 문장 감지를 위해)
  const uniqueWords = [...new Set(words)];

  // 영문자, 공백, 구두점 포함 (숙어/문장 지원)
  // 변경 전: /^[a-z]+$/ (단어만)
  // 변경 후: /^[a-zA-Z\s.!?,'-]+$/ (단어+숙어+문장)
  const validWords = uniqueWords.filter((word) => /^[a-zA-Z\s.!?,'-]+$/.test(word));

  console.log('✅ [fileParser] 정제된 입력:', validWords.slice(0, 10));
  console.log('📊 [fileParser] 통계:', {
    원본개수: words.length,
    중복제거후: uniqueWords.length,
    유효한입력: validWords.length,
    제거된개수: words.length - validWords.length
  });

  return validWords;
}

module.exports = {
  parseTextFile,
  sanitizeWords
};
