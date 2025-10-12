/**
 * 업로드된 파일에서 단어를 추출하는 유틸리티
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

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
      // 줄바꿈으로만 구분 (한 줄에 하나씩)
      words = content
        .split(/\n+/)
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
 * Numbers 파일을 파싱하여 단어 배열 반환
 *
 * @param {Buffer} buffer - Numbers 파일 버퍼
 * @returns {Array<string>} 추출된 단어 배열
 */
function parseNumbersFile(buffer) {
  let tempFilePath = null;

  try {
    // 임시 파일 생성
    tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.numbers`);
    fs.writeFileSync(tempFilePath, buffer);

    // Python cat-numbers 명령 실행
    const catNumbersPath = '/Users/hanbi/Library/Python/3.9/bin/cat-numbers';
    const output = execSync(`"${catNumbersPath}" "${tempFilePath}"`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024 // 10MB
    });

    // 출력 파싱: "파일명: 시트명: 테이블명: 단어" 형식
    // 마지막 콜론 뒤의 내용만 추출
    const words = output
      .split('\n')
      .map((line) => {
        const lastColonIndex = line.lastIndexOf(':');
        if (lastColonIndex === -1) return '';
        return line.substring(lastColonIndex + 1).trim();
      })
      .filter((word) => word.length > 0);

    return words;
  } catch (error) {
    throw new Error(`Numbers 파일 파싱 오류: ${error.message}`);
  } finally {
    // 임시 파일 삭제
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}

/**
 * 단어 배열을 정제 (중복 제거, 정규화)
 *
 * @param {Array<string>} words - 단어 배열
 * @returns {Array<string>} 정제된 단어 배열
 */
function sanitizeWords(words) {
  const uniqueWords = [...new Set(words)];
  // 영문자, 숫자, 공백, 일반적인 문장부호 허용
  const validWords = uniqueWords.filter((word) => /^[\w\s.!?,'-:+%/()]+$/.test(word));
  return validWords;
}

module.exports = {
  parseTextFile,
  parseNumbersFile,
  sanitizeWords
};
