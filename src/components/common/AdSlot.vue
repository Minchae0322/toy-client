<template>
  <div v-if="isValidSlot" class="ad-slot" :class="{ 'ad-slot--bordered': bordered }">
    <span class="ad-slot__label">AD</span>
    <ins
      ref="insRef"
      class="adsbygoogle"
      :style="insStyle"
      data-ad-client="ca-pub-6101308382817399"
      :data-ad-slot="slotId"
      :data-ad-format="format"
      :data-full-width-responsive="fullWidthResponsive ? 'true' : 'false'"
    />
  </div>
  <div
    v-else-if="isDev"
    class="ad-slot ad-slot--placeholder"
    :class="{ 'ad-slot--bordered': bordered }"
    :style="insStyle"
  >
    <span class="ad-slot__label">AD</span>
    <div class="ad-slot__placeholder">
      <div class="ad-slot__placeholder-title">광고 영역 (개발용)</div>
      <div class="ad-slot__placeholder-sub">AdSense 승인 후 실제 광고 노출</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'

const props = defineProps({
  slotId: { type: String, default: '' },
  format: { type: String, default: 'auto' },
  fullWidthResponsive: { type: Boolean, default: true },
  minHeight: { type: [String, Number], default: 250 },
  bordered: { type: Boolean, default: false }
})

const insRef = ref(null)

const isValidSlot = computed(() => {
  const id = (props.slotId || '').trim()
  if (!id) return false
  if (id.startsWith('REPLACE_')) return false
  return /^\d+$/.test(id)
})

const isDev = import.meta.env.DEV

const insStyle = computed(() => ({
  display: 'block',
  minHeight: typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight
}))

function ensureAdsScript() {
  if (typeof document === 'undefined') return
  if (document.querySelector('script[data-adsbygoogle]')) return
  const s = document.createElement('script')
  s.async = true
  s.crossOrigin = 'anonymous'
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6101308382817399'
  s.setAttribute('data-adsbygoogle', '')
  document.head.appendChild(s)
}

onMounted(() => {
  if (!isValidSlot.value) return
  try {
    if (typeof window === 'undefined') return
    ensureAdsScript()
    window.adsbygoogle = window.adsbygoogle || []
    window.adsbygoogle.push({})
  } catch (e) {
    // adsbygoogle 미로드/차단 환경에서는 조용히 무시
  }
})
</script>

<style scoped>
.ad-slot {
  position: relative;
  width: 100%;
  background: var(--bg-subtle);
  border-radius: 12px;
  overflow: hidden;
}

.ad-slot--bordered {
  border: 1px solid #f1f1f1;
}

.ad-slot__label {
  position: absolute;
  top: 8px;
  left: 10px;
  z-index: 1;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--c-text-400);
  background: var(--header-blur-bg);
  padding: 2px 6px;
  border-radius: 4px;
}

.adsbygoogle {
  width: 100%;
}

.ad-slot--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: repeating-linear-gradient(
    135deg,
    var(--bg-subtle) 0,
    var(--bg-subtle) 10px,
    var(--bg-mute) 10px,
    var(--bg-mute) 20px
  );
  border: 1px dashed var(--c-text-300);
}
.ad-slot__placeholder {
  text-align: center;
  padding: 16px;
}
.ad-slot__placeholder-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text-500);
  margin-bottom: 4px;
  letter-spacing: -0.2px;
}
.ad-slot__placeholder-sub {
  font-size: 11px;
  color: var(--c-text-400);
  letter-spacing: -0.1px;
}
</style>
