<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../lib/api.svelte';
  import type { R2UsageStats, OperationStat } from '../lib/types/models';

  let r2Usage = $state<R2UsageStats | null>(null);
  let error = $state<string | null>(null);

  async function fetchR2Usage() {
    try {
      r2Usage = await api.get<R2UsageStats>('/admin/api/r2/usage');
    } catch (e) {
      console.error('Failed to fetch R2 usage:', e);
      error = 'Failed to load R2 usage data';
    }
  }

  onMount(fetchR2Usage);

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const classAActions = [
    'PutObject', 'CopyObject', 'ListObjects', 'CompleteMultipartUpload',
    'CreateMultipartUpload', 'UploadPart', 'UploadPartCopy', 'ListBuckets',
    'PutBucket', 'DeleteObject', 'DeleteObjects'
  ];
  const classBActions = [
    'HeadObject', 'GetObject', 'HeadBucket', 'GetBucketEncryption',
    'GetBucketLocation', 'GetBucketPolicy'
  ];

  const classAStats = $derived.by(() => {
    if (!r2Usage) return 0;
    return (r2Usage.operations || [])
      .filter((op: OperationStat) => classAActions.includes(op.action_type))
      .reduce((sum: number, op: OperationStat) => sum + op.requests, 0);
  });

  const classBStats = $derived.by(() => {
    if (!r2Usage) return 0;
    return (r2Usage.operations || [])
      .filter((op: OperationStat) => classBActions.includes(op.action_type))
      .reduce((sum: number, op: OperationStat) => sum + op.requests, 0);
  });

  const classADetails = $derived.by(() => {
    if (!r2Usage) return [];
    return (r2Usage.operations || [])
      .filter((op: OperationStat) => classAActions.includes(op.action_type))
      .sort((a: OperationStat, b: OperationStat) => b.requests - a.requests);
  });

  const classBDetails = $derived.by(() => {
    if (!r2Usage) return [];
    return (r2Usage.operations || [])
      .filter((op: OperationStat) => classBActions.includes(op.action_type))
      .sort((a: OperationStat, b: OperationStat) => b.requests - a.requests);
  });
</script>

<div class="r2-stats">
  {#if r2Usage}
    <div class="stat-card">
      <div class="stat-label">Storage (Free: 10GB)</div>
      <div class="stat-value">{formatBytes(r2Usage.storage_usage_bytes ?? 0)}</div>
      <div class="stat-sub">{(r2Usage.object_count ?? 0).toLocaleString()} objects</div>
      <div class="stat-progress">
        <div class="bar" style="width: {Math.min(100, ((r2Usage.storage_usage_bytes ?? 0) / (10 * 1024 * 1024 * 1024)) * 100)}%"></div>
      </div>
    </div>
    <div class="stat-card has-tooltip">
      <div class="stat-label">Class A (Free: 1M/mo)</div>
      <div class="stat-value">{(classAStats ?? 0).toLocaleString()}</div>
      <div class="stat-sub">Operations</div>
      <div class="stat-progress">
        <div class="bar" style="width: {Math.min(100, ((classAStats ?? 0) / 1000000) * 100)}%"></div>
      </div>
      {#if classADetails.length > 0}
        <div class="tooltip">
          <div class="tooltip-title">Class A Breakdown</div>
          <ul>
            {#each classADetails as detail}
              <li><span class="action">{detail.action_type}</span>: <span class="count">{(detail.requests ?? 0).toLocaleString()}</span></li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
    <div class="stat-card has-tooltip">
      <div class="stat-label">Class B (Free: 10M/mo)</div>
      <div class="stat-value">{(classBStats ?? 0).toLocaleString()}</div>
      <div class="stat-sub">Operations</div>
      <div class="stat-progress">
        <div class="bar" style="width: {Math.min(100, ((classBStats ?? 0) / 10000000) * 100)}%"></div>
      </div>
      {#if classBDetails.length > 0}
        <div class="tooltip">
          <div class="tooltip-title">Class B Breakdown</div>
          <ul>
            {#each classBDetails as detail}
              <li><span class="action">{detail.action_type}</span>: <span class="count">{(detail.requests ?? 0).toLocaleString()}</span></li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {:else if error}
    <div class="stat-card error-card">
      <div class="stat-label">R2 Status</div>
      <div class="stat-value" style="font-size: 0.9rem; color: #d32f2f;">{error}</div>
    </div>
  {:else}
    <div class="stat-card skeleton"></div>
    <div class="stat-card skeleton"></div>
    <div class="stat-card skeleton"></div>
  {/if}
</div>

<style>
  .r2-stats {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    min-height: 84px;
  }

  .stat-card {
    background: #fff;
    padding: 12px 15px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    flex: 1;
    min-width: 0;
    border-top: 3px solid #f38020;
    transition: transform 0.2s;
    position: relative;
    box-sizing: border-box;
    height: 84px;
  }

  .error-card {
    border-top-color: #d32f2f;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    z-index: 101;
  }

  .has-tooltip:hover .tooltip {
    display: block;
  }

  .tooltip {
    display: none;
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    width: 250px;
    z-index: 102;
    background: #333;
    color: #fff;
    padding: 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    pointer-events: none;
  }

  .tooltip::after {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 20px;
    border: 8px solid transparent;
    border-bottom-color: #333;
  }

  .tooltip-title {
    font-weight: bold;
    margin-bottom: 5px;
    border-bottom: 1px solid #555;
    padding-bottom: 3px;
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  .tooltip ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .tooltip li {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }

  .tooltip .action {
    color: #bbb;
  }

  .tooltip .count {
    font-family: monospace;
    font-weight: bold;
  }

  .stat-label {
    font-size: 0.7rem;
    color: #666;
    margin-bottom: 4px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.2;
  }

  .stat-value {
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
    line-height: 1.2;
  }

  .stat-sub {
    font-size: 0.75rem;
    color: #999;
  }

  .stat-progress {
    height: 4px;
    background: #f0f0f0;
    border-radius: 2px;
    margin-top: 8px;
    overflow: hidden;
  }

  .stat-progress .bar {
    height: 100%;
    background: #f38020;
    transition: width 0.5s ease-out;
  }

  .skeleton {
    background: #f9f9f9;
    border-top: 3px solid #333;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
</style>
