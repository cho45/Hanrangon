<script lang="ts">
  import { onMount } from 'svelte';
  import EntryList from './components/EntryList.svelte';
  import AppEditor from './components/AppEditor.svelte';
  import JobList from './components/JobList.svelte';
  import InfoPage from './components/InfoPage.svelte';

  let currentPath = $state(window.location.pathname);
  let searchParams = $state(new URLSearchParams(window.location.search));

  onMount(() => {
    const handlePopState = () => {
      currentPath = window.location.pathname;
      searchParams = new URLSearchParams(window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  });

  function navigate(path: string, e?: MouseEvent) {
    if (e) e.preventDefault();
    window.history.pushState({}, '', path);
    currentPath = window.location.pathname;
    searchParams = new URLSearchParams(window.location.search);
  }

  // ルーティングロジック
  const page = $derived.by(() => {
    if (currentPath === '/admin/edit') return 'edit';
    if (currentPath === '/admin/jobs') return 'jobs';
    if (currentPath === '/admin/info') return 'info';
    return 'list';
  });

  const entryId = $derived(searchParams.get('id'));
  const isLocalhost = $derived(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
</script>

<div class="admin-app">
  <nav class="sub-nav" class:is-localhost={isLocalhost}>
    <a href="/admin/" class:active={page === 'list'} onclick={(e) => navigate('/admin/', e)}>エントリ一覧</a>
    <a href="/admin/edit" class:active={page === 'edit' && !entryId} onclick={(e) => navigate('/admin/edit', e)}>新規作成</a>
    <a href="/admin/jobs" class:active={page === 'jobs'} onclick={(e) => navigate('/admin/jobs', e)}>ジョブ一覧</a>
    <a href="/admin/info" class:active={page === 'info'} onclick={(e) => navigate('/admin/info', e)}>情報</a>
  </nav>

  <main class="content">
    {#if page === 'edit'}
      <AppEditor id={entryId} onSave={(loc) => window.location.href = loc} />
    {:else if page === 'jobs'}
      <JobList />
    {:else if page === 'info'}
      <InfoPage />
    {:else}
      <EntryList onEdit={(id) => navigate(`/admin/edit?id=${id}`)} />
    {/if}
  </main>
</div>

<style>
  .admin-app {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .sub-nav {
    background: #fff;
    border-bottom: 1px solid #dfe5e7;
    padding: 0 1rem;
    display: flex;
    gap: 1rem;
  }

  .sub-nav.is-localhost {
    background: #e8f5e9;
  }

  .sub-nav a {
    padding: 0.75rem 0;
    text-decoration: none;
    color: #666;
    border-bottom: 2px solid transparent;
    font-size: 0.9rem;
  }

  .sub-nav a.active {
    color: #00acc1;
    border-bottom-color: #00acc1;
    font-weight: bold;
  }

  .sub-nav.is-localhost a.active {
    color: #2e7d32;
    border-bottom-color: #2e7d32;
  }

  .content {
    flex: 1;
    overflow: auto;
    background: #f7f8f9;
  }
</style>
