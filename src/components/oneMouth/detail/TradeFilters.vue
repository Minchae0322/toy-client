<template>
  <div class="trade-filters">
    <!-- 필터 헤더 -->
    <div class="filter-header">
      <h3 class="filter-title">🔍 거래 필터</h3>
      <button
          class="reset-btn"
          @click="resetAllFilters"
          v-if="hasActiveFilters"
      >
        초기화
      </button>
    </div>

    <!-- 정렬 및 기본 필터 행 -->
    <div class="filter-row">
      <div class="filter-group">
        <label class="filter-label">정렬</label>
        <select
            v-model="localFilters.sort"
            @change="emitFilterChange"
            class="filter-select sort-select"
        >
          <option value="latest">최신순</option>
          <option value="price-low">낮은가격순</option>
          <option value="price-high">높은가격순</option>
          <option value="distance">가까운거리순</option>
          <option value="rating">평점높은순</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">상태</label>
        <select
            v-model="localFilters.condition"
            @change="emitFilterChange"
            class="filter-select condition-select"
        >
          <option value="all">전체상태</option>
          <option value="new">새상품</option>
          <option value="like-new">거의새것</option>
          <option value="used">사용감있음</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">거래방법</label>
        <select
            v-model="localFilters.tradeMethod"
            @change="emitFilterChange"
            class="filter-select"
        >
          <option value="all">전체</option>
          <option value="direct">직거래</option>
          <option value="delivery">택배</option>
          <option value="convenience">편의점택배</option>
        </select>
      </div>
    </div>

    <!-- 가격 범위 필터 -->
    <div class="filter-row">
      <div class="filter-group price-group">
        <label class="filter-label">가격범위</label>
        <div class="price-range-container">
          <div class="price-inputs">
            <input
                type="number"
                v-model.number="localFilters.priceRange.min"
                @input="handlePriceChange"
                placeholder="최소"
                class="price-input"
                min="0"
                :max="localFilters.priceRange.max"
            />
            <span class="price-separator">~</span>
            <input
                type="number"
                v-model.number="localFilters.priceRange.max"
                @input="handlePriceChange"
                placeholder="최대"
                class="price-input"
                :min="localFilters.priceRange.min"
                max="100000"
            />
            <span class="price-unit">원</span>
          </div>

          <div class="price-range-slider">
            <input
                type="range"
                v-model="localFilters.priceRange.min"
                @input="handlePriceChange"
                :min="0"
                :max="localFilters.priceRange.max"
                :step="500"
                class="range-slider range-min"
            />
            <input
                type="range"
                v-model="localFilters.priceRange.max"
                @input="handlePriceChange"
                :min="localFilters.priceRange.min"
                :max="100000"
                :step="500"
                class="range-slider range-max"
            />
          </div>

          <!-- 빠른 가격 선택 버튼 -->
          <div class="quick-price-buttons">
            <button
                v-for="range in quickPriceRanges"
                :key="range.label"
                @click="setQuickPriceRange(range)"
                class="quick-price-btn"
                :class="{ 'active': isQuickPriceActive(range) }"
            >
              {{ range.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 거리 필터 -->
    <div class="filter-row">
      <div class="filter-group">
        <label class="filter-label">최대거리</label>
        <div class="distance-container">
          <input
              type="range"
              v-model="localFilters.maxDistance"
              @input="emitFilterChange"
              min="100"
              max="10000"
              step="100"
              class="range-slider"
          />
          <div class="distance-display">
            <span class="distance-value">{{ formatDistance(localFilters.maxDistance) }}</span>
            <div class="distance-quick-btns">
              <button
                  v-for="distance in quickDistances"
                  :key="distance.value"
                  @click="setQuickDistance(distance.value)"
                  class="distance-quick-btn"
                  :class="{ 'active': localFilters.maxDistance === distance.value }"
              >
                {{ distance.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 고급 필터 (토글 가능) -->
    <div class="advanced-filters" v-if="showAdvanced">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">판매자 평점</label>
          <div class="rating-filter">
            <div
                v-for="rating in ratingOptions"
                :key="rating.value"
                class="rating-option"
                :class="{ 'active': localFilters.minRating === rating.value }"
                @click="setMinRating(rating.value)"
            >
              <span class="rating-stars">{{ rating.stars }}</span>
              <span class="rating-text">{{ rating.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">등록기간</label>
          <select
              v-model="localFilters.dateRange"
              @change="emitFilterChange"
              class="filter-select"
          >
            <option value="all">전체</option>
            <option value="today">오늘</option>
            <option value="3days">3일 이내</option>
            <option value="week">1주일 이내</option>
            <option value="month">1개월 이내</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">수량</label>
          <select
              v-model="localFilters.quantityRange"
              @change="emitFilterChange"
              class="filter-select"
          >
            <option value="all">전체</option>
            <option value="1">1개</option>
            <option value="2-5">2-5개</option>
            <option value="6-10">6-10개</option>
            <option value="10+">10개 이상</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 고급 필터 토글 버튼 -->
    <div class="advanced-toggle">
      <button
          class="advanced-toggle-btn"
          @click="toggleAdvanced"
      >
        {{ showAdvanced ? '▲ 간단히 보기' : '▼ 상세 필터' }}
      </button>
    </div>

    <!-- 활성 필터 태그 -->
    <div v-if="activeFilterTags.length > 0" class="active-filters">
      <div class="active-filters-title">활성 필터:</div>
      <div class="filter-tags">
        <div
            v-for="tag in activeFilterTags"
            :key="tag.key"
            class="filter-tag"
            @click="removeFilter(tag.key)"
        >
          <span>{{ tag.label }}</span>
          <button class="tag-remove-btn">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

// Props 정의
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      sort: 'latest',
      condition: 'all',
      tradeMethod: 'all',
      priceRange: { min: 0, max: 50000 },
      maxDistance: 5000,
      minRating: 0,
      dateRange: 'all',
      quantityRange: 'all'
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Emit 정의
const emit = defineEmits(['update:modelValue', 'filter-change']);

// 반응형 데이터
const showAdvanced = ref(false);
const localFilters = ref({ ...props.modelValue });
const debounceTimer = ref(null);

// 빠른 가격 범위 옵션
const quickPriceRanges = [
  { label: '전체', min: 0, max: 100000 },
  { label: '1만원 이하', min: 0, max: 10000 },
  { label: '1-3만원', min: 10000, max: 30000 },
  { label: '3-5만원', min: 30000, max: 50000 },
  { label: '5만원 이상', min: 50000, max: 100000 }
];

// 빠른 거리 옵션
const quickDistances = [
  { label: '100m', value: 100 },
  { label: '500m', value: 500 },
  { label: '1km', value: 1000 },
  { label: '3km', value: 3000 },
  { label: '5km', value: 5000 },
  { label: '10km', value: 10000 }
];

// 평점 옵션
const ratingOptions = [
  { value: 0, stars: '⭐', text: '전체' },
  { value: 3, stars: '⭐⭐⭐', text: '3점 이상' },
  { value: 4, stars: '⭐⭐⭐⭐', text: '4점 이상' },
  { value: 4.5, stars: '⭐⭐⭐⭐⭐', text: '4.5점 이상' }
];

// 활성 필터가 있는지 확인
const hasActiveFilters = computed(() => {
  const defaultFilters = {
    sort: 'latest',
    condition: 'all',
    tradeMethod: 'all',
    priceRange: { min: 0, max: 50000 },
    maxDistance: 5000,
    minRating: 0,
    dateRange: 'all',
    quantityRange: 'all'
  };

  return JSON.stringify(localFilters.value) !== JSON.stringify(defaultFilters);
});

// 활성 필터 태그 생성
const activeFilterTags = computed(() => {
  const tags = [];

  // 상태 필터
  if (localFilters.value.condition !== 'all') {
    const conditionLabels = {
      'new': '새상품',
      'like-new': '거의새것',
      'used': '사용감있음'
    };
    tags.push({
      key: 'condition',
      label: `상태: ${conditionLabels[localFilters.value.condition]}`
    });
  }

  // 거래방법 필터
  if (localFilters.value.tradeMethod !== 'all') {
    const methodLabels = {
      'direct': '직거래',
      'delivery': '택배',
      'convenience': '편의점택배'
    };
    tags.push({
      key: 'tradeMethod',
      label: `거래방법: ${methodLabels[localFilters.value.tradeMethod]}`
    });
  }

  // 가격 필터
  if (localFilters.value.priceRange.min > 0 || localFilters.value.priceRange.max < 50000) {
    tags.push({
      key: 'priceRange',
      label: `가격: ${localFilters.value.priceRange.min.toLocaleString()}원 - ${localFilters.value.priceRange.max.toLocaleString()}원`
    });
  }

  // 거리 필터
  if (localFilters.value.maxDistance < 5000) {
    tags.push({
      key: 'maxDistance',
      label: `거리: ${formatDistance(localFilters.value.maxDistance)} 이내`
    });
  }

  // 평점 필터
  if (localFilters.value.minRating > 0) {
    tags.push({
      key: 'minRating',
      label: `평점: ${localFilters.value.minRating}점 이상`
    });
  }

  // 등록기간 필터
  if (localFilters.value.dateRange !== 'all') {
    const dateLabels = {
      'today': '오늘',
      '3days': '3일 이내',
      'week': '1주일 이내',
      'month': '1개월 이내'
    };
    tags.push({
      key: 'dateRange',
      label: `등록: ${dateLabels[localFilters.value.dateRange]}`
    });
  }

  // 수량 필터
  if (localFilters.value.quantityRange !== 'all') {
    const quantityLabels = {
      '1': '1개',
      '2-5': '2-5개',
      '6-10': '6-10개',
      '10+': '10개 이상'
    };
    tags.push({
      key: 'quantityRange',
      label: `수량: ${quantityLabels[localFilters.value.quantityRange]}`
    });
  }

  return tags;
});

// 유틸리티 함수
const formatDistance = (distance) => {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)}km`;
  }
  return `${distance}m`;
};

const isQuickPriceActive = (range) => {
  return localFilters.value.priceRange.min === range.min &&
      localFilters.value.priceRange.max === range.max;
};

// 필터 액션
const emitFilterChange = () => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }

  debounceTimer.value = setTimeout(() => {
    emit('update:modelValue', { ...localFilters.value });
    emit('filter-change', { ...localFilters.value });
  }, 300);
};

const handlePriceChange = () => {
  // 최소값이 최대값보다 크지 않도록 조정
  if (localFilters.value.priceRange.min > localFilters.value.priceRange.max) {
    localFilters.value.priceRange.max = localFilters.value.priceRange.min;
  }
  emitFilterChange();
};

const setQuickPriceRange = (range) => {
  localFilters.value.priceRange.min = range.min;
  localFilters.value.priceRange.max = range.max;
  emitFilterChange();
};

const setQuickDistance = (distance) => {
  localFilters.value.maxDistance = distance;
  emitFilterChange();
};

const setMinRating = (rating) => {
  localFilters.value.minRating = rating;
  emitFilterChange();
};

const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value;
};

const resetAllFilters = () => {
  localFilters.value = {
    sort: 'latest',
    condition: 'all',
    tradeMethod: 'all',
    priceRange: { min: 0, max: 50000 },
    maxDistance: 5000,
    minRating: 0,
    dateRange: 'all',
    quantityRange: 'all'
  };
  emitFilterChange();
};

const removeFilter = (filterKey) => {
  switch (filterKey) {
    case 'condition':
      localFilters.value.condition = 'all';
      break;
    case 'tradeMethod':
      localFilters.value.tradeMethod = 'all';
      break;
    case 'priceRange':
      localFilters.value.priceRange = { min: 0, max: 50000 };
      break;
    case 'maxDistance':
      localFilters.value.maxDistance = 5000;
      break;
    case 'minRating':
      localFilters.value.minRating = 0;
      break;
    case 'dateRange':
      localFilters.value.dateRange = 'all';
      break;
    case 'quantityRange':
      localFilters.value.quantityRange = 'all';
      break;
  }
  emitFilterChange();
};

// Props 변경 감지
watch(() => props.modelValue, (newValue) => {
  localFilters.value = { ...newValue };
}, { deep: true });

// 컴포넌트 마운트 시
onMounted(() => {
  // 로컬 스토리지에서 필터 상태 복원
  const savedFilters = localStorage.getItem('trade-filters');
  if (savedFilters) {
    try {
      const parsed = JSON.parse(savedFilters);
      localFilters.value = { ...localFilters.value, ...parsed };
    } catch (error) {
      console.error('필터 복원 실패:', error);
    }
  }
});

// 필터 변경 시 로컬 스토리지에 저장
watch(localFilters, (newValue) => {
  localStorage.setItem('trade-filters', JSON.stringify(newValue));
}, { deep: true });
</script>

<style scoped>
.trade-filters {
  background: #f7fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

/* 필터 헤더 */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reset-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: #c53030;
}

/* 필터 행 */
.filter-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;
}

.filter-group.price-group {
  flex: 1;
  min-width: 300px;
}

.filter-label {
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 2px;
}

/* 선택 박스 */
.filter-select {
  padding: 8px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #2d3748;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #1DCD9F;
  box-shadow: 0 0 0 3px rgba(29, 205, 159, 0.1);
}

/* 가격 필터 */
.price-range-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input {
  width: 80px;
  padding: 8px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.price-input:focus {
  outline: none;
  border-color: #1DCD9F;
  box-shadow: 0 0 0 3px rgba(29, 205, 159, 0.1);
}

.price-separator {
  color: #718096;
  font-weight: 500;
}

.price-unit {
  color: #718096;
  font-size: 14px;
}

.price-range-slider {
  position: relative;
  height: 20px;
}

.range-slider {
  position: absolute;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  appearance: none;
}

.range-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1DCD9F;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.range-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1DCD9F;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.range-min {
  z-index: 1;
}

.range-max {
  z-index: 2;
}

.quick-price-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-price-btn {
  padding: 4px 12px;
  border: 1px solid #cbd5e0;
  background: white;
  border-radius: 16px;
  font-size: 12px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-price-btn:hover {
  border-color: #1DCD9F;
  color: #1DCD9F;
}

.quick-price-btn.active {
  background: #1DCD9F;
  color: white;
  border-color: #1DCD9F;
}

/* 거리 필터 */
.distance-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.distance-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.distance-value {
  font-weight: 600;
  color: #1DCD9F;
  font-size: 14px;
}

.distance-quick-btns {
  display: flex;
  gap: 4px;
}

.distance-quick-btn {
  padding: 2px 8px;
  border: 1px solid #cbd5e0;
  background: white;
  border-radius: 12px;
  font-size: 10px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.distance-quick-btn:hover {
  border-color: #1DCD9F;
  color: #1DCD9F;
}

.distance-quick-btn.active {
  background: #1DCD9F;
  color: white;
  border-color: #1DCD9F;
}

/* 고급 필터 */
.advanced-filters {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
  margin-top: 16px;
}

.rating-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.rating-option {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.rating-option:hover {
  border-color: #1DCD9F;
  color: #1DCD9F;
}

.rating-option.active {
  background: #1DCD9F;
  color: white;
  border-color: #1DCD9F;
}

.rating-stars {
  font-size: 10px;
}

.rating-text {
  font-weight: 500;
}

/* 고급 필터 토글 */
.advanced-toggle {
  text-align: center;
  margin-top: 12px;
}

.advanced-toggle-btn {
  background: none;
  border: 1px solid #cbd5e0;
  color: #4a5568;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.advanced-toggle-btn:hover {
  border-color: #1DCD9F;
  color: #1DCD9F;
}

/* 활성 필터 태그 */
.active-filters {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
  margin-top: 16px;
}

.active-filters-title {
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #1DCD9F;
  color: white;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s;
}

.filter-tag:hover {
  background: #16a085;
}

.tag-remove-btn {
  background: none;
  border: none;
  color: white;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-left: 2px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-group {
    min-width: auto;
  }

  .filter-group.price-group {
    min-width: auto;
  }

  .price-inputs {
    justify-content: center;
  }

  .price-input {
    width: 70px;
  }

  .quick-price-buttons,
  .distance-quick-btns {
    justify-content: center;
  }

  .rating-filter {
    justify-content: center;
  }

  .distance-display {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .trade-filters {
    padding: 16px;
  }

  .filter-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .price-inputs {
    flex-direction: column;
    gap: 4px;
  }

  .price-input {
    width: 100%;
    text-align: left;
  }

  .filter-tags {
    justify-content: center;
  }
}
</style>