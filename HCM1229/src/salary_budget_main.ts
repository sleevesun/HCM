import { createApp } from 'vue'
import SalaryBudgetCockpit from './views/SalaryBudgetCockpit.vue'
import { createPinia } from 'pinia'

// Import global styles if needed, or Ant Design styles (though auto-import might handle it)
import 'ant-design-vue/dist/reset.css';

const app = createApp(SalaryBudgetCockpit)
app.use(createPinia())
app.mount('#app')
