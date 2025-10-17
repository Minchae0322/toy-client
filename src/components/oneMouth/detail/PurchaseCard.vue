<!-- PurchaseCard.vue -->
<template>
  <div class="purchase-wrap">
    <div class="card">
      <div class="header">
        <div class="tags">
          <span class="tag primary">판매중</span>
          <span class="tag">{{ product.categoryName || '식품' }}</span>
        </div>
        <h1 class="title">{{ product.title }}</h1>
        <div class="meta">
          <span class="meta-item">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {{ product.tradeLocation || '서울 강남구' }}
          </span>
          <span class="meta-item">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
            </svg>
            {{ getRelativeTime(product.createdAt) }}
          </span>
        </div>
      </div>

      <div class="options">
        <div class="option-group">
          <label class="label">옵션</label>
          <div class="option-btns">
            <button
                v-for="opt in options"
                :key="opt.id"
                @click="$emit('update:selected-option', opt.id)"
                class="option-btn"
                :class="{ active: selectedOption === opt.id }"
            >
              <span class="opt-label">{{ opt.label }}</span>
              <span class="opt-price">{{ opt.price.toLocaleString() }}원</span>
            </button>
          </div>
        </div>

        <div class="option-group">
          <label class="label">수량</label>
          <div class="qty-control">
            <button @click="decreaseQty" class="qty-btn">−</button>
            <input
                type="number"
                :value="quantity"
                @input="updateQty($event.target.value)"
                min="1"
                class="qty-input"
            />
            <button @click="increaseQty" class="qty-btn">+</button>
          </div>
        </div>

        <div class="delivery-info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <div>
            <strong>오늘 출발</strong>
            <span>오후 2시 전 주문 시</span>
          </div>
        </div>

        <div class="price-summary">
          <div class="price-row">
            <span>상품 금액</span>
            <span>{{ (currentPrice * quantity).toLocaleString() }}원</span>
          </div>
          <div class="price-row">
            <span>배송비</span>
            <span>{{ deliveryFee.toLocaleString() }}원</span>
          </div>
          <div class="price-total">
            <span>결제 금액</span>
            <strong>{{ totalPrice.toLocaleString() }}원</strong>
          </div>
        </div>
      </div>

      <div class="actions">
        <button @click="$emit('add-to-cart')" class="btn btn-secondary">장바구니</button>
        <button @click="$emit('buy-now')" class="btn btn-primary">바로 구매</button>
      </div>
    </div>

    <button class="chat-btn">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
      </svg>
      판매자와 채팅하기
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  product: { type: Object, required: true },
  options: { type: Array, required: true },
  selectedOption: { type: String, required: true },
  quantity: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
})

const emit = defineEmits(['update:selected-option', 'update:quantity', 'add-to-cart', 'buy-now'])

const decreaseQty = () => {
  if (props.quantity > 1) {
    emit('update:quantity', props.quantity - 1)
  }
}

const increaseQty = () => {
  const maxQty = props.product?.stock || 50
  if (props.quantity < maxQty) {
    emit('update:quantity', props.quantity + 1)
  }
}

const updateQty = (value) => {
  const num = parseInt(value) || 1
  emit('update:quantity', Math.max(1, num))
}

const getRelativeTime = (timestamp) => {
  if (!timestamp) return ''
  const now = new Date()
  const date = new Date(timestamp)
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}
</script>

<style scoped>
.purchase-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
}

.header {
  padding-bottom: 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #E5E5E5;
}

.tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  background: #F3F4F6;
  color: #6B7280;
  font-weight: 500;
}

.tag.primary {
  background: #10B981;
  color: white;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 0.75rem;
  color: #1A1A1A;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.8125rem;
  color: #737373;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1A1A1A;
}

.option-btns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.option-btn {
  padding: 0.875rem 0.5rem;
  background: white;
  border: 1px solid #D4D4D4;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.option-btn:hover {
  border-color: #A3A3A3;
}

.option-btn.active {
  border-color: #1A1A1A;
  background: #F9FAFB;
}

.opt-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #1A1A1A;
}

.opt-price {
  display: block;
  font-size: 0.8125rem;
  color: #737373;
}

.qty-control {
  display: flex;
  width: fit-content;
  border: 1px solid #D4D4D4;
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  font-size: 1.125rem;
  color: #525252;
  cursor: pointer;
  transition: background 0.2s;
}

.qty-btn:hover {
  background: #F9FAFB;
}

.qty-input {
  width: 60px;
  height: 40px;
  text-align: center;
  border: none;
  border-left: 1px solid #D4D4D4;
  border-right: 1px solid #D4D4D4;
  font-weight: 600;
  font-size: 0.9375rem;
}

.qty-input:focus {
  outline: none;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.qty-input[type=number] {
  -moz-appearance: textfield;
}

.delivery-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #D1FAE5;
  border-radius: 8px;
}

.delivery-info svg {
  color: #10B981;
  flex-shrink: 0;
}

.delivery-info div {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  font-size: 0.875rem;
}

.delivery-info strong {
  color: #047857;
  font-weight: 600;
}

.delivery-info span {
  color: #059669;
  font-size: 0.75rem;
}

.price-summary {
  padding-top: 1.5rem;
  border-top: 1px solid #E5E5E5;
}

.price-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #737373;
  margin-bottom: 0.5rem;
}

.price-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #E5E5E5;
}

.price-total span {
  font-weight: 600;
  color: #1A1A1A;
  font-size: 0.9375rem;
}

.price-total strong {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A1A1A;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
}

.btn {
  flex: 1;
  height: 52px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #F3F4F6;
  color: #374151;
}

.btn-secondary:hover {
  background: #E5E7EB;
}

.btn-primary {
  background: #1A1A1A;
  color: white;
}

.btn-primary:hover {
  background: #404040;
  transform: translateY(-1px);
}

.chat-btn {
  width: 100%;
  height: 52px;
  background: white;
  border: 2px solid #1A1A1A;
  color: #1A1A1A;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.chat-btn:hover {
  background: #F9FAFB;
}
</style>