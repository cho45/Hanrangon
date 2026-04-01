//#region \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), s = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, c = (n, r, a) => (a = n == null ? {} : e(i(n)), s(r || !n || !n.__esModule ? t(a, "default", {
	value: n,
	enumerable: !0
}) : a, n)), l = Array.isArray, u = Array.prototype.indexOf, d = Array.prototype.includes, f = Array.from, p = Object.defineProperty, m = Object.getOwnPropertyDescriptor, h = Object.getOwnPropertyDescriptors, g = Object.prototype, _ = Array.prototype, v = Object.getPrototypeOf, y = Object.isExtensible;
function b(e) {
	return typeof e == "function";
}
var x = () => {};
function S(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function C() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
function w(e, t, n = !1) {
	return e === void 0 ? n ? t() : t : e;
}
var T = 1024, E = 2048, D = 4096, O = 8192, ee = 16384, te = 32768, ne = 1 << 25, re = 65536, ie = 1 << 19, ae = 1 << 20, oe = 1 << 25, se = 65536, ce = 1 << 21, le = 1 << 22, ue = 1 << 23, de = Symbol("$state"), fe = Symbol("legacy props"), pe = Symbol(""), me = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), he = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function ge(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function _e() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function ve(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function ye(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function be() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function xe(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function Se() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ce(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function we() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Te() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ee() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function De() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/constants.js
var Oe = {}, k = Symbol(), ke = "http://www.w3.org/1999/xhtml", Ae = "http://www.w3.org/2000/svg", je = "http://www.w3.org/1998/Math/MathML";
function Me(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Ne() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Pe() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var A = !1;
function Fe(e) {
	A = e;
}
var j;
function M(e) {
	if (e === null) throw Me(), Oe;
	return j = e;
}
function Ie() {
	return M(/* @__PURE__ */ dn(j));
}
function N(e) {
	if (A) {
		if (/* @__PURE__ */ dn(j) !== null) throw Me(), Oe;
		j = e;
	}
}
function Le(e = 1) {
	if (A) {
		for (var t = e, n = j; t--;) n = /* @__PURE__ */ dn(n);
		j = n;
	}
}
function Re(e = !0) {
	for (var t = 0, n = j;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ dn(n);
		e && n.remove(), n = i;
	}
}
function ze(e) {
	if (!e || e.nodeType !== 8) throw Me(), Oe;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Be(e) {
	return e === this.v;
}
function Ve(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function He(e) {
	return !Ve(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/flags/index.js
var Ue = !1, We = !1, P = null;
function Ge(e) {
	P = e;
}
function Ke(e, t = !1, n) {
	P = {
		p: P,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: W,
		l: We && !t ? {
			s: null,
			u: null,
			$: []
		} : null
	};
}
function qe(e) {
	var t = P, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) On(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, P = t.p, e ?? {};
}
function Je() {
	return !We || P !== null && P.l === null;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var Ye = [];
function Xe() {
	var e = Ye;
	Ye = [], S(e);
}
function Ze(e) {
	if (Ye.length === 0 && !ft) {
		var t = Ye;
		queueMicrotask(() => {
			t === Ye && Xe();
		});
	}
	Ye.push(e);
}
function Qe() {
	for (; Ye.length > 0;) Xe();
}
function $e(e) {
	var t = W;
	if (t === null) return U.f |= ue, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	et(e, t);
}
function et(e, t) {
	for (; t !== null;) {
		if (t.f & 128) {
			if (!(t.f & 32768)) throw e;
			try {
				t.b.error(e);
				return;
			} catch (t) {
				e = t;
			}
		}
		t = t.parent;
	}
	throw e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
var tt = ~(E | D | T);
function F(e, t) {
	e.f = e.f & tt | t;
}
function nt(e) {
	e.f & 512 || e.deps === null ? F(e, T) : F(e, D);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function rt(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= se, rt(t.deps));
}
function it(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), rt(e.deps), F(e, T);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var at = !1, ot = !1;
function st(e) {
	var t = ot;
	try {
		return ot = !1, [e(), ot];
	} finally {
		ot = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var ct = /* @__PURE__ */ new Set(), I = null, lt = null, ut = null, dt = null, ft = !1, pt = !1, mt = null, ht = null, gt = 0, _t = 1, vt = class e {
	id = _t++;
	current = /* @__PURE__ */ new Map();
	previous = /* @__PURE__ */ new Map();
	#e = /* @__PURE__ */ new Set();
	#t = /* @__PURE__ */ new Set();
	#n = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Map();
	#i = null;
	#a = [];
	#o = [];
	#s = /* @__PURE__ */ new Set();
	#c = /* @__PURE__ */ new Set();
	#l = /* @__PURE__ */ new Map();
	is_fork = !1;
	#u = !1;
	#d = /* @__PURE__ */ new Set();
	#f() {
		return this.is_fork || this.#r.size > 0;
	}
	#p() {
		for (let n of this.#d) for (let r of n.#r.keys()) {
			for (var e = !1, t = r; t.parent !== null;) {
				if (this.#l.has(t)) {
					e = !0;
					break;
				}
				t = t.parent;
			}
			if (!e) return !0;
		}
		return !1;
	}
	skip_effect(e) {
		this.#l.has(e) || this.#l.set(e, {
			d: [],
			m: []
		});
	}
	unskip_effect(e) {
		var t = this.#l.get(e);
		if (t) {
			this.#l.delete(e);
			for (var n of t.d) F(n, E), this.schedule(n);
			for (n of t.m) F(n, D), this.schedule(n);
		}
	}
	#m() {
		if (gt++ > 1e3 && (ct.delete(this), bt()), !this.#f()) {
			for (let e of this.#s) this.#c.delete(e), F(e, E), this.schedule(e);
			for (let e of this.#c) F(e, D), this.schedule(e);
		}
		let t = this.#a;
		this.#a = [], this.apply();
		var n = mt = [], r = [], i = ht = [];
		for (let e of t) try {
			this.#h(e, n, r);
		} catch (t) {
			throw Dt(e), t;
		}
		if (I = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (mt = null, ht = null, this.#f() || this.#p()) {
			this.#g(r), this.#g(n);
			for (let [e, t] of this.#l) Et(e, t);
		} else {
			this.#n.size === 0 && ct.delete(this), this.#s.clear(), this.#c.clear();
			for (let e of this.#e) e(this);
			this.#e.clear(), lt = this, St(r), St(n), lt = null, this.#i?.resolve();
		}
		var o = I;
		if (this.#a.length > 0) {
			let e = o ??= this;
			e.#a.push(...this.#a.filter((t) => !e.#a.includes(t)));
		}
		o !== null && (ct.add(o), o.#m()), ct.has(this) || this.#_();
	}
	#h(e, t, n) {
		e.f ^= T;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = (i & 96) != 0;
			if (!(a && i & 1024 || i & 8192 || this.#l.has(r)) && r.fn !== null) {
				a ? r.f ^= T : i & 4 ? t.push(r) : Ue && i & 16777224 ? n.push(r) : ur(r) && (i & 16 && this.#c.add(r), hr(r));
				var o = r.first;
				if (o !== null) {
					r = o;
					continue;
				}
			}
			for (; r !== null;) {
				var s = r.next;
				if (s !== null) {
					r = s;
					break;
				}
				r = r.parent;
			}
		}
	}
	#g(e) {
		for (var t = 0; t < e.length; t += 1) it(e[t], this.#s, this.#c);
	}
	capture(e, t, n = !1) {
		t !== k && !this.previous.has(e) && this.previous.set(e, t), e.f & 8388608 || (this.current.set(e, [e.v, n]), ut?.set(e, e.v));
	}
	activate() {
		I = this;
	}
	deactivate() {
		I = null, ut = null;
	}
	flush() {
		try {
			pt = !0, I = this, this.#m();
		} finally {
			gt = 0, dt = null, mt = null, ht = null, pt = !1, I = null, ut = null, qt.clear();
		}
	}
	discard() {
		for (let e of this.#t) e(this);
		this.#t.clear(), ct.delete(this);
	}
	register_created_effect(e) {
		this.#o.push(e);
	}
	#_() {
		for (let l of ct) {
			var e = l.id < this.id, t = [];
			for (let [r, [i, a]] of this.current) {
				if (l.current.has(r)) {
					var n = l.current.get(r)[0];
					if (e && i !== n) l.current.set(r, [i, a]);
					else continue;
				}
				t.push(r);
			}
			var r = [...l.current.keys()].filter((e) => !this.current.has(e));
			if (r.length === 0) e && l.discard();
			else if (t.length > 0) {
				l.activate();
				var i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
				for (var o of t) Ct(o, r, i, a);
				a = /* @__PURE__ */ new Map();
				var s = [...l.current.keys()].filter((e) => this.current.has(e) ? this.current.get(e)[0] !== e : !0);
				for (let e of this.#o) !(e.f & 155648) && wt(e, s, a) && (e.f & 4194320 ? (F(e, E), l.schedule(e)) : l.#s.add(e));
				if (l.#a.length > 0) {
					l.apply();
					for (var c of l.#a) l.#h(c, [], []);
					l.#a = [];
				}
				l.deactivate();
			}
		}
		for (let e of ct) e.#d.has(this) && (e.#d.delete(this), e.#d.size === 0 && !e.#f() && (e.activate(), e.#m()));
	}
	increment(e, t) {
		let n = this.#n.get(t) ?? 0;
		if (this.#n.set(t, n + 1), e) {
			let e = this.#r.get(t) ?? 0;
			this.#r.set(t, e + 1);
		}
	}
	decrement(e, t, n) {
		let r = this.#n.get(t) ?? 0;
		if (r === 1 ? this.#n.delete(t) : this.#n.set(t, r - 1), e) {
			let e = this.#r.get(t) ?? 0;
			e === 1 ? this.#r.delete(t) : this.#r.set(t, e - 1);
		}
		this.#u || n || (this.#u = !0, Ze(() => {
			this.#u = !1, this.flush();
		}));
	}
	transfer_effects(e, t) {
		for (let t of e) this.#s.add(t);
		for (let e of t) this.#c.add(e);
		e.clear(), t.clear();
	}
	oncommit(e) {
		this.#e.add(e);
	}
	ondiscard(e) {
		this.#t.add(e);
	}
	settled() {
		return (this.#i ??= C()).promise;
	}
	static ensure() {
		if (I === null) {
			let t = I = new e();
			pt || (ct.add(I), ft || Ze(() => {
				I === t && t.flush();
			}));
		}
		return I;
	}
	apply() {
		if (!Ue || !this.is_fork && ct.size === 1) {
			ut = null;
			return;
		}
		ut = /* @__PURE__ */ new Map();
		for (let [e, [t]] of this.current) ut.set(e, t);
		for (let n of ct) if (!(n === this || n.is_fork)) {
			var e = !1, t = !1;
			if (n.id < this.id) for (let [r, [, i]] of n.current) i || (e ||= this.current.has(r), t ||= !this.current.has(r));
			if (e && t) this.#d.add(n);
			else for (let [e, t] of n.previous) ut.has(e) || ut.set(e, t);
		}
	}
	schedule(e) {
		if (dt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (mt !== null && t === W && (Ue || (U === null || !(U.f & 2)) && !at)) return;
			if (n & 96) {
				if (!(n & 1024)) return;
				t.f ^= T;
			}
		}
		this.#a.push(t);
	}
};
function yt(e) {
	var t = ft;
	ft = !0;
	try {
		var n;
		for (e && (I !== null && !I.is_fork && I.flush(), n = e());;) {
			if (Qe(), I === null) return n;
			I.flush();
		}
	} finally {
		ft = t;
	}
}
function bt() {
	try {
		Se();
	} catch (e) {
		et(e, dt);
	}
}
var xt = null;
function St(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && ur(r) && (xt = /* @__PURE__ */ new Set(), hr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Bn(r), xt?.size > 0)) {
				qt.clear();
				for (let e of xt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) xt.has(n) && (xt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || hr(n);
					}
				}
				xt.clear();
			}
		}
		xt = null;
	}
}
function Ct(e, t, n, r) {
	if (!n.has(e) && (n.add(e), e.reactions !== null)) for (let i of e.reactions) {
		let e = i.f;
		e & 2 ? Ct(i, t, n, r) : e & 4194320 && !(e & 2048) && wt(i, t, r) && (F(i, E), Tt(i));
	}
}
function wt(e, t, n) {
	let r = n.get(e);
	if (r !== void 0) return r;
	if (e.deps !== null) for (let r of e.deps) {
		if (d.call(t, r)) return !0;
		if (r.f & 2 && wt(r, t, n)) return n.set(r, !0), !0;
	}
	return n.set(e, !1), !1;
}
function Tt(e) {
	I.schedule(e);
}
function Et(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), F(e, T);
		for (var n = e.first; n !== null;) Et(n, t), n = n.next;
	}
}
function Dt(e) {
	F(e, T);
	for (var t = e.first; t !== null;) Dt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function Ot(e) {
	let t = 0, n = Yt(0), r;
	return () => {
		Tn() && (G(n), Mn(() => (t === 0 && (r = yr(() => e(() => $t(n)))), t += 1, () => {
			Ze(() => {
				--t, t === 0 && (r?.(), r = void 0, $t(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var kt = re | ie;
function At(e, t, n, r) {
	new jt(e, t, n, r);
}
var jt = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = A ? j : null;
	#n;
	#r;
	#i;
	#a = null;
	#o = null;
	#s = null;
	#c = null;
	#l = 0;
	#u = 0;
	#d = !1;
	#f = /* @__PURE__ */ new Set();
	#p = /* @__PURE__ */ new Set();
	#m = null;
	#h = Ot(() => (this.#m = Yt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = W;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = W.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Nn(() => {
			if (A) {
				let e = this.#t;
				Ie();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#v() : this.#g();
			} else this.#y();
		}, kt), A && (this.#e = j);
	}
	#g() {
		try {
			this.#a = Pn(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed;
		t && (this.#s = Pn(() => {
			t(this.#e, () => e, () => () => {});
		}));
	}
	#v() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = Pn(() => e(this.#e)), Ze(() => {
			var e = this.#c = document.createDocumentFragment(), t = ln();
			e.append(t), this.#a = this.#x(() => Pn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Vn(this.#o, () => {
				this.#o = null;
			}), this.#b(I));
		}));
	}
	#y() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = Pn(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Gn(this.#a, e);
				let t = this.#n.pending;
				this.#o = Pn(() => t(this.#e));
			} else this.#b(I);
		} catch (e) {
			this.error(e);
		}
	}
	#b(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		it(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#x(e) {
		var t = W, n = U, r = P;
		Qn(this.#i), Zn(this.#i), Ge(this.#i.ctx);
		try {
			return vt.ensure(), e();
		} catch (e) {
			return $e(e), null;
		} finally {
			Qn(t), Zn(n), Ge(r);
		}
	}
	#S(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#S(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#b(t), this.#o && Vn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#S(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ze(() => {
			this.#d = !1, this.#m && Zt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), G(this.#m);
	}
	error(e) {
		var t = this.#n.onerror;
		let n = this.#n.failed;
		if (!t && !n) throw e;
		this.#a &&= (Rn(this.#a), null), this.#o &&= (Rn(this.#o), null), this.#s &&= (Rn(this.#s), null), A && (M(this.#t), Le(), M(Re()));
		var r = !1, i = !1;
		let a = () => {
			if (r) {
				Pe();
				return;
			}
			r = !0, i && De(), this.#s !== null && Vn(this.#s, () => {
				this.#s = null;
			}), this.#x(() => {
				this.#y();
			});
		}, o = (e) => {
			try {
				i = !0, t?.(e, a), i = !1;
			} catch (e) {
				et(e, this.#i && this.#i.parent);
			}
			n && (this.#s = this.#x(() => {
				try {
					return Pn(() => {
						var t = W;
						t.b = this, t.f |= 128, n(this.#e, () => e, () => a);
					});
				} catch (e) {
					return et(e, this.#i.parent), null;
				}
			}));
		};
		Ze(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				et(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(o, (e) => et(e, this.#i && this.#i.parent)) : o(t);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function Mt(e, t, n, r) {
	let i = Je() ? It : zt;
	var a = e.filter((e) => !e.settled);
	if (n.length === 0 && a.length === 0) {
		r(t.map(i));
		return;
	}
	var o = W, s = Nt(), c = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function l(e) {
		s();
		try {
			r(e);
		} catch (e) {
			o.f & 16384 || et(e, o);
		}
		Pt();
	}
	if (n.length === 0) {
		c.then(() => l(t.map(i)));
		return;
	}
	var u = Ft();
	function d() {
		Promise.all(n.map((e) => /* @__PURE__ */ Lt(e))).then((e) => l([...t.map(i), ...e])).catch((e) => et(e, o)).finally(() => u());
	}
	c ? c.then(() => {
		s(), d(), Pt();
	}) : d();
}
function Nt() {
	var e = W, t = U, n = P, r = I;
	return function(i = !0) {
		Qn(e), Zn(t), Ge(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function Pt(e = !0) {
	Qn(null), Zn(null), Ge(null), e && I?.deactivate();
}
function Ft() {
	var e = W, t = e.b, n = I, r = t.is_rendered();
	return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
		t.update_pending_count(-1, n), n.decrement(r, e, i);
	};
}
/* @__NO_SIDE_EFFECTS__ */
function It(e) {
	var t = 2 | E, n = U !== null && U.f & 2 ? U : null;
	return W !== null && (W.f |= ie), {
		ctx: P,
		deps: null,
		effects: null,
		equals: Be,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: k,
		wv: 0,
		parent: n ?? W,
		ac: null
	};
}
/* @__NO_SIDE_EFFECTS__ */
function Lt(e, t, n) {
	let r = W;
	r === null && _e();
	var i = void 0, a = Yt(k), o = !U, s = /* @__PURE__ */ new Map();
	return jn(() => {
		var t = W, n = C();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, n.reject).finally(Pt);
		} catch (e) {
			n.reject(e), Pt();
		}
		var c = I;
		if (o) {
			if (t.f & 32768) var l = Ft();
			if (r.b.is_rendered()) s.get(c)?.reject(me), s.delete(c);
			else {
				for (let e of s.values()) e.reject(me);
				s.clear();
			}
			s.set(c, n);
		}
		let u = (e, n = void 0) => {
			if (l && l(n === me), !(n === me || t.f & 16384)) {
				if (c.activate(), n) a.f |= ue, Zt(a, n);
				else {
					a.f & 8388608 && (a.f ^= ue), Zt(a, e);
					for (let [e, t] of s) {
						if (s.delete(e), e === c) break;
						t.reject(me);
					}
				}
				c.deactivate();
			}
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), En(() => {
		for (let e of s.values()) e.reject(me);
	}), new Promise((e) => {
		function t(n) {
			function r() {
				n === i ? e(a) : t(i);
			}
			n.then(r, r);
		}
		t(i);
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Rt(e) {
	let t = /* @__PURE__ */ It(e);
	return Ue || er(t), t;
}
/* @__NO_SIDE_EFFECTS__ */
function zt(e) {
	let t = /* @__PURE__ */ It(e);
	return t.equals = He, t;
}
function Bt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) Rn(t[n]);
	}
}
function Vt(e) {
	for (var t = e.parent; t !== null;) {
		if (!(t.f & 2)) return t.f & 16384 ? null : t;
		t = t.parent;
	}
	return null;
}
function Ht(e) {
	var t, n = W;
	Qn(Vt(e));
	try {
		e.f &= ~se, Bt(e), t = fr(e);
	} finally {
		Qn(n);
	}
	return t;
}
function Ut(e) {
	var t = e.v, n = Ht(e);
	if (!e.equals(n) && (e.wv = lr(), (!I?.is_fork || e.deps === null) && (e.v = n, I?.capture(e, t, !0), e.deps === null))) {
		F(e, T);
		return;
	}
	Jn || (ut === null ? nt(e) : (Tn() || I?.is_fork) && ut.set(e, n));
}
function Wt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(me), t.teardown = x, t.ac = null, mr(t, 0), In(t));
}
function Gt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && hr(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Kt = /* @__PURE__ */ new Set(), qt = /* @__PURE__ */ new Map(), Jt = !1;
function Yt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Be,
		rv: 0,
		wv: 0
	};
}
/* @__NO_SIDE_EFFECTS__ */
function L(e, t) {
	let n = Yt(e, t);
	return er(n), n;
}
/* @__NO_SIDE_EFFECTS__ */
function Xt(e, t = !1, n = !0) {
	let r = Yt(e);
	return t || (r.equals = He), We && n && P !== null && P.l !== null && (P.l.s ??= []).push(r), r;
}
function R(e, t, n = !1) {
	return U !== null && (!Xn || U.f & 131072) && Je() && U.f & 4325394 && ($n === null || !d.call($n, e)) && Ee(), Zt(e, n ? z(t) : t, ht);
}
function Zt(e, t, n = null) {
	if (!e.equals(t)) {
		var r = e.v;
		Jn ? qt.set(e, t) : qt.set(e, r), e.v = t;
		var i = vt.ensure();
		if (i.capture(e, r), e.f & 2) {
			let t = e;
			e.f & 2048 && Ht(t), ut === null && nt(t);
		}
		e.wv = lr(), en(e, E, n), Je() && W !== null && W.f & 1024 && !(W.f & 96) && (rr === null ? ir([e]) : rr.push(e)), !i.is_fork && Kt.size > 0 && !Jt && Qt();
	}
	return t;
}
function Qt() {
	Jt = !1;
	for (let e of Kt) e.f & 1024 && F(e, D), ur(e) && hr(e);
	Kt.clear();
}
function $t(e) {
	R(e, e.v + 1);
}
function en(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Je(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === W)) {
			var l = (c & E) === 0;
			if (l && F(s, t), c & 2) {
				var u = s;
				ut?.delete(u), c & 65536 || (c & 512 && (s.f |= se), en(u, D, n));
			} else if (l) {
				var d = s;
				c & 16 && xt !== null && xt.add(d), n === null ? Tt(d) : n.push(d);
			}
		}
	}
}
function z(e) {
	if (typeof e != "object" || !e || de in e) return e;
	let t = v(e);
	if (t !== g && t !== _) return e;
	var n = /* @__PURE__ */ new Map(), r = l(e), i = /* @__PURE__ */ L(0), a = null, o = sr, s = (e) => {
		if (sr === o) return e();
		var t = U, n = sr;
		Zn(null), cr(o);
		var r = e();
		return Zn(t), cr(n), r;
	};
	return r && n.set("length", /* @__PURE__ */ L(e.length, a)), new Proxy(e, {
		defineProperty(e, t, r) {
			(!("value" in r) || r.configurable === !1 || r.enumerable === !1 || r.writable === !1) && we();
			var i = n.get(t);
			return i === void 0 ? s(() => {
				var e = /* @__PURE__ */ L(r.value, a);
				return n.set(t, e), e;
			}) : R(i, r.value, !0), !0;
		},
		deleteProperty(e, t) {
			var r = n.get(t);
			if (r === void 0) {
				if (t in e) {
					let e = s(() => /* @__PURE__ */ L(k, a));
					n.set(t, e), $t(i);
				}
			} else R(r, k), $t(i);
			return !0;
		},
		get(t, r, i) {
			if (r === de) return e;
			var o = n.get(r), c = r in t;
			if (o === void 0 && (!c || m(t, r)?.writable) && (o = s(() => /* @__PURE__ */ L(z(c ? t[r] : k), a)), n.set(r, o)), o !== void 0) {
				var l = G(o);
				return l === k ? void 0 : l;
			}
			return Reflect.get(t, r, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var r = Reflect.getOwnPropertyDescriptor(e, t);
			if (r && "value" in r) {
				var i = n.get(t);
				i && (r.value = G(i));
			} else if (r === void 0) {
				var a = n.get(t), o = a?.v;
				if (a !== void 0 && o !== k) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return r;
		},
		has(e, t) {
			if (t === de) return !0;
			var r = n.get(t), i = r !== void 0 && r.v !== k || Reflect.has(e, t);
			return (r !== void 0 || W !== null && (!i || m(e, t)?.writable)) && (r === void 0 && (r = s(() => /* @__PURE__ */ L(i ? z(e[t]) : k, a)), n.set(t, r)), G(r) === k) ? !1 : i;
		},
		set(e, t, o, c) {
			var l = n.get(t), u = t in e;
			if (r && t === "length") for (var d = o; d < l.v; d += 1) {
				var f = n.get(d + "");
				f === void 0 ? d in e && (f = s(() => /* @__PURE__ */ L(k, a)), n.set(d + "", f)) : R(f, k);
			}
			if (l === void 0) (!u || m(e, t)?.writable) && (l = s(() => /* @__PURE__ */ L(void 0, a)), R(l, z(o)), n.set(t, l));
			else {
				u = l.v !== k;
				var p = s(() => z(o));
				R(l, p);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(c, o), !u) {
				if (r && typeof t == "string") {
					var g = n.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && R(g, _ + 1);
				}
				$t(i);
			}
			return !0;
		},
		ownKeys(e) {
			G(i);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = n.get(e);
				return t === void 0 || t.v !== k;
			});
			for (var [r, a] of n) a.v !== k && !(r in e) && t.push(r);
			return t;
		},
		setPrototypeOf() {
			Te();
		}
	});
}
function tn(e) {
	try {
		if (typeof e == "object" && e && de in e) return e[de];
	} catch {}
	return e;
}
function nn(e, t) {
	return Object.is(tn(e), tn(t));
}
var rn, an, on, sn;
function cn() {
	if (rn === void 0) {
		rn = window, an = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		on = m(t, "firstChild").get, sn = m(t, "nextSibling").get, y(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), y(n) && (n.__t = void 0);
	}
}
function ln(e = "") {
	return document.createTextNode(e);
}
/* @__NO_SIDE_EFFECTS__ */
function un(e) {
	return on.call(e);
}
/* @__NO_SIDE_EFFECTS__ */
function dn(e) {
	return sn.call(e);
}
function B(e, t) {
	if (!A) return /* @__PURE__ */ un(e);
	var n = /* @__PURE__ */ un(j);
	if (n === null) n = j.appendChild(ln());
	else if (t && n.nodeType !== 3) {
		var r = ln();
		return n?.before(r), M(r), r;
	}
	return t && gn(n), M(n), n;
}
function fn(e, t = !1) {
	if (!A) {
		var n = /* @__PURE__ */ un(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ dn(n) : n;
	}
	if (t) {
		if (j?.nodeType !== 3) {
			var r = ln();
			return j?.before(r), M(r), r;
		}
		gn(j);
	}
	return j;
}
function V(e, t = 1, n = !1) {
	let r = A ? j : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ dn(r);
	if (!A) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = ln();
			return r === null ? i?.after(a) : r.before(a), M(a), a;
		}
		gn(r);
	}
	return M(r), r;
}
function pn(e) {
	e.textContent = "";
}
function mn() {
	return !Ue || xt !== null ? !1 : (W.f & te) !== 0;
}
function hn(e, t, n) {
	let r = n ? { is: n } : void 0;
	return document.createElementNS(t ?? "http://www.w3.org/1999/xhtml", e, r);
}
function gn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function _n(e) {
	A && /* @__PURE__ */ un(e) !== null && pn(e);
}
var vn = !1;
function yn() {
	vn || (vn = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t.__on_r?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function bn(e) {
	var t = U, n = W;
	Zn(null), Qn(null);
	try {
		return e();
	} finally {
		Zn(t), Qn(n);
	}
}
function xn(e, t, n, r = n) {
	e.addEventListener(t, () => bn(n));
	let i = e.__on_r;
	i ? e.__on_r = () => {
		i(), r(!0);
	} : e.__on_r = () => r(!0), yn();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function Sn(e) {
	W === null && (U === null && xe(e), be()), Jn && ye(e);
}
function Cn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function wn(e, t) {
	var n = W;
	n !== null && n.f & 8192 && (e |= O);
	var r = {
		ctx: P,
		deps: null,
		nodes: null,
		f: e | E | 512,
		first: null,
		fn: t,
		last: null,
		next: null,
		parent: n,
		b: n && n.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	I?.register_created_effect(r);
	var i = r;
	if (e & 4) mt === null ? vt.ensure().schedule(r) : mt.push(r);
	else if (t !== null) {
		try {
			hr(r);
		} catch (e) {
			throw Rn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= re));
	}
	if (i !== null && (i.parent = n, n !== null && Cn(i, n), U !== null && U.f & 2 && !(e & 64))) {
		var a = U;
		(a.effects ??= []).push(i);
	}
	return r;
}
function Tn() {
	return U !== null && !Xn;
}
function En(e) {
	let t = wn(8, null);
	return F(t, T), t.teardown = e, t;
}
function Dn(e) {
	Sn("$effect");
	var t = W.f;
	if (!U && t & 32 && !(t & 32768)) {
		var n = P;
		(n.e ??= []).push(e);
	} else return On(e);
}
function On(e) {
	return wn(4 | ae, e);
}
function kn(e) {
	vt.ensure();
	let t = wn(64 | ie, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Vn(t, () => {
			Rn(t), n(void 0);
		}) : (Rn(t), n(void 0));
	});
}
function An(e) {
	return wn(4, e);
}
function jn(e) {
	return wn(le | ie, e);
}
function Mn(e, t = 0) {
	return wn(8 | t, e);
}
function H(e, t = [], n = [], r = []) {
	Mt(r, t, n, (t) => {
		wn(8, () => e(...t.map(G)));
	});
}
function Nn(e, t = 0) {
	return wn(16 | t, e);
}
function Pn(e) {
	return wn(32 | ie, e);
}
function Fn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Jn, n = U;
		Yn(!0), Zn(null);
		try {
			t.call(null);
		} finally {
			Yn(e), Zn(n);
		}
	}
}
function In(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && bn(() => {
			e.abort(me);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : Rn(n, t), n = r;
	}
}
function Ln(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || Rn(t), t = n;
	}
}
function Rn(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (zn(e.nodes.start, e.nodes.end), n = !0), F(e, ne), In(e, t && !n), mr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Fn(e), e.f ^= ne, e.f |= ee;
	var i = e.parent;
	i !== null && i.first !== null && Bn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function zn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ dn(e);
		e.remove(), e = n;
	}
}
function Bn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Vn(e, t, n = !0) {
	var r = [];
	Hn(e, r, !0);
	var i = () => {
		n && Rn(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Hn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= O;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next, o = (i.f & 65536) != 0 || (i.f & 32) != 0 && (e.f & 16) != 0;
			Hn(i, t, o ? n : !1), i = a;
		}
	}
}
function Un(e) {
	Wn(e, !0);
}
function Wn(e, t) {
	if (e.f & 8192) {
		e.f ^= O, e.f & 1024 || (F(e, E), vt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = (n.f & 65536) != 0 || (n.f & 32) != 0;
			Wn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Gn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ dn(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Kn = null, qn = !1, Jn = !1;
function Yn(e) {
	Jn = e;
}
var U = null, Xn = !1;
function Zn(e) {
	U = e;
}
var W = null;
function Qn(e) {
	W = e;
}
var $n = null;
function er(e) {
	U !== null && (!Ue || U.f & 2) && ($n === null ? $n = [e] : $n.push(e));
}
var tr = null, nr = 0, rr = null;
function ir(e) {
	rr = e;
}
var ar = 1, or = 0, sr = or;
function cr(e) {
	sr = e;
}
function lr() {
	return ++ar;
}
function ur(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~se), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (ur(a) && Ut(a), a.wv > e.wv) return !0;
		}
		t & 512 && ut === null && F(e, T);
	}
	return !1;
}
function dr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(!Ue && $n !== null && d.call($n, e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? dr(a, t, !1) : t === a && (n ? F(a, E) : a.f & 1024 && F(a, D), Tt(a));
	}
}
function fr(e) {
	var t = tr, n = nr, r = rr, i = U, a = $n, o = P, s = Xn, c = sr, l = e.f;
	tr = null, nr = 0, rr = null, U = l & 96 ? null : e, $n = null, Ge(e.ctx), Xn = !1, sr = ++or, e.ac !== null && (bn(() => {
		e.ac.abort(me);
	}), e.ac = null);
	try {
		e.f |= ce;
		var u = e.fn, d = u();
		e.f |= te;
		var f = e.deps, p = I?.is_fork;
		if (tr !== null) {
			var m;
			if (p || mr(e, nr), f !== null && nr > 0) for (f.length = nr + tr.length, m = 0; m < tr.length; m++) f[nr + m] = tr[m];
			else e.deps = f = tr;
			if (Tn() && e.f & 512) for (m = nr; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && nr < f.length && (mr(e, nr), f.length = nr);
		if (Je() && rr !== null && !Xn && f !== null && !(e.f & 6146)) for (m = 0; m < rr.length; m++) dr(rr[m], e);
		if (i !== null && i !== e) {
			if (or++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = or;
			if (t !== null) for (let e of t) e.rv = or;
			rr !== null && (r === null ? r = rr : r.push(...rr));
		}
		return e.f & 8388608 && (e.f ^= ue), d;
	} catch (e) {
		return $e(e);
	} finally {
		e.f ^= ce, tr = t, nr = n, rr = r, U = i, $n = a, Ge(o), Xn = s, sr = c;
	}
}
function pr(e, t) {
	let n = t.reactions;
	if (n !== null) {
		var r = u.call(n, e);
		if (r !== -1) {
			var i = n.length - 1;
			i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
		}
	}
	if (n === null && t.f & 2 && (tr === null || !d.call(tr, t))) {
		var a = t;
		a.f & 512 && (a.f ^= 512, a.f &= ~se), nt(a), Wt(a), mr(a, 0);
	}
}
function mr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) pr(e, n[r]);
}
function hr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		F(e, T);
		var n = W, r = qn;
		W = e, qn = !0;
		try {
			t & 16777232 ? Ln(e) : In(e), Fn(e);
			var i = fr(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = ar;
		} finally {
			qn = r, W = n;
		}
	}
}
async function gr() {
	if (Ue) return new Promise((e) => {
		requestAnimationFrame(() => e()), setTimeout(() => e());
	});
	await Promise.resolve(), yt();
}
function G(e) {
	var t = (e.f & 2) != 0;
	if (Kn?.add(e), U !== null && !Xn && !(W !== null && W.f & 16384) && ($n === null || !d.call($n, e))) {
		var n = U.deps;
		if (U.f & 2097152) e.rv < or && (e.rv = or, tr === null && n !== null && n[nr] === e ? nr++ : tr === null ? tr = [e] : tr.push(e));
		else {
			(U.deps ??= []).push(e);
			var r = e.reactions;
			r === null ? e.reactions = [U] : d.call(r, U) || r.push(U);
		}
	}
	if (Jn && qt.has(e)) return qt.get(e);
	if (t) {
		var i = e;
		if (Jn) {
			var a = i.v;
			return (!(i.f & 1024) && i.reactions !== null || vr(i)) && (a = Ht(i)), qt.set(i, a), a;
		}
		var o = (i.f & 512) == 0 && !Xn && U !== null && (qn || (U.f & 512) != 0), s = (i.f & te) === 0;
		ur(i) && (o && (i.f |= 512), Ut(i)), o && !s && (Gt(i), _r(i));
	}
	if (ut?.has(e)) return ut.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function _r(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Gt(t), _r(t));
}
function vr(e) {
	if (e.v === k) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (qt.has(t) || t.f & 2 && vr(t)) return !0;
	return !1;
}
function yr(e) {
	var t = Xn;
	try {
		return Xn = !0, e();
	} finally {
		Xn = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var br = ["touchstart", "touchmove"];
function xr(e) {
	return br.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var Sr = Symbol("events"), Cr = /* @__PURE__ */ new Set(), wr = /* @__PURE__ */ new Set();
function Tr(e) {
	if (!A) return;
	e.removeAttribute("onload"), e.removeAttribute("onerror");
	let t = e.__e;
	t !== void 0 && (e.__e = void 0, queueMicrotask(() => {
		e.isConnected && e.dispatchEvent(t);
	}));
}
function Er(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Ar.call(t, e), !e.cancelBubble) return bn(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ze(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function Dr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = Er(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && En(() => {
		t.removeEventListener(e, o, a);
	});
}
function K(e, t, n) {
	(t[Sr] ??= {})[e] = n;
}
function Or(e) {
	for (var t = 0; t < e.length; t++) Cr.add(e[t]);
	for (var n of wr) n(e);
}
var kr = null;
function Ar(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	kr = e;
	var o = 0, s = kr === e && e[Sr];
	if (s) {
		var c = i.indexOf(s);
		if (c !== -1 && (t === document || t === window)) {
			e[Sr] = t;
			return;
		}
		var l = i.indexOf(t);
		if (l === -1) return;
		c <= l && (o = c);
	}
	if (a = i[o] || e.target, a !== t) {
		p(e, "currentTarget", {
			configurable: !0,
			get() {
				return a || n;
			}
		});
		var u = U, d = W;
		Zn(null), Qn(null);
		try {
			for (var f, m = []; a !== null;) {
				var h = a.assignedSlot || a.parentNode || a.host || null;
				try {
					var g = a[Sr]?.[r];
					g != null && (!a.disabled || e.target === a) && g.call(a, e);
				} catch (e) {
					f ? m.push(e) : f = e;
				}
				if (e.cancelBubble || h === t || h === null) break;
				a = h;
			}
			if (f) {
				for (let e of m) queueMicrotask(() => {
					throw e;
				});
				throw f;
			}
		} finally {
			e[Sr] = t, delete e.currentTarget, Zn(u), Qn(d);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var jr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Mr(e) {
	return jr?.createHTML(e) ?? e;
}
function Nr(e) {
	var t = hn("template");
	return t.innerHTML = Mr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Pr(e, t) {
	var n = W;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/* @__NO_SIDE_EFFECTS__ */
function q(e, t) {
	var n = (t & 1) != 0, r = (t & 2) != 0, i, a = !e.startsWith("<!>");
	return () => {
		if (A) return Pr(j, null), j;
		i === void 0 && (i = Nr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ un(i)));
		var t = r || an ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ un(t), s = t.lastChild;
			Pr(o, s);
		} else Pr(t, t);
		return t;
	};
}
function Fr(e = "") {
	if (!A) {
		var t = ln(e + "");
		return Pr(t, t), t;
	}
	var n = j;
	return n.nodeType === 3 ? gn(n) : (n.before(n = ln()), M(n)), Pr(n, n), n;
}
function Ir() {
	if (A) return Pr(j, null), j;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = ln();
	return e.append(t, n), Pr(t, n), e;
}
function J(e, t) {
	if (A) {
		var n = W;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = j), Ie();
		return;
	}
	e !== null && e.before(t);
}
function Y(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e.__t ??= e.nodeValue) && (e.__t = n, e.nodeValue = `${n}`);
}
function Lr(e, t) {
	return zr(e, t);
}
var Rr = /* @__PURE__ */ new Map();
function zr(e, { target: t, anchor: n, props: r = {}, events: i, context: a, intro: o = !0, transformError: s }) {
	cn();
	var c = void 0, l = kn(() => {
		var o = n ?? t.appendChild(ln());
		At(o, { pending: () => {} }, (t) => {
			Ke({});
			var n = P;
			if (a && (n.c = a), i && (r.$$events = i), A && Pr(t, null), c = e(t, r) || {}, A && (W.nodes.end = j, j === null || j.nodeType !== 8 || j.data !== "]")) throw Me(), Oe;
			qe();
		}, s);
		var l = /* @__PURE__ */ new Set(), u = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!l.has(r)) {
					l.add(r);
					var i = xr(r);
					for (let e of [t, document]) {
						var a = Rr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Rr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Ar, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return u(f(Cr)), wr.add(u), () => {
			for (var e of l) for (let n of [t, document]) {
				var r = Rr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Ar), r.delete(e), r.size === 0 && Rr.delete(n)) : r.set(e, i);
			}
			wr.delete(u), o !== n && o.parentNode?.removeChild(o);
		};
	});
	return Br.set(c, l), c;
}
var Br = /* @__PURE__ */ new WeakMap(), Vr = class {
	anchor;
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ new Map();
	#n = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = !0;
	constructor(e, t = !0) {
		this.anchor = e, this.#i = t;
	}
	#a = (e) => {
		if (this.#e.has(e)) {
			var t = this.#e.get(e), n = this.#t.get(t);
			if (n) Un(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (Rn(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Gn(r, t), t.append(ln()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else Rn(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Vn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (Rn(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = I, r = mn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) if (r) {
			var i = document.createDocumentFragment(), a = ln();
			i.append(a), this.#n.set(e, {
				effect: Pn(() => t(a)),
				fragment: i
			});
		} else this.#t.set(e, Pn(() => t(this.anchor)));
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else A && (this.anchor = j), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function X(e, t, n = !1) {
	var r;
	A && (r = j, Ie());
	var i = new Vr(e), a = n ? re : 0;
	function o(e, t) {
		if (A) {
			var n = ze(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Re();
				M(a), i.anchor = a, Fe(!1), i.ensure(e, t), Fe(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	Nn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Hr(e, t) {
	return t;
}
function Ur(e, t, n) {
	for (var r = [], i = t.length, a, o = t.length, s = 0; s < i; s++) {
		let n = t[s];
		Vn(n, () => {
			if (a) {
				if (a.pending.delete(n), a.done.add(n), a.pending.size === 0) {
					var t = e.outrogroups;
					Wr(e, f(a.done)), t.delete(a), t.size === 0 && (e.outrogroups = null);
				}
			} else --o;
		}, !1);
	}
	if (o === 0) {
		var c = r.length === 0 && n !== null;
		if (c) {
			var l = n, u = l.parentNode;
			pn(u), u.append(l), e.items.clear();
		}
		Wr(e, t, !c);
	} else a = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function Wr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= oe, Gn(a, document.createDocumentFragment())) : Rn(t[i], n);
	}
}
var Gr;
function Z(e, t, n, r, i, a = null) {
	var o = e, s = /* @__PURE__ */ new Map();
	if (t & 4) {
		var c = e;
		o = A ? M(/* @__PURE__ */ un(c)) : c.appendChild(ln());
	}
	A && Ie();
	var u = null, d = /* @__PURE__ */ zt(() => {
		var e = n();
		return l(e) ? e : e == null ? [] : f(e);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = u, qr(v, p, o, t, r), u !== null && (p.length === 0 ? u.f & 33554432 ? (u.f ^= oe, Yr(u, null, o)) : Un(u) : Vn(u, () => {
			u = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: Nn(() => {
			p = G(d);
			var e = p.length;
			let c = !1;
			A && ze(o) === "[!" != (e === 0) && (o = Re(), M(o), Fe(!1), c = !0);
			for (var l = /* @__PURE__ */ new Set(), f = I, v = mn(), y = 0; y < e; y += 1) {
				A && j.nodeType === 8 && j.data === "]" && (o = j, c = !0, Fe(!1));
				var b = p[y], x = r(b, y), S = h ? null : s.get(x);
				S ? (S.v && Zt(S.v, b), S.i && Zt(S.i, y), v && f.unskip_effect(S.e)) : (S = Jr(s, h ? o : Gr ??= ln(), b, x, y, i, t, n), h || (S.e.f |= oe), s.set(x, S)), l.add(x);
			}
			if (e === 0 && a && !u && (h ? u = Pn(() => a(o)) : (u = Pn(() => a(Gr ??= ln())), u.f |= oe)), e > l.size && ve("", "", ""), A && e > 0 && M(Re()), !h) if (m.set(f, l), v) {
				for (let [e, t] of s) l.has(e) || f.skip_effect(t.e);
				f.oncommit(g), f.ondiscard(_);
			} else g(f);
			c && Fe(!0), G(d);
		}),
		flags: t,
		items: s,
		pending: m,
		outrogroups: null,
		fallback: u
	};
	h = !1, A && (o = j);
}
function Kr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function qr(e, t, n, r, i) {
	var a = (r & 8) != 0, o = t.length, s = e.items, c = Kr(e.effect.first), l, u = null, d, p = [], m = [], h, g, _, v;
	if (a) for (v = 0; v < o; v += 1) h = t[v], g = i(h, v), _ = s.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (d ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < o; v += 1) {
		if (h = t[v], g = i(h, v), _ = s.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Un(_), a && (_.nodes?.a?.unfix(), (d ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) if (_.f ^= oe, _ === c) Yr(_, null, n);
		else {
			var y = u ? u.next : c;
			_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Xr(e, u, _), Xr(e, _, y), Yr(_, y, n), u = _, p = [], m = [], c = Kr(u.next);
			continue;
		}
		if (_ !== c) {
			if (l !== void 0 && l.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					u = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Yr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) l.delete(m[x]);
					Xr(e, S.prev, C.next), Xr(e, u, S), Xr(e, C, b), c = b, u = C, --v, p = [], m = [];
				} else l.delete(_), Yr(_, c, n), Xr(e, _.prev, _.next), Xr(e, _, u === null ? e.effect.first : u.next), Xr(e, u, _), u = _;
				continue;
			}
			for (p = [], m = []; c !== null && c !== _;) (l ??= /* @__PURE__ */ new Set()).add(c), m.push(c), c = Kr(c.next);
			if (c === null) continue;
		}
		_.f & 33554432 || p.push(_), u = _, c = Kr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Wr(e, f(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (c !== null || l !== void 0) {
		var w = [];
		if (l !== void 0) for (_ of l) _.f & 8192 || w.push(_);
		for (; c !== null;) !(c.f & 8192) && c !== e.fallback && w.push(c), c = Kr(c.next);
		var T = w.length;
		if (T > 0) {
			var E = r & 4 && o === 0 ? n : null;
			if (a) {
				for (v = 0; v < T; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < T; v += 1) w[v].nodes?.a?.fix();
			}
			Ur(e, w, E);
		}
	}
	a && Ze(() => {
		if (d !== void 0) for (_ of d) _.nodes?.a?.apply();
	});
}
function Jr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Yt(n) : /* @__PURE__ */ Xt(n, !1, !1) : null, l = o & 2 ? Yt(i) : null;
	return {
		v: c,
		i: l,
		e: Pn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Yr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ dn(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Xr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Zr(e, t, n = !1, r = !1, i = !1, a = !1) {
	var o = e, s = "";
	if (n) {
		var c = e;
		A && (o = M(/* @__PURE__ */ un(c)));
	}
	H(() => {
		var e = W;
		if (s === (s = t() ?? "")) {
			A && Ie();
			return;
		}
		if (n && !A) {
			e.nodes = null, c.innerHTML = s, s !== "" && Pr(/* @__PURE__ */ un(c), c.lastChild);
			return;
		}
		if (e.nodes !== null && (zn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (A) {
				for (var a = j.data, l = Ie(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ dn(l);
				if (l === null) throw Me(), Oe;
				Pr(j, u), o = M(l);
				return;
			}
			var d = hn(r ? "svg" : i ? "math" : "template", r ? Ae : i ? je : void 0);
			d.innerHTML = s;
			var f = r || i ? d : d.content;
			if (Pr(/* @__PURE__ */ un(f), f.lastChild), r || i) for (; /* @__PURE__ */ un(f);) o.before(/* @__PURE__ */ un(f));
			else o.before(f);
		}
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/svelte-component.js
function Qr(e, t, n) {
	var r;
	A && (r = j, Ie());
	var i = new Vr(e);
	Nn(() => {
		var e = t() ?? null;
		if (A && ze(r) === "[" != (e !== null)) {
			var a = Re();
			M(a), i.anchor = a, Fe(!1), i.ensure(e, e && ((t) => n(t, e))), Fe(!0);
			return;
		}
		i.ensure(e, e && ((t) => n(t, e)));
	}, re);
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
var $r = [..." 	\n\r\f\xA0\v﻿"];
function ei(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || $r.includes(r[o - 1])) && (s === r.length || $r.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function ti(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function ni(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function ri(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(ni)), i && c.push(...Object.keys(i).map(ni));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = ni(e.substring(l, u).trim());
							if (!c.includes(p)) {
								f !== ";" && d++;
								var m = e.substring(l, d).trim();
								n += " " + m + ";";
							}
						}
						l = d + 1, u = -1;
					}
				}
			}
		}
		return r && (n += ti(r)), i && (n += ti(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function ii(e, t, n, r, i, a) {
	var o = e.__className;
	if (A || o !== n || o === void 0) {
		var s = ei(n, r, a);
		(!A || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e.__className = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function ai(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function oi(e, t, n, r) {
	var i = e.__style;
	if (A || i !== t) {
		var a = ri(t, r);
		(!A || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e.__style = t;
	} else r && (Array.isArray(r) ? (ai(e, n?.[0], r[0]), ai(e, n?.[1], r[1], "important")) : ai(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function si(e, t, n = !1) {
	if (e.multiple) {
		if (t == null) return;
		if (!l(t)) return Ne();
		for (var r of e.options) r.selected = t.includes(ui(r));
		return;
	}
	for (r of e.options) if (nn(ui(r), t)) {
		r.selected = !0;
		return;
	}
	(!n || t !== void 0) && (e.selectedIndex = -1);
}
function ci(e) {
	var t = new MutationObserver(() => {
		si(e, e.__value);
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), En(() => {
		t.disconnect();
	});
}
function li(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	xn(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), ui);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && ui(o);
		}
		n(a), e.__value = a, I !== null && r.add(I);
	}), An(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = Ue ? lt : I;
			if (r.has(o)) return;
		}
		if (si(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = ui(s), n(a));
		}
		e.__value = a, i = !1;
	}), ci(e);
}
function ui(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var di = Symbol("is custom element"), fi = Symbol("is html"), pi = he ? "link" : "LINK";
function mi(e) {
	if (A) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					Q(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					Q(e, "checked", null), e.checked = r;
				}
			}
		};
		e.__on_r = n, Ze(n), yn();
	}
}
function Q(e, t, n, r) {
	var i = hi(e);
	A && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === pi) || i[t] !== (i[t] = n) && (t === "loading" && (e[pe] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && _i(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function hi(e) {
	return e.__attributes ??= {
		[di]: e.nodeName.includes("-"),
		[fi]: e.namespaceURI === ke
	};
}
var gi = /* @__PURE__ */ new Map();
function _i(e) {
	var t = e.getAttribute("is") || e.nodeName, n = gi.get(t);
	if (n) return n;
	gi.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var o in r = h(i), r) r[o].set && n.push(o);
		i = v(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function vi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	xn(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = Si(e) ? Ci(a) : a, n(a), I !== null && r.add(I), await gr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (A && e.defaultValue !== e.value || yr(t) == null && e.value) && (n(Si(e) ? Ci(e.value) : e.value), I !== null && r.add(I)), Mn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = Ue ? lt : I;
			if (r.has(i)) return;
		}
		Si(e) && n === Ci(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
var yi = /* @__PURE__ */ new Set();
function bi(e, t, n, r, i = r) {
	var a = n.getAttribute("type") === "checkbox", o = e;
	let s = !1;
	if (t !== null) for (var c of t) o = o[c] ??= [];
	o.push(n), xn(n, "change", () => {
		var e = n.__value;
		a && (e = xi(o, e, n.checked)), i(e);
	}, () => i(a ? [] : null)), Mn(() => {
		var e = r();
		if (A && n.defaultChecked !== n.checked) {
			s = !0;
			return;
		}
		a ? (e ||= [], n.checked = e.includes(n.__value)) : n.checked = nn(n.__value, e);
	}), En(() => {
		var e = o.indexOf(n);
		e !== -1 && o.splice(e, 1);
	}), yi.has(o) || (yi.add(o), Ze(() => {
		o.sort((e, t) => e.compareDocumentPosition(t) === 4 ? -1 : 1), yi.delete(o);
	})), Ze(() => {
		if (s) {
			var e = a ? xi(o, e, n.checked) : o.find((e) => e.checked)?.__value;
			i(e);
		}
	});
}
function xi(e, t, n) {
	for (var r = /* @__PURE__ */ new Set(), i = 0; i < e.length; i += 1) e[i].checked && r.add(e[i].__value);
	return n || r.delete(t), Array.from(r);
}
function Si(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function Ci(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function wi(e, t) {
	return e === t || e?.[de] === t;
}
function Ti(e = {}, t, n, r) {
	var i = P.r, a = W;
	return An(() => {
		var o, s;
		return Mn(() => {
			o = s, s = r?.() || [], yr(() => {
				e !== n(...s) && (t(e, ...s), o && wi(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && wi(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
var Ei = {
	get(e, t) {
		let n = e.props.length;
		for (; n--;) {
			let r = e.props[n];
			if (b(r) && (r = r()), typeof r == "object" && r && t in r) return r[t];
		}
	},
	set(e, t, n) {
		let r = e.props.length;
		for (; r--;) {
			let i = e.props[r];
			b(i) && (i = i());
			let a = m(i, t);
			if (a && a.set) return a.set(n), !0;
		}
		return !1;
	},
	getOwnPropertyDescriptor(e, t) {
		let n = e.props.length;
		for (; n--;) {
			let r = e.props[n];
			if (b(r) && (r = r()), typeof r == "object" && r && t in r) {
				let e = m(r, t);
				return e && !e.configurable && (e.configurable = !0), e;
			}
		}
	},
	has(e, t) {
		if (t === de || t === fe) return !1;
		for (let n of e.props) if (b(n) && (n = n()), n != null && t in n) return !0;
		return !1;
	},
	ownKeys(e) {
		let t = [];
		for (let n of e.props) if (b(n) && (n = n()), n) {
			for (let e in n) t.includes(e) || t.push(e);
			for (let e of Object.getOwnPropertySymbols(n)) t.includes(e) || t.push(e);
		}
		return t;
	}
};
function Di(...e) {
	return new Proxy({ props: e }, Ei);
}
function Oi(e, t, n, r) {
	var i = !We || (n & 2) != 0, a = (n & 8) != 0, o = (n & 16) != 0, s = r, c = !0, l = () => (c && (c = !1, s = o ? yr(r) : r), s);
	let u;
	if (a) {
		var d = de in e || fe in e;
		u = m(e, t)?.set ?? (d && t in e ? (n) => e[t] = n : void 0);
	}
	var f, p = !1;
	a ? [f, p] = st(() => e[t]) : f = e[t], f === void 0 && r !== void 0 && (f = l(), u && (i && Ce(t), u(f)));
	var h = i ? () => {
		var n = e[t];
		return n === void 0 ? l() : (c = !0, n);
	} : () => {
		var n = e[t];
		return n !== void 0 && (s = void 0), n === void 0 ? s : n;
	};
	if (i && !(n & 4)) return h;
	if (u) {
		var g = e.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!i || !t || g || p) && u(t ? h() : e), e) : h();
		});
	}
	var _ = !1, v = (n & 1 ? It : zt)(() => (_ = !1, h()));
	a && G(v);
	var y = W;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? G(v) : i && a ? z(e) : e;
			return R(v, n), _ = !0, s !== void 0 && (s = n), e;
		}
		return Jn && _ || y.f & 16384 ? v.v : G(v);
	});
}
function ki(e) {
	P === null && ge("onMount"), We && P.l !== null ? Ai(P).m.push(e) : Dn(() => {
		let t = yr(e);
		if (typeof t == "function") return t;
	});
}
function Ai(e) {
	var t = e.l;
	return t.u ??= {
		a: [],
		b: [],
		m: []
	};
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/lib/api.svelte.ts
var ji = /* @__PURE__ */ c((/* @__PURE__ */ o(((e, t) => {
	(function() {
		var e = {
			de_DE: {
				identifier: "de-DE",
				days: [
					"Sonntag",
					"Montag",
					"Dienstag",
					"Mittwoch",
					"Donnerstag",
					"Freitag",
					"Samstag"
				],
				shortDays: [
					"So",
					"Mo",
					"Di",
					"Mi",
					"Do",
					"Fr",
					"Sa"
				],
				months: [
					"Januar",
					"Februar",
					"März",
					"April",
					"Mai",
					"Juni",
					"Juli",
					"August",
					"September",
					"Oktober",
					"November",
					"Dezember"
				],
				shortMonths: [
					"Jan",
					"Feb",
					"Mär",
					"Apr",
					"Mai",
					"Jun",
					"Jul",
					"Aug",
					"Sep",
					"Okt",
					"Nov",
					"Dez"
				],
				AM: "AM",
				PM: "PM",
				am: "am",
				pm: "pm",
				formats: {
					c: "%a %d %b %Y %X %Z",
					D: "%d.%m.%Y",
					F: "%Y-%m-%d",
					R: "%H:%M",
					r: "%I:%M:%S %p",
					T: "%H:%M:%S",
					v: "%e-%b-%Y",
					X: "%T",
					x: "%D"
				}
			},
			en_CA: {
				identifier: "en-CA",
				days: [
					"Sunday",
					"Monday",
					"Tuesday",
					"Wednesday",
					"Thursday",
					"Friday",
					"Saturday"
				],
				shortDays: [
					"Sun",
					"Mon",
					"Tue",
					"Wed",
					"Thu",
					"Fri",
					"Sat"
				],
				months: [
					"January",
					"February",
					"March",
					"April",
					"May",
					"June",
					"July",
					"August",
					"September",
					"October",
					"November",
					"December"
				],
				shortMonths: [
					"Jan",
					"Feb",
					"Mar",
					"Apr",
					"May",
					"Jun",
					"Jul",
					"Aug",
					"Sep",
					"Oct",
					"Nov",
					"Dec"
				],
				ordinalSuffixes: /* @__PURE__ */ "st.nd.rd.th.th.th.th.th.th.th.th.th.th.th.th.th.th.th.th.th.st.nd.rd.th.th.th.th.th.th.th.st".split("."),
				AM: "AM",
				PM: "PM",
				am: "am",
				pm: "pm",
				formats: {
					c: "%a %d %b %Y %X %Z",
					D: "%d/%m/%y",
					F: "%Y-%m-%d",
					R: "%H:%M",
					r: "%I:%M:%S %p",
					T: "%H:%M:%S",
					v: "%e-%b-%Y",
					X: "%r",
					x: "%D"
				}
			},
			en_US: {
				identifier: "en-US",
				days: [
					"Sunday",
					"Monday",
					"Tuesday",
					"Wednesday",
					"Thursday",
					"Friday",
					"Saturday"
				],
				shortDays: [
					"Sun",
					"Mon",
					"Tue",
					"Wed",
					"Thu",
					"Fri",
					"Sat"
				],
				months: [
					"January",
					"February",
					"March",
					"April",
					"May",
					"June",
					"July",
					"August",
					"September",
					"October",
					"November",
					"December"
				],
				shortMonths: [
					"Jan",
					"Feb",
					"Mar",
					"Apr",
					"May",
					"Jun",
					"Jul",
					"Aug",
					"Sep",
					"Oct",
					"Nov",
					"Dec"
				],
				ordinalSuffixes: /* @__PURE__ */ "st.nd.rd.th.th.th.th.th.th.th.th.th.th.th.th.th.th.th.th.th.st.nd.rd.th.th.th.th.th.th.th.st".split("."),
				AM: "AM",
				PM: "PM",
				am: "am",
				pm: "pm",
				formats: {
					c: "%a %d %b %Y %X %Z",
					D: "%m/%d/%y",
					F: "%Y-%m-%d",
					R: "%H:%M",
					r: "%I:%M:%S %p",
					T: "%H:%M:%S",
					v: "%e-%b-%Y",
					X: "%r",
					x: "%D"
				}
			},
			es_MX: {
				identifier: "es-MX",
				days: [
					"domingo",
					"lunes",
					"martes",
					"miércoles",
					"jueves",
					"viernes",
					"sábado"
				],
				shortDays: [
					"dom",
					"lun",
					"mar",
					"mié",
					"jue",
					"vie",
					"sáb"
				],
				months: [
					"enero",
					"febrero",
					"marzo",
					"abril",
					"mayo",
					"junio",
					"julio",
					"agosto",
					"septiembre",
					"octubre",
					"noviembre",
					"diciembre"
				],
				shortMonths: [
					"ene",
					"feb",
					"mar",
					"abr",
					"may",
					"jun",
					"jul",
					"ago",
					"sep",
					"oct",
					"nov",
					"dic"
				],
				AM: "AM",
				PM: "PM",
				am: "am",
				pm: "pm",
				formats: {
					c: "%a %d %b %Y %X %Z",
					D: "%d/%m/%Y",
					F: "%Y-%m-%d",
					R: "%H:%M",
					r: "%I:%M:%S %p",
					T: "%H:%M:%S",
					v: "%e-%b-%Y",
					X: "%T",
					x: "%D"
				}
			},
			fr_FR: {
				identifier: "fr-FR",
				days: [
					"dimanche",
					"lundi",
					"mardi",
					"mercredi",
					"jeudi",
					"vendredi",
					"samedi"
				],
				shortDays: [
					"dim.",
					"lun.",
					"mar.",
					"mer.",
					"jeu.",
					"ven.",
					"sam."
				],
				months: [
					"janvier",
					"février",
					"mars",
					"avril",
					"mai",
					"juin",
					"juillet",
					"août",
					"septembre",
					"octobre",
					"novembre",
					"décembre"
				],
				shortMonths: [
					"janv.",
					"févr.",
					"mars",
					"avril",
					"mai",
					"juin",
					"juil.",
					"août",
					"sept.",
					"oct.",
					"nov.",
					"déc."
				],
				AM: "AM",
				PM: "PM",
				am: "am",
				pm: "pm",
				formats: {
					c: "%a %d %b %Y %X %Z",
					D: "%d/%m/%Y",
					F: "%Y-%m-%d",
					R: "%H:%M",
					r: "%I:%M:%S %p",
					T: "%H:%M:%S",
					v: "%e-%b-%Y",
					X: "%T",
					x: "%D"
				}
			},
			it_IT: {
				identifier: "it-IT",
				days: [
					"domenica",
					"lunedì",
					"martedì",
					"mercoledì",
					"giovedì",
					"venerdì",
					"sabato"
				],
				shortDays: [
					"dom",
					"lun",
					"mar",
					"mer",
					"gio",
					"ven",
					"sab"
				],
				months: [
					"gennaio",
					"febbraio",
					"marzo",
					"aprile",
					"maggio",
					"giugno",
					"luglio",
					"agosto",
					"settembre",
					"ottobre",
					"novembre",
					"dicembre"
				],
				shortMonths: [
					"gen",
					"feb",
					"mar",
					"apr",
					"mag",
					"giu",
					"lug",
					"ago",
					"set",
					"ott",
					"nov",
					"dic"
				],
				AM: "AM",
				PM: "PM",
				am: "am",
				pm: "pm",
				formats: {
					c: "%a %d %b %Y %X %Z",
					D: "%d/%m/%Y",
					F: "%Y-%m-%d",
					R: "%H:%M",
					r: "%I:%M:%S %p",
					T: "%H:%M:%S",
					v: "%e-%b-%Y",
					X: "%T",
					x: "%D"
				}
			},
			nl_NL: {
				identifier: "nl-NL",
				days: [
					"zondag",
					"maandag",
					"dinsdag",
					"woensdag",
					"donderdag",
					"vrijdag",
					"zaterdag"
				],
				shortDays: [
					"zo",
					"ma",
					"di",
					"wo",
					"do",
					"vr",
					"za"
				],
				months: [
					"januari",
					"februari",
					"maart",
					"april",
					"mei",
					"juni",
					"juli",
					"augustus",
					"september",
					"oktober",
					"november",
					"december"
				],
				shortMonths: [
					"jan",
					"feb",
					"mrt",
					"apr",
					"mei",
					"jun",
					"jul",
					"aug",
					"sep",
					"okt",
					"nov",
					"dec"
				],
				AM: "AM",
				PM: "PM",
				am: "am",
				pm: "pm",
				formats: {
					c: "%a %d %b %Y %X %Z",
					D: "%d-%m-%y",
					F: "%Y-%m-%d",
					R: "%H:%M",
					r: "%I:%M:%S %p",
					T: "%H:%M:%S",
					v: "%e-%b-%Y",
					X: "%T",
					x: "%D"
				}
			},
			pt_BR: {
				identifier: "pt-BR",
				days: [
					"domingo",
					"segunda",
					"terça",
					"quarta",
					"quinta",
					"sexta",
					"sábado"
				],
				shortDays: [
					"Dom",
					"Seg",
					"Ter",
					"Qua",
					"Qui",
					"Sex",
					"Sáb"
				],
				months: [
					"janeiro",
					"fevereiro",
					"março",
					"abril",
					"maio",
					"junho",
					"julho",
					"agosto",
					"setembro",
					"outubro",
					"novembro",
					"dezembro"
				],
				shortMonths: [
					"Jan",
					"Fev",
					"Mar",
					"Abr",
					"Mai",
					"Jun",
					"Jul",
					"Ago",
					"Set",
					"Out",
					"Nov",
					"Dez"
				],
				AM: "AM",
				PM: "PM",
				am: "am",
				pm: "pm",
				formats: {
					c: "%a %d %b %Y %X %Z",
					D: "%d-%m-%Y",
					F: "%Y-%m-%d",
					R: "%H:%M",
					r: "%I:%M:%S %p",
					T: "%H:%M:%S",
					v: "%e-%b-%Y",
					X: "%T",
					x: "%D"
				}
			},
			ru_RU: {
				identifier: "ru-RU",
				days: [
					"Воскресенье",
					"Понедельник",
					"Вторник",
					"Среда",
					"Четверг",
					"Пятница",
					"Суббота"
				],
				shortDays: [
					"Вс",
					"Пн",
					"Вт",
					"Ср",
					"Чт",
					"Пт",
					"Сб"
				],
				months: [
					"Январь",
					"Февраль",
					"Март",
					"Апрель",
					"Май",
					"Июнь",
					"Июль",
					"Август",
					"Сентябрь",
					"Октябрь",
					"Ноябрь",
					"Декабрь"
				],
				shortMonths: [
					"янв",
					"фев",
					"мар",
					"апр",
					"май",
					"июн",
					"июл",
					"авг",
					"сен",
					"окт",
					"ноя",
					"дек"
				],
				AM: "AM",
				PM: "PM",
				am: "am",
				pm: "pm",
				formats: {
					c: "%a %d %b %Y %X",
					D: "%d.%m.%y",
					F: "%Y-%m-%d",
					R: "%H:%M",
					r: "%I:%M:%S %p",
					T: "%H:%M:%S",
					v: "%e-%b-%Y",
					X: "%T",
					x: "%D"
				}
			},
			tr_TR: {
				identifier: "tr-TR",
				days: [
					"Pazar",
					"Pazartesi",
					"Salı",
					"Çarşamba",
					"Perşembe",
					"Cuma",
					"Cumartesi"
				],
				shortDays: [
					"Paz",
					"Pzt",
					"Sal",
					"Çrş",
					"Prş",
					"Cum",
					"Cts"
				],
				months: [
					"Ocak",
					"Şubat",
					"Mart",
					"Nisan",
					"Mayıs",
					"Haziran",
					"Temmuz",
					"Ağustos",
					"Eylül",
					"Ekim",
					"Kasım",
					"Aralık"
				],
				shortMonths: [
					"Oca",
					"Şub",
					"Mar",
					"Nis",
					"May",
					"Haz",
					"Tem",
					"Ağu",
					"Eyl",
					"Eki",
					"Kas",
					"Ara"
				],
				AM: "ÖÖ",
				PM: "ÖS",
				am: "ÖÖ",
				pm: "ÖS",
				formats: {
					c: "%a %d %b %Y %X %Z",
					D: "%d-%m-%Y",
					F: "%Y-%m-%d",
					R: "%H:%M",
					r: "%I:%M:%S %p",
					T: "%H:%M:%S",
					v: "%e-%b-%Y",
					X: "%T",
					x: "%D"
				}
			},
			zh_CN: {
				identifier: "zh-CN",
				days: [
					"星期日",
					"星期一",
					"星期二",
					"星期三",
					"星期四",
					"星期五",
					"星期六"
				],
				shortDays: [
					"日",
					"一",
					"二",
					"三",
					"四",
					"五",
					"六"
				],
				months: [
					"一月",
					"二月",
					"三月",
					"四月",
					"五月",
					"六月",
					"七月",
					"八月",
					"九月",
					"十月",
					"十一月",
					"十二月"
				],
				shortMonths: [
					"一月",
					"二月",
					"三月",
					"四月",
					"五月",
					"六月",
					"七月",
					"八月",
					"九月",
					"十月",
					"十一月",
					"十二月"
				],
				AM: "上午",
				PM: "下午",
				am: "上午",
				pm: "下午",
				formats: {
					c: "%a %d %b %Y %X %Z",
					D: "%d/%m/%y",
					F: "%Y-%m-%d",
					R: "%H:%M",
					r: "%I:%M:%S %p",
					T: "%H:%M:%S",
					v: "%e-%b-%Y",
					X: "%r",
					x: "%D"
				}
			}
		}, n = e.en_US, r = new o(n, 0, !1), i = t !== void 0, a;
		i ? a = t.exports = r : (a = function() {
			return this || (0, eval)("this");
		}(), a.strftime = r), typeof Date.now != "function" && (Date.now = function() {
			return +/* @__PURE__ */ new Date();
		});
		function o(t, r, i) {
			var a = t || n, m = r || 0, h = i || !1, _ = 0, v;
			function y(e, t) {
				var n;
				if (!t) {
					var r = Date.now();
					r > _ ? (_ = r, v = new Date(_), n = _, h && (v = new Date(_ + f(v) + m))) : n = _, t = v;
				} else if (n = t.getTime(), h) {
					var i = f(t);
					if (t = new Date(n + i + m), f(t) !== i) {
						var o = f(t);
						t = new Date(n + o + m);
					}
				}
				return b(e, t, a, n);
			}
			function b(e, t, n, r) {
				for (var i = "", a = null, o = !1, f = e.length, _ = !1, v = 0; v < f; v++) {
					var y = e.charCodeAt(v);
					if (o === !0) {
						if (y === 45) {
							a = "";
							continue;
						} else if (y === 95) {
							a = " ";
							continue;
						} else if (y === 48) {
							a = "0";
							continue;
						} else if (y === 58) {
							_ && g("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), _ = !0;
							continue;
						}
						switch (y) {
							case 37:
								i += "%";
								break;
							case 65:
								i += n.days[t.getDay()];
								break;
							case 66:
								i += n.months[t.getMonth()];
								break;
							case 67:
								i += s(Math.floor(t.getFullYear() / 100), a);
								break;
							case 68:
								i += b(n.formats.D, t, n, r);
								break;
							case 70:
								i += b(n.formats.F, t, n, r);
								break;
							case 72:
								i += s(t.getHours(), a);
								break;
							case 73:
								i += s(l(t.getHours()), a);
								break;
							case 76:
								i += c(Math.floor(r % 1e3));
								break;
							case 77:
								i += s(t.getMinutes(), a);
								break;
							case 80:
								i += t.getHours() < 12 ? n.am : n.pm;
								break;
							case 82:
								i += b(n.formats.R, t, n, r);
								break;
							case 83:
								i += s(t.getSeconds(), a);
								break;
							case 84:
								i += b(n.formats.T, t, n, r);
								break;
							case 85:
								i += s(u(t, "sunday"), a);
								break;
							case 87:
								i += s(u(t, "monday"), a);
								break;
							case 88:
								i += b(n.formats.X, t, n, r);
								break;
							case 89:
								i += t.getFullYear();
								break;
							case 90:
								if (h && m === 0) i += "GMT";
								else {
									var x = p(t);
									i += x || "";
								}
								break;
							case 97:
								i += n.shortDays[t.getDay()];
								break;
							case 98:
								i += n.shortMonths[t.getMonth()];
								break;
							case 99:
								i += b(n.formats.c, t, n, r);
								break;
							case 100:
								i += s(t.getDate(), a);
								break;
							case 101:
								i += s(t.getDate(), a ?? " ");
								break;
							case 104:
								i += n.shortMonths[t.getMonth()];
								break;
							case 106:
								var S = new Date(t.getFullYear(), 0, 1), C = Math.ceil((t.getTime() - S.getTime()) / (1e3 * 60 * 60 * 24));
								i += c(C);
								break;
							case 107:
								i += s(t.getHours(), a ?? " ");
								break;
							case 108:
								i += s(l(t.getHours()), a ?? " ");
								break;
							case 109:
								i += s(t.getMonth() + 1, a);
								break;
							case 110:
								i += "\n";
								break;
							case 111:
								var C = t.getDate();
								n.ordinalSuffixes ? i += String(C) + (n.ordinalSuffixes[C - 1] || d(C)) : i += String(C) + d(C);
								break;
							case 112:
								i += t.getHours() < 12 ? n.AM : n.PM;
								break;
							case 114:
								i += b(n.formats.r, t, n, r);
								break;
							case 115:
								i += Math.floor(r / 1e3);
								break;
							case 116:
								i += "	";
								break;
							case 117:
								var C = t.getDay();
								i += C === 0 ? 7 : C;
								break;
							case 118:
								i += b(n.formats.v, t, n, r);
								break;
							case 119:
								i += t.getDay();
								break;
							case 120:
								i += b(n.formats.x, t, n, r);
								break;
							case 121:
								i += s(t.getFullYear() % 100, a);
								break;
							case 122:
								if (h && m === 0) i += _ ? "+00:00" : "+0000";
								else {
									var w = m === 0 ? -t.getTimezoneOffset() : m / (60 * 1e3), T = w < 0 ? "-" : "+", E = _ ? ":" : "", D = Math.floor(Math.abs(w / 60)), O = Math.abs(w % 60);
									i += T + s(D) + E + s(O);
								}
								break;
							default:
								o && (i += "%"), i += e[v];
								break;
						}
						a = null, o = !1;
						continue;
					}
					if (y === 37) {
						o = !0;
						continue;
					}
					i += e[v];
				}
				return i;
			}
			var x = y;
			return x.localize = function(e) {
				return new o(e || a, m, h);
			}, x.localizeByIdentifier = function(t) {
				var n = e[t];
				return n ? x.localize(n) : (g("[WARNING] No locale found with identifier \"" + t + "\"."), x);
			}, x.timezone = function(e) {
				var t = m, n = h, r = typeof e;
				if (r === "number" || r === "string") if (n = !0, r === "string") {
					var i = e[0] === "-" ? -1 : 1, s = parseInt(e.slice(1, 3), 10), c = parseInt(e.slice(3, 5), 10);
					t = i * (60 * s + c) * 60 * 1e3;
				} else r === "number" && (t = e * 60 * 1e3);
				return new o(a, t, n);
			}, x.utc = function() {
				return new o(a, m, !0);
			}, x;
		}
		function s(e, t) {
			return t === "" || e > 9 ? "" + e : (t ??= "0", t + e);
		}
		function c(e) {
			return e > 99 ? e : e > 9 ? "0" + e : "00" + e;
		}
		function l(e) {
			return e === 0 ? 12 : e > 12 ? e - 12 : e;
		}
		function u(e, t) {
			t ||= "sunday";
			var n = e.getDay();
			t === "monday" && (n === 0 ? n = 6 : n--);
			var r = Date.UTC(e.getFullYear(), 0, 1), i = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate()), a = (Math.floor((i - r) / 864e5) + 7 - n) / 7;
			return Math.floor(a);
		}
		function d(e) {
			var t = e % 10, n = e % 100;
			if (n >= 11 && n <= 13 || t === 0 || t >= 4) return "th";
			switch (t) {
				case 1: return "st";
				case 2: return "nd";
				case 3: return "rd";
			}
		}
		function f(e) {
			return (e.getTimezoneOffset() || 0) * 6e4;
		}
		function p(e, t) {
			return m(e, t) || h(e);
		}
		function m(e, t) {
			if (t == null) return null;
			var n = e.toLocaleString(t, { timeZoneName: "short" }).match(/\s([\w]+)$/);
			return n && n[1];
		}
		function h(e) {
			var t = e.toString().match(/\(([\w\s]+)\)/);
			return t && t[1];
		}
		function g(e) {
			typeof console < "u" && typeof console.warn == "function" && console.warn(e);
		}
	})();
})))()), Mi = /* @__PURE__ */ L(!1), $ = new class {
	constructor(e) {
		if (this.sk = "", this.fetchFn = e || (typeof window < "u" ? fetch.bind(window) : fetch), typeof document < "u") {
			let e = document.querySelector("meta[name=\"csrf-token\"]");
			e && (this.sk = e.content);
		}
	}
	get loading() {
		return G(Mi);
	}
	async request(e, t = {}) {
		R(Mi, !0);
		try {
			let n = new URL(e, window.location.origin);
			t.params && Object.entries(t.params).forEach(([e, t]) => {
				n.searchParams.append(e, String(t));
			});
			let r = new Headers(t.headers || {});
			r.set("X-Requested-With", "fetch");
			let i = t.body;
			t.method && [
				"POST",
				"PUT",
				"PATCH",
				"DELETE"
			].includes(t.method.toUpperCase()) && (i instanceof FormData ? i.set("sk", this.sk) : i && typeof i == "object" && !(i instanceof Blob) && !(i instanceof ArrayBuffer) && (r.set("Content-Type", "application/json"), i = JSON.stringify(i)));
			let a = await this.fetchFn(n.toString(), {
				...t,
				headers: r,
				body: i
			});
			if (!a.ok) throw Error(`API Error: ${a.status} ${a.statusText}`);
			return await a.json();
		} finally {
			R(Mi, !1);
		}
	}
	get(e, t) {
		return this.request(e, {
			method: "GET",
			params: t
		});
	}
	post(e, t) {
		return this.request(e, {
			method: "POST",
			body: t
		});
	}
	get skValue() {
		return this.sk;
	}
}(), Ni = (e, t = x) => {
	var n = Pi(), r = B(n, !0);
	N(n), H(() => {
		ii(n, 1, `status status-${t().status ?? ""}`, "svelte-13s7gu4"), Y(r, t().status);
	}), J(e, n);
}, Pi = /* @__PURE__ */ q("<span> </span>"), Fi = /* @__PURE__ */ q("<time class=\"svelte-13s7gu4\"> </time>"), Ii = /* @__PURE__ */ q("<div class=\"loading-spinner-container svelte-13s7gu4\"><div class=\"loading-spinner svelte-13s7gu4\"></div></div>"), Li = /* @__PURE__ */ q("<tr class=\"svelte-13s7gu4\"><td class=\"svelte-13s7gu4\"> </td><td class=\"date svelte-13s7gu4\"> </td><td class=\"svelte-13s7gu4\"><!></td><td class=\"svelte-13s7gu4\"><div class=\"title svelte-13s7gu4\"> </div> <div class=\"path svelte-13s7gu4\"><a target=\"_blank\" class=\"svelte-13s7gu4\"> </a></div></td><td class=\"small svelte-13s7gu4\"> </td><td class=\"time svelte-13s7gu4\"><!></td><td class=\"time svelte-13s7gu4\"><!></td><td class=\"time svelte-13s7gu4\"><!></td><td class=\"svelte-13s7gu4\"><button class=\"edit-btn svelte-13s7gu4\">編集</button></td></tr>"), Ri = /* @__PURE__ */ q("<div class=\"overlay svelte-13s7gu4\"><div class=\"loading-spinner svelte-13s7gu4\"></div></div>"), zi = /* @__PURE__ */ q("<table class=\"svelte-13s7gu4\"><thead class=\"svelte-13s7gu4\"><tr class=\"svelte-13s7gu4\"><th class=\"svelte-13s7gu4\">ID</th><th class=\"svelte-13s7gu4\">日付</th><th class=\"svelte-13s7gu4\">ステータス</th><th class=\"svelte-13s7gu4\">タイトル / パス</th><th class=\"svelte-13s7gu4\">形式</th><th class=\"svelte-13s7gu4\">作成</th><th class=\"svelte-13s7gu4\">更新</th><th class=\"svelte-13s7gu4\">公開</th><th class=\"svelte-13s7gu4\">操作</th></tr></thead><tbody class=\"svelte-13s7gu4\"></tbody></table> <!>", 1), Bi = /* @__PURE__ */ q("<div class=\"entry-list svelte-13s7gu4\"><div class=\"header svelte-13s7gu4\"><h2 class=\"svelte-13s7gu4\">エントリ一覧</h2> <div class=\"search-box svelte-13s7gu4\"><input type=\"text\" placeholder=\"検索...\" class=\"svelte-13s7gu4\"/> <button class=\"svelte-13s7gu4\">検索</button></div> <div class=\"pagination svelte-13s7gu4\"><button class=\"svelte-13s7gu4\">新しい方へ</button> <button class=\"svelte-13s7gu4\">古い方へ</button></div></div> <div><!></div></div>");
function Vi(e, t) {
	Ke(t, !0);
	let n = (e, t = x, n) => {
		let r = /* @__PURE__ */ zt(() => w(n?.(), !0));
		var i = Fi(), a = B(i, !0);
		N(i), H((e) => {
			Q(i, "datetime", t()), Y(a, e);
		}, [() => G(r) && t() ? d(t()) : "-"]), J(e, i);
	}, r = /* @__PURE__ */ L(z([])), i = /* @__PURE__ */ L(!1), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(z([]));
	async function s() {
		try {
			let e = G(o)[G(o).length - 1], t = { limit: 50 };
			G(a) && (t.q = G(a)), e && (t.cursor_id = e);
			let n = await $.get("/admin/api/entries", t);
			R(r, n.entries || [], !0), R(i, n.has_more || !1, !0);
		} catch (e) {
			console.error(e);
		}
	}
	function c() {
		R(o, [], !0), s();
	}
	ki(s);
	function l() {
		if (G(i) && G(r).length > 0) {
			let e = G(r)[G(r).length - 1];
			G(o).push(e.id), s();
		}
	}
	function u() {
		G(o).length > 0 && (G(o).pop(), s());
	}
	function d(e) {
		return e ? (0, ji.default)("%Y-%m-%d %H:%M", new Date(e)) : "-";
	}
	var f = Bi(), p = B(f), m = V(B(p), 2), h = B(m);
	mi(h);
	var g = V(h, 2);
	N(m);
	var _ = V(m, 2), v = B(_), y = V(v, 2);
	N(_), N(p);
	var b = V(p, 2);
	let S;
	var C = B(b), T = (e) => {
		J(e, Ii());
	}, E = (e) => {
		var i = zi(), a = fn(i), o = V(B(a));
		Z(o, 21, () => G(r), Hr, (e, r) => {
			var i = Li(), a = B(i), o = B(a, !0);
			N(a);
			var s = V(a), c = B(s, !0);
			N(s);
			var l = V(s);
			Ni(B(l), () => G(r)), N(l);
			var u = V(l), d = B(u), f = B(d, !0);
			N(d);
			var p = V(d, 2), m = B(p), h = B(m);
			N(m), N(p), N(u);
			var g = V(u), _ = B(g, !0);
			N(g);
			var v = V(g);
			n(B(v), () => G(r).created_at), N(v);
			var y = V(v);
			n(B(y), () => G(r).modified_at), N(y);
			var b = V(y);
			n(B(b), () => G(r).publish_at?.Time, () => G(r).publish_at?.Valid), N(b);
			var x = V(b), S = B(x);
			N(x), N(i), H(() => {
				Y(o, G(r).id), Y(c, G(r).date), Y(f, G(r).title), Q(m, "href", `/${G(r).path ?? ""}`), Y(h, `/${G(r).path ?? ""}`), Y(_, G(r).format);
			}), K("click", S, () => t.onEdit(G(r).id)), J(e, i);
		}), N(o), N(a);
		var s = V(a, 2), c = (e) => {
			J(e, Ri());
		};
		X(s, (e) => {
			$.loading && e(c);
		}), J(e, i);
	};
	X(C, (e) => {
		$.loading && G(r).length === 0 ? e(T) : e(E, -1);
	}), N(b), N(f), H(() => {
		v.disabled = G(o).length === 0 || $.loading, y.disabled = !G(i) || $.loading, S = ii(b, 1, "table-container svelte-13s7gu4", null, S, { "is-loading": $.loading });
	}), K("keydown", h, (e) => e.key === "Enter" && c()), vi(h, () => G(a), (e) => R(a, e)), K("click", g, c), K("click", v, u), K("click", y, l), J(e, f), qe();
}
Or(["keydown", "click"]);
//#endregion
//#region src/lib/draft.svelte.ts
var Hi = class {
	#e;
	get exists() {
		return G(this.#e);
	}
	set exists(e) {
		R(this.#e, e, !0);
	}
	#t;
	get data() {
		return G(this.#t);
	}
	set data(e) {
		R(this.#t, e, !0);
	}
	constructor(e = typeof localStorage < "u" ? localStorage : null) {
		this.storage = e, this.timer = null, this.#e = /* @__PURE__ */ L(!1), this.#t = /* @__PURE__ */ L(null);
	}
	key(e) {
		return `nogag-backup-${e || "new"}`;
	}
	check(e, t) {
		if (!this.storage) return;
		let n = this.storage.getItem(this.key(e));
		if (n) try {
			let e = JSON.parse(n);
			(e.title !== t.title || e.body !== t.body) && (this.exists = !0, this.data = e);
		} catch (e) {
			console.error("Failed to parse backup", e);
		}
	}
	saveDebounced(e, t, n = 1e3) {
		this.timer && clearTimeout(this.timer), this.timer = setTimeout(() => {
			this.save(e, t);
		}, n);
	}
	save(e, t) {
		if (!this.storage) return;
		let n = {
			title: t.title,
			body: t.body,
			time: Date.now()
		};
		this.storage.setItem(this.key(e), JSON.stringify(n)), this.exists = !1;
	}
	clear(e) {
		this.storage && (this.storage.removeItem(this.key(e)), this.exists = !1, this.data = null);
	}
}, Ui = "public", Wi = "draft", Gi = "scheduled", Ki = "reserved", qi = Ui, Ji = Wi, Yi = Gi, Xi = Ki, Zi = /* @__PURE__ */ q("<div class=\"loading-spinner-container svelte-7nstam\"><div class=\"loading-spinner svelte-7nstam\"></div></div>"), Qi = /* @__PURE__ */ q("<option class=\"svelte-7nstam\"> </option>"), $i = /* @__PURE__ */ q("<div class=\"progress-bar svelte-7nstam\" style=\"width: 100%\"></div>"), ea = /* @__PURE__ */ q("<input type=\"datetime-local\" class=\"datetime-input svelte-7nstam\"/>"), ta = /* @__PURE__ */ q("<button id=\"restore\" type=\"button\" class=\"submit-button restore-button svelte-7nstam\">復元...</button>"), na = /* @__PURE__ */ q("<div role=\"option\" tabindex=\"-1\"> </div>"), ra = /* @__PURE__ */ q("<div class=\"preview-overlay svelte-7nstam\"><div class=\"preview-progress-container svelte-7nstam\"><div class=\"preview-progress-bar svelte-7nstam\"></div> <div class=\"preview-progress-text svelte-7nstam\">読み込み中...</div></div></div>"), ia = /* @__PURE__ */ q("<span class=\"tag svelte-7nstam\"> </span>"), aa = /* @__PURE__ */ q("<div role=\"button\" tabindex=\"-1\"><div class=\"result-title svelte-7nstam\"><!> <!> <button type=\"button\" class=\"open-result-button svelte-7nstam\" title=\"別タブで開く\">↗️</button></div> <div class=\"result-summary svelte-7nstam\"></div> <div class=\"result-meta svelte-7nstam\"><span class=\"result-date svelte-7nstam\"> </span> <span class=\"result-path svelte-7nstam\"> </span></div></div>"), oa = /* @__PURE__ */ q("<div class=\"no-results svelte-7nstam\">結果が見つかりません</div>"), sa = /* @__PURE__ */ q("<div class=\"container svelte-7nstam\"><div class=\"main svelte-7nstam\"><input id=\"title\" type=\"text\" placeholder=\"タイトル\" class=\"svelte-7nstam\"/> <div class=\"toolbar svelte-7nstam\"><button type=\"button\" class=\"svelte-7nstam\">🏷️ タグ</button> <button type=\"button\" class=\"svelte-7nstam\">🔗 リンク</button> <button type=\"button\" class=\"svelte-7nstam\"> </button> <span class=\"char-count svelte-7nstam\"> </span> <select class=\"format-select svelte-7nstam\"></select></div> <div class=\"body-container svelte-7nstam\"><textarea id=\"body\" placeholder=\"本文\" required=\"\" class=\"svelte-7nstam\"></textarea></div></div> <div class=\"global-actions svelte-7nstam\"><!> <div class=\"buttons footer-container svelte-7nstam\"><div class=\"status-selector svelte-7nstam\"><label class=\"status-option svelte-7nstam\" title=\"非公開のまま保存します\"><input type=\"radio\" class=\"svelte-7nstam\"/> <div class=\"status-content svelte-7nstam\"><span class=\"label-text svelte-7nstam\">下書き</span></div></label> <label class=\"status-option svelte-7nstam\" title=\"今すぐ公開し、URLを確定させます\"><input type=\"radio\" class=\"svelte-7nstam\"/> <div class=\"status-content svelte-7nstam\"><span class=\"label-text svelte-7nstam\">公開</span></div></label> <label class=\"status-option svelte-7nstam\" title=\"指定した日時に公開します。URLは今すぐ確定します。\"><input type=\"radio\" class=\"svelte-7nstam\"/> <div class=\"status-content svelte-7nstam\"><span class=\"label-text svelte-7nstam\">公開を遅延</span> <span class=\"description svelte-7nstam\">URL確定</span></div></label> <label class=\"status-option svelte-7nstam\" title=\"指定した日付を投稿日として予約します。公開されるまでURLは確定しません。\"><input type=\"radio\" class=\"svelte-7nstam\"/> <div class=\"status-content svelte-7nstam\"><span class=\"label-text svelte-7nstam\">予約投稿</span> <span class=\"description svelte-7nstam\">URL未定</span></div></label></div> <div class=\"action-row-container svelte-7nstam\"><div class=\"footer-left svelte-7nstam\"><button type=\"button\" class=\"submit-button svelte-7nstam\"><!></button> <!></div> <div class=\"footer-right svelte-7nstam\"><!> <button type=\"button\" class=\"submit-button preview-button svelte-7nstam\">プレビュー</button></div></div></div></div></div> <dialog id=\"tagDialog\" class=\"svelte-7nstam\"><h3 class=\"svelte-7nstam\">タグを選択</h3> <div class=\"tag-list svelte-7nstam\" role=\"listbox\" aria-label=\"タグを選択\" tabindex=\"0\"></div> <button type=\"button\" style=\"margin-top: 16px;\" class=\"svelte-7nstam\">キャンセル</button></dialog> <dialog id=\"restoreDialog\" class=\"svelte-7nstam\"><h3 class=\"svelte-7nstam\">自動バックアップの復元</h3> <p class=\"svelte-7nstam\"><!> に保存されたバックアップを復元しますか?</p> <div style=\"display: flex; gap: 8px; justify-content: flex-end;\" class=\"svelte-7nstam\"><button type=\"button\" class=\"svelte-7nstam\">キャンセル</button> <button type=\"button\" class=\"submit-button svelte-7nstam\">復元</button></div></dialog> <dialog id=\"previewDialog\" class=\"svelte-7nstam\"><div class=\"preview-header svelte-7nstam\"><h3 class=\"svelte-7nstam\">プレビュー</h3> <button type=\"button\" class=\"close-button svelte-7nstam\">閉じる</button></div> <div class=\"preview-body svelte-7nstam\"><!> <iframe name=\"preview-iframe\" title=\"Preview\" class=\"svelte-7nstam\"></iframe></div></dialog> <dialog id=\"searchDialog\" class=\"search-dialog svelte-7nstam\"><div class=\"search-header svelte-7nstam\"><h3 class=\"svelte-7nstam\">過去日記を検索</h3> <button type=\"button\" class=\"close-button svelte-7nstam\">閉じる</button></div> <div class=\"search-body svelte-7nstam\"><input type=\"search\" placeholder=\"キーワードを入力...\" class=\"search-input svelte-7nstam\"/> <div class=\"search-results svelte-7nstam\"></div></div> <div class=\"dialog-footer svelte-7nstam\"><button type=\"button\" class=\"svelte-7nstam\">キャンセル</button></div></dialog>", 1);
function ca(e, t) {
	Ke(t, !0);
	let n = [], r = Oi(t, "id", 3, null), i = new Hi(), a = /* @__PURE__ */ L(z({
		id: void 0,
		title: "",
		body: "",
		status: ""
	})), o = z({
		id: null,
		title: "",
		body: "",
		format: "Hatena",
		status: qi,
		publishAt: ""
	}), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(!1), u = /* @__PURE__ */ L(!0), d = /* @__PURE__ */ L(!1), f = /* @__PURE__ */ L(null), p = /* @__PURE__ */ L(null), m = /* @__PURE__ */ L(null), h = /* @__PURE__ */ L(null), g = /* @__PURE__ */ L(null), _ = /* @__PURE__ */ L(null), v = /* @__PURE__ */ L(null), y = [
		"tech",
		"photo",
		"redeveloped",
		"stablediffusion",
		"photoshopped"
	], b = /* @__PURE__ */ L(0), x = /* @__PURE__ */ L(""), S = /* @__PURE__ */ L(z([])), C = /* @__PURE__ */ L(0), w = /* @__PURE__ */ L(null), T = z([]);
	async function E(e) {
		try {
			R(u, !0);
			let t = await $.get(`/admin/api/entry/${e}`);
			R(a, t, !0), o.id = t.id, o.title = t.title ?? "", o.body = t.body ?? "", o.format = t.format || "Hatena", o.status = t.status, t.publish_at?.Valid ? o.publishAt = (0, ji.default)("%Y-%m-%dT%H:%M", new Date(t.publish_at.Time)) : o.publishAt = (0, ji.default)("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), i.check(G(a).id ?? null, {
				title: o.title,
				body: o.body
			});
		} catch (e) {
			console.error(e), alert("エントリの取得に失敗しました");
		} finally {
			R(u, !1);
		}
	}
	ki(() => {
		r() ? E(r()) : (R(a, {
			id: void 0,
			title: "",
			body: "",
			status: qi
		}, !0), o.id = null, o.title = "", o.body = "", o.format = "Hatena", o.status = qi, o.publishAt = (0, ji.default)("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), i.check(null, {
			title: o.title,
			body: o.body
		}), R(u, !1));
	}), Dn(() => {
		(G(a).title !== o.title || G(a).body !== o.body) && i.saveDebounced(G(a).id ?? null, {
			title: o.title,
			body: o.body
		});
	});
	async function D() {
		R(s, !0), R(c, "リクエスト中");
		let e = new FormData();
		if (e.set("id", o.id ? String(o.id) : ""), e.set("title", o.title), e.set("body", o.body), e.set("format", o.format), o.status === Yi || o.status === Xi) {
			let t = new Date(o.publishAt);
			e.set("publish_at", t.toISOString());
		}
		e.set("status", o.status);
		try {
			let t = (await $.post("/admin/api/edit", e)).session_id;
			if (!t) throw Error("保存に失敗しました");
			O(t);
		} catch (e) {
			R(s, !1), alert(e instanceof Error ? e.message : "エラーが発生しました");
		}
	}
	function O(e) {
		let n = new EventSource(`/admin/api/edit/progress?sid=${e}`);
		n.onmessage = (e) => {
			let r = JSON.parse(e.data);
			switch (r.type) {
				case "progress":
					R(c, ee(r.message), !0);
					break;
				case "done":
					i.clear(G(a).id ?? null), R(c, "完了"), R(s, !1), n.close(), t.onSave(r.location);
					break;
				case "error":
					R(c, "エラー: " + r.message), R(s, !1), n.close(), alert("保存に失敗しました: " + r.message);
					break;
			}
		}, n.onerror = () => {
			R(s, !1), n.close(), alert("通信エラーが発生しました");
		};
	}
	function ee(e) {
		return {
			saving: "保存中",
			"update-similar-entries": "関連エントリを構築中",
			"posting-new-job": "ジョブを投入中",
			done: "完了"
		}[e] || e;
	}
	function te() {
		R(b, 0), G(m).showModal(), setTimeout(() => G(v)?.focus(), 0);
	}
	function ne(e) {
		e.key === "ArrowDown" ? (e.preventDefault(), R(b, (G(b) + 1) % y.length)) : e.key === "ArrowUp" ? (e.preventDefault(), R(b, (G(b) - 1 + y.length) % y.length)) : e.key === "Enter" || e.key === " " ? (e.preventDefault(), re(y[G(b)])) : e.key === "Escape" && G(m).close();
	}
	function re(e) {
		let t = `[${e}]`;
		o.title.includes(t) ? o.title = o.title.replace(t, "") : o.title = t + o.title, G(m).close(), G(f).focus();
	}
	function ie() {
		R(x, ""), R(S, [], !0), R(C, 0), G(_).showModal(), setTimeout(() => G(w)?.focus(), 0);
	}
	async function ae(e) {
		if (!(e instanceof KeyboardEvent && e.key === "Enter")) {
			if (G(x).length < 2) {
				R(S, [], !0);
				return;
			}
			try {
				R(S, (await $.get("/api/search", { q: G(x) })).results || [], !0), R(C, 0);
			} catch (e) {
				console.error(e);
			}
		}
	}
	function oe(e) {
		e.key === "ArrowDown" || e.ctrlKey && e.key === "n" ? (e.preventDefault(), R(C, (G(C) + 1) % G(S).length), T[G(C)]?.scrollIntoView({ block: "nearest" })) : e.key === "ArrowUp" || e.ctrlKey && e.key === "p" ? (e.preventDefault(), R(C, (G(C) - 1 + G(S).length) % G(S).length), T[G(C)]?.scrollIntoView({ block: "nearest" })) : e.key === "Enter" ? (e.preventDefault(), G(S)[G(C)] && (e.shiftKey || e.metaKey || e.ctrlKey ? se(G(S)[G(C)]) : ce(G(S)[G(C)]))) : e.key === "Escape" && G(_).close();
	}
	function se(e) {
		let t = e.path.startsWith("http") ? e.path : `${location.origin}/${e.path}`;
		window.open(t, "_blank");
	}
	function ce(e) {
		let t = e.path.startsWith("http") ? e.path : `${location.origin}/${e.path}`, n = "";
		switch (o.format) {
			case "Hatena":
				n = `[${t}:title=${e.title}]`;
				break;
			case "Markdown":
				n = `[${e.title}](${t})`;
				break;
			case "HTML":
				n = `<a href="${t}">${e.title}</a>`;
				break;
			case "tDiary":
				n = `[[${e.title}|${t}]]`;
				break;
			default: n = t;
		}
		de(n), G(_).close(), G(p).focus();
	}
	function le() {
		i.data && (o.title = i.data.title, o.body = i.data.body, i.clear(G(a).id ?? null), G(h).close());
	}
	async function ue() {
		let e = document.createElement("input");
		e.type = "file", e.oninput = async () => {
			if (!e.files?.[0]) return;
			let t = new FormData();
			t.append("file", e.files[0]), R(l, !0);
			try {
				let e = await $.post("/admin/api/upload/image", t), n = "";
				n = e.uploaded.toLowerCase().endsWith(".webm") ? `<video src="${e.uploaded}" autoplay loop muted playsinline style="max-width: 100%; height: auto;"></video>\n` : `<span itemscope itemtype="http://schema.org/Photograph"><a href="${e.uploaded}" class="picasa" itemprop="url"><img src="${e.uploaded}" alt="photo" itemprop="image"/></a></span>\n`, de(n, !0);
			} catch {
				alert("アップロードに失敗しました");
			} finally {
				R(l, !1);
			}
		}, e.click();
	}
	function de(e, t = !1) {
		let n = G(p).selectionStart, r = G(p).selectionEnd, i = G(p).value;
		o.body = i.substring(0, n) + e + i.substring(r), gr().then(() => {
			typeof t == "boolean" && t ? (G(p).selectionStart = n, G(p).selectionEnd = n + e.length) : typeof t == "number" ? G(p).selectionStart = G(p).selectionEnd = n + t : G(p).selectionStart = G(p).selectionEnd = n + e.length, G(p).focus();
		});
	}
	function fe(e) {
		let t = (e.altKey ? "Alt-" : "") + (e.ctrlKey ? "Control-" : "") + (e.metaKey ? "Meta-" : "") + (e.shiftKey ? "Shift-" : "") + e.key;
		t === "Control-t" ? (de("\\(  \\)", 3), e.preventDefault(), e.stopPropagation()) : (t === "Control-l" || t === "Meta-l") && (ie(), e.preventDefault(), e.stopPropagation());
	}
	function pe() {
		G(g).showModal();
		let e = document.getElementsByName("preview-iframe")[0];
		e && (e.src = "about:blank"), setTimeout(() => {
			R(d, !0);
		}, 0);
		let t = document.createElement("form");
		t.method = "POST", t.action = "/admin/api/preview", t.target = "preview-iframe";
		let n = {
			title: o.title,
			body: o.body,
			format: o.format,
			sk: $.skValue
		};
		for (let [e, r] of Object.entries(n)) {
			let n = document.createElement("input");
			n.type = "hidden", n.name = e, n.value = r, t.appendChild(n);
		}
		document.body.appendChild(t), t.submit(), document.body.removeChild(t);
	}
	function me() {
		R(d, !1), G(g).close();
	}
	function he(e) {
		let t = document.createElement("p");
		return t.textContent = e, t.innerHTML;
	}
	function ge(e, t) {
		if (!t) return he(e);
		let n = he(e), r = t.split(/\s+/).filter((e) => e.length >= 2);
		if (r.length === 0) return n;
		let i = r.map((e) => e.replace(/[.*+?^${}()|[\\]/g, "\\$&")).join("|"), a = RegExp(`(${i})`, "gi");
		return n.replace(a, "<mark>$1</mark>");
	}
	function _e(e) {
		let t = new DOMParser().parseFromString(e, "text/html");
		t.querySelectorAll("script, style, noscript, iframe").forEach((e) => e.remove());
		let n = t.body.textContent || "";
		return n.replace(/\s+/g, " ").trim().substring(0, 200) + (n.length > 200 ? "..." : "");
	}
	var ve = Ir(), ye = fn(ve), be = (e) => {
		J(e, Zi());
	}, xe = (e) => {
		var t = sa(), a = fn(t), u = B(a), E = B(u);
		mi(E), Ti(E, (e) => R(f, e), () => G(f));
		var O = V(E, 2), ee = B(O), de = V(ee, 2), he = V(de, 2), ve = B(he, !0);
		N(he);
		var ye = V(he, 2), be = B(ye);
		N(ye);
		var xe = V(ye, 2);
		Z(xe, 20, () => [
			"Hatena",
			"Markdown",
			"HTML",
			"tDiary"
		], Hr, (e, t) => {
			var n = Qi(), r = B(n, !0);
			N(n);
			var i = {};
			H(() => {
				Y(r, t), i !== (i = t) && (n.value = (n.__value = t) ?? "");
			}), J(e, n);
		}), N(xe), N(O);
		var Se = V(O, 2), Ce = B(Se);
		_n(Ce), Ti(Ce, (e) => R(p, e), () => G(p)), N(Se), N(u);
		var we = V(u, 2), Te = B(we), Ee = (e) => {
			J(e, $i());
		};
		X(Te, (e) => {
			G(s) && e(Ee);
		});
		var De = V(Te, 2), Oe = B(De), k = B(Oe), ke = B(k);
		mi(ke);
		var Ae;
		Le(2), N(k);
		var je = V(k, 2), Me = B(je);
		mi(Me);
		var Ne;
		Le(2), N(je);
		var Pe = V(je, 2), A = B(Pe);
		mi(A);
		var Fe;
		Le(2), N(Pe);
		var j = V(Pe, 2), M = B(j);
		mi(M);
		var Ie;
		Le(2), N(j), N(Oe);
		var Re = V(Oe, 2), ze = B(Re), Be = B(ze), Ve = B(Be), He = (e) => {
			var t = Fr();
			H(() => Y(t, G(c) || "リクエスト中")), J(e, t);
		}, Ue = (e) => {
			J(e, Fr("下書き保存"));
		}, We = (e) => {
			var t = Fr();
			H(() => Y(t, r() ? "更新する" : "公開する")), J(e, t);
		}, P = (e) => {
			J(e, Fr("予約する"));
		};
		X(Ve, (e) => {
			G(s) ? e(He) : o.status === Ji ? e(Ue, 1) : o.status === qi ? e(We, 2) : e(P, -1);
		}), N(Be);
		var Ge = V(Be, 2), Ke = (e) => {
			var t = ea();
			mi(t), vi(t, () => o.publishAt, (e) => o.publishAt = e), J(e, t);
		};
		X(Ge, (e) => {
			(o.status === Yi || o.status === Xi) && e(Ke);
		}), N(ze);
		var qe = V(ze, 2), Je = B(qe), Ye = (e) => {
			var t = ta();
			K("click", t, () => G(h).showModal()), J(e, t);
		};
		X(Je, (e) => {
			i.exists && e(Ye);
		});
		var Xe = V(Je, 2);
		N(qe), N(Re), N(De), N(we), N(a);
		var Ze = V(a, 2), Qe = V(B(Ze), 2);
		Z(Qe, 21, () => y, Hr, (e, t, n) => {
			var r = na();
			let i;
			var a = B(r, !0);
			N(r), H(() => {
				i = ii(r, 1, "tag-item svelte-7nstam", null, i, { selected: G(b) === n }), Q(r, "aria-selected", G(b) === n), Y(a, G(t));
			}), K("click", r, () => re(G(t))), Dr("mouseenter", r, () => R(b, n, !0)), K("keydown", r, (e) => e.key === "Enter" && re(G(t))), J(e, r);
		}), N(Qe), Ti(Qe, (e) => R(v, e), () => G(v));
		var $e = V(Qe, 2);
		N(Ze), Ti(Ze, (e) => R(m, e), () => G(m));
		var et = V(Ze, 2), tt = V(B(et), 2), F = B(tt), nt = (e) => {
			var t = Fr();
			H((e) => Y(t, e), [() => (0, ji.default)("%Y年%m月%d日%H時", new Date(i.data.time))]), J(e, t);
		};
		X(F, (e) => {
			i.data?.time && e(nt);
		}), Le(), N(tt);
		var rt = V(tt, 2), it = B(rt), at = V(it, 2);
		N(rt), N(et), Ti(et, (e) => R(h, e), () => G(h));
		var ot = V(et, 2), st = B(ot), ct = V(B(st), 2);
		N(st);
		var I = V(st, 2), lt = B(I), ut = (e) => {
			J(e, ra());
		};
		X(lt, (e) => {
			G(d) && e(ut);
		});
		var dt = V(lt, 2);
		N(I), N(ot), Ti(ot, (e) => R(g, e), () => G(g));
		var ft = V(ot, 2), pt = B(ft), mt = V(B(pt), 2);
		N(pt);
		var ht = V(pt, 2), gt = B(ht);
		mi(gt), Ti(gt, (e) => R(w, e), () => G(w));
		var _t = V(gt, 2);
		Z(_t, 21, () => G(S), Hr, (e, t, n) => {
			var r = aa();
			let i;
			var a = B(r), o = B(a);
			Zr(o, () => ge(G(t).title, G(x)));
			var s = V(o, 2);
			Z(s, 17, () => G(t).tags, Hr, (e, t) => {
				var n = ia(), r = B(n, !0);
				N(n), H(() => Y(r, G(t))), J(e, n);
			});
			var c = V(s, 2);
			N(a);
			var l = V(a, 2);
			Zr(l, () => ge(_e(G(t).formatted_body), G(x)), !0), N(l);
			var u = V(l, 2), d = B(u), f = B(d, !0);
			N(d);
			var p = V(d, 2), m = B(p, !0);
			N(p), N(u), N(r), Ti(r, (e, t) => T[t] = e, (e) => T?.[e], () => [n]), H(() => {
				i = ii(r, 1, "search-result-item svelte-7nstam", null, i, { selected: G(C) === n }), Y(f, G(t).date), Y(m, G(t).path);
			}), K("click", r, () => ce(G(t))), Dr("mouseenter", r, () => R(C, n, !0)), K("keydown", r, (e) => e.key === "Enter" && ce(G(t))), K("click", c, (e) => {
				e.stopPropagation(), se(G(t));
			}), J(e, r);
		}, (e) => {
			var t = Ir(), n = fn(t), r = (e) => {
				J(e, oa());
			};
			X(n, (e) => {
				G(x).length >= 2 && e(r);
			}), J(e, t);
		}), N(_t), N(ht);
		var vt = V(ht, 2), yt = B(vt);
		N(vt), N(ft), Ti(ft, (e) => R(_, e), () => G(_)), H(() => {
			he.disabled = G(l), Y(ve, G(l) ? "⌛ アップロード中..." : "📷 写真"), Y(be, `${(o.body ?? "").length ?? ""} 文字`), Ae !== (Ae = Ji) && (ke.value = (ke.__value = Ji) ?? ""), Ne !== (Ne = qi) && (Me.value = (Me.__value = qi) ?? ""), Fe !== (Fe = Yi) && (A.value = (A.__value = Yi) ?? ""), Ie !== (Ie = Xi) && (M.value = (M.__value = Xi) ?? ""), Be.disabled = G(s), Xe.disabled = G(s);
		}), vi(E, () => o.title, (e) => o.title = e), K("click", ee, te), K("click", de, ie), K("click", he, ue), li(xe, () => o.format, (e) => o.format = e), K("keydown", Ce, fe), vi(Ce, () => o.body, (e) => o.body = e), bi(n, [], ke, () => o.status, (e) => o.status = e), bi(n, [], Me, () => o.status, (e) => o.status = e), bi(n, [], A, () => o.status, (e) => o.status = e), bi(n, [], M, () => o.status, (e) => o.status = e), K("click", Be, D), K("click", Xe, pe), K("keydown", Qe, ne), K("click", $e, () => G(m).close()), K("click", it, () => G(h).close()), K("click", at, le), K("click", ct, me), Dr("load", dt, () => {
			G(d) && R(d, !1);
		}), Dr("error", dt, () => {
			R(d, !1), alert("プレビューの読み込みに失敗しました");
		}), Tr(dt), K("click", mt, () => G(_).close()), K("input", gt, (e) => ae(e)), K("keydown", gt, oe), vi(gt, () => G(x), (e) => R(x, e)), K("click", yt, () => G(_).close()), J(e, t);
	};
	X(ye, (e) => {
		G(u) ? e(be) : e(xe, -1);
	}), J(e, ve), qe();
}
Or([
	"click",
	"keydown",
	"input"
]);
//#endregion
//#region src/components/JobList.svelte
var la = (e, t = x) => {
	var n = ua(), r = B(n, !0);
	N(n), H(() => {
		ii(n, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), Y(r, t());
	}), J(e, n);
}, ua = /* @__PURE__ */ q("<span> </span>"), da = /* @__PURE__ */ q("<time class=\"time svelte-1r6codn\"> </time>"), fa = /* @__PURE__ */ q("<span class=\"dep-type svelte-1r6codn\"> </span>"), pa = /* @__PURE__ */ q("<button><span class=\"dep-id svelte-1r6codn\"> </span> <!> <span class=\"dep-cond svelte-1r6codn\"> </span></button>"), ma = /* @__PURE__ */ q("<div class=\"loading svelte-1r6codn\"></div>"), ha = /* @__PURE__ */ q("<span class=\"uniqkey svelte-1r6codn\"> </span>"), ga = /* @__PURE__ */ q("<div class=\"depends-on svelte-1r6codn\"><div class=\"strategy svelte-1r6codn\"> </div> <div class=\"dep-list svelte-1r6codn\"></div></div>"), _a = /* @__PURE__ */ q("<div class=\"error-text svelte-1r6codn\"> </div>"), va = /* @__PURE__ */ q("<tr><td class=\"svelte-1r6codn\"> </td><td class=\"svelte-1r6codn\"><div class=\"type-uniqkey svelte-1r6codn\"><strong class=\"svelte-1r6codn\"> </strong> <!></div></td><td class=\"svelte-1r6codn\"><!></td><td class=\"svelte-1r6codn\"> </td><td class=\"svelte-1r6codn\"><!></td><td class=\"svelte-1r6codn\"><!></td><td class=\"svelte-1r6codn\"><!></td><td class=\"error svelte-1r6codn\"><!></td></tr>"), ya = /* @__PURE__ */ q("<table class=\"svelte-1r6codn\"><thead class=\"svelte-1r6codn\"><tr class=\"svelte-1r6codn\"><th class=\"svelte-1r6codn\">ID</th><th class=\"svelte-1r6codn\">Type / Uniqkey</th><th class=\"svelte-1r6codn\">Status</th><th class=\"svelte-1r6codn\">Retry</th><th class=\"svelte-1r6codn\">Created At</th><th class=\"svelte-1r6codn\">Finished At</th><th class=\"svelte-1r6codn\">Depends On</th><th class=\"svelte-1r6codn\">Error</th></tr></thead><tbody class=\"svelte-1r6codn\"></tbody></table>"), ba = /* @__PURE__ */ q("<div class=\"job-list svelte-1r6codn\"><div class=\"header svelte-1r6codn\"><h2 class=\"svelte-1r6codn\"> </h2> <div class=\"pagination svelte-1r6codn\"><button class=\"svelte-1r6codn\">新しい方へ</button> <span class=\"svelte-1r6codn\"> </span> <button class=\"svelte-1r6codn\">古い方へ</button> <button class=\"refresh-btn svelte-1r6codn\" style=\"margin-left: 10px;\">更新</button></div></div> <!></div>");
function xa(e, t) {
	Ke(t, !0);
	let n = (e, t = x, n) => {
		let r = /* @__PURE__ */ zt(() => w(n?.(), !0));
		var i = da(), a = B(i, !0);
		N(i), H((e) => {
			Q(i, "datetime", t()), Y(a, e);
		}, [() => G(r) && t() ? m(t()) : "-"]), J(e, i);
	}, r = (e, t = x, n = x) => {
		let r = /* @__PURE__ */ Rt(() => l(t()));
		var i = pa(), a = B(i), o = B(a);
		N(a);
		var s = V(a, 2), c = (e) => {
			var t = fa(), n = B(t, !0);
			N(t), H(() => Y(n, G(r).job_type_name)), J(e, t);
		};
		X(s, (e) => {
			G(r) && e(c);
		});
		var d = V(s, 2), f = B(d, !0);
		N(d), N(i), H(() => {
			ii(i, 1, `dep-chip status-${(G(r)?.status || "unknown") ?? ""}`, "svelte-1r6codn"), Y(o, `#${t() ?? ""}`), Q(d, "title", `Condition: ${n() ?? ""}`), Y(f, n() === "completed" ? "✅" : "🏁");
		}), K("click", i, () => u(t())), J(e, i);
	}, i = /* @__PURE__ */ L(z([])), a = /* @__PURE__ */ L(0), o = /* @__PURE__ */ L(0), s = /* @__PURE__ */ L(null);
	function c(e) {
		if (!e.depends_on?.Valid || !e.depends_on.String || e.depends_on.String === "null") return null;
		try {
			let t = JSON.parse(e.depends_on.String);
			return !t || typeof t != "object" || !Array.isArray(t.dependencies) ? null : t;
		} catch {
			return null;
		}
	}
	function l(e) {
		return G(i).find((t) => t.id === e);
	}
	function u(e) {
		let t = document.getElementById(`job-${e}`);
		t && (t.scrollIntoView({
			behavior: "smooth",
			block: "center"
		}), R(s, e, !0), setTimeout(() => {
			G(s) === e && R(s, null);
		}, 2e3));
	}
	async function d() {
		try {
			let e = await $.get("/admin/api/jobs", {
				limit: 50,
				offset: G(o)
			});
			R(i, e.jobs || [], !0), R(a, e.total || 0, !0);
		} catch (e) {
			console.error(e);
		}
	}
	ki(d);
	function f() {
		G(o) + 50 < G(a) && (R(o, G(o) + 50), d());
	}
	function p() {
		G(o) - 50 >= 0 && (R(o, G(o) - 50), d());
	}
	function m(e) {
		return (0, ji.default)("%Y-%m-%d %H:%M:%S", new Date(e));
	}
	var h = ba(), g = B(h), _ = B(g), v = B(_);
	N(_);
	var y = V(_, 2), b = B(y), S = V(b, 2), C = B(S);
	N(S);
	var T = V(S, 2), E = V(T, 2);
	N(y), N(g);
	var D = V(g, 2), O = (e) => {
		J(e, ma());
	}, ee = (e) => {
		var t = ya(), a = V(B(t));
		Z(a, 21, () => G(i), Hr, (e, t) => {
			var i = va();
			let a;
			var o = B(i), l = B(o, !0);
			N(o);
			var u = V(o), d = B(u), f = B(d), p = B(f, !0);
			N(f);
			var m = V(f, 2), h = (e) => {
				var n = ha(), r = B(n, !0);
				N(n), H(() => {
					Q(n, "title", G(t).uniqkey.String), Y(r, G(t).uniqkey.String);
				}), J(e, n);
			};
			X(m, (e) => {
				G(t).uniqkey?.Valid && e(h);
			}), N(d), N(u);
			var g = V(u);
			la(B(g), () => G(t).status), N(g);
			var _ = V(g), v = B(_, !0);
			N(_);
			var y = V(_);
			n(B(y), () => G(t).created_at), N(y);
			var b = V(y);
			n(B(b), () => G(t).finished_at.Time, () => G(t).finished_at.Valid), N(b);
			var x = V(b), S = B(x), C = (e) => {
				let n = /* @__PURE__ */ Rt(() => c(G(t)));
				var i = ga(), a = B(i), o = B(a, !0);
				N(a);
				var s = V(a, 2);
				Z(s, 21, () => G(n).dependencies, Hr, (e, t) => {
					r(e, () => G(t).id, () => G(t).condition);
				}), N(s), N(i), H((e) => Y(o, e), [() => (G(n).strategy || "all").toUpperCase()]), J(e, i);
			}, w = /* @__PURE__ */ Rt(() => c(G(t))), T = (e) => {
				J(e, Fr("-"));
			};
			X(S, (e) => {
				G(w) ? e(C) : e(T, -1);
			}), N(x);
			var E = V(x), D = B(E), O = (e) => {
				var n = _a(), r = B(n, !0);
				N(n), H(() => {
					Q(n, "title", G(t).error_message.String), Y(r, G(t).error_message.String);
				}), J(e, n);
			};
			X(D, (e) => {
				G(t).error_message?.Valid && e(O);
			}), N(E), N(i), H(() => {
				Q(i, "id", `job-${G(t).id ?? ""}`), a = ii(i, 1, "svelte-1r6codn", null, a, { highlighted: G(s) === G(t).id }), Y(l, G(t).id), Y(p, G(t).job_type_name), Y(v, G(t).retry_count);
			}), J(e, i);
		}), N(a), N(t), J(e, t);
	};
	X(D, (e) => {
		$.loading && G(i).length === 0 ? e(O) : e(ee, -1);
	}), N(h), H((e) => {
		Y(v, `ジョブ一覧 (${G(a) ?? ""})`), b.disabled = G(o) === 0 || $.loading, Y(C, `${G(o) + 1} - ${e ?? ""} / ${G(a) ?? ""}`), T.disabled = G(o) + 50 >= G(a) || $.loading;
	}, [() => Math.min(G(o) + 50, G(a))]), K("click", b, p), K("click", T, f), K("click", E, d), J(e, h), qe();
}
Or(["click"]);
//#endregion
//#region src/components/ColorBitmask.svelte
var Sa = /* @__PURE__ */ q("<div class=\"empty svelte-wpgtu6\">No Signature</div>"), Ca = /* @__PURE__ */ q("<div></div>"), wa = /* @__PURE__ */ q("<div class=\"row svelte-wpgtu6\"></div>"), Ta = /* @__PURE__ */ q("<div class=\"chroma-section svelte-wpgtu6\"></div>"), Ea = /* @__PURE__ */ q("<div class=\"chroma-sections svelte-wpgtu6\"></div>"), Da = /* @__PURE__ */ q("<div class=\"color-bitmask svelte-wpgtu6\"><!></div>");
function Oa(e, t) {
	Ke(t, !0);
	let n = Oi(t, "size", 3, 64), r = /* @__PURE__ */ Rt(() => {
		if (!t.sig) return Array(64).fill(!1);
		try {
			let e = atob(t.sig), n = new Uint8Array(e.length);
			for (let t = 0; t < e.length; t++) n[t] = e.charCodeAt(t);
			let r = [];
			for (let e = 0; e < 8; e++) {
				let t = n[e];
				for (let e = 7; e >= 0; e--) r.push((t >> e & 1) == 1);
			}
			return r.reverse();
		} catch (e) {
			return console.error("Failed to decode sig:", e), Array(64).fill(!1);
		}
	});
	function i(e) {
		let t = e >> 5 & 1, n = e >> 4 & 1, r = e >> 3 & 1, i = e >> 2 & 1, a = e >> 1 & 1, o = e & 1, s = n << 1 | i, c = t << 2 | r << 1 | a, l = o;
		return `oklch(${[
			25,
			45,
			65,
			85
		][s]}% ${l === 0 ? .01 : .15} ${c * 45})`;
	}
	function a(e, t, n) {
		let r = e >> 1 & 1, i = e & 1, a = t >> 2 & 1, o = t >> 1 & 1, s = t & 1, c = n & 1;
		return a << 5 | r << 4 | o << 3 | i << 2 | s << 1 | c;
	}
	var o = Da(), s = B(o), c = (e) => {
		J(e, Sa());
	}, l = (e) => {
		var t = Ea();
		Z(t, 20, () => [1, 0], Hr, (e, t) => {
			var n = Ta();
			Z(n, 20, () => [
				3,
				2,
				1,
				0
			], Hr, (e, n) => {
				var o = wa();
				Z(o, 20, () => [
					0,
					1,
					2,
					3,
					4,
					5,
					6,
					7
				], Hr, (e, o) => {
					let s = /* @__PURE__ */ Rt(() => a(n, o, t));
					var c = Ca();
					let l;
					H((e) => {
						l = ii(c, 1, "bit svelte-wpgtu6", null, l, { active: G(r)[G(s)] }), oi(c, `background-color: ${e ?? ""}`), Q(c, "title", `L=${n ?? ""} H=${o * 45} C=${t ?? ""}`);
					}, [() => i(G(s))]), J(e, c);
				}), N(o), J(e, o);
			}), N(n), H(() => Q(n, "title", t === 1 ? "Vivid Colors" : "Muted Colors")), J(e, n);
		}), N(t), J(e, t);
	};
	X(s, (e) => {
		t.sig ? e(l, -1) : e(c);
	}), N(o), H(() => oi(o, `--size: ${n() ?? ""}px`)), J(e, o), qe();
}
//#endregion
//#region src/components/R2UsageStats.svelte
var ka = /* @__PURE__ */ q("<li class=\"svelte-1w9i976\"><span class=\"action svelte-1w9i976\"> </span>: <span class=\"count svelte-1w9i976\"> </span></li>"), Aa = /* @__PURE__ */ q("<div class=\"tooltip svelte-1w9i976\"><div class=\"tooltip-title svelte-1w9i976\">Class A Breakdown</div> <ul class=\"svelte-1w9i976\"></ul></div>"), ja = /* @__PURE__ */ q("<li class=\"svelte-1w9i976\"><span class=\"action svelte-1w9i976\"> </span>: <span class=\"count svelte-1w9i976\"> </span></li>"), Ma = /* @__PURE__ */ q("<div class=\"tooltip svelte-1w9i976\"><div class=\"tooltip-title svelte-1w9i976\">Class B Breakdown</div> <ul class=\"svelte-1w9i976\"></ul></div>"), Na = /* @__PURE__ */ q("<div class=\"stat-card svelte-1w9i976\"><div class=\"stat-label svelte-1w9i976\">Storage (Free: 10GB)</div> <div class=\"stat-value svelte-1w9i976\"> </div> <div class=\"stat-sub svelte-1w9i976\"> </div> <div class=\"stat-progress svelte-1w9i976\"><div class=\"bar svelte-1w9i976\"></div></div></div> <div class=\"stat-card has-tooltip svelte-1w9i976\"><div class=\"stat-label svelte-1w9i976\">Class A (Free: 1M/mo)</div> <div class=\"stat-value svelte-1w9i976\"> </div> <div class=\"stat-sub svelte-1w9i976\">Operations</div> <div class=\"stat-progress svelte-1w9i976\"><div class=\"bar svelte-1w9i976\"></div></div> <!></div> <div class=\"stat-card has-tooltip svelte-1w9i976\"><div class=\"stat-label svelte-1w9i976\">Class B (Free: 10M/mo)</div> <div class=\"stat-value svelte-1w9i976\"> </div> <div class=\"stat-sub svelte-1w9i976\">Operations</div> <div class=\"stat-progress svelte-1w9i976\"><div class=\"bar svelte-1w9i976\"></div></div> <!></div>", 1), Pa = /* @__PURE__ */ q("<div class=\"stat-card error-card svelte-1w9i976\"><div class=\"stat-label svelte-1w9i976\">R2 Status</div> <div class=\"stat-value svelte-1w9i976\" style=\"font-size: 0.9rem; color: #d32f2f;\"> </div></div>"), Fa = /* @__PURE__ */ q("<div class=\"stat-card skeleton svelte-1w9i976\"></div> <div class=\"stat-card skeleton svelte-1w9i976\"></div> <div class=\"stat-card skeleton svelte-1w9i976\"></div>", 1), Ia = /* @__PURE__ */ q("<div class=\"r2-stats svelte-1w9i976\"><!></div>");
function La(e, t) {
	Ke(t, !0);
	let n = /* @__PURE__ */ L(null), r = /* @__PURE__ */ L(null);
	async function i() {
		try {
			R(n, await $.get("/admin/api/r2/usage"), !0);
		} catch (e) {
			console.error("Failed to fetch R2 usage:", e), R(r, "Failed to load R2 usage data");
		}
	}
	ki(i);
	function a(e) {
		if (e === 0) return "0 B";
		let t = 1024, n = [
			"B",
			"KB",
			"MB",
			"GB",
			"TB"
		], r = Math.floor(Math.log(e) / Math.log(t));
		return parseFloat((e / t ** +r).toFixed(2)) + " " + n[r];
	}
	let o = [
		"PutObject",
		"CopyObject",
		"ListObjects",
		"CompleteMultipartUpload",
		"CreateMultipartUpload",
		"UploadPart",
		"UploadPartCopy",
		"ListBuckets",
		"PutBucket",
		"DeleteObject",
		"DeleteObjects"
	], s = [
		"HeadObject",
		"GetObject",
		"HeadBucket",
		"GetBucketEncryption",
		"GetBucketLocation",
		"GetBucketPolicy"
	], c = /* @__PURE__ */ Rt(() => G(n) ? (G(n).operations || []).filter((e) => o.includes(e.action_type)).reduce((e, t) => e + t.requests, 0) : 0), l = /* @__PURE__ */ Rt(() => G(n) ? (G(n).operations || []).filter((e) => s.includes(e.action_type)).reduce((e, t) => e + t.requests, 0) : 0), u = /* @__PURE__ */ Rt(() => G(n) ? (G(n).operations || []).filter((e) => o.includes(e.action_type)).sort((e, t) => t.requests - e.requests) : []), d = /* @__PURE__ */ Rt(() => G(n) ? (G(n).operations || []).filter((e) => s.includes(e.action_type)).sort((e, t) => t.requests - e.requests) : []);
	var f = Ia(), p = B(f), m = (e) => {
		var t = Na(), r = fn(t), i = V(B(r), 2), o = B(i, !0);
		N(i);
		var s = V(i, 2), f = B(s);
		N(s);
		var p = V(s, 2), m = B(p);
		N(p), N(r);
		var h = V(r, 2), g = V(B(h), 2), _ = B(g, !0);
		N(g);
		var v = V(g, 4), y = B(v);
		N(v);
		var b = V(v, 2), x = (e) => {
			var t = Aa(), n = V(B(t), 2);
			Z(n, 21, () => G(u), Hr, (e, t) => {
				var n = ka(), r = B(n), i = B(r, !0);
				N(r);
				var a = V(r, 2), o = B(a, !0);
				N(a), N(n), H((e) => {
					Y(i, G(t).action_type), Y(o, e);
				}, [() => (G(t).requests ?? 0).toLocaleString()]), J(e, n);
			}), N(n), N(t), J(e, t);
		};
		X(b, (e) => {
			G(u).length > 0 && e(x);
		}), N(h);
		var S = V(h, 2), C = V(B(S), 2), w = B(C, !0);
		N(C);
		var T = V(C, 4), E = B(T);
		N(T);
		var D = V(T, 2), O = (e) => {
			var t = Ma(), n = V(B(t), 2);
			Z(n, 21, () => G(d), Hr, (e, t) => {
				var n = ja(), r = B(n), i = B(r, !0);
				N(r);
				var a = V(r, 2), o = B(a, !0);
				N(a), N(n), H((e) => {
					Y(i, G(t).action_type), Y(o, e);
				}, [() => (G(t).requests ?? 0).toLocaleString()]), J(e, n);
			}), N(n), N(t), J(e, t);
		};
		X(D, (e) => {
			G(d).length > 0 && e(O);
		}), N(S), H((e, t, n, r, i, a, s) => {
			Y(o, e), Y(f, `${t ?? ""} objects`), oi(m, `width: ${n ?? ""}%`), Y(_, r), oi(y, `width: ${i ?? ""}%`), Y(w, a), oi(E, `width: ${s ?? ""}%`);
		}, [
			() => a(G(n).storage_usage_bytes ?? 0),
			() => (G(n).object_count ?? 0).toLocaleString(),
			() => Math.min(100, (G(n).storage_usage_bytes ?? 0) / (10 * 1024 * 1024 * 1024) * 100),
			() => (G(c) ?? 0).toLocaleString(),
			() => Math.min(100, (G(c) ?? 0) / 1e6 * 100),
			() => (G(l) ?? 0).toLocaleString(),
			() => Math.min(100, (G(l) ?? 0) / 1e7 * 100)
		]), J(e, t);
	}, h = (e) => {
		var t = Pa(), n = V(B(t), 2), i = B(n, !0);
		N(n), N(t), H(() => Y(i, G(r))), J(e, t);
	}, g = (e) => {
		var t = Fa();
		Le(4), J(e, t);
	};
	X(p, (e) => {
		G(n) ? e(m) : G(r) ? e(h, 1) : e(g, -1);
	}), N(f), J(e, f), qe();
}
//#endregion
//#region src/components/ImageList.svelte
var Ra = /* @__PURE__ */ q("<div class=\"loading svelte-xxb0sp\">読み込み中...</div>"), za = /* @__PURE__ */ q("<button class=\"indexed-icon svelte-xxb0sp\" title=\"類似画像を検索\">🔍</button>"), Ba = /* @__PURE__ */ q("<div class=\"image-item svelte-xxb0sp\"><div class=\"img-container svelte-xxb0sp\"><img alt=\"\" loading=\"lazy\" class=\"svelte-xxb0sp\"/> <!></div> <div class=\"info svelte-xxb0sp\"><!> <div class=\"entry-link svelte-xxb0sp\"><a class=\"svelte-xxb0sp\">Entry: <strong class=\"svelte-xxb0sp\"> </strong></a></div> <div class=\"id svelte-xxb0sp\"> </div></div></div>"), Va = /* @__PURE__ */ q("<div class=\"overlay svelte-xxb0sp\"><div class=\"loading-spinner svelte-xxb0sp\"></div></div>"), Ha = /* @__PURE__ */ q("<div class=\"grid-container svelte-xxb0sp\"><div></div> <!></div>"), Ua = /* @__PURE__ */ q("<div class=\"selected-compare svelte-xxb0sp\"><div class=\"image-item target svelte-xxb0sp\"><div class=\"img-container svelte-xxb0sp\"><img alt=\"\" class=\"svelte-xxb0sp\"/></div> <div class=\"info svelte-xxb0sp\"><!> <div class=\"svelte-xxb0sp\">Selected Image</div></div></div> <div class=\"arrow svelte-xxb0sp\">→</div></div>"), Wa = /* @__PURE__ */ q("<div class=\"loading svelte-xxb0sp\">検索中...</div>"), Ga = /* @__PURE__ */ q("<p class=\"svelte-xxb0sp\">類似画像は見つかりませんでした。</p>"), Ka = /* @__PURE__ */ q("<div class=\"image-item svelte-xxb0sp\"><div class=\"img-container svelte-xxb0sp\"><img alt=\"\" loading=\"lazy\" class=\"svelte-xxb0sp\"/></div> <div class=\"info svelte-xxb0sp\"><!> <div class=\"entry-link svelte-xxb0sp\"><a class=\"svelte-xxb0sp\">Entry: <strong class=\"svelte-xxb0sp\"> </strong></a></div> <div class=\"id svelte-xxb0sp\"> </div></div></div>"), qa = /* @__PURE__ */ q("<div></div>"), Ja = /* @__PURE__ */ q("<div class=\"image-list svelte-xxb0sp\"><div class=\"header svelte-xxb0sp\"><div class=\"title-area svelte-xxb0sp\"><h2 class=\"svelte-xxb0sp\"> </h2> <a href=\"https://dash.cloudflare.com/d52dc19d3368d36eecf4b48d5eb2dd44/r2/default/buckets/lowreal\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"r2-link svelte-xxb0sp\">R2 Dashboard ↗</a></div> <div class=\"pagination svelte-xxb0sp\"><button class=\"svelte-xxb0sp\">前へ</button> <span class=\"svelte-xxb0sp\"> </span> <button class=\"svelte-xxb0sp\">次へ</button></div></div> <!> <!></div> <dialog id=\"similarDialog\" class=\"svelte-xxb0sp\"><div class=\"dialog-header svelte-xxb0sp\"><h3 class=\"svelte-xxb0sp\">類似画像一覧</h3> <button type=\"button\" class=\"close-btn svelte-xxb0sp\">×</button></div> <div class=\"dialog-content svelte-xxb0sp\"><!> <!></div></dialog>", 1);
function Ya(e, t) {
	Ke(t, !0);
	let n = /* @__PURE__ */ L(z([])), r = /* @__PURE__ */ L(0), i = /* @__PURE__ */ L(0), a = /* @__PURE__ */ L(z([])), o = /* @__PURE__ */ L(null), s = /* @__PURE__ */ L(null);
	async function c() {
		try {
			let e = await $.get(`/admin/api/images?limit=20&offset=${G(r)}`);
			R(n, e.images || [], !0), R(i, e.total || 0, !0);
		} catch (e) {
			console.error(e);
		}
	}
	async function l(e) {
		R(o, e, !0), R(a, [], !0), G(s).showModal();
		try {
			R(a, (await $.get(`/admin/api/image/${e.id}/similar`)).similar || [], !0);
		} catch (e) {
			console.error(e);
		}
	}
	ki(c);
	function u() {
		G(r) + 20 < G(i) && (R(r, G(r) + 20), c());
	}
	function d() {
		G(r) - 20 >= 0 && (R(r, G(r) - 20), c());
	}
	var f = Ja(), p = fn(f), m = B(p), h = B(m), g = B(h), _ = B(g);
	N(g), Le(2), N(h);
	var v = V(h, 2), y = B(v), b = V(y, 2), x = B(b);
	N(b);
	var S = V(b, 2);
	N(v), N(m);
	var C = V(m, 2);
	La(C, {});
	var w = V(C, 2), T = (e) => {
		J(e, Ra());
	}, E = (e) => {
		var t = Ha(), r = B(t);
		let i;
		Z(r, 21, () => G(n), (e) => e.id, (e, t) => {
			var n = Ba(), r = B(n), i = B(r), a = V(i, 2), o = (e) => {
				var n = za();
				K("click", n, () => l(G(t))), J(e, n);
			};
			X(a, (e) => {
				G(t).sig?.length > 0 && e(o);
			}), N(r);
			var s = V(r, 2), c = B(s);
			Oa(c, { get sig() {
				return G(t).sig;
			} });
			var u = V(c, 2), d = B(u), f = V(B(d)), p = B(f, !0);
			N(f), N(d), N(u);
			var m = V(u, 2), h = B(m);
			N(m), N(s), N(n), H(() => {
				Q(i, "src", G(t).uri), Q(d, "href", `/admin/edit?id=${G(t).entry_id ?? ""}`), Y(p, G(t).entry_id), Y(h, `ID: ${G(t).id ?? ""}`);
			}), J(e, n);
		}), N(r);
		var a = V(r, 2), o = (e) => {
			J(e, Va());
		};
		X(a, (e) => {
			$.loading && e(o);
		}), N(t), H(() => i = ii(r, 1, "grid svelte-xxb0sp", null, i, { "is-loading": $.loading })), J(e, t);
	};
	X(w, (e) => {
		$.loading && G(n).length === 0 ? e(T) : e(E, -1);
	}), N(p);
	var D = V(p, 2), O = B(D), ee = V(B(O), 2);
	N(O);
	var te = V(O, 2), ne = B(te), re = (e) => {
		var t = Ua(), n = B(t), r = B(n), i = B(r);
		N(r);
		var a = V(r, 2);
		Oa(B(a), { get sig() {
			return G(o).sig;
		} }), Le(2), N(a), N(n), Le(2), N(t), H(() => Q(i, "src", G(o).uri)), J(e, t);
	};
	X(ne, (e) => {
		G(o) && e(re);
	});
	var ie = V(ne, 2), ae = (e) => {
		J(e, Wa());
	}, oe = (e) => {
		J(e, Ga());
	}, se = (e) => {
		var t = qa();
		let n;
		Z(t, 21, () => G(a), (e) => e.id, (e, t) => {
			var n = Ka(), r = B(n), i = B(r);
			N(r);
			var a = V(r, 2), o = B(a);
			Oa(o, { get sig() {
				return G(t).sig;
			} });
			var c = V(o, 2), l = B(c), u = V(B(l)), d = B(u, !0);
			N(u), N(l), N(c);
			var f = V(c, 2), p = B(f);
			N(f), N(a), N(n), H(() => {
				Q(i, "src", G(t).uri), Q(l, "href", `/admin/edit?id=${G(t).entry_id ?? ""}`), Y(d, G(t).entry_id), Y(p, `ID: ${G(t).id ?? ""} / Score: ${G(t).score ?? ""}`);
			}), K("click", l, () => G(s).close()), J(e, n);
		}), N(t), H(() => n = ii(t, 1, "grid similar-grid svelte-xxb0sp", null, n, { "is-loading": $.loading })), J(e, t);
	};
	X(ie, (e) => {
		$.loading && G(a).length === 0 ? e(ae) : G(a).length === 0 ? e(oe, 1) : e(se, -1);
	}), N(te), N(D), Ti(D, (e) => R(s, e), () => G(s)), H((e) => {
		Y(_, `画像一覧 (${G(i) ?? ""})`), y.disabled = G(r) === 0, Y(x, `${G(r) + 1} - ${e ?? ""} / ${G(i) ?? ""}`), S.disabled = G(r) + 20 >= G(i);
	}, [() => Math.min(G(r) + 20, G(i))]), K("click", y, d), K("click", S, u), K("click", ee, () => G(s).close()), J(e, f), qe();
}
Or(["click"]);
//#endregion
//#region src/components/InfoPage.svelte
var Xa = /* @__PURE__ */ q("<div class=\"loading-spinner-container svelte-6rw159\"><div class=\"loading-spinner svelte-6rw159\"></div></div>"), Za = /* @__PURE__ */ q("<span class=\"term-badge svelte-6rw159\"> </span>"), Qa = /* @__PURE__ */ q("<div class=\"sections svelte-6rw159\"><section class=\"svelte-6rw159\"><h3 class=\"svelte-6rw159\">TF-IDF 統計</h3> <div class=\"table-container svelte-6rw159\"><table class=\"svelte-6rw159\"><tbody class=\"svelte-6rw159\"><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">総語彙数 (Terms)</th><td class=\"svelte-6rw159\"> </td></tr><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">インデックス済みエントリ</th><td class=\"svelte-6rw159\"> </td></tr><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">関連エントリ計算済み</th><td class=\"svelte-6rw159\"> </td></tr><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">総関連ペア数</th><td class=\"svelte-6rw159\"> </td></tr><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">平均類似度スコア</th><td class=\"svelte-6rw159\"> </td></tr></tbody></table></div> <div style=\"margin-top: 10px;\" class=\"svelte-6rw159\"><h4 class=\"svelte-6rw159\">頻出単語 (Top 20 DF)</h4> <div class=\"top-terms svelte-6rw159\"></div></div></section> <section class=\"svelte-6rw159\"><h3 class=\"svelte-6rw159\">画像統計</h3> <div class=\"table-container svelte-6rw159\"><table class=\"svelte-6rw159\"><tbody class=\"svelte-6rw159\"><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">総画像数</th><td class=\"svelte-6rw159\"> </td></tr><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">未インデックス画像数</th><td class=\"svelte-6rw159\"> </td></tr></tbody></table></div></section> <section class=\"svelte-6rw159\"><h3 class=\"svelte-6rw159\">全般</h3> <div class=\"table-container svelte-6rw159\"><table class=\"svelte-6rw159\"><tbody class=\"svelte-6rw159\"><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">IsDevelopment</th><td class=\"svelte-6rw159\"> </td></tr><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">AppHash</th><td class=\"svelte-6rw159\"><code class=\"svelte-6rw159\"> </code></td></tr></tbody></table></div></section> <section class=\"svelte-6rw159\"><h3 class=\"svelte-6rw159\">デバッグ情報</h3> <div class=\"table-container svelte-6rw159\"><table class=\"svelte-6rw159\"><tbody class=\"svelte-6rw159\"><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">Go Version</th><td class=\"svelte-6rw159\"> </td></tr><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">Goroutines</th><td class=\"svelte-6rw159\"> </td></tr><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">Start Time</th><td class=\"svelte-6rw159\"> </td></tr><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">Uptime</th><td class=\"svelte-6rw159\"> </td></tr><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">Mem Alloc</th><td class=\"svelte-6rw159\"> </td></tr><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">Mem Total Alloc</th><td class=\"svelte-6rw159\"> </td></tr><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">Mem Sys</th><td class=\"svelte-6rw159\"> </td></tr><tr class=\"svelte-6rw159\"><th class=\"svelte-6rw159\">Num GC</th><td class=\"svelte-6rw159\"> </td></tr></tbody></table></div></section> <section class=\"svelte-6rw159\"><h3 class=\"svelte-6rw159\">設定 (Config)</h3> <pre class=\"svelte-6rw159\"> </pre></section></div>"), $a = /* @__PURE__ */ q("<div class=\"info-page svelte-6rw159\"><div class=\"header svelte-6rw159\"><h2 class=\"svelte-6rw159\">システム情報</h2></div> <!></div>");
function eo(e, t) {
	Ke(t, !0);
	let n = /* @__PURE__ */ L(null);
	async function r() {
		try {
			R(n, await $.get("/admin/api/info"), !0);
		} catch (e) {
			console.error(e);
		}
	}
	ki(r);
	function i(e) {
		if (e === 0) return "0 B";
		let t = 1024, n = [
			"B",
			"KB",
			"MB",
			"GB",
			"TB"
		], r = Math.floor(Math.log(e) / Math.log(t));
		return parseFloat((e / t ** +r).toFixed(2)) + " " + n[r];
	}
	var a = $a(), o = V(B(a), 2), s = (e) => {
		J(e, Xa());
	}, c = (e) => {
		var t = Qa(), r = B(t), a = V(B(r), 2), o = B(a), s = B(o), c = B(s), l = V(B(c)), u = B(l, !0);
		N(l), N(c);
		var d = V(c), f = V(B(d)), p = B(f, !0);
		N(f), N(d);
		var m = V(d), h = V(B(m)), g = B(h, !0);
		N(h), N(m);
		var _ = V(m), v = V(B(_)), y = B(v, !0);
		N(v), N(_);
		var b = V(_), x = V(B(b)), S = B(x, !0);
		N(x), N(b), N(s), N(o), N(a);
		var C = V(a, 2), w = V(B(C), 2);
		Z(w, 21, () => G(n).tfidf_stats?.top_terms ?? [], Hr, (e, t) => {
			var n = Za(), r = B(n, !0);
			N(n), H(() => {
				Q(n, "title", `DF: ${G(t).df ?? ""}`), Y(r, G(t).term);
			}), J(e, n);
		}), N(w), N(C), N(r);
		var T = V(r, 2), E = V(B(T), 2), D = B(E), O = B(D), ee = B(O), te = V(B(ee)), ne = B(te, !0);
		N(te), N(ee);
		var re = V(ee), ie = V(B(re)), ae = B(ie, !0);
		N(ie), N(re), N(O), N(D), N(E), N(T);
		var oe = V(T, 2), se = V(B(oe), 2), ce = B(se), le = B(ce), ue = B(le), de = V(B(ue)), fe = B(de, !0);
		N(de), N(ue);
		var pe = V(ue), me = V(B(pe)), he = B(me), ge = B(he, !0);
		N(he), N(me), N(pe), N(le), N(ce), N(se), N(oe);
		var _e = V(oe, 2), ve = V(B(_e), 2), ye = B(ve), be = B(ye), xe = B(be), Se = V(B(xe)), Ce = B(Se, !0);
		N(Se), N(xe);
		var we = V(xe), Te = V(B(we)), Ee = B(Te, !0);
		N(Te), N(we);
		var De = V(we), Oe = V(B(De)), k = B(Oe, !0);
		N(Oe), N(De);
		var ke = V(De), Ae = V(B(ke)), je = B(Ae, !0);
		N(Ae), N(ke);
		var Me = V(ke), Ne = V(B(Me)), Pe = B(Ne, !0);
		N(Ne), N(Me);
		var A = V(Me), Fe = V(B(A)), j = B(Fe, !0);
		N(Fe), N(A);
		var M = V(A), Ie = V(B(M)), Le = B(Ie, !0);
		N(Ie), N(M);
		var Re = V(M), ze = V(B(Re)), Be = B(ze, !0);
		N(ze), N(Re), N(be), N(ye), N(ve), N(_e);
		var Ve = V(_e, 2), He = V(B(Ve), 2), Ue = B(He, !0);
		N(He), N(Ve), N(t), H((e, t, r, i, a, o) => {
			Y(u, G(n).tfidf_stats?.total_terms ?? 0), Y(p, G(n).tfidf_stats?.indexed_entries ?? 0), Y(g, G(n).tfidf_stats?.entries_with_related ?? 0), Y(y, G(n).tfidf_stats?.total_related_pairs ?? 0), Y(S, e), Y(ne, G(n).image_stats?.total_images ?? 0), Y(ae, G(n).image_stats?.unindexed_images ?? 0), Y(fe, G(n).is_development), Y(ge, G(n).app_hash), Y(Ce, G(n).debug_info.go_version), Y(Ee, G(n).debug_info.num_goroutine), Y(k, t), Y(je, G(n).debug_info.uptime), Y(Pe, r), Y(j, i), Y(Le, a), Y(Be, G(n).debug_info.num_gc), Y(Ue, o);
		}, [
			() => G(n).tfidf_stats?.avg_score?.toFixed(4) ?? "0.0000",
			() => new Date(G(n).debug_info.start_time).toLocaleString(),
			() => i(G(n).debug_info.mem_alloc),
			() => i(G(n).debug_info.mem_total_alloc),
			() => i(G(n).debug_info.mem_sys),
			() => JSON.stringify(G(n).config, null, 2)
		]), J(e, t);
	};
	X(o, (e) => {
		$.loading && !G(n) ? e(s) : G(n) && e(c, 1);
	}), N(a), J(e, a), qe();
}
//#endregion
//#region src/components/CacheList.svelte
var to = /* @__PURE__ */ q("<div class=\"stats-grid svelte-1y3ri9y\"><div class=\"stat-card svelte-1y3ri9y\"><div class=\"label svelte-1y3ri9y\">キャッシュ数</div> <div class=\"value svelte-1y3ri9y\"> </div></div> <div class=\"stat-card svelte-1y3ri9y\"><div class=\"label svelte-1y3ri9y\">合計サイズ</div> <div class=\"value svelte-1y3ri9y\"> </div></div> <div class=\"stat-card svelte-1y3ri9y\"><div class=\"label svelte-1y3ri9y\">最古</div> <div class=\"value date svelte-1y3ri9y\"> </div></div> <div class=\"stat-card svelte-1y3ri9y\"><div class=\"label svelte-1y3ri9y\">最新</div> <div class=\"value date svelte-1y3ri9y\"> </div></div></div>"), no = /* @__PURE__ */ q("<tr><td class=\"svelte-1y3ri9y\"><code class=\"svelte-1y3ri9y\"> </code></td><td class=\"svelte-1y3ri9y\"><code class=\"svelte-1y3ri9y\"> </code></td></tr>"), ro = /* @__PURE__ */ q("<section class=\"metadata-section svelte-1y3ri9y\"><h3>メタデータ</h3> <div class=\"table-container svelte-1y3ri9y\"><table class=\"svelte-1y3ri9y\"><thead><tr><th class=\"svelte-1y3ri9y\">Key</th><th class=\"svelte-1y3ri9y\">Value</th></tr></thead><tbody></tbody></table></div></section>"), io = /* @__PURE__ */ q("<tr><td class=\"cache-key svelte-1y3ri9y\"><code class=\"svelte-1y3ri9y\"> </code></td><td class=\"svelte-1y3ri9y\"> </td><td class=\"svelte-1y3ri9y\"><small> </small></td><td class=\"svelte-1y3ri9y\"> </td><td class=\"svelte-1y3ri9y\"><button class=\"delete-button svelte-1y3ri9y\">削除</button></td></tr>"), ao = /* @__PURE__ */ q("<div class=\"cache-list-page svelte-1y3ri9y\"><div class=\"header svelte-1y3ri9y\"><h2>ページキャッシュ管理</h2> <div class=\"actions\"><button class=\"purge-button svelte-1y3ri9y\">全キャッシュ削除</button></div></div> <!> <!> <div class=\"table-container svelte-1y3ri9y\"><table class=\"svelte-1y3ri9y\"><thead><tr><th> </th><th> </th><th class=\"svelte-1y3ri9y\">Type</th><th> </th><th class=\"svelte-1y3ri9y\">Actions</th></tr></thead><tbody></tbody></table></div></div>");
function oo(e, t) {
	Ke(t, !0);
	let n = /* @__PURE__ */ L(null), r = /* @__PURE__ */ L(z([])), i = /* @__PURE__ */ L(z([])), a = /* @__PURE__ */ L("created_at"), o = /* @__PURE__ */ L("desc");
	async function s() {
		try {
			let e = await $.get("/admin/api/cache/stats");
			R(n, e.stats, !0), R(r, e.metadata, !0);
		} catch (e) {
			console.error(e);
		}
	}
	async function c() {
		try {
			R(i, (await $.get("/admin/api/cache/list")).entries, !0);
		} catch (e) {
			console.error(e);
		}
	}
	ki(() => {
		s(), c();
	});
	async function l() {
		if (confirm("全てのキャッシュを削除しますか？")) try {
			await $.post("/admin/api/cache/purge", void 0), await s(), await c();
		} catch (e) {
			console.error(e);
		}
	}
	async function u(e) {
		try {
			await $.post(`/admin/api/cache/purge?key=${encodeURIComponent(e)}`, void 0), await s(), await c();
		} catch (e) {
			console.error(e);
		}
	}
	function d(e) {
		if (e === 0) return "0 B";
		let t = 1024, n = [
			"B",
			"KB",
			"MB",
			"GB",
			"TB"
		], r = Math.floor(Math.log(e) / Math.log(t));
		return parseFloat((e / t ** +r).toFixed(2)) + " " + n[r];
	}
	let f = /* @__PURE__ */ Rt(() => [...G(i)].sort((e, t) => {
		let n, r;
		return G(a) === "key" ? (n = e.cache_key, r = t.cache_key) : G(a) === "size" ? (n = e.size?.Int64 ?? 0, r = t.size?.Int64 ?? 0) : (n = new Date(e.created_at).getTime(), r = new Date(t.created_at).getTime()), n < r ? G(o) === "asc" ? -1 : 1 : n > r ? G(o) === "asc" ? 1 : -1 : 0;
	}));
	function p(e) {
		G(a) === e ? R(o, G(o) === "asc" ? "desc" : "asc", !0) : (R(a, e, !0), R(o, "desc"));
	}
	var m = ao(), h = B(m), g = V(B(h), 2), _ = B(g);
	N(g), N(h);
	var v = V(h, 2), y = (e) => {
		var t = to(), r = B(t), i = V(B(r), 2), a = B(i, !0);
		N(i), N(r);
		var o = V(r, 2), s = V(B(o), 2), c = B(s, !0);
		N(s), N(o);
		var l = V(o, 2), u = V(B(l), 2), f = B(u, !0);
		N(u), N(l);
		var p = V(l, 2), m = V(B(p), 2), h = B(m, !0);
		N(m), N(p), N(t), H((e, t, r) => {
			Y(a, G(n).total_count), Y(c, e), Y(f, t), Y(h, r);
		}, [
			() => d(Number(G(n).total_size)),
			() => G(n).oldest_at ? new Date(String(G(n).oldest_at)).toLocaleString() : "-",
			() => G(n).newest_at ? new Date(String(G(n).newest_at)).toLocaleString() : "-"
		]), J(e, t);
	};
	X(v, (e) => {
		G(n) && e(y);
	});
	var b = V(v, 2), x = (e) => {
		var t = ro(), n = V(B(t), 2), i = B(n), a = V(B(i));
		Z(a, 21, () => G(r), Hr, (e, t) => {
			var n = no(), r = B(n), i = B(r), a = B(i, !0);
			N(i), N(r);
			var o = V(r), s = B(o), c = B(s, !0);
			N(s), N(o), N(n), H(() => {
				Y(a, G(t).key), Y(c, G(t).value);
			}), J(e, n);
		}), N(a), N(i), N(n), N(t), J(e, t);
	};
	X(b, (e) => {
		G(r).length > 0 && e(x);
	});
	var S = V(b, 2), C = B(S), w = B(C), T = B(w), E = B(T);
	let D;
	var O = B(E);
	N(E);
	var ee = V(E);
	let te;
	var ne = B(ee);
	N(ee);
	var re = V(ee, 2);
	let ie;
	var ae = B(re);
	N(re), Le(), N(T), N(w);
	var oe = V(w);
	Z(oe, 21, () => G(f), Hr, (e, t) => {
		var n = io(), r = B(n), i = B(r), a = B(i, !0);
		N(i), N(r);
		var o = V(r), s = B(o, !0);
		N(o);
		var c = V(o), l = B(c), f = B(l, !0);
		N(l), N(c);
		var p = V(c), m = B(p, !0);
		N(p);
		var h = V(p), g = B(h);
		N(h), N(n), H((e, n) => {
			Y(a, G(t).cache_key), Y(s, e), Y(f, G(t).content_type), Y(m, n);
		}, [() => d(G(t).size?.Int64 ?? 0), () => new Date(G(t).created_at).toLocaleString()]), K("click", g, () => u(G(t).cache_key)), J(e, n);
	}), N(oe), N(C), N(S), N(m), H(() => {
		D = ii(E, 1, "sortable svelte-1y3ri9y", null, D, { active: G(a) === "key" }), Y(O, `Key ${G(a) === "key" ? G(o) === "asc" ? "↑" : "↓" : ""}`), te = ii(ee, 1, "sortable svelte-1y3ri9y", null, te, { active: G(a) === "size" }), Y(ne, `Size ${G(a) === "size" ? G(o) === "asc" ? "↑" : "↓" : ""}`), ie = ii(re, 1, "sortable svelte-1y3ri9y", null, ie, { active: G(a) === "created_at" }), Y(ae, `Created At ${G(a) === "created_at" ? G(o) === "asc" ? "↑" : "↓" : ""}`);
	}), K("click", _, l), K("click", E, () => p("key")), K("click", ee, () => p("size")), K("click", re, () => p("created_at")), J(e, m), qe();
}
Or(["click"]);
//#endregion
//#region src/App.svelte
var so = /* @__PURE__ */ q("<a> </a>"), co = /* @__PURE__ */ q("<div class=\"admin-app svelte-1n46o8q\"><header><div class=\"header-left svelte-1n46o8q\"><h1 class=\"svelte-1n46o8q\"><a href=\"/admin/\" class=\"svelte-1n46o8q\"><img src=\"/images/hanrangen-icon.svg\" alt=\"Hanrangon\" class=\"logo svelte-1n46o8q\"/></a></h1> <div class=\"ci-badge svelte-1n46o8q\"><a href=\"https://github.com/cho45/Hanrangon/actions/workflows/ci.yml\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"svelte-1n46o8q\"><img src=\"https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/ci.yml?branch=main&amp;label=ci&amp;style=flat-square\" alt=\"CI Status\" class=\"svelte-1n46o8q\"/></a> <a href=\"https://github.com/cho45/Hanrangon/actions/workflows/lint.yml\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"svelte-1n46o8q\"><img src=\"https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/lint.yml?branch=main&amp;label=lint&amp;style=flat-square\" alt=\"Lint Status\" class=\"svelte-1n46o8q\"/></a></div></div> <nav class=\"main-nav svelte-1n46o8q\"><ul class=\"svelte-1n46o8q\"><li><a href=\"/\" class=\"svelte-1n46o8q\">サイト確認</a></li> <li><a href=\"/logout\" class=\"svelte-1n46o8q\">ログアウト</a></li></ul></nav></header> <nav></nav> <main class=\"content svelte-1n46o8q\"><!></main></div>");
function lo(e, t) {
	Ke(t, !0);
	let n = /* @__PURE__ */ L(z(window.location.pathname)), r = /* @__PURE__ */ L(z(new URLSearchParams(window.location.search)));
	ki(() => {
		let e = () => {
			R(n, window.location.pathname, !0), R(r, new URLSearchParams(window.location.search), !0);
		};
		return window.addEventListener("popstate", e), () => window.removeEventListener("popstate", e);
	});
	function i(e, t) {
		t && t.preventDefault(), window.history.pushState({}, "", e), R(n, window.location.pathname, !0), R(r, new URLSearchParams(window.location.search), !0);
	}
	let a = {
		"/admin/edit": {
			component: ca,
			page: "edit",
			getProps: (e) => ({
				id: e,
				onSave: (e) => window.location.href = e
			})
		},
		"/admin/jobs": {
			component: xa,
			page: "jobs",
			getProps: () => ({})
		},
		"/admin/images": {
			component: Ya,
			page: "images",
			getProps: () => ({})
		},
		"/admin/info": {
			component: eo,
			page: "info",
			getProps: () => ({})
		},
		"/admin/cache": {
			component: oo,
			page: "cache",
			getProps: () => ({})
		},
		"/admin/": {
			component: Vi,
			page: "list",
			getProps: () => ({ onEdit: (e) => i(`/admin/edit?id=${e}`) })
		}
	}, o = [
		{
			label: "エントリ一覧",
			path: "/admin/",
			page: "list"
		},
		{
			label: "新規作成",
			path: "/admin/edit",
			page: "edit",
			exact: !0
		},
		{
			label: "画像一覧",
			path: "/admin/images",
			page: "images"
		},
		{
			label: "ジョブ一覧",
			path: "/admin/jobs",
			page: "jobs"
		},
		{
			label: "キャッシュ",
			path: "/admin/cache",
			page: "cache"
		},
		{
			label: "情報",
			path: "/admin/info",
			page: "info"
		}
	], s = /* @__PURE__ */ Rt(() => {
		let e = G(r).get("id"), t = a[G(n)] ?? a["/admin/"];
		return {
			...t,
			props: t.getProps(e),
			isActive: (n) => !(n.page !== t.page || n.exact && e)
		};
	}), c = /* @__PURE__ */ Rt(() => window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
	var l = co(), u = B(l);
	let d;
	var f = V(u, 2);
	let p;
	Z(f, 21, () => o, Hr, (e, t) => {
		var n = so();
		let r;
		var a = B(n, !0);
		N(n), H((e) => {
			Q(n, "href", G(t).path), r = ii(n, 1, "svelte-1n46o8q", null, r, e), Y(a, G(t).label);
		}, [() => ({ active: G(s).isActive(G(t)) })]), K("click", n, (e) => i(G(t).path, e)), J(e, n);
	}), N(f);
	var m = V(f, 2);
	Qr(B(m), () => G(s).component, (e, t) => {
		t(e, Di(() => G(s).props));
	}), N(m), N(l), H(() => {
		d = ii(u, 1, "svelte-1n46o8q", null, d, { "is-localhost": G(c) }), p = ii(f, 1, "sub-nav svelte-1n46o8q", null, p, { "is-localhost": G(c) });
	}), J(e, l), qe();
}
Or(["click"]);
//#endregion
//#region src/main.ts
var uo = document.getElementById("admin-root");
uo && (uo.innerHTML = "", Lr(lo, { target: uo })), "serviceWorker" in navigator && window.addEventListener("load", () => {
	navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" }).then((e) => {
		e.update();
	});
});
//#endregion

//# sourceMappingURL=admin-front.js.map