<template>
  <div v-if="visible" class="creator-panel-root">
    <!-- Backdrop (모바일에서만 활성) -->
    <Transition name="fade">
      <div v-if="isOpen" class="backdrop" @click="isOpen = false" />
    </Transition>

    <!-- FAB -->
    <Transition name="fab">
      <button
        v-if="!isOpen"
        class="fab"
        :aria-label="'배틀 관리 열기'"
        @click="isOpen = true"
      >
        <svg class="fab-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span v-if="pendingItems.length > 0" class="fab-badge">
          {{ pendingItems.length > 99 ? '99+' : pendingItems.length }}
        </span>
        <span class="fab-label">관리</span>
      </button>
    </Transition>

    <!-- Panel -->
    <Transition name="panel">
      <section v-if="isOpen" class="panel" role="dialog" aria-label="배틀 관리">
        <!-- Header -->
        <header class="panel-header">
          <div class="panel-header-top">
            <div class="header-left">
              <div class="header-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div class="header-text">
                <div class="header-eyebrow">
                  <span class="creator-pill" :class="{ 'is-admin': !isCreator && isAdmin }">
                    <svg v-if="isCreator" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.39 7.36H22l-6.19 4.5 2.36 7.28L12 16.9l-6.17 4.24 2.36-7.28L2 9.36h7.61z"/>
                    </svg>
                    <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    {{ roleLabel }}
                  </span>
                </div>
                <div class="header-title">배틀 관리</div>
              </div>
            </div>
            <button class="icon-btn" aria-label="닫기" @click="isOpen = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Stats row -->
          <div class="stats-row">
            <div class="stat">
              <span class="stat-value">{{ pendingItems.length }}</span>
              <span class="stat-label">승인 대기</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">{{ activeItemsCount }}</span>
              <span class="stat-label">활성 아이템</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">{{ totalVotesCount }}</span>
              <span class="stat-label">총 요거픽</span>
            </div>
          </div>
        </header>

        <!-- Tabs — 승인 탭이 필요한 PUBLIC_APPROVAL일 때만 노출 -->
        <nav v-if="supportsApproval" class="panel-tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'approval' }"
            @click="activeTab = 'approval'"
          >
            <svg class="tab-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span class="tab-label">승인 대기</span>
            <span v-if="pendingItems.length > 0" class="tab-count">{{ pendingItems.length }}</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'manage' }"
            @click="activeTab = 'manage'"
          >
            <svg class="tab-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span class="tab-label">관리</span>
          </button>
        </nav>

        <!-- Body -->
        <div class="panel-body">
          <!-- 승인 탭 -->
          <template v-if="activeTab === 'approval' && supportsApproval">
            <div v-if="pendingLoading && pendingItems.length === 0" class="loading-state">
              <span class="btn-spinner dark"></span>
              <span class="loading-text">승인 대기 아이템을 불러오는 중…</span>
            </div>

            <div v-else-if="pendingItems.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div class="empty-title">모두 처리 완료!</div>
              <div class="empty-desc">대기 중인 아이템이 없어요.<br/>참여자가 새 아이템을 올리면 여기에 나타나요.</div>
            </div>

            <div v-else>
              <div class="list-header">
                <div class="list-header-title">승인 대기 중</div>
                <div class="list-header-caption">승인하면 투표 대상에 포함돼요</div>
              </div>
              <ul class="pending-list">
                <li
                  v-for="(item, idx) in pendingItems"
                  :key="item.id"
                  class="pending-item"
                  :style="{ '--i': idx }"
                >
                  <div class="pending-top">
                    <div class="pending-thumb">
                      <img v-if="getItemImage(item)" :src="getItemImage(item)" :alt="getItemName(item)" @error="onImgError($event)" />
                      <div v-else class="pending-thumb-fallback">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="9" cy="9" r="2"/>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                      </div>
                      <span class="pending-status-chip">검토 중</span>
                    </div>
                    <div class="pending-info">
                      <div class="pending-name">{{ getItemName(item) }}</div>
                      <div v-if="getItemBrand(item)" class="pending-brand">{{ getItemBrand(item) }}</div>
                      <div class="pending-meta">
                        <span v-if="item.submitterNickname || item.creatorNickname" class="pending-submitter">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          {{ item.submitterNickname || item.creatorNickname }}
                        </span>
                        <span v-if="item.createdAt" class="pending-time">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {{ formatTimeAgo(item.createdAt) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="pending-actions">
                    <button
                      class="action-btn reject"
                      :disabled="processingIds.has(item.id)"
                      @click="onReject(item)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      거절
                    </button>
                    <button
                      class="action-btn approve"
                      :disabled="processingIds.has(item.id)"
                      @click="onApprove(item)"
                    >
                      <span v-if="processingIds.has(item.id)" class="btn-spinner"></span>
                      <template v-else>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        승인
                      </template>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </template>

          <!-- 관리 탭 -->
          <template v-else>
            <!-- 메뉴 화면 -->
            <template v-if="manageView === 'menu'">
              <div class="manage-section">
                <div class="list-header">
                  <div class="list-header-title">배틀 관리</div>
                  <div class="list-header-caption">배틀 정보와 아이템을 관리해요</div>
                </div>
                <ul class="manage-list">
                  <li>
                    <button class="manage-item" @click="onEditBattle">
                      <div class="manage-icon manage-icon-ink">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 20h9"/>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                      </div>
                      <div class="manage-text">
                        <div class="manage-title">배틀 상세 수정</div>
                        <div class="manage-desc">제목, 설명, 기간을 변경해요</div>
                      </div>
                      <svg class="manage-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  </li>
                  <li>
                    <button class="manage-item" @click="manageView = 'items'">
                      <div class="manage-icon manage-icon-ink">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                        </svg>
                      </div>
                      <div class="manage-text">
                        <div class="manage-title">아이템 관리</div>
                        <div class="manage-desc">등록된 아이템 {{ activeItemsCount }}개를 관리해요</div>
                      </div>
                      <svg class="manage-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  </li>
                </ul>
              </div>

              <div class="manage-section">
                <div class="list-header">
                  <div class="list-header-title">배틀 정보</div>
                </div>
                <div class="info-grid">
                  <div class="info-row">
                    <span class="info-label">상태</span>
                    <span class="info-value">
                      <span class="status-dot" :class="statusClass"></span>
                      {{ statusLabel }}
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">아이템 등록</span>
                    <span class="info-value">{{ permissionLabel }}</span>
                  </div>
                  <div v-if="battle?.endDate" class="info-row">
                    <span class="info-label">종료일</span>
                    <span class="info-value">{{ formatDate(battle.endDate) }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- 아이템 관리 화면 -->
            <template v-else-if="manageView === 'items'">
              <div class="subview-header">
                <button class="back-btn" aria-label="뒤로" @click="manageView = 'menu'">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <div class="subview-title">
                  <div class="subview-title-main">아이템 관리</div>
                  <div class="subview-title-sub">제외하면 배틀에서 숨겨져요</div>
                </div>
              </div>

              <div v-if="activeItems.length === 0" class="empty-state">
                <div class="empty-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  </svg>
                </div>
                <div class="empty-title">활성 아이템이 없어요</div>
                <div class="empty-desc">등록된 활성 아이템이 있어야 관리할 수 있어요.</div>
              </div>

              <ul v-else class="pending-list">
                <li
                  v-for="(item, idx) in activeItems"
                  :key="item.id"
                  class="pending-item"
                  :style="{ '--i': idx }"
                >
                  <div class="pending-top">
                    <div class="pending-thumb">
                      <img v-if="getItemImage(item)" :src="getItemImage(item)" :alt="getItemName(item)" @error="onImgError($event)" />
                      <div v-else class="pending-thumb-fallback">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="9" cy="9" r="2"/>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                      </div>
                    </div>
                    <div class="pending-info">
                      <div class="pending-name">{{ getItemName(item) }}</div>
                      <div v-if="getItemBrand(item)" class="pending-brand">{{ getItemBrand(item) }}</div>
                      <div class="pending-meta">
                        <span class="pending-submitter">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 11l3 3L22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                          </svg>
                          투표 {{ item.voteCount || 0 }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="pending-actions">
                    <button
                      class="action-btn reject"
                      :disabled="processingIds.has(item.id)"
                      @click="onExclude(item)"
                    >
                      <span v-if="processingIds.has(item.id)" class="btn-spinner dark"></span>
                      <template v-else>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        제외
                      </template>
                    </button>
                  </div>
                </li>
              </ul>
            </template>
          </template>
        </div>
      </section>
    </Transition>

    <!-- Edit Modal -->
    <BattleEditModal
      :visible="showEditModal"
      :battle="battle"
      :battle-id="resolvedBattleId"
      @close="showEditModal = false"
      @updated="onBattleUpdated"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { battleService } from '@/services/BattleService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import BattleEditModal from '@/components/battle/detail/BattleEditModal.vue'

const props = defineProps({
  battle: { type: Object, required: true },
  battleId: { type: [String, Number], default: null },
  isCreator: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
})
const emit = defineEmits(['refresh'])

const { open } = useConfirmDialog()

const isOpen = ref(false)
const processingIds = ref(new Set())
const activeTab = ref('approval')
const showEditModal = ref(false)
const manageView = ref('menu')
const pendingItems = ref([])
const pendingLoading = ref(false)

const resolvedBattleId = computed(() => props.battleId ?? props.battle?.id ?? props.battle?.battleId)

const permissionType = computed(() => {
  const t = props.battle?.itemAddPermissionType
  return typeof t === 'string' ? t : t?.code || ''
})

const supportsApproval = computed(() => permissionType.value === 'PUBLIC_APPROVAL')

const visible = computed(() => (props.isCreator || props.isAdmin) && !!props.battle)

const roleLabel = computed(() => (props.isCreator ? '생성자' : props.isAdmin ? '관리자' : ''))

const allItems = computed(() => Array.isArray(props.battle?.items) ? props.battle.items : [])

const activeItems = computed(() => allItems.value.filter(it => {
  const s = it.status?.title || it.status
  return s === 'ACTIVE'
}))

const activeItemsCount = computed(() => allItems.value.filter(it => {
  const s = it.status?.title || it.status
  return s === 'ACTIVE'
}).length)

const totalVotesCount = computed(() => allItems.value.reduce((sum, it) => sum + (it.voteCount || 0), 0))

const statusLabel = computed(() => {
  const s = props.battle?.status?.title || props.battle?.status
  return battleService.getBattleStatusLabel?.(s) || s || '-'
})
const statusClass = computed(() => {
  const s = props.battle?.status?.title || props.battle?.status
  if (s === 'NORMAL' || s === 'ACTIVE') return 'ok'
  if (s === 'ENDED' || s === 'CLOSED') return 'off'
  return 'warn'
})

const permissionLabel = computed(() => {
  const p = permissionType.value
  if (p === 'CREATOR_ONLY') return '생성자만'
  if (p === 'PUBLIC_APPROVAL') return '승인 후 공개'
  if (p === 'PUBLIC_FREE') return '자유 등록'
  return '-'
})

watch(supportsApproval, (v) => {
  if (!v && activeTab.value === 'approval') activeTab.value = 'manage'
}, { immediate: true })

watch(activeTab, () => {
  manageView.value = 'menu'
})

watch(isOpen, (open) => {
  if (!open) manageView.value = 'menu'
})

async function loadPendingItems() {
  if (!resolvedBattleId.value) return
  if (!supportsApproval.value || !visible.value) {
    pendingItems.value = []
    return
  }
  pendingLoading.value = true
  try {
    const res = await battleService.getBattleItems(resolvedBattleId.value, { status: 'UNDER_REVIEW' })
    if (res?.success) {
      pendingItems.value = Array.isArray(res.data) ? res.data : []
    }
  } catch (e) {
    console.error('승인 대기 아이템 로드 실패:', e)
  } finally {
    pendingLoading.value = false
  }
}

watch(
  () => [visible.value, supportsApproval.value, resolvedBattleId.value],
  ([v, s, id]) => {
    if (v && s && id) loadPendingItems()
    else pendingItems.value = []
  },
  { immediate: true }
)

function getItemName(item) {
  if (!item) return '아이템'
  return item.customName || item.product?.name || item.name || '아이템'
}
function getItemBrand(item) {
  if (!item) return ''
  return item.customBrand || item.product?.brand || ''
}
function getItemImage(item) {
  if (!item) return null
  return item.customImageUrl
    || item.product?.thumbnailAttachmentInfo?.fileUrl
    || item.product?.thumbnailFile?.fileUrl
    || item.product?.imageUrl
    || null
}
function onImgError(e) {
  e.target.style.display = 'none'
}

function formatTimeAgo(iso) {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}일 전`
  return formatDate(iso)
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}.${m}.${day}`
}

async function onApprove(item) {
  if (processingIds.value.has(item.id)) return
  processingIds.value.add(item.id)
  try {
    const res = await battleService.approveBattleItem(resolvedBattleId.value, item.id)
    if (!res?.success) throw new Error(res?.message || '승인 실패')
    await loadPendingItems()
    emit('refresh')
  } catch (e) {
    await open({ type: 'alert', title: '오류', message: e?.message || '승인에 실패했어요.' })
  } finally {
    processingIds.value.delete(item.id)
  }
}

async function onReject(item) {
  if (processingIds.value.has(item.id)) return
  const ok = await open({
    type: 'danger',
    title: '아이템 거절',
    message: `"${getItemName(item)}" 을(를) 거절할까요?\n거절하면 배틀에 표시되지 않아요.`,
    confirmText: '거절하기',
    cancelText: '취소',
  })
  if (!ok) return
  processingIds.value.add(item.id)
  try {
    const res = await battleService.excludeBattleItem(resolvedBattleId.value, item.id)
    if (!res?.success) throw new Error(res?.message || '거절 실패')
    await loadPendingItems()
    emit('refresh')
  } catch (e) {
    await open({ type: 'alert', title: '오류', message: e?.message || '거절에 실패했어요.' })
  } finally {
    processingIds.value.delete(item.id)
  }
}

function onEditBattle() {
  isOpen.value = false
  showEditModal.value = true
}

async function onExclude(item) {
  if (processingIds.value.has(item.id)) return
  const ok = await open({
    type: 'danger',
    title: '아이템 제외',
    message: `"${getItemName(item)}" 을(를) 배틀에서 제외할까요?\n제외하면 투표 대상에서 사라져요.`,
    confirmText: '제외하기',
    cancelText: '취소',
  })
  if (!ok) return
  processingIds.value.add(item.id)
  try {
    const res = await battleService.excludeBattleItem(resolvedBattleId.value, item.id)
    if (!res?.success) throw new Error(res?.message || '제외 실패')
    emit('refresh')
  } catch (e) {
    await open({ type: 'alert', title: '오류', message: e?.message || '아이템 제외에 실패했어요.' })
  } finally {
    processingIds.value.delete(item.id)
  }
}

async function onBattleUpdated() {
  await open({ type: 'alert', title: '저장 완료', message: '배틀 정보가 수정되었어요.' })
  emit('refresh')
}
</script>

<style scoped>
.creator-panel-root {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 900;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 26, 0.32);
  backdrop-filter: blur(2px);
  z-index: -1;
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}
.fade-enter-from,
.fade-leave-to { opacity: 0; }

/* ===================== FAB ===================== */
.fab {
  position: relative;
  height: 56px;
  min-width: 56px;
  padding: 0 22px 0 20px;
  border-radius: 999px;
  border: none;
  background: #0A0E1A;
  color: #ffffff;
  cursor: pointer;
  box-shadow:
    0 12px 28px rgba(10, 14, 26, 0.28),
    0 4px 10px rgba(10, 14, 26, 0.14),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.18s ease, background 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
}
.fab:hover {
  transform: translateY(-2px);
  background: #17192a;
  box-shadow:
    0 16px 36px rgba(10, 14, 26, 0.32),
    0 6px 14px rgba(10, 14, 26, 0.16),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}
.fab:active { transform: translateY(0); }

.fab-icon { flex-shrink: 0; }
.fab-label {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.fab-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: #EF4444;
  color: #fff;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2.5px solid #0A0E1A;
  letter-spacing: -0.3px;
  font-variant-numeric: tabular-nums;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
}

.fab-enter-active,
.fab-leave-active {
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.18s ease;
}
.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: scale(0.85) translateY(10px);
}

/* ===================== Panel ===================== */
.panel {
  width: 440px;
  max-width: calc(100vw - 40px);
  height: 680px;
  max-height: calc(100vh - 120px);
  background: #ffffff;
  border-radius: 24px;
  box-shadow:
    0 32px 64px rgba(10, 14, 26, 0.22),
    0 8px 20px rgba(10, 14, 26, 0.08),
    inset 0 0 0 1px rgba(10, 14, 26, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.22s ease, transform 0.26s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(18px) scale(0.96);
}

/* ===================== Header ===================== */
.panel-header {
  padding: 22px 22px 16px;
  background: #ffffff;
  border-bottom: 1px solid #F1F3F6;
}
.panel-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #0A0E1A;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(10, 14, 26, 0.16);
}
.header-text { line-height: 1.25; }
.header-eyebrow { margin-bottom: 6px; }
.creator-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px 3px 7px;
  background: #F3EAFD;
  color: #7C3AED;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: -0.2px;
}
.creator-pill.is-admin {
  background: #E8F1FE;
  color: #1D63D1;
}
.header-title {
  font-size: 19px;
  font-weight: 800;
  color: #0A0E1A;
  letter-spacing: -0.4px;
}
.icon-btn {
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  border-radius: 10px;
  color: #8B95A1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s ease, color 0.12s ease;
  flex-shrink: 0;
}
.icon-btn:hover { background: #F7F8FA; color: #4E5968; }

.stats-row {
  margin-top: 16px;
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #FAFBFC;
  border-radius: 14px;
  border: 1px solid #F1F3F6;
}
.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.stat-value {
  font-size: 20px;
  font-weight: 800;
  color: #0A0E1A;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.stat-label {
  font-size: 10.5px;
  font-weight: 600;
  color: #8B95A1;
  letter-spacing: -0.2px;
}
.stat-divider {
  width: 1px;
  height: 26px;
  background: #EAEDF1;
}

/* ===================== Tabs ===================== */
.panel-tabs {
  display: flex;
  padding: 8px;
  gap: 4px;
  border-bottom: 1px solid #F1F3F6;
  background: #ffffff;
}
.tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 11px 12px;
  border: none;
  background: transparent;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 700;
  color: #8B95A1;
  cursor: pointer;
  transition: all 0.14s ease;
  letter-spacing: -0.3px;
  font-family: inherit;
}
.tab-btn:hover { color: #4E5968; background: #FAFBFC; }
.tab-btn.active {
  background: #0A0E1A;
  color: #ffffff;
}
.tab-btn.active .tab-icon { color: #ffffff; }
.tab-icon { color: #B0B8C1; flex-shrink: 0; }
.tab-count {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #EF4444;
  color: #fff;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.3px;
  font-variant-numeric: tabular-nums;
}
.tab-btn.active .tab-count {
  background: #ffffff;
  color: #EF4444;
}

/* ===================== Body ===================== */
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #FCFCFD;
  scrollbar-width: thin;
  scrollbar-color: #E5E8EC transparent;
}
.panel-body::-webkit-scrollbar { width: 6px; }
.panel-body::-webkit-scrollbar-thumb { background: #E5E8EC; border-radius: 3px; }
.panel-body::-webkit-scrollbar-track { background: transparent; }

.list-header {
  padding: 0 2px 12px;
}
.list-header-title {
  font-size: 13px;
  font-weight: 700;
  color: #0A0E1A;
  letter-spacing: -0.2px;
}
.list-header-caption {
  font-size: 11.5px;
  font-weight: 500;
  color: #8B95A1;
  letter-spacing: -0.2px;
  margin-top: 3px;
}

/* ===================== Loading state ===================== */
.loading-state {
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.loading-state .btn-spinner {
  width: 22px;
  height: 22px;
}
.loading-text {
  font-size: 12.5px;
  font-weight: 500;
  color: #8B95A1;
  letter-spacing: -0.2px;
}

/* ===================== Empty state ===================== */
.empty-state {
  padding: 64px 24px;
  text-align: center;
}
.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: #F7F8FA;
  color: #10B981;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-title {
  font-size: 15px;
  font-weight: 700;
  color: #0A0E1A;
  letter-spacing: -0.3px;
  margin-bottom: 6px;
}
.empty-desc {
  font-size: 12.5px;
  font-weight: 500;
  color: #8B95A1;
  letter-spacing: -0.2px;
  line-height: 1.55;
}

/* ===================== Pending list ===================== */
.pending-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pending-item {
  padding: 14px;
  background: #ffffff;
  border: 1px solid #F1F3F6;
  border-radius: 16px;
  transition: border-color 0.14s ease, box-shadow 0.14s ease, transform 0.14s ease;
  animation: item-in 0.32s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(var(--i, 0) * 40ms);
}
.pending-item:hover {
  border-color: #E5E8EC;
  box-shadow: 0 4px 14px rgba(10, 14, 26, 0.04);
}
@keyframes item-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.pending-top {
  display: flex;
  gap: 12px;
}
.pending-thumb {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  background: #F7F8FA;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pending-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pending-thumb-fallback { color: #C4C9D0; }
.pending-status-chip {
  position: absolute;
  left: 4px;
  bottom: 4px;
  padding: 2px 6px;
  background: rgba(245, 158, 11, 0.95);
  color: #ffffff;
  font-size: 9px;
  font-weight: 700;
  border-radius: 5px;
  letter-spacing: -0.2px;
  line-height: 1.2;
}

.pending-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.pending-name {
  font-size: 14px;
  font-weight: 700;
  color: #0A0E1A;
  letter-spacing: -0.2px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pending-brand {
  font-size: 12px;
  font-weight: 500;
  color: #4E5968;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pending-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 3px;
  font-size: 11px;
  font-weight: 500;
  color: #8B95A1;
  letter-spacing: -0.2px;
}
.pending-submitter,
.pending-time {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.pending-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.action-btn {
  flex: 1;
  height: 40px;
  padding: 0 14px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.14s ease;
  letter-spacing: -0.3px;
  font-family: inherit;
}
.action-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.action-btn.reject {
  background: #ffffff;
  color: #6B7684;
  border-color: #EAEDF1;
}
.action-btn.reject:hover:not(:disabled) {
  background: #FEF2F2;
  color: #DC2626;
  border-color: #FECACA;
}
.action-btn.approve {
  background: #0A0E1A;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(10, 14, 26, 0.16);
}
.action-btn.approve:hover:not(:disabled) {
  background: #17192a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 14, 26, 0.22);
}
.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.32);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: btn-spin 0.8s linear infinite;
}
.btn-spinner.dark {
  border: 2px solid rgba(10, 14, 26, 0.18);
  border-top-color: #4E5968;
}
@keyframes btn-spin { to { transform: rotate(360deg); } }

/* ===================== Sub-view header ===================== */
.subview-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 2px 16px;
}
.back-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #F7F8FA;
  border-radius: 10px;
  color: #4E5968;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.14s ease, color 0.14s ease;
  flex-shrink: 0;
}
.back-btn:hover { background: #EDF0F3; color: #0A0E1A; }
.subview-title { line-height: 1.25; }
.subview-title-main {
  font-size: 14px;
  font-weight: 700;
  color: #0A0E1A;
  letter-spacing: -0.2px;
}
.subview-title-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: #8B95A1;
  letter-spacing: -0.2px;
  margin-top: 2px;
}

/* ===================== Manage ===================== */
.manage-section + .manage-section {
  margin-top: 24px;
}
.manage-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.manage-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #F1F3F6;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.14s ease;
  text-align: left;
  font-family: inherit;
}
.manage-item:hover {
  border-color: #E5E8EC;
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(10, 14, 26, 0.05);
  transform: translateY(-1px);
}
.manage-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.manage-icon-ink {
  background: #0A0E1A;
  color: #ffffff;
}
.manage-text { flex: 1; min-width: 0; }
.manage-title {
  font-size: 14px;
  font-weight: 700;
  color: #0A0E1A;
  letter-spacing: -0.2px;
}
.manage-desc {
  font-size: 12px;
  font-weight: 500;
  color: #8B95A1;
  letter-spacing: -0.2px;
  margin-top: 3px;
}
.manage-chevron { color: #C4C9D0; flex-shrink: 0; }
.pill-soon {
  padding: 3px 8px;
  background: #FFF7ED;
  color: #C2410C;
  font-size: 10.5px;
  font-weight: 700;
  border-radius: 6px;
  letter-spacing: -0.2px;
  flex-shrink: 0;
}

/* Info grid */
.info-grid {
  background: #ffffff;
  border: 1px solid #F1F3F6;
  border-radius: 16px;
  overflow: hidden;
}
.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  font-size: 12.5px;
  font-weight: 600;
  border-bottom: 1px solid #F1F3F6;
}
.info-row:last-child { border-bottom: none; }
.info-label {
  color: #8B95A1;
  letter-spacing: -0.2px;
}
.info-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #0A0E1A;
  letter-spacing: -0.2px;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #9CA3AF;
}
.status-dot.ok { background: #10B981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
.status-dot.warn { background: #F59E0B; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15); }
.status-dot.off { background: #9CA3AF; }

/* ===================== Mobile ===================== */
@media (max-width: 767px) {
  .creator-panel-root {
    right: 16px;
    bottom: calc(96px + env(safe-area-inset-bottom));
  }
  .backdrop { display: block; }
  .panel {
    width: calc(100vw - 32px);
    height: min(600px, calc(100vh - 200px));
    border-radius: 20px;
  }
  .panel-header { padding: 18px 18px 14px; }
  .panel-body { padding: 16px; }
  .fab {
    height: 52px;
    padding: 0 18px 0 16px;
  }
  .fab-label { font-size: 13px; }
  .header-title { font-size: 17px; }
  .stat-value { font-size: 18px; }
}

/* 모바일/터치: sticky hover 차단 */
@media (hover: none) {
  .fab:hover {
    transform: none;
  }
}
</style>
