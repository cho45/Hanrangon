import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CacheList from './CacheList.svelte';
import { api } from '../lib/api.svelte';

// APIのモック
vi.mock('../lib/api.svelte', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    get loading() { return false; }
  }
}));

const mockStatsResponse = {
  stats: {
    total_count: 2,
    total_size: 1024,
    oldest_at: '2025-01-01T10:00:00Z',
    newest_at: '2025-01-01T12:00:00Z'
  },
  metadata: [
    { key: 'app_hash', value: 'testhash' }
  ]
};

const mockEntries = [
  {
    cache_key: '/test1',
    size: { Int64: 512, Valid: true },
    content_type: 'text/html',
    etag: 'etag1',
    created_at: '2025-01-01T10:00:00Z'
  },
  {
    cache_key: '/test2',
    size: { Int64: 512, Valid: true },
    content_type: 'text/plain',
    etag: 'etag2',
    created_at: '2025-01-01T12:00:00Z'
  }
];

describe('CacheList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期表示で統計とエントリを取得して表示すること', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/admin/api/cache/stats') return Promise.resolve(mockStatsResponse);
      if (url === '/admin/api/cache/list') return Promise.resolve({ entries: mockEntries });
      return Promise.reject(new Error('not found'));
    });

    render(CacheList);

    await waitFor(() => {
      expect(screen.getByText('ページキャッシュ管理')).toBeTruthy();
      expect(screen.getByText('2')).toBeTruthy(); // total_count
      expect(screen.getByText('1 KB')).toBeTruthy(); // total_size formatted
      expect(screen.getByText('app_hash')).toBeTruthy();
      expect(screen.getByText('testhash')).toBeTruthy();
      expect(screen.getByText('/test1')).toBeTruthy();
      expect(screen.getByText('/test2')).toBeTruthy();
    });
  });

  it('全キャッシュ削除ボタンが動作すること', async () => {
    const user = userEvent.setup();
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/admin/api/cache/stats') return Promise.resolve(mockStatsResponse);
      if (url === '/admin/api/cache/list') return Promise.resolve({ entries: mockEntries });
      return Promise.reject(new Error('not found'));
    });
    (api.post as any).mockResolvedValue({});
    
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(CacheList);

    await waitFor(() => expect(screen.getByText('全キャッシュ削除')).toBeTruthy());
    const purgeButton = screen.getByText('全キャッシュ削除');
    await user.click(purgeButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(api.post).toHaveBeenCalledWith('/admin/api/cache/purge', undefined);
  });

  it('個別削除ボタンが動作すること', async () => {
    const user = userEvent.setup();
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/admin/api/cache/stats') return Promise.resolve(mockStatsResponse);
      if (url === '/admin/api/cache/list') return Promise.resolve({ entries: mockEntries });
      return Promise.reject(new Error('not found'));
    });
    (api.post as any).mockResolvedValue({});

    render(CacheList);

    await waitFor(() => expect(screen.getAllByText('削除').length).toBeGreaterThan(0));
    const deleteButtons = screen.getAllByText('削除');
    await user.click(deleteButtons[0]);

    expect(api.post).toHaveBeenCalledWith(expect.stringContaining('/admin/api/cache/purge?key='), undefined);
  });
});