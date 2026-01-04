<script lang="ts">
  import { onMount } from 'svelte';

  let { onEdit } = $props<{ onEdit: (id: number) => void }>();

  interface Entry {
    id: number;
    title: string;
    path: string;
    status: string;
    date: string;
  }

  let entries = $state<Entry[]>([]);
  let total = $state(0);
  let offset = $state(0);
  let limit = 50;
  let loading = $state(true);

  async function fetchEntries() {
    loading = true;
    try {
      const res = await fetch(`/admin/api/entries?limit=${limit}&offset=${offset}`);
      const data = await res.json();
      entries = data.entries || [];
      total = data.total || 0;
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  onMount(fetchEntries);

  function next() {
    if (offset + limit < total) {
      offset += limit;
      fetchEntries();
    }
  }

  function prev() {
    if (offset - limit >= 0) {
      offset -= limit;
      fetchEntries();
    }
  }
</script>

<div class="entry-list">
  <div class="header">
    <h2>エントリ一覧 ({total})</h2>
    <div class="pagination">
      <button disabled={offset === 0 || loading} onclick={prev}>前へ</button>
      <span>{offset + 1} - {Math.min(offset + limit, total)} / {total}</span>
      <button disabled={offset + limit >= total || loading} onclick={next}>次へ</button>
    </div>
  </div>

  <div class="table-container" class:is-loading={loading}>
    {#if loading && entries.length === 0}
      <div class="loading-spinner-container">
        <div class="loading-spinner"></div>
      </div>
    {:else}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>日付</th>
            <th>ステータス</th>
            <th>タイトル / パス</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {#each entries as entry}
            <tr>
              <td>{entry.id}</td>
              <td class="date">{entry.date}</td>
              <td>
                <span class="status status-{entry.status}">{entry.status}</span>
              </td>
              <td>
                <div class="title">{entry.title}</div>
                <div class="path"><a href="/{entry.path}" target="_blank">/{entry.path}</a></div>
              </td>
              <td>
                <button class="edit-btn" onclick={() => onEdit(entry.id)}>編集</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      {#if loading}
        <div class="overlay">
          <div class="loading-spinner"></div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .entry-list {
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .pagination {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .table-container {
    position: relative;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    min-height: 200px;
  }

  .table-container.is-loading table {
    opacity: 0.5;
    pointer-events: none;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background: #f8f9fa;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .date {
    white-space: nowrap;
    font-family: monospace;
  }

  .title {
    font-weight: bold;
  }

  .path {
    font-size: 0.8rem;
    color: #666;
  }

  .status {
    font-size: 0.8rem;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .status-public { background: #e3f2fd; color: #1976d2; }
  .status-scheduled { background: #fff3e0; color: #f57c00; }
  .status-draft { background: #eee; color: #666; }

  .edit-btn {
    background: #00acc1;
    color: #fff;
    border: none;
    padding: 6px 12px;
    border-radius: 3px;
    cursor: pointer;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
  }

  .loading-spinner-container {
    padding: 40px;
    display: flex;
    justify-content: center;
  }

  .loading-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #00acc1;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>