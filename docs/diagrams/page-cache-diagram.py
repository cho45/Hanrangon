import matplotlib.pyplot as plt
import matplotlib.patches as patches

# 日本語フォント設定
plt.rcParams['font.family'] = 'Noto Sans JP'

def draw_page_cache_diagram():
    fig, ax = plt.subplots(figsize=(12, 7))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # --- Title ---
    ax.text(6, 9.5, "Page Cache System (Two-Table Structure)", ha='center', va='center', fontsize=16, fontweight='bold')

    # --- Tables Section ---
    
    # 1. cache_relation Table (Left)
    # This table stores tags (source_id) and maps them to cache_key
    rel_x, rel_y = 1, 3
    rel_w, rel_h = 4, 5
    ax.add_patch(patches.Rectangle((rel_x, rel_y), rel_w, rel_h, lw=2, edgecolor='#6c757d', facecolor='#f8f9fa'))
    ax.text(rel_x + rel_w/2, rel_y + rel_h + 0.3, "cache_relation Table", ha='center', fontweight='bold', fontsize=12)
    
    rel_header = ["source_id (Tag)", "cache_key"]
    ax.text(rel_x + 1.0, rel_y + rel_h - 0.5, rel_header[0], ha='center', fontweight='bold', fontsize=9)
    ax.text(rel_x + 3.0, rel_y + rel_h - 0.5, rel_header[1], ha='center', fontweight='bold', fontsize=9)
    ax.plot([rel_x + 0.2, rel_x + rel_w - 0.2], [rel_y + rel_h - 0.7, rel_y + rel_h - 0.7], color='black', lw=1)

    relations = [
        ("global:latest", "K1"),
        ("entry:1", "K1"),
        ("global:latest", "K2"),
        ("entry:2", "K2"),
        ("query:cat:A", "K2")
    ]
    
    key_positions = {}
    for i, (src, key) in enumerate(relations):
        ry = rel_y + rel_h - 1.2 - i * 0.7
        ax.text(rel_x + 1.0, ry, src, ha='center', fontsize=8)
        ax.text(rel_x + 3.0, ry, key, ha='center', fontsize=8, fontweight='bold')
        if key not in key_positions:
            key_positions[key] = []
        key_positions[key].append(ry)

    # 2. cache Table (Right)
    # This table stores the actual content
    cache_x, cache_y = 8, 4
    cache_w, cache_h = 3, 3
    ax.add_patch(patches.Rectangle((cache_x, cache_y), cache_w, cache_h, lw=2, edgecolor='#007d9c', facecolor='#e0f7fa'))
    ax.text(cache_x + cache_w/2, cache_y + cache_h + 0.3, "cache Table", ha='center', fontweight='bold', fontsize=12)

    cache_header = ["cache_key", "content"]
    ax.text(cache_x + 0.7, cache_y + cache_h - 0.5, cache_header[0], ha='center', fontweight='bold', fontsize=9)
    ax.text(cache_x + 2.2, cache_y + cache_h - 0.5, cache_header[1], ha='center', fontweight='bold', fontsize=9)
    ax.plot([cache_x + 0.2, cache_x + cache_w - 0.2], [cache_y + cache_h - 0.7, cache_y + cache_h - 0.7], color='black', lw=1)

    caches = [
        ("K1", "HTML (Top)"),
        ("K2", "HTML (Entry 2)")
    ]
    
    cache_entry_pos = {}
    for i, (key, content) in enumerate(caches):
        cy = cache_y + cache_h - 1.2 - i * 1.0
        ax.text(cache_x + 0.7, cy, key, ha='center', fontsize=8, fontweight='bold')
        ax.text(cache_x + 2.2, cy, content, ha='center', fontsize=8)
        cache_entry_pos[key] = cy

    # --- Arrows (Relationship) ---
    for key, r_y_list in key_positions.items():
        if key in cache_entry_pos:
            target_y = cache_entry_pos[key]
            for start_y in r_y_list:
                ax.annotate("", xy=(cache_x, target_y), xytext=(rel_x + 3.5, start_y), 
                            arrowprops=dict(arrowstyle="->", color='#007d9c', lw=0.8, alpha=0.6))

    # --- Invalidation Flow (Bottom) ---
    flow_y = 1.2
    ax.add_patch(patches.FancyBboxPatch((0.5, flow_y - 0.4), 11, 1.0, boxstyle="round,pad=0.1", lw=1.5, edgecolor='#dc3545', facecolor='#f8d7da'))
    
    flow_text = [
        "1. DELETE FROM cache_relation WHERE source_id = 'entry:1'",
        "2. TRIGGER 'on_cache_related_deleted' fires",
        "3. DELETE FROM cache WHERE cache_key = 'K1' (Atomic)"
    ]
    
    for i, txt in enumerate(flow_text):
        tx = 2.3 + i * 3.7
        ax.text(tx, flow_y + 0.1, txt.split(' ')[0], ha='center', fontweight='bold', fontsize=9, color='#721c24')
        ax.text(tx, flow_y - 0.2, '\n'.join(txt.split(' ')[1:]), ha='center', fontsize=7, color='#721c24')
        if i < len(flow_text) - 1:
            ax.annotate("", xy=(tx + 1.8, flow_y - 0.1), xytext=(tx + 1.2, flow_y - 0.1), arrowprops=dict(arrowstyle="->", lw=1, color='#721c24'))

    plt.tight_layout()
    plt.savefig("docs/diagrams/page-cache-diagram.png", dpi=150)
    print("Diagram saved to docs/diagrams/page-cache-diagram.png")

if __name__ == "__main__":
    draw_page_cache_diagram()