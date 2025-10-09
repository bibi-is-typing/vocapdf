# VocaPDF - AI 에이전트 개발 가이드

## 📚 문서 개요

이 폴더는 **VocaPDF 프로젝트를 AI 에이전트(증강 코딩)로 개발하기 위한 가이드 문서**를 담고 있습니다.

문서는 주제별로 폴더와 파일로 세분화되어 있으며, 각 파일은 독립적으로 읽을 수 있습니다.

---

## 📖 문서 구조

### 📁 01_project/ - 프로젝트 기본 정보
프로젝트의 목적, 범위, 사용자 시나리오를 정의합니다.

- **[01_introduction.md](./01_project/01_introduction.md)**
  - 프로젝트 소개
  - 핵심 목적 및 가치
  - 타겟 사용자
  
- **[02_mvp_scope.md](./01_project/02_mvp_scope.md)**
  - MVP 범위 정의
  - 포함/제외 기능
  - 입력 제한 및 정책
  
- **[03_user_scenarios.md](./01_project/03_user_scenarios.md)**
  - 주요 사용자 시나리오
  - 사용 흐름
  
- **[04_success_metrics.md](./01_project/04_success_metrics.md)**
  - 성공 지표
  - 기능/성능/품질 기준

---

### 📁 02_architecture/ - 시스템 아키텍처
시스템의 전체 구조와 기술 스택을 설명합니다.

- **[01_system_structure.md](./02_architecture/01_system_structure.md)**
  - 전체 시스템 구조
  - 컴포넌트 간 관계
  
- **[02_data_flow.md](./02_architecture/02_data_flow.md)**
  - 데이터 플로우
  - 처리 단계별 상세
  
- **[03_tech_stack.md](./02_architecture/03_tech_stack.md)**
  - 기술 스택 및 선택 이유
  - 라이브러리 목록
  
- **[04_folder_structure.md](./02_architecture/04_folder_structure.md)**
  - 프로젝트 폴더 구조
  - 파일 조직 방식

---

### 📁 03_pdf_spec/ - PDF 출력 스펙
PDF 생성과 관련된 모든 상세 스펙을 정의합니다.

- **[01_page_settings.md](./03_pdf_spec/01_page_settings.md)**
  - 페이지 크기, 여백
  - 페이지네이션
  
- **[02_table_structure.md](./03_pdf_spec/02_table_structure.md)**
  - 테이블 구조
  - 셀 병합 규칙
  
- **[03_meaning_handling.md](./03_pdf_spec/03_meaning_handling.md)**
  - 다의어 처리 로직
  - 유의어/반의어 매칭
  
- **[04_style_guide.md](./03_pdf_spec/04_style_guide.md)**
  - 폰트, 색상
  - 스타일 규칙

---

### 📁 04_development/ - 개발 가이드
개발 환경 설정과 구현 시 주의사항을 다룹니다.

- **[01_setup.md](./04_development/01_setup.md)**
  - 초기 환경 설정
  - 의존성 설치
  
- **[02_workflow.md](./04_development/02_workflow.md)**
  - 개발 워크플로우
  - 단계별 구현 순서
  
- **[03_constraints.md](./04_development/03_constraints.md)**
  - 제약사항
  - API 제한
  
- **[04_performance.md](./04_development/04_performance.md)**
  - 성능 최적화
  - 처리 시간 관리
  
- **[05_ui_ux.md](./04_development/05_ui_ux.md)**
  - UI/UX 기본 방향
  - 인터랙션 플로우

---

### 📁 05_api/ - API 관련
프론트엔드와 백엔드 간 API 명세를 정의합니다.

- **[01_api_spec.md](./05_api/01_api_spec.md)**
  - API 엔드포인트
  - 요청/응답 형식
  
- **[02_error_handling.md](./05_api/02_error_handling.md)**
  - 에러 처리
  - 에러 코드 정의

---

### 📁 06_backend/ - 백엔드 가이드
백엔드 구현 상세 가이드입니다.

- **[backend_guide.md](./06_backend/backend_guide.md)**
  - 백엔드 구조
  - 주요 로직 설명

---

### 📁 07_frontend/ - 프론트엔드 가이드
프론트엔드 구현 상세 가이드입니다.

