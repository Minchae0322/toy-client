<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <div class="content-inner">
        <div class="content-header">
          <h2 class="page-title">마이페이지</h2>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>프로필을 불러오는 중...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button class="btn-retry" @click="loadProfile">다시 시도</button>
        </div>

        <template v-else>
          <!-- Profile Card -->
          <div class="profile-card">
            <div class="profile-header">
              <!-- Avatar -->
              <div class="avatar-wrapper">
                <div class="avatar">
                  <img
                      v-if="displayImageUrl"
                      :src="displayImageUrl"
                      :key="imageKey"
                      alt="프로필"
                      @error="handleImageError"
                  />
                  <span v-else class="avatar-initial">{{ profile.nickname?.charAt(0) || '?' }}</span>
                </div>
                <label v-if="isEditing" class="avatar-edit">
                  <Camera :size="14" />
                  <input type="file" accept="image/*" @change="handleImageChange" />
                </label>
              </div>

              <!-- Info -->
              <div class="profile-info">
                <div class="info-top">
                  <div>
                    <h3 class="nickname">{{ profile.nickname }}</h3>
                    <p v-if="displayEmail" class="email">{{ displayEmail }}</p>
                  </div>
                  <button v-if="!isEditing" class="btn-edit" @click="startEditing">
                    프로필 편집
                  </button>
                </div>

                <div class="follow-stats">
                  <span class="stat-item" @click="showFollowers">
                    <strong>{{ formatFollowCount(profile.followerCount) }}</strong> 팔로워
                  </span>
                  <span class="stat-item" @click="showFollowings">
                    <strong>{{ formatFollowCount(profile.followingCount) }}</strong> 팔로잉
                  </span>
                </div>
              </div>
            </div>

            <!-- Tier Identity Card -->
            <div v-if="tierArt" class="tier-card" :style="{ background: tier.bgColor }">
              <div class="tier-card-deco">
                <YogurtTierArt :tier="tierArt" :color="tierColor" :size="120" />
              </div>
              <div class="tier-card-body">
                <div class="tier-identity">
                  <div class="tier-art-wrap">
                    <YogurtTierArt :tier="tierArt" :color="tierColor" :size="48" />
                  </div>
                  <div class="tier-identity-text">
                    <span class="tier-label" :style="{ color: tier.color }">{{ tierName }}</span>
                    <span class="tier-level">Lv.{{ userLevel }}</span>
                  </div>
                </div>
                <div class="tier-tags-row">
                  <UserLevelTag :level="userLevel" size="sm" variant="dark" />
                  <UserBadgeInline v-if="primaryBadgeId" :badge-id="primaryBadgeId" size="sm" />
                </div>
                <div class="tier-exp">
                  <div class="exp-bar">
                    <div class="exp-fill" :style="{ width: expProgress + '%', background: tier.color }"></div>
                  </div>
                  <span v-if="expToNext != null" class="exp-text">
                    다음 레벨까지 <strong>{{ expToNext.toLocaleString() }} EXP</strong>
                  </span>
                  <span v-else class="exp-text">최고 레벨 달성</span>
                </div>
              </div>
            </div>

            <!-- Edit Mode -->
            <div v-if="isEditing" class="edit-form">
              <div class="form-group">
                <label>닉네임</label>
                <input v-model="editForm.nickname" type="text" maxlength="20" />
                <span class="char-count">{{ editForm.nickname?.length || 0 }}/20</span>
              </div>

              <div class="form-group">
                <label>소개</label>
                <textarea
                    v-model="editForm.description"
                    maxlength="100"
                    placeholder="자신을 소개해보세요"
                />
                <span class="char-count">{{ editForm.description?.length || 0 }}/100</span>
              </div>

              <div class="edit-actions">
                <button class="btn-cancel" @click="cancelEditing" :disabled="saving">취소</button>
                <button class="btn-save" @click="saveProfile" :disabled="saving">
                  {{ saving ? '저장 중...' : '저장' }}
                </button>
              </div>
            </div>

            <!-- View Mode -->
            <template v-else>
              <div class="bio-section">
                <h4>소개</h4>
                <p v-if="profile.description">{{ profile.description }}</p>
                <p v-else class="empty">소개가 없습니다</p>
              </div>

              <div class="meta-section">
                <div class="meta-item">
                  <Calendar :size="16" />
                  <span>{{ formatDate(profile.createdAt) }} 가입</span>
                </div>
              </div>
            </template>
          </div>

          <!-- Menu Section -->
          <div class="menu-section">
            <button class="menu-item" @click="goToProfile">
              <div class="menu-left">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                </svg>
                <span>프로필</span>
              </div>
              <ChevronRight :size="18" />
            </button>
            <button class="menu-item" @click="goToMyFeeds">
              <div class="menu-left"><FileText :size="18" /><span>내 피드</span></div>
              <ChevronRight :size="18" />
            </button>
            <button class="menu-item" @click="goToMyProducts">
              <div class="menu-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                <span>내 상품</span>
              </div>
              <ChevronRight :size="18" />
            </button>
            <button class="menu-item" @click="goToSavedPosts">
              <div class="menu-left"><Bookmark :size="18" /><span>저장한 글</span></div>
              <ChevronRight :size="18" />
            </button>
            <button class="menu-item" @click="goToNotificationSettings">
              <div class="menu-left"><Bell :size="18" /><span>알림 설정</span></div>
              <ChevronRight :size="18" />
            </button>
            <button class="menu-item" @click="goToAccountSettings">
              <div class="menu-left"><Settings :size="18" /><span>계정 설정</span></div>
              <ChevronRight :size="18" />
            </button>
          </div>

          <!-- Logout -->
          <button class="btn-logout" @click="handleLogout">
            <LogOut :size="18" /><span>로그아웃</span>
          </button>
        </template>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Camera, Calendar, Mail, FileText, Bookmark,
  Bell, Settings, ChevronRight, LogOut
} from 'lucide-vue-next'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useUser, userUtils } from '@/services/UserService.js'
import { useFile } from '@/services/FileService.js'
import { getUserInfo, logout as authLogout } from '@/utils/auth.js'
import { rewardsService } from '@/services/RewardsService.js'
import { getTierByLevel, getTierColor, getNextLevelExp, getLevelProgress } from '@/data/levelSystemData.js'
import YogurtTierArt from '@/components/identity/YogurtTierArt.vue'
import UserLevelTag from '@/components/identity/UserLevelTag.vue'
import UserBadgeInline from '@/components/identity/UserBadgeInline.vue'

