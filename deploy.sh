#!/bin/bash
# yogurtte.com S3 배포 스크립트
# 사용법: ./deploy.sh <S3_BUCKET_NAME> [CLOUDFRONT_DISTRIBUTION_ID]
# 예시: ./deploy.sh my-yogurtte-bucket E1234567890ABC

set -e

S3_BUCKET="${1:?S3 버킷 이름을 입력하세요. 사용법: ./deploy.sh <S3_BUCKET> [CF_DIST_ID]}"
CF_DIST_ID="${2:-}"

echo "=== yogurtte.com 배포 시작 ==="
echo "S3 Bucket: $S3_BUCKET"

# 1. 빌드
echo ""
echo "[1/4] 프로덕션 빌드 중..."
npm run build:prod

# 2. HTML 파일 업로드 (Content-Type: text/html, 캐시 없음)
echo ""
echo "[2/4] HTML 파일 업로드..."
aws s3 cp dist/index.html "s3://$S3_BUCKET/index.html" \
  --content-type "text/html; charset=utf-8" \
  --cache-control "no-cache, no-store, must-revalidate"

# 3. SEO 파일 업로드 (올바른 Content-Type 지정)
echo ""
echo "[3/4] SEO 파일 업로드 (sitemap.xml, robots.txt)..."
aws s3 cp dist/sitemap.xml "s3://$S3_BUCKET/sitemap.xml" \
  --content-type "application/xml; charset=utf-8" \
  --cache-control "public, max-age=3600"

aws s3 cp dist/robots.txt "s3://$S3_BUCKET/robots.txt" \
  --content-type "text/plain; charset=utf-8" \
  --cache-control "public, max-age=3600"

# 4. 나머지 정적 파일 업로드 (JS, CSS, 이미지, 폰트)
echo ""
echo "[4/4] 정적 파일 업로드..."
aws s3 sync dist/ "s3://$S3_BUCKET/" \
  --exclude "index.html" \
  --exclude "sitemap.xml" \
  --exclude "robots.txt" \
  --cache-control "public, max-age=31536000, immutable"

# 5. CloudFront 캐시 무효화 (선택)
if [ -n "$CF_DIST_ID" ]; then
  echo ""
  echo "[선택] CloudFront 캐시 무효화..."
  aws cloudfront create-invalidation \
    --distribution-id "$CF_DIST_ID" \
    --paths "/index.html" "/sitemap.xml" "/robots.txt"
  echo "CloudFront 캐시 무효화 요청 완료"
fi

echo ""
echo "=== 배포 완료 ==="
echo "sitemap.xml Content-Type: application/xml"
echo "robots.txt  Content-Type: text/plain"
echo "index.html  Content-Type: text/html (캐시 없음)"
