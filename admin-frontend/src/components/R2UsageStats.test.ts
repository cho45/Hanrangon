import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import R2UsageStats from './R2UsageStats.svelte';
import { api } from '../lib/api.svelte';

// APIのモック
vi.mock('../lib/api.svelte', () => ({
  api: {
    get: vi.fn(),
    get loading() { return false; }
  }
}));

const mockR2Usage = {
  storage_usage_bytes: 1024 * 1024 * 1024, // 1 GB
  object_count: 100,
  operations: [
    { action_type: 'PutObject', requests: 1000 },
    { action_type: 'GetObject', requests: 5000 },
    { action_type: 'ListObjects', requests: 500 }
  ]
};

describe('R2UsageStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期表示でR2使用統計を取得して表示すること', async () => {
    (api.get as any).mockResolvedValue(mockR2Usage);

    render(R2UsageStats);

    expect(api.get).toHaveBeenCalledWith('/admin/api/r2/usage');
    
    await waitFor(() => {
      expect(screen.getByText('1 GB')).toBeTruthy();
      expect(screen.getByText('100 objects')).toBeTruthy();
      // Class A: PutObject(1000) + ListObjects(500) = 1,500
      // Find the element with class "stat-value" to avoid tooltip duplication
      expect(screen.getAllByText('1,500').find(el => el.classList.contains('stat-value'))).toBeTruthy();
      // Class B: GetObject(5000) = 5,000
      expect(screen.getAllByText('5,000').find(el => el.classList.contains('stat-value'))).toBeTruthy();
    });
  });

  it('APIエラー時にエラーメッセージを表示すること', async () => {
    (api.get as any).mockRejectedValue(new Error('API Error'));

    render(R2UsageStats);

    await waitFor(() => {
      expect(screen.getByText('Failed to load R2 usage data')).toBeTruthy();
    });
  });
});