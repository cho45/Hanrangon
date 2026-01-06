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
    get loading() { return false; }
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
    expect(screen.getByRole('button', { name: '作成' })).toBeTruthy();
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
      expect(screen.getByRole('button', { name: '更新' })).toBeTruthy();
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
    
    // 「公開を遅延」を有効化
    const checkbox = screen.getByLabelText(/公開を遅延/);
    await user.click(checkbox);

    // 日時を入力
    const dateInput = document.querySelector('.datetime-input') as HTMLInputElement;
    const inputDateTime = '2026-01-01T15:00';
    await user.clear(dateInput);
    await user.type(dateInput, inputDateTime);

    await user.click(screen.getByText('作成'));

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

    const saveButton = screen.getByText('作成');
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
    
    const saveButton = screen.getByRole('button', { name: '作成' });
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
      // 保存完了後は「作成」に戻る
      expect(saveButton.textContent).toBe('作成');
      expect(onSave).toHaveBeenCalledWith('/admin/done');
    });
  });
});