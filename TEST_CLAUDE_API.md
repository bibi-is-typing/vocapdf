# Claude API Fallback 테스트 가이드

## 🎯 테스트 목적
무료 API 실패 시 Claude API를 백업으로 사용하는 기능 검증

## 📋 구현된 API 플로우

```
1차: Lingua Robot API (LINGUA_ROBOT_API_KEY 있을 경우)
   ↓ 실패
2차: Free Dictionary API (무료, 항상 시도)
   ↓ 실패
3차: Claude API (ANTHROPIC_API_KEY 있을 경우)
   ↓ 실패
에러 반환
```

## 🔧 테스트 준비

### 1. API 키 설정
`backend/.env` 파일에 다음 설정:

```env
# Lingua Robot API (선택사항)
LINGUA_ROBOT_API_KEY=

# Anthropic Claude API (필수)
ANTHROPIC_API_KEY=your_actual_api_key_here
```

### 2. 서버 재시작
```bash
# Backend 재시작 (API 키 반영)
cd backend
npm run dev

# Frontend는 그대로 유지
```

## 📝 테스트 시나리오

### ✅ 시나리오 1: Free Dictionary API 성공
**목적**: 무료 API가 정상 동작하면 Claude API를 호출하지 않음

**테스트 단어**:
```
apple
computer
book
```

**예상 결과**:
- ✅ 모든 단어 조회 성공
- ✅ API 출처: `[Free Dictionary]` (녹색 배지)
- ✅ Backend 로그에 Claude API 호출 없음

**확인 사항**:
1. 미리보기에서 각 단어 옆에 `[Free Dictionary]` 배지 표시
2. Backend 터미널에서 "trying Claude API" 메시지 없음

---

### ✅ 시나리오 2: Free API 실패 → Claude API 성공
**목적**: Free Dictionary에 없는 단어를 Claude가 처리

**테스트 단어** (Free Dictionary에 없는 단어들):
```
yeet
stonks
pogchamp
sus
copium
```

**예상 결과**:
- ✅ Claude API가 정의 제공
- ✅ API 출처: `[Claude AI]` (보라색 배지)
- ✅ Backend 로그:
  ```
  Free Dictionary failed for "yeet", trying Claude API...
  ```

**확인 사항**:
1. 미리보기에서 `[Claude AI]` 배지 표시
2. 한국어 의미 포함 (Claude가 제공)
3. Backend 로그에서 API 호출 순서 확인

---

### ✅ 시나리오 3: 둘 다 실패
**목적**: 모든 API가 실패할 때 적절한 에러 처리

**테스트 단어** (존재하지 않는 단어):
```
xyzabc123
qwertyzxcv
asdfghjkl999
```

**예상 결과**:
- ❌ "사전에서 찾을 수 없습니다" 에러 메시지
- ✅ API 출처: `[Not Found]` (노란색 배지)
- ✅ Backend 로그:
  ```
  Free Dictionary failed for "xyzabc123", trying Claude API...
  Claude API also failed for "xyzabc123"
  ```

**확인 사항**:
1. 에러 메시지가 빨간색으로 표시
2. `[Not Found]` 배지 표시
3. PDF 생성 시 해당 단어 제외

---

### ✅ 시나리오 4: 혼합 테스트
**목적**: 세 가지 상황이 섞여 있을 때 올바른 동작

**테스트 단어**:
```
apple
yeet
xyzabc123
book
stonks
computer
```

**예상 결과**:
- `apple`, `book`, `computer`: `[Free Dictionary]` (녹색)
- `yeet`, `stonks`: `[Claude AI]` (보라색)
- `xyzabc123`: `[Not Found]` (노란색)

---

### ✅ 시나리오 5: 숙어 및 문장 테스트
**목적**: 단어 외 입력 타입도 Claude API 지원 확인

**테스트 입력**:
```
kick the bucket
break the ice
She loves reading books.
```

