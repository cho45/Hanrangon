import { DateRelative } from './daterelative.js';

const Nogag = {
	data(key) {
		return document.documentElement.getAttribute(`data-${key}`);
	},

	initImages() {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		const photos = document.querySelectorAll('a.picasa');
		const placeholders = {};

		for (const anchor of photos) {
			const img = anchor.querySelector('img');
			let src = img.getAttribute('src');
			anchor.setAttribute('data-href', anchor.href);

			// Loading placeholder
			let width = parseInt(img.getAttribute('width'), 10);
			let height = parseInt(img.getAttribute('height'), 10);
			const wRatio = width / window.innerWidth;
			const hRatio = height / window.innerHeight;
			const ratio = Math.max(wRatio, hRatio);

			if (ratio > 1) {
				width = Math.round(width / ratio);
				height = Math.round(height / ratio);
			}

			if (width && height) {
				const key = `${width}x${height}`;
				if (!placeholders[key]) {
					canvas.width = width;
					canvas.height = height;
					ctx.fillStyle = "#dddddd";
					ctx.fillRect(0, 0, width, height);
					placeholders[key] = canvas.toDataURL('image/png');
				}
				img.src = placeholders[key];
			}

			if (window.innerWidth > 1650) {
				// use fullsize
				src = src.replace(/\/s\d+\//, '/s0/');
			}

			const link = src.replace(/\/s(9[06]0|1280|2048)\//, '/s0/');
			anchor.href = link;

			if (src !== img.getAttribute('src')) {
				anchor.classList.add("loading");
				const loader = new Image();
				loader.onload = () => {
					img.src = src;
					anchor.classList.remove('loading');
				};
				loader.src = src;
			}
		}
	},

	init() {
		const articles = document.querySelectorAll('article');
		for (const article of articles) {
			Nogag.initEntry(article);
		}

		DateRelative.updateAll();

		this.initSimilarEntries();
		// this.initExif();
		this.initBudouX();
		this.initABC();

		if (Nogag.data('auth')) {
			const button = document.querySelector('.nogag-new');
			if (button) {
				button.addEventListener('click', () => {
					location.href = "/admin/edit";
				});
			}
		}
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

				DateRelative.updateAll(container);
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
			'.entries article header h1 a',
			'.entries article header h2 a',
			'.entries article .content h1',
			'.entries article .content h2',
			'.entries article .content h3',
			'.entries article .content h4',
			'.entries article .content h5',
			'.entries article .content h6'
		].join(',');
		
		const targets = document.querySelectorAll(selector);
		for (const target of targets) {
			target.innerHTML = `<budoux-ja>${target.innerHTML}</budoux-ja>`;
		}
	},

	initABC() {
		const targets = document.querySelectorAll('pre.lang-abc');
		for (const target of targets) {
			const notation = target.textContent;
			const container = document.createElement('div');
			container.className = "lang-abc";
			
			// ABCJS is expected to be loaded globally
			if (typeof ABCJS !== 'undefined') {
				ABCJS.renderAbc(container, notation, {
					staffwidth: container.offsetWidth,
					add_classes: true,
					responsive: "resize"
				});
				target.replaceWith(container);
			}
		}
	},

	initEntry(entry) {
		if (Nogag.data('auth')) {
			const button = entry.querySelector('.nogag-edit');
			if (button) {
				button.addEventListener('click', () => {
					location.href = `/admin/edit?id=${entry.getAttribute('data-id')}`;
				});
			}
		}
	},

	loadScript(url) {
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.onload = resolve;
			script.onerror = reject;
			script.src = url;
			document.body.appendChild(script);
		});
	}
};

// Expose to window as requested
window.Nogag = Nogag;

Nogag.initImages();

document.addEventListener('DOMContentLoaded', async () => {
	Nogag.init();

	try {
		const res = await fetch('/.ip');
		if (!res.ok) throw new Error(res.statusText);
		const via = await res.text();
		if (via.indexOf('IPv') === 0) {
			const nav = document.getElementById('global-navigation');
			if (nav) {
				nav.setAttribute('data-ip-info', `via ${via}`);
			}
		}
	} catch (e) {
		// Ignore error
	}
}, false);
