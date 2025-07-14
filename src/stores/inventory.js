// src/stores/inventory.js

import { defineStore } from 'pinia';
import * as XLSX from 'xlsx';

// JSDoc을 사용하여 데이터 타입을 명시적으로 정의하면,
// VSCode 같은 에디터에서 자동 완성 기능을 활용할 수 있어 개발 편의성이 향상됩니다.
/**
 * @typedef {Object} GundamItem - 기본적인 건담 아이템의 타입 정의
 * @property {number} id - 고유 ID
 * @property {string} grade - 등급 (HG, MG 등)
 * @property {string} name - 이름
 * @property {number} quantity - 수량
 * @property {number | null} purchasePrice - 구매 가격
 * @property {number | null} desiredSalePrice - 판매 희망 가격
 * @property {string} purchaseLocation - 구매처
 * @property {string} details - 상세 설명
 * @property {string | null} imageUrl - 이미지 URL
 */

/**
 * @typedef {GundamItem & { salePrice: number; saleMedium: string; }} SoldGundamItem - 판매 완료된 아이템의 타입 정의
 */

// 'defineStore' 함수를 사용하여 'inventory'라는 고유 ID를 가진 스토어를 생성합니다.
export const useInventoryStore = defineStore('inventory', {
  // ----------------------------------------------------------------
  // 1. state: 애플리케이션의 모든 원본 데이터를 담는 중앙 저장소입니다.
  //    컴포넌트의 data()와 유사하며, 반드시 함수 형태로 반환해야 합니다.
  // ----------------------------------------------------------------
  state: () => ({
    // 데이터 목록
    inStorageList: [], // 보관 목록
    forSaleList: [],   // 판매 목록
    soldList: [],      // 판매 완료 목록
    
    // 취미 자금 관리 객체
    hobbyFund: {
      balance: 0, // 현재 잔액
      history: [], // 입출금 내역
    },

    // UI 제어 및 필터링을 위한 상태
    searchTerm: '',       // 검색어
    gradeFilter: 'All',   // 등급 필터
    // loadedFileName: null, // 불러온 엑셀 파일 이름
    
    // 모달(Modal) 창 제어를 위한 상태
    isSaleModalVisible: false,   // 판매 완료 모달 표시 여부
    itemIdToProcess: null,       // 판매 완료 처리할 아이템 ID
    isDetailModalVisible: false, // 상세 정보 모달 표시 여부
    itemIdForDetail: null,       // 상세 정보를 볼 아이템 ID
  }),

  // ----------------------------------------------------------------
  // 2. getters: state를 기반으로 계산된 값을 제공하는 부분입니다. (읽기 전용)
  //    Vue 컴포넌트의 computed 속성과 유사하며, 의존하는 state가 변경될 때만
  //    다시 계산되므로 효율적입니다.
  // ----------------------------------------------------------------
  getters: {
    // --- 필터링된 목록 Getters ---
    /**
     * [수정] 필터링된 보관 목록을 반환하는 getter입니다.
     * 검색 로직이 여러 필드를 대상으로 하도록 확장됩니다.
     */
    filteredInStorageList: (state) => {
      // 검색어가 비어있으면 필터링을 수행하지 않고 전체를 반환하여 성능을 최적화합니다.
      if (!state.searchTerm.trim()) {
        return state.inStorageList.filter(item => 
          state.gradeFilter === 'All' || item.grade === state.gradeFilter
        );
      }
      
      const lowerCaseSearchTerm = state.searchTerm.toLowerCase();
      
      return state.inStorageList.filter(item => {
        const gradeMatch = state.gradeFilter === 'All' || item.grade === state.gradeFilter;
        
        // [핵심 변경점] 검색 조건 확장
        // 아이템의 여러 텍스트 속성 중 하나라도 검색어를 포함하면 true가 됩니다.
        const searchMatch = 
          item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.grade.toLowerCase().includes(lowerCaseSearchTerm) ||
          (item.purchaseLocation && item.purchaseLocation.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (item.details && item.details.toLowerCase().includes(lowerCaseSearchTerm));
          
        return gradeMatch && searchMatch;
      });
    },

    // 판매 목록과 판매 완료 목록도 동일한 로직으로 검색 기능을 강화합니다.
    filteredForSaleList: (state) => {
      if (!state.searchTerm.trim()) {
        return state.forSaleList.filter(item => 
          state.gradeFilter === 'All' || item.grade === state.gradeFilter
        );
      }
      const lowerCaseSearchTerm = state.searchTerm.toLowerCase();
      return state.forSaleList.filter(item => {
        const gradeMatch = state.gradeFilter === 'All' || item.grade === state.gradeFilter;
        const searchMatch = 
          item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.grade.toLowerCase().includes(lowerCaseSearchTerm) ||
          (item.purchaseLocation && item.purchaseLocation.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (item.details && item.details.toLowerCase().includes(lowerCaseSearchTerm));
        return gradeMatch && searchMatch;
      });
    },

    filteredSoldList: (state) => {
      if (!state.searchTerm.trim()) {
        return state.soldList.filter(item => 
          state.gradeFilter === 'All' || item.grade === state.gradeFilter
        );
      }
      const lowerCaseSearchTerm = state.searchTerm.toLowerCase();
      return state.soldList.filter(item => {
        const gradeMatch = state.gradeFilter === 'All' || item.grade === state.gradeFilter;
        const searchMatch = 
          item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.grade.toLowerCase().includes(lowerCaseSearchTerm) ||
          (item.purchaseLocation && item.purchaseLocation.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (item.details && item.details.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (item.saleMedium && item.saleMedium.toLowerCase().includes(lowerCaseSearchTerm)); // 판매 완료 목록은 판매 매체도 검색 대상에 포함
        return gradeMatch && searchMatch;
      });
    },

    // --- 금융 정보 계산 Getters ---
    currentStockValue: (state) => {
      const allStock = [...state.inStorageList, ...state.forSaleList];
      return allStock.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
    },
    totalProfit: (state) => {
      return state.soldList.reduce((sum, item) => sum + ((item.salePrice || 0) - (item.purchasePrice || 0)), 0);
    },
    totalAssets: (state) => {
      return state.hobbyFund.balance + state.currentStockValue;
    },
    estimatedTotalSaleValue: (state) => {
      return state.forSaleList.reduce((sum, item) => sum + (item.desiredSalePrice || 0), 0);
    },

    // --- 모달에 데이터를 전달하기 위한 Getters ---
    itemToSell: (state) => {
      return state.itemIdToProcess ? state.forSaleList.find(item => item.id === state.itemIdToProcess) : null;
    },
    itemForDetail: (state) => {
      if (!state.itemIdForDetail) return null;
      const allItems = [...state.inStorageList, ...state.forSaleList, ...state.soldList];
      return allItems.find(item => item.id === state.itemIdForDetail) || null;
    },
  },

  // ----------------------------------------------------------------
  // 3. actions: state를 변경하는 유일한 방법입니다.
  //    Vue 컴포넌트의 methods와 유사하며, 비동기 작업도 처리할 수 있습니다.
  // ----------------------------------------------------------------
  actions: {
    // --- UI 상태 관리 Actions ---
    setGradeFilter(grade) { this.gradeFilter = grade; },
    openSaleModal(gundamId) { this.itemIdToProcess = gundamId; this.isSaleModalVisible = true; },
    closeSaleModal() { this.isSaleModalVisible = false; this.itemIdToProcess = null; },
    openDetailModal(gundamId) { this.itemIdForDetail = gundamId; this.isDetailModalVisible = true; },
    closeDetailModal() { this.isDetailModalVisible = false; this.itemIdForDetail = null; },

    // --- 데이터 조작 Actions ---
    addGundam(gundamData) {
      const newGundam = {
        id: Date.now(),
        grade: gundamData.grade || 'N/A', name: gundamData.name,
        quantity: gundamData.quantity || 1, purchasePrice: gundamData.purchasePrice || null,
        desiredSalePrice: gundamData.desiredSalePrice || null, purchaseLocation: gundamData.purchaseLocation || '',
        details: gundamData.details || '', imageUrl: gundamData.imageUrl || null,
      };
      this.inStorageList.push(newGundam);
    },
    updateItemDetails(updatedData) {
      const { id } = updatedData;
      if (!id) return;
      const lists = [this.inStorageList, this.forSaleList, this.soldList];
      for (const list of lists) {
        const index = list.findIndex(item => item.id === id);
        if (index !== -1) {
          list[index] = { ...list[index], ...updatedData };
          this.closeDetailModal();
          return;
        }
      }
    },
    deleteGundam(gundamId) {
      const lists = [this.inStorageList, this.forSaleList, this.soldList];
      for (const list of lists) {
        const index = list.findIndex(item => item.id === gundamId);
        if (index !== -1) { list.splice(index, 1); return; }
      }
    },
    moveToSale(gundamId) {
      const index = this.inStorageList.findIndex(g => g.id === gundamId);
      if (index !== -1) {
        const [itemToMove] = this.inStorageList.splice(index, 1);
        this.forSaleList.push(itemToMove);
      }
    },
    moveToStorage(gundamId) {
      const index = this.forSaleList.findIndex(g => g.id === gundamId);
      if (index !== -1) {
        const [itemToMove] = this.forSaleList.splice(index, 1);
        this.inStorageList.push(itemToMove);
      }
    },
    /**
   * 판매 완료 처리 시, 수익금을 계산하여 취미 자금에 자동으로 반영합니다.
   * @param {number} gundamId - 판매 완료 처리할 건담의 ID
   * @param {object} saleDetails - { salePrice, saleMedium } 판매 정보 객체
   */
    markAsSold(gundamId, saleDetails) {
        const index = this.forSaleList.findIndex(g => g.id === gundamId);
        if (index !== -1) {
        const [itemToMove] = this.forSaleList.splice(index, 1);
        
        const soldItem = {
            ...itemToMove,
            ...saleDetails,
        };
        
        this.soldList.push(soldItem);

        // --- [핵심 추가 로직] ---
        // 1. 수익금을 계산합니다. (구매가가 없으면 0으로 처리)
        const profit = (soldItem.salePrice || 0) - (soldItem.purchasePrice || 0);

        // 2. 취미 자금 잔액에 수익금을 더합니다.
        this.hobbyFund.balance += profit;
        
        // 3. 취미 자금 내역에 자동으로 기록을 추가합니다.
        this.hobbyFund.history.unshift({
            date: new Date().toISOString(),
            amount: profit, // 실제 수익금을 기록
            reason: `'${itemToMove.name}' 판매 수익금`, // 사유 자동 생성
        });
        // ------------------------
        
        this.closeSaleModal();
        }
    },

    // --- 자금 관리 Actions ---
    adjustHobbyFund(adjustment) {
      if (!adjustment || typeof adjustment.amount !== 'number' || !adjustment.reason) {
        alert('올바른 입출금 정보(금액, 사유)를 입력해주세요.');
        return;
      }
      this.hobbyFund.balance += adjustment.amount;
      this.hobbyFund.history.unshift({
        date: new Date().toISOString(),
        amount: adjustment.amount,
        reason: adjustment.reason,
      });
    },
    
    // --- 파일 관리 Actions ---
    /**
   * [신규/통합] 현재 모든 목록을 날짜와 시간 기반의 새 엑셀 파일로 저장합니다.
   */
    exportToExcel() {
        if (this.inStorageList.length === 0 && this.forSaleList.length === 0 && this.soldList.length === 0) {
        alert('저장할 데이터가 없습니다.');
        return;
        }

        // --- [핵심] 파일명 생성 로직 (시/분/초 포함) ---
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        const dateTimeString = `${year}${month}${day}_${hours}${minutes}${seconds}`;
        
        const fileName = `${dateTimeString}_gundam_inventory.xlsx`;
        // 예시 파일명: 250714_213055_gundam_inventory.xlsx
        // ---------------------------------------------------

        // 엑셀 시트 생성 로직 (기존과 동일)
        const wsStorage = XLSX.utils.json_to_sheet(this.inStorageList);
        const wsSale = XLSX.utils.json_to_sheet(this.forSaleList);
        const wsSold = XLSX.utils.json_to_sheet(this.soldList);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, wsStorage, '보관목록');
        XLSX.utils.book_append_sheet(workbook, wsSale, '판매목록');
        XLSX.utils.book_append_sheet(workbook, wsSold, '판매완료');
        
        // 생성된 파일명으로 다운로드
        XLSX.writeFile(workbook, fileName);

        alert(`'${fileName}' 파일이 성공적으로 저장되었습니다.`);
    },

    createExcel() {
      if (this.inStorageList.length === 0 && this.forSaleList.length === 0 && this.soldList.length === 0) {
        alert('저장할 데이터가 없습니다.'); return;
      }
      const newFileName = 'gundam_inventory.xlsx';
      const wsStorage = XLSX.utils.json_to_sheet(this.inStorageList);
      const wsSale = XLSX.utils.json_to_sheet(this.forSaleList);
      const wsSold = XLSX.utils.json_to_sheet(this.soldList);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, wsStorage, '보관목록');
      XLSX.utils.book_append_sheet(workbook, wsSale, '판매목록');
      XLSX.utils.book_append_sheet(workbook, wsSold, '판매완료');
      XLSX.writeFile(workbook, newFileName);
      this.loadedFileName = newFileName;
      alert(`'${newFileName}' 파일이 생성되었습니다. 이제부터 '현재 파일에 저장'을 사용하면 이 파일에 덮어쓰게 됩니다.`);
    },

    async loadFromExcel(file) {
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        this.inStorageList = XLSX.utils.sheet_to_json(workbook.Sheets['보관목록'] || []);
        this.forSaleList = XLSX.utils.sheet_to_json(workbook.Sheets['판매목록'] || []);
        this.soldList = XLSX.utils.sheet_to_json(workbook.Sheets['판매완료'] || []);
        // this.loadedFileName = file.name;
        alert(`'${file.name}' 파일을 성공적으로 불러왔습니다.`);
      } catch (error) {
        alert('파일을 읽는 중 오류가 발생했습니다. 파일 형식을 확인해주세요.');
      }
    },

    saveCurrentFile() {
      if (!this.loadedFileName) {
        alert('저장할 파일이 지정되지 않았습니다. 먼저 "파일 불러오기"를 통해 작업할 파일을 선택해주세요.'); return;
      }
      const wsStorage = XLSX.utils.json_to_sheet(this.inStorageList);
      const wsSale = XLSX.utils.json_to_sheet(this.forSaleList);
      const wsSold = XLSX.utils.json_to_sheet(this.soldList);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, wsStorage, '보관목록');
      XLSX.utils.book_append_sheet(workbook, wsSale, '판매목록');
      XLSX.utils.book_append_sheet(workbook, wsSold, '판매완료');
      XLSX.writeFile(workbook, this.loadedFileName);
      alert(`'${this.loadedFileName}' 파일에 현재 목록을 저장했습니다.`);
    },
  },
});
