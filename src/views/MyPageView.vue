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
              <!-- Avatar — 카메라 버튼 항시 노출 -->
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
                <label class="avatar-edit" :class="{ uploading: uploadingImage }" :aria-label="uploadingImage ? '업로드 중' : '프로필 사진 변경'">
                  <div v-if="uploadingImage" class="avatar-spinner"></div>
                  <Camera v-else :size="14" />
                  <input type="file" accept="image/*" @change="handleImageChange" :disabled="uploadingImage" />
                </label>
              </div>

              <!-- Info -->
              <div class="profile-info">
                <div class="info-top">
                  <div class="name-block">
                    <!-- 닉네임 인라인 편집 -->
                    <div v-if="editingNickname" class="inline-edit-row">
                      <input
                          v-model="nicknameDraft"
                          type="text"
                          maxlength="20"
                          class="inline-edit-input"
                          ref="nicknameInputRef"
                          @keydown.enter="saveNickname"
                          @keydown.esc="cancelEditNickname"
                      />
                      <div class="inline-edit-actions">
                        <button class="btn-cancel" :disabled="savingNickname" @click="cancelEditNickname">취소</button>
                        <button class="btn-save" :disabled="savingNickname" @click="saveNickname">
                          {{ savingNickname ? '저장 중...' : '저장' }}
                        </button>
                      </div>
                    </div>
                    <div v-else class="name-row">
                      <h3 class="nickname">{{ profile.nickname }}</h3>
                      <button class="icon-edit-btn" @click="startEditNickname" aria-label="닉네임 수정">
                        <Pencil :size="15" :stroke-width="2.2" />
                      </button>
                    </div>
                    <p v-if="displayEmail" class="email">{{ displayEmail }}</p>
                  </div>
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

            <!-- 소개 — 인라인 편집 -->
            <div class="bio-section">
              <div class="bio-header">
                <h4>소개</h4>
                <button v-if="!editingDescription" class="icon-edit-btn" @click="startEditDescription" aria-label="소개 수정">
                  <Pencil :size="15" :stroke-width="2.2" />
                </button>
              </div>
              <div v-if="editingDescription" class="bio-edit">
                <textarea
                    v-model="descriptionDraft"
                    maxlength="100"
                    placeholder="자신을 소개해보세요"
                    class="inline-edit-textarea"
                    ref="descriptionInputRef"
                />
                <div class="bio-edit-footer">
                  <span class="char-count">{{ descriptionDraft?.length || 0 }}/100</span>
                  <div class="bio-edit-actions">
                    <button class="btn-cancel" :disabled="savingDescription" @click="cancelEditDescription">취소</button>
                    <button class="btn-save" :disabled="savingDescription" @click="saveDescription">
                      {{ savingDescription ? '저장 중...' : '저장' }}
                    </button>
                  </div>
                </div>
              </div>
              <template v-else>
                <p v-if="profile.description">{{ profile.description }}</p>
                <p v-else class="empty">소개가 없습니다</p>
              </template>
            </div>

            <div class="meta-section">
              <div class="meta-item">
                <Calendar :size="16" />
                <span>{{ formatDate(profile.createdAt) }} 가입</span>
              </div>
            </div>
          </div>

          <!-- Menu Section -->
          <div class="menu-section">
            <button class="menu-item" @click="goToMyFeeds">
              <div class="menu-left"><MessageSquareText :size="18" /><span>내 피드</span></div>
              <ChevronRight :size="18" />
            </button>
            <button class="menu-item" @click="goToMyProducts">
              <div class="menu-left"><Package :size="18" /><span>내 상품</span></div>
              <ChevronRight :size="18" />
            </button>
            <button class="menu-item" @click="goToAccountSettings">
              <div class="menu-left"><UserCog :size="18" /><span>계정 설정</span></div>
              <ChevronRight :size="18" />
            </button>
            <button class="menu-item" @click="goToAppSettings">
              <div class="menu-left"><Palette :size="18" /><span>환경설정</span></div>
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

    <!-- 저장 완료 미니 토스트 -->
    <Teleport to="body">
      <div class="saved-burst-layer" aria-hidden="true">
        <TransitionGroup name="saved-burst" tag="div" class="saved-burst-stack">
          <div v-for="b in savedBursts" :key="b.id" class="saved-burst">
            <Check :size="14" stroke-width="2.6" class="saved-burst-icon" />
            <span>{{ b.msg }}</span>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Camera, Calendar, Mail, MessageSquareText, Package,
  UserCog, Palette, ChevronRight, LogOut, Pencil, Check
} from 'lucide-vue-next'
import { nextTick } from 'vue'
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
const error = ref(null)
const previewImage = ref(null)
const uploadingImage = ref(false)
const imageKey = ref(Date.now())

