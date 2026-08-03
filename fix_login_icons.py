import re

path = r"D:\项目\quanqiuren-web\src\components\Index\LoginComponent.vue"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 用户名前的图标（img）-> User
pattern_user = re.compile(
    r'(<div style="display: flex; align-items: center; color: rgb\(37, 40, 59\)">)\s*<img[^>]*>\s*(用户名)'
)
# 密码前的图标（img）-> Lock
pattern_pass = re.compile(
    r'(<div style="display: flex; align-items: center; color: rgb\(37, 40, 59\)">)\s*<img[^>]*>\s*(密码)'
)

new_user = r'\1\n            <el-icon style="margin-right: 7px; font-size: 18px"><User /></el-icon>\n            \2'
new_pass = r'\1\n            <el-icon style="margin-right: 7px; font-size: 18px"><Lock /></el-icon>\n            \2'

content, n_user = pattern_user.subn(new_user, content)
content, n_pass = pattern_pass.subn(new_pass, content)

print("user img replaced:", n_user)
print("pass img replaced:", n_pass)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
