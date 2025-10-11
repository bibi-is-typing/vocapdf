# VocaPDF - 프로젝트 메모리

> 영어 단어, 숙어, 문장을 조회하고 PDF 단어장으로 만드는 웹 애플리케이션

## 🎯 핵심 정보

**버전**: v0.3.0
**스택**: React 19 + Vite 7 / Node.js 18+ + Express
**UI**: shadcn/ui + Tailwind CSS 3
**API**: Free Dictionary (1차) → Oxford (2차) → Gemini 2.0 Flash (3차)
**포트**: Frontend 5173 / Backend 5001

## 📁 프로젝트 구조

```
vocapdf/
├── backend/              # Express REST API
│   ├── src/
│   │   ├── services/     # dictionaryService, geminiService, oxfordDictionaryService
│   │   ├── routes/       # dictionary, upload
│   │   └── utils/        # inputTypeDetector, meaningExtractor, fileParser
│   └── .env              # GEMINI_API_KEY (필수), OXFORD_APP_ID/KEY (선택)
│
├── frontend/             # React + Vite + shadcn/ui
│   ├── src/
│   │   ├── components/   # PDFPreview, ui/button, ui/card, etc.
│   │   ├── services/     # dictionaryApi
│   │   └── utils/        # pdfGenerator
│   └── App.jsx           # 메인 컴포넌트
│
└── .claude/
    ├── commands/         # 커스텀 슬래시 커맨드
    └── docs/             # 상세 문서
```

