<script lang="ts">
  import { onMount, tick } from 'svelte';
  import strftime from 'strftime';
  import { api } from '../lib/api.svelte';
  import { DraftStore } from '../lib/draft.svelte';
  import type { Entry } from '../lib/types/models';
  import { StatusPublic, StatusDraft, StatusScheduled, StatusReserved } from '../lib/types/models';
  import type { SearchEntryResponse } from '../lib/types/generated/api';

  let { id = null, onSave } = $props<{ id: string | null, onSave: (location: string) => void }>();

  const draft = new DraftStore();
  let entry: Partial<Entry> = $state({ id: undefined, title: '', body: '', status: '' });
  let form = $state({
    id: null as number | null,
    title: '',
    body: '',
    format: 'Hatena',
    status: StatusPublic as string,
    publishAt: ''
  });
  let saving = $state(false);
  let progress = $state('');
  let uploading = $state(false);

  let titleInput = $state<HTMLInputElement>(null!);
  let bodyTextArea = $state<HTMLTextAreaElement>(null!);
  let tagDialog = $state<HTMLDialogElement>(null!);
  let restoreDialog = $state<HTMLDialogElement>(null!);
  let previewDialog = $state<HTMLDialogElement>(null!);
  let searchDialog = $state<HTMLDialogElement>(null!);
  let tagListContainer = $state<HTMLDivElement>(null!);

  const tags = ['tech', 'photo', 'redeveloped', 'stablediffusion', 'photoshopped'];
  let selectedIndex = $state(0);

  let searchQuery = $state('');
  let searchResults = $state<SearchEntryResponse[]>([]);
  let searchSelectedIndex = $state(0);
  let searchInput = $state<HTMLInputElement>(null!);
  let searchResultItems = $state<HTMLDivElement[]>([]);

  async function fetchEntry(id: string) {
    try {
      const parsed = await api.get<Entry>(`/admin/api/entry/${id}`);
      entry = parsed;
      form.id = parsed.id;
      form.title = parsed.title;
      form.body = parsed.body;
      form.format = parsed.format || 'Hatena';
      form.status = parsed.status;
      if (parsed.publish_at?.Valid) {
        form.publishAt = strftime('%Y-%m-%dT%H:%M', new Date(parsed.publish_at.Time));
      } else {
        form.publishAt = strftime('%Y-%m-%dT%H:%M', new Date(Date.now() + 86400 * 30 * 1000));
      }
      draft.check(entry.id ?? null, { title: form.title, body: form.body });
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
      entry = { id: undefined, title: '', body: '', status: StatusPublic };
      form.id = null;
      form.title = '';
      form.body = '';
      form.format = 'Hatena';
      form.status = StatusPublic;
      form.publishAt = strftime('%Y-%m-%dT%H:%M', new Date(Date.now() + 86400 * 30 * 1000));
      draft.check(null, { title: form.title, body: form.body });
    }
  });

  $effect(() => {
    if (entry.title !== form.title || entry.body !== form.body) {
      draft.saveDebounced(entry.id ?? null, { title: form.title, body: form.body });
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

    if (form.status === StatusScheduled || form.status === StatusReserved) {
      const date = new Date(form.publishAt);
      data.set('publish_at', date.toISOString());
    }
    data.set('status', form.status);

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
          draft.clear(entry.id ?? null);
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

  function openSearchDialog() {
    searchQuery = '';
    searchResults = [];
    searchSelectedIndex = 0;
    searchDialog.showModal();
    setTimeout(() => searchInput?.focus(), 0);
  }

  async function handleSearchInput() {
    if (searchQuery.length < 2) {
      searchResults = [];
      return;
    }
    try {
      const data = await api.get<{ results: SearchEntryResponse[] }>('/api/search', { q: searchQuery });
      searchResults = data.results || [];
      searchSelectedIndex = 0;
    } catch (e) {
      console.error(e);
    }
  }

  function handleSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'n')) {
      e.preventDefault();
      searchSelectedIndex = (searchSelectedIndex + 1) % searchResults.length;
      searchResultItems[searchSelectedIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'p')) {
      e.preventDefault();
      searchSelectedIndex = (searchSelectedIndex - 1 + searchResults.length) % searchResults.length;
      searchResultItems[searchSelectedIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[searchSelectedIndex]) {
        if (e.shiftKey || e.metaKey || e.ctrlKey) {
          openSearchResult(searchResults[searchSelectedIndex]);
        } else {
          selectSearchResult(searchResults[searchSelectedIndex]);
        }
      }
    } else if (e.key === 'Escape') {
      searchDialog.close();
    }
  }

  function openSearchResult(result: SearchEntryResponse) {
    const url = result.path.startsWith('http') ? result.path : `${location.origin}/${result.path}`;
    window.open(url, '_blank');
  }

  function selectSearchResult(result: SearchEntryResponse) {
    const url = result.path.startsWith('http') ? result.path : `${location.origin}/${result.path}`;
    let link = '';

    switch (form.format) {
      case 'Hatena':
        link = `[${url}:title=${result.title}]`;
        break;
      case 'Markdown':
        link = `[${result.title}](${url})`;
        break;
      case 'HTML':
        link = `<a href="${url}">${result.title}</a>`;
        break;
      case 'tDiary':
        link = `[[${result.title}|${url}]]`;
        break;
      default:
        link = url;
    }

    insertText(link);
    searchDialog.close();
    bodyTextArea.focus();
  }

  function restoreBackup() {
    if (draft.data) {
      form.title = draft.data.title;
      form.body = draft.data.body;
      draft.clear(entry.id ?? null);
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
    } else if (key === 'Control-l' || key === 'Meta-l') {
      openSearchDialog();
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function openPreview() {
    previewDialog.showModal();

    const formEl = document.createElement('form');
    formEl.method = 'POST';
    formEl.action = '/admin/api/preview';
    formEl.target = 'preview-iframe';

    const fields = {
      title: form.title,
      body: form.body,
      format: form.format,
      sk: api.skValue
    };

    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      formEl.appendChild(input);
    }

    document.body.appendChild(formEl);
    formEl.submit();
    document.body.removeChild(formEl);
  }
  function escapeHTML(str: string) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
  }

  function highlight(text: string, query: string) {
    if (!query) return escapeHTML(text);
    const escapedText = escapeHTML(text);
    const tokens = query.split(/\s+/).filter(t => t.length >= 2);
    if (tokens.length === 0) return escapedText;

    const pattern = tokens.map(t => t.replace(/[.*+?^${}()|[\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');
    return escapedText.replace(regex, '<mark>$1</mark>');
  }

  function getSummary(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('script, style, noscript, iframe').forEach(el => el.remove());
    const textContent = doc.body.textContent || "";
    return textContent.replace(/\s+/g, ' ').trim().substring(0, 200) + (textContent.length > 200 ? '...' : '');
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
      <button type="button" onclick={openSearchDialog}>🔗 リンク</button>
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
    <div class="buttons footer-container">
      <div class="status-selector">
        <label class="status-option" title="非公開のまま保存します">
          <input type="radio" bind:group={form.status} value={StatusDraft}>
          <div class="status-content">
            <span class="label-text">下書き</span>
          </div>
        </label>
        <label class="status-option" title="今すぐ公開し、URLを確定させます">
          <input type="radio" bind:group={form.status} value={StatusPublic}>
          <div class="status-content">
            <span class="label-text">公開</span>
          </div>
        </label>
        <label class="status-option" title="指定した日時に公開します。URLは今すぐ確定します。">
          <input type="radio" bind:group={form.status} value={StatusScheduled}>
          <div class="status-content">
            <span class="label-text">公開を遅延</span>
            <span class="description">URL確定</span>
          </div>
        </label>
        <label class="status-option" title="指定した日付を投稿日として予約します。公開されるまでURLは確定しません。">
          <input type="radio" bind:group={form.status} value={StatusReserved}>
          <div class="status-content">
            <span class="label-text">予約投稿</span>
            <span class="description">URL未定</span>
          </div>
        </label>
      </div>

      <div class="action-row-container">
        <div class="footer-left">
          <button
            type="button"
            class="submit-button"
            onclick={saveEntry}
            disabled={saving}
          >
            {#if saving}
              {progress || 'リクエスト中'}
            {:else if form.status === StatusDraft}
              下書き保存
            {:else if form.status === StatusPublic}
              {id ? '更新する' : '公開する'}
            {:else}
              予約する
            {/if}
          </button>
          {#if form.status === StatusScheduled || form.status === StatusReserved}
            <input type="datetime-local" bind:value={form.publishAt} class="datetime-input">
          {/if}
        </div>

        <div class="footer-right">
          {#if draft.exists}
            <button id="restore" type="button" class="submit-button restore-button" onclick={() => restoreDialog.showModal()}>
              復元...
            </button>
          {/if}
          <button
            type="button"
            class="submit-button preview-button"
            onclick={openPreview}
            disabled={saving}
          >
            プレビュー
          </button>
        </div>
      </div>
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
        tabindex="-1"
        onclick={() => insertTag(tag)}
        onmouseenter={() => selectedIndex = i}
        onkeydown={(e) => e.key === 'Enter' && insertTag(tag)}
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

<dialog bind:this={previewDialog} id="previewDialog">
  <div class="preview-header">
    <h3>プレビュー</h3>
    <button type="button" class="close-button" onclick={() => previewDialog.close()}>閉じる</button>
  </div>
  <div class="preview-body">
    <iframe name="preview-iframe" title="Preview"></iframe>
  </div>
</dialog>

<dialog bind:this={searchDialog} id="searchDialog" class="search-dialog">
  <div class="search-header">
    <h3>過去日記を検索</h3>
    <button type="button" class="close-button" onclick={() => searchDialog.close()}>閉じる</button>
  </div>
  <div class="search-body">
    <input
      type="search"
      placeholder="キーワードを入力..."
      bind:this={searchInput}
      bind:value={searchQuery}
      oninput={handleSearchInput}
      onkeydown={handleSearchKeyDown}
      class="search-input"
    />
    <div class="search-results">
      {#each searchResults as result, i}
        <div
          bind:this={searchResultItems[i]}
          class="search-result-item"
          class:selected={searchSelectedIndex === i}
          onclick={() => selectSearchResult(result)}
          onmouseenter={() => searchSelectedIndex = i}
          onkeydown={(e) => e.key === 'Enter' && selectSearchResult(result)}
          role="button"
          tabindex="-1"
        >
          <div class="result-title">
            {@html highlight(result.title, searchQuery)}
            {#each result.tags as tag}
              <span class="tag">{tag}</span>
            {/each}
            <button
              type="button"
              class="open-result-button"
              onclick={(e) => { e.stopPropagation(); openSearchResult(result); }}
              title="別タブで開く"
            >
              ↗️
            </button>
          </div>
          <div class="result-summary">{@html highlight(getSummary(result.formatted_body), searchQuery)}</div>
          <div class="result-meta">
            <span class="result-date">{result.date}</span>
            <span class="result-path">{result.path}</span>
          </div>
        </div>
      {:else}
        {#if searchQuery.length >= 2}
          <div class="no-results">結果が見つかりません</div>
        {/if}
      {/each}
    </div>
  </div>
  <div class="dialog-footer">
    <button type="button" onclick={() => searchDialog.close()}>キャンセル</button>
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

  .footer-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .footer-left, .footer-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .footer-right {
    justify-content: flex-end;
  }

  .status-selector {
    display: flex;
    gap: 4px;
  }

  .status-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 4px;
    background: #f0f4f5;
    border: 1px solid #dfe5e7;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    white-space: nowrap;
  }

  .status-option:has(input:checked) {
    background: #e0f7fa;
    border-color: #00acc1;
  }

  .status-option input[type="radio"] {
    margin-top: 3px;
  }

  .status-content {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .label-text {
    font-weight: bold;
    font-size: 0.9em;
  }

  .description {
    font-size: 0.75em;
    color: #666;
  }

  .action-row-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
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

  .preview-button, .restore-button {
    background: #757575;
  }

  dialog {
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    padding: 20px;
    max-width: 600px;
    width: 90%;
  }

  #previewDialog {
    max-width: 1000px;
    width: 95%;
    height: 90vh;
    padding: 0;
    flex-direction: column;
  }

  #previewDialog[open] {
    display: flex;
  }

  .preview-header {
    padding: 10px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f7f8f9;
  }

  .preview-header h3 {
    margin: 0;
  }

  .close-button {
    background: #fff;
    border: 1px solid #dfe5e7;
    border-radius: 3px;
    padding: 4px 12px;
    cursor: pointer;
  }

  .close-button:hover {
    background: #eee;
  }

  .preview-body {
    flex: 1;
    overflow: hidden;
  }

  .preview-body iframe {
    width: 100%;
    height: 100%;
    border: none;
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

  .search-dialog[open] {
    display: flex;
    flex-direction: column;
  }

  .search-dialog {
    padding: 0;
  }

  .search-header {
    padding: 10px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f7f8f9;
  }

  .search-header h3 {
    margin: 0;
    font-size: 1.1em;
  }

  .search-body {
    padding: 20px;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .search-input {
    margin-bottom: 16px;
    padding: 12px;
    border: 1px solid #dfe5e7;
    border-radius: 4px;
    font-size: 1em;
    width: 100%;
    box-sizing: border-box;
  }

  .search-input:focus {
    outline: none;
    border-color: #00acc1;
    box-shadow: 0 0 0 2px rgba(0, 172, 193, 0.2);
  }

  .search-results {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #dfe5e7;
    border-radius: 4px;
    background: #fff;
  }

  .search-result-item {
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
  }

  .search-result-item:last-child {
    border-bottom: none;
  }

  .search-result-item.selected {
    background: #e0f7fa;
  }

  .result-title {
    font-weight: bold;
    font-size: 1.1em;
    margin-bottom: 4px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .result-title .tag {
    background: #f0f4f5;
    color: #666;
    font-size: 0.7rem;
    padding: 1px 6px;
    border-radius: 2px;
    border: 1px solid #dfe5e7;
    font-weight: normal;
  }

  .open-result-button {
    margin-left: auto;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.8em;
    padding: 4px;
    border-radius: 4px;
    opacity: 0.5;
    transition: opacity 0.2s, background 0.2s;
  }

  .open-result-button:hover {
    opacity: 1;
    background: rgba(0,0,0,0.05);
  }

  .result-summary {
    font-size: 0.9rem;
    color: #333;
    margin-bottom: 8px;
    line-height: 1.6;
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  :global(.result-summary mark) {
    background: #fff59d;
    color: #000;
    padding: 0 2px;
    border-radius: 2px;
    font-weight: bold;
  }

  .result-meta {
    font-size: 0.75em;
    color: #888;
    display: flex;
    gap: 12px;
  }

  .no-results {
    padding: 20px;
    text-align: center;
    color: #666;
  }

  .dialog-footer {
    padding: 16px 20px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    background: #f7f8f9;
  }

  .dialog-footer button {
    background: #fff;
    border: 1px solid #dfe5e7;
    border-radius: 3px;
    padding: 8px 16px;
    cursor: pointer;
  }

  .dialog-footer button:hover {
    background: #eee;
  }
</style>
