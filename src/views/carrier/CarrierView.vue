<template>
  <div class="carrier-page" :class="{ 'no-select': !!dragId }">
        <!-- 헤더 -->
        <header class="carrier-top-header">
          <div class="header-container">
            <button class="back-btn" @click="router.back()">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12.5 15L7.5 10L12.5 5"/>
              </svg>
            </button>
            <div class="header-title-area">
              <h1 class="header-page-title">내 캐리어</h1>
              <span class="header-item-count">{{ items.length }}개 아이템</span>
            </div>
          </div>
        </header>

        <!-- 모바일 탭 바 -->
        <div class="mobile-tab-bar">
          <button
            class="mobile-tab"
            :class="{ active: mobileTab === 'shop' }"
            @click="mobileTab = 'shop'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>캐꾸샵</span>
          </button>
          <button
            class="mobile-tab"
            :class="{ active: mobileTab === 'carrier' }"
            @click="mobileTab = 'carrier'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/>
            </svg>
            <span>캐리어</span>
          </button>
          <button
            class="mobile-tab"
            :class="{ active: mobileTab === 'items' }"
            @click="mobileTab = 'items'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span>아이템</span>
          </button>
        </div>

        <!-- 로딩 -->
        <div v-if="apiLoading && items.length === 0" class="loading-state">
          <div class="spinner"></div>
          <p>캐리어를 불러오는 중...</p>
        </div>

        <!-- 메인 컨텐츠 -->
        <div v-else class="carrier-content">
          <div class="carrier-layout">

            <!-- 좌측: 캐꾸샵 -->
            <div class="left-panel" :class="{ 'mobile-active': mobileTab === 'shop' }">
              <div class="panel-title-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span class="panel-label">캐꾸샵</span>
              </div>

              <!-- 스킨 선택 -->
              <div class="shop-card">
                <div class="shop-card-header">
                  <span class="shop-card-title">스킨</span>
                  <div class="shop-card-actions">
                    <div class="current-skin-badge">
                      <span>{{ currentSkin.name }}</span>
                    </div>
                  </div>
                </div>
                <div class="skin-carousel">
                  <button class="carousel-btn" :disabled="skinScroll <= 0" @click="scrollSkins(-1)">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                  <div class="skin-viewport">
                    <div class="skin-track" :style="{ transform: `translateX(-${skinScroll}px)` }">
                      <div
                        v-for="item in allSkinItems"
                        :key="item.id"
                        class="skin-item-wrap"
                      >
                        <div
                          class="skin-preview"
                          :class="{ active: activeSkin === item.id }"
                          @click="activeSkin = item.id"
                        >
                          <div v-if="item.special" class="skin-badge sp">SP</div>
                          <div class="skin-svg-wrap">
                            <svg width="60" height="80" viewBox="0 0 300 400" fill="none">
                              <defs>
                                <linearGradient :id="`pg-${item.id}`" x1="0" y1="0" x2="1" y2="1">
                                  <stop offset="0%" :stop-color="item.body.grad1"/>
                                  <stop offset="100%" :stop-color="item.body.grad2"/>
                                </linearGradient>
                              </defs>
                              <rect x="30" y="50" width="240" height="320" rx="20" :fill="`url(#pg-${item.id})`" :stroke="item.body.stroke" stroke-width="5"/>
                              <rect x="116" y="6" width="68" height="18" rx="9" :fill="item.handle.grip" :stroke="item.handle.stroke" stroke-width="3.5"/>
                              <rect x="98" y="80" width="22" height="250" rx="11" :fill="item.groove.fill" :stroke="item.groove.stroke" stroke-width="3"/>
                              <rect x="139" y="80" width="22" height="250" rx="11" :fill="item.groove.fill" :stroke="item.groove.stroke" stroke-width="3"/>
                              <rect x="180" y="80" width="22" height="250" rx="11" :fill="item.groove.fill" :stroke="item.groove.stroke" stroke-width="3"/>
                              <circle cx="70" cy="382" r="10" :fill="item.wheel.fill" :stroke="item.wheel.stroke" stroke-width="3"/>
                              <circle cx="230" cy="382" r="10" :fill="item.wheel.fill" :stroke="item.wheel.stroke" stroke-width="3"/>
                            </svg>
                          </div>
                          <div class="skin-info">
                            <div class="skin-name">{{ item.name }}</div>
                            <div class="skin-desc">{{ item.desc }}</div>
                          </div>
                          <div v-if="activeSkin === item.id" class="skin-active-bar"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button class="carousel-btn" :disabled="skinScroll >= skinMaxScroll" @click="scrollSkins(1)">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </div>
                <!-- 캐꾸 저장 -->
                <Transition name="deco-bar">
                  <div v-if="hasUnsavedChanges" class="deco-save-bar">
                    <div class="deco-save-left">
                      <svg class="deco-save-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span class="deco-save-label">변경사항 있음</span>
                    </div>
                    <button
                      class="deco-save-btn"
                      :class="{ disabled: saving }"
                      :disabled="saving"
                      @click="saveAllChanges"
                    >{{ saving ? '저장 중...' : '저장' }}</button>
                  </div>
                </Transition>
              </div>

              <!-- 스티커팩 -->
              <div class="shop-card">
                <div class="shop-card-header">
                  <span class="shop-card-title">스티커팩</span>
                  <div class="deco-page-nav">
                    <span class="page-info">{{ decoPage + 1 }}/{{ decoPages.length }}</span>
                    <button class="page-btn" :disabled="decoPage <= 0" @click="decoPage--">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="page-btn" :disabled="decoPage >= decoPages.length - 1" @click="decoPage++">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                  </div>
                </div>
                <div class="sticker-pack-tabs">
                  <div class="pack-tabs-left">
                    <button
                      v-for="[key, label] in PACK_LABELS"
                      :key="key"
                      class="pack-tab"
                      :class="{ active: stickerPack === key }"
                      @click="stickerPack = key; decoPage = 0"
                    >{{ label }}</button>
                  </div>
                  <button
                    class="pack-tab pack-tab-special"
                    :class="{ active: stickerPack === SPECIAL_PACK[0] }"
                    @click="stickerPack = SPECIAL_PACK[0]; decoPage = 0"
                  >{{ SPECIAL_PACK[1] }}</button>
                </div>
                <div class="deco-grid-viewport">
                  <div class="deco-track" :style="{ transform: `translateX(-${decoPage * (100 / decoPages.length)}%)`, width: decoPages.length * 100 + '%' }">
                    <div v-for="(pg, pi) in decoPages" :key="pi" class="deco-page" :style="{ width: (100 / decoPages.length) + '%' }">
                      <div v-for="d in pg" :key="d.id"
                        class="deco-item"
                        :class="{ 'deco-empty': d.empty, 'deco-special': d.type === 'phototag', 'deco-active': d.type === 'phototag' && hasPhototag }"
                        @click="!d.empty && placeDeco(d)">
                        <template v-if="d.type === 'phototag'">
                          <span class="special-icon">📷</span>
                          <span class="special-label">{{ d.label }}</span>
                        </template>
                        <template v-else>{{ d.emoji }}</template>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="decos.length > 0" class="save-deco-wrap">
                  <button
                    class="clear-all-deco-btn"
                    @click="bulkDeleteAllDecos"
                  >전체 삭제 ({{ decos.length }})</button>
                </div>
              </div>
            </div>

            <!-- 중앙: 캐리어 뷰 -->
            <div class="center-panel" :class="{ 'mobile-active': mobileTab === 'carrier' }">
              <!-- 캐꾸 슬롯 탭 -->
              <div class="carrier-slot-tabs">
                <button
                  v-for="idx in SLOT_COUNT"
                  :key="idx - 1"
                  class="slot-tab"
                  :class="{ active: activeSlotIdx === idx - 1, empty: !slotCarrierIds[idx - 1] }"
                  :disabled="slotSwitching"
                  @click="selectSlot(idx - 1)"
                >
                  내 캐리어 {{ idx }}<span v-if="activeSlotIdx === idx - 1 && hasUnsavedChanges" class="slot-unsaved-dot"></span>
                </button>
              </div>

              <div class="carrier-box-wrap">
                <div v-if="slotSwitching" class="slot-loading-overlay">
                  <div class="spinner"></div>
                </div>
                <div ref="boxRef" class="carrier-box" @click="selDeco = null; showColorPicker = false">

                  <!-- 컬러 피커 (기본 스킨 전용) -->
                  <div v-if="activeSkin === 'default'" class="color-picker">
                    <div
                      v-for="c in DEFAULT_COLORS"
                      :key="c.id"
                      class="color-dot"
                      :class="{ active: defaultColor === c.id }"
                      :style="{ background: c.dot, boxShadow: defaultColor === c.id ? `0 0 0 2px ${c.dot}44` : '0 2px 6px rgba(0,0,0,0.12)' }"
                      @click.stop="defaultColor = c.id"
                    ></div>
                  </div>

                  <!-- 토글 바 -->
                  <div class="view-toggle-bar">
                    <div class="inline-slot-tabs">
                      <button
                        v-for="idx in SLOT_COUNT"
                        :key="idx - 1"
                        class="inline-slot-btn"
                        :class="{ active: activeSlotIdx === idx - 1 }"
                        :disabled="slotSwitching"
                        @click="selectSlot(idx - 1)"
                      >{{ idx }}<span v-if="activeSlotIdx === idx - 1 && hasUnsavedChanges" class="inline-slot-dot"></span></button>
                    </div>
                    <div class="view-toggle">
                      <span class="toggle-label">내부 보기</span>
                      <div class="toggle-switch" :class="{ on: isOpen }" @click="toggle">
                        <div class="toggle-knob" :style="{ left: isOpen ? '27px' : '3px' }"></div>
                      </div>
                    </div>
                  </div>

                  <div class="carrier-view-area">
                    <!-- 외관 보기 -->
                    <div class="carrier-layer" :class="{ visible: !isOpen }">
                      <svg width="100%" height="100%" viewBox="0 0 300 400" fill="none" preserveAspectRatio="xMidYMid meet">
                        <defs>
                          <filter id="bI" x="-10%" y="-10%" width="120%" height="120%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="b1"/>
                            <feOffset dx="6" dy="6" result="o1"/>
                            <feComposite in="o1" in2="SourceGraphic" operator="in" result="s1"/>
                            <feFlood flood-color="#6b5b9a" flood-opacity=".2" result="sc"/>
                            <feComposite in="sc" in2="s1" operator="in" result="sh"/>
                            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="b2"/>
                            <feOffset dx="-5" dy="-5" result="o2"/>
                            <feComposite in="o2" in2="SourceGraphic" operator="in" result="h1"/>
                            <feFlood flood-color="#fff" flood-opacity=".5" result="hc"/>
                            <feComposite in="hc" in2="h1" operator="in" result="hl"/>
                            <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/><feMergeNode in="hl"/></feMerge>
                          </filter>
                          <linearGradient id="sG" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" :stop-color="currentSkin.body.grad1"/>
                            <stop offset="100%" :stop-color="currentSkin.body.grad2"/>
                          </linearGradient>
                          <filter id="iS" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b"/>
                            <feOffset dx="-2" dy="1" result="ob"/>
                            <feComposite in="ob" in2="SourceGraphic" operator="in" result="s"/>
                            <feFlood flood-color="#7b6fa8" flood-opacity=".3" result="sc2"/>
                            <feComposite in="sc2" in2="s" operator="in" result="is"/>
                            <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="is"/></feMerge>
                          </filter>
                        </defs>
                        <rect x="30" y="50" width="240" height="320" rx="20" fill="url(#sG)" :stroke="currentSkin.body.stroke" stroke-width="3" filter="url(#bI)"/>
                        <line x1="52" y1="122" x2="52" y2="289" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".3"/>
                        <rect x="122" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
                        <rect x="170" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
                        <rect x="116" y="6" width="68" height="18" rx="9" :fill="currentSkin.handle.grip" :stroke="currentSkin.handle.stroke" stroke-width="2.5"/>
                        <rect x="98" y="80" width="22" height="250" rx="11" :fill="currentSkin.groove.fill" :stroke="currentSkin.groove.stroke" stroke-width="2" filter="url(#iS)"/>
                        <rect x="139" y="80" width="22" height="250" rx="11" :fill="currentSkin.groove.fill" :stroke="currentSkin.groove.stroke" stroke-width="2" filter="url(#iS)"/>
                        <rect x="180" y="80" width="22" height="250" rx="11" :fill="currentSkin.groove.fill" :stroke="currentSkin.groove.stroke" stroke-width="2" filter="url(#iS)"/>
                        <!-- 스킨 스티커 (내장) -->
                        <template v-for="(st, i) in currentSkin.stickers" :key="'sk-' + i">
                            <!-- smallheart -->
                            <g v-if="st.type === 'smallheart'" :transform="`translate(${st.x},${st.y})`">
                              <path d="M0 7C-2 5-9 1-9-4C-9-8-5-10 0-6C5-10 9-8 9-4C9 1 2 5 0 7Z" fill="#fca5a5" stroke="#f87171" stroke-width="1"/>
                            </g>
                            <!-- bigbow -->
                            <g v-else-if="st.type === 'bigbow'" :transform="`translate(${st.x},${st.y})`">
                              <path d="M-20 0C-20-15-4-15 0 0C4-15 20-15 20 0C20 15 4 15 0 0C-4 15-20 15-20 0Z" fill="#dc2626" stroke="#222" stroke-width="1.5"/>
                              <circle r="5" fill="#dc2626" stroke="#222" stroke-width="1.2"/>
                            </g>
                            <!-- stamp -->
                            <g v-else-if="st.type === 'stamp'" :transform="`translate(${st.x},${st.y})`">
                              <rect x="-28" y="-16" width="56" height="32" rx="4" fill="none" :stroke="st.color" stroke-width="2.5" stroke-dasharray="3 2" opacity="0.7"/>
                              <text x="0" y="5" text-anchor="middle" font-size="11" font-weight="900" :fill="st.color" opacity="0.75" font-family="monospace">{{ st.label }}</text>
                            </g>
                            <!-- star -->
                            <circle v-else-if="st.type === 'star'" :cx="st.x" :cy="st.y" :r="st.size || 4" fill="#e0e7ff" opacity="0.6">
                              <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite"/>
                            </circle>
                            <!-- planet -->
                            <g v-else-if="st.type === 'planet'" :transform="`translate(${st.x},${st.y})`">
                              <circle r="12" fill="#818cf8" opacity="0.6"/>
                              <ellipse rx="20" ry="5" fill="none" stroke="#c7d2fe" stroke-width="1.5" opacity="0.5" transform="rotate(-20)"/>
                            </g>
                        </template>
                        <!-- 포토택 (고정 위치) -->
                        <g v-if="hasPhototag" transform="rotate(-4,126,53)" class="phototag-fixed"
                           @mouseenter="onPhototagHover($event, true)"
                           @mouseleave="onPhototagHover($event, false)">
                          <line x1="126" y1="53" x2="126" y2="78" :stroke="currentSkin.body.stroke" stroke-width="1.5" opacity=".4" stroke-linecap="round"/>
                          <rect x="97" y="78" width="58" height="76" rx="4" fill="#fff" fill-opacity=".92" :stroke="currentSkin.body.stroke" stroke-width="1.2" opacity=".6"/>
                          <circle cx="126" cy="86" r="3" fill="none" :stroke="currentSkin.body.stroke" stroke-width=".8" opacity=".3"/>
                          <line x1="98" y1="96" x2="154" y2="96" :stroke="currentSkin.body.stroke" stroke-width=".5" opacity=".15"/>
                          <template v-if="nameTagImg">
                            <defs><clipPath id="ntC"><rect x="97.6" y="96.5" width="56.8" height="57.4" rx="3"/></clipPath></defs>
                            <image :href="nameTagImg" x="97.6" y="96.5" width="56.8" height="57.4" preserveAspectRatio="xMidYMid slice" clip-path="url(#ntC)"/>
                          </template>
                          <text v-else-if="phototagUploading" text-anchor="middle" font-size="10" :fill="currentSkin.body.stroke" opacity=".6">
                            <tspan x="126" y="125">업로드 중...</tspan>
                          </text>
                          <text v-else text-anchor="middle" font-size="11" font-weight="800" :fill="currentSkin.body.stroke" opacity=".5" font-family="monospace" letter-spacing="1">
                            <tspan x="126" y="120">PHOTO</tspan>
                            <tspan x="126" dy="14">TAG</tspan>
                          </text>
                          <!-- 사진 영역 클릭 → 사진 변경 -->
                          <rect x="98" y="97" width="56" height="56" rx="3" fill="transparent" style="cursor: pointer" @click.stop="!phototagUploading && nameTagInputRef?.click()"/>
                          <!-- 사진 삭제 (X) -->
                          <g v-if="nameTagImg && !phototagUploading" class="nt-del" @click.stop="clearPhototagImage()" style="cursor: pointer">
                            <circle cx="154" cy="98" r="7" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>
                            <text x="154" y="101.5" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">✕</text>
                          </g>
                          <!-- 프레임 영역 클릭 → 포토택 선택 -->
                          <rect x="97" y="53" width="58" height="43" rx="4" fill="transparent" style="cursor: pointer" @click.stop="selectPhototag()"/>
                        </g>
                        <!-- 바퀴 -->
                        <rect x="62" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
                        <circle cx="70" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/>
                        <circle cx="70" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
                        <rect x="222" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
                        <circle cx="230" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/>
                        <circle cx="230" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
                      </svg>
                    </div>

                    <!-- 내부 보기 (물리 버블) -->
                    <div class="carrier-layer" :class="{ visible: isOpen }">
                      <!-- 캐리어 프레임 (스킨 색상 적용) -->
                      <svg class="carrier-frame-svg" viewBox="0 0 300 400" fill="none" preserveAspectRatio="xMidYMid meet">
                        <rect x="122" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
                        <rect x="170" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
                        <rect x="116" y="6" width="68" height="18" rx="9" :fill="currentSkin.handle.grip" :stroke="currentSkin.handle.stroke" stroke-width="2.5"/>
                        <rect x="30" y="50" width="240" height="320" rx="20" :stroke="currentSkin.body.stroke" stroke-width="2" stroke-dasharray="8 4" fill="none" opacity=".5"/>
                        <line x1="30" y1="140" x2="270" y2="140" :stroke="currentSkin.body.stroke" stroke-width="1.5" stroke-dasharray="6 4" opacity=".3"/>
                        <line x1="30" y1="260" x2="270" y2="260" :stroke="currentSkin.body.stroke" stroke-width="1.5" stroke-dasharray="6 4" opacity=".3"/>
                        <rect x="62" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
                        <circle cx="70" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/><circle cx="70" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
                        <rect x="222" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
                        <circle cx="230" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/><circle cx="230" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
                      </svg>
                      <!-- 물리 버블 영역 -->
                      <div ref="innerRef" class="physics-area">
                        <div v-if="items.length === 0" class="empty-carrier">캐리어가 비어있어요</div>
                        <div
                          v-for="(pos, i) in rendered"
                          :key="sortedItems[i]?.id"
                          v-show="sortedItems[i] && pos"
                          class="bubble"
                          :class="{
                            'is-selected': selected === sortedItems[i]?.id,
                            'is-dragging': dragId === sortedItems[i]?.id
                          }"
                          :style="getBubbleStyle(i, pos)"
                          @mousedown.prevent="onBubbleDown($event, sortedItems[i]?.id)"
                          @touchstart.prevent="onBubbleDown($event, sortedItems[i]?.id)"
                          @click="!dragId && toggleSelect(sortedItems[i]?.id)"
                        >
                          <span v-if="nodes[i]?.r > 24" class="bubble-name" :style="{ fontSize: Math.max(11, nodes[i].r * 0.22) + 'px', color: getRankStyle(i + 1, sortedItems.length).tc }">
                            {{ sortedItems[i]?.name }}
                          </span>
                          <span v-if="nodes[i]?.r > 40" class="bubble-brand" :style="{ fontSize: Math.max(9, nodes[i].r * 0.14) + 'px', color: getRankStyle(i + 1, sortedItems.length).sc }">
                            {{ sortedItems[i]?.brand }}
                          </span>
                          <!-- 랭킹 뱃지 -->
                          <div v-if="i < 3" class="rank-badge top" :style="{ background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32', color: i === 0 ? '#7a5a00' : i === 1 ? '#444' : '#5a2d00', fontSize: Math.max(8, (nodes[i]?.r || 30) * 0.12) + 'px' }">
                            {{ i + 1 }}
                          </div>
                          <div v-else class="rank-badge normal" :style="{ width: Math.max(14, (nodes[i]?.r || 30) * 0.24) + 'px', height: Math.max(14, (nodes[i]?.r || 30) * 0.24) + 'px', fontSize: Math.max(7, (nodes[i]?.r || 30) * 0.12) + 'px' }">
                            {{ i + 1 }}
                          </div>
                          <!-- 삭제 버튼 -->
                          <div
                            v-if="selected === sortedItems[i]?.id && dragId !== sortedItems[i]?.id"
                            class="bubble-remove"
                            @mousedown.stop.prevent
                            @click.stop="removeItemFromCarrier(sortedItems[i]?.id)"
                            @touchstart.stop.prevent
                            @touchend.stop.prevent="removeItemFromCarrier(sortedItems[i]?.id)"
                          >✕</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 공유하기 버튼 -->
                  <button class="share-btn" @click.stop="showShareModal = true">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </button>

                </div>

                <!-- 배치 중인 스티커 오버레이 (포토택 제외 - 고정 위치) -->
                <template v-if="!isOpen">
                  <div
                    v-for="d in emojiDecos"
                    :key="d.uid"
                    class="deco-overlay"
                    :style="getDecoOverlayStyle(d)"
                  >
                    <div
                      class="deco-emoji"
                      :class="{ selected: selDeco === d.uid }"
                      :style="{ fontSize: decoFont * d.scale + 'px', width: decoBase * d.scale + 'px', height: decoBase * d.scale + 'px', transform: d.flipped ? 'scaleX(-1)' : 'scaleX(1)' }"
                      @mousedown.prevent.stop="onDecoDown($event, d.uid)"
                      @touchstart.prevent.stop="onDecoDown($event, d.uid)"
                    >{{ d.emoji }}</div>
                    <div v-if="selDeco === d.uid" class="deco-toolbar" @click.stop>
                      <button class="tb-btn" @click.stop="flipDeco(d.uid)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 3 3 7 7 11"/><path d="M3 7h13a5 5 0 010 10h-4"/></svg>
                      </button>
                      <div class="tb-sep"></div>
                      <button class="tb-btn" :disabled="d.scale <= DMIN" @click.stop="scaleDeco(d.uid, -DSTEP)">−</button>
                      <span class="tb-scale">{{ Math.round(d.scale * 100) }}%</span>
                      <button class="tb-btn" :disabled="d.scale >= DMAX" @click.stop="scaleDeco(d.uid, DSTEP)">+</button>
                      <div class="tb-sep"></div>
                      <button class="tb-btn remove" @click.stop="removeDeco(d.uid)">✕</button>
                    </div>
                  </div>
                </template>

                <!-- 포토택 선택 시 툴바 -->
                <div v-if="selPhototag" class="deco-overlay" :style="phototagToolbarStyle" @click.stop>
                  <div class="deco-toolbar" @click.stop>
                    <button class="tb-btn" @click.stop="!phototagUploading && nameTagInputRef?.click()">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </button>
                    <div class="tb-sep"></div>
                    <button class="tb-btn remove" @click.stop="removePhototag()">✕</button>
                  </div>
                </div>
              </div>

            </div>

            <!-- 우측: 아이템 목록 -->
            <div class="right-panel" :class="{ 'mobile-active': mobileTab === 'items' }">
              <div class="shop-card">
                <div class="shop-card-header">
                  <span class="shop-card-title">담은 아이템</span>
                  <div class="item-count-badge">
                    <span>{{ items.length }}</span>
                  </div>
                </div>
                <div v-if="items.length === 0" class="empty-items">아직 담긴 아이템이 없어요</div>
                <div v-else class="item-list">
                  <div
                    v-for="(item, i) in displayItems"
                    :key="item.id"
                    class="item-row"
                    :class="{
                      selected: selected === item.id,
                      faded: !itemsExpanded && i === visibleCount && sortedItems.length > visibleCount
                    }"
                    @click="toggleSelect(item.id)"
                  >
                    <div class="item-icon" :class="{ selected: selected === item.id }">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                      <div v-if="i < 3" class="item-rank" :style="{ background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32', color: i === 0 ? '#7a5a00' : i === 1 ? '#444' : '#5a2d00' }">{{ i + 1 }}</div>
                    </div>
                    <div class="item-info">
                      <span class="item-name">{{ item.name }}</span>
                      <div class="item-meta">
                        <span class="item-brand">{{ item.brand }}</span>
                        <template v-if="item.rating">
                          <span class="meta-dot">·</span>
                          <span class="item-rating">★ {{ item.rating }}</span>
                        </template>
                      </div>
                    </div>
                    <button class="item-remove" @click.stop="removeItemFromCarrier(item.id)">✕</button>
                  </div>
                </div>
                <button
                  v-if="sortedItems.length > visibleCount"
                  class="expand-btn"
                  @click="itemsExpanded = !itemsExpanded"
                >
                  {{ itemsExpanded ? '접기' : `더보기 (${sortedItems.length - visibleCount}개)` }}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" :style="{ transform: itemsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>

              <!-- 더 담으러 가기 -->
              <button class="add-more-btn" @click="$router.push('/products')">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="#fff" stroke-width="1.5"/>
                  <path d="M8 5.5V10.5M5.5 8H10.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                더 담으러 가기
              </button>

              <!-- 선택된 아이템 상세 -->
              <div v-if="selectedItem" class="item-detail-card">
                <div class="detail-header">
                  <div class="detail-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                  </div>
                  <div>
                    <div class="detail-name">{{ selectedItem.name }}</div>
                    <div class="detail-brand">{{ selectedItem.brand }}</div>
                  </div>
                  <div class="detail-rank" :style="selectedRankStyle">
                    #{{ selectedRank }}
                  </div>
                </div>
                <div class="detail-stats">
                  <div class="stat-box">
                    <div class="stat-label">상품</div>
                    <div class="stat-value" style="font-size:12px">{{ selectedItem.name }}</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-label">브랜드</div>
                    <div class="stat-value" style="font-size:12px">{{ selectedItem.brand || '-' }}</div>
                  </div>
                  <div v-if="selectedItem.imageUrl" class="stat-box full">
                    <img :src="selectedItem.imageUrl" alt="" style="width:100%;border-radius:8px;max-height:120px;object-fit:cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 저장 버튼 (변경사항 있을 때만) -->
        <Transition name="save-fab">
          <button
            v-if="hasUnsavedChanges"
            class="save-fab"
            :class="{ saving }"
            :disabled="saving"
            @click="saveAllChanges"
          >
            <svg v-if="!saving" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <div v-else class="save-spinner"></div>
            <span>{{ saving ? '저장 중...' : '저장' }}</span>
          </button>
        </Transition>

        <!-- 공유 모달 -->
        <Teleport to="body">
          <div v-if="showShareModal" class="share-modal-overlay" @click="showShareModal = false">
            <div class="share-modal" @click.stop>
              <button class="modal-close" @click="showShareModal = false">✕</button>
              <!-- 프리뷰 이미지 영역 -->
              <div class="share-preview" :style="{ background: shareBg }">
                <div class="share-svg-wrap">
                  <svg width="100%" height="100%" viewBox="-40 -60 380 500" fill="none" preserveAspectRatio="xMidYMid meet" data-share-svg>
                    <!-- 배경 -->
                    <rect x="-40" y="-60" width="380" height="500" :fill="shareBg"/>
                    <!-- 닉네임 -->
                    <text v-if="shareNickname" x="150" y="-30" text-anchor="middle" font-size="22" font-weight="700" fill="#363636" font-family="'HancomMalangMalang','SUIT',sans-serif">{{ shareNickname }}의 캐리어</text>
                    <defs>
                      <filter id="bI2" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="b1"/><feOffset dx="6" dy="6" result="o1"/>
                        <feComposite in="o1" in2="SourceGraphic" operator="in" result="s1"/>
                        <feFlood flood-color="#6b5b9a" flood-opacity=".2" result="sc"/><feComposite in="sc" in2="s1" operator="in" result="sh"/>
                        <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="b2"/><feOffset dx="-5" dy="-5" result="o2"/>
                        <feComposite in="o2" in2="SourceGraphic" operator="in" result="h1"/>
                        <feFlood flood-color="#fff" flood-opacity=".5" result="hc"/><feComposite in="hc" in2="h1" operator="in" result="hl"/>
                        <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/><feMergeNode in="hl"/></feMerge>
                      </filter>
                      <linearGradient id="sG2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" :stop-color="currentSkin.body.grad1"/>
                        <stop offset="100%" :stop-color="currentSkin.body.grad2"/>
                      </linearGradient>
                    </defs>

                    <!-- 외관 보기 -->
                    <template v-if="!isOpen">
                      <rect x="30" y="50" width="240" height="320" rx="20" fill="url(#sG2)" :stroke="currentSkin.body.stroke" stroke-width="3" filter="url(#bI2)"/>
                      <line x1="52" y1="122" x2="52" y2="289" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".3"/>
                      <rect x="122" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
                      <rect x="170" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
                      <rect x="116" y="6" width="68" height="18" rx="9" :fill="currentSkin.handle.grip" :stroke="currentSkin.handle.stroke" stroke-width="2.5"/>
                      <rect x="98" y="80" width="22" height="250" rx="11" :fill="currentSkin.groove.fill" :stroke="currentSkin.groove.stroke" stroke-width="2"/>
                      <rect x="139" y="80" width="22" height="250" rx="11" :fill="currentSkin.groove.fill" :stroke="currentSkin.groove.stroke" stroke-width="2"/>
                      <rect x="180" y="80" width="22" height="250" rx="11" :fill="currentSkin.groove.fill" :stroke="currentSkin.groove.stroke" stroke-width="2"/>
                      <!-- 스킨 내장 스티커 -->
                      <template v-for="(st, i) in currentSkin.stickers" :key="'share-sk-' + i">
                        <g v-if="st.type === 'smallheart'" :transform="`translate(${st.x},${st.y})`">
                          <path d="M0 7C-2 5-9 1-9-4C-9-8-5-10 0-6C5-10 9-8 9-4C9 1 2 5 0 7Z" fill="#fca5a5" stroke="#f87171" stroke-width="1"/>
                        </g>
                        <g v-else-if="st.type === 'bigbow'" :transform="`translate(${st.x},${st.y})`">
                          <path d="M-20 0C-20-15-4-15 0 0C4-15 20-15 20 0C20 15 4 15 0 0C-4 15-20 15-20 0Z" fill="#dc2626" stroke="#222" stroke-width="1.5"/>
                          <circle r="5" fill="#dc2626" stroke="#222" stroke-width="1.2"/>
                        </g>
                        <g v-else-if="st.type === 'stamp'" :transform="`translate(${st.x},${st.y})`">
                          <rect x="-28" y="-16" width="56" height="32" rx="4" fill="none" :stroke="st.color" stroke-width="2.5" stroke-dasharray="3 2" opacity="0.7"/>
                          <text x="0" y="5" text-anchor="middle" font-size="11" font-weight="900" :fill="st.color" opacity="0.75" font-family="monospace">{{ st.label }}</text>
                        </g>
                        <circle v-else-if="st.type === 'star'" :cx="st.x" :cy="st.y" :r="st.size || 4" fill="#e0e7ff" opacity="0.6"/>
                        <g v-else-if="st.type === 'planet'" :transform="`translate(${st.x},${st.y})`">
                          <circle r="12" fill="#818cf8" opacity="0.6"/>
                          <ellipse rx="20" ry="5" fill="none" stroke="#c7d2fe" stroke-width="1.5" opacity="0.5" transform="rotate(-20)"/>
                        </g>
                      </template>
                      <!-- 사용자 배치 스티커 -->
                      <!-- 포토택 (고정 위치) -->
                      <g v-if="hasPhototag" transform="rotate(-4,126,53)">
                        <line x1="126" y1="53" x2="126" y2="78" :stroke="currentSkin.body.stroke" stroke-width="1.5" opacity=".4" stroke-linecap="round"/>
                        <rect x="97" y="78" width="58" height="76" rx="4" fill="#fff" fill-opacity=".92" :stroke="currentSkin.body.stroke" stroke-width="1.2" opacity=".6"/>
                        <circle cx="126" cy="86" r="3" fill="none" :stroke="currentSkin.body.stroke" stroke-width=".8" opacity=".3"/>
                        <line x1="98" y1="96" x2="154" y2="96" :stroke="currentSkin.body.stroke" stroke-width=".5" opacity=".15"/>
                        <template v-if="nameTagImg">
                          <defs><clipPath id="ntC2"><rect x="97.6" y="96.5" width="56.8" height="57.4" rx="3"/></clipPath></defs>
                          <image :href="nameTagImg" x="97.6" y="96.5" width="56.8" height="57.4" preserveAspectRatio="xMidYMid slice" clip-path="url(#ntC2)"/>
                        </template>
                        <text v-else text-anchor="middle" font-size="11" font-weight="800" :fill="currentSkin.body.stroke" opacity=".5" font-family="monospace" letter-spacing="1">
                          <tspan x="126" y="120">PHOTO</tspan>
                          <tspan x="126" dy="14">TAG</tspan>
                        </text>
                      </g>
                      <!-- 이모지 스티커 -->
                      <template v-for="d in emojiDecos" :key="'share-deco-' + d.uid">
                        <text
                          :x="30 + (d.x / 100) * 240"
                          :y="50 + (d.y / 100) * 320"
                          text-anchor="middle"
                          dominant-baseline="central"
                          :font-size="24 * d.scale"
                          fill="#000"
                          :transform="d.flipped ? `translate(${(30 + (d.x / 100) * 240) * 2},0) scale(-1,1)` : ''"
                        >{{ d.emoji }}</text>
                      </template>
                      <!-- 바퀴 -->
                      <rect x="62" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
                      <circle cx="70" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/>
                      <circle cx="70" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
                      <rect x="222" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
                      <circle cx="230" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/>
                      <circle cx="230" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
                    </template>

                    <!-- 내부 보기 -->
                    <template v-else>
                      <!-- 캐리어 프레임 -->
                      <rect x="122" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
                      <rect x="170" y="18" width="8" height="35" rx="3" :fill="currentSkin.handle.fill" :stroke="currentSkin.handle.stroke" stroke-width="1.5"/>
                      <rect x="116" y="6" width="68" height="18" rx="9" :fill="currentSkin.handle.grip" :stroke="currentSkin.handle.stroke" stroke-width="2.5"/>
                      <rect x="30" y="50" width="240" height="320" rx="20" :stroke="currentSkin.body.stroke" stroke-width="2" stroke-dasharray="8 4" fill="#fff" opacity=".5"/>
                      <line x1="30" y1="140" x2="270" y2="140" :stroke="currentSkin.body.stroke" stroke-width="1.5" stroke-dasharray="6 4" opacity=".3"/>
                      <line x1="30" y1="260" x2="270" y2="260" :stroke="currentSkin.body.stroke" stroke-width="1.5" stroke-dasharray="6 4" opacity=".3"/>
                      <rect x="62" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
                      <circle cx="70" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/><circle cx="70" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
                      <rect x="222" y="365" width="16" height="8" rx="3" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="1.5"/>
                      <circle cx="230" cy="382" r="10" :fill="currentSkin.wheel.fill" :stroke="currentSkin.wheel.stroke" stroke-width="2"/><circle cx="230" cy="382" r="2" :fill="currentSkin.wheel.hub"/>
                      <!-- 버블 아이템 -->
                      <template v-for="(b, i) in shareBubbles" :key="'sb-' + i">
                        <circle :cx="b.cx" :cy="b.cy" :r="b.r" :fill="b.bg" :stroke="b.border" stroke-width="2"/>
                        <text v-if="b.r > 18" :x="b.cx" :y="b.cy - (b.r > 30 ? 3 : 0)" text-anchor="middle" dominant-baseline="central" :font-size="Math.max(8, b.r * 0.22)" font-weight="600" :fill="b.tc">{{ b.name }}</text>
                        <text v-if="b.r > 30" :x="b.cx" :y="b.cy + b.r * 0.25" text-anchor="middle" dominant-baseline="central" :font-size="Math.max(6, b.r * 0.14)" :fill="b.sc">{{ b.brand }}</text>
                      </template>
                      <text v-if="sortedItems.length === 0" x="150" y="210" text-anchor="middle" font-size="14" fill="#aaa">캐리어가 비어있어요</text>
                    </template>
                  </svg>
                </div>
              </div>
              <!-- 닉네임 입력 -->
              <div class="share-nickname-row">
                <svg class="nickname-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9333EA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  v-model="shareNickname"
                  class="share-nickname-input"
                  placeholder="닉네임을 입력하세요"
                  maxlength="10"
                />
              </div>
              <!-- 저장 버튼 -->
              <button class="share-save-btn" @click="downloadCarrierImage">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                이미지로 저장하기
              </button>
            </div>
          </div>
        </Teleport>
        <!-- 네임택 사진 업로드용 hidden input -->
        <input ref="nameTagInputRef" type="file" accept="image/*" style="display: none" @change="onNameTagImgChange"/>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCarrier } from '@/composables/useCarrier.js'
