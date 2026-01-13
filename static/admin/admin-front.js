var Or = Array.isArray, un = Array.prototype.indexOf, ir = Array.from, cn = Object.defineProperty, ft = Object.getOwnPropertyDescriptor, vn = Object.getOwnPropertyDescriptors, fn = Object.prototype, dn = Array.prototype, is = Object.getPrototypeOf, Jr = Object.isExtensible;
function Nt(e) {
  return typeof e == "function";
}
const lr = () => {
};
function hn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ls() {
  var e, t, r = new Promise((s, a) => {
    e = s, t = a;
  });
  return { promise: r, resolve: e, reject: t };
}
function os(e, t, r = !1) {
  return e === void 0 ? r ? (
    /** @type {() => V} */
    t()
  ) : (
    /** @type {V} */
    t
  ) : e;
}
const ce = 2, Ir = 4, Rr = 8, _n = 1 << 24, We = 16, Ze = 32, yt = 64, or = 128, He = 512, fe = 1024, De = 2048, Be = 4096, Se = 8192, at = 16384, Nr = 32768, gt = 65536, Xr = 1 << 17, us = 1 << 18, Ft = 1 << 19, pn = 1 << 20, Ge = 1 << 25, mt = 32768, Dr = 1 << 21, Cr = 1 << 22, it = 1 << 23, dt = /* @__PURE__ */ Symbol("$state"), gn = /* @__PURE__ */ Symbol("legacy props"), mn = /* @__PURE__ */ Symbol(""), St = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function bn(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function wn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function yn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function xn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Mn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function kn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Sn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function En() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Dn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Tn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const An = 1, Fn = 2, cs = 4, Pn = 8, On = 16, In = 1, Rn = 2, ve = /* @__PURE__ */ Symbol(), Nn = "http://www.w3.org/1999/xhtml";
function Cn() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Ln() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function vs(e) {
  return e === this.v;
}
function Hn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function fs(e) {
  return !Hn(e, this.v);
}
let Te = null;
function Dt(e) {
  Te = e;
}
function Qe(e, t = !1, r) {
  Te = {
    p: Te,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function et(e) {
  var t = (
    /** @type {ComponentContext} */
    Te
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var s of r)
      Ts(s);
  }
  return t.i = !0, Te = t.p, /** @type {T} */
  {};
}
function ds() {
  return !0;
}
let vt = [];
function hs() {
  var e = vt;
  vt = [], hn(e);
}
function Pt(e) {
  if (vt.length === 0 && !Yt) {
    var t = vt;
    queueMicrotask(() => {
      t === vt && hs();
    });
  }
  vt.push(e);
}
function Yn() {
  for (; vt.length > 0; )
    hs();
}
function _s(e) {
  var t = ee;
  if (t === null)
    return J.f |= it, e;
  if ((t.f & Nr) === 0) {
    if ((t.f & or) === 0)
      throw e;
    t.b.error(e);
  } else
    Tt(e, t);
}
function Tt(e, t) {
  for (; t !== null; ) {
    if ((t.f & or) !== 0)
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
const Qt = /* @__PURE__ */ new Set();
let X = null, Ht = null, Ie = null, Pe = [], ur = null, Tr = !1, Yt = !1;
class qe {
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
  #s = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #r = 0;
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
  #a = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #n = /* @__PURE__ */ new Set();
  /**
   * A set of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`
   * @type {Set<Effect>}
   */
  skipped_effects = /* @__PURE__ */ new Set();
  is_fork = !1;
  is_deferred() {
    return this.is_fork || this.#r > 0;
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    Pe = [], Ht = null, this.apply();
    var r = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const s of t)
      this.#i(s, r);
    this.is_fork || this.#c(), this.is_deferred() ? (this.#l(r.effects), this.#l(r.render_effects)) : (Ht = this, X = null, Gr(r.render_effects), Gr(r.effects), Ht = null, this.#o?.resolve()), Ie = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {EffectTarget} target
   */
  #i(t, r) {
    t.f ^= fe;
    for (var s = t.first; s !== null; ) {
      var a = s.f, n = (a & (Ze | yt)) !== 0, l = n && (a & fe) !== 0, c = l || (a & Se) !== 0 || this.skipped_effects.has(s);
      if ((s.f & or) !== 0 && s.b?.is_pending() && (r = {
        parent: r,
        effect: s,
        effects: [],
        render_effects: []
      }), !c && s.fn !== null) {
        n ? s.f ^= fe : (a & Ir) !== 0 ? r.effects.push(s) : Xt(s) && ((s.f & We) !== 0 && this.#a.add(s), Ut(s));
        var o = s.first;
        if (o !== null) {
          s = o;
          continue;
        }
      }
      var f = s.parent;
      for (s = s.next; s === null && f !== null; )
        f === r.effect && (this.#l(r.effects), this.#l(r.render_effects), r = /** @type {EffectTarget} */
        r.parent), s = f.next, f = f.parent;
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #l(t) {
    for (const r of t)
      (r.f & De) !== 0 ? this.#a.add(r) : (r.f & Be) !== 0 && this.#n.add(r), this.#u(r.deps), de(r, fe);
  }
  /**
   * @param {Value[] | null} deps
   */
  #u(t) {
    if (t !== null)
      for (const r of t)
        (r.f & ce) === 0 || (r.f & mt) === 0 || (r.f ^= mt, this.#u(
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
    this.previous.has(t) || this.previous.set(t, r), (t.f & it) === 0 && (this.current.set(t, t.v), Ie?.set(t, t.v));
  }
  activate() {
    X = this, this.apply();
  }
  deactivate() {
    X === this && (X = null, Ie = null);
  }
  flush() {
    if (this.activate(), Pe.length > 0) {
      if (ps(), X !== null && X !== this)
        return;
    } else this.#s === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of this.#t) t(this);
    this.#t.clear();
  }
  #c() {
    if (this.#r === 0) {
      for (const t of this.#e) t();
      this.#e.clear();
    }
    this.#s === 0 && this.#v();
  }
  #v() {
    if (Qt.size > 1) {
      this.previous.clear();
      var t = Ie, r = !0, s = {
        parent: null,
        effect: null,
        effects: [],
        render_effects: []
      };
      for (const n of Qt) {
        if (n === this) {
          r = !1;
          continue;
        }
        const l = [];
        for (const [o, f] of this.current) {
          if (n.current.has(o))
            if (r && f !== n.current.get(o))
              n.current.set(o, f);
            else
              continue;
          l.push(o);
        }
        if (l.length === 0)
          continue;
        const c = [...n.current.keys()].filter((o) => !this.current.has(o));
        if (c.length > 0) {
          var a = Pe;
          Pe = [];
          const o = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
          for (const d of l)
            gs(d, c, o, f);
          if (Pe.length > 0) {
            X = n, n.apply();
            for (const d of Pe)
              n.#i(d, s);
            n.deactivate();
          }
          Pe = a;
        }
      }
      X = null, Ie = t;
    }
    this.committed = !0, Qt.delete(this);
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    this.#s += 1, t && (this.#r += 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    this.#s -= 1, t && (this.#r -= 1), this.revive();
  }
  revive() {
    for (const t of this.#a)
      this.#n.delete(t), de(t, De), bt(t);
    for (const t of this.#n)
      de(t, Be), bt(t);
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
    return (this.#o ??= ls()).promise;
  }
  static ensure() {
    if (X === null) {
      const t = X = new qe();
      Qt.add(X), Yt || qe.enqueue(() => {
        X === t && t.flush();
      });
    }
    return X;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    Pt(t);
  }
  apply() {
  }
}
function qn(e) {
  var t = Yt;
  Yt = !0;
  try {
    for (var r; ; ) {
      if (Yn(), Pe.length === 0 && (X?.flush(), Pe.length === 0))
        return ur = null, /** @type {T} */
        r;
      ps();
    }
  } finally {
    Yt = t;
  }
}
function ps() {
  var e = _t;
  Tr = !0;
  var t = null;
  try {
    var r = 0;
    for (sr(!0); Pe.length > 0; ) {
      var s = qe.ensure();
      if (r++ > 1e3) {
        var a, n;
        jn();
      }
      s.process(Pe), lt.clear();
    }
  } finally {
    Tr = !1, sr(e), ur = null;
  }
}
function jn() {
  try {
    kn();
  } catch (e) {
    Tt(e, ur);
  }
}
let Xe = null;
function Gr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var s = e[r++];
      if ((s.f & (at | Se)) === 0 && Xt(s) && (Xe = /* @__PURE__ */ new Set(), Ut(s), s.deps === null && s.first === null && s.nodes === null && (s.teardown === null && s.ac === null ? Os(s) : s.fn = null), Xe?.size > 0)) {
        lt.clear();
        for (const a of Xe) {
          if ((a.f & (at | Se)) !== 0) continue;
          const n = [a];
          let l = a.parent;
          for (; l !== null; )
            Xe.has(l) && (Xe.delete(l), n.push(l)), l = l.parent;
          for (let c = n.length - 1; c >= 0; c--) {
            const o = n[c];
            (o.f & (at | Se)) === 0 && Ut(o);
          }
        }
        Xe.clear();
      }
    }
    Xe = null;
  }
}
function gs(e, t, r, s) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const n = a.f;
      (n & ce) !== 0 ? gs(
        /** @type {Derived} */
        a,
        t,
        r,
        s
      ) : (n & (Cr | We)) !== 0 && (n & De) === 0 && ms(a, t, s) && (de(a, De), bt(
        /** @type {Effect} */
        a
      ));
    }
}
function ms(e, t, r) {
  const s = r.get(e);
  if (s !== void 0) return s;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (t.includes(a))
        return !0;
      if ((a.f & ce) !== 0 && ms(
        /** @type {Derived} */
        a,
        t,
        r
      ))
        return r.set(
          /** @type {Derived} */
          a,
          !0
        ), !0;
    }
  return r.set(e, !1), !1;
}
function bt(e) {
  for (var t = ur = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Tr && t === ee && (r & We) !== 0 && (r & us) === 0)
      return;
    if ((r & (yt | Ze)) !== 0) {
      if ((r & fe) === 0) return;
      t.f ^= fe;
    }
  }
  Pe.push(t);
}
function $n(e) {
  let t = 0, r = wt(0), s;
  return () => {
    Bt() && (i(r), vr(() => (t === 0 && (s = Gt(() => e(() => qt(r)))), t += 1, () => {
      Pt(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, qt(r));
      });
    })));
  };
}
var Bn = gt | Ft | or;
function zn(e, t, r) {
  new Un(e, t, r);
}
class Un {
  /** @type {Boundary | null} */
  parent;
  #e = !1;
  /** @type {TemplateNode} */
  #t;
  /** @type {TemplateNode | null} */
  #s = null;
  /** @type {BoundaryProps} */
  #r;
  /** @type {((anchor: Node) => void)} */
  #o;
  /** @type {Effect} */
  #a;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #i = null;
  /** @type {Effect | null} */
  #l = null;
  /** @type {DocumentFragment | null} */
  #u = null;
  /** @type {TemplateNode | null} */
  #c = null;
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
  #b = $n(() => (this.#d = wt(this.#v), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, s) {
    this.#t = t, this.#r = r, this.#o = s, this.parent = /** @type {Effect} */
    ee.b, this.#e = !!this.#r.pending, this.#a = fr(() => {
      ee.b = this;
      {
        var a = this.#g();
        try {
          this.#n = Oe(() => s(a));
        } catch (n) {
          this.error(n);
        }
        this.#f > 0 ? this.#p() : this.#e = !1;
      }
      return () => {
        this.#c?.remove();
      };
    }, Bn);
  }
  #w() {
    try {
      this.#n = Oe(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
    this.#e = !1;
  }
  #y() {
    const t = this.#r.pending;
    t && (this.#i = Oe(() => t(this.#t)), qe.enqueue(() => {
      var r = this.#g();
      this.#n = this.#_(() => (qe.ensure(), Oe(() => this.#o(r)))), this.#f > 0 ? this.#p() : (ht(
        /** @type {Effect} */
        this.#i,
        () => {
          this.#i = null;
        }
      ), this.#e = !1);
    }));
  }
  #g() {
    var t = this.#t;
    return this.#e && (this.#c = Ve(), this.#t.before(this.#c), t = this.#c), t;
  }
  /**
   * Returns `true` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_pending() {
    return this.#e || !!this.parent && this.parent.is_pending();
  }
  has_pending_snippet() {
    return !!this.#r.pending;
  }
  /**
   * @param {() => Effect | null} fn
   */
  #_(t) {
    var r = ee, s = J, a = Te;
    ze(this.#a), ye(this.#a), Dt(this.#a.ctx);
    try {
      return t();
    } catch (n) {
      return _s(n), null;
    } finally {
      ze(r), ye(s), Dt(a);
    }
  }
  #p() {
    const t = (
      /** @type {(anchor: Node) => void} */
      this.#r.pending
    );
    this.#n !== null && (this.#u = document.createDocumentFragment(), this.#u.append(
      /** @type {TemplateNode} */
      this.#c
    ), Ns(this.#n, this.#u)), this.#i === null && (this.#i = Oe(() => t(this.#t)));
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   */
  #m(t) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#m(t);
      return;
    }
    this.#f += t, this.#f === 0 && (this.#e = !1, this.#i && ht(this.#i, () => {
      this.#i = null;
    }), this.#u && (this.#t.before(this.#u), this.#u = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    this.#m(t), this.#v += t, this.#d && At(this.#d, this.#v);
  }
  get_effect_pending() {
    return this.#b(), i(
      /** @type {Source<number>} */
      this.#d
    );
  }
  /** @param {unknown} error */
  error(t) {
    var r = this.#r.onerror;
    let s = this.#r.failed;
    if (this.#h || !r && !s)
      throw t;
    this.#n && (xe(this.#n), this.#n = null), this.#i && (xe(this.#i), this.#i = null), this.#l && (xe(this.#l), this.#l = null);
    var a = !1, n = !1;
    const l = () => {
      if (a) {
        Ln();
        return;
      }
      a = !0, n && Tn(), qe.ensure(), this.#v = 0, this.#l !== null && ht(this.#l, () => {
        this.#l = null;
      }), this.#e = this.has_pending_snippet(), this.#n = this.#_(() => (this.#h = !1, Oe(() => this.#o(this.#t)))), this.#f > 0 ? this.#p() : this.#e = !1;
    };
    var c = J;
    try {
      ye(null), n = !0, r?.(t, l), n = !1;
    } catch (o) {
      Tt(o, this.#a && this.#a.parent);
    } finally {
      ye(c);
    }
    s && Pt(() => {
      this.#l = this.#_(() => {
        qe.ensure(), this.#h = !0;
        try {
          return Oe(() => {
            s(
              this.#t,
              () => t,
              () => l
            );
          });
        } catch (o) {
          return Tt(
            o,
            /** @type {Effect} */
            this.#a.parent
          ), null;
        } finally {
          this.#h = !1;
        }
      });
    });
  }
}
function Jn(e, t, r, s) {
  const a = Lr;
  if (r.length === 0 && e.length === 0) {
    s(t.map(a));
    return;
  }
  var n = X, l = (
    /** @type {Effect} */
    ee
  ), c = Xn();
  function o() {
    Promise.all(r.map((f) => /* @__PURE__ */ Gn(f))).then((f) => {
      c();
      try {
        s([...t.map(a), ...f]);
      } catch (d) {
        (l.f & at) === 0 && Tt(d, l);
      }
      n?.deactivate(), tr();
    }).catch((f) => {
      Tt(f, l);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    c();
    try {
      return o();
    } finally {
      n?.deactivate(), tr();
    }
  }) : o();
}
function Xn() {
  var e = ee, t = J, r = Te, s = X;
  return function(n = !0) {
    ze(e), ye(t), Dt(r), n && s?.activate();
  };
}
function tr() {
  ze(null), ye(null), Dt(null);
}
// @__NO_SIDE_EFFECTS__
function Lr(e) {
  var t = ce | De, r = J !== null && (J.f & ce) !== 0 ? (
    /** @type {Derived} */
    J
  ) : null;
  return ee !== null && (ee.f |= Ft), {
    ctx: Te,
    deps: null,
    effects: null,
    equals: vs,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ve
    ),
    wv: 0,
    parent: r ?? ee,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Gn(e, t) {
  let r = (
    /** @type {Effect | null} */
    ee
  );
  r === null && wn();
  var s = (
    /** @type {Boundary} */
    r.b
  ), a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), n = wt(
    /** @type {V} */
    ve
  ), l = !J, c = /* @__PURE__ */ new Map();
  return aa(() => {
    var o = ls();
    a = o.promise;
    try {
      Promise.resolve(e()).then(o.resolve, o.reject).then(() => {
        f === X && f.committed && f.deactivate(), tr();
      });
    } catch (_) {
      o.reject(_), tr();
    }
    var f = (
      /** @type {Batch} */
      X
    );
    if (l) {
      var d = !s.is_pending();
      s.update_pending_count(1), f.increment(d), c.get(f)?.reject(St), c.delete(f), c.set(f, o);
    }
    const m = (_, p = void 0) => {
      if (f.activate(), p)
        p !== St && (n.f |= it, At(n, p));
      else {
        (n.f & it) !== 0 && (n.f ^= it), At(n, _);
        for (const [E, w] of c) {
          if (c.delete(E), E === f) break;
          w.reject(St);
        }
      }
      l && (s.update_pending_count(-1), f.decrement(d));
    };
    o.promise.then(m, (_) => m(null, _ || "unknown"));
  }), jr(() => {
    for (const o of c.values())
      o.reject(St);
  }), new Promise((o) => {
    function f(d) {
      function m() {
        d === a ? o(n) : f(a);
      }
      d.then(m, m);
    }
    f(a);
  });
}
// @__NO_SIDE_EFFECTS__
function nt(e) {
  const t = /* @__PURE__ */ Lr(e);
  return Cs(t), t;
}
// @__NO_SIDE_EFFECTS__
function Hr(e) {
  const t = /* @__PURE__ */ Lr(e);
  return t.equals = fs, t;
}
function bs(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      xe(
        /** @type {Effect} */
        t[r]
      );
  }
}
function Vn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & ce) === 0)
      return (t.f & at) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Yr(e) {
  var t, r = ee;
  ze(Vn(e));
  try {
    e.f &= ~mt, bs(e), t = qs(e);
  } finally {
    ze(r);
  }
  return t;
}
function ws(e) {
  var t = Yr(e);
  if (e.equals(t) || (X?.is_fork || (e.v = t), e.wv = Hs()), !Ot)
    if (Ie !== null)
      (Bt() || X?.is_fork) && Ie.set(e, t);
    else {
      var r = (e.f & He) === 0 ? Be : fe;
      de(e, r);
    }
}
let Ar = /* @__PURE__ */ new Set();
const lt = /* @__PURE__ */ new Map();
let ys = !1;
function wt(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: vs,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function Y(e, t) {
  const r = wt(e);
  return Cs(r), r;
}
// @__NO_SIDE_EFFECTS__
function Kn(e, t = !1, r = !0) {
  const s = wt(e);
  return t || (s.equals = fs), s;
}
function T(e, t, r = !1) {
  J !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!je || (J.f & Xr) !== 0) && ds() && (J.f & (ce | We | Cr | Xr)) !== 0 && !Ke?.includes(e) && Dn();
  let s = r ? we(t) : t;
  return At(e, s);
}
function At(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Ot ? lt.set(e, t) : lt.set(e, r), e.v = t;
    var s = qe.ensure();
    s.capture(e, r), (e.f & ce) !== 0 && ((e.f & De) !== 0 && Yr(
      /** @type {Derived} */
      e
    ), de(e, (e.f & He) !== 0 ? fe : Be)), e.wv = Hs(), xs(e, De), ee !== null && (ee.f & fe) !== 0 && (ee.f & (Ze | yt)) === 0 && (Fe === null ? oa([e]) : Fe.push(e)), !s.is_fork && Ar.size > 0 && !ys && Wn();
  }
  return t;
}
function Wn() {
  ys = !1;
  var e = _t;
  sr(!0);
  const t = Array.from(Ar);
  try {
    for (const r of t)
      (r.f & fe) !== 0 && de(r, Be), Xt(r) && Ut(r);
  } finally {
    sr(e);
  }
  Ar.clear();
}
function qt(e) {
  T(e, e.v + 1);
}
function xs(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, a = 0; a < s; a++) {
      var n = r[a], l = n.f, c = (l & De) === 0;
      if (c && de(n, t), (l & ce) !== 0) {
        var o = (
          /** @type {Derived} */
          n
        );
        Ie?.delete(o), (l & mt) === 0 && (l & He && (n.f |= mt), xs(o, Be));
      } else c && ((l & We) !== 0 && Xe !== null && Xe.add(
        /** @type {Effect} */
        n
      ), bt(
        /** @type {Effect} */
        n
      ));
    }
}
function we(e) {
  if (typeof e != "object" || e === null || dt in e)
    return e;
  const t = is(e);
  if (t !== fn && t !== dn)
    return e;
  var r = /* @__PURE__ */ new Map(), s = Or(e), a = /* @__PURE__ */ Y(0), n = pt, l = (c) => {
    if (pt === n)
      return c();
    var o = J, f = pt;
    ye(null), Qr(n);
    var d = c();
    return ye(o), Qr(f), d;
  };
  return s && r.set("length", /* @__PURE__ */ Y(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(c, o, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && Sn();
        var d = r.get(o);
        return d === void 0 ? d = l(() => {
          var m = /* @__PURE__ */ Y(f.value);
          return r.set(o, m), m;
        }) : T(d, f.value, !0), !0;
      },
      deleteProperty(c, o) {
        var f = r.get(o);
        if (f === void 0) {
          if (o in c) {
            const d = l(() => /* @__PURE__ */ Y(ve));
            r.set(o, d), qt(a);
          }
        } else
          T(f, ve), qt(a);
        return !0;
      },
      get(c, o, f) {
        if (o === dt)
          return e;
        var d = r.get(o), m = o in c;
        if (d === void 0 && (!m || ft(c, o)?.writable) && (d = l(() => {
          var p = we(m ? c[o] : ve), E = /* @__PURE__ */ Y(p);
          return E;
        }), r.set(o, d)), d !== void 0) {
          var _ = i(d);
          return _ === ve ? void 0 : _;
        }
        return Reflect.get(c, o, f);
      },
      getOwnPropertyDescriptor(c, o) {
        var f = Reflect.getOwnPropertyDescriptor(c, o);
        if (f && "value" in f) {
          var d = r.get(o);
          d && (f.value = i(d));
        } else if (f === void 0) {
          var m = r.get(o), _ = m?.v;
          if (m !== void 0 && _ !== ve)
            return {
              enumerable: !0,
              configurable: !0,
              value: _,
              writable: !0
            };
        }
        return f;
      },
      has(c, o) {
        if (o === dt)
          return !0;
        var f = r.get(o), d = f !== void 0 && f.v !== ve || Reflect.has(c, o);
        if (f !== void 0 || ee !== null && (!d || ft(c, o)?.writable)) {
          f === void 0 && (f = l(() => {
            var _ = d ? we(c[o]) : ve, p = /* @__PURE__ */ Y(_);
            return p;
          }), r.set(o, f));
          var m = i(f);
          if (m === ve)
            return !1;
        }
        return d;
      },
      set(c, o, f, d) {
        var m = r.get(o), _ = o in c;
        if (s && o === "length")
          for (var p = f; p < /** @type {Source<number>} */
          m.v; p += 1) {
            var E = r.get(p + "");
            E !== void 0 ? T(E, ve) : p in c && (E = l(() => /* @__PURE__ */ Y(ve)), r.set(p + "", E));
          }
        if (m === void 0)
          (!_ || ft(c, o)?.writable) && (m = l(() => /* @__PURE__ */ Y(void 0)), T(m, we(f)), r.set(o, m));
        else {
          _ = m.v !== ve;
          var w = l(() => we(f));
          T(m, w);
        }
        var v = Reflect.getOwnPropertyDescriptor(c, o);
        if (v?.set && v.set.call(d, f), !_) {
          if (s && typeof o == "string") {
            var g = (
              /** @type {Source<number>} */
              r.get("length")
            ), R = Number(o);
            Number.isInteger(R) && R >= g.v && T(g, R + 1);
          }
          qt(a);
        }
        return !0;
      },
      ownKeys(c) {
        i(a);
        var o = Reflect.ownKeys(c).filter((m) => {
          var _ = r.get(m);
          return _ === void 0 || _.v !== ve;
        });
        for (var [f, d] of r)
          d.v !== ve && !(f in c) && o.push(f);
        return o;
      },
      setPrototypeOf() {
        En();
      }
    }
  );
}
function Vr(e) {
  try {
    if (e !== null && typeof e == "object" && dt in e)
      return e[dt];
  } catch {
  }
  return e;
}
function Zn(e, t) {
  return Object.is(Vr(e), Vr(t));
}
var Kr, Ms, ks, Ss;
function Qn() {
  if (Kr === void 0) {
    Kr = window, Ms = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    ks = ft(t, "firstChild").get, Ss = ft(t, "nextSibling").get, Jr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Jr(r) && (r.__t = void 0);
  }
}
function Ve(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function rr(e) {
  return (
    /** @type {TemplateNode | null} */
    ks.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Jt(e) {
  return (
    /** @type {TemplateNode | null} */
    Ss.call(e)
  );
}
function u(e, t) {
  return /* @__PURE__ */ rr(e);
}
function ot(e, t = !1) {
  {
    var r = /* @__PURE__ */ rr(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ Jt(r) : r;
  }
}
function h(e, t = 1, r = !1) {
  let s = e;
  for (; t--; )
    s = /** @type {TemplateNode} */
    /* @__PURE__ */ Jt(s);
  return s;
}
function ea(e) {
  e.textContent = "";
}
function Es() {
  return !1;
}
let Wr = !1;
function ta() {
  Wr || (Wr = !0, document.addEventListener(
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
function cr(e) {
  var t = J, r = ee;
  ye(null), ze(null);
  try {
    return e();
  } finally {
    ye(t), ze(r);
  }
}
function qr(e, t, r, s = r) {
  e.addEventListener(t, () => cr(r));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), s(!0);
  } : e.__on_r = () => s(!0), ta();
}
function ra(e) {
  ee === null && (J === null && Mn(), xn()), Ot && yn();
}
function sa(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function tt(e, t, r) {
  var s = ee;
  s !== null && (s.f & Se) !== 0 && (e |= Se);
  var a = {
    ctx: Te,
    deps: null,
    nodes: null,
    f: e | De | He,
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
  };
  if (r)
    try {
      Ut(a), a.f |= Nr;
    } catch (c) {
      throw xe(a), c;
    }
  else t !== null && bt(a);
  var n = a;
  if (r && n.deps === null && n.teardown === null && n.nodes === null && n.first === n.last && // either `null`, or a singular child
  (n.f & Ft) === 0 && (n = n.first, (e & We) !== 0 && (e & gt) !== 0 && n !== null && (n.f |= gt)), n !== null && (n.parent = s, s !== null && sa(n, s), J !== null && (J.f & ce) !== 0 && (e & yt) === 0)) {
    var l = (
      /** @type {Derived} */
      J
    );
    (l.effects ??= []).push(n);
  }
  return a;
}
function Bt() {
  return J !== null && !je;
}
function jr(e) {
  const t = tt(Rr, null, !1);
  return de(t, fe), t.teardown = e, t;
}
function Ds(e) {
  ra();
  var t = (
    /** @type {Effect} */
    ee.f
  ), r = !J && (t & Ze) !== 0 && (t & Nr) === 0;
  if (r) {
    var s = (
      /** @type {ComponentContext} */
      Te
    );
    (s.e ??= []).push(e);
  } else
    return Ts(e);
}
function Ts(e) {
  return tt(Ir | pn, e, !1);
}
function na(e) {
  qe.ensure();
  const t = tt(yt | Ft, e, !0);
  return (r = {}) => new Promise((s) => {
    r.outro ? ht(t, () => {
      xe(t), s(void 0);
    }) : (xe(t), s(void 0));
  });
}
function As(e) {
  return tt(Ir, e, !1);
}
function aa(e) {
  return tt(Cr | Ft, e, !0);
}
function vr(e, t = 0) {
  return tt(Rr | t, e, !0);
}
function W(e, t = [], r = [], s = []) {
  Jn(s, t, r, (a) => {
    tt(Rr, () => e(...a.map(i)), !0);
  });
}
function fr(e, t = 0) {
  var r = tt(We | t, e, !0);
  return r;
}
function Oe(e) {
  return tt(Ze | Ft, e, !0);
}
function Fs(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Ot, s = J;
    Zr(!0), ye(null);
    try {
      t.call(null);
    } finally {
      Zr(r), ye(s);
    }
  }
}
function Ps(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const a = r.ac;
    a !== null && cr(() => {
      a.abort(St);
    });
    var s = r.next;
    (r.f & yt) !== 0 ? r.parent = null : xe(r, t), r = s;
  }
}
function ia(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & Ze) === 0 && xe(t), t = r;
  }
}
function xe(e, t = !0) {
  var r = !1;
  (t || (e.f & us) !== 0) && e.nodes !== null && e.nodes.end !== null && (la(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), Ps(e, t && !r), nr(e, 0), de(e, at);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const n of s)
      n.stop();
  Fs(e);
  var a = e.parent;
  a !== null && a.first !== null && Os(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function la(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ Jt(e);
    e.remove(), e = r;
  }
}
function Os(e) {
  var t = e.parent, r = e.prev, s = e.next;
  r !== null && (r.next = s), s !== null && (s.prev = r), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = r));
}
function ht(e, t, r = !0) {
  var s = [];
  Is(e, s, !0);
  var a = () => {
    r && xe(e), t && t();
  }, n = s.length;
  if (n > 0) {
    var l = () => --n || a();
    for (var c of s)
      c.out(l);
  } else
    a();
}
function Is(e, t, r) {
  if ((e.f & Se) === 0) {
    e.f ^= Se;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const c of s)
        (c.is_global || r) && t.push(c);
    for (var a = e.first; a !== null; ) {
      var n = a.next, l = (a.f & gt) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (a.f & Ze) !== 0 && (e.f & We) !== 0;
      Is(a, t, l ? r : !1), a = n;
    }
  }
}
function $r(e) {
  Rs(e, !0);
}
function Rs(e, t) {
  if ((e.f & Se) !== 0) {
    e.f ^= Se, (e.f & fe) === 0 && (de(e, De), bt(e));
    for (var r = e.first; r !== null; ) {
      var s = r.next, a = (r.f & gt) !== 0 || (r.f & Ze) !== 0;
      Rs(r, a ? t : !1), r = s;
    }
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const l of n)
        (l.is_global || t) && l.in();
  }
}
function Ns(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end; r !== null; ) {
      var a = r === s ? null : /* @__PURE__ */ Jt(r);
      t.append(r), r = a;
    }
}
let _t = !1;
function sr(e) {
  _t = e;
}
let Ot = !1;
function Zr(e) {
  Ot = e;
}
let J = null, je = !1;
function ye(e) {
  J = e;
}
let ee = null;
function ze(e) {
  ee = e;
}
let Ke = null;
function Cs(e) {
  J !== null && (Ke === null ? Ke = [e] : Ke.push(e));
}
let _e = null, ke = 0, Fe = null;
function oa(e) {
  Fe = e;
}
let Ls = 1, zt = 0, pt = zt;
function Qr(e) {
  pt = e;
}
function Hs() {
  return ++Ls;
}
function Xt(e) {
  var t = e.f;
  if ((t & De) !== 0)
    return !0;
  if (t & ce && (e.f &= ~mt), (t & Be) !== 0) {
    var r = e.deps;
    if (r !== null)
      for (var s = r.length, a = 0; a < s; a++) {
        var n = r[a];
        if (Xt(
          /** @type {Derived} */
          n
        ) && ws(
          /** @type {Derived} */
          n
        ), n.wv > e.wv)
          return !0;
      }
    (t & He) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ie === null && de(e, fe);
  }
  return !1;
}
function Ys(e, t, r = !0) {
  var s = e.reactions;
  if (s !== null && !Ke?.includes(e))
    for (var a = 0; a < s.length; a++) {
      var n = s[a];
      (n.f & ce) !== 0 ? Ys(
        /** @type {Derived} */
        n,
        t,
        !1
      ) : t === n && (r ? de(n, De) : (n.f & fe) !== 0 && de(n, Be), bt(
        /** @type {Effect} */
        n
      ));
    }
}
function qs(e) {
  var t = _e, r = ke, s = Fe, a = J, n = Ke, l = Te, c = je, o = pt, f = e.f;
  _e = /** @type {null | Value[]} */
  null, ke = 0, Fe = null, J = (f & (Ze | yt)) === 0 ? e : null, Ke = null, Dt(e.ctx), je = !1, pt = ++zt, e.ac !== null && (cr(() => {
    e.ac.abort(St);
  }), e.ac = null);
  try {
    e.f |= Dr;
    var d = (
      /** @type {Function} */
      e.fn
    ), m = d(), _ = e.deps;
    if (_e !== null) {
      var p;
      if (nr(e, ke), _ !== null && ke > 0)
        for (_.length = ke + _e.length, p = 0; p < _e.length; p++)
          _[ke + p] = _e[p];
      else
        e.deps = _ = _e;
      if (Bt() && (e.f & He) !== 0)
        for (p = ke; p < _.length; p++)
          (_[p].reactions ??= []).push(e);
    } else _ !== null && ke < _.length && (nr(e, ke), _.length = ke);
    if (ds() && Fe !== null && !je && _ !== null && (e.f & (ce | Be | De)) === 0)
      for (p = 0; p < /** @type {Source[]} */
      Fe.length; p++)
        Ys(
          Fe[p],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (zt++, Fe !== null && (s === null ? s = Fe : s.push(.../** @type {Source[]} */
    Fe))), (e.f & it) !== 0 && (e.f ^= it), m;
  } catch (E) {
    return _s(E);
  } finally {
    e.f ^= Dr, _e = t, ke = r, Fe = s, J = a, Ke = n, Dt(l), je = c, pt = o;
  }
}
function ua(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var s = un.call(r, e);
    if (s !== -1) {
      var a = r.length - 1;
      a === 0 ? r = t.reactions = null : (r[s] = r[a], r.pop());
    }
  }
  r === null && (t.f & ce) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (_e === null || !_e.includes(t)) && (de(t, Be), (t.f & He) !== 0 && (t.f ^= He, t.f &= ~mt), bs(
    /** @type {Derived} **/
    t
  ), nr(
    /** @type {Derived} **/
    t,
    0
  ));
}
function nr(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var s = t; s < r.length; s++)
      ua(e, r[s]);
}
function Ut(e) {
  var t = e.f;
  if ((t & at) === 0) {
    de(e, fe);
    var r = ee, s = _t;
    ee = e, _t = !0;
    try {
      (t & (We | _n)) !== 0 ? ia(e) : Ps(e), Fs(e);
      var a = qs(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Ls;
      var n;
    } finally {
      _t = s, ee = r;
    }
  }
}
async function js() {
  await Promise.resolve(), qn();
}
function i(e) {
  var t = e.f, r = (t & ce) !== 0;
  if (J !== null && !je) {
    var s = ee !== null && (ee.f & at) !== 0;
    if (!s && !Ke?.includes(e)) {
      var a = J.deps;
      if ((J.f & Dr) !== 0)
        e.rv < zt && (e.rv = zt, _e === null && a !== null && a[ke] === e ? ke++ : _e === null ? _e = [e] : _e.includes(e) || _e.push(e));
      else {
        (J.deps ??= []).push(e);
        var n = e.reactions;
        n === null ? e.reactions = [J] : n.includes(J) || n.push(J);
      }
    }
  }
  if (Ot) {
    if (lt.has(e))
      return lt.get(e);
    if (r) {
      var l = (
        /** @type {Derived} */
        e
      ), c = l.v;
      return ((l.f & fe) === 0 && l.reactions !== null || Bs(l)) && (c = Yr(l)), lt.set(l, c), c;
    }
  } else r && (!Ie?.has(e) || X?.is_fork && !Bt()) && (l = /** @type {Derived} */
  e, Xt(l) && ws(l), _t && Bt() && (l.f & He) === 0 && $s(l));
  if (Ie?.has(e))
    return Ie.get(e);
  if ((e.f & it) !== 0)
    throw e.v;
  return e.v;
}
function $s(e) {
  if (e.deps !== null) {
    e.f ^= He;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & ce) !== 0 && (t.f & He) === 0 && $s(
        /** @type {Derived} */
        t
      );
  }
}
function Bs(e) {
  if (e.v === ve) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (lt.has(t) || (t.f & ce) !== 0 && Bs(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Gt(e) {
  var t = je;
  try {
    return je = !0, e();
  } finally {
    je = t;
  }
}
const ca = -7169;
function de(e, t) {
  e.f = e.f & ca | t;
}
const va = ["touchstart", "touchmove"];
function fa(e) {
  return va.includes(e);
}
const zs = /* @__PURE__ */ new Set(), Fr = /* @__PURE__ */ new Set();
function da(e, t, r, s = {}) {
  function a(n) {
    if (s.capture || Ct.call(t, n), !n.cancelBubble)
      return cr(() => r?.call(this, n));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Pt(() => {
    t.addEventListener(e, a, s);
  }) : t.addEventListener(e, a, s), a;
}
function ha(e, t, r, s, a) {
  var n = { capture: s, passive: a }, l = da(e, t, r, n);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && jr(() => {
    t.removeEventListener(e, l, n);
  });
}
function Vt(e) {
  for (var t = 0; t < e.length; t++)
    zs.add(e[t]);
  for (var r of Fr)
    r(e);
}
let es = null;
function Ct(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], n = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  es = e;
  var l = 0, c = es === e && e.__root;
  if (c) {
    var o = a.indexOf(c);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var f = a.indexOf(t);
    if (f === -1)
      return;
    o <= f && (l = o);
  }
  if (n = /** @type {Element} */
  a[l] || e.target, n !== t) {
    cn(e, "currentTarget", {
      configurable: !0,
      get() {
        return n || r;
      }
    });
    var d = J, m = ee;
    ye(null), ze(null);
    try {
      for (var _, p = []; n !== null; ) {
        var E = n.assignedSlot || n.parentNode || /** @type {any} */
        n.host || null;
        try {
          var w = n["__" + s];
          w != null && (!/** @type {any} */
          n.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === n) && w.call(n, e);
        } catch (v) {
          _ ? p.push(v) : _ = v;
        }
        if (e.cancelBubble || E === t || E === null)
          break;
        n = E;
      }
      if (_) {
        for (let v of p)
          queueMicrotask(() => {
            throw v;
          });
        throw _;
      }
    } finally {
      e.__root = t, delete e.currentTarget, ye(d), ze(m);
    }
  }
}
function _a(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function ar(e, t) {
  var r = (
    /** @type {Effect} */
    ee
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function O(e, t) {
  var r = (t & In) !== 0, s = (t & Rn) !== 0, a, n = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = _a(n ? e : "<!>" + e), r || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ rr(a)));
    var l = (
      /** @type {TemplateNode} */
      s || Ms ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ rr(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      ar(c, o);
    } else
      ar(l, l);
    return l;
  };
}
function pa(e = "") {
  {
    var t = Ve(e + "");
    return ar(t, t), t;
  }
}
function dr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), r = Ve();
  return e.append(t, r), ar(t, r), e;
}
function D(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function F(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ??= e.nodeValue) && (e.__t = r, e.nodeValue = r + "");
}
function ga(e, t) {
  return ma(e, t);
}
const Mt = /* @__PURE__ */ new Map();
function ma(e, { target: t, anchor: r, props: s = {}, events: a, context: n, intro: l = !0 }) {
  Qn();
  var c = /* @__PURE__ */ new Set(), o = (m) => {
    for (var _ = 0; _ < m.length; _++) {
      var p = m[_];
      if (!c.has(p)) {
        c.add(p);
        var E = fa(p);
        t.addEventListener(p, Ct, { passive: E });
        var w = Mt.get(p);
        w === void 0 ? (document.addEventListener(p, Ct, { passive: E }), Mt.set(p, 1)) : Mt.set(p, w + 1);
      }
    }
  };
  o(ir(zs)), Fr.add(o);
  var f = void 0, d = na(() => {
    var m = r ?? t.appendChild(Ve());
    return zn(
      /** @type {TemplateNode} */
      m,
      {
        pending: () => {
        }
      },
      (_) => {
        if (n) {
          Qe({});
          var p = (
            /** @type {ComponentContext} */
            Te
          );
          p.c = n;
        }
        a && (s.$$events = a), f = e(_, s) || {}, n && et();
      }
    ), () => {
      for (var _ of c) {
        t.removeEventListener(_, Ct);
        var p = (
          /** @type {number} */
          Mt.get(_)
        );
        --p === 0 ? (document.removeEventListener(_, Ct), Mt.delete(_)) : Mt.set(_, p);
      }
      Fr.delete(o), m !== r && m.parentNode?.removeChild(m);
    };
  });
  return ba.set(f, d), f;
}
let ba = /* @__PURE__ */ new WeakMap();
class Us {
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
  #s = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #r = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #o = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, r = !0) {
    this.anchor = t, this.#o = r;
  }
  #a = () => {
    var t = (
      /** @type {Batch} */
      X
    );
    if (this.#e.has(t)) {
      var r = (
        /** @type {Key} */
        this.#e.get(t)
      ), s = this.#t.get(r);
      if (s)
        $r(s), this.#r.delete(r);
      else {
        var a = this.#s.get(r);
        a && (this.#t.set(r, a.effect), this.#s.delete(r), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
      }
      for (const [n, l] of this.#e) {
        if (this.#e.delete(n), n === t)
          break;
        const c = this.#s.get(l);
        c && (xe(c.effect), this.#s.delete(l));
      }
      for (const [n, l] of this.#t) {
        if (n === r || this.#r.has(n)) continue;
        const c = () => {
          if (Array.from(this.#e.values()).includes(n)) {
            var f = document.createDocumentFragment();
            Ns(l, f), f.append(Ve()), this.#s.set(n, { effect: l, fragment: f });
          } else
            xe(l);
          this.#r.delete(n), this.#t.delete(n);
        };
        this.#o || !s ? (this.#r.add(n), ht(l, c, !1)) : c();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    this.#e.delete(t);
    const r = Array.from(this.#e.values());
    for (const [s, a] of this.#s)
      r.includes(s) || (xe(a.effect), this.#s.delete(s));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, r) {
    var s = (
      /** @type {Batch} */
      X
    ), a = Es();
    if (r && !this.#t.has(t) && !this.#s.has(t))
      if (a) {
        var n = document.createDocumentFragment(), l = Ve();
        n.append(l), this.#s.set(t, {
          effect: Oe(() => r(l)),
          fragment: n
        });
      } else
        this.#t.set(
          t,
          Oe(() => r(this.anchor))
        );
    if (this.#e.set(s, t), a) {
      for (const [c, o] of this.#t)
        c === t ? s.skipped_effects.delete(o) : s.skipped_effects.add(o);
      for (const [c, o] of this.#s)
        c === t ? s.skipped_effects.delete(o.effect) : s.skipped_effects.add(o.effect);
      s.oncommit(this.#a), s.ondiscard(this.#n);
    } else
      this.#a();
  }
}
function ie(e, t, r = !1) {
  var s = new Us(e), a = r ? gt : 0;
  function n(l, c) {
    s.ensure(l, c);
  }
  fr(() => {
    var l = !1;
    t((c, o = !0) => {
      l = !0, n(o, c);
    }), l || n(!1, null);
  }, a);
}
function Le(e, t) {
  return t;
}
function wa(e, t, r) {
  for (var s = [], a = t.length, n, l = t.length, c = 0; c < a; c++) {
    let m = t[c];
    ht(
      m,
      () => {
        if (n) {
          if (n.pending.delete(m), n.done.add(m), n.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Pr(ir(n.done)), _.delete(n), _.size === 0 && (e.outrogroups = null);
          }
        } else
          l -= 1;
      },
      !1
    );
  }
  if (l === 0) {
    var o = s.length === 0 && r !== null;
    if (o) {
      var f = (
        /** @type {Element} */
        r
      ), d = (
        /** @type {Element} */
        f.parentNode
      );
      ea(d), d.append(f), e.items.clear();
    }
    Pr(t, !o);
  } else
    n = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(n);
}
function Pr(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    xe(e[r], t);
}
var ts;
function Ee(e, t, r, s, a, n = null) {
  var l = e, c = /* @__PURE__ */ new Map(), o = (t & cs) !== 0;
  if (o) {
    var f = (
      /** @type {Element} */
      e
    );
    l = f.appendChild(Ve());
  }
  var d = null, m = /* @__PURE__ */ Hr(() => {
    var g = r();
    return Or(g) ? g : g == null ? [] : ir(g);
  }), _, p = !0;
  function E() {
    v.fallback = d, ya(v, _, l, t, s), d !== null && (_.length === 0 ? (d.f & Ge) === 0 ? $r(d) : (d.f ^= Ge, Lt(d, null, l)) : ht(d, () => {
      d = null;
    }));
  }
  var w = fr(() => {
    _ = /** @type {V[]} */
    i(m);
    for (var g = _.length, R = /* @__PURE__ */ new Set(), P = (
      /** @type {Batch} */
      X
    ), N = Es(), I = 0; I < g; I += 1) {
      var q = _[I], K = s(q, I), A = p ? null : c.get(K);
      A ? (A.v && At(A.v, q), A.i && At(A.i, I), N && P.skipped_effects.delete(A.e)) : (A = xa(
        c,
        p ? l : ts ??= Ve(),
        q,
        K,
        I,
        a,
        t,
        r
      ), p || (A.e.f |= Ge), c.set(K, A)), R.add(K);
    }
    if (g === 0 && n && !d && (p ? d = Oe(() => n(l)) : (d = Oe(() => n(ts ??= Ve())), d.f |= Ge)), !p)
      if (N) {
        for (const [B, S] of c)
          R.has(B) || P.skipped_effects.add(S.e);
        P.oncommit(E), P.ondiscard(() => {
        });
      } else
        E();
    i(m);
  }), v = { effect: w, items: c, outrogroups: null, fallback: d };
  p = !1;
}
function ya(e, t, r, s, a) {
  var n = (s & Pn) !== 0, l = t.length, c = e.items, o = e.effect.first, f, d = null, m, _ = [], p = [], E, w, v, g;
  if (n)
    for (g = 0; g < l; g += 1)
      E = t[g], w = a(E, g), v = /** @type {EachItem} */
      c.get(w).e, (v.f & Ge) === 0 && (v.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(v));
  for (g = 0; g < l; g += 1) {
    if (E = t[g], w = a(E, g), v = /** @type {EachItem} */
    c.get(w).e, e.outrogroups !== null)
      for (const S of e.outrogroups)
        S.pending.delete(v), S.done.delete(v);
    if ((v.f & Ge) !== 0)
      if (v.f ^= Ge, v === o)
        Lt(v, null, r);
      else {
        var R = d ? d.next : o;
        v === e.effect.last && (e.effect.last = v.prev), v.prev && (v.prev.next = v.next), v.next && (v.next.prev = v.prev), st(e, d, v), st(e, v, R), Lt(v, R, r), d = v, _ = [], p = [], o = d.next;
        continue;
      }
    if ((v.f & Se) !== 0 && ($r(v), n && (v.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(v))), v !== o) {
      if (f !== void 0 && f.has(v)) {
        if (_.length < p.length) {
          var P = p[0], N;
          d = P.prev;
          var I = _[0], q = _[_.length - 1];
          for (N = 0; N < _.length; N += 1)
            Lt(_[N], P, r);
          for (N = 0; N < p.length; N += 1)
            f.delete(p[N]);
          st(e, I.prev, q.next), st(e, d, I), st(e, q, P), o = P, d = q, g -= 1, _ = [], p = [];
        } else
          f.delete(v), Lt(v, o, r), st(e, v.prev, v.next), st(e, v, d === null ? e.effect.first : d.next), st(e, d, v), d = v;
        continue;
      }
      for (_ = [], p = []; o !== null && o !== v; )
        (f ??= /* @__PURE__ */ new Set()).add(o), p.push(o), o = o.next;
      if (o === null)
        continue;
    }
    (v.f & Ge) === 0 && _.push(v), d = v, o = v.next;
  }
  if (e.outrogroups !== null) {
    for (const S of e.outrogroups)
      S.pending.size === 0 && (Pr(ir(S.done)), e.outrogroups?.delete(S));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || f !== void 0) {
    var K = [];
    if (f !== void 0)
      for (v of f)
        (v.f & Se) === 0 && K.push(v);
    for (; o !== null; )
      (o.f & Se) === 0 && o !== e.fallback && K.push(o), o = o.next;
    var A = K.length;
    if (A > 0) {
      var B = (s & cs) !== 0 && l === 0 ? r : null;
      if (n) {
        for (g = 0; g < A; g += 1)
          K[g].nodes?.a?.measure();
        for (g = 0; g < A; g += 1)
          K[g].nodes?.a?.fix();
      }
      wa(e, K, B);
    }
  }
  n && Pt(() => {
    if (m !== void 0)
      for (v of m)
        v.nodes?.a?.apply();
  });
}
function xa(e, t, r, s, a, n, l, c) {
  var o = (l & An) !== 0 ? (l & On) === 0 ? /* @__PURE__ */ Kn(r, !1, !1) : wt(r) : null, f = (l & Fn) !== 0 ? wt(a) : null;
  return {
    v: o,
    i: f,
    e: Oe(() => (n(t, o ?? r, f ?? a, c), () => {
      e.delete(s);
    }))
  };
}
function Lt(e, t, r) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, n = t && (t.f & Ge) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; s !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Jt(s)
      );
      if (n.before(s), s === a)
        return;
      s = l;
    }
}
function st(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
function Ma(e, t, r) {
  var s = new Us(e);
  fr(() => {
    var a = t() ?? null;
    s.ensure(a, a && ((n) => r(n, a)));
  }, gt);
}
const rs = [...` 	
\r\f \v\uFEFF`];
function ka(e, t, r) {
  var s = e == null ? "" : "" + e;
  if (t && (s = s ? s + " " + t : t), r) {
    for (var a in r)
      if (r[a])
        s = s ? s + " " + a : a;
      else if (s.length)
        for (var n = a.length, l = 0; (l = s.indexOf(a, l)) >= 0; ) {
          var c = l + n;
          (l === 0 || rs.includes(s[l - 1])) && (c === s.length || rs.includes(s[c])) ? s = (l === 0 ? "" : s.substring(0, l)) + s.substring(c + 1) : l = c;
        }
  }
  return s === "" ? null : s;
}
function Sa(e, t) {
  return e == null ? null : String(e);
}
function $e(e, t, r, s, a, n) {
  var l = e.__className;
  if (l !== r || l === void 0) {
    var c = ka(r, s, n);
    c == null ? e.removeAttribute("class") : e.className = c, e.__className = r;
  } else if (n && a !== n)
    for (var o in n) {
      var f = !!n[o];
      (a == null || f !== !!a[o]) && e.classList.toggle(o, f);
    }
  return n;
}
function jt(e, t, r, s) {
  var a = e.__style;
  if (a !== t) {
    var n = Sa(t);
    n == null ? e.removeAttribute("style") : e.style.cssText = n, e.__style = t;
  }
  return s;
}
function Js(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Or(t))
      return Cn();
    for (var s of e.options)
      s.selected = t.includes($t(s));
    return;
  }
  for (s of e.options) {
    var a = $t(s);
    if (Zn(a, t)) {
      s.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function Ea(e) {
  var t = new MutationObserver(() => {
    Js(e, e.__value);
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
  }), jr(() => {
    t.disconnect();
  });
}
function Da(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet(), a = !0;
  qr(e, "change", (n) => {
    var l = n ? "[selected]" : ":checked", c;
    if (e.multiple)
      c = [].map.call(e.querySelectorAll(l), $t);
    else {
      var o = e.querySelector(l) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      c = o && $t(o);
    }
    r(c), X !== null && s.add(X);
  }), As(() => {
    var n = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        Ht ?? X
      );
      if (s.has(l))
        return;
    }
    if (Js(e, n, a), a && n === void 0) {
      var c = e.querySelector(":checked");
      c !== null && (n = $t(c), r(n));
    }
    e.__value = n, a = !1;
  }), Ea(e);
}
function $t(e) {
  return "__value" in e ? e.__value : e.value;
}
const Ta = /* @__PURE__ */ Symbol("is custom element"), Aa = /* @__PURE__ */ Symbol("is html");
function be(e, t, r, s) {
  var a = Fa(e);
  a[t] !== (a[t] = r) && (t === "loading" && (e[mn] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Pa(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Fa(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [Ta]: e.nodeName.includes("-"),
      [Aa]: e.namespaceURI === Nn
    }
  );
}
var ss = /* @__PURE__ */ new Map();
function Pa(e) {
  var t = e.getAttribute("is") || e.nodeName, r = ss.get(t);
  if (r) return r;
  ss.set(t, r = []);
  for (var s, a = e, n = Element.prototype; n !== a; ) {
    s = vn(a);
    for (var l in s)
      s[l].set && r.push(l);
    a = is(a);
  }
  return r;
}
function er(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet();
  qr(e, "input", async (a) => {
    var n = a ? e.defaultValue : e.value;
    if (n = yr(e) ? xr(n) : n, r(n), X !== null && s.add(X), await js(), n !== (n = t())) {
      var l = e.selectionStart, c = e.selectionEnd, o = e.value.length;
      if (e.value = n ?? "", c !== null) {
        var f = e.value.length;
        l === c && c === o && f > o ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = l, e.selectionEnd = Math.min(c, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Gt(t) == null && e.value && (r(yr(e) ? xr(e.value) : e.value), X !== null && s.add(X)), vr(() => {
    var a = t();
    if (e === document.activeElement) {
      var n = (
        /** @type {Batch} */
        Ht ?? X
      );
      if (s.has(n))
        return;
    }
    yr(e) && a === xr(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
function Oa(e, t, r = t) {
  qr(e, "change", (s) => {
    var a = s ? e.defaultChecked : e.checked;
    r(a);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  // If defaultChecked is set, then checked == defaultChecked
  Gt(t) == null && r(e.checked), vr(() => {
    var s = t();
    e.checked = !!s;
  });
}
function yr(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function xr(e) {
  return e === "" ? null : +e;
}
function ns(e, t) {
  return e === t || e?.[dt] === t;
}
function kt(e = {}, t, r, s) {
  return As(() => {
    var a, n;
    return vr(() => {
      a = n, n = [], Gt(() => {
        e !== r(...n) && (t(e, ...n), a && ns(r(...a), e) && t(null, ...a));
      });
    }), () => {
      Pt(() => {
        n && ns(r(...n), e) && t(null, ...n);
      });
    };
  }), e;
}
const Ia = {
  get(e, t) {
    let r = e.props.length;
    for (; r--; ) {
      let s = e.props[r];
      if (Nt(s) && (s = s()), typeof s == "object" && s !== null && t in s) return s[t];
    }
  },
  set(e, t, r) {
    let s = e.props.length;
    for (; s--; ) {
      let a = e.props[s];
      Nt(a) && (a = a());
      const n = ft(a, t);
      if (n && n.set)
        return n.set(r), !0;
    }
    return !1;
  },
  getOwnPropertyDescriptor(e, t) {
    let r = e.props.length;
    for (; r--; ) {
      let s = e.props[r];
      if (Nt(s) && (s = s()), typeof s == "object" && s !== null && t in s) {
        const a = ft(s, t);
        return a && !a.configurable && (a.configurable = !0), a;
      }
    }
  },
  has(e, t) {
    if (t === dt || t === gn) return !1;
    for (let r of e.props)
      if (Nt(r) && (r = r()), r != null && t in r) return !0;
    return !1;
  },
  ownKeys(e) {
    const t = [];
    for (let r of e.props)
      if (Nt(r) && (r = r()), !!r) {
        for (const s in r)
          t.includes(s) || t.push(s);
        for (const s of Object.getOwnPropertySymbols(r))
          t.includes(s) || t.push(s);
      }
    return t;
  }
};
function Ra(...e) {
  return new Proxy({ props: e }, Ia);
}
function Xs(e, t, r, s) {
  var a = (
    /** @type {V} */
    s
  ), n = !0, l = () => (n && (n = !1, a = /** @type {V} */
  s), a), c;
  c = /** @type {V} */
  e[t], c === void 0 && s !== void 0 && (c = l());
  var o;
  return o = () => {
    var f = (
      /** @type {V} */
      e[t]
    );
    return f === void 0 ? l() : (n = !0, f);
  }, o;
}
function xt(e) {
  Te === null && bn(), Ds(() => {
    const t = Gt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Na = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Na);
function Ca(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Mr = { exports: {} }, as;
function La() {
  return as || (as = 1, (function(e) {
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
      }, r = t.en_US, s = new a(r, 0, !1);
      e.exports = s, typeof Date.now != "function" && (Date.now = function() {
        return +/* @__PURE__ */ new Date();
      });
      function a(w, v, g) {
        var R = w || r, P = v || 0, N = g || !1, I = 0, q;
        function K(S, y) {
          var M;
          if (y) {
            if (M = y.getTime(), N) {
              var x = d(y);
              if (y = new Date(M + x + P), d(y) !== x) {
                var b = d(y);
                y = new Date(M + b + P);
              }
            }
          } else {
            var $ = Date.now();
            $ > I ? (I = $, q = new Date(I), M = I, N && (q = new Date(I + d(q) + P))) : M = I, y = q;
          }
          return A(S, y, R, M);
        }
        function A(S, y, M, $) {
          for (var x = "", b = null, k = !1, L = S.length, Q = !1, te = 0; te < L; te++) {
            var oe = S.charCodeAt(te);
            if (k === !0) {
              if (oe === 45) {
                b = "";
                continue;
              } else if (oe === 95) {
                b = " ";
                continue;
              } else if (oe === 48) {
                b = "0";
                continue;
              } else if (oe === 58) {
                Q && E("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), Q = !0;
                continue;
              }
              switch (oe) {
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
                  x += n(Math.floor(y.getFullYear() / 100), b);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  x += A(M.formats.D, y, M, $);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  x += A(M.formats.F, y, M, $);
                  break;
                // '00'
                // case 'H':
                case 72:
                  x += n(y.getHours(), b);
                  break;
                // '12'
                // case 'I':
                case 73:
                  x += n(c(y.getHours()), b);
                  break;
                // '000'
                // case 'L':
                case 76:
                  x += l(Math.floor($ % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  x += n(y.getMinutes(), b);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  x += y.getHours() < 12 ? M.am : M.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  x += A(M.formats.R, y, M, $);
                  break;
                // '00'
                // case 'S':
                case 83:
                  x += n(y.getSeconds(), b);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  x += A(M.formats.T, y, M, $);
                  break;
                // '00'
                // case 'U':
                case 85:
                  x += n(o(y, "sunday"), b);
                  break;
                // '00'
                // case 'W':
                case 87:
                  x += n(o(y, "monday"), b);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  x += A(M.formats.X, y, M, $);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  x += y.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (N && P === 0)
                    x += "GMT";
                  else {
                    var C = m(y);
                    x += C || "";
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
                  x += A(M.formats.c, y, M, $);
                  break;
                // '01'
                // case 'd':
                case 100:
                  x += n(y.getDate(), b);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  x += n(y.getDate(), b ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  x += M.shortMonths[y.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var G = new Date(y.getFullYear(), 0, 1), j = Math.ceil((y.getTime() - G.getTime()) / (1e3 * 60 * 60 * 24));
                  x += l(j);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  x += n(y.getHours(), b ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  x += n(c(y.getHours()), b ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  x += n(y.getMonth() + 1, b);
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
                  var j = y.getDate();
                  M.ordinalSuffixes ? x += String(j) + (M.ordinalSuffixes[j - 1] || f(j)) : x += String(j) + f(j);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  x += y.getHours() < 12 ? M.AM : M.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  x += A(M.formats.r, y, M, $);
                  break;
                // '0'
                // case 's':
                case 115:
                  x += Math.floor($ / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  x += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var j = y.getDay();
                  x += j === 0 ? 7 : j;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  x += A(M.formats.v, y, M, $);
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
                  x += A(M.formats.x, y, M, $);
                  break;
                // '70'
                // case 'y':
                case 121:
                  x += n(y.getFullYear() % 100, b);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (N && P === 0)
                    x += Q ? "+00:00" : "+0000";
                  else {
                    var V;
                    P !== 0 ? V = P / (60 * 1e3) : V = -y.getTimezoneOffset();
                    var ne = V < 0 ? "-" : "+", Z = Q ? ":" : "", z = Math.floor(Math.abs(V / 60)), U = Math.abs(V % 60);
                    x += ne + n(z) + Z + n(U);
                  }
                  break;
                default:
                  k && (x += "%"), x += S[te];
                  break;
              }
              b = null, k = !1;
              continue;
            }
            if (oe === 37) {
              k = !0;
              continue;
            }
            x += S[te];
          }
          return x;
        }
        var B = K;
        return B.localize = function(S) {
          return new a(S || R, P, N);
        }, B.localizeByIdentifier = function(S) {
          var y = t[S];
          return y ? B.localize(y) : (E('[WARNING] No locale found with identifier "' + S + '".'), B);
        }, B.timezone = function(S) {
          var y = P, M = N, $ = typeof S;
          if ($ === "number" || $ === "string")
            if (M = !0, $ === "string") {
              var x = S[0] === "-" ? -1 : 1, b = parseInt(S.slice(1, 3), 10), k = parseInt(S.slice(3, 5), 10);
              y = x * (60 * b + k) * 60 * 1e3;
            } else $ === "number" && (y = S * 60 * 1e3);
          return new a(R, y, M);
        }, B.utc = function() {
          return new a(R, P, !0);
        }, B;
      }
      function n(w, v) {
        return v === "" || w > 9 ? "" + w : (v == null && (v = "0"), v + w);
      }
      function l(w) {
        return w > 99 ? w : w > 9 ? "0" + w : "00" + w;
      }
      function c(w) {
        return w === 0 ? 12 : w > 12 ? w - 12 : w;
      }
      function o(w, v) {
        v = v || "sunday";
        var g = w.getDay();
        v === "monday" && (g === 0 ? g = 6 : g--);
        var R = Date.UTC(w.getFullYear(), 0, 1), P = Date.UTC(w.getFullYear(), w.getMonth(), w.getDate()), N = Math.floor((P - R) / 864e5), I = (N + 7 - g) / 7;
        return Math.floor(I);
      }
      function f(w) {
        var v = w % 10, g = w % 100;
        if (g >= 11 && g <= 13 || v === 0 || v >= 4)
          return "th";
        switch (v) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
        }
      }
      function d(w) {
        return (w.getTimezoneOffset() || 0) * 6e4;
      }
      function m(w, v) {
        return _() || p(w);
      }
      function _(w, v) {
        return null;
      }
      function p(w) {
        var v = w.toString().match(/\(([\w\s]+)\)/);
        return v && v[1];
      }
      function E(w) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(w);
      }
    })();
  })(Mr)), Mr.exports;
}
var Ha = La();
const Et = /* @__PURE__ */ Ca(Ha);
let kr = /* @__PURE__ */ Y(!1);
class Ya {
  constructor(t) {
    if (this.sk = "", this.fetchFn = t || (typeof window < "u" ? fetch.bind(window) : fetch), typeof document < "u") {
      const r = document.querySelector('meta[name="csrf-token"]');
      r && (this.sk = r.content);
    }
  }
  get loading() {
    return i(kr);
  }
  async request(t, r = {}) {
    T(kr, !0);
    try {
      const s = new URL(t, window.location.origin);
      r.params && Object.entries(r.params).forEach(([c, o]) => {
        s.searchParams.append(c, String(o));
      });
      const a = new Headers(r.headers || {});
      a.set("X-Requested-With", "fetch");
      let n = r.body;
      r.method && ["POST", "PUT", "PATCH", "DELETE"].includes(r.method.toUpperCase()) && (n instanceof FormData ? n.set("sk", this.sk) : n && typeof n == "object" && !(n instanceof Blob) && n instanceof ArrayBuffer);
      const l = await this.fetchFn(s.toString(), { ...r, headers: a, body: n });
      if (!l.ok)
        throw new Error(`API Error: ${l.status} ${l.statusText}`);
      return await l.json();
    } finally {
      T(kr, !1);
    }
  }
  get(t, r) {
    return this.request(t, { method: "GET", params: r });
  }
  post(t, r) {
    return this.request(t, { method: "POST", body: r });
  }
}
const se = new Ya(), qa = (e, t = lr) => {
  var r = ja(), s = u(r);
  W(() => {
    $e(r, 1, `status status-${t() ?? ""}`, "svelte-13s7gu4"), F(s, t());
  }), D(e, r);
};
var ja = /* @__PURE__ */ O("<span> </span>"), $a = /* @__PURE__ */ O('<time class="svelte-13s7gu4"> </time>'), Ba = /* @__PURE__ */ O('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), za = /* @__PURE__ */ O('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), Ua = /* @__PURE__ */ O('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Ja = /* @__PURE__ */ O('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), Xa = /* @__PURE__ */ O('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4">エントリ一覧</h2> <div class="search-box svelte-13s7gu4"><input type="text" placeholder="検索..." class="svelte-13s7gu4"/> <button class="svelte-13s7gu4">検索</button></div> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">新しい方へ</button> <button class="svelte-13s7gu4">古い方へ</button></div></div> <div><!></div></div>');
function Ga(e, t) {
  Qe(t, !0);
  const r = (S, y = lr, M) => {
    let $ = /* @__PURE__ */ Hr(() => os(M?.(), !0));
    var x = $a(), b = u(x);
    W(
      (k) => {
        be(x, "datetime", y()), F(b, k);
      },
      [() => i($) && y() ? _(y()) : "-"]
    ), D(S, x);
  };
  let s = /* @__PURE__ */ Y(we([])), a = /* @__PURE__ */ Y(!1), n = 50, l = /* @__PURE__ */ Y(""), c = /* @__PURE__ */ Y(we([]));
  async function o() {
    try {
      const S = i(c)[i(c).length - 1], y = { limit: n };
      i(l) && (y.q = i(l)), S && (y.cursor_id = S);
      const M = await se.get("/admin/api/entries", y);
      T(s, M.entries || [], !0), T(a, M.has_more || !1, !0);
    } catch (S) {
      console.error(S);
    }
  }
  function f() {
    T(c, [], !0), o();
  }
  xt(o);
  function d() {
    if (i(a) && i(s).length > 0) {
      const S = i(s)[i(s).length - 1];
      i(c).push(S.id), o();
    }
  }
  function m() {
    i(c).length > 0 && (i(c).pop(), o());
  }
  function _(S) {
    return S ? Et("%Y-%m-%d %H:%M", new Date(S)) : "-";
  }
  var p = Xa(), E = u(p), w = h(u(E), 2), v = u(w);
  v.__keydown = (S) => S.key === "Enter" && f();
  var g = h(v, 2);
  g.__click = f;
  var R = h(w, 2), P = u(R);
  P.__click = m;
  var N = h(P, 2);
  N.__click = d;
  var I = h(E, 2);
  let q;
  var K = u(I);
  {
    var A = (S) => {
      var y = Ba();
      D(S, y);
    }, B = (S) => {
      var y = Ja(), M = ot(y), $ = h(u(M));
      Ee($, 21, () => i(s), Le, (k, L) => {
        var Q = za(), te = u(Q), oe = u(te), C = h(te), G = u(C), j = h(C), V = u(j);
        qa(V, () => i(L).status);
        var ne = h(j), Z = u(ne), z = u(Z), U = h(Z, 2), re = u(U), ae = u(re), ue = h(ne), he = u(ue), pe = h(ue), Ye = u(pe);
        r(Ye, () => i(L).created_at);
        var Ae = h(pe), ge = u(Ae);
        r(ge, () => i(L).modified_at);
        var Me = h(Ae), Ue = u(Me);
        r(Ue, () => i(L).publish_at?.Time, () => i(L).publish_at?.Valid);
        var Je = h(Me), Re = u(Je);
        Re.__click = () => t.onEdit(i(L).id), W(() => {
          F(oe, i(L).id), F(G, i(L).date), F(z, i(L).title), be(re, "href", `/${i(L).path ?? ""}`), F(ae, `/${i(L).path ?? ""}`), F(he, i(L).format);
        }), D(k, Q);
      });
      var x = h(M, 2);
      {
        var b = (k) => {
          var L = Ua();
          D(k, L);
        };
        ie(x, (k) => {
          se.loading && k(b);
        });
      }
      D(S, y);
    };
    ie(K, (S) => {
      se.loading && i(s).length === 0 ? S(A) : S(B, !1);
    });
  }
  W(() => {
    P.disabled = i(c).length === 0 || se.loading, N.disabled = !i(a) || se.loading, q = $e(I, 1, "table-container svelte-13s7gu4", null, q, { "is-loading": se.loading });
  }), er(v, () => i(l), (S) => T(l, S)), D(e, p), et();
}
Vt(["keydown", "click"]);
class Va {
  #e;
  get exists() {
    return i(this.#e);
  }
  set exists(t) {
    T(this.#e, t, !0);
  }
  #t;
  get data() {
    return i(this.#t);
  }
  set data(t) {
    T(this.#t, t, !0);
  }
  constructor(t = typeof localStorage < "u" ? localStorage : null) {
    this.storage = t, this.timer = null, this.#e = /* @__PURE__ */ Y(!1), this.#t = /* @__PURE__ */ Y(null);
  }
  key(t) {
    return `nogag-backup-${t || "new"}`;
  }
  check(t, r) {
    if (!this.storage) return;
    const s = this.storage.getItem(this.key(t));
    if (s)
      try {
        const a = JSON.parse(s);
        (a.title !== r.title || a.body !== r.body) && (this.exists = !0, this.data = a);
      } catch (a) {
        console.error("Failed to parse backup", a);
      }
  }
  saveDebounced(t, r, s = 1e3) {
    this.timer && clearTimeout(this.timer), this.timer = setTimeout(
      () => {
        this.save(t, r);
      },
      s
    );
  }
  save(t, r) {
    if (!this.storage) return;
    const s = { title: r.title, body: r.body, time: Date.now() };
    this.storage.setItem(this.key(t), JSON.stringify(s)), this.exists = !1;
  }
  clear(t) {
    this.storage && (this.storage.removeItem(this.key(t)), this.exists = !1, this.data = null);
  }
}
var Ka = /* @__PURE__ */ O('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), Wa = /* @__PURE__ */ O('<option class="svelte-7nstam"> </option>'), Za = /* @__PURE__ */ O('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), Qa = /* @__PURE__ */ O('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), ei = /* @__PURE__ */ O('<button id="restore" type="button" class="submit-button svelte-7nstam">復元...</button>'), ti = /* @__PURE__ */ O('<div role="option" tabindex="-1"> </div>'), ri = /* @__PURE__ */ O('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam"> </button> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons svelte-7nstam"><div class="options svelte-7nstam"><label title="チェックを入れると指定した日時に公開されます（公開済みの記事も予約に戻せます）" class="svelte-7nstam"><input type="checkbox" class="svelte-7nstam"/> 公開を遅延</label> <!></div> <button type="button" class="submit-button svelte-7nstam"> </button> <!></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam" role="listbox" aria-label="タグを選択" tabindex="0"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog>', 1);
function si(e, t) {
  Qe(t, !0);
  let r = Xs(t, "id", 3, null);
  const s = new Va();
  let a = /* @__PURE__ */ Y(we({ id: void 0, title: "", body: "", status: "" })), n = we({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: "public",
    publishLater: !1,
    publishAt: ""
  }), l = /* @__PURE__ */ Y(!1), c = /* @__PURE__ */ Y(""), o = /* @__PURE__ */ Y(!1), f = /* @__PURE__ */ Y(null), d = /* @__PURE__ */ Y(null), m = /* @__PURE__ */ Y(null), _ = /* @__PURE__ */ Y(null), p = /* @__PURE__ */ Y(null);
  const E = [
    "tech",
    "photo",
    "redeveloped",
    "stablediffusion",
    "photoshopped"
  ];
  let w = /* @__PURE__ */ Y(0);
  async function v(b) {
    try {
      const k = await se.get(`/admin/api/entry/${b}`);
      T(a, k, !0), n.id = k.id, n.title = k.title, n.body = k.body, n.format = k.format || "Hatena", n.status = k.status, n.publishLater = k.status === "scheduled", k.publish_at?.Valid ? n.publishAt = Et("%Y-%m-%dT%H:%M", new Date(k.publish_at.Time)) : n.publishAt = Et("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), s.check(i(a).id ?? null, { title: n.title, body: n.body });
    } catch (k) {
      console.error(k), alert("エントリの取得に失敗しました");
    }
  }
  xt(() => {
    r() ? v(r()) : (T(a, { id: void 0, title: "", body: "", status: "public" }, !0), n.id = null, n.title = "", n.body = "", n.format = "Hatena", n.status = "public", n.publishLater = !1, n.publishAt = Et("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), s.check(null, { title: n.title, body: n.body }));
  }), Ds(() => {
    (i(a).title !== n.title || i(a).body !== n.body) && s.saveDebounced(i(a).id ?? null, { title: n.title, body: n.body });
  });
  async function g() {
    T(l, !0), T(c, "リクエスト中");
    const b = new FormData();
    if (b.set("id", n.id ? String(n.id) : ""), b.set("title", n.title), b.set("body", n.body), b.set("format", n.format), n.publishLater) {
      const k = new Date(n.publishAt);
      b.set("publish_at", k.toISOString()), b.set("status", "scheduled");
    } else
      b.set("status", "public");
    try {
      const L = (await se.post("/admin/api/edit", b)).session_id;
      if (!L)
        throw new Error("保存に失敗しました");
      R(L);
    } catch (k) {
      T(l, !1), alert(k instanceof Error ? k.message : "エラーが発生しました");
    }
  }
  function R(b) {
    const k = new EventSource(`/admin/api/edit/progress?sid=${b}`);
    k.onmessage = (L) => {
      const Q = JSON.parse(L.data);
      switch (Q.type) {
        case "progress":
          T(c, P(Q.message), !0);
          break;
        case "done":
          s.clear(i(a).id ?? null), T(c, "完了"), T(l, !1), k.close(), t.onSave(Q.location);
          break;
        case "error":
          T(c, "エラー: " + Q.message), T(l, !1), k.close(), alert("保存に失敗しました: " + Q.message);
          break;
      }
    }, k.onerror = () => {
      T(l, !1), k.close(), alert("通信エラーが発生しました");
    };
  }
  function P(b) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[b] || b;
  }
  function N() {
    T(w, 0), i(m).showModal(), setTimeout(() => i(p)?.focus(), 0);
  }
  function I(b) {
    b.key === "ArrowDown" ? (b.preventDefault(), T(w, (i(w) + 1) % E.length)) : b.key === "ArrowUp" ? (b.preventDefault(), T(w, (i(w) - 1 + E.length) % E.length)) : b.key === "Enter" || b.key === " " ? (b.preventDefault(), q(E[i(w)])) : b.key === "Escape" && i(m).close();
  }
  function q(b) {
    const k = `[${b}]`;
    n.title.includes(k) ? n.title = n.title.replace(k, "") : n.title = k + n.title, i(m).close(), i(f).focus();
  }
  function K() {
    s.data && (n.title = s.data.title, n.body = s.data.body, s.clear(i(a).id ?? null), i(_).close());
  }
  async function A() {
    const b = document.createElement("input");
    b.type = "file", b.oninput = async () => {
      if (!b.files?.[0]) return;
      const k = new FormData();
      k.append("file", b.files[0]), T(o, !0);
      try {
        const L = await se.post("/admin/api/upload/image", k), Q = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${L.uploaded}" class="picasa" itemprop="url"><img src="${L.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        B(Q, !0);
      } catch {
        alert("アップロードに失敗しました");
      } finally {
        T(o, !1);
      }
    }, b.click();
  }
  function B(b, k = !1) {
    const L = i(d).selectionStart, Q = i(d).selectionEnd, te = i(d).value;
    n.body = te.substring(0, L) + b + te.substring(Q), js().then(() => {
      typeof k == "boolean" && k ? (i(d).selectionStart = L, i(d).selectionEnd = L + b.length) : typeof k == "number" ? i(d).selectionStart = i(d).selectionEnd = L + k : i(d).selectionStart = i(d).selectionEnd = L + b.length, i(d).focus();
    });
  }
  function S(b) {
    (b.altKey ? "Alt-" : "") + (b.ctrlKey ? "Control-" : "") + (b.metaKey ? "Meta-" : "") + (b.shiftKey ? "Shift-" : "") + b.key === "Control-t" && (B("\\(  \\)", 3), b.preventDefault(), b.stopPropagation());
  }
  var y = dr(), M = ot(y);
  {
    var $ = (b) => {
      var k = Ka();
      D(b, k);
    }, x = (b) => {
      var k = ri(), L = ot(k), Q = u(L), te = u(Q);
      kt(te, (H) => T(f, H), () => i(f));
      var oe = h(te, 2), C = u(oe);
      C.__click = N;
      var G = h(C, 2);
      G.__click = A;
      var j = u(G), V = h(G, 2);
      Ee(V, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], Le, (H, le) => {
        var me = Wa(), Ce = u(me), rt = {};
        W(() => {
          F(Ce, le), rt !== (rt = le) && (me.value = (me.__value = le) ?? "");
        }), D(H, me);
      });
      var ne = h(oe, 2), Z = u(ne);
      Z.__keydown = S, kt(Z, (H) => T(d, H), () => i(d));
      var z = h(Q, 2), U = u(z);
      {
        var re = (H) => {
          var le = Za();
          D(H, le);
        };
        ie(U, (H) => {
          i(l) && H(re);
        });
      }
      var ae = h(U, 2), ue = u(ae), he = u(ue), pe = u(he), Ye = h(he, 2);
      {
        var Ae = (H) => {
          var le = Qa();
          er(le, () => n.publishAt, (me) => n.publishAt = me), D(H, le);
        };
        ie(Ye, (H) => {
          n.publishLater && H(Ae);
        });
      }
      var ge = h(ue, 2);
      ge.__click = g;
      var Me = u(ge), Ue = h(ge, 2);
      {
        var Je = (H) => {
          var le = ei();
          le.__click = () => i(_).showModal(), D(H, le);
        };
        ie(Ue, (H) => {
          s.exists && H(Je);
        });
      }
      var Re = h(L, 2), Ne = h(u(Re), 2);
      Ne.__keydown = I, Ee(Ne, 21, () => E, Le, (H, le, me) => {
        var Ce = ti();
        let rt;
        Ce.__click = () => q(i(le)), Ce.__keydown = (mr) => mr.key === "Enter" && q(i(le));
        var gr = u(Ce);
        W(() => {
          rt = $e(Ce, 1, "tag-item svelte-7nstam", null, rt, { selected: i(w) === me }), be(Ce, "aria-selected", i(w) === me), F(gr, i(le));
        }), ha("mouseenter", Ce, () => T(w, me, !0)), D(H, Ce);
      }), kt(Ne, (H) => T(p, H), () => i(p));
      var ut = h(Ne, 2);
      ut.__click = () => i(m).close(), kt(Re, (H) => T(m, H), () => i(m));
      var ct = h(Re, 2), Kt = h(u(ct), 2), Wt = u(Kt);
      {
        var hr = (H) => {
          var le = pa();
          W((me) => F(le, me), [() => Et("%Y年%m月%d日%H時", new Date(s.data.time))]), D(H, le);
        };
        ie(Wt, (H) => {
          s.data?.time && H(hr);
        });
      }
      var _r = h(Kt, 2), It = u(_r);
      It.__click = () => i(_).close();
      var pr = h(It, 2);
      pr.__click = K, kt(ct, (H) => T(_, H), () => i(_)), W(() => {
        G.disabled = i(o), F(j, i(o) ? "⌛ アップロード中..." : "📷 写真"), ge.disabled = i(l), F(Me, i(l) ? i(c) || "リクエスト中" : r() ? "更新" : "作成");
      }), er(te, () => n.title, (H) => n.title = H), Da(V, () => n.format, (H) => n.format = H), er(Z, () => n.body, (H) => n.body = H), Oa(pe, () => n.publishLater, (H) => n.publishLater = H), D(b, k);
    };
    ie(M, (b) => {
      se.loading && !i(a).id ? b($) : b(x, !1);
    });
  }
  D(e, y), et();
}
Vt(["click", "keydown"]);
const ni = (e, t = lr) => {
  var r = ai(), s = u(r);
  W(() => {
    $e(r, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), F(s, t());
  }), D(e, r);
};
var ai = /* @__PURE__ */ O("<span> </span>"), ii = /* @__PURE__ */ O('<time class="time svelte-1r6codn"> </time>'), li = /* @__PURE__ */ O('<div class="loading svelte-1r6codn"></div>'), oi = /* @__PURE__ */ O('<div class="error-text svelte-1r6codn"> </div>'), ui = /* @__PURE__ */ O('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><!></td><td class="error svelte-1r6codn"><!></td></tr>'), ci = /* @__PURE__ */ O('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), vi = /* @__PURE__ */ O('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">新しい方へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">古い方へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function fi(e, t) {
  Qe(t, !0);
  const r = (A, B = lr, S) => {
    let y = /* @__PURE__ */ Hr(() => os(S?.(), !0));
    var M = ii(), $ = u(M);
    W(
      (x) => {
        be(M, "datetime", B()), F($, x);
      },
      [() => i(y) && B() ? d(B()) : "-"]
    ), D(A, M);
  };
  let s = /* @__PURE__ */ Y(we([])), a = /* @__PURE__ */ Y(0), n = /* @__PURE__ */ Y(0), l = 50;
  async function c() {
    try {
      const A = await se.get("/admin/api/jobs", { limit: l, offset: i(n) });
      T(s, A.jobs || [], !0), T(a, A.total || 0, !0);
    } catch (A) {
      console.error(A);
    }
  }
  xt(c);
  function o() {
    i(n) + l < i(a) && (T(n, i(n) + l), c());
  }
  function f() {
    i(n) - l >= 0 && (T(n, i(n) - l), c());
  }
  function d(A) {
    return Et("%Y-%m-%d %H:%M:%S", new Date(A));
  }
  var m = vi(), _ = u(m), p = u(_), E = u(p), w = h(p, 2), v = u(w);
  v.__click = f;
  var g = h(v, 2), R = u(g), P = h(g, 2);
  P.__click = o;
  var N = h(P, 2);
  N.__click = c;
  var I = h(_, 2);
  {
    var q = (A) => {
      var B = li();
      D(A, B);
    }, K = (A) => {
      var B = ci(), S = h(u(B));
      Ee(S, 21, () => i(s), Le, (y, M) => {
        var $ = ui(), x = u($), b = u(x), k = h(x), L = u(k), Q = u(L), te = h(k), oe = u(te);
        ni(oe, () => i(M).status);
        var C = h(te), G = u(C), j = h(C), V = u(j);
        r(V, () => i(M).created_at);
        var ne = h(j), Z = u(ne);
        {
          var z = (U) => {
            var re = oi(), ae = u(re);
            W(() => {
              be(re, "title", i(M).error_message.String), F(ae, i(M).error_message.String);
            }), D(U, re);
          };
          ie(Z, (U) => {
            i(M).error_message?.Valid && U(z);
          });
        }
        W(() => {
          F(b, i(M).id), F(Q, i(M).job_type_name), F(G, i(M).retry_count);
        }), D(y, $);
      }), D(A, B);
    };
    ie(I, (A) => {
      se.loading && i(s).length === 0 ? A(q) : A(K, !1);
    });
  }
  W(
    (A) => {
      F(E, `ジョブ一覧 (${i(a) ?? ""})`), v.disabled = i(n) === 0 || se.loading, F(R, `${i(n) + 1} - ${A ?? ""} / ${i(a) ?? ""}`), P.disabled = i(n) + l >= i(a) || se.loading;
    },
    [() => Math.min(i(n) + l, i(a))]
  ), D(e, m), et();
}
Vt(["click"]);
var di = /* @__PURE__ */ O('<div class="empty svelte-wpgtu6">No Signature</div>'), hi = /* @__PURE__ */ O("<div></div>"), _i = /* @__PURE__ */ O('<div class="row svelte-wpgtu6"></div>'), pi = /* @__PURE__ */ O('<div class="chroma-section svelte-wpgtu6"></div>'), gi = /* @__PURE__ */ O('<div class="chroma-sections svelte-wpgtu6"></div>'), mi = /* @__PURE__ */ O('<div class="color-bitmask svelte-wpgtu6"><!></div>');
function Sr(e, t) {
  Qe(t, !0);
  let r = Xs(t, "size", 3, 64), s = /* @__PURE__ */ nt(() => {
    if (!t.sig) return new Array(64).fill(!1);
    try {
      const d = atob(t.sig), m = new Uint8Array(d.length);
      for (let p = 0; p < d.length; p++)
        m[p] = d.charCodeAt(p);
      const _ = [];
      for (let p = 0; p < 8; p++) {
        const E = m[p];
        for (let w = 7; w >= 0; w--)
          _.push((E >> w & 1) === 1);
      }
      return _.reverse();
    } catch (d) {
      return console.error("Failed to decode sig:", d), new Array(64).fill(!1);
    }
  });
  function a(d) {
    const m = d >> 5 & 1, _ = d >> 4 & 1, p = d >> 3 & 1, E = d >> 2 & 1, w = d >> 1 & 1, v = d & 1, g = _ << 1 | E, R = m << 2 | p << 1 | w, P = v, N = [25, 45, 65, 85][g], I = P === 0 ? 0.01 : 0.15, q = R * 45;
    return `oklch(${N}% ${I} ${q})`;
  }
  function n(d, m, _) {
    const p = d >> 1 & 1, E = d & 1, w = m >> 2 & 1, v = m >> 1 & 1, g = m & 1, R = _ & 1;
    return w << 5 | p << 4 | v << 3 | E << 2 | g << 1 | R;
  }
  var l = mi(), c = u(l);
  {
    var o = (d) => {
      var m = di();
      D(d, m);
    }, f = (d) => {
      var m = gi();
      Ee(m, 20, () => [1, 0], Le, (_, p) => {
        var E = pi();
        Ee(E, 20, () => [3, 2, 1, 0], Le, (w, v) => {
          var g = _i();
          Ee(g, 20, () => [0, 1, 2, 3, 4, 5, 6, 7], Le, (R, P) => {
            const N = /* @__PURE__ */ nt(() => n(v, P, p));
            var I = hi();
            let q;
            W(
              (K) => {
                q = $e(I, 1, "bit svelte-wpgtu6", null, q, { active: i(s)[i(N)] }), jt(I, `background-color: ${K ?? ""}`), be(I, "title", `L=${v ?? ""} H=${P * 45} C=${p ?? ""}`);
              },
              [() => a(i(N))]
            ), D(R, I);
          }), D(w, g);
        }), W(() => be(E, "title", p === 1 ? "Vivid Colors" : "Muted Colors")), D(_, E);
      }), D(d, m);
    };
    ie(c, (d) => {
      t.sig ? d(f, !1) : d(o);
    });
  }
  W(() => jt(l, `--size: ${r() ?? ""}px`)), D(e, l), et();
}
var bi = /* @__PURE__ */ O('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), wi = /* @__PURE__ */ O('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class A Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), yi = /* @__PURE__ */ O('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), xi = /* @__PURE__ */ O('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class B Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), Mi = /* @__PURE__ */ O('<div class="stat-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">Storage (Free: 10GB)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976"> </div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class A (Free: 1M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class B (Free: 10M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div>', 1), ki = /* @__PURE__ */ O('<div class="stat-card error-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">R2 Status</div> <div class="stat-value svelte-1w9i976" style="font-size: 0.9rem; color: #d32f2f;"> </div></div>'), Si = /* @__PURE__ */ O('<div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div>', 1), Ei = /* @__PURE__ */ O('<div class="r2-stats svelte-1w9i976"><!></div>');
function Di(e, t) {
  Qe(t, !0);
  let r = /* @__PURE__ */ Y(null), s = /* @__PURE__ */ Y(null);
  async function a() {
    try {
      T(r, await se.get("/admin/api/r2/usage"), !0);
    } catch (v) {
      console.error("Failed to fetch R2 usage:", v), T(s, "Failed to load R2 usage data");
    }
  }
  xt(a);
  function n(v) {
    if (v === 0) return "0 B";
    const g = 1024, R = ["B", "KB", "MB", "GB", "TB"], P = Math.floor(Math.log(v) / Math.log(g));
    return parseFloat((v / Math.pow(g, P)).toFixed(2)) + " " + R[P];
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
  ], o = /* @__PURE__ */ nt(() => i(r) ? (i(r).operations || []).filter((v) => l.includes(v.action_type)).reduce((v, g) => v + g.requests, 0) : 0), f = /* @__PURE__ */ nt(() => i(r) ? (i(r).operations || []).filter((v) => c.includes(v.action_type)).reduce((v, g) => v + g.requests, 0) : 0), d = /* @__PURE__ */ nt(() => i(r) ? (i(r).operations || []).filter((v) => l.includes(v.action_type)).sort((v, g) => g.requests - v.requests) : []), m = /* @__PURE__ */ nt(() => i(r) ? (i(r).operations || []).filter((v) => c.includes(v.action_type)).sort((v, g) => g.requests - v.requests) : []);
  var _ = Ei(), p = u(_);
  {
    var E = (v) => {
      var g = Mi(), R = ot(g), P = h(u(R), 2), N = u(P), I = h(P, 2), q = u(I), K = h(I, 2), A = u(K), B = h(R, 2), S = h(u(B), 2), y = u(S), M = h(S, 4), $ = u(M), x = h(M, 2);
      {
        var b = (j) => {
          var V = wi(), ne = h(u(V), 2);
          Ee(ne, 21, () => i(d), Le, (Z, z) => {
            var U = bi(), re = u(U), ae = u(re), ue = h(re, 2), he = u(ue);
            W(
              (pe) => {
                F(ae, i(z).action_type), F(he, pe);
              },
              [() => (i(z).requests ?? 0).toLocaleString()]
            ), D(Z, U);
          }), D(j, V);
        };
        ie(x, (j) => {
          i(d).length > 0 && j(b);
        });
      }
      var k = h(B, 2), L = h(u(k), 2), Q = u(L), te = h(L, 4), oe = u(te), C = h(te, 2);
      {
        var G = (j) => {
          var V = xi(), ne = h(u(V), 2);
          Ee(ne, 21, () => i(m), Le, (Z, z) => {
            var U = yi(), re = u(U), ae = u(re), ue = h(re, 2), he = u(ue);
            W(
              (pe) => {
                F(ae, i(z).action_type), F(he, pe);
              },
              [() => (i(z).requests ?? 0).toLocaleString()]
            ), D(Z, U);
          }), D(j, V);
        };
        ie(C, (j) => {
          i(m).length > 0 && j(G);
        });
      }
      W(
        (j, V, ne, Z, z, U, re) => {
          F(N, j), F(q, `${V ?? ""} objects`), jt(A, `width: ${ne ?? ""}%`), F(y, Z), jt($, `width: ${z ?? ""}%`), F(Q, U), jt(oe, `width: ${re ?? ""}%`);
        },
        [
          () => n(i(r).storage_usage_bytes ?? 0),
          () => (i(r).object_count ?? 0).toLocaleString(),
          () => Math.min(100, (i(r).storage_usage_bytes ?? 0) / 10737418240 * 100),
          () => (i(o) ?? 0).toLocaleString(),
          () => Math.min(100, (i(o) ?? 0) / 1e6 * 100),
          () => (i(f) ?? 0).toLocaleString(),
          () => Math.min(100, (i(f) ?? 0) / 1e7 * 100)
        ]
      ), D(v, g);
    }, w = (v) => {
      var g = dr(), R = ot(g);
      {
        var P = (I) => {
          var q = ki(), K = h(u(q), 2), A = u(K);
          W(() => F(A, i(s))), D(I, q);
        }, N = (I) => {
          var q = Si();
          D(I, q);
        };
        ie(
          R,
          (I) => {
            i(s) ? I(P) : I(N, !1);
          },
          !0
        );
      }
      D(v, g);
    };
    ie(p, (v) => {
      i(r) ? v(E) : v(w, !1);
    });
  }
  D(e, _), et();
}
var Ti = /* @__PURE__ */ O('<div class="loading svelte-xxb0sp">読み込み中...</div>'), Ai = /* @__PURE__ */ O('<button class="indexed-icon svelte-xxb0sp" title="類似画像を検索">🔍</button>'), Fi = /* @__PURE__ */ O('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/> <!></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), Pi = /* @__PURE__ */ O('<div class="overlay svelte-xxb0sp"><div class="loading-spinner svelte-xxb0sp"></div></div>'), Oi = /* @__PURE__ */ O('<div class="grid-container svelte-xxb0sp"><div></div> <!></div>'), Ii = /* @__PURE__ */ O('<div class="selected-compare svelte-xxb0sp"><div class="image-item target svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="svelte-xxb0sp">Selected Image</div></div></div> <div class="arrow svelte-xxb0sp">→</div></div>'), Ri = /* @__PURE__ */ O('<div class="loading svelte-xxb0sp">検索中...</div>'), Ni = /* @__PURE__ */ O('<p class="svelte-xxb0sp">類似画像は見つかりませんでした。</p>'), Ci = /* @__PURE__ */ O('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), Li = /* @__PURE__ */ O("<div></div>"), Hi = /* @__PURE__ */ O('<div class="image-list svelte-xxb0sp"><div class="header svelte-xxb0sp"><div class="title-area svelte-xxb0sp"><h2 class="svelte-xxb0sp"> </h2> <a href="https://dash.cloudflare.com/d52dc19d3368d36eecf4b48d5eb2dd44/r2/default/buckets/lowreal" target="_blank" rel="noopener noreferrer" class="r2-link svelte-xxb0sp">R2 Dashboard ↗</a></div> <div class="pagination svelte-xxb0sp"><button class="svelte-xxb0sp">前へ</button> <span class="svelte-xxb0sp"> </span> <button class="svelte-xxb0sp">次へ</button></div></div> <!> <!></div> <dialog id="similarDialog" class="svelte-xxb0sp"><div class="dialog-header svelte-xxb0sp"><h3 class="svelte-xxb0sp">類似画像一覧</h3> <button type="button" class="close-btn svelte-xxb0sp">×</button></div> <div class="dialog-content svelte-xxb0sp"><!> <!></div></dialog>', 1);
function Yi(e, t) {
  Qe(t, !0);
  let r = /* @__PURE__ */ Y(we([])), s = /* @__PURE__ */ Y(0), a = 20, n = /* @__PURE__ */ Y(0), l = /* @__PURE__ */ Y(we([])), c = /* @__PURE__ */ Y(null), o = /* @__PURE__ */ Y(null);
  async function f() {
    try {
      const C = await se.get(`/admin/api/images?limit=${a}&offset=${i(s)}`);
      T(r, C.images || [], !0), T(n, C.total || 0, !0);
    } catch (C) {
      console.error(C);
    }
  }
  async function d(C) {
    T(c, C, !0), T(l, [], !0), i(o).showModal();
    try {
      const G = await se.get(`/admin/api/image/${C.id}/similar`);
      T(l, G.similar || [], !0);
    } catch (G) {
      console.error(G);
    }
  }
  xt(f);
  function m() {
    i(s) + a < i(n) && (T(s, i(s) + a), f());
  }
  function _() {
    i(s) - a >= 0 && (T(s, i(s) - a), f());
  }
  var p = Hi(), E = ot(p), w = u(E), v = u(w), g = u(v), R = u(g), P = h(v, 2), N = u(P);
  N.__click = _;
  var I = h(N, 2), q = u(I), K = h(I, 2);
  K.__click = m;
  var A = h(w, 2);
  Di(A, {});
  var B = h(A, 2);
  {
    var S = (C) => {
      var G = Ti();
      D(C, G);
    }, y = (C) => {
      var G = Oi(), j = u(G);
      let V;
      Ee(j, 21, () => i(r), (z) => z.id, (z, U) => {
        var re = Fi(), ae = u(re), ue = u(ae), he = h(ue, 2);
        {
          var pe = (ut) => {
            var ct = Ai();
            ct.__click = () => d(i(U)), D(ut, ct);
          };
          ie(he, (ut) => {
            i(U).sig?.length > 0 && ut(pe);
          });
        }
        var Ye = h(ae, 2), Ae = u(Ye);
        Sr(Ae, {
          get sig() {
            return i(U).sig;
          }
        });
        var ge = h(Ae, 2), Me = u(ge), Ue = h(u(Me)), Je = u(Ue), Re = h(ge, 2), Ne = u(Re);
        W(() => {
          be(ue, "src", i(U).uri), be(Me, "href", `/admin/edit?id=${i(U).entry_id ?? ""}`), F(Je, i(U).entry_id), F(Ne, `ID: ${i(U).id ?? ""}`);
        }), D(z, re);
      });
      var ne = h(j, 2);
      {
        var Z = (z) => {
          var U = Pi();
          D(z, U);
        };
        ie(ne, (z) => {
          se.loading && z(Z);
        });
      }
      W(() => V = $e(j, 1, "grid svelte-xxb0sp", null, V, { "is-loading": se.loading })), D(C, G);
    };
    ie(B, (C) => {
      se.loading && i(r).length === 0 ? C(S) : C(y, !1);
    });
  }
  var M = h(E, 2), $ = u(M), x = h(u($), 2);
  x.__click = () => i(o).close();
  var b = h($, 2), k = u(b);
  {
    var L = (C) => {
      var G = Ii(), j = u(G), V = u(j), ne = u(V), Z = h(V, 2), z = u(Z);
      Sr(z, {
        get sig() {
          return i(c).sig;
        }
      }), W(() => be(ne, "src", i(c).uri)), D(C, G);
    };
    ie(k, (C) => {
      i(c) && C(L);
    });
  }
  var Q = h(k, 2);
  {
    var te = (C) => {
      var G = Ri();
      D(C, G);
    }, oe = (C) => {
      var G = dr(), j = ot(G);
      {
        var V = (Z) => {
          var z = Ni();
          D(Z, z);
        }, ne = (Z) => {
          var z = Li();
          let U;
          Ee(z, 21, () => i(l), (re) => re.id, (re, ae) => {
            var ue = Ci(), he = u(ue), pe = u(he), Ye = h(he, 2), Ae = u(Ye);
            Sr(Ae, {
              get sig() {
                return i(ae).sig;
              }
            });
            var ge = h(Ae, 2), Me = u(ge);
            Me.__click = () => i(o).close();
            var Ue = h(u(Me)), Je = u(Ue), Re = h(ge, 2), Ne = u(Re);
            W(() => {
              be(pe, "src", i(ae).uri), be(Me, "href", `/admin/edit?id=${i(ae).entry_id ?? ""}`), F(Je, i(ae).entry_id), F(Ne, `ID: ${i(ae).id ?? ""} / Score: ${i(ae).score ?? ""}`);
            }), D(re, ue);
          }), W(() => U = $e(z, 1, "grid similar-grid svelte-xxb0sp", null, U, { "is-loading": se.loading })), D(Z, z);
        };
        ie(
          j,
          (Z) => {
            i(l).length === 0 ? Z(V) : Z(ne, !1);
          },
          !0
        );
      }
      D(C, G);
    };
    ie(Q, (C) => {
      se.loading && i(l).length === 0 ? C(te) : C(oe, !1);
    });
  }
  kt(M, (C) => T(o, C), () => i(o)), W(
    (C) => {
      F(R, `画像一覧 (${i(n) ?? ""})`), N.disabled = i(s) === 0, F(q, `${i(s) + 1} - ${C ?? ""} / ${i(n) ?? ""}`), K.disabled = i(s) + a >= i(n);
    },
    [() => Math.min(i(s) + a, i(n))]
  ), D(e, p), et();
}
Vt(["click"]);
var qi = /* @__PURE__ */ O('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), ji = /* @__PURE__ */ O('<span class="term-badge svelte-6rw159"> </span>'), $i = /* @__PURE__ */ O('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">TF-IDF 統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総語彙数 (Terms)</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">インデックス済みエントリ</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">関連エントリ計算済み</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">総関連ペア数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">平均類似度スコア</th><td class="svelte-6rw159"> </td></tr></tbody></table></div> <div style="margin-top: 10px;" class="svelte-6rw159"><h4 class="svelte-6rw159">頻出単語 (Top 20 DF)</h4> <div class="top-terms svelte-6rw159"></div></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">画像統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総画像数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">未インデックス画像数</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), Bi = /* @__PURE__ */ O('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function zi(e, t) {
  Qe(t, !0);
  let r = /* @__PURE__ */ Y(null);
  async function s() {
    try {
      T(r, await se.get("/admin/api/info"), !0);
    } catch (f) {
      console.error(f);
    }
  }
  xt(s);
  function a(f) {
    if (f === 0) return "0 B";
    const d = 1024, m = ["B", "KB", "MB", "GB", "TB"], _ = Math.floor(Math.log(f) / Math.log(d));
    return parseFloat((f / Math.pow(d, _)).toFixed(2)) + " " + m[_];
  }
  var n = Bi(), l = h(u(n), 2);
  {
    var c = (f) => {
      var d = qi();
      D(f, d);
    }, o = (f) => {
      var d = dr(), m = ot(d);
      {
        var _ = (p) => {
          var E = $i(), w = u(E), v = h(u(w), 2), g = u(v), R = u(g), P = u(R), N = h(u(P)), I = u(N), q = h(P), K = h(u(q)), A = u(K), B = h(q), S = h(u(B)), y = u(S), M = h(B), $ = h(u(M)), x = u($), b = h(M), k = h(u(b)), L = u(k), Q = h(v, 2), te = h(u(Q), 2);
          Ee(te, 21, () => i(r).tfidf_stats?.top_terms ?? [], Le, (br, Zt) => {
            var Rt = ji(), wr = u(Rt);
            W(() => {
              be(Rt, "title", `DF: ${i(Zt).df ?? ""}`), F(wr, i(Zt).term);
            }), D(br, Rt);
          });
          var oe = h(w, 2), C = h(u(oe), 2), G = u(C), j = u(G), V = u(j), ne = h(u(V)), Z = u(ne), z = h(V), U = h(u(z)), re = u(U), ae = h(oe, 2), ue = h(u(ae), 2), he = u(ue), pe = u(he), Ye = u(pe), Ae = h(u(Ye)), ge = u(Ae), Me = h(Ye), Ue = h(u(Me)), Je = u(Ue), Re = u(Je), Ne = h(ae, 2), ut = h(u(Ne), 2), ct = u(ut), Kt = u(ct), Wt = u(Kt), hr = h(u(Wt)), _r = u(hr), It = h(Wt), pr = h(u(It)), H = u(pr), le = h(It), me = h(u(le)), Ce = u(me), rt = h(le), gr = h(u(rt)), mr = u(gr), Br = h(rt), Gs = h(u(Br)), Vs = u(Gs), zr = h(Br), Ks = h(u(zr)), Ws = u(Ks), Ur = h(zr), Zs = h(u(Ur)), Qs = u(Zs), en = h(Ur), tn = h(u(en)), rn = u(tn), sn = h(Ne, 2), nn = h(u(sn), 2), an = u(nn);
          W(
            (br, Zt, Rt, wr, ln, on) => {
              F(I, i(r).tfidf_stats?.total_terms ?? 0), F(A, i(r).tfidf_stats?.indexed_entries ?? 0), F(y, i(r).tfidf_stats?.entries_with_related ?? 0), F(x, i(r).tfidf_stats?.total_related_pairs ?? 0), F(L, br), F(Z, i(r).image_stats?.total_images ?? 0), F(re, i(r).image_stats?.unindexed_images ?? 0), F(ge, i(r).is_development), F(Re, i(r).app_hash), F(_r, i(r).debug_info.go_version), F(H, i(r).debug_info.num_goroutine), F(Ce, Zt), F(mr, i(r).debug_info.uptime), F(Vs, Rt), F(Ws, wr), F(Qs, ln), F(rn, i(r).debug_info.num_gc), F(an, on);
            },
            [
              () => i(r).tfidf_stats?.avg_score?.toFixed(4) ?? "0.0000",
              () => new Date(i(r).debug_info.start_time).toLocaleString(),
              () => a(i(r).debug_info.mem_alloc),
              () => a(i(r).debug_info.mem_total_alloc),
              () => a(i(r).debug_info.mem_sys),
              () => JSON.stringify(i(r).config, null, 2)
            ]
          ), D(p, E);
        };
        ie(
          m,
          (p) => {
            i(r) && p(_);
          },
          !0
        );
      }
      D(f, d);
    };
    ie(l, (f) => {
      se.loading && !i(r) ? f(c) : f(o, !1);
    });
  }
  D(e, n), et();
}
var Ui = /* @__PURE__ */ O("<a> </a>"), Ji = /* @__PURE__ */ O('<div class="admin-app svelte-1n46o8q"><header><div class="header-left svelte-1n46o8q"><h1 class="svelte-1n46o8q"><a href="/admin/" class="svelte-1n46o8q"><img src="/images/hanrangen-icon.svg" alt="Hanrangon" class="logo svelte-1n46o8q"/></a></h1> <div class="ci-badge svelte-1n46o8q"><a href="https://github.com/cho45/Hanrangon/actions/workflows/ci.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/ci.yml?branch=main&amp;label=ci&amp;style=flat-square" alt="CI Status" class="svelte-1n46o8q"/></a> <a href="https://github.com/cho45/Hanrangon/actions/workflows/lint.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/lint.yml?branch=main&amp;label=lint&amp;style=flat-square" alt="Lint Status" class="svelte-1n46o8q"/></a></div></div> <nav class="main-nav svelte-1n46o8q"><ul class="svelte-1n46o8q"><li><a href="/" class="svelte-1n46o8q">サイト確認</a></li> <li><a href="/logout" class="svelte-1n46o8q">ログアウト</a></li></ul></nav></header> <nav></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function Xi(e, t) {
  Qe(t, !0);
  let r = /* @__PURE__ */ Y(we(window.location.pathname)), s = /* @__PURE__ */ Y(we(new URLSearchParams(window.location.search)));
  xt(() => {
    const v = () => {
      T(r, window.location.pathname, !0), T(s, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", v), () => window.removeEventListener("popstate", v);
  });
  function a(v, g) {
    g && g.preventDefault(), window.history.pushState({}, "", v), T(r, window.location.pathname, !0), T(s, new URLSearchParams(window.location.search), !0);
  }
  const n = {
    "/admin/edit": {
      component: si,
      page: "edit",
      getProps: (v) => ({ id: v, onSave: (g) => window.location.href = g })
    },
    "/admin/jobs": { component: fi, page: "jobs", getProps: () => ({}) },
    "/admin/images": { component: Yi, page: "images", getProps: () => ({}) },
    "/admin/info": { component: zi, page: "info", getProps: () => ({}) },
    "/admin/": {
      component: Ga,
      page: "list",
      getProps: () => ({ onEdit: (v) => a(`/admin/edit?id=${v}`) })
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
  ], c = /* @__PURE__ */ nt(() => {
    const v = i(s).get("id"), g = n[i(r)] ?? n["/admin/"];
    return {
      ...g,
      props: g.getProps(v),
      isActive: (R) => !(R.page !== g.page || R.exact && v)
    };
  }), o = /* @__PURE__ */ nt(() => window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  var f = Ji(), d = u(f);
  let m;
  var _ = h(d, 2);
  let p;
  Ee(_, 21, () => l, Le, (v, g) => {
    var R = Ui();
    R.__click = (I) => a(i(g).path, I);
    let P;
    var N = u(R);
    W(
      (I) => {
        be(R, "href", i(g).path), P = $e(R, 1, "svelte-1n46o8q", null, P, I), F(N, i(g).label);
      },
      [() => ({ active: i(c).isActive(i(g)) })]
    ), D(v, R);
  });
  var E = h(_, 2), w = u(E);
  Ma(w, () => i(c).component, (v, g) => {
    g(v, Ra(() => i(c).props));
  }), W(() => {
    m = $e(d, 1, "svelte-1n46o8q", null, m, { "is-localhost": i(o) }), p = $e(_, 1, "sub-nav svelte-1n46o8q", null, p, { "is-localhost": i(o) });
  }), D(e, f), et();
}
Vt(["click"]);
const Er = document.getElementById("admin-root");
Er && (Er.innerHTML = "", ga(Xi, { target: Er }));
//# sourceMappingURL=admin-front.js.map
