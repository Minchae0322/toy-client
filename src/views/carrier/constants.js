import { CARRIER_TYPE } from '@/services/CarrierService.js'

// ==================== 데코 상수 ====================
export const DMIN = 0.6
export const DMAX = 2.5
export const DSTEP = 0.2
export const DECO_BASE = 36
export const DECO_FONT = 24

// ==================== 레이아웃 상수 ====================
export const IW = 110
export const G = 8
export const MIN_R = 28
export const MAX_R = 80
export const SLOT_COUNT = 2

// ==================== 캐리어 뷰박스 ====================
export const CVB = { x1: 30, y1: 50, x2: 270, y2: 370, vw: 300, vh: 400 }

// ==================== 컬러 ====================
export const DEFAULT_COLORS = [
  { id: 'violet', label: '바이올렛', dot: '#7c3aed', body: { grad1: '#f5f3ff', grad2: '#e4dff2', stroke: '#7c3aed' }, groove: { fill: '#ebe8f4', stroke: '#d4d0e8' }, handle: { fill: '#d8d2ea', stroke: '#7c3aed', grip: '#ece9f5' }, wheel: { fill: '#d8d2ea', stroke: '#7c3aed', hub: '#7c3aed', inner: '#ece9f5' } },
  { id: 'pink', label: '핑크', dot: '#ec4899', body: { grad1: '#fdf2f8', grad2: '#fce7f3', stroke: '#ec4899' }, groove: { fill: '#fce7f3', stroke: '#fbcfe8' }, handle: { fill: '#fbcfe8', stroke: '#ec4899', grip: '#fce7f3' }, wheel: { fill: '#fbcfe8', stroke: '#ec4899', hub: '#ec4899', inner: '#fce7f3' } },
  { id: 'sky', label: '스카이', dot: '#0ea5e9', body: { grad1: '#f0f9ff', grad2: '#e0f2fe', stroke: '#0ea5e9' }, groove: { fill: '#e0f2fe', stroke: '#bae6fd' }, handle: { fill: '#bae6fd', stroke: '#0ea5e9', grip: '#e0f2fe' }, wheel: { fill: '#bae6fd', stroke: '#0ea5e9', hub: '#0ea5e9', inner: '#e0f2fe' } },
  { id: 'yellow', label: '옐로우', dot: '#eab308', body: { grad1: '#fefce8', grad2: '#fef9c3', stroke: '#eab308' }, groove: { fill: '#fef9c3', stroke: '#fde68a' }, handle: { fill: '#fde68a', stroke: '#eab308', grip: '#fef9c3' }, wheel: { fill: '#fde68a', stroke: '#eab308', hub: '#eab308', inner: '#fef9c3' } }
]

