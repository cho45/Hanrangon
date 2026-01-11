<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../lib/api.svelte';

  interface Image {
    id: number;
    uri: string;
    entry_id: number;
  }

  let images = $state<Image[]>([]);
  let total = $state(0);
  let limit = $state(50);
  let offset = $state(0);

  async function fetchImages() {
    try {
      const res = await api.get(`/admin/api/images?limit=${limit}&offset=${offset}`);
      images = res.images;
      total = res.total;
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
          </div>
          <div class="info">
            <div class="id">ID: {image.id}</div>
            <div class="entry-link">
              <a href="/admin/edit?id={image.entry_id}">Entry: {image.entry_id}</a>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

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
  }

  .img-container img {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
  }

  .info {
    padding: 8px;
    font-size: 12px;
  }

  .entry-link {
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .loading {
    text-align: center;
    padding: 40px;
  }
</style>
