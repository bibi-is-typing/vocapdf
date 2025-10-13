import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// pdfMake에 폰트 등록
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (pdfFonts.default && pdfFonts.default.pdfMake) {
  pdfMake.vfs = pdfFonts.default.pdfMake.vfs;
} else {
  pdfMake.vfs = pdfFonts;
}

/**
 * PDF 생성 (table with zero borders)
 * @param {Array} wordData - 단어 데이터 배열
 * @param {Object} options - 옵션 설정
 */
export const generatePDF = (wordData, options) => {
  try {
    // 출력 형식에 따라 데이터 처리
    let content = [];

    // 날짜 표시
    if (options.customDate) {
      content.push({
        text: `Date: ${options.customDate}`,
        fontSize: 12,
        color: '#646464',
        margin: [0, 0, 0, 8]
      });
    }

    // PDF 스타일에 따라 콘텐츠 생성
    if (options.pdfStyle === 'table') {
      content = content.concat(generateTableContent(wordData, options));
    } else {
      content = content.concat(generateUnifiedContent(wordData, options));
    }

    // 문서 정의
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [50, 70, 50, 70], // 여백 증가 (좌, 상, 우, 하)
      content: content,
      footer: function(currentPage, pageCount) {
        return {
          text: `Page ${currentPage} / ${pageCount}`,
          alignment: 'center',
          fontSize: 12,
          color: '#666666',
          margin: [0, 10, 0, 0]
        };
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 12
      },
      styles: {
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'white',
          fillColor: '#1e3a8a',
          alignment: 'left'
        }
      }
    };

    const filename = `vocapdf_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);

    return { success: true, filename };
  } catch (error) {
    throw error;
  }
};

/**
 * 통합 형식 콘텐츠 생성 (simple text format - no dividers, no labels)
 */
function generateUnifiedContent(wordData, options) {
  const content = [];

  let numberCounter = 1;

  for (const item of wordData) {
    if (item.error) continue;

    // 타입별 처리
    let itemText = '';
    let meaningText = '';

    if (item.type === 'sentence') {
      itemText = item.word;
      if (options.layoutType === 'memorization') {
        meaningText = '';
      } else {
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
    } else if (item.type === 'korean') {
      itemText = `${item.word} → ${item.englishWord || item.meanings?.[0]?.meaning || ''}`;
      if (options.layoutType !== 'memorization') {
        if (options.meaningDisplay === 'korean' || options.meaningDisplay === 'both') {
          meaningText = item.englishWord || item.meanings?.[0]?.meaning || '-';
        }
        if (options.meaningDisplay === 'english' || options.meaningDisplay === 'both') {
          const def = item.meanings?.[0]?.definition || '';
          if (def) {
            meaningText = meaningText ? `${meaningText}\n${def}` : def;
          }
        }
      }
    } else {
      // 일반 단어/숙어
      const meanings = item.meanings || [];
      if (meanings.length === 0) continue;

      const meaning = meanings[0];
      itemText = item.word;

      if (options.layoutType !== 'memorization') {
        if (options.meaningDisplay === 'korean' || options.meaningDisplay === 'both') {
          meaningText = meaning.meaning || '-';
        }
        if (options.meaningDisplay === 'english' || options.meaningDisplay === 'both') {
          const def = meaning.definition || '-';
          meaningText = meaningText ? `${meaningText}\n${def}` : def;
          if (meaning.examples && meaning.examples.length > 0) {
            meaningText += `\nExample: ${meaning.examples[0]}`;
          }
        }
      }
    }

    // 번호 또는 불릿
    const prefix = options.includeNumbering ? `[${numberCounter}]` : '•';
    if (options.includeNumbering) numberCounter++;

    // columns 레이아웃 사용: 미리보기와 동일한 구조
    // 1. 단어 행: prefix + itemText
    content.push({
      columns: [
        {
          width: 35,  // [500]까지 수용 가능하도록 넓게 설정
          text: { text: prefix, bold: true, color: '#1e3a8a', fontSize: 12 }
        },
        {
          width: '*',
          text: { text: itemText, bold: true, color: '#1e3a8a', fontSize: 12 }
        }
      ],
      columnGap: 5,
      margin: [0, 0, 0, 2]
    });

    // 2. 의미 행: 들여쓰기 + ": meaningText" (공백 없이)
    if (options.layoutType !== 'memorization' && meaningText) {
      content.push({
        columns: [
          {
            width: 35,  // prefix 공간과 동일
            text: ''  // prefix 공간만큼 비움
          },
          {
            width: '*',
            text: [
              { text: ': ', bold: true, color: '#1e3a8a', fontSize: 12 },
              {
                text: meaningText || '-',
                fontSize: 12,
                bold: false,
                preserveLeadingSpaces: true
              }
            ],
            lineHeight: 1.4
          }
        ],
        columnGap: 5,
        margin: [0, 0, 0, 14]
      });
    } else {
      // 암기용 또는 의미 없음: 여백만 추가
      content.push({
        text: '',
        margin: [0, 0, 0, 14]
      });
    }
  }

  return content;
}

/**
 * 테이블 형식 콘텐츠 생성
 */
function generateTableContent(wordData, options) {
  const content = [];

  // 테이블 헤더 구성
  const headerRow = [];
  const widths = [];

  if (options.includeNumbering) {
    headerRow.push({ text: 'No.', style: 'tableHeader', alignment: 'center' });
    widths.push(30);
  }

  headerRow.push({ text: 'Item', style: 'tableHeader' });
  headerRow.push({ text: 'Meaning', style: 'tableHeader' });
  widths.push('40%');
  widths.push('*');

  // 테이블 바디 구성
  const bodyRows = [headerRow];
  let numberCounter = 1;

  for (const item of wordData) {
    if (item.error) continue;

    const row = [];

    // 번호
    if (options.includeNumbering) {
      row.push({ text: numberCounter++, alignment: 'center', fontSize: 10 });
    }

    // Item (단어/숙어/문장)
    let itemText = '';
    let meaningText = '';

    if (item.type === 'sentence') {
      itemText = item.word;
      if (options.layoutType !== 'memorization') {
        let examplesText = [];
        if (item.examples && item.examples.length > 0) {
          item.examples.forEach((ex, idx) => {
            examplesText.push(`${idx + 1}. ${ex}`);
          });
        }
        if (item.similarExpressions && item.similarExpressions.length > 0) {
          if (examplesText.length > 0) examplesText.push('');
          examplesText.push(item.similarExpressions[0]);
        }
        meaningText = examplesText.join('\n');
      }
    } else if (item.type === 'korean') {
      itemText = `${item.word} → ${item.englishWord || item.meanings?.[0]?.meaning || ''}`;
      if (options.layoutType !== 'memorization') {
        meaningText = item.englishWord || item.meanings?.[0]?.meaning || '-';
        if (item.meanings?.[0]?.definition) {
          meaningText += `\n${item.meanings[0].definition}`;
        }
      }
    } else {
      // 일반 단어/숙어
      const meanings = item.meanings || [];
      if (meanings.length === 0) continue;

      const meaning = meanings[0];
      itemText = item.word;

      if (options.layoutType !== 'memorization') {
        meaningText = meaning.definition || '-';
        if (meaning.examples && meaning.examples.length > 0) {
          meaningText += `\nExample: ${meaning.examples[0]}`;
        }
      }
    }

    row.push({ text: itemText, fontSize: 10 });
    row.push({
      text: options.layoutType === 'memorization' ? '' : meaningText,
      fontSize: 10,
      lineHeight: 1.4
    });

    bodyRows.push(row);
  }

  // 테이블 추가
  content.push({
    table: {
      headerRows: 1,
      widths: widths,
      body: bodyRows
    },
    layout: {
      fillColor: function (rowIndex) {
        return rowIndex === 0 ? '#1e3a8a' : (rowIndex % 2 === 0 ? '#f9faf7' : null);
      },
      hLineWidth: function () {
        return 1;
      },
      vLineWidth: function () {
        return 1;
      },
      hLineColor: function () {
        return '#dddddd';
      },
      vLineColor: function () {
        return '#dddddd';
      }
    },
    margin: [0, 0, 0, 0]
  });

  return content;
}