const router = useRouter()
const userService = useUser()
const fileService = useFile()
const { open } = useConfirmDialog()

// ==================== State ====================
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const isEditing = ref(false)
const previewImage = ref(null)
const selectedFile = ref(null)
const uploadedProfileImgInfo = ref(null) // 업로드 완료된 정보
const uploadingImage = ref(false)
const imageKey = ref(Date.now())

const profile = reactive({
  userId: null,
  nickname: '',
  email: null,
  description: '',
  followerCount: 0,
  followingCount: 0,
  profilePicture: null,
  createdAt: null,
  updatedAt: null
})

const editForm = reactive({
  nickname: '',
  description: ''
})

// ==================== 보상 데이터 (레벨/뱃지) ====================
// 백엔드 응답 규약:
//  - currentLevelExp: 현재 레벨 구간에서 쌓은 EXP
//  - nextLevelExp: 다음 레벨까지 "남은" EXP (threshold가 아님)
//  - maxLevel: 최고 레벨 여부
const userLevel = ref(null)
const userBadges = ref([])
const currentLevelExp = ref(0)
const nextLevelExp = ref(null)
const maxLevel = ref(false)
const tier = computed(() => userLevel.value != null ? getTierByLevel(userLevel.value) : null)
const tierArt = computed(() => tier.value?.art ?? null)
const tierColor = computed(() => userLevel.value != null ? getTierColor(userLevel.value) : 'white')
const tierName = computed(() => tier.value?.name ?? '')

const expToNext = computed(() => {
  if (userLevel.value == null || maxLevel.value) return null
  const v = Number(nextLevelExp.value)
  if (Number.isFinite(v) && v >= 0) return v
  const localNext = getNextLevelExp(userLevel.value)
  if (!localNext) return null
  return Math.max(localNext - currentLevelExp.value, 0)
})
const expProgress = computed(() => {
  if (userLevel.value == null) return 0
  if (maxLevel.value) return 100
  const v = Number(nextLevelExp.value)
  if (Number.isFinite(v) && v >= 0) {
    const threshold = currentLevelExp.value + v
    if (!threshold) return 100
    return Math.min(Math.round((currentLevelExp.value / threshold) * 100), 100)
  }
  return getLevelProgress(userLevel.value, currentLevelExp.value)
})
const primaryBadgeId = computed(() => {
  const pinned = userBadges.value.find(b => b.pinned)
  return pinned?.badgeId || pinned?.id || userBadges.value[0]?.badgeId || userBadges.value[0]?.id || null
})

