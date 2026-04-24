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

const insStyle = computed(() => ({
  display: 'block',
  minHeight: typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight
}))

onMounted(() => {
  if (!isValidSlot.value) return
  try {
    if (typeof window === 'undefined') return
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
  background: #fafafa;
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
  color: #a1a1aa;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
}

.adsbygoogle {
  width: 100%;
}
</style>
