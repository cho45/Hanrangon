var gr = Array.isArray, Hn = Array.prototype.indexOf, Wt = Array.from, Ln = Object.defineProperty, xt = Object.getOwnPropertyDescriptor, Cn = Object.getOwnPropertyDescriptors, jn = Object.prototype, qn = Array.prototype, Xr = Object.getPrototypeOf, Nr = Object.isExtensible;
const Zt = () => {
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
const K = 2, br = 4, wr = 8, Un = 1 << 24, He = 16, Le = 32, Qe = 64, Qt = 128, Me = 512, ee = 1024, ve = 2048, xe = 4096, ce = 8192, ze = 16384, yr = 32768, ot = 65536, Rr = 1 << 17, Gr = 1 << 18, dt = 1 << 19, Bn = 1 << 20, Pe = 1 << 25, Ke = 32768, dr = 1 << 21, Mr = 1 << 22, Ue = 1 << 23, lt = /* @__PURE__ */ Symbol("$state"), Jn = /* @__PURE__ */ Symbol(""), at = new class extends Error {
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
const rs = 1, ns = 2, Kr = 4, ss = 8, as = 16, is = 1, ls = 2, Q = /* @__PURE__ */ Symbol(), os = "http://www.w3.org/1999/xhtml";
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
let de = null;
function ut(e) {
  de = e;
}
function ht(e, t = !1, r) {
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
function _t(e) {
  var t = (
    /** @type {ComponentContext} */
    de
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var s of r)
      _n(s);
  }
  return t.i = !0, de = t.p, /** @type {T} */
  {};
}
function Qr() {
  return !0;
}
let Xe = [];
function en() {
  var e = Xe;
  Xe = [], zn(e);
}
function pt(e) {
  if (Xe.length === 0 && !At) {
    var t = Xe;
    queueMicrotask(() => {
      t === Xe && en();
    });
  }
  Xe.push(e);
}
function vs() {
  for (; Xe.length > 0; )
    en();
}
function tn(e) {
  var t = q;
  if (t === null)
    return O.f |= Ue, e;
  if ((t.f & yr) === 0) {
    if ((t.f & Qt) === 0)
      throw e;
    t.b.error(e);
  } else
    ft(e, t);
}
function ft(e, t) {
  for (; t !== null; ) {
    if ((t.f & Qt) !== 0)
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
let H = null, Tt = null, be = null, me = [], er = null, hr = !1, At = !1;
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
    me = [], Tt = null, this.apply();
    var r = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const s of t)
      this.#i(s, r);
    this.is_fork || this.#f(), this.is_deferred() ? (this.#l(r.effects), this.#l(r.render_effects)) : (Tt = this, H = null, Ir(r.render_effects), Ir(r.effects), Tt = null, this.#o?.resolve()), be = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {EffectTarget} target
   */
  #i(t, r) {
    t.f ^= ee;
    for (var s = t.first; s !== null; ) {
      var a = s.f, n = (a & (Le | Qe)) !== 0, i = n && (a & ee) !== 0, o = i || (a & ce) !== 0 || this.skipped_effects.has(s);
      if ((s.f & Qt) !== 0 && s.b?.is_pending() && (r = {
        parent: r,
        effect: s,
        effects: [],
        render_effects: []
      }), !o && s.fn !== null) {
        n ? s.f ^= ee : (a & br) !== 0 ? r.effects.push(s) : Ht(s) && ((s.f & He) !== 0 && this.#a.add(s), Pt(s));
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
      (r.f & ve) !== 0 ? this.#a.add(r) : (r.f & xe) !== 0 && this.#s.add(r), this.#u(r.deps), te(r, ee);
  }
  /**
   * @param {Value[] | null} deps
   */
  #u(t) {
    if (t !== null)
      for (const r of t)
        (r.f & K) === 0 || (r.f & Ke) === 0 || (r.f ^= Ke, this.#u(
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
    this.previous.has(t) || this.previous.set(t, r), (t.f & Ue) === 0 && (this.current.set(t, t.v), be?.set(t, t.v));
  }
  activate() {
    H = this, this.apply();
  }
  deactivate() {
    H === this && (H = null, be = null);
  }
  flush() {
    if (this.activate(), me.length > 0) {
      if (rn(), H !== null && H !== this)
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
      var t = be, r = !0, s = {
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
          var a = me;
          me = [];
          const l = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
          for (const c of i)
            nn(c, o, l, f);
          if (me.length > 0) {
            H = n, n.apply();
            for (const c of me)
              n.#i(c, s);
            n.deactivate();
          }
          me = a;
        }
      }
      H = null, be = t;
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
      this.#s.delete(t), te(t, ve), We(t);
    for (const t of this.#s)
      te(t, xe), We(t);
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
    if (H === null) {
      const t = H = new Ee();
      zt.add(H), At || Ee.enqueue(() => {
        H === t && t.flush();
      });
    }
    return H;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    pt(t);
  }
  apply() {
  }
}
function ds(e) {
  var t = At;
  At = !0;
  try {
    for (var r; ; ) {
      if (vs(), me.length === 0 && (H?.flush(), me.length === 0))
        return er = null, /** @type {T} */
        r;
      rn();
    }
  } finally {
    At = t;
  }
}
function rn() {
  var e = Ve;
  hr = !0;
  var t = null;
  try {
    var r = 0;
    for (Jt(!0); me.length > 0; ) {
      var s = Ee.ensure();
      if (r++ > 1e3) {
        var a, n;
        hs();
      }
      s.process(me), Be.clear();
    }
  } finally {
    hr = !1, Jt(e), er = null;
  }
}
function hs() {
  try {
    Wn();
  } catch (e) {
    ft(e, er);
  }
}
let Ie = null;
function Ir(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var s = e[r++];
      if ((s.f & (ze | ce)) === 0 && Ht(s) && (Ie = /* @__PURE__ */ new Set(), Pt(s), s.deps === null && s.first === null && s.nodes === null && (s.teardown === null && s.ac === null ? bn(s) : s.fn = null), Ie?.size > 0)) {
        Be.clear();
        for (const a of Ie) {
          if ((a.f & (ze | ce)) !== 0) continue;
          const n = [a];
          let i = a.parent;
          for (; i !== null; )
            Ie.has(i) && (Ie.delete(i), n.push(i)), i = i.parent;
          for (let o = n.length - 1; o >= 0; o--) {
            const l = n[o];
            (l.f & (ze | ce)) === 0 && Pt(l);
          }
        }
        Ie.clear();
      }
    }
    Ie = null;
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
      ) : (n & (Mr | He)) !== 0 && (n & ve) === 0 && sn(a, t, s) && (te(a, ve), We(
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
function We(e) {
  for (var t = er = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (hr && t === q && (r & He) !== 0 && (r & Gr) === 0)
      return;
    if ((r & (Qe | Le)) !== 0) {
      if ((r & ee) === 0) return;
      t.f ^= ee;
    }
  }
  me.push(t);
}
function _s(e) {
  let t = 0, r = Ze(0), s;
  return () => {
    Rt() && (u(r), rr(() => (t === 0 && (s = Lt(() => e(() => Ft(r)))), t += 1, () => {
      pt(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, Ft(r));
      });
    })));
  };
}
var ps = ot | dt | Qt;
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
  #b = _s(() => (this.#d = Ze(this.#c), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, s) {
    this.#t = t, this.#r = r, this.#o = s, this.parent = /** @type {Effect} */
    q.b, this.#e = !!this.#r.pending, this.#a = Tr(() => {
      q.b = this;
      {
        var a = this.#m();
        try {
          this.#s = ge(() => s(a));
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
      this.#s = ge(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
    this.#e = !1;
  }
  #y() {
    const t = this.#r.pending;
    t && (this.#i = ge(() => t(this.#t)), Ee.enqueue(() => {
      var r = this.#m();
      this.#s = this.#_(() => (Ee.ensure(), ge(() => this.#o(r)))), this.#v > 0 ? this.#p() : ($e(
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
    return this.#e && (this.#f = Oe(), this.#t.before(this.#f), t = this.#f), t;
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
    var r = q, s = O, a = de;
    Te(this.#a), ie(this.#a), ut(this.#a.ctx);
    try {
      return t();
    } catch (n) {
      return tn(n), null;
    } finally {
      Te(r), ie(s), ut(a);
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
    ), Mn(this.#s, this.#u)), this.#i === null && (this.#i = ge(() => t(this.#t)));
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
    this.#v += t, this.#v === 0 && (this.#e = !1, this.#i && $e(this.#i, () => {
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
    this.#g(t), this.#c += t, this.#d && ct(this.#d, this.#c);
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
      a = !0, n && ts(), Ee.ensure(), this.#c = 0, this.#l !== null && $e(this.#l, () => {
        this.#l = null;
      }), this.#e = this.has_pending_snippet(), this.#s = this.#_(() => (this.#h = !1, ge(() => this.#o(this.#t)))), this.#v > 0 ? this.#p() : this.#e = !1;
    };
    var o = O;
    try {
      ie(null), n = !0, r?.(t, i), n = !1;
    } catch (l) {
      ft(l, this.#a && this.#a.parent);
    } finally {
      ie(o);
    }
    s && pt(() => {
      this.#l = this.#_(() => {
        Ee.ensure(), this.#h = !0;
        try {
          return ge(() => {
            s(
              this.#t,
              () => t,
              () => i
            );
          });
        } catch (l) {
          return ft(
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
  var n = H, i = (
    /** @type {Effect} */
    q
  ), o = ws();
  function l() {
    Promise.all(r.map((f) => /* @__PURE__ */ ys(f))).then((f) => {
      o();
      try {
        s([...t.map(a), ...f]);
      } catch (c) {
        (i.f & ze) === 0 && ft(c, i);
      }
      n?.deactivate(), Ut();
    }).catch((f) => {
      ft(f, i);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    o();
    try {
      return l();
    } finally {
      n?.deactivate(), Ut();
    }
  }) : l();
}
function ws() {
  var e = q, t = O, r = de, s = H;
  return function(n = !0) {
    Te(e), ie(t), ut(r), n && s?.activate();
  };
}
function Ut() {
  Te(null), ie(null), ut(null);
}
// @__NO_SIDE_EFFECTS__
function Sr(e) {
  var t = K | ve, r = O !== null && (O.f & K) !== 0 ? (
    /** @type {Derived} */
    O
  ) : null;
  return q !== null && (q.f |= dt), {
    ctx: de,
    deps: null,
    effects: null,
    equals: Wr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Q
    ),
    wv: 0,
    parent: r ?? q,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function ys(e, t) {
  let r = (
    /** @type {Effect | null} */
    q
  );
  r === null && $n();
  var s = (
    /** @type {Boundary} */
    r.b
  ), a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), n = Ze(
    /** @type {V} */
    Q
  ), i = !O, o = /* @__PURE__ */ new Map();
  return Rs(() => {
    var l = $r();
    a = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).then(() => {
        f === H && f.committed && f.deactivate(), Ut();
      });
    } catch (_) {
      l.reject(_), Ut();
    }
    var f = (
      /** @type {Batch} */
      H
    );
    if (i) {
      var c = !s.is_pending();
      s.update_pending_count(1), f.increment(c), o.get(f)?.reject(at), o.delete(f), o.set(f, l);
    }
    const m = (_, p = void 0) => {
      if (f.activate(), p)
        p !== at && (n.f |= Ue, ct(n, p));
      else {
        (n.f & Ue) !== 0 && (n.f ^= Ue), ct(n, _);
        for (const [A, b] of o) {
          if (o.delete(A), A === f) break;
          b.reject(at);
        }
      }
      i && (s.update_pending_count(-1), f.decrement(c));
    };
    l.promise.then(m, (_) => m(null, _ || "unknown"));
  }), xr(() => {
    for (const l of o.values())
      l.reject(at);
  }), new Promise((l) => {
    function f(c) {
      function m() {
        c === a ? l(n) : f(a);
      }
      c.then(m, m);
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
  var t, r = q;
  Te(Ms(e));
  try {
    e.f &= ~Ke, an(e), t = xn(e);
  } finally {
    Te(r);
  }
  return t;
}
function ln(e) {
  var t = Er(e);
  if (e.equals(t) || (H?.is_fork || (e.v = t), e.wv = En()), !mt)
    if (be !== null)
      (Rt() || H?.is_fork) && be.set(e, t);
    else {
      var r = (e.f & Me) === 0 ? xe : ee;
      te(e, r);
    }
}
let _r = /* @__PURE__ */ new Set();
const Be = /* @__PURE__ */ new Map();
let on = !1;
function Ze(e, t) {
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
function L(e, t) {
  const r = Ze(e);
  return Sn(r), r;
}
// @__NO_SIDE_EFFECTS__
function Ss(e, t = !1, r = !0) {
  const s = Ze(e);
  return t || (s.equals = Zr), s;
}
function x(e, t, r = !1) {
  O !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!De || (O.f & Rr) !== 0) && Qr() && (O.f & (K | He | Mr | Rr)) !== 0 && !Ye?.includes(e) && es();
  let s = r ? ye(t) : t;
  return ct(e, s);
}
function ct(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    mt ? Be.set(e, t) : Be.set(e, r), e.v = t;
    var s = Ee.ensure();
    s.capture(e, r), (e.f & K) !== 0 && ((e.f & ve) !== 0 && Er(
      /** @type {Derived} */
      e
    ), te(e, (e.f & Me) !== 0 ? ee : xe)), e.wv = En(), un(e, ve), q !== null && (q.f & ee) !== 0 && (q.f & (Le | Qe)) === 0 && (pe === null ? Os([e]) : pe.push(e)), !s.is_fork && _r.size > 0 && !on && ks();
  }
  return t;
}
function ks() {
  on = !1;
  var e = Ve;
  Jt(!0);
  const t = Array.from(_r);
  try {
    for (const r of t)
      (r.f & ee) !== 0 && te(r, xe), Ht(r) && Pt(r);
  } finally {
    Jt(e);
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
      var n = r[a], i = n.f, o = (i & ve) === 0;
      if (o && te(n, t), (i & K) !== 0) {
        var l = (
          /** @type {Derived} */
          n
        );
        be?.delete(l), (i & Ke) === 0 && (i & Me && (n.f |= Ke), un(l, xe));
      } else o && ((i & He) !== 0 && Ie !== null && Ie.add(
        /** @type {Effect} */
        n
      ), We(
        /** @type {Effect} */
        n
      ));
    }
}
function ye(e) {
  if (typeof e != "object" || e === null || lt in e)
    return e;
  const t = Xr(e);
  if (t !== jn && t !== qn)
    return e;
  var r = /* @__PURE__ */ new Map(), s = gr(e), a = /* @__PURE__ */ L(0), n = Ge, i = (o) => {
    if (Ge === n)
      return o();
    var l = O, f = Ge;
    ie(null), Cr(n);
    var c = o();
    return ie(l), Cr(f), c;
  };
  return s && r.set("length", /* @__PURE__ */ L(
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
          var m = /* @__PURE__ */ L(f.value);
          return r.set(l, m), m;
        }) : x(c, f.value, !0), !0;
      },
      deleteProperty(o, l) {
        var f = r.get(l);
        if (f === void 0) {
          if (l in o) {
            const c = i(() => /* @__PURE__ */ L(Q));
            r.set(l, c), Ft(a);
          }
        } else
          x(f, Q), Ft(a);
        return !0;
      },
      get(o, l, f) {
        if (l === lt)
          return e;
        var c = r.get(l), m = l in o;
        if (c === void 0 && (!m || xt(o, l)?.writable) && (c = i(() => {
          var p = ye(m ? o[l] : Q), A = /* @__PURE__ */ L(p);
          return A;
        }), r.set(l, c)), c !== void 0) {
          var _ = u(c);
          return _ === Q ? void 0 : _;
        }
        return Reflect.get(o, l, f);
      },
      getOwnPropertyDescriptor(o, l) {
        var f = Reflect.getOwnPropertyDescriptor(o, l);
        if (f && "value" in f) {
          var c = r.get(l);
          c && (f.value = u(c));
        } else if (f === void 0) {
          var m = r.get(l), _ = m?.v;
          if (m !== void 0 && _ !== Q)
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
        if (l === lt)
          return !0;
        var f = r.get(l), c = f !== void 0 && f.v !== Q || Reflect.has(o, l);
        if (f !== void 0 || q !== null && (!c || xt(o, l)?.writable)) {
          f === void 0 && (f = i(() => {
            var _ = c ? ye(o[l]) : Q, p = /* @__PURE__ */ L(_);
            return p;
          }), r.set(l, f));
          var m = u(f);
          if (m === Q)
            return !1;
        }
        return c;
      },
      set(o, l, f, c) {
        var m = r.get(l), _ = l in o;
        if (s && l === "length")
          for (var p = f; p < /** @type {Source<number>} */
          m.v; p += 1) {
            var A = r.get(p + "");
            A !== void 0 ? x(A, Q) : p in o && (A = i(() => /* @__PURE__ */ L(Q)), r.set(p + "", A));
          }
        if (m === void 0)
          (!_ || xt(o, l)?.writable) && (m = i(() => /* @__PURE__ */ L(void 0)), x(m, ye(f)), r.set(l, m));
        else {
          _ = m.v !== Q;
          var b = i(() => ye(f));
          x(m, b);
        }
        var d = Reflect.getOwnPropertyDescriptor(o, l);
        if (d?.set && d.set.call(c, f), !_) {
          if (s && typeof l == "string") {
            var k = (
              /** @type {Source<number>} */
              r.get("length")
            ), z = Number(l);
            Number.isInteger(z) && z >= k.v && x(k, z + 1);
          }
          Ft(a);
        }
        return !0;
      },
      ownKeys(o) {
        u(a);
        var l = Reflect.ownKeys(o).filter((m) => {
          var _ = r.get(m);
          return _ === void 0 || _.v !== Q;
        });
        for (var [f, c] of r)
          c.v !== Q && !(f in o) && l.push(f);
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
    if (e !== null && typeof e == "object" && lt in e)
      return e[lt];
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
function Oe(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Bt(e) {
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
  return /* @__PURE__ */ Bt(e);
}
function vt(e, t = !1) {
  {
    var r = /* @__PURE__ */ Bt(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ Yt(r) : r;
  }
}
function y(e, t = 1, r = !1) {
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
function tr(e) {
  var t = O, r = q;
  ie(null), Te(null);
  try {
    return e();
  } finally {
    ie(t), Te(r);
  }
}
function Dr(e, t, r, s = r) {
  e.addEventListener(t, () => tr(r));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), s(!0);
  } : e.__on_r = () => s(!0), Ts();
}
function As(e) {
  q === null && (O === null && Kn(), Gn()), mt && Vn();
}
function Fs(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function Ce(e, t, r) {
  var s = q;
  s !== null && (s.f & ce) !== 0 && (e |= ce);
  var a = {
    ctx: de,
    deps: null,
    nodes: null,
    f: e | ve | Me,
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
  else t !== null && We(a);
  var n = a;
  if (r && n.deps === null && n.teardown === null && n.nodes === null && n.first === n.last && // either `null`, or a singular child
  (n.f & dt) === 0 && (n = n.first, (e & He) !== 0 && (e & ot) !== 0 && n !== null && (n.f |= ot)), n !== null && (n.parent = s, s !== null && Fs(n, s), O !== null && (O.f & K) !== 0 && (e & Qe) === 0)) {
    var i = (
      /** @type {Derived} */
      O
    );
    (i.effects ??= []).push(n);
  }
  return a;
}
function Rt() {
  return O !== null && !De;
}
function xr(e) {
  const t = Ce(wr, null, !1);
  return te(t, ee), t.teardown = e, t;
}
function hn(e) {
  As();
  var t = (
    /** @type {Effect} */
    q.f
  ), r = !O && (t & Le) !== 0 && (t & yr) === 0;
  if (r) {
    var s = (
      /** @type {ComponentContext} */
      de
    );
    (s.e ??= []).push(e);
  } else
    return _n(e);
}
function _n(e) {
  return Ce(br | Bn, e, !1);
}
function Ns(e) {
  Ee.ensure();
  const t = Ce(Qe | dt, e, !0);
  return (r = {}) => new Promise((s) => {
    r.outro ? $e(t, () => {
      le(t), s(void 0);
    }) : (le(t), s(void 0));
  });
}
function pn(e) {
  return Ce(br, e, !1);
}
function Rs(e) {
  return Ce(Mr | dt, e, !0);
}
function rr(e, t = 0) {
  return Ce(wr | t, e, !0);
}
function ne(e, t = [], r = [], s = []) {
  bs(s, t, r, (a) => {
    Ce(wr, () => e(...a.map(u)), !0);
  });
}
function Tr(e, t = 0) {
  var r = Ce(He | t, e, !0);
  return r;
}
function ge(e) {
  return Ce(Le | dt, e, !0);
}
function mn(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = mt, s = O;
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
    a !== null && tr(() => {
      a.abort(at);
    });
    var s = r.next;
    (r.f & Qe) !== 0 ? r.parent = null : le(r, t), r = s;
  }
}
function Is(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & Le) === 0 && le(t), t = r;
  }
}
function le(e, t = !0) {
  var r = !1;
  (t || (e.f & Gr) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ps(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), gn(e, t && !r), Xt(e, 0), te(e, ze);
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
function $e(e, t, r = !0) {
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
  if ((e.f & ce) === 0) {
    e.f ^= ce;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const o of s)
        (o.is_global || r) && t.push(o);
    for (var a = e.first; a !== null; ) {
      var n = a.next, i = (a.f & ot) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (a.f & Le) !== 0 && (e.f & He) !== 0;
      wn(a, t, i ? r : !1), a = n;
    }
  }
}
function Ar(e) {
  yn(e, !0);
}
function yn(e, t) {
  if ((e.f & ce) !== 0) {
    e.f ^= ce, (e.f & ee) === 0 && (te(e, ve), We(e));
    for (var r = e.first; r !== null; ) {
      var s = r.next, a = (r.f & ot) !== 0 || (r.f & Le) !== 0;
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
let Ve = !1;
function Jt(e) {
  Ve = e;
}
let mt = !1;
function Lr(e) {
  mt = e;
}
let O = null, De = !1;
function ie(e) {
  O = e;
}
let q = null;
function Te(e) {
  q = e;
}
let Ye = null;
function Sn(e) {
  O !== null && (Ye === null ? Ye = [e] : Ye.push(e));
}
let re = null, fe = 0, pe = null;
function Os(e) {
  pe = e;
}
let kn = 1, It = 0, Ge = It;
function Cr(e) {
  Ge = e;
}
function En() {
  return ++kn;
}
function Ht(e) {
  var t = e.f;
  if ((t & ve) !== 0)
    return !0;
  if (t & K && (e.f &= ~Ke), (t & xe) !== 0) {
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
    be === null && te(e, ee);
  }
  return !1;
}
function Dn(e, t, r = !0) {
  var s = e.reactions;
  if (s !== null && !Ye?.includes(e))
    for (var a = 0; a < s.length; a++) {
      var n = s[a];
      (n.f & K) !== 0 ? Dn(
        /** @type {Derived} */
        n,
        t,
        !1
      ) : t === n && (r ? te(n, ve) : (n.f & ee) !== 0 && te(n, xe), We(
        /** @type {Effect} */
        n
      ));
    }
}
function xn(e) {
  var t = re, r = fe, s = pe, a = O, n = Ye, i = de, o = De, l = Ge, f = e.f;
  re = /** @type {null | Value[]} */
  null, fe = 0, pe = null, O = (f & (Le | Qe)) === 0 ? e : null, Ye = null, ut(e.ctx), De = !1, Ge = ++It, e.ac !== null && (tr(() => {
    e.ac.abort(at);
  }), e.ac = null);
  try {
    e.f |= dr;
    var c = (
      /** @type {Function} */
      e.fn
    ), m = c(), _ = e.deps;
    if (re !== null) {
      var p;
      if (Xt(e, fe), _ !== null && fe > 0)
        for (_.length = fe + re.length, p = 0; p < re.length; p++)
          _[fe + p] = re[p];
      else
        e.deps = _ = re;
      if (Rt() && (e.f & Me) !== 0)
        for (p = fe; p < _.length; p++)
          (_[p].reactions ??= []).push(e);
    } else _ !== null && fe < _.length && (Xt(e, fe), _.length = fe);
    if (Qr() && pe !== null && !De && _ !== null && (e.f & (K | xe | ve)) === 0)
      for (p = 0; p < /** @type {Source[]} */
      pe.length; p++)
        Dn(
          pe[p],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (It++, pe !== null && (s === null ? s = pe : s.push(.../** @type {Source[]} */
    pe))), (e.f & Ue) !== 0 && (e.f ^= Ue), m;
  } catch (A) {
    return tn(A);
  } finally {
    e.f ^= dr, re = t, fe = r, pe = s, O = a, Ye = n, ut(i), De = o, Ge = l;
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
  (re === null || !re.includes(t)) && (te(t, xe), (t.f & Me) !== 0 && (t.f ^= Me, t.f &= ~Ke), an(
    /** @type {Derived} **/
    t
  ), Xt(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Xt(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var s = t; s < r.length; s++)
      Ys(e, r[s]);
}
function Pt(e) {
  var t = e.f;
  if ((t & ze) === 0) {
    te(e, ee);
    var r = q, s = Ve;
    q = e, Ve = !0;
    try {
      (t & (He | Un)) !== 0 ? Is(e) : gn(e), mn(e);
      var a = xn(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = kn;
      var n;
    } finally {
      Ve = s, q = r;
    }
  }
}
async function Tn() {
  await Promise.resolve(), ds();
}
function u(e) {
  var t = e.f, r = (t & K) !== 0;
  if (O !== null && !De) {
    var s = q !== null && (q.f & ze) !== 0;
    if (!s && !Ye?.includes(e)) {
      var a = O.deps;
      if ((O.f & dr) !== 0)
        e.rv < It && (e.rv = It, re === null && a !== null && a[fe] === e ? fe++ : re === null ? re = [e] : re.includes(e) || re.push(e));
      else {
        (O.deps ??= []).push(e);
        var n = e.reactions;
        n === null ? e.reactions = [O] : n.includes(O) || n.push(O);
      }
    }
  }
  if (mt) {
    if (Be.has(e))
      return Be.get(e);
    if (r) {
      var i = (
        /** @type {Derived} */
        e
      ), o = i.v;
      return ((i.f & ee) === 0 && i.reactions !== null || Fn(i)) && (o = Er(i)), Be.set(i, o), o;
    }
  } else r && (!be?.has(e) || H?.is_fork && !Rt()) && (i = /** @type {Derived} */
  e, Ht(i) && ln(i), Ve && Rt() && (i.f & Me) === 0 && An(i));
  if (be?.has(e))
    return be.get(e);
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
  if (e.v === Q) return !0;
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
  var t = De;
  try {
    return De = !0, e();
  } finally {
    De = t;
  }
}
const Hs = -7169;
function te(e, t) {
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
      return tr(() => r?.call(this, n));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? pt(() => {
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
function nr(e) {
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
    var c = O, m = q;
    ie(null), Te(null);
    try {
      for (var _, p = []; n !== null; ) {
        var A = n.assignedSlot || n.parentNode || /** @type {any} */
        n.host || null;
        try {
          var b = n["__" + s];
          b != null && (!/** @type {any} */
          n.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === n) && b.call(n, e);
        } catch (d) {
          _ ? p.push(d) : _ = d;
        }
        if (e.cancelBubble || A === t || A === null)
          break;
        n = A;
      }
      if (_) {
        for (let d of p)
          queueMicrotask(() => {
            throw d;
          });
        throw _;
      }
    } finally {
      e.__root = t, delete e.currentTarget, ie(c), Te(m);
    }
  }
}
function zs(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function $t(e, t) {
  var r = (
    /** @type {Effect} */
    q
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function J(e, t) {
  var r = (t & is) !== 0, s = (t & ls) !== 0, a, n = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = zs(n ? e : "<!>" + e), r || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ Bt(a)));
    var i = (
      /** @type {TemplateNode} */
      s || fn ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Bt(i)
      ), l = (
        /** @type {TemplateNode} */
        i.lastChild
      );
      $t(o, l);
    } else
      $t(i, i);
    return i;
  };
}
function Us(e = "") {
  {
    var t = Oe(e + "");
    return $t(t, t), t;
  }
}
function Vt() {
  var e = document.createDocumentFragment(), t = document.createComment(""), r = Oe();
  return e.append(t, r), $t(t, r), e;
}
function j(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function P(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ??= e.nodeValue) && (e.__t = r, e.nodeValue = r + "");
}
function Bs(e, t) {
  return Js(e, t);
}
const st = /* @__PURE__ */ new Map();
function Js(e, { target: t, anchor: r, props: s = {}, events: a, context: n, intro: i = !0 }) {
  Ds();
  var o = /* @__PURE__ */ new Set(), l = (m) => {
    for (var _ = 0; _ < m.length; _++) {
      var p = m[_];
      if (!o.has(p)) {
        o.add(p);
        var A = Cs(p);
        t.addEventListener(p, Et, { passive: A });
        var b = st.get(p);
        b === void 0 ? (document.addEventListener(p, Et, { passive: A }), st.set(p, 1)) : st.set(p, b + 1);
      }
    }
  };
  l(Wt(Nn)), pr.add(l);
  var f = void 0, c = Ns(() => {
    var m = r ?? t.appendChild(Oe());
    return ms(
      /** @type {TemplateNode} */
      m,
      {
        pending: () => {
        }
      },
      (_) => {
        if (n) {
          ht({});
          var p = (
            /** @type {ComponentContext} */
            de
          );
          p.c = n;
        }
        a && (s.$$events = a), f = e(_, s) || {}, n && _t();
      }
    ), () => {
      for (var _ of o) {
        t.removeEventListener(_, Et);
        var p = (
          /** @type {number} */
          st.get(_)
        );
        --p === 0 ? (document.removeEventListener(_, Et), st.delete(_)) : st.set(_, p);
      }
      pr.delete(l), m !== r && m.parentNode?.removeChild(m);
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
      H
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
            Mn(i, f), f.append(Oe()), this.#n.set(n, { effect: i, fragment: f });
          } else
            le(i);
          this.#r.delete(n), this.#t.delete(n);
        };
        this.#o || !s ? (this.#r.add(n), $e(i, o, !1)) : o();
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
      H
    ), a = dn();
    if (r && !this.#t.has(t) && !this.#n.has(t))
      if (a) {
        var n = document.createDocumentFragment(), i = Oe();
        n.append(i), this.#n.set(t, {
          effect: ge(() => r(i)),
          fragment: n
        });
      } else
        this.#t.set(
          t,
          ge(() => r(this.anchor))
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
  var s = new $s(e), a = r ? ot : 0;
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
function Gt(e, t) {
  return t;
}
function Vs(e, t, r) {
  for (var s = [], a = t.length, n, i = t.length, o = 0; o < a; o++) {
    let m = t[o];
    $e(
      m,
      () => {
        if (n) {
          if (n.pending.delete(m), n.done.add(m), n.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            mr(Wt(n.done)), _.delete(n), _.size === 0 && (e.outrogroups = null);
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
function Kt(e, t, r, s, a, n = null) {
  var i = e, o = /* @__PURE__ */ new Map(), l = (t & Kr) !== 0;
  if (l) {
    var f = (
      /** @type {Element} */
      e
    );
    i = f.appendChild(Oe());
  }
  var c = null, m = /* @__PURE__ */ kr(() => {
    var k = r();
    return gr(k) ? k : k == null ? [] : Wt(k);
  }), _, p = !0;
  function A() {
    d.fallback = c, Gs(d, _, i, t, s), c !== null && (_.length === 0 ? (c.f & Pe) === 0 ? Ar(c) : (c.f ^= Pe, Dt(c, null, i)) : $e(c, () => {
      c = null;
    }));
  }
  var b = Tr(() => {
    _ = /** @type {V[]} */
    u(m);
    for (var k = _.length, z = /* @__PURE__ */ new Set(), I = (
      /** @type {Batch} */
      H
    ), Y = dn(), T = 0; T < k; T += 1) {
      var C = _[T], X = s(C, T), E = p ? null : o.get(X);
      E ? (E.v && ct(E.v, C), E.i && ct(E.i, T), Y && I.skipped_effects.delete(E.e)) : (E = Ks(
        o,
        p ? i : qr ??= Oe(),
        C,
        X,
        T,
        a,
        t,
        r
      ), p || (E.e.f |= Pe), o.set(X, E)), z.add(X);
    }
    if (k === 0 && n && !c && (p ? c = ge(() => n(i)) : (c = ge(() => n(qr ??= Oe())), c.f |= Pe)), !p)
      if (Y) {
        for (const [F, D] of o)
          z.has(F) || I.skipped_effects.add(D.e);
        I.oncommit(A), I.ondiscard(() => {
        });
      } else
        A();
    u(m);
  }), d = { effect: b, items: o, outrogroups: null, fallback: c };
  p = !1;
}
function Gs(e, t, r, s, a) {
  var n = (s & ss) !== 0, i = t.length, o = e.items, l = e.effect.first, f, c = null, m, _ = [], p = [], A, b, d, k;
  if (n)
    for (k = 0; k < i; k += 1)
      A = t[k], b = a(A, k), d = /** @type {EachItem} */
      o.get(b).e, (d.f & Pe) === 0 && (d.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(d));
  for (k = 0; k < i; k += 1) {
    if (A = t[k], b = a(A, k), d = /** @type {EachItem} */
    o.get(b).e, e.outrogroups !== null)
      for (const D of e.outrogroups)
        D.pending.delete(d), D.done.delete(d);
    if ((d.f & Pe) !== 0)
      if (d.f ^= Pe, d === l)
        Dt(d, null, r);
      else {
        var z = c ? c.next : l;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), je(e, c, d), je(e, d, z), Dt(d, z, r), c = d, _ = [], p = [], l = c.next;
        continue;
      }
    if ((d.f & ce) !== 0 && (Ar(d), n && (d.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(d))), d !== l) {
      if (f !== void 0 && f.has(d)) {
        if (_.length < p.length) {
          var I = p[0], Y;
          c = I.prev;
          var T = _[0], C = _[_.length - 1];
          for (Y = 0; Y < _.length; Y += 1)
            Dt(_[Y], I, r);
          for (Y = 0; Y < p.length; Y += 1)
            f.delete(p[Y]);
          je(e, T.prev, C.next), je(e, c, T), je(e, C, I), l = I, c = C, k -= 1, _ = [], p = [];
        } else
          f.delete(d), Dt(d, l, r), je(e, d.prev, d.next), je(e, d, c === null ? e.effect.first : c.next), je(e, c, d), c = d;
        continue;
      }
      for (_ = [], p = []; l !== null && l !== d; )
        (f ??= /* @__PURE__ */ new Set()).add(l), p.push(l), l = l.next;
      if (l === null)
        continue;
    }
    (d.f & Pe) === 0 && _.push(d), c = d, l = d.next;
  }
  if (e.outrogroups !== null) {
    for (const D of e.outrogroups)
      D.pending.size === 0 && (mr(Wt(D.done)), e.outrogroups?.delete(D));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || f !== void 0) {
    var X = [];
    if (f !== void 0)
      for (d of f)
        (d.f & ce) === 0 && X.push(d);
    for (; l !== null; )
      (l.f & ce) === 0 && l !== e.fallback && X.push(l), l = l.next;
    var E = X.length;
    if (E > 0) {
      var F = (s & Kr) !== 0 && i === 0 ? r : null;
      if (n) {
        for (k = 0; k < E; k += 1)
          X[k].nodes?.a?.measure();
        for (k = 0; k < E; k += 1)
          X[k].nodes?.a?.fix();
      }
      Vs(e, X, F);
    }
  }
  n && pt(() => {
    if (m !== void 0)
      for (d of m)
        d.nodes?.a?.apply();
  });
}
function Ks(e, t, r, s, a, n, i, o) {
  var l = (i & rs) !== 0 ? (i & as) === 0 ? /* @__PURE__ */ Ss(r, !1, !1) : Ze(r) : null, f = (i & ns) !== 0 ? Ze(a) : null;
  return {
    v: l,
    i: f,
    e: ge(() => (n(t, l ?? r, f ?? a, o), () => {
      e.delete(s);
    }))
  };
}
function Dt(e, t, r) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, n = t && (t.f & Pe) === 0 ? (
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
    r(o), H !== null && s.add(H);
  }), pn(() => {
    var n = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        Tt ?? H
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
function lr(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet();
  Dr(e, "input", async (a) => {
    var n = a ? e.defaultValue : e.value;
    if (n = or(e) ? ur(n) : n, r(n), H !== null && s.add(H), await Tn(), n !== (n = t())) {
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
  Lt(t) == null && e.value && (r(or(e) ? ur(e.value) : e.value), H !== null && s.add(H)), rr(() => {
    var a = t();
    if (e === document.activeElement) {
      var n = (
        /** @type {Batch} */
        Tt ?? H
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
  Lt(t) == null && r(e.checked), rr(() => {
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
  return e === t || e?.[lt] === t;
}
function kt(e = {}, t, r, s) {
  return pn(() => {
    var a, n;
    return rr(() => {
      a = n, n = [], Lt(() => {
        e !== r(...n) && (t(e, ...n), a && Br(r(...a), e) && t(null, ...a));
      });
    }), () => {
      pt(() => {
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
  de === null && Xn(), hn(() => {
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
      function a(b, d, k) {
        var z = b || r, I = d || 0, Y = k || !1, T = 0, C;
        function X(D, g) {
          var S;
          if (g) {
            if (S = g.getTime(), Y) {
              var M = c(g);
              if (g = new Date(S + M + I), c(g) !== M) {
                var v = c(g);
                g = new Date(S + v + I);
              }
            }
          } else {
            var R = Date.now();
            R > T ? (T = R, C = new Date(T), S = T, Y && (C = new Date(T + c(C) + I))) : S = T, g = C;
          }
          return E(D, g, z, S);
        }
        function E(D, g, S, R) {
          for (var M = "", v = null, w = !1, U = D.length, B = !1, $ = 0; $ < U; $++) {
            var W = D.charCodeAt($);
            if (w === !0) {
              if (W === 45) {
                v = "";
                continue;
              } else if (W === 95) {
                v = " ";
                continue;
              } else if (W === 48) {
                v = "0";
                continue;
              } else if (W === 58) {
                B && A("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), B = !0;
                continue;
              }
              switch (W) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  M += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  M += S.days[g.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  M += S.months[g.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  M += n(Math.floor(g.getFullYear() / 100), v);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  M += E(S.formats.D, g, S, R);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  M += E(S.formats.F, g, S, R);
                  break;
                // '00'
                // case 'H':
                case 72:
                  M += n(g.getHours(), v);
                  break;
                // '12'
                // case 'I':
                case 73:
                  M += n(o(g.getHours()), v);
                  break;
                // '000'
                // case 'L':
                case 76:
                  M += i(Math.floor(R % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  M += n(g.getMinutes(), v);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  M += g.getHours() < 12 ? S.am : S.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  M += E(S.formats.R, g, S, R);
                  break;
                // '00'
                // case 'S':
                case 83:
                  M += n(g.getSeconds(), v);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  M += E(S.formats.T, g, S, R);
                  break;
                // '00'
                // case 'U':
                case 85:
                  M += n(l(g, "sunday"), v);
                  break;
                // '00'
                // case 'W':
                case 87:
                  M += n(l(g, "monday"), v);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  M += E(S.formats.X, g, S, R);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  M += g.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (Y && I === 0)
                    M += "GMT";
                  else {
                    var he = m(g);
                    M += he || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  M += S.shortDays[g.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  M += S.shortMonths[g.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  M += E(S.formats.c, g, S, R);
                  break;
                // '01'
                // case 'd':
                case 100:
                  M += n(g.getDate(), v);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  M += n(g.getDate(), v ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  M += S.shortMonths[g.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var oe = new Date(g.getFullYear(), 0, 1), V = Math.ceil((g.getTime() - oe.getTime()) / (1e3 * 60 * 60 * 24));
                  M += i(V);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  M += n(g.getHours(), v ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  M += n(o(g.getHours()), v ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  M += n(g.getMonth() + 1, v);
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
                  var V = g.getDate();
                  S.ordinalSuffixes ? M += String(V) + (S.ordinalSuffixes[V - 1] || f(V)) : M += String(V) + f(V);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  M += g.getHours() < 12 ? S.AM : S.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  M += E(S.formats.r, g, S, R);
                  break;
                // '0'
                // case 's':
                case 115:
                  M += Math.floor(R / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  M += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var V = g.getDay();
                  M += V === 0 ? 7 : V;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  M += E(S.formats.v, g, S, R);
                  break;
                // '4'
                // case 'w':
                case 119:
                  M += g.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  M += E(S.formats.x, g, S, R);
                  break;
                // '70'
                // case 'y':
                case 121:
                  M += n(g.getFullYear() % 100, v);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (Y && I === 0)
                    M += B ? "+00:00" : "+0000";
                  else {
                    var Z;
                    I !== 0 ? Z = I / (60 * 1e3) : Z = -g.getTimezoneOffset();
                    var Se = Z < 0 ? "-" : "+", we = B ? ":" : "", ke = Math.floor(Math.abs(Z / 60)), ue = Math.abs(Z % 60);
                    M += Se + n(ke) + we + n(ue);
                  }
                  break;
                default:
                  w && (M += "%"), M += D[$];
                  break;
              }
              v = null, w = !1;
              continue;
            }
            if (W === 37) {
              w = !0;
              continue;
            }
            M += D[$];
          }
          return M;
        }
        var F = X;
        return F.localize = function(D) {
          return new a(D || z, I, Y);
        }, F.localizeByIdentifier = function(D) {
          var g = t[D];
          return g ? F.localize(g) : (A('[WARNING] No locale found with identifier "' + D + '".'), F);
        }, F.timezone = function(D) {
          var g = I, S = Y, R = typeof D;
          if (R === "number" || R === "string")
            if (S = !0, R === "string") {
              var M = D[0] === "-" ? -1 : 1, v = parseInt(D.slice(1, 3), 10), w = parseInt(D.slice(3, 5), 10);
              g = M * (60 * v + w) * 60 * 1e3;
            } else R === "number" && (g = D * 60 * 1e3);
          return new a(z, g, S);
        }, F.utc = function() {
          return new a(z, I, !0);
        }, F;
      }
      function n(b, d) {
        return d === "" || b > 9 ? "" + b : (d == null && (d = "0"), d + b);
      }
      function i(b) {
        return b > 99 ? b : b > 9 ? "0" + b : "00" + b;
      }
      function o(b) {
        return b === 0 ? 12 : b > 12 ? b - 12 : b;
      }
      function l(b, d) {
        d = d || "sunday";
        var k = b.getDay();
        d === "monday" && (k === 0 ? k = 6 : k--);
        var z = Date.UTC(b.getFullYear(), 0, 1), I = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()), Y = Math.floor((I - z) / 864e5), T = (Y + 7 - k) / 7;
        return Math.floor(T);
      }
      function f(b) {
        var d = b % 10, k = b % 100;
        if (k >= 11 && k <= 13 || d === 0 || d >= 4)
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
      function c(b) {
        return (b.getTimezoneOffset() || 0) * 6e4;
      }
      function m(b, d) {
        return _() || p(b);
      }
      function _(b, d) {
        return null;
      }
      function p(b) {
        var d = b.toString().match(/\(([\w\s]+)\)/);
        return d && d[1];
      }
      function A(b) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(b);
      }
    })();
  })(fr)), fr.exports;
}
var ua = oa();
const it = /* @__PURE__ */ la(ua);
let cr = /* @__PURE__ */ L(!1);
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
const se = new fa(), ca = (e, t = Zt) => {
  var r = va(), s = h(r);
  ne(() => {
    qe(r, 1, `status status-${t() ?? ""}`, "svelte-13s7gu4"), P(s, t());
  }), j(e, r);
};
var va = /* @__PURE__ */ J("<span> </span>"), da = /* @__PURE__ */ J('<time class="svelte-13s7gu4"> </time>'), ha = /* @__PURE__ */ J('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), _a = /* @__PURE__ */ J('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), pa = /* @__PURE__ */ J('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), ma = /* @__PURE__ */ J('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), ga = /* @__PURE__ */ J('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4"> </h2> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">新しい方へ</button> <span class="svelte-13s7gu4"> </span> <button class="svelte-13s7gu4">古い方へ</button></div></div> <div><!></div></div>');
function ba(e, t) {
  ht(t, !0);
  const r = (F, D = Zt, g) => {
    let S = /* @__PURE__ */ kr(() => Vr(g?.(), !0));
    var R = da(), M = h(R);
    ne(
      (v) => {
        Ot(R, "datetime", D()), P(M, v);
      },
      [() => u(S) && D() ? c(D()) : "-"]
    ), j(F, R);
  };
  let s = /* @__PURE__ */ L(ye([])), a = /* @__PURE__ */ L(0), n = /* @__PURE__ */ L(0), i = 50;
  async function o() {
    try {
      const F = await se.get("/admin/api/entries", { limit: i, offset: u(n) });
      x(s, F.entries || [], !0), x(a, F.total || 0, !0);
    } catch (F) {
      console.error(F);
    }
  }
  Ct(o);
  function l() {
    u(n) + i < u(a) && (x(n, u(n) + i), o());
  }
  function f() {
    u(n) - i >= 0 && (x(n, u(n) - i), o());
  }
  function c(F) {
    return F ? it("%Y-%m-%d %H:%M", new Date(F)) : "-";
  }
  var m = ga(), _ = h(m), p = h(_), A = h(p), b = y(p, 2), d = h(b);
  d.__click = f;
  var k = y(d, 2), z = h(k), I = y(k, 2);
  I.__click = l;
  var Y = y(_, 2);
  let T;
  var C = h(Y);
  {
    var X = (F) => {
      var D = ha();
      j(F, D);
    }, E = (F) => {
      var D = ma(), g = vt(D), S = y(h(g));
      Kt(S, 21, () => u(s), Gt, (v, w) => {
        var U = _a(), B = h(U), $ = h(B), W = y(B), he = h(W), oe = y(W), V = h(oe);
        ca(V, () => u(w).status);
        var Z = y(oe), Se = h(Z), we = h(Se), ke = y(Se, 2), ue = h(ke), Ae = h(ue), Fe = y(Z), et = h(Fe), Je = y(Fe), tt = h(Je);
        r(tt, () => u(w).created_at);
        var rt = y(Je), gt = h(rt);
        r(gt, () => u(w).modified_at);
        var Ne = y(rt), bt = h(Ne);
        r(bt, () => u(w).publish_at?.Time, () => u(w).publish_at?.Valid);
        var wt = y(Ne), yt = h(wt);
        yt.__click = () => t.onEdit(u(w).id), ne(() => {
          P($, u(w).id), P(he, u(w).date), P(we, u(w).title), Ot(ue, "href", `/${u(w).path ?? ""}`), P(Ae, `/${u(w).path ?? ""}`), P(et, u(w).format);
        }), j(v, U);
      });
      var R = y(g, 2);
      {
        var M = (v) => {
          var w = pa();
          j(v, w);
        };
        ae(R, (v) => {
          se.loading && v(M);
        });
      }
      j(F, D);
    };
    ae(C, (F) => {
      se.loading && u(s).length === 0 ? F(X) : F(E, !1);
    });
  }
  ne(
    (F) => {
      P(A, `エントリ一覧 (${u(a) ?? ""})`), d.disabled = u(n) === 0 || se.loading, P(z, `${u(n) + 1} - ${F ?? ""} / ${u(a) ?? ""}`), I.disabled = u(n) + i >= u(a) || se.loading, T = qe(Y, 1, "table-container svelte-13s7gu4", null, T, { "is-loading": se.loading });
    },
    [() => Math.min(u(n) + i, u(a))]
  ), j(e, m), _t();
}
nr(["click"]);
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
var ya = /* @__PURE__ */ J('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), Ma = /* @__PURE__ */ J('<option class="svelte-7nstam"> </option>'), Sa = /* @__PURE__ */ J('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), ka = /* @__PURE__ */ J('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), Ea = /* @__PURE__ */ J('<button id="restore" type="button" class="submit-button svelte-7nstam">復元...</button>'), Da = /* @__PURE__ */ J('<div role="option" tabindex="-1"> </div>'), xa = /* @__PURE__ */ J('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam"> </button> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons svelte-7nstam"><div class="options svelte-7nstam"><label title="チェックを入れると指定した日時に公開されます（公開済みの記事も予約に戻せます）" class="svelte-7nstam"><input type="checkbox" class="svelte-7nstam"/> 公開を遅延</label> <!></div> <button type="button" class="submit-button svelte-7nstam"> </button> <!></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam" role="listbox" aria-label="タグを選択" tabindex="0"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog>', 1);
function Ta(e, t) {
  ht(t, !0);
  let r = aa(t, "id", 3, null);
  const s = new wa();
  let a = /* @__PURE__ */ L(ye({ id: null, title: "", body: "", status: null })), n = ye({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: "public",
    publishLater: !1,
    publishAt: ""
  }), i = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(!1), f = /* @__PURE__ */ L(null), c = /* @__PURE__ */ L(null), m = /* @__PURE__ */ L(null), _ = /* @__PURE__ */ L(null), p = /* @__PURE__ */ L(null);
  const A = [
    "tech",
    "photo",
    "redeveloped",
    "stablediffusion",
    "photoshopped"
  ];
  let b = /* @__PURE__ */ L(0);
  async function d(v) {
    try {
      const w = await se.get(`/admin/api/entry/${v}`);
      x(a, w, !0), n.id = w.id, n.title = w.title, n.body = w.body, n.format = w.format || "Hatena", n.status = w.status, n.publishLater = w.status === "scheduled", w.publish_at?.Valid ? n.publishAt = it("%Y-%m-%dT%H:%M", new Date(w.publish_at.Time)) : n.publishAt = it("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), s.check(u(a).id, { title: n.title, body: n.body });
    } catch (w) {
      console.error(w), alert("エントリの取得に失敗しました");
    }
  }
  Ct(() => {
    r() ? d(r()) : (x(a, { id: null, title: "", body: "", status: "public" }, !0), n.id = null, n.title = "", n.body = "", n.format = "Hatena", n.status = "public", n.publishLater = !1, n.publishAt = it("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), s.check(null, { title: n.title, body: n.body }));
  }), hn(() => {
    (u(a).title !== n.title || u(a).body !== n.body) && s.saveDebounced(u(a).id, { title: n.title, body: n.body });
  });
  async function k() {
    x(i, !0), x(o, "リクエスト中");
    const v = new FormData();
    if (v.set("id", n.id ? String(n.id) : ""), v.set("title", n.title), v.set("body", n.body), v.set("format", n.format), n.publishLater) {
      const w = new Date(n.publishAt);
      v.set("publish_at", w.toISOString()), v.set("status", "scheduled");
    } else
      v.set("status", "public");
    try {
      const U = (await se.post("/admin/api/edit", v)).session_id;
      if (!U)
        throw new Error("保存に失敗しました");
      z(U);
    } catch (w) {
      x(i, !1), alert(w instanceof Error ? w.message : "エラーが発生しました");
    }
  }
  function z(v) {
    const w = new EventSource(`/admin/api/edit/progress?sid=${v}`);
    w.onmessage = (U) => {
      const B = JSON.parse(U.data);
      switch (B.type) {
        case "progress":
          x(o, I(B.message), !0);
          break;
        case "done":
          s.clear(u(a).id), x(o, "完了"), x(i, !1), w.close(), t.onSave(B.location);
          break;
        case "error":
          x(o, "エラー: " + B.message), x(i, !1), w.close(), alert("保存に失敗しました: " + B.message);
          break;
      }
    }, w.onerror = () => {
      x(i, !1), w.close(), alert("通信エラーが発生しました");
    };
  }
  function I(v) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[v] || v;
  }
  function Y() {
    x(b, 0), u(m).showModal(), setTimeout(() => u(p)?.focus(), 0);
  }
  function T(v) {
    v.key === "ArrowDown" ? (v.preventDefault(), x(b, (u(b) + 1) % A.length)) : v.key === "ArrowUp" ? (v.preventDefault(), x(b, (u(b) - 1 + A.length) % A.length)) : v.key === "Enter" || v.key === " " ? (v.preventDefault(), C(A[u(b)])) : v.key === "Escape" && u(m).close();
  }
  function C(v) {
    const w = `[${v}]`;
    n.title.includes(w) ? n.title = n.title.replace(w, "") : n.title = w + n.title, u(m).close(), u(f).focus();
  }
  function X() {
    s.data && (n.title = s.data.title, n.body = s.data.body, s.clear(u(a).id), u(_).close());
  }
  async function E() {
    const v = document.createElement("input");
    v.type = "file", v.oninput = async () => {
      if (!v.files?.[0]) return;
      const w = new FormData();
      w.append("file", v.files[0]), x(l, !0);
      try {
        const U = await se.post("/admin/api/upload/image", w), B = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${U.uploaded}" class="picasa" itemprop="url"><img src="${U.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        F(B, !0);
      } catch {
        alert("アップロードに失敗しました");
      } finally {
        x(l, !1);
      }
    }, v.click();
  }
  function F(v, w = !1) {
    const U = u(c).selectionStart, B = u(c).selectionEnd, $ = u(c).value;
    n.body = $.substring(0, U) + v + $.substring(B), Tn().then(() => {
      typeof w == "boolean" && w ? (u(c).selectionStart = U, u(c).selectionEnd = U + v.length) : typeof w == "number" ? u(c).selectionStart = u(c).selectionEnd = U + w : u(c).selectionStart = u(c).selectionEnd = U + v.length, u(c).focus();
    });
  }
  function D(v) {
    (v.altKey ? "Alt-" : "") + (v.ctrlKey ? "Control-" : "") + (v.metaKey ? "Meta-" : "") + (v.shiftKey ? "Shift-" : "") + v.key === "Control-t" && (F("\\(  \\)", 3), v.preventDefault(), v.stopPropagation());
  }
  var g = Vt(), S = vt(g);
  {
    var R = (v) => {
      var w = ya();
      j(v, w);
    }, M = (v) => {
      var w = xa(), U = vt(w), B = h(U), $ = h(B);
      kt($, (N) => x(f, N), () => u(f));
      var W = y($, 2), he = h(W);
      he.__click = Y;
      var oe = y(he, 2);
      oe.__click = E;
      var V = h(oe), Z = y(oe, 2);
      Kt(Z, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], Gt, (N, G) => {
        var _e = Ma(), Re = h(_e), St = {};
        ne(() => {
          P(Re, G), St !== (St = G) && (_e.value = (_e.__value = G) ?? "");
        }), j(N, _e);
      });
      var Se = y(W, 2), we = h(Se);
      we.__keydown = D, kt(we, (N) => x(c, N), () => u(c));
      var ke = y(B, 2), ue = h(ke);
      {
        var Ae = (N) => {
          var G = Sa();
          j(N, G);
        };
        ae(ue, (N) => {
          u(i) && N(Ae);
        });
      }
      var Fe = y(ue, 2), et = h(Fe), Je = h(et), tt = h(Je), rt = y(Je, 2);
      {
        var gt = (N) => {
          var G = ka();
          lr(G, () => n.publishAt, (_e) => n.publishAt = _e), j(N, G);
        };
        ae(rt, (N) => {
          n.publishLater && N(gt);
        });
      }
      var Ne = y(et, 2);
      Ne.__click = k;
      var bt = h(Ne), wt = y(Ne, 2);
      {
        var yt = (N) => {
          var G = Ea();
          G.__click = () => u(_).showModal(), j(N, G);
        };
        ae(wt, (N) => {
          s.exists && N(yt);
        });
      }
      var Mt = y(U, 2), nt = y(h(Mt), 2);
      nt.__keydown = T, Kt(nt, 21, () => A, Gt, (N, G, _e) => {
        var Re = Da();
        let St;
        Re.__click = () => C(u(G)), Re.__keydown = (Yn) => Yn.key === "Enter" && C(u(G));
        var On = h(Re);
        ne(() => {
          St = qe(Re, 1, "tag-item svelte-7nstam", null, St, { selected: u(b) === _e }), Ot(Re, "aria-selected", u(b) === _e), P(On, u(G));
        }), qs("mouseenter", Re, () => x(b, _e, !0)), j(N, Re);
      }), kt(nt, (N) => x(p, N), () => u(p));
      var sr = y(nt, 2);
      sr.__click = () => u(m).close(), kt(Mt, (N) => x(m, N), () => u(m));
      var jt = y(Mt, 2), qt = y(h(jt), 2), ar = h(qt);
      {
        var ir = (N) => {
          var G = Us();
          ne((_e) => P(G, _e), [() => it("%Y年%m月%d日%H時", new Date(s.data.time))]), j(N, G);
        };
        ae(ar, (N) => {
          s.data?.time && N(ir);
        });
      }
      var In = y(qt, 2), Fr = h(In);
      Fr.__click = () => u(_).close();
      var Pn = y(Fr, 2);
      Pn.__click = X, kt(jt, (N) => x(_, N), () => u(_)), ne(() => {
        oe.disabled = u(l), P(V, u(l) ? "⌛ アップロード中..." : "📷 写真"), Ne.disabled = u(i), P(bt, u(i) ? u(o) || "リクエスト中" : r() ? "更新" : "作成");
      }), lr($, () => n.title, (N) => n.title = N), Qs(Z, () => n.format, (N) => n.format = N), lr(we, () => n.body, (N) => n.body = N), sa(tt, () => n.publishLater, (N) => n.publishLater = N), j(v, w);
    };
    ae(S, (v) => {
      se.loading && !u(a).id ? v(R) : v(M, !1);
    });
  }
  j(e, g), _t();
}
nr(["click", "keydown"]);
const Aa = (e, t = Zt) => {
  var r = Fa(), s = h(r);
  ne(() => {
    qe(r, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), P(s, t());
  }), j(e, r);
};
var Fa = /* @__PURE__ */ J("<span> </span>"), Na = /* @__PURE__ */ J('<time class="time svelte-1r6codn"> </time>'), Ra = /* @__PURE__ */ J('<div class="loading svelte-1r6codn"></div>'), Ia = /* @__PURE__ */ J('<div class="error-text svelte-1r6codn"> </div>'), Pa = /* @__PURE__ */ J('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><!></td><td class="error svelte-1r6codn"><!></td></tr>'), Oa = /* @__PURE__ */ J('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), Ya = /* @__PURE__ */ J('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">新しい方へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">古い方へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function Ha(e, t) {
  ht(t, !0);
  const r = (E, F = Zt, D) => {
    let g = /* @__PURE__ */ kr(() => Vr(D?.(), !0));
    var S = Na(), R = h(S);
    ne(
      (M) => {
        Ot(S, "datetime", F()), P(R, M);
      },
      [() => u(g) && F() ? c(F()) : "-"]
    ), j(E, S);
  };
  let s = /* @__PURE__ */ L(ye([])), a = /* @__PURE__ */ L(0), n = /* @__PURE__ */ L(0), i = 50;
  async function o() {
    try {
      const E = await se.get("/admin/api/jobs", { limit: i, offset: u(n) });
      x(s, E.jobs || [], !0), x(a, E.total || 0, !0);
    } catch (E) {
      console.error(E);
    }
  }
  Ct(o);
  function l() {
    u(n) + i < u(a) && (x(n, u(n) + i), o());
  }
  function f() {
    u(n) - i >= 0 && (x(n, u(n) - i), o());
  }
  function c(E) {
    return it("%Y-%m-%d %H:%M:%S", new Date(E));
  }
  var m = Ya(), _ = h(m), p = h(_), A = h(p), b = y(p, 2), d = h(b);
  d.__click = f;
  var k = y(d, 2), z = h(k), I = y(k, 2);
  I.__click = l;
  var Y = y(I, 2);
  Y.__click = o;
  var T = y(_, 2);
  {
    var C = (E) => {
      var F = Ra();
      j(E, F);
    }, X = (E) => {
      var F = Oa(), D = y(h(F));
      Kt(D, 21, () => u(s), Gt, (g, S) => {
        var R = Pa(), M = h(R), v = h(M), w = y(M), U = h(w), B = h(U), $ = y(w), W = h($);
        Aa(W, () => u(S).status);
        var he = y($), oe = h(he), V = y(he), Z = h(V);
        r(Z, () => u(S).created_at);
        var Se = y(V), we = h(Se);
        {
          var ke = (ue) => {
            var Ae = Ia(), Fe = h(Ae);
            ne(() => {
              Ot(Ae, "title", u(S).error_message.String), P(Fe, u(S).error_message.String);
            }), j(ue, Ae);
          };
          ae(we, (ue) => {
            u(S).error_message?.Valid && ue(ke);
          });
        }
        ne(() => {
          P(v, u(S).id), P(B, u(S).job_type_name), P(oe, u(S).retry_count);
        }), j(g, R);
      }), j(E, F);
    };
    ae(T, (E) => {
      se.loading && u(s).length === 0 ? E(C) : E(X, !1);
    });
  }
  ne(
    (E) => {
      P(A, `ジョブ一覧 (${u(a) ?? ""})`), d.disabled = u(n) === 0 || se.loading, P(z, `${u(n) + 1} - ${E ?? ""} / ${u(a) ?? ""}`), I.disabled = u(n) + i >= u(a) || se.loading;
    },
    [() => Math.min(u(n) + i, u(a))]
  ), j(e, m), _t();
}
nr(["click"]);
var La = /* @__PURE__ */ J('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), Ca = /* @__PURE__ */ J('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), ja = /* @__PURE__ */ J('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function qa(e, t) {
  ht(t, !0);
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
  Ct(a);
  function n(c) {
    if (c === 0) return "0 B";
    const m = 1024, _ = ["B", "KB", "MB", "GB", "TB"], p = Math.floor(Math.log(c) / Math.log(m));
    return parseFloat((c / Math.pow(m, p)).toFixed(2)) + " " + _[p];
  }
  var i = ja(), o = y(h(i), 2);
  {
    var l = (c) => {
      var m = La();
      j(c, m);
    }, f = (c) => {
      var m = Vt(), _ = vt(m);
      {
        var p = (A) => {
          var b = Ca(), d = h(b), k = y(h(d), 2), z = h(k), I = h(z), Y = h(I), T = y(h(Y)), C = h(T), X = y(Y), E = y(h(X)), F = h(E), D = h(F), g = y(d, 2), S = y(h(g), 2), R = h(S), M = h(R), v = h(M), w = y(h(v)), U = h(w), B = y(v), $ = y(h(B)), W = h($), he = y(B), oe = y(h(he)), V = h(oe), Z = y(he), Se = y(h(Z)), we = h(Se), ke = y(Z), ue = y(h(ke)), Ae = h(ue), Fe = y(ke), et = y(h(Fe)), Je = h(et), tt = y(Fe), rt = y(h(tt)), gt = h(rt), Ne = y(tt), bt = y(h(Ne)), wt = h(bt), yt = y(g, 2), Mt = y(h(yt), 2), nt = h(Mt);
          ne(
            (sr, jt, qt, ar, ir) => {
              P(C, u(r).is_development), P(D, u(r).app_hash), P(U, u(r).debug_info.go_version), P(W, u(r).debug_info.num_goroutine), P(V, sr), P(we, u(r).debug_info.uptime), P(Ae, jt), P(Je, qt), P(gt, ar), P(wt, u(r).debug_info.num_gc), P(nt, ir);
            },
            [
              () => new Date(u(r).debug_info.start_time).toLocaleString(),
              () => n(u(r).debug_info.mem_alloc),
              () => n(u(r).debug_info.mem_total_alloc),
              () => n(u(r).debug_info.mem_sys),
              () => JSON.stringify(u(r).config, null, 2)
            ]
          ), j(A, b);
        };
        ae(
          _,
          (A) => {
            u(r) && A(p);
          },
          !0
        );
      }
      j(c, m);
    };
    ae(o, (c) => {
      u(s) ? c(l) : c(f, !1);
    });
  }
  j(e, i), _t();
}
var za = /* @__PURE__ */ J('<div class="admin-app svelte-1n46o8q"><nav class="sub-nav svelte-1n46o8q"><a href="/admin/">エントリ一覧</a> <a href="/admin/edit">新規作成</a> <a href="/admin/jobs">ジョブ一覧</a> <a href="/admin/info">情報</a></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function Ua(e, t) {
  ht(t, !0);
  let r = /* @__PURE__ */ L(ye(window.location.pathname)), s = /* @__PURE__ */ L(ye(new URLSearchParams(window.location.search)));
  Ct(() => {
    const T = () => {
      x(r, window.location.pathname, !0), x(s, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", T), () => window.removeEventListener("popstate", T);
  });
  function a(T, C) {
    C && C.preventDefault(), window.history.pushState({}, "", T), x(r, window.location.pathname, !0), x(s, new URLSearchParams(window.location.search), !0);
  }
  const n = /* @__PURE__ */ Pr(() => u(r) === "/admin/edit" ? "edit" : u(r) === "/admin/jobs" ? "jobs" : u(r) === "/admin/info" ? "info" : "list"), i = /* @__PURE__ */ Pr(() => u(s).get("id"));
  var o = za(), l = h(o), f = h(l);
  f.__click = (T) => a("/admin/", T);
  let c;
  var m = y(f, 2);
  m.__click = (T) => a("/admin/edit", T);
  let _;
  var p = y(m, 2);
  p.__click = (T) => a("/admin/jobs", T);
  let A;
  var b = y(p, 2);
  b.__click = (T) => a("/admin/info", T);
  let d;
  var k = y(l, 2), z = h(k);
  {
    var I = (T) => {
      Ta(T, {
        get id() {
          return u(i);
        },
        onSave: (C) => window.location.href = C
      });
    }, Y = (T) => {
      var C = Vt(), X = vt(C);
      {
        var E = (D) => {
          Ha(D, {});
        }, F = (D) => {
          var g = Vt(), S = vt(g);
          {
            var R = (v) => {
              qa(v, {});
            }, M = (v) => {
              ba(v, { onEdit: (w) => a(`/admin/edit?id=${w}`) });
            };
            ae(
              S,
              (v) => {
                u(n) === "info" ? v(R) : v(M, !1);
              },
              !0
            );
          }
          j(D, g);
        };
        ae(
          X,
          (D) => {
            u(n) === "jobs" ? D(E) : D(F, !1);
          },
          !0
        );
      }
      j(T, C);
    };
    ae(z, (T) => {
      u(n) === "edit" ? T(I) : T(Y, !1);
    });
  }
  ne(() => {
    c = qe(f, 1, "svelte-1n46o8q", null, c, { active: u(n) === "list" }), _ = qe(m, 1, "svelte-1n46o8q", null, _, { active: u(n) === "edit" && !u(i) }), A = qe(p, 1, "svelte-1n46o8q", null, A, { active: u(n) === "jobs" }), d = qe(b, 1, "svelte-1n46o8q", null, d, { active: u(n) === "info" });
  }), j(e, o), _t();
}
nr(["click"]);
const vr = document.getElementById("admin-root");
vr && (vr.innerHTML = "", Bs(Ua, { target: vr }));
//# sourceMappingURL=admin-front.js.map
