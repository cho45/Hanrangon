typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
const An = 1, Nn = 2, Rn = 16, Fn = 1, On = 2, Or = "[", Nt = "[!", or = "]", We = {}, z = /* @__PURE__ */ Symbol(), Pn = "http://www.w3.org/1999/xhtml", Wt = !1;
var Pr = Array.isArray, In = Array.prototype.indexOf, Rt = Array.from, kt = Object.keys, St = Object.defineProperty, Ze = Object.getOwnPropertyDescriptor, Yn = Object.prototype, Cn = Array.prototype, jn = Object.getPrototypeOf, br = Object.isExtensible;
function Hn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Ir() {
  var e, t, r = new Promise((n, i) => {
    e = n, t = i;
  });
  return { promise: r, resolve: e, reject: t };
}
const H = 2, lr = 4, fr = 8, Ln = 1 << 24, Me = 16, ke = 32, Fe = 64, Ft = 128, ce = 512, J = 1024, Q = 2048, he = 4096, ne = 8192, we = 16384, Ot = 32768, Qe = 65536, yr = 1 << 17, Yr = 1 << 18, Xe = 1 << 19, zn = 1 << 20, De = 1 << 25, Le = 32768, Qt = 1 << 21, ur = 1 << 22, Ae = 1 << 23, wt = /* @__PURE__ */ Symbol("$state"), Jn = /* @__PURE__ */ Symbol("legacy props"), Xn = /* @__PURE__ */ Symbol(""), Ke = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), Pt = 3, nt = 8;
function Un(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Bn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function qn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Vn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Kn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Zn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Gn() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function Wn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Qn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function es() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function ts() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function It(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function rs() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let k = !1;
function ye(e) {
  k = e;
}
let x;
function V(e) {
  if (e === null)
    throw It(), We;
  return x = e;
}
function Yt() {
  return V(/* @__PURE__ */ _e(x));
}
function B(e) {
  if (k) {
    if (/* @__PURE__ */ _e(x) !== null)
      throw It(), We;
    x = e;
  }
}
function er(e = 1) {
  if (k) {
    for (var t = e, r = x; t--; )
      r = /** @type {TemplateNode} */
      /* @__PURE__ */ _e(r);
    x = r;
  }
}
function Et(e = !0) {
  for (var t = 0, r = x; ; ) {
    if (r.nodeType === nt) {
      var n = (
        /** @type {Comment} */
        r.data
      );
      if (n === or) {
        if (t === 0) return r;
        t -= 1;
      } else (n === Or || n === Nt) && (t += 1);
    }
    var i = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ _e(r)
    );
    e && r.remove(), r = i;
  }
}
function Cr(e) {
  if (!e || e.nodeType !== nt)
    throw It(), We;
  return (
    /** @type {Comment} */
    e.data
  );
}
function jr(e) {
  return e === this.v;
}
function ns(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Hr(e) {
  return !ns(e, this.v);
}
let ss = !1, ie = null;
function et(e) {
  ie = e;
}
function Lr(e, t = !1, r) {
  ie = {
    p: ie,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function zr(e) {
  var t = (
    /** @type {ComponentContext} */
    ie
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      ln(n);
  }
  return e !== void 0 && (t.x = e), t.i = !0, ie = t.p, e ?? /** @type {T} */
  {};
}
function Jr() {
  return !0;
}
let Ie = [];
function Xr() {
  var e = Ie;
  Ie = [], Hn(e);
}
function dt(e) {
  if (Ie.length === 0 && !ot) {
    var t = Ie;
    queueMicrotask(() => {
      t === Ie && Xr();
    });
  }
  Ie.push(e);
}
function is() {
  for (; Ie.length > 0; )
    Xr();
}
function Ur(e) {
  var t = S;
  if (t === null)
    return M.f |= Ae, e;
  if ((t.f & Ot) === 0) {
    if ((t.f & Ft) === 0)
      throw e;
    t.b.error(e);
  } else
    tt(e, t);
}
function tt(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ft) !== 0)
      try {
        t.b.error(e);
        return;
      } catch (r) {
        e = r;
      }
    t = t.parent;
  }
  throw e;
}
const gt = /* @__PURE__ */ new Set();
let E = null, $t = null, fe = null, oe = [], Ct = null, tr = !1, ot = !1;
class ue {
  committed = !1;
  /**
   * The current values of any sources that are updated in this batch
   * They keys of this map are identical to `this.#previous`
   * @type {Map<Source, any>}
   */
  current = /* @__PURE__ */ new Map();
  /**
   * The values of any sources that are updated in this batch _before_ those updates took place.
   * They keys of this map are identical to `this.#current`
   * @type {Map<Source, any>}
   */
  previous = /* @__PURE__ */ new Map();
  /**
   * When the batch is committed (and the DOM is updated), we need to remove old branches
   * and append new ones by calling the functions added inside (if/each/key/etc) blocks
   * @type {Set<() => void>}
   */
  #t = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #e = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #r = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #n = 0;
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #l = null;
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #i = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #s = /* @__PURE__ */ new Set();
  /**
   * A set of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`
   * @type {Set<Effect>}
   */
  skipped_effects = /* @__PURE__ */ new Set();
  is_fork = !1;
  is_deferred() {
    return this.is_fork || this.#n > 0;
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    oe = [], $t = null, this.apply();
    var r = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const n of t)
      this.#a(n, r);
    this.is_fork || this.#u(), this.is_deferred() ? (this.#o(r.effects), this.#o(r.render_effects)) : ($t = this, E = null, wr(r.render_effects), wr(r.effects), $t = null, this.#l?.resolve()), fe = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {EffectTarget} target
   */
  #a(t, r) {
    t.f ^= J;
    for (var n = t.first; n !== null; ) {
      var i = n.f, s = (i & (ke | Fe)) !== 0, o = s && (i & J) !== 0, a = o || (i & ne) !== 0 || this.skipped_effects.has(n);
      if ((n.f & Ft) !== 0 && n.b?.is_pending() && (r = {
        parent: r,
        effect: n,
        effects: [],
        render_effects: []
      }), !a && n.fn !== null) {
        s ? n.f ^= J : (i & lr) !== 0 ? r.effects.push(n) : vt(n) && ((n.f & Me) !== 0 && this.#i.add(n), ct(n));
        var l = n.first;
        if (l !== null) {
          n = l;
          continue;
        }
      }
      var f = n.parent;
      for (n = n.next; n === null && f !== null; )
        f === r.effect && (this.#o(r.effects), this.#o(r.render_effects), r = /** @type {EffectTarget} */
        r.parent), n = f.next, f = f.parent;
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #o(t) {
    for (const r of t)
      (r.f & Q) !== 0 ? this.#i.add(r) : (r.f & he) !== 0 && this.#s.add(r), this.#f(r.deps), X(r, J);
  }
  /**
   * @param {Value[] | null} deps
   */
  #f(t) {
    if (t !== null)
      for (const r of t)
        (r.f & H) === 0 || (r.f & Le) === 0 || (r.f ^= Le, this.#f(
          /** @type {Derived} */
          r.deps
        ));
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, r) {
    this.previous.has(t) || this.previous.set(t, r), (t.f & Ae) === 0 && (this.current.set(t, t.v), fe?.set(t, t.v));
  }
  activate() {
    E = this, this.apply();
  }
  deactivate() {
    E === this && (E = null, fe = null);
  }
  flush() {
    if (this.activate(), oe.length > 0) {
      if (Br(), E !== null && E !== this)
        return;
    } else this.#r === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of this.#e) t(this);
    this.#e.clear();
  }
  #u() {
    if (this.#n === 0) {
      for (const t of this.#t) t();
      this.#t.clear();
    }
    this.#r === 0 && this.#c();
  }
  #c() {
    if (gt.size > 1) {
      this.previous.clear();
      var t = fe, r = !0, n = {
        parent: null,
        effect: null,
        effects: [],
        render_effects: []
      };
      for (const s of gt) {
        if (s === this) {
          r = !1;
          continue;
        }
        const o = [];
        for (const [l, f] of this.current) {
          if (s.current.has(l))
            if (r && f !== s.current.get(l))
              s.current.set(l, f);
            else
              continue;
          o.push(l);
        }
        if (o.length === 0)
          continue;
        const a = [...s.current.keys()].filter((l) => !this.current.has(l));
        if (a.length > 0) {
          var i = oe;
          oe = [];
          const l = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
          for (const u of o)
            qr(u, a, l, f);
          if (oe.length > 0) {
            E = s, s.apply();
            for (const u of oe)
              s.#a(u, n);
            s.deactivate();
          }
          oe = i;
        }
      }
      E = null, fe = t;
    }
    this.committed = !0, gt.delete(this);
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    this.#r += 1, t && (this.#n += 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    this.#r -= 1, t && (this.#n -= 1), this.revive();
  }
  revive() {
    for (const t of this.#i)
      this.#s.delete(t), X(t, Q), ze(t);
    for (const t of this.#s)
      X(t, he), ze(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    this.#t.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#e.add(t);
  }
  settled() {
    return (this.#l ??= Ir()).promise;
  }
  static ensure() {
    if (E === null) {
      const t = E = new ue();
      gt.add(E), ot || ue.enqueue(() => {
        E === t && t.flush();
      });
    }
    return E;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    dt(t);
  }
  apply() {
  }
}
function xt(e) {
  var t = ot;
  ot = !0;
  try {
    for (var r; ; ) {
      if (is(), oe.length === 0 && (E?.flush(), oe.length === 0))
        return Ct = null, /** @type {T} */
        r;
      Br();
    }
  } finally {
    ot = t;
  }
}
function Br() {
  var e = je;
  tr = !0;
  var t = null;
  try {
    var r = 0;
    for (Dt(!0); oe.length > 0; ) {
      var n = ue.ensure();
      if (r++ > 1e3) {
        var i, s;
        as();
      }
      n.process(oe), Ne.clear();
    }
  } finally {
    tr = !1, Dt(e), Ct = null;
  }
}
function as() {
  try {
    Zn();
  } catch (e) {
    tt(e, Ct);
  }
}
let be = null;
function wr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (we | ne)) === 0 && vt(n) && (be = /* @__PURE__ */ new Set(), ct(n), n.deps === null && n.first === null && n.nodes === null && (n.teardown === null && n.ac === null ? dn(n) : n.fn = null), be?.size > 0)) {
        Ne.clear();
        for (const i of be) {
          if ((i.f & (we | ne)) !== 0) continue;
          const s = [i];
          let o = i.parent;
          for (; o !== null; )
            be.has(o) && (be.delete(o), s.push(o)), o = o.parent;
          for (let a = s.length - 1; a >= 0; a--) {
            const l = s[a];
            (l.f & (we | ne)) === 0 && ct(l);
          }
        }
        be.clear();
      }
    }
    be = null;
  }
}
function qr(e, t, r, n) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & H) !== 0 ? qr(
        /** @type {Derived} */
        i,
        t,
        r,
        n
      ) : (s & (ur | Me)) !== 0 && (s & Q) === 0 && Vr(i, t, n) && (X(i, Q), ze(
        /** @type {Effect} */
        i
      ));
    }
}
function Vr(e, t, r) {
  const n = r.get(e);
  if (n !== void 0) return n;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (t.includes(i))
        return !0;
      if ((i.f & H) !== 0 && Vr(
        /** @type {Derived} */
        i,
        t,
        r
      ))
        return r.set(
          /** @type {Derived} */
          i,
          !0
        ), !0;
    }
  return r.set(e, !1), !1;
}
function ze(e) {
  for (var t = Ct = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (tr && t === S && (r & Me) !== 0 && (r & Yr) === 0)
      return;
    if ((r & (Fe | ke)) !== 0) {
      if ((r & J) === 0) return;
      t.f ^= J;
    }
  }
  oe.push(t);
}
function os(e) {
  let t = 0, r = Je(0), n;
  return () => {
    ft() && (m(r), ht(() => (t === 0 && (n = st(() => e(() => lt(r)))), t += 1, () => {
      dt(() => {
        t -= 1, t === 0 && (n?.(), n = void 0, lt(r));
      });
    })));
  };
}
var ls = Qe | Xe | Ft;
function fs(e, t, r) {
  new us(e, t, r);
}
class us {
  /** @type {Boundary | null} */
  parent;
  #t = !1;
  /** @type {TemplateNode} */
  #e;
  /** @type {TemplateNode | null} */
  #r = k ? x : null;
  /** @type {BoundaryProps} */
  #n;
  /** @type {((anchor: Node) => void)} */
  #l;
  /** @type {Effect} */
  #i;
  /** @type {Effect | null} */
  #s = null;
  /** @type {Effect | null} */
  #a = null;
  /** @type {Effect | null} */
  #o = null;
  /** @type {DocumentFragment | null} */
  #f = null;
  /** @type {TemplateNode | null} */
  #u = null;
  #c = 0;
  #d = 0;
  #v = !1;
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #h = null;
  #b = os(() => (this.#h = Je(this.#c), () => {
    this.#h = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, n) {
    this.#e = t, this.#n = r, this.#l = n, this.parent = /** @type {Effect} */
    S.b, this.#t = !!this.#n.pending, this.#i = _r(() => {
      if (S.b = this, k) {
        const s = this.#r;
        Yt(), /** @type {Comment} */
        s.nodeType === nt && /** @type {Comment} */
        s.data === Nt ? this.#w() : this.#y();
      } else {
        var i = this.#m();
        try {
          this.#s = le(() => n(i));
        } catch (s) {
          this.error(s);
        }
        this.#d > 0 ? this.#p() : this.#t = !1;
      }
      return () => {
        this.#u?.remove();
      };
    }, ls), k && (this.#e = x);
  }
  #y() {
    try {
      this.#s = le(() => this.#l(this.#e));
    } catch (t) {
      this.error(t);
    }
    this.#t = !1;
  }
  #w() {
    const t = this.#n.pending;
    t && (this.#a = le(() => t(this.#e)), ue.enqueue(() => {
      var r = this.#m();
      this.#s = this.#_(() => (ue.ensure(), le(() => this.#l(r)))), this.#d > 0 ? this.#p() : (Ce(
        /** @type {Effect} */
        this.#a,
        () => {
          this.#a = null;
        }
      ), this.#t = !1);
    }));
  }
  #m() {
    var t = this.#e;
    return this.#t && (this.#u = se(), this.#e.before(this.#u), t = this.#u), t;
  }
  /**
   * Returns `true` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_pending() {
    return this.#t || !!this.parent && this.parent.is_pending();
  }
  has_pending_snippet() {
    return !!this.#n.pending;
  }
  /**
   * @param {() => Effect | null} fn
   */
  #_(t) {
    var r = S, n = M, i = ie;
    ve(this.#i), W(this.#i), et(this.#i.ctx);
    try {
      return t();
    } catch (s) {
      return Ur(s), null;
    } finally {
      ve(r), W(n), et(i);
    }
  }
  #p() {
    const t = (
      /** @type {(anchor: Node) => void} */
      this.#n.pending
    );
    this.#s !== null && (this.#f = document.createDocumentFragment(), this.#f.append(
      /** @type {TemplateNode} */
      this.#u
    ), _n(this.#s, this.#f)), this.#a === null && (this.#a = le(() => t(this.#e)));
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   */
  #g(t) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#g(t);
      return;
    }
    this.#d += t, this.#d === 0 && (this.#t = !1, this.#a && Ce(this.#a, () => {
      this.#a = null;
    }), this.#f && (this.#e.before(this.#f), this.#f = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    this.#g(t), this.#c += t, this.#h && rt(this.#h, this.#c);
  }
  get_effect_pending() {
    return this.#b(), m(
      /** @type {Source<number>} */
      this.#h
    );
  }
  /** @param {unknown} error */
  error(t) {
    var r = this.#n.onerror;
    let n = this.#n.failed;
    if (this.#v || !r && !n)
      throw t;
    this.#s && (K(this.#s), this.#s = null), this.#a && (K(this.#a), this.#a = null), this.#o && (K(this.#o), this.#o = null), k && (V(
      /** @type {TemplateNode} */
      this.#r
    ), er(), V(Et()));
    var i = !1, s = !1;
    const o = () => {
      if (i) {
        rs();
        return;
      }
      i = !0, s && ts(), ue.ensure(), this.#c = 0, this.#o !== null && Ce(this.#o, () => {
        this.#o = null;
      }), this.#t = this.has_pending_snippet(), this.#s = this.#_(() => (this.#v = !1, le(() => this.#l(this.#e)))), this.#d > 0 ? this.#p() : this.#t = !1;
    };
    var a = M;
    try {
      W(null), s = !0, r?.(t, o), s = !1;
    } catch (l) {
      tt(l, this.#i && this.#i.parent);
    } finally {
      W(a);
    }
    n && dt(() => {
      this.#o = this.#_(() => {
        ue.ensure(), this.#v = !0;
        try {
          return le(() => {
            n(
              this.#e,
              () => t,
              () => o
            );
          });
        } catch (l) {
          return tt(
            l,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        } finally {
          this.#v = !1;
        }
      });
    });
  }
}
function cs(e, t, r, n) {
  const i = cr;
  if (r.length === 0 && e.length === 0) {
    n(t.map(i));
    return;
  }
  var s = E, o = (
    /** @type {Effect} */
    S
  ), a = ds();
  function l() {
    Promise.all(r.map((f) => /* @__PURE__ */ hs(f))).then((f) => {
      a();
      try {
        n([...t.map(i), ...f]);
      } catch (u) {
        (o.f & we) === 0 && tt(u, o);
      }
      s?.deactivate(), Tt();
    }).catch((f) => {
      tt(f, o);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    a();
    try {
      return l();
    } finally {
      s?.deactivate(), Tt();
    }
  }) : l();
}
function ds() {
  var e = S, t = M, r = ie, n = E;
  return function(s = !0) {
    ve(e), W(t), et(r), s && n?.activate();
  };
}
function Tt() {
  ve(null), W(null), et(null);
}
// @__NO_SIDE_EFFECTS__
function cr(e) {
  var t = H | Q, r = M !== null && (M.f & H) !== 0 ? (
    /** @type {Derived} */
    M
  ) : null;
  return S !== null && (S.f |= Xe), {
    ctx: ie,
    deps: null,
    effects: null,
    equals: jr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      z
    ),
    wv: 0,
    parent: r ?? S,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function hs(e, t) {
  let r = (
    /** @type {Effect | null} */
    S
  );
  r === null && Bn();
  var n = (
    /** @type {Boundary} */
    r.b
  ), i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Je(
    /** @type {V} */
    z
  ), o = !M, a = /* @__PURE__ */ new Map();
  return ks(() => {
    var l = Ir();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).then(() => {
        f === E && f.committed && f.deactivate(), Tt();
      });
    } catch (d) {
      l.reject(d), Tt();
    }
    var f = (
      /** @type {Batch} */
      E
    );
    if (o) {
      var u = !n.is_pending();
      n.update_pending_count(1), f.increment(u), a.get(f)?.reject(Ke), a.delete(f), a.set(f, l);
    }
    const h = (d, p = void 0) => {
      if (f.activate(), p)
        p !== Ke && (s.f |= Ae, rt(s, p));
      else {
        (s.f & Ae) !== 0 && (s.f ^= Ae), rt(s, d);
        for (const [v, g] of a) {
          if (a.delete(v), v === f) break;
          g.reject(Ke);
        }
      }
      o && (n.update_pending_count(-1), f.decrement(u));
    };
    l.promise.then(h, (d) => h(null, d || "unknown"));
  }), ws(() => {
    for (const l of a.values())
      l.reject(Ke);
  }), new Promise((l) => {
    function f(u) {
      function h() {
        u === i ? l(s) : f(i);
      }
      u.then(h, h);
    }
    f(i);
  });
}
// @__NO_SIDE_EFFECTS__
function vs(e) {
  const t = /* @__PURE__ */ cr(e);
  return t.equals = Hr, t;
}
function Kr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      K(
        /** @type {Effect} */
        t[r]
      );
  }
}
function _s(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & H) === 0)
      return (t.f & we) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function dr(e) {
  var t, r = S;
  ve(_s(e));
  try {
    e.f &= ~Le, Kr(e), t = bn(e);
  } finally {
    ve(r);
  }
  return t;
}
function Zr(e) {
  var t = dr(e);
  if (e.equals(t) || (E?.is_fork || (e.v = t), e.wv = mn()), !Ue)
    if (fe !== null)
      (ft() || E?.is_fork) && fe.set(e, t);
    else {
      var r = (e.f & ce) === 0 ? he : J;
      X(e, r);
    }
}
let rr = /* @__PURE__ */ new Set();
const Ne = /* @__PURE__ */ new Map();
let Gr = !1;
function Je(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: jr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function re(e, t) {
  const r = Je(e);
  return xs(r), r;
}
// @__NO_SIDE_EFFECTS__
function Wr(e, t = !1, r = !0) {
  const n = Je(e);
  return t || (n.equals = Hr), n;
}
function P(e, t, r = !1) {
  M !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!de || (M.f & yr) !== 0) && Jr() && (M.f & (H | Me | ur | yr)) !== 0 && !$e?.includes(e) && es();
  let n = r ? Ye(t) : t;
  return rt(e, n);
}
function rt(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Ue ? Ne.set(e, t) : Ne.set(e, r), e.v = t;
    var n = ue.ensure();
    n.capture(e, r), (e.f & H) !== 0 && ((e.f & Q) !== 0 && dr(
      /** @type {Derived} */
      e
    ), X(e, (e.f & ce) !== 0 ? J : he)), e.wv = mn(), Qr(e, Q), S !== null && (S.f & J) !== 0 && (S.f & (ke | Fe)) === 0 && (ae === null ? Ts([e]) : ae.push(e)), !n.is_fork && rr.size > 0 && !Gr && ps();
  }
  return t;
}
function ps() {
  Gr = !1;
  var e = je;
  Dt(!0);
  const t = Array.from(rr);
  try {
    for (const r of t)
      (r.f & J) !== 0 && X(r, he), vt(r) && ct(r);
  } finally {
    Dt(e);
  }
  rr.clear();
}
function lt(e) {
  P(e, e.v + 1);
}
function Qr(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, i = 0; i < n; i++) {
      var s = r[i], o = s.f, a = (o & Q) === 0;
      if (a && X(s, t), (o & H) !== 0) {
        var l = (
          /** @type {Derived} */
          s
        );
        fe?.delete(l), (o & Le) === 0 && (o & ce && (s.f |= Le), Qr(l, he));
      } else a && ((o & Me) !== 0 && be !== null && be.add(
        /** @type {Effect} */
        s
      ), ze(
        /** @type {Effect} */
        s
      ));
    }
}
function Ye(e) {
  if (typeof e != "object" || e === null || wt in e)
    return e;
  const t = jn(e);
  if (t !== Yn && t !== Cn)
    return e;
  var r = /* @__PURE__ */ new Map(), n = Pr(e), i = /* @__PURE__ */ re(0), s = He, o = (a) => {
    if (He === s)
      return a();
    var l = M, f = He;
    W(null), Sr(s);
    var u = a();
    return W(l), Sr(f), u;
  };
  return n && r.set("length", /* @__PURE__ */ re(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, l, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && Wn();
        var u = r.get(l);
        return u === void 0 ? u = o(() => {
          var h = /* @__PURE__ */ re(f.value);
          return r.set(l, h), h;
        }) : P(u, f.value, !0), !0;
      },
      deleteProperty(a, l) {
        var f = r.get(l);
        if (f === void 0) {
          if (l in a) {
            const u = o(() => /* @__PURE__ */ re(z));
            r.set(l, u), lt(i);
          }
        } else
          P(f, z), lt(i);
        return !0;
      },
      get(a, l, f) {
        if (l === wt)
          return e;
        var u = r.get(l), h = l in a;
        if (u === void 0 && (!h || Ze(a, l)?.writable) && (u = o(() => {
          var p = Ye(h ? a[l] : z), v = /* @__PURE__ */ re(p);
          return v;
        }), r.set(l, u)), u !== void 0) {
          var d = m(u);
          return d === z ? void 0 : d;
        }
        return Reflect.get(a, l, f);
      },
      getOwnPropertyDescriptor(a, l) {
        var f = Reflect.getOwnPropertyDescriptor(a, l);
        if (f && "value" in f) {
          var u = r.get(l);
          u && (f.value = m(u));
        } else if (f === void 0) {
          var h = r.get(l), d = h?.v;
          if (h !== void 0 && d !== z)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return f;
      },
      has(a, l) {
        if (l === wt)
          return !0;
        var f = r.get(l), u = f !== void 0 && f.v !== z || Reflect.has(a, l);
        if (f !== void 0 || S !== null && (!u || Ze(a, l)?.writable)) {
          f === void 0 && (f = o(() => {
            var d = u ? Ye(a[l]) : z, p = /* @__PURE__ */ re(d);
            return p;
          }), r.set(l, f));
          var h = m(f);
          if (h === z)
            return !1;
        }
        return u;
      },
      set(a, l, f, u) {
        var h = r.get(l), d = l in a;
        if (n && l === "length")
          for (var p = f; p < /** @type {Source<number>} */
          h.v; p += 1) {
            var v = r.get(p + "");
            v !== void 0 ? P(v, z) : p in a && (v = o(() => /* @__PURE__ */ re(z)), r.set(p + "", v));
          }
        if (h === void 0)
          (!d || Ze(a, l)?.writable) && (h = o(() => /* @__PURE__ */ re(void 0)), P(h, Ye(f)), r.set(l, h));
        else {
          d = h.v !== z;
          var g = o(() => Ye(f));
          P(h, g);
        }
        var w = Reflect.getOwnPropertyDescriptor(a, l);
        if (w?.set && w.set.call(u, f), !d) {
          if (n && typeof l == "string") {
            var A = (
              /** @type {Source<number>} */
              r.get("length")
            ), N = Number(l);
            Number.isInteger(N) && N >= A.v && P(A, N + 1);
          }
          lt(i);
        }
        return !0;
      },
      ownKeys(a) {
        m(i);
        var l = Reflect.ownKeys(a).filter((h) => {
          var d = r.get(h);
          return d === void 0 || d.v !== z;
        });
        for (var [f, u] of r)
          u.v !== z && !(f in a) && l.push(f);
        return l;
      },
      setPrototypeOf() {
        Qn();
      }
    }
  );
}
var $r, en, tn, rn;
function nr() {
  if ($r === void 0) {
    $r = window, en = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    tn = Ze(t, "firstChild").get, rn = Ze(t, "nextSibling").get, br(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), br(r) && (r.__t = void 0);
  }
}
function se(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Re(e) {
  return (
    /** @type {TemplateNode | null} */
    tn.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function _e(e) {
  return (
    /** @type {TemplateNode | null} */
    rn.call(e)
  );
}
function Z(e, t) {
  if (!k)
    return /* @__PURE__ */ Re(e);
  var r = /* @__PURE__ */ Re(x);
  if (r === null)
    r = x.appendChild(se());
  else if (t && r.nodeType !== Pt) {
    var n = se();
    return r?.before(n), V(n), n;
  }
  return V(r), r;
}
function ms(e, t = !1) {
  if (!k) {
    var r = /* @__PURE__ */ Re(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ _e(r) : r;
  }
  if (t && x?.nodeType !== Pt) {
    var n = se();
    return x?.before(n), V(n), n;
  }
  return x;
}
function G(e, t = 1, r = !1) {
  let n = k ? x : e;
  for (var i; t--; )
    i = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ _e(n);
  if (!k)
    return n;
  if (r && n?.nodeType !== Pt) {
    var s = se();
    return n === null ? i?.after(s) : n.before(s), V(s), s;
  }
  return V(n), n;
}
function hr(e) {
  e.textContent = "";
}
function nn() {
  return !1;
}
function gs(e) {
  k && /* @__PURE__ */ Re(e) !== null && hr(e);
}
let Mr = !1;
function sn() {
  Mr || (Mr = !0, document.addEventListener(
    "reset",
    (e) => {
      Promise.resolve().then(() => {
        if (!e.defaultPrevented)
          for (
            const t of
            /**@type {HTMLFormElement} */
            e.target.elements
          )
            t.__on_r?.();
      });
    },
    // In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
    { capture: !0 }
  ));
}
function vr(e) {
  var t = M, r = S;
  W(null), ve(null);
  try {
    return e();
  } finally {
    W(t), ve(r);
  }
}
function an(e, t, r, n = r) {
  e.addEventListener(t, () => vr(r));
  const i = e.__on_r;
  i ? e.__on_r = () => {
    i(), n(!0);
  } : e.__on_r = () => n(!0), sn();
}
function bs(e) {
  S === null && (M === null && Kn(), Vn()), Ue && qn();
}
function ys(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function pe(e, t, r) {
  var n = S;
  n !== null && (n.f & ne) !== 0 && (e |= ne);
  var i = {
    ctx: ie,
    deps: null,
    nodes: null,
    f: e | Q | ce,
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
  if (r)
    try {
      ct(i), i.f |= Ot;
    } catch (a) {
      throw K(i), a;
    }
  else t !== null && ze(i);
  var s = i;
  if (r && s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
  (s.f & Xe) === 0 && (s = s.first, (e & Me) !== 0 && (e & Qe) !== 0 && s !== null && (s.f |= Qe)), s !== null && (s.parent = n, n !== null && ys(s, n), M !== null && (M.f & H) !== 0 && (e & Fe) === 0)) {
    var o = (
      /** @type {Derived} */
      M
    );
    (o.effects ??= []).push(s);
  }
  return i;
}
function ft() {
  return M !== null && !de;
}
function ws(e) {
  const t = pe(fr, null, !1);
  return X(t, J), t.teardown = e, t;
}
function on(e) {
  bs();
  var t = (
    /** @type {Effect} */
    S.f
  ), r = !M && (t & ke) !== 0 && (t & Ot) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      ie
    );
    (n.e ??= []).push(e);
  } else
    return ln(e);
}
function ln(e) {
  return pe(lr | zn, e, !1);
}
function $s(e) {
  ue.ensure();
  const t = pe(Fe | Xe, e, !0);
  return () => {
    K(t);
  };
}
function Ms(e) {
  ue.ensure();
  const t = pe(Fe | Xe, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? Ce(t, () => {
      K(t), n(void 0);
    }) : (K(t), n(void 0));
  });
}
function fn(e) {
  return pe(lr, e, !1);
}
function ks(e) {
  return pe(ur | Xe, e, !0);
}
function ht(e, t = 0) {
  return pe(fr | t, e, !0);
}
function Bt(e, t = [], r = [], n = []) {
  cs(n, t, r, (i) => {
    pe(fr, () => e(...i.map(m)), !0);
  });
}
function _r(e, t = 0) {
  var r = pe(Me | t, e, !0);
  return r;
}
function le(e) {
  return pe(ke | Xe, e, !0);
}
function un(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Ue, n = M;
    kr(!0), W(null);
    try {
      t.call(null);
    } finally {
      kr(r), W(n);
    }
  }
}
function cn(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const i = r.ac;
    i !== null && vr(() => {
      i.abort(Ke);
    });
    var n = r.next;
    (r.f & Fe) !== 0 ? r.parent = null : K(r, t), r = n;
  }
}
function Ss(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & ke) === 0 && K(t), t = r;
  }
}
function K(e, t = !0) {
  var r = !1;
  (t || (e.f & Yr) !== 0) && e.nodes !== null && e.nodes.end !== null && (Es(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), cn(e, t && !r), At(e, 0), X(e, we);
  var n = e.nodes && e.nodes.t;
  if (n !== null)
    for (const s of n)
      s.stop();
  un(e);
  var i = e.parent;
  i !== null && i.first !== null && dn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Es(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ _e(e);
    e.remove(), e = r;
  }
}
function dn(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Ce(e, t, r = !0) {
  var n = [];
  hn(e, n, !0);
  var i = () => {
    r && K(e), t && t();
  }, s = n.length;
  if (s > 0) {
    var o = () => --s || i();
    for (var a of n)
      a.out(o);
  } else
    i();
}
function hn(e, t, r) {
  if ((e.f & ne) === 0) {
    e.f ^= ne;
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const a of n)
        (a.is_global || r) && t.push(a);
    for (var i = e.first; i !== null; ) {
      var s = i.next, o = (i.f & Qe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & ke) !== 0 && (e.f & Me) !== 0;
      hn(i, t, o ? r : !1), i = s;
    }
  }
}
function pr(e) {
  vn(e, !0);
}
function vn(e, t) {
  if ((e.f & ne) !== 0) {
    e.f ^= ne, (e.f & J) === 0 && (X(e, Q), ze(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, i = (r.f & Qe) !== 0 || (r.f & ke) !== 0;
      vn(r, i ? t : !1), r = n;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const o of s)
        (o.is_global || t) && o.in();
  }
}
function _n(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end; r !== null; ) {
      var i = r === n ? null : /* @__PURE__ */ _e(r);
      t.append(r), r = i;
    }
}
let je = !1;
function Dt(e) {
  je = e;
}
let Ue = !1;
function kr(e) {
  Ue = e;
}
let M = null, de = !1;
function W(e) {
  M = e;
}
let S = null;
function ve(e) {
  S = e;
}
let $e = null;
function xs(e) {
  M !== null && ($e === null ? $e = [e] : $e.push(e));
}
let q = null, te = 0, ae = null;
function Ts(e) {
  ae = e;
}
let pn = 1, ut = 0, He = ut;
function Sr(e) {
  He = e;
}
function mn() {
  return ++pn;
}
function vt(e) {
  var t = e.f;
  if ((t & Q) !== 0)
    return !0;
  if (t & H && (e.f &= ~Le), (t & he) !== 0) {
    var r = e.deps;
    if (r !== null)
      for (var n = r.length, i = 0; i < n; i++) {
        var s = r[i];
        if (vt(
          /** @type {Derived} */
          s
        ) && Zr(
          /** @type {Derived} */
          s
        ), s.wv > e.wv)
          return !0;
      }
    (t & ce) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    fe === null && X(e, J);
  }
  return !1;
}
function gn(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !$e?.includes(e))
    for (var i = 0; i < n.length; i++) {
      var s = n[i];
      (s.f & H) !== 0 ? gn(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (r ? X(s, Q) : (s.f & J) !== 0 && X(s, he), ze(
        /** @type {Effect} */
        s
      ));
    }
}
function bn(e) {
  var t = q, r = te, n = ae, i = M, s = $e, o = ie, a = de, l = He, f = e.f;
  q = /** @type {null | Value[]} */
  null, te = 0, ae = null, M = (f & (ke | Fe)) === 0 ? e : null, $e = null, et(e.ctx), de = !1, He = ++ut, e.ac !== null && (vr(() => {
    e.ac.abort(Ke);
  }), e.ac = null);
  try {
    e.f |= Qt;
    var u = (
      /** @type {Function} */
      e.fn
    ), h = u(), d = e.deps;
    if (q !== null) {
      var p;
      if (At(e, te), d !== null && te > 0)
        for (d.length = te + q.length, p = 0; p < q.length; p++)
          d[te + p] = q[p];
      else
        e.deps = d = q;
      if (ft() && (e.f & ce) !== 0)
        for (p = te; p < d.length; p++)
          (d[p].reactions ??= []).push(e);
    } else d !== null && te < d.length && (At(e, te), d.length = te);
    if (Jr() && ae !== null && !de && d !== null && (e.f & (H | he | Q)) === 0)
      for (p = 0; p < /** @type {Source[]} */
      ae.length; p++)
        gn(
          ae[p],
          /** @type {Effect} */
          e
        );
    return i !== null && i !== e && (ut++, ae !== null && (n === null ? n = ae : n.push(.../** @type {Source[]} */
    ae))), (e.f & Ae) !== 0 && (e.f ^= Ae), h;
  } catch (v) {
    return Ur(v);
  } finally {
    e.f ^= Qt, q = t, te = r, ae = n, M = i, $e = s, et(o), de = a, He = l;
  }
}
function Ds(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = In.call(r, e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  r === null && (t.f & H) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (q === null || !q.includes(t)) && (X(t, he), (t.f & ce) !== 0 && (t.f ^= ce, t.f &= ~Le), Kr(
    /** @type {Derived} **/
    t
  ), At(
    /** @type {Derived} **/
    t,
    0
  ));
}
function At(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      Ds(e, r[n]);
}
function ct(e) {
  var t = e.f;
  if ((t & we) === 0) {
    X(e, J);
    var r = S, n = je;
    S = e, je = !0;
    try {
      (t & (Me | Ln)) !== 0 ? Ss(e) : cn(e), un(e);
      var i = bn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = pn;
      var s;
      Wt && ss && (e.f & Q) !== 0 && e.deps;
    } finally {
      je = n, S = r;
    }
  }
}
async function As() {
  await Promise.resolve(), xt();
}
function m(e) {
  var t = e.f, r = (t & H) !== 0;
  if (M !== null && !de) {
    var n = S !== null && (S.f & we) !== 0;
    if (!n && !$e?.includes(e)) {
      var i = M.deps;
      if ((M.f & Qt) !== 0)
        e.rv < ut && (e.rv = ut, q === null && i !== null && i[te] === e ? te++ : q === null ? q = [e] : q.includes(e) || q.push(e));
      else {
        (M.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [M] : s.includes(M) || s.push(M);
      }
    }
  }
  if (Ue) {
    if (Ne.has(e))
      return Ne.get(e);
    if (r) {
      var o = (
        /** @type {Derived} */
        e
      ), a = o.v;
      return ((o.f & J) === 0 && o.reactions !== null || wn(o)) && (a = dr(o)), Ne.set(o, a), a;
    }
  } else r && (!fe?.has(e) || E?.is_fork && !ft()) && (o = /** @type {Derived} */
  e, vt(o) && Zr(o), je && ft() && (o.f & ce) === 0 && yn(o));
  if (fe?.has(e))
    return fe.get(e);
  if ((e.f & Ae) !== 0)
    throw e.v;
  return e.v;
}
function yn(e) {
  if (e.deps !== null) {
    e.f ^= ce;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & H) !== 0 && (t.f & ce) === 0 && yn(
        /** @type {Derived} */
        t
      );
  }
}
function wn(e) {
  if (e.v === z) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Ne.has(t) || (t.f & H) !== 0 && wn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function st(e) {
  var t = de;
  try {
    return de = !0, e();
  } finally {
    de = t;
  }
}
const Ns = -7169;
function X(e, t) {
  e.f = e.f & Ns | t;
}
const $n = /* @__PURE__ */ new Set(), sr = /* @__PURE__ */ new Set();
function Rs(e) {
  for (var t = 0; t < e.length; t++)
    $n.add(e[t]);
  for (var r of sr)
    r(e);
}
let Er = null;
function bt(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  Er = e;
  var o = 0, a = Er === e && e.__root;
  if (a) {
    var l = i.indexOf(a);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    l <= f && (o = l);
  }
  if (s = /** @type {Element} */
  i[o] || e.target, s !== t) {
    St(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || r;
      }
    });
    var u = M, h = S;
    W(null), ve(null);
    try {
      for (var d, p = []; s !== null; ) {
        var v = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s["__" + n];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (w) {
          d ? p.push(w) : d = w;
        }
        if (e.cancelBubble || v === t || v === null)
          break;
        s = v;
      }
      if (d) {
        for (let w of p)
          queueMicrotask(() => {
            throw w;
          });
        throw d;
      }
    } finally {
      e.__root = t, delete e.currentTarget, W(u), ve(h);
    }
  }
}
function Fs(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Ge(e, t) {
  var r = (
    /** @type {Effect} */
    S
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function jt(e, t) {
  var r = (t & Fn) !== 0, n = (t & On) !== 0, i, s = !e.startsWith("<!>");
  return () => {
    if (k)
      return Ge(x, null), x;
    i === void 0 && (i = Fs(s ? e : "<!>" + e), r || (i = /** @type {TemplateNode} */
    /* @__PURE__ */ Re(i)));
    var o = (
      /** @type {TemplateNode} */
      n || en ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (r) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Re(o)
      ), l = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      Ge(a, l);
    } else
      Ge(o, o);
    return o;
  };
}
function Os(e = "") {
  if (!k) {
    var t = se(e + "");
    return Ge(t, t), t;
  }
  var r = x;
  return r.nodeType !== Pt && (r.before(r = se()), V(r)), Ge(r, r), r;
}
function Ve(e, t) {
  if (k) {
    var r = (
      /** @type {Effect & { nodes: EffectNodes }} */
      S
    );
    ((r.f & Ot) === 0 || r.nodes.end === null) && (r.nodes.end = x), Yt();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
const Ps = ["touchstart", "touchmove"];
function Is(e) {
  return Ps.includes(e);
}
function qt(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ??= e.nodeValue) && (e.__t = r, e.nodeValue = r + "");
}
function Mn(e, t) {
  return kn(e, t);
}
function Ys(e, t) {
  nr(), t.intro = t.intro ?? !1;
  const r = t.target, n = k, i = x;
  try {
    for (var s = /* @__PURE__ */ Re(r); s && (s.nodeType !== nt || /** @type {Comment} */
    s.data !== Or); )
      s = /* @__PURE__ */ _e(s);
    if (!s)
      throw We;
    ye(!0), V(
      /** @type {Comment} */
      s
    );
    const o = kn(e, { ...t, anchor: s });
    return ye(!1), /**  @type {Exports} */
    o;
  } catch (o) {
    if (o instanceof Error && o.message.split(`
`).some((a) => a.startsWith("https://svelte.dev/e/")))
      throw o;
    return o !== We && console.warn("Failed to hydrate: ", o), t.recover === !1 && Gn(), nr(), hr(r), ye(!1), Mn(e, t);
  } finally {
    ye(n), V(i);
  }
}
const qe = /* @__PURE__ */ new Map();
function kn(e, { target: t, anchor: r, props: n = {}, events: i, context: s, intro: o = !0 }) {
  nr();
  var a = /* @__PURE__ */ new Set(), l = (h) => {
    for (var d = 0; d < h.length; d++) {
      var p = h[d];
      if (!a.has(p)) {
        a.add(p);
        var v = Is(p);
        t.addEventListener(p, bt, { passive: v });
        var g = qe.get(p);
        g === void 0 ? (document.addEventListener(p, bt, { passive: v }), qe.set(p, 1)) : qe.set(p, g + 1);
      }
    }
  };
  l(Rt($n)), sr.add(l);
  var f = void 0, u = Ms(() => {
    var h = r ?? t.appendChild(se());
    return fs(
      /** @type {TemplateNode} */
      h,
      {
        pending: () => {
        }
      },
      (d) => {
        if (s) {
          Lr({});
          var p = (
            /** @type {ComponentContext} */
            ie
          );
          p.c = s;
        }
        if (i && (n.$$events = i), k && Ge(
          /** @type {TemplateNode} */
          d,
          null
        ), f = e(d, n) || {}, k && (S.nodes.end = x, x === null || x.nodeType !== nt || /** @type {Comment} */
        x.data !== or))
          throw It(), We;
        s && zr();
      }
    ), () => {
      for (var d of a) {
        t.removeEventListener(d, bt);
        var p = (
          /** @type {number} */
          qe.get(d)
        );
        --p === 0 ? (document.removeEventListener(d, bt), qe.delete(d)) : qe.set(d, p);
      }
      sr.delete(l), h !== r && h.parentNode?.removeChild(h);
    };
  });
  return ir.set(f, u), f;
}
let ir = /* @__PURE__ */ new WeakMap();
function Cs(e, t) {
  const r = ir.get(e);
  return r ? (ir.delete(e), r(t)) : Promise.resolve();
}
class js {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #t = /* @__PURE__ */ new Map();
  /**
   * Map of keys to effects that are currently rendered in the DOM.
   * These effects are visible and actively part of the document tree.
   * Example:
   * ```
   * {#if condition}
   * 	foo
   * {:else}
   * 	bar
   * {/if}
   * ```
   * Can result in the entries `true->Effect` and `false->Effect`
   * @type {Map<Key, Effect>}
   */
  #e = /* @__PURE__ */ new Map();
  /**
   * Similar to #onscreen with respect to the keys, but contains branches that are not yet
   * in the DOM, because their insertion is deferred.
   * @type {Map<Key, Branch>}
   */
  #r = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #n = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #l = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, r = !0) {
    this.anchor = t, this.#l = r;
  }
  #i = () => {
    var t = (
      /** @type {Batch} */
      E
    );
    if (this.#t.has(t)) {
      var r = (
        /** @type {Key} */
        this.#t.get(t)
      ), n = this.#e.get(r);
      if (n)
        pr(n), this.#n.delete(r);
      else {
        var i = this.#r.get(r);
        i && (this.#e.set(r, i.effect), this.#r.delete(r), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), n = i.effect);
      }
      for (const [s, o] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const a = this.#r.get(o);
        a && (K(a.effect), this.#r.delete(o));
      }
      for (const [s, o] of this.#e) {
        if (s === r || this.#n.has(s)) continue;
        const a = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var f = document.createDocumentFragment();
            _n(o, f), f.append(se()), this.#r.set(s, { effect: o, fragment: f });
          } else
            K(o);
          this.#n.delete(s), this.#e.delete(s);
        };
        this.#l || !n ? (this.#n.add(s), Ce(o, a, !1)) : a();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #s = (t) => {
    this.#t.delete(t);
    const r = Array.from(this.#t.values());
    for (const [n, i] of this.#r)
      r.includes(n) || (K(i.effect), this.#r.delete(n));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, r) {
    var n = (
      /** @type {Batch} */
      E
    ), i = nn();
    if (r && !this.#e.has(t) && !this.#r.has(t))
      if (i) {
        var s = document.createDocumentFragment(), o = se();
        s.append(o), this.#r.set(t, {
          effect: le(() => r(o)),
          fragment: s
        });
      } else
        this.#e.set(
          t,
          le(() => r(this.anchor))
        );
    if (this.#t.set(n, t), i) {
      for (const [a, l] of this.#e)
        a === t ? n.skipped_effects.delete(l) : n.skipped_effects.add(l);
      for (const [a, l] of this.#r)
        a === t ? n.skipped_effects.delete(l.effect) : n.skipped_effects.add(l.effect);
      n.oncommit(this.#i), n.ondiscard(this.#s);
    } else
      k && (this.anchor = x), this.#i();
  }
}
function Hs(e) {
  ie === null && Un(), on(() => {
    const t = st(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Vt(e, t, r = !1) {
  k && Yt();
  var n = new js(e), i = r ? Qe : 0;
  function s(o, a) {
    if (k) {
      const f = Cr(e) === Nt;
      if (o === f) {
        var l = Et();
        V(l), n.anchor = l, ye(!1), n.ensure(o, a), ye(!0);
        return;
      }
    }
    n.ensure(o, a);
  }
  _r(() => {
    var o = !1;
    t((a, l = !0) => {
      o = !0, s(l, a);
    }), o || s(!1, null);
  }, i);
}
function Ls(e, t) {
  return t;
}
function zs(e, t, r) {
  for (var n = [], i = t.length, s, o = t.length, a = 0; a < i; a++) {
    let h = t[a];
    Ce(
      h,
      () => {
        if (s) {
          if (s.pending.delete(h), s.done.add(h), s.pending.size === 0) {
            var d = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            ar(Rt(s.done)), d.delete(s), d.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var l = n.length === 0 && r !== null;
    if (l) {
      var f = (
        /** @type {Element} */
        r
      ), u = (
        /** @type {Element} */
        f.parentNode
      );
      hr(u), u.append(f), e.items.clear();
    }
    ar(t, !l);
  } else
    s = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(s);
}
function ar(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    K(e[r], t);
}
var xr;
function Js(e, t, r, n, i, s = null) {
  var o = e, a = /* @__PURE__ */ new Map();
  {
    var l = (
      /** @type {Element} */
      e
    );
    o = k ? V(/* @__PURE__ */ Re(l)) : l.appendChild(se());
  }
  k && Yt();
  var f = null, u = /* @__PURE__ */ vs(() => {
    var w = r();
    return Pr(w) ? w : w == null ? [] : Rt(w);
  }), h, d = !0;
  function p() {
    g.fallback = f, Xs(g, h, o, t, n), f !== null && (h.length === 0 ? (f.f & De) === 0 ? pr(f) : (f.f ^= De, at(f, null, o)) : Ce(f, () => {
      f = null;
    }));
  }
  var v = _r(() => {
    h = /** @type {V[]} */
    m(u);
    var w = h.length;
    let A = !1;
    if (k) {
      var N = Cr(o) === Nt;
      N !== (w === 0) && (o = Et(), V(o), ye(!1), A = !0);
    }
    for (var I = /* @__PURE__ */ new Set(), C = (
      /** @type {Batch} */
      E
    ), j = nn(), L = 0; L < w; L += 1) {
      k && x.nodeType === nt && /** @type {Comment} */
      x.data === or && (o = /** @type {Comment} */
      x, A = !0, ye(!1));
      var me = h[L], D = n(me, L), Y = d ? null : a.get(D);
      Y ? (Y.v && rt(Y.v, me), Y.i && rt(Y.i, L), j && C.skipped_effects.delete(Y.e)) : (Y = Us(
        a,
        d ? o : xr ??= se(),
        me,
        D,
        L,
        i,
        t,
        r
      ), d || (Y.e.f |= De), a.set(D, Y)), I.add(D);
    }
    if (w === 0 && s && !f && (d ? f = le(() => s(o)) : (f = le(() => s(xr ??= se())), f.f |= De)), k && w > 0 && V(Et()), !d)
      if (j) {
        for (const [R, _] of a)
          I.has(R) || C.skipped_effects.add(_.e);
        C.oncommit(p), C.ondiscard(() => {
        });
      } else
        p();
    A && ye(!0), m(u);
  }), g = { effect: v, items: a, outrogroups: null, fallback: f };
  d = !1, k && (o = x);
}
function Xs(e, t, r, n, i) {
  var s = t.length, o = e.items, a = e.effect.first, l, f = null, u = [], h = [], d, p, v, g;
  for (g = 0; g < s; g += 1) {
    if (d = t[g], p = i(d, g), v = /** @type {EachItem} */
    o.get(p).e, e.outrogroups !== null)
      for (const D of e.outrogroups)
        D.pending.delete(v), D.done.delete(v);
    if ((v.f & De) !== 0)
      if (v.f ^= De, v === a)
        at(v, null, r);
      else {
        var w = f ? f.next : a;
        v === e.effect.last && (e.effect.last = v.prev), v.prev && (v.prev.next = v.next), v.next && (v.next.prev = v.prev), Te(e, f, v), Te(e, v, w), at(v, w, r), f = v, u = [], h = [], a = f.next;
        continue;
      }
    if ((v.f & ne) !== 0 && pr(v), v !== a) {
      if (l !== void 0 && l.has(v)) {
        if (u.length < h.length) {
          var A = h[0], N;
          f = A.prev;
          var I = u[0], C = u[u.length - 1];
          for (N = 0; N < u.length; N += 1)
            at(u[N], A, r);
          for (N = 0; N < h.length; N += 1)
            l.delete(h[N]);
          Te(e, I.prev, C.next), Te(e, f, I), Te(e, C, A), a = A, f = C, g -= 1, u = [], h = [];
        } else
          l.delete(v), at(v, a, r), Te(e, v.prev, v.next), Te(e, v, f === null ? e.effect.first : f.next), Te(e, f, v), f = v;
        continue;
      }
      for (u = [], h = []; a !== null && a !== v; )
        (l ??= /* @__PURE__ */ new Set()).add(a), h.push(a), a = a.next;
      if (a === null)
        continue;
    }
    (v.f & De) === 0 && u.push(v), f = v, a = v.next;
  }
  if (e.outrogroups !== null) {
    for (const D of e.outrogroups)
      D.pending.size === 0 && (ar(Rt(D.done)), e.outrogroups?.delete(D));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (a !== null || l !== void 0) {
    var j = [];
    if (l !== void 0)
      for (v of l)
        (v.f & ne) === 0 && j.push(v);
    for (; a !== null; )
      (a.f & ne) === 0 && a !== e.fallback && j.push(a), a = a.next;
    var L = j.length;
    if (L > 0) {
      var me = s === 0 ? r : null;
      zs(e, j, me);
    }
  }
}
function Us(e, t, r, n, i, s, o, a) {
  var l = (o & An) !== 0 ? (o & Rn) === 0 ? /* @__PURE__ */ Wr(r, !1, !1) : Je(r) : null, f = (o & Nn) !== 0 ? Je(i) : null;
  return {
    v: l,
    i: f,
    e: le(() => (s(t, l ?? r, f ?? i, a), () => {
      e.delete(n);
    }))
  };
}
function at(e, t, r) {
  if (e.nodes)
    for (var n = e.nodes.start, i = e.nodes.end, s = t && (t.f & De) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; n !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ _e(n)
      );
      if (s.before(n), n === i)
        return;
      n = o;
    }
}
function Te(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
function Bs(e, t) {
  fn(() => {
    var r = e.getRootNode(), n = (
      /** @type {ShadowRoot} */
      r.host ? (
        /** @type {ShadowRoot} */
        r
      ) : (
        /** @type {Document} */
        r.head ?? /** @type {Document} */
        r.ownerDocument.head
      )
    );
    if (!n.querySelector("#" + t.hash)) {
      const i = document.createElement("style");
      i.id = t.hash, i.textContent = t.code, n.appendChild(i);
    }
  });
}
const qs = /* @__PURE__ */ Symbol("is custom element"), Vs = /* @__PURE__ */ Symbol("is html");
function Tr(e) {
  if (k) {
    var t = !1, r = () => {
      if (!t) {
        if (t = !0, e.hasAttribute("value")) {
          var n = e.value;
          Dr(e, "value", null), e.value = n;
        }
        if (e.hasAttribute("checked")) {
          var i = e.checked;
          Dr(e, "checked", null), e.checked = i;
        }
      }
    };
    e.__on_r = r, dt(r), sn();
  }
}
function Dr(e, t, r, n) {
  var i = Ks(e);
  k && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || i[t] !== (i[t] = r) && (t === "loading" && (e[Xn] = r), e.removeAttribute(t));
}
function Ks(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [qs]: e.nodeName.includes("-"),
      [Vs]: e.namespaceURI === Pn
    }
  );
}
function Ar(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet();
  an(e, "input", async (i) => {
    var s = i ? e.defaultValue : e.value;
    if (s = Kt(e) ? Zt(s) : s, r(s), E !== null && n.add(E), await As(), s !== (s = t())) {
      var o = e.selectionStart, a = e.selectionEnd, l = e.value.length;
      if (e.value = s ?? "", a !== null) {
        var f = e.value.length;
        o === a && a === l && f > l ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = o, e.selectionEnd = Math.min(a, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (k && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  st(t) == null && e.value) && (r(Kt(e) ? Zt(e.value) : e.value), E !== null && n.add(E)), ht(() => {
    var i = t();
    if (e === document.activeElement) {
      var s = (
        /** @type {Batch} */
        $t ?? E
      );
      if (n.has(s))
        return;
    }
    Kt(e) && i === Zt(e.value) || e.type === "date" && !i && !e.value || i !== e.value && (e.value = i ?? "");
  });
}
function Zs(e, t, r = t) {
  an(e, "change", (n) => {
    var i = n ? e.defaultChecked : e.checked;
    r(i);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  (k && e.defaultChecked !== e.checked || // If defaultChecked is set, then checked == defaultChecked
  st(t) == null) && r(e.checked), ht(() => {
    var n = t();
    e.checked = !!n;
  });
}
function Kt(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function Zt(e) {
  return e === "" ? null : +e;
}
function Nr(e, t) {
  return e === t || e?.[wt] === t;
}
function yt(e = {}, t, r, n) {
  return fn(() => {
    var i, s;
    return ht(() => {
      i = s, s = [], st(() => {
        e !== r(...s) && (t(e, ...s), i && Nr(r(...i), e) && t(null, ...i));
      });
    }), () => {
      dt(() => {
        s && Nr(r(...s), e) && t(null, ...s);
      });
    };
  }), e;
}
function Rr(e, t, r, n) {
  var i = (
    /** @type {V} */
    n
  ), s = !0, o = () => (s && (s = !1, i = /** @type {V} */
  n), i), a;
  a = /** @type {V} */
  e[t], a === void 0 && n !== void 0 && (a = o());
  var l;
  l = () => {
    var d = (
      /** @type {V} */
      e[t]
    );
    return d === void 0 ? o() : (s = !0, d);
  };
  var f = !1, u = /* @__PURE__ */ cr(() => (f = !1, l())), h = (
    /** @type {Effect} */
    S
  );
  return (
    /** @type {() => V} */
    (function(d, p) {
      if (arguments.length > 0) {
        const v = p ? m(u) : d;
        return P(u, v), f = !0, i !== void 0 && (i = v), d;
      }
      return Ue && f || (h.f & we) !== 0 ? u.v : m(u);
    })
  );
}
function Gs(e) {
  return new Ws(e);
}
class Ws {
  /** @type {any} */
  #t;
  /** @type {Record<string, any>} */
  #e;
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    var r = /* @__PURE__ */ new Map(), n = (s, o) => {
      var a = /* @__PURE__ */ Wr(o, !1, !1);
      return r.set(s, a), a;
    };
    const i = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(s, o) {
          return m(r.get(o) ?? n(o, Reflect.get(s, o)));
        },
        has(s, o) {
          return o === Jn ? !0 : (m(r.get(o) ?? n(o, Reflect.get(s, o))), Reflect.has(s, o));
        },
        set(s, o, a) {
          return P(r.get(o) ?? n(o, a), a), Reflect.set(s, o, a);
        }
      }
    );
    this.#e = (t.hydrate ? Ys : Mn)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: i,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    }), (!t?.props?.$$host || t.sync === !1) && xt(), this.#t = i.$$events;
    for (const s of Object.keys(this.#e))
      s === "$set" || s === "$destroy" || s === "$on" || St(this, s, {
        get() {
          return this.#e[s];
        },
        /** @param {any} value */
        set(o) {
          this.#e[s] = o;
        },
        enumerable: !0
      });
    this.#e.$set = /** @param {Record<string, any>} next */
    (s) => {
      Object.assign(i, s);
    }, this.#e.$destroy = () => {
      Cs(this.#e);
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    this.#e.$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    this.#t[t] = this.#t[t] || [];
    const n = (...i) => r.call(this, ...i);
    return this.#t[t].push(n), () => {
      this.#t[t] = this.#t[t].filter(
        /** @param {any} fn */
        (i) => i !== n
      );
    };
  }
  $destroy() {
    this.#e.$destroy();
  }
}
let Sn;
typeof HTMLElement == "function" && (Sn = class extends HTMLElement {
  /** The Svelte component constructor */
  $$ctor;
  /** Slots */
  $$s;
  /** @type {any} The Svelte component instance */
  $$c;
  /** Whether or not the custom element is connected */
  $$cn = !1;
  /** @type {Record<string, any>} Component props data */
  $$d = {};
  /** `true` if currently in the process of reflecting component props back to attributes */
  $$r = !1;
  /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
  $$p_d = {};
  /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
  $$l = {};
  /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
  $$l_u = /* @__PURE__ */ new Map();
  /** @type {any} The managed render effect for reflecting attributes */
  $$me;
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(e, t, r) {
    super(), this.$$ctor = e, this.$$s = t, r && this.attachShadow({ mode: "open" });
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  addEventListener(e, t, r) {
    if (this.$$l[e] = this.$$l[e] || [], this.$$l[e].push(t), this.$$c) {
      const n = this.$$c.$on(e, t);
      this.$$l_u.set(t, n);
    }
    super.addEventListener(e, t, r);
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  removeEventListener(e, t, r) {
    if (super.removeEventListener(e, t, r), this.$$c) {
      const n = this.$$l_u.get(t);
      n && (n(), this.$$l_u.delete(t));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let e = function(n) {
        return (i) => {
          const s = document.createElement("slot");
          n !== "default" && (s.name = n), Ve(i, s);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const t = {}, r = Qs(this);
      for (const n of this.$$s)
        n in r && (n === "default" && !this.$$d.children ? (this.$$d.children = e(n), t.default = !0) : t[n] = e(n));
      for (const n of this.attributes) {
        const i = this.$$g_p(n.name);
        i in this.$$d || (this.$$d[i] = Mt(i, n.value, this.$$p_d, "toProp"));
      }
      for (const n in this.$$p_d)
        !(n in this.$$d) && this[n] !== void 0 && (this.$$d[n] = this[n], delete this[n]);
      this.$$c = Gs({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: t,
          $$host: this
        }
      }), this.$$me = $s(() => {
        ht(() => {
          this.$$r = !0;
          for (const n of kt(this.$$c)) {
            if (!this.$$p_d[n]?.reflect) continue;
            this.$$d[n] = this.$$c[n];
            const i = Mt(
              n,
              this.$$d[n],
              this.$$p_d,
              "toAttribute"
            );
            i == null ? this.removeAttribute(this.$$p_d[n].attribute || n) : this.setAttribute(this.$$p_d[n].attribute || n, i);
          }
          this.$$r = !1;
        });
      });
      for (const n in this.$$l)
        for (const i of this.$$l[n]) {
          const s = this.$$c.$on(n, i);
          this.$$l_u.set(i, s);
        }
      this.$$l = {};
    }
  }
  // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
  // and setting attributes through setAttribute etc, this is helpful
  /**
   * @param {string} attr
   * @param {string} _oldValue
   * @param {string} newValue
   */
  attributeChangedCallback(e, t, r) {
    this.$$r || (e = this.$$g_p(e), this.$$d[e] = Mt(e, r, this.$$p_d, "toProp"), this.$$c?.$set({ [e]: this.$$d[e] }));
  }
  disconnectedCallback() {
    this.$$cn = !1, Promise.resolve().then(() => {
      !this.$$cn && this.$$c && (this.$$c.$destroy(), this.$$me(), this.$$c = void 0);
    });
  }
  /**
   * @param {string} attribute_name
   */
  $$g_p(e) {
    return kt(this.$$p_d).find(
      (t) => this.$$p_d[t].attribute === e || !this.$$p_d[t].attribute && t.toLowerCase() === e
    ) || e;
  }
});
function Mt(e, t, r, n) {
  const i = r[e]?.type;
  if (t = i === "Boolean" && typeof t != "boolean" ? t != null : t, !n || !r[e])
    return t;
  if (n === "toAttribute")
    switch (i) {
      case "Object":
      case "Array":
        return t == null ? null : JSON.stringify(t);
      case "Boolean":
        return t ? "" : null;
      case "Number":
        return t ?? null;
      default:
        return t;
    }
  else
    switch (i) {
      case "Object":
      case "Array":
        return t && JSON.parse(t);
      case "Boolean":
        return t;
      // conversion already handled above
      case "Number":
        return t != null ? +t : t;
      default:
        return t;
    }
}
function Qs(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function ei(e, t, r, n, i, s) {
  let o = class extends Sn {
    constructor() {
      super(e, r, i), this.$$p_d = t;
    }
    static get observedAttributes() {
      return kt(t).map(
        (a) => (t[a].attribute || a).toLowerCase()
      );
    }
  };
  return kt(t).forEach((a) => {
    St(o.prototype, a, {
      get() {
        return this.$$c && a in this.$$c ? this.$$c[a] : this.$$d[a];
      },
      set(l) {
        l = Mt(a, l, t), this.$$d[a] = l;
        var f = this.$$c;
        if (f) {
          var u = Ze(f, a)?.get;
          u ? f[a] = l : f.$set({ [a]: l });
        }
      }
    });
  }), n.forEach((a) => {
    St(o.prototype, a, {
      get() {
        return this.$$c?.[a];
      }
    });
  }), e.element = /** @type {any} */
  o, o;
}
function ti(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Gt = { exports: {} }, Fr;
function ri() {
  return Fr || (Fr = 1, (function(e) {
    (function() {
      var t = {
        de_DE: {
          identifier: "de-DE",
          days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
          shortDays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
          months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
          shortMonths: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
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
          days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          ordinalSuffixes: [
            "st",
            "nd",
            "rd",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "st",
            "nd",
            "rd",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "st"
          ],
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
          days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          ordinalSuffixes: [
            "st",
            "nd",
            "rd",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "st",
            "nd",
            "rd",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
            "st"
          ],
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
          days: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
          shortDays: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
          months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
          shortMonths: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
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
          days: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
          shortDays: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
          months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
          shortMonths: ["janv.", "févr.", "mars", "avril", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
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
          days: ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"],
          shortDays: ["dom", "lun", "mar", "mer", "gio", "ven", "sab"],
          months: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
          shortMonths: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
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
          days: ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
          shortDays: ["zo", "ma", "di", "wo", "do", "vr", "za"],
          months: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
          shortMonths: ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
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
          days: ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"],
          shortDays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
          months: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
          shortMonths: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
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
          days: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
          shortDays: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
          months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
          shortMonths: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
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
          days: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
          shortDays: ["Paz", "Pzt", "Sal", "Çrş", "Prş", "Cum", "Cts"],
          months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
          shortMonths: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
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
        // By michaeljayt<michaeljayt@gmail.com>
        // https://github.com/michaeljayt/strftime/commit/bcb4c12743811d51e568175aa7bff3fd2a77cef3
        zh_CN: {
          identifier: "zh-CN",
          days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
          shortDays: ["日", "一", "二", "三", "四", "五", "六"],
          months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
          shortMonths: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
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
      }, r = t.en_US, n = new i(r, 0, !1);
      e.exports = n, typeof Date.now != "function" && (Date.now = function() {
        return +/* @__PURE__ */ new Date();
      });
      function i(g, w, A) {
        var N = g || r, I = w || 0, C = A || !1, j = 0, L;
        function me(R, _) {
          var y;
          if (_) {
            if (y = _.getTime(), C) {
              var b = u(_);
              if (_ = new Date(y + b + I), u(_) !== b) {
                var T = u(_);
                _ = new Date(y + T + I);
              }
            }
          } else {
            var F = Date.now();
            F > j ? (j = F, L = new Date(j), y = j, C && (L = new Date(j + u(L) + I))) : y = j, _ = L;
          }
          return D(R, _, N, y);
        }
        function D(R, _, y, F) {
          for (var b = "", T = null, ge = !1, Be = R.length, Oe = !1, Se = 0; Se < Be; Se++) {
            var Ee = R.charCodeAt(Se);
            if (ge === !0) {
              if (Ee === 45) {
                T = "";
                continue;
              } else if (Ee === 95) {
                T = " ";
                continue;
              } else if (Ee === 48) {
                T = "0";
                continue;
              } else if (Ee === 58) {
                Oe && v("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), Oe = !0;
                continue;
              }
              switch (Ee) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  b += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  b += y.days[_.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  b += y.months[_.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  b += s(Math.floor(_.getFullYear() / 100), T);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  b += D(y.formats.D, _, y, F);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  b += D(y.formats.F, _, y, F);
                  break;
                // '00'
                // case 'H':
                case 72:
                  b += s(_.getHours(), T);
                  break;
                // '12'
                // case 'I':
                case 73:
                  b += s(a(_.getHours()), T);
                  break;
                // '000'
                // case 'L':
                case 76:
                  b += o(Math.floor(F % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  b += s(_.getMinutes(), T);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  b += _.getHours() < 12 ? y.am : y.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  b += D(y.formats.R, _, y, F);
                  break;
                // '00'
                // case 'S':
                case 83:
                  b += s(_.getSeconds(), T);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  b += D(y.formats.T, _, y, F);
                  break;
                // '00'
                // case 'U':
                case 85:
                  b += s(l(_, "sunday"), T);
                  break;
                // '00'
                // case 'W':
                case 87:
                  b += s(l(_, "monday"), T);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  b += D(y.formats.X, _, y, F);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  b += _.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (C && I === 0)
                    b += "GMT";
                  else {
                    var _t = h(_);
                    b += _t || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  b += y.shortDays[_.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  b += y.shortMonths[_.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  b += D(y.formats.c, _, y, F);
                  break;
                // '01'
                // case 'd':
                case 100:
                  b += s(_.getDate(), T);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  b += s(_.getDate(), T ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  b += y.shortMonths[_.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var it = new Date(_.getFullYear(), 0, 1), ee = Math.ceil((_.getTime() - it.getTime()) / (1e3 * 60 * 60 * 24));
                  b += o(ee);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  b += s(_.getHours(), T ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  b += s(a(_.getHours()), T ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  b += s(_.getMonth() + 1, T);
                  break;
                // '\n'
                // case 'n':
                case 110:
                  b += `
`;
                  break;
                // '1st'
                // case 'o':
                case 111:
                  var ee = _.getDate();
                  y.ordinalSuffixes ? b += String(ee) + (y.ordinalSuffixes[ee - 1] || f(ee)) : b += String(ee) + f(ee);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  b += _.getHours() < 12 ? y.AM : y.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  b += D(y.formats.r, _, y, F);
                  break;
                // '0'
                // case 's':
                case 115:
                  b += Math.floor(F / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  b += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var ee = _.getDay();
                  b += ee === 0 ? 7 : ee;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  b += D(y.formats.v, _, y, F);
                  break;
                // '4'
                // case 'w':
                case 119:
                  b += _.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  b += D(y.formats.x, _, y, F);
                  break;
                // '70'
                // case 'y':
                case 121:
                  b += s(_.getFullYear() % 100, T);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (C && I === 0)
                    b += Oe ? "+00:00" : "+0000";
                  else {
                    var xe;
                    I !== 0 ? xe = I / (60 * 1e3) : xe = -_.getTimezoneOffset();
                    var Pe = xe < 0 ? "-" : "+", Ht = Oe ? ":" : "", Lt = Math.floor(Math.abs(xe / 60)), zt = Math.abs(xe % 60);
                    b += Pe + s(Lt) + Ht + s(zt);
                  }
                  break;
                default:
                  ge && (b += "%"), b += R[Se];
                  break;
              }
              T = null, ge = !1;
              continue;
            }
            if (Ee === 37) {
              ge = !0;
              continue;
            }
            b += R[Se];
          }
          return b;
        }
        var Y = me;
        return Y.localize = function(R) {
          return new i(R || N, I, C);
        }, Y.localizeByIdentifier = function(R) {
          var _ = t[R];
          return _ ? Y.localize(_) : (v('[WARNING] No locale found with identifier "' + R + '".'), Y);
        }, Y.timezone = function(R) {
          var _ = I, y = C, F = typeof R;
          if (F === "number" || F === "string")
            if (y = !0, F === "string") {
              var b = R[0] === "-" ? -1 : 1, T = parseInt(R.slice(1, 3), 10), ge = parseInt(R.slice(3, 5), 10);
              _ = b * (60 * T + ge) * 60 * 1e3;
            } else F === "number" && (_ = R * 60 * 1e3);
          return new i(N, _, y);
        }, Y.utc = function() {
          return new i(N, I, !0);
        }, Y;
      }
      function s(g, w) {
        return w === "" || g > 9 ? "" + g : (w == null && (w = "0"), w + g);
      }
      function o(g) {
        return g > 99 ? g : g > 9 ? "0" + g : "00" + g;
      }
      function a(g) {
        return g === 0 ? 12 : g > 12 ? g - 12 : g;
      }
      function l(g, w) {
        w = w || "sunday";
        var A = g.getDay();
        w === "monday" && (A === 0 ? A = 6 : A--);
        var N = Date.UTC(g.getFullYear(), 0, 1), I = Date.UTC(g.getFullYear(), g.getMonth(), g.getDate()), C = Math.floor((I - N) / 864e5), j = (C + 7 - A) / 7;
        return Math.floor(j);
      }
      function f(g) {
        var w = g % 10, A = g % 100;
        if (A >= 11 && A <= 13 || w === 0 || w >= 4)
          return "th";
        switch (w) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
        }
      }
      function u(g) {
        return (g.getTimezoneOffset() || 0) * 6e4;
      }
      function h(g, w) {
        return d() || p(g);
      }
      function d(g, w) {
        return null;
      }
      function p(g) {
        var w = g.toString().match(/\(([\w\s]+)\)/);
        return w && w[1];
      }
      function v(g) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(g);
      }
    })();
  })(Gt)), Gt.exports;
}
var ni = ri();
const si = /* @__PURE__ */ ti(ni);
var ii = /* @__PURE__ */ jt('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), ai = /* @__PURE__ */ jt('<button id="restore" type="button" class="submit-button svelte-7nstam">復元...</button>'), oi = /* @__PURE__ */ jt('<div class="tag-item svelte-7nstam"> </div>'), li = /* @__PURE__ */ jt('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam">📷 写真</button></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons svelte-7nstam"><div class="options svelte-7nstam"><label><input type="checkbox"/> 公開を遅延</label></div> <button type="button" class="submit-button svelte-7nstam"> </button> <!></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3>タグを選択</h3> <div class="tag-list svelte-7nstam"></div> <button type="button" style="margin-top: 16px;">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3>自動バックアップの復元</h3> <p><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;"><button type="button">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog>', 1);
const fi = {
  hash: "svelte-7nstam",
  code: ':host {display:block;height:100%;width:100%;background:#f7f8f9;font-family:sans-serif;}.container.svelte-7nstam {display:flex;flex-direction:column;height:100%;width:100%;}.main.svelte-7nstam {flex:1;overflow:auto;padding:10px;max-width:40em;margin:0 auto;width:100%;box-sizing:border-box;display:flex;flex-direction:column;}.toolbar.svelte-7nstam {padding:10px 0;display:flex;gap:8px;}.toolbar.svelte-7nstam button:where(.svelte-7nstam) {background:#fff;border:1px solid #dfe5e7;border-radius:3px;padding:8px;cursor:pointer;}input[type="text"].svelte-7nstam, textarea.svelte-7nstam {margin:0;font-family:inherit;border:1px solid #dfe5e7;box-sizing:border-box;width:100%;padding:10px;border-radius:3px;font-size:110%;}.body-container.svelte-7nstam {flex:1;min-height:300px;}textarea.svelte-7nstam {height:100%;resize:none;}.global-actions.svelte-7nstam {background:#fff;padding:14px 10px;box-shadow:0 -2px 4px rgba(0,0,0,0.1);position:relative;}.buttons.svelte-7nstam {max-width:40em;margin:0 auto;}.options.svelte-7nstam {padding-bottom:16px;display:flex;gap:16px;}.submit-button.svelte-7nstam {color:#fff;background:#00acc1;border:none;padding:12px 24px;border-radius:3px;font-size:100%;cursor:pointer;}.submit-button.svelte-7nstam:disabled {opacity:0.5;cursor:not-allowed;}#restore.svelte-7nstam {background:#757575;margin-left:8px;}dialog.svelte-7nstam {border:none;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.2);padding:20px;max-width:600px;width:90%;}dialog.svelte-7nstam::backdrop {background:rgba(0,0,0,0.5);}.tag-list.svelte-7nstam {display:flex;flex-direction:column;gap:8px;}.tag-item.svelte-7nstam {padding:12px;background:#eee;border-radius:4px;cursor:pointer;}.tag-item.svelte-7nstam:hover {background:#ddd;}.progress-bar.svelte-7nstam {position:absolute;top:0;left:0;height:4px;background:#00acc1;transition:width 0.3s;}'
};
function ui(e, t) {
  Lr(t, !0), Bs(e, fi);
  let r = Rr(t, "entryJson", 7, ""), n = Rr(t, "sk", 7, ""), i = /* @__PURE__ */ re(Ye({ id: null, title: "", body: "", status: null })), s = /* @__PURE__ */ re(Ye({ id: null, title: "", body: "", publishLater: !1 })), o = /* @__PURE__ */ re(!1), a = /* @__PURE__ */ re(""), l = /* @__PURE__ */ re(null), f, u, h, d, p = "";
  on(() => {
    if (r() && r() !== p) {
      console.log("Processing entryJson...");
      try {
        const c = JSON.parse(r());
        st(() => {
          p = r(), P(i, c, !0), m(s).id = c.id, m(s).title = c.title, m(s).body = c.body, m(s).publishLater = c.status === "scheduled", v();
        });
      } catch (c) {
        console.error("Failed to parse entryJson", c);
      }
    }
  }), Hs(() => {
    const c = document.querySelector(".loading");
    c && c.remove();
    const $ = setInterval(g, 3e3);
    return () => clearInterval($);
  });
  function v() {
    if (!m(i).id && m(i).id !== null) return;
    const c = `nogag-backup-${m(i).id || "new"}`, $ = localStorage.getItem(c);
    if ($) {
      const O = JSON.parse($);
      (m(i).title !== O.title || m(i).body !== O.body) && P(l, O, !0);
    }
  }
  function g() {
    if (m(i).title !== m(s).title || m(i).body !== m(s).body) {
      const c = `nogag-backup-${m(i).id || "new"}`, $ = {
        title: m(s).title,
        body: m(s).body,
        time: Date.now()
      };
      localStorage.setItem(c, JSON.stringify($)), P(l, null);
    }
  }
  async function w() {
    P(o, !0), P(a, "リクエスト中");
    const c = new FormData();
    if (c.set("id", m(s).id || ""), c.set("title", m(s).title), c.set("body", m(s).body), c.set("sk", n()), m(s).publishLater) {
      const $ = m(i).publish_at_epoch || m(i).publish_at || Math.floor(Date.now() / 1e3) + 2592e3;
      c.set("publish_at", String($)), c.set("status", "scheduled");
    } else
      c.set("status", "public");
    try {
      const U = (await (await fetch("/api/edit", { method: "POST", body: c })).json()).session_id;
      if (!U)
        throw new Error("保存に失敗しました");
      A(U);
    } catch ($) {
      P(o, !1), alert($ instanceof Error ? $.message : "エラーが発生しました");
    }
  }
  function A(c) {
    const $ = new EventSource(`/api/edit/progress?sid=${c}`);
    $.onmessage = (O) => {
      const U = JSON.parse(O.data);
      switch (U.type) {
        case "progress":
          P(a, N(U.message), !0);
          break;
        case "done":
          localStorage.removeItem(`nogag-backup-${m(i).id || "new"}`), P(a, "完了"), P(o, !1), $.close(), location.href = U.location;
          break;
        case "error":
          P(a, "エラー: " + U.message), P(o, !1), $.close(), alert("保存に失敗しました: " + U.message);
          break;
      }
    }, $.onerror = () => {
      P(o, !1), $.close(), alert("通信エラーが発生しました");
    };
  }
  function N(c) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[c] || c;
  }
  function I(c) {
    m(s).title = `[${c}]${m(s).title}`, h.close(), f.focus();
  }
  function C() {
    m(l) && (m(s).title = m(l).title, m(s).body = m(l).body, d.close());
  }
  async function j() {
    const c = document.createElement("input");
    c.type = "file", c.oninput = async () => {
      if (!c.files?.[0]) return;
      const $ = new FormData();
      $.append("file", c.files[0]), $.append("sk", n());
      try {
        const U = await (await fetch("/api/upload/image", { method: "POST", body: $ })).json(), mt = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${U.uploaded}" class="picasa" itemprop="url"><img src="${U.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        L(mt, !0);
      } catch {
        alert("アップロードに失敗しました");
      }
    }, c.click();
  }
  function L(c, $ = !1) {
    const O = u.selectionStart, U = u.selectionEnd, mt = u.value;
    m(s).body = mt.substring(0, O) + c + mt.substring(U), setTimeout(
      () => {
        typeof $ == "boolean" && $ ? (u.selectionStart = O, u.selectionEnd = O + c.length) : typeof $ == "number" ? u.selectionStart = u.selectionEnd = O + $ : u.selectionStart = u.selectionEnd = O + c.length, u.focus();
      },
      0
    );
  }
  function me(c) {
    (c.altKey ? "Alt-" : "") + (c.ctrlKey ? "Control-" : "") + (c.metaKey ? "Meta-" : "") + (c.shiftKey ? "Shift-" : "") + c.key === "Control-t" && (L("\\(  \\)", 3), c.preventDefault(), c.stopPropagation());
  }
  var D = {
    get entryJson() {
      return r();
    },
    set entryJson(c = "") {
      r(c), xt();
    },
    get sk() {
      return n();
    },
    set sk(c = "") {
      n(c), xt();
    }
  }, Y = li(), R = ms(Y), _ = Z(R), y = Z(_);
  Tr(y), yt(y, (c) => f = c, () => f);
  var F = G(y, 2), b = Z(F);
  b.__click = () => h.showModal();
  var T = G(b, 2);
  T.__click = j, B(F);
  var ge = G(F, 2), Be = Z(ge);
  gs(Be), Be.__keydown = me, yt(Be, (c) => u = c, () => u), B(ge), B(_);
  var Oe = G(_, 2), Se = Z(Oe);
  {
    var Ee = (c) => {
      var $ = ii();
      Ve(c, $);
    };
    Vt(Se, (c) => {
      m(o) && c(Ee);
    });
  }
  var _t = G(Se, 2), it = Z(_t), ee = Z(it), xe = Z(ee);
  Tr(xe), er(), B(ee), B(it);
  var Pe = G(it, 2);
  Pe.__click = w;
  var Ht = Z(Pe, !0);
  B(Pe);
  var Lt = G(Pe, 2);
  {
    var zt = (c) => {
      var $ = ai();
      $.__click = () => d.showModal(), Ve(c, $);
    };
    Vt(Lt, (c) => {
      m(l) && c(zt);
    });
  }
  B(_t), B(Oe), B(R);
  var pt = G(R, 2), Jt = G(Z(pt), 2);
  Js(
    Jt,
    20,
    () => [
      "tech",
      "photo",
      "redeveloped",
      "stablediffusion",
      "photoshopped"
    ],
    Ls,
    (c, $) => {
      var O = oi();
      O.__click = () => I($);
      var U = Z(O, !0);
      B(O), Bt(() => qt(U, $)), Ve(c, O);
    }
  ), B(Jt);
  var En = G(Jt, 2);
  En.__click = () => h.close(), B(pt), yt(pt, (c) => h = c, () => h);
  var Xt = G(pt, 2), Ut = G(Z(Xt), 2), xn = Z(Ut);
  {
    var Tn = (c) => {
      var $ = Os();
      Bt((O) => qt($, O), [
        () => si("%Y年%m月%d日%H時", new Date(m(l).time))
      ]), Ve(c, $);
    };
    Vt(xn, (c) => {
      m(l) && c(Tn);
    });
  }
  er(), B(Ut);
  var mr = G(Ut, 2), gr = Z(mr);
  gr.__click = () => d.close();
  var Dn = G(gr, 2);
  return Dn.__click = C, B(mr), B(Xt), yt(Xt, (c) => d = c, () => d), Bt(() => {
    Pe.disabled = m(o), qt(Ht, m(o) ? m(a) || "リクエスト中" : "更新");
  }), Ar(y, () => m(s).title, (c) => m(s).title = c), Ar(Be, () => m(s).body, (c) => m(s).body = c), Zs(xe, () => m(s).publishLater, (c) => m(s).publishLater = c), Ve(e, Y), zr(D);
}
Rs(["click", "keydown"]);
customElements.define("app-editor", ei(
  ui,
  {
    entryJson: { attribute: "entry-json" },
    sk: { attribute: "sk" }
  },
  [],
  [],
  !0
));
//# sourceMappingURL=admin-front.mjs.map
