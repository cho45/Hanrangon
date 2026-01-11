import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np
import math

# フォント設定
fonts = [f.name for f in fm.fontManager.ttflist if 'Noto Sans JP' in f.name]
if fonts:
    plt.rcParams['font.family'] = fonts[0]
else:
    plt.rcParams['font.family'] = 'sans-serif'

def oklch_to_rgb(L, C, H_deg):
    """OKLCH から sRGB (0.0-1.0) への変換"""
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
    def f(v): return 12.92 * v if v <= 0.0031308 else 1.055 * (v**(1/2.4)) - 0.055
    return (max(0, min(1, f(r_lin))), max(0, min(1, f(g_lin))), max(0, min(1, f(b_lin))))

lightness_steps = [0.25, 0.45, 0.65, 0.85]
chroma_steps = [0.08, 0.35]
hue_steps = [i * 45 for i in range(8)]

# 比較描画 (Linear vs Z-Order)
fig, axes = plt.subplots(2, 1, figsize=(16, 14))

modes = [
    "[ L(2bit) | H(3bit) | C(1bit) ] (辞書順)",
    "[ H2 | L1 | H1 | L0 | H0 | C0 ] (Z-Order/インターリーブ)"
]

for mode_idx, mode in enumerate(modes):
    ax = axes[mode_idx]
    
    # 背景のカラーグリッド (平均的な色で描画)
    grid_colors = np.zeros((4, 8, 3))
    for li in range(4):
        for hi in range(8):
            # 中間的な彩度で背景を表示
            grid_colors[li, hi] = oklch_to_rgb(lightness_steps[li], 0.2, hue_steps[hi])
    ax.imshow(grid_colors, extent=[-0.5, 7.5, 3.5, -0.5], alpha=0.2)
    
    # 全ビットのパスを計算
    path_x = []
    path_y = []
    
    for bit_pos in range(64):
        if mode_idx == 0:
            li_val = (bit_pos >> 4) & 0x3
            hi_val = (bit_pos >> 1) & 0x7
            ci_val = bit_pos & 0x1
        else:
            h2 = (bit_pos >> 5) & 1
            l1 = (bit_pos >> 4) & 1
            h1 = (bit_pos >> 3) & 1
            l0 = (bit_pos >> 2) & 1
            h0 = (bit_pos >> 1) & 1
            ci_val = bit_pos & 1
            li_val = (l1 << 1) | l0
            hi_val = (h2 << 2) | (h1 << 1) | h0
        
        # 1つのセル内に C0 (右) と C1 (左) のオフセットを設ける
        # 3次元の奥行きを2次元平面に投影するイメージ
        offset_x = -0.2 if ci_val == 1 else 0.2
        offset_y = -0.1 if ci_val == 1 else 0.1 # わずかにずらして立体感を出す
        
        px, py = hi_val + offset_x, li_val + offset_y
        path_x.append(px)
        path_y.append(py)
        
        # 個別のビットの色
        dot_color = oklch_to_rgb(lightness_steps[li_val], chroma_steps[ci_val], hue_steps[hi_val])
        ax.plot(px, py, marker='o', markersize=8, color=dot_color, markeredgecolor='black', markeredgewidth=0.5)
        
        # ビット番号を表示 (重なりを防ぐために位置を調整)
        ax.text(px, py + (0.25 if ci_val==0 else -0.25), str(bit_pos), 
                ha='center', va='center', fontsize=8, fontweight='bold')

    # スキャンパスを線で結ぶ
    ax.plot(path_x, path_y, color='black', alpha=0.4, linewidth=1.5, zorder=0)
    
    ax.set_title(f"{mode}", fontsize=16, pad=20)
    ax.set_xticks(range(8))
    ax.set_xticklabels([f"H{i}" for i in range(8)])
    ax.set_yticks(range(4))
    ax.set_yticklabels([f"L{i}" for i in range(4)])
    ax.set_xlabel("色相 (Hue)")
    ax.set_ylabel("明るさ (Lightness)")

plt.suptitle("全64ビットのスキャンパス比較: 3次元空間(L,H,C)の埋め方\n" 
             "(各マス内の2つの点は 彩度 C1:鮮やか と C0:落ち着いた色 を表す)", fontsize=18, y=1.02)
plt.tight_layout()
output_path = "docs/similar-image-oklch.png"
plt.savefig(output_path, bbox_inches='tight', dpi=150)
print(f"Full 64-bit visualization saved to: {output_path}")
plt.show()
