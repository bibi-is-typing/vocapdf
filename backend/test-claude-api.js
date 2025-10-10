/**
 * Claude API Fallback 테스트 스크립트
 *
 * 사용법:
 * 1. .env 파일에 ANTHROPIC_API_KEY 설정
 * 2. node test-claude-api.js 실행
 */

require('dotenv').config();
const { fetchFromClaudeWithRetry, transformClaudeResponse } = require('./src/services/claudeService');
const { extractMeaningsFromClaude } = require('./src/utils/meaningExtractor');

async function testClaudeAPI() {
  console.log('🧪 Claude API Fallback 테스트 시작\n');
  console.log('=' .repeat(60));

  // 테스트 케이스 1: 일반 단어
  console.log('\n✅ 테스트 1: 일반 단어 (apple)');
  try {
    const options = { meanings: 2, definitions: 1, synonyms: 2, antonyms: 1, meaningDisplay: 'both' };
    const result = await fetchFromClaudeWithRetry('apple', 'word', options);

    if (result) {
      console.log('  ✓ Claude API 응답 성공');
      console.log('  - Word:', result.word);
      console.log('  - Meanings:', result.meanings?.length || 0);
      console.log('  - Korean:', result.koreanMeaning);

      const extracted = extractMeaningsFromClaude(result, options);
      console.log('  - Extracted meanings:', extracted.meanings.length);
    } else {
      console.log('  ✗ 응답 없음');
    }
  } catch (error) {
    console.log('  ✗ 에러:', error.message);
  }

  // 테스트 케이스 2: 신조어 (Free Dictionary에 없는 단어)
  console.log('\n✅ 테스트 2: 신조어 (yeet)');
  try {
    const options = { meanings: 1, definitions: 1, synonyms: 0, antonyms: 0, meaningDisplay: 'both' };
    const result = await fetchFromClaudeWithRetry('yeet', 'word', options);

    if (result) {
      console.log('  ✓ Claude API 응답 성공');
      console.log('  - Word:', result.word);
      console.log('  - Korean:', result.koreanMeaning);
      console.log('  - Definition:', result.meanings?.[0]?.definitions?.[0]?.definition);
    } else {
      console.log('  ✗ 응답 없음');
    }
  } catch (error) {
    console.log('  ✗ 에러:', error.message);
  }

  // 테스트 케이스 3: 숙어
  console.log('\n✅ 테스트 3: 숙어 (kick the bucket)');
  try {
    const options = { meanings: 1, definitions: 1, synonyms: 0, antonyms: 0, meaningDisplay: 'both' };
    const result = await fetchFromClaudeWithRetry('kick the bucket', 'phrase', options);

    if (result) {
      console.log('  ✓ Claude API 응답 성공');
      console.log('  - Phrase:', result.word);
      console.log('  - Korean:', result.koreanMeaning);
      console.log('  - Definition:', result.meanings?.[0]?.definitions?.[0]?.definition);
    } else {
      console.log('  ✗ 응답 없음');
    }
  } catch (error) {
    console.log('  ✗ 에러:', error.message);
  }

  // 테스트 케이스 4: 문장 번역
  console.log('\n✅ 테스트 4: 문장 번역');
  try {
    const options = {};
    const result = await fetchFromClaudeWithRetry('She loves reading books.', 'sentence', options);

    if (result) {
      console.log('  ✓ Claude API 응답 성공');
      console.log('  - Original:', result.original);
      console.log('  - Translation:', result.translation);
    } else {
      console.log('  ✗ 응답 없음');
    }
  } catch (error) {
    console.log('  ✗ 에러:', error.message);
  }

  // 테스트 케이스 5: 존재하지 않는 단어
  console.log('\n✅ 테스트 5: 존재하지 않는 단어 (xyzabc123)');
  try {
    const options = { meanings: 1, definitions: 1, meaningDisplay: 'both' };
    const result = await fetchFromClaudeWithRetry('xyzabc123', 'word', options);

    if (result === null) {
      console.log('  ✓ 정상적으로 null 반환 (단어를 찾을 수 없음)');
    } else {
      console.log('  - Result:', result);
    }
  } catch (error) {
    console.log('  ✗ 에러:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ 테스트 완료\n');
}

// 환경 변수 확인
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY가 설정되지 않았습니다.');
  console.error('   .env 파일에 ANTHROPIC_API_KEY를 추가해주세요.\n');
  process.exit(1);
}

// 테스트 실행
testClaudeAPI().catch(error => {
  console.error('\n❌ 테스트 실패:', error);
  process.exit(1);
});
