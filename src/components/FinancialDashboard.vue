<!-- src/components/FinancialDashboard.vue -->

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
// [수정] 이제 financialStore만 가져옵니다.
import { useFinancialStore } from '../stores/financialStore';

const financialStore = useFinancialStore();

// financialStore에서 필요한 getter와 state를 가져옵니다.
const { currentStockValue, totalProfit, totalAssets, hobbyFund } = storeToRefs(financialStore);

// 2. [신규] 자금 수동 조정을 위한 로컬 상태를 정의합니다.
const adjustment = ref({
  amount: null,
  reason: '',
});

// 3. [신규] 자금 조정 폼을 제출할 때 실행될 함수입니다.
const handleAdjustment = () => {
  financialStore.adjustHobbyFund(adjustment.value);
  // 제출 후 폼 초기화
  adjustment.value = { amount: null, reason: '' };
};

// 날짜 형식을 'YYYY.MM.DD' 형태로 변환해주는 헬퍼 함수입니다.
const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('ko-KR');
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
    
    <!-- 자금 내역 섹션 -->
     <div class="history-section">
      <h4>취미 자금 내역</h4>
      <!-- 내역이 없을 경우 안내 메시지를 표시합니다. -->
      <div v-if="!hobbyFund.history || hobbyFund.history.length === 0" class="no-history">
        거래 내역이 없습니다.
      </div>
      <!-- 내역이 있을 경우 테이블을 렌더링합니다. -->
      <table v-else class="history-table">
        <thead>
          <tr>
            <th>날짜</th>
            <th>사유</th>
            <th>구분</th>
            <th>금액</th>
          </tr>
        </thead>
        <tbody>
          <!-- v-for를 사용해 history 배열의 각 항목을 행으로 렌더링합니다. -->
          <tr v-for="(entry, index) in hobbyFund.history" :key="index">
            <td>{{ formatDate(entry.date) }}</td>
            <td>{{ entry.reason }}</td>
            <td>
              <!-- 금액이 0보다 크면 '입금', 작으면 '출금'으로 표시합니다. -->
              <span :class="entry.amount >= 0 ? 'deposit' : 'withdrawal'">
                {{ entry.amount >= 0 ? '입금' : '출금' }}
              </span>
            </td>
            <td>{{ Math.abs(entry.amount).toLocaleString() }} 원</td>
          </tr>
        </tbody>
      </table>
    </div>
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

.history-section {
  margin-top: 2.5rem;
}
.history-section h4 {
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}
.no-history {
  text-align: center;
  color: #888;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}
.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.history-table th, .history-table td {
  border: 1px solid #e0e0e0;
  padding: 0.75rem;
  text-align: left;
  vertical-align: middle;
}
.history-table th {
  background-color: #f9f9f9;
}
/* 금액의 성격(입금/출금)에 따라 다른 색상을 적용합니다. */
.deposit {
  color: #2ecc71; /* 초록색 */
  font-weight: bold;
}
.withdrawal {
  color: #e74c3c; /* 빨간색 */
  font-weight: bold;
}
</style>
