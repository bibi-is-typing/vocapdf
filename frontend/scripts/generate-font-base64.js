#!/usr/bin/env node

/**
 * Pretendard 폰트를 Base64로 인코딩하여 JavaScript 모듈로 생성
 *
 * 사용법:
 *   node scripts/generate-font-base64.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONT_DIR = path.join(__dirname, '../public/fonts');
const OUTPUT_DIR = path.join(__dirname, '../src/utils');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'pretendardFont.js');

// TTF 파일 읽기
const fontPath = path.join(FONT_DIR, 'Pretendard-Regular.ttf');

if (!fs.existsSync(fontPath)) {
  console.error(`❌ 폰트 파일을 찾을 수 없습니다: ${fontPath}`);
  console.error('먼저 폰트를 다운로드해주세요.');
  process.exit(1);
}

console.log('📦 폰트 파일 읽는 중...');
const fontBuffer = fs.readFileSync(fontPath);

console.log(`📏 파일 크기: ${(fontBuffer.length / 1024).toFixed(2)} KB`);

console.log('🔄 Base64 인코딩 중...');
const fontBase64 = fontBuffer.toString('base64');

console.log(`📊 Base64 크기: ${(fontBase64.length / 1024).toFixed(2)} KB`);

// JavaScript 모듈 생성
const outputContent = `/**
 * Pretendard Regular 폰트 (Base64)
 *
 * 자동 생성됨: ${new Date().toISOString()}
 * 원본 파일: Pretendard-Regular.ttf
 *
 * 이 파일은 수동으로 편집하지 마세요.
 * 재생성하려면: npm run generate-font
 */

export const pretendardRegularBase64 = '${fontBase64}';

export const pretendardFontName = 'Pretendard';
export const pretendardFontFile = 'Pretendard-Regular.ttf';
`;

// 출력 디렉토리 확인 및 생성
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('💾 JavaScript 파일 생성 중...');
fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf8');

console.log(`✅ 완료! 생성된 파일: ${OUTPUT_FILE}`);
console.log(`📦 최종 파일 크기: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB`);
console.log('');
console.log('사용 예시:');
console.log('  import { pretendardRegularBase64, pretendardFontName, pretendardFontFile } from "./utils/pretendardFont";');
