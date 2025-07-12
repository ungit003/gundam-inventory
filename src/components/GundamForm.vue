<!-- src/components/GundamForm.vue -->

<script setup>
// 여기도 아직은 로직이 필요 없으므로 비워둡니다.
</script>

<template>
  <!-- 새로운 건담을 등록하기 위한 입력 폼입니다. -->
  <div class="gundam-form-container">
    <h2>신규 건담 등록</h2>
    <form>
      <input type="text" placeholder="등급 (예: MG, HG)">
      <input type="text" placeholder="이름">
      <input type="number" placeholder="수량" min="1">
      <select>
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
