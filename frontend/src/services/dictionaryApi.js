import api from './api';

/**
 * 단어 조회 API 호출
 * @param {Array<string>} words - 조회할 단어 배열
 * @param {Object} options - 옵션 설정
 * @returns {Promise} API 응답
 */
export const lookupWords = async (words, options) => {
  const response = await api.post('/api/dictionary/lookup', {
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

  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
