var gr = Array.isArray, kn = Array.prototype.indexOf, Kt = Array.prototype.includes, Bs = Array.from, Sn = Object.defineProperty, At = Object.getOwnPropertyDescriptor, Mn = Object.getOwnPropertyDescriptors, Dn = Object.prototype, En = Array.prototype, aa = Object.getPrototypeOf, Yr = Object.isExtensible;
function os(e) {
  return typeof e == "function";
}
const Pt = () => {
};
function Tn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function na() {
  var e, t, s = new Promise((r, n) => {
    e = r, t = n;
  });
  return { promise: s, resolve: e, reject: t };
}
function ia(e, t, s = !1) {
  return e === void 0 ? s ? (
    /** @type {() => V} */
    t()
  ) : (
    /** @type {V} */
    t
  ) : e;
}
const Pe = 2, Qt = 4, ms = 8, la = 1 << 24, wt = 16, et = 32, Ht = 64, ur = 128, Je = 512, Me = 1024, Oe = 2048, Qe = 4096, He = 8192, mt = 16384, es = 32768, Ct = 65536, zr = 1 << 17, An = 1 << 18, ts = 1 << 19, Pn = 1 << 20, ct = 1 << 25, $t = 65536, dr = 1 << 21, br = 1 << 22, gt = 1 << 23, Ft = /* @__PURE__ */ Symbol("$state"), Fn = /* @__PURE__ */ Symbol("legacy props"), In = /* @__PURE__ */ Symbol(""), Dt = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function On(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Rn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Cn(e, t, s) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function $n(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Nn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Ln(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Hn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function qn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Bn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Yn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function zn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const jn = 1, Un = 2, oa = 4, Jn = 8, Vn = 16, Kn = 1, Xn = 2, Te = /* @__PURE__ */ Symbol(), ca = "http://www.w3.org/1999/xhtml", Gn = "http://www.w3.org/2000/svg", Wn = "http://www.w3.org/1998/Math/MathML";
function Zn() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Qn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function va(e) {
  return e === this.v;
}
function ei(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function ua(e) {
  return !ei(e, this.v);
}
let qe = null;
function Xt(e) {
  qe = e;
}
function at(e, t = !1, s) {
  qe = {
    p: qe,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function nt(e) {
  var t = (
    /** @type {ComponentContext} */
    qe
  ), s = t.e;
  if (s !== null) {
    t.e = null;
    for (var r of s)
      Ia(r);
  }
  return t.i = !0, qe = t.p, /** @type {T} */
  {};
}
function da() {
  return !0;
}
let Et = [];
function fa() {
  var e = Et;
  Et = [], Tn(e);
}
function Ze(e) {
  if (Et.length === 0 && !fs) {
    var t = Et;
    queueMicrotask(() => {
      t === Et && fa();
    });
  }
  Et.push(e);
}
function ti() {
  for (; Et.length > 0; )
    fa();
}
function ha(e) {
  var t = ie;
  if (t === null)
    return re.f |= gt, e;
  if ((t.f & es) === 0 && (t.f & Qt) === 0)
    throw e;
  pt(e, t);
}
function pt(e, t) {
  for (; t !== null; ) {
    if ((t.f & ur) !== 0) {
      if ((t.f & es) === 0)
        throw e;
      try {
        t.b.error(e);
        return;
      } catch (s) {
        e = s;
      }
    }
    t = t.parent;
  }
  throw e;
}
const si = -7169;
function ge(e, t) {
  e.f = e.f & si | t;
}
function yr(e) {
  (e.f & Je) !== 0 || e.deps === null ? ge(e, Me) : ge(e, Qe);
}
function _a(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Pe) === 0 || (t.f & $t) === 0 || (t.f ^= $t, _a(
        /** @type {Derived} */
        t.deps
      ));
}
function pa(e, t, s) {
  (e.f & Oe) !== 0 ? t.add(e) : (e.f & Qe) !== 0 && s.add(e), _a(e.deps), ge(e, Me);
}
const Os = /* @__PURE__ */ new Set();
let ne = null, qs = null, Xe = null, Re = [], Ys = null, fs = !1, Gt = null;
class bt {
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
   * @type {Set<(batch: Batch) => void>}
   */
  #e = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #a = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #t = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #l = 0;
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #s = null;
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #i = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #r = /* @__PURE__ */ new Set();
  /**
   * A map of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`.
   * The value contains child effects that were dirty/maybe_dirty before being reset,
   * so they can be rescheduled if the branch survives.
   * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
   */
  #n = /* @__PURE__ */ new Map();
  is_fork = !1;
  #o = !1;
  #v() {
    return this.is_fork || this.#l > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    this.#n.has(t) || this.#n.set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var s = this.#n.get(t);
    if (s) {
      this.#n.delete(t);
      for (var r of s.d)
        ge(r, Oe), Ge(r);
      for (r of s.m)
        ge(r, Qe), Ge(r);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    Re = [], this.apply();
    var s = Gt = [], r = [];
    for (const n of t)
      this.#c(n, s, r);
    if (Gt = null, this.#v()) {
      this.#u(r), this.#u(s);
      for (const [n, i] of this.#n)
        ya(n, i);
    } else {
      qs = this, ne = null;
      for (const n of this.#e) n(this);
      this.#e.clear(), this.#t === 0 && this.#d(), jr(r), jr(s), this.#i.clear(), this.#r.clear(), qs = null, this.#s?.resolve();
    }
    Xe = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #c(t, s, r) {
    t.f ^= Me;
    for (var n = t.first; n !== null; ) {
      var i = n.f, l = (i & (et | Ht)) !== 0, v = l && (i & Me) !== 0, c = v || (i & He) !== 0 || this.#n.has(n);
      if (!c && n.fn !== null) {
        l ? n.f ^= Me : (i & Qt) !== 0 ? s.push(n) : ws(n) && ((i & wt) !== 0 && this.#r.add(n), Zt(n));
        var d = n.first;
        if (d !== null) {
          n = d;
          continue;
        }
      }
      for (; n !== null; ) {
        var f = n.next;
        if (f !== null) {
          n = f;
          break;
        }
        n = n.parent;
      }
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #u(t) {
    for (var s = 0; s < t.length; s += 1)
      pa(t[s], this.#i, this.#r);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, s) {
    s !== Te && !this.previous.has(t) && this.previous.set(t, s), (t.f & gt) === 0 && (this.current.set(t, t.v), Xe?.set(t, t.v));
  }
  activate() {
    ne = this, this.apply();
  }
  deactivate() {
    ne === this && (ne = null, Xe = null);
  }
  flush() {
    if (Re.length > 0)
      ne = this, ma();
    else if (this.#t === 0 && !this.is_fork) {
      for (const t of this.#e) t(this);
      this.#e.clear(), this.#d(), this.#s?.resolve();
    }
    this.deactivate();
  }
  discard() {
    for (const t of this.#a) t(this);
    this.#a.clear();
  }
  #d() {
    if (Os.size > 1) {
      this.previous.clear();
      var t = ne, s = Xe, r = !0;
      for (const i of Os) {
        if (i === this) {
          r = !1;
          continue;
        }
        const l = [];
        for (const [c, d] of this.current) {
          if (i.current.has(c))
            if (r && d !== i.current.get(c))
              i.current.set(c, d);
            else
              continue;
          l.push(c);
        }
        if (l.length === 0)
          continue;
        const v = [...i.current.keys()].filter((c) => !this.current.has(c));
        if (v.length > 0) {
          var n = Re;
          Re = [];
          const c = /* @__PURE__ */ new Set(), d = /* @__PURE__ */ new Map();
          for (const f of l)
            ga(f, v, c, d);
          if (Re.length > 0) {
            ne = i, i.apply();
            for (const f of Re)
              i.#c(f, [], []);
            i.deactivate();
          }
          Re = n;
        }
      }
      ne = t, Xe = s;
    }
    this.#n.clear(), Os.delete(this);
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    this.#t += 1, t && (this.#l += 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    this.#t -= 1, t && (this.#l -= 1), !this.#o && (this.#o = !0, Ze(() => {
      this.#o = !1, this.#v() ? Re.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of this.#i)
      this.#r.delete(t), ge(t, Oe), Ge(t);
    for (const t of this.#r)
      ge(t, Qe), Ge(t);
    this.flush();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#e.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#a.add(t);
  }
  settled() {
    return (this.#s ??= na()).promise;
  }
  static ensure() {
    if (ne === null) {
      const t = ne = new bt();
      Os.add(ne), fs || Ze(() => {
        ne === t && t.flush();
      });
    }
    return ne;
  }
  apply() {
  }
}
function ri(e) {
  var t = fs;
  fs = !0;
  try {
    for (var s; ; ) {
      if (ti(), Re.length === 0 && (ne?.flush(), Re.length === 0))
        return Ys = null, /** @type {T} */
        s;
      ma();
    }
  } finally {
    fs = t;
  }
}
function ma() {
  var e = null;
  try {
    for (var t = 0; Re.length > 0; ) {
      var s = bt.ensure();
      if (t++ > 1e3) {
        var r, n;
        ai();
      }
      s.process(Re), yt.clear();
    }
  } finally {
    Re = [], Ys = null, Gt = null;
  }
}
function ai() {
  try {
    Hn();
  } catch (e) {
    pt(e, Ys);
  }
}
let ot = null;
function jr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var s = 0; s < t; ) {
      var r = e[s++];
      if ((r.f & (mt | He)) === 0 && ws(r) && (ot = /* @__PURE__ */ new Set(), Zt(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && $a(r), ot?.size > 0)) {
        yt.clear();
        for (const n of ot) {
          if ((n.f & (mt | He)) !== 0) continue;
          const i = [n];
          let l = n.parent;
          for (; l !== null; )
            ot.has(l) && (ot.delete(l), i.push(l)), l = l.parent;
          for (let v = i.length - 1; v >= 0; v--) {
            const c = i[v];
            (c.f & (mt | He)) === 0 && Zt(c);
          }
        }
        ot.clear();
      }
    }
    ot = null;
  }
}
function ga(e, t, s, r) {
  if (!s.has(e) && (s.add(e), e.reactions !== null))
    for (const n of e.reactions) {
      const i = n.f;
      (i & Pe) !== 0 ? ga(
        /** @type {Derived} */
        n,
        t,
        s,
        r
      ) : (i & (br | wt)) !== 0 && (i & Oe) === 0 && ba(n, t, r) && (ge(n, Oe), Ge(
        /** @type {Effect} */
        n
      ));
    }
}
function ba(e, t, s) {
  const r = s.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const n of e.deps) {
      if (Kt.call(t, n))
        return !0;
      if ((n.f & Pe) !== 0 && ba(
        /** @type {Derived} */
        n,
        t,
        s
      ))
        return s.set(
          /** @type {Derived} */
          n,
          !0
        ), !0;
    }
  return s.set(e, !1), !1;
}
function Ge(e) {
  var t = Ys = e, s = t.b;
  if (s?.is_pending && (e.f & (Qt | ms | la)) !== 0 && (e.f & es) === 0) {
    s.defer_effect(e);
    return;
  }
  for (; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Gt !== null && t === ie && (e.f & ms) === 0)
      return;
    if ((r & (Ht | et)) !== 0) {
      if ((r & Me) === 0)
        return;
      t.f ^= Me;
    }
  }
  Re.push(t);
}
function ya(e, t) {
  if (!((e.f & et) !== 0 && (e.f & Me) !== 0)) {
    (e.f & Oe) !== 0 ? t.d.push(e) : (e.f & Qe) !== 0 && t.m.push(e), ge(e, Me);
    for (var s = e.first; s !== null; )
      ya(s, t), s = s.next;
  }
}
function ni(e) {
  let t = 0, s = Nt(0), r;
  return () => {
    Mr() && (a(s), Us(() => (t === 0 && (r = Vs(() => e(() => hs(s)))), t += 1, () => {
      Ze(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, hs(s));
      });
    })));
  };
}
var ii = Ct | ts;
function li(e, t, s, r) {
  new oi(e, t, s, r);
}
class oi {
  /** @type {Boundary | null} */
  parent;
  is_pending = !1;
  /**
   * API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
   * Inherited from parent boundary, or defaults to identity.
   * @type {(error: unknown) => unknown}
   */
  transform_error;
  /** @type {TemplateNode} */
  #e;
  /** @type {TemplateNode | null} */
  #a = null;
  /** @type {BoundaryProps} */
  #t;
  /** @type {((anchor: Node) => void)} */
  #l;
  /** @type {Effect} */
  #s;
  /** @type {Effect | null} */
  #i = null;
  /** @type {Effect | null} */
  #r = null;
  /** @type {Effect | null} */
  #n = null;
  /** @type {DocumentFragment | null} */
  #o = null;
  #v = 0;
  #c = 0;
  #u = !1;
  /** @type {Set<Effect>} */
  #d = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #h = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #f = null;
  #b = ni(() => (this.#f = Nt(this.#v), () => {
    this.#f = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, s, r, n) {
    this.#e = t, this.#t = s, this.#l = (i) => {
      var l = (
        /** @type {Effect} */
        ie
      );
      l.b = this, l.f |= ur, r(i);
    }, this.parent = /** @type {Effect} */
    ie.b, this.transform_error = n ?? this.parent?.transform_error ?? ((i) => i), this.#s = Js(() => {
      this.#m();
    }, ii);
  }
  #y() {
    try {
      this.#i = je(() => this.#l(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #w(t) {
    const s = this.#t.failed;
    s && (this.#n = je(() => {
      s(
        this.#e,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #x() {
    const t = this.#t.pending;
    t && (this.is_pending = !0, this.#r = je(() => t(this.#e)), Ze(() => {
      var s = this.#o = document.createDocumentFragment(), r = vt();
      s.append(r), this.#i = this.#p(() => (bt.ensure(), je(() => this.#l(r)))), this.#c === 0 && (this.#e.before(s), this.#o = null, Ot(
        /** @type {Effect} */
        this.#r,
        () => {
          this.#r = null;
        }
      ), this.#_());
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#c = 0, this.#v = 0, this.#i = je(() => {
        this.#l(this.#e);
      }), this.#c > 0) {
        var t = this.#o = document.createDocumentFragment();
        Ha(this.#i, t);
        const s = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#r = je(() => s(this.#e));
      } else
        this.#_();
    } catch (s) {
      this.error(s);
    }
  }
  #_() {
    this.is_pending = !1;
    for (const t of this.#d)
      ge(t, Oe), Ge(t);
    for (const t of this.#h)
      ge(t, Qe), Ge(t);
    this.#d.clear(), this.#h.clear();
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    pa(t, this.#d, this.#h);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#t.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #p(t) {
    var s = ie, r = re, n = qe;
    rt(this.#s), Ke(this.#s), Xt(this.#s.ctx);
    try {
      return t();
    } catch (i) {
      return ha(i), null;
    } finally {
      rt(s), Ke(r), Xt(n);
    }
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
    this.#c += t, this.#c === 0 && (this.#_(), this.#r && Ot(this.#r, () => {
      this.#r = null;
    }), this.#o && (this.#e.before(this.#o), this.#o = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    this.#g(t), this.#v += t, !(!this.#f || this.#u) && (this.#u = !0, Ze(() => {
      this.#u = !1, this.#f && Wt(this.#f, this.#v);
    }));
  }
  get_effect_pending() {
    return this.#b(), a(
      /** @type {Source<number>} */
      this.#f
    );
  }
  /** @param {unknown} error */
  error(t) {
    var s = this.#t.onerror;
    let r = this.#t.failed;
    if (!s && !r)
      throw t;
    this.#i && ($e(this.#i), this.#i = null), this.#r && ($e(this.#r), this.#r = null), this.#n && ($e(this.#n), this.#n = null);
    var n = !1, i = !1;
    const l = () => {
      if (n) {
        Qn();
        return;
      }
      n = !0, i && zn(), this.#n !== null && Ot(this.#n, () => {
        this.#n = null;
      }), this.#p(() => {
        bt.ensure(), this.#m();
      });
    }, v = (c) => {
      try {
        i = !0, s?.(c, l), i = !1;
      } catch (d) {
        pt(d, this.#s && this.#s.parent);
      }
      r && (this.#n = this.#p(() => {
        bt.ensure();
        try {
          return je(() => {
            var d = (
              /** @type {Effect} */
              ie
            );
            d.b = this, d.f |= ur, r(
              this.#e,
              () => c,
              () => l
            );
          });
        } catch (d) {
          return pt(
            d,
            /** @type {Effect} */
            this.#s.parent
          ), null;
        }
      }));
    };
    Ze(() => {
      var c;
      try {
        c = this.transform_error(t);
      } catch (d) {
        pt(d, this.#s && this.#s.parent);
        return;
      }
      c !== null && typeof c == "object" && typeof /** @type {any} */
      c.then == "function" ? c.then(
        v,
        /** @param {unknown} e */
        (d) => pt(d, this.#s && this.#s.parent)
      ) : v(c);
    });
  }
}
function ci(e, t, s, r) {
  const n = wr;
  var i = e.filter((m) => !m.settled);
  if (s.length === 0 && i.length === 0) {
    r(t.map(n));
    return;
  }
  var l = (
    /** @type {Effect} */
    ie
  ), v = vi(), c = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((m) => m.promise)) : null;
  function d(m) {
    v();
    try {
      r(m);
    } catch (g) {
      (l.f & mt) === 0 && pt(g, l);
    }
    fr();
  }
  if (s.length === 0) {
    c.then(() => d(t.map(n)));
    return;
  }
  function f() {
    v(), Promise.all(s.map((m) => /* @__PURE__ */ di(m))).then((m) => d([...t.map(n), ...m])).catch((m) => pt(m, l));
  }
  c ? c.then(f) : f();
}
function vi() {
  var e = ie, t = re, s = qe, r = ne;
  return function(i = !0) {
    rt(e), Ke(t), Xt(s), i && r?.activate();
  };
}
function fr(e = !0) {
  rt(null), Ke(null), Xt(null), e && ne?.deactivate();
}
function ui() {
  var e = (
    /** @type {Boundary} */
    /** @type {Effect} */
    ie.b
  ), t = (
    /** @type {Batch} */
    ne
  ), s = e.is_rendered();
  return e.update_pending_count(1), t.increment(s), () => {
    e.update_pending_count(-1), t.decrement(s);
  };
}
// @__NO_SIDE_EFFECTS__
function wr(e) {
  var t = Pe | Oe, s = re !== null && (re.f & Pe) !== 0 ? (
    /** @type {Derived} */
    re
  ) : null;
  return ie !== null && (ie.f |= ts), {
    ctx: qe,
    deps: null,
    effects: null,
    equals: va,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Te
    ),
    wv: 0,
    parent: s ?? ie,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function di(e, t, s) {
  /** @type {Effect | null} */
  ie === null && Rn();
  var n = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = Nt(
    /** @type {V} */
    Te
  ), l = !re, v = /* @__PURE__ */ new Map();
  return Si(() => {
    var c = na();
    n = c.promise;
    try {
      Promise.resolve(e()).then(c.resolve, c.reject).finally(fr);
    } catch (g) {
      c.reject(g), fr();
    }
    var d = (
      /** @type {Batch} */
      ne
    );
    if (l) {
      var f = ui();
      v.get(d)?.reject(Dt), v.delete(d), v.set(d, c);
    }
    const m = (g, y = void 0) => {
      if (d.activate(), y)
        y !== Dt && (i.f |= gt, Wt(i, y));
      else {
        (i.f & gt) !== 0 && (i.f ^= gt), Wt(i, g);
        for (const [S, b] of v) {
          if (v.delete(S), S === d) break;
          b.reject(Dt);
        }
      }
      f && f();
    };
    c.promise.then(m, (g) => m(null, g || "unknown"));
  }), js(() => {
    for (const c of v.values())
      c.reject(Dt);
  }), new Promise((c) => {
    function d(f) {
      function m() {
        f === n ? c(i) : d(n);
      }
      f.then(m, m);
    }
    d(n);
  });
}
// @__NO_SIDE_EFFECTS__
function Ue(e) {
  const t = /* @__PURE__ */ wr(e);
  return qa(t), t;
}
// @__NO_SIDE_EFFECTS__
function xr(e) {
  const t = /* @__PURE__ */ wr(e);
  return t.equals = ua, t;
}
function fi(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var s = 0; s < t.length; s += 1)
      $e(
        /** @type {Effect} */
        t[s]
      );
  }
}
function hi(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & Pe) === 0)
      return (t.f & mt) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function kr(e) {
  var t, s = ie;
  rt(hi(e));
  try {
    e.f &= ~$t, fi(e), t = ja(e);
  } finally {
    rt(s);
  }
  return t;
}
function wa(e) {
  var t = kr(e);
  if (!e.equals(t) && (e.wv = Ya(), (!ne?.is_fork || e.deps === null) && (e.v = t, e.deps === null))) {
    ge(e, Me);
    return;
  }
  Lt || (Xe !== null ? (Mr() || ne?.is_fork) && Xe.set(e, t) : yr(e));
}
function _i(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(Dt), t.teardown = Pt, t.ac = null, gs(t, 0), Dr(t));
}
function xa(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Zt(t);
}
let hr = /* @__PURE__ */ new Set();
const yt = /* @__PURE__ */ new Map();
let ka = !1;
function Nt(e, t) {
  var s = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: va,
    rv: 0,
    wv: 0
  };
  return s;
}
// @__NO_SIDE_EFFECTS__
function B(e, t) {
  const s = Nt(e);
  return qa(s), s;
}
// @__NO_SIDE_EFFECTS__
function pi(e, t = !1, s = !0) {
  const r = Nt(e);
  return t || (r.equals = ua), r;
}
function k(e, t, s = !1) {
  re !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!We || (re.f & zr) !== 0) && da() && (re.f & (Pe | wt | br | zr)) !== 0 && (Ve === null || !Kt.call(Ve, e)) && Yn();
  let r = s ? ke(t) : t;
  return Wt(e, r);
}
function Wt(e, t) {
  if (!e.equals(t)) {
    var s = e.v;
    Lt ? yt.set(e, t) : yt.set(e, s), e.v = t;
    var r = bt.ensure();
    if (r.capture(e, s), (e.f & Pe) !== 0) {
      const n = (
        /** @type {Derived} */
        e
      );
      (e.f & Oe) !== 0 && kr(n), yr(n);
    }
    e.wv = Ya(), Sa(e, Oe), ie !== null && (ie.f & Me) !== 0 && (ie.f & (et | Ht)) === 0 && (ze === null ? Di([e]) : ze.push(e)), !r.is_fork && hr.size > 0 && !ka && mi();
  }
  return t;
}
function mi() {
  ka = !1;
  for (const e of hr)
    (e.f & Me) !== 0 && ge(e, Qe), ws(e) && Zt(e);
  hr.clear();
}
function hs(e) {
  k(e, e.v + 1);
}
function Sa(e, t) {
  var s = e.reactions;
  if (s !== null)
    for (var r = s.length, n = 0; n < r; n++) {
      var i = s[n], l = i.f, v = (l & Oe) === 0;
      if (v && ge(i, t), (l & Pe) !== 0) {
        var c = (
          /** @type {Derived} */
          i
        );
        Xe?.delete(c), (l & $t) === 0 && (l & Je && (i.f |= $t), Sa(c, Qe));
      } else v && ((l & wt) !== 0 && ot !== null && ot.add(
        /** @type {Effect} */
        i
      ), Ge(
        /** @type {Effect} */
        i
      ));
    }
}
function ke(e) {
  if (typeof e != "object" || e === null || Ft in e)
    return e;
  const t = aa(e);
  if (t !== Dn && t !== En)
    return e;
  var s = /* @__PURE__ */ new Map(), r = gr(e), n = /* @__PURE__ */ B(0), i = Rt, l = (v) => {
    if (Rt === i)
      return v();
    var c = re, d = Rt;
    Ke(null), Xr(i);
    var f = v();
    return Ke(c), Xr(d), f;
  };
  return r && s.set("length", /* @__PURE__ */ B(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(v, c, d) {
        (!("value" in d) || d.configurable === !1 || d.enumerable === !1 || d.writable === !1) && qn();
        var f = s.get(c);
        return f === void 0 ? l(() => {
          var m = /* @__PURE__ */ B(d.value);
          return s.set(c, m), m;
        }) : k(f, d.value, !0), !0;
      },
      deleteProperty(v, c) {
        var d = s.get(c);
        if (d === void 0) {
          if (c in v) {
            const f = l(() => /* @__PURE__ */ B(Te));
            s.set(c, f), hs(n);
          }
        } else
          k(d, Te), hs(n);
        return !0;
      },
      get(v, c, d) {
        if (c === Ft)
          return e;
        var f = s.get(c), m = c in v;
        if (f === void 0 && (!m || At(v, c)?.writable) && (f = l(() => {
          var y = ke(m ? v[c] : Te), S = /* @__PURE__ */ B(y);
          return S;
        }), s.set(c, f)), f !== void 0) {
          var g = a(f);
          return g === Te ? void 0 : g;
        }
        return Reflect.get(v, c, d);
      },
      getOwnPropertyDescriptor(v, c) {
        var d = Reflect.getOwnPropertyDescriptor(v, c);
        if (d && "value" in d) {
          var f = s.get(c);
          f && (d.value = a(f));
        } else if (d === void 0) {
          var m = s.get(c), g = m?.v;
          if (m !== void 0 && g !== Te)
            return {
              enumerable: !0,
              configurable: !0,
              value: g,
              writable: !0
            };
        }
        return d;
      },
      has(v, c) {
        if (c === Ft)
          return !0;
        var d = s.get(c), f = d !== void 0 && d.v !== Te || Reflect.has(v, c);
        if (d !== void 0 || ie !== null && (!f || At(v, c)?.writable)) {
          d === void 0 && (d = l(() => {
            var g = f ? ke(v[c]) : Te, y = /* @__PURE__ */ B(g);
            return y;
          }), s.set(c, d));
          var m = a(d);
          if (m === Te)
            return !1;
        }
        return f;
      },
      set(v, c, d, f) {
        var m = s.get(c), g = c in v;
        if (r && c === "length")
          for (var y = d; y < /** @type {Source<number>} */
          m.v; y += 1) {
            var S = s.get(y + "");
            S !== void 0 ? k(S, Te) : y in v && (S = l(() => /* @__PURE__ */ B(Te)), s.set(y + "", S));
          }
        if (m === void 0)
          (!g || At(v, c)?.writable) && (m = l(() => /* @__PURE__ */ B(void 0)), k(m, ke(d)), s.set(c, m));
        else {
          g = m.v !== Te;
          var b = l(() => ke(d));
          k(m, b);
        }
        var h = Reflect.getOwnPropertyDescriptor(v, c);
        if (h?.set && h.set.call(f, d), !g) {
          if (r && typeof c == "string") {
            var _ = (
              /** @type {Source<number>} */
              s.get("length")
            ), A = Number(c);
            Number.isInteger(A) && A >= _.v && k(_, A + 1);
          }
          hs(n);
        }
        return !0;
      },
      ownKeys(v) {
        a(n);
        var c = Reflect.ownKeys(v).filter((m) => {
          var g = s.get(m);
          return g === void 0 || g.v !== Te;
        });
        for (var [d, f] of s)
          f.v !== Te && !(d in v) && c.push(d);
        return c;
      },
      setPrototypeOf() {
        Bn();
      }
    }
  );
}
function Ur(e) {
  try {
    if (e !== null && typeof e == "object" && Ft in e)
      return e[Ft];
  } catch {
  }
  return e;
}
function Ma(e, t) {
  return Object.is(Ur(e), Ur(t));
}
var Jr, Da, Ea, Ta;
function gi() {
  if (Jr === void 0) {
    Jr = window, Da = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, s = Text.prototype;
    Ea = At(t, "firstChild").get, Ta = At(t, "nextSibling").get, Yr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Yr(s) && (s.__t = void 0);
  }
}
function vt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function It(e) {
  return (
    /** @type {TemplateNode | null} */
    Ea.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function ys(e) {
  return (
    /** @type {TemplateNode | null} */
    Ta.call(e)
  );
}
function o(e, t) {
  return /* @__PURE__ */ It(e);
}
function Vt(e, t = !1) {
  {
    var s = /* @__PURE__ */ It(e);
    return s instanceof Comment && s.data === "" ? /* @__PURE__ */ ys(s) : s;
  }
}
function u(e, t = 1, s = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ ys(r);
  return r;
}
function bi(e) {
  e.textContent = "";
}
function Aa() {
  return !1;
}
function Pa(e, t, s) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(t ?? ca, e, void 0)
  );
}
let Vr = !1;
function yi() {
  Vr || (Vr = !0, document.addEventListener(
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
function zs(e) {
  var t = re, s = ie;
  Ke(null), rt(null);
  try {
    return e();
  } finally {
    Ke(t), rt(s);
  }
}
function Sr(e, t, s, r = s) {
  e.addEventListener(t, () => zs(s));
  const n = e.__on_r;
  n ? e.__on_r = () => {
    n(), r(!0);
  } : e.__on_r = () => r(!0), yi();
}
function wi(e) {
  ie === null && (re === null && Ln(), Nn()), Lt && $n();
}
function xi(e, t) {
  var s = t.last;
  s === null ? t.last = t.first = e : (s.next = e, e.prev = s, t.last = e);
}
function ut(e, t) {
  var s = ie;
  s !== null && (s.f & He) !== 0 && (e |= He);
  var r = {
    ctx: qe,
    deps: null,
    nodes: null,
    f: e | Oe | Je,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: s,
    b: s && s.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  }, n = r;
  if ((e & Qt) !== 0)
    Gt !== null ? Gt.push(r) : Ge(r);
  else if (t !== null) {
    try {
      Zt(r);
    } catch (l) {
      throw $e(r), l;
    }
    n.deps === null && n.teardown === null && n.nodes === null && n.first === n.last && // either `null`, or a singular child
    (n.f & ts) === 0 && (n = n.first, (e & wt) !== 0 && (e & Ct) !== 0 && n !== null && (n.f |= Ct));
  }
  if (n !== null && (n.parent = s, s !== null && xi(n, s), re !== null && (re.f & Pe) !== 0 && (e & Ht) === 0)) {
    var i = (
      /** @type {Derived} */
      re
    );
    (i.effects ??= []).push(n);
  }
  return r;
}
function Mr() {
  return re !== null && !We;
}
function js(e) {
  const t = ut(ms, null);
  return ge(t, Me), t.teardown = e, t;
}
function Fa(e) {
  wi();
  var t = (
    /** @type {Effect} */
    ie.f
  ), s = !re && (t & et) !== 0 && (t & es) === 0;
  if (s) {
    var r = (
      /** @type {ComponentContext} */
      qe
    );
    (r.e ??= []).push(e);
  } else
    return Ia(e);
}
function Ia(e) {
  return ut(Qt | Pn, e);
}
function ki(e) {
  bt.ensure();
  const t = ut(Ht | ts, e);
  return (s = {}) => new Promise((r) => {
    s.outro ? Ot(t, () => {
      $e(t), r(void 0);
    }) : ($e(t), r(void 0));
  });
}
function Oa(e) {
  return ut(Qt, e);
}
function Si(e) {
  return ut(br | ts, e);
}
function Us(e, t = 0) {
  return ut(ms | t, e);
}
function V(e, t = [], s = [], r = []) {
  ci(r, t, s, (n) => {
    ut(ms, () => e(...n.map(a)));
  });
}
function Js(e, t = 0) {
  var s = ut(wt | t, e);
  return s;
}
function je(e) {
  return ut(et | ts, e);
}
function Ra(e) {
  var t = e.teardown;
  if (t !== null) {
    const s = Lt, r = re;
    Kr(!0), Ke(null);
    try {
      t.call(null);
    } finally {
      Kr(s), Ke(r);
    }
  }
}
function Dr(e, t = !1) {
  var s = e.first;
  for (e.first = e.last = null; s !== null; ) {
    const n = s.ac;
    n !== null && zs(() => {
      n.abort(Dt);
    });
    var r = s.next;
    (s.f & Ht) !== 0 ? s.parent = null : $e(s, t), s = r;
  }
}
function Mi(e) {
  for (var t = e.first; t !== null; ) {
    var s = t.next;
    (t.f & et) === 0 && $e(t), t = s;
  }
}
function $e(e, t = !0) {
  var s = !1;
  (t || (e.f & An) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ca(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), s = !0), Dr(e, t && !s), gs(e, 0), ge(e, mt);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  Ra(e);
  var n = e.parent;
  n !== null && n.first !== null && $a(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Ca(e, t) {
  for (; e !== null; ) {
    var s = e === t ? null : /* @__PURE__ */ ys(e);
    e.remove(), e = s;
  }
}
function $a(e) {
  var t = e.parent, s = e.prev, r = e.next;
  s !== null && (s.next = r), r !== null && (r.prev = s), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = s));
}
function Ot(e, t, s = !0) {
  var r = [];
  Na(e, r, !0);
  var n = () => {
    s && $e(e), t && t();
  }, i = r.length;
  if (i > 0) {
    var l = () => --i || n();
    for (var v of r)
      v.out(l);
  } else
    n();
}
function Na(e, t, s) {
  if ((e.f & He) === 0) {
    e.f ^= He;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const v of r)
        (v.is_global || s) && t.push(v);
    for (var n = e.first; n !== null; ) {
      var i = n.next, l = (n.f & Ct) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (n.f & et) !== 0 && (e.f & wt) !== 0;
      Na(n, t, l ? s : !1), n = i;
    }
  }
}
function Er(e) {
  La(e, !0);
}
function La(e, t) {
  if ((e.f & He) !== 0) {
    e.f ^= He, (e.f & Me) === 0 && (ge(e, Oe), Ge(e));
    for (var s = e.first; s !== null; ) {
      var r = s.next, n = (s.f & Ct) !== 0 || (s.f & et) !== 0;
      La(s, n ? t : !1), s = r;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function Ha(e, t) {
  if (e.nodes)
    for (var s = e.nodes.start, r = e.nodes.end; s !== null; ) {
      var n = s === r ? null : /* @__PURE__ */ ys(s);
      t.append(s), s = n;
    }
}
let Hs = !1, Lt = !1;
function Kr(e) {
  Lt = e;
}
let re = null, We = !1;
function Ke(e) {
  re = e;
}
let ie = null;
function rt(e) {
  ie = e;
}
let Ve = null;
function qa(e) {
  re !== null && (Ve === null ? Ve = [e] : Ve.push(e));
}
let Ce = null, Le = 0, ze = null;
function Di(e) {
  ze = e;
}
let Ba = 1, Tt = 0, Rt = Tt;
function Xr(e) {
  Rt = e;
}
function Ya() {
  return ++Ba;
}
function ws(e) {
  var t = e.f;
  if ((t & Oe) !== 0)
    return !0;
  if (t & Pe && (e.f &= ~$t), (t & Qe) !== 0) {
    for (var s = (
      /** @type {Value[]} */
      e.deps
    ), r = s.length, n = 0; n < r; n++) {
      var i = s[n];
      if (ws(
        /** @type {Derived} */
        i
      ) && wa(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & Je) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Xe === null && ge(e, Me);
  }
  return !1;
}
function za(e, t, s = !0) {
  var r = e.reactions;
  if (r !== null && !(Ve !== null && Kt.call(Ve, e)))
    for (var n = 0; n < r.length; n++) {
      var i = r[n];
      (i.f & Pe) !== 0 ? za(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (s ? ge(i, Oe) : (i.f & Me) !== 0 && ge(i, Qe), Ge(
        /** @type {Effect} */
        i
      ));
    }
}
function ja(e) {
  var t = Ce, s = Le, r = ze, n = re, i = Ve, l = qe, v = We, c = Rt, d = e.f;
  Ce = /** @type {null | Value[]} */
  null, Le = 0, ze = null, re = (d & (et | Ht)) === 0 ? e : null, Ve = null, Xt(e.ctx), We = !1, Rt = ++Tt, e.ac !== null && (zs(() => {
    e.ac.abort(Dt);
  }), e.ac = null);
  try {
    e.f |= dr;
    var f = (
      /** @type {Function} */
      e.fn
    ), m = f();
    e.f |= es;
    var g = e.deps, y = ne?.is_fork;
    if (Ce !== null) {
      var S;
      if (y || gs(e, Le), g !== null && Le > 0)
        for (g.length = Le + Ce.length, S = 0; S < Ce.length; S++)
          g[Le + S] = Ce[S];
      else
        e.deps = g = Ce;
      if (Mr() && (e.f & Je) !== 0)
        for (S = Le; S < g.length; S++)
          (g[S].reactions ??= []).push(e);
    } else !y && g !== null && Le < g.length && (gs(e, Le), g.length = Le);
    if (da() && ze !== null && !We && g !== null && (e.f & (Pe | Qe | Oe)) === 0)
      for (S = 0; S < /** @type {Source[]} */
      ze.length; S++)
        za(
          ze[S],
          /** @type {Effect} */
          e
        );
    if (n !== null && n !== e) {
      if (Tt++, n.deps !== null)
        for (let b = 0; b < s; b += 1)
          n.deps[b].rv = Tt;
      if (t !== null)
        for (const b of t)
          b.rv = Tt;
      ze !== null && (r === null ? r = ze : r.push(.../** @type {Source[]} */
      ze));
    }
    return (e.f & gt) !== 0 && (e.f ^= gt), m;
  } catch (b) {
    return ha(b);
  } finally {
    e.f ^= dr, Ce = t, Le = s, ze = r, re = n, Ve = i, Xt(l), We = v, Rt = c;
  }
}
function Ei(e, t) {
  let s = t.reactions;
  if (s !== null) {
    var r = kn.call(s, e);
    if (r !== -1) {
      var n = s.length - 1;
      n === 0 ? s = t.reactions = null : (s[r] = s[n], s.pop());
    }
  }
  if (s === null && (t.f & Pe) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (Ce === null || !Kt.call(Ce, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & Je) !== 0 && (i.f ^= Je, i.f &= ~$t), yr(i), _i(i), gs(i, 0);
  }
}
function gs(e, t) {
  var s = e.deps;
  if (s !== null)
    for (var r = t; r < s.length; r++)
      Ei(e, s[r]);
}
function Zt(e) {
  var t = e.f;
  if ((t & mt) === 0) {
    ge(e, Me);
    var s = ie, r = Hs;
    ie = e, Hs = !0;
    try {
      (t & (wt | la)) !== 0 ? Mi(e) : Dr(e), Ra(e);
      var n = ja(e);
      e.teardown = typeof n == "function" ? n : null, e.wv = Ba;
      var i;
    } finally {
      Hs = r, ie = s;
    }
  }
}
async function Ua() {
  await Promise.resolve(), ri();
}
function a(e) {
  var t = e.f, s = (t & Pe) !== 0;
  if (re !== null && !We) {
    var r = ie !== null && (ie.f & mt) !== 0;
    if (!r && (Ve === null || !Kt.call(Ve, e))) {
      var n = re.deps;
      if ((re.f & dr) !== 0)
        e.rv < Tt && (e.rv = Tt, Ce === null && n !== null && n[Le] === e ? Le++ : Ce === null ? Ce = [e] : Ce.push(e));
      else {
        (re.deps ??= []).push(e);
        var i = e.reactions;
        i === null ? e.reactions = [re] : Kt.call(i, re) || i.push(re);
      }
    }
  }
  if (Lt && yt.has(e))
    return yt.get(e);
  if (s) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (Lt) {
      var v = l.v;
      return ((l.f & Me) === 0 && l.reactions !== null || Va(l)) && (v = kr(l)), yt.set(l, v), v;
    }
    var c = (l.f & Je) === 0 && !We && re !== null && (Hs || (re.f & Je) !== 0), d = (l.f & es) === 0;
    ws(l) && (c && (l.f |= Je), wa(l)), c && !d && (xa(l), Ja(l));
  }
  if (Xe?.has(e))
    return Xe.get(e);
  if ((e.f & gt) !== 0)
    throw e.v;
  return e.v;
}
function Ja(e) {
  if (e.f |= Je, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & Pe) !== 0 && (t.f & Je) === 0 && (xa(
        /** @type {Derived} */
        t
      ), Ja(
        /** @type {Derived} */
        t
      ));
}
function Va(e) {
  if (e.v === Te) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (yt.has(t) || (t.f & Pe) !== 0 && Va(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Vs(e) {
  var t = We;
  try {
    return We = !0, e();
  } finally {
    We = t;
  }
}
const Ti = ["touchstart", "touchmove"];
function Ai(e) {
  return Ti.includes(e);
}
const vs = /* @__PURE__ */ Symbol("events"), Ka = /* @__PURE__ */ new Set(), _r = /* @__PURE__ */ new Set();
function Pi(e, t, s, r = {}) {
  function n(i) {
    if (r.capture || pr.call(t, i), !i.cancelBubble)
      return zs(() => s?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ze(() => {
    t.addEventListener(e, n, r);
  }) : t.addEventListener(e, n, r), n;
}
function Rs(e, t, s, r, n) {
  var i = { capture: r, passive: n }, l = Pi(e, t, s, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && js(() => {
    t.removeEventListener(e, l, i);
  });
}
function W(e, t, s) {
  (t[vs] ??= {})[e] = s;
}
function ss(e) {
  for (var t = 0; t < e.length; t++)
    Ka.add(e[t]);
  for (var s of _r)
    s(e);
}
let Gr = null;
function pr(e) {
  var t = this, s = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, n = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    n[0] || e.target
  );
  Gr = e;
  var l = 0, v = Gr === e && e[vs];
  if (v) {
    var c = n.indexOf(v);
    if (c !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[vs] = t;
      return;
    }
    var d = n.indexOf(t);
    if (d === -1)
      return;
    c <= d && (l = c);
  }
  if (i = /** @type {Element} */
  n[l] || e.target, i !== t) {
    Sn(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || s;
      }
    });
    var f = re, m = ie;
    Ke(null), rt(null);
    try {
      for (var g, y = []; i !== null; ) {
        var S = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var b = i[vs]?.[r];
          b != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && b.call(i, e);
        } catch (h) {
          g ? y.push(h) : g = h;
        }
        if (e.cancelBubble || S === t || S === null)
          break;
        i = S;
      }
      if (g) {
        for (let h of y)
          queueMicrotask(() => {
            throw h;
          });
        throw g;
      }
    } finally {
      e[vs] = t, delete e.currentTarget, Ke(f), rt(m);
    }
  }
}
const Fi = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Ii(e) {
  return (
    /** @type {string} */
    Fi?.createHTML(e) ?? e
  );
}
function Oi(e) {
  var t = Pa("template");
  return t.innerHTML = Ii(e.replaceAll("<!>", "<!---->")), t.content;
}
function bs(e, t) {
  var s = (
    /** @type {Effect} */
    ie
  );
  s.nodes === null && (s.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
  var s = (t & Kn) !== 0, r = (t & Xn) !== 0, n, i = !e.startsWith("<!>");
  return () => {
    n === void 0 && (n = Oi(i ? e : "<!>" + e), s || (n = /** @type {TemplateNode} */
    /* @__PURE__ */ It(n)));
    var l = (
      /** @type {TemplateNode} */
      r || Da ? document.importNode(n, !0) : n.cloneNode(!0)
    );
    if (s) {
      var v = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ It(l)
      ), c = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      bs(v, c);
    } else
      bs(l, l);
    return l;
  };
}
function Ut(e = "") {
  {
    var t = vt(e + "");
    return bs(t, t), t;
  }
}
function Wr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), s = vt();
  return e.append(t, s), bs(t, s), e;
}
function T(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function D(e, t) {
  var s = t == null ? "" : typeof t == "object" ? `${t}` : t;
  s !== (e.__t ??= e.nodeValue) && (e.__t = s, e.nodeValue = `${s}`);
}
function Ri(e, t) {
  return Ci(e, t);
}
const Cs = /* @__PURE__ */ new Map();
function Ci(e, { target: t, anchor: s, props: r = {}, events: n, context: i, intro: l = !0, transformError: v }) {
  gi();
  var c = void 0, d = ki(() => {
    var f = s ?? t.appendChild(vt());
    li(
      /** @type {TemplateNode} */
      f,
      {
        pending: () => {
        }
      },
      (y) => {
        at({});
        var S = (
          /** @type {ComponentContext} */
          qe
        );
        i && (S.c = i), n && (r.$$events = n), c = e(y, r) || {}, nt();
      },
      v
    );
    var m = /* @__PURE__ */ new Set(), g = (y) => {
      for (var S = 0; S < y.length; S++) {
        var b = y[S];
        if (!m.has(b)) {
          m.add(b);
          var h = Ai(b);
          for (const C of [t, document]) {
            var _ = Cs.get(C);
            _ === void 0 && (_ = /* @__PURE__ */ new Map(), Cs.set(C, _));
            var A = _.get(b);
            A === void 0 ? (C.addEventListener(b, pr, { passive: h }), _.set(b, 1)) : _.set(b, A + 1);
          }
        }
      }
    };
    return g(Bs(Ka)), _r.add(g), () => {
      for (var y of m)
        for (const h of [t, document]) {
          var S = (
            /** @type {Map<string, number>} */
            Cs.get(h)
          ), b = (
            /** @type {number} */
            S.get(y)
          );
          --b == 0 ? (h.removeEventListener(y, pr), S.delete(y), S.size === 0 && Cs.delete(h)) : S.set(y, b);
        }
      _r.delete(g), f !== s && f.parentNode?.removeChild(f);
    };
  });
  return $i.set(c, d), c;
}
let $i = /* @__PURE__ */ new WeakMap();
class Xa {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #e = /* @__PURE__ */ new Map();
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
  #a = /* @__PURE__ */ new Map();
  /**
   * Similar to #onscreen with respect to the keys, but contains branches that are not yet
   * in the DOM, because their insertion is deferred.
   * @type {Map<Key, Branch>}
   */
  #t = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #l = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #s = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, s = !0) {
    this.anchor = t, this.#s = s;
  }
  /**
   * @param {Batch} batch
   */
  #i = (t) => {
    if (this.#e.has(t)) {
      var s = (
        /** @type {Key} */
        this.#e.get(t)
      ), r = this.#a.get(s);
      if (r)
        Er(r), this.#l.delete(s);
      else {
        var n = this.#t.get(s);
        n && (this.#a.set(s, n.effect), this.#t.delete(s), n.fragment.lastChild.remove(), this.anchor.before(n.fragment), r = n.effect);
      }
      for (const [i, l] of this.#e) {
        if (this.#e.delete(i), i === t)
          break;
        const v = this.#t.get(l);
        v && ($e(v.effect), this.#t.delete(l));
      }
      for (const [i, l] of this.#a) {
        if (i === s || this.#l.has(i)) continue;
        const v = () => {
          if (Array.from(this.#e.values()).includes(i)) {
            var d = document.createDocumentFragment();
            Ha(l, d), d.append(vt()), this.#t.set(i, { effect: l, fragment: d });
          } else
            $e(l);
          this.#l.delete(i), this.#a.delete(i);
        };
        this.#s || !r ? (this.#l.add(i), Ot(l, v, !1)) : v();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #r = (t) => {
    this.#e.delete(t);
    const s = Array.from(this.#e.values());
    for (const [r, n] of this.#t)
      s.includes(r) || ($e(n.effect), this.#t.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, s) {
    var r = (
      /** @type {Batch} */
      ne
    ), n = Aa();
    if (s && !this.#a.has(t) && !this.#t.has(t))
      if (n) {
        var i = document.createDocumentFragment(), l = vt();
        i.append(l), this.#t.set(t, {
          effect: je(() => s(l)),
          fragment: i
        });
      } else
        this.#a.set(
          t,
          je(() => s(this.anchor))
        );
    if (this.#e.set(r, t), n) {
      for (const [v, c] of this.#a)
        v === t ? r.unskip_effect(c) : r.skip_effect(c);
      for (const [v, c] of this.#t)
        v === t ? r.unskip_effect(c.effect) : r.skip_effect(c.effect);
      r.oncommit(this.#i), r.ondiscard(this.#r);
    } else
      this.#i(r);
  }
}
function de(e, t, s = !1) {
  var r = new Xa(e), n = s ? Ct : 0;
  function i(l, v) {
    r.ensure(l, v);
  }
  Js(() => {
    var l = !1;
    t((v, c = 0) => {
      l = !0, i(c, v);
    }), l || i(!1, null);
  }, n);
}
function Fe(e, t) {
  return t;
}
function Ni(e, t, s) {
  for (var r = [], n = t.length, i, l = t.length, v = 0; v < n; v++) {
    let m = t[v];
    Ot(
      m,
      () => {
        if (i) {
          if (i.pending.delete(m), i.done.add(m), i.pending.size === 0) {
            var g = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            mr(Bs(i.done)), g.delete(i), g.size === 0 && (e.outrogroups = null);
          }
        } else
          l -= 1;
      },
      !1
    );
  }
  if (l === 0) {
    var c = r.length === 0 && s !== null;
    if (c) {
      var d = (
        /** @type {Element} */
        s
      ), f = (
        /** @type {Element} */
        d.parentNode
      );
      bi(f), f.append(d), e.items.clear();
    }
    mr(t, !c);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function mr(e, t = !0) {
  for (var s = 0; s < e.length; s++)
    $e(e[s], t);
}
var Zr;
function Se(e, t, s, r, n, i = null) {
  var l = e, v = /* @__PURE__ */ new Map(), c = (t & oa) !== 0;
  if (c) {
    var d = (
      /** @type {Element} */
      e
    );
    l = d.appendChild(vt());
  }
  var f = null, m = /* @__PURE__ */ xr(() => {
    var _ = s();
    return gr(_) ? _ : _ == null ? [] : Bs(_);
  }), g, y = !0;
  function S() {
    h.fallback = f, Li(h, g, l, t, r), f !== null && (g.length === 0 ? (f.f & ct) === 0 ? Er(f) : (f.f ^= ct, us(f, null, l)) : Ot(f, () => {
      f = null;
    }));
  }
  var b = Js(() => {
    g = /** @type {V[]} */
    a(m);
    for (var _ = g.length, A = /* @__PURE__ */ new Set(), C = (
      /** @type {Batch} */
      ne
    ), $ = Aa(), H = 0; H < _; H += 1) {
      var J = g[H], K = r(J, H), z = y ? null : v.get(K);
      z ? (z.v && Wt(z.v, J), z.i && Wt(z.i, H), $ && C.unskip_effect(z.e)) : (z = Hi(
        v,
        y ? l : Zr ??= vt(),
        J,
        K,
        H,
        n,
        t,
        s
      ), y || (z.e.f |= ct), v.set(K, z)), A.add(K);
    }
    if (_ === 0 && i && !f && (y ? f = je(() => i(l)) : (f = je(() => i(Zr ??= vt())), f.f |= ct)), _ > A.size && Cn(), !y)
      if ($) {
        for (const [ce, F] of v)
          A.has(ce) || C.skip_effect(F.e);
        C.oncommit(S), C.ondiscard(() => {
        });
      } else
        S();
    a(m);
  }), h = { effect: b, items: v, outrogroups: null, fallback: f };
  y = !1;
}
function cs(e) {
  for (; e !== null && (e.f & et) === 0; )
    e = e.next;
  return e;
}
function Li(e, t, s, r, n) {
  var i = (r & Jn) !== 0, l = t.length, v = e.items, c = cs(e.effect.first), d, f = null, m, g = [], y = [], S, b, h, _;
  if (i)
    for (_ = 0; _ < l; _ += 1)
      S = t[_], b = n(S, _), h = /** @type {EachItem} */
      v.get(b).e, (h.f & ct) === 0 && (h.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(h));
  for (_ = 0; _ < l; _ += 1) {
    if (S = t[_], b = n(S, _), h = /** @type {EachItem} */
    v.get(b).e, e.outrogroups !== null)
      for (const F of e.outrogroups)
        F.pending.delete(h), F.done.delete(h);
    if ((h.f & ct) !== 0)
      if (h.f ^= ct, h === c)
        us(h, null, s);
      else {
        var A = f ? f.next : c;
        h === e.effect.last && (e.effect.last = h.prev), h.prev && (h.prev.next = h.next), h.next && (h.next.prev = h.prev), _t(e, f, h), _t(e, h, A), us(h, A, s), f = h, g = [], y = [], c = cs(f.next);
        continue;
      }
    if ((h.f & He) !== 0 && (Er(h), i && (h.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(h))), h !== c) {
      if (d !== void 0 && d.has(h)) {
        if (g.length < y.length) {
          var C = y[0], $;
          f = C.prev;
          var H = g[0], J = g[g.length - 1];
          for ($ = 0; $ < g.length; $ += 1)
            us(g[$], C, s);
          for ($ = 0; $ < y.length; $ += 1)
            d.delete(y[$]);
          _t(e, H.prev, J.next), _t(e, f, H), _t(e, J, C), c = C, f = J, _ -= 1, g = [], y = [];
        } else
          d.delete(h), us(h, c, s), _t(e, h.prev, h.next), _t(e, h, f === null ? e.effect.first : f.next), _t(e, f, h), f = h;
        continue;
      }
      for (g = [], y = []; c !== null && c !== h; )
        (d ??= /* @__PURE__ */ new Set()).add(c), y.push(c), c = cs(c.next);
      if (c === null)
        continue;
    }
    (h.f & ct) === 0 && g.push(h), f = h, c = cs(h.next);
  }
  if (e.outrogroups !== null) {
    for (const F of e.outrogroups)
      F.pending.size === 0 && (mr(Bs(F.done)), e.outrogroups?.delete(F));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (c !== null || d !== void 0) {
    var K = [];
    if (d !== void 0)
      for (h of d)
        (h.f & He) === 0 && K.push(h);
    for (; c !== null; )
      (c.f & He) === 0 && c !== e.fallback && K.push(c), c = cs(c.next);
    var z = K.length;
    if (z > 0) {
      var ce = (r & oa) !== 0 && l === 0 ? s : null;
      if (i) {
        for (_ = 0; _ < z; _ += 1)
          K[_].nodes?.a?.measure();
        for (_ = 0; _ < z; _ += 1)
          K[_].nodes?.a?.fix();
      }
      Ni(e, K, ce);
    }
  }
  i && Ze(() => {
    if (m !== void 0)
      for (h of m)
        h.nodes?.a?.apply();
  });
}
function Hi(e, t, s, r, n, i, l, v) {
  var c = (l & jn) !== 0 ? (l & Vn) === 0 ? /* @__PURE__ */ pi(s, !1, !1) : Nt(s) : null, d = (l & Un) !== 0 ? Nt(n) : null;
  return {
    v: c,
    i: d,
    e: je(() => (i(t, c ?? s, d ?? n, v), () => {
      e.delete(r);
    }))
  };
}
function us(e, t, s) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end, i = t && (t.f & ct) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : s; r !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ys(r)
      );
      if (i.before(r), r === n)
        return;
      r = l;
    }
}
function _t(e, t, s) {
  t === null ? e.effect.first = s : t.next = s, s === null ? e.effect.last = t : s.prev = t;
}
function Qr(e, t, s = !1, r = !1, n = !1) {
  var i = e, l = "";
  V(() => {
    var v = (
      /** @type {Effect} */
      ie
    );
    if (l !== (l = t() ?? "") && (v.nodes !== null && (Ca(
      v.nodes.start,
      /** @type {TemplateNode} */
      v.nodes.end
    ), v.nodes = null), l !== "")) {
      var c = s ? Gn : r ? Wn : void 0, d = (
        /** @type {HTMLTemplateElement | SVGElement | MathMLElement} */
        Pa(s ? "svg" : r ? "math" : "template", c)
      );
      d.innerHTML = /** @type {any} */
      l;
      var f = s || r ? d : (
        /** @type {HTMLTemplateElement} */
        d.content
      );
      if (bs(
        /** @type {TemplateNode} */
        /* @__PURE__ */ It(f),
        /** @type {TemplateNode} */
        f.lastChild
      ), s || r)
        for (; /* @__PURE__ */ It(f); )
          i.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ It(f)
          );
      else
        i.before(f);
    }
  });
}
function qi(e, t, s) {
  var r = new Xa(e);
  Js(() => {
    var n = t() ?? null;
    r.ensure(n, n && ((i) => s(i, n)));
  }, Ct);
}
const ea = [...` 	
\r\f \v\uFEFF`];
function Bi(e, t, s) {
  var r = e == null ? "" : "" + e;
  if (t && (r = r ? r + " " + t : t), s) {
    for (var n of Object.keys(s))
      if (s[n])
        r = r ? r + " " + n : n;
      else if (r.length)
        for (var i = n.length, l = 0; (l = r.indexOf(n, l)) >= 0; ) {
          var v = l + i;
          (l === 0 || ea.includes(r[l - 1])) && (v === r.length || ea.includes(r[v])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(v + 1) : l = v;
        }
  }
  return r === "" ? null : r;
}
function Yi(e, t) {
  return e == null ? null : String(e);
}
function Ie(e, t, s, r, n, i) {
  var l = e.__className;
  if (l !== s || l === void 0) {
    var v = Bi(s, r, i);
    v == null ? e.removeAttribute("class") : e.className = v, e.__className = s;
  } else if (i && n !== i)
    for (var c in i) {
      var d = !!i[c];
      (n == null || d !== !!n[c]) && e.classList.toggle(c, d);
    }
  return i;
}
function _s(e, t, s, r) {
  var n = e.__style;
  if (n !== t) {
    var i = Yi(t);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e.__style = t;
  }
  return r;
}
function Ga(e, t, s = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!gr(t))
      return Zn();
    for (var r of e.options)
      r.selected = t.includes(ps(r));
    return;
  }
  for (r of e.options) {
    var n = ps(r);
    if (Ma(n, t)) {
      r.selected = !0;
      return;
    }
  }
  (!s || t !== void 0) && (e.selectedIndex = -1);
}
function zi(e) {
  var t = new MutationObserver(() => {
    Ga(e, e.__value);
  });
  t.observe(e, {
    // Listen to option element changes
    childList: !0,
    subtree: !0,
    // because of <optgroup>
    // Listen to option element value attribute changes
    // (doesn't get notified of select value changes,
    // because that property is not reflected as an attribute)
    attributes: !0,
    attributeFilter: ["value"]
  }), js(() => {
    t.disconnect();
  });
}
function ji(e, t, s = t) {
  var r = /* @__PURE__ */ new WeakSet(), n = !0;
  Sr(e, "change", (i) => {
    var l = i ? "[selected]" : ":checked", v;
    if (e.multiple)
      v = [].map.call(e.querySelectorAll(l), ps);
    else {
      var c = e.querySelector(l) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      v = c && ps(c);
    }
    s(v), ne !== null && r.add(ne);
  }), Oa(() => {
    var i = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        qs ?? ne
      );
      if (r.has(l))
        return;
    }
    if (Ga(e, i, n), n && i === void 0) {
      var v = e.querySelector(":checked");
      v !== null && (i = ps(v), s(i));
    }
    e.__value = i, n = !1;
  }), zi(e);
}
function ps(e) {
  return "__value" in e ? e.__value : e.value;
}
const Ui = /* @__PURE__ */ Symbol("is custom element"), Ji = /* @__PURE__ */ Symbol("is html");
function Ae(e, t, s, r) {
  var n = Vi(e);
  n[t] !== (n[t] = s) && (t === "loading" && (e[In] = s), s == null ? e.removeAttribute(t) : typeof s != "string" && Ki(e).includes(t) ? e[t] = s : e.setAttribute(t, s));
}
function Vi(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [Ui]: e.nodeName.includes("-"),
      [Ji]: e.namespaceURI === ca
    }
  );
}
var ta = /* @__PURE__ */ new Map();
function Ki(e) {
  var t = e.getAttribute("is") || e.nodeName, s = ta.get(t);
  if (s) return s;
  ta.set(t, s = []);
  for (var r, n = e, i = Element.prototype; i !== n; ) {
    r = Mn(n);
    for (var l in r)
      r[l].set && s.push(l);
    n = aa(n);
  }
  return s;
}
function ds(e, t, s = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Sr(e, "input", async (n) => {
    var i = n ? e.defaultValue : e.value;
    if (i = ar(e) ? nr(i) : i, s(i), ne !== null && r.add(ne), await Ua(), i !== (i = t())) {
      var l = e.selectionStart, v = e.selectionEnd, c = e.value.length;
      if (e.value = i ?? "", v !== null) {
        var d = e.value.length;
        l === v && v === c && d > c ? (e.selectionStart = d, e.selectionEnd = d) : (e.selectionStart = l, e.selectionEnd = Math.min(v, d));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Vs(t) == null && e.value && (s(ar(e) ? nr(e.value) : e.value), ne !== null && r.add(ne)), Us(() => {
    var n = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        qs ?? ne
      );
      if (r.has(i))
        return;
    }
    ar(e) && n === nr(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
  });
}
const rr = /* @__PURE__ */ new Set();
function $s(e, t, s, r, n = r) {
  var i = s.getAttribute("type") === "checkbox", l = e;
  if (t !== null)
    for (var v of t)
      l = l[v] ??= [];
  l.push(s), Sr(
    s,
    "change",
    () => {
      var c = s.__value;
      i && (c = Xi(l, c, s.checked)), n(c);
    },
    // TODO better default value handling
    () => n(i ? [] : null)
  ), Us(() => {
    var c = r();
    i ? (c = c || [], s.checked = c.includes(s.__value)) : s.checked = Ma(s.__value, c);
  }), js(() => {
    var c = l.indexOf(s);
    c !== -1 && l.splice(c, 1);
  }), rr.has(l) || (rr.add(l), Ze(() => {
    l.sort((c, d) => c.compareDocumentPosition(d) === 4 ? -1 : 1), rr.delete(l);
  })), Ze(() => {
  });
}
function Xi(e, t, s) {
  for (var r = /* @__PURE__ */ new Set(), n = 0; n < e.length; n += 1)
    e[n].checked && r.add(e[n].__value);
  return s || r.delete(t), Array.from(r);
}
function ar(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function nr(e) {
  return e === "" ? null : +e;
}
function sa(e, t) {
  return e === t || e?.[Ft] === t;
}
function st(e = {}, t, s, r) {
  return Oa(() => {
    var n, i;
    return Us(() => {
      n = i, i = r?.() || [], Vs(() => {
        e !== s(...i) && (t(e, ...i), n && sa(s(...n), e) && t(null, ...n));
      });
    }), () => {
      Ze(() => {
        i && sa(s(...i), e) && t(null, ...i);
      });
    };
  }), e;
}
const Gi = {
  get(e, t) {
    let s = e.props.length;
    for (; s--; ) {
      let r = e.props[s];
      if (os(r) && (r = r()), typeof r == "object" && r !== null && t in r) return r[t];
    }
  },
  set(e, t, s) {
    let r = e.props.length;
    for (; r--; ) {
      let n = e.props[r];
      os(n) && (n = n());
      const i = At(n, t);
      if (i && i.set)
        return i.set(s), !0;
    }
    return !1;
  },
  getOwnPropertyDescriptor(e, t) {
    let s = e.props.length;
    for (; s--; ) {
      let r = e.props[s];
      if (os(r) && (r = r()), typeof r == "object" && r !== null && t in r) {
        const n = At(r, t);
        return n && !n.configurable && (n.configurable = !0), n;
      }
    }
  },
  has(e, t) {
    if (t === Ft || t === Fn) return !1;
    for (let s of e.props)
      if (os(s) && (s = s()), s != null && t in s) return !0;
    return !1;
  },
  ownKeys(e) {
    const t = [];
    for (let s of e.props)
      if (os(s) && (s = s()), !!s) {
        for (const r in s)
          t.includes(r) || t.push(r);
        for (const r of Object.getOwnPropertySymbols(s))
          t.includes(r) || t.push(r);
      }
    return t;
  }
};
function Wi(...e) {
  return new Proxy({ props: e }, Gi);
}
function Wa(e, t, s, r) {
  var n = (
    /** @type {V} */
    r
  ), i = !0, l = () => (i && (i = !1, n = /** @type {V} */
  r), n), v;
  v = /** @type {V} */
  e[t], v === void 0 && r !== void 0 && (v = l());
  var c;
  return c = () => {
    var d = (
      /** @type {V} */
      e[t]
    );
    return d === void 0 ? l() : (i = !0, d);
  }, c;
}
function xt(e) {
  qe === null && On(), Fa(() => {
    const t = Vs(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Zi = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Zi);
function Qi(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var ir = { exports: {} }, ra;
function el() {
  return ra || (ra = 1, (function(e) {
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
      }, s = t.en_US, r = new n(s, 0, !1);
      e.exports = r, typeof Date.now != "function" && (Date.now = function() {
        return +/* @__PURE__ */ new Date();
      });
      function n(b, h, _) {
        var A = b || s, C = h || 0, $ = _ || !1, H = 0, J;
        function K(F, M) {
          var R;
          if (M) {
            if (R = M.getTime(), $) {
              var w = f(M);
              if (M = new Date(R + w + C), f(M) !== w) {
                var j = f(M);
                M = new Date(R + j + C);
              }
            }
          } else {
            var P = Date.now();
            P > H ? (H = P, J = new Date(H), R = H, $ && (J = new Date(H + f(J) + C))) : R = H, M = J;
          }
          return z(F, M, A, R);
        }
        function z(F, M, R, P) {
          for (var w = "", j = null, Q = !1, q = F.length, ve = !1, he = 0; he < q; he++) {
            var N = F.charCodeAt(he);
            if (Q === !0) {
              if (N === 45) {
                j = "";
                continue;
              } else if (N === 95) {
                j = " ";
                continue;
              } else if (N === 48) {
                j = "0";
                continue;
              } else if (N === 58) {
                ve && S("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), ve = !0;
                continue;
              }
              switch (N) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  w += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  w += R.days[M.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  w += R.months[M.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  w += i(Math.floor(M.getFullYear() / 100), j);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  w += z(R.formats.D, M, R, P);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  w += z(R.formats.F, M, R, P);
                  break;
                // '00'
                // case 'H':
                case 72:
                  w += i(M.getHours(), j);
                  break;
                // '12'
                // case 'I':
                case 73:
                  w += i(v(M.getHours()), j);
                  break;
                // '000'
                // case 'L':
                case 76:
                  w += l(Math.floor(P % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  w += i(M.getMinutes(), j);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  w += M.getHours() < 12 ? R.am : R.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  w += z(R.formats.R, M, R, P);
                  break;
                // '00'
                // case 'S':
                case 83:
                  w += i(M.getSeconds(), j);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  w += z(R.formats.T, M, R, P);
                  break;
                // '00'
                // case 'U':
                case 85:
                  w += i(c(M, "sunday"), j);
                  break;
                // '00'
                // case 'W':
                case 87:
                  w += i(c(M, "monday"), j);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  w += z(R.formats.X, M, R, P);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  w += M.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if ($ && C === 0)
                    w += "GMT";
                  else {
                    var Z = m(M);
                    w += Z || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  w += R.shortDays[M.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  w += R.shortMonths[M.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  w += z(R.formats.c, M, R, P);
                  break;
                // '01'
                // case 'd':
                case 100:
                  w += i(M.getDate(), j);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  w += i(M.getDate(), j ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  w += R.shortMonths[M.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var O = new Date(M.getFullYear(), 0, 1), L = Math.ceil((M.getTime() - O.getTime()) / (1e3 * 60 * 60 * 24));
                  w += l(L);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  w += i(M.getHours(), j ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  w += i(v(M.getHours()), j ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  w += i(M.getMonth() + 1, j);
                  break;
                // '\n'
                // case 'n':
                case 110:
                  w += `
`;
                  break;
                // '1st'
                // case 'o':
                case 111:
                  var L = M.getDate();
                  R.ordinalSuffixes ? w += String(L) + (R.ordinalSuffixes[L - 1] || d(L)) : w += String(L) + d(L);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  w += M.getHours() < 12 ? R.AM : R.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  w += z(R.formats.r, M, R, P);
                  break;
                // '0'
                // case 's':
                case 115:
                  w += Math.floor(P / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  w += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var L = M.getDay();
                  w += L === 0 ? 7 : L;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  w += z(R.formats.v, M, R, P);
                  break;
                // '4'
                // case 'w':
                case 119:
                  w += M.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  w += z(R.formats.x, M, R, P);
                  break;
                // '70'
                // case 'y':
                case 121:
                  w += i(M.getFullYear() % 100, j);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if ($ && C === 0)
                    w += ve ? "+00:00" : "+0000";
                  else {
                    var U;
                    C !== 0 ? U = C / (60 * 1e3) : U = -M.getTimezoneOffset();
                    var ee = U < 0 ? "-" : "+", te = ve ? ":" : "", le = Math.floor(Math.abs(U / 60)), G = Math.abs(U % 60);
                    w += ee + i(le) + te + i(G);
                  }
                  break;
                default:
                  Q && (w += "%"), w += F[he];
                  break;
              }
              j = null, Q = !1;
              continue;
            }
            if (N === 37) {
              Q = !0;
              continue;
            }
            w += F[he];
          }
          return w;
        }
        var ce = K;
        return ce.localize = function(F) {
          return new n(F || A, C, $);
        }, ce.localizeByIdentifier = function(F) {
          var M = t[F];
          return M ? ce.localize(M) : (S('[WARNING] No locale found with identifier "' + F + '".'), ce);
        }, ce.timezone = function(F) {
          var M = C, R = $, P = typeof F;
          if (P === "number" || P === "string")
            if (R = !0, P === "string") {
              var w = F[0] === "-" ? -1 : 1, j = parseInt(F.slice(1, 3), 10), Q = parseInt(F.slice(3, 5), 10);
              M = w * (60 * j + Q) * 60 * 1e3;
            } else P === "number" && (M = F * 60 * 1e3);
          return new n(A, M, R);
        }, ce.utc = function() {
          return new n(A, C, !0);
        }, ce;
      }
      function i(b, h) {
        return h === "" || b > 9 ? "" + b : (h == null && (h = "0"), h + b);
      }
      function l(b) {
        return b > 99 ? b : b > 9 ? "0" + b : "00" + b;
      }
      function v(b) {
        return b === 0 ? 12 : b > 12 ? b - 12 : b;
      }
      function c(b, h) {
        h = h || "sunday";
        var _ = b.getDay();
        h === "monday" && (_ === 0 ? _ = 6 : _--);
        var A = Date.UTC(b.getFullYear(), 0, 1), C = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()), $ = Math.floor((C - A) / 864e5), H = ($ + 7 - _) / 7;
        return Math.floor(H);
      }
      function d(b) {
        var h = b % 10, _ = b % 100;
        if (_ >= 11 && _ <= 13 || h === 0 || h >= 4)
          return "th";
        switch (h) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
        }
      }
      function f(b) {
        return (b.getTimezoneOffset() || 0) * 6e4;
      }
      function m(b, h) {
        return g() || y(b);
      }
      function g(b, h) {
        return null;
      }
      function y(b) {
        var h = b.toString().match(/\(([\w\s]+)\)/);
        return h && h[1];
      }
      function S(b) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(b);
      }
    })();
  })(ir)), ir.exports;
}
var tl = el();
const Jt = /* @__PURE__ */ Qi(tl);
let lr = /* @__PURE__ */ B(!1);
class sl {
  constructor(t) {
    if (this.sk = "", this.fetchFn = t || (typeof window < "u" ? fetch.bind(window) : fetch), typeof document < "u") {
      const s = document.querySelector('meta[name="csrf-token"]');
      s && (this.sk = s.content);
    }
  }
  get loading() {
    return a(lr);
  }
  async request(t, s = {}) {
    k(lr, !0);
    try {
      const r = new URL(t, window.location.origin);
      s.params && Object.entries(s.params).forEach(([v, c]) => {
        r.searchParams.append(v, String(c));
      });
      const n = new Headers(s.headers || {});
      n.set("X-Requested-With", "fetch");
      let i = s.body;
      s.method && ["POST", "PUT", "PATCH", "DELETE"].includes(s.method.toUpperCase()) && (i instanceof FormData ? i.set("sk", this.sk) : i && typeof i == "object" && !(i instanceof Blob) && !(i instanceof ArrayBuffer) && (n.set("Content-Type", "application/json"), i = JSON.stringify(i)));
      const l = await this.fetchFn(r.toString(), { ...s, headers: n, body: i });
      if (!l.ok)
        throw new Error(`API Error: ${l.status} ${l.statusText}`);
      return await l.json();
    } finally {
      k(lr, !1);
    }
  }
  get(t, s) {
    return this.request(t, { method: "GET", params: s });
  }
  post(t, s) {
    return this.request(t, { method: "POST", body: s });
  }
  get skValue() {
    return this.sk;
  }
}
const oe = new sl(), rl = (e, t = Pt) => {
  var s = al(), r = o(s);
  V(() => {
    Ie(s, 1, `status status-${t().status ?? ""}`, "svelte-13s7gu4"), D(r, t().status);
  }), T(e, s);
};
var al = /* @__PURE__ */ I("<span> </span>"), nl = /* @__PURE__ */ I('<time class="svelte-13s7gu4"> </time>'), il = /* @__PURE__ */ I('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), ll = /* @__PURE__ */ I('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), ol = /* @__PURE__ */ I('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), cl = /* @__PURE__ */ I('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), vl = /* @__PURE__ */ I('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4">エントリ一覧</h2> <div class="search-box svelte-13s7gu4"><input type="text" placeholder="検索..." class="svelte-13s7gu4"/> <button class="svelte-13s7gu4">検索</button></div> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">新しい方へ</button> <button class="svelte-13s7gu4">古い方へ</button></div></div> <div><!></div></div>');
function ul(e, t) {
  at(t, !0);
  const s = (F, M = Pt, R) => {
    let P = /* @__PURE__ */ xr(() => ia(R?.(), !0));
    var w = nl(), j = o(w);
    V(
      (Q) => {
        Ae(w, "datetime", M()), D(j, Q);
      },
      [() => a(P) && M() ? g(M()) : "-"]
    ), T(F, w);
  };
  let r = /* @__PURE__ */ B(ke([])), n = /* @__PURE__ */ B(!1), i = 50, l = /* @__PURE__ */ B(""), v = /* @__PURE__ */ B(ke([]));
  async function c() {
    try {
      const F = a(v)[a(v).length - 1], M = { limit: i };
      a(l) && (M.q = a(l)), F && (M.cursor_id = F);
      const R = await oe.get("/admin/api/entries", M);
      k(r, R.entries || [], !0), k(n, R.has_more || !1, !0);
    } catch (F) {
      console.error(F);
    }
  }
  function d() {
    k(v, [], !0), c();
  }
  xt(c);
  function f() {
    if (a(n) && a(r).length > 0) {
      const F = a(r)[a(r).length - 1];
      a(v).push(F.id), c();
    }
  }
  function m() {
    a(v).length > 0 && (a(v).pop(), c());
  }
  function g(F) {
    return F ? Jt("%Y-%m-%d %H:%M", new Date(F)) : "-";
  }
  var y = vl(), S = o(y), b = u(o(S), 2), h = o(b), _ = u(h, 2), A = u(b, 2), C = o(A), $ = u(C, 2), H = u(S, 2);
  let J;
  var K = o(H);
  {
    var z = (F) => {
      var M = il();
      T(F, M);
    }, ce = (F) => {
      var M = cl(), R = Vt(M), P = u(o(R));
      Se(P, 21, () => a(r), Fe, (Q, q) => {
        var ve = ll(), he = o(ve), N = o(he), Z = u(he), O = o(Z), L = u(Z), U = o(L);
        rl(U, () => a(q));
        var ee = u(L), te = o(ee), le = o(te), G = u(te, 2), se = o(G), ue = o(se), fe = u(ee), _e = o(fe), pe = u(fe), be = o(pe);
        s(be, () => a(q).created_at);
        var p = u(pe), x = o(p);
        s(x, () => a(q).modified_at);
        var Y = u(p), ae = o(Y);
        s(ae, () => a(q).publish_at?.Time, () => a(q).publish_at?.Valid);
        var ye = u(Y), De = o(ye);
        V(() => {
          D(N, a(q).id), D(O, a(q).date), D(le, a(q).title), Ae(se, "href", `/${a(q).path ?? ""}`), D(ue, `/${a(q).path ?? ""}`), D(_e, a(q).format);
        }), W("click", De, () => t.onEdit(a(q).id)), T(Q, ve);
      });
      var w = u(R, 2);
      {
        var j = (Q) => {
          var q = ol();
          T(Q, q);
        };
        de(w, (Q) => {
          oe.loading && Q(j);
        });
      }
      T(F, M);
    };
    de(K, (F) => {
      oe.loading && a(r).length === 0 ? F(z) : F(ce, !1);
    });
  }
  V(() => {
    C.disabled = a(v).length === 0 || oe.loading, $.disabled = !a(n) || oe.loading, J = Ie(H, 1, "table-container svelte-13s7gu4", null, J, { "is-loading": oe.loading });
  }), W("keydown", h, (F) => F.key === "Enter" && d()), ds(h, () => a(l), (F) => k(l, F)), W("click", _, d), W("click", C, m), W("click", $, f), T(e, y), nt();
}
ss(["keydown", "click"]);
class dl {
  #e;
  get exists() {
    return a(this.#e);
  }
  set exists(t) {
    k(this.#e, t, !0);
  }
  #a;
  get data() {
    return a(this.#a);
  }
  set data(t) {
    k(this.#a, t, !0);
  }
  constructor(t = typeof localStorage < "u" ? localStorage : null) {
    this.storage = t, this.timer = null, this.#e = /* @__PURE__ */ B(!1), this.#a = /* @__PURE__ */ B(null);
  }
  key(t) {
    return `nogag-backup-${t || "new"}`;
  }
  check(t, s) {
    if (!this.storage) return;
    const r = this.storage.getItem(this.key(t));
    if (r)
      try {
        const n = JSON.parse(r);
        (n.title !== s.title || n.body !== s.body) && (this.exists = !0, this.data = n);
      } catch (n) {
        console.error("Failed to parse backup", n);
      }
  }
  saveDebounced(t, s, r = 1e3) {
    this.timer && clearTimeout(this.timer), this.timer = setTimeout(
      () => {
        this.save(t, s);
      },
      r
    );
  }
  save(t, s) {
    if (!this.storage) return;
    const r = { title: s.title, body: s.body, time: Date.now() };
    this.storage.setItem(this.key(t), JSON.stringify(r)), this.exists = !1;
  }
  clear(t) {
    this.storage && (this.storage.removeItem(this.key(t)), this.exists = !1, this.data = null);
  }
}
const fl = "public", hl = "draft", _l = "scheduled", pl = "reserved", jt = fl, or = hl, Ns = _l, Ls = pl;
var ml = /* @__PURE__ */ I('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), gl = /* @__PURE__ */ I('<option class="svelte-7nstam"> </option>'), bl = /* @__PURE__ */ I('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), yl = /* @__PURE__ */ I('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), wl = /* @__PURE__ */ I('<button id="restore" type="button" class="submit-button restore-button svelte-7nstam">復元...</button>'), xl = /* @__PURE__ */ I('<div role="option" tabindex="-1"> </div>'), kl = /* @__PURE__ */ I('<div class="preview-overlay svelte-7nstam"><div class="preview-progress-container svelte-7nstam"><div class="preview-progress-bar svelte-7nstam"></div> <div class="preview-progress-text svelte-7nstam">読み込み中...</div></div></div>'), Sl = /* @__PURE__ */ I('<span class="tag svelte-7nstam"> </span>'), Ml = /* @__PURE__ */ I('<div role="button" tabindex="-1"><div class="result-title svelte-7nstam"><!> <!> <button type="button" class="open-result-button svelte-7nstam" title="別タブで開く">↗️</button></div> <div class="result-summary svelte-7nstam"><!></div> <div class="result-meta svelte-7nstam"><span class="result-date svelte-7nstam"> </span> <span class="result-path svelte-7nstam"> </span></div></div>'), Dl = /* @__PURE__ */ I('<div class="no-results svelte-7nstam">結果が見つかりません</div>'), El = /* @__PURE__ */ I('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam">🔗 リンク</button> <button type="button" class="svelte-7nstam"> </button> <span class="char-count svelte-7nstam"> </span> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required="" class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons footer-container svelte-7nstam"><div class="status-selector svelte-7nstam"><label class="status-option svelte-7nstam" title="非公開のまま保存します"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">下書き</span></div></label> <label class="status-option svelte-7nstam" title="今すぐ公開し、URLを確定させます"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">公開</span></div></label> <label class="status-option svelte-7nstam" title="指定した日時に公開します。URLは今すぐ確定します。"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">公開を遅延</span> <span class="description svelte-7nstam">URL確定</span></div></label> <label class="status-option svelte-7nstam" title="指定した日付を投稿日として予約します。公開されるまでURLは確定しません。"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">予約投稿</span> <span class="description svelte-7nstam">URL未定</span></div></label></div> <div class="action-row-container svelte-7nstam"><div class="footer-left svelte-7nstam"><button type="button" class="submit-button svelte-7nstam"><!></button> <!></div> <div class="footer-right svelte-7nstam"><!> <button type="button" class="submit-button preview-button svelte-7nstam">プレビュー</button></div></div></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam" role="listbox" aria-label="タグを選択" tabindex="0"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog> <dialog id="previewDialog" class="svelte-7nstam"><div class="preview-header svelte-7nstam"><h3 class="svelte-7nstam">プレビュー</h3> <button type="button" class="close-button svelte-7nstam">閉じる</button></div> <div class="preview-body svelte-7nstam"><!> <iframe name="preview-iframe" title="Preview" class="svelte-7nstam"></iframe></div></dialog> <dialog id="searchDialog" class="search-dialog svelte-7nstam"><div class="search-header svelte-7nstam"><h3 class="svelte-7nstam">過去日記を検索</h3> <button type="button" class="close-button svelte-7nstam">閉じる</button></div> <div class="search-body svelte-7nstam"><input type="search" placeholder="キーワードを入力..." class="search-input svelte-7nstam"/> <div class="search-results svelte-7nstam"></div></div> <div class="dialog-footer svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button></div></dialog>', 1);
function Tl(e, t) {
  at(t, !0);
  const s = [];
  let r = Wa(t, "id", 3, null);
  const n = new dl();
  let i = /* @__PURE__ */ B(ke({ id: void 0, title: "", body: "", status: "" })), l = ke({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: jt,
    publishAt: ""
  }), v = /* @__PURE__ */ B(!1), c = /* @__PURE__ */ B(""), d = /* @__PURE__ */ B(!1), f = /* @__PURE__ */ B(!0), m = /* @__PURE__ */ B(!1), g = /* @__PURE__ */ B(null), y = /* @__PURE__ */ B(null), S = /* @__PURE__ */ B(null), b = /* @__PURE__ */ B(null), h = /* @__PURE__ */ B(null), _ = /* @__PURE__ */ B(null), A = /* @__PURE__ */ B(null);
  const C = [
    "tech",
    "photo",
    "redeveloped",
    "stablediffusion",
    "photoshopped"
  ];
  let $ = /* @__PURE__ */ B(0), H = /* @__PURE__ */ B(""), J = /* @__PURE__ */ B(ke([])), K = /* @__PURE__ */ B(0), z = /* @__PURE__ */ B(null), ce = ke([]);
  async function F(p) {
    try {
      k(f, !0);
      const x = await oe.get(`/admin/api/entry/${p}`);
      k(i, x, !0), l.id = x.id, l.title = x.title ?? "", l.body = x.body ?? "", l.format = x.format || "Hatena", l.status = x.status, x.publish_at?.Valid ? l.publishAt = Jt("%Y-%m-%dT%H:%M", new Date(x.publish_at.Time)) : l.publishAt = Jt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), n.check(a(i).id ?? null, { title: l.title, body: l.body });
    } catch (x) {
      console.error(x), alert("エントリの取得に失敗しました");
    } finally {
      k(f, !1);
    }
  }
  xt(() => {
    r() ? F(r()) : (k(i, { id: void 0, title: "", body: "", status: jt }, !0), l.id = null, l.title = "", l.body = "", l.format = "Hatena", l.status = jt, l.publishAt = Jt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), n.check(null, { title: l.title, body: l.body }), k(f, !1));
  }), Fa(() => {
    (a(i).title !== l.title || a(i).body !== l.body) && n.saveDebounced(a(i).id ?? null, { title: l.title, body: l.body });
  });
  async function M() {
    k(v, !0), k(c, "リクエスト中");
    const p = new FormData();
    if (p.set("id", l.id ? String(l.id) : ""), p.set("title", l.title), p.set("body", l.body), p.set("format", l.format), l.status === Ns || l.status === Ls) {
      const x = new Date(l.publishAt);
      p.set("publish_at", x.toISOString());
    }
    p.set("status", l.status);
    try {
      const Y = (await oe.post("/admin/api/edit", p)).session_id;
      if (!Y)
        throw new Error("保存に失敗しました");
      R(Y);
    } catch (x) {
      k(v, !1), alert(x instanceof Error ? x.message : "エラーが発生しました");
    }
  }
  function R(p) {
    const x = new EventSource(`/admin/api/edit/progress?sid=${p}`);
    x.onmessage = (Y) => {
      const ae = JSON.parse(Y.data);
      switch (ae.type) {
        case "progress":
          k(c, P(ae.message), !0);
          break;
        case "done":
          n.clear(a(i).id ?? null), k(c, "完了"), k(v, !1), x.close(), t.onSave(ae.location);
          break;
        case "error":
          k(c, "エラー: " + ae.message), k(v, !1), x.close(), alert("保存に失敗しました: " + ae.message);
          break;
      }
    }, x.onerror = () => {
      k(v, !1), x.close(), alert("通信エラーが発生しました");
    };
  }
  function P(p) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[p] || p;
  }
  function w() {
    k($, 0), a(S).showModal(), setTimeout(() => a(A)?.focus(), 0);
  }
  function j(p) {
    p.key === "ArrowDown" ? (p.preventDefault(), k($, (a($) + 1) % C.length)) : p.key === "ArrowUp" ? (p.preventDefault(), k($, (a($) - 1 + C.length) % C.length)) : p.key === "Enter" || p.key === " " ? (p.preventDefault(), Q(C[a($)])) : p.key === "Escape" && a(S).close();
  }
  function Q(p) {
    const x = `[${p}]`;
    l.title.includes(x) ? l.title = l.title.replace(x, "") : l.title = x + l.title, a(S).close(), a(g).focus();
  }
  function q() {
    k(H, ""), k(J, [], !0), k(K, 0), a(_).showModal(), setTimeout(() => a(z)?.focus(), 0);
  }
  async function ve(p) {
    if (!(p instanceof KeyboardEvent && p.key === "Enter")) {
      if (a(H).length < 2) {
        k(J, [], !0);
        return;
      }
      try {
        const x = await oe.get("/api/search", { q: a(H) });
        k(J, x.results || [], !0), k(K, 0);
      } catch (x) {
        console.error(x);
      }
    }
  }
  function he(p) {
    p.key === "ArrowDown" || p.ctrlKey && p.key === "n" ? (p.preventDefault(), k(K, (a(K) + 1) % a(J).length), ce[a(K)]?.scrollIntoView({ block: "nearest" })) : p.key === "ArrowUp" || p.ctrlKey && p.key === "p" ? (p.preventDefault(), k(K, (a(K) - 1 + a(J).length) % a(J).length), ce[a(K)]?.scrollIntoView({ block: "nearest" })) : p.key === "Enter" ? (p.preventDefault(), a(J)[a(K)] && (p.shiftKey || p.metaKey || p.ctrlKey ? N(a(J)[a(K)]) : Z(a(J)[a(K)]))) : p.key === "Escape" && a(_).close();
  }
  function N(p) {
    const x = p.path.startsWith("http") ? p.path : `${location.origin}/${p.path}`;
    window.open(x, "_blank");
  }
  function Z(p) {
    const x = p.path.startsWith("http") ? p.path : `${location.origin}/${p.path}`;
    let Y = "";
    switch (l.format) {
      case "Hatena":
        Y = `[${x}:title=${p.title}]`;
        break;
      case "Markdown":
        Y = `[${p.title}](${x})`;
        break;
      case "HTML":
        Y = `<a href="${x}">${p.title}</a>`;
        break;
      case "tDiary":
        Y = `[[${p.title}|${x}]]`;
        break;
      default:
        Y = x;
    }
    U(Y), a(_).close(), a(y).focus();
  }
  function O() {
    n.data && (l.title = n.data.title, l.body = n.data.body, n.clear(a(i).id ?? null), a(b).close());
  }
  async function L() {
    const p = document.createElement("input");
    p.type = "file", p.oninput = async () => {
      if (!p.files?.[0]) return;
      const x = new FormData();
      x.append("file", p.files[0]), k(d, !0);
      try {
        const Y = await oe.post("/admin/api/upload/image", x);
        let ae = "";
        Y.uploaded.toLowerCase().endsWith(".webm") ? ae = `<video src="${Y.uploaded}" autoplay loop muted playsinline style="max-width: 100%; height: auto;"></video>
` : ae = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${Y.uploaded}" class="picasa" itemprop="url"><img src="${Y.uploaded}" alt="photo" itemprop="image"/></a></span>
`, U(ae, !0);
      } catch {
        alert("アップロードに失敗しました");
      } finally {
        k(d, !1);
      }
    }, p.click();
  }
  function U(p, x = !1) {
    const Y = a(y).selectionStart, ae = a(y).selectionEnd, ye = a(y).value;
    l.body = ye.substring(0, Y) + p + ye.substring(ae), Ua().then(() => {
      typeof x == "boolean" && x ? (a(y).selectionStart = Y, a(y).selectionEnd = Y + p.length) : typeof x == "number" ? a(y).selectionStart = a(y).selectionEnd = Y + x : a(y).selectionStart = a(y).selectionEnd = Y + p.length, a(y).focus();
    });
  }
  function ee(p) {
    const x = (p.altKey ? "Alt-" : "") + (p.ctrlKey ? "Control-" : "") + (p.metaKey ? "Meta-" : "") + (p.shiftKey ? "Shift-" : "") + p.key;
    x === "Control-t" ? (U("\\(  \\)", 3), p.preventDefault(), p.stopPropagation()) : (x === "Control-l" || x === "Meta-l") && (q(), p.preventDefault(), p.stopPropagation());
  }
  function te() {
    a(h).showModal();
    const p = document.getElementsByName("preview-iframe")[0];
    p && (p.src = "about:blank"), setTimeout(
      () => {
        k(m, !0);
      },
      0
    );
    const x = document.createElement("form");
    x.method = "POST", x.action = "/admin/api/preview", x.target = "preview-iframe";
    const Y = {
      title: l.title,
      body: l.body,
      format: l.format,
      sk: oe.skValue
    };
    for (const [ae, ye] of Object.entries(Y)) {
      const De = document.createElement("input");
      De.type = "hidden", De.name = ae, De.value = ye, x.appendChild(De);
    }
    document.body.appendChild(x), x.submit(), document.body.removeChild(x);
  }
  function le() {
    k(m, !1), a(h).close();
  }
  function G(p) {
    const x = document.createElement("p");
    return x.textContent = p, x.innerHTML;
  }
  function se(p, x) {
    if (!x) return G(p);
    const Y = G(p), ae = x.split(/\s+/).filter((Ne) => Ne.length >= 2);
    if (ae.length === 0) return Y;
    const ye = ae.map((Ne) => Ne.replace(/[.*+?^${}()|[\\]/g, "\\$&")).join("|"), De = new RegExp(`(${ye})`, "gi");
    return Y.replace(De, "<mark>$1</mark>");
  }
  function ue(p) {
    const Y = new DOMParser().parseFromString(p, "text/html");
    Y.querySelectorAll("script, style, noscript, iframe").forEach((ye) => ye.remove());
    const ae = Y.body.textContent || "";
    return ae.replace(/\s+/g, " ").trim().substring(0, 200) + (ae.length > 200 ? "..." : "");
  }
  var fe = Wr(), _e = Vt(fe);
  {
    var pe = (p) => {
      var x = ml();
      T(p, x);
    }, be = (p) => {
      var x = El(), Y = Vt(x), ae = o(Y), ye = o(ae);
      st(ye, (E) => k(g, E), () => a(g));
      var De = u(ye, 2), Ne = o(De), dt = u(Ne, 2), Be = u(dt, 2), me = o(Be), Ee = u(Be, 2), tt = o(Ee), ft = u(Ee, 2);
      Se(ft, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], Fe, (E, X) => {
        var xe = gl(), we = o(xe), Ye = {};
        V(() => {
          D(we, X), Ye !== (Ye = X) && (xe.value = (xe.__value = X) ?? "");
        }), T(E, xe);
      });
      var rs = u(De, 2), kt = o(rs);
      st(kt, (E) => k(y, E), () => a(y));
      var ht = u(ae, 2), St = o(ht);
      {
        var Ks = (E) => {
          var X = bl();
          T(E, X);
        };
        de(St, (E) => {
          a(v) && E(Ks);
        });
      }
      var xs = u(St, 2), ks = o(xs), Ss = o(ks), qt = o(Ss), Ms, Ds = u(Ss, 2), Bt = o(Ds), Es, Ts = u(Ds, 2), as = o(Ts), As, Xs = u(Ts, 2), ns = o(Xs), Ps, Gs = u(ks, 2), Yt = o(Gs), it = o(Yt), Mt = o(it);
      {
        var is = (E) => {
          var X = Ut();
          V(() => D(X, a(c) || "リクエスト中")), T(E, X);
        }, Ws = (E) => {
          var X = Ut("下書き保存");
          T(E, X);
        }, Zs = (E) => {
          var X = Ut();
          V(() => D(X, r() ? "更新する" : "公開する")), T(E, X);
        }, Za = (E) => {
          var X = Ut("予約する");
          T(E, X);
        };
        de(Mt, (E) => {
          a(v) ? E(is) : l.status === or ? E(Ws, 1) : l.status === jt ? E(Zs, 2) : E(Za, !1);
        });
      }
      var Qa = u(it, 2);
      {
        var en = (E) => {
          var X = yl();
          ds(X, () => l.publishAt, (xe) => l.publishAt = xe), T(E, X);
        };
        de(Qa, (E) => {
          (l.status === Ns || l.status === Ls) && E(en);
        });
      }
      var tn = u(Yt, 2), Tr = o(tn);
      {
        var sn = (E) => {
          var X = wl();
          W("click", X, () => a(b).showModal()), T(E, X);
        };
        de(Tr, (E) => {
          n.exists && E(sn);
        });
      }
      var Ar = u(Tr, 2), Qs = u(Y, 2), Fs = u(o(Qs), 2);
      Se(Fs, 21, () => C, Fe, (E, X, xe) => {
        var we = xl();
        let Ye;
        var zt = o(we);
        V(() => {
          Ye = Ie(we, 1, "tag-item svelte-7nstam", null, Ye, { selected: a($) === xe }), Ae(we, "aria-selected", a($) === xe), D(zt, a(X));
        }), W("click", we, () => Q(a(X))), Rs("mouseenter", we, () => k($, xe, !0)), W("keydown", we, (Is) => Is.key === "Enter" && Q(a(X))), T(E, we);
      }), st(Fs, (E) => k(A, E), () => a(A));
      var rn = u(Fs, 2);
      st(Qs, (E) => k(S, E), () => a(S));
      var er = u(Qs, 2), Pr = u(o(er), 2), an = o(Pr);
      {
        var nn = (E) => {
          var X = Ut();
          V((xe) => D(X, xe), [() => Jt("%Y年%m月%d日%H時", new Date(n.data.time))]), T(E, X);
        };
        de(an, (E) => {
          n.data?.time && E(nn);
        });
      }
      var ln = u(Pr, 2), Fr = o(ln), on = u(Fr, 2);
      st(er, (E) => k(b, E), () => a(b));
      var tr = u(er, 2), Ir = o(tr), cn = u(o(Ir), 2), vn = u(Ir, 2), Or = o(vn);
      {
        var un = (E) => {
          var X = kl();
          T(E, X);
        };
        de(Or, (E) => {
          a(m) && E(un);
        });
      }
      var Rr = u(Or, 2);
      st(tr, (E) => k(h, E), () => a(h));
      var Cr = u(tr, 2), $r = o(Cr), dn = u(o($r), 2), Nr = u($r, 2), ls = o(Nr);
      st(ls, (E) => k(z, E), () => a(z));
      var fn = u(ls, 2);
      Se(
        fn,
        21,
        () => a(J),
        Fe,
        (E, X, xe) => {
          var we = Ml();
          let Ye;
          var zt = o(we), Is = o(zt);
          Qr(Is, () => se(a(X).title, a(H)));
          var Lr = u(Is, 2);
          Se(Lr, 17, () => a(X).tags, Fe, (lt, sr) => {
            var Br = Sl(), xn = o(Br);
            V(() => D(xn, a(sr))), T(lt, Br);
          });
          var pn = u(Lr, 2), Hr = u(zt, 2), mn = o(Hr);
          Qr(mn, () => se(ue(a(X).formatted_body), a(H)));
          var gn = u(Hr, 2), qr = o(gn), bn = o(qr), yn = u(qr, 2), wn = o(yn);
          st(we, (lt, sr) => ce[sr] = lt, (lt) => ce?.[lt], () => [xe]), V(() => {
            Ye = Ie(we, 1, "search-result-item svelte-7nstam", null, Ye, { selected: a(K) === xe }), D(bn, a(X).date), D(wn, a(X).path);
          }), W("click", we, () => Z(a(X))), Rs("mouseenter", we, () => k(K, xe, !0)), W("keydown", we, (lt) => lt.key === "Enter" && Z(a(X))), W("click", pn, (lt) => {
            lt.stopPropagation(), N(a(X));
          }), T(E, we);
        },
        (E) => {
          var X = Wr(), xe = Vt(X);
          {
            var we = (Ye) => {
              var zt = Dl();
              T(Ye, zt);
            };
            de(xe, (Ye) => {
              a(H).length >= 2 && Ye(we);
            });
          }
          T(E, X);
        }
      );
      var hn = u(Nr, 2), _n = o(hn);
      st(Cr, (E) => k(_, E), () => a(_)), V(() => {
        Be.disabled = a(d), D(me, a(d) ? "⌛ アップロード中..." : "📷 写真"), D(tt, `${(l.body ?? "").length ?? ""} 文字`), Ms !== (Ms = or) && (qt.value = (qt.__value = or) ?? ""), Es !== (Es = jt) && (Bt.value = (Bt.__value = jt) ?? ""), As !== (As = Ns) && (as.value = (as.__value = Ns) ?? ""), Ps !== (Ps = Ls) && (ns.value = (ns.__value = Ls) ?? ""), it.disabled = a(v), Ar.disabled = a(v);
      }), ds(ye, () => l.title, (E) => l.title = E), W("click", Ne, w), W("click", dt, q), W("click", Be, L), ji(ft, () => l.format, (E) => l.format = E), W("keydown", kt, ee), ds(kt, () => l.body, (E) => l.body = E), $s(
        s,
        [],
        qt,
        () => l.status,
        (E) => l.status = E
      ), $s(
        s,
        [],
        Bt,
        () => l.status,
        (E) => l.status = E
      ), $s(
        s,
        [],
        as,
        () => l.status,
        (E) => l.status = E
      ), $s(
        s,
        [],
        ns,
        () => l.status,
        (E) => l.status = E
      ), W("click", it, M), W("click", Ar, te), W("keydown", Fs, j), W("click", rn, () => a(S).close()), W("click", Fr, () => a(b).close()), W("click", on, O), W("click", cn, le), Rs("load", Rr, () => {
        a(m) && k(m, !1);
      }), Rs("error", Rr, () => {
        k(m, !1), alert("プレビューの読み込みに失敗しました");
      }), W("click", dn, () => a(_).close()), W("input", ls, (E) => ve(E)), W("keydown", ls, he), ds(ls, () => a(H), (E) => k(H, E)), W("click", _n, () => a(_).close()), T(p, x);
    };
    de(_e, (p) => {
      a(f) ? p(pe) : p(be, !1);
    });
  }
  T(e, fe), nt();
}
ss(["click", "keydown", "input"]);
const Al = (e, t = Pt) => {
  var s = Pl(), r = o(s);
  V(() => {
    Ie(s, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), D(r, t());
  }), T(e, s);
};
var Pl = /* @__PURE__ */ I("<span> </span>"), Fl = /* @__PURE__ */ I('<time class="time svelte-1r6codn"> </time>'), Il = /* @__PURE__ */ I('<span class="dep-type svelte-1r6codn"> </span>'), Ol = /* @__PURE__ */ I('<button><span class="dep-id svelte-1r6codn"> </span> <!> <span class="dep-cond svelte-1r6codn"> </span></button>'), Rl = /* @__PURE__ */ I('<div class="loading svelte-1r6codn"></div>'), Cl = /* @__PURE__ */ I('<span class="uniqkey svelte-1r6codn"> </span>'), $l = /* @__PURE__ */ I('<div class="depends-on svelte-1r6codn"><div class="strategy svelte-1r6codn"> </div> <div class="dep-list svelte-1r6codn"></div></div>'), Nl = /* @__PURE__ */ I('<div class="error-text svelte-1r6codn"> </div>'), Ll = /* @__PURE__ */ I('<tr><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><div class="type-uniqkey svelte-1r6codn"><strong class="svelte-1r6codn"> </strong> <!></div></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"><!></td><td class="error svelte-1r6codn"><!></td></tr>'), Hl = /* @__PURE__ */ I('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type / Uniqkey</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Finished At</th><th class="svelte-1r6codn">Depends On</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), ql = /* @__PURE__ */ I('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">新しい方へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">古い方へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function Bl(e, t) {
  at(t, !0);
  const s = (P, w = Pt, j) => {
    let Q = /* @__PURE__ */ xr(() => ia(j?.(), !0));
    var q = Fl(), ve = o(q);
    V(
      (he) => {
        Ae(q, "datetime", w()), D(ve, he);
      },
      [() => a(Q) && w() ? b(w()) : "-"]
    ), T(P, q);
  }, r = (P, w = Pt, j = Pt) => {
    const Q = /* @__PURE__ */ Ue(() => f(w()));
    var q = Ol(), ve = o(q), he = o(ve), N = u(ve, 2);
    {
      var Z = (U) => {
        var ee = Il(), te = o(ee);
        V(() => D(te, a(Q).job_type_name)), T(U, ee);
      };
      de(N, (U) => {
        a(Q) && U(Z);
      });
    }
    var O = u(N, 2), L = o(O);
    V(() => {
      Ie(q, 1, `dep-chip status-${(a(Q)?.status || "unknown") ?? ""}`, "svelte-1r6codn"), D(he, `#${w() ?? ""}`), Ae(O, "title", `Condition: ${j() ?? ""}`), D(L, j() === "completed" ? "✅" : "🏁");
    }), W("click", q, () => m(w())), T(P, q);
  };
  let n = /* @__PURE__ */ B(ke([])), i = /* @__PURE__ */ B(0), l = /* @__PURE__ */ B(0), v = 50, c = /* @__PURE__ */ B(null);
  function d(P) {
    if (!P.depends_on?.Valid || !P.depends_on.String || P.depends_on.String === "null") return null;
    try {
      const w = JSON.parse(P.depends_on.String);
      return !w || typeof w != "object" || !Array.isArray(w.dependencies) ? null : w;
    } catch {
      return null;
    }
  }
  function f(P) {
    return a(n).find((w) => w.id === P);
  }
  function m(P) {
    const w = document.getElementById(`job-${P}`);
    w && (w.scrollIntoView({ behavior: "smooth", block: "center" }), k(c, P, !0), setTimeout(
      () => {
        a(c) === P && k(c, null);
      },
      2e3
    ));
  }
  async function g() {
    try {
      const P = await oe.get("/admin/api/jobs", { limit: v, offset: a(l) });
      k(n, P.jobs || [], !0), k(i, P.total || 0, !0);
    } catch (P) {
      console.error(P);
    }
  }
  xt(g);
  function y() {
    a(l) + v < a(i) && (k(l, a(l) + v), g());
  }
  function S() {
    a(l) - v >= 0 && (k(l, a(l) - v), g());
  }
  function b(P) {
    return Jt("%Y-%m-%d %H:%M:%S", new Date(P));
  }
  var h = ql(), _ = o(h), A = o(_), C = o(A), $ = u(A, 2), H = o($), J = u(H, 2), K = o(J), z = u(J, 2), ce = u(z, 2), F = u(_, 2);
  {
    var M = (P) => {
      var w = Rl();
      T(P, w);
    }, R = (P) => {
      var w = Hl(), j = u(o(w));
      Se(j, 21, () => a(n), Fe, (Q, q) => {
        var ve = Ll();
        let he;
        var N = o(ve), Z = o(N), O = u(N), L = o(O), U = o(L), ee = o(U), te = u(U, 2);
        {
          var le = (me) => {
            var Ee = Cl(), tt = o(Ee);
            V(() => {
              Ae(Ee, "title", a(q).uniqkey.String), D(tt, a(q).uniqkey.String);
            }), T(me, Ee);
          };
          de(te, (me) => {
            a(q).uniqkey?.Valid && me(le);
          });
        }
        var G = u(O), se = o(G);
        Al(se, () => a(q).status);
        var ue = u(G), fe = o(ue), _e = u(ue), pe = o(_e);
        s(pe, () => a(q).created_at);
        var be = u(_e), p = o(be);
        s(p, () => a(q).finished_at.Time, () => a(q).finished_at.Valid);
        var x = u(be), Y = o(x);
        {
          var ae = (me) => {
            const Ee = /* @__PURE__ */ Ue(() => d(a(q)));
            var tt = $l(), ft = o(tt), rs = o(ft), kt = u(ft, 2);
            Se(kt, 21, () => a(Ee).dependencies, Fe, (ht, St) => {
              r(ht, () => a(St).id, () => a(St).condition);
            }), V((ht) => D(rs, ht), [() => (a(Ee).strategy || "all").toUpperCase()]), T(me, tt);
          }, ye = /* @__PURE__ */ Ue(() => d(a(q))), De = (me) => {
            var Ee = Ut("-");
            T(me, Ee);
          };
          de(Y, (me) => {
            a(ye) ? me(ae) : me(De, !1);
          });
        }
        var Ne = u(x), dt = o(Ne);
        {
          var Be = (me) => {
            var Ee = Nl(), tt = o(Ee);
            V(() => {
              Ae(Ee, "title", a(q).error_message.String), D(tt, a(q).error_message.String);
            }), T(me, Ee);
          };
          de(dt, (me) => {
            a(q).error_message?.Valid && me(Be);
          });
        }
        V(() => {
          Ae(ve, "id", `job-${a(q).id ?? ""}`), he = Ie(ve, 1, "svelte-1r6codn", null, he, { highlighted: a(c) === a(q).id }), D(Z, a(q).id), D(ee, a(q).job_type_name), D(fe, a(q).retry_count);
        }), T(Q, ve);
      }), T(P, w);
    };
    de(F, (P) => {
      oe.loading && a(n).length === 0 ? P(M) : P(R, !1);
    });
  }
  V(
    (P) => {
      D(C, `ジョブ一覧 (${a(i) ?? ""})`), H.disabled = a(l) === 0 || oe.loading, D(K, `${a(l) + 1} - ${P ?? ""} / ${a(i) ?? ""}`), z.disabled = a(l) + v >= a(i) || oe.loading;
    },
    [() => Math.min(a(l) + v, a(i))]
  ), W("click", H, S), W("click", z, y), W("click", ce, g), T(e, h), nt();
}
ss(["click"]);
var Yl = /* @__PURE__ */ I('<div class="empty svelte-wpgtu6">No Signature</div>'), zl = /* @__PURE__ */ I("<div></div>"), jl = /* @__PURE__ */ I('<div class="row svelte-wpgtu6"></div>'), Ul = /* @__PURE__ */ I('<div class="chroma-section svelte-wpgtu6"></div>'), Jl = /* @__PURE__ */ I('<div class="chroma-sections svelte-wpgtu6"></div>'), Vl = /* @__PURE__ */ I('<div class="color-bitmask svelte-wpgtu6"><!></div>');
function cr(e, t) {
  at(t, !0);
  let s = Wa(t, "size", 3, 64), r = /* @__PURE__ */ Ue(() => {
    if (!t.sig) return new Array(64).fill(!1);
    try {
      const f = atob(t.sig), m = new Uint8Array(f.length);
      for (let y = 0; y < f.length; y++)
        m[y] = f.charCodeAt(y);
      const g = [];
      for (let y = 0; y < 8; y++) {
        const S = m[y];
        for (let b = 7; b >= 0; b--)
          g.push((S >> b & 1) === 1);
      }
      return g.reverse();
    } catch (f) {
      return console.error("Failed to decode sig:", f), new Array(64).fill(!1);
    }
  });
  function n(f) {
    const m = f >> 5 & 1, g = f >> 4 & 1, y = f >> 3 & 1, S = f >> 2 & 1, b = f >> 1 & 1, h = f & 1, _ = g << 1 | S, A = m << 2 | y << 1 | b, C = h, $ = [25, 45, 65, 85][_], H = C === 0 ? 0.01 : 0.15, J = A * 45;
    return `oklch(${$}% ${H} ${J})`;
  }
  function i(f, m, g) {
    const y = f >> 1 & 1, S = f & 1, b = m >> 2 & 1, h = m >> 1 & 1, _ = m & 1, A = g & 1;
    return b << 5 | y << 4 | h << 3 | S << 2 | _ << 1 | A;
  }
  var l = Vl(), v = o(l);
  {
    var c = (f) => {
      var m = Yl();
      T(f, m);
    }, d = (f) => {
      var m = Jl();
      Se(m, 20, () => [1, 0], Fe, (g, y) => {
        var S = Ul();
        Se(S, 20, () => [3, 2, 1, 0], Fe, (b, h) => {
          var _ = jl();
          Se(_, 20, () => [0, 1, 2, 3, 4, 5, 6, 7], Fe, (A, C) => {
            const $ = /* @__PURE__ */ Ue(() => i(h, C, y));
            var H = zl();
            let J;
            V(
              (K) => {
                J = Ie(H, 1, "bit svelte-wpgtu6", null, J, { active: a(r)[a($)] }), _s(H, `background-color: ${K ?? ""}`), Ae(H, "title", `L=${h ?? ""} H=${C * 45} C=${y ?? ""}`);
              },
              [() => n(a($))]
            ), T(A, H);
          }), T(b, _);
        }), V(() => Ae(S, "title", y === 1 ? "Vivid Colors" : "Muted Colors")), T(g, S);
      }), T(f, m);
    };
    de(v, (f) => {
      t.sig ? f(d, !1) : f(c);
    });
  }
  V(() => _s(l, `--size: ${s() ?? ""}px`)), T(e, l), nt();
}
var Kl = /* @__PURE__ */ I('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), Xl = /* @__PURE__ */ I('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class A Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), Gl = /* @__PURE__ */ I('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), Wl = /* @__PURE__ */ I('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class B Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), Zl = /* @__PURE__ */ I('<div class="stat-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">Storage (Free: 10GB)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976"> </div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class A (Free: 1M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class B (Free: 10M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div>', 1), Ql = /* @__PURE__ */ I('<div class="stat-card error-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">R2 Status</div> <div class="stat-value svelte-1w9i976" style="font-size: 0.9rem; color: #d32f2f;"> </div></div>'), eo = /* @__PURE__ */ I('<div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div>', 1), to = /* @__PURE__ */ I('<div class="r2-stats svelte-1w9i976"><!></div>');
function so(e, t) {
  at(t, !0);
  let s = /* @__PURE__ */ B(null), r = /* @__PURE__ */ B(null);
  async function n() {
    try {
      k(s, await oe.get("/admin/api/r2/usage"), !0);
    } catch (_) {
      console.error("Failed to fetch R2 usage:", _), k(r, "Failed to load R2 usage data");
    }
  }
  xt(n);
  function i(_) {
    if (_ === 0) return "0 B";
    const A = 1024, C = ["B", "KB", "MB", "GB", "TB"], $ = Math.floor(Math.log(_) / Math.log(A));
    return parseFloat((_ / Math.pow(A, $)).toFixed(2)) + " " + C[$];
  }
  const l = [
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
  ], v = [
    "HeadObject",
    "GetObject",
    "HeadBucket",
    "GetBucketEncryption",
    "GetBucketLocation",
    "GetBucketPolicy"
  ], c = /* @__PURE__ */ Ue(() => a(s) ? (a(s).operations || []).filter((_) => l.includes(_.action_type)).reduce((_, A) => _ + A.requests, 0) : 0), d = /* @__PURE__ */ Ue(() => a(s) ? (a(s).operations || []).filter((_) => v.includes(_.action_type)).reduce((_, A) => _ + A.requests, 0) : 0), f = /* @__PURE__ */ Ue(() => a(s) ? (a(s).operations || []).filter((_) => l.includes(_.action_type)).sort((_, A) => A.requests - _.requests) : []), m = /* @__PURE__ */ Ue(() => a(s) ? (a(s).operations || []).filter((_) => v.includes(_.action_type)).sort((_, A) => A.requests - _.requests) : []);
  var g = to(), y = o(g);
  {
    var S = (_) => {
      var A = Zl(), C = Vt(A), $ = u(o(C), 2), H = o($), J = u($, 2), K = o(J), z = u(J, 2), ce = o(z), F = u(C, 2), M = u(o(F), 2), R = o(M), P = u(M, 4), w = o(P), j = u(P, 2);
      {
        var Q = (U) => {
          var ee = Xl(), te = u(o(ee), 2);
          Se(te, 21, () => a(f), Fe, (le, G) => {
            var se = Kl(), ue = o(se), fe = o(ue), _e = u(ue, 2), pe = o(_e);
            V(
              (be) => {
                D(fe, a(G).action_type), D(pe, be);
              },
              [() => (a(G).requests ?? 0).toLocaleString()]
            ), T(le, se);
          }), T(U, ee);
        };
        de(j, (U) => {
          a(f).length > 0 && U(Q);
        });
      }
      var q = u(F, 2), ve = u(o(q), 2), he = o(ve), N = u(ve, 4), Z = o(N), O = u(N, 2);
      {
        var L = (U) => {
          var ee = Wl(), te = u(o(ee), 2);
          Se(te, 21, () => a(m), Fe, (le, G) => {
            var se = Gl(), ue = o(se), fe = o(ue), _e = u(ue, 2), pe = o(_e);
            V(
              (be) => {
                D(fe, a(G).action_type), D(pe, be);
              },
              [() => (a(G).requests ?? 0).toLocaleString()]
            ), T(le, se);
          }), T(U, ee);
        };
        de(O, (U) => {
          a(m).length > 0 && U(L);
        });
      }
      V(
        (U, ee, te, le, G, se, ue) => {
          D(H, U), D(K, `${ee ?? ""} objects`), _s(ce, `width: ${te ?? ""}%`), D(R, le), _s(w, `width: ${G ?? ""}%`), D(he, se), _s(Z, `width: ${ue ?? ""}%`);
        },
        [
          () => i(a(s).storage_usage_bytes ?? 0),
          () => (a(s).object_count ?? 0).toLocaleString(),
          () => Math.min(100, (a(s).storage_usage_bytes ?? 0) / 10737418240 * 100),
          () => (a(c) ?? 0).toLocaleString(),
          () => Math.min(100, (a(c) ?? 0) / 1e6 * 100),
          () => (a(d) ?? 0).toLocaleString(),
          () => Math.min(100, (a(d) ?? 0) / 1e7 * 100)
        ]
      ), T(_, A);
    }, b = (_) => {
      var A = Ql(), C = u(o(A), 2), $ = o(C);
      V(() => D($, a(r))), T(_, A);
    }, h = (_) => {
      var A = eo();
      T(_, A);
    };
    de(y, (_) => {
      a(s) ? _(S) : a(r) ? _(b, 1) : _(h, !1);
    });
  }
  T(e, g), nt();
}
var ro = /* @__PURE__ */ I('<div class="loading svelte-xxb0sp">読み込み中...</div>'), ao = /* @__PURE__ */ I('<button class="indexed-icon svelte-xxb0sp" title="類似画像を検索">🔍</button>'), no = /* @__PURE__ */ I('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/> <!></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), io = /* @__PURE__ */ I('<div class="overlay svelte-xxb0sp"><div class="loading-spinner svelte-xxb0sp"></div></div>'), lo = /* @__PURE__ */ I('<div class="grid-container svelte-xxb0sp"><div></div> <!></div>'), oo = /* @__PURE__ */ I('<div class="selected-compare svelte-xxb0sp"><div class="image-item target svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="svelte-xxb0sp">Selected Image</div></div></div> <div class="arrow svelte-xxb0sp">→</div></div>'), co = /* @__PURE__ */ I('<div class="loading svelte-xxb0sp">検索中...</div>'), vo = /* @__PURE__ */ I('<p class="svelte-xxb0sp">類似画像は見つかりませんでした。</p>'), uo = /* @__PURE__ */ I('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), fo = /* @__PURE__ */ I("<div></div>"), ho = /* @__PURE__ */ I('<div class="image-list svelte-xxb0sp"><div class="header svelte-xxb0sp"><div class="title-area svelte-xxb0sp"><h2 class="svelte-xxb0sp"> </h2> <a href="https://dash.cloudflare.com/d52dc19d3368d36eecf4b48d5eb2dd44/r2/default/buckets/lowreal" target="_blank" rel="noopener noreferrer" class="r2-link svelte-xxb0sp">R2 Dashboard ↗</a></div> <div class="pagination svelte-xxb0sp"><button class="svelte-xxb0sp">前へ</button> <span class="svelte-xxb0sp"> </span> <button class="svelte-xxb0sp">次へ</button></div></div> <!> <!></div> <dialog id="similarDialog" class="svelte-xxb0sp"><div class="dialog-header svelte-xxb0sp"><h3 class="svelte-xxb0sp">類似画像一覧</h3> <button type="button" class="close-btn svelte-xxb0sp">×</button></div> <div class="dialog-content svelte-xxb0sp"><!> <!></div></dialog>', 1);
function _o(e, t) {
  at(t, !0);
  let s = /* @__PURE__ */ B(ke([])), r = /* @__PURE__ */ B(0), n = 20, i = /* @__PURE__ */ B(0), l = /* @__PURE__ */ B(ke([])), v = /* @__PURE__ */ B(null), c = /* @__PURE__ */ B(null);
  async function d() {
    try {
      const O = await oe.get(`/admin/api/images?limit=${n}&offset=${a(r)}`);
      k(s, O.images || [], !0), k(i, O.total || 0, !0);
    } catch (O) {
      console.error(O);
    }
  }
  async function f(O) {
    k(v, O, !0), k(l, [], !0), a(c).showModal();
    try {
      const L = await oe.get(`/admin/api/image/${O.id}/similar`);
      k(l, L.similar || [], !0);
    } catch (L) {
      console.error(L);
    }
  }
  xt(d);
  function m() {
    a(r) + n < a(i) && (k(r, a(r) + n), d());
  }
  function g() {
    a(r) - n >= 0 && (k(r, a(r) - n), d());
  }
  var y = ho(), S = Vt(y), b = o(S), h = o(b), _ = o(h), A = o(_), C = u(h, 2), $ = o(C), H = u($, 2), J = o(H), K = u(H, 2), z = u(b, 2);
  so(z, {});
  var ce = u(z, 2);
  {
    var F = (O) => {
      var L = ro();
      T(O, L);
    }, M = (O) => {
      var L = lo(), U = o(L);
      let ee;
      Se(U, 21, () => a(s), (G) => G.id, (G, se) => {
        var ue = no(), fe = o(ue), _e = o(fe), pe = u(_e, 2);
        {
          var be = (Be) => {
            var me = ao();
            W("click", me, () => f(a(se))), T(Be, me);
          };
          de(pe, (Be) => {
            a(se).sig?.length > 0 && Be(be);
          });
        }
        var p = u(fe, 2), x = o(p);
        cr(x, {
          get sig() {
            return a(se).sig;
          }
        });
        var Y = u(x, 2), ae = o(Y), ye = u(o(ae)), De = o(ye), Ne = u(Y, 2), dt = o(Ne);
        V(() => {
          Ae(_e, "src", a(se).uri), Ae(ae, "href", `/admin/edit?id=${a(se).entry_id ?? ""}`), D(De, a(se).entry_id), D(dt, `ID: ${a(se).id ?? ""}`);
        }), T(G, ue);
      });
      var te = u(U, 2);
      {
        var le = (G) => {
          var se = io();
          T(G, se);
        };
        de(te, (G) => {
          oe.loading && G(le);
        });
      }
      V(() => ee = Ie(U, 1, "grid svelte-xxb0sp", null, ee, { "is-loading": oe.loading })), T(O, L);
    };
    de(ce, (O) => {
      oe.loading && a(s).length === 0 ? O(F) : O(M, !1);
    });
  }
  var R = u(S, 2), P = o(R), w = u(o(P), 2), j = u(P, 2), Q = o(j);
  {
    var q = (O) => {
      var L = oo(), U = o(L), ee = o(U), te = o(ee), le = u(ee, 2), G = o(le);
      cr(G, {
        get sig() {
          return a(v).sig;
        }
      }), V(() => Ae(te, "src", a(v).uri)), T(O, L);
    };
    de(Q, (O) => {
      a(v) && O(q);
    });
  }
  var ve = u(Q, 2);
  {
    var he = (O) => {
      var L = co();
      T(O, L);
    }, N = (O) => {
      var L = vo();
      T(O, L);
    }, Z = (O) => {
      var L = fo();
      let U;
      Se(L, 21, () => a(l), (ee) => ee.id, (ee, te) => {
        var le = uo(), G = o(le), se = o(G), ue = u(G, 2), fe = o(ue);
        cr(fe, {
          get sig() {
            return a(te).sig;
          }
        });
        var _e = u(fe, 2), pe = o(_e), be = u(o(pe)), p = o(be), x = u(_e, 2), Y = o(x);
        V(() => {
          Ae(se, "src", a(te).uri), Ae(pe, "href", `/admin/edit?id=${a(te).entry_id ?? ""}`), D(p, a(te).entry_id), D(Y, `ID: ${a(te).id ?? ""} / Score: ${a(te).score ?? ""}`);
        }), W("click", pe, () => a(c).close()), T(ee, le);
      }), V(() => U = Ie(L, 1, "grid similar-grid svelte-xxb0sp", null, U, { "is-loading": oe.loading })), T(O, L);
    };
    de(ve, (O) => {
      oe.loading && a(l).length === 0 ? O(he) : a(l).length === 0 ? O(N, 1) : O(Z, !1);
    });
  }
  st(R, (O) => k(c, O), () => a(c)), V(
    (O) => {
      D(A, `画像一覧 (${a(i) ?? ""})`), $.disabled = a(r) === 0, D(J, `${a(r) + 1} - ${O ?? ""} / ${a(i) ?? ""}`), K.disabled = a(r) + n >= a(i);
    },
    [() => Math.min(a(r) + n, a(i))]
  ), W("click", $, g), W("click", K, m), W("click", w, () => a(c).close()), T(e, y), nt();
}
ss(["click"]);
var po = /* @__PURE__ */ I('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), mo = /* @__PURE__ */ I('<span class="term-badge svelte-6rw159"> </span>'), go = /* @__PURE__ */ I('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">TF-IDF 統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総語彙数 (Terms)</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">インデックス済みエントリ</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">関連エントリ計算済み</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">総関連ペア数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">平均類似度スコア</th><td class="svelte-6rw159"> </td></tr></tbody></table></div> <div style="margin-top: 10px;" class="svelte-6rw159"><h4 class="svelte-6rw159">頻出単語 (Top 20 DF)</h4> <div class="top-terms svelte-6rw159"></div></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">画像統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総画像数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">未インデックス画像数</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), bo = /* @__PURE__ */ I('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function yo(e, t) {
  at(t, !0);
  let s = /* @__PURE__ */ B(null);
  async function r() {
    try {
      k(s, await oe.get("/admin/api/info"), !0);
    } catch (d) {
      console.error(d);
    }
  }
  xt(r);
  function n(d) {
    if (d === 0) return "0 B";
    const f = 1024, m = ["B", "KB", "MB", "GB", "TB"], g = Math.floor(Math.log(d) / Math.log(f));
    return parseFloat((d / Math.pow(f, g)).toFixed(2)) + " " + m[g];
  }
  var i = bo(), l = u(o(i), 2);
  {
    var v = (d) => {
      var f = po();
      T(d, f);
    }, c = (d) => {
      var f = go(), m = o(f), g = u(o(m), 2), y = o(g), S = o(y), b = o(S), h = u(o(b)), _ = o(h), A = u(b), C = u(o(A)), $ = o(C), H = u(A), J = u(o(H)), K = o(J), z = u(H), ce = u(o(z)), F = o(ce), M = u(z), R = u(o(M)), P = o(R), w = u(g, 2), j = u(o(w), 2);
      Se(j, 21, () => a(s).tfidf_stats?.top_terms ?? [], Fe, (Yt, it) => {
        var Mt = mo(), is = o(Mt);
        V(() => {
          Ae(Mt, "title", `DF: ${a(it).df ?? ""}`), D(is, a(it).term);
        }), T(Yt, Mt);
      });
      var Q = u(m, 2), q = u(o(Q), 2), ve = o(q), he = o(ve), N = o(he), Z = u(o(N)), O = o(Z), L = u(N), U = u(o(L)), ee = o(U), te = u(Q, 2), le = u(o(te), 2), G = o(le), se = o(G), ue = o(se), fe = u(o(ue)), _e = o(fe), pe = u(ue), be = u(o(pe)), p = o(be), x = o(p), Y = u(te, 2), ae = u(o(Y), 2), ye = o(ae), De = o(ye), Ne = o(De), dt = u(o(Ne)), Be = o(dt), me = u(Ne), Ee = u(o(me)), tt = o(Ee), ft = u(me), rs = u(o(ft)), kt = o(rs), ht = u(ft), St = u(o(ht)), Ks = o(St), xs = u(ht), ks = u(o(xs)), Ss = o(ks), qt = u(xs), Ms = u(o(qt)), Ds = o(Ms), Bt = u(qt), Es = u(o(Bt)), Ts = o(Es), as = u(Bt), As = u(o(as)), Xs = o(As), ns = u(Y, 2), Ps = u(o(ns), 2), Gs = o(Ps);
      V(
        (Yt, it, Mt, is, Ws, Zs) => {
          D(_, a(s).tfidf_stats?.total_terms ?? 0), D($, a(s).tfidf_stats?.indexed_entries ?? 0), D(K, a(s).tfidf_stats?.entries_with_related ?? 0), D(F, a(s).tfidf_stats?.total_related_pairs ?? 0), D(P, Yt), D(O, a(s).image_stats?.total_images ?? 0), D(ee, a(s).image_stats?.unindexed_images ?? 0), D(_e, a(s).is_development), D(x, a(s).app_hash), D(Be, a(s).debug_info.go_version), D(tt, a(s).debug_info.num_goroutine), D(kt, it), D(Ks, a(s).debug_info.uptime), D(Ss, Mt), D(Ds, is), D(Ts, Ws), D(Xs, a(s).debug_info.num_gc), D(Gs, Zs);
        },
        [
          () => a(s).tfidf_stats?.avg_score?.toFixed(4) ?? "0.0000",
          () => new Date(a(s).debug_info.start_time).toLocaleString(),
          () => n(a(s).debug_info.mem_alloc),
          () => n(a(s).debug_info.mem_total_alloc),
          () => n(a(s).debug_info.mem_sys),
          () => JSON.stringify(a(s).config, null, 2)
        ]
      ), T(d, f);
    };
    de(l, (d) => {
      oe.loading && !a(s) ? d(v) : a(s) && d(c, 1);
    });
  }
  T(e, i), nt();
}
var wo = /* @__PURE__ */ I('<div class="stats-grid svelte-1y3ri9y"><div class="stat-card svelte-1y3ri9y"><div class="label svelte-1y3ri9y">キャッシュ数</div> <div class="value svelte-1y3ri9y"> </div></div> <div class="stat-card svelte-1y3ri9y"><div class="label svelte-1y3ri9y">合計サイズ</div> <div class="value svelte-1y3ri9y"> </div></div> <div class="stat-card svelte-1y3ri9y"><div class="label svelte-1y3ri9y">最古</div> <div class="value date svelte-1y3ri9y"> </div></div> <div class="stat-card svelte-1y3ri9y"><div class="label svelte-1y3ri9y">最新</div> <div class="value date svelte-1y3ri9y"> </div></div></div>'), xo = /* @__PURE__ */ I('<tr><td class="svelte-1y3ri9y"><code class="svelte-1y3ri9y"> </code></td><td class="svelte-1y3ri9y"><code class="svelte-1y3ri9y"> </code></td></tr>'), ko = /* @__PURE__ */ I('<section class="metadata-section svelte-1y3ri9y"><h3>メタデータ</h3> <div class="table-container svelte-1y3ri9y"><table class="svelte-1y3ri9y"><thead><tr><th class="svelte-1y3ri9y">Key</th><th class="svelte-1y3ri9y">Value</th></tr></thead><tbody></tbody></table></div></section>'), So = /* @__PURE__ */ I('<tr><td class="cache-key svelte-1y3ri9y"><code class="svelte-1y3ri9y"> </code></td><td class="svelte-1y3ri9y"> </td><td class="svelte-1y3ri9y"><small> </small></td><td class="svelte-1y3ri9y"> </td><td class="svelte-1y3ri9y"><button class="delete-button svelte-1y3ri9y">削除</button></td></tr>'), Mo = /* @__PURE__ */ I('<div class="cache-list-page svelte-1y3ri9y"><div class="header svelte-1y3ri9y"><h2>ページキャッシュ管理</h2> <div class="actions"><button class="purge-button svelte-1y3ri9y">全キャッシュ削除</button></div></div> <!> <!> <div class="table-container svelte-1y3ri9y"><table class="svelte-1y3ri9y"><thead><tr><th> </th><th> </th><th class="svelte-1y3ri9y">Type</th><th> </th><th class="svelte-1y3ri9y">Actions</th></tr></thead><tbody></tbody></table></div></div>');
function Do(e, t) {
  at(t, !0);
  let s = /* @__PURE__ */ B(null), r = /* @__PURE__ */ B(ke([])), n = /* @__PURE__ */ B(ke([])), i = /* @__PURE__ */ B("created_at"), l = /* @__PURE__ */ B("desc");
  async function v() {
    try {
      const N = await oe.get("/admin/api/cache/stats");
      k(s, N.stats, !0), k(r, N.metadata, !0);
    } catch (N) {
      console.error(N);
    }
  }
  async function c() {
    try {
      const N = await oe.get("/admin/api/cache/list");
      k(n, N.entries, !0);
    } catch (N) {
      console.error(N);
    }
  }
  xt(() => {
    v(), c();
  });
  async function d() {
    if (confirm("全てのキャッシュを削除しますか？"))
      try {
        await oe.post("/admin/api/cache/purge", void 0), await v(), await c();
      } catch (N) {
        console.error(N);
      }
  }
  async function f(N) {
    try {
      await oe.post(`/admin/api/cache/purge?key=${encodeURIComponent(N)}`, void 0), await v(), await c();
    } catch (Z) {
      console.error(Z);
    }
  }
  function m(N) {
    if (N === 0) return "0 B";
    const Z = 1024, O = ["B", "KB", "MB", "GB", "TB"], L = Math.floor(Math.log(N) / Math.log(Z));
    return parseFloat((N / Math.pow(Z, L)).toFixed(2)) + " " + O[L];
  }
  const g = /* @__PURE__ */ Ue(() => [...a(n)].sort((N, Z) => {
    let O, L;
    return a(i) === "key" ? (O = N.cache_key, L = Z.cache_key) : a(i) === "size" ? (O = N.size?.Int64 ?? 0, L = Z.size?.Int64 ?? 0) : (O = new Date(N.created_at).getTime(), L = new Date(Z.created_at).getTime()), O < L ? a(l) === "asc" ? -1 : 1 : O > L ? a(l) === "asc" ? 1 : -1 : 0;
  }));
  function y(N) {
    a(i) === N ? k(l, a(l) === "asc" ? "desc" : "asc", !0) : (k(i, N, !0), k(l, "desc"));
  }
  var S = Mo(), b = o(S), h = u(o(b), 2), _ = o(h), A = u(b, 2);
  {
    var C = (N) => {
      var Z = wo(), O = o(Z), L = u(o(O), 2), U = o(L), ee = u(O, 2), te = u(o(ee), 2), le = o(te), G = u(ee, 2), se = u(o(G), 2), ue = o(se), fe = u(G, 2), _e = u(o(fe), 2), pe = o(_e);
      V(
        (be, p, x) => {
          D(U, a(s).total_count), D(le, be), D(ue, p), D(pe, x);
        },
        [
          () => m(Number(a(s).total_size)),
          () => a(s).oldest_at ? new Date(String(a(s).oldest_at)).toLocaleString() : "-",
          () => a(s).newest_at ? new Date(String(a(s).newest_at)).toLocaleString() : "-"
        ]
      ), T(N, Z);
    };
    de(A, (N) => {
      a(s) && N(C);
    });
  }
  var $ = u(A, 2);
  {
    var H = (N) => {
      var Z = ko(), O = u(o(Z), 2), L = o(O), U = u(o(L));
      Se(U, 21, () => a(r), Fe, (ee, te) => {
        var le = xo(), G = o(le), se = o(G), ue = o(se), fe = u(G), _e = o(fe), pe = o(_e);
        V(() => {
          D(ue, a(te).key), D(pe, a(te).value);
        }), T(ee, le);
      }), T(N, Z);
    };
    de($, (N) => {
      a(r).length > 0 && N(H);
    });
  }
  var J = u($, 2), K = o(J), z = o(K), ce = o(z), F = o(ce);
  let M;
  var R = o(F), P = u(F);
  let w;
  var j = o(P), Q = u(P, 2);
  let q;
  var ve = o(Q), he = u(z);
  Se(he, 21, () => a(g), Fe, (N, Z) => {
    var O = So(), L = o(O), U = o(L), ee = o(U), te = u(L), le = o(te), G = u(te), se = o(G), ue = o(se), fe = u(G), _e = o(fe), pe = u(fe), be = o(pe);
    V(
      (p, x) => {
        D(ee, a(Z).cache_key), D(le, p), D(ue, a(Z).content_type), D(_e, x);
      },
      [
        () => m(a(Z).size?.Int64 ?? 0),
        () => new Date(a(Z).created_at).toLocaleString()
      ]
    ), W("click", be, () => f(a(Z).cache_key)), T(N, O);
  }), V(() => {
    M = Ie(F, 1, "sortable svelte-1y3ri9y", null, M, { active: a(i) === "key" }), D(R, `Key ${a(i) === "key" ? a(l) === "asc" ? "↑" : "↓" : ""}`), w = Ie(P, 1, "sortable svelte-1y3ri9y", null, w, { active: a(i) === "size" }), D(j, `Size ${a(i) === "size" ? a(l) === "asc" ? "↑" : "↓" : ""}`), q = Ie(Q, 1, "sortable svelte-1y3ri9y", null, q, { active: a(i) === "created_at" }), D(ve, `Created At ${a(i) === "created_at" ? a(l) === "asc" ? "↑" : "↓" : ""}`);
  }), W("click", _, d), W("click", F, () => y("key")), W("click", P, () => y("size")), W("click", Q, () => y("created_at")), T(e, S), nt();
}
ss(["click"]);
var Eo = /* @__PURE__ */ I("<a> </a>"), To = /* @__PURE__ */ I('<div class="admin-app svelte-1n46o8q"><header><div class="header-left svelte-1n46o8q"><h1 class="svelte-1n46o8q"><a href="/admin/" class="svelte-1n46o8q"><img src="/images/hanrangen-icon.svg" alt="Hanrangon" class="logo svelte-1n46o8q"/></a></h1> <div class="ci-badge svelte-1n46o8q"><a href="https://github.com/cho45/Hanrangon/actions/workflows/ci.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/ci.yml?branch=main&amp;label=ci&amp;style=flat-square" alt="CI Status" class="svelte-1n46o8q"/></a> <a href="https://github.com/cho45/Hanrangon/actions/workflows/lint.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/lint.yml?branch=main&amp;label=lint&amp;style=flat-square" alt="Lint Status" class="svelte-1n46o8q"/></a></div></div> <nav class="main-nav svelte-1n46o8q"><ul class="svelte-1n46o8q"><li><a href="/" class="svelte-1n46o8q">サイト確認</a></li> <li><a href="/logout" class="svelte-1n46o8q">ログアウト</a></li></ul></nav></header> <nav></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function Ao(e, t) {
  at(t, !0);
  let s = /* @__PURE__ */ B(ke(window.location.pathname)), r = /* @__PURE__ */ B(ke(new URLSearchParams(window.location.search)));
  xt(() => {
    const h = () => {
      k(s, window.location.pathname, !0), k(r, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", h), () => window.removeEventListener("popstate", h);
  });
  function n(h, _) {
    _ && _.preventDefault(), window.history.pushState({}, "", h), k(s, window.location.pathname, !0), k(r, new URLSearchParams(window.location.search), !0);
  }
  const i = {
    "/admin/edit": {
      component: Tl,
      page: "edit",
      getProps: (h) => ({ id: h, onSave: (_) => window.location.href = _ })
    },
    "/admin/jobs": { component: Bl, page: "jobs", getProps: () => ({}) },
    "/admin/images": { component: _o, page: "images", getProps: () => ({}) },
    "/admin/info": { component: yo, page: "info", getProps: () => ({}) },
    "/admin/cache": { component: Do, page: "cache", getProps: () => ({}) },
    "/admin/": {
      component: ul,
      page: "list",
      getProps: () => ({ onEdit: (h) => n(`/admin/edit?id=${h}`) })
    }
  }, l = [
    { label: "エントリ一覧", path: "/admin/", page: "list" },
    {
      label: "新規作成",
      path: "/admin/edit",
      page: "edit",
      exact: !0
    },
    { label: "画像一覧", path: "/admin/images", page: "images" },
    { label: "ジョブ一覧", path: "/admin/jobs", page: "jobs" },
    { label: "キャッシュ", path: "/admin/cache", page: "cache" },
    { label: "情報", path: "/admin/info", page: "info" }
  ], v = /* @__PURE__ */ Ue(() => {
    const h = a(r).get("id"), _ = i[a(s)] ?? i["/admin/"];
    return {
      ..._,
      props: _.getProps(h),
      isActive: (A) => !(A.page !== _.page || A.exact && h)
    };
  }), c = /* @__PURE__ */ Ue(() => window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  var d = To(), f = o(d);
  let m;
  var g = u(f, 2);
  let y;
  Se(g, 21, () => l, Fe, (h, _) => {
    var A = Eo();
    let C;
    var $ = o(A);
    V(
      (H) => {
        Ae(A, "href", a(_).path), C = Ie(A, 1, "svelte-1n46o8q", null, C, H), D($, a(_).label);
      },
      [() => ({ active: a(v).isActive(a(_)) })]
    ), W("click", A, (H) => n(a(_).path, H)), T(h, A);
  });
  var S = u(g, 2), b = o(S);
  qi(b, () => a(v).component, (h, _) => {
    _(h, Wi(() => a(v).props));
  }), V(() => {
    m = Ie(f, 1, "svelte-1n46o8q", null, m, { "is-localhost": a(c) }), y = Ie(g, 1, "sub-nav svelte-1n46o8q", null, y, { "is-localhost": a(c) });
  }), T(e, d), nt();
}
ss(["click"]);
const vr = document.getElementById("admin-root");
vr && (vr.innerHTML = "", Ri(Ao, { target: vr }));
"serviceWorker" in navigator && window.addEventListener("load", () => {
  navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" }).then((e) => {
    e.update();
  });
});
//# sourceMappingURL=admin-front.js.map
