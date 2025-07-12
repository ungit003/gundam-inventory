<!-- src/components/GundamForm.vue -->

<script setup>
// 폼 입력을 임시로 저장할 반응형 데이터를 만들기 위해 'ref'를 가져옵니다.
import { ref } from 'vue';
// 1. emit을 정의하는 코드는 더 이상 필요 없으므로 삭제합니다.
//    대신, 우리가 만든 스토어를 가져옵니다.
import { useInventoryStore } from '../stores/inventory';

// 2. 스토어 인스턴스를 가져옵니다.
const store = useInventoryStore();

const newGundam = ref({
  grade: '',
  name: '',
  quantity: 1,
  status: '보관'
});

const handleSubmit = () => {
  if (!newGundam.value.name.trim()) {
    alert('건담 이름을 입력해주세요.');
    return;
  }
  
  // 3. emit으로 이벤트를 보내는 대신, 스토어의 addGundam 액션을 직접 호출합니다.
  //    사용자가 입력한 데이터를 인자로 넘겨줍니다.
  store.addGundam(newGundam.value);

  // 폼 초기화 로직은 동일합니다.
  newGundam.value = { grade: '', name: '', quantity: 1, status: '보관' };
};
</script>

<template>
  <!-- 새로운 건담을 등록하기 위한 입력 폼입니다. -->
  <div class="gundam-form-container">
    <h2>신규 건담 등록</h2>
    <!-- 
      7. form 태그에 @submit.prevent="handleSubmit"를 추가합니다.
      - '@submit': 폼이 제출될 때 (Enter 키 또는 등록 버튼 클릭)
      - '.prevent': 폼 제출 시 발생하는 페이지 새로고침(기본 동작)을 막아줍니다.
    -->
    <form @submit.prevent="handleSubmit">
      <!-- 
        8. 'v-model'을 사용해 input과 데이터를 양방향으로 연결합니다.
        - 사용자가 입력창에 타이핑하면 newGundam.value.grade 값이 바뀝니다.
        - 코드에서 newGundam.value.grade 값을 바꾸면 입력창의 내용도 바뀝니다.
      -->
      <input type="text" placeholder="등급 (예: MG, HG)" v-model="newGundam.grade">
      <input type="text" placeholder="이름" v-model="newGundam.name">
      <input type="number" placeholder="수량" min="1" v-model.number="newGundam.quantity">
      <select v-model="newGundam.status">
        <option>보관</option>
        <option>판매</option>
      </select>
      <button type="submit">등록</button>
    </form>
  </div>
</template>

<style scoped>
/* 이 스타일 역시 GundamForm.vue 컴포넌트 내부에서만 유효합니다. */
.gundam-form-container {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
}

form {
  display: flex;
  gap: 0.5rem; /* 입력 필드 사이의 간격 */
}
</style>
