<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
    UserOutlined,
    AppstoreOutlined,
    BarChartOutlined,
    FileTextOutlined,
    SearchOutlined,
    ReloadOutlined,
    DownOutlined,
    RightOutlined,
    EditOutlined,
    DeleteOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons-vue';

// --- State ---
const searchForm = reactive({
    deptName: '',
    year: '2026'
});

const activeMenu = ref(['budget']);

// --- Mock Data for Main Table ---
const columns = [
    {
        title: '部门',
        dataIndex: 'deptName',
        key: 'deptName',
        fixed: 'left',
        width: 200,
    },
    {
        title: '预算调整',
        dataIndex: 'budgetAdjust',
        key: 'budgetAdjust',
        width: 80,
    },
    {
        title: '2026年',
        children: [
            {
                title: 'HC (当前)',
                children: [
                    { title: '正编', dataIndex: 'hc2026_current_reg', width: 60 },
                    { title: '实习', dataIndex: 'hc2026_current_intern', width: 60 },
                    { title: '派遣', dataIndex: 'hc2026_current_dispatch', width: 60 },
                    { title: '外包', dataIndex: 'hc2026_current_outsource', width: 60 },
                    { title: '兼职', dataIndex: 'hc2026_current_parttime', width: 60 },
                ]
            },
            {
                title: 'HC (年末目标)',
                children: [
                    { title: '正编', dataIndex: 'hc2026_target_reg', width: 60 },
                    { title: '实习', dataIndex: 'hc2026_target_intern', width: 60 },
                    { title: '派遣', dataIndex: 'hc2026_target_dispatch', width: 60 },
                    { title: '外包', dataIndex: 'hc2026_target_outsource', width: 60 },
                    { title: '兼职', dataIndex: 'hc2026_target_parttime', width: 60 },
                ]
            },
            {
                title: '工薪成本 (万)',
                children: [
                    { title: '累计', dataIndex: 'cost2026_cumulative', width: 80 },
                    { title: '预算', dataIndex: 'cost2026_budget', width: 80 },
                    { title: '预实比', dataIndex: 'cost2026_ratio', width: 80 },
                ]
            }
        ]
    },
    {
        title: '2027年',
        children: [
            {
                title: '预算编制',
                dataIndex: 'budgetPrep2027',
                width: 80,
            },
            {
                title: 'HC (年初计划)',
                children: [
                    { title: '正编', dataIndex: 'hc2027_plan_reg', width: 60 },
                    { title: '实习', dataIndex: 'hc2027_plan_intern', width: 60 },
                    { title: '派遣', dataIndex: 'hc2027_plan_dispatch', width: 60 },
                    { title: '外包', dataIndex: 'hc2027_plan_outsource', width: 60 },
                    { title: '兼职', dataIndex: 'hc2027_plan_parttime', width: 60 },
                ]
            },
            {
                title: '成本',
                dataIndex: 'cost2027_total',
                width: 80,
            }
        ]
    }
];

