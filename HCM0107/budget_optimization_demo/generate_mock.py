import csv
from collections import defaultdict
import os
import random
from functools import cmp_to_key

def generate_mock_data():
    output_dir = "/Users/xianer/Library/Mobile Documents/com~apple~CloudDocs/Documents/HR 系统/antigravity/HCM/HCM0107/budget_optimization_demo"
    os.makedirs(output_dir, exist_ok=True)
    
    # 部门定义
    DEPT_2 = "游戏工作室群"
    DEPT_3 = "幻塔工作室"
    DEPT_4_LIST = ["策划部", "程序部", "美术部", "测试部"]

    project_names = ["幻塔重制版", "星云引擎", "代号:远方", "仙剑世界", "基础技术中台", "商业化运营平台"]

    # 姓氏与名字库（用于生成逼真的模拟名字）
    surnames = ["赵", "钱", "孙", "李", "周", "吴", "郑", "王", "冯", "陈", "褚", "卫", "蒋", "沈", "韩", "杨", "朱", "秦", "尤", "许", "何", "吕", "施", "张", "孔", "曹", "严", "华", "金", "魏", "陶", "姜", "戚", "谢", "邹", "喻", "柏", "水", "窦", "章", "云", "苏", "潘", "葛", "奚", "范", "彭", "郎", "鲁", "韦", "昌", "马", "苗", "凤", "花", "方", "俞", "任", "袁", "柳", "酆", "鲍", "史", "唐", "费", "廉", "岑", "薛", "雷", "贺", "倪", "汤", "滕", "殷", "罗", "毕", "郝", "邬", "安", "常", "乐", "于", "时", "傅", "皮", "卞", "齐", "康", "伍", "余", "元", "卜", "顾", "孟", "平", "黄", "和", "穆", "萧", "尹", "姚", "邵", "湛", "汪", "祁", "毛", "禹", "狄", "米", "贝", "明", "臧", "计", "伏", "成", "戴", "谈", "宋", "茅", "庞", "熊", "纪", "舒", "屈", "项", "祝", "董", "梁", "杜", "阮", "蓝", "闵", "席", "季", "麻", "强", "贾", "路", "娄", "危", "江", "童", "颜", "郭", "梅", "盛", "林", "刁", "钟", "徐", "邱", "骆", "高", "夏", "蔡", "田", "樊", "胡", "凌", "霍", "虞", "万", "支", "柯", "昝", "管", "卢", "莫", "经", "房", "裘", "缪", "干", "解", "应", "宗", "丁", "宣", "贲", "邓", "郁", "单", "杭", "洪", "包", "诸", "左", "石", "崔", "吉", "钮", "龚", "程", "嵇", "邢", "滑", "裴", "陆", "荣", "翁", "荀", "羊", "於", "惠", "甄", "曲", "家", "封", "芮", "羿", "储", "靳", "汲", "邴", "糜", "松", "井", "段", "富", "巫", "乌", "焦", "巴", "弓", "牧", "隗", "山", "谷", "车", "侯", "宓", "蓬", "全", "郗", "班", "仰", "秋", "仲", "伊", "宫", "宁", "仇", "栾", "暴", "甘", "钭", "厉", "戎", "祖", "武", "符", "刘", "景", "詹", "束", "龙", "叶", "幸", "司", "韶", "郜", "黎", "蓟", "薄", "印", "宿", "白", "怀", "蒲", "邰", "从", "鄂", "索", "咸", "籍", "赖", "卓", "蔺", "屠", "蒙", "池", "乔", "阴", "郁", "胥", "能", "苍", "双", "闻", "莘", "党", "翟", "谭", "贡", "劳", "逄", "姬", "申", "扶", "堵", "冉", "宰", "郦", "雍", "郤", "璩", "桑", "桂", "濮", "牛", "寿", "通", "边", "扈", "燕", "冀", "郏", "浦", "尚", "农", "温", "别", "庄", "晏", "柴", "瞿", "阎", "充", "慕", "连", "茹", "习", "宦", "艾", "鱼", "容", "向", "古", "易", "慎", "戈", "廖", "庾", "终", "暨", "居", "衡", "步", "都", "耿", "满", "弘", "匡", "国", "文", "寇", "广", "禄", "阙", "东", "欧", "殳", "沃", "利", "蔚", "越", "夔", "隆", "师", "巩", "厍", "聂", "晁", "勾", "敖", "融", "冷", "訾", "辛", "阚", "那", "简", "饶", "空", "曾", "毋", "沙", "乜", "养", "鞠", "须", "丰", "巢", "关", "蒯", "相"]
    first_names = ["伟", "芳", "娜", "敏", "静", "秀英", "丽", "强", "磊", "军", "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "秀兰", "霞", "平", "刚", "桂英", "燕", "辉", "玲", "丹", "斌", "飞", "玉兰", "鹏", "红", "玉梅", "峰", "健", "英", "兰", "华", "萍", "欣", "建国", "建华", "云", "佳", "波", "晨", "雪", "旭", "建", "宇", "博", "宁", "浩", "瑞", "睿", "宏", "琪", "萱", "瑶", "嘉", "鑫", "俊", "坤", "洁", "林", "帆", "斌", "昊", "星", "颖", "雨", "月", "松", "雷", "婷", "翔", "威", "海", "阳", "亮", "健", "远", "辉", "力", "明", "志", "文", "强", "东", "光", "成", "利", "胜", "波", "飞", "海", "兴", "荣", "华", "健", "平", "保", "东", "文", "辉", "力", "明", "智", "达", "诚", "先", "敬", "震", "振", "壮", "会", "思", "群", "豪", "心", "邦", "承", "乐", "绍", "功", "松", "善", "厚", "庆", "磊", "民", "友", "裕", "河", "哲", "江", "超", "浩", "亮", "政", "谦", "亨", "奇", "固", "之", "轮", "翰", "朗", "伯", "宏", "言", "若", "鸣", "朋", "斌", "梁", "栋", "维", "启", "克", "伦", "翔", "旭", "鹏", "泽", "晨", "辰", "士", "以", "建", "家", "致", "树", "炎", "德", "行", "时", "泰", "盛", "雄", "琛", "钧", "冠", "策", "腾", "楠", "榕", "风", "航", "弘"]
    
    def get_random_name():
        return random.choice(surnames) + random.choice(first_names)

    hcs = []
    hc_counter = 1
    
    # 为每个四级部门生成 10正编、3实习、2外包
    for dept in DEPT_4_LIST:
        for _ in range(10):
            hcs.append({"id": f"HC-{hc_counter:04d}", "name": get_random_name(), "type": "正编", "dept4": dept, "base": random.randint(15000, 40000), "start": 1, "end": 12, "project_label": random.choice(project_names)})
            hc_counter += 1
        for _ in range(3):
            hcs.append({"id": f"HC-{hc_counter:04d}", "name": get_random_name(), "type": "实习生", "dept4": dept, "base": random.randint(3000, 6000), "start": 1, "end": 12, "project_label": random.choice(project_names)})
            hc_counter += 1
        for _ in range(2):
            hcs.append({"id": f"HC-{hc_counter:04d}", "name": get_random_name(), "type": "人力外包", "dept4": dept, "base": random.randint(10000, 20000), "start": 1, "end": 12, "project_label": random.choice(project_names)})
            hc_counter += 1
            
    # 在策划部增加 1个 正编减员 (全年月度数据为负值)
    hcs.append({"id": f"HC-{hc_counter:04d}", "name": "减员占位", "type": "正编", "dept4": "策划部", "base": -20000, "start": 1, "end": 12, "project_label": "-"})
    hc_counter += 1

    # 幻塔工作室直属 2个 正编 HC（四级部门为空）
    hcs.append({"id": f"HC-{hc_counter:04d}", "name": get_random_name(), "type": "正编", "dept4": "", "base": 50000, "start": 1, "end": 12, "project_label": random.choice(project_names)})
    hc_counter += 1
    hcs.append({"id": f"HC-{hc_counter:04d}", "name": get_random_name(), "type": "正编", "dept4": "", "base": 45000, "start": 1, "end": 12, "project_label": random.choice(project_names)})
    hc_counter += 1

    # 补差额 HC
    diff_hcs = []
    diff_counter = 1
    for dept in DEPT_4_LIST + [""]:
        diff_hcs.append({"id": f"Pool-Diff-{diff_counter:02d}", "name": "补差额", "type": "正编", "dept4": dept, "base": 0, "diff_month": random.randint(1, 12), "diff_val": random.choice([3000, -2000, 5000, -1000])})
        diff_counter += 1
        diff_hcs.append({"id": f"Pool-Diff-{diff_counter:02d}", "name": "补差额", "type": "人力外包", "dept4": dept, "base": 0, "diff_month": random.randint(1, 12), "diff_val": random.choice([1500, -800, 2000])})
        diff_counter += 1

    # 部门级预算
    dept_budgets = []
    db_counter = 1
    for dept in DEPT_4_LIST + [""]:
        dept_budgets.append(
            {"id": f"Dept-Budget-{db_counter:02d}", "name": "部门级预算", "type": "部门级预算", "dept4": dept, 
             "budgets": {"离职补偿金": random.randint(50000, 200000), "加班费": random.randint(30000, 100000), "签约金_month": random.randint(1, 12), "签约金_val": random.randint(10000, 50000)}}
        )
        db_counter += 1

    # 科目名称变更：调整绩效浮动位置到饭补之后
    subjects = ['HC', '工资', '饭补', '绩效浮动', '社保总额', '公积金总额', '工会经费', '商业保险', '加班费', '离职补偿金', '签约金', '项目标签']
    months = [f"{m}月" for m in range(1, 13)]

    hc_headers = ["HC编码", "HC名称", "员工类型", "部门ID", "二级部门", "三级部门", "四级部门", "科目名称"] + months + ["全年"]
    dept_headers = ["员工类型", "部门ID", "二级部门", "三级部门", "四级部门", "科目名称"] + months + ["全年"]
    project_headers = ["员工类型", "项目名称", "项目ID", "科目名称"] + months + ["全年"]

    hc_rows = []
    dept_agg = defaultdict(lambda: {m: 0.0 for m in months + ["全年"]})
    project_agg = defaultdict(lambda: {m: 0.0 for m in months + ["全年"]})

    def is_subject_valid_for_type(subj, emp_type):
        if emp_type == "人力外包":
            return subj in ["HC", "工资", "项目标签"]
        elif emp_type == "实习生":
            return subj in ["HC", "工资", "饭补", "项目标签"]
        elif emp_type == "正编":
            return subj in ["HC", "工资", "饭补", "绩效浮动", "社保总额", "公积金总额", "工会经费", "商业保险", "项目标签"]
        elif emp_type == "部门级预算":
            return subj in ["离职补偿金", "加班费", "签约金"]
        return False

    # 处理常规 HC
    for hc in hcs:
        for subj in subjects:
            if not is_subject_valid_for_type(subj, hc["type"]):
                continue
                
            row = {
                "HC编码": hc["id"], "HC名称": hc["name"], "员工类型": hc["type"],
                "部门ID": "1900006", "二级部门": DEPT_2, "三级部门": DEPT_3, "四级部门": hc["dept4"],
                "科目名称": subj
            }
            total = 0.0
            for m in range(1, 13):
                val = 0.0
                if hc["start"] <= m <= hc["end"]:
                    if subj == 'HC': 
                        val = -1.0 if hc["base"] < 0 else 1.0
                    elif subj == '工资': val = hc["base"]
                    elif subj == '饭补': val = 400.0 if hc["base"] > 0 else -400.0
                    elif subj == '社保总额': val = hc["base"] * 0.15
                    elif subj == '公积金总额': val = hc["base"] * 0.12
                    elif subj == '工会经费': val = 50.0 if hc["base"] > 0 else -50.0
                    elif subj == '商业保险': val = 200.0 if hc["base"] > 0 else -200.0
                    elif subj == '绩效浮动': val = hc["base"] * 0.2
                    elif subj == '项目标签': val = hc.get("project_label", "-")

                if subj == '项目标签':
                    row[f"{m}月"] = val if hc["start"] <= m <= hc["end"] else "-"
                else:
                    row[f"{m}月"] = val
                    total += val
            
            if subj == '项目标签':
                row["全年"] = "-"
            elif subj == 'HC':
                row["全年"] = row["12月"]
            else:
                row["全年"] = total
            hc_rows.append(row)
            
            if subj != '项目标签':
                agg_key = (hc["type"], "1900006", DEPT_2, DEPT_3, hc["dept4"], subj)
                # 为项目报表聚合
                proj_name = hc.get("project_label", "-")
                proj_id = f"YX-{abs(hash(proj_name)) % 100000:05d}" if proj_name != "-" else "-"
                proj_agg_key = (hc["type"], proj_name, proj_id, subj)
                
                for m_str in months:
                    dept_agg[agg_key][m_str] += row[m_str]
                    project_agg[proj_agg_key][m_str] += row[m_str]
                dept_agg[agg_key]["全年"] += total
                project_agg[proj_agg_key]["全年"] += total

    # 处理补差额 HC
    for dhc in diff_hcs:
        for subj in subjects:
            if not is_subject_valid_for_type(subj, dhc["type"]):
                continue
                
            row = {
                "HC编码": dhc["id"], "HC名称": dhc["name"], "员工类型": dhc["type"],
                "部门ID": "1900006", "二级部门": DEPT_2, "三级部门": DEPT_3, "四级部门": dhc["dept4"],
                "科目名称": subj
            }
            total = 0.0
            for m in range(1, 13):
                val = 0.0
                if subj == 'HC': 
                    val = 0.0
                elif subj == '工资' and m >= dhc["diff_month"]:
                    val = dhc["diff_val"]
                elif subj == '项目标签':
                    val = "-"
                
                if subj == '项目标签':
                    row[f"{m}月"] = val
                else:
                    row[f"{m}月"] = val
                    total += val
            
            if subj == '项目标签':
                row["全年"] = "-"
            elif subj == 'HC':
                row["全年"] = row["12月"]
            else:
                row["全年"] = total
            hc_rows.append(row)
            
            if subj != '项目标签':
                agg_key = (dhc["type"], "1900006", DEPT_2, DEPT_3, dhc["dept4"], subj)
                proj_agg_key = (dhc["type"], "-", "-", subj)
                for m_str in months:
                    dept_agg[agg_key][m_str] += row[m_str]
                    project_agg[proj_agg_key][m_str] += row[m_str]
                dept_agg[agg_key]["全年"] += total
                project_agg[proj_agg_key]["全年"] += total

    # 处理部门级预算
    for db in dept_budgets:
        for subj in subjects:
            if not is_subject_valid_for_type(subj, db["type"]):
                continue
                
            row = {
                "HC编码": db["id"], "HC名称": db["name"], "员工类型": db["type"],
                "部门ID": "1900006", "二级部门": DEPT_2, "三级部门": DEPT_3, "四级部门": db["dept4"],
                "科目名称": subj
            }
            total = 0.0
            for m in range(1, 13):
                val = "-"
                if subj in ["离职补偿金", "加班费"]:
                    pass
                elif subj == "签约金":
                    if m == db["budgets"]["签约金_month"]:
                        val = db["budgets"]["签约金_val"]
                        total += val
                    else:
                        val = 0.0
                row[f"{m}月"] = val
            
            if subj in ["离职补偿金", "加班费"]:
                row["全年"] = db["budgets"][subj]
                total = db["budgets"][subj]
            else:
                row["全年"] = total
                
            hc_rows.append(row)
            
            agg_key = (db["type"], "1900006", DEPT_2, DEPT_3, db["dept4"], subj)
            proj_agg_key = (db["type"], "-", "-", subj)
            for m_str in months:
                if row[m_str] != "-":
                    dept_agg[agg_key][m_str] += row[m_str]
                    project_agg[proj_agg_key][m_str] += row[m_str]
            dept_agg[agg_key]["全年"] += total
            project_agg[proj_agg_key]["全年"] += total

    # 构建部门行
    dept_rows = []
    for k, v in dept_agg.items():
        if v["全年"] == 0 and k[5] not in ('HC', '工资'):
            continue
            
        r = {
            "员工类型": k[0], "部门ID": k[1], "二级部门": k[2], "三级部门": k[3], "四级部门": k[4], "科目名称": k[5]
        }
        
        for m_str in months:
            if k[0] == "部门级预算" and k[5] in ["离职补偿金", "加班费"]:
                r[m_str] = "-"
            else:
                r[m_str] = v[m_str]
                
        if k[5] == 'HC':
            r["全年"] = v["12月"]
        else:
            r["全年"] = v["全年"]
        dept_rows.append(r)

    # 构建项目行
    project_rows = []
    for k, v in project_agg.items():
        if v["全年"] == 0 and k[3] not in ('HC', '工资'):
            continue
            
        r = {
            "员工类型": k[0], "项目名称": k[1], "项目ID": k[2], "科目名称": k[3]
        }
        
        for m_str in months:
            if k[0] == "部门级预算" and k[3] in ["离职补偿金", "加班费"]:
                r[m_str] = "-"
            else:
                r[m_str] = v[m_str]
                
        if k[3] == 'HC':
            r["全年"] = v["12月"]
        else:
            r["全年"] = v["全年"]
        project_rows.append(r)

    def format_value(subj, val):
        if val == "-":
            return "-"
        if subj == "HC":
            # HC格式：整数并带千分位
            return "{:,}".format(int(float(val)))
        elif subj == "项目标签":
            # 文本格式
            return str(val)
        else:
            # 金额格式：保留2位小数并带千分位
            return "{:,.2f}".format(float(val))

    def sort_cmp(a, b):
        # 1. 员工类型排序
        type_order = {"正编": 0, "人力外包": 1, "实习生": 2, "劳务派遣": 3, "兼职": 4, "部门级预算": 5}
        type_a = type_order.get(a["员工类型"], 99)
        type_b = type_order.get(b["员工类型"], 99)
        if type_a != type_b:
            return type_a - type_b

        # 对于非项目报表，执行部门排序
        if "三级部门" in a and "三级部门" in b:
            # 2. 三级部门降序
            if a["三级部门"] != b["三级部门"]:
                return -1 if a["三级部门"] > b["三级部门"] else 1

            # 3. 四级部门降序 (空在最上)
            a_dept4 = a["四级部门"]
            b_dept4 = b["四级部门"]
            if a_dept4 != b_dept4:
                if a_dept4 == "": return -1
                if b_dept4 == "": return 1
                return -1 if a_dept4 > b_dept4 else 1
        
        # 对于项目报表，执行项目排序
        if "项目名称" in a and "项目名称" in b:
            if a["项目名称"] != b["项目名称"]:
                if a["项目名称"] == "-": return 1
                if b["项目名称"] == "-": return -1
                return -1 if a["项目名称"] > b["项目名称"] else 1

        # 4. 如果是 HC 报表，再按 HC 编码排序
        if "HC编码" in a and "HC编码" in b:
            if a["HC编码"] != b["HC编码"]:
                return -1 if a["HC编码"] > b["HC编码"] else 1
        
        # 5. 最后按科目名称原有顺序排序
        subj_a = subjects.index(a["科目名称"]) if a["科目名称"] in subjects else 99
        subj_b = subjects.index(b["科目名称"]) if b["科目名称"] in subjects else 99
        return subj_a - subj_b

    hc_rows.sort(key=cmp_to_key(sort_cmp))
    dept_rows.sort(key=cmp_to_key(sort_cmp))
    project_rows.sort(key=cmp_to_key(sort_cmp))

    # 将格式化应用到所有数据列
    for row in hc_rows:
        subj = row["科目名称"]
        for m in months + ["全年"]:
            row[m] = format_value(subj, row[m])

    for row in dept_rows:
        subj = row["科目名称"]
        for m in months + ["全年"]:
            row[m] = format_value(subj, row[m])

    for row in project_rows:
        subj = row["科目名称"]
        for m in months + ["全年"]:
            row[m] = format_value(subj, row[m])

    hc_csv_path = os.path.join(output_dir, 'HC预算报表_Mock.csv')
    with open(hc_csv_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=hc_headers)
        writer.writeheader()
        writer.writerows(hc_rows)

    dept_csv_path = os.path.join(output_dir, '部门预算报表_Mock.csv')
    with open(dept_csv_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=dept_headers)
        writer.writeheader()
        writer.writerows(dept_rows)

    project_csv_path = os.path.join(output_dir, '项目预算报表_Mock.csv')
    with open(project_csv_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=project_headers)
        writer.writeheader()
        writer.writerows(project_rows)

    print(f"✅ 生成成功：{hc_csv_path}")
    print(f"✅ 生成成功：{dept_csv_path}")
    print(f"✅ 生成成功：{project_csv_path}")

if __name__ == "__main__":
    generate_mock_data()