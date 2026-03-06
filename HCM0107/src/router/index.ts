import { createRouter, createWebHistory } from 'vue-router'
import ApprovalCenter from '../views/ApprovalCenter.vue'
import SalaryBudgetCockpit from '../views/SalaryBudgetCockpit.vue'
import BudgetTransfer from '../views/BudgetTransfer.vue'
import BudgetAdjustment from '../views/BudgetAdjustment.vue'
import BudgetAdjustmentTransitionHC from '../views/BudgetAdjustmentTransitionHC.vue'
import BudgetPlanning from '../views/BudgetPlanning.vue'
import TransitionHCApply from '../views/TransitionHCApply.vue'
import TransitionHCApproval from '../views/TransitionHCApproval.vue'
import TransitionHCApprovalMobile from '../views/TransitionHCApprovalMobile.vue'
import TransitionHCFlowBoard from '../views/TransitionHCFlowBoard.vue'

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
  },
  {
    path: '/budget-adjust',
    name: 'BudgetAdjustment',
    component: BudgetAdjustment,
    meta: { title: '预算调整' }
  },
  {
    path: '/budget-adjust-transition-hc',
    name: 'BudgetAdjustmentTransitionHC',
    component: BudgetAdjustmentTransitionHC,
    meta: { title: '预算编制（过渡期HC）', permissionCode: 'budget_adjust_transition_hc_view' }
  },
  {
    path: '/budget-planning',
    name: 'BudgetPlanning',
    component: BudgetPlanning,
    meta: { title: '预算编制/调整' }
  },
  {
    path: '/transition-hc-apply',
    name: 'TransitionHCApply',
    component: TransitionHCApply,
    meta: { title: '过渡期HC申请' }
  },
  {
    path: '/transition-hc-approval',
    name: 'TransitionHCApproval',
    component: TransitionHCApproval,
    meta: { title: '过渡期HC审批', permissionCode: 'transition_hc_approval_view' }
  },
  {
    path: '/transition-hc-approval-mobile',
    name: 'TransitionHCApprovalMobile',
    component: TransitionHCApprovalMobile,
    meta: { title: '过渡期HC审批(移动端)', permissionCode: 'transition_hc_approval_view' }
  },
  {
    path: '/transition-hc-flow-board',
    name: 'TransitionHCFlowBoard',
    component: TransitionHCFlowBoard,
    meta: { title: '过渡期HC申请流程白板' }
  },
  {
    path: '/budget-transfer',
    name: 'BudgetTransfer',
    component: BudgetTransfer,
    meta: { title: '预算划转' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
