<!-- src/components/HobbyFund.vue -->

<script setup>
import { storeToRefs } from 'pinia';
import { useInventoryStore } from '../stores/inventory';

// 1. Pinia 스토어를 사용 준비합니다.
const store = useInventoryStore();

// 2. 스토어에서 totalPurchasePrice getter를 반응성을 유지한 채로 가져옵니다.
const { totalPurchasePrice } = storeToRefs(store);
</script>

<template>
  <div class="hobby-fund-container">
    <div class="fund-item">
      <span class="label">총 취미 투자금</span>
      <!-- 3. 가져온 getter 값을 화면에 표시합니다. -->
      <!--    toLocaleString()을 사용해 숫자에 3자리 콤마를 찍어 가독성을 높입니다. -->
      <span class="value">{{ totalPurchasePrice.toLocaleString() }} 원</span>
    </div>
    <!-- TODO: 7단계 이후에 '예상 판매 수익' 같은 항목을 여기에 추가할 수 있습니다. -->
  </div>
</template>

<style scoped>
.hobby-fund-container {
  display: flex;
  justify-content: flex-end; /* 오른쪽 정렬 */
  padding: 1rem;
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.fund-item {
  display: flex;
  flex-direction: column; /* 세로 정렬 */
  align-items: flex-end; /* 오른쪽 정렬 */
}
.label {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.25rem;
}
.value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #41B883; /* Vue 색상 */
}
</style>
