import './assets/base.css'

import { createApp } from 'vue'
// 1. Pinia를 생성하는 함수를 가져옵니다.
import { createPinia } from 'pinia' 

import App from './App.vue'
import './assets/main.css'

const app = createApp(App)

// 2. Pinia 인스턴스를 생성하고, app.use()를 통해 Vue 앱 전체에서 사용할 수 있도록 등록합니다.
app.use(createPinia())

app.mount('#app')
