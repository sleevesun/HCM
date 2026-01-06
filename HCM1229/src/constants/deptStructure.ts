export interface DeptNode {
  name: string
  id: string
  type?: 'group' | 'leaf'
  weight?: number
  children?: DeptNode[]
  values?: any // Loose type here as it differs slightly between views, or we can make it generic
}

export const HIDE_ACTION_IDS = new Set([
  'root', // 完美世界
  'game', // 游戏业务
  'game_studios', // 游戏工作室群
  'esports', // 电竞与平台业务
  'film', // 影视业务
  'logistics', // 后勤职能
  'development' // 集团发展部
])

export const HIDE_CHILDREN_ACTION_PARENT_IDS = new Set([
  'peach_blossom',
  'art_platform',
  'dev_ops',
  'steam_cn'
])

export const READ_ONLY_IDS = new Set([
  'sustainable', // 可持续发展与合作事业群
  'hr', // 人力资源中心
  'film_hr', // 影视人力资源中心
  'art_platform', // 游戏美术平台中心
  'black_feather', // 黑羽工作室
])

export const DEPT_TREE_STRUCTURE: DeptNode = {
  name: "完美世界",
  id: "root",
  type: "group",
  children: [
    {
      name: "游戏业务",
      id: "game",
      type: "group",
      children: [
        {
          name: "游戏工作室群",
          id: "game_studios",
          type: "group",
          children: [
            { name: "黑羽工作室", id: "black_feather", type: "leaf", weight: 1.2 },
            { name: "青云工作室", id: "qingyun", type: "leaf", weight: 1.2 },
            { name: "远景工作室", id: "vision", type: "leaf", weight: 1.0 },
            { name: "圆周率工作室", id: "pi", type: "leaf", weight: 0.8 }
          ]
        },
        {
          name: "桃花源工作室群",
          id: "peach_blossom",
          type: "leaf",
          weight: 7.5
        },
        {
          name: "游戏美术平台中心",
          id: "art_platform",
          type: "leaf",
          weight: 6.0
        },
        {
          name: "游戏开发运维中心",
          id: "dev_ops",
          type: "leaf",
          weight: 17.0
        }
      ]
    },
    { 
      name: "电竞与平台业务", 
      id: "esports", 
      type: "group", 
      children: [
        {
          name: "Steam CN",
          id: "steam_cn",
          type: "leaf",
          weight: 2.3
        }
      ]
    },
    { 
      name: "影视业务", 
      id: "film", 
      type: "group", 
      children: [
        { name: "影视内容制作平台", id: "film_content", type: "leaf", weight: 0.4 },
        { name: "影视项目开发中心", id: "film_project", type: "leaf", weight: 0.6 },
        { name: "影视财务部", id: "film_finance", type: "leaf", weight: 0.25 },
        { name: "影视人力资源中心", id: "film_hr", type: "leaf", weight: 0.25 }
      ]
    },
    {
      name: "后勤职能",
      id: "logistics",
      type: "group",
      children: [
        { name: "集团财务中心", id: "finance", type: "leaf", weight: 0.4 },
        { name: "可持续发展与合作事业群", id: "sustainable", type: "leaf", weight: 2.0 }
      ]
    },
    {
      name: "集团发展部",
      id: "development",
      type: "group",
      children: [
        { name: "人力资源中心", id: "hr", type: "leaf", weight: 0.5 },
        { name: "采购管理中心", id: "procurement", type: "leaf", weight: 0.3 },
        { name: "信息技术中心", id: "it", type: "leaf", weight: 0.6 }
      ]
    }
  ]
}
