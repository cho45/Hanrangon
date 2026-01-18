var kr = Array.isArray, mn = Array.prototype.indexOf, Us = Array.from, gn = Object.defineProperty, Mt = Object.getOwnPropertyDescriptor, bn = Object.getOwnPropertyDescriptors, wn = Object.prototype, yn = Array.prototype, ia = Object.getPrototypeOf, zr = Object.isExtensible;
function us(e) {
  return typeof e == "function";
}
const Xt = () => {
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
const ke = 2, qs = 4, zs = 8, va = 1 << 24, vt = 16, ct = 32, Ot = 64, Sr = 128, Je = 512, Te = 1024, Ce = 2048, ut = 4096, He = 8192, gt = 16384, Mr = 32768, Ft = 65536, Jr = 1 << 17, ca = 1 << 18, Zt = 1 << 19, kn = 1 << 20, nt = 1 << 25, Pt = 32768, gr = 1 << 21, Dr = 1 << 22, bt = 1 << 23, Dt = /* @__PURE__ */ Symbol("$state"), Sn = /* @__PURE__ */ Symbol("legacy props"), Mn = /* @__PURE__ */ Symbol(""), Jt = new class extends Error {
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
const Nn = 1, $n = 2, ua = 4, Ln = 8, Hn = 16, qn = 1, Yn = 2, ye = /* @__PURE__ */ Symbol(), Bn = "http://www.w3.org/1999/xhtml";
function jn() {
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
let Ye = null;
function Kt(e) {
  Ye = e;
}
function ft(e, t = !1, s) {
  Ye = {
    p: Ye,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function dt(e) {
  var t = (
    /** @type {ComponentContext} */
    Ye
  ), s = t.e;
  if (s !== null) {
    t.e = null;
    for (var r of s)
      Ra(r);
  }
  return t.i = !0, Ye = t.p, /** @type {T} */
  {};
}
function _a() {
  return !0;
}
let kt = [];
function ha() {
  var e = kt;
  kt = [], xn(e);
}
function yt(e) {
  if (kt.length === 0 && !ps) {
    var t = kt;
    queueMicrotask(() => {
      t === kt && ha();
    });
  }
  kt.push(e);
}
function Jn() {
  for (; kt.length > 0; )
    ha();
}
function pa(e) {
  var t = ae;
  if (t === null)
    return K.f |= bt, e;
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
const Vn = -7169;
function be(e, t) {
  e.f = e.f & Vn | t;
}
function Er(e) {
  (e.f & Je) !== 0 || e.deps === null ? be(e, Te) : be(e, ut);
}
function ma(e) {
  if (e !== null)
    for (const t of e)
      (t.f & ke) === 0 || (t.f & Pt) === 0 || (t.f ^= Pt, ma(
        /** @type {Derived} */
        t.deps
      ));
}
function ga(e, t, s) {
  (e.f & Ce) !== 0 ? t.add(e) : (e.f & ut) !== 0 && s.add(e), ma(e.deps), be(e, Te);
}
const Cs = /* @__PURE__ */ new Set();
let te = null, hs = null, Ve = null, Ue = [], Js = null, br = !1, ps = !1;
class Ze {
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
    Ue = [], hs = null, this.apply();
    var s = [], r = [];
    for (const a of t)
      this.#l(a, s, r);
    this.is_fork || this.#v(), this.is_deferred() ? (this.#o(r), this.#o(s)) : (hs = this, te = null, Vr(r), Vr(s), hs = null, this.#i?.resolve()), Ve = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #l(t, s, r) {
    t.f ^= Te;
    for (var a = t.first, n = null; a !== null; ) {
      var l = a.f, c = (l & (ct | Ot)) !== 0, v = c && (l & Te) !== 0, u = v || (l & He) !== 0 || this.skipped_effects.has(a);
      if (!u && a.fn !== null) {
        c ? a.f ^= Te : n !== null && (l & (qs | zs | va)) !== 0 ? n.b.defer_effect(a) : (l & qs) !== 0 ? s.push(a) : Ss(a) && ((l & vt) !== 0 && this.#a.add(a), ys(a));
        var _ = a.first;
        if (_ !== null) {
          a = _;
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
    s !== ye && !this.previous.has(t) && this.previous.set(t, s), (t.f & bt) === 0 && (this.current.set(t, t.v), Ve?.set(t, t.v));
  }
  activate() {
    te = this, this.apply();
  }
  deactivate() {
    te === this && (te = null, Ve = null);
  }
  flush() {
    if (this.activate(), Ue.length > 0) {
      if (ba(), te !== null && te !== this)
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
    if (Cs.size > 1) {
      this.previous.clear();
      var t = Ve, s = !0;
      for (const a of Cs) {
        if (a === this) {
          s = !1;
          continue;
        }
        const n = [];
        for (const [c, v] of this.current) {
          if (a.current.has(c))
            if (s && v !== a.current.get(c))
              a.current.set(c, v);
            else
              continue;
          n.push(c);
        }
        if (n.length === 0)
          continue;
        const l = [...a.current.keys()].filter((c) => !this.current.has(c));
        if (l.length > 0) {
          var r = Ue;
          Ue = [];
          const c = /* @__PURE__ */ new Set(), v = /* @__PURE__ */ new Map();
          for (const u of n)
            wa(u, l, c, v);
          if (Ue.length > 0) {
            te = a, a.apply();
            for (const u of Ue)
              a.#l(u, [], []);
            a.deactivate();
          }
          Ue = r;
        }
      }
      te = null, Ve = t;
    }
    this.committed = !0, Cs.delete(this);
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
      this.#s.delete(t), be(t, Ce), ot(t);
    for (const t of this.#s)
      be(t, ut), ot(t);
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
    if (te === null) {
      const t = te = new Ze();
      Cs.add(te), ps || Ze.enqueue(() => {
        te === t && t.flush();
      });
    }
    return te;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    yt(t);
  }
  apply() {
  }
}
function Xn(e) {
  var t = ps;
  ps = !0;
  try {
    for (var s; ; ) {
      if (Jn(), Ue.length === 0 && (te?.flush(), Ue.length === 0))
        return Js = null, /** @type {T} */
        s;
      ba();
    }
  } finally {
    ps = t;
  }
}
function ba() {
  var e = Tt;
  br = !0;
  var t = null;
  try {
    var s = 0;
    for (Bs(!0); Ue.length > 0; ) {
      var r = Ze.ensure();
      if (s++ > 1e3) {
        var a, n;
        Kn();
      }
      r.process(Ue), wt.clear();
    }
  } finally {
    br = !1, Bs(e), Js = null;
  }
}
function Kn() {
  try {
    Pn();
  } catch (e) {
    Gt(e, Js);
  }
}
let at = null;
function Vr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var s = 0; s < t; ) {
      var r = e[s++];
      if ((r.f & (gt | He)) === 0 && Ss(r) && (at = /* @__PURE__ */ new Set(), ys(r), r.deps === null && r.first === null && r.nodes === null && (r.teardown === null && r.ac === null ? $a(r) : r.fn = null), at?.size > 0)) {
        wt.clear();
        for (const a of at) {
          if ((a.f & (gt | He)) !== 0) continue;
          const n = [a];
          let l = a.parent;
          for (; l !== null; )
            at.has(l) && (at.delete(l), n.push(l)), l = l.parent;
          for (let c = n.length - 1; c >= 0; c--) {
            const v = n[c];
            (v.f & (gt | He)) === 0 && ys(v);
          }
        }
        at.clear();
      }
    }
    at = null;
  }
}
function wa(e, t, s, r) {
  if (!s.has(e) && (s.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const n = a.f;
      (n & ke) !== 0 ? wa(
        /** @type {Derived} */
        a,
        t,
        s,
        r
      ) : (n & (Dr | vt)) !== 0 && (n & Ce) === 0 && ya(a, t, r) && (be(a, Ce), ot(
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
      if ((a.f & ke) !== 0 && ya(
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
function ot(e) {
  for (var t = Js = e; t.parent !== null; ) {
    t = t.parent;
    var s = t.f;
    if (br && t === ae && (s & vt) !== 0 && (s & ca) === 0)
      return;
    if ((s & (Ot | ct)) !== 0) {
      if ((s & Te) === 0) return;
      t.f ^= Te;
    }
  }
  Ue.push(t);
}
function Gn(e) {
  let t = 0, s = Rt(0), r;
  return () => {
    Rr() && (i(s), Ks(() => (t === 0 && (r = Ws(() => e(() => ms(s)))), t += 1, () => {
      yt(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ms(s));
      });
    })));
  };
}
var Wn = Ft | Zt | Sr;
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
  #d = !1;
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
  #f = null;
  #w = Gn(() => (this.#f = Rt(this.#c), () => {
    this.#f = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, s, r) {
    this.#e = t, this.#t = s, this.#n = r, this.parent = /** @type {Effect} */
    ae.b, this.is_pending = !!this.#t.pending, this.#i = Gs(() => {
      ae.b = this;
      {
        var a = this.#g();
        try {
          this.#a = ze(() => r(a));
        } catch (n) {
          this.error(n);
        }
        this.#u > 0 ? this.#m() : this.is_pending = !1;
      }
      return () => {
        this.#v?.remove();
      };
    }, Wn);
  }
  #y() {
    try {
      this.#a = ze(() => this.#n(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  #x() {
    const t = this.#t.pending;
    t && (this.#s = ze(() => t(this.#e)), Ze.enqueue(() => {
      var s = this.#g();
      this.#a = this.#p(() => (Ze.ensure(), ze(() => this.#n(s)))), this.#u > 0 ? this.#m() : (Et(
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
    return this.is_pending && (this.#v = it(), this.#e.before(this.#v), t = this.#v), t;
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ga(t, this.#_, this.#h);
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
    var s = ae, r = K, a = Ye;
    et(this.#i), Re(this.#i), Kt(this.#i.ctx);
    try {
      return t();
    } catch (n) {
      return pa(n), null;
    } finally {
      et(s), Re(r), Kt(a);
    }
  }
  #m() {
    const t = (
      /** @type {(anchor: Node) => void} */
      this.#t.pending
    );
    this.#a !== null && (this.#o = document.createDocumentFragment(), this.#o.append(
      /** @type {TemplateNode} */
      this.#v
    ), qa(this.#a, this.#o)), this.#s === null && (this.#s = ze(() => t(this.#e)));
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
        be(s, Ce), ot(s);
      for (const s of this.#h)
        be(s, ut), ot(s);
      this.#_.clear(), this.#h.clear(), this.#s && Et(this.#s, () => {
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
    this.#b(t), this.#c += t, this.#f && Wt(this.#f, this.#c);
  }
  get_effect_pending() {
    return this.#w(), i(
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
    this.#a && (Oe(this.#a), this.#a = null), this.#s && (Oe(this.#s), this.#s = null), this.#l && (Oe(this.#l), this.#l = null);
    var a = !1, n = !1;
    const l = () => {
      if (a) {
        Un();
        return;
      }
      a = !0, n && Cn(), Ze.ensure(), this.#c = 0, this.#l !== null && Et(this.#l, () => {
        this.#l = null;
      }), this.is_pending = this.has_pending_snippet(), this.#a = this.#p(() => (this.#d = !1, ze(() => this.#n(this.#e)))), this.#u > 0 ? this.#m() : this.is_pending = !1;
    };
    var c = K;
    try {
      Re(null), n = !0, s?.(t, l), n = !1;
    } catch (v) {
      Gt(v, this.#i && this.#i.parent);
    } finally {
      Re(c);
    }
    r && yt(() => {
      this.#l = this.#p(() => {
        Ze.ensure(), this.#d = !0;
        try {
          return ze(() => {
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
  var n = te, l = (
    /** @type {Effect} */
    ae
  ), c = ti();
  function v() {
    Promise.all(s.map((u) => /* @__PURE__ */ si(u))).then((u) => {
      c();
      try {
        r([...t.map(a), ...u]);
      } catch (_) {
        (l.f & gt) === 0 && Gt(_, l);
      }
      n?.deactivate(), Ys();
    }).catch((u) => {
      Gt(u, l);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    c();
    try {
      return v();
    } finally {
      n?.deactivate(), Ys();
    }
  }) : v();
}
function ti() {
  var e = ae, t = K, s = Ye, r = te;
  return function(n = !0) {
    et(e), Re(t), Kt(s), n && r?.activate();
  };
}
function Ys() {
  et(null), Re(null), Kt(null);
}
// @__NO_SIDE_EFFECTS__
function Tr(e) {
  var t = ke | Ce, s = K !== null && (K.f & ke) !== 0 ? (
    /** @type {Derived} */
    K
  ) : null;
  return ae !== null && (ae.f |= Zt), {
    ctx: Ye,
    deps: null,
    effects: null,
    equals: fa,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ye
    ),
    wv: 0,
    parent: s ?? ae,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function si(e, t, s) {
  let r = (
    /** @type {Effect | null} */
    ae
  );
  r === null && En();
  var a = (
    /** @type {Boundary} */
    r.b
  ), n = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = Rt(
    /** @type {V} */
    ye
  ), c = !K, v = /* @__PURE__ */ new Map();
  return fi(() => {
    var u = la();
    n = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).then(() => {
        _ === te && _.committed && _.deactivate(), Ys();
      });
    } catch (h) {
      u.reject(h), Ys();
    }
    var _ = (
      /** @type {Batch} */
      te
    );
    if (c) {
      var b = a.is_rendered();
      a.update_pending_count(1), _.increment(b), v.get(_)?.reject(Jt), v.delete(_), v.set(_, u);
    }
    const m = (h, A = void 0) => {
      if (_.activate(), A)
        A !== Jt && (l.f |= bt, Wt(l, A));
      else {
        (l.f & bt) !== 0 && (l.f ^= bt), Wt(l, h);
        for (const [x, f] of v) {
          if (v.delete(x), x === _) break;
          f.reject(Jt);
        }
      }
      c && (a.update_pending_count(-1), _.decrement(b));
    };
    u.promise.then(m, (h) => m(null, h || "unknown"));
  }), Xs(() => {
    for (const u of v.values())
      u.reject(Jt);
  }), new Promise((u) => {
    function _(b) {
      function m() {
        b === n ? u(l) : _(n);
      }
      b.then(m, m);
    }
    _(n);
  });
}
// @__NO_SIDE_EFFECTS__
function Qe(e) {
  const t = /* @__PURE__ */ Tr(e);
  return Ya(t), t;
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
      Oe(
        /** @type {Effect} */
        t[s]
      );
  }
}
function ri(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & ke) === 0)
      return (t.f & gt) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Fr(e) {
  var t, s = ae;
  et(ri(e));
  try {
    e.f &= ~Pt, xa(e), t = za(e);
  } finally {
    et(s);
  }
  return t;
}
function ka(e) {
  var t = Fr(e);
  if (!e.equals(t) && (e.wv = ja(), (!te?.is_fork || e.deps === null) && (e.v = t, e.deps === null))) {
    be(e, Te);
    return;
  }
  It || (Ve !== null ? (Rr() || te?.is_fork) && Ve.set(e, t) : Er(e));
}
let wr = /* @__PURE__ */ new Set();
const wt = /* @__PURE__ */ new Map();
let Sa = !1;
function Rt(e, t) {
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
function H(e, t) {
  const s = Rt(e);
  return Ya(s), s;
}
// @__NO_SIDE_EFFECTS__
function ai(e, t = !1, s = !0) {
  const r = Rt(e);
  return t || (r.equals = da), r;
}
function k(e, t, s = !1) {
  K !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Ke || (K.f & Jr) !== 0) && _a() && (K.f & (ke | vt | Dr | Jr)) !== 0 && !lt?.includes(e) && On();
  let r = s ? De(t) : t;
  return Wt(e, r);
}
function Wt(e, t) {
  if (!e.equals(t)) {
    var s = e.v;
    It ? wt.set(e, t) : wt.set(e, s), e.v = t;
    var r = Ze.ensure();
    if (r.capture(e, s), (e.f & ke) !== 0) {
      const a = (
        /** @type {Derived} */
        e
      );
      (e.f & Ce) !== 0 && Fr(a), Er(a);
    }
    e.wv = ja(), Ma(e, Ce), ae !== null && (ae.f & Te) !== 0 && (ae.f & (ct | Ot)) === 0 && (je === null ? _i([e]) : je.push(e)), !r.is_fork && wr.size > 0 && !Sa && ni();
  }
  return t;
}
function ni() {
  Sa = !1;
  var e = Tt;
  Bs(!0);
  const t = Array.from(wr);
  try {
    for (const s of t)
      (s.f & Te) !== 0 && be(s, ut), Ss(s) && ys(s);
  } finally {
    Bs(e);
  }
  wr.clear();
}
function ms(e) {
  k(e, e.v + 1);
}
function Ma(e, t) {
  var s = e.reactions;
  if (s !== null)
    for (var r = s.length, a = 0; a < r; a++) {
      var n = s[a], l = n.f, c = (l & Ce) === 0;
      if (c && be(n, t), (l & ke) !== 0) {
        var v = (
          /** @type {Derived} */
          n
        );
        Ve?.delete(v), (l & Pt) === 0 && (l & Je && (n.f |= Pt), Ma(v, ut));
      } else c && ((l & vt) !== 0 && at !== null && at.add(
        /** @type {Effect} */
        n
      ), ot(
        /** @type {Effect} */
        n
      ));
    }
}
function De(e) {
  if (typeof e != "object" || e === null || Dt in e)
    return e;
  const t = ia(e);
  if (t !== wn && t !== yn)
    return e;
  var s = /* @__PURE__ */ new Map(), r = kr(e), a = /* @__PURE__ */ H(0), n = At, l = (c) => {
    if (At === n)
      return c();
    var v = K, u = At;
    Re(null), Zr(n);
    var _ = c();
    return Re(v), Zr(u), _;
  };
  return r && s.set("length", /* @__PURE__ */ H(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(c, v, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && Rn();
        var _ = s.get(v);
        return _ === void 0 ? _ = l(() => {
          var b = /* @__PURE__ */ H(u.value);
          return s.set(v, b), b;
        }) : k(_, u.value, !0), !0;
      },
      deleteProperty(c, v) {
        var u = s.get(v);
        if (u === void 0) {
          if (v in c) {
            const _ = l(() => /* @__PURE__ */ H(ye));
            s.set(v, _), ms(a);
          }
        } else
          k(u, ye), ms(a);
        return !0;
      },
      get(c, v, u) {
        if (v === Dt)
          return e;
        var _ = s.get(v), b = v in c;
        if (_ === void 0 && (!b || Mt(c, v)?.writable) && (_ = l(() => {
          var h = De(b ? c[v] : ye), A = /* @__PURE__ */ H(h);
          return A;
        }), s.set(v, _)), _ !== void 0) {
          var m = i(_);
          return m === ye ? void 0 : m;
        }
        return Reflect.get(c, v, u);
      },
      getOwnPropertyDescriptor(c, v) {
        var u = Reflect.getOwnPropertyDescriptor(c, v);
        if (u && "value" in u) {
          var _ = s.get(v);
          _ && (u.value = i(_));
        } else if (u === void 0) {
          var b = s.get(v), m = b?.v;
          if (b !== void 0 && m !== ye)
            return {
              enumerable: !0,
              configurable: !0,
              value: m,
              writable: !0
            };
        }
        return u;
      },
      has(c, v) {
        if (v === Dt)
          return !0;
        var u = s.get(v), _ = u !== void 0 && u.v !== ye || Reflect.has(c, v);
        if (u !== void 0 || ae !== null && (!_ || Mt(c, v)?.writable)) {
          u === void 0 && (u = l(() => {
            var m = _ ? De(c[v]) : ye, h = /* @__PURE__ */ H(m);
            return h;
          }), s.set(v, u));
          var b = i(u);
          if (b === ye)
            return !1;
        }
        return _;
      },
      set(c, v, u, _) {
        var b = s.get(v), m = v in c;
        if (r && v === "length")
          for (var h = u; h < /** @type {Source<number>} */
          b.v; h += 1) {
            var A = s.get(h + "");
            A !== void 0 ? k(A, ye) : h in c && (A = l(() => /* @__PURE__ */ H(ye)), s.set(h + "", A));
          }
        if (b === void 0)
          (!m || Mt(c, v)?.writable) && (b = l(() => /* @__PURE__ */ H(void 0)), k(b, De(u)), s.set(v, b));
        else {
          m = b.v !== ye;
          var x = l(() => De(u));
          k(b, x);
        }
        var f = Reflect.getOwnPropertyDescriptor(c, v);
        if (f?.set && f.set.call(_, u), !m) {
          if (r && typeof v == "string") {
            var g = (
              /** @type {Source<number>} */
              s.get("length")
            ), $ = Number(v);
            Number.isInteger($) && $ >= g.v && k(g, $ + 1);
          }
          ms(a);
        }
        return !0;
      },
      ownKeys(c) {
        i(a);
        var v = Reflect.ownKeys(c).filter((b) => {
          var m = s.get(b);
          return m === void 0 || m.v !== ye;
        });
        for (var [u, _] of s)
          _.v !== ye && !(u in c) && v.push(u);
        return v;
      },
      setPrototypeOf() {
        In();
      }
    }
  );
}
function Xr(e) {
  try {
    if (e !== null && typeof e == "object" && Dt in e)
      return e[Dt];
  } catch {
  }
  return e;
}
function Da(e, t) {
  return Object.is(Xr(e), Xr(t));
}
var Kr, Ea, Ta, Aa;
function ii() {
  if (Kr === void 0) {
    Kr = window, Ea = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, s = Text.prototype;
    Ta = Mt(t, "firstChild").get, Aa = Mt(t, "nextSibling").get, zr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), zr(s) && (s.__t = void 0);
  }
}
function it(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function mt(e) {
  return (
    /** @type {TemplateNode | null} */
    Ta.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function ks(e) {
  return (
    /** @type {TemplateNode | null} */
    Aa.call(e)
  );
}
function o(e, t) {
  return /* @__PURE__ */ mt(e);
}
function Xe(e, t = !1) {
  {
    var s = /* @__PURE__ */ mt(e);
    return s instanceof Comment && s.data === "" ? /* @__PURE__ */ ks(s) : s;
  }
}
function d(e, t = 1, s = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ ks(r);
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
function Vs(e) {
  var t = K, s = ae;
  Re(null), et(null);
  try {
    return e();
  } finally {
    Re(t), et(s);
  }
}
function Pr(e, t, s, r = s) {
  e.addEventListener(t, () => Vs(s));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), r(!0);
  } : e.__on_r = () => r(!0), oi();
}
function vi(e) {
  ae === null && (K === null && Fn(), An()), It && Tn();
}
function ci(e, t) {
  var s = t.last;
  s === null ? t.last = t.first = e : (s.next = e, e.prev = s, t.last = e);
}
function _t(e, t, s) {
  var r = ae;
  r !== null && (r.f & He) !== 0 && (e |= He);
  var a = {
    ctx: Ye,
    deps: null,
    nodes: null,
    f: e | Ce | Je,
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
      ys(a), a.f |= Mr;
    } catch (c) {
      throw Oe(a), c;
    }
  else t !== null && ot(a);
  var n = a;
  if (s && n.deps === null && n.teardown === null && n.nodes === null && n.first === n.last && // either `null`, or a singular child
  (n.f & Zt) === 0 && (n = n.first, (e & vt) !== 0 && (e & Ft) !== 0 && n !== null && (n.f |= Ft)), n !== null && (n.parent = r, r !== null && ci(n, r), K !== null && (K.f & ke) !== 0 && (e & Ot) === 0)) {
    var l = (
      /** @type {Derived} */
      K
    );
    (l.effects ??= []).push(n);
  }
  return a;
}
function Rr() {
  return K !== null && !Ke;
}
function Xs(e) {
  const t = _t(zs, null, !1);
  return be(t, Te), t.teardown = e, t;
}
function Pa(e) {
  vi();
  var t = (
    /** @type {Effect} */
    ae.f
  ), s = !K && (t & ct) !== 0 && (t & Mr) === 0;
  if (s) {
    var r = (
      /** @type {ComponentContext} */
      Ye
    );
    (r.e ??= []).push(e);
  } else
    return Ra(e);
}
function Ra(e) {
  return _t(qs | kn, e, !1);
}
function ui(e) {
  Ze.ensure();
  const t = _t(Ot | Zt, e, !0);
  return (s = {}) => new Promise((r) => {
    s.outro ? Et(t, () => {
      Oe(t), r(void 0);
    }) : (Oe(t), r(void 0));
  });
}
function Ia(e) {
  return _t(qs, e, !1);
}
function fi(e) {
  return _t(Dr | Zt, e, !0);
}
function Ks(e, t = 0) {
  return _t(zs | t, e, !0);
}
function J(e, t = [], s = [], r = []) {
  ei(r, t, s, (a) => {
    _t(zs, () => e(...a.map(i)), !0);
  });
}
function Gs(e, t = 0) {
  var s = _t(vt | t, e, !0);
  return s;
}
function ze(e) {
  return _t(ct | Zt, e, !0);
}
function Oa(e) {
  var t = e.teardown;
  if (t !== null) {
    const s = It, r = K;
    Wr(!0), Re(null);
    try {
      t.call(null);
    } finally {
      Wr(s), Re(r);
    }
  }
}
function Ca(e, t = !1) {
  var s = e.first;
  for (e.first = e.last = null; s !== null; ) {
    const a = s.ac;
    a !== null && Vs(() => {
      a.abort(Jt);
    });
    var r = s.next;
    (s.f & Ot) !== 0 ? s.parent = null : Oe(s, t), s = r;
  }
}
function di(e) {
  for (var t = e.first; t !== null; ) {
    var s = t.next;
    (t.f & ct) === 0 && Oe(t), t = s;
  }
}
function Oe(e, t = !0) {
  var s = !1;
  (t || (e.f & ca) !== 0) && e.nodes !== null && e.nodes.end !== null && (Na(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), s = !0), Ca(e, t && !s), js(e, 0), be(e, gt);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const n of r)
      n.stop();
  Oa(e);
  var a = e.parent;
  a !== null && a.first !== null && $a(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Na(e, t) {
  for (; e !== null; ) {
    var s = e === t ? null : /* @__PURE__ */ ks(e);
    e.remove(), e = s;
  }
}
function $a(e) {
  var t = e.parent, s = e.prev, r = e.next;
  s !== null && (s.next = r), r !== null && (r.prev = s), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = s));
}
function Et(e, t, s = !0) {
  var r = [];
  La(e, r, !0);
  var a = () => {
    s && Oe(e), t && t();
  }, n = r.length;
  if (n > 0) {
    var l = () => --n || a();
    for (var c of r)
      c.out(l);
  } else
    a();
}
function La(e, t, s) {
  if ((e.f & He) === 0) {
    e.f ^= He;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const c of r)
        (c.is_global || s) && t.push(c);
    for (var a = e.first; a !== null; ) {
      var n = a.next, l = (a.f & Ft) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (a.f & ct) !== 0 && (e.f & vt) !== 0;
      La(a, t, l ? s : !1), a = n;
    }
  }
}
function Ir(e) {
  Ha(e, !0);
}
function Ha(e, t) {
  if ((e.f & He) !== 0) {
    e.f ^= He, (e.f & Te) === 0 && (be(e, Ce), ot(e));
    for (var s = e.first; s !== null; ) {
      var r = s.next, a = (s.f & Ft) !== 0 || (s.f & ct) !== 0;
      Ha(s, a ? t : !1), s = r;
    }
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const l of n)
        (l.is_global || t) && l.in();
  }
}
function qa(e, t) {
  if (e.nodes)
    for (var s = e.nodes.start, r = e.nodes.end; s !== null; ) {
      var a = s === r ? null : /* @__PURE__ */ ks(s);
      t.append(s), s = a;
    }
}
let Tt = !1;
function Bs(e) {
  Tt = e;
}
let It = !1;
function Wr(e) {
  It = e;
}
let K = null, Ke = !1;
function Re(e) {
  K = e;
}
let ae = null;
function et(e) {
  ae = e;
}
let lt = null;
function Ya(e) {
  K !== null && (lt === null ? lt = [e] : lt.push(e));
}
let Fe = null, Le = 0, je = null;
function _i(e) {
  je = e;
}
let Ba = 1, ws = 0, At = ws;
function Zr(e) {
  At = e;
}
function ja() {
  return ++Ba;
}
function Ss(e) {
  var t = e.f;
  if ((t & Ce) !== 0)
    return !0;
  if (t & ke && (e.f &= ~Pt), (t & ut) !== 0) {
    for (var s = (
      /** @type {Value[]} */
      e.deps
    ), r = s.length, a = 0; a < r; a++) {
      var n = s[a];
      if (Ss(
        /** @type {Derived} */
        n
      ) && ka(
        /** @type {Derived} */
        n
      ), n.wv > e.wv)
        return !0;
    }
    (t & Je) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ve === null && be(e, Te);
  }
  return !1;
}
function Ua(e, t, s = !0) {
  var r = e.reactions;
  if (r !== null && !lt?.includes(e))
    for (var a = 0; a < r.length; a++) {
      var n = r[a];
      (n.f & ke) !== 0 ? Ua(
        /** @type {Derived} */
        n,
        t,
        !1
      ) : t === n && (s ? be(n, Ce) : (n.f & Te) !== 0 && be(n, ut), ot(
        /** @type {Effect} */
        n
      ));
    }
}
function za(e) {
  var t = Fe, s = Le, r = je, a = K, n = lt, l = Ye, c = Ke, v = At, u = e.f;
  Fe = /** @type {null | Value[]} */
  null, Le = 0, je = null, K = (u & (ct | Ot)) === 0 ? e : null, lt = null, Kt(e.ctx), Ke = !1, At = ++ws, e.ac !== null && (Vs(() => {
    e.ac.abort(Jt);
  }), e.ac = null);
  try {
    e.f |= gr;
    var _ = (
      /** @type {Function} */
      e.fn
    ), b = _(), m = e.deps;
    if (Fe !== null) {
      var h;
      if (js(e, Le), m !== null && Le > 0)
        for (m.length = Le + Fe.length, h = 0; h < Fe.length; h++)
          m[Le + h] = Fe[h];
      else
        e.deps = m = Fe;
      if (Rr() && (e.f & Je) !== 0)
        for (h = Le; h < m.length; h++)
          (m[h].reactions ??= []).push(e);
    } else m !== null && Le < m.length && (js(e, Le), m.length = Le);
    if (_a() && je !== null && !Ke && m !== null && (e.f & (ke | ut | Ce)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      je.length; h++)
        Ua(
          je[h],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (ws++, je !== null && (r === null ? r = je : r.push(.../** @type {Source[]} */
    je))), (e.f & bt) !== 0 && (e.f ^= bt), b;
  } catch (A) {
    return pa(A);
  } finally {
    e.f ^= gr, Fe = t, Le = s, je = r, K = a, lt = n, Kt(l), Ke = c, At = v;
  }
}
function hi(e, t) {
  let s = t.reactions;
  if (s !== null) {
    var r = mn.call(s, e);
    if (r !== -1) {
      var a = s.length - 1;
      a === 0 ? s = t.reactions = null : (s[r] = s[a], s.pop());
    }
  }
  if (s === null && (t.f & ke) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (Fe === null || !Fe.includes(t))) {
    var n = (
      /** @type {Derived} */
      t
    );
    (n.f & Je) !== 0 && (n.f ^= Je, n.f &= ~Pt), Er(n), xa(n), js(n, 0);
  }
}
function js(e, t) {
  var s = e.deps;
  if (s !== null)
    for (var r = t; r < s.length; r++)
      hi(e, s[r]);
}
function ys(e) {
  var t = e.f;
  if ((t & gt) === 0) {
    be(e, Te);
    var s = ae, r = Tt;
    ae = e, Tt = !0;
    try {
      (t & (vt | va)) !== 0 ? di(e) : Ca(e), Oa(e);
      var a = za(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Ba;
      var n;
    } finally {
      Tt = r, ae = s;
    }
  }
}
async function Ja() {
  await Promise.resolve(), Xn();
}
function i(e) {
  var t = e.f, s = (t & ke) !== 0;
  if (K !== null && !Ke) {
    var r = ae !== null && (ae.f & gt) !== 0;
    if (!r && !lt?.includes(e)) {
      var a = K.deps;
      if ((K.f & gr) !== 0)
        e.rv < ws && (e.rv = ws, Fe === null && a !== null && a[Le] === e ? Le++ : Fe === null ? Fe = [e] : Fe.includes(e) || Fe.push(e));
      else {
        (K.deps ??= []).push(e);
        var n = e.reactions;
        n === null ? e.reactions = [K] : n.includes(K) || n.push(K);
      }
    }
  }
  if (It && wt.has(e))
    return wt.get(e);
  if (s) {
    var l = (
      /** @type {Derived} */
      e
    );
    if (It) {
      var c = l.v;
      return ((l.f & Te) === 0 && l.reactions !== null || Xa(l)) && (c = Fr(l)), wt.set(l, c), c;
    }
    var v = (l.f & Je) === 0 && !Ke && K !== null && (Tt || (K.f & Je) !== 0), u = l.deps === null;
    Ss(l) && (v && (l.f |= Je), ka(l)), v && !u && Va(l);
  }
  if (Ve?.has(e))
    return Ve.get(e);
  if ((e.f & bt) !== 0)
    throw e.v;
  return e.v;
}
function Va(e) {
  if (e.deps !== null) {
    e.f |= Je;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & ke) !== 0 && (t.f & Je) === 0 && Va(
        /** @type {Derived} */
        t
      );
  }
}
function Xa(e) {
  if (e.v === ye) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (wt.has(t) || (t.f & ke) !== 0 && Xa(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Ws(e) {
  var t = Ke;
  try {
    return Ke = !0, e();
  } finally {
    Ke = t;
  }
}
const pi = ["touchstart", "touchmove"];
function mi(e) {
  return pi.includes(e);
}
const Ka = /* @__PURE__ */ new Set(), yr = /* @__PURE__ */ new Set();
function gi(e, t, s, r = {}) {
  function a(n) {
    if (r.capture || fs.call(t, n), !n.cancelBubble)
      return Vs(() => s?.call(this, n));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? yt(() => {
    t.addEventListener(e, a, r);
  }) : t.addEventListener(e, a, r), a;
}
function Ns(e, t, s, r, a) {
  var n = { capture: r, passive: a }, l = gi(e, t, s, n);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Xs(() => {
    t.removeEventListener(e, l, n);
  });
}
function Ms(e) {
  for (var t = 0; t < e.length; t++)
    Ka.add(e[t]);
  for (var s of yr)
    s(e);
}
let Qr = null;
function fs(e) {
  var t = this, s = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, a = e.composedPath?.() || [], n = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Qr = e;
  var l = 0, c = Qr === e && e.__root;
  if (c) {
    var v = a.indexOf(c);
    if (v !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var u = a.indexOf(t);
    if (u === -1)
      return;
    v <= u && (l = v);
  }
  if (n = /** @type {Element} */
  a[l] || e.target, n !== t) {
    gn(e, "currentTarget", {
      configurable: !0,
      get() {
        return n || s;
      }
    });
    var _ = K, b = ae;
    Re(null), et(null);
    try {
      for (var m, h = []; n !== null; ) {
        var A = n.assignedSlot || n.parentNode || /** @type {any} */
        n.host || null;
        try {
          var x = n["__" + r];
          x != null && (!/** @type {any} */
          n.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === n) && x.call(n, e);
        } catch (f) {
          m ? h.push(f) : m = f;
        }
        if (e.cancelBubble || A === t || A === null)
          break;
        n = A;
      }
      if (m) {
        for (let f of h)
          queueMicrotask(() => {
            throw f;
          });
        throw m;
      }
    } finally {
      e.__root = t, delete e.currentTarget, Re(_), et(b);
    }
  }
}
function Ga(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function xs(e, t) {
  var s = (
    /** @type {Effect} */
    ae
  );
  s.nodes === null && (s.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
  var s = (t & qn) !== 0, r = (t & Yn) !== 0, a, n = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = Ga(n ? e : "<!>" + e), s || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ mt(a)));
    var l = (
      /** @type {TemplateNode} */
      r || Ea ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (s) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ mt(l)
      ), v = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      xs(c, v);
    } else
      xs(l, l);
    return l;
  };
}
function zt(e = "") {
  {
    var t = it(e + "");
    return xs(t, t), t;
  }
}
function St() {
  var e = document.createDocumentFragment(), t = document.createComment(""), s = it();
  return e.append(t, s), xs(t, s), e;
}
function M(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function E(e, t) {
  var s = t == null ? "" : typeof t == "object" ? t + "" : t;
  s !== (e.__t ??= e.nodeValue) && (e.__t = s, e.nodeValue = s + "");
}
function bi(e, t) {
  return wi(e, t);
}
const jt = /* @__PURE__ */ new Map();
function wi(e, { target: t, anchor: s, props: r = {}, events: a, context: n, intro: l = !0 }) {
  ii();
  var c = /* @__PURE__ */ new Set(), v = (b) => {
    for (var m = 0; m < b.length; m++) {
      var h = b[m];
      if (!c.has(h)) {
        c.add(h);
        var A = mi(h);
        t.addEventListener(h, fs, { passive: A });
        var x = jt.get(h);
        x === void 0 ? (document.addEventListener(h, fs, { passive: A }), jt.set(h, 1)) : jt.set(h, x + 1);
      }
    }
  };
  v(Us(Ka)), yr.add(v);
  var u = void 0, _ = ui(() => {
    var b = s ?? t.appendChild(it());
    return Zn(
      /** @type {TemplateNode} */
      b,
      {
        pending: () => {
        }
      },
      (m) => {
        if (n) {
          ft({});
          var h = (
            /** @type {ComponentContext} */
            Ye
          );
          h.c = n;
        }
        a && (r.$$events = a), u = e(m, r) || {}, n && dt();
      }
    ), () => {
      for (var m of c) {
        t.removeEventListener(m, fs);
        var h = (
          /** @type {number} */
          jt.get(m)
        );
        --h === 0 ? (document.removeEventListener(m, fs), jt.delete(m)) : jt.set(m, h);
      }
      yr.delete(v), b !== s && b.parentNode?.removeChild(b);
    };
  });
  return yi.set(u, _), u;
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
      te
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
      for (const [n, l] of this.#e) {
        if (this.#e.delete(n), n === t)
          break;
        const c = this.#t.get(l);
        c && (Oe(c.effect), this.#t.delete(l));
      }
      for (const [n, l] of this.#r) {
        if (n === s || this.#n.has(n)) continue;
        const c = () => {
          if (Array.from(this.#e.values()).includes(n)) {
            var u = document.createDocumentFragment();
            qa(l, u), u.append(it()), this.#t.set(n, { effect: l, fragment: u });
          } else
            Oe(l);
          this.#n.delete(n), this.#r.delete(n);
        };
        this.#i || !r ? (this.#n.add(n), Et(l, c, !1)) : c();
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
      s.includes(r) || (Oe(a.effect), this.#t.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, s) {
    var r = (
      /** @type {Batch} */
      te
    ), a = Fa();
    if (s && !this.#r.has(t) && !this.#t.has(t))
      if (a) {
        var n = document.createDocumentFragment(), l = it();
        n.append(l), this.#t.set(t, {
          effect: ze(() => s(l)),
          fragment: n
        });
      } else
        this.#r.set(
          t,
          ze(() => s(this.anchor))
        );
    if (this.#e.set(r, t), a) {
      for (const [c, v] of this.#r)
        c === t ? r.skipped_effects.delete(v) : r.skipped_effects.add(v);
      for (const [c, v] of this.#t)
        c === t ? r.skipped_effects.delete(v.effect) : r.skipped_effects.add(v.effect);
      r.oncommit(this.#a), r.ondiscard(this.#s);
    } else
      this.#a();
  }
}
function se(e, t, s = !1) {
  var r = new Wa(e), a = s ? Ft : 0;
  function n(l, c) {
    r.ensure(l, c);
  }
  Gs(() => {
    var l = !1;
    t((c, v = !0) => {
      l = !0, n(v, c);
    }), l || n(!1, null);
  }, a);
}
function Ie(e, t) {
  return t;
}
function xi(e, t, s) {
  for (var r = [], a = t.length, n, l = t.length, c = 0; c < a; c++) {
    let b = t[c];
    Et(
      b,
      () => {
        if (n) {
          if (n.pending.delete(b), n.done.add(b), n.pending.size === 0) {
            var m = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            xr(Us(n.done)), m.delete(n), m.size === 0 && (e.outrogroups = null);
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
      var u = (
        /** @type {Element} */
        s
      ), _ = (
        /** @type {Element} */
        u.parentNode
      );
      li(_), _.append(u), e.items.clear();
    }
    xr(t, !v);
  } else
    n = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(n);
}
function xr(e, t = !0) {
  for (var s = 0; s < e.length; s++)
    Oe(e[s], t);
}
var ea;
function Ee(e, t, s, r, a, n = null) {
  var l = e, c = /* @__PURE__ */ new Map(), v = (t & ua) !== 0;
  if (v) {
    var u = (
      /** @type {Element} */
      e
    );
    l = u.appendChild(it());
  }
  var _ = null, b = /* @__PURE__ */ Ar(() => {
    var g = s();
    return kr(g) ? g : g == null ? [] : Us(g);
  }), m, h = !0;
  function A() {
    f.fallback = _, ki(f, m, l, t, r), _ !== null && (m.length === 0 ? (_.f & nt) === 0 ? Ir(_) : (_.f ^= nt, ds(_, null, l)) : Et(_, () => {
      _ = null;
    }));
  }
  var x = Gs(() => {
    m = /** @type {V[]} */
    i(b);
    for (var g = m.length, $ = /* @__PURE__ */ new Set(), O = (
      /** @type {Batch} */
      te
    ), N = Fa(), F = 0; F < g; F += 1) {
      var q = m[F], U = r(q, F), B = h ? null : c.get(U);
      B ? (B.v && Wt(B.v, q), B.i && Wt(B.i, F), N && O.skipped_effects.delete(B.e)) : (B = Si(
        c,
        h ? l : ea ??= it(),
        q,
        U,
        F,
        a,
        t,
        s
      ), h || (B.e.f |= nt), c.set(U, B)), $.add(U);
    }
    if (g === 0 && n && !_ && (h ? _ = ze(() => n(l)) : (_ = ze(() => n(ea ??= it())), _.f |= nt)), !h)
      if (N) {
        for (const [ne, P] of c)
          $.has(ne) || O.skipped_effects.add(P.e);
        O.oncommit(A), O.ondiscard(() => {
        });
      } else
        A();
    i(b);
  }), f = { effect: x, items: c, outrogroups: null, fallback: _ };
  h = !1;
}
function ki(e, t, s, r, a) {
  var n = (r & Ln) !== 0, l = t.length, c = e.items, v = e.effect.first, u, _ = null, b, m = [], h = [], A, x, f, g;
  if (n)
    for (g = 0; g < l; g += 1)
      A = t[g], x = a(A, g), f = /** @type {EachItem} */
      c.get(x).e, (f.f & nt) === 0 && (f.nodes?.a?.measure(), (b ??= /* @__PURE__ */ new Set()).add(f));
  for (g = 0; g < l; g += 1) {
    if (A = t[g], x = a(A, g), f = /** @type {EachItem} */
    c.get(x).e, e.outrogroups !== null)
      for (const P of e.outrogroups)
        P.pending.delete(f), P.done.delete(f);
    if ((f.f & nt) !== 0)
      if (f.f ^= nt, f === v)
        ds(f, null, s);
      else {
        var $ = _ ? _.next : v;
        f === e.effect.last && (e.effect.last = f.prev), f.prev && (f.prev.next = f.next), f.next && (f.next.prev = f.prev), pt(e, _, f), pt(e, f, $), ds(f, $, s), _ = f, m = [], h = [], v = _.next;
        continue;
      }
    if ((f.f & He) !== 0 && (Ir(f), n && (f.nodes?.a?.unfix(), (b ??= /* @__PURE__ */ new Set()).delete(f))), f !== v) {
      if (u !== void 0 && u.has(f)) {
        if (m.length < h.length) {
          var O = h[0], N;
          _ = O.prev;
          var F = m[0], q = m[m.length - 1];
          for (N = 0; N < m.length; N += 1)
            ds(m[N], O, s);
          for (N = 0; N < h.length; N += 1)
            u.delete(h[N]);
          pt(e, F.prev, q.next), pt(e, _, F), pt(e, q, O), v = O, _ = q, g -= 1, m = [], h = [];
        } else
          u.delete(f), ds(f, v, s), pt(e, f.prev, f.next), pt(e, f, _ === null ? e.effect.first : _.next), pt(e, _, f), _ = f;
        continue;
      }
      for (m = [], h = []; v !== null && v !== f; )
        (u ??= /* @__PURE__ */ new Set()).add(v), h.push(v), v = v.next;
      if (v === null)
        continue;
    }
    (f.f & nt) === 0 && m.push(f), _ = f, v = f.next;
  }
  if (e.outrogroups !== null) {
    for (const P of e.outrogroups)
      P.pending.size === 0 && (xr(Us(P.done)), e.outrogroups?.delete(P));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (v !== null || u !== void 0) {
    var U = [];
    if (u !== void 0)
      for (f of u)
        (f.f & He) === 0 && U.push(f);
    for (; v !== null; )
      (v.f & He) === 0 && v !== e.fallback && U.push(v), v = v.next;
    var B = U.length;
    if (B > 0) {
      var ne = (r & ua) !== 0 && l === 0 ? s : null;
      if (n) {
        for (g = 0; g < B; g += 1)
          U[g].nodes?.a?.measure();
        for (g = 0; g < B; g += 1)
          U[g].nodes?.a?.fix();
      }
      xi(e, U, ne);
    }
  }
  n && yt(() => {
    if (b !== void 0)
      for (f of b)
        f.nodes?.a?.apply();
  });
}
function Si(e, t, s, r, a, n, l, c) {
  var v = (l & Nn) !== 0 ? (l & Hn) === 0 ? /* @__PURE__ */ ai(s, !1, !1) : Rt(s) : null, u = (l & $n) !== 0 ? Rt(a) : null;
  return {
    v,
    i: u,
    e: ze(() => (n(t, v ?? s, u ?? a, c), () => {
      e.delete(r);
    }))
  };
}
function ds(e, t, s) {
  if (e.nodes)
    for (var r = e.nodes.start, a = e.nodes.end, n = t && (t.f & nt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : s; r !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ks(r)
      );
      if (n.before(r), r === a)
        return;
      r = l;
    }
}
function pt(e, t, s) {
  t === null ? e.effect.first = s : t.next = s, s === null ? e.effect.last = t : s.prev = t;
}
function ta(e, t, s = !1, r = !1, a = !1) {
  var n = e, l = "";
  J(() => {
    var c = (
      /** @type {Effect} */
      ae
    );
    if (l !== (l = t() ?? "") && (c.nodes !== null && (Na(
      c.nodes.start,
      /** @type {TemplateNode} */
      c.nodes.end
    ), c.nodes = null), l !== "")) {
      var v = l + "";
      s ? v = `<svg>${v}</svg>` : r && (v = `<math>${v}</math>`);
      var u = Ga(v);
      if ((s || r) && (u = /** @type {Element} */
      /* @__PURE__ */ mt(u)), xs(
        /** @type {TemplateNode} */
        /* @__PURE__ */ mt(u),
        /** @type {TemplateNode} */
        u.lastChild
      ), s || r)
        for (; /* @__PURE__ */ mt(u); )
          n.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ mt(u)
          );
      else
        n.before(u);
    }
  });
}
function Mi(e, t, s) {
  var r = new Wa(e);
  Gs(() => {
    var a = t() ?? null;
    r.ensure(a, a && ((n) => s(n, a)));
  }, Ft);
}
const sa = [...` 	
\r\f \v\uFEFF`];
function Di(e, t, s) {
  var r = e == null ? "" : "" + e;
  if (t && (r = r ? r + " " + t : t), s) {
    for (var a in s)
      if (s[a])
        r = r ? r + " " + a : a;
      else if (r.length)
        for (var n = a.length, l = 0; (l = r.indexOf(a, l)) >= 0; ) {
          var c = l + n;
          (l === 0 || sa.includes(r[l - 1])) && (c === r.length || sa.includes(r[c])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(c + 1) : l = c;
        }
  }
  return r === "" ? null : r;
}
function Ei(e, t) {
  return e == null ? null : String(e);
}
function qe(e, t, s, r, a, n) {
  var l = e.__className;
  if (l !== s || l === void 0) {
    var c = Di(s, r, n);
    c == null ? e.removeAttribute("class") : e.className = c, e.__className = s;
  } else if (n && a !== n)
    for (var v in n) {
      var u = !!n[v];
      (a == null || u !== !!a[v]) && e.classList.toggle(v, u);
    }
  return n;
}
function gs(e, t, s, r) {
  var a = e.__style;
  if (a !== t) {
    var n = Ei(t);
    n == null ? e.removeAttribute("style") : e.style.cssText = n, e.__style = t;
  }
  return r;
}
function Za(e, t, s = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!kr(t))
      return jn();
    for (var r of e.options)
      r.selected = t.includes(bs(r));
    return;
  }
  for (r of e.options) {
    var a = bs(r);
    if (Da(a, t)) {
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
  }), Xs(() => {
    t.disconnect();
  });
}
function Ai(e, t, s = t) {
  var r = /* @__PURE__ */ new WeakSet(), a = !0;
  Pr(e, "change", (n) => {
    var l = n ? "[selected]" : ":checked", c;
    if (e.multiple)
      c = [].map.call(e.querySelectorAll(l), bs);
    else {
      var v = e.querySelector(l) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      c = v && bs(v);
    }
    s(c), te !== null && r.add(te);
  }), Ia(() => {
    var n = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        hs ?? te
      );
      if (r.has(l))
        return;
    }
    if (Za(e, n, a), a && n === void 0) {
      var c = e.querySelector(":checked");
      c !== null && (n = bs(c), s(n));
    }
    e.__value = n, a = !1;
  }), Ti(e);
}
function bs(e) {
  return "__value" in e ? e.__value : e.value;
}
const Fi = /* @__PURE__ */ Symbol("is custom element"), Pi = /* @__PURE__ */ Symbol("is html");
function xe(e, t, s, r) {
  var a = Ri(e);
  a[t] !== (a[t] = s) && (t === "loading" && (e[Mn] = s), s == null ? e.removeAttribute(t) : typeof s != "string" && Ii(e).includes(t) ? e[t] = s : e.setAttribute(t, s));
}
function Ri(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [Fi]: e.nodeName.includes("-"),
      [Pi]: e.namespaceURI === Bn
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
    for (var l in r)
      r[l].set && s.push(l);
    a = ia(a);
  }
  return s;
}
function _s(e, t, s = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Pr(e, "input", async (a) => {
    var n = a ? e.defaultValue : e.value;
    if (n = ur(e) ? fr(n) : n, s(n), te !== null && r.add(te), await Ja(), n !== (n = t())) {
      var l = e.selectionStart, c = e.selectionEnd, v = e.value.length;
      if (e.value = n ?? "", c !== null) {
        var u = e.value.length;
        l === c && c === v && u > v ? (e.selectionStart = u, e.selectionEnd = u) : (e.selectionStart = l, e.selectionEnd = Math.min(c, u));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Ws(t) == null && e.value && (s(ur(e) ? fr(e.value) : e.value), te !== null && r.add(te)), Ks(() => {
    var a = t();
    if (e === document.activeElement) {
      var n = (
        /** @type {Batch} */
        hs ?? te
      );
      if (r.has(n))
        return;
    }
    ur(e) && a === fr(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
const cr = /* @__PURE__ */ new Set();
function $s(e, t, s, r, a = r) {
  var n = s.getAttribute("type") === "checkbox", l = e;
  if (t !== null)
    for (var c of t)
      l = l[c] ??= [];
  l.push(s), Pr(
    s,
    "change",
    () => {
      var v = s.__value;
      n && (v = Oi(l, v, s.checked)), a(v);
    },
    // TODO better default value handling
    () => a(n ? [] : null)
  ), Ks(() => {
    var v = r();
    n ? (v = v || [], s.checked = v.includes(s.__value)) : s.checked = Da(s.__value, v);
  }), Xs(() => {
    var v = l.indexOf(s);
    v !== -1 && l.splice(v, 1);
  }), cr.has(l) || (cr.add(l), yt(() => {
    l.sort((v, u) => v.compareDocumentPosition(u) === 4 ? -1 : 1), cr.delete(l);
  })), yt(() => {
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
  return e === t || e?.[Dt] === t;
}
function We(e = {}, t, s, r) {
  return Ia(() => {
    var a, n;
    return Ks(() => {
      a = n, n = r?.() || [], Ws(() => {
        e !== s(...n) && (t(e, ...n), a && aa(s(...a), e) && t(null, ...a));
      });
    }), () => {
      yt(() => {
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
      if (us(r) && (r = r()), typeof r == "object" && r !== null && t in r) return r[t];
    }
  },
  set(e, t, s) {
    let r = e.props.length;
    for (; r--; ) {
      let a = e.props[r];
      us(a) && (a = a());
      const n = Mt(a, t);
      if (n && n.set)
        return n.set(s), !0;
    }
    return !1;
  },
  getOwnPropertyDescriptor(e, t) {
    let s = e.props.length;
    for (; s--; ) {
      let r = e.props[s];
      if (us(r) && (r = r()), typeof r == "object" && r !== null && t in r) {
        const a = Mt(r, t);
        return a && !a.configurable && (a.configurable = !0), a;
      }
    }
  },
  has(e, t) {
    if (t === Dt || t === Sn) return !1;
    for (let s of e.props)
      if (us(s) && (s = s()), s != null && t in s) return !0;
    return !1;
  },
  ownKeys(e) {
    const t = [];
    for (let s of e.props)
      if (us(s) && (s = s()), !!s) {
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
  ), n = !0, l = () => (n && (n = !1, a = /** @type {V} */
  r), a), c;
  c = /** @type {V} */
  e[t], c === void 0 && r !== void 0 && (c = l());
  var v;
  return v = () => {
    var u = (
      /** @type {V} */
      e[t]
    );
    return u === void 0 ? l() : (n = !0, u);
  }, v;
}
function Ct(e) {
  Ye === null && Dn(), Pa(() => {
    const t = Ws(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const $i = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add($i);
function Li(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var dr = { exports: {} }, na;
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
      }, s = t.en_US, r = new a(s, 0, !1);
      e.exports = r, typeof Date.now != "function" && (Date.now = function() {
        return +/* @__PURE__ */ new Date();
      });
      function a(x, f, g) {
        var $ = x || s, O = f || 0, N = g || !1, F = 0, q;
        function U(P, S) {
          var R;
          if (S) {
            if (R = S.getTime(), N) {
              var w = _(S);
              if (S = new Date(R + w + O), _(S) !== w) {
                var j = _(S);
                S = new Date(R + j + O);
              }
            }
          } else {
            var T = Date.now();
            T > F ? (F = T, q = new Date(F), R = F, N && (q = new Date(F + _(q) + O))) : R = F, S = q;
          }
          return B(P, S, $, R);
        }
        function B(P, S, R, T) {
          for (var w = "", j = null, G = !1, C = P.length, ie = !1, ve = 0; ve < C; ve++) {
            var ce = P.charCodeAt(ve);
            if (G === !0) {
              if (ce === 45) {
                j = "";
                continue;
              } else if (ce === 95) {
                j = " ";
                continue;
              } else if (ce === 48) {
                j = "0";
                continue;
              } else if (ce === 58) {
                ie && A("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), ie = !0;
                continue;
              }
              switch (ce) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  w += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  w += R.days[S.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  w += R.months[S.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  w += n(Math.floor(S.getFullYear() / 100), j);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  w += B(R.formats.D, S, R, T);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  w += B(R.formats.F, S, R, T);
                  break;
                // '00'
                // case 'H':
                case 72:
                  w += n(S.getHours(), j);
                  break;
                // '12'
                // case 'I':
                case 73:
                  w += n(c(S.getHours()), j);
                  break;
                // '000'
                // case 'L':
                case 76:
                  w += l(Math.floor(T % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  w += n(S.getMinutes(), j);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  w += S.getHours() < 12 ? R.am : R.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  w += B(R.formats.R, S, R, T);
                  break;
                // '00'
                // case 'S':
                case 83:
                  w += n(S.getSeconds(), j);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  w += B(R.formats.T, S, R, T);
                  break;
                // '00'
                // case 'U':
                case 85:
                  w += n(v(S, "sunday"), j);
                  break;
                // '00'
                // case 'W':
                case 87:
                  w += n(v(S, "monday"), j);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  w += B(R.formats.X, S, R, T);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  w += S.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (N && O === 0)
                    w += "GMT";
                  else {
                    var Y = b(S);
                    w += Y || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  w += R.shortDays[S.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  w += R.shortMonths[S.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  w += B(R.formats.c, S, R, T);
                  break;
                // '01'
                // case 'd':
                case 100:
                  w += n(S.getDate(), j);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  w += n(S.getDate(), j ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  w += R.shortMonths[S.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var Z = new Date(S.getFullYear(), 0, 1), z = Math.ceil((S.getTime() - Z.getTime()) / (1e3 * 60 * 60 * 24));
                  w += l(z);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  w += n(S.getHours(), j ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  w += n(c(S.getHours()), j ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  w += n(S.getMonth() + 1, j);
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
                  var z = S.getDate();
                  R.ordinalSuffixes ? w += String(z) + (R.ordinalSuffixes[z - 1] || u(z)) : w += String(z) + u(z);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  w += S.getHours() < 12 ? R.AM : R.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  w += B(R.formats.r, S, R, T);
                  break;
                // '0'
                // case 's':
                case 115:
                  w += Math.floor(T / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  w += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var z = S.getDay();
                  w += z === 0 ? 7 : z;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  w += B(R.formats.v, S, R, T);
                  break;
                // '4'
                // case 'w':
                case 119:
                  w += S.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  w += B(R.formats.x, S, R, T);
                  break;
                // '70'
                // case 'y':
                case 121:
                  w += n(S.getFullYear() % 100, j);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (N && O === 0)
                    w += ie ? "+00:00" : "+0000";
                  else {
                    var X;
                    O !== 0 ? X = O / (60 * 1e3) : X = -S.getTimezoneOffset();
                    var le = X < 0 ? "-" : "+", re = ie ? ":" : "", W = Math.floor(Math.abs(X / 60)), Q = Math.abs(X % 60);
                    w += le + n(W) + re + n(Q);
                  }
                  break;
                default:
                  G && (w += "%"), w += P[ve];
                  break;
              }
              j = null, G = !1;
              continue;
            }
            if (ce === 37) {
              G = !0;
              continue;
            }
            w += P[ve];
          }
          return w;
        }
        var ne = U;
        return ne.localize = function(P) {
          return new a(P || $, O, N);
        }, ne.localizeByIdentifier = function(P) {
          var S = t[P];
          return S ? ne.localize(S) : (A('[WARNING] No locale found with identifier "' + P + '".'), ne);
        }, ne.timezone = function(P) {
          var S = O, R = N, T = typeof P;
          if (T === "number" || T === "string")
            if (R = !0, T === "string") {
              var w = P[0] === "-" ? -1 : 1, j = parseInt(P.slice(1, 3), 10), G = parseInt(P.slice(3, 5), 10);
              S = w * (60 * j + G) * 60 * 1e3;
            } else T === "number" && (S = P * 60 * 1e3);
          return new a($, S, R);
        }, ne.utc = function() {
          return new a($, O, !0);
        }, ne;
      }
      function n(x, f) {
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
        var g = x.getDay();
        f === "monday" && (g === 0 ? g = 6 : g--);
        var $ = Date.UTC(x.getFullYear(), 0, 1), O = Date.UTC(x.getFullYear(), x.getMonth(), x.getDate()), N = Math.floor((O - $) / 864e5), F = (N + 7 - g) / 7;
        return Math.floor(F);
      }
      function u(x) {
        var f = x % 10, g = x % 100;
        if (g >= 11 && g <= 13 || f === 0 || f >= 4)
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
        return m() || h(x);
      }
      function m(x, f) {
        return null;
      }
      function h(x) {
        var f = x.toString().match(/\(([\w\s]+)\)/);
        return f && f[1];
      }
      function A(x) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(x);
      }
    })();
  })(dr)), dr.exports;
}
var qi = Hi();
const Vt = /* @__PURE__ */ Li(qi);
let _r = /* @__PURE__ */ H(!1);
class Yi {
  constructor(t) {
    if (this.sk = "", this.fetchFn = t || (typeof window < "u" ? fetch.bind(window) : fetch), typeof document < "u") {
      const s = document.querySelector('meta[name="csrf-token"]');
      s && (this.sk = s.content);
    }
  }
  get loading() {
    return i(_r);
  }
  async request(t, s = {}) {
    k(_r, !0);
    try {
      const r = new URL(t, window.location.origin);
      s.params && Object.entries(s.params).forEach(([c, v]) => {
        r.searchParams.append(c, String(v));
      });
      const a = new Headers(s.headers || {});
      a.set("X-Requested-With", "fetch");
      let n = s.body;
      s.method && ["POST", "PUT", "PATCH", "DELETE"].includes(s.method.toUpperCase()) && (n instanceof FormData ? n.set("sk", this.sk) : n && typeof n == "object" && !(n instanceof Blob) && !(n instanceof ArrayBuffer) && (a.set("Content-Type", "application/json"), n = JSON.stringify(n)));
      const l = await this.fetchFn(r.toString(), { ...s, headers: a, body: n });
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
const oe = new Yi(), Bi = (e, t = Xt) => {
  var s = ji(), r = o(s);
  J(() => {
    qe(s, 1, `status status-${t().status ?? ""}`, "svelte-13s7gu4"), E(r, t().status);
  }), M(e, s);
};
var ji = /* @__PURE__ */ I("<span> </span>"), Ui = /* @__PURE__ */ I('<time class="svelte-13s7gu4"> </time>'), zi = /* @__PURE__ */ I('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Ji = /* @__PURE__ */ I('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), Vi = /* @__PURE__ */ I('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Xi = /* @__PURE__ */ I('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), Ki = /* @__PURE__ */ I('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4">エントリ一覧</h2> <div class="search-box svelte-13s7gu4"><input type="text" placeholder="検索..." class="svelte-13s7gu4"/> <button class="svelte-13s7gu4">検索</button></div> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">新しい方へ</button> <button class="svelte-13s7gu4">古い方へ</button></div></div> <div><!></div></div>');
function Gi(e, t) {
  ft(t, !0);
  const s = (P, S = Xt, R) => {
    let T = /* @__PURE__ */ Ar(() => oa(R?.(), !0));
    var w = Ui(), j = o(w);
    J(
      (G) => {
        xe(w, "datetime", S()), E(j, G);
      },
      [() => i(T) && S() ? m(S()) : "-"]
    ), M(P, w);
  };
  let r = /* @__PURE__ */ H(De([])), a = /* @__PURE__ */ H(!1), n = 50, l = /* @__PURE__ */ H(""), c = /* @__PURE__ */ H(De([]));
  async function v() {
    try {
      const P = i(c)[i(c).length - 1], S = { limit: n };
      i(l) && (S.q = i(l)), P && (S.cursor_id = P);
      const R = await oe.get("/admin/api/entries", S);
      k(r, R.entries || [], !0), k(a, R.has_more || !1, !0);
    } catch (P) {
      console.error(P);
    }
  }
  function u() {
    k(c, [], !0), v();
  }
  Ct(v);
  function _() {
    if (i(a) && i(r).length > 0) {
      const P = i(r)[i(r).length - 1];
      i(c).push(P.id), v();
    }
  }
  function b() {
    i(c).length > 0 && (i(c).pop(), v());
  }
  function m(P) {
    return P ? Vt("%Y-%m-%d %H:%M", new Date(P)) : "-";
  }
  var h = Ki(), A = o(h), x = d(o(A), 2), f = o(x);
  f.__keydown = (P) => P.key === "Enter" && u();
  var g = d(f, 2);
  g.__click = u;
  var $ = d(x, 2), O = o($);
  O.__click = b;
  var N = d(O, 2);
  N.__click = _;
  var F = d(A, 2);
  let q;
  var U = o(F);
  {
    var B = (P) => {
      var S = zi();
      M(P, S);
    }, ne = (P) => {
      var S = Xi(), R = Xe(S), T = d(o(R));
      Ee(T, 21, () => i(r), Ie, (G, C) => {
        var ie = Ji(), ve = o(ie), ce = o(ve), Y = d(ve), Z = o(Y), z = d(Y), X = o(z);
        Bi(X, () => i(C));
        var le = d(z), re = o(le), W = o(re), Q = d(re, 2), ue = o(Q), de = o(ue), me = d(le), we = o(me), Se = d(me), Ne = o(Se);
        s(Ne, () => i(C).created_at);
        var p = d(Se), y = o(p);
        s(y, () => i(C).modified_at);
        var L = d(p), ee = o(L);
        s(ee, () => i(C).publish_at?.Time, () => i(C).publish_at?.Valid);
        var _e = d(L), ge = o(_e);
        ge.__click = () => t.onEdit(i(C).id), J(() => {
          E(ce, i(C).id), E(Z, i(C).date), E(W, i(C).title), xe(ue, "href", `/${i(C).path ?? ""}`), E(de, `/${i(C).path ?? ""}`), E(we, i(C).format);
        }), M(G, ie);
      });
      var w = d(R, 2);
      {
        var j = (G) => {
          var C = Vi();
          M(G, C);
        };
        se(w, (G) => {
          oe.loading && G(j);
        });
      }
      M(P, S);
    };
    se(U, (P) => {
      oe.loading && i(r).length === 0 ? P(B) : P(ne, !1);
    });
  }
  J(() => {
    O.disabled = i(c).length === 0 || oe.loading, N.disabled = !i(a) || oe.loading, q = qe(F, 1, "table-container svelte-13s7gu4", null, q, { "is-loading": oe.loading });
  }), _s(f, () => i(l), (P) => k(l, P)), M(e, h), dt();
}
Ms(["keydown", "click"]);
class Wi {
  #e;
  get exists() {
    return i(this.#e);
  }
  set exists(t) {
    k(this.#e, t, !0);
  }
  #r;
  get data() {
    return i(this.#r);
  }
  set data(t) {
    k(this.#r, t, !0);
  }
  constructor(t = typeof localStorage < "u" ? localStorage : null) {
    this.storage = t, this.timer = null, this.#e = /* @__PURE__ */ H(!1), this.#r = /* @__PURE__ */ H(null);
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
const Zi = "public", Qi = "draft", el = "scheduled", tl = "reserved", Ut = Zi, hr = Qi, Ls = el, Hs = tl;
var sl = /* @__PURE__ */ I('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), rl = /* @__PURE__ */ I('<option class="svelte-7nstam"> </option>'), al = /* @__PURE__ */ I('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), nl = /* @__PURE__ */ I('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), il = /* @__PURE__ */ I('<button id="restore" type="button" class="submit-button restore-button svelte-7nstam">復元...</button>'), ll = /* @__PURE__ */ I('<div role="option" tabindex="-1"> </div>'), ol = /* @__PURE__ */ I('<div class="preview-overlay svelte-7nstam"><div class="preview-progress-container svelte-7nstam"><div class="preview-progress-bar svelte-7nstam"></div> <div class="preview-progress-text svelte-7nstam">読み込み中...</div></div></div>'), vl = /* @__PURE__ */ I('<span class="tag svelte-7nstam"> </span>'), cl = /* @__PURE__ */ I('<div role="button" tabindex="-1"><div class="result-title svelte-7nstam"><!> <!> <button type="button" class="open-result-button svelte-7nstam" title="別タブで開く">↗️</button></div> <div class="result-summary svelte-7nstam"><!></div> <div class="result-meta svelte-7nstam"><span class="result-date svelte-7nstam"> </span> <span class="result-path svelte-7nstam"> </span></div></div>'), ul = /* @__PURE__ */ I('<div class="no-results svelte-7nstam">結果が見つかりません</div>'), fl = /* @__PURE__ */ I('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam">🔗 リンク</button> <button type="button" class="svelte-7nstam"> </button> <span class="char-count svelte-7nstam"> </span> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons footer-container svelte-7nstam"><div class="status-selector svelte-7nstam"><label class="status-option svelte-7nstam" title="非公開のまま保存します"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">下書き</span></div></label> <label class="status-option svelte-7nstam" title="今すぐ公開し、URLを確定させます"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">公開</span></div></label> <label class="status-option svelte-7nstam" title="指定した日時に公開します。URLは今すぐ確定します。"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">公開を遅延</span> <span class="description svelte-7nstam">URL確定</span></div></label> <label class="status-option svelte-7nstam" title="指定した日付を投稿日として予約します。公開されるまでURLは確定しません。"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">予約投稿</span> <span class="description svelte-7nstam">URL未定</span></div></label></div> <div class="action-row-container svelte-7nstam"><div class="footer-left svelte-7nstam"><button type="button" class="submit-button svelte-7nstam"><!></button> <!></div> <div class="footer-right svelte-7nstam"><!> <button type="button" class="submit-button preview-button svelte-7nstam">プレビュー</button></div></div></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam" role="listbox" aria-label="タグを選択" tabindex="0"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog> <dialog id="previewDialog" class="svelte-7nstam"><div class="preview-header svelte-7nstam"><h3 class="svelte-7nstam">プレビュー</h3> <button type="button" class="close-button svelte-7nstam">閉じる</button></div> <div class="preview-body svelte-7nstam"><!> <iframe name="preview-iframe" title="Preview" class="svelte-7nstam"></iframe></div></dialog> <dialog id="searchDialog" class="search-dialog svelte-7nstam"><div class="search-header svelte-7nstam"><h3 class="svelte-7nstam">過去日記を検索</h3> <button type="button" class="close-button svelte-7nstam">閉じる</button></div> <div class="search-body svelte-7nstam"><input type="search" placeholder="キーワードを入力..." class="search-input svelte-7nstam"/> <div class="search-results svelte-7nstam"></div></div> <div class="dialog-footer svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button></div></dialog>', 1);
function dl(e, t) {
  ft(t, !0);
  const s = [];
  let r = Qa(t, "id", 3, null);
  const a = new Wi();
  let n = /* @__PURE__ */ H(De({ id: void 0, title: "", body: "", status: "" })), l = De({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: Ut,
    publishAt: ""
  }), c = /* @__PURE__ */ H(!1), v = /* @__PURE__ */ H(""), u = /* @__PURE__ */ H(!1), _ = /* @__PURE__ */ H(!0), b = /* @__PURE__ */ H(!1), m = /* @__PURE__ */ H(null), h = /* @__PURE__ */ H(null), A = /* @__PURE__ */ H(null), x = /* @__PURE__ */ H(null), f = /* @__PURE__ */ H(null), g = /* @__PURE__ */ H(null), $ = /* @__PURE__ */ H(null);
  const O = [
    "tech",
    "photo",
    "redeveloped",
    "stablediffusion",
    "photoshopped"
  ];
  let N = /* @__PURE__ */ H(0), F = /* @__PURE__ */ H(""), q = /* @__PURE__ */ H(De([])), U = /* @__PURE__ */ H(0), B = /* @__PURE__ */ H(null), ne = De([]);
  async function P(p) {
    try {
      k(_, !0);
      const y = await oe.get(`/admin/api/entry/${p}`);
      k(n, y, !0), l.id = y.id, l.title = y.title ?? "", l.body = y.body ?? "", l.format = y.format || "Hatena", l.status = y.status, y.publish_at?.Valid ? l.publishAt = Vt("%Y-%m-%dT%H:%M", new Date(y.publish_at.Time)) : l.publishAt = Vt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), a.check(i(n).id ?? null, { title: l.title, body: l.body });
    } catch (y) {
      console.error(y), alert("エントリの取得に失敗しました");
    } finally {
      k(_, !1);
    }
  }
  Ct(() => {
    r() ? P(r()) : (k(n, { id: void 0, title: "", body: "", status: Ut }, !0), l.id = null, l.title = "", l.body = "", l.format = "Hatena", l.status = Ut, l.publishAt = Vt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), a.check(null, { title: l.title, body: l.body }), k(_, !1));
  }), Pa(() => {
    (i(n).title !== l.title || i(n).body !== l.body) && a.saveDebounced(i(n).id ?? null, { title: l.title, body: l.body });
  });
  async function S() {
    k(c, !0), k(v, "リクエスト中");
    const p = new FormData();
    if (p.set("id", l.id ? String(l.id) : ""), p.set("title", l.title), p.set("body", l.body), p.set("format", l.format), l.status === Ls || l.status === Hs) {
      const y = new Date(l.publishAt);
      p.set("publish_at", y.toISOString());
    }
    p.set("status", l.status);
    try {
      const L = (await oe.post("/admin/api/edit", p)).session_id;
      if (!L)
        throw new Error("保存に失敗しました");
      R(L);
    } catch (y) {
      k(c, !1), alert(y instanceof Error ? y.message : "エラーが発生しました");
    }
  }
  function R(p) {
    const y = new EventSource(`/admin/api/edit/progress?sid=${p}`);
    y.onmessage = (L) => {
      const ee = JSON.parse(L.data);
      switch (ee.type) {
        case "progress":
          k(v, T(ee.message), !0);
          break;
        case "done":
          a.clear(i(n).id ?? null), k(v, "完了"), k(c, !1), y.close(), t.onSave(ee.location);
          break;
        case "error":
          k(v, "エラー: " + ee.message), k(c, !1), y.close(), alert("保存に失敗しました: " + ee.message);
          break;
      }
    }, y.onerror = () => {
      k(c, !1), y.close(), alert("通信エラーが発生しました");
    };
  }
  function T(p) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[p] || p;
  }
  function w() {
    k(N, 0), i(A).showModal(), setTimeout(() => i($)?.focus(), 0);
  }
  function j(p) {
    p.key === "ArrowDown" ? (p.preventDefault(), k(N, (i(N) + 1) % O.length)) : p.key === "ArrowUp" ? (p.preventDefault(), k(N, (i(N) - 1 + O.length) % O.length)) : p.key === "Enter" || p.key === " " ? (p.preventDefault(), G(O[i(N)])) : p.key === "Escape" && i(A).close();
  }
  function G(p) {
    const y = `[${p}]`;
    l.title.includes(y) ? l.title = l.title.replace(y, "") : l.title = y + l.title, i(A).close(), i(m).focus();
  }
  function C() {
    k(F, ""), k(q, [], !0), k(U, 0), i(g).showModal(), setTimeout(() => i(B)?.focus(), 0);
  }
  async function ie(p) {
    if (!(p instanceof KeyboardEvent && p.key === "Enter")) {
      if (i(F).length < 2) {
        k(q, [], !0);
        return;
      }
      try {
        const y = await oe.get("/api/search", { q: i(F) });
        k(q, y.results || [], !0), k(U, 0);
      } catch (y) {
        console.error(y);
      }
    }
  }
  function ve(p) {
    p.key === "ArrowDown" || p.ctrlKey && p.key === "n" ? (p.preventDefault(), k(U, (i(U) + 1) % i(q).length), ne[i(U)]?.scrollIntoView({ block: "nearest" })) : p.key === "ArrowUp" || p.ctrlKey && p.key === "p" ? (p.preventDefault(), k(U, (i(U) - 1 + i(q).length) % i(q).length), ne[i(U)]?.scrollIntoView({ block: "nearest" })) : p.key === "Enter" ? (p.preventDefault(), i(q)[i(U)] && (p.shiftKey || p.metaKey || p.ctrlKey ? ce(i(q)[i(U)]) : Y(i(q)[i(U)]))) : p.key === "Escape" && i(g).close();
  }
  function ce(p) {
    const y = p.path.startsWith("http") ? p.path : `${location.origin}/${p.path}`;
    window.open(y, "_blank");
  }
  function Y(p) {
    const y = p.path.startsWith("http") ? p.path : `${location.origin}/${p.path}`;
    let L = "";
    switch (l.format) {
      case "Hatena":
        L = `[${y}:title=${p.title}]`;
        break;
      case "Markdown":
        L = `[${p.title}](${y})`;
        break;
      case "HTML":
        L = `<a href="${y}">${p.title}</a>`;
        break;
      case "tDiary":
        L = `[[${p.title}|${y}]]`;
        break;
      default:
        L = y;
    }
    X(L), i(g).close(), i(h).focus();
  }
  function Z() {
    a.data && (l.title = a.data.title, l.body = a.data.body, a.clear(i(n).id ?? null), i(x).close());
  }
  async function z() {
    const p = document.createElement("input");
    p.type = "file", p.oninput = async () => {
      if (!p.files?.[0]) return;
      const y = new FormData();
      y.append("file", p.files[0]), k(u, !0);
      try {
        const L = await oe.post("/admin/api/upload/image", y);
        let ee = "";
        L.uploaded.toLowerCase().endsWith(".webm") ? ee = `<video src="${L.uploaded}" autoplay loop muted playsinline style="max-width: 100%; height: auto;"></video>
` : ee = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${L.uploaded}" class="picasa" itemprop="url"><img src="${L.uploaded}" alt="photo" itemprop="image"/></a></span>
`, X(ee, !0);
      } catch {
        alert("アップロードに失敗しました");
      } finally {
        k(u, !1);
      }
    }, p.click();
  }
  function X(p, y = !1) {
    const L = i(h).selectionStart, ee = i(h).selectionEnd, _e = i(h).value;
    l.body = _e.substring(0, L) + p + _e.substring(ee), Ja().then(() => {
      typeof y == "boolean" && y ? (i(h).selectionStart = L, i(h).selectionEnd = L + p.length) : typeof y == "number" ? i(h).selectionStart = i(h).selectionEnd = L + y : i(h).selectionStart = i(h).selectionEnd = L + p.length, i(h).focus();
    });
  }
  function le(p) {
    const y = (p.altKey ? "Alt-" : "") + (p.ctrlKey ? "Control-" : "") + (p.metaKey ? "Meta-" : "") + (p.shiftKey ? "Shift-" : "") + p.key;
    y === "Control-t" ? (X("\\(  \\)", 3), p.preventDefault(), p.stopPropagation()) : (y === "Control-l" || y === "Meta-l") && (C(), p.preventDefault(), p.stopPropagation());
  }
  function re() {
    i(f).showModal();
    const p = document.getElementsByName("preview-iframe")[0];
    p && (p.src = "about:blank"), setTimeout(
      () => {
        k(b, !0);
      },
      0
    );
    const y = document.createElement("form");
    y.method = "POST", y.action = "/admin/api/preview", y.target = "preview-iframe";
    const L = {
      title: l.title,
      body: l.body,
      format: l.format,
      sk: oe.skValue
    };
    for (const [ee, _e] of Object.entries(L)) {
      const ge = document.createElement("input");
      ge.type = "hidden", ge.name = ee, ge.value = _e, y.appendChild(ge);
    }
    document.body.appendChild(y), y.submit(), document.body.removeChild(y);
  }
  function W() {
    k(b, !1), i(f).close();
  }
  function Q(p) {
    const y = document.createElement("p");
    return y.textContent = p, y.innerHTML;
  }
  function ue(p, y) {
    if (!y) return Q(p);
    const L = Q(p), ee = y.split(/\s+/).filter((Ae) => Ae.length >= 2);
    if (ee.length === 0) return L;
    const _e = ee.map((Ae) => Ae.replace(/[.*+?^${}()|[\\]/g, "\\$&")).join("|"), ge = new RegExp(`(${_e})`, "gi");
    return L.replace(ge, "<mark>$1</mark>");
  }
  function de(p) {
    const L = new DOMParser().parseFromString(p, "text/html");
    L.querySelectorAll("script, style, noscript, iframe").forEach((_e) => _e.remove());
    const ee = L.body.textContent || "";
    return ee.replace(/\s+/g, " ").trim().substring(0, 200) + (ee.length > 200 ? "..." : "");
  }
  var me = St(), we = Xe(me);
  {
    var Se = (p) => {
      var y = sl();
      M(p, y);
    }, Ne = (p) => {
      var y = fl(), L = Xe(y), ee = o(L), _e = o(ee);
      We(_e, (D) => k(m, D), () => i(m));
      var ge = d(_e, 2), Ae = o(ge);
      Ae.__click = w;
      var Ge = d(Ae, 2);
      Ge.__click = C;
      var fe = d(Ge, 2);
      fe.__click = z;
      var Me = o(fe), Be = d(fe, 2), Nt = o(Be), $t = d(Be, 2);
      Ee($t, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], Ie, (D, V) => {
        var pe = rl(), he = o(pe), Pe = {};
        J(() => {
          E(he, V), Pe !== (Pe = V) && (pe.value = (pe.__value = V) ?? "");
        }), M(D, pe);
      });
      var Lt = d(ge, 2), tt = o(Lt);
      tt.__keydown = le, We(tt, (D) => k(h, D), () => i(h));
      var Ht = d(ee, 2), Qt = o(Ht);
      {
        var Zs = (D) => {
          var V = al();
          M(D, V);
        };
        se(Qt, (D) => {
          i(c) && D(Zs);
        });
      }
      var Qs = d(Qt, 2), es = o(Qs), Ds = o(es), ts = o(Ds), ss, Es = d(Ds, 2), rs = o(Es), as, Ts = d(Es, 2), ns = o(Ts), is, er = d(Ts, 2), ls = o(er), As, tr = d(es, 2), Fs = o(tr), qt = o(Fs);
      qt.__click = S;
      var sr = o(qt);
      {
        var rr = (D) => {
          var V = zt();
          J(() => E(V, i(v) || "リクエスト中")), M(D, V);
        }, os = (D) => {
          var V = St(), pe = Xe(V);
          {
            var he = ($e) => {
              var st = zt("下書き保存");
              M($e, st);
            }, Pe = ($e) => {
              var st = St(), Is = Xe(st);
              {
                var or = (ht) => {
                  var Bt = zt();
                  J(() => E(Bt, r() ? "更新する" : "公開する")), M(ht, Bt);
                }, Os = (ht) => {
                  var Bt = zt("予約する");
                  M(ht, Bt);
                };
                se(
                  Is,
                  (ht) => {
                    l.status === Ut ? ht(or) : ht(Os, !1);
                  },
                  !0
                );
              }
              M($e, st);
            };
            se(
              pe,
              ($e) => {
                l.status === hr ? $e(he) : $e(Pe, !1);
              },
              !0
            );
          }
          M(D, V);
        };
        se(sr, (D) => {
          i(c) ? D(rr) : D(os, !1);
        });
      }
      var Yt = d(qt, 2);
      {
        var xt = (D) => {
          var V = nl();
          _s(V, () => l.publishAt, (pe) => l.publishAt = pe), M(D, V);
        };
        se(Yt, (D) => {
          (l.status === Ls || l.status === Hs) && D(xt);
        });
      }
      var vs = d(Fs, 2), Ps = o(vs);
      {
        var ar = (D) => {
          var V = il();
          V.__click = () => i(x).showModal(), M(D, V);
        };
        se(Ps, (D) => {
          a.exists && D(ar);
        });
      }
      var Or = d(Ps, 2);
      Or.__click = re;
      var nr = d(L, 2), Rs = d(o(nr), 2);
      Rs.__keydown = j, Ee(Rs, 21, () => O, Ie, (D, V, pe) => {
        var he = ll();
        let Pe;
        he.__click = () => G(i(V)), he.__keydown = (st) => st.key === "Enter" && G(i(V));
        var $e = o(he);
        J(() => {
          Pe = qe(he, 1, "tag-item svelte-7nstam", null, Pe, { selected: i(N) === pe }), xe(he, "aria-selected", i(N) === pe), E($e, i(V));
        }), Ns("mouseenter", he, () => k(N, pe, !0)), M(D, he);
      }), We(Rs, (D) => k($, D), () => i($));
      var en = d(Rs, 2);
      en.__click = () => i(A).close(), We(nr, (D) => k(A, D), () => i(A));
      var ir = d(nr, 2), Cr = d(o(ir), 2), tn = o(Cr);
      {
        var sn = (D) => {
          var V = zt();
          J((pe) => E(V, pe), [() => Vt("%Y年%m月%d日%H時", new Date(a.data.time))]), M(D, V);
        };
        se(tn, (D) => {
          a.data?.time && D(sn);
        });
      }
      var rn = d(Cr, 2), Nr = o(rn);
      Nr.__click = () => i(x).close();
      var an = d(Nr, 2);
      an.__click = Z, We(ir, (D) => k(x, D), () => i(x));
      var lr = d(ir, 2), $r = o(lr), nn = d(o($r), 2);
      nn.__click = W;
      var ln = d($r, 2), Lr = o(ln);
      {
        var on = (D) => {
          var V = ol();
          M(D, V);
        };
        se(Lr, (D) => {
          i(b) && D(on);
        });
      }
      var Hr = d(Lr, 2);
      We(lr, (D) => k(f, D), () => i(f));
      var qr = d(lr, 2), Yr = o(qr), vn = d(o(Yr), 2);
      vn.__click = () => i(g).close();
      var Br = d(Yr, 2), cs = o(Br);
      cs.__input = (D) => ie(D), cs.__keydown = ve, We(cs, (D) => k(B, D), () => i(B));
      var cn = d(cs, 2);
      Ee(
        cn,
        21,
        () => i(q),
        Ie,
        (D, V, pe) => {
          var he = cl();
          let Pe;
          he.__click = () => Y(i(V)), he.__keydown = (rt) => rt.key === "Enter" && Y(i(V));
          var $e = o(he), st = o($e);
          ta(st, () => ue(i(V).title, i(F)));
          var Is = d(st, 2);
          Ee(Is, 17, () => i(V).tags, Ie, (rt, vr) => {
            var Ur = vl(), pn = o(Ur);
            J(() => E(pn, i(vr))), M(rt, Ur);
          });
          var or = d(Is, 2);
          or.__click = (rt) => {
            rt.stopPropagation(), ce(i(V));
          };
          var Os = d($e, 2), ht = o(Os);
          ta(ht, () => ue(de(i(V).formatted_body), i(F)));
          var Bt = d(Os, 2), jr = o(Bt), dn = o(jr), _n = d(jr, 2), hn = o(_n);
          We(he, (rt, vr) => ne[vr] = rt, (rt) => ne?.[rt], () => [pe]), J(() => {
            Pe = qe(he, 1, "search-result-item svelte-7nstam", null, Pe, { selected: i(U) === pe }), E(dn, i(V).date), E(hn, i(V).path);
          }), Ns("mouseenter", he, () => k(U, pe, !0)), M(D, he);
        },
        (D) => {
          var V = St(), pe = Xe(V);
          {
            var he = (Pe) => {
              var $e = ul();
              M(Pe, $e);
            };
            se(pe, (Pe) => {
              i(F).length >= 2 && Pe(he);
            });
          }
          M(D, V);
        }
      );
      var un = d(Br, 2), fn = o(un);
      fn.__click = () => i(g).close(), We(qr, (D) => k(g, D), () => i(g)), J(() => {
        fe.disabled = i(u), E(Me, i(u) ? "⌛ アップロード中..." : "📷 写真"), E(Nt, `${(l.body ?? "").length ?? ""} 文字`), ss !== (ss = hr) && (ts.value = (ts.__value = hr) ?? ""), as !== (as = Ut) && (rs.value = (rs.__value = Ut) ?? ""), is !== (is = Ls) && (ns.value = (ns.__value = Ls) ?? ""), As !== (As = Hs) && (ls.value = (ls.__value = Hs) ?? ""), qt.disabled = i(c), Or.disabled = i(c);
      }), _s(_e, () => l.title, (D) => l.title = D), Ai($t, () => l.format, (D) => l.format = D), _s(tt, () => l.body, (D) => l.body = D), $s(
        s,
        [],
        ts,
        () => l.status,
        (D) => l.status = D
      ), $s(
        s,
        [],
        rs,
        () => l.status,
        (D) => l.status = D
      ), $s(
        s,
        [],
        ns,
        () => l.status,
        (D) => l.status = D
      ), $s(
        s,
        [],
        ls,
        () => l.status,
        (D) => l.status = D
      ), Ns("load", Hr, () => {
        i(b) && k(b, !1);
      }), Ns("error", Hr, () => {
        k(b, !1), alert("プレビューの読み込みに失敗しました");
      }), _s(cs, () => i(F), (D) => k(F, D)), M(p, y);
    };
    se(we, (p) => {
      i(_) ? p(Se) : p(Ne, !1);
    });
  }
  M(e, me), dt();
}
Ms(["click", "keydown", "input"]);
const _l = (e, t = Xt) => {
  var s = hl(), r = o(s);
  J(() => {
    qe(s, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), E(r, t());
  }), M(e, s);
};
var hl = /* @__PURE__ */ I("<span> </span>"), pl = /* @__PURE__ */ I('<time class="time svelte-1r6codn"> </time>'), ml = /* @__PURE__ */ I('<span class="dep-type svelte-1r6codn"> </span>'), gl = /* @__PURE__ */ I('<button><span class="dep-id svelte-1r6codn"> </span> <!> <span class="dep-cond svelte-1r6codn"> </span></button>'), bl = /* @__PURE__ */ I('<div class="loading svelte-1r6codn"></div>'), wl = /* @__PURE__ */ I('<span class="uniqkey svelte-1r6codn"> </span>'), yl = /* @__PURE__ */ I('<div class="depends-on svelte-1r6codn"><div class="strategy svelte-1r6codn"> </div> <div class="dep-list svelte-1r6codn"></div></div>'), xl = /* @__PURE__ */ I('<div class="error-text svelte-1r6codn"> </div>'), kl = /* @__PURE__ */ I('<tr><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><div class="type-uniqkey svelte-1r6codn"><strong class="svelte-1r6codn"> </strong> <!></div></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"><!></td><td class="error svelte-1r6codn"><!></td></tr>'), Sl = /* @__PURE__ */ I('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type / Uniqkey</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Finished At</th><th class="svelte-1r6codn">Depends On</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), Ml = /* @__PURE__ */ I('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">新しい方へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">古い方へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function Dl(e, t) {
  ft(t, !0);
  const s = (T, w = Xt, j) => {
    let G = /* @__PURE__ */ Ar(() => oa(j?.(), !0));
    var C = pl(), ie = o(C);
    J(
      (ve) => {
        xe(C, "datetime", w()), E(ie, ve);
      },
      [() => i(G) && w() ? x(w()) : "-"]
    ), M(T, C);
  }, r = (T, w = Xt, j = Xt) => {
    const G = /* @__PURE__ */ Qe(() => _(w()));
    var C = gl();
    C.__click = () => b(w());
    var ie = o(C), ve = o(ie), ce = d(ie, 2);
    {
      var Y = (X) => {
        var le = ml(), re = o(le);
        J(() => E(re, i(G).job_type_name)), M(X, le);
      };
      se(ce, (X) => {
        i(G) && X(Y);
      });
    }
    var Z = d(ce, 2), z = o(Z);
    J(() => {
      qe(C, 1, `dep-chip status-${(i(G)?.status || "unknown") ?? ""}`, "svelte-1r6codn"), E(ve, `#${w() ?? ""}`), xe(Z, "title", `Condition: ${j() ?? ""}`), E(z, j() === "completed" ? "✅" : "🏁");
    }), M(T, C);
  };
  let a = /* @__PURE__ */ H(De([])), n = /* @__PURE__ */ H(0), l = /* @__PURE__ */ H(0), c = 50, v = /* @__PURE__ */ H(null);
  function u(T) {
    if (!T.depends_on?.Valid || !T.depends_on.String || T.depends_on.String === "null") return null;
    try {
      const w = JSON.parse(T.depends_on.String);
      return !w || typeof w != "object" || !Array.isArray(w.dependencies) ? null : w;
    } catch {
      return null;
    }
  }
  function _(T) {
    return i(a).find((w) => w.id === T);
  }
  function b(T) {
    const w = document.getElementById(`job-${T}`);
    w && (w.scrollIntoView({ behavior: "smooth", block: "center" }), k(v, T, !0), setTimeout(
      () => {
        i(v) === T && k(v, null);
      },
      2e3
    ));
  }
  async function m() {
    try {
      const T = await oe.get("/admin/api/jobs", { limit: c, offset: i(l) });
      k(a, T.jobs || [], !0), k(n, T.total || 0, !0);
    } catch (T) {
      console.error(T);
    }
  }
  Ct(m);
  function h() {
    i(l) + c < i(n) && (k(l, i(l) + c), m());
  }
  function A() {
    i(l) - c >= 0 && (k(l, i(l) - c), m());
  }
  function x(T) {
    return Vt("%Y-%m-%d %H:%M:%S", new Date(T));
  }
  var f = Ml(), g = o(f), $ = o(g), O = o($), N = d($, 2), F = o(N);
  F.__click = A;
  var q = d(F, 2), U = o(q), B = d(q, 2);
  B.__click = h;
  var ne = d(B, 2);
  ne.__click = m;
  var P = d(g, 2);
  {
    var S = (T) => {
      var w = bl();
      M(T, w);
    }, R = (T) => {
      var w = Sl(), j = d(o(w));
      Ee(j, 21, () => i(a), Ie, (G, C) => {
        var ie = kl();
        let ve;
        var ce = o(ie), Y = o(ce), Z = d(ce), z = o(Z), X = o(z), le = o(X), re = d(X, 2);
        {
          var W = (fe) => {
            var Me = wl(), Be = o(Me);
            J(() => {
              xe(Me, "title", i(C).uniqkey.String), E(Be, i(C).uniqkey.String);
            }), M(fe, Me);
          };
          se(re, (fe) => {
            i(C).uniqkey?.Valid && fe(W);
          });
        }
        var Q = d(Z), ue = o(Q);
        _l(ue, () => i(C).status);
        var de = d(Q), me = o(de), we = d(de), Se = o(we);
        s(Se, () => i(C).created_at);
        var Ne = d(we), p = o(Ne);
        s(p, () => i(C).finished_at.Time, () => i(C).finished_at.Valid);
        var y = d(Ne), L = o(y);
        {
          var ee = (fe) => {
            const Me = /* @__PURE__ */ Qe(() => u(i(C)));
            var Be = yl(), Nt = o(Be), $t = o(Nt), Lt = d(Nt, 2);
            Ee(Lt, 21, () => i(Me).dependencies, Ie, (tt, Ht) => {
              r(tt, () => i(Ht).id, () => i(Ht).condition);
            }), J((tt) => E($t, tt), [() => (i(Me).strategy || "all").toUpperCase()]), M(fe, Be);
          }, _e = (fe) => {
            var Me = zt("-");
            M(fe, Me);
          };
          se(L, (fe) => {
            u(i(C)) ? fe(ee) : fe(_e, !1);
          });
        }
        var ge = d(y), Ae = o(ge);
        {
          var Ge = (fe) => {
            var Me = xl(), Be = o(Me);
            J(() => {
              xe(Me, "title", i(C).error_message.String), E(Be, i(C).error_message.String);
            }), M(fe, Me);
          };
          se(Ae, (fe) => {
            i(C).error_message?.Valid && fe(Ge);
          });
        }
        J(() => {
          xe(ie, "id", `job-${i(C).id ?? ""}`), ve = qe(ie, 1, "svelte-1r6codn", null, ve, { highlighted: i(v) === i(C).id }), E(Y, i(C).id), E(le, i(C).job_type_name), E(me, i(C).retry_count);
        }), M(G, ie);
      }), M(T, w);
    };
    se(P, (T) => {
      oe.loading && i(a).length === 0 ? T(S) : T(R, !1);
    });
  }
  J(
    (T) => {
      E(O, `ジョブ一覧 (${i(n) ?? ""})`), F.disabled = i(l) === 0 || oe.loading, E(U, `${i(l) + 1} - ${T ?? ""} / ${i(n) ?? ""}`), B.disabled = i(l) + c >= i(n) || oe.loading;
    },
    [() => Math.min(i(l) + c, i(n))]
  ), M(e, f), dt();
}
Ms(["click"]);
var El = /* @__PURE__ */ I('<div class="empty svelte-wpgtu6">No Signature</div>'), Tl = /* @__PURE__ */ I("<div></div>"), Al = /* @__PURE__ */ I('<div class="row svelte-wpgtu6"></div>'), Fl = /* @__PURE__ */ I('<div class="chroma-section svelte-wpgtu6"></div>'), Pl = /* @__PURE__ */ I('<div class="chroma-sections svelte-wpgtu6"></div>'), Rl = /* @__PURE__ */ I('<div class="color-bitmask svelte-wpgtu6"><!></div>');
function pr(e, t) {
  ft(t, !0);
  let s = Qa(t, "size", 3, 64), r = /* @__PURE__ */ Qe(() => {
    if (!t.sig) return new Array(64).fill(!1);
    try {
      const _ = atob(t.sig), b = new Uint8Array(_.length);
      for (let h = 0; h < _.length; h++)
        b[h] = _.charCodeAt(h);
      const m = [];
      for (let h = 0; h < 8; h++) {
        const A = b[h];
        for (let x = 7; x >= 0; x--)
          m.push((A >> x & 1) === 1);
      }
      return m.reverse();
    } catch (_) {
      return console.error("Failed to decode sig:", _), new Array(64).fill(!1);
    }
  });
  function a(_) {
    const b = _ >> 5 & 1, m = _ >> 4 & 1, h = _ >> 3 & 1, A = _ >> 2 & 1, x = _ >> 1 & 1, f = _ & 1, g = m << 1 | A, $ = b << 2 | h << 1 | x, O = f, N = [25, 45, 65, 85][g], F = O === 0 ? 0.01 : 0.15, q = $ * 45;
    return `oklch(${N}% ${F} ${q})`;
  }
  function n(_, b, m) {
    const h = _ >> 1 & 1, A = _ & 1, x = b >> 2 & 1, f = b >> 1 & 1, g = b & 1, $ = m & 1;
    return x << 5 | h << 4 | f << 3 | A << 2 | g << 1 | $;
  }
  var l = Rl(), c = o(l);
  {
    var v = (_) => {
      var b = El();
      M(_, b);
    }, u = (_) => {
      var b = Pl();
      Ee(b, 20, () => [1, 0], Ie, (m, h) => {
        var A = Fl();
        Ee(A, 20, () => [3, 2, 1, 0], Ie, (x, f) => {
          var g = Al();
          Ee(g, 20, () => [0, 1, 2, 3, 4, 5, 6, 7], Ie, ($, O) => {
            const N = /* @__PURE__ */ Qe(() => n(f, O, h));
            var F = Tl();
            let q;
            J(
              (U) => {
                q = qe(F, 1, "bit svelte-wpgtu6", null, q, { active: i(r)[i(N)] }), gs(F, `background-color: ${U ?? ""}`), xe(F, "title", `L=${f ?? ""} H=${O * 45} C=${h ?? ""}`);
              },
              [() => a(i(N))]
            ), M($, F);
          }), M(x, g);
        }), J(() => xe(A, "title", h === 1 ? "Vivid Colors" : "Muted Colors")), M(m, A);
      }), M(_, b);
    };
    se(c, (_) => {
      t.sig ? _(u, !1) : _(v);
    });
  }
  J(() => gs(l, `--size: ${s() ?? ""}px`)), M(e, l), dt();
}
var Il = /* @__PURE__ */ I('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), Ol = /* @__PURE__ */ I('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class A Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), Cl = /* @__PURE__ */ I('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), Nl = /* @__PURE__ */ I('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class B Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), $l = /* @__PURE__ */ I('<div class="stat-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">Storage (Free: 10GB)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976"> </div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class A (Free: 1M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class B (Free: 10M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div>', 1), Ll = /* @__PURE__ */ I('<div class="stat-card error-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">R2 Status</div> <div class="stat-value svelte-1w9i976" style="font-size: 0.9rem; color: #d32f2f;"> </div></div>'), Hl = /* @__PURE__ */ I('<div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div>', 1), ql = /* @__PURE__ */ I('<div class="r2-stats svelte-1w9i976"><!></div>');
function Yl(e, t) {
  ft(t, !0);
  let s = /* @__PURE__ */ H(null), r = /* @__PURE__ */ H(null);
  async function a() {
    try {
      k(s, await oe.get("/admin/api/r2/usage"), !0);
    } catch (f) {
      console.error("Failed to fetch R2 usage:", f), k(r, "Failed to load R2 usage data");
    }
  }
  Ct(a);
  function n(f) {
    if (f === 0) return "0 B";
    const g = 1024, $ = ["B", "KB", "MB", "GB", "TB"], O = Math.floor(Math.log(f) / Math.log(g));
    return parseFloat((f / Math.pow(g, O)).toFixed(2)) + " " + $[O];
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
  ], v = /* @__PURE__ */ Qe(() => i(s) ? (i(s).operations || []).filter((f) => l.includes(f.action_type)).reduce((f, g) => f + g.requests, 0) : 0), u = /* @__PURE__ */ Qe(() => i(s) ? (i(s).operations || []).filter((f) => c.includes(f.action_type)).reduce((f, g) => f + g.requests, 0) : 0), _ = /* @__PURE__ */ Qe(() => i(s) ? (i(s).operations || []).filter((f) => l.includes(f.action_type)).sort((f, g) => g.requests - f.requests) : []), b = /* @__PURE__ */ Qe(() => i(s) ? (i(s).operations || []).filter((f) => c.includes(f.action_type)).sort((f, g) => g.requests - f.requests) : []);
  var m = ql(), h = o(m);
  {
    var A = (f) => {
      var g = $l(), $ = Xe(g), O = d(o($), 2), N = o(O), F = d(O, 2), q = o(F), U = d(F, 2), B = o(U), ne = d($, 2), P = d(o(ne), 2), S = o(P), R = d(P, 4), T = o(R), w = d(R, 2);
      {
        var j = (z) => {
          var X = Ol(), le = d(o(X), 2);
          Ee(le, 21, () => i(_), Ie, (re, W) => {
            var Q = Il(), ue = o(Q), de = o(ue), me = d(ue, 2), we = o(me);
            J(
              (Se) => {
                E(de, i(W).action_type), E(we, Se);
              },
              [() => (i(W).requests ?? 0).toLocaleString()]
            ), M(re, Q);
          }), M(z, X);
        };
        se(w, (z) => {
          i(_).length > 0 && z(j);
        });
      }
      var G = d(ne, 2), C = d(o(G), 2), ie = o(C), ve = d(C, 4), ce = o(ve), Y = d(ve, 2);
      {
        var Z = (z) => {
          var X = Nl(), le = d(o(X), 2);
          Ee(le, 21, () => i(b), Ie, (re, W) => {
            var Q = Cl(), ue = o(Q), de = o(ue), me = d(ue, 2), we = o(me);
            J(
              (Se) => {
                E(de, i(W).action_type), E(we, Se);
              },
              [() => (i(W).requests ?? 0).toLocaleString()]
            ), M(re, Q);
          }), M(z, X);
        };
        se(Y, (z) => {
          i(b).length > 0 && z(Z);
        });
      }
      J(
        (z, X, le, re, W, Q, ue) => {
          E(N, z), E(q, `${X ?? ""} objects`), gs(B, `width: ${le ?? ""}%`), E(S, re), gs(T, `width: ${W ?? ""}%`), E(ie, Q), gs(ce, `width: ${ue ?? ""}%`);
        },
        [
          () => n(i(s).storage_usage_bytes ?? 0),
          () => (i(s).object_count ?? 0).toLocaleString(),
          () => Math.min(100, (i(s).storage_usage_bytes ?? 0) / 10737418240 * 100),
          () => (i(v) ?? 0).toLocaleString(),
          () => Math.min(100, (i(v) ?? 0) / 1e6 * 100),
          () => (i(u) ?? 0).toLocaleString(),
          () => Math.min(100, (i(u) ?? 0) / 1e7 * 100)
        ]
      ), M(f, g);
    }, x = (f) => {
      var g = St(), $ = Xe(g);
      {
        var O = (F) => {
          var q = Ll(), U = d(o(q), 2), B = o(U);
          J(() => E(B, i(r))), M(F, q);
        }, N = (F) => {
          var q = Hl();
          M(F, q);
        };
        se(
          $,
          (F) => {
            i(r) ? F(O) : F(N, !1);
          },
          !0
        );
      }
      M(f, g);
    };
    se(h, (f) => {
      i(s) ? f(A) : f(x, !1);
    });
  }
  M(e, m), dt();
}
var Bl = /* @__PURE__ */ I('<div class="loading svelte-xxb0sp">読み込み中...</div>'), jl = /* @__PURE__ */ I('<button class="indexed-icon svelte-xxb0sp" title="類似画像を検索">🔍</button>'), Ul = /* @__PURE__ */ I('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/> <!></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), zl = /* @__PURE__ */ I('<div class="overlay svelte-xxb0sp"><div class="loading-spinner svelte-xxb0sp"></div></div>'), Jl = /* @__PURE__ */ I('<div class="grid-container svelte-xxb0sp"><div></div> <!></div>'), Vl = /* @__PURE__ */ I('<div class="selected-compare svelte-xxb0sp"><div class="image-item target svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="svelte-xxb0sp">Selected Image</div></div></div> <div class="arrow svelte-xxb0sp">→</div></div>'), Xl = /* @__PURE__ */ I('<div class="loading svelte-xxb0sp">検索中...</div>'), Kl = /* @__PURE__ */ I('<p class="svelte-xxb0sp">類似画像は見つかりませんでした。</p>'), Gl = /* @__PURE__ */ I('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), Wl = /* @__PURE__ */ I("<div></div>"), Zl = /* @__PURE__ */ I('<div class="image-list svelte-xxb0sp"><div class="header svelte-xxb0sp"><div class="title-area svelte-xxb0sp"><h2 class="svelte-xxb0sp"> </h2> <a href="https://dash.cloudflare.com/d52dc19d3368d36eecf4b48d5eb2dd44/r2/default/buckets/lowreal" target="_blank" rel="noopener noreferrer" class="r2-link svelte-xxb0sp">R2 Dashboard ↗</a></div> <div class="pagination svelte-xxb0sp"><button class="svelte-xxb0sp">前へ</button> <span class="svelte-xxb0sp"> </span> <button class="svelte-xxb0sp">次へ</button></div></div> <!> <!></div> <dialog id="similarDialog" class="svelte-xxb0sp"><div class="dialog-header svelte-xxb0sp"><h3 class="svelte-xxb0sp">類似画像一覧</h3> <button type="button" class="close-btn svelte-xxb0sp">×</button></div> <div class="dialog-content svelte-xxb0sp"><!> <!></div></dialog>', 1);
function Ql(e, t) {
  ft(t, !0);
  let s = /* @__PURE__ */ H(De([])), r = /* @__PURE__ */ H(0), a = 20, n = /* @__PURE__ */ H(0), l = /* @__PURE__ */ H(De([])), c = /* @__PURE__ */ H(null), v = /* @__PURE__ */ H(null);
  async function u() {
    try {
      const Y = await oe.get(`/admin/api/images?limit=${a}&offset=${i(r)}`);
      k(s, Y.images || [], !0), k(n, Y.total || 0, !0);
    } catch (Y) {
      console.error(Y);
    }
  }
  async function _(Y) {
    k(c, Y, !0), k(l, [], !0), i(v).showModal();
    try {
      const Z = await oe.get(`/admin/api/image/${Y.id}/similar`);
      k(l, Z.similar || [], !0);
    } catch (Z) {
      console.error(Z);
    }
  }
  Ct(u);
  function b() {
    i(r) + a < i(n) && (k(r, i(r) + a), u());
  }
  function m() {
    i(r) - a >= 0 && (k(r, i(r) - a), u());
  }
  var h = Zl(), A = Xe(h), x = o(A), f = o(x), g = o(f), $ = o(g), O = d(f, 2), N = o(O);
  N.__click = m;
  var F = d(N, 2), q = o(F), U = d(F, 2);
  U.__click = b;
  var B = d(x, 2);
  Yl(B, {});
  var ne = d(B, 2);
  {
    var P = (Y) => {
      var Z = Bl();
      M(Y, Z);
    }, S = (Y) => {
      var Z = Jl(), z = o(Z);
      let X;
      Ee(z, 21, () => i(s), (W) => W.id, (W, Q) => {
        var ue = Ul(), de = o(ue), me = o(de), we = d(me, 2);
        {
          var Se = (Ge) => {
            var fe = jl();
            fe.__click = () => _(i(Q)), M(Ge, fe);
          };
          se(we, (Ge) => {
            i(Q).sig?.length > 0 && Ge(Se);
          });
        }
        var Ne = d(de, 2), p = o(Ne);
        pr(p, {
          get sig() {
            return i(Q).sig;
          }
        });
        var y = d(p, 2), L = o(y), ee = d(o(L)), _e = o(ee), ge = d(y, 2), Ae = o(ge);
        J(() => {
          xe(me, "src", i(Q).uri), xe(L, "href", `/admin/edit?id=${i(Q).entry_id ?? ""}`), E(_e, i(Q).entry_id), E(Ae, `ID: ${i(Q).id ?? ""}`);
        }), M(W, ue);
      });
      var le = d(z, 2);
      {
        var re = (W) => {
          var Q = zl();
          M(W, Q);
        };
        se(le, (W) => {
          oe.loading && W(re);
        });
      }
      J(() => X = qe(z, 1, "grid svelte-xxb0sp", null, X, { "is-loading": oe.loading })), M(Y, Z);
    };
    se(ne, (Y) => {
      oe.loading && i(s).length === 0 ? Y(P) : Y(S, !1);
    });
  }
  var R = d(A, 2), T = o(R), w = d(o(T), 2);
  w.__click = () => i(v).close();
  var j = d(T, 2), G = o(j);
  {
    var C = (Y) => {
      var Z = Vl(), z = o(Z), X = o(z), le = o(X), re = d(X, 2), W = o(re);
      pr(W, {
        get sig() {
          return i(c).sig;
        }
      }), J(() => xe(le, "src", i(c).uri)), M(Y, Z);
    };
    se(G, (Y) => {
      i(c) && Y(C);
    });
  }
  var ie = d(G, 2);
  {
    var ve = (Y) => {
      var Z = Xl();
      M(Y, Z);
    }, ce = (Y) => {
      var Z = St(), z = Xe(Z);
      {
        var X = (re) => {
          var W = Kl();
          M(re, W);
        }, le = (re) => {
          var W = Wl();
          let Q;
          Ee(W, 21, () => i(l), (ue) => ue.id, (ue, de) => {
            var me = Gl(), we = o(me), Se = o(we), Ne = d(we, 2), p = o(Ne);
            pr(p, {
              get sig() {
                return i(de).sig;
              }
            });
            var y = d(p, 2), L = o(y);
            L.__click = () => i(v).close();
            var ee = d(o(L)), _e = o(ee), ge = d(y, 2), Ae = o(ge);
            J(() => {
              xe(Se, "src", i(de).uri), xe(L, "href", `/admin/edit?id=${i(de).entry_id ?? ""}`), E(_e, i(de).entry_id), E(Ae, `ID: ${i(de).id ?? ""} / Score: ${i(de).score ?? ""}`);
            }), M(ue, me);
          }), J(() => Q = qe(W, 1, "grid similar-grid svelte-xxb0sp", null, Q, { "is-loading": oe.loading })), M(re, W);
        };
        se(
          z,
          (re) => {
            i(l).length === 0 ? re(X) : re(le, !1);
          },
          !0
        );
      }
      M(Y, Z);
    };
    se(ie, (Y) => {
      oe.loading && i(l).length === 0 ? Y(ve) : Y(ce, !1);
    });
  }
  We(R, (Y) => k(v, Y), () => i(v)), J(
    (Y) => {
      E($, `画像一覧 (${i(n) ?? ""})`), N.disabled = i(r) === 0, E(q, `${i(r) + 1} - ${Y ?? ""} / ${i(n) ?? ""}`), U.disabled = i(r) + a >= i(n);
    },
    [() => Math.min(i(r) + a, i(n))]
  ), M(e, h), dt();
}
Ms(["click"]);
var eo = /* @__PURE__ */ I('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), to = /* @__PURE__ */ I('<span class="term-badge svelte-6rw159"> </span>'), so = /* @__PURE__ */ I('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">TF-IDF 統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総語彙数 (Terms)</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">インデックス済みエントリ</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">関連エントリ計算済み</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">総関連ペア数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">平均類似度スコア</th><td class="svelte-6rw159"> </td></tr></tbody></table></div> <div style="margin-top: 10px;" class="svelte-6rw159"><h4 class="svelte-6rw159">頻出単語 (Top 20 DF)</h4> <div class="top-terms svelte-6rw159"></div></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">画像統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総画像数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">未インデックス画像数</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), ro = /* @__PURE__ */ I('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function ao(e, t) {
  ft(t, !0);
  let s = /* @__PURE__ */ H(null);
  async function r() {
    try {
      k(s, await oe.get("/admin/api/info"), !0);
    } catch (u) {
      console.error(u);
    }
  }
  Ct(r);
  function a(u) {
    if (u === 0) return "0 B";
    const _ = 1024, b = ["B", "KB", "MB", "GB", "TB"], m = Math.floor(Math.log(u) / Math.log(_));
    return parseFloat((u / Math.pow(_, m)).toFixed(2)) + " " + b[m];
  }
  var n = ro(), l = d(o(n), 2);
  {
    var c = (u) => {
      var _ = eo();
      M(u, _);
    }, v = (u) => {
      var _ = St(), b = Xe(_);
      {
        var m = (h) => {
          var A = so(), x = o(A), f = d(o(x), 2), g = o(f), $ = o(g), O = o($), N = d(o(O)), F = o(N), q = d(O), U = d(o(q)), B = o(U), ne = d(q), P = d(o(ne)), S = o(P), R = d(ne), T = d(o(R)), w = o(T), j = d(R), G = d(o(j)), C = o(G), ie = d(f, 2), ve = d(o(ie), 2);
          Ee(ve, 21, () => i(s).tfidf_stats?.top_terms ?? [], Ie, (os, Yt) => {
            var xt = to(), vs = o(xt);
            J(() => {
              xe(xt, "title", `DF: ${i(Yt).df ?? ""}`), E(vs, i(Yt).term);
            }), M(os, xt);
          });
          var ce = d(x, 2), Y = d(o(ce), 2), Z = o(Y), z = o(Z), X = o(z), le = d(o(X)), re = o(le), W = d(X), Q = d(o(W)), ue = o(Q), de = d(ce, 2), me = d(o(de), 2), we = o(me), Se = o(we), Ne = o(Se), p = d(o(Ne)), y = o(p), L = d(Ne), ee = d(o(L)), _e = o(ee), ge = o(_e), Ae = d(de, 2), Ge = d(o(Ae), 2), fe = o(Ge), Me = o(fe), Be = o(Me), Nt = d(o(Be)), $t = o(Nt), Lt = d(Be), tt = d(o(Lt)), Ht = o(tt), Qt = d(Lt), Zs = d(o(Qt)), Qs = o(Zs), es = d(Qt), Ds = d(o(es)), ts = o(Ds), ss = d(es), Es = d(o(ss)), rs = o(Es), as = d(ss), Ts = d(o(as)), ns = o(Ts), is = d(as), er = d(o(is)), ls = o(er), As = d(is), tr = d(o(As)), Fs = o(tr), qt = d(Ae, 2), sr = d(o(qt), 2), rr = o(sr);
          J(
            (os, Yt, xt, vs, Ps, ar) => {
              E(F, i(s).tfidf_stats?.total_terms ?? 0), E(B, i(s).tfidf_stats?.indexed_entries ?? 0), E(S, i(s).tfidf_stats?.entries_with_related ?? 0), E(w, i(s).tfidf_stats?.total_related_pairs ?? 0), E(C, os), E(re, i(s).image_stats?.total_images ?? 0), E(ue, i(s).image_stats?.unindexed_images ?? 0), E(y, i(s).is_development), E(ge, i(s).app_hash), E($t, i(s).debug_info.go_version), E(Ht, i(s).debug_info.num_goroutine), E(Qs, Yt), E(ts, i(s).debug_info.uptime), E(rs, xt), E(ns, vs), E(ls, Ps), E(Fs, i(s).debug_info.num_gc), E(rr, ar);
            },
            [
              () => i(s).tfidf_stats?.avg_score?.toFixed(4) ?? "0.0000",
              () => new Date(i(s).debug_info.start_time).toLocaleString(),
              () => a(i(s).debug_info.mem_alloc),
              () => a(i(s).debug_info.mem_total_alloc),
              () => a(i(s).debug_info.mem_sys),
              () => JSON.stringify(i(s).config, null, 2)
            ]
          ), M(h, A);
        };
        se(
          b,
          (h) => {
            i(s) && h(m);
          },
          !0
        );
      }
      M(u, _);
    };
    se(l, (u) => {
      oe.loading && !i(s) ? u(c) : u(v, !1);
    });
  }
  M(e, n), dt();
}
var no = /* @__PURE__ */ I("<a> </a>"), io = /* @__PURE__ */ I('<div class="admin-app svelte-1n46o8q"><header><div class="header-left svelte-1n46o8q"><h1 class="svelte-1n46o8q"><a href="/admin/" class="svelte-1n46o8q"><img src="/images/hanrangen-icon.svg" alt="Hanrangon" class="logo svelte-1n46o8q"/></a></h1> <div class="ci-badge svelte-1n46o8q"><a href="https://github.com/cho45/Hanrangon/actions/workflows/ci.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/ci.yml?branch=main&amp;label=ci&amp;style=flat-square" alt="CI Status" class="svelte-1n46o8q"/></a> <a href="https://github.com/cho45/Hanrangon/actions/workflows/lint.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/lint.yml?branch=main&amp;label=lint&amp;style=flat-square" alt="Lint Status" class="svelte-1n46o8q"/></a></div></div> <nav class="main-nav svelte-1n46o8q"><ul class="svelte-1n46o8q"><li><a href="/" class="svelte-1n46o8q">サイト確認</a></li> <li><a href="/logout" class="svelte-1n46o8q">ログアウト</a></li></ul></nav></header> <nav></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function lo(e, t) {
  ft(t, !0);
  let s = /* @__PURE__ */ H(De(window.location.pathname)), r = /* @__PURE__ */ H(De(new URLSearchParams(window.location.search)));
  Ct(() => {
    const f = () => {
      k(s, window.location.pathname, !0), k(r, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", f), () => window.removeEventListener("popstate", f);
  });
  function a(f, g) {
    g && g.preventDefault(), window.history.pushState({}, "", f), k(s, window.location.pathname, !0), k(r, new URLSearchParams(window.location.search), !0);
  }
  const n = {
    "/admin/edit": {
      component: dl,
      page: "edit",
      getProps: (f) => ({ id: f, onSave: (g) => window.location.href = g })
    },
    "/admin/jobs": { component: Dl, page: "jobs", getProps: () => ({}) },
    "/admin/images": { component: Ql, page: "images", getProps: () => ({}) },
    "/admin/info": { component: ao, page: "info", getProps: () => ({}) },
    "/admin/": {
      component: Gi,
      page: "list",
      getProps: () => ({ onEdit: (f) => a(`/admin/edit?id=${f}`) })
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
    { label: "情報", path: "/admin/info", page: "info" }
  ], c = /* @__PURE__ */ Qe(() => {
    const f = i(r).get("id"), g = n[i(s)] ?? n["/admin/"];
    return {
      ...g,
      props: g.getProps(f),
      isActive: ($) => !($.page !== g.page || $.exact && f)
    };
  }), v = /* @__PURE__ */ Qe(() => window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  var u = io(), _ = o(u);
  let b;
  var m = d(_, 2);
  let h;
  Ee(m, 21, () => l, Ie, (f, g) => {
    var $ = no();
    $.__click = (F) => a(i(g).path, F);
    let O;
    var N = o($);
    J(
      (F) => {
        xe($, "href", i(g).path), O = qe($, 1, "svelte-1n46o8q", null, O, F), E(N, i(g).label);
      },
      [() => ({ active: i(c).isActive(i(g)) })]
    ), M(f, $);
  });
  var A = d(m, 2), x = o(A);
  Mi(x, () => i(c).component, (f, g) => {
    g(f, Ni(() => i(c).props));
  }), J(() => {
    b = qe(_, 1, "svelte-1n46o8q", null, b, { "is-localhost": i(v) }), h = qe(m, 1, "sub-nav svelte-1n46o8q", null, h, { "is-localhost": i(v) });
  }), M(e, u), dt();
}
Ms(["click"]);
const mr = document.getElementById("admin-root");
mr && (mr.innerHTML = "", bi(lo, { target: mr }));
//# sourceMappingURL=admin-front.js.map
