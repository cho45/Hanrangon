interface DraftData {
  title: string;
  body: string;
  time?: number;
}

export class DraftStore {
  private timer: ReturnType<typeof setTimeout> | null = null;
  exists = $state(false);
  data = $state<DraftData | null>(null);

  constructor(private storage = typeof localStorage !== 'undefined' ? localStorage : null) {}

  private key(id: string | number | null) {
    return `nogag-backup-${id || 'new'}`;
  }

  check(id: string | number | null, current: DraftData) {
    if (!this.storage) return;
    const saved = this.storage.getItem(this.key(id));
    if (saved) {
      try {
        const backup: DraftData = JSON.parse(saved);
        if (backup.title !== current.title || backup.body !== current.body) {
          this.exists = true;
          this.data = backup;
        }
      } catch (e) {
        console.error('Failed to parse backup', e);
      }
    }
  }

  saveDebounced(id: string | number | null, data: DraftData, delay = 1000) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.save(id, data);
    }, delay);
  }

  save(id: string | number | null, data: DraftData) {
    if (!this.storage) return;
    const backup: DraftData = {
      title: data.title,
      body: data.body,
      time: Date.now()
    };
    this.storage.setItem(this.key(id), JSON.stringify(backup));
    this.exists = false;
  }

  clear(id: string | number | null) {
    if (!this.storage) return;
    this.storage.removeItem(this.key(id));
    this.exists = false;
    this.data = null;
  }
}
