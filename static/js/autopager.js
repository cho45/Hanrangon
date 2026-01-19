export class AutoPager {
	constructor(options = {}) {
		this.containerSelector = options.containerSelector || '#content';
		this.itemSelector = options.itemSelector || 'article, .date';
		this.nextSelector = options.nextSelector || 'a[rel="next"]';
		this.pagerSelector = options.pagerSelector || '.pager';
		this.onUpdate = options.onUpdate || (() => {});

		this.loading = false;
		this.lastUrl = null;
		this.lastLoadTime = 0;
		this.minInterval = 500;

		this.observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting && !this.loading) {
					this.loadNext();
				}
			}
		}, {
			rootMargin: '400px',
		});

		this.init();
	}

	init() {
		const next = document.querySelector(this.nextSelector);
		if (next) {
			this.observer.observe(next);
		}
	}

	async loadNext() {
		const next = document.querySelector(this.nextSelector);
		if (!next || this.loading) return;

		const now = Date.now();
		if (now - this.lastLoadTime < this.minInterval) return;

		const url = next.href;
		if (url === this.lastUrl || url === location.href) return;

		this.loading = true;
		this.lastUrl = url;
		this.observer.unobserve(next);

		const pager = document.querySelector(this.pagerSelector);
		if (pager) {
			pager.classList.add('loading');
		}

		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(res.statusText);
			const html = await res.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');

			const container = document.querySelector(this.containerSelector);
			const pager = document.querySelector(this.pagerSelector);
			const newItems = doc.querySelectorAll(`${this.containerSelector} > ${this.itemSelector}`);
			
			if (container && newItems.length > 0) {
				for (const item of newItems) {
					const newNode = document.importNode(item, true);
					if (pager) {
						pager.before(newNode);
					} else {
						container.appendChild(newNode);
					}
				}
			}

			// Update URL after content is added
			history.pushState(null, '', url);

			const newPager = doc.querySelector(this.pagerSelector);
			if (newPager && pager) {
				pager.innerHTML = newPager.innerHTML;
				
				// Observe new link
				const nextLink = pager.querySelector(this.nextSelector);
				if (nextLink) {
					this.observer.observe(nextLink);
				}
			} else if (pager) {
				pager.remove();
			}

			// Callback for re-initialization (e.g. BudouX)
			this.onUpdate();

		} catch (e) {
			console.error('AutoPager error:', e);
		} finally {
			this.loading = false;
			this.lastLoadTime = Date.now();
		}
	}
}