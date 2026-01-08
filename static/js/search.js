const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const heading = document.querySelector('.search-container h2');
const resultsContainer = document.getElementById('search-results');
const loadingSpinner = document.getElementById('loading-spinner');
const noResults = document.getElementById('no-results');
const ariaStatus = document.getElementById('aria-status');

const parser = new DOMParser();
let currentQuery = '';

function debounce(fn, delay) {
	let timer = null;
	return function (...args) {
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), delay);
	};
}

function escapeHTML(str) {
	const p = document.createElement('p');
	p.textContent = str;
	return p.innerHTML;
}

function highlight(text, query) {
	if (!query) return escapeHTML(text);
	const escapedText = escapeHTML(text);
	const tokens = query.split(/\s+/).filter(t => t.length >= 2);
	if (tokens.length === 0) return escapedText;

	const pattern = tokens.map(t => t.replace(/[.*+?^${}()|[\\]/g, '\\$&')).join('|');
	const regex = new RegExp(`(${pattern})`, 'gi');
	return escapedText.replace(regex, '<mark>$1</mark>');
}

function getSummary(html) {
	const doc = parser.parseFromString(html, 'text/html');
	doc.querySelectorAll('script, style, noscript, iframe').forEach(el => el.remove());
	const textContent = doc.body.textContent || "";
	return textContent.replace(/\s+/g, ' ').trim().substring(0, 200) + (textContent.length > 200 ? '...' : '');
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

		const fragment = document.createDocumentFragment();
		data.results.forEach(item => {
			const div = document.createElement('div');
			div.className = 'search-result-item';
			div.setAttribute('role', 'listitem');

			const tagsHTML = (item.tags || []).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('');
			const summary = getSummary(item.formatted_body);

			const highlightedTitle = highlight(item.title, query);
			const highlightedSummary = highlight(summary, query);

			div.innerHTML = `
				<h3>
					<a href="/${item.path}">${highlightedTitle}</a>
					${tagsHTML}
				</h3>
				<div class="summary">${highlightedSummary}</div>
				<div class="meta">
					<span class="date"><relative-time epoch="${item.created_at}">${item.date}</relative-time></span>
					<span class="score">Score: ${item.score.toFixed(4)}</span>
				</div>
			`;
			fragment.appendChild(div);
		});
		resultsContainer.appendChild(fragment);

		heading?.scrollIntoView({ block: 'start' });

	} catch (err) {
		loadingSpinner.style.display = 'none';
		resultsContainer.innerHTML = `<div class="error" style="color: red; padding: 20px;">エラー: ${err.message}</div>`;
		console.error('Search failed:', err);
	}
}

const debouncedSearch = debounce((q) => performSearch(q), 500);

// Initialize from URL
const urlParams = new URLSearchParams(window.location.search);
const initialQuery = urlParams.get('q');
if (initialQuery) {
	input.value = initialQuery;
	performSearch(initialQuery);
}

// Event Listeners
input.addEventListener('input', (e) => {
	debouncedSearch(e.target.value);
});

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
