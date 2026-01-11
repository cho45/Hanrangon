import { render, screen, cleanup } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App.svelte';

describe('App Routing', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    // jsdomのURLを正しく設定
    vi.stubGlobal('location', new URL('http://localhost/admin/'));
    
    // APIのモック
    vi.mock('./lib/api.svelte', () => ({
      api: {
        get: vi.fn().mockImplementation((path) => {
          if (path.includes('entries')) return Promise.resolve({ entries: [], has_more: false });
          if (path.includes('jobs')) return Promise.resolve({ jobs: [], total: 0 });
          if (path.includes('info')) return Promise.resolve({ 
            is_development: true,
            app_hash: 'test',
            config: {},
            tfidf_stats: { 
              total_terms: 0, 
              indexed_entries: 0, 
              total_related_pairs: 0, 
              entries_with_related: 0, 
              top_terms: [],
              avg_score: 0
            },
            debug_info: {
              go_version: 'go1.x',
              num_goroutine: 0,
              start_time: new Date().toISOString(),
              uptime: '0s',
              mem_alloc: 0,
              mem_total_alloc: 0,
              mem_sys: 0,
              num_gc: 0
            }
          });
          return Promise.resolve({});
        }),
        post: vi.fn(),
        get loading() { return false; }
      }
    }));
  });

  it('デフォルトパスでエントリ一覧が表示されること', () => {
    render(App);
    // 複数の「エントリ一覧」があるため、見出し(h2)に限定
    expect(screen.getByRole('heading', { name: 'エントリ一覧', level: 2 })).toBeTruthy();
  });

  it('/admin/edit でエディタが表示されること', () => {
    vi.stubGlobal('location', new URL('http://localhost/admin/edit'));
    render(App);
    expect(screen.getByPlaceholderText('タイトル')).toBeTruthy();
    const newPostNav = screen.getByRole('link', { name: '新規作成' });
    expect(newPostNav.classList.contains('active')).toBe(true);
  });

  it('/admin/edit?id=123 で編集モードとしてエディタが表示されること', () => {
    vi.stubGlobal('location', new URL('http://localhost/admin/edit?id=123'));
    render(App);
    
    const newPostNav = screen.getByRole('link', { name: '新規作成' });
    expect(newPostNav.classList.contains('active')).toBe(false);
  });

  it('/admin/jobs でジョブ一覧が表示されること', () => {
    vi.stubGlobal('location', new URL('http://localhost/admin/jobs'));
    render(App);
    // ジョブ一覧内のテキストを確認
    expect(screen.getByRole('heading', { name: /ジョブ一覧/, level: 2 })).toBeTruthy();
    const nav = screen.getByRole('link', { name: 'ジョブ一覧' });
    expect(nav.classList.contains('active')).toBe(true);
  });

  it('/admin/info で情報ページが表示されること', () => {
    vi.stubGlobal('location', new URL('http://localhost/admin/info'));
    render(App);
    expect(screen.getByText('システム情報')).toBeTruthy();
  });
});