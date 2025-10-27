<template>
  <div class="app-container">
    <!-- 왼쪽 사이드바 -->
    <aside class="sidebar-left">
      <div class="logo">
        <h1>HYPE BATTLE</h1>
      </div>

      <nav class="nav-menu">
        <a href="#" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span>홈</span>
        </a>
        <a href="#" class="nav-item active">
          <span class="nav-icon">⚔️</span>
          <span>배틀</span>
        </a>
        <a href="#" class="nav-item">
          <span class="nav-icon">🔥</span>
          <span>인기</span>
        </a>
        <a href="#" class="nav-item">
          <span class="nav-icon">🏆</span>
          <span>랭킹</span>
        </a>
        <a href="#" class="nav-item">
          <span class="nav-icon">💬</span>
          <span>메시지</span>
        </a>
        <a href="#" class="nav-item">
          <span class="nav-icon">👤</span>
          <span>프로필</span>
        </a>
      </nav>
    </aside>

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <!-- 헤더 -->
      <header class="create-header">
        <div class="header-content">
          <button class="back-btn" @click="handleBack">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            돌아가기
          </button>
          <h1 class="page-title">배틀 만들기</h1>
          <button class="save-draft-btn" @click="saveDraft">임시저장</button>
        </div>
      </header>

      <!-- 스텝 인디케이터 -->
      <div class="step-indicator">
        <div class="steps">
          <template v-for="(step, index) in steps" :key="index">
            <div
                class="step"
                :class="{
                active: currentStep === index + 1,
                completed: currentStep > index + 1
              }"
            >
              <span class="step-number">{{ index + 1 }}</span>
              <span class="step-label">{{ step }}</span>
            </div>
            <div v-if="index < steps.length - 1" class="step-line"></div>
          </template>
        </div>
      </div>

      <!-- 컨텐츠 영역 -->
      <div class="content-area">
        <!-- Step 1: 기본 정보 -->
        <div v-show="currentStep === 1" class="create-container">
          <div class="form-section">
            <div class="form-group">
              <label class="form-label">
                배틀 제목 <span class="required">*</span>
              </label>
              <input
                  v-model="battleForm.title"
                  type="text"
                  class="form-input"
                  placeholder="예: 2025년 2월 최고의 스니커즈는?"
                  maxlength="50"
              >
              <div class="char-counter">{{ battleForm.title.length }} / 50</div>
              <div class="form-hint">명확하고 흥미로운 제목을 작성해주세요</div>
            </div>

            <div class="form-group">
              <label class="form-label">
                배틀 타입 <span class="required">*</span>
              </label>
              <div class="battle-type-selector">
                <div
                    v-for="type in battleTypes"
                    :key="type.value"
                    class="type-option"
                    :class="{ selected: battleForm.type === type.value }"
                    @click="selectBattleType(type.value)"
                >
                  <div class="type-icon">{{ type.icon }}</div>
                  <div class="type-title">{{ type.title }}</div>
                  <div class="type-desc">{{ type.desc }}</div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                카테고리 <span class="required">*</span>
              </label>
              <div class="category-grid">
                <div
                    v-for="category in categories"
                    :key="category.value"
                    class="category-item"
                    :class="{ selected: battleForm.category === category.value }"
                    @click="selectCategory(category.value)"
                >
                  <div class="category-emoji">{{ category.emoji }}</div>
                  <div class="category-name">{{ category.name }}</div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                배틀 기간 <span class="required">*</span>
              </label>
              <div class="date-selector">
                <div class="date-input-group">
                  <span class="date-label">시작일</span>
                  <input
                      v-model="battleForm.startDate"
                      type="date"
                      class="form-input"
                  >
                </div>
                <div class="date-input-group">
                  <span class="date-label">종료일</span>
                  <input
                      v-model="battleForm.endDate"
                      type="date"
                      class="form-input"
                  >
                </div>
              </div>
              <div class="form-hint">최소 7일, 최대 31일까지 설정 가능합니다</div>
            </div>

            <div class="form-group">
              <label class="form-label">배틀 설명</label>
              <textarea
                  v-model="battleForm.description"
                  class="form-input textarea"
                  placeholder="배틀에 대한 설명이나 투표 기준을 알려주세요 (선택)"
                  maxlength="200"
              ></textarea>
              <div class="char-counter">{{ battleForm.description.length }} / 200</div>
            </div>
          </div>

          <!-- 우측 미리보기 -->
          <div class="preview-section">
            <div class="preview-label">미리보기</div>
            <div class="preview-card">
              <div class="preview-visual">
                <div class="preview-visual-placeholder">{{ previewEmoji }}</div>
                <div class="preview-type-badge">{{ previewTypeName }}</div>
              </div>
              <div class="preview-content">
                <div class="preview-category">{{ previewCategoryName }}</div>
                <div class="preview-title">{{ battleForm.title || '배틀 제목을 입력해주세요' }}</div>
                <div class="preview-stats">
                  <div class="preview-stat">
                    <div class="preview-stat-value">0</div>
                    <div class="preview-stat-label">참여자</div>
                  </div>
                  <div class="preview-stat">
                    <div class="preview-stat-value">0</div>
                    <div class="preview-stat-label">투표</div>
                  </div>
                  <div class="preview-stat">
                    <div class="preview-stat-value">{{ selectedItems.length }}</div>
                    <div class="preview-stat-label">제품</div>
                  </div>
                </div>
                <div class="preview-footer">
                  <div class="preview-creator">@your_username</div>
                  <div class="preview-date">{{ dateDiffText }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: 아이템 설정 -->
        <div v-show="currentStep === 2" class="create-container">
          <div class="form-section">
            <!-- 오픈 배틀 설정 -->
            <div v-if="battleForm.type === 'open'">
              <div class="form-group">
                <label class="form-label">참여 조건 설정</label>
                <div class="form-hint">누구나 참여 가능하지만, 조건을 설정할 수 있어요</div>
              </div>

              <div class="form-group">
                <label class="form-label">최소 레벨 제한</label>
                <select v-model="battleForm.minLevel" class="form-input">
                  <option value="">제한 없음</option>
                  <option value="3">Level 3 이상</option>
                  <option value="5">Level 5 이상</option>
                  <option value="10">Level 10 이상</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">최대 참여 제품 수</label>
                <select v-model="battleForm.maxProducts" class="form-input">
                  <option value="">제한 없음</option>
                  <option value="50">최대 50개</option>
                  <option value="100">최대 100개</option>
                  <option value="200">최대 200개</option>
                </select>
                <div class="form-hint">선착순으로 마감됩니다</div>
              </div>

              <div class="form-group">
                <label class="form-label">중복 제품 허용</label>
                <div style="display: flex; gap: 20px; margin-top: 12px;">
                  <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input
                        v-model="battleForm.allowDuplicate"
                        type="radio"
                        :value="false"
                    >
                    <span style="font-size: 14px;">허용 안 함</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input
                        v-model="battleForm.allowDuplicate"
                        type="radio"
                        :value="true"
                    >
                    <span style="font-size: 14px;">허용</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- 큐레이션 배틀 설정 -->
            <div v-else>
              <div class="form-group">
                <label class="form-label">
                  배틀 아이템 선택 <span class="required">*</span>
                </label>
                <div class="form-hint">최소 2개, 최대 20개까지 선택 가능합니다</div>
              </div>

              <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                <button
                    class="btn-secondary"
                    @click="showProductSearch = !showProductSearch"
                    style="flex: 1; padding: 16px;"
                >
                  📦 제품 목록에서 선택
                </button>
                <button
                    class="btn-secondary"
                    @click="showNewItemModal"
                    style="flex: 1; padding: 16px;"
                >
                  ➕ 새 아이템 직접 만들기
                </button>
              </div>

              <!-- 제품 검색 영역 -->
              <div v-if="showProductSearch" style="margin-bottom: 24px;">
                <div style="position: relative; margin-bottom: 16px;">
                  <input
                      v-model="searchQuery"
                      type="text"
                      class="form-input"
                      placeholder="제품명으로 검색..."
                      style="padding-left: 40px;"
                  >
                  <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%);">🔍</span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-height: 300px; overflow-y: auto;">
                  <div
                      v-for="product in filteredProducts"
                      :key="product.id"
                      class="product-item"
                      :class="{ selected: isProductSelected(product.id) }"
                      @click="toggleProduct(product)"
                      style="padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; cursor: pointer;"
                  >
                    <div style="width: 100%; height: 80px; background: #F3F4F6; border-radius: 4px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                      {{ product.emoji }}
                    </div>
                    <div style="font-size: 12px; font-weight: 600;">{{ product.name }}</div>
                    <div style="font-size: 11px; color: #9CA3AF;">{{ product.brand }}</div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">선택된 아이템 ({{ selectedItems.length }}/20)</label>
                <div style="min-height: 120px;">
                  <div
                      v-if="selectedItems.length === 0"
                      style="border: 2px dashed #E5E7EB; border-radius: 12px; padding: 40px; text-align: center; color: #9CA3AF;"
                  >
                    <div style="font-size: 32px; margin-bottom: 8px;">📦</div>
                    <div>아이템을 선택해주세요</div>
                  </div>
                  <div
                      v-else
                      style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;"
                  >
                    <div
                        v-for="(item, index) in selectedItems"
                        :key="item.id"
                        class="selected-item"
                    >
                      <div class="selected-item-remove" @click="removeItem(index)">×</div>
                      <div :style="`width: 100%; height: 80px; background: ${item.gradient}; border-radius: 6px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;`">
                        {{ item.emoji }}
                      </div>
                      <div style="font-size: 11px; font-weight: 600; text-align: center; line-height: 1.2;">
                        {{ item.name }}
                      </div>
                      <div style="font-size: 10px; color: #9CA3AF; text-align: center;">
                        {{ item.brand }}
                      </div>
                    </div>

                    <!-- 추가 버튼 -->
                    <div
                        v-if="selectedItems.length < 20"
                        style="padding: 8px; background: #F8F9FA; border: 2px dashed #E5E7EB; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; min-height: 120px; transition: all 0.2s;"
                        @click="showProductSearch = true"
                        @mouseover="$event.currentTarget.style.borderColor='#9CA3AF'; $event.currentTarget.style.background='#F3F4F6'"
                        @mouseout="$event.currentTarget.style.borderColor='#E5E7EB'; $event.currentTarget.style.background='#F8F9FA'"
                    >
                      <div style="font-size: 24px; margin-bottom: 4px;">➕</div>
                      <div style="font-size: 11px; color: #6B7280;">아이템 추가</div>
                    </div>
                  </div>
                </div>

                <div style="margin-top: 16px; padding: 16px; background: #FEF3C7; border-radius: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 14px;">💡</span>
                    <div style="font-size: 13px; color: #92400E;">
                      <strong>Tip:</strong> 드래그 앤 드롭으로 순서를 변경할 수 있어요. 첫 번째 아이템이 대표 이미지가 됩니다.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 우측 미리보기 -->
          <div class="preview-section">
            <div class="preview-label">미리보기</div>
            <div class="preview-card">
              <div
                  v-if="battleForm.type === 'curation' && selectedItems.length > 0"
                  class="preview-visual"
                  style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative; overflow: hidden;"
              >
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; padding: 20px; height: 100%;">
                  <div style="grid-column: span 1; grid-row: span 2; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                    <div style="text-align: center;">
                      <div style="font-size: 36px; margin-bottom: 4px;">{{ selectedItems[0].emoji }}</div>
                      <div style="font-size: 11px; color: white; font-weight: 600;">{{ selectedItems[0].name }}</div>
                    </div>
                  </div>
                  <div
                      v-for="i in 2"
                      :key="i"
                      style="background: rgba(255,255,255,0.15); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 20px; backdrop-filter: blur(10px);"
                  >
                    {{ selectedItems[i]?.emoji || '👟' }}
                  </div>
                </div>
                <div style="position: absolute; top: 12px; right: 12px; background: rgba(26, 26, 26, 0.8); color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;">
                  큐레이션
                </div>
              </div>
              <div v-else class="preview-visual">
                <div class="preview-visual-placeholder">{{ previewEmoji }}</div>
                <div class="preview-type-badge">{{ previewTypeName }}</div>
              </div>

              <div class="preview-content">
                <div class="preview-category">{{ previewCategoryName }}</div>
                <div class="preview-title">{{ battleForm.title || '배틀 제목을 입력해주세요' }}</div>
                <div class="preview-stats">
                  <div class="preview-stat">
                    <div class="preview-stat-value">0</div>
                    <div class="preview-stat-label">참여자</div>
                  </div>
                  <div class="preview-stat">
                    <div class="preview-stat-value">0</div>
                    <div class="preview-stat-label">투표</div>
                  </div>
                  <div class="preview-stat">
                    <div class="preview-stat-value">{{ selectedItems.length }}</div>
                    <div class="preview-stat-label">제품</div>
                  </div>
                </div>
                <div class="preview-footer">
                  <div class="preview-creator">@your_username</div>
                  <div class="preview-date">{{ dateDiffText }}</div>
                </div>
              </div>
            </div>

            <!-- 선택된 아이템 요약 -->
            <div v-if="selectedItems.length > 0" style="margin-top: 20px; padding: 16px; background: #F8F9FA; border-radius: 12px;">
              <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">선택된 아이템 미리보기</div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <span
                    v-for="(item, index) in selectedItems.slice(0, 4)"
                    :key="index"
                    style="padding: 4px 10px; background: white; border-radius: 6px; font-size: 12px; border: 1px solid #E5E7EB;"
                >
                  {{ item.name }}
                </span>
                <span
                    v-if="selectedItems.length > 4"
                    style="padding: 4px 10px; background: white; border-radius: 6px; font-size: 12px; border: 1px solid #E5E7EB;"
                >
                  +{{ selectedItems.length - 4 }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: 상세 설정 -->
        <div v-show="currentStep === 3" class="create-container">
          <div class="form-section">
            <div class="form-group">
              <label class="form-label">투표 방식</label>
              <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">
                <label style="padding: 16px; border: 2px solid #E5E7EB; border-radius: 8px; cursor: pointer;">
                  <input
                      v-model="battleForm.voteType"
                      type="radio"
                      value="single"
                      style="margin-right: 12px;"
                  >
                  <strong>1인 1표</strong>
                  <div style="font-size: 13px; color: #6B7280; margin-top: 4px; margin-left: 24px;">
                    각 유저가 하나의 제품에만 투표할 수 있습니다
                  </div>
                </label>
                <label style="padding: 16px; border: 2px solid #E5E7EB; border-radius: 8px; cursor: pointer;">
                  <input
                      v-model="battleForm.voteType"
                      type="radio"
                      value="multiple"
                      style="margin-right: 12px;"
                  >
                  <strong>1인 3표</strong>
                  <div style="font-size: 13px; color: #6B7280; margin-top: 4px; margin-left: 24px;">
                    1위, 2위, 3위를 각각 선택 (1위 3점, 2위 2점, 3위 1점)
                  </div>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">결과 공개 시점</label>
              <div style="display: flex; gap: 20px; margin-top: 12px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input
                      v-model="battleForm.resultPublic"
                      type="radio"
                      value="realtime"
                  >
                  <span style="font-size: 14px;">실시간 공개</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input
                      v-model="battleForm.resultPublic"
                      type="radio"
                      value="afterEnd"
                  >
                  <span style="font-size: 14px;">종료 후 공개</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">추가 리워드 설정 (선택)</label>
              <div style="padding: 16px; background: #F8F9FA; border-radius: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input
                      v-model="battleForm.hasAdditionalReward"
                      type="checkbox"
                  >
                  <span style="font-size: 14px;">추가 리워드 제공하기</span>
                </label>
                <input
                    v-if="battleForm.hasAdditionalReward"
                    v-model="battleForm.additionalReward"
                    type="text"
                    class="form-input"
                    placeholder="예: 1위에게 스타벅스 기프티콘 제공"
                    style="margin-top: 12px;"
                >
                <div v-if="battleForm.hasAdditionalReward" class="form-hint" style="margin-top: 4px;">
                  추가 리워드 설정 시 1,000 포인트가 차감됩니다
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">배틀 규칙 (선택)</label>
              <textarea
                  v-model="battleForm.rules"
                  class="form-input textarea"
                  placeholder="특별한 규칙이나 주의사항을 입력하세요"
              ></textarea>
            </div>
          </div>

          <div class="preview-section">
            <div class="preview-label">설정 요약</div>
            <div style="background: white; border-radius: 16px; padding: 24px; border: 1px solid #F0F0F3;">
              <div style="margin-bottom: 20px;">
                <div style="font-size: 12px; color: #9CA3AF; margin-bottom: 4px;">투표 방식</div>
                <div style="font-size: 14px; font-weight: 600;">
                  {{ battleForm.voteType === 'single' ? '1인 1표' : '1인 3표' }}
                </div>
              </div>
              <div style="margin-bottom: 20px;">
                <div style="font-size: 12px; color: #9CA3AF; margin-bottom: 4px;">결과 공개</div>
                <div style="font-size: 14px; font-weight: 600;">
                  {{ battleForm.resultPublic === 'realtime' ? '실시간 공개' : '종료 후 공개' }}
                </div>
              </div>
              <div style="margin-bottom: 20px;">
                <div style="font-size: 12px; color: #9CA3AF; margin-bottom: 4px;">기본 리워드</div>
                <div style="font-size: 14px;">
                  🥇 1위: +1,000 EXP, 챔피언 뱃지<br>
                  🥈 2위: +500 EXP<br>
                  🥉 3위: +300 EXP
                </div>
              </div>
              <div v-if="battleForm.hasAdditionalReward">
                <div style="font-size: 12px; color: #9CA3AF; margin-bottom: 4px;">추가 리워드</div>
                <div style="font-size: 14px; font-weight: 600;">
                  {{ battleForm.additionalReward || '설정됨' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: 최종 확인 -->
        <div v-show="currentStep === 4" class="create-container">
          <div class="form-section">
            <div style="text-align: center; padding: 40px 0;">
              <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
              <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">배틀 생성 준비 완료!</h2>
              <p style="color: #6B7280;">아래 내용을 최종 확인해주세요</p>
            </div>

            <div style="background: #F8F9FA; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">기본 정보</h3>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">배틀 제목</span>
                  <span style="font-weight: 500;">{{ battleForm.title }}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">배틀 타입</span>
                  <span style="font-weight: 500;">{{ previewTypeName }}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">카테고리</span>
                  <span style="font-weight: 500;">{{ previewCategoryName }}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">기간</span>
                  <span style="font-weight: 500;">
                    {{ battleForm.startDate }} ~ {{ battleForm.endDate }} ({{ dateDiff }}일)
                  </span>
                </div>
              </div>
            </div>

            <div style="background: #FEF3C7; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">⚠️</span>
                <div>
                  <strong style="font-size: 14px;">생성 후 수정 제한</strong>
                  <div style="font-size: 13px; color: #92400E; margin-top: 4px;">
                    배틀이 시작되면 기본 정보는 수정할 수 없습니다
                  </div>
                </div>
              </div>
            </div>

            <div style="margin-top: 32px;">
              <label style="display: flex; align-items: start; gap: 8px; cursor: pointer;">
                <input v-model="battleForm.agreeTerms" type="checkbox" style="margin-top: 2px;">
                <span style="font-size: 14px; color: #6B7280;">
                  배틀 생성 규칙과 가이드라인을 모두 확인했으며, 이에 동의합니다
                </span>
              </label>
            </div>
          </div>

          <div class="preview-section">
            <div class="preview-label">최종 미리보기</div>
            <div class="preview-card">
              <div
                  v-if="battleForm.type === 'curation' && selectedItems.length > 0"
                  class="preview-visual"
                  style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative; overflow: hidden;"
              >
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; padding: 20px; height: 100%;">
                  <div style="grid-column: span 1; grid-row: span 2; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                    <div style="text-align: center;">
                      <div style="font-size: 36px; margin-bottom: 4px;">{{ selectedItems[0].emoji }}</div>
                      <div style="font-size: 11px; color: white; font-weight: 600;">{{ selectedItems[0].name }}</div>
                    </div>
                  </div>
                  <div
                      v-for="i in 2"
                      :key="i"
                      style="background: rgba(255,255,255,0.15); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 20px; backdrop-filter: blur(10px);"
                  >
                    {{ selectedItems[i]?.emoji || '👟' }}
                  </div>
                </div>
                <div style="position: absolute; top: 12px; right: 12px; background: rgba(26, 26, 26, 0.8); color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;">
                  큐레이션
                </div>
              </div>
              <div v-else class="preview-visual">
                <div class="preview-visual-placeholder" style="color: white;">{{ previewEmoji }}</div>
                <div class="preview-type-badge">{{ previewTypeName }}</div>
              </div>

              <div class="preview-content">
                <div class="preview-category">{{ previewCategoryName }}</div>
                <div class="preview-title">{{ battleForm.title }}</div>
                <div class="preview-stats">
                  <div class="preview-stat">
                    <div class="preview-stat-value">0</div>
                    <div class="preview-stat-label">참여자</div>
                  </div>
                  <div class="preview-stat">
                    <div class="preview-stat-value">0</div>
                    <div class="preview-stat-label">투표</div>
                  </div>
                  <div class="preview-stat">
                    <div class="preview-stat-value">{{ selectedItems.length }}</div>
                    <div class="preview-stat-label">제품</div>
                  </div>
                </div>
                <div class="preview-footer">
                  <div class="preview-creator">@your_username</div>
                  <div class="preview-date">{{ dateDiffText }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 액션 버튼 -->
      <div class="action-footer">
        <div class="action-container">
          <div class="step-info">
            {{ currentStep }}/4 단계 - {{ steps[currentStep - 1] }}
          </div>
          <div class="action-buttons">
            <button class="btn-secondary" @click="handlePrevious">
              {{ currentStep === 1 ? '취소' : '이전' }}
            </button>
            <button
                class="btn-primary"
                @click="handleNext"
                :disabled="!canProceed"
            >
              {{ currentStep === 4 ? '배틀 생성하기' : '다음 단계' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 스텝 정의
const steps = ['기본 정보', '아이템 설정', '상세 설정', '최종 확인'];
const currentStep = ref(1);

// 배틀 타입 옵션
const battleTypes = [
  {
    value: 'open',
    icon: '🌐',
    title: '오픈 배틀',
    desc: '누구나 자유롭게 제품을 등록할 수 있어요'
  },
  {
    value: 'curation',
    icon: '✨',
    title: '큐레이션 배틀',
    desc: '내가 직접 선정한 제품들만 투표 대상이 돼요'
  }
];

// 카테고리 옵션
const categories = [
  { value: 'sneakers', emoji: '👟', name: '스니커즈' },
  { value: 'tech', emoji: '💻', name: '테크' },
  { value: 'beauty', emoji: '💄', name: '뷰티' },
  { value: 'fnb', emoji: '☕', name: 'F&B' },
  { value: 'fashion', emoji: '👕', name: '패션' },
  { value: 'living', emoji: '🛋️', name: '리빙' },
  { value: 'game', emoji: '🎮', name: '게임' },
  { value: 'etc', emoji: '📚', name: '기타' }
];

// 배틀 폼 데이터
const battleForm = ref({
  title: '',
  type: 'open',
  category: 'sneakers',
  startDate: '2025-02-01',
  endDate: '2025-02-28',
  description: '',
  minLevel: '',
  maxProducts: '',
  allowDuplicate: false,
  voteType: 'single',
  resultPublic: 'realtime',
  hasAdditionalReward: false,
  additionalReward: '',
  rules: '',
  agreeTerms: false
});

// 제품 관련
const showProductSearch = ref(false);
const searchQuery = ref('');
const selectedItems = ref([
  { id: 1, name: '나이키 덩크 로우', brand: 'Nike', emoji: '👟', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 2, name: '조던 4 레트로', brand: 'Jordan', emoji: '👟', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 3, name: '아디다스 예지', brand: 'Adidas', emoji: '👟', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 4, name: '뉴발란스 550', brand: 'New Balance', emoji: '👟', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 5, name: '반스 올드스쿨', brand: 'Vans', emoji: '👟', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { id: 6, name: '컨버스 척 70', brand: 'Converse', emoji: '👟', gradient: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)' },
  { id: 7, name: '나이키 에어맥스', brand: 'Nike', emoji: '👟', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { id: 8, name: '아식스 젤 카야노', brand: 'Asics', emoji: '👟', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }
]);

// Mock 제품 목록
const products = ref([
  { id: 1, name: '나이키 덩크 로우', brand: 'Nike', emoji: '👟' },
  { id: 2, name: '조던 4 레트로', brand: 'Jordan', emoji: '👟' },
  { id: 3, name: '아디다스 예지', brand: 'Adidas', emoji: '👟' },
  { id: 4, name: '뉴발란스 550', brand: 'New Balance', emoji: '👟' },
  { id: 5, name: '반스 올드스쿨', brand: 'Vans', emoji: '👟' },
  { id: 6, name: '컨버스 척 70', brand: 'Converse', emoji: '👟' }
]);

// Computed
const previewTypeName = computed(() => {
  const type = battleTypes.find(t => t.value === battleForm.value.type);
  return type ? type.title : '';
});

const previewCategoryName = computed(() => {
  const category = categories.find(c => c.value === battleForm.value.category);
  return category ? category.name : '';
});

const previewEmoji = computed(() => {
  const category = categories.find(c => c.value === battleForm.value.category);
  return category ? category.emoji : '📦';
});

const dateDiff = computed(() => {
  if (!battleForm.value.startDate || !battleForm.value.endDate) return 0;
  const start = new Date(battleForm.value.startDate);
  const end = new Date(battleForm.value.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

const dateDiffText = computed(() => {
  return `${dateDiff.value}일간 진행`;
});

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  return products.value.filter(p =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return battleForm.value.title.length > 0 &&
          battleForm.value.category &&
          battleForm.value.startDate &&
          battleForm.value.endDate;
    case 2:
      if (battleForm.value.type === 'curation') {
        return selectedItems.value.length >= 2;
      }
      return true;
    case 3:
      return true;
    case 4:
      return battleForm.value.agreeTerms;
    default:
      return false;
  }
});

// Methods
const selectBattleType = (type) => {
  battleForm.value.type = type;
};

const selectCategory = (category) => {
  battleForm.value.category = category;
};

const isProductSelected = (productId) => {
  return selectedItems.value.some(item => item.id === productId);
};

const toggleProduct = (product) => {
  const index = selectedItems.value.findIndex(item => item.id === product.id);

  if (index !== -1) {
    selectedItems.value.splice(index, 1);
  } else {
    if (selectedItems.value.length < 20) {
      const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
        'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)'
      ];

      selectedItems.value.push({
        ...product,
        gradient: gradients[selectedItems.value.length % gradients.length]
      });
    } else {
      alert('최대 20개까지만 선택 가능합니다');
    }
  }
};

const removeItem = (index) => {
  selectedItems.value.splice(index, 1);
};

const handleNext = () => {
  if (currentStep.value < 4) {
    currentStep.value++;
  } else {
    createBattle();
  }
};

const handlePrevious = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  } else {
    if (confirm('배틀 생성을 취소하시겠습니까?')) {
      handleBack();
    }
  }
};

const handleBack = () => {
  // 라우터 연동 시 사용
  console.log('뒤로 가기');
};

const saveDraft = () => {
  console.log('임시저장', battleForm.value);
  alert('임시저장되었습니다');
};

const showNewItemModal = () => {
  alert('새 아이템 추가 모달 (구현 예정)');
};

const createBattle = () => {
  console.log('배틀 생성', battleForm.value);
  alert('배틀이 생성되었습니다!');
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: #FAFBFC;
  color: #1A1A1A;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* 왼쪽 사이드바 */
.sidebar-left {
  width: 260px;
  background: #FFFFFF;
  border-right: 1px solid #F0F0F3;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 32px 24px;
  border-bottom: 1px solid #F0F0F3;
}

.logo h1 {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #1A1A1A;
}

.nav-menu {
  flex: 1;
  padding: 24px 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  color: #737380;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  margin-bottom: 2px;
  cursor: pointer;
}

.nav-item:hover {
  background: #F8F9FA;
  color: #1A1A1A;
}

.nav-item.active {
  background: #1A1A1A;
  color: #FFFFFF;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

/* 메인 컨텐츠 */
.main-content {
  flex: 1;
  margin-left: 260px;
  background: #FAFBFC;
}

/* 생성 헤더 */
.create-header {
  background: #FFFFFF;
  padding: 24px 40px;
  border-bottom: 1px solid #F0F0F3;
  position: sticky;
  top: 0;
  z-index: 30;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #9CA3AF;
  color: #1A1A1A;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1A1A1A;
  letter-spacing: -0.02em;
}

.save-draft-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-draft-btn:hover {
  border-color: #9CA3AF;
  color: #1A1A1A;
}

/* 스텝 인디케이터 */
.step-indicator {
  background: white;
  padding: 24px 40px;
  border-bottom: 1px solid #F0F0F3;
}

.steps {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 600px;
  margin: 0 auto;
}

.step {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F3F4F6;
  color: #9CA3AF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.step.active .step-number {
  background: #1A1A1A;
  color: white;
}

.step.completed .step-number {
  background: #10B981;
  color: white;
}

.step-label {
  font-size: 14px;
  font-weight: 500;
  color: #9CA3AF;
}

.step.active .step-label {
  color: #1A1A1A;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #E5E7EB;
  margin: 0 -4px;
}

.step.completed ~ .step-line {
  background: #10B981;
}

/* 컨텐츠 영역 */
.content-area {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
}

.create-container {
  display: flex;
  gap: 32px;
}

/* 좌측 - 입력 폼 */
.form-section {
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #F0F0F3;
}

.form-group {
  margin-bottom: 32px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.required {
  color: #DC2626;
}

.form-hint {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #1A1A1A;
}

.textarea {
  min-height: 100px;
  resize: vertical;
}

.char-counter {
  text-align: right;
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
}

/* 배틀 타입 선택 */
.battle-type-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.type-option {
  padding: 20px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.type-option:hover {
  border-color: #9CA3AF;
}

.type-option.selected {
  border-color: #1A1A1A;
  background: #FAFBFC;
}

.type-icon {
  width: 40px;
  height: 40px;
  background: #F3F4F6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 12px;
}

.type-option.selected .type-icon {
  background: #1A1A1A;
}

.type-title {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.type-desc {
  font-size: 13px;
  color: #6B7280;
  line-height: 1.4;
}

/* 카테고리 선택 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.category-item {
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  border-color: #9CA3AF;
  background: #FAFBFC;
}

.category-item.selected {
  border-color: #1A1A1A;
  background: #1A1A1A;
  color: white;
}

.category-emoji {
  font-size: 24px;
  margin-bottom: 4px;
}

.category-name {
  font-size: 12px;
  font-weight: 500;
}

/* 날짜 선택 */
.date-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-label {
  font-size: 12px;
  color: #6B7280;
  font-weight: 500;
}

/* 우측 - 미리보기 */
.preview-section {
  width: 400px;
  position: sticky;
  top: 140px;
  height: fit-content;
}

.preview-label {
  font-size: 14px;
  font-weight: 600;
  color: #6B7280;
  margin-bottom: 16px;
}

.preview-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #F0F0F3;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.preview-visual {
  height: 180px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-visual-placeholder {
  font-size: 48px;
  opacity: 0.5;
}

.preview-type-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 6px;
  color: white;
  font-size: 11px;
  font-weight: 600;
}

.preview-content {
  padding: 24px;
}

.preview-category {
  font-size: 12px;
  color: #9CA3AF;
  margin-bottom: 8px;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16px;
  min-height: 50px;
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid #F3F4F6;
  border-bottom: 1px solid #F3F4F6;
}

.preview-stat {
  text-align: center;
}

.preview-stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1A1A1A;
}

.preview-stat-label {
  font-size: 11px;
  color: #9CA3AF;
}

.preview-footer {
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-creator {
  font-size: 13px;
  color: #6B7280;
}

.preview-date {
  font-size: 12px;
  color: #9CA3AF;
}

/* 제품 아이템 */
.product-item {
  transition: all 0.2s;
}

.product-item:hover {
  border-color: #9CA3AF !important;
  transform: translateY(-2px);
}

.product-item.selected {
  border-color: #1A1A1A !important;
  background: #FAFBFC;
}

.selected-item {
  position: relative;
  padding: 8px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.selected-item-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: #1A1A1A;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.selected-item:hover .selected-item-remove {
  opacity: 1;
}

/* 하단 액션 버튼 */
.action-footer {
  background: white;
  border-top: 1px solid #F0F0F3;
  padding: 24px 40px;
  position: sticky;
  bottom: 0;
  z-index: 20;
}

.action-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-info {
  font-size: 14px;
  color: #6B7280;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  padding: 10px 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #9CA3AF;
  color: #1A1A1A;
}

.btn-primary {
  padding: 10px 24px;
  background: #1A1A1A;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #000000;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
  transform: none;
}
</style>