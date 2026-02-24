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
echo "[1/6] 프로덕션 빌드 중..."
npm run build:prod

# 2. HTML 파일 업로드 (Content-Type: text/html, 캐시 없음)
echo ""
echo "[2/6] HTML 파일 업로드..."
aws s3 cp dist/index.html "s3://$S3_BUCKET/index.html" \
  --content-type "text/html; charset=utf-8" \
  --cache-control "no-cache, no-store, must-revalidate"

# 3. SEO 파일 업로드 (올바른 Content-Type 지정)
echo ""
echo "[3/6] SEO 파일 업로드 (sitemap.xml, robots.txt)..."
aws s3 cp dist/sitemap.xml "s3://$S3_BUCKET/sitemap.xml" \
  --content-type "application/xml; charset=utf-8" \
  --cache-control "public, max-age=3600"

aws s3 cp dist/robots.txt "s3://$S3_BUCKET/robots.txt" \
  --content-type "text/plain; charset=utf-8" \
  --cache-control "public, max-age=3600"

# 4. 폰트 파일 업로드 (올바른 Content-Type 명시적 지정)
echo ""
echo "[4/6] 폰트 파일 업로드 (Content-Type 명시적 지정)..."
if [ -d "dist/fonts" ]; then
  aws s3 sync dist/fonts/ "s3://$S3_BUCKET/fonts/" \
    --exclude "*" \
    --include "*.woff2" \
    --content-type "font/woff2" \
    --cache-control "public, max-age=31536000, immutable"

  aws s3 sync dist/fonts/ "s3://$S3_BUCKET/fonts/" \
    --exclude "*" \
    --include "*.woff" \
    --content-type "font/woff" \
    --cache-control "public, max-age=31536000, immutable"

  echo "폰트 파일 업로드 완료 (woff2: font/woff2, woff: font/woff)"
else
  echo "경고: dist/fonts 디렉토리가 없습니다."
fi

# 5. 나머지 정적 파일 업로드 (JS, CSS, 이미지 등)
echo ""
echo "[5/6] 정적 파일 업로드..."
aws s3 sync dist/ "s3://$S3_BUCKET/" \
  --exclude "index.html" \
  --exclude "sitemap.xml" \
  --exclude "robots.txt" \
  --exclude "fonts/*.woff2" \
  --exclude "fonts/*.woff" \
  --cache-control "public, max-age=31536000, immutable"

# 6. CloudFront 캐시 무효화 (전체 경로)
if [ -n "$CF_DIST_ID" ]; then
  echo ""
  echo "[6/6] CloudFront 캐시 무효화 (전체)..."
  aws cloudfront create-invalidation \
    --distribution-id "$CF_DIST_ID" \
    --paths "/*"
  echo "CloudFront 전체 캐시 무효화 요청 완료"
else
  echo ""
  echo "[6/6] CloudFront Distribution ID가 없어 캐시 무효화를 건너뜁니다."
fi

echo ""
echo "=== 배포 완료 ==="
echo "sitemap.xml   Content-Type: application/xml"
echo "robots.txt    Content-Type: text/plain"
echo "index.html    Content-Type: text/html (캐시 없음)"
echo "*.woff2       Content-Type: font/woff2 (1년 캐시)"
echo "*.woff        Content-Type: font/woff (1년 캐시)"
echo ""
echo "주의: S3 버킷의 '정적 웹 호스팅 > 오류 문서'가 index.html로 설정되어 있는지 확인하세요."
echo "      CloudFront 오류 페이지 설정에서 403/404 응답을 /index.html (HTTP 200)으로 리다이렉트하세요."
