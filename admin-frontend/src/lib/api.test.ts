import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from './api.svelte';

describe('ApiClient', () => {
  let mockFetch: any;

  beforeEach(() => {
    mockFetch = vi.fn();
    // jsdom 環境下でのベースURL設定
    if (typeof window !== 'undefined') {
      vi.stubGlobal('location', { origin: 'http://localhost' });
    }
  });

  it('通信中に loading が true になり、完了後に false になること', async () => {
    mockFetch.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      }), 10);
    }));

    const api = new ApiClient(mockFetch);
    
    // 初期状態
    expect(api.loading).toBe(false);

    const promise = api.get('/test');
    
    // リクエスト中
    expect(api.loading).toBe(true);

    await promise;

    // 完了後
    expect(api.loading).toBe(false);
  });

  it('X-Requested-With ヘッダーが正しく付与されること', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({})
    });

    const api = new ApiClient(mockFetch);
    await api.get('/test');

    const args = mockFetch.mock.calls[0];
    const headers = args[1].headers;
    expect(headers.get('X-Requested-With')).toBe('fetch');
  });

  it('POSTリクエスト時にCSRFトークン(sk)がFormDataに付与されること', async () => {
    // metaタグのモック作成
    document.head.innerHTML = '<meta name="csrf-token" content="test-token">';
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({})
    });

    const api = new ApiClient(mockFetch);
    const formData = new FormData();
    await api.post('/test', formData);

    expect(formData.get('sk')).toBe('test-token');
  });

  it('非OKレスポンスの場合にエラーをスローすること', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    const api = new ApiClient(mockFetch);
    await expect(api.get('/test')).rejects.toThrow('API Error: 500 Internal Server Error');
  });
});
