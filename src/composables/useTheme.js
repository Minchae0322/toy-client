/**
 * 테마 (light/dark/auto) 관리 컴포저블
 *
 * mode:
 *   'light' — 강제 라이트
 *   'dark'  — 강제 다크
 *   'auto'  — 시스템 prefers-color-scheme 따라감 (기본값)
 *
 * resolved (computed):
 *   실제로 적용된 'light' | 'dark' 값. UI 토글 표시용.
 *
 * 영속화: localStorage 'yogurtte:theme'
 * 적용 방법: <html data-theme="dark"> 속성 설정 → tokens.css 의 셀렉터가 받음
 *
 * FOUC 방지: 초기 적용은 index.html 의 inline 스크립트가 페인트 전에 수행.
 *           이 모듈은 그 후의 변경/감지만 담당.
 */

import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'yogurtte:theme'
const VALID_MODES = ['light', 'dark', 'auto']

function loadInitialMode() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (VALID_MODES.includes(saved)) return saved
    } catch {}
    return 'auto'
}

function systemPrefersDark() {
    return typeof window !== 'undefined'
        && window.matchMedia
        && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolve(modeValue) {
    if (modeValue === 'auto') return systemPrefersDark() ? 'dark' : 'light'
    return modeValue
}

function applyToDom(resolvedTheme) {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', resolvedTheme)
}

// 모듈 싱글톤 — useTheme() 호출 위치와 무관하게 공유
const mode = ref(loadInitialMode())
const resolved = computed(() => resolve(mode.value))

// 모드 변경 시 영속화 + DOM 반영
watch(mode, (newMode) => {
    try { localStorage.setItem(STORAGE_KEY, newMode) } catch {}
    applyToDom(resolve(newMode))
})

// 시스템 테마 변경 감지 (mode === 'auto' 일 때만 반응)
if (typeof window !== 'undefined' && window.matchMedia) {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystemChange = () => {
        if (mode.value === 'auto') applyToDom(resolve('auto'))
    }
    // Safari 14+ / 모던 브라우저 모두 지원
    if (mql.addEventListener) mql.addEventListener('change', onSystemChange)
    else if (mql.addListener) mql.addListener(onSystemChange)
}

export function useTheme() {
    return {
        mode,           // ref<'light'|'dark'|'auto'>
        resolved,       // computed<'light'|'dark'>

        setMode(value) {
            if (!VALID_MODES.includes(value)) return
            mode.value = value
        },

        // 토글: 현재 실제 적용 테마 기준으로 반대로
        toggle() {
            mode.value = resolved.value === 'dark' ? 'light' : 'dark'
        },
    }
}