async function loadRewards() {
  try {
    const [rewardsRes, badgesRes] = await Promise.all([
      rewardsService.getMyRewards(),
      rewardsService.getMyBadges(),
    ])
    const r = rewardsRes?.data
    if (r) {
      userLevel.value = r.level ?? null
      currentLevelExp.value = r.currentLevelExp ?? 0
      nextLevelExp.value = r.nextLevelExp ?? null
      maxLevel.value = r.maxLevel === true
    }
    userBadges.value = Array.isArray(badgesRes?.data) ? badgesRes.data : []
  } catch (e) {
    console.warn('[MyPage] 보상 데이터 로딩 실패:', e)
  }
}

// ==================== Computed ====================
const currentUser = computed(() => getUserInfo())

const displayEmail = computed(() => profile.email || '')

// ✅ 수정된 부분: profile.profilePicture?.fileUrl 직접 접근
const profileImageUrl = computed(() => {
  const url = profile.profilePicture?.fileUrl
  if (url) {
    return `${url}?t=${imageKey.value}`
  }
  return null
})

const displayImageUrl = computed(() => {
  if (previewImage.value) {
    return previewImage.value
  }
  return profileImageUrl.value
})

// ==================== Methods ====================
const loadProfile = async () => {
  const userId = currentUser.value?.id

  if (!userId) {
    router.push({ name: 'Login', query: { redirect: '/mypage' } })
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await userService.getUserProfile(userId)

    if (response.success && response.data) {
      Object.assign(profile, response.data)
      imageKey.value = Date.now()
      console.log('[PROFILE] 프로필 로드 완료:', profile)
      console.log('[PROFILE] email:', profile.email)
    } else {
      throw new Error(response.message || '프로필을 불러올 수 없습니다.')
    }
  } catch (err) {
    console.error('[PROFILE] 프로필 로드 실패:', err)
    error.value = err.message || '프로필을 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

const startEditing = () => {
  editForm.nickname = profile.nickname
  editForm.description = profile.description || ''
  previewImage.value = null
  selectedFile.value = null
  isEditing.value = true
}

const cancelEditing = () => {
  editForm.nickname = profile.nickname
  editForm.description = profile.description || ''
  previewImage.value = null
  selectedFile.value = null
  uploadedProfileImgInfo.value = null
  isEditing.value = false
}

const saveProfile = async () => {
  if (!editForm.nickname?.trim()) {
    await open({ type: 'alert', title: '입력 확인', message: '닉네임을 입력해주세요.' })
    return
  }

  // 이미지 업로드 중이면 대기
  if (uploadingImage.value) {
    await open({ type: 'alert', title: '업로드 중', message: '이미지 업로드가 진행 중입니다. 잠시 후 다시 시도해주세요.' })
    return
  }

  saving.value = true

  try {
    let profileImgInfo = null

    // 1. 이미 업로드된 정보 사용 또는 재업로드
    if (uploadedProfileImgInfo.value) {
      // 이미 업로드 완료된 경우
      profileImgInfo = uploadedProfileImgInfo.value
      console.log('[PROFILE] 이미 업로드된 이미지 사용:', profileImgInfo)
    } else if (selectedFile.value) {
      // 업로드 실패 후 재시도
      console.log('[PROFILE] 프로필 이미지 재업로드 시작...')

      const uploadResult = await fileService.upload(selectedFile.value, {
        fileCode: 'PROFILE'
      })

      if (!uploadResult.success || !uploadResult.data) {
        const errorMsg = uploadResult.message || '이미지 업로드에 실패했습니다.'
        console.error('[PROFILE] 이미지 업로드 실패:', errorMsg)
        await open({ type: 'alert', title: '오류', message: errorMsg })
        return
      }

      profileImgInfo = {
        fileId: uploadResult.data.id,
        storedPath: uploadResult.data.fileUrl,
        originName: uploadResult.data.orgFileNm,
        fileSize: uploadResult.data.fileSize,
        contentType: uploadResult.data.contentType || uploadResult.data.fileExt,
        fileExplain: '프로필 이미지'
      }
      console.log('[PROFILE] 프로필 이미지 업로드 완료:', profileImgInfo)
    }

    // 2. 프로필 업데이트
    const updateDto = {
      nickname: editForm.nickname,
      description: editForm.description,
      profileImgInfo
    }

    console.log('[PROFILE] 프로필 업데이트 요청:', updateDto)

    const response = await userService.updateUser(profile.userId, updateDto)

    if (!response.success) {
      throw new Error(response.message || '프로필 수정에 실패했습니다.')
    }

    // 3. 성공 시 페이지 새로고침
    console.log('[PROFILE] 프로필 저장 완료')
    window.location.reload()

  } catch (err) {
    console.error('[PROFILE] 프로필 저장 실패:', err)
    await open({ type: 'alert', title: '오류', message: err.message || '프로필 저장에 실패했습니다.' })
  } finally {
    saving.value = false
  }
}

const handleImageChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 10 * 1024 * 1024) {
    await open({ type: 'alert', title: '파일 크기 초과', message: '이미지 크기는 10MB 이하여야 합니다.' })
    return
  }
  if (!file.type.startsWith('image/')) {
    await open({ type: 'alert', title: '파일 형식 오류', message: '이미지 파일만 업로드 가능합니다.' })
    return
  }

  // 로컬 미리보기 먼저 설정
  selectedFile.value = file
  previewImage.value = URL.createObjectURL(file)
  uploadedProfileImgInfo.value = null

  // Presigned URL로 바로 업로드
  uploadingImage.value = true
  try {
    console.log('[PROFILE] 프로필 이미지 업로드 시작...')
    const uploadResult = await fileService.upload(file, { fileCode: 'PROFILE' })

    if (uploadResult.success && uploadResult.data) {
      const serverUrl = uploadResult.data.fileUrl || uploadResult.data.storedPath
      // 서버 URL로 미리보기 교체
      if (previewImage.value && previewImage.value.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage.value)
      }
      previewImage.value = serverUrl

      uploadedProfileImgInfo.value = {
        fileId: uploadResult.data.id,
        storedPath: uploadResult.data.fileUrl,
        originName: uploadResult.data.orgFileNm || file.name,
        fileSize: uploadResult.data.fileSize || file.size,
        contentType: uploadResult.data.contentType || file.type,
        fileExplain: '프로필 이미지'
      }
      console.log('[PROFILE] 프로필 이미지 업로드 완료:', uploadedProfileImgInfo.value)
    } else {
      throw new Error(uploadResult.error || '업로드 실패')
    }
  } catch (err) {
    console.error('[PROFILE] 프로필 이미지 업로드 실패:', err)
    await open({ type: 'alert', title: '오류', message: '이미지 업로드에 실패했습니다. 다시 시도해주세요.' })
    // 실패해도 로컬 미리보기는 유지, 저장 시 재업로드 시도
  } finally {
    uploadingImage.value = false
  }
}

