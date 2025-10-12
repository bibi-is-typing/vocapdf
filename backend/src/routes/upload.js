const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const os = require('os');
const { MAX_FILE_SIZE } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');
const { parseTextFile, parseNumbersFile, sanitizeWords } = require('../utils/fileParser');

/**
 * cat-numbers 명령어가 사용 가능한지 확인
 * @returns {boolean}
 */
function isCatNumbersAvailable() {
  // 1. 환경 변수 경로 확인
  if (process.env.CAT_NUMBERS_PATH) {
    try {
      execSync(`"${process.env.CAT_NUMBERS_PATH}" --version`, { stdio: 'pipe' });
      return true;
    } catch (e) {
      // 환경 변수 경로가 잘못됨, 계속 진행
    }
  }

  // 2. 시스템 PATH 확인
  try {
    execSync('which cat-numbers', { stdio: 'pipe' });
    return true;
  } catch (e) {
    // PATH에 없음, 계속 진행
  }

  // 3. 일반적인 경로들 확인
  const homeDir = os.homedir();
  const commonPaths = [
    '/usr/local/bin/cat-numbers',
    `${homeDir}/.local/bin/cat-numbers`,
    `${homeDir}/Library/Python/3.9/bin/cat-numbers`,
    `${homeDir}/Library/Python/3.10/bin/cat-numbers`,
    `${homeDir}/Library/Python/3.11/bin/cat-numbers`,
    `${homeDir}/Library/Python/3.12/bin/cat-numbers`,
  ];

  for (const cmdPath of commonPaths) {
    if (fs.existsSync(cmdPath)) {
      try {
        execSync(`"${cmdPath}" --version`, { stdio: 'pipe' });
        return true;
      } catch (e) {
        // 경로는 존재하지만 실행 불가, 계속 진행
      }
    }
  }

  return false;
}

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

    // Numbers 파일은 조건부 지원 (cat-numbers 설치 필요)
    if (ext === '.numbers') {
      if (isCatNumbersAvailable()) {
        cb(null, true);
      } else {
        cb(new AppError(
          'Numbers 파일을 지원하지 않습니다. txt 또는 csv 파일을 사용해주세요.',
          400,
          'NUMBERS_NOT_SUPPORTED'
        ), false);
      }
      return;
    }

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError('지원하지 않는 파일 형식입니다', 400, 'INVALID_FILE_TYPE'), false);
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

    const ext = path.extname(req.file.originalname).toLowerCase();
    let words;

    // 파일 형식에 따라 다른 파싱 방식 사용
    if (ext === '.numbers') {
      // Numbers 파일은 바이너리이므로 buffer를 직접 전달
      words = parseNumbersFile(req.file.buffer);
    } else {
      // 텍스트 파일은 문자열로 변환
      const content = req.file.buffer.toString('utf-8');
      words = parseTextFile(content, req.file.originalname);
    }

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
