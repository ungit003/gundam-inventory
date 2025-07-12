<!-- src/App.vue -->

<script setup>
// import 키워드를 사용하여 다른 파일에 있는 컴포넌트를 가져옵니다.
// 이렇게 가져온 컴포넌트는 <template> 안에서 HTML 태그처럼 사용할 수 있습니다.
import GundamList from './components/GundamList.vue';
import GundamForm from './components/GundamForm.vue';

// 1. Vue의 핵심 기능인 반응성을 만들어주는 'ref' 함수를 가져옵니다.
// 'ref'로 감싼 데이터는 값이 변경되면, 이 데이터를 사용하는 모든 화면이 자동으로 업데이트됩니다.
import { ref } from 'vue';

// 2. 화면에 표시할 건담 목록 데이터를 'ref'를 사용해 반응형 데이터로 생성합니다.
// 각 건담은 고유한 'id'를 가지도록 만드는 것이 좋습니다. 
// 나중에 삭제/수정 기능을 만들 때 이 id를 기준으로 특정 항목을 찾아냅니다.
const gundams = ref([
  { id: 1, grade: 'MG', name: '스트라이크 프리덤', quantity: 1, status: '보관' },
  { id: 2, grade: 'HG', name: '에어리얼', quantity: 2, status: '판매' },
  { id: 3, grade: 'RG', name: '사자비', quantity: 1, status: '보관' },
]);
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
    <!-- 
      3. 자식 컴포넌트(<GundamList>)에 데이터를 전달합니다.
      ':gundams'는 'v-bind:gundams'의 축약형입니다.
      'gundams'라는 이름표(prop)로 우리가 위에서 만든 'gundams' 데이터를
      자식에게 넘겨준다는 의미입니다. (왼쪽 gundams = 이름표, 오른쪽 gundams = 실제 데이터)
    -->
    <GundamList :gundams="gundams" />
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
