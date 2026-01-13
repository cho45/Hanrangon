<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../lib/api.svelte';
  import ColorBitmask from './ColorBitmask.svelte';
  import R2UsageStats from './R2UsageStats.svelte';
  import type { Image, SimilarImage } from '../lib/types/models';

  let images = $state<Image[]>([]);
let offset = $state(0);
let limit = $state(20);
let total = $state(0);

  let similarImages = $state<SimilarImage[]>([]);
  let selectedImage = $state<Image | null>(null);
  let similarDialog = $state<HTMLDialogElement>(null!);

  async function fetchImages() {
    try {
      const res = await api.get<{ images: Image[], total: number }>(`/admin/api/images?limit=${limit}&offset=${offset}`);
      images = res.images || [];
      total = res.total || 0;
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchSimilarImages(image: Image) {
    selectedImage = image;
    similarImages = [];
    similarDialog.showModal();
    try {
      const res = await api.get<{ similar: SimilarImage[] }>(`/admin/api/image/${image.id}/similar`);
      similarImages = res.similar || [];
    } catch (e) {
      console.error(e);
    }
  }

  onMount(fetchImages);

  function nextPage() {
    if (offset + limit < total) {
      offset += limit;
      fetchImages();
    }
  }

  function prevPage() {
    if (offset - limit >= 0) {
      offset -= limit;
      fetchImages();
    }
  }
</script>

<div class="image-list">
  <div class="header">
    <div class="title-area">
      <h2>画像一覧 ({total})</h2>
      <a href="https://dash.cloudflare.com/d52dc19d3368d36eecf4b48d5eb2dd44/r2/default/buckets/lowreal" target="_blank" rel="noopener noreferrer" class="r2-link">
        R2 Dashboard ↗
      </a>
    </div>
    <div class="pagination">
      <button onclick={prevPage} disabled={offset === 0}>前へ</button>
      <span>{offset + 1} - {Math.min(offset + limit, total)} / {total}</span>
      <button onclick={nextPage} disabled={offset + limit >= total}>次へ</button>
    </div>
  </div>

  <R2UsageStats />

  {#if api.loading && images.length === 0}
    <div class="loading">読み込み中...</div>
  {:else}
    <div class="grid-container">
      <div class="grid" class:is-loading={api.loading}>
        {#each images as image (image.id)}
          <div class="image-item">
            <div class="img-container">
              <img src={image.uri} alt="" loading="lazy" />
              {#if image.sig?.length > 0}
                <button class="indexed-icon" title="類似画像を検索" onclick={() => fetchSimilarImages(image)}>🔍</button>
              {/if}
            </div>
            <div class="info">
              <ColorBitmask sig={image.sig} />
              <div class="entry-link">
                <a href="/admin/edit?id={image.entry_id}">Entry: <strong>{image.entry_id}</strong></a>
              </div>
              <div class="id">ID: {image.id}</div>
            </div>
          </div>
        {/each}
      </div>
      {#if api.loading}
        <div class="overlay">
          <div class="loading-spinner"></div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<dialog bind:this={similarDialog} id="similarDialog">
  <div class="dialog-header">
    <h3>類似画像一覧</h3>
    <button type="button" class="close-btn" onclick={() => similarDialog.close()}>×</button>
  </div>
  <div class="dialog-content">
    {#if selectedImage}
      <div class="selected-compare">
        <div class="image-item target">
          <div class="img-container">
            <img src={selectedImage.uri} alt="" />
          </div>
          <div class="info">
            <ColorBitmask sig={selectedImage.sig} />
            <div>Selected Image</div>
          </div>
        </div>
        <div class="arrow">→</div>
      </div>
    {/if}

    {#if api.loading && similarImages.length === 0}
      <div class="loading">検索中...</div>
    {:else if similarImages.length === 0}
      <p>類似画像は見つかりませんでした。</p>
    {:else}
      <div class="grid similar-grid" class:is-loading={api.loading}>
        {#each similarImages as image (image.id)}
          <div class="image-item">
            <div class="img-container">
              <img src={image.uri} alt="" loading="lazy" />
            </div>
            <div class="info">
              <ColorBitmask sig={image.sig} />
              <div class="entry-link">
                <a href="/admin/edit?id={image.entry_id}" onclick={() => similarDialog.close()}>Entry: <strong>{image.entry_id}</strong></a>
              </div>
              <div class="id">ID: {image.id} / Score: {image.score}</div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</dialog>

<style>
  .image-list {
    padding: 20px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .title-area {
    display: flex;
    align-items: baseline;
    gap: 15px;
  }

  .title-area h2 {
    margin: 0;
  }

  .r2-link {
    font-size: 0.85rem;
    color: #f38020; /* Cloudflare orange */
    text-decoration: none;
    padding: 2px 8px;
    border: 1px solid #f38020;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .r2-link:hover {
    background: #f38020;
    color: #fff;
  }

  .pagination {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .grid-container {
    position: relative;
    min-height: 200px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
    transition: opacity 0.2s;
  }

  .grid.is-loading {
    opacity: 0.5;
    pointer-events: none;
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

  .image-item {
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .img-container {
    aspect-ratio: 1;
    background: #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    max-height: 150px;
  }

  .indexed-icon {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid #ccc;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    cursor: pointer;
    padding: 0;
  }

  .indexed-icon:hover {
    background: #fff;
    transform: scale(1.1);
  }

  .img-container img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .info {
    padding: 8px;
    font-size: 12px;
    line-height: 1.4;
  }

  .id {
    color: #999;
  }

  .entry-link {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .entry-link a {
    color: #333;
    text-decoration: none;
  }

  .entry-link a:hover {
    text-decoration: underline;
  }

  #similarDialog {
    width: 90%;
    max-width: 1000px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    padding: 0;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
  }

  .dialog-header h3 {
    margin: 0;
    font-size: 16px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
  }

  .dialog-content {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .similar-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }

  .loading {
    text-align: center;
    padding: 40px;
  }

  .selected-compare {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px dashed #eee;
  }

  .selected-compare .target {
    width: 150px;
    flex-shrink: 0;
    border: 2px solid #007bff;
  }

  .selected-compare .arrow {
    font-size: 32px;
    color: #ccc;
  }
</style>
