var Tr = Array.isArray, is = Array.prototype.indexOf, nr = Array.from, ls = Object.defineProperty, Ke = Object.getOwnPropertyDescriptor, os = Object.getOwnPropertyDescriptors, us = Object.prototype, fs = Array.prototype, nn = Object.getPrototypeOf, $r = Object.isExtensible;
function Ft(e) {
  return typeof e == "function";
}
const sr = () => {
};
function cs(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function sn() {
  var e, t, r = new Promise((n, a) => {
    e = n, t = a;
  });
  return { promise: r, resolve: e, reject: t };
}
function an(e, t, r = !1) {
  return e === void 0 ? r ? (
    /** @type {() => V} */
    t()
  ) : (
    /** @type {V} */
    t
  ) : e;
}
const Z = 2, Ar = 4, Fr = 8, vs = 1 << 24, Ye = 16, Le = 32, ot = 64, ar = 128, Se = 512, te = 1024, ce = 2048, Te = 4096, fe = 8192, ze = 16384, Pr = 32768, rt = 65536, zr = 1 << 17, ln = 1 << 18, Mt = 1 << 19, ds = 1 << 20, Ne = 1 << 25, nt = 32768, Sr = 1 << 21, Nr = 1 << 22, Ue = 1 << 23, We = /* @__PURE__ */ Symbol("$state"), hs = /* @__PURE__ */ Symbol("legacy props"), _s = /* @__PURE__ */ Symbol(""), mt = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function ps(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function ms() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function gs(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function bs() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function ws(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function ys() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ms() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ss() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function xs() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function ks() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Es = 1, Ds = 2, on = 4, Ts = 8, As = 16, Fs = 1, Ps = 2, ee = /* @__PURE__ */ Symbol(), Ns = "http://www.w3.org/1999/xhtml";
function Is() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Rs() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function un(e) {
  return e === this.v;
}
function Os(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function fn(e) {
  return !Os(e, this.v);
}
let ve = null;
function bt(e) {
  ve = e;
}
function ut(e, t = !1, r) {
  ve = {
    p: ve,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function ft(e) {
  var t = (
    /** @type {ComponentContext} */
    ve
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      En(n);
  }
  return t.i = !0, ve = t.p, /** @type {T} */
  {};
}
function cn() {
  return !0;
}
let Ge = [];
function vn() {
  var e = Ge;
  Ge = [], cs(e);
}
function St(e) {
  if (Ge.length === 0 && !Ot) {
    var t = Ge;
    queueMicrotask(() => {
      t === Ge && vn();
    });
  }
  Ge.push(e);
}
function Ys() {
  for (; Ge.length > 0; )
    vn();
}
function dn(e) {
  var t = U;
  if (t === null)
    return C.f |= Ue, e;
  if ((t.f & Pr) === 0) {
    if ((t.f & ar) === 0)
      throw e;
    t.b.error(e);
  } else
    wt(e, t);
}
function wt(e, t) {
  for (; t !== null; ) {
    if ((t.f & ar) !== 0)
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
const Gt = /* @__PURE__ */ new Set();
let j = null, Rt = null, we = null, ge = [], ir = null, xr = !1, Ot = !1;
class Ee {
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
  #n = 0;
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
  #s = /* @__PURE__ */ new Set();
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
    ge = [], Rt = null, this.apply();
    var r = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const n of t)
      this.#i(n, r);
    this.is_fork || this.#f(), this.is_deferred() ? (this.#l(r.effects), this.#l(r.render_effects)) : (Rt = this, j = null, Ur(r.render_effects), Ur(r.effects), Rt = null, this.#o?.resolve()), we = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {EffectTarget} target
   */
  #i(t, r) {
    t.f ^= te;
    for (var n = t.first; n !== null; ) {
      var a = n.f, s = (a & (Le | ot)) !== 0, i = s && (a & te) !== 0, u = i || (a & fe) !== 0 || this.skipped_effects.has(n);
      if ((n.f & ar) !== 0 && n.b?.is_pending() && (r = {
        parent: r,
        effect: n,
        effects: [],
        render_effects: []
      }), !u && n.fn !== null) {
        s ? n.f ^= te : (a & Ar) !== 0 ? r.effects.push(n) : $t(n) && ((n.f & Ye) !== 0 && this.#a.add(n), jt(n));
        var o = n.first;
        if (o !== null) {
          n = o;
          continue;
        }
      }
      var f = n.parent;
      for (n = n.next; n === null && f !== null; )
        f === r.effect && (this.#l(r.effects), this.#l(r.render_effects), r = /** @type {EffectTarget} */
        r.parent), n = f.next, f = f.parent;
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #l(t) {
    for (const r of t)
      (r.f & ce) !== 0 ? this.#a.add(r) : (r.f & Te) !== 0 && this.#s.add(r), this.#u(r.deps), re(r, te);
  }
  /**
   * @param {Value[] | null} deps
   */
  #u(t) {
    if (t !== null)
      for (const r of t)
        (r.f & Z) === 0 || (r.f & nt) === 0 || (r.f ^= nt, this.#u(
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
    this.previous.has(t) || this.previous.set(t, r), (t.f & Ue) === 0 && (this.current.set(t, t.v), we?.set(t, t.v));
  }
  activate() {
    j = this, this.apply();
  }
  deactivate() {
    j === this && (j = null, we = null);
  }
  flush() {
    if (this.activate(), ge.length > 0) {
      if (hn(), j !== null && j !== this)
        return;
    } else this.#n === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of this.#t) t(this);
    this.#t.clear();
  }
  #f() {
    if (this.#r === 0) {
      for (const t of this.#e) t();
      this.#e.clear();
    }
    this.#n === 0 && this.#c();
  }
  #c() {
    if (Gt.size > 1) {
      this.previous.clear();
      var t = we, r = !0, n = {
        parent: null,
        effect: null,
        effects: [],
        render_effects: []
      };
      for (const s of Gt) {
        if (s === this) {
          r = !1;
          continue;
        }
        const i = [];
        for (const [o, f] of this.current) {
          if (s.current.has(o))
            if (r && f !== s.current.get(o))
              s.current.set(o, f);
            else
              continue;
          i.push(o);
        }
        if (i.length === 0)
          continue;
        const u = [...s.current.keys()].filter((o) => !this.current.has(o));
        if (u.length > 0) {
          var a = ge;
          ge = [];
          const o = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
          for (const v of i)
            _n(v, u, o, f);
          if (ge.length > 0) {
            j = s, s.apply();
            for (const v of ge)
              s.#i(v, n);
            s.deactivate();
          }
          ge = a;
        }
      }
      j = null, we = t;
    }
    this.committed = !0, Gt.delete(this);
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    this.#n += 1, t && (this.#r += 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    this.#n -= 1, t && (this.#r -= 1), this.revive();
  }
  revive() {
    for (const t of this.#a)
      this.#s.delete(t), re(t, ce), st(t);
    for (const t of this.#s)
      re(t, Te), st(t);
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
    return (this.#o ??= sn()).promise;
  }
  static ensure() {
    if (j === null) {
      const t = j = new Ee();
      Gt.add(j), Ot || Ee.enqueue(() => {
        j === t && t.flush();
      });
    }
    return j;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    St(t);
  }
  apply() {
  }
}
function Ls(e) {
  var t = Ot;
  Ot = !0;
  try {
    for (var r; ; ) {
      if (Ys(), ge.length === 0 && (j?.flush(), ge.length === 0))
        return ir = null, /** @type {T} */
        r;
      hn();
    }
  } finally {
    Ot = t;
  }
}
function hn() {
  var e = Qe;
  xr = !0;
  var t = null;
  try {
    var r = 0;
    for (er(!0); ge.length > 0; ) {
      var n = Ee.ensure();
      if (r++ > 1e3) {
        var a, s;
        Hs();
      }
      n.process(ge), Be.clear();
    }
  } finally {
    xr = !1, er(e), ir = null;
  }
}
function Hs() {
  try {
    ys();
  } catch (e) {
    wt(e, ir);
  }
}
let Pe = null;
function Ur(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (ze | fe)) === 0 && $t(n) && (Pe = /* @__PURE__ */ new Set(), jt(n), n.deps === null && n.first === null && n.nodes === null && (n.teardown === null && n.ac === null ? Fn(n) : n.fn = null), Pe?.size > 0)) {
        Be.clear();
        for (const a of Pe) {
          if ((a.f & (ze | fe)) !== 0) continue;
          const s = [a];
          let i = a.parent;
          for (; i !== null; )
            Pe.has(i) && (Pe.delete(i), s.push(i)), i = i.parent;
          for (let u = s.length - 1; u >= 0; u--) {
            const o = s[u];
            (o.f & (ze | fe)) === 0 && jt(o);
          }
        }
        Pe.clear();
      }
    }
    Pe = null;
  }
}
function _n(e, t, r, n) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const s = a.f;
      (s & Z) !== 0 ? _n(
        /** @type {Derived} */
        a,
        t,
        r,
        n
      ) : (s & (Nr | Ye)) !== 0 && (s & ce) === 0 && pn(a, t, n) && (re(a, ce), st(
        /** @type {Effect} */
        a
      ));
    }
}
function pn(e, t, r) {
  const n = r.get(e);
  if (n !== void 0) return n;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (t.includes(a))
        return !0;
      if ((a.f & Z) !== 0 && pn(
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
function st(e) {
  for (var t = ir = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (xr && t === U && (r & Ye) !== 0 && (r & ln) === 0)
      return;
    if ((r & (ot | Le)) !== 0) {
      if ((r & te) === 0) return;
      t.f ^= te;
    }
  }
  ge.push(t);
}
function Cs(e) {
  let t = 0, r = at(0), n;
  return () => {
    Ht() && (l(r), or(() => (t === 0 && (n = zt(() => e(() => Yt(r)))), t += 1, () => {
      St(() => {
        t -= 1, t === 0 && (n?.(), n = void 0, Yt(r));
      });
    })));
  };
}
var js = rt | Mt | ar;
function qs(e, t, r) {
  new $s(e, t, r);
}
class $s {
  /** @type {Boundary | null} */
  parent;
  #e = !1;
  /** @type {TemplateNode} */
  #t;
  /** @type {TemplateNode | null} */
  #n = null;
  /** @type {BoundaryProps} */
  #r;
  /** @type {((anchor: Node) => void)} */
  #o;
  /** @type {Effect} */
  #a;
  /** @type {Effect | null} */
  #s = null;
  /** @type {Effect | null} */
  #i = null;
  /** @type {Effect | null} */
  #l = null;
  /** @type {DocumentFragment | null} */
  #u = null;
  /** @type {TemplateNode | null} */
  #f = null;
  #c = 0;
  #v = 0;
  #h = !1;
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #d = null;
  #b = Cs(() => (this.#d = at(this.#c), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, n) {
    this.#t = t, this.#r = r, this.#o = n, this.parent = /** @type {Effect} */
    U.b, this.#e = !!this.#r.pending, this.#a = ur(() => {
      U.b = this;
      {
        var a = this.#m();
        try {
          this.#s = be(() => n(a));
        } catch (s) {
          this.error(s);
        }
        this.#v > 0 ? this.#p() : this.#e = !1;
      }
      return () => {
        this.#f?.remove();
      };
    }, js);
  }
  #w() {
    try {
      this.#s = be(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
    this.#e = !1;
  }
  #y() {
    const t = this.#r.pending;
    t && (this.#i = be(() => t(this.#t)), Ee.enqueue(() => {
      var r = this.#m();
      this.#s = this.#_(() => (Ee.ensure(), be(() => this.#o(r)))), this.#v > 0 ? this.#p() : (Ze(
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
    return this.#e && (this.#f = Ie(), this.#t.before(this.#f), t = this.#f), t;
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
    var r = U, n = C, a = ve;
    Ae(this.#a), ie(this.#a), bt(this.#a.ctx);
    try {
      return t();
    } catch (s) {
      return dn(s), null;
    } finally {
      Ae(r), ie(n), bt(a);
    }
  }
  #p() {
    const t = (
      /** @type {(anchor: Node) => void} */
      this.#r.pending
    );
    this.#s !== null && (this.#u = document.createDocumentFragment(), this.#u.append(
      /** @type {TemplateNode} */
      this.#f
    ), In(this.#s, this.#u)), this.#i === null && (this.#i = be(() => t(this.#t)));
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
    this.#v += t, this.#v === 0 && (this.#e = !1, this.#i && Ze(this.#i, () => {
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
    this.#g(t), this.#c += t, this.#d && yt(this.#d, this.#c);
  }
  get_effect_pending() {
    return this.#b(), l(
      /** @type {Source<number>} */
      this.#d
    );
  }
  /** @param {unknown} error */
  error(t) {
    var r = this.#r.onerror;
    let n = this.#r.failed;
    if (this.#h || !r && !n)
      throw t;
    this.#s && (le(this.#s), this.#s = null), this.#i && (le(this.#i), this.#i = null), this.#l && (le(this.#l), this.#l = null);
    var a = !1, s = !1;
    const i = () => {
      if (a) {
        Rs();
        return;
      }
      a = !0, s && ks(), Ee.ensure(), this.#c = 0, this.#l !== null && Ze(this.#l, () => {
        this.#l = null;
      }), this.#e = this.has_pending_snippet(), this.#s = this.#_(() => (this.#h = !1, be(() => this.#o(this.#t)))), this.#v > 0 ? this.#p() : this.#e = !1;
    };
    var u = C;
    try {
      ie(null), s = !0, r?.(t, i), s = !1;
    } catch (o) {
      wt(o, this.#a && this.#a.parent);
    } finally {
      ie(u);
    }
    n && St(() => {
      this.#l = this.#_(() => {
        Ee.ensure(), this.#h = !0;
        try {
          return be(() => {
            n(
              this.#t,
              () => t,
              () => i
            );
          });
        } catch (o) {
          return wt(
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
function zs(e, t, r, n) {
  const a = Ir;
  if (r.length === 0 && e.length === 0) {
    n(t.map(a));
    return;
  }
  var s = j, i = (
    /** @type {Effect} */
    U
  ), u = Us();
  function o() {
    Promise.all(r.map((f) => /* @__PURE__ */ Bs(f))).then((f) => {
      u();
      try {
        n([...t.map(a), ...f]);
      } catch (v) {
        (i.f & ze) === 0 && wt(v, i);
      }
      s?.deactivate(), Wt();
    }).catch((f) => {
      wt(f, i);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    u();
    try {
      return o();
    } finally {
      s?.deactivate(), Wt();
    }
  }) : o();
}
function Us() {
  var e = U, t = C, r = ve, n = j;
  return function(s = !0) {
    Ae(e), ie(t), bt(r), s && n?.activate();
  };
}
function Wt() {
  Ae(null), ie(null), bt(null);
}
// @__NO_SIDE_EFFECTS__
function Ir(e) {
  var t = Z | ce, r = C !== null && (C.f & Z) !== 0 ? (
    /** @type {Derived} */
    C
  ) : null;
  return U !== null && (U.f |= Mt), {
    ctx: ve,
    deps: null,
    effects: null,
    equals: un,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ee
    ),
    wv: 0,
    parent: r ?? U,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Bs(e, t) {
  let r = (
    /** @type {Effect | null} */
    U
  );
  r === null && ms();
  var n = (
    /** @type {Boundary} */
    r.b
  ), a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = at(
    /** @type {V} */
    ee
  ), i = !C, u = /* @__PURE__ */ new Map();
  return ra(() => {
    var o = sn();
    a = o.promise;
    try {
      Promise.resolve(e()).then(o.resolve, o.reject).then(() => {
        f === j && f.committed && f.deactivate(), Wt();
      });
    } catch (_) {
      o.reject(_), Wt();
    }
    var f = (
      /** @type {Batch} */
      j
    );
    if (i) {
      var v = !n.is_pending();
      n.update_pending_count(1), f.increment(v), u.get(f)?.reject(mt), u.delete(f), u.set(f, o);
    }
    const b = (_, m = void 0) => {
      if (f.activate(), m)
        m !== mt && (s.f |= Ue, yt(s, m));
      else {
        (s.f & Ue) !== 0 && (s.f ^= Ue), yt(s, _);
        for (const [T, w] of u) {
          if (u.delete(T), T === f) break;
          w.reject(mt);
        }
      }
      i && (n.update_pending_count(-1), f.decrement(v));
    };
    o.promise.then(b, (_) => b(null, _ || "unknown"));
  }), Lr(() => {
    for (const o of u.values())
      o.reject(mt);
  }), new Promise((o) => {
    function f(v) {
      function b() {
        v === a ? o(s) : f(a);
      }
      v.then(b, b);
    }
    f(a);
  });
}
// @__NO_SIDE_EFFECTS__
function Br(e) {
  const t = /* @__PURE__ */ Ir(e);
  return Rn(t), t;
}
// @__NO_SIDE_EFFECTS__
function Rr(e) {
  const t = /* @__PURE__ */ Ir(e);
  return t.equals = fn, t;
}
function mn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      le(
        /** @type {Effect} */
        t[r]
      );
  }
}
function Js(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & Z) === 0)
      return (t.f & ze) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Or(e) {
  var t, r = U;
  Ae(Js(e));
  try {
    e.f &= ~nt, mn(e), t = Hn(e);
  } finally {
    Ae(r);
  }
  return t;
}
function gn(e) {
  var t = Or(e);
  if (e.equals(t) || (j?.is_fork || (e.v = t), e.wv = Yn()), !xt)
    if (we !== null)
      (Ht() || j?.is_fork) && we.set(e, t);
    else {
      var r = (e.f & Se) === 0 ? Te : te;
      re(e, r);
    }
}
let kr = /* @__PURE__ */ new Set();
const Be = /* @__PURE__ */ new Map();
let bn = !1;
function at(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: un,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function Y(e, t) {
  const r = at(e);
  return Rn(r), r;
}
// @__NO_SIDE_EFFECTS__
function Xs(e, t = !1, r = !0) {
  const n = at(e);
  return t || (n.equals = fn), n;
}
function D(e, t, r = !1) {
  C !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!De || (C.f & zr) !== 0) && cn() && (C.f & (Z | Ye | Nr | zr)) !== 0 && !Re?.includes(e) && xs();
  let n = r ? ue(t) : t;
  return yt(e, n);
}
function yt(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    xt ? Be.set(e, t) : Be.set(e, r), e.v = t;
    var n = Ee.ensure();
    n.capture(e, r), (e.f & Z) !== 0 && ((e.f & ce) !== 0 && Or(
      /** @type {Derived} */
      e
    ), re(e, (e.f & Se) !== 0 ? te : Te)), e.wv = Yn(), wn(e, ce), U !== null && (U.f & te) !== 0 && (U.f & (Le | ot)) === 0 && (me === null ? aa([e]) : me.push(e)), !n.is_fork && kr.size > 0 && !bn && Vs();
  }
  return t;
}
function Vs() {
  bn = !1;
  var e = Qe;
  er(!0);
  const t = Array.from(kr);
  try {
    for (const r of t)
      (r.f & te) !== 0 && re(r, Te), $t(r) && jt(r);
  } finally {
    er(e);
  }
  kr.clear();
}
function Yt(e) {
  D(e, e.v + 1);
}
function wn(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, a = 0; a < n; a++) {
      var s = r[a], i = s.f, u = (i & ce) === 0;
      if (u && re(s, t), (i & Z) !== 0) {
        var o = (
          /** @type {Derived} */
          s
        );
        we?.delete(o), (i & nt) === 0 && (i & Se && (s.f |= nt), wn(o, Te));
      } else u && ((i & Ye) !== 0 && Pe !== null && Pe.add(
        /** @type {Effect} */
        s
      ), st(
        /** @type {Effect} */
        s
      ));
    }
}
function ue(e) {
  if (typeof e != "object" || e === null || We in e)
    return e;
  const t = nn(e);
  if (t !== us && t !== fs)
    return e;
  var r = /* @__PURE__ */ new Map(), n = Tr(e), a = /* @__PURE__ */ Y(0), s = et, i = (u) => {
    if (et === s)
      return u();
    var o = C, f = et;
    ie(null), Kr(s);
    var v = u();
    return ie(o), Kr(f), v;
  };
  return n && r.set("length", /* @__PURE__ */ Y(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, o, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && Ms();
        var v = r.get(o);
        return v === void 0 ? v = i(() => {
          var b = /* @__PURE__ */ Y(f.value);
          return r.set(o, b), b;
        }) : D(v, f.value, !0), !0;
      },
      deleteProperty(u, o) {
        var f = r.get(o);
        if (f === void 0) {
          if (o in u) {
            const v = i(() => /* @__PURE__ */ Y(ee));
            r.set(o, v), Yt(a);
          }
        } else
          D(f, ee), Yt(a);
        return !0;
      },
      get(u, o, f) {
        if (o === We)
          return e;
        var v = r.get(o), b = o in u;
        if (v === void 0 && (!b || Ke(u, o)?.writable) && (v = i(() => {
          var m = ue(b ? u[o] : ee), T = /* @__PURE__ */ Y(m);
          return T;
        }), r.set(o, v)), v !== void 0) {
          var _ = l(v);
          return _ === ee ? void 0 : _;
        }
        return Reflect.get(u, o, f);
      },
      getOwnPropertyDescriptor(u, o) {
        var f = Reflect.getOwnPropertyDescriptor(u, o);
        if (f && "value" in f) {
          var v = r.get(o);
          v && (f.value = l(v));
        } else if (f === void 0) {
          var b = r.get(o), _ = b?.v;
          if (b !== void 0 && _ !== ee)
            return {
              enumerable: !0,
              configurable: !0,
              value: _,
              writable: !0
            };
        }
        return f;
      },
      has(u, o) {
        if (o === We)
          return !0;
        var f = r.get(o), v = f !== void 0 && f.v !== ee || Reflect.has(u, o);
        if (f !== void 0 || U !== null && (!v || Ke(u, o)?.writable)) {
          f === void 0 && (f = i(() => {
            var _ = v ? ue(u[o]) : ee, m = /* @__PURE__ */ Y(_);
            return m;
          }), r.set(o, f));
          var b = l(f);
          if (b === ee)
            return !1;
        }
        return v;
      },
      set(u, o, f, v) {
        var b = r.get(o), _ = o in u;
        if (n && o === "length")
          for (var m = f; m < /** @type {Source<number>} */
          b.v; m += 1) {
            var T = r.get(m + "");
            T !== void 0 ? D(T, ee) : m in u && (T = i(() => /* @__PURE__ */ Y(ee)), r.set(m + "", T));
          }
        if (b === void 0)
          (!_ || Ke(u, o)?.writable) && (b = i(() => /* @__PURE__ */ Y(void 0)), D(b, ue(f)), r.set(o, b));
        else {
          _ = b.v !== ee;
          var w = i(() => ue(f));
          D(b, w);
        }
        var d = Reflect.getOwnPropertyDescriptor(u, o);
        if (d?.set && d.set.call(v, f), !_) {
          if (n && typeof o == "string") {
            var M = (
              /** @type {Source<number>} */
              r.get("length")
            ), R = Number(o);
            Number.isInteger(R) && R >= M.v && D(M, R + 1);
          }
          Yt(a);
        }
        return !0;
      },
      ownKeys(u) {
        l(a);
        var o = Reflect.ownKeys(u).filter((b) => {
          var _ = r.get(b);
          return _ === void 0 || _.v !== ee;
        });
        for (var [f, v] of r)
          v.v !== ee && !(f in u) && o.push(f);
        return o;
      },
      setPrototypeOf() {
        Ss();
      }
    }
  );
}
function Jr(e) {
  try {
    if (e !== null && typeof e == "object" && We in e)
      return e[We];
  } catch {
  }
  return e;
}
function Gs(e, t) {
  return Object.is(Jr(e), Jr(t));
}
var Xr, yn, Mn, Sn;
function Ks() {
  if (Xr === void 0) {
    Xr = window, yn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    Mn = Ke(t, "firstChild").get, Sn = Ke(t, "nextSibling").get, $r(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), $r(r) && (r.__t = void 0);
  }
}
function Ie(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Zt(e) {
  return (
    /** @type {TemplateNode | null} */
    Mn.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function qt(e) {
  return (
    /** @type {TemplateNode | null} */
    Sn.call(e)
  );
}
function c(e, t) {
  return /* @__PURE__ */ Zt(e);
}
function Qt(e, t = !1) {
  {
    var r = /* @__PURE__ */ Zt(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ qt(r) : r;
  }
}
function h(e, t = 1, r = !1) {
  let n = e;
  for (; t--; )
    n = /** @type {TemplateNode} */
    /* @__PURE__ */ qt(n);
  return n;
}
function Ws(e) {
  e.textContent = "";
}
function xn() {
  return !1;
}
let Vr = !1;
function Zs() {
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
function lr(e) {
  var t = C, r = U;
  ie(null), Ae(null);
  try {
    return e();
  } finally {
    ie(t), Ae(r);
  }
}
function Yr(e, t, r, n = r) {
  e.addEventListener(t, () => lr(r));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), n(!0);
  } : e.__on_r = () => n(!0), Zs();
}
function Qs(e) {
  U === null && (C === null && ws(), bs()), xt && gs();
}
function ea(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function He(e, t, r) {
  var n = U;
  n !== null && (n.f & fe) !== 0 && (e |= fe);
  var a = {
    ctx: ve,
    deps: null,
    nodes: null,
    f: e | ce | Se,
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
      jt(a), a.f |= Pr;
    } catch (u) {
      throw le(a), u;
    }
  else t !== null && st(a);
  var s = a;
  if (r && s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
  (s.f & Mt) === 0 && (s = s.first, (e & Ye) !== 0 && (e & rt) !== 0 && s !== null && (s.f |= rt)), s !== null && (s.parent = n, n !== null && ea(s, n), C !== null && (C.f & Z) !== 0 && (e & ot) === 0)) {
    var i = (
      /** @type {Derived} */
      C
    );
    (i.effects ??= []).push(s);
  }
  return a;
}
function Ht() {
  return C !== null && !De;
}
function Lr(e) {
  const t = He(Fr, null, !1);
  return re(t, te), t.teardown = e, t;
}
function kn(e) {
  Qs();
  var t = (
    /** @type {Effect} */
    U.f
  ), r = !C && (t & Le) !== 0 && (t & Pr) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      ve
    );
    (n.e ??= []).push(e);
  } else
    return En(e);
}
function En(e) {
  return He(Ar | ds, e, !1);
}
function ta(e) {
  Ee.ensure();
  const t = He(ot | Mt, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? Ze(t, () => {
      le(t), n(void 0);
    }) : (le(t), n(void 0));
  });
}
function Dn(e) {
  return He(Ar, e, !1);
}
function ra(e) {
  return He(Nr | Mt, e, !0);
}
function or(e, t = 0) {
  return He(Fr | t, e, !0);
}
function K(e, t = [], r = [], n = []) {
  zs(n, t, r, (a) => {
    He(Fr, () => e(...a.map(l)), !0);
  });
}
function ur(e, t = 0) {
  var r = He(Ye | t, e, !0);
  return r;
}
function be(e) {
  return He(Le | Mt, e, !0);
}
function Tn(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = xt, n = C;
    Gr(!0), ie(null);
    try {
      t.call(null);
    } finally {
      Gr(r), ie(n);
    }
  }
}
function An(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const a = r.ac;
    a !== null && lr(() => {
      a.abort(mt);
    });
    var n = r.next;
    (r.f & ot) !== 0 ? r.parent = null : le(r, t), r = n;
  }
}
function na(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & Le) === 0 && le(t), t = r;
  }
}
function le(e, t = !0) {
  var r = !1;
  (t || (e.f & ln) !== 0) && e.nodes !== null && e.nodes.end !== null && (sa(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), An(e, t && !r), tr(e, 0), re(e, ze);
  var n = e.nodes && e.nodes.t;
  if (n !== null)
    for (const s of n)
      s.stop();
  Tn(e);
  var a = e.parent;
  a !== null && a.first !== null && Fn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function sa(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ qt(e);
    e.remove(), e = r;
  }
}
function Fn(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Ze(e, t, r = !0) {
  var n = [];
  Pn(e, n, !0);
  var a = () => {
    r && le(e), t && t();
  }, s = n.length;
  if (s > 0) {
    var i = () => --s || a();
    for (var u of n)
      u.out(i);
  } else
    a();
}
function Pn(e, t, r) {
  if ((e.f & fe) === 0) {
    e.f ^= fe;
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const u of n)
        (u.is_global || r) && t.push(u);
    for (var a = e.first; a !== null; ) {
      var s = a.next, i = (a.f & rt) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (a.f & Le) !== 0 && (e.f & Ye) !== 0;
      Pn(a, t, i ? r : !1), a = s;
    }
  }
}
function Hr(e) {
  Nn(e, !0);
}
function Nn(e, t) {
  if ((e.f & fe) !== 0) {
    e.f ^= fe, (e.f & te) === 0 && (re(e, ce), st(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, a = (r.f & rt) !== 0 || (r.f & Le) !== 0;
      Nn(r, a ? t : !1), r = n;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const i of s)
        (i.is_global || t) && i.in();
  }
}
function In(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end; r !== null; ) {
      var a = r === n ? null : /* @__PURE__ */ qt(r);
      t.append(r), r = a;
    }
}
let Qe = !1;
function er(e) {
  Qe = e;
}
let xt = !1;
function Gr(e) {
  xt = e;
}
let C = null, De = !1;
function ie(e) {
  C = e;
}
let U = null;
function Ae(e) {
  U = e;
}
let Re = null;
function Rn(e) {
  C !== null && (Re === null ? Re = [e] : Re.push(e));
}
let se = null, oe = 0, me = null;
function aa(e) {
  me = e;
}
let On = 1, Ct = 0, et = Ct;
function Kr(e) {
  et = e;
}
function Yn() {
  return ++On;
}
function $t(e) {
  var t = e.f;
  if ((t & ce) !== 0)
    return !0;
  if (t & Z && (e.f &= ~nt), (t & Te) !== 0) {
    var r = e.deps;
    if (r !== null)
      for (var n = r.length, a = 0; a < n; a++) {
        var s = r[a];
        if ($t(
          /** @type {Derived} */
          s
        ) && gn(
          /** @type {Derived} */
          s
        ), s.wv > e.wv)
          return !0;
      }
    (t & Se) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    we === null && re(e, te);
  }
  return !1;
}
function Ln(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !Re?.includes(e))
    for (var a = 0; a < n.length; a++) {
      var s = n[a];
      (s.f & Z) !== 0 ? Ln(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (r ? re(s, ce) : (s.f & te) !== 0 && re(s, Te), st(
        /** @type {Effect} */
        s
      ));
    }
}
function Hn(e) {
  var t = se, r = oe, n = me, a = C, s = Re, i = ve, u = De, o = et, f = e.f;
  se = /** @type {null | Value[]} */
  null, oe = 0, me = null, C = (f & (Le | ot)) === 0 ? e : null, Re = null, bt(e.ctx), De = !1, et = ++Ct, e.ac !== null && (lr(() => {
    e.ac.abort(mt);
  }), e.ac = null);
  try {
    e.f |= Sr;
    var v = (
      /** @type {Function} */
      e.fn
    ), b = v(), _ = e.deps;
    if (se !== null) {
      var m;
      if (tr(e, oe), _ !== null && oe > 0)
        for (_.length = oe + se.length, m = 0; m < se.length; m++)
          _[oe + m] = se[m];
      else
        e.deps = _ = se;
      if (Ht() && (e.f & Se) !== 0)
        for (m = oe; m < _.length; m++)
          (_[m].reactions ??= []).push(e);
    } else _ !== null && oe < _.length && (tr(e, oe), _.length = oe);
    if (cn() && me !== null && !De && _ !== null && (e.f & (Z | Te | ce)) === 0)
      for (m = 0; m < /** @type {Source[]} */
      me.length; m++)
        Ln(
          me[m],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (Ct++, me !== null && (n === null ? n = me : n.push(.../** @type {Source[]} */
    me))), (e.f & Ue) !== 0 && (e.f ^= Ue), b;
  } catch (T) {
    return dn(T);
  } finally {
    e.f ^= Sr, se = t, oe = r, me = n, C = a, Re = s, bt(i), De = u, et = o;
  }
}
function ia(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = is.call(r, e);
    if (n !== -1) {
      var a = r.length - 1;
      a === 0 ? r = t.reactions = null : (r[n] = r[a], r.pop());
    }
  }
  r === null && (t.f & Z) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (se === null || !se.includes(t)) && (re(t, Te), (t.f & Se) !== 0 && (t.f ^= Se, t.f &= ~nt), mn(
    /** @type {Derived} **/
    t
  ), tr(
    /** @type {Derived} **/
    t,
    0
  ));
}
function tr(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      ia(e, r[n]);
}
function jt(e) {
  var t = e.f;
  if ((t & ze) === 0) {
    re(e, te);
    var r = U, n = Qe;
    U = e, Qe = !0;
    try {
      (t & (Ye | vs)) !== 0 ? na(e) : An(e), Tn(e);
      var a = Hn(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = On;
      var s;
    } finally {
      Qe = n, U = r;
    }
  }
}
async function Cn() {
  await Promise.resolve(), Ls();
}
function l(e) {
  var t = e.f, r = (t & Z) !== 0;
  if (C !== null && !De) {
    var n = U !== null && (U.f & ze) !== 0;
    if (!n && !Re?.includes(e)) {
      var a = C.deps;
      if ((C.f & Sr) !== 0)
        e.rv < Ct && (e.rv = Ct, se === null && a !== null && a[oe] === e ? oe++ : se === null ? se = [e] : se.includes(e) || se.push(e));
      else {
        (C.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [C] : s.includes(C) || s.push(C);
      }
    }
  }
  if (xt) {
    if (Be.has(e))
      return Be.get(e);
    if (r) {
      var i = (
        /** @type {Derived} */
        e
      ), u = i.v;
      return ((i.f & te) === 0 && i.reactions !== null || qn(i)) && (u = Or(i)), Be.set(i, u), u;
    }
  } else r && (!we?.has(e) || j?.is_fork && !Ht()) && (i = /** @type {Derived} */
  e, $t(i) && gn(i), Qe && Ht() && (i.f & Se) === 0 && jn(i));
  if (we?.has(e))
    return we.get(e);
  if ((e.f & Ue) !== 0)
    throw e.v;
  return e.v;
}
function jn(e) {
  if (e.deps !== null) {
    e.f ^= Se;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & Z) !== 0 && (t.f & Se) === 0 && jn(
        /** @type {Derived} */
        t
      );
  }
}
function qn(e) {
  if (e.v === ee) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Be.has(t) || (t.f & Z) !== 0 && qn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function zt(e) {
  var t = De;
  try {
    return De = !0, e();
  } finally {
    De = t;
  }
}
const la = -7169;
function re(e, t) {
  e.f = e.f & la | t;
}
const oa = ["touchstart", "touchmove"];
function ua(e) {
  return oa.includes(e);
}
const $n = /* @__PURE__ */ new Set(), Er = /* @__PURE__ */ new Set();
function fa(e, t, r, n = {}) {
  function a(s) {
    if (n.capture || Nt.call(t, s), !s.cancelBubble)
      return lr(() => r?.call(this, s));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? St(() => {
    t.addEventListener(e, a, n);
  }) : t.addEventListener(e, a, n), a;
}
function ca(e, t, r, n, a) {
  var s = { capture: n, passive: a }, i = fa(e, t, r, s);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Lr(() => {
    t.removeEventListener(e, i, s);
  });
}
function Ut(e) {
  for (var t = 0; t < e.length; t++)
    $n.add(e[t]);
  for (var r of Er)
    r(e);
}
let Wr = null;
function Nt(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, a = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Wr = e;
  var i = 0, u = Wr === e && e.__root;
  if (u) {
    var o = a.indexOf(u);
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
  if (s = /** @type {Element} */
  a[i] || e.target, s !== t) {
    ls(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || r;
      }
    });
    var v = C, b = U;
    ie(null), Ae(null);
    try {
      for (var _, m = []; s !== null; ) {
        var T = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var w = s["__" + n];
          w != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && w.call(s, e);
        } catch (d) {
          _ ? m.push(d) : _ = d;
        }
        if (e.cancelBubble || T === t || T === null)
          break;
        s = T;
      }
      if (_) {
        for (let d of m)
          queueMicrotask(() => {
            throw d;
          });
        throw _;
      }
    } finally {
      e.__root = t, delete e.currentTarget, ie(v), Ae(b);
    }
  }
}
function va(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function rr(e, t) {
  var r = (
    /** @type {Effect} */
    U
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function $(e, t) {
  var r = (t & Fs) !== 0, n = (t & Ps) !== 0, a, s = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = va(s ? e : "<!>" + e), r || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ Zt(a)));
    var i = (
      /** @type {TemplateNode} */
      n || yn ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Zt(i)
      ), o = (
        /** @type {TemplateNode} */
        i.lastChild
      );
      rr(u, o);
    } else
      rr(i, i);
    return i;
  };
}
function da(e = "") {
  {
    var t = Ie(e + "");
    return rr(t, t), t;
  }
}
function zn() {
  var e = document.createDocumentFragment(), t = document.createComment(""), r = Ie();
  return e.append(t, r), rr(t, r), e;
}
function L(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function F(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ??= e.nodeValue) && (e.__t = r, e.nodeValue = r + "");
}
function ha(e, t) {
  return _a(e, t);
}
const pt = /* @__PURE__ */ new Map();
function _a(e, { target: t, anchor: r, props: n = {}, events: a, context: s, intro: i = !0 }) {
  Ks();
  var u = /* @__PURE__ */ new Set(), o = (b) => {
    for (var _ = 0; _ < b.length; _++) {
      var m = b[_];
      if (!u.has(m)) {
        u.add(m);
        var T = ua(m);
        t.addEventListener(m, Nt, { passive: T });
        var w = pt.get(m);
        w === void 0 ? (document.addEventListener(m, Nt, { passive: T }), pt.set(m, 1)) : pt.set(m, w + 1);
      }
    }
  };
  o(nr($n)), Er.add(o);
  var f = void 0, v = ta(() => {
    var b = r ?? t.appendChild(Ie());
    return qs(
      /** @type {TemplateNode} */
      b,
      {
        pending: () => {
        }
      },
      (_) => {
        if (s) {
          ut({});
          var m = (
            /** @type {ComponentContext} */
            ve
          );
          m.c = s;
        }
        a && (n.$$events = a), f = e(_, n) || {}, s && ft();
      }
    ), () => {
      for (var _ of u) {
        t.removeEventListener(_, Nt);
        var m = (
          /** @type {number} */
          pt.get(_)
        );
        --m === 0 ? (document.removeEventListener(_, Nt), pt.delete(_)) : pt.set(_, m);
      }
      Er.delete(o), b !== r && b.parentNode?.removeChild(b);
    };
  });
  return pa.set(f, v), f;
}
let pa = /* @__PURE__ */ new WeakMap();
class Un {
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
  #n = /* @__PURE__ */ new Map();
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
      j
    );
    if (this.#e.has(t)) {
      var r = (
        /** @type {Key} */
        this.#e.get(t)
      ), n = this.#t.get(r);
      if (n)
        Hr(n), this.#r.delete(r);
      else {
        var a = this.#n.get(r);
        a && (this.#t.set(r, a.effect), this.#n.delete(r), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), n = a.effect);
      }
      for (const [s, i] of this.#e) {
        if (this.#e.delete(s), s === t)
          break;
        const u = this.#n.get(i);
        u && (le(u.effect), this.#n.delete(i));
      }
      for (const [s, i] of this.#t) {
        if (s === r || this.#r.has(s)) continue;
        const u = () => {
          if (Array.from(this.#e.values()).includes(s)) {
            var f = document.createDocumentFragment();
            In(i, f), f.append(Ie()), this.#n.set(s, { effect: i, fragment: f });
          } else
            le(i);
          this.#r.delete(s), this.#t.delete(s);
        };
        this.#o || !n ? (this.#r.add(s), Ze(i, u, !1)) : u();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #s = (t) => {
    this.#e.delete(t);
    const r = Array.from(this.#e.values());
    for (const [n, a] of this.#n)
      r.includes(n) || (le(a.effect), this.#n.delete(n));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, r) {
    var n = (
      /** @type {Batch} */
      j
    ), a = xn();
    if (r && !this.#t.has(t) && !this.#n.has(t))
      if (a) {
        var s = document.createDocumentFragment(), i = Ie();
        s.append(i), this.#n.set(t, {
          effect: be(() => r(i)),
          fragment: s
        });
      } else
        this.#t.set(
          t,
          be(() => r(this.anchor))
        );
    if (this.#e.set(n, t), a) {
      for (const [u, o] of this.#t)
        u === t ? n.skipped_effects.delete(o) : n.skipped_effects.add(o);
      for (const [u, o] of this.#n)
        u === t ? n.skipped_effects.delete(o.effect) : n.skipped_effects.add(o.effect);
      n.oncommit(this.#a), n.ondiscard(this.#s);
    } else
      this.#a();
  }
}
function ye(e, t, r = !1) {
  var n = new Un(e), a = r ? rt : 0;
  function s(i, u) {
    n.ensure(i, u);
  }
  ur(() => {
    var i = !1;
    t((u, o = !0) => {
      i = !0, s(o, u);
    }), i || s(!1, null);
  }, a);
}
function it(e, t) {
  return t;
}
function ma(e, t, r) {
  for (var n = [], a = t.length, s, i = t.length, u = 0; u < a; u++) {
    let b = t[u];
    Ze(
      b,
      () => {
        if (s) {
          if (s.pending.delete(b), s.done.add(b), s.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Dr(nr(s.done)), _.delete(s), _.size === 0 && (e.outrogroups = null);
          }
        } else
          i -= 1;
      },
      !1
    );
  }
  if (i === 0) {
    var o = n.length === 0 && r !== null;
    if (o) {
      var f = (
        /** @type {Element} */
        r
      ), v = (
        /** @type {Element} */
        f.parentNode
      );
      Ws(v), v.append(f), e.items.clear();
    }
    Dr(t, !o);
  } else
    s = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(s);
}
function Dr(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    le(e[r], t);
}
var Zr;
function lt(e, t, r, n, a, s = null) {
  var i = e, u = /* @__PURE__ */ new Map(), o = (t & on) !== 0;
  if (o) {
    var f = (
      /** @type {Element} */
      e
    );
    i = f.appendChild(Ie());
  }
  var v = null, b = /* @__PURE__ */ Rr(() => {
    var M = r();
    return Tr(M) ? M : M == null ? [] : nr(M);
  }), _, m = !0;
  function T() {
    d.fallback = v, ga(d, _, i, t, n), v !== null && (_.length === 0 ? (v.f & Ne) === 0 ? Hr(v) : (v.f ^= Ne, It(v, null, i)) : Ze(v, () => {
      v = null;
    }));
  }
  var w = ur(() => {
    _ = /** @type {V[]} */
    l(b);
    for (var M = _.length, R = /* @__PURE__ */ new Set(), P = (
      /** @type {Batch} */
      j
    ), H = xn(), A = 0; A < M; A += 1) {
      var z = _[A], J = n(z, A), E = m ? null : u.get(J);
      E ? (E.v && yt(E.v, z), E.i && yt(E.i, A), H && P.skipped_effects.delete(E.e)) : (E = ba(
        u,
        m ? i : Zr ??= Ie(),
        z,
        J,
        A,
        a,
        t,
        r
      ), m || (E.e.f |= Ne), u.set(J, E)), R.add(J);
    }
    if (M === 0 && s && !v && (m ? v = be(() => s(i)) : (v = be(() => s(Zr ??= Ie())), v.f |= Ne)), !m)
      if (H) {
        for (const [q, k] of u)
          R.has(q) || P.skipped_effects.add(k.e);
        P.oncommit(T), P.ondiscard(() => {
        });
      } else
        T();
    l(b);
  }), d = { effect: w, items: u, outrogroups: null, fallback: v };
  m = !1;
}
function ga(e, t, r, n, a) {
  var s = (n & Ts) !== 0, i = t.length, u = e.items, o = e.effect.first, f, v = null, b, _ = [], m = [], T, w, d, M;
  if (s)
    for (M = 0; M < i; M += 1)
      T = t[M], w = a(T, M), d = /** @type {EachItem} */
      u.get(w).e, (d.f & Ne) === 0 && (d.nodes?.a?.measure(), (b ??= /* @__PURE__ */ new Set()).add(d));
  for (M = 0; M < i; M += 1) {
    if (T = t[M], w = a(T, M), d = /** @type {EachItem} */
    u.get(w).e, e.outrogroups !== null)
      for (const k of e.outrogroups)
        k.pending.delete(d), k.done.delete(d);
    if ((d.f & Ne) !== 0)
      if (d.f ^= Ne, d === o)
        It(d, null, r);
      else {
        var R = v ? v.next : o;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), $e(e, v, d), $e(e, d, R), It(d, R, r), v = d, _ = [], m = [], o = v.next;
        continue;
      }
    if ((d.f & fe) !== 0 && (Hr(d), s && (d.nodes?.a?.unfix(), (b ??= /* @__PURE__ */ new Set()).delete(d))), d !== o) {
      if (f !== void 0 && f.has(d)) {
        if (_.length < m.length) {
          var P = m[0], H;
          v = P.prev;
          var A = _[0], z = _[_.length - 1];
          for (H = 0; H < _.length; H += 1)
            It(_[H], P, r);
          for (H = 0; H < m.length; H += 1)
            f.delete(m[H]);
          $e(e, A.prev, z.next), $e(e, v, A), $e(e, z, P), o = P, v = z, M -= 1, _ = [], m = [];
        } else
          f.delete(d), It(d, o, r), $e(e, d.prev, d.next), $e(e, d, v === null ? e.effect.first : v.next), $e(e, v, d), v = d;
        continue;
      }
      for (_ = [], m = []; o !== null && o !== d; )
        (f ??= /* @__PURE__ */ new Set()).add(o), m.push(o), o = o.next;
      if (o === null)
        continue;
    }
    (d.f & Ne) === 0 && _.push(d), v = d, o = d.next;
  }
  if (e.outrogroups !== null) {
    for (const k of e.outrogroups)
      k.pending.size === 0 && (Dr(nr(k.done)), e.outrogroups?.delete(k));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || f !== void 0) {
    var J = [];
    if (f !== void 0)
      for (d of f)
        (d.f & fe) === 0 && J.push(d);
    for (; o !== null; )
      (o.f & fe) === 0 && o !== e.fallback && J.push(o), o = o.next;
    var E = J.length;
    if (E > 0) {
      var q = (n & on) !== 0 && i === 0 ? r : null;
      if (s) {
        for (M = 0; M < E; M += 1)
          J[M].nodes?.a?.measure();
        for (M = 0; M < E; M += 1)
          J[M].nodes?.a?.fix();
      }
      ma(e, J, q);
    }
  }
  s && St(() => {
    if (b !== void 0)
      for (d of b)
        d.nodes?.a?.apply();
  });
}
function ba(e, t, r, n, a, s, i, u) {
  var o = (i & Es) !== 0 ? (i & As) === 0 ? /* @__PURE__ */ Xs(r, !1, !1) : at(r) : null, f = (i & Ds) !== 0 ? at(a) : null;
  return {
    v: o,
    i: f,
    e: be(() => (s(t, o ?? r, f ?? a, u), () => {
      e.delete(n);
    }))
  };
}
function It(e, t, r) {
  if (e.nodes)
    for (var n = e.nodes.start, a = e.nodes.end, s = t && (t.f & Ne) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; n !== null; ) {
      var i = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ qt(n)
      );
      if (s.before(n), n === a)
        return;
      n = i;
    }
}
function $e(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
function wa(e, t, r) {
  var n = new Un(e);
  ur(() => {
    var a = t() ?? null;
    n.ensure(a, a && ((s) => r(s, a)));
  }, rt);
}
const Qr = [...` 	
\r\f \v\uFEFF`];
function ya(e, t, r) {
  var n = e == null ? "" : "" + e;
  if (t && (n = n ? n + " " + t : t), r) {
    for (var a in r)
      if (r[a])
        n = n ? n + " " + a : a;
      else if (n.length)
        for (var s = a.length, i = 0; (i = n.indexOf(a, i)) >= 0; ) {
          var u = i + s;
          (i === 0 || Qr.includes(n[i - 1])) && (u === n.length || Qr.includes(n[u])) ? n = (i === 0 ? "" : n.substring(0, i)) + n.substring(u + 1) : i = u;
        }
  }
  return n === "" ? null : n;
}
function tt(e, t, r, n, a, s) {
  var i = e.__className;
  if (i !== r || i === void 0) {
    var u = ya(r, n, s);
    u == null ? e.removeAttribute("class") : e.className = u, e.__className = r;
  } else if (s && a !== s)
    for (var o in s) {
      var f = !!s[o];
      (a == null || f !== !!a[o]) && e.classList.toggle(o, f);
    }
  return s;
}
function Bn(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Tr(t))
      return Is();
    for (var n of e.options)
      n.selected = t.includes(Lt(n));
    return;
  }
  for (n of e.options) {
    var a = Lt(n);
    if (Gs(a, t)) {
      n.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function Ma(e) {
  var t = new MutationObserver(() => {
    Bn(e, e.__value);
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
  }), Lr(() => {
    t.disconnect();
  });
}
function Sa(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet(), a = !0;
  Yr(e, "change", (s) => {
    var i = s ? "[selected]" : ":checked", u;
    if (e.multiple)
      u = [].map.call(e.querySelectorAll(i), Lt);
    else {
      var o = e.querySelector(i) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      u = o && Lt(o);
    }
    r(u), j !== null && n.add(j);
  }), Dn(() => {
    var s = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        Rt ?? j
      );
      if (n.has(i))
        return;
    }
    if (Bn(e, s, a), a && s === void 0) {
      var u = e.querySelector(":checked");
      u !== null && (s = Lt(u), r(s));
    }
    e.__value = s, a = !1;
  }), Ma(e);
}
function Lt(e) {
  return "__value" in e ? e.__value : e.value;
}
const xa = /* @__PURE__ */ Symbol("is custom element"), ka = /* @__PURE__ */ Symbol("is html");
function Oe(e, t, r, n) {
  var a = Ea(e);
  a[t] !== (a[t] = r) && (t === "loading" && (e[_s] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Da(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Ea(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [xa]: e.nodeName.includes("-"),
      [ka]: e.namespaceURI === Ns
    }
  );
}
var en = /* @__PURE__ */ new Map();
function Da(e) {
  var t = e.getAttribute("is") || e.nodeName, r = en.get(t);
  if (r) return r;
  en.set(t, r = []);
  for (var n, a = e, s = Element.prototype; s !== a; ) {
    n = os(a);
    for (var i in n)
      n[i].set && r.push(i);
    a = nn(a);
  }
  return r;
}
function Kt(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet();
  Yr(e, "input", async (a) => {
    var s = a ? e.defaultValue : e.value;
    if (s = gr(e) ? br(s) : s, r(s), j !== null && n.add(j), await Cn(), s !== (s = t())) {
      var i = e.selectionStart, u = e.selectionEnd, o = e.value.length;
      if (e.value = s ?? "", u !== null) {
        var f = e.value.length;
        i === u && u === o && f > o ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = i, e.selectionEnd = Math.min(u, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  zt(t) == null && e.value && (r(gr(e) ? br(e.value) : e.value), j !== null && n.add(j)), or(() => {
    var a = t();
    if (e === document.activeElement) {
      var s = (
        /** @type {Batch} */
        Rt ?? j
      );
      if (n.has(s))
        return;
    }
    gr(e) && a === br(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
function Ta(e, t, r = t) {
  Yr(e, "change", (n) => {
    var a = n ? e.defaultChecked : e.checked;
    r(a);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  // If defaultChecked is set, then checked == defaultChecked
  zt(t) == null && r(e.checked), or(() => {
    var n = t();
    e.checked = !!n;
  });
}
function gr(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function br(e) {
  return e === "" ? null : +e;
}
function tn(e, t) {
  return e === t || e?.[We] === t;
}
function Pt(e = {}, t, r, n) {
  return Dn(() => {
    var a, s;
    return or(() => {
      a = s, s = [], zt(() => {
        e !== r(...s) && (t(e, ...s), a && tn(r(...a), e) && t(null, ...a));
      });
    }), () => {
      St(() => {
        s && tn(r(...s), e) && t(null, ...s);
      });
    };
  }), e;
}
const Aa = {
  get(e, t) {
    let r = e.props.length;
    for (; r--; ) {
      let n = e.props[r];
      if (Ft(n) && (n = n()), typeof n == "object" && n !== null && t in n) return n[t];
    }
  },
  set(e, t, r) {
    let n = e.props.length;
    for (; n--; ) {
      let a = e.props[n];
      Ft(a) && (a = a());
      const s = Ke(a, t);
      if (s && s.set)
        return s.set(r), !0;
    }
    return !1;
  },
  getOwnPropertyDescriptor(e, t) {
    let r = e.props.length;
    for (; r--; ) {
      let n = e.props[r];
      if (Ft(n) && (n = n()), typeof n == "object" && n !== null && t in n) {
        const a = Ke(n, t);
        return a && !a.configurable && (a.configurable = !0), a;
      }
    }
  },
  has(e, t) {
    if (t === We || t === hs) return !1;
    for (let r of e.props)
      if (Ft(r) && (r = r()), r != null && t in r) return !0;
    return !1;
  },
  ownKeys(e) {
    const t = [];
    for (let r of e.props)
      if (Ft(r) && (r = r()), !!r) {
        for (const n in r)
          t.includes(n) || t.push(n);
        for (const n of Object.getOwnPropertySymbols(r))
          t.includes(n) || t.push(n);
      }
    return t;
  }
};
function Fa(...e) {
  return new Proxy({ props: e }, Aa);
}
function Pa(e, t, r, n) {
  var a = (
    /** @type {V} */
    n
  ), s = !0, i = () => (s && (s = !1, a = /** @type {V} */
  n), a), u;
  u = /** @type {V} */
  e[t], u === void 0 && n !== void 0 && (u = i());
  var o;
  return o = () => {
    var f = (
      /** @type {V} */
      e[t]
    );
    return f === void 0 ? i() : (s = !0, f);
  }, o;
}
function kt(e) {
  ve === null && ps(), kn(() => {
    const t = zt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Na = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Na);
function Ia(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var wr = { exports: {} }, rn;
function Ra() {
  return rn || (rn = 1, (function(e) {
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
      }, r = t.en_US, n = new a(r, 0, !1);
      e.exports = n, typeof Date.now != "function" && (Date.now = function() {
        return +/* @__PURE__ */ new Date();
      });
      function a(w, d, M) {
        var R = w || r, P = d || 0, H = M || !1, A = 0, z;
        function J(k, g) {
          var S;
          if (g) {
            if (S = g.getTime(), H) {
              var y = v(g);
              if (g = new Date(S + y + P), v(g) !== y) {
                var p = v(g);
                g = new Date(S + p + P);
              }
            }
          } else {
            var O = Date.now();
            O > A ? (A = O, z = new Date(A), S = A, H && (z = new Date(A + v(z) + P))) : S = A, g = z;
          }
          return E(k, g, R, S);
        }
        function E(k, g, S, O) {
          for (var y = "", p = null, x = !1, N = k.length, B = !1, V = 0; V < N; V++) {
            var Q = k.charCodeAt(V);
            if (x === !0) {
              if (Q === 45) {
                p = "";
                continue;
              } else if (Q === 95) {
                p = " ";
                continue;
              } else if (Q === 48) {
                p = "0";
                continue;
              } else if (Q === 58) {
                B && T("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), B = !0;
                continue;
              }
              switch (Q) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  y += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  y += S.days[g.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  y += S.months[g.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  y += s(Math.floor(g.getFullYear() / 100), p);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  y += E(S.formats.D, g, S, O);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  y += E(S.formats.F, g, S, O);
                  break;
                // '00'
                // case 'H':
                case 72:
                  y += s(g.getHours(), p);
                  break;
                // '12'
                // case 'I':
                case 73:
                  y += s(u(g.getHours()), p);
                  break;
                // '000'
                // case 'L':
                case 76:
                  y += i(Math.floor(O % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  y += s(g.getMinutes(), p);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  y += g.getHours() < 12 ? S.am : S.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  y += E(S.formats.R, g, S, O);
                  break;
                // '00'
                // case 'S':
                case 83:
                  y += s(g.getSeconds(), p);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  y += E(S.formats.T, g, S, O);
                  break;
                // '00'
                // case 'U':
                case 85:
                  y += s(o(g, "sunday"), p);
                  break;
                // '00'
                // case 'W':
                case 87:
                  y += s(o(g, "monday"), p);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  y += E(S.formats.X, g, S, O);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  y += g.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (H && P === 0)
                    y += "GMT";
                  else {
                    var de = b(g);
                    y += de || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  y += S.shortDays[g.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  y += S.shortMonths[g.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  y += E(S.formats.c, g, S, O);
                  break;
                // '01'
                // case 'd':
                case 100:
                  y += s(g.getDate(), p);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  y += s(g.getDate(), p ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  y += S.shortMonths[g.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var he = new Date(g.getFullYear(), 0, 1), G = Math.ceil((g.getTime() - he.getTime()) / (1e3 * 60 * 60 * 24));
                  y += i(G);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  y += s(g.getHours(), p ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  y += s(u(g.getHours()), p ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  y += s(g.getMonth() + 1, p);
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
                  var G = g.getDate();
                  S.ordinalSuffixes ? y += String(G) + (S.ordinalSuffixes[G - 1] || f(G)) : y += String(G) + f(G);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  y += g.getHours() < 12 ? S.AM : S.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  y += E(S.formats.r, g, S, O);
                  break;
                // '0'
                // case 's':
                case 115:
                  y += Math.floor(O / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  y += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var G = g.getDay();
                  y += G === 0 ? 7 : G;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  y += E(S.formats.v, g, S, O);
                  break;
                // '4'
                // case 'w':
                case 119:
                  y += g.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  y += E(S.formats.x, g, S, O);
                  break;
                // '70'
                // case 'y':
                case 121:
                  y += s(g.getFullYear() % 100, p);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (H && P === 0)
                    y += B ? "+00:00" : "+0000";
                  else {
                    var ne;
                    P !== 0 ? ne = P / (60 * 1e3) : ne = -g.getTimezoneOffset();
                    var xe = ne < 0 ? "-" : "+", _e = B ? ":" : "", Fe = Math.floor(Math.abs(ne / 60)), pe = Math.abs(ne % 60);
                    y += xe + s(Fe) + _e + s(pe);
                  }
                  break;
                default:
                  x && (y += "%"), y += k[V];
                  break;
              }
              p = null, x = !1;
              continue;
            }
            if (Q === 37) {
              x = !0;
              continue;
            }
            y += k[V];
          }
          return y;
        }
        var q = J;
        return q.localize = function(k) {
          return new a(k || R, P, H);
        }, q.localizeByIdentifier = function(k) {
          var g = t[k];
          return g ? q.localize(g) : (T('[WARNING] No locale found with identifier "' + k + '".'), q);
        }, q.timezone = function(k) {
          var g = P, S = H, O = typeof k;
          if (O === "number" || O === "string")
            if (S = !0, O === "string") {
              var y = k[0] === "-" ? -1 : 1, p = parseInt(k.slice(1, 3), 10), x = parseInt(k.slice(3, 5), 10);
              g = y * (60 * p + x) * 60 * 1e3;
            } else O === "number" && (g = k * 60 * 1e3);
          return new a(R, g, S);
        }, q.utc = function() {
          return new a(R, P, !0);
        }, q;
      }
      function s(w, d) {
        return d === "" || w > 9 ? "" + w : (d == null && (d = "0"), d + w);
      }
      function i(w) {
        return w > 99 ? w : w > 9 ? "0" + w : "00" + w;
      }
      function u(w) {
        return w === 0 ? 12 : w > 12 ? w - 12 : w;
      }
      function o(w, d) {
        d = d || "sunday";
        var M = w.getDay();
        d === "monday" && (M === 0 ? M = 6 : M--);
        var R = Date.UTC(w.getFullYear(), 0, 1), P = Date.UTC(w.getFullYear(), w.getMonth(), w.getDate()), H = Math.floor((P - R) / 864e5), A = (H + 7 - M) / 7;
        return Math.floor(A);
      }
      function f(w) {
        var d = w % 10, M = w % 100;
        if (M >= 11 && M <= 13 || d === 0 || d >= 4)
          return "th";
        switch (d) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
        }
      }
      function v(w) {
        return (w.getTimezoneOffset() || 0) * 6e4;
      }
      function b(w, d) {
        return _() || m(w);
      }
      function _(w, d) {
        return null;
      }
      function m(w) {
        var d = w.toString().match(/\(([\w\s]+)\)/);
        return d && d[1];
      }
      function T(w) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(w);
      }
    })();
  })(wr)), wr.exports;
}
var Oa = Ra();
const gt = /* @__PURE__ */ Ia(Oa);
let yr = /* @__PURE__ */ Y(!1);
class Ya {
  constructor(t) {
    if (this.sk = "", this.fetchFn = t || (typeof window < "u" ? fetch.bind(window) : fetch), typeof document < "u") {
      const r = document.querySelector('meta[name="csrf-token"]');
      r && (this.sk = r.content);
    }
  }
  get loading() {
    return l(yr);
  }
  async request(t, r = {}) {
    D(yr, !0);
    try {
      const n = new URL(t, window.location.origin);
      r.params && Object.entries(r.params).forEach(([u, o]) => {
        n.searchParams.append(u, String(o));
      });
      const a = new Headers(r.headers || {});
      a.set("X-Requested-With", "fetch");
      let s = r.body;
      r.method && ["POST", "PUT", "PATCH", "DELETE"].includes(r.method.toUpperCase()) && (s instanceof FormData ? s.set("sk", this.sk) : s instanceof BodyInit);
      const i = await this.fetchFn(n.toString(), { ...r, headers: a, body: s });
      if (!i.ok)
        throw new Error(`API Error: ${i.status} ${i.statusText}`);
      return await i.json();
    } finally {
      D(yr, !1);
    }
  }
  get(t, r) {
    return this.request(t, { method: "GET", params: r });
  }
  post(t, r) {
    return this.request(t, { method: "POST", body: r });
  }
}
const W = new Ya(), La = (e, t = sr) => {
  var r = Ha(), n = c(r);
  K(() => {
    tt(r, 1, `status status-${t() ?? ""}`, "svelte-13s7gu4"), F(n, t());
  }), L(e, r);
};
var Ha = /* @__PURE__ */ $("<span> </span>"), Ca = /* @__PURE__ */ $('<time class="svelte-13s7gu4"> </time>'), ja = /* @__PURE__ */ $('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), qa = /* @__PURE__ */ $('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), $a = /* @__PURE__ */ $('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), za = /* @__PURE__ */ $('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), Ua = /* @__PURE__ */ $('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4">エントリ一覧</h2> <div class="search-box svelte-13s7gu4"><input type="text" placeholder="検索..." class="svelte-13s7gu4"/> <button class="svelte-13s7gu4">検索</button></div> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">新しい方へ</button> <button class="svelte-13s7gu4">古い方へ</button></div></div> <div><!></div></div>');
function Ba(e, t) {
  ut(t, !0);
  const r = (k, g = sr, S) => {
    let O = /* @__PURE__ */ Rr(() => an(S?.(), !0));
    var y = Ca(), p = c(y);
    K(
      (x) => {
        Oe(y, "datetime", g()), F(p, x);
      },
      [() => l(O) && g() ? _(g()) : "-"]
    ), L(k, y);
  };
  let n = /* @__PURE__ */ Y(ue([])), a = /* @__PURE__ */ Y(!1), s = 50, i = /* @__PURE__ */ Y(""), u = /* @__PURE__ */ Y(ue([]));
  async function o() {
    try {
      const k = l(u)[l(u).length - 1], g = { limit: s };
      l(i) && (g.q = l(i)), k && (g.cursor_id = k);
      const S = await W.get("/admin/api/entries", g);
      D(n, S.entries || [], !0), D(a, S.has_more || !1, !0);
    } catch (k) {
      console.error(k);
    }
  }
  function f() {
    D(u, [], !0), o();
  }
  kt(o);
  function v() {
    if (l(a) && l(n).length > 0) {
      const k = l(n)[l(n).length - 1];
      l(u).push(k.id), o();
    }
  }
  function b() {
    l(u).length > 0 && (l(u).pop(), o());
  }
  function _(k) {
    return k ? gt("%Y-%m-%d %H:%M", new Date(k)) : "-";
  }
  var m = Ua(), T = c(m), w = h(c(T), 2), d = c(w);
  d.__keydown = (k) => k.key === "Enter" && f();
  var M = h(d, 2);
  M.__click = f;
  var R = h(w, 2), P = c(R);
  P.__click = b;
  var H = h(P, 2);
  H.__click = v;
  var A = h(T, 2);
  let z;
  var J = c(A);
  {
    var E = (k) => {
      var g = ja();
      L(k, g);
    }, q = (k) => {
      var g = za(), S = Qt(g), O = h(c(S));
      lt(O, 21, () => l(n), it, (x, N) => {
        var B = qa(), V = c(B), Q = c(V), de = h(V), he = c(de), G = h(de), ne = c(G);
        La(ne, () => l(N).status);
        var xe = h(G), _e = c(xe), Fe = c(_e), pe = h(_e, 2), ke = c(pe), Ce = c(ke), Je = h(xe), ct = c(Je), vt = h(Je), dt = c(vt);
        r(dt, () => l(N).created_at);
        var ht = h(vt), je = c(ht);
        r(je, () => l(N).modified_at);
        var _t = h(ht), Et = c(_t);
        r(Et, () => l(N).publish_at?.Time, () => l(N).publish_at?.Valid);
        var Dt = h(_t), Xe = c(Dt);
        Xe.__click = () => t.onEdit(l(N).id), K(() => {
          F(Q, l(N).id), F(he, l(N).date), F(Fe, l(N).title), Oe(ke, "href", `/${l(N).path ?? ""}`), F(Ce, `/${l(N).path ?? ""}`), F(ct, l(N).format);
        }), L(x, B);
      });
      var y = h(S, 2);
      {
        var p = (x) => {
          var N = $a();
          L(x, N);
        };
        ye(y, (x) => {
          W.loading && x(p);
        });
      }
      L(k, g);
    };
    ye(J, (k) => {
      W.loading && l(n).length === 0 ? k(E) : k(q, !1);
    });
  }
  K(() => {
    P.disabled = l(u).length === 0 || W.loading, H.disabled = !l(a) || W.loading, z = tt(A, 1, "table-container svelte-13s7gu4", null, z, { "is-loading": W.loading });
  }), Kt(d, () => l(i), (k) => D(i, k)), L(e, m), ft();
}
Ut(["keydown", "click"]);
class Ja {
  #e;
  get exists() {
    return l(this.#e);
  }
  set exists(t) {
    D(this.#e, t, !0);
  }
  #t;
  get data() {
    return l(this.#t);
  }
  set data(t) {
    D(this.#t, t, !0);
  }
  constructor(t = typeof localStorage < "u" ? localStorage : null) {
    this.storage = t, this.timer = null, this.#e = /* @__PURE__ */ Y(!1), this.#t = /* @__PURE__ */ Y(null);
  }
  key(t) {
    return `nogag-backup-${t || "new"}`;
  }
  check(t, r) {
    if (!this.storage) return;
    const n = this.storage.getItem(this.key(t));
    if (n)
      try {
        const a = JSON.parse(n);
        (a.title !== r.title || a.body !== r.body) && (this.exists = !0, this.data = a);
      } catch (a) {
        console.error("Failed to parse backup", a);
      }
  }
  saveDebounced(t, r, n = 1e3) {
    this.timer && clearTimeout(this.timer), this.timer = setTimeout(
      () => {
        this.save(t, r);
      },
      n
    );
  }
  save(t, r) {
    if (!this.storage) return;
    const n = { title: r.title, body: r.body, time: Date.now() };
    this.storage.setItem(this.key(t), JSON.stringify(n)), this.exists = !1;
  }
  clear(t) {
    this.storage && (this.storage.removeItem(this.key(t)), this.exists = !1, this.data = null);
  }
}
var Xa = /* @__PURE__ */ $('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), Va = /* @__PURE__ */ $('<option class="svelte-7nstam"> </option>'), Ga = /* @__PURE__ */ $('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), Ka = /* @__PURE__ */ $('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), Wa = /* @__PURE__ */ $('<button id="restore" type="button" class="submit-button svelte-7nstam">復元...</button>'), Za = /* @__PURE__ */ $('<div role="option" tabindex="-1"> </div>'), Qa = /* @__PURE__ */ $('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam"> </button> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons svelte-7nstam"><div class="options svelte-7nstam"><label title="チェックを入れると指定した日時に公開されます（公開済みの記事も予約に戻せます）" class="svelte-7nstam"><input type="checkbox" class="svelte-7nstam"/> 公開を遅延</label> <!></div> <button type="button" class="submit-button svelte-7nstam"> </button> <!></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam" role="listbox" aria-label="タグを選択" tabindex="0"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog>', 1);
function ei(e, t) {
  ut(t, !0);
  let r = Pa(t, "id", 3, null);
  const n = new Ja();
  let a = /* @__PURE__ */ Y(ue({ id: null, title: "", body: "", status: null })), s = ue({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: "public",
    publishLater: !1,
    publishAt: ""
  }), i = /* @__PURE__ */ Y(!1), u = /* @__PURE__ */ Y(""), o = /* @__PURE__ */ Y(!1), f = /* @__PURE__ */ Y(null), v = /* @__PURE__ */ Y(null), b = /* @__PURE__ */ Y(null), _ = /* @__PURE__ */ Y(null), m = /* @__PURE__ */ Y(null);
  const T = [
    "tech",
    "photo",
    "redeveloped",
    "stablediffusion",
    "photoshopped"
  ];
  let w = /* @__PURE__ */ Y(0);
  async function d(p) {
    try {
      const x = await W.get(`/admin/api/entry/${p}`);
      D(a, x, !0), s.id = x.id, s.title = x.title, s.body = x.body, s.format = x.format || "Hatena", s.status = x.status, s.publishLater = x.status === "scheduled", x.publish_at?.Valid ? s.publishAt = gt("%Y-%m-%dT%H:%M", new Date(x.publish_at.Time)) : s.publishAt = gt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), n.check(l(a).id, { title: s.title, body: s.body });
    } catch (x) {
      console.error(x), alert("エントリの取得に失敗しました");
    }
  }
  kt(() => {
    r() ? d(r()) : (D(a, { id: null, title: "", body: "", status: "public" }, !0), s.id = null, s.title = "", s.body = "", s.format = "Hatena", s.status = "public", s.publishLater = !1, s.publishAt = gt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), n.check(null, { title: s.title, body: s.body }));
  }), kn(() => {
    (l(a).title !== s.title || l(a).body !== s.body) && n.saveDebounced(l(a).id, { title: s.title, body: s.body });
  });
  async function M() {
    D(i, !0), D(u, "リクエスト中");
    const p = new FormData();
    if (p.set("id", s.id ? String(s.id) : ""), p.set("title", s.title), p.set("body", s.body), p.set("format", s.format), s.publishLater) {
      const x = new Date(s.publishAt);
      p.set("publish_at", x.toISOString()), p.set("status", "scheduled");
    } else
      p.set("status", "public");
    try {
      const N = (await W.post("/admin/api/edit", p)).session_id;
      if (!N)
        throw new Error("保存に失敗しました");
      R(N);
    } catch (x) {
      D(i, !1), alert(x instanceof Error ? x.message : "エラーが発生しました");
    }
  }
  function R(p) {
    const x = new EventSource(`/admin/api/edit/progress?sid=${p}`);
    x.onmessage = (N) => {
      const B = JSON.parse(N.data);
      switch (B.type) {
        case "progress":
          D(u, P(B.message), !0);
          break;
        case "done":
          n.clear(l(a).id), D(u, "完了"), D(i, !1), x.close(), t.onSave(B.location);
          break;
        case "error":
          D(u, "エラー: " + B.message), D(i, !1), x.close(), alert("保存に失敗しました: " + B.message);
          break;
      }
    }, x.onerror = () => {
      D(i, !1), x.close(), alert("通信エラーが発生しました");
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
  function H() {
    D(w, 0), l(b).showModal(), setTimeout(() => l(m)?.focus(), 0);
  }
  function A(p) {
    p.key === "ArrowDown" ? (p.preventDefault(), D(w, (l(w) + 1) % T.length)) : p.key === "ArrowUp" ? (p.preventDefault(), D(w, (l(w) - 1 + T.length) % T.length)) : p.key === "Enter" || p.key === " " ? (p.preventDefault(), z(T[l(w)])) : p.key === "Escape" && l(b).close();
  }
  function z(p) {
    const x = `[${p}]`;
    s.title.includes(x) ? s.title = s.title.replace(x, "") : s.title = x + s.title, l(b).close(), l(f).focus();
  }
  function J() {
    n.data && (s.title = n.data.title, s.body = n.data.body, n.clear(l(a).id), l(_).close());
  }
  async function E() {
    const p = document.createElement("input");
    p.type = "file", p.oninput = async () => {
      if (!p.files?.[0]) return;
      const x = new FormData();
      x.append("file", p.files[0]), D(o, !0);
      try {
        const N = await W.post("/admin/api/upload/image", x), B = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${N.uploaded}" class="picasa" itemprop="url"><img src="${N.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        q(B, !0);
      } catch {
        alert("アップロードに失敗しました");
      } finally {
        D(o, !1);
      }
    }, p.click();
  }
  function q(p, x = !1) {
    const N = l(v).selectionStart, B = l(v).selectionEnd, V = l(v).value;
    s.body = V.substring(0, N) + p + V.substring(B), Cn().then(() => {
      typeof x == "boolean" && x ? (l(v).selectionStart = N, l(v).selectionEnd = N + p.length) : typeof x == "number" ? l(v).selectionStart = l(v).selectionEnd = N + x : l(v).selectionStart = l(v).selectionEnd = N + p.length, l(v).focus();
    });
  }
  function k(p) {
    (p.altKey ? "Alt-" : "") + (p.ctrlKey ? "Control-" : "") + (p.metaKey ? "Meta-" : "") + (p.shiftKey ? "Shift-" : "") + p.key === "Control-t" && (q("\\(  \\)", 3), p.preventDefault(), p.stopPropagation());
  }
  var g = zn(), S = Qt(g);
  {
    var O = (p) => {
      var x = Xa();
      L(p, x);
    }, y = (p) => {
      var x = Qa(), N = Qt(x), B = c(N), V = c(B);
      Pt(V, (I) => D(f, I), () => l(f));
      var Q = h(V, 2), de = c(Q);
      de.__click = H;
      var he = h(de, 2);
      he.__click = E;
      var G = c(he), ne = h(he, 2);
      lt(ne, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], it, (I, X) => {
        var ae = Va(), Me = c(ae), qe = {};
        K(() => {
          F(Me, X), qe !== (qe = X) && (ae.value = (ae.__value = X) ?? "");
        }), L(I, ae);
      });
      var xe = h(Q, 2), _e = c(xe);
      _e.__keydown = k, Pt(_e, (I) => D(v, I), () => l(v));
      var Fe = h(B, 2), pe = c(Fe);
      {
        var ke = (I) => {
          var X = Ga();
          L(I, X);
        };
        ye(pe, (I) => {
          l(i) && I(ke);
        });
      }
      var Ce = h(pe, 2), Je = c(Ce), ct = c(Je), vt = c(ct), dt = h(ct, 2);
      {
        var ht = (I) => {
          var X = Ka();
          Kt(X, () => s.publishAt, (ae) => s.publishAt = ae), L(I, X);
        };
        ye(dt, (I) => {
          s.publishLater && I(ht);
        });
      }
      var je = h(Je, 2);
      je.__click = M;
      var _t = c(je), Et = h(je, 2);
      {
        var Dt = (I) => {
          var X = Wa();
          X.__click = () => l(_).showModal(), L(I, X);
        };
        ye(Et, (I) => {
          n.exists && I(Dt);
        });
      }
      var Xe = h(N, 2), Ve = h(c(Xe), 2);
      Ve.__keydown = A, lt(Ve, 21, () => T, it, (I, X, ae) => {
        var Me = Za();
        let qe;
        Me.__click = () => z(l(X)), Me.__keydown = (_r) => _r.key === "Enter" && z(l(X));
        var hr = c(Me);
        K(() => {
          qe = tt(Me, 1, "tag-item svelte-7nstam", null, qe, { selected: l(w) === ae }), Oe(Me, "aria-selected", l(w) === ae), F(hr, l(X));
        }), ca("mouseenter", Me, () => D(w, ae, !0)), L(I, Me);
      }), Pt(Ve, (I) => D(m, I), () => l(m));
      var fr = h(Ve, 2);
      fr.__click = () => l(b).close(), Pt(Xe, (I) => D(b, I), () => l(b));
      var Bt = h(Xe, 2), Jt = h(c(Bt), 2), Xt = c(Jt);
      {
        var cr = (I) => {
          var X = da();
          K((ae) => F(X, ae), [() => gt("%Y年%m月%d日%H時", new Date(n.data.time))]), L(I, X);
        };
        ye(Xt, (I) => {
          n.data?.time && I(cr);
        });
      }
      var vr = h(Jt, 2), Tt = c(vr);
      Tt.__click = () => l(_).close();
      var dr = h(Tt, 2);
      dr.__click = J, Pt(Bt, (I) => D(_, I), () => l(_)), K(() => {
        he.disabled = l(o), F(G, l(o) ? "⌛ アップロード中..." : "📷 写真"), je.disabled = l(i), F(_t, l(i) ? l(u) || "リクエスト中" : r() ? "更新" : "作成");
      }), Kt(V, () => s.title, (I) => s.title = I), Sa(ne, () => s.format, (I) => s.format = I), Kt(_e, () => s.body, (I) => s.body = I), Ta(vt, () => s.publishLater, (I) => s.publishLater = I), L(p, x);
    };
    ye(S, (p) => {
      W.loading && !l(a).id ? p(O) : p(y, !1);
    });
  }
  L(e, g), ft();
}
Ut(["click", "keydown"]);
const ti = (e, t = sr) => {
  var r = ri(), n = c(r);
  K(() => {
    tt(r, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), F(n, t());
  }), L(e, r);
};
var ri = /* @__PURE__ */ $("<span> </span>"), ni = /* @__PURE__ */ $('<time class="time svelte-1r6codn"> </time>'), si = /* @__PURE__ */ $('<div class="loading svelte-1r6codn"></div>'), ai = /* @__PURE__ */ $('<div class="error-text svelte-1r6codn"> </div>'), ii = /* @__PURE__ */ $('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><!></td><td class="error svelte-1r6codn"><!></td></tr>'), li = /* @__PURE__ */ $('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), oi = /* @__PURE__ */ $('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">新しい方へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">古い方へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function ui(e, t) {
  ut(t, !0);
  const r = (E, q = sr, k) => {
    let g = /* @__PURE__ */ Rr(() => an(k?.(), !0));
    var S = ni(), O = c(S);
    K(
      (y) => {
        Oe(S, "datetime", q()), F(O, y);
      },
      [() => l(g) && q() ? v(q()) : "-"]
    ), L(E, S);
  };
  let n = /* @__PURE__ */ Y(ue([])), a = /* @__PURE__ */ Y(0), s = /* @__PURE__ */ Y(0), i = 50;
  async function u() {
    try {
      const E = await W.get("/admin/api/jobs", { limit: i, offset: l(s) });
      D(n, E.jobs || [], !0), D(a, E.total || 0, !0);
    } catch (E) {
      console.error(E);
    }
  }
  kt(u);
  function o() {
    l(s) + i < l(a) && (D(s, l(s) + i), u());
  }
  function f() {
    l(s) - i >= 0 && (D(s, l(s) - i), u());
  }
  function v(E) {
    return gt("%Y-%m-%d %H:%M:%S", new Date(E));
  }
  var b = oi(), _ = c(b), m = c(_), T = c(m), w = h(m, 2), d = c(w);
  d.__click = f;
  var M = h(d, 2), R = c(M), P = h(M, 2);
  P.__click = o;
  var H = h(P, 2);
  H.__click = u;
  var A = h(_, 2);
  {
    var z = (E) => {
      var q = si();
      L(E, q);
    }, J = (E) => {
      var q = li(), k = h(c(q));
      lt(k, 21, () => l(n), it, (g, S) => {
        var O = ii(), y = c(O), p = c(y), x = h(y), N = c(x), B = c(N), V = h(x), Q = c(V);
        ti(Q, () => l(S).status);
        var de = h(V), he = c(de), G = h(de), ne = c(G);
        r(ne, () => l(S).created_at);
        var xe = h(G), _e = c(xe);
        {
          var Fe = (pe) => {
            var ke = ai(), Ce = c(ke);
            K(() => {
              Oe(ke, "title", l(S).error_message.String), F(Ce, l(S).error_message.String);
            }), L(pe, ke);
          };
          ye(_e, (pe) => {
            l(S).error_message?.Valid && pe(Fe);
          });
        }
        K(() => {
          F(p, l(S).id), F(B, l(S).job_type_name), F(he, l(S).retry_count);
        }), L(g, O);
      }), L(E, q);
    };
    ye(A, (E) => {
      W.loading && l(n).length === 0 ? E(z) : E(J, !1);
    });
  }
  K(
    (E) => {
      F(T, `ジョブ一覧 (${l(a) ?? ""})`), d.disabled = l(s) === 0 || W.loading, F(R, `${l(s) + 1} - ${E ?? ""} / ${l(a) ?? ""}`), P.disabled = l(s) + i >= l(a) || W.loading;
    },
    [() => Math.min(l(s) + i, l(a))]
  ), L(e, b), ft();
}
Ut(["click"]);
var fi = /* @__PURE__ */ $('<div class="loading svelte-xxb0sp">読み込み中...</div>'), ci = /* @__PURE__ */ $('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><div class="id"> </div> <div class="entry-link svelte-xxb0sp"><a> </a></div></div></div>'), vi = /* @__PURE__ */ $('<div class="grid svelte-xxb0sp"></div>'), di = /* @__PURE__ */ $('<div class="image-list svelte-xxb0sp"><div class="header svelte-xxb0sp"><h2> </h2> <div class="pagination svelte-xxb0sp"><button>前へ</button> <span> </span> <button>次へ</button></div></div> <!></div>');
function hi(e, t) {
  ut(t, !0);
  let r = /* @__PURE__ */ Y(ue([])), n = /* @__PURE__ */ Y(0), a = 50, s = /* @__PURE__ */ Y(0);
  async function i() {
    try {
      const A = await W.get(`/admin/api/images?limit=${a}&offset=${l(s)}`);
      D(r, A.images, !0), D(n, A.total, !0);
    } catch (A) {
      console.error(A);
    }
  }
  kt(i);
  function u() {
    l(s) + a < l(n) && (D(s, l(s) + a), i());
  }
  function o() {
    l(s) - a >= 0 && (D(s, l(s) - a), i());
  }
  var f = di(), v = c(f), b = c(v), _ = c(b), m = h(b, 2), T = c(m);
  T.__click = o;
  var w = h(T, 2), d = c(w), M = h(w, 2);
  M.__click = u;
  var R = h(v, 2);
  {
    var P = (A) => {
      var z = fi();
      L(A, z);
    }, H = (A) => {
      var z = vi();
      lt(z, 21, () => l(r), it, (J, E) => {
        var q = ci(), k = c(q), g = c(k), S = h(k, 2), O = c(S), y = c(O), p = h(O, 2), x = c(p), N = c(x);
        K(() => {
          Oe(g, "src", l(E).uri), F(y, `ID: ${l(E).id ?? ""}`), Oe(x, "href", `/admin/edit?id=${l(E).entry_id ?? ""}`), F(N, `Entry: ${l(E).entry_id ?? ""}`);
        }), L(J, q);
      }), L(A, z);
    };
    ye(R, (A) => {
      W.loading && l(r).length === 0 ? A(P) : A(H, !1);
    });
  }
  K(
    (A) => {
      F(_, `画像一覧 (${l(n) ?? ""})`), T.disabled = l(s) === 0, F(d, `${l(s) + 1} - ${A ?? ""} / ${l(n) ?? ""}`), M.disabled = l(s) + a >= l(n);
    },
    [() => Math.min(l(s) + a, l(n))]
  ), L(e, f), ft();
}
Ut(["click"]);
var _i = /* @__PURE__ */ $('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), pi = /* @__PURE__ */ $('<span class="term-badge svelte-6rw159"> </span>'), mi = /* @__PURE__ */ $('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">TF-IDF 統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総語彙数 (Terms)</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">インデックス済みエントリ</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">関連エントリ計算済み</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">総関連ペア数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">平均類似度スコア</th><td class="svelte-6rw159"> </td></tr></tbody></table></div> <div style="margin-top: 10px;" class="svelte-6rw159"><h4 class="svelte-6rw159">頻出単語 (Top 20 DF)</h4> <div class="top-terms svelte-6rw159"></div></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">画像統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総画像数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">未インデックス画像数</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), gi = /* @__PURE__ */ $('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function bi(e, t) {
  ut(t, !0);
  let r = /* @__PURE__ */ Y(null);
  async function n() {
    try {
      D(r, await W.get("/admin/api/info"), !0);
    } catch (f) {
      console.error(f);
    }
  }
  kt(n);
  function a(f) {
    if (f === 0) return "0 B";
    const v = 1024, b = ["B", "KB", "MB", "GB", "TB"], _ = Math.floor(Math.log(f) / Math.log(v));
    return parseFloat((f / Math.pow(v, _)).toFixed(2)) + " " + b[_];
  }
  var s = gi(), i = h(c(s), 2);
  {
    var u = (f) => {
      var v = _i();
      L(f, v);
    }, o = (f) => {
      var v = zn(), b = Qt(v);
      {
        var _ = (m) => {
          var T = mi(), w = c(T), d = h(c(w), 2), M = c(d), R = c(M), P = c(R), H = h(c(P)), A = c(H), z = h(P), J = h(c(z)), E = c(J), q = h(z), k = h(c(q)), g = c(k), S = h(q), O = h(c(S)), y = c(O), p = h(S), x = h(c(p)), N = c(x), B = h(d, 2), V = h(c(B), 2);
          lt(V, 21, () => l(r).tfidf_stats.top_terms, it, (pr, Vt) => {
            var At = pi(), mr = c(At);
            K(() => {
              Oe(At, "title", `DF: ${l(Vt).df ?? ""}`), F(mr, l(Vt).term);
            }), L(pr, At);
          });
          var Q = h(w, 2), de = h(c(Q), 2), he = c(de), G = c(he), ne = c(G), xe = h(c(ne)), _e = c(xe), Fe = h(ne), pe = h(c(Fe)), ke = c(pe), Ce = h(Q, 2), Je = h(c(Ce), 2), ct = c(Je), vt = c(ct), dt = c(vt), ht = h(c(dt)), je = c(ht), _t = h(dt), Et = h(c(_t)), Dt = c(Et), Xe = c(Dt), Ve = h(Ce, 2), fr = h(c(Ve), 2), Bt = c(fr), Jt = c(Bt), Xt = c(Jt), cr = h(c(Xt)), vr = c(cr), Tt = h(Xt), dr = h(c(Tt)), I = c(dr), X = h(Tt), ae = h(c(X)), Me = c(ae), qe = h(X), hr = h(c(qe)), _r = c(hr), Cr = h(qe), Jn = h(c(Cr)), Xn = c(Jn), jr = h(Cr), Vn = h(c(jr)), Gn = c(Vn), qr = h(jr), Kn = h(c(qr)), Wn = c(Kn), Zn = h(qr), Qn = h(c(Zn)), es = c(Qn), ts = h(Ve, 2), rs = h(c(ts), 2), ns = c(rs);
          K(
            (pr, Vt, At, mr, ss, as) => {
              F(A, l(r).tfidf_stats.total_terms), F(E, l(r).tfidf_stats.indexed_entries), F(g, l(r).tfidf_stats.entries_with_related), F(y, l(r).tfidf_stats.total_related_pairs), F(N, pr), F(_e, l(r).image_stats.total_images), F(ke, l(r).image_stats.unindexed_images), F(je, l(r).is_development), F(Xe, l(r).app_hash), F(vr, l(r).debug_info.go_version), F(I, l(r).debug_info.num_goroutine), F(Me, Vt), F(_r, l(r).debug_info.uptime), F(Xn, At), F(Gn, mr), F(Wn, ss), F(es, l(r).debug_info.num_gc), F(ns, as);
            },
            [
              () => l(r).tfidf_stats.avg_score.toFixed(4),
              () => new Date(l(r).debug_info.start_time).toLocaleString(),
              () => a(l(r).debug_info.mem_alloc),
              () => a(l(r).debug_info.mem_total_alloc),
              () => a(l(r).debug_info.mem_sys),
              () => JSON.stringify(l(r).config, null, 2)
            ]
          ), L(m, T);
        };
        ye(
          b,
          (m) => {
            l(r) && m(_);
          },
          !0
        );
      }
      L(f, v);
    };
    ye(i, (f) => {
      W.loading && !l(r) ? f(u) : f(o, !1);
    });
  }
  L(e, s), ft();
}
var wi = /* @__PURE__ */ $("<a> </a>"), yi = /* @__PURE__ */ $('<div class="admin-app svelte-1n46o8q"><header><h1 class="svelte-1n46o8q"><a href="/admin/" class="svelte-1n46o8q"><img src="/images/hanrangen-icon.svg" alt="Hanrangon" class="logo svelte-1n46o8q"/></a></h1> <nav class="main-nav svelte-1n46o8q"><ul class="svelte-1n46o8q"><li><a href="/" class="svelte-1n46o8q">サイト確認</a></li> <li><a href="/logout" class="svelte-1n46o8q">ログアウト</a></li></ul></nav></header> <nav></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function Mi(e, t) {
  ut(t, !0);
  let r = /* @__PURE__ */ Y(ue(window.location.pathname)), n = /* @__PURE__ */ Y(ue(new URLSearchParams(window.location.search)));
  kt(() => {
    const d = () => {
      D(r, window.location.pathname, !0), D(n, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", d), () => window.removeEventListener("popstate", d);
  });
  function a(d, M) {
    M && M.preventDefault(), window.history.pushState({}, "", d), D(r, window.location.pathname, !0), D(n, new URLSearchParams(window.location.search), !0);
  }
  const s = {
    "/admin/edit": {
      component: ei,
      page: "edit",
      getProps: (d) => ({ id: d, onSave: (M) => window.location.href = M })
    },
    "/admin/jobs": { component: ui, page: "jobs", getProps: () => ({}) },
    "/admin/images": { component: hi, page: "images", getProps: () => ({}) },
    "/admin/info": { component: bi, page: "info", getProps: () => ({}) },
    "/admin/": {
      component: Ba,
      page: "list",
      getProps: () => ({ onEdit: (d) => a(`/admin/edit?id=${d}`) })
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
  ], u = /* @__PURE__ */ Br(() => {
    const d = l(n).get("id"), M = s[l(r)] ?? s["/admin/"];
    return {
      ...M,
      props: M.getProps(d),
      isActive: (R) => !(R.page !== M.page || R.exact && d)
    };
  }), o = /* @__PURE__ */ Br(() => window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  var f = yi(), v = c(f);
  let b;
  var _ = h(v, 2);
  let m;
  lt(_, 21, () => i, it, (d, M) => {
    var R = wi();
    R.__click = (A) => a(l(M).path, A);
    let P;
    var H = c(R);
    K(
      (A) => {
        Oe(R, "href", l(M).path), P = tt(R, 1, "svelte-1n46o8q", null, P, A), F(H, l(M).label);
      },
      [() => ({ active: l(u).isActive(l(M)) })]
    ), L(d, R);
  });
  var T = h(_, 2), w = c(T);
  wa(w, () => l(u).component, (d, M) => {
    M(d, Fa(() => l(u).props));
  }), K(() => {
    b = tt(v, 1, "svelte-1n46o8q", null, b, { "is-localhost": l(o) }), m = tt(_, 1, "sub-nav svelte-1n46o8q", null, m, { "is-localhost": l(o) });
  }), L(e, f), ft();
}
Ut(["click"]);
const Mr = document.getElementById("admin-root");
Mr && (Mr.innerHTML = "", ha(Mi, { target: Mr }));
//# sourceMappingURL=admin-front.js.map
