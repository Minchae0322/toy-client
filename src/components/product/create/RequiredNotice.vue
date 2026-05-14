<template>
  <div class="required-notice">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="#D97706" stroke-width="1.5"/>
      <path d="M10 6V10" stroke="#D97706" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="13" r="0.5" fill="#D97706"/>
    </svg>
    <span class="notice-text">
      <span class="required-mark">*</span> 표시는 필수 입력 항목입니다
    </span>
  </div>
</template>

<style scoped>
.required-notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: var(--c-warning-soft);
  border: 1px solid var(--c-warning);
  border-radius: 10px;
  margin-bottom: 32px;
}

.notice-text {
  font-size: 14px;
  color: var(--c-warning);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.required-mark {
  color: var(--c-danger);
  font-weight: 700;
  font-size: 16px;
}

@media (max-width: 480px) {
  .required-notice {
    padding: 12px 16px;
  }

  .notice-text {
    font-size: 13px;
  }
}
</style>