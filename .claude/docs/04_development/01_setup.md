# VocaPDF - 개발 환경 설정

## 📌 개요

이 문서는 VocaPDF 프로젝트의 로컬 개발 환경을 구축하는 절차를 정의한다. 단계별 지침을 정확히 따르도록.

---

## ✅ 사전 요구사항

개발을 시작하기 전, 아래의 환경이 반드시 구축되어 있어야 한다. 버전 불일치는 예기치 않은 오류를 유발한다.

- **Node.js**: `18.0.0` 이상
- **npm**: `8.x` 이상
- **Git**

---

## 🚀 빠른 시작

숙련된 개발자는 아래 절차를 따른다.

1. 저장소 클론
2. 각 폴더(`backend`, `frontend`)에서 `npm install` 실행
3. `backend` 폴더에 `.env` 파일 생성 및 `LINGUA_ROBOT_API_KEY` 설정
4. 각 폴더에서 `npm run dev` 실행

---

## ⚙️ 상세 절차

### 1. 저장소 클론

프로젝트를 로컬 환경으로 복제한다.

git clone
cd vocapdf 


### 2. 백엔드 설정

새 터미널을 열고 진행한다.

#### 가. 의존성 설치

backend 디렉토리로 이동하여 npm 패키지를 설치한다.

cd backend
npm install


#### 나. 환경 변수 설정

.env.example 파일을 복사하여 .env 파일을 생성한다.

cp .env.example .env


생성된 .env 파일을 열고, LINGUA_ROBOT_API_KEY 값을 RapidAPI에서 발급받은 본인의 키로 교체한다. 이 키가 없으면 숙어 및 문장 조회 기능이 동작하지 않는다.

.env
PORT=5001
…
LINGUA_ROBOT_API_KEY=your_rapidapi_key_here
…


PORT는 5001로 유지하는 것을 권장한다. macOS의 AirPlay 포트와 충돌을 피하기 위함이다.

#### 다. 개발 서버 실행

개발 서버를 시작한다.

npm run dev


`Server running on http://localhost:5001` 메시지를 확인한다.

### 3. 프론트엔드 설정

별도의 새 터미널을 열고 진행한다.

#### 가. 의존성 설치

frontend 디렉토리로 이동하여 npm 패키지를 설치한다.

cd frontend
npm install


#### 나. 개발 서버 실행

Vite 개발 서버를 시작한다.

npm run dev


브라우저에서 http://localhost:5173으로 접속하여 VocaPDF UI가 표시되는지 확인한다.

---

## ✅ 최종 검증

모든 설정이 완료되면 아래 항목을 검증하여 환경 구축을 마친다.

- **백엔드 Health Check**: 브라우저에서 http://localhost:5001/health에 접속했을 때, JSON 응답이 정상적으로 오는지 확인한다.
- **프론트엔드-백엔드 연동**: VocaPDF UI에서 단어를 입력하고 '단어 조회' 버튼을 클릭했을 때, 백엔드 터미널에 `POST /api/dictionary/lookup` 요청 로그가 출력되는지 확인한다.

---

## 📝 문서 이력
- 2025-10-10: 재작성
