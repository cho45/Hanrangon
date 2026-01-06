var gr = Array.isArray, Hn = Array.prototype.indexOf, Zt = Array.from, Ln = Object.defineProperty, xt = Object.getOwnPropertyDescriptor, Cn = Object.getOwnPropertyDescriptors, jn = Object.prototype, qn = Array.prototype, Xr = Object.getPrototypeOf, Nr = Object.isExtensible;
const Qt = () => {
};
function zn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function $r() {
  var e, t, r = new Promise((s, a) => {
    e = s, t = a;
  });
  return { promise: r, resolve: e, reject: t };
}
function Vr(e, t, r = !1) {
  return e === void 0 ? r ? (
    /** @type {() => V} */
    t()
  ) : (
    /** @type {V} */
    t
  ) : e;
}
const K = 2, br = 4, wr = 8, Un = 1 << 24, Oe = 16, Ye = 32, tt = 64, er = 128, Me = 512, Z = 1024, ce = 2048, Te = 4096, fe = 8192, ze = 16384, yr = 32768, ft = 65536, Rr = 1 << 17, Gr = 1 << 18, _t = 1 << 19, Bn = 1 << 20, Re = 1 << 25, Ze = 32768, dr = 1 << 21, Mr = 1 << 22, Ue = 1 << 23, ut = /* @__PURE__ */ Symbol("$state"), Jn = /* @__PURE__ */ Symbol(""), lt = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Xn(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function $n() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Vn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Gn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Kn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Wn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Zn() {
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
const rs = 1, ns = 2, Kr = 4, ss = 8, as = 16, is = 1, ls = 2, W = /* @__PURE__ */ Symbol(), os = "http://www.w3.org/1999/xhtml";
function us() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function fs() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Wr(e) {
  return e === this.v;
}
function cs(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Zr(e) {
  return !cs(e, this.v);
}
let ve = null;
function ct(e) {
  ve = e;
}
function pt(e, t = !1, r) {
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
function mt(e) {
  var t = (
    /** @type {ComponentContext} */
    ve
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var s of r)
      _n(s);
  }
  return t.i = !0, ve = t.p, /** @type {T} */
  {};
}
function Qr() {
  return !0;
}
let Ve = [];
function en() {
  var e = Ve;
  Ve = [], zn(e);
}
function gt(e) {
  if (Ve.length === 0 && !At) {
    var t = Ve;
    queueMicrotask(() => {
      t === Ve && en();
    });
  }
  Ve.push(e);
}
function vs() {
  for (; Ve.length > 0; )
    en();
}
function tn(e) {
  var t = z;
  if (t === null)
    return P.f |= Ue, e;
  if ((t.f & yr) === 0) {
    if ((t.f & er) === 0)
      throw e;
    t.b.error(e);
  } else
    vt(e, t);
}
function vt(e, t) {
  for (; t !== null; ) {
    if ((t.f & er) !== 0)
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
const zt = /* @__PURE__ */ new Set();
let Y = null, Tt = null, we = null, ge = [], tr = null, hr = !1, At = !1;
class De {
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
    ge = [], Tt = null, this.apply();
    var r = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const s of t)
      this.#i(s, r);
    this.is_fork || this.#f(), this.is_deferred() ? (this.#l(r.effects), this.#l(r.render_effects)) : (Tt = this, Y = null, Ir(r.render_effects), Ir(r.effects), Tt = null, this.#o?.resolve()), we = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {EffectTarget} target
   */
  #i(t, r) {
    t.f ^= Z;
    for (var s = t.first; s !== null; ) {
      var a = s.f, n = (a & (Ye | tt)) !== 0, i = n && (a & Z) !== 0, o = i || (a & fe) !== 0 || this.skipped_effects.has(s);
      if ((s.f & er) !== 0 && s.b?.is_pending() && (r = {
        parent: r,
        effect: s,
        effects: [],
        render_effects: []
      }), !o && s.fn !== null) {
        n ? s.f ^= Z : (a & br) !== 0 ? r.effects.push(s) : Ht(s) && ((s.f & Oe) !== 0 && this.#a.add(s), Pt(s));
        var l = s.first;
        if (l !== null) {
          s = l;
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
      (r.f & ce) !== 0 ? this.#a.add(r) : (r.f & Te) !== 0 && this.#s.add(r), this.#u(r.deps), Q(r, Z);
  }
  /**
   * @param {Value[] | null} deps
   */
  #u(t) {
    if (t !== null)
      for (const r of t)
        (r.f & K) === 0 || (r.f & Ze) === 0 || (r.f ^= Ze, this.#u(
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
    Y = this, this.apply();
  }
  deactivate() {
    Y === this && (Y = null, we = null);
  }
  flush() {
    if (this.activate(), ge.length > 0) {
      if (rn(), Y !== null && Y !== this)
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
    if (zt.size > 1) {
      this.previous.clear();
      var t = we, r = !0, s = {
        parent: null,
        effect: null,
        effects: [],
        render_effects: []
      };
      for (const n of zt) {
        if (n === this) {
          r = !1;
          continue;
        }
        const i = [];
        for (const [l, f] of this.current) {
          if (n.current.has(l))
            if (r && f !== n.current.get(l))
              n.current.set(l, f);
            else
              continue;
          i.push(l);
        }
        if (i.length === 0)
          continue;
        const o = [...n.current.keys()].filter((l) => !this.current.has(l));
        if (o.length > 0) {
          var a = ge;
          ge = [];
          const l = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
          for (const c of i)
            nn(c, o, l, f);
          if (ge.length > 0) {
            Y = n, n.apply();
            for (const c of ge)
              n.#i(c, s);
            n.deactivate();
          }
          ge = a;
        }
      }
      Y = null, we = t;
    }
    this.committed = !0, zt.delete(this);
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
      this.#s.delete(t), Q(t, ce), Qe(t);
    for (const t of this.#s)
      Q(t, Te), Qe(t);
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
    return (this.#o ??= $r()).promise;
  }
  static ensure() {
    if (Y === null) {
      const t = Y = new De();
      zt.add(Y), At || De.enqueue(() => {
        Y === t && t.flush();
      });
    }
    return Y;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    gt(t);
  }
  apply() {
  }
}
function ds(e) {
  var t = At;
  At = !0;
  try {
    for (var r; ; ) {
      if (vs(), ge.length === 0 && (Y?.flush(), ge.length === 0))
        return tr = null, /** @type {T} */
        r;
      rn();
    }
  } finally {
    At = t;
  }
}
function rn() {
  var e = Ke;
  hr = !0;
  var t = null;
  try {
    var r = 0;
    for (Xt(!0); ge.length > 0; ) {
      var s = De.ensure();
      if (r++ > 1e3) {
        var a, n;
        hs();
      }
      s.process(ge), Be.clear();
    }
  } finally {
    hr = !1, Xt(e), tr = null;
  }
}
function hs() {
  try {
    Wn();
  } catch (e) {
    vt(e, tr);
  }
}
let Ne = null;
function Ir(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var s = e[r++];
      if ((s.f & (ze | fe)) === 0 && Ht(s) && (Ne = /* @__PURE__ */ new Set(), Pt(s), s.deps === null && s.first === null && s.nodes === null && (s.teardown === null && s.ac === null ? bn(s) : s.fn = null), Ne?.size > 0)) {
        Be.clear();
        for (const a of Ne) {
          if ((a.f & (ze | fe)) !== 0) continue;
          const n = [a];
          let i = a.parent;
          for (; i !== null; )
            Ne.has(i) && (Ne.delete(i), n.push(i)), i = i.parent;
          for (let o = n.length - 1; o >= 0; o--) {
            const l = n[o];
            (l.f & (ze | fe)) === 0 && Pt(l);
          }
        }
        Ne.clear();
      }
    }
    Ne = null;
  }
}
function nn(e, t, r, s) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const n = a.f;
      (n & K) !== 0 ? nn(
        /** @type {Derived} */
        a,
        t,
        r,
        s
      ) : (n & (Mr | Oe)) !== 0 && (n & ce) === 0 && sn(a, t, s) && (Q(a, ce), Qe(
        /** @type {Effect} */
        a
      ));
    }
}
function sn(e, t, r) {
  const s = r.get(e);
  if (s !== void 0) return s;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (t.includes(a))
        return !0;
      if ((a.f & K) !== 0 && sn(
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
function Qe(e) {
  for (var t = tr = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (hr && t === z && (r & Oe) !== 0 && (r & Gr) === 0)
      return;
    if ((r & (tt | Ye)) !== 0) {
      if ((r & Z) === 0) return;
      t.f ^= Z;
    }
  }
  ge.push(t);
}
function _s(e) {
  let t = 0, r = et(0), s;
  return () => {
    Rt() && (u(r), nr(() => (t === 0 && (s = Lt(() => e(() => Ft(r)))), t += 1, () => {
      gt(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, Ft(r));
      });
    })));
  };
}
var ps = ft | _t | er;
function ms(e, t, r) {
  new gs(e, t, r);
}
class gs {
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
  #b = _s(() => (this.#d = et(this.#c), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, s) {
    this.#t = t, this.#r = r, this.#o = s, this.parent = /** @type {Effect} */
    z.b, this.#e = !!this.#r.pending, this.#a = Tr(() => {
      z.b = this;
      {
        var a = this.#m();
        try {
          this.#s = be(() => s(a));
        } catch (n) {
          this.error(n);
        }
        this.#v > 0 ? this.#p() : this.#e = !1;
      }
      return () => {
        this.#f?.remove();
      };
    }, ps);
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
    t && (this.#i = be(() => t(this.#t)), De.enqueue(() => {
      var r = this.#m();
      this.#s = this.#_(() => (De.ensure(), be(() => this.#o(r)))), this.#v > 0 ? this.#p() : (Ge(
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
    var r = z, s = P, a = ve;
    Ae(this.#a), ie(this.#a), ct(this.#a.ctx);
    try {
      return t();
    } catch (n) {
      return tn(n), null;
    } finally {
      Ae(r), ie(s), ct(a);
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
    ), Mn(this.#s, this.#u)), this.#i === null && (this.#i = be(() => t(this.#t)));
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
    this.#v += t, this.#v === 0 && (this.#e = !1, this.#i && Ge(this.#i, () => {
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
    this.#g(t), this.#c += t, this.#d && dt(this.#d, this.#c);
  }
  get_effect_pending() {
    return this.#b(), u(
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
    this.#s && (le(this.#s), this.#s = null), this.#i && (le(this.#i), this.#i = null), this.#l && (le(this.#l), this.#l = null);
    var a = !1, n = !1;
    const i = () => {
      if (a) {
        fs();
        return;
      }
      a = !0, n && ts(), De.ensure(), this.#c = 0, this.#l !== null && Ge(this.#l, () => {
        this.#l = null;
      }), this.#e = this.has_pending_snippet(), this.#s = this.#_(() => (this.#h = !1, be(() => this.#o(this.#t)))), this.#v > 0 ? this.#p() : this.#e = !1;
    };
    var o = P;
    try {
      ie(null), n = !0, r?.(t, i), n = !1;
    } catch (l) {
      vt(l, this.#a && this.#a.parent);
    } finally {
      ie(o);
    }
    s && gt(() => {
      this.#l = this.#_(() => {
        De.ensure(), this.#h = !0;
        try {
          return be(() => {
            s(
              this.#t,
              () => t,
              () => i
            );
          });
        } catch (l) {
          return vt(
            l,
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
function bs(e, t, r, s) {
  const a = Sr;
  if (r.length === 0 && e.length === 0) {
    s(t.map(a));
    return;
  }
  var n = Y, i = (
    /** @type {Effect} */
    z
  ), o = ws();
  function l() {
    Promise.all(r.map((f) => /* @__PURE__ */ ys(f))).then((f) => {
      o();
      try {
        s([...t.map(a), ...f]);
      } catch (c) {
        (i.f & ze) === 0 && vt(c, i);
      }
      n?.deactivate(), Bt();
    }).catch((f) => {
      vt(f, i);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    o();
    try {
      return l();
    } finally {
      n?.deactivate(), Bt();
    }
  }) : l();
}
function ws() {
  var e = z, t = P, r = ve, s = Y;
  return function(n = !0) {
    Ae(e), ie(t), ct(r), n && s?.activate();
  };
}
function Bt() {
  Ae(null), ie(null), ct(null);
}
// @__NO_SIDE_EFFECTS__
function Sr(e) {
  var t = K | ce, r = P !== null && (P.f & K) !== 0 ? (
    /** @type {Derived} */
    P
  ) : null;
  return z !== null && (z.f |= _t), {
    ctx: ve,
    deps: null,
    effects: null,
    equals: Wr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      W
    ),
    wv: 0,
    parent: r ?? z,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function ys(e, t) {
  let r = (
    /** @type {Effect | null} */
    z
  );
  r === null && $n();
  var s = (
    /** @type {Boundary} */
    r.b
  ), a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), n = et(
    /** @type {V} */
    W
  ), i = !P, o = /* @__PURE__ */ new Map();
  return Rs(() => {
    var l = $r();
    a = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).then(() => {
        f === Y && f.committed && f.deactivate(), Bt();
      });
    } catch (_) {
      l.reject(_), Bt();
    }
    var f = (
      /** @type {Batch} */
      Y
    );
    if (i) {
      var c = !s.is_pending();
      s.update_pending_count(1), f.increment(c), o.get(f)?.reject(lt), o.delete(f), o.set(f, l);
    }
    const g = (_, p = void 0) => {
      if (f.activate(), p)
        p !== lt && (n.f |= Ue, dt(n, p));
      else {
        (n.f & Ue) !== 0 && (n.f ^= Ue), dt(n, _);
        for (const [T, b] of o) {
          if (o.delete(T), T === f) break;
          b.reject(lt);
        }
      }
      i && (s.update_pending_count(-1), f.decrement(c));
    };
    l.promise.then(g, (_) => g(null, _ || "unknown"));
  }), xr(() => {
    for (const l of o.values())
      l.reject(lt);
  }), new Promise((l) => {
    function f(c) {
      function g() {
        c === a ? l(n) : f(a);
      }
      c.then(g, g);
    }
    f(a);
  });
}
// @__NO_SIDE_EFFECTS__
function Pr(e) {
  const t = /* @__PURE__ */ Sr(e);
  return Sn(t), t;
}
// @__NO_SIDE_EFFECTS__
function kr(e) {
  const t = /* @__PURE__ */ Sr(e);
  return t.equals = Zr, t;
}
function an(e) {
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
function Ms(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & K) === 0)
      return (t.f & ze) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Er(e) {
  var t, r = z;
  Ae(Ms(e));
  try {
    e.f &= ~Ze, an(e), t = xn(e);
  } finally {
    Ae(r);
  }
  return t;
}
function ln(e) {
  var t = Er(e);
  if (e.equals(t) || (Y?.is_fork || (e.v = t), e.wv = En()), !bt)
    if (we !== null)
      (Rt() || Y?.is_fork) && we.set(e, t);
    else {
      var r = (e.f & Me) === 0 ? Te : Z;
      Q(e, r);
    }
}
let _r = /* @__PURE__ */ new Set();
const Be = /* @__PURE__ */ new Map();
let on = !1;
function et(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Wr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function H(e, t) {
  const r = et(e);
  return Sn(r), r;
}
// @__NO_SIDE_EFFECTS__
function Ss(e, t = !1, r = !0) {
  const s = et(e);
  return t || (s.equals = Zr), s;
}
function x(e, t, r = !1) {
  P !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!xe || (P.f & Rr) !== 0) && Qr() && (P.f & (K | Oe | Mr | Rr)) !== 0 && !Pe?.includes(e) && es();
  let s = r ? ye(t) : t;
  return dt(e, s);
}
function dt(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    bt ? Be.set(e, t) : Be.set(e, r), e.v = t;
    var s = De.ensure();
    s.capture(e, r), (e.f & K) !== 0 && ((e.f & ce) !== 0 && Er(
      /** @type {Derived} */
      e
    ), Q(e, (e.f & Me) !== 0 ? Z : Te)), e.wv = En(), un(e, ce), z !== null && (z.f & Z) !== 0 && (z.f & (Ye | tt)) === 0 && (me === null ? Os([e]) : me.push(e)), !s.is_fork && _r.size > 0 && !on && ks();
  }
  return t;
}
function ks() {
  on = !1;
  var e = Ke;
  Xt(!0);
  const t = Array.from(_r);
  try {
    for (const r of t)
      (r.f & Z) !== 0 && Q(r, Te), Ht(r) && Pt(r);
  } finally {
    Xt(e);
  }
  _r.clear();
}
function Ft(e) {
  x(e, e.v + 1);
}
function un(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, a = 0; a < s; a++) {
      var n = r[a], i = n.f, o = (i & ce) === 0;
      if (o && Q(n, t), (i & K) !== 0) {
        var l = (
          /** @type {Derived} */
          n
        );
        we?.delete(l), (i & Ze) === 0 && (i & Me && (n.f |= Ze), un(l, Te));
      } else o && ((i & Oe) !== 0 && Ne !== null && Ne.add(
        /** @type {Effect} */
        n
      ), Qe(
        /** @type {Effect} */
        n
      ));
    }
}
function ye(e) {
  if (typeof e != "object" || e === null || ut in e)
    return e;
  const t = Xr(e);
  if (t !== jn && t !== qn)
    return e;
  var r = /* @__PURE__ */ new Map(), s = gr(e), a = /* @__PURE__ */ H(0), n = We, i = (o) => {
    if (We === n)
      return o();
    var l = P, f = We;
    ie(null), Cr(n);
    var c = o();
    return ie(l), Cr(f), c;
  };
  return s && r.set("length", /* @__PURE__ */ H(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(o, l, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && Zn();
        var c = r.get(l);
        return c === void 0 ? c = i(() => {
          var g = /* @__PURE__ */ H(f.value);
          return r.set(l, g), g;
        }) : x(c, f.value, !0), !0;
      },
      deleteProperty(o, l) {
        var f = r.get(l);
        if (f === void 0) {
          if (l in o) {
            const c = i(() => /* @__PURE__ */ H(W));
            r.set(l, c), Ft(a);
          }
        } else
          x(f, W), Ft(a);
        return !0;
      },
      get(o, l, f) {
        if (l === ut)
          return e;
        var c = r.get(l), g = l in o;
        if (c === void 0 && (!g || xt(o, l)?.writable) && (c = i(() => {
          var p = ye(g ? o[l] : W), T = /* @__PURE__ */ H(p);
          return T;
        }), r.set(l, c)), c !== void 0) {
          var _ = u(c);
          return _ === W ? void 0 : _;
        }
        return Reflect.get(o, l, f);
      },
      getOwnPropertyDescriptor(o, l) {
        var f = Reflect.getOwnPropertyDescriptor(o, l);
        if (f && "value" in f) {
          var c = r.get(l);
          c && (f.value = u(c));
        } else if (f === void 0) {
          var g = r.get(l), _ = g?.v;
          if (g !== void 0 && _ !== W)
            return {
              enumerable: !0,
              configurable: !0,
              value: _,
              writable: !0
            };
        }
        return f;
      },
      has(o, l) {
        if (l === ut)
          return !0;
        var f = r.get(l), c = f !== void 0 && f.v !== W || Reflect.has(o, l);
        if (f !== void 0 || z !== null && (!c || xt(o, l)?.writable)) {
          f === void 0 && (f = i(() => {
            var _ = c ? ye(o[l]) : W, p = /* @__PURE__ */ H(_);
            return p;
          }), r.set(l, f));
          var g = u(f);
          if (g === W)
            return !1;
        }
        return c;
      },
      set(o, l, f, c) {
        var g = r.get(l), _ = l in o;
        if (s && l === "length")
          for (var p = f; p < /** @type {Source<number>} */
          g.v; p += 1) {
            var T = r.get(p + "");
            T !== void 0 ? x(T, W) : p in o && (T = i(() => /* @__PURE__ */ H(W)), r.set(p + "", T));
          }
        if (g === void 0)
          (!_ || xt(o, l)?.writable) && (g = i(() => /* @__PURE__ */ H(void 0)), x(g, ye(f)), r.set(l, g));
        else {
          _ = g.v !== W;
          var b = i(() => ye(f));
          x(g, b);
        }
        var v = Reflect.getOwnPropertyDescriptor(o, l);
        if (v?.set && v.set.call(c, f), !_) {
          if (s && typeof l == "string") {
            var E = (
              /** @type {Source<number>} */
              r.get("length")
            ), U = Number(l);
            Number.isInteger(U) && U >= E.v && x(E, U + 1);
          }
          Ft(a);
        }
        return !0;
      },
      ownKeys(o) {
        u(a);
        var l = Reflect.ownKeys(o).filter((g) => {
          var _ = r.get(g);
          return _ === void 0 || _.v !== W;
        });
        for (var [f, c] of r)
          c.v !== W && !(f in o) && l.push(f);
        return l;
      },
      setPrototypeOf() {
        Qn();
      }
    }
  );
}
function Or(e) {
  try {
    if (e !== null && typeof e == "object" && ut in e)
      return e[ut];
  } catch {
  }
  return e;
}
function Es(e, t) {
  return Object.is(Or(e), Or(t));
}
var Yr, fn, cn, vn;
function Ds() {
  if (Yr === void 0) {
    Yr = window, fn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    cn = xt(t, "firstChild").get, vn = xt(t, "nextSibling").get, Nr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Nr(r) && (r.__t = void 0);
  }
}
function Ie(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Jt(e) {
  return (
    /** @type {TemplateNode | null} */
    cn.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Yt(e) {
  return (
    /** @type {TemplateNode | null} */
    vn.call(e)
  );
}
function h(e, t) {
  return /* @__PURE__ */ Jt(e);
}
function ht(e, t = !1) {
  {
    var r = /* @__PURE__ */ Jt(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ Yt(r) : r;
  }
}
function w(e, t = 1, r = !1) {
  let s = e;
  for (; t--; )
    s = /** @type {TemplateNode} */
    /* @__PURE__ */ Yt(s);
  return s;
}
function xs(e) {
  e.textContent = "";
}
function dn() {
  return !1;
}
let Hr = !1;
function Ts() {
  Hr || (Hr = !0, document.addEventListener(
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
function rr(e) {
  var t = P, r = z;
  ie(null), Ae(null);
  try {
    return e();
  } finally {
    ie(t), Ae(r);
  }
}
function Dr(e, t, r, s = r) {
  e.addEventListener(t, () => rr(r));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), s(!0);
  } : e.__on_r = () => s(!0), Ts();
}
function As(e) {
  z === null && (P === null && Kn(), Gn()), bt && Vn();
}
function Fs(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function He(e, t, r) {
  var s = z;
  s !== null && (s.f & fe) !== 0 && (e |= fe);
  var a = {
    ctx: ve,
    deps: null,
    nodes: null,
    f: e | ce | Me,
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
      Pt(a), a.f |= yr;
    } catch (o) {
      throw le(a), o;
    }
  else t !== null && Qe(a);
  var n = a;
  if (r && n.deps === null && n.teardown === null && n.nodes === null && n.first === n.last && // either `null`, or a singular child
  (n.f & _t) === 0 && (n = n.first, (e & Oe) !== 0 && (e & ft) !== 0 && n !== null && (n.f |= ft)), n !== null && (n.parent = s, s !== null && Fs(n, s), P !== null && (P.f & K) !== 0 && (e & tt) === 0)) {
    var i = (
      /** @type {Derived} */
      P
    );
    (i.effects ??= []).push(n);
  }
  return a;
}
function Rt() {
  return P !== null && !xe;
}
function xr(e) {
  const t = He(wr, null, !1);
  return Q(t, Z), t.teardown = e, t;
}
function hn(e) {
  As();
  var t = (
    /** @type {Effect} */
    z.f
  ), r = !P && (t & Ye) !== 0 && (t & yr) === 0;
  if (r) {
    var s = (
      /** @type {ComponentContext} */
      ve
    );
    (s.e ??= []).push(e);
  } else
    return _n(e);
}
function _n(e) {
  return He(br | Bn, e, !1);
}
function Ns(e) {
  De.ensure();
  const t = He(tt | _t, e, !0);
  return (r = {}) => new Promise((s) => {
    r.outro ? Ge(t, () => {
      le(t), s(void 0);
    }) : (le(t), s(void 0));
  });
}
function pn(e) {
  return He(br, e, !1);
}
function Rs(e) {
  return He(Mr | _t, e, !0);
}
function nr(e, t = 0) {
  return He(wr | t, e, !0);
}
function ne(e, t = [], r = [], s = []) {
  bs(s, t, r, (a) => {
    He(wr, () => e(...a.map(u)), !0);
  });
}
function Tr(e, t = 0) {
  var r = He(Oe | t, e, !0);
  return r;
}
function be(e) {
  return He(Ye | _t, e, !0);
}
function mn(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = bt, s = P;
    Lr(!0), ie(null);
    try {
      t.call(null);
    } finally {
      Lr(r), ie(s);
    }
  }
}
function gn(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const a = r.ac;
    a !== null && rr(() => {
      a.abort(lt);
    });
    var s = r.next;
    (r.f & tt) !== 0 ? r.parent = null : le(r, t), r = s;
  }
}
function Is(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & Ye) === 0 && le(t), t = r;
  }
}
function le(e, t = !0) {
  var r = !1;
  (t || (e.f & Gr) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ps(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), gn(e, t && !r), $t(e, 0), Q(e, ze);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const n of s)
      n.stop();
  mn(e);
  var a = e.parent;
  a !== null && a.first !== null && bn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Ps(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ Yt(e);
    e.remove(), e = r;
  }
}
function bn(e) {
  var t = e.parent, r = e.prev, s = e.next;
  r !== null && (r.next = s), s !== null && (s.prev = r), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = r));
}
function Ge(e, t, r = !0) {
  var s = [];
  wn(e, s, !0);
  var a = () => {
    r && le(e), t && t();
  }, n = s.length;
  if (n > 0) {
    var i = () => --n || a();
    for (var o of s)
      o.out(i);
  } else
    a();
}
function wn(e, t, r) {
  if ((e.f & fe) === 0) {
    e.f ^= fe;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const o of s)
        (o.is_global || r) && t.push(o);
    for (var a = e.first; a !== null; ) {
      var n = a.next, i = (a.f & ft) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (a.f & Ye) !== 0 && (e.f & Oe) !== 0;
      wn(a, t, i ? r : !1), a = n;
    }
  }
}
function Ar(e) {
  yn(e, !0);
}
function yn(e, t) {
  if ((e.f & fe) !== 0) {
    e.f ^= fe, (e.f & Z) === 0 && (Q(e, ce), Qe(e));
    for (var r = e.first; r !== null; ) {
      var s = r.next, a = (r.f & ft) !== 0 || (r.f & Ye) !== 0;
      yn(r, a ? t : !1), r = s;
    }
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const i of n)
        (i.is_global || t) && i.in();
  }
}
function Mn(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end; r !== null; ) {
      var a = r === s ? null : /* @__PURE__ */ Yt(r);
      t.append(r), r = a;
    }
}
let Ke = !1;
function Xt(e) {
  Ke = e;
}
let bt = !1;
function Lr(e) {
  bt = e;
}
let P = null, xe = !1;
function ie(e) {
  P = e;
}
let z = null;
function Ae(e) {
  z = e;
}
let Pe = null;
function Sn(e) {
  P !== null && (Pe === null ? Pe = [e] : Pe.push(e));
}
let re = null, ue = 0, me = null;
function Os(e) {
  me = e;
}
let kn = 1, It = 0, We = It;
function Cr(e) {
  We = e;
}
function En() {
  return ++kn;
}
function Ht(e) {
  var t = e.f;
  if ((t & ce) !== 0)
    return !0;
  if (t & K && (e.f &= ~Ze), (t & Te) !== 0) {
    var r = e.deps;
    if (r !== null)
      for (var s = r.length, a = 0; a < s; a++) {
        var n = r[a];
        if (Ht(
          /** @type {Derived} */
          n
        ) && ln(
          /** @type {Derived} */
          n
        ), n.wv > e.wv)
          return !0;
      }
    (t & Me) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    we === null && Q(e, Z);
  }
  return !1;
}
function Dn(e, t, r = !0) {
  var s = e.reactions;
  if (s !== null && !Pe?.includes(e))
    for (var a = 0; a < s.length; a++) {
      var n = s[a];
      (n.f & K) !== 0 ? Dn(
        /** @type {Derived} */
        n,
        t,
        !1
      ) : t === n && (r ? Q(n, ce) : (n.f & Z) !== 0 && Q(n, Te), Qe(
        /** @type {Effect} */
        n
      ));
    }
}
function xn(e) {
  var t = re, r = ue, s = me, a = P, n = Pe, i = ve, o = xe, l = We, f = e.f;
  re = /** @type {null | Value[]} */
  null, ue = 0, me = null, P = (f & (Ye | tt)) === 0 ? e : null, Pe = null, ct(e.ctx), xe = !1, We = ++It, e.ac !== null && (rr(() => {
    e.ac.abort(lt);
  }), e.ac = null);
  try {
    e.f |= dr;
    var c = (
      /** @type {Function} */
      e.fn
    ), g = c(), _ = e.deps;
    if (re !== null) {
      var p;
      if ($t(e, ue), _ !== null && ue > 0)
        for (_.length = ue + re.length, p = 0; p < re.length; p++)
          _[ue + p] = re[p];
      else
        e.deps = _ = re;
      if (Rt() && (e.f & Me) !== 0)
        for (p = ue; p < _.length; p++)
          (_[p].reactions ??= []).push(e);
    } else _ !== null && ue < _.length && ($t(e, ue), _.length = ue);
    if (Qr() && me !== null && !xe && _ !== null && (e.f & (K | Te | ce)) === 0)
      for (p = 0; p < /** @type {Source[]} */
      me.length; p++)
        Dn(
          me[p],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (It++, me !== null && (s === null ? s = me : s.push(.../** @type {Source[]} */
    me))), (e.f & Ue) !== 0 && (e.f ^= Ue), g;
  } catch (T) {
    return tn(T);
  } finally {
    e.f ^= dr, re = t, ue = r, me = s, P = a, Pe = n, ct(i), xe = o, We = l;
  }
}
function Ys(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var s = Hn.call(r, e);
    if (s !== -1) {
      var a = r.length - 1;
      a === 0 ? r = t.reactions = null : (r[s] = r[a], r.pop());
    }
  }
  r === null && (t.f & K) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (re === null || !re.includes(t)) && (Q(t, Te), (t.f & Me) !== 0 && (t.f ^= Me, t.f &= ~Ze), an(
    /** @type {Derived} **/
    t
  ), $t(
    /** @type {Derived} **/
    t,
    0
  ));
}
function $t(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var s = t; s < r.length; s++)
      Ys(e, r[s]);
}
function Pt(e) {
  var t = e.f;
  if ((t & ze) === 0) {
    Q(e, Z);
    var r = z, s = Ke;
    z = e, Ke = !0;
    try {
      (t & (Oe | Un)) !== 0 ? Is(e) : gn(e), mn(e);
      var a = xn(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = kn;
      var n;
    } finally {
      Ke = s, z = r;
    }
  }
}
async function Tn() {
  await Promise.resolve(), ds();
}
function u(e) {
  var t = e.f, r = (t & K) !== 0;
  if (P !== null && !xe) {
    var s = z !== null && (z.f & ze) !== 0;
    if (!s && !Pe?.includes(e)) {
      var a = P.deps;
      if ((P.f & dr) !== 0)
        e.rv < It && (e.rv = It, re === null && a !== null && a[ue] === e ? ue++ : re === null ? re = [e] : re.includes(e) || re.push(e));
      else {
        (P.deps ??= []).push(e);
        var n = e.reactions;
        n === null ? e.reactions = [P] : n.includes(P) || n.push(P);
      }
    }
  }
  if (bt) {
    if (Be.has(e))
      return Be.get(e);
    if (r) {
      var i = (
        /** @type {Derived} */
        e
      ), o = i.v;
      return ((i.f & Z) === 0 && i.reactions !== null || Fn(i)) && (o = Er(i)), Be.set(i, o), o;
    }
  } else r && (!we?.has(e) || Y?.is_fork && !Rt()) && (i = /** @type {Derived} */
  e, Ht(i) && ln(i), Ke && Rt() && (i.f & Me) === 0 && An(i));
  if (we?.has(e))
    return we.get(e);
  if ((e.f & Ue) !== 0)
    throw e.v;
  return e.v;
}
function An(e) {
  if (e.deps !== null) {
    e.f ^= Me;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & K) !== 0 && (t.f & Me) === 0 && An(
        /** @type {Derived} */
        t
      );
  }
}
function Fn(e) {
  if (e.v === W) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Be.has(t) || (t.f & K) !== 0 && Fn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Lt(e) {
  var t = xe;
  try {
    return xe = !0, e();
  } finally {
    xe = t;
  }
}
const Hs = -7169;
function Q(e, t) {
  e.f = e.f & Hs | t;
}
const Ls = ["touchstart", "touchmove"];
function Cs(e) {
  return Ls.includes(e);
}
const Nn = /* @__PURE__ */ new Set(), pr = /* @__PURE__ */ new Set();
function js(e, t, r, s = {}) {
  function a(n) {
    if (s.capture || Et.call(t, n), !n.cancelBubble)
      return rr(() => r?.call(this, n));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? gt(() => {
    t.addEventListener(e, a, s);
  }) : t.addEventListener(e, a, s), a;
}
function qs(e, t, r, s, a) {
  var n = { capture: s, passive: a }, i = js(e, t, r, n);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && xr(() => {
    t.removeEventListener(e, i, n);
  });
}
function sr(e) {
  for (var t = 0; t < e.length; t++)
    Nn.add(e[t]);
  for (var r of pr)
    r(e);
}
let jr = null;
function Et(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], n = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  jr = e;
  var i = 0, o = jr === e && e.__root;
  if (o) {
    var l = a.indexOf(o);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var f = a.indexOf(t);
    if (f === -1)
      return;
    l <= f && (i = l);
  }
  if (n = /** @type {Element} */
  a[i] || e.target, n !== t) {
    Ln(e, "currentTarget", {
      configurable: !0,
      get() {
        return n || r;
      }
    });
    var c = P, g = z;
    ie(null), Ae(null);
    try {
      for (var _, p = []; n !== null; ) {
        var T = n.assignedSlot || n.parentNode || /** @type {any} */
        n.host || null;
        try {
          var b = n["__" + s];
          b != null && (!/** @type {any} */
          n.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === n) && b.call(n, e);
        } catch (v) {
          _ ? p.push(v) : _ = v;
        }
        if (e.cancelBubble || T === t || T === null)
          break;
        n = T;
      }
      if (_) {
        for (let v of p)
          queueMicrotask(() => {
            throw v;
          });
        throw _;
      }
    } finally {
      e.__root = t, delete e.currentTarget, ie(c), Ae(g);
    }
  }
}
function zs(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Vt(e, t) {
  var r = (
    /** @type {Effect} */
    z
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function J(e, t) {
  var r = (t & is) !== 0, s = (t & ls) !== 0, a, n = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = zs(n ? e : "<!>" + e), r || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ Jt(a)));
    var i = (
      /** @type {TemplateNode} */
      s || fn ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Jt(i)
      ), l = (
        /** @type {TemplateNode} */
        i.lastChild
      );
      Vt(o, l);
    } else
      Vt(i, i);
    return i;
  };
}
function Us(e = "") {
  {
    var t = Ie(e + "");
    return Vt(t, t), t;
  }
}
function Gt() {
  var e = document.createDocumentFragment(), t = document.createComment(""), r = Ie();
  return e.append(t, r), Vt(t, r), e;
}
function j(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function C(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ??= e.nodeValue) && (e.__t = r, e.nodeValue = r + "");
}
function Bs(e, t) {
  return Js(e, t);
}
const it = /* @__PURE__ */ new Map();
function Js(e, { target: t, anchor: r, props: s = {}, events: a, context: n, intro: i = !0 }) {
  Ds();
  var o = /* @__PURE__ */ new Set(), l = (g) => {
    for (var _ = 0; _ < g.length; _++) {
      var p = g[_];
      if (!o.has(p)) {
        o.add(p);
        var T = Cs(p);
        t.addEventListener(p, Et, { passive: T });
        var b = it.get(p);
        b === void 0 ? (document.addEventListener(p, Et, { passive: T }), it.set(p, 1)) : it.set(p, b + 1);
      }
    }
  };
  l(Zt(Nn)), pr.add(l);
  var f = void 0, c = Ns(() => {
    var g = r ?? t.appendChild(Ie());
    return ms(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (_) => {
        if (n) {
          pt({});
          var p = (
            /** @type {ComponentContext} */
            ve
          );
          p.c = n;
        }
        a && (s.$$events = a), f = e(_, s) || {}, n && mt();
      }
    ), () => {
      for (var _ of o) {
        t.removeEventListener(_, Et);
        var p = (
          /** @type {number} */
          it.get(_)
        );
        --p === 0 ? (document.removeEventListener(_, Et), it.delete(_)) : it.set(_, p);
      }
      pr.delete(l), g !== r && g.parentNode?.removeChild(g);
    };
  });
  return Xs.set(f, c), f;
}
let Xs = /* @__PURE__ */ new WeakMap();
class $s {
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
      Y
    );
    if (this.#e.has(t)) {
      var r = (
        /** @type {Key} */
        this.#e.get(t)
      ), s = this.#t.get(r);
      if (s)
        Ar(s), this.#r.delete(r);
      else {
        var a = this.#n.get(r);
        a && (this.#t.set(r, a.effect), this.#n.delete(r), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
      }
      for (const [n, i] of this.#e) {
        if (this.#e.delete(n), n === t)
          break;
        const o = this.#n.get(i);
        o && (le(o.effect), this.#n.delete(i));
      }
      for (const [n, i] of this.#t) {
        if (n === r || this.#r.has(n)) continue;
        const o = () => {
          if (Array.from(this.#e.values()).includes(n)) {
            var f = document.createDocumentFragment();
            Mn(i, f), f.append(Ie()), this.#n.set(n, { effect: i, fragment: f });
          } else
            le(i);
          this.#r.delete(n), this.#t.delete(n);
        };
        this.#o || !s ? (this.#r.add(n), Ge(i, o, !1)) : o();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #s = (t) => {
    this.#e.delete(t);
    const r = Array.from(this.#e.values());
    for (const [s, a] of this.#n)
      r.includes(s) || (le(a.effect), this.#n.delete(s));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, r) {
    var s = (
      /** @type {Batch} */
      Y
    ), a = dn();
    if (r && !this.#t.has(t) && !this.#n.has(t))
      if (a) {
        var n = document.createDocumentFragment(), i = Ie();
        n.append(i), this.#n.set(t, {
          effect: be(() => r(i)),
          fragment: n
        });
      } else
        this.#t.set(
          t,
          be(() => r(this.anchor))
        );
    if (this.#e.set(s, t), a) {
      for (const [o, l] of this.#t)
        o === t ? s.skipped_effects.delete(l) : s.skipped_effects.add(l);
      for (const [o, l] of this.#n)
        o === t ? s.skipped_effects.delete(l.effect) : s.skipped_effects.add(l.effect);
      s.oncommit(this.#a), s.ondiscard(this.#s);
    } else
      this.#a();
  }
}
function ae(e, t, r = !1) {
  var s = new $s(e), a = r ? ft : 0;
  function n(i, o) {
    s.ensure(i, o);
  }
  Tr(() => {
    var i = !1;
    t((o, l = !0) => {
      i = !0, n(l, o);
    }), i || n(!1, null);
  }, a);
}
function Kt(e, t) {
  return t;
}
function Vs(e, t, r) {
  for (var s = [], a = t.length, n, i = t.length, o = 0; o < a; o++) {
    let g = t[o];
    Ge(
      g,
      () => {
        if (n) {
          if (n.pending.delete(g), n.done.add(g), n.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            mr(Zt(n.done)), _.delete(n), _.size === 0 && (e.outrogroups = null);
          }
        } else
          i -= 1;
      },
      !1
    );
  }
  if (i === 0) {
    var l = s.length === 0 && r !== null;
    if (l) {
      var f = (
        /** @type {Element} */
        r
      ), c = (
        /** @type {Element} */
        f.parentNode
      );
      xs(c), c.append(f), e.items.clear();
    }
    mr(t, !l);
  } else
    n = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(n);
}
function mr(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    le(e[r], t);
}
var qr;
function Wt(e, t, r, s, a, n = null) {
  var i = e, o = /* @__PURE__ */ new Map(), l = (t & Kr) !== 0;
  if (l) {
    var f = (
      /** @type {Element} */
      e
    );
    i = f.appendChild(Ie());
  }
  var c = null, g = /* @__PURE__ */ kr(() => {
    var E = r();
    return gr(E) ? E : E == null ? [] : Zt(E);
  }), _, p = !0;
  function T() {
    v.fallback = c, Gs(v, _, i, t, s), c !== null && (_.length === 0 ? (c.f & Re) === 0 ? Ar(c) : (c.f ^= Re, Dt(c, null, i)) : Ge(c, () => {
      c = null;
    }));
  }
  var b = Tr(() => {
    _ = /** @type {V[]} */
    u(g);
    for (var E = _.length, U = /* @__PURE__ */ new Set(), R = (
      /** @type {Batch} */
      Y
    ), O = dn(), A = 0; A < E; A += 1) {
      var L = _[A], X = s(L, A), D = p ? null : o.get(X);
      D ? (D.v && dt(D.v, L), D.i && dt(D.i, A), O && R.skipped_effects.delete(D.e)) : (D = Ks(
        o,
        p ? i : qr ??= Ie(),
        L,
        X,
        A,
        a,
        t,
        r
      ), p || (D.e.f |= Re), o.set(X, D)), U.add(X);
    }
    if (E === 0 && n && !c && (p ? c = be(() => n(i)) : (c = be(() => n(qr ??= Ie())), c.f |= Re)), !p)
      if (O) {
        for (const [q, S] of o)
          U.has(q) || R.skipped_effects.add(S.e);
        R.oncommit(T), R.ondiscard(() => {
        });
      } else
        T();
    u(g);
  }), v = { effect: b, items: o, outrogroups: null, fallback: c };
  p = !1;
}
function Gs(e, t, r, s, a) {
  var n = (s & ss) !== 0, i = t.length, o = e.items, l = e.effect.first, f, c = null, g, _ = [], p = [], T, b, v, E;
  if (n)
    for (E = 0; E < i; E += 1)
      T = t[E], b = a(T, E), v = /** @type {EachItem} */
      o.get(b).e, (v.f & Re) === 0 && (v.nodes?.a?.measure(), (g ??= /* @__PURE__ */ new Set()).add(v));
  for (E = 0; E < i; E += 1) {
    if (T = t[E], b = a(T, E), v = /** @type {EachItem} */
    o.get(b).e, e.outrogroups !== null)
      for (const S of e.outrogroups)
        S.pending.delete(v), S.done.delete(v);
    if ((v.f & Re) !== 0)
      if (v.f ^= Re, v === l)
        Dt(v, null, r);
      else {
        var U = c ? c.next : l;
        v === e.effect.last && (e.effect.last = v.prev), v.prev && (v.prev.next = v.next), v.next && (v.next.prev = v.prev), je(e, c, v), je(e, v, U), Dt(v, U, r), c = v, _ = [], p = [], l = c.next;
        continue;
      }
    if ((v.f & fe) !== 0 && (Ar(v), n && (v.nodes?.a?.unfix(), (g ??= /* @__PURE__ */ new Set()).delete(v))), v !== l) {
      if (f !== void 0 && f.has(v)) {
        if (_.length < p.length) {
          var R = p[0], O;
          c = R.prev;
          var A = _[0], L = _[_.length - 1];
          for (O = 0; O < _.length; O += 1)
            Dt(_[O], R, r);
          for (O = 0; O < p.length; O += 1)
            f.delete(p[O]);
          je(e, A.prev, L.next), je(e, c, A), je(e, L, R), l = R, c = L, E -= 1, _ = [], p = [];
        } else
          f.delete(v), Dt(v, l, r), je(e, v.prev, v.next), je(e, v, c === null ? e.effect.first : c.next), je(e, c, v), c = v;
        continue;
      }
      for (_ = [], p = []; l !== null && l !== v; )
        (f ??= /* @__PURE__ */ new Set()).add(l), p.push(l), l = l.next;
      if (l === null)
        continue;
    }
    (v.f & Re) === 0 && _.push(v), c = v, l = v.next;
  }
  if (e.outrogroups !== null) {
    for (const S of e.outrogroups)
      S.pending.size === 0 && (mr(Zt(S.done)), e.outrogroups?.delete(S));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || f !== void 0) {
    var X = [];
    if (f !== void 0)
      for (v of f)
        (v.f & fe) === 0 && X.push(v);
    for (; l !== null; )
      (l.f & fe) === 0 && l !== e.fallback && X.push(l), l = l.next;
    var D = X.length;
    if (D > 0) {
      var q = (s & Kr) !== 0 && i === 0 ? r : null;
      if (n) {
        for (E = 0; E < D; E += 1)
          X[E].nodes?.a?.measure();
        for (E = 0; E < D; E += 1)
          X[E].nodes?.a?.fix();
      }
      Vs(e, X, q);
    }
  }
  n && gt(() => {
    if (g !== void 0)
      for (v of g)
        v.nodes?.a?.apply();
  });
}
function Ks(e, t, r, s, a, n, i, o) {
  var l = (i & rs) !== 0 ? (i & as) === 0 ? /* @__PURE__ */ Ss(r, !1, !1) : et(r) : null, f = (i & ns) !== 0 ? et(a) : null;
  return {
    v: l,
    i: f,
    e: be(() => (n(t, l ?? r, f ?? a, o), () => {
      e.delete(s);
    }))
  };
}
function Dt(e, t, r) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, n = t && (t.f & Re) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; s !== null; ) {
      var i = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Yt(s)
      );
      if (n.before(s), s === a)
        return;
      s = i;
    }
}
function je(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
const zr = [...` 	
\r\f \v\uFEFF`];
function Ws(e, t, r) {
  var s = e == null ? "" : "" + e;
  if (t && (s = s ? s + " " + t : t), r) {
    for (var a in r)
      if (r[a])
        s = s ? s + " " + a : a;
      else if (s.length)
        for (var n = a.length, i = 0; (i = s.indexOf(a, i)) >= 0; ) {
          var o = i + n;
          (i === 0 || zr.includes(s[i - 1])) && (o === s.length || zr.includes(s[o])) ? s = (i === 0 ? "" : s.substring(0, i)) + s.substring(o + 1) : i = o;
        }
  }
  return s === "" ? null : s;
}
function qe(e, t, r, s, a, n) {
  var i = e.__className;
  if (i !== r || i === void 0) {
    var o = Ws(r, s, n);
    o == null ? e.removeAttribute("class") : e.className = o, e.__className = r;
  } else if (n && a !== n)
    for (var l in n) {
      var f = !!n[l];
      (a == null || f !== !!a[l]) && e.classList.toggle(l, f);
    }
  return n;
}
function Rn(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!gr(t))
      return us();
    for (var s of e.options)
      s.selected = t.includes(Nt(s));
    return;
  }
  for (s of e.options) {
    var a = Nt(s);
    if (Es(a, t)) {
      s.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function Zs(e) {
  var t = new MutationObserver(() => {
    Rn(e, e.__value);
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
  }), xr(() => {
    t.disconnect();
  });
}
function Qs(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet(), a = !0;
  Dr(e, "change", (n) => {
    var i = n ? "[selected]" : ":checked", o;
    if (e.multiple)
      o = [].map.call(e.querySelectorAll(i), Nt);
    else {
      var l = e.querySelector(i) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      o = l && Nt(l);
    }
    r(o), Y !== null && s.add(Y);
  }), pn(() => {
    var n = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        Tt ?? Y
      );
      if (s.has(i))
        return;
    }
    if (Rn(e, n, a), a && n === void 0) {
      var o = e.querySelector(":checked");
      o !== null && (n = Nt(o), r(n));
    }
    e.__value = n, a = !1;
  }), Zs(e);
}
function Nt(e) {
  return "__value" in e ? e.__value : e.value;
}
const ea = /* @__PURE__ */ Symbol("is custom element"), ta = /* @__PURE__ */ Symbol("is html");
function Ot(e, t, r, s) {
  var a = ra(e);
  a[t] !== (a[t] = r) && (t === "loading" && (e[Jn] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && na(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function ra(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [ea]: e.nodeName.includes("-"),
      [ta]: e.namespaceURI === os
    }
  );
}
var Ur = /* @__PURE__ */ new Map();
function na(e) {
  var t = e.getAttribute("is") || e.nodeName, r = Ur.get(t);
  if (r) return r;
  Ur.set(t, r = []);
  for (var s, a = e, n = Element.prototype; n !== a; ) {
    s = Cn(a);
    for (var i in s)
      s[i].set && r.push(i);
    a = Xr(a);
  }
  return r;
}
function Ut(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet();
  Dr(e, "input", async (a) => {
    var n = a ? e.defaultValue : e.value;
    if (n = or(e) ? ur(n) : n, r(n), Y !== null && s.add(Y), await Tn(), n !== (n = t())) {
      var i = e.selectionStart, o = e.selectionEnd, l = e.value.length;
      if (e.value = n ?? "", o !== null) {
        var f = e.value.length;
        i === o && o === l && f > l ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = i, e.selectionEnd = Math.min(o, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Lt(t) == null && e.value && (r(or(e) ? ur(e.value) : e.value), Y !== null && s.add(Y)), nr(() => {
    var a = t();
    if (e === document.activeElement) {
      var n = (
        /** @type {Batch} */
        Tt ?? Y
      );
      if (s.has(n))
        return;
    }
    or(e) && a === ur(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
function sa(e, t, r = t) {
  Dr(e, "change", (s) => {
    var a = s ? e.defaultChecked : e.checked;
    r(a);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  // If defaultChecked is set, then checked == defaultChecked
  Lt(t) == null && r(e.checked), nr(() => {
    var s = t();
    e.checked = !!s;
  });
}
function or(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function ur(e) {
  return e === "" ? null : +e;
}
function Br(e, t) {
  return e === t || e?.[ut] === t;
}
function kt(e = {}, t, r, s) {
  return pn(() => {
    var a, n;
    return nr(() => {
      a = n, n = [], Lt(() => {
        e !== r(...n) && (t(e, ...n), a && Br(r(...a), e) && t(null, ...a));
      });
    }), () => {
      gt(() => {
        n && Br(r(...n), e) && t(null, ...n);
      });
    };
  }), e;
}
function aa(e, t, r, s) {
  var a = (
    /** @type {V} */
    s
  ), n = !0, i = () => (n && (n = !1, a = /** @type {V} */
  s), a), o;
  o = /** @type {V} */
  e[t], o === void 0 && s !== void 0 && (o = i());
  var l;
  return l = () => {
    var f = (
      /** @type {V} */
      e[t]
    );
    return f === void 0 ? i() : (n = !0, f);
  }, l;
}
function Ct(e) {
  ve === null && Xn(), hn(() => {
    const t = Lt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const ia = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(ia);
function la(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var fr = { exports: {} }, Jr;
function oa() {
  return Jr || (Jr = 1, (function(e) {
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
      function a(b, v, E) {
        var U = b || r, R = v || 0, O = E || !1, A = 0, L;
        function X(S, m) {
          var M;
          if (m) {
            if (M = m.getTime(), O) {
              var y = c(m);
              if (m = new Date(M + y + R), c(m) !== y) {
                var d = c(m);
                m = new Date(M + d + R);
              }
            }
          } else {
            var I = Date.now();
            I > A ? (A = I, L = new Date(A), M = A, O && (L = new Date(A + c(L) + R))) : M = A, m = L;
          }
          return D(S, m, U, M);
        }
        function D(S, m, M, I) {
          for (var y = "", d = null, k = !1, F = S.length, B = !1, $ = 0; $ < F; $++) {
            var ee = S.charCodeAt($);
            if (k === !0) {
              if (ee === 45) {
                d = "";
                continue;
              } else if (ee === 95) {
                d = " ";
                continue;
              } else if (ee === 48) {
                d = "0";
                continue;
              } else if (ee === 58) {
                B && T("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), B = !0;
                continue;
              }
              switch (ee) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  y += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  y += M.days[m.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  y += M.months[m.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  y += n(Math.floor(m.getFullYear() / 100), d);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  y += D(M.formats.D, m, M, I);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  y += D(M.formats.F, m, M, I);
                  break;
                // '00'
                // case 'H':
                case 72:
                  y += n(m.getHours(), d);
                  break;
                // '12'
                // case 'I':
                case 73:
                  y += n(o(m.getHours()), d);
                  break;
                // '000'
                // case 'L':
                case 76:
                  y += i(Math.floor(I % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  y += n(m.getMinutes(), d);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  y += m.getHours() < 12 ? M.am : M.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  y += D(M.formats.R, m, M, I);
                  break;
                // '00'
                // case 'S':
                case 83:
                  y += n(m.getSeconds(), d);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  y += D(M.formats.T, m, M, I);
                  break;
                // '00'
                // case 'U':
                case 85:
                  y += n(l(m, "sunday"), d);
                  break;
                // '00'
                // case 'W':
                case 87:
                  y += n(l(m, "monday"), d);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  y += D(M.formats.X, m, M, I);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  y += m.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (O && R === 0)
                    y += "GMT";
                  else {
                    var oe = g(m);
                    y += oe || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  y += M.shortDays[m.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  y += M.shortMonths[m.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  y += D(M.formats.c, m, M, I);
                  break;
                // '01'
                // case 'd':
                case 100:
                  y += n(m.getDate(), d);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  y += n(m.getDate(), d ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  y += M.shortMonths[m.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var de = new Date(m.getFullYear(), 0, 1), V = Math.ceil((m.getTime() - de.getTime()) / (1e3 * 60 * 60 * 24));
                  y += i(V);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  y += n(m.getHours(), d ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  y += n(o(m.getHours()), d ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  y += n(m.getMonth() + 1, d);
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
                  var V = m.getDate();
                  M.ordinalSuffixes ? y += String(V) + (M.ordinalSuffixes[V - 1] || f(V)) : y += String(V) + f(V);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  y += m.getHours() < 12 ? M.AM : M.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  y += D(M.formats.r, m, M, I);
                  break;
                // '0'
                // case 's':
                case 115:
                  y += Math.floor(I / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  y += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var V = m.getDay();
                  y += V === 0 ? 7 : V;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  y += D(M.formats.v, m, M, I);
                  break;
                // '4'
                // case 'w':
                case 119:
                  y += m.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  y += D(M.formats.x, m, M, I);
                  break;
                // '70'
                // case 'y':
                case 121:
                  y += n(m.getFullYear() % 100, d);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (O && R === 0)
                    y += B ? "+00:00" : "+0000";
                  else {
                    var te;
                    R !== 0 ? te = R / (60 * 1e3) : te = -m.getTimezoneOffset();
                    var Se = te < 0 ? "-" : "+", he = B ? ":" : "", ke = Math.floor(Math.abs(te / 60)), _e = Math.abs(te % 60);
                    y += Se + n(ke) + he + n(_e);
                  }
                  break;
                default:
                  k && (y += "%"), y += S[$];
                  break;
              }
              d = null, k = !1;
              continue;
            }
            if (ee === 37) {
              k = !0;
              continue;
            }
            y += S[$];
          }
          return y;
        }
        var q = X;
        return q.localize = function(S) {
          return new a(S || U, R, O);
        }, q.localizeByIdentifier = function(S) {
          var m = t[S];
          return m ? q.localize(m) : (T('[WARNING] No locale found with identifier "' + S + '".'), q);
        }, q.timezone = function(S) {
          var m = R, M = O, I = typeof S;
          if (I === "number" || I === "string")
            if (M = !0, I === "string") {
              var y = S[0] === "-" ? -1 : 1, d = parseInt(S.slice(1, 3), 10), k = parseInt(S.slice(3, 5), 10);
              m = y * (60 * d + k) * 60 * 1e3;
            } else I === "number" && (m = S * 60 * 1e3);
          return new a(U, m, M);
        }, q.utc = function() {
          return new a(U, R, !0);
        }, q;
      }
      function n(b, v) {
        return v === "" || b > 9 ? "" + b : (v == null && (v = "0"), v + b);
      }
      function i(b) {
        return b > 99 ? b : b > 9 ? "0" + b : "00" + b;
      }
      function o(b) {
        return b === 0 ? 12 : b > 12 ? b - 12 : b;
      }
      function l(b, v) {
        v = v || "sunday";
        var E = b.getDay();
        v === "monday" && (E === 0 ? E = 6 : E--);
        var U = Date.UTC(b.getFullYear(), 0, 1), R = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()), O = Math.floor((R - U) / 864e5), A = (O + 7 - E) / 7;
        return Math.floor(A);
      }
      function f(b) {
        var v = b % 10, E = b % 100;
        if (E >= 11 && E <= 13 || v === 0 || v >= 4)
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
      function c(b) {
        return (b.getTimezoneOffset() || 0) * 6e4;
      }
      function g(b, v) {
        return _() || p(b);
      }
      function _(b, v) {
        return null;
      }
      function p(b) {
        var v = b.toString().match(/\(([\w\s]+)\)/);
        return v && v[1];
      }
      function T(b) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(b);
      }
    })();
  })(fr)), fr.exports;
}
var ua = oa();
const ot = /* @__PURE__ */ la(ua);
let cr = /* @__PURE__ */ H(!1);
class fa {
  constructor(t) {
    if (this.sk = "", this.fetchFn = t || (typeof window < "u" ? fetch.bind(window) : fetch), typeof document < "u") {
      const r = document.querySelector('meta[name="csrf-token"]');
      r && (this.sk = r.content);
    }
  }
  get loading() {
    return u(cr);
  }
  async request(t, r = {}) {
    x(cr, !0);
    try {
      const s = new URL(t, window.location.origin);
      r.params && Object.entries(r.params).forEach(([o, l]) => {
        s.searchParams.append(o, String(l));
      });
      const a = new Headers(r.headers || {});
      a.set("X-Requested-With", "fetch");
      let n = r.body;
      r.method && ["POST", "PUT", "PATCH", "DELETE"].includes(r.method.toUpperCase()) && (n instanceof FormData ? n.set("sk", this.sk) : n instanceof BodyInit);
      const i = await this.fetchFn(s.toString(), { ...r, headers: a, body: n });
      if (!i.ok)
        throw new Error(`API Error: ${i.status} ${i.statusText}`);
      return await i.json();
    } finally {
      x(cr, !1);
    }
  }
  get(t, r) {
    return this.request(t, { method: "GET", params: r });
  }
  post(t, r) {
    return this.request(t, { method: "POST", body: r });
  }
}
const se = new fa(), ca = (e, t = Qt) => {
  var r = va(), s = h(r);
  ne(() => {
    qe(r, 1, `status status-${t() ?? ""}`, "svelte-13s7gu4"), C(s, t());
  }), j(e, r);
};
var va = /* @__PURE__ */ J("<span> </span>"), da = /* @__PURE__ */ J('<time class="svelte-13s7gu4"> </time>'), ha = /* @__PURE__ */ J('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), _a = /* @__PURE__ */ J('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), pa = /* @__PURE__ */ J('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), ma = /* @__PURE__ */ J('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), ga = /* @__PURE__ */ J('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4">エントリ一覧</h2> <div class="search-box svelte-13s7gu4"><input type="text" placeholder="検索..." class="svelte-13s7gu4"/> <button class="svelte-13s7gu4">検索</button></div> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">新しい方へ</button> <button class="svelte-13s7gu4">古い方へ</button></div></div> <div><!></div></div>');
function ba(e, t) {
  pt(t, !0);
  const r = (S, m = Qt, M) => {
    let I = /* @__PURE__ */ kr(() => Vr(M?.(), !0));
    var y = da(), d = h(y);
    ne(
      (k) => {
        Ot(y, "datetime", m()), C(d, k);
      },
      [() => u(I) && m() ? _(m()) : "-"]
    ), j(S, y);
  };
  let s = /* @__PURE__ */ H(ye([])), a = /* @__PURE__ */ H(!1), n = 50, i = /* @__PURE__ */ H(""), o = /* @__PURE__ */ H(ye([]));
  async function l() {
    try {
      const S = u(o)[u(o).length - 1], m = { limit: n };
      u(i) && (m.q = u(i)), S && (m.cursor_id = S);
      const M = await se.get("/admin/api/entries", m);
      x(s, M.entries || [], !0), x(a, M.has_more || !1, !0);
    } catch (S) {
      console.error(S);
    }
  }
  function f() {
    x(o, [], !0), l();
  }
  Ct(l);
  function c() {
    if (u(a) && u(s).length > 0) {
      const S = u(s)[u(s).length - 1];
      u(o).push(S.id), l();
    }
  }
  function g() {
    u(o).length > 0 && (u(o).pop(), l());
  }
  function _(S) {
    return S ? ot("%Y-%m-%d %H:%M", new Date(S)) : "-";
  }
  var p = ga(), T = h(p), b = w(h(T), 2), v = h(b);
  v.__keydown = (S) => S.key === "Enter" && f();
  var E = w(v, 2);
  E.__click = f;
  var U = w(b, 2), R = h(U);
  R.__click = g;
  var O = w(R, 2);
  O.__click = c;
  var A = w(T, 2);
  let L;
  var X = h(A);
  {
    var D = (S) => {
      var m = ha();
      j(S, m);
    }, q = (S) => {
      var m = ma(), M = ht(m), I = w(h(M));
      Wt(I, 21, () => u(s), Kt, (k, F) => {
        var B = _a(), $ = h(B), ee = h($), oe = w($), de = h(oe), V = w(oe), te = h(V);
        ca(te, () => u(F).status);
        var Se = w(V), he = h(Se), ke = h(he), _e = w(he, 2), Ee = h(_e), Le = h(Ee), Je = w(Se), rt = h(Je), Xe = w(Je), wt = h(Xe);
        r(wt, () => u(F).created_at);
        var nt = w(Xe), Ce = h(nt);
        r(Ce, () => u(F).modified_at);
        var st = w(nt), yt = h(st);
        r(yt, () => u(F).publish_at?.Time, () => u(F).publish_at?.Valid);
        var Mt = w(st), $e = h(Mt);
        $e.__click = () => t.onEdit(u(F).id), ne(() => {
          C(ee, u(F).id), C(de, u(F).date), C(ke, u(F).title), Ot(Ee, "href", `/${u(F).path ?? ""}`), C(Le, `/${u(F).path ?? ""}`), C(rt, u(F).format);
        }), j(k, B);
      });
      var y = w(M, 2);
      {
        var d = (k) => {
          var F = pa();
          j(k, F);
        };
        ae(y, (k) => {
          se.loading && k(d);
        });
      }
      j(S, m);
    };
    ae(X, (S) => {
      se.loading && u(s).length === 0 ? S(D) : S(q, !1);
    });
  }
  ne(() => {
    R.disabled = u(o).length === 0 || se.loading, O.disabled = !u(a) || se.loading, L = qe(A, 1, "table-container svelte-13s7gu4", null, L, { "is-loading": se.loading });
  }), Ut(v, () => u(i), (S) => x(i, S)), j(e, p), mt();
}
sr(["keydown", "click"]);
class wa {
  #e;
  get exists() {
    return u(this.#e);
  }
  set exists(t) {
    x(this.#e, t, !0);
  }
  #t;
  get data() {
    return u(this.#t);
  }
  set data(t) {
    x(this.#t, t, !0);
  }
  constructor(t = typeof localStorage < "u" ? localStorage : null) {
    this.storage = t, this.timer = null, this.#e = /* @__PURE__ */ H(!1), this.#t = /* @__PURE__ */ H(null);
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
var ya = /* @__PURE__ */ J('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), Ma = /* @__PURE__ */ J('<option class="svelte-7nstam"> </option>'), Sa = /* @__PURE__ */ J('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), ka = /* @__PURE__ */ J('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), Ea = /* @__PURE__ */ J('<button id="restore" type="button" class="submit-button svelte-7nstam">復元...</button>'), Da = /* @__PURE__ */ J('<div role="option" tabindex="-1"> </div>'), xa = /* @__PURE__ */ J('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam"> </button> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons svelte-7nstam"><div class="options svelte-7nstam"><label title="チェックを入れると指定した日時に公開されます（公開済みの記事も予約に戻せます）" class="svelte-7nstam"><input type="checkbox" class="svelte-7nstam"/> 公開を遅延</label> <!></div> <button type="button" class="submit-button svelte-7nstam"> </button> <!></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam" role="listbox" aria-label="タグを選択" tabindex="0"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog>', 1);
function Ta(e, t) {
  pt(t, !0);
  let r = aa(t, "id", 3, null);
  const s = new wa();
  let a = /* @__PURE__ */ H(ye({ id: null, title: "", body: "", status: null })), n = ye({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: "public",
    publishLater: !1,
    publishAt: ""
  }), i = /* @__PURE__ */ H(!1), o = /* @__PURE__ */ H(""), l = /* @__PURE__ */ H(!1), f = /* @__PURE__ */ H(null), c = /* @__PURE__ */ H(null), g = /* @__PURE__ */ H(null), _ = /* @__PURE__ */ H(null), p = /* @__PURE__ */ H(null);
  const T = [
    "tech",
    "photo",
    "redeveloped",
    "stablediffusion",
    "photoshopped"
  ];
  let b = /* @__PURE__ */ H(0);
  async function v(d) {
    try {
      const k = await se.get(`/admin/api/entry/${d}`);
      x(a, k, !0), n.id = k.id, n.title = k.title, n.body = k.body, n.format = k.format || "Hatena", n.status = k.status, n.publishLater = k.status === "scheduled", k.publish_at?.Valid ? n.publishAt = ot("%Y-%m-%dT%H:%M", new Date(k.publish_at.Time)) : n.publishAt = ot("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), s.check(u(a).id, { title: n.title, body: n.body });
    } catch (k) {
      console.error(k), alert("エントリの取得に失敗しました");
    }
  }
  Ct(() => {
    r() ? v(r()) : (x(a, { id: null, title: "", body: "", status: "public" }, !0), n.id = null, n.title = "", n.body = "", n.format = "Hatena", n.status = "public", n.publishLater = !1, n.publishAt = ot("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), s.check(null, { title: n.title, body: n.body }));
  }), hn(() => {
    (u(a).title !== n.title || u(a).body !== n.body) && s.saveDebounced(u(a).id, { title: n.title, body: n.body });
  });
  async function E() {
    x(i, !0), x(o, "リクエスト中");
    const d = new FormData();
    if (d.set("id", n.id ? String(n.id) : ""), d.set("title", n.title), d.set("body", n.body), d.set("format", n.format), n.publishLater) {
      const k = new Date(n.publishAt);
      d.set("publish_at", k.toISOString()), d.set("status", "scheduled");
    } else
      d.set("status", "public");
    try {
      const F = (await se.post("/admin/api/edit", d)).session_id;
      if (!F)
        throw new Error("保存に失敗しました");
      U(F);
    } catch (k) {
      x(i, !1), alert(k instanceof Error ? k.message : "エラーが発生しました");
    }
  }
  function U(d) {
    const k = new EventSource(`/admin/api/edit/progress?sid=${d}`);
    k.onmessage = (F) => {
      const B = JSON.parse(F.data);
      switch (B.type) {
        case "progress":
          x(o, R(B.message), !0);
          break;
        case "done":
          s.clear(u(a).id), x(o, "完了"), x(i, !1), k.close(), t.onSave(B.location);
          break;
        case "error":
          x(o, "エラー: " + B.message), x(i, !1), k.close(), alert("保存に失敗しました: " + B.message);
          break;
      }
    }, k.onerror = () => {
      x(i, !1), k.close(), alert("通信エラーが発生しました");
    };
  }
  function R(d) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[d] || d;
  }
  function O() {
    x(b, 0), u(g).showModal(), setTimeout(() => u(p)?.focus(), 0);
  }
  function A(d) {
    d.key === "ArrowDown" ? (d.preventDefault(), x(b, (u(b) + 1) % T.length)) : d.key === "ArrowUp" ? (d.preventDefault(), x(b, (u(b) - 1 + T.length) % T.length)) : d.key === "Enter" || d.key === " " ? (d.preventDefault(), L(T[u(b)])) : d.key === "Escape" && u(g).close();
  }
  function L(d) {
    const k = `[${d}]`;
    n.title.includes(k) ? n.title = n.title.replace(k, "") : n.title = k + n.title, u(g).close(), u(f).focus();
  }
  function X() {
    s.data && (n.title = s.data.title, n.body = s.data.body, s.clear(u(a).id), u(_).close());
  }
  async function D() {
    const d = document.createElement("input");
    d.type = "file", d.oninput = async () => {
      if (!d.files?.[0]) return;
      const k = new FormData();
      k.append("file", d.files[0]), x(l, !0);
      try {
        const F = await se.post("/admin/api/upload/image", k), B = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${F.uploaded}" class="picasa" itemprop="url"><img src="${F.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        q(B, !0);
      } catch {
        alert("アップロードに失敗しました");
      } finally {
        x(l, !1);
      }
    }, d.click();
  }
  function q(d, k = !1) {
    const F = u(c).selectionStart, B = u(c).selectionEnd, $ = u(c).value;
    n.body = $.substring(0, F) + d + $.substring(B), Tn().then(() => {
      typeof k == "boolean" && k ? (u(c).selectionStart = F, u(c).selectionEnd = F + d.length) : typeof k == "number" ? u(c).selectionStart = u(c).selectionEnd = F + k : u(c).selectionStart = u(c).selectionEnd = F + d.length, u(c).focus();
    });
  }
  function S(d) {
    (d.altKey ? "Alt-" : "") + (d.ctrlKey ? "Control-" : "") + (d.metaKey ? "Meta-" : "") + (d.shiftKey ? "Shift-" : "") + d.key === "Control-t" && (q("\\(  \\)", 3), d.preventDefault(), d.stopPropagation());
  }
  var m = Gt(), M = ht(m);
  {
    var I = (d) => {
      var k = ya();
      j(d, k);
    }, y = (d) => {
      var k = xa(), F = ht(k), B = h(F), $ = h(B);
      kt($, (N) => x(f, N), () => u(f));
      var ee = w($, 2), oe = h(ee);
      oe.__click = O;
      var de = w(oe, 2);
      de.__click = D;
      var V = h(de), te = w(de, 2);
      Wt(te, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], Kt, (N, G) => {
        var pe = Ma(), Fe = h(pe), St = {};
        ne(() => {
          C(Fe, G), St !== (St = G) && (pe.value = (pe.__value = G) ?? "");
        }), j(N, pe);
      });
      var Se = w(ee, 2), he = h(Se);
      he.__keydown = S, kt(he, (N) => x(c, N), () => u(c));
      var ke = w(B, 2), _e = h(ke);
      {
        var Ee = (N) => {
          var G = Sa();
          j(N, G);
        };
        ae(_e, (N) => {
          u(i) && N(Ee);
        });
      }
      var Le = w(_e, 2), Je = h(Le), rt = h(Je), Xe = h(rt), wt = w(rt, 2);
      {
        var nt = (N) => {
          var G = ka();
          Ut(G, () => n.publishAt, (pe) => n.publishAt = pe), j(N, G);
        };
        ae(wt, (N) => {
          n.publishLater && N(nt);
        });
      }
      var Ce = w(Je, 2);
      Ce.__click = E;
      var st = h(Ce), yt = w(Ce, 2);
      {
        var Mt = (N) => {
          var G = Ea();
          G.__click = () => u(_).showModal(), j(N, G);
        };
        ae(yt, (N) => {
          s.exists && N(Mt);
        });
      }
      var $e = w(F, 2), at = w(h($e), 2);
      at.__keydown = A, Wt(at, 21, () => T, Kt, (N, G, pe) => {
        var Fe = Da();
        let St;
        Fe.__click = () => L(u(G)), Fe.__keydown = (Yn) => Yn.key === "Enter" && L(u(G));
        var On = h(Fe);
        ne(() => {
          St = qe(Fe, 1, "tag-item svelte-7nstam", null, St, { selected: u(b) === pe }), Ot(Fe, "aria-selected", u(b) === pe), C(On, u(G));
        }), qs("mouseenter", Fe, () => x(b, pe, !0)), j(N, Fe);
      }), kt(at, (N) => x(p, N), () => u(p));
      var ar = w(at, 2);
      ar.__click = () => u(g).close(), kt($e, (N) => x(g, N), () => u(g));
      var jt = w($e, 2), qt = w(h(jt), 2), ir = h(qt);
      {
        var lr = (N) => {
          var G = Us();
          ne((pe) => C(G, pe), [() => ot("%Y年%m月%d日%H時", new Date(s.data.time))]), j(N, G);
        };
        ae(ir, (N) => {
          s.data?.time && N(lr);
        });
      }
      var In = w(qt, 2), Fr = h(In);
      Fr.__click = () => u(_).close();
      var Pn = w(Fr, 2);
      Pn.__click = X, kt(jt, (N) => x(_, N), () => u(_)), ne(() => {
        de.disabled = u(l), C(V, u(l) ? "⌛ アップロード中..." : "📷 写真"), Ce.disabled = u(i), C(st, u(i) ? u(o) || "リクエスト中" : r() ? "更新" : "作成");
      }), Ut($, () => n.title, (N) => n.title = N), Qs(te, () => n.format, (N) => n.format = N), Ut(he, () => n.body, (N) => n.body = N), sa(Xe, () => n.publishLater, (N) => n.publishLater = N), j(d, k);
    };
    ae(M, (d) => {
      se.loading && !u(a).id ? d(I) : d(y, !1);
    });
  }
  j(e, m), mt();
}
sr(["click", "keydown"]);
const Aa = (e, t = Qt) => {
  var r = Fa(), s = h(r);
  ne(() => {
    qe(r, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), C(s, t());
  }), j(e, r);
};
var Fa = /* @__PURE__ */ J("<span> </span>"), Na = /* @__PURE__ */ J('<time class="time svelte-1r6codn"> </time>'), Ra = /* @__PURE__ */ J('<div class="loading svelte-1r6codn"></div>'), Ia = /* @__PURE__ */ J('<div class="error-text svelte-1r6codn"> </div>'), Pa = /* @__PURE__ */ J('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><!></td><td class="error svelte-1r6codn"><!></td></tr>'), Oa = /* @__PURE__ */ J('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), Ya = /* @__PURE__ */ J('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">新しい方へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">古い方へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function Ha(e, t) {
  pt(t, !0);
  const r = (D, q = Qt, S) => {
    let m = /* @__PURE__ */ kr(() => Vr(S?.(), !0));
    var M = Na(), I = h(M);
    ne(
      (y) => {
        Ot(M, "datetime", q()), C(I, y);
      },
      [() => u(m) && q() ? c(q()) : "-"]
    ), j(D, M);
  };
  let s = /* @__PURE__ */ H(ye([])), a = /* @__PURE__ */ H(0), n = /* @__PURE__ */ H(0), i = 50;
  async function o() {
    try {
      const D = await se.get("/admin/api/jobs", { limit: i, offset: u(n) });
      x(s, D.jobs || [], !0), x(a, D.total || 0, !0);
    } catch (D) {
      console.error(D);
    }
  }
  Ct(o);
  function l() {
    u(n) + i < u(a) && (x(n, u(n) + i), o());
  }
  function f() {
    u(n) - i >= 0 && (x(n, u(n) - i), o());
  }
  function c(D) {
    return ot("%Y-%m-%d %H:%M:%S", new Date(D));
  }
  var g = Ya(), _ = h(g), p = h(_), T = h(p), b = w(p, 2), v = h(b);
  v.__click = f;
  var E = w(v, 2), U = h(E), R = w(E, 2);
  R.__click = l;
  var O = w(R, 2);
  O.__click = o;
  var A = w(_, 2);
  {
    var L = (D) => {
      var q = Ra();
      j(D, q);
    }, X = (D) => {
      var q = Oa(), S = w(h(q));
      Wt(S, 21, () => u(s), Kt, (m, M) => {
        var I = Pa(), y = h(I), d = h(y), k = w(y), F = h(k), B = h(F), $ = w(k), ee = h($);
        Aa(ee, () => u(M).status);
        var oe = w($), de = h(oe), V = w(oe), te = h(V);
        r(te, () => u(M).created_at);
        var Se = w(V), he = h(Se);
        {
          var ke = (_e) => {
            var Ee = Ia(), Le = h(Ee);
            ne(() => {
              Ot(Ee, "title", u(M).error_message.String), C(Le, u(M).error_message.String);
            }), j(_e, Ee);
          };
          ae(he, (_e) => {
            u(M).error_message?.Valid && _e(ke);
          });
        }
        ne(() => {
          C(d, u(M).id), C(B, u(M).job_type_name), C(de, u(M).retry_count);
        }), j(m, I);
      }), j(D, q);
    };
    ae(A, (D) => {
      se.loading && u(s).length === 0 ? D(L) : D(X, !1);
    });
  }
  ne(
    (D) => {
      C(T, `ジョブ一覧 (${u(a) ?? ""})`), v.disabled = u(n) === 0 || se.loading, C(U, `${u(n) + 1} - ${D ?? ""} / ${u(a) ?? ""}`), R.disabled = u(n) + i >= u(a) || se.loading;
    },
    [() => Math.min(u(n) + i, u(a))]
  ), j(e, g), mt();
}
sr(["click"]);
var La = /* @__PURE__ */ J('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), Ca = /* @__PURE__ */ J('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), ja = /* @__PURE__ */ J('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function qa(e, t) {
  pt(t, !0);
  let r = /* @__PURE__ */ H(null), s = /* @__PURE__ */ H(!0);
  async function a() {
    x(s, !0);
    try {
      const c = await fetch("/admin/api/info");
      x(r, await c.json(), !0);
    } catch (c) {
      console.error(c);
    } finally {
      x(s, !1);
    }
  }
  Ct(a);
  function n(c) {
    if (c === 0) return "0 B";
    const g = 1024, _ = ["B", "KB", "MB", "GB", "TB"], p = Math.floor(Math.log(c) / Math.log(g));
    return parseFloat((c / Math.pow(g, p)).toFixed(2)) + " " + _[p];
  }
  var i = ja(), o = w(h(i), 2);
  {
    var l = (c) => {
      var g = La();
      j(c, g);
    }, f = (c) => {
      var g = Gt(), _ = ht(g);
      {
        var p = (T) => {
          var b = Ca(), v = h(b), E = w(h(v), 2), U = h(E), R = h(U), O = h(R), A = w(h(O)), L = h(A), X = w(O), D = w(h(X)), q = h(D), S = h(q), m = w(v, 2), M = w(h(m), 2), I = h(M), y = h(I), d = h(y), k = w(h(d)), F = h(k), B = w(d), $ = w(h(B)), ee = h($), oe = w(B), de = w(h(oe)), V = h(de), te = w(oe), Se = w(h(te)), he = h(Se), ke = w(te), _e = w(h(ke)), Ee = h(_e), Le = w(ke), Je = w(h(Le)), rt = h(Je), Xe = w(Le), wt = w(h(Xe)), nt = h(wt), Ce = w(Xe), st = w(h(Ce)), yt = h(st), Mt = w(m, 2), $e = w(h(Mt), 2), at = h($e);
          ne(
            (ar, jt, qt, ir, lr) => {
              C(L, u(r).is_development), C(S, u(r).app_hash), C(F, u(r).debug_info.go_version), C(ee, u(r).debug_info.num_goroutine), C(V, ar), C(he, u(r).debug_info.uptime), C(Ee, jt), C(rt, qt), C(nt, ir), C(yt, u(r).debug_info.num_gc), C(at, lr);
            },
            [
              () => new Date(u(r).debug_info.start_time).toLocaleString(),
              () => n(u(r).debug_info.mem_alloc),
              () => n(u(r).debug_info.mem_total_alloc),
              () => n(u(r).debug_info.mem_sys),
              () => JSON.stringify(u(r).config, null, 2)
            ]
          ), j(T, b);
        };
        ae(
          _,
          (T) => {
            u(r) && T(p);
          },
          !0
        );
      }
      j(c, g);
    };
    ae(o, (c) => {
      u(s) ? c(l) : c(f, !1);
    });
  }
  j(e, i), mt();
}
var za = /* @__PURE__ */ J('<div class="admin-app svelte-1n46o8q"><nav class="sub-nav svelte-1n46o8q"><a href="/admin/">エントリ一覧</a> <a href="/admin/edit">新規作成</a> <a href="/admin/jobs">ジョブ一覧</a> <a href="/admin/info">情報</a></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function Ua(e, t) {
  pt(t, !0);
  let r = /* @__PURE__ */ H(ye(window.location.pathname)), s = /* @__PURE__ */ H(ye(new URLSearchParams(window.location.search)));
  Ct(() => {
    const A = () => {
      x(r, window.location.pathname, !0), x(s, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", A), () => window.removeEventListener("popstate", A);
  });
  function a(A, L) {
    L && L.preventDefault(), window.history.pushState({}, "", A), x(r, window.location.pathname, !0), x(s, new URLSearchParams(window.location.search), !0);
  }
  const n = /* @__PURE__ */ Pr(() => u(r) === "/admin/edit" ? "edit" : u(r) === "/admin/jobs" ? "jobs" : u(r) === "/admin/info" ? "info" : "list"), i = /* @__PURE__ */ Pr(() => u(s).get("id"));
  var o = za(), l = h(o), f = h(l);
  f.__click = (A) => a("/admin/", A);
  let c;
  var g = w(f, 2);
  g.__click = (A) => a("/admin/edit", A);
  let _;
  var p = w(g, 2);
  p.__click = (A) => a("/admin/jobs", A);
  let T;
  var b = w(p, 2);
  b.__click = (A) => a("/admin/info", A);
  let v;
  var E = w(l, 2), U = h(E);
  {
    var R = (A) => {
      Ta(A, {
        get id() {
          return u(i);
        },
        onSave: (L) => window.location.href = L
      });
    }, O = (A) => {
      var L = Gt(), X = ht(L);
      {
        var D = (S) => {
          Ha(S, {});
        }, q = (S) => {
          var m = Gt(), M = ht(m);
          {
            var I = (d) => {
              qa(d, {});
            }, y = (d) => {
              ba(d, { onEdit: (k) => a(`/admin/edit?id=${k}`) });
            };
            ae(
              M,
              (d) => {
                u(n) === "info" ? d(I) : d(y, !1);
              },
              !0
            );
          }
          j(S, m);
        };
        ae(
          X,
          (S) => {
            u(n) === "jobs" ? S(D) : S(q, !1);
          },
          !0
        );
      }
      j(A, L);
    };
    ae(U, (A) => {
      u(n) === "edit" ? A(R) : A(O, !1);
    });
  }
  ne(() => {
    c = qe(f, 1, "svelte-1n46o8q", null, c, { active: u(n) === "list" }), _ = qe(g, 1, "svelte-1n46o8q", null, _, { active: u(n) === "edit" && !u(i) }), T = qe(p, 1, "svelte-1n46o8q", null, T, { active: u(n) === "jobs" }), v = qe(b, 1, "svelte-1n46o8q", null, v, { active: u(n) === "info" });
  }), j(e, o), mt();
}
sr(["click"]);
const vr = document.getElementById("admin-root");
vr && (vr.innerHTML = "", Bs(Ua, { target: vr }));
//# sourceMappingURL=admin-front.js.map
