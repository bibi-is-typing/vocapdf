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
 * 단어 배열을 정제 (중복 제거, 소문자 변환 등)
 *
 * @param {Array<string>} words - 단어 배열
 * @returns {Array<string>} 정제된 단어 배열
 */
function sanitizeWords(words) {
  // 중복 제거 및 소문자 변환
  const uniqueWords = [...new Set(words.map((word) => word.toLowerCase()))];

  // 영문자만 포함된 단어만 필터링
  const validWords = uniqueWords.filter((word) => /^[a-z]+$/.test(word));

  return validWords;
}

module.exports = {
  parseTextFile,
  sanitizeWords
};
