<template>
  <div class="not-found">
    <div class="not-found-content">
      <!-- 일러스트 -->
      <div class="illustration">
        <div class="circle circle-lg"></div>
        <div class="circle circle-md"></div>
        <div class="circle circle-sm"></div>
        <span class="error-code">404</span>
      </div>

      <!-- 텍스트 -->
      <h1 class="title">페이지를 찾을 수 없습니다</h1>
      <p class="description">
        요청하신 페이지가 존재하지 않거나, 이동되었을 수 있습니다.<br />
        주소를 다시 확인해 주세요.
      </p>

      <!-- 홈으로 버튼 -->
      <RouterLink to="/" class="home-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="9 22 9 12 15 12 15 22"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        홈으로 돌아가기
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'

let metaRobots = null

onMounted(() => {
  metaRobots = document.createElement('meta')
  metaRobots.setAttribute('name', 'robots')
  metaRobots.setAttribute('content', 'noindex')
  document.head.appendChild(metaRobots)
})

onUnmounted(() => {
  if (metaRobots) {
    metaRobots.remove()
  }
})
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 66px);
  background: #ffffff;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  max-width: 420px;
}

/* ===================== 일러스트 ===================== */
.illustration {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
}

.circle-lg {
  width: 200px;
  height: 200px;
  background: #9933EA;
  animation: pulse 3s ease-in-out infinite;
}

.circle-md {
  width: 140px;
  height: 140px;
  background: #9933EA;
  opacity: 0.18;
  animation: pulse 3s ease-in-out 0.5s infinite;
}

.circle-sm {
  width: 90px;
  height: 90px;
  background: #9933EA;
  opacity: 0.25;
  animation: pulse 3s ease-in-out 1s infinite;
}

.error-code {
  position: relative;
  font-size: 64px;
  font-weight: 800;
  color: #9933EA;
  letter-spacing: -2px;
  z-index: 1;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.12;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.2;
  }
}

/* ===================== 텍스트 ===================== */
.title {
  font-size: 22px;
  font-weight: 700;
  color: #111111;
  margin: 0 0 0.75rem;
}

.description {
  font-size: 14px;
  line-height: 1.7;
  color: #888888;
  margin: 0 0 2rem;
}

/* ===================== 버튼 ===================== */
.home-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: #9933EA;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.home-btn:hover {
  background: #8529D4;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(153, 51, 234, 0.3);
}

.home-btn:active {
  transform: translateY(0);
}

/* ===================== 반응형 ===================== */
@media (max-width: 480px) {
  .illustration {
    width: 160px;
    height: 160px;
    margin-bottom: 2rem;
  }

  .circle-lg {
    width: 160px;
    height: 160px;
  }

  .circle-md {
    width: 110px;
    height: 110px;
  }

  .circle-sm {
    width: 70px;
    height: 70px;
  }

  .error-code {
    font-size: 52px;
  }

  .title {
    font-size: 19px;
  }

  .description {
    font-size: 13px;
  }
}
</style>
