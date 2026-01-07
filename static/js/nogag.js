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

const Nogag = {
	data(key) {
		return document.documentElement.getAttribute(`data-${key}`);
	},

	init() {
		this.initSimilarEntries();
		// this.initExif();
		this.initBudouX();
	},

	async initSimilarEntries() {
		const similarLink = document.getElementById('preload-similar-entries');
		if (!similarLink) return;

		const similar = similarLink.href;
		console.log('fetch', similar);
		
		try {
			const res = await fetch(similar);
			const data = await res.json();

			const ids = similar.match(/id=(\d+)/g);
			if (!ids) return;

			for (const idStr of ids) {
				const key = idStr.replace(/^id=/, '');
				let val = data.result[key] || '';
				if (data.ad) {
					val += data.ad;
					data.ad = ""; // display once
				}
				if (!val) continue;

				const article = document.querySelector(`article[data-id="${key}"]`);
				if (!article) continue;

				const container = article.querySelector('.similar-entries');
				if (!container) continue;

				container.innerHTML = val;

				const trackbacks = article.querySelector('.content.trackbacks');
				if (trackbacks) {
					const links = trackbacks.getElementsByTagName('li');
					for (const link of links) {
						const duplicate = container.querySelector(`li[data-id="${link.getAttribute('data-id')}"]`);
						if (duplicate) {
							duplicate.remove();
						}
					}
					if (!container.getElementsByTagName('li').length) {
						container.remove();
					}
				}
			}
		} catch (e) {
			console.error('Failed to load similar entries', e);
		}
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
			const wrapper = document.createElement('budoux-ja');
			wrapper.append(...target.childNodes);
			target.appendChild(wrapper);
		}
	}
};

// Expose to window as requested
window.Nogag = Nogag;

Nogag.init();