// 인라인 필드 편집
const editingNickname = ref(false)
const nicknameDraft = ref('')
const savingNickname = ref(false)
const nicknameInputRef = ref(null)

const editingDescription = ref(false)
const descriptionDraft = ref('')
const savingDescription = ref(false)
const descriptionInputRef = ref(null)

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

// 저장 성공 미니 토스트 (EXP burst 스타일 — 가볍게 떴다가 사라짐)
const savedBursts = ref([])
let burstSeq = 0
const showSavedToast = (msg = '저장되었습니다') => {
  const id = ++burstSeq
  savedBursts.value.push({ id, msg })
  setTimeout(() => {
    savedBursts.value = savedBursts.value.filter(b => b.id !== id)
  }, 1600)
}

// ===== 닉네임 인라인 편집 =====
const startEditNickname = async () => {
  nicknameDraft.value = profile.nickname || ''
  editingNickname.value = true
  await nextTick()
  nicknameInputRef.value?.focus()
  nicknameInputRef.value?.select()
}
const cancelEditNickname = () => {
  editingNickname.value = false
  nicknameDraft.value = ''
}
const saveNickname = async () => {
  const next = nicknameDraft.value?.trim()
  if (!next) {
    await open({ type: 'alert', title: '입력 확인', message: '닉네임을 입력해주세요.' })
    return
  }
  if (next === profile.nickname) {
    cancelEditNickname()
    return
  }
  savingNickname.value = true
  try {
    const res = await userService.updateUser(profile.userId, {
      nickname: next,
      description: profile.description ?? '',
      profileImgInfo: null,
    })
    if (!res.success) throw new Error(res.message || '닉네임 수정 실패')
    profile.nickname = next
    editingNickname.value = false
    showSavedToast()
  } catch (err) {
    console.error('[PROFILE] 닉네임 저장 실패:', err)
    await open({ type: 'alert', title: '오류', message: err.message || '닉네임 저장에 실패했습니다.' })
  } finally {
    savingNickname.value = false
  }
}

// ===== 소개 인라인 편집 =====
const startEditDescription = async () => {
  descriptionDraft.value = profile.description || ''
  editingDescription.value = true
  await nextTick()
  descriptionInputRef.value?.focus()
}
const cancelEditDescription = () => {
  editingDescription.value = false
  descriptionDraft.value = ''
}
const saveDescription = async () => {
  const next = descriptionDraft.value?.trim() ?? ''
  if (next === (profile.description ?? '')) {
    cancelEditDescription()
    return
  }
  savingDescription.value = true
  try {
    const res = await userService.updateUser(profile.userId, {
      nickname: profile.nickname,
      description: next,
      profileImgInfo: null,
    })
    if (!res.success) throw new Error(res.message || '소개 수정 실패')
    profile.description = next
    editingDescription.value = false
    showSavedToast()
  } catch (err) {
    console.error('[PROFILE] 소개 저장 실패:', err)
    await open({ type: 'alert', title: '오류', message: err.message || '소개 저장에 실패했습니다.' })
  } finally {
    savingDescription.value = false
  }
}

