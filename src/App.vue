<!-- src/App.vue -->

<script setup>
// 1. 필요한 함수와 컴포넌트, 스토어를 가져옵니다.
import { storeToRefs } from 'pinia';
import { useInventoryStore } from './stores/inventory';

// 우리가 만든 재사용 가능한 목록 컴포넌트를 가져옵니다.
import GundamList from './components/GundamList.vue';
// 다른 컴포넌트들도 추후 사용을 위해 미리 import 해둡니다.
import GundamForm from './components/GundamForm.vue';
import FileUpload from './components/FileUpload.vue';

import FilterControls from './components/FilterControls.vue';

// 2. Pinia 스토어를 사용 준비합니다.
const store = useInventoryStore();

// 3. storeToRefs를 사용하여 스토어의 state를 반응성을 유지한 채로 가져옵니다.
const { 
  filteredInStorageList, 
  filteredForSaleList, 
  filteredSoldList 
} = storeToRefs(store);
</script>

<template>
  <header>
    <h1>내 건담 재고 관리</h1>
  </header>
  <main>
    <!-- 이 컴포넌트들은 다음 단계들에서 순차적으로 기능을 구현하고 수정할 예정입니다. -->
    <FileUpload /> 
    <GundamForm />

    <hr class="divider">

    <!-- 3. 목록들이 시작되기 전에 필터 컨트롤 컴포넌트를 배치합니다. -->
    <FilterControls />

    <!-- 
      4. GundamList 컴포넌트를 재사용하여 세 개의 목록을 각각 렌더링합니다.
         - :title="판매 목록" 처럼 props를 통해 각 컴포넌트에 다른 데이터를 전달합니다[5].
         - 하나의 컴포넌트가 props 값에 따라 각기 다른 제목, 데이터, 구조를 가지게 됩니다.
    -->
    <!-- 4. GundamList 컴포넌트에 props로 전달하는 :items를 필터링된 getter로 교체합니다. -->
    <GundamList 
      title="판매 목록" 
      :items="filteredForSaleList" 
      listType="sale" 
    />
    <GundamList 
      title="보관 목록" 
      :items="filteredInStorageList" 
      listType="storage" 
    />
    <GundamList 
      title="판매 완료 목록" 
      :items="filteredSoldList" 
      listType="sold" 
    />
  </main>
</template>

<style scoped>
header {
  background-color: #41B883;
  color: white;
  padding: 1rem;
  text-align: center;
}
main {
  max-width: 960px; /* 더 넓은 화면을 위해 너비 조정 */
  margin: 0 auto;
  padding: 1rem;
}
.divider {
  margin: 2rem 0;
  border: 0;
  border-top: 1px solid #eee;
}
</style>
