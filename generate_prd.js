const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, AlignmentType, LevelFormat } = require('docx');
const fs = require('fs');

const doc = new Document({
    styles: {
        default: {
            document: {
                run: { font: "Arial", size: 24 }
            }
        },
        paragraphStyles: [
            {
                id: "Heading1",
                name: "Heading 1",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: { size: 36, bold: true, font: "Arial", color: "000000" },
                paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 }
            },
            {
                id: "Heading2",
                name: "Heading 2",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: { size: 28, bold: true, font: "Arial", color: "000000" },
                paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 }
            }
        ]
    },
    sections: [{
        properties: {
            page: {
                size: { width: 11906, height: 16838 } // A4
            }
        },
        children: [
            new Paragraph({
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                children: [new TextRun("HCM 系统：预算变更记录功能 PRD")]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun("版本：v1.0 | 状态：草案 | 日期：2026-04-13")]
            }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1. 项目背景与目标")] }),
            new Paragraph({
                children: [new TextRun("在当前的预算管理流程中，HCM 系统与财务系统（TA）之间存在数据脱节。由于缺乏精细的预算变更日志，财务部门难以追溯人员变动、组织调整对具体财务科目产生的影响。本功能旨在通过记录每一笔预算变更的明细（含 HC、科目、项目标签），实现人财数据的无缝对接与透明化。")]
            }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2. 用户场景")] }),
            new Paragraph({
                children: [new TextRun("• HR 负责人：在审批通过后，查看该笔审批对部门年度预算的具体影响。")],
                numbering: { reference: "bullets", level: 0 }
            }),
            new Paragraph({
                children: [new TextRun("• 部门经理：在人员带 HC 调动后，确认预算是否已正确转移至目标项目标签。")],
                numbering: { reference: "bullets", level: 0 }
            }),
            new Paragraph({
                children: [new TextRun("• 财务审计：定期从数据中台提取变更日志，核对 HCM 编制成本与财务预算科目的一致性。")],
                numbering: { reference: "bullets", level: 0 }
            }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3. 功能需求详述")] }),
            new Paragraph({ children: [new TextRun("3.1 变更日志触发机制")] }),
            new Table({
                width: { size: 9000, type: WidthType.DXA },
                columnWidths: [2000, 7000],
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun("触发场景")] })], shading: { fill: "F2F2F2", type: ShadingType.CLEAR } }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun("触发时机与逻辑")] })], shading: { fill: "F2F2F2", type: ShadingType.CLEAR } })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun("预算审批")] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun("审批单流程走到“已通过”状态时，自动生成日志记录。")] })] })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun("带 HC 调动")] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun("调动流程生效当刻，分别记录调出部门（负值）和调入部门（正值）的变动。")] })] })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun("组织架构调整")] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun("部门撤销或剪切时，记录游离状态 HC 的失效以及预算的快照转移。")] })] })
                        ]
                    })
                ]
            }),

            new Paragraph({ spacing: { before: 200 }, children: [new TextRun("3.2 数据结构定义")] }),
            new Paragraph({
                children: [new TextRun("日志必须包含以下关键字段，以满足财务系统 TA 的入账需求：")]
            }),
            new Paragraph({ children: [new TextRun("• 基础字段：日志 ID、发生时间、变更类型、部门、人员/费用类别。")], numbering: { reference: "bullets", level: 0 } }),
            new Paragraph({ children: [new TextRun("• 核心字段：HC 变动数量（支持整数及“-”）、总预算变动金额（元）。")], numbering: { reference: "bullets", level: 0 } }),
            new Paragraph({ children: [new TextRun("• 财务明细字段（List 结构）：财务科目 ID、科目名称、项目标签、变动金额。")], numbering: { reference: "bullets", level: 0 } }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4. 交互设计规范")] }),
            new Paragraph({ children: [new TextRun("• 入口：工薪预算驾驶舱 -> 预实比对弹窗 -> 预算变更记录按钮。")] }),
            new Paragraph({ children: [new TextRun("• 展示形式：采用嵌套表格。外层展示变更汇总，内层（折叠/展开）展示财务科目明细。")] }),
            new Paragraph({ children: [new TextRun("• 筛选：支持按“部门”、“日志编号”、“变更类型”进行模糊搜索及精确筛选。")] }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5. 数据同步规范")] }),
            new Paragraph({ children: [new TextRun("HCM 系统不直接与财务系统 TA 对接，而是通过数据中台进行中转。")] }),
            new Paragraph({ children: [new TextRun("1. 数据落地：HCM 实时将日志写入 dw.hcm_budget_change_log_snapshot。")] }),
            new Paragraph({ children: [new TextRun("2. 中台采集：数据中台定时（建议每 2 小时）采集增量数据。")] }),
            new Paragraph({ children: [new TextRun("3. TA 获取：财务系统根据需要从数据中台资产中拉取日志。")] }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6. 非功能性需求")] }),
            new Paragraph({ children: [new TextRun("• 数据一致性：日志生成的事务必须与业务操作（如审批状态更新）一致。")] }),
            new Paragraph({ children: [new TextRun("• 性能：支持单次查询 10,000+ 条记录的快速分页展示（加载时间 < 1s）。")] }),
            new Paragraph({ children: [new TextRun("• 安全：仅具有“预算查看”权限的人员可访问该记录。")] })
        ]
    }],
    numbering: {
        config: [
            {
                reference: "bullets",
                levels: [{
                    level: 0,
                    format: LevelFormat.BULLET,
                    text: "•",
                    alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 720, hanging: 360 } } }
                }]
            }
        ]
    }
});

Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync("/Users/xianer/Documents/HR 系统/antigravity/HCM/预算变更记录功能_产品方案_v1.0.docx", buffer);
    console.log("PRD generated successfully.");
});
