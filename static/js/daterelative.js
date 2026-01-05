export class DateRelative {
	constructor(value) {
		this.value = value + 0;
	}

	update() {
		let diff = Math.floor((new Date().getTime() - this.value) / 1000);
		if (typeof DateRelative.offset === 'number') {
			if (diff < 0) DateRelative.offset = -diff;
			diff = Math.max(diff - DateRelative.offset, 0);
		}
		const future = diff < 0;
		if (future) diff = -diff;

		if (diff < 60) {
			this.number = diff;
			this.unit = '\u79d2'; // 秒
			this.isFuture = future;
			return this;
		}
		diff = Math.floor(diff / 60);
		if (diff < 60) {
			this.number = diff;
			this.unit = '\u5206'; // 分
			this.isFuture = future;
			return this;
		}
		diff = Math.floor(diff / 60);
		if (diff < 24) {
			this.number = diff;
			this.unit = '\u6642\u9593'; // 時間
			this.isFuture = future;
			return this;
		}
		diff = Math.floor(diff / 24);
		if (diff < 31) {
			this.number = diff;
			this.unit = '\u65e5'; // 日
			this.isFuture = future;
			return this;
		}
		if (diff < 365) {
			this.number = Math.floor(diff / 30);
			this.unit = '\u30f6\u6708'; // ヶ月
			this.isFuture = future;
			return this;
		}
		diff = Math.floor(diff / 365);
		this.number = diff;
		this.unit = '\u5e74'; // 年
		this.isFuture = future;
		return this;
	}

	valueOf() {
		return this.value;
	}

	static update(target) {
		let dtrl = target._dtrl;
		if (!dtrl) {
			const datetime = target.getAttribute('datetime');
			if (!datetime) return;
			const dtf = datetime.match(/(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)(?:\.(\d+))?Z/);
			if (!dtf) return;

			target._dtrl = dtrl = new DateRelative(Date.UTC(+dtf[1], +dtf[2] - 1, +dtf[3], +dtf[4], +dtf[5], +dtf[6]));
		}
		dtrl.update();

		const format = dtrl.number +
			dtrl.unit +
			(dtrl.isFuture ? '\u5f8c' : '\u524d'); // 後 : 前
		target.textContent = format;
	}

	static updateAll(parent) {
		const root = parent || document;
		const targets = root.getElementsByTagName('time');
		for (const target of targets) {
			DateRelative.update(target);
		}
	}

	static setupAutoUpdate(parent) {
		return setInterval(() => {
			DateRelative.updateAll(parent);
		}, 60 * 1000);
	}
}