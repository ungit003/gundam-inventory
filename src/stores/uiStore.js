// src/stores/uiStore.js

import { defineStore } from 'pinia';

// 스토어 ID를 'ui'로 정의합니다.
export const useUiStore = defineStore('ui', {
  state: () => ({
    // --- UI 제어 상태 ---
    searchTerm: '',
    gradeFilter: 'All',

    // --- 모달 제어 상태 ---
    isSaleModalVisible: false,
    itemIdToProcess: null,
    isDetailModalVisible: false,
    itemIdForDetail: null,
  }),
  
  // v3.0에서는 getter 대신 컴포넌트에서 직접 state를 참조하는 것이 더 명확할 수 있습니다.
  getters: {
  },

  actions: {
    // --- UI 상태 변경 Actions ---
    setSearchTerm(term) { this.searchTerm = term; },
    setGradeFilter(grade) { this.gradeFilter = grade; },

    // --- 모달 제어 Actions ---
    openSaleModal(itemId) {
      this.itemIdToProcess = itemId;
      this.isSaleModalVisible = true;
    },
    closeSaleModal() {
      this.isSaleModalVisible = false;
      this.itemIdToProcess = null;
    },
    openDetailModal(itemId) {
      this.itemIdForDetail = itemId;
      this.isDetailModalVisible = true;
    },
    closeDetailModal() {
      this.isDetailModalVisible = false;
      this.itemIdForDetail = null;
    },
  },
});
