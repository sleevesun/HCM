/**
 * @vitest-environment jsdom
 * @author AI Assistant
 * @date 2026-03-03
 * @description 过渡期HC及其弹窗相关功能的单元测试
 */
import { mount, config } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import BudgetAdjustment from "../BudgetAdjustment.vue";

// 忽略因为没有引入全局组件导致的警告
config.global.stubs = {
  "a-button": {
    template: '<button class="a-button-stub"><slot></slot></button>',
  },
  "a-tooltip": { template: '<div class="a-tooltip-stub"><slot></slot></div>' },
  "a-select": { template: '<select class="a-select-stub"></select>' },
  "a-select-option": { template: '<option class="a-select-option-stub"></option>' },
  "a-date-picker": { template: '<input type="date" class="a-date-picker-stub" />' },
  "a-input": { template: '<input class="a-input-stub" />' },
  "a-skeleton-input": { template: '<div class="a-skeleton-input-stub"></div>' },
  "a-popconfirm": { template: '<div class="a-popconfirm-stub" @click="$emit(\'confirm\')"><slot></slot></div>' },
  "a-empty": { template: '<div class="a-empty-stub"></div>' },
  "a-spin": { template: '<div class="a-spin-stub"></div>' },
  "a-dropdown": { template: '<div class="a-dropdown-stub"><slot></slot><slot name="overlay"></slot></div>' },
  "a-menu": { template: '<div class="a-menu-stub"><slot></slot></div>' },
  "a-menu-item": { template: '<div class="a-menu-item-stub"><slot></slot></div>' },
  "down-outlined": true,
  "appstore-outlined": true,
  "download-outlined": true,
  "import-outlined": true,
  "plus-outlined": true,
  AdjustmentSummaryTable: true,
  BudgetDetailTable: true,
  CombinedActionButton: true,
  transition: { template: '<div class="transition-stub"><slot></slot></div>' },
};

describe("BudgetAdjustment.vue 弹窗功能测试", () => {
  it("无控制台报错", () => {
    // 监听 console.error 和 console.warn
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => { });
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => { });

    mount(BudgetAdjustment);

    // 期望组件挂载时没有报出任何控制台错误或警告
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it("点击「过渡期HC」按钮后弹窗可见", async () => {
    const wrapper = mount(BudgetAdjustment);

    // 初始化时弹窗不可见
    expect(wrapper.find(".custom-modal-overlay").exists()).toBe(false);

    // 找到并点击过渡期HC按钮
    const btn = wrapper.find(".transition-hc-btn");
    expect(btn.exists()).toBe(true);
    await btn.trigger("click");

    // 弹窗可见，能找到对应标题
    expect(wrapper.find(".custom-modal-overlay").exists()).toBe(true);
    expect(wrapper.find(".custom-modal-title").text()).toBe("过渡期HC详情录入");
  });

  it("弹窗关闭后不可见", async () => {
    const wrapper = mount(BudgetAdjustment);

    // 1. 打开弹窗
    await wrapper.find(".transition-hc-btn").trigger("click");
    expect(wrapper.find(".custom-modal-overlay").exists()).toBe(true);

    // 2. 点击关闭按钮 (可以使用右上角叉号或者遮罩，测试×号)
    await wrapper.find(".custom-modal-close").trigger("click");

    // 3. 弹窗消失
    expect(wrapper.find(".custom-modal-overlay").exists()).toBe(false);
  });

  it("表格仅渲染 1 个表头行，列数与文案完全匹配", async () => {
    const wrapper = mount(BudgetAdjustment);
    await wrapper.find(".transition-hc-btn").trigger("click");

    const thead = wrapper.find(".transition-hc-table thead");
    const trs = thead.findAll("tr");

    // 验证仅渲染 1 个表头行
    expect(trs.length).toBe(1);

    const expectedHeaders = [
      "序号",
      "HC类型",
      "被替换人员",
      "月薪",
      "部门",
      "项目标签",
      "预计离职日期",
      "族群类别",
      "职级",
      "社保地",
      "工作地点",
      "生效日期",
      "失效日期",
      "操作",
    ];

    const ths = trs[0].findAll("th");

    // 列数匹配
    expect(ths.length).toBe(expectedHeaders.length);

    // 文案完全匹配 (处理可能的前后或中间空格)
    ths.forEach((th, index) => {
      const actualText = th.text().replace(/\s+/g, "");
      const expectedText = expectedHeaders[index].replace(/\s+/g, "");
      expect(actualText).toBe(expectedText);
    });
  });

  it("支持添加新行和删除行，序号重排", async () => {
    const wrapper = mount(BudgetAdjustment);
    await wrapper.find(".transition-hc-btn").trigger("click");

    // initially 0 rows (only empty state)
    let tbodyTrs = wrapper.findAll(".transition-hc-table tbody tr");
    expect(tbodyTrs.length).toBe(1); // empty state row

    // Click "添加行信息" 3 times
    const addBtns = wrapper.findAll(".a-button-stub");
    const addRowBtn = addBtns.find(btn => btn.text().includes("添加行信息"));
    expect(addRowBtn).toBeDefined();

    await addRowBtn!.trigger("click");
    await addRowBtn!.trigger("click");
    await addRowBtn!.trigger("click");

    tbodyTrs = wrapper.findAll(".transition-hc-table tbody tr");
    expect(tbodyTrs.length).toBe(3);

    // Verify sequence numbers
    expect(tbodyTrs[0].find("td").text()).toBe("1");
    expect(tbodyTrs[1].find("td").text()).toBe("2");
    expect(tbodyTrs[2].find("td").text()).toBe("3");

    // Delete the middle row (index 1)
    const popconfirms = wrapper.findAll(".a-popconfirm-stub");
    await popconfirms[1].trigger("click"); // trigger confirm

    tbodyTrs = wrapper.findAll(".transition-hc-table tbody tr");
    expect(tbodyTrs.length).toBe(2);

    // Verify sequence numbers re-ordered
    expect(tbodyTrs[0].find("td").text()).toBe("1");
    expect(tbodyTrs[1].find("td").text()).toBe("2");
  });

  it("新增加的行，如果未选择被替换人，其它表单应该被 disabled-wrapper 包裹", async () => {
    const wrapper = mount(BudgetAdjustment);
    await wrapper.find(".transition-hc-btn").trigger("click");

    // Add row
    const addBtns = wrapper.findAll(".a-button-stub");
    const addRowBtn = addBtns.find(btn => btn.text().includes("添加行信息"));
    await addRowBtn!.trigger("click");

    let tbodyTrs = wrapper.findAll(".transition-hc-table tbody tr");
    expect(tbodyTrs.length).toBeGreaterThanOrEqual(1);

    // 检查是否有 disabled-wrapper 的 CSS 类
    const disabledWrappers = tbodyTrs[tbodyTrs.length - 1].findAll(".disabled-wrapper");
    // 很多个字段应该被包裹了 (项目标签、预计离职、族群类别、职级、社保地、工作地、生效、失效、原因、备注)
    expect(disabledWrappers.length).toBeGreaterThan(5);
  });
});
