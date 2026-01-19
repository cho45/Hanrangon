customElements.define('relative-time', class extends HTMLElement {
	static get observedAttributes() {
		return ['datetime', 'epoch'];
	}

	constructor() {
		super();
		this._timer = null;
	}

	connectedCallback() {
		this.update();
		this._timer = setInterval(() => this.update(), 60 * 1000);
	}

	disconnectedCallback() {
		if (this._timer) {
			clearInterval(this._timer);
			this._timer = null;
		}
	}

	attributeChangedCallback() {
		this.update();
	}

	get epoch() {
		if (this.hasAttribute('epoch')) {
			return parseInt(this.getAttribute('epoch'), 10) * 1000;
		}
		const datetime = this.getAttribute('datetime');
		if (datetime) {
			return Date.parse(datetime);
		}
		return null;
	}

	update() {
		const epoch = this.epoch;
		if (!epoch) return;

		let diff = Math.floor((Date.now() - epoch) / 1000);
		const future = diff < 0;
		if (future) diff = -diff;

		let number, unit;

		if (diff < 60) {
			number = diff;
			unit = '秒';
		} else if (diff < 3600) {
			number = Math.floor(diff / 60);
			unit = '分';
		} else if (diff < 86400) {
			number = Math.floor(diff / 3600);
			unit = '時間';
		} else if (diff < 2592000) {
			number = Math.floor(diff / 86400);
			unit = '日';
		} else if (diff < 31536000) {
			number = Math.floor(diff / 2592000);
			unit = 'ヶ月';
		} else {
			number = Math.floor(diff / 31536000);
			unit = '年';
		}

		this.textContent = `${number}${unit}${future ? '後' : '前'}`;
	}
});

customElements.define('ip-info', class extends HTMLElement {
	async connectedCallback() {
		try {
			const res = await fetch('/.ip');
			if (!res.ok) throw new Error(res.statusText);
			const via = await res.text();
			if (via.indexOf('IPv') === 0) {
				this.textContent = `via ${via}`;
			}
		} catch (e) {
			// Ignore error
		}
	}
});

customElements.define('social-share-buttons', class extends HTMLElement {
	connectedCallback() {
		const title = this.getAttribute('title');
		const url = this.getAttribute('url');

		const buttons = [
			{
				name: 'Facebook',
				bg: '#3b5998',
				href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
				icon: '/images/sharebuttons/FB-f-Logo__white_50.png',
				iconSize: 18
			},
			{
				name: 'Bluesky',
				bg: '#efefef',
				href: `https://bsky.app/intent/compose?text=${encodeURIComponent(title + ' ' + url)}`,
				icon: '/images/bluesky_media_kit_logo_svgs.svg',
				iconSize: 40
			},
			{
				name: 'はてなブックマーク',
				bg: '#00a4de',
				href: `https://b.hatena.ne.jp/add?url=${encodeURIComponent(url)}`,
				icon: '/images/sharebuttons/hatenabookmark-logomark.svg',
				iconSize: 40
			}
		];

		for (const btn of buttons) {
			const a = document.createElement('a');
			a.className = 'share-button';
			a.style.background = btn.bg;
			a.href = btn.href;
			a.target = '_blank';
			a.rel = 'noopener nofollow';

			const img = document.createElement('img');
			img.src = btn.icon;
			img.width = btn.iconSize;
			img.height = btn.iconSize;
			img.alt = btn.name;

			a.appendChild(img);
			this.appendChild(a);
		}

		// Web Share API 対応時のみ共有ボタンを追加
		if (navigator.share) {
			const button = document.createElement('button');
			button.className = 'share-button';
			button.textContent = '共有';
			button.addEventListener('click', async () => {
				try {
					await navigator.share({ title, url });
				} catch (err) {
					if (err.name !== 'AbortError') {
						console.error('共有エラー:', err);
					}
				}
			});
			this.appendChild(button);
		}
	}
});

const Nogag = {
	data(key) {
		return document.documentElement.getAttribute(`data-${key}`);
	},

	init() {
		// this.initExif();
		this.initBudouX();
		this.initAutoPager();
	},

	async initAutoPager() {
		const isTopPage = location.pathname === "/" || location.pathname.startsWith("/.page/");
		if (!isTopPage) return;
		const { AutoPager } = await import('./autopager.js');
		this.autopager = new AutoPager({
			onUpdate: () => {
				this.initBudouX();
			}
		});
	},

	async initExif() {
		const exifLink = document.getElementById('preload-exif-entries');
		if (!exifLink) return;

		const exif = exifLink.href;
		try {
			const res = await fetch(exif);
			const data = await res.json();

			for (const key in data.result) {
				if (!Object.prototype.hasOwnProperty.call(data.result, key)) continue;
				
				const val = data.result[key];
				if (!val || !val.model) continue;
				
				const target = document.querySelector(`[data-href="${key}"]`);
				if (!target) continue;

				const info =
					`${val.model} (${val.make}) ` +
					`${val.focallength}mm ` +
					`F${val.fnumber} ` +
					`ISO${val.iso} ` +
					`${(val.speed < 1 ? '1/' + Math.round(1 / val.speed) : val.speed)}sec `;
				target.title = info;
			}
		} catch (e) {
			console.error('Failed to load exif', e);
		}
	},

	initBudouX() {
		const selector = [
			'.entries article .content h1',
			'.entries article .content h2',
			'.entries article .content h3',
			'.entries article .content h4',
			'.entries article .content h5',
			'.entries article .content h6'
		].join(',');
		
		const targets = document.querySelectorAll(selector);
		for (const target of targets) {
			if (target.hasAttribute('data-budoux-processed') || target.querySelector('budoux-ja')) continue;
			const wrapper = document.createElement('budoux-ja');
			wrapper.append(...target.childNodes);
			target.appendChild(wrapper);
			target.setAttribute('data-budoux-processed', 'true');
		}
	}
};

// Expose to window as requested
window.Nogag = Nogag;

Nogag.init();