const data = [
    {
        key: '1',
        deptName: '远景工作室',
        budgetAdjust: '',
        children: [
            {
                key: '1-1',
                deptName: '研发部',
                budgetAdjust: '',
                hc2026_current_reg: 13, hc2026_current_intern: 5, hc2026_current_dispatch: 0, hc2026_current_outsource: 0, hc2026_current_parttime: 0,
                hc2026_target_reg: 12, hc2026_target_intern: 5, hc2026_target_dispatch: 0, hc2026_target_outsource: 0, hc2026_target_parttime: 0,
                cost2026_cumulative: 326.0, cost2026_budget: 782.2, cost2026_ratio: '41.6%',
                budgetPrep2027: '',
                hc2027_plan_reg: 12, hc2027_plan_intern: 5, hc2027_plan_dispatch: 0, hc2027_plan_outsource: 0, hc2027_plan_parttime: 0,
                cost2027_total: 821.3
            },
            {
                key: '1-2',
                deptName: '支撑部',
                budgetAdjust: '',
                hc2026_current_reg: 14, hc2026_current_intern: 0, hc2026_current_dispatch: 0, hc2026_current_outsource: 0, hc2026_current_parttime: 0,
                hc2026_target_reg: 17, hc2026_target_intern: 2, hc2026_target_dispatch: 0, hc2026_target_outsource: 0, hc2026_target_parttime: 0,
                cost2026_cumulative: 321.0, cost2026_budget: 741.8, cost2026_ratio: '43.2%',
                budgetPrep2027: '',
                hc2027_plan_reg: 17, hc2027_plan_intern: 2, hc2027_plan_dispatch: 0, hc2027_plan_outsource: 0, hc2027_plan_parttime: 0,
                cost2027_total: 778.9
            }
        ],
        hc2026_current_reg: 48, hc2026_current_intern: 5, hc2026_current_dispatch: 0, hc2026_current_outsource: 0, hc2026_current_parttime: 0,
        hc2026_target_reg: 50, hc2026_target_intern: 9, hc2026_target_dispatch: 0, hc2026_target_outsource: 0, hc2026_target_parttime: 0,
        cost2026_cumulative: 1200.0, cost2026_budget: 2400.0, cost2026_ratio: '50.0%',
        budgetPrep2027: '',
        hc2027_plan_reg: 50, hc2027_plan_intern: 9, hc2027_plan_dispatch: 0, hc2027_plan_outsource: 0, hc2027_plan_parttime: 0,
        cost2027_total: 2520.0
    }
];

</script>

<template>
    <a-layout class="layout-container">
        <!-- Header -->
        <a-layout-header class="header">
            <div class="logo">
                <AppstoreOutlined class="logo-icon" />
                <span>HCM</span>
            </div>
            <div class="nav-menu">
                <a-menu v-model:selectedKeys="activeMenu" mode="horizontal" theme="dark" :style="{ lineHeight: '56px', background: 'transparent', borderBottom: 'none', width: '100%' }">
                    <a-menu-item key="org">
                        <template #icon><UserOutlined /></template>
                        组织树
                    </a-menu-item>
                    <a-menu-item key="report">
                        <template #icon><BarChartOutlined /></template>
                        报表中心
                    </a-menu-item>
                    <a-menu-item key="budget">
                        <template #icon><FileTextOutlined /></template>
                        编制管理
                    </a-menu-item>
                </a-menu>
            </div>
            <div class="user-profile">
                <a-avatar size="small" :style="{ backgroundColor: 'rgba(255,255,255,0.2)' }">
                    <template #icon><UserOutlined /></template>
                </a-avatar>
                <span class="username">用户</span>
            </div>
        </a-layout-header>

        <!-- Main Content -->
        <a-layout-content class="main-content">
            <!-- Page Header -->
            <div class="page-title-row">
                <div class="page-title">
                    <AppstoreOutlined class="title-icon"/>
                    工薪预算驾驶舱
                </div>
                <a-button type="link">操作手册</a-button>
            </div>

            <!-- Search Area -->
            <a-card :bordered="false" class="search-card">
                <a-form layout="inline" :model="searchForm">
                    <a-form-item label="部门名称">
                        <a-input v-model:value="searchForm.deptName" placeholder="请输入部门名称" style="width: 200px" />
                    </a-form-item>
                    <a-form-item label="年份">
                        <a-select v-model:value="searchForm.year" style="width: 120px">
                            <a-select-option value="2026">2026年</a-select-option>
                            <a-select-option value="2025">2025年</a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item>
                        <a-space>
                            <a-button type="primary">
                                <template #icon><SearchOutlined /></template>
                                查询
                            </a-button>
                            <a-button>
                                <template #icon><ReloadOutlined /></template>
                                重置
                            </a-button>
                        </a-space>
                    </a-form-item>
                </a-form>
            </a-card>

            <!-- Pending Applications (Simplified for Demo) -->
            <a-card :bordered="false" class="section-card" title="在途调整/编制申请 (2)">
                <template #extra>
                    <a href="#">查看更多 <RightOutlined /></a>
                </template>
                <div class="pending-table-mock">
                    <!-- Placeholder using simple table or structure for the top section -->
                    <a-descriptions bordered size="small" :column="4">
                        <a-descriptions-item label="2025年预算调整">远景工作室: HC变化 +4 | +1, 成本变化 +108.6万</a-descriptions-item>
                        <a-descriptions-item label="操作">
                             <a-space>
                                <a type="link">去提交</a>
                                <a type="link" danger>删除</a>
                            </a-space>
                        </a-descriptions-item>
                    </a-descriptions>
                </div>
            </a-card>

            <!-- Main Data Table -->
            <a-card :bordered="false" class="section-card">
                <div class="table-header-row">
                    <span class="section-title">当前工薪执行现状及现行规划</span>
                    <a-space>
                        <a-button size="small">一键折叠</a-button>
                        <a-button size="small">一键展开</a-button>
                    </a-space>
                </div>
                
                <a-table 
                    :columns="columns" 
                    :data-source="data" 
                    bordered 
                    size="middle" 
                    :scroll="{ x: 1800 }" 
                    :pagination="false"
                    row-key="key"
                    :expand-row-by-click="true"
                    class="budget-table"
                >
                    <!-- Custom Render for specific columns if needed -->
                    <template #bodyCell="{ column, record, text }">
                        <template v-if="column.dataIndex === 'budgetAdjust'">
                             <EditOutlined class="action-icon" />
                        </template>
                        <template v-if="column.dataIndex === 'budgetPrep2027'">
                             <FileTextOutlined class="action-icon" />
                        </template>
                    </template>
                </a-table>
            </a-card>

            <!-- Footer -->
            <a-layout-footer class="footer">
                <span>© 2026 HCM System</span>
                <a-divider type="vertical" />
                <a class="footer-link">取消链接</a>
            </a-layout-footer>
        </a-layout-content>
    </a-layout>
