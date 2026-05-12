<template>
  <div class="legal-page">
    <div class="legal-container">
      <h1 class="legal-title">요거뜨 소개</h1>
      <p class="legal-date">About Yogurtte</p>

      <section class="legal-section">
        <h2>서비스 소개</h2>
        <p>요거뜨는 다양한 제품의 리뷰, 랭킹, 피드를 한눈에 확인할 수 있는 커뮤니티 플랫폼입니다. 사용자들이 직접 제품을 평가하고, 인증 피드를 공유하며, 배틀 투표를 통해 최고의 제품을 선정합니다.</p>
      </section>

      <section class="legal-section">
        <h2>주요 기능</h2>
        <ul>
          <li><strong>HOT 100 랭킹</strong> – 사용자 평가 기반 인기 제품 랭킹</li>
          <li><strong>제품 리뷰</strong> – 솔직한 사용자 리뷰와 별점 시스템</li>
          <li><strong>인증 피드</strong> – 제품 사용 인증과 경험 공유</li>
          <li><strong>요거픽 배틀</strong> – 제품 대결 투표로 최고의 제품 선정</li>
          <li><strong>캐리어</strong> – 관심 제품을 모아 나만의 컬렉션 구성</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>운영 정보</h2>
        <ul>
          <li>서비스명: 요거뜨 (Yogurtte)</li>
          <li>웹사이트: <a href="https://yogurtte.com" target="_blank" rel="noopener">https://yogurtte.com</a></li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>문의</h2>
        <p>서비스 이용 중 궁금한 점이나 건의사항이 있으시면 아래 이메일로 연락해 주세요.</p>
        <ul>
          <li>이메일: <a href="mailto:jmcabc1216@gmail.com">jmcabc1216@gmail.com</a></li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>법적 고지</h2>
        <p>
          <router-link to="/support">고객 지원</router-link> |
          <router-link to="/privacy">개인정보처리방침</router-link> |
          <router-link to="/terms">이용약관</router-link>
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: #fff;
  padding: 40px 24px 80px;
}

.legal-container {
  max-width: 720px;
  margin: 0 auto;
}

.legal-title {
  font-size: 24px;
  font-weight: 700;
  color: #111;
  margin: 0 0 4px;
}

.legal-date {
  font-size: 13px;
  color: #999;
  margin: 0 0 32px;
}

.legal-section {
  margin-bottom: 28px;
}

.legal-section h2 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0 0 8px;
}

.legal-section p {
  font-size: 14px;
  color: #555;
  line-height: 1.7;
  margin: 0 0 8px;
}

.legal-section ul {
  padding-left: 20px;
  margin: 0;
}

.legal-section li {
  font-size: 14px;
  color: #555;
  line-height: 1.7;
  margin-bottom: 4px;
}

.legal-section a {
  color: #7c3aed;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .legal-page { padding: 24px 16px 60px; }
  .legal-title { font-size: 20px; }
  .legal-section h2 { font-size: 15px; }
}
</style>
