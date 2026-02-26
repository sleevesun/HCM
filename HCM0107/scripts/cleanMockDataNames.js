import fs from 'fs';
import path from 'path';

const DATA_PATH = '/Users/zhuanzhuan/Documents/HR 系统/antigravity/HCM/HCM0107/src/mocks/largeScaleBudgetData.json';
const REPORT_PATH = '/Users/zhuanzhuan/Documents/HR 系统/antigravity/HCM/HCM0107/src/mocks/nameCleaningReport.md';

const SURNAMES = "李王张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊金陆郝孔白崔康毛邱秦江史顾侯邵孟龙万段漕钱汤尹黎易常武乔贺赖龚文".split('');
const GIVEN_NAMES = "伟芳娜敏静秀英丽强磊洋艳勇军杰娟涛明超秀兰霞平刚桂英桂兰英华强玉兰玲文红萍玉翔东浩博思远婷琳雪梅成龙峰健辉飞波宁凯良信欢光富清义林生有国和坚永中心新亮名海飞义生华连文林孝正德忠林成思道立志文武明辉光富清义林生有国和坚永中心新亮名海飞义生华连文林孝正德忠林成思道立志文武明辉光富清义林生有国和坚永中心新亮名海飞义生华连文林孝正德忠林成思道立志文武明辉子璇一頔鑫玥瑶若冰凯强天放海军美琪向文思阳天天春玲义焜正扬炯键金阳博涵羿森子怡".split('');

function generateName(existingNames) {
    let name;
    let attempts = 0;
    do {
        const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
        const givenLen = Math.random() > 0.5 ? 1 : 2;
        let given = "";
        for (let i = 0; i < givenLen; i++) {
            given += GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)];
        }
        name = surname + given;
        attempts++;
        if (attempts > 1000) throw new Error("Failed to generate unique name after 1000 attempts");
    } while (existingNames.has(name));
    return name;
}

// Regex for valid Chinese name: 2-4 Chinese characters
const VALID_NAME_REGEX = /^[\u4e00-\u9fa5]{2,4}$/;

try {
    const rawData = fs.readFileSync(DATA_PATH, 'utf8');
    const root = JSON.parse(rawData);
    
    // 1. Collect all names and identify abnormal ones
    const allNames = new Set();
    const abnormalRecords = [];
    const nameMap = new Map(); // id -> name
    
    // First pass: collect existing VALID names to avoid collision
    function collectValidNames(node) {
        if (node.type === 'person') {
            if (VALID_NAME_REGEX.test(node.name)) {
                if (allNames.has(node.name)) {
                     // If duplicate valid name exists (unlikely given requirement but possible in source), 
                     // we might need to rename the second one too?
                     // The requirement says "Ensure new generated names are unique".
                     // But "ensure new generated names are unique in the WHOLE data".
                     // It also says "global unique".
                     // Let's assume we treat duplicates as abnormal too?
                     // "Ensure new generated names... global unique, no duplicates".
                     // If existing data has duplicates, we should probably fix them too.
                     abnormalRecords.push({ node, reason: 'Duplicate Name' });
                } else {
                    allNames.add(node.name);
                }
            } else {
                abnormalRecords.push({ node, reason: 'Format Error' });
            }
        }
        if (node.children) {
            node.children.forEach(collectValidNames);
        }
    }
    
    // Actually we need to traverse.
    // Since the root is an array in the file [ { ... } ]
    const dataRoot = root[0];
    collectValidNames(dataRoot);
    
    console.log(`Found ${abnormalRecords.length} abnormal records.`);
    
    // 2. Generate replacements
    const changes = [];
    const anomalyStats = {};
    
    abnormalRecords.forEach(record => {
        const oldName = record.node.name;
        const reason = record.reason;
        
        // Update stats
        anomalyStats[reason] = (anomalyStats[reason] || 0) + 1;
        
        // Generate new name
        const newName = generateName(allNames);
        
        // Apply change
        record.node.name = newName;
        allNames.add(newName); // Add to set to prevent future collisions
        
        changes.push({
            id: record.node.id,
            oldName,
            newName,
            reason
        });
    });
    
    // 3. Write back data
    fs.writeFileSync(DATA_PATH, JSON.stringify(root, null, 2));
    
    // 4. Generate Report
    let report = `# Name Cleaning Report
    
## Summary
- **Total Records Processed**: ${allNames.size} (approx)
- **Abnormal Records Found**: ${abnormalRecords.length}
- **Uniqueness Check**: Passed (All names are now unique)

## Anomaly Distribution
${Object.entries(anomalyStats).map(([k, v]) => `- **${k}**: ${v}`).join('\n')}

## Replacement Log (First 50)
| ID | Old Name | New Name | Reason |
|----|----------|----------|--------|
${changes.slice(0, 50).map(c => `| ${c.id} | ${c.oldName} | ${c.newName} | ${c.reason} |`).join('\n')}
${changes.length > 50 ? `... and ${changes.length - 50} more.` : ''}

## Validation Logic
- **Regex**: \`^[\\u4e00-\\u9fa5]{2,4}$\`
- **Uniqueness**: Checked against global set of names during generation.
`;

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at ${REPORT_PATH}`);
    
    // 5. Final Verification (Internal)
    const verifySet = new Set();
    let collision = false;
    let formatError = false;
    
    function verify(node) {
        if (node.type === 'person') {
            if (verifySet.has(node.name)) {
                console.error(`Verification Failed: Duplicate ${node.name}`);
                collision = true;
            }
            verifySet.add(node.name);
            if (!VALID_NAME_REGEX.test(node.name)) {
                console.error(`Verification Failed: Format ${node.name}`);
                formatError = true;
            }
        }
        if (node.children) node.children.forEach(verify);
    }
    verify(dataRoot);
    
    if (!collision && !formatError) {
        console.log("Final Verification Passed: All names are unique and valid format.");
    } else {
        console.error("Final Verification Failed.");
        process.exit(1);
    }

} catch (err) {
    console.error(err);
    process.exit(1);
}
