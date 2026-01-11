import math

import matplotlib.pyplot as plt
import numpy as np

plt.rcParams["font.family"] = "Noto Sans JP"
plt.rcParams["font.weight"] = "black"


def oklch_to_rgb(L, C, H_deg):
    """OKLCH から sRGB (0.0-1.0) への変換 (簡易実装)"""
    h_rad = math.radians(H_deg)
    a = C * math.cos(h_rad)
    b_ok = C * math.sin(h_rad)

    # OKLab to LMS
    l_ = L + 0.3963377774 * a + 0.2158037573 * b_ok
    m_ = L - 0.1055613458 * a - 0.0638541728 * b_ok
    s_ = L - 0.0894841775 * a - 1.291485548 * b_ok

    l3, m3, s3 = l_**3, m_**3, s_**3

    # LMS to Linear RGB
    r_lin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
    g_lin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413190965 * s3
    b_lin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3

    # Linear RGB to sRGB (gamma correction)
    def f(v):
        return 12.92 * v if v <= 0.0031308 else 1.055 * (v ** (1 / 2.4)) - 0.055

    r = max(0, min(1, f(r_lin)))
    g = max(0, min(1, f(g_lin)))
    b = max(0, min(1, f(b_lin)))
    return (r, g, b)


# 定数の設定 (Goの実装と一致)
lightness_steps = [0.25, 0.45, 0.65, 0.85]  # L=0 to L=3
# 可視化のために彩度を強調 (C0=やや落ち着いた色, C1=非常に鮮やかな色)
chroma_steps = [0.08, 0.35]
hue_steps = [i * 45 for i in range(8)]  # H=0 to H=7 (45度刻み)

# 64ビットを 16ビットごとに積み重ねる (4行 x 16列)
fig, ax = plt.subplots(figsize=(18, 6))

grid_colors = np.zeros((4, 16, 3))
for li in range(4):
    for hi in range(8):
        for ci in range(2):
            bit_pos = (li << 4) | (hi << 1) | ci

            l_val = lightness_steps[li]
            h_val = hue_steps[hi]
            c_val = chroma_steps[ci]

            color = oklch_to_rgb(l_val, c_val, h_val)

            # 座標計算: row=li (0=Top), col=hi*2+ci
            row = li
            col = (hi << 1) | ci
            grid_colors[row, col] = color

            # テキストラベル (明るさに応じて白/黒を切り替え)
            text_color = "white" if l_val < 0.5 else "black"
            ax.text(
                col,
                row,
                f"bit {bit_pos}\n{h_val}° C{ci}",
                ha="center",
                va="center",
                fontsize=8,
                color=text_color,
                fontweight="bold",
            )

# 描画 (extent で座標系を固定。yは 0 が上、3 が下)
ax.imshow(grid_colors, extent=[-0.5, 15.5, 3.5, -0.5])

# 軸の設定
ax.set_xticks(range(16))
ax.set_xticklabels([f"H{i // 2} C{i % 2}" for i in range(16)], fontsize=9)
ax.set_yticks(range(4))
ax.set_yticklabels(
    [f"L{i} (Lightness)" for i in range(4)], fontsize=12, fontweight="bold"
)
ax.xaxis.set_ticks_position("top")
ax.xaxis.set_label_position("top")
ax.set_xlabel("Hue & Chroma pairs ([H(3bit)|C(1bit)])", fontsize=12, labelpad=10)

plt.suptitle(
    "Hanrangon 64-Bit Image Signature: OKLCH Mapping Grid\n"
    "Address = [ Lightness(2bit) | Hue(3bit) | Chroma(1bit) ]",
    fontsize=16,
    y=1.1,
)

# ファイル保存
output_path = "docs/similar-image-oklch.png"
plt.tight_layout()
plt.savefig(output_path, bbox_inches="tight", dpi=150)
print(f"Visualization saved to: {output_path}")
plt.show()
