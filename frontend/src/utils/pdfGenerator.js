import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * PDF 생성
 * @param {Array} wordData - 단어 데이터 배열
 * @param {Object} options - 옵션 설정
 */
export const generatePDF = (wordData, options) => {
  // 1. PDF 문서 생성
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  });

  const marginLeft = 15;
  const marginRight = 15;
  const marginTop = 20;
  const marginBottom = 15;
  let startY = marginTop;

  // 2. 날짜 표시 (옵션)
  if (options.showDate) {
    const today = new Date().toISOString().split('T')[0];
    const dateStr = `학습일: ${today}`;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(dateStr, marginLeft, 15);
    startY = 25;
  }

  // 3. 테이블 헤더 구성
  const headers = [];
  if (options.showCheckbox) {
    headers.push('☐');
  }
  headers.push('단어', '의미');

  if (options.definitions > 0) headers.push('영영뜻');
  if (options.synonyms > 0) headers.push('유의어');
  if (options.antonyms > 0) headers.push('반의어');
  if (options.related > 0) headers.push('관계어');

  // 4. 테이블 데이터 구성
  const tableBody = [];

  for (const item of wordData) {
    if (item.error) {
      // 에러가 있는 단어는 스킵
      continue;
    }

    const meanings = item.meanings || [];

    for (let i = 0; i < meanings.length; i++) {
      const meaning = meanings[i];
      const row = [];

      // 체크박스
      if (options.showCheckbox) {
        if (i === 0) {
          row.push({
            content: '☐',
            rowSpan: meanings.length,
            styles: { halign: 'center', valign: 'middle' }
          });
        }
      }

      // 단어 (첫 번째 의미일 때만 추가, rowSpan 적용)
      if (i === 0) {
        row.push({
          content: item.word,
          rowSpan: meanings.length,
          styles: { fontStyle: 'bold', fontSize: 14, halign: 'center', valign: 'middle' }
        });
      }

      // 의미 (한글 뜻)
      row.push(meaning.meaning || '-');

      // 영영뜻
      if (options.definitions > 0) {
        row.push(meaning.definition || '-');
      }

      // 유의어
      if (options.synonyms > 0) {
        const synonyms = meaning.synonyms || [];
        row.push(synonyms.length > 0 ? synonyms.join(', ') : '-');
      }

      // 반의어
      if (options.antonyms > 0) {
        const antonyms = meaning.antonyms || [];
        row.push(antonyms.length > 0 ? antonyms.join(', ') : '-');
      }

      // 관계어
      if (options.related > 0) {
        const related = meaning.related || [];
        row.push(related.length > 0 ? related.join(', ') : '-');
      }

      tableBody.push(row);
    }
  }

  // 5. 테이블 생성 (autoTable 함수 직접 호출)
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
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: [255, 255, 255],
      fontSize: 12,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 11,
      textColor: [0, 0, 0],
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249]
    },
    lineColor: [221, 221, 221],
    lineWidth: 0.1,
    rowPageBreak: 'avoid'
  });

  // 6. 페이지 번호 추가
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);

    const pageText = `페이지 ${i} / 총 ${pageCount}`;
    const textWidth = doc.getTextWidth(pageText);
    const x = (210 - textWidth) / 2;
    const y = 297 - 10;

    doc.text(pageText, x, y);
  }

  // 7. 저장
  const filename = `vocapdf_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.pdf`;
  doc.save(filename);
};
