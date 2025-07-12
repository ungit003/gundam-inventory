<!-- src/App.vue -->

<script setup>
// 데이터(ref)와 이벤트 핸들러가 모두 필요 없어졌으므로 삭제합니다.
import GundamList from './components/GundamList.vue';
import GundamForm from './components/GundamForm.vue';
// 1. FileUpload 컴포넌트를 가져옵니다.
import FileUpload from './components/FileUpload.vue';
</script>

<template>
  <!-- 
    이곳이 우리 애플리케이션의 최상위 껍데기(레이아웃)가 됩니다.
    import로 가져온 컴포넌트들을 원하는 위치에 배치합니다.
  -->
  <header>
    <h1>내 건담 재고 관리</h1>
  </header>
  <main>
    <!-- 2. 적절한 위치에 컴포넌트를 배치합니다. -->
    <FileUpload />
    <GundamForm />
    <!-- 
      자식에게 데이터를 전달하고 이벤트를 받을 필요가 없어졌습니다.
      :gundams, @add-gundam 코드를 모두 제거합니다.
    -->
    <GundamList />
  </main>
</template>

<style scoped>
/* App.vue의 최상위 레이아웃 스타일을 정의합니다. */
header {
  background-color: #41B883; /* Vue의 상징색 */
  color: white;
  padding: 1rem;
  text-align: center;
}

main {
  max-width: 800px;
  margin: 0 auto; /* 중앙 정렬 */
  padding: 1rem;
}
</style>
