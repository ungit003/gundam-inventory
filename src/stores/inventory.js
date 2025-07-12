// src/stores/inventory.js

import { defineStore } from 'pinia';
import * as XLSX from 'xlsx';

/**
 * @typedef {Object} GundamItem - 기본적인 건담 아이템의 타입 정의
 * @property {number} id - 고유 ID
 * @property {string} grade - 등급 (HG, MG 등)
 * @property {string} name - 이름
 * @property {number} quantity - 수량
 * @property {number} purchasePrice - 구매 가격
 */

/**
 * @typedef {GundamItem & { salePrice: number; saleMedium: string; }} SoldGundamItem - 판매 완료된 아이템
 */

// 'defineStore'를 사용하여 'inventory'라는 이름의 스토어를 정의합니다[1].
export const useInventoryStore = defineStore('inventory', {
  // ----------------------------------------------------------------
  // 1. state: 데이터의 중심. 기존의 gundams 배열 하나를 세 개로 분리합니다.
  //    이제 모든 데이터는 이 세 개의 목록 중 하나에 속하게 됩니다.
  // ----------------------------------------------------------------
  state: () => ({
    /** @type {GundamItem[]} */
    inStorageList: [], // 보관 목록: 사용자가 보관할 목적으로 가지고 있는 건담들

    /** @type {GundamItem[]} */
    forSaleList: [],   // 판매 목록: 판매를 위해 등록된 건담들

    /** @type {SoldGundamItem[]} */
    soldList: [],      // 판매 완료 목록: 판매가 완료된 건담들

    // 검색어나 필터 같은 UI 상태도 여기에 함께 관리합니다.
    searchTerm: '',

    // 1. [신규] 현재 선택된 등급 필터를 저장할 state를 추가합니다.
    //    'All'을 기본값으로 설정하여 처음에는 모든 목록이 보이도록 합니다.
    gradeFilter: 'All', 
  }),

  // ----------------------------------------------------------------
  // 2. getters: state를 기반으로 계산된 값을 제공합니다. (Vue의 computed와 유사)
  //    기존 state 구조가 바뀌었으므로, getters도 그에 맞게 수정해야 합니다.
  // ----------------------------------------------------------------
  getters: {
    // 이제 총 재고 수량은 '보관'과 '판매' 목록의 합계가 됩니다.
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
     * [신규] '취미 자금'을 계산하는 getter입니다.
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
     * 신규 건담을 등록하는 액션입니다.
     * 이제 새로운 건담은 기본적으로 '보관 목록(inStorageList)'에 추가됩니다.
     * @param {Omit<GundamItem, 'id'>} gundamData - id가 없는 신규 건담 데이터
     */
    addGundam(gundamData) {
      const newGundam = {
        ...gundamData,
        id: Date.now(), // 고유 ID 생성
      };
      this.inStorageList.push(newGundam);
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
     * [신규 액션 1] 보관 목록 -> 판매 목록으로 이동
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
     * [신규 액션 2] 판매 목록 -> 보관 목록으로 이동
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
     * [신규 액션 3] 판매 목록 -> 판매 완료 목록으로 이동
     * @param {number} gundamId - 판매 완료 처리할 건담의 ID
     */
    markAsSold(gundamId) {
      // (참고) 7단계에서는 이 액션이 판매 가격 등을 입력받는 모달과 연동되도록 확장됩니다.
      // 지금은 단순 이동 기능만 구현합니다.
      const index = this.forSaleList.findIndex(g => g.id === gundamId);
      if (index !== -1) {
        const [itemToMove] = this.forSaleList.splice(index, 1);
        
        // '판매 완료 목록'에 맞는 데이터 구조로 변환합니다.
        const soldItem = {
          ...itemToMove,
          salePrice: itemToMove.salePrice || null, // 기존에 값이 없었으므로 null로 설정
          saleMedium: itemToMove.saleMedium || '미지정', // '미지정'으로 초기값 설정
        };
        
        this.soldList.push(soldItem);
      }
    },
    // ----------------------------------------------------------------
    // TODO: 아래 액션들은 8단계(다중 시트 엑셀)에서 다시 구현할 예정입니다.
    //       현재 데이터 구조와 맞지 않으므로, 우선 주석 처리하여 오류를 방지합니다.
    // ----------------------------------------------------------------
    // async loadFromExcel(file) { ... },
    // createExcel() { ... },
  },
});
