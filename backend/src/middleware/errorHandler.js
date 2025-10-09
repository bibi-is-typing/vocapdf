/**
 * 전역 에러 핸들링 미들웨어
 * 애플리케이션 전체에서 발생하는 에러를 일관된 형식으로 처리
 */
function errorHandler(err, req, res, next) {
  console.error('Error occurred:', err);

  // 기본 상태 코드와 에러 코드 설정
  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || 'SERVER_ERROR';

  // 에러 응답 구조
  const errorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: err.message || '서버 에러가 발생했습니다',
    }
  };

  // 추가 상세 정보가 있다면 포함
  if (err.details) {
    errorResponse.error.details = err.details;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found 핸들러
 */
function notFoundHandler(req, res, next) {
  const error = new Error(`요청한 경로를 찾을 수 없습니다: ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
}

/**
 * 커스텀 에러 생성 헬퍼 함수
 */
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError
};
