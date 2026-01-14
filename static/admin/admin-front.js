var br = Array.isArray, rn = Array.prototype.indexOf, Hs = Array.from, an = Object.defineProperty, xt = Object.getOwnPropertyDescriptor, nn = Object.getOwnPropertyDescriptors, ln = Object.prototype, on = Array.prototype, Zr = Object.getPrototypeOf, Nr = Object.isExtensible;
function es(e) {
  return typeof e == "function";
}
const $s = () => {
};
function cn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Qr() {
  var e, t, s = new Promise((r, n) => {
    e = r, t = n;
  });
  return { promise: s, resolve: e, reject: t };
}
function ea(e, t, s = !1) {
  return e === void 0 ? s ? (
    /** @type {() => V} */
    t()
  ) : (
    /** @type {V} */
    t
  ) : e;
}
const pe = 2, wr = 4, yr = 8, vn = 1 << 24, rt = 16, at = 32, Pt = 64, Ys = 128, Be = 512, we = 1024, Oe = 2048, Ve = 4096, Ie = 8192, _t = 16384, xr = 32768, Et = 65536, Lr = 1 << 17, ta = 1 << 18, Xt = 1 << 19, un = 1 << 20, et = 1 << 25, Tt = 32768, hr = 1 << 21, kr = 1 << 22, pt = 1 << 23, kt = /* @__PURE__ */ Symbol("$state"), fn = /* @__PURE__ */ Symbol("legacy props"), dn = /* @__PURE__ */ Symbol(""), qt = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function hn(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function _n() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function pn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function mn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function gn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function bn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function wn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function yn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function xn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function kn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Mn = 1, Sn = 2, sa = 4, Dn = 8, En = 16, Tn = 1, An = 2, be = /* @__PURE__ */ Symbol(), Fn = "http://www.w3.org/1999/xhtml";
function Pn() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Rn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ra(e) {
  return e === this.v;
}
function In(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function aa(e) {
  return !In(e, this.v);
}
let Ce = null;
function Ut(e) {
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
      ya(r);
  }
  return t.i = !0, Ce = t.p, /** @type {T} */
  {};
}
function na() {
  return !0;
}
let wt = [];
function ia() {
  var e = wt;
  wt = [], cn(e);
}
function gt(e) {
  if (wt.length === 0 && !is) {
    var t = wt;
    queueMicrotask(() => {
      t === wt && ia();
    });
  }
  wt.push(e);
}
function On() {
  for (; wt.length > 0; )
    ia();
}
function la(e) {
  var t = te;
  if (t === null)
    return K.f |= pt, e;
  if ((t.f & xr) === 0) {
    if ((t.f & Ys) === 0)
      throw e;
    t.b.error(e);
  } else
    zt(e, t);
}
function zt(e, t) {
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
let W = null, ns = null, Ye = null, He = [], js = null, _r = !1, is = !1;
class Je {
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
    He = [], ns = null, this.apply();
    var s = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const r of t)
      this.#i(r, s);
    this.is_fork || this.#v(), this.is_deferred() ? (this.#l(s.effects), this.#l(s.render_effects)) : (ns = this, W = null, Hr(s.render_effects), Hr(s.effects), ns = null, this.#o?.resolve()), Ye = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {EffectTarget} target
   */
  #i(t, s) {
    t.f ^= we;
    for (var r = t.first; r !== null; ) {
      var n = r.f, a = (n & (at | Pt)) !== 0, l = a && (n & we) !== 0, v = l || (n & Ie) !== 0 || this.skipped_effects.has(r);
      if ((r.f & Ys) !== 0 && r.b?.is_pending() && (s = {
        parent: s,
        effect: r,
        effects: [],
        render_effects: []
      }), !v && r.fn !== null) {
        a ? r.f ^= we : (n & wr) !== 0 ? s.effects.push(r) : _s(r) && ((r.f & rt) !== 0 && this.#n.add(r), fs(r));
        var o = r.first;
        if (o !== null) {
          r = o;
          continue;
        }
      }
      var u = r.parent;
      for (r = r.next; r === null && u !== null; )
        u === s.effect && (this.#l(s.effects), this.#l(s.render_effects), s = /** @type {EffectTarget} */
        s.parent), r = u.next, u = u.parent;
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #l(t) {
    for (const s of t)
      (s.f & Oe) !== 0 ? this.#n.add(s) : (s.f & Ve) !== 0 && this.#a.add(s), this.#c(s.deps), xe(s, we);
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
    this.previous.has(t) || this.previous.set(t, s), (t.f & pt) === 0 && (this.current.set(t, t.v), Ye?.set(t, t.v));
  }
  activate() {
    W = this, this.apply();
  }
  deactivate() {
    W === this && (W = null, Ye = null);
  }
  flush() {
    if (this.activate(), He.length > 0) {
      if (oa(), W !== null && W !== this)
        return;
    } else this.#r === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of this.#t) t(this);
    this.#t.clear();
  }
  #v() {
    if (this.#s === 0) {
      for (const t of this.#e) t();
      this.#e.clear();
    }
    this.#r === 0 && this.#u();
  }
  #u() {
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
        for (const [o, u] of this.current) {
          if (a.current.has(o))
            if (s && u !== a.current.get(o))
              a.current.set(o, u);
            else
              continue;
          l.push(o);
        }
        if (l.length === 0)
          continue;
        const v = [...a.current.keys()].filter((o) => !this.current.has(o));
        if (v.length > 0) {
          var n = He;
          He = [];
          const o = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
          for (const h of l)
            ca(h, v, o, u);
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
      this.#a.delete(t), xe(t, Oe), At(t);
    for (const t of this.#a)
      xe(t, Ve), At(t);
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
    return (this.#o ??= Qr()).promise;
  }
  static ensure() {
    if (W === null) {
      const t = W = new Je();
      Ps.add(W), is || Je.enqueue(() => {
        W === t && t.flush();
      });
    }
    return W;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    gt(t);
  }
  apply() {
  }
}
function Cn(e) {
  var t = is;
  is = !0;
  try {
    for (var s; ; ) {
      if (On(), He.length === 0 && (W?.flush(), He.length === 0))
        return js = null, /** @type {T} */
        s;
      oa();
    }
  } finally {
    is = t;
  }
}
function oa() {
  var e = St;
  _r = !0;
  var t = null;
  try {
    var s = 0;
    for (Ns(!0); He.length > 0; ) {
      var r = Je.ensure();
      if (s++ > 1e3) {
        var n, a;
        Nn();
      }
      r.process(He), mt.clear();
    }
  } finally {
    _r = !1, Ns(e), js = null;
  }
}
function Nn() {
  try {
    bn();
  } catch (e) {
    zt(e, js);
  }
}
let Qe = null;
function Hr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var s = 0; s < t; ) {
      var r = e[s++];
      if ((r.f & (_t | Ie)) === 0 && _s(r) && (Qe = /* @__PURE__ */ new Set(), fs(r), r.deps === null && r.first === null && r.nodes === null && (r.teardown === null && r.ac === null ? Da(r) : r.fn = null), Qe?.size > 0)) {
        mt.clear();
        for (const n of Qe) {
          if ((n.f & (_t | Ie)) !== 0) continue;
          const a = [n];
          let l = n.parent;
          for (; l !== null; )
            Qe.has(l) && (Qe.delete(l), a.push(l)), l = l.parent;
          for (let v = a.length - 1; v >= 0; v--) {
            const o = a[v];
            (o.f & (_t | Ie)) === 0 && fs(o);
          }
        }
        Qe.clear();
      }
    }
    Qe = null;
  }
}
function ca(e, t, s, r) {
  if (!s.has(e) && (s.add(e), e.reactions !== null))
    for (const n of e.reactions) {
      const a = n.f;
      (a & pe) !== 0 ? ca(
        /** @type {Derived} */
        n,
        t,
        s,
        r
      ) : (a & (kr | rt)) !== 0 && (a & Oe) === 0 && va(n, t, r) && (xe(n, Oe), At(
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
    if (_r && t === te && (s & rt) !== 0 && (s & ta) === 0)
      return;
    if ((s & (Pt | at)) !== 0) {
      if ((s & we) === 0) return;
      t.f ^= we;
    }
  }
  He.push(t);
}
function Ln(e) {
  let t = 0, s = Ft(0), r;
  return () => {
    vs() && (i(s), Us(() => (t === 0 && (r = Js(() => e(() => ls(s)))), t += 1, () => {
      gt(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ls(s));
      });
    })));
  };
}
var Hn = Et | Xt | Ys;
function $n(e, t, s) {
  new Yn(e, t, s);
}
class Yn {
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
  #v = null;
  #u = 0;
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
  #b = Ln(() => (this.#d = Ft(this.#u), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, s, r) {
    this.#t = t, this.#s = s, this.#o = r, this.parent = /** @type {Effect} */
    te.b, this.#e = !!this.#s.pending, this.#n = zs(() => {
      te.b = this;
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
        this.#v?.remove();
      };
    }, Hn);
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
    t && (this.#i = $e(() => t(this.#t)), Je.enqueue(() => {
      var s = this.#m();
      this.#a = this.#_(() => (Je.ensure(), $e(() => this.#o(s)))), this.#f > 0 ? this.#p() : (Mt(
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
    return this.#e && (this.#v = tt(), this.#t.before(this.#v), t = this.#v), t;
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
    var s = te, r = K, n = Ce;
    Ke(this.#n), Te(this.#n), Ut(this.#n.ctx);
    try {
      return t();
    } catch (a) {
      return la(a), null;
    } finally {
      Ke(s), Te(r), Ut(n);
    }
  }
  #p() {
    const t = (
      /** @type {(anchor: Node) => void} */
      this.#s.pending
    );
    this.#a !== null && (this.#c = document.createDocumentFragment(), this.#c.append(
      /** @type {TemplateNode} */
      this.#v
    ), Aa(this.#a, this.#c)), this.#i === null && (this.#i = $e(() => t(this.#t)));
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
    this.#g(t), this.#u += t, this.#d && Jt(this.#d, this.#u);
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
        Rn();
        return;
      }
      n = !0, a && kn(), Je.ensure(), this.#u = 0, this.#l !== null && Mt(this.#l, () => {
        this.#l = null;
      }), this.#e = this.has_pending_snippet(), this.#a = this.#_(() => (this.#h = !1, $e(() => this.#o(this.#t)))), this.#f > 0 ? this.#p() : this.#e = !1;
    };
    var v = K;
    try {
      Te(null), a = !0, s?.(t, l), a = !1;
    } catch (o) {
      zt(o, this.#n && this.#n.parent);
    } finally {
      Te(v);
    }
    r && gt(() => {
      this.#l = this.#_(() => {
        Je.ensure(), this.#h = !0;
        try {
          return $e(() => {
            r(
              this.#t,
              () => t,
              () => l
            );
          });
        } catch (o) {
          return zt(
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
function jn(e, t, s, r) {
  const n = Mr;
  if (s.length === 0 && e.length === 0) {
    r(t.map(n));
    return;
  }
  var a = W, l = (
    /** @type {Effect} */
    te
  ), v = qn();
  function o() {
    Promise.all(s.map((u) => /* @__PURE__ */ Bn(u))).then((u) => {
      v();
      try {
        r([...t.map(n), ...u]);
      } catch (h) {
        (l.f & _t) === 0 && zt(h, l);
      }
      a?.deactivate(), Cs();
    }).catch((u) => {
      zt(u, l);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    v();
    try {
      return o();
    } finally {
      a?.deactivate(), Cs();
    }
  }) : o();
}
function qn() {
  var e = te, t = K, s = Ce, r = W;
  return function(a = !0) {
    Ke(e), Te(t), Ut(s), a && r?.activate();
  };
}
function Cs() {
  Ke(null), Te(null), Ut(null);
}
// @__NO_SIDE_EFFECTS__
function Mr(e) {
  var t = pe | Oe, s = K !== null && (K.f & pe) !== 0 ? (
    /** @type {Derived} */
    K
  ) : null;
  return te !== null && (te.f |= Xt), {
    ctx: Ce,
    deps: null,
    effects: null,
    equals: ra,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      be
    ),
    wv: 0,
    parent: s ?? te,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Bn(e, t) {
  let s = (
    /** @type {Effect | null} */
    te
  );
  s === null && _n();
  var r = (
    /** @type {Boundary} */
    s.b
  ), n = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = Ft(
    /** @type {V} */
    be
  ), l = !K, v = /* @__PURE__ */ new Map();
  return Qn(() => {
    var o = Qr();
    n = o.promise;
    try {
      Promise.resolve(e()).then(o.resolve, o.reject).then(() => {
        u === W && u.committed && u.deactivate(), Cs();
      });
    } catch (p) {
      o.reject(p), Cs();
    }
    var u = (
      /** @type {Batch} */
      W
    );
    if (l) {
      var h = !r.is_pending();
      r.update_pending_count(1), u.increment(h), v.get(u)?.reject(qt), v.delete(u), v.set(u, o);
    }
    const g = (p, m = void 0) => {
      if (u.activate(), m)
        m !== qt && (a.f |= pt, Jt(a, m));
      else {
        (a.f & pt) !== 0 && (a.f ^= pt), Jt(a, p);
        for (const [P, w] of v) {
          if (v.delete(P), P === u) break;
          w.reject(qt);
        }
      }
      l && (r.update_pending_count(-1), u.decrement(h));
    };
    o.promise.then(g, (p) => g(null, p || "unknown"));
  }), Bs(() => {
    for (const o of v.values())
      o.reject(qt);
  }), new Promise((o) => {
    function u(h) {
      function g() {
        h === n ? o(a) : u(n);
      }
      h.then(g, g);
    }
    u(n);
  });
}
// @__NO_SIDE_EFFECTS__
function dt(e) {
  const t = /* @__PURE__ */ Mr(e);
  return Fa(t), t;
}
// @__NO_SIDE_EFFECTS__
function Sr(e) {
  const t = /* @__PURE__ */ Mr(e);
  return t.equals = aa, t;
}
function ua(e) {
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
function Un(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & pe) === 0)
      return (t.f & _t) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Dr(e) {
  var t, s = te;
  Ke(Un(e));
  try {
    e.f &= ~Tt, ua(e), t = Oa(e);
  } finally {
    Ke(s);
  }
  return t;
}
function fa(e) {
  var t = Dr(e);
  if (e.equals(t) || (W?.is_fork || (e.v = t), e.wv = Ra()), !Vt)
    if (Ye !== null)
      (vs() || W?.is_fork) && Ye.set(e, t);
    else {
      var s = (e.f & Be) === 0 ? Ve : we;
      xe(e, s);
    }
}
let pr = /* @__PURE__ */ new Set();
const mt = /* @__PURE__ */ new Map();
let da = !1;
function Ft(e, t) {
  var s = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ra,
    rv: 0,
    wv: 0
  };
  return s;
}
// @__NO_SIDE_EFFECTS__
function L(e, t) {
  const s = Ft(e);
  return Fa(s), s;
}
// @__NO_SIDE_EFFECTS__
function zn(e, t = !1, s = !0) {
  const r = Ft(e);
  return t || (r.equals = aa), r;
}
function S(e, t, s = !1) {
  K !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Xe || (K.f & Lr) !== 0) && na() && (K.f & (pe | rt | kr | Lr)) !== 0 && !st?.includes(e) && xn();
  let r = s ? ye(t) : t;
  return Jt(e, r);
}
function Jt(e, t) {
  if (!e.equals(t)) {
    var s = e.v;
    Vt ? mt.set(e, t) : mt.set(e, s), e.v = t;
    var r = Je.ensure();
    r.capture(e, s), (e.f & pe) !== 0 && ((e.f & Oe) !== 0 && Dr(
      /** @type {Derived} */
      e
    ), xe(e, (e.f & Be) !== 0 ? we : Ve)), e.wv = Ra(), ha(e, Oe), te !== null && (te.f & we) !== 0 && (te.f & (at | Pt)) === 0 && (Le === null ? ti([e]) : Le.push(e)), !r.is_fork && pr.size > 0 && !da && Jn();
  }
  return t;
}
function Jn() {
  da = !1;
  var e = St;
  Ns(!0);
  const t = Array.from(pr);
  try {
    for (const s of t)
      (s.f & we) !== 0 && xe(s, Ve), _s(s) && fs(s);
  } finally {
    Ns(e);
  }
  pr.clear();
}
function ls(e) {
  S(e, e.v + 1);
}
function ha(e, t) {
  var s = e.reactions;
  if (s !== null)
    for (var r = s.length, n = 0; n < r; n++) {
      var a = s[n], l = a.f, v = (l & Oe) === 0;
      if (v && xe(a, t), (l & pe) !== 0) {
        var o = (
          /** @type {Derived} */
          a
        );
        Ye?.delete(o), (l & Tt) === 0 && (l & Be && (a.f |= Tt), ha(o, Ve));
      } else v && ((l & rt) !== 0 && Qe !== null && Qe.add(
        /** @type {Effect} */
        a
      ), At(
        /** @type {Effect} */
        a
      ));
    }
}
function ye(e) {
  if (typeof e != "object" || e === null || kt in e)
    return e;
  const t = Zr(e);
  if (t !== ln && t !== on)
    return e;
  var s = /* @__PURE__ */ new Map(), r = br(e), n = /* @__PURE__ */ L(0), a = Dt, l = (v) => {
    if (Dt === a)
      return v();
    var o = K, u = Dt;
    Te(null), Br(a);
    var h = v();
    return Te(o), Br(u), h;
  };
  return r && s.set("length", /* @__PURE__ */ L(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(v, o, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && wn();
        var h = s.get(o);
        return h === void 0 ? h = l(() => {
          var g = /* @__PURE__ */ L(u.value);
          return s.set(o, g), g;
        }) : S(h, u.value, !0), !0;
      },
      deleteProperty(v, o) {
        var u = s.get(o);
        if (u === void 0) {
          if (o in v) {
            const h = l(() => /* @__PURE__ */ L(be));
            s.set(o, h), ls(n);
          }
        } else
          S(u, be), ls(n);
        return !0;
      },
      get(v, o, u) {
        if (o === kt)
          return e;
        var h = s.get(o), g = o in v;
        if (h === void 0 && (!g || xt(v, o)?.writable) && (h = l(() => {
          var m = ye(g ? v[o] : be), P = /* @__PURE__ */ L(m);
          return P;
        }), s.set(o, h)), h !== void 0) {
          var p = i(h);
          return p === be ? void 0 : p;
        }
        return Reflect.get(v, o, u);
      },
      getOwnPropertyDescriptor(v, o) {
        var u = Reflect.getOwnPropertyDescriptor(v, o);
        if (u && "value" in u) {
          var h = s.get(o);
          h && (u.value = i(h));
        } else if (u === void 0) {
          var g = s.get(o), p = g?.v;
          if (g !== void 0 && p !== be)
            return {
              enumerable: !0,
              configurable: !0,
              value: p,
              writable: !0
            };
        }
        return u;
      },
      has(v, o) {
        if (o === kt)
          return !0;
        var u = s.get(o), h = u !== void 0 && u.v !== be || Reflect.has(v, o);
        if (u !== void 0 || te !== null && (!h || xt(v, o)?.writable)) {
          u === void 0 && (u = l(() => {
            var p = h ? ye(v[o]) : be, m = /* @__PURE__ */ L(p);
            return m;
          }), s.set(o, u));
          var g = i(u);
          if (g === be)
            return !1;
        }
        return h;
      },
      set(v, o, u, h) {
        var g = s.get(o), p = o in v;
        if (r && o === "length")
          for (var m = u; m < /** @type {Source<number>} */
          g.v; m += 1) {
            var P = s.get(m + "");
            P !== void 0 ? S(P, be) : m in v && (P = l(() => /* @__PURE__ */ L(be)), s.set(m + "", P));
          }
        if (g === void 0)
          (!p || xt(v, o)?.writable) && (g = l(() => /* @__PURE__ */ L(void 0)), S(g, ye(u)), s.set(o, g));
        else {
          p = g.v !== be;
          var w = l(() => ye(u));
          S(g, w);
        }
        var f = Reflect.getOwnPropertyDescriptor(v, o);
        if (f?.set && f.set.call(h, u), !p) {
          if (r && typeof o == "string") {
            var b = (
              /** @type {Source<number>} */
              s.get("length")
            ), I = Number(o);
            Number.isInteger(I) && I >= b.v && S(b, I + 1);
          }
          ls(n);
        }
        return !0;
      },
      ownKeys(v) {
        i(n);
        var o = Reflect.ownKeys(v).filter((g) => {
          var p = s.get(g);
          return p === void 0 || p.v !== be;
        });
        for (var [u, h] of s)
          h.v !== be && !(u in v) && o.push(u);
        return o;
      },
      setPrototypeOf() {
        yn();
      }
    }
  );
}
function $r(e) {
  try {
    if (e !== null && typeof e == "object" && kt in e)
      return e[kt];
  } catch {
  }
  return e;
}
function _a(e, t) {
  return Object.is($r(e), $r(t));
}
var Yr, pa, ma, ga;
function Xn() {
  if (Yr === void 0) {
    Yr = window, pa = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, s = Text.prototype;
    ma = xt(t, "firstChild").get, ga = xt(t, "nextSibling").get, Nr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Nr(s) && (s.__t = void 0);
  }
}
function tt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function ht(e) {
  return (
    /** @type {TemplateNode | null} */
    ma.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function hs(e) {
  return (
    /** @type {TemplateNode | null} */
    ga.call(e)
  );
}
function c(e, t) {
  return /* @__PURE__ */ ht(e);
}
function je(e, t = !1) {
  {
    var s = /* @__PURE__ */ ht(e);
    return s instanceof Comment && s.data === "" ? /* @__PURE__ */ hs(s) : s;
  }
}
function d(e, t = 1, s = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ hs(r);
  return r;
}
function Vn(e) {
  e.textContent = "";
}
function ba() {
  return !1;
}
let jr = !1;
function Kn() {
  jr || (jr = !0, document.addEventListener(
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
  var t = K, s = te;
  Te(null), Ke(null);
  try {
    return e();
  } finally {
    Te(t), Ke(s);
  }
}
function Er(e, t, s, r = s) {
  e.addEventListener(t, () => qs(s));
  const n = e.__on_r;
  n ? e.__on_r = () => {
    n(), r(!0);
  } : e.__on_r = () => r(!0), Kn();
}
function Gn(e) {
  te === null && (K === null && gn(), mn()), Vt && pn();
}
function Wn(e, t) {
  var s = t.last;
  s === null ? t.last = t.first = e : (s.next = e, e.prev = s, t.last = e);
}
function lt(e, t, s) {
  var r = te;
  r !== null && (r.f & Ie) !== 0 && (e |= Ie);
  var n = {
    ctx: Ce,
    deps: null,
    nodes: null,
    f: e | Oe | Be,
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
      fs(n), n.f |= xr;
    } catch (v) {
      throw Ae(n), v;
    }
  else t !== null && At(n);
  var a = n;
  if (s && a.deps === null && a.teardown === null && a.nodes === null && a.first === a.last && // either `null`, or a singular child
  (a.f & Xt) === 0 && (a = a.first, (e & rt) !== 0 && (e & Et) !== 0 && a !== null && (a.f |= Et)), a !== null && (a.parent = r, r !== null && Wn(a, r), K !== null && (K.f & pe) !== 0 && (e & Pt) === 0)) {
    var l = (
      /** @type {Derived} */
      K
    );
    (l.effects ??= []).push(a);
  }
  return n;
}
function vs() {
  return K !== null && !Xe;
}
function Bs(e) {
  const t = lt(yr, null, !1);
  return xe(t, we), t.teardown = e, t;
}
function wa(e) {
  Gn();
  var t = (
    /** @type {Effect} */
    te.f
  ), s = !K && (t & at) !== 0 && (t & xr) === 0;
  if (s) {
    var r = (
      /** @type {ComponentContext} */
      Ce
    );
    (r.e ??= []).push(e);
  } else
    return ya(e);
}
function ya(e) {
  return lt(wr | un, e, !1);
}
function Zn(e) {
  Je.ensure();
  const t = lt(Pt | Xt, e, !0);
  return (s = {}) => new Promise((r) => {
    s.outro ? Mt(t, () => {
      Ae(t), r(void 0);
    }) : (Ae(t), r(void 0));
  });
}
function xa(e) {
  return lt(wr, e, !1);
}
function Qn(e) {
  return lt(kr | Xt, e, !0);
}
function Us(e, t = 0) {
  return lt(yr | t, e, !0);
}
function z(e, t = [], s = [], r = []) {
  jn(r, t, s, (n) => {
    lt(yr, () => e(...n.map(i)), !0);
  });
}
function zs(e, t = 0) {
  var s = lt(rt | t, e, !0);
  return s;
}
function $e(e) {
  return lt(at | Xt, e, !0);
}
function ka(e) {
  var t = e.teardown;
  if (t !== null) {
    const s = Vt, r = K;
    qr(!0), Te(null);
    try {
      t.call(null);
    } finally {
      qr(s), Te(r);
    }
  }
}
function Ma(e, t = !1) {
  var s = e.first;
  for (e.first = e.last = null; s !== null; ) {
    const n = s.ac;
    n !== null && qs(() => {
      n.abort(qt);
    });
    var r = s.next;
    (s.f & Pt) !== 0 ? s.parent = null : Ae(s, t), s = r;
  }
}
function ei(e) {
  for (var t = e.first; t !== null; ) {
    var s = t.next;
    (t.f & at) === 0 && Ae(t), t = s;
  }
}
function Ae(e, t = !0) {
  var s = !1;
  (t || (e.f & ta) !== 0) && e.nodes !== null && e.nodes.end !== null && (Sa(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), s = !0), Ma(e, t && !s), Ls(e, 0), xe(e, _t);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const a of r)
      a.stop();
  ka(e);
  var n = e.parent;
  n !== null && n.first !== null && Da(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Sa(e, t) {
  for (; e !== null; ) {
    var s = e === t ? null : /* @__PURE__ */ hs(e);
    e.remove(), e = s;
  }
}
function Da(e) {
  var t = e.parent, s = e.prev, r = e.next;
  s !== null && (s.next = r), r !== null && (r.prev = s), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = s));
}
function Mt(e, t, s = !0) {
  var r = [];
  Ea(e, r, !0);
  var n = () => {
    s && Ae(e), t && t();
  }, a = r.length;
  if (a > 0) {
    var l = () => --a || n();
    for (var v of r)
      v.out(l);
  } else
    n();
}
function Ea(e, t, s) {
  if ((e.f & Ie) === 0) {
    e.f ^= Ie;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const v of r)
        (v.is_global || s) && t.push(v);
    for (var n = e.first; n !== null; ) {
      var a = n.next, l = (n.f & Et) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (n.f & at) !== 0 && (e.f & rt) !== 0;
      Ea(n, t, l ? s : !1), n = a;
    }
  }
}
function Tr(e) {
  Ta(e, !0);
}
function Ta(e, t) {
  if ((e.f & Ie) !== 0) {
    e.f ^= Ie, (e.f & we) === 0 && (xe(e, Oe), At(e));
    for (var s = e.first; s !== null; ) {
      var r = s.next, n = (s.f & Et) !== 0 || (s.f & at) !== 0;
      Ta(s, n ? t : !1), s = r;
    }
    var a = e.nodes && e.nodes.t;
    if (a !== null)
      for (const l of a)
        (l.is_global || t) && l.in();
  }
}
function Aa(e, t) {
  if (e.nodes)
    for (var s = e.nodes.start, r = e.nodes.end; s !== null; ) {
      var n = s === r ? null : /* @__PURE__ */ hs(s);
      t.append(s), s = n;
    }
}
let St = !1;
function Ns(e) {
  St = e;
}
let Vt = !1;
function qr(e) {
  Vt = e;
}
let K = null, Xe = !1;
function Te(e) {
  K = e;
}
let te = null;
function Ke(e) {
  te = e;
}
let st = null;
function Fa(e) {
  K !== null && (st === null ? st = [e] : st.push(e));
}
let ke = null, Pe = 0, Le = null;
function ti(e) {
  Le = e;
}
let Pa = 1, us = 0, Dt = us;
function Br(e) {
  Dt = e;
}
function Ra() {
  return ++Pa;
}
function _s(e) {
  var t = e.f;
  if ((t & Oe) !== 0)
    return !0;
  if (t & pe && (e.f &= ~Tt), (t & Ve) !== 0) {
    var s = e.deps;
    if (s !== null)
      for (var r = s.length, n = 0; n < r; n++) {
        var a = s[n];
        if (_s(
          /** @type {Derived} */
          a
        ) && fa(
          /** @type {Derived} */
          a
        ), a.wv > e.wv)
          return !0;
      }
    (t & Be) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ye === null && xe(e, we);
  }
  return !1;
}
function Ia(e, t, s = !0) {
  var r = e.reactions;
  if (r !== null && !st?.includes(e))
    for (var n = 0; n < r.length; n++) {
      var a = r[n];
      (a.f & pe) !== 0 ? Ia(
        /** @type {Derived} */
        a,
        t,
        !1
      ) : t === a && (s ? xe(a, Oe) : (a.f & we) !== 0 && xe(a, Ve), At(
        /** @type {Effect} */
        a
      ));
    }
}
function Oa(e) {
  var t = ke, s = Pe, r = Le, n = K, a = st, l = Ce, v = Xe, o = Dt, u = e.f;
  ke = /** @type {null | Value[]} */
  null, Pe = 0, Le = null, K = (u & (at | Pt)) === 0 ? e : null, st = null, Ut(e.ctx), Xe = !1, Dt = ++us, e.ac !== null && (qs(() => {
    e.ac.abort(qt);
  }), e.ac = null);
  try {
    e.f |= hr;
    var h = (
      /** @type {Function} */
      e.fn
    ), g = h(), p = e.deps;
    if (ke !== null) {
      var m;
      if (Ls(e, Pe), p !== null && Pe > 0)
        for (p.length = Pe + ke.length, m = 0; m < ke.length; m++)
          p[Pe + m] = ke[m];
      else
        e.deps = p = ke;
      if (vs() && (e.f & Be) !== 0)
        for (m = Pe; m < p.length; m++)
          (p[m].reactions ??= []).push(e);
    } else p !== null && Pe < p.length && (Ls(e, Pe), p.length = Pe);
    if (na() && Le !== null && !Xe && p !== null && (e.f & (pe | Ve | Oe)) === 0)
      for (m = 0; m < /** @type {Source[]} */
      Le.length; m++)
        Ia(
          Le[m],
          /** @type {Effect} */
          e
        );
    return n !== null && n !== e && (us++, Le !== null && (r === null ? r = Le : r.push(.../** @type {Source[]} */
    Le))), (e.f & pt) !== 0 && (e.f ^= pt), g;
  } catch (P) {
    return la(P);
  } finally {
    e.f ^= hr, ke = t, Pe = s, Le = r, K = n, st = a, Ut(l), Xe = v, Dt = o;
  }
}
function si(e, t) {
  let s = t.reactions;
  if (s !== null) {
    var r = rn.call(s, e);
    if (r !== -1) {
      var n = s.length - 1;
      n === 0 ? s = t.reactions = null : (s[r] = s[n], s.pop());
    }
  }
  s === null && (t.f & pe) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ke === null || !ke.includes(t)) && (xe(t, Ve), (t.f & Be) !== 0 && (t.f ^= Be, t.f &= ~Tt), ua(
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
      si(e, s[r]);
}
function fs(e) {
  var t = e.f;
  if ((t & _t) === 0) {
    xe(e, we);
    var s = te, r = St;
    te = e, St = !0;
    try {
      (t & (rt | vn)) !== 0 ? ei(e) : Ma(e), ka(e);
      var n = Oa(e);
      e.teardown = typeof n == "function" ? n : null, e.wv = Pa;
      var a;
    } finally {
      St = r, te = s;
    }
  }
}
async function Ca() {
  await Promise.resolve(), Cn();
}
function i(e) {
  var t = e.f, s = (t & pe) !== 0;
  if (K !== null && !Xe) {
    var r = te !== null && (te.f & _t) !== 0;
    if (!r && !st?.includes(e)) {
      var n = K.deps;
      if ((K.f & hr) !== 0)
        e.rv < us && (e.rv = us, ke === null && n !== null && n[Pe] === e ? Pe++ : ke === null ? ke = [e] : ke.includes(e) || ke.push(e));
      else {
        (K.deps ??= []).push(e);
        var a = e.reactions;
        a === null ? e.reactions = [K] : a.includes(K) || a.push(K);
      }
    }
  }
  if (Vt) {
    if (mt.has(e))
      return mt.get(e);
    if (s) {
      var l = (
        /** @type {Derived} */
        e
      ), v = l.v;
      return ((l.f & we) === 0 && l.reactions !== null || La(l)) && (v = Dr(l)), mt.set(l, v), v;
    }
  } else s && (!Ye?.has(e) || W?.is_fork && !vs()) && (l = /** @type {Derived} */
  e, _s(l) && fa(l), St && vs() && (l.f & Be) === 0 && Na(l));
  if (Ye?.has(e))
    return Ye.get(e);
  if ((e.f & pt) !== 0)
    throw e.v;
  return e.v;
}
function Na(e) {
  if (e.deps !== null) {
    e.f ^= Be;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & pe) !== 0 && (t.f & Be) === 0 && Na(
        /** @type {Derived} */
        t
      );
  }
}
function La(e) {
  if (e.v === be) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (mt.has(t) || (t.f & pe) !== 0 && La(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Js(e) {
  var t = Xe;
  try {
    return Xe = !0, e();
  } finally {
    Xe = t;
  }
}
const ri = -7169;
function xe(e, t) {
  e.f = e.f & ri | t;
}
const ai = ["touchstart", "touchmove"];
function ni(e) {
  return ai.includes(e);
}
const Ha = /* @__PURE__ */ new Set(), mr = /* @__PURE__ */ new Set();
function ii(e, t, s, r = {}) {
  function n(a) {
    if (r.capture || ss.call(t, a), !a.cancelBubble)
      return qs(() => s?.call(this, a));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? gt(() => {
    t.addEventListener(e, n, r);
  }) : t.addEventListener(e, n, r), n;
}
function Ur(e, t, s, r, n) {
  var a = { capture: r, passive: n }, l = ii(e, t, s, a);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Bs(() => {
    t.removeEventListener(e, l, a);
  });
}
function ps(e) {
  for (var t = 0; t < e.length; t++)
    Ha.add(e[t]);
  for (var s of mr)
    s(e);
}
let zr = null;
function ss(e) {
  var t = this, s = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, n = e.composedPath?.() || [], a = (
    /** @type {null | Element} */
    n[0] || e.target
  );
  zr = e;
  var l = 0, v = zr === e && e.__root;
  if (v) {
    var o = n.indexOf(v);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var u = n.indexOf(t);
    if (u === -1)
      return;
    o <= u && (l = o);
  }
  if (a = /** @type {Element} */
  n[l] || e.target, a !== t) {
    an(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || s;
      }
    });
    var h = K, g = te;
    Te(null), Ke(null);
    try {
      for (var p, m = []; a !== null; ) {
        var P = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var w = a["__" + r];
          w != null && (!/** @type {any} */
          a.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === a) && w.call(a, e);
        } catch (f) {
          p ? m.push(f) : p = f;
        }
        if (e.cancelBubble || P === t || P === null)
          break;
        a = P;
      }
      if (p) {
        for (let f of m)
          queueMicrotask(() => {
            throw f;
          });
        throw p;
      }
    } finally {
      e.__root = t, delete e.currentTarget, Te(h), Ke(g);
    }
  }
}
function $a(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function ds(e, t) {
  var s = (
    /** @type {Effect} */
    te
  );
  s.nodes === null && (s.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function C(e, t) {
  var s = (t & Tn) !== 0, r = (t & An) !== 0, n, a = !e.startsWith("<!>");
  return () => {
    n === void 0 && (n = $a(a ? e : "<!>" + e), s || (n = /** @type {TemplateNode} */
    /* @__PURE__ */ ht(n)));
    var l = (
      /** @type {TemplateNode} */
      r || pa ? document.importNode(n, !0) : n.cloneNode(!0)
    );
    if (s) {
      var v = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ht(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      ds(v, o);
    } else
      ds(l, l);
    return l;
  };
}
function ts(e = "") {
  {
    var t = tt(e + "");
    return ds(t, t), t;
  }
}
function yt() {
  var e = document.createDocumentFragment(), t = document.createComment(""), s = tt();
  return e.append(t, s), ds(t, s), e;
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
function li(e, t) {
  return oi(e, t);
}
const Yt = /* @__PURE__ */ new Map();
function oi(e, { target: t, anchor: s, props: r = {}, events: n, context: a, intro: l = !0 }) {
  Xn();
  var v = /* @__PURE__ */ new Set(), o = (g) => {
    for (var p = 0; p < g.length; p++) {
      var m = g[p];
      if (!v.has(m)) {
        v.add(m);
        var P = ni(m);
        t.addEventListener(m, ss, { passive: P });
        var w = Yt.get(m);
        w === void 0 ? (document.addEventListener(m, ss, { passive: P }), Yt.set(m, 1)) : Yt.set(m, w + 1);
      }
    }
  };
  o(Hs(Ha)), mr.add(o);
  var u = void 0, h = Zn(() => {
    var g = s ?? t.appendChild(tt());
    return $n(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (p) => {
        if (a) {
          nt({});
          var m = (
            /** @type {ComponentContext} */
            Ce
          );
          m.c = a;
        }
        n && (r.$$events = n), u = e(p, r) || {}, a && it();
      }
    ), () => {
      for (var p of v) {
        t.removeEventListener(p, ss);
        var m = (
          /** @type {number} */
          Yt.get(p)
        );
        --m === 0 ? (document.removeEventListener(p, ss), Yt.delete(p)) : Yt.set(p, m);
      }
      mr.delete(o), g !== s && g.parentNode?.removeChild(g);
    };
  });
  return ci.set(u, h), u;
}
let ci = /* @__PURE__ */ new WeakMap();
class Ya {
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
        Tr(r), this.#s.delete(s);
      else {
        var n = this.#r.get(s);
        n && (this.#t.set(s, n.effect), this.#r.delete(s), n.fragment.lastChild.remove(), this.anchor.before(n.fragment), r = n.effect);
      }
      for (const [a, l] of this.#e) {
        if (this.#e.delete(a), a === t)
          break;
        const v = this.#r.get(l);
        v && (Ae(v.effect), this.#r.delete(l));
      }
      for (const [a, l] of this.#t) {
        if (a === s || this.#s.has(a)) continue;
        const v = () => {
          if (Array.from(this.#e.values()).includes(a)) {
            var u = document.createDocumentFragment();
            Aa(l, u), u.append(tt()), this.#r.set(a, { effect: l, fragment: u });
          } else
            Ae(l);
          this.#s.delete(a), this.#t.delete(a);
        };
        this.#o || !r ? (this.#s.add(a), Mt(l, v, !1)) : v();
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
    ), n = ba();
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
      for (const [v, o] of this.#t)
        v === t ? r.skipped_effects.delete(o) : r.skipped_effects.add(o);
      for (const [v, o] of this.#r)
        v === t ? r.skipped_effects.delete(o.effect) : r.skipped_effects.add(o.effect);
      r.oncommit(this.#n), r.ondiscard(this.#a);
    } else
      this.#n();
  }
}
function ne(e, t, s = !1) {
  var r = new Ya(e), n = s ? Et : 0;
  function a(l, v) {
    r.ensure(l, v);
  }
  zs(() => {
    var l = !1;
    t((v, o = !0) => {
      l = !0, a(o, v);
    }), l || a(!1, null);
  }, n);
}
function Re(e, t) {
  return t;
}
function vi(e, t, s) {
  for (var r = [], n = t.length, a, l = t.length, v = 0; v < n; v++) {
    let g = t[v];
    Mt(
      g,
      () => {
        if (a) {
          if (a.pending.delete(g), a.done.add(g), a.pending.size === 0) {
            var p = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            gr(Hs(a.done)), p.delete(a), p.size === 0 && (e.outrogroups = null);
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
      var u = (
        /** @type {Element} */
        s
      ), h = (
        /** @type {Element} */
        u.parentNode
      );
      Vn(h), h.append(u), e.items.clear();
    }
    gr(t, !o);
  } else
    a = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function gr(e, t = !0) {
  for (var s = 0; s < e.length; s++)
    Ae(e[s], t);
}
var Jr;
function Me(e, t, s, r, n, a = null) {
  var l = e, v = /* @__PURE__ */ new Map(), o = (t & sa) !== 0;
  if (o) {
    var u = (
      /** @type {Element} */
      e
    );
    l = u.appendChild(tt());
  }
  var h = null, g = /* @__PURE__ */ Sr(() => {
    var b = s();
    return br(b) ? b : b == null ? [] : Hs(b);
  }), p, m = !0;
  function P() {
    f.fallback = h, ui(f, p, l, t, r), h !== null && (p.length === 0 ? (h.f & et) === 0 ? Tr(h) : (h.f ^= et, rs(h, null, l)) : Mt(h, () => {
      h = null;
    }));
  }
  var w = zs(() => {
    p = /** @type {V[]} */
    i(g);
    for (var b = p.length, I = /* @__PURE__ */ new Set(), F = (
      /** @type {Batch} */
      W
    ), N = ba(), E = 0; E < b; E += 1) {
      var j = p[E], J = r(j, E), O = m ? null : v.get(J);
      O ? (O.v && Jt(O.v, j), O.i && Jt(O.i, E), N && F.skipped_effects.delete(O.e)) : (O = fi(
        v,
        m ? l : Jr ??= tt(),
        j,
        J,
        E,
        n,
        t,
        s
      ), m || (O.e.f |= et), v.set(J, O)), I.add(J);
    }
    if (b === 0 && a && !h && (m ? h = $e(() => a(l)) : (h = $e(() => a(Jr ??= tt())), h.f |= et)), !m)
      if (N) {
        for (const [G, T] of v)
          I.has(G) || F.skipped_effects.add(T.e);
        F.oncommit(P), F.ondiscard(() => {
        });
      } else
        P();
    i(g);
  }), f = { effect: w, items: v, outrogroups: null, fallback: h };
  m = !1;
}
function ui(e, t, s, r, n) {
  var a = (r & Dn) !== 0, l = t.length, v = e.items, o = e.effect.first, u, h = null, g, p = [], m = [], P, w, f, b;
  if (a)
    for (b = 0; b < l; b += 1)
      P = t[b], w = n(P, b), f = /** @type {EachItem} */
      v.get(w).e, (f.f & et) === 0 && (f.nodes?.a?.measure(), (g ??= /* @__PURE__ */ new Set()).add(f));
  for (b = 0; b < l; b += 1) {
    if (P = t[b], w = n(P, b), f = /** @type {EachItem} */
    v.get(w).e, e.outrogroups !== null)
      for (const T of e.outrogroups)
        T.pending.delete(f), T.done.delete(f);
    if ((f.f & et) !== 0)
      if (f.f ^= et, f === o)
        rs(f, null, s);
      else {
        var I = h ? h.next : o;
        f === e.effect.last && (e.effect.last = f.prev), f.prev && (f.prev.next = f.next), f.next && (f.next.prev = f.prev), ft(e, h, f), ft(e, f, I), rs(f, I, s), h = f, p = [], m = [], o = h.next;
        continue;
      }
    if ((f.f & Ie) !== 0 && (Tr(f), a && (f.nodes?.a?.unfix(), (g ??= /* @__PURE__ */ new Set()).delete(f))), f !== o) {
      if (u !== void 0 && u.has(f)) {
        if (p.length < m.length) {
          var F = m[0], N;
          h = F.prev;
          var E = p[0], j = p[p.length - 1];
          for (N = 0; N < p.length; N += 1)
            rs(p[N], F, s);
          for (N = 0; N < m.length; N += 1)
            u.delete(m[N]);
          ft(e, E.prev, j.next), ft(e, h, E), ft(e, j, F), o = F, h = j, b -= 1, p = [], m = [];
        } else
          u.delete(f), rs(f, o, s), ft(e, f.prev, f.next), ft(e, f, h === null ? e.effect.first : h.next), ft(e, h, f), h = f;
        continue;
      }
      for (p = [], m = []; o !== null && o !== f; )
        (u ??= /* @__PURE__ */ new Set()).add(o), m.push(o), o = o.next;
      if (o === null)
        continue;
    }
    (f.f & et) === 0 && p.push(f), h = f, o = f.next;
  }
  if (e.outrogroups !== null) {
    for (const T of e.outrogroups)
      T.pending.size === 0 && (gr(Hs(T.done)), e.outrogroups?.delete(T));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || u !== void 0) {
    var J = [];
    if (u !== void 0)
      for (f of u)
        (f.f & Ie) === 0 && J.push(f);
    for (; o !== null; )
      (o.f & Ie) === 0 && o !== e.fallback && J.push(o), o = o.next;
    var O = J.length;
    if (O > 0) {
      var G = (r & sa) !== 0 && l === 0 ? s : null;
      if (a) {
        for (b = 0; b < O; b += 1)
          J[b].nodes?.a?.measure();
        for (b = 0; b < O; b += 1)
          J[b].nodes?.a?.fix();
      }
      vi(e, J, G);
    }
  }
  a && gt(() => {
    if (g !== void 0)
      for (f of g)
        f.nodes?.a?.apply();
  });
}
function fi(e, t, s, r, n, a, l, v) {
  var o = (l & Mn) !== 0 ? (l & En) === 0 ? /* @__PURE__ */ zn(s, !1, !1) : Ft(s) : null, u = (l & Sn) !== 0 ? Ft(n) : null;
  return {
    v: o,
    i: u,
    e: $e(() => (a(t, o ?? s, u ?? n, v), () => {
      e.delete(r);
    }))
  };
}
function rs(e, t, s) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end, a = t && (t.f & et) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : s; r !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ hs(r)
      );
      if (a.before(r), r === n)
        return;
      r = l;
    }
}
function ft(e, t, s) {
  t === null ? e.effect.first = s : t.next = s, s === null ? e.effect.last = t : s.prev = t;
}
function Xr(e, t, s = !1, r = !1, n = !1) {
  var a = e, l = "";
  z(() => {
    var v = (
      /** @type {Effect} */
      te
    );
    if (l !== (l = t() ?? "") && (v.nodes !== null && (Sa(
      v.nodes.start,
      /** @type {TemplateNode} */
      v.nodes.end
    ), v.nodes = null), l !== "")) {
      var o = l + "";
      s ? o = `<svg>${o}</svg>` : r && (o = `<math>${o}</math>`);
      var u = $a(o);
      if ((s || r) && (u = /** @type {Element} */
      /* @__PURE__ */ ht(u)), ds(
        /** @type {TemplateNode} */
        /* @__PURE__ */ ht(u),
        /** @type {TemplateNode} */
        u.lastChild
      ), s || r)
        for (; /* @__PURE__ */ ht(u); )
          a.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ ht(u)
          );
      else
        a.before(u);
    }
  });
}
function di(e, t, s) {
  var r = new Ya(e);
  zs(() => {
    var n = t() ?? null;
    r.ensure(n, n && ((a) => s(a, n)));
  }, Et);
}
const Vr = [...` 	
\r\f \v\uFEFF`];
function hi(e, t, s) {
  var r = e == null ? "" : "" + e;
  if (t && (r = r ? r + " " + t : t), s) {
    for (var n in s)
      if (s[n])
        r = r ? r + " " + n : n;
      else if (r.length)
        for (var a = n.length, l = 0; (l = r.indexOf(n, l)) >= 0; ) {
          var v = l + a;
          (l === 0 || Vr.includes(r[l - 1])) && (v === r.length || Vr.includes(r[v])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(v + 1) : l = v;
        }
  }
  return r === "" ? null : r;
}
function _i(e, t) {
  return e == null ? null : String(e);
}
function qe(e, t, s, r, n, a) {
  var l = e.__className;
  if (l !== s || l === void 0) {
    var v = hi(s, r, a);
    v == null ? e.removeAttribute("class") : e.className = v, e.__className = s;
  } else if (a && n !== a)
    for (var o in a) {
      var u = !!a[o];
      (n == null || u !== !!n[o]) && e.classList.toggle(o, u);
    }
  return a;
}
function os(e, t, s, r) {
  var n = e.__style;
  if (n !== t) {
    var a = _i(t);
    a == null ? e.removeAttribute("style") : e.style.cssText = a, e.__style = t;
  }
  return r;
}
function ja(e, t, s = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!br(t))
      return Pn();
    for (var r of e.options)
      r.selected = t.includes(cs(r));
    return;
  }
  for (r of e.options) {
    var n = cs(r);
    if (_a(n, t)) {
      r.selected = !0;
      return;
    }
  }
  (!s || t !== void 0) && (e.selectedIndex = -1);
}
function pi(e) {
  var t = new MutationObserver(() => {
    ja(e, e.__value);
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
function mi(e, t, s = t) {
  var r = /* @__PURE__ */ new WeakSet(), n = !0;
  Er(e, "change", (a) => {
    var l = a ? "[selected]" : ":checked", v;
    if (e.multiple)
      v = [].map.call(e.querySelectorAll(l), cs);
    else {
      var o = e.querySelector(l) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      v = o && cs(o);
    }
    s(v), W !== null && r.add(W);
  }), xa(() => {
    var a = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        ns ?? W
      );
      if (r.has(l))
        return;
    }
    if (ja(e, a, n), n && a === void 0) {
      var v = e.querySelector(":checked");
      v !== null && (a = cs(v), s(a));
    }
    e.__value = a, n = !1;
  }), pi(e);
}
function cs(e) {
  return "__value" in e ? e.__value : e.value;
}
const gi = /* @__PURE__ */ Symbol("is custom element"), bi = /* @__PURE__ */ Symbol("is html");
function Ee(e, t, s, r) {
  var n = wi(e);
  n[t] !== (n[t] = s) && (t === "loading" && (e[dn] = s), s == null ? e.removeAttribute(t) : typeof s != "string" && yi(e).includes(t) ? e[t] = s : e.setAttribute(t, s));
}
function wi(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [gi]: e.nodeName.includes("-"),
      [bi]: e.namespaceURI === Fn
    }
  );
}
var Kr = /* @__PURE__ */ new Map();
function yi(e) {
  var t = e.getAttribute("is") || e.nodeName, s = Kr.get(t);
  if (s) return s;
  Kr.set(t, s = []);
  for (var r, n = e, a = Element.prototype; a !== n; ) {
    r = nn(n);
    for (var l in r)
      r[l].set && s.push(l);
    n = Zr(n);
  }
  return s;
}
function as(e, t, s = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Er(e, "input", async (n) => {
    var a = n ? e.defaultValue : e.value;
    if (a = lr(e) ? or(a) : a, s(a), W !== null && r.add(W), await Ca(), a !== (a = t())) {
      var l = e.selectionStart, v = e.selectionEnd, o = e.value.length;
      if (e.value = a ?? "", v !== null) {
        var u = e.value.length;
        l === v && v === o && u > o ? (e.selectionStart = u, e.selectionEnd = u) : (e.selectionStart = l, e.selectionEnd = Math.min(v, u));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Js(t) == null && e.value && (s(lr(e) ? or(e.value) : e.value), W !== null && r.add(W)), Us(() => {
    var n = t();
    if (e === document.activeElement) {
      var a = (
        /** @type {Batch} */
        ns ?? W
      );
      if (r.has(a))
        return;
    }
    lr(e) && n === or(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
  });
}
const ir = /* @__PURE__ */ new Set();
function Rs(e, t, s, r, n = r) {
  var a = s.getAttribute("type") === "checkbox", l = e;
  if (t !== null)
    for (var v of t)
      l = l[v] ??= [];
  l.push(s), Er(
    s,
    "change",
    () => {
      var o = s.__value;
      a && (o = xi(l, o, s.checked)), n(o);
    },
    // TODO better default value handling
    () => n(a ? [] : null)
  ), Us(() => {
    var o = r();
    a ? (o = o || [], s.checked = o.includes(s.__value)) : s.checked = _a(s.__value, o);
  }), Bs(() => {
    var o = l.indexOf(s);
    o !== -1 && l.splice(o, 1);
  }), ir.has(l) || (ir.add(l), gt(() => {
    l.sort((o, u) => o.compareDocumentPosition(u) === 4 ? -1 : 1), ir.delete(l);
  })), gt(() => {
  });
}
function xi(e, t, s) {
  for (var r = /* @__PURE__ */ new Set(), n = 0; n < e.length; n += 1)
    e[n].checked && r.add(e[n].__value);
  return s || r.delete(t), Array.from(r);
}
function lr(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function or(e) {
  return e === "" ? null : +e;
}
function Gr(e, t) {
  return e === t || e?.[kt] === t;
}
function ze(e = {}, t, s, r) {
  return xa(() => {
    var n, a;
    return Us(() => {
      n = a, a = r?.() || [], Js(() => {
        e !== s(...a) && (t(e, ...a), n && Gr(s(...n), e) && t(null, ...n));
      });
    }), () => {
      gt(() => {
        a && Gr(s(...a), e) && t(null, ...a);
      });
    };
  }), e;
}
const ki = {
  get(e, t) {
    let s = e.props.length;
    for (; s--; ) {
      let r = e.props[s];
      if (es(r) && (r = r()), typeof r == "object" && r !== null && t in r) return r[t];
    }
  },
  set(e, t, s) {
    let r = e.props.length;
    for (; r--; ) {
      let n = e.props[r];
      es(n) && (n = n());
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
      if (es(r) && (r = r()), typeof r == "object" && r !== null && t in r) {
        const n = xt(r, t);
        return n && !n.configurable && (n.configurable = !0), n;
      }
    }
  },
  has(e, t) {
    if (t === kt || t === fn) return !1;
    for (let s of e.props)
      if (es(s) && (s = s()), s != null && t in s) return !0;
    return !1;
  },
  ownKeys(e) {
    const t = [];
    for (let s of e.props)
      if (es(s) && (s = s()), !!s) {
        for (const r in s)
          t.includes(r) || t.push(r);
        for (const r of Object.getOwnPropertySymbols(s))
          t.includes(r) || t.push(r);
      }
    return t;
  }
};
function Mi(...e) {
  return new Proxy({ props: e }, ki);
}
function qa(e, t, s, r) {
  var n = (
    /** @type {V} */
    r
  ), a = !0, l = () => (a && (a = !1, n = /** @type {V} */
  r), n), v;
  v = /** @type {V} */
  e[t], v === void 0 && r !== void 0 && (v = l());
  var o;
  return o = () => {
    var u = (
      /** @type {V} */
      e[t]
    );
    return u === void 0 ? l() : (a = !0, u);
  }, o;
}
function Rt(e) {
  Ce === null && hn(), wa(() => {
    const t = Js(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Si = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Si);
function Di(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var cr = { exports: {} }, Wr;
function Ei() {
  return Wr || (Wr = 1, (function(e) {
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
      function n(w, f, b) {
        var I = w || s, F = f || 0, N = b || !1, E = 0, j;
        function J(T, y) {
          var M;
          if (y) {
            if (M = y.getTime(), N) {
              var x = h(y);
              if (y = new Date(M + x + F), h(y) !== x) {
                var Y = h(y);
                y = new Date(M + Y + F);
              }
            }
          } else {
            var B = Date.now();
            B > E ? (E = B, j = new Date(E), M = E, N && (j = new Date(E + h(j) + F))) : M = E, y = j;
          }
          return O(T, y, I, M);
        }
        function O(T, y, M, B) {
          for (var x = "", Y = null, ae = !1, re = T.length, _e = !1, ve = 0; ve < re; ve++) {
            var he = T.charCodeAt(ve);
            if (ae === !0) {
              if (he === 45) {
                Y = "";
                continue;
              } else if (he === 95) {
                Y = " ";
                continue;
              } else if (he === 48) {
                Y = "0";
                continue;
              } else if (he === 58) {
                _e && P("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), _e = !0;
                continue;
              }
              switch (he) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  x += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  x += M.days[y.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  x += M.months[y.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  x += a(Math.floor(y.getFullYear() / 100), Y);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  x += O(M.formats.D, y, M, B);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  x += O(M.formats.F, y, M, B);
                  break;
                // '00'
                // case 'H':
                case 72:
                  x += a(y.getHours(), Y);
                  break;
                // '12'
                // case 'I':
                case 73:
                  x += a(v(y.getHours()), Y);
                  break;
                // '000'
                // case 'L':
                case 76:
                  x += l(Math.floor(B % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  x += a(y.getMinutes(), Y);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  x += y.getHours() < 12 ? M.am : M.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  x += O(M.formats.R, y, M, B);
                  break;
                // '00'
                // case 'S':
                case 83:
                  x += a(y.getSeconds(), Y);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  x += O(M.formats.T, y, M, B);
                  break;
                // '00'
                // case 'U':
                case 85:
                  x += a(o(y, "sunday"), Y);
                  break;
                // '00'
                // case 'W':
                case 87:
                  x += a(o(y, "monday"), Y);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  x += O(M.formats.X, y, M, B);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  x += y.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (N && F === 0)
                    x += "GMT";
                  else {
                    var H = g(y);
                    x += H || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  x += M.shortDays[y.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  x += M.shortMonths[y.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  x += O(M.formats.c, y, M, B);
                  break;
                // '01'
                // case 'd':
                case 100:
                  x += a(y.getDate(), Y);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  x += a(y.getDate(), Y ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  x += M.shortMonths[y.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var Q = new Date(y.getFullYear(), 0, 1), q = Math.ceil((y.getTime() - Q.getTime()) / (1e3 * 60 * 60 * 24));
                  x += l(q);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  x += a(y.getHours(), Y ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  x += a(v(y.getHours()), Y ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  x += a(y.getMonth() + 1, Y);
                  break;
                // '\n'
                // case 'n':
                case 110:
                  x += `
`;
                  break;
                // '1st'
                // case 'o':
                case 111:
                  var q = y.getDate();
                  M.ordinalSuffixes ? x += String(q) + (M.ordinalSuffixes[q - 1] || u(q)) : x += String(q) + u(q);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  x += y.getHours() < 12 ? M.AM : M.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  x += O(M.formats.r, y, M, B);
                  break;
                // '0'
                // case 's':
                case 115:
                  x += Math.floor(B / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  x += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var q = y.getDay();
                  x += q === 0 ? 7 : q;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  x += O(M.formats.v, y, M, B);
                  break;
                // '4'
                // case 'w':
                case 119:
                  x += y.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  x += O(M.formats.x, y, M, B);
                  break;
                // '70'
                // case 'y':
                case 121:
                  x += a(y.getFullYear() % 100, Y);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (N && F === 0)
                    x += _e ? "+00:00" : "+0000";
                  else {
                    var ee;
                    F !== 0 ? ee = F / (60 * 1e3) : ee = -y.getTimezoneOffset();
                    var ce = ee < 0 ? "-" : "+", se = _e ? ":" : "", X = Math.floor(Math.abs(ee / 60)), V = Math.abs(ee % 60);
                    x += ce + a(X) + se + a(V);
                  }
                  break;
                default:
                  ae && (x += "%"), x += T[ve];
                  break;
              }
              Y = null, ae = !1;
              continue;
            }
            if (he === 37) {
              ae = !0;
              continue;
            }
            x += T[ve];
          }
          return x;
        }
        var G = J;
        return G.localize = function(T) {
          return new n(T || I, F, N);
        }, G.localizeByIdentifier = function(T) {
          var y = t[T];
          return y ? G.localize(y) : (P('[WARNING] No locale found with identifier "' + T + '".'), G);
        }, G.timezone = function(T) {
          var y = F, M = N, B = typeof T;
          if (B === "number" || B === "string")
            if (M = !0, B === "string") {
              var x = T[0] === "-" ? -1 : 1, Y = parseInt(T.slice(1, 3), 10), ae = parseInt(T.slice(3, 5), 10);
              y = x * (60 * Y + ae) * 60 * 1e3;
            } else B === "number" && (y = T * 60 * 1e3);
          return new n(I, y, M);
        }, G.utc = function() {
          return new n(I, F, !0);
        }, G;
      }
      function a(w, f) {
        return f === "" || w > 9 ? "" + w : (f == null && (f = "0"), f + w);
      }
      function l(w) {
        return w > 99 ? w : w > 9 ? "0" + w : "00" + w;
      }
      function v(w) {
        return w === 0 ? 12 : w > 12 ? w - 12 : w;
      }
      function o(w, f) {
        f = f || "sunday";
        var b = w.getDay();
        f === "monday" && (b === 0 ? b = 6 : b--);
        var I = Date.UTC(w.getFullYear(), 0, 1), F = Date.UTC(w.getFullYear(), w.getMonth(), w.getDate()), N = Math.floor((F - I) / 864e5), E = (N + 7 - b) / 7;
        return Math.floor(E);
      }
      function u(w) {
        var f = w % 10, b = w % 100;
        if (b >= 11 && b <= 13 || f === 0 || f >= 4)
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
      function g(w, f) {
        return p() || m(w);
      }
      function p(w, f) {
        return null;
      }
      function m(w) {
        var f = w.toString().match(/\(([\w\s]+)\)/);
        return f && f[1];
      }
      function P(w) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(w);
      }
    })();
  })(cr)), cr.exports;
}
var Ti = Ei();
const Bt = /* @__PURE__ */ Di(Ti);
let vr = /* @__PURE__ */ L(!1);
class Ai {
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
    S(vr, !0);
    try {
      const r = new URL(t, window.location.origin);
      s.params && Object.entries(s.params).forEach(([v, o]) => {
        r.searchParams.append(v, String(o));
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
      S(vr, !1);
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
const ie = new Ai(), Fi = (e, t = $s) => {
  var s = Pi(), r = c(s);
  z(() => {
    qe(s, 1, `status status-${t().status ?? ""}`, "svelte-13s7gu4"), R(r, t().status);
  }), D(e, s);
};
var Pi = /* @__PURE__ */ C("<span> </span>"), Ri = /* @__PURE__ */ C('<time class="svelte-13s7gu4"> </time>'), Ii = /* @__PURE__ */ C('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Oi = /* @__PURE__ */ C('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), Ci = /* @__PURE__ */ C('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Ni = /* @__PURE__ */ C('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), Li = /* @__PURE__ */ C('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4">エントリ一覧</h2> <div class="search-box svelte-13s7gu4"><input type="text" placeholder="検索..." class="svelte-13s7gu4"/> <button class="svelte-13s7gu4">検索</button></div> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">新しい方へ</button> <button class="svelte-13s7gu4">古い方へ</button></div></div> <div><!></div></div>');
function Hi(e, t) {
  nt(t, !0);
  const s = (T, y = $s, M) => {
    let B = /* @__PURE__ */ Sr(() => ea(M?.(), !0));
    var x = Ri(), Y = c(x);
    z(
      (ae) => {
        Ee(x, "datetime", y()), R(Y, ae);
      },
      [() => i(B) && y() ? p(y()) : "-"]
    ), D(T, x);
  };
  let r = /* @__PURE__ */ L(ye([])), n = /* @__PURE__ */ L(!1), a = 50, l = /* @__PURE__ */ L(""), v = /* @__PURE__ */ L(ye([]));
  async function o() {
    try {
      const T = i(v)[i(v).length - 1], y = { limit: a };
      i(l) && (y.q = i(l)), T && (y.cursor_id = T);
      const M = await ie.get("/admin/api/entries", y);
      S(r, M.entries || [], !0), S(n, M.has_more || !1, !0);
    } catch (T) {
      console.error(T);
    }
  }
  function u() {
    S(v, [], !0), o();
  }
  Rt(o);
  function h() {
    if (i(n) && i(r).length > 0) {
      const T = i(r)[i(r).length - 1];
      i(v).push(T.id), o();
    }
  }
  function g() {
    i(v).length > 0 && (i(v).pop(), o());
  }
  function p(T) {
    return T ? Bt("%Y-%m-%d %H:%M", new Date(T)) : "-";
  }
  var m = Li(), P = c(m), w = d(c(P), 2), f = c(w);
  f.__keydown = (T) => T.key === "Enter" && u();
  var b = d(f, 2);
  b.__click = u;
  var I = d(w, 2), F = c(I);
  F.__click = g;
  var N = d(F, 2);
  N.__click = h;
  var E = d(P, 2);
  let j;
  var J = c(E);
  {
    var O = (T) => {
      var y = Ii();
      D(T, y);
    }, G = (T) => {
      var y = Ni(), M = je(y), B = d(c(M));
      Me(B, 21, () => i(r), Re, (ae, re) => {
        var _e = Oi(), ve = c(_e), he = c(ve), H = d(ve), Q = c(H), q = d(H), ee = c(q);
        Fi(ee, () => i(re));
        var ce = d(q), se = c(ce), X = c(se), V = d(se, 2), le = c(V), ue = c(le), me = d(ce), _ = c(me), k = d(me), $ = c(k);
        s($, () => i(re).created_at);
        var Z = d(k), oe = c(Z);
        s(oe, () => i(re).modified_at);
        var ge = d(Z), Se = c(ge);
        s(Se, () => i(re).publish_at?.Time, () => i(re).publish_at?.Valid);
        var Ue = d(ge), Ne = c(Ue);
        Ne.__click = () => t.onEdit(i(re).id), z(() => {
          R(he, i(re).id), R(Q, i(re).date), R(X, i(re).title), Ee(le, "href", `/${i(re).path ?? ""}`), R(ue, `/${i(re).path ?? ""}`), R(_, i(re).format);
        }), D(ae, _e);
      });
      var x = d(M, 2);
      {
        var Y = (ae) => {
          var re = Ci();
          D(ae, re);
        };
        ne(x, (ae) => {
          ie.loading && ae(Y);
        });
      }
      D(T, y);
    };
    ne(J, (T) => {
      ie.loading && i(r).length === 0 ? T(O) : T(G, !1);
    });
  }
  z(() => {
    F.disabled = i(v).length === 0 || ie.loading, N.disabled = !i(n) || ie.loading, j = qe(E, 1, "table-container svelte-13s7gu4", null, j, { "is-loading": ie.loading });
  }), as(f, () => i(l), (T) => S(l, T)), D(e, m), it();
}
ps(["keydown", "click"]);
class $i {
  #e;
  get exists() {
    return i(this.#e);
  }
  set exists(t) {
    S(this.#e, t, !0);
  }
  #t;
  get data() {
    return i(this.#t);
  }
  set data(t) {
    S(this.#t, t, !0);
  }
  constructor(t = typeof localStorage < "u" ? localStorage : null) {
    this.storage = t, this.timer = null, this.#e = /* @__PURE__ */ L(!1), this.#t = /* @__PURE__ */ L(null);
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
const Yi = "public", ji = "draft", qi = "scheduled", Bi = "reserved", jt = Yi, ur = ji, Is = qi, Os = Bi;
var Ui = /* @__PURE__ */ C('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), zi = /* @__PURE__ */ C('<option class="svelte-7nstam"> </option>'), Ji = /* @__PURE__ */ C('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), Xi = /* @__PURE__ */ C('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), Vi = /* @__PURE__ */ C('<button id="restore" type="button" class="submit-button restore-button svelte-7nstam">復元...</button>'), Ki = /* @__PURE__ */ C('<div role="option" tabindex="-1"> </div>'), Gi = /* @__PURE__ */ C('<span class="tag svelte-7nstam"> </span>'), Wi = /* @__PURE__ */ C('<div role="button" tabindex="-1"><div class="result-title svelte-7nstam"><!> <!> <button type="button" class="open-result-button svelte-7nstam" title="別タブで開く">↗️</button></div> <div class="result-summary svelte-7nstam"><!></div> <div class="result-meta svelte-7nstam"><span class="result-date svelte-7nstam"> </span> <span class="result-path svelte-7nstam"> </span></div></div>'), Zi = /* @__PURE__ */ C('<div class="no-results svelte-7nstam">結果が見つかりません</div>'), Qi = /* @__PURE__ */ C('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam">🔗 リンク</button> <button type="button" class="svelte-7nstam"> </button> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons footer-container svelte-7nstam"><div class="status-selector svelte-7nstam"><label class="status-option svelte-7nstam" title="非公開のまま保存します"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">下書き</span></div></label> <label class="status-option svelte-7nstam" title="今すぐ公開し、URLを確定させます"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">公開</span></div></label> <label class="status-option svelte-7nstam" title="指定した日時に公開します。URLは今すぐ確定します。"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">公開を遅延</span> <span class="description svelte-7nstam">URL確定</span></div></label> <label class="status-option svelte-7nstam" title="指定した日付を投稿日として予約します。公開されるまでURLは確定しません。"><input type="radio" class="svelte-7nstam"/> <div class="status-content svelte-7nstam"><span class="label-text svelte-7nstam">予約投稿</span> <span class="description svelte-7nstam">URL未定</span></div></label></div> <div class="action-row-container svelte-7nstam"><div class="footer-left svelte-7nstam"><button type="button" class="submit-button svelte-7nstam"><!></button> <!></div> <div class="footer-right svelte-7nstam"><!> <button type="button" class="submit-button preview-button svelte-7nstam">プレビュー</button></div></div></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam" role="listbox" aria-label="タグを選択" tabindex="0"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog> <dialog id="previewDialog" class="svelte-7nstam"><div class="preview-header svelte-7nstam"><h3 class="svelte-7nstam">プレビュー</h3> <button type="button" class="close-button svelte-7nstam">閉じる</button></div> <div class="preview-body svelte-7nstam"><iframe name="preview-iframe" title="Preview" class="svelte-7nstam"></iframe></div></dialog> <dialog id="searchDialog" class="search-dialog svelte-7nstam"><div class="search-header svelte-7nstam"><h3 class="svelte-7nstam">過去日記を検索</h3> <button type="button" class="close-button svelte-7nstam">閉じる</button></div> <div class="search-body svelte-7nstam"><input type="search" placeholder="キーワードを入力..." class="search-input svelte-7nstam"/> <div class="search-results svelte-7nstam"></div></div> <div class="dialog-footer svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button></div></dialog>', 1);
function el(e, t) {
  nt(t, !0);
  const s = [];
  let r = qa(t, "id", 3, null);
  const n = new $i();
  let a = /* @__PURE__ */ L(ye({ id: void 0, title: "", body: "", status: "" })), l = ye({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: jt,
    publishAt: ""
  }), v = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(!1), h = /* @__PURE__ */ L(null), g = /* @__PURE__ */ L(null), p = /* @__PURE__ */ L(null), m = /* @__PURE__ */ L(null), P = /* @__PURE__ */ L(null), w = /* @__PURE__ */ L(null), f = /* @__PURE__ */ L(null);
  const b = [
    "tech",
    "photo",
    "redeveloped",
    "stablediffusion",
    "photoshopped"
  ];
  let I = /* @__PURE__ */ L(0), F = /* @__PURE__ */ L(""), N = /* @__PURE__ */ L(ye([])), E = /* @__PURE__ */ L(0), j = /* @__PURE__ */ L(null), J = ye([]);
  async function O(_) {
    try {
      const k = await ie.get(`/admin/api/entry/${_}`);
      S(a, k, !0), l.id = k.id, l.title = k.title, l.body = k.body, l.format = k.format || "Hatena", l.status = k.status, k.publish_at?.Valid ? l.publishAt = Bt("%Y-%m-%dT%H:%M", new Date(k.publish_at.Time)) : l.publishAt = Bt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), n.check(i(a).id ?? null, { title: l.title, body: l.body });
    } catch (k) {
      console.error(k), alert("エントリの取得に失敗しました");
    }
  }
  Rt(() => {
    r() ? O(r()) : (S(a, { id: void 0, title: "", body: "", status: jt }, !0), l.id = null, l.title = "", l.body = "", l.format = "Hatena", l.status = jt, l.publishAt = Bt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), n.check(null, { title: l.title, body: l.body }));
  }), wa(() => {
    (i(a).title !== l.title || i(a).body !== l.body) && n.saveDebounced(i(a).id ?? null, { title: l.title, body: l.body });
  });
  async function G() {
    S(v, !0), S(o, "リクエスト中");
    const _ = new FormData();
    if (_.set("id", l.id ? String(l.id) : ""), _.set("title", l.title), _.set("body", l.body), _.set("format", l.format), l.status === Is || l.status === Os) {
      const k = new Date(l.publishAt);
      _.set("publish_at", k.toISOString());
    }
    _.set("status", l.status);
    try {
      const $ = (await ie.post("/admin/api/edit", _)).session_id;
      if (!$)
        throw new Error("保存に失敗しました");
      T($);
    } catch (k) {
      S(v, !1), alert(k instanceof Error ? k.message : "エラーが発生しました");
    }
  }
  function T(_) {
    const k = new EventSource(`/admin/api/edit/progress?sid=${_}`);
    k.onmessage = ($) => {
      const Z = JSON.parse($.data);
      switch (Z.type) {
        case "progress":
          S(o, y(Z.message), !0);
          break;
        case "done":
          n.clear(i(a).id ?? null), S(o, "完了"), S(v, !1), k.close(), t.onSave(Z.location);
          break;
        case "error":
          S(o, "エラー: " + Z.message), S(v, !1), k.close(), alert("保存に失敗しました: " + Z.message);
          break;
      }
    }, k.onerror = () => {
      S(v, !1), k.close(), alert("通信エラーが発生しました");
    };
  }
  function y(_) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[_] || _;
  }
  function M() {
    S(I, 0), i(p).showModal(), setTimeout(() => i(f)?.focus(), 0);
  }
  function B(_) {
    _.key === "ArrowDown" ? (_.preventDefault(), S(I, (i(I) + 1) % b.length)) : _.key === "ArrowUp" ? (_.preventDefault(), S(I, (i(I) - 1 + b.length) % b.length)) : _.key === "Enter" || _.key === " " ? (_.preventDefault(), x(b[i(I)])) : _.key === "Escape" && i(p).close();
  }
  function x(_) {
    const k = `[${_}]`;
    l.title.includes(k) ? l.title = l.title.replace(k, "") : l.title = k + l.title, i(p).close(), i(h).focus();
  }
  function Y() {
    S(F, ""), S(N, [], !0), S(E, 0), i(w).showModal(), setTimeout(() => i(j)?.focus(), 0);
  }
  async function ae() {
    if (i(F).length < 2) {
      S(N, [], !0);
      return;
    }
    try {
      const _ = await ie.get("/api/search", { q: i(F) });
      S(N, _.results || [], !0), S(E, 0);
    } catch (_) {
      console.error(_);
    }
  }
  function re(_) {
    _.key === "ArrowDown" || _.ctrlKey && _.key === "n" ? (_.preventDefault(), S(E, (i(E) + 1) % i(N).length), J[i(E)]?.scrollIntoView({ block: "nearest" })) : _.key === "ArrowUp" || _.ctrlKey && _.key === "p" ? (_.preventDefault(), S(E, (i(E) - 1 + i(N).length) % i(N).length), J[i(E)]?.scrollIntoView({ block: "nearest" })) : _.key === "Enter" ? (_.preventDefault(), i(N)[i(E)] && (_.shiftKey || _.metaKey || _.ctrlKey ? _e(i(N)[i(E)]) : ve(i(N)[i(E)]))) : _.key === "Escape" && i(w).close();
  }
  function _e(_) {
    const k = _.path.startsWith("http") ? _.path : `${location.origin}/${_.path}`;
    window.open(k, "_blank");
  }
  function ve(_) {
    const k = _.path.startsWith("http") ? _.path : `${location.origin}/${_.path}`;
    let $ = "";
    switch (l.format) {
      case "Hatena":
        $ = `[${k}:title=${_.title}]`;
        break;
      case "Markdown":
        $ = `[${_.title}](${k})`;
        break;
      case "HTML":
        $ = `<a href="${k}">${_.title}</a>`;
        break;
      case "tDiary":
        $ = `[[${_.title}|${k}]]`;
        break;
      default:
        $ = k;
    }
    Q($), i(w).close(), i(g).focus();
  }
  function he() {
    n.data && (l.title = n.data.title, l.body = n.data.body, n.clear(i(a).id ?? null), i(m).close());
  }
  async function H() {
    const _ = document.createElement("input");
    _.type = "file", _.oninput = async () => {
      if (!_.files?.[0]) return;
      const k = new FormData();
      k.append("file", _.files[0]), S(u, !0);
      try {
        const $ = await ie.post("/admin/api/upload/image", k), Z = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${$.uploaded}" class="picasa" itemprop="url"><img src="${$.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        Q(Z, !0);
      } catch {
        alert("アップロードに失敗しました");
      } finally {
        S(u, !1);
      }
    }, _.click();
  }
  function Q(_, k = !1) {
    const $ = i(g).selectionStart, Z = i(g).selectionEnd, oe = i(g).value;
    l.body = oe.substring(0, $) + _ + oe.substring(Z), Ca().then(() => {
      typeof k == "boolean" && k ? (i(g).selectionStart = $, i(g).selectionEnd = $ + _.length) : typeof k == "number" ? i(g).selectionStart = i(g).selectionEnd = $ + k : i(g).selectionStart = i(g).selectionEnd = $ + _.length, i(g).focus();
    });
  }
  function q(_) {
    const k = (_.altKey ? "Alt-" : "") + (_.ctrlKey ? "Control-" : "") + (_.metaKey ? "Meta-" : "") + (_.shiftKey ? "Shift-" : "") + _.key;
    k === "Control-t" ? (Q("\\(  \\)", 3), _.preventDefault(), _.stopPropagation()) : (k === "Control-l" || k === "Meta-l") && (Y(), _.preventDefault(), _.stopPropagation());
  }
  function ee() {
    i(P).showModal();
    const _ = document.createElement("form");
    _.method = "POST", _.action = "/admin/api/preview", _.target = "preview-iframe";
    const k = {
      title: l.title,
      body: l.body,
      format: l.format,
      sk: ie.skValue
    };
    for (const [$, Z] of Object.entries(k)) {
      const oe = document.createElement("input");
      oe.type = "hidden", oe.name = $, oe.value = Z, _.appendChild(oe);
    }
    document.body.appendChild(_), _.submit(), document.body.removeChild(_);
  }
  function ce(_) {
    const k = document.createElement("p");
    return k.textContent = _, k.innerHTML;
  }
  function se(_, k) {
    if (!k) return ce(_);
    const $ = ce(_), Z = k.split(/\s+/).filter((Se) => Se.length >= 2);
    if (Z.length === 0) return $;
    const oe = Z.map((Se) => Se.replace(/[.*+?^${}()|[\\]/g, "\\$&")).join("|"), ge = new RegExp(`(${oe})`, "gi");
    return $.replace(ge, "<mark>$1</mark>");
  }
  function X(_) {
    const $ = new DOMParser().parseFromString(_, "text/html");
    $.querySelectorAll("script, style, noscript, iframe").forEach((oe) => oe.remove());
    const Z = $.body.textContent || "";
    return Z.replace(/\s+/g, " ").trim().substring(0, 200) + (Z.length > 200 ? "..." : "");
  }
  var V = yt(), le = je(V);
  {
    var ue = (_) => {
      var k = Ui();
      D(_, k);
    }, me = (_) => {
      var k = Qi(), $ = je(k), Z = c($), oe = c(Z);
      ze(oe, (A) => S(h, A), () => i(h));
      var ge = d(oe, 2), Se = c(ge);
      Se.__click = M;
      var Ue = d(Se, 2);
      Ue.__click = Y;
      var Ne = d(Ue, 2);
      Ne.__click = H;
      var ot = c(Ne), ct = d(Ne, 2);
      Me(ct, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], Re, (A, U) => {
        var de = zi(), fe = c(de), De = {};
        z(() => {
          R(fe, U), De !== (De = U) && (de.value = (de.__value = U) ?? "");
        }), D(A, de);
      });
      var It = d(ge, 2), Kt = c(It);
      Kt.__keydown = q, ze(Kt, (A) => S(g, A), () => i(g));
      var ms = d(Z, 2), gs = c(ms);
      {
        var Xs = (A) => {
          var U = Ji();
          D(A, U);
        };
        ne(gs, (A) => {
          i(v) && A(Xs);
        });
      }
      var bs = d(gs, 2), ws = c(bs), ys = c(ws), Ot = c(ys), xs, ks = d(ys, 2), Ct = c(ks), Ms, Ss = d(ks, 2), Nt = c(Ss), Ds, Vs = d(Ss, 2), Lt = c(Vs), Es, Ks = d(ws, 2), Gt = c(Ks), Ht = c(Gt);
      Ht.__click = G;
      var Gs = c(Ht);
      {
        var Ws = (A) => {
          var U = ts();
          z(() => R(U, i(o) || "リクエスト中")), D(A, U);
        }, Zs = (A) => {
          var U = yt(), de = je(U);
          {
            var fe = (Fe) => {
              var We = ts("下書き保存");
              D(Fe, We);
            }, De = (Fe) => {
              var We = yt(), As = je(We);
              {
                var ar = (ut) => {
                  var $t = ts();
                  z(() => R($t, r() ? "更新する" : "公開する")), D(ut, $t);
                }, Fs = (ut) => {
                  var $t = ts("予約する");
                  D(ut, $t);
                };
                ne(
                  As,
                  (ut) => {
                    l.status === jt ? ut(ar) : ut(Fs, !1);
                  },
                  !0
                );
              }
              D(Fe, We);
            };
            ne(
              de,
              (Fe) => {
                l.status === ur ? Fe(fe) : Fe(De, !1);
              },
              !0
            );
          }
          D(A, U);
        };
        ne(Gs, (A) => {
          i(v) ? A(Ws) : A(Zs, !1);
        });
      }
      var Qs = d(Ht, 2);
      {
        var er = (A) => {
          var U = Xi();
          as(U, () => l.publishAt, (de) => l.publishAt = de), D(A, U);
        };
        ne(Qs, (A) => {
          (l.status === Is || l.status === Os) && A(er);
        });
      }
      var tr = d(Gt, 2), Ts = c(tr);
      {
        var Wt = (A) => {
          var U = Vi();
          U.__click = () => i(m).showModal(), D(A, U);
        };
        ne(Ts, (A) => {
          n.exists && A(Wt);
        });
      }
      var bt = d(Ts, 2);
      bt.__click = ee;
      var Ge = d($, 2), vt = d(c(Ge), 2);
      vt.__keydown = B, Me(vt, 21, () => b, Re, (A, U, de) => {
        var fe = Ki();
        let De;
        fe.__click = () => x(i(U)), fe.__keydown = (We) => We.key === "Enter" && x(i(U));
        var Fe = c(fe);
        z(() => {
          De = qe(fe, 1, "tag-item svelte-7nstam", null, De, { selected: i(I) === de }), Ee(fe, "aria-selected", i(I) === de), R(Fe, i(U));
        }), Ur("mouseenter", fe, () => S(I, de, !0)), D(A, fe);
      }), ze(vt, (A) => S(f, A), () => i(f));
      var sr = d(vt, 2);
      sr.__click = () => i(p).close(), ze(Ge, (A) => S(p, A), () => i(p));
      var Zt = d(Ge, 2), Ar = d(c(Zt), 2), Ba = c(Ar);
      {
        var Ua = (A) => {
          var U = ts();
          z((de) => R(U, de), [() => Bt("%Y年%m月%d日%H時", new Date(n.data.time))]), D(A, U);
        };
        ne(Ba, (A) => {
          n.data?.time && A(Ua);
        });
      }
      var za = d(Ar, 2), Fr = c(za);
      Fr.__click = () => i(m).close();
      var Ja = d(Fr, 2);
      Ja.__click = he, ze(Zt, (A) => S(m, A), () => i(m));
      var rr = d(Zt, 2), Xa = c(rr), Va = d(c(Xa), 2);
      Va.__click = () => i(P).close(), ze(rr, (A) => S(P, A), () => i(P));
      var Pr = d(rr, 2), Rr = c(Pr), Ka = d(c(Rr), 2);
      Ka.__click = () => i(w).close();
      var Ir = d(Rr, 2), Qt = c(Ir);
      Qt.__input = ae, Qt.__keydown = re, ze(Qt, (A) => S(j, A), () => i(j));
      var Ga = d(Qt, 2);
      Me(
        Ga,
        21,
        () => i(N),
        Re,
        (A, U, de) => {
          var fe = Wi();
          let De;
          fe.__click = () => ve(i(U)), fe.__keydown = (Ze) => Ze.key === "Enter" && ve(i(U));
          var Fe = c(fe), We = c(Fe);
          Xr(We, () => se(i(U).title, i(F)));
          var As = d(We, 2);
          Me(As, 17, () => i(U).tags, Re, (Ze, nr) => {
            var Cr = Gi(), sn = c(Cr);
            z(() => R(sn, i(nr))), D(Ze, Cr);
          });
          var ar = d(As, 2);
          ar.__click = (Ze) => {
            Ze.stopPropagation(), _e(i(U));
          };
          var Fs = d(Fe, 2), ut = c(Fs);
          Xr(ut, () => se(X(i(U).formatted_body), i(F)));
          var $t = d(Fs, 2), Or = c($t), Qa = c(Or), en = d(Or, 2), tn = c(en);
          ze(fe, (Ze, nr) => J[nr] = Ze, (Ze) => J?.[Ze], () => [de]), z(() => {
            De = qe(fe, 1, "search-result-item svelte-7nstam", null, De, { selected: i(E) === de }), R(Qa, i(U).date), R(tn, i(U).path);
          }), Ur("mouseenter", fe, () => S(E, de, !0)), D(A, fe);
        },
        (A) => {
          var U = yt(), de = je(U);
          {
            var fe = (De) => {
              var Fe = Zi();
              D(De, Fe);
            };
            ne(de, (De) => {
              i(F).length >= 2 && De(fe);
            });
          }
          D(A, U);
        }
      );
      var Wa = d(Ir, 2), Za = c(Wa);
      Za.__click = () => i(w).close(), ze(Pr, (A) => S(w, A), () => i(w)), z(() => {
        Ne.disabled = i(u), R(ot, i(u) ? "⌛ アップロード中..." : "📷 写真"), xs !== (xs = ur) && (Ot.value = (Ot.__value = ur) ?? ""), Ms !== (Ms = jt) && (Ct.value = (Ct.__value = jt) ?? ""), Ds !== (Ds = Is) && (Nt.value = (Nt.__value = Is) ?? ""), Es !== (Es = Os) && (Lt.value = (Lt.__value = Os) ?? ""), Ht.disabled = i(v), bt.disabled = i(v);
      }), as(oe, () => l.title, (A) => l.title = A), mi(ct, () => l.format, (A) => l.format = A), as(Kt, () => l.body, (A) => l.body = A), Rs(
        s,
        [],
        Ot,
        () => l.status,
        (A) => l.status = A
      ), Rs(
        s,
        [],
        Ct,
        () => l.status,
        (A) => l.status = A
      ), Rs(
        s,
        [],
        Nt,
        () => l.status,
        (A) => l.status = A
      ), Rs(
        s,
        [],
        Lt,
        () => l.status,
        (A) => l.status = A
      ), as(Qt, () => i(F), (A) => S(F, A)), D(_, k);
    };
    ne(le, (_) => {
      ie.loading && !i(a).id ? _(ue) : _(me, !1);
    });
  }
  D(e, V), it();
}
ps(["click", "keydown", "input"]);
const tl = (e, t = $s) => {
  var s = sl(), r = c(s);
  z(() => {
    qe(s, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), R(r, t());
  }), D(e, s);
};
var sl = /* @__PURE__ */ C("<span> </span>"), rl = /* @__PURE__ */ C('<time class="time svelte-1r6codn"> </time>'), al = /* @__PURE__ */ C('<div class="loading svelte-1r6codn"></div>'), nl = /* @__PURE__ */ C('<div class="error-text svelte-1r6codn"> </div>'), il = /* @__PURE__ */ C('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><!></td><td class="error svelte-1r6codn"><!></td></tr>'), ll = /* @__PURE__ */ C('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), ol = /* @__PURE__ */ C('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">新しい方へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">古い方へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function cl(e, t) {
  nt(t, !0);
  const s = (O, G = $s, T) => {
    let y = /* @__PURE__ */ Sr(() => ea(T?.(), !0));
    var M = rl(), B = c(M);
    z(
      (x) => {
        Ee(M, "datetime", G()), R(B, x);
      },
      [() => i(y) && G() ? h(G()) : "-"]
    ), D(O, M);
  };
  let r = /* @__PURE__ */ L(ye([])), n = /* @__PURE__ */ L(0), a = /* @__PURE__ */ L(0), l = 50;
  async function v() {
    try {
      const O = await ie.get("/admin/api/jobs", { limit: l, offset: i(a) });
      S(r, O.jobs || [], !0), S(n, O.total || 0, !0);
    } catch (O) {
      console.error(O);
    }
  }
  Rt(v);
  function o() {
    i(a) + l < i(n) && (S(a, i(a) + l), v());
  }
  function u() {
    i(a) - l >= 0 && (S(a, i(a) - l), v());
  }
  function h(O) {
    return Bt("%Y-%m-%d %H:%M:%S", new Date(O));
  }
  var g = ol(), p = c(g), m = c(p), P = c(m), w = d(m, 2), f = c(w);
  f.__click = u;
  var b = d(f, 2), I = c(b), F = d(b, 2);
  F.__click = o;
  var N = d(F, 2);
  N.__click = v;
  var E = d(p, 2);
  {
    var j = (O) => {
      var G = al();
      D(O, G);
    }, J = (O) => {
      var G = ll(), T = d(c(G));
      Me(T, 21, () => i(r), Re, (y, M) => {
        var B = il(), x = c(B), Y = c(x), ae = d(x), re = c(ae), _e = c(re), ve = d(ae), he = c(ve);
        tl(he, () => i(M).status);
        var H = d(ve), Q = c(H), q = d(H), ee = c(q);
        s(ee, () => i(M).created_at);
        var ce = d(q), se = c(ce);
        {
          var X = (V) => {
            var le = nl(), ue = c(le);
            z(() => {
              Ee(le, "title", i(M).error_message.String), R(ue, i(M).error_message.String);
            }), D(V, le);
          };
          ne(se, (V) => {
            i(M).error_message?.Valid && V(X);
          });
        }
        z(() => {
          R(Y, i(M).id), R(_e, i(M).job_type_name), R(Q, i(M).retry_count);
        }), D(y, B);
      }), D(O, G);
    };
    ne(E, (O) => {
      ie.loading && i(r).length === 0 ? O(j) : O(J, !1);
    });
  }
  z(
    (O) => {
      R(P, `ジョブ一覧 (${i(n) ?? ""})`), f.disabled = i(a) === 0 || ie.loading, R(I, `${i(a) + 1} - ${O ?? ""} / ${i(n) ?? ""}`), F.disabled = i(a) + l >= i(n) || ie.loading;
    },
    [() => Math.min(i(a) + l, i(n))]
  ), D(e, g), it();
}
ps(["click"]);
var vl = /* @__PURE__ */ C('<div class="empty svelte-wpgtu6">No Signature</div>'), ul = /* @__PURE__ */ C("<div></div>"), fl = /* @__PURE__ */ C('<div class="row svelte-wpgtu6"></div>'), dl = /* @__PURE__ */ C('<div class="chroma-section svelte-wpgtu6"></div>'), hl = /* @__PURE__ */ C('<div class="chroma-sections svelte-wpgtu6"></div>'), _l = /* @__PURE__ */ C('<div class="color-bitmask svelte-wpgtu6"><!></div>');
function fr(e, t) {
  nt(t, !0);
  let s = qa(t, "size", 3, 64), r = /* @__PURE__ */ dt(() => {
    if (!t.sig) return new Array(64).fill(!1);
    try {
      const h = atob(t.sig), g = new Uint8Array(h.length);
      for (let m = 0; m < h.length; m++)
        g[m] = h.charCodeAt(m);
      const p = [];
      for (let m = 0; m < 8; m++) {
        const P = g[m];
        for (let w = 7; w >= 0; w--)
          p.push((P >> w & 1) === 1);
      }
      return p.reverse();
    } catch (h) {
      return console.error("Failed to decode sig:", h), new Array(64).fill(!1);
    }
  });
  function n(h) {
    const g = h >> 5 & 1, p = h >> 4 & 1, m = h >> 3 & 1, P = h >> 2 & 1, w = h >> 1 & 1, f = h & 1, b = p << 1 | P, I = g << 2 | m << 1 | w, F = f, N = [25, 45, 65, 85][b], E = F === 0 ? 0.01 : 0.15, j = I * 45;
    return `oklch(${N}% ${E} ${j})`;
  }
  function a(h, g, p) {
    const m = h >> 1 & 1, P = h & 1, w = g >> 2 & 1, f = g >> 1 & 1, b = g & 1, I = p & 1;
    return w << 5 | m << 4 | f << 3 | P << 2 | b << 1 | I;
  }
  var l = _l(), v = c(l);
  {
    var o = (h) => {
      var g = vl();
      D(h, g);
    }, u = (h) => {
      var g = hl();
      Me(g, 20, () => [1, 0], Re, (p, m) => {
        var P = dl();
        Me(P, 20, () => [3, 2, 1, 0], Re, (w, f) => {
          var b = fl();
          Me(b, 20, () => [0, 1, 2, 3, 4, 5, 6, 7], Re, (I, F) => {
            const N = /* @__PURE__ */ dt(() => a(f, F, m));
            var E = ul();
            let j;
            z(
              (J) => {
                j = qe(E, 1, "bit svelte-wpgtu6", null, j, { active: i(r)[i(N)] }), os(E, `background-color: ${J ?? ""}`), Ee(E, "title", `L=${f ?? ""} H=${F * 45} C=${m ?? ""}`);
              },
              [() => n(i(N))]
            ), D(I, E);
          }), D(w, b);
        }), z(() => Ee(P, "title", m === 1 ? "Vivid Colors" : "Muted Colors")), D(p, P);
      }), D(h, g);
    };
    ne(v, (h) => {
      t.sig ? h(u, !1) : h(o);
    });
  }
  z(() => os(l, `--size: ${s() ?? ""}px`)), D(e, l), it();
}
var pl = /* @__PURE__ */ C('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), ml = /* @__PURE__ */ C('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class A Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), gl = /* @__PURE__ */ C('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), bl = /* @__PURE__ */ C('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class B Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), wl = /* @__PURE__ */ C('<div class="stat-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">Storage (Free: 10GB)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976"> </div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class A (Free: 1M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class B (Free: 10M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div>', 1), yl = /* @__PURE__ */ C('<div class="stat-card error-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">R2 Status</div> <div class="stat-value svelte-1w9i976" style="font-size: 0.9rem; color: #d32f2f;"> </div></div>'), xl = /* @__PURE__ */ C('<div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div>', 1), kl = /* @__PURE__ */ C('<div class="r2-stats svelte-1w9i976"><!></div>');
function Ml(e, t) {
  nt(t, !0);
  let s = /* @__PURE__ */ L(null), r = /* @__PURE__ */ L(null);
  async function n() {
    try {
      S(s, await ie.get("/admin/api/r2/usage"), !0);
    } catch (f) {
      console.error("Failed to fetch R2 usage:", f), S(r, "Failed to load R2 usage data");
    }
  }
  Rt(n);
  function a(f) {
    if (f === 0) return "0 B";
    const b = 1024, I = ["B", "KB", "MB", "GB", "TB"], F = Math.floor(Math.log(f) / Math.log(b));
    return parseFloat((f / Math.pow(b, F)).toFixed(2)) + " " + I[F];
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
  ], o = /* @__PURE__ */ dt(() => i(s) ? (i(s).operations || []).filter((f) => l.includes(f.action_type)).reduce((f, b) => f + b.requests, 0) : 0), u = /* @__PURE__ */ dt(() => i(s) ? (i(s).operations || []).filter((f) => v.includes(f.action_type)).reduce((f, b) => f + b.requests, 0) : 0), h = /* @__PURE__ */ dt(() => i(s) ? (i(s).operations || []).filter((f) => l.includes(f.action_type)).sort((f, b) => b.requests - f.requests) : []), g = /* @__PURE__ */ dt(() => i(s) ? (i(s).operations || []).filter((f) => v.includes(f.action_type)).sort((f, b) => b.requests - f.requests) : []);
  var p = kl(), m = c(p);
  {
    var P = (f) => {
      var b = wl(), I = je(b), F = d(c(I), 2), N = c(F), E = d(F, 2), j = c(E), J = d(E, 2), O = c(J), G = d(I, 2), T = d(c(G), 2), y = c(T), M = d(T, 4), B = c(M), x = d(M, 2);
      {
        var Y = (q) => {
          var ee = ml(), ce = d(c(ee), 2);
          Me(ce, 21, () => i(h), Re, (se, X) => {
            var V = pl(), le = c(V), ue = c(le), me = d(le, 2), _ = c(me);
            z(
              (k) => {
                R(ue, i(X).action_type), R(_, k);
              },
              [() => (i(X).requests ?? 0).toLocaleString()]
            ), D(se, V);
          }), D(q, ee);
        };
        ne(x, (q) => {
          i(h).length > 0 && q(Y);
        });
      }
      var ae = d(G, 2), re = d(c(ae), 2), _e = c(re), ve = d(re, 4), he = c(ve), H = d(ve, 2);
      {
        var Q = (q) => {
          var ee = bl(), ce = d(c(ee), 2);
          Me(ce, 21, () => i(g), Re, (se, X) => {
            var V = gl(), le = c(V), ue = c(le), me = d(le, 2), _ = c(me);
            z(
              (k) => {
                R(ue, i(X).action_type), R(_, k);
              },
              [() => (i(X).requests ?? 0).toLocaleString()]
            ), D(se, V);
          }), D(q, ee);
        };
        ne(H, (q) => {
          i(g).length > 0 && q(Q);
        });
      }
      z(
        (q, ee, ce, se, X, V, le) => {
          R(N, q), R(j, `${ee ?? ""} objects`), os(O, `width: ${ce ?? ""}%`), R(y, se), os(B, `width: ${X ?? ""}%`), R(_e, V), os(he, `width: ${le ?? ""}%`);
        },
        [
          () => a(i(s).storage_usage_bytes ?? 0),
          () => (i(s).object_count ?? 0).toLocaleString(),
          () => Math.min(100, (i(s).storage_usage_bytes ?? 0) / 10737418240 * 100),
          () => (i(o) ?? 0).toLocaleString(),
          () => Math.min(100, (i(o) ?? 0) / 1e6 * 100),
          () => (i(u) ?? 0).toLocaleString(),
          () => Math.min(100, (i(u) ?? 0) / 1e7 * 100)
        ]
      ), D(f, b);
    }, w = (f) => {
      var b = yt(), I = je(b);
      {
        var F = (E) => {
          var j = yl(), J = d(c(j), 2), O = c(J);
          z(() => R(O, i(r))), D(E, j);
        }, N = (E) => {
          var j = xl();
          D(E, j);
        };
        ne(
          I,
          (E) => {
            i(r) ? E(F) : E(N, !1);
          },
          !0
        );
      }
      D(f, b);
    };
    ne(m, (f) => {
      i(s) ? f(P) : f(w, !1);
    });
  }
  D(e, p), it();
}
var Sl = /* @__PURE__ */ C('<div class="loading svelte-xxb0sp">読み込み中...</div>'), Dl = /* @__PURE__ */ C('<button class="indexed-icon svelte-xxb0sp" title="類似画像を検索">🔍</button>'), El = /* @__PURE__ */ C('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/> <!></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), Tl = /* @__PURE__ */ C('<div class="overlay svelte-xxb0sp"><div class="loading-spinner svelte-xxb0sp"></div></div>'), Al = /* @__PURE__ */ C('<div class="grid-container svelte-xxb0sp"><div></div> <!></div>'), Fl = /* @__PURE__ */ C('<div class="selected-compare svelte-xxb0sp"><div class="image-item target svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="svelte-xxb0sp">Selected Image</div></div></div> <div class="arrow svelte-xxb0sp">→</div></div>'), Pl = /* @__PURE__ */ C('<div class="loading svelte-xxb0sp">検索中...</div>'), Rl = /* @__PURE__ */ C('<p class="svelte-xxb0sp">類似画像は見つかりませんでした。</p>'), Il = /* @__PURE__ */ C('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), Ol = /* @__PURE__ */ C("<div></div>"), Cl = /* @__PURE__ */ C('<div class="image-list svelte-xxb0sp"><div class="header svelte-xxb0sp"><div class="title-area svelte-xxb0sp"><h2 class="svelte-xxb0sp"> </h2> <a href="https://dash.cloudflare.com/d52dc19d3368d36eecf4b48d5eb2dd44/r2/default/buckets/lowreal" target="_blank" rel="noopener noreferrer" class="r2-link svelte-xxb0sp">R2 Dashboard ↗</a></div> <div class="pagination svelte-xxb0sp"><button class="svelte-xxb0sp">前へ</button> <span class="svelte-xxb0sp"> </span> <button class="svelte-xxb0sp">次へ</button></div></div> <!> <!></div> <dialog id="similarDialog" class="svelte-xxb0sp"><div class="dialog-header svelte-xxb0sp"><h3 class="svelte-xxb0sp">類似画像一覧</h3> <button type="button" class="close-btn svelte-xxb0sp">×</button></div> <div class="dialog-content svelte-xxb0sp"><!> <!></div></dialog>', 1);
function Nl(e, t) {
  nt(t, !0);
  let s = /* @__PURE__ */ L(ye([])), r = /* @__PURE__ */ L(0), n = 20, a = /* @__PURE__ */ L(0), l = /* @__PURE__ */ L(ye([])), v = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L(null);
  async function u() {
    try {
      const H = await ie.get(`/admin/api/images?limit=${n}&offset=${i(r)}`);
      S(s, H.images || [], !0), S(a, H.total || 0, !0);
    } catch (H) {
      console.error(H);
    }
  }
  async function h(H) {
    S(v, H, !0), S(l, [], !0), i(o).showModal();
    try {
      const Q = await ie.get(`/admin/api/image/${H.id}/similar`);
      S(l, Q.similar || [], !0);
    } catch (Q) {
      console.error(Q);
    }
  }
  Rt(u);
  function g() {
    i(r) + n < i(a) && (S(r, i(r) + n), u());
  }
  function p() {
    i(r) - n >= 0 && (S(r, i(r) - n), u());
  }
  var m = Cl(), P = je(m), w = c(P), f = c(w), b = c(f), I = c(b), F = d(f, 2), N = c(F);
  N.__click = p;
  var E = d(N, 2), j = c(E), J = d(E, 2);
  J.__click = g;
  var O = d(w, 2);
  Ml(O, {});
  var G = d(O, 2);
  {
    var T = (H) => {
      var Q = Sl();
      D(H, Q);
    }, y = (H) => {
      var Q = Al(), q = c(Q);
      let ee;
      Me(q, 21, () => i(s), (X) => X.id, (X, V) => {
        var le = El(), ue = c(le), me = c(ue), _ = d(me, 2);
        {
          var k = (ct) => {
            var It = Dl();
            It.__click = () => h(i(V)), D(ct, It);
          };
          ne(_, (ct) => {
            i(V).sig?.length > 0 && ct(k);
          });
        }
        var $ = d(ue, 2), Z = c($);
        fr(Z, {
          get sig() {
            return i(V).sig;
          }
        });
        var oe = d(Z, 2), ge = c(oe), Se = d(c(ge)), Ue = c(Se), Ne = d(oe, 2), ot = c(Ne);
        z(() => {
          Ee(me, "src", i(V).uri), Ee(ge, "href", `/admin/edit?id=${i(V).entry_id ?? ""}`), R(Ue, i(V).entry_id), R(ot, `ID: ${i(V).id ?? ""}`);
        }), D(X, le);
      });
      var ce = d(q, 2);
      {
        var se = (X) => {
          var V = Tl();
          D(X, V);
        };
        ne(ce, (X) => {
          ie.loading && X(se);
        });
      }
      z(() => ee = qe(q, 1, "grid svelte-xxb0sp", null, ee, { "is-loading": ie.loading })), D(H, Q);
    };
    ne(G, (H) => {
      ie.loading && i(s).length === 0 ? H(T) : H(y, !1);
    });
  }
  var M = d(P, 2), B = c(M), x = d(c(B), 2);
  x.__click = () => i(o).close();
  var Y = d(B, 2), ae = c(Y);
  {
    var re = (H) => {
      var Q = Fl(), q = c(Q), ee = c(q), ce = c(ee), se = d(ee, 2), X = c(se);
      fr(X, {
        get sig() {
          return i(v).sig;
        }
      }), z(() => Ee(ce, "src", i(v).uri)), D(H, Q);
    };
    ne(ae, (H) => {
      i(v) && H(re);
    });
  }
  var _e = d(ae, 2);
  {
    var ve = (H) => {
      var Q = Pl();
      D(H, Q);
    }, he = (H) => {
      var Q = yt(), q = je(Q);
      {
        var ee = (se) => {
          var X = Rl();
          D(se, X);
        }, ce = (se) => {
          var X = Ol();
          let V;
          Me(X, 21, () => i(l), (le) => le.id, (le, ue) => {
            var me = Il(), _ = c(me), k = c(_), $ = d(_, 2), Z = c($);
            fr(Z, {
              get sig() {
                return i(ue).sig;
              }
            });
            var oe = d(Z, 2), ge = c(oe);
            ge.__click = () => i(o).close();
            var Se = d(c(ge)), Ue = c(Se), Ne = d(oe, 2), ot = c(Ne);
            z(() => {
              Ee(k, "src", i(ue).uri), Ee(ge, "href", `/admin/edit?id=${i(ue).entry_id ?? ""}`), R(Ue, i(ue).entry_id), R(ot, `ID: ${i(ue).id ?? ""} / Score: ${i(ue).score ?? ""}`);
            }), D(le, me);
          }), z(() => V = qe(X, 1, "grid similar-grid svelte-xxb0sp", null, V, { "is-loading": ie.loading })), D(se, X);
        };
        ne(
          q,
          (se) => {
            i(l).length === 0 ? se(ee) : se(ce, !1);
          },
          !0
        );
      }
      D(H, Q);
    };
    ne(_e, (H) => {
      ie.loading && i(l).length === 0 ? H(ve) : H(he, !1);
    });
  }
  ze(M, (H) => S(o, H), () => i(o)), z(
    (H) => {
      R(I, `画像一覧 (${i(a) ?? ""})`), N.disabled = i(r) === 0, R(j, `${i(r) + 1} - ${H ?? ""} / ${i(a) ?? ""}`), J.disabled = i(r) + n >= i(a);
    },
    [() => Math.min(i(r) + n, i(a))]
  ), D(e, m), it();
}
ps(["click"]);
var Ll = /* @__PURE__ */ C('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), Hl = /* @__PURE__ */ C('<span class="term-badge svelte-6rw159"> </span>'), $l = /* @__PURE__ */ C('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">TF-IDF 統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総語彙数 (Terms)</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">インデックス済みエントリ</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">関連エントリ計算済み</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">総関連ペア数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">平均類似度スコア</th><td class="svelte-6rw159"> </td></tr></tbody></table></div> <div style="margin-top: 10px;" class="svelte-6rw159"><h4 class="svelte-6rw159">頻出単語 (Top 20 DF)</h4> <div class="top-terms svelte-6rw159"></div></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">画像統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総画像数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">未インデックス画像数</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), Yl = /* @__PURE__ */ C('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function jl(e, t) {
  nt(t, !0);
  let s = /* @__PURE__ */ L(null);
  async function r() {
    try {
      S(s, await ie.get("/admin/api/info"), !0);
    } catch (u) {
      console.error(u);
    }
  }
  Rt(r);
  function n(u) {
    if (u === 0) return "0 B";
    const h = 1024, g = ["B", "KB", "MB", "GB", "TB"], p = Math.floor(Math.log(u) / Math.log(h));
    return parseFloat((u / Math.pow(h, p)).toFixed(2)) + " " + g[p];
  }
  var a = Yl(), l = d(c(a), 2);
  {
    var v = (u) => {
      var h = Ll();
      D(u, h);
    }, o = (u) => {
      var h = yt(), g = je(h);
      {
        var p = (m) => {
          var P = $l(), w = c(P), f = d(c(w), 2), b = c(f), I = c(b), F = c(I), N = d(c(F)), E = c(N), j = d(F), J = d(c(j)), O = c(J), G = d(j), T = d(c(G)), y = c(T), M = d(G), B = d(c(M)), x = c(B), Y = d(M), ae = d(c(Y)), re = c(ae), _e = d(f, 2), ve = d(c(_e), 2);
          Me(ve, 21, () => i(s).tfidf_stats?.top_terms ?? [], Re, (Wt, bt) => {
            var Ge = Hl(), vt = c(Ge);
            z(() => {
              Ee(Ge, "title", `DF: ${i(bt).df ?? ""}`), R(vt, i(bt).term);
            }), D(Wt, Ge);
          });
          var he = d(w, 2), H = d(c(he), 2), Q = c(H), q = c(Q), ee = c(q), ce = d(c(ee)), se = c(ce), X = d(ee), V = d(c(X)), le = c(V), ue = d(he, 2), me = d(c(ue), 2), _ = c(me), k = c(_), $ = c(k), Z = d(c($)), oe = c(Z), ge = d($), Se = d(c(ge)), Ue = c(Se), Ne = c(Ue), ot = d(ue, 2), ct = d(c(ot), 2), It = c(ct), Kt = c(It), ms = c(Kt), gs = d(c(ms)), Xs = c(gs), bs = d(ms), ws = d(c(bs)), ys = c(ws), Ot = d(bs), xs = d(c(Ot)), ks = c(xs), Ct = d(Ot), Ms = d(c(Ct)), Ss = c(Ms), Nt = d(Ct), Ds = d(c(Nt)), Vs = c(Ds), Lt = d(Nt), Es = d(c(Lt)), Ks = c(Es), Gt = d(Lt), Ht = d(c(Gt)), Gs = c(Ht), Ws = d(Gt), Zs = d(c(Ws)), Qs = c(Zs), er = d(ot, 2), tr = d(c(er), 2), Ts = c(tr);
          z(
            (Wt, bt, Ge, vt, sr, Zt) => {
              R(E, i(s).tfidf_stats?.total_terms ?? 0), R(O, i(s).tfidf_stats?.indexed_entries ?? 0), R(y, i(s).tfidf_stats?.entries_with_related ?? 0), R(x, i(s).tfidf_stats?.total_related_pairs ?? 0), R(re, Wt), R(se, i(s).image_stats?.total_images ?? 0), R(le, i(s).image_stats?.unindexed_images ?? 0), R(oe, i(s).is_development), R(Ne, i(s).app_hash), R(Xs, i(s).debug_info.go_version), R(ys, i(s).debug_info.num_goroutine), R(ks, bt), R(Ss, i(s).debug_info.uptime), R(Vs, Ge), R(Ks, vt), R(Gs, sr), R(Qs, i(s).debug_info.num_gc), R(Ts, Zt);
            },
            [
              () => i(s).tfidf_stats?.avg_score?.toFixed(4) ?? "0.0000",
              () => new Date(i(s).debug_info.start_time).toLocaleString(),
              () => n(i(s).debug_info.mem_alloc),
              () => n(i(s).debug_info.mem_total_alloc),
              () => n(i(s).debug_info.mem_sys),
              () => JSON.stringify(i(s).config, null, 2)
            ]
          ), D(m, P);
        };
        ne(
          g,
          (m) => {
            i(s) && m(p);
          },
          !0
        );
      }
      D(u, h);
    };
    ne(l, (u) => {
      ie.loading && !i(s) ? u(v) : u(o, !1);
    });
  }
  D(e, a), it();
}
var ql = /* @__PURE__ */ C("<a> </a>"), Bl = /* @__PURE__ */ C('<div class="admin-app svelte-1n46o8q"><header><div class="header-left svelte-1n46o8q"><h1 class="svelte-1n46o8q"><a href="/admin/" class="svelte-1n46o8q"><img src="/images/hanrangen-icon.svg" alt="Hanrangon" class="logo svelte-1n46o8q"/></a></h1> <div class="ci-badge svelte-1n46o8q"><a href="https://github.com/cho45/Hanrangon/actions/workflows/ci.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/ci.yml?branch=main&amp;label=ci&amp;style=flat-square" alt="CI Status" class="svelte-1n46o8q"/></a> <a href="https://github.com/cho45/Hanrangon/actions/workflows/lint.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/lint.yml?branch=main&amp;label=lint&amp;style=flat-square" alt="Lint Status" class="svelte-1n46o8q"/></a></div></div> <nav class="main-nav svelte-1n46o8q"><ul class="svelte-1n46o8q"><li><a href="/" class="svelte-1n46o8q">サイト確認</a></li> <li><a href="/logout" class="svelte-1n46o8q">ログアウト</a></li></ul></nav></header> <nav></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function Ul(e, t) {
  nt(t, !0);
  let s = /* @__PURE__ */ L(ye(window.location.pathname)), r = /* @__PURE__ */ L(ye(new URLSearchParams(window.location.search)));
  Rt(() => {
    const f = () => {
      S(s, window.location.pathname, !0), S(r, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", f), () => window.removeEventListener("popstate", f);
  });
  function n(f, b) {
    b && b.preventDefault(), window.history.pushState({}, "", f), S(s, window.location.pathname, !0), S(r, new URLSearchParams(window.location.search), !0);
  }
  const a = {
    "/admin/edit": {
      component: el,
      page: "edit",
      getProps: (f) => ({ id: f, onSave: (b) => window.location.href = b })
    },
    "/admin/jobs": { component: cl, page: "jobs", getProps: () => ({}) },
    "/admin/images": { component: Nl, page: "images", getProps: () => ({}) },
    "/admin/info": { component: jl, page: "info", getProps: () => ({}) },
    "/admin/": {
      component: Hi,
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
  ], v = /* @__PURE__ */ dt(() => {
    const f = i(r).get("id"), b = a[i(s)] ?? a["/admin/"];
    return {
      ...b,
      props: b.getProps(f),
      isActive: (I) => !(I.page !== b.page || I.exact && f)
    };
  }), o = /* @__PURE__ */ dt(() => window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  var u = Bl(), h = c(u);
  let g;
  var p = d(h, 2);
  let m;
  Me(p, 21, () => l, Re, (f, b) => {
    var I = ql();
    I.__click = (E) => n(i(b).path, E);
    let F;
    var N = c(I);
    z(
      (E) => {
        Ee(I, "href", i(b).path), F = qe(I, 1, "svelte-1n46o8q", null, F, E), R(N, i(b).label);
      },
      [() => ({ active: i(v).isActive(i(b)) })]
    ), D(f, I);
  });
  var P = d(p, 2), w = c(P);
  di(w, () => i(v).component, (f, b) => {
    b(f, Mi(() => i(v).props));
  }), z(() => {
    g = qe(h, 1, "svelte-1n46o8q", null, g, { "is-localhost": i(o) }), m = qe(p, 1, "sub-nav svelte-1n46o8q", null, m, { "is-localhost": i(o) });
  }), D(e, u), it();
}
ps(["click"]);
const dr = document.getElementById("admin-root");
dr && (dr.innerHTML = "", li(Ul, { target: dr }));
//# sourceMappingURL=admin-front.js.map
