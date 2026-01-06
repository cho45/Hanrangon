<script lang="ts">
  import { onMount, tick } from 'svelte';
  import strftime from 'strftime';
  import { api } from '../lib/api.svelte';
  import { DraftStore } from '../lib/draft.svelte';

  let { id = null, onSave } = $props<{ id: string | null, onSave: (location: string) => void }>();

  interface Entry {
    id: number | null;
    title: string;
    body: string;
    status: string | null;
    publish_at?: string;
  }

  const draft = new DraftStore();
  let entry: Entry = $state({ id: null, title: '', body: '', status: null });
  let form = $state({
    id: null as number | null,
    title: '',
    body: '',
    format: 'Hatena',
    status: 'public',
    publishLater: false,
    publishAt: ''
  });
  let saving = $state(false);
  let progress = $state('');
  let uploading = $state(false);

  let titleInput = $state<HTMLInputElement>(null!);
  let bodyTextArea = $state<HTMLTextAreaElement>(null!);
  let tagDialog = $state<HTMLDialogElement>(null!);
  let restoreDialog = $state<HTMLDialogElement>(null!);
  let tagListContainer = $state<HTMLDivElement>(null!);

  const tags = ['tech', 'photo', 'redeveloped', 'stablediffusion', 'photoshopped'];
  let selectedIndex = $state(0);

  async function fetchEntry(id: string) {
    try {
      const parsed = await api.get<Entry>(`/admin/api/entry/${id}`);
      entry = parsed;
      form.id = parsed.id;
      form.title = parsed.title;
      form.body = parsed.body;
      form.format = parsed.format || 'Hatena';
      form.status = parsed.status;
      form.publishLater = parsed.status === 'scheduled';
      if (parsed.publish_at?.Valid) {
        form.publishAt = strftime('%Y-%m-%dT%H:%M', new Date(parsed.publish_at.Time));
      } else {
        form.publishAt = strftime('%Y-%m-%dT%H:%M', new Date(Date.now() + 86400 * 30 * 1000));
      }
      draft.check(entry.id, { title: form.title, body: form.body });
    } catch (e) {
      console.error(e);
      alert('エントリの取得に失敗しました');
    }
  }

  onMount(() => {
    if (id) {
      fetchEntry(id);
    } else {
      // New entry
      entry = { id: null, title: '', body: '', status: 'public' };
      form.id = null;
      form.title = '';
      form.body = '';
      form.format = 'Hatena';
      form.status = 'public';
      form.publishLater = false;
      form.publishAt = strftime('%Y-%m-%dT%H:%M', new Date(Date.now() + 86400 * 30 * 1000));
      draft.check(null, { title: form.title, body: form.body });
    }
  });

  $effect(() => {
    if (entry.title !== form.title || entry.body !== form.body) {
      draft.saveDebounced(entry.id, { title: form.title, body: form.body });
    }
  });

  async function saveEntry() {
    saving = true;
    progress = 'リクエスト中';

    const data = new FormData();
    data.set('id', form.id ? String(form.id) : '');
    data.set('title', form.title);
    data.set('body', form.body);
    data.set('format', form.format);

    if (form.publishLater) {
      const date = new Date(form.publishAt);
      data.set('publish_at', date.toISOString());
      data.set('status', 'scheduled');
    } else {
      data.set('status', 'public');
    }

    try {
      const resData = await api.post<{ session_id: string }>('/admin/api/edit', data);
      const sessionID = resData.session_id;

      if (!sessionID) {
        throw new Error('保存に失敗しました');
      }

      startSSE(sessionID);
    } catch (err) {
      saving = false;
      alert(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  }

  function startSSE(sessionID: string) {
    const eventSource = new EventSource(`/admin/api/edit/progress?sid=${sessionID}`);

    eventSource.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case 'progress':
          progress = mapProgressMessage(msg.message);
          break;
        case 'done':
          draft.clear(entry.id);
          progress = '完了';
          saving = false;
          eventSource.close();
          onSave(msg.location);
          break;
        case 'error':
          progress = 'エラー: ' + msg.message;
          saving = false;
          eventSource.close();
          alert('保存に失敗しました: ' + msg.message);
          break;
      }
    };

    eventSource.onerror = () => {
      saving = false;
      eventSource.close();
      alert('通信エラーが発生しました');
    };
  }

  function mapProgressMessage(msg: string) {
    const map: Record<string, string> = {
      'saving': '保存中',
      'update-similar-entries': '関連エントリを構築中',
      'posting-new-job': 'ジョブを投入中',
      'done': '完了'
    };
    return map[msg] || msg;
  }

  function openTagDialog() {
    selectedIndex = 0;
    tagDialog.showModal();
    setTimeout(() => tagListContainer?.focus(), 0);
  }

  function handleTagKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % tags.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + tags.length) % tags.length;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      insertTag(tags[selectedIndex]);
    } else if (e.key === 'Escape') {
      tagDialog.close();
    }
  }

  function insertTag(tag: string) {
    const tagStr = `[${tag}]`;
    if (form.title.includes(tagStr)) {
      form.title = form.title.replace(tagStr, '');
    } else {
      form.title = tagStr + form.title;
    }
    tagDialog.close();
    titleInput.focus();
  }

  function restoreBackup() {
    if (draft.data) {
      form.title = draft.data.title;
      form.body = draft.data.body;
      draft.clear(entry.id);
      restoreDialog.close();
    }
  }

  async function openUploadDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.oninput = async () => {
      if (!input.files?.[0]) return;
      const formData = new FormData();
      formData.append('file', input.files[0]);

      uploading = true;
      try {
        const data = await api.post<{ uploaded: string }>('/admin/api/upload/image', formData);
        const syntax = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${data.uploaded}" class="picasa" itemprop="url"><img src="${data.uploaded}" alt="photo" itemprop="image"/></a></span>\n`;
        insertText(syntax, true);
      } catch (err) {
        alert('アップロードに失敗しました');
      } finally {
        uploading = false;
      }
    };
    input.click();
  }

  function insertText(text: string, select: boolean | number = false) {
    const start = bodyTextArea.selectionStart;
    const end = bodyTextArea.selectionEnd;
    const value = bodyTextArea.value;

    form.body = value.substring(0, start) + text + value.substring(end);
    
    tick().then(() => {
      if (typeof select === 'boolean' && select) {
        bodyTextArea.selectionStart = start;
        bodyTextArea.selectionEnd = start + text.length;
      } else if (typeof select === 'number') {
        bodyTextArea.selectionStart = bodyTextArea.selectionEnd = start + select;
      } else {
        bodyTextArea.selectionStart = bodyTextArea.selectionEnd = start + text.length;
      }
      bodyTextArea.focus();
    });
  }

  function handleKeydown(e: KeyboardEvent) {
    const key = (e.altKey ? "Alt-" : "") + (e.ctrlKey ? "Control-" : "") + (e.metaKey ? "Meta-" : "") + (e.shiftKey ? "Shift-" : "") + e.key;
    if (key === 'Control-t') {
      insertText('\\(  \\)', 3);
      e.preventDefault();
      e.stopPropagation();
    }
  }
