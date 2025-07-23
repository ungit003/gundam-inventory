<!-- src/components/ItemDetailModal.vue -->

<script setup>
import { ref, watch } from 'vue';
import { useInventoryStore } from '../stores/inventoryStore';
import { useUiStore } from '../stores/uiStore';
import { GRADE_OPTIONS } from '../config';

const inventoryStore = useInventoryStore();
const uiStore = useUiStore();

const props = defineProps({
  item: { type: Object, required: true },
});

// 모든 로컬 상태를 명확하게 정의합니다.
const localItem = ref({ imageUrls: [] });
const currentImageIndex = ref(0);

/**
 * [최종 수정] props.item이 변경될 때마다 로컬 상태를 리셋하는 Watcher
 */
watch(() => props.item, (newItem) => {
  if (newItem) {
    // [핵심] JSON.parse(JSON.stringify(...))를 사용해 완벽하고 안전한 깊은 복사본을 만듭니다.
    // 이 방법은 Proxy 객체를 순수한 JS 객체로 변환하여 복사하므로, structuredClone 오류가 발생하지 않습니다.
    localItem.value = JSON.parse(JSON.stringify(newItem));

    // imageUrls가 배열이 아니면 (이전 데이터와의 호환성을 위해) 빈 배열로 초기화합니다.
    if (!Array.isArray(localItem.value.imageUrls)) {
      localItem.value.imageUrls = [];
    }
    // 모달이 열릴 때마다 이미지 인덱스를 첫 번째 이미지(0)로 재설정합니다.
    currentImageIndex.value = 0;
  }
}, { 
  immediate: true,
});

// --- 모든 이벤트 핸들러를 명확하게 정의합니다 ---
const saveChanges = () => {
  inventoryStore.updateItemDetails(localItem.value);
  uiStore.closeDetailModal();
};

const deleteItem = () => {
  // [핵심 수정] 기존 if(confirm(...)) 블록을 uiStore.showConfirm 호출로 대체합니다.
  uiStore.showConfirm({
    title: '삭제 확인',
    message: `'${props.item.name}' 항목을 정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
    
    // onConfirm: 사용자가 모달의 '확인' 버튼을 눌렀을 때 실행될 함수를 전달합니다.
    onConfirm: () => { 
      inventoryStore.deleteGundam(props.item.id);
      uiStore.closeDetailModal();
    }
  });
};

const addImageUrlField = () => localItem.value.imageUrls.push('');
const removeImageUrlField = (index) => localItem.value.imageUrls.splice(index, 1);

const showNextImage = () => {
  const count = localItem.value.imageUrls.length;
  if (count > 0) {
    currentImageIndex.value = (currentImageIndex.value + 1) % count;
  }
};
const showPrevImage = () => {
  const count = localItem.value.imageUrls.length;
  if (count > 0) {
    currentImageIndex.value = (currentImageIndex.value - 1 + count) % count;
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
        <!-- localItem.imageUrls 배열에 이미지가 하나라도 있을 때만 뷰어를 표시합니다. -->
        <div v-if="localItem.imageUrls && localItem.imageUrls.length > 0" class="image-viewer">
          <!-- 현재 이미지 표시 -->
          <!-- 
            [핵심 수정 2] computed 대신 템플릿에서 직접 이미지 URL을 참조합니다.
            반응성 체인을 단순화하여 오류 발생 가능성을 줄입니다.
          -->
          <img 
            :src="localItem.imageUrls[currentImageIndex]" 
            alt="건담 이미지" 
            class="main-image" 
            @error="event => event.target.src=''"
          >
          <!-- 이미지가 2개 이상일 때만 '이전'/'다음' 버튼을 표시합니다. -->
          <template v-if="localItem.imageUrls.length > 1">
            <button @click="showPrevImage" class="nav-button prev">&lt;</button>
            <button @click="showNextImage" class="nav-button next">&gt;</button>
          </template>

          <!-- 현재 이미지 인덱스 표시 (예: 2 / 5) -->
          <div class="image-indicator">
            {{ currentImageIndex + 1 }} / {{ localItem.imageUrls.length }}
          </div>
        </div>
        <!-- 이미지가 없을 경우 안내 메시지 -->
        <div v-else class="no-image-placeholder">
          등록된 이미지가 없습니다.
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

.image-viewer {
  position: relative; /* 자식 요소(버튼)의 위치 기준점 */
  width: 100%;
  padding-top: 75%; /* 4:3 비율의 높이를 확보 */
  background-color: #f0f0f0;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden; /* 둥근 모서리 적용 */
}
.main-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* 이미지가 찌그러지지 않고 안에 꽉 차도록 */
}
.no-image-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  color: #aaa;
  margin-bottom: 1.5rem;
  border-radius: 8px;
}
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.nav-button:hover {
  opacity: 1;
}
.nav-button.prev {
  left: 10px;
}
.nav-button.next {
  right: 10px;
}
.image-indicator {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
}
</style>
