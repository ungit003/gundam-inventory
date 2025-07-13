<!-- src/components/GundamList.vue -->

<script setup>
// [역할 1: 스토어 연결]
// 이 컴포넌트에서 중앙 데이터 저장소(Pinia Store)의 기능을 사용하기 위해
// 'useInventoryStore' 함수를 가져옵니다.
import { useInventoryStore } from '../stores/inventory';

// [역할 2: 스토어 인스턴스 생성]
// useInventoryStore() 함수를 실행해서, 데이터와 기능을 관리하는 '리모컨' 역할을 할
// store 객체를 만듭니다. 이제 'store.함수이름()' 형태로 스토어의 모든 기능을 호출할 수 있습니다.
const store = useInventoryStore();

// [역할 3: Props 정의]
// 이 컴포넌트가 부모(App.vue)로부터 어떤 데이터를 받을지 명시적으로 선언합니다.
// 이 props 덕분에 하나의 컴포넌트가 여러 다른 모습으로 재사용될 수 있습니다.
defineProps({
  // title: 표의 제목 (예: "판매 목록")
  title: {
    type: String,
    required: true,
  },
  // items: 표에 표시할 실제 데이터가 담긴 배열 (예: forSaleList)
  items: {
    type: Array,
    required: true,
  },
  // listType: 목록의 종류('storage', 'sale', 'sold')를 구분하여,
  //           UI를 동적으로 다르게 표시하는 데 사용되는 핵심 값입니다.
  listType: {
    type: String,
    required: true,
    validator: (value) => ['storage', 'sale', 'sold'].includes(value),
  }
});
</script>

