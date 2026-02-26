import fs from 'fs';
import path from 'path';

const RAW_FILE_PATH = '/Users/zhuanzhuan/Documents/HR 系统/antigravity/HCM/申请前人员数据.md';
const OUTPUT_JSON_PATH = '/Users/zhuanzhuan/Documents/HR 系统/antigravity/HCM/HCM0107/src/mocks/largeScaleBudgetData.json';
const OUTPUT_DICT_PATH = '/Users/zhuanzhuan/Documents/HR 系统/antigravity/HCM/HCM0107/src/mocks/dataDictionary.md';

function generateRandomId(prefix) {
    // Use high precision time + random to minimize collision
    return `${prefix}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
}

function generatePhone() {
    return `1${Math.floor(Math.random() * 10).toString().repeat(2)}****${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
}

function generateIdCard() {
    return `11010119900101${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}*`; // Masked
}

function generateEmail(name, id) {
    // Fallback to ID if name is non-Latin
    const latinName = name.replace(/[^a-zA-Z0-9]/g, '');
    const prefix = latinName.length > 0 ? latinName : `user_${id}`;
    return `${prefix.toLowerCase()}****@antigravity.com`;
}

function getRankByTitle(title) {
    const map = {
        '高级工程师': 'P7',
        '工程师': 'P6',
        '助理工程师': 'P5',
        '资深专家': 'P9',
        '专家': 'P8'
    };
    return map[title] || 'P5';
}

function parseRawData(content) {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);
    const root = {
        id: 'ROOT',
        name: '星云工作室',
        type: 'group',
        children: [],
        totalYear: 0,
        months: {}
    };

    let currentDept = null;
    let currentPerson = null;
    let valueCollectionMode = false;
    let values = [];
    
    // Simple state machine
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Remove line numbers if present (e.g., "1→星云工作室")
        const cleanLine = line.replace(/^\d+→/, '').trim();
        
        if (!cleanLine) continue;

        if (cleanLine === '星云工作室') continue; // Root handled manually

        if (cleanLine.endsWith('部') || cleanLine === '客户端' || cleanLine === '服务器') {
            // New Department
            if (currentDept) {
                root.children.push(currentDept);
            }
            currentDept = {
                id: generateRandomId('D'),
                name: cleanLine,
                type: 'dept',
                children: [],
                months: {},
                totalYear: 0
            };
            currentPerson = null;
            valueCollectionMode = false;
        } else if (cleanLine.startsWith('正编') || cleanLine.startsWith('实习')) {
            // New Person
            const isReg = cleanLine.startsWith('正编');
            const name = cleanLine.replace(/^(正编|实习)/, '');
            const newId = generateRandomId('E');
            
            currentPerson = {
                id: newId,
                name: name || `Unknown${i}`, // Handle empty name for pure types
                type: 'person',
                tag: isReg ? 'REG' : 'INT',
                tagName: isReg ? '正编' : '实习',
                months: {},
                totalYear: 0,
                // Extended fields
                phone: generatePhone(),
                email: generateEmail(name || 'user', newId),
                idCard: generateIdCard(),
                jobTitle: isReg ? '工程师' : '实习生',
                rank: isReg ? 'P6' : 'Intern',
                dataSource: 'mock',
                createTime: Date.now()
            };
            values = [];
            valueCollectionMode = true;
        } else if (cleanLine.includes('工资(万)')) {
            // Skip header
            continue;
        } else if (valueCollectionMode) {
            // It's a number
            // Remove commas and handle '-'
            let valStr = cleanLine.replace(/,/g, '');
            if (valStr === '-') valStr = '0';
            
            const val = parseFloat(valStr);
            if (!isNaN(val)) {
                values.push(val);
                // Check if we have 13 values (12 months + total)
                // BUT wait, looking at raw data:
                // 19→10.4 (Jan) ... 30→10.4 (Dec) => 12 lines
                // 31→124.8 (Total) => 13th line
                if (values.length === 13) {
                    for (let m = 1; m <= 12; m++) {
                        currentPerson.months[m] = { salary: values[m-1] };
                    }
                    currentPerson.totalYear = values[12];
                    if (currentDept) {
                        currentDept.children.push(currentPerson);
                        currentDept.totalYear += currentPerson.totalYear;
                    }
                    valueCollectionMode = false;
                }
            }
        }
    }
    if (currentDept) root.children.push(currentDept);
    
    // Aggregate Dept totals
    root.children.forEach(dept => {
        // Recalculate monthly totals for dept
        for (let m = 1; m <= 12; m++) {
            dept.months[m] = { salary: 0 };
            dept.children.forEach(p => {
                dept.months[m].salary += p.months[m]?.salary || 0;
            });
            // Round to 1 decimal
            dept.months[m].salary = Math.round(dept.months[m].salary * 10) / 10;
        }
        // Recalculate year total
        dept.totalYear = dept.children.reduce((acc, p) => acc + p.totalYear, 0);
        dept.totalYear = Math.round(dept.totalYear * 10) / 10;
    });

    return root;
}

