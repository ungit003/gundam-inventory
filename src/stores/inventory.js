// src/stores/inventory.js

// 1. Pinia에서 스토어를 정의하는 'defineStore' 함수를 가져옵니다.
import { defineStore } from 'pinia';

// 2. 'defineStore' 함수를 호출하여 스토어를 생성합니다.
//    - 첫 번째 인자('inventory'): 스토어의 고유한 이름(ID)입니다. 나중에 다른 파일에서 이 이름으로 스토어를 불러옵니다.
//    - 두 번째 인자(객체): 스토어의 내용을 정의합니다. (state, getters, actions)
export const useInventoryStore = defineStore('inventory', {
  // 3. state: 컴포넌트의 'data'와 같은 역할입니다.
  //    모두가 함께 사용할 중앙 데이터를 이곳에 정의합니다.
  state: () => ({
    gundams: [
      { id: 1, grade: 'MG', name: '스트라이크 프리덤', quantity: 1, status: '보관' },
      { id: 2, grade: 'HG', name: '에어리얼', quantity: 2, status: '판매' },
      { id: 3, grade: 'RG', name: '사자비', quantity: 1, status: '보관' },
    ],
  }),

  // 4. getters: 컴포넌트의 'computed'와 같은 역할입니다.
  //    state의 데이터를 기반으로 계산된 값을 만들 때 사용합니다.
  getters: {
    // state를 매개변수로 받아 총 재고 수를 계산합니다.
    totalCount: (state) => state.gundams.length,
    // 보관 중인 건담만 필터링하여 반환합니다.
    inStockGundams: (state) => state.gundams.filter(g => g.status === '보관'),
  },

  // 5. actions: 컴포넌트의 'methods'와 같은 역할입니다.
  //    state를 변경하는 모든 로직은 actions 안에 함수로 정의하는 것이 좋습니다.
  actions: {
    addGundam(gundamData) {
      const newGundam = {
        ...gundamData,
        id: Date.now(), // 고유 ID 생성
      };
      // 'this'는 state를 가리킵니다. this.gundams 배열에 새 데이터를 추가합니다.
      this.gundams.push(newGundam);
    },

    deleteGundam(gundamId) {
      // 전달받은 id와 일치하지 않는 건담들만 남겨서 배열을 새로 만듭니다.
      this.gundams = this.gundams.filter(gundam => gundam.id !== gundamId);
    },
  },
});
