import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppEditor from './AppEditor.svelte';
import { api } from '../lib/api.svelte';

// APIのモック
vi.mock('../lib/api.svelte', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    get loading() { return false; },
    get skValue() { return 'test-token'; }
  }
}));

describe('AppEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // jsdom doesn't support dialog methods yet
    HTMLDialogElement.prototype.showModal = vi.fn(function(this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = vi.fn(function(this: HTMLDialogElement) {
      this.open = false;
    });

    // Mock alert
    vi.stubGlobal('alert', vi.fn(function() {}));
  });

  it('新規作成時にデフォルト値でレンダリングされること', () => {
    render(AppEditor, { id: null, onSave: () => {} });
    
    expect((screen.getByPlaceholderText('タイトル') as HTMLInputElement).value).toBe('');
    expect((screen.getByPlaceholderText('本文') as HTMLTextAreaElement).value).toBe('');
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('Hatena');
    expect(screen.getByRole('button', { name: '公開する' })).toBeTruthy();
  });

  it('既存エントリの取得と表示ができること', async () => {
    (api.get as any).mockResolvedValue({
      id: 123,
      title: '既存のタイトル',
      body: '本文',
      format: 'Markdown',
      status: 'public'
    });

    render(AppEditor, { id: '123', onSave: () => {} });

    await waitFor(() => {
      expect((screen.getByPlaceholderText('タイトル') as HTMLInputElement).value).toBe('既存のタイトル');
      expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('Markdown');
      expect(screen.getByRole('button', { name: '更新する' })).toBeTruthy();
    });
  });

  it('タグを選択するとタイトルにトグル挿入されること（複数タグ・既存テキスト対応）', async () => {
    const user = userEvent.setup();
    render(AppEditor, { id: null, onSave: () => {} });
    const titleInput = screen.getByPlaceholderText('タイトル') as HTMLInputElement;
    
    // 既存テキスト入力
    await user.type(titleInput, 'こんにちは');

    // techタグ追加
    await user.click(screen.getByText('🏷️ タグ'));
    await user.click(screen.getByText('tech'));
    expect(titleInput.value).toBe('[tech]こんにちは');

    // photoタグ追加（先頭に蓄積される挙動の確認）
    await user.click(screen.getByText('🏷️ タグ'));
    await user.click(screen.getByText('photo'));
    expect(titleInput.value).toBe('[photo][tech]こんにちは');

    // techタグのみ削除（トグル）
    await user.click(screen.getByText('🏷️ タグ'));
    await user.click(screen.getByText('tech'));
    expect(titleInput.value).toBe('[photo]こんにちは');
  });

  it('フォーマットを選択変更できること', async () => {
    const user = userEvent.setup();
    render(AppEditor, { id: null, onSave: () => {} });
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    
    await user.selectOptions(select, 'Markdown');
    expect(select.value).toBe('Markdown');
    
    await user.selectOptions(select, 'tDiary');
    expect(select.value).toBe('tDiary');
  });

  it('公開予約の設定が正しく FormData に反映されること', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ session_id: 'session-123' });
    vi.stubGlobal('EventSource', vi.fn(function() {
      return { onmessage: null, close: vi.fn() };
    }));

    render(AppEditor, { id: null, onSave: () => {} });
    
    // 「公開を遅延」を選択
    const radio = screen.getByLabelText(/公開を遅延/);
    await user.click(radio);

    // 日時を入力
    const dateInput = document.querySelector('.datetime-input') as HTMLInputElement;
    const inputDateTime = '2026-01-01T15:00';
    await user.clear(dateInput);
    await user.type(dateInput, inputDateTime);

    await user.click(screen.getByText('予約する'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });

    const formData = (api.post as any).mock.calls[0][1];
    expect(formData.get('status')).toBe('scheduled');
    
    // ISO形式への変換結果を厳密に検証
    const expectedISO = new Date(inputDateTime).toISOString();
    expect(formData.get('publish_at')).toBe(expectedISO);
  });

  it('保存ボタンを押すと api.post が正しいパラメータで呼ばれること', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ session_id: 'session-123' });
    vi.stubGlobal('EventSource', vi.fn(function() {
      return { onmessage: null, close: vi.fn() };
    }));

    render(AppEditor, { id: null, onSave: () => {} });

    const titleInput = screen.getByPlaceholderText('タイトル');
    const bodyInput = screen.getByPlaceholderText('本文');
    await user.type(titleInput, '新記事');
    await user.type(bodyInput, '内容');

    const saveButton = screen.getByText('公開する');
    await user.click(saveButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/admin/api/edit', expect.any(FormData));
    });
    const formData = (api.post as any).mock.calls[0][1];
    expect(formData.get('title')).toBe('新記事');
    expect(formData.get('body')).toBe('内容');
  });

  it('保存ボタン押下後、SSEによる進捗更新がUIに反映され、完了時に onSave が呼ばれること', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    (api.post as any).mockResolvedValue({ session_id: 'session-123' });
    
    let capturedInstance: any = null;
    class MockEventSource {
      onmessage: any = null;
      onerror: any = null;
      close = vi.fn();
      constructor() {
        capturedInstance = this;
      }
    }
    vi.stubGlobal('EventSource', MockEventSource);

    render(AppEditor, { id: null, onSave });
    
    const saveButton = screen.getByRole('button', { name: '公開する' });
    await user.click(saveButton);

    // 1. EventSource がインスタンス化され、ハンドラが設定されるのを待つ
    await waitFor(() => {
      if (!capturedInstance || !capturedInstance.onmessage) throw new Error('Wait');
    });

    // 2. 進捗メッセージの送信をシミュレート
    capturedInstance.onmessage({ data: JSON.stringify({ type: 'progress', message: 'saving' }) });
    await waitFor(() => expect(saveButton.textContent).toContain('保存中'));

    // 3. 完了メッセージの送信をシミュレート
    capturedInstance.onmessage({ data: JSON.stringify({ type: 'done', location: '/admin/done' }) });
    
    // 4. 完了後の挙動を検証
    await waitFor(() => {
      // 保存完了後は元の「公開する」に戻る
      expect(saveButton.textContent).toBe('公開する');
      expect(onSave).toHaveBeenCalledWith('/admin/done');
    });
  });

  it('プレビューボタンを押すと form.submit が呼ばれ、ダイアログが開き、ロード状態が管理されること', async () => {
    const user = userEvent.setup();
    const submitSpy = vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

    render(AppEditor, { id: null, onSave: () => {} });

    const previewButton = screen.getByRole('button', { name: 'プレビュー' });
    await user.click(previewButton);

    expect(submitSpy).toHaveBeenCalled();
    
    // dialog が開いていることを確認
    const dialog = document.getElementById('previewDialog') as HTMLDialogElement;
    expect(dialog.open).toBe(true);

    // ロード中のオーバーレイが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('読み込み中...')).toBeTruthy();
    });

    // iframe を取得
    const iframe = document.querySelector('iframe[name="preview-iframe"]') as HTMLIFrameElement;
    
    // onload をシミュレート
    iframe.dispatchEvent(new Event('load'));

    // オーバーレイが消えることを確認
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).toBeNull();
    });

    // 「閉じる」ボタンをクリック
    const closeButton = screen.getByRole('button', { name: '閉じる' });
    await user.click(closeButton);

    // dialog が閉じていることを確認
    expect(dialog.open).toBe(false);

    submitSpy.mockRestore();
  });

  it('プレビューの読み込みエラー時にアラートが表示され、ロード状態が解除されること', async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

    render(AppEditor, { id: null, onSave: () => {} });

    const previewButton = screen.getByRole('button', { name: 'プレビュー' });
    await user.click(previewButton);

    // ロード中のオーバーレイが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('読み込み中...')).toBeTruthy();
    });

    // iframe を取得
    const iframe = document.querySelector('iframe[name="preview-iframe"]') as HTMLIFrameElement;
    
    // onerror をシミュレート
    iframe.dispatchEvent(new Event('error'));

    // アラートが表示されるまで待機
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('プレビューの読み込みに失敗しました');
    });

    // オーバーレイが消えることを確認
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).toBeNull();
    });
  });

  it('本文の入力に応じて文字数が正しく表示されること', async () => {
    const user = userEvent.setup();
    render(AppEditor, { id: null, onSave: () => {} });

    const bodyInput = screen.getByPlaceholderText('本文') as HTMLTextAreaElement;
    const charCount = screen.getByText(/文字/);

    expect(charCount.textContent).toBe('0 文字');

    await user.type(bodyInput, 'Hello');
    expect(charCount.textContent).toBe('5 文字');

    await user.type(bodyInput, ' 世界');
    expect(charCount.textContent).toBe('8 文字');

    await user.clear(bodyInput);
    expect(charCount.textContent).toBe('0 文字');
  });

  it('画像をアップロードすると img タグが挿入されること', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ uploaded: 'https://assets.example.com/photo.jpg' });

    render(AppEditor, { id: null, onSave: () => {} });

    const bodyInput = screen.getByPlaceholderText('本文') as HTMLTextAreaElement;
    const uploadButton = screen.getByRole('button', { name: /写真/ });

    // input[type="file"] の click イベントをシミュレート
    // AppEditor.svelte 内で動的に作成される input への対応
    const input = document.createElement('input');
    input.type = 'file';
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'input') return input;
      return originalCreateElement(tagName);
    });

    await user.click(uploadButton);

    // ファイル選択をシミュレート
    const file = new File(['hello'], 'photo.jpg', { type: 'image/jpeg' });
    await user.upload(input, file);

    await waitFor(() => {
      expect(bodyInput.value).toContain('<img src="https://assets.example.com/photo.jpg"');
      expect(bodyInput.value).toContain('itemprop="image"');
    });
  });

  it('webm動画をアップロードすると video タグが挿入されること', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ uploaded: 'https://assets.example.com/video.webm' });

    render(AppEditor, { id: null, onSave: () => {} });

    const bodyInput = screen.getByPlaceholderText('本文') as HTMLTextAreaElement;
    const uploadButton = screen.getByRole('button', { name: /写真/ });

    const input = document.createElement('input');
    input.type = 'file';
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'input') return input;
      return originalCreateElement(tagName);
    });

    await user.click(uploadButton);

    const file = new File(['hello'], 'video.webm', { type: 'video/webm' });
    await user.upload(input, file);

    await waitFor(() => {
      expect(bodyInput.value).toContain('<video src="https://assets.example.com/video.webm"');
      expect(bodyInput.value).toContain('autoplay loop muted playsinline');
    });
  });
});