<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <div class="content-inner">
        <div class="content-header">
          <h2 class="page-title">컬렉션</h2>
          <p class="page-subtitle">레벨 & 뱃지</p>
        </div>

        <!-- 유저 선택 (테스트용) -->
        <div class="user-selector">
          <span class="selector-label">테스트 유저 선택</span>
          <div class="selector-chips">
            <button
              v-for="user in testUsers"
              :key="user.userId"
              class="chip"
              :class="{ active: selectedUser.userId === user.userId }"
              @click="selectUser(user)"
            >
              {{ getTierByLevel(user.level).emoji }} {{ user.nickname }}
            </button>
          </div>
        </div>

        <!-- 레벨 카드 -->
        <div class="level-card" :style="levelCardStyle">
          <div class="level-card-header">
            <div class="level-info">
              <span class="tier-emoji">{{ currentTier.emoji }}</span>
              <div>
                <div class="tier-name" :style="{ color: currentTier.color }">{{ currentTier.name }}</div>
                <div class="level-number">Lv. {{ selectedUser.level }}</div>
              </div>
            </div>
            <div class="user-nickname">{{ selectedUser.nickname }}</div>
          </div>

          <div class="level-progress-section">
            <div class="progress-header">
              <span class="progress-label">다음 레벨까지</span>
              <span class="progress-value">
                {{ selectedUser.currentExp }} / {{ nextLevelExp }} EXP
              </span>
            </div>
            <div class="progress-bar-track">
              <div
                class="progress-bar-fill"
                :style="{ width: levelProgress + '%', background: currentTier.color }"
              ></div>
            </div>
            <div class="progress-percentage">{{ levelProgress }}%</div>
          </div>

          <div class="level-stats">
            <div class="stat-box">
              <span class="stat-value">{{ formatNumber(selectedUser.totalExp) }}</span>
              <span class="stat-label">총 EXP</span>
            </div>
            <div class="stat-box">
              <span class="stat-value">{{ selectedUser.certificationCount }}</span>
              <span class="stat-label">인증</span>
            </div>
            <div class="stat-box">
              <span class="stat-value">{{ formatNumber(selectedUser.fireCount) }}</span>
              <span class="stat-label">받은 🔥</span>
            </div>
            <div class="stat-box">
              <span class="stat-value">{{ formatNumber(selectedUser.followerCount) }}</span>
              <span class="stat-label">팔로워</span>
            </div>
          </div>
        </div>

        <!-- 5단계 등급 로드맵 -->
        <div class="section-card">
          <h3 class="section-title">등급 로드맵</h3>
          <div class="tier-roadmap">
            <div
              v-for="(tier, idx) in levelTiers"
              :key="tier.tier"
              class="roadmap-item"
              :class="{
                current: currentTier.tier === tier.tier,
                achieved: isAchievedTier(tier),
                locked: !isAchievedTier(tier) && currentTier.tier !== tier.tier
              }"
            >
              <div class="roadmap-connector" v-if="idx > 0">
                <div
                  class="connector-line"
                  :class="{ filled: isAchievedTier(tier) || currentTier.tier === tier.tier }"
                ></div>
              </div>
              <div
                class="roadmap-circle"
                :style="{
                  borderColor: (isAchievedTier(tier) || currentTier.tier === tier.tier) ? tier.color : '#d1d5db',
                  background: isAchievedTier(tier) ? tier.bgColor : (currentTier.tier === tier.tier ? tier.bgColor : '#f9fafb'),
                }"
              >
                <span class="roadmap-emoji">{{ tier.emoji }}</span>
              </div>
              <div class="roadmap-info">
                <span
                  class="roadmap-name"
                  :style="{ color: (isAchievedTier(tier) || currentTier.tier === tier.tier) ? tier.color : '#9ca3af' }"
                >{{ tier.name }}</span>
                <span class="roadmap-levels">Lv.{{ tier.levelRange[0] }}-{{ tier.levelRange[1] === 99 ? '∞' : tier.levelRange[1] }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 현재 등급 상세 -->
        <div class="section-card" :style="{ borderColor: currentTier.borderColor }">
          <div class="tier-detail-header">
            <span class="tier-detail-emoji">{{ currentTier.emoji }}</span>
            <div>
              <h3 class="section-title" style="margin-bottom: 2px;">{{ currentTier.name }} 등급</h3>
              <p class="tier-description">{{ currentTier.description }}</p>
            </div>
          </div>

          <div class="feature-list">
            <h4 class="feature-heading">사용 가능한 기능</h4>
            <div v-for="feature in currentTier.features" :key="feature" class="feature-item available">
              <span class="feature-icon">✅</span>
              <span>{{ feature }}</span>
            </div>
          </div>

          <div class="feature-list" v-if="currentTier.restrictions.length > 0">
            <h4 class="feature-heading">제한 사항</h4>
            <div v-for="restriction in currentTier.restrictions" :key="restriction" class="feature-item restricted">
              <span class="feature-icon">🔒</span>
              <span>{{ restriction }}</span>
            </div>
          </div>

          <div class="next-goal" v-if="currentTier.nextGoal">
            <span class="goal-icon">🎯</span>
            <span class="goal-text">{{ currentTier.nextGoal }}</span>
          </div>
        </div>

        <!-- 뱃지 컬렉션 -->
        <div class="section-card">
          <div class="badge-section-header">
            <h3 class="section-title">뱃지 컬렉션</h3>
            <span class="badge-count">{{ earnedBadges.length }} / {{ totalBadgeCount }}</span>
          </div>

          <!-- 획득한 뱃지 -->
          <div v-if="earnedBadges.length > 0" class="badge-group">
            <h4 class="badge-group-title">획득한 뱃지</h4>
            <div class="badge-grid">
              <div
                v-for="badge in earnedBadges"
                :key="badge.id"
                class="badge-card earned"
                :style="{ borderColor: badge.color + '40' }"
                @click="openBadgeDetail(badge)"
              >
                <div class="badge-emoji-wrap" :style="{ background: badge.color + '15' }">
                  <span class="badge-emoji">{{ badge.emoji }}</span>
                  <span v-if="badge.count > 1" class="badge-stack">x{{ badge.count }}</span>
                </div>
                <span class="badge-name">{{ badge.name }}</span>
                <span class="badge-date">{{ formatBadgeDate(badge.earnedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- 미획득 뱃지 -->
          <div v-if="unearnedBadges.length > 0" class="badge-group">
            <h4 class="badge-group-title">도전 중인 뱃지</h4>
            <div class="badge-grid">
              <div
                v-for="badge in unearnedBadges"
                :key="badge.id"
                class="badge-card locked"
                @click="openBadgeDetail(badge)"
              >
                <div class="badge-emoji-wrap locked-bg">
                  <span class="badge-emoji grayscale">{{ badge.emoji }}</span>
                </div>
                <span class="badge-name">{{ badge.name }}</span>
                <div v-if="badge.progress" class="badge-progress">
                  <div class="badge-progress-bar">
                    <div
                      class="badge-progress-fill"
                      :style="{ width: (badge.progress.current / badge.progress.target * 100) + '%' }"
                    ></div>
                  </div>
                  <span class="badge-progress-text">{{ badge.progress.current }}/{{ badge.progress.target }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- EXP 획득 기준 -->
        <div class="section-card">
          <h3 class="section-title">EXP 획득 가이드</h3>

          <div v-for="(rules, category) in expRulesByCategory" :key="category" class="exp-category">
            <h4 class="exp-category-title">{{ category }}</h4>
            <div class="exp-rules-list">
              <div v-for="rule in rules" :key="rule.action" class="exp-rule-item">
                <span class="exp-rule-icon">{{ rule.icon }}</span>
                <span class="exp-rule-action">{{ rule.action }}</span>
                <div class="exp-rule-right">
                  <span class="exp-rule-value">+{{ rule.exp }} EXP</span>
                  <span v-if="rule.limit" class="exp-rule-limit">{{ rule.limit }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 최근 EXP 내역 -->
        <div class="section-card">
          <h3 class="section-title">최근 EXP 획득 내역</h3>
          <div class="exp-history">
            <div
              v-for="(entry, idx) in selectedUser.recentExpHistory"
              :key="idx"
              class="exp-history-item"
            >
              <div class="exp-history-left">
                <span class="exp-history-action">{{ entry.action }}</span>
                <span class="exp-history-date">{{ entry.date }}</span>
              </div>
              <span class="exp-history-value">+{{ entry.exp }} EXP</span>
            </div>
          </div>
        </div>

        <!-- 뱃지 상세 모달 -->
        <div v-if="badgeDetail" class="modal-overlay" @click.self="closeBadgeDetail">
          <div class="modal-card">
            <div class="modal-header">
              <div
                class="modal-badge-emoji"
                :style="{ background: (badgeDetail.color || '#9ca3af') + '15' }"
              >
                <span :class="{ grayscale: !badgeDetail.earnedAt }">{{ badgeDetail.emoji }}</span>
                <span v-if="badgeDetail.count > 1" class="modal-badge-stack">x{{ badgeDetail.count }}</span>
              </div>
              <button class="modal-close" @click="closeBadgeDetail">&times;</button>
            </div>
            <h3 class="modal-badge-name">{{ badgeDetail.name }}</h3>
            <span
              class="modal-badge-type"
              :class="badgeDetail.type"
            >{{ badgeDetail.type === 'basic' ? '기본 뱃지' : '특별 뱃지' }}</span>
            <p class="modal-description">{{ badgeDetail.description }}</p>

            <div class="modal-info-row">
              <span class="modal-info-label">획득 조건</span>
              <span class="modal-info-value">{{ badgeDetail.condition }}</span>
            </div>
            <div class="modal-info-row">
              <span class="modal-info-label">효과</span>
              <span class="modal-info-value">{{ badgeDetail.effect }}</span>
            </div>

            <div v-if="badgeDetail.earnedAt" class="modal-earned">
              {{ formatBadgeDate(badgeDetail.earnedAt) }} 획득
            </div>
            <div v-else-if="badgeDetail.progress" class="modal-progress-detail">
              <div class="modal-progress-header">
                <span>진행도</span>
                <span>{{ badgeDetail.progress.current }} / {{ badgeDetail.progress.target }}</span>
              </div>
              <div class="badge-progress-bar large">
                <div
                  class="badge-progress-fill"
                  :style="{ width: (badgeDetail.progress.current / badgeDetail.progress.target * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import {
  LEVEL_TIERS,
  EXP_RULES,
  TEST_USERS,
  getTierByLevel,
  getNextLevelExp,
  getLevelProgress,
  getUserBadges,
  getUnearnedBadges,
  ALL_BADGES,
} from '@/data/levelSystemData.js'

// ==================== State ====================
const testUsers = ref(TEST_USERS)
const selectedUser = ref(TEST_USERS[2]) // 기본: 컬렉터 유저
const badgeDetail = ref(null)
const levelTiers = ref(LEVEL_TIERS)

// ==================== Computed ====================
const currentTier = computed(() => getTierByLevel(selectedUser.value.level))

const nextLevelExp = computed(() => getNextLevelExp(selectedUser.value.level) || '∞')

const levelProgress = computed(() =>
  getLevelProgress(selectedUser.value.level, selectedUser.value.currentExp)
)

const levelCardStyle = computed(() => ({
  borderColor: currentTier.value.borderColor,
  background: currentTier.value.bgColor,
}))

const earnedBadges = computed(() => getUserBadges(selectedUser.value))
const unearnedBadges = computed(() => getUnearnedBadges(selectedUser.value))

const totalBadgeCount = computed(
  () => ALL_BADGES.basic.length + ALL_BADGES.special.length
)

const expRulesByCategory = computed(() => ({
  '일상 활동': EXP_RULES.daily,
  '배틀 활동': EXP_RULES.battle,
  '소셜 활동': EXP_RULES.social,
  '특별 보너스': EXP_RULES.special,
}))

// ==================== Methods ====================
function selectUser(user) {
  selectedUser.value = user
  badgeDetail.value = null
}

function isAchievedTier(tier) {
  const userTierIdx = LEVEL_TIERS.findIndex((t) => t.tier === currentTier.value.tier)
  const thisTierIdx = LEVEL_TIERS.findIndex((t) => t.tier === tier.tier)
  return thisTierIdx < userTierIdx
}

function openBadgeDetail(badge) {
  badgeDetail.value = badge
}

function closeBadgeDetail() {
  badgeDetail.value = null
}

function formatNumber(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + '만'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

function formatBadgeDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
:root {
  --primary: #222222;
  --secondary: #64748B;
  --accent: #9333ea;
  --bg: #FFFFFF;
  --card: #FFFFFF;
  --border: #E2E8F0;
  --hover: #F8FAFC;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

.app-container {
  background: var(--bg);
  min-height: 100vh;
  color: var(--primary);
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  display: flex;
  max-width: 100%;
  overflow-x: clip;
  padding: 0 1rem;
}

@media (min-width: 768px) { .app-container { padding: 0 2rem; } }
@media (min-width: 1280px) { .app-container { padding: 0 3rem; max-width: 1920px; margin-left: auto; margin-right: auto; } }

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  padding-bottom: 5rem;
}

@media (min-width: 768px) { .main-content { padding-bottom: 2.5rem; } }

.content-inner {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (min-width: 768px) { .content-inner { padding: 0; } }

.content-header {
  padding: 24px 0 8px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

.page-subtitle {
  font-size: 13px;
  color: var(--secondary);
  margin-top: 2px;
}

/* ==================== 유저 선택 ==================== */
.user-selector {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 12px;
}

.selector-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.selector-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: white;
  font-size: 13px;
  font-family: inherit;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
  font-weight: 500;
}

/* ==================== 레벨 카드 ==================== */
.level-card {
  border: 2px solid;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.level-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tier-emoji {
  font-size: 36px;
  line-height: 1;
}

.tier-name {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.level-number {
  font-size: 22px;
  font-weight: 800;
  color: var(--primary);
}

.user-nickname {
  font-size: 14px;
  font-weight: 600;
  color: var(--secondary);
  background: white;
  padding: 4px 12px;
  border-radius: 20px;
}

.level-progress-section {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 12px;
  color: var(--secondary);
  font-weight: 500;
}

.progress-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
}

.progress-bar-track {
  height: 10px;
  background: rgba(255,255,255,0.8);
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
}

.progress-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.6s ease;
}

.progress-percentage {
  text-align: right;
  font-size: 11px;
  color: var(--secondary);
  margin-top: 4px;
  font-weight: 500;
}

.level-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.stat-box {
  text-align: center;
  padding: 10px 4px;
  background: rgba(255,255,255,0.7);
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.04);
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  display: block;
  font-size: 11px;
  color: var(--secondary);
  margin-top: 2px;
}

/* ==================== 섹션 카드 ==================== */
.section-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 16px;
}

/* ==================== 등급 로드맵 ==================== */
.tier-roadmap {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  padding: 0 4px;
}

.roadmap-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 0;
}

.roadmap-connector {
  position: absolute;
  top: 22px;
  right: 50%;
  width: 100%;
  height: 3px;
  z-index: 0;
}

.connector-line {
  width: 100%;
  height: 100%;
  background: #e5e7eb;
  border-radius: 2px;
}

.connector-line.filled {
  background: #a855f7;
}

.roadmap-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: all 0.3s;
}

.roadmap-item.current .roadmap-circle {
  box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.15);
  transform: scale(1.1);
}

.roadmap-emoji {
  font-size: 18px;
  line-height: 1;
}

.roadmap-item.locked .roadmap-emoji {
  filter: grayscale(0.6);
  opacity: 0.5;
}

.roadmap-info {
  text-align: center;
  margin-top: 8px;
}

.roadmap-name {
  display: block;
  font-size: 11px;
  font-weight: 700;
}

.roadmap-levels {
  display: block;
  font-size: 10px;
  color: #9ca3af;
  margin-top: 1px;
}

/* ==================== 등급 상세 ==================== */
.tier-detail-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.tier-detail-emoji {
  font-size: 32px;
  line-height: 1;
}

.tier-description {
  font-size: 13px;
  color: var(--secondary);
  line-height: 1.5;
}

.feature-list {
  margin-bottom: 12px;
}

.feature-heading {
  font-size: 12px;
  font-weight: 600;
  color: var(--secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  color: var(--primary);
}

.feature-item.restricted {
  color: var(--secondary);
}

.feature-icon {
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
}

.next-goal {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 10px;
  margin-top: 12px;
}

.goal-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.goal-text {
  font-size: 13px;
  font-weight: 600;
  color: #7c3aed;
}

/* ==================== 뱃지 컬렉션 ==================== */
.badge-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge-count {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
}

.badge-group {
  margin-top: 16px;
}

.badge-group-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--secondary);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

@media (min-width: 500px) {
  .badge-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.badge-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 8px 10px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
}

.badge-card.earned {
  background: white;
}

.badge-card.earned:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.badge-card.locked {
  background: #f9fafb;
  border-color: #e5e7eb;
}

.badge-card.locked:hover {
  background: #f3f4f6;
}

.badge-emoji-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  position: relative;
}

.badge-emoji-wrap.locked-bg {
  background: #f3f4f6;
}

.badge-emoji {
  font-size: 22px;
  line-height: 1;
}

.badge-emoji.grayscale {
  filter: grayscale(1);
  opacity: 0.4;
}

.badge-stack,
.modal-badge-stack {
  position: absolute;
  top: -4px;
  right: -6px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 8px;
  min-width: 20px;
  text-align: center;
}

.badge-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--primary);
  text-align: center;
}

