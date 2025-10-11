require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/constants');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 라우트 import
const dictionaryRoutes = require('./routes/dictionary');
const uploadRoutes = require('./routes/upload');

// Express 앱 생성
const app = express();

// 미들웨어 설정
// CORS 설정 - .env에서 허용된 도메인만
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:8080'];

app.use(cors({
  origin: function(origin, callback) {
    // origin이 없는 경우 허용 (모바일 앱, Postman 등)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 파싱


// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'VocaPDF Backend is running',
    timestamp: new Date().toISOString()
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
