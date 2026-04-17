<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :aria-label="ariaLabel"
    role="img"
  >
    <!-- ================================================== PLAIN -->
    <template v-if="tier === 'plain'">
      <ellipse cx="60" cy="108" rx="32" ry="4" fill="#000000" opacity="0.15" />
      <path d="M30 34 L38 100 Q38 106 60 106 Q82 106 82 100 L90 34 Z" :fill="c.dk" stroke="#1F2937" stroke-width="3" stroke-linejoin="round" paint-order="stroke" />
      <path d="M32 35 L40 100 Q40 104 60 104 Q80 104 80 100 L88 35 Z" :fill="c.base" />
      <path d="M80 100 L88 35 L82 35 L74 100 Z" :fill="c.sh" opacity="0.85" />
      <ellipse cx="60" cy="34" rx="30" ry="6" :fill="c.dk" stroke="#1F2937" stroke-width="3" paint-order="stroke" />
      <ellipse cx="60" cy="32" rx="30" ry="5" :fill="c.base" />
      <ellipse cx="60" cy="32" rx="27" ry="3.8" fill="#F2E8D6" />
      <ellipse cx="60" cy="31.2" rx="26" ry="2.8" fill="#FEF7EC" />
      <ellipse cx="48" cy="30.5" rx="10" ry="1.2" fill="#FFFFFF" />
    </template>

    <!-- ================================================== FRUITY -->
    <template v-else-if="tier === 'fruity'">
      <ellipse cx="60" cy="112" rx="30" ry="4" fill="#000000" opacity="0.15" />
      <path d="M26 30 Q22 56 34 80 L36 102 Q36 108 60 108 Q84 108 84 102 L86 80 Q98 56 94 30 Z" fill="#FFFFFF" stroke="#1F2937" stroke-width="3" stroke-linejoin="round" paint-order="stroke" />
      <path d="M36 79 L38 101 Q38 106 60 106 Q82 106 82 101 L84 79 Q72 85 60 85 Q48 85 36 79Z" :fill="c.y" />
      <path d="M36 79 Q48 82 60 82 Q72 82 84 79" :stroke="c.yHi" stroke-width="2" fill="none" />
      <ellipse cx="60" cy="30" rx="32" ry="5" fill="#8FA0B0" stroke="#1F2937" stroke-width="3" paint-order="stroke" />
      <ellipse cx="60" cy="28" rx="32" ry="4.4" fill="#E4EAEF" />
      <ellipse cx="60" cy="27.2" rx="31" ry="3.2" fill="#F6F8FA" />

      <!-- Strawberry ×3 -->
      <g v-for="(b, i) in strawberries" :key="i" :transform="`translate(${b.x} ${b.y}) scale(${b.s})`">
        <ellipse cx="0.5" cy="9" rx="7.5" ry="1.3" fill="#000" opacity="0.12" />
        <path d="M-9 -3 Q-9 -12 0 -12 Q9 -12 9 -3 Q9 6 0 10 Q-9 6 -9 -3Z" :fill="c.sh" stroke="#1F2937" stroke-width="2" paint-order="stroke" />
        <path d="M-8 -3 Q-8 -11 0 -11 Q8 -11 8 -3 Q8 5 0 9 Q-8 5 -8 -3Z" :fill="c.base" />
        <path d="M-6 -5 Q-6 -10 -1 -10 Q3 -10 5 -6" :fill="c.hi" />
        <ellipse cx="-3" cy="-7" rx="2.4" ry="1.3" fill="#FFFFFF" opacity="0.85" />
        <ellipse cx="-4" cy="-4" rx="0.8" ry="1.3" :fill="c.dk" />
        <ellipse cx="2" cy="-5" rx="0.8" ry="1.3" :fill="c.dk" />
        <ellipse cx="-1" cy="-1" rx="0.8" ry="1.3" :fill="c.dk" />
        <ellipse cx="4" cy="0" rx="0.8" ry="1.3" :fill="c.dk" />
        <ellipse cx="-3" cy="2" rx="0.8" ry="1.3" :fill="c.dk" />
        <ellipse cx="2" cy="4" rx="0.8" ry="1.3" :fill="c.dk" />
        <path d="M-7 -10 L-4 -15 L-1 -11 L2 -16 L5 -11 L7 -14 L6 -9 Z" fill="#166534" stroke="#1F2937" stroke-width="1.5" paint-order="stroke" />
        <path d="M-6 -10 L-4 -14 L-1 -11 L2 -15 L5 -11 L6 -13 L5 -9 Z" fill="#22C55E" />
      </g>

      <g transform="translate(50 10)">
        <path d="M0 0 Q-2 -4 -1 -8 Q1 -9 2.5 -5 Q1.5 -1 0 0Z" fill="#22C55E" stroke="#166534" stroke-width="1" />
        <path d="M0 -1 Q-1 -4 -0.5 -7" stroke="#166534" stroke-width="0.6" fill="none" />
      </g>

    </template>

    <!-- ================================================== GRANOLA -->
    <template v-else-if="tier === 'granola'">
      <ellipse cx="60" cy="106" rx="48" ry="5" fill="#000000" opacity="0.15" />
      <path d="M8 52 Q8 98 60 98 Q112 98 112 52 Z" fill="#8B5A2B" stroke="#1F2937" stroke-width="3" stroke-linejoin="round" paint-order="stroke" />
      <path d="M10 53 Q10 97 60 97 Q110 97 110 53 Z" fill="#F5D9B1" />
      <path d="M16 55 Q18 90 60 92 Q102 90 104 55" stroke="#B8926A" stroke-width="2" opacity="0.6" fill="none" />
      <ellipse cx="60" cy="52" rx="50" ry="6" fill="#A6763E" stroke="#1F2937" stroke-width="3" paint-order="stroke" />
      <ellipse cx="60" cy="50" rx="50" ry="5.2" fill="#F5D9B1" />
      <ellipse cx="60" cy="50" rx="48" ry="4.4" fill="#FEF3E0" />
      <ellipse cx="60" cy="49" rx="46" ry="3.6" fill="#FFFFFF" />
      <ellipse cx="35" cy="48" rx="12" ry="1.4" fill="#FFFFFF" />

      <g>
        <circle cx="24" cy="47" r="4" :fill="c.sh" stroke="#1F2937" stroke-width="1.5" paint-order="stroke" />
        <ellipse cx="22" cy="45" rx="1.2" ry="0.8" :fill="c.hi" opacity="0.6" />
        <circle cx="38" cy="45" r="4.5" :fill="c.base" stroke="#1F2937" stroke-width="1.5" paint-order="stroke" />
        <ellipse cx="36" cy="43" rx="1.3" ry="0.9" :fill="c.hi" opacity="0.6" />
        <circle cx="54" cy="47" r="4" :fill="c.sh" stroke="#1F2937" stroke-width="1.5" paint-order="stroke" />
        <ellipse cx="52" cy="45" rx="1.2" ry="0.8" :fill="c.hi" opacity="0.6" />
        <circle cx="70" cy="45" r="4.5" :fill="c.base" stroke="#1F2937" stroke-width="1.5" paint-order="stroke" />
        <ellipse cx="68" cy="43" rx="1.3" ry="0.9" :fill="c.hi" opacity="0.6" />
        <circle cx="86" cy="47" r="4" :fill="c.sh" stroke="#1F2937" stroke-width="1.5" paint-order="stroke" />
        <ellipse cx="84" cy="45" rx="1.2" ry="0.8" :fill="c.hi" opacity="0.6" />
        <circle cx="98" cy="46" r="3.2" :fill="c.base" stroke="#1F2937" stroke-width="1.5" paint-order="stroke" />
      </g>

      <path d="M18 32 Q30 38 40 32 Q52 26 62 32 Q74 38 84 32 Q96 26 100 32" :stroke="c.sh" stroke-width="6" stroke-linecap="round" fill="none" />
      <path d="M18 32 Q30 38 40 32 Q52 26 62 32 Q74 38 84 32 Q96 26 100 32" :stroke="c.base" stroke-width="4.5" stroke-linecap="round" fill="none" />
      <path d="M20 31 Q30 36 42 31 Q54 26 64 31 Q76 36 86 31" :stroke="c.hi" stroke-width="1.4" stroke-linecap="round" fill="none" />

      <ellipse cx="46" cy="39" rx="2" ry="3" :fill="c.sh" />
      <ellipse cx="46" cy="38.5" rx="1.5" ry="2.5" :fill="c.base" />
      <ellipse cx="45.5" cy="37.5" rx="0.6" ry="1" :fill="c.hi" />
      <ellipse cx="72" cy="38" rx="1.5" ry="2.3" :fill="c.sh" />
      <ellipse cx="72" cy="37.5" rx="1.1" ry="1.9" :fill="c.base" />
      <ellipse cx="71.7" cy="36.7" rx="0.4" ry="0.8" :fill="c.hi" />
    </template>

    <!-- ================================================== PARFAIT -->
    <template v-else-if="tier === 'parfait'">
      <ellipse cx="60" cy="114" rx="26" ry="3" fill="#000000" opacity="0.15" />
      <ellipse cx="60" cy="110" rx="22" ry="4.5" fill="#8E253D" stroke="#1F2937" stroke-width="2.5" paint-order="stroke" />
      <ellipse cx="60" cy="108" rx="22" ry="3.8" fill="#F8DDE3" />
      <ellipse cx="60" cy="107.3" rx="21" ry="2.8" fill="#FFFFFF" />
      <path d="M44 108 L76 108 L72 106 L48 106Z" :fill="c.hi" opacity="0.5" />
      <rect x="55" y="84" width="10" height="22" fill="#F8DDE3" />
      <rect x="54" y="84" width="12" height="22" fill="none" :stroke="c.base" stroke-width="1.5" />
      <rect x="54" y="84" width="12" height="22" fill="none" stroke="#1F2937" stroke-width="2" />
      <rect x="57" y="84" width="2" height="22" fill="#FFFFFF" opacity="0.9" />
      <rect x="64" y="84" width="1.2" height="22" :fill="c.sh" opacity="0.3" />
      <path d="M24 26 L34 88 L86 88 L96 26 Z" :fill="c.base" stroke="#1F2937" stroke-width="3" stroke-linejoin="round" paint-order="stroke" />

      <path d="M35 81 L36 87 L84 87 L85 81 Z" fill="#8B5A2B" />
      <circle cx="42" cy="84" r="1.3" fill="#C58A2C" />
      <circle cx="52" cy="84" r="1.1" fill="#E0A420" />
      <circle cx="62" cy="84" r="1.3" fill="#C58A2C" />
      <circle cx="72" cy="84" r="1.1" fill="#E0A420" />
      <circle cx="80" cy="84" r="1" fill="#C58A2C" />

      <path d="M33 66 L35 81 L85 81 L87 66 Z" :fill="c.sh" />
      <path d="M33 66 L34 72 L86 72 L87 66 Z" :fill="c.base" />
      <path d="M35 68 L37 70 L84 70 L86 68" :stroke="c.hi" stroke-width="1" opacity="0.7" fill="none" />

      <path d="M31 54 L33 66 L87 66 L89 54 Z" fill="#FFFBFB" />
      <path d="M31 54 L32 59 L88 59 L89 54 Z" fill="#FFFFFF" />
      <circle cx="46" cy="61" r="2" :fill="c.base" />
      <circle cx="46" cy="61" r="1.6" :fill="c.hi" />
      <circle cx="72" cy="61" r="1.7" :fill="c.base" />
      <circle cx="72" cy="61" r="1.3" :fill="c.hi" />

      <path d="M29 42 L31 54 L89 54 L91 42 Z" :fill="c.sh" />
      <path d="M29 42 L30 48 L90 48 L91 42 Z" :fill="c.base" />
      <path d="M31 44 L33 46 L88 46 L90 44" :stroke="c.hi" stroke-width="1" opacity="0.7" fill="none" />

      <path d="M27 28 L29 42 L91 42 L93 28 Z" fill="#FFFBFB" />
      <path d="M27 28 L28 34 L92 34 L93 28 Z" fill="#FFFFFF" />

      <circle cx="42" cy="28" r="3.5" :fill="c.sh" />
      <circle cx="42" cy="28" r="3" :fill="c.base" />
      <ellipse cx="41" cy="27" r="0.9" :fill="c.hi" />
      <circle cx="72" cy="26" r="3" :fill="c.sh" />
      <circle cx="72" cy="26" r="2.5" :fill="c.base" />
      <ellipse cx="71" cy="25" r="0.7" :fill="c.hi" />

      <path d="M22 26 Q24 14 30 18 Q34 8 40 16 Q48 4 56 14 Q60 0 66 12 Q72 0 78 14 Q84 6 88 16 Q94 10 98 26 Q90 18 82 26 Q74 16 66 26 Q58 16 50 26 Q42 16 34 26 Q28 18 22 26Z" :fill="c.y" stroke="#1F2937" stroke-width="2" stroke-linejoin="round" paint-order="stroke" />
      <path d="M24 26 Q26 16 32 20 Q36 10 42 18 Q50 8 58 16 Q62 6 68 14 Q74 4 80 16 Q86 10 90 20 Q94 14 96 26 Q88 20 80 26 Q72 18 64 26 Q56 18 48 26 Q40 18 32 26 Q28 20 24 26Z" fill="#FFFFFF" />
      <path d="M34 20 Q38 14 42 20" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <path d="M50 16 Q54 10 58 16" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <path d="M66 16 Q70 10 74 16" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <path d="M80 20 Q84 14 88 20" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <ellipse cx="40" cy="16" rx="2.5" ry="1" fill="#FFFFFF" />
      <ellipse cx="72" cy="14" rx="2.5" ry="1" fill="#FFFFFF" />

      <ellipse cx="60" cy="14" rx="6.5" ry="1.4" fill="#000" opacity="0.1" />
      <circle cx="60" cy="9" r="6.5" :fill="c.dk" stroke="#1F2937" stroke-width="2" paint-order="stroke" />
      <circle cx="60" cy="9" r="5.8" :fill="c.base" />
      <path d="M55 5 Q55 3 58 3 Q62 3 62 6" fill="#FFFFFF" />
      <ellipse cx="57" cy="5.5" rx="2.2" ry="1.4" fill="#FFFFFF" opacity="0.9" />
      <path d="M60 3 Q62 -2 68 -4" stroke="#2D5A3F" stroke-width="2.2" stroke-linecap="round" fill="none" />
      <path d="M68 -4 Q70 -5 73 -5" stroke="#4ADE80" stroke-width="1.6" stroke-linecap="round" fill="none" />

    </template>

    <!-- ================================================== SIGNATURE -->
    <template v-else-if="tier === 'signature'">
      <ellipse cx="60" cy="114" rx="30" ry="4" fill="#000000" opacity="0.2" />
      <ellipse cx="60" cy="110" rx="26" ry="4.5" fill="#8B5F08" stroke="#1F2937" stroke-width="2.5" paint-order="stroke" />
      <ellipse cx="60" cy="108" rx="26" ry="4" fill="#E8B028" />
      <ellipse cx="60" cy="107" rx="25" ry="3" fill="#FFD964" />
      <path d="M36 108 L84 108 L78 105 L42 105Z" fill="#FFFBDC" opacity="0.8" />
      <path d="M54 76 L56 108 L64 108 L66 76 Z" fill="#8B5F08" stroke="#1F2937" stroke-width="2.5" stroke-linejoin="round" paint-order="stroke" />
      <rect x="55" y="76" width="10" height="32" fill="#E8B028" />
      <rect x="56.5" y="76" width="3" height="32" fill="#FFD964" />
      <rect x="62" y="76" width="1.5" height="32" fill="#8B5F08" opacity="0.6" />
      <ellipse cx="60" cy="86" rx="9" ry="4" fill="#8B5F08" stroke="#1F2937" stroke-width="2" paint-order="stroke" />
      <ellipse cx="60" cy="84" rx="9" ry="3.5" fill="#E8B028" />
      <ellipse cx="60" cy="83" rx="8" ry="2.4" fill="#FFD964" />
      <ellipse cx="56" cy="82.5" rx="3" ry="1" fill="#FFFBDC" />
      <path d="M16 24 Q18 52 28 66 Q40 76 60 76 Q80 76 92 66 Q102 52 104 24 Z" fill="#8B5F08" stroke="#1F2937" stroke-width="3" stroke-linejoin="round" paint-order="stroke" />
      <path d="M18 25 Q20 52 30 66 Q40 75 60 75 Q80 75 90 66 Q100 52 102 25 Z" fill="#F7E6A5" />
      <path d="M20 26 Q22 52 32 64 Q42 72 60 72 Q78 72 88 64 Q98 52 100 26 Q80 30 60 30 Q40 30 20 26Z" fill="#FAEAB1" opacity="0.8" />
      <ellipse cx="60" cy="24" rx="36" ry="5" fill="#8B5F08" stroke="#1F2937" stroke-width="3" paint-order="stroke" />
      <ellipse cx="60" cy="22" rx="36" ry="4.6" fill="#E8B028" />
      <ellipse cx="60" cy="21" rx="36" ry="3.5" fill="#FFD964" />
      <ellipse cx="40" cy="20.5" rx="12" ry="1.6" fill="#FFFBDC" />
      <ellipse cx="60" cy="22" rx="32" ry="3.4" fill="#0A0A0C" />
      <ellipse cx="60" cy="21.2" rx="31" ry="2" fill="#2E2E34" />
      <ellipse cx="48" cy="20.8" rx="10" ry="0.8" fill="#4A4A52" opacity="0.8" />
      <path d="M21 26 Q23 50 32 62 Q42 70 60 70 Q78 70 88 62 Q97 50 99 26 Q80 32 60 32 Q40 32 21 26Z" fill="#0A0A0C" />

      <g>
        <path d="M32 38 L35 35 L37 38 L35 41Z" fill="#FFD964" />
        <circle cx="46" cy="40" r="1.6" fill="#E8B028" />
        <path d="M58 36 L61 33 L63 36 L61 39Z" fill="#FFD964" />
        <circle cx="74" cy="42" r="1.7" fill="#E8B028" />
        <path d="M86 36 L89 33 L91 36 L89 39Z" fill="#FFD964" />
        <circle cx="50" cy="54" r="1" fill="#E8B028" />
        <circle cx="72" cy="56" r="1" fill="#FFD964" />
        <circle cx="60" cy="50" r="1.2" fill="#E8B028" />
      </g>

      <g transform="translate(60 12)">
        <ellipse cx="0" cy="-7" rx="5" ry="5.5" :fill="c.sh" stroke="#1F2937" stroke-width="2" paint-order="stroke" />
        <ellipse cx="-6" cy="-1" rx="5.5" ry="5" :fill="c.sh" stroke="#1F2937" stroke-width="2" paint-order="stroke" />
        <ellipse cx="6" cy="-1" rx="5.5" ry="5" :fill="c.sh" stroke="#1F2937" stroke-width="2" paint-order="stroke" />
        <ellipse cx="-3" cy="5" rx="5" ry="4.5" :fill="c.sh" stroke="#1F2937" stroke-width="2" paint-order="stroke" />
        <ellipse cx="3" cy="5" rx="5" ry="4.5" :fill="c.sh" stroke="#1F2937" stroke-width="2" paint-order="stroke" />
        <ellipse cx="0" cy="-7" rx="4" ry="4.5" :fill="c.base" />
        <ellipse cx="-6" cy="-1" rx="4.5" ry="4" :fill="c.base" />
        <ellipse cx="6" cy="-1" rx="4.5" ry="4" :fill="c.base" />
        <ellipse cx="-3" cy="5" rx="4" ry="3.5" :fill="c.base" />
        <ellipse cx="3" cy="5" rx="4" ry="3.5" :fill="c.base" />
        <ellipse cx="-1" cy="-8" rx="1.8" ry="2.5" :fill="c.hi" />
        <ellipse cx="-7" cy="-2" rx="2" ry="1.8" :fill="c.hi" />
        <ellipse cx="5" cy="-2" rx="2" ry="1.8" :fill="c.hi" />
        <circle r="2.8" fill="#8B5F08" stroke="#1F2937" stroke-width="1.5" paint-order="stroke" />
        <circle r="2" fill="#FFFBDC" />
        <circle r="0.8" fill="#E8B028" />
      </g>
    </template>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tier: {
    type: String,
    required: true,
    validator: (v) => ['plain', 'fruity', 'granola', 'parfait', 'signature'].includes(v),
  },
  color: {
    type: String,
    default: 'white',
    validator: (v) => ['white', 'red', 'blue', 'violet', 'gold'].includes(v),
  },
  size: {
    type: [Number, String],
    default: 48,
  },
})

