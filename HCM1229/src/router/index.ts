import { createRouter, createWebHistory } from 'vue-router'
import ApprovalCenter from '../views/ApprovalCenter.vue'
import SalaryBudgetCockpit from '../views/SalaryBudgetCockpit.vue'

const routes = [
  {
    path: '/',
    redirect: '/salary-budget'
  },
  {
    path: '/approval-center',
    name: 'ApprovalCenter',
    component: ApprovalCenter,
    meta: { title: '审批中心' }
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
