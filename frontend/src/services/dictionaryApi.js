import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5분 (단어 조회 시간 고려)
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 단어 조회 API 호출
 * @param {Array<string>} words - 조회할 단어 배열
 * @param {Object} options - 옵션 설정
 * @returns {Promise} API 응답
 */
export const lookupWords = async (words, options) => {
  const response = await api.post('/dictionary/lookup', {
    words,
    options
  });
  return response.data;
};

/**
 * 파일 업로드
 * @param {File} file - 업로드할 파일
 * @returns {Promise} API 응답
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
