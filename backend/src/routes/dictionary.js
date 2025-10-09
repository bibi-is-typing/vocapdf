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

    // options 필드 검증
    const requiredFields = ['meanings', 'definitions', 'synonyms', 'antonyms', 'related'];
    for (const field of requiredFields) {
      if (typeof options[field] !== 'number') {
        throw new AppError(
          `options.${field}는 숫자여야 합니다`,
          400,
          'INVALID_REQUEST'
        );
      }
    }

    // options 값 범위 검증
    if (options.meanings < 1 || options.meanings > 2) {
      throw new AppError('meanings는 1 또는 2여야 합니다', 422, 'VALIDATION_ERROR');
    }

    if (
      options.definitions < 0 ||
      options.definitions > 2 ||
      options.synonyms < 0 ||
      options.synonyms > 2 ||
      options.antonyms < 0 ||
      options.antonyms > 2 ||
      options.related < 0 ||
      options.related > 2
    ) {
      throw new AppError(
        'definitions, synonyms, antonyms, related는 0, 1, 또는 2여야 합니다',
        422,
        'VALIDATION_ERROR'
      );
    }

    // 단어 조회 및 가공
    const result = await dictionaryService.lookupWords(words, options);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
