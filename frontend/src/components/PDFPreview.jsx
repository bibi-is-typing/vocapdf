import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import './PDFPreview.css';

/**
 * PDF 미리보기 컴포넌트
 * 실제 PDF와 동일한 레이아웃으로 표시 (A4 페이지네이션, 버튼 네비게이션)
 */
function PDFPreview({ wordData, options, onGeneratePDF }) {
  const [currentPage, setCurrentPage] = useState(0);

  // options 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [options.includeNumbering, options.layoutType, options.pdfStyle]);

  // 데이터가 없으면 표시 안 함
  if (!wordData || wordData.length === 0) {
    return (
      <div className="preview-empty">
        <p className="text-xs sm:text-base">단어를 검색하면 미리보기가 나타나요</p>
      </div>
    );
  }

  const successData = useMemo(() => {
    const filtered = wordData.filter(item => !item.error);
    return filtered;
  }, [wordData]);

  // 입력 순서 형식으로 데이터 반환
  const organizedData = useMemo(() => {
    return { all: successData };
  }, [successData]);


  // 테이블 헤더 생성
  const getTableHeaders = () => {
    const headers = [];

    // 넘버링 옵션
    if (options.includeNumbering) {
      headers.push({ key: 'number', label: 'No.', width: '50px' });
    }

    // 통일된 헤더 사용
    headers.push({ key: 'word', label: 'Item', width: 'auto' });
    headers.push({ key: 'meaning', label: 'Meaning', width: 'auto' });

    return headers;
  };

  // 데이터를 20개씩 페이지로 분할
  const ITEMS_PER_PAGE = 20;

  const paginatedData = useMemo(() => {
    const chunks = [];
    const items = organizedData.all || [];
    for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
      chunks.push(items.slice(i, i + ITEMS_PER_PAGE));
    }
    return chunks.length > 0 ? chunks : [[]];
  }, [organizedData]);

  const totalPages = paginatedData.length;

  // 테이블 행 생성
  const renderTableRows = (items, startNumber = 1) => {
    return items.map((item, index) => {
      const rowNumber = startNumber + index;

      // 문장 타입
      if (item.type === 'sentence') {
        // 활용 예시 텍스트 생성
        let examplesContent = [];
        let examplesText = '';
        if (item.examples && item.examples.length > 0) {
          const exampleText = item.examples.map((ex, idx) => `${idx + 1}. ${ex}`).join('\n');
          examplesText = 'Usage Examples:\n' + exampleText;
          examplesContent.push(
            <div key="examples" style={{ marginBottom: '0.5rem' }}>
              Usage Examples:
              {item.examples.map((ex, idx) => (
                <div key={idx} style={{ marginLeft: '1rem' }}>
                  {idx + 1}. {ex}
                </div>
              ))}
            </div>
          );
        }
        if (item.similarExpressions && item.similarExpressions.length > 0) {
          examplesText += (examplesText ? '\n\n' : '') + item.similarExpressions[0];
          examplesContent.push(
            <div key="similar">
              {item.similarExpressions[0]}
            </div>
          );
        }

        return (
          <tr key={index} className="preview-row">
            {options.includeNumbering && (
              <td className="preview-cell cell-number">{rowNumber}</td>
            )}
            <td className="preview-cell cell-sentence">
              {item.word || item.original}
            </td>
            {options.layoutType === 'memorization' ? (
              <td className="preview-cell cell-blank"></td>
            ) : (
              <td className="preview-cell cell-translation">
                {examplesContent.length > 0 ? examplesContent : '-'}
              </td>
            )}
          </tr>
        );
      }

      // 한글 타입
      if (item.type === 'korean') {
        return (
          <tr key={index} className="preview-row">
            {options.includeNumbering && (
              <td className="preview-cell cell-number">{rowNumber}</td>
            )}
            <td className="preview-cell cell-word">
              {item.word} → {item.englishWord || item.meanings?.[0]?.meaning || ''}
            </td>
            {options.layoutType === 'memorization' ? (
              <td className="preview-cell cell-blank"></td>
            ) : (
              <td className="preview-cell cell-meaning">
                {item.englishWord || item.meanings?.[0]?.meaning || '-'}
                {item.meanings?.[0]?.definition && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85em', color: '#666' }}>
                    {item.meanings[0].definition}
                  </div>
                )}
              </td>
            )}
          </tr>
        );
      }

      // 단어/숙어 타입
      if (!item.meanings || item.meanings.length === 0) {
        return null;
      }

      const meaning = item.meanings[0];

      return (
        <tr key={index} className="preview-row">
          {options.includeNumbering && (
            <td className="preview-cell cell-number">{rowNumber}</td>
          )}
          <td className="preview-cell cell-word">{item.word}</td>
          {options.layoutType === 'memorization' ? (
            <td className="preview-cell cell-blank"></td>
          ) : (
            <td className="preview-cell cell-meaning">
              {meaning.definition || '-'}
              {meaning.examples && meaning.examples.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  Example: {meaning.examples[0]}
                </div>
              )}
            </td>
          )}
        </tr>
      );
    });
  };

  // 문장 테이블 행 생성
  const renderSentenceRows = (sentences, startNumber = 1) => {
    return sentences.map((item, index) => {
      const rowNumber = startNumber + index;

      // 활용 예시 텍스트 생성
      let examplesContent = [];
      let examplesText = '';
      if (item.examples && item.examples.length > 0) {
        const exampleText = item.examples.map((ex, idx) => `${idx + 1}. ${ex}`).join('\n');
        examplesText = 'Usage Examples:\n' + exampleText;
        examplesContent.push(
          <div key="examples" style={{ marginBottom: '0.5rem' }}>
            Usage Examples:
            {item.examples.map((ex, idx) => (
              <div key={idx} style={{ marginLeft: '1rem' }}>
                {idx + 1}. {ex}
              </div>
            ))}
          </div>
        );
      }
      if (item.similarExpressions && item.similarExpressions.length > 0) {
        examplesText += (examplesText ? '\n\n' : '') + item.similarExpressions[0];
        examplesContent.push(
          <div key="similar">
            {item.similarExpressions[0]}
          </div>
        );
      }

      return (
        <tr key={index} className="preview-row">
          {options.includeNumbering && (
            <td className="preview-cell cell-number">{rowNumber}</td>
          )}
          <td className="preview-cell cell-sentence">{item.word || item.original}</td>
          {options.layoutType === 'memorization' ? (
            <td className="preview-cell cell-blank"></td>
          ) : (
            <td className="preview-cell cell-translation">
              {examplesContent.length > 0 ? examplesContent : '-'}
            </td>
          )}
        </tr>
      );
    });
  };

  // 한글 테이블 행 생성
  const renderKoreanRows = (korean, startNumber = 1) => {
    return korean.map((item, index) => {
      const rowNumber = startNumber + index;

      return (
        <tr key={index} className="preview-row">
          {options.includeNumbering && (
            <td className="preview-cell cell-number">{rowNumber}</td>
          )}
          <td className="preview-cell cell-word">{item.word}</td>
          {options.layoutType === 'memorization' ? (
            <td className="preview-cell cell-blank"></td>
          ) : (
            <td className="preview-cell cell-meaning">
              {item.englishWord || item.meanings?.[0]?.meaning || '-'}
              {item.meanings?.[0]?.definition && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85em', color: '#666' }}>
                  {item.meanings[0].definition}
                </div>
              )}
            </td>
          )}
        </tr>
      );
    });
  };

  // 텍스트 형식 렌더링
  const renderTextFormat = (items, startNumber = 1) => {
    return items.map((item, index) => {
      const rowNumber = startNumber + index;
      const prefix = options.includeNumbering ? `[${rowNumber}]` : '•';

      // 문장 타입
      if (item.type === 'sentence') {
        let meaningText = '';
        if (options.layoutType !== 'memorization') {
          let examplesText = '';
          if (item.examples && item.examples.length > 0) {
            examplesText = item.examples.map((ex, idx) => `${idx + 1}. ${ex}`).join('\n');
          }
          if (item.similarExpressions && item.similarExpressions.length > 0) {
            if (examplesText) examplesText += '\n';
            examplesText += item.similarExpressions[0];
          }
          meaningText = examplesText;
        }

        return (
          <div key={index} className="text-preview-item">
            <div className="text-preview-prefix">{prefix}</div>
            <div className="text-preview-content">
              <div className="text-preview-word">{item.word}</div>
              <div className="text-preview-inline">
                <span className="text-preview-colon">: </span>
                <span className="text-preview-meaning">
                  {options.layoutType !== 'memorization' ? (meaningText || '-') : ''}
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 한글 타입
      if (item.type === 'korean') {
        return (
          <div key={index} className="text-preview-item">
            <div className="text-preview-prefix">{prefix}</div>
            <div className="text-preview-content">
              <div className="text-preview-word">
                {item.word} → {item.englishWord || item.meanings?.[0]?.meaning || ''}
              </div>
              <div className="text-preview-inline">
                <span className="text-preview-colon">: </span>
                <span className="text-preview-meaning">
                  {options.layoutType !== 'memorization'
                    ? (item.englishWord || item.meanings?.[0]?.meaning || '-')
                    : ''}
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 일반 단어/숙어
      const meanings = item.meanings || [];
      if (meanings.length === 0) return null;

      const meaning = meanings[0];
      let meaningText = '';
      if (options.layoutType !== 'memorization') {
        meaningText = meaning.definition || '-';
        if (meaning.examples && meaning.examples.length > 0) {
          meaningText += '\nExample: ' + meaning.examples[0];
        }
      }

      return (
        <div key={index} className="text-preview-item">
          <div className="text-preview-prefix">{prefix}</div>
          <div className="text-preview-content">
            <div className="text-preview-word">{item.word}</div>
            <div className="text-preview-inline">
              <span className="text-preview-colon">: </span>
              <span className="text-preview-meaning">
                {options.layoutType !== 'memorization' ? (meaningText || '-') : ''}
              </span>
            </div>
          </div>
        </div>
      );
    });
  };

  const headers = getTableHeaders();

  // 페이지 이동 핸들러
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  // 현재 페이지 데이터만 가져오기
  const currentPageData = paginatedData[currentPage] || [];

  return (
    <div className="pdf-preview-container">
      {/* 페이지 네비게이션 및 PDF 생성 버튼 */}
      <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-secondary/30 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            variant="outline"
            size="sm"
            className="text-xs transition-all hover:shadow-md active:scale-95 sm:text-sm disabled:active:scale-100"
            aria-label="이전 페이지"
          >
            ◀ 이전
          </Button>
          <span className="min-w-[100px] text-center text-xs font-semibold text-foreground sm:min-w-[150px] sm:text-sm">
            페이지 {currentPage + 1} / {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            variant="outline"
            size="sm"
            className="text-xs transition-all hover:shadow-md active:scale-95 sm:text-sm disabled:active:scale-100"
            aria-label="다음 페이지"
          >
            다음 ▶
          </Button>
        </div>
        <button
          onClick={onGeneratePDF}
          className="inline-flex items-center gap-2 rounded-md border border-accent bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-accent/90 hover:shadow-lg active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
          aria-label="PDF 다운로드"
        >
          PDF 다운로드
        </button>
      </div>

      {/* 현재 페이지만 표시 */}
      <div className="pdf-preview-wrapper">
        <div className="pdf-preview-page">
              {/* 날짜 표시 - 상단 여백에 작게 */}
              {options.customDate && (
                <div className="preview-header">
                  <p className="preview-date">Date: {options.customDate}</p>
                </div>
              )}

          {/* 표 형식 */}
          {options.pdfStyle === 'table' && (
            <div className="preview-content">
              <table className="preview-table">
                <thead>
                  <tr className="preview-header-row">
                    {headers.map(header => (
                      <th
                        key={header.key}
                        className="preview-header-cell"
                        style={{ width: header.width }}
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {renderTableRows(currentPageData, currentPage * ITEMS_PER_PAGE + 1)}
                </tbody>
              </table>
            </div>
          )}

          {/* 텍스트 형식 */}
          {options.pdfStyle === 'text' && (
            <div className="preview-content text-format">
              {renderTextFormat(currentPageData, currentPage * ITEMS_PER_PAGE + 1)}
            </div>
          )}

          {/* 타입별 그룹화 - 사용 안 함 */}
          {false && (
            <div className="preview-content">
              {/* 단어 섹션 */}
              {currentPageData.words && currentPageData.words.length > 0 && (
                    <div className="preview-section">
                      <h3 className="preview-section-title">Words</h3>
                      <table className="preview-table">
                        <thead>
                          <tr className="preview-header-row">
                            {headers.map(header => (
                              <th
                                key={header.key}
                                className="preview-header-cell"
                                style={{ width: header.width }}
                              >
                                {header.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {renderTableRows(currentPageData.words)}
                        </tbody>
                      </table>
                    </div>
                  )}

              {/* 숙어 섹션 */}
              {currentPageData.phrases && currentPageData.phrases.length > 0 && (
                <div className="preview-section">
                  <h3 className="preview-section-title">Phrases</h3>
                  <table className="preview-table">
                    <thead>
                      <tr className="preview-header-row">
                        {headers.map(header => (
                          <th
                            key={header.key}
                            className="preview-header-cell"
                            style={{ width: header.width }}
                          >
                            {header.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {renderTableRows(currentPageData.phrases)}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 문장 섹션 */}
              {currentPageData.sentences && currentPageData.sentences.length > 0 && (
                <div className="preview-section">
                  <h3 className="preview-section-title">Sentences</h3>
                  <table className="preview-table">
                    <thead>
                      <tr className="preview-header-row">
                        {options.includeNumbering && (
                          <th className="preview-header-cell" style={{ width: '50px' }}>No.</th>
                        )}
                        <th className="preview-header-cell">Item</th>
                        <th className="preview-header-cell">Meaning</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderSentenceRows(currentPageData.sentences)}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 한글 섹션 */}
              {currentPageData.korean && currentPageData.korean.length > 0 && (
                <div className="preview-section">
                  <h3 className="preview-section-title">Korean to English</h3>
                  <table className="preview-table">
                    <thead>
                      <tr className="preview-header-row">
                        {options.includeNumbering && (
                          <th className="preview-header-cell" style={{ width: '50px' }}>No.</th>
                        )}
                        <th className="preview-header-cell">Item</th>
                        <th className="preview-header-cell">Meaning</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderKoreanRows(currentPageData.korean)}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 페이지 번호 */}
          <div className="preview-footer">
            <p className="preview-page-number">Page {currentPage + 1} / {totalPages}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PDFPreview;
