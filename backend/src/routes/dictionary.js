const express = require('express');
const router = express.Router();
const dictionaryService = require('../services/dictionaryService');
const { AppError } = require('../middleware/errorHandler');
const { MAX_WORDS } = require('../config/constants');

/**
 * POST /api/dictionary/lookup
 * 여러 단어를 조회하고 가공된 결과를 반환
 */
router.post('/lookup', async (req, res, next) => {
  try {
    const { words, options } = req.body;

    // 요청 유효성 검증
    if (!words || !Array.isArray(words) || words.length === 0) {
      throw new AppError('words 배열이 필요합니다', 400, 'INVALID_REQUEST');
    }

    if (words.length > MAX_WORDS) {
      throw new AppError(
        `단어 개수가 최대 허용치(${MAX_WORDS}개)를 초과했습니다`,
        422,
        'VALIDATION_ERROR'
      );
    }

    if (!options || typeof options !== 'object') {
      throw new AppError('options 객체가 필요합니다', 400, 'INVALID_REQUEST');
    }

    // 옵션 기본값 설정 (유연한 처리)
    const normalizedOptions = {
      meanings: options.meanings || 1,
      definitions: options.definitions || 1,
      synonyms: options.synonyms || 0,
      antonyms: options.antonyms || 0,
      related: options.related || 0,
      meaningDisplay: options.meaningDisplay || 'english',
      outputFormat: options.outputFormat || 'input-order',
      cefrLevel: options.cefrLevel || 'A2' // CEFR 레벨 추가
    };

    // meanings 값 검증
    if (normalizedOptions.meanings < 1 || normalizedOptions.meanings > 2) {
      normalizedOptions.meanings = 1; // 기본값으로 설정
    }

    // 단어 조회 및 가공
    const result = await dictionaryService.lookupWords(words, normalizedOptions);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
