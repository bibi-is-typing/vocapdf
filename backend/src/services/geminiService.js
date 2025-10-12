const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY, API_TIMEOUT } = require('../config/constants');

/**
 * Gemini API 클라이언트 초기화
 */
let genAI = null;

function getGeminiClient() {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }

  return genAI;
}

/**
 * Gemini API로 단어/숙어 정의 조회
 *
 * @param {string} input - 조회할 단어/숙어
 * @param {string} type - 입력 유형 ('word', 'phrase', 'sentence')
 * @param {Object} options - 사용자 옵션
 * @returns {Promise<Object>} 표준화된 사전 데이터
 */
async function fetchFromGemini(input, type, options = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // CEFR 레벨에 맞는 설명 지시사항
    const cefrInstructions = {
      A2: 'Use very basic vocabulary (A2 level). Explain with simple, everyday words that elementary learners understand. Keep sentences short (5-10 words).',
      B1: 'Use common vocabulary (B1 level). Explain with clear, everyday language that intermediate learners use. Use moderate sentence length (10-15 words).',
      B2: 'Use varied vocabulary (B2 level). Provide detailed explanations with a wider range of words. Use natural, fluent expressions.',
      C1: 'Use sophisticated vocabulary (C1 level). Give precise, academic definitions with advanced terminology and complex structures.'
    };

    const cefrLevel = options.cefrLevel || 'B1';
    const cefrInstruction = cefrInstructions[cefrLevel] || cefrInstructions.B1;

    // 타입에 따라 다른 프롬프트 생성
    let prompt;

    if (type === 'sentence') {
      // 문장 활용 예시 및 비슷한 표현
      prompt = `You are an English learning assistant. For the following English sentence, provide ONLY the most commonly used similar expression.

Sentence: "${input}"

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "original": "${input}",
  "examples": [],
  "similarExpressions": [
    "The MOST commonly used similar expression"
  ]
}

CRITICAL REQUIREMENTS:
- Provide ONLY 1 similar expression (no usage examples)
- The similar expression must be SHORT, SIMPLE, and PRACTICAL
- Use everyday conversational English (5-10 words maximum)
- Examples:
  * "May I speak to you in private?" → "Can we talk privately?"
  * "How are you doing?" → "How's it going?"
  * "I appreciate your help" → "Thanks for your help"
- Make sure all expressions are in English only
- DO NOT include long explanations or context`;
    } else if (type === 'phrase') {
      // 숙어
      prompt = `You are a dictionary API for English learners at CEFR ${cefrLevel} level. ${cefrInstruction}

Provide the definition and meaning of the following English idiom/phrase in JSON format.

Idiom: "${input}"

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "word": "${input}",
  "phonetic": "pronunciation if available",
  "meanings": [
    {
      "partOfSpeech": "idiom",
      "definitions": [
        {
          "definition": "English definition of the idiom",
          "example": "Example sentence using the idiom"
        }
      ],
      "synonyms": ["synonym1", "synonym2"],
      "antonyms": []
    }
  ],
  "koreanMeaning": "Korean translation of the idiom"
}

If you don't know the idiom, return:
{
  "error": "Definition not found"
}`;
    } else {
      // 단어
      prompt = `You are a dictionary API for English learners at CEFR ${cefrLevel} level. ${cefrInstruction}

Provide the definition of the following English word in JSON format.

Word: "${input}"

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "word": "${input}",
  "phonetic": "pronunciation",
  "meanings": [
    {
      "partOfSpeech": "noun/verb/adjective/etc",
      "definitions": [
        {
          "definition": "English definition",
          "example": "Example sentence"
        }
      ],
      "synonyms": ["synonym1", "synonym2"],
      "antonyms": ["antonym1", "antonym2"]
    }
  ],
  "koreanMeaning": "Korean translation"
}

Provide ${options.meanings || 2} meanings if available. If you don't know the word, return:
{
  "error": "Definition not found"
}`;
    }

    // Gemini API 호출
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();

    // 문장 예시의 경우
    if (type === 'sentence') {
      let jsonData;
      try {
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        jsonData = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error(`  [${input}] ❌ Gemini JSON parse error:`, content.substring(0, 200));
        return {
          original: input,
          examples: [],
          similarExpressions: []
        };
      }

      return {
        original: jsonData.original || input,
        examples: jsonData.examples || [],
        similarExpressions: jsonData.similarExpressions || []
      };
    }

    let jsonData;
    try {
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      jsonData = JSON.parse(cleanedContent);
    } catch (parseError) {
      throw new Error('Failed to parse Gemini API response');
    }

    // 에러 응답 체크
    if (jsonData.error) {
      return null;
    }

    return jsonData;

  } catch (error) {
    console.error(`  [${input}] ❌ Gemini API error:`, error.message);
    throw error;
  }
}

