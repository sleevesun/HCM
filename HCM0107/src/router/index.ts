import { createRouter, createWebHistory } from 'vue-router'
import SalaryBudgetCockpit from '../views/SalaryBudgetCockpit.vue'

const routes = [
  {
    path: '/',
    redirect: '/salary-budget'
  },
  {
    path: '/salary-budget',
    name: 'SalaryBudget',
    component: SalaryBudgetCockpit,
    meta: { title: '工薪预算驾驶舱' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