</template>

<style scoped>
/* Page Layout */
.layout-container {
    min-height: 100vh;
    background: #F0F2F5;
}

.header {
    background: #0052D9;
    padding: 0 24px;
    display: flex;
    align-items: center;
    color: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 10;
    height: 56px;
    line-height: 56px;
}

.logo {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    margin-right: 40px;
    color: white;
}

.logo-icon {
    font-size: 20px;
    margin-right: 8px;
}

.nav-menu {
    flex: 1;
}

:deep(.ant-menu-dark.ant-menu-horizontal > .ant-menu-item:hover) {
    background-color: rgba(255, 255, 255, 0.1);
}

:deep(.ant-menu-dark.ant-menu-horizontal > .ant-menu-item-selected) {
    background-color: rgba(255, 255, 255, 0.2);
}

.user-profile {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.username {
    margin-left: 8px;
    color: white;
}

.main-content {
    padding: 24px;
    max-width: 100%;
    overflow-x: hidden;
}

.page-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.page-title {
    font-size: 20px;
    font-weight: 600;
    color: #1D2129;
    display: flex;
    align-items: center;
}

.title-icon {
    margin-right: 12px;
    color: #0052D9;
}

.search-card {
    margin-bottom: 16px;
    border-radius: 4px;
}

.section-card {
    margin-bottom: 24px;
    border-radius: 4px;
}

.table-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
}

.action-icon {
    color: #0052D9;
    cursor: pointer;
}

.action-icon:hover {
    color: #003CAB;
}

.footer {
    text-align: center;
    color: #86909C;
    background: transparent;
    padding: 24px 0;
}

.footer-link {
    color: #4E5969;
}

/* Table Custom Styles */
:deep(.ant-table-thead > tr > th) {
    background: #FAFAFA;
    font-weight: 600;
    text-align: center;
}

:deep(.ant-table-cell) {
    text-align: center;
}

/* Fix left fixed column alignment */
:deep(.ant-table-cell-fix-left) {
    text-align: left !important;
}

</style>