## 🚀 빠른 시작

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (새 터미널)
cd frontend && npm install && npm run dev
```

**필수**: `.env` 파일에 `GEMINI_API_KEY` 설정 필요

## 💡 핵심 기능

1. **CEFR 레벨별 맞춤 정의**: A2~C1 레벨에 맞춘 단어 설명
2. **입력 유형 자동 감지**: 단어/숙어/문장 자동 구분
3. **다중 API Fallback**: Free Dictionary → Oxford → Gemini 순서
4. **레이아웃 옵션**: 학습용 (예문 포함) / 암기용 (빈칸 채우기)
5. **실시간 진행률 표시**: 단어 조회 중 퍼센트 기반 진행 상황
6. **PDF 생성**: jsPDF + autotable

## 🔑 주요 파일

### Backend
- `services/dictionaryService.js` - API 조회 오케스트레이션 + 재시도 로직
- `services/geminiService.js` - Google Gemini 2.0 Flash API 통합
- `services/oxfordDictionaryService.js` - Oxford Dictionary API 통합
- `utils/inputTypeDetector.js` - 단어/숙어/문장 감지
- `utils/meaningExtractor.js` - 의미 추출 + meaningDisplay 옵션
- `utils/fileParser.js` - 파일 파싱 및 단어 정제

### Frontend
- `App.jsx` - 메인 UI (CEFR 레벨, 레이아웃 옵션)
- `components/PDFPreview.jsx` - PDF 미리보기
- `components/ui/` - shadcn/ui 컴포넌트 (Button, Card, Input, etc.)
- `utils/pdfGenerator.js` - PDF 생성 (학습용/암기용 레이아웃)
- `services/dictionaryApi.js` - Backend API 통신

## 📝 코딩 컨벤션

- **Backend**: CommonJS (require/module.exports)
- **Frontend**: ES6 Modules (import/export)
- **네이밍**: camelCase (함수/변수), PascalCase (컴포넌트)
- **에러 처리**: try-catch + 일관된 에러 응답
- **Console 로깅**: 프로덕션 코드에서 console.log 사용 금지

## ⚠️ 중요 사항

1. **macOS 포트**: 5000번 피하기 (AirPlay 충돌) → 5001 사용
2. **API 키**:
   - `GEMINI_API_KEY` (필수): https://aistudio.google.com/apikey
   - `OXFORD_APP_ID`, `OXFORD_APP_KEY` (선택): https://developer.oxforddictionaries.com
3. **한글 지원 중단**: 영어 전용 앱 (한글 폰트 제거로 번들 크기 감소)
4. **최대 입력**: 500개 항목, 5MB 파일

## 🎨 API 엔드포인트

### POST /api/dictionary/lookup
```json
{
  "words": ["apple", "make up for", "How are you?"],
  "options": {
    "meanings": 1,
    "definitions": 1,
    "synonyms": 0,
    "antonyms": 0,
    "related": 0,
    "meaningDisplay": "english",
    "cefrLevel": "A2",
    "outputFormat": "input-order"
  }
}
```

### POST /api/upload
multipart/form-data - .txt/.csv/.md 파일

## 🔄 API Fallback 전략

1. **Free Dictionary API** (1차)
   - 무료, rate limit 가능성
   - 단어만 지원 (숙어/문장 미지원)

2. **Oxford Dictionary API** (2차)
   - 고품질 영어 정의
   - API 키 필요 (유료)
   - `cefrLevel` 옵션 지원

3. **Google Gemini 2.0 Flash** (3차)
   - 무료 (일일 요청 제한)
   - 단어/숙어/문장 모두 지원
   - CEFR 레벨별 맞춤 설명
   - 한국어 번역 제공

## 📚 추가 문서

- 상세 API 명세: `.claude/docs/05_api/`
- 아키텍처: `.claude/docs/02_architecture/`
- 개발 가이드: `.claude/docs/04_development/`
- PDF 사양: `.claude/docs/03_pdf_spec/`

## 🔧 커스텀 명령어

- `/review` - 코드 리뷰 (보안/성능/버그)
- `/cleanup` - 코드 정리 (unused imports, console.log)
- `/test` - 테스트 실행 및 결과 분석
- `/deploy` - 배포 프로세스

## 💬 개발 노트

### API 전환 이력
- **v0.1.0**: Free Dictionary API만 사용
- **v0.2.0**: Lingua Robot API 추가 (유료 → 제거됨)
- **v0.3.0**: Gemini 2.0 Flash + Oxford API 통합

### 성능 최적화
- Console 로그 40개+ 제거
- Dead code 제거 (unused imports, functions)
- 한글 폰트 제거로 번들 크기 ~1.5MB 감소
- API 병렬 처리 (배치 크기 10)

### UI/UX 개선
- shadcn/ui 기반 컴포넌트 시스템
- Tailwind CSS 3 + CVA (class-variance-authority)
- Toss 스타일의 친근한 한국어 UI
- 실시간 진행률 표시 (0% → 90% 시뮬레이션)
- 반응형 디자인 (모바일/태블릿/데스크톱)
- **검색 후 입력 잠금**: 검색 완료 후 입력창/파일업로드 비활성화, "다시 입력" 버튼으로만 해제
- **레벨 변경 감지**: CEFR 레벨 변경 시 "다시 검색" 버튼 활성화 + 알림 표시
- **통계 카드 일관성**: 입력/검색완료/제외 카드 모두 동일한 디자인 적용
- **CEFR 배지 개선**: 레벨 배지 높이 증가로 가독성 향상

### 입력 처리
- **단어**: 공백 없는 영문자
- **숙어**: 2~5개 단어로 구성
- **문장**: 대문자로 시작 + 문장부호 종료
- **쉼표 구분**: 5단어 이하 + 문장부호 없을 때만 분리

### PDF 생성
- **학습용**: 단어 + 뜻 + 예문
- **암기용**: 단어 + 빈칸
- **옵션**: 체크박스, 번호, 날짜 표시
- **테마**: 'grid' (셀 테두리 가시성)
- **폰트**: Roboto (기본), Roboto Mono (code)

## 🐛 알려진 이슈

1. **한글 입력 제한**: 영어만 지원 (한글 입력 시 검증 에러)
2. **Gemini API 제한**: 무료 플랜 일일 요청 제한
3. **Oxford API 비용**: 유료 플랜 필요 (선택 사항)
4. **macOS 포트 충돌**: AirPlay Receiver (5000번 포트)

## 🎯 다음 버전 계획 (v0.4.0)

- [ ] 단어 즐겨찾기 기능
- [ ] 학습 히스토리 저장 (LocalStorage)
- [ ] 다크 모드 완전 지원
- [ ] PWA 지원 (오프라인 사용)
- [ ] 발음 기호 표시 개선
- [ ] 예문 추가 옵션

---

**마지막 업데이트**: 2025-01-11 (v0.3.1 - UI/UX 개선)
