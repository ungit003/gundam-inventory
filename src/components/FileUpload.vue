<!-- src/components/FileUpload.vue -->

<script setup>
import { useInventoryStore } from '@/stores/inventoryStore';

const inventoryStore = useInventoryStore();

/**
 * 파일이 선택되었을 때 실행되는 함수
 * @param {Event} event - input 요소의 change 이벤트 객체
 */
const handleFileUpload = async (event) => {
  // 사용자가 파일을 선택했는지 확인합니다.
  if (event.target.files && event.target.files.length > 0) {
    const file = event.target.files[0];
    
    // 디버깅 로그: 파일이 정상적으로 선택되었는지 확인합니다.
    console.log('파일 선택됨:', file.name);

    // 스토어의 loadFromExcel 액션을 호출하고, 작업이 끝날 때까지 기다립니다(await).
    await inventoryStore.loadFromExcel(file);
    
    // input의 값을 초기화하여, 사용자가 동일한 파일을 다시 선택해도 change 이벤트가 발생하도록 합니다.
    event.target.value = '';
  }
};
</script>

<template>
  <div class="file-upload-container">
    <h3>엑셀 파일 관리</h3>
    <div>
      <label for="file-upload">파일 불러오기:</label>
      <input 
        id="file-upload"
        type="file" 
        @change="handleFileUpload" 
        accept=".xlsx, .xls, csv"
      >
    </div>
    
    <div class="button-group">
      <button @click="inventoryStore.exportToExcel" class="export-button">
        엑셀 파일로 저장하기
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 스타일은 7단계와 동일하거나 필요에 따라 수정합니다. */
.file-upload-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}
.button-group {
  display: flex;
  gap: 0.5rem;
}
.export-button {
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 4px;
  background-color: #198754; /* 저장 버튼 색상 변경 */
  color: white;
  font-weight: 500;
}
</style>
