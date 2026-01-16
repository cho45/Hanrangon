import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import JobList from './JobList.svelte';
import { api } from '../lib/api.svelte';

// APIのモック
vi.mock('../lib/api.svelte', () => ({
  api: {
    get: vi.fn(),
    get loading() { return false; }
  }
}));

const mockJobs = [
  {
    id: 1,
    job_type_name: 'TestJob',
    status: 'pending',
    retry_count: 0,
    created_at: '2025-01-15T10:00:00Z',
    error_message: { String: '', Valid: false }
  },
  {
    id: 2,
    job_type_name: 'ErrorJob',
    status: 'failed',
    retry_count: 3,
    created_at: '2025-01-15T11:00:00Z',
    error_message: { String: 'Something went wrong', Valid: true }
  }
];

describe('JobList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期表示でジョブを取得して表示すること', async () => {
    (api.get as any).mockResolvedValue({
      jobs: mockJobs,
      total: 2
    });

    render(JobList);

    expect(api.get).toHaveBeenCalledWith('/admin/api/jobs', expect.objectContaining({ limit: 50, offset: 0 }));
    
    await waitFor(() => {
      expect(screen.getByText('ジョブ一覧 (2)')).toBeTruthy();
      expect(screen.getByText('TestJob')).toBeTruthy();
      expect(screen.getByText('ErrorJob')).toBeTruthy();
      expect(screen.getByText('Something went wrong')).toBeTruthy();
    });
  });

  it('ページネーション（古い方へ/新しい方へ）が正しく動作すること', async () => {
    const user = userEvent.setup();
    
    // 初回取得のモック
    (api.get as any).mockResolvedValueOnce({
      jobs: Array(50).fill(0).map((_, i) => ({ ...mockJobs[0], id: i + 1 })),
      total: 100
    });

    render(JobList);

    await waitFor(() => expect(screen.getByText('1 - 50 / 100')).toBeTruthy());

    // 「古い方へ」をクリック
    (api.get as any).mockResolvedValueOnce({
      jobs: Array(50).fill(0).map((_, i) => ({ ...mockJobs[0], id: i + 51 })),
      total: 100
    });

    const olderButton = screen.getByRole('button', { name: '古い方へ' });
    await user.click(olderButton);

    expect(api.get).toHaveBeenLastCalledWith('/admin/api/jobs', expect.objectContaining({ offset: 50 }));

    await waitFor(() => expect(screen.getByText('51 - 100 / 100')).toBeTruthy());

    // 「新しい方へ」をクリック
    (api.get as any).mockResolvedValueOnce({
      jobs: Array(50).fill(0).map((_, i) => ({ ...mockJobs[0], id: i + 1 })),
      total: 100
    });

    const newerButton = screen.getByRole('button', { name: '新しい方へ' });
    await user.click(newerButton);

    expect(api.get).toHaveBeenLastCalledWith('/admin/api/jobs', expect.objectContaining({ offset: 0 }));
    
    await waitFor(() => expect(screen.getByText('1 - 50 / 100')).toBeTruthy());
  });

  it('更新ボタンをクリックしたとき、APIを再送すること', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValue({
      jobs: mockJobs,
      total: 2
    });

    render(JobList);

    await waitFor(() => expect(screen.getByText('TestJob')).toBeTruthy());

    const refreshButton = screen.getByRole('button', { name: '更新' });
    await user.click(refreshButton);

    expect(api.get).toHaveBeenCalledTimes(2);
  });
});