import { CARRIER_TYPE } from '@/services/CarrierService.js'
import { fileService } from '@/services/FileService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const router = useRouter()
const { open: openConfirm } = useConfirmDialog()

// ==================== 상수 ====================
const DMIN = 0.6
const DMAX = 2.5
const DSTEP = 0.2
const DECO_BASE = 36
const DECO_FONT = 24
const isMobile = computed(() => dims.w > 0 && dims.w < 400)
const decoBase = computed(() => isMobile.value ? 52 : DECO_BASE)
const decoFont = computed(() => isMobile.value ? 34 : DECO_FONT)
const IW = 110
const G = 8
const MIN_R = 28
const MAX_R = 80
const SLOT_COUNT = 2

const DEFAULT_COLORS = [
  { id: 'violet', label: '바이올렛', dot: '#7c3aed', body: { grad1: '#f5f3ff', grad2: '#e4dff2', stroke: '#7c3aed' }, groove: { fill: '#ebe8f4', stroke: '#d4d0e8' }, handle: { fill: '#d8d2ea', stroke: '#7c3aed', grip: '#ece9f5' }, wheel: { fill: '#d8d2ea', stroke: '#7c3aed', hub: '#7c3aed', inner: '#ece9f5' } },
  { id: 'pink', label: '핑크', dot: '#ec4899', body: { grad1: '#fdf2f8', grad2: '#fce7f3', stroke: '#ec4899' }, groove: { fill: '#fce7f3', stroke: '#fbcfe8' }, handle: { fill: '#fbcfe8', stroke: '#ec4899', grip: '#fce7f3' }, wheel: { fill: '#fbcfe8', stroke: '#ec4899', hub: '#ec4899', inner: '#fce7f3' } },
  { id: 'sky', label: '스카이', dot: '#0ea5e9', body: { grad1: '#f0f9ff', grad2: '#e0f2fe', stroke: '#0ea5e9' }, groove: { fill: '#e0f2fe', stroke: '#bae6fd' }, handle: { fill: '#bae6fd', stroke: '#0ea5e9', grip: '#e0f2fe' }, wheel: { fill: '#bae6fd', stroke: '#0ea5e9', hub: '#0ea5e9', inner: '#e0f2fe' } },
  { id: 'yellow', label: '옐로우', dot: '#eab308', body: { grad1: '#fefce8', grad2: '#fef9c3', stroke: '#eab308' }, groove: { fill: '#fef9c3', stroke: '#fde68a' }, handle: { fill: '#fde68a', stroke: '#eab308', grip: '#fef9c3' }, wheel: { fill: '#fde68a', stroke: '#eab308', hub: '#eab308', inner: '#fef9c3' } }
]

