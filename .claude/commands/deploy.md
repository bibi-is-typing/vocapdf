# /deploy - 배포 프로세스

배포 전 체크리스트를 확인하고 배포 프로세스를 진행해주세요.

## 배포 전 체크리스트

### 코드 품질
- [ ] 모든 테스트 통과
- [ ] ESLint 에러 없음
- [ ] Console.log 제거
- [ ] TODO 주석 처리
- [ ] 코드 리뷰 완료

### 환경 변수
- [ ] `.env` 파일 확인
- [ ] API 키 설정 확인
- [ ] 프로덕션 설정 적용

### 보안
- [ ] API 키 노출 확인
- [ ] 민감정보 하드코딩 확인
- [ ] CORS 설정 확인
- [ ] 환경 변수 문서화

### 빌드
- [ ] Frontend 빌드 테스트
- [ ] Backend 빌드 테스트
- [ ] 의존성 최신화
- [ ] 빌드 사이즈 확인

## 배포 프로세스

### Frontend
```bash
cd frontend
npm run build
npm run preview  # 빌드 결과 확인
```

### Backend
```bash
cd backend
npm run start  # 프로덕션 모드 확인
```

## 배포 후 확인

1. **Health Check**
   - API 엔드포인트 응답 확인
   - 로그 모니터링

2. **기능 테스트**
   - 주요 기능 동작 확인
   - 에러 발생 여부 확인

3. **모니터링**
   - 응답 시간 확인
   - 에러 로그 확인
