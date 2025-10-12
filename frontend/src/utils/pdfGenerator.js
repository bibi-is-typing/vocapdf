import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * PDF 생성 (Helvetica 폰트 + 커스텀 체크박스)
 * @param {Array} wordData - 단어 데이터 배열
 * @param {Object} options - 옵션 설정
 */
export const generatePDF = (wordData, options) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // 2. 기본 폰트 설정 (helvetica)
    doc.setFont('helvetica');

  const marginLeft = 15;
  const marginRight = 15;
  const marginTop = 20;
  const marginBottom = 15;
  let startY = marginTop;

  // 체크박스 그리기 함수
  const drawCheckbox = (doc, x, y, size = 3) => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(x, y, size, size);
  };

  // 2. 날짜 표시 (YYYY-MM-DD 형식) - 상단 여백에 표시
  if (options.customDate) {
    const dateStr = `Study Date: ${options.customDate}`;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(dateStr, marginLeft, 12);
    // startY는 그대로 20mm 유지
  }

  // 3. 출력 형식에 따라 데이터 처리
  if (options.outputFormat === 'grouped') {
    // 분류 형식: 단어/숙어/문장을 별도 섹션으로
    generateCategorizedPDF(doc, wordData, options, startY, marginLeft, marginRight, marginTop, drawCheckbox);
  } else {
    // 입력 순서 형식: 기존 방식
    generateUnifiedPDF(doc, wordData, options, startY, marginLeft, marginRight, marginTop, marginBottom, drawCheckbox);
  }

  addPageNumbers(doc);

  const filename = `vocapdf_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.pdf`;
  doc.save(filename);

  return { success: true, filename };
  } catch (error) {
    throw error;
  }
};

/**
 * 통합 형식 PDF 생성
 */
