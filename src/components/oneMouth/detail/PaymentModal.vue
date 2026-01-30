<!-- PaymentModal.vue -->
<template>
  <div class="overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>결제하기</h2>
        <button @click="$emit('close')" class="close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="summary">
          <h3>주문 정보</h3>
          <div class="row">
            <span>상품금액</span>
            <span>{{ productPrice.toLocaleString() }}원</span>
          </div>
          <div class="row">
            <span>배송비</span>
            <span>3,000원</span>
          </div>
          <div class="total">
            <span>총 결제금액</span>
            <strong>{{ totalPrice.toLocaleString() }}원</strong>
          </div>
        </div>

        <div class="form-section">
          <h3>배송 정보</h3>
          <input
              v-model="shippingInfo.address"
              type="text"
              placeholder="배송지를 입력하세요"
              class="input"
          />
          <input
              v-model="shippingInfo.phone"
              type="tel"
              placeholder="연락처를 입력하세요"
              class="input"
          />
        </div>

        <div class="form-section">
          <h3>결제 수단</h3>
          <div class="payment-methods">
            <button
                v-for="method in paymentMethods"
                :key="method"
                @click="selectedPayment = method"
                :class="['method', { active: selectedPayment === method }]"
            >
              {{ method }}
            </button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">취소</button>
        <button @click="processPayment" class="btn-confirm">
          {{ totalPrice.toLocaleString() }}원 결제
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const props = defineProps({
  totalPrice: { type: Number, required: true },
  productPrice: { type: Number, required: true }
})

const emit = defineEmits(['close', 'confirm'])

const shippingInfo = ref({
  address: '',
  phone: ''
})

const { open } = useConfirmDialog()

const selectedPayment = ref('카드')
const paymentMethods = ['카드', '계좌이체', '카카오페이', '네이버페이']

const processPayment = async () => {
  if (!shippingInfo.value.address) {
    await open({ type: 'alert', title: '알림', message: '배송지를 입력해주세요' })
    return
  }

  emit('confirm', {
    shipping: shippingInfo.value,
    payment: selectedPayment.value,
    amount: props.totalPrice
  })
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #E5E5E5;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1A1A1A;
}

.close {
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
}

.close:hover {
  background: #F3F4F6;
}

.close svg {
  color: #6B7280;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.summary {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.summary h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6B7280;
  margin-bottom: 1rem;
}

.row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 0.5rem;
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #E5E5E5;
}

.total span {
  font-weight: 600;
  color: #1A1A1A;
  font-size: 0.9375rem;
}

.total strong {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A1A1A;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 0.75rem;
}

.input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.9375rem;
  margin-bottom: 0.75rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #1A1A1A;
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.method {
  padding: 0.875rem;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.method:hover {
  border-color: #9CA3AF;
}

.method.active {
  background: #1A1A1A;
  color: white;
  border-color: #1A1A1A;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 2rem;
  border-top: 1px solid #E5E5E5;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #F3F4F6;
  color: #6B7280;
}

.btn-cancel:hover {
  background: #E5E7EB;
}

.btn-confirm {
  background: #1A1A1A;
  color: white;
}

.btn-confirm:hover {
  background: #404040;
}
</style>