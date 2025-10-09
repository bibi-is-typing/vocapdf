import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001',
  timeout: 120000, // 2분 (단어가 많을 수 있음)
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
