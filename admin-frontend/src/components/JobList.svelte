<script lang="ts">
  import { onMount } from 'svelte';
  import strftime from 'strftime';

  interface Job {
    id: number;
    job_type_name: string;
    status: string;
    retry_count: number;
    created_at: string;
    run_after: string;
    error_message: { String: string; Valid: boolean };
  }

  let jobs = $state<Job[]>([]);
  let total = $state(0);
  let offset = $state(0);
  let limit = 50;
  let loading = $state(true);

  async function fetchJobs() {
    loading = true;
    try {
      const res = await fetch(`/admin/api/jobs?limit=${limit}&offset=${offset}`);
      const data = await res.json();
      jobs = data.jobs || [];
      total = data.total || 0;
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  onMount(fetchJobs);

  function next() {
    if (offset + limit < total) {
      offset += limit;
      fetchJobs();
    }
  }

  function prev() {
    if (offset - limit >= 0) {
      offset -= limit;
      fetchJobs();
    }
  }

  function formatTime(iso: string) {
    return strftime('%Y-%m-%d %H:%M:%S', new Date(iso));
  }
</script>

<div class="job-list">
  <div class="header">
    <h2>ジョブ一覧 ({total})</h2>
    <div class="pagination">
      <button disabled={offset === 0 || loading} onclick={prev}>前へ</button>
      <span>{offset + 1} - {Math.min(offset + limit, total)} / {total}</span>
      <button disabled={offset + limit >= total || loading} onclick={next}>次へ</button>
      <button class="refresh-btn" onclick={fetchJobs} style="margin-left: 10px;">更新</button>
    </div>
  </div>

  {#if loading}
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
          <th>Error</th>
        </tr>
      </thead>
      <tbody>
        {#each jobs as job}
          <tr>
            <td>{job.id}</td>
            <td><strong>{job.job_type_name}</strong></td>
            <td>
              <span class="status status-{job.status}">{job.status}</span>
            </td>
            <td>{job.retry_count}</td>
            <td class="time">{formatTime(job.created_at)}</td>
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
