<!-- src/components/FileUpload.vue -->

<script setup>
import { storeToRefs } from 'pinia'; // [추가] 반응성을 위해 storeToRefs를 가져옵니다.
import { useInventoryStore } from '../stores/inventoryStore';
import { useUiStore } from '../stores/uiStore'; // [추가] uiStore를 가져옵니다.

const inventoryStore = useInventoryStore();
const uiStore = useUiStore(); // [추가] uiStore 인스턴스를 생성합니다.

// uiStore에서 currentBaseFileName 상태를 반응성을 유지하며 가져옵니다.
const { currentBaseFileName } = storeToRefs(uiStore);

/**
 * 파일이 선택되었을 때 실행되는 함수
 * @param {Event} event - input 요소의 change 이벤트 객체
 */
const handleFileUpload = async (event) => {
  if (event.target.files && event.target.files.length > 0) {
    const file = event.target.files[0];
    await inventoryStore.loadFromExcel(file);
    event.target.value = '';
  }
};

const clearAllData = () => {
  if (confirm('정말로 모든 데이터를 삭제하시겠습니까? ...')) {
    localStorage.removeItem('gundam_inventory_data');
    localStorage.removeItem('gundam_financial_data');
    // [추가] 데이터를 초기화할 때, UI 상태도 함께 초기화합니다.
    uiStore.setCurrentBaseFileName(null);
    window.location.reload();
  }
};
</script>

<template>
  <div class="file-upload-container">
    <div class="file-management-group">
      <h3>엑셀 파일 관리</h3>
      <!-- [핵심 추가] 현재 선택된 파일명을 표시하는 부분 -->
      <div class="current-file-display">
        <strong>현재 작업 파일:</strong>
        <span v-if="currentBaseFileName" class="file-name">{{ currentBaseFileName }}</span>
        <span v-else class="no-file">선택된 파일 없음</span>
      </div>
    </div>
    
    <div class="button-actions">
      <div class="file-input-wrapper">
        <label for="file-upload" class="file-upload-button">파일 불러오기</label>
        <input 
          id="file-upload"
          type="file" 
          @change="handleFileUpload" 
          accept=".xlsx, .xls, .csv"
        >
      </div>
      
      <button @click="inventoryStore.exportToExcel" class="export-button">
        엑셀 파일로 저장하기
      </button>

      <button @click="clearAllData" class="clear-button">
        모든 데이터 초기화
      </button>
    </div>
  </div>
</template>

<style scoped>
.file-upload-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* 화면이 좁을 때 줄바꿈되도록 */
  gap: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
}
.file-management-group {
  display: flex;
  flex-direction: column;
}
.current-file-display {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
.file-name {
  color: #0d6efd;
  font-weight: bold;
}
.no-file {
  color: #6c757d;
  font-style: italic;
}
.button-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.file-input-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
}
.file-upload-button {
  border: 1px solid #ccc;
  display: inline-block;
  padding: 10px 15px;
  cursor: pointer;
  background-color: #fff;
  border-radius: 4px;
}
#file-upload {
  /* 실제 input은 숨깁니다. */
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
}
.export-button, .clear-button {
  color: white;
  border: none;
  padding: 11px 15px; /* 높이를 맞추기 위해 padding 조정 */
  cursor: pointer;
  border-radius: 4px;
}
.export-button { background-color: #198754; }
.clear-button { background-color: #dc3545; }
</style>
