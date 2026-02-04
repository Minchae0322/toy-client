#!/bin/bash

# CDN 캐시 전략이 적용된 배포 스크립트
# 사용법: ./deploy.sh
#
# 필요한 환경변수:
#   S3_BUCKET - S3 버킷 이름
#   CLOUDFRONT_DISTRIBUTION_ID - CloudFront 배포 ID
#
# 예시:
#   S3_BUCKET=my-bucket CLOUDFRONT_DISTRIBUTION_ID=E1234567890 ./deploy.sh

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 환경변수 확인
if [ -z "$S3_BUCKET" ]; then
    echo -e "${RED}Error: S3_BUCKET 환경변수가 설정되지 않았습니다.${NC}"
    echo "예시: S3_BUCKET=my-bucket ./deploy.sh"
    exit 1
fi

if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}Warning: CLOUDFRONT_DISTRIBUTION_ID가 설정되지 않았습니다. 캐시 무효화를 건너뜁니다.${NC}"
fi

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Vue3 + S3 + CloudFront 배포 시작${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# 1. 프로덕션 빌드
echo -e "${YELLOW}[1/4] 프로덕션 빌드 중...${NC}"
npm run build:prod
echo -e "${GREEN}✓ 빌드 완료${NC}"
echo ""

# 2. S3에 해시 파일 업로드 (장기 캐시 - 1년)
# index.html 제외
echo -e "${YELLOW}[2/4] S3에 정적 파일 업로드 중 (장기 캐시)...${NC}"
aws s3 sync dist/ s3://$S3_BUCKET \
    --exclude "index.html" \
    --cache-control "max-age=31536000, public, immutable" \
    --delete
echo -e "${GREEN}✓ 정적 파일 업로드 완료 (js, css, images 등)${NC}"
echo ""

# 3. index.html 업로드 (캐시 비활성화)
echo -e "${YELLOW}[3/4] S3에 index.html 업로드 중 (캐시 없음)...${NC}"
aws s3 cp dist/index.html s3://$S3_BUCKET/index.html \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html; charset=utf-8"
echo -e "${GREEN}✓ index.html 업로드 완료${NC}"
echo ""

# 4. CloudFront 캐시 무효화
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}[4/4] CloudFront 캐시 무효화 중...${NC}"
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/index.html" \
        --query 'Invalidation.Id' \
        --output text)
    echo -e "${GREEN}✓ CloudFront 캐시 무효화 요청 완료 (ID: $INVALIDATION_ID)${NC}"
else
    echo -e "${YELLOW}[4/4] CloudFront 캐시 무효화 건너뜀 (CLOUDFRONT_DISTRIBUTION_ID 미설정)${NC}"
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  배포 완료!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo "캐시 전략:"
echo "  - index.html: 캐시 없음 (항상 최신)"
echo "  - js/css/이미지: 1년 캐시 (해시로 버전 관리)"
echo ""
