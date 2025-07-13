<!-- src/components/CollapsibleSection.vue -->

<script setup>
import { ref } from 'vue';

// 1. [Props] 이 컴포넌트를 사용하는 부모로부터 받을 데이터를 정의합니다.
defineProps({
  // 섹션의 제목으로 표시될 문자열
  title: {
    type: String,
    required: true,
  },
});

// 2. [Local State] 컴포넌트 내부에서만 사용할 상태를 정의합니다.
//    섹션이 현재 열려있는지(true) 닫혀있는지(false)를 저장합니다.
const isOpen = ref(true); // 기본적으로 열린 상태로 시작

// 3. [Method] 상태를 반전시키는 함수입니다.
//    isOpen 값을 true -> false, false -> true로 바꿉니다.
const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div class="collapsible-section">
    <!-- 섹션 헤더: 클릭하면 toggleOpen 함수가 실행됩니다. -->
    <header @click="toggleOpen" class="section-header">
      <h2>{{ title }}</h2>
      <!-- isOpen 상태에 따라 화살표 아이콘 모양이 바뀌도록 동적 클래스를 적용합니다. -->
      <span class="toggle-icon" :class="{ 'is-open': isOpen }">▼</span>
    </header>

    <!-- 
      4. [Slot] 이 컴포넌트의 가장 핵심적인 부분입니다.
      - v-if="isOpen"을 통해, isOpen 상태가 true일 때만 내용물이 보이도록 합니다.
      - <slot></slot> 태그는 "부모 컴포넌트가 이 컴포넌트 태그 사이에 넣은 모든 내용물"이
        표시될 자리를 의미합니다. 이 덕분에 어떤 내용이든 감쌀 수 있는 범용 컴포넌트가 됩니다.
    -->
    <div v-if="isOpen" class="section-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.collapsible-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  background-color: #fff;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  user-select: none; /* 텍스트 선택 방지 */
  border-bottom: 1px solid transparent;
}
/* 섹션이 열려있을 때만 헤더 하단에 선이 보이도록 처리 */
.collapsible-section:has(.section-content) .section-header {
  border-bottom-color: #e0e0e0;
}
.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
}
.toggle-icon {
  font-size: 1rem;
  transition: transform 0.3s ease;
}
.toggle-icon.is-open {
  transform: rotate(180deg); /* 아이콘을 180도 회전시켜 위쪽 화살표처럼 보이게 함 */
}
.section-content {
  padding: 1.5rem;
}
</style>
