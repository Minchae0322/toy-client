import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { App } from '@capacitor/app'
import { CapacitorUpdater } from '@capgo/capacitor-updater'

export async function initCapacitor(router) {
  if (!Capacitor.isNativePlatform()) return

  // Capgo OTA: 새 번들이 정상 부팅됐음을 알림 — 60s 안에 호출 안 되면 이전 번들로 자동 롤백
  try {
    await CapacitorUpdater.notifyAppReady()
  } catch {}

  try {
    // index.html 인라인 스크립트가 페인트 전에 data-theme 을 세팅함 — 그 값으로 초기 StatusBar 결정
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light })
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: isDark ? '#0F1218' : '#ffffff' })
    }
  } catch {}

  try {
    await SplashScreen.hide()
  } catch {}

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack && window.history.length > 1) {
      router.back()
    } else {
      App.exitApp()
    }
  })
}