- **[frontend_guide.md](./07_frontend/frontend_guide.md)**
  - 컴포넌트 구조
  - 상태 관리

---

### 📁 08_design/ - 디자인 가이드
디자인 시스템 및 스타일 가이드입니다.

- **[design_guide.md](./08_design/design_guide.md)**
  - 디자인 시스템
  - 컬러/타이포그래피

---

## 🎯 빠른 시작 가이드

### 처음 시작하는 경우
01_project/01_introduction.md (프로젝트가 뭔지)
↓
01_project/02_mvp_scope.md (무엇을 만들지)
↓
02_architecture/01_system_structure.md (어떻게 만들지)
↓
04_development/01_setup.md (개발 시작)

### 특정 기능 구현
| 구현하려는 기능 | 읽어야 할 문서 |
|----------------|---------------|
| 단어 입력/파일 업로드 | 01_project/02_mvp_scope.md |
| 사전 API 연동 | 02_architecture/02_data_flow.md |
| PDF 테이블 생성 | 03_pdf_spec/02_table_structure.md |
| 다의어 처리 | 03_pdf_spec/03_meaning_handling.md |
| 에러 처리 | 05_api/02_error_handling.md |
| 성능 최적화 | 04_development/04_performance.md |

---

## 🚀 개발 단계별 문서 읽기

### Phase 1: 기획 이해
- 01_project/ 전체 폴더
- 02_architecture/01_system_structure.md

### Phase 2: 백엔드 개발
- 02_architecture/02_data_flow.md
- 03_pdf_spec/03_meaning_handling.md
- 05_api/ 전체 폴더
- 06_backend/backend_guide.md

### Phase 3: 프론트엔드 개발
- 04_development/05_ui_ux.md
- 07_frontend/frontend_guide.md
- 08_design/design_guide.md

### Phase 4: PDF 생성
- 03_pdf_spec/ 전체 폴더

### Phase 5: 최적화 및 완성
- 04_development/03_constraints.md
- 04_development/04_performance.md

---

## 💡 문서 사용 팁

### AI 에이전트에게 전달하는 방법

**전체 컨텍스트가 필요할 때**:
순서대로 전달:
01_project/ → 02_architecture/ → 03_pdf_spec/ → 04_development/

**디버깅할 때**:
관련 문서 조합:
02_architecture/02_data_flow.md + 05_api/02_error_handling.md

### 문서 업데이트
- 구현 중 변경사항 발생 시 해당 문서 즉시 업데이트
- 각 문서 하단에 변경 이력 기록
- 00_README.md는 마지막에 업데이트

---

## 📝 프로젝트 정보

- **프로젝트명**: VocaPDF
- **목적**: 영어 단어장 PDF 자동 생성 서비스
- **개발 방식**: 증강 코딩 (AI 에이전트 활용)
- **기술 스택**: React + Node.js + Express
- **문서 버전**: 2.0.0 (상세 분리 구조)
- **최종 수정일**: 2025-10-09

---

## 🔍 문서 색인

### 주제별 색인

**입력 처리**:
- 01_project/02_mvp_scope.md > 단어 입력
- 04_development/03_constraints.md > 입력 제한

**API 연동**:
- 02_architecture/02_data_flow.md
- 05_api/01_api_spec.md
- 05_api/02_error_handling.md

**PDF 생성**:
- 03_pdf_spec/ 전체 폴더

**성능**:
- 04_development/04_performance.md
- 04_development/03_constraints.md

**UI/UX**:
- 04_development/05_ui_ux.md
- 08_design/design_guide.md

---

## ✅ 문서 작성 상태

### 완료된 문서
- [x] 00_README.md

### 작성 예정
- [ ] 01_project/ (4개 파일)
- [ ] 02_architecture/ (4개 파일)
- [ ] 03_pdf_spec/ (4개 파일)
- [ ] 04_development/ (5개 파일)
- [ ] 05_api/ (2개 파일)
- [ ] 06_backend/ (1개 파일)
- [ ] 07_frontend/ (1개 파일)
- [ ] 08_design/ (1개 파일)

---

## 📞 문서 관련 문의

문서 내용이 불명확하거나 추가 설명이 필요한 경우:
1. 해당 문서의 "문서 이력" 섹션 확인
2. 관련 문서들을 함께 참조
3. 필요시 문서 업데이트 요청