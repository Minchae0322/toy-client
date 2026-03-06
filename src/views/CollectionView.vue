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

        <LevelCard :user="selectedUser" />
        <TierRoadmap :user-level="selectedUser.level" />
        <TierDetail :user-level="selectedUser.level" />
        <BadgeCollection
          :earned="earnedBadges"
          :unearned="unearnedBadges"
          :total-count="totalBadgeCount"
          @select="badgeDetail = $event"
        />
        <ExpGuide />
        <ExpHistory :history="selectedUser.recentExpHistory" />

        <BadgeDetailModal
          :badge="badgeDetail"
          @close="badgeDetail = null"
        />
      </div>
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import LevelCard from '@/components/collection/LevelCard.vue'
import TierRoadmap from '@/components/collection/TierRoadmap.vue'
import TierDetail from '@/components/collection/TierDetail.vue'
import BadgeCollection from '@/components/collection/BadgeCollection.vue'
import ExpGuide from '@/components/collection/ExpGuide.vue'
import ExpHistory from '@/components/collection/ExpHistory.vue'
import BadgeDetailModal from '@/components/collection/BadgeDetailModal.vue'
import {
  TEST_USERS,
  getTierByLevel,
  getUserBadges,
  getUnearnedBadges,
  ALL_BADGES,
} from '@/data/levelSystemData.js'

const testUsers = ref(TEST_USERS)
const selectedUser = ref(TEST_USERS[2])
const badgeDetail = ref(null)

const earnedBadges = computed(() => getUserBadges(selectedUser.value))
const unearnedBadges = computed(() => getUnearnedBadges(selectedUser.value))
const totalBadgeCount = computed(() => ALL_BADGES.basic.length + ALL_BADGES.special.length)

function selectUser(user) {
  selectedUser.value = user
  badgeDetail.value = null
}
</script>

<style scoped>
.app-container {
  background: #fff;
  min-height: 100vh;
  color: #222;
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

.content-header { padding: 24px 0 8px; }
.page-title { font-size: 20px; font-weight: 700; color: #222; }
.page-subtitle { font-size: 13px; color: #64748B; margin-top: 2px; }

/* 유저 선택 */
.user-selector {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

.selector-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.selector-chips { display: flex; gap: 6px; flex-wrap: wrap; }

.chip {
  padding: 6px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  background: white;
  font-size: 13px;
  font-family: inherit;
  color: #222;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.chip:hover { border-color: #9333ea; color: #9333ea; }

.chip.active {
  background: #9333ea;
  border-color: #9333ea;
  color: white;
  font-weight: 500;
}
</style>
