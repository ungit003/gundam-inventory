<!-- src/App.vue -->

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

// 필요한 모든 전문 스토어를 가져옵니다.
import { useInventoryStore } from './stores/inventoryStore';
import { useUiStore } from './stores/uiStore';

// 필요한 모든 자식 컴포넌트를 가져옵니다.
import CollapsibleSection from './components/CollapsibleSection.vue';
import FinancialDashboard from './components/FinancialDashboard.vue';
import GundamForm from './components/GundamForm.vue';
import FileUpload from './components/FileUpload.vue';
import FilterControls from './components/FilterControls.vue';
import GundamList from './components/GundamList.vue';
import SaleConfirmModal from './components/SaleConfirmModal.vue';
import ItemDetailModal from './components/ItemDetailModal.vue';
import BaseModal from './components/BaseModal.vue';

// 각 스토어의 인스턴스를 생성합니다.
const inventoryStore = useInventoryStore();
const uiStore = useUiStore();
const { isAlertModalVisible, alertModal } = storeToRefs(uiStore);

// --- [핵심] 데이터 가져오기 단순화 ---
// App.vue는 더 이상 '어떻게' 필터링하는지 알 필요가 없습니다.
// inventoryStore가 알아서 필터링하여 제공하는 '최종 결과물(getter)'만 가져옵니다.
const { 
  filteredInStorageList, 
  filteredForSaleList, 
  filteredSoldList 
} = storeToRefs(inventoryStore);

// uiStore에서는 모달을 제어하기 위한 상태만 가져옵니다.
const { isSaleModalVisible, isDetailModalVisible } = storeToRefs(uiStore);

// --- [삭제] ---
// App.vue에 있던 복잡한 필터링 헬퍼 함수와 computed 속성들은 모두 제거되었습니다.
// 이로 인해 App.vue의 코드가 훨씬 간결하고 명확해졌습니다.

// 모달에 전달할 데이터를 계산하는 computed는 그대로 유지합니다.
// 이는 UI 상태(ID)와 재고 데이터(객체)를 조합해야 하므로,
// 지휘자인 App.vue가 담당하는 것이 합리적입니다.
const itemToSell = computed(() => {
  return uiStore.itemIdToProcess 
    ? inventoryStore.forSaleList.find(item => item.id === uiStore.itemIdToProcess) 
    : null;
});
const itemForDetail = computed(() => inventoryStore.itemForDetail(uiStore.itemIdForDetail));

</script>

<template>
  <div class="app-wrapper">
    <header>
      <h1>건담 재고 관리 v3.0)</h1>
    </header>
    <main>
      <!-- 자식 컴포넌트들을 조립하는 부분은 변경할 필요가 없습니다. -->
      <!-- :items에 이미 필터링이 완료된 최종 목록을 전달합니다. -->
      <CollapsibleSection title="종합 자산 현황">
        <FinancialDashboard />
      </CollapsibleSection>

      <CollapsibleSection title="신규 등록 및 파일 관리">
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

    <!-- 모달 렌더링 부분도 변경할 필요가 없습니다. -->
     <BaseModal :show="isAlertModalVisible" @close="uiStore.closeAlert()">
      <template #header>
        <h3>{{ alertModal.title }}</h3>
      </template>
      <template #body>
        <p v-html="alertModal.message.replace(/\n/g, '<br>')"></p>
      </template>
      <template #footer>
        <!-- isConfirm이 true(Confirm 모달)일 때만 '취소' 버튼이 보입니다. -->
        <button v-if="alertModal.isConfirm" @click="uiStore.closeAlert()" class="button secondary">취소</button>
        <!-- isConfirm이 false(Alert 모달)이면 이 버튼이 '확인' 역할을 합니다. -->
        <button @click="alertModal.isConfirm ? uiStore.handleConfirm() : uiStore.closeAlert()" class="button primary">확인</button>
      </template>
    </BaseModal>
    <SaleConfirmModal v-if="isSaleModalVisible && itemToSell" :item="itemToSell" />
    <ItemDetailModal v-if="isDetailModalVisible && itemForDetail" :item="itemForDetail" />

    <footer class="app-footer">
      <p>&copy; 2024 Your Name. All Rights Reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
/* App.vue의 스타일은 변경할 필요가 없습니다. */
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
header {
  background-color: #41B883;
  color: white;
  padding: 1rem;
  text-align: center;
}
main {
  flex-grow: 1;
  max-width: 1024px;
  margin: 0 auto;
  padding: 1rem;
  width: 100%;
}
.divider {
  margin: 2rem 0;
  border: 0;
  border-top: 1px solid #eee;
}
.app-footer {
  text-align: center;
  padding: 2rem;
  background-color: #343a40;
  color: #adb5bd;
  font-size: 0.9rem;
}
</style>
