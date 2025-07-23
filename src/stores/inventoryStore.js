// src/stores/inventoryStore.js

import { defineStore } from 'pinia';

import * as XLSX from 'xlsx';
// [핵심] 다른 스토어와 통신하기 위해 해당 스토어를 가져옵니다.
import { useFinancialStore } from './financialStore';
import { useUiStore } from './uiStore';

// 데이터 타입 정의는 각 파일에서 필요에 따라 선언하거나, 별도의 types.js 파일로 분리할 수 있습니다.
/** @typedef {import('./financialStore').GundamItem} GundamItem */
/** @typedef {import('./financialStore').SoldGundamItem} SoldGundamItem */

// 스토어 ID를 'inventory'로 정의합니다.
export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    // --- 재고 데이터 ---
    /** @type {GundamItem[]} */
    inStorageList: [],
    /** @type {GundamItem[]} */
    forSaleList: [],
    /** @type {SoldGundamItem[]} */
    soldList: [],
  }),

  getters: {
    /**
     * [핵심 리팩토링] 필터링된 보관 목록 Getter
     * 이제 inventoryStore의 getter가 uiStore의 상태(searchTerm, gradeFilter)를
     * 직접 참조하여, 최종적으로 화면에 표시될 목록을 계산하고 제공합니다.
     * App.vue는 이 계산 과정을 전혀 알 필요가 없습니다.
     * @returns {GundamItem[]}
     */
    filteredInStorageList: (state) => {
      // getter 내부에서 다른 스토어를 호출하여 필터링 조건을 가져옵니다.
      const uiStore = useUiStore();
      const { searchTerm, gradeFilter } = uiStore;

      return state.inStorageList.filter(item => {
        const gradeMatch = gradeFilter === 'All' || item.grade === gradeFilter;
        // 검색어가 없으면 등급 필터만 적용합니다.
        if (!searchTerm.trim()) return gradeMatch;

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        // 여러 필드를 종합하여 검색합니다.
        const searchMatch = 
          item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.grade.toLowerCase().includes(lowerCaseSearchTerm) ||
          (item.purchaseLocation && item.purchaseLocation.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (item.details && item.details.toLowerCase().includes(lowerCaseSearchTerm));
        
        return gradeMatch && searchMatch;
      });
    },

    // 판매 목록과 판매 완료 목록도 동일한 방식으로 필터링 로직을 구현합니다.
    filteredForSaleList: (state) => {
      const uiStore = useUiStore();
      return state.forSaleList.filter(item => {
        const gradeMatch = uiStore.gradeFilter === 'All' || item.grade === uiStore.gradeFilter;
        if (!uiStore.searchTerm.trim()) return gradeMatch;
        const lowerCaseSearchTerm = uiStore.searchTerm.toLowerCase();
        const searchMatch = 
          item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.grade.toLowerCase().includes(lowerCaseSearchTerm) ||
          (item.purchaseLocation && item.purchaseLocation.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (item.details && item.details.toLowerCase().includes(lowerCaseSearchTerm));
        return gradeMatch && searchMatch;
      });
    },
    filteredSoldList: (state) => {
      const uiStore = useUiStore();
      return state.soldList.filter(item => {
        const gradeMatch = uiStore.gradeFilter === 'All' || item.grade === uiStore.gradeFilter;
        if (!uiStore.searchTerm.trim()) return gradeMatch;
        const lowerCaseSearchTerm = uiStore.searchTerm.toLowerCase();
        const searchMatch = 
          item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.grade.toLowerCase().includes(lowerCaseSearchTerm) ||
          (item.purchaseLocation && item.purchaseLocation.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (item.details && item.details.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (item.saleMedium && item.saleMedium.toLowerCase().includes(lowerCaseSearchTerm));
        return gradeMatch && searchMatch;
      });
    },

    // 상세 모달에 표시할 아이템을 찾아 반환하는 getter입니다.
    // 모든 목록을 검색해야 하므로, 이 스토어에 남아있는 것이 적합합니다.
    itemForDetail: (state) => (itemId) => {
      if (!itemId) return null;
      const allItems = [...state.inStorageList, ...state.forSaleList, ...state.soldList];
      return allItems.find(item => item.id === itemId) || null;
    }
  },

  actions: {
    // --- 데이터 조작 Actions ---
    addGundam(gundamData) {
      const newGundam = {
        id: Date.now(),
        grade: gundamData.grade || 'N/A',
        name: gundamData.name,
        quantity: gundamData.quantity || 1,
        purchasePrice: gundamData.purchasePrice || null,
        desiredSalePrice: gundamData.desiredSalePrice || null,
        purchaseLocation: gundamData.purchaseLocation || '',
        details: gundamData.details || '',
        imageUrls: [], 
        // --- [핵심 추가] ---
        // 새로운 필드들의 기본값을 null로 설정합니다.
        shippingCost: null,
        otherFees: null,
        // -------------------
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
     * [핵심: 스토어 간 통신]
     * 판매 완료 처리는 재고 이동과 금융 처리가 모두 필요합니다.
     * 1. 이 곳(inventoryStore)에서 재고를 이동시킵니다.
     * 2. financialStore의 액션을 호출하여 금융 기록을 처리합니다.
     */
    // 판매 완료 처리는 재고 이동과 금융 처리가 모두 필요하므로,
    // financialStore를 호출하여 협력합니다.
    markAsSold(gundamId, saleDetails) {
    const financialStore = useFinancialStore();
    // [추가] uiStore 인스턴스를 가져옵니다.
    const uiStore = useUiStore();

    const index = this.forSaleList.findIndex(g => g.id === gundamId);
      if (index !== -1) {
        const [itemToMove] = this.forSaleList.splice(index, 1);
        const soldItem = { ...itemToMove, ...saleDetails };
        this.soldList.push(soldItem);
        
        financialStore.recordSaleProfit(soldItem);

        // --- [핵심 수정] ---
        // 모든 처리가 끝난 후, uiStore의 액션을 호출하여 모달을 닫습니다.
        uiStore.closeSaleModal();
        // --------------------
      }
    },
    
    exportToExcel() {
      try {
        const financialStore = useFinancialStore();
        if (this.inStorageList.length === 0 && this.forSaleList.length === 0 && this.soldList.length === 0) {
          alert('저장할 데이터가 없습니다.'); return;
        }

        const now = new Date();
        const dateTimeString = `${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
        const fileName = `${dateTimeString}_gundam_inventory.xlsx`;

        const stringifyImageUrls = (list) => 
        list.map(item => ({
          ...item,
          imageUrls: JSON.stringify(item.imageUrls || []), // 배열이 없으면 빈 배열로 처리
        }));
        
        const wsStorage = XLSX.utils.json_to_sheet(this.inStorageList);
        const wsSale = XLSX.utils.json_to_sheet(this.forSaleList);
        const wsSold = XLSX.utils.json_to_sheet(this.soldList);
        const wsFundSummary = XLSX.utils.json_to_sheet([{
          '현재 취미 자금 잔액': financialStore.hobbyFund.balance
        }]);
        const wsFundHistory = XLSX.utils.json_to_sheet(financialStore.hobbyFund.history);
          
        const fundDataToSave = {
          ...financialStore.hobbyFund,
          history: JSON.stringify(financialStore.hobbyFund.history, null, 2),
        };
        const wsFund = XLSX.utils.json_to_sheet([fundDataToSave]);
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, wsStorage, '보관목록');
        XLSX.utils.book_append_sheet(workbook, wsSale, '판매목록');
        XLSX.utils.book_append_sheet(workbook, wsSold, '판매완료');
        XLSX.utils.book_append_sheet(workbook, wsFundSummary, '자금요약');
        XLSX.utils.book_append_sheet(workbook, wsFundHistory, '취미자금내역');
        
        XLSX.writeFile(workbook, fileName);
        alert(`'${fileName}' 파일이 성공적으로 저장되었습니다.`);
      } catch (error) {
        console.error("엑셀 저장 중 오류:", error);
        alert("엑셀 파일을 저장하는 도중 오류가 발생했습니다. 개발자 콘솔을 확인해주세요.");
      }
    },

    async loadFromExcel(file) {
      const financialStore = useFinancialStore();
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);

        const storageSheet = workbook.Sheets['보관목록'];
        this.inStorageList = storageSheet ? XLSX.utils.sheet_to_json(storageSheet) : [];
        const saleSheet = workbook.Sheets['판매목록'];
        this.forSaleList = saleSheet ? XLSX.utils.sheet_to_json(saleSheet) : [];
        const soldSheet = workbook.Sheets['판매완료'];
        this.soldList = soldSheet ? XLSX.utils.sheet_to_json(soldSheet) : [];
        
        const summarySheet = workbook.Sheets['자금요약'];
        const historySheet = workbook.Sheets['취미자금내역'];
        
        const summaryData = summarySheet ? XLSX.utils.sheet_to_json(summarySheet) : [];
        const historyData = historySheet ? XLSX.utils.sheet_to_json(historySheet) : [];

        // 자금 요약 시트에서 잔액을 읽어옵니다.
        const balance = (summaryData[0] && summaryData[0]['현재 취미 자금 잔액']) || 0;
        
        // financialStore의 hobbyFund 상태를 완전히 복원합니다.
        financialStore.hobbyFund = {
          balance: balance,
          history: historyData,
        };
        
        alert(`'${file.name}' 파일을 성공적으로 불러왔습니다.`);
      } catch (error) {
        console.error("엑셀 불러오기 중 오류:", error);
        alert("파일을 읽는 중 오류가 발생했습니다. 파일 형식이 올바른지 확인해주세요.");
      }
    },

    /**
     * '판매 취소'를 처리하는 메인 액션입니다.
     * @param {number} soldItemId - 판매를 취소할 아이템의 ID
     */
    revertSale(soldItemId) {
      // 협력할 financialStore의 인스턴스를 가져옵니다.
      const financialStore = useFinancialStore();

      // 1. '판매 완료' 목록에서 해당 아이템을 찾습니다.
      const index = this.soldList.findIndex(item => item.id === soldItemId);
      if (index !== -1) {
        // 2. splice를 사용해 목록에서 아이템을 제거하고, 그 아이템을 반환받습니다.
        const [itemToRevert] = this.soldList.splice(index, 1);

        // 3. 되돌릴 아이템에서 판매 관련 정보(salePrice, saleMedium)를 제거하여
        //    깨끗한 '판매 목록' 아이템으로 만듭니다.
        //    (나머지 속성들은 그대로 유지됩니다)
        const { salePrice, saleMedium, ...revertedItem } = itemToRevert;

        // 4. 깨끗해진 아이템을 '판매 목록'에 다시 추가합니다.
        this.forSaleList.push(revertedItem);

        // 5. 금융 전문가(financialStore)에게, 원래의 판매 정보가 담긴 아이템을 전달하여
        //    수익 취소 기록을 처리하도록 위임(호출)합니다.
        financialStore.revertSaleProfit(itemToRevert);
      }
    },
  },
});
