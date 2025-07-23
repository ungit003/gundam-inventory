<!-- src/components/ItemDetailModal.vue -->

<script setup>
import { ref, watch } from 'vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useUiStore } from '@/stores/uiStore';
import { GRADE_OPTIONS } from '../config';

const inventoryStore = useInventoryStore();
const uiStore = useUiStore();

// 1. 부모로부터 수정할 아이템 객체를 props로 전달받습니다.
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

// 2. props로 받은 데이터를 직접 수정하는 것은 좋지 않으므로,
//    수정을 위한 로컬 복사본(localItem)을 만듭니다.
const localItem = ref({ imageUrls: [] }); // 기본값으로 빈 배열을 갖도록 초기화

// 3. props.item이 변경될 때마다(모달이 새로 열릴 때마다) 로컬 복사본을 업데이트합니다.
watch(() => props.item, (newItem) => {
  if (newItem) {
    localItem.value = { ...newItem };
    // imageUrls가 배열이 아니면(이전 데이터 호환성), 안전하게 빈 배열로 만듭니다.
    if (!Array.isArray(localItem.value.imageUrls)) {
      localItem.value.imageUrls = [];
    }
  }
}, { immediate: true, deep: true });

// 이미지 URL 입력 필드를 추가하는 함수
const addImageUrlField = () => {
  localItem.value.imageUrls.push(''); // 빈 문자열을 추가하여 새 입력 필드를 생성
};
// 이미지 URL 입력 필드를 삭제하는 함수
const removeImageUrlField = (index) => {
  localItem.value.imageUrls.splice(index, 1); // 특정 인덱스의 요소를 제거
};

// '저장' 버튼 클릭 시 실행될 함수
const saveChanges = () => {
  // 스토어의 updateItemDetails 액션을 호출하여 변경된 데이터를 저장합니다.
  inventoryStore.updateItemDetails(localItem.value);
  uiStore.closeDetailModal();
};

const deleteItem = () => {
  if (confirm(`'${props.item.name}' 항목을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
    inventoryStore.deleteGundam(props.item.id);
    // 삭제 후에는 모달을 닫아야 하므로, closeDetailModal도 호출합니다.
    uiStore.closeDetailModal();
  }
};
</script>

<template>
  <div class="modal-backdrop" @click.self="uiStore.closeDetailModal()">
    <div class="modal-container">
      <div class="modal-header">
        <h3>'{{ localItem.name }}' 상세 정보</h3>
        <button @click="uiStore.closeDetailModal()" class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        <!-- 이미지 미리보기 -->
        <div class="image-preview" v-if="localItem.imageUrl">
          <img :src="localItem.imageUrl" alt="건담 이미지">
        </div>

        <!-- 정보 수정 폼 -->
        <form @submit.prevent="saveChanges" class="detail-form">
          <div class="form-grid">
            <div class="form-group">
              <label>이름</label>
              <input type="text" v-model="localItem.name">
            </div>
            <div class="form-group">
              <label>등급</label>
              <!-- 기존의 <input type="text">를 아래의 버튼 그룹으로 교체합니다. -->
              <div class="grade-buttons">
                <!--
                  - v-for를 사용해 GRADE_OPTIONS 배열의 각 등급을 버튼으로 만듭니다.
                  - @click="localItem.grade = grade": 버튼 클릭 시, localItem의 등급을 해당 버튼의 등급으로 변경합니다.
                  - :class="{ 'active': ... }": 현재 localItem의 등급과 버튼의 등급이 일치하면 'active' 클래스를 추가하여 시각적으로 선택되었음을 표시합니다.
                -->
                <button
                  v-for="grade in GRADE_OPTIONS"
                  :key="grade"
                  type="button"
                  @click="localItem.grade = grade"
                  :class="{ 'active': localItem.grade === grade }"
                >
                  {{ grade }}
                </button>
              </div>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>구매 가격</label>
              <input type="number" v-model.number="localItem.purchasePrice">
            </div>
            <div class="form-group">
              <label>판매 희망가</label>
              <input type="number" v-model.number="localItem.desiredSalePrice">
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>배송비</label>
              <!--
                v-model.number 수식어는 사용자 입력을 숫자로 자동 변환해줍니다.
                입력하지 않으면 null이 되도록 처리됩니다.
              -->
              <input type="number" placeholder="원" v-model.number="localItem.shippingCost">
            </div>
            <div class="form-group">
              <label>기타 수수료</label>
              <input type="number" placeholder="원" v-model.number="localItem.otherFees">
            </div>
          </div>
          
          <div class="form-group">
            <label>구매처</label>
            <input type="text" v-model="localItem.purchaseLocation">
          </div>
          <div class="form-group">
            <label>이미지 URL</label>
            <!-- v-for를 사용해 imageUrls 배열의 각 URL을 입력 필드로 렌더링합니다. -->
            <div v-for="(url, index) in localItem.imageUrls" :key="index" class="image-url-group">
              <input 
                type="text" 
                placeholder="https://..." 
                v-model="localItem.imageUrls[index]"
              >
              <!-- 각 입력 필드 옆에 삭제 버튼을 추가합니다. -->
              <button type="button" @click="removeImageUrlField(index)" class="remove-button">&times;</button>
            </div>
            <!-- 새 입력 필드를 추가하는 버튼입니다. -->
            <button type="button" @click="addImageUrlField" class="add-button">이미지 URL 추가</button>
          </div>
          <div class="form-group">
            <label>상세 설명</label>
            <textarea rows="4" v-model="localItem.details"></textarea>
          </div>

        </form>
      </div>
      <div class="modal-footer">
        <button @click="deleteItem" class="button delete">삭제</button>
        <button @click="uiStore.closeDetailModal()" class="button secondary">취소</button>
        <button @click="saveChanges" class="button primary">저장</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 모달 스타일은 SaleConfirmModal과 유사하게 구성합니다. */
.modal-body { max-height: 70vh; overflow-y: auto; }
.detail-form { display: flex; flex-direction: column; gap: 1rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; }
.image-preview { text-align: center; margin-bottom: 1rem; }
.image-preview img { max-width: 100%; max-height: 200px; border-radius: 8px; }
/* ... (기타 모달 스타일) ... */
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

.modal-footer {
  justify-content: space-between; /* 버튼들을 양쪽 끝으로 정렬 */
}
.button.delete {
  background-color: #e74c3c;
  color: white;
}

.grade-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}
.grade-buttons button {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}
.grade-buttons button.active {
  background-color: #41B883;
  color: white;
  border-color: #41B883;
}

.image-url-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.image-url-group input {
  flex-grow: 1; /* 입력 필드가 남은 공간을 모두 차지하도록 */
}
.remove-button, .add-button {
  border: 1px solid #ccc;
  background-color: #f8f9fa;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
}
.remove-button { color: #e74c3c; }
.add-button { width: 100%; margin-top: 0.5rem; }
</style>
