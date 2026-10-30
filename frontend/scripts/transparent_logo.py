from PIL import Image, ImageFilter
import numpy as np

SRC = 'src/assets/logo.jpg'
OUT_APP = 'src/assets/logo.png'
OUT_FAV = 'public/logo.png'

img = Image.open(SRC).convert('RGB')
arr = np.array(img).astype(np.int16)
r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

# 背景 = 接近白色（三个通道都很高）。蓝色弧线/文字的 R 通道接近 0，不会被误删。
white = (r > 240) & (g > 240) & (b > 240)

# 生成 alpha：背景透明，其余不透明
alpha = np.where(white, 0, 255).astype(np.uint8)

# 羽化边缘：对 alpha 做轻微高斯模糊，软化锯齿与白边
alpha_img = Image.fromarray(alpha, mode='L')
alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(radius=1.2))
alpha = np.array(alpha_img)

rgba = np.dstack([arr.astype(np.uint8), alpha])
out = Image.fromarray(rgba, mode='RGBA')

# 裁掉四周纯透明边距，保留主体
out = out.crop(out.getbbox())

# 应用内嵌 logo 最大宽度 400px，2x 屏足够清晰且体积可控
app_w = 400
w, h = out.size
app_h = int(h * app_w / w)
app = out.resize((app_w, app_h), Image.Resampling.LANCZOS)
app.save(OUT_APP, 'PNG')
print('saved', OUT_APP, app.size)

# favicon 64x64
fav = out.resize((64, 64), Image.Resampling.LANCZOS)
fav.save(OUT_FAV, 'PNG')
print('saved', OUT_FAV, fav.size)