.badge-card.locked .badge-name {
  color: #9ca3af;
}

.badge-date {
  font-size: 10px;
  color: var(--secondary);
  margin-top: 2px;
}

.badge-progress {
  width: 100%;
  margin-top: 6px;
}

.badge-progress-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.badge-progress-bar.large {
  height: 8px;
  border-radius: 4px;
}

.badge-progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.4s ease;
}

.badge-progress-text {
  display: block;
  text-align: center;
  font-size: 10px;
  color: var(--secondary);
  margin-top: 2px;
}

/* ==================== EXP 가이드 ==================== */
.exp-category {
  margin-bottom: 16px;
}

.exp-category:last-child {
  margin-bottom: 0;
}

.exp-category-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
}

.exp-rules-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exp-rule-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  border-radius: 8px;
  transition: background 0.15s;
}

.exp-rule-item:hover {
  background: #f8fafc;
}

.exp-rule-icon {
  font-size: 16px;
  flex-shrink: 0;
  width: 22px;
  text-align: center;
}

.exp-rule-action {
  flex: 1;
  font-size: 13px;
  color: var(--primary);
}

.exp-rule-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.exp-rule-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  white-space: nowrap;
}

.exp-rule-limit {
  font-size: 10px;
  color: var(--secondary);
}

/* ==================== EXP 내역 ==================== */
.exp-history {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exp-history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 4px;
  border-bottom: 1px solid #f3f4f6;
}