const RANK_COLORS = {
  white:  { base:'#F5F5F7', hi:'#FFFFFF', sh:'#D1D5DB', dk:'#6B7280', y:'#FFFFFF',  yHi:'#FFFFFF' },
  red:    { base:'#EF4444', hi:'#FCA5A5', sh:'#B91C1C', dk:'#7F1D1D', y:'#FEE2E2',  yHi:'#FEF2F2' },
  blue:   { base:'#3B82F6', hi:'#93C5FD', sh:'#1D4ED8', dk:'#1E3A8A', y:'#DBEAFE',  yHi:'#EFF6FF' },
  violet: { base:'#A855F7', hi:'#D8B4FE', sh:'#7E22CE', dk:'#581C87', y:'#F3E8FF',  yHi:'#FAF5FF' },
  gold:   { base:'#F59E0B', hi:'#FCD34D', sh:'#D97706', dk:'#78350F', y:'#FEF3C7',  yHi:'#FFFBEB' },
}

const c = computed(() => RANK_COLORS[props.color] || RANK_COLORS.white)

const strawberries = [
  { x: 38, y: 24, s: 0.95 },
  { x: 60, y: 18, s: 1.15 },
  { x: 82, y: 24, s: 0.95 },
]

const ariaLabel = computed(() => `${props.tier} tier (${props.color})`)
</script>

<style scoped>
svg { display: block; }
</style>
