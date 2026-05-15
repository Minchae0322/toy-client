<template>
  <section class="profile">
    <!-- 로딩 스켈레톤 -->
    <div v-if="!isProfileLoaded" class="profile-wrap">
      <!-- 모바일 스켈레톤 -->
      <div class="mobile">
        <div class="sk sk-avatar"></div>
        <div class="sk sk-name"></div>
        <div class="sk-stats">
          <div class="sk sk-stat"></div>
          <div class="sk sk-stat"></div>
          <div class="sk sk-stat"></div>
        </div>
        <div class="sk sk-bio"></div>
      </div>
      <!-- PC 스켈레톤 -->
      <div class="desktop">
        <div class="sk sk-avatar"></div>
        <div class="sk-info">
          <div class="sk sk-name"></div>
          <div class="sk-stats">
            <div class="sk sk-stat"></div>
            <div class="sk sk-stat"></div>
            <div class="sk sk-stat"></div>
          </div>
          <div class="sk sk-bio"></div>
        </div>
      </div>
    </div>

    <!-- 컨텐츠 -->
    <div v-else class="profile-wrap">
      <!-- 모바일: 세로 중앙 정렬 -->
      <div class="mobile">
        <div class="avatar-wrap">
          <img
              v-if="profileData.profilePicture?.fileUrl"
              :src="profileData.profilePicture.fileUrl"
              :alt="profileData.nickname"
              class="avatar"
          />
          <div v-else class="avatar avatar-empty">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
            </svg>
          </div>
        </div>

        <h1 class="username">{{ profileData.nickname || '사용자' }}</h1>

        <div v-if="userLevel != null" class="identity-row">
          <div class="tier-chip" :style="{ color: tierMeta?.color }">
            <YogurtTierArt :tier="tierArt" :color="tierColor" :size="14" />
            <span class="tier-name">{{ tierName }}</span>
            <span class="tier-sep">·</span>
            <span class="tier-level">Lv.{{ userLevel }}</span>
          </div>
          <UserBadgeInline v-if="primaryBadgeId" :badge-id="primaryBadgeId" size="sm" />
        </div>

        <div class="action-row">
          <template v-if="isOwnProfile">
            <button class="btn btn-soft" @click="handleEditProfile">프로필 편집</button>
          </template>
          <template v-else>
            <button
                class="btn"
                :class="profileData.isFollowing ? 'btn-soft' : 'btn-dark'"
                @click="handleFollow"
                :disabled="isFollowLoading"
            >
              {{ profileData.isFollowing ? '팔로잉' : '팔로우' }}
            </button>
            <button class="btn btn-soft btn-icon" @click="handleSendMessage" aria-label="메시지">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <div class="more-wrap" ref="moreMenuRefMobile">
              <button class="btn btn-soft btn-icon" @click="toggleMoreMenu" aria-label="더보기" :aria-expanded="moreMenuOpen">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="5" r="1"/>
                  <circle cx="12" cy="12" r="1"/>
                  <circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
              <div v-if="moreMenuOpen" class="more-menu" role="menu">
                <button type="button" class="more-item danger" @click="handleToggleBlock" role="menuitem">
                  {{ isUserBlocked ? '차단 해제' : '이 사용자 차단하기' }}
                </button>
              </div>
            </div>
          </template>
        </div>

        <div class="stats-row">
          <div class="stat">
            <strong>{{ formatNumber(postCount) }}</strong>
            <span>게시물</span>
          </div>
          <button class="stat stat-btn" @click="goToFollowList('followers')">
            <strong>{{ formatNumber(profileData.followerCount) }}</strong>
            <span>팔로워</span>
          </button>
          <button class="stat stat-btn" @click="goToFollowList('followings')">
            <strong>{{ formatNumber(profileData.followingCount) }}</strong>
            <span>팔로잉</span>
          </button>
        </div>

        <div v-if="isOwnProfile && expToNext != null" class="exp-row">
          <div class="exp-head">
            <span class="exp-label">다음 레벨까지</span>
            <strong class="exp-value">{{ expToNext }}<em>EXP</em></strong>
          </div>
          <div class="exp-bar"><div class="exp-fill" :style="{ width: expPercent + '%' }"></div></div>
        </div>

        <p v-if="profileData.description" class="bio">{{ profileData.description }}</p>

        <div class="meta-info">
          <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span>{{ formatJoinDate(profileData.createdAt) }}</span>
        </div>
      </div>

      <!-- PC/태블릿: 아바타 | 인포 (카드·그림자·컬러 바 없음) -->
      <div class="desktop">
        <div class="avatar-wrap">
          <img
              v-if="profileData.profilePicture?.fileUrl"
              :src="profileData.profilePicture.fileUrl"
              :alt="profileData.nickname"
              class="avatar"
          />
          <div v-else class="avatar avatar-empty">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
            </svg>
          </div>
        </div>

        <div class="info">
          <div class="row-top">
            <h1 class="username">{{ profileData.nickname || '사용자' }}</h1>
            <div class="action-row">
              <template v-if="isOwnProfile">
                <button class="btn btn-soft" @click="handleEditProfile">프로필 편집</button>
              </template>
              <template v-else>
                <button
                    class="btn"
                    :class="profileData.isFollowing ? 'btn-soft' : 'btn-dark'"
                    @click="handleFollow"
                    :disabled="isFollowLoading"
                >
                  {{ profileData.isFollowing ? '팔로잉' : '팔로우' }}
                </button>
                <button class="btn btn-soft btn-icon" @click="handleSendMessage" aria-label="메시지">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>
                <div class="more-wrap" ref="moreMenuRefDesktop">
                  <button class="btn btn-soft btn-icon" @click="toggleMoreMenu" aria-label="더보기" :aria-expanded="moreMenuOpen">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="5" r="1"/>
                      <circle cx="12" cy="12" r="1"/>
                      <circle cx="12" cy="19" r="1"/>
                    </svg>
                  </button>
                  <div v-if="moreMenuOpen" class="more-menu" role="menu">
                    <button type="button" class="more-item danger" @click="handleToggleBlock" role="menuitem">
                      {{ isUserBlocked ? '차단 해제' : '이 사용자 차단하기' }}
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div class="stats-row">
            <div class="stat">
              <strong>{{ formatNumber(postCount) }}</strong>
              <span>게시물</span>
            </div>
            <button class="stat stat-btn" @click="goToFollowList('followers')">
              <strong>{{ formatNumber(profileData.followerCount) }}</strong>
              <span>팔로워</span>
            </button>
            <button class="stat stat-btn" @click="goToFollowList('followings')">
              <strong>{{ formatNumber(profileData.followingCount) }}</strong>
              <span>팔로잉</span>
            </button>
          </div>

          <div v-if="userLevel != null" class="identity-row">
            <div class="tier-chip" :style="{ color: tierMeta?.color }">
              <YogurtTierArt :tier="tierArt" :color="tierColor" :size="14" />
              <span class="tier-name">{{ tierName }}</span>
              <span class="tier-sep">·</span>
              <span class="tier-level">Lv.{{ userLevel }}</span>
            </div>
            <UserBadgeInline v-if="primaryBadgeId" :badge-id="primaryBadgeId" size="sm" />
          </div>

          <p v-if="profileData.description" class="bio">{{ profileData.description }}</p>

          <div v-if="isOwnProfile && expToNext != null" class="exp-row">
            <div class="exp-head">
              <span class="exp-label">다음 레벨까지</span>
              <strong class="exp-value">{{ expToNext }}<em>EXP</em></strong>
            </div>
            <div class="exp-bar"><div class="exp-fill" :style="{ width: expPercent + '%' }"></div></div>
          </div>

          <div class="meta-info">
            <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>{{ formatJoinDate(profileData.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userService, userUtils } from '@/services/UserService'
import { chatService } from '@/services/ChatService.js'
import { rewardsService } from '@/services/RewardsService.js'
import { useAuth } from '@/composables/useAuth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useUserBlock } from '@/composables/useUserBlock.js'
import YogurtTierArt from '@/components/identity/YogurtTierArt.vue'
import UserBadgeInline from '@/components/identity/UserBadgeInline.vue'
import { getTierByLevel, getTierColor } from '@/data/levelSystemData.js'

const route = useRoute()
const router = useRouter()
const { isLoggedIn, userId } = useAuth()
const { open, openLoginRequired } = useConfirmDialog()
const userBlock = useUserBlock()

const moreMenuOpen = ref(false)
const moreMenuRefMobile = ref(null)
const moreMenuRefDesktop = ref(null)

const profileData = ref({
  userId: null,
  nickname: '',
  description: '',
  followerCount: 0,
  followingCount: 0,
  feedCount: 0,
  isFollowing: false,
  profilePicture: null,
  createdAt: null,
  updatedAt: null
})

const postCount = computed(() => {
  const p = profileData.value
  return p?.feedCount ?? p?.postCount ?? p?.contentCount ?? 0
})

const isFollowLoading = ref(false)
const isProfileLoaded = ref(false)

// ── 보상 데이터 ──
// rewards: 모든 유저 (다른 유저 프로필에서도 레벨/tier 노출)
// badges: 자기 프로필일 때만 (핀 표시용 /rewards/me/badges)
const userRewards = ref(null)
const myBadges = ref([])

const isOwnProfile = computed(() => {
  if (!profileData.value.userId) return true
  return isLoggedIn.value && String(userId.value) === String(profileData.value.userId)
})

// ── Tier / 레벨 / 뱃지 ──
const userLevel = computed(() => {
  if (profileData.value?.level != null) return profileData.value.level
  if (userRewards.value?.level != null) return userRewards.value.level
  return null
})

const tierMeta = computed(() => {
  if (userLevel.value == null) return null
  return getTierByLevel(userLevel.value)
})

const tierColor = computed(() => {
  if (userLevel.value == null) return 'white'
  return getTierColor(userLevel.value)
})

const tierArt = computed(() => tierMeta.value?.art ?? 'plain')
const tierName = computed(() => tierMeta.value?.name ?? '')

const primaryBadgeId = computed(() => {
  const u = profileData.value
  const pick = u?.primaryBadgeId || u?.representativeBadgeId || (Array.isArray(u?.badgeIds) ? u.badgeIds[0] : null)
  if (pick) return pick
  if (isOwnProfile.value) {
    const pinned = myBadges.value.find(b => b.pinned)
    return pinned?.badgeId || pinned?.id || myBadges.value[0]?.badgeId || myBadges.value[0]?.id || null
  }
  return null
})

const expToNext = computed(() => {
  const r = userRewards.value
  if (!r || r.nextLevelExp == null || r.currentExp == null) return null
  return Math.max(0, r.nextLevelExp - r.currentExp)
})

const expPercent = computed(() => {
  const r = userRewards.value
  if (!r || !r.nextLevelExp) return 0
  return Math.min(100, Math.round((r.currentExp / r.nextLevelExp) * 100))
})

const loadProfile = async () => {
  try {
    const targetUserId = route.params.userId || userId.value
    if (!targetUserId) {
      console.error('사용자 ID를 찾을 수 없습니다.')
      return
    }
    const response = await userService.getUserProfile(targetUserId)
    if (response.success && response.data) {
      profileData.value = response.data
    }
  } catch (error) {
    console.error('프로필 로드 실패:', error)
  } finally {
    isProfileLoaded.value = true
    loadRewards()
    if (isOwnProfile.value) loadOwnBadges()
  }
}

const loadRewards = async () => {
  try {
    const targetUserId = route.params.userId || userId.value
    if (!targetUserId) return
    const rewardsRes = await rewardsService.getUserRewards(targetUserId)
    userRewards.value = rewardsRes?.data ?? null
  } catch (e) {
    console.warn('유저 보상 데이터 로딩 실패:', e)
  }
}

const loadOwnBadges = async () => {
  try {
    const badgesRes = await rewardsService.getMyBadges()
    myBadges.value = Array.isArray(badgesRes?.data) ? badgesRes.data : []
  } catch (e) {
    console.warn('내 뱃지 로딩 실패:', e)
  }
}

const goToFollowList = (tab) => {
  const targetUserId = route.params.userId || userId.value
  router.push({
    name: 'FollowList',
    params: { userId: targetUserId },
    query: { tab }
  })
}

const handleFollow = async () => {
  if (!isLoggedIn.value) {
    const confirmed = await openLoginRequired('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?')
    if (confirmed) {
      await router.push({ name: 'Login', query: { redirect: route.fullPath } })
    }
    return
  }
  if (isFollowLoading.value) return

  try {
    isFollowLoading.value = true
    const response = await userService.toggleFollow(profileData.value.userId)
    if (response.success && response.data) {
      profileData.value.isFollowing = response.data.isFollowing
      profileData.value.followerCount += response.data.isFollowing ? 1 : -1
    }
  } catch (error) {
    console.error('팔로우 토글 실패:', error)
    await open({ type: 'alert', title: '오류', message: '팔로우 처리 중 오류가 발생했습니다.' })
  } finally {
    isFollowLoading.value = false
  }
}

const handleSendMessage = async () => {
  if (!profileData.value?.userId) return
  if (!isLoggedIn.value) {
    const confirmed = await openLoginRequired('메시지를 보내려면 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?')
    if (confirmed) {
      await router.push({ name: 'Login', query: { redirect: route.fullPath } })
    }
    return
  }
  if (String(userId.value) === String(profileData.value.userId)) {
    await open({ type: 'alert', title: '알림', message: '본인에게는 메시지를 보낼 수 없습니다.' })
    return
  }
  try {
    const response = await chatService.startChat({
      chatContext: 'DIRECT',
      creatorId: profileData.value.userId,
      participantIds: [Number(userId.value), Number(profileData.value.userId)],
    })
    if (response.success && response.data?.roomId) {
      router.push({ name: 'ChatWithRoom', params: { roomId: response.data.roomId } })
    } else {
      throw new Error(response.message || '채팅방 생성 실패')
    }
  } catch (err) {
    console.error('메시지 시작 실패:', err)
    await open({ type: 'alert', title: '오류', message: err.message || '메시지를 시작할 수 없습니다.' })
  }
}

const handleEditProfile = () => {
  router.push({ name: 'MyPage' })
}

const isUserBlocked = computed(() => {
  const id = profileData.value?.userId
  if (id == null) return false
  return userBlock.isBlocked(id)
})

const toggleMoreMenu = (e) => {
  e?.stopPropagation()
  moreMenuOpen.value = !moreMenuOpen.value
}

const closeMoreMenu = () => {
  moreMenuOpen.value = false
}

const handleToggleBlock = async () => {
  closeMoreMenu()
  const targetId = profileData.value?.userId
  if (!targetId) return

  if (!isLoggedIn.value) {
    const confirmed = await openLoginRequired('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?')
    if (confirmed) await router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }

  if (isUserBlocked.value) {
    const confirmed = await open({
      type: 'confirm',
      title: '차단을 해제할까요?',
      message: '차단을 해제하면 다시 게시물·댓글·메시지를 볼 수 있습니다.',
      confirmText: '차단 해제',
      cancelText: '취소',
    })
    if (!confirmed) return
    userBlock.unblock(targetId)
    await open({ type: 'alert', title: '완료', message: '차단이 해제되었습니다.' })
    return
  }

  const ok = await userBlock.blockWithConfirm(targetId, {
    nickname: profileData.value?.nickname || null,
    profileImage: profileData.value?.profilePicture?.fileUrl || null,
  })
  if (ok) {
    await router.push({ name: 'FeedHome' })
  }
}

const handleDocClick = (e) => {
  if (!moreMenuOpen.value) return
  const inMobile = moreMenuRefMobile.value && moreMenuRefMobile.value.contains(e.target)
  const inDesktop = moreMenuRefDesktop.value && moreMenuRefDesktop.value.contains(e.target)
  if (!inMobile && !inDesktop) closeMoreMenu()
}

const handleDocKeydown = (e) => {
  if (e.key === 'Escape') closeMoreMenu()
}

const formatNumber = (num) => userUtils.formatFollowCount(num)

const formatJoinDate = (dateString) => {
  if (!dateString) return '가입일 미상'
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')} 가입`
}

onMounted(() => {
  loadProfile()
  document.addEventListener('click', handleDocClick)
  document.addEventListener('keydown', handleDocKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocClick)
  document.removeEventListener('keydown', handleDocKeydown)
})

// 같은 뷰에서 다른 유저로 이동하면 프로필·보상 다시 로드
watch(() => route.params.userId, (newId, oldId) => {
  if (newId === oldId) return
  isProfileLoaded.value = false
  closeMoreMenu()
  profileData.value = {
    userId: null,
    nickname: '',
    description: '',
    followerCount: 0,
    followingCount: 0,
    feedCount: 0,
    isFollowing: false,
    profilePicture: null,
    createdAt: null,
    updatedAt: null,
  }
  userRewards.value = null
  myBadges.value = []
  loadProfile()
})
</script>

<style scoped>
/* 토큰: Ink 900 var(--c-ink-900) / Text 600 var(--c-text-600) / Text 500 var(--c-text-500) / Text 400 var(--c-text-400) / Border var(--border-default)
   대원칙 — 흰 캔버스. 카드/그림자/컬러 바/회색 구분 박스 없이 타이포·여백으로 위계. */

.profile {
  background: var(--bg-elevated);
  border-radius: 16px;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

.profile-wrap {
  padding: 24px 20px 20px;
}

@media (min-width: 768px) {
  .profile-wrap {
    padding: 40px 32px 28px;
  }
}

/* ============ 모바일: 세로 중앙 ============ */
.mobile {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
}

@media (min-width: 768px) {
  .mobile { display: none; }
}

/* ============ 데스크톱: 아바타 | 인포 ============ */
.desktop { display: none; }

@media (min-width: 768px) {
  .desktop {
    display: flex;
    align-items: flex-start;
    gap: 56px;
  }
}

@media (min-width: 1024px) {
  .desktop { gap: 80px; }
}

.info {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}

.row-top {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

/* ============ 아바타 (링/그림자 없음) ============ */
.avatar-wrap { flex-shrink: 0; }

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-subtle);
  box-shadow: inset 0 0 0 1px var(--border-default);
  display: block;
}

@media (min-width: 768px) {
  .avatar { width: 150px; height: 150px; }
}

.avatar-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-empty svg {
  width: 36px;
  height: 36px;
  color: var(--c-text-300);
}

@media (min-width: 768px) {
  .avatar-empty svg { width: 56px; height: 56px; }
}

/* ============ 닉네임 ============ */
.username {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.4px;
  line-height: 1.25;
}

@media (min-width: 768px) {
  .username {
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.6px;
  }
}

/* ============ 스탯 행 — 인라인 텍스트, 배경 없음 ============ */
.stats-row {
  display: flex;
  align-items: center;
}

.mobile .stats-row {
  gap: 28px;
  padding: 2px 0;
}

.desktop .stats-row {
  gap: 36px;
  margin-bottom: 18px;
}

.stat {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  background: transparent;
  border: none;
  padding: 0;
  font-family: inherit;
  color: var(--text-primary);
  font-size: 15px;
  letter-spacing: -0.2px;
}

.mobile .stat {
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.stat.stat-btn {
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.stat.stat-btn:hover { opacity: 0.65; }
.stat.stat-btn:active { opacity: 0.5; }

.stat strong {
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.stat span {
  font-weight: 500;
  color: var(--c-text-600);
}

.mobile .stat strong { font-size: 16px; }
.mobile .stat span { font-size: 12px; color: var(--c-text-500); }

/* ============ Tier 정체성 ============ */
.identity-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.mobile .identity-row {
  justify-content: center;
}

.desktop .identity-row {
  margin-bottom: 12px;
}

.tier-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px 3px 6px;
  background: transparent;
  box-shadow: inset 0 0 0 1px var(--border-default);
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1;
}

.tier-chip .tier-name { color: inherit; }
.tier-chip .tier-sep { color: var(--c-text-300); font-weight: 500; }
.tier-chip .tier-level {
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

/* ============ 액션 버튼 ============ */
.action-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 16px;
  background: transparent;
  color: var(--text-primary);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  letter-spacing: -0.2px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease, opacity 0.15s ease;
}

.btn:active:not(:disabled) { opacity: 0.8; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-dark {
  background: var(--c-ink-900);
  color: #ffffff;
}
.btn-dark:hover:not(:disabled) { background: var(--c-ink-700); }

.btn-soft {
  background: var(--bg-mute);
  color: var(--text-primary);
}
.btn-soft:hover:not(:disabled) { background: var(--border-default); }

.btn-icon {
  width: 32px;
  padding: 0;
  color: var(--c-text-600);
}

/* ============ 더보기 메뉴 ============ */
.more-wrap {
  position: relative;
  display: inline-flex;
}

.more-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--bg-elevated);
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px var(--border-default), 0 10px 28px rgba(10, 14, 26, 0.10);
  min-width: 180px;
  padding: 6px;
  z-index: 20;
}

.more-item {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 10px 12px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: inherit;
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  letter-spacing: -0.2px;
  white-space: nowrap;
  transition: background 0.15s ease;
}

.more-item:hover { background: var(--bg-mute); }

.more-item.danger { color: var(--c-danger); }
.more-item.danger:hover { background: var(--c-danger-soft); }

/* ============ EXP — 얇은 인라인 프로그레스 ============ */
.exp-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 320px;
}

.desktop .exp-row {
  margin-bottom: 12px;
  max-width: 360px;
}

.exp-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.mobile .exp-head {
  justify-content: center;
  gap: 6px;
}

.exp-label {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--c-text-400);
  letter-spacing: -0.1px;
}

.exp-value {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.2px;
  font-variant-numeric: tabular-nums;
}

.exp-value em {
  font-style: normal;
  font-weight: 700;
  color: var(--c-text-400);
  font-size: 10.5px;
  margin-left: 3px;
}

.exp-bar {
  width: 100%;
  height: 3px;
  background: var(--bg-mute);
  border-radius: 999px;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  background: var(--c-ink-900);
  border-radius: 999px;
  transition: width 0.4s ease;
}

/* ============ 자기소개 ============ */
.bio {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.55;
  letter-spacing: -0.2px;
  margin: 0;
  word-break: break-word;
}

.mobile .bio { max-width: 360px; }

.desktop .bio {
  margin-bottom: 8px;
  max-width: 560px;
}

/* ============ 메타 ============ */
.meta-info {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-400);
  letter-spacing: -0.1px;
}

