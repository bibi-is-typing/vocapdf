# 🚀 Claude API Fallback - 빠른 시작 가이드

## ⚡ 3분 안에 시작하기

### 1️⃣ API 키 발급 (1분)
1. https://console.anthropic.com/ 접속
2. 계정 생성 (무료 $5 크레딧 제공)
3. API Keys 메뉴에서 새 키 생성
4. `sk-ant-api03-xxxxx...` 형식의 키 복사

### 2️⃣ 환경 설정 (30초)
```bash
# backend/.env 파일 편집
nano backend/.env

# 다음 줄 추가
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

### 3️⃣ 서버 재시작 (30초)
```bash
# Backend 서버 재시작 (Ctrl+C 후)
cd backend
npm run dev

# Frontend는 그대로 유지
```

### 4️⃣ 테스트 (1분)
웹 브라우저에서 http://localhost:5173 접속 후:

```
yeet
stonks
sus
```

입력하고 "단어 조회" 클릭

**예상 결과**: 보라색 `[Claude AI]` 배지와 함께 정의 표시 ✨

---

## 🎯 작동 원리

```
입력: "yeet" (Free Dictionary에 없는 신조어)

1. Free Dictionary API 호출
   ↓ "404 Not Found"

2. Claude API 호출 ✨
   ↓ 성공!

결과: "던지다, 버리다" [Claude AI]
```

---

## 📊 API 출처 배지 안내

| 배지 | 의미 | 색상 |
|------|------|------|
| **[Free Dictionary]** | 무료 사전 API | 🟢 녹색 |
| **[Claude AI]** | AI 기반 사전 | 🟣 보라색 |
| **[Lingua Robot]** | 유료 프리미엄 API | 🔵 파란색 |
| **[Not Found]** | 모든 API 실패 | 🟡 노란색 |
| **[Error]** | 네트워크 에러 | 🔴 빨간색 |

---

## 🧪 테스트 단어 추천

### ✅ Free Dictionary 성공 (무료)
```
apple, book, computer, happy, run
```

### ✅ Claude AI 필요 (신조어)
```
yeet, stonks, pogchamp, sus, copium, rizz
```

### ❌ 모두 실패 (존재하지 않음)
```
xyzabc123, qwertyzxcv, asdfghjkl999
```

---

## 💰 비용 계산기

| 단어 수 | Free Dictionary | Claude API | 예상 비용 |
|---------|-----------------|------------|-----------|
| 100단어 | 80개 성공 | 20개 사용 | **$0.04** |
| 500단어 | 400개 성공 | 100개 사용 | **$0.20** |
| 1,000단어 | 800개 성공 | 200개 사용 | **$0.40** |

**무료 크레딧 $5로 약 2,500단어 조회 가능!**

---

## ⚠️ 문제 해결

### "API key is not configured" 에러
```bash
# .env 파일 확인
cat backend/.env | grep ANTHROPIC

# 없으면 추가
echo "ANTHROPIC_API_KEY=your_key_here" >> backend/.env

# 서버 재시작
cd backend
npm run dev
```

### Claude API가 너무 느림
- **정상입니다!** AI 모델 추론에 1-3초 소요
- 로딩 스피너가 표시되는지 확인

### 한국어 의미가 안 보임
- "옵션 선택" → "의미 표시" → **"한영 뜻만"** 또는 **"영영+한영"** 선택

---

## 📚 상세 문서

더 자세한 정보는 다음 파일들을 참고하세요:

1. **`CLAUDE_API_IMPLEMENTATION.md`** - 전체 구현 보고서
2. **`TEST_CLAUDE_API.md`** - 상세 테스트 가이드
3. **`backend/test-claude-api.js`** - 자동화 테스트 스크립트

---

## ✨ 핵심 기능

- ✅ **3단계 Fallback**: Lingua → Free → Claude
- ✅ **API 출처 표시**: 어떤 API를 사용했는지 배지로 표시
- ✅ **신조어 지원**: Free Dictionary에 없는 단어도 조회
- ✅ **문장 번역**: Claude가 자동으로 번역
- ✅ **비용 최적화**: 무료 API 우선, Claude는 마지막

---

**구현 완료**: 2025-10-10 | **버전**: v0.2.1
