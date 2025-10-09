import { useState } from 'react';
import { lookupWords, uploadFile } from './services/dictionaryApi';
import { generatePDF } from './utils/pdfGenerator';
import './App.css';

function App() {
  const [words, setWords] = useState('');
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const [success, setSuccess] = useState(null);

  // 옵션 state
  const [options, setOptions] = useState({
    meanings: 2,
    definitions: 1,
    synonyms: 2,
    antonyms: 0,
    related: 0,
    showCheckbox: false,
    showDate: false
  });

  // 단어 입력 파싱
  const parseWords = (text) => {
    return text
      .split(/[\n,;]+/)
      .map(word => word.trim())
      .filter(word => word.length > 0);
  };

  // 파일 업로드 처리
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setProgress('파일 업로드 중...');

      const result = await uploadFile(file);
      setWords(result.data.words.join('\n'));
      setSuccess(`${result.data.count}개의 단어를 성공적으로 로드했습니다!`);
      setProgress('');
    } catch (err) {
      setError(err.response?.data?.error?.message || '파일 업로드에 실패했습니다. 파일 형식과 크기를 확인해주세요.');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  // 단어 조회 처리
  const handleLookup = async () => {
    const wordList = parseWords(words);

    if (wordList.length === 0) {
      setError('단어를 입력해주세요');
      return;
    }

    if (wordList.length > 500) {
      setError('최대 500개까지 입력 가능합니다');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setProgress(`${wordList.length}개 단어 조회 중...`);

      const result = await lookupWords(wordList, options);
      setWordData(result.data);

      const successMsg = result.meta.failedWords > 0
        ? `조회 완료! ${result.meta.processedWords}개 성공, ${result.meta.failedWords}개 실패`
        : `${result.meta.processedWords}개 단어를 성공적으로 조회했습니다!`;

      setSuccess(successMsg);
      setProgress('');
    } catch (err) {
      setError(err.response?.data?.error?.message || '단어 조회에 실패했습니다. 네트워크 연결을 확인해주세요.');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  // PDF 생성 처리
  const handleGeneratePDF = () => {
    if (!wordData || wordData.length === 0) {
      setError('먼저 단어를 조회해주세요');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      setProgress('PDF 생성 중...');

      generatePDF(wordData, options);

      setSuccess('PDF가 성공적으로 다운로드되었습니다!');
      setProgress('');
      setLoading(false);
    } catch (err) {
      console.error('PDF 생성 오류:', err);
      setError(`PDF 생성에 실패했습니다: ${err.message}`);
      setProgress('');
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* 로딩 오버레이 */}
      {loading && (
        <div className="loading-overlay">
          <div style={{ textAlign: 'center' }}>
            <div className="spinner"></div>
            {progress && <div className="loading-text">{progress}</div>}
          </div>
        </div>
      )}

      <header className="header">
        <h1>📚 VocaPDF</h1>
        <p>단어장을 PDF로 만들어보세요</p>
      </header>

      <main className="main">
        {/* 단어 입력 섹션 */}
        <section className="section">
          <h2>1. 단어 입력</h2>
          <textarea
            className="word-input"
            value={words}
            onChange={(e) => setWords(e.target.value)}
            placeholder="단어를 입력하세요 (줄바꿈 또는 쉼표로 구분)&#10;예: apple, banana, computer"
            rows={10}
          />
          <div className="file-upload">
            <label htmlFor="file-input" className="file-label">
              📁 파일 업로드 (.txt, .csv, .md)
            </label>
            <input
              id="file-input"
              type="file"
              accept=".txt,.csv,.md"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        </section>

        {/* 옵션 선택 섹션 */}
        <section className="section">
          <h2>2. 옵션 선택</h2>

          <div className="option-group">
            <label>
              의미 개수:
              <select
                value={options.meanings}
                onChange={(e) => setOptions({ ...options, meanings: Number(e.target.value) })}
              >
                <option value={1}>1개</option>
                <option value={2}>2개</option>
              </select>
            </label>
          </div>

          <div className="option-group">
            <label>
              영영뜻:
              <select
                value={options.definitions}
                onChange={(e) => setOptions({ ...options, definitions: Number(e.target.value) })}
              >
                <option value={0}>표시 안함</option>
                <option value={1}>1개</option>
                <option value={2}>2개</option>
              </select>
            </label>
          </div>

          <div className="option-group">
            <label>
              유의어:
              <select
                value={options.synonyms}
                onChange={(e) => setOptions({ ...options, synonyms: Number(e.target.value) })}
              >
                <option value={0}>표시 안함</option>
                <option value={1}>1개</option>
                <option value={2}>2개</option>
              </select>
            </label>
          </div>

          <div className="option-group">
            <label>
              반의어:
              <select
                value={options.antonyms}
                onChange={(e) => setOptions({ ...options, antonyms: Number(e.target.value) })}
              >
                <option value={0}>표시 안함</option>
                <option value={1}>1개</option>
                <option value={2}>2개</option>
              </select>
            </label>
          </div>

          <div className="option-group">
            <label>
              관계어:
              <select
                value={options.related}
                onChange={(e) => setOptions({ ...options, related: Number(e.target.value) })}
              >
                <option value={0}>표시 안함</option>
                <option value={1}>1개</option>
                <option value={2}>2개</option>
              </select>
            </label>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={options.showCheckbox}
                onChange={(e) => setOptions({ ...options, showCheckbox: e.target.checked })}
              />
              체크박스 추가
            </label>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={options.showDate}
                onChange={(e) => setOptions({ ...options, showDate: e.target.checked })}
              />
              날짜 표시
            </label>
          </div>
        </section>

        {/* 상태 메시지 */}
        {error && <div className="error-message">{error}</div>}
        {success && !error && <div className="success-message">{success}</div>}

        {/* 버튼 섹션 */}
        <section className="button-section">
          <button
            className="btn btn-primary"
            onClick={handleLookup}
            disabled={loading}
          >
            {loading ? '조회 중...' : '단어 조회'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleGeneratePDF}
            disabled={!wordData || loading}
          >
            PDF 생성하기
          </button>
        </section>

        {/* 결과 미리보기 */}
        {wordData && (
          <section className="section">
            <h2>3. 결과 미리보기</h2>
            <div className="preview">
              <p>총 {wordData.length}개의 단어가 조회되었습니다</p>
              <div className="preview-list">
                {wordData.slice(0, 10).map((item, index) => (
                  <div key={index} className="preview-item">
                    <strong>{item.word}</strong>
                    {item.error ? (
                      <span className="error-text"> - {item.error}</span>
                    ) : (
                      <span> - {item.meanings?.length || 0}개의 의미</span>
                    )}
                  </div>
                ))}
                {wordData.length > 10 && <p>... 외 {wordData.length - 10}개</p>}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Made with ❤️ by VocaPDF</p>
      </footer>
    </div>
  );
}

export default App;
