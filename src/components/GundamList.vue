<!-- src/components/GundamList.vue -->

<script setup>
// 이 영역에는 나중에 컴포넌트의 동작 로직(JavaScript)을 작성합니다.
// 지금은 비워둡니다.
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
          나중에는 이 부분이 v-for를 통해 동적으로 생성됩니다.
          지금은 화면이 어떻게 보일지 확인하기 위해 임시 데이터를 넣어둡니다.
        -->
        <tr>
          <td>MG</td>
          <td>스트라이크 프리덤</td>
          <td>1</td>
          <td>보관</td>
          <td><button>삭제</button></td>
        </tr>
        <tr>
          <td>HG</td>
          <td>에어리얼</td>
          <td>2</td>
          <td>판매</td>
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
