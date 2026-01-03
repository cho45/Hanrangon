import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import strftime from 'strftime';

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

@customElement('app-editor')
export class AppEditor extends LitElement {
  @property({ type: String, attribute: 'entry-json' })
  entryJson = '';

  @property({ type: String })
  sk = '';

  @state()
  private entry: Entry = { id: null, title: '', body: '', status: null };

  @state()
  private form = { id: null as string | null, title: '', body: '', publishLater: false };

  @state()
  private saving = false;

  @state()
  private progress = '';

  @state()
  private existingBackup: Backup | null = null;

  @query('#title')
  private titleInput!: HTMLInputElement;

  @query('#body')
  private bodyTextArea!: HTMLTextAreaElement;

  @query('#tagDialog')
  private tagDialog!: HTMLDialogElement;

  @query('#restoreDialog')
  private restoreDialog!: HTMLDialogElement;

  static styles = css`
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
  `;

  protected firstUpdated() {
    const loading = document.querySelector('.loading');
    if (loading) loading.remove();

    if (this.entryJson) {
      this.entry = JSON.parse(this.entryJson);
      this.form = {
        ...this.form,
        id: this.entry.id,
        title: this.entry.title,
        body: this.entry.body,
        publishLater: this.entry.status === 'scheduled'
      };
    }

    this.checkBackup();
    setInterval(() => this.saveBackup(), 3000);

    this.bodyTextArea.addEventListener('keydown', (e) => {
      const key = (e.altKey ? "Alt-" : "") + (e.ctrlKey ? "Control-" : "") + (e.metaKey ? "Meta-" : "") + (e.shiftKey ? "Shift-" : "") + e.key;
      if (key === 'Control-t') {
        this.insertText('\\(  \\)', 3);
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  private checkBackup() {
    const key = `nogag-backup-${this.entry.id || 'new'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const backup: Backup = JSON.parse(saved);
      if (this.entry.title !== backup.title || this.entry.body !== backup.body) {
        this.existingBackup = backup;
      }
    }
  }

  private saveBackup() {
    if (this.entry.title !== this.form.title || this.entry.body !== this.form.body) {
      const key = `nogag-backup-${this.entry.id || 'new'}`;
      const backup: Backup = {
        title: this.form.title,
        body: this.form.body,
        time: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(backup));
      this.existingBackup = null;
    }
  }

  private async saveEntry() {
    this.saving = true;
    this.progress = 'リクエスト中';

    const data = new FormData();
    data.set('id', this.form.id || '');
    data.set('title', this.form.title);
    data.set('body', this.form.body);
    data.set('sk', this.sk);
    data.set('post_buffer', this.form.postBuffer ? "1" : "");

    if (this.form.publishLater) {
      const epoch = this.entry.publish_at_epoch || this.entry.publish_at || (Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30));
      data.set('publish_at', String(epoch));
      data.set('status', 'scheduled');
    } else {
      data.set('status', 'public');
    }

    try {
      const response = await fetch('/api/edit', {
        method: 'POST',
        body: data
      });
      const resData = await response.json();
      const sessionID = resData.session_id;

      if (!sessionID) {
        throw new Error('保存に失敗しました');
      }

      this.startSSE(sessionID);
    } catch (err) {
      this.saving = false;
      alert(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  }

  private startSSE(sessionID: string) {
    const eventSource = new EventSource(`/api/edit/progress?sid=${sessionID}`);

    eventSource.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case 'progress':
          this.progress = this.mapProgressMessage(msg.message);
          break;
        case 'done':
          localStorage.removeItem(`nogag-backup-${this.entry.id || 'new'}`);
          this.progress = '完了';
          this.saving = false;
          eventSource.close();
          location.href = msg.location;
          break;
        case 'error':
          this.progress = 'エラー: ' + msg.message;
          this.saving = false;
          eventSource.close();
          alert('保存に失敗しました: ' + msg.message);
          break;
      }
    };

    eventSource.onerror = () => {
      this.saving = false;
      eventSource.close();
      alert('通信エラーが発生しました');
    };
  }

  private mapProgressMessage(msg: string) {
    const map: Record<string, string> = {
      'saving': '保存中',
      'update-similar-entries': '関連エントリを構築中',
      'posting-new-job': 'ジョブを投入中',
      'done': '完了'
    };
    return map[msg] || msg;
  }

  private insertTag(tag: string) {
    this.form = { ...this.form, title: `[${tag}]${this.form.title}` };
    this.tagDialog.close();
    this.titleInput.focus();
  }

  private restoreBackup() {
    if (this.existingBackup) {
      this.form = {
        ...this.form,
        title: this.existingBackup.title,
        body: this.existingBackup.body
      };
      this.restoreDialog.close();
    }
  }

  private async openUploadDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.oninput = async () => {
      if (!input.files?.[0]) return;

      const formData = new FormData();
      formData.append('file', input.files[0]);
      formData.append('sk', this.sk);

      try {
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        const syntax = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${data.uploaded}" class="picasa" itemprop="url"><img src="${data.uploaded}" alt="photo" itemprop="image"/></a></span>\n`;
        
        this.insertText(syntax, true);
      } catch (err) {
        alert('アップロードに失敗しました');
      }
    };
    input.click();
  }

  private insertText(text: string, select: boolean | number = false) {
    const body = this.bodyTextArea;
    const start = body.selectionStart;
    const end = body.selectionEnd;
    const value = body.value;

    body.value = value.substring(0, start) + text + value.substring(end);
    
    this.form = { ...this.form, body: body.value.replace(/\r\n/g, '\n') };

    setTimeout(() => {
      if (typeof select === 'boolean' && select) {
        body.selectionStart = start;
        body.selectionEnd = start + text.length;
      } else if (typeof select === 'number') {
        body.selectionStart = body.selectionEnd = start + select;
      } else {
        body.selectionStart = body.selectionEnd = start + text.length;
      }
      body.focus();
    }, 0);
  }

  render() {
    return html`
      <div class="container">
        <div class="main">
          <input
            id="title"
            type="text"
            placeholder="タイトル"
            .value="${this.form.title}"
            @input="${(e: any) => this.form = { ...this.form, title: e.target.value }}"
          />
          <div class="toolbar">
            <button type="button" @click="${() => this.tagDialog.showModal()}">🏷️ タグ</button>
            <button type="button" @click="${this.openUploadDialog}">📷 写真</button>
          </div>
          <div class="body-container">
            <textarea
              id="body"
              placeholder="本文"
              required
              .value="${this.form.body}"
              @input="${(e: any) => this.form = { ...this.form, body: e.target.value }}"
            ></textarea>
          </div>
        </div>

        <div class="global-actions">
          ${this.saving ? html`<div class="progress-bar" style="width: 100%"></div>` : ''}
          <div class="buttons">
            <div class="options">
              <label>
                <input type="checkbox" @change="${(e: any) => this.form = { ...this.form, publishLater: e.target.checked }}" .checked="${this.form.publishLater}">
                公開を遅延
              </label>
            </div>
            <button
              type="button"
              class="submit-button"
              @click="${this.saveEntry}"
              ?disabled="${this.saving}"
            >
              ${this.saving ? (this.progress || 'リクエスト中') : '更新'}
            </button>
            ${this.existingBackup ? html`
              <button id="restore" type="button" class="submit-button" @click="${() => this.restoreDialog.showModal()}">
                復元...
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <dialog id="tagDialog">
        <h3>タグを選択</h3>
        <div class="tag-list">
          ${['tech', 'photo', 'redeveloped', 'stablediffusion', 'photoshopped'].map(tag => html`
            <div class="tag-item" @click="${() => this.insertTag(tag)}">${tag}</div>
          `)}
        </div>
        <button type="button" @click="${() => this.tagDialog.close()}" style="margin-top: 16px;">キャンセル</button>
      </dialog>

      <dialog id="restoreDialog">
        <h3>自動バックアップの復元</h3>
        <p>
          ${this.existingBackup ? strftime('%Y年%m月%d日%H時', new Date(this.existingBackup.time)) : ''}
          に保存されたバックアップを復元しますか?
        </p>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button type="button" @click="${() => this.restoreDialog.close()}">キャンセル</button>
          <button type="button" class="submit-button" @click="${this.restoreBackup}">復元</button>
        </div>
      </dialog>
    `;
  }
}