<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../lib/api.svelte';

  interface Image {
    id: number;
    uri: string;
    entry_id: number;
    sig: string;
  }

  interface SimilarImage extends Image {
    score: number;
  }

  let images = $state<Image[]>([]);
  let total = $state(0);
  let limit = $state(50);
  let offset = $state(0);

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
    <h2>画像一覧 ({total})</h2>
    <div class="pagination">
      <button onclick={prevPage} disabled={offset === 0}>前へ</button>
      <span>{offset + 1} - {Math.min(offset + limit, total)} / {total}</span>
      <button onclick={nextPage} disabled={offset + limit >= total}>次へ</button>
    </div>
  </div>

  {#if api.loading && images.length === 0}
    <div class="loading">読み込み中...</div>
  {:else}
    <div class="grid">
      {#each images as image}
        <div class="image-item">
          <div class="img-container">
            <img src={image.uri} alt="" loading="lazy" />
            {#if image.sig?.length > 0}
              <button class="indexed-icon" title="類似画像を検索" onclick={() => fetchSimilarImages(image)}>🔍</button>
            {/if}
          </div>
          <div class="info">
            <div class="entry-link">
              <a href="/admin/edit?id={image.entry_id}">Entry: <strong>{image.entry_id}</strong></a>
            </div>
            <div class="id">ID: {image.id}</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<dialog bind:this={similarDialog} id="similarDialog">
  <div class="dialog-header">
    <h3>類似画像一覧</h3>
    <button type="button" class="close-btn" onclick={() => similarDialog.close()}>×</button>
  </div>
  <div class="dialog-content">
    {#if api.loading && similarImages.length === 0}
      <div class="loading">検索中...</div>
    {:else if similarImages.length === 0}
      <p>類似画像は見つかりませんでした。</p>
    {:else}
      <div class="grid similar-grid">
        {#each similarImages as image}
          <div class="image-item">
            <div class="img-container">
              <img src={image.uri} alt="" loading="lazy" />
            </div>
            <div class="info">
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

  .pagination {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
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
    object-fit: cover;
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
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .loading {
    text-align: center;
    padding: 40px;
  }
</style>
