import matplotlib.pyplot as plt
import matplotlib.patches as patches

plt.rcParams['font.family'] = 'Noto Sans JP'

def draw_pipeline_final():
    fig, ax = plt.subplots(figsize=(16, 10))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # --- Title ---
    ax.text(8, 9.5, "Content Pipeline & Progress Flow", ha='center', va='center', fontsize=16, fontweight='bold')

    # --- Horizontal Go Pipeline (Middle Row) ---
    box_y = 4.5
    box_w = 3.2
    box_h = 2.0
    
    # 1. API Receiver
    ax.add_patch(patches.Rectangle((0.5, box_y), box_w, box_h, lw=2, edgecolor='#007d9c', facecolor='#e0f7fa'))
    ax.text(0.5 + box_w/2, box_y + box_h/2, "1. API Receiver\n/api/edit\n\nHandleAdminApiEdit", ha='center', va='center', fontweight='bold', fontsize=9)

    # 2. Formatter
    ax.add_patch(patches.Rectangle((4.3, box_y), box_w, box_h, lw=2, edgecolor='#007d9c', facecolor='#e0f7fa'))
    ax.text(4.3 + box_w/2, box_y + box_h/2, "2. Formatter\n(Hatena, Markdown,\ntDiary, HTML)\n\nformatter.Format()", ha='center', va='center', fontweight='bold', fontsize=9)

    # 3. Postprocess Caller
    ax.add_patch(patches.Rectangle((8.1, box_y), box_w, box_h, lw=2, edgecolor='#007d9c', facecolor='#e0f7fa'))
    ax.text(8.1 + box_w/2, box_y + box_h/2, "3. Postprocess\nCaller\n\nPostprocessWithProgress", ha='center', va='center', fontweight='bold', fontsize=9)

    # 4. DB Store
    ax.add_patch(patches.Rectangle((11.9, box_y), box_w, box_h, lw=2, edgecolor='#007d9c', facecolor='#e0f7fa'))
    ax.text(11.9 + box_w/2, box_y + box_h/2, "4. DB Store\nUpdate entries table\n\nqueries.UpdateEntry", ha='center', va='center', fontweight='bold', fontsize=9)

    # --- External: Node.js (Top) ---
    node_x, node_y = 8.1, 7.5
    ax.add_patch(patches.Rectangle((node_x, node_y), box_w, 1.2, lw=2, edgecolor='#68a063', facecolor='#e1f0e0'))
    ax.text(node_x + box_w/2, node_y + 0.6, "Node.js Process\n(postprocess/main.js)", ha='center', va='center', fontweight='bold', fontsize=9)

    # --- External: Browser (Bottom) ---
    browser_y = 1.0
    # Save Click
    ax.add_patch(patches.Rectangle((0.5, browser_y), box_w, 1.2, lw=2, edgecolor='#333', facecolor='#f9f9f9'))
    ax.text(0.5 + box_w/2, browser_y + 0.6, "Browser\n(Click Save)", ha='center', va='center', fontweight='bold', fontsize=9)
    
    # Progress UI / SSE Handler
    ax.add_patch(patches.Rectangle((8.1, browser_y), box_w, 1.2, lw=2, edgecolor='#333', facecolor='#f9f9f9'))
    ax.text(8.1 + box_w/2, browser_y + 0.6, "Browser UI\n(SSE Progress / Done)", ha='center', va='center', fontweight='bold', fontsize=9)

    # Redirect Target
    ax.add_patch(patches.Rectangle((12.5, browser_y), 2.5, 1.2, lw=2, edgecolor='#006600', facecolor='#f0fff0'))
    ax.text(12.5 + 1.25, browser_y + 0.6, "Redirected Page\n(Final Result)", ha='center', va='center', fontweight='bold', fontsize=9)

    # --- Arrows & Flow ---
    
    # Browser -(POST)-> Go(1)
    ax.annotate("POST /api/edit", xy=(2.1, 4.5), xytext=(2.1, 2.2), arrowprops=dict(arrowstyle="->", lw=1.5, color='blue'))
    
    # Go Pipeline arrows
    ax.annotate("", xy=(4.3, 5.5), xytext=(3.7, 5.5), arrowprops=dict(arrowstyle="->", lw=1.5))
    ax.annotate("", xy=(8.1, 5.5), xytext=(7.5, 5.5), arrowprops=dict(arrowstyle="->", lw=1.5))
    ax.annotate("", xy=(11.9, 5.5), xytext=(11.3, 5.5), arrowprops=dict(arrowstyle="->", lw=1.5))

    # Go(3) <-> Node (exec & stderr)
    # Call
    ax.annotate("exec", xy=(9.2, 7.5), xytext=(9.2, 6.5), arrowprops=dict(arrowstyle="->", lw=1.5, color='orange'))
    # Stderr Pipe
    ax.annotate("stderr (Progress)", xy=(10.2, 6.5), xytext=(10.2, 7.5), arrowprops=dict(arrowstyle="->", lw=1.2, color='red', ls='--'))

    # Go(3) -(SSE Progress)-> Browser
    ax.annotate("SSE Message", xy=(9.7, 2.2), xytext=(9.7, 4.5), arrowprops=dict(arrowstyle="->", lw=1.5, color='purple', ls='--'))
    ax.text(10.0, 3.2, "JSON Progress", fontsize=8, color='purple')

    # Go(4) -(SSE Done)-> Browser
    ax.annotate("SSE {type: 'done'}", xy=(10.8, 2.2), xytext=(12.5, 4.5), arrowprops=dict(arrowstyle="->", lw=1.5, color='green', connectionstyle="arc3,rad=0.2"))

    # Browser UI -(Redirect)-> Final Page
    ax.annotate("window.location", xy=(12.5, 1.6), xytext=(11.3, 1.6), arrowprops=dict(arrowstyle="->", lw=1.5, color='green'))

    # Background Labels
    ax.text(0.2, 5.5, "Go Backend", va='center', ha='right', fontsize=12, color='#007d9c', rotation=90, fontweight='bold')
    ax.text(0.2, 1.6, "Browser", va='center', ha='right', fontsize=12, color='#333', rotation=90, fontweight='bold')

    plt.tight_layout()
    plt.savefig("docs/content_pipeline_diagram.png", dpi=150)

if __name__ == "__main__":
    draw_pipeline_final()
