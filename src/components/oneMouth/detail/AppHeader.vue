<!-- AppHeader.vue -->
<template>
  <header class="header">
    <div class="container">
      <h1 class="logo">한입만</h1>

      <nav class="nav">
        <button class="nav-btn">카테고리</button>
        <button class="nav-btn">판매하기</button>
        <button class="nav-btn">내 주문</button>
        <button class="cart">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
          </svg>
          <span class="badge">3</span>
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: white;
  border-bottom: 1px solid #E5E5E5;
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1A1A1A;
}

.nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #525252;
  cursor: pointer;
  transition: color 0.2s;
}

.nav-btn:hover {
  color: #1A1A1A;
}

.cart {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.cart svg {
  color: #525252;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #1A1A1A;
  color: white;
  font-size: 0.625rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

@media (max-width: 640px) {
  .nav-btn:not(:last-of-type) {
    display: none;
  }
}
</style>