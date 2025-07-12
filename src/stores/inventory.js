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
  }),

  // ----------------------------------------------------------------
  // 2. getters: state를 기반으로 계산된 값을 제공합니다. (Vue의 computed와 유사)
  //    기존 state 구조가 바뀌었으므로, getters도 그에 맞게 수정해야 합니다.
  // ----------------------------------------------------------------
  getters: {
    // 이제 총 재고 수량은 '보관'과 '판매' 목록의 합계가 됩니다.
    totalInStockCount: (state) => state.inStorageList.length + state.forSaleList.length,

    // 필터링 기능은 2단계에서 각 목록 컴포넌트로 이전하거나 더 복잡한 getter로 만들 예정입니다.
    // 우선은 각 목록을 그대로 반환하는 간단한 형태로 둡니다.
    getInStorageList: (state) => state.inStorageList,
    getForSaleList: (state) => state.forSaleList,
    getSoldList: (state) => state.soldList,
  },

  // ----------------------------------------------------------------
  // 3. actions: state를 변경하는 유일한 방법입니다. (Vue의 methods와 유사)
  //    가장 많은 변경이 필요한 부분입니다. 기존 로직을 새로운 구조에 맞게 수정합니다.
  // ----------------------------------------------------------------
  actions: {
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
