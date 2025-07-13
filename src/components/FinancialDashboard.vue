<!-- src/components/FinancialDashboard.vue -->

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useInventoryStore } from '../stores/inventory';

const store = useInventoryStore();

// 1. [수정] 스토어에서 새로운 금융 관련 getter들을 모두 가져옵니다.
const { currentStockValue, totalProfit, totalAssets, hobbyFund } = storeToRefs(store);

// 2. [신규] 자금 수동 조정을 위한 로컬 상태를 정의합니다.
const adjustment = ref({
  amount: null,
  reason: '',
});

// 3. [신규] 자금 조정 폼을 제출할 때 실행될 함수입니다.
const handleAdjustment = () => {
  store.adjustHobbyFund(adjustment.value);
  // 제출 후 폼 초기화
  adjustment.value = { amount: null, reason: '' };
};
</script>

<template>
  <div class="dashboard-container">
    <!-- 자산 요약 섹션 -->
    <div class="summary-grid">
      <div class="summary-item">
        <span class="label">현재 재고 가치</span>
        <span class="value primary">{{ currentStockValue.toLocaleString() }} 원</span>
      </div>
      <div class="summary-item">
        <span class="label">현재 취미 자금</span>
        <span class="value secondary">{{ hobbyFund.balance.toLocaleString() }} 원</span>
      </div>
      <div class="summary-item">
        <span class="label">총자산</span>
        <span class="value total">{{ totalAssets.toLocaleString() }} 원</span>
      </div>
      <div class="summary-item">
        <span class="label">누적 판매 수익</span>
        <span class="value profit">{{ totalProfit.toLocaleString() }} 원</span>
      </div>
    </div>

    <!-- 자금 조정 섹션 -->
    <div class="adjustment-section">
      <h4>취미 자금 조정</h4>
      <form @submit.prevent="handleAdjustment" class="adjustment-form">
        <input type="number" placeholder="금액 (양수: 입금, 음수: 출금)" v-model.number="adjustment.amount" required>
        <input type="text" placeholder="사유 (예: 도료 구매, 용돈 추가)" v-model="adjustment.reason" required>
        <button type="submit">조정</button>
      </form>
    </div>
    
    <!-- TODO: 자금 내역(history)을 보여주는 기능은 추후 추가할 수 있습니다. -->
  </div>
</template>

<style scoped>
/* 대시보드 스타일링 */
.dashboard-container {
  padding: 1rem;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.summary-item {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}
.label {
  display: block;
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}
.value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
}
.value.primary { color: #0d6efd; }
.value.secondary { color: #6f42c1; }
.value.total { color: #198754; }
.value.profit { color: #dc3545; }

.adjustment-section h4 {
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}
.adjustment-form {
  display: flex;
  gap: 1rem;
}
.adjustment-form input {
  flex-grow: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.adjustment-form button {
  padding: 0.5rem 1.5rem;
  border: none;
  background-color: #0d6efd;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
</style>
