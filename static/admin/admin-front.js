var kr = Array.isArray, mn = Array.prototype.indexOf, Ys = Array.from, gn = Object.defineProperty, xt = Object.getOwnPropertyDescriptor, bn = Object.getOwnPropertyDescriptors, wn = Object.prototype, yn = Array.prototype, ia = Object.getPrototypeOf, zr = Object.isExtensible;
function as(e) {
  return typeof e == "function";
}
const js = () => {
};
function xn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function la() {
  var e, t, s = new Promise((r, a) => {
    e = r, t = a;
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
const we = 2, Ns = 4, qs = 8, ca = 1 << 24, at = 16, nt = 32, Pt = 64, Mr = 128, je = 512, xe = 1024, Pe = 2048, it = 4096, Ne = 8192, _t = 16384, Sr = 32768, Dt = 65536, Jr = 1 << 17, va = 1 << 18, Bt = 1 << 19, kn = 1 << 20, et = 1 << 25, Tt = 32768, gr = 1 << 21, Er = 1 << 22, pt = 1 << 23, kt = /* @__PURE__ */ Symbol("$state"), Mn = /* @__PURE__ */ Symbol("legacy props"), Sn = /* @__PURE__ */ Symbol(""), Ht = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function En(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Dn() {
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
function Rn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function In() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function On() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Cn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Nn = 1, Ln = 2, ua = 4, Hn = 8, $n = 16, Yn = 1, jn = 2, be = /* @__PURE__ */ Symbol(), qn = "http://www.w3.org/1999/xhtml";
function Bn() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Un() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function fa(e) {
  return e === this.v;
}
function zn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function da(e) {
  return !zn(e, this.v);
}
let Le = null;
function Yt(e) {
  Le = e;
}
function lt(e, t = !1, s) {
  Le = {
    p: Le,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function ot(e) {
  var t = (
    /** @type {ComponentContext} */
    Le
  ), s = t.e;
  if (s !== null) {
    t.e = null;
    for (var r of s)
      Ra(r);
  }
  return t.i = !0, Le = t.p, /** @type {T} */
  {};
}
function ha() {
  return !0;
}
let wt = [];
function _a() {
  var e = wt;
  wt = [], xn(e);
}
function gt(e) {
  if (wt.length === 0 && !vs) {
    var t = wt;
    queueMicrotask(() => {
      t === wt && _a();
    });
  }
  wt.push(e);
}
function Jn() {
  for (; wt.length > 0; )
    _a();
}
function pa(e) {
  var t = Q;
  if (t === null)
    return X.f |= pt, e;
  if ((t.f & Sr) === 0) {
    if ((t.f & Mr) === 0)
      throw e;
    t.b.error(e);
  } else
    jt(e, t);
}
function jt(e, t) {
  for (; t !== null; ) {
    if ((t.f & Mr) !== 0)
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
const Xn = -7169;
function _e(e, t) {
  e.f = e.f & Xn | t;
}
function Dr(e) {
  (e.f & je) !== 0 || e.deps === null ? _e(e, xe) : _e(e, it);
}
function ma(e) {
  if (e !== null)
    for (const t of e)
      (t.f & we) === 0 || (t.f & Tt) === 0 || (t.f ^= Tt, ma(
        /** @type {Derived} */
        t.deps
      ));
}
function ga(e, t, s) {
  (e.f & Pe) !== 0 ? t.add(e) : (e.f & it) !== 0 && s.add(e), ma(e.deps), _e(e, xe);
}
const Ps = /* @__PURE__ */ new Set();
let Z = null, cs = null, qe = null, $e = [], Bs = null, br = !1, vs = !1;
class Ke {
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
    $e = [], cs = null, this.apply();
    var s = [], r = [];
    for (const a of t)
      this.#l(a, s, r);
    this.is_fork || this.#c(), this.is_deferred() ? (this.#o(r), this.#o(s)) : (cs = this, Z = null, Xr(r), Xr(s), cs = null, this.#i?.resolve()), qe = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #l(t, s, r) {
    t.f ^= xe;
    for (var a = t.first, n = null; a !== null; ) {
      var i = a.f, v = (i & (nt | Pt)) !== 0, o = v && (i & xe) !== 0, f = o || (i & Ne) !== 0 || this.skipped_effects.has(a);
      if (!f && a.fn !== null) {
        v ? a.f ^= xe : n !== null && (i & (Ns | qs | ca)) !== 0 ? n.b.defer_effect(a) : (i & Ns) !== 0 ? s.push(a) : gs(a) && ((i & at) !== 0 && this.#a.add(a), _s(a));
        var h = a.first;
        if (h !== null) {
          a = h;
          continue;
        }
      }
      var b = a.parent;
      for (a = a.next; a === null && b !== null; )
        b === n && (n = null), a = b.next, b = b.parent;
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #o(t) {
    for (var s = 0; s < t.length; s += 1)
      ga(t[s], this.#a, this.#s);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, s) {
    s !== be && !this.previous.has(t) && this.previous.set(t, s), (t.f & pt) === 0 && (this.current.set(t, t.v), qe?.set(t, t.v));
  }
  activate() {
    Z = this, this.apply();
  }
  deactivate() {
    Z === this && (Z = null, qe = null);
  }
  flush() {
    if (this.activate(), $e.length > 0) {
      if (ba(), Z !== null && Z !== this)
        return;
    } else this.#t === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
  }
  #c() {
    if (this.#n === 0) {
      for (const t of this.#e) t();
      this.#e.clear();
    }
    this.#t === 0 && this.#v();
  }
  #v() {
    if (Ps.size > 1) {
      this.previous.clear();
      var t = qe, s = !0;
      for (const a of Ps) {
        if (a === this) {
          s = !1;
          continue;
        }
        const n = [];
        for (const [v, o] of this.current) {
          if (a.current.has(v))
            if (s && o !== a.current.get(v))
              a.current.set(v, o);
            else
              continue;
          n.push(v);
        }
        if (n.length === 0)
          continue;
        const i = [...a.current.keys()].filter((v) => !this.current.has(v));
        if (i.length > 0) {
          var r = $e;
          $e = [];
          const v = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
          for (const f of n)
            wa(f, i, v, o);
          if ($e.length > 0) {
            Z = a, a.apply();
            for (const f of $e)
              a.#l(f, [], []);
            a.deactivate();
          }
          $e = r;
        }
      }
      Z = null, qe = t;
    }
    this.committed = !0, Ps.delete(this);
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
      this.#s.delete(t), _e(t, Pe), rt(t);
    for (const t of this.#s)
      _e(t, it), rt(t);
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
    if (Z === null) {
      const t = Z = new Ke();
      Ps.add(Z), vs || Ke.enqueue(() => {
        Z === t && t.flush();
      });
    }
    return Z;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    gt(t);
  }
  apply() {
  }
}
function Kn(e) {
  var t = vs;
  vs = !0;
  try {
    for (var s; ; ) {
      if (Jn(), $e.length === 0 && (Z?.flush(), $e.length === 0))
        return Bs = null, /** @type {T} */
        s;
      ba();
    }
  } finally {
    vs = t;
  }
}
function ba() {
  var e = St;
  br = !0;
  var t = null;
  try {
    var s = 0;
    for (Hs(!0); $e.length > 0; ) {
      var r = Ke.ensure();
      if (s++ > 1e3) {
        var a, n;
        Vn();
      }
      r.process($e), mt.clear();
    }
  } finally {
    br = !1, Hs(e), Bs = null;
  }
}
function Vn() {
  try {
    Pn();
  } catch (e) {
    jt(e, Bs);
  }
}
let Qe = null;
function Xr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var s = 0; s < t; ) {
      var r = e[s++];
      if ((r.f & (_t | Ne)) === 0 && gs(r) && (Qe = /* @__PURE__ */ new Set(), _s(r), r.deps === null && r.first === null && r.nodes === null && (r.teardown === null && r.ac === null ? La(r) : r.fn = null), Qe?.size > 0)) {
        mt.clear();
        for (const a of Qe) {
          if ((a.f & (_t | Ne)) !== 0) continue;
          const n = [a];
          let i = a.parent;
          for (; i !== null; )
            Qe.has(i) && (Qe.delete(i), n.push(i)), i = i.parent;
          for (let v = n.length - 1; v >= 0; v--) {
            const o = n[v];
            (o.f & (_t | Ne)) === 0 && _s(o);
          }
        }
        Qe.clear();
      }
    }
    Qe = null;
  }
}
function wa(e, t, s, r) {
  if (!s.has(e) && (s.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const n = a.f;
      (n & we) !== 0 ? wa(
        /** @type {Derived} */
        a,
        t,
        s,
        r
      ) : (n & (Er | at)) !== 0 && (n & Pe) === 0 && ya(a, t, r) && (_e(a, Pe), rt(
        /** @type {Effect} */
        a
      ));
    }
}
function ya(e, t, s) {
  const r = s.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (t.includes(a))
        return !0;
      if ((a.f & we) !== 0 && ya(
        /** @type {Derived} */
        a,
        t,
        s
      ))
        return s.set(
          /** @type {Derived} */
          a,
          !0
        ), !0;
    }
  return s.set(e, !1), !1;
}
function rt(e) {
  for (var t = Bs = e; t.parent !== null; ) {
    t = t.parent;
    var s = t.f;
    if (br && t === Q && (s & at) !== 0 && (s & va) === 0)
      return;
    if ((s & (Pt | nt)) !== 0) {
      if ((s & xe) === 0) return;
      t.f ^= xe;
    }
  }
  $e.push(t);
}
function Gn(e) {
  let t = 0, s = At(0), r;
  return () => {
    Rr() && (l(s), Js(() => (t === 0 && (r = Ks(() => e(() => us(s)))), t += 1, () => {
      gt(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, us(s));
      });
    })));
  };
}
var Wn = Dt | Bt | Mr;
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
  #c = null;
  #v = 0;
  #u = 0;
  #d = !1;
  /** @type {Set<Effect>} */
  #h = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #_ = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #f = null;
  #w = Gn(() => (this.#f = At(this.#v), () => {
    this.#f = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, s, r) {
    this.#e = t, this.#t = s, this.#n = r, this.parent = /** @type {Effect} */
    Q.b, this.is_pending = !!this.#t.pending, this.#i = Xs(() => {
      Q.b = this;
      {
        var a = this.#g();
        try {
          this.#a = Ye(() => r(a));
        } catch (n) {
          this.error(n);
        }
        this.#u > 0 ? this.#m() : this.is_pending = !1;
      }
      return () => {
        this.#c?.remove();
      };
    }, Wn);
  }
  #y() {
    try {
      this.#a = Ye(() => this.#n(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  #x() {
    const t = this.#t.pending;
    t && (this.#s = Ye(() => t(this.#e)), Ke.enqueue(() => {
      var s = this.#g();
      this.#a = this.#p(() => (Ke.ensure(), Ye(() => this.#n(s)))), this.#u > 0 ? this.#m() : (Mt(
        /** @type {Effect} */
        this.#s,
        () => {
          this.#s = null;
        }
      ), this.is_pending = !1);
    }));
  }
  #g() {
    var t = this.#e;
    return this.is_pending && (this.#c = tt(), this.#e.before(this.#c), t = this.#c), t;
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ga(t, this.#h, this.#_);
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
    var s = Q, r = X, a = Le;
    Ve(this.#i), Ae(this.#i), Yt(this.#i.ctx);
    try {
      return t();
    } catch (n) {
      return pa(n), null;
    } finally {
      Ve(s), Ae(r), Yt(a);
    }
  }
  #m() {
    const t = (
      /** @type {(anchor: Node) => void} */
      this.#t.pending
    );
    this.#a !== null && (this.#o = document.createDocumentFragment(), this.#o.append(
      /** @type {TemplateNode} */
      this.#c
    ), Ya(this.#a, this.#o)), this.#s === null && (this.#s = Ye(() => t(this.#e)));
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
      for (const s of this.#h)
        _e(s, Pe), rt(s);
      for (const s of this.#_)
        _e(s, it), rt(s);
      this.#h.clear(), this.#_.clear(), this.#s && Mt(this.#s, () => {
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
    this.#b(t), this.#v += t, this.#f && qt(this.#f, this.#v);
  }
  get_effect_pending() {
    return this.#w(), l(
      /** @type {Source<number>} */
      this.#f
    );
  }
  /** @param {unknown} error */
  error(t) {
    var s = this.#t.onerror;
    let r = this.#t.failed;
    if (this.#d || !s && !r)
      throw t;
    this.#a && (Fe(this.#a), this.#a = null), this.#s && (Fe(this.#s), this.#s = null), this.#l && (Fe(this.#l), this.#l = null);
    var a = !1, n = !1;
    const i = () => {
      if (a) {
        Un();
        return;
      }
      a = !0, n && Cn(), Ke.ensure(), this.#v = 0, this.#l !== null && Mt(this.#l, () => {
        this.#l = null;
      }), this.is_pending = this.has_pending_snippet(), this.#a = this.#p(() => (this.#d = !1, Ye(() => this.#n(this.#e)))), this.#u > 0 ? this.#m() : this.is_pending = !1;
    };
    var v = X;
    try {
      Ae(null), n = !0, s?.(t, i), n = !1;
    } catch (o) {
      jt(o, this.#i && this.#i.parent);
    } finally {
      Ae(v);
    }
    r && gt(() => {
      this.#l = this.#p(() => {
        Ke.ensure(), this.#d = !0;
        try {
          return Ye(() => {
            r(
              this.#e,
              () => t,
              () => i
            );
          });
        } catch (o) {
          return jt(
            o,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        } finally {
          this.#d = !1;
        }
      });
    });
  }
}
function ei(e, t, s, r) {
  const a = Tr;
  if (s.length === 0 && e.length === 0) {
    r(t.map(a));
    return;
  }
  var n = Z, i = (
    /** @type {Effect} */
    Q
  ), v = ti();
  function o() {
    Promise.all(s.map((f) => /* @__PURE__ */ si(f))).then((f) => {
      v();
      try {
        r([...t.map(a), ...f]);
      } catch (h) {
        (i.f & _t) === 0 && jt(h, i);
      }
      n?.deactivate(), Ls();
    }).catch((f) => {
      jt(f, i);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    v();
    try {
      return o();
    } finally {
      n?.deactivate(), Ls();
    }
  }) : o();
}
function ti() {
  var e = Q, t = X, s = Le, r = Z;
  return function(n = !0) {
    Ve(e), Ae(t), Yt(s), n && r?.activate();
  };
}
function Ls() {
  Ve(null), Ae(null), Yt(null);
}
// @__NO_SIDE_EFFECTS__
function Tr(e) {
  var t = we | Pe, s = X !== null && (X.f & we) !== 0 ? (
    /** @type {Derived} */
    X
  ) : null;
  return Q !== null && (Q.f |= Bt), {
    ctx: Le,
    deps: null,
    effects: null,
    equals: fa,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      be
    ),
    wv: 0,
    parent: s ?? Q,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function si(e, t, s) {
  let r = (
    /** @type {Effect | null} */
    Q
  );
  r === null && Dn();
  var a = (
    /** @type {Boundary} */
    r.b
  ), n = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = At(
    /** @type {V} */
    be
  ), v = !X, o = /* @__PURE__ */ new Map();
  return fi(() => {
    var f = la();
    n = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).then(() => {
        h === Z && h.committed && h.deactivate(), Ls();
      });
    } catch (_) {
      f.reject(_), Ls();
    }
    var h = (
      /** @type {Batch} */
      Z
    );
    if (v) {
      var b = a.is_rendered();
      a.update_pending_count(1), h.increment(b), o.get(h)?.reject(Ht), o.delete(h), o.set(h, f);
    }
    const m = (_, T = void 0) => {
      if (h.activate(), T)
        T !== Ht && (i.f |= pt, qt(i, T));
      else {
        (i.f & pt) !== 0 && (i.f ^= pt), qt(i, _);
        for (const [w, u] of o) {
          if (o.delete(w), w === h) break;
          u.reject(Ht);
        }
      }
      v && (a.update_pending_count(-1), h.decrement(b));
    };
    f.promise.then(m, (_) => m(null, _ || "unknown"));
  }), zs(() => {
    for (const f of o.values())
      f.reject(Ht);
  }), new Promise((f) => {
    function h(b) {
      function m() {
        b === n ? f(i) : h(n);
      }
      b.then(m, m);
    }
    h(n);
  });
}
// @__NO_SIDE_EFFECTS__
function dt(e) {
  const t = /* @__PURE__ */ Tr(e);
  return ja(t), t;
}
// @__NO_SIDE_EFFECTS__
function Ar(e) {
  const t = /* @__PURE__ */ Tr(e);
  return t.equals = da, t;
}
function xa(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var s = 0; s < t.length; s += 1)
      Fe(
        /** @type {Effect} */
        t[s]
      );
  }
}
function ri(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & we) === 0)
      return (t.f & _t) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Fr(e) {
  var t, s = Q;
  Ve(ri(e));
  try {
    e.f &= ~Tt, xa(e), t = za(e);
  } finally {
    Ve(s);
  }
  return t;
}
function ka(e) {
  var t = Fr(e);
  if (!e.equals(t) && (e.wv = Ba(), (!Z?.is_fork || e.deps === null) && (e.v = t, e.deps === null))) {
    _e(e, xe);
    return;
  }
  Ft || (qe !== null ? (Rr() || Z?.is_fork) && qe.set(e, t) : Dr(e));
}
let wr = /* @__PURE__ */ new Set();
const mt = /* @__PURE__ */ new Map();
let Ma = !1;
function At(e, t) {
  var s = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: fa,
    rv: 0,
    wv: 0
  };
  return s;
}
// @__NO_SIDE_EFFECTS__
function L(e, t) {
  const s = At(e);
  return ja(s), s;
}
// @__NO_SIDE_EFFECTS__
function ai(e, t = !1, s = !0) {
  const r = At(e);
  return t || (r.equals = da), r;
}
function k(e, t, s = !1) {
  X !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Ue || (X.f & Jr) !== 0) && ha() && (X.f & (we | at | Er | Jr)) !== 0 && !st?.includes(e) && On();
  let r = s ? ye(t) : t;
  return qt(e, r);
}
function qt(e, t) {
  if (!e.equals(t)) {
    var s = e.v;
    Ft ? mt.set(e, t) : mt.set(e, s), e.v = t;
    var r = Ke.ensure();
    if (r.capture(e, s), (e.f & we) !== 0) {
      const a = (
        /** @type {Derived} */
        e
      );
      (e.f & Pe) !== 0 && Fr(a), Dr(a);
    }
    e.wv = Ba(), Sa(e, Pe), Q !== null && (Q.f & xe) !== 0 && (Q.f & (nt | Pt)) === 0 && (He === null ? hi([e]) : He.push(e)), !r.is_fork && wr.size > 0 && !Ma && ni();
  }
  return t;
}
function ni() {
  Ma = !1;
  var e = St;
  Hs(!0);
  const t = Array.from(wr);
  try {
    for (const s of t)
      (s.f & xe) !== 0 && _e(s, it), gs(s) && _s(s);
  } finally {
    Hs(e);
  }
  wr.clear();
}
function us(e) {
  k(e, e.v + 1);
}
function Sa(e, t) {
  var s = e.reactions;
  if (s !== null)
    for (var r = s.length, a = 0; a < r; a++) {
      var n = s[a], i = n.f, v = (i & Pe) === 0;
      if (v && _e(n, t), (i & we) !== 0) {
        var o = (
          /** @type {Derived} */
          n
        );
        qe?.delete(o), (i & Tt) === 0 && (i & je && (n.f |= Tt), Sa(o, it));
      } else v && ((i & at) !== 0 && Qe !== null && Qe.add(
        /** @type {Effect} */
        n
      ), rt(
        /** @type {Effect} */
        n
      ));
    }
}
function ye(e) {
  if (typeof e != "object" || e === null || kt in e)
    return e;
  const t = ia(e);
  if (t !== wn && t !== yn)
    return e;
  var s = /* @__PURE__ */ new Map(), r = kr(e), a = /* @__PURE__ */ L(0), n = Et, i = (v) => {
    if (Et === n)
      return v();
    var o = X, f = Et;
    Ae(null), Zr(n);
    var h = v();
    return Ae(o), Zr(f), h;
  };
  return r && s.set("length", /* @__PURE__ */ L(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(v, o, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && Rn();
        var h = s.get(o);
        return h === void 0 ? h = i(() => {
          var b = /* @__PURE__ */ L(f.value);
          return s.set(o, b), b;
        }) : k(h, f.value, !0), !0;
      },
      deleteProperty(v, o) {
        var f = s.get(o);
        if (f === void 0) {
          if (o in v) {
            const h = i(() => /* @__PURE__ */ L(be));
            s.set(o, h), us(a);
          }
        } else
          k(f, be), us(a);
        return !0;
      },
      get(v, o, f) {
        if (o === kt)
          return e;
        var h = s.get(o), b = o in v;
        if (h === void 0 && (!b || xt(v, o)?.writable) && (h = i(() => {
          var _ = ye(b ? v[o] : be), T = /* @__PURE__ */ L(_);
          return T;
        }), s.set(o, h)), h !== void 0) {
          var m = l(h);
          return m === be ? void 0 : m;
        }
        return Reflect.get(v, o, f);
      },
      getOwnPropertyDescriptor(v, o) {
        var f = Reflect.getOwnPropertyDescriptor(v, o);
        if (f && "value" in f) {
          var h = s.get(o);
          h && (f.value = l(h));
        } else if (f === void 0) {
          var b = s.get(o), m = b?.v;
          if (b !== void 0 && m !== be)
            return {
              enumerable: !0,
              configurable: !0,
              value: m,
              writable: !0
            };
        }
        return f;
      },
      has(v, o) {
        if (o === kt)
          return !0;
        var f = s.get(o), h = f !== void 0 && f.v !== be || Reflect.has(v, o);
        if (f !== void 0 || Q !== null && (!h || xt(v, o)?.writable)) {
          f === void 0 && (f = i(() => {
            var m = h ? ye(v[o]) : be, _ = /* @__PURE__ */ L(m);
            return _;
          }), s.set(o, f));
          var b = l(f);
          if (b === be)
            return !1;
        }
        return h;
      },
      set(v, o, f, h) {
        var b = s.get(o), m = o in v;
        if (r && o === "length")
          for (var _ = f; _ < /** @type {Source<number>} */
          b.v; _ += 1) {
            var T = s.get(_ + "");
            T !== void 0 ? k(T, be) : _ in v && (T = i(() => /* @__PURE__ */ L(be)), s.set(_ + "", T));
          }
        if (b === void 0)
          (!m || xt(v, o)?.writable) && (b = i(() => /* @__PURE__ */ L(void 0)), k(b, ye(f)), s.set(o, b));
        else {
          m = b.v !== be;
          var w = i(() => ye(f));
          k(b, w);
        }
        var u = Reflect.getOwnPropertyDescriptor(v, o);
        if (u?.set && u.set.call(h, f), !m) {
          if (r && typeof o == "string") {
            var g = (
              /** @type {Source<number>} */
              s.get("length")
            ), N = Number(o);
            Number.isInteger(N) && N >= g.v && k(g, N + 1);
          }
          us(a);
        }
        return !0;
      },
      ownKeys(v) {
        l(a);
        var o = Reflect.ownKeys(v).filter((b) => {
          var m = s.get(b);
          return m === void 0 || m.v !== be;
        });
        for (var [f, h] of s)
          h.v !== be && !(f in v) && o.push(f);
        return o;
      },
      setPrototypeOf() {
        In();
      }
    }
  );
}
function Kr(e) {
  try {
    if (e !== null && typeof e == "object" && kt in e)
      return e[kt];
  } catch {
  }
  return e;
}
function Ea(e, t) {
  return Object.is(Kr(e), Kr(t));
}
var Vr, Da, Ta, Aa;
function ii() {
  if (Vr === void 0) {
    Vr = window, Da = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, s = Text.prototype;
    Ta = xt(t, "firstChild").get, Aa = xt(t, "nextSibling").get, zr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), zr(s) && (s.__t = void 0);
  }
}
function tt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function ht(e) {
  return (
    /** @type {TemplateNode | null} */
    Ta.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function ms(e) {
  return (
    /** @type {TemplateNode | null} */
    Aa.call(e)
  );
}
function c(e, t) {
  return /* @__PURE__ */ ht(e);
}
function Be(e, t = !1) {
  {
    var s = /* @__PURE__ */ ht(e);
    return s instanceof Comment && s.data === "" ? /* @__PURE__ */ ms(s) : s;
  }
}
function d(e, t = 1, s = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ ms(r);
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
function Us(e) {
  var t = X, s = Q;
  Ae(null), Ve(null);
  try {
    return e();
  } finally {
    Ae(t), Ve(s);
  }
}
function Pr(e, t, s, r = s) {
  e.addEventListener(t, () => Us(s));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), r(!0);
  } : e.__on_r = () => r(!0), oi();
}
function ci(e) {
  Q === null && (X === null && Fn(), An()), Ft && Tn();
}
function vi(e, t) {
  var s = t.last;
  s === null ? t.last = t.first = e : (s.next = e, e.prev = s, t.last = e);
}
function ct(e, t, s) {
  var r = Q;
  r !== null && (r.f & Ne) !== 0 && (e |= Ne);
  var a = {
    ctx: Le,
    deps: null,
    nodes: null,
    f: e | Pe | je,
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
      _s(a), a.f |= Sr;
    } catch (v) {
      throw Fe(a), v;
    }
  else t !== null && rt(a);
  var n = a;
  if (s && n.deps === null && n.teardown === null && n.nodes === null && n.first === n.last && // either `null`, or a singular child
  (n.f & Bt) === 0 && (n = n.first, (e & at) !== 0 && (e & Dt) !== 0 && n !== null && (n.f |= Dt)), n !== null && (n.parent = r, r !== null && vi(n, r), X !== null && (X.f & we) !== 0 && (e & Pt) === 0)) {
    var i = (
      /** @type {Derived} */
      X
    );
    (i.effects ??= []).push(n);
  }
  return a;
}
function Rr() {
  return X !== null && !Ue;
}
function zs(e) {
  const t = ct(qs, null, !1);
  return _e(t, xe), t.teardown = e, t;
}
function Pa(e) {
  ci();
  var t = (
    /** @type {Effect} */
    Q.f
  ), s = !X && (t & nt) !== 0 && (t & Sr) === 0;
  if (s) {
    var r = (
      /** @type {ComponentContext} */
      Le
    );
    (r.e ??= []).push(e);
  } else
    return Ra(e);
}
function Ra(e) {
  return ct(Ns | kn, e, !1);
}
function ui(e) {
  Ke.ensure();
  const t = ct(Pt | Bt, e, !0);
  return (s = {}) => new Promise((r) => {
    s.outro ? Mt(t, () => {
      Fe(t), r(void 0);
    }) : (Fe(t), r(void 0));
  });
}
function Ia(e) {
  return ct(Ns, e, !1);
}
function fi(e) {
  return ct(Er | Bt, e, !0);
}
function Js(e, t = 0) {
  return ct(qs | t, e, !0);
}
function K(e, t = [], s = [], r = []) {
  ei(r, t, s, (a) => {
    ct(qs, () => e(...a.map(l)), !0);
  });
}
function Xs(e, t = 0) {
  var s = ct(at | t, e, !0);
  return s;
}
function Ye(e) {
  return ct(nt | Bt, e, !0);
}
function Oa(e) {
  var t = e.teardown;
  if (t !== null) {
    const s = Ft, r = X;
    Wr(!0), Ae(null);
    try {
      t.call(null);
    } finally {
      Wr(s), Ae(r);
    }
  }
}
function Ca(e, t = !1) {
  var s = e.first;
  for (e.first = e.last = null; s !== null; ) {
    const a = s.ac;
    a !== null && Us(() => {
      a.abort(Ht);
    });
    var r = s.next;
    (s.f & Pt) !== 0 ? s.parent = null : Fe(s, t), s = r;
  }
}
function di(e) {
  for (var t = e.first; t !== null; ) {
    var s = t.next;
    (t.f & nt) === 0 && Fe(t), t = s;
  }
}
function Fe(e, t = !0) {
  var s = !1;
  (t || (e.f & va) !== 0) && e.nodes !== null && e.nodes.end !== null && (Na(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), s = !0), Ca(e, t && !s), $s(e, 0), _e(e, _t);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const n of r)
      n.stop();
  Oa(e);
  var a = e.parent;
  a !== null && a.first !== null && La(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Na(e, t) {
  for (; e !== null; ) {
    var s = e === t ? null : /* @__PURE__ */ ms(e);
    e.remove(), e = s;
  }
}
function La(e) {
  var t = e.parent, s = e.prev, r = e.next;
  s !== null && (s.next = r), r !== null && (r.prev = s), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = s));
}
function Mt(e, t, s = !0) {
  var r = [];
  Ha(e, r, !0);
  var a = () => {
    s && Fe(e), t && t();
  }, n = r.length;
  if (n > 0) {
    var i = () => --n || a();
    for (var v of r)
      v.out(i);
  } else
    a();
}
function Ha(e, t, s) {
  if ((e.f & Ne) === 0) {
    e.f ^= Ne;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const v of r)
        (v.is_global || s) && t.push(v);
    for (var a = e.first; a !== null; ) {
      var n = a.next, i = (a.f & Dt) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (a.f & nt) !== 0 && (e.f & at) !== 0;
      Ha(a, t, i ? s : !1), a = n;
    }
  }
}
function Ir(e) {
  $a(e, !0);
}
function $a(e, t) {
  if ((e.f & Ne) !== 0) {
    e.f ^= Ne, (e.f & xe) === 0 && (_e(e, Pe), rt(e));
    for (var s = e.first; s !== null; ) {
      var r = s.next, a = (s.f & Dt) !== 0 || (s.f & nt) !== 0;
      $a(s, a ? t : !1), s = r;
    }
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const i of n)
        (i.is_global || t) && i.in();
  }
}
function Ya(e, t) {
  if (e.nodes)
    for (var s = e.nodes.start, r = e.nodes.end; s !== null; ) {
      var a = s === r ? null : /* @__PURE__ */ ms(s);
      t.append(s), s = a;
    }
}
let St = !1;
function Hs(e) {
  St = e;
}
let Ft = !1;
function Wr(e) {
  Ft = e;
}
let X = null, Ue = !1;
function Ae(e) {
  X = e;
}
let Q = null;
function Ve(e) {
  Q = e;
}
let st = null;
function ja(e) {
  X !== null && (st === null ? st = [e] : st.push(e));
}
let ke = null, Oe = 0, He = null;
function hi(e) {
  He = e;
}
let qa = 1, hs = 0, Et = hs;
function Zr(e) {
  Et = e;
}
function Ba() {
  return ++qa;
}
function gs(e) {
  var t = e.f;
  if ((t & Pe) !== 0)
    return !0;
  if (t & we && (e.f &= ~Tt), (t & it) !== 0) {
    for (var s = (
      /** @type {Value[]} */
      e.deps
    ), r = s.length, a = 0; a < r; a++) {
      var n = s[a];
      if (gs(
        /** @type {Derived} */
        n
      ) && ka(
        /** @type {Derived} */
        n
      ), n.wv > e.wv)
        return !0;
    }
    (t & je) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    qe === null && _e(e, xe);
  }
  return !1;
}
function Ua(e, t, s = !0) {
  var r = e.reactions;
  if (r !== null && !st?.includes(e))
    for (var a = 0; a < r.length; a++) {
      var n = r[a];
      (n.f & we) !== 0 ? Ua(
        /** @type {Derived} */
        n,
        t,
        !1
      ) : t === n && (s ? _e(n, Pe) : (n.f & xe) !== 0 && _e(n, it), rt(
        /** @type {Effect} */
        n
      ));
    }
}
function za(e) {
  var t = ke, s = Oe, r = He, a = X, n = st, i = Le, v = Ue, o = Et, f = e.f;
  ke = /** @type {null | Value[]} */
  null, Oe = 0, He = null, X = (f & (nt | Pt)) === 0 ? e : null, st = null, Yt(e.ctx), Ue = !1, Et = ++hs, e.ac !== null && (Us(() => {
    e.ac.abort(Ht);
  }), e.ac = null);
  try {
    e.f |= gr;
    var h = (
      /** @type {Function} */
      e.fn
    ), b = h(), m = e.deps;
    if (ke !== null) {
      var _;
      if ($s(e, Oe), m !== null && Oe > 0)
        for (m.length = Oe + ke.length, _ = 0; _ < ke.length; _++)
          m[Oe + _] = ke[_];
      else
        e.deps = m = ke;
      if (Rr() && (e.f & je) !== 0)
        for (_ = Oe; _ < m.length; _++)
          (m[_].reactions ??= []).push(e);
    } else m !== null && Oe < m.length && ($s(e, Oe), m.length = Oe);
    if (ha() && He !== null && !Ue && m !== null && (e.f & (we | it | Pe)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      He.length; _++)
        Ua(
          He[_],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (hs++, He !== null && (r === null ? r = He : r.push(.../** @type {Source[]} */
    He))), (e.f & pt) !== 0 && (e.f ^= pt), b;
  } catch (T) {
    return pa(T);
  } finally {
    e.f ^= gr, ke = t, Oe = s, He = r, X = a, st = n, Yt(i), Ue = v, Et = o;
  }
}
function _i(e, t) {
  let s = t.reactions;
  if (s !== null) {
    var r = mn.call(s, e);
    if (r !== -1) {
      var a = s.length - 1;
      a === 0 ? s = t.reactions = null : (s[r] = s[a], s.pop());
    }
  }
  if (s === null && (t.f & we) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ke === null || !ke.includes(t))) {
    var n = (
      /** @type {Derived} */
      t
    );
    (n.f & je) !== 0 && (n.f ^= je, n.f &= ~Tt), Dr(n), xa(n), $s(n, 0);
  }
}
function $s(e, t) {
  var s = e.deps;
  if (s !== null)
    for (var r = t; r < s.length; r++)
      _i(e, s[r]);
}
function _s(e) {
  var t = e.f;
  if ((t & _t) === 0) {
    _e(e, xe);
    var s = Q, r = St;
    Q = e, St = !0;
    try {
      (t & (at | ca)) !== 0 ? di(e) : Ca(e), Oa(e);
      var a = za(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = qa;
      var n;
    } finally {
      St = r, Q = s;
    }
  }
}
async function Ja() {
  await Promise.resolve(), Kn();
}
function l(e) {
  var t = e.f, s = (t & we) !== 0;
  if (X !== null && !Ue) {
    var r = Q !== null && (Q.f & _t) !== 0;
    if (!r && !st?.includes(e)) {
      var a = X.deps;
      if ((X.f & gr) !== 0)
        e.rv < hs && (e.rv = hs, ke === null && a !== null && a[Oe] === e ? Oe++ : ke === null ? ke = [e] : ke.includes(e) || ke.push(e));
      else {
        (X.deps ??= []).push(e);
        var n = e.reactions;
        n === null ? e.reactions = [X] : n.includes(X) || n.push(X);
      }
    }
  }
  if (Ft && mt.has(e))
    return mt.get(e);
  if (s) {
    var i = (
      /** @type {Derived} */
      e
    );
    if (Ft) {
      var v = i.v;
      return ((i.f & xe) === 0 && i.reactions !== null || Ka(i)) && (v = Fr(i)), mt.set(i, v), v;
    }
    var o = (i.f & je) === 0 && !Ue && X !== null && (St || (X.f & je) !== 0), f = i.deps === null;
    gs(i) && (o && (i.f |= je), ka(i)), o && !f && Xa(i);
  }
  if (qe?.has(e))
    return qe.get(e);
  if ((e.f & pt) !== 0)
    throw e.v;
  return e.v;
}
function Xa(e) {
  if (e.deps !== null) {
    e.f |= je;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & we) !== 0 && (t.f & je) === 0 && Xa(
        /** @type {Derived} */
        t
      );
  }
}
function Ka(e) {
  if (e.v === be) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (mt.has(t) || (t.f & we) !== 0 && Ka(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Ks(e) {
  var t = Ue;
  try {
    return Ue = !0, e();
  } finally {
    Ue = t;
  }
}
const pi = ["touchstart", "touchmove"];
function mi(e) {
  return pi.includes(e);
}
const Va = /* @__PURE__ */ new Set(), yr = /* @__PURE__ */ new Set();
function gi(e, t, s, r = {}) {
  function a(n) {
    if (r.capture || is.call(t, n), !n.cancelBubble)
      return Us(() => s?.call(this, n));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? gt(() => {
    t.addEventListener(e, a, r);
  }) : t.addEventListener(e, a, r), a;
}
function Rs(e, t, s, r, a) {
  var n = { capture: r, passive: a }, i = gi(e, t, s, n);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && zs(() => {
    t.removeEventListener(e, i, n);
  });
}
function bs(e) {
  for (var t = 0; t < e.length; t++)
    Va.add(e[t]);
  for (var s of yr)
    s(e);
}
let Qr = null;
function is(e) {
  var t = this, s = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, a = e.composedPath?.() || [], n = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Qr = e;
  var i = 0, v = Qr === e && e.__root;
  if (v) {
    var o = a.indexOf(v);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var f = a.indexOf(t);
    if (f === -1)
      return;
    o <= f && (i = o);
  }
  if (n = /** @type {Element} */
  a[i] || e.target, n !== t) {
    gn(e, "currentTarget", {
      configurable: !0,
      get() {
        return n || s;
      }
    });
    var h = X, b = Q;
    Ae(null), Ve(null);
    try {
      for (var m, _ = []; n !== null; ) {
        var T = n.assignedSlot || n.parentNode || /** @type {any} */
        n.host || null;
        try {
          var w = n["__" + r];
          w != null && (!/** @type {any} */
          n.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === n) && w.call(n, e);
        } catch (u) {
          m ? _.push(u) : m = u;
        }
        if (e.cancelBubble || T === t || T === null)
          break;
        n = T;
      }
      if (m) {
        for (let u of _)
          queueMicrotask(() => {
            throw u;
          });
        throw m;
      }
    } finally {
      e.__root = t, delete e.currentTarget, Ae(h), Ve(b);
    }
  }
}
function Ga(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function ps(e, t) {
  var s = (
    /** @type {Effect} */
    Q
  );
  s.nodes === null && (s.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function O(e, t) {
  var s = (t & Yn) !== 0, r = (t & jn) !== 0, a, n = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = Ga(n ? e : "<!>" + e), s || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ ht(a)));
    var i = (
      /** @type {TemplateNode} */
      r || Da ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (s) {
      var v = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ht(i)
      ), o = (
        /** @type {TemplateNode} */
        i.lastChild
      );
      ps(v, o);
    } else
      ps(i, i);
    return i;
  };
}
function ns(e = "") {
  {
    var t = tt(e + "");
    return ps(t, t), t;
  }
}
function yt() {
  var e = document.createDocumentFragment(), t = document.createComment(""), s = tt();
  return e.append(t, s), ps(t, s), e;
}
function D(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function F(e, t) {
  var s = t == null ? "" : typeof t == "object" ? t + "" : t;
  s !== (e.__t ??= e.nodeValue) && (e.__t = s, e.nodeValue = s + "");
}
function bi(e, t) {
  return wi(e, t);
}
const Nt = /* @__PURE__ */ new Map();
function wi(e, { target: t, anchor: s, props: r = {}, events: a, context: n, intro: i = !0 }) {
  ii();
  var v = /* @__PURE__ */ new Set(), o = (b) => {
    for (var m = 0; m < b.length; m++) {
      var _ = b[m];
      if (!v.has(_)) {
        v.add(_);
        var T = mi(_);
        t.addEventListener(_, is, { passive: T });
        var w = Nt.get(_);
        w === void 0 ? (document.addEventListener(_, is, { passive: T }), Nt.set(_, 1)) : Nt.set(_, w + 1);
      }
    }
  };
  o(Ys(Va)), yr.add(o);
  var f = void 0, h = ui(() => {
    var b = s ?? t.appendChild(tt());
    return Zn(
      /** @type {TemplateNode} */
      b,
      {
        pending: () => {
        }
      },
      (m) => {
        if (n) {
          lt({});
          var _ = (
            /** @type {ComponentContext} */
            Le
          );
          _.c = n;
        }
        a && (r.$$events = a), f = e(m, r) || {}, n && ot();
      }
    ), () => {
      for (var m of v) {
        t.removeEventListener(m, is);
        var _ = (
          /** @type {number} */
          Nt.get(m)
        );
        --_ === 0 ? (document.removeEventListener(m, is), Nt.delete(m)) : Nt.set(m, _);
      }
      yr.delete(o), b !== s && b.parentNode?.removeChild(b);
    };
  });
  return yi.set(f, h), f;
}
let yi = /* @__PURE__ */ new WeakMap();
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
      Z
    );
    if (this.#e.has(t)) {
      var s = (
        /** @type {Key} */
        this.#e.get(t)
      ), r = this.#r.get(s);
      if (r)
        Ir(r), this.#n.delete(s);
      else {
        var a = this.#t.get(s);
        a && (this.#r.set(s, a.effect), this.#t.delete(s), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), r = a.effect);
      }
      for (const [n, i] of this.#e) {
        if (this.#e.delete(n), n === t)
          break;
        const v = this.#t.get(i);
        v && (Fe(v.effect), this.#t.delete(i));
      }
      for (const [n, i] of this.#r) {
        if (n === s || this.#n.has(n)) continue;
        const v = () => {
          if (Array.from(this.#e.values()).includes(n)) {
            var f = document.createDocumentFragment();
            Ya(i, f), f.append(tt()), this.#t.set(n, { effect: i, fragment: f });
          } else
            Fe(i);
          this.#n.delete(n), this.#r.delete(n);
        };
        this.#i || !r ? (this.#n.add(n), Mt(i, v, !1)) : v();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #s = (t) => {
    this.#e.delete(t);
    const s = Array.from(this.#e.values());
    for (const [r, a] of this.#t)
      s.includes(r) || (Fe(a.effect), this.#t.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, s) {
    var r = (
      /** @type {Batch} */
      Z
    ), a = Fa();
    if (s && !this.#r.has(t) && !this.#t.has(t))
      if (a) {
        var n = document.createDocumentFragment(), i = tt();
        n.append(i), this.#t.set(t, {
          effect: Ye(() => s(i)),
          fragment: n
        });
      } else
        this.#r.set(
          t,
          Ye(() => s(this.anchor))
        );
    if (this.#e.set(r, t), a) {
      for (const [v, o] of this.#r)
        v === t ? r.skipped_effects.delete(o) : r.skipped_effects.add(o);
      for (const [v, o] of this.#t)
        v === t ? r.skipped_effects.delete(o.effect) : r.skipped_effects.add(o.effect);
      r.oncommit(this.#a), r.ondiscard(this.#s);
    } else
      this.#a();
  }
}
function ne(e, t, s = !1) {
  var r = new Wa(e), a = s ? Dt : 0;
  function n(i, v) {
    r.ensure(i, v);
  }
  Xs(() => {
    var i = !1;
    t((v, o = !0) => {
      i = !0, n(o, v);
    }), i || n(!1, null);
  }, a);
}
function Ce(e, t) {
  return t;
}
function xi(e, t, s) {
  for (var r = [], a = t.length, n, i = t.length, v = 0; v < a; v++) {
    let b = t[v];
    Mt(
      b,
      () => {
        if (n) {
          if (n.pending.delete(b), n.done.add(b), n.pending.size === 0) {
            var m = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            xr(Ys(n.done)), m.delete(n), m.size === 0 && (e.outrogroups = null);
          }
        } else
          i -= 1;
      },
      !1
    );
  }
  if (i === 0) {
    var o = r.length === 0 && s !== null;
    if (o) {
      var f = (
        /** @type {Element} */
        s
      ), h = (
        /** @type {Element} */
        f.parentNode
      );
      li(h), h.append(f), e.items.clear();
    }
    xr(t, !o);
  } else
    n = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(n);
}
function xr(e, t = !0) {
  for (var s = 0; s < e.length; s++)
    Fe(e[s], t);
}
var ea;
function Me(e, t, s, r, a, n = null) {
  var i = e, v = /* @__PURE__ */ new Map(), o = (t & ua) !== 0;
  if (o) {
    var f = (
      /** @type {Element} */
      e
    );
    i = f.appendChild(tt());
  }
  var h = null, b = /* @__PURE__ */ Ar(() => {
    var g = s();
    return kr(g) ? g : g == null ? [] : Ys(g);
  }), m, _ = !0;
  function T() {
    u.fallback = h, ki(u, m, i, t, r), h !== null && (m.length === 0 ? (h.f & et) === 0 ? Ir(h) : (h.f ^= et, ls(h, null, i)) : Mt(h, () => {
      h = null;
    }));
  }
  var w = Xs(() => {
    m = /** @type {V[]} */
    l(b);
    for (var g = m.length, N = /* @__PURE__ */ new Set(), R = (
      /** @type {Batch} */
      Z
    ), C = Fa(), P = 0; P < g; P += 1) {
      var H = m[P], j = r(H, P), I = _ ? null : v.get(j);
      I ? (I.v && qt(I.v, H), I.i && qt(I.i, P), C && R.skipped_effects.delete(I.e)) : (I = Mi(
        v,
        _ ? i : ea ??= tt(),
        H,
        j,
        P,
        a,
        t,
        s
      ), _ || (I.e.f |= et), v.set(j, I)), N.add(j);
    }
    if (g === 0 && n && !h && (_ ? h = Ye(() => n(i)) : (h = Ye(() => n(ea ??= tt())), h.f |= et)), !_)
      if (C) {
        for (const [J, A] of v)
          N.has(J) || R.skipped_effects.add(A.e);
        R.oncommit(T), R.ondiscard(() => {
        });
      } else
        T();
    l(b);
  }), u = { effect: w, items: v, outrogroups: null, fallback: h };
  _ = !1;
}
function ki(e, t, s, r, a) {
  var n = (r & Hn) !== 0, i = t.length, v = e.items, o = e.effect.first, f, h = null, b, m = [], _ = [], T, w, u, g;
  if (n)
    for (g = 0; g < i; g += 1)
      T = t[g], w = a(T, g), u = /** @type {EachItem} */
      v.get(w).e, (u.f & et) === 0 && (u.nodes?.a?.measure(), (b ??= /* @__PURE__ */ new Set()).add(u));
  for (g = 0; g < i; g += 1) {
    if (T = t[g], w = a(T, g), u = /** @type {EachItem} */
    v.get(w).e, e.outrogroups !== null)
      for (const A of e.outrogroups)
        A.pending.delete(u), A.done.delete(u);
    if ((u.f & et) !== 0)
      if (u.f ^= et, u === o)
        ls(u, null, s);
      else {
        var N = h ? h.next : o;
        u === e.effect.last && (e.effect.last = u.prev), u.prev && (u.prev.next = u.next), u.next && (u.next.prev = u.prev), ft(e, h, u), ft(e, u, N), ls(u, N, s), h = u, m = [], _ = [], o = h.next;
        continue;
      }
    if ((u.f & Ne) !== 0 && (Ir(u), n && (u.nodes?.a?.unfix(), (b ??= /* @__PURE__ */ new Set()).delete(u))), u !== o) {
      if (f !== void 0 && f.has(u)) {
        if (m.length < _.length) {
          var R = _[0], C;
          h = R.prev;
          var P = m[0], H = m[m.length - 1];
          for (C = 0; C < m.length; C += 1)
            ls(m[C], R, s);
          for (C = 0; C < _.length; C += 1)
            f.delete(_[C]);
          ft(e, P.prev, H.next), ft(e, h, P), ft(e, H, R), o = R, h = H, g -= 1, m = [], _ = [];
        } else
          f.delete(u), ls(u, o, s), ft(e, u.prev, u.next), ft(e, u, h === null ? e.effect.first : h.next), ft(e, h, u), h = u;
        continue;
      }
      for (m = [], _ = []; o !== null && o !== u; )
        (f ??= /* @__PURE__ */ new Set()).add(o), _.push(o), o = o.next;
      if (o === null)
        continue;
    }
    (u.f & et) === 0 && m.push(u), h = u, o = u.next;
  }
  if (e.outrogroups !== null) {
    for (const A of e.outrogroups)
      A.pending.size === 0 && (xr(Ys(A.done)), e.outrogroups?.delete(A));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || f !== void 0) {
    var j = [];
    if (f !== void 0)
      for (u of f)
        (u.f & Ne) === 0 && j.push(u);
    for (; o !== null; )
      (o.f & Ne) === 0 && o !== e.fallback && j.push(o), o = o.next;
    var I = j.length;
    if (I > 0) {
      var J = (r & ua) !== 0 && i === 0 ? s : null;
      if (n) {
        for (g = 0; g < I; g += 1)
          j[g].nodes?.a?.measure();
        for (g = 0; g < I; g += 1)
          j[g].nodes?.a?.fix();
      }
      xi(e, j, J);
    }
  }
  n && gt(() => {
    if (b !== void 0)
      for (u of b)
        u.nodes?.a?.apply();
  });
}
function Mi(e, t, s, r, a, n, i, v) {
  var o = (i & Nn) !== 0 ? (i & $n) === 0 ? /* @__PURE__ */ ai(s, !1, !1) : At(s) : null, f = (i & Ln) !== 0 ? At(a) : null;
  return {
    v: o,
    i: f,
    e: Ye(() => (n(t, o ?? s, f ?? a, v), () => {
      e.delete(r);
    }))
  };
}
function ls(e, t, s) {
  if (e.nodes)
    for (var r = e.nodes.start, a = e.nodes.end, n = t && (t.f & et) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : s; r !== null; ) {
      var i = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ms(r)
      );
      if (n.before(r), r === a)
        return;
      r = i;
    }
}
function ft(e, t, s) {
  t === null ? e.effect.first = s : t.next = s, s === null ? e.effect.last = t : s.prev = t;
}
function ta(e, t, s = !1, r = !1, a = !1) {
  var n = e, i = "";
  K(() => {
    var v = (
      /** @type {Effect} */
      Q
    );
    if (i !== (i = t() ?? "") && (v.nodes !== null && (Na(
      v.nodes.start,
      /** @type {TemplateNode} */
      v.nodes.end
    ), v.nodes = null), i !== "")) {
      var o = i + "";
      s ? o = `<svg>${o}</svg>` : r && (o = `<math>${o}</math>`);
      var f = Ga(o);
      if ((s || r) && (f = /** @type {Element} */
      /* @__PURE__ */ ht(f)), ps(
        /** @type {TemplateNode} */
        /* @__PURE__ */ ht(f),
        /** @type {TemplateNode} */
        f.lastChild
      ), s || r)
        for (; /* @__PURE__ */ ht(f); )
          n.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ ht(f)
          );
      else
        n.before(f);
    }
  });
}
function Si(e, t, s) {
  var r = new Wa(e);
  Xs(() => {
    var a = t() ?? null;
    r.ensure(a, a && ((n) => s(n, a)));
  }, Dt);
}
const sa = [...` 	
\r\f \v\uFEFF`];
function Ei(e, t, s) {
  var r = e == null ? "" : "" + e;
  if (t && (r = r ? r + " " + t : t), s) {
    for (var a in s)
      if (s[a])
        r = r ? r + " " + a : a;
      else if (r.length)
        for (var n = a.length, i = 0; (i = r.indexOf(a, i)) >= 0; ) {
          var v = i + n;
          (i === 0 || sa.includes(r[i - 1])) && (v === r.length || sa.includes(r[v])) ? r = (i === 0 ? "" : r.substring(0, i)) + r.substring(v + 1) : i = v;
        }
  }
  return r === "" ? null : r;
}
function Di(e, t) {
  return e == null ? null : String(e);
}
function ze(e, t, s, r, a, n) {
  var i = e.__className;
  if (i !== s || i === void 0) {
    var v = Ei(s, r, n);
    v == null ? e.removeAttribute("class") : e.className = v, e.__className = s;
  } else if (n && a !== n)
    for (var o in n) {
      var f = !!n[o];
      (a == null || f !== !!a[o]) && e.classList.toggle(o, f);
    }
  return n;
}
function fs(e, t, s, r) {
  var a = e.__style;
  if (a !== t) {
    var n = Di(t);
    n == null ? e.removeAttribute("style") : e.style.cssText = n, e.__style = t;
  }
  return r;
}
function Za(e, t, s = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!kr(t))
      return Bn();
    for (var r of e.options)
      r.selected = t.includes(ds(r));
    return;
  }
  for (r of e.options) {
    var a = ds(r);
    if (Ea(a, t)) {
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
  }), zs(() => {
    t.disconnect();
  });
}
function Ai(e, t, s = t) {
  var r = /* @__PURE__ */ new WeakSet(), a = !0;
  Pr(e, "change", (n) => {
    var i = n ? "[selected]" : ":checked", v;
    if (e.multiple)
      v = [].map.call(e.querySelectorAll(i), ds);
    else {
      var o = e.querySelector(i) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      v = o && ds(o);
    }
    s(v), Z !== null && r.add(Z);
  }), Ia(() => {
    var n = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        cs ?? Z
      );
      if (r.has(i))
        return;
    }
    if (Za(e, n, a), a && n === void 0) {
      var v = e.querySelector(":checked");
      v !== null && (n = ds(v), s(n));
    }
    e.__value = n, a = !1;
  }), Ti(e);
}
function ds(e) {
  return "__value" in e ? e.__value : e.value;
}
const Fi = /* @__PURE__ */ Symbol("is custom element"), Pi = /* @__PURE__ */ Symbol("is html");
function Te(e, t, s, r) {
  var a = Ri(e);
  a[t] !== (a[t] = s) && (t === "loading" && (e[Sn] = s), s == null ? e.removeAttribute(t) : typeof s != "string" && Ii(e).includes(t) ? e[t] = s : e.setAttribute(t, s));
}
function Ri(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [Fi]: e.nodeName.includes("-"),
      [Pi]: e.namespaceURI === qn
    }
  );
}
var ra = /* @__PURE__ */ new Map();
function Ii(e) {
  var t = e.getAttribute("is") || e.nodeName, s = ra.get(t);
  if (s) return s;
  ra.set(t, s = []);
  for (var r, a = e, n = Element.prototype; n !== a; ) {
    r = bn(a);
    for (var i in r)
      r[i].set && s.push(i);
    a = ia(a);
  }
  return s;
}
function os(e, t, s = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Pr(e, "input", async (a) => {
    var n = a ? e.defaultValue : e.value;
    if (n = ur(e) ? fr(n) : n, s(n), Z !== null && r.add(Z), await Ja(), n !== (n = t())) {
      var i = e.selectionStart, v = e.selectionEnd, o = e.value.length;
      if (e.value = n ?? "", v !== null) {
        var f = e.value.length;
        i === v && v === o && f > o ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = i, e.selectionEnd = Math.min(v, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Ks(t) == null && e.value && (s(ur(e) ? fr(e.value) : e.value), Z !== null && r.add(Z)), Js(() => {
    var a = t();
    if (e === document.activeElement) {
      var n = (
        /** @type {Batch} */
        cs ?? Z
      );
      if (r.has(n))
        return;
    }
    ur(e) && a === fr(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
const vr = /* @__PURE__ */ new Set();
function Is(e, t, s, r, a = r) {
  var n = s.getAttribute("type") === "checkbox", i = e;
  if (t !== null)
    for (var v of t)
      i = i[v] ??= [];
  i.push(s), Pr(
    s,
    "change",
    () => {
      var o = s.__value;
      n && (o = Oi(i, o, s.checked)), a(o);
    },
    // TODO better default value handling
    () => a(n ? [] : null)
  ), Js(() => {
    var o = r();
    n ? (o = o || [], s.checked = o.includes(s.__value)) : s.checked = Ea(s.__value, o);
  }), zs(() => {
    var o = i.indexOf(s);
    o !== -1 && i.splice(o, 1);
  }), vr.has(i) || (vr.add(i), gt(() => {
    i.sort((o, f) => o.compareDocumentPosition(f) === 4 ? -1 : 1), vr.delete(i);
  })), gt(() => {
  });
}
function Oi(e, t, s) {
  for (var r = /* @__PURE__ */ new Set(), a = 0; a < e.length; a += 1)
    e[a].checked && r.add(e[a].__value);
  return s || r.delete(t), Array.from(r);
}
function ur(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function fr(e) {
  return e === "" ? null : +e;
}
function aa(e, t) {
  return e === t || e?.[kt] === t;
}
function Xe(e = {}, t, s, r) {
  return Ia(() => {
    var a, n;
    return Js(() => {
      a = n, n = r?.() || [], Ks(() => {
        e !== s(...n) && (t(e, ...n), a && aa(s(...a), e) && t(null, ...a));
      });
    }), () => {
      gt(() => {
        n && aa(s(...n), e) && t(null, ...n);
      });
    };
  }), e;
}
const Ci = {
  get(e, t) {
    let s = e.props.length;
    for (; s--; ) {
      let r = e.props[s];
      if (as(r) && (r = r()), typeof r == "object" && r !== null && t in r) return r[t];
    }
  },
  set(e, t, s) {
    let r = e.props.length;
    for (; r--; ) {
      let a = e.props[r];
      as(a) && (a = a());
      const n = xt(a, t);
      if (n && n.set)
        return n.set(s), !0;
    }
    return !1;
  },
  getOwnPropertyDescriptor(e, t) {
    let s = e.props.length;
    for (; s--; ) {
      let r = e.props[s];
      if (as(r) && (r = r()), typeof r == "object" && r !== null && t in r) {
        const a = xt(r, t);
        return a && !a.configurable && (a.configurable = !0), a;
      }
    }
  },
  has(e, t) {
    if (t === kt || t === Mn) return !1;
    for (let s of e.props)
      if (as(s) && (s = s()), s != null && t in s) return !0;
    return !1;
  },
  ownKeys(e) {
    const t = [];
    for (let s of e.props)
      if (as(s) && (s = s()), !!s) {
        for (const r in s)
          t.includes(r) || t.push(r);
        for (const r of Object.getOwnPropertySymbols(s))
          t.includes(r) || t.push(r);
      }
    return t;
  }
};
function Ni(...e) {
  return new Proxy({ props: e }, Ci);
}
function Qa(e, t, s, r) {
  var a = (
    /** @type {V} */
    r
  ), n = !0, i = () => (n && (n = !1, a = /** @type {V} */
  r), a), v;
  v = /** @type {V} */
  e[t], v === void 0 && r !== void 0 && (v = i());
  var o;
  return o = () => {
    var f = (
      /** @type {V} */
      e[t]
    );
    return f === void 0 ? i() : (n = !0, f);
  }, o;
}
function Rt(e) {
  Le === null && En(), Pa(() => {
    const t = Ks(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Li = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Li);
function Hi(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var dr = { exports: {} }, na;
function $i() {
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
      }, s = t.en_US, r = new a(s, 0, !1);
      e.exports = r, typeof Date.now != "function" && (Date.now = function() {
        return +/* @__PURE__ */ new Date();
      });
      function a(w, u, g) {
        var N = w || s, R = u || 0, C = g || !1, P = 0, H;
        function j(A, x) {
          var S;
          if (x) {
            if (S = x.getTime(), C) {
              var M = h(x);
              if (x = new Date(S + M + R), h(x) !== M) {
                var q = h(x);
                x = new Date(S + q + R);
              }
            }
          } else {
            var z = Date.now();
            z > P ? (P = z, H = new Date(P), S = P, C && (H = new Date(P + h(H) + R))) : S = P, x = H;
          }
          return I(A, x, N, S);
        }
        function I(A, x, S, z) {
          for (var M = "", q = null, ee = !1, te = A.length, pe = !1, ue = 0; ue < te; ue++) {
            var fe = A.charCodeAt(ue);
            if (ee === !0) {
              if (fe === 45) {
                q = "";
                continue;
              } else if (fe === 95) {
                q = " ";
                continue;
              } else if (fe === 48) {
                q = "0";
                continue;
              } else if (fe === 58) {
                pe && T("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), pe = !0;
                continue;
              }
              switch (fe) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  M += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  M += S.days[x.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  M += S.months[x.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  M += n(Math.floor(x.getFullYear() / 100), q);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  M += I(S.formats.D, x, S, z);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  M += I(S.formats.F, x, S, z);
                  break;
                // '00'
                // case 'H':
                case 72:
                  M += n(x.getHours(), q);
                  break;
                // '12'
                // case 'I':
                case 73:
                  M += n(v(x.getHours()), q);
                  break;
                // '000'
                // case 'L':
                case 76:
                  M += i(Math.floor(z % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  M += n(x.getMinutes(), q);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  M += x.getHours() < 12 ? S.am : S.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  M += I(S.formats.R, x, S, z);
                  break;
                // '00'
                // case 'S':
                case 83:
                  M += n(x.getSeconds(), q);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  M += I(S.formats.T, x, S, z);
                  break;
                // '00'
                // case 'U':
                case 85:
                  M += n(o(x, "sunday"), q);
                  break;
                // '00'
                // case 'W':
                case 87:
                  M += n(o(x, "monday"), q);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  M += I(S.formats.X, x, S, z);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  M += x.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (C && R === 0)
                    M += "GMT";
                  else {
                    var $ = b(x);
                    M += $ || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  M += S.shortDays[x.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  M += S.shortMonths[x.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  M += I(S.formats.c, x, S, z);
                  break;
                // '01'
                // case 'd':
                case 100:
                  M += n(x.getDate(), q);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  M += n(x.getDate(), q ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  M += S.shortMonths[x.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var se = new Date(x.getFullYear(), 0, 1), B = Math.ceil((x.getTime() - se.getTime()) / (1e3 * 60 * 60 * 24));
                  M += i(B);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  M += n(x.getHours(), q ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  M += n(v(x.getHours()), q ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  M += n(x.getMonth() + 1, q);
                  break;
                // '\n'
                // case 'n':
                case 110:
                  M += `
`;
                  break;
                // '1st'
                // case 'o':
                case 111:
                  var B = x.getDate();
                  S.ordinalSuffixes ? M += String(B) + (S.ordinalSuffixes[B - 1] || f(B)) : M += String(B) + f(B);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  M += x.getHours() < 12 ? S.AM : S.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  M += I(S.formats.r, x, S, z);
                  break;
                // '0'
                // case 's':
                case 115:
                  M += Math.floor(z / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  M += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var B = x.getDay();
                  M += B === 0 ? 7 : B;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  M += I(S.formats.v, x, S, z);
                  break;
                // '4'
                // case 'w':
                case 119:
                  M += x.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  M += I(S.formats.x, x, S, z);
                  break;
                // '70'
                // case 'y':
                case 121:
                  M += n(x.getFullYear() % 100, q);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (C && R === 0)
                    M += pe ? "+00:00" : "+0000";
                  else {
                    var W;
                    R !== 0 ? W = R / (60 * 1e3) : W = -x.getTimezoneOffset();
                    var oe = W < 0 ? "-" : "+", ae = pe ? ":" : "", V = Math.floor(Math.abs(W / 60)), G = Math.abs(W % 60);
                    M += oe + n(V) + ae + n(G);
                  }
                  break;
                default:
                  ee && (M += "%"), M += A[ue];
                  break;
              }
              q = null, ee = !1;
              continue;
            }
            if (fe === 37) {
              ee = !0;
              continue;
            }
            M += A[ue];
          }
          return M;
        }
        var J = j;
        return J.localize = function(A) {
          return new a(A || N, R, C);
        }, J.localizeByIdentifier = function(A) {
          var x = t[A];
          return x ? J.localize(x) : (T('[WARNING] No locale found with identifier "' + A + '".'), J);
        }, J.timezone = function(A) {
          var x = R, S = C, z = typeof A;
          if (z === "number" || z === "string")
            if (S = !0, z === "string") {
              var M = A[0] === "-" ? -1 : 1, q = parseInt(A.slice(1, 3), 10), ee = parseInt(A.slice(3, 5), 10);
              x = M * (60 * q + ee) * 60 * 1e3;
            } else z === "number" && (x = A * 60 * 1e3);
          return new a(N, x, S);
        }, J.utc = function() {
          return new a(N, R, !0);
        }, J;
      }
      function n(w, u) {
        return u === "" || w > 9 ? "" + w : (u == null && (u = "0"), u + w);
      }
      function i(w) {
        return w > 99 ? w : w > 9 ? "0" + w : "00" + w;
      }
      function v(w) {
        return w === 0 ? 12 : w > 12 ? w - 12 : w;
      }
      function o(w, u) {
        u = u || "sunday";
        var g = w.getDay();
        u === "monday" && (g === 0 ? g = 6 : g--);
        var N = Date.UTC(w.getFullYear(), 0, 1), R = Date.UTC(w.getFullYear(), w.getMonth(), w.getDate()), C = Math.floor((R - N) / 864e5), P = (C + 7 - g) / 7;
        return Math.floor(P);
      }
      function f(w) {
        var u = w % 10, g = w % 100;
        if (g >= 11 && g <= 13 || u === 0 || u >= 4)
          return "th";
        switch (u) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
        }
      }
      function h(w) {
        return (w.getTimezoneOffset() || 0) * 6e4;
      }
      function b(w, u) {
        return m() || _(w);
      }
      function m(w, u) {
        return null;
      }
      function _(w) {
        var u = w.toString().match(/\(([\w\s]+)\)/);
        return u && u[1];
      }
      function T(w) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(w);
      }
    })();
  })(dr)), dr.exports;
}
var Yi = $i();
const $t = /* @__PURE__ */ Hi(Yi);
let hr = /* @__PURE__ */ L(!1);
class ji {
  constructor(t) {
    if (this.sk = "", this.fetchFn = t || (typeof window < "u" ? fetch.bind(window) : fetch), typeof document < "u") {
      const s = document.querySelector('meta[name="csrf-token"]');
      s && (this.sk = s.content);
    }
  }
  get loading() {
    return l(hr);
  }
  async request(t, s = {}) {
    k(hr, !0);
    try {
      const r = new URL(t, window.location.origin);
      s.params && Object.entries(s.params).forEach(([v, o]) => {
        r.searchParams.append(v, String(o));
      });
      const a = new Headers(s.headers || {});
      a.set("X-Requested-With", "fetch");
      let n = s.body;
      s.method && ["POST", "PUT", "PATCH", "DELETE"].includes(s.method.toUpperCase()) && (n instanceof FormData ? n.set("sk", this.sk) : n && typeof n == "object" && !(n instanceof Blob) && !(n instanceof ArrayBuffer) && (a.set("Content-Type", "application/json"), n = JSON.stringify(n)));
      const i = await this.fetchFn(r.toString(), { ...s, headers: a, body: n });
      if (!i.ok)
        throw new Error(`API Error: ${i.status} ${i.statusText}`);
      return await i.json();
    } finally {
      k(hr, !1);
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
const le = new ji(), qi = (e, t = js) => {
  var s = Bi(), r = c(s);
  K(() => {
    ze(s, 1, `status status-${t().status ?? ""}`, "svelte-13s7gu4"), F(r, t().status);
  }), D(e, s);
};
var Bi = /* @__PURE__ */ O("<span> </span>"), Ui = /* @__PURE__ */ O('<time class="svelte-13s7gu4"> </time>'), zi = /* @__PURE__ */ O('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Ji = /* @__PURE__ */ O('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), Xi = /* @__PURE__ */ O('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Ki = /* @__PURE__ */ O('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), Vi = /* @__PURE__ */ O('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4">エントリ一覧</h2> <div class="search-box svelte-13s7gu4"><input type="text" placeholder="検索..." class="svelte-13s7gu4"/> <button class="svelte-13s7gu4">検索</button></div> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">新しい方へ</button> <button class="svelte-13s7gu4">古い方へ</button></div></div> <div><!></div></div>');
function Gi(e, t) {
  lt(t, !0);
  const s = (A, x = js, S) => {
    let z = /* @__PURE__ */ Ar(() => oa(S?.(), !0));
    var M = Ui(), q = c(M);
    K(
      (ee) => {
        Te(M, "datetime", x()), F(q, ee);
      },
      [() => l(z) && x() ? m(x()) : "-"]
    ), D(A, M);
  };
  let r = /* @__PURE__ */ L(ye([])), a = /* @__PURE__ */ L(!1), n = 50, i = /* @__PURE__ */ L(""), v = /* @__PURE__ */ L(ye([]));
  async function o() {
    try {
      const A = l(v)[l(v).length - 1], x = { limit: n };
      l(i) && (x.q = l(i)), A && (x.cursor_id = A);
      const S = await le.get("/admin/api/entries", x);
      k(r, S.entries || [], !0), k(a, S.has_more || !1, !0);
    } catch (A) {
      console.error(A);
    }
  }
  function f() {
    k(v, [], !0), o();
  }
  Rt(o);
  function h() {
    if (l(a) && l(r).length > 0) {
      const A = l(r)[l(r).length - 1];
      l(v).push(A.id), o();
    }
  }
  function b() {
    l(v).length > 0 && (l(v).pop(), o());
  }
  function m(A) {
    return A ? $t("%Y-%m-%d %H:%M", new Date(A)) : "-";
  }
  var _ = Vi(), T = c(_), w = d(c(T), 2), u = c(w);
  u.__keydown = (A) => A.key === "Enter" && f();
  var g = d(u, 2);
  g.__click = f;
  var N = d(w, 2), R = c(N);
  R.__click = b;
  var C = d(R, 2);
  C.__click = h;
  var P = d(T, 2);
  let H;
  var j = c(P);
  {
    var I = (A) => {
      var x = zi();
      D(A, x);
    }, J = (A) => {
      var x = Ki(), S = Be(x), z = d(c(S));
      Me(z, 21, () => l(r), Ce, (ee, te) => {
        var pe = Ji(), ue = c(pe), fe = c(ue), $ = d(ue), se = c($), B = d($), W = c(B);
        qi(W, () => l(te));
        var oe = d(B), ae = c(oe), V = c(ae), G = d(ae, 2), ie = c(G), ce = c(ie), me = d(oe), Se = c(me), Ee = d(me), Je = c(Ee);
        s(Je, () => l(te).created_at);
        var p = d(Ee), y = c(p);
        s(y, () => l(te).modified_at);
        var Y = d(p), re = c(Y);
        s(re, () => l(te).publish_at?.Time, () => l(te).publish_at?.Valid);
        var de = d(Y), ge = c(de);
        ge.__click = () => t.onEdit(l(te).id), K(() => {
          F(fe, l(te).id), F(se, l(te).date), F(V, l(te).title), Te(ie, "href", `/${l(te).path ?? ""}`), F(ce, `/${l(te).path ?? ""}`), F(Se, l(te).format);
        }), D(ee, pe);
      });
      var M = d(S, 2);
      {
        var q = (ee) => {
          var te = Xi();
          D(ee, te);
        };
        ne(M, (ee) => {
          le.loading && ee(q);
        });
      }
      D(A, x);
    };
    ne(j, (A) => {
      le.loading && l(r).length === 0 ? A(I) : A(J, !1);
    });
  }
  K(() => {
    R.disabled = l(v).length === 0 || le.loading, C.disabled = !l(a) || le.loading, H = ze(P, 1, "table-container svelte-13s7gu4", null, H, { "is-loading": le.loading });
  }), os(u, () => l(i), (A) => k(i, A)), D(e, _), ot();
}
bs(["keydown", "click"]);
class Wi {
  #e;
  get exists() {
    return l(this.#e);
  }
  set exists(t) {
    k(this.#e, t, !0);
  }
  #r;
  get data() {
    return l(this.#r);
  }
  set data(t) {
    k(this.#r, t, !0);
  }
  constructor(t = typeof localStorage < "u" ? localStorage : null) {
    this.storage = t, this.timer = null, this.#e = /* @__PURE__ */ L(!1), this.#r = /* @__PURE__ */ L(null);
  }
  key(t) {
    return `nogag-backup-${t || "new"}`;
  }
  check(t, s) {
    if (!this.storage) return;
    const r = this.storage.getItem(this.key(t));
    if (r)
      try {
        const a = JSON.parse(r);
        (a.title !== s.title || a.body !== s.body) && (this.exists = !0, this.data = a);
      } catch (a) {
        console.error("Failed to parse backup", a);
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
const Zi = "public", Qi = "draft", el = "scheduled", tl = "reserved", Lt = Zi, _r = Qi, Os = el, Cs = tl;
var sl = /* @__PURE__ */ O('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), rl = /* @__PURE__ */ O('<option class="svelte-7nstam"> </option>'), al = /* @__PURE__ */ O('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), nl = /* @__PURE__ */ O('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), il = /* @__PURE__ */ O('<button id="restore" type="button" class="submit-button restore-button svelte-7nstam">復元...</button>'), ll = /* @__PURE__ */ O('<div role="option" tabindex="-1"> </div>'), ol = /* @__PURE__ */ O('<div class="preview-overlay svelte-7nstam"><div class="preview-progress-container svelte-7nstam"><div class="preview-progress-bar svelte-7nstam"></div> <div class="preview-progress-text svelte-7nstam">読み込み中...</div></div></div>'), cl = /* @__PURE__ */ O('<span class="tag svelte-7nstam"> </span>'), vl = /* @__PURE__ */ O('<div role="button" tabindex="-1"><div class="result-title svelte-7nstam"><!> <!> <button type="button" class="open-result-button svelte-7nstam" title="別タブで開く">↗️</button></div> <div class="result-summary svelte-7nstam"><!></div> <div class="result-meta svelte-7nstam"><span class="result-date svelte-7nstam"> </span> <span class="result-path svelte-7nstam"> </span></div></div>'), ul = /* @__PURE__ */ O('<div class="no-results svelte-7nstam">結果が見つかりません</div>'), fl = /* @__PURE__ */ O('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam">🔗 リンク</button> <button type="button" class="svelte-7nstam"> </button> <span class="char-count svelte-7nstam"> </span> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons footer-container svelte-7nstam"><div class="status-selector svelte-7nstam"><label class="status-option svelte-7nstam" title="非公開のまま保存します"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">下書き</span></div></label> <label class="status-option svelte-7nstam" title="今すぐ公開し、URLを確定させます"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">公開</span></div></label> <label class="status-option svelte-7nstam" title="指定した日時に公開します。URLは今すぐ確定します。"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">公開を遅延</span> <span class="description svelte-7nstam">URL確定</span></div></label> <label class="status-option svelte-7nstam" title="指定した日付を投稿日として予約します。公開されるまでURLは確定しません。"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">予約投稿</span> <span class="description svelte-7nstam">URL未定</span></div></label></div> <div class="action-row-container svelte-7nstam"><div class="footer-left svelte-7nstam"><button type="button" class="submit-button svelte-7nstam"><!></button> <!></div> <div class="footer-right svelte-7nstam"><!> <button type="button" class="submit-button preview-button svelte-7nstam">プレビュー</button></div></div></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam" role="listbox" aria-label="タグを選択" tabindex="0"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog> <dialog id="previewDialog" class="svelte-7nstam"><div class="preview-header svelte-7nstam"><h3 class="svelte-7nstam">プレビュー</h3> <button type="button" class="close-button svelte-7nstam">閉じる</button></div> <div class="preview-body svelte-7nstam"><!> <iframe name="preview-iframe" title="Preview" class="svelte-7nstam"></iframe></div></dialog> <dialog id="searchDialog" class="search-dialog svelte-7nstam"><div class="search-header svelte-7nstam"><h3 class="svelte-7nstam">過去日記を検索</h3> <button type="button" class="close-button svelte-7nstam">閉じる</button></div> <div class="search-body svelte-7nstam"><input type="search" placeholder="キーワードを入力..." class="search-input svelte-7nstam"/> <div class="search-results svelte-7nstam"></div></div> <div class="dialog-footer svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button></div></dialog>', 1);
function dl(e, t) {
  lt(t, !0);
  const s = [];
  let r = Qa(t, "id", 3, null);
  const a = new Wi();
  let n = /* @__PURE__ */ L(ye({ id: void 0, title: "", body: "", status: "" })), i = ye({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: Lt,
    publishAt: ""
  }), v = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(""), f = /* @__PURE__ */ L(!1), h = /* @__PURE__ */ L(!0), b = /* @__PURE__ */ L(!1), m = /* @__PURE__ */ L(null), _ = /* @__PURE__ */ L(null), T = /* @__PURE__ */ L(null), w = /* @__PURE__ */ L(null), u = /* @__PURE__ */ L(null), g = /* @__PURE__ */ L(null), N = /* @__PURE__ */ L(null);
  const R = [
    "tech",
    "photo",
    "redeveloped",
    "stablediffusion",
    "photoshopped"
  ];
  let C = /* @__PURE__ */ L(0), P = /* @__PURE__ */ L(""), H = /* @__PURE__ */ L(ye([])), j = /* @__PURE__ */ L(0), I = /* @__PURE__ */ L(null), J = ye([]);
  async function A(p) {
    try {
      k(h, !0);
      const y = await le.get(`/admin/api/entry/${p}`);
      k(n, y, !0), i.id = y.id, i.title = y.title ?? "", i.body = y.body ?? "", i.format = y.format || "Hatena", i.status = y.status, y.publish_at?.Valid ? i.publishAt = $t("%Y-%m-%dT%H:%M", new Date(y.publish_at.Time)) : i.publishAt = $t("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), a.check(l(n).id ?? null, { title: i.title, body: i.body });
    } catch (y) {
      console.error(y), alert("エントリの取得に失敗しました");
    } finally {
      k(h, !1);
    }
  }
  Rt(() => {
    r() ? A(r()) : (k(n, { id: void 0, title: "", body: "", status: Lt }, !0), i.id = null, i.title = "", i.body = "", i.format = "Hatena", i.status = Lt, i.publishAt = $t("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), a.check(null, { title: i.title, body: i.body }), k(h, !1));
  }), Pa(() => {
    (l(n).title !== i.title || l(n).body !== i.body) && a.saveDebounced(l(n).id ?? null, { title: i.title, body: i.body });
  });
  async function x() {
    k(v, !0), k(o, "リクエスト中");
    const p = new FormData();
    if (p.set("id", i.id ? String(i.id) : ""), p.set("title", i.title), p.set("body", i.body), p.set("format", i.format), i.status === Os || i.status === Cs) {
      const y = new Date(i.publishAt);
      p.set("publish_at", y.toISOString());
    }
    p.set("status", i.status);
    try {
      const Y = (await le.post("/admin/api/edit", p)).session_id;
      if (!Y)
        throw new Error("保存に失敗しました");
      S(Y);
    } catch (y) {
      k(v, !1), alert(y instanceof Error ? y.message : "エラーが発生しました");
    }
  }
  function S(p) {
    const y = new EventSource(`/admin/api/edit/progress?sid=${p}`);
    y.onmessage = (Y) => {
      const re = JSON.parse(Y.data);
      switch (re.type) {
        case "progress":
          k(o, z(re.message), !0);
          break;
        case "done":
          a.clear(l(n).id ?? null), k(o, "完了"), k(v, !1), y.close(), t.onSave(re.location);
          break;
        case "error":
          k(o, "エラー: " + re.message), k(v, !1), y.close(), alert("保存に失敗しました: " + re.message);
          break;
      }
    }, y.onerror = () => {
      k(v, !1), y.close(), alert("通信エラーが発生しました");
    };
  }
  function z(p) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[p] || p;
  }
  function M() {
    k(C, 0), l(T).showModal(), setTimeout(() => l(N)?.focus(), 0);
  }
  function q(p) {
    p.key === "ArrowDown" ? (p.preventDefault(), k(C, (l(C) + 1) % R.length)) : p.key === "ArrowUp" ? (p.preventDefault(), k(C, (l(C) - 1 + R.length) % R.length)) : p.key === "Enter" || p.key === " " ? (p.preventDefault(), ee(R[l(C)])) : p.key === "Escape" && l(T).close();
  }
  function ee(p) {
    const y = `[${p}]`;
    i.title.includes(y) ? i.title = i.title.replace(y, "") : i.title = y + i.title, l(T).close(), l(m).focus();
  }
  function te() {
    k(P, ""), k(H, [], !0), k(j, 0), l(g).showModal(), setTimeout(() => l(I)?.focus(), 0);
  }
  async function pe(p) {
    if (!(p instanceof KeyboardEvent && p.key === "Enter")) {
      if (l(P).length < 2) {
        k(H, [], !0);
        return;
      }
      try {
        const y = await le.get("/api/search", { q: l(P) });
        k(H, y.results || [], !0), k(j, 0);
      } catch (y) {
        console.error(y);
      }
    }
  }
  function ue(p) {
    p.key === "ArrowDown" || p.ctrlKey && p.key === "n" ? (p.preventDefault(), k(j, (l(j) + 1) % l(H).length), J[l(j)]?.scrollIntoView({ block: "nearest" })) : p.key === "ArrowUp" || p.ctrlKey && p.key === "p" ? (p.preventDefault(), k(j, (l(j) - 1 + l(H).length) % l(H).length), J[l(j)]?.scrollIntoView({ block: "nearest" })) : p.key === "Enter" ? (p.preventDefault(), l(H)[l(j)] && (p.shiftKey || p.metaKey || p.ctrlKey ? fe(l(H)[l(j)]) : $(l(H)[l(j)]))) : p.key === "Escape" && l(g).close();
  }
  function fe(p) {
    const y = p.path.startsWith("http") ? p.path : `${location.origin}/${p.path}`;
    window.open(y, "_blank");
  }
  function $(p) {
    const y = p.path.startsWith("http") ? p.path : `${location.origin}/${p.path}`;
    let Y = "";
    switch (i.format) {
      case "Hatena":
        Y = `[${y}:title=${p.title}]`;
        break;
      case "Markdown":
        Y = `[${p.title}](${y})`;
        break;
      case "HTML":
        Y = `<a href="${y}">${p.title}</a>`;
        break;
      case "tDiary":
        Y = `[[${p.title}|${y}]]`;
        break;
      default:
        Y = y;
    }
    W(Y), l(g).close(), l(_).focus();
  }
  function se() {
    a.data && (i.title = a.data.title, i.body = a.data.body, a.clear(l(n).id ?? null), l(w).close());
  }
  async function B() {
    const p = document.createElement("input");
    p.type = "file", p.oninput = async () => {
      if (!p.files?.[0]) return;
      const y = new FormData();
      y.append("file", p.files[0]), k(f, !0);
      try {
        const Y = await le.post("/admin/api/upload/image", y), re = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${Y.uploaded}" class="picasa" itemprop="url"><img src="${Y.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        W(re, !0);
      } catch {
        alert("アップロードに失敗しました");
      } finally {
        k(f, !1);
      }
    }, p.click();
  }
  function W(p, y = !1) {
    const Y = l(_).selectionStart, re = l(_).selectionEnd, de = l(_).value;
    i.body = de.substring(0, Y) + p + de.substring(re), Ja().then(() => {
      typeof y == "boolean" && y ? (l(_).selectionStart = Y, l(_).selectionEnd = Y + p.length) : typeof y == "number" ? l(_).selectionStart = l(_).selectionEnd = Y + y : l(_).selectionStart = l(_).selectionEnd = Y + p.length, l(_).focus();
    });
  }
  function oe(p) {
    const y = (p.altKey ? "Alt-" : "") + (p.ctrlKey ? "Control-" : "") + (p.metaKey ? "Meta-" : "") + (p.shiftKey ? "Shift-" : "") + p.key;
    y === "Control-t" ? (W("\\(  \\)", 3), p.preventDefault(), p.stopPropagation()) : (y === "Control-l" || y === "Meta-l") && (te(), p.preventDefault(), p.stopPropagation());
  }
  function ae() {
    l(u).showModal();
    const p = document.getElementsByName("preview-iframe")[0];
    p && (p.src = "about:blank"), setTimeout(
      () => {
        k(b, !0);
      },
      0
    );
    const y = document.createElement("form");
    y.method = "POST", y.action = "/admin/api/preview", y.target = "preview-iframe";
    const Y = {
      title: i.title,
      body: i.body,
      format: i.format,
      sk: le.skValue
    };
    for (const [re, de] of Object.entries(Y)) {
      const ge = document.createElement("input");
      ge.type = "hidden", ge.name = re, ge.value = de, y.appendChild(ge);
    }
    document.body.appendChild(y), y.submit(), document.body.removeChild(y);
  }
  function V() {
    k(b, !1), l(u).close();
  }
  function G(p) {
    const y = document.createElement("p");
    return y.textContent = p, y.innerHTML;
  }
  function ie(p, y) {
    if (!y) return G(p);
    const Y = G(p), re = y.split(/\s+/).filter((Re) => Re.length >= 2);
    if (re.length === 0) return Y;
    const de = re.map((Re) => Re.replace(/[.*+?^${}()|[\\]/g, "\\$&")).join("|"), ge = new RegExp(`(${de})`, "gi");
    return Y.replace(ge, "<mark>$1</mark>");
  }
  function ce(p) {
    const Y = new DOMParser().parseFromString(p, "text/html");
    Y.querySelectorAll("script, style, noscript, iframe").forEach((de) => de.remove());
    const re = Y.body.textContent || "";
    return re.replace(/\s+/g, " ").trim().substring(0, 200) + (re.length > 200 ? "..." : "");
  }
  var me = yt(), Se = Be(me);
  {
    var Ee = (p) => {
      var y = sl();
      D(p, y);
    }, Je = (p) => {
      var y = fl(), Y = Be(y), re = c(Y), de = c(re);
      Xe(de, (E) => k(m, E), () => l(m));
      var ge = d(de, 2), Re = c(ge);
      Re.__click = M;
      var vt = d(Re, 2);
      vt.__click = te;
      var Ge = d(vt, 2);
      Ge.__click = B;
      var Vs = c(Ge), Ut = d(Ge, 2), Gs = c(Ut), ws = d(Ut, 2);
      Me(ws, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], Ce, (E, U) => {
        var he = rl(), ve = c(he), De = {};
        K(() => {
          F(ve, U), De !== (De = U) && (he.value = (he.__value = U) ?? "");
        }), D(E, he);
      });
      var ys = d(ge, 2), zt = c(ys);
      zt.__keydown = oe, Xe(zt, (E) => k(_, E), () => l(_));
      var Ws = d(re, 2), Jt = c(Ws);
      {
        var Zs = (E) => {
          var U = al();
          D(E, U);
        };
        ne(Jt, (E) => {
          l(v) && E(Zs);
        });
      }
      var Qs = d(Jt, 2), Xt = c(Qs), xs = c(Xt), Kt = c(xs), Vt, ks = d(xs, 2), Gt = c(ks), Wt, Ms = d(ks, 2), Zt = c(Ms), Qt, er = d(Ms, 2), es = c(er), Ss, tr = d(Xt, 2), Es = c(tr), It = c(Es);
      It.__click = x;
      var sr = c(It);
      {
        var rr = (E) => {
          var U = ns();
          K(() => F(U, l(o) || "リクエスト中")), D(E, U);
        }, ts = (E) => {
          var U = yt(), he = Be(U);
          {
            var ve = (Ie) => {
              var We = ns("下書き保存");
              D(Ie, We);
            }, De = (Ie) => {
              var We = yt(), As = Be(We);
              {
                var or = (ut) => {
                  var Ct = ns();
                  K(() => F(Ct, r() ? "更新する" : "公開する")), D(ut, Ct);
                }, Fs = (ut) => {
                  var Ct = ns("予約する");
                  D(ut, Ct);
                };
                ne(
                  As,
                  (ut) => {
                    i.status === Lt ? ut(or) : ut(Fs, !1);
                  },
                  !0
                );
              }
              D(Ie, We);
            };
            ne(
              he,
              (Ie) => {
                i.status === _r ? Ie(ve) : Ie(De, !1);
              },
              !0
            );
          }
          D(E, U);
        };
        ne(sr, (E) => {
          l(v) ? E(rr) : E(ts, !1);
        });
      }
      var Ot = d(It, 2);
      {
        var bt = (E) => {
          var U = nl();
          os(U, () => i.publishAt, (he) => i.publishAt = he), D(E, U);
        };
        ne(Ot, (E) => {
          (i.status === Os || i.status === Cs) && E(bt);
        });
      }
      var ss = d(Es, 2), Ds = c(ss);
      {
        var ar = (E) => {
          var U = il();
          U.__click = () => l(w).showModal(), D(E, U);
        };
        ne(Ds, (E) => {
          a.exists && E(ar);
        });
      }
      var Or = d(Ds, 2);
      Or.__click = ae;
      var nr = d(Y, 2), Ts = d(c(nr), 2);
      Ts.__keydown = q, Me(Ts, 21, () => R, Ce, (E, U, he) => {
        var ve = ll();
        let De;
        ve.__click = () => ee(l(U)), ve.__keydown = (We) => We.key === "Enter" && ee(l(U));
        var Ie = c(ve);
        K(() => {
          De = ze(ve, 1, "tag-item svelte-7nstam", null, De, { selected: l(C) === he }), Te(ve, "aria-selected", l(C) === he), F(Ie, l(U));
        }), Rs("mouseenter", ve, () => k(C, he, !0)), D(E, ve);
      }), Xe(Ts, (E) => k(N, E), () => l(N));
      var en = d(Ts, 2);
      en.__click = () => l(T).close(), Xe(nr, (E) => k(T, E), () => l(T));
      var ir = d(nr, 2), Cr = d(c(ir), 2), tn = c(Cr);
      {
        var sn = (E) => {
          var U = ns();
          K((he) => F(U, he), [() => $t("%Y年%m月%d日%H時", new Date(a.data.time))]), D(E, U);
        };
        ne(tn, (E) => {
          a.data?.time && E(sn);
        });
      }
      var rn = d(Cr, 2), Nr = c(rn);
      Nr.__click = () => l(w).close();
      var an = d(Nr, 2);
      an.__click = se, Xe(ir, (E) => k(w, E), () => l(w));
      var lr = d(ir, 2), Lr = c(lr), nn = d(c(Lr), 2);
      nn.__click = V;
      var ln = d(Lr, 2), Hr = c(ln);
      {
        var on = (E) => {
          var U = ol();
          D(E, U);
        };
        ne(Hr, (E) => {
          l(b) && E(on);
        });
      }
      var $r = d(Hr, 2);
      Xe(lr, (E) => k(u, E), () => l(u));
      var Yr = d(lr, 2), jr = c(Yr), cn = d(c(jr), 2);
      cn.__click = () => l(g).close();
      var qr = d(jr, 2), rs = c(qr);
      rs.__input = (E) => pe(E), rs.__keydown = ue, Xe(rs, (E) => k(I, E), () => l(I));
      var vn = d(rs, 2);
      Me(
        vn,
        21,
        () => l(H),
        Ce,
        (E, U, he) => {
          var ve = vl();
          let De;
          ve.__click = () => $(l(U)), ve.__keydown = (Ze) => Ze.key === "Enter" && $(l(U));
          var Ie = c(ve), We = c(Ie);
          ta(We, () => ie(l(U).title, l(P)));
          var As = d(We, 2);
          Me(As, 17, () => l(U).tags, Ce, (Ze, cr) => {
            var Ur = cl(), pn = c(Ur);
            K(() => F(pn, l(cr))), D(Ze, Ur);
          });
          var or = d(As, 2);
          or.__click = (Ze) => {
            Ze.stopPropagation(), fe(l(U));
          };
          var Fs = d(Ie, 2), ut = c(Fs);
          ta(ut, () => ie(ce(l(U).formatted_body), l(P)));
          var Ct = d(Fs, 2), Br = c(Ct), dn = c(Br), hn = d(Br, 2), _n = c(hn);
          Xe(ve, (Ze, cr) => J[cr] = Ze, (Ze) => J?.[Ze], () => [he]), K(() => {
            De = ze(ve, 1, "search-result-item svelte-7nstam", null, De, { selected: l(j) === he }), F(dn, l(U).date), F(_n, l(U).path);
          }), Rs("mouseenter", ve, () => k(j, he, !0)), D(E, ve);
        },
        (E) => {
          var U = yt(), he = Be(U);
          {
            var ve = (De) => {
              var Ie = ul();
              D(De, Ie);
            };
            ne(he, (De) => {
              l(P).length >= 2 && De(ve);
            });
          }
          D(E, U);
        }
      );
      var un = d(qr, 2), fn = c(un);
      fn.__click = () => l(g).close(), Xe(Yr, (E) => k(g, E), () => l(g)), K(() => {
        Ge.disabled = l(f), F(Vs, l(f) ? "⌛ アップロード中..." : "📷 写真"), F(Gs, `${(i.body ?? "").length ?? ""} 文字`), Vt !== (Vt = _r) && (Kt.value = (Kt.__value = _r) ?? ""), Wt !== (Wt = Lt) && (Gt.value = (Gt.__value = Lt) ?? ""), Qt !== (Qt = Os) && (Zt.value = (Zt.__value = Os) ?? ""), Ss !== (Ss = Cs) && (es.value = (es.__value = Cs) ?? ""), It.disabled = l(v), Or.disabled = l(v);
      }), os(de, () => i.title, (E) => i.title = E), Ai(ws, () => i.format, (E) => i.format = E), os(zt, () => i.body, (E) => i.body = E), Is(
        s,
        [],
        Kt,
        () => i.status,
        (E) => i.status = E
      ), Is(
        s,
        [],
        Gt,
        () => i.status,
        (E) => i.status = E
      ), Is(
        s,
        [],
        Zt,
        () => i.status,
        (E) => i.status = E
      ), Is(
        s,
        [],
        es,
        () => i.status,
        (E) => i.status = E
      ), Rs("load", $r, () => {
        l(b) && k(b, !1);
      }), Rs("error", $r, () => {
        k(b, !1), alert("プレビューの読み込みに失敗しました");
      }), os(rs, () => l(P), (E) => k(P, E)), D(p, y);
    };
    ne(Se, (p) => {
      l(h) ? p(Ee) : p(Je, !1);
    });
  }
  D(e, me), ot();
}
bs(["click", "keydown", "input"]);
const hl = (e, t = js) => {
  var s = _l(), r = c(s);
  K(() => {
    ze(s, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), F(r, t());
  }), D(e, s);
};
var _l = /* @__PURE__ */ O("<span> </span>"), pl = /* @__PURE__ */ O('<time class="time svelte-1r6codn"> </time>'), ml = /* @__PURE__ */ O('<div class="loading svelte-1r6codn"></div>'), gl = /* @__PURE__ */ O('<div class="error-text svelte-1r6codn"> </div>'), bl = /* @__PURE__ */ O('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><!></td><td class="error svelte-1r6codn"><!></td></tr>'), wl = /* @__PURE__ */ O('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), yl = /* @__PURE__ */ O('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">新しい方へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">古い方へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function xl(e, t) {
  lt(t, !0);
  const s = (I, J = js, A) => {
    let x = /* @__PURE__ */ Ar(() => oa(A?.(), !0));
    var S = pl(), z = c(S);
    K(
      (M) => {
        Te(S, "datetime", J()), F(z, M);
      },
      [() => l(x) && J() ? h(J()) : "-"]
    ), D(I, S);
  };
  let r = /* @__PURE__ */ L(ye([])), a = /* @__PURE__ */ L(0), n = /* @__PURE__ */ L(0), i = 50;
  async function v() {
    try {
      const I = await le.get("/admin/api/jobs", { limit: i, offset: l(n) });
      k(r, I.jobs || [], !0), k(a, I.total || 0, !0);
    } catch (I) {
      console.error(I);
    }
  }
  Rt(v);
  function o() {
    l(n) + i < l(a) && (k(n, l(n) + i), v());
  }
  function f() {
    l(n) - i >= 0 && (k(n, l(n) - i), v());
  }
  function h(I) {
    return $t("%Y-%m-%d %H:%M:%S", new Date(I));
  }
  var b = yl(), m = c(b), _ = c(m), T = c(_), w = d(_, 2), u = c(w);
  u.__click = f;
  var g = d(u, 2), N = c(g), R = d(g, 2);
  R.__click = o;
  var C = d(R, 2);
  C.__click = v;
  var P = d(m, 2);
  {
    var H = (I) => {
      var J = ml();
      D(I, J);
    }, j = (I) => {
      var J = wl(), A = d(c(J));
      Me(A, 21, () => l(r), Ce, (x, S) => {
        var z = bl(), M = c(z), q = c(M), ee = d(M), te = c(ee), pe = c(te), ue = d(ee), fe = c(ue);
        hl(fe, () => l(S).status);
        var $ = d(ue), se = c($), B = d($), W = c(B);
        s(W, () => l(S).created_at);
        var oe = d(B), ae = c(oe);
        {
          var V = (G) => {
            var ie = gl(), ce = c(ie);
            K(() => {
              Te(ie, "title", l(S).error_message.String), F(ce, l(S).error_message.String);
            }), D(G, ie);
          };
          ne(ae, (G) => {
            l(S).error_message?.Valid && G(V);
          });
        }
        K(() => {
          F(q, l(S).id), F(pe, l(S).job_type_name), F(se, l(S).retry_count);
        }), D(x, z);
      }), D(I, J);
    };
    ne(P, (I) => {
      le.loading && l(r).length === 0 ? I(H) : I(j, !1);
    });
  }
  K(
    (I) => {
      F(T, `ジョブ一覧 (${l(a) ?? ""})`), u.disabled = l(n) === 0 || le.loading, F(N, `${l(n) + 1} - ${I ?? ""} / ${l(a) ?? ""}`), R.disabled = l(n) + i >= l(a) || le.loading;
    },
    [() => Math.min(l(n) + i, l(a))]
  ), D(e, b), ot();
}
bs(["click"]);
var kl = /* @__PURE__ */ O('<div class="empty svelte-wpgtu6">No Signature</div>'), Ml = /* @__PURE__ */ O("<div></div>"), Sl = /* @__PURE__ */ O('<div class="row svelte-wpgtu6"></div>'), El = /* @__PURE__ */ O('<div class="chroma-section svelte-wpgtu6"></div>'), Dl = /* @__PURE__ */ O('<div class="chroma-sections svelte-wpgtu6"></div>'), Tl = /* @__PURE__ */ O('<div class="color-bitmask svelte-wpgtu6"><!></div>');
function pr(e, t) {
  lt(t, !0);
  let s = Qa(t, "size", 3, 64), r = /* @__PURE__ */ dt(() => {
    if (!t.sig) return new Array(64).fill(!1);
    try {
      const h = atob(t.sig), b = new Uint8Array(h.length);
      for (let _ = 0; _ < h.length; _++)
        b[_] = h.charCodeAt(_);
      const m = [];
      for (let _ = 0; _ < 8; _++) {
        const T = b[_];
        for (let w = 7; w >= 0; w--)
          m.push((T >> w & 1) === 1);
      }
      return m.reverse();
    } catch (h) {
      return console.error("Failed to decode sig:", h), new Array(64).fill(!1);
    }
  });
  function a(h) {
    const b = h >> 5 & 1, m = h >> 4 & 1, _ = h >> 3 & 1, T = h >> 2 & 1, w = h >> 1 & 1, u = h & 1, g = m << 1 | T, N = b << 2 | _ << 1 | w, R = u, C = [25, 45, 65, 85][g], P = R === 0 ? 0.01 : 0.15, H = N * 45;
    return `oklch(${C}% ${P} ${H})`;
  }
  function n(h, b, m) {
    const _ = h >> 1 & 1, T = h & 1, w = b >> 2 & 1, u = b >> 1 & 1, g = b & 1, N = m & 1;
    return w << 5 | _ << 4 | u << 3 | T << 2 | g << 1 | N;
  }
  var i = Tl(), v = c(i);
  {
    var o = (h) => {
      var b = kl();
      D(h, b);
    }, f = (h) => {
      var b = Dl();
      Me(b, 20, () => [1, 0], Ce, (m, _) => {
        var T = El();
        Me(T, 20, () => [3, 2, 1, 0], Ce, (w, u) => {
          var g = Sl();
          Me(g, 20, () => [0, 1, 2, 3, 4, 5, 6, 7], Ce, (N, R) => {
            const C = /* @__PURE__ */ dt(() => n(u, R, _));
            var P = Ml();
            let H;
            K(
              (j) => {
                H = ze(P, 1, "bit svelte-wpgtu6", null, H, { active: l(r)[l(C)] }), fs(P, `background-color: ${j ?? ""}`), Te(P, "title", `L=${u ?? ""} H=${R * 45} C=${_ ?? ""}`);
              },
              [() => a(l(C))]
            ), D(N, P);
          }), D(w, g);
        }), K(() => Te(T, "title", _ === 1 ? "Vivid Colors" : "Muted Colors")), D(m, T);
      }), D(h, b);
    };
    ne(v, (h) => {
      t.sig ? h(f, !1) : h(o);
    });
  }
  K(() => fs(i, `--size: ${s() ?? ""}px`)), D(e, i), ot();
}
var Al = /* @__PURE__ */ O('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), Fl = /* @__PURE__ */ O('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class A Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), Pl = /* @__PURE__ */ O('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), Rl = /* @__PURE__ */ O('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class B Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), Il = /* @__PURE__ */ O('<div class="stat-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">Storage (Free: 10GB)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976"> </div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class A (Free: 1M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class B (Free: 10M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div>', 1), Ol = /* @__PURE__ */ O('<div class="stat-card error-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">R2 Status</div> <div class="stat-value svelte-1w9i976" style="font-size: 0.9rem; color: #d32f2f;"> </div></div>'), Cl = /* @__PURE__ */ O('<div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div>', 1), Nl = /* @__PURE__ */ O('<div class="r2-stats svelte-1w9i976"><!></div>');
function Ll(e, t) {
  lt(t, !0);
  let s = /* @__PURE__ */ L(null), r = /* @__PURE__ */ L(null);
  async function a() {
    try {
      k(s, await le.get("/admin/api/r2/usage"), !0);
    } catch (u) {
      console.error("Failed to fetch R2 usage:", u), k(r, "Failed to load R2 usage data");
    }
  }
  Rt(a);
  function n(u) {
    if (u === 0) return "0 B";
    const g = 1024, N = ["B", "KB", "MB", "GB", "TB"], R = Math.floor(Math.log(u) / Math.log(g));
    return parseFloat((u / Math.pow(g, R)).toFixed(2)) + " " + N[R];
  }
  const i = [
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
  ], o = /* @__PURE__ */ dt(() => l(s) ? (l(s).operations || []).filter((u) => i.includes(u.action_type)).reduce((u, g) => u + g.requests, 0) : 0), f = /* @__PURE__ */ dt(() => l(s) ? (l(s).operations || []).filter((u) => v.includes(u.action_type)).reduce((u, g) => u + g.requests, 0) : 0), h = /* @__PURE__ */ dt(() => l(s) ? (l(s).operations || []).filter((u) => i.includes(u.action_type)).sort((u, g) => g.requests - u.requests) : []), b = /* @__PURE__ */ dt(() => l(s) ? (l(s).operations || []).filter((u) => v.includes(u.action_type)).sort((u, g) => g.requests - u.requests) : []);
  var m = Nl(), _ = c(m);
  {
    var T = (u) => {
      var g = Il(), N = Be(g), R = d(c(N), 2), C = c(R), P = d(R, 2), H = c(P), j = d(P, 2), I = c(j), J = d(N, 2), A = d(c(J), 2), x = c(A), S = d(A, 4), z = c(S), M = d(S, 2);
      {
        var q = (B) => {
          var W = Fl(), oe = d(c(W), 2);
          Me(oe, 21, () => l(h), Ce, (ae, V) => {
            var G = Al(), ie = c(G), ce = c(ie), me = d(ie, 2), Se = c(me);
            K(
              (Ee) => {
                F(ce, l(V).action_type), F(Se, Ee);
              },
              [() => (l(V).requests ?? 0).toLocaleString()]
            ), D(ae, G);
          }), D(B, W);
        };
        ne(M, (B) => {
          l(h).length > 0 && B(q);
        });
      }
      var ee = d(J, 2), te = d(c(ee), 2), pe = c(te), ue = d(te, 4), fe = c(ue), $ = d(ue, 2);
      {
        var se = (B) => {
          var W = Rl(), oe = d(c(W), 2);
          Me(oe, 21, () => l(b), Ce, (ae, V) => {
            var G = Pl(), ie = c(G), ce = c(ie), me = d(ie, 2), Se = c(me);
            K(
              (Ee) => {
                F(ce, l(V).action_type), F(Se, Ee);
              },
              [() => (l(V).requests ?? 0).toLocaleString()]
            ), D(ae, G);
          }), D(B, W);
        };
        ne($, (B) => {
          l(b).length > 0 && B(se);
        });
      }
      K(
        (B, W, oe, ae, V, G, ie) => {
          F(C, B), F(H, `${W ?? ""} objects`), fs(I, `width: ${oe ?? ""}%`), F(x, ae), fs(z, `width: ${V ?? ""}%`), F(pe, G), fs(fe, `width: ${ie ?? ""}%`);
        },
        [
          () => n(l(s).storage_usage_bytes ?? 0),
          () => (l(s).object_count ?? 0).toLocaleString(),
          () => Math.min(100, (l(s).storage_usage_bytes ?? 0) / 10737418240 * 100),
          () => (l(o) ?? 0).toLocaleString(),
          () => Math.min(100, (l(o) ?? 0) / 1e6 * 100),
          () => (l(f) ?? 0).toLocaleString(),
          () => Math.min(100, (l(f) ?? 0) / 1e7 * 100)
        ]
      ), D(u, g);
    }, w = (u) => {
      var g = yt(), N = Be(g);
      {
        var R = (P) => {
          var H = Ol(), j = d(c(H), 2), I = c(j);
          K(() => F(I, l(r))), D(P, H);
        }, C = (P) => {
          var H = Cl();
          D(P, H);
        };
        ne(
          N,
          (P) => {
            l(r) ? P(R) : P(C, !1);
          },
          !0
        );
      }
      D(u, g);
    };
    ne(_, (u) => {
      l(s) ? u(T) : u(w, !1);
    });
  }
  D(e, m), ot();
}
var Hl = /* @__PURE__ */ O('<div class="loading svelte-xxb0sp">読み込み中...</div>'), $l = /* @__PURE__ */ O('<button class="indexed-icon svelte-xxb0sp" title="類似画像を検索">🔍</button>'), Yl = /* @__PURE__ */ O('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/> <!></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), jl = /* @__PURE__ */ O('<div class="overlay svelte-xxb0sp"><div class="loading-spinner svelte-xxb0sp"></div></div>'), ql = /* @__PURE__ */ O('<div class="grid-container svelte-xxb0sp"><div></div> <!></div>'), Bl = /* @__PURE__ */ O('<div class="selected-compare svelte-xxb0sp"><div class="image-item target svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="svelte-xxb0sp">Selected Image</div></div></div> <div class="arrow svelte-xxb0sp">→</div></div>'), Ul = /* @__PURE__ */ O('<div class="loading svelte-xxb0sp">検索中...</div>'), zl = /* @__PURE__ */ O('<p class="svelte-xxb0sp">類似画像は見つかりませんでした。</p>'), Jl = /* @__PURE__ */ O('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), Xl = /* @__PURE__ */ O("<div></div>"), Kl = /* @__PURE__ */ O('<div class="image-list svelte-xxb0sp"><div class="header svelte-xxb0sp"><div class="title-area svelte-xxb0sp"><h2 class="svelte-xxb0sp"> </h2> <a href="https://dash.cloudflare.com/d52dc19d3368d36eecf4b48d5eb2dd44/r2/default/buckets/lowreal" target="_blank" rel="noopener noreferrer" class="r2-link svelte-xxb0sp">R2 Dashboard ↗</a></div> <div class="pagination svelte-xxb0sp"><button class="svelte-xxb0sp">前へ</button> <span class="svelte-xxb0sp"> </span> <button class="svelte-xxb0sp">次へ</button></div></div> <!> <!></div> <dialog id="similarDialog" class="svelte-xxb0sp"><div class="dialog-header svelte-xxb0sp"><h3 class="svelte-xxb0sp">類似画像一覧</h3> <button type="button" class="close-btn svelte-xxb0sp">×</button></div> <div class="dialog-content svelte-xxb0sp"><!> <!></div></dialog>', 1);
function Vl(e, t) {
  lt(t, !0);
  let s = /* @__PURE__ */ L(ye([])), r = /* @__PURE__ */ L(0), a = 20, n = /* @__PURE__ */ L(0), i = /* @__PURE__ */ L(ye([])), v = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L(null);
  async function f() {
    try {
      const $ = await le.get(`/admin/api/images?limit=${a}&offset=${l(r)}`);
      k(s, $.images || [], !0), k(n, $.total || 0, !0);
    } catch ($) {
      console.error($);
    }
  }
  async function h($) {
    k(v, $, !0), k(i, [], !0), l(o).showModal();
    try {
      const se = await le.get(`/admin/api/image/${$.id}/similar`);
      k(i, se.similar || [], !0);
    } catch (se) {
      console.error(se);
    }
  }
  Rt(f);
  function b() {
    l(r) + a < l(n) && (k(r, l(r) + a), f());
  }
  function m() {
    l(r) - a >= 0 && (k(r, l(r) - a), f());
  }
  var _ = Kl(), T = Be(_), w = c(T), u = c(w), g = c(u), N = c(g), R = d(u, 2), C = c(R);
  C.__click = m;
  var P = d(C, 2), H = c(P), j = d(P, 2);
  j.__click = b;
  var I = d(w, 2);
  Ll(I, {});
  var J = d(I, 2);
  {
    var A = ($) => {
      var se = Hl();
      D($, se);
    }, x = ($) => {
      var se = ql(), B = c(se);
      let W;
      Me(B, 21, () => l(s), (V) => V.id, (V, G) => {
        var ie = Yl(), ce = c(ie), me = c(ce), Se = d(me, 2);
        {
          var Ee = (vt) => {
            var Ge = $l();
            Ge.__click = () => h(l(G)), D(vt, Ge);
          };
          ne(Se, (vt) => {
            l(G).sig?.length > 0 && vt(Ee);
          });
        }
        var Je = d(ce, 2), p = c(Je);
        pr(p, {
          get sig() {
            return l(G).sig;
          }
        });
        var y = d(p, 2), Y = c(y), re = d(c(Y)), de = c(re), ge = d(y, 2), Re = c(ge);
        K(() => {
          Te(me, "src", l(G).uri), Te(Y, "href", `/admin/edit?id=${l(G).entry_id ?? ""}`), F(de, l(G).entry_id), F(Re, `ID: ${l(G).id ?? ""}`);
        }), D(V, ie);
      });
      var oe = d(B, 2);
      {
        var ae = (V) => {
          var G = jl();
          D(V, G);
        };
        ne(oe, (V) => {
          le.loading && V(ae);
        });
      }
      K(() => W = ze(B, 1, "grid svelte-xxb0sp", null, W, { "is-loading": le.loading })), D($, se);
    };
    ne(J, ($) => {
      le.loading && l(s).length === 0 ? $(A) : $(x, !1);
    });
  }
  var S = d(T, 2), z = c(S), M = d(c(z), 2);
  M.__click = () => l(o).close();
  var q = d(z, 2), ee = c(q);
  {
    var te = ($) => {
      var se = Bl(), B = c(se), W = c(B), oe = c(W), ae = d(W, 2), V = c(ae);
      pr(V, {
        get sig() {
          return l(v).sig;
        }
      }), K(() => Te(oe, "src", l(v).uri)), D($, se);
    };
    ne(ee, ($) => {
      l(v) && $(te);
    });
  }
  var pe = d(ee, 2);
  {
    var ue = ($) => {
      var se = Ul();
      D($, se);
    }, fe = ($) => {
      var se = yt(), B = Be(se);
      {
        var W = (ae) => {
          var V = zl();
          D(ae, V);
        }, oe = (ae) => {
          var V = Xl();
          let G;
          Me(V, 21, () => l(i), (ie) => ie.id, (ie, ce) => {
            var me = Jl(), Se = c(me), Ee = c(Se), Je = d(Se, 2), p = c(Je);
            pr(p, {
              get sig() {
                return l(ce).sig;
              }
            });
            var y = d(p, 2), Y = c(y);
            Y.__click = () => l(o).close();
            var re = d(c(Y)), de = c(re), ge = d(y, 2), Re = c(ge);
            K(() => {
              Te(Ee, "src", l(ce).uri), Te(Y, "href", `/admin/edit?id=${l(ce).entry_id ?? ""}`), F(de, l(ce).entry_id), F(Re, `ID: ${l(ce).id ?? ""} / Score: ${l(ce).score ?? ""}`);
            }), D(ie, me);
          }), K(() => G = ze(V, 1, "grid similar-grid svelte-xxb0sp", null, G, { "is-loading": le.loading })), D(ae, V);
        };
        ne(
          B,
          (ae) => {
            l(i).length === 0 ? ae(W) : ae(oe, !1);
          },
          !0
        );
      }
      D($, se);
    };
    ne(pe, ($) => {
      le.loading && l(i).length === 0 ? $(ue) : $(fe, !1);
    });
  }
  Xe(S, ($) => k(o, $), () => l(o)), K(
    ($) => {
      F(N, `画像一覧 (${l(n) ?? ""})`), C.disabled = l(r) === 0, F(H, `${l(r) + 1} - ${$ ?? ""} / ${l(n) ?? ""}`), j.disabled = l(r) + a >= l(n);
    },
    [() => Math.min(l(r) + a, l(n))]
  ), D(e, _), ot();
}
bs(["click"]);
var Gl = /* @__PURE__ */ O('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), Wl = /* @__PURE__ */ O('<span class="term-badge svelte-6rw159"> </span>'), Zl = /* @__PURE__ */ O('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">TF-IDF 統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総語彙数 (Terms)</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">インデックス済みエントリ</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">関連エントリ計算済み</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">総関連ペア数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">平均類似度スコア</th><td class="svelte-6rw159"> </td></tr></tbody></table></div> <div style="margin-top: 10px;" class="svelte-6rw159"><h4 class="svelte-6rw159">頻出単語 (Top 20 DF)</h4> <div class="top-terms svelte-6rw159"></div></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">画像統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総画像数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">未インデックス画像数</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), Ql = /* @__PURE__ */ O('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function eo(e, t) {
  lt(t, !0);
  let s = /* @__PURE__ */ L(null);
  async function r() {
    try {
      k(s, await le.get("/admin/api/info"), !0);
    } catch (f) {
      console.error(f);
    }
  }
  Rt(r);
  function a(f) {
    if (f === 0) return "0 B";
    const h = 1024, b = ["B", "KB", "MB", "GB", "TB"], m = Math.floor(Math.log(f) / Math.log(h));
    return parseFloat((f / Math.pow(h, m)).toFixed(2)) + " " + b[m];
  }
  var n = Ql(), i = d(c(n), 2);
  {
    var v = (f) => {
      var h = Gl();
      D(f, h);
    }, o = (f) => {
      var h = yt(), b = Be(h);
      {
        var m = (_) => {
          var T = Zl(), w = c(T), u = d(c(w), 2), g = c(u), N = c(g), R = c(N), C = d(c(R)), P = c(C), H = d(R), j = d(c(H)), I = c(j), J = d(H), A = d(c(J)), x = c(A), S = d(J), z = d(c(S)), M = c(z), q = d(S), ee = d(c(q)), te = c(ee), pe = d(u, 2), ue = d(c(pe), 2);
          Me(ue, 21, () => l(s).tfidf_stats?.top_terms ?? [], Ce, (ts, Ot) => {
            var bt = Wl(), ss = c(bt);
            K(() => {
              Te(bt, "title", `DF: ${l(Ot).df ?? ""}`), F(ss, l(Ot).term);
            }), D(ts, bt);
          });
          var fe = d(w, 2), $ = d(c(fe), 2), se = c($), B = c(se), W = c(B), oe = d(c(W)), ae = c(oe), V = d(W), G = d(c(V)), ie = c(G), ce = d(fe, 2), me = d(c(ce), 2), Se = c(me), Ee = c(Se), Je = c(Ee), p = d(c(Je)), y = c(p), Y = d(Je), re = d(c(Y)), de = c(re), ge = c(de), Re = d(ce, 2), vt = d(c(Re), 2), Ge = c(vt), Vs = c(Ge), Ut = c(Vs), Gs = d(c(Ut)), ws = c(Gs), ys = d(Ut), zt = d(c(ys)), Ws = c(zt), Jt = d(ys), Zs = d(c(Jt)), Qs = c(Zs), Xt = d(Jt), xs = d(c(Xt)), Kt = c(xs), Vt = d(Xt), ks = d(c(Vt)), Gt = c(ks), Wt = d(Vt), Ms = d(c(Wt)), Zt = c(Ms), Qt = d(Wt), er = d(c(Qt)), es = c(er), Ss = d(Qt), tr = d(c(Ss)), Es = c(tr), It = d(Re, 2), sr = d(c(It), 2), rr = c(sr);
          K(
            (ts, Ot, bt, ss, Ds, ar) => {
              F(P, l(s).tfidf_stats?.total_terms ?? 0), F(I, l(s).tfidf_stats?.indexed_entries ?? 0), F(x, l(s).tfidf_stats?.entries_with_related ?? 0), F(M, l(s).tfidf_stats?.total_related_pairs ?? 0), F(te, ts), F(ae, l(s).image_stats?.total_images ?? 0), F(ie, l(s).image_stats?.unindexed_images ?? 0), F(y, l(s).is_development), F(ge, l(s).app_hash), F(ws, l(s).debug_info.go_version), F(Ws, l(s).debug_info.num_goroutine), F(Qs, Ot), F(Kt, l(s).debug_info.uptime), F(Gt, bt), F(Zt, ss), F(es, Ds), F(Es, l(s).debug_info.num_gc), F(rr, ar);
            },
            [
              () => l(s).tfidf_stats?.avg_score?.toFixed(4) ?? "0.0000",
              () => new Date(l(s).debug_info.start_time).toLocaleString(),
              () => a(l(s).debug_info.mem_alloc),
              () => a(l(s).debug_info.mem_total_alloc),
              () => a(l(s).debug_info.mem_sys),
              () => JSON.stringify(l(s).config, null, 2)
            ]
          ), D(_, T);
        };
        ne(
          b,
          (_) => {
            l(s) && _(m);
          },
          !0
        );
      }
      D(f, h);
    };
    ne(i, (f) => {
      le.loading && !l(s) ? f(v) : f(o, !1);
    });
  }
  D(e, n), ot();
}
var to = /* @__PURE__ */ O("<a> </a>"), so = /* @__PURE__ */ O('<div class="admin-app svelte-1n46o8q"><header><div class="header-left svelte-1n46o8q"><h1 class="svelte-1n46o8q"><a href="/admin/" class="svelte-1n46o8q"><img src="/images/hanrangen-icon.svg" alt="Hanrangon" class="logo svelte-1n46o8q"/></a></h1> <div class="ci-badge svelte-1n46o8q"><a href="https://github.com/cho45/Hanrangon/actions/workflows/ci.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/ci.yml?branch=main&amp;label=ci&amp;style=flat-square" alt="CI Status" class="svelte-1n46o8q"/></a> <a href="https://github.com/cho45/Hanrangon/actions/workflows/lint.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/lint.yml?branch=main&amp;label=lint&amp;style=flat-square" alt="Lint Status" class="svelte-1n46o8q"/></a></div></div> <nav class="main-nav svelte-1n46o8q"><ul class="svelte-1n46o8q"><li><a href="/" class="svelte-1n46o8q">サイト確認</a></li> <li><a href="/logout" class="svelte-1n46o8q">ログアウト</a></li></ul></nav></header> <nav></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function ro(e, t) {
  lt(t, !0);
  let s = /* @__PURE__ */ L(ye(window.location.pathname)), r = /* @__PURE__ */ L(ye(new URLSearchParams(window.location.search)));
  Rt(() => {
    const u = () => {
      k(s, window.location.pathname, !0), k(r, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", u), () => window.removeEventListener("popstate", u);
  });
  function a(u, g) {
    g && g.preventDefault(), window.history.pushState({}, "", u), k(s, window.location.pathname, !0), k(r, new URLSearchParams(window.location.search), !0);
  }
  const n = {
    "/admin/edit": {
      component: dl,
      page: "edit",
      getProps: (u) => ({ id: u, onSave: (g) => window.location.href = g })
    },
    "/admin/jobs": { component: xl, page: "jobs", getProps: () => ({}) },
    "/admin/images": { component: Vl, page: "images", getProps: () => ({}) },
    "/admin/info": { component: eo, page: "info", getProps: () => ({}) },
    "/admin/": {
      component: Gi,
      page: "list",
      getProps: () => ({ onEdit: (u) => a(`/admin/edit?id=${u}`) })
    }
  }, i = [
    { label: "エントリ一覧", path: "/admin/", page: "list" },
    {
      label: "新規作成",
      path: "/admin/edit",
      page: "edit",
      exact: !0
    },
    { label: "画像一覧", path: "/admin/images", page: "images" },
    { label: "ジョブ一覧", path: "/admin/jobs", page: "jobs" },
    { label: "情報", path: "/admin/info", page: "info" }
  ], v = /* @__PURE__ */ dt(() => {
    const u = l(r).get("id"), g = n[l(s)] ?? n["/admin/"];
    return {
      ...g,
      props: g.getProps(u),
      isActive: (N) => !(N.page !== g.page || N.exact && u)
    };
  }), o = /* @__PURE__ */ dt(() => window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  var f = so(), h = c(f);
  let b;
  var m = d(h, 2);
  let _;
  Me(m, 21, () => i, Ce, (u, g) => {
    var N = to();
    N.__click = (P) => a(l(g).path, P);
    let R;
    var C = c(N);
    K(
      (P) => {
        Te(N, "href", l(g).path), R = ze(N, 1, "svelte-1n46o8q", null, R, P), F(C, l(g).label);
      },
      [() => ({ active: l(v).isActive(l(g)) })]
    ), D(u, N);
  });
  var T = d(m, 2), w = c(T);
  Si(w, () => l(v).component, (u, g) => {
    g(u, Ni(() => l(v).props));
  }), K(() => {
    b = ze(h, 1, "svelte-1n46o8q", null, b, { "is-localhost": l(o) }), _ = ze(m, 1, "sub-nav svelte-1n46o8q", null, _, { "is-localhost": l(o) });
  }), D(e, f), ot();
}
bs(["click"]);
const mr = document.getElementById("admin-root");
mr && (mr.innerHTML = "", bi(ro, { target: mr }));
//# sourceMappingURL=admin-front.js.map
