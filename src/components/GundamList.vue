<!-- src/components/GundamList.vue -->

<script setup>
// 이 영역에는 나중에 컴포넌트의 동작 로직(JavaScript)을 작성합니다.
// 1. 'defineProps'를 사용해 부모 컴포넌트로부터 어떤 데이터를 받을지 정의합니다.
// 이 컴포넌트는 'gundams'라는 이름의 prop을 받는다고 선언하는 것입니다.
// 타입 체크(type)나 필수 여부(required)를 설정하면 코드의 안정성을 높일 수 있습니다.
defineProps({
  gundams: {
    type: Array, // 데이터의 타입은 배열(Array)이어야 합니다.
    required: true, // 이 데이터는 필수적으로 받아야 합니다.
  }
});
</script>

<template>
  <!-- 이 영역에는 컴포넌트의 화면 구조(HTML)를 작성합니다. -->
  <div class="gundam-list-container">
    <h2>재고 목록</h2>
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
          2. 'v-for' 디렉티브를 사용하여 'gundams' 배열을 순회하며 <tr> 요소를 생성합니다.
          'gundam'은 배열의 각 요소를 순서대로 가리키는 임시 변수입니다.
          ':key'는 Vue가 각 항목을 효율적으로 식별하고 업데이트하기 위해 필요한 고유한 값입니다.
          'v-for'를 사용할 때는 항상 고유한 id를 :key에 바인딩하는 것이 좋습니다.
        -->
        <tr v-for="gundam in gundams" :key="gundam.id">
          <!-- 3. {{ }} (콧수염 괄호, Mustache syntax)를 사용해 각 건담의 데이터를 화면에 표시합니다. -->
          <td>{{ gundam.grade }}</td>
          <td>{{ gundam.name }}</td>
          <td>{{ gundam.quantity }}</td>
          <td>{{ gundam.status }}</td>
          <td><button>삭제</button></td>
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
