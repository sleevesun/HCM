import fs from 'fs';
import path from 'path';

const DATA_PATH = '/Users/zhuanzhuan/Documents/HR 系统/antigravity/HCM/HCM0107/src/mocks/largeScaleBudgetData.json';

try {
    const rawData = fs.readFileSync(DATA_PATH, 'utf8');
    const root = JSON.parse(rawData);
    
    // We need to recalculate totals
    // 1. Recalculate Person totals (ensure year = sum(months))
    // 2. Recalculate Dept totals (sum of persons)
    // 3. Recalculate Group totals (sum of depts)
    // 4. Generate 'totalSalary' (Annual Total Compensation) for everyone: 1.28-1.51 * totalYear
    
    function round(num) {
        return Math.round(num * 10) / 10;
    }

    function processNode(node) {
        if (node.type === 'person') {
            // 1. Re-sum months
            let sum = 0;
            for (let m = 1; m <= 12; m++) {
                sum += (node.months[m]?.salary || 0);
            }
            node.totalYear = round(sum);
            
            // 3. Generate totalSalary (Annual Total Compensation)
            // Random factor between 1.28 and 1.51
            const factor = 1.28 + Math.random() * (1.51 - 1.28);
            node.totalSalary = round(node.totalYear * factor);
            
            // HC count
            node.hcCount = 1;
            
            return node;
        } else {
            // Group or Dept
            let yearSum = 0;
            let salarySum = 0;
            let hcSum = 0;
            const monthsSum = {};
            for(let m=1; m<=12; m++) monthsSum[m] = 0;

            if (node.children) {
                node.children.forEach(child => {
                    processNode(child);
                    yearSum += (child.totalYear || 0);
                    salarySum += (child.totalSalary || 0);
                    hcSum += (child.hcCount || 0);
                    
                    for(let m=1; m<=12; m++) {
                        monthsSum[m] += (child.months[m]?.salary || 0);
                    }
                });
            }
            
            node.totalYear = round(yearSum);
            node.totalSalary = round(salarySum);
            node.hcCount = hcSum;
            
            // Update node months
            if (!node.months) node.months = {};
            for(let m=1; m<=12; m++) {
                if(!node.months[m]) node.months[m] = {};
                node.months[m].salary = round(monthsSum[m]);
            }
            
            return node;
        }
    }
    
    // The root is an array
    root.forEach(processNode);
    
    fs.writeFileSync(DATA_PATH, JSON.stringify(root, null, 2));
    console.log("Data consistency update complete.");
    
} catch (err) {
    console.error(err);
}
