<!-- src/components/FileUpload.vue -->
 <!-- 이 컴포넌트는 파일 선택 UI를 제공하고, 파일이 선택되면 스토어의 액션을 호출하는 역할을 합니다. -->

<script setup>
import { useInventoryStore } from '../stores/inventory';

const store = useInventoryStore();

// 파일 입력창의 내용이 변경될 때 실행될 함수
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // 스토어의 loadFromExcel 액션을 호출하고, 선택된 파일을 넘겨줍니다.
    // 파일 읽기는 시간이 걸리는 비동기 작업이므로 await를 사용합니다.
    await store.loadFromExcel(file);
    alert('엑셀 파일을 성공적으로 불러왔습니다!');
  } catch (error) {
    console.error('파일을 읽는 중 오류가 발생했습니다:', error);
    alert('파일을 읽는 중 오류가 발생했습니다.');
  }
};
</script>

<template>
  <div class="file-upload-container">
    <h3>엑셀 파일 관리</h3>
    <!-- 
      - accept 속성으로 엑셀 파일만 선택할 수 있도록 제한합니다.
      - @change 이벤트는 사용자가 파일을 선택했을 때 발생합니다.
    -->
    <div>
      <label for="file-upload">파일 불러오기:</label>
      <input 
        id="file-upload"
        type="file" 
        @change="handleFileUpload" 
        accept=".xlsx, .xls"
      >
    </div>
    
    <!-- 
      아래 버튼을 새로 추가합니다.
      클릭(@click)하면 store에 있는 createExcel 함수를 실행합니다.
    -->
    <div class="button-group">
      <button @click="store.createExcel" class="create-button">
        현재 목록으로 엑셀 생성
      </button>
    </div>
  </div>
</template>

<style scoped>
.file-upload-container {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.create-button {
  background-color: #4CAF50; /* 초록색 배경 */
  color: white;
  border: none;
  padding: 10px 15px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
}
</style>
