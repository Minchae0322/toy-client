// 관리자 메뉴 정의 — 헤더 드롭다운(AdminMenu.vue)과 관리자 홈(AdminDashboardView.vue)이 같이 쓴다.
// 새 관리 화면을 만들면 여기 한 줄만 추가한다.
import { Package, PackagePlus, FolderTree, Award, Flame, LayoutDashboard } from 'lucide-vue-next'

export const ADMIN_HOME = { to: '/admin', label: '관리자 홈', icon: LayoutDashboard }

export const ADMIN_MENU_GROUPS = [
  {
    title: '콘텐츠',
    items: [
      { to: '/admin/products', label: '상품 관리', desc: '상품 승인 · 수정 · 삭제', icon: Package },
      { to: '/admin/bulk-product', label: '벌크 제품 등록', desc: '제품을 한 번에 여러 개 등록', icon: PackagePlus },
      { to: '/admin/category', label: '카테고리 관리', desc: '카테고리 트리와 키워드', icon: FolderTree }
    ]
  },
  {
    title: '운영',
    items: [
      { to: '/admin/collection', label: '보상 시스템', desc: '뱃지 · 미션 · 레벨', icon: Award },
      { to: '/admin/schedulers', label: '핫 스코어 관리', desc: '시간 상수 변경 · 전체 재계산', icon: Flame }
    ]
  }
]

export const ADMIN_MENU_ITEMS = ADMIN_MENU_GROUPS.flatMap((g) => g.items)
