const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { MAX_FILE_SIZE } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');
const { parseTextFile, sanitizeWords } = require('../utils/fileParser');

// Multer 설정 (메모리 저장소 사용 - 임시 파일 불필요)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.txt', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError('지원하지 않는 파일 형식입니다. txt 또는 csv 파일을 사용해주세요.', 400, 'INVALID_FILE_TYPE'), false);
    }
  }
});

/**
 * POST /api/upload
 * 파일을 업로드하고 단어 배열을 반환
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('파일이 업로드되지 않았습니다', 400, 'INVALID_REQUEST');
    }

    // 텍스트 파일 파싱
    const content = req.file.buffer.toString('utf-8');
    const words = parseTextFile(content, req.file.originalname);

    // 단어 정제
    const sanitized = sanitizeWords(words);

    if (sanitized.length === 0) {
      throw new AppError('유효한 단어를 찾을 수 없습니다', 422, 'VALIDATION_ERROR');
    }

    res.json({
      success: true,
      data: {
        words: sanitized,
        count: sanitized.length,
        filename: req.file.originalname
      }
    });
  } catch (error) {
    next(error);
  }
});

// Multer 에러 핸들링
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('파일 크기가 5MB를 초과했습니다', 413, 'FILE_TOO_LARGE'));
    }
    return next(new AppError(error.message, 400, 'FILE_UPLOAD_ERROR'));
  }
  next(error);
});

module.exports = router;
