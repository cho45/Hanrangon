<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../lib/api.svelte';

  interface InfoData {
    is_development: boolean;
    app_hash: string;
    config: Record<string, any>;
    tfidf_stats: {
      total_terms: number;
      indexed_entries: number;
      total_related_pairs: number;
      entries_with_related: number;
      top_terms: { term: string, df: number }[];
      avg_score: number;
    };
    image_stats: {
      total_images: number;
      unindexed_images: number;
    };
    debug_info: {
      go_version: string;
      num_goroutine: number;
      start_time: string;
      uptime: string;
      mem_alloc: number;
      mem_total_alloc: number;
      mem_sys: number;
      num_gc: number;
    };
  }

  let info = $state<InfoData | null>(null);

  async function fetchInfo() {
    try {
      info = await api.get('/admin/api/info');
    } catch (e) {
      console.error(e);
    }
  }

  onMount(fetchInfo);

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
</script>

<div class="info-page">
  <div class="header">
    <h2>システム情報</h2>
  </div>

  {#if api.loading && !info}
    <div class="loading-spinner-container">
      <div class="loading-spinner"></div>
    </div>
  {:else if info}
    <div class="sections">
      <section>
        <h3>TF-IDF 統計</h3>
        <div class="table-container">
          <table>
            <tbody>
              <tr><th>総語彙数 (Terms)</th><td>{info.tfidf_stats.total_terms}</td></tr>
              <tr><th>インデックス済みエントリ</th><td>{info.tfidf_stats.indexed_entries}</td></tr>
              <tr><th>関連エントリ計算済み</th><td>{info.tfidf_stats.entries_with_related}</td></tr>
              <tr><th>総関連ペア数</th><td>{info.tfidf_stats.total_related_pairs}</td></tr>
              <tr><th>平均類似度スコア</th><td>{info.tfidf_stats.avg_score.toFixed(4)}</td></tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top: 10px;">
          <h4>頻出単語 (Top 20 DF)</h4>
          <div class="top-terms">
            {#each info.tfidf_stats.top_terms as item}
              <span class="term-badge" title="DF: {item.df}">{item.term}</span>
            {/each}
          </div>
        </div>
      </section>

      <section>
        <h3>画像統計</h3>
        <div class="table-container">
          <table>
            <tbody>
              <tr><th>総画像数</th><td>{info.image_stats.total_images}</td></tr>
              <tr><th>未インデックス画像数</th><td>{info.image_stats.unindexed_images}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>全般</h3>
        <div class="table-container">
          <table>
            <tbody>
              <tr><th>IsDevelopment</th><td>{info.is_development}</td></tr>
              <tr><th>AppHash</th><td><code>{info.app_hash}</code></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>デバッグ情報</h3>
        <div class="table-container">
          <table>
            <tbody>
              <tr><th>Go Version</th><td>{info.debug_info.go_version}</td></tr>
              <tr><th>Goroutines</th><td>{info.debug_info.num_goroutine}</td></tr>
              <tr><th>Start Time</th><td>{new Date(info.debug_info.start_time).toLocaleString()}</td></tr>
              <tr><th>Uptime</th><td>{info.debug_info.uptime}</td></tr>
              <tr><th>Mem Alloc</th><td>{formatBytes(info.debug_info.mem_alloc)}</td></tr>
              <tr><th>Mem Total Alloc</th><td>{formatBytes(info.debug_info.mem_total_alloc)}</td></tr>
              <tr><th>Mem Sys</th><td>{formatBytes(info.debug_info.mem_sys)}</td></tr>
              <tr><th>Num GC</th><td>{info.debug_info.num_gc}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>設定 (Config)</h3>
        <pre>{JSON.stringify(info.config, null, 2)}</pre>
      </section>
    </div>
  {/if}
</div>

<style>
  .info-page {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .header {
    margin-bottom: 20px;
  }

  .sections {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  h3 {
    margin: 0 0 10px 0;
    font-size: 1.1rem;
    color: #333;
  }

  h4 {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 8px;
  }

  .top-terms {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .term-badge {
    background: #e3f2fd;
    color: #1976d2;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    border: 1px solid #bbdefb;
  }

  .table-container {
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
    width: 200px;
    background: #f8f9fa;
    font-weight: bold;
    font-size: 0.9rem;
  }

  code {
    background: #f1f1f1;
    padding: 2px 4px;
    border-radius: 3px;
    word-break: break-all;
    font-family: monospace;
    font-size: 0.9rem;
  }

  pre {
    background: #fff;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: auto;
    font-size: 0.85rem;
    margin: 0;
    font-family: monospace;
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
