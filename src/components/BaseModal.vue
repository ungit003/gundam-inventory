<!-- src/components/BaseModal.vue -->

<script setup>
defineProps({
  show: { type: Boolean, default: false },
});
const emit = defineEmits(['close']);
</script>

<template>
  <!-- 
    [Teleport]
    이 컴포넌트의 전체 내용을 DOM 트리의 'body' 태그 바로 아래로 이동시킵니다.
    이를 통해 다른 컴포넌트의 CSS 스타일에 영향을 받지 않는 독립적인 레이어를 만듭니다.
  -->
  <teleport to="body">
    <div v-if="show" class="modal-backdrop" @click.self="emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <!-- 'header'라는 이름의 슬롯. 부모가 이 부분을 채울 수 있습니다. -->
          <slot name="header">기본 헤더</slot>
        </div>
        <div class="modal-body">
          <slot name="body">기본 바디</slot>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <button @click="emit('close')">닫기</button>
          </slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
/* 이 스타일은 기존 ItemDetailModal 등에서 사용하던 모달 스타일과 거의 동일합니다. */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.modal-container {
  width: 90%; max-width: 400px;
  background-color: white; border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex; flex-direction: column;
}
.modal-header, .modal-body, .modal-footer { padding: 1.5rem; }
.modal-header {
  border-bottom: 1px solid #eee;
  font-size: 1.25rem; font-weight: bold;
}
.modal-body { color: #333; }
.modal-footer {
  border-top: 1px solid #eee;
  display: flex; justify-content: flex-end; gap: 0.5rem;
}
.modal-footer button {
  padding: 0.6rem 1.2rem; border-radius: 4px;
  border: none; cursor: pointer;
}
</style>
