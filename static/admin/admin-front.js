var xr = Array.isArray, Gn = Array.prototype.indexOf, nr = Array.from, Kn = Object.defineProperty, Ft = Object.getOwnPropertyDescriptor, Wn = Object.getOwnPropertyDescriptors, Zn = Object.prototype, Qn = Array.prototype, en = Object.getPrototypeOf, Cr = Object.isExtensible;
const sr = () => {
};
function es(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function tn() {
  var e, t, r = new Promise((s, a) => {
    e = s, t = a;
  });
  return { promise: r, resolve: e, reject: t };
}
function rn(e, t, r = !1) {
  return e === void 0 ? r ? (
    /** @type {() => V} */
    t()
  ) : (
    /** @type {V} */
    t
  ) : e;
}
const K = 2, Tr = 4, Ar = 8, ts = 1 << 24, Ye = 16, He = 32, rt = 64, ar = 128, ke = 512, Z = 1024, ve = 2048, Te = 4096, ce = 8192, ze = 16384, Fr = 32768, vt = 65536, jr = 1 << 17, nn = 1 << 18, gt = 1 << 19, rs = 1 << 20, Re = 1 << 25, Qe = 32768, Mr = 1 << 21, Nr = 1 << 22, Ue = 1 << 23, ct = /* @__PURE__ */ Symbol("$state"), ns = /* @__PURE__ */ Symbol(""), ut = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function ss(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function as() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function is(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function ls() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function os(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function us() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function fs() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function cs() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function vs() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function ds() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const hs = 1, _s = 2, sn = 4, ps = 8, ms = 16, gs = 1, bs = 2, W = /* @__PURE__ */ Symbol(), ws = "http://www.w3.org/1999/xhtml";
function ys() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Ms() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function an(e) {
  return e === this.v;
}
function Ss(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function ln(e) {
  return !Ss(e, this.v);
}
let de = null;
function dt(e) {
  de = e;
}
function bt(e, t = !1, r) {
  de = {
    p: de,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function wt(e) {
  var t = (
    /** @type {ComponentContext} */
    de
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var s of r)
      Sn(s);
  }
  return t.i = !0, de = t.p, /** @type {T} */
  {};
}
function on() {
  return !0;
}
let Ge = [];
function un() {
  var e = Ge;
  Ge = [], es(e);
}
function yt(e) {
  if (Ge.length === 0 && !It) {
    var t = Ge;
    queueMicrotask(() => {
      t === Ge && un();
    });
  }
  Ge.push(e);
}
function ks() {
  for (; Ge.length > 0; )
    un();
}
function fn(e) {
  var t = z;
  if (t === null)
    return O.f |= Ue, e;
  if ((t.f & Fr) === 0) {
    if ((t.f & ar) === 0)
      throw e;
    t.b.error(e);
  } else
    ht(e, t);
}
function ht(e, t) {
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
let H = null, Nt = null, we = null, ge = [], ir = null, Sr = !1, It = !1;
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
    ge = [], Nt = null, this.apply();
    var r = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const s of t)
      this.#i(s, r);
    this.is_fork || this.#f(), this.is_deferred() ? (this.#l(r.effects), this.#l(r.render_effects)) : (Nt = this, H = null, qr(r.render_effects), qr(r.effects), Nt = null, this.#o?.resolve()), we = null;
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
      var a = s.f, n = (a & (He | rt)) !== 0, i = n && (a & Z) !== 0, o = i || (a & ce) !== 0 || this.skipped_effects.has(s);
      if ((s.f & ar) !== 0 && s.b?.is_pending() && (r = {
        parent: r,
        effect: s,
        effects: [],
        render_effects: []
      }), !o && s.fn !== null) {
        n ? s.f ^= Z : (a & Tr) !== 0 ? r.effects.push(s) : qt(s) && ((s.f & Ye) !== 0 && this.#a.add(s), Ht(s));
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
      (r.f & ve) !== 0 ? this.#a.add(r) : (r.f & Te) !== 0 && this.#s.add(r), this.#u(r.deps), ee(r, Z);
  }
  /**
   * @param {Value[] | null} deps
   */
  #u(t) {
    if (t !== null)
      for (const r of t)
        (r.f & K) === 0 || (r.f & Qe) === 0 || (r.f ^= Qe, this.#u(
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
    H = this, this.apply();
  }
  deactivate() {
    H === this && (H = null, we = null);
  }
  flush() {
    if (this.activate(), ge.length > 0) {
      if (cn(), H !== null && H !== this)
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
      var t = we, r = !0, s = {
        parent: null,
        effect: null,
        effects: [],
        render_effects: []
      };
      for (const n of Gt) {
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
            vn(c, o, l, f);
          if (ge.length > 0) {
            H = n, n.apply();
            for (const c of ge)
              n.#i(c, s);
            n.deactivate();
          }
          ge = a;
        }
      }
      H = null, we = t;
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
      this.#s.delete(t), ee(t, ve), et(t);
    for (const t of this.#s)
      ee(t, Te), et(t);
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
    return (this.#o ??= tn()).promise;
  }
  static ensure() {
    if (H === null) {
      const t = H = new De();
      Gt.add(H), It || De.enqueue(() => {
        H === t && t.flush();
      });
    }
    return H;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    yt(t);
  }
  apply() {
  }
}
function Es(e) {
  var t = It;
  It = !0;
  try {
    for (var r; ; ) {
      if (ks(), ge.length === 0 && (H?.flush(), ge.length === 0))
        return ir = null, /** @type {T} */
        r;
      cn();
    }
  } finally {
    It = t;
  }
}
function cn() {
  var e = We;
  Sr = !0;
  var t = null;
  try {
    var r = 0;
    for (Qt(!0); ge.length > 0; ) {
      var s = De.ensure();
      if (r++ > 1e3) {
        var a, n;
        Ds();
      }
      s.process(ge), Be.clear();
    }
  } finally {
    Sr = !1, Qt(e), ir = null;
  }
}
function Ds() {
  try {
    us();
  } catch (e) {
    ht(e, ir);
  }
}
let Ie = null;
function qr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var s = e[r++];
      if ((s.f & (ze | ce)) === 0 && qt(s) && (Ie = /* @__PURE__ */ new Set(), Ht(s), s.deps === null && s.first === null && s.nodes === null && (s.teardown === null && s.ac === null ? xn(s) : s.fn = null), Ie?.size > 0)) {
        Be.clear();
        for (const a of Ie) {
          if ((a.f & (ze | ce)) !== 0) continue;
          const n = [a];
          let i = a.parent;
          for (; i !== null; )
            Ie.has(i) && (Ie.delete(i), n.push(i)), i = i.parent;
          for (let o = n.length - 1; o >= 0; o--) {
            const l = n[o];
            (l.f & (ze | ce)) === 0 && Ht(l);
          }
        }
        Ie.clear();
      }
    }
    Ie = null;
  }
}
function vn(e, t, r, s) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const n = a.f;
      (n & K) !== 0 ? vn(
        /** @type {Derived} */
        a,
        t,
        r,
        s
      ) : (n & (Nr | Ye)) !== 0 && (n & ve) === 0 && dn(a, t, s) && (ee(a, ve), et(
        /** @type {Effect} */
        a
      ));
    }
}
function dn(e, t, r) {
  const s = r.get(e);
  if (s !== void 0) return s;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (t.includes(a))
        return !0;
      if ((a.f & K) !== 0 && dn(
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
function et(e) {
  for (var t = ir = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Sr && t === z && (r & Ye) !== 0 && (r & nn) === 0)
      return;
    if ((r & (rt | He)) !== 0) {
      if ((r & Z) === 0) return;
      t.f ^= Z;
    }
  }
  ge.push(t);
}
function xs(e) {
  let t = 0, r = tt(0), s;
  return () => {
    Ot() && (u(r), or(() => (t === 0 && (s = zt(() => e(() => Rt(r)))), t += 1, () => {
      yt(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, Rt(r));
      });
    })));
  };
}
var Ts = vt | gt | ar;
function As(e, t, r) {
  new Fs(e, t, r);
}
class Fs {
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
  #b = xs(() => (this.#d = tt(this.#c), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, s) {
    this.#t = t, this.#r = r, this.#o = s, this.parent = /** @type {Effect} */
    z.b, this.#e = !!this.#r.pending, this.#a = Hr(() => {
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
    }, Ts);
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
      this.#s = this.#_(() => (De.ensure(), be(() => this.#o(r)))), this.#v > 0 ? this.#p() : (Ke(
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
    return this.#e && (this.#f = Pe(), this.#t.before(this.#f), t = this.#f), t;
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
    var r = z, s = O, a = de;
    Ae(this.#a), le(this.#a), dt(this.#a.ctx);
    try {
      return t();
    } catch (n) {
      return fn(n), null;
    } finally {
      Ae(r), le(s), dt(a);
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
    ), Fn(this.#s, this.#u)), this.#i === null && (this.#i = be(() => t(this.#t)));
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
    this.#v += t, this.#v === 0 && (this.#e = !1, this.#i && Ke(this.#i, () => {
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
    this.#g(t), this.#c += t, this.#d && _t(this.#d, this.#c);
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
    this.#s && (oe(this.#s), this.#s = null), this.#i && (oe(this.#i), this.#i = null), this.#l && (oe(this.#l), this.#l = null);
    var a = !1, n = !1;
    const i = () => {
      if (a) {
        Ms();
        return;
      }
      a = !0, n && ds(), De.ensure(), this.#c = 0, this.#l !== null && Ke(this.#l, () => {
        this.#l = null;
      }), this.#e = this.has_pending_snippet(), this.#s = this.#_(() => (this.#h = !1, be(() => this.#o(this.#t)))), this.#v > 0 ? this.#p() : this.#e = !1;
    };
    var o = O;
    try {
      le(null), n = !0, r?.(t, i), n = !1;
    } catch (l) {
      ht(l, this.#a && this.#a.parent);
    } finally {
      le(o);
    }
    s && yt(() => {
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
          return ht(
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
function Ns(e, t, r, s) {
  const a = Ir;
  if (r.length === 0 && e.length === 0) {
    s(t.map(a));
    return;
  }
  var n = H, i = (
    /** @type {Effect} */
    z
  ), o = Is();
  function l() {
    Promise.all(r.map((f) => /* @__PURE__ */ Rs(f))).then((f) => {
      o();
      try {
        s([...t.map(a), ...f]);
      } catch (c) {
        (i.f & ze) === 0 && ht(c, i);
      }
      n?.deactivate(), Wt();
    }).catch((f) => {
      ht(f, i);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    o();
    try {
      return l();
    } finally {
      n?.deactivate(), Wt();
    }
  }) : l();
}
function Is() {
  var e = z, t = O, r = de, s = H;
  return function(n = !0) {
    Ae(e), le(t), dt(r), n && s?.activate();
  };
}
function Wt() {
  Ae(null), le(null), dt(null);
}
// @__NO_SIDE_EFFECTS__
function Ir(e) {
  var t = K | ve, r = O !== null && (O.f & K) !== 0 ? (
    /** @type {Derived} */
    O
  ) : null;
  return z !== null && (z.f |= gt), {
    ctx: de,
    deps: null,
    effects: null,
    equals: an,
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
function Rs(e, t) {
  let r = (
    /** @type {Effect | null} */
    z
  );
  r === null && as();
  var s = (
    /** @type {Boundary} */
    r.b
  ), a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), n = tt(
    /** @type {V} */
    W
  ), i = !O, o = /* @__PURE__ */ new Map();
  return Bs(() => {
    var l = tn();
    a = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).then(() => {
        f === H && f.committed && f.deactivate(), Wt();
      });
    } catch (_) {
      l.reject(_), Wt();
    }
    var f = (
      /** @type {Batch} */
      H
    );
    if (i) {
      var c = !s.is_pending();
      s.update_pending_count(1), f.increment(c), o.get(f)?.reject(ut), o.delete(f), o.set(f, l);
    }
    const b = (_, m = void 0) => {
      if (f.activate(), m)
        m !== ut && (n.f |= Ue, _t(n, m));
      else {
        (n.f & Ue) !== 0 && (n.f ^= Ue), _t(n, _);
        for (const [T, w] of o) {
          if (o.delete(T), T === f) break;
          w.reject(ut);
        }
      }
      i && (s.update_pending_count(-1), f.decrement(c));
    };
    l.promise.then(b, (_) => b(null, _ || "unknown"));
  }), Yr(() => {
    for (const l of o.values())
      l.reject(ut);
  }), new Promise((l) => {
    function f(c) {
      function b() {
        c === a ? l(n) : f(a);
      }
      c.then(b, b);
    }
    f(a);
  });
}
// @__NO_SIDE_EFFECTS__
function zr(e) {
  const t = /* @__PURE__ */ Ir(e);
  return Nn(t), t;
}
// @__NO_SIDE_EFFECTS__
function Rr(e) {
  const t = /* @__PURE__ */ Ir(e);
  return t.equals = ln, t;
}
function hn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      oe(
        /** @type {Effect} */
        t[r]
      );
  }
}
function Ps(e) {
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
function Pr(e) {
  var t, r = z;
  Ae(Ps(e));
  try {
    e.f &= ~Qe, hn(e), t = On(e);
  } finally {
    Ae(r);
  }
  return t;
}
function _n(e) {
  var t = Pr(e);
  if (e.equals(t) || (H?.is_fork || (e.v = t), e.wv = Rn()), !Mt)
    if (we !== null)
      (Ot() || H?.is_fork) && we.set(e, t);
    else {
      var r = (e.f & ke) === 0 ? Te : Z;
      ee(e, r);
    }
}
let kr = /* @__PURE__ */ new Set();
const Be = /* @__PURE__ */ new Map();
let pn = !1;
function tt(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: an,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function L(e, t) {
  const r = tt(e);
  return Nn(r), r;
}
// @__NO_SIDE_EFFECTS__
function Os(e, t = !1, r = !0) {
  const s = tt(e);
  return t || (s.equals = ln), s;
}
function x(e, t, r = !1) {
  O !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!xe || (O.f & jr) !== 0) && on() && (O.f & (K | Ye | Nr | jr)) !== 0 && !Oe?.includes(e) && vs();
  let s = r ? ye(t) : t;
  return _t(e, s);
}
function _t(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Mt ? Be.set(e, t) : Be.set(e, r), e.v = t;
    var s = De.ensure();
    s.capture(e, r), (e.f & K) !== 0 && ((e.f & ve) !== 0 && Pr(
      /** @type {Derived} */
      e
    ), ee(e, (e.f & ke) !== 0 ? Z : Te)), e.wv = Rn(), mn(e, ve), z !== null && (z.f & Z) !== 0 && (z.f & (He | rt)) === 0 && (me === null ? $s([e]) : me.push(e)), !s.is_fork && kr.size > 0 && !pn && Ys();
  }
  return t;
}
function Ys() {
  pn = !1;
  var e = We;
  Qt(!0);
  const t = Array.from(kr);
  try {
    for (const r of t)
      (r.f & Z) !== 0 && ee(r, Te), qt(r) && Ht(r);
  } finally {
    Qt(e);
  }
  kr.clear();
}
function Rt(e) {
  x(e, e.v + 1);
}
function mn(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, a = 0; a < s; a++) {
      var n = r[a], i = n.f, o = (i & ve) === 0;
      if (o && ee(n, t), (i & K) !== 0) {
        var l = (
          /** @type {Derived} */
          n
        );
        we?.delete(l), (i & Qe) === 0 && (i & ke && (n.f |= Qe), mn(l, Te));
      } else o && ((i & Ye) !== 0 && Ie !== null && Ie.add(
        /** @type {Effect} */
        n
      ), et(
        /** @type {Effect} */
        n
      ));
    }
}
function ye(e) {
  if (typeof e != "object" || e === null || ct in e)
    return e;
  const t = en(e);
  if (t !== Zn && t !== Qn)
    return e;
  var r = /* @__PURE__ */ new Map(), s = xr(e), a = /* @__PURE__ */ L(0), n = Ze, i = (o) => {
    if (Ze === n)
      return o();
    var l = O, f = Ze;
    le(null), $r(n);
    var c = o();
    return le(l), $r(f), c;
  };
  return s && r.set("length", /* @__PURE__ */ L(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(o, l, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && fs();
        var c = r.get(l);
        return c === void 0 ? c = i(() => {
          var b = /* @__PURE__ */ L(f.value);
          return r.set(l, b), b;
        }) : x(c, f.value, !0), !0;
      },
      deleteProperty(o, l) {
        var f = r.get(l);
        if (f === void 0) {
          if (l in o) {
            const c = i(() => /* @__PURE__ */ L(W));
            r.set(l, c), Rt(a);
          }
        } else
          x(f, W), Rt(a);
        return !0;
      },
      get(o, l, f) {
        if (l === ct)
          return e;
        var c = r.get(l), b = l in o;
        if (c === void 0 && (!b || Ft(o, l)?.writable) && (c = i(() => {
          var m = ye(b ? o[l] : W), T = /* @__PURE__ */ L(m);
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
          var b = r.get(l), _ = b?.v;
          if (b !== void 0 && _ !== W)
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
        if (l === ct)
          return !0;
        var f = r.get(l), c = f !== void 0 && f.v !== W || Reflect.has(o, l);
        if (f !== void 0 || z !== null && (!c || Ft(o, l)?.writable)) {
          f === void 0 && (f = i(() => {
            var _ = c ? ye(o[l]) : W, m = /* @__PURE__ */ L(_);
            return m;
          }), r.set(l, f));
          var b = u(f);
          if (b === W)
            return !1;
        }
        return c;
      },
      set(o, l, f, c) {
        var b = r.get(l), _ = l in o;
        if (s && l === "length")
          for (var m = f; m < /** @type {Source<number>} */
          b.v; m += 1) {
            var T = r.get(m + "");
            T !== void 0 ? x(T, W) : m in o && (T = i(() => /* @__PURE__ */ L(W)), r.set(m + "", T));
          }
        if (b === void 0)
          (!_ || Ft(o, l)?.writable) && (b = i(() => /* @__PURE__ */ L(void 0)), x(b, ye(f)), r.set(l, b));
        else {
          _ = b.v !== W;
          var w = i(() => ye(f));
          x(b, w);
        }
        var d = Reflect.getOwnPropertyDescriptor(o, l);
        if (d?.set && d.set.call(c, f), !_) {
          if (s && typeof l == "string") {
            var E = (
              /** @type {Source<number>} */
              r.get("length")
            ), U = Number(l);
            Number.isInteger(U) && U >= E.v && x(E, U + 1);
          }
          Rt(a);
        }
        return !0;
      },
      ownKeys(o) {
        u(a);
        var l = Reflect.ownKeys(o).filter((b) => {
          var _ = r.get(b);
          return _ === void 0 || _.v !== W;
        });
        for (var [f, c] of r)
          c.v !== W && !(f in o) && l.push(f);
        return l;
      },
      setPrototypeOf() {
        cs();
      }
    }
  );
}
function Ur(e) {
  try {
    if (e !== null && typeof e == "object" && ct in e)
      return e[ct];
  } catch {
  }
  return e;
}
function Hs(e, t) {
  return Object.is(Ur(e), Ur(t));
}
var Br, gn, bn, wn;
function Ls() {
  if (Br === void 0) {
    Br = window, gn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    bn = Ft(t, "firstChild").get, wn = Ft(t, "nextSibling").get, Cr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Cr(r) && (r.__t = void 0);
  }
}
function Pe(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Zt(e) {
  return (
    /** @type {TemplateNode | null} */
    bn.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function jt(e) {
  return (
    /** @type {TemplateNode | null} */
    wn.call(e)
  );
}
function v(e, t) {
  return /* @__PURE__ */ Zt(e);
}
function pt(e, t = !1) {
  {
    var r = /* @__PURE__ */ Zt(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ jt(r) : r;
  }
}
function p(e, t = 1, r = !1) {
  let s = e;
  for (; t--; )
    s = /** @type {TemplateNode} */
    /* @__PURE__ */ jt(s);
  return s;
}
function Cs(e) {
  e.textContent = "";
}
function yn() {
  return !1;
}
let Jr = !1;
function js() {
  Jr || (Jr = !0, document.addEventListener(
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
  var t = O, r = z;
  le(null), Ae(null);
  try {
    return e();
  } finally {
    le(t), Ae(r);
  }
}
function Or(e, t, r, s = r) {
  e.addEventListener(t, () => lr(r));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), s(!0);
  } : e.__on_r = () => s(!0), js();
}
function qs(e) {
  z === null && (O === null && os(), ls()), Mt && is();
}
function zs(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function Le(e, t, r) {
  var s = z;
  s !== null && (s.f & ce) !== 0 && (e |= ce);
  var a = {
    ctx: de,
    deps: null,
    nodes: null,
    f: e | ve | ke,
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
      Ht(a), a.f |= Fr;
    } catch (o) {
      throw oe(a), o;
    }
  else t !== null && et(a);
  var n = a;
  if (r && n.deps === null && n.teardown === null && n.nodes === null && n.first === n.last && // either `null`, or a singular child
  (n.f & gt) === 0 && (n = n.first, (e & Ye) !== 0 && (e & vt) !== 0 && n !== null && (n.f |= vt)), n !== null && (n.parent = s, s !== null && zs(n, s), O !== null && (O.f & K) !== 0 && (e & rt) === 0)) {
    var i = (
      /** @type {Derived} */
      O
    );
    (i.effects ??= []).push(n);
  }
  return a;
}
function Ot() {
  return O !== null && !xe;
}
function Yr(e) {
  const t = Le(Ar, null, !1);
  return ee(t, Z), t.teardown = e, t;
}
function Mn(e) {
  qs();
  var t = (
    /** @type {Effect} */
    z.f
  ), r = !O && (t & He) !== 0 && (t & Fr) === 0;
  if (r) {
    var s = (
      /** @type {ComponentContext} */
      de
    );
    (s.e ??= []).push(e);
  } else
    return Sn(e);
}
function Sn(e) {
  return Le(Tr | rs, e, !1);
}
function Us(e) {
  De.ensure();
  const t = Le(rt | gt, e, !0);
  return (r = {}) => new Promise((s) => {
    r.outro ? Ke(t, () => {
      oe(t), s(void 0);
    }) : (oe(t), s(void 0));
  });
}
function kn(e) {
  return Le(Tr, e, !1);
}
function Bs(e) {
  return Le(Nr | gt, e, !0);
}
function or(e, t = 0) {
  return Le(Ar | t, e, !0);
}
function Q(e, t = [], r = [], s = []) {
  Ns(s, t, r, (a) => {
    Le(Ar, () => e(...a.map(u)), !0);
  });
}
function Hr(e, t = 0) {
  var r = Le(Ye | t, e, !0);
  return r;
}
function be(e) {
  return Le(He | gt, e, !0);
}
function En(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Mt, s = O;
    Xr(!0), le(null);
    try {
      t.call(null);
    } finally {
      Xr(r), le(s);
    }
  }
}
function Dn(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const a = r.ac;
    a !== null && lr(() => {
      a.abort(ut);
    });
    var s = r.next;
    (r.f & rt) !== 0 ? r.parent = null : oe(r, t), r = s;
  }
}
function Js(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & He) === 0 && oe(t), t = r;
  }
}
function oe(e, t = !0) {
  var r = !1;
  (t || (e.f & nn) !== 0) && e.nodes !== null && e.nodes.end !== null && (Xs(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), Dn(e, t && !r), er(e, 0), ee(e, ze);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const n of s)
      n.stop();
  En(e);
  var a = e.parent;
  a !== null && a.first !== null && xn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Xs(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ jt(e);
    e.remove(), e = r;
  }
}
function xn(e) {
  var t = e.parent, r = e.prev, s = e.next;
  r !== null && (r.next = s), s !== null && (s.prev = r), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = r));
}
function Ke(e, t, r = !0) {
  var s = [];
  Tn(e, s, !0);
  var a = () => {
    r && oe(e), t && t();
  }, n = s.length;
  if (n > 0) {
    var i = () => --n || a();
    for (var o of s)
      o.out(i);
  } else
    a();
}
function Tn(e, t, r) {
  if ((e.f & ce) === 0) {
    e.f ^= ce;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const o of s)
        (o.is_global || r) && t.push(o);
    for (var a = e.first; a !== null; ) {
      var n = a.next, i = (a.f & vt) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (a.f & He) !== 0 && (e.f & Ye) !== 0;
      Tn(a, t, i ? r : !1), a = n;
    }
  }
}
function Lr(e) {
  An(e, !0);
}
function An(e, t) {
  if ((e.f & ce) !== 0) {
    e.f ^= ce, (e.f & Z) === 0 && (ee(e, ve), et(e));
    for (var r = e.first; r !== null; ) {
      var s = r.next, a = (r.f & vt) !== 0 || (r.f & He) !== 0;
      An(r, a ? t : !1), r = s;
    }
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const i of n)
        (i.is_global || t) && i.in();
  }
}
function Fn(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end; r !== null; ) {
      var a = r === s ? null : /* @__PURE__ */ jt(r);
      t.append(r), r = a;
    }
}
let We = !1;
function Qt(e) {
  We = e;
}
let Mt = !1;
function Xr(e) {
  Mt = e;
}
let O = null, xe = !1;
function le(e) {
  O = e;
}
let z = null;
function Ae(e) {
  z = e;
}
let Oe = null;
function Nn(e) {
  O !== null && (Oe === null ? Oe = [e] : Oe.push(e));
}
let re = null, fe = 0, me = null;
function $s(e) {
  me = e;
}
let In = 1, Yt = 0, Ze = Yt;
function $r(e) {
  Ze = e;
}
function Rn() {
  return ++In;
}
function qt(e) {
  var t = e.f;
  if ((t & ve) !== 0)
    return !0;
  if (t & K && (e.f &= ~Qe), (t & Te) !== 0) {
    var r = e.deps;
    if (r !== null)
      for (var s = r.length, a = 0; a < s; a++) {
        var n = r[a];
        if (qt(
          /** @type {Derived} */
          n
        ) && _n(
          /** @type {Derived} */
          n
        ), n.wv > e.wv)
          return !0;
      }
    (t & ke) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    we === null && ee(e, Z);
  }
  return !1;
}
function Pn(e, t, r = !0) {
  var s = e.reactions;
  if (s !== null && !Oe?.includes(e))
    for (var a = 0; a < s.length; a++) {
      var n = s[a];
      (n.f & K) !== 0 ? Pn(
        /** @type {Derived} */
        n,
        t,
        !1
      ) : t === n && (r ? ee(n, ve) : (n.f & Z) !== 0 && ee(n, Te), et(
        /** @type {Effect} */
        n
      ));
    }
}
function On(e) {
  var t = re, r = fe, s = me, a = O, n = Oe, i = de, o = xe, l = Ze, f = e.f;
  re = /** @type {null | Value[]} */
  null, fe = 0, me = null, O = (f & (He | rt)) === 0 ? e : null, Oe = null, dt(e.ctx), xe = !1, Ze = ++Yt, e.ac !== null && (lr(() => {
    e.ac.abort(ut);
  }), e.ac = null);
  try {
    e.f |= Mr;
    var c = (
      /** @type {Function} */
      e.fn
    ), b = c(), _ = e.deps;
    if (re !== null) {
      var m;
      if (er(e, fe), _ !== null && fe > 0)
        for (_.length = fe + re.length, m = 0; m < re.length; m++)
          _[fe + m] = re[m];
      else
        e.deps = _ = re;
      if (Ot() && (e.f & ke) !== 0)
        for (m = fe; m < _.length; m++)
          (_[m].reactions ??= []).push(e);
    } else _ !== null && fe < _.length && (er(e, fe), _.length = fe);
    if (on() && me !== null && !xe && _ !== null && (e.f & (K | Te | ve)) === 0)
      for (m = 0; m < /** @type {Source[]} */
      me.length; m++)
        Pn(
          me[m],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (Yt++, me !== null && (s === null ? s = me : s.push(.../** @type {Source[]} */
    me))), (e.f & Ue) !== 0 && (e.f ^= Ue), b;
  } catch (T) {
    return fn(T);
  } finally {
    e.f ^= Mr, re = t, fe = r, me = s, O = a, Oe = n, dt(i), xe = o, Ze = l;
  }
}
function Vs(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var s = Gn.call(r, e);
    if (s !== -1) {
      var a = r.length - 1;
      a === 0 ? r = t.reactions = null : (r[s] = r[a], r.pop());
    }
  }
  r === null && (t.f & K) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (re === null || !re.includes(t)) && (ee(t, Te), (t.f & ke) !== 0 && (t.f ^= ke, t.f &= ~Qe), hn(
    /** @type {Derived} **/
    t
  ), er(
    /** @type {Derived} **/
    t,
    0
  ));
}
function er(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var s = t; s < r.length; s++)
      Vs(e, r[s]);
}
function Ht(e) {
  var t = e.f;
  if ((t & ze) === 0) {
    ee(e, Z);
    var r = z, s = We;
    z = e, We = !0;
    try {
      (t & (Ye | ts)) !== 0 ? Js(e) : Dn(e), En(e);
      var a = On(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = In;
      var n;
    } finally {
      We = s, z = r;
    }
  }
}
async function Yn() {
  await Promise.resolve(), Es();
}
function u(e) {
  var t = e.f, r = (t & K) !== 0;
  if (O !== null && !xe) {
    var s = z !== null && (z.f & ze) !== 0;
    if (!s && !Oe?.includes(e)) {
      var a = O.deps;
      if ((O.f & Mr) !== 0)
        e.rv < Yt && (e.rv = Yt, re === null && a !== null && a[fe] === e ? fe++ : re === null ? re = [e] : re.includes(e) || re.push(e));
      else {
        (O.deps ??= []).push(e);
        var n = e.reactions;
        n === null ? e.reactions = [O] : n.includes(O) || n.push(O);
      }
    }
  }
  if (Mt) {
    if (Be.has(e))
      return Be.get(e);
    if (r) {
      var i = (
        /** @type {Derived} */
        e
      ), o = i.v;
      return ((i.f & Z) === 0 && i.reactions !== null || Ln(i)) && (o = Pr(i)), Be.set(i, o), o;
    }
  } else r && (!we?.has(e) || H?.is_fork && !Ot()) && (i = /** @type {Derived} */
  e, qt(i) && _n(i), We && Ot() && (i.f & ke) === 0 && Hn(i));
  if (we?.has(e))
    return we.get(e);
  if ((e.f & Ue) !== 0)
    throw e.v;
  return e.v;
}
function Hn(e) {
  if (e.deps !== null) {
    e.f ^= ke;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & K) !== 0 && (t.f & ke) === 0 && Hn(
        /** @type {Derived} */
        t
      );
  }
}
function Ln(e) {
  if (e.v === W) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Be.has(t) || (t.f & K) !== 0 && Ln(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function zt(e) {
  var t = xe;
  try {
    return xe = !0, e();
  } finally {
    xe = t;
  }
}
const Gs = -7169;
function ee(e, t) {
  e.f = e.f & Gs | t;
}
const Ks = ["touchstart", "touchmove"];
function Ws(e) {
  return Ks.includes(e);
}
const Cn = /* @__PURE__ */ new Set(), Er = /* @__PURE__ */ new Set();
function Zs(e, t, r, s = {}) {
  function a(n) {
    if (s.capture || Tt.call(t, n), !n.cancelBubble)
      return lr(() => r?.call(this, n));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? yt(() => {
    t.addEventListener(e, a, s);
  }) : t.addEventListener(e, a, s), a;
}
function Qs(e, t, r, s, a) {
  var n = { capture: s, passive: a }, i = Zs(e, t, r, n);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Yr(() => {
    t.removeEventListener(e, i, n);
  });
}
function ur(e) {
  for (var t = 0; t < e.length; t++)
    Cn.add(e[t]);
  for (var r of Er)
    r(e);
}
let Vr = null;
function Tt(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], n = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Vr = e;
  var i = 0, o = Vr === e && e.__root;
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
    Kn(e, "currentTarget", {
      configurable: !0,
      get() {
        return n || r;
      }
    });
    var c = O, b = z;
    le(null), Ae(null);
    try {
      for (var _, m = []; n !== null; ) {
        var T = n.assignedSlot || n.parentNode || /** @type {any} */
        n.host || null;
        try {
          var w = n["__" + s];
          w != null && (!/** @type {any} */
          n.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === n) && w.call(n, e);
        } catch (d) {
          _ ? m.push(d) : _ = d;
        }
        if (e.cancelBubble || T === t || T === null)
          break;
        n = T;
      }
      if (_) {
        for (let d of m)
          queueMicrotask(() => {
            throw d;
          });
        throw _;
      }
    } finally {
      e.__root = t, delete e.currentTarget, le(c), Ae(b);
    }
  }
}
function ea(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function tr(e, t) {
  var r = (
    /** @type {Effect} */
    z
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function B(e, t) {
  var r = (t & gs) !== 0, s = (t & bs) !== 0, a, n = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = ea(n ? e : "<!>" + e), r || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ Zt(a)));
    var i = (
      /** @type {TemplateNode} */
      s || gn ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Zt(i)
      ), l = (
        /** @type {TemplateNode} */
        i.lastChild
      );
      tr(o, l);
    } else
      tr(i, i);
    return i;
  };
}
function ta(e = "") {
  {
    var t = Pe(e + "");
    return tr(t, t), t;
  }
}
function rr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), r = Pe();
  return e.append(t, r), tr(t, r), e;
}
function j(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function I(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ??= e.nodeValue) && (e.__t = r, e.nodeValue = r + "");
}
function ra(e, t) {
  return na(e, t);
}
const ot = /* @__PURE__ */ new Map();
function na(e, { target: t, anchor: r, props: s = {}, events: a, context: n, intro: i = !0 }) {
  Ls();
  var o = /* @__PURE__ */ new Set(), l = (b) => {
    for (var _ = 0; _ < b.length; _++) {
      var m = b[_];
      if (!o.has(m)) {
        o.add(m);
        var T = Ws(m);
        t.addEventListener(m, Tt, { passive: T });
        var w = ot.get(m);
        w === void 0 ? (document.addEventListener(m, Tt, { passive: T }), ot.set(m, 1)) : ot.set(m, w + 1);
      }
    }
  };
  l(nr(Cn)), Er.add(l);
  var f = void 0, c = Us(() => {
    var b = r ?? t.appendChild(Pe());
    return As(
      /** @type {TemplateNode} */
      b,
      {
        pending: () => {
        }
      },
      (_) => {
        if (n) {
          bt({});
          var m = (
            /** @type {ComponentContext} */
            de
          );
          m.c = n;
        }
        a && (s.$$events = a), f = e(_, s) || {}, n && wt();
      }
    ), () => {
      for (var _ of o) {
        t.removeEventListener(_, Tt);
        var m = (
          /** @type {number} */
          ot.get(_)
        );
        --m === 0 ? (document.removeEventListener(_, Tt), ot.delete(_)) : ot.set(_, m);
      }
      Er.delete(l), b !== r && b.parentNode?.removeChild(b);
    };
  });
  return sa.set(f, c), f;
}
let sa = /* @__PURE__ */ new WeakMap();
class aa {
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
      H
    );
    if (this.#e.has(t)) {
      var r = (
        /** @type {Key} */
        this.#e.get(t)
      ), s = this.#t.get(r);
      if (s)
        Lr(s), this.#r.delete(r);
      else {
        var a = this.#n.get(r);
        a && (this.#t.set(r, a.effect), this.#n.delete(r), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
      }
      for (const [n, i] of this.#e) {
        if (this.#e.delete(n), n === t)
          break;
        const o = this.#n.get(i);
        o && (oe(o.effect), this.#n.delete(i));
      }
      for (const [n, i] of this.#t) {
        if (n === r || this.#r.has(n)) continue;
        const o = () => {
          if (Array.from(this.#e.values()).includes(n)) {
            var f = document.createDocumentFragment();
            Fn(i, f), f.append(Pe()), this.#n.set(n, { effect: i, fragment: f });
          } else
            oe(i);
          this.#r.delete(n), this.#t.delete(n);
        };
        this.#o || !s ? (this.#r.add(n), Ke(i, o, !1)) : o();
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
      r.includes(s) || (oe(a.effect), this.#n.delete(s));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, r) {
    var s = (
      /** @type {Batch} */
      H
    ), a = yn();
    if (r && !this.#t.has(t) && !this.#n.has(t))
      if (a) {
        var n = document.createDocumentFragment(), i = Pe();
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
function ie(e, t, r = !1) {
  var s = new aa(e), a = r ? vt : 0;
  function n(i, o) {
    s.ensure(i, o);
  }
  Hr(() => {
    var i = !1;
    t((o, l = !0) => {
      i = !0, n(l, o);
    }), i || n(!1, null);
  }, a);
}
function Lt(e, t) {
  return t;
}
function ia(e, t, r) {
  for (var s = [], a = t.length, n, i = t.length, o = 0; o < a; o++) {
    let b = t[o];
    Ke(
      b,
      () => {
        if (n) {
          if (n.pending.delete(b), n.done.add(b), n.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Dr(nr(n.done)), _.delete(n), _.size === 0 && (e.outrogroups = null);
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
      Cs(c), c.append(f), e.items.clear();
    }
    Dr(t, !l);
  } else
    n = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(n);
}
function Dr(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    oe(e[r], t);
}
var Gr;
function Ct(e, t, r, s, a, n = null) {
  var i = e, o = /* @__PURE__ */ new Map(), l = (t & sn) !== 0;
  if (l) {
    var f = (
      /** @type {Element} */
      e
    );
    i = f.appendChild(Pe());
  }
  var c = null, b = /* @__PURE__ */ Rr(() => {
    var E = r();
    return xr(E) ? E : E == null ? [] : nr(E);
  }), _, m = !0;
  function T() {
    d.fallback = c, la(d, _, i, t, s), c !== null && (_.length === 0 ? (c.f & Re) === 0 ? Lr(c) : (c.f ^= Re, At(c, null, i)) : Ke(c, () => {
      c = null;
    }));
  }
  var w = Hr(() => {
    _ = /** @type {V[]} */
    u(b);
    for (var E = _.length, U = /* @__PURE__ */ new Set(), R = (
      /** @type {Batch} */
      H
    ), Y = yn(), A = 0; A < E; A += 1) {
      var C = _[A], J = s(C, A), D = m ? null : o.get(J);
      D ? (D.v && _t(D.v, C), D.i && _t(D.i, A), Y && R.skipped_effects.delete(D.e)) : (D = oa(
        o,
        m ? i : Gr ??= Pe(),
        C,
        J,
        A,
        a,
        t,
        r
      ), m || (D.e.f |= Re), o.set(J, D)), U.add(J);
    }
    if (E === 0 && n && !c && (m ? c = be(() => n(i)) : (c = be(() => n(Gr ??= Pe())), c.f |= Re)), !m)
      if (Y) {
        for (const [q, S] of o)
          U.has(q) || R.skipped_effects.add(S.e);
        R.oncommit(T), R.ondiscard(() => {
        });
      } else
        T();
    u(b);
  }), d = { effect: w, items: o, outrogroups: null, fallback: c };
  m = !1;
}
function la(e, t, r, s, a) {
  var n = (s & ps) !== 0, i = t.length, o = e.items, l = e.effect.first, f, c = null, b, _ = [], m = [], T, w, d, E;
  if (n)
    for (E = 0; E < i; E += 1)
      T = t[E], w = a(T, E), d = /** @type {EachItem} */
      o.get(w).e, (d.f & Re) === 0 && (d.nodes?.a?.measure(), (b ??= /* @__PURE__ */ new Set()).add(d));
  for (E = 0; E < i; E += 1) {
    if (T = t[E], w = a(T, E), d = /** @type {EachItem} */
    o.get(w).e, e.outrogroups !== null)
      for (const S of e.outrogroups)
        S.pending.delete(d), S.done.delete(d);
    if ((d.f & Re) !== 0)
      if (d.f ^= Re, d === l)
        At(d, null, r);
      else {
        var U = c ? c.next : l;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), je(e, c, d), je(e, d, U), At(d, U, r), c = d, _ = [], m = [], l = c.next;
        continue;
      }
    if ((d.f & ce) !== 0 && (Lr(d), n && (d.nodes?.a?.unfix(), (b ??= /* @__PURE__ */ new Set()).delete(d))), d !== l) {
      if (f !== void 0 && f.has(d)) {
        if (_.length < m.length) {
          var R = m[0], Y;
          c = R.prev;
          var A = _[0], C = _[_.length - 1];
          for (Y = 0; Y < _.length; Y += 1)
            At(_[Y], R, r);
          for (Y = 0; Y < m.length; Y += 1)
            f.delete(m[Y]);
          je(e, A.prev, C.next), je(e, c, A), je(e, C, R), l = R, c = C, E -= 1, _ = [], m = [];
        } else
          f.delete(d), At(d, l, r), je(e, d.prev, d.next), je(e, d, c === null ? e.effect.first : c.next), je(e, c, d), c = d;
        continue;
      }
      for (_ = [], m = []; l !== null && l !== d; )
        (f ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = l.next;
      if (l === null)
        continue;
    }
    (d.f & Re) === 0 && _.push(d), c = d, l = d.next;
  }
  if (e.outrogroups !== null) {
    for (const S of e.outrogroups)
      S.pending.size === 0 && (Dr(nr(S.done)), e.outrogroups?.delete(S));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || f !== void 0) {
    var J = [];
    if (f !== void 0)
      for (d of f)
        (d.f & ce) === 0 && J.push(d);
    for (; l !== null; )
      (l.f & ce) === 0 && l !== e.fallback && J.push(l), l = l.next;
    var D = J.length;
    if (D > 0) {
      var q = (s & sn) !== 0 && i === 0 ? r : null;
      if (n) {
        for (E = 0; E < D; E += 1)
          J[E].nodes?.a?.measure();
        for (E = 0; E < D; E += 1)
          J[E].nodes?.a?.fix();
      }
      ia(e, J, q);
    }
  }
  n && yt(() => {
    if (b !== void 0)
      for (d of b)
        d.nodes?.a?.apply();
  });
}
function oa(e, t, r, s, a, n, i, o) {
  var l = (i & hs) !== 0 ? (i & ms) === 0 ? /* @__PURE__ */ Os(r, !1, !1) : tt(r) : null, f = (i & _s) !== 0 ? tt(a) : null;
  return {
    v: l,
    i: f,
    e: be(() => (n(t, l ?? r, f ?? a, o), () => {
      e.delete(s);
    }))
  };
}
function At(e, t, r) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, n = t && (t.f & Re) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; s !== null; ) {
      var i = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ jt(s)
      );
      if (n.before(s), s === a)
        return;
      s = i;
    }
}
function je(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
const Kr = [...` 	
\r\f \v\uFEFF`];
function ua(e, t, r) {
  var s = e == null ? "" : "" + e;
  if (t && (s = s ? s + " " + t : t), r) {
    for (var a in r)
      if (r[a])
        s = s ? s + " " + a : a;
      else if (s.length)
        for (var n = a.length, i = 0; (i = s.indexOf(a, i)) >= 0; ) {
          var o = i + n;
          (i === 0 || Kr.includes(s[i - 1])) && (o === s.length || Kr.includes(s[o])) ? s = (i === 0 ? "" : s.substring(0, i)) + s.substring(o + 1) : i = o;
        }
  }
  return s === "" ? null : s;
}
function qe(e, t, r, s, a, n) {
  var i = e.__className;
  if (i !== r || i === void 0) {
    var o = ua(r, s, n);
    o == null ? e.removeAttribute("class") : e.className = o, e.__className = r;
  } else if (n && a !== n)
    for (var l in n) {
      var f = !!n[l];
      (a == null || f !== !!a[l]) && e.classList.toggle(l, f);
    }
  return n;
}
function jn(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!xr(t))
      return ys();
    for (var s of e.options)
      s.selected = t.includes(Pt(s));
    return;
  }
  for (s of e.options) {
    var a = Pt(s);
    if (Hs(a, t)) {
      s.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function fa(e) {
  var t = new MutationObserver(() => {
    jn(e, e.__value);
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
  }), Yr(() => {
    t.disconnect();
  });
}
function ca(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet(), a = !0;
  Or(e, "change", (n) => {
    var i = n ? "[selected]" : ":checked", o;
    if (e.multiple)
      o = [].map.call(e.querySelectorAll(i), Pt);
    else {
      var l = e.querySelector(i) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      o = l && Pt(l);
    }
    r(o), H !== null && s.add(H);
  }), kn(() => {
    var n = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        Nt ?? H
      );
      if (s.has(i))
        return;
    }
    if (jn(e, n, a), a && n === void 0) {
      var o = e.querySelector(":checked");
      o !== null && (n = Pt(o), r(n));
    }
    e.__value = n, a = !1;
  }), fa(e);
}
function Pt(e) {
  return "__value" in e ? e.__value : e.value;
}
const va = /* @__PURE__ */ Symbol("is custom element"), da = /* @__PURE__ */ Symbol("is html");
function mt(e, t, r, s) {
  var a = ha(e);
  a[t] !== (a[t] = r) && (t === "loading" && (e[ns] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && _a(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function ha(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [va]: e.nodeName.includes("-"),
      [da]: e.namespaceURI === ws
    }
  );
}
var Wr = /* @__PURE__ */ new Map();
function _a(e) {
  var t = e.getAttribute("is") || e.nodeName, r = Wr.get(t);
  if (r) return r;
  Wr.set(t, r = []);
  for (var s, a = e, n = Element.prototype; n !== a; ) {
    s = Wn(a);
    for (var i in s)
      s[i].set && r.push(i);
    a = en(a);
  }
  return r;
}
function Kt(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet();
  Or(e, "input", async (a) => {
    var n = a ? e.defaultValue : e.value;
    if (n = mr(e) ? gr(n) : n, r(n), H !== null && s.add(H), await Yn(), n !== (n = t())) {
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
  zt(t) == null && e.value && (r(mr(e) ? gr(e.value) : e.value), H !== null && s.add(H)), or(() => {
    var a = t();
    if (e === document.activeElement) {
      var n = (
        /** @type {Batch} */
        Nt ?? H
      );
      if (s.has(n))
        return;
    }
    mr(e) && a === gr(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
function pa(e, t, r = t) {
  Or(e, "change", (s) => {
    var a = s ? e.defaultChecked : e.checked;
    r(a);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  // If defaultChecked is set, then checked == defaultChecked
  zt(t) == null && r(e.checked), or(() => {
    var s = t();
    e.checked = !!s;
  });
}
function mr(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function gr(e) {
  return e === "" ? null : +e;
}
function Zr(e, t) {
  return e === t || e?.[ct] === t;
}
function xt(e = {}, t, r, s) {
  return kn(() => {
    var a, n;
    return or(() => {
      a = n, n = [], zt(() => {
        e !== r(...n) && (t(e, ...n), a && Zr(r(...a), e) && t(null, ...a));
      });
    }), () => {
      yt(() => {
        n && Zr(r(...n), e) && t(null, ...n);
      });
    };
  }), e;
}
function ma(e, t, r, s) {
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
function Ut(e) {
  de === null && ss(), Mn(() => {
    const t = zt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const ga = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(ga);
function ba(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var br = { exports: {} }, Qr;
function wa() {
  return Qr || (Qr = 1, (function(e) {
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
      function a(w, d, E) {
        var U = w || r, R = d || 0, Y = E || !1, A = 0, C;
        function J(S, g) {
          var M;
          if (g) {
            if (M = g.getTime(), Y) {
              var y = c(g);
              if (g = new Date(M + y + R), c(g) !== y) {
                var h = c(g);
                g = new Date(M + h + R);
              }
            }
          } else {
            var P = Date.now();
            P > A ? (A = P, C = new Date(A), M = A, Y && (C = new Date(A + c(C) + R))) : M = A, g = C;
          }
          return D(S, g, U, M);
        }
        function D(S, g, M, P) {
          for (var y = "", h = null, k = !1, N = S.length, X = !1, V = 0; V < N; V++) {
            var te = S.charCodeAt(V);
            if (k === !0) {
              if (te === 45) {
                h = "";
                continue;
              } else if (te === 95) {
                h = " ";
                continue;
              } else if (te === 48) {
                h = "0";
                continue;
              } else if (te === 58) {
                X && T("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), X = !0;
                continue;
              }
              switch (te) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  y += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  y += M.days[g.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  y += M.months[g.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  y += n(Math.floor(g.getFullYear() / 100), h);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  y += D(M.formats.D, g, M, P);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  y += D(M.formats.F, g, M, P);
                  break;
                // '00'
                // case 'H':
                case 72:
                  y += n(g.getHours(), h);
                  break;
                // '12'
                // case 'I':
                case 73:
                  y += n(o(g.getHours()), h);
                  break;
                // '000'
                // case 'L':
                case 76:
                  y += i(Math.floor(P % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  y += n(g.getMinutes(), h);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  y += g.getHours() < 12 ? M.am : M.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  y += D(M.formats.R, g, M, P);
                  break;
                // '00'
                // case 'S':
                case 83:
                  y += n(g.getSeconds(), h);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  y += D(M.formats.T, g, M, P);
                  break;
                // '00'
                // case 'U':
                case 85:
                  y += n(l(g, "sunday"), h);
                  break;
                // '00'
                // case 'W':
                case 87:
                  y += n(l(g, "monday"), h);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  y += D(M.formats.X, g, M, P);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  y += g.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (Y && R === 0)
                    y += "GMT";
                  else {
                    var ue = b(g);
                    y += ue || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  y += M.shortDays[g.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  y += M.shortMonths[g.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  y += D(M.formats.c, g, M, P);
                  break;
                // '01'
                // case 'd':
                case 100:
                  y += n(g.getDate(), h);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  y += n(g.getDate(), h ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  y += M.shortMonths[g.getMonth()];
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
                  y += n(g.getHours(), h ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  y += n(o(g.getHours()), h ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  y += n(g.getMonth() + 1, h);
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
                  M.ordinalSuffixes ? y += String(G) + (M.ordinalSuffixes[G - 1] || f(G)) : y += String(G) + f(G);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  y += g.getHours() < 12 ? M.AM : M.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  y += D(M.formats.r, g, M, P);
                  break;
                // '0'
                // case 's':
                case 115:
                  y += Math.floor(P / 1e3);
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
                  y += D(M.formats.v, g, M, P);
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
                  y += D(M.formats.x, g, M, P);
                  break;
                // '70'
                // case 'y':
                case 121:
                  y += n(g.getFullYear() % 100, h);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (Y && R === 0)
                    y += X ? "+00:00" : "+0000";
                  else {
                    var ne;
                    R !== 0 ? ne = R / (60 * 1e3) : ne = -g.getTimezoneOffset();
                    var Me = ne < 0 ? "-" : "+", _e = X ? ":" : "", Fe = Math.floor(Math.abs(ne / 60)), pe = Math.abs(ne % 60);
                    y += Me + n(Fe) + _e + n(pe);
                  }
                  break;
                default:
                  k && (y += "%"), y += S[V];
                  break;
              }
              h = null, k = !1;
              continue;
            }
            if (te === 37) {
              k = !0;
              continue;
            }
            y += S[V];
          }
          return y;
        }
        var q = J;
        return q.localize = function(S) {
          return new a(S || U, R, Y);
        }, q.localizeByIdentifier = function(S) {
          var g = t[S];
          return g ? q.localize(g) : (T('[WARNING] No locale found with identifier "' + S + '".'), q);
        }, q.timezone = function(S) {
          var g = R, M = Y, P = typeof S;
          if (P === "number" || P === "string")
            if (M = !0, P === "string") {
              var y = S[0] === "-" ? -1 : 1, h = parseInt(S.slice(1, 3), 10), k = parseInt(S.slice(3, 5), 10);
              g = y * (60 * h + k) * 60 * 1e3;
            } else P === "number" && (g = S * 60 * 1e3);
          return new a(U, g, M);
        }, q.utc = function() {
          return new a(U, R, !0);
        }, q;
      }
      function n(w, d) {
        return d === "" || w > 9 ? "" + w : (d == null && (d = "0"), d + w);
      }
      function i(w) {
        return w > 99 ? w : w > 9 ? "0" + w : "00" + w;
      }
      function o(w) {
        return w === 0 ? 12 : w > 12 ? w - 12 : w;
      }
      function l(w, d) {
        d = d || "sunday";
        var E = w.getDay();
        d === "monday" && (E === 0 ? E = 6 : E--);
        var U = Date.UTC(w.getFullYear(), 0, 1), R = Date.UTC(w.getFullYear(), w.getMonth(), w.getDate()), Y = Math.floor((R - U) / 864e5), A = (Y + 7 - E) / 7;
        return Math.floor(A);
      }
      function f(w) {
        var d = w % 10, E = w % 100;
        if (E >= 11 && E <= 13 || d === 0 || d >= 4)
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
      function c(w) {
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
  })(br)), br.exports;
}
var ya = wa();
const ft = /* @__PURE__ */ ba(ya);
let wr = /* @__PURE__ */ L(!1);
class Ma {
  constructor(t) {
    if (this.sk = "", this.fetchFn = t || (typeof window < "u" ? fetch.bind(window) : fetch), typeof document < "u") {
      const r = document.querySelector('meta[name="csrf-token"]');
      r && (this.sk = r.content);
    }
  }
  get loading() {
    return u(wr);
  }
  async request(t, r = {}) {
    x(wr, !0);
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
      x(wr, !1);
    }
  }
  get(t, r) {
    return this.request(t, { method: "GET", params: r });
  }
  post(t, r) {
    return this.request(t, { method: "POST", body: r });
  }
}
const ae = new Ma(), Sa = (e, t = sr) => {
  var r = ka(), s = v(r);
  Q(() => {
    qe(r, 1, `status status-${t() ?? ""}`, "svelte-13s7gu4"), I(s, t());
  }), j(e, r);
};
var ka = /* @__PURE__ */ B("<span> </span>"), Ea = /* @__PURE__ */ B('<time class="svelte-13s7gu4"> </time>'), Da = /* @__PURE__ */ B('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), xa = /* @__PURE__ */ B('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), Ta = /* @__PURE__ */ B('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Aa = /* @__PURE__ */ B('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), Fa = /* @__PURE__ */ B('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4">エントリ一覧</h2> <div class="search-box svelte-13s7gu4"><input type="text" placeholder="検索..." class="svelte-13s7gu4"/> <button class="svelte-13s7gu4">検索</button></div> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">新しい方へ</button> <button class="svelte-13s7gu4">古い方へ</button></div></div> <div><!></div></div>');
function Na(e, t) {
  bt(t, !0);
  const r = (S, g = sr, M) => {
    let P = /* @__PURE__ */ Rr(() => rn(M?.(), !0));
    var y = Ea(), h = v(y);
    Q(
      (k) => {
        mt(y, "datetime", g()), I(h, k);
      },
      [() => u(P) && g() ? _(g()) : "-"]
    ), j(S, y);
  };
  let s = /* @__PURE__ */ L(ye([])), a = /* @__PURE__ */ L(!1), n = 50, i = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(ye([]));
  async function l() {
    try {
      const S = u(o)[u(o).length - 1], g = { limit: n };
      u(i) && (g.q = u(i)), S && (g.cursor_id = S);
      const M = await ae.get("/admin/api/entries", g);
      x(s, M.entries || [], !0), x(a, M.has_more || !1, !0);
    } catch (S) {
      console.error(S);
    }
  }
  function f() {
    x(o, [], !0), l();
  }
  Ut(l);
  function c() {
    if (u(a) && u(s).length > 0) {
      const S = u(s)[u(s).length - 1];
      u(o).push(S.id), l();
    }
  }
  function b() {
    u(o).length > 0 && (u(o).pop(), l());
  }
  function _(S) {
    return S ? ft("%Y-%m-%d %H:%M", new Date(S)) : "-";
  }
  var m = Fa(), T = v(m), w = p(v(T), 2), d = v(w);
  d.__keydown = (S) => S.key === "Enter" && f();
  var E = p(d, 2);
  E.__click = f;
  var U = p(w, 2), R = v(U);
  R.__click = b;
  var Y = p(R, 2);
  Y.__click = c;
  var A = p(T, 2);
  let C;
  var J = v(A);
  {
    var D = (S) => {
      var g = Da();
      j(S, g);
    }, q = (S) => {
      var g = Aa(), M = pt(g), P = p(v(M));
      Ct(P, 21, () => u(s), Lt, (k, N) => {
        var X = xa(), V = v(X), te = v(V), ue = p(V), he = v(ue), G = p(ue), ne = v(G);
        Sa(ne, () => u(N).status);
        var Me = p(G), _e = v(Me), Fe = v(_e), pe = p(_e, 2), Ee = v(pe), Je = v(Ee), Xe = p(Me), $e = v(Xe), nt = p(Xe), St = v(nt);
        r(St, () => u(N).created_at);
        var st = p(nt), Ne = v(st);
        r(Ne, () => u(N).modified_at);
        var at = p(st), kt = v(at);
        r(kt, () => u(N).publish_at?.Time, () => u(N).publish_at?.Valid);
        var it = p(at), Ve = v(it);
        Ve.__click = () => t.onEdit(u(N).id), Q(() => {
          I(te, u(N).id), I(he, u(N).date), I(Fe, u(N).title), mt(Ee, "href", `/${u(N).path ?? ""}`), I(Je, `/${u(N).path ?? ""}`), I($e, u(N).format);
        }), j(k, X);
      });
      var y = p(M, 2);
      {
        var h = (k) => {
          var N = Ta();
          j(k, N);
        };
        ie(y, (k) => {
          ae.loading && k(h);
        });
      }
      j(S, g);
    };
    ie(J, (S) => {
      ae.loading && u(s).length === 0 ? S(D) : S(q, !1);
    });
  }
  Q(() => {
    R.disabled = u(o).length === 0 || ae.loading, Y.disabled = !u(a) || ae.loading, C = qe(A, 1, "table-container svelte-13s7gu4", null, C, { "is-loading": ae.loading });
  }), Kt(d, () => u(i), (S) => x(i, S)), j(e, m), wt();
}
ur(["keydown", "click"]);
class Ia {
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
    this.storage = t, this.timer = null, this.#e = /* @__PURE__ */ L(!1), this.#t = /* @__PURE__ */ L(null);
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
var Ra = /* @__PURE__ */ B('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), Pa = /* @__PURE__ */ B('<option class="svelte-7nstam"> </option>'), Oa = /* @__PURE__ */ B('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), Ya = /* @__PURE__ */ B('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), Ha = /* @__PURE__ */ B('<button id="restore" type="button" class="submit-button svelte-7nstam">復元...</button>'), La = /* @__PURE__ */ B('<div role="option" tabindex="-1"> </div>'), Ca = /* @__PURE__ */ B('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam"> </button> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons svelte-7nstam"><div class="options svelte-7nstam"><label title="チェックを入れると指定した日時に公開されます（公開済みの記事も予約に戻せます）" class="svelte-7nstam"><input type="checkbox" class="svelte-7nstam"/> 公開を遅延</label> <!></div> <button type="button" class="submit-button svelte-7nstam"> </button> <!></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam" role="listbox" aria-label="タグを選択" tabindex="0"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog>', 1);
function ja(e, t) {
  bt(t, !0);
  let r = ma(t, "id", 3, null);
  const s = new Ia();
  let a = /* @__PURE__ */ L(ye({ id: null, title: "", body: "", status: null })), n = ye({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: "public",
    publishLater: !1,
    publishAt: ""
  }), i = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(!1), f = /* @__PURE__ */ L(null), c = /* @__PURE__ */ L(null), b = /* @__PURE__ */ L(null), _ = /* @__PURE__ */ L(null), m = /* @__PURE__ */ L(null);
  const T = [
    "tech",
    "photo",
    "redeveloped",
    "stablediffusion",
    "photoshopped"
  ];
  let w = /* @__PURE__ */ L(0);
  async function d(h) {
    try {
      const k = await ae.get(`/admin/api/entry/${h}`);
      x(a, k, !0), n.id = k.id, n.title = k.title, n.body = k.body, n.format = k.format || "Hatena", n.status = k.status, n.publishLater = k.status === "scheduled", k.publish_at?.Valid ? n.publishAt = ft("%Y-%m-%dT%H:%M", new Date(k.publish_at.Time)) : n.publishAt = ft("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), s.check(u(a).id, { title: n.title, body: n.body });
    } catch (k) {
      console.error(k), alert("エントリの取得に失敗しました");
    }
  }
  Ut(() => {
    r() ? d(r()) : (x(a, { id: null, title: "", body: "", status: "public" }, !0), n.id = null, n.title = "", n.body = "", n.format = "Hatena", n.status = "public", n.publishLater = !1, n.publishAt = ft("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), s.check(null, { title: n.title, body: n.body }));
  }), Mn(() => {
    (u(a).title !== n.title || u(a).body !== n.body) && s.saveDebounced(u(a).id, { title: n.title, body: n.body });
  });
  async function E() {
    x(i, !0), x(o, "リクエスト中");
    const h = new FormData();
    if (h.set("id", n.id ? String(n.id) : ""), h.set("title", n.title), h.set("body", n.body), h.set("format", n.format), n.publishLater) {
      const k = new Date(n.publishAt);
      h.set("publish_at", k.toISOString()), h.set("status", "scheduled");
    } else
      h.set("status", "public");
    try {
      const N = (await ae.post("/admin/api/edit", h)).session_id;
      if (!N)
        throw new Error("保存に失敗しました");
      U(N);
    } catch (k) {
      x(i, !1), alert(k instanceof Error ? k.message : "エラーが発生しました");
    }
  }
  function U(h) {
    const k = new EventSource(`/admin/api/edit/progress?sid=${h}`);
    k.onmessage = (N) => {
      const X = JSON.parse(N.data);
      switch (X.type) {
        case "progress":
          x(o, R(X.message), !0);
          break;
        case "done":
          s.clear(u(a).id), x(o, "完了"), x(i, !1), k.close(), t.onSave(X.location);
          break;
        case "error":
          x(o, "エラー: " + X.message), x(i, !1), k.close(), alert("保存に失敗しました: " + X.message);
          break;
      }
    }, k.onerror = () => {
      x(i, !1), k.close(), alert("通信エラーが発生しました");
    };
  }
  function R(h) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[h] || h;
  }
  function Y() {
    x(w, 0), u(b).showModal(), setTimeout(() => u(m)?.focus(), 0);
  }
  function A(h) {
    h.key === "ArrowDown" ? (h.preventDefault(), x(w, (u(w) + 1) % T.length)) : h.key === "ArrowUp" ? (h.preventDefault(), x(w, (u(w) - 1 + T.length) % T.length)) : h.key === "Enter" || h.key === " " ? (h.preventDefault(), C(T[u(w)])) : h.key === "Escape" && u(b).close();
  }
  function C(h) {
    const k = `[${h}]`;
    n.title.includes(k) ? n.title = n.title.replace(k, "") : n.title = k + n.title, u(b).close(), u(f).focus();
  }
  function J() {
    s.data && (n.title = s.data.title, n.body = s.data.body, s.clear(u(a).id), u(_).close());
  }
  async function D() {
    const h = document.createElement("input");
    h.type = "file", h.oninput = async () => {
      if (!h.files?.[0]) return;
      const k = new FormData();
      k.append("file", h.files[0]), x(l, !0);
      try {
        const N = await ae.post("/admin/api/upload/image", k), X = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${N.uploaded}" class="picasa" itemprop="url"><img src="${N.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        q(X, !0);
      } catch {
        alert("アップロードに失敗しました");
      } finally {
        x(l, !1);
      }
    }, h.click();
  }
  function q(h, k = !1) {
    const N = u(c).selectionStart, X = u(c).selectionEnd, V = u(c).value;
    n.body = V.substring(0, N) + h + V.substring(X), Yn().then(() => {
      typeof k == "boolean" && k ? (u(c).selectionStart = N, u(c).selectionEnd = N + h.length) : typeof k == "number" ? u(c).selectionStart = u(c).selectionEnd = N + k : u(c).selectionStart = u(c).selectionEnd = N + h.length, u(c).focus();
    });
  }
  function S(h) {
    (h.altKey ? "Alt-" : "") + (h.ctrlKey ? "Control-" : "") + (h.metaKey ? "Meta-" : "") + (h.shiftKey ? "Shift-" : "") + h.key === "Control-t" && (q("\\(  \\)", 3), h.preventDefault(), h.stopPropagation());
  }
  var g = rr(), M = pt(g);
  {
    var P = (h) => {
      var k = Ra();
      j(h, k);
    }, y = (h) => {
      var k = Ca(), N = pt(k), X = v(N), V = v(X);
      xt(V, (F) => x(f, F), () => u(f));
      var te = p(V, 2), ue = v(te);
      ue.__click = Y;
      var he = p(ue, 2);
      he.__click = D;
      var G = v(he), ne = p(he, 2);
      Ct(ne, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], Lt, (F, $) => {
        var se = Pa(), Se = v(se), Ce = {};
        Q(() => {
          I(Se, $), Ce !== (Ce = $) && (se.value = (se.__value = $) ?? "");
        }), j(F, se);
      });
      var Me = p(te, 2), _e = v(Me);
      _e.__keydown = S, xt(_e, (F) => x(c, F), () => u(c));
      var Fe = p(X, 2), pe = v(Fe);
      {
        var Ee = (F) => {
          var $ = Oa();
          j(F, $);
        };
        ie(pe, (F) => {
          u(i) && F(Ee);
        });
      }
      var Je = p(pe, 2), Xe = v(Je), $e = v(Xe), nt = v($e), St = p($e, 2);
      {
        var st = (F) => {
          var $ = Ya();
          Kt($, () => n.publishAt, (se) => n.publishAt = se), j(F, $);
        };
        ie(St, (F) => {
          n.publishLater && F(st);
        });
      }
      var Ne = p(Xe, 2);
      Ne.__click = E;
      var at = v(Ne), kt = p(Ne, 2);
      {
        var it = (F) => {
          var $ = Ha();
          $.__click = () => u(_).showModal(), j(F, $);
        };
        ie(kt, (F) => {
          s.exists && F(it);
        });
      }
      var Ve = p(N, 2), lt = p(v(Ve), 2);
      lt.__keydown = A, Ct(lt, 21, () => T, Lt, (F, $, se) => {
        var Se = La();
        let Ce;
        Se.__click = () => C(u($)), Se.__keydown = (hr) => hr.key === "Enter" && C(u($));
        var dr = v(Se);
        Q(() => {
          Ce = qe(Se, 1, "tag-item svelte-7nstam", null, Ce, { selected: u(w) === se }), mt(Se, "aria-selected", u(w) === se), I(dr, u($));
        }), Qs("mouseenter", Se, () => x(w, se, !0)), j(F, Se);
      }), xt(lt, (F) => x(m, F), () => u(m));
      var Bt = p(lt, 2);
      Bt.__click = () => u(b).close(), xt(Ve, (F) => x(b, F), () => u(b));
      var Jt = p(Ve, 2), Xt = p(v(Jt), 2), $t = v(Xt);
      {
        var fr = (F) => {
          var $ = ta();
          Q((se) => I($, se), [() => ft("%Y年%m月%d日%H時", new Date(s.data.time))]), j(F, $);
        };
        ie($t, (F) => {
          s.data?.time && F(fr);
        });
      }
      var cr = p(Xt, 2), Et = v(cr);
      Et.__click = () => u(_).close();
      var vr = p(Et, 2);
      vr.__click = J, xt(Jt, (F) => x(_, F), () => u(_)), Q(() => {
        he.disabled = u(l), I(G, u(l) ? "⌛ アップロード中..." : "📷 写真"), Ne.disabled = u(i), I(at, u(i) ? u(o) || "リクエスト中" : r() ? "更新" : "作成");
      }), Kt(V, () => n.title, (F) => n.title = F), ca(ne, () => n.format, (F) => n.format = F), Kt(_e, () => n.body, (F) => n.body = F), pa(nt, () => n.publishLater, (F) => n.publishLater = F), j(h, k);
    };
    ie(M, (h) => {
      ae.loading && !u(a).id ? h(P) : h(y, !1);
    });
  }
  j(e, g), wt();
}
ur(["click", "keydown"]);
const qa = (e, t = sr) => {
  var r = za(), s = v(r);
  Q(() => {
    qe(r, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), I(s, t());
  }), j(e, r);
};
var za = /* @__PURE__ */ B("<span> </span>"), Ua = /* @__PURE__ */ B('<time class="time svelte-1r6codn"> </time>'), Ba = /* @__PURE__ */ B('<div class="loading svelte-1r6codn"></div>'), Ja = /* @__PURE__ */ B('<div class="error-text svelte-1r6codn"> </div>'), Xa = /* @__PURE__ */ B('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><!></td><td class="error svelte-1r6codn"><!></td></tr>'), $a = /* @__PURE__ */ B('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), Va = /* @__PURE__ */ B('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">新しい方へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">古い方へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function Ga(e, t) {
  bt(t, !0);
  const r = (D, q = sr, S) => {
    let g = /* @__PURE__ */ Rr(() => rn(S?.(), !0));
    var M = Ua(), P = v(M);
    Q(
      (y) => {
        mt(M, "datetime", q()), I(P, y);
      },
      [() => u(g) && q() ? c(q()) : "-"]
    ), j(D, M);
  };
  let s = /* @__PURE__ */ L(ye([])), a = /* @__PURE__ */ L(0), n = /* @__PURE__ */ L(0), i = 50;
  async function o() {
    try {
      const D = await ae.get("/admin/api/jobs", { limit: i, offset: u(n) });
      x(s, D.jobs || [], !0), x(a, D.total || 0, !0);
    } catch (D) {
      console.error(D);
    }
  }
  Ut(o);
  function l() {
    u(n) + i < u(a) && (x(n, u(n) + i), o());
  }
  function f() {
    u(n) - i >= 0 && (x(n, u(n) - i), o());
  }
  function c(D) {
    return ft("%Y-%m-%d %H:%M:%S", new Date(D));
  }
  var b = Va(), _ = v(b), m = v(_), T = v(m), w = p(m, 2), d = v(w);
  d.__click = f;
  var E = p(d, 2), U = v(E), R = p(E, 2);
  R.__click = l;
  var Y = p(R, 2);
  Y.__click = o;
  var A = p(_, 2);
  {
    var C = (D) => {
      var q = Ba();
      j(D, q);
    }, J = (D) => {
      var q = $a(), S = p(v(q));
      Ct(S, 21, () => u(s), Lt, (g, M) => {
        var P = Xa(), y = v(P), h = v(y), k = p(y), N = v(k), X = v(N), V = p(k), te = v(V);
        qa(te, () => u(M).status);
        var ue = p(V), he = v(ue), G = p(ue), ne = v(G);
        r(ne, () => u(M).created_at);
        var Me = p(G), _e = v(Me);
        {
          var Fe = (pe) => {
            var Ee = Ja(), Je = v(Ee);
            Q(() => {
              mt(Ee, "title", u(M).error_message.String), I(Je, u(M).error_message.String);
            }), j(pe, Ee);
          };
          ie(_e, (pe) => {
            u(M).error_message?.Valid && pe(Fe);
          });
        }
        Q(() => {
          I(h, u(M).id), I(X, u(M).job_type_name), I(he, u(M).retry_count);
        }), j(g, P);
      }), j(D, q);
    };
    ie(A, (D) => {
      ae.loading && u(s).length === 0 ? D(C) : D(J, !1);
    });
  }
  Q(
    (D) => {
      I(T, `ジョブ一覧 (${u(a) ?? ""})`), d.disabled = u(n) === 0 || ae.loading, I(U, `${u(n) + 1} - ${D ?? ""} / ${u(a) ?? ""}`), R.disabled = u(n) + i >= u(a) || ae.loading;
    },
    [() => Math.min(u(n) + i, u(a))]
  ), j(e, b), wt();
}
ur(["click"]);
var Ka = /* @__PURE__ */ B('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), Wa = /* @__PURE__ */ B('<span class="term-badge svelte-6rw159"> </span>'), Za = /* @__PURE__ */ B('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">TF-IDF 統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総語彙数 (Terms)</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">インデックス済みエントリ</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">関連エントリ計算済み</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">総関連ペア数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">平均類似度スコア</th><td class="svelte-6rw159"> </td></tr></tbody></table></div> <div style="margin-top: 10px;" class="svelte-6rw159"><h4 class="svelte-6rw159">頻出単語 (Top 20 DF)</h4> <div class="top-terms svelte-6rw159"></div></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), Qa = /* @__PURE__ */ B('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function ei(e, t) {
  bt(t, !0);
  let r = /* @__PURE__ */ L(null), s = /* @__PURE__ */ L(!0);
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
  Ut(a);
  function n(c) {
    if (c === 0) return "0 B";
    const b = 1024, _ = ["B", "KB", "MB", "GB", "TB"], m = Math.floor(Math.log(c) / Math.log(b));
    return parseFloat((c / Math.pow(b, m)).toFixed(2)) + " " + _[m];
  }
  var i = Qa(), o = p(v(i), 2);
  {
    var l = (c) => {
      var b = Ka();
      j(c, b);
    }, f = (c) => {
      var b = rr(), _ = pt(b);
      {
        var m = (T) => {
          var w = Za(), d = v(w), E = p(v(d), 2), U = v(E), R = v(U), Y = v(R), A = p(v(Y)), C = v(A), J = p(Y), D = p(v(J)), q = v(D), S = p(J), g = p(v(S)), M = v(g), P = p(S), y = p(v(P)), h = v(y), k = p(P), N = p(v(k)), X = v(N), V = p(E, 2), te = p(v(V), 2);
          Ct(te, 21, () => u(r).tfidf_stats.top_terms, Lt, (_r, Vt) => {
            var Dt = Wa(), pr = v(Dt);
            Q(() => {
              mt(Dt, "title", `DF: ${u(Vt).df ?? ""}`), I(pr, u(Vt).term);
            }), j(_r, Dt);
          });
          var ue = p(d, 2), he = p(v(ue), 2), G = v(he), ne = v(G), Me = v(ne), _e = p(v(Me)), Fe = v(_e), pe = p(Me), Ee = p(v(pe)), Je = v(Ee), Xe = v(Je), $e = p(ue, 2), nt = p(v($e), 2), St = v(nt), st = v(St), Ne = v(st), at = p(v(Ne)), kt = v(at), it = p(Ne), Ve = p(v(it)), lt = v(Ve), Bt = p(it), Jt = p(v(Bt)), Xt = v(Jt), $t = p(Bt), fr = p(v($t)), cr = v(fr), Et = p($t), vr = p(v(Et)), F = v(vr), $ = p(Et), se = p(v($)), Se = v(se), Ce = p($), dr = p(v(Ce)), hr = v(dr), qn = p(Ce), zn = p(v(qn)), Un = v(zn), Bn = p($e, 2), Jn = p(v(Bn), 2), Xn = v(Jn);
          Q(
            (_r, Vt, Dt, pr, $n, Vn) => {
              I(C, u(r).tfidf_stats.total_terms), I(q, u(r).tfidf_stats.indexed_entries), I(M, u(r).tfidf_stats.entries_with_related), I(h, u(r).tfidf_stats.total_related_pairs), I(X, _r), I(Fe, u(r).is_development), I(Xe, u(r).app_hash), I(kt, u(r).debug_info.go_version), I(lt, u(r).debug_info.num_goroutine), I(Xt, Vt), I(cr, u(r).debug_info.uptime), I(F, Dt), I(Se, pr), I(hr, $n), I(Un, u(r).debug_info.num_gc), I(Xn, Vn);
            },
            [
              () => u(r).tfidf_stats.avg_score.toFixed(4),
              () => new Date(u(r).debug_info.start_time).toLocaleString(),
              () => n(u(r).debug_info.mem_alloc),
              () => n(u(r).debug_info.mem_total_alloc),
              () => n(u(r).debug_info.mem_sys),
              () => JSON.stringify(u(r).config, null, 2)
            ]
          ), j(T, w);
        };
        ie(
          _,
          (T) => {
            u(r) && T(m);
          },
          !0
        );
      }
      j(c, b);
    };
    ie(o, (c) => {
      u(s) ? c(l) : c(f, !1);
    });
  }
  j(e, i), wt();
}
var ti = /* @__PURE__ */ B('<div class="admin-app svelte-1n46o8q"><nav class="sub-nav svelte-1n46o8q"><a href="/admin/">エントリ一覧</a> <a href="/admin/edit">新規作成</a> <a href="/admin/jobs">ジョブ一覧</a> <a href="/admin/info">情報</a></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function ri(e, t) {
  bt(t, !0);
  let r = /* @__PURE__ */ L(ye(window.location.pathname)), s = /* @__PURE__ */ L(ye(new URLSearchParams(window.location.search)));
  Ut(() => {
    const A = () => {
      x(r, window.location.pathname, !0), x(s, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", A), () => window.removeEventListener("popstate", A);
  });
  function a(A, C) {
    C && C.preventDefault(), window.history.pushState({}, "", A), x(r, window.location.pathname, !0), x(s, new URLSearchParams(window.location.search), !0);
  }
  const n = /* @__PURE__ */ zr(() => u(r) === "/admin/edit" ? "edit" : u(r) === "/admin/jobs" ? "jobs" : u(r) === "/admin/info" ? "info" : "list"), i = /* @__PURE__ */ zr(() => u(s).get("id"));
  var o = ti(), l = v(o), f = v(l);
  f.__click = (A) => a("/admin/", A);
  let c;
  var b = p(f, 2);
  b.__click = (A) => a("/admin/edit", A);
  let _;
  var m = p(b, 2);
  m.__click = (A) => a("/admin/jobs", A);
  let T;
  var w = p(m, 2);
  w.__click = (A) => a("/admin/info", A);
  let d;
  var E = p(l, 2), U = v(E);
  {
    var R = (A) => {
      ja(A, {
        get id() {
          return u(i);
        },
        onSave: (C) => window.location.href = C
      });
    }, Y = (A) => {
      var C = rr(), J = pt(C);
      {
        var D = (S) => {
          Ga(S, {});
        }, q = (S) => {
          var g = rr(), M = pt(g);
          {
            var P = (h) => {
              ei(h, {});
            }, y = (h) => {
              Na(h, { onEdit: (k) => a(`/admin/edit?id=${k}`) });
            };
            ie(
              M,
              (h) => {
                u(n) === "info" ? h(P) : h(y, !1);
              },
              !0
            );
          }
          j(S, g);
        };
        ie(
          J,
          (S) => {
            u(n) === "jobs" ? S(D) : S(q, !1);
          },
          !0
        );
      }
      j(A, C);
    };
    ie(U, (A) => {
      u(n) === "edit" ? A(R) : A(Y, !1);
    });
  }
  Q(() => {
    c = qe(f, 1, "svelte-1n46o8q", null, c, { active: u(n) === "list" }), _ = qe(b, 1, "svelte-1n46o8q", null, _, { active: u(n) === "edit" && !u(i) }), T = qe(m, 1, "svelte-1n46o8q", null, T, { active: u(n) === "jobs" }), d = qe(w, 1, "svelte-1n46o8q", null, d, { active: u(n) === "info" });
  }), j(e, o), wt();
}
ur(["click"]);
const yr = document.getElementById("admin-root");
yr && (yr.innerHTML = "", ra(ri, { target: yr }));
//# sourceMappingURL=admin-front.js.map
