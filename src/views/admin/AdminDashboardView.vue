<template>
  <div class="admin-container">
    <main class="main-content">
      <header class="page-header">
        <div class="header-left">
          <h2>관리자</h2>
          <p class="header-desc">운영에 필요한 관리 화면을 모아 둔 곳입니다</p>
        </div>
        <div class="header-right">
          <span class="admin-badge">관리자</span>
        </div>
      </header>

      <section v-for="group in groups" :key="group.title" class="group">
        <h3 class="group-title">{{ group.title }}</h3>
        <div class="card-grid">
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="card"
          >
            <div class="card-icon">
              <component :is="item.icon" :size="22" />
            </div>
            <div class="card-body">
              <strong>{{ item.label }}</strong>
              <span>{{ item.desc }}</span>
            </div>
            <ChevronRight :size="18" class="card-arrow" />
          </RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ChevronRight } from 'lucide-vue-next'
import { ADMIN_MENU_GROUPS } from '@/components/layout/adminMenuItems.js'

const groups = ADMIN_MENU_GROUPS
</script>

<style scoped>
.admin-container { min-height: 100vh; background: var(--bg-base); }
.main-content { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }
@media (min-width: 768px) { .main-content { padding: 32px 24px; } }
@media (min-width: 1024px) { .main-content { padding: 40px 32px; } }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h2 { font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
.header-desc { font-size: 13px; color: var(--c-text-500); margin-top: 4px; }
.admin-badge { font-size: 11px; font-weight: 700; color: var(--c-brand-hover); background: var(--c-brand-soft); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--c-brand-soft); }

.group { margin-bottom: 28px; }
.group-title { font-size: 13px; font-weight: 700; color: var(--c-text-500); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }

.card-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 640px) { .card-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .card-grid { grid-template-columns: repeat(3, 1fr); } }

.card { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: var(--bg-elevated); border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); text-decoration: none; color: inherit; transition: box-shadow 0.2s, transform 0.2s; }
.card:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.08); transform: translateY(-1px); }
.card-icon { flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: var(--c-brand-soft); color: var(--c-brand-hover); }
.card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.card-body strong { font-size: 14px; font-weight: 700; color: var(--text-primary); }
.card-body span { font-size: 12px; color: var(--c-text-400); line-height: 1.4; }
.card-arrow { flex-shrink: 0; color: var(--c-text-300); }
.card:hover .card-arrow { color: var(--c-brand-hover); }
</style>