const BASE_SKINS = [
  { id: 'default', name: '기본', desc: '클래식 바이올렛', special: false, body: { grad1: '#f5f3ff', grad2: '#e4dff2', stroke: '#7c3aed' }, groove: { fill: '#ebe8f4', stroke: '#d4d0e8' }, handle: { fill: '#d8d2ea', stroke: '#7c3aed', grip: '#ece9f5' }, wheel: { fill: '#d8d2ea', stroke: '#7c3aed', hub: '#7c3aed', inner: '#ece9f5' }, stickers: [] },
  { id: 'retro', name: '레트로 트래블', desc: '빈티지 여행', special: false, body: { grad1: '#fefce8', grad2: '#fef3c7', stroke: '#b45309' }, groove: { fill: '#fef9c3', stroke: '#fde68a' }, handle: { fill: '#fcd34d', stroke: '#b45309', grip: '#fef9c3' }, wheel: { fill: '#fcd34d', stroke: '#b45309', hub: '#b45309', inner: '#fef9c3' }, stickers: [{ type: 'stamp', x: 90, y: 140, label: 'PARIS', color: '#dc2626' }, { type: 'stamp', x: 195, y: 210, label: 'TOKYO', color: '#2563eb' }, { type: 'stamp', x: 120, y: 290, label: 'NYC', color: '#16a34a' }] },
  { id: 'space', name: '스페이스', desc: '은하계 탐험', special: false, body: { grad1: '#1e1b4b', grad2: '#0f0a2e', stroke: '#6366f1' }, groove: { fill: '#1e1b4b', stroke: '#4338ca' }, handle: { fill: '#312e81', stroke: '#818cf8', grip: '#1e1b4b' }, wheel: { fill: '#312e81', stroke: '#818cf8', hub: '#a5b4fc', inner: '#1e1b4b' }, stickers: [{ type: 'star', x: 80, y: 110, size: 6 }, { type: 'star', x: 220, y: 140, size: 4 }, { type: 'star', x: 150, y: 180, size: 7 }, { type: 'planet', x: 190, y: 230 }] },
  { id: 'kitty', name: '헬로키티', desc: '리본과 하트', special: true, body: { grad1: '#fff', grad2: '#fff8f9', stroke: '#dc2626' }, groove: { fill: '#fee2e2', stroke: '#fca5a5' }, handle: { fill: '#fca5a5', stroke: '#dc2626', grip: '#fee2e2' }, wheel: { fill: '#fca5a5', stroke: '#dc2626', hub: '#dc2626', inner: '#fee2e2' }, stickers: [{ type: 'bigbow', x: 220, y: 90 }, { type: 'smallheart', x: 75, y: 120 }, { type: 'smallheart', x: 180, y: 160 }, { type: 'smallheart', x: 95, y: 210 }, { type: 'smallheart', x: 220, y: 230 }, { type: 'smallheart', x: 140, y: 270 }] }
]

