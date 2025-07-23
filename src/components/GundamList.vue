<!-- src/components/GundamList.vue -->

<script setup>
// [역할 1: 스토어 및 컴포넌트 연결]
// 이 컴포넌트는 이제 '예상 판매 완료 총액'을 표시하기 위해 financialStore만 알면 됩니다.
import { useFinancialStore } from '../stores/financialStore';
import { useUiStore } from '../stores/uiStore'; // [추가] uiStore를 가져옵니다.
// 방금 만든 전문 직원 컴포넌트, GundamListItem을 가져옵니다.
import GundamListItem from './GundamListItem.vue';

const financialStore = useFinancialStore();
const uiStore = useUiStore(); // [추가] uiStore 인스턴스를 생성합니다.

// 부모(App.vue)로부터 받을 props 정의는 이전과 동일합니다.
const props = defineProps({
  title: { type: String, required: true },
  items: { type: Array, required: true },
  listType: { type: String, required: true },
});

/**
 * '판매 목록' 전체를 클립보드에 복사하는 함수입니다.
 */
const copySalesListToClipboard = async () => {
  // 1. 목록이 비어있으면 사용자에게 알리고 함수를 종료합니다.
  if (props.items.length === 0) {
    uiStore.showAlert({ title: '알림', message: '복사할 판매 목록이 없습니다.' });
    return;
  }

  // 2. map을 사용해 각 아이템을 정해진 형식의 문자열로 변환합니다.
  const allItemsText = props.items.map(item => {
    const salePrice = item.desiredSalePrice 
      ? `${item.desiredSalePrice.toLocaleString()}원` 
      : '가격 미정';
    // 각 아이템 정보를 하나의 문자열 덩어리로 만듭니다.
    return `[제품명] ${item.name} / [등급] ${item.grade} / [판매 희망가] ${salePrice}`;
  }).join('\n'); // 3. join('\n')을 사용해 각 아이템 문자열을 줄바꿈으로 연결합니다.

  // 4. 최종적으로 만들어진 전체 텍스트 블록을 정의합니다.
  const textToCopy = `
== 건담 판매 목록 ==
${allItemsText}

[상세 설명]
(여기에 공통 상세 설명을 입력하세요)
  `.trim();

  try {
    // 5. Clipboard API를 사용하여 전체 텍스트를 클립보드에 복사합니다.
    await navigator.clipboard.writeText(textToCopy);
    uiStore.showAlert({ title: '복사 완료', message: '판매 목록 전체가 클립보드에 복사되었습니다.' });
  } catch (err) {
    console.error('클립보드 복사 실패:', err);
    uiStore.showAlert({ title: '복사 실패', message: '클립보드 복사에 실패했습니다.' });;
  }
};
</script>

<template>
  <div class="list-section">
    <div class="list-header">
      <h2>{{ title }} (총 {{ items.length }}개)</h2>
      <!-- '판매 목록'일 때만 '전체 복사' 버튼을 보여줍니다. -->
      <button 
        v-if="listType === 'sale'" 
        @click.stop="copySalesListToClipboard" 
        class="copy-all-button"
      >
        목록 전체 복사
      </button>
    </div>
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

      <tfoot v-if="listType === 'storage'">
        <tr>
          <!-- '보관 목록'일 때의 colspan은 5입니다. -->
          <td colspan="5" class="summary-label">보관 목록 총 구매가</td>
          <td class="summary-value">
            {{ financialStore.inStorageTotalPurchaseValue.toLocaleString() }} 원
          </td>
        </tr>
      </tfoot>

      <tfoot v-if="listType === 'sold'">
        <tr>
          <!-- '판매 완료' 목록일 때의 colspan은 4입니다. -->
          <td colspan="4" class="summary-label">총 판매액</td>
          <td class="summary-value">
            {{ financialStore.soldTotalSaleValue.toLocaleString() }} 원
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
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.copy-all-button {
  border: none;
  padding: 0.5rem 1rem;
  background-color: #8e44ad; /* 보라색 계열 */
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
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
