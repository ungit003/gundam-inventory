// src/stores/financialStore.js

import { defineStore } from 'pinia';
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
 * @property {string[]} imageUrls - 이미지 URL들을 담을 문자열 배열
 * @property {number | null} shippingCost - 배송비 (구매 또는 판매 시 발생)
 * @property {number | null} otherFees - 기타 수수료 (플랫폼 수수료 등)
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
    /**
     * 누적 판매 수익을 계산합니다.
     * 이제 부대비용(배송비, 기타 수수료)까지 모두 차감하여 실제 순수익을 계산합니다.
     */
    totalProfit: () => {
      const inventoryStore = useInventoryStore();
      
      // soldList의 각 아이템에 대해 reduce 연산을 수행합니다.
      return inventoryStore.soldList.reduce((sum, item) => {
        // 1. 각 비용 항목에 대해, 값이 없거나 null일 경우 0으로 처리하여 계산 오류를 방지합니다.
        const salePrice = item.salePrice || 0;
        const purchasePrice = item.purchasePrice || 0;
        const shippingCost = item.shippingCost || 0;
        const otherFees = item.otherFees || 0;
        
        // 2. 한 아이템의 실제 순수익을 계산합니다.
        const itemProfit = salePrice - purchasePrice - shippingCost - otherFees;
        
        // 3. 계산된 순수익을 누적 합계(sum)에 더합니다.
        return sum + itemProfit;
      }, 0); // 초기 누적 합계는 0으로 시작합니다.
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
    /**
     * [신규] '보관 목록'에 있는 모든 아이템의 '구매 가격'을 합산합니다.
     * @returns {number} - 계산된 보관 목록 총 구매 가격
     */
    inStorageTotalPurchaseValue: () => {
      const inventoryStore = useInventoryStore();
      return inventoryStore.inStorageList.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
    },
    /**
     * [신규] '판매 완료 목록'에 있는 모든 아이템의 '실제 판매 가격'을 합산합니다.
     * @returns {number} - 계산된 판매 완료 목록 총 판매 가격
     */
    soldTotalSaleValue: () => {
      const inventoryStore = useInventoryStore();
      return inventoryStore.soldList.reduce((sum, item) => sum + (item.salePrice || 0), 0);
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

    /**
     * '판매 취소' 시, 발생했던 수익금을 회수하고 내역을 기록하는 액션입니다.
     * @param {SoldGundamItem} revertedItem - 판매가 취소된 아이템 객체
     */
    revertSaleProfit(revertedItem) {
      // 1. 취소된 아이템의 순수익을 계산합니다. (1-1단계에서 추가한 부대비용을 포함할 수 있습니다)
      const profitToRevert = (revertedItem.salePrice || 0) - (revertedItem.purchasePrice || 0);

      // 2. 현재 취미 자금 잔액에서 해당 수익금을 차감합니다.
      this.hobbyFund.balance -= profitToRevert;

      // 3. 취미 자금 내역에 '판매 취소' 기록을 추가합니다.
      this.hobbyFund.history.unshift({
        date: new Date().toISOString(),
        amount: -profitToRevert, // 차감된 금액이므로 음수로 기록합니다.
        reason: `'${revertedItem.name}' 판매 취소`,
      });
    },
  },
});