const handleImageError = (e) => {
  console.warn('[PROFILE] 이미지 로드 실패:', e.target.src)
  e.target.style.display = 'none'
}

const showFollowers = () => console.log('팔로워 목록')
const showFollowings = () => console.log('팔로잉 목록')
const goToProfile = () => router.push({name: 'UserFeedList', params: {userId: profile.userId}})
const goToMyFeeds = () => router.push({name: 'UserFeedList', params: {userId: profile.userId}})
const goToMyProducts = () => router.push({name: 'MyProducts'})
const showComingSoon = () => open({ type: 'alert', title: '준비중입니다', message: '해당 기능은 현재 준비중입니다.' })
const goToSavedPosts = () => showComingSoon()
const goToNotificationSettings = () => router.push({ name: 'NotificationSettings' })
const goToAccountSettings = () => router.push({ name: 'AccountSettings' })

const handleLogout = async () => {
  const confirmed = await open({ type: 'confirm', title: '로그아웃', message: '로그아웃 하시겠습니까?' })
  if (confirmed) {
    authLogout()
    router.push('/login')
  }
}

// ==================== Utils ====================
const formatFollowCount = (count) => userUtils.formatFollowCount(count)
const formatDate = (dateString) => userUtils.formatDate(dateString)

// ==================== Lifecycle ====================
onMounted(() => {
  loadProfile()
  loadRewards()
})
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --primary: #222222;
  --secondary: #64748B;
  --accent: #9333ea;
  --bg: #FFFFFF;
  --card: #FFFFFF;
  --border: #E2E8F0;
  --hover: #F8FAFC;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

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

