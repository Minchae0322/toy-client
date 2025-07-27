<!-- ChatApp.vue -->
<template>
  <div class="chat-app">
    <!-- 채팅방 목록 뷰 -->
    <ChatRoomView
        v-if="!selectedRoom"
        @select-room="enterChatRoom"
    />

    <!-- 채팅 상세 뷰 -->
    <ChatDetailView
        v-else
        :room-id="selectedRoom"
        @back-to-list="leaveChatRoom"
        @new-message="handleNewMessage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ChatRoomView from '@/views/ChatRoomView.vue'
import ChatDetailView from '@/views/ChatDetailView.vue'
import { chatApi } from '@/services/chatApi.js'
import { webSocketService } from '@/services/webSocketService.js'
import { pushNotificationService } from '@/services/pushNotificationService.js'

const selectedRoom = ref(null)
const currentUserId = ref(null)

// 채팅방 입장
const enterChatRoom = async (roomId) => {
  try {
    // 채팅방 입장 API 호출
    await chatApi.joinRoom(roomId)
    selectedRoom.value = roomId

    // WebSocket으로 해당 채팅방 구독
    webSocketService.subscribeToRoom(roomId, handleWebSocketMessage)

    console.log(`채팅방 ${roomId}에 입장했습니다`)
  } catch (error) {
    console.error('채팅방 입장 실패:', error)
    alert('채팅방 입장에 실패했습니다')
  }
}

// 채팅방 퇴장
const leaveChatRoom = async () => {
  if (selectedRoom.value) {
    try {
      // WebSocket 구독 해제
      webSocketService.unsubscribeFromRoom(selectedRoom.value)

      // 채팅방 퇴장 API 호출
      await chatApi.leaveRoom(selectedRoom.value)
      console.log(`채팅방 ${selectedRoom.value}에서 퇴장했습니다`)
    } catch (error) {
      console.error('채팅방 퇴장 실패:', error)
    } finally {
      selectedRoom.value = null
    }
  }
}

// WebSocket으로 받은 메시지 처리 (채팅방 안에 있을 때)
const handleWebSocketMessage = (message) => {
  console.log('WebSocket 메시지 수신:', message)
  // ChatDetailView에서 처리하도록 이벤트 전달
}

// 새 메시지 처리 (ChatDetailView에서 올라온 이벤트)
const handleNewMessage = (message) => {
  console.log('새 메시지:', message)
  // 필요시 추가 처리 (읽음 상태 업데이트 등)
}

// Push 알림 처리 (채팅방 밖에 있을 때)
const handlePushNotification = (notification) => {
  console.log('Push 알림 수신:', notification)

  // 브라우저 알림 표시
  if (Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      tag: notification.roomId,
      onclick: () => {
        // 알림 클릭 시 해당 채팅방으로 이동
        if (notification.roomId && !selectedRoom.value) {
          enterChatRoom(notification.roomId)
        }
      }
    })
  }
}

// 앱 초기화
onMounted(async () => {
  try {
    // 사용자 정보 가져오기
    const userInfo = await chatApi.getCurrentUser()
    currentUserId.value = userInfo.userId

    // WebSocket 연결
    await webSocketService.connect(currentUserId.value)

    // Push 알림 서비스 초기화
    await pushNotificationService.initialize(handlePushNotification)

    // 전역 메시지 리스너 (채팅방 밖에서의 알림용)
    webSocketService.onGlobalMessage((message) => {
      // 현재 해당 채팅방에 있지 않으면 Push 알림으로 처리
      if (!selectedRoom.value || selectedRoom.value !== message.roomId) {
        handlePushNotification({
          title: message.senderName || '새 메시지',
          body: message.content,
          roomId: message.roomId,
          icon: '/chat-icon.png'
        })
      }
    })

  } catch (error) {
    console.error('앱 초기화 실패:', error)
  }
})

// 페이지를 떠날 때 정리
onBeforeUnmount(async () => {
  await leaveChatRoom()
  webSocketService.disconnect()
})

// 브라우저 종료/새로고침 시 정리
window.addEventListener('beforeunload', async () => {
  await leaveChatRoom()
  webSocketService.disconnect()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.chat-app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
  min-height: 100vh;
}
</style>