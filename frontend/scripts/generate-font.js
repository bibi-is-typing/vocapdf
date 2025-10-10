import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 폰트 파일 경로
const fontPath = path.join(__dirname, '../public/fonts/NotoSansKR-Regular.ttf');
const outputPath = path.join(__dirname, '../src/utils/notoSansFont.js');

// 폰트 파일을 base64로 변환
const fontBuffer = fs.readFileSync(fontPath);
const base64Font = fontBuffer.toString('base64');

// JavaScript 파일로 저장
const content = `// Auto-generated Noto Sans KR font file
export const notoSansFontName = 'NotoSansKR';
export const notoSansFontFile = 'NotoSansKR-Regular.ttf';
export const notoSansRegularBase64 = '${base64Font}';
`;

fs.writeFileSync(outputPath, content, 'utf-8');
console.log('✅ Pretendard 폰트 파일 생성 완료:', outputPath);
console.log('📦 파일 크기:', Math.round(base64Font.length / 1024), 'KB');
