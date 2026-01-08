document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('search-form');
	const input = document.getElementById('search-input');
	const resultsContainer = document.getElementById('search-results');
	const loadingSpinner = document.getElementById('loading-spinner');
	const noResults = document.getElementById('no-results');
	const ariaStatus = document.getElementById('aria-status');

	let currentQuery = '';

	function debounce(fn, delay) {
		let timer = null;
		return function(...args) {
			clearTimeout(timer);
			timer = setTimeout(() => fn.apply(this, args), delay);
		};
	}

	async function performSearch(query) {
		query = query.trim();
		if (query.length < 2) {
			resultsContainer.innerHTML = '';
			noResults.style.display = 'none';
			loadingSpinner.style.display = 'none';
			ariaStatus.textContent = '';
			currentQuery = query;
			return;
		}
		if (query === currentQuery) return;
		currentQuery = query;

		// UI Reset
		resultsContainer.innerHTML = '';
		noResults.style.display = 'none';
		loadingSpinner.style.display = 'block';
		ariaStatus.textContent = '検索中...';

		// Update URL without reloading
		const newURL = new URL(window.location.href);
		if (newURL.searchParams.get('q') !== query) {
			newURL.searchParams.set('q', query);
			window.history.replaceState({ q: query }, '', newURL);
		}

		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || '検索エラーが発生しました');
			}

			const data = await res.json();
			loadingSpinner.style.display = 'none';

			if (!data.results || data.results.length === 0) {
				const msg = `「${query}」に一致する記事は見つかりませんでした。`;
				noResults.textContent = msg;
				noResults.style.display = 'block';
				ariaStatus.textContent = msg;
				return;
			}

			ariaStatus.textContent = `${data.results.length}件の記事が見つかりました。`;

			data.results.forEach(item => {
				const div = document.createElement('div');
				div.className = 'search-result-item';
				div.setAttribute('role', 'listitem');
				
				// 抽出したタグをHTML化
				const tagsHTML = (item.tags || []).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('');
				
				// formatted_body から不要なタグ(script, style等)を除去してサマリを作成
				const parser = new DOMParser();
				const doc = parser.parseFromString(item.formatted_body, 'text/html');
				doc.querySelectorAll('script, style, noscript, iframe').forEach(el => el.remove());
				const textContent = doc.body.textContent || "";
				const summary = textContent.replace(/\s+/g, ' ').trim().substring(0, 200) + (textContent.length > 200 ? '...' : '');

				div.innerHTML = `
					<h3>
						<a href="/${item.path}">${escapeHTML(item.title)}</a>
						${tagsHTML}
					</h3>
					<div class="summary">${escapeHTML(summary)}</div>
					<div class="meta">
						<span class="date"><relative-time epoch="${item.created_at}">${item.date}</relative-time></span>
						<span class="score">Score: ${item.score.toFixed(4)}</span>
					</div>
				`;
				resultsContainer.appendChild(div);
			});

		} catch (err) {
			loadingSpinner.style.display = 'none';
			resultsContainer.innerHTML = `<div class="error" style="color: red; padding: 20px;">エラー: ${err.message}</div>`;
			console.error('Search failed:', err);
		}
	}

	function escapeHTML(str) {
		const p = document.createElement('p');
		p.textContent = str;
		return p.innerHTML;
	}

	const debouncedSearch = debounce((q) => performSearch(q), 500);

	// Handle initial search from URL
	const urlParams = new URLSearchParams(window.location.search);
	const initialQuery = urlParams.get('q');
	if (initialQuery) {
		input.value = initialQuery;
		performSearch(initialQuery);
	}

	// Automatic search on input
	input.addEventListener('input', (e) => {
		debouncedSearch(e.target.value);
	});

	// Handle form submission
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		performSearch(input.value);
	});

	window.addEventListener('popstate', (e) => {
		const query = e.state?.q || new URLSearchParams(window.location.search).get('q');
		if (query) {
			input.value = query;
			performSearch(query);
		} else {
			input.value = '';
			performSearch('');
		}
	});
});