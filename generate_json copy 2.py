import subprocess
import json
import re
import os
from datetime import datetime

print("========================================")
print("     X光片 AI 分析工具 (支持自定义输出目录)  ")
print("========================================\n")

# 1. 获取图片路径
image_path = input("👉 请输入图片的完整路径 (可以直接把图片拖进终端): ").strip()
image_path = image_path.replace("'", "").replace('"', '')

if not os.path.exists(image_path):
    print(f"\n❌ 找不到图片：{image_path}")
    exit()

# 2. 获取提示词 (Prompt)
default_prompt = "Analyze this chest X-ray and output the findings in strict JSON format. Include keys: 'findings', 'impression'."
user_prompt = input(f"\n👉 请输入提示词 (直接回车使用默认提示): \n(默认: {default_prompt})\n> ").strip()

if not user_prompt:
    user_prompt = default_prompt

# 3. 获取输出目录 (新功能！)
default_out_dir = "./outputs"
out_dir_input = input(f"\n👉 请输入你要保存结果的文件夹路径 (直接回车使用默认文件夹: {default_out_dir}):\n> ").strip()

if not out_dir_input:
    out_dir = default_out_dir
else:
    out_dir = out_dir_input.replace("'", "").replace('"', '')

# 自动创建文件夹（如果不存在的话）
os.makedirs(out_dir, exist_ok=True)

# 4. 配置模型
model_id = "mlx-community/Qwen2-VL-2B-Instruct-4bit"

print("\n⏳ 正在调用本地模型进行分析，请稍候...")

# 5. 构建并执行命令
cmd = [
    "mlx_vlm.generate",
    "--model", model_id,
    "--max-tokens", "500",
    "--prompt", user_prompt,
    "--image", image_path
]

result = subprocess.run(cmd, capture_output=True, text=True)

if result.returncode == 0:
    raw_output = result.stdout
    print("\n✅ 模型运行完毕！")
    
    # 6. 提取 JSON
    match = re.search(r'\{.*\}', raw_output, re.DOTALL)
    if match:
        try:
            parsed_json = json.loads(match.group(0))
            
            # 在终端美观打印
            print("\n--- 提取到的 JSON 结果 ---")
            print(json.dumps(parsed_json, indent=2, ensure_ascii=False))
            
            # 7. 生成不重复的文件名并保存
            # 提取原始图片的文件名（不带后缀）
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            # 加上当前时间戳，精确到秒
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"{base_name}_result_{timestamp}.json"
            output_path = os.path.join(out_dir, output_filename)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(parsed_json, f, indent=2, ensure_ascii=False)
                
            print(f"\n💾 成功！JSON 已保存到：{output_path}")
            
        except json.JSONDecodeError:
            print("\n⚠️ 模型输出了内容，但不是有效的 JSON 格式。原始输出如下：")
            print(raw_output)
    else:
        print("\n⚠️ 未在模型输出中找到 JSON 结构。原始输出如下：")
        print(raw_output)
else:
    print("\n❌ 运行出错，错误信息：")
    print(result.stderr)