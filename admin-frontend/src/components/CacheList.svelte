<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../lib/api.svelte';
  import type { GetCacheStatsRow, ListCacheEntriesRow, CacheMetadatum } from '../lib/types/generated/cachedb';

  let stats = $state<GetCacheStatsRow | null>(null);
  let metadata = $state<CacheMetadatum[]>([]);
  let entries = $state<ListCacheEntriesRow[]>([]);
  let sortKey = $state<string>('created_at');
  let sortOrder = $state<'asc' | 'desc'>('desc');

  async function fetchStats() {
    try {
      const res = await api.get<{ stats: GetCacheStatsRow, metadata: CacheMetadatum[] }>('/admin/api/cache/stats');
      stats = res.stats;
      metadata = res.metadata;
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchEntries() {
    try {
      const res = await api.get<{ entries: ListCacheEntriesRow[] }>('/admin/api/cache/list');
      entries = res.entries;
    } catch (e) {
      console.error(e);
    }
  }

  onMount(() => {
    fetchStats();
    fetchEntries();
  });

  async function purgeAll() {
    if (!confirm('全てのキャッシュを削除しますか？')) return;
    try {
      await api.post('/admin/api/cache/purge', undefined);
      await fetchStats();
      await fetchEntries();
    } catch (e) {
      console.error(e);
    }
  }

  async function purgeKey(key: string) {
    try {
      await api.post(`/admin/api/cache/purge?key=${encodeURIComponent(key)}`, undefined);
      await fetchStats();
      await fetchEntries();
    } catch (e) {
      console.error(e);
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const sortedEntries = $derived.by(() => {
    return [...entries].sort((a, b) => {
      let valA: any, valB: any;
      if (sortKey === 'key') {
        valA = a.cache_key;
        valB = b.cache_key;
      } else if (sortKey === 'size') {
        valA = a.size?.Int64 ?? 0;
        valB = b.size?.Int64 ?? 0;
      } else {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  });

  function toggleSort(key: string) {
    if (sortKey === key) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortOrder = 'desc';
    }
  }
</script>

<div class="cache-list-page">
  <div class="header">
    <h2>ページキャッシュ管理</h2>
    <div class="actions">
      <button class="purge-button" onclick={purgeAll}>全キャッシュ削除</button>
    </div>
  </div>

  {#if stats}
    <div class="stats-grid">
      <div class="stat-card">
        <div class="label">キャッシュ数</div>
        <div class="value">{stats.total_count}</div>
      </div>
      <div class="stat-card">
        <div class="label">合計サイズ</div>
        <div class="value">{formatBytes(Number(stats.total_size))}</div>
      </div>
      <div class="stat-card">
        <div class="label">最古</div>
        <div class="value date">{stats.oldest_at ? new Date(String(stats.oldest_at)).toLocaleString() : '-'}</div>
      </div>
      <div class="stat-card">
        <div class="label">最新</div>
        <div class="value date">{stats.newest_at ? new Date(String(stats.newest_at)).toLocaleString() : '-'}</div>
      </div>
    </div>
  {/if}

  {#if metadata.length > 0}
    <section class="metadata-section">
      <h3>メタデータ</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {#each metadata as meta}
              <tr>
                <td><code>{meta.key}</code></td>
                <td><code>{meta.value}</code></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  {/if}

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th onclick={() => toggleSort('key')} class="sortable" class:active={sortKey === 'key'}>
            Key {sortKey === 'key' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </th>
          <th onclick={() => toggleSort('size')} class="sortable" class:active={sortKey === 'size'}>
            Size {sortKey === 'size' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </th>
          <th>Type</th>
          <th onclick={() => toggleSort('created_at')} class="sortable" class:active={sortKey === 'created_at'}>
            Created At {sortKey === 'created_at' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each sortedEntries as entry}
          <tr>
            <td class="cache-key"><code>{entry.cache_key}</code></td>
            <td>{formatBytes(entry.size?.Int64 ?? 0)}</td>
            <td><small>{entry.content_type}</small></td>
            <td>{new Date(entry.created_at).toLocaleString()}</td>
            <td>
              <button class="delete-button" onclick={() => purgeKey(entry.cache_key)}>削除</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .cache-list-page {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .stat-card {
    background: white;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .stat-card .label {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 5px;
  }

  .stat-card .value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
  }

  .stat-card .value.date {
    font-size: 0.9rem;
  }

  .metadata-section {
    margin-bottom: 30px;
  }

  .table-container {
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
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

  th.sortable {
    cursor: pointer;
    user-select: none;
  }

  th.sortable:hover {
    background: #f1f1f1;
  }

  th.active {
    color: #00acc1;
  }

  .cache-key {
    word-break: break-all;
    max-width: 400px;
  }

  code {
    background: #f1f1f1;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.85rem;
  }

  .purge-button {
    background: #f44336;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .purge-button:hover {
    background: #d32f2f;
  }

  .delete-button {
    background: none;
    border: 1px solid #f44336;
    color: #f44336;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .delete-button:hover {
    background: #f44336;
    color: white;
  }
</style>