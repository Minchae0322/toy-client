<template>
  <section class="brand-hero">
    <div class="brand-mark-row">
      <span class="brand-dot"></span>
      <span class="brand-name">yogurtte</span>
      <span class="brand-meta">푸드 픽 커뮤니티</span>
    </div>

    <h1 class="brand-headline">
      오늘 뭐 먹지?<br />
      <span class="brand-headline-accent">픽</span>으로 정해.
    </h1>
    <p class="brand-sub">
      유저가 직접 한 표 던지는 라이브 픽, 솔직한 리뷰, 카테고리 랭킹까지<br class="brand-sub-br" />
      광고·협찬 없이 진짜 입맛으로 만드는 푸드 트렌드.
    </p>
  </section>
</template>

<script setup>
</script>

<style scoped>
.brand-hero {
  padding: 1.25rem 0 0.5rem;
}

@media (min-width: 768px) {
  .brand-hero {
    padding: 1.75rem 0 0.75rem;
  }
}

.brand-mark-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px 5px 8px;
  background: var(--c-brand-soft);
  border-radius: 100px;
  margin-bottom: 0.875rem;
}

.brand-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c-brand);
  flex-shrink: 0;
}

.brand-name {
  font-size: 0.8125rem;
  font-weight: 800;
  color: var(--c-brand);
  letter-spacing: -0.02em;
  line-height: 1;
}

.brand-meta {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--c-brand);
  opacity: 0.7;
  letter-spacing: -0.01em;
  line-height: 1;
  padding-left: 6px;
  border-left: 1px solid rgba(147, 51, 234, 0.25);
}

.brand-headline {
  font-size: 1.625rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.035em;
  line-height: 1.2;
}

.brand-headline-accent {
  color: var(--c-brand);
}

.brand-sub {
  font-size: 0.8125rem;
  color: var(--c-text-500);
  margin: 0.625rem 0 0;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.55;
}

.brand-sub-br {
  display: none;
}

@media (max-width: 767px) {
  .brand-hero {
    padding: 1rem 0 0.375rem;
  }
  .brand-headline {
    font-size: 1.5rem;
  }
  .brand-sub {
    font-size: 0.8125rem;
    margin-top: 0.5rem;
  }
  .brand-mark-row {
    margin-bottom: 0.75rem;
  }
}

@media (min-width: 1280px) {
  .brand-headline { font-size: 2rem; }
  .brand-sub { font-size: 0.9375rem; }
  .brand-sub-br { display: inline; }
}
</style>
