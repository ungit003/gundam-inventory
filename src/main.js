// src/main.js

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './assets/main.css';

// 1. createApp과 createPinia를 실행하여 앱과 Pinia 인스턴스를 생성합니다.
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// ======================================================
// [핵심 추가] localStorage 자동 저장 및 복원 로직
// ======================================================
// 2. 다른 스토어들을 가져옵니다.
import { useInventoryStore } from './stores/inventoryStore';
import { useFinancialStore } from './stores/financialStore';
import { useUiStore } from './stores/uiStore';

// 3. localStorage에 사용할 고유한 키(key)를 정의합니다.
const INVENTORY_STORAGE_KEY = 'gundam_inventory_data';
const FINANCIAL_STORAGE_KEY = 'gundam_financial_data';
const UI_STORAGE_KEY = 'gundam_ui_data';

// 4. 앱이 마운트되기 전에, 가장 먼저 localStorage에서 데이터를 복원합니다.
try {
  // financialStore 복원
  const financialData = localStorage.getItem(FINANCIAL_STORAGE_KEY);
  if (financialData) {
    const financialStore = useFinancialStore();
    financialStore.$patch(JSON.parse(financialData));
  }
  
  // inventoryStore 복원
  const inventoryData = localStorage.getItem(INVENTORY_STORAGE_KEY);
  if (inventoryData) {
    const inventoryStore = useInventoryStore();
    inventoryStore.$patch(JSON.parse(inventoryData));
  }

  // uiStore 복원
  const uiData = localStorage.getItem(UI_STORAGE_KEY);
  if (uiData) {
    const uiStore = useUiStore();
    uiStore.$patch(JSON.parse(uiData));
  }
} catch (error) {
  console.error('localStorage에서 데이터를 복원하는 중 오류 발생:', error);
}

// 5. 각 스토어의 상태 변화를 구독(subscribe)하고, 변경될 때마다 localStorage에 저장합니다.
// 5-1. financialStore 구독
const financialStore = useFinancialStore();
financialStore.$subscribe((mutation, state) => {
  localStorage.setItem(FINANCIAL_STORAGE_KEY, JSON.stringify(state));
});

// 5-2. inventoryStore 구독
const inventoryStore = useInventoryStore();
inventoryStore.$subscribe((mutation, state) => {
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(state));
});

// 5-3. uiStore 구독
const uiStore = useUiStore();
uiStore.$subscribe((mutation, state) => {
  localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(state));
});
// 6. 모든 설정이 끝난 후 앱을 마운트합니다.
app.mount('#app');
