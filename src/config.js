// src/config.js

// 1. [신규] 건담 등급 목록을 배열로 정의하고 export 합니다.
//    export 키워드를 사용하면 다른 파일에서 이 변수를 import하여 사용할 수 있습니다.
export const GRADE_OPTIONS = ['HG', 'RG', 'MG', 'PG', 'SD', 'RE/100', 'Hi-RM', 'Mega'];

// 2. [신규] 판매 매체 목록도 이곳에서 함께 관리하면 일관성을 유지하기 좋습니다.
export const SALE_MEDIUM_OPTIONS = ['당근마켓', '중고나라', '기타'];

// 앞으로 추가될 다른 설정들도 이 파일에 모아서 관리할 수 있습니다.