const STICKER_PACKS = {
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
const PACK_LABELS = [['basic', '기본'], ['travel', '여행'], ['food', '푸드'], ['weather', '날씨']]
const SPECIAL_PACK = ['special', '스페셜']

const CVB = { x1: 30, y1: 50, x2: 270, y2: 370, vw: 300, vh: 400 }

// skinType enum -> 프론트 스킨 id 매핑 (CARRIER_TYPE 기반 자동 생성)
const SKIN_TYPE_MAP = Object.fromEntries(
  Object.values(CARRIER_TYPE).map(t => [t, t.toLowerCase()])
)
const SKIN_TYPE_REVERSE = Object.fromEntries(
  Object.values(CARRIER_TYPE).map(t => [t.toLowerCase(), t])
)

// skinColor -> 프론트 컬러 id 매핑
function skinColorToColorId(hex) {
  const map = { '#7c3aed': 'violet', '#ec4899': 'pink', '#0ea5e9': 'sky', '#eab308': 'yellow' }
  return map[hex?.toLowerCase()] || 'violet'
}
function colorIdToSkinColor(id) {
  const map = { violet: '#7c3aed', pink: '#ec4899', sky: '#0ea5e9', yellow: '#eab308' }
  return map[id] || '#7c3aed'
}

// ==================== API Composable ====================
const { loading: apiLoading, error: apiError, carriers, currentCarrier, fetchMyCarriers, fetchCarrier, createCarrier, updateSkin, deleteCarrier, addItem: apiAddItem, removeItem: apiRemoveItem, addSticker: apiAddSticker, updateSticker: apiUpdateSticker, removeSticker: apiRemoveSticker, bulkDeleteStickers: apiBulkDeleteStickers, updatePositions } = useCarrier()

const carrierId = ref(null)
const activeSlotIdx = ref(0)
const slotCarrierIds = ref([null, null])
const slotSwitching = ref(false)

// ==================== 상태 ====================
const isOpen = ref(false)
const anim = ref(false)
const items = ref([])
const selected = ref(null)
const defaultColor = ref('violet')
const showColorPicker = ref(false)
const activeSkin = ref('default')
const skinScroll = ref(0)
const stickerPack = ref('basic')
const decoPage = ref(0)
const decos = ref([])
const selDeco = ref(null)
const showShareModal = ref(false)
const shareNickname = ref('')
const itemsExpanded = ref(false)
const mobileTab = ref('carrier')
const dragId = ref(null)
const dirtyDecos = ref(new Set())  // 변경된 스티커 uid 추적
const dirtyBubbles = ref(false)    // 버블 위치 변경 추적
const saving = ref(false)

const nameTagImg = ref(null)
const nameTagInputRef = ref(null)
const phototagUploading = ref(false)

// 지연 저장 추적
const pendingAdds = ref([])       // 새로 추가된 스티커 uid (아직 apiId 없음)
const pendingDeletes = ref([])    // 서버에서 삭제할 apiId 목록
const dirtySkin = ref(false)      // 스킨/컬러 변경 여부

const hasUnsavedChanges = computed(() =>
  dirtyDecos.value.size > 0 ||
  dirtyBubbles.value ||
  pendingAdds.value.length > 0 ||
  pendingDeletes.value.length > 0 ||
  dirtySkin.value
)
const dims = reactive({ w: 0, h: 0 })

const boxRef = ref(null)
const innerRef = ref(null)

// 물리 시뮬레이션 상태
const posRef = { current: [] }
const ds = { current: { dragging: false, id: null, ox: 0, oy: 0, lastX: 0, lastY: 0, velX: 0, velY: 0 } }
let frameRef = null
let resizeObserver = null

const rendered = ref([])
const visibleCount = 2

// ==================== 스킨 시스템 ====================
const dc = computed(() => DEFAULT_COLORS.find(c => c.id === defaultColor.value) || DEFAULT_COLORS[0])

const appliedSkins = computed(() => BASE_SKINS.map(s =>
  s.id === 'default'
    ? { ...s, desc: dc.value.label, body: { ...dc.value.body }, groove: { ...dc.value.groove }, handle: { ...dc.value.handle }, wheel: { ...dc.value.wheel } }
    : s
))

const allSkins = computed(() => [...appliedSkins.value])
const currentSkin = computed(() => allSkins.value.find(s => s.id === activeSkin.value) || allSkins.value[0])

const nSkins = computed(() => allSkins.value.filter(s => !s.special))
const sSkins = computed(() => allSkins.value.filter(s => s.special))

const allSkinItems = computed(() => [...nSkins.value, ...sSkins.value])

const skinMaxScroll = computed(() => {
  const totalW = allSkinItems.value.length * (IW + G) - G
  const VW = IW * 2 + G + IW * 0.5
  return Math.max(0, totalW - VW)
})

const hasPhototag = computed(() => decos.value.some(d => d.type === 'phototag'))
const emojiDecos = computed(() => decos.value.filter(d => d.type !== 'phototag'))
const selPhototag = computed(() => {
  const pt = decos.value.find(d => d.type === 'phototag')
  return pt && selDeco.value === pt.uid ? pt : null
})
const phototagToolbarStyle = computed(() => {
  const box = boxRef.value?.getBoundingClientRect()
  if (!box) return { display: 'none' }
  const b = getBounds(box.width, box.height)
  const bw = b.right - b.left, bh = b.bottom - b.top
  // 포토택 SVG 위치: x=126, y=78 (프레임 상단, viewBox 0 0 300 400 기준)
  const px = b.left + (126 / 300) * bw
  const py = b.top + (78 / 400) * bh
  return { position: 'absolute', left: px + 'px', top: (py - 4) + 'px', zIndex: 20 }
})

// ==================== 스티커 페이징 ====================
const curStickers = computed(() => STICKER_PACKS[stickerPack.value] || [])
const decoPages = computed(() => {
  const PP = 8
  const pages = []
  for (let i = 0; i < curStickers.value.length; i += PP) {
    const page = curStickers.value.slice(i, i + PP)
    while (page.length < PP) page.push({ id: `_empty_${i + page.length}`, emoji: '', empty: true })
    pages.push(page)
  }
  return pages
})

// ==================== 물리 시뮬레이션 ====================
const sortedItems = computed(() => [...items.value])

const nodes = computed(() => {
  const count = sortedItems.value.length
  // 균등 크기 + 약간의 변화 (첫 번째 아이템이 가장 큼)
  return sortedItems.value.map((p, i) => {
    const ratio = count <= 1 ? 1 : 1 - (i / count) * 0.4
    return { id: p.id, r: MIN_R + (MAX_R - MIN_R) * ratio }
  })
})

function getBounds(W, H) {
  const sx = W / CVB.vw, sy = H / CVB.vh, sc = Math.min(sx, sy)
  const ox = (W - CVB.vw * sc) / 2, oy = (H - CVB.vh * sc) / 2
  return { left: ox + CVB.x1 * sc, top: oy + CVB.y1 * sc, right: ox + CVB.x2 * sc, bottom: oy + CVB.y2 * sc }
}

function initLayout(nodeList, W, H) {
  if (!nodeList.length || !W || !H) return []
  const cx = W / 2
  const so = nodeList.map((n, i) => ({ ...n, idx: i })).sort((a, b) => a.r - b.r)
  const pos = so.map(n => ({ x: cx + (Math.random() - 0.5) * W * 0.3, y: H - n.r - 10, vx: 0, vy: 0, r: n.r, idx: n.idx }))
  for (let t = 0; t < 500; t++) {
    const a = Math.max(0.001, 1 - t / 500)
    for (let i = 0; i < pos.length; i++) {
      pos[i].vy += 0.2 * a
      pos[i].vx += (cx - pos[i].x) * 0.004 * a
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        const mn = pos[i].r + pos[j].r + 3
        if (d < mn) {
          const f = (mn - d) / d * 0.4
          pos[i].vx += dx * f; pos[i].vy += dy * f
          pos[j].vx -= dx * f; pos[j].vy -= dy * f
        }
      }
      pos[i].vx *= 0.6; pos[i].vy *= 0.6
      pos[i].x += pos[i].vx; pos[i].y += pos[i].vy
      const pd = pos[i].r + 2
      pos[i].x = Math.max(pd, Math.min(W - pd, pos[i].x))
      pos[i].y = Math.max(pd, Math.min(H - pd, pos[i].y))
    }
  }
  const res = new Array(nodeList.length)
  pos.forEach(p => { res[p.idx] = { x: p.x, y: p.y } })
  return res
}

