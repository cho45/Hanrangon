var wr = Array.isArray, an = Array.prototype.indexOf, Hs = Array.from, nn = Object.defineProperty, xt = Object.getOwnPropertyDescriptor, ln = Object.getOwnPropertyDescriptors, on = Object.prototype, cn = Array.prototype, Qr = Object.getPrototypeOf, Lr = Object.isExtensible;
function ss(e) {
  return typeof e == "function";
}
const $s = () => {
};
function un(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ea() {
  var e, t, s = new Promise((r, n) => {
    e = r, t = n;
  });
  return { promise: s, resolve: e, reject: t };
}
function ta(e, t, s = !1) {
  return e === void 0 ? s ? (
    /** @type {() => V} */
    t()
  ) : (
    /** @type {V} */
    t
  ) : e;
}
const pe = 2, yr = 4, xr = 8, vn = 1 << 24, rt = 16, at = 32, Pt = 64, Ys = 128, Ue = 512, be = 1024, Oe = 2048, Ve = 4096, Ie = 8192, dt = 16384, kr = 32768, Et = 65536, Hr = 1 << 17, sa = 1 << 18, Jt = 1 << 19, fn = 1 << 20, et = 1 << 25, Tt = 32768, _r = 1 << 21, Mr = 1 << 22, ht = 1 << 23, kt = /* @__PURE__ */ Symbol("$state"), dn = /* @__PURE__ */ Symbol("legacy props"), hn = /* @__PURE__ */ Symbol(""), jt = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function _n(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function pn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function mn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function gn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function bn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function wn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function yn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function xn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function kn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Mn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Sn = 1, Dn = 2, ra = 4, En = 8, Tn = 16, An = 1, Fn = 2, ge = /* @__PURE__ */ Symbol(), Pn = "http://www.w3.org/1999/xhtml";
function Rn() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function In() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function aa(e) {
  return e === this.v;
}
function On(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function na(e) {
  return !On(e, this.v);
}
let Ce = null;
function Bt(e) {
  Ce = e;
}
function nt(e, t = !1, s) {
  Ce = {
    p: Ce,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function it(e) {
  var t = (
    /** @type {ComponentContext} */
    Ce
  ), s = t.e;
  if (s !== null) {
    t.e = null;
    for (var r of s)
      xa(r);
  }
  return t.i = !0, Ce = t.p, /** @type {T} */
  {};
}
function ia() {
  return !0;
}
let wt = [];
function la() {
  var e = wt;
  wt = [], un(e);
}
function pt(e) {
  if (wt.length === 0 && !os) {
    var t = wt;
    queueMicrotask(() => {
      t === wt && la();
    });
  }
  wt.push(e);
}
function Cn() {
  for (; wt.length > 0; )
    la();
}
function oa(e) {
  var t = ee;
  if (t === null)
    return X.f |= ht, e;
  if ((t.f & kr) === 0) {
    if ((t.f & Ys) === 0)
      throw e;
    t.b.error(e);
  } else
    Ut(e, t);
}
function Ut(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ys) !== 0)
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
const Ps = /* @__PURE__ */ new Set();
let W = null, ls = null, Ye = null, He = [], js = null, pr = !1, os = !1;
class Xe {
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
  #t = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #r = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #s = 0;
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #o = null;
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #n = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #a = /* @__PURE__ */ new Set();
  /**
   * A set of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`
   * @type {Set<Effect>}
   */
  skipped_effects = /* @__PURE__ */ new Set();
  is_fork = !1;
  is_deferred() {
    return this.is_fork || this.#s > 0;
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    He = [], ls = null, this.apply();
    var s = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const r of t)
      this.#i(r, s);
    this.is_fork || this.#u(), this.is_deferred() ? (this.#l(s.effects), this.#l(s.render_effects)) : (ls = this, W = null, $r(s.render_effects), $r(s.effects), ls = null, this.#o?.resolve()), Ye = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {EffectTarget} target
   */
  #i(t, s) {
    t.f ^= be;
    for (var r = t.first; r !== null; ) {
      var n = r.f, a = (n & (at | Pt)) !== 0, l = a && (n & be) !== 0, u = l || (n & Ie) !== 0 || this.skipped_effects.has(r);
      if ((r.f & Ys) !== 0 && r.b?.is_pending() && (s = {
        parent: s,
        effect: r,
        effects: [],
        render_effects: []
      }), !u && r.fn !== null) {
        a ? r.f ^= be : (n & yr) !== 0 ? s.effects.push(r) : ms(r) && ((r.f & rt) !== 0 && this.#n.add(r), hs(r));
        var o = r.first;
        if (o !== null) {
          r = o;
          continue;
        }
      }
      var v = r.parent;
      for (r = r.next; r === null && v !== null; )
        v === s.effect && (this.#l(s.effects), this.#l(s.render_effects), s = /** @type {EffectTarget} */
        s.parent), r = v.next, v = v.parent;
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #l(t) {
    for (const s of t)
      (s.f & Oe) !== 0 ? this.#n.add(s) : (s.f & Ve) !== 0 && this.#a.add(s), this.#c(s.deps), ye(s, be);
  }
  /**
   * @param {Value[] | null} deps
   */
  #c(t) {
    if (t !== null)
      for (const s of t)
        (s.f & pe) === 0 || (s.f & Tt) === 0 || (s.f ^= Tt, this.#c(
          /** @type {Derived} */
          s.deps
        ));
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, s) {
    this.previous.has(t) || this.previous.set(t, s), (t.f & ht) === 0 && (this.current.set(t, t.v), Ye?.set(t, t.v));
  }
  activate() {
    W = this, this.apply();
  }
  deactivate() {
    W === this && (W = null, Ye = null);
  }
  flush() {
    if (this.activate(), He.length > 0) {
      if (ca(), W !== null && W !== this)
        return;
    } else this.#r === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of this.#t) t(this);
    this.#t.clear();
  }
  #u() {
    if (this.#s === 0) {
      for (const t of this.#e) t();
      this.#e.clear();
    }
    this.#r === 0 && this.#v();
  }
  #v() {
    if (Ps.size > 1) {
      this.previous.clear();
      var t = Ye, s = !0, r = {
        parent: null,
        effect: null,
        effects: [],
        render_effects: []
      };
      for (const a of Ps) {
        if (a === this) {
          s = !1;
          continue;
        }
        const l = [];
        for (const [o, v] of this.current) {
          if (a.current.has(o))
            if (s && v !== a.current.get(o))
              a.current.set(o, v);
            else
              continue;
          l.push(o);
        }
        if (l.length === 0)
          continue;
        const u = [...a.current.keys()].filter((o) => !this.current.has(o));
        if (u.length > 0) {
          var n = He;
          He = [];
          const o = /* @__PURE__ */ new Set(), v = /* @__PURE__ */ new Map();
          for (const h of l)
            ua(h, u, o, v);
          if (He.length > 0) {
            W = a, a.apply();
            for (const h of He)
              a.#i(h, r);
            a.deactivate();
          }
          He = n;
        }
      }
      W = null, Ye = t;
    }
    this.committed = !0, Ps.delete(this);
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    this.#r += 1, t && (this.#s += 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    this.#r -= 1, t && (this.#s -= 1), this.revive();
  }
  revive() {
    for (const t of this.#n)
      this.#a.delete(t), ye(t, Oe), At(t);
    for (const t of this.#a)
      ye(t, Ve), At(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    this.#e.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#t.add(t);
  }
  settled() {
    return (this.#o ??= ea()).promise;
  }
  static ensure() {
    if (W === null) {
      const t = W = new Xe();
      Ps.add(W), os || Xe.enqueue(() => {
        W === t && t.flush();
      });
    }
    return W;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    pt(t);
  }
  apply() {
  }
}
function Nn(e) {
  var t = os;
  os = !0;
  try {
    for (var s; ; ) {
      if (Cn(), He.length === 0 && (W?.flush(), He.length === 0))
        return js = null, /** @type {T} */
        s;
      ca();
    }
  } finally {
    os = t;
  }
}
function ca() {
  var e = St;
  pr = !0;
  var t = null;
  try {
    var s = 0;
    for (Ns(!0); He.length > 0; ) {
      var r = Xe.ensure();
      if (s++ > 1e3) {
        var n, a;
        Ln();
      }
      r.process(He), _t.clear();
    }
  } finally {
    pr = !1, Ns(e), js = null;
  }
}
function Ln() {
  try {
    wn();
  } catch (e) {
    Ut(e, js);
  }
}
let Qe = null;
function $r(e) {
  var t = e.length;
  if (t !== 0) {
    for (var s = 0; s < t; ) {
      var r = e[s++];
      if ((r.f & (dt | Ie)) === 0 && ms(r) && (Qe = /* @__PURE__ */ new Set(), hs(r), r.deps === null && r.first === null && r.nodes === null && (r.teardown === null && r.ac === null ? Ea(r) : r.fn = null), Qe?.size > 0)) {
        _t.clear();
        for (const n of Qe) {
          if ((n.f & (dt | Ie)) !== 0) continue;
          const a = [n];
          let l = n.parent;
          for (; l !== null; )
            Qe.has(l) && (Qe.delete(l), a.push(l)), l = l.parent;
          for (let u = a.length - 1; u >= 0; u--) {
            const o = a[u];
            (o.f & (dt | Ie)) === 0 && hs(o);
          }
        }
        Qe.clear();
      }
    }
    Qe = null;
  }
}
function ua(e, t, s, r) {
  if (!s.has(e) && (s.add(e), e.reactions !== null))
    for (const n of e.reactions) {
      const a = n.f;
      (a & pe) !== 0 ? ua(
        /** @type {Derived} */
        n,
        t,
        s,
        r
      ) : (a & (Mr | rt)) !== 0 && (a & Oe) === 0 && va(n, t, r) && (ye(n, Oe), At(
        /** @type {Effect} */
        n
      ));
    }
}
function va(e, t, s) {
  const r = s.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const n of e.deps) {
      if (t.includes(n))
        return !0;
      if ((n.f & pe) !== 0 && va(
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
function At(e) {
  for (var t = js = e; t.parent !== null; ) {
    t = t.parent;
    var s = t.f;
    if (pr && t === ee && (s & rt) !== 0 && (s & sa) === 0)
      return;
    if ((s & (Pt | at)) !== 0) {
      if ((s & be) === 0) return;
      t.f ^= be;
    }
  }
  He.push(t);
}
function Hn(e) {
  let t = 0, s = Ft(0), r;
  return () => {
    fs() && (i(s), Us(() => (t === 0 && (r = Js(() => e(() => cs(s)))), t += 1, () => {
      pt(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, cs(s));
      });
    })));
  };
}
var $n = Et | Jt | Ys;
function Yn(e, t, s) {
  new jn(e, t, s);
}
class jn {
  /** @type {Boundary | null} */
  parent;
  #e = !1;
  /** @type {TemplateNode} */
  #t;
  /** @type {TemplateNode | null} */
  #r = null;
  /** @type {BoundaryProps} */
  #s;
  /** @type {((anchor: Node) => void)} */
  #o;
  /** @type {Effect} */
  #n;
  /** @type {Effect | null} */
  #a = null;
  /** @type {Effect | null} */
  #i = null;
  /** @type {Effect | null} */
  #l = null;
  /** @type {DocumentFragment | null} */
  #c = null;
  /** @type {TemplateNode | null} */
  #u = null;
  #v = 0;
  #f = 0;
  #h = !1;
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #d = null;
  #b = Hn(() => (this.#d = Ft(this.#v), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, s, r) {
    this.#t = t, this.#s = s, this.#o = r, this.parent = /** @type {Effect} */
    ee.b, this.#e = !!this.#s.pending, this.#n = zs(() => {
      ee.b = this;
      {
        var n = this.#m();
        try {
          this.#a = $e(() => r(n));
        } catch (a) {
          this.error(a);
        }
        this.#f > 0 ? this.#p() : this.#e = !1;
      }
      return () => {
        this.#u?.remove();
      };
    }, $n);
  }
  #w() {
    try {
      this.#a = $e(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
    this.#e = !1;
  }
  #y() {
    const t = this.#s.pending;
    t && (this.#i = $e(() => t(this.#t)), Xe.enqueue(() => {
      var s = this.#m();
      this.#a = this.#_(() => (Xe.ensure(), $e(() => this.#o(s)))), this.#f > 0 ? this.#p() : (Mt(
        /** @type {Effect} */
        this.#i,
        () => {
          this.#i = null;
        }
      ), this.#e = !1);
    }));
  }
  #m() {
    var t = this.#t;
    return this.#e && (this.#u = tt(), this.#t.before(this.#u), t = this.#u), t;
  }
  /**
   * Returns `true` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_pending() {
    return this.#e || !!this.parent && this.parent.is_pending();
  }
  has_pending_snippet() {
    return !!this.#s.pending;
  }
  /**
   * @param {() => Effect | null} fn
   */
  #_(t) {
    var s = ee, r = X, n = Ce;
    Ge(this.#n), Te(this.#n), Bt(this.#n.ctx);
    try {
      return t();
    } catch (a) {
      return oa(a), null;
    } finally {
      Ge(s), Te(r), Bt(n);
    }
  }
  #p() {
    const t = (
      /** @type {(anchor: Node) => void} */
      this.#s.pending
    );
    this.#a !== null && (this.#c = document.createDocumentFragment(), this.#c.append(
      /** @type {TemplateNode} */
      this.#u
    ), Fa(this.#a, this.#c)), this.#i === null && (this.#i = $e(() => t(this.#t)));
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
    this.#f += t, this.#f === 0 && (this.#e = !1, this.#i && Mt(this.#i, () => {
      this.#i = null;
    }), this.#c && (this.#t.before(this.#c), this.#c = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    this.#g(t), this.#v += t, this.#d && zt(this.#d, this.#v);
  }
  get_effect_pending() {
    return this.#b(), i(
      /** @type {Source<number>} */
      this.#d
    );
  }
  /** @param {unknown} error */
  error(t) {
    var s = this.#s.onerror;
    let r = this.#s.failed;
    if (this.#h || !s && !r)
      throw t;
    this.#a && (Ae(this.#a), this.#a = null), this.#i && (Ae(this.#i), this.#i = null), this.#l && (Ae(this.#l), this.#l = null);
    var n = !1, a = !1;
    const l = () => {
      if (n) {
        In();
        return;
      }
      n = !0, a && Mn(), Xe.ensure(), this.#v = 0, this.#l !== null && Mt(this.#l, () => {
        this.#l = null;
      }), this.#e = this.has_pending_snippet(), this.#a = this.#_(() => (this.#h = !1, $e(() => this.#o(this.#t)))), this.#f > 0 ? this.#p() : this.#e = !1;
    };
    var u = X;
    try {
      Te(null), a = !0, s?.(t, l), a = !1;
    } catch (o) {
      Ut(o, this.#n && this.#n.parent);
    } finally {
      Te(u);
    }
    r && pt(() => {
      this.#l = this.#_(() => {
        Xe.ensure(), this.#h = !0;
        try {
          return $e(() => {
            r(
              this.#t,
              () => t,
              () => l
            );
          });
        } catch (o) {
          return Ut(
            o,
            /** @type {Effect} */
            this.#n.parent
          ), null;
        } finally {
          this.#h = !1;
        }
      });
    });
  }
}
function qn(e, t, s, r) {
  const n = Sr;
  if (s.length === 0 && e.length === 0) {
    r(t.map(n));
    return;
  }
  var a = W, l = (
    /** @type {Effect} */
    ee
  ), u = Bn();
  function o() {
    Promise.all(s.map((v) => /* @__PURE__ */ Un(v))).then((v) => {
      u();
      try {
        r([...t.map(n), ...v]);
      } catch (h) {
        (l.f & dt) === 0 && Ut(h, l);
      }
      a?.deactivate(), Cs();
    }).catch((v) => {
      Ut(v, l);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    u();
    try {
      return o();
    } finally {
      a?.deactivate(), Cs();
    }
  }) : o();
}
function Bn() {
  var e = ee, t = X, s = Ce, r = W;
  return function(a = !0) {
    Ge(e), Te(t), Bt(s), a && r?.activate();
  };
}
function Cs() {
  Ge(null), Te(null), Bt(null);
}
// @__NO_SIDE_EFFECTS__
function Sr(e) {
  var t = pe | Oe, s = X !== null && (X.f & pe) !== 0 ? (
    /** @type {Derived} */
    X
  ) : null;
  return ee !== null && (ee.f |= Jt), {
    ctx: Ce,
    deps: null,
    effects: null,
    equals: aa,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ge
    ),
    wv: 0,
    parent: s ?? ee,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Un(e, t) {
  let s = (
    /** @type {Effect | null} */
    ee
  );
  s === null && pn();
  var r = (
    /** @type {Boundary} */
    s.b
  ), n = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = Ft(
    /** @type {V} */
    ge
  ), l = !X, u = /* @__PURE__ */ new Map();
  return ei(() => {
    var o = ea();
    n = o.promise;
    try {
      Promise.resolve(e()).then(o.resolve, o.reject).then(() => {
        v === W && v.committed && v.deactivate(), Cs();
      });
    } catch (_) {
      o.reject(_), Cs();
    }
    var v = (
      /** @type {Batch} */
      W
    );
    if (l) {
      var h = !r.is_pending();
      r.update_pending_count(1), v.increment(h), u.get(v)?.reject(jt), u.delete(v), u.set(v, o);
    }
    const b = (_, m = void 0) => {
      if (v.activate(), m)
        m !== jt && (a.f |= ht, zt(a, m));
      else {
        (a.f & ht) !== 0 && (a.f ^= ht), zt(a, _);
        for (const [F, w] of u) {
          if (u.delete(F), F === v) break;
          w.reject(jt);
        }
      }
      l && (r.update_pending_count(-1), v.decrement(h));
    };
    o.promise.then(b, (_) => b(null, _ || "unknown"));
  }), Bs(() => {
    for (const o of u.values())
      o.reject(jt);
  }), new Promise((o) => {
    function v(h) {
      function b() {
        h === n ? o(a) : v(n);
      }
      h.then(b, b);
    }
    v(n);
  });
}
// @__NO_SIDE_EFFECTS__
function vt(e) {
  const t = /* @__PURE__ */ Sr(e);
  return Pa(t), t;
}
// @__NO_SIDE_EFFECTS__
function Dr(e) {
  const t = /* @__PURE__ */ Sr(e);
  return t.equals = na, t;
}
function fa(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var s = 0; s < t.length; s += 1)
      Ae(
        /** @type {Effect} */
        t[s]
      );
  }
}
function zn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & pe) === 0)
      return (t.f & dt) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Er(e) {
  var t, s = ee;
  Ge(zn(e));
  try {
    e.f &= ~Tt, fa(e), t = Ca(e);
  } finally {
    Ge(s);
  }
  return t;
}
function da(e) {
  var t = Er(e);
  if (e.equals(t) || (W?.is_fork || (e.v = t), e.wv = Ia()), !Xt)
    if (Ye !== null)
      (fs() || W?.is_fork) && Ye.set(e, t);
    else {
      var s = (e.f & Ue) === 0 ? Ve : be;
      ye(e, s);
    }
}
let mr = /* @__PURE__ */ new Set();
const _t = /* @__PURE__ */ new Map();
let ha = !1;
function Ft(e, t) {
  var s = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: aa,
    rv: 0,
    wv: 0
  };
  return s;
}
// @__NO_SIDE_EFFECTS__
function H(e, t) {
  const s = Ft(e);
  return Pa(s), s;
}
// @__NO_SIDE_EFFECTS__
function Jn(e, t = !1, s = !0) {
  const r = Ft(e);
  return t || (r.equals = na), r;
}
function M(e, t, s = !1) {
  X !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Ke || (X.f & Hr) !== 0) && ia() && (X.f & (pe | rt | Mr | Hr)) !== 0 && !st?.includes(e) && kn();
  let r = s ? we(t) : t;
  return zt(e, r);
}
function zt(e, t) {
  if (!e.equals(t)) {
    var s = e.v;
    Xt ? _t.set(e, t) : _t.set(e, s), e.v = t;
    var r = Xe.ensure();
    r.capture(e, s), (e.f & pe) !== 0 && ((e.f & Oe) !== 0 && Er(
      /** @type {Derived} */
      e
    ), ye(e, (e.f & Ue) !== 0 ? be : Ve)), e.wv = Ia(), _a(e, Oe), ee !== null && (ee.f & be) !== 0 && (ee.f & (at | Pt)) === 0 && (Le === null ? si([e]) : Le.push(e)), !r.is_fork && mr.size > 0 && !ha && Xn();
  }
  return t;
}
function Xn() {
  ha = !1;
  var e = St;
  Ns(!0);
  const t = Array.from(mr);
  try {
    for (const s of t)
      (s.f & be) !== 0 && ye(s, Ve), ms(s) && hs(s);
  } finally {
    Ns(e);
  }
  mr.clear();
}
function cs(e) {
  M(e, e.v + 1);
}
function _a(e, t) {
  var s = e.reactions;
  if (s !== null)
    for (var r = s.length, n = 0; n < r; n++) {
      var a = s[n], l = a.f, u = (l & Oe) === 0;
      if (u && ye(a, t), (l & pe) !== 0) {
        var o = (
          /** @type {Derived} */
          a
        );
        Ye?.delete(o), (l & Tt) === 0 && (l & Ue && (a.f |= Tt), _a(o, Ve));
      } else u && ((l & rt) !== 0 && Qe !== null && Qe.add(
        /** @type {Effect} */
        a
      ), At(
        /** @type {Effect} */
        a
      ));
    }
}
function we(e) {
  if (typeof e != "object" || e === null || kt in e)
    return e;
  const t = Qr(e);
  if (t !== on && t !== cn)
    return e;
  var s = /* @__PURE__ */ new Map(), r = wr(e), n = /* @__PURE__ */ H(0), a = Dt, l = (u) => {
    if (Dt === a)
      return u();
    var o = X, v = Dt;
    Te(null), Ur(a);
    var h = u();
    return Te(o), Ur(v), h;
  };
  return r && s.set("length", /* @__PURE__ */ H(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, o, v) {
        (!("value" in v) || v.configurable === !1 || v.enumerable === !1 || v.writable === !1) && yn();
        var h = s.get(o);
        return h === void 0 ? h = l(() => {
          var b = /* @__PURE__ */ H(v.value);
          return s.set(o, b), b;
        }) : M(h, v.value, !0), !0;
      },
      deleteProperty(u, o) {
        var v = s.get(o);
        if (v === void 0) {
          if (o in u) {
            const h = l(() => /* @__PURE__ */ H(ge));
            s.set(o, h), cs(n);
          }
        } else
          M(v, ge), cs(n);
        return !0;
      },
      get(u, o, v) {
        if (o === kt)
          return e;
        var h = s.get(o), b = o in u;
        if (h === void 0 && (!b || xt(u, o)?.writable) && (h = l(() => {
          var m = we(b ? u[o] : ge), F = /* @__PURE__ */ H(m);
          return F;
        }), s.set(o, h)), h !== void 0) {
          var _ = i(h);
          return _ === ge ? void 0 : _;
        }
        return Reflect.get(u, o, v);
      },
      getOwnPropertyDescriptor(u, o) {
        var v = Reflect.getOwnPropertyDescriptor(u, o);
        if (v && "value" in v) {
          var h = s.get(o);
          h && (v.value = i(h));
        } else if (v === void 0) {
          var b = s.get(o), _ = b?.v;
          if (b !== void 0 && _ !== ge)
            return {
              enumerable: !0,
              configurable: !0,
              value: _,
              writable: !0
            };
        }
        return v;
      },
      has(u, o) {
        if (o === kt)
          return !0;
        var v = s.get(o), h = v !== void 0 && v.v !== ge || Reflect.has(u, o);
        if (v !== void 0 || ee !== null && (!h || xt(u, o)?.writable)) {
          v === void 0 && (v = l(() => {
            var _ = h ? we(u[o]) : ge, m = /* @__PURE__ */ H(_);
            return m;
          }), s.set(o, v));
          var b = i(v);
          if (b === ge)
            return !1;
        }
        return h;
      },
      set(u, o, v, h) {
        var b = s.get(o), _ = o in u;
        if (r && o === "length")
          for (var m = v; m < /** @type {Source<number>} */
          b.v; m += 1) {
            var F = s.get(m + "");
            F !== void 0 ? M(F, ge) : m in u && (F = l(() => /* @__PURE__ */ H(ge)), s.set(m + "", F));
          }
        if (b === void 0)
          (!_ || xt(u, o)?.writable) && (b = l(() => /* @__PURE__ */ H(void 0)), M(b, we(v)), s.set(o, b));
        else {
          _ = b.v !== ge;
          var w = l(() => we(v));
          M(b, w);
        }
        var f = Reflect.getOwnPropertyDescriptor(u, o);
        if (f?.set && f.set.call(h, v), !_) {
          if (r && typeof o == "string") {
            var g = (
              /** @type {Source<number>} */
              s.get("length")
            ), C = Number(o);
            Number.isInteger(C) && C >= g.v && M(g, C + 1);
          }
          cs(n);
        }
        return !0;
      },
      ownKeys(u) {
        i(n);
        var o = Reflect.ownKeys(u).filter((b) => {
          var _ = s.get(b);
          return _ === void 0 || _.v !== ge;
        });
        for (var [v, h] of s)
          h.v !== ge && !(v in u) && o.push(v);
        return o;
      },
      setPrototypeOf() {
        xn();
      }
    }
  );
}
function Yr(e) {
  try {
    if (e !== null && typeof e == "object" && kt in e)
      return e[kt];
  } catch {
  }
  return e;
}
function pa(e, t) {
  return Object.is(Yr(e), Yr(t));
}
var jr, ma, ga, ba;
function Kn() {
  if (jr === void 0) {
    jr = window, ma = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, s = Text.prototype;
    ga = xt(t, "firstChild").get, ba = xt(t, "nextSibling").get, Lr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Lr(s) && (s.__t = void 0);
  }
}
function tt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function ft(e) {
  return (
    /** @type {TemplateNode | null} */
    ga.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function ps(e) {
  return (
    /** @type {TemplateNode | null} */
    ba.call(e)
  );
}
function c(e, t) {
  return /* @__PURE__ */ ft(e);
}
function qe(e, t = !1) {
  {
    var s = /* @__PURE__ */ ft(e);
    return s instanceof Comment && s.data === "" ? /* @__PURE__ */ ps(s) : s;
  }
}
function d(e, t = 1, s = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ ps(r);
  return r;
}
function Vn(e) {
  e.textContent = "";
}
function wa() {
  return !1;
}
let qr = !1;
function Gn() {
  qr || (qr = !0, document.addEventListener(
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
function qs(e) {
  var t = X, s = ee;
  Te(null), Ge(null);
  try {
    return e();
  } finally {
    Te(t), Ge(s);
  }
}
function Tr(e, t, s, r = s) {
  e.addEventListener(t, () => qs(s));
  const n = e.__on_r;
  n ? e.__on_r = () => {
    n(), r(!0);
  } : e.__on_r = () => r(!0), Gn();
}
function Wn(e) {
  ee === null && (X === null && bn(), gn()), Xt && mn();
}
function Zn(e, t) {
  var s = t.last;
  s === null ? t.last = t.first = e : (s.next = e, e.prev = s, t.last = e);
}
function lt(e, t, s) {
  var r = ee;
  r !== null && (r.f & Ie) !== 0 && (e |= Ie);
  var n = {
    ctx: Ce,
    deps: null,
    nodes: null,
    f: e | Oe | Ue,
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
      hs(n), n.f |= kr;
    } catch (u) {
      throw Ae(n), u;
    }
  else t !== null && At(n);
  var a = n;
  if (s && a.deps === null && a.teardown === null && a.nodes === null && a.first === a.last && // either `null`, or a singular child
  (a.f & Jt) === 0 && (a = a.first, (e & rt) !== 0 && (e & Et) !== 0 && a !== null && (a.f |= Et)), a !== null && (a.parent = r, r !== null && Zn(a, r), X !== null && (X.f & pe) !== 0 && (e & Pt) === 0)) {
    var l = (
      /** @type {Derived} */
      X
    );
    (l.effects ??= []).push(a);
  }
  return n;
}
function fs() {
  return X !== null && !Ke;
}
function Bs(e) {
  const t = lt(xr, null, !1);
  return ye(t, be), t.teardown = e, t;
}
function ya(e) {
  Wn();
  var t = (
    /** @type {Effect} */
    ee.f
  ), s = !X && (t & at) !== 0 && (t & kr) === 0;
  if (s) {
    var r = (
      /** @type {ComponentContext} */
      Ce
    );
    (r.e ??= []).push(e);
  } else
    return xa(e);
}
function xa(e) {
  return lt(yr | fn, e, !1);
}
function Qn(e) {
  Xe.ensure();
  const t = lt(Pt | Jt, e, !0);
  return (s = {}) => new Promise((r) => {
    s.outro ? Mt(t, () => {
      Ae(t), r(void 0);
    }) : (Ae(t), r(void 0));
  });
}
function ka(e) {
  return lt(yr, e, !1);
}
function ei(e) {
  return lt(Mr | Jt, e, !0);
}
function Us(e, t = 0) {
  return lt(xr | t, e, !0);
}
function z(e, t = [], s = [], r = []) {
  qn(r, t, s, (n) => {
    lt(xr, () => e(...n.map(i)), !0);
  });
}
function zs(e, t = 0) {
  var s = lt(rt | t, e, !0);
  return s;
}
function $e(e) {
  return lt(at | Jt, e, !0);
}
function Ma(e) {
  var t = e.teardown;
  if (t !== null) {
    const s = Xt, r = X;
    Br(!0), Te(null);
    try {
      t.call(null);
    } finally {
      Br(s), Te(r);
    }
  }
}
function Sa(e, t = !1) {
  var s = e.first;
  for (e.first = e.last = null; s !== null; ) {
    const n = s.ac;
    n !== null && qs(() => {
      n.abort(jt);
    });
    var r = s.next;
    (s.f & Pt) !== 0 ? s.parent = null : Ae(s, t), s = r;
  }
}
function ti(e) {
  for (var t = e.first; t !== null; ) {
    var s = t.next;
    (t.f & at) === 0 && Ae(t), t = s;
  }
}
function Ae(e, t = !0) {
  var s = !1;
  (t || (e.f & sa) !== 0) && e.nodes !== null && e.nodes.end !== null && (Da(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), s = !0), Sa(e, t && !s), Ls(e, 0), ye(e, dt);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const a of r)
      a.stop();
  Ma(e);
  var n = e.parent;
  n !== null && n.first !== null && Ea(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Da(e, t) {
  for (; e !== null; ) {
    var s = e === t ? null : /* @__PURE__ */ ps(e);
    e.remove(), e = s;
  }
}
function Ea(e) {
  var t = e.parent, s = e.prev, r = e.next;
  s !== null && (s.next = r), r !== null && (r.prev = s), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = s));
}
function Mt(e, t, s = !0) {
  var r = [];
  Ta(e, r, !0);
  var n = () => {
    s && Ae(e), t && t();
  }, a = r.length;
  if (a > 0) {
    var l = () => --a || n();
    for (var u of r)
      u.out(l);
  } else
    n();
}
function Ta(e, t, s) {
  if ((e.f & Ie) === 0) {
    e.f ^= Ie;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || s) && t.push(u);
    for (var n = e.first; n !== null; ) {
      var a = n.next, l = (n.f & Et) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (n.f & at) !== 0 && (e.f & rt) !== 0;
      Ta(n, t, l ? s : !1), n = a;
    }
  }
}
function Ar(e) {
  Aa(e, !0);
}
function Aa(e, t) {
  if ((e.f & Ie) !== 0) {
    e.f ^= Ie, (e.f & be) === 0 && (ye(e, Oe), At(e));
    for (var s = e.first; s !== null; ) {
      var r = s.next, n = (s.f & Et) !== 0 || (s.f & at) !== 0;
      Aa(s, n ? t : !1), s = r;
    }
    var a = e.nodes && e.nodes.t;
    if (a !== null)
      for (const l of a)
        (l.is_global || t) && l.in();
  }
}
function Fa(e, t) {
  if (e.nodes)
    for (var s = e.nodes.start, r = e.nodes.end; s !== null; ) {
      var n = s === r ? null : /* @__PURE__ */ ps(s);
      t.append(s), s = n;
    }
}
let St = !1;
function Ns(e) {
  St = e;
}
let Xt = !1;
function Br(e) {
  Xt = e;
}
let X = null, Ke = !1;
function Te(e) {
  X = e;
}
let ee = null;
function Ge(e) {
  ee = e;
}
let st = null;
function Pa(e) {
  X !== null && (st === null ? st = [e] : st.push(e));
}
let xe = null, Pe = 0, Le = null;
function si(e) {
  Le = e;
}
let Ra = 1, ds = 0, Dt = ds;
function Ur(e) {
  Dt = e;
}
function Ia() {
  return ++Ra;
}
function ms(e) {
  var t = e.f;
  if ((t & Oe) !== 0)
    return !0;
  if (t & pe && (e.f &= ~Tt), (t & Ve) !== 0) {
    var s = e.deps;
    if (s !== null)
      for (var r = s.length, n = 0; n < r; n++) {
        var a = s[n];
        if (ms(
          /** @type {Derived} */
          a
        ) && da(
          /** @type {Derived} */
          a
        ), a.wv > e.wv)
          return !0;
      }
    (t & Ue) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ye === null && ye(e, be);
  }
  return !1;
}
function Oa(e, t, s = !0) {
  var r = e.reactions;
  if (r !== null && !st?.includes(e))
    for (var n = 0; n < r.length; n++) {
      var a = r[n];
      (a.f & pe) !== 0 ? Oa(
        /** @type {Derived} */
        a,
        t,
        !1
      ) : t === a && (s ? ye(a, Oe) : (a.f & be) !== 0 && ye(a, Ve), At(
        /** @type {Effect} */
        a
      ));
    }
}
function Ca(e) {
  var t = xe, s = Pe, r = Le, n = X, a = st, l = Ce, u = Ke, o = Dt, v = e.f;
  xe = /** @type {null | Value[]} */
  null, Pe = 0, Le = null, X = (v & (at | Pt)) === 0 ? e : null, st = null, Bt(e.ctx), Ke = !1, Dt = ++ds, e.ac !== null && (qs(() => {
    e.ac.abort(jt);
  }), e.ac = null);
  try {
    e.f |= _r;
    var h = (
      /** @type {Function} */
      e.fn
    ), b = h(), _ = e.deps;
    if (xe !== null) {
      var m;
      if (Ls(e, Pe), _ !== null && Pe > 0)
        for (_.length = Pe + xe.length, m = 0; m < xe.length; m++)
          _[Pe + m] = xe[m];
      else
        e.deps = _ = xe;
      if (fs() && (e.f & Ue) !== 0)
        for (m = Pe; m < _.length; m++)
          (_[m].reactions ??= []).push(e);
    } else _ !== null && Pe < _.length && (Ls(e, Pe), _.length = Pe);
    if (ia() && Le !== null && !Ke && _ !== null && (e.f & (pe | Ve | Oe)) === 0)
      for (m = 0; m < /** @type {Source[]} */
      Le.length; m++)
        Oa(
          Le[m],
          /** @type {Effect} */
          e
        );
    return n !== null && n !== e && (ds++, Le !== null && (r === null ? r = Le : r.push(.../** @type {Source[]} */
    Le))), (e.f & ht) !== 0 && (e.f ^= ht), b;
  } catch (F) {
    return oa(F);
  } finally {
    e.f ^= _r, xe = t, Pe = s, Le = r, X = n, st = a, Bt(l), Ke = u, Dt = o;
  }
}
function ri(e, t) {
  let s = t.reactions;
  if (s !== null) {
    var r = an.call(s, e);
    if (r !== -1) {
      var n = s.length - 1;
      n === 0 ? s = t.reactions = null : (s[r] = s[n], s.pop());
    }
  }
  s === null && (t.f & pe) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (xe === null || !xe.includes(t)) && (ye(t, Ve), (t.f & Ue) !== 0 && (t.f ^= Ue, t.f &= ~Tt), fa(
    /** @type {Derived} **/
    t
  ), Ls(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Ls(e, t) {
  var s = e.deps;
  if (s !== null)
    for (var r = t; r < s.length; r++)
      ri(e, s[r]);
}
function hs(e) {
  var t = e.f;
  if ((t & dt) === 0) {
    ye(e, be);
    var s = ee, r = St;
    ee = e, St = !0;
    try {
      (t & (rt | vn)) !== 0 ? ti(e) : Sa(e), Ma(e);
      var n = Ca(e);
      e.teardown = typeof n == "function" ? n : null, e.wv = Ra;
      var a;
    } finally {
      St = r, ee = s;
    }
  }
}
async function Na() {
  await Promise.resolve(), Nn();
}
function i(e) {
  var t = e.f, s = (t & pe) !== 0;
  if (X !== null && !Ke) {
    var r = ee !== null && (ee.f & dt) !== 0;
    if (!r && !st?.includes(e)) {
      var n = X.deps;
      if ((X.f & _r) !== 0)
        e.rv < ds && (e.rv = ds, xe === null && n !== null && n[Pe] === e ? Pe++ : xe === null ? xe = [e] : xe.includes(e) || xe.push(e));
      else {
        (X.deps ??= []).push(e);
        var a = e.reactions;
        a === null ? e.reactions = [X] : a.includes(X) || a.push(X);
      }
    }
  }
  if (Xt) {
    if (_t.has(e))
      return _t.get(e);
    if (s) {
      var l = (
        /** @type {Derived} */
        e
      ), u = l.v;
      return ((l.f & be) === 0 && l.reactions !== null || Ha(l)) && (u = Er(l)), _t.set(l, u), u;
    }
  } else s && (!Ye?.has(e) || W?.is_fork && !fs()) && (l = /** @type {Derived} */
  e, ms(l) && da(l), St && fs() && (l.f & Ue) === 0 && La(l));
  if (Ye?.has(e))
    return Ye.get(e);
  if ((e.f & ht) !== 0)
    throw e.v;
  return e.v;
}
function La(e) {
  if (e.deps !== null) {
    e.f ^= Ue;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & pe) !== 0 && (t.f & Ue) === 0 && La(
        /** @type {Derived} */
        t
      );
  }
}
function Ha(e) {
  if (e.v === ge) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (_t.has(t) || (t.f & pe) !== 0 && Ha(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Js(e) {
  var t = Ke;
  try {
    return Ke = !0, e();
  } finally {
    Ke = t;
  }
}
const ai = -7169;
function ye(e, t) {
  e.f = e.f & ai | t;
}
const ni = ["touchstart", "touchmove"];
function ii(e) {
  return ni.includes(e);
}
const $a = /* @__PURE__ */ new Set(), gr = /* @__PURE__ */ new Set();
function li(e, t, s, r = {}) {
  function n(a) {
    if (r.capture || as.call(t, a), !a.cancelBubble)
      return qs(() => s?.call(this, a));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? pt(() => {
    t.addEventListener(e, n, r);
  }) : t.addEventListener(e, n, r), n;
}
function zr(e, t, s, r, n) {
  var a = { capture: r, passive: n }, l = li(e, t, s, a);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Bs(() => {
    t.removeEventListener(e, l, a);
  });
}
function gs(e) {
  for (var t = 0; t < e.length; t++)
    $a.add(e[t]);
  for (var s of gr)
    s(e);
}
let Jr = null;
function as(e) {
  var t = this, s = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, n = e.composedPath?.() || [], a = (
    /** @type {null | Element} */
    n[0] || e.target
  );
  Jr = e;
  var l = 0, u = Jr === e && e.__root;
  if (u) {
    var o = n.indexOf(u);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var v = n.indexOf(t);
    if (v === -1)
      return;
    o <= v && (l = o);
  }
  if (a = /** @type {Element} */
  n[l] || e.target, a !== t) {
    nn(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || s;
      }
    });
    var h = X, b = ee;
    Te(null), Ge(null);
    try {
      for (var _, m = []; a !== null; ) {
        var F = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var w = a["__" + r];
          w != null && (!/** @type {any} */
          a.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === a) && w.call(a, e);
        } catch (f) {
          _ ? m.push(f) : _ = f;
        }
        if (e.cancelBubble || F === t || F === null)
          break;
        a = F;
      }
      if (_) {
        for (let f of m)
          queueMicrotask(() => {
            throw f;
          });
        throw _;
      }
    } finally {
      e.__root = t, delete e.currentTarget, Te(h), Ge(b);
    }
  }
}
function Ya(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function _s(e, t) {
  var s = (
    /** @type {Effect} */
    ee
  );
  s.nodes === null && (s.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function O(e, t) {
  var s = (t & An) !== 0, r = (t & Fn) !== 0, n, a = !e.startsWith("<!>");
  return () => {
    n === void 0 && (n = Ya(a ? e : "<!>" + e), s || (n = /** @type {TemplateNode} */
    /* @__PURE__ */ ft(n)));
    var l = (
      /** @type {TemplateNode} */
      r || ma ? document.importNode(n, !0) : n.cloneNode(!0)
    );
    if (s) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ft(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      _s(u, o);
    } else
      _s(l, l);
    return l;
  };
}
function rs(e = "") {
  {
    var t = tt(e + "");
    return _s(t, t), t;
  }
}
function yt() {
  var e = document.createDocumentFragment(), t = document.createComment(""), s = tt();
  return e.append(t, s), _s(t, s), e;
}
function D(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function R(e, t) {
  var s = t == null ? "" : typeof t == "object" ? t + "" : t;
  s !== (e.__t ??= e.nodeValue) && (e.__t = s, e.nodeValue = s + "");
}
function oi(e, t) {
  return ci(e, t);
}
const $t = /* @__PURE__ */ new Map();
function ci(e, { target: t, anchor: s, props: r = {}, events: n, context: a, intro: l = !0 }) {
  Kn();
  var u = /* @__PURE__ */ new Set(), o = (b) => {
    for (var _ = 0; _ < b.length; _++) {
      var m = b[_];
      if (!u.has(m)) {
        u.add(m);
        var F = ii(m);
        t.addEventListener(m, as, { passive: F });
        var w = $t.get(m);
        w === void 0 ? (document.addEventListener(m, as, { passive: F }), $t.set(m, 1)) : $t.set(m, w + 1);
      }
    }
  };
  o(Hs($a)), gr.add(o);
  var v = void 0, h = Qn(() => {
    var b = s ?? t.appendChild(tt());
    return Yn(
      /** @type {TemplateNode} */
      b,
      {
        pending: () => {
        }
      },
      (_) => {
        if (a) {
          nt({});
          var m = (
            /** @type {ComponentContext} */
            Ce
          );
          m.c = a;
        }
        n && (r.$$events = n), v = e(_, r) || {}, a && it();
      }
    ), () => {
      for (var _ of u) {
        t.removeEventListener(_, as);
        var m = (
          /** @type {number} */
          $t.get(_)
        );
        --m === 0 ? (document.removeEventListener(_, as), $t.delete(_)) : $t.set(_, m);
      }
      gr.delete(o), b !== s && b.parentNode?.removeChild(b);
    };
  });
  return ui.set(v, h), v;
}
let ui = /* @__PURE__ */ new WeakMap();
class ja {
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
  #t = /* @__PURE__ */ new Map();
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
  #s = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #o = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, s = !0) {
    this.anchor = t, this.#o = s;
  }
  #n = () => {
    var t = (
      /** @type {Batch} */
      W
    );
    if (this.#e.has(t)) {
      var s = (
        /** @type {Key} */
        this.#e.get(t)
      ), r = this.#t.get(s);
      if (r)
        Ar(r), this.#s.delete(s);
      else {
        var n = this.#r.get(s);
        n && (this.#t.set(s, n.effect), this.#r.delete(s), n.fragment.lastChild.remove(), this.anchor.before(n.fragment), r = n.effect);
      }
      for (const [a, l] of this.#e) {
        if (this.#e.delete(a), a === t)
          break;
        const u = this.#r.get(l);
        u && (Ae(u.effect), this.#r.delete(l));
      }
      for (const [a, l] of this.#t) {
        if (a === s || this.#s.has(a)) continue;
        const u = () => {
          if (Array.from(this.#e.values()).includes(a)) {
            var v = document.createDocumentFragment();
            Fa(l, v), v.append(tt()), this.#r.set(a, { effect: l, fragment: v });
          } else
            Ae(l);
          this.#s.delete(a), this.#t.delete(a);
        };
        this.#o || !r ? (this.#s.add(a), Mt(l, u, !1)) : u();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #a = (t) => {
    this.#e.delete(t);
    const s = Array.from(this.#e.values());
    for (const [r, n] of this.#r)
      s.includes(r) || (Ae(n.effect), this.#r.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, s) {
    var r = (
      /** @type {Batch} */
      W
    ), n = wa();
    if (s && !this.#t.has(t) && !this.#r.has(t))
      if (n) {
        var a = document.createDocumentFragment(), l = tt();
        a.append(l), this.#r.set(t, {
          effect: $e(() => s(l)),
          fragment: a
        });
      } else
        this.#t.set(
          t,
          $e(() => s(this.anchor))
        );
    if (this.#e.set(r, t), n) {
      for (const [u, o] of this.#t)
        u === t ? r.skipped_effects.delete(o) : r.skipped_effects.add(o);
      for (const [u, o] of this.#r)
        u === t ? r.skipped_effects.delete(o.effect) : r.skipped_effects.add(o.effect);
      r.oncommit(this.#n), r.ondiscard(this.#a);
    } else
      this.#n();
  }
}
function le(e, t, s = !1) {
  var r = new ja(e), n = s ? Et : 0;
  function a(l, u) {
    r.ensure(l, u);
  }
  zs(() => {
    var l = !1;
    t((u, o = !0) => {
      l = !0, a(o, u);
    }), l || a(!1, null);
  }, n);
}
function Re(e, t) {
  return t;
}
function vi(e, t, s) {
  for (var r = [], n = t.length, a, l = t.length, u = 0; u < n; u++) {
    let b = t[u];
    Mt(
      b,
      () => {
        if (a) {
          if (a.pending.delete(b), a.done.add(b), a.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            br(Hs(a.done)), _.delete(a), _.size === 0 && (e.outrogroups = null);
          }
        } else
          l -= 1;
      },
      !1
    );
  }
  if (l === 0) {
    var o = r.length === 0 && s !== null;
    if (o) {
      var v = (
        /** @type {Element} */
        s
      ), h = (
        /** @type {Element} */
        v.parentNode
      );
      Vn(h), h.append(v), e.items.clear();
    }
    br(t, !o);
  } else
    a = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function br(e, t = !0) {
  for (var s = 0; s < e.length; s++)
    Ae(e[s], t);
}
var Xr;
function ke(e, t, s, r, n, a = null) {
  var l = e, u = /* @__PURE__ */ new Map(), o = (t & ra) !== 0;
  if (o) {
    var v = (
      /** @type {Element} */
      e
    );
    l = v.appendChild(tt());
  }
  var h = null, b = /* @__PURE__ */ Dr(() => {
    var g = s();
    return wr(g) ? g : g == null ? [] : Hs(g);
  }), _, m = !0;
  function F() {
    f.fallback = h, fi(f, _, l, t, r), h !== null && (_.length === 0 ? (h.f & et) === 0 ? Ar(h) : (h.f ^= et, ns(h, null, l)) : Mt(h, () => {
      h = null;
    }));
  }
  var w = zs(() => {
    _ = /** @type {V[]} */
    i(b);
    for (var g = _.length, C = /* @__PURE__ */ new Set(), A = (
      /** @type {Batch} */
      W
    ), N = wa(), P = 0; P < g; P += 1) {
      var L = _[P], K = r(L, P), I = m ? null : u.get(K);
      I ? (I.v && zt(I.v, L), I.i && zt(I.i, P), N && A.skipped_effects.delete(I.e)) : (I = di(
        u,
        m ? l : Xr ??= tt(),
        L,
        K,
        P,
        n,
        t,
        s
      ), m || (I.e.f |= et), u.set(K, I)), C.add(K);
    }
    if (g === 0 && a && !h && (m ? h = $e(() => a(l)) : (h = $e(() => a(Xr ??= tt())), h.f |= et)), !m)
      if (N) {
        for (const [V, T] of u)
          C.has(V) || A.skipped_effects.add(T.e);
        A.oncommit(F), A.ondiscard(() => {
        });
      } else
        F();
    i(b);
  }), f = { effect: w, items: u, outrogroups: null, fallback: h };
  m = !1;
}
function fi(e, t, s, r, n) {
  var a = (r & En) !== 0, l = t.length, u = e.items, o = e.effect.first, v, h = null, b, _ = [], m = [], F, w, f, g;
  if (a)
    for (g = 0; g < l; g += 1)
      F = t[g], w = n(F, g), f = /** @type {EachItem} */
      u.get(w).e, (f.f & et) === 0 && (f.nodes?.a?.measure(), (b ??= /* @__PURE__ */ new Set()).add(f));
  for (g = 0; g < l; g += 1) {
    if (F = t[g], w = n(F, g), f = /** @type {EachItem} */
    u.get(w).e, e.outrogroups !== null)
      for (const T of e.outrogroups)
        T.pending.delete(f), T.done.delete(f);
    if ((f.f & et) !== 0)
      if (f.f ^= et, f === o)
        ns(f, null, s);
      else {
        var C = h ? h.next : o;
        f === e.effect.last && (e.effect.last = f.prev), f.prev && (f.prev.next = f.next), f.next && (f.next.prev = f.prev), ut(e, h, f), ut(e, f, C), ns(f, C, s), h = f, _ = [], m = [], o = h.next;
        continue;
      }
    if ((f.f & Ie) !== 0 && (Ar(f), a && (f.nodes?.a?.unfix(), (b ??= /* @__PURE__ */ new Set()).delete(f))), f !== o) {
      if (v !== void 0 && v.has(f)) {
        if (_.length < m.length) {
          var A = m[0], N;
          h = A.prev;
          var P = _[0], L = _[_.length - 1];
          for (N = 0; N < _.length; N += 1)
            ns(_[N], A, s);
          for (N = 0; N < m.length; N += 1)
            v.delete(m[N]);
          ut(e, P.prev, L.next), ut(e, h, P), ut(e, L, A), o = A, h = L, g -= 1, _ = [], m = [];
        } else
          v.delete(f), ns(f, o, s), ut(e, f.prev, f.next), ut(e, f, h === null ? e.effect.first : h.next), ut(e, h, f), h = f;
        continue;
      }
      for (_ = [], m = []; o !== null && o !== f; )
        (v ??= /* @__PURE__ */ new Set()).add(o), m.push(o), o = o.next;
      if (o === null)
        continue;
    }
    (f.f & et) === 0 && _.push(f), h = f, o = f.next;
  }
  if (e.outrogroups !== null) {
    for (const T of e.outrogroups)
      T.pending.size === 0 && (br(Hs(T.done)), e.outrogroups?.delete(T));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || v !== void 0) {
    var K = [];
    if (v !== void 0)
      for (f of v)
        (f.f & Ie) === 0 && K.push(f);
    for (; o !== null; )
      (o.f & Ie) === 0 && o !== e.fallback && K.push(o), o = o.next;
    var I = K.length;
    if (I > 0) {
      var V = (r & ra) !== 0 && l === 0 ? s : null;
      if (a) {
        for (g = 0; g < I; g += 1)
          K[g].nodes?.a?.measure();
        for (g = 0; g < I; g += 1)
          K[g].nodes?.a?.fix();
      }
      vi(e, K, V);
    }
  }
  a && pt(() => {
    if (b !== void 0)
      for (f of b)
        f.nodes?.a?.apply();
  });
}
function di(e, t, s, r, n, a, l, u) {
  var o = (l & Sn) !== 0 ? (l & Tn) === 0 ? /* @__PURE__ */ Jn(s, !1, !1) : Ft(s) : null, v = (l & Dn) !== 0 ? Ft(n) : null;
  return {
    v: o,
    i: v,
    e: $e(() => (a(t, o ?? s, v ?? n, u), () => {
      e.delete(r);
    }))
  };
}
function ns(e, t, s) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end, a = t && (t.f & et) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : s; r !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ps(r)
      );
      if (a.before(r), r === n)
        return;
      r = l;
    }
}
function ut(e, t, s) {
  t === null ? e.effect.first = s : t.next = s, s === null ? e.effect.last = t : s.prev = t;
}
function Kr(e, t, s = !1, r = !1, n = !1) {
  var a = e, l = "";
  z(() => {
    var u = (
      /** @type {Effect} */
      ee
    );
    if (l !== (l = t() ?? "") && (u.nodes !== null && (Da(
      u.nodes.start,
      /** @type {TemplateNode} */
      u.nodes.end
    ), u.nodes = null), l !== "")) {
      var o = l + "";
      s ? o = `<svg>${o}</svg>` : r && (o = `<math>${o}</math>`);
      var v = Ya(o);
      if ((s || r) && (v = /** @type {Element} */
      /* @__PURE__ */ ft(v)), _s(
        /** @type {TemplateNode} */
        /* @__PURE__ */ ft(v),
        /** @type {TemplateNode} */
        v.lastChild
      ), s || r)
        for (; /* @__PURE__ */ ft(v); )
          a.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ ft(v)
          );
      else
        a.before(v);
    }
  });
}
function hi(e, t, s) {
  var r = new ja(e);
  zs(() => {
    var n = t() ?? null;
    r.ensure(n, n && ((a) => s(a, n)));
  }, Et);
}
const Vr = [...` 	
\r\f \v\uFEFF`];
function _i(e, t, s) {
  var r = e == null ? "" : "" + e;
  if (t && (r = r ? r + " " + t : t), s) {
    for (var n in s)
      if (s[n])
        r = r ? r + " " + n : n;
      else if (r.length)
        for (var a = n.length, l = 0; (l = r.indexOf(n, l)) >= 0; ) {
          var u = l + a;
          (l === 0 || Vr.includes(r[l - 1])) && (u === r.length || Vr.includes(r[u])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(u + 1) : l = u;
        }
  }
  return r === "" ? null : r;
}
function pi(e, t) {
  return e == null ? null : String(e);
}
function Be(e, t, s, r, n, a) {
  var l = e.__className;
  if (l !== s || l === void 0) {
    var u = _i(s, r, a);
    u == null ? e.removeAttribute("class") : e.className = u, e.__className = s;
  } else if (a && n !== a)
    for (var o in a) {
      var v = !!a[o];
      (n == null || v !== !!n[o]) && e.classList.toggle(o, v);
    }
  return a;
}
function us(e, t, s, r) {
  var n = e.__style;
  if (n !== t) {
    var a = pi(t);
    a == null ? e.removeAttribute("style") : e.style.cssText = a, e.__style = t;
  }
  return r;
}
function qa(e, t, s = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!wr(t))
      return Rn();
    for (var r of e.options)
      r.selected = t.includes(vs(r));
    return;
  }
  for (r of e.options) {
    var n = vs(r);
    if (pa(n, t)) {
      r.selected = !0;
      return;
    }
  }
  (!s || t !== void 0) && (e.selectedIndex = -1);
}
function mi(e) {
  var t = new MutationObserver(() => {
    qa(e, e.__value);
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
  }), Bs(() => {
    t.disconnect();
  });
}
function gi(e, t, s = t) {
  var r = /* @__PURE__ */ new WeakSet(), n = !0;
  Tr(e, "change", (a) => {
    var l = a ? "[selected]" : ":checked", u;
    if (e.multiple)
      u = [].map.call(e.querySelectorAll(l), vs);
    else {
      var o = e.querySelector(l) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      u = o && vs(o);
    }
    s(u), W !== null && r.add(W);
  }), ka(() => {
    var a = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        ls ?? W
      );
      if (r.has(l))
        return;
    }
    if (qa(e, a, n), n && a === void 0) {
      var u = e.querySelector(":checked");
      u !== null && (a = vs(u), s(a));
    }
    e.__value = a, n = !1;
  }), mi(e);
}
function vs(e) {
  return "__value" in e ? e.__value : e.value;
}
const bi = /* @__PURE__ */ Symbol("is custom element"), wi = /* @__PURE__ */ Symbol("is html");
function Ee(e, t, s, r) {
  var n = yi(e);
  n[t] !== (n[t] = s) && (t === "loading" && (e[hn] = s), s == null ? e.removeAttribute(t) : typeof s != "string" && xi(e).includes(t) ? e[t] = s : e.setAttribute(t, s));
}
function yi(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [bi]: e.nodeName.includes("-"),
      [wi]: e.namespaceURI === Pn
    }
  );
}
var Gr = /* @__PURE__ */ new Map();
function xi(e) {
  var t = e.getAttribute("is") || e.nodeName, s = Gr.get(t);
  if (s) return s;
  Gr.set(t, s = []);
  for (var r, n = e, a = Element.prototype; a !== n; ) {
    r = ln(n);
    for (var l in r)
      r[l].set && s.push(l);
    n = Qr(n);
  }
  return s;
}
function is(e, t, s = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Tr(e, "input", async (n) => {
    var a = n ? e.defaultValue : e.value;
    if (a = or(e) ? cr(a) : a, s(a), W !== null && r.add(W), await Na(), a !== (a = t())) {
      var l = e.selectionStart, u = e.selectionEnd, o = e.value.length;
      if (e.value = a ?? "", u !== null) {
        var v = e.value.length;
        l === u && u === o && v > o ? (e.selectionStart = v, e.selectionEnd = v) : (e.selectionStart = l, e.selectionEnd = Math.min(u, v));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Js(t) == null && e.value && (s(or(e) ? cr(e.value) : e.value), W !== null && r.add(W)), Us(() => {
    var n = t();
    if (e === document.activeElement) {
      var a = (
        /** @type {Batch} */
        ls ?? W
      );
      if (r.has(a))
        return;
    }
    or(e) && n === cr(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
  });
}
const lr = /* @__PURE__ */ new Set();
function Rs(e, t, s, r, n = r) {
  var a = s.getAttribute("type") === "checkbox", l = e;
  if (t !== null)
    for (var u of t)
      l = l[u] ??= [];
  l.push(s), Tr(
    s,
    "change",
    () => {
      var o = s.__value;
      a && (o = ki(l, o, s.checked)), n(o);
    },
    // TODO better default value handling
    () => n(a ? [] : null)
  ), Us(() => {
    var o = r();
    a ? (o = o || [], s.checked = o.includes(s.__value)) : s.checked = pa(s.__value, o);
  }), Bs(() => {
    var o = l.indexOf(s);
    o !== -1 && l.splice(o, 1);
  }), lr.has(l) || (lr.add(l), pt(() => {
    l.sort((o, v) => o.compareDocumentPosition(v) === 4 ? -1 : 1), lr.delete(l);
  })), pt(() => {
  });
}
function ki(e, t, s) {
  for (var r = /* @__PURE__ */ new Set(), n = 0; n < e.length; n += 1)
    e[n].checked && r.add(e[n].__value);
  return s || r.delete(t), Array.from(r);
}
function or(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function cr(e) {
  return e === "" ? null : +e;
}
function Wr(e, t) {
  return e === t || e?.[kt] === t;
}
function Je(e = {}, t, s, r) {
  return ka(() => {
    var n, a;
    return Us(() => {
      n = a, a = r?.() || [], Js(() => {
        e !== s(...a) && (t(e, ...a), n && Wr(s(...n), e) && t(null, ...n));
      });
    }), () => {
      pt(() => {
        a && Wr(s(...a), e) && t(null, ...a);
      });
    };
  }), e;
}
const Mi = {
  get(e, t) {
    let s = e.props.length;
    for (; s--; ) {
      let r = e.props[s];
      if (ss(r) && (r = r()), typeof r == "object" && r !== null && t in r) return r[t];
    }
  },
  set(e, t, s) {
    let r = e.props.length;
    for (; r--; ) {
      let n = e.props[r];
      ss(n) && (n = n());
      const a = xt(n, t);
      if (a && a.set)
        return a.set(s), !0;
    }
    return !1;
  },
  getOwnPropertyDescriptor(e, t) {
    let s = e.props.length;
    for (; s--; ) {
      let r = e.props[s];
      if (ss(r) && (r = r()), typeof r == "object" && r !== null && t in r) {
        const n = xt(r, t);
        return n && !n.configurable && (n.configurable = !0), n;
      }
    }
  },
  has(e, t) {
    if (t === kt || t === dn) return !1;
    for (let s of e.props)
      if (ss(s) && (s = s()), s != null && t in s) return !0;
    return !1;
  },
  ownKeys(e) {
    const t = [];
    for (let s of e.props)
      if (ss(s) && (s = s()), !!s) {
        for (const r in s)
          t.includes(r) || t.push(r);
        for (const r of Object.getOwnPropertySymbols(s))
          t.includes(r) || t.push(r);
      }
    return t;
  }
};
function Si(...e) {
  return new Proxy({ props: e }, Mi);
}
function Ba(e, t, s, r) {
  var n = (
    /** @type {V} */
    r
  ), a = !0, l = () => (a && (a = !1, n = /** @type {V} */
  r), n), u;
  u = /** @type {V} */
  e[t], u === void 0 && r !== void 0 && (u = l());
  var o;
  return o = () => {
    var v = (
      /** @type {V} */
      e[t]
    );
    return v === void 0 ? l() : (a = !0, v);
  }, o;
}
function Rt(e) {
  Ce === null && _n(), ya(() => {
    const t = Js(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Di = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Di);
function Ei(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var ur = { exports: {} }, Zr;
function Ti() {
  return Zr || (Zr = 1, (function(e) {
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
      function n(w, f, g) {
        var C = w || s, A = f || 0, N = g || !1, P = 0, L;
        function K(T, y) {
          var S;
          if (y) {
            if (S = y.getTime(), N) {
              var k = h(y);
              if (y = new Date(S + k + A), h(y) !== k) {
                var j = h(y);
                y = new Date(S + j + A);
              }
            }
          } else {
            var B = Date.now();
            B > P ? (P = B, L = new Date(P), S = P, N && (L = new Date(P + h(L) + A))) : S = P, y = L;
          }
          return I(T, y, C, S);
        }
        function I(T, y, S, B) {
          for (var k = "", j = null, re = !1, ae = T.length, _e = !1, ve = 0; ve < ae; ve++) {
            var fe = T.charCodeAt(ve);
            if (re === !0) {
              if (fe === 45) {
                j = "";
                continue;
              } else if (fe === 95) {
                j = " ";
                continue;
              } else if (fe === 48) {
                j = "0";
                continue;
              } else if (fe === 58) {
                _e && F("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), _e = !0;
                continue;
              }
              switch (fe) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  k += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  k += S.days[y.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  k += S.months[y.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  k += a(Math.floor(y.getFullYear() / 100), j);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  k += I(S.formats.D, y, S, B);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  k += I(S.formats.F, y, S, B);
                  break;
                // '00'
                // case 'H':
                case 72:
                  k += a(y.getHours(), j);
                  break;
                // '12'
                // case 'I':
                case 73:
                  k += a(u(y.getHours()), j);
                  break;
                // '000'
                // case 'L':
                case 76:
                  k += l(Math.floor(B % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  k += a(y.getMinutes(), j);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  k += y.getHours() < 12 ? S.am : S.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  k += I(S.formats.R, y, S, B);
                  break;
                // '00'
                // case 'S':
                case 83:
                  k += a(y.getSeconds(), j);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  k += I(S.formats.T, y, S, B);
                  break;
                // '00'
                // case 'U':
                case 85:
                  k += a(o(y, "sunday"), j);
                  break;
                // '00'
                // case 'W':
                case 87:
                  k += a(o(y, "monday"), j);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  k += I(S.formats.X, y, S, B);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  k += y.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (N && A === 0)
                    k += "GMT";
                  else {
                    var $ = b(y);
                    k += $ || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  k += S.shortDays[y.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  k += S.shortMonths[y.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  k += I(S.formats.c, y, S, B);
                  break;
                // '01'
                // case 'd':
                case 100:
                  k += a(y.getDate(), j);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  k += a(y.getDate(), j ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  k += S.shortMonths[y.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var te = new Date(y.getFullYear(), 0, 1), q = Math.ceil((y.getTime() - te.getTime()) / (1e3 * 60 * 60 * 24));
                  k += l(q);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  k += a(y.getHours(), j ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  k += a(u(y.getHours()), j ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  k += a(y.getMonth() + 1, j);
                  break;
                // '\n'
                // case 'n':
                case 110:
                  k += `
`;
                  break;
                // '1st'
                // case 'o':
                case 111:
                  var q = y.getDate();
                  S.ordinalSuffixes ? k += String(q) + (S.ordinalSuffixes[q - 1] || v(q)) : k += String(q) + v(q);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  k += y.getHours() < 12 ? S.AM : S.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  k += I(S.formats.r, y, S, B);
                  break;
                // '0'
                // case 's':
                case 115:
                  k += Math.floor(B / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  k += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var q = y.getDay();
                  k += q === 0 ? 7 : q;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  k += I(S.formats.v, y, S, B);
                  break;
                // '4'
                // case 'w':
                case 119:
                  k += y.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  k += I(S.formats.x, y, S, B);
                  break;
                // '70'
                // case 'y':
                case 121:
                  k += a(y.getFullYear() % 100, j);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (N && A === 0)
                    k += _e ? "+00:00" : "+0000";
                  else {
                    var Z;
                    A !== 0 ? Z = A / (60 * 1e3) : Z = -y.getTimezoneOffset();
                    var ce = Z < 0 ? "-" : "+", se = _e ? ":" : "", J = Math.floor(Math.abs(Z / 60)), G = Math.abs(Z % 60);
                    k += ce + a(J) + se + a(G);
                  }
                  break;
                default:
                  re && (k += "%"), k += T[ve];
                  break;
              }
              j = null, re = !1;
              continue;
            }
            if (fe === 37) {
              re = !0;
              continue;
            }
            k += T[ve];
          }
          return k;
        }
        var V = K;
        return V.localize = function(T) {
          return new n(T || C, A, N);
        }, V.localizeByIdentifier = function(T) {
          var y = t[T];
          return y ? V.localize(y) : (F('[WARNING] No locale found with identifier "' + T + '".'), V);
        }, V.timezone = function(T) {
          var y = A, S = N, B = typeof T;
          if (B === "number" || B === "string")
            if (S = !0, B === "string") {
              var k = T[0] === "-" ? -1 : 1, j = parseInt(T.slice(1, 3), 10), re = parseInt(T.slice(3, 5), 10);
              y = k * (60 * j + re) * 60 * 1e3;
            } else B === "number" && (y = T * 60 * 1e3);
          return new n(C, y, S);
        }, V.utc = function() {
          return new n(C, A, !0);
        }, V;
      }
      function a(w, f) {
        return f === "" || w > 9 ? "" + w : (f == null && (f = "0"), f + w);
      }
      function l(w) {
        return w > 99 ? w : w > 9 ? "0" + w : "00" + w;
      }
      function u(w) {
        return w === 0 ? 12 : w > 12 ? w - 12 : w;
      }
      function o(w, f) {
        f = f || "sunday";
        var g = w.getDay();
        f === "monday" && (g === 0 ? g = 6 : g--);
        var C = Date.UTC(w.getFullYear(), 0, 1), A = Date.UTC(w.getFullYear(), w.getMonth(), w.getDate()), N = Math.floor((A - C) / 864e5), P = (N + 7 - g) / 7;
        return Math.floor(P);
      }
      function v(w) {
        var f = w % 10, g = w % 100;
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
      function h(w) {
        return (w.getTimezoneOffset() || 0) * 6e4;
      }
      function b(w, f) {
        return _() || m(w);
      }
      function _(w, f) {
        return null;
      }
      function m(w) {
        var f = w.toString().match(/\(([\w\s]+)\)/);
        return f && f[1];
      }
      function F(w) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(w);
      }
    })();
  })(ur)), ur.exports;
}
var Ai = Ti();
const qt = /* @__PURE__ */ Ei(Ai);
let vr = /* @__PURE__ */ H(!1);
class Fi {
  constructor(t) {
    if (this.sk = "", this.fetchFn = t || (typeof window < "u" ? fetch.bind(window) : fetch), typeof document < "u") {
      const s = document.querySelector('meta[name="csrf-token"]');
      s && (this.sk = s.content);
    }
  }
  get loading() {
    return i(vr);
  }
  async request(t, s = {}) {
    M(vr, !0);
    try {
      const r = new URL(t, window.location.origin);
      s.params && Object.entries(s.params).forEach(([u, o]) => {
        r.searchParams.append(u, String(o));
      });
      const n = new Headers(s.headers || {});
      n.set("X-Requested-With", "fetch");
      let a = s.body;
      s.method && ["POST", "PUT", "PATCH", "DELETE"].includes(s.method.toUpperCase()) && (a instanceof FormData ? a.set("sk", this.sk) : a && typeof a == "object" && !(a instanceof Blob) && !(a instanceof ArrayBuffer) && (n.set("Content-Type", "application/json"), a = JSON.stringify(a)));
      const l = await this.fetchFn(r.toString(), { ...s, headers: n, body: a });
      if (!l.ok)
        throw new Error(`API Error: ${l.status} ${l.statusText}`);
      return await l.json();
    } finally {
      M(vr, !1);
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
const oe = new Fi(), Pi = (e, t = $s) => {
  var s = Ri(), r = c(s);
  z(() => {
    Be(s, 1, `status status-${t().status ?? ""}`, "svelte-13s7gu4"), R(r, t().status);
  }), D(e, s);
};
var Ri = /* @__PURE__ */ O("<span> </span>"), Ii = /* @__PURE__ */ O('<time class="svelte-13s7gu4"> </time>'), Oi = /* @__PURE__ */ O('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Ci = /* @__PURE__ */ O('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), Ni = /* @__PURE__ */ O('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Li = /* @__PURE__ */ O('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), Hi = /* @__PURE__ */ O('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4">エントリ一覧</h2> <div class="search-box svelte-13s7gu4"><input type="text" placeholder="検索..." class="svelte-13s7gu4"/> <button class="svelte-13s7gu4">検索</button></div> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">新しい方へ</button> <button class="svelte-13s7gu4">古い方へ</button></div></div> <div><!></div></div>');
function $i(e, t) {
  nt(t, !0);
  const s = (T, y = $s, S) => {
    let B = /* @__PURE__ */ Dr(() => ta(S?.(), !0));
    var k = Ii(), j = c(k);
    z(
      (re) => {
        Ee(k, "datetime", y()), R(j, re);
      },
      [() => i(B) && y() ? _(y()) : "-"]
    ), D(T, k);
  };
  let r = /* @__PURE__ */ H(we([])), n = /* @__PURE__ */ H(!1), a = 50, l = /* @__PURE__ */ H(""), u = /* @__PURE__ */ H(we([]));
  async function o() {
    try {
      const T = i(u)[i(u).length - 1], y = { limit: a };
      i(l) && (y.q = i(l)), T && (y.cursor_id = T);
      const S = await oe.get("/admin/api/entries", y);
      M(r, S.entries || [], !0), M(n, S.has_more || !1, !0);
    } catch (T) {
      console.error(T);
    }
  }
  function v() {
    M(u, [], !0), o();
  }
  Rt(o);
  function h() {
    if (i(n) && i(r).length > 0) {
      const T = i(r)[i(r).length - 1];
      i(u).push(T.id), o();
    }
  }
  function b() {
    i(u).length > 0 && (i(u).pop(), o());
  }
  function _(T) {
    return T ? qt("%Y-%m-%d %H:%M", new Date(T)) : "-";
  }
  var m = Hi(), F = c(m), w = d(c(F), 2), f = c(w);
  f.__keydown = (T) => T.key === "Enter" && v();
  var g = d(f, 2);
  g.__click = v;
  var C = d(w, 2), A = c(C);
  A.__click = b;
  var N = d(A, 2);
  N.__click = h;
  var P = d(F, 2);
  let L;
  var K = c(P);
  {
    var I = (T) => {
      var y = Oi();
      D(T, y);
    }, V = (T) => {
      var y = Li(), S = qe(y), B = d(c(S));
      ke(B, 21, () => i(r), Re, (re, ae) => {
        var _e = Ci(), ve = c(_e), fe = c(ve), $ = d(ve), te = c($), q = d($), Z = c(q);
        Pi(Z, () => i(ae));
        var ce = d(q), se = c(ce), J = c(se), G = d(se, 2), ie = c(G), ue = c(ie), me = d(ce), Me = c(me), p = d(me), x = c(p);
        s(x, () => i(ae).created_at);
        var Y = d(p), Q = c(Y);
        s(Q, () => i(ae).modified_at);
        var ne = d(Y), Ne = c(ne);
        s(Ne, () => i(ae).publish_at?.Time, () => i(ae).publish_at?.Valid);
        var Se = d(ne), ze = c(Se);
        ze.__click = () => t.onEdit(i(ae).id), z(() => {
          R(fe, i(ae).id), R(te, i(ae).date), R(J, i(ae).title), Ee(ie, "href", `/${i(ae).path ?? ""}`), R(ue, `/${i(ae).path ?? ""}`), R(Me, i(ae).format);
        }), D(re, _e);
      });
      var k = d(S, 2);
      {
        var j = (re) => {
          var ae = Ni();
          D(re, ae);
        };
        le(k, (re) => {
          oe.loading && re(j);
        });
      }
      D(T, y);
    };
    le(K, (T) => {
      oe.loading && i(r).length === 0 ? T(I) : T(V, !1);
    });
  }
  z(() => {
    A.disabled = i(u).length === 0 || oe.loading, N.disabled = !i(n) || oe.loading, L = Be(P, 1, "table-container svelte-13s7gu4", null, L, { "is-loading": oe.loading });
  }), is(f, () => i(l), (T) => M(l, T)), D(e, m), it();
}
gs(["keydown", "click"]);
class Yi {
  #e;
  get exists() {
    return i(this.#e);
  }
  set exists(t) {
    M(this.#e, t, !0);
  }
  #t;
  get data() {
    return i(this.#t);
  }
  set data(t) {
    M(this.#t, t, !0);
  }
  constructor(t = typeof localStorage < "u" ? localStorage : null) {
    this.storage = t, this.timer = null, this.#e = /* @__PURE__ */ H(!1), this.#t = /* @__PURE__ */ H(null);
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
const ji = "public", qi = "draft", Bi = "scheduled", Ui = "reserved", Yt = ji, fr = qi, Is = Bi, Os = Ui;
var zi = /* @__PURE__ */ O('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), Ji = /* @__PURE__ */ O('<option class="svelte-7nstam"> </option>'), Xi = /* @__PURE__ */ O('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), Ki = /* @__PURE__ */ O('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), Vi = /* @__PURE__ */ O('<button id="restore" type="button" class="submit-button restore-button svelte-7nstam">復元...</button>'), Gi = /* @__PURE__ */ O('<div role="option" tabindex="-1"> </div>'), Wi = /* @__PURE__ */ O('<span class="tag svelte-7nstam"> </span>'), Zi = /* @__PURE__ */ O('<div role="button" tabindex="-1"><div class="result-title svelte-7nstam"><!> <!> <button type="button" class="open-result-button svelte-7nstam" title="別タブで開く">↗️</button></div> <div class="result-summary svelte-7nstam"><!></div> <div class="result-meta svelte-7nstam"><span class="result-date svelte-7nstam"> </span> <span class="result-path svelte-7nstam"> </span></div></div>'), Qi = /* @__PURE__ */ O('<div class="no-results svelte-7nstam">結果が見つかりません</div>'), el = /* @__PURE__ */ O('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam">🔗 リンク</button> <button type="button" class="svelte-7nstam"> </button> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons footer-container svelte-7nstam"><div class="status-selector svelte-7nstam"><label class="status-option svelte-7nstam" title="非公開のまま保存します"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">下書き</span></div></label> <label class="status-option svelte-7nstam" title="今すぐ公開し、URLを確定させます"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">公開</span></div></label> <label class="status-option svelte-7nstam" title="指定した日時に公開します。URLは今すぐ確定します。"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">公開を遅延</span> <span class="description svelte-7nstam">URL確定</span></div></label> <label class="status-option svelte-7nstam" title="指定した日付を投稿日として予約します。公開されるまでURLは確定しません。"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">予約投稿</span> <span class="description svelte-7nstam">URL未定</span></div></label></div> <div class="action-row-container svelte-7nstam"><div class="footer-left svelte-7nstam"><button type="button" class="submit-button svelte-7nstam"><!></button> <!></div> <div class="footer-right svelte-7nstam"><!> <button type="button" class="submit-button preview-button svelte-7nstam">プレビュー</button></div></div></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam" role="listbox" aria-label="タグを選択" tabindex="0"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog> <dialog id="previewDialog" class="svelte-7nstam"><div class="preview-header svelte-7nstam"><h3 class="svelte-7nstam">プレビュー</h3> <button type="button" class="close-button svelte-7nstam">閉じる</button></div> <div class="preview-body svelte-7nstam"><iframe name="preview-iframe" title="Preview" class="svelte-7nstam"></iframe></div></dialog> <dialog id="searchDialog" class="search-dialog svelte-7nstam"><div class="search-header svelte-7nstam"><h3 class="svelte-7nstam">過去日記を検索</h3> <button type="button" class="close-button svelte-7nstam">閉じる</button></div> <div class="search-body svelte-7nstam"><input type="search" placeholder="キーワードを入力..." class="search-input svelte-7nstam"/> <div class="search-results svelte-7nstam"></div></div> <div class="dialog-footer svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button></div></dialog>', 1);
function tl(e, t) {
  nt(t, !0);
  const s = [];
  let r = Ba(t, "id", 3, null);
  const n = new Yi();
  let a = /* @__PURE__ */ H(we({ id: void 0, title: "", body: "", status: "" })), l = we({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: Yt,
    publishAt: ""
  }), u = /* @__PURE__ */ H(!1), o = /* @__PURE__ */ H(""), v = /* @__PURE__ */ H(!1), h = /* @__PURE__ */ H(!0), b = /* @__PURE__ */ H(null), _ = /* @__PURE__ */ H(null), m = /* @__PURE__ */ H(null), F = /* @__PURE__ */ H(null), w = /* @__PURE__ */ H(null), f = /* @__PURE__ */ H(null), g = /* @__PURE__ */ H(null);
  const C = [
    "tech",
    "photo",
    "redeveloped",
    "stablediffusion",
    "photoshopped"
  ];
  let A = /* @__PURE__ */ H(0), N = /* @__PURE__ */ H(""), P = /* @__PURE__ */ H(we([])), L = /* @__PURE__ */ H(0), K = /* @__PURE__ */ H(null), I = we([]);
  async function V(p) {
    try {
      M(h, !0);
      const x = await oe.get(`/admin/api/entry/${p}`);
      M(a, x, !0), l.id = x.id, l.title = x.title, l.body = x.body, l.format = x.format || "Hatena", l.status = x.status, x.publish_at?.Valid ? l.publishAt = qt("%Y-%m-%dT%H:%M", new Date(x.publish_at.Time)) : l.publishAt = qt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), n.check(i(a).id ?? null, { title: l.title, body: l.body });
    } catch (x) {
      console.error(x), alert("エントリの取得に失敗しました");
    } finally {
      M(h, !1);
    }
  }
  Rt(() => {
    r() ? V(r()) : (M(a, { id: void 0, title: "", body: "", status: Yt }, !0), l.id = null, l.title = "", l.body = "", l.format = "Hatena", l.status = Yt, l.publishAt = qt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), n.check(null, { title: l.title, body: l.body }), M(h, !1));
  }), ya(() => {
    (i(a).title !== l.title || i(a).body !== l.body) && n.saveDebounced(i(a).id ?? null, { title: l.title, body: l.body });
  });
  async function T() {
    M(u, !0), M(o, "リクエスト中");
    const p = new FormData();
    if (p.set("id", l.id ? String(l.id) : ""), p.set("title", l.title), p.set("body", l.body), p.set("format", l.format), l.status === Is || l.status === Os) {
      const x = new Date(l.publishAt);
      p.set("publish_at", x.toISOString());
    }
    p.set("status", l.status);
    try {
      const Y = (await oe.post("/admin/api/edit", p)).session_id;
      if (!Y)
        throw new Error("保存に失敗しました");
      y(Y);
    } catch (x) {
      M(u, !1), alert(x instanceof Error ? x.message : "エラーが発生しました");
    }
  }
  function y(p) {
    const x = new EventSource(`/admin/api/edit/progress?sid=${p}`);
    x.onmessage = (Y) => {
      const Q = JSON.parse(Y.data);
      switch (Q.type) {
        case "progress":
          M(o, S(Q.message), !0);
          break;
        case "done":
          n.clear(i(a).id ?? null), M(o, "完了"), M(u, !1), x.close(), t.onSave(Q.location);
          break;
        case "error":
          M(o, "エラー: " + Q.message), M(u, !1), x.close(), alert("保存に失敗しました: " + Q.message);
          break;
      }
    }, x.onerror = () => {
      M(u, !1), x.close(), alert("通信エラーが発生しました");
    };
  }
  function S(p) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[p] || p;
  }
  function B() {
    M(A, 0), i(m).showModal(), setTimeout(() => i(g)?.focus(), 0);
  }
  function k(p) {
    p.key === "ArrowDown" ? (p.preventDefault(), M(A, (i(A) + 1) % C.length)) : p.key === "ArrowUp" ? (p.preventDefault(), M(A, (i(A) - 1 + C.length) % C.length)) : p.key === "Enter" || p.key === " " ? (p.preventDefault(), j(C[i(A)])) : p.key === "Escape" && i(m).close();
  }
  function j(p) {
    const x = `[${p}]`;
    l.title.includes(x) ? l.title = l.title.replace(x, "") : l.title = x + l.title, i(m).close(), i(b).focus();
  }
  function re() {
    M(N, ""), M(P, [], !0), M(L, 0), i(f).showModal(), setTimeout(() => i(K)?.focus(), 0);
  }
  async function ae(p) {
    if (!(p instanceof KeyboardEvent && p.key === "Enter")) {
      if (i(N).length < 2) {
        M(P, [], !0);
        return;
      }
      try {
        const x = await oe.get("/api/search", { q: i(N) });
        M(P, x.results || [], !0), M(L, 0);
      } catch (x) {
        console.error(x);
      }
    }
  }
  function _e(p) {
    p.key === "ArrowDown" || p.ctrlKey && p.key === "n" ? (p.preventDefault(), M(L, (i(L) + 1) % i(P).length), I[i(L)]?.scrollIntoView({ block: "nearest" })) : p.key === "ArrowUp" || p.ctrlKey && p.key === "p" ? (p.preventDefault(), M(L, (i(L) - 1 + i(P).length) % i(P).length), I[i(L)]?.scrollIntoView({ block: "nearest" })) : p.key === "Enter" ? (p.preventDefault(), i(P)[i(L)] && (p.shiftKey || p.metaKey || p.ctrlKey ? ve(i(P)[i(L)]) : fe(i(P)[i(L)]))) : p.key === "Escape" && i(f).close();
  }
  function ve(p) {
    const x = p.path.startsWith("http") ? p.path : `${location.origin}/${p.path}`;
    window.open(x, "_blank");
  }
  function fe(p) {
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
    q(Y), i(f).close(), i(_).focus();
  }
  function $() {
    n.data && (l.title = n.data.title, l.body = n.data.body, n.clear(i(a).id ?? null), i(F).close());
  }
  async function te() {
    const p = document.createElement("input");
    p.type = "file", p.oninput = async () => {
      if (!p.files?.[0]) return;
      const x = new FormData();
      x.append("file", p.files[0]), M(v, !0);
      try {
        const Y = await oe.post("/admin/api/upload/image", x), Q = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${Y.uploaded}" class="picasa" itemprop="url"><img src="${Y.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        q(Q, !0);
      } catch {
        alert("アップロードに失敗しました");
      } finally {
        M(v, !1);
      }
    }, p.click();
  }
  function q(p, x = !1) {
    const Y = i(_).selectionStart, Q = i(_).selectionEnd, ne = i(_).value;
    l.body = ne.substring(0, Y) + p + ne.substring(Q), Na().then(() => {
      typeof x == "boolean" && x ? (i(_).selectionStart = Y, i(_).selectionEnd = Y + p.length) : typeof x == "number" ? i(_).selectionStart = i(_).selectionEnd = Y + x : i(_).selectionStart = i(_).selectionEnd = Y + p.length, i(_).focus();
    });
  }
  function Z(p) {
    const x = (p.altKey ? "Alt-" : "") + (p.ctrlKey ? "Control-" : "") + (p.metaKey ? "Meta-" : "") + (p.shiftKey ? "Shift-" : "") + p.key;
    x === "Control-t" ? (q("\\(  \\)", 3), p.preventDefault(), p.stopPropagation()) : (x === "Control-l" || x === "Meta-l") && (re(), p.preventDefault(), p.stopPropagation());
  }
  function ce() {
    i(w).showModal();
    const p = document.createElement("form");
    p.method = "POST", p.action = "/admin/api/preview", p.target = "preview-iframe";
    const x = {
      title: l.title,
      body: l.body,
      format: l.format,
      sk: oe.skValue
    };
    for (const [Y, Q] of Object.entries(x)) {
      const ne = document.createElement("input");
      ne.type = "hidden", ne.name = Y, ne.value = Q, p.appendChild(ne);
    }
    document.body.appendChild(p), p.submit(), document.body.removeChild(p);
  }
  function se(p) {
    const x = document.createElement("p");
    return x.textContent = p, x.innerHTML;
  }
  function J(p, x) {
    if (!x) return se(p);
    const Y = se(p), Q = x.split(/\s+/).filter((Se) => Se.length >= 2);
    if (Q.length === 0) return Y;
    const ne = Q.map((Se) => Se.replace(/[.*+?^${}()|[\\]/g, "\\$&")).join("|"), Ne = new RegExp(`(${ne})`, "gi");
    return Y.replace(Ne, "<mark>$1</mark>");
  }
  function G(p) {
    const Y = new DOMParser().parseFromString(p, "text/html");
    Y.querySelectorAll("script, style, noscript, iframe").forEach((ne) => ne.remove());
    const Q = Y.body.textContent || "";
    return Q.replace(/\s+/g, " ").trim().substring(0, 200) + (Q.length > 200 ? "..." : "");
  }
  var ie = yt(), ue = qe(ie);
  {
    var me = (p) => {
      var x = zi();
      D(p, x);
    }, Me = (p) => {
      var x = el(), Y = qe(x), Q = c(Y), ne = c(Q);
      Je(ne, (E) => M(b, E), () => i(b));
      var Ne = d(ne, 2), Se = c(Ne);
      Se.__click = B;
      var ze = d(Se, 2);
      ze.__click = re;
      var je = d(ze, 2);
      je.__click = te;
      var mt = c(je), gt = d(je, 2);
      ke(gt, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], Re, (E, U) => {
        var he = Ji(), de = c(he), De = {};
        z(() => {
          R(de, U), De !== (De = U) && (he.value = (he.__value = U) ?? "");
        }), D(E, he);
      });
      var Xs = d(Ne, 2), It = c(Xs);
      It.__keydown = Z, Je(It, (E) => M(_, E), () => i(_));
      var Ks = d(Q, 2), bs = c(Ks);
      {
        var ws = (E) => {
          var U = Xi();
          D(E, U);
        };
        le(bs, (E) => {
          i(u) && E(ws);
        });
      }
      var Vs = d(bs, 2), ys = c(Vs), Kt = c(ys), Vt = c(Kt), xs, Gt = d(Kt, 2), Wt = c(Gt), ks, Zt = d(Gt, 2), Qt = c(Zt), Ms, Ss = d(Zt, 2), es = c(Ss), Ds, Es = d(ys, 2), Ts = c(Es), Ot = c(Ts);
      Ot.__click = T;
      var Gs = c(Ot);
      {
        var Ws = (E) => {
          var U = rs();
          z(() => R(U, i(o) || "リクエスト中")), D(E, U);
        }, Zs = (E) => {
          var U = yt(), he = qe(U);
          {
            var de = (Fe) => {
              var We = rs("下書き保存");
              D(Fe, We);
            }, De = (Fe) => {
              var We = yt(), As = qe(We);
              {
                var nr = (ct) => {
                  var Ht = rs();
                  z(() => R(Ht, r() ? "更新する" : "公開する")), D(ct, Ht);
                }, Fs = (ct) => {
                  var Ht = rs("予約する");
                  D(ct, Ht);
                };
                le(
                  As,
                  (ct) => {
                    l.status === Yt ? ct(nr) : ct(Fs, !1);
                  },
                  !0
                );
              }
              D(Fe, We);
            };
            le(
              he,
              (Fe) => {
                l.status === fr ? Fe(de) : Fe(De, !1);
              },
              !0
            );
          }
          D(E, U);
        };
        le(Gs, (E) => {
          i(u) ? E(Ws) : E(Zs, !1);
        });
      }
      var Qs = d(Ot, 2);
      {
        var er = (E) => {
          var U = Ki();
          is(U, () => l.publishAt, (he) => l.publishAt = he), D(E, U);
        };
        le(Qs, (E) => {
          (l.status === Is || l.status === Os) && E(er);
        });
      }
      var tr = d(Ts, 2), Ct = c(tr);
      {
        var Nt = (E) => {
          var U = Vi();
          U.__click = () => i(F).showModal(), D(E, U);
        };
        le(Ct, (E) => {
          n.exists && E(Nt);
        });
      }
      var ot = d(Ct, 2);
      ot.__click = ce;
      var bt = d(Y, 2), Lt = d(c(bt), 2);
      Lt.__keydown = k, ke(Lt, 21, () => C, Re, (E, U, he) => {
        var de = Gi();
        let De;
        de.__click = () => j(i(U)), de.__keydown = (We) => We.key === "Enter" && j(i(U));
        var Fe = c(de);
        z(() => {
          De = Be(de, 1, "tag-item svelte-7nstam", null, De, { selected: i(A) === he }), Ee(de, "aria-selected", i(A) === he), R(Fe, i(U));
        }), zr("mouseenter", de, () => M(A, he, !0)), D(E, de);
      }), Je(Lt, (E) => M(g, E), () => i(g));
      var sr = d(Lt, 2);
      sr.__click = () => i(m).close(), Je(bt, (E) => M(m, E), () => i(m));
      var rr = d(bt, 2), Fr = d(c(rr), 2), Ua = c(Fr);
      {
        var za = (E) => {
          var U = rs();
          z((he) => R(U, he), [() => qt("%Y年%m月%d日%H時", new Date(n.data.time))]), D(E, U);
        };
        le(Ua, (E) => {
          n.data?.time && E(za);
        });
      }
      var Ja = d(Fr, 2), Pr = c(Ja);
      Pr.__click = () => i(F).close();
      var Xa = d(Pr, 2);
      Xa.__click = $, Je(rr, (E) => M(F, E), () => i(F));
      var ar = d(rr, 2), Ka = c(ar), Va = d(c(Ka), 2);
      Va.__click = () => i(w).close(), Je(ar, (E) => M(w, E), () => i(w));
      var Rr = d(ar, 2), Ir = c(Rr), Ga = d(c(Ir), 2);
      Ga.__click = () => i(f).close();
      var Or = d(Ir, 2), ts = c(Or);
      ts.__input = (E) => ae(E), ts.__keydown = _e, Je(ts, (E) => M(K, E), () => i(K));
      var Wa = d(ts, 2);
      ke(
        Wa,
        21,
        () => i(P),
        Re,
        (E, U, he) => {
          var de = Zi();
          let De;
          de.__click = () => fe(i(U)), de.__keydown = (Ze) => Ze.key === "Enter" && fe(i(U));
          var Fe = c(de), We = c(Fe);
          Kr(We, () => J(i(U).title, i(N)));
          var As = d(We, 2);
          ke(As, 17, () => i(U).tags, Re, (Ze, ir) => {
            var Nr = Wi(), rn = c(Nr);
            z(() => R(rn, i(ir))), D(Ze, Nr);
          });
          var nr = d(As, 2);
          nr.__click = (Ze) => {
            Ze.stopPropagation(), ve(i(U));
          };
          var Fs = d(Fe, 2), ct = c(Fs);
          Kr(ct, () => J(G(i(U).formatted_body), i(N)));
          var Ht = d(Fs, 2), Cr = c(Ht), en = c(Cr), tn = d(Cr, 2), sn = c(tn);
          Je(de, (Ze, ir) => I[ir] = Ze, (Ze) => I?.[Ze], () => [he]), z(() => {
            De = Be(de, 1, "search-result-item svelte-7nstam", null, De, { selected: i(L) === he }), R(en, i(U).date), R(sn, i(U).path);
          }), zr("mouseenter", de, () => M(L, he, !0)), D(E, de);
        },
        (E) => {
          var U = yt(), he = qe(U);
          {
            var de = (De) => {
              var Fe = Qi();
              D(De, Fe);
            };
            le(he, (De) => {
              i(N).length >= 2 && De(de);
            });
          }
          D(E, U);
        }
      );
      var Za = d(Or, 2), Qa = c(Za);
      Qa.__click = () => i(f).close(), Je(Rr, (E) => M(f, E), () => i(f)), z(() => {
        je.disabled = i(v), R(mt, i(v) ? "⌛ アップロード中..." : "📷 写真"), xs !== (xs = fr) && (Vt.value = (Vt.__value = fr) ?? ""), ks !== (ks = Yt) && (Wt.value = (Wt.__value = Yt) ?? ""), Ms !== (Ms = Is) && (Qt.value = (Qt.__value = Is) ?? ""), Ds !== (Ds = Os) && (es.value = (es.__value = Os) ?? ""), Ot.disabled = i(u), ot.disabled = i(u);
      }), is(ne, () => l.title, (E) => l.title = E), gi(gt, () => l.format, (E) => l.format = E), is(It, () => l.body, (E) => l.body = E), Rs(
        s,
        [],
        Vt,
        () => l.status,
        (E) => l.status = E
      ), Rs(
        s,
        [],
        Wt,
        () => l.status,
        (E) => l.status = E
      ), Rs(
        s,
        [],
        Qt,
        () => l.status,
        (E) => l.status = E
      ), Rs(
        s,
        [],
        es,
        () => l.status,
        (E) => l.status = E
      ), is(ts, () => i(N), (E) => M(N, E)), D(p, x);
    };
    le(ue, (p) => {
      i(h) ? p(me) : p(Me, !1);
    });
  }
  D(e, ie), it();
}
gs(["click", "keydown", "input"]);
const sl = (e, t = $s) => {
  var s = rl(), r = c(s);
  z(() => {
    Be(s, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), R(r, t());
  }), D(e, s);
};
var rl = /* @__PURE__ */ O("<span> </span>"), al = /* @__PURE__ */ O('<time class="time svelte-1r6codn"> </time>'), nl = /* @__PURE__ */ O('<div class="loading svelte-1r6codn"></div>'), il = /* @__PURE__ */ O('<div class="error-text svelte-1r6codn"> </div>'), ll = /* @__PURE__ */ O('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><!></td><td class="error svelte-1r6codn"><!></td></tr>'), ol = /* @__PURE__ */ O('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), cl = /* @__PURE__ */ O('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">新しい方へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">古い方へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function ul(e, t) {
  nt(t, !0);
  const s = (I, V = $s, T) => {
    let y = /* @__PURE__ */ Dr(() => ta(T?.(), !0));
    var S = al(), B = c(S);
    z(
      (k) => {
        Ee(S, "datetime", V()), R(B, k);
      },
      [() => i(y) && V() ? h(V()) : "-"]
    ), D(I, S);
  };
  let r = /* @__PURE__ */ H(we([])), n = /* @__PURE__ */ H(0), a = /* @__PURE__ */ H(0), l = 50;
  async function u() {
    try {
      const I = await oe.get("/admin/api/jobs", { limit: l, offset: i(a) });
      M(r, I.jobs || [], !0), M(n, I.total || 0, !0);
    } catch (I) {
      console.error(I);
    }
  }
  Rt(u);
  function o() {
    i(a) + l < i(n) && (M(a, i(a) + l), u());
  }
  function v() {
    i(a) - l >= 0 && (M(a, i(a) - l), u());
  }
  function h(I) {
    return qt("%Y-%m-%d %H:%M:%S", new Date(I));
  }
  var b = cl(), _ = c(b), m = c(_), F = c(m), w = d(m, 2), f = c(w);
  f.__click = v;
  var g = d(f, 2), C = c(g), A = d(g, 2);
  A.__click = o;
  var N = d(A, 2);
  N.__click = u;
  var P = d(_, 2);
  {
    var L = (I) => {
      var V = nl();
      D(I, V);
    }, K = (I) => {
      var V = ol(), T = d(c(V));
      ke(T, 21, () => i(r), Re, (y, S) => {
        var B = ll(), k = c(B), j = c(k), re = d(k), ae = c(re), _e = c(ae), ve = d(re), fe = c(ve);
        sl(fe, () => i(S).status);
        var $ = d(ve), te = c($), q = d($), Z = c(q);
        s(Z, () => i(S).created_at);
        var ce = d(q), se = c(ce);
        {
          var J = (G) => {
            var ie = il(), ue = c(ie);
            z(() => {
              Ee(ie, "title", i(S).error_message.String), R(ue, i(S).error_message.String);
            }), D(G, ie);
          };
          le(se, (G) => {
            i(S).error_message?.Valid && G(J);
          });
        }
        z(() => {
          R(j, i(S).id), R(_e, i(S).job_type_name), R(te, i(S).retry_count);
        }), D(y, B);
      }), D(I, V);
    };
    le(P, (I) => {
      oe.loading && i(r).length === 0 ? I(L) : I(K, !1);
    });
  }
  z(
    (I) => {
      R(F, `ジョブ一覧 (${i(n) ?? ""})`), f.disabled = i(a) === 0 || oe.loading, R(C, `${i(a) + 1} - ${I ?? ""} / ${i(n) ?? ""}`), A.disabled = i(a) + l >= i(n) || oe.loading;
    },
    [() => Math.min(i(a) + l, i(n))]
  ), D(e, b), it();
}
gs(["click"]);
var vl = /* @__PURE__ */ O('<div class="empty svelte-wpgtu6">No Signature</div>'), fl = /* @__PURE__ */ O("<div></div>"), dl = /* @__PURE__ */ O('<div class="row svelte-wpgtu6"></div>'), hl = /* @__PURE__ */ O('<div class="chroma-section svelte-wpgtu6"></div>'), _l = /* @__PURE__ */ O('<div class="chroma-sections svelte-wpgtu6"></div>'), pl = /* @__PURE__ */ O('<div class="color-bitmask svelte-wpgtu6"><!></div>');
function dr(e, t) {
  nt(t, !0);
  let s = Ba(t, "size", 3, 64), r = /* @__PURE__ */ vt(() => {
    if (!t.sig) return new Array(64).fill(!1);
    try {
      const h = atob(t.sig), b = new Uint8Array(h.length);
      for (let m = 0; m < h.length; m++)
        b[m] = h.charCodeAt(m);
      const _ = [];
      for (let m = 0; m < 8; m++) {
        const F = b[m];
        for (let w = 7; w >= 0; w--)
          _.push((F >> w & 1) === 1);
      }
      return _.reverse();
    } catch (h) {
      return console.error("Failed to decode sig:", h), new Array(64).fill(!1);
    }
  });
  function n(h) {
    const b = h >> 5 & 1, _ = h >> 4 & 1, m = h >> 3 & 1, F = h >> 2 & 1, w = h >> 1 & 1, f = h & 1, g = _ << 1 | F, C = b << 2 | m << 1 | w, A = f, N = [25, 45, 65, 85][g], P = A === 0 ? 0.01 : 0.15, L = C * 45;
    return `oklch(${N}% ${P} ${L})`;
  }
  function a(h, b, _) {
    const m = h >> 1 & 1, F = h & 1, w = b >> 2 & 1, f = b >> 1 & 1, g = b & 1, C = _ & 1;
    return w << 5 | m << 4 | f << 3 | F << 2 | g << 1 | C;
  }
  var l = pl(), u = c(l);
  {
    var o = (h) => {
      var b = vl();
      D(h, b);
    }, v = (h) => {
      var b = _l();
      ke(b, 20, () => [1, 0], Re, (_, m) => {
        var F = hl();
        ke(F, 20, () => [3, 2, 1, 0], Re, (w, f) => {
          var g = dl();
          ke(g, 20, () => [0, 1, 2, 3, 4, 5, 6, 7], Re, (C, A) => {
            const N = /* @__PURE__ */ vt(() => a(f, A, m));
            var P = fl();
            let L;
            z(
              (K) => {
                L = Be(P, 1, "bit svelte-wpgtu6", null, L, { active: i(r)[i(N)] }), us(P, `background-color: ${K ?? ""}`), Ee(P, "title", `L=${f ?? ""} H=${A * 45} C=${m ?? ""}`);
              },
              [() => n(i(N))]
            ), D(C, P);
          }), D(w, g);
        }), z(() => Ee(F, "title", m === 1 ? "Vivid Colors" : "Muted Colors")), D(_, F);
      }), D(h, b);
    };
    le(u, (h) => {
      t.sig ? h(v, !1) : h(o);
    });
  }
  z(() => us(l, `--size: ${s() ?? ""}px`)), D(e, l), it();
}
var ml = /* @__PURE__ */ O('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), gl = /* @__PURE__ */ O('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class A Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), bl = /* @__PURE__ */ O('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), wl = /* @__PURE__ */ O('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class B Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), yl = /* @__PURE__ */ O('<div class="stat-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">Storage (Free: 10GB)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976"> </div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class A (Free: 1M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class B (Free: 10M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div>', 1), xl = /* @__PURE__ */ O('<div class="stat-card error-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">R2 Status</div> <div class="stat-value svelte-1w9i976" style="font-size: 0.9rem; color: #d32f2f;"> </div></div>'), kl = /* @__PURE__ */ O('<div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div>', 1), Ml = /* @__PURE__ */ O('<div class="r2-stats svelte-1w9i976"><!></div>');
function Sl(e, t) {
  nt(t, !0);
  let s = /* @__PURE__ */ H(null), r = /* @__PURE__ */ H(null);
  async function n() {
    try {
      M(s, await oe.get("/admin/api/r2/usage"), !0);
    } catch (f) {
      console.error("Failed to fetch R2 usage:", f), M(r, "Failed to load R2 usage data");
    }
  }
  Rt(n);
  function a(f) {
    if (f === 0) return "0 B";
    const g = 1024, C = ["B", "KB", "MB", "GB", "TB"], A = Math.floor(Math.log(f) / Math.log(g));
    return parseFloat((f / Math.pow(g, A)).toFixed(2)) + " " + C[A];
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
  ], u = [
    "HeadObject",
    "GetObject",
    "HeadBucket",
    "GetBucketEncryption",
    "GetBucketLocation",
    "GetBucketPolicy"
  ], o = /* @__PURE__ */ vt(() => i(s) ? (i(s).operations || []).filter((f) => l.includes(f.action_type)).reduce((f, g) => f + g.requests, 0) : 0), v = /* @__PURE__ */ vt(() => i(s) ? (i(s).operations || []).filter((f) => u.includes(f.action_type)).reduce((f, g) => f + g.requests, 0) : 0), h = /* @__PURE__ */ vt(() => i(s) ? (i(s).operations || []).filter((f) => l.includes(f.action_type)).sort((f, g) => g.requests - f.requests) : []), b = /* @__PURE__ */ vt(() => i(s) ? (i(s).operations || []).filter((f) => u.includes(f.action_type)).sort((f, g) => g.requests - f.requests) : []);
  var _ = Ml(), m = c(_);
  {
    var F = (f) => {
      var g = yl(), C = qe(g), A = d(c(C), 2), N = c(A), P = d(A, 2), L = c(P), K = d(P, 2), I = c(K), V = d(C, 2), T = d(c(V), 2), y = c(T), S = d(T, 4), B = c(S), k = d(S, 2);
      {
        var j = (q) => {
          var Z = gl(), ce = d(c(Z), 2);
          ke(ce, 21, () => i(h), Re, (se, J) => {
            var G = ml(), ie = c(G), ue = c(ie), me = d(ie, 2), Me = c(me);
            z(
              (p) => {
                R(ue, i(J).action_type), R(Me, p);
              },
              [() => (i(J).requests ?? 0).toLocaleString()]
            ), D(se, G);
          }), D(q, Z);
        };
        le(k, (q) => {
          i(h).length > 0 && q(j);
        });
      }
      var re = d(V, 2), ae = d(c(re), 2), _e = c(ae), ve = d(ae, 4), fe = c(ve), $ = d(ve, 2);
      {
        var te = (q) => {
          var Z = wl(), ce = d(c(Z), 2);
          ke(ce, 21, () => i(b), Re, (se, J) => {
            var G = bl(), ie = c(G), ue = c(ie), me = d(ie, 2), Me = c(me);
            z(
              (p) => {
                R(ue, i(J).action_type), R(Me, p);
              },
              [() => (i(J).requests ?? 0).toLocaleString()]
            ), D(se, G);
          }), D(q, Z);
        };
        le($, (q) => {
          i(b).length > 0 && q(te);
        });
      }
      z(
        (q, Z, ce, se, J, G, ie) => {
          R(N, q), R(L, `${Z ?? ""} objects`), us(I, `width: ${ce ?? ""}%`), R(y, se), us(B, `width: ${J ?? ""}%`), R(_e, G), us(fe, `width: ${ie ?? ""}%`);
        },
        [
          () => a(i(s).storage_usage_bytes ?? 0),
          () => (i(s).object_count ?? 0).toLocaleString(),
          () => Math.min(100, (i(s).storage_usage_bytes ?? 0) / 10737418240 * 100),
          () => (i(o) ?? 0).toLocaleString(),
          () => Math.min(100, (i(o) ?? 0) / 1e6 * 100),
          () => (i(v) ?? 0).toLocaleString(),
          () => Math.min(100, (i(v) ?? 0) / 1e7 * 100)
        ]
      ), D(f, g);
    }, w = (f) => {
      var g = yt(), C = qe(g);
      {
        var A = (P) => {
          var L = xl(), K = d(c(L), 2), I = c(K);
          z(() => R(I, i(r))), D(P, L);
        }, N = (P) => {
          var L = kl();
          D(P, L);
        };
        le(
          C,
          (P) => {
            i(r) ? P(A) : P(N, !1);
          },
          !0
        );
      }
      D(f, g);
    };
    le(m, (f) => {
      i(s) ? f(F) : f(w, !1);
    });
  }
  D(e, _), it();
}
var Dl = /* @__PURE__ */ O('<div class="loading svelte-xxb0sp">読み込み中...</div>'), El = /* @__PURE__ */ O('<button class="indexed-icon svelte-xxb0sp" title="類似画像を検索">🔍</button>'), Tl = /* @__PURE__ */ O('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/> <!></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), Al = /* @__PURE__ */ O('<div class="overlay svelte-xxb0sp"><div class="loading-spinner svelte-xxb0sp"></div></div>'), Fl = /* @__PURE__ */ O('<div class="grid-container svelte-xxb0sp"><div></div> <!></div>'), Pl = /* @__PURE__ */ O('<div class="selected-compare svelte-xxb0sp"><div class="image-item target svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="svelte-xxb0sp">Selected Image</div></div></div> <div class="arrow svelte-xxb0sp">→</div></div>'), Rl = /* @__PURE__ */ O('<div class="loading svelte-xxb0sp">検索中...</div>'), Il = /* @__PURE__ */ O('<p class="svelte-xxb0sp">類似画像は見つかりませんでした。</p>'), Ol = /* @__PURE__ */ O('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), Cl = /* @__PURE__ */ O("<div></div>"), Nl = /* @__PURE__ */ O('<div class="image-list svelte-xxb0sp"><div class="header svelte-xxb0sp"><div class="title-area svelte-xxb0sp"><h2 class="svelte-xxb0sp"> </h2> <a href="https://dash.cloudflare.com/d52dc19d3368d36eecf4b48d5eb2dd44/r2/default/buckets/lowreal" target="_blank" rel="noopener noreferrer" class="r2-link svelte-xxb0sp">R2 Dashboard ↗</a></div> <div class="pagination svelte-xxb0sp"><button class="svelte-xxb0sp">前へ</button> <span class="svelte-xxb0sp"> </span> <button class="svelte-xxb0sp">次へ</button></div></div> <!> <!></div> <dialog id="similarDialog" class="svelte-xxb0sp"><div class="dialog-header svelte-xxb0sp"><h3 class="svelte-xxb0sp">類似画像一覧</h3> <button type="button" class="close-btn svelte-xxb0sp">×</button></div> <div class="dialog-content svelte-xxb0sp"><!> <!></div></dialog>', 1);
function Ll(e, t) {
  nt(t, !0);
  let s = /* @__PURE__ */ H(we([])), r = /* @__PURE__ */ H(0), n = 20, a = /* @__PURE__ */ H(0), l = /* @__PURE__ */ H(we([])), u = /* @__PURE__ */ H(null), o = /* @__PURE__ */ H(null);
  async function v() {
    try {
      const $ = await oe.get(`/admin/api/images?limit=${n}&offset=${i(r)}`);
      M(s, $.images || [], !0), M(a, $.total || 0, !0);
    } catch ($) {
      console.error($);
    }
  }
  async function h($) {
    M(u, $, !0), M(l, [], !0), i(o).showModal();
    try {
      const te = await oe.get(`/admin/api/image/${$.id}/similar`);
      M(l, te.similar || [], !0);
    } catch (te) {
      console.error(te);
    }
  }
  Rt(v);
  function b() {
    i(r) + n < i(a) && (M(r, i(r) + n), v());
  }
  function _() {
    i(r) - n >= 0 && (M(r, i(r) - n), v());
  }
  var m = Nl(), F = qe(m), w = c(F), f = c(w), g = c(f), C = c(g), A = d(f, 2), N = c(A);
  N.__click = _;
  var P = d(N, 2), L = c(P), K = d(P, 2);
  K.__click = b;
  var I = d(w, 2);
  Sl(I, {});
  var V = d(I, 2);
  {
    var T = ($) => {
      var te = Dl();
      D($, te);
    }, y = ($) => {
      var te = Fl(), q = c(te);
      let Z;
      ke(q, 21, () => i(s), (J) => J.id, (J, G) => {
        var ie = Tl(), ue = c(ie), me = c(ue), Me = d(me, 2);
        {
          var p = (mt) => {
            var gt = El();
            gt.__click = () => h(i(G)), D(mt, gt);
          };
          le(Me, (mt) => {
            i(G).sig?.length > 0 && mt(p);
          });
        }
        var x = d(ue, 2), Y = c(x);
        dr(Y, {
          get sig() {
            return i(G).sig;
          }
        });
        var Q = d(Y, 2), ne = c(Q), Ne = d(c(ne)), Se = c(Ne), ze = d(Q, 2), je = c(ze);
        z(() => {
          Ee(me, "src", i(G).uri), Ee(ne, "href", `/admin/edit?id=${i(G).entry_id ?? ""}`), R(Se, i(G).entry_id), R(je, `ID: ${i(G).id ?? ""}`);
        }), D(J, ie);
      });
      var ce = d(q, 2);
      {
        var se = (J) => {
          var G = Al();
          D(J, G);
        };
        le(ce, (J) => {
          oe.loading && J(se);
        });
      }
      z(() => Z = Be(q, 1, "grid svelte-xxb0sp", null, Z, { "is-loading": oe.loading })), D($, te);
    };
    le(V, ($) => {
      oe.loading && i(s).length === 0 ? $(T) : $(y, !1);
    });
  }
  var S = d(F, 2), B = c(S), k = d(c(B), 2);
  k.__click = () => i(o).close();
  var j = d(B, 2), re = c(j);
  {
    var ae = ($) => {
      var te = Pl(), q = c(te), Z = c(q), ce = c(Z), se = d(Z, 2), J = c(se);
      dr(J, {
        get sig() {
          return i(u).sig;
        }
      }), z(() => Ee(ce, "src", i(u).uri)), D($, te);
    };
    le(re, ($) => {
      i(u) && $(ae);
    });
  }
  var _e = d(re, 2);
  {
    var ve = ($) => {
      var te = Rl();
      D($, te);
    }, fe = ($) => {
      var te = yt(), q = qe(te);
      {
        var Z = (se) => {
          var J = Il();
          D(se, J);
        }, ce = (se) => {
          var J = Cl();
          let G;
          ke(J, 21, () => i(l), (ie) => ie.id, (ie, ue) => {
            var me = Ol(), Me = c(me), p = c(Me), x = d(Me, 2), Y = c(x);
            dr(Y, {
              get sig() {
                return i(ue).sig;
              }
            });
            var Q = d(Y, 2), ne = c(Q);
            ne.__click = () => i(o).close();
            var Ne = d(c(ne)), Se = c(Ne), ze = d(Q, 2), je = c(ze);
            z(() => {
              Ee(p, "src", i(ue).uri), Ee(ne, "href", `/admin/edit?id=${i(ue).entry_id ?? ""}`), R(Se, i(ue).entry_id), R(je, `ID: ${i(ue).id ?? ""} / Score: ${i(ue).score ?? ""}`);
            }), D(ie, me);
          }), z(() => G = Be(J, 1, "grid similar-grid svelte-xxb0sp", null, G, { "is-loading": oe.loading })), D(se, J);
        };
        le(
          q,
          (se) => {
            i(l).length === 0 ? se(Z) : se(ce, !1);
          },
          !0
        );
      }
      D($, te);
    };
    le(_e, ($) => {
      oe.loading && i(l).length === 0 ? $(ve) : $(fe, !1);
    });
  }
  Je(S, ($) => M(o, $), () => i(o)), z(
    ($) => {
      R(C, `画像一覧 (${i(a) ?? ""})`), N.disabled = i(r) === 0, R(L, `${i(r) + 1} - ${$ ?? ""} / ${i(a) ?? ""}`), K.disabled = i(r) + n >= i(a);
    },
    [() => Math.min(i(r) + n, i(a))]
  ), D(e, m), it();
}
gs(["click"]);
var Hl = /* @__PURE__ */ O('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), $l = /* @__PURE__ */ O('<span class="term-badge svelte-6rw159"> </span>'), Yl = /* @__PURE__ */ O('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">TF-IDF 統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総語彙数 (Terms)</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">インデックス済みエントリ</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">関連エントリ計算済み</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">総関連ペア数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">平均類似度スコア</th><td class="svelte-6rw159"> </td></tr></tbody></table></div> <div style="margin-top: 10px;" class="svelte-6rw159"><h4 class="svelte-6rw159">頻出単語 (Top 20 DF)</h4> <div class="top-terms svelte-6rw159"></div></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">画像統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総画像数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">未インデックス画像数</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), jl = /* @__PURE__ */ O('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function ql(e, t) {
  nt(t, !0);
  let s = /* @__PURE__ */ H(null);
  async function r() {
    try {
      M(s, await oe.get("/admin/api/info"), !0);
    } catch (v) {
      console.error(v);
    }
  }
  Rt(r);
  function n(v) {
    if (v === 0) return "0 B";
    const h = 1024, b = ["B", "KB", "MB", "GB", "TB"], _ = Math.floor(Math.log(v) / Math.log(h));
    return parseFloat((v / Math.pow(h, _)).toFixed(2)) + " " + b[_];
  }
  var a = jl(), l = d(c(a), 2);
  {
    var u = (v) => {
      var h = Hl();
      D(v, h);
    }, o = (v) => {
      var h = yt(), b = qe(h);
      {
        var _ = (m) => {
          var F = Yl(), w = c(F), f = d(c(w), 2), g = c(f), C = c(g), A = c(C), N = d(c(A)), P = c(N), L = d(A), K = d(c(L)), I = c(K), V = d(L), T = d(c(V)), y = c(T), S = d(V), B = d(c(S)), k = c(B), j = d(S), re = d(c(j)), ae = c(re), _e = d(f, 2), ve = d(c(_e), 2);
          ke(ve, 21, () => i(s).tfidf_stats?.top_terms ?? [], Re, (Ct, Nt) => {
            var ot = $l(), bt = c(ot);
            z(() => {
              Ee(ot, "title", `DF: ${i(Nt).df ?? ""}`), R(bt, i(Nt).term);
            }), D(Ct, ot);
          });
          var fe = d(w, 2), $ = d(c(fe), 2), te = c($), q = c(te), Z = c(q), ce = d(c(Z)), se = c(ce), J = d(Z), G = d(c(J)), ie = c(G), ue = d(fe, 2), me = d(c(ue), 2), Me = c(me), p = c(Me), x = c(p), Y = d(c(x)), Q = c(Y), ne = d(x), Ne = d(c(ne)), Se = c(Ne), ze = c(Se), je = d(ue, 2), mt = d(c(je), 2), gt = c(mt), Xs = c(gt), It = c(Xs), Ks = d(c(It)), bs = c(Ks), ws = d(It), Vs = d(c(ws)), ys = c(Vs), Kt = d(ws), Vt = d(c(Kt)), xs = c(Vt), Gt = d(Kt), Wt = d(c(Gt)), ks = c(Wt), Zt = d(Gt), Qt = d(c(Zt)), Ms = c(Qt), Ss = d(Zt), es = d(c(Ss)), Ds = c(es), Es = d(Ss), Ts = d(c(Es)), Ot = c(Ts), Gs = d(Es), Ws = d(c(Gs)), Zs = c(Ws), Qs = d(je, 2), er = d(c(Qs), 2), tr = c(er);
          z(
            (Ct, Nt, ot, bt, Lt, sr) => {
              R(P, i(s).tfidf_stats?.total_terms ?? 0), R(I, i(s).tfidf_stats?.indexed_entries ?? 0), R(y, i(s).tfidf_stats?.entries_with_related ?? 0), R(k, i(s).tfidf_stats?.total_related_pairs ?? 0), R(ae, Ct), R(se, i(s).image_stats?.total_images ?? 0), R(ie, i(s).image_stats?.unindexed_images ?? 0), R(Q, i(s).is_development), R(ze, i(s).app_hash), R(bs, i(s).debug_info.go_version), R(ys, i(s).debug_info.num_goroutine), R(xs, Nt), R(ks, i(s).debug_info.uptime), R(Ms, ot), R(Ds, bt), R(Ot, Lt), R(Zs, i(s).debug_info.num_gc), R(tr, sr);
            },
            [
              () => i(s).tfidf_stats?.avg_score?.toFixed(4) ?? "0.0000",
              () => new Date(i(s).debug_info.start_time).toLocaleString(),
              () => n(i(s).debug_info.mem_alloc),
              () => n(i(s).debug_info.mem_total_alloc),
              () => n(i(s).debug_info.mem_sys),
              () => JSON.stringify(i(s).config, null, 2)
            ]
          ), D(m, F);
        };
        le(
          b,
          (m) => {
            i(s) && m(_);
          },
          !0
        );
      }
      D(v, h);
    };
    le(l, (v) => {
      oe.loading && !i(s) ? v(u) : v(o, !1);
    });
  }
  D(e, a), it();
}
var Bl = /* @__PURE__ */ O("<a> </a>"), Ul = /* @__PURE__ */ O('<div class="admin-app svelte-1n46o8q"><header><div class="header-left svelte-1n46o8q"><h1 class="svelte-1n46o8q"><a href="/admin/" class="svelte-1n46o8q"><img src="/images/hanrangen-icon.svg" alt="Hanrangon" class="logo svelte-1n46o8q"/></a></h1> <div class="ci-badge svelte-1n46o8q"><a href="https://github.com/cho45/Hanrangon/actions/workflows/ci.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/ci.yml?branch=main&amp;label=ci&amp;style=flat-square" alt="CI Status" class="svelte-1n46o8q"/></a> <a href="https://github.com/cho45/Hanrangon/actions/workflows/lint.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/lint.yml?branch=main&amp;label=lint&amp;style=flat-square" alt="Lint Status" class="svelte-1n46o8q"/></a></div></div> <nav class="main-nav svelte-1n46o8q"><ul class="svelte-1n46o8q"><li><a href="/" class="svelte-1n46o8q">サイト確認</a></li> <li><a href="/logout" class="svelte-1n46o8q">ログアウト</a></li></ul></nav></header> <nav></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function zl(e, t) {
  nt(t, !0);
  let s = /* @__PURE__ */ H(we(window.location.pathname)), r = /* @__PURE__ */ H(we(new URLSearchParams(window.location.search)));
  Rt(() => {
    const f = () => {
      M(s, window.location.pathname, !0), M(r, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", f), () => window.removeEventListener("popstate", f);
  });
  function n(f, g) {
    g && g.preventDefault(), window.history.pushState({}, "", f), M(s, window.location.pathname, !0), M(r, new URLSearchParams(window.location.search), !0);
  }
  const a = {
    "/admin/edit": {
      component: tl,
      page: "edit",
      getProps: (f) => ({ id: f, onSave: (g) => window.location.href = g })
    },
    "/admin/jobs": { component: ul, page: "jobs", getProps: () => ({}) },
    "/admin/images": { component: Ll, page: "images", getProps: () => ({}) },
    "/admin/info": { component: ql, page: "info", getProps: () => ({}) },
    "/admin/": {
      component: $i,
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
    { label: "情報", path: "/admin/info", page: "info" }
  ], u = /* @__PURE__ */ vt(() => {
    const f = i(r).get("id"), g = a[i(s)] ?? a["/admin/"];
    return {
      ...g,
      props: g.getProps(f),
      isActive: (C) => !(C.page !== g.page || C.exact && f)
    };
  }), o = /* @__PURE__ */ vt(() => window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  var v = Ul(), h = c(v);
  let b;
  var _ = d(h, 2);
  let m;
  ke(_, 21, () => l, Re, (f, g) => {
    var C = Bl();
    C.__click = (P) => n(i(g).path, P);
    let A;
    var N = c(C);
    z(
      (P) => {
        Ee(C, "href", i(g).path), A = Be(C, 1, "svelte-1n46o8q", null, A, P), R(N, i(g).label);
      },
      [() => ({ active: i(u).isActive(i(g)) })]
    ), D(f, C);
  });
  var F = d(_, 2), w = c(F);
  hi(w, () => i(u).component, (f, g) => {
    g(f, Si(() => i(u).props));
  }), z(() => {
    b = Be(h, 1, "svelte-1n46o8q", null, b, { "is-localhost": i(o) }), m = Be(_, 1, "sub-nav svelte-1n46o8q", null, m, { "is-localhost": i(o) });
  }), D(e, v), it();
}
gs(["click"]);
const hr = document.getElementById("admin-root");
hr && (hr.innerHTML = "", oi(zl, { target: hr }));
//# sourceMappingURL=admin-front.js.map
