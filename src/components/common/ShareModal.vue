<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="share-overlay" @click.self="close">
        <div class="share-modal">
          <div class="share-header">
            <h3 class="share-title">공유하기</h3>
            <button class="btn-close" @click="close">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="share-content">
            <!-- 미리보기 카드 -->
            <div v-if="title || image" class="share-preview">
              <img v-if="image" :src="image" :alt="title" class="preview-image" />
              <div class="preview-info">
                <p class="preview-title">{{ title || '공유하기' }}</p>
                <p v-if="description" class="preview-description">{{ description }}</p>
              </div>
            </div>

            <!-- 공유 버튼들 -->
            <div class="share-buttons">
              <button class="share-btn" @click="shareKakao">
                <div class="share-icon kakao">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.742 1.822 5.136 4.544 6.489-.2.744-.724 2.7-.83 3.117-.13.527.195.52.41.378.168-.111 2.678-1.823 3.762-2.564.688.103 1.395.157 2.114.157 5.523 0 10-3.463 10-7.691C22 6.463 17.523 3 12 3z"/>
                  </svg>
                </div>
                <span>카카오톡</span>
              </button>

              <button class="share-btn" @click="shareTwitter">
                <div class="share-icon twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span>X (Twitter)</span>
              </button>

              <button class="share-btn" @click="shareFacebook">
                <div class="share-icon facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span>Facebook</span>
              </button>

              <button class="share-btn" @click="shareNative" v-if="canNativeShare">
                <div class="share-icon native">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                  </svg>
                </div>
                <span>더보기</span>
              </button>
            </div>

            <!-- 링크 복사 -->
            <div class="copy-link-section">
              <div class="link-input-wrapper">
                <input
                    type="text"
                    :value="shareUrl"
                    readonly
                    class="link-input"
                    ref="linkInput"
                />
                <button class="btn-copy" @click="copyLink">
                  <svg v-if="!copied" class="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  <svg v-else class="copy-icon copied" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ copied ? '복사됨' : '복사' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  url: { type: String, default: '' },
  image: { type: String, default: '' }
})

const emit = defineEmits(['close', 'copied'])

const copied = ref(false)
const linkInput = ref(null)

const shareUrl = computed(() => props.url || window.location.href)
const canNativeShare = computed(() => !!navigator.share)

const close = () => {
  emit('close')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    emit('copied')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    // Fallback for older browsers
    if (linkInput.value) {
      linkInput.value.select()
      document.execCommand('copy')
      copied.value = true
      emit('copied')
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }
  }
}

const shareKakao = () => {
  // 카카오톡 공유 (Kakao SDK가 있는 경우)
  if (window.Kakao && window.Kakao.isInitialized()) {
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: props.title || '공유하기',
        description: props.description || '',
        imageUrl: props.image || '',
        link: {
          mobileWebUrl: shareUrl.value,
          webUrl: shareUrl.value
        }
      }
    })
  } else {
    // Kakao SDK가 없는 경우 카카오톡 공유 URL scheme 사용
    const kakaoTalkUrl = `https://sharer.kakao.com/talk/friends/picker/link?app_key=YOUR_APP_KEY&validation_action=default&validation_params=${encodeURIComponent(JSON.stringify({
      title: props.title || '공유하기',
      description: props.description || '',
      imageUrl: props.image || '',
      link: { webUrl: shareUrl.value, mobileWebUrl: shareUrl.value }
    }))}`

    // 카카오톡 앱 딥링크 시도 (모바일)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) {
      // 모바일에서는 카카오톡 앱으로 공유 시도
      const text = `${props.title || ''}\n${props.description || ''}\n${shareUrl.value}`
      window.location.href = `kakaotalk://msg/text/send?text=${encodeURIComponent(text)}`
    } else {
      // 데스크탑에서는 링크 복사 안내
      copyLink()
      alert('링크가 복사되었습니다. 카카오톡에서 붙여넣기 해주세요.')
    }
  }
  close()
}

const shareTwitter = () => {
  const text = props.title ? `${props.title} - ${props.description || ''}` : props.description || ''
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl.value)}`
  window.open(twitterUrl, '_blank', 'width=600,height=400')
  close()
}

const shareFacebook = () => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`
  window.open(facebookUrl, '_blank', 'width=600,height=400')
  close()
}

const shareNative = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.title || '공유하기',
        text: props.description || '',
        url: shareUrl.value
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err)
      }
    }
  }
  close()
}
</script>

<style scoped>
.share-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

@media (min-width: 640px) {
  .share-overlay {
    align-items: center;
  }
}

.share-modal {
  background: white;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

@media (min-width: 640px) {
  .share-modal {
    border-radius: 20px;
  }
}

.share-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.share-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.btn-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #e2e8f0;
}

.btn-close .icon {
  width: 20px;
  height: 20px;
  color: #64748b;
}

.share-content {
  padding: 20px;
}

.share-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 20px;
}

.preview-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-description {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.share-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}

.share-btn:hover {
  background: #f1f5f9;
}

.share-btn span {
  font-size: 11px;
  font-weight: 500;
  color: #475569;
}

.share-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-icon svg {
  width: 24px;
  height: 24px;
}

.share-icon.kakao {
  background: #fee500;
  color: #391b1b;
}

.share-icon.twitter {
  background: #0f172a;
  color: white;
}

.share-icon.facebook {
  background: #1877f2;
  color: white;
}

.share-icon.native {
  background: #e2e8f0;
  color: #475569;
}

.copy-link-section {
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.link-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 4px 4px 16px;
  background: #f1f5f9;
  border-radius: 12px;
}

.link-input {
  flex: 1;
  min-width: 0;
  padding: 8px 0;
  background: transparent;
  border: none;
  font-size: 13px;
  color: #475569;
  outline: none;
  font-family: inherit;
}

.btn-copy {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  font-family: inherit;
}

.btn-copy:hover {
  background: #1e293b;
}

.copy-icon {
  width: 16px;
  height: 16px;
}

.copy-icon.copied {
  color: #22c55e;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .share-modal,
.modal-leave-active .share-modal {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .share-modal {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from .share-modal {
    transform: translateY(20px) scale(0.95);
  }
}

.modal-leave-to .share-modal {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-leave-to .share-modal {
    transform: translateY(20px) scale(0.95);
  }
}
</style>