function startPhysics() {
  if (frameRef) cancelAnimationFrame(frameRef)
  if (!dims.w || !dims.h) return

  const GRAVITY = 0.15, FRICTION = 0.92, BOUNCE = 0.55, COLLISION_SOFTNESS = 0.5

  const step = () => {
    const bodies = posRef.current
    if (!bodies.length) { frameRef = requestAnimationFrame(step); return }
    const d = ds.current
    const b = getBounds(dims.w, dims.h)

    for (let i = 0; i < bodies.length; i++) {
      const o = bodies[i]
      if (d.dragging && d.id === o.id) {
        const pad = o.r + 2
        o.x = Math.max(b.left + pad, Math.min(b.right - pad, o.x))
        o.y = Math.max(b.top + pad, Math.min(b.bottom - pad, o.y))
        o.vx = d.velX || 0; o.vy = d.velY || 0
        continue
      }
      o.vy += GRAVITY; o.vx *= FRICTION; o.vy *= FRICTION
      o.x += o.vx; o.y += o.vy
      const pad = o.r + 2
      if (o.x < b.left + pad) { o.x = b.left + pad; o.vx = Math.abs(o.vx) * BOUNCE }
      if (o.x > b.right - pad) { o.x = b.right - pad; o.vx = -Math.abs(o.vx) * BOUNCE }
      if (o.y < b.top + pad) { o.y = b.top + pad; o.vy = Math.abs(o.vy) * BOUNCE }
      if (o.y > b.bottom - pad) { o.y = b.bottom - pad; o.vy = -Math.abs(o.vy) * BOUNCE }
    }

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], bb = bodies[j]
        const dx = a.x - bb.x, dy = a.y - bb.y
        const dd = Math.sqrt(dx * dx + dy * dy) || 1
        const minD = a.r + bb.r + 2
        if (dd < minD) {
          const nx = dx / dd, ny = dy / dd, ov = (minD - dd) * 0.5
          const aL = d.dragging && d.id === a.id, bL = d.dragging && d.id === bb.id
          if (aL) { bb.x -= nx * ov * 2; bb.y -= ny * ov * 2 }
          else if (bL) { a.x += nx * ov * 2; a.y += ny * ov * 2 }
          else { a.x += nx * ov; a.y += ny * ov; bb.x -= nx * ov; bb.y -= ny * ov }
          const dvx = a.vx - bb.vx, dvy = a.vy - bb.vy
          const imp = (dvx * nx + dvy * ny) * COLLISION_SOFTNESS
          if (!aL) { a.vx -= imp * nx; a.vy -= imp * ny }
          if (!bL) { bb.vx += imp * nx; bb.vy += imp * ny }
        }
      }
    }

    for (let i = 0; i < bodies.length; i++) {
      const o = bodies[i], pad = o.r + 2
      if (o.x < b.left + pad) { o.x = b.left + pad; if (o.vx < 0) o.vx *= -BOUNCE }
      if (o.x > b.right - pad) { o.x = b.right - pad; if (o.vx > 0) o.vx *= -BOUNCE }
      if (o.y < b.top + pad) { o.y = b.top + pad; if (o.vy < 0) o.vy *= -BOUNCE }
      if (o.y > b.bottom - pad) { o.y = b.bottom - pad; if (o.vy > 0) o.vy *= -BOUNCE }
    }

    rendered.value = bodies.map(o => ({ x: o.x, y: o.y }))
    frameRef = requestAnimationFrame(step)
  }

  frameRef = requestAnimationFrame(step)
}

function initPhysicsLayout() {
  if (!dims.w || !dims.h || !nodes.value.length) {
    posRef.current = []
    rendered.value = []
    return
  }
  const b = getBounds(dims.w, dims.h)
  const bw = b.right - b.left, bh = b.bottom - b.top

  // 저장된 위치가 있는지 확인
  const hasSavedPositions = sortedItems.value.some(item =>
    item.positionX !== undefined && item.positionX !== 0.5 ||
    item.positionY !== undefined && item.positionY !== 0.5
  )

  if (hasSavedPositions) {
    // 저장된 위치 복원
    posRef.current = nodes.value.map((n, i) => {
      const item = sortedItems.value[i]
      const px = item?.positionX ?? 0.5
      const py = item?.positionY ?? 0.5
      return {
        x: b.left + px * bw,
        y: b.top + py * bh,
        vx: 0, vy: 0,
        r: n.r,
        id: n.id
      }
    })
  } else {
    // 저장된 위치 없으면 물리 시뮬레이션으로 초기 배치
    const layout = initLayout(nodes.value, bw * 0.85, bh * 0.85)
    const ox = b.left + bw * 0.075, oy = b.top + bh * 0.075
    posRef.current = layout.map((p, i) => ({
      x: p.x + ox, y: p.y + oy, vx: 0, vy: 0, r: nodes.value[i].r, id: nodes.value[i].id
    }))
  }
  rendered.value = posRef.current.map(p => ({ x: p.x, y: p.y }))
}

// ResizeObserver - watch 패턴 (조건부 렌더링 호환)
watch(innerRef, (el) => {
  if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
  if (el) {
    resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      dims.w = width; dims.h = height
    })
    resizeObserver.observe(el)
  }
})

// 아이템 변경 또는 dims 변경 시 물리 재초기화
const itemKey = computed(() => items.value.map(i => i.id).join(','))
watch([itemKey, () => dims.w, () => dims.h], () => {
  initPhysicsLayout()
}, { flush: 'post' })

watch([() => dims.w, () => dims.h], () => {
  startPhysics()
})

// ==================== 통합 저장 ====================
async function saveAllChanges() {
  if (!carrierId.value || saving.value) return
  saving.value = true

  try {
    // Phase 1: 스킨 변경
    if (dirtySkin.value) {
      const skinType = SKIN_TYPE_REVERSE[activeSkin.value] || CARRIER_TYPE.DEFAULT
      const skinColor = skinType === CARRIER_TYPE.DEFAULT ? colorIdToSkinColor(defaultColor.value) : null
      await updateSkin(carrierId.value, { skinType, skinColor })
    }

    // Phase 2: 스티커 삭제
    if (pendingDeletes.value.length > 0) {
      if (pendingDeletes.value.length > 1) {
        await apiBulkDeleteStickers(carrierId.value, pendingDeletes.value)
      } else {
        await apiRemoveSticker(carrierId.value, pendingDeletes.value[0])
      }
    }

    // Phase 3: 새 스티커 추가 (순차 — 응답에서 apiId 받아야 함)
    for (const uid of pendingAdds.value) {
      const deco = decos.value.find(v => v.uid === uid)
      if (!deco) continue

      const stickerType = deco.type === 'phototag' ? 'PHOTO_TAG' : 'EMOJI'
      const addData = {
        stickerType,
        content: deco.emoji || null,
        imageUrl: deco.imageUrl || null,
        positionX: deco.x / 100,
        positionY: deco.y / 100,
        zIndex: 0,
        rotation: deco.rotation ?? 0,
        scaleRatio: deco.scale ?? 1.0
      }
      const result = await apiAddSticker(carrierId.value, addData)
      if (result.success && result.data?.id) {
        deco.apiId = result.data.id
      }
    }

    // Phase 4: 변경된 스티커 위치/스케일 업데이트 (병렬)
    const updatePromises = []
    for (const uid of dirtyDecos.value) {
      const deco = decos.value.find(v => v.uid === uid)
      if (deco?.apiId) {
        const updateData = {
          positionX: deco.x / 100,
          positionY: deco.y / 100,
          scaleRatio: deco.scale,
          rotation: deco.rotation ?? 0
        }
        if (deco.type === 'phototag' && deco.imageUrl !== undefined) {
          updateData.imageUrl = deco.imageUrl
        }
        updatePromises.push(apiUpdateSticker(carrierId.value, deco.apiId, updateData))
      }
    }

    // Phase 5: 버블 위치 저장 (병렬)
    if (dirtyBubbles.value && posRef.current.length) {
      const b = getBounds(dims.w, dims.h)
      const bw = b.right - b.left, bh = b.bottom - b.top
      if (bw > 0 && bh > 0) {
        const itemPositions = posRef.current.map(p => ({
          itemId: p.id,
          positionX: Math.max(0, Math.min(1, (p.x - b.left) / bw)),
          positionY: Math.max(0, Math.min(1, (p.y - b.top) / bh)),
          zIndex: 0
        }))
        updatePromises.push(updatePositions(carrierId.value, itemPositions, null))
      }
    }

    await Promise.all(updatePromises)

    // Phase 6: dirty 상태 초기화
    dirtyDecos.value = new Set()
    dirtyBubbles.value = false
    pendingAdds.value = []
    pendingDeletes.value = []
    dirtySkin.value = false
    decos.value = [...decos.value]  // 반응성 트리거
  } finally {
    saving.value = false
  }
}

onBeforeUnmount(async () => {
  // 페이지 떠날 때 미저장 변경사항 저장
  if (hasUnsavedChanges.value) {
    await saveAllChanges()
  }
  if (frameRef) cancelAnimationFrame(frameRef)
  if (resizeObserver) resizeObserver.disconnect()
})

// ==================== API 데이터 로드 ====================
async function loadCarrierData() {
  await fetchMyCarriers()

  if (carriers.value.length === 0) {
    const result = await createCarrier({ name: '캐꾸 1', skinType: CARRIER_TYPE.DEFAULT, skinColor: '#7c3aed' })
    if (result.success) {
      await fetchMyCarriers()
    }
  }

  // 캐리어 → 슬롯 매핑 (순서대로)
  slotCarrierIds.value = [null, null]
  carriers.value.forEach((c, i) => {
    if (i < SLOT_COUNT) slotCarrierIds.value[i] = c.id
  })

  await loadSlot(0)
}

async function loadSlot(idx) {
  slotSwitching.value = true
  try {
    let cid = slotCarrierIds.value[idx]
    if (!cid) {
      const result = await createCarrier({ name: `캐꾸 ${idx + 1}`, skinType: CARRIER_TYPE.DEFAULT, skinColor: '#7c3aed' })
      if (!result.success) return
      await fetchMyCarriers()
      cid = result.data.id
      slotCarrierIds.value[idx] = cid
    }
    const detail = await fetchCarrier(cid)
    if (detail) {
      carrierId.value = cid
      activeSlotIdx.value = idx
      applyCarrierData(detail)
    }
  } finally {
    slotSwitching.value = false
  }
}

async function selectSlot(idx) {
  if (idx === activeSlotIdx.value || slotSwitching.value) return
  if (hasUnsavedChanges.value) {
    const result = await openConfirm({
      title: '변경사항을 저장할까요?',
      message: '다른 캐꾸로 이동하기 전에 현재 변경사항을 저장합니다.',
      confirmText: '저장하기',
      cancelText: '저장 안 함'
    })
    // null = 오버레이 밖 탭 (머무름)
    if (result === null) return
    // true = 저장 후 이동
    if (result === true) await saveAllChanges()
    // false = 저장 안 하고 이동
  }
  await loadSlot(idx)
}

function applyCarrierData(carrier) {
  // pending 상태 초기화
  pendingAdds.value = []
  pendingDeletes.value = []
  dirtySkin.value = false
  dirtyDecos.value = new Set()
  dirtyBubbles.value = false

  // 스킨 적용
  const skinId = SKIN_TYPE_MAP[carrier.skinType] || 'default'
  activeSkin.value = skinId

  // 기본 스킨인 경우 색상 적용
  if (skinId === 'default' && carrier.skinColor) {
    defaultColor.value = skinColorToColorId(carrier.skinColor)
  }

  // 아이템 매핑 (백엔드 → 프론트)
  items.value = (carrier.items || []).map(item => ({
    id: item.id,
    productId: item.productId,
    name: item.productName || '상품',
    brand: item.brandName || '',
    imageUrl: item.productImageUrl || null,
    positionX: item.positionX ?? 0.5,
    positionY: item.positionY ?? 0.5,
    zIndex: item.zIndex ?? 0
  }))

  // 스티커 → decos 매핑
  const apiStickers = carrier.stickers || []
  nameTagImg.value = null
  selDeco.value = null
  decos.value = apiStickers.map(s => ({
    uid: 'api_' + s.id,
    apiId: s.id,
    id: s.stickerType,
    emoji: s.content || s.stickerType,
    type: s.stickerType === 'PHOTO_TAG' ? 'phototag' : 'emoji',
    content: s.content || null,
    imageUrl: s.imageUrl || null,
    stickerType: s.stickerType,
    x: (s.positionX ?? 0.5) * 100,
    y: (s.positionY ?? 0.5) * 100,
    scale: s.scaleRatio ?? 1,
    flipped: false,
    rotation: s.rotation ?? 0
  }))

  // 포토택 이미지 URL 복원
  const phototag = decos.value.find(d => d.type === 'phototag')
  if (phototag?.imageUrl) {
    nameTagImg.value = phototag.imageUrl
  }
}

