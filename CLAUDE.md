# VocaPDF - 프로젝트 메모리

> 영어 단어, 숙어, 문장을 조회하고 PDF 단어장으로 만드는 웹 애플리케이션

## 🎯 핵심 정보

**버전**: v0.2.0
**스택**: React 19 + Vite / Node.js 18+ + Express
**API**: Lingua Robot API (주) + Free Dictionary API (fallback)
**포트**: Frontend 5173 / Backend 5001

## 📁 프로젝트 구조

```
vocapdf/
├── backend/              # Express REST API
│   ├── src/
│   │   ├── services/     # linguaRobotService, dictionaryService
│   │   ├── routes/       # dictionary, upload
│   │   └── utils/        # inputTypeDetector, meaningExtractor
│   └── .env             # LINGUA_ROBOT_API_KEY 필요
│
├── frontend/            # React + Vite
│   ├── src/
│   │   ├── services/    # dictionaryApi
│   │   └── utils/       # pdfGenerator
│   └── App.jsx          # 메인 컴포넌트
│
└── .claude/
    ├── commands/        # 커스텀 슬래시 커맨드
    └── docs/           # 상세 문서
```

## 🚀 빠른 시작

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (새 터미널)
cd frontend && npm install && npm run dev
```

## 💡 핵심 기능

1. **입력 유형 자동 감지**: 단어/숙어/문장 자동 구분
2. **다중 API**: Lingua Robot (주) + Free Dictionary (fallback)
3. **의미 표시 옵션**: 영영/한영/영영+한영
4. **출력 형식**: 통합/분류 (단어-숙어-문장 별도 섹션)
5. **PDF 생성**: jsPDF + autotable

## 🔑 주요 파일

### Backend
- `services/dictionaryService.js` - API 호출 + 재시도 로직
- `services/linguaRobotService.js` - Lingua Robot API 통합
- `utils/inputTypeDetector.js` - 단어/숙어/문장 감지
- `utils/meaningExtractor.js` - 의미 추출 + meaningDisplay 옵션

### Frontend
- `App.jsx` - 메인 UI (meaningDisplay + outputFormat 옵션)
- `utils/pdfGenerator.js` - PDF 생성 (통합/분류 형식)

## 📝 코딩 컨벤션

- **Backend**: CommonJS (require/module.exports)
- **Frontend**: ES6 Modules (import/export)
- **네이밍**: camelCase (함수/변수), PascalCase (컴포넌트)
- **에러 처리**: try-catch + 일관된 에러 응답

## ⚠️ 중요 사항

1. **macOS 포트**: 5000번 피하기 (AirPlay 충돌) → 5001 사용
2. **API 키**: `.env`에 `LINGUA_ROBOT_API_KEY` 필수
3. **PDF 한글**: 한글 폰트 미포함 (addFont로 추가 가능)
4. **최대 입력**: 500개 항목, 5MB 파일

## 🎨 API 엔드포인트

### POST /api/dictionary/lookup
```json
{
  "words": ["apple", "kick the bucket"],
  "options": {
    "meanings": 2,
    "definitions": 1,
    "meaningDisplay": "english-only",
    "outputFormat": "unified"
  }
}
```

### POST /api/upload
multipart/form-data - .txt/.csv/.md 파일

## 📚 추가 문서

- 상세 API 명세: `.claude/docs/api_spec.md`
- 아키텍처: `.claude/docs/architecture.md`
- 개발 가이드: `.claude/docs/development.md`

## 🔧 커스텀 명령어

- `/review` - 코드 리뷰 (보안/성능/버그)
- `/cleanup` - 코드 정리 (unused imports, console.log)
- `/test` - 테스트 실행 및 결과 분석
- `/deploy` - 배포 프로세스

## 💬 팀 노트

- Lingua Robot API 없으면 Free Dictionary만 사용 (숙어/문장 불가)
- PDF 생성 시 rowSpan으로 다의어 병합
- 입력 유형 감지: 대문자 시작 + 문장부호 = 문장, 2-5단어 = 숙어
