<template>
  <router-link :to="{ name: 'BattleList' }" class="brand-banner" aria-label="요거픽 둘러보기">
    <div class="banner-left">
      <span class="banner-tag">
        <span class="tag-dot"></span>
        지금 뜨는 픽
      </span>
      <h2 class="banner-copy">
        오늘 뭐 먹지?<br />
        <span class="banner-copy-accent">픽</span>으로 같이 정해요.
      </h2>
      <p class="banner-sub">유저들이 직접 한 표 던지는 라이브 픽 — 광고 없이 진짜 인기만</p>

      <div class="banner-meta">
        <div class="meta-avatars" aria-hidden="true">
          <span class="meta-avatar" style="background:#FDE68A;color:#92400E">민</span>
          <span class="meta-avatar" style="background:#BFDBFE;color:#1E40AF">지</span>
          <span class="meta-avatar" style="background:#FBCFE8;color:#9D174D">현</span>
          <span class="meta-avatar more">+</span>
        </div>
        <span class="meta-text">지금 픽 중인 사람들과 함께해요</span>
      </div>
    </div>

    <div class="banner-right" aria-hidden="true">
      <svg class="banner-art" viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <!-- 배경 라운드 카드 -->
        <rect x="6" y="14" width="208" height="152" rx="20" fill="#FAF5FF"/>

        <!-- 좌측 제품 카드 -->
        <g transform="translate(22, 38)">
          <rect width="76" height="104" rx="14" fill="#FFFFFF" stroke="#E9D5FF" stroke-width="1.5"/>
          <circle cx="38" cy="36" r="20" fill="#F3E8FF"/>
          <rect x="14" y="68" width="48" height="6" rx="3" fill="#CBD5E1"/>
          <rect x="14" y="80" width="32" height="5" rx="2.5" fill="#E2E8F0"/>
          <!-- 투표 바 -->
          <rect x="14" y="92" width="48" height="4" rx="2" fill="#F1F5F9"/>
          <rect x="14" y="92" width="34" height="4" rx="2" fill="#9333EA"/>
        </g>

        <!-- 우측 제품 카드 (살짝 기울어진) -->
        <g transform="translate(112, 32) rotate(6)">
          <rect width="76" height="104" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
          <circle cx="38" cy="36" r="20" fill="#F1F5F9"/>
          <rect x="14" y="68" width="48" height="6" rx="3" fill="#CBD5E1"/>
          <rect x="14" y="80" width="32" height="5" rx="2.5" fill="#E2E8F0"/>
          <!-- 투표 바 -->
          <rect x="14" y="92" width="48" height="4" rx="2" fill="#F1F5F9"/>
          <rect x="14" y="92" width="18" height="4" rx="2" fill="#CBD5E1"/>
        </g>

        <!-- VS 배지 -->
        <g transform="translate(110, 84)">
          <circle r="18" fill="#9333EA"/>
          <text y="5" font-size="13" font-weight="800" fill="#FFFFFF" text-anchor="middle" font-family="SUIT, sans-serif" letter-spacing="0.5">VS</text>
        </g>

        <!-- 픽 체크 -->
        <g transform="translate(48, 22)">
          <circle r="11" fill="#9333EA"/>
          <path d="M-4 0 L-1 3 L4 -3" stroke="#FFFFFF" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </svg>
    </div>
  </router-link>
</template>

<script setup>
</script>

<style scoped>
.brand-banner {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 1rem;
  background: #FFFFFF;
  border: 1px solid var(--border-default);
  border-radius: 18px;
  padding: 1.5rem 1.625rem;
  margin: 1rem 0 1.125rem;
  text-decoration: none;
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
  min-height: 168px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
  -webkit-tap-highlight-color: transparent;
}

.brand-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(147, 51, 234, 0.10);
  border-color: #E9D5FF;
}

.brand-banner:active {
  transform: scale(0.99);
}

.banner-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.banner-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 5px 11px 5px 9px;
  border-radius: 100px;
  background: var(--c-brand-soft);
  font-size: 11px;
  font-weight: 700;
  color: var(--c-brand);
  letter-spacing: -0.005em;
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-brand);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.18);
  animation: dot-pulse 1.6s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.85); opacity: 0.7; }
}

.banner-copy {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.22;
  margin: 0;
  color: var(--text-primary);
}

.banner-copy-accent {
  color: var(--c-brand);
}

.banner-sub {
  font-size: 0.8125rem;
  color: var(--c-text-400);
  margin: 0;
  line-height: 1.5;
  font-weight: 500;
}

.banner-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.meta-avatars {
  display: flex;
  align-items: center;
}

.meta-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #FFFFFF;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  margin-left: -8px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.meta-avatar:first-child { margin-left: 0; }

.meta-avatar.more {
  background: var(--bg-subtle);
  color: var(--c-text-500);
  font-size: 12px;
  line-height: 1;
}

.meta-text {
  font-size: 0.75rem;
  color: var(--c-text-500);
  font-weight: 500;
  letter-spacing: -0.005em;
}

.banner-right {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 220px;
  max-width: 40%;
}

.banner-art {
  width: 100%;
  height: auto;
  display: block;
}

/* 모바일 */
@media (max-width: 767px) {
  .brand-banner {
    padding: 1.125rem 1.125rem;
    margin: 0.75rem 0 0.875rem;
    min-height: 140px;
    border-radius: 16px;
    gap: 0.625rem;
    -webkit-user-select: none;
    user-select: none;
  }
  .banner-copy {
    font-size: 1.1875rem;
    line-height: 1.25;
  }
  .banner-sub {
    font-size: 0.75rem;
  }
  .meta-text {
    font-size: 0.6875rem;
  }
  .banner-right {
    width: 110px;
    max-width: 38%;
  }
}

@media (max-width: 380px) {
  .banner-meta { display: none; }
}

@media (min-width: 1280px) {
  .brand-banner {
    padding: 1.75rem 2rem;
    min-height: 188px;
  }
  .banner-copy {
    font-size: 1.75rem;
  }
  .banner-sub {
    font-size: 0.875rem;
  }
  .banner-right {
    width: 260px;
  }
}

@media (hover: none) {
  .brand-banner:hover {
    transform: none;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
    border-color: var(--border-default);
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-banner,
  .brand-banner:hover,
  .brand-banner:active {
    transform: none;
  }
  .tag-dot {
    animation: none;
  }
}
</style>
