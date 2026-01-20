var kr = Array.isArray, gn = Array.prototype.indexOf, js = Array.from, mn = Object.defineProperty, Dt = Object.getOwnPropertyDescriptor, bn = Object.getOwnPropertyDescriptors, yn = Object.prototype, wn = Array.prototype, ia = Object.getPrototypeOf, Ur = Object.isExtensible;
function ds(e) {
  return typeof e == "function";
}
const Vt = () => {
};
function xn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function la() {
  var e, t, s = new Promise((r, n) => {
    e = r, t = n;
  });
  return { promise: s, resolve: e, reject: t };
}
function oa(e, t, s = !1) {
  return e === void 0 ? s ? (
    /** @type {() => V} */
    t()
  ) : (
    /** @type {V} */
    t
  ) : e;
}
const Ee = 2, qs = 4, Us = 8, va = 1 << 24, ut = 16, dt = 32, $t = 64, Sr = 128, Je = 512, Fe = 1024, Ne = 2048, ft = 4096, qe = 8192, mt = 16384, Mr = 32768, Pt = 65536, Jr = 1 << 17, ca = 1 << 18, Zt = 1 << 19, kn = 1 << 20, lt = 1 << 25, It = 32768, mr = 1 << 21, Dr = 1 << 22, bt = 1 << 23, Et = /* @__PURE__ */ Symbol("$state"), Sn = /* @__PURE__ */ Symbol("legacy props"), Mn = /* @__PURE__ */ Symbol(""), Jt = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Dn(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function En() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Tn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function An() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Fn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Pn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function In() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Rn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function On() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function $n() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Cn = 1, Nn = 2, ua = 4, Ln = 8, Hn = 16, qn = 1, Bn = 2, Me = /* @__PURE__ */ Symbol(), Yn = "http://www.w3.org/1999/xhtml";
function zn() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function jn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function da(e) {
  return e === this.v;
}
function Un(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function fa(e) {
  return !Un(e, this.v);
}
let Be = null;
function Xt(e) {
  Be = e;
}
function tt(e, t = !1, s) {
  Be = {
    p: Be,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function st(e) {
  var t = (
    /** @type {ComponentContext} */
    Be
  ), s = t.e;
  if (s !== null) {
    t.e = null;
    for (var r of s)
      Ia(r);
  }
  return t.i = !0, Be = t.p, /** @type {T} */
  {};
}
function _a() {
  return !0;
}
let St = [];
function ha() {
  var e = St;
  St = [], xn(e);
}
function wt(e) {
  if (St.length === 0 && !gs) {
    var t = St;
    queueMicrotask(() => {
      t === St && ha();
    });
  }
  St.push(e);
}
function Jn() {
  for (; St.length > 0; )
    ha();
}
function pa(e) {
  var t = ce;
  if (t === null)
    return te.f |= bt, e;
  if ((t.f & Mr) === 0) {
    if ((t.f & Sr) === 0)
      throw e;
    t.b.error(e);
  } else
    Gt(e, t);
}
function Gt(e, t) {
  for (; t !== null; ) {
    if ((t.f & Sr) !== 0)
      try {
        t.b.error(e);
        return;
      } catch (s) {
        e = s;
      }
    t = t.parent;
  }
  throw e;
}
const Kn = -7169;
function ke(e, t) {
  e.f = e.f & Kn | t;
}
function Er(e) {
  (e.f & Je) !== 0 || e.deps === null ? ke(e, Fe) : ke(e, ft);
}
function ga(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Ee) === 0 || (t.f & It) === 0 || (t.f ^= It, ga(
        /** @type {Derived} */
        t.deps
      ));
}
function ma(e, t, s) {
  (e.f & Ne) !== 0 ? t.add(e) : (e.f & ft) !== 0 && s.add(e), ga(e.deps), ke(e, Fe);
}
const $s = /* @__PURE__ */ new Set();
let ne = null, ps = null, Ke = null, je = [], Js = null, br = !1, gs = !1;
class Qe {
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
  #e = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #r = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #t = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #n = 0;
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #i = null;
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #a = /* @__PURE__ */ new Set();
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
    je = [], ps = null, this.apply();
    var s = [], r = [];
    for (const n of t)
      this.#l(n, s, r);
    this.is_fork || this.#v(), this.is_deferred() ? (this.#o(r), this.#o(s)) : (ps = this, ne = null, Kr(r), Kr(s), ps = null, this.#i?.resolve()), Ke = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #l(t, s, r) {
    t.f ^= Fe;
    for (var n = t.first, i = null; n !== null; ) {
      var l = n.f, c = (l & (dt | $t)) !== 0, v = c && (l & Fe) !== 0, d = v || (l & qe) !== 0 || this.skipped_effects.has(n);
      if (!d && n.fn !== null) {
        c ? n.f ^= Fe : i !== null && (l & (qs | Us | va)) !== 0 ? i.b.defer_effect(n) : (l & qs) !== 0 ? s.push(n) : Ms(n) && ((l & ut) !== 0 && this.#a.add(n), xs(n));
        var _ = n.first;
        if (_ !== null) {
          n = _;
          continue;
        }
      }
      var b = n.parent;
      for (n = n.next; n === null && b !== null; )
        b === i && (i = null), n = b.next, b = b.parent;
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #o(t) {
    for (var s = 0; s < t.length; s += 1)
      ma(t[s], this.#a, this.#s);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, s) {
    s !== Me && !this.previous.has(t) && this.previous.set(t, s), (t.f & bt) === 0 && (this.current.set(t, t.v), Ke?.set(t, t.v));
  }
  activate() {
    ne = this, this.apply();
  }
  deactivate() {
    ne === this && (ne = null, Ke = null);
  }
  flush() {
    if (this.activate(), je.length > 0) {
      if (ba(), ne !== null && ne !== this)
        return;
    } else this.#t === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
  }
  #v() {
    if (this.#n === 0) {
      for (const t of this.#e) t();
      this.#e.clear();
    }
    this.#t === 0 && this.#c();
  }
  #c() {
    if ($s.size > 1) {
      this.previous.clear();
      var t = Ke, s = !0;
      for (const n of $s) {
        if (n === this) {
          s = !1;
          continue;
        }
        const i = [];
        for (const [c, v] of this.current) {
          if (n.current.has(c))
            if (s && v !== n.current.get(c))
              n.current.set(c, v);
            else
              continue;
          i.push(c);
        }
        if (i.length === 0)
          continue;
        const l = [...n.current.keys()].filter((c) => !this.current.has(c));
        if (l.length > 0) {
          var r = je;
          je = [];
          const c = /* @__PURE__ */ new Set(), v = /* @__PURE__ */ new Map();
          for (const d of i)
            ya(d, l, c, v);
          if (je.length > 0) {
            ne = n, n.apply();
            for (const d of je)
              n.#l(d, [], []);
            n.deactivate();
          }
          je = r;
        }
      }
      ne = null, Ke = t;
    }
    this.committed = !0, $s.delete(this);
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    this.#t += 1, t && (this.#n += 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    this.#t -= 1, t && (this.#n -= 1), this.revive();
  }
  revive() {
    for (const t of this.#a)
      this.#s.delete(t), ke(t, Ne), ct(t);
    for (const t of this.#s)
      ke(t, ft), ct(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    this.#e.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#r.add(t);
  }
  settled() {
    return (this.#i ??= la()).promise;
  }
  static ensure() {
    if (ne === null) {
      const t = ne = new Qe();
      $s.add(ne), gs || Qe.enqueue(() => {
        ne === t && t.flush();
      });
    }
    return ne;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    wt(t);
  }
  apply() {
  }
}
function Vn(e) {
  var t = gs;
  gs = !0;
  try {
    for (var s; ; ) {
      if (Jn(), je.length === 0 && (ne?.flush(), je.length === 0))
        return Js = null, /** @type {T} */
        s;
      ba();
    }
  } finally {
    gs = t;
  }
}
function ba() {
  var e = At;
  br = !0;
  var t = null;
  try {
    var s = 0;
    for (Ys(!0); je.length > 0; ) {
      var r = Qe.ensure();
      if (s++ > 1e3) {
        var n, i;
        Xn();
      }
      r.process(je), yt.clear();
    }
  } finally {
    br = !1, Ys(e), Js = null;
  }
}
function Xn() {
  try {
    Pn();
  } catch (e) {
    Gt(e, Js);
  }
}
let it = null;
function Kr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var s = 0; s < t; ) {
      var r = e[s++];
      if ((r.f & (mt | qe)) === 0 && Ms(r) && (it = /* @__PURE__ */ new Set(), xs(r), r.deps === null && r.first === null && r.nodes === null && (r.teardown === null && r.ac === null ? Na(r) : r.fn = null), it?.size > 0)) {
        yt.clear();
        for (const n of it) {
          if ((n.f & (mt | qe)) !== 0) continue;
          const i = [n];
          let l = n.parent;
          for (; l !== null; )
            it.has(l) && (it.delete(l), i.push(l)), l = l.parent;
          for (let c = i.length - 1; c >= 0; c--) {
            const v = i[c];
            (v.f & (mt | qe)) === 0 && xs(v);
          }
        }
        it.clear();
      }
    }
    it = null;
  }
}
function ya(e, t, s, r) {
  if (!s.has(e) && (s.add(e), e.reactions !== null))
    for (const n of e.reactions) {
      const i = n.f;
      (i & Ee) !== 0 ? ya(
        /** @type {Derived} */
        n,
        t,
        s,
        r
      ) : (i & (Dr | ut)) !== 0 && (i & Ne) === 0 && wa(n, t, r) && (ke(n, Ne), ct(
        /** @type {Effect} */
        n
      ));
    }
}
function wa(e, t, s) {
  const r = s.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const n of e.deps) {
      if (t.includes(n))
        return !0;
      if ((n.f & Ee) !== 0 && wa(
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
function ct(e) {
  for (var t = Js = e; t.parent !== null; ) {
    t = t.parent;
    var s = t.f;
    if (br && t === ce && (s & ut) !== 0 && (s & ca) === 0)
      return;
    if ((s & ($t | dt)) !== 0) {
      if ((s & Fe) === 0) return;
      t.f ^= Fe;
    }
  }
  je.push(t);
}
function Gn(e) {
  let t = 0, s = Rt(0), r;
  return () => {
    Ir() && (a(s), Xs(() => (t === 0 && (r = Ws(() => e(() => ms(s)))), t += 1, () => {
      wt(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ms(s));
      });
    })));
  };
}
var Wn = Pt | Zt | Sr;
function Zn(e, t, s) {
  new Qn(e, t, s);
}
class Qn {
  /** @type {Boundary | null} */
  parent;
  is_pending = !1;
  /** @type {TemplateNode} */
  #e;
  /** @type {TemplateNode | null} */
  #r = null;
  /** @type {BoundaryProps} */
  #t;
  /** @type {((anchor: Node) => void)} */
  #n;
  /** @type {Effect} */
  #i;
  /** @type {Effect | null} */
  #a = null;
  /** @type {Effect | null} */
  #s = null;
  /** @type {Effect | null} */
  #l = null;
  /** @type {DocumentFragment | null} */
  #o = null;
  /** @type {TemplateNode | null} */
  #v = null;
  #c = 0;
  #u = 0;
  #f = !1;
  /** @type {Set<Effect>} */
  #_ = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #h = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #d = null;
  #y = Gn(() => (this.#d = Rt(this.#c), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, s, r) {
    this.#e = t, this.#t = s, this.#n = r, this.parent = /** @type {Effect} */
    ce.b, this.is_pending = !!this.#t.pending, this.#i = Gs(() => {
      ce.b = this;
      {
        var n = this.#m();
        try {
          this.#a = Ue(() => r(n));
        } catch (i) {
          this.error(i);
        }
        this.#u > 0 ? this.#g() : this.is_pending = !1;
      }
      return () => {
        this.#v?.remove();
      };
    }, Wn);
  }
  #w() {
    try {
      this.#a = Ue(() => this.#n(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  #x() {
    const t = this.#t.pending;
    t && (this.#s = Ue(() => t(this.#e)), Qe.enqueue(() => {
      var s = this.#m();
      this.#a = this.#p(() => (Qe.ensure(), Ue(() => this.#n(s)))), this.#u > 0 ? this.#g() : (Tt(
        /** @type {Effect} */
        this.#s,
        () => {
          this.#s = null;
        }
      ), this.is_pending = !1);
    }));
  }
  #m() {
    var t = this.#e;
    return this.is_pending && (this.#v = ot(), this.#e.before(this.#v), t = this.#v), t;
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ma(t, this.#_, this.#h);
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
   * @param {() => Effect | null} fn
   */
  #p(t) {
    var s = ce, r = te, n = Be;
    et(this.#i), $e(this.#i), Xt(this.#i.ctx);
    try {
      return t();
    } catch (i) {
      return pa(i), null;
    } finally {
      et(s), $e(r), Xt(n);
    }
  }
  #g() {
    const t = (
      /** @type {(anchor: Node) => void} */
      this.#t.pending
    );
    this.#a !== null && (this.#o = document.createDocumentFragment(), this.#o.append(
      /** @type {TemplateNode} */
      this.#v
    ), qa(this.#a, this.#o)), this.#s === null && (this.#s = Ue(() => t(this.#e)));
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   */
  #b(t) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#b(t);
      return;
    }
    if (this.#u += t, this.#u === 0) {
      this.is_pending = !1;
      for (const s of this.#_)
        ke(s, Ne), ct(s);
      for (const s of this.#h)
        ke(s, ft), ct(s);
      this.#_.clear(), this.#h.clear(), this.#s && Tt(this.#s, () => {
        this.#s = null;
      }), this.#o && (this.#e.before(this.#o), this.#o = null);
    }
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    this.#b(t), this.#c += t, this.#d && Wt(this.#d, this.#c);
  }
  get_effect_pending() {
    return this.#y(), a(
      /** @type {Source<number>} */
      this.#d
    );
  }
  /** @param {unknown} error */
  error(t) {
    var s = this.#t.onerror;
    let r = this.#t.failed;
    if (this.#f || !s && !r)
      throw t;
    this.#a && (Ce(this.#a), this.#a = null), this.#s && (Ce(this.#s), this.#s = null), this.#l && (Ce(this.#l), this.#l = null);
    var n = !1, i = !1;
    const l = () => {
      if (n) {
        jn();
        return;
      }
      n = !0, i && $n(), Qe.ensure(), this.#c = 0, this.#l !== null && Tt(this.#l, () => {
        this.#l = null;
      }), this.is_pending = this.has_pending_snippet(), this.#a = this.#p(() => (this.#f = !1, Ue(() => this.#n(this.#e)))), this.#u > 0 ? this.#g() : this.is_pending = !1;
    };
    var c = te;
    try {
      $e(null), i = !0, s?.(t, l), i = !1;
    } catch (v) {
      Gt(v, this.#i && this.#i.parent);
    } finally {
      $e(c);
    }
    r && wt(() => {
      this.#l = this.#p(() => {
        Qe.ensure(), this.#f = !0;
        try {
          return Ue(() => {
            r(
              this.#e,
              () => t,
              () => l
            );
          });
        } catch (v) {
          return Gt(
            v,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        } finally {
          this.#f = !1;
        }
      });
    });
  }
}
function ei(e, t, s, r) {
  const n = Tr;
  if (s.length === 0 && e.length === 0) {
    r(t.map(n));
    return;
  }
  var i = ne, l = (
    /** @type {Effect} */
    ce
  ), c = ti();
  function v() {
    Promise.all(s.map((d) => /* @__PURE__ */ si(d))).then((d) => {
      c();
      try {
        r([...t.map(n), ...d]);
      } catch (_) {
        (l.f & mt) === 0 && Gt(_, l);
      }
      i?.deactivate(), Bs();
    }).catch((d) => {
      Gt(d, l);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    c();
    try {
      return v();
    } finally {
      i?.deactivate(), Bs();
    }
  }) : v();
}
function ti() {
  var e = ce, t = te, s = Be, r = ne;
  return function(i = !0) {
    et(e), $e(t), Xt(s), i && r?.activate();
  };
}
function Bs() {
  et(null), $e(null), Xt(null);
}
// @__NO_SIDE_EFFECTS__
function Tr(e) {
  var t = Ee | Ne, s = te !== null && (te.f & Ee) !== 0 ? (
    /** @type {Derived} */
    te
  ) : null;
  return ce !== null && (ce.f |= Zt), {
    ctx: Be,
    deps: null,
    effects: null,
    equals: da,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Me
    ),
    wv: 0,
    parent: s ?? ce,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function si(e, t, s) {
  let r = (
    /** @type {Effect | null} */
    ce
  );
  r === null && En();
  var n = (
    /** @type {Boundary} */
    r.b
  ), i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = Rt(
    /** @type {V} */
    Me
  ), c = !te, v = /* @__PURE__ */ new Map();
  return di(() => {
    var d = la();
    i = d.promise;
    try {
      Promise.resolve(e()).then(d.resolve, d.reject).then(() => {
        _ === ne && _.committed && _.deactivate(), Bs();
      });
    } catch (h) {
      d.reject(h), Bs();
    }
    var _ = (
      /** @type {Batch} */
      ne
    );
    if (c) {
      var b = n.is_rendered();
      n.update_pending_count(1), _.increment(b), v.get(_)?.reject(Jt), v.delete(_), v.set(_, d);
    }
    const g = (h, F = void 0) => {
      if (_.activate(), F)
        F !== Jt && (l.f |= bt, Wt(l, F));
      else {
        (l.f & bt) !== 0 && (l.f ^= bt), Wt(l, h);
        for (const [x, f] of v) {
          if (v.delete(x), x === _) break;
          f.reject(Jt);
        }
      }
      c && (n.update_pending_count(-1), _.decrement(b));
    };
    d.promise.then(g, (h) => g(null, h || "unknown"));
  }), Vs(() => {
    for (const d of v.values())
      d.reject(Jt);
  }), new Promise((d) => {
    function _(b) {
      function g() {
        b === i ? d(l) : _(i);
      }
      b.then(g, g);
    }
    _(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Xe(e) {
  const t = /* @__PURE__ */ Tr(e);
  return Ba(t), t;
}
// @__NO_SIDE_EFFECTS__
function Ar(e) {
  const t = /* @__PURE__ */ Tr(e);
  return t.equals = fa, t;
}
function xa(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var s = 0; s < t.length; s += 1)
      Ce(
        /** @type {Effect} */
        t[s]
      );
  }
}
function ri(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & Ee) === 0)
      return (t.f & mt) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Fr(e) {
  var t, s = ce;
  et(ri(e));
  try {
    e.f &= ~It, xa(e), t = Ua(e);
  } finally {
    et(s);
  }
  return t;
}
function ka(e) {
  var t = Fr(e);
  if (!e.equals(t) && (e.wv = za(), (!ne?.is_fork || e.deps === null) && (e.v = t, e.deps === null))) {
    ke(e, Fe);
    return;
  }
  Ot || (Ke !== null ? (Ir() || ne?.is_fork) && Ke.set(e, t) : Er(e));
}
let yr = /* @__PURE__ */ new Set();
const yt = /* @__PURE__ */ new Map();
let Sa = !1;
function Rt(e, t) {
  var s = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: da,
    rv: 0,
    wv: 0
  };
  return s;
}
// @__NO_SIDE_EFFECTS__
function B(e, t) {
  const s = Rt(e);
  return Ba(s), s;
}
// @__NO_SIDE_EFFECTS__
function ai(e, t = !1, s = !0) {
  const r = Rt(e);
  return t || (r.equals = fa), r;
}
function k(e, t, s = !1) {
  te !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Ge || (te.f & Jr) !== 0) && _a() && (te.f & (Ee | ut | Dr | Jr)) !== 0 && !vt?.includes(e) && On();
  let r = s ? we(t) : t;
  return Wt(e, r);
}
function Wt(e, t) {
  if (!e.equals(t)) {
    var s = e.v;
    Ot ? yt.set(e, t) : yt.set(e, s), e.v = t;
    var r = Qe.ensure();
    if (r.capture(e, s), (e.f & Ee) !== 0) {
      const n = (
        /** @type {Derived} */
        e
      );
      (e.f & Ne) !== 0 && Fr(n), Er(n);
    }
    e.wv = za(), Ma(e, Ne), ce !== null && (ce.f & Fe) !== 0 && (ce.f & (dt | $t)) === 0 && (ze === null ? _i([e]) : ze.push(e)), !r.is_fork && yr.size > 0 && !Sa && ni();
  }
  return t;
}
function ni() {
  Sa = !1;
  var e = At;
  Ys(!0);
  const t = Array.from(yr);
  try {
    for (const s of t)
      (s.f & Fe) !== 0 && ke(s, ft), Ms(s) && xs(s);
  } finally {
    Ys(e);
  }
  yr.clear();
}
function ms(e) {
  k(e, e.v + 1);
}
function Ma(e, t) {
  var s = e.reactions;
  if (s !== null)
    for (var r = s.length, n = 0; n < r; n++) {
      var i = s[n], l = i.f, c = (l & Ne) === 0;
      if (c && ke(i, t), (l & Ee) !== 0) {
        var v = (
          /** @type {Derived} */
          i
        );
        Ke?.delete(v), (l & It) === 0 && (l & Je && (i.f |= It), Ma(v, ft));
      } else c && ((l & ut) !== 0 && it !== null && it.add(
        /** @type {Effect} */
        i
      ), ct(
        /** @type {Effect} */
        i
      ));
    }
}
function we(e) {
  if (typeof e != "object" || e === null || Et in e)
    return e;
  const t = ia(e);
  if (t !== yn && t !== wn)
    return e;
  var s = /* @__PURE__ */ new Map(), r = kr(e), n = /* @__PURE__ */ B(0), i = Ft, l = (c) => {
    if (Ft === i)
      return c();
    var v = te, d = Ft;
    $e(null), Zr(i);
    var _ = c();
    return $e(v), Zr(d), _;
  };
  return r && s.set("length", /* @__PURE__ */ B(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(c, v, d) {
        (!("value" in d) || d.configurable === !1 || d.enumerable === !1 || d.writable === !1) && In();
        var _ = s.get(v);
        return _ === void 0 ? _ = l(() => {
          var b = /* @__PURE__ */ B(d.value);
          return s.set(v, b), b;
        }) : k(_, d.value, !0), !0;
      },
      deleteProperty(c, v) {
        var d = s.get(v);
        if (d === void 0) {
          if (v in c) {
            const _ = l(() => /* @__PURE__ */ B(Me));
            s.set(v, _), ms(n);
          }
        } else
          k(d, Me), ms(n);
        return !0;
      },
      get(c, v, d) {
        if (v === Et)
          return e;
        var _ = s.get(v), b = v in c;
        if (_ === void 0 && (!b || Dt(c, v)?.writable) && (_ = l(() => {
          var h = we(b ? c[v] : Me), F = /* @__PURE__ */ B(h);
          return F;
        }), s.set(v, _)), _ !== void 0) {
          var g = a(_);
          return g === Me ? void 0 : g;
        }
        return Reflect.get(c, v, d);
      },
      getOwnPropertyDescriptor(c, v) {
        var d = Reflect.getOwnPropertyDescriptor(c, v);
        if (d && "value" in d) {
          var _ = s.get(v);
          _ && (d.value = a(_));
        } else if (d === void 0) {
          var b = s.get(v), g = b?.v;
          if (b !== void 0 && g !== Me)
            return {
              enumerable: !0,
              configurable: !0,
              value: g,
              writable: !0
            };
        }
        return d;
      },
      has(c, v) {
        if (v === Et)
          return !0;
        var d = s.get(v), _ = d !== void 0 && d.v !== Me || Reflect.has(c, v);
        if (d !== void 0 || ce !== null && (!_ || Dt(c, v)?.writable)) {
          d === void 0 && (d = l(() => {
            var g = _ ? we(c[v]) : Me, h = /* @__PURE__ */ B(g);
            return h;
          }), s.set(v, d));
          var b = a(d);
          if (b === Me)
            return !1;
        }
        return _;
      },
      set(c, v, d, _) {
        var b = s.get(v), g = v in c;
        if (r && v === "length")
          for (var h = d; h < /** @type {Source<number>} */
          b.v; h += 1) {
            var F = s.get(h + "");
            F !== void 0 ? k(F, Me) : h in c && (F = l(() => /* @__PURE__ */ B(Me)), s.set(h + "", F));
          }
        if (b === void 0)
          (!g || Dt(c, v)?.writable) && (b = l(() => /* @__PURE__ */ B(void 0)), k(b, we(d)), s.set(v, b));
        else {
          g = b.v !== Me;
          var x = l(() => we(d));
          k(b, x);
        }
        var f = Reflect.getOwnPropertyDescriptor(c, v);
        if (f?.set && f.set.call(_, d), !g) {
          if (r && typeof v == "string") {
            var m = (
              /** @type {Source<number>} */
              s.get("length")
            ), q = Number(v);
            Number.isInteger(q) && q >= m.v && k(m, q + 1);
          }
          ms(n);
        }
        return !0;
      },
      ownKeys(c) {
        a(n);
        var v = Reflect.ownKeys(c).filter((b) => {
          var g = s.get(b);
          return g === void 0 || g.v !== Me;
        });
        for (var [d, _] of s)
          _.v !== Me && !(d in c) && v.push(d);
        return v;
      },
      setPrototypeOf() {
        Rn();
      }
    }
  );
}
function Vr(e) {
  try {
    if (e !== null && typeof e == "object" && Et in e)
      return e[Et];
  } catch {
  }
  return e;
}
function Da(e, t) {
  return Object.is(Vr(e), Vr(t));
}
var Xr, Ea, Ta, Aa;
function ii() {
  if (Xr === void 0) {
    Xr = window, Ea = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, s = Text.prototype;
    Ta = Dt(t, "firstChild").get, Aa = Dt(t, "nextSibling").get, Ur(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ur(s) && (s.__t = void 0);
  }
}
function ot(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function gt(e) {
  return (
    /** @type {TemplateNode | null} */
    Ta.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ss(e) {
  return (
    /** @type {TemplateNode | null} */
    Aa.call(e)
  );
}
function o(e, t) {
  return /* @__PURE__ */ gt(e);
}
function Ve(e, t = !1) {
  {
    var s = /* @__PURE__ */ gt(e);
    return s instanceof Comment && s.data === "" ? /* @__PURE__ */ Ss(s) : s;
  }
}
function u(e, t = 1, s = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ss(r);
  return r;
}
function li(e) {
  e.textContent = "";
}
function Fa() {
  return !1;
}
let Gr = !1;
function oi() {
  Gr || (Gr = !0, document.addEventListener(
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
function Ks(e) {
  var t = te, s = ce;
  $e(null), et(null);
  try {
    return e();
  } finally {
    $e(t), et(s);
  }
}
function Pr(e, t, s, r = s) {
  e.addEventListener(t, () => Ks(s));
  const n = e.__on_r;
  n ? e.__on_r = () => {
    n(), r(!0);
  } : e.__on_r = () => r(!0), oi();
}
function vi(e) {
  ce === null && (te === null && Fn(), An()), Ot && Tn();
}
function ci(e, t) {
  var s = t.last;
  s === null ? t.last = t.first = e : (s.next = e, e.prev = s, t.last = e);
}
function _t(e, t, s) {
  var r = ce;
  r !== null && (r.f & qe) !== 0 && (e |= qe);
  var n = {
    ctx: Be,
    deps: null,
    nodes: null,
    f: e | Ne | Je,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: r,
    b: r && r.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  if (s)
    try {
      xs(n), n.f |= Mr;
    } catch (c) {
      throw Ce(n), c;
    }
  else t !== null && ct(n);
  var i = n;
  if (s && i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
  (i.f & Zt) === 0 && (i = i.first, (e & ut) !== 0 && (e & Pt) !== 0 && i !== null && (i.f |= Pt)), i !== null && (i.parent = r, r !== null && ci(i, r), te !== null && (te.f & Ee) !== 0 && (e & $t) === 0)) {
    var l = (
      /** @type {Derived} */
      te
    );
    (l.effects ??= []).push(i);
  }
  return n;
}
function Ir() {
  return te !== null && !Ge;
}
function Vs(e) {
  const t = _t(Us, null, !1);
  return ke(t, Fe), t.teardown = e, t;
}
function Pa(e) {
  vi();
  var t = (
    /** @type {Effect} */
    ce.f
  ), s = !te && (t & dt) !== 0 && (t & Mr) === 0;
  if (s) {
    var r = (
      /** @type {ComponentContext} */
      Be
    );
    (r.e ??= []).push(e);
  } else
    return Ia(e);
}
function Ia(e) {
  return _t(qs | kn, e, !1);
}
function ui(e) {
  Qe.ensure();
  const t = _t($t | Zt, e, !0);
  return (s = {}) => new Promise((r) => {
    s.outro ? Tt(t, () => {
      Ce(t), r(void 0);
    }) : (Ce(t), r(void 0));
  });
}
function Ra(e) {
  return _t(qs, e, !1);
}
function di(e) {
  return _t(Dr | Zt, e, !0);
}
function Xs(e, t = 0) {
  return _t(Us | t, e, !0);
}
function X(e, t = [], s = [], r = []) {
  ei(r, t, s, (n) => {
    _t(Us, () => e(...n.map(a)), !0);
  });
}
function Gs(e, t = 0) {
  var s = _t(ut | t, e, !0);
  return s;
}
function Ue(e) {
  return _t(dt | Zt, e, !0);
}
function Oa(e) {
  var t = e.teardown;
  if (t !== null) {
    const s = Ot, r = te;
    Wr(!0), $e(null);
    try {
      t.call(null);
    } finally {
      Wr(s), $e(r);
    }
  }
}
function $a(e, t = !1) {
  var s = e.first;
  for (e.first = e.last = null; s !== null; ) {
    const n = s.ac;
    n !== null && Ks(() => {
      n.abort(Jt);
    });
    var r = s.next;
    (s.f & $t) !== 0 ? s.parent = null : Ce(s, t), s = r;
  }
}
function fi(e) {
  for (var t = e.first; t !== null; ) {
    var s = t.next;
    (t.f & dt) === 0 && Ce(t), t = s;
  }
}
function Ce(e, t = !0) {
  var s = !1;
  (t || (e.f & ca) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ca(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), s = !0), $a(e, t && !s), zs(e, 0), ke(e, mt);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  Oa(e);
  var n = e.parent;
  n !== null && n.first !== null && Na(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Ca(e, t) {
  for (; e !== null; ) {
    var s = e === t ? null : /* @__PURE__ */ Ss(e);
    e.remove(), e = s;
  }
}
function Na(e) {
  var t = e.parent, s = e.prev, r = e.next;
  s !== null && (s.next = r), r !== null && (r.prev = s), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = s));
}
function Tt(e, t, s = !0) {
  var r = [];
  La(e, r, !0);
  var n = () => {
    s && Ce(e), t && t();
  }, i = r.length;
  if (i > 0) {
    var l = () => --i || n();
    for (var c of r)
      c.out(l);
  } else
    n();
}
function La(e, t, s) {
  if ((e.f & qe) === 0) {
    e.f ^= qe;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const c of r)
        (c.is_global || s) && t.push(c);
    for (var n = e.first; n !== null; ) {
      var i = n.next, l = (n.f & Pt) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (n.f & dt) !== 0 && (e.f & ut) !== 0;
      La(n, t, l ? s : !1), n = i;
    }
  }
}
function Rr(e) {
  Ha(e, !0);
}
function Ha(e, t) {
  if ((e.f & qe) !== 0) {
    e.f ^= qe, (e.f & Fe) === 0 && (ke(e, Ne), ct(e));
    for (var s = e.first; s !== null; ) {
      var r = s.next, n = (s.f & Pt) !== 0 || (s.f & dt) !== 0;
      Ha(s, n ? t : !1), s = r;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const l of i)
        (l.is_global || t) && l.in();
  }
}
function qa(e, t) {
  if (e.nodes)
    for (var s = e.nodes.start, r = e.nodes.end; s !== null; ) {
      var n = s === r ? null : /* @__PURE__ */ Ss(s);
      t.append(s), s = n;
    }
}
let At = !1;
function Ys(e) {
  At = e;
}
let Ot = !1;
function Wr(e) {
  Ot = e;
}
let te = null, Ge = !1;
function $e(e) {
  te = e;
}
let ce = null;
function et(e) {
  ce = e;
}
let vt = null;
function Ba(e) {
  te !== null && (vt === null ? vt = [e] : vt.push(e));
}
let Re = null, He = 0, ze = null;
function _i(e) {
  ze = e;
}
let Ya = 1, ws = 0, Ft = ws;
function Zr(e) {
  Ft = e;
}
function za() {
  return ++Ya;
}
function Ms(e) {
  var t = e.f;
  if ((t & Ne) !== 0)
    return !0;
  if (t & Ee && (e.f &= ~It), (t & ft) !== 0) {
    for (var s = (
      /** @type {Value[]} */
      e.deps
    ), r = s.length, n = 0; n < r; n++) {
      var i = s[n];
      if (Ms(
        /** @type {Derived} */
        i
      ) && ka(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & Je) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ke === null && ke(e, Fe);
  }
  return !1;
}
function ja(e, t, s = !0) {
  var r = e.reactions;
  if (r !== null && !vt?.includes(e))
    for (var n = 0; n < r.length; n++) {
      var i = r[n];
      (i.f & Ee) !== 0 ? ja(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (s ? ke(i, Ne) : (i.f & Fe) !== 0 && ke(i, ft), ct(
        /** @type {Effect} */
        i
      ));
    }
}
function Ua(e) {
  var t = Re, s = He, r = ze, n = te, i = vt, l = Be, c = Ge, v = Ft, d = e.f;
  Re = /** @type {null | Value[]} */
  null, He = 0, ze = null, te = (d & (dt | $t)) === 0 ? e : null, vt = null, Xt(e.ctx), Ge = !1, Ft = ++ws, e.ac !== null && (Ks(() => {
    e.ac.abort(Jt);
  }), e.ac = null);
  try {
    e.f |= mr;
    var _ = (
      /** @type {Function} */
      e.fn
    ), b = _(), g = e.deps;
    if (Re !== null) {
      var h;
      if (zs(e, He), g !== null && He > 0)
        for (g.length = He + Re.length, h = 0; h < Re.length; h++)
          g[He + h] = Re[h];
      else
        e.deps = g = Re;
      if (Ir() && (e.f & Je) !== 0)
        for (h = He; h < g.length; h++)
          (g[h].reactions ??= []).push(e);
    } else g !== null && He < g.length && (zs(e, He), g.length = He);
    if (_a() && ze !== null && !Ge && g !== null && (e.f & (Ee | ft | Ne)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      ze.length; h++)
        ja(
          ze[h],
          /** @type {Effect} */
          e
        );
    return n !== null && n !== e && (ws++, ze !== null && (r === null ? r = ze : r.push(.../** @type {Source[]} */
    ze))), (e.f & bt) !== 0 && (e.f ^= bt), b;
  } catch (F) {
    return pa(F);
  } finally {
    e.f ^= mr, Re = t, He = s, ze = r, te = n, vt = i, Xt(l), Ge = c, Ft = v;
  }
}
function hi(e, t) {
  let s = t.reactions;
  if (s !== null) {
    var r = gn.call(s, e);
    if (r !== -1) {
      var n = s.length - 1;
      n === 0 ? s = t.reactions = null : (s[r] = s[n], s.pop());
    }
  }
  if (s === null && (t.f & Ee) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (Re === null || !Re.includes(t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & Je) !== 0 && (i.f ^= Je, i.f &= ~It), Er(i), xa(i), zs(i, 0);
  }
}
function zs(e, t) {
  var s = e.deps;
  if (s !== null)
    for (var r = t; r < s.length; r++)
      hi(e, s[r]);
}
function xs(e) {
  var t = e.f;
  if ((t & mt) === 0) {
    ke(e, Fe);
    var s = ce, r = At;
    ce = e, At = !0;
    try {
      (t & (ut | va)) !== 0 ? fi(e) : $a(e), Oa(e);
      var n = Ua(e);
      e.teardown = typeof n == "function" ? n : null, e.wv = Ya;
      var i;
    } finally {
      At = r, ce = s;
    }
  }
}
async function Ja() {
  await Promise.resolve(), Vn();
}
function a(e) {
  var t = e.f, s = (t & Ee) !== 0;
  if (te !== null && !Ge) {
    var r = ce !== null && (ce.f & mt) !== 0;
    if (!r && !vt?.includes(e)) {
      var n = te.deps;
      if ((te.f & mr) !== 0)
        e.rv < ws && (e.rv = ws, Re === null && n !== null && n[He] === e ? He++ : Re === null ? Re = [e] : Re.includes(e) || Re.push(e));
      else {
        (te.deps ??= []).push(e);
        var i = e.reactions;
        i === null ? e.reactions = [te] : i.includes(te) || i.push(te);
      }
    }
  }
  if (Ot && yt.has(e))
    return yt.get(e);
  if (s) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (Ot) {
      var c = l.v;
      return ((l.f & Fe) === 0 && l.reactions !== null || Va(l)) && (c = Fr(l)), yt.set(l, c), c;
    }
    var v = (l.f & Je) === 0 && !Ge && te !== null && (At || (te.f & Je) !== 0), d = l.deps === null;
    Ms(l) && (v && (l.f |= Je), ka(l)), v && !d && Ka(l);
  }
  if (Ke?.has(e))
    return Ke.get(e);
  if ((e.f & bt) !== 0)
    throw e.v;
  return e.v;
}
function Ka(e) {
  if (e.deps !== null) {
    e.f |= Je;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & Ee) !== 0 && (t.f & Je) === 0 && Ka(
        /** @type {Derived} */
        t
      );
  }
}
function Va(e) {
  if (e.v === Me) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (yt.has(t) || (t.f & Ee) !== 0 && Va(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Ws(e) {
  var t = Ge;
  try {
    return Ge = !0, e();
  } finally {
    Ge = t;
  }
}
const pi = ["touchstart", "touchmove"];
function gi(e) {
  return pi.includes(e);
}
const Xa = /* @__PURE__ */ new Set(), wr = /* @__PURE__ */ new Set();
function mi(e, t, s, r = {}) {
  function n(i) {
    if (r.capture || fs.call(t, i), !i.cancelBubble)
      return Ks(() => s?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? wt(() => {
    t.addEventListener(e, n, r);
  }) : t.addEventListener(e, n, r), n;
}
function Cs(e, t, s, r, n) {
  var i = { capture: r, passive: n }, l = mi(e, t, s, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Vs(() => {
    t.removeEventListener(e, l, i);
  });
}
function Qt(e) {
  for (var t = 0; t < e.length; t++)
    Xa.add(e[t]);
  for (var s of wr)
    s(e);
}
let Qr = null;
function fs(e) {
  var t = this, s = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, n = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    n[0] || e.target
  );
  Qr = e;
  var l = 0, c = Qr === e && e.__root;
  if (c) {
    var v = n.indexOf(c);
    if (v !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var d = n.indexOf(t);
    if (d === -1)
      return;
    v <= d && (l = v);
  }
  if (i = /** @type {Element} */
  n[l] || e.target, i !== t) {
    mn(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || s;
      }
    });
    var _ = te, b = ce;
    $e(null), et(null);
    try {
      for (var g, h = []; i !== null; ) {
        var F = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var x = i["__" + r];
          x != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && x.call(i, e);
        } catch (f) {
          g ? h.push(f) : g = f;
        }
        if (e.cancelBubble || F === t || F === null)
          break;
        i = F;
      }
      if (g) {
        for (let f of h)
          queueMicrotask(() => {
            throw f;
          });
        throw g;
      }
    } finally {
      e.__root = t, delete e.currentTarget, $e(_), et(b);
    }
  }
}
function Ga(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function ks(e, t) {
  var s = (
    /** @type {Effect} */
    ce
  );
  s.nodes === null && (s.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
  var s = (t & qn) !== 0, r = (t & Bn) !== 0, n, i = !e.startsWith("<!>");
  return () => {
    n === void 0 && (n = Ga(i ? e : "<!>" + e), s || (n = /** @type {TemplateNode} */
    /* @__PURE__ */ gt(n)));
    var l = (
      /** @type {TemplateNode} */
      r || Ea ? document.importNode(n, !0) : n.cloneNode(!0)
    );
    if (s) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ gt(l)
      ), v = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      ks(c, v);
    } else
      ks(l, l);
    return l;
  };
}
function Ut(e = "") {
  {
    var t = ot(e + "");
    return ks(t, t), t;
  }
}
function Mt() {
  var e = document.createDocumentFragment(), t = document.createComment(""), s = ot();
  return e.append(t, s), ks(t, s), e;
}
function M(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function D(e, t) {
  var s = t == null ? "" : typeof t == "object" ? t + "" : t;
  s !== (e.__t ??= e.nodeValue) && (e.__t = s, e.nodeValue = s + "");
}
function bi(e, t) {
  return yi(e, t);
}
const zt = /* @__PURE__ */ new Map();
function yi(e, { target: t, anchor: s, props: r = {}, events: n, context: i, intro: l = !0 }) {
  ii();
  var c = /* @__PURE__ */ new Set(), v = (b) => {
    for (var g = 0; g < b.length; g++) {
      var h = b[g];
      if (!c.has(h)) {
        c.add(h);
        var F = gi(h);
        t.addEventListener(h, fs, { passive: F });
        var x = zt.get(h);
        x === void 0 ? (document.addEventListener(h, fs, { passive: F }), zt.set(h, 1)) : zt.set(h, x + 1);
      }
    }
  };
  v(js(Xa)), wr.add(v);
  var d = void 0, _ = ui(() => {
    var b = s ?? t.appendChild(ot());
    return Zn(
      /** @type {TemplateNode} */
      b,
      {
        pending: () => {
        }
      },
      (g) => {
        if (i) {
          tt({});
          var h = (
            /** @type {ComponentContext} */
            Be
          );
          h.c = i;
        }
        n && (r.$$events = n), d = e(g, r) || {}, i && st();
      }
    ), () => {
      for (var g of c) {
        t.removeEventListener(g, fs);
        var h = (
          /** @type {number} */
          zt.get(g)
        );
        --h === 0 ? (document.removeEventListener(g, fs), zt.delete(g)) : zt.set(g, h);
      }
      wr.delete(v), b !== s && b.parentNode?.removeChild(b);
    };
  });
  return wi.set(d, _), d;
}
let wi = /* @__PURE__ */ new WeakMap();
class Wa {
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
  #r = /* @__PURE__ */ new Map();
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
  #n = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #i = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, s = !0) {
    this.anchor = t, this.#i = s;
  }
  #a = () => {
    var t = (
      /** @type {Batch} */
      ne
    );
    if (this.#e.has(t)) {
      var s = (
        /** @type {Key} */
        this.#e.get(t)
      ), r = this.#r.get(s);
      if (r)
        Rr(r), this.#n.delete(s);
      else {
        var n = this.#t.get(s);
        n && (this.#r.set(s, n.effect), this.#t.delete(s), n.fragment.lastChild.remove(), this.anchor.before(n.fragment), r = n.effect);
      }
      for (const [i, l] of this.#e) {
        if (this.#e.delete(i), i === t)
          break;
        const c = this.#t.get(l);
        c && (Ce(c.effect), this.#t.delete(l));
      }
      for (const [i, l] of this.#r) {
        if (i === s || this.#n.has(i)) continue;
        const c = () => {
          if (Array.from(this.#e.values()).includes(i)) {
            var d = document.createDocumentFragment();
            qa(l, d), d.append(ot()), this.#t.set(i, { effect: l, fragment: d });
          } else
            Ce(l);
          this.#n.delete(i), this.#r.delete(i);
        };
        this.#i || !r ? (this.#n.add(i), Tt(l, c, !1)) : c();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #s = (t) => {
    this.#e.delete(t);
    const s = Array.from(this.#e.values());
    for (const [r, n] of this.#t)
      s.includes(r) || (Ce(n.effect), this.#t.delete(r));
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
    ), n = Fa();
    if (s && !this.#r.has(t) && !this.#t.has(t))
      if (n) {
        var i = document.createDocumentFragment(), l = ot();
        i.append(l), this.#t.set(t, {
          effect: Ue(() => s(l)),
          fragment: i
        });
      } else
        this.#r.set(
          t,
          Ue(() => s(this.anchor))
        );
    if (this.#e.set(r, t), n) {
      for (const [c, v] of this.#r)
        c === t ? r.skipped_effects.delete(v) : r.skipped_effects.add(v);
      for (const [c, v] of this.#t)
        c === t ? r.skipped_effects.delete(v.effect) : r.skipped_effects.add(v.effect);
      r.oncommit(this.#a), r.ondiscard(this.#s);
    } else
      this.#a();
  }
}
function ae(e, t, s = !1) {
  var r = new Wa(e), n = s ? Pt : 0;
  function i(l, c) {
    r.ensure(l, c);
  }
  Gs(() => {
    var l = !1;
    t((c, v = !0) => {
      l = !0, i(v, c);
    }), l || i(!1, null);
  }, n);
}
function Ae(e, t) {
  return t;
}
function xi(e, t, s) {
  for (var r = [], n = t.length, i, l = t.length, c = 0; c < n; c++) {
    let b = t[c];
    Tt(
      b,
      () => {
        if (i) {
          if (i.pending.delete(b), i.done.add(b), i.pending.size === 0) {
            var g = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            xr(js(i.done)), g.delete(i), g.size === 0 && (e.outrogroups = null);
          }
        } else
          l -= 1;
      },
      !1
    );
  }
  if (l === 0) {
    var v = r.length === 0 && s !== null;
    if (v) {
      var d = (
        /** @type {Element} */
        s
      ), _ = (
        /** @type {Element} */
        d.parentNode
      );
      li(_), _.append(d), e.items.clear();
    }
    xr(t, !v);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function xr(e, t = !0) {
  for (var s = 0; s < e.length; s++)
    Ce(e[s], t);
}
var ea;
function xe(e, t, s, r, n, i = null) {
  var l = e, c = /* @__PURE__ */ new Map(), v = (t & ua) !== 0;
  if (v) {
    var d = (
      /** @type {Element} */
      e
    );
    l = d.appendChild(ot());
  }
  var _ = null, b = /* @__PURE__ */ Ar(() => {
    var m = s();
    return kr(m) ? m : m == null ? [] : js(m);
  }), g, h = !0;
  function F() {
    f.fallback = _, ki(f, g, l, t, r), _ !== null && (g.length === 0 ? (_.f & lt) === 0 ? Rr(_) : (_.f ^= lt, _s(_, null, l)) : Tt(_, () => {
      _ = null;
    }));
  }
  var x = Gs(() => {
    g = /** @type {V[]} */
    a(b);
    for (var m = g.length, q = /* @__PURE__ */ new Set(), C = (
      /** @type {Batch} */
      ne
    ), L = Fa(), R = 0; R < m; R += 1) {
      var Y = g[R], K = r(Y, R), U = h ? null : c.get(K);
      U ? (U.v && Wt(U.v, Y), U.i && Wt(U.i, R), L && C.skipped_effects.delete(U.e)) : (U = Si(
        c,
        h ? l : ea ??= ot(),
        Y,
        K,
        R,
        n,
        t,
        s
      ), h || (U.e.f |= lt), c.set(K, U)), q.add(K);
    }
    if (m === 0 && i && !_ && (h ? _ = Ue(() => i(l)) : (_ = Ue(() => i(ea ??= ot())), _.f |= lt)), !h)
      if (L) {
        for (const [ie, P] of c)
          q.has(ie) || C.skipped_effects.add(P.e);
        C.oncommit(F), C.ondiscard(() => {
        });
      } else
        F();
    a(b);
  }), f = { effect: x, items: c, outrogroups: null, fallback: _ };
  h = !1;
}
function ki(e, t, s, r, n) {
  var i = (r & Ln) !== 0, l = t.length, c = e.items, v = e.effect.first, d, _ = null, b, g = [], h = [], F, x, f, m;
  if (i)
    for (m = 0; m < l; m += 1)
      F = t[m], x = n(F, m), f = /** @type {EachItem} */
      c.get(x).e, (f.f & lt) === 0 && (f.nodes?.a?.measure(), (b ??= /* @__PURE__ */ new Set()).add(f));
  for (m = 0; m < l; m += 1) {
    if (F = t[m], x = n(F, m), f = /** @type {EachItem} */
    c.get(x).e, e.outrogroups !== null)
      for (const P of e.outrogroups)
        P.pending.delete(f), P.done.delete(f);
    if ((f.f & lt) !== 0)
      if (f.f ^= lt, f === v)
        _s(f, null, s);
      else {
        var q = _ ? _.next : v;
        f === e.effect.last && (e.effect.last = f.prev), f.prev && (f.prev.next = f.next), f.next && (f.next.prev = f.prev), pt(e, _, f), pt(e, f, q), _s(f, q, s), _ = f, g = [], h = [], v = _.next;
        continue;
      }
    if ((f.f & qe) !== 0 && (Rr(f), i && (f.nodes?.a?.unfix(), (b ??= /* @__PURE__ */ new Set()).delete(f))), f !== v) {
      if (d !== void 0 && d.has(f)) {
        if (g.length < h.length) {
          var C = h[0], L;
          _ = C.prev;
          var R = g[0], Y = g[g.length - 1];
          for (L = 0; L < g.length; L += 1)
            _s(g[L], C, s);
          for (L = 0; L < h.length; L += 1)
            d.delete(h[L]);
          pt(e, R.prev, Y.next), pt(e, _, R), pt(e, Y, C), v = C, _ = Y, m -= 1, g = [], h = [];
        } else
          d.delete(f), _s(f, v, s), pt(e, f.prev, f.next), pt(e, f, _ === null ? e.effect.first : _.next), pt(e, _, f), _ = f;
        continue;
      }
      for (g = [], h = []; v !== null && v !== f; )
        (d ??= /* @__PURE__ */ new Set()).add(v), h.push(v), v = v.next;
      if (v === null)
        continue;
    }
    (f.f & lt) === 0 && g.push(f), _ = f, v = f.next;
  }
  if (e.outrogroups !== null) {
    for (const P of e.outrogroups)
      P.pending.size === 0 && (xr(js(P.done)), e.outrogroups?.delete(P));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (v !== null || d !== void 0) {
    var K = [];
    if (d !== void 0)
      for (f of d)
        (f.f & qe) === 0 && K.push(f);
    for (; v !== null; )
      (v.f & qe) === 0 && v !== e.fallback && K.push(v), v = v.next;
    var U = K.length;
    if (U > 0) {
      var ie = (r & ua) !== 0 && l === 0 ? s : null;
      if (i) {
        for (m = 0; m < U; m += 1)
          K[m].nodes?.a?.measure();
        for (m = 0; m < U; m += 1)
          K[m].nodes?.a?.fix();
      }
      xi(e, K, ie);
    }
  }
  i && wt(() => {
    if (b !== void 0)
      for (f of b)
        f.nodes?.a?.apply();
  });
}
function Si(e, t, s, r, n, i, l, c) {
  var v = (l & Cn) !== 0 ? (l & Hn) === 0 ? /* @__PURE__ */ ai(s, !1, !1) : Rt(s) : null, d = (l & Nn) !== 0 ? Rt(n) : null;
  return {
    v,
    i: d,
    e: Ue(() => (i(t, v ?? s, d ?? n, c), () => {
      e.delete(r);
    }))
  };
}
function _s(e, t, s) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end, i = t && (t.f & lt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : s; r !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ss(r)
      );
      if (i.before(r), r === n)
        return;
      r = l;
    }
}
function pt(e, t, s) {
  t === null ? e.effect.first = s : t.next = s, s === null ? e.effect.last = t : s.prev = t;
}
function ta(e, t, s = !1, r = !1, n = !1) {
  var i = e, l = "";
  X(() => {
    var c = (
      /** @type {Effect} */
      ce
    );
    if (l !== (l = t() ?? "") && (c.nodes !== null && (Ca(
      c.nodes.start,
      /** @type {TemplateNode} */
      c.nodes.end
    ), c.nodes = null), l !== "")) {
      var v = l + "";
      s ? v = `<svg>${v}</svg>` : r && (v = `<math>${v}</math>`);
      var d = Ga(v);
      if ((s || r) && (d = /** @type {Element} */
      /* @__PURE__ */ gt(d)), ks(
        /** @type {TemplateNode} */
        /* @__PURE__ */ gt(d),
        /** @type {TemplateNode} */
        d.lastChild
      ), s || r)
        for (; /* @__PURE__ */ gt(d); )
          i.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ gt(d)
          );
      else
        i.before(d);
    }
  });
}
function Mi(e, t, s) {
  var r = new Wa(e);
  Gs(() => {
    var n = t() ?? null;
    r.ensure(n, n && ((i) => s(i, n)));
  }, Pt);
}
const sa = [...` 	
\r\f \v\uFEFF`];
function Di(e, t, s) {
  var r = e == null ? "" : "" + e;
  if (t && (r = r ? r + " " + t : t), s) {
    for (var n in s)
      if (s[n])
        r = r ? r + " " + n : n;
      else if (r.length)
        for (var i = n.length, l = 0; (l = r.indexOf(n, l)) >= 0; ) {
          var c = l + i;
          (l === 0 || sa.includes(r[l - 1])) && (c === r.length || sa.includes(r[c])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(c + 1) : l = c;
        }
  }
  return r === "" ? null : r;
}
function Ei(e, t) {
  return e == null ? null : String(e);
}
function Pe(e, t, s, r, n, i) {
  var l = e.__className;
  if (l !== s || l === void 0) {
    var c = Di(s, r, i);
    c == null ? e.removeAttribute("class") : e.className = c, e.__className = s;
  } else if (i && n !== i)
    for (var v in i) {
      var d = !!i[v];
      (n == null || d !== !!n[v]) && e.classList.toggle(v, d);
    }
  return i;
}
function bs(e, t, s, r) {
  var n = e.__style;
  if (n !== t) {
    var i = Ei(t);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e.__style = t;
  }
  return r;
}
function Za(e, t, s = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!kr(t))
      return zn();
    for (var r of e.options)
      r.selected = t.includes(ys(r));
    return;
  }
  for (r of e.options) {
    var n = ys(r);
    if (Da(n, t)) {
      r.selected = !0;
      return;
    }
  }
  (!s || t !== void 0) && (e.selectedIndex = -1);
}
function Ti(e) {
  var t = new MutationObserver(() => {
    Za(e, e.__value);
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
  }), Vs(() => {
    t.disconnect();
  });
}
function Ai(e, t, s = t) {
  var r = /* @__PURE__ */ new WeakSet(), n = !0;
  Pr(e, "change", (i) => {
    var l = i ? "[selected]" : ":checked", c;
    if (e.multiple)
      c = [].map.call(e.querySelectorAll(l), ys);
    else {
      var v = e.querySelector(l) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      c = v && ys(v);
    }
    s(c), ne !== null && r.add(ne);
  }), Ra(() => {
    var i = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        ps ?? ne
      );
      if (r.has(l))
        return;
    }
    if (Za(e, i, n), n && i === void 0) {
      var c = e.querySelector(":checked");
      c !== null && (i = ys(c), s(i));
    }
    e.__value = i, n = !1;
  }), Ti(e);
}
function ys(e) {
  return "__value" in e ? e.__value : e.value;
}
const Fi = /* @__PURE__ */ Symbol("is custom element"), Pi = /* @__PURE__ */ Symbol("is html");
function De(e, t, s, r) {
  var n = Ii(e);
  n[t] !== (n[t] = s) && (t === "loading" && (e[Mn] = s), s == null ? e.removeAttribute(t) : typeof s != "string" && Ri(e).includes(t) ? e[t] = s : e.setAttribute(t, s));
}
function Ii(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [Fi]: e.nodeName.includes("-"),
      [Pi]: e.namespaceURI === Yn
    }
  );
}
var ra = /* @__PURE__ */ new Map();
function Ri(e) {
  var t = e.getAttribute("is") || e.nodeName, s = ra.get(t);
  if (s) return s;
  ra.set(t, s = []);
  for (var r, n = e, i = Element.prototype; i !== n; ) {
    r = bn(n);
    for (var l in r)
      r[l].set && s.push(l);
    n = ia(n);
  }
  return s;
}
function hs(e, t, s = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Pr(e, "input", async (n) => {
    var i = n ? e.defaultValue : e.value;
    if (i = ur(e) ? dr(i) : i, s(i), ne !== null && r.add(ne), await Ja(), i !== (i = t())) {
      var l = e.selectionStart, c = e.selectionEnd, v = e.value.length;
      if (e.value = i ?? "", c !== null) {
        var d = e.value.length;
        l === c && c === v && d > v ? (e.selectionStart = d, e.selectionEnd = d) : (e.selectionStart = l, e.selectionEnd = Math.min(c, d));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Ws(t) == null && e.value && (s(ur(e) ? dr(e.value) : e.value), ne !== null && r.add(ne)), Xs(() => {
    var n = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        ps ?? ne
      );
      if (r.has(i))
        return;
    }
    ur(e) && n === dr(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
  });
}
const cr = /* @__PURE__ */ new Set();
function Ns(e, t, s, r, n = r) {
  var i = s.getAttribute("type") === "checkbox", l = e;
  if (t !== null)
    for (var c of t)
      l = l[c] ??= [];
  l.push(s), Pr(
    s,
    "change",
    () => {
      var v = s.__value;
      i && (v = Oi(l, v, s.checked)), n(v);
    },
    // TODO better default value handling
    () => n(i ? [] : null)
  ), Xs(() => {
    var v = r();
    i ? (v = v || [], s.checked = v.includes(s.__value)) : s.checked = Da(s.__value, v);
  }), Vs(() => {
    var v = l.indexOf(s);
    v !== -1 && l.splice(v, 1);
  }), cr.has(l) || (cr.add(l), wt(() => {
    l.sort((v, d) => v.compareDocumentPosition(d) === 4 ? -1 : 1), cr.delete(l);
  })), wt(() => {
  });
}
function Oi(e, t, s) {
  for (var r = /* @__PURE__ */ new Set(), n = 0; n < e.length; n += 1)
    e[n].checked && r.add(e[n].__value);
  return s || r.delete(t), Array.from(r);
}
function ur(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function dr(e) {
  return e === "" ? null : +e;
}
function aa(e, t) {
  return e === t || e?.[Et] === t;
}
function Ze(e = {}, t, s, r) {
  return Ra(() => {
    var n, i;
    return Xs(() => {
      n = i, i = r?.() || [], Ws(() => {
        e !== s(...i) && (t(e, ...i), n && aa(s(...n), e) && t(null, ...n));
      });
    }), () => {
      wt(() => {
        i && aa(s(...i), e) && t(null, ...i);
      });
    };
  }), e;
}
const $i = {
  get(e, t) {
    let s = e.props.length;
    for (; s--; ) {
      let r = e.props[s];
      if (ds(r) && (r = r()), typeof r == "object" && r !== null && t in r) return r[t];
    }
  },
  set(e, t, s) {
    let r = e.props.length;
    for (; r--; ) {
      let n = e.props[r];
      ds(n) && (n = n());
      const i = Dt(n, t);
      if (i && i.set)
        return i.set(s), !0;
    }
    return !1;
  },
  getOwnPropertyDescriptor(e, t) {
    let s = e.props.length;
    for (; s--; ) {
      let r = e.props[s];
      if (ds(r) && (r = r()), typeof r == "object" && r !== null && t in r) {
        const n = Dt(r, t);
        return n && !n.configurable && (n.configurable = !0), n;
      }
    }
  },
  has(e, t) {
    if (t === Et || t === Sn) return !1;
    for (let s of e.props)
      if (ds(s) && (s = s()), s != null && t in s) return !0;
    return !1;
  },
  ownKeys(e) {
    const t = [];
    for (let s of e.props)
      if (ds(s) && (s = s()), !!s) {
        for (const r in s)
          t.includes(r) || t.push(r);
        for (const r of Object.getOwnPropertySymbols(s))
          t.includes(r) || t.push(r);
      }
    return t;
  }
};
function Ci(...e) {
  return new Proxy({ props: e }, $i);
}
function Qa(e, t, s, r) {
  var n = (
    /** @type {V} */
    r
  ), i = !0, l = () => (i && (i = !1, n = /** @type {V} */
  r), n), c;
  c = /** @type {V} */
  e[t], c === void 0 && r !== void 0 && (c = l());
  var v;
  return v = () => {
    var d = (
      /** @type {V} */
      e[t]
    );
    return d === void 0 ? l() : (i = !0, d);
  }, v;
}
function xt(e) {
  Be === null && Dn(), Pa(() => {
    const t = Ws(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Ni = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Ni);
function Li(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var fr = { exports: {} }, na;
function Hi() {
  return na || (na = 1, (function(e) {
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
      function n(x, f, m) {
        var q = x || s, C = f || 0, L = m || !1, R = 0, Y;
        function K(P, S) {
          var O;
          if (S) {
            if (O = S.getTime(), L) {
              var y = _(S);
              if (S = new Date(O + y + C), _(S) !== y) {
                var J = _(S);
                S = new Date(O + J + C);
              }
            }
          } else {
            var E = Date.now();
            E > R ? (R = E, Y = new Date(R), O = R, L && (Y = new Date(R + _(Y) + C))) : O = R, S = Y;
          }
          return U(P, S, q, O);
        }
        function U(P, S, O, E) {
          for (var y = "", J = null, Q = !1, N = P.length, ue = !1, de = 0; de < N; de++) {
            var $ = P.charCodeAt(de);
            if (Q === !0) {
              if ($ === 45) {
                J = "";
                continue;
              } else if ($ === 95) {
                J = " ";
                continue;
              } else if ($ === 48) {
                J = "0";
                continue;
              } else if ($ === 58) {
                ue && F("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), ue = !0;
                continue;
              }
              switch ($) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  y += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  y += O.days[S.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  y += O.months[S.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  y += i(Math.floor(S.getFullYear() / 100), J);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  y += U(O.formats.D, S, O, E);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  y += U(O.formats.F, S, O, E);
                  break;
                // '00'
                // case 'H':
                case 72:
                  y += i(S.getHours(), J);
                  break;
                // '12'
                // case 'I':
                case 73:
                  y += i(c(S.getHours()), J);
                  break;
                // '000'
                // case 'L':
                case 76:
                  y += l(Math.floor(E % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  y += i(S.getMinutes(), J);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  y += S.getHours() < 12 ? O.am : O.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  y += U(O.formats.R, S, O, E);
                  break;
                // '00'
                // case 'S':
                case 83:
                  y += i(S.getSeconds(), J);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  y += U(O.formats.T, S, O, E);
                  break;
                // '00'
                // case 'U':
                case 85:
                  y += i(v(S, "sunday"), J);
                  break;
                // '00'
                // case 'W':
                case 87:
                  y += i(v(S, "monday"), J);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  y += U(O.formats.X, S, O, E);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  y += S.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (L && C === 0)
                    y += "GMT";
                  else {
                    var A = b(S);
                    y += A || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  y += O.shortDays[S.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  y += O.shortMonths[S.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  y += U(O.formats.c, S, O, E);
                  break;
                // '01'
                // case 'd':
                case 100:
                  y += i(S.getDate(), J);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  y += i(S.getDate(), J ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  y += O.shortMonths[S.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var z = new Date(S.getFullYear(), 0, 1), H = Math.ceil((S.getTime() - z.getTime()) / (1e3 * 60 * 60 * 24));
                  y += l(H);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  y += i(S.getHours(), J ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  y += i(c(S.getHours()), J ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  y += i(S.getMonth() + 1, J);
                  break;
                // '\n'
                // case 'n':
                case 110:
                  y += `
`;
                  break;
                // '1st'
                // case 'o':
                case 111:
                  var H = S.getDate();
                  O.ordinalSuffixes ? y += String(H) + (O.ordinalSuffixes[H - 1] || d(H)) : y += String(H) + d(H);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  y += S.getHours() < 12 ? O.AM : O.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  y += U(O.formats.r, S, O, E);
                  break;
                // '0'
                // case 's':
                case 115:
                  y += Math.floor(E / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  y += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var H = S.getDay();
                  y += H === 0 ? 7 : H;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  y += U(O.formats.v, S, O, E);
                  break;
                // '4'
                // case 'w':
                case 119:
                  y += S.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  y += U(O.formats.x, S, O, E);
                  break;
                // '70'
                // case 'y':
                case 121:
                  y += i(S.getFullYear() % 100, J);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (L && C === 0)
                    y += ue ? "+00:00" : "+0000";
                  else {
                    var V;
                    C !== 0 ? V = C / (60 * 1e3) : V = -S.getTimezoneOffset();
                    var se = V < 0 ? "-" : "+", ee = ue ? ":" : "", W = Math.floor(Math.abs(V / 60)), G = Math.abs(V % 60);
                    y += se + i(W) + ee + i(G);
                  }
                  break;
                default:
                  Q && (y += "%"), y += P[de];
                  break;
              }
              J = null, Q = !1;
              continue;
            }
            if ($ === 37) {
              Q = !0;
              continue;
            }
            y += P[de];
          }
          return y;
        }
        var ie = K;
        return ie.localize = function(P) {
          return new n(P || q, C, L);
        }, ie.localizeByIdentifier = function(P) {
          var S = t[P];
          return S ? ie.localize(S) : (F('[WARNING] No locale found with identifier "' + P + '".'), ie);
        }, ie.timezone = function(P) {
          var S = C, O = L, E = typeof P;
          if (E === "number" || E === "string")
            if (O = !0, E === "string") {
              var y = P[0] === "-" ? -1 : 1, J = parseInt(P.slice(1, 3), 10), Q = parseInt(P.slice(3, 5), 10);
              S = y * (60 * J + Q) * 60 * 1e3;
            } else E === "number" && (S = P * 60 * 1e3);
          return new n(q, S, O);
        }, ie.utc = function() {
          return new n(q, C, !0);
        }, ie;
      }
      function i(x, f) {
        return f === "" || x > 9 ? "" + x : (f == null && (f = "0"), f + x);
      }
      function l(x) {
        return x > 99 ? x : x > 9 ? "0" + x : "00" + x;
      }
      function c(x) {
        return x === 0 ? 12 : x > 12 ? x - 12 : x;
      }
      function v(x, f) {
        f = f || "sunday";
        var m = x.getDay();
        f === "monday" && (m === 0 ? m = 6 : m--);
        var q = Date.UTC(x.getFullYear(), 0, 1), C = Date.UTC(x.getFullYear(), x.getMonth(), x.getDate()), L = Math.floor((C - q) / 864e5), R = (L + 7 - m) / 7;
        return Math.floor(R);
      }
      function d(x) {
        var f = x % 10, m = x % 100;
        if (m >= 11 && m <= 13 || f === 0 || f >= 4)
          return "th";
        switch (f) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
        }
      }
      function _(x) {
        return (x.getTimezoneOffset() || 0) * 6e4;
      }
      function b(x, f) {
        return g() || h(x);
      }
      function g(x, f) {
        return null;
      }
      function h(x) {
        var f = x.toString().match(/\(([\w\s]+)\)/);
        return f && f[1];
      }
      function F(x) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(x);
      }
    })();
  })(fr)), fr.exports;
}
var qi = Hi();
const Kt = /* @__PURE__ */ Li(qi);
let _r = /* @__PURE__ */ B(!1);
class Bi {
  constructor(t) {
    if (this.sk = "", this.fetchFn = t || (typeof window < "u" ? fetch.bind(window) : fetch), typeof document < "u") {
      const s = document.querySelector('meta[name="csrf-token"]');
      s && (this.sk = s.content);
    }
  }
  get loading() {
    return a(_r);
  }
  async request(t, s = {}) {
    k(_r, !0);
    try {
      const r = new URL(t, window.location.origin);
      s.params && Object.entries(s.params).forEach(([c, v]) => {
        r.searchParams.append(c, String(v));
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
      k(_r, !1);
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
const ve = new Bi(), Yi = (e, t = Vt) => {
  var s = zi(), r = o(s);
  X(() => {
    Pe(s, 1, `status status-${t().status ?? ""}`, "svelte-13s7gu4"), D(r, t().status);
  }), M(e, s);
};
var zi = /* @__PURE__ */ I("<span> </span>"), ji = /* @__PURE__ */ I('<time class="svelte-13s7gu4"> </time>'), Ui = /* @__PURE__ */ I('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Ji = /* @__PURE__ */ I('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), Ki = /* @__PURE__ */ I('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Vi = /* @__PURE__ */ I('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), Xi = /* @__PURE__ */ I('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4">エントリ一覧</h2> <div class="search-box svelte-13s7gu4"><input type="text" placeholder="検索..." class="svelte-13s7gu4"/> <button class="svelte-13s7gu4">検索</button></div> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">新しい方へ</button> <button class="svelte-13s7gu4">古い方へ</button></div></div> <div><!></div></div>');
function Gi(e, t) {
  tt(t, !0);
  const s = (P, S = Vt, O) => {
    let E = /* @__PURE__ */ Ar(() => oa(O?.(), !0));
    var y = ji(), J = o(y);
    X(
      (Q) => {
        De(y, "datetime", S()), D(J, Q);
      },
      [() => a(E) && S() ? g(S()) : "-"]
    ), M(P, y);
  };
  let r = /* @__PURE__ */ B(we([])), n = /* @__PURE__ */ B(!1), i = 50, l = /* @__PURE__ */ B(""), c = /* @__PURE__ */ B(we([]));
  async function v() {
    try {
      const P = a(c)[a(c).length - 1], S = { limit: i };
      a(l) && (S.q = a(l)), P && (S.cursor_id = P);
      const O = await ve.get("/admin/api/entries", S);
      k(r, O.entries || [], !0), k(n, O.has_more || !1, !0);
    } catch (P) {
      console.error(P);
    }
  }
  function d() {
    k(c, [], !0), v();
  }
  xt(v);
  function _() {
    if (a(n) && a(r).length > 0) {
      const P = a(r)[a(r).length - 1];
      a(c).push(P.id), v();
    }
  }
  function b() {
    a(c).length > 0 && (a(c).pop(), v());
  }
  function g(P) {
    return P ? Kt("%Y-%m-%d %H:%M", new Date(P)) : "-";
  }
  var h = Xi(), F = o(h), x = u(o(F), 2), f = o(x);
  f.__keydown = (P) => P.key === "Enter" && d();
  var m = u(f, 2);
  m.__click = d;
  var q = u(x, 2), C = o(q);
  C.__click = b;
  var L = u(C, 2);
  L.__click = _;
  var R = u(F, 2);
  let Y;
  var K = o(R);
  {
    var U = (P) => {
      var S = Ui();
      M(P, S);
    }, ie = (P) => {
      var S = Vi(), O = Ve(S), E = u(o(O));
      xe(E, 21, () => a(r), Ae, (Q, N) => {
        var ue = Ji(), de = o(ue), $ = o(de), A = u(de), z = o(A), H = u(A), V = o(H);
        Yi(V, () => a(N));
        var se = u(H), ee = o(se), W = o(ee), G = u(ee, 2), le = o(G), oe = o(le), fe = u(se), he = o(fe), pe = u(fe), Se = o(pe);
        s(Se, () => a(N).created_at);
        var p = u(pe), w = o(p);
        s(w, () => a(N).modified_at);
        var j = u(p), re = o(j);
        s(re, () => a(N).publish_at?.Time, () => a(N).publish_at?.Valid);
        var ge = u(j), ye = o(ge);
        ye.__click = () => t.onEdit(a(N).id), X(() => {
          D($, a(N).id), D(z, a(N).date), D(W, a(N).title), De(le, "href", `/${a(N).path ?? ""}`), D(oe, `/${a(N).path ?? ""}`), D(he, a(N).format);
        }), M(Q, ue);
      });
      var y = u(O, 2);
      {
        var J = (Q) => {
          var N = Ki();
          M(Q, N);
        };
        ae(y, (Q) => {
          ve.loading && Q(J);
        });
      }
      M(P, S);
    };
    ae(K, (P) => {
      ve.loading && a(r).length === 0 ? P(U) : P(ie, !1);
    });
  }
  X(() => {
    C.disabled = a(c).length === 0 || ve.loading, L.disabled = !a(n) || ve.loading, Y = Pe(R, 1, "table-container svelte-13s7gu4", null, Y, { "is-loading": ve.loading });
  }), hs(f, () => a(l), (P) => k(l, P)), M(e, h), st();
}
Qt(["keydown", "click"]);
class Wi {
  #e;
  get exists() {
    return a(this.#e);
  }
  set exists(t) {
    k(this.#e, t, !0);
  }
  #r;
  get data() {
    return a(this.#r);
  }
  set data(t) {
    k(this.#r, t, !0);
  }
  constructor(t = typeof localStorage < "u" ? localStorage : null) {
    this.storage = t, this.timer = null, this.#e = /* @__PURE__ */ B(!1), this.#r = /* @__PURE__ */ B(null);
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
const Zi = "public", Qi = "draft", el = "scheduled", tl = "reserved", jt = Zi, hr = Qi, Ls = el, Hs = tl;
var sl = /* @__PURE__ */ I('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), rl = /* @__PURE__ */ I('<option class="svelte-7nstam"> </option>'), al = /* @__PURE__ */ I('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), nl = /* @__PURE__ */ I('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), il = /* @__PURE__ */ I('<button id="restore" type="button" class="submit-button restore-button svelte-7nstam">復元...</button>'), ll = /* @__PURE__ */ I('<div role="option" tabindex="-1"> </div>'), ol = /* @__PURE__ */ I('<div class="preview-overlay svelte-7nstam"><div class="preview-progress-container svelte-7nstam"><div class="preview-progress-bar svelte-7nstam"></div> <div class="preview-progress-text svelte-7nstam">読み込み中...</div></div></div>'), vl = /* @__PURE__ */ I('<span class="tag svelte-7nstam"> </span>'), cl = /* @__PURE__ */ I('<div role="button" tabindex="-1"><div class="result-title svelte-7nstam"><!> <!> <button type="button" class="open-result-button svelte-7nstam" title="別タブで開く">↗️</button></div> <div class="result-summary svelte-7nstam"><!></div> <div class="result-meta svelte-7nstam"><span class="result-date svelte-7nstam"> </span> <span class="result-path svelte-7nstam"> </span></div></div>'), ul = /* @__PURE__ */ I('<div class="no-results svelte-7nstam">結果が見つかりません</div>'), dl = /* @__PURE__ */ I('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam">🔗 リンク</button> <button type="button" class="svelte-7nstam"> </button> <span class="char-count svelte-7nstam"> </span> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons footer-container svelte-7nstam"><div class="status-selector svelte-7nstam"><label class="status-option svelte-7nstam" title="非公開のまま保存します"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">下書き</span></div></label> <label class="status-option svelte-7nstam" title="今すぐ公開し、URLを確定させます"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">公開</span></div></label> <label class="status-option svelte-7nstam" title="指定した日時に公開します。URLは今すぐ確定します。"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">公開を遅延</span> <span class="description svelte-7nstam">URL確定</span></div></label> <label class="status-option svelte-7nstam" title="指定した日付を投稿日として予約します。公開されるまでURLは確定しません。"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">予約投稿</span> <span class="description svelte-7nstam">URL未定</span></div></label></div> <div class="action-row-container svelte-7nstam"><div class="footer-left svelte-7nstam"><button type="button" class="submit-button svelte-7nstam"><!></button> <!></div> <div class="footer-right svelte-7nstam"><!> <button type="button" class="submit-button preview-button svelte-7nstam">プレビュー</button></div></div></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam" role="listbox" aria-label="タグを選択" tabindex="0"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog> <dialog id="previewDialog" class="svelte-7nstam"><div class="preview-header svelte-7nstam"><h3 class="svelte-7nstam">プレビュー</h3> <button type="button" class="close-button svelte-7nstam">閉じる</button></div> <div class="preview-body svelte-7nstam"><!> <iframe name="preview-iframe" title="Preview" class="svelte-7nstam"></iframe></div></dialog> <dialog id="searchDialog" class="search-dialog svelte-7nstam"><div class="search-header svelte-7nstam"><h3 class="svelte-7nstam">過去日記を検索</h3> <button type="button" class="close-button svelte-7nstam">閉じる</button></div> <div class="search-body svelte-7nstam"><input type="search" placeholder="キーワードを入力..." class="search-input svelte-7nstam"/> <div class="search-results svelte-7nstam"></div></div> <div class="dialog-footer svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button></div></dialog>', 1);
function fl(e, t) {
  tt(t, !0);
  const s = [];
  let r = Qa(t, "id", 3, null);
  const n = new Wi();
  let i = /* @__PURE__ */ B(we({ id: void 0, title: "", body: "", status: "" })), l = we({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: jt,
    publishAt: ""
  }), c = /* @__PURE__ */ B(!1), v = /* @__PURE__ */ B(""), d = /* @__PURE__ */ B(!1), _ = /* @__PURE__ */ B(!0), b = /* @__PURE__ */ B(!1), g = /* @__PURE__ */ B(null), h = /* @__PURE__ */ B(null), F = /* @__PURE__ */ B(null), x = /* @__PURE__ */ B(null), f = /* @__PURE__ */ B(null), m = /* @__PURE__ */ B(null), q = /* @__PURE__ */ B(null);
  const C = [
    "tech",
    "photo",
    "redeveloped",
    "stablediffusion",
    "photoshopped"
  ];
  let L = /* @__PURE__ */ B(0), R = /* @__PURE__ */ B(""), Y = /* @__PURE__ */ B(we([])), K = /* @__PURE__ */ B(0), U = /* @__PURE__ */ B(null), ie = we([]);
  async function P(p) {
    try {
      k(_, !0);
      const w = await ve.get(`/admin/api/entry/${p}`);
      k(i, w, !0), l.id = w.id, l.title = w.title ?? "", l.body = w.body ?? "", l.format = w.format || "Hatena", l.status = w.status, w.publish_at?.Valid ? l.publishAt = Kt("%Y-%m-%dT%H:%M", new Date(w.publish_at.Time)) : l.publishAt = Kt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), n.check(a(i).id ?? null, { title: l.title, body: l.body });
    } catch (w) {
      console.error(w), alert("エントリの取得に失敗しました");
    } finally {
      k(_, !1);
    }
  }
  xt(() => {
    r() ? P(r()) : (k(i, { id: void 0, title: "", body: "", status: jt }, !0), l.id = null, l.title = "", l.body = "", l.format = "Hatena", l.status = jt, l.publishAt = Kt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), n.check(null, { title: l.title, body: l.body }), k(_, !1));
  }), Pa(() => {
    (a(i).title !== l.title || a(i).body !== l.body) && n.saveDebounced(a(i).id ?? null, { title: l.title, body: l.body });
  });
  async function S() {
    k(c, !0), k(v, "リクエスト中");
    const p = new FormData();
    if (p.set("id", l.id ? String(l.id) : ""), p.set("title", l.title), p.set("body", l.body), p.set("format", l.format), l.status === Ls || l.status === Hs) {
      const w = new Date(l.publishAt);
      p.set("publish_at", w.toISOString());
    }
    p.set("status", l.status);
    try {
      const j = (await ve.post("/admin/api/edit", p)).session_id;
      if (!j)
        throw new Error("保存に失敗しました");
      O(j);
    } catch (w) {
      k(c, !1), alert(w instanceof Error ? w.message : "エラーが発生しました");
    }
  }
  function O(p) {
    const w = new EventSource(`/admin/api/edit/progress?sid=${p}`);
    w.onmessage = (j) => {
      const re = JSON.parse(j.data);
      switch (re.type) {
        case "progress":
          k(v, E(re.message), !0);
          break;
        case "done":
          n.clear(a(i).id ?? null), k(v, "完了"), k(c, !1), w.close(), t.onSave(re.location);
          break;
        case "error":
          k(v, "エラー: " + re.message), k(c, !1), w.close(), alert("保存に失敗しました: " + re.message);
          break;
      }
    }, w.onerror = () => {
      k(c, !1), w.close(), alert("通信エラーが発生しました");
    };
  }
  function E(p) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[p] || p;
  }
  function y() {
    k(L, 0), a(F).showModal(), setTimeout(() => a(q)?.focus(), 0);
  }
  function J(p) {
    p.key === "ArrowDown" ? (p.preventDefault(), k(L, (a(L) + 1) % C.length)) : p.key === "ArrowUp" ? (p.preventDefault(), k(L, (a(L) - 1 + C.length) % C.length)) : p.key === "Enter" || p.key === " " ? (p.preventDefault(), Q(C[a(L)])) : p.key === "Escape" && a(F).close();
  }
  function Q(p) {
    const w = `[${p}]`;
    l.title.includes(w) ? l.title = l.title.replace(w, "") : l.title = w + l.title, a(F).close(), a(g).focus();
  }
  function N() {
    k(R, ""), k(Y, [], !0), k(K, 0), a(m).showModal(), setTimeout(() => a(U)?.focus(), 0);
  }
  async function ue(p) {
    if (!(p instanceof KeyboardEvent && p.key === "Enter")) {
      if (a(R).length < 2) {
        k(Y, [], !0);
        return;
      }
      try {
        const w = await ve.get("/api/search", { q: a(R) });
        k(Y, w.results || [], !0), k(K, 0);
      } catch (w) {
        console.error(w);
      }
    }
  }
  function de(p) {
    p.key === "ArrowDown" || p.ctrlKey && p.key === "n" ? (p.preventDefault(), k(K, (a(K) + 1) % a(Y).length), ie[a(K)]?.scrollIntoView({ block: "nearest" })) : p.key === "ArrowUp" || p.ctrlKey && p.key === "p" ? (p.preventDefault(), k(K, (a(K) - 1 + a(Y).length) % a(Y).length), ie[a(K)]?.scrollIntoView({ block: "nearest" })) : p.key === "Enter" ? (p.preventDefault(), a(Y)[a(K)] && (p.shiftKey || p.metaKey || p.ctrlKey ? $(a(Y)[a(K)]) : A(a(Y)[a(K)]))) : p.key === "Escape" && a(m).close();
  }
  function $(p) {
    const w = p.path.startsWith("http") ? p.path : `${location.origin}/${p.path}`;
    window.open(w, "_blank");
  }
  function A(p) {
    const w = p.path.startsWith("http") ? p.path : `${location.origin}/${p.path}`;
    let j = "";
    switch (l.format) {
      case "Hatena":
        j = `[${w}:title=${p.title}]`;
        break;
      case "Markdown":
        j = `[${p.title}](${w})`;
        break;
      case "HTML":
        j = `<a href="${w}">${p.title}</a>`;
        break;
      case "tDiary":
        j = `[[${p.title}|${w}]]`;
        break;
      default:
        j = w;
    }
    V(j), a(m).close(), a(h).focus();
  }
  function z() {
    n.data && (l.title = n.data.title, l.body = n.data.body, n.clear(a(i).id ?? null), a(x).close());
  }
  async function H() {
    const p = document.createElement("input");
    p.type = "file", p.oninput = async () => {
      if (!p.files?.[0]) return;
      const w = new FormData();
      w.append("file", p.files[0]), k(d, !0);
      try {
        const j = await ve.post("/admin/api/upload/image", w);
        let re = "";
        j.uploaded.toLowerCase().endsWith(".webm") ? re = `<video src="${j.uploaded}" autoplay loop muted playsinline style="max-width: 100%; height: auto;"></video>
` : re = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${j.uploaded}" class="picasa" itemprop="url"><img src="${j.uploaded}" alt="photo" itemprop="image"/></a></span>
`, V(re, !0);
      } catch {
        alert("アップロードに失敗しました");
      } finally {
        k(d, !1);
      }
    }, p.click();
  }
  function V(p, w = !1) {
    const j = a(h).selectionStart, re = a(h).selectionEnd, ge = a(h).value;
    l.body = ge.substring(0, j) + p + ge.substring(re), Ja().then(() => {
      typeof w == "boolean" && w ? (a(h).selectionStart = j, a(h).selectionEnd = j + p.length) : typeof w == "number" ? a(h).selectionStart = a(h).selectionEnd = j + w : a(h).selectionStart = a(h).selectionEnd = j + p.length, a(h).focus();
    });
  }
  function se(p) {
    const w = (p.altKey ? "Alt-" : "") + (p.ctrlKey ? "Control-" : "") + (p.metaKey ? "Meta-" : "") + (p.shiftKey ? "Shift-" : "") + p.key;
    w === "Control-t" ? (V("\\(  \\)", 3), p.preventDefault(), p.stopPropagation()) : (w === "Control-l" || w === "Meta-l") && (N(), p.preventDefault(), p.stopPropagation());
  }
  function ee() {
    a(f).showModal();
    const p = document.getElementsByName("preview-iframe")[0];
    p && (p.src = "about:blank"), setTimeout(
      () => {
        k(b, !0);
      },
      0
    );
    const w = document.createElement("form");
    w.method = "POST", w.action = "/admin/api/preview", w.target = "preview-iframe";
    const j = {
      title: l.title,
      body: l.body,
      format: l.format,
      sk: ve.skValue
    };
    for (const [re, ge] of Object.entries(j)) {
      const ye = document.createElement("input");
      ye.type = "hidden", ye.name = re, ye.value = ge, w.appendChild(ye);
    }
    document.body.appendChild(w), w.submit(), document.body.removeChild(w);
  }
  function W() {
    k(b, !1), a(f).close();
  }
  function G(p) {
    const w = document.createElement("p");
    return w.textContent = p, w.innerHTML;
  }
  function le(p, w) {
    if (!w) return G(p);
    const j = G(p), re = w.split(/\s+/).filter((Ie) => Ie.length >= 2);
    if (re.length === 0) return j;
    const ge = re.map((Ie) => Ie.replace(/[.*+?^${}()|[\\]/g, "\\$&")).join("|"), ye = new RegExp(`(${ge})`, "gi");
    return j.replace(ye, "<mark>$1</mark>");
  }
  function oe(p) {
    const j = new DOMParser().parseFromString(p, "text/html");
    j.querySelectorAll("script, style, noscript, iframe").forEach((ge) => ge.remove());
    const re = j.body.textContent || "";
    return re.replace(/\s+/g, " ").trim().substring(0, 200) + (re.length > 200 ? "..." : "");
  }
  var fe = Mt(), he = Ve(fe);
  {
    var pe = (p) => {
      var w = sl();
      M(p, w);
    }, Se = (p) => {
      var w = dl(), j = Ve(w), re = o(j), ge = o(re);
      Ze(ge, (T) => k(g, T), () => a(g));
      var ye = u(ge, 2), Ie = o(ye);
      Ie.__click = y;
      var We = u(Ie, 2);
      We.__click = N;
      var _e = u(We, 2);
      _e.__click = H;
      var Te = o(_e), Ye = u(_e, 2), Ct = o(Ye), Nt = u(Ye, 2);
      xe(Nt, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], Ae, (T, Z) => {
        var be = rl(), me = o(be), Oe = {};
        X(() => {
          D(me, Z), Oe !== (Oe = Z) && (be.value = (be.__value = Z) ?? "");
        }), M(T, be);
      });
      var Lt = u(ye, 2), rt = o(Lt);
      rt.__keydown = se, Ze(rt, (T) => k(h, T), () => a(h));
      var Ht = u(re, 2), es = o(Ht);
      {
        var Zs = (T) => {
          var Z = al();
          M(T, Z);
        };
        ae(es, (T) => {
          a(c) && T(Zs);
        });
      }
      var Qs = u(es, 2), ts = o(Qs), Ds = o(ts), ss = o(Ds), rs, Es = u(Ds, 2), as = o(Es), ns, Ts = u(Es, 2), is = o(Ts), ls, er = u(Ts, 2), os = o(er), As, tr = u(ts, 2), Fs = o(tr), qt = o(Fs);
      qt.__click = S;
      var sr = o(qt);
      {
        var rr = (T) => {
          var Z = Ut();
          X(() => D(Z, a(v) || "リクエスト中")), M(T, Z);
        }, vs = (T) => {
          var Z = Mt(), be = Ve(Z);
          {
            var me = (Le) => {
              var at = Ut("下書き保存");
              M(Le, at);
            }, Oe = (Le) => {
              var at = Mt(), Rs = Ve(at);
              {
                var or = (ht) => {
                  var Yt = Ut();
                  X(() => D(Yt, r() ? "更新する" : "公開する")), M(ht, Yt);
                }, Os = (ht) => {
                  var Yt = Ut("予約する");
                  M(ht, Yt);
                };
                ae(
                  Rs,
                  (ht) => {
                    l.status === jt ? ht(or) : ht(Os, !1);
                  },
                  !0
                );
              }
              M(Le, at);
            };
            ae(
              be,
              (Le) => {
                l.status === hr ? Le(me) : Le(Oe, !1);
              },
              !0
            );
          }
          M(T, Z);
        };
        ae(sr, (T) => {
          a(c) ? T(rr) : T(vs, !1);
        });
      }
      var Bt = u(qt, 2);
      {
        var kt = (T) => {
          var Z = nl();
          hs(Z, () => l.publishAt, (be) => l.publishAt = be), M(T, Z);
        };
        ae(Bt, (T) => {
          (l.status === Ls || l.status === Hs) && T(kt);
        });
      }
      var cs = u(Fs, 2), Ps = o(cs);
      {
        var ar = (T) => {
          var Z = il();
          Z.__click = () => a(x).showModal(), M(T, Z);
        };
        ae(Ps, (T) => {
          n.exists && T(ar);
        });
      }
      var Or = u(Ps, 2);
      Or.__click = ee;
      var nr = u(j, 2), Is = u(o(nr), 2);
      Is.__keydown = J, xe(Is, 21, () => C, Ae, (T, Z, be) => {
        var me = ll();
        let Oe;
        me.__click = () => Q(a(Z)), me.__keydown = (at) => at.key === "Enter" && Q(a(Z));
        var Le = o(me);
        X(() => {
          Oe = Pe(me, 1, "tag-item svelte-7nstam", null, Oe, { selected: a(L) === be }), De(me, "aria-selected", a(L) === be), D(Le, a(Z));
        }), Cs("mouseenter", me, () => k(L, be, !0)), M(T, me);
      }), Ze(Is, (T) => k(q, T), () => a(q));
      var en = u(Is, 2);
      en.__click = () => a(F).close(), Ze(nr, (T) => k(F, T), () => a(F));
      var ir = u(nr, 2), $r = u(o(ir), 2), tn = o($r);
      {
        var sn = (T) => {
          var Z = Ut();
          X((be) => D(Z, be), [() => Kt("%Y年%m月%d日%H時", new Date(n.data.time))]), M(T, Z);
        };
        ae(tn, (T) => {
          n.data?.time && T(sn);
        });
      }
      var rn = u($r, 2), Cr = o(rn);
      Cr.__click = () => a(x).close();
      var an = u(Cr, 2);
      an.__click = z, Ze(ir, (T) => k(x, T), () => a(x));
      var lr = u(ir, 2), Nr = o(lr), nn = u(o(Nr), 2);
      nn.__click = W;
      var ln = u(Nr, 2), Lr = o(ln);
      {
        var on = (T) => {
          var Z = ol();
          M(T, Z);
        };
        ae(Lr, (T) => {
          a(b) && T(on);
        });
      }
      var Hr = u(Lr, 2);
      Ze(lr, (T) => k(f, T), () => a(f));
      var qr = u(lr, 2), Br = o(qr), vn = u(o(Br), 2);
      vn.__click = () => a(m).close();
      var Yr = u(Br, 2), us = o(Yr);
      us.__input = (T) => ue(T), us.__keydown = de, Ze(us, (T) => k(U, T), () => a(U));
      var cn = u(us, 2);
      xe(
        cn,
        21,
        () => a(Y),
        Ae,
        (T, Z, be) => {
          var me = cl();
          let Oe;
          me.__click = () => A(a(Z)), me.__keydown = (nt) => nt.key === "Enter" && A(a(Z));
          var Le = o(me), at = o(Le);
          ta(at, () => le(a(Z).title, a(R)));
          var Rs = u(at, 2);
          xe(Rs, 17, () => a(Z).tags, Ae, (nt, vr) => {
            var jr = vl(), pn = o(jr);
            X(() => D(pn, a(vr))), M(nt, jr);
          });
          var or = u(Rs, 2);
          or.__click = (nt) => {
            nt.stopPropagation(), $(a(Z));
          };
          var Os = u(Le, 2), ht = o(Os);
          ta(ht, () => le(oe(a(Z).formatted_body), a(R)));
          var Yt = u(Os, 2), zr = o(Yt), fn = o(zr), _n = u(zr, 2), hn = o(_n);
          Ze(me, (nt, vr) => ie[vr] = nt, (nt) => ie?.[nt], () => [be]), X(() => {
            Oe = Pe(me, 1, "search-result-item svelte-7nstam", null, Oe, { selected: a(K) === be }), D(fn, a(Z).date), D(hn, a(Z).path);
          }), Cs("mouseenter", me, () => k(K, be, !0)), M(T, me);
        },
        (T) => {
          var Z = Mt(), be = Ve(Z);
          {
            var me = (Oe) => {
              var Le = ul();
              M(Oe, Le);
            };
            ae(be, (Oe) => {
              a(R).length >= 2 && Oe(me);
            });
          }
          M(T, Z);
        }
      );
      var un = u(Yr, 2), dn = o(un);
      dn.__click = () => a(m).close(), Ze(qr, (T) => k(m, T), () => a(m)), X(() => {
        _e.disabled = a(d), D(Te, a(d) ? "⌛ アップロード中..." : "📷 写真"), D(Ct, `${(l.body ?? "").length ?? ""} 文字`), rs !== (rs = hr) && (ss.value = (ss.__value = hr) ?? ""), ns !== (ns = jt) && (as.value = (as.__value = jt) ?? ""), ls !== (ls = Ls) && (is.value = (is.__value = Ls) ?? ""), As !== (As = Hs) && (os.value = (os.__value = Hs) ?? ""), qt.disabled = a(c), Or.disabled = a(c);
      }), hs(ge, () => l.title, (T) => l.title = T), Ai(Nt, () => l.format, (T) => l.format = T), hs(rt, () => l.body, (T) => l.body = T), Ns(
        s,
        [],
        ss,
        () => l.status,
        (T) => l.status = T
      ), Ns(
        s,
        [],
        as,
        () => l.status,
        (T) => l.status = T
      ), Ns(
        s,
        [],
        is,
        () => l.status,
        (T) => l.status = T
      ), Ns(
        s,
        [],
        os,
        () => l.status,
        (T) => l.status = T
      ), Cs("load", Hr, () => {
        a(b) && k(b, !1);
      }), Cs("error", Hr, () => {
        k(b, !1), alert("プレビューの読み込みに失敗しました");
      }), hs(us, () => a(R), (T) => k(R, T)), M(p, w);
    };
    ae(he, (p) => {
      a(_) ? p(pe) : p(Se, !1);
    });
  }
  M(e, fe), st();
}
Qt(["click", "keydown", "input"]);
const _l = (e, t = Vt) => {
  var s = hl(), r = o(s);
  X(() => {
    Pe(s, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), D(r, t());
  }), M(e, s);
};
var hl = /* @__PURE__ */ I("<span> </span>"), pl = /* @__PURE__ */ I('<time class="time svelte-1r6codn"> </time>'), gl = /* @__PURE__ */ I('<span class="dep-type svelte-1r6codn"> </span>'), ml = /* @__PURE__ */ I('<button><span class="dep-id svelte-1r6codn"> </span> <!> <span class="dep-cond svelte-1r6codn"> </span></button>'), bl = /* @__PURE__ */ I('<div class="loading svelte-1r6codn"></div>'), yl = /* @__PURE__ */ I('<span class="uniqkey svelte-1r6codn"> </span>'), wl = /* @__PURE__ */ I('<div class="depends-on svelte-1r6codn"><div class="strategy svelte-1r6codn"> </div> <div class="dep-list svelte-1r6codn"></div></div>'), xl = /* @__PURE__ */ I('<div class="error-text svelte-1r6codn"> </div>'), kl = /* @__PURE__ */ I('<tr><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><div class="type-uniqkey svelte-1r6codn"><strong class="svelte-1r6codn"> </strong> <!></div></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"><!></td><td class="error svelte-1r6codn"><!></td></tr>'), Sl = /* @__PURE__ */ I('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type / Uniqkey</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Finished At</th><th class="svelte-1r6codn">Depends On</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), Ml = /* @__PURE__ */ I('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">新しい方へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">古い方へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function Dl(e, t) {
  tt(t, !0);
  const s = (E, y = Vt, J) => {
    let Q = /* @__PURE__ */ Ar(() => oa(J?.(), !0));
    var N = pl(), ue = o(N);
    X(
      (de) => {
        De(N, "datetime", y()), D(ue, de);
      },
      [() => a(Q) && y() ? x(y()) : "-"]
    ), M(E, N);
  }, r = (E, y = Vt, J = Vt) => {
    const Q = /* @__PURE__ */ Xe(() => _(y()));
    var N = ml();
    N.__click = () => b(y());
    var ue = o(N), de = o(ue), $ = u(ue, 2);
    {
      var A = (V) => {
        var se = gl(), ee = o(se);
        X(() => D(ee, a(Q).job_type_name)), M(V, se);
      };
      ae($, (V) => {
        a(Q) && V(A);
      });
    }
    var z = u($, 2), H = o(z);
    X(() => {
      Pe(N, 1, `dep-chip status-${(a(Q)?.status || "unknown") ?? ""}`, "svelte-1r6codn"), D(de, `#${y() ?? ""}`), De(z, "title", `Condition: ${J() ?? ""}`), D(H, J() === "completed" ? "✅" : "🏁");
    }), M(E, N);
  };
  let n = /* @__PURE__ */ B(we([])), i = /* @__PURE__ */ B(0), l = /* @__PURE__ */ B(0), c = 50, v = /* @__PURE__ */ B(null);
  function d(E) {
    if (!E.depends_on?.Valid || !E.depends_on.String || E.depends_on.String === "null") return null;
    try {
      const y = JSON.parse(E.depends_on.String);
      return !y || typeof y != "object" || !Array.isArray(y.dependencies) ? null : y;
    } catch {
      return null;
    }
  }
  function _(E) {
    return a(n).find((y) => y.id === E);
  }
  function b(E) {
    const y = document.getElementById(`job-${E}`);
    y && (y.scrollIntoView({ behavior: "smooth", block: "center" }), k(v, E, !0), setTimeout(
      () => {
        a(v) === E && k(v, null);
      },
      2e3
    ));
  }
  async function g() {
    try {
      const E = await ve.get("/admin/api/jobs", { limit: c, offset: a(l) });
      k(n, E.jobs || [], !0), k(i, E.total || 0, !0);
    } catch (E) {
      console.error(E);
    }
  }
  xt(g);
  function h() {
    a(l) + c < a(i) && (k(l, a(l) + c), g());
  }
  function F() {
    a(l) - c >= 0 && (k(l, a(l) - c), g());
  }
  function x(E) {
    return Kt("%Y-%m-%d %H:%M:%S", new Date(E));
  }
  var f = Ml(), m = o(f), q = o(m), C = o(q), L = u(q, 2), R = o(L);
  R.__click = F;
  var Y = u(R, 2), K = o(Y), U = u(Y, 2);
  U.__click = h;
  var ie = u(U, 2);
  ie.__click = g;
  var P = u(m, 2);
  {
    var S = (E) => {
      var y = bl();
      M(E, y);
    }, O = (E) => {
      var y = Sl(), J = u(o(y));
      xe(J, 21, () => a(n), Ae, (Q, N) => {
        var ue = kl();
        let de;
        var $ = o(ue), A = o($), z = u($), H = o(z), V = o(H), se = o(V), ee = u(V, 2);
        {
          var W = (_e) => {
            var Te = yl(), Ye = o(Te);
            X(() => {
              De(Te, "title", a(N).uniqkey.String), D(Ye, a(N).uniqkey.String);
            }), M(_e, Te);
          };
          ae(ee, (_e) => {
            a(N).uniqkey?.Valid && _e(W);
          });
        }
        var G = u(z), le = o(G);
        _l(le, () => a(N).status);
        var oe = u(G), fe = o(oe), he = u(oe), pe = o(he);
        s(pe, () => a(N).created_at);
        var Se = u(he), p = o(Se);
        s(p, () => a(N).finished_at.Time, () => a(N).finished_at.Valid);
        var w = u(Se), j = o(w);
        {
          var re = (_e) => {
            const Te = /* @__PURE__ */ Xe(() => d(a(N)));
            var Ye = wl(), Ct = o(Ye), Nt = o(Ct), Lt = u(Ct, 2);
            xe(Lt, 21, () => a(Te).dependencies, Ae, (rt, Ht) => {
              r(rt, () => a(Ht).id, () => a(Ht).condition);
            }), X((rt) => D(Nt, rt), [() => (a(Te).strategy || "all").toUpperCase()]), M(_e, Ye);
          }, ge = (_e) => {
            var Te = Ut("-");
            M(_e, Te);
          };
          ae(j, (_e) => {
            d(a(N)) ? _e(re) : _e(ge, !1);
          });
        }
        var ye = u(w), Ie = o(ye);
        {
          var We = (_e) => {
            var Te = xl(), Ye = o(Te);
            X(() => {
              De(Te, "title", a(N).error_message.String), D(Ye, a(N).error_message.String);
            }), M(_e, Te);
          };
          ae(Ie, (_e) => {
            a(N).error_message?.Valid && _e(We);
          });
        }
        X(() => {
          De(ue, "id", `job-${a(N).id ?? ""}`), de = Pe(ue, 1, "svelte-1r6codn", null, de, { highlighted: a(v) === a(N).id }), D(A, a(N).id), D(se, a(N).job_type_name), D(fe, a(N).retry_count);
        }), M(Q, ue);
      }), M(E, y);
    };
    ae(P, (E) => {
      ve.loading && a(n).length === 0 ? E(S) : E(O, !1);
    });
  }
  X(
    (E) => {
      D(C, `ジョブ一覧 (${a(i) ?? ""})`), R.disabled = a(l) === 0 || ve.loading, D(K, `${a(l) + 1} - ${E ?? ""} / ${a(i) ?? ""}`), U.disabled = a(l) + c >= a(i) || ve.loading;
    },
    [() => Math.min(a(l) + c, a(i))]
  ), M(e, f), st();
}
Qt(["click"]);
var El = /* @__PURE__ */ I('<div class="empty svelte-wpgtu6">No Signature</div>'), Tl = /* @__PURE__ */ I("<div></div>"), Al = /* @__PURE__ */ I('<div class="row svelte-wpgtu6"></div>'), Fl = /* @__PURE__ */ I('<div class="chroma-section svelte-wpgtu6"></div>'), Pl = /* @__PURE__ */ I('<div class="chroma-sections svelte-wpgtu6"></div>'), Il = /* @__PURE__ */ I('<div class="color-bitmask svelte-wpgtu6"><!></div>');
function pr(e, t) {
  tt(t, !0);
  let s = Qa(t, "size", 3, 64), r = /* @__PURE__ */ Xe(() => {
    if (!t.sig) return new Array(64).fill(!1);
    try {
      const _ = atob(t.sig), b = new Uint8Array(_.length);
      for (let h = 0; h < _.length; h++)
        b[h] = _.charCodeAt(h);
      const g = [];
      for (let h = 0; h < 8; h++) {
        const F = b[h];
        for (let x = 7; x >= 0; x--)
          g.push((F >> x & 1) === 1);
      }
      return g.reverse();
    } catch (_) {
      return console.error("Failed to decode sig:", _), new Array(64).fill(!1);
    }
  });
  function n(_) {
    const b = _ >> 5 & 1, g = _ >> 4 & 1, h = _ >> 3 & 1, F = _ >> 2 & 1, x = _ >> 1 & 1, f = _ & 1, m = g << 1 | F, q = b << 2 | h << 1 | x, C = f, L = [25, 45, 65, 85][m], R = C === 0 ? 0.01 : 0.15, Y = q * 45;
    return `oklch(${L}% ${R} ${Y})`;
  }
  function i(_, b, g) {
    const h = _ >> 1 & 1, F = _ & 1, x = b >> 2 & 1, f = b >> 1 & 1, m = b & 1, q = g & 1;
    return x << 5 | h << 4 | f << 3 | F << 2 | m << 1 | q;
  }
  var l = Il(), c = o(l);
  {
    var v = (_) => {
      var b = El();
      M(_, b);
    }, d = (_) => {
      var b = Pl();
      xe(b, 20, () => [1, 0], Ae, (g, h) => {
        var F = Fl();
        xe(F, 20, () => [3, 2, 1, 0], Ae, (x, f) => {
          var m = Al();
          xe(m, 20, () => [0, 1, 2, 3, 4, 5, 6, 7], Ae, (q, C) => {
            const L = /* @__PURE__ */ Xe(() => i(f, C, h));
            var R = Tl();
            let Y;
            X(
              (K) => {
                Y = Pe(R, 1, "bit svelte-wpgtu6", null, Y, { active: a(r)[a(L)] }), bs(R, `background-color: ${K ?? ""}`), De(R, "title", `L=${f ?? ""} H=${C * 45} C=${h ?? ""}`);
              },
              [() => n(a(L))]
            ), M(q, R);
          }), M(x, m);
        }), X(() => De(F, "title", h === 1 ? "Vivid Colors" : "Muted Colors")), M(g, F);
      }), M(_, b);
    };
    ae(c, (_) => {
      t.sig ? _(d, !1) : _(v);
    });
  }
  X(() => bs(l, `--size: ${s() ?? ""}px`)), M(e, l), st();
}
var Rl = /* @__PURE__ */ I('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), Ol = /* @__PURE__ */ I('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class A Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), $l = /* @__PURE__ */ I('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), Cl = /* @__PURE__ */ I('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class B Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), Nl = /* @__PURE__ */ I('<div class="stat-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">Storage (Free: 10GB)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976"> </div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class A (Free: 1M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class B (Free: 10M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div>', 1), Ll = /* @__PURE__ */ I('<div class="stat-card error-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">R2 Status</div> <div class="stat-value svelte-1w9i976" style="font-size: 0.9rem; color: #d32f2f;"> </div></div>'), Hl = /* @__PURE__ */ I('<div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div>', 1), ql = /* @__PURE__ */ I('<div class="r2-stats svelte-1w9i976"><!></div>');
function Bl(e, t) {
  tt(t, !0);
  let s = /* @__PURE__ */ B(null), r = /* @__PURE__ */ B(null);
  async function n() {
    try {
      k(s, await ve.get("/admin/api/r2/usage"), !0);
    } catch (f) {
      console.error("Failed to fetch R2 usage:", f), k(r, "Failed to load R2 usage data");
    }
  }
  xt(n);
  function i(f) {
    if (f === 0) return "0 B";
    const m = 1024, q = ["B", "KB", "MB", "GB", "TB"], C = Math.floor(Math.log(f) / Math.log(m));
    return parseFloat((f / Math.pow(m, C)).toFixed(2)) + " " + q[C];
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
  ], c = [
    "HeadObject",
    "GetObject",
    "HeadBucket",
    "GetBucketEncryption",
    "GetBucketLocation",
    "GetBucketPolicy"
  ], v = /* @__PURE__ */ Xe(() => a(s) ? (a(s).operations || []).filter((f) => l.includes(f.action_type)).reduce((f, m) => f + m.requests, 0) : 0), d = /* @__PURE__ */ Xe(() => a(s) ? (a(s).operations || []).filter((f) => c.includes(f.action_type)).reduce((f, m) => f + m.requests, 0) : 0), _ = /* @__PURE__ */ Xe(() => a(s) ? (a(s).operations || []).filter((f) => l.includes(f.action_type)).sort((f, m) => m.requests - f.requests) : []), b = /* @__PURE__ */ Xe(() => a(s) ? (a(s).operations || []).filter((f) => c.includes(f.action_type)).sort((f, m) => m.requests - f.requests) : []);
  var g = ql(), h = o(g);
  {
    var F = (f) => {
      var m = Nl(), q = Ve(m), C = u(o(q), 2), L = o(C), R = u(C, 2), Y = o(R), K = u(R, 2), U = o(K), ie = u(q, 2), P = u(o(ie), 2), S = o(P), O = u(P, 4), E = o(O), y = u(O, 2);
      {
        var J = (H) => {
          var V = Ol(), se = u(o(V), 2);
          xe(se, 21, () => a(_), Ae, (ee, W) => {
            var G = Rl(), le = o(G), oe = o(le), fe = u(le, 2), he = o(fe);
            X(
              (pe) => {
                D(oe, a(W).action_type), D(he, pe);
              },
              [() => (a(W).requests ?? 0).toLocaleString()]
            ), M(ee, G);
          }), M(H, V);
        };
        ae(y, (H) => {
          a(_).length > 0 && H(J);
        });
      }
      var Q = u(ie, 2), N = u(o(Q), 2), ue = o(N), de = u(N, 4), $ = o(de), A = u(de, 2);
      {
        var z = (H) => {
          var V = Cl(), se = u(o(V), 2);
          xe(se, 21, () => a(b), Ae, (ee, W) => {
            var G = $l(), le = o(G), oe = o(le), fe = u(le, 2), he = o(fe);
            X(
              (pe) => {
                D(oe, a(W).action_type), D(he, pe);
              },
              [() => (a(W).requests ?? 0).toLocaleString()]
            ), M(ee, G);
          }), M(H, V);
        };
        ae(A, (H) => {
          a(b).length > 0 && H(z);
        });
      }
      X(
        (H, V, se, ee, W, G, le) => {
          D(L, H), D(Y, `${V ?? ""} objects`), bs(U, `width: ${se ?? ""}%`), D(S, ee), bs(E, `width: ${W ?? ""}%`), D(ue, G), bs($, `width: ${le ?? ""}%`);
        },
        [
          () => i(a(s).storage_usage_bytes ?? 0),
          () => (a(s).object_count ?? 0).toLocaleString(),
          () => Math.min(100, (a(s).storage_usage_bytes ?? 0) / 10737418240 * 100),
          () => (a(v) ?? 0).toLocaleString(),
          () => Math.min(100, (a(v) ?? 0) / 1e6 * 100),
          () => (a(d) ?? 0).toLocaleString(),
          () => Math.min(100, (a(d) ?? 0) / 1e7 * 100)
        ]
      ), M(f, m);
    }, x = (f) => {
      var m = Mt(), q = Ve(m);
      {
        var C = (R) => {
          var Y = Ll(), K = u(o(Y), 2), U = o(K);
          X(() => D(U, a(r))), M(R, Y);
        }, L = (R) => {
          var Y = Hl();
          M(R, Y);
        };
        ae(
          q,
          (R) => {
            a(r) ? R(C) : R(L, !1);
          },
          !0
        );
      }
      M(f, m);
    };
    ae(h, (f) => {
      a(s) ? f(F) : f(x, !1);
    });
  }
  M(e, g), st();
}
var Yl = /* @__PURE__ */ I('<div class="loading svelte-xxb0sp">読み込み中...</div>'), zl = /* @__PURE__ */ I('<button class="indexed-icon svelte-xxb0sp" title="類似画像を検索">🔍</button>'), jl = /* @__PURE__ */ I('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/> <!></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), Ul = /* @__PURE__ */ I('<div class="overlay svelte-xxb0sp"><div class="loading-spinner svelte-xxb0sp"></div></div>'), Jl = /* @__PURE__ */ I('<div class="grid-container svelte-xxb0sp"><div></div> <!></div>'), Kl = /* @__PURE__ */ I('<div class="selected-compare svelte-xxb0sp"><div class="image-item target svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="svelte-xxb0sp">Selected Image</div></div></div> <div class="arrow svelte-xxb0sp">→</div></div>'), Vl = /* @__PURE__ */ I('<div class="loading svelte-xxb0sp">検索中...</div>'), Xl = /* @__PURE__ */ I('<p class="svelte-xxb0sp">類似画像は見つかりませんでした。</p>'), Gl = /* @__PURE__ */ I('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), Wl = /* @__PURE__ */ I("<div></div>"), Zl = /* @__PURE__ */ I('<div class="image-list svelte-xxb0sp"><div class="header svelte-xxb0sp"><div class="title-area svelte-xxb0sp"><h2 class="svelte-xxb0sp"> </h2> <a href="https://dash.cloudflare.com/d52dc19d3368d36eecf4b48d5eb2dd44/r2/default/buckets/lowreal" target="_blank" rel="noopener noreferrer" class="r2-link svelte-xxb0sp">R2 Dashboard ↗</a></div> <div class="pagination svelte-xxb0sp"><button class="svelte-xxb0sp">前へ</button> <span class="svelte-xxb0sp"> </span> <button class="svelte-xxb0sp">次へ</button></div></div> <!> <!></div> <dialog id="similarDialog" class="svelte-xxb0sp"><div class="dialog-header svelte-xxb0sp"><h3 class="svelte-xxb0sp">類似画像一覧</h3> <button type="button" class="close-btn svelte-xxb0sp">×</button></div> <div class="dialog-content svelte-xxb0sp"><!> <!></div></dialog>', 1);
function Ql(e, t) {
  tt(t, !0);
  let s = /* @__PURE__ */ B(we([])), r = /* @__PURE__ */ B(0), n = 20, i = /* @__PURE__ */ B(0), l = /* @__PURE__ */ B(we([])), c = /* @__PURE__ */ B(null), v = /* @__PURE__ */ B(null);
  async function d() {
    try {
      const A = await ve.get(`/admin/api/images?limit=${n}&offset=${a(r)}`);
      k(s, A.images || [], !0), k(i, A.total || 0, !0);
    } catch (A) {
      console.error(A);
    }
  }
  async function _(A) {
    k(c, A, !0), k(l, [], !0), a(v).showModal();
    try {
      const z = await ve.get(`/admin/api/image/${A.id}/similar`);
      k(l, z.similar || [], !0);
    } catch (z) {
      console.error(z);
    }
  }
  xt(d);
  function b() {
    a(r) + n < a(i) && (k(r, a(r) + n), d());
  }
  function g() {
    a(r) - n >= 0 && (k(r, a(r) - n), d());
  }
  var h = Zl(), F = Ve(h), x = o(F), f = o(x), m = o(f), q = o(m), C = u(f, 2), L = o(C);
  L.__click = g;
  var R = u(L, 2), Y = o(R), K = u(R, 2);
  K.__click = b;
  var U = u(x, 2);
  Bl(U, {});
  var ie = u(U, 2);
  {
    var P = (A) => {
      var z = Yl();
      M(A, z);
    }, S = (A) => {
      var z = Jl(), H = o(z);
      let V;
      xe(H, 21, () => a(s), (W) => W.id, (W, G) => {
        var le = jl(), oe = o(le), fe = o(oe), he = u(fe, 2);
        {
          var pe = (We) => {
            var _e = zl();
            _e.__click = () => _(a(G)), M(We, _e);
          };
          ae(he, (We) => {
            a(G).sig?.length > 0 && We(pe);
          });
        }
        var Se = u(oe, 2), p = o(Se);
        pr(p, {
          get sig() {
            return a(G).sig;
          }
        });
        var w = u(p, 2), j = o(w), re = u(o(j)), ge = o(re), ye = u(w, 2), Ie = o(ye);
        X(() => {
          De(fe, "src", a(G).uri), De(j, "href", `/admin/edit?id=${a(G).entry_id ?? ""}`), D(ge, a(G).entry_id), D(Ie, `ID: ${a(G).id ?? ""}`);
        }), M(W, le);
      });
      var se = u(H, 2);
      {
        var ee = (W) => {
          var G = Ul();
          M(W, G);
        };
        ae(se, (W) => {
          ve.loading && W(ee);
        });
      }
      X(() => V = Pe(H, 1, "grid svelte-xxb0sp", null, V, { "is-loading": ve.loading })), M(A, z);
    };
    ae(ie, (A) => {
      ve.loading && a(s).length === 0 ? A(P) : A(S, !1);
    });
  }
  var O = u(F, 2), E = o(O), y = u(o(E), 2);
  y.__click = () => a(v).close();
  var J = u(E, 2), Q = o(J);
  {
    var N = (A) => {
      var z = Kl(), H = o(z), V = o(H), se = o(V), ee = u(V, 2), W = o(ee);
      pr(W, {
        get sig() {
          return a(c).sig;
        }
      }), X(() => De(se, "src", a(c).uri)), M(A, z);
    };
    ae(Q, (A) => {
      a(c) && A(N);
    });
  }
  var ue = u(Q, 2);
  {
    var de = (A) => {
      var z = Vl();
      M(A, z);
    }, $ = (A) => {
      var z = Mt(), H = Ve(z);
      {
        var V = (ee) => {
          var W = Xl();
          M(ee, W);
        }, se = (ee) => {
          var W = Wl();
          let G;
          xe(W, 21, () => a(l), (le) => le.id, (le, oe) => {
            var fe = Gl(), he = o(fe), pe = o(he), Se = u(he, 2), p = o(Se);
            pr(p, {
              get sig() {
                return a(oe).sig;
              }
            });
            var w = u(p, 2), j = o(w);
            j.__click = () => a(v).close();
            var re = u(o(j)), ge = o(re), ye = u(w, 2), Ie = o(ye);
            X(() => {
              De(pe, "src", a(oe).uri), De(j, "href", `/admin/edit?id=${a(oe).entry_id ?? ""}`), D(ge, a(oe).entry_id), D(Ie, `ID: ${a(oe).id ?? ""} / Score: ${a(oe).score ?? ""}`);
            }), M(le, fe);
          }), X(() => G = Pe(W, 1, "grid similar-grid svelte-xxb0sp", null, G, { "is-loading": ve.loading })), M(ee, W);
        };
        ae(
          H,
          (ee) => {
            a(l).length === 0 ? ee(V) : ee(se, !1);
          },
          !0
        );
      }
      M(A, z);
    };
    ae(ue, (A) => {
      ve.loading && a(l).length === 0 ? A(de) : A($, !1);
    });
  }
  Ze(O, (A) => k(v, A), () => a(v)), X(
    (A) => {
      D(q, `画像一覧 (${a(i) ?? ""})`), L.disabled = a(r) === 0, D(Y, `${a(r) + 1} - ${A ?? ""} / ${a(i) ?? ""}`), K.disabled = a(r) + n >= a(i);
    },
    [() => Math.min(a(r) + n, a(i))]
  ), M(e, h), st();
}
Qt(["click"]);
var eo = /* @__PURE__ */ I('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), to = /* @__PURE__ */ I('<span class="term-badge svelte-6rw159"> </span>'), so = /* @__PURE__ */ I('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">TF-IDF 統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総語彙数 (Terms)</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">インデックス済みエントリ</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">関連エントリ計算済み</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">総関連ペア数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">平均類似度スコア</th><td class="svelte-6rw159"> </td></tr></tbody></table></div> <div style="margin-top: 10px;" class="svelte-6rw159"><h4 class="svelte-6rw159">頻出単語 (Top 20 DF)</h4> <div class="top-terms svelte-6rw159"></div></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">画像統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総画像数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">未インデックス画像数</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), ro = /* @__PURE__ */ I('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function ao(e, t) {
  tt(t, !0);
  let s = /* @__PURE__ */ B(null);
  async function r() {
    try {
      k(s, await ve.get("/admin/api/info"), !0);
    } catch (d) {
      console.error(d);
    }
  }
  xt(r);
  function n(d) {
    if (d === 0) return "0 B";
    const _ = 1024, b = ["B", "KB", "MB", "GB", "TB"], g = Math.floor(Math.log(d) / Math.log(_));
    return parseFloat((d / Math.pow(_, g)).toFixed(2)) + " " + b[g];
  }
  var i = ro(), l = u(o(i), 2);
  {
    var c = (d) => {
      var _ = eo();
      M(d, _);
    }, v = (d) => {
      var _ = Mt(), b = Ve(_);
      {
        var g = (h) => {
          var F = so(), x = o(F), f = u(o(x), 2), m = o(f), q = o(m), C = o(q), L = u(o(C)), R = o(L), Y = u(C), K = u(o(Y)), U = o(K), ie = u(Y), P = u(o(ie)), S = o(P), O = u(ie), E = u(o(O)), y = o(E), J = u(O), Q = u(o(J)), N = o(Q), ue = u(f, 2), de = u(o(ue), 2);
          xe(de, 21, () => a(s).tfidf_stats?.top_terms ?? [], Ae, (vs, Bt) => {
            var kt = to(), cs = o(kt);
            X(() => {
              De(kt, "title", `DF: ${a(Bt).df ?? ""}`), D(cs, a(Bt).term);
            }), M(vs, kt);
          });
          var $ = u(x, 2), A = u(o($), 2), z = o(A), H = o(z), V = o(H), se = u(o(V)), ee = o(se), W = u(V), G = u(o(W)), le = o(G), oe = u($, 2), fe = u(o(oe), 2), he = o(fe), pe = o(he), Se = o(pe), p = u(o(Se)), w = o(p), j = u(Se), re = u(o(j)), ge = o(re), ye = o(ge), Ie = u(oe, 2), We = u(o(Ie), 2), _e = o(We), Te = o(_e), Ye = o(Te), Ct = u(o(Ye)), Nt = o(Ct), Lt = u(Ye), rt = u(o(Lt)), Ht = o(rt), es = u(Lt), Zs = u(o(es)), Qs = o(Zs), ts = u(es), Ds = u(o(ts)), ss = o(Ds), rs = u(ts), Es = u(o(rs)), as = o(Es), ns = u(rs), Ts = u(o(ns)), is = o(Ts), ls = u(ns), er = u(o(ls)), os = o(er), As = u(ls), tr = u(o(As)), Fs = o(tr), qt = u(Ie, 2), sr = u(o(qt), 2), rr = o(sr);
          X(
            (vs, Bt, kt, cs, Ps, ar) => {
              D(R, a(s).tfidf_stats?.total_terms ?? 0), D(U, a(s).tfidf_stats?.indexed_entries ?? 0), D(S, a(s).tfidf_stats?.entries_with_related ?? 0), D(y, a(s).tfidf_stats?.total_related_pairs ?? 0), D(N, vs), D(ee, a(s).image_stats?.total_images ?? 0), D(le, a(s).image_stats?.unindexed_images ?? 0), D(w, a(s).is_development), D(ye, a(s).app_hash), D(Nt, a(s).debug_info.go_version), D(Ht, a(s).debug_info.num_goroutine), D(Qs, Bt), D(ss, a(s).debug_info.uptime), D(as, kt), D(is, cs), D(os, Ps), D(Fs, a(s).debug_info.num_gc), D(rr, ar);
            },
            [
              () => a(s).tfidf_stats?.avg_score?.toFixed(4) ?? "0.0000",
              () => new Date(a(s).debug_info.start_time).toLocaleString(),
              () => n(a(s).debug_info.mem_alloc),
              () => n(a(s).debug_info.mem_total_alloc),
              () => n(a(s).debug_info.mem_sys),
              () => JSON.stringify(a(s).config, null, 2)
            ]
          ), M(h, F);
        };
        ae(
          b,
          (h) => {
            a(s) && h(g);
          },
          !0
        );
      }
      M(d, _);
    };
    ae(l, (d) => {
      ve.loading && !a(s) ? d(c) : d(v, !1);
    });
  }
  M(e, i), st();
}
var no = /* @__PURE__ */ I('<div class="stats-grid svelte-1y3ri9y"><div class="stat-card svelte-1y3ri9y"><div class="label svelte-1y3ri9y">キャッシュ数</div> <div class="value svelte-1y3ri9y"> </div></div> <div class="stat-card svelte-1y3ri9y"><div class="label svelte-1y3ri9y">合計サイズ</div> <div class="value svelte-1y3ri9y"> </div></div> <div class="stat-card svelte-1y3ri9y"><div class="label svelte-1y3ri9y">最古</div> <div class="value date svelte-1y3ri9y"> </div></div> <div class="stat-card svelte-1y3ri9y"><div class="label svelte-1y3ri9y">最新</div> <div class="value date svelte-1y3ri9y"> </div></div></div>'), io = /* @__PURE__ */ I('<tr><td class="svelte-1y3ri9y"><code class="svelte-1y3ri9y"> </code></td><td class="svelte-1y3ri9y"><code class="svelte-1y3ri9y"> </code></td></tr>'), lo = /* @__PURE__ */ I('<section class="metadata-section svelte-1y3ri9y"><h3>メタデータ</h3> <div class="table-container svelte-1y3ri9y"><table class="svelte-1y3ri9y"><thead><tr><th class="svelte-1y3ri9y">Key</th><th class="svelte-1y3ri9y">Value</th></tr></thead><tbody></tbody></table></div></section>'), oo = /* @__PURE__ */ I('<tr><td class="cache-key svelte-1y3ri9y"><code class="svelte-1y3ri9y"> </code></td><td class="svelte-1y3ri9y"> </td><td class="svelte-1y3ri9y"><small> </small></td><td class="svelte-1y3ri9y"> </td><td class="svelte-1y3ri9y"><button class="delete-button svelte-1y3ri9y">削除</button></td></tr>'), vo = /* @__PURE__ */ I('<div class="cache-list-page svelte-1y3ri9y"><div class="header svelte-1y3ri9y"><h2>ページキャッシュ管理</h2> <div class="actions"><button class="purge-button svelte-1y3ri9y">全キャッシュ削除</button></div></div> <!> <!> <div class="table-container svelte-1y3ri9y"><table class="svelte-1y3ri9y"><thead><tr><th> </th><th> </th><th class="svelte-1y3ri9y">Type</th><th> </th><th class="svelte-1y3ri9y">Actions</th></tr></thead><tbody></tbody></table></div></div>');
function co(e, t) {
  tt(t, !0);
  let s = /* @__PURE__ */ B(null), r = /* @__PURE__ */ B(we([])), n = /* @__PURE__ */ B(we([])), i = /* @__PURE__ */ B("created_at"), l = /* @__PURE__ */ B("desc");
  async function c() {
    try {
      const $ = await ve.get("/admin/api/cache/stats");
      k(s, $.stats, !0), k(r, $.metadata, !0);
    } catch ($) {
      console.error($);
    }
  }
  async function v() {
    try {
      const $ = await ve.get("/admin/api/cache/list");
      k(n, $.entries, !0);
    } catch ($) {
      console.error($);
    }
  }
  xt(() => {
    c(), v();
  });
  async function d() {
    if (confirm("全てのキャッシュを削除しますか？"))
      try {
        await ve.post("/admin/api/cache/purge", void 0), await c(), await v();
      } catch ($) {
        console.error($);
      }
  }
  async function _($) {
    try {
      await ve.post(`/admin/api/cache/purge?key=${encodeURIComponent($)}`, void 0), await c(), await v();
    } catch (A) {
      console.error(A);
    }
  }
  function b($) {
    if ($ === 0) return "0 B";
    const A = 1024, z = ["B", "KB", "MB", "GB", "TB"], H = Math.floor(Math.log($) / Math.log(A));
    return parseFloat(($ / Math.pow(A, H)).toFixed(2)) + " " + z[H];
  }
  const g = /* @__PURE__ */ Xe(() => [...a(n)].sort(($, A) => {
    let z, H;
    return a(i) === "key" ? (z = $.cache_key, H = A.cache_key) : a(i) === "size" ? (z = $.size?.Int64 ?? 0, H = A.size?.Int64 ?? 0) : (z = new Date($.created_at).getTime(), H = new Date(A.created_at).getTime()), z < H ? a(l) === "asc" ? -1 : 1 : z > H ? a(l) === "asc" ? 1 : -1 : 0;
  }));
  function h($) {
    a(i) === $ ? k(l, a(l) === "asc" ? "desc" : "asc", !0) : (k(i, $, !0), k(l, "desc"));
  }
  var F = vo(), x = o(F), f = u(o(x), 2), m = o(f);
  m.__click = d;
  var q = u(x, 2);
  {
    var C = ($) => {
      var A = no(), z = o(A), H = u(o(z), 2), V = o(H), se = u(z, 2), ee = u(o(se), 2), W = o(ee), G = u(se, 2), le = u(o(G), 2), oe = o(le), fe = u(G, 2), he = u(o(fe), 2), pe = o(he);
      X(
        (Se, p, w) => {
          D(V, a(s).total_count), D(W, Se), D(oe, p), D(pe, w);
        },
        [
          () => b(Number(a(s).total_size)),
          () => a(s).oldest_at ? new Date(String(a(s).oldest_at)).toLocaleString() : "-",
          () => a(s).newest_at ? new Date(String(a(s).newest_at)).toLocaleString() : "-"
        ]
      ), M($, A);
    };
    ae(q, ($) => {
      a(s) && $(C);
    });
  }
  var L = u(q, 2);
  {
    var R = ($) => {
      var A = lo(), z = u(o(A), 2), H = o(z), V = u(o(H));
      xe(V, 21, () => a(r), Ae, (se, ee) => {
        var W = io(), G = o(W), le = o(G), oe = o(le), fe = u(G), he = o(fe), pe = o(he);
        X(() => {
          D(oe, a(ee).key), D(pe, a(ee).value);
        }), M(se, W);
      }), M($, A);
    };
    ae(L, ($) => {
      a(r).length > 0 && $(R);
    });
  }
  var Y = u(L, 2), K = o(Y), U = o(K), ie = o(U), P = o(ie);
  P.__click = () => h("key");
  let S;
  var O = o(P), E = u(P);
  E.__click = () => h("size");
  let y;
  var J = o(E), Q = u(E, 2);
  Q.__click = () => h("created_at");
  let N;
  var ue = o(Q), de = u(U);
  xe(de, 21, () => a(g), Ae, ($, A) => {
    var z = oo(), H = o(z), V = o(H), se = o(V), ee = u(H), W = o(ee), G = u(ee), le = o(G), oe = o(le), fe = u(G), he = o(fe), pe = u(fe), Se = o(pe);
    Se.__click = () => _(a(A).cache_key), X(
      (p, w) => {
        D(se, a(A).cache_key), D(W, p), D(oe, a(A).content_type), D(he, w);
      },
      [
        () => b(a(A).size?.Int64 ?? 0),
        () => new Date(a(A).created_at).toLocaleString()
      ]
    ), M($, z);
  }), X(() => {
    S = Pe(P, 1, "sortable svelte-1y3ri9y", null, S, { active: a(i) === "key" }), D(O, `Key ${a(i) === "key" ? a(l) === "asc" ? "↑" : "↓" : ""}`), y = Pe(E, 1, "sortable svelte-1y3ri9y", null, y, { active: a(i) === "size" }), D(J, `Size ${a(i) === "size" ? a(l) === "asc" ? "↑" : "↓" : ""}`), N = Pe(Q, 1, "sortable svelte-1y3ri9y", null, N, { active: a(i) === "created_at" }), D(ue, `Created At ${a(i) === "created_at" ? a(l) === "asc" ? "↑" : "↓" : ""}`);
  }), M(e, F), st();
}
Qt(["click"]);
var uo = /* @__PURE__ */ I("<a> </a>"), fo = /* @__PURE__ */ I('<div class="admin-app svelte-1n46o8q"><header><div class="header-left svelte-1n46o8q"><h1 class="svelte-1n46o8q"><a href="/admin/" class="svelte-1n46o8q"><img src="/images/hanrangen-icon.svg" alt="Hanrangon" class="logo svelte-1n46o8q"/></a></h1> <div class="ci-badge svelte-1n46o8q"><a href="https://github.com/cho45/Hanrangon/actions/workflows/ci.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/ci.yml?branch=main&amp;label=ci&amp;style=flat-square" alt="CI Status" class="svelte-1n46o8q"/></a> <a href="https://github.com/cho45/Hanrangon/actions/workflows/lint.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/lint.yml?branch=main&amp;label=lint&amp;style=flat-square" alt="Lint Status" class="svelte-1n46o8q"/></a></div></div> <nav class="main-nav svelte-1n46o8q"><ul class="svelte-1n46o8q"><li><a href="/" class="svelte-1n46o8q">サイト確認</a></li> <li><a href="/logout" class="svelte-1n46o8q">ログアウト</a></li></ul></nav></header> <nav></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function _o(e, t) {
  tt(t, !0);
  let s = /* @__PURE__ */ B(we(window.location.pathname)), r = /* @__PURE__ */ B(we(new URLSearchParams(window.location.search)));
  xt(() => {
    const f = () => {
      k(s, window.location.pathname, !0), k(r, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", f), () => window.removeEventListener("popstate", f);
  });
  function n(f, m) {
    m && m.preventDefault(), window.history.pushState({}, "", f), k(s, window.location.pathname, !0), k(r, new URLSearchParams(window.location.search), !0);
  }
  const i = {
    "/admin/edit": {
      component: fl,
      page: "edit",
      getProps: (f) => ({ id: f, onSave: (m) => window.location.href = m })
    },
    "/admin/jobs": { component: Dl, page: "jobs", getProps: () => ({}) },
    "/admin/images": { component: Ql, page: "images", getProps: () => ({}) },
    "/admin/info": { component: ao, page: "info", getProps: () => ({}) },
    "/admin/cache": { component: co, page: "cache", getProps: () => ({}) },
    "/admin/": {
      component: Gi,
      page: "list",
      getProps: () => ({ onEdit: (f) => n(`/admin/edit?id=${f}`) })
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
  ], c = /* @__PURE__ */ Xe(() => {
    const f = a(r).get("id"), m = i[a(s)] ?? i["/admin/"];
    return {
      ...m,
      props: m.getProps(f),
      isActive: (q) => !(q.page !== m.page || q.exact && f)
    };
  }), v = /* @__PURE__ */ Xe(() => window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  var d = fo(), _ = o(d);
  let b;
  var g = u(_, 2);
  let h;
  xe(g, 21, () => l, Ae, (f, m) => {
    var q = uo();
    q.__click = (R) => n(a(m).path, R);
    let C;
    var L = o(q);
    X(
      (R) => {
        De(q, "href", a(m).path), C = Pe(q, 1, "svelte-1n46o8q", null, C, R), D(L, a(m).label);
      },
      [() => ({ active: a(c).isActive(a(m)) })]
    ), M(f, q);
  });
  var F = u(g, 2), x = o(F);
  Mi(x, () => a(c).component, (f, m) => {
    m(f, Ci(() => a(c).props));
  }), X(() => {
    b = Pe(_, 1, "svelte-1n46o8q", null, b, { "is-localhost": a(v) }), h = Pe(g, 1, "sub-nav svelte-1n46o8q", null, h, { "is-localhost": a(v) });
  }), M(e, d), st();
}
Qt(["click"]);
const gr = document.getElementById("admin-root");
gr && (gr.innerHTML = "", bi(_o, { target: gr }));
//# sourceMappingURL=admin-front.js.map
