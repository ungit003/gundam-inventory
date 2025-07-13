// src/stores/inventory.js

import { defineStore } from 'pinia';
import * as XLSX from 'xlsx';

// JSDoc을 사용해 데이터 타입을 명시적으로 정의하면, 코드 가독성과 안정성이 높아집니다.
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
 * @typedef {GundamItem & { salePrice: number; saleMedium: string; }} SoldGundamItem - 판매 완료된 아이템
 */

// 'defineStore'를 사용하여 'inventory'라는 이름의 스토어를 정의합니다[1].
export const useInventoryStore = defineStore('inventory', {
  // ----------------------------------------------------------------
  // 1. state: 애플리케이션의 모든 데이터를 담는 중앙 저장소
  //    '취미 자금' 관리 기능이 추가되고, 초기 데이터는 모두 비워둡니다.
  // ----------------------------------------------------------------
  state: () => ({
    /** @type {GundamItem[]} */
    inStorageList: [], // 보관 목록: 사용자가 보관할 목적으로 가지고 있는 건담들

    /** @type {GundamItem[]} */
    forSaleList: [],   // 판매 목록: 판매를 위해 등록된 건담들

    /** @type {SoldGundamItem[]} */
    soldList: [],      // 판매 완료 목록: 판매가 완료된 건담들

    // 취미 자금 관리 객체
    hobbyFund: {
      balance: 0, // 현재 잔액
      history: [], // 입출금 내역 [{ date, amount, reason }]
    },

    // 검색어나 필터 같은 UI 상태도 여기에 함께 관리합니다.
    searchTerm: '',

    // 현재 선택된 등급 필터를 저장할 state를 추가합니다.
    //    'All'을 기본값으로 설정하여 처음에는 모든 목록이 보이도록 합니다.
    gradeFilter: 'All', 

    // 모달의 열림/닫힘 상태를 관리하는 boolean 값
    isSaleModalVisible: false,
    // 모달에서 처리할 아이템의 ID를 임시 저장하는 값
    itemIdToProcess: null,

    // 초기값은 null로, 아직 아무 파일도 불러오지 않았음을 의미합니다.
    loadedFileName: null,
  }),

  // ----------------------------------------------------------------
  // 2. getters: state를 기반으로 계산된 값을 제공하는 부분 (읽기 전용)
  //    새로운 금융 모델에 맞춰 대대적으로 수정 및 추가됩니다.
  // ----------------------------------------------------------------
  getters: {
    // 이제 총 재고 수량은 '보관'과 '판매' 목록의 합계가 됩니다. (추후 삭제)
    totalInStockCount: (state) => state.inStorageList.length + state.forSaleList.length,

    /**
     * 필터링된 보관 목록을 반환하는 getter입니다.
     * 이 getter는 gradeFilter나 searchTerm이 바뀔 때마다 자동으로 다시 계산됩니다.
     * @param {object} state - 현재 스토어의 state
     * @returns {GundamItem[]} - 필터링된 보관 목록
     */
    filteredInStorageList: (state) => {
      return state.inStorageList.filter(item => {
        // 등급 필터 조건: 필터가 'All'이거나, 아이템의 등급과 필터가 일치하는 경우
        const gradeMatch = state.gradeFilter === 'All' || item.grade === state.gradeFilter;
        // 검색어 필터 조건 (기존 로직)
        const searchMatch = item.name.toLowerCase().includes(state.searchTerm.toLowerCase());
        // 두 조건 모두 만족해야 true를 반환
        return gradeMatch && searchMatch;
      });
    },

    // 판매 목록과 판매 완료 목록도 동일한 로직으로 필터링 getter를 만듭니다.
    filteredForSaleList: (state) => {
      return state.forSaleList.filter(item => {
        const gradeMatch = state.gradeFilter === 'All' || item.grade === state.gradeFilter;
        const searchMatch = item.name.toLowerCase().includes(state.searchTerm.toLowerCase());
        return gradeMatch && searchMatch;
      });
    },

    filteredSoldList: (state) => {
      return state.soldList.filter(item => {
        const gradeMatch = state.gradeFilter === 'All' || item.grade === state.gradeFilter;
        const searchMatch = item.name.toLowerCase().includes(state.searchTerm.toLowerCase());
        return gradeMatch && searchMatch;
      });
    },

    /**
     * '취미 자금'을 계산하는 getter입니다.
     * 보관 목록과 판매 목록에 있는 모든 아이템의 구매 가격을 합산합니다.
     * @param {object} state - 현재 스토어의 state
     * @returns {number} - 계산된 총 구매 가격
     */
    totalPurchasePrice: (state) => {
      // 1. 스프레드(...) 연산자를 사용해 보관 목록과 판매 목록을 하나의 배열로 합칩니다.
      const allStock = [...state.inStorageList, ...state.forSaleList];

      // 2. reduce 메서드를 사용해 합쳐진 배열의 모든 아이템을 순회하며 값을 누적합니다.
      //    - 'sum'은 현재까지 누적된 값 (초기값 0)
      //    - 'item'은 배열의 각 건담 객체
      //    - 'item.purchasePrice || 0'는 purchasePrice가 null이나 undefined일 경우 0으로 처리하여 오류를 방지합니다.
      const total = allStock.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
      
      return total;
    },

    // 모달에 전달할 아이템 객체를 찾아주는 getter
    itemToSell: (state) => {
      // itemIdToProcess가 null이면 아무것도 반환하지 않음
      if (!state.itemIdToProcess) return null;
      // 판매 목록에서 해당 ID를 가진 아이템을 찾아 반환
      return state.forSaleList.find(item => item.id === state.itemIdToProcess);
    },

    // [수정 및 이름 변경] '총 취미 투자금' -> '현재 재고 가치'
    // 보관/판매 목록에 있는 아이템들의 총 구매 가격을 합산합니다.
    currentStockValue: (state) => {
      const allStock = [...state.inStorageList, ...state.forSaleList];
      return allStock.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
    },

    // [신규] 판매 완료 목록의 총 판매 수익을 계산합니다.
    // 이는 '취미 자금'의 잠재적 원천이 됩니다.
    totalProfit: (state) => {
      return state.soldList.reduce((sum, item) => {
        const profit = (item.salePrice || 0) - (item.purchasePrice || 0);
        return sum + profit;
      }, 0);
    },

    // [신규] 총 자산을 계산합니다. (현재 재고 가치 + 현재 취미 자금 잔액)
    totalAssets: (state) => {
      // 다른 getter를 'this'를 통해 참조할 수 있습니다.
      return this.currentStockValue + state.hobbyFund.balance;
    },
  },

  // ----------------------------------------------------------------
  // 3. actions: state를 변경하는 유일한 방법입니다. (Vue의 methods와 유사)
  //    가장 많은 변경이 필요한 부분입니다. 기존 로직을 새로운 구조에 맞게 수정합니다.
  // ----------------------------------------------------------------
  actions: {
    /**
     * 등급 필터 상태를 업데이트하는 액션입니다.
     * @param {string} grade - 사용자가 선택한 등급 ('All', 'HG' 등)
     */
    setGradeFilter(grade) {
      this.gradeFilter = grade;
    },

    /**
     * [수정] 신규 건담 등록 시, 확장된 데이터 구조에 맞춰 추가 정보를 함께 받습니다.
     * @param {Omit<GundamItem, 'id'>} gundamData - id를 제외한 모든 신규 건담 정보
     */
    addGundam(gundamData) {
      const newGundam = {
        id: Date.now(),
        grade: gundamData.grade || 'N/A',
        name: gundamData.name,
        quantity: gundamData.quantity || 1,
        purchasePrice: gundamData.purchasePrice || null,
        // 새로운 필드들의 기본값을 설정합니다.
        desiredSalePrice: gundamData.desiredSalePrice || null,
        purchaseLocation: gundamData.purchaseLocation || '',
        details: gundamData.details || '',
        imageUrl: gundamData.imageUrl || null,
      };
      this.inStorageList.push(newGundam);
    },

    /**
     * [신규] 취미 자금을 수동으로 조정하고, 그 내역을 기록하는 액션입니다.
     * @param {object} adjustment - { amount: number, reason: string }
     */
    adjustHobbyFund(adjustment) {
      if (!adjustment || typeof adjustment.amount !== 'number' || !adjustment.reason) {
        alert('올바른 입출금 정보(금액, 사유)를 입력해주세요.');
        return;
      }
      this.hobbyFund.balance += adjustment.amount;
      this.hobbyFund.history.unshift({ // unshift를 사용해 최신 내역이 위로 오게 합니다.
        date: new Date().toISOString(),
        amount: adjustment.amount,
        reason: adjustment.reason,
      });
    },

    /**
     * 특정 건담을 삭제하는 액션입니다.
     * 이제 어떤 목록에 있는지 먼저 찾은 후, 해당 목록에서 삭제해야 합니다.
     * @param {number} gundamId - 삭제할 건담의 ID
     */
    deleteGundam(gundamId) {
      // 보관 목록에서 찾아보고, 있으면 삭제
      let index = this.inStorageList.findIndex(g => g.id === gundamId);
      if (index !== -1) {
        this.inStorageList.splice(index, 1);
        return; // 찾았으면 함수 종료
      }

      // 판매 목록에서 찾아보고, 있으면 삭제
      index = this.forSaleList.findIndex(g => g.id === gundamId);
      if (index !== -1) {
        this.forSaleList.splice(index, 1);
        return;
      }
      
      // 판매 완료 목록에서도 찾아보고, 있으면 삭제
      index = this.soldList.findIndex(g => g.id === gundamId);
      if (index !== -1) {
        this.soldList.splice(index, 1);
        return;
      }
    },

    /**
     * 보관 목록 -> 판매 목록으로 이동
     * @param {number} gundamId - 이동시킬 건담의 ID
     */
    moveToSale(gundamId) {
      // 1. '보관 목록'에서 해당 ID를 가진 아이템의 인덱스(위치)를 찾습니다.
      const index = this.inStorageList.findIndex(g => g.id === gundamId);
      
      // 2. 아이템을 찾았다면(index가 -1이 아니라면),
      if (index !== -1) {
        // 3. splice를 사용해 '보관 목록'에서 해당 아이템을 제거하고, 그 아이템을 반환받습니다.
        const [itemToMove] = this.inStorageList.splice(index, 1);
        // 4. 반환받은 아이템을 '판매 목록'에 추가(push)합니다.
        this.forSaleList.push(itemToMove);
      }
    },

    /**
     * 판매 목록 -> 보관 목록으로 이동
     * @param {number} gundamId - 이동시킬 건담의 ID
     */
    moveToStorage(gundamId) {
      const index = this.forSaleList.findIndex(g => g.id === gundamId);
      if (index !== -1) {
        const [itemToMove] = this.forSaleList.splice(index, 1);
        this.inStorageList.push(itemToMove);
      }
    },

    /**
     * 판매 목록 -> 판매 완료 목록으로 이동
     * @param {number} gundamId - 판매 완료 처리할 건담의 ID
     */
    markAsSold(gundamId, saleDetails) {
      const index = this.forSaleList.findIndex(g => g.id === gundamId);
      if (index !== -1) {
        const [itemToMove] = this.forSaleList.splice(index, 1);
        
        // 전달받은 판매 정보(saleDetails)를 아이템 객체에 합칩니다.
        const soldItem = {
          ...itemToMove,
          salePrice: saleDetails.salePrice,
          saleMedium: saleDetails.saleMedium,
        };
        
        this.soldList.push(soldItem);
        // 작업이 완료되면 모달을 닫습니다.
        this.closeSaleModal();
      }
    },

    // 4. [신규] 모달을 열기 위한 액션
    openSaleModal(gundamId) {
      this.itemIdToProcess = gundamId; // 처리할 아이템 ID 저장
      this.isSaleModalVisible = true;  // 모달을 보이게 설정
    },
    
    // 5. [신규] 모달을 닫기 위한 액션
    closeSaleModal() {
      this.isSaleModalVisible = false; // 모달을 숨김
      this.itemIdToProcess = null;     // 처리할 아이템 ID 초기화
    },
    // ----------------------------------------------------------------
    // TODO: 아래 액션들은 8단계(다중 시트 엑셀)에서 다시 구현할 예정입니다.
    //       현재 데이터 구조와 맞지 않으므로, 우선 주석 처리하여 오류를 방지합니다.
    // ----------------------------------------------------------------
    /**
     * [수정] 현재 모든 목록 데이터를 3개의 분리된 시트로 구성된 엑셀 파일로 생성합니다.
     */
    createExcel() {
      if (this.inStorageList.length === 0 && this.forSaleList.length === 0 && this.soldList.length === 0) {
        alert('저장할 데이터가 없습니다.');
        return;
      }

      // 1. 생성할 파일의 이름을 상수로 정의하여 관리 용이성을 높입니다.
      const newFileName = 'gundam_inventory.xlsx';

      const wsStorage = XLSX.utils.json_to_sheet(this.inStorageList);
      const wsSale = XLSX.utils.json_to_sheet(this.forSaleList);
      const wsSold = XLSX.utils.json_to_sheet(this.soldList);
      
      const workbook = XLSX.utils.book_new();
      
      XLSX.utils.book_append_sheet(workbook, wsStorage, '보관목록');
      XLSX.utils.book_append_sheet(workbook, wsSale, '판매목록');
      XLSX.utils.book_append_sheet(workbook, wsSold, '판매완료');
      
      // 2. 정의된 이름으로 파일을 다운로드시킵니다.
      XLSX.writeFile(workbook, newFileName);
      
      // 3. --- 핵심 수정 부분 ---
      //    파일 다운로드 직후, 스토어의 loadedFileName 상태를 방금 생성한 파일 이름으로 업데이트합니다.
      //    이것이 바로 "자동으로 불러온 것처럼" 만드는 핵심 로직입니다.
      this.loadedFileName = newFileName;
      // --------------------

      // 4. 사용자에게 변경된 작업 흐름을 명확하게 안내합니다.
      alert(`'${newFileName}' 파일이 생성되었습니다. 이제부터 '현재 파일에 저장'을 사용하면 이 파일에 덮어쓰게 됩니다.`);
    },

    /**
     * [신규/수정] 다중 시트를 가진 엑셀 파일을 읽어 각 목록 state를 채웁니다.
     * @param {File} file - 사용자가 업로드한 엑셀 파일
     */
    async loadFromExcel(file) {
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);

        this.inStorageList = XLSX.utils.sheet_to_json(workbook.Sheets['보관목록'] || []);
        this.forSaleList = XLSX.utils.sheet_to_json(workbook.Sheets['판매목록'] || []);
        this.soldList = XLSX.utils.sheet_to_json(workbook.Sheets['판매완료'] || []);
        
        // --- 핵심 수정 부분 ---
        // 성공적으로 파일을 불러왔을 때, 파일의 이름을 state에 저장합니다.
        this.loadedFileName = file.name;
        // --------------------

        alert(`'${file.name}' 파일을 성공적으로 불러왔습니다.`);

      } catch (error) {
        console.error('파일을 읽는 중 오류가 발생했습니다:', error);
        alert('파일을 읽는 중 오류가 발생했습니다. 파일 형식을 확인해주세요.');
      }
    },

    // 3. [신규] '현재 파일에 저장' 기능을 위한 새로운 액션을 추가합니다.
    saveCurrentFile() {
      // 3-1. 먼저, 저장할 파일 이름(loadedFileName)이 있는지 확인합니다.
      if (!this.loadedFileName) {
        alert('저장할 파일이 지정되지 않았습니다. 먼저 "파일 불러오기"를 통해 작업할 파일을 선택해주세요.');
        return; // 파일 이름이 없으면 함수를 중단합니다.
      }

      // 3-2. 엑셀 파일을 생성하는 로직은 createExcel과 동일합니다.
      const wsStorage = XLSX.utils.json_to_sheet(this.inStorageList);
      const wsSale = XLSX.utils.json_to_sheet(this.forSaleList);
      const wsSold = XLSX.utils.json_to_sheet(this.soldList);
      
      const workbook = XLSX.utils.book_new();
      
      XLSX.utils.book_append_sheet(workbook, wsStorage, '보관목록');
      XLSX.utils.book_append_sheet(workbook, wsSale, '판매목록');
      XLSX.utils.book_append_sheet(workbook, wsSold, '판매완료');
      
      // 3-3. 파일을 다운로드 시킬 때, 저장해 두었던 this.loadedFileName을 사용합니다.
      XLSX.writeFile(workbook, this.loadedFileName);
      alert(`'${this.loadedFileName}' 파일에 현재 목록을 저장했습니다.`);
    },

  },
});
