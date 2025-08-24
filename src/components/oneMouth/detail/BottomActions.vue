<!-- BottomActions.vue 컴포넌트 수정 -->
<template>
  <div class="bottom-actions">
    <div class="actions-container">
      <!-- 관심 추가 버튼 -->
      <button
          @click="toggleFavorite"
          :class="['action-btn', 'favorite-btn', { 'active': isFavorited }]"
          :disabled="processing"
      >
        <Heart :size="20" :fill="isFavorited ? 'currentColor' : 'none'" />
        <span>{{ isFavorited ? '관심취소' : '관심추가' }}</span>
      </button>

      <!-- 나눔 요청 버튼 -->
      <button
          @click="handleRequestShare"
          class="action-btn share-btn"
          :disabled="processing"
      >
        <Share2 :size="20" />
        <span>나눔요청</span>
      </button>

      <!-- 채팅하기 버튼 -->
      <button
          @click="handleStartChat"
          class="action-btn chat-btn primary"
          :disabled="chatLoading"
      >
        <div v-if="chatLoading" class="loading-spinner">
          <div class="spinner-small"></div>
        </div>
        <MessageCircle v-else :size="20" />
        <span>{{ chatLoading ? '연결중...' : '채팅하기' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, Share2, MessageCircle } from 'lucide-vue-next'
import { chatService, tokenUtils } from '@/api/axios.js'

// Props
const props = defineProps({
  food: {
    type: Object,
    required: true
  },
  isFavorited: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'toggle-favorite',
  'request-share',
  'start-chat'
])

// 라우터
const router = useRouter()

// 상태
const processing = ref(false)
const chatLoading = ref(false)

// 관심 추가/취소
const toggleFavorite = () => {
  emit('toggle-favorite')
}

// 나눔 요청
const handleRequestShare = () => {
  emit('request-share')
}

// 채팅하기 핸들러 (핵심 로직)
const handleStartChat = async () => {
  if (!tokenUtils.isLoggedIn()) {
    alert('로그인이 필요합니다.')
    router.push('/login')
    return
  }

  // 본인 상품인지 확인
  const currentUser = tokenUtils.getCurrentUser()
  if (currentUser && String(currentUser.id) === String(props.food.sellerId)) {
    alert('본인의 상품입니다.')
    return
  }

  try {
    chatLoading.value = true

    console.log('🔍 채팅방 조회 시작:', {
      currentUserId: currentUser.id,
      sellerId: props.food.sellerId,
      productId: props.food.id
    })

    // 1. 기존 채팅방 조회 (1:1 채팅방)
    const existingRoom = await findExistingChatRoom(currentUser.id, props.food.sellerId)

    if (existingRoom) {
      console.log('✅ 기존 채팅방 발견:', existingRoom.id)

      // 기존 채팅방으로 이동
      router.push({
        name: 'Chat',
        params: { roomId: existingRoom.id },
        query: {
          productId: props.food.id,
          productName: props.food.name
        }
      })
    } else {
      console.log('🆕 새 채팅방 생성 필요')

      // 2. 새 채팅방 생성
      const newRoom = await createNewChatRoom(currentUser.id, props.food.sellerId, props.food)

      console.log('✅ 새 채팅방 생성 완료:', newRoom.id)

      // 새 채팅방으로 이동
      router.push({
        name: 'Chat',
        params: { roomId: newRoom.id },
        query: {
          productId: props.food.id,
          productName: props.food.name,
          isNew: 'true' // 새 채팅방 표시용
        }
      })
    }

  } catch (error) {
    console.error('❌ 채팅방 처리 실패:', error)

    if (error.response?.status === 404) {
      alert('상대방을 찾을 수 없습니다.')
    } else if (error.response?.status === 403) {
      alert('채팅 권한이 없습니다.')
    } else {
      alert('채팅방 연결에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  } finally {
    chatLoading.value = false
  }
}

/**
 * 기존 1:1 채팅방 조회
 */
const findExistingChatRoom = async (userId1, userId2) => {
  try {
    // 두 사용자 간의 1:1 채팅방 조회
    const response = await chatService.getChatRooms({
      roomType: 'ONE_TO_ONE',
      participantIds: [userId1, userId2].sort(), // 정렬해서 일관성 보장
      limit: 1
    })

    const rooms = response.data?.data || response.data?.content || []

    // 정확히 두 명의 참여자가 있는 방 찾기
    const existingRoom = rooms.find(room => {
      const participants = room.participants || []
      return participants.length === 2 &&
          participants.some(p => String(p.userId) === String(userId1)) &&
          participants.some(p => String(p.userId) === String(userId2))
    })

    return existingRoom || null

  } catch (error) {
    console.error('기존 채팅방 조회 실패:', error)
    return null
  }
}

/**
 * 새 1:1 채팅방 생성
 */
const createNewChatRoom = async (buyerId, sellerId, product) => {
  try {
    const roomData = {
      title: `${product.name} 문의`, // 상품명으로 채팅방 제목 설정
      description: `${product.name}에 대한 문의 채팅방`,
      roomType: 'ONE_TO_ONE',
      participantUserIds: [String(buyerId), String(sellerId)],
      isPrivate: true, // 1:1은 항상 비공개
      maxParticipants: 2,
      relatedProductId: product.id, // 관련 상품 ID
      relatedProductType: 'ONE_MOUTH' // 상품 타입
    }

    console.log('📡 새 채팅방 생성 요청:', roomData)

    const response = await chatService.createChatRoom(roomData)
    const newRoom = response.data?.data || response.data

    if (!newRoom) {
      throw new Error('채팅방 생성 응답이 없습니다.')
    }

    // 초기 메시지 전송 (선택사항)
    try {
      await chatService.sendMessage(newRoom.id, {
        content: `안녕하세요! "${product.name}" 상품에 관심이 있어서 연락드립니다. 😊`,
        messageType: 'TEXT',
        isSystemMessage: false
      })
    } catch (msgError) {
      console.warn('초기 메시지 전송 실패:', msgError)
      // 메시지 실패해도 채팅방은 생성됨
    }

    return newRoom

  } catch (error) {
    console.error('새 채팅방 생성 실패:', error)
    throw error
  }
}
</script>

<style scoped>
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 16px 20px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.actions-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 52px;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.favorite-btn {
  border-color: #ef4444;
  color: #ef4444;
}

.favorite-btn.active {
  background: #ef4444;
  color: white;
}

.favorite-btn:hover:not(:disabled) {
  background: #ef4444;
  color: white;
}

.share-btn {
  border-color: #10b981;
  color: #10b981;
}

.share-btn:hover:not(:disabled) {
  background: #10b981;
  color: white;
}

.chat-btn {
  border-color: #3b82f6;
  color: #3b82f6;
  flex: 2; /* 채팅 버튼을 더 크게 */
  font-weight: 600;
}

.chat-btn.primary {
  background: #3b82f6;
  color: white;
}

.chat-btn:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .bottom-actions {
    padding: 12px 16px;
  }

  .actions-container {
    gap: 8px;
  }

  .action-btn {
    padding: 12px 16px;
    font-size: 13px;
    min-height: 48px;
  }

  .action-btn span {
    display: none; /* 모바일에서는 아이콘만 표시 */
  }
}

@media (max-width: 480px) {
  .action-btn {
    padding: 10px 12px;
    min-height: 44px;
  }
}

/* 아이폰 홈 인디케이터 대응 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-actions {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
}
</style>