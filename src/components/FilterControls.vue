<!-- src/components/FilterControls.vue -->

<script setup>
import { storeToRefs } from 'pinia';
import { useInventoryStore } from '../stores/inventory';

const store = useInventoryStore();

// 1. 스토어의 gradeFilter 상태를 가져와 UI와 연결합니다.
const { gradeFilter } = storeToRefs(store);

// 2. 필터링할 등급 목록을 정의합니다. 'All'을 추가하여 전체보기를 구현합니다.
const gradeOptions = ['All', 'HG', 'RG', 'MG', 'PG', 'SD', 'RE/100', 'Hi-RM', 'Mega', '완성품'];
</script>

<template>
  <div class="filter-controls">
    <div class="filter-group">
      <span class="filter-label">등급 필터:</span>
      <!-- 
        3. 등급 목록을 순회하며 필터 버튼들을 생성합니다.
        - @click: 버튼 클릭 시 store의 setGradeFilter 액션을 호출하여 필터 상태를 변경합니다.
        - :class: 현재 선택된 필터(gradeFilter)와 버튼의 등급이 일치하면 'active' 클래스를 적용합니다.
      -->
      <button
        v-for="grade in gradeOptions"
        :key="grade"
        @click="store.setGradeFilter(grade)"
        :class="{ active: gradeFilter === grade }"
        class="filter-button"
      >
        {{ grade }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-controls {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f0f4f8;
  border-radius: 8px;
}
.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.filter-label {
  font-weight: bold;
  margin-right: 1rem;
}
.filter-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 20px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-button.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
  font-weight: bold;
}
</style>
