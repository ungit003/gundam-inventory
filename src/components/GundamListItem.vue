<!-- src/components/GundamListItem.vue -->

<script setup>
// [역할 1: 스토어 연결]
// 이 컴포넌트는 UI 상태(모달 열기)와 재고 데이터(삭제, 이동)를 모두 다루므로,
// 관련된 두 개의 전문 스토어를 모두 가져옵니다.
import { useInventoryStore } from '../stores/inventoryStore';
import { useUiStore } from '../stores/uiStore';

// 각 스토어의 인스턴스(리모컨)를 생성합니다.
const inventoryStore = useInventoryStore();
const uiStore = useUiStore();

// [역할 2: Props 정의]
// 부모(GundamList.vue)로부터 **아이템 하나**의 정보와 **목록의 종류**를 전달받습니다.
const props = defineProps({
  // item: 표시할 건담 아이템 객체 하나
  item: {
    type: Object,
    required: true,
  },
  // listType: 이 아이템이 속한 목록의 종류 ('storage', 'sale', 'sold')
  listType: {
    type: String,
    required: true,
  }
});
</script>

<template>
  <!-- 
    [역할 3: 아이템 행 렌더링]
    이 컴포넌트는 이제 단 하나의 행(<tr>)만을 책임집니다.
    행 전체를 클릭하면 uiStore의 openDetailModal 액션을 호출하여 상세 모달을 엽니다.
  -->
  <tr @click="uiStore.openDetailModal(props.item.id)" class="clickable-row">
    
    <!-- 모든 목록에 공통으로 표시될 데이터 셀들 -->
    <td>{{ props.item.grade }}</td>
    <td>{{ props.item.name }}</td>
    <td>{{ props.item.quantity }}</td>
    <td>{{ props.item.purchasePrice ? `${props.item.purchasePrice.toLocaleString()} 원` : '미입력' }}</td>

    <!-- [역할 4: 조건부 렌더링] -->
    <!-- listType에 따라 다른 데이터 셀과 버튼 그룹을 동적으로 보여줍니다. -->
    
    <!-- '판매 목록'일 때의 추가 데이터 -->
    <td v-if="props.listType === 'sale'">
      {{ props.item.desiredSalePrice ? `${props.item.desiredSalePrice.toLocaleString()} 원` : '미입력' }}
    </td>
    <!-- '보관' 또는 '판매' 목록일 때의 추가 데이터 -->
    <td v-if="props.listType === 'storage' || props.listType === 'sale'">
      {{ props.item.purchaseLocation || '미입력' }}
    </td>

    <!-- '관리' 또는 '판매 정보'를 표시할 마지막 셀 -->
    <td>
      <!-- (상황 1) '보관 목록'일 때의 관리 버튼 -->
      <div v-if="props.listType === 'storage'" class="button-group">
        <!-- '.stop' 수식어는 버튼 클릭이 부모(tr)로 전파되어 상세 모달이 함께 뜨는 것을 막습니다. -->
        <button @click.stop="inventoryStore.moveToSale(props.item.id)" class="action-button move">판매 목록으로</button>
        <button @click.stop="inventoryStore.deleteGundam(props.item.id)" class="action-button delete">삭제</button>
      </div>
      
      <!-- (상황 2) '판매 목록'일 때의 관리 버튼 -->
      <div v-else-if="props.listType === 'sale'" class="button-group">
        <button @click.stop="inventoryStore.moveToStorage(props.item.id)" class="action-button move">보관 목록으로</button>
        <!-- 판매 완료 버튼은 UI 모달을 여는 것이므로 uiStore의 액션을 호출합니다. -->
        <button @click.stop="uiStore.openSaleModal(props.item.id)" class="action-button complete">판매 완료</button>
      </div>

      <!-- (상황 3) '판매 완료' 목록일 때의 정보 및 삭제 버튼 -->
      <div v-else-if="props.listType === 'sold'" class="sale-info-group">
        <div class="sale-info">
          <span>{{ props.item.salePrice ? `${props.item.salePrice.toLocaleString()} 원` : '미입력' }}</span>
          <span class="sale-medium">({{ props.item.saleMedium || '미지정' }})</span>
        </div>
        <!-- '판매 취소' 버튼 -->
        <div class="button-group-sold">
          <button @click.stop="inventoryStore.revertSale(props.item.id)" class="action-button revert">되돌리기</button>
          <button @click.stop="inventoryStore.deleteGundam(props.item.id)" class="action-button delete mini">삭제</button>
        </div>
      </div>
    </td>
  </tr>
</template>

<style scoped>
/* 이 스타일은 기존 GundamList.vue에 있던 행(tr)과 버튼 관련 스타일을 그대로 가져온 것입니다. */
.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}
.clickable-row:hover {
  background-color: #f5f5f5;
}
.button-group, .sale-info-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
.button-group {
  flex-wrap: wrap;
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

.sale-info-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
/* 판매 완료 목록의 버튼들을 위한 작은 그룹 */
.button-group-sold {
  display: flex;
  gap: 0.5rem;
}
/* 되돌리기 버튼 스타일 추가 */
.action-button.revert {
  background-color: #f39c12; /* 주황색 계열 */
}
</style>