function augmentData(root) {
    // We need 200+ records.
    let count = 0;
    root.children.forEach(d => count += d.children.length);
    console.log(`Original count: ${count}`);
    
    const target = 220;
    const needed = target - count;
    
    if (needed > 0) {
        // Clone existing people to fill up
        const allPeople = root.children.flatMap(d => d.children);
        
        // If we have very few people, create synthetic ones from scratch
        if (allPeople.length === 0) {
             // Fallback if parsing failed completely
             console.log("Parsing found 0 people. Generating synthetic data.");
             const depts = ['Dept A', 'Dept B', 'Dept C'];
             depts.forEach(dName => {
                 const dept = {
                     id: generateRandomId('D'),
                     name: dName,
                     type: 'dept',
                     children: [],
                     months: {},
                     totalYear: 0
                 };
                 for(let k=0; k<70; k++) {
                     const p = {
                        id: generateRandomId('E_SYN_'),
                        name: `User_${k}`,
                        type: 'person',
                        tag: 'REG',
                        tagName: '正编',
                        months: {},
                        totalYear: 100,
                        phone: generatePhone(),
                        email: generateEmail(`User_${k}`),
                        idCard: generateIdCard(),
                        jobTitle: 'Engineer',
                        rank: 'P6',
                        dataSource: 'mock',
                        createTime: Date.now()
                     };
                     for(let m=1; m<=12; m++) p.months[m] = {salary: 10};
                     dept.children.push(p);
                 }
                 root.children.push(dept);
             });
             return [root];
        }

        for (let i = 0; i < needed; i++) {
            const source = allPeople[i % allPeople.length];
            const deptIndex = i % root.children.length;
            const dept = root.children[deptIndex];
            
            // Deep clone to avoid reference issues
            const newPerson = JSON.parse(JSON.stringify(source));
            newPerson.id = generateRandomId('E_AUG_');
            newPerson.name = `${source.name}_${i}`;
            newPerson.phone = generatePhone();
            newPerson.email = generateEmail(newPerson.name, newPerson.id);
            newPerson.idCard = generateIdCard();
            
            // Edge cases (10%)
            if (i < target * 0.1) {
                newPerson.name = 'VeryLongName_'.repeat(5); // Boundary: Long name
                newPerson.totalYear = 99999.9; // Boundary: Large number
            }
            
            // Abnormal cases (5%)
            if (i > target * 0.1 && i <= target * 0.15) {
                newPerson.email = 'invalid-email'; // Abnormal format
                newPerson.phone = ''; // Missing value
            }

            dept.children.push(newPerson);
            // Update dept totals roughly
            dept.totalYear += newPerson.totalYear;
        }
    }
    
    return [root]; // Return as array
}

try {
    const content = fs.readFileSync(RAW_FILE_PATH, 'utf8');
    const root = parseRawData(content);
    const finalData = augmentData(root);
    
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(finalData, null, 2));
    console.log(`Successfully wrote ${OUTPUT_JSON_PATH}`);
    
    // Generate Dictionary
    // Calculate final stats
    let totalRecords = 0;
    finalData[0].children.forEach(d => totalRecords += d.children.length);
    const deptNames = finalData[0].children.map(d => d.name).join(', ');

    const dictionaryContent = `# Mock Data Dictionary

## Overview
This dataset simulates pre-application personnel salary budget data for the HCM system.
Generated at: ${new Date().toISOString()}

## Statistics
- **Total Records**: ${totalRecords}
- **Departments**: ${deptNames}
- **Source**: Parsed from raw data and augmented with synthetic records.

## Schema Definition

| Field Name | Data Type | Description | Constraints / Logic |
|------------|-----------|-------------|---------------------|
| \`id\` | String | Unique Identifier | Generated random ID (Prefix 'E' for Employee, 'D' for Dept). |
| \`name\` | String | Person/Dept Name | Original names preserved; augmented names suffixed. Edge cases include very long strings. |
| \`type\` | Enum | Entity Type | Values: 'group', 'dept', 'person'. |
| \`tag\` | Enum | Employment Type | 'REG' (Regular), 'INT' (Intern). |
| \`tagName\` | String | Tag Display Name | '正编', '实习'. |
| \`jobTitle\` | String | Job Position | Inferred from context (e.g., Engineer, Intern). |
| \`rank\` | String | Professional Rank | Linked to Job Title (P5-P9). |
| \`phone\` | String | Phone Number | Masked format: 138****1234. Includes empty strings for abnormal cases. |
| \`email\` | String | Email Address | Masked format: pinyin****@domain. Includes invalid formats for abnormal cases. |
| \`idCard\` | String | ID Card Number | Masked format: 18 digits with asterisks. |
| \`months\` | Object | Monthly Salary | Keyed by month (1-12). Contains \`salary\` value. |
| \`totalYear\` | Number | Annual Total | Sum of 12 months. Includes large values for boundary tests. |
| \`dataSource\` | String | Data Source | Fixed value 'mock'. |
| \`createTime\` | Number | Creation Timestamp | Unix timestamp of generation. |

## Data Generation Rules
1. **Parsing**: Raw data from \`申请前人员数据.md\` is parsed to extract departments, names, and salary figures.
2. **Augmentation**: Existing records are cloned and modified to reach the minimum 200 record count.
3. **Sensitive Data**: PII fields (Phone, Email, ID) are generated using random algorithms with masking applied.
4. **Edge Cases**:
   - 10% of augmented records have extreme values (long names, high salaries).
   - 5% of augmented records have abnormal values (invalid email, missing phone).
5. **Consistency**: Department totals are recalculated based on child records.
`;
    fs.writeFileSync(OUTPUT_DICT_PATH, dictionaryContent);
    console.log(`Successfully wrote ${OUTPUT_DICT_PATH}`);
    
} catch (err) {
    console.error('Error:', err);
}
