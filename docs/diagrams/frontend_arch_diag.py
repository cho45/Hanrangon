import matplotlib.pyplot as plt
import matplotlib.patches as patches

plt.rcParams['font.family'] = 'Noto Sans JP'

def draw_frontend_arch():
    fig, ax = plt.subplots(figsize=(12, 8))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)
    ax.axis('off')

    # --- Title ---
    ax.text(6, 7.5, "Frontend Architecture", ha='center', va='center', fontsize=16, fontweight='bold')

    # --- Development Area (Admin Only) ---
    dev_box = patches.Rectangle((0.5, 4.5), 3.5, 2.5, linewidth=2, edgecolor='#333', facecolor='#fdfdfd', linestyle='--')
    ax.add_patch(dev_box)
    ax.text(2.25, 6.7, "Source Code (Admin)", ha='center', va='center', fontweight='bold', fontsize=10)
    
    svelte_rect = patches.Rectangle((1.0, 5.0), 2.5, 1.2, linewidth=1.5, edgecolor='#ff3e00', facecolor='#ffece6')
    ax.add_patch(svelte_rect)
    ax.text(2.25, 5.6, "admin-frontend/\n(Svelte + TS + Vite)", ha='center', va='center', fontsize=9)

    # --- Build Action (Pointing to admin/ box) ---
    ax.annotate("Build\n(npm run build)", xy=(5.0, 4.5), xytext=(2.25, 5.0),
                arrowprops=dict(arrowstyle="->", lw=2.0, color='#666', connectionstyle="arc3,rad=-0.2"),
                ha='center', fontsize=9, color='#444')

    # --- Static Assets (Served by Go) ---
    static_box = patches.Rectangle((4.5, 1.0), 7.0, 5.5, linewidth=2, edgecolor='#2b5797', facecolor='#f0f4f9')
    ax.add_patch(static_box)
    ax.text(8.0, 6.2, "static/ (Served by Go Backend)", ha='center', va='center', fontweight='bold', fontsize=11)

    # Admin Assets
    admin_static = patches.Rectangle((5.0, 3.5), 2.5, 2.0, linewidth=1.5, edgecolor='#cc0000', facecolor='#fff0f0')
    ax.add_patch(admin_static)
    ax.text(6.25, 5.2, "admin/", ha='center', va='center', fontweight='bold', fontsize=9)
    ax.text(6.25, 4.3, "admin-front.js\nadmin-frontend.css", ha='center', va='center', fontsize=8)

    # Public Assets
    public_static = patches.Rectangle((8.5, 3.5), 2.5, 2.0, linewidth=1.5, edgecolor='#006600', facecolor='#f0fff0')
    ax.add_patch(public_static)
    ax.text(9.75, 5.2, "js/ & css/", ha='center', va='center', fontweight='bold', fontsize=9)
    ax.text(9.75, 4.3, "nogag.js\nstyle.css\n(Pure JS/CSS)", ha='center', va='center', fontsize=8)

    # --- Views (HTML Templates) ---
    view_box = patches.Rectangle((4.5, 1.5), 7.0, 1.5, linewidth=1.5, edgecolor='#555', facecolor='#eee')
    ax.add_patch(view_box)
    ax.text(8.0, 2.7, "view/ (Go html/template)", ha='center', va='center', fontweight='bold', fontsize=10)

    # Admin View
    admin_view = patches.Rectangle((5.0, 1.7), 2.5, 0.8, linewidth=1, edgecolor='#888', facecolor='#ddd')
    ax.add_patch(admin_view)
    ax.text(6.25, 2.1, "admin/layout.html\n(SPA Root)", ha='center', va='center', fontsize=8)

    # Public View
    public_view = patches.Rectangle((8.5, 1.7), 2.5, 0.8, linewidth=1, edgecolor='#888', facecolor='#ddd')
    ax.add_patch(public_view)
    ax.text(9.75, 2.1, "layout.html\n(SSR)", ha='center', va='center', fontsize=8)

    # --- Arrows: Static -> View (Load) ---
    # Admin Load
    ax.annotate("", xy=(6.25, 2.5), xytext=(6.25, 3.5), arrowprops=dict(arrowstyle="<-", lw=1.5, color='blue'))
    ax.text(6.6, 3.0, "Load", fontsize=9, color='blue', va='center')

    # Public Load
    ax.annotate("", xy=(9.75, 2.5), xytext=(9.75, 3.5), arrowprops=dict(arrowstyle="<-", lw=1.5, color='blue'))
    ax.text(10.1, 3.0, "Load", fontsize=9, color='blue', va='center')

    # --- Labels ---
    ax.text(6.25, 0.5, "[Admin Side: Svelte SPA]", ha='center', va='center', color='#cc0000', fontweight='bold')
    ax.text(9.75, 0.5, "[Public Side: SSR + Pure JS]", ha='center', va='center', color='#006600', fontweight='bold')

    plt.tight_layout()
    plt.savefig("docs/frontend_arch_diagram.png", dpi=150)

if __name__ == "__main__":
    draw_frontend_arch()