function generateUnifiedPDF(doc, wordData, options, startY, marginLeft, marginRight, marginTop, marginBottom, drawCheckbox) {

  // 3. 테이블 헤더 구성 (통일된 헤더)
  const headers = [];

  // 넘버링 옵션
  if (options.includeNumbering) {
    headers.push('No.');
  }

  // 체크박스 옵션
  if (options.includeCheckbox) {
    headers.push('');
  }

  // 모든 타입 통합 헤더
  headers.push('Item');
  headers.push('Meaning');

  // 4. 테이블 데이터 구성
  const tableBody = [];
  let numberCounter = 1; // 통합 넘버링

  for (const item of wordData) {
    if (item.error) {
      // 에러가 있는 단어는 스킵
      continue;
    }

    // 문장 타입 처리
    if (item.type === 'sentence') {
      const row = [];

      // 넘버링
      if (options.includeNumbering) {
        row.push({
          content: `${numberCounter}.`,
          styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fontSize: 9 }
        });
        numberCounter++;
      }

      // 체크박스
      if (options.includeCheckbox) {
        row.push({
          content: '',
          styles: { halign: 'center', valign: 'middle', fontSize: 9, fontStyle: 'normal' }
        });
      }

      // 문장
      row.push({
        content: item.word,
        styles: { fontStyle: 'normal', fontSize: 9, halign: 'left', valign: 'middle' }
      });

      // 레이아웃 타입에 따른 의미 표시
      if (options.layoutType === 'memorization') {
        // 암기용: 빈칸
        row.push({
          content: ' ',
          styles: { halign: 'center', valign: 'middle' }
        });
      } else {
        // 학습용: 활용 예시 표시
        let examplesText = '';
        if (item.examples && item.examples.length > 0) {
          examplesText = 'Usage Examples:\n' + item.examples.map((ex, idx) => `${idx + 1}. ${ex}`).join('\n');
        }
        if (item.similarExpressions && item.similarExpressions.length > 0) {
          if (examplesText) examplesText += '\n\n';
          examplesText += item.similarExpressions[0];
        }
        row.push(examplesText || '-');
      }

      tableBody.push(row);
      continue;
    }

    // 한글 타입 처리
    if (item.type === 'korean') {
      const row = [];

      // 넘버링
      if (options.includeNumbering) {
        row.push({
          content: `${numberCounter}.`,
          styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fontSize: 9 }
        });
        numberCounter++;
      }

      // 체크박스
      if (options.includeCheckbox) {
        row.push({
          content: '',
          styles: { halign: 'center', valign: 'middle', fontSize: 9, fontStyle: 'normal' }
        });
      }

      // 한글 단어
      row.push({
        content: `${item.word} → ${item.englishWord || item.meanings?.[0]?.meaning || ''}`,
        styles: { fontStyle: 'normal', fontSize: 9, halign: 'left', valign: 'middle' }
      });

      // 레이아웃 타입에 따른 의미 표시
      if (options.layoutType === 'memorization') {
        // 암기용: 빈칸
        row.push({
          content: ' ',
          styles: { halign: 'center', valign: 'middle' }
        });
      } else {
        // 학습용: 의미 표시
        if (options.meaningDisplay === 'korean' || options.meaningDisplay === 'both') {
          row.push(item.englishWord || item.meanings?.[0]?.meaning || '-');
        }

        if (options.meaningDisplay === 'english' || options.meaningDisplay === 'both') {
          row.push(item.meanings?.[0]?.definition || '-');
        }
      }

      tableBody.push(row);
      continue;
    }

    // 일반 단어/숙어 처리
    const meanings = item.meanings || [];
    if (meanings.length === 0) continue;

    // 첫 번째 의미만 사용 (1개 고정)
    const meaning = meanings[0];
    const row = [];

    // 넘버링
    if (options.includeNumbering) {
      row.push({
        content: `${numberCounter}.`,
        styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fontSize: 9 }
      });
      numberCounter++;
    }

    // 체크박스
    if (options.includeCheckbox) {
      row.push({
        content: '',
        styles: { halign: 'center', valign: 'middle', fontSize: 9 }
      });
    }

    // 단어
    row.push({
      content: item.word,
      styles: { fontStyle: 'normal', fontSize: 9, halign: 'left', valign: 'middle' }
    });

    // 레이아웃 타입에 따른 의미 표시
    if (options.layoutType === 'memorization') {
      // 암기용: 빈칸
      row.push({
        content: ' ',
        styles: { halign: 'center', valign: 'middle' }
      });
    } else {
      // 학습용: 의미 표시
      if (options.meaningDisplay === 'korean' || options.meaningDisplay === 'both') {
        row.push(meaning.meaning || '-');
      }

      if (options.meaningDisplay === 'english' || options.meaningDisplay === 'both') {
        // 영영뜻 + 예문 (학습용)
        let definitionText = meaning.definition || '-';
        if (meaning.examples && meaning.examples.length > 0) {
          definitionText += '\n\nExample: ' + meaning.examples[0];
        }
        row.push(definitionText);
      }
    }

    tableBody.push(row);
  }

  // 체크박스 컬럼 인덱스 찾기
  const checkboxColIndex = options.includeNumbering ? 1 : 0;

  // 컬럼 너비 설정 (고정)
  const columnStyles = {};
  let colIndex = 0;

  if (options.includeNumbering) {
    columnStyles[colIndex] = { cellWidth: 12 }; // No. 컬럼
    colIndex++;
  }

  if (options.includeCheckbox) {
    columnStyles[colIndex] = { cellWidth: 10 }; // 체크박스 컬럼
    colIndex++;
  }

  // Item과 Meaning 컬럼은 나머지 공간을 균등 분배
  const pageWidth = 210; // A4 width in mm
  const usedWidth = marginLeft + marginRight + (options.includeNumbering ? 12 : 0) + (options.includeCheckbox ? 10 : 0);
  const remainingWidth = pageWidth - usedWidth;
  const itemWidth = remainingWidth * 0.4; // 40%
  const meaningWidth = remainingWidth * 0.6; // 60%

  columnStyles[colIndex] = { cellWidth: itemWidth }; // Item 컬럼
  columnStyles[colIndex + 1] = { cellWidth: meaningWidth }; // Meaning 컬럼

  // 전체 데이터를 한 번에 테이블로 생성 (autoTable이 자동으로 페이지 넘김 처리)
  autoTable(doc, {
    head: [headers],
    body: tableBody,
    startY: startY,
    margin: {
      top: marginTop,
      bottom: marginBottom,
      left: marginLeft,
      right: marginRight
    },
    theme: 'grid',
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'normal',
      halign: 'center',
      valign: 'middle',
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    bodyStyles: {
      fontSize: 9,
      fontStyle: 'normal',
      textColor: [0, 0, 0],
      valign: 'middle',
      halign: 'left',
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249]
    },
    columnStyles: columnStyles,
    showHead: 'everyPage', // 모든 페이지에 헤더 표시
    didDrawCell: (data) => {
      // 체크박스 그리기
      if (options.includeCheckbox && data.column.index === checkboxColIndex) {
        const cellX = data.cell.x;
        const cellY = data.cell.y;
        const cellWidth = data.cell.width;
        const cellHeight = data.cell.height;
        const boxSize = 3;
        const x = cellX + (cellWidth - boxSize) / 2;
        const y = cellY + (cellHeight - boxSize) / 2;

        // 헤더는 흰색, 바디는 검은색
        if (data.section === 'head') {
          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(0.3);
          doc.rect(x, y, boxSize, boxSize);
        } else {
          drawCheckbox(doc, x, y, boxSize);
        }
      }
    },
    didDrawPage: (data) => {
      // 새 페이지마다 날짜 표시 (상단 여백에)
      if (options.customDate && data.pageNumber > 1) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Study Date: ${options.customDate}`, marginLeft, 12);
      }
    }
  });
}

/**
 * 분류 형식 PDF 생성
 */
function generateCategorizedPDF(doc, wordData, options, startY, marginLeft, marginRight, marginTop, drawCheckbox) {
  // 유형별로 데이터 분류
  const words = wordData.filter(item => item.type === 'word' && !item.error);
  const phrases = wordData.filter(item => item.type === 'phrase' && !item.error);
  const sentences = wordData.filter(item => item.type === 'sentence' && !item.error);
  const korean = wordData.filter(item => item.type === 'korean' && !item.error);

  let currentY = startY;

  // 단어 섹션
  if (words.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Words', marginLeft, currentY);
    currentY += 8;

    currentY = createTableForCategory(doc, words, options, currentY, marginLeft, marginRight, drawCheckbox);
    currentY += 10; // 섹션 간 간격
  }

  // 숙어 섹션
  if (phrases.length > 0) {
    // 페이지 넘김 체크
    if (currentY > 250) {
      doc.addPage();
      currentY = marginTop;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Phrases', marginLeft, currentY);
    currentY += 8;

    currentY = createTableForCategory(doc, phrases, options, currentY, marginLeft, marginRight, drawCheckbox);
    currentY += 10;
  }

  // 문장 섹션
  if (sentences.length > 0) {
    // 페이지 넘김 체크
    if (currentY > 250) {
      doc.addPage();
      currentY = marginTop;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Sentences', marginLeft, currentY);
    currentY += 8;

    currentY = createSentenceTable(doc, sentences, options, currentY, marginLeft, marginRight, drawCheckbox);
    currentY += 10;
  }

  // 한글 섹션
  if (korean.length > 0) {
    // 페이지 넘김 체크
    if (currentY > 250) {
      doc.addPage();
      currentY = marginTop;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Korean to English', marginLeft, currentY);
    currentY += 8;

    createKoreanTable(doc, korean, options, currentY, marginLeft, marginRight, drawCheckbox);
  }
}

/**
 * 카테고리별 테이블 생성
 */
function createTableForCategory(doc, data, options, startY, marginLeft, marginRight, drawCheckbox) {
  const headers = [];

  // 넘버링 옵션
  if (options.includeNumbering) {
    headers.push('No.');
  }

  // 체크박스 옵션
  if (options.includeCheckbox) {
    headers.push('');
  }

  // 통일된 헤더 사용
  headers.push('Item');
  headers.push('Meaning');

  const tableBody = [];
  let numberCounter = 1; // 카테고리별 넘버링

  for (const item of data) {
    const meanings = item.meanings || [];
    if (meanings.length === 0) continue;

    // 첫 번째 의미만 사용 (1개 고정)
    const meaning = meanings[0];
    const row = [];

    // 넘버링
    if (options.includeNumbering) {
      row.push({
        content: `${numberCounter}.`,
        styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fontSize: 9 }
      });
      numberCounter++;
    }

    // 체크박스
    if (options.includeCheckbox) {
      row.push({
        content: '',
        styles: { halign: 'center', valign: 'middle', fontSize: 9 }
      });
    }

    row.push({
      content: item.word,
      styles: { fontStyle: 'normal', fontSize: 9, halign: 'left', valign: 'middle' }
    });

    // 레이아웃 타입에 따른 의미 표시
    if (options.layoutType === 'memorization') {
      // 암기용: 빈칸
      row.push({
        content: ' ',
        styles: { halign: 'center', valign: 'middle' }
      });
    } else {
      // 학습용: 의미 표시
      if (options.meaningDisplay === 'korean' || options.meaningDisplay === 'both') {
        row.push(meaning.meaning || '-');
      }

      if (options.meaningDisplay === 'english' || options.meaningDisplay === 'both') {
        // 영영뜻 + 예문 (학습용)
        let definitionText = meaning.definition || '-';
        if (meaning.examples && meaning.examples.length > 0) {
          definitionText += '\n\nExample: ' + meaning.examples[0];
        }
        row.push(definitionText);
      }
    }

    tableBody.push(row);
  }

  // 체크박스 컬럼 인덱스
  const checkboxColIndex = options.includeNumbering ? 1 : 0;

  // 컬럼 너비 설정 (고정)
  const columnStyles = {};
  let colIndex = 0;

  if (options.includeNumbering) {
    columnStyles[colIndex] = { cellWidth: 12 }; // No. 컬럼
    colIndex++;
  }

  if (options.includeCheckbox) {
    columnStyles[colIndex] = { cellWidth: 10 }; // 체크박스 컬럼
    colIndex++;
  }

  // Item과 Meaning 컬럼은 나머지 공간을 균등 분배
  const pageWidth = 210; // A4 width in mm
  const usedWidth = marginLeft + marginRight + (options.includeNumbering ? 12 : 0) + (options.includeCheckbox ? 10 : 0);
  const remainingWidth = pageWidth - usedWidth;
  const itemWidth = remainingWidth * 0.4; // 40%
  const meaningWidth = remainingWidth * 0.6; // 60%

  columnStyles[colIndex] = { cellWidth: itemWidth }; // Item 컬럼
  columnStyles[colIndex + 1] = { cellWidth: meaningWidth }; // Meaning 컬럼

  // 전체 데이터를 한 번에 테이블로 생성 (autoTable이 자동으로 페이지 넘김 처리)
  autoTable(doc, {
    head: [headers],
    body: tableBody,
    startY: startY,
    margin: {
      left: marginLeft,
      right: marginRight
    },
    theme: 'grid',
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'normal',
      halign: 'center',
      valign: 'middle',
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    bodyStyles: {
      fontSize: 9,
      fontStyle: 'normal',
      textColor: [0, 0, 0],
      valign: 'middle',
      halign: 'left',
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249]
    },
    columnStyles: columnStyles,
    showHead: 'everyPage',
    didDrawCell: (data) => {
      if (options.includeCheckbox && data.column.index === checkboxColIndex) {
        const cellX = data.cell.x;
        const cellY = data.cell.y;
        const cellWidth = data.cell.width;
        const cellHeight = data.cell.height;
        const boxSize = 3;
        const x = cellX + (cellWidth - boxSize) / 2;
        const y = cellY + (cellHeight - boxSize) / 2;

        // 헤더는 흰색, 바디는 검은색
        if (data.section === 'head') {
          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(0.3);
          doc.rect(x, y, boxSize, boxSize);
        } else {
          drawCheckbox(doc, x, y, boxSize);
        }
      }
    }
  });

  return doc.lastAutoTable.finalY + 5; // 다음 테이블 시작 위치 반환
}

/**
 * 문장 전용 테이블 생성
 */
function createSentenceTable(doc, sentences, options, startY, marginLeft, marginRight, drawCheckbox) {
  const headers = [];

  // 넘버링 옵션
  if (options.includeNumbering) {
    headers.push('No.');
  }

  // 체크박스 옵션
  if (options.includeCheckbox) {
    headers.push('');
  }

  // 통일된 헤더 사용
  headers.push('Item');
  headers.push('Meaning');

  const tableBody = sentences.map((item, index) => {
    const row = [];

    // 넘버링
    if (options.includeNumbering) {
      row.push({
        content: `${index + 1}.`,
        styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fontSize: 9 }
      });
    }

    // 체크박스
    if (options.includeCheckbox) {
      row.push({
        content: '',
        styles: { halign: 'center', valign: 'middle', fontSize: 9, fontStyle: 'normal' }
      });
    }

    row.push({
      content: item.word || item.original,
      styles: { fontStyle: 'normal', fontSize: 9, halign: 'left', valign: 'middle' }
    });

    // 레이아웃 타입에 따른 예시 표시
    if (options.layoutType === 'memorization') {
      row.push({
        content: ' ',
        styles: { halign: 'center', valign: 'middle' }
      });
    } else {
      // 학습용: 활용 예시 표시
      let examplesText = '';
      if (item.examples && item.examples.length > 0) {
        examplesText = 'Usage Examples:\n' + item.examples.map((ex, idx) => `${idx + 1}. ${ex}`).join('\n');
      }
      if (item.similarExpressions && item.similarExpressions.length > 0) {
        if (examplesText) examplesText += '\n\n';
        examplesText += item.similarExpressions[0];
      }
      row.push(examplesText || '-');
    }

    return row;
  });

  const checkboxColIndex = options.includeNumbering ? 1 : 0;

  // 컬럼 너비 설정 (고정)
  const columnStyles = {};
  let colIndex = 0;

  if (options.includeNumbering) {
    columnStyles[colIndex] = { cellWidth: 12 }; // No. 컬럼
    colIndex++;
  }

  if (options.includeCheckbox) {
    columnStyles[colIndex] = { cellWidth: 10 }; // 체크박스 컬럼
    colIndex++;
  }

  // Item과 Meaning 컬럼은 나머지 공간을 균등 분배
  const pageWidth = 210; // A4 width in mm
  const usedWidth = marginLeft + marginRight + (options.includeNumbering ? 12 : 0) + (options.includeCheckbox ? 10 : 0);
  const remainingWidth = pageWidth - usedWidth;
  const itemWidth = remainingWidth * 0.4; // 40%
  const meaningWidth = remainingWidth * 0.6; // 60%

  columnStyles[colIndex] = { cellWidth: itemWidth }; // Item 컬럼
  columnStyles[colIndex + 1] = { cellWidth: meaningWidth }; // Meaning 컬럼

  // 전체 데이터를 한 번에 테이블로 생성 (autoTable이 자동으로 페이지 넘김 처리)
  autoTable(doc, {
    head: [headers],
    body: tableBody,
    startY: startY,
    margin: {
      left: marginLeft,
      right: marginRight
    },
    theme: 'grid',
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'normal',
      halign: 'center',
      valign: 'middle',
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    bodyStyles: {
      fontSize: 9,
      fontStyle: 'normal',
      textColor: [0, 0, 0],
      valign: 'middle',
      halign: 'left',
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249]
    },
    columnStyles: columnStyles,
    showHead: 'everyPage',
    didDrawCell: (data) => {
      if (options.includeCheckbox && data.column.index === checkboxColIndex) {
        const cellX = data.cell.x;
        const cellY = data.cell.y;
        const cellWidth = data.cell.width;
        const cellHeight = data.cell.height;
        const boxSize = 3;
        const x = cellX + (cellWidth - boxSize) / 2;
        const y = cellY + (cellHeight - boxSize) / 2;

        // 헤더는 흰색, 바디는 검은색
        if (data.section === 'head') {
          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(0.3);
          doc.rect(x, y, boxSize, boxSize);
        } else {
          drawCheckbox(doc, x, y, boxSize);
        }
      }
    }
  });

  return doc.lastAutoTable.finalY + 5; // 다음 테이블 시작 위치 반환
}

/**
 * 한글 전용 테이블 생성
 */
function createKoreanTable(doc, korean, options, startY, marginLeft, marginRight, drawCheckbox) {
  const headers = [];

  // 넘버링 옵션
  if (options.includeNumbering) {
    headers.push('No.');
  }

  // 체크박스 옵션
  if (options.includeCheckbox) {
    headers.push('');
  }

  // 통일된 헤더 사용
  headers.push('Item');
  headers.push('Meaning');

  const tableBody = korean.map((item, index) => {
    const row = [];

    // 넘버링
    if (options.includeNumbering) {
      row.push({
        content: `${index + 1}.`,
        styles: { halign: 'center', valign: 'middle', fontStyle: 'normal', fontSize: 9 }
      });
    }

    // 체크박스
    if (options.includeCheckbox) {
      row.push({
        content: '',
        styles: { halign: 'center', valign: 'middle', fontSize: 9, fontStyle: 'normal' }
      });
    }

    row.push({
      content: item.word,
      styles: { fontStyle: 'normal', fontSize: 9, halign: 'left', valign: 'middle' }
    });

    // 레이아웃 타입에 따른 표시
    if (options.layoutType === 'memorization') {
      row.push({
        content: ' ',
        styles: { halign: 'center', valign: 'middle' }
      });
    } else {
      // 학습용: 영어 단어 + 정의를 하나의 컬럼에 표시
      const englishWord = item.englishWord || item.meanings?.[0]?.meaning || '-';
      const definition = item.meanings?.[0]?.definition || '';
      const meaningText = definition ? `${englishWord}\n\n${definition}` : englishWord;
      row.push(meaningText);
    }

    return row;
  });

  const checkboxColIndex = options.includeNumbering ? 1 : 0;

  // 컬럼 너비 설정 (고정)
  const columnStyles = {};
  let colIndex = 0;

  if (options.includeNumbering) {
    columnStyles[colIndex] = { cellWidth: 12 }; // No. 컬럼
    colIndex++;
  }

  if (options.includeCheckbox) {
    columnStyles[colIndex] = { cellWidth: 10 }; // 체크박스 컬럼
    colIndex++;
  }

  // Item과 Meaning 컬럼은 나머지 공간을 균등 분배
  const pageWidth = 210; // A4 width in mm
  const usedWidth = marginLeft + marginRight + (options.includeNumbering ? 12 : 0) + (options.includeCheckbox ? 10 : 0);
  const remainingWidth = pageWidth - usedWidth;
  const itemWidth = remainingWidth * 0.4; // 40%
  const meaningWidth = remainingWidth * 0.6; // 60%

  columnStyles[colIndex] = { cellWidth: itemWidth }; // Item 컬럼
  columnStyles[colIndex + 1] = { cellWidth: meaningWidth }; // Meaning 컬럼

  // 전체 데이터를 한 번에 테이블로 생성 (autoTable이 자동으로 페이지 넘김 처리)
  autoTable(doc, {
    head: [headers],
    body: tableBody,
    startY: startY,
    margin: {
      left: marginLeft,
      right: marginRight
    },
    theme: 'grid',
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'normal',
      halign: 'center',
      valign: 'middle',
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    bodyStyles: {
      fontSize: 9,
      fontStyle: 'normal',
      textColor: [0, 0, 0],
      valign: 'middle',
      halign: 'left',
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249]
    },
    columnStyles: columnStyles,
    showHead: 'everyPage',
    didDrawCell: (data) => {
      if (options.includeCheckbox && data.column.index === checkboxColIndex) {
        const cellX = data.cell.x;
        const cellY = data.cell.y;
        const cellWidth = data.cell.width;
        const cellHeight = data.cell.height;
        const boxSize = 3;
        const x = cellX + (cellWidth - boxSize) / 2;
        const y = cellY + (cellHeight - boxSize) / 2;

        // 헤더는 흰색, 바디는 검은색
        if (data.section === 'head') {
          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(0.3);
          doc.rect(x, y, boxSize, boxSize);
        } else {
          drawCheckbox(doc, x, y, boxSize);
        }
      }
    }
  });

  return doc.lastAutoTable.finalY + 5; // 다음 테이블 시작 위치 반환
}

/**
 * 페이지 번호 추가
 */
function addPageNumbers(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);

    const pageText = `Page ${i} / ${pageCount}`;
    const textWidth = doc.getTextWidth(pageText);
    const x = (210 - textWidth) / 2;
    const y = 297 - 10;

    doc.text(pageText, x, y);
  }
}
