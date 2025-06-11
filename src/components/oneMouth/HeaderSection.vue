<template>
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <h1>🍽️ 한입만</h1>
        <p>핫한 먹거리를 탐색하고 나눠보세요!</p>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <div class="stat-number">{{ totalFoods }}+</div>
          <div class="stat-label">등록된 음식</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ activeSellings }}+</div>
          <div class="stat-label">판매중</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ totalUsers }}+</div>
          <div class="stat-label">활성 유저</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderSection',
  props: {
    totalFoods: {
      type: Number,
      required: true
    },
    activeSellings: {
      type: Number,
      required: true
    },
    totalUsers: {
      type: Number,
      required: true
    }
  }
};
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #169976 0%, #1DCD9F 100%);
  padding: 40px 60px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
  gap: 24px;
}

.header-left h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
}

.header-left p {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 32px;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.85;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  .header-stats {
    justify-content: center;
  }
}
</style>