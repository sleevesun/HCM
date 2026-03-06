<template>
  <div class="dept-tree-select">
    <a-tree-select
      v-model:value="localValue"
      style="width: 100%"
      :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
      :tree-data="treeData"
      placeholder="请选择HC申请部门"
      :tree-default-expanded-keys="defaultExpandedKeys"
      :field-names="{ children: 'children', label: 'title', value: 'id' }"
      allow-clear
      show-search
      tree-node-filter-prop="searchText"
      @change="handleChange"
      :load-data="handleLoadData"
      :loading="loading"
      :disabled="disabled"
      :not-found-content="emptyContent"
      aria-label="HC申请部门"
    >
      <template #title="{ name, disabled, manager, headcount, code }">
        <span v-if="disabled" style="color: #999">{{ name }} (无权限)</span>
        <span v-else>{{ name || code }}（{{ manager || '-' }} / {{ Number.isFinite(headcount) ? headcount : '-' }}人）</span>
      </template>
    </a-tree-select>
    <div v-if="!loading && !hasSelectable" class="select-hint">当前账号暂无可选组织</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  fetchOrgChildren,
  fetchOrgNodeByCode,
  fetchOrgTree,
  getCurrentUserDeptCode,
  initializeOrgArchitectureData,
  type OrgNode
} from '../mocks/orgData'

const props = defineProps<{
  value?: string
  userDeptCode?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:value', val: string | undefined): void
  (e: 'change', val: string | undefined, node: any): void
}>()

const localValue = ref<string | undefined>(props.value)
const treeData = ref<OrgNode[]>([])
const loading = ref(false)
const emptyContent = computed(() => loading.value ? '加载中...' : '暂无组织数据')
const defaultExpandedKeys = ref<string[]>([])
const currentUserDeptCode = computed(() => props.userDeptCode || getCurrentUserDeptCode())

const countSelectable = (nodes: OrgNode[]): number => {
  return nodes.reduce((count, node) => {
    const self = node.disabled ? 0 : 1
    const child = node.children ? countSelectable(node.children) : 0
    return count + self + child
  }, 0)
}

const hasSelectable = computed(() => countSelectable(treeData.value) > 0)

const hasNodeByCode = (nodes: OrgNode[], code: string): boolean => {
  for (const item of nodes) {
    if (item.code === code) return true
    if (item.children?.length && hasNodeByCode(item.children, code)) return true
  }
  return false
}

watch(() => props.value, (val) => {
  localValue.value = val
})

const patchNodeChildren = (nodes: OrgNode[], targetCode: string, children: OrgNode[]): OrgNode[] => {
  return nodes.map((item) => {
    if (item.code === targetCode) {
      return {
        ...item,
        children,
        loaded: true
      }
    }
    if (!item.children?.length) {
      return item
    }
    return {
      ...item,
      children: patchNodeChildren(item.children, targetCode, children)
    }
  })
}

const loadData = async () => {
  loading.value = true
  try {
    initializeOrgArchitectureData()
    treeData.value = await fetchOrgTree(currentUserDeptCode.value)
    if (localValue.value && !hasNodeByCode(treeData.value, localValue.value)) {
      const selectedNode = await fetchOrgNodeByCode(localValue.value)
      if (selectedNode) {
        treeData.value = [
          ...treeData.value,
          selectedNode
        ]
      }
    }
    defaultExpandedKeys.value = treeData.value.map((item) => item.code)
  } catch (e) {
    treeData.value = []
  } finally {
    loading.value = false
  }
}

const handleChange = (val: string | undefined, _labelList: any, extra: any) => {
  emit('update:value', val)
  const node = extra?.triggerNode?.props
  emit('change', val, node)
}

const handleLoadData = async (treeNode: any) => {
  const code = treeNode?.dataRef?.code || treeNode?.code
  if (!code) return
  const node = await fetchOrgNodeByCode(code)
  if (!node || node.isLeaf || treeNode?.dataRef?.loaded) return
  const children = await fetchOrgChildren(code, currentUserDeptCode.value)
  treeData.value = patchNodeChildren(treeData.value, code, children)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dept-tree-select {
  width: 100%
}

.select-hint {
  margin-top: 4px;
  color: #999;
  font-size: 12px;
}
</style>