/**
 * Gemini API 응답을 Free Dictionary API 형식으로 변환
 *
 * @param {Object} geminiData - Gemini API 응답
 * @param {string} type - 입력 유형
 * @param {Object} options - 사용자 옵션
 * @returns {Object} Free Dictionary API 형식의 데이터
 */
function transformGeminiResponse(geminiData, type, options) {
  if (type === 'sentence') {
    // 문장 활용 예시 응답
    return {
      original: geminiData.original || '',
      examples: geminiData.examples || [],
      similarExpressions: geminiData.similarExpressions || []
    };
  }

  // 단어/숙어 사전 응답 변환
  const transformed = {
    word: geminiData.word || '',
    phonetic: geminiData.phonetic || '',
    meanings: []
  };

  if (geminiData.meanings && Array.isArray(geminiData.meanings)) {
    // meanings 개수 제한
    const limitedMeanings = geminiData.meanings.slice(0, options.meanings || 2);

    limitedMeanings.forEach(meaning => {
      const meaningObj = {
        partOfSpeech: meaning.partOfSpeech || '',
        definitions: []
      };

      // definitions 처리
      if (meaning.definitions && Array.isArray(meaning.definitions)) {
        const limitedDefs = meaning.definitions.slice(0, options.definitions || 1);
        meaningObj.definitions = limitedDefs.map(def => ({
          definition: def.definition || '',
          example: def.example || ''
        }));
      }

      // synonyms, antonyms 처리
      if (meaning.synonyms && options.synonyms > 0) {
        meaningObj.synonyms = meaning.synonyms.slice(0, options.synonyms);
      } else {
        meaningObj.synonyms = [];
      }

      if (meaning.antonyms && options.antonyms > 0) {
        meaningObj.antonyms = meaning.antonyms.slice(0, options.antonyms);
      } else {
        meaningObj.antonyms = [];
      }

      transformed.meanings.push(meaningObj);
    });
  }

  // 한국어 의미 추가 (별도 필드로 저장)
  if (geminiData.koreanMeaning) {
    transformed.koreanMeaning = geminiData.koreanMeaning;
  }

  return transformed;
}

/**
 * 재시도 로직이 포함된 Gemini API 호출
 *
 * @param {string} input - 조회할 입력
 * @param {string} type - 입력 유형
 * @param {Object} options - 사용자 옵션
 * @returns {Promise<Object|null>} API 응답 데이터 또는 null
 */
async function fetchFromGeminiWithRetry(input, type, options) {
  const MAX_RETRIES = 2; // Gemini는 무료이므로 재시도 2회
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await fetchFromGemini(input, type, options);
      return result;
    } catch (error) {
      lastError = error;

      // API 키 오류는 재시도하지 않음
      if (error.message.includes('API key')) {
        throw error;
      }

      if (attempt < MAX_RETRIES) {
        console.log(`  [${input}] Retrying Gemini API (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        await sleep(500);
      } else {
        console.error(`  [${input}] All Gemini API retries failed:`, error.message);
      }
    }
  }

  throw lastError;
}

/**
 * 지연 함수
 *
 * @param {number} ms - 대기 시간 (밀리초)
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  fetchFromGemini,
  fetchFromGeminiWithRetry,
  transformGeminiResponse
};
