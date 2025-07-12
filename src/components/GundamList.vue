<!-- src/components/GundamList.vue -->

<script setup>
// 이 영역에는 나중에 컴포넌트의 동작 로직(JavaScript)을 작성합니다.
// 1. Pinia에서 storeToRefs 함수와, 우리가 만든 스토어를 가져옵니다.
import { storeToRefs } from 'pinia';
import { useInventoryStore } from '../stores/inventory';

// 2. useInventoryStore 함수를 실행하여 스토어 인스턴스를 가져옵니다.
const store = useInventoryStore();

// 3. storeToRefs를 사용하면 스토어의 state와 getters를 반응성을 유지한 채로 가져올 수 있습니다.
//    이렇게 구조 분해 할당을 하면 template에서 'gundams.value' 대신 'gundams'로 바로 사용할 수 있어 편리합니다.
const { gundams, totalCount } = storeToRefs(store);

// props를 받는 코드는 더 이상 필요 없으므로 삭제합니다. (defineProps)
</script>

<template>
  <!-- 이 영역에는 컴포넌트의 화면 구조(HTML)를 작성합니다. -->
  <div class="gundam-list-container">
    <!-- getters로 만든 totalCount를 사용합니다. -->
    <h2>재고 목록 (총 {{ totalCount }}개)</h2>
    <table>
      <thead>
        <tr>
          <th>등급</th>
          <th>이름</th>
          <th>수량</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <!-- 
          props.gundams가 아닌, 스토어에서 직접 가져온 gundams를 사용합니다.
          동작 방식은 동일합니다.
        -->
        <tr v-for="gundam in gundams" :key="gundam.id">
          <td>{{ gundam.grade }}</td>
          <td>{{ gundam.name }}</td>
          <td>{{ gundam.quantity }}</td>
          <td>{{ gundam.status }}</td>
          <!-- 
            4. 삭제 버튼 클릭 시, 스토어의 deleteGundam 액션을 직접 호출합니다.
               이때 삭제할 건담의 id를 인자로 넘겨줍니다.
          -->
          <td><button @click="store.deleteGundam(gundam.id)">삭제</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* 
  'scoped' 속성은 이 스타일이 현재 컴포넌트(GundamList.vue)에만
  적용되도록 만들어 줍니다. 다른 컴포넌트에 영향을 주지 않아 안전합니다.
*/
.gundam-list-container {
  margin-top: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
}
</style>
