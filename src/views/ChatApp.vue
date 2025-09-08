<template>
  <div class="chat-app">
    <!-- Debug info (remove in production) -->
    <div v-if="isDev" class="debug-panel">
      <h4>ChatApp Debug</h4>
      <p>selectedRoomId: {{ selectedRoomId }}</p>
      <p>actualRoomId: {{ actualRoomId }}</p>
      <p>route.params.roomId: {{ route.params.roomId }}</p>
      <p>props.initialRoomId: {{ props.initialRoomId }}</p>
      <p>현재 화면: {{ selectedRoomId ? 'ChatDetail' : 'ChatRoomView' }}</p>
    </div>

    <!-- 채팅방 목록 화면 -->
    <ChatRoomView
        v-if="!selectedRoomId"
        :connection-state="connectionState"
        @room-selected="handleRoomSelect"
        @message-received="handleNewMessage"
    />

    <!-- 채팅방 상세 화면 -->
    <ChatDetail
        v-if="selectedRoomId"
        :room-id="selectedRoomId"
        @back-to-list="handleBackToList"
        @new-message="handleNewMessage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ChatRoomView from '@/components/chat/ChatRoomView.vue'
import ChatDetail from '@/components/chat/ChatDetail.vue'

const route = useRoute()
const router = useRouter()
const isDev = ref(import.meta.env.DEV)

// Props
const props = defineProps({
  initialRoomId: {
    type: String,
    default: null
  }
})

// 반응형 데이터
const selectedRoomId = ref(null)
const connectionState = ref({
  connected: false,
  connecting: false,
  status: 'disconnected',
  error: null
})

// 실제 roomId 계산 (props 또는 route에서)
const actualRoomId = computed(() => {
  return props.initialRoomId || route.params.roomId || null
})

// 이벤트 핸들러
const handleRoomSelect = (roomId) => {
  console.log('🚪 채팅방 선택 이벤트 수신:', roomId)

  if (!roomId) {
    console.warn('⚠️ 잘못된 roomId:', roomId)
    return
  }

  console.log('🚪 채팅방', roomId, '입장 처리 중...')
  selectedRoomId.value = roomId

  // URL 업데이트 (뒤로가기 지원)
  if (route.params.roomId !== roomId) {
    router.replace({
      name: 'ChatWithRoom',
      params: { roomId },
      query: route.query // 기존 쿼리 파라미터 유지
    })
  }

  console.log('✅ 채팅방', roomId, '선택 완료')
}

const handleBackToList = () => {
  console.log('📋 채팅방 목록으로 돌아가기')
  selectedRoomId.value = null

  // URL을 채팅 메인으로 변경
  router.replace({ name: 'Chat' })
}

const handleNewMessage = (message) => {
  console.log('📨 새 메시지 수신:', message)
  // 필요시 추가 처리
}

// 초기화 함수
const initializeChatApp = async () => {
  console.log('🚀 ChatApp 초기화 시작...')
  console.log('📋 현재 route.params:', route.params)
  console.log('📋 현재 props:', props)
  console.log('📋 actualRoomId:', actualRoomId.value)

  // actualRoomId가 있으면 해당 채팅방으로 이동
  if (actualRoomId.value) {
    console.log('🚪 URL에서 roomId 감지, 채팅방 상세로 이동:', actualRoomId.value)

    // 다음 틱에서 selectedRoomId 설정 (DOM 업데이트 보장)
    await nextTick()
    selectedRoomId.value = actualRoomId.value

    console.log('✅ selectedRoomId 설정 완료:', selectedRoomId.value)
  } else {
    console.log('📋 roomId가 없음, 채팅방 목록 표시')
    selectedRoomId.value = null
  }
}

// 라이프사이클
onMounted(async () => {
  await initializeChatApp()
})

// actualRoomId 변경 감지
watch(actualRoomId, async (newRoomId, oldRoomId) => {
  console.log('🔄 actualRoomId 변경 감지:', { oldRoomId, newRoomId })

  if (newRoomId && newRoomId !== oldRoomId) {
    console.log('🚪 새로운 roomId로 채팅방 선택:', newRoomId)
    await nextTick()
    selectedRoomId.value = newRoomId
  } else if (!newRoomId && selectedRoomId.value) {
    console.log('📋 roomId가 없어져서 목록으로 이동')
    selectedRoomId.value = null
  }
})

// selectedRoomId 변경 감지 (디버깅용)
watch(selectedRoomId, (newValue, oldValue) => {
  console.log('🔄 selectedRoomId 변경:', { oldValue, newValue })
  console.log('🖥️ 현재 화면:', newValue ? 'ChatDetail' : 'ChatRoomView')
})

// route 변경 감지 (추가 디버깅)
watch(() => route.params, (newParams, oldParams) => {
  console.log('🛣️ Route params 변경:', { oldParams, newParams })
}, { deep: true })
</script>

<style scoped>
.chat-app {
  height: 100vh;
  background: white;
  overflow: hidden;
  position: relative;
}

.debug-panel {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 0, 0.9);
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  z-index: 9999;
  max-width: 300px;
}

.debug-panel h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.debug-panel p {
  margin: 2px 0;
  word-break: break-all;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .chat-app {
    background: #1f2937;
  }

  .debug-panel {
    background: rgba(0, 0, 0, 0.9);
    color: white;
  }
}
</style>