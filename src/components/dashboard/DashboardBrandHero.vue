<template>
  <router-link :to="{ name: 'BattleList' }" class="brand-banner" aria-label="요거픽 둘러보기">
    <div class="banner-left">
      <span class="banner-tag">
        <span class="tag-dot"></span>
        YOGURTTE
      </span>
      <h2 class="banner-copy">
        오늘 뭐 먹지?<br />
        <span class="banner-copy-accent">픽</span>으로 정해.
      </h2>
    </div>

    <div class="banner-right" aria-hidden="true">
      <span class="mark-label">live pick</span>
      <span class="mark-word">요거뜨</span>
      <span class="mark-line"></span>
      <span class="mark-sub">since 2026</span>
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
  background: #0A0E1A;
  border-radius: 18px;
  padding: 1.25rem 1.375rem;
  margin: 1rem 0 1.125rem;
  text-decoration: none;
  color: #fff;
  position: relative;
  overflow: hidden;
  min-height: 132px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
  -webkit-tap-highlight-color: transparent;
}

.brand-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.14);
}

.brand-banner:active {
  transform: scale(0.99);
}

.banner-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.625rem;
  min-width: 0;
  flex: 1;
}

.banner-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 4px 10px 4px 8px;
  border-radius: 100px;
  background: rgba(180, 255, 57, 0.14);
  font-size: 10px;
  font-weight: 800;
  color: #B4FF39;
  letter-spacing: 0.12em;
}

.tag-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #B4FF39;
  box-shadow: 0 0 0 2px rgba(180, 255, 57, 0.25);
}

.banner-copy {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.18;
  margin: 0;
  color: #fff;
}

.banner-copy-accent {
  color: #B4FF39;
}

.banner-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  padding-left: 1rem;
  flex-shrink: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.mark-label {
  font-size: 9px;
  font-weight: 800;
  color: #B4FF39;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.mark-word {
  font-size: 1.875rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.04em;
  line-height: 1;
  margin-top: 2px;
}

.mark-line {
  width: 28px;
  height: 3px;
  border-radius: 2px;
  background: #B4FF39;
  margin-top: 6px;
}

.mark-sub {
  font-size: 10px;
  font-weight: 600;
  color: #A1A1AA;
  letter-spacing: 0.04em;
  margin-top: 4px;
}

/* 모바일 */
@media (max-width: 767px) {
  .brand-banner {
    padding: 1rem 1.125rem;
    margin: 0.75rem 0 0.875rem;
    min-height: 112px;
    border-radius: 16px;
    -webkit-user-select: none;
    user-select: none;
  }
  .banner-copy {
    font-size: 1.25rem;
  }
  .banner-right {
    padding-left: 0.75rem;
    gap: 3px;
  }
  .mark-word {
    font-size: 1.5rem;
  }
  .mark-line {
    width: 22px;
    height: 2px;
  }
  .mark-sub {
    font-size: 9px;
  }
}

@media (min-width: 1280px) {
  .brand-banner {
    padding: 1.5rem 1.75rem;
    min-height: 148px;
  }
  .banner-copy {
    font-size: 1.75rem;
  }
  .mark-word {
    font-size: 2.125rem;
  }
}

@media (hover: none) {
  .brand-banner:hover {
    transform: none;
    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-banner,
  .brand-banner:hover,
  .brand-banner:active {
    transform: none;
  }
}
</style>
