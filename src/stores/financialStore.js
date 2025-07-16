// src/stores/financialStore.js

import { defineStore } from 'pinia';
// inventoryStore의 데이터를 참조해야 하므로 가져옵니다.
import { useInventoryStore } from './inventoryStore';

// 다른 파일에서도 이 타입을 참조할 수 있도록 export 합니다.
/**
 * @typedef {Object} GundamItem - 기본적인 건담 아이템의 타입 정의
 * @property {number} id
 * @property {string} grade
 * @property {string} name
 * @property {number} quantity
 * @property {number | null} purchasePrice
 * @property {number | null} desiredSalePrice
 * @property {string} purchaseLocation
 * @property {string} details
 * @property {string | null} imageUrl
 */
/**
 * @typedef {GundamItem & { salePrice: number; saleMedium: string; }} SoldGundamItem
 */

// 스토어 ID를 'financial'로 정의합니다.
export const useFinancialStore = defineStore('financial', {
  state: () => ({
    // --- 금융 데이터 ---
    hobbyFund: {
      balance: 0,
      history: [], // { date, amount, reason }
    },
  }),

  getters: {
    // --- 금융 정보 계산 Getters ---
    /**
     * [핵심: 스토어 간 참조]
     * 현재 재고 가치를 계산하기 위해 inventoryStore의 state를 참조합니다.
     */
    currentStockValue: () => {
      const inventoryStore = useInventoryStore();
      const allStock = [...inventoryStore.inStorageList, ...inventoryStore.forSaleList];
      return allStock.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
    },
    totalProfit: () => {
      const inventoryStore = useInventoryStore();
      return inventoryStore.soldList.reduce((sum, item) => sum + ((item.salePrice || 0) - (item.purchasePrice || 0)), 0);
    },
    estimatedTotalSaleValue: () => {
      const inventoryStore = useInventoryStore();
      return inventoryStore.forSaleList.reduce((sum, item) => sum + (item.desiredSalePrice || 0), 0);
    },
    /**
     * 총 자산 = 현재 취미 자금 잔액 + 현재 재고 가치
     * getter 내부에서 다른 getter를 'this'로 참조할 수 있습니다.
     */
    totalAssets(state) {
      return state.hobbyFund.balance + this.currentStockValue;
    },
  },

  actions: {
    // --- 자금 관리 Actions ---
    adjustHobbyFund(adjustment) {
      this.hobbyFund.balance += adjustment.amount;
      this.hobbyFund.history.unshift({
        date: new Date().toISOString(),
        amount: adjustment.amount,
        reason: adjustment.reason,
      });
    },

    /**
     * 판매로 인한 수익금을 계산하고 자금 내역에 기록하는 전문 액션입니다.
     * @param {SoldGundamItem} soldItem - 판매 완료된 아이템 객체
     */
    recordSaleProfit(soldItem) {
      const profit = (soldItem.salePrice || 0) - (soldItem.purchasePrice || 0);
      this.hobbyFund.balance += profit;
      this.hobbyFund.history.unshift({
        date: new Date().toISOString(),
        amount: profit,
        reason: `'${soldItem.name}' 판매 수익금`,
      });
    },
  },
});