@media (min-width: 768px) {
  .app-container {
    padding: 0 2rem;
  }
}

@media (min-width: 1280px) {
  .app-container {
    padding: 0 3rem;
    max-width: 1920px;
    margin-left: auto;
    margin-right: auto;
  }
}

@media (min-width: 1920px) {
  .app-container {
    padding: 0 4rem;
  }
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  /* BottomNavigation + iOS 홈 인디케이터 */
  padding-bottom: calc(5rem + env(safe-area-inset-bottom));
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 2.5rem;
  }
}

.content-inner {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (min-width: 768px) {
  .content-inner {
    padding: 0;
  }
}

.content-header {
  padding: 24px 0 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

/* Loading & Error */
.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--secondary);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-retry {
  margin-top: 16px;
  padding: 10px 24px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

/* Profile Card */
.profile-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
}

.profile-header {
  display: flex;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid var(--accent);
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initial {
  font-size: 26px;
  font-weight: 600;
  color: var(--accent);
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 26px;
  height: 26px;
  background: var(--accent);
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
}

.avatar-edit input {
  display: none;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.info-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.nickname {
  font-size: 17px;
  font-weight: 600;
  color: var(--primary);
}

.email {
  font-size: 13px;
  color: var(--secondary);
  margin-top: 2px;
}

/* Tier Identity Card */
.tier-card {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  margin-top: -1px;
  border: 1px solid var(--border);
}

.tier-card-deco {
  position: absolute;
  top: -16px;
  right: -16px;
  opacity: 0.07;
  pointer-events: none;
}

.tier-card-body {
  position: relative;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tier-identity {
  display: flex;
  align-items: center;
  gap: 14px;
}

.tier-art-wrap {
  width: 52px;
  height: 52px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.08);
}

.tier-identity-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tier-label {
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  line-height: 1;
}

.tier-level {
  font-size: 24px;
  font-weight: 900;
  color: #0A0E1A;
  letter-spacing: -0.8px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.tier-tags-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tier-exp {
  background: white;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exp-bar {
  height: 6px;
  background: #F1F3F6;
  border-radius: 3px;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.exp-text {
  font-size: 12px;
  color: #64748B;
  font-weight: 600;
  letter-spacing: -0.1px;
}

.exp-text strong {
  color: #0A0E1A;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.btn-edit {
  padding: 6px 16px;
  border: 1px solid var(--accent);
  border-radius: 8px;
  background: transparent;
  color: var(--accent);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-edit:hover {
  background: #faf5ff;
}

.follow-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--secondary);
}

.stat-item {
  cursor: pointer;
  transition: color 0.15s;
}

.stat-item:hover {
  color: var(--accent);
}

.follow-stats strong {
  color: var(--primary);
  font-weight: 600;
}

/* Edit Form */
.edit-form {
  padding-top: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--primary);
  margin-bottom: 6px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  color: var(--primary);
  background: var(--bg);
  transition: border-color 0.15s;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.form-group textarea {
  resize: none;
  height: 90px;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 11px;
  color: var(--secondary);
  margin-top: 4px;
}

.edit-actions {
  display: flex;
  gap: 10px;
  padding-top: 4px;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.btn-cancel {
  background: #f3f4f6;
  border: 1px solid var(--border);
  color: var(--secondary);
}

.btn-cancel:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-save {
  background: var(--accent);
  border: none;
  color: white;
}

.btn-save:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-cancel:disabled,
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Bio Section */
.bio-section {
  padding: 20px 0;
  border-bottom: 1px solid var(--border);
}

.bio-section h4 {
  font-size: 12px;
  font-weight: 500;
  color: var(--secondary);
  margin-bottom: 6px;
}

.bio-section p {
  font-size: 14px;
  color: var(--primary);
  line-height: 1.6;
}

.bio-section p.empty {
  color: var(--secondary);
}

/* Meta Section */
.meta-section {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--secondary);
}

.meta-item svg {
  color: var(--secondary);
  opacity: 0.7;
}

/* Menu Section */
.menu-section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: var(--primary);
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: var(--hover);
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-left svg {
  color: var(--secondary);
}

.menu-item > svg {
  color: var(--secondary);
  opacity: 0.5;
}

/* Logout */
.btn-logout {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.btn-logout:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.btn-logout svg {
  color: currentColor;
}

</style>