// ==================== 스킨 ====================
export const BASE_SKINS = [
  { id: 'default', name: '기본', desc: '클래식 바이올렛', special: false, body: { grad1: '#f5f3ff', grad2: '#e4dff2', stroke: '#7c3aed' }, groove: { fill: '#ebe8f4', stroke: '#d4d0e8' }, handle: { fill: '#d8d2ea', stroke: '#7c3aed', grip: '#ece9f5' }, wheel: { fill: '#d8d2ea', stroke: '#7c3aed', hub: '#7c3aed', inner: '#ece9f5' }, stickers: [] },
  { id: 'retro', name: '레트로 트래블', desc: '빈티지 여행', special: false, body: { grad1: '#fefce8', grad2: '#fef3c7', stroke: '#b45309' }, groove: { fill: '#fef9c3', stroke: '#fde68a' }, handle: { fill: '#fcd34d', stroke: '#b45309', grip: '#fef9c3' }, wheel: { fill: '#fcd34d', stroke: '#b45309', hub: '#b45309', inner: '#fef9c3' }, stickers: [{ type: 'stamp', x: 90, y: 140, label: 'PARIS', color: '#dc2626' }, { type: 'stamp', x: 195, y: 210, label: 'TOKYO', color: '#2563eb' }, { type: 'stamp', x: 120, y: 290, label: 'NYC', color: '#16a34a' }] },
  { id: 'space', name: '스페이스', desc: '은하계 탐험', special: false, body: { grad1: '#1e1b4b', grad2: '#0f0a2e', stroke: '#6366f1' }, groove: { fill: '#1e1b4b', stroke: '#4338ca' }, handle: { fill: '#312e81', stroke: '#818cf8', grip: '#1e1b4b' }, wheel: { fill: '#312e81', stroke: '#818cf8', hub: '#a5b4fc', inner: '#1e1b4b' }, stickers: [{ type: 'star', x: 80, y: 110, size: 6 }, { type: 'star', x: 220, y: 140, size: 4 }, { type: 'star', x: 150, y: 180, size: 7 }, { type: 'planet', x: 190, y: 230 }] },
  { id: 'kitty', name: '핑크리본', desc: '리본과 하트', special: true, body: { grad1: '#fff', grad2: '#fff8f9', stroke: '#dc2626' }, groove: { fill: '#fee2e2', stroke: '#fca5a5' }, handle: { fill: '#fca5a5', stroke: '#dc2626', grip: '#fee2e2' }, wheel: { fill: '#fca5a5', stroke: '#dc2626', hub: '#dc2626', inner: '#fee2e2' }, stickers: [{ type: 'bigbow', x: 220, y: 90 }, { type: 'smallheart', x: 75, y: 120 }, { type: 'smallheart', x: 180, y: 160 }, { type: 'smallheart', x: 95, y: 210 }, { type: 'smallheart', x: 220, y: 230 }, { type: 'smallheart', x: 140, y: 270 }] }
]

// ==================== 스티커팩 ====================
export const STICKER_PACKS = {
  basic: [
    { id: 'b1', emoji: '💟' }, { id: 'b2', emoji: '🤍' }, { id: 'b3', emoji: '🫧' }, { id: 'b4', emoji: '⚪' },
    { id: 'b5', emoji: '➰' }, { id: 'b6', emoji: '〰️' }, { id: 'b7', emoji: '➿' }, { id: 'b8', emoji: '💭' },
    { id: 'b9', emoji: '🍒' }, { id: 'b10', emoji: '🎀' }, { id: 'b11', emoji: '✨' }, { id: 'b12', emoji: '🧸' },
    { id: 'b13', emoji: '🎄' }, { id: 'b14', emoji: '💐' }, { id: 'b15', emoji: '🐧' }, { id: 'b16', emoji: '☑️' }
  ],
  travel: [
    { id: 't1', emoji: '🕶️' }, { id: 't2', emoji: '👙' }, { id: 't3', emoji: '🧢' }, { id: 't4', emoji: '🎧' },
    { id: 't5', emoji: '📷' }, { id: 't6', emoji: '🪞' }, { id: 't7', emoji: '🏝️' }, { id: 't8', emoji: '🏖️' },
    { id: 't9', emoji: '🗼' }, { id: 't10', emoji: '🗽' }, { id: 't11', emoji: '🏜️' }, { id: 't12', emoji: '🌉' }
  ],
  food: [
    { id: 'f1', emoji: '🍳' }, { id: 'f2', emoji: '🍕' }, { id: 'f3', emoji: '🍔' }, { id: 'f4', emoji: '🥐' },
    { id: 'f5', emoji: '🥖' }, { id: 'f6', emoji: '🥫' }, { id: 'f7', emoji: '🍜' }, { id: 'f8', emoji: '🍣' },
    { id: 'f9', emoji: '🍰' }, { id: 'f10', emoji: '🍫' }, { id: 'f11', emoji: '☕' }, { id: 'f12', emoji: '🍵' },
    { id: 'f13', emoji: '🍸' }, { id: 'f14', emoji: '🍺' }, { id: 'f15', emoji: '🧋' }, { id: 'f16', emoji: '🍇' },
    { id: 'f17', emoji: '🍉' }, { id: 'f18', emoji: '🍒' }, { id: 'f19', emoji: '🥭' }, { id: 'f20', emoji: '🍓' }
  ],
  weather: [
    { id: 'w1', emoji: '☁️' }, { id: 'w2', emoji: '⛅' }, { id: 'w3', emoji: '🌤️' }, { id: 'w4', emoji: '🌥️' },
    { id: 'w5', emoji: '🌦️' }, { id: 'w6', emoji: '🌧️' }, { id: 'w7', emoji: '🌨️' }, { id: 'w8', emoji: '🌫️' },
    { id: 'w9', emoji: '🌠' }, { id: 'w10', emoji: '🌂' }, { id: 'w11', emoji: '☂️' }, { id: 'w12', emoji: '☔' },
    { id: 'w13', emoji: '🌀' }, { id: 'w14', emoji: '⭐' }, { id: 'w15', emoji: '🌟' }, { id: 'w16', emoji: '☀️' },
    { id: 'w17', emoji: '🔥' }, { id: 'w18', emoji: '❄️' }, { id: 'w19', emoji: '☃️' }, { id: 'w20', emoji: '⛄' }
  ],
  special: [
    { id: 'sp-phototag', emoji: '📷', type: 'phototag', label: '포토택' }
  ]
}