**예상 결과**:
- 숙어: Claude API가 처리 (Free Dictionary 실패 시)
- 문장: Claude API가 번역 제공
- API 출처 배지 표시

---

## 🐛 디버깅 체크리스트

### Backend 로그 확인
```bash
# Backend 터미널에서 확인할 메시지들
✅ "Free Dictionary failed for XXX, trying Claude API..."
✅ "Trying Claude API for sentence: XXX"
✅ "Claude API also failed for XXX"
```

### Frontend 개발자 도구 확인
1. **Network 탭**:
   - `POST /api/dictionary/lookup` 요청
   - Response에서 `source` 필드 확인

2. **Console 탭**:
   - 에러 메시지 확인
   - API 응답 구조 확인

### 일반적인 문제 해결

**문제 1**: "Anthropic API key is not configured" 에러
- **해결**: `.env` 파일에 `ANTHROPIC_API_KEY` 추가 후 서버 재시작

**문제 2**: Claude API 호출이 너무 느림
- **원인**: Claude API는 AI 모델 추론이 필요해서 1-3초 소요
- **정상**: 로딩 스피너가 표시되어야 함

**문제 3**: JSON parsing 에러
- **원인**: Claude가 마크다운 코드 블록으로 감싸서 응답
- **해결**: `claudeService.js`에서 이미 처리됨 (140-142번 줄)

**문제 4**: 한국어 의미가 표시 안 됨
- **확인**: `meaningDisplay` 옵션이 "영영 뜻만"으로 설정되어 있는지 확인
- **해결**: "한영 뜻만" 또는 "영영+한영"으로 변경

---

## 📊 성공 기준

✅ **모든 시나리오 통과**
- [ ] 시나리오 1: Free API 성공 케이스
- [ ] 시나리오 2: Free 실패 → Claude 성공
- [ ] 시나리오 3: 둘 다 실패
- [ ] 시나리오 4: 혼합 테스트
- [ ] 시나리오 5: 숙어/문장 테스트

✅ **API 출처 배지 정상 표시**
- [ ] Free Dictionary: 녹색
- [ ] Claude AI: 보라색
- [ ] Lingua Robot: 파란색 (API 키 있을 경우)
- [ ] Not Found: 노란색
- [ ] Error: 빨간색

✅ **성능 및 사용자 경험**
- [ ] 로딩 상태 표시 정상
- [ ] 에러 메시지 명확함
- [ ] PDF 생성 시 출처 정보 포함 (선택사항)

---

## 💰 비용 고려사항

### Claude API 비용
- **모델**: claude-3-5-sonnet-20241022
- **예상 비용**: 단어당 약 $0.001-0.003
- **무료 크레딧**: Anthropic 계정 생성 시 $5 제공

### 비용 절감 팁
1. Free Dictionary에서 최대한 많이 처리 (무료)
2. Lingua Robot API 사용 (월 구독형, 무제한)
3. Claude API는 마지막 fallback으로만 사용

---

## 📄 구현 파일 목록

### Backend
- ✅ `backend/src/services/claudeService.js` - Claude API 통합
- ✅ `backend/src/services/dictionaryService.js` - Fallback 로직
- ✅ `backend/src/utils/meaningExtractor.js` - Claude 응답 파싱
- ✅ `backend/src/config/constants.js` - API 키 설정
- ✅ `backend/.env` - 환경 변수

### Frontend
- ✅ `frontend/src/App.jsx` - API 출처 배지 표시
- ✅ `frontend/src/App.css` - 배지 스타일링

---

## 🚀 다음 단계 (선택사항)

1. **PDF에 API 출처 표시**
   - 각 단어 옆에 출처 아이콘 추가

2. **API 사용 통계**
   - 각 API별 사용 횟수 표시
   - 비용 추정 기능

3. **캐싱 구현**
   - 이전에 조회한 단어 재사용
   - API 호출 횟수 감소

4. **단위 테스트**
   - `claudeService.test.js` 작성
   - Mock 데이터로 자동 테스트
