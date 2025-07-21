<!-- src/components/SaleConfirmModal.vue -->

<script setup>
import { ref, watch } from 'vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useUiStore } from '@/stores/uiStore';
import { SALE_MEDIUM_OPTIONS } from '../config';

const inventoryStore = useInventoryStore();
const uiStore = useUiStore(); 

// 1. 부모로부터 어떤 아이템을 처리할지 props로 전달받습니다.
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

// 2. 모달 내의 폼 입력을 위한 로컬 상태(ref)를 정의합니다.
const saleData = ref({
  salePrice: null,
  saleMedium: SALE_MEDIUM_OPTIONS[0] || '기타',
});

// 3. '판매 매체' 선택 옵션을 정의합니다.
const mediumOptions = ['당근마켓', '중고나라', '기타'];

// 4. 모달이 열릴 때마다(props.item이 바뀔 때마다) 폼을 초기화하기 위한 로직입니다.
watch(() => props.item, (newItem) => {
  if (newItem) {
    saleData.value = {
      // 1. '판매 희망가'(desiredSalePrice)가 있으면 그것을 기본값으로 사용합니다.
      // 2. '||' 연산자를 사용해, 만약 판매 희망가가 없거나 0이면(falsy),
      //    차선책으로 '구매 가격'(purchasePrice)을 사용합니다.
      salePrice: newItem.desiredSalePrice || newItem.purchasePrice,
      
      // 판매 매체의 기본값은 그대로 유지합니다.
      saleMedium: SALE_MEDIUM_OPTIONS[0] || '기타',
    };
  }
}, { 
  immediate: true, // 컴포넌트가 처음 마운트될 때도 즉시 실행
  deep: true,      // props.item 객체 내부의 변화도 감지
}); // 컴포넌트가 처음 마운트될 때도 실행

// 5. '확인' 버튼을 눌렀을 때 실행될 함수입니다.
const confirmSale = () => {
  if (!saleData.value.salePrice || saleData.value.salePrice <= 0) {
    alert('올바른 판매 가격을 입력해주세요.');
    return;
  }
  // 스토어의 markAsSold 액션을 호출하며, 아이템 ID와 함께 입력된 판매 정보를 전달합니다[12].
  inventoryStore.markAsSold(props.item.id, saleData.value);
};
</script>

<template>
  <!-- 모달 배경 (어두운 반투명 레이어) -->
  <div class="modal-backdrop" @click.self="uiStore.closeSaleModal()">
    <!-- 실제 모달 콘텐츠 박스 -->
    <div class="modal-container">
      <div class="modal-header">
        <h3>'{{ item.name }}' 판매 정보 입력</h3>
        <button @click="uiStore.closeSaleModal()" class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="confirmSale">
          <div class="form-group">
            <label for="sale-price">판매 가격 (원)</label>
            <input id="sale-price" type="number" v-model.number="saleData.salePrice" required>
          </div>
          <div class="form-group">
            <label for="sale-medium">판매 매체</label>
            <select id="sale-medium" v-model="saleData.saleMedium">
              <option v-for="option in mediumOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button @click="uiStore.closeSaleModal()" class="button secondary">취소</button>
        <button @click="confirmSale" class="button primary">판매 완료 처리</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 모달 스타일링 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-container {
  width: 90%;
  max-width: 450px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}
.modal-header, .modal-body, .modal-footer {
  padding: 1.5rem;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}
.close-button {
  border: none;
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.form-group {
  margin-bottom: 1rem;
}
.modal-footer {
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.button {
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.button.primary { background-color: #2ecc71; color: white; }
.button.secondary { background-color: #ccc; }
</style>
