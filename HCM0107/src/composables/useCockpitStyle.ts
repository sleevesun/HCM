import { ref, computed, watch } from 'vue'

/**
 * 工薪预算驾驶舱样式类型
 */
export type CockpitStyle = 'original' | 'plan1' | 'plan2' | 'plan3'

/**
 * 样式配置接口
 */
export interface StyleConfig {
  id: CockpitStyle
  name: string
  description: string
  icon?: string
}

/**
 * 可用的样式配置列表
 */
export const STYLE_CONFIGS: StyleConfig[] = [
  {
    id: 'original',
    name: '原始样式',
    description: '保留原有表格布局和样式'
  },
  {
    id: 'plan1',
    name: '方案一：视觉层级增强',
    description: '通过强化视觉层级和列分组，降低认知搜索成本',
    icon: '📊'
  },
  {
    id: 'plan2',
    name: '方案二：渐进式信息披露',
    description: '默认只显示关键指标，按需展开详细信息',
    icon: '🔽'
  },
  {
    id: 'plan3',
    name: '方案三：卡片式响应布局',
    description: '现代化卡片布局，适配移动端',
    icon: '📱'
  }
]

/**
 * 样式切换 Composable
 * 提供样式状态管理和样式相关的计算属性
 */
export function useCockpitStyle() {
  // 从 localStorage 读取保存的样式，默认为 'original'
  const savedStyle = localStorage.getItem('cockpit-style') as CockpitStyle | null
  const currentStyle = ref<CockpitStyle>(savedStyle || 'original')

  // 当样式变化时，保存到 localStorage
  watch(currentStyle, (newStyle) => {
    localStorage.setItem('cockpit-style', newStyle)
  })

  /**
   * 样式类名计算属性
   * 返回一个对象，包含所有样式的布尔值
   */
  const styleClasses = computed(() => ({
    'style-original': currentStyle.value === 'original',
    'style-plan1': currentStyle.value === 'plan1',
    'style-plan2': currentStyle.value === 'plan2',
    'style-plan3': currentStyle.value === 'plan3'
  }))

  /**
   * 获取当前样式类名字符串
   * 用于直接绑定到 class 属性
   */
  const currentClassName = computed(() => {
    return `style-${currentStyle.value}`
  })

  /**
   * 当前样式配置
   */
  const currentConfig = computed(() => {
    return STYLE_CONFIGS.find(config => config.id === currentStyle.value) || STYLE_CONFIGS[0]
  })

  /**
   * 设置样式
   * @param style 要设置的样式
   */
  const setStyle = (style: CockpitStyle) => {
    if (STYLE_CONFIGS.some(config => config.id === style)) {
      currentStyle.value = style
    } else {
      console.warn(`Invalid style: ${style}. Available styles: ${STYLE_CONFIGS.map(c => c.id).join(', ')}`)
    }
  }

  /**
   * 切换到下一个样式
   * 循环顺序: original -> plan1 -> plan2 -> plan3 -> original
   */
  const nextStyle = () => {
    const currentIndex = STYLE_CONFIGS.findIndex(config => config.id === currentStyle.value)
    const nextIndex = (currentIndex + 1) % STYLE_CONFIGS.length
    currentStyle.value = STYLE_CONFIGS[nextIndex].id
  }

  /**
   * 切换到上一个样式
   */
  const previousStyle = () => {
    const currentIndex = STYLE_CONFIGS.findIndex(config => config.id === currentStyle.value)
    const prevIndex = (currentIndex - 1 + STYLE_CONFIGS.length) % STYLE_CONFIGS.length
    currentStyle.value = STYLE_CONFIGS[prevIndex].id
  }

  /**
   * 重置为原始样式
   */
  const resetStyle = () => {
    currentStyle.value = 'original'
  }

  /**
   * 检查是否为特定样式
   */
  const isStyle = (style: CockpitStyle) => {
    return currentStyle.value === style
  }

  /**
   * 是否为原始样式
   */
  const isOriginal = computed(() => currentStyle.value === 'original')

  /**
   * 是否为方案一
   */
  const isPlan1 = computed(() => currentStyle.value === 'plan1')

  /**
   * 是否为方案二
   */
  const isPlan2 = computed(() => currentStyle.value === 'plan2')

  /**
   * 是否为方案三
   */
  const isPlan3 = computed(() => currentStyle.value === 'plan3')

  /**
   * 是否需要表格视图
   * 原始样式和方案一使用表格视图
   */
  const isTableView = computed(() =>
    currentStyle.value === 'original' || currentStyle.value === 'plan1'
  )

  /**
   * 是否需要卡片视图
   * 方案三使用卡片视图
   */
  const isCardView = computed(() => currentStyle.value === 'plan3')

  return {
    // 状态
    currentStyle,
    currentConfig,
    currentClassName,

    // 计算属性
    styleClasses,
    isOriginal,
    isPlan1,
    isPlan2,
    isPlan3,
    isTableView,
    isCardView,

    // 方法
    setStyle,
    nextStyle,
    previousStyle,
    resetStyle,
    isStyle,

    // 常量
    STYLE_CONFIGS
  }
}

/**
 * 单例实例
 * 可以在多个组件中共享同一个样式状态
 */
let singletonInstance: ReturnType<typeof useCockpitStyle> | null = null

export function useCockpitStyleSingleton() {
  if (!singletonInstance) {
    singletonInstance = useCockpitStyle()
  }
  return singletonInstance
}
