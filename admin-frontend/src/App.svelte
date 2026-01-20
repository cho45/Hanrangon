<script lang="ts">
  import { onMount, type Component } from 'svelte';
  import EntryList from './components/EntryList.svelte';
  import AppEditor from './components/AppEditor.svelte';
  import JobList from './components/JobList.svelte';
  import ImageList from './components/ImageList.svelte';
  import InfoPage from './components/InfoPage.svelte';
  import CacheList from './components/CacheList.svelte';

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

  // ルートごとの定義
  const ROUTE_CONFIG: Record<string, { component: Component<any>, page: string, getProps: (id: string | null) => any }> = {
    '/admin/edit': { 
      component: AppEditor, 
      page: 'edit',
      getProps: (id) => ({ id, onSave: (loc: string) => window.location.href = loc })
    },
    '/admin/jobs': { 
      component: JobList, 
      page: 'jobs',
      getProps: () => ({})
    },
    '/admin/images': { 
      component: ImageList, 
      page: 'images',
      getProps: () => ({})
    },
    '/admin/info': {
      component: InfoPage,
      page: 'info',
      getProps: () => ({})
    },
    '/admin/cache': {
      component: CacheList,
      page: 'cache',
      getProps: () => ({})
    },
    '/admin/': {
      component: EntryList, 
      page: 'list',
      getProps: () => ({ onEdit: (id: string) => navigate(`/admin/edit?id=${id}`) })
    },
  };

  const navItems = [
    { label: 'エントリ一覧', path: '/admin/',      page: 'list' },
    { label: '新規作成',     path: '/admin/edit',  page: 'edit', exact: true },
    { label: '画像一覧',     path: '/admin/images',page: 'images' },
    { label: 'ジョブ一覧',   path: '/admin/jobs',  page: 'jobs' },
    { label: 'キャッシュ',   path: '/admin/cache', page: 'cache' },
    { label: '情報',         path: '/admin/info',  page: 'info' },
  ];

  // URLから全ての状態を導出
  const route = $derived.by(() => {
    const id = searchParams.get('id');
    const config = ROUTE_CONFIG[currentPath] ?? ROUTE_CONFIG['/admin/'];
    
    return {
      ...config,
      props: config.getProps(id),
      isActive: (item: typeof navItems[0]) => {
        if (item.page !== config.page) return false;
        if (item.exact && id) return false;
        return true;
      }
    };
  });

  const isLocalhost = $derived(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
</script>

<div class="admin-app">
  <header class:is-localhost={isLocalhost}>
    <div class="header-left">
      <h1><a href="/admin/"><img src="/images/hanrangen-icon.svg" alt="Hanrangon" class="logo"></a></h1>
      <div class="ci-badge">
        <a href="https://github.com/cho45/Hanrangon/actions/workflows/ci.yml" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/ci.yml?branch=main&label=ci&style=flat-square" alt="CI Status">
        </a>
        <a href="https://github.com/cho45/Hanrangon/actions/workflows/lint.yml" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/lint.yml?branch=main&label=lint&style=flat-square" alt="Lint Status">
        </a>
      </div>
    </div>
    <nav class="main-nav">
      <ul>
        <li><a href="/">サイト確認</a></li>
        <li><a href="/logout">ログアウト</a></li>
      </ul>
    </nav>
  </header>

  <nav class="sub-nav" class:is-localhost={isLocalhost}>
    {#each navItems as item}
      <a 
        href={item.path} 
        class:active={route.isActive(item)} 
        onclick={(e) => navigate(item.path, e)}
      >
        {item.label}
      </a>
    {/each}
  </nav>

  <main class="content">
    <route.component {...route.props} />
  </main>
</div>

<style>
  .admin-app {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  header {
    background: #333;
    color: white;
    padding: 0.5rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    font-size: 12px;
  }

  header.is-localhost {
    background: #2e7d32;
  }

  header h1 {
    margin: 0;
    font-size: 1.2rem;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .ci-badge {
    display: flex;
    align-items: center;
    height: 20px;
    gap: 10px;
  }

  .ci-badge img {
    height: 18px;
    display: block;
    transition: all 0.2s;
  }

  .ci-badge img:hover {
    transform: scale(1.05);
  }

  .ci-badge img {
    height: 20px;
    display: block;
  }

  header .logo {
    height: 24px;
    display: block;
    filter: brightness(0) invert(1);
  }

  header a {
    color: white;
    text-decoration: none;
  }

  header nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 1rem;
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
