<template>
  <div class="hero-card" :style="{ background: tier.bgColor }">
    <div class="hero-content">
      <!-- 인사 -->
      <div class="greeting">
        <div class="greeting-title">
          <strong>{{ user.nickname }}</strong>님, 오늘도 성장 중이에요
        </div>
        <div class="greeting-sub">{{ encouragement }}</div>
      </div>

      <!-- 프로필 + 스트릭 -->
      <div class="hero-top">
        <div class="identity">
          <div class="tier-avatar">
            <YogurtTierArt :tier="tier.art" :color="tierColor" :size="heroArtSize" />
          </div>
          <div class="identity-text">
            <div class="tier-name" :style="{ color: tier.color }">{{ tier.name }}</div>
            <div class="level-pill">Lv.{{ user.level }}</div>
          </div>
        </div>

        <div v-if="streak && streak.currentStreak > 0" class="streak-pill">
          <Flame :size="18" :stroke-width="2.2" class="streak-icon" />
          <div class="streak-text">
            <div class="streak-num">
              <span>{{ streak.currentStreak }}</span><em>일 연속</em>
            </div>
            <div class="streak-sub">오늘도 잊지 마세요</div>
          </div>
        </div>
      </div>

      <!-- EXP 진행률 -->
      <div class="exp-section">
        <div class="exp-text">
          <span v-if="expToNext != null">
            <strong>Lv.{{ user.level + 1 }}</strong>까지 <strong class="exp-remain">{{ expToNext.toLocaleString() }} EXP</strong> 남았어요
          </span>
          <span v-else>최고 레벨에 도달했어요</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progress + '%', background: tier.color }"
          ></div>
        </div>
      </div>

      <!-- 활동 요약 -->
      <div class="season-summary">
        <div class="summary-cell">
          <span class="summary-value">{{ user.certificationCount }}</span>
          <span class="summary-label">총 인증</span>
        </div>
        <div class="divider"></div>
        <div class="summary-cell">
          <span class="summary-value">{{ formatNumber(user.fireCount) }}</span>
          <span class="summary-label">받은 반응</span>
        </div>
        <div class="divider"></div>
        <div class="summary-cell">
          <span class="summary-value">{{ formatNumber(user.followerCount) }}</span>
          <span class="summary-label">팔로워</span>
        </div>
      </div>

      <!-- 복구 티켓 -->
      <div v-if="streak && streak.recoveryTickets > 0" class="ticket-row">
        <div class="ticket-info">
          <div class="ticket-icon-wrap">
            <Ticket :size="18" :stroke-width="2" />
          </div>
          <div class="ticket-text">
            <div class="ticket-title">복구 티켓 <strong>{{ streak.recoveryTickets }}장</strong>이 있어요</div>
            <div class="ticket-desc">연속 인증이 끊겼을 때 사용하면 유지돼요</div>
          </div>
        </div>
        <button class="ticket-btn" @click="$emit('use-ticket')">사용하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { getTierByLevel, getNextLevelExp, getTierColor } from '@/data/levelSystemData.js'
import { Ticket, Flame } from '@/utils/collectionIcons.js'
import YogurtTierArt from '@/components/identity/YogurtTierArt.vue'

const props = defineProps({
  user: { type: Object, required: true },
  streak: { type: Object, default: null },
})

defineEmits(['use-ticket'])

const tier = computed(() => getTierByLevel(props.user.level) ?? getTierByLevel(1))
const tierColor = computed(() => getTierColor(props.user.level))

// 백엔드 응답 규약:
//  - currentLevelExp: 현재 레벨 구간에서 쌓은 EXP
//  - nextLevelExp: 다음 레벨까지 "남은" EXP (threshold가 아님)
//  - maxLevel: 최고 레벨 여부
const expRemaining = computed(() => {
  const v = Number(props.user.nextLevelExp)
  return Number.isFinite(v) && v >= 0 ? v : null
})
const levelThreshold = computed(() => {
  if (props.user.maxLevel) return null
  if (expRemaining.value != null) {
    return Number(props.user.currentExp || 0) + expRemaining.value
  }
  return getNextLevelExp(props.user.level)
})
const progress = computed(() => {
  if (props.user.maxLevel || !levelThreshold.value) return 100
  return Math.min(Math.round((props.user.currentExp / levelThreshold.value) * 100), 100)
})

const vw = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const onResize = () => (vw.value = window.innerWidth)
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
const heroArtSize = computed(() => (vw.value >= 768 ? 54 : 48))

const expToNext = computed(() => {
  if (props.user.maxLevel) return null
  if (expRemaining.value != null) return expRemaining.value
  if (!levelThreshold.value) return null
  return Math.max(levelThreshold.value - props.user.currentExp, 0)
})

const encouragement = computed(() => {
  const p = progress.value
  const s = props.streak?.currentStreak || 0
  if (s >= 30) return `${s}일째 연속 인증 중이에요. 엄청난 꾸준함이에요.`
  if (p >= 90) return '레벨업까지 거의 다 왔어요.'
  if (p >= 60) return '꾸준히 잘하고 있어요.'
  if (s >= 3) return `${s}일 연속 인증 중이에요.`
  return '작은 인증 하나부터 시작해 보세요.'
})

