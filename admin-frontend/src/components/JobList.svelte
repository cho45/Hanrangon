<script lang="ts">
  import { onMount } from 'svelte';
  import strftime from 'strftime';
  import { api } from '../lib/api.svelte';
  import type { Job } from '../lib/types/models';

  let jobs = $state<Job[]>([]);
  let total = $state(0);
  let offset = $state(0);
  let limit = 50;

  async function fetchJobs() {
    try {
      const data = await api.get<{ jobs: Job[], total: number }>('/admin/api/jobs', { limit, offset });
      jobs = data.jobs || [];
      total = data.total || 0;
    } catch (e) {
      console.error(e);
    }
  }

  onMount(fetchJobs);

  function goOlder() {
    if (offset + limit < total) {
      offset += limit;
      fetchJobs();
    }
  }

  function goNewer() {
    if (offset - limit >= 0) {
      offset -= limit;
      fetchJobs();
    }
  }

  function formatTime(iso: string) {
    return strftime('%Y-%m-%d %H:%M:%S', new Date(iso));
  }
</script>

{#snippet statusBadge(status: string)}
  <span class="status status-{status}">{status}</span>
{/snippet}

{#snippet time(iso: string, valid: boolean = true)}
  <time class="time" datetime={iso}>{valid && iso ? formatTime(iso) : '-'}</time>
{/snippet}

<div class="job-list">
  <div class="header">
    <h2>ジョブ一覧 ({total})</h2>
    <div class="pagination">
      <button disabled={offset === 0 || api.loading} onclick={goNewer}>新しい方へ</button>
      <span>{offset + 1} - {Math.min(offset + limit, total)} / {total}</span>
      <button disabled={offset + limit >= total || api.loading} onclick={goOlder}>古い方へ</button>
      <button class="refresh-btn" onclick={fetchJobs} style="margin-left: 10px;">更新</button>
    </div>
  </div>

  {#if api.loading && jobs.length === 0}
    <div class="loading"></div>
  {:else}
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Status</th>
          <th>Retry</th>
          <th>Created At</th>
          <th>Finished At</th>
          <th>Depends On</th>
          <th>Error</th>
        </tr>
      </thead>
      <tbody>
        {#each jobs as job}
          <tr>
            <td>{job.id}</td>
            <td><strong>{job.job_type_name}</strong></td>
            <td>
              {@render statusBadge(job.status)}
            </td>
            <td>{job.retry_count}</td>
            <td>{@render time(job.created_at)}</td>
            <td>{@render time(job.finished_at.Time, job.finished_at.Valid)}</td>
            <td>
              {#if job.depends_on?.Valid && job.depends_on.String !== "null"}
                <div class="depends-on" title={job.depends_on.String}>{job.depends_on.String}</div>
              {:else}
                -
              {/if}
            </td>
            <td class="error">
              {#if job.error_message?.Valid}
                <div class="error-text" title={job.error_message.String}>{job.error_message.String}</div>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .job-list {
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

  .pagination {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .refresh-btn {
    background: #757575;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 3px;
    cursor: pointer;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    table-layout: fixed;
  }

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  th {
    background: #f8f9fa;
    font-weight: bold;
    font-size: 0.9rem;
  }

  th:nth-child(1), td:nth-child(1) { width: 60px; }
  th:nth-child(2), td:nth-child(2) { width: 150px; }
  th:nth-child(3), td:nth-child(3) { width: 100px; }
  th:nth-child(4), td:nth-child(4) { width: 60px; }
  th:nth-child(5), td:nth-child(5) { width: 180px; }
  th:nth-child(6), td:nth-child(6) { width: 180px; }
  th:nth-child(7), td:nth-child(7) { width: 150px; }

  .time {
    font-family: monospace;
    font-size: 0.85rem;
  }

  .status {
    font-size: 0.8rem;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .status-pending { background: #e3f2fd; color: #1976d2; }
  .status-running { background: #e8f5e9; color: #2e7d32; }
  .status-failed { background: #ffebee; color: #c62828; }

  .depends-on {
    font-size: 0.8rem;
    font-family: monospace;
    max-width: 100%;
  }

  .error-text {
    font-size: 0.8rem;
    color: #c62828;
    max-width: 100%;
  }

  .loading {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #00acc1;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 2s linear infinite;
    margin: 20px auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
