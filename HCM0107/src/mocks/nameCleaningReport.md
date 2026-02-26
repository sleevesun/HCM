# Name Cleaning Report
    
## Summary
- **Total Records Processed**: 220 (approx)
- **Abnormal Records Found**: 177
- **Uniqueness Check**: Passed (All names are now unique)

## Anomaly Distribution
- **Format Error**: 177

## Replacement Log (First 50)
| ID | Old Name | New Name | Reason |
|----|----------|----------|--------|
| E_AUG_219956 | VeryLongName_VeryLongName_VeryLongName_VeryLongName_VeryLongName_ | 黎海 | Format Error |
| E_AUG_194515 | VeryLongName_VeryLongName_VeryLongName_VeryLongName_VeryLongName_ | 石永 | Format Error |
| E_AUG_039524 | VeryLongName_VeryLongName_VeryLongName_VeryLongName_VeryLongName_ | 陆坚 | Format Error |
| E_AUG_463137 | VeryLongName_VeryLongName_VeryLongName_VeryLongName_VeryLongName_ | 贾博 | Format Error |
| E_AUG_919857 | 宋羿森_24 | 何海兰 | Format Error |
| E_AUG_942123 | 李子轩_30 | 文若 | Format Error |
| E_AUG_088929 | 李婧_36 | 郝文 | Format Error |
| E_AUG_457944 | 张璐_42 | 毛瑶 | Format Error |
| E_AUG_302169 | 张鹏_48 | 廖亮 | Format Error |
| E_AUG_623358 | 王鑫_54 | 漕玲生 | Format Error |
| E_AUG_561101 | 于美琪_60 | 刘林天 | Format Error |
| E_AUG_808916 | 夏正扬_66 | 何军富 | Format Error |
| E_AUG_691620 | 张子怡_72 | 高海 | Format Error |
| E_AUG_642800 | 刘骞_78 | 吴忠有 | Format Error |
| E_AUG_466500 | 李洋_84 | 金瑶思 | Format Error |
| E_AUG_885150 | Unknown696_90 | 李一 | Format Error |
| E_AUG_554829 | 徐贺_96 | 郝刚亮 | Format Error |
| E_AUG_591926 | 刘若冰_102 | 徐生 | Format Error |
| E_AUG_758615 | 徐向文_108 | 吕健羿 | Format Error |
| E_AUG_288438 | 李炯键_114 | 廖德 | Format Error |
| E_AUG_332526 | 郭涵_120 | 孔艳心 | Format Error |
| E_AUG_487808 | 苏晨_126 | 王信兰 | Format Error |
| E_AUG_865553 | 宋宏宇_132 | 胡思 | Format Error |
| E_AUG_144789 | Unknown711_138 | 周秀 | Format Error |
| E_AUG_023057 | 王子旋_144 | 冯金思 | Format Error |
| E_AUG_601451 | 马凯强_150 | 黄军思 | Format Error |
| E_AUG_871267 | 秦思阳_156 | 赵生心 | Format Error |
| E_AUG_731712 | 吴金阳_162 | 傅道 | Format Error |
| E_AUG_041400 | 张长博_168 | 秦国 | Format Error |
| E_AUG_101465 | VeryLongName_VeryLongName_VeryLongName_VeryLongName_VeryLongName_ | 许国光 | Format Error |
| E_AUG_315212 | VeryLongName_VeryLongName_VeryLongName_VeryLongName_VeryLongName_ | 郭武璇 | Format Error |
| E_AUG_568102 | VeryLongName_VeryLongName_VeryLongName_VeryLongName_VeryLongName_ | 江扬伟 | Format Error |
| E_AUG_331332 | VeryLongName_VeryLongName_VeryLongName_VeryLongName_VeryLongName_ | 姚文 | Format Error |
| E_AUG_485726 | 张子怡_25 | 郭洋成 | Format Error |
| E_AUG_578976 | 刘骞_31 | 蒋瑶武 | Format Error |
| E_AUG_810761 | 李洋_37 | 漕新兰 | Format Error |
| E_AUG_596141 | Unknown696_43 | 萧清武 | Format Error |
| E_AUG_111496 | 徐贺_49 | 田成孝 | Format Error |
| E_AUG_748810 | 刘若冰_55 | 林连若 | Format Error |
| E_AUG_323605 | 徐向文_61 | 黎海林 | Format Error |
| E_AUG_320384 | 李炯键_67 | 邹娜连 | Format Error |
| E_AUG_241735 | 郭涵_73 | 朱亮 | Format Error |
| E_AUG_300893 | 苏晨_79 | 丁义 | Format Error |
| E_AUG_120340 | 宋宏宇_85 | 吴林 | Format Error |
| E_AUG_084429 | Unknown711_91 | 徐德生 | Format Error |
| E_AUG_677230 | 王子旋_97 | 郑武若 | Format Error |
| E_AUG_953003 | 马凯强_103 | 赖健明 | Format Error |
| E_AUG_424092 | 秦思阳_109 | 孟坚 | Format Error |
| E_AUG_917996 | 吴金阳_115 | 萧芳 | Format Error |
| E_AUG_382567 | 张长博_121 | 姚生 | Format Error |
... and 127 more.

## Validation Logic
- **Regex**: `^[\u4e00-\u9fa5]{2,4}$`
- **Uniqueness**: Checked against global set of names during generation.
