import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InfoPage from './InfoPage.svelte';
import { api } from '../lib/api.svelte';

// APIのモック
vi.mock('../lib/api.svelte', () => ({
  api: {
    get: vi.fn(),
    get loading() { return false; }
  }
}));

const mockInfo = {
  tfidf_stats: {
    total_terms: 1000,
    indexed_entries: 50,
    entries_with_related: 45,
    total_related_pairs: 200,
    avg_score: 0.123456,
    top_terms: [{ term: 'test', df: 10 }, { term: 'code', df: 5 }]
  },
  image_stats: {
    total_images: 100,
    unindexed_images: 5
  },
  is_development: true,
  app_hash: 'abcdef123456',
  debug_info: {
    go_version: 'go1.21',
    num_goroutine: 10,
    start_time: '2025-01-15T10:00:00Z',
    uptime: '1h2m3s',
    mem_alloc: 1024 * 1024 * 10, // 10 MB
    mem_total_alloc: 1024 * 1024 * 100,
    mem_sys: 1024 * 1024 * 200,
    num_gc: 5
  },
  config: {
    BaseDir: '/tmp'
  }
};

describe('InfoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期表示でシステム情報を取得して表示すること', async () => {
    (api.get as any).mockResolvedValue(mockInfo);

    render(InfoPage);

    expect(api.get).toHaveBeenCalledWith('/admin/api/info');
    
    await waitFor(() => {
      expect(screen.getByText('システム情報')).toBeTruthy();
      expect(screen.getByText('1000')).toBeTruthy();
      expect(screen.getByText('0.1235')).toBeTruthy(); // toFixed(4)
      expect(screen.getByText('test')).toBeTruthy();
      expect(screen.getByText('code')).toBeTruthy();
      expect(screen.getByText('100')).toBeTruthy();
      expect(screen.getByText('abcdef123456')).toBeTruthy();
      expect(screen.getByText('go1.21')).toBeTruthy();
      expect(screen.getByText('10 MB')).toBeTruthy();
    });
  });
});