.meta-icon { width: 13px; height: 13px; }

/* ============ 스켈레톤 ============ */
.sk {
  background: var(--bg-mute);
  animation: sk-pulse 1.6s ease-in-out infinite;
  border-radius: 6px;
}

.sk-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
}

@media (min-width: 768px) {
  .sk-avatar { width: 150px; height: 150px; flex-shrink: 0; }
}

.mobile .sk-avatar { margin-bottom: 14px; }

.sk-name {
  width: 140px;
  height: 24px;
}

.mobile .sk-name { margin: 0 auto 16px; }

@media (min-width: 768px) {
  .sk-name { width: 200px; height: 30px; margin-bottom: 20px; }
}

.sk-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.mobile .sk-stats { justify-content: center; }

@media (min-width: 768px) {
  .sk-stats { margin-bottom: 20px; }
}

.sk-stat {
  width: 64px;
  height: 28px;
}

@media (min-width: 768px) {
  .sk-stat { width: 80px; height: 22px; }
}

.sk-bio {
  width: 240px;
  height: 16px;
}

.mobile .sk-bio { margin: 0 auto; }

@media (min-width: 768px) {
  .sk-bio { width: 320px; }
}

.sk-info { flex: 1; min-width: 0; padding-top: 4px; }

@keyframes sk-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
