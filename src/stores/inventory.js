// src/stores/inventory.js

// 1. Pinia에서 스토어를 정의하는 'defineStore' 함수를 가져옵니다.
import { defineStore } from 'pinia';
// 1. xlsx 라이브러리를 가져옵니다.
import * as XLSX from 'xlsx';

// 2. 'defineStore' 함수를 호출하여 스토어를 생성합니다.
//    - 첫 번째 인자('inventory'): 스토어의 고유한 이름(ID)입니다. 나중에 다른 파일에서 이 이름으로 스토어를 불러옵니다.
//    - 두 번째 인자(객체): 스토어의 내용을 정의합니다. (state, getters, actions)
export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    // 처음에는 빈 배열로 시작합니다.
    gundams: [],
    // 1. 검색어를 저장할 state를 추가합니다.
    searchTerm: '',
  }),

  // 4. getters: 컴포넌트의 'computed'와 같은 역할입니다.
  //    state의 데이터를 기반으로 계산된 값을 만들 때 사용합니다.
  getters: {
    // state를 매개변수로 받아 총 재고 수를 계산합니다.
    totalCount: (state) => state.gundams.length,
    // 2. 검색 기능을 위한 새로운 getter를 추가합니다.
    filteredGundams(state) {
      // 검색어가 없으면 전체 목록을 반환합니다.
      if (!state.searchTerm.trim()) {
        return state.gundams;
      }
      // 검색어가 있으면, 건담 이름(name)에 검색어가 포함된 항목만 필터링합니다.
      // toLowerCase()를 사용해 대소문자 구분 없이 검색합니다.
      const lowerCaseSearchTerm = state.searchTerm.toLowerCase();
      return state.gundams.filter(gundam => 
        gundam.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    },
  },

  // 5. actions: 컴포넌트의 'methods'와 같은 역할입니다.
  //    state를 변경하는 모든 로직은 actions 안에 함수로 정의하는 것이 좋습니다.
  actions: {
    // 2. async 키워드를 붙여 비동기 액션을 정의합니다.
    async loadFromExcel(file) {
      // file.arrayBuffer()는 Promise를 반환하므로 await로 기다립니다.
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // 엑셀 시트를 JSON 배열 형태로 변환합니다.
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // 읽어온 데이터로 state를 완전히 교체합니다.
      this.gundams = jsonData;
    },

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