onMounted(() => {
  loadCarrierData()
})

// 스킨 변경 시 dirty 마킹 (저장 시 API 호출)
watch(activeSkin, (newSkin, oldSkin) => {
  if (!carrierId.value || !oldSkin || slotSwitching.value) return
  dirtySkin.value = true
}, { flush: 'sync' })

watch(defaultColor, () => {
  if (!carrierId.value || activeSkin.value !== 'default' || slotSwitching.value) return
  dirtySkin.value = true
}, { flush: 'sync' })

// ==================== 공유 배경색 (스킨별) ====================
const SHARE_BG = { '#7c3aed': '#e5e1f7', '#ec4899': '#f9ecf1', '#0ea5e9': '#f1f8fe', '#eab308': '#fef8e1', '#b45309': '#fef3e1', '#6366f1': '#e0dff7', '#dc2626': '#fce5e5' }
const shareBg = computed(() => SHARE_BG[currentSkin.value.body.stroke] || '#e5e1f7')

// ==================== 공유 프리뷰용 버블 (px → SVG viewBox 변환) ====================
const shareBubbles = computed(() => {
  if (!dims.w || !dims.h || !rendered.value.length) return []
  const b = getBounds(dims.w, dims.h)
  const bw = b.right - b.left, bh = b.bottom - b.top
  // SVG viewBox 내부 영역 (CVB: x1=30, y1=50, x2=270, y2=370)
  const svgW = CVB.x2 - CVB.x1, svgH = CVB.y2 - CVB.y1
  return rendered.value.map((pos, i) => {
    if (!pos || !sortedItems.value[i] || !nodes.value[i]) return null
    const n = nodes.value[i]
    const rs = getRankStyle(i + 1, sortedItems.value.length)
    // 픽셀 좌표 → 0~1 비율 → SVG viewBox 좌표
    const rx = (pos.x - b.left) / bw
    const ry = (pos.y - b.top) / bh
    const rr = n.r / bw
    return {
      cx: CVB.x1 + rx * svgW,
      cy: CVB.y1 + ry * svgH,
      r: rr * svgW,
      bg: typeof rs.bg === 'string' && rs.bg.includes('gradient') ? (i === 0 ? '#7c3aed' : i === 1 ? '#8b5cf6' : i === 2 ? '#a78bfa' : '#f0edf9') : rs.bg,
      border: rs.border,
      tc: rs.tc,
      sc: rs.sc,
      name: sortedItems.value[i].name,
      brand: sortedItems.value[i].brand
    }
  }).filter(Boolean)
})

// ==================== 아이템 관련 ====================
const selectedItem = computed(() => items.value.find(i => i.id === selected.value))
const selectedRank = computed(() => {
  const idx = sortedItems.value.findIndex(s => s.id === selected.value)
  return idx + 1
})
const selectedRankStyle = computed(() => {
  const rk = selectedRank.value
  const rs = getRankStyle(rk, sortedItems.value.length)
  return {
    background: rk <= 3 ? rs.bg : '#f5f3ff',
    color: rk <= 3 ? rs.tc : '#7c3aed'
  }
})

const displayItems = computed(() => {
  if (itemsExpanded.value) return sortedItems.value
  return sortedItems.value.slice(0, visibleCount + 1)
})

function getRankStyle(r, t) {
  if (r === 1) return { bg: 'linear-gradient(135deg,#7c3aed,#a78bfa)', border: '#7c3aed', glow: 'rgba(124,58,237,0.25)', tc: '#fff', sc: 'rgba(255,255,255,0.75)' }
  if (r === 2) return { bg: 'linear-gradient(135deg,#8b5cf6,#c4b5fd)', border: '#8b5cf6', glow: 'rgba(139,92,246,0.2)', tc: '#fff', sc: 'rgba(255,255,255,0.7)' }
  if (r === 3) return { bg: 'linear-gradient(135deg,#a78bfa,#ddd6fe)', border: '#a78bfa', glow: 'rgba(167,139,250,0.15)', tc: '#fff', sc: 'rgba(255,255,255,0.7)' }
  return {
    bg: `hsl(263,40%,${96 + Math.min(1, (r - 3) / Math.max(1, t - 3)) * 3}%)`,
    border: `hsl(263,30%,${88 + Math.min(1, (r - 3) / Math.max(1, t - 3)) * 6}%)`,
    glow: 'transparent', tc: '#555', sc: '#999'
  }
}

function getBubbleStyle(i, pos) {
  if (!pos || !nodes.value[i]) return { display: 'none' }
  const r = nodes.value[i].r
  const rk = i + 1
  const rs = getRankStyle(rk, sortedItems.value.length)
  const isSel = selected.value === sortedItems.value[i]?.id
  const isD = dragId.value === sortedItems.value[i]?.id
  const imgUrl = sortedItems.value[i]?.imageUrl
  return {
    position: 'absolute',
    left: (pos.x - r) + 'px',
    top: (pos.y - r) + 'px',
    width: r * 2 + 'px',
    height: r * 2 + 'px',
    borderRadius: '50%',
    background: imgUrl ? `url(${imgUrl}) center/cover no-repeat` : rs.bg,
    border: `${isSel ? '2.5px' : '2px'} solid ${isSel ? '#7c3aed' : rs.border}`,
    boxShadow: isD ? '0 12px 40px rgba(124,58,237,.35)' : `0 4px 16px ${rs.glow}`,
    zIndex: isD ? 100 : isSel ? 50 : rk <= 3 ? 10 : 1,
    transform: isD ? 'scale(1.08)' : 'scale(1)',
    transition: isD ? 'none' : 'transform .2s cubic-bezier(.34,1.56,.64,1)',
    cursor: isD ? 'grabbing' : 'grab',
    userSelect: 'none'
  }
}

function toggleSelect(id) {
  selected.value = selected.value === id ? null : id
}

async function removeItemFromCarrier(id) {
  if (carrierId.value) {
    const success = await apiRemoveItem(carrierId.value, id)
    if (!success) return
  }
  items.value = items.value.filter(i => i.id !== id)
  if (selected.value === id) selected.value = null
}

// ==================== 드래그 (버블) ====================
function onBubbleDown(e, id) {
  const rect = innerRef.value?.getBoundingClientRect()
  if (!rect) return
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  const cx = clientX - rect.left, cy = clientY - rect.top
  const b = posRef.current.find(b => b.id === id)
  if (!b) return

  ds.current = { dragging: true, id, ox: b.x - cx, oy: b.y - cy, lastX: cx, lastY: cy, velX: 0, velY: 0 }
  dragId.value = id

  const onMove = (ev) => {
    const px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left
    const py = (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top
    const d = ds.current
    d.velX = (px - d.lastX) * 0.6
    d.velY = (py - d.lastY) * 0.6
    d.lastX = px; d.lastY = py
    const body = posRef.current.find(b => b.id === id)
    if (body) { body.x = px + d.ox; body.y = py + d.oy }
  }

  const onUp = () => {
    const d = ds.current
    const body = posRef.current.find(b => b.id === id)
    if (body) { body.vx = d.velX; body.vy = d.velY }
    ds.current = { dragging: false, id: null, ox: 0, oy: 0, lastX: 0, lastY: 0, velX: 0, velY: 0 }
    dragId.value = null
    dirtyBubbles.value = true
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend', onUp)
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onUp)
}

// ==================== 토글 ====================
function toggle() {
  if (anim.value) return
  anim.value = true
  isOpen.value = !isOpen.value
  setTimeout(() => { anim.value = false }, 500)
}

// ==================== 스킨 캐러셀 ====================
function scrollSkins(dir) {
  skinScroll.value = Math.max(0, Math.min(skinMaxScroll.value, skinScroll.value + dir * (IW + G)))
}

// ==================== 네임택 ====================
async function onNameTagImgChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''

  // 로컬 미리보기 즉시 표시
  const reader = new FileReader()
  reader.onload = ev => { nameTagImg.value = ev.target.result }
  reader.readAsDataURL(file)

  // S3 presigned URL로 업로드
  phototagUploading.value = true
  try {
    const result = await fileService.uploadFiles(file, { fileCode: 'CARRIER' })
    if (result.success && result.data) {
      const fileUrl = result.data.fileUrl || result.data.storedPath
      if (fileUrl) {
        // 포토택 deco의 imageUrl 업데이트
        const phototag = decos.value.find(d => d.type === 'phototag')
        if (phototag) {
          phototag.imageUrl = fileUrl
          nameTagImg.value = fileUrl
          markDecoDirty(phototag.uid)
        }
      }
    }
  } catch (err) {
    console.error('[CARRIER] 포토택 이미지 업로드 실패:', err)
  } finally {
    phototagUploading.value = false
  }
}

function onPhototagHover(e, enter) {
  const del = e.currentTarget.querySelector('.nt-del')
  if (del) del.style.opacity = enter ? '1' : '0'
}

function clearPhototagImage() {
  nameTagImg.value = null
  const phototag = decos.value.find(d => d.type === 'phototag')
  if (phototag) {
    phototag.imageUrl = null
    markDecoDirty(phototag.uid)
  }
}

function removePhototag() {
  const phototag = decos.value.find(d => d.type === 'phototag')
  if (phototag) {
    removeDeco(phototag.uid)
    nameTagImg.value = null
  }
}

function selectPhototag() {
  const phototag = decos.value.find(d => d.type === 'phototag')
  if (phototag) {
    selDeco.value = selDeco.value === phototag.uid ? null : phototag.uid
  }
}

function placeDeco(d) {
  // 포토택 토글 (있으면 제거, 없으면 추가)
  if (d.type === 'phototag') {
    const existing = decos.value.find(v => v.type === 'phototag')
    if (existing) {
      if (existing.apiId) {
        pendingDeletes.value = [...pendingDeletes.value, existing.apiId]
      } else {
        pendingAdds.value = pendingAdds.value.filter(uid => uid !== existing.uid)
      }
      decos.value = decos.value.filter(v => v.type !== 'phototag')
      nameTagImg.value = null
      return
    }
  }

  const tempUid = d.id + '_' + Date.now()
  const newDeco = {
    uid: tempUid, id: d.id, emoji: d.emoji,
    type: d.type || 'emoji',
    x: 30 + Math.random() * 40, y: 30 + Math.random() * 40, scale: 1, flipped: false
  }

  decos.value = [...decos.value, newDeco]
  pendingAdds.value = [...pendingAdds.value, tempUid]
}

function scaleDeco(uid, delta) {
  decos.value = decos.value.map(v => v.uid === uid ? { ...v, scale: Math.max(DMIN, Math.min(DMAX, v.scale + delta)) } : v)
  markDecoDirty(uid)
}

function flipDeco(uid) {
  decos.value = decos.value.map(v => v.uid === uid ? { ...v, flipped: !v.flipped } : v)
  markDecoDirty(uid)
}

function markDecoDirty(uid) {
  const deco = decos.value.find(v => v.uid === uid)
  if (deco?.apiId) {
    dirtyDecos.value = new Set([...dirtyDecos.value, uid])
  }
}

function removeDeco(uid) {
  const deco = decos.value.find(v => v.uid === uid)
  if (deco?.apiId) {
    // 서버에 있는 스티커 → 저장 시 삭제
    pendingDeletes.value = [...pendingDeletes.value, deco.apiId]
  } else {
    // 아직 서버에 안 올린 스티커 → pendingAdds에서 제거
    pendingAdds.value = pendingAdds.value.filter(u => u !== uid)
  }
  decos.value = decos.value.filter(v => v.uid !== uid)
  dirtyDecos.value = new Set([...dirtyDecos.value].filter(u => u !== uid))
  if (selDeco.value === uid) selDeco.value = null
}

function bulkDeleteAllDecos() {
  if (!decos.value.length) return
  // 서버에 있는 스티커들 → 저장 시 삭제
  const apiIds = decos.value.filter(d => d.apiId).map(d => d.apiId)
  if (apiIds.length > 0) {
    pendingDeletes.value = [...pendingDeletes.value, ...apiIds]
  }
  // pendingAdds 초기화 (아직 서버에 안 올린 것들은 그냥 버림)
  pendingAdds.value = []
  decos.value = []
  nameTagImg.value = null
  selDeco.value = null
  dirtyDecos.value = new Set()
}

