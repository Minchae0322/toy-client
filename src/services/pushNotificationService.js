// services/pushNotificationService.js
class PushNotificationService {
  constructor() {
    this.registration = null
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window
    this.notificationHandler = null
  }

  // Push 알림 서비스 초기화
  async initialize(notificationHandler) {
    this.notificationHandler = notificationHandler

    if (!this.isSupported) {
      console.warn('브라우저가 Push 알림을 지원하지 않습니다')
      return false
    }

    try {
      // 알림 권한 요청
      await this.requestPermission()

      // Service Worker 등록
      await this.registerServiceWorker()

      // Push 구독
      await this.subscribeToPush()

      console.log('Push 알림 서비스 초기화 완료')
      return true

    } catch (error) {
      console.error('Push 알림 서비스 초기화 실패:', error)
      return false
    }
  }

  // 알림 권한 요청
  async requestPermission() {
    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      throw new Error('사용자가 알림을 거부했습니다')
    }

    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      throw new Error('알림 권한이 승인되지 않았습니다')
    }

    return true
  }

  // Service Worker 등록
  async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker 등록 성공:', this.registration.scope)

      // Service Worker로부터의 메시지 수신
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          this.handleNotificationClick(event.data.payload)
        }
      })

    } catch (error) {
      console.error('Service Worker 등록 실패:', error)
      throw error
    }
  }

  // Push 구독
  async subscribeToPush() {
    if (!this.registration) {
      throw new Error('Service Worker가 등록되지 않았습니다')
    }

    try {
      // VAPID 공개 키 (서버에서 제공)
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY'

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(vapidPublicKey)
      })

      console.log('Push 구독 성공:', subscription)

      // 서버에 구독 정보 전송
      await this.sendSubscriptionToServer(subscription)

    } catch (error) {
      console.error('Push 구독 실패:', error)
      throw error
    }
  }

  // 구독 정보를 서버로 전송
  async sendSubscriptionToServer(subscription) {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription,
          userId: this.getCurrentUserId() // 현재 사용자 ID
        })
      })

      if (!response.ok) {
        throw new Error('서버에 구독 정보 전송 실패')
      }

      console.log('서버에 Push 구독 정보 전송 완료')

    } catch (error) {
      console.error('구독 정보 전송 실패:', error)
      throw error
    }
  }

  // 알림 표시
  showNotification(title, options = {}) {
    if (Notification.permission !== 'granted') {
      console.warn('알림 권한이 없습니다')
      return
    }

    const defaultOptions = {
      icon: '/icons/chat-icon-192.png',
      badge: '/icons/chat-badge-72.png',
      vibrate: [200, 100, 200],
      tag: 'chat-notification',
      requireInteraction: false,
      ...options
    }

    // 브라우저 알림 생성
    const notification = new Notification(title, defaultOptions)

    notification.onclick = () => {
      this.handleNotificationClick(options.data)
      notification.close()
    }

    // 자동으로 닫기 (5초 후)
    setTimeout(() => {
      notification.close()
    }, 5000)

    return notification
  }

  // 알림 클릭 처리
  handleNotificationClick(data) {
    console.log('알림 클릭:', data)

    // 브라우저 창이 백그라운드에 있으면 포커스
    if (window.document.hidden) {
      window.focus()
    }

    // 알림 핸들러 호출
    if (this.notificationHandler && data) {
      this.notificationHandler({
        type: 'NOTIFICATION_CLICK',
        roomId: data.roomId,
        messageId: data.messageId,
        ...data
      })
    }
  }

  // 채팅 메시지 알림 표시
  showChatNotification(message) {
    const title = message.senderName || '새 메시지'
    let body = message.content
    let icon = '/icons/chat-icon-192.png'

    // 메시지 타입에 따른 내용 변경
    switch (message.messageType) {
      case 'IMAGE':
        body = '📷 사진을 보냈습니다'
        break
      case 'VIDEO':
        body = '🎥 동영상을 보냈습니다'
        break
      case 'FILE':
        body = `📎 ${message.metadata?.fileName || '파일'}을 보냈습니다`
        break
      case 'LOCATION':
        body = '📍 위치를 공유했습니다'
        break
    }

    return this.showNotification(title, {
      body: body,
      icon: icon,
      tag: `chat-${message.roomId}`,
      data: {
        roomId: message.roomId,
        messageId: message.messageId,
        senderId: message.senderId
      }
    })
  }

  // 시스템 알림 표시
  showSystemNotification(message) {
    return this.showNotification('채팅방 알림', {
      body: message.content,
      icon: '/icons/system-icon-192.png',
      tag: `system-${message.roomId}`,
      data: {
        roomId: message.roomId,
        type: 'SYSTEM'
      }
    })
  }

  // Push 구독 해제
  async unsubscribe() {
    if (!this.registration) {
      return
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        console.log('Push 구독 해제 완료')

        // 서버에도 구독 해제 알림
        await this.removeSubscriptionFromServer(subscription)
      }

    } catch (error) {
      console.error('Push 구독 해제 실패:', error)
    }
  }

  // 서버에서 구독 정보 제거
  async removeSubscriptionFromServer(subscription) {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription,
          userId: this.getCurrentUserId()
        })
      })

    } catch (error) {
      console.error('서버 구독 해제 실패:', error)
    }
  }

  // VAPID 키 변환 유틸리티
  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // 현재 사용자 ID 가져오기
  getCurrentUserId() {
    // 실제 구현에서는 인증 서비스에서 가져옴
    return localStorage.getItem('userId') || 'anonymous'
  }

  // 알림 권한 상태 확인
  getPermissionStatus() {
    return Notification.permission
  }

  // 브라우저 지원 여부 확인
  isNotificationSupported() {
    return this.isSupported
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const pushNotificationService = new PushNotificationService()