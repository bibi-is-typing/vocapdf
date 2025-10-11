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
  }, [options.outputFormat, options.includeCheckbox, options.includeNumbering, options.meaningDisplay, options.layoutType]);

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

  // outputFormat에 따라 데이터 ���류
  const organizedData = useMemo(() => {
    if (options.outputFormat === 'grouped') {
      return {
        words: successData.filter(item => item.type === 'word'),
        phrases: successData.filter(item => item.type === 'phrase'),
        sentences: successData.filter(item => item.type === 'sentence'),
        korean: successData.filter(item => item.type === 'korean')
      };
    }
    return { all: successData };
  }, [successData, options.outputFormat]);

  // 테이블 헤더 생성
  const getTableHeaders = () => {
    const headers = [];

    // 넘버링 옵션
    if (options.includeNumbering) {
      headers.push({ key: 'number', label: 'No.', width: '50px' });
    }

    // 체크박스 옵션
    if (options.includeCheckbox) {
      headers.push({ key: 'checkbox', label: '☐', width: '40px' });
    }

    // 통일된 헤더 사용
    headers.push({ key: 'word', label: 'Item', width: 'auto' });
    headers.push({ key: 'meaning', label: 'Meaning', width: 'auto' });

    return headers;
  };

  // 데이터를 20개씩 페이지로 분할
  const ITEMS_PER_PAGE = 20;

  const paginatedData = useMemo(() => {
    if (options.outputFormat === 'input-order') {
      const chunks = [];
      const items = organizedData.all || [];
      for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
        chunks.push(items.slice(i, i + ITEMS_PER_PAGE));
      }
      return chunks.length > 0 ? chunks : [[]];
    } else {
      return [[organizedData]];
    }
  }, [organizedData, options.outputFormat]);

  const totalPages = paginatedData.length;

  // 텍스트 너비를 측정하는 헬퍼 함수 (PDF와 동일한 로직)
  const measureTextWidth = (text, fontSize = 10) => {
    // 캔버스를 사용하여 실제 텍스트 너비 측정
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontSize}pt Helvetica, Arial, sans-serif`;
    return context.measureText(String(text)).width;
  };

  // 텍스트 길이에 따라 폰트 크기 클래스 결정 (PDF와 동일한 로직)
  const getFontSizeClass = (text, cellWidthMm) => {
    if (!text) return '';

    // mm를 픽셀로 변환 (1mm ≈ 3.78px at 96 DPI)
    const cellWidthPx = cellWidthMm * 3.78;

    // cellPadding (2mm * 2) ��외
    const availableWidth = cellWidthPx - (2 * 3.78 * 2);

    // 텍스트 너비 측정 (10pt 폰트 기준)
    const textWidth = measureTextWidth(text, 10);

    // 예상 줄 수 계산
    const estimatedLines = Math.ceil(textWidth / availableWidth);

    // 줄 수에 따라 폰트 크기 조정 (PDF와 동일한 로직)
    if (estimatedLines > 3) return 'font-small';   // 7pt - 4줄 이상
    if (estimatedLines > 2) return 'font-medium';  // 8pt - 3줄
    if (estimatedLines > 1.5) return 'font-large'; // 9pt - 2줄
    return '';  // 10pt (기본)
  };

  // 테이블 행 생성
  const renderTableRows = (items, startNumber = 1) => {
    // 컬럼 너비 계산 (PDF와 동일)
    const pageWidth = 210; // A4 width in mm
    const marginLeft = 15, marginRight = 15;
    const usedWidth = marginLeft + marginRight + (options.includeNumbering ? 12 : 0) + (options.includeCheckbox ? 10 : 0);
    const remainingWidth = pageWidth - usedWidth;
    const itemWidthMm = remainingWidth * 0.4; // 40%
    const meaningWidthMm = remainingWidth * 0.6; // 60%

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

        const sentenceFontClass = getFontSizeClass(item.word || item.original, itemWidthMm);
        const translationFontClass = getFontSizeClass(examplesText, meaningWidthMm);

        return (
          <tr key={index} className="preview-row">
            {options.includeNumbering && (
              <td className="preview-cell cell-number">{rowNumber}.</td>
            )}
            {options.includeCheckbox && (
              <td className="preview-cell cell-checkbox">☐</td>
            )}
            <td className={`preview-cell cell-sentence ${sentenceFontClass}`}>
              {item.word || item.original}
            </td>
            {options.layoutType === 'memorization' ? (
              <td className="preview-cell cell-blank"></td>
            ) : (
              <td className={`preview-cell cell-translation ${translationFontClass}`}>
                {examplesContent.length > 0 ? examplesContent : '-'}
              </td>
            )}
          </tr>
        );
      }

      // 한글 타입
      if (item.type === 'korean') {
        const koreanWord = `${item.word} → ${item.englishWord || item.meanings?.[0]?.meaning || ''}`;
        const koreanMeaning = item.englishWord || item.meanings?.[0]?.meaning || '-';
        const koreanDefinition = item.meanings?.[0]?.definition || '';
        const fullMeaning = koreanDefinition ? `${koreanMeaning}\n\n${koreanDefinition}` : koreanMeaning;

        const wordFontClass = getFontSizeClass(koreanWord, itemWidthMm);
        const meaningFontClass = getFontSizeClass(fullMeaning, meaningWidthMm);

        return (
          <tr key={index} className="preview-row">
            {options.includeNumbering && (
              <td className="preview-cell cell-number">{rowNumber}.</td>
            )}
            {options.includeCheckbox && (
              <td className="preview-cell cell-checkbox">☐</td>
            )}
            <td className={`preview-cell cell-word ${wordFontClass}`}>
              {item.word} → {item.englishWord || item.meanings?.[0]?.meaning || ''}
            </td>
            {options.layoutType === 'memorization' ? (
              <td className="preview-cell cell-blank"></td>
            ) : (
              <td className={`preview-cell cell-meaning ${meaningFontClass}`}>
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
      const definitionText = meaning.definition || '-';
      const exampleText = meaning.examples && meaning.examples.length > 0
        ? `\n\nExample: ${meaning.examples[0]}`
        : '';
      const fullMeaning = definitionText + exampleText;

      const wordFontClass = getFontSizeClass(item.word, itemWidthMm);
      const meaningFontClass = getFontSizeClass(fullMeaning, meaningWidthMm);

      return (
        <tr key={index} className="preview-row">
          {options.includeNumbering && (
            <td className="preview-cell cell-number">{rowNumber}.</td>
          )}
          {options.includeCheckbox && (
            <td className="preview-cell cell-checkbox">☐</td>
          )}
          <td className={`preview-cell cell-word ${wordFontClass}`}>{item.word}</td>
          {options.layoutType === 'memorization' ? (
            <td className="preview-cell cell-blank"></td>
          ) : (
            <td className={`preview-cell cell-meaning ${meaningFontClass}`}>
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
    // 컬럼 너비 계산 (PDF�� 동일)
    const pageWidth = 210;
    const marginLeft = 15, marginRight = 15;
    const usedWidth = marginLeft + marginRight + (options.includeNumbering ? 12 : 0) + (options.includeCheckbox ? 10 : 0);
    const remainingWidth = pageWidth - usedWidth;
    const itemWidthMm = remainingWidth * 0.4;
    const meaningWidthMm = remainingWidth * 0.6;

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

      const sentenceFontClass = getFontSizeClass(item.word || item.original, itemWidthMm);
      const translationFontClass = getFontSizeClass(examplesText, meaningWidthMm);

      return (
        <tr key={index} className="preview-row">
          {options.includeNumbering && (
            <td className="preview-cell cell-number">{rowNumber}.</td>
          )}
          {options.includeCheckbox && (
            <td className="preview-cell cell-checkbox">☐</td>
          )}
          <td className={`preview-cell cell-sentence ${sentenceFontClass}`}>{item.word || item.original}</td>
          {options.layoutType === 'memorization' ? (
            <td className="preview-cell cell-blank"></td>
          ) : (
            <td className={`preview-cell cell-translation ${translationFontClass}`}>
              {examplesContent.length > 0 ? examplesContent : '-'}
            </td>
          )}
        </tr>
      );
    });
  };

  // 한글 테이블 행 생성
  const renderKoreanRows = (korean, startNumber = 1) => {
    // 컬럼 너비 계산 (PDF와 동일)
    const pageWidth = 210;
    const marginLeft = 15, marginRight = 15;
    const usedWidth = marginLeft + marginRight + (options.includeNumbering ? 12 : 0) + (options.includeCheckbox ? 10 : 0);
    const remainingWidth = pageWidth - usedWidth;
    const itemWidthMm = remainingWidth * 0.4;
    const meaningWidthMm = remainingWidth * 0.6;

    return korean.map((item, index) => {
      const rowNumber = startNumber + index;
      const koreanMeaning = item.englishWord || item.meanings?.[0]?.meaning || '-';
      const koreanDefinition = item.meanings?.[0]?.definition || '';
      const fullMeaning = koreanDefinition ? `${koreanMeaning}\n\n${koreanDefinition}` : koreanMeaning;

      const wordFontClass = getFontSizeClass(item.word, itemWidthMm);
      const meaningFontClass = getFontSizeClass(fullMeaning, meaningWidthMm);

      return (
        <tr key={index} className="preview-row">
          {options.includeNumbering && (
            <td className="preview-cell cell-number">{rowNumber}.</td>
          )}
          {options.includeCheckbox && (
            <td className="preview-cell cell-checkbox">☐</td>
          )}
          <td className={`preview-cell cell-word ${wordFontClass}`}>{item.word}</td>
          {options.layoutType === 'memorization' ? (
            <td className="preview-cell cell-blank"></td>
          ) : (
            <td className={`preview-cell cell-meaning ${meaningFontClass}`}>
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
        <Button
          onClick={onGeneratePDF}
          variant="outline"
          size="lg"
          className="text-xs transition-all hover:shadow-lg active:scale-95 sm:text-sm"
          aria-label="PDF 다운로드"
        >
          PDF 다운로드
        </Button>
      </div>

      {/* 현재 페이지만 표시 */}
      <div className="pdf-preview-wrapper">
        <div className="pdf-preview-page">
              {/* 날짜 표시 - 상단 여백에 작게 */}
              {options.customDate && (
                <div className="preview-header">
                  <p className="preview-date">Study Date: {options.customDate}</p>
                </div>
              )}

          {/* 입력 순서대로 */}
          {options.outputFormat === 'input-order' && (
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

          {/* 타입별 그룹화 */}
          {options.outputFormat === 'grouped' && (
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
                        {options.includeCheckbox && (
                          <th className="preview-header-cell" style={{ width: '40px' }}>☐</th>
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
                        {options.includeCheckbox && (
                          <th className="preview-header-cell" style={{ width: '40px' }}>☐</th>
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
