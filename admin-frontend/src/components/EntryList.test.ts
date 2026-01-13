import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EntryList from './EntryList.svelte';
import { api } from '../lib/api.svelte';

// APIのモック
vi.mock('../lib/api.svelte', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    get loading() { return false; }
  }
}));

const mockEntries = [
  { id: 10, title: 'Entry 10', date: '2025-01-10', created_at: '2025-01-10T10:00:00Z', status: 'public', path: 'p10', format: 'Markdown' },
  { id: 9, title: 'Entry 9', date: '2025-01-09', created_at: '2025-01-09T10:00:00Z', status: 'public', path: 'p9', format: 'Markdown' },
];

describe('EntryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期表示でエントリを取得して表示すること', async () => {
    (api.get as any).mockResolvedValue({
      entries: mockEntries,
      has_more: true
    });

    render(EntryList, { onEdit: () => {} });

    expect(api.get).toHaveBeenCalledWith('/admin/api/entries', expect.objectContaining({ limit: 50 }));
    
    await waitFor(() => {
      expect(screen.getByText('Entry 10')).toBeTruthy();
      expect(screen.getByText('Entry 9')).toBeTruthy();
    });
  });

  it('検索を実行したとき、正しいパラメータでAPIを再送すること', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValue({
      entries: [{ id: 5, title: 'Search Result', date: '2025-01-05', created_at: '2025-01-05T10:00:00Z', status: 'public', path: 'p5', format: 'Markdown' }],
      has_more: false
    });

    render(EntryList, { onEdit: () => {} });

    const searchInput = screen.getByPlaceholderText('検索...');
    await user.type(searchInput, 'hello');
    await user.click(screen.getByRole('button', { name: '検索' }));

    expect(api.get).toHaveBeenLastCalledWith('/admin/api/entries', expect.objectContaining({ q: 'hello' }));
    
    await waitFor(() => {
      expect(screen.getByText('Search Result')).toBeTruthy();
    });
  });

  it('ページネーション（古い方へ/新しい方へ）が正しく動作すること', async () => {
    const user = userEvent.setup();
    
    // 初回取得のモック
    (api.get as any).mockResolvedValueOnce({
      entries: mockEntries,
      has_more: true
    });

    render(EntryList, { onEdit: () => {} });

    await waitFor(() => expect(screen.getByText('Entry 10')).toBeTruthy());

    // 「古い方へ」をクリック
    (api.get as any).mockResolvedValueOnce({
      entries: [{ id: 8, title: 'Entry 8', date: '2025-01-08', created_at: '2025-01-08T10:00:00Z', status: 'public', path: 'p8', format: 'Markdown' }],
      has_more: false
    });

    const olderButton = screen.getByRole('button', { name: '古い方へ' });
    await user.click(olderButton);

    // 最後のアイテム(id: 9)がカーソルとして使われること
    expect(api.get).toHaveBeenLastCalledWith('/admin/api/entries', expect.objectContaining({ cursor_id: 9 }));

    await waitFor(() => expect(screen.getByText('Entry 8')).toBeTruthy());

    // 「新しい方へ」をクリック
    (api.get as any).mockResolvedValueOnce({
      entries: mockEntries,
      has_more: true
    });

    const newerButton = screen.getByRole('button', { name: '新しい方へ' });
    await user.click(newerButton);

    // カーソルなし（最初のページ）で呼ばれること
    expect(api.get).toHaveBeenLastCalledWith('/admin/api/entries', expect.not.objectContaining({ cursor_id: expect.anything() }));
    
    await waitFor(() => expect(screen.getByText('Entry 10')).toBeTruthy());
  });
});
