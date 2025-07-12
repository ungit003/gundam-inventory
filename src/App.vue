<!-- src/App.vue -->

<script setup>
// import 키워드를 사용하여 다른 파일에 있는 컴포넌트를 가져옵니다.
// 이렇게 가져온 컴포넌트는 <template> 안에서 HTML 태그처럼 사용할 수 있습니다.
import GundamList from './components/GundamList.vue';
import GundamForm from './components/GundamForm.vue';
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
    <!-- 등록 폼 컴포넌트가 이 자리에 렌더링됩니다. -->
    <GundamForm />

    <!-- 재고 목록 컴포넌트가 이 자리에 렌더링됩니다. -->
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
