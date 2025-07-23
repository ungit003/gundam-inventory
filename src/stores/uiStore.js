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
    currentBaseFileName: null, 
    isAlertModalVisible: false,
    alertModal: {
      title: '',
      message: '',
      isConfirm: false, // false이면 Alert, true이면 Confirm
      onConfirm: null,  // '확인'을 눌렀을 때 실행될 콜백 함수
    },
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
    /**
     * 현재 작업 파일의 기본 이름을 설정하는 액션입니다.
     * @param {string | null} name - 설정할 기본 파일명 또는 null
     */
    setCurrentBaseFileName(name) {
      this.currentBaseFileName = name;
    },

    /** Alert 모달 열기 */
    showAlert({ title, message }) {
      this.alertModal = { title, message, isConfirm: false, onConfirm: null };
      this.isAlertModalVisible = true;
    },

    /** Confirm 모달 열기 */
    showConfirm({ title, message, onConfirm }) {
      this.alertModal = { title, message, isConfirm: true, onConfirm };
      this.isAlertModalVisible = true;
    },

    /** Alert/Confirm 모달 닫기 */
    closeAlert() {
      this.isAlertModalVisible = false;
      this.alertModal.onConfirm = null;
    },

    /** Confirm 모달의 '확인' 버튼 처리 */
    handleConfirm() {
      if (typeof this.alertModal.onConfirm === 'function') {
        this.alertModal.onConfirm();
      }
      this.closeAlert();
    },
  },
});
