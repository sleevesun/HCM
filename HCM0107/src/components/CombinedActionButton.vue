<template>
  <div class="combined-btn-container" role="group" aria-label="现有人员/HC变更">
    <span class="prefix-label">现有人员/HC变更：</span>
    <button 
      class="c-btn left-btn" 
      @click="openSalaryModal"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      工资
      <span class="ripple" v-if="salaryRipple" :style="salaryRippleStyle"></span>
    </button>
    <div class="separator"></div>
    <button 
      class="c-btn middle-btn" 
      @click="toggleProjectPanel"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      项目标签
      <span class="ripple" v-if="projectRipple" :style="projectRippleStyle"></span>
    </button>
    <div class="separator"></div>
    <button 
      class="c-btn right-btn" 
      @click="handleSubsidyClick"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      外派补贴
      <span class="ripple" v-if="subsidyRipple" :style="subsidyRippleStyle"></span>
    </button>

    <!-- Salary Edit Modal -->
    <transition name="fade">
      <SalaryEditModal
        v-if="salaryModalVisible"
        v-model:open="salaryModalVisible"
        @ok="handleSalaryOk"
        @switch-modal="handleSwitchToProject"
        @update:isDirty="val => isSalaryDirty = val"
      />
    </transition>

    <!-- Project Tag Edit Modal -->
    <transition name="fade">
      <ProjectTagEditModal
        v-if="projectModalVisible"
        v-model:open="projectModalVisible"
        @ok="handleProjectOk"
        @switch-modal="handleSwitchToSalary"
        @update:isDirty="val => isProjectDirty = val"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import SalaryEditModal from './SalaryEditModal.vue'
import ProjectTagEditModal from './ProjectTagEditModal.vue'

const isHovered = ref(false)
const props = withDefaults(defineProps<{
  selectedEmployeeIdsCount?: number
}>(), {
  selectedEmployeeIdsCount: 0
})
const emit = defineEmits<{
  (e: 'open-subsidy-modal'): void
}>()

// --- State Management ---
const isSalaryDirty = ref(false)
const isProjectDirty = ref(false)

// --- Salary Logic ---
const salaryModalVisible = ref(false)
const salaryRipple = ref(false)
const salaryRippleStyle = reactive({})

const openSalaryModal = (e?: MouseEvent) => {
  if (e) triggerRipple(e, 'salary')
  salaryModalVisible.value = true
}

const handleSalaryOk = () => {
  message.success('薪资变更已保存')
  salaryModalVisible.value = false
  isSalaryDirty.value = false
}

// --- Project Tags Logic ---
const projectModalVisible = ref(false)
const projectRipple = ref(false)
const projectRippleStyle = reactive({})

const toggleProjectPanel = (e?: MouseEvent) => {
  if (e) triggerRipple(e, 'project')
  projectModalVisible.value = true
}

const handleProjectOk = () => {
  message.success('项目标签变更已保存')
  projectModalVisible.value = false
  isProjectDirty.value = false
}

// --- Subsidy Logic ---
const subsidyRipple = ref(false)
const subsidyRippleStyle = reactive({})

const handleSubsidyClick = (e?: MouseEvent) => {
  if (e) triggerRipple(e, 'subsidy')
  if ((props.selectedEmployeeIdsCount ?? 0) <= 0) {
    message.warning('请先选择员工')
    return
  }
  emit('open-subsidy-modal')
}

// --- Switch Logic ---
const handleSwitchToProject = () => {
  if (isSalaryDirty.value) {
    Modal.confirm({
      title: '您有未保存的修改，是否保存后再切换？',
      content: '未保存的修改将会丢失。',
      okText: '保存并切换',
      cancelText: '不保存直接切换',
      onOk() {
        // Save logic (mock)
        return new Promise((resolve) => {
          setTimeout(() => {
            message.success('薪资变更已保存')
            isSalaryDirty.value = false
            salaryModalVisible.value = false
            projectModalVisible.value = true
            resolve(true)
          }, 500)
        })
      },
      onCancel() {
        // Discard logic
        isSalaryDirty.value = false // Reset state (in real app, reload data on next open)
        salaryModalVisible.value = false
        projectModalVisible.value = true
      }
    })
  } else {
    salaryModalVisible.value = false
    projectModalVisible.value = true
  }
}

const handleSwitchToSalary = () => {
  if (isProjectDirty.value) {
    Modal.confirm({
      title: '您有未保存的修改，是否保存后再切换？',
      content: '未保存的修改将会丢失。',
      okText: '保存并切换',
      cancelText: '不保存直接切换',
      onOk() {
        return new Promise((resolve) => {
          setTimeout(() => {
            message.success('项目标签变更已保存')
            isProjectDirty.value = false
            projectModalVisible.value = false
            salaryModalVisible.value = true
            resolve(true)
          }, 500)
        })
      },
      onCancel() {
        isProjectDirty.value = false
        projectModalVisible.value = false
        salaryModalVisible.value = true
      }
    })
  } else {
    projectModalVisible.value = false
    salaryModalVisible.value = true
  }
}

// --- Ripple Effect ---
const triggerRipple = (e: MouseEvent, type: 'salary' | 'project' | 'subsidy') => {
  const btn = e.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  const style = {
    top: `${y}px`,
    left: `${x}px`
  }
  
  if (type === 'salary') {
    Object.assign(salaryRippleStyle, style)
    salaryRipple.value = true
    setTimeout(() => salaryRipple.value = false, 600)
  } else if (type === 'project') {
    Object.assign(projectRippleStyle, style)
    projectRipple.value = true
    setTimeout(() => projectRipple.value = false, 600)
  } else if (type === 'subsidy') {
    Object.assign(subsidyRippleStyle, style)
    subsidyRipple.value = true
    setTimeout(() => subsidyRipple.value = false, 600)
  }
}
</script>

<style scoped>
/* ... existing styles ... */
.combined-btn-container {
  display: inline-flex;
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border, #d9d9d9);
  border-radius: 8px;
  overflow: visible;
  position: relative;
  transition: all 0.3s;
  height: 32px;
  padding-left: 12px; /* Padding for the label */
}

.prefix-label {
  font-size: 14px;
  color: var(--color-text, rgba(0, 0, 0, 0.88));
  font-weight: 500;
  margin-right: 4px;
  white-space: nowrap;
}

.combined-btn-container:hover {
  border-color: var(--color-primary, #4096ff);
  box-shadow: 0 0 0 2px var(--color-primary-hover, rgba(5, 145, 255, 0.1));
}

.c-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 12px;
  font-size: 14px;
  color: var(--color-text, rgba(0, 0, 0, 0.88));
  height: 100%;
  position: relative;
  overflow: visible; /* For pseudo-element hit area */
  outline: none;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px; /* Fixed width for consistency */
}

/* Expand touch target to 44px for WCAG compliance */
.c-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  min-width: 44px;
  min-height: 44px;
}

.c-btn:hover {
  background-color: var(--color-bg-hover, rgba(0, 0, 0, 0.04));
  color: var(--color-primary, #4096ff);
}

.left-btn {
  /* Removed border radius override since it's not the first child anymore */
}

.middle-btn {
  border-radius: 0;
}

.right-btn {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.separator {
  width: 1px;
  height: 16px;
  background-color: var(--color-border-secondary, #f0f0f0);
}

/* Ripple Effect */
.ripple {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(64, 150, 255, 0.2);
  width: 100px;
  height: 100px;
  margin-top: -50px;
  margin-left: -50px;
  animation: ripple-anim 0.6s linear;
  pointer-events: none;
  z-index: 1;
}

@keyframes ripple-anim {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
