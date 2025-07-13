<!-- src/App.vue -->

<script setup>
// 1. 필요한 함수와 컴포넌트, 스토어를 가져옵니다.
import { storeToRefs } from 'pinia';
import { useInventoryStore } from './stores/inventory';

// 우리가 만든 재사용 가능한 목록 컴포넌트를 가져옵니다.
import CollapsibleSection from './components/CollapsibleSection.vue';
import GundamList from './components/GundamList.vue';

// 다른 컴포넌트들도 추후 사용을 위해 미리 import 해둡니다.
import GundamForm from './components/GundamForm.vue';
import FileUpload from './components/FileUpload.vue';

import FilterControls from './components/FilterControls.vue';
import FinancialDashboard from './components/FinancialDashboard.vue'; // HobbyFund에서 이름 변경

import SaleConfirmModal from './components/SaleConfirmModal.vue';
import ItemDetailModal from './components/ItemDetailModal.vue';

// 2. Pinia 스토어를 사용 준비합니다.
const store = useInventoryStore();

// 3. storeToRefs를 사용하여 스토어의 state를 반응성을 유지한 채로 가져옵니다.
const { 
  isSaleModalVisible,
  itemToSell,
  isDetailModalVisible, 
  itemForDetail,
  filteredInStorageList, 
  filteredForSaleList, 
  filteredSoldList 
} = storeToRefs(store);
</script>

<template>
  <header>
    <h1>건담 재고 관리 v2.0</h1>
  </header>
  <main>
    <!-- [수정] 각 기능 구역을 CollapsibleSection으로 감쌉니다. -->
    
    <CollapsibleSection title="종합 자산 현황">
      <!-- <slot> 영역에 들어갈 내용입니다. -->
      <FinancialDashboard />
    </CollapsibleSection>

    <CollapsibleSection title="신규 등록 및 파일 관리">
      <!-- <slot> 영역에 여러 컴포넌트를 함께 넣을 수도 있습니다. -->
      <GundamForm />
      <hr class="divider">
      <FileUpload />
    </CollapsibleSection>

    <CollapsibleSection title="재고 목록 및 필터">
      <FilterControls />
      <hr class="divider">
      <GundamList title="판매 목록" :items="filteredForSaleList" listType="sale" />
      <GundamList title="보관 목록" :items="filteredInStorageList" listType="storage" />
      <GundamList title="판매 완료 목록" :items="filteredSoldList" listType="sold" />
    </CollapsibleSection>
  </main>

  <!-- 
    모달 컴포넌트를 앱의 최상단에 배치합니다.
    - v-if를 사용해 isSaleModalVisible이 true일 때만 모달이 화면에 나타나도록 합니다.
    - :item="itemToSell"을 통해 모달이 어떤 아이템 정보를 표시해야 할지 데이터를 전달합니다.
  -->
  <SaleConfirmModal v-if="isSaleModalVisible && itemToSell" :item="itemToSell" />

  <!-- [신규] 상세 정보 모달을 조건부로 렌더링합니다. -->
  <ItemDetailModal v-if="isDetailModalVisible && itemForDetail" :item="itemForDetail" />

  <footer class="app-footer">
    <p>&copy; 2024 Your Name or Company. All Rights Reserved.</p>
    <p>
      이 애플리케이션은 개인 포트폴리오 목적으로 제작되었습니다.
      <a href="https://github.com/your-repo-link" target="_blank">GitHub Repository</a>
    </p>
  </footer>
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

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 화면 전체 높이를 차지하도록 */
}
main {
  flex-grow: 1; /* main 영역이 남은 공간을 모두 차지하도록 */
  /* ... 기존 main 스타일 ... */
}
.app-footer {
  text-align: center;
  padding: 2rem;
  background-color: #343a40;
  color: #adb5bd;
  font-size: 0.9rem;
}
.app-footer a {
  color: #ffffff;
  text-decoration: none;
}
.app-footer a:hover {
  text-decoration: underline;
}
</style>
