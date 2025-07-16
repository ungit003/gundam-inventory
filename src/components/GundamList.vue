<!-- src/components/GundamList.vue -->

<script setup>
// [역할 1: 스토어 및 컴포넌트 연결]
// 이 컴포넌트는 이제 '예상 판매 완료 총액'을 표시하기 위해 financialStore만 알면 됩니다.
import { useFinancialStore } from '../stores/financialStore';
// 방금 만든 전문 직원 컴포넌트, GundamListItem을 가져옵니다.
import GundamListItem from './GundamListItem.vue';

const financialStore = useFinancialStore();

// 부모(App.vue)로부터 받을 props 정의는 이전과 동일합니다.
defineProps({
  title: { type: String, required: true },
  items: { type: Array, required: true },
  listType: { type: String, required: true },
});
</script>

<template>
  <div class="list-section">
    <h2>{{ title }} (총 {{ items.length }}개)</h2>
    <table>
      <!-- [역할 2: 테이블 구조 정의] -->
      <!-- 테이블의 전체적인 구조(헤더, 푸터)를 정의하는 것은 여전히 매니저의 역할입니다. -->
      <thead>
        <tr>
          <!-- 헤더의 내용은 이전과 동일합니다. -->
          <th>등급</th><th>이름</th><th>수량</th><th>구매 가격</th>
          <th v-if="listType === 'sale'">판매 희망가</th>
          <th v-if="listType === 'storage' || listType === 'sale'">구매처</th>
          <th v-if="listType === 'sold'">판매 정보</th>
          <th v-else>관리</th>
        </tr>
      </thead>

      <!-- ====================================================== -->
      <!-- [핵심 변경점] 복잡한 로직이 사라지고 위임만 남음 -->
      <!-- ====================================================== -->
      <tbody>
        <!-- [안내 메시지]는 그대로 유지합니다. -->
        <tr v-if="items.length === 0">
          <td :colspan="listType === 'sold' ? 5 : (listType === 'sale' ? 7 : 6)" class="empty-list">
            해당 목록이 비어있습니다.
          </td>
        </tr>
        
        <!-- 
          [역할 3: 작업 위임]
          v-for를 통해 items 배열을 순회하며, 각 아이템을 렌더링하는 '실무'를
          GundamListItem 컴포넌트에게 완전히 위임합니다.
          - :item="item": "이 데이터(item)를 가지고 일해라"
          - :listType="listType": "너의 역할(listType)은 이것이다"
        -->
        <GundamListItem
          v-for="item in items"
          :key="item.id"
          :item="item"
          :listType="listType"
        />
      </tbody>

      <!-- 푸터(tfoot)는 목록 전체에 대한 요약이므로, 이 컴포넌트에 남겨둡니다. -->
      <tfoot v-if="listType === 'sale'">
        <tr>
          <td colspan="6" class="summary-label">예상 판매 완료 총액</td>
          <td class="summary-value">
            {{ financialStore.estimatedTotalSaleValue.toLocaleString() }} 원
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<style scoped>
/* 
  이제 이 파일의 스타일은 테이블의 전체적인 구조와 관련된 것만 남습니다.
  행(tr)이나 버튼에 대한 세부적인 스타일은 GundamListItem.vue로 이동했습니다.
*/
.list-section {
  margin-bottom: 2.5rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.9rem;
}
th, td {
  border: 1px solid #e0e0e0;
  padding: 0.75rem;
  text-align: left;
  vertical-align: middle;
}
.empty-list {
  text-align: center;
  color: #888;
  padding: 2rem;
}

/* 판매 정보 표시 관련 스타일 */
.sale-info-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sale-info {
  display: flex;
  flex-direction: column;
}
.sale-medium {
  font-size: 0.8rem;
  color: #777;
}

/* 푸터 요약 정보 관련 스타일 */
tfoot {
  font-weight: bold;
  background-color: #f8f9fa;
}
.summary-label {
  text-align: right;
  padding-right: 1rem;
}
.summary-value {
  color: #2ecc71;
  font-size: 1.1rem;
}
</style>
