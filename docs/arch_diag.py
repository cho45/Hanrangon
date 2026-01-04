import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_arch():
    fig, ax = plt.subplots(figsize=(12, 10))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # --- DBs (Bottom) ---
    db_y = 0.5
    db_width = 1.8
    db_height = 0.8
    dbs = {
        "Main DB": (1.0, db_y),
        "Images DB": (3.2, db_y),
        "TFIDF DB": (5.4, db_y),
        "Worker DB": (9.0, db_y)
    }

    for name, (x, y) in dbs.items():
        rect = patches.Rectangle((x, y), db_width, db_height, linewidth=1.2, edgecolor='black', facecolor='#e6f3ff')
        ax.add_patch(rect)
        ax.text(x + db_width/2, y + db_height/2, name, ha='center', va='center', fontweight='bold', fontsize=8)

    # --- Main Process Container ---
    proc_rect = patches.Rectangle((0.5, 2.5), 11, 6.0, linewidth=2, edgecolor='#333333', facecolor='#fdfdfd', linestyle='--')
    ax.add_patch(proc_rect)
    ax.text(6, 8.2, "Go Backend Process", ha='center', va='center', fontsize=14, fontweight='bold')

    # --- HTTP Server (Left) ---
    http_x, http_y = 1, 4.0
    http_w, http_h = 2.5, 2.5
    http_rect = patches.Rectangle((http_x, http_y), http_w, http_h, linewidth=1.5, edgecolor='blue', facecolor='#d1e7ff')
    ax.add_patch(http_rect)
    ax.text(http_x + http_w/2, http_y + 2.1, "HTTP Server", ha='center', va='center', fontweight='bold')

    # --- Scheduled Execution (Top Center) ---
    sched_x, sched_y = 4.5, 6.5
    sched_w, sched_h = 2.5, 1.2
    sched_rect = patches.Rectangle((sched_x, sched_y), sched_w, sched_h, linewidth=1.5, edgecolor='green', facecolor='#d1ffd1')
    ax.add_patch(sched_rect)
    ax.text(sched_x + sched_w/2, sched_y + 0.6, "Scheduled\nExecution", ha='center', va='center', fontweight='bold', fontsize=9)

    # --- Job Worker (Right) ---
    worker_box_x, worker_box_y = 8.5, 3.5
    worker_box_w, worker_box_h = 2.5, 4.0
    worker_rect = patches.Rectangle((worker_box_x, worker_box_y), worker_box_w, worker_box_h, linewidth=1.5, edgecolor='red', facecolor='#fff0f0')
    ax.add_patch(worker_rect)
    ax.text(worker_box_x + worker_box_w/2, worker_box_y + 3.6, "Job Worker", ha='center', va='center', fontweight='bold')

    # Individual Job Handlers
    job_names = ["RecalculateTFIDF", "IndexImages", "UpdateTrackbacks"]
    for i, name in enumerate(job_names):
        jy = worker_box_y + 0.3 + i * 1.0
        rect = patches.Rectangle((worker_box_x + 0.2, jy), worker_box_w - 0.4, 0.8, linewidth=1, edgecolor='#cc0000', facecolor='#ffcccc')
        ax.add_patch(rect)
        ax.text(worker_box_x + worker_box_w/2, jy + 0.4, name, ha='center', va='center', fontsize=7)

    # --- External: Node.js ---
    node_rect = patches.Rectangle((0.75, 9.0), 3.0, 0.6, linewidth=1.5, edgecolor='#68a063', facecolor='#e1f0e0')
    ax.add_patch(node_rect)
    ax.text(2.25, 9.3, "Node.js (postprocess)", ha='center', va='center', fontweight='bold', fontsize=9)

    # --- Arrows ---
    ax.annotate("", xy=(2.25, 9.0), xytext=(2.25, 6.5), arrowprops=dict(arrowstyle="->", lw=1.5, color='orange'))
    ax.text(2.35, 7.8, "exec", fontsize=8, color='orange')

    ax.annotate("", xy=(9.0, 1.3), xytext=(3.5, 5.0), 
                arrowprops=dict(arrowstyle="->", lw=1.2, color='blue', connectionstyle="arc3,rad=-0.2"))
    ax.text(5.5, 3.5, "Enqueue Job", fontsize=9, color='blue', fontweight='bold', ha='center')

    ax.annotate("", xy=(1.9, 1.3), xytext=(4.5, 6.5), 
                arrowprops=dict(arrowstyle="->", lw=1.2, color='green'))
    ax.text(2.5, 3.2, "Publish Entry", fontsize=9, color='green', fontweight='bold', ha='center', rotation=45)

    ax.annotate("", xy=(9.9, 1.3), xytext=(7.0, 6.5), 
                arrowprops=dict(arrowstyle="->", lw=1.2, color='green'))
    ax.text(8.0, 4.8, "Enqueue Job", fontsize=9, color='green', fontweight='bold', ha='center')

    ax.annotate("", xy=(9.9, 1.3), xytext=(9.9, 3.5), arrowprops=dict(arrowstyle="<->", lw=1.5, color='red'))
    ax.text(10.0, 2.4, "Poll Job", fontsize=9, color='red', fontweight='bold')

    plt.title("Backend Architecture", fontsize=16, pad=20)
    plt.tight_layout()
    plt.savefig("docs/arch_diagram.png", dpi=150)

if __name__ == "__main__":
    draw_arch()
