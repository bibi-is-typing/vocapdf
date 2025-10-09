#!/bin/bash

# VocaPDF Backend API 테스트 스크립트

BASE_URL="http://localhost:5001"

echo "======================================"
echo "VocaPDF Backend API 테스트"
echo "======================================"
echo ""

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${YELLOW}1. Health Check 테스트${NC}"
echo "GET $BASE_URL/health"
echo "---"
curl -s $BASE_URL/health | python3 -m json.tool
echo ""
echo ""

# 2. 단어 조회 (정상 케이스)
echo -e "${YELLOW}2. 단어 조회 API 테스트 (apple, bank)${NC}"
echo "POST $BASE_URL/api/dictionary/lookup"
echo "---"
curl -s -X POST $BASE_URL/api/dictionary/lookup \
  -H "Content-Type: application/json" \
  -d '{
    "words": ["apple", "bank"],
    "options": {
      "meanings": 2,
      "definitions": 1,
      "synonyms": 2,
      "antonyms": 1,
      "related": 0
    }
  }' | python3 -m json.tool
echo ""
echo ""

# 3. 단어 조회 (존재하지 않는 단어)
echo -e "${YELLOW}3. 단어 조회 API 테스트 (존재하지 않는 단어)${NC}"
echo "POST $BASE_URL/api/dictionary/lookup"
echo "---"
curl -s -X POST $BASE_URL/api/dictionary/lookup \
  -H "Content-Type: application/json" \
  -d '{
    "words": ["xyzabc123"],
    "options": {
      "meanings": 1,
      "definitions": 1,
      "synonyms": 0,
      "antonyms": 0,
      "related": 0
    }
  }' | python3 -m json.tool
echo ""
echo ""

# 4. 에러 케이스 (잘못된 요청)
echo -e "${YELLOW}4. 에러 테스트 (words 배열 없음)${NC}"
echo "POST $BASE_URL/api/dictionary/lookup"
echo "---"
curl -s -X POST $BASE_URL/api/dictionary/lookup \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "meanings": 1,
      "definitions": 1,
      "synonyms": 0,
      "antonyms": 0,
      "related": 0
    }
  }' | python3 -m json.tool
echo ""
echo ""

# 5. 다양한 단어로 테스트
echo -e "${YELLOW}5. 다양한 단어 테스트 (run, book, light)${NC}"
echo "POST $BASE_URL/api/dictionary/lookup"
echo "---"
curl -s -X POST $BASE_URL/api/dictionary/lookup \
  -H "Content-Type: application/json" \
  -d '{
    "words": ["run", "book", "light"],
    "options": {
      "meanings": 2,
      "definitions": 1,
      "synonyms": 1,
      "antonyms": 0,
      "related": 0
    }
  }' | python3 -m json.tool
echo ""
echo ""

echo -e "${GREEN}======================================"
echo "테스트 완료!"
echo "======================================${NC}"