.exp-history-item:last-child {
  border-bottom: none;
}

.exp-history-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exp-history-action {
  font-size: 13px;
  font-weight: 500;
  color: var(--primary);
}

.exp-history-date {
  font-size: 11px;
  color: var(--secondary);
}

.exp-history-value {
  font-size: 14px;
  font-weight: 700;
  color: #22c55e;
  white-space: nowrap;
}

/* ==================== 뱃지 상세 모달 ==================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  width: 100%;
  max-width: 360px;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.modal-badge-emoji {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  position: relative;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--secondary);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-badge-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.modal-badge-type {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.modal-badge-type.basic {
  background: #eff6ff;
  color: #3b82f6;
}

.modal-badge-type.special {
  background: #faf5ff;
  color: #9333ea;
}

.modal-description {
  font-size: 13px;
  color: var(--secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.modal-info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0;
  border-top: 1px solid #f3f4f6;
  gap: 8px;
}

.modal-info-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.modal-info-value {
  font-size: 13px;
  color: var(--primary);
  text-align: right;
}

.modal-earned {
  text-align: center;
  padding: 12px;
  margin-top: 12px;
  background: #f0fdf4;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #16a34a;
}

.modal-progress-detail {
  margin-top: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.modal-progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: var(--secondary);
  margin-bottom: 8px;
}

.grayscale {
  filter: grayscale(1);
  opacity: 0.4;
}
</style>