// ==================== 데코 드래그 ====================
function getDecoOverlayStyle(d) {
  const box = boxRef.value?.getBoundingClientRect()
  if (!box) return { display: 'none' }
  const b = getBounds(box.width, box.height)
  const bw = b.right - b.left, bh = b.bottom - b.top
  const px = b.left + (d.x / 100) * bw
  const py = b.top + (d.y / 100) * bh
  const sw = decoBase.value * d.scale
  const sh = decoBase.value * d.scale
  return {
    position: 'absolute',
    left: (px - sw / 2) + 'px',
    top: (py - sh / 2) + 'px',
    zIndex: selDeco.value === d.uid ? 20 : 5
  }
}

let decoDragActive = false

function onDecoDown(e, uid) {
  decoDragActive = false
  const box = boxRef.value?.getBoundingClientRect()
  if (!box) return

  // 핀치 줌: 두 손가락 감지
  if (e.touches && e.touches.length >= 2) {
    selDeco.value = uid
    const deco = decos.value.find(d => d.uid === uid)
    if (!deco) return
    const initDist = Math.hypot(
      e.touches[1].clientX - e.touches[0].clientX,
      e.touches[1].clientY - e.touches[0].clientY
    )
    const initScale = deco.scale

    const onPinchMove = (ev) => {
      if (!ev.touches || ev.touches.length < 2) return
      ev.preventDefault()
      const dist = Math.hypot(
        ev.touches[1].clientX - ev.touches[0].clientX,
        ev.touches[1].clientY - ev.touches[0].clientY
      )
      const newScale = Math.max(DMIN, Math.min(DMAX, initScale * (dist / initDist)))
      decos.value = decos.value.map(d => d.uid === uid ? { ...d, scale: newScale } : d)
    }
    const onPinchEnd = () => {
      markDecoDirty(uid)
      window.removeEventListener('touchmove', onPinchMove)
      window.removeEventListener('touchend', onPinchEnd)
    }
    window.addEventListener('touchmove', onPinchMove, { passive: false })
    window.addEventListener('touchend', onPinchEnd)
    return
  }

  // 단일 터치/마우스: 드래그
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  const cx = clientX - box.left, cy = clientY - box.top
  const b = getBounds(box.width, box.height)
  const deco = decos.value.find(d => d.uid === uid)
  if (!deco) return
  const bw = b.right - b.left, bh = b.bottom - b.top
  const dpx = b.left + (deco.x / 100) * bw
  const dpy = b.top + (deco.y / 100) * bh
  const ox = dpx - cx, oy = dpy - cy

  const onMove = (ev) => {
    // 도중에 두 번째 손가락이 추가되면 무시
    if (ev.touches && ev.touches.length >= 2) return
    decoDragActive = true
    const mx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - box.left
    const my = (ev.touches ? ev.touches[0].clientY : ev.clientY) - box.top
    const px = Math.max(2, Math.min(98, ((mx + ox - b.left) / bw) * 100))
    const py = Math.max(2, Math.min(98, ((my + oy - b.top) / bh) * 100))
    decos.value = decos.value.map(d => d.uid === uid ? { ...d, x: px, y: py } : d)
  }

  const onUp = () => {
    if (!decoDragActive) selDeco.value = selDeco.value === uid ? null : uid
    else markDecoDirty(uid)
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend', onUp)
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onUp)
}

// ==================== 공유 ====================
function downloadCarrierImage() {
  const svgEl = document.querySelector('[data-share-svg]')
  if (!svgEl) return
  const canvas = document.createElement('canvas')
  canvas.width = 760; canvas.height = 1000
  const ctx = canvas.getContext('2d')
  const svgData = new XMLSerializer().serializeToString(svgEl)
  const img = new Image()
  img.onload = () => {
    ctx.fillStyle = shareBg.value; ctx.fillRect(0, 0, 760, 1000)
    ctx.drawImage(img, 0, 0, 760, 1000)
    const a = document.createElement('a')
    a.download = shareNickname.value ? `${shareNickname.value}-carrier.png` : 'my-carrier.png'
    a.href = canvas.toDataURL('image/png')
    a.click()
  }
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
}
</script>

<style>
/* ==================== 기본 레이아웃 ==================== */
.carrier-page {
  min-height: 100vh;
  background: #fff;
  color: #1a1a1a;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

/* ==================== 헤더 ==================== */
.carrier-top-header {
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}
.carrier-top-header .header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.carrier-top-header .back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: none;
  background: #f5f3ff;
  color: #7c3aed;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.carrier-top-header .back-btn:hover { background: #ede9fe; }
.header-title-area {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.header-page-title {
  font-size: 17px;
  font-weight: 800;
  color: #111;
  margin: 0;
  white-space: nowrap;
}
.header-item-count {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  white-space: nowrap;
}


/* ==================== 모바일 탭 바 ==================== */
.mobile-tab-bar {
  display: none;
}

.carrier-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px 60px;
}

.carrier-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: center;
}

.left-panel { flex: 0 0 280px; display: flex; flex-direction: column; gap: 16px; }
.center-panel { flex: 1 1 400px; min-width: 280px; max-width: 480px; display: flex; flex-direction: column; gap: 6px; }
.right-panel { flex: 0 0 220px; min-width: 200px; max-width: 240px; display: flex; flex-direction: column; gap: 16px; }

