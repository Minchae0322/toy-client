import { ref } from 'vue'

const bursts = ref([])
const pills = ref([])
let seq = 0

const BURST_MS = 1400
const PILL_MS = 2600
const CAP_ONLY_MS = 3000

function pushBurst(amount) {
  const id = ++seq
  bursts.value.push({ id, amount })
  setTimeout(() => {
    bursts.value = bursts.value.filter(b => b.id !== id)
  }, BURST_MS)
}

function pushPill(payload, ttl) {
  const id = ++seq
  pills.value.push({ id, ...payload })
  setTimeout(() => {
    pills.value = pills.value.filter(p => p.id !== id)
  }, ttl)
}

/**
 * EXP 지급 피드백 표시
 * @param {{amount:number, capped:boolean}|null} expGrant
 * @param {{mode?: 'full'|'burst-only'}} [options]
 *  - full: 플로팅 Burst + pill 토스트 (피드 작성·미션 claim·스트릭 마일스톤 같은 굵직한 액션)
 *  - burst-only: Burst만 (댓글·투표 등 빈도 높은 액션)
 *  - capped: true && amount === 0 인 경우 cap 안내 pill만 표시
 */
export function showExpGrant(expGrant, options = {}) {
  if (!expGrant) return
  const mode = options.mode || 'full'
  const { amount = 0, capped = false } = expGrant

  if (amount > 0) {
    pushBurst(amount)
    if (mode === 'full') {
      pushPill({ amount, capped, variant: capped ? 'capped-hit' : 'gain' }, PILL_MS)
    } else if (capped) {
      pushPill({ amount: 0, capped: true, variant: 'cap-only' }, CAP_ONLY_MS)
    }
    return
  }

  if (capped) {
    pushPill({ amount: 0, capped: true, variant: 'cap-only' }, CAP_ONLY_MS)
  }
}

export function useExpToast() {
  return { bursts, pills, showExpGrant }
}
