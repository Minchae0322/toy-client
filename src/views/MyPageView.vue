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
                    <p class="user-id">@user_{{ profile.userId }}</p>
                  </div>
                  <button v-if="!isEditing" class="btn-edit" @click="startEditing">
                    편집
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
                <div v-if="profile.email" class="meta-item">
                  <Mail :size="16" />
                  <span>{{ profile.email }}</span>
                </div>
                <div class="meta-item">
                  <Calendar :size="16" />
                  <span>{{ formatDate(profile.createdAt) }} 가입</span>
                </div>
              </div>
            </template>
          </div>

          <!-- Menu Section -->
          <div class="menu-section">
            <button class="menu-item" @click="goToMyFeeds">
              <div class="menu-left"><FileText :size="18" /><span>내 피드</span></div>
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
    <nav class="bottom-nav">
      <button class="bottom-nav-item" @click="$router.push('/feed')">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
        <span>홈</span>
      </button>
      <button class="bottom-nav-item" @click="$router.push('/battle')">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/>
        </svg>
        <span>배틀</span>
      </button>
      <button class="bottom-nav-fab" @click="$router.push('/feed/create')">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
      </button>
      <button class="bottom-nav-item" @click="$router.push('/chat')">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
        </svg>
        <span>메시지</span>
        <span class="nav-badge">3</span>
      </button>
      <button class="bottom-nav-item active">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
        </svg>
        <span>MY</span>
      </button>
    </nav>
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
import { useUser, userUtils } from '@/services/UserService.js'
import { useFile } from '@/services/FileService.js'
import { getUserInfo, logout as authLogout } from '@/utils/auth.js'

const router = useRouter()
const userService = useUser()
const fileService = useFile()

// ==================== State ====================
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const isEditing = ref(false)
const previewImage = ref(null)
const selectedFile = ref(null)
const imageKey = ref(Date.now())

const profile = reactive({
  userId: null,
  nickname: '',
  email: '',
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

// ==================== Computed ====================
const currentUser = computed(() => getUserInfo())

const profileImageUrl = computed(() => {
  const url = userUtils.getProfileImageUrl(profile.profilePicture)
  if (url && !url.includes('default-profile')) {
    return `${url}?t=${imageKey.value}`
  }
  return url
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
  isEditing.value = false
}

const saveProfile = async () => {
  if (!editForm.nickname?.trim()) {
    alert('닉네임을 입력해주세요.')
    return
  }

  saving.value = true

  try {
    let profileImgInfo = null
    let uploadedImageUrl = null

    // 1. 파일 업로드 처리 (실패 시 early return)
    if (selectedFile.value) {
      console.log('[PROFILE] 프로필 이미지 업로드 시작...')

      const uploadResult = await fileService.upload(selectedFile.value, {
        fileCode: 'FEED'
      })

      // ✅ 업로드 실패 시 즉시 중단 - 프로필 업데이트 진행 안 함
      if (!uploadResult.success || !uploadResult.data) {
        const errorMsg = uploadResult.message || '이미지 업로드에 실패했습니다.'
        console.error('[PROFILE] 이미지 업로드 실패:', errorMsg)
        alert(errorMsg)
        return
      }

      profileImgInfo = {
        fileId: uploadResult.data.attchFileId,
        storedPath: uploadResult.data.fileUrl,
        originName: uploadResult.data.orgFileNm,
        fileSize: uploadResult.data.fileSize,
        contentType: uploadResult.data.contentType || uploadResult.data.fileExt,
        fileExplain: '프로필 이미지'
      }
      uploadedImageUrl = uploadResult.data.fileUrl
      console.log('[PROFILE] 프로필 이미지 업로드 완료:', profileImgInfo)
    }

    // 2. 프로필 업데이트 (파일 업로드 성공 후에만 도달)
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

    // 3. 성공 시 상태 갱신
    if (response.data) {
      Object.assign(profile, response.data)
      previewImage.value = null
      imageKey.value = Date.now()
    } else {
      profile.nickname = editForm.nickname
      profile.description = editForm.description

      if (profileImgInfo) {
        profile.profilePicture = profileImgInfo
        previewImage.value = uploadedImageUrl
      }
    }

    selectedFile.value = null
    isEditing.value = false
    console.log('[PROFILE] 프로필 저장 완료')

  } catch (err) {
    console.error('[PROFILE] 프로필 저장 실패:', err)
    alert(err.message || '프로필 저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

const handleImageChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다.')
      return
    }
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }
    selectedFile.value = file
    previewImage.value = URL.createObjectURL(file)
  }
}

const handleImageError = (e) => {
  console.warn('[PROFILE] 이미지 로드 실패:', e.target.src)
  e.target.style.display = 'none'
}

const showFollowers = () => console.log('팔로워 목록')
const showFollowings = () => console.log('팔로잉 목록')
const goToMyFeeds = () => router.push({ name: 'UserFeedList', params: { userId: profile.userId } })
const goToSavedPosts = () => console.log('저장한 글')
const goToNotificationSettings = () => console.log('알림 설정')
const goToAccountSettings = () => console.log('계정 설정')

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
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
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  display: flex;
  max-width: 100vw;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .app-container { padding: 0 2rem; }
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
  .app-container { padding: 0 4rem; }
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  padding-bottom: 5rem;
}

@media (min-width: 768px) {
  .main-content { padding-bottom: 2.5rem; }
}

.content-inner {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (min-width: 768px) {
  .content-inner { padding: 0; }
}

.content-header { padding: 24px 0 20px; }

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

@keyframes spin { to { transform: rotate(360deg); } }

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

.avatar-edit input { display: none; }

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

.user-id {
  font-size: 13px;
  color: var(--secondary);
  margin-top: 2px;
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

.btn-edit:hover { background: #faf5ff; }

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

.stat-item:hover { color: var(--accent); }

.follow-stats strong {
  color: var(--primary);
  font-weight: 600;
}

/* Edit Form */
.edit-form { padding-top: 20px; }

.form-group { margin-bottom: 16px; }

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

.btn-cancel:hover:not(:disabled) { background: #e5e7eb; }

.btn-save {
  background: var(--accent);
  border: none;
  color: white;
}

.btn-save:hover:not(:disabled) { opacity: 0.9; }

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

.bio-section p.empty { color: var(--secondary); }

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

.menu-item:last-child { border-bottom: none; }

.menu-item:hover { background: var(--hover); }

.menu-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-left svg { color: var(--secondary); }

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

.btn-logout svg { color: currentColor; }

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card);
  border-top: 1px solid var(--border);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0.5rem 0;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

@media (min-width: 1024px) {
  .bottom-nav { display: none; }
}

.bottom-nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  min-width: 3.5rem;
}

.bottom-nav-item.active { color: var(--primary); }

.bottom-nav-item .icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.bottom-nav-item span:not(.nav-badge) {
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
}

.nav-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.5rem;
  min-width: 1.125rem;
  height: 1.125rem;
  padding: 0 0.3125rem;
  background: #DC2626;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 0.5625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bottom-nav-fab {
  width: 3.5rem;
  height: 3.5rem;
  background: #F97316;
  color: white;
  border: none;
  border-radius: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 0.5rem 1.25rem rgba(249, 115, 22, 0.4);
  margin-top: -1.75rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.bottom-nav-fab:active { transform: scale(0.95); }

.bottom-nav-fab .icon {
  width: 1.75rem;
  height: 1.75rem;
  stroke-width: 2.5;
  flex-shrink: 0;
}
</style>