.panel-title-row { display: flex; align-items: center; gap: 6px; padding: 0 2px; margin-bottom: -6px; }
.panel-label { font-size: 14px; font-weight: 700; color: #333; letter-spacing: -0.3px; }

/* ==================== 카드 공통 ==================== */
.shop-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #ebe7f2;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(124, 58, 237, 0.04);
}
.shop-card-header {
  padding: 12px 14px;
  border-bottom: 1px solid #f3f1f8;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.shop-card-title { font-size: 12px; font-weight: 700; color: #7c3aed; letter-spacing: -0.2px; }
.shop-card-actions { display: flex; align-items: center; gap: 6px; }

/* ==================== 스킨 캐러셀 ==================== */
.current-skin-badge {
  background: #f5f3ff;
  padding: 3px 10px;
  border-radius: 10px;
}
.current-skin-badge span { font-size: 10px; color: #7c3aed; font-weight: 600; }

.skin-carousel {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
}
.carousel-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  width: 24px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 1;
  transition: background .15s;
}
.carousel-btn:not(:disabled) { background: #f5f3ff; }
.carousel-btn:disabled { opacity: 0.25; cursor: default; }

.skin-viewport {
  width: calc(110px * 2 + 8px + 55px);
  overflow: hidden;
  flex-shrink: 0;
}
.skin-track {
  display: flex;
  gap: 8px;
  transition: transform .35s cubic-bezier(.4,0,.2,1);
}

.skin-item-wrap { flex: 0 0 110px; position: relative; }

.skin-preview {
  cursor: pointer;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  border: 1.5px solid #e0d8f5;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.2s;
  background: #fff;
}
.skin-preview.active {
  border: 2.5px solid #7c3aed;
  box-shadow: 0 4px 16px rgba(124,58,237,0.15);
}

.skin-badge {
  position: absolute;
  z-index: 10;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  padding: 3px 8px;
}
.skin-badge.sp { top: 0; right: 0; background: linear-gradient(135deg,#f59e0b,#d97706); border-radius: 0 12px 0 8px; }

.skin-svg-wrap { padding: 12px 8px 8px; display: flex; justify-content: center; }
.skin-info { padding: 4px 10px 10px; text-align: center; }
.skin-name { font-size: 12px; font-weight: 700; color: #333; }
.skin-name.empty { color: #bbb; }
.skin-desc { font-size: 10px; color: #999; margin-top: 1px; }
.skin-desc.empty { color: #ccc; }
.skin-active-bar { height: 3px; background: linear-gradient(90deg, #7c3aed, #a78bfa); }

/* ==================== 스티커 팔레트 ==================== */
.deco-page-nav { display: flex; align-items: center; gap: 6px; }
.page-info { font-size: 10px; color: #aaa; }
.page-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-btn:not(:disabled) { background: #f5f3ff; }
.page-btn:disabled { opacity: 0.25; cursor: default; }

.sticker-pack-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 4px;
}
.pack-tabs-left {
  display: flex;
  gap: 5px;
}
.pack-tab {
  padding: 4px 12px;
  border: none;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  background: #f3f0ff;
  color: #7c3aed;
  transition: all .2s;
}
.pack-tab.active {
  background: #7c3aed;
  color: #fff;
}

.deco-grid-viewport { padding: 6px 0 8px; overflow: hidden; }
.deco-track {
  display: flex;
  transition: transform .35s cubic-bezier(.4,0,.2,1);
}
.deco-page {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 6px;
  padding: 0 10px;
  box-sizing: border-box;
  height: 120px;
}
.deco-item {
  cursor: pointer;
  border-radius: 10px;
  border: 1.5px solid #e0d8f5;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  transition: all .2s;
  background: #faf8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  min-width: 0;
  min-height: 0;
}
.deco-item.deco-empty {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  cursor: default;
  pointer-events: none;
}
.deco-item:hover { border-color: #c4b5fd; transform: translateY(-2px); }

.save-deco-wrap { padding: 0 10px 12px; display: flex; flex-direction: column; gap: 6px; }
.clear-all-deco-btn {
  width: 100%;
  padding: 8px;
  border: 1.5px solid #ef4444;
  border-radius: 10px;
  background: #fff;
  color: #ef4444;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
}
.clear-all-deco-btn:hover { background: #fef2f2; }
.clear-all-deco-btn:disabled { opacity: 0.5; cursor: not-allowed; }
/* 캐꾸 저장 바 */
.deco-save-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 10px 8px;
  padding: 8px 10px;
  background: #f5f3ff;
  border-radius: 10px;
}
.deco-save-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.deco-save-emoji {
  font-size: 14px;
  line-height: 1;
}
.deco-save-label {
  font-size: 11px;
  font-weight: 600;
  color: #7c3aed;
  white-space: nowrap;
}
.deco-save-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: #7c3aed;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all .15s;
}
.deco-save-btn:hover { background: #6d28d9; }
.deco-save-btn.disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}
.deco-bar-enter-active,
.deco-bar-leave-active { transition: all .2s ease; }
.deco-bar-enter-from,
.deco-bar-leave-to { opacity: 0; transform: translateY(-4px); }

/* ==================== 캐꾸 슬롯 탭 ==================== */
.carrier-slot-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 2px 0;
}
.carrier-slot-tabs::-webkit-scrollbar { display: none; }
.slot-tab {
  flex: 0 0 auto;
  min-width: 100px;
  position: relative;
  padding: 9px 18px;
  border: 1.5px dashed #d5d0e0;
  border-radius: 12px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #a8a3b3;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.slot-tab.active {
  border-style: solid;
  border-color: #7c3aed;
  background: #f9f5ff;
  color: #7c3aed;
}
.slot-tab:not(.active):hover {
  border-color: #b8b0c8;
  background: #faf8fd;
  color: #7c6b94;
}
.slot-tab:disabled {
  opacity: 0.6;
  cursor: wait;
}
.slot-unsaved-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #f87171;
  margin-left: 5px;
  vertical-align: middle;
}
.slot-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 24px;
}

/* ==================== 캐리어 뷰 ==================== */
.carrier-box-wrap { position: relative; }
.carrier-box {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 24px;
  background: #fff;
  border: 1px solid #e0d8f5;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
}

.share-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 10;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.85);
  color: #7c3aed;
  cursor: pointer;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: background 0.15s, transform 0.15s;
}
.share-btn:hover { background: #f5f3ff; transform: scale(1.08); }

.color-picker {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 10;
  display: flex;
  gap: 6px;
}
.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid rgba(255,255,255,0.8);
  transition: all .15s;
}
.color-dot.active { border: 2.5px solid #333; transform: scale(1.15); }
.color-dot:hover:not(.active) { transform: scale(1.1); }

.view-toggle-bar {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.inline-slot-tabs {
  display: none;
}
.view-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.toggle-label { font-size: 12px; color: #888; font-weight: 500; }
.toggle-switch {
  width: 52px;
  height: 28px;
  border-radius: 14px;
  cursor: pointer;
  background: #e5e7eb;
  position: relative;
  transition: background .3s;
  flex-shrink: 0;
}
.toggle-switch.on { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
.toggle-knob {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 3px;
  transition: left .3s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 1px 4px rgba(0,0,0,.15);
}

.carrier-view-area {
  position: absolute;
  inset: 48px 16px 16px 16px;
}

.carrier-layer {
  position: absolute;
  inset: 0;
  transition: opacity .5s;
  opacity: 0;
  pointer-events: none;
  border-radius: 18px;
  overflow: hidden;
}
.carrier-layer.visible { opacity: 1; pointer-events: auto; }

.carrier-frame-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.physics-area { position: absolute; inset: 0; }
.empty-carrier {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c4b5fd;
  font-size: 14px;
}

/* ==================== 버블 ==================== */
.bubble {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.bubble-name {
  font-weight: 700;
  max-width: 150%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
  pointer-events: none;
}
.bubble-brand { margin-top: 2px; pointer-events: none; }

.rank-badge {
  position: absolute;
  font-weight: 900;
  padding: 1px 6px;
  pointer-events: none;
}
.rank-badge.top {
  top: 2px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 4px;
}
.rank-badge.normal {
  top: -4px;
  right: -4px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  border: 1.5px solid #fff;
}

.bubble-remove {
  position: absolute;
  top: -5px;
  left: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  border: 2px solid #fff;
  z-index: 10;
}

/* ==================== 데코 오버레이 ==================== */
.deco-overlay { position: absolute; }
.deco-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,.15));
  border-radius: 8px;
  background: transparent;
  transition: outline .15s, background .15s;
}
.deco-emoji.selected { outline: 2.5px solid #7c3aed; outline-offset: 3px; background: rgba(124,58,237,.06); }

/* 포토택 (고정 SVG) */
.phototag-fixed .nt-del { opacity: 0; transition: opacity .15s; }

/* 스페셜 스티커 아이템 */
.deco-item.deco-special {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 12px;
}
.deco-item.deco-special .special-icon { font-size: 20px; }
.deco-item.deco-special .special-label { font-size: 9px; font-weight: 700; color: #7c3aed; }
.deco-item.deco-active { background: rgba(124,58,237,0.1); outline: 2px solid #7c3aed; outline-offset: -2px; border-radius: 8px; }

.deco-toolbar {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 2px;
  background: #fff;
  border-radius: 10px;
  padding: 3px 4px;
  box-shadow: 0 4px 16px rgba(0,0,0,.15);
  border: 1px solid #e0d8f5;
  z-index: 30;
  white-space: nowrap;
}
.tb-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 7px;
  background: #f5f3ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #7c3aed;
}
.tb-btn:disabled { background: #f5f5f5; color: #ccc; cursor: default; }
.tb-btn.remove { background: #fef2f2; color: #ef4444; font-size: 11px; }
.tb-sep { width: 1px; height: 16px; background: #e5e7eb; margin: 0 2px; }
.tb-scale { font-size: 10px; font-weight: 700; color: #7c3aed; min-width: 32px; text-align: center; }

/* ==================== 아이템 목록 ==================== */
.item-count-badge { background: #f5f3ff; padding: 2px 8px; border-radius: 10px; }
.item-count-badge span { font-size: 11px; color: #7c3aed; font-weight: 700; }

.empty-items { padding: 30px 14px; text-align: center; color: #ccc; font-size: 12px; }

.item-list { overflow: hidden; position: relative; }
.item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid #f5f5f5;
  background: transparent;
  cursor: pointer;
  transition: all .2s;
  border-left: 3px solid transparent;
  animation: fadeIn .3s ease both;
}
.item-row:last-child { border-bottom: none; }
.item-row.selected { background: #f5f3ff; border-left-color: #7c3aed; }
.item-row:hover:not(.selected) { background: #fcfbff; }
.item-row.faded { max-height: 28px; overflow: hidden; opacity: 0.4; mask-image: linear-gradient(to bottom, black 0%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%); }

.item-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
  background: #f5f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #e0d8f5;
  position: relative;
  transition: all .2s;
}
.item-icon.selected { background: #ede9fe; border-color: #c4b5fd; }
.item-rank {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 900;
  border: 1.5px solid #fff;
}

.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 12px; font-weight: 650; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
.item-meta { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
.item-brand { font-size: 10px; color: #999; }
.meta-dot { font-size: 9px; color: #e0e0e0; }
.item-rating { font-size: 10px; color: #f59e0b; }

.item-remove {
  border: none;
  background: none;
  cursor: pointer;
  color: #ddd;
  font-size: 12px;
  padding: 3px;
  border-radius: 6px;
  transition: all .15s;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.item-remove:hover { color: #ef4444; background: #fef2f2; }

.expand-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-top: 1px solid #f3f4f6;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #7c3aed;
  transition: all .15s;
}
.expand-btn:hover { background: #f5f3ff; }
.expand-btn svg { transition: transform .2s; }

.add-more-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: #9333EA;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(147,51,234,0.25);
  transition: all .2s;
}
.add-more-btn:hover { transform: translateY(-1px); }

/* ==================== 아이템 상세 ==================== */
.item-detail-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e0d8f5;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,.04);
  animation: slideUp .3s ease;
}
.detail-header {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 8px;
}
.detail-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f5f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #e0d8f5;
}
.detail-name { font-size: 14px; font-weight: 700; color: #111; }
.detail-brand { font-size: 11px; color: #999; }
.detail-rank {
  margin-left: auto;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 8px;
}

.detail-stats {
  padding: 12px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.stat-box {
  background: #f5f3ff;
  border-radius: 10px;
  padding: 10px 12px;
  text-align: center;
}
.stat-box.full { grid-column: 1 / -1; }
.stat-label { font-size: 10px; color: #999; margin-bottom: 2px; }
.stat-value { font-size: 16px; font-weight: 800; color: #7c3aed; }

/* ==================== 공유 모달 ==================== */
.share-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.share-modal {
  background: #fff;
  border-radius: 20px;
  padding: 0;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 24px 64px rgba(0,0,0,0.2);
  animation: modalIn .25s ease;
  overflow: hidden;
  position: relative;
}
.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  border: none;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(4px);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  font-weight: 700;
  transition: background .15s;
}
.modal-close:hover { background: rgba(255,255,255,0.95); }

.share-preview {
  padding: 28px 24px 20px;
  display: flex;
  justify-content: center;
  transition: background .3s;
}
.share-svg-wrap { width: 320px; height: 420px; }

.share-nickname-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  margin-top: 16px;
}
.nickname-icon { flex-shrink: 0; }
.share-nickname-input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid #e8e0f5;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  background: #faf8ff;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  box-sizing: border-box;
  font-family: 'HancomMalangMalang', 'SUIT', sans-serif;
}
.share-nickname-input::placeholder { color: #bbb; font-family: 'SUIT', sans-serif; font-weight: 400; }
.share-nickname-input:focus {
  border-color: #9333EA;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.share-save-btn {
  width: calc(100% - 40px);
  margin: 14px 20px 20px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: #9333EA;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background .15s;
}
.share-save-btn:hover { background: #7e22ce; }
.share-save-btn:active { transform: scale(0.98); }

/* ==================== 로딩 ==================== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
  gap: 16px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0d8f5;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ==================== 유틸리티 ==================== */
.no-select { user-select: none; }

/* ==================== 저장 FAB ==================== */
.save-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border: none;
  border-radius: 50px;
  background: #7c3aed;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(124,58,237,0.4);
  transition: all .2s;
}
.save-fab:hover:not(:disabled) { background: #6d28d9; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,0.5); }
.save-fab:active:not(:disabled) { transform: translateY(0); }
.save-fab.saving { background: #a78bfa; cursor: wait; }
.save-fab:disabled { opacity: 0.85; }

.save-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.save-fab-enter-active { animation: saveFabIn .3s ease; }
.save-fab-leave-active { animation: saveFabIn .2s ease reverse; }
@keyframes saveFabIn { from { opacity: 0; transform: translateY(16px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }

@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

/* ==================== 태블릿 (1024px 이하) ==================== */
@media (max-width: 1024px) {
  .carrier-layout {
    flex-wrap: wrap;
  }
  .left-panel {
    flex: 0 0 100%;
    order: 2;
  }
  .center-panel {
    flex: 1 1 100%;
    max-width: 480px;
    order: 1;
  }
  .right-panel {
    flex: 0 0 100%;
    order: 3;
  }
  .left-panel .shop-card { }
  .skin-viewport {
    width: 100% !important;
    max-width: 400px;
  }
}

/* ==================== 모바일 (768px 이하) ==================== */
@media (max-width: 768px) {
  .carrier-page {
    background: #fff;
    padding-bottom: 0;
  }

  /* center-panel 슬롯 탭 숨기기, carrier-box 안 슬롯 표시 */
  .center-panel .carrier-slot-tabs {
    display: none;
  }
  .inline-slot-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .inline-slot-btn {
    position: relative;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1.5px dashed rgba(124, 58, 237, 0.3);
    background: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    font-weight: 700;
    color: #a8a3b3;
    cursor: pointer;
    transition: all 0.15s;
    backdrop-filter: blur(4px);
  }
  .inline-slot-btn.active {
    border-style: solid;
    border-color: #7c3aed;
    background: rgba(245, 243, 255, 0.9);
    color: #7c3aed;
  }
  .inline-slot-btn:disabled { opacity: 0.5; cursor: wait; }
  .inline-slot-dot {
    position: absolute;
    top: 1px;
    right: 1px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #f87171;
  }

  /* 모바일 탭 바 표시 */
  .mobile-tab-bar {
    display: flex;
    background: #fff;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 52px;
    z-index: 99;
    padding: 0;
  }
  .mobile-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px 4px 8px;
    border: none;
    background: none;
    cursor: pointer;
    color: #9ca3af;
    font-size: 11px;
    font-weight: 600;
    transition: all 0.2s;
    position: relative;
  }
  .mobile-tab.active {
    color: #7c3aed;
  }
  .mobile-tab.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20%;
    right: 20%;
    height: 2.5px;
    background: #7c3aed;
    border-radius: 2px 2px 0 0;
  }

  /* 컨텐츠 영역 */
  .carrier-content {
    padding: 12px 12px 24px;
  }

  .carrier-layout {
    flex-direction: column;
    gap: 0;
  }

  /* 모바일에서 탭에 따라 패널 표시/숨김 */
  .left-panel,
  .center-panel,
  .right-panel {
    display: none;
    width: 100%;
    flex: none;
    max-width: 100%;
    min-width: 0;
  }
  .left-panel.mobile-active,
  .center-panel.mobile-active,
  .right-panel.mobile-active {
    display: flex;
  }

  /* 캐리어 탭 모바일: 뷰포트에 맞춤 */
  .center-panel.mobile-active {
    height: calc(100dvh - 94px);
    overflow: hidden;
    gap: 0;
    padding: 4px 0 0;
  }
  .center-panel.mobile-active .carrier-box-wrap {
    flex: 1;
    min-height: 0;
  }
  .center-panel.mobile-active .carrier-box {
    aspect-ratio: unset;
    height: 100%;
  }

  /* 캐리어 박스 모바일 */
  .carrier-box {
    border-radius: 20px;
    border: 1px solid #e0d8f5;
  }

  /* 스킨 캐러셀 모바일 */
  .skin-viewport {
    width: 100% !important;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .skin-track {
    gap: 6px;
  }
  .skin-item-wrap {
    flex: 0 0 95px;
  }
  .carousel-btn {
    display: none;
  }
  .skin-carousel {
    padding: 10px 8px;
  }

  /* 스티커 그리드 모바일 */
  .deco-item {
    font-size: 22px;
    border-radius: 10px;
  }

  /* 아이템 리스트 모바일 */
  .right-panel .shop-card {
    border-radius: 16px;
  }
  .item-row {
    padding: 12px 14px;
    gap: 12px;
  }
  .item-icon {
    width: 40px;
    height: 40px;
  }
  .item-name {
    font-size: 13px;
  }
  .item-remove {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  /* 더 담으러 가기 버튼 모바일 */
  .add-more-btn {
    border-radius: 12px;
    padding: 14px;
    font-size: 14px;
  }

  /* 아이템 상세 카드 모바일 */
  .item-detail-card {
    border-radius: 16px;
  }

  /* 토글 바 모바일 */
  .view-toggle-bar {
    top: 10px;
    left: 10px;
    right: 10px;
  }
  .color-picker {
    top: 10px;
    left: 10px;
  }
  .color-dot {
    width: 28px;
    height: 28px;
  }

  /* 저장 버튼 모바일 */
  .save-fab {
    bottom: 20px;
    right: 16px;
    padding: 10px 18px;
    font-size: 13px;
  }

  /* 공유 모달 모바일 */
  .share-modal {
    max-width: calc(100% - 32px);
    border-radius: 20px;
    max-height: 88vh;
    overflow-y: auto;
  }
  .share-modal-overlay {
    align-items: center;
    padding: 16px;
  }
  .share-preview { padding: 20px 16px 14px; }
  .share-svg-wrap {
    width: 100%;
    max-width: 280px;
    height: auto;
    aspect-ratio: 380 / 500;
  }
  .share-nickname-row { padding: 0 16px; margin-top: 14px; }
  .share-save-btn { width: calc(100% - 32px); margin: 12px 16px 16px; }
}

/* ==================== 작은 모바일 (480px 이하) ==================== */
@media (max-width: 480px) {
  .header-page-title {
    font-size: 15px;
  }
  .header-item-count {
    font-size: 11px;
  }
  .carrier-content {
    padding: 8px 8px 20px;
  }
  .shop-card {
    border-radius: 14px;
  }
  .carrier-box {
    border-radius: 16px;
  }
  .deco-page {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 6px;
  }
}

@keyframes slideUpModal { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>
