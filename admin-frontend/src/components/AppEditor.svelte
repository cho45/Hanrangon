<svelte:options
  customElement={{
    tag: 'app-editor',
    props: {
      entryJson: { attribute: 'entry-json' },
      sk: { attribute: 'sk' }
    }
  }}
/>

<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import strftime from 'strftime';

  // Svelte 5 のプロパティ受け取り
  let { entryJson = '', sk = '' } = $props();

  interface Entry {
    id: string | null;
    title: string;
    body: string;
    status: string | null;
    publish_at?: number;
    publish_at_epoch?: number;
  }

  interface Backup {
    title: string;
    body: string;
    time: number;
  }

  let entry: Entry = $state({ id: null, title: '', body: '', status: null });
  let form = $state({ id: null as string | null, title: '', body: '', publishLater: false });
  let saving = $state(false);
  let progress = $state('');
  let existingBackup = $state<Backup | null>(null);

  let titleInput: HTMLInputElement;
  let bodyTextArea: HTMLTextAreaElement;
  let tagDialog: HTMLDialogElement;
  let restoreDialog: HTMLDialogElement;

  // 無限ループ防止のため、最後に処理した JSON を記録しておく
  let lastProcessedJson = '';

  $effect(() => {
    // entryJson が変わったときだけ処理する
    if (entryJson && entryJson !== lastProcessedJson) {
      console.log('Processing entryJson...');
      try {
        const parsed = JSON.parse(entryJson);
        
        // untrack を使って、この更新自体が effect を再トリガーしないようにする
        untrack(() => {
          lastProcessedJson = entryJson;
          entry = parsed;
          form.id = parsed.id;
          form.title = parsed.title;
          form.body = parsed.body;
          form.publishLater = parsed.status === 'scheduled';
          checkBackup();
        });
      } catch (e) {
        console.error('Failed to parse entryJson', e);
      }
    }
  });

  onMount(() => {
    const loading = document.querySelector('.loading');
    if (loading) loading.remove();

    const interval = setInterval(saveBackup, 3000);
    return () => clearInterval(interval);
  });

  function checkBackup() {
    if (!entry.id && entry.id !== null) return;
    const key = `nogag-backup-${entry.id || 'new'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const backup: Backup = JSON.parse(saved);
      if (entry.title !== backup.title || entry.body !== backup.body) {
        existingBackup = backup;
      }
    }
  }

  function saveBackup() {
    if (entry.title !== form.title || entry.body !== form.body) {
      const key = `nogag-backup-${entry.id || 'new'}`;
      const backup: Backup = {
        title: form.title,
        body: form.body,
        time: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(backup));
      existingBackup = null;
    }
  }

  async function saveEntry() {
    saving = true;
    progress = 'リクエスト中';

    const data = new FormData();
    data.set('id', form.id || '');
    data.set('title', form.title);
    data.set('body', form.body);
    data.set('sk', sk);

    if (form.publishLater) {
      const epoch = entry.publish_at_epoch || entry.publish_at || (Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30));
      data.set('publish_at', String(epoch));
      data.set('status', 'scheduled');
    } else {
      data.set('status', 'public');
    }

    try {
      const response = await fetch('/admin/api/edit', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'fetch'
        },
        body: data
      });
      const resData = await response.json();
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
          localStorage.removeItem(`nogag-backup-${entry.id || 'new'}`);
          progress = '完了';
          saving = false;
          eventSource.close();
          location.href = msg.location;
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

  function insertTag(tag: string) {
    form.title = `[${tag}]${form.title}`;
    tagDialog.close();
    titleInput.focus();
  }

  function restoreBackup() {
    if (existingBackup) {
      form.title = existingBackup.title;
      form.body = existingBackup.body;
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
      formData.append('sk', sk);

      try {
        const response = await fetch('/admin/api/upload/image', {
          method: 'POST',
          headers: {
            'X-Requested-With': 'fetch'
          },
          body: formData
        });
        const data = await response.json();
        const syntax = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${data.uploaded}" class="picasa" itemprop="url"><img src="${data.uploaded}" alt="photo" itemprop="image"/></a></span>\n`;
        insertText(syntax, true);
      } catch (err) {
        alert('アップロードに失敗しました');
      }
    };
    input.click();
  }

  function insertText(text: string, select: boolean | number = false) {
    const start = bodyTextArea.selectionStart;
    const end = bodyTextArea.selectionEnd;
    const value = bodyTextArea.value;

    form.body = value.substring(0, start) + text + value.substring(end);
    
    setTimeout(() => {
      if (typeof select === 'boolean' && select) {
        bodyTextArea.selectionStart = start;
        bodyTextArea.selectionEnd = start + text.length;
      } else if (typeof select === 'number') {
        bodyTextArea.selectionStart = bodyTextArea.selectionEnd = start + select;
      } else {
        bodyTextArea.selectionStart = bodyTextArea.selectionEnd = start + text.length;
      }
      bodyTextArea.focus();
    }, 0);
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
      <button type="button" onclick={() => tagDialog.showModal()}>🏷️ タグ</button>
      <button type="button" onclick={openUploadDialog}>📷 写真</button>
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
        <label>
          <input type="checkbox" bind:checked={form.publishLater}>
          公開を遅延
        </label>
      </div>
      <button
        type="button"
        class="submit-button"
        onclick={saveEntry}
        disabled={saving}
      >
        {saving ? (progress || 'リクエスト中') : '更新'}
      </button>
      {#if existingBackup}
        <button id="restore" type="button" class="submit-button" onclick={() => restoreDialog.showModal()}>
          復元...
        </button>
      {/if}
    </div>
  </div>
</div>

<dialog bind:this={tagDialog} id="tagDialog">
  <h3>タグを選択</h3>
  <div class="tag-list">
    {#each ['tech', 'photo', 'redeveloped', 'stablediffusion', 'photoshopped'] as tag}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="tag-item" onclick={() => insertTag(tag)}>{tag}</div>
    {/each}
  </div>
  <button type="button" onclick={() => tagDialog.close()} style="margin-top: 16px;">キャンセル</button>
</dialog>

<dialog bind:this={restoreDialog} id="restoreDialog">
  <h3>自動バックアップの復元</h3>
  <p>
    {#if existingBackup}
      {strftime('%Y年%m月%d日%H時', new Date(existingBackup.time))}
    {/if}
    に保存されたバックアップを復元しますか?
  </p>
  <div style="display: flex; gap: 8px; justify-content: flex-end;">
    <button type="button" onclick={() => restoreDialog.close()}>キャンセル</button>
    <button type="button" class="submit-button" onclick={restoreBackup}>復元</button>
  </div>
</dialog>

<style>
  :host {
    display: block;
    height: 100%;
    width: 100%;
    background: #f7f8f9;
    font-family: sans-serif;
  }

  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
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
  }

  .tag-item {
    padding: 12px;
    background: #eee;
    border-radius: 4px;
    cursor: pointer;
  }

  .tag-item:hover {
    background: #ddd;
  }

  .progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 4px;
    background: #00acc1;
    transition: width 0.3s;
  }
</style>
