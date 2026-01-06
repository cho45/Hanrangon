import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DraftStore } from './draft.svelte';

describe('DraftStore', () => {
  let mockStorage: any;

  beforeEach(() => {
    const store: Record<string, string> = {};
    mockStorage = {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, val) => { store[key] = val; }),
      removeItem: vi.fn((key) => { delete store[key]; }),
    };
    vi.useFakeTimers();
  });

  it('データを正しく保存できること', () => {
    const draft = new DraftStore(mockStorage);
    draft.save('123', { title: 'T', body: 'B' });

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'nogag-backup-123',
      expect.stringContaining('"title":"T","body":"B"')
    );
    expect(draft.exists).toBe(false);
  });

  it('デバウンスが効くこと', () => {
    const draft = new DraftStore(mockStorage);
    draft.saveDebounced('new', { title: 'T1', body: 'B1' }, 1000);
    
    expect(mockStorage.setItem).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    draft.saveDebounced('new', { title: 'T2', body: 'B2' }, 1000);
    
    vi.advanceTimersByTime(1000);
    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'nogag-backup-new',
      expect.stringContaining('"title":"T2"')
    );
  });

  it('差分がある場合に exists が true になること', () => {
    mockStorage.setItem('nogag-backup-1', JSON.stringify({ title: 'Old', body: 'Old' }));
    
    const draft = new DraftStore(mockStorage);
    draft.check('1', { title: 'New', body: 'New' });

    expect(draft.exists).toBe(true);
    expect(draft.data?.title).toBe('Old');
  });

  it('差分がない場合に exists が false のままであること', () => {
    mockStorage.setItem('nogag-backup-1', JSON.stringify({ title: 'Same', body: 'Same' }));
    
    const draft = new DraftStore(mockStorage);
    draft.check('1', { title: 'Same', body: 'Same' });

    expect(draft.exists).toBe(false);
  });
});
