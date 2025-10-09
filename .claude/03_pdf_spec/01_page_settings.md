# VocaPDF - PDF 페이지 설정

## 📌 개요

이 문서는 VocaPDF로 생성되는 PDF 파일의 페이지 설정에 대한 모든 상세 사항을 정의합니다. 용지 크기, 방향, 여백, 페이지네이션, 스타일 등 시각적 레이아웃의 기준을 다룹니다.

---

## 📄 기본 페이지 설정

### 용지 크기

-   **A4 (210mm × 297mm)**
-   **선택 이유**:
    -   **국제 표준**: 전 세계적으로 가장 널리 사용되는 표준 용지 크기입니다.
    -   **디지털 친화적**: 태블릿(아이패드 등) 화면 비율과 유사하여 디지털 학습 환경에 최적화되어 있습니다.
    -   **인쇄 호환성**: 어떤 프린터에서든 별도 설정 없이 쉽게 인쇄할 수 있습니다.

### 용지 방향

-   **세로 (Portrait)**
-   **선택 이유**:
    -   단어와 뜻을 나열하는 테이블 형태의 콘텐츠에 가장 적합한 방향입니다.
    -   태블릿을 세로 모드로 사용할 때의 가독성이 뛰어납니다.

---

## 📐 여백 (Margins) 및 콘텐츠 영역

### 여백 값

-   **상단 (Top)**: 20mm
-   **하단 (Bottom)**: 15mm
-   **좌측 (Left)**: 15mm
-   **우측 (Right)**: 15mm

### 콘텐츠 영역

-   설정된 여백을 제외한 실제 콘텐츠가 표시되는 영역입니다.
-   **너비**: 210mm - (15mm + 15mm) = **180mm**
-   **높이**: 297mm - (20mm + 15mm) = **262mm**

---

## 🔢 페이지네이션 및 분할

### 페이지 번호

-   **위치**: 페이지 하단 중앙
-   **형식**: `페이지 1 / 총 5`
-   **스타일**: 폰트 크기 10pt, 회색(#666666), 중앙 정렬
-   **구현 예시**:
    ```javascript
    // jsPDF로 모든 페이지에 번호를 추가하는 로직
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102); // #666

      const pageText = `페이지 ${i} / 총 ${pageCount}`;
      const textWidth = doc.getTextWidth(pageText);
      const x = (210 - textWidth) / 2; // 가로 중앙 정렬
      const y = 297 - 10; // 하단 여백 내 위치

      doc.text(pageText, x, y);
    }
    ```

### 자동 페이지 나누기

`jsPDF-AutoTable` 라이브러리가 테이블 내용의 길이에 따라 자동으로 페이지를 나눕니다. 한 페이지에 대략 **18~22개**의 단어(의미 1개 기준)가 들어갑니다.

### 페이지 분할 규칙

**한 단어의 여러 의미가 페이지에 걸쳐 분리되지 않도록 합니다.** 예를 들어 'computer'의 의미 1과 의미 2는 항상 같은 페이지에 위치해야 합니다. 이는 `jspdf-autotable`의 `rowPageBreak: 'avoid'` 옵션을 통해 구현됩니다.

---

## 🎨 헤더 및 스타일

### 날짜 표시 (옵션)

-   사용자가 날짜 표시 옵션을 선택하면 PDF 상단에 학습일이 추가됩니다.
-   **위치**: 페이지 좌측 상단 (X: 15mm, Y: 15mm)
-   **형식**: `학습일: YYYY-MM-DD` (e.g., `학습일: 2025-10-09`)
-   **스타일**: 폰트 크기 12pt, 검은색
-   **구현 예시**:
    ```javascript
    // 테이블 생성 전 날짜를 추가하는 로직
    let tableStartY = 20; // 기본 테이블 시작 위치(Y)

    if (options.date) {
      const today = new Date().toISOString().split('T')[0];
      const dateStr = `학습일: ${today}`;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(dateStr, 15, 15);

      tableStartY = 25; // 날짜가 있으면 테이블을 조금 더 아래에서 시작
    }

    doc.autoTable({
      startY: tableStartY,
      // ...
    });
    ```

### 행 높이

-   **자동 조절**: 기본적으로 `jspdf-autotable`이 콘텐츠(특히 긴 영영뜻)의 길이에 따라 행 높이를 자동으로 조절합니다.
-   **최소 높이**: 가독성을 위해 내용이 짧더라도 최소한의 행 높이를 보장합니다.

---

## 🎯 사용 환경 최적화

### 🖨️ 인쇄

-   **권장 설정**: A4 용지, 세로 방향, 여백 자동, 배율 100%
-   PDF는 벡터 기반으로 생성되므로 인쇄 시 폰트나 라인이 깨지지 않습니다.

### 📱 디지털 (태블릿)

-   A4 비율은 아이패드 등 대부분의 태블릿 화면(4:3 비율)과 유사하여 별도의 확대/축소 없이도 쾌적한 학습 경험을 제공합니다.
-   텍스트가 선명하여 필요시 확대해서 봐도 품질 저하가 없습니다.

---

## 🔧 최종 `jsPDF` 설정 요약

```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// 1. 문서 생성
const doc = new jsPDF({
  orientation: 'portrait',  // 세로
  unit: 'mm',               // 단위: 밀리미터
  format: 'a4',             // A4 용지
  putOnlyUsedFonts: true,   // 사용된 폰트만 포함
  compress: true            // 압축하여 파일 크기 최적화
});

// 2. 여백 및 시작 위치 정의
const marginLeft = 15;
const marginRight = 15;
const marginTop = 20;
const marginBottom = 15;
let startY = marginTop;

// 3. 날짜 표시 (옵션)
if (options.date) {
  const dateStr = `학습일: ${getTodayDate()}`;
  doc.text(dateStr, marginLeft, 15);
  startY = 25; // 테이블 시작 위치 조정
}

// 4. 테이블 생성
doc.autoTable({
  startY: startY,
  margin: {
    top: marginTop,
    bottom: marginBottom,
    left: marginLeft,
    right: marginRight
  },
  // ... 테이블 데이터 및 스타일 옵션 ...
});

// 5. 페이지 번호 추가
addPageNumbers(doc);

// 6. 저장
doc.save('vocapdf.pdf');
```

---

## 📝 문서 이력
- 2025-10-09: 초안 작성