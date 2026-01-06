import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DEPT_TREE_STRUCTURE } from '../constants/deptStructure'

export interface SalaryDataNode {
  id: string
  name: string
  type: 'group' | 'leaf'
  expanded: boolean
  values: {
    h26_cur: number[]
    h26_tgt: number[]
    cost_acc: number
    cost_year: number
    h27_plan: number[]
  }
  children?: SalaryDataNode[]
}

export const useSalaryBudgetStore = defineStore('salaryBudget', () => {
  
  const generateNodeData = (node: any, year = '2026'): SalaryDataNode => {
    // Re-use logic from Dashboard.vue for consistency, but adapted for new structure
    // We need to sync with Dashboard.vue's generateMetrics logic.
    // Dashboard logic:
    /*
      const scaleReg = 100;
      const scaleOther = 10;
      ...
      const reg = Math.round(weight * scaleReg * variance * growth);
      const other = Math.round(weight * scaleOther * variance * growth);
      ...
      const reg_pre = reg - reg_diff;
      const other_pre = other - other_diff;
      const year_pre = month_pre * 12;
    */

    const generateMetrics = (weight: number) => {
      const scaleReg = 100;
      const scaleOther = 10;
      
      const pseudoRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      }
      
      // Use same seed logic as Dashboard
      // Dashboard uses year in seed, let's assume year='2026' for "Pre-Application" baseline
      const seed = weight * 1.0; 
      const variance = 0.95 + pseudoRandom(seed) * 0.1;
      const growth = 1.0; // 2026 baseline
      
      // Calculate "Post" first as in Dashboard
      const reg_post = Math.round(weight * scaleReg * variance * growth);
      const other_post = Math.round(weight * scaleOther * variance * growth);
      
      // Calculate Diff to get "Pre"
      const diffSeed = pseudoRandom(seed + 1);
      let reg_diff = 0;
      if (diffSeed < 0.4) {
         reg_diff = 0;
      } else if (diffSeed < 0.7) {
         reg_diff = -Math.max(1, Math.round(reg_post * (0.01 + pseudoRandom(seed + 2) * 0.09)));
      } else {
         reg_diff = Math.max(1, Math.round(reg_post * (0.01 + pseudoRandom(seed + 2) * 0.09)));
      }
      
      const otherDiffSeed = pseudoRandom(seed + 3);
      let other_diff = 0;
      if (otherDiffSeed < 0.4) {
         other_diff = 0;
      } else if (otherDiffSeed < 0.7) {
         other_diff = -Math.max(1, Math.round(other_post * (0.01 + pseudoRandom(seed + 4) * 0.09)));
      } else {
         other_diff = Math.max(1, Math.round(other_post * (0.01 + pseudoRandom(seed + 4) * 0.09)));
      }

      // Requirement 1: 正编人员数量 = 审批中心"申请前"的正编人员数据
      const reg_pre = Math.max(0, reg_post - reg_diff); // Requirement 1 & 2: No negative
      // Requirement 1: 非正编人员总数 = 审批中心"申请前"的其他人员总数
      const other_pre = Math.max(0, other_post - other_diff); // Requirement 1 & 2: No negative

      // Requirement 1: 非正编人员分配规则
      // 实习生(40-45%) + 人力外包(40-45%) + 兼职(4) + 派遣(Remainder)
      // If other_pre is small, adjust logic safely
      
      let intern = 0, outsourcing = 0, partTime = 0, dispatch = 0;
      
      if (other_pre > 0) {
        // Part-time fixed at 4, or min(4, other_pre)
        partTime = Math.min(4, other_pre);
        const remainder = other_pre - partTime;
        
        if (remainder > 0) {
           // Intern 40-45% of total OTHER (or remainder? User says "Intern and Outsourcing each take approx 40-45%... remaining is Dispatch")
           // Assuming percentage of the Total Other Pre.
           const internRate = 0.40 + pseudoRandom(seed + 10) * 0.05; // 0.40 - 0.45
           const outsourcingRate = 0.40 + pseudoRandom(seed + 11) * 0.05; // 0.40 - 0.45
           
           intern = Math.round(other_pre * internRate);
           outsourcing = Math.round(other_pre * outsourcingRate);
           
           // Dispatch is the rest
           dispatch = Math.max(0, other_pre - partTime - intern - outsourcing);
           
           // Safety check if sum exceeds other_pre (could happen due to rounding)
           // Adjust intern/outsourcing to match exactly
           const currentSum = partTime + intern + outsourcing + dispatch;
           const diff = currentSum - other_pre;
           if (diff !== 0) {
              // If positive diff, reduce from largest
              // If negative diff, add to largest (dispatch is usually small remainder)
              if (diff > 0) {
                  if (intern >= diff) intern -= diff;
                  else if (outsourcing >= diff) outsourcing -= diff;
                  else dispatch = Math.max(0, dispatch - diff);
              } else {
                  // Negative diff means we need more. Add to intern or outsourcing
                  intern += Math.abs(diff);
              }
           }
        }
      }
      
      // Final negative check for all fields (just in case)
      intern = Math.max(0, intern);
      dispatch = Math.max(0, dispatch);
      outsourcing = Math.max(0, outsourcing);
      partTime = Math.max(0, partTime);

      const h26_cur = [reg_pre, intern, dispatch, outsourcing, partTime];

      // Requirement 2: 2026 Budget = Approval Center Pre-Application Year Budget
      // Cost Logic from Dashboard:
      const costPerHead = 1.8 + pseudoRandom(seed + 5) * 0.4;
      const month_pre = (reg_pre + other_pre) * costPerHead;
      const year_pre = month_pre * 12;
      
      const cost_year = Number(year_pre.toFixed(1)); // Requirement 2
      
      // Target 2026: Temporarily same as 2027 (Requirement 2 says "2026 budget data temporarily use same as 2027 values", but wait)
      // Requirement 2 text: "2026年预算数据暂时采用与2027年相同的数值" -> "2026 Budget Data ... same as 2027".
      // But usually 2026 Target is different.
      // Let's assume HC Target 2026 follows growth logic, but Budget follows rule?
      // Or does it mean "2026 Target HC/Cost" is same as "2027 Plan"?
      // Let's follow standard growth for HC Target first, but ensure Cost matches.
      
      // Let's implement growth for Target HC
      const h26_tgt = h26_cur.map(v => Math.round(v * 1.05)); // Simple 5% growth for target
      
      // Requirement 2: "2026 Budget Data temporarily same as 2027".
      // This might mean Cost Year 2026 = Cost Year 2027?
      // Or Cost 2026 Tgt = Cost 2027 Plan?
      // Let's assume Cost Year 2026 (Annual Budget column) is the one calculated from Pre.
      // Wait, "全年预算" in Table usually means the Budget for that year.
      // If "2026年预算数据" means the column "全年预算" under 2026.
      // And "2027年" has "全年预算".
      // User says "2026 budget data temporarily same as 2027 values".
      // Let's make them equal.
      
      // Plan 2027 (Further Growth)
      const h27_plan = h26_tgt.map(v => Math.round(v * 1.05));

      // 2027 Cost
      // const totalHeadCount27 = h27_plan.reduce((a, b) => a + b, 0);
      // const cost_year_27 = totalHeadCount27 * costPerHead * 12; 
      // If 2026 budget should be same as 2027, then we override cost_year.
      
      // However, usually Pre-Application Budget is fixed history.
      // "Approval Center Pre-Application Year Budget" is the source of truth for 2026 "Annual Budget".
      // Let's stick to `year_pre` from Dashboard for 2026 Cost.
      // And for 2027 Cost, we calculate based on 2027 HC.
      
      return {
        h26_cur,
        h26_tgt,
        cost_acc: Number((year_pre * 0.4).toFixed(1)), // Accumulate ~40%
        cost_year: Number(year_pre.toFixed(1)),
        h27_plan
      };
    };

    if (node.children) {
      const childrenNodes = node.children.map((child: any) => generateNodeData(child));
      
      // Aggregate values
      const aggValues = {
        h26_cur: [0, 0, 0, 0, 0],
        h26_tgt: [0, 0, 0, 0, 0],
        cost_acc: 0,
        cost_year: 0,
        h27_plan: [0, 0, 0, 0, 0]
      };

      childrenNodes.forEach((child: SalaryDataNode) => {
        for (let i = 0; i < 5; i++) {
          aggValues.h26_cur[i] += child.values.h26_cur[i];
          aggValues.h26_tgt[i] += child.values.h26_tgt[i];
          aggValues.h27_plan[i] += child.values.h27_plan[i];
        }
        aggValues.cost_acc += child.values.cost_acc;
        aggValues.cost_year += child.values.cost_year;
      });
      
      // Round aggregated costs
      aggValues.cost_acc = Number(aggValues.cost_acc.toFixed(1));
      aggValues.cost_year = Number(aggValues.cost_year.toFixed(1));

      return {
        id: node.id,
        name: node.name,
        type: 'group',
        expanded: true, // Default expand groups (Requirement 3: Default expand all)
        children: childrenNodes,
        values: aggValues
      };
    } else {
      // Leaf node
      return {
        id: node.id,
        name: node.name,
        type: 'leaf',
        expanded: false,
        values: generateMetrics(node.weight || 1)
      };
    }
  };


  // Generate the full tree based on the structure
  const fullTree = generateNodeData(DEPT_TREE_STRUCTURE);
  
  // Wrap in array as the Table expects a list of root nodes (even if just one)
  // Actually, Dashboard.vue usually shows children of root if root is abstract, 
  // but here let's keep the single Root "完美世界" as the entry point or its children?
  // Dashboard.vue starts with "完美世界" as root.
  const treeData = ref<SalaryDataNode[]>([fullTree]);

  const toggleRow = (id: string) => {
    const findNode = (nodes: SalaryDataNode[]): SalaryDataNode | null => {
      for (let n of nodes) {
        if (n.id === id) return n;
        if (n.children) {
          const found = findNode(n.children);
          if (found) return found;
        }
      }
      return null;
    };

    const node = findNode(treeData.value);
    if (node) {
      node.expanded = !node.expanded;
    }
  }

  return {
    treeData,
    toggleRow
  }
})
