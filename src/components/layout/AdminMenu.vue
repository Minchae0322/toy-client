<template>
  <div ref="root" class="admin-menu">
    <button
      class="admin-trigger"
      :class="{ open }"
      type="button"
      :aria-expanded="open"
      title="관리자 메뉴"
      @click="open = !open"
    >
      <ShieldCheck :size="16" />
      <span class="label">관리자</span>
      <ChevronDown :size="14" class="chevron" />
    </button>

    <Transition name="menu">
      <div v-if="open" class="admin-dropdown" role="menu">
        <RouterLink :to="ADMIN_HOME.to" class="admin-item home" @click="open = false">
          <component :is="ADMIN_HOME.icon" :size="16" />
          <span>{{ ADMIN_HOME.label }}</span>
        </RouterLink>
        <div v-for="group in ADMIN_MENU_GROUPS" :key="group.title" class="admin-group">
          <div class="admin-group-title">{{ group.title }}</div>
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="admin-item"
            @click="open = false"
          >
            <component :is="item.icon" :size="16" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ShieldCheck, ChevronDown } from 'lucide-vue-next'
import { ADMIN_HOME, ADMIN_MENU_GROUPS } from './adminMenuItems.js'

const open = ref(false)
const root = ref(null)
const route = useRoute()

function onDocumentClick(e) {
  if (open.value && root.value && !root.value.contains(e.target)) open.value = false
}
function onKeydown(e) {
  if (e.key === 'Escape') open.value = false
}

watch(() => route.fullPath, () => { open.value = false })
onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.admin-menu { position: relative; }

.admin-trigger {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 12px; border: none; border-radius: 8px;
  background: var(--c-brand-hover); color: #fff;
  font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
}
.admin-trigger:hover, .admin-trigger.open { background: #7C3AED; box-shadow: 0 4px 12px rgba(147, 51, 234, 0.25); }
.admin-trigger .chevron { transition: transform 0.15s; }
.admin-trigger.open .chevron { transform: rotate(180deg); }

.admin-dropdown {
  position: absolute; top: calc(100% + 8px); right: 0; z-index: 1200;
  min-width: 220px; padding: 6px;
  background: var(--bg-elevated); border: 1px solid var(--bg-subtle); border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}
.admin-group { padding-top: 4px; margin-top: 4px; border-top: 1px solid var(--bg-subtle); }
.admin-group-title { padding: 6px 10px 2px; font-size: 10.5px; font-weight: 700; color: var(--c-text-400); text-transform: uppercase; letter-spacing: 0.5px; }
.admin-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 8px;
  font-size: 13px; font-weight: 600; color: var(--c-text-600); text-decoration: none;
  transition: background 0.12s, color 0.12s;
}
.admin-item:hover { background: var(--c-brand-soft); color: var(--c-brand-hover); }
.admin-item.router-link-active { color: var(--c-brand-hover); }
.admin-item.home { font-weight: 700; color: var(--text-primary); }

.menu-enter-active, .menu-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 768px) {
  .admin-trigger { padding: 7px 9px; }
  .admin-trigger .label, .admin-trigger .chevron { display: none; }
  .admin-dropdown { right: -8px; }
}
</style>
