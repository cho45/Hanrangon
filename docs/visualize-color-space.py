import math

import matplotlib.pyplot as plt
import numpy as np

plt.rcParams["font.family"] = "Noto Sans JP"


def oklch_to_rgb(L, C, H_deg):
    h_rad = math.radians(H_deg)
    a = C * math.cos(h_rad)
    b_ok = C * math.sin(h_rad)
    l_ = L + 0.3963377774 * a + 0.2158037573 * b_ok
    m_ = L - 0.1055613458 * a - 0.0638541728 * b_ok
    s_ = L - 0.0894841775 * a - 1.291485548 * b_ok
    l3, m3, s3 = l_**3, m_**3, s_**3
    r_lin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
    g_lin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413190965 * s3
    b_lin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3

    def f(v):
        return 12.92 * v if v <= 0.0031308 else 1.055 * (v ** (1 / 2.4)) - 0.055

    return (
        max(0, min(1, f(r_lin))),
        max(0, min(1, f(g_lin))),
        max(0, min(1, f(b_lin))),
    )


# 可視化用のスケーリング定数
MAX_C_VIS = 0.4
MID_C_VIS = 0.2  # 視覚的に分かりやすくするため内層を 50% の位置にする


# 1. バケツにピッタリ収まるピクセルデータの生成
def generate_bucket_pixels(l_idx, h_idx, c_idx, n=800):
    l_min, l_max = l_idx * 0.25, (l_idx + 1) * 0.25
    h_min, h_max = h_idx * 45, (h_idx + 1) * 45
    # 視覚的な彩度の範囲
    c_min_vis, c_max_vis = (0, MID_C_VIS) if c_idx == 0 else (MID_C_VIS, MAX_C_VIS)
    # 実際の OKLCH の彩度範囲 (色の計算用)
    c_min_real, c_max_real = (0, 0.05) if c_idx == 0 else (0.05, 0.4)

    ls = np.random.uniform(l_min, l_max, n)
    hs = np.random.uniform(h_min, h_max, n)
    cs_vis = np.random.uniform(c_min_vis, c_max_vis, n)
    cs_real = np.random.uniform(c_min_real, c_max_real, n)

    rgbs = [oklch_to_rgb(l, cr, h) for l, cr, h in zip(ls, cs_real, hs)]
    xs = [cv * math.cos(math.radians(h)) for cv, h in zip(cs_vis, hs)]
    ys = [cv * math.sin(math.radians(h)) for cv, h in zip(cs_vis, hs)]
    return xs, ys, ls, rgbs


# 特徴的なバケツを複数埋める
np.random.seed(42)
x1, y1, z1, c1 = generate_bucket_pixels(2, 3, 1)  # 明るい緑 (Vivid)
x2, y2, z2, c2 = generate_bucket_pixels(1, 0, 1)  # 暗い赤 (Vivid)
x3, y3, z3, c3 = generate_bucket_pixels(3, 0, 0)  # 非常に明るい無彩色 (Muted)
x4, y4, z4, c4 = generate_bucket_pixels(0, 5, 0)  # 真っ暗な青系 (Muted)

X = np.concatenate([x1, x2, x3, x4])
Y = np.concatenate([y1, y2, y3, y4])
Z = np.concatenate([z1, z2, z3, z4])
COLORS = c1 + c2 + c3 + c4

# 3. 3D描画
fig = plt.figure(figsize=(12, 12))
ax = fig.add_subplot(111, projection="3d")
ax.set_axis_off()

# 散布図
ax.scatter(X, Y, Z, c=COLORS, s=15, alpha=0.6, edgecolors="none", zorder=10)

# 4. 円柱状グリッド
theta = np.linspace(0, 2 * np.pi, 100)

# Lightness 円盤
for l in [0, 0.25, 0.5, 0.75, 1.0]:
    ax.plot(
        MAX_C_VIS * np.cos(theta),
        MAX_C_VIS * np.sin(theta),
        l,
        color="gray",
        alpha=0.2,
        linewidth=0.8,
    )

# 彩度境界 (2層)
phi = np.linspace(0, 1, 20)
Theta, Phi = np.meshgrid(theta, phi)
ax.plot_surface(
    MAX_C_VIS * np.cos(Theta), MAX_C_VIS * np.sin(Theta), Phi, color="blue", alpha=0.03
)
ax.plot_surface(
    MID_C_VIS * np.cos(Theta), MID_C_VIS * np.sin(Theta), Phi, color="red", alpha=0.08
)

# Hue 放射線と色ラベル
for h in range(0, 360, 45):
    rad = math.radians(h)
    x, y = MAX_C_VIS * math.cos(rad), MAX_C_VIS * math.sin(rad)
    ax.plot([0, x], [0, y], [0, 0], color="gray", alpha=0.2, linewidth=0.5)
    ax.plot([x, x], [y, y], [0, 1], color="gray", alpha=0.2, linewidth=0.5)

    # セクションの中間に色ラベルを配置 (h + 22.5°)
    h_mid = h + 22.5
    rad_mid = math.radians(h_mid)
    xm, ym = MAX_C_VIS * 1.2 * math.cos(rad_mid), MAX_C_VIS * 1.2 * math.sin(rad_mid)

    label_color = oklch_to_rgb(0.6, 0.3, h_mid)
    ax.scatter(
        [xm], [ym], [0], color=label_color, s=120, edgecolors="black", linewidth=0.5
    )
    ax.text(
        xm * 1.15,
        ym * 1.15,
        0,
        f"H{h // 45}",
        ha="center",
        va="center",
        fontsize=10,
        fontweight="bold",
    )

# 中央軸
ax.plot([0, 0], [0, 0], [0, 1], color="black", alpha=0.3, linestyle="-.")

ax.text(0, 0, 1.05, "Lightness (明るさ)", ha="center", fontsize=12, fontweight="bold")
ax.text(MAX_C_VIS, 0, -0.15, "Vivid (外層)", ha="center", fontsize=10)
ax.text(MID_C_VIS, 0, -0.15, "Muted (内層)", ha="center", fontsize=10)

plt.suptitle(
    "L=4段 H=8方向 C=2層のバケツを持つヒストグラムのイメージ\n(空間上の特定の小部屋が埋まると、指紋の対応ビットが立つ)",
    fontsize=18,
    y=0.82,
)

ax.view_init(elev=25, azim=30)
plt.tight_layout()
output_path = "docs/visualize-color-space.png"
plt.savefig(output_path, dpi=150, transparent=True)
plt.show()
