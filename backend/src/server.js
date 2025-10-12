require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const { PORT } = require('./config/constants');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 라우트 import
const dictionaryRoutes = require('./routes/dictionary');
const uploadRoutes = require('./routes/upload');

// Express 앱 생성
const app = express();

// 미들웨어 설정
// CORS 설정
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['https://vocapdf.com'];

app.use(cors({
  origin: function(origin, callback) {
    // origin이 없는 경우 허용 (서버 간 통신, curl 등)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 파싱

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

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'VocaPDF Backend is running',
    timestamp: new Date().toISOString(),
    features: {
      numbersFileSupport: isCatNumbersAvailable()
    }
  });
});

// API 라우트 등록
app.use('/dictionary', dictionaryRoutes);
app.use('/upload', uploadRoutes);

// 404 핸들러 (등록된 라우트가 없는 경우)
app.use(notFoundHandler);

// 전역 에러 핸들러 (마지막에 등록)
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 VocaPDF Backend Server`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