</script>

{#if api.loading && !entry.id}
  <div class="loading-spinner-container">
    <div class="loading-spinner"></div>
  </div>
{:else}
<div class="container">
  <div class="main">
    <input
      id="title"
      type="text"
      placeholder="タイトル"
      bind:this={titleInput}
      bind:value={form.title}
    />
    <div class="toolbar">
      <button type="button" onclick={openTagDialog}>🏷️ タグ</button>
      <button type="button" onclick={openUploadDialog} disabled={uploading}>
        {uploading ? '⌛ アップロード中...' : '📷 写真'}
      </button>
      <select bind:value={form.format} class="format-select">
        {#each ['Hatena', 'Markdown', 'HTML', 'tDiary'] as fmt}
          <option value={fmt}>{fmt}</option>
        {/each}
      </select>
    </div>
    <div class="body-container">
      <textarea
        id="body"
        placeholder="本文"
        required
        bind:this={bodyTextArea}
        bind:value={form.body}
        onkeydown={handleKeydown}
      ></textarea>
    </div>
  </div>

  <div class="global-actions">
    {#if saving}
      <div class="progress-bar" style="width: 100%"></div>
    {/if}
    <div class="buttons">
      <div class="options">
        <label title="チェックを入れると指定した日時に公開されます（公開済みの記事も予約に戻せます）">
          <input type="checkbox" bind:checked={form.publishLater}>
          公開を遅延
        </label>
        {#if form.publishLater}
          <input type="datetime-local" bind:value={form.publishAt} class="datetime-input">
        {/if}
      </div>
      <button
        type="button"
        class="submit-button"
        onclick={saveEntry}
        disabled={saving}
      >
        {saving ? (progress || 'リクエスト中') : '更新'}
      </button>
      {#if draft.exists}
        <button id="restore" type="button" class="submit-button" onclick={() => restoreDialog.showModal()}>
          復元...
        </button>
      {/if}
    </div>
  </div>
</div>

<dialog bind:this={tagDialog} id="tagDialog">
  <h3>タグを選択</h3>
  <div
    class="tag-list"
    role="listbox"
    aria-label="タグを選択"
    tabindex="0"
    bind:this={tagListContainer}
    onkeydown={handleTagKeyDown}
  >
    {#each tags as tag, i}
      <div
        class="tag-item"
        class:selected={selectedIndex === i}
        role="option"
        aria-selected={selectedIndex === i}
        onclick={() => insertTag(tag)}
        onmouseenter={() => selectedIndex = i}
      >
        {tag}
      </div>
    {/each}
  </div>
  <button type="button" onclick={() => tagDialog.close()} style="margin-top: 16px;">キャンセル</button>
</dialog>

<dialog bind:this={restoreDialog} id="restoreDialog">
  <h3>自動バックアップの復元</h3>
  <p>
    {#if draft.data?.time}
      {strftime('%Y年%m月%d日%H時', new Date(draft.data.time))}
    {/if}
    に保存されたバックアップを復元しますか?
  </p>
  <div style="display: flex; gap: 8px; justify-content: flex-end;">
    <button type="button" onclick={() => restoreDialog.close()}>キャンセル</button>
    <button type="button" class="submit-button" onclick={restoreBackup}>復元</button>
  </div>
</dialog>
{/if}

<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: #f7f8f9;
    font-family: sans-serif;
  }

  .main {
    flex: 1;
    overflow: auto;
    padding: 10px;
    max-width: 40em;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .toolbar {
    padding: 10px 0;
    display: flex;
    gap: 8px;
  }

  .toolbar button {
    background: #fff;
    border: 1px solid #dfe5e7;
    border-radius: 3px;
    padding: 8px;
    cursor: pointer;
  }

  .format-select {
    margin-left: auto;
    border: 1px solid #dfe5e7;
    border-radius: 3px;
    padding: 0 8px;
  }

  input[type="text"], textarea {
    margin: 0;
    font-family: inherit;
    border: 1px solid #dfe5e7;
    box-sizing: border-box;
    width: 100%;
    padding: 10px;
    border-radius: 3px;
    font-size: 110%;
  }

  .body-container {
    flex: 1;
    min-height: 300px;
  }

  textarea {
    height: 100%;
    resize: none;
  }

  .global-actions {
    background: #fff;
    padding: 14px 10px;
    box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
    position: relative;
  }

  .buttons {
    max-width: 40em;
    margin: 0 auto;
  }

  .options {
    padding-bottom: 16px;
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .datetime-input {
    border: 1px solid #dfe5e7;
    border-radius: 3px;
    padding: 4px 8px;
    font-family: inherit;
  }


  .submit-button {
    color: #fff;
    background: #00acc1;
    border: none;
    padding: 12px 24px;
    border-radius: 3px;
    font-size: 100%;
    cursor: pointer;
  }

  .submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  #restore {
    background: #757575;
    margin-left: 8px;
  }

  dialog {
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    padding: 20px;
    max-width: 600px;
    width: 90%;
  }

  dialog::backdrop {
    background: rgba(0,0,0,0.5);
  }

  .tag-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    outline: none;
  }

  .tag-list:focus-visible {
    box-shadow: 0 0 0 2px #00acc1;
    border-radius: 4px;
  }

  .tag-item {
    padding: 12px;
    background: #eee;
    border-radius: 4px;
    cursor: pointer;
    border: 2px solid transparent;
  }

  .tag-item:hover, .tag-item.selected {
    background: #ddd;
  }

  .tag-item.selected {
    border-color: #00acc1;
  }

  .progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 4px;
    background: #00acc1;
    transition: width 0.3s;
  }

  .loading-spinner-container {
    padding: 100px;
    display: flex;
    justify-content: center;
  }

  .loading-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #00acc1;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
