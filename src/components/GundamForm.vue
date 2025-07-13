<!-- src/components/GundamForm.vue -->

<script setup>
// 1. 필요한 Vue 기능(ref)과 Pinia 스토어를 가져옵니다.
import { ref } from 'vue';
import { useInventoryStore } from '../stores/inventory';
import { GRADE_OPTIONS } from '../config.js';

const store = useInventoryStore();

// 하드 코딩 내역 삭제
// const gradeOptions = ['HG', 'RG', 'MG', 'PG', 'SD', 'RE/100', 'Hi-RM', 'Mega', '완성품'];

// 3. [수정] 신규 건담 데이터를 위한 ref 객체를 정의합니다.
//    - grade의 기본값을 'HG'로 설정하여, 처음부터 하나의 버튼이 선택된 상태로 시작합니다.
//    - '구매 가격' 입력을 위해 purchasePrice 속성을 추가합니다.
const newGundam = ref({
  grade: 'HG', // 기본 선택 등급
  name: '',
  quantity: 1,
  purchasePrice: null, // 숫자 입력을 위해 null로 초기화
});

// 4. 폼 제출 시 실행될 함수입니다. (기존 로직과 거의 동일)
const handleSubmit = () => {
  if (!newGundam.value.name.trim()) {
    alert('건담 이름을 입력해주세요.');
    return;
  }
  // store의 addGundam 액션을 호출하여 중앙 저장소에 데이터를 추가합니다.
  store.addGundam(newGundam.value);

  // 폼 제출 후, 다음 입력을 위해 입력 필드를 초기화합니다.
  // 이름과 구매 가격만 비우고, 등급과 수량은 기본값으로 유지합니다.
  newGundam.value.name = '';
  newGundam.value.purchasePrice = null;
};
</script>

<template>
  <div class="gundam-form-container">
    <h2>신규 건담 등록</h2>
    <!-- 폼 제출 이벤트를 handleSubmit 함수와 연결합니다. -->
    <form @submit.prevent="handleSubmit">
      <!-- ====================================================== -->
      <!-- [핵심 변경점] 등급 선택 버튼 그룹 -->
      <!-- ====================================================== -->
      <div class="form-group">
        <label>등급</label>
        <div class="grade-buttons">
          <!-- 
            5. v-for를 사용해 gradeOptions 배열의 각 항목을 버튼으로 만듭니다.
          -->
          <button
            v-for="grade in GRADE_OPTIONS"
            :key="grade"
            type="button"
            @click="newGundam.grade = grade"
            :class="{ 'active': newGundam.grade === grade }"
          >
            {{ grade }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <label for="gundam-name">이름</label>
        <input id="gundam-name" type="text" placeholder="예: 스트라이크 프리덤" v-model="newGundam.name" required>
      </div>

      <div class="form-group">
        <label for="gundam-quantity">수량</label>
        <input id="gundam-quantity" type="number" min="1" v-model.number="newGundam.quantity">
      </div>
      
      <div class="form-group">
        <label for="gundam-price">구매 가격 (원)</label>
        <input id="gundam-price" type="number" placeholder="숫자만 입력" v-model.number="newGundam.purchasePrice">
      </div>

      <div class="form-group submit-group">
        <button type="submit" class="submit-button">보관 목록에 추가</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* 폼의 전체적인 스타일을 개선합니다. */
.gundam-form-container {
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}
form {
  display: flex;
  flex-direction: column; /* 세로 정렬로 변경 */
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
label {
  margin-bottom: 0.5rem;
  font-weight: bold;
  font-size: 0.9rem;
}
input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
/* 등급 버튼들을 담는 컨테이너 */
.grade-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
/* 등급 버튼 기본 스타일 */
.grade-buttons button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 20px; /* 둥근 모서리 */
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}
/* 활성화된 버튼에 적용될 스타일 (핵심) */
.grade-buttons button.active {
  background-color: #41B883; /* Vue 색상 */
  color: white;
  border-color: #41B883;
  font-weight: bold;
}
.submit-button {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background-color: #3498db;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
