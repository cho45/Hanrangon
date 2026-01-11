var Fr = Array.isArray, un = Array.prototype.indexOf, nr = Array.from, fn = Object.defineProperty, lt = Object.getOwnPropertyDescriptor, cn = Object.getOwnPropertyDescriptors, vn = Object.prototype, dn = Array.prototype, is = Object.getPrototypeOf, Br = Object.isExtensible;
function It(e) {
  return typeof e == "function";
}
const ar = () => {
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
const ie = 2, Pr = 4, Ir = 8, _n = 1 << 24, Je = 16, Xe = 32, pt = 64, ir = 128, Ye = 512, fe = 1024, xe = 2048, je = 4096, ye = 8192, We = 16384, Nr = 32768, vt = 65536, Jr = 1 << 17, us = 1 << 18, kt = 1 << 19, pn = 1 << 20, ze = 1 << 25, dt = 32768, kr = 1 << 21, Or = 1 << 22, Ze = 1 << 23, ot = /* @__PURE__ */ Symbol("$state"), gn = /* @__PURE__ */ Symbol("legacy props"), mn = /* @__PURE__ */ Symbol(""), bt = new class extends Error {
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
function Sn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function kn() {
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
const An = 1, Fn = 2, fs = 4, Pn = 8, In = 16, Nn = 1, On = 2, ue = /* @__PURE__ */ Symbol(), Rn = "http://www.w3.org/1999/xhtml";
function Yn() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Cn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function cs(e) {
  return e === this.v;
}
function Ln(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function vs(e) {
  return !Ln(e, this.v);
}
let Me = null;
function yt(e) {
  Me = e;
}
function tt(e, t = !1, r) {
  Me = {
    p: Me,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function rt(e) {
  var t = (
    /** @type {ComponentContext} */
    Me
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var s of r)
      Ts(s);
  }
  return t.i = !0, Me = t.p, /** @type {T} */
  {};
}
function ds() {
  return !0;
}
let it = [];
function hs() {
  var e = it;
  it = [], hn(e);
}
function Et(e) {
  if (it.length === 0 && !Yt) {
    var t = it;
    queueMicrotask(() => {
      t === it && hs();
    });
  }
  it.push(e);
}
function Hn() {
  for (; it.length > 0; )
    hs();
}
function _s(e) {
  var t = J;
  if (t === null)
    return q.f |= Ze, e;
  if ((t.f & Nr) === 0) {
    if ((t.f & ir) === 0)
      throw e;
    t.b.error(e);
  } else
    xt(e, t);
}
function xt(e, t) {
  for (; t !== null; ) {
    if ((t.f & ir) !== 0)
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
const Kt = /* @__PURE__ */ new Set();
let U = null, Rt = null, Ae = null, De = [], lr = null, Er = !1, Yt = !1;
class Le {
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
    De = [], Rt = null, this.apply();
    var r = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const s of t)
      this.#i(s, r);
    this.is_fork || this.#f(), this.is_deferred() ? (this.#l(r.effects), this.#l(r.render_effects)) : (Rt = this, U = null, Xr(r.render_effects), Xr(r.effects), Rt = null, this.#o?.resolve()), Ae = null;
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
      var a = s.f, n = (a & (Xe | pt)) !== 0, l = n && (a & fe) !== 0, u = l || (a & ye) !== 0 || this.skipped_effects.has(s);
      if ((s.f & ir) !== 0 && s.b?.is_pending() && (r = {
        parent: r,
        effect: s,
        effects: [],
        render_effects: []
      }), !u && s.fn !== null) {
        n ? s.f ^= fe : (a & Pr) !== 0 ? r.effects.push(s) : zt(s) && ((s.f & Je) !== 0 && this.#a.add(s), $t(s));
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
      (r.f & xe) !== 0 ? this.#a.add(r) : (r.f & je) !== 0 && this.#n.add(r), this.#u(r.deps), ce(r, fe);
  }
  /**
   * @param {Value[] | null} deps
   */
  #u(t) {
    if (t !== null)
      for (const r of t)
        (r.f & ie) === 0 || (r.f & dt) === 0 || (r.f ^= dt, this.#u(
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
    this.previous.has(t) || this.previous.set(t, r), (t.f & Ze) === 0 && (this.current.set(t, t.v), Ae?.set(t, t.v));
  }
  activate() {
    U = this, this.apply();
  }
  deactivate() {
    U === this && (U = null, Ae = null);
  }
  flush() {
    if (this.activate(), De.length > 0) {
      if (ps(), U !== null && U !== this)
        return;
    } else this.#s === 0 && this.process([]);
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
    this.#s === 0 && this.#c();
  }
  #c() {
    if (Kt.size > 1) {
      this.previous.clear();
      var t = Ae, r = !0, s = {
        parent: null,
        effect: null,
        effects: [],
        render_effects: []
      };
      for (const n of Kt) {
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
        const u = [...n.current.keys()].filter((o) => !this.current.has(o));
        if (u.length > 0) {
          var a = De;
          De = [];
          const o = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
          for (const v of l)
            gs(v, u, o, f);
          if (De.length > 0) {
            U = n, n.apply();
            for (const v of De)
              n.#i(v, s);
            n.deactivate();
          }
          De = a;
        }
      }
      U = null, Ae = t;
    }
    this.committed = !0, Kt.delete(this);
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
      this.#n.delete(t), ce(t, xe), ht(t);
    for (const t of this.#n)
      ce(t, je), ht(t);
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
    if (U === null) {
      const t = U = new Le();
      Kt.add(U), Yt || Le.enqueue(() => {
        U === t && t.flush();
      });
    }
    return U;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    Et(t);
  }
  apply() {
  }
}
function jn(e) {
  var t = Yt;
  Yt = !0;
  try {
    for (var r; ; ) {
      if (Hn(), De.length === 0 && (U?.flush(), De.length === 0))
        return lr = null, /** @type {T} */
        r;
      ps();
    }
  } finally {
    Yt = t;
  }
}
function ps() {
  var e = ft;
  Er = !0;
  var t = null;
  try {
    var r = 0;
    for (tr(!0); De.length > 0; ) {
      var s = Le.ensure();
      if (r++ > 1e3) {
        var a, n;
        $n();
      }
      s.process(De), Qe.clear();
    }
  } finally {
    Er = !1, tr(e), lr = null;
  }
}
function $n() {
  try {
    Sn();
  } catch (e) {
    xt(e, lr);
  }
}
let qe = null;
function Xr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var s = e[r++];
      if ((s.f & (We | ye)) === 0 && zt(s) && (qe = /* @__PURE__ */ new Set(), $t(s), s.deps === null && s.first === null && s.nodes === null && (s.teardown === null && s.ac === null ? Is(s) : s.fn = null), qe?.size > 0)) {
        Qe.clear();
        for (const a of qe) {
          if ((a.f & (We | ye)) !== 0) continue;
          const n = [a];
          let l = a.parent;
          for (; l !== null; )
            qe.has(l) && (qe.delete(l), n.push(l)), l = l.parent;
          for (let u = n.length - 1; u >= 0; u--) {
            const o = n[u];
            (o.f & (We | ye)) === 0 && $t(o);
          }
        }
        qe.clear();
      }
    }
    qe = null;
  }
}
function gs(e, t, r, s) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const n = a.f;
      (n & ie) !== 0 ? gs(
        /** @type {Derived} */
        a,
        t,
        r,
        s
      ) : (n & (Or | Je)) !== 0 && (n & xe) === 0 && ms(a, t, s) && (ce(a, xe), ht(
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
      if ((a.f & ie) !== 0 && ms(
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
function ht(e) {
  for (var t = lr = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Er && t === J && (r & Je) !== 0 && (r & us) === 0)
      return;
    if ((r & (pt | Xe)) !== 0) {
      if ((r & fe) === 0) return;
      t.f ^= fe;
    }
  }
  De.push(t);
}
function qn(e) {
  let t = 0, r = _t(0), s;
  return () => {
    Ht() && (i(r), ur(() => (t === 0 && (s = Ut(() => e(() => Ct(r)))), t += 1, () => {
      Et(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, Ct(r));
      });
    })));
  };
}
var zn = vt | kt | ir;
function Un(e, t, r) {
  new Bn(e, t, r);
}
class Bn {
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
  #b = qn(() => (this.#d = _t(this.#c), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, s) {
    this.#t = t, this.#r = r, this.#o = s, this.parent = /** @type {Effect} */
    J.b, this.#e = !!this.#r.pending, this.#a = fr(() => {
      J.b = this;
      {
        var a = this.#g();
        try {
          this.#n = Te(() => s(a));
        } catch (n) {
          this.error(n);
        }
        this.#v > 0 ? this.#p() : this.#e = !1;
      }
      return () => {
        this.#f?.remove();
      };
    }, zn);
  }
  #w() {
    try {
      this.#n = Te(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
    this.#e = !1;
  }
  #y() {
    const t = this.#r.pending;
    t && (this.#i = Te(() => t(this.#t)), Le.enqueue(() => {
      var r = this.#g();
      this.#n = this.#_(() => (Le.ensure(), Te(() => this.#o(r)))), this.#v > 0 ? this.#p() : (ut(
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
    return this.#e && (this.#f = Ue(), this.#t.before(this.#f), t = this.#f), t;
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
    var r = J, s = q, a = Me;
    $e(this.#a), ge(this.#a), yt(this.#a.ctx);
    try {
      return t();
    } catch (n) {
      return _s(n), null;
    } finally {
      $e(r), ge(s), yt(a);
    }
  }
  #p() {
    const t = (
      /** @type {(anchor: Node) => void} */
      this.#r.pending
    );
    this.#n !== null && (this.#u = document.createDocumentFragment(), this.#u.append(
      /** @type {TemplateNode} */
      this.#f
    ), Rs(this.#n, this.#u)), this.#i === null && (this.#i = Te(() => t(this.#t)));
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
    this.#v += t, this.#v === 0 && (this.#e = !1, this.#i && ut(this.#i, () => {
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
    this.#m(t), this.#c += t, this.#d && Mt(this.#d, this.#c);
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
    this.#n && (me(this.#n), this.#n = null), this.#i && (me(this.#i), this.#i = null), this.#l && (me(this.#l), this.#l = null);
    var a = !1, n = !1;
    const l = () => {
      if (a) {
        Cn();
        return;
      }
      a = !0, n && Tn(), Le.ensure(), this.#c = 0, this.#l !== null && ut(this.#l, () => {
        this.#l = null;
      }), this.#e = this.has_pending_snippet(), this.#n = this.#_(() => (this.#h = !1, Te(() => this.#o(this.#t)))), this.#v > 0 ? this.#p() : this.#e = !1;
    };
    var u = q;
    try {
      ge(null), n = !0, r?.(t, l), n = !1;
    } catch (o) {
      xt(o, this.#a && this.#a.parent);
    } finally {
      ge(u);
    }
    s && Et(() => {
      this.#l = this.#_(() => {
        Le.ensure(), this.#h = !0;
        try {
          return Te(() => {
            s(
              this.#t,
              () => t,
              () => l
            );
          });
        } catch (o) {
          return xt(
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
  const a = Rr;
  if (r.length === 0 && e.length === 0) {
    s(t.map(a));
    return;
  }
  var n = U, l = (
    /** @type {Effect} */
    J
  ), u = Xn();
  function o() {
    Promise.all(r.map((f) => /* @__PURE__ */ Vn(f))).then((f) => {
      u();
      try {
        s([...t.map(a), ...f]);
      } catch (v) {
        (l.f & We) === 0 && xt(v, l);
      }
      n?.deactivate(), Zt();
    }).catch((f) => {
      xt(f, l);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    u();
    try {
      return o();
    } finally {
      n?.deactivate(), Zt();
    }
  }) : o();
}
function Xn() {
  var e = J, t = q, r = Me, s = U;
  return function(n = !0) {
    $e(e), ge(t), yt(r), n && s?.activate();
  };
}
function Zt() {
  $e(null), ge(null), yt(null);
}
// @__NO_SIDE_EFFECTS__
function Rr(e) {
  var t = ie | xe, r = q !== null && (q.f & ie) !== 0 ? (
    /** @type {Derived} */
    q
  ) : null;
  return J !== null && (J.f |= kt), {
    ctx: Me,
    deps: null,
    effects: null,
    equals: cs,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ue
    ),
    wv: 0,
    parent: r ?? J,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Vn(e, t) {
  let r = (
    /** @type {Effect | null} */
    J
  );
  r === null && wn();
  var s = (
    /** @type {Boundary} */
    r.b
  ), a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), n = _t(
    /** @type {V} */
    ue
  ), l = !q, u = /* @__PURE__ */ new Map();
  return aa(() => {
    var o = ls();
    a = o.promise;
    try {
      Promise.resolve(e()).then(o.resolve, o.reject).then(() => {
        f === U && f.committed && f.deactivate(), Zt();
      });
    } catch (_) {
      o.reject(_), Zt();
    }
    var f = (
      /** @type {Batch} */
      U
    );
    if (l) {
      var v = !s.is_pending();
      s.update_pending_count(1), f.increment(v), u.get(f)?.reject(bt), u.delete(f), u.set(f, o);
    }
    const g = (_, p = void 0) => {
      if (f.activate(), p)
        p !== bt && (n.f |= Ze, Mt(n, p));
      else {
        (n.f & Ze) !== 0 && (n.f ^= Ze), Mt(n, _);
        for (const [E, b] of u) {
          if (u.delete(E), E === f) break;
          b.reject(bt);
        }
      }
      l && (s.update_pending_count(-1), f.decrement(v));
    };
    o.promise.then(g, (_) => g(null, _ || "unknown"));
  }), Hr(() => {
    for (const o of u.values())
      o.reject(bt);
  }), new Promise((o) => {
    function f(v) {
      function g() {
        v === a ? o(n) : f(a);
      }
      v.then(g, g);
    }
    f(a);
  });
}
// @__NO_SIDE_EFFECTS__
function Qt(e) {
  const t = /* @__PURE__ */ Rr(e);
  return Ys(t), t;
}
// @__NO_SIDE_EFFECTS__
function Yr(e) {
  const t = /* @__PURE__ */ Rr(e);
  return t.equals = vs, t;
}
function bs(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      me(
        /** @type {Effect} */
        t[r]
      );
  }
}
function Gn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & ie) === 0)
      return (t.f & We) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Cr(e) {
  var t, r = J;
  $e(Gn(e));
  try {
    e.f &= ~dt, bs(e), t = js(e);
  } finally {
    $e(r);
  }
  return t;
}
function ws(e) {
  var t = Cr(e);
  if (e.equals(t) || (U?.is_fork || (e.v = t), e.wv = Ls()), !Dt)
    if (Ae !== null)
      (Ht() || U?.is_fork) && Ae.set(e, t);
    else {
      var r = (e.f & Ye) === 0 ? je : fe;
      ce(e, r);
    }
}
let Dr = /* @__PURE__ */ new Set();
const Qe = /* @__PURE__ */ new Map();
let ys = !1;
function _t(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: cs,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function H(e, t) {
  const r = _t(e);
  return Ys(r), r;
}
// @__NO_SIDE_EFFECTS__
function Kn(e, t = !1, r = !0) {
  const s = _t(e);
  return t || (s.equals = vs), s;
}
function D(e, t, r = !1) {
  q !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!He || (q.f & Jr) !== 0) && ds() && (q.f & (ie | Je | Or | Jr)) !== 0 && !Be?.includes(e) && Dn();
  let s = r ? pe(t) : t;
  return Mt(e, s);
}
function Mt(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Dt ? Qe.set(e, t) : Qe.set(e, r), e.v = t;
    var s = Le.ensure();
    s.capture(e, r), (e.f & ie) !== 0 && ((e.f & xe) !== 0 && Cr(
      /** @type {Derived} */
      e
    ), ce(e, (e.f & Ye) !== 0 ? fe : je)), e.wv = Ls(), xs(e, xe), J !== null && (J.f & fe) !== 0 && (J.f & (Xe | pt)) === 0 && (Ee === null ? oa([e]) : Ee.push(e)), !s.is_fork && Dr.size > 0 && !ys && Wn();
  }
  return t;
}
function Wn() {
  ys = !1;
  var e = ft;
  tr(!0);
  const t = Array.from(Dr);
  try {
    for (const r of t)
      (r.f & fe) !== 0 && ce(r, je), zt(r) && $t(r);
  } finally {
    tr(e);
  }
  Dr.clear();
}
function Ct(e) {
  D(e, e.v + 1);
}
function xs(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, a = 0; a < s; a++) {
      var n = r[a], l = n.f, u = (l & xe) === 0;
      if (u && ce(n, t), (l & ie) !== 0) {
        var o = (
          /** @type {Derived} */
          n
        );
        Ae?.delete(o), (l & dt) === 0 && (l & Ye && (n.f |= dt), xs(o, je));
      } else u && ((l & Je) !== 0 && qe !== null && qe.add(
        /** @type {Effect} */
        n
      ), ht(
        /** @type {Effect} */
        n
      ));
    }
}
function pe(e) {
  if (typeof e != "object" || e === null || ot in e)
    return e;
  const t = is(e);
  if (t !== vn && t !== dn)
    return e;
  var r = /* @__PURE__ */ new Map(), s = Fr(e), a = /* @__PURE__ */ H(0), n = ct, l = (u) => {
    if (ct === n)
      return u();
    var o = q, f = ct;
    ge(null), Zr(n);
    var v = u();
    return ge(o), Zr(f), v;
  };
  return s && r.set("length", /* @__PURE__ */ H(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, o, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && kn();
        var v = r.get(o);
        return v === void 0 ? v = l(() => {
          var g = /* @__PURE__ */ H(f.value);
          return r.set(o, g), g;
        }) : D(v, f.value, !0), !0;
      },
      deleteProperty(u, o) {
        var f = r.get(o);
        if (f === void 0) {
          if (o in u) {
            const v = l(() => /* @__PURE__ */ H(ue));
            r.set(o, v), Ct(a);
          }
        } else
          D(f, ue), Ct(a);
        return !0;
      },
      get(u, o, f) {
        if (o === ot)
          return e;
        var v = r.get(o), g = o in u;
        if (v === void 0 && (!g || lt(u, o)?.writable) && (v = l(() => {
          var p = pe(g ? u[o] : ue), E = /* @__PURE__ */ H(p);
          return E;
        }), r.set(o, v)), v !== void 0) {
          var _ = i(v);
          return _ === ue ? void 0 : _;
        }
        return Reflect.get(u, o, f);
      },
      getOwnPropertyDescriptor(u, o) {
        var f = Reflect.getOwnPropertyDescriptor(u, o);
        if (f && "value" in f) {
          var v = r.get(o);
          v && (f.value = i(v));
        } else if (f === void 0) {
          var g = r.get(o), _ = g?.v;
          if (g !== void 0 && _ !== ue)
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
        if (o === ot)
          return !0;
        var f = r.get(o), v = f !== void 0 && f.v !== ue || Reflect.has(u, o);
        if (f !== void 0 || J !== null && (!v || lt(u, o)?.writable)) {
          f === void 0 && (f = l(() => {
            var _ = v ? pe(u[o]) : ue, p = /* @__PURE__ */ H(_);
            return p;
          }), r.set(o, f));
          var g = i(f);
          if (g === ue)
            return !1;
        }
        return v;
      },
      set(u, o, f, v) {
        var g = r.get(o), _ = o in u;
        if (s && o === "length")
          for (var p = f; p < /** @type {Source<number>} */
          g.v; p += 1) {
            var E = r.get(p + "");
            E !== void 0 ? D(E, ue) : p in u && (E = l(() => /* @__PURE__ */ H(ue)), r.set(p + "", E));
          }
        if (g === void 0)
          (!_ || lt(u, o)?.writable) && (g = l(() => /* @__PURE__ */ H(void 0)), D(g, pe(f)), r.set(o, g));
        else {
          _ = g.v !== ue;
          var b = l(() => pe(f));
          D(g, b);
        }
        var d = Reflect.getOwnPropertyDescriptor(u, o);
        if (d?.set && d.set.call(v, f), !_) {
          if (s && typeof o == "string") {
            var y = (
              /** @type {Source<number>} */
              r.get("length")
            ), O = Number(o);
            Number.isInteger(O) && O >= y.v && D(y, O + 1);
          }
          Ct(a);
        }
        return !0;
      },
      ownKeys(u) {
        i(a);
        var o = Reflect.ownKeys(u).filter((g) => {
          var _ = r.get(g);
          return _ === void 0 || _.v !== ue;
        });
        for (var [f, v] of r)
          v.v !== ue && !(f in u) && o.push(f);
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
    if (e !== null && typeof e == "object" && ot in e)
      return e[ot];
  } catch {
  }
  return e;
}
function Zn(e, t) {
  return Object.is(Vr(e), Vr(t));
}
var Gr, Ms, Ss, ks;
function Qn() {
  if (Gr === void 0) {
    Gr = window, Ms = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    Ss = lt(t, "firstChild").get, ks = lt(t, "nextSibling").get, Br(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Br(r) && (r.__t = void 0);
  }
}
function Ue(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function er(e) {
  return (
    /** @type {TemplateNode | null} */
    Ss.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function qt(e) {
  return (
    /** @type {TemplateNode | null} */
    ks.call(e)
  );
}
function c(e, t) {
  return /* @__PURE__ */ er(e);
}
function St(e, t = !1) {
  {
    var r = /* @__PURE__ */ er(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ qt(r) : r;
  }
}
function h(e, t = 1, r = !1) {
  let s = e;
  for (; t--; )
    s = /** @type {TemplateNode} */
    /* @__PURE__ */ qt(s);
  return s;
}
function ea(e) {
  e.textContent = "";
}
function Es() {
  return !1;
}
let Kr = !1;
function ta() {
  Kr || (Kr = !0, document.addEventListener(
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
function or(e) {
  var t = q, r = J;
  ge(null), $e(null);
  try {
    return e();
  } finally {
    ge(t), $e(r);
  }
}
function Lr(e, t, r, s = r) {
  e.addEventListener(t, () => or(r));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), s(!0);
  } : e.__on_r = () => s(!0), ta();
}
function ra(e) {
  J === null && (q === null && Mn(), xn()), Dt && yn();
}
function sa(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function Ve(e, t, r) {
  var s = J;
  s !== null && (s.f & ye) !== 0 && (e |= ye);
  var a = {
    ctx: Me,
    deps: null,
    nodes: null,
    f: e | xe | Ye,
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
      $t(a), a.f |= Nr;
    } catch (u) {
      throw me(a), u;
    }
  else t !== null && ht(a);
  var n = a;
  if (r && n.deps === null && n.teardown === null && n.nodes === null && n.first === n.last && // either `null`, or a singular child
  (n.f & kt) === 0 && (n = n.first, (e & Je) !== 0 && (e & vt) !== 0 && n !== null && (n.f |= vt)), n !== null && (n.parent = s, s !== null && sa(n, s), q !== null && (q.f & ie) !== 0 && (e & pt) === 0)) {
    var l = (
      /** @type {Derived} */
      q
    );
    (l.effects ??= []).push(n);
  }
  return a;
}
function Ht() {
  return q !== null && !He;
}
function Hr(e) {
  const t = Ve(Ir, null, !1);
  return ce(t, fe), t.teardown = e, t;
}
function Ds(e) {
  ra();
  var t = (
    /** @type {Effect} */
    J.f
  ), r = !q && (t & Xe) !== 0 && (t & Nr) === 0;
  if (r) {
    var s = (
      /** @type {ComponentContext} */
      Me
    );
    (s.e ??= []).push(e);
  } else
    return Ts(e);
}
function Ts(e) {
  return Ve(Pr | pn, e, !1);
}
function na(e) {
  Le.ensure();
  const t = Ve(pt | kt, e, !0);
  return (r = {}) => new Promise((s) => {
    r.outro ? ut(t, () => {
      me(t), s(void 0);
    }) : (me(t), s(void 0));
  });
}
function As(e) {
  return Ve(Pr, e, !1);
}
function aa(e) {
  return Ve(Or | kt, e, !0);
}
function ur(e, t = 0) {
  return Ve(Ir | t, e, !0);
}
function Z(e, t = [], r = [], s = []) {
  Jn(s, t, r, (a) => {
    Ve(Ir, () => e(...a.map(i)), !0);
  });
}
function fr(e, t = 0) {
  var r = Ve(Je | t, e, !0);
  return r;
}
function Te(e) {
  return Ve(Xe | kt, e, !0);
}
function Fs(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Dt, s = q;
    Wr(!0), ge(null);
    try {
      t.call(null);
    } finally {
      Wr(r), ge(s);
    }
  }
}
function Ps(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const a = r.ac;
    a !== null && or(() => {
      a.abort(bt);
    });
    var s = r.next;
    (r.f & pt) !== 0 ? r.parent = null : me(r, t), r = s;
  }
}
function ia(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & Xe) === 0 && me(t), t = r;
  }
}
function me(e, t = !0) {
  var r = !1;
  (t || (e.f & us) !== 0) && e.nodes !== null && e.nodes.end !== null && (la(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), Ps(e, t && !r), rr(e, 0), ce(e, We);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const n of s)
      n.stop();
  Fs(e);
  var a = e.parent;
  a !== null && a.first !== null && Is(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function la(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ qt(e);
    e.remove(), e = r;
  }
}
function Is(e) {
  var t = e.parent, r = e.prev, s = e.next;
  r !== null && (r.next = s), s !== null && (s.prev = r), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = r));
}
function ut(e, t, r = !0) {
  var s = [];
  Ns(e, s, !0);
  var a = () => {
    r && me(e), t && t();
  }, n = s.length;
  if (n > 0) {
    var l = () => --n || a();
    for (var u of s)
      u.out(l);
  } else
    a();
}
function Ns(e, t, r) {
  if ((e.f & ye) === 0) {
    e.f ^= ye;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const u of s)
        (u.is_global || r) && t.push(u);
    for (var a = e.first; a !== null; ) {
      var n = a.next, l = (a.f & vt) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (a.f & Xe) !== 0 && (e.f & Je) !== 0;
      Ns(a, t, l ? r : !1), a = n;
    }
  }
}
function jr(e) {
  Os(e, !0);
}
function Os(e, t) {
  if ((e.f & ye) !== 0) {
    e.f ^= ye, (e.f & fe) === 0 && (ce(e, xe), ht(e));
    for (var r = e.first; r !== null; ) {
      var s = r.next, a = (r.f & vt) !== 0 || (r.f & Xe) !== 0;
      Os(r, a ? t : !1), r = s;
    }
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const l of n)
        (l.is_global || t) && l.in();
  }
}
function Rs(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end; r !== null; ) {
      var a = r === s ? null : /* @__PURE__ */ qt(r);
      t.append(r), r = a;
    }
}
let ft = !1;
function tr(e) {
  ft = e;
}
let Dt = !1;
function Wr(e) {
  Dt = e;
}
let q = null, He = !1;
function ge(e) {
  q = e;
}
let J = null;
function $e(e) {
  J = e;
}
let Be = null;
function Ys(e) {
  q !== null && (Be === null ? Be = [e] : Be.push(e));
}
let ve = null, we = 0, Ee = null;
function oa(e) {
  Ee = e;
}
let Cs = 1, jt = 0, ct = jt;
function Zr(e) {
  ct = e;
}
function Ls() {
  return ++Cs;
}
function zt(e) {
  var t = e.f;
  if ((t & xe) !== 0)
    return !0;
  if (t & ie && (e.f &= ~dt), (t & je) !== 0) {
    var r = e.deps;
    if (r !== null)
      for (var s = r.length, a = 0; a < s; a++) {
        var n = r[a];
        if (zt(
          /** @type {Derived} */
          n
        ) && ws(
          /** @type {Derived} */
          n
        ), n.wv > e.wv)
          return !0;
      }
    (t & Ye) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ae === null && ce(e, fe);
  }
  return !1;
}
function Hs(e, t, r = !0) {
  var s = e.reactions;
  if (s !== null && !Be?.includes(e))
    for (var a = 0; a < s.length; a++) {
      var n = s[a];
      (n.f & ie) !== 0 ? Hs(
        /** @type {Derived} */
        n,
        t,
        !1
      ) : t === n && (r ? ce(n, xe) : (n.f & fe) !== 0 && ce(n, je), ht(
        /** @type {Effect} */
        n
      ));
    }
}
function js(e) {
  var t = ve, r = we, s = Ee, a = q, n = Be, l = Me, u = He, o = ct, f = e.f;
  ve = /** @type {null | Value[]} */
  null, we = 0, Ee = null, q = (f & (Xe | pt)) === 0 ? e : null, Be = null, yt(e.ctx), He = !1, ct = ++jt, e.ac !== null && (or(() => {
    e.ac.abort(bt);
  }), e.ac = null);
  try {
    e.f |= kr;
    var v = (
      /** @type {Function} */
      e.fn
    ), g = v(), _ = e.deps;
    if (ve !== null) {
      var p;
      if (rr(e, we), _ !== null && we > 0)
        for (_.length = we + ve.length, p = 0; p < ve.length; p++)
          _[we + p] = ve[p];
      else
        e.deps = _ = ve;
      if (Ht() && (e.f & Ye) !== 0)
        for (p = we; p < _.length; p++)
          (_[p].reactions ??= []).push(e);
    } else _ !== null && we < _.length && (rr(e, we), _.length = we);
    if (ds() && Ee !== null && !He && _ !== null && (e.f & (ie | je | xe)) === 0)
      for (p = 0; p < /** @type {Source[]} */
      Ee.length; p++)
        Hs(
          Ee[p],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (jt++, Ee !== null && (s === null ? s = Ee : s.push(.../** @type {Source[]} */
    Ee))), (e.f & Ze) !== 0 && (e.f ^= Ze), g;
  } catch (E) {
    return _s(E);
  } finally {
    e.f ^= kr, ve = t, we = r, Ee = s, q = a, Be = n, yt(l), He = u, ct = o;
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
  r === null && (t.f & ie) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ve === null || !ve.includes(t)) && (ce(t, je), (t.f & Ye) !== 0 && (t.f ^= Ye, t.f &= ~dt), bs(
    /** @type {Derived} **/
    t
  ), rr(
    /** @type {Derived} **/
    t,
    0
  ));
}
function rr(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var s = t; s < r.length; s++)
      ua(e, r[s]);
}
function $t(e) {
  var t = e.f;
  if ((t & We) === 0) {
    ce(e, fe);
    var r = J, s = ft;
    J = e, ft = !0;
    try {
      (t & (Je | _n)) !== 0 ? ia(e) : Ps(e), Fs(e);
      var a = js(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Cs;
      var n;
    } finally {
      ft = s, J = r;
    }
  }
}
async function $s() {
  await Promise.resolve(), jn();
}
function i(e) {
  var t = e.f, r = (t & ie) !== 0;
  if (q !== null && !He) {
    var s = J !== null && (J.f & We) !== 0;
    if (!s && !Be?.includes(e)) {
      var a = q.deps;
      if ((q.f & kr) !== 0)
        e.rv < jt && (e.rv = jt, ve === null && a !== null && a[we] === e ? we++ : ve === null ? ve = [e] : ve.includes(e) || ve.push(e));
      else {
        (q.deps ??= []).push(e);
        var n = e.reactions;
        n === null ? e.reactions = [q] : n.includes(q) || n.push(q);
      }
    }
  }
  if (Dt) {
    if (Qe.has(e))
      return Qe.get(e);
    if (r) {
      var l = (
        /** @type {Derived} */
        e
      ), u = l.v;
      return ((l.f & fe) === 0 && l.reactions !== null || zs(l)) && (u = Cr(l)), Qe.set(l, u), u;
    }
  } else r && (!Ae?.has(e) || U?.is_fork && !Ht()) && (l = /** @type {Derived} */
  e, zt(l) && ws(l), ft && Ht() && (l.f & Ye) === 0 && qs(l));
  if (Ae?.has(e))
    return Ae.get(e);
  if ((e.f & Ze) !== 0)
    throw e.v;
  return e.v;
}
function qs(e) {
  if (e.deps !== null) {
    e.f ^= Ye;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & ie) !== 0 && (t.f & Ye) === 0 && qs(
        /** @type {Derived} */
        t
      );
  }
}
function zs(e) {
  if (e.v === ue) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Qe.has(t) || (t.f & ie) !== 0 && zs(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Ut(e) {
  var t = He;
  try {
    return He = !0, e();
  } finally {
    He = t;
  }
}
const fa = -7169;
function ce(e, t) {
  e.f = e.f & fa | t;
}
const ca = ["touchstart", "touchmove"];
function va(e) {
  return ca.includes(e);
}
const Us = /* @__PURE__ */ new Set(), Tr = /* @__PURE__ */ new Set();
function da(e, t, r, s = {}) {
  function a(n) {
    if (s.capture || Nt.call(t, n), !n.cancelBubble)
      return or(() => r?.call(this, n));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Et(() => {
    t.addEventListener(e, a, s);
  }) : t.addEventListener(e, a, s), a;
}
function ha(e, t, r, s, a) {
  var n = { capture: s, passive: a }, l = da(e, t, r, n);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Hr(() => {
    t.removeEventListener(e, l, n);
  });
}
function Bt(e) {
  for (var t = 0; t < e.length; t++)
    Us.add(e[t]);
  for (var r of Tr)
    r(e);
}
let Qr = null;
function Nt(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], n = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Qr = e;
  var l = 0, u = Qr === e && e.__root;
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
    o <= f && (l = o);
  }
  if (n = /** @type {Element} */
  a[l] || e.target, n !== t) {
    fn(e, "currentTarget", {
      configurable: !0,
      get() {
        return n || r;
      }
    });
    var v = q, g = J;
    ge(null), $e(null);
    try {
      for (var _, p = []; n !== null; ) {
        var E = n.assignedSlot || n.parentNode || /** @type {any} */
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
        if (e.cancelBubble || E === t || E === null)
          break;
        n = E;
      }
      if (_) {
        for (let d of p)
          queueMicrotask(() => {
            throw d;
          });
        throw _;
      }
    } finally {
      e.__root = t, delete e.currentTarget, ge(v), $e(g);
    }
  }
}
function _a(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function sr(e, t) {
  var r = (
    /** @type {Effect} */
    J
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function N(e, t) {
  var r = (t & Nn) !== 0, s = (t & On) !== 0, a, n = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = _a(n ? e : "<!>" + e), r || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ er(a)));
    var l = (
      /** @type {TemplateNode} */
      s || Ms ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ er(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      sr(u, o);
    } else
      sr(l, l);
    return l;
  };
}
function pa(e = "") {
  {
    var t = Ue(e + "");
    return sr(t, t), t;
  }
}
function $r() {
  var e = document.createDocumentFragment(), t = document.createComment(""), r = Ue();
  return e.append(t, r), sr(t, r), e;
}
function P(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function I(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ??= e.nodeValue) && (e.__t = r, e.nodeValue = r + "");
}
function ga(e, t) {
  return ma(e, t);
}
const gt = /* @__PURE__ */ new Map();
function ma(e, { target: t, anchor: r, props: s = {}, events: a, context: n, intro: l = !0 }) {
  Qn();
  var u = /* @__PURE__ */ new Set(), o = (g) => {
    for (var _ = 0; _ < g.length; _++) {
      var p = g[_];
      if (!u.has(p)) {
        u.add(p);
        var E = va(p);
        t.addEventListener(p, Nt, { passive: E });
        var b = gt.get(p);
        b === void 0 ? (document.addEventListener(p, Nt, { passive: E }), gt.set(p, 1)) : gt.set(p, b + 1);
      }
    }
  };
  o(nr(Us)), Tr.add(o);
  var f = void 0, v = na(() => {
    var g = r ?? t.appendChild(Ue());
    return Un(
      /** @type {TemplateNode} */
      g,
      {
        pending: () => {
        }
      },
      (_) => {
        if (n) {
          tt({});
          var p = (
            /** @type {ComponentContext} */
            Me
          );
          p.c = n;
        }
        a && (s.$$events = a), f = e(_, s) || {}, n && rt();
      }
    ), () => {
      for (var _ of u) {
        t.removeEventListener(_, Nt);
        var p = (
          /** @type {number} */
          gt.get(_)
        );
        --p === 0 ? (document.removeEventListener(_, Nt), gt.delete(_)) : gt.set(_, p);
      }
      Tr.delete(o), g !== r && g.parentNode?.removeChild(g);
    };
  });
  return ba.set(f, v), f;
}
let ba = /* @__PURE__ */ new WeakMap();
class Bs {
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
      U
    );
    if (this.#e.has(t)) {
      var r = (
        /** @type {Key} */
        this.#e.get(t)
      ), s = this.#t.get(r);
      if (s)
        jr(s), this.#r.delete(r);
      else {
        var a = this.#s.get(r);
        a && (this.#t.set(r, a.effect), this.#s.delete(r), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
      }
      for (const [n, l] of this.#e) {
        if (this.#e.delete(n), n === t)
          break;
        const u = this.#s.get(l);
        u && (me(u.effect), this.#s.delete(l));
      }
      for (const [n, l] of this.#t) {
        if (n === r || this.#r.has(n)) continue;
        const u = () => {
          if (Array.from(this.#e.values()).includes(n)) {
            var f = document.createDocumentFragment();
            Rs(l, f), f.append(Ue()), this.#s.set(n, { effect: l, fragment: f });
          } else
            me(l);
          this.#r.delete(n), this.#t.delete(n);
        };
        this.#o || !s ? (this.#r.add(n), ut(l, u, !1)) : u();
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
      r.includes(s) || (me(a.effect), this.#s.delete(s));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, r) {
    var s = (
      /** @type {Batch} */
      U
    ), a = Es();
    if (r && !this.#t.has(t) && !this.#s.has(t))
      if (a) {
        var n = document.createDocumentFragment(), l = Ue();
        n.append(l), this.#s.set(t, {
          effect: Te(() => r(l)),
          fragment: n
        });
      } else
        this.#t.set(
          t,
          Te(() => r(this.anchor))
        );
    if (this.#e.set(s, t), a) {
      for (const [u, o] of this.#t)
        u === t ? s.skipped_effects.delete(o) : s.skipped_effects.add(o);
      for (const [u, o] of this.#s)
        u === t ? s.skipped_effects.delete(o.effect) : s.skipped_effects.add(o.effect);
      s.oncommit(this.#a), s.ondiscard(this.#n);
    } else
      this.#a();
  }
}
function ae(e, t, r = !1) {
  var s = new Bs(e), a = r ? vt : 0;
  function n(l, u) {
    s.ensure(l, u);
  }
  fr(() => {
    var l = !1;
    t((u, o = !0) => {
      l = !0, n(o, u);
    }), l || n(!1, null);
  }, a);
}
function Oe(e, t) {
  return t;
}
function wa(e, t, r) {
  for (var s = [], a = t.length, n, l = t.length, u = 0; u < a; u++) {
    let g = t[u];
    ut(
      g,
      () => {
        if (n) {
          if (n.pending.delete(g), n.done.add(g), n.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Ar(nr(n.done)), _.delete(n), _.size === 0 && (e.outrogroups = null);
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
      ), v = (
        /** @type {Element} */
        f.parentNode
      );
      ea(v), v.append(f), e.items.clear();
    }
    Ar(t, !o);
  } else
    n = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(n);
}
function Ar(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    me(e[r], t);
}
var es;
function Re(e, t, r, s, a, n = null) {
  var l = e, u = /* @__PURE__ */ new Map(), o = (t & fs) !== 0;
  if (o) {
    var f = (
      /** @type {Element} */
      e
    );
    l = f.appendChild(Ue());
  }
  var v = null, g = /* @__PURE__ */ Yr(() => {
    var y = r();
    return Fr(y) ? y : y == null ? [] : nr(y);
  }), _, p = !0;
  function E() {
    d.fallback = v, ya(d, _, l, t, s), v !== null && (_.length === 0 ? (v.f & ze) === 0 ? jr(v) : (v.f ^= ze, Ot(v, null, l)) : ut(v, () => {
      v = null;
    }));
  }
  var b = fr(() => {
    _ = /** @type {V[]} */
    i(g);
    for (var y = _.length, O = /* @__PURE__ */ new Set(), F = (
      /** @type {Batch} */
      U
    ), C = Es(), R = 0; R < y; R += 1) {
      var z = _[R], K = s(z, R), T = p ? null : u.get(K);
      T ? (T.v && Mt(T.v, z), T.i && Mt(T.i, R), C && F.skipped_effects.delete(T.e)) : (T = xa(
        u,
        p ? l : es ??= Ue(),
        z,
        K,
        R,
        a,
        t,
        r
      ), p || (T.e.f |= ze), u.set(K, T)), O.add(K);
    }
    if (y === 0 && n && !v && (p ? v = Te(() => n(l)) : (v = Te(() => n(es ??= Ue())), v.f |= ze)), !p)
      if (C) {
        for (const [B, k] of u)
          O.has(B) || F.skipped_effects.add(k.e);
        F.oncommit(E), F.ondiscard(() => {
        });
      } else
        E();
    i(g);
  }), d = { effect: b, items: u, outrogroups: null, fallback: v };
  p = !1;
}
function ya(e, t, r, s, a) {
  var n = (s & Pn) !== 0, l = t.length, u = e.items, o = e.effect.first, f, v = null, g, _ = [], p = [], E, b, d, y;
  if (n)
    for (y = 0; y < l; y += 1)
      E = t[y], b = a(E, y), d = /** @type {EachItem} */
      u.get(b).e, (d.f & ze) === 0 && (d.nodes?.a?.measure(), (g ??= /* @__PURE__ */ new Set()).add(d));
  for (y = 0; y < l; y += 1) {
    if (E = t[y], b = a(E, y), d = /** @type {EachItem} */
    u.get(b).e, e.outrogroups !== null)
      for (const k of e.outrogroups)
        k.pending.delete(d), k.done.delete(d);
    if ((d.f & ze) !== 0)
      if (d.f ^= ze, d === o)
        Ot(d, null, r);
      else {
        var O = v ? v.next : o;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), Ke(e, v, d), Ke(e, d, O), Ot(d, O, r), v = d, _ = [], p = [], o = v.next;
        continue;
      }
    if ((d.f & ye) !== 0 && (jr(d), n && (d.nodes?.a?.unfix(), (g ??= /* @__PURE__ */ new Set()).delete(d))), d !== o) {
      if (f !== void 0 && f.has(d)) {
        if (_.length < p.length) {
          var F = p[0], C;
          v = F.prev;
          var R = _[0], z = _[_.length - 1];
          for (C = 0; C < _.length; C += 1)
            Ot(_[C], F, r);
          for (C = 0; C < p.length; C += 1)
            f.delete(p[C]);
          Ke(e, R.prev, z.next), Ke(e, v, R), Ke(e, z, F), o = F, v = z, y -= 1, _ = [], p = [];
        } else
          f.delete(d), Ot(d, o, r), Ke(e, d.prev, d.next), Ke(e, d, v === null ? e.effect.first : v.next), Ke(e, v, d), v = d;
        continue;
      }
      for (_ = [], p = []; o !== null && o !== d; )
        (f ??= /* @__PURE__ */ new Set()).add(o), p.push(o), o = o.next;
      if (o === null)
        continue;
    }
    (d.f & ze) === 0 && _.push(d), v = d, o = d.next;
  }
  if (e.outrogroups !== null) {
    for (const k of e.outrogroups)
      k.pending.size === 0 && (Ar(nr(k.done)), e.outrogroups?.delete(k));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || f !== void 0) {
    var K = [];
    if (f !== void 0)
      for (d of f)
        (d.f & ye) === 0 && K.push(d);
    for (; o !== null; )
      (o.f & ye) === 0 && o !== e.fallback && K.push(o), o = o.next;
    var T = K.length;
    if (T > 0) {
      var B = (s & fs) !== 0 && l === 0 ? r : null;
      if (n) {
        for (y = 0; y < T; y += 1)
          K[y].nodes?.a?.measure();
        for (y = 0; y < T; y += 1)
          K[y].nodes?.a?.fix();
      }
      wa(e, K, B);
    }
  }
  n && Et(() => {
    if (g !== void 0)
      for (d of g)
        d.nodes?.a?.apply();
  });
}
function xa(e, t, r, s, a, n, l, u) {
  var o = (l & An) !== 0 ? (l & In) === 0 ? /* @__PURE__ */ Kn(r, !1, !1) : _t(r) : null, f = (l & Fn) !== 0 ? _t(a) : null;
  return {
    v: o,
    i: f,
    e: Te(() => (n(t, o ?? r, f ?? a, u), () => {
      e.delete(s);
    }))
  };
}
function Ot(e, t, r) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, n = t && (t.f & ze) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; s !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ qt(s)
      );
      if (n.before(s), s === a)
        return;
      s = l;
    }
}
function Ke(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
function Ma(e, t, r) {
  var s = new Bs(e);
  fr(() => {
    var a = t() ?? null;
    s.ensure(a, a && ((n) => r(n, a)));
  }, vt);
}
const ts = [...` 	
\r\f \v\uFEFF`];
function Sa(e, t, r) {
  var s = e == null ? "" : "" + e;
  if (t && (s = s ? s + " " + t : t), r) {
    for (var a in r)
      if (r[a])
        s = s ? s + " " + a : a;
      else if (s.length)
        for (var n = a.length, l = 0; (l = s.indexOf(a, l)) >= 0; ) {
          var u = l + n;
          (l === 0 || ts.includes(s[l - 1])) && (u === s.length || ts.includes(s[u])) ? s = (l === 0 ? "" : s.substring(0, l)) + s.substring(u + 1) : l = u;
        }
  }
  return s === "" ? null : s;
}
function ka(e, t) {
  return e == null ? null : String(e);
}
function et(e, t, r, s, a, n) {
  var l = e.__className;
  if (l !== r || l === void 0) {
    var u = Sa(r, s, n);
    u == null ? e.removeAttribute("class") : e.className = u, e.__className = r;
  } else if (n && a !== n)
    for (var o in n) {
      var f = !!n[o];
      (a == null || f !== !!a[o]) && e.classList.toggle(o, f);
    }
  return n;
}
function rs(e, t, r, s) {
  var a = e.__style;
  if (a !== t) {
    var n = ka(t);
    n == null ? e.removeAttribute("style") : e.style.cssText = n, e.__style = t;
  }
  return s;
}
function Js(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Fr(t))
      return Yn();
    for (var s of e.options)
      s.selected = t.includes(Lt(s));
    return;
  }
  for (s of e.options) {
    var a = Lt(s);
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
  }), Hr(() => {
    t.disconnect();
  });
}
function Da(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet(), a = !0;
  Lr(e, "change", (n) => {
    var l = n ? "[selected]" : ":checked", u;
    if (e.multiple)
      u = [].map.call(e.querySelectorAll(l), Lt);
    else {
      var o = e.querySelector(l) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      u = o && Lt(o);
    }
    r(u), U !== null && s.add(U);
  }), As(() => {
    var n = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        Rt ?? U
      );
      if (s.has(l))
        return;
    }
    if (Js(e, n, a), a && n === void 0) {
      var u = e.querySelector(":checked");
      u !== null && (n = Lt(u), r(n));
    }
    e.__value = n, a = !1;
  }), Ea(e);
}
function Lt(e) {
  return "__value" in e ? e.__value : e.value;
}
const Ta = /* @__PURE__ */ Symbol("is custom element"), Aa = /* @__PURE__ */ Symbol("is html");
function _e(e, t, r, s) {
  var a = Fa(e);
  a[t] !== (a[t] = r) && (t === "loading" && (e[mn] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Pa(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Fa(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [Ta]: e.nodeName.includes("-"),
      [Aa]: e.namespaceURI === Rn
    }
  );
}
var ss = /* @__PURE__ */ new Map();
function Pa(e) {
  var t = e.getAttribute("is") || e.nodeName, r = ss.get(t);
  if (r) return r;
  ss.set(t, r = []);
  for (var s, a = e, n = Element.prototype; n !== a; ) {
    s = cn(a);
    for (var l in s)
      s[l].set && r.push(l);
    a = is(a);
  }
  return r;
}
function Wt(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet();
  Lr(e, "input", async (a) => {
    var n = a ? e.defaultValue : e.value;
    if (n = br(e) ? wr(n) : n, r(n), U !== null && s.add(U), await $s(), n !== (n = t())) {
      var l = e.selectionStart, u = e.selectionEnd, o = e.value.length;
      if (e.value = n ?? "", u !== null) {
        var f = e.value.length;
        l === u && u === o && f > o ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = l, e.selectionEnd = Math.min(u, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Ut(t) == null && e.value && (r(br(e) ? wr(e.value) : e.value), U !== null && s.add(U)), ur(() => {
    var a = t();
    if (e === document.activeElement) {
      var n = (
        /** @type {Batch} */
        Rt ?? U
      );
      if (s.has(n))
        return;
    }
    br(e) && a === wr(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
function Ia(e, t, r = t) {
  Lr(e, "change", (s) => {
    var a = s ? e.defaultChecked : e.checked;
    r(a);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  // If defaultChecked is set, then checked == defaultChecked
  Ut(t) == null && r(e.checked), ur(() => {
    var s = t();
    e.checked = !!s;
  });
}
function br(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function wr(e) {
  return e === "" ? null : +e;
}
function ns(e, t) {
  return e === t || e?.[ot] === t;
}
function mt(e = {}, t, r, s) {
  return As(() => {
    var a, n;
    return ur(() => {
      a = n, n = [], Ut(() => {
        e !== r(...n) && (t(e, ...n), a && ns(r(...a), e) && t(null, ...a));
      });
    }), () => {
      Et(() => {
        n && ns(r(...n), e) && t(null, ...n);
      });
    };
  }), e;
}
const Na = {
  get(e, t) {
    let r = e.props.length;
    for (; r--; ) {
      let s = e.props[r];
      if (It(s) && (s = s()), typeof s == "object" && s !== null && t in s) return s[t];
    }
  },
  set(e, t, r) {
    let s = e.props.length;
    for (; s--; ) {
      let a = e.props[s];
      It(a) && (a = a());
      const n = lt(a, t);
      if (n && n.set)
        return n.set(r), !0;
    }
    return !1;
  },
  getOwnPropertyDescriptor(e, t) {
    let r = e.props.length;
    for (; r--; ) {
      let s = e.props[r];
      if (It(s) && (s = s()), typeof s == "object" && s !== null && t in s) {
        const a = lt(s, t);
        return a && !a.configurable && (a.configurable = !0), a;
      }
    }
  },
  has(e, t) {
    if (t === ot || t === gn) return !1;
    for (let r of e.props)
      if (It(r) && (r = r()), r != null && t in r) return !0;
    return !1;
  },
  ownKeys(e) {
    const t = [];
    for (let r of e.props)
      if (It(r) && (r = r()), !!r) {
        for (const s in r)
          t.includes(s) || t.push(s);
        for (const s of Object.getOwnPropertySymbols(r))
          t.includes(s) || t.push(s);
      }
    return t;
  }
};
function Oa(...e) {
  return new Proxy({ props: e }, Na);
}
function Xs(e, t, r, s) {
  var a = (
    /** @type {V} */
    s
  ), n = !0, l = () => (n && (n = !1, a = /** @type {V} */
  s), a), u;
  u = /** @type {V} */
  e[t], u === void 0 && s !== void 0 && (u = l());
  var o;
  return o = () => {
    var f = (
      /** @type {V} */
      e[t]
    );
    return f === void 0 ? l() : (n = !0, f);
  }, o;
}
function Tt(e) {
  Me === null && bn(), Ds(() => {
    const t = Ut(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Ra = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Ra);
function Ya(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var yr = { exports: {} }, as;
function Ca() {
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
      function a(b, d, y) {
        var O = b || r, F = d || 0, C = y || !1, R = 0, z;
        function K(k, w) {
          var M;
          if (w) {
            if (M = w.getTime(), C) {
              var x = v(w);
              if (w = new Date(M + x + F), v(w) !== x) {
                var m = v(w);
                w = new Date(M + m + F);
              }
            }
          } else {
            var j = Date.now();
            j > R ? (R = j, z = new Date(R), M = R, C && (z = new Date(R + v(z) + F))) : M = R, w = z;
          }
          return T(k, w, O, M);
        }
        function T(k, w, M, j) {
          for (var x = "", m = null, S = !1, Y = k.length, G = !1, A = 0; A < Y; A++) {
            var $ = k.charCodeAt(A);
            if (S === !0) {
              if ($ === 45) {
                m = "";
                continue;
              } else if ($ === 95) {
                m = " ";
                continue;
              } else if ($ === 48) {
                m = "0";
                continue;
              } else if ($ === 58) {
                G && E("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), G = !0;
                continue;
              }
              switch ($) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  x += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  x += M.days[w.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  x += M.months[w.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  x += n(Math.floor(w.getFullYear() / 100), m);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  x += T(M.formats.D, w, M, j);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  x += T(M.formats.F, w, M, j);
                  break;
                // '00'
                // case 'H':
                case 72:
                  x += n(w.getHours(), m);
                  break;
                // '12'
                // case 'I':
                case 73:
                  x += n(u(w.getHours()), m);
                  break;
                // '000'
                // case 'L':
                case 76:
                  x += l(Math.floor(j % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  x += n(w.getMinutes(), m);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  x += w.getHours() < 12 ? M.am : M.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  x += T(M.formats.R, w, M, j);
                  break;
                // '00'
                // case 'S':
                case 83:
                  x += n(w.getSeconds(), m);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  x += T(M.formats.T, w, M, j);
                  break;
                // '00'
                // case 'U':
                case 85:
                  x += n(o(w, "sunday"), m);
                  break;
                // '00'
                // case 'W':
                case 87:
                  x += n(o(w, "monday"), m);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  x += T(M.formats.X, w, M, j);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  x += w.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (C && F === 0)
                    x += "GMT";
                  else {
                    var re = g(w);
                    x += re || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  x += M.shortDays[w.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  x += M.shortMonths[w.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  x += T(M.formats.c, w, M, j);
                  break;
                // '01'
                // case 'd':
                case 100:
                  x += n(w.getDate(), m);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  x += n(w.getDate(), m ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  x += M.shortMonths[w.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var W = new Date(w.getFullYear(), 0, 1), X = Math.ceil((w.getTime() - W.getTime()) / (1e3 * 60 * 60 * 24));
                  x += l(X);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  x += n(w.getHours(), m ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  x += n(u(w.getHours()), m ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  x += n(w.getMonth() + 1, m);
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
                  var X = w.getDate();
                  M.ordinalSuffixes ? x += String(X) + (M.ordinalSuffixes[X - 1] || f(X)) : x += String(X) + f(X);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  x += w.getHours() < 12 ? M.AM : M.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  x += T(M.formats.r, w, M, j);
                  break;
                // '0'
                // case 's':
                case 115:
                  x += Math.floor(j / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  x += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var X = w.getDay();
                  x += X === 0 ? 7 : X;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  x += T(M.formats.v, w, M, j);
                  break;
                // '4'
                // case 'w':
                case 119:
                  x += w.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  x += T(M.formats.x, w, M, j);
                  break;
                // '70'
                // case 'y':
                case 121:
                  x += n(w.getFullYear() % 100, m);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (C && F === 0)
                    x += G ? "+00:00" : "+0000";
                  else {
                    var V;
                    F !== 0 ? V = F / (60 * 1e3) : V = -w.getTimezoneOffset();
                    var ee = V < 0 ? "-" : "+", le = G ? ":" : "", se = Math.floor(Math.abs(V / 60)), ne = Math.abs(V % 60);
                    x += ee + n(se) + le + n(ne);
                  }
                  break;
                default:
                  S && (x += "%"), x += k[A];
                  break;
              }
              m = null, S = !1;
              continue;
            }
            if ($ === 37) {
              S = !0;
              continue;
            }
            x += k[A];
          }
          return x;
        }
        var B = K;
        return B.localize = function(k) {
          return new a(k || O, F, C);
        }, B.localizeByIdentifier = function(k) {
          var w = t[k];
          return w ? B.localize(w) : (E('[WARNING] No locale found with identifier "' + k + '".'), B);
        }, B.timezone = function(k) {
          var w = F, M = C, j = typeof k;
          if (j === "number" || j === "string")
            if (M = !0, j === "string") {
              var x = k[0] === "-" ? -1 : 1, m = parseInt(k.slice(1, 3), 10), S = parseInt(k.slice(3, 5), 10);
              w = x * (60 * m + S) * 60 * 1e3;
            } else j === "number" && (w = k * 60 * 1e3);
          return new a(O, w, M);
        }, B.utc = function() {
          return new a(O, F, !0);
        }, B;
      }
      function n(b, d) {
        return d === "" || b > 9 ? "" + b : (d == null && (d = "0"), d + b);
      }
      function l(b) {
        return b > 99 ? b : b > 9 ? "0" + b : "00" + b;
      }
      function u(b) {
        return b === 0 ? 12 : b > 12 ? b - 12 : b;
      }
      function o(b, d) {
        d = d || "sunday";
        var y = b.getDay();
        d === "monday" && (y === 0 ? y = 6 : y--);
        var O = Date.UTC(b.getFullYear(), 0, 1), F = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()), C = Math.floor((F - O) / 864e5), R = (C + 7 - y) / 7;
        return Math.floor(R);
      }
      function f(b) {
        var d = b % 10, y = b % 100;
        if (y >= 11 && y <= 13 || d === 0 || d >= 4)
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
      function v(b) {
        return (b.getTimezoneOffset() || 0) * 6e4;
      }
      function g(b, d) {
        return _() || p(b);
      }
      function _(b, d) {
        return null;
      }
      function p(b) {
        var d = b.toString().match(/\(([\w\s]+)\)/);
        return d && d[1];
      }
      function E(b) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(b);
      }
    })();
  })(yr)), yr.exports;
}
var La = Ca();
const wt = /* @__PURE__ */ Ya(La);
let xr = /* @__PURE__ */ H(!1);
class Ha {
  constructor(t) {
    if (this.sk = "", this.fetchFn = t || (typeof window < "u" ? fetch.bind(window) : fetch), typeof document < "u") {
      const r = document.querySelector('meta[name="csrf-token"]');
      r && (this.sk = r.content);
    }
  }
  get loading() {
    return i(xr);
  }
  async request(t, r = {}) {
    D(xr, !0);
    try {
      const s = new URL(t, window.location.origin);
      r.params && Object.entries(r.params).forEach(([u, o]) => {
        s.searchParams.append(u, String(o));
      });
      const a = new Headers(r.headers || {});
      a.set("X-Requested-With", "fetch");
      let n = r.body;
      r.method && ["POST", "PUT", "PATCH", "DELETE"].includes(r.method.toUpperCase()) && (n instanceof FormData ? n.set("sk", this.sk) : n instanceof BodyInit);
      const l = await this.fetchFn(s.toString(), { ...r, headers: a, body: n });
      if (!l.ok)
        throw new Error(`API Error: ${l.status} ${l.statusText}`);
      return await l.json();
    } finally {
      D(xr, !1);
    }
  }
  get(t, r) {
    return this.request(t, { method: "GET", params: r });
  }
  post(t, r) {
    return this.request(t, { method: "POST", body: r });
  }
}
const te = new Ha(), ja = (e, t = ar) => {
  var r = $a(), s = c(r);
  Z(() => {
    et(r, 1, `status status-${t() ?? ""}`, "svelte-13s7gu4"), I(s, t());
  }), P(e, r);
};
var $a = /* @__PURE__ */ N("<span> </span>"), qa = /* @__PURE__ */ N('<time class="svelte-13s7gu4"> </time>'), za = /* @__PURE__ */ N('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Ua = /* @__PURE__ */ N('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), Ba = /* @__PURE__ */ N('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Ja = /* @__PURE__ */ N('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), Xa = /* @__PURE__ */ N('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4">エントリ一覧</h2> <div class="search-box svelte-13s7gu4"><input type="text" placeholder="検索..." class="svelte-13s7gu4"/> <button class="svelte-13s7gu4">検索</button></div> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">新しい方へ</button> <button class="svelte-13s7gu4">古い方へ</button></div></div> <div><!></div></div>');
function Va(e, t) {
  tt(t, !0);
  const r = (k, w = ar, M) => {
    let j = /* @__PURE__ */ Yr(() => os(M?.(), !0));
    var x = qa(), m = c(x);
    Z(
      (S) => {
        _e(x, "datetime", w()), I(m, S);
      },
      [() => i(j) && w() ? _(w()) : "-"]
    ), P(k, x);
  };
  let s = /* @__PURE__ */ H(pe([])), a = /* @__PURE__ */ H(!1), n = 50, l = /* @__PURE__ */ H(""), u = /* @__PURE__ */ H(pe([]));
  async function o() {
    try {
      const k = i(u)[i(u).length - 1], w = { limit: n };
      i(l) && (w.q = i(l)), k && (w.cursor_id = k);
      const M = await te.get("/admin/api/entries", w);
      D(s, M.entries || [], !0), D(a, M.has_more || !1, !0);
    } catch (k) {
      console.error(k);
    }
  }
  function f() {
    D(u, [], !0), o();
  }
  Tt(o);
  function v() {
    if (i(a) && i(s).length > 0) {
      const k = i(s)[i(s).length - 1];
      i(u).push(k.id), o();
    }
  }
  function g() {
    i(u).length > 0 && (i(u).pop(), o());
  }
  function _(k) {
    return k ? wt("%Y-%m-%d %H:%M", new Date(k)) : "-";
  }
  var p = Xa(), E = c(p), b = h(c(E), 2), d = c(b);
  d.__keydown = (k) => k.key === "Enter" && f();
  var y = h(d, 2);
  y.__click = f;
  var O = h(b, 2), F = c(O);
  F.__click = g;
  var C = h(F, 2);
  C.__click = v;
  var R = h(E, 2);
  let z;
  var K = c(R);
  {
    var T = (k) => {
      var w = za();
      P(k, w);
    }, B = (k) => {
      var w = Ja(), M = St(w), j = h(c(M));
      Re(j, 21, () => i(s), Oe, (S, Y) => {
        var G = Ua(), A = c(G), $ = c(A), re = h(A), W = c(re), X = h(re), V = c(X);
        ja(V, () => i(Y).status);
        var ee = h(X), le = c(ee), se = c(le), ne = h(le, 2), oe = c(ne), be = c(oe), Se = h(ee), Fe = c(Se), Pe = h(Se), ke = c(Pe);
        r(ke, () => i(Y).created_at);
        var Ce = h(Pe), de = c(Ce);
        r(de, () => i(Y).modified_at);
        var Ie = h(Ce), st = c(Ie);
        r(st, () => i(Y).publish_at?.Time, () => i(Y).publish_at?.Valid);
        var At = h(Ie), nt = c(At);
        nt.__click = () => t.onEdit(i(Y).id), Z(() => {
          I($, i(Y).id), I(W, i(Y).date), I(se, i(Y).title), _e(oe, "href", `/${i(Y).path ?? ""}`), I(be, `/${i(Y).path ?? ""}`), I(Fe, i(Y).format);
        }), P(S, G);
      });
      var x = h(M, 2);
      {
        var m = (S) => {
          var Y = Ba();
          P(S, Y);
        };
        ae(x, (S) => {
          te.loading && S(m);
        });
      }
      P(k, w);
    };
    ae(K, (k) => {
      te.loading && i(s).length === 0 ? k(T) : k(B, !1);
    });
  }
  Z(() => {
    F.disabled = i(u).length === 0 || te.loading, C.disabled = !i(a) || te.loading, z = et(R, 1, "table-container svelte-13s7gu4", null, z, { "is-loading": te.loading });
  }), Wt(d, () => i(l), (k) => D(l, k)), P(e, p), rt();
}
Bt(["keydown", "click"]);
class Ga {
  #e;
  get exists() {
    return i(this.#e);
  }
  set exists(t) {
    D(this.#e, t, !0);
  }
  #t;
  get data() {
    return i(this.#t);
  }
  set data(t) {
    D(this.#t, t, !0);
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
var Ka = /* @__PURE__ */ N('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), Wa = /* @__PURE__ */ N('<option class="svelte-7nstam"> </option>'), Za = /* @__PURE__ */ N('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), Qa = /* @__PURE__ */ N('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), ei = /* @__PURE__ */ N('<button id="restore" type="button" class="submit-button svelte-7nstam">復元...</button>'), ti = /* @__PURE__ */ N('<div role="option" tabindex="-1"> </div>'), ri = /* @__PURE__ */ N('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam"> </button> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons svelte-7nstam"><div class="options svelte-7nstam"><label title="チェックを入れると指定した日時に公開されます（公開済みの記事も予約に戻せます）" class="svelte-7nstam"><input type="checkbox" class="svelte-7nstam"/> 公開を遅延</label> <!></div> <button type="button" class="submit-button svelte-7nstam"> </button> <!></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam" role="listbox" aria-label="タグを選択" tabindex="0"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog>', 1);
function si(e, t) {
  tt(t, !0);
  let r = Xs(t, "id", 3, null);
  const s = new Ga();
  let a = /* @__PURE__ */ H(pe({ id: null, title: "", body: "", status: null })), n = pe({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: "public",
    publishLater: !1,
    publishAt: ""
  }), l = /* @__PURE__ */ H(!1), u = /* @__PURE__ */ H(""), o = /* @__PURE__ */ H(!1), f = /* @__PURE__ */ H(null), v = /* @__PURE__ */ H(null), g = /* @__PURE__ */ H(null), _ = /* @__PURE__ */ H(null), p = /* @__PURE__ */ H(null);
  const E = [
    "tech",
    "photo",
    "redeveloped",
    "stablediffusion",
    "photoshopped"
  ];
  let b = /* @__PURE__ */ H(0);
  async function d(m) {
    try {
      const S = await te.get(`/admin/api/entry/${m}`);
      D(a, S, !0), n.id = S.id, n.title = S.title, n.body = S.body, n.format = S.format || "Hatena", n.status = S.status, n.publishLater = S.status === "scheduled", S.publish_at?.Valid ? n.publishAt = wt("%Y-%m-%dT%H:%M", new Date(S.publish_at.Time)) : n.publishAt = wt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), s.check(i(a).id, { title: n.title, body: n.body });
    } catch (S) {
      console.error(S), alert("エントリの取得に失敗しました");
    }
  }
  Tt(() => {
    r() ? d(r()) : (D(a, { id: null, title: "", body: "", status: "public" }, !0), n.id = null, n.title = "", n.body = "", n.format = "Hatena", n.status = "public", n.publishLater = !1, n.publishAt = wt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), s.check(null, { title: n.title, body: n.body }));
  }), Ds(() => {
    (i(a).title !== n.title || i(a).body !== n.body) && s.saveDebounced(i(a).id, { title: n.title, body: n.body });
  });
  async function y() {
    D(l, !0), D(u, "リクエスト中");
    const m = new FormData();
    if (m.set("id", n.id ? String(n.id) : ""), m.set("title", n.title), m.set("body", n.body), m.set("format", n.format), n.publishLater) {
      const S = new Date(n.publishAt);
      m.set("publish_at", S.toISOString()), m.set("status", "scheduled");
    } else
      m.set("status", "public");
    try {
      const Y = (await te.post("/admin/api/edit", m)).session_id;
      if (!Y)
        throw new Error("保存に失敗しました");
      O(Y);
    } catch (S) {
      D(l, !1), alert(S instanceof Error ? S.message : "エラーが発生しました");
    }
  }
  function O(m) {
    const S = new EventSource(`/admin/api/edit/progress?sid=${m}`);
    S.onmessage = (Y) => {
      const G = JSON.parse(Y.data);
      switch (G.type) {
        case "progress":
          D(u, F(G.message), !0);
          break;
        case "done":
          s.clear(i(a).id), D(u, "完了"), D(l, !1), S.close(), t.onSave(G.location);
          break;
        case "error":
          D(u, "エラー: " + G.message), D(l, !1), S.close(), alert("保存に失敗しました: " + G.message);
          break;
      }
    }, S.onerror = () => {
      D(l, !1), S.close(), alert("通信エラーが発生しました");
    };
  }
  function F(m) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[m] || m;
  }
  function C() {
    D(b, 0), i(g).showModal(), setTimeout(() => i(p)?.focus(), 0);
  }
  function R(m) {
    m.key === "ArrowDown" ? (m.preventDefault(), D(b, (i(b) + 1) % E.length)) : m.key === "ArrowUp" ? (m.preventDefault(), D(b, (i(b) - 1 + E.length) % E.length)) : m.key === "Enter" || m.key === " " ? (m.preventDefault(), z(E[i(b)])) : m.key === "Escape" && i(g).close();
  }
  function z(m) {
    const S = `[${m}]`;
    n.title.includes(S) ? n.title = n.title.replace(S, "") : n.title = S + n.title, i(g).close(), i(f).focus();
  }
  function K() {
    s.data && (n.title = s.data.title, n.body = s.data.body, s.clear(i(a).id), i(_).close());
  }
  async function T() {
    const m = document.createElement("input");
    m.type = "file", m.oninput = async () => {
      if (!m.files?.[0]) return;
      const S = new FormData();
      S.append("file", m.files[0]), D(o, !0);
      try {
        const Y = await te.post("/admin/api/upload/image", S), G = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${Y.uploaded}" class="picasa" itemprop="url"><img src="${Y.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        B(G, !0);
      } catch {
        alert("アップロードに失敗しました");
      } finally {
        D(o, !1);
      }
    }, m.click();
  }
  function B(m, S = !1) {
    const Y = i(v).selectionStart, G = i(v).selectionEnd, A = i(v).value;
    n.body = A.substring(0, Y) + m + A.substring(G), $s().then(() => {
      typeof S == "boolean" && S ? (i(v).selectionStart = Y, i(v).selectionEnd = Y + m.length) : typeof S == "number" ? i(v).selectionStart = i(v).selectionEnd = Y + S : i(v).selectionStart = i(v).selectionEnd = Y + m.length, i(v).focus();
    });
  }
  function k(m) {
    (m.altKey ? "Alt-" : "") + (m.ctrlKey ? "Control-" : "") + (m.metaKey ? "Meta-" : "") + (m.shiftKey ? "Shift-" : "") + m.key === "Control-t" && (B("\\(  \\)", 3), m.preventDefault(), m.stopPropagation());
  }
  var w = $r(), M = St(w);
  {
    var j = (m) => {
      var S = Ka();
      P(m, S);
    }, x = (m) => {
      var S = ri(), Y = St(S), G = c(Y), A = c(G);
      mt(A, (L) => D(f, L), () => i(f));
      var $ = h(A, 2), re = c($);
      re.__click = C;
      var W = h(re, 2);
      W.__click = T;
      var X = c(W), V = h(W, 2);
      Re(V, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], Oe, (L, Q) => {
        var he = Wa(), Ne = c(he), Ge = {};
        Z(() => {
          I(Ne, Q), Ge !== (Ge = Q) && (he.value = (he.__value = Q) ?? "");
        }), P(L, he);
      });
      var ee = h($, 2), le = c(ee);
      le.__keydown = k, mt(le, (L) => D(v, L), () => i(v));
      var se = h(G, 2), ne = c(se);
      {
        var oe = (L) => {
          var Q = Za();
          P(L, Q);
        };
        ae(ne, (L) => {
          i(l) && L(oe);
        });
      }
      var be = h(ne, 2), Se = c(be), Fe = c(Se), Pe = c(Fe), ke = h(Fe, 2);
      {
        var Ce = (L) => {
          var Q = Qa();
          Wt(Q, () => n.publishAt, (he) => n.publishAt = he), P(L, Q);
        };
        ae(ke, (L) => {
          n.publishLater && L(Ce);
        });
      }
      var de = h(Se, 2);
      de.__click = y;
      var Ie = c(de), st = h(de, 2);
      {
        var At = (L) => {
          var Q = ei();
          Q.__click = () => i(_).showModal(), P(L, Q);
        };
        ae(st, (L) => {
          s.exists && L(At);
        });
      }
      var nt = h(Y, 2), at = h(c(nt), 2);
      at.__keydown = R, Re(at, 21, () => E, Oe, (L, Q, he) => {
        var Ne = ti();
        let Ge;
        Ne.__click = () => z(i(Q)), Ne.__keydown = (pr) => pr.key === "Enter" && z(i(Q));
        var _r = c(Ne);
        Z(() => {
          Ge = et(Ne, 1, "tag-item svelte-7nstam", null, Ge, { selected: i(b) === he }), _e(Ne, "aria-selected", i(b) === he), I(_r, i(Q));
        }), ha("mouseenter", Ne, () => D(b, he, !0)), P(L, Ne);
      }), mt(at, (L) => D(p, L), () => i(p));
      var cr = h(at, 2);
      cr.__click = () => i(g).close(), mt(nt, (L) => D(g, L), () => i(g));
      var Jt = h(nt, 2), Xt = h(c(Jt), 2), Vt = c(Xt);
      {
        var vr = (L) => {
          var Q = pa();
          Z((he) => I(Q, he), [() => wt("%Y年%m月%d日%H時", new Date(s.data.time))]), P(L, Q);
        };
        ae(Vt, (L) => {
          s.data?.time && L(vr);
        });
      }
      var dr = h(Xt, 2), Ft = c(dr);
      Ft.__click = () => i(_).close();
      var hr = h(Ft, 2);
      hr.__click = K, mt(Jt, (L) => D(_, L), () => i(_)), Z(() => {
        W.disabled = i(o), I(X, i(o) ? "⌛ アップロード中..." : "📷 写真"), de.disabled = i(l), I(Ie, i(l) ? i(u) || "リクエスト中" : r() ? "更新" : "作成");
      }), Wt(A, () => n.title, (L) => n.title = L), Da(V, () => n.format, (L) => n.format = L), Wt(le, () => n.body, (L) => n.body = L), Ia(Pe, () => n.publishLater, (L) => n.publishLater = L), P(m, S);
    };
    ae(M, (m) => {
      te.loading && !i(a).id ? m(j) : m(x, !1);
    });
  }
  P(e, w), rt();
}
Bt(["click", "keydown"]);
const ni = (e, t = ar) => {
  var r = ai(), s = c(r);
  Z(() => {
    et(r, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), I(s, t());
  }), P(e, r);
};
var ai = /* @__PURE__ */ N("<span> </span>"), ii = /* @__PURE__ */ N('<time class="time svelte-1r6codn"> </time>'), li = /* @__PURE__ */ N('<div class="loading svelte-1r6codn"></div>'), oi = /* @__PURE__ */ N('<div class="error-text svelte-1r6codn"> </div>'), ui = /* @__PURE__ */ N('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><!></td><td class="error svelte-1r6codn"><!></td></tr>'), fi = /* @__PURE__ */ N('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), ci = /* @__PURE__ */ N('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">新しい方へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">古い方へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function vi(e, t) {
  tt(t, !0);
  const r = (T, B = ar, k) => {
    let w = /* @__PURE__ */ Yr(() => os(k?.(), !0));
    var M = ii(), j = c(M);
    Z(
      (x) => {
        _e(M, "datetime", B()), I(j, x);
      },
      [() => i(w) && B() ? v(B()) : "-"]
    ), P(T, M);
  };
  let s = /* @__PURE__ */ H(pe([])), a = /* @__PURE__ */ H(0), n = /* @__PURE__ */ H(0), l = 50;
  async function u() {
    try {
      const T = await te.get("/admin/api/jobs", { limit: l, offset: i(n) });
      D(s, T.jobs || [], !0), D(a, T.total || 0, !0);
    } catch (T) {
      console.error(T);
    }
  }
  Tt(u);
  function o() {
    i(n) + l < i(a) && (D(n, i(n) + l), u());
  }
  function f() {
    i(n) - l >= 0 && (D(n, i(n) - l), u());
  }
  function v(T) {
    return wt("%Y-%m-%d %H:%M:%S", new Date(T));
  }
  var g = ci(), _ = c(g), p = c(_), E = c(p), b = h(p, 2), d = c(b);
  d.__click = f;
  var y = h(d, 2), O = c(y), F = h(y, 2);
  F.__click = o;
  var C = h(F, 2);
  C.__click = u;
  var R = h(_, 2);
  {
    var z = (T) => {
      var B = li();
      P(T, B);
    }, K = (T) => {
      var B = fi(), k = h(c(B));
      Re(k, 21, () => i(s), Oe, (w, M) => {
        var j = ui(), x = c(j), m = c(x), S = h(x), Y = c(S), G = c(Y), A = h(S), $ = c(A);
        ni($, () => i(M).status);
        var re = h(A), W = c(re), X = h(re), V = c(X);
        r(V, () => i(M).created_at);
        var ee = h(X), le = c(ee);
        {
          var se = (ne) => {
            var oe = oi(), be = c(oe);
            Z(() => {
              _e(oe, "title", i(M).error_message.String), I(be, i(M).error_message.String);
            }), P(ne, oe);
          };
          ae(le, (ne) => {
            i(M).error_message?.Valid && ne(se);
          });
        }
        Z(() => {
          I(m, i(M).id), I(G, i(M).job_type_name), I(W, i(M).retry_count);
        }), P(w, j);
      }), P(T, B);
    };
    ae(R, (T) => {
      te.loading && i(s).length === 0 ? T(z) : T(K, !1);
    });
  }
  Z(
    (T) => {
      I(E, `ジョブ一覧 (${i(a) ?? ""})`), d.disabled = i(n) === 0 || te.loading, I(O, `${i(n) + 1} - ${T ?? ""} / ${i(a) ?? ""}`), F.disabled = i(n) + l >= i(a) || te.loading;
    },
    [() => Math.min(i(n) + l, i(a))]
  ), P(e, g), rt();
}
Bt(["click"]);
var di = /* @__PURE__ */ N('<div class="empty svelte-wpgtu6">No Signature</div>'), hi = /* @__PURE__ */ N("<div></div>"), _i = /* @__PURE__ */ N('<div class="row svelte-wpgtu6"></div>'), pi = /* @__PURE__ */ N('<div class="chroma-section svelte-wpgtu6"></div>'), gi = /* @__PURE__ */ N('<div class="chroma-sections svelte-wpgtu6"></div>'), mi = /* @__PURE__ */ N('<div class="color-bitmask svelte-wpgtu6"><!></div>');
function Mr(e, t) {
  tt(t, !0);
  let r = Xs(t, "size", 3, 64), s = /* @__PURE__ */ Qt(() => {
    if (!t.sig) return new Array(64).fill(!1);
    try {
      const v = atob(t.sig), g = new Uint8Array(v.length);
      for (let p = 0; p < v.length; p++)
        g[p] = v.charCodeAt(p);
      const _ = [];
      for (let p = 0; p < 8; p++) {
        const E = g[p];
        for (let b = 7; b >= 0; b--)
          _.push((E >> b & 1) === 1);
      }
      return _.reverse();
    } catch (v) {
      return console.error("Failed to decode sig:", v), new Array(64).fill(!1);
    }
  });
  function a(v) {
    const g = v >> 5 & 1, _ = v >> 4 & 1, p = v >> 3 & 1, E = v >> 2 & 1, b = v >> 1 & 1, d = v & 1, y = _ << 1 | E, O = g << 2 | p << 1 | b, F = d, C = [25, 45, 65, 85][y], R = F === 0 ? 0.01 : 0.15, z = O * 45;
    return `oklch(${C}% ${R} ${z})`;
  }
  function n(v, g, _) {
    const p = v >> 1 & 1, E = v & 1, b = g >> 2 & 1, d = g >> 1 & 1, y = g & 1, O = _ & 1;
    return b << 5 | p << 4 | d << 3 | E << 2 | y << 1 | O;
  }
  var l = mi(), u = c(l);
  {
    var o = (v) => {
      var g = di();
      P(v, g);
    }, f = (v) => {
      var g = gi();
      Re(g, 20, () => [1, 0], Oe, (_, p) => {
        var E = pi();
        Re(E, 20, () => [3, 2, 1, 0], Oe, (b, d) => {
          var y = _i();
          Re(y, 20, () => [0, 1, 2, 3, 4, 5, 6, 7], Oe, (O, F) => {
            const C = /* @__PURE__ */ Qt(() => n(d, F, p));
            var R = hi();
            let z;
            Z(
              (K) => {
                z = et(R, 1, "bit svelte-wpgtu6", null, z, { active: i(s)[i(C)] }), rs(R, `background-color: ${K ?? ""}`), _e(R, "title", `L=${d ?? ""} H=${F * 45} C=${p ?? ""}`);
              },
              [() => a(i(C))]
            ), P(O, R);
          }), P(b, y);
        }), Z(() => _e(E, "title", p === 1 ? "Vivid Colors" : "Muted Colors")), P(_, E);
      }), P(v, g);
    };
    ae(u, (v) => {
      t.sig ? v(f, !1) : v(o);
    });
  }
  Z(() => rs(l, `--size: ${r() ?? ""}px`)), P(e, l), rt();
}
var bi = /* @__PURE__ */ N('<div class="loading svelte-xxb0sp">読み込み中...</div>'), wi = /* @__PURE__ */ N('<button class="indexed-icon svelte-xxb0sp" title="類似画像を検索">🔍</button>'), yi = /* @__PURE__ */ N('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/> <!></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), xi = /* @__PURE__ */ N('<div class="grid svelte-xxb0sp"></div>'), Mi = /* @__PURE__ */ N('<div class="selected-compare svelte-xxb0sp"><div class="image-item target svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div>Selected Image</div></div></div> <div class="arrow svelte-xxb0sp">→</div></div>'), Si = /* @__PURE__ */ N('<div class="loading svelte-xxb0sp">検索中...</div>'), ki = /* @__PURE__ */ N("<p>類似画像は見つかりませんでした。</p>"), Ei = /* @__PURE__ */ N('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), Di = /* @__PURE__ */ N('<div class="grid similar-grid svelte-xxb0sp"></div>'), Ti = /* @__PURE__ */ N('<div class="image-list svelte-xxb0sp"><div class="header svelte-xxb0sp"><h2> </h2> <div class="pagination svelte-xxb0sp"><button>前へ</button> <span> </span> <button>次へ</button></div></div> <!></div> <dialog id="similarDialog" class="svelte-xxb0sp"><div class="dialog-header svelte-xxb0sp"><h3 class="svelte-xxb0sp">類似画像一覧</h3> <button type="button" class="close-btn svelte-xxb0sp">×</button></div> <div class="dialog-content svelte-xxb0sp"><!> <!></div></dialog>', 1);
function Ai(e, t) {
  tt(t, !0);
  let r = /* @__PURE__ */ H(pe([])), s = /* @__PURE__ */ H(0), a = 20, n = /* @__PURE__ */ H(0), l = /* @__PURE__ */ H(pe([])), u = /* @__PURE__ */ H(null), o = /* @__PURE__ */ H(null);
  async function f() {
    try {
      const A = await te.get(`/admin/api/images?limit=${a}&offset=${i(s)}`);
      D(r, A.images || [], !0), D(n, A.total || 0, !0);
    } catch (A) {
      console.error(A);
    }
  }
  async function v(A) {
    D(u, A, !0), D(l, [], !0), i(o).showModal();
    try {
      const $ = await te.get(`/admin/api/image/${A.id}/similar`);
      D(l, $.similar || [], !0);
    } catch ($) {
      console.error($);
    }
  }
  Tt(f);
  function g() {
    i(s) + a < i(n) && (D(s, i(s) + a), f());
  }
  function _() {
    i(s) - a >= 0 && (D(s, i(s) - a), f());
  }
  var p = Ti(), E = St(p), b = c(E), d = c(b), y = c(d), O = h(d, 2), F = c(O);
  F.__click = _;
  var C = h(F, 2), R = c(C), z = h(C, 2);
  z.__click = g;
  var K = h(b, 2);
  {
    var T = (A) => {
      var $ = bi();
      P(A, $);
    }, B = (A) => {
      var $ = xi();
      Re($, 21, () => i(r), Oe, (re, W) => {
        var X = yi(), V = c(X), ee = c(V), le = h(ee, 2);
        {
          var se = (de) => {
            var Ie = wi();
            Ie.__click = () => v(i(W)), P(de, Ie);
          };
          ae(le, (de) => {
            i(W).sig?.length > 0 && de(se);
          });
        }
        var ne = h(V, 2), oe = c(ne);
        Mr(oe, {
          get sig() {
            return i(W).sig;
          }
        });
        var be = h(oe, 2), Se = c(be), Fe = h(c(Se)), Pe = c(Fe), ke = h(be, 2), Ce = c(ke);
        Z(() => {
          _e(ee, "src", i(W).uri), _e(Se, "href", `/admin/edit?id=${i(W).entry_id ?? ""}`), I(Pe, i(W).entry_id), I(Ce, `ID: ${i(W).id ?? ""}`);
        }), P(re, X);
      }), P(A, $);
    };
    ae(K, (A) => {
      te.loading && i(r).length === 0 ? A(T) : A(B, !1);
    });
  }
  var k = h(E, 2), w = c(k), M = h(c(w), 2);
  M.__click = () => i(o).close();
  var j = h(w, 2), x = c(j);
  {
    var m = (A) => {
      var $ = Mi(), re = c($), W = c(re), X = c(W), V = h(W, 2), ee = c(V);
      Mr(ee, {
        get sig() {
          return i(u).sig;
        }
      }), Z(() => _e(X, "src", i(u).uri)), P(A, $);
    };
    ae(x, (A) => {
      i(u) && A(m);
    });
  }
  var S = h(x, 2);
  {
    var Y = (A) => {
      var $ = Si();
      P(A, $);
    }, G = (A) => {
      var $ = $r(), re = St($);
      {
        var W = (V) => {
          var ee = ki();
          P(V, ee);
        }, X = (V) => {
          var ee = Di();
          Re(ee, 21, () => i(l), Oe, (le, se) => {
            var ne = Ei(), oe = c(ne), be = c(oe), Se = h(oe, 2), Fe = c(Se);
            Mr(Fe, {
              get sig() {
                return i(se).sig;
              }
            });
            var Pe = h(Fe, 2), ke = c(Pe);
            ke.__click = () => i(o).close();
            var Ce = h(c(ke)), de = c(Ce), Ie = h(Pe, 2), st = c(Ie);
            Z(() => {
              _e(be, "src", i(se).uri), _e(ke, "href", `/admin/edit?id=${i(se).entry_id ?? ""}`), I(de, i(se).entry_id), I(st, `ID: ${i(se).id ?? ""} / Score: ${i(se).score ?? ""}`);
            }), P(le, ne);
          }), P(V, ee);
        };
        ae(
          re,
          (V) => {
            i(l).length === 0 ? V(W) : V(X, !1);
          },
          !0
        );
      }
      P(A, $);
    };
    ae(S, (A) => {
      te.loading && i(l).length === 0 ? A(Y) : A(G, !1);
    });
  }
  mt(k, (A) => D(o, A), () => i(o)), Z(
    (A) => {
      I(y, `画像一覧 (${i(n) ?? ""})`), F.disabled = i(s) === 0, I(R, `${i(s) + 1} - ${A ?? ""} / ${i(n) ?? ""}`), z.disabled = i(s) + a >= i(n);
    },
    [() => Math.min(i(s) + a, i(n))]
  ), P(e, p), rt();
}
Bt(["click"]);
var Fi = /* @__PURE__ */ N('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), Pi = /* @__PURE__ */ N('<span class="term-badge svelte-6rw159"> </span>'), Ii = /* @__PURE__ */ N('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">TF-IDF 統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総語彙数 (Terms)</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">インデックス済みエントリ</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">関連エントリ計算済み</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">総関連ペア数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">平均類似度スコア</th><td class="svelte-6rw159"> </td></tr></tbody></table></div> <div style="margin-top: 10px;" class="svelte-6rw159"><h4 class="svelte-6rw159">頻出単語 (Top 20 DF)</h4> <div class="top-terms svelte-6rw159"></div></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">画像統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総画像数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">未インデックス画像数</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), Ni = /* @__PURE__ */ N('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function Oi(e, t) {
  tt(t, !0);
  let r = /* @__PURE__ */ H(null);
  async function s() {
    try {
      D(r, await te.get("/admin/api/info"), !0);
    } catch (f) {
      console.error(f);
    }
  }
  Tt(s);
  function a(f) {
    if (f === 0) return "0 B";
    const v = 1024, g = ["B", "KB", "MB", "GB", "TB"], _ = Math.floor(Math.log(f) / Math.log(v));
    return parseFloat((f / Math.pow(v, _)).toFixed(2)) + " " + g[_];
  }
  var n = Ni(), l = h(c(n), 2);
  {
    var u = (f) => {
      var v = Fi();
      P(f, v);
    }, o = (f) => {
      var v = $r(), g = St(v);
      {
        var _ = (p) => {
          var E = Ii(), b = c(E), d = h(c(b), 2), y = c(d), O = c(y), F = c(O), C = h(c(F)), R = c(C), z = h(F), K = h(c(z)), T = c(K), B = h(z), k = h(c(B)), w = c(k), M = h(B), j = h(c(M)), x = c(j), m = h(M), S = h(c(m)), Y = c(S), G = h(d, 2), A = h(c(G), 2);
          Re(A, 21, () => i(r).tfidf_stats.top_terms, Oe, (gr, Gt) => {
            var Pt = Pi(), mr = c(Pt);
            Z(() => {
              _e(Pt, "title", `DF: ${i(Gt).df ?? ""}`), I(mr, i(Gt).term);
            }), P(gr, Pt);
          });
          var $ = h(b, 2), re = h(c($), 2), W = c(re), X = c(W), V = c(X), ee = h(c(V)), le = c(ee), se = h(V), ne = h(c(se)), oe = c(ne), be = h($, 2), Se = h(c(be), 2), Fe = c(Se), Pe = c(Fe), ke = c(Pe), Ce = h(c(ke)), de = c(Ce), Ie = h(ke), st = h(c(Ie)), At = c(st), nt = c(At), at = h(be, 2), cr = h(c(at), 2), Jt = c(cr), Xt = c(Jt), Vt = c(Xt), vr = h(c(Vt)), dr = c(vr), Ft = h(Vt), hr = h(c(Ft)), L = c(hr), Q = h(Ft), he = h(c(Q)), Ne = c(he), Ge = h(Q), _r = h(c(Ge)), pr = c(_r), qr = h(Ge), Vs = h(c(qr)), Gs = c(Vs), zr = h(qr), Ks = h(c(zr)), Ws = c(Ks), Ur = h(zr), Zs = h(c(Ur)), Qs = c(Zs), en = h(Ur), tn = h(c(en)), rn = c(tn), sn = h(at, 2), nn = h(c(sn), 2), an = c(nn);
          Z(
            (gr, Gt, Pt, mr, ln, on) => {
              I(R, i(r).tfidf_stats.total_terms), I(T, i(r).tfidf_stats.indexed_entries), I(w, i(r).tfidf_stats.entries_with_related), I(x, i(r).tfidf_stats.total_related_pairs), I(Y, gr), I(le, i(r).image_stats.total_images), I(oe, i(r).image_stats.unindexed_images), I(de, i(r).is_development), I(nt, i(r).app_hash), I(dr, i(r).debug_info.go_version), I(L, i(r).debug_info.num_goroutine), I(Ne, Gt), I(pr, i(r).debug_info.uptime), I(Gs, Pt), I(Ws, mr), I(Qs, ln), I(rn, i(r).debug_info.num_gc), I(an, on);
            },
            [
              () => i(r).tfidf_stats.avg_score.toFixed(4),
              () => new Date(i(r).debug_info.start_time).toLocaleString(),
              () => a(i(r).debug_info.mem_alloc),
              () => a(i(r).debug_info.mem_total_alloc),
              () => a(i(r).debug_info.mem_sys),
              () => JSON.stringify(i(r).config, null, 2)
            ]
          ), P(p, E);
        };
        ae(
          g,
          (p) => {
            i(r) && p(_);
          },
          !0
        );
      }
      P(f, v);
    };
    ae(l, (f) => {
      te.loading && !i(r) ? f(u) : f(o, !1);
    });
  }
  P(e, n), rt();
}
var Ri = /* @__PURE__ */ N("<a> </a>"), Yi = /* @__PURE__ */ N('<div class="admin-app svelte-1n46o8q"><header><h1 class="svelte-1n46o8q"><a href="/admin/" class="svelte-1n46o8q"><img src="/images/hanrangen-icon.svg" alt="Hanrangon" class="logo svelte-1n46o8q"/></a></h1> <nav class="main-nav svelte-1n46o8q"><ul class="svelte-1n46o8q"><li><a href="/" class="svelte-1n46o8q">サイト確認</a></li> <li><a href="/logout" class="svelte-1n46o8q">ログアウト</a></li></ul></nav></header> <nav></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function Ci(e, t) {
  tt(t, !0);
  let r = /* @__PURE__ */ H(pe(window.location.pathname)), s = /* @__PURE__ */ H(pe(new URLSearchParams(window.location.search)));
  Tt(() => {
    const d = () => {
      D(r, window.location.pathname, !0), D(s, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", d), () => window.removeEventListener("popstate", d);
  });
  function a(d, y) {
    y && y.preventDefault(), window.history.pushState({}, "", d), D(r, window.location.pathname, !0), D(s, new URLSearchParams(window.location.search), !0);
  }
  const n = {
    "/admin/edit": {
      component: si,
      page: "edit",
      getProps: (d) => ({ id: d, onSave: (y) => window.location.href = y })
    },
    "/admin/jobs": { component: vi, page: "jobs", getProps: () => ({}) },
    "/admin/images": { component: Ai, page: "images", getProps: () => ({}) },
    "/admin/info": { component: Oi, page: "info", getProps: () => ({}) },
    "/admin/": {
      component: Va,
      page: "list",
      getProps: () => ({ onEdit: (d) => a(`/admin/edit?id=${d}`) })
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
  ], u = /* @__PURE__ */ Qt(() => {
    const d = i(s).get("id"), y = n[i(r)] ?? n["/admin/"];
    return {
      ...y,
      props: y.getProps(d),
      isActive: (O) => !(O.page !== y.page || O.exact && d)
    };
  }), o = /* @__PURE__ */ Qt(() => window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  var f = Yi(), v = c(f);
  let g;
  var _ = h(v, 2);
  let p;
  Re(_, 21, () => l, Oe, (d, y) => {
    var O = Ri();
    O.__click = (R) => a(i(y).path, R);
    let F;
    var C = c(O);
    Z(
      (R) => {
        _e(O, "href", i(y).path), F = et(O, 1, "svelte-1n46o8q", null, F, R), I(C, i(y).label);
      },
      [() => ({ active: i(u).isActive(i(y)) })]
    ), P(d, O);
  });
  var E = h(_, 2), b = c(E);
  Ma(b, () => i(u).component, (d, y) => {
    y(d, Oa(() => i(u).props));
  }), Z(() => {
    g = et(v, 1, "svelte-1n46o8q", null, g, { "is-localhost": i(o) }), p = et(_, 1, "sub-nav svelte-1n46o8q", null, p, { "is-localhost": i(o) });
  }), P(e, f), rt();
}
Bt(["click"]);
const Sr = document.getElementById("admin-root");
Sr && (Sr.innerHTML = "", ga(Ci, { target: Sr }));
//# sourceMappingURL=admin-front.js.map
