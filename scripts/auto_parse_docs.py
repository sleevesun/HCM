import os
import shutil
import docx2txt
import pdfplumber

SOURCE_DIR = "/Users/xianer/Library/Mobile Documents/com~apple~CloudDocs/Documents/HR 系统/HR系统文档-面向HR开放等14个文件/进行中项目文档/202409 HC控制"
TARGET_DIR = "/Users/xianer/Library/Mobile Documents/com~apple~CloudDocs/Documents/HR 系统/antigravity/HCM/docs/knowledge_base"
ASSETS_DIR = os.path.join(TARGET_DIR, "assets")

MODULES = {
    "01_预算编制与控制": ["预算编制", "年初标识", "预算调整", "人财一体"],
    "02_入职与调动校验": ["校验", "入职", "调动", "双向校验", "数据交互"],
    "03_过渡期HC方案": ["过渡期HC方案", "过渡期 HC", "过渡期HC"],
    "04_部门级预算申请与审批": ["部门级预算申请与移动端审批界面优化", "部门级预算申请"],
    "05_系统切换与过渡期执行": ["系统切换", "上线准备", "过渡期执行"],
}

def determine_module(filename):
    for mod_name, keywords in MODULES.items():
        for kw in keywords:
            if kw in filename:
                return mod_name
    return "00_综合与通用规范"

def parse_docx(file_path, base_name, module_dir):
    try:
        # Extract text and images
        text = docx2txt.process(file_path, ASSETS_DIR)
        
        # docx2txt extracts images directly into ASSETS_DIR as image1.png, image2.jpeg, etc.
        # We need to rename them to avoid overwriting from other documents.
        # However, docx2txt doesn't tell us exactly which images it just extracted easily, 
        # so we find files in ASSETS_DIR that start with "image" and rename them.
        # A safer way is to extract to a temp dir, then move and rename.
        
        temp_img_dir = os.path.join(ASSETS_DIR, f"temp_{base_name}")
        os.makedirs(temp_img_dir, exist_ok=True)
        text = docx2txt.process(file_path, temp_img_dir)
        
        extracted_images = os.listdir(temp_img_dir)
        for img in extracted_images:
            new_img_name = f"{base_name}_{img}"
            shutil.move(os.path.join(temp_img_dir, img), os.path.join(ASSETS_DIR, new_img_name))
            # Also replace the image reference in the text, if docx2txt happens to put the filename in text.
            # docx2txt doesn't put markdown image links by default, but we can append them at the bottom.
            text += f"\n\n![{img}](../assets/{new_img_name})"
            
        shutil.rmtree(temp_img_dir)
        
        md_path = os.path.join(TARGET_DIR, module_dir, f"{base_name}.md")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"✅ DOCX 解析成功: {base_name}.md -> {module_dir}")
    except Exception as e:
        print(f"❌ DOCX 解析失败 {base_name}: {e}")

def parse_pdf(file_path, base_name, module_dir):
    try:
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
                    
        md_path = os.path.join(TARGET_DIR, module_dir, f"{base_name}.md")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"✅ PDF 解析成功: {base_name}.md -> {module_dir}")
    except Exception as e:
        print(f"❌ PDF 解析失败 {base_name}: {e}")

def main():
    os.makedirs(ASSETS_DIR, exist_ok=True)
    
    for root, dirs, files in os.walk(SOURCE_DIR):
        if ".trae" in root:
            continue
            
        for file in files:
            if file.startswith("~") or file.startswith("."):
                continue
                
            file_path = os.path.join(root, file)
            base_name, ext = os.path.splitext(file)
            ext = ext.lower()
            
            if ext in [".docx", ".pdf"]:
                module_dir = determine_module(base_name)
                # Ensure module dir exists
                os.makedirs(os.path.join(TARGET_DIR, module_dir), exist_ok=True)
                
                if ext == ".docx":
                    parse_docx(file_path, base_name, module_dir)
                elif ext == ".pdf":
                    parse_pdf(file_path, base_name, module_dir)

if __name__ == "__main__":
    main()