const handleImageChange = async (e) => {
  const file = e.target.files[0]
  e.target.value = '' // 같은 파일 재선택 가능하도록
  if (!file) return

  if (file.size > 10 * 1024 * 1024) {
    await open({ type: 'alert', title: '파일 크기 초과', message: '이미지 크기는 10MB 이하여야 합니다.' })
    return
  }
  if (!file.type.startsWith('image/')) {
    await open({ type: 'alert', title: '파일 형식 오류', message: '이미지 파일만 업로드 가능합니다.' })
    return
  }

  // 로컬 미리보기 즉시
  previewImage.value = URL.createObjectURL(file)
  uploadingImage.value = true

  try {
    const uploadResult = await fileService.upload(file, { fileCode: 'PROFILE' })
    if (!uploadResult.success || !uploadResult.data) {
      throw new Error(uploadResult.message || '업로드 실패')
    }

    const profileImgInfo = {
      fileId: uploadResult.data.id,
      storedPath: uploadResult.data.fileUrl,
      originName: uploadResult.data.orgFileNm || file.name,
      fileSize: uploadResult.data.fileSize || file.size,
      contentType: uploadResult.data.contentType || file.type,
      fileExplain: '프로필 이미지',
    }

    // 업로드 직후 바로 프로필 PUT
    const res = await userService.updateUser(profile.userId, {
      nickname: profile.nickname,
      description: profile.description ?? '',
      profileImgInfo,
    })
    if (!res.success) throw new Error(res.message || '프로필 사진 저장 실패')

    // 서버 URL로 교체 + 캐시 무효화
    profile.profilePicture = { fileUrl: uploadResult.data.fileUrl }
    if (previewImage.value?.startsWith('blob:')) URL.revokeObjectURL(previewImage.value)
    previewImage.value = null
    imageKey.value = Date.now()
    showSavedToast('프로필 사진이 변경되었습니다')
  } catch (err) {
    console.error('[PROFILE] 프로필 사진 변경 실패:', err)
    await open({ type: 'alert', title: '오류', message: err.message || '이미지 업로드에 실패했습니다.' })
    // 실패 시 로컬 미리보기 해제
    if (previewImage.value?.startsWith('blob:')) URL.revokeObjectURL(previewImage.value)
    previewImage.value = null
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
const goToMyFeeds = () => router.push({name: 'UserFeedList', params: {userId: profile.userId}})
const goToMyProducts = () => router.push({name: 'MyProducts'})
const goToAccountSettings = () => router.push({ name: 'AccountSettings' })
const goToAppSettings = () => router.push({ name: 'Settings' })

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

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* scoped 안에서 :root 는 [data-v-xxx] 가 붙어 html 과 매칭 실패 →
   변수는 컴포넌트 root 클래스(.app-container)에 정의해서 자식에 상속 */
.app-container {
  --primary: var(--text-primary);
  --secondary: var(--c-text-500);
  --accent: var(--c-brand);
  --bg: var(--bg-base);
  --card: var(--bg-elevated);
  --border: var(--border-strong);
  --hover: var(--bg-subtle);

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
  background: var(--border-default);
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
  width: 28px;
  height: 28px;
  background: var(--accent);
  border: 2px solid var(--card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transition: transform 0.15s ease;
}
.avatar-edit:hover { transform: scale(1.08); }
.avatar-edit.uploading { cursor: progress; }
.avatar-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== 인라인 편집 (닉네임 / 소개) ===== */
.name-block { min-width: 0; }
.name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.icon-edit-btn {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--c-brand-soft);
  color: var(--c-brand);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.18s ease;
  flex-shrink: 0;
  margin-left: 4px;
}
.icon-edit-btn:hover {
  background: var(--c-brand);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(147, 51, 234, 0.25);
}
.icon-edit-btn:active {
  transform: translateY(0);
}

.inline-edit-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.inline-edit-input {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  color: var(--text-primary);
  background: var(--card);
  outline: none;
  transition: border-color 0.15s ease;
}
.inline-edit-input:focus { border-color: var(--c-brand); }

.inline-edit-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.inline-edit-actions .btn-cancel,
.inline-edit-actions .btn-save {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--c-text-600);
  transition: all 0.15s ease;
}
.inline-edit-actions .btn-cancel:hover { background: var(--bg-subtle); }
.inline-edit-actions .btn-save {
  background: var(--c-brand);
  color: #fff;
  border-color: var(--c-brand);
}
.inline-edit-actions .btn-save:hover:not(:disabled) { background: var(--c-brand-hover); }
.inline-edit-actions button:disabled { opacity: 0.5; cursor: not-allowed; }

.bio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 8px;
}
.bio-edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.inline-edit-textarea {
  width: 100%;
  min-height: 72px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--card);
  resize: vertical;
  outline: none;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}
.inline-edit-textarea:focus { border-color: var(--c-brand); }
.bio-edit-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.bio-edit-actions { display: flex; gap: 6px; }
.bio-edit .char-count {
  font-size: 11px;
  color: var(--c-text-400);
}
.bio-edit .btn-cancel,
.bio-edit .btn-save {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--c-text-600);
}
.bio-edit .btn-save {
  background: var(--c-brand);
  color: #fff;
  border-color: var(--c-brand);
}
.bio-edit .btn-save:hover:not(:disabled) { background: var(--c-brand-hover); }
.bio-edit .btn-cancel:hover { background: var(--bg-subtle); }
.bio-edit button:disabled { opacity: 0.5; cursor: not-allowed; }

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

/* 다크 모드: inline tier.bgColor (옅은 라이트 톤) 가 박혀 글자 가독성 떨어짐 → 카드 톤으로 override */
:root[data-theme="dark"] .tier-card {
  background: var(--bg-elevated) !important;
}
:root[data-theme="dark"] .tier-label {
  color: var(--c-brand-hover) !important;
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
  background: var(--bg-elevated);
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
  color: var(--text-primary);
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
  background: var(--bg-elevated);
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exp-bar {
  height: 6px;
  background: var(--border-default);
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
  color: var(--c-text-500);
  font-weight: 600;
  letter-spacing: -0.1px;
}

.exp-text strong {
  color: var(--text-primary);
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
  background: var(--c-brand-soft);
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
  background: var(--border-default);
  border: 1px solid var(--border);
  color: var(--secondary);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--border-strong);
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
  border-bottom: 1px solid var(--border-default);
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
  background: var(--c-danger-soft);
  border-color: var(--c-danger-soft);
  color: var(--c-danger);
}

.btn-logout svg {
  color: currentColor;
}

/* ===== 저장 미니 토스트 (EXP burst 스타일) ===== */
.saved-burst-layer {
  position: fixed;
  left: 50%;
  bottom: 32%;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 9999;
}
.saved-burst-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.saved-burst {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background: #FFFFFF;
  border: 1.5px solid #9333EA;
  border-radius: 100px;
  box-shadow: 0 10px 28px rgba(147, 51, 234, 0.18), 0 4px 8px rgba(15, 23, 42, 0.06);
  color: #0A0E1A;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: -0.2px;
}
.saved-burst-icon { color: #9333EA; }

.saved-burst-enter-active {
  transition: transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.3s ease-out;
}
.saved-burst-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 1, 1), opacity 0.4s ease-in;
}
.saved-burst-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.92);
}
.saved-burst-enter-to {
  opacity: 1;
  transform: translateY(-20px) scale(1);
}
.saved-burst-leave-from {
  opacity: 1;
  transform: translateY(-20px);
}
.saved-burst-leave-to {
  opacity: 0;
  transform: translateY(-40px);
}

</style>