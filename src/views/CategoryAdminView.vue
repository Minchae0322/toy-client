<template>
  <div class="admin-container">
    <!-- 헤더 -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <h1>카테고리 관리</h1>
          <p>한입만 앱의 카테고리를 관리합니다</p>
        </div>
        <button @click="showAddForm = true" class="add-button">
          <span class="icon">➕</span>
          카테고리 추가
        </button>
      </div>
    </div>

    <!-- 통계 카드 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">전체 카테고리</div>
        <div class="stat-value">{{ categories.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">활성 카테고리</div>
        <div class="stat-value active">{{ activeCategories }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">비활성 카테고리</div>
        <div class="stat-value inactive">{{ inactiveCategories }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">총 상품 수</div>
        <div class="stat-value total">{{ totalItems }}</div>
      </div>
    </div>

    <!-- 카테고리 추가 폼 -->
    <div v-if="showAddForm" class="add-form-section">
      <div class="form-header">
        <h2>새 카테고리 추가</h2>
        <button @click="closeAddForm" class="close-button">✕</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>카테고리 키</label>
          <input
              v-model="newCategory.categoryKey"
              type="text"
              placeholder="convenience"
              class="form-input"
          />
        </div>
        <div class="form-group">
          <label>카테고리 이름</label>
          <input
              v-model="newCategory.categoryName"
              type="text"
              placeholder="편의점 템"
              class="form-input"
          />
        </div>
        <div class="form-group">
          <label>아이콘</label>
          <select v-model="newCategory.categoryIcon" class="form-select">
            <option v-for="emoji in emojiOptions" :key="emoji" :value="emoji">
              {{ emoji }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>타입</label>
          <select v-model="newCategory.categoryType" class="form-select">
            <option v-for="type in categoryTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button @click="closeAddForm" class="cancel-button">취소</button>
        <button @click="handleAddCategory" class="save-button">추가</button>
      </div>
    </div>

    <!-- 카테고리 목록 -->
    <div class="category-list-section">
      <div class="list-header">
        <h2>카테고리 목록</h2>
        <p>드래그해서 순서를 변경할 수 있습니다</p>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>

      <div v-else class="category-list">
        <div
            v-for="(category, index) in categories"
            :key="category.categoryId"
            class="category-item"
            :class="{ 'dragging': draggedItem?.categoryId === category.categoryId }"
            draggable="true"
            @dragstart="handleDragStart($event, category)"
            @dragover="handleDragOver"
            @drop="handleDrop($event, category)"
        >
          <div class="category-content">
            <!-- 드래그 핸들 -->
            <div class="drag-handle">⋮⋮</div>

            <!-- 순서 -->
            <div class="category-order">{{ index + 1 }}</div>

            <!-- 아이콘 -->
            <div class="category-icon">
              <select
                  v-if="editingId === category.categoryId"
                  v-model="category.categoryIcon"
                  @change="handleEditCategory(category.categoryId, 'categoryIcon', category.categoryIcon)"
                  class="icon-select"
              >
                <option v-for="emoji in emojiOptions" :key="emoji" :value="emoji">
                  {{ emoji }}
                </option>
              </select>
              <span v-else>{{ category.categoryIcon }}</span>
            </div>

            <!-- 카테고리 정보 -->
            <div class="category-info">
              <div class="category-main">
                <input
                    v-if="editingId === category.categoryId"
                    v-model="category.categoryName"
                    @blur="handleEditCategory(category.categoryId, 'categoryName', category.categoryName)"
                    class="edit-input"
                />
                <h3 v-else class="category-name">{{ category.categoryName }}</h3>
                <span
                    class="category-type-badge"
                    :style="{ backgroundColor: getTypeColor(category.categoryType) }"
                >
                  {{ getTypeLabel(category.categoryType) }}
                </span>
              </div>
              <div class="category-meta">
                <span class="meta-item">키: {{ category.categoryKey }}</span>
                <span class="meta-item">상품 수: {{ category.itemCount }}개</span>
              </div>
            </div>

            <!-- 상태 -->
            <div class="category-status">
              <button
                  @click="toggleActive(category.categoryId)"
                  class="status-button"
                  :class="{ 'active': category.isActive, 'inactive': !category.isActive }"
              >
                <span class="status-icon">{{ category.isActive ? '👁️' : '🚫' }}</span>
                {{ category.isActive ? '활성' : '비활성' }}
              </button>
            </div>

            <!-- 액션 버튼 -->
            <div class="category-actions">
              <button
                  v-if="editingId === category.categoryId"
                  @click="saveEdit(category.categoryId)"
                  class="action-button save"
              >
                💾
              </button>
              <button
                  v-else
                  @click="startEdit(category.categoryId)"
                  class="action-button edit"
              >
                ✏️
              </button>

              <button
                  v-if="category.categoryType !== 'SYSTEM'"
                  @click="handleDeleteCategory(category.categoryId)"
                  class="action-button delete"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// 반응형 데이터
const categories = ref([]);
const loading = ref(false);
const editingId = ref(null);
const showAddForm = ref(false);
const draggedItem = ref(null);

// 새 카테고리 폼 데이터
const newCategory = ref({
  categoryKey: '',
  categoryName: '',
  categoryIcon: '🍽️',
  categoryType: 'FOOD',
  parentId: null,
  isActive: true
});

// 카테고리 타입 옵션
const categoryTypes = [
  { value: 'SYSTEM', label: '시스템', color: '#6b7280' },
  { value: 'TREND', label: '트렌드/신상', color: '#ef4444' },
  { value: 'PLACE', label: '장소별', color: '#f59e0b' },
  { value: 'FOOD', label: '음식별', color: '#10b981' },
  { value: 'PRICE', label: '가격별', color: '#8b5cf6' },
  { value: 'PURPOSE', label: '목적별', color: '#3b82f6' },
  { value: 'LIFESTYLE', label: '라이프스타일', color: '#06b6d4' },
  { value: 'TIME', label: '시간대별', color: '#84cc16' },
  { value: 'SPECIAL', label: '특별태그', color: '#f97316' }
];

// 이모지 선택 옵션
const emojiOptions = [
  '🍽️', '🆕', '🌟', '🏷️', '📺', '🏪', '☕', '🍞', '🍕', '🍜',
  '🍫', '🧋', '💸', '💵', '💴', '💎', '🤝', '👥', '⚡', '🎁',
  '💪', '🎮', '📚', '🍺', '🌅', '🌙', '🔥', '👀', '⭐', '📸'
];

// 계산된 속성
const activeCategories = computed(() =>
    categories.value.filter(c => c.isActive).length
);

const inactiveCategories = computed(() =>
    categories.value.filter(c => !c.isActive).length
);

const totalItems = computed(() =>
    categories.value.reduce((sum, c) => sum + c.itemCount, 0)
);

// 메서드
const loadCategories = async () => {
  loading.value = true;
  // Mock API 호출
  setTimeout(() => {
    categories.value = [
      { categoryId: 1, categoryKey: 'all', categoryName: '전체', categoryIcon: '🍽️', categoryType: 'SYSTEM', displayOrder: 0, isActive: true, itemCount: 156 },
      { categoryId: 2, categoryKey: 'new', categoryName: '이번주 신상', categoryIcon: '🆕', categoryType: 'TREND', displayOrder: 1, isActive: true, itemCount: 23 },
      { categoryId: 3, categoryKey: 'trending', categoryName: '화제의 먹거리', categoryIcon: '🌟', categoryType: 'TREND', displayOrder: 2, isActive: true, itemCount: 45 },
      { categoryId: 4, categoryKey: 'convenience', categoryName: '편의점 템', categoryIcon: '🏪', categoryType: 'PLACE', displayOrder: 3, isActive: true, itemCount: 67 },
      { categoryId: 5, categoryKey: 'cafe', categoryName: '카페 음료', categoryIcon: '☕', categoryType: 'PLACE', displayOrder: 4, isActive: true, itemCount: 34 },
      { categoryId: 6, categoryKey: 'snacks', categoryName: '간식/과자', categoryIcon: '🍫', categoryType: 'FOOD', displayOrder: 5, isActive: false, itemCount: 12 },
    ];
    loading.value = false;
  }, 1000);
};

const handleAddCategory = () => {
  if (!newCategory.value.categoryKey || !newCategory.value.categoryName) {
    alert('카테고리 키와 이름은 필수입니다.');
    return;
  }

  const newId = Math.max(...categories.value.map(c => c.categoryId)) + 1;
  const categoryToAdd = {
    ...newCategory.value,
    categoryId: newId,
    displayOrder: categories.value.length,
    itemCount: 0
  };

  categories.value.push(categoryToAdd);
  closeAddForm();
};

const closeAddForm = () => {
  showAddForm.value = false;
  newCategory.value = {
    categoryKey: '',
    categoryName: '',
    categoryIcon: '🍽️',
    categoryType: 'FOOD',
    parentId: null,
    isActive: true
  };
};

const handleEditCategory = (id, field, value) => {
  const category = categories.value.find(cat => cat.categoryId === id);
  if (category) {
    category[field] = value;
  }
};

const startEdit = (id) => {
  editingId.value = id;
};

const saveEdit = (id) => {
  editingId.value = null;
};

const handleDeleteCategory = (id) => {
  if (confirm('정말로 이 카테고리를 삭제하시겠습니까?')) {
    categories.value = categories.value.filter(cat => cat.categoryId !== id);
  }
};

const toggleActive = (id) => {
  const category = categories.value.find(cat => cat.categoryId === id);
  if (category) {
    category.isActive = !category.isActive;
  }
};

// 드래그 앤 드롭
const handleDragStart = (e, item) => {
  draggedItem.value = item;
  e.dataTransfer.effectAllowed = 'move';
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
};

const handleDrop = (e, targetItem) => {
  e.preventDefault();
  if (!draggedItem.value || draggedItem.value.categoryId === targetItem.categoryId) return;

  const draggedIndex = categories.value.findIndex(c => c.categoryId === draggedItem.value.categoryId);
  const targetIndex = categories.value.findIndex(c => c.categoryId === targetItem.categoryId);

  const newCategories = [...categories.value];
  const [removed] = newCategories.splice(draggedIndex, 1);
  newCategories.splice(targetIndex, 0, removed);

  // displayOrder 재정렬
  const reorderedCategories = newCategories.map((cat, index) => ({
    ...cat,
    displayOrder: index
  }));

  categories.value = reorderedCategories;
  draggedItem.value = null;
};

const getTypeColor = (type) => {
  const typeObj = categoryTypes.find(t => t.value === type);
  return typeObj ? typeObj.color : '#6b7280';
};

const getTypeLabel = (type) => {
  const typeObj = categoryTypes.find(t => t.value === type);
  return typeObj ? typeObj.label : type;
};

// 라이프사이클
onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 32px 16px;
}

/* 헤더 */
.header-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 24px;
  margin-bottom: 24px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h1 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.header-info p {
  color: #6b7280;
  margin: 0;
}

.add-button {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.add-button:hover {
  background: #059669;
}

/* 통계 카드 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.stat-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.stat-value.active {
  color: #10b981;
}

.stat-value.inactive {
  color: #ef4444;
}

.stat-value.total {
  color: #3b82f6;
}

/* 추가 폼 */
.add-form-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 24px;
  margin-bottom: 24px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}

.close-button:hover {
  color: #374151;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.form-input,
.form-select {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-button,
.save-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.cancel-button:hover {
  background: #f9fafb;
}

.save-button {
  background: #10b981;
  color: white;
  border: none;
}

.save-button:hover {
  background: #059669;
}

/* 카테고리 목록 */
.category-list-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.list-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.list-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.list-header p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.loading-container {
  padding: 48px 24px;
  text-align: center;
}

.loading-spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.category-list {
  display: flex;
  flex-direction: column;
}

.category-item {
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
  transition: background-color 0.2s;
  cursor: move;
}

.category-item:hover {
  background: #f9fafb;
}

.category-item.dragging {
  opacity: 0.5;
}

.category-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.drag-handle {
  color: #9ca3af;
  font-size: 16px;
  cursor: move;
}

.drag-handle:hover {
  color: #6b7280;
}

.category-order {
  width: 32px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.category-icon {
  font-size: 24px;
}

.icon-select {
  width: 60px;
  text-align: center;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px;
  font-size: 20px;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.category-name {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.edit-input {
  font-size: 16px;
  font-weight: 500;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
}

.category-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.category-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  font-size: 14px;
  color: #6b7280;
}

.category-status {
  display: flex;
  align-items: center;
}

.status-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.status-button.active {
  background: #dcfce7;
  color: #166534;
}

.status-button.inactive {
  background: #fecaca;
  color: #991b1b;
}

.category-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-button:hover {
  background: #f3f4f6;
}

.action-button.save:hover {
  background: #dcfce7;
}

.action-button.edit:hover {
  background: #dbeafe;
}

.action-button.delete:hover {
  background: #fecaca;
}

/* 반응형 */
@media (max-width: 768px) {
  .admin-container {
    padding: 16px 8px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .category-content {
    flex-wrap: wrap;
    gap: 8px;
  }

  .category-info {
    flex-basis: 100%;
    order: 1;
  }

  .category-actions {
    order: 2;
  }
}
</style>