<template>
  <div class="list-section">
    <!-- 부모로부터 받은 title과 items 배열의 길이를 동적으로 표시합니다. -->
    <h2>{{ title }} (총 {{ items.length }}개)</h2>
    <table>
      <!-- ====================================================== -->
      <!-- 표의 헤더(제목 줄) 부분 -->
      <!-- ====================================================== -->
      <thead>
        <tr>
          <!-- 모든 목록에 공통으로 표시될 헤더들 -->
          <th>등급</th>
          <th>이름</th>
          <th>수량</th>
          <th>구매 가격</th>
          
          <!-- [조건부 렌더링 1] '판매 목록'일 때만 '판매 희망가' 헤더를 보여줍니다. -->
          <th v-if="listType === 'sale'">판매 희망가</th>
          <!-- [조건부 렌더링 2] '보관' 또는 '판매' 목록일 때 '구매처' 헤더를 보여줍니다. -->
          <th v-if="listType === 'storage' || listType === 'sale'">구매처</th>
          
          <!-- [조건부 렌더링 3] '판매 완료' 목록일 때만 '판매 정보' 헤더를 보여줍니다. -->
          <th v-if="listType === 'sold'">판매 정보</th>
          
          <!-- [조건부 렌더링 4] '판매 완료' 목록이 **아닐 때만** '관리' 헤더를 보여줍니다. -->
          <th v-else>관리</th>
        </tr>
      </thead>

      <!-- ====================================================== -->
      <!-- 표의 본문(데이터 내용) 부분 -->
      <!-- ====================================================== -->
      <tbody>
        <!-- [안내 메시지] 목록이 비어있을 때(items 배열의 길이가 0일 때) 사용자에게 안내 메시지를 표시합니다. -->
        <tr v-if="items.length === 0">
          <!-- :colspan을 동적으로 계산하여 이 칸이 표의 전체 너비를 차지하게 만듭니다. -->
          <td :colspan="listType === 'sold' ? 5 : (listType === 'sale' ? 7 : 6)" class="empty-list">
            해당 목록이 비어있습니다.
          </td>
        </tr>

        <!-- [데이터 렌더링] v-for를 사용해 부모로부터 받은 items 배열의 각 항목을 행(tr)으로 렌더링합니다. -->
        <!-- 각 행(tr)에 클릭 이벤트를 연결하여, 행 전체 어디를 눌러도 상세 정보 모달이 열리도록 합니다. -->
        <tr v-for="item in items" :key="item.id" @click="store.openDetailModal(item.id)" class="clickable-row">
          
          <!-- 모든 목록에 공통으로 표시될 데이터 셀(td)들 -->
          <td>{{ item.grade }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.purchasePrice ? `${item.purchasePrice.toLocaleString()} 원` : '미입력' }}</td>

          <!-- [조건부 렌더링 5] '판매 목록'일 때만 '판매 희망가' 데이터 셀을 보여줍니다. -->
          <td v-if="listType === 'sale'">
            {{ item.desiredSalePrice ? `${item.desiredSalePrice.toLocaleString()} 원` : '미입력' }}
          </td>
          <!-- [조건부 렌더링 6] '보관' 또는 '판매' 목록일 때 '구매처' 데이터 셀을 보여줍니다. -->
          <td v-if="listType === 'storage' || listType === 'sale'">
            {{ item.purchaseLocation || '미입력' }}
          </td>

          <!-- [조건부 렌더링 7 & 8] '판매 정보'와 '관리' 셀을 동적으로 렌더링합니다. -->
          <!-- 이 부분이 5단계의 핵심 수정 사항입니다. -->
          <td>
            <!-- 이 셀의 내용물은 목록의 종류(listType)에 따라 완전히 달라집니다. -->
            
            <!-- (상황 1) '보관 목록'일 때의 관리 버튼 그룹 -->
            <div v-if="listType === 'storage'" class="button-group">
              <!-- '.stop' 수식어: 이 버튼의 클릭 이벤트가 부모(tr)로 전파되는 것을 막아, 상세 모달이 함께 뜨는 것을 방지합니다. -->
              <button @click.stop="store.moveToSale(item.id)" class="action-button move">판매 목록으로</button>
              <button @click.stop="store.deleteGundam(item.id)" class="action-button delete">삭제</button>
            </div>
            
            <!-- (상황 2) '판매 목록'일 때의 관리 버튼 그룹 -->
            <div v-else-if="listType === 'sale'" class="button-group">
              <button @click.stop="store.moveToStorage(item.id)" class="action-button move">보관 목록으로</button>
              <button @click.stop="store.openSaleModal(item.id)" class="action-button complete">판매 완료</button>
            </div>

            <!-- (상황 3) '판매 완료' 목록일 때의 판매 정보 및 삭제 버튼 -->
            <div v-else-if="listType === 'sold'" class="sale-info-group">
              <div class="sale-info">
                <span>{{ item.salePrice ? `${item.salePrice.toLocaleString()} 원` : '미입력' }}</span>
                <span class="sale-medium">({{ item.saleMedium || '미지정' }})</span>
              </div>
              <button @click.stop="store.deleteGundam(item.id)" class="action-button delete mini">삭제</button>
            </div>

          </td>
        </tr>
      </tbody>

      <!-- ====================================================== -->
      <!-- 표의 푸터(요약 정보) 부분 -->
      <!-- ====================================================== -->
      <!-- '판매 목록'일 때만 표의 푸터(tfoot)를 보여줍니다. -->
      <tfoot v-if="listType === 'sale'">
        <tr>
          <!-- colspan="6"으로 여러 셀을 하나로 합치고, 마지막 셀에 총액을 표시합니다. -->
          <td colspan="6" class="summary-label">예상 판매 완료 총액</td>
          <td class="summary-value">
            {{ store.estimatedTotalSaleValue.toLocaleString() }} 원
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<style scoped>
/* 이 컴포넌트 내부에서만 적용될 스타일 정의 */
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
th {
  background-color: #f9f9f9;
}
.empty-list {
  text-align: center;
  color: #888;
  padding: 2rem;
}

/* 행(Row) 클릭 관련 스타일 */
.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}
.clickable-row:hover {
  background-color: #f5f5f5;
}

/* 관리 버튼 그룹 관련 스타일 */
.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.action-button {
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  color: white;
  transition: opacity 0.2s;
}
.action-button:hover {
  opacity: 0.8;
}
.action-button.move { background-color: #3498db; }
.action-button.delete { background-color: #e74c3c; }
.action-button.complete { background-color: #2ecc71; }
.action-button.mini { padding: 0.2rem 0.5rem; font-size: 0.75rem; }

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
