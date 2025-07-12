<!-- src/components/FileUpload.vue -->

<script setup>
import { useInventoryStore } from '../stores/inventory';

const store = useInventoryStore();

// 파일이 업로드되면 실행될 함수
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  // 스토어의 loadFromExcel 액션을 호출합니다. 이 액션은 이제 다중 시트를 처리합니다.
  await store.loadFromExcel(file);
  // input의 값을 초기화하여 같은 파일을 다시 업로드할 수 있게 합니다.
  event.target.value = '';
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
        accept=".xlsx, .xls"
      >
    </div>
    
    <div class="button-group">
      <!-- 
        버튼 클릭 시 store의 createExcel 액션을 호출합니다. 
        이 액션은 이제 다중 시트를 가진 엑셀 파일을 생성합니다.
      -->
      <button @click="store.createExcel" class="create-button">
        현재 목록으로 엑셀 생성
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
.button-group, .file-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.create-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 4px;
}
</style>