export const PACK_LABELS = [['basic', '기본'], ['travel', '여행'], ['food', '푸드'], ['weather', '날씨']]
export const SPECIAL_PACK = ['special', '스페셜']

// ==================== 공유 배경색 ====================
export const SHARE_BG = { '#7c3aed': '#e5e1f7', '#ec4899': '#f9ecf1', '#0ea5e9': '#f1f8fe', '#eab308': '#fef8e1', '#b45309': '#fef3e1', '#6366f1': '#e0dff7', '#dc2626': '#fce5e5' }

// ==================== 스킨 타입 매핑 ====================
export const SKIN_TYPE_MAP = Object.fromEntries(
  Object.values(CARRIER_TYPE).map(t => [t, t.toLowerCase()])
)
export const SKIN_TYPE_REVERSE = Object.fromEntries(
  Object.values(CARRIER_TYPE).map(t => [t.toLowerCase(), t])
)

export function skinColorToColorId(hex) {
  const map = { '#7c3aed': 'violet', '#ec4899': 'pink', '#0ea5e9': 'sky', '#eab308': 'yellow' }
  return map[hex?.toLowerCase()] || 'violet'
}

export function colorIdToSkinColor(id) {
  const map = { violet: '#7c3aed', pink: '#ec4899', sky: '#0ea5e9', yellow: '#eab308' }
  return map[id] || '#7c3aed'
}

// ==================== 유틸 ====================
export function getBounds(W, H) {
  const sx = W / CVB.vw, sy = H / CVB.vh, sc = Math.min(sx, sy)
  const ox = (W - CVB.vw * sc) / 2, oy = (H - CVB.vh * sc) / 2
  return { left: ox + CVB.x1 * sc, top: oy + CVB.y1 * sc, right: ox + CVB.x2 * sc, bottom: oy + CVB.y2 * sc }
}

export function getRankStyle(r, t) {
  if (r === 1) return { bg: 'linear-gradient(135deg,#7c3aed,#a78bfa)', border: '#7c3aed', glow: 'rgba(124,58,237,0.25)', tc: '#fff', sc: 'rgba(255,255,255,0.75)' }
  if (r === 2) return { bg: 'linear-gradient(135deg,#8b5cf6,#c4b5fd)', border: '#8b5cf6', glow: 'rgba(139,92,246,0.2)', tc: '#fff', sc: 'rgba(255,255,255,0.7)' }
  if (r === 3) return { bg: 'linear-gradient(135deg,#a78bfa,#ddd6fe)', border: '#a78bfa', glow: 'rgba(167,139,250,0.15)', tc: '#fff', sc: 'rgba(255,255,255,0.7)' }
  return {
    bg: `hsl(263,40%,${96 + Math.min(1, (r - 3) / Math.max(1, t - 3)) * 3}%)`,
    border: `hsl(263,30%,${88 + Math.min(1, (r - 3) / Math.max(1, t - 3)) * 6}%)`,
    glow: 'transparent', tc: '#555', sc: '#999'
  }
}
