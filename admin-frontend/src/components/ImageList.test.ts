import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImageList from './ImageList.svelte';
import { api } from '../lib/api.svelte';

// APIのモック
vi.mock('../lib/api.svelte', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    get loading() { return false; }
  }
}));

const mockImages = [
  { id: 1, uri: '/img/1.jpg', entry_id: 101, sig: 'sig1' },
  { id: 2, uri: '/img/2.jpg', entry_id: 102, sig: 'sig2' },
];

describe('ImageList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期表示で画像一覧を取得して表示すること', async () => {
    (api.get as any).mockResolvedValue({
      images: mockImages,
      total: 100
    });

    render(ImageList);

    expect(api.get).toHaveBeenCalledWith('/admin/api/images?limit=20&offset=0');
    
    await waitFor(() => {
      expect(screen.getByText('ID: 1')).toBeTruthy();
      expect(screen.getByText('ID: 2')).toBeTruthy();
      expect(screen.getByText('画像一覧 (100)')).toBeTruthy();
    });
  });

  it('次へボタンでオフセットが更新されること', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValue({
      images: mockImages,
      total: 100
    });

    render(ImageList);

    await waitFor(() => expect(screen.getByText('ID: 1')).toBeTruthy());

    const nextButton = screen.getByRole('button', { name: '次へ' });
    await user.click(nextButton);

    expect(api.get).toHaveBeenLastCalledWith('/admin/api/images?limit=20&offset=20');
  });

  it('類似画像検索ダイアログが開くこと', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValueOnce({
      images: mockImages,
      total: 100
    });
    
    // HTMLDialogElement.showModal は jsdom で未実装な場合があるための回避
    if (!HTMLDialogElement.prototype.showModal) {
        HTMLDialogElement.prototype.showModal = vi.fn();
        HTMLDialogElement.prototype.close = vi.fn();
    }

    render(ImageList);

    await waitFor(() => expect(screen.getByText('ID: 1')).toBeTruthy());

    const searchButtons = screen.getAllByTitle('類似画像を検索');
    await user.click(searchButtons[0]);

    expect(api.get).toHaveBeenLastCalledWith('/admin/api/image/1/similar');
    
    await waitFor(() => {
      expect(screen.getByText('類似画像一覧')).toBeTruthy();
    });
  });
});
