<!-- src/components/GundamForm.vue -->

<script setup>
// 1. 폼 입력을 임시로 저장할 반응형 데이터를 만들기 위해 'ref'를 가져옵니다.
import { ref } from 'vue';

// 2. 이 컴포넌트가 부모에게 'add-gundam'이라는 이름의 이벤트를 보낼 것이라고 선언합니다.
// 이렇게 미리 선언해두면 코드가 명확해지고, Vue 개발자 도구에서도 확인하기 좋습니다.
const emit = defineEmits(['add-gundam']);

// 3. 폼의 각 입력 필드와 연결될 객체를 생성합니다.
// 사용자가 폼에 무언가 입력하면 이 객체의 속성값이 실시간으로 바뀝니다.
const newGundam = ref({
  grade: '',
  name: '',
  quantity: 1,
  status: '보관'
});

// 4. 폼이 제출될 때 실행될 함수입니다.
const handleSubmit = () => {
  // 간단한 유효성 검사: 건담 이름이 비어있으면 경고하고 함수를 종료합니다.
  if (!newGundam.value.name.trim()) {
    alert('건담 이름을 입력해주세요.');
    return;
  }

  // 5. 'add-gundam' 이벤트를 발생시키면서, 사용자가 입력한 데이터(newGundam.value)를 함께 보냅니다.
  // 객체를 복사해서 보내는 것이 안전합니다. ({ ...newGundam.value })
  emit('add-gundam', { ...newGundam.value });

  // 6. 데이터를 부모에게 보낸 후, 다음 입력을 위해 폼을 깨끗하게 초기화합니다.
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
