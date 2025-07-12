<!-- src/components/GundamList.vue -->

<script setup>
// 1. defineProps: 이 컴포넌트가 부모로부터 어떤 데이터를 받을지 명시적으로 선언합니다[3][4].
//    - title: 표의 제목 (예: "판매 목록")
//    - items: 표에 표시할 실제 데이터가 담긴 배열
//    - listType: 목록의 종류('storage', 'sale', 'sold')를 구분하여, UI를 다르게 표시하는 데 사용됩니다.
defineProps({
  title: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  listType: {
    type: String,
    required: true,
    // listType prop은 이 세 가지 문자열 중 하나여야 한다고 검증(validate)할 수 있습니다.
    validator: (value) => ['storage', 'sale', 'sold'].includes(value),
  }
});

// 1. Pinia 스토어를 사용하기 위해 import하고, store 인스턴스를 생성합니다.
import { useInventoryStore } from '../stores/inventory';
const store = useInventoryStore();
</script>

<template>
  <div class="list-section">
    <!-- 부모로부터 받은 title과 items 배열의 길이를 동적으로 표시합니다. -->
    <h2>{{ title }} (총 {{ items.length }}개)</h2>
    <table>
      <thead>
        <tr>
          <!-- 2. 조건부 렌더링(v-if)을 사용하여 헤더를 동적으로 구성합니다. -->
          <th>등급</th>
          <th>이름</th>
          <th>수량</th>
          <th>구매 가격</th>
          <!-- '판매 완료' 목록일 때만 '판매 가격'과 '판매 매체' 헤더를 보여줍니다. -->
          <th v-if="listType === 'sold'">판매 가격</th>
          <th v-if="listType === 'sold'">판매 매체</th>
          <!-- '판매 완료' 목록이 아닐 때만 '관리' 헤더를 보여줍니다. -->
          <th v-if="listType !== 'sold'">관리</th>
        </tr>
      </thead>
      <tbody>
        <!-- 3. 목록이 비어있을 때 사용자에게 안내 메시지를 표시합니다. -->
        <tr v-if="items.length === 0">
          <!-- :colspan을 동적으로 계산하여 표의 전체 너비를 차지하게 합니다. -->
          <td :colspan="listType === 'sold' ? 6 : 5" class="empty-list">
            해당 목록이 비어있습니다.
          </td>
        </tr>
        <!-- 4. v-for를 사용해 부모로부터 받은 items 배열의 각 항목을 행(tr)으로 렌더링합니다. -->
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.grade }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.quantity }}</td>
          <!-- toLocaleString()을 사용해 숫자에 3자리 콤마를 추가하고, 데이터가 없을 경우를 처리합니다. -->
          <td>{{ item.purchasePrice ? `${item.purchasePrice.toLocaleString()} 원` : '미입력' }}</td>
          
          <!-- 5. 데이터 셀(td)도 헤더와 마찬가지로 listType에 따라 조건부로 렌더링합니다. -->
          <td v-if="listType === 'sold'">{{ item.salePrice ? `${item.salePrice.toLocaleString()} 원` : '미입력' }}</td>
          <td v-if="listType === 'sold'">{{ item.saleMedium || '미입력' }}</td>
          
          <!-- '판매 완료' 목록이 아닐 때만 이 '관리' 열(td)을 보여줍니다. -->
          <td v-if="listType !== 'sold'">
            
            <!-- [설명 4] 조건부로 다른 버튼 그룹 보여주기 (v-if) -->
            <!-- 이 목록의 종류(listType)가 'storage'일 때만 이 div와 안의 버튼들이 화면에 나타납니다. -->
            <div v-if="listType === 'storage'" class="button-group">
              
              <!-- [설명 5] 버튼과 스토어 액션 연결 (@click) -->
              <!-- 
                @click: 사용자가 이 버튼을 '클릭하면'
                store.moveToSale(item.id): store(리모컨)의 moveToSale(판매 목록으로 이동) 버튼을 누른다.
                                           이때, 어떤 아이템인지 알려주기 위해 현재 행의 고유 ID(item.id)를 함께 보낸다.
              -->
              <button @click="store.moveToSale(item.id)" class="action-button move">판매 목록으로</button>
              <button @click="store.deleteGundam(item.id)" class="action-button delete">삭제</button>
            </div>
            
            <!-- 이 목록의 종류(listType)가 'sale'일 때만 이 div와 안의 버튼들이 화면에 나타납니다. -->
            <div v-else-if="listType === 'sale'" class="button-group">
              <button @click="store.moveToStorage(item.id)" class="action-button move">보관 목록으로</button>
              <button @click="store.markAsSold(item.id)" class="action-button complete">판매 완료</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.list-section {
  margin-bottom: 2.5rem; /* 목록 간 간격 조정 */
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.9rem; /* 폰트 크기 조정 */
}
th, td {
  border: 1px solid #e0e0e0; /* 테두리 색상 연하게 */
  padding: 0.75rem;
  text-align: left;
  vertical-align: middle; /* 세로 중앙 정렬 */
}
th {
  background-color: #f9f9f9; /* 헤더 배경색 변경 */
}
.empty-list {
  text-align: center;
  color: #888;
  padding: 2rem;
}

/* 버튼들을 담는 div 스타일 */
.button-group {
  display: flex;
  flex-wrap: wrap; /* 버튼이 많아지면 줄바꿈 되도록 */
  gap: 0.5rem;
}

/* 개별 버튼 공통 스타일 */
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

/* 기능별 버튼 색상 */
.action-button.move { background-color: #3498db; }      /* 이동: 파란색 */
.action-button.delete { background-color: #e74c3c; }    /* 삭제: 빨간색 */
.action-button.complete { background-color: #2ecc71; }  /* 완료: 초록색 */
</style>