function formatNumber(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + '만'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}
</script>

<style scoped>
.hero-card {
  position: relative;
  overflow: hidden;
  padding: 22px 20px;
  border-radius: 4px;
}

@media (min-width: 768px) { .hero-card { padding: 28px 32px; border-radius: 4px; } }

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (min-width: 768px) { .hero-content { gap: 22px; } }

/* ===== 인사 ===== */
.greeting { display: flex; flex-direction: column; gap: 6px; }

.greeting-title {
  font-size: 16px;
  font-weight: 800;
  color: #0A0E1A;
  letter-spacing: -0.3px;
  line-height: 1.25;
}

@media (min-width: 768px) { .greeting-title { font-size: 18px; } }

.greeting-title strong { font-weight: 900; }

.greeting-sub {
  font-size: 12.5px;
  color: #475569;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.1px;
}

@media (min-width: 768px) { .greeting-sub { font-size: 13px; } }

/* ===== 프로필 + 스트릭 ===== */
.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.identity { display: flex; align-items: center; gap: 14px; min-width: 0; }

.tier-avatar {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: white;
  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.08);
}

@media (min-width: 768px) { .tier-avatar { width: 54px; height: 54px; border-radius: 6px; } }

.tier-emoji { font-size: 24px; line-height: 1; }
@media (min-width: 768px) { .tier-emoji { font-size: 28px; } }

.identity-text { display: flex; flex-direction: column; gap: 5px; }

.tier-name {
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  line-height: 1;
}

.level-pill {
  font-size: 22px;
  font-weight: 900;
  color: #0A0E1A;
  letter-spacing: -0.8px;
  line-height: 1;
}

@media (min-width: 768px) { .level-pill { font-size: 26px; } }

/* ===== 스트릭 (Neo-Brutalism) ===== */
.streak-pill {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 13px;
  background: #FF6B35;
  color: #0A0E1A;
  border: 2px solid #0A0E1A;
  border-radius: 4px;
  flex-shrink: 0;
  box-shadow: 3px 3px 0 #0A0E1A;
}

.streak-icon { color: #0A0E1A; flex-shrink: 0; }
.streak-text { line-height: 1.2; }
.streak-num { display: flex; align-items: baseline; gap: 4px; }
.streak-num span { font-size: 18px; font-weight: 900; color: #0A0E1A; letter-spacing: -0.4px; line-height: 1; font-variant-numeric: tabular-nums; }
.streak-num em { font-size: 10.5px; color: #0A0E1A; font-style: normal; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; }
.streak-sub { font-size: 10px; color: #0A0E1A; margin-top: 3px; font-weight: 700; letter-spacing: 0.2px; text-transform: uppercase; opacity: 0.8; }

/* ===== EXP ===== */
.exp-section {
  background: white;
  border-radius: 6px;
  padding: 14px 16px;
}

.exp-text {
  font-size: 13px;
  color: #475569;
  font-weight: 600;
  margin-bottom: 10px;
  letter-spacing: -0.1px;
}

.exp-text strong { color: #0A0E1A; font-weight: 800; }
.exp-text .exp-remain { color: #0A0E1A; font-variant-numeric: tabular-nums; font-weight: 900; }

.progress-bar {
  height: 8px;
  background: #F1F3F6;
  border: 1.5px solid #0A0E1A;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 0;
  transition: width 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* ===== 활동 요약 ===== */
.season-summary {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 6px;
  padding: 12px 4px;
}

.summary-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 0 8px;
}

.divider { width: 1px; align-self: stretch; background: #E5E7EB; }

.summary-value {
  font-size: 18px;
  font-weight: 900;
  color: #0A0E1A;
  letter-spacing: -0.5px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

@media (min-width: 768px) { .summary-value { font-size: 20px; } }

.summary-label { font-size: 10.5px; color: #64748B; font-weight: 700; letter-spacing: 0.2px; }

/* ===== 티켓 row ===== */
.ticket-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: white;
  border-radius: 6px;
  flex-wrap: wrap;
}

@media (max-width: 400px) {
  .ticket-row { flex-direction: column; align-items: stretch; }
  .ticket-btn { width: 100%; }
}

.ticket-info { display: flex; align-items: center; gap: 12px; min-width: 0; }

.ticket-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: #F1F3F6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  flex-shrink: 0;
}

.ticket-text { min-width: 0; }
.ticket-title { font-size: 12.5px; font-weight: 700; color: #0A0E1A; line-height: 1.3; letter-spacing: -0.2px; }
.ticket-title strong { color: #0A0E1A; font-weight: 900; }
.ticket-desc { font-size: 11.5px; color: #94A3B8; margin-top: 2px; font-weight: 500; }

.ticket-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  background: #0A0E1A;
  color: white;
  font-size: 12.5px;
  font-weight: 800;
  font-family: inherit;
  letter-spacing: -0.1px;
  cursor: pointer;
  transition: background 0.15s ease;
  flex-shrink: 0;
}

.ticket-btn:hover { background: #1E293B; }
</style>
