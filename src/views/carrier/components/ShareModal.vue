<template>
  <Teleport to="body">
    <div v-if="visible" class="share-modal-overlay" @click="$emit('update:visible', false)">
      <div class="share-modal" @click.stop>
        <button class="modal-close" @click="$emit('update:visible', false)">✕</button>
        <div class="share-preview" :style="{ background: shareBg }">
          <div class="share-svg-wrap">
            <svg width="100%" height="100%" viewBox="-40 -60 380 500" fill="none" preserveAspectRatio="xMidYMid meet" data-share-svg>
              <rect x="-40" y="-60" width="380" height="500" :fill="shareBg"/>
              <text v-if="shareNickname" x="150" y="-30" text-anchor="middle" font-size="22" font-weight="700" fill="#363636" font-family="'HancomMalangMalang','SUIT',sans-serif">{{ shareNickname }}의 캐리어</text>
              <defs>
                <filter id="bI2" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="b1"/><feOffset dx="6" dy="6" result="o1"/>
                  <feComposite in="o1" in2="SourceGraphic" operator="in" result="s1"/>
                  <feFlood flood-color="#6b5b9a" flood-opacity=".2" result="sc"/><feComposite in="sc" in2="s1" operator="in" result="sh"/>
                  <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="b2"/><feOffset dx="-5" dy="-5" result="o2"/>
                  <feComposite in="o2" in2="SourceGraphic" operator="in" result="h1"/>
                  <feFlood flood-color="#fff" flood-opacity=".5" result="hc"/><feComposite in="hc" in2="h1" operator="in" result="hl"/>
                  <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/><feMergeNode in="hl"/></feMerge>
                </filter>
                <linearGradient id="sG2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" :stop-color="currentSkin.body.grad1"/>
                  <stop offset="100%" :stop-color="currentSkin.body.grad2"/>
                </linearGradient>
              </defs>

              <!-- 외관 보기 -->
              <template v-if="!isOpen">
                <rect x="30" y="50" width="240" height="320" rx="20" fill="url(#sG2)" :stroke="currentSkin.body.stroke" stroke-width="3" filter="url(#bI2)"/>
                <line x1="52" y1="122" x2="52" y2="289" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".3"/>
                <rect x="122" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
                <rect x="170" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
                <rect x="116" y="6" width="68" height="18" rx="9" :fill="currentSkin.handle.grip" :stroke="currentSkin.handle.stroke" stroke-width="2.5"/>
                <rect x="98" y="80" width="22" height="250" rx="11" :fill="currentSkin.groove.fill" :stroke="currentSkin.groove.stroke" stroke-width="2"/>
                <rect x="139" y="80" width="22" height="250" rx="11" :fill="currentSkin.groove.fill" :stroke="currentSkin.groove.stroke" stroke-width="2"/>
                <rect x="180" y="80" width="22" height="250" rx="11" :fill="currentSkin.groove.fill" :stroke="currentSkin.groove.stroke" stroke-width="2"/>
                <!-- 스킨 내장 스티커 -->
                <template v-for="(st, i) in currentSkin.stickers" :key="'share-sk-' + i">
                  <g v-if="st.type === 'smallheart'" :transform="`translate(${st.x},${st.y})`">
                    <path d="M0 7C-2 5-9 1-9-4C-9-8-5-10 0-6C5-10 9-8 9-4C9 1 2 5 0 7Z" fill="#fca5a5" stroke="#f87171" stroke-width="1"/>
                  </g>
                  <g v-else-if="st.type === 'bigbow'" :transform="`translate(${st.x},${st.y})`">
                    <path d="M-20 0C-20-15-4-15 0 0C4-15 20-15 20 0C20 15 4 15 0 0C-4 15-20 15-20 0Z" fill="#dc2626" stroke="#222" stroke-width="1.5"/>
                    <circle r="5" fill="#dc2626" stroke="#222" stroke-width="1.2"/>
                  </g>
                  <g v-else-if="st.type === 'stamp'" :transform="`translate(${st.x},${st.y})`">
                    <rect x="-28" y="-16" width="56" height="32" rx="4" fill="none" :stroke="st.color" stroke-width="2.5" stroke-dasharray="3 2" opacity="0.7"/>
                    <text x="0" y="5" text-anchor="middle" font-size="11" font-weight="900" :fill="st.color" opacity="0.75" font-family="monospace">{{ st.label }}</text>
                  </g>
                  <circle v-else-if="st.type === 'star'" :cx="st.x" :cy="st.y" :r="st.size || 4" fill="#e0e7ff" opacity="0.6"/>
                  <g v-else-if="st.type === 'planet'" :transform="`translate(${st.x},${st.y})`">
                    <circle r="12" fill="#818cf8" opacity="0.6"/>
                    <ellipse rx="20" ry="5" fill="none" stroke="#c7d2fe" stroke-width="1.5" opacity="0.5" transform="rotate(-20)"/>
                  </g>
                </template>
                <!-- 포토택 -->
                <g v-if="hasPhototag" transform="rotate(-4,126,53)">
                  <line x1="126" y1="53" x2="126" y2="78" :stroke="currentSkin.body.stroke" stroke-width="1.5" opacity=".4" stroke-linecap="round"/>
                  <rect x="97" y="78" width="58" height="76" rx="4" fill="#fff" fill-opacity=".92" :stroke="currentSkin.body.stroke" stroke-width="1.2" opacity=".6"/>
                  <circle cx="126" cy="86" r="3" fill="none" :stroke="currentSkin.body.stroke" stroke-width=".8" opacity=".3"/>
                  <line x1="98" y1="96" x2="154" y2="96" :stroke="currentSkin.body.stroke" stroke-width=".5" opacity=".15"/>
                  <template v-if="nameTagImg">
                    <defs><clipPath id="ntC2"><rect x="97.6" y="96.5" width="56.8" height="57.4" rx="3"/></clipPath></defs>
                    <image :href="nameTagImg" x="97.6" y="96.5" width="56.8" height="57.4" preserveAspectRatio="xMidYMid slice" clip-path="url(#ntC2)"/>
                  </template>
                  <text v-else text-anchor="middle" font-size="11" font-weight="800" :fill="currentSkin.body.stroke" opacity=".5" font-family="monospace" letter-spacing="1">
                    <tspan x="126" y="120">PHOTO</tspan>
                    <tspan x="126" dy="14">TAG</tspan>
                  </text>
                </g>
                <!-- 이모지 스티커 -->
                <template v-for="d in emojiDecos" :key="'share-deco-' + d.uid">
                  <text
                    :x="30 + (d.x / 100) * 240"
                    :y="50 + (d.y / 100) * 320"
                    text-anchor="middle"
                    dominant-baseline="central"
                    :font-size="24 * d.scale"
                    fill="#000"
                    :transform="d.flipped ? `translate(${(30 + (d.x / 100) * 240) * 2},0) scale(-1,1)` : ''"
                  >{{ d.emoji }}</text>
                </template>
                <!-- 바퀴 -->
                <rect x="62" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
                <circle cx="70" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/>
                <circle cx="70" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
                <rect x="222" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
                <circle cx="230" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/>
                <circle cx="230" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
              </template>

              <!-- 내부 보기 -->
              <template v-else>
                <rect x="122" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
                <rect x="170" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
                <rect x="116" y="6" width="68" height="18" rx="9" :fill="currentSkin.handle.grip" :stroke="currentSkin.handle.stroke" stroke-width="2.5"/>
                <rect x="30" y="50" width="240" height="320" rx="20" :stroke="currentSkin.body.stroke" stroke-width="2" stroke-dasharray="8 4" fill="#fff" opacity=".5"/>
                <line x1="30" y1="140" x2="270" y2="140" :stroke="currentSkin.body.stroke" stroke-width="1.5" stroke-dasharray="6 4" opacity=".3"/>
                <line x1="30" y1="260" x2="270" y2="260" :stroke="currentSkin.body.stroke" stroke-width="1.5" stroke-dasharray="6 4" opacity=".3"/>
                <rect x="62" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
                <circle cx="70" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/><circle cx="70" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
                <rect x="222" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
                <circle cx="230" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/><circle cx="230" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
                <!-- 버블 아이템 -->
                <template v-for="(b, i) in shareBubbles" :key="'sb-' + i">
                  <circle :cx="b.cx" :cy="b.cy" :r="b.r" :fill="b.bg" :stroke="b.border" stroke-width="2"/>
                  <text v-if="b.r > 18" :x="b.cx" :y="b.cy - (b.r > 30 ? 3 : 0)" text-anchor="middle" dominant-baseline="central" :font-size="Math.max(8, b.r * 0.22)" font-weight="600" :fill="b.tc">{{ b.name }}</text>
                  <text v-if="b.r > 30" :x="b.cx" :y="b.cy + b.r * 0.25" text-anchor="middle" dominant-baseline="central" :font-size="Math.max(6, b.r * 0.14)" :fill="b.sc">{{ b.brand }}</text>
                </template>
                <text v-if="sortedItems.length === 0" x="150" y="210" text-anchor="middle" font-size="14" fill="#aaa">캐리어가 비어있어요</text>
              </template>
            </svg>
          </div>
        </div>
        <div class="share-nickname-row">
          <svg class="nickname-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9333EA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <input
            :value="shareNickname"
            class="share-nickname-input"
            placeholder="닉네임을 입력하세요"
            maxlength="10"
            @input="$emit('update:shareNickname', $event.target.value)"
          />
        </div>
        <button class="share-save-btn" @click="downloadCarrierImage">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          이미지로 저장하기
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, required: true },
  currentSkin: { type: Object, required: true },
  isOpen: { type: Boolean, required: true },
  shareBubbles: { type: Array, default: () => [] },
  sortedItems: { type: Array, default: () => [] },
  emojiDecos: { type: Array, default: () => [] },
  hasPhototag: { type: Boolean, default: false },
  nameTagImg: { type: String, default: null },
  shareNickname: { type: String, default: '' },
  shareBg: { type: String, default: '#e5e1f7' }
})

defineEmits(['update:visible', 'update:shareNickname'])

function downloadCarrierImage() {
  const svgEl = document.querySelector('[data-share-svg]')
  if (!svgEl) return
  const canvas = document.createElement('canvas')
  canvas.width = 760; canvas.height = 1000
  const ctx = canvas.getContext('2d')
  const svgData = new XMLSerializer().serializeToString(svgEl)
  const img = new Image()
  img.onload = () => {
    ctx.fillStyle = props.shareBg; ctx.fillRect(0, 0, 760, 1000)
    ctx.drawImage(img, 0, 0, 760, 1000)
    const a = document.createElement('a')
    a.download = props.shareNickname ? `${props.shareNickname}-carrier.png` : 'my-carrier.png'
    a.href = canvas.toDataURL('image/png')
    a.click()
  }
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
}
</script>
