var Mr = Array.isArray, mn = Array.prototype.indexOf, Tt = Array.from, gn = Object.defineProperty, st = Object.getOwnPropertyDescriptor, bn = Object.getOwnPropertyDescriptors, yn = Object.prototype, wn = Array.prototype, Sr = Object.getPrototypeOf, ir = Object.isExtensible;
function Mn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function kr() {
  var e, t, r = new Promise((n, a) => {
    e = n, t = a;
  });
  return { promise: r, resolve: e, reject: t };
}
const J = 2, Jt = 4, Bt = 8, Sn = 1 << 24, De = 16, Te = 32, ze = 64, xt = 128, he = 512, V = 1024, ae = 2048, be = 4096, se = 8192, Ne = 16384, $t = 32768, Ke = 65536, lr = 1 << 17, Er = 1 << 18, Qe = 1 << 19, kn = 1 << 20, Me = 1 << 25, Ce = 32768, Lt = 1 << 21, Vt = 1 << 22, Re = 1 << 23, bt = /* @__PURE__ */ Symbol("$state"), En = /* @__PURE__ */ Symbol(""), $e = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Dn(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Tn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function xn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function An() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Fn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Nn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Rn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Pn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function In() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function On() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Yn = 1, jn = 2, Dr = 4, Cn = 8, Hn = 16, Ln = 1, zn = 2, $ = /* @__PURE__ */ Symbol(), qn = "http://www.w3.org/1999/xhtml";
function Xn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Tr(e) {
  return e === this.v;
}
function Un(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function xr(e) {
  return !Un(e, this.v);
}
let ie = null;
function Ze(e) {
  ie = e;
}
function ut(e, t = !1, r) {
  ie = {
    p: ie,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function ct(e) {
  var t = (
    /** @type {ComponentContext} */
    ie
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      Ur(n);
  }
  return t.i = !0, ie = t.p, /** @type {T} */
  {};
}
function Ar() {
  return !0;
}
let Ie = [];
function Fr() {
  var e = Ie;
  Ie = [], Mn(e);
}
function vt(e) {
  if (Ie.length === 0 && !at) {
    var t = Ie;
    queueMicrotask(() => {
      t === Ie && Fr();
    });
  }
  Ie.push(e);
}
function Jn() {
  for (; Ie.length > 0; )
    Fr();
}
function Nr(e) {
  var t = j;
  if (t === null)
    return N.f |= Re, e;
  if ((t.f & $t) === 0) {
    if ((t.f & xt) === 0)
      throw e;
    t.b.error(e);
  } else
    We(e, t);
}
function We(e, t) {
  for (; t !== null; ) {
    if ((t.f & xt) !== 0)
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
const pt = /* @__PURE__ */ new Set();
let O = null, yt = null, ce = null, fe = [], At = null, zt = !1, at = !1;
class pe {
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
    fe = [], yt = null, this.apply();
    var r = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const n of t)
      this.#i(n, r);
    this.is_fork || this.#u(), this.is_deferred() ? (this.#l(r.effects), this.#l(r.render_effects)) : (yt = this, O = null, or(r.render_effects), or(r.effects), yt = null, this.#o?.resolve()), ce = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {EffectTarget} target
   */
  #i(t, r) {
    t.f ^= V;
    for (var n = t.first; n !== null; ) {
      var a = n.f, s = (a & (Te | ze)) !== 0, i = s && (a & V) !== 0, o = i || (a & se) !== 0 || this.skipped_effects.has(n);
      if ((n.f & xt) !== 0 && n.b?.is_pending() && (r = {
        parent: r,
        effect: n,
        effects: [],
        render_effects: []
      }), !o && n.fn !== null) {
        s ? n.f ^= V : (a & Jt) !== 0 ? r.effects.push(n) : ht(n) && ((n.f & De) !== 0 && this.#a.add(n), ft(n));
        var l = n.first;
        if (l !== null) {
          n = l;
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
      (r.f & ae) !== 0 ? this.#a.add(r) : (r.f & be) !== 0 && this.#s.add(r), this.#f(r.deps), K(r, V);
  }
  /**
   * @param {Value[] | null} deps
   */
  #f(t) {
    if (t !== null)
      for (const r of t)
        (r.f & J) === 0 || (r.f & Ce) === 0 || (r.f ^= Ce, this.#f(
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
    this.previous.has(t) || this.previous.set(t, r), (t.f & Re) === 0 && (this.current.set(t, t.v), ce?.set(t, t.v));
  }
  activate() {
    O = this, this.apply();
  }
  deactivate() {
    O === this && (O = null, ce = null);
  }
  flush() {
    if (this.activate(), fe.length > 0) {
      if (Rr(), O !== null && O !== this)
        return;
    } else this.#n === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of this.#t) t(this);
    this.#t.clear();
  }
  #u() {
    if (this.#r === 0) {
      for (const t of this.#e) t();
      this.#e.clear();
    }
    this.#n === 0 && this.#c();
  }
  #c() {
    if (pt.size > 1) {
      this.previous.clear();
      var t = ce, r = !0, n = {
        parent: null,
        effect: null,
        effects: [],
        render_effects: []
      };
      for (const s of pt) {
        if (s === this) {
          r = !1;
          continue;
        }
        const i = [];
        for (const [l, f] of this.current) {
          if (s.current.has(l))
            if (r && f !== s.current.get(l))
              s.current.set(l, f);
            else
              continue;
          i.push(l);
        }
        if (i.length === 0)
          continue;
        const o = [...s.current.keys()].filter((l) => !this.current.has(l));
        if (o.length > 0) {
          var a = fe;
          fe = [];
          const l = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
          for (const v of i)
            Pr(v, o, l, f);
          if (fe.length > 0) {
            O = s, s.apply();
            for (const v of fe)
              s.#i(v, n);
            s.deactivate();
          }
          fe = a;
        }
      }
      O = null, ce = t;
    }
    this.committed = !0, pt.delete(this);
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
      this.#s.delete(t), K(t, ae), He(t);
    for (const t of this.#s)
      K(t, be), He(t);
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
    return (this.#o ??= kr()).promise;
  }
  static ensure() {
    if (O === null) {
      const t = O = new pe();
      pt.add(O), at || pe.enqueue(() => {
        O === t && t.flush();
      });
    }
    return O;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    vt(t);
  }
  apply() {
  }
}
function Bn(e) {
  var t = at;
  at = !0;
  try {
    for (var r; ; ) {
      if (Jn(), fe.length === 0 && (O?.flush(), fe.length === 0))
        return At = null, /** @type {T} */
        r;
      Rr();
    }
  } finally {
    at = t;
  }
}
function Rr() {
  var e = Ye;
  zt = !0;
  var t = null;
  try {
    var r = 0;
    for (kt(!0); fe.length > 0; ) {
      var n = pe.ensure();
      if (r++ > 1e3) {
        var a, s;
        $n();
      }
      n.process(fe), Pe.clear();
    }
  } finally {
    zt = !1, kt(e), At = null;
  }
}
function $n() {
  try {
    Nn();
  } catch (e) {
    We(e, At);
  }
}
let we = null;
function or(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (Ne | se)) === 0 && ht(n) && (we = /* @__PURE__ */ new Set(), ft(n), n.deps === null && n.first === null && n.nodes === null && (n.teardown === null && n.ac === null ? $r(n) : n.fn = null), we?.size > 0)) {
        Pe.clear();
        for (const a of we) {
          if ((a.f & (Ne | se)) !== 0) continue;
          const s = [a];
          let i = a.parent;
          for (; i !== null; )
            we.has(i) && (we.delete(i), s.push(i)), i = i.parent;
          for (let o = s.length - 1; o >= 0; o--) {
            const l = s[o];
            (l.f & (Ne | se)) === 0 && ft(l);
          }
        }
        we.clear();
      }
    }
    we = null;
  }
}
function Pr(e, t, r, n) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const s = a.f;
      (s & J) !== 0 ? Pr(
        /** @type {Derived} */
        a,
        t,
        r,
        n
      ) : (s & (Vt | De)) !== 0 && (s & ae) === 0 && Ir(a, t, n) && (K(a, ae), He(
        /** @type {Effect} */
        a
      ));
    }
}
function Ir(e, t, r) {
  const n = r.get(e);
  if (n !== void 0) return n;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (t.includes(a))
        return !0;
      if ((a.f & J) !== 0 && Ir(
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
function He(e) {
  for (var t = At = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (zt && t === j && (r & De) !== 0 && (r & Er) === 0)
      return;
    if ((r & (ze | Te)) !== 0) {
      if ((r & V) === 0) return;
      t.f ^= V;
    }
  }
  fe.push(t);
}
function Vn(e) {
  let t = 0, r = Le(0), n;
  return () => {
    lt() && (u(r), Ft(() => (t === 0 && (n = _t(() => e(() => it(r)))), t += 1, () => {
      vt(() => {
        t -= 1, t === 0 && (n?.(), n = void 0, it(r));
      });
    })));
  };
}
var Kn = Ke | Qe | xt;
function Zn(e, t, r) {
  new Wn(e, t, r);
}
class Wn {
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
  #f = null;
  /** @type {TemplateNode | null} */
  #u = null;
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
  #b = Vn(() => (this.#d = Le(this.#c), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, n) {
    this.#t = t, this.#r = r, this.#o = n, this.parent = /** @type {Effect} */
    j.b, this.#e = !!this.#r.pending, this.#a = Gt(() => {
      j.b = this;
      {
        var a = this.#m();
        try {
          this.#s = ue(() => n(a));
        } catch (s) {
          this.error(s);
        }
        this.#v > 0 ? this.#p() : this.#e = !1;
      }
      return () => {
        this.#u?.remove();
      };
    }, Kn);
  }
  #y() {
    try {
      this.#s = ue(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
    this.#e = !1;
  }
  #w() {
    const t = this.#r.pending;
    t && (this.#i = ue(() => t(this.#t)), pe.enqueue(() => {
      var r = this.#m();
      this.#s = this.#_(() => (pe.ensure(), ue(() => this.#o(r)))), this.#v > 0 ? this.#p() : (Oe(
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
    return this.#e && (this.#u = Se(), this.#t.before(this.#u), t = this.#u), t;
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
    var r = j, n = N, a = ie;
    ye(this.#a), Q(this.#a), Ze(this.#a.ctx);
    try {
      return t();
    } catch (s) {
      return Nr(s), null;
    } finally {
      ye(r), Q(n), Ze(a);
    }
  }
  #p() {
    const t = (
      /** @type {(anchor: Node) => void} */
      this.#r.pending
    );
    this.#s !== null && (this.#f = document.createDocumentFragment(), this.#f.append(
      /** @type {TemplateNode} */
      this.#u
    ), Zr(this.#s, this.#f)), this.#i === null && (this.#i = ue(() => t(this.#t)));
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
    this.#v += t, this.#v === 0 && (this.#e = !1, this.#i && Oe(this.#i, () => {
      this.#i = null;
    }), this.#f && (this.#t.before(this.#f), this.#f = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    this.#g(t), this.#c += t, this.#d && Ge(this.#d, this.#c);
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
    let n = this.#r.failed;
    if (this.#h || !r && !n)
      throw t;
    this.#s && (ee(this.#s), this.#s = null), this.#i && (ee(this.#i), this.#i = null), this.#l && (ee(this.#l), this.#l = null);
    var a = !1, s = !1;
    const i = () => {
      if (a) {
        Xn();
        return;
      }
      a = !0, s && On(), pe.ensure(), this.#c = 0, this.#l !== null && Oe(this.#l, () => {
        this.#l = null;
      }), this.#e = this.has_pending_snippet(), this.#s = this.#_(() => (this.#h = !1, ue(() => this.#o(this.#t)))), this.#v > 0 ? this.#p() : this.#e = !1;
    };
    var o = N;
    try {
      Q(null), s = !0, r?.(t, i), s = !1;
    } catch (l) {
      We(l, this.#a && this.#a.parent);
    } finally {
      Q(o);
    }
    n && vt(() => {
      this.#l = this.#_(() => {
        pe.ensure(), this.#h = !0;
        try {
          return ue(() => {
            n(
              this.#t,
              () => t,
              () => i
            );
          });
        } catch (l) {
          return We(
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
function Gn(e, t, r, n) {
  const a = Kt;
  if (r.length === 0 && e.length === 0) {
    n(t.map(a));
    return;
  }
  var s = O, i = (
    /** @type {Effect} */
    j
  ), o = Qn();
  function l() {
    Promise.all(r.map((f) => /* @__PURE__ */ es(f))).then((f) => {
      o();
      try {
        n([...t.map(a), ...f]);
      } catch (v) {
        (i.f & Ne) === 0 && We(v, i);
      }
      s?.deactivate(), wt();
    }).catch((f) => {
      We(f, i);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    o();
    try {
      return l();
    } finally {
      s?.deactivate(), wt();
    }
  }) : l();
}
function Qn() {
  var e = j, t = N, r = ie, n = O;
  return function(s = !0) {
    ye(e), Q(t), Ze(r), s && n?.activate();
  };
}
function wt() {
  ye(null), Q(null), Ze(null);
}
// @__NO_SIDE_EFFECTS__
function Kt(e) {
  var t = J | ae, r = N !== null && (N.f & J) !== 0 ? (
    /** @type {Derived} */
    N
  ) : null;
  return j !== null && (j.f |= Qe), {
    ctx: ie,
    deps: null,
    effects: null,
    equals: Tr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      $
    ),
    wv: 0,
    parent: r ?? j,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function es(e, t) {
  let r = (
    /** @type {Effect | null} */
    j
  );
  r === null && Tn();
  var n = (
    /** @type {Boundary} */
    r.b
  ), a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Le(
    /** @type {V} */
    $
  ), i = !N, o = /* @__PURE__ */ new Map();
  return hs(() => {
    var l = kr();
    a = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).then(() => {
        f === O && f.committed && f.deactivate(), wt();
      });
    } catch (h) {
      l.reject(h), wt();
    }
    var f = (
      /** @type {Batch} */
      O
    );
    if (i) {
      var v = !n.is_pending();
      n.update_pending_count(1), f.increment(v), o.get(f)?.reject($e), o.delete(f), o.set(f, l);
    }
    const p = (h, _ = void 0) => {
      if (f.activate(), _)
        _ !== $e && (s.f |= Re, Ge(s, _));
      else {
        (s.f & Re) !== 0 && (s.f ^= Re), Ge(s, h);
        for (const [x, g] of o) {
          if (o.delete(x), x === f) break;
          g.reject($e);
        }
      }
      i && (n.update_pending_count(-1), f.decrement(v));
    };
    l.promise.then(p, (h) => p(null, h || "unknown"));
  }), us(() => {
    for (const l of o.values())
      l.reject($e);
  }), new Promise((l) => {
    function f(v) {
      function p() {
        v === a ? l(s) : f(a);
      }
      v.then(p, p);
    }
    f(a);
  });
}
// @__NO_SIDE_EFFECTS__
function fr(e) {
  const t = /* @__PURE__ */ Kt(e);
  return Wr(t), t;
}
// @__NO_SIDE_EFFECTS__
function ts(e) {
  const t = /* @__PURE__ */ Kt(e);
  return t.equals = xr, t;
}
function Or(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      ee(
        /** @type {Effect} */
        t[r]
      );
  }
}
function rs(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & J) === 0)
      return (t.f & Ne) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Zt(e) {
  var t, r = j;
  ye(rs(e));
  try {
    e.f &= ~Ce, Or(e), t = tn(e);
  } finally {
    ye(r);
  }
  return t;
}
function Yr(e) {
  var t = Zt(e);
  if (e.equals(t) || (O?.is_fork || (e.v = t), e.wv = Qr()), !et)
    if (ce !== null)
      (lt() || O?.is_fork) && ce.set(e, t);
    else {
      var r = (e.f & he) === 0 ? be : V;
      K(e, r);
    }
}
let qt = /* @__PURE__ */ new Set();
const Pe = /* @__PURE__ */ new Map();
let jr = !1;
function Le(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Tr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function H(e, t) {
  const r = Le(e);
  return Wr(r), r;
}
// @__NO_SIDE_EFFECTS__
function ns(e, t = !1, r = !0) {
  const n = Le(e);
  return t || (n.equals = xr), n;
}
function T(e, t, r = !1) {
  N !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!me || (N.f & lr) !== 0) && Ar() && (N.f & (J | De | Vt | lr)) !== 0 && !Ee?.includes(e) && In();
  let n = r ? de(t) : t;
  return Ge(e, n);
}
function Ge(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    et ? Pe.set(e, t) : Pe.set(e, r), e.v = t;
    var n = pe.ensure();
    n.capture(e, r), (e.f & J) !== 0 && ((e.f & ae) !== 0 && Zt(
      /** @type {Derived} */
      e
    ), K(e, (e.f & he) !== 0 ? V : be)), e.wv = Qr(), Cr(e, ae), j !== null && (j.f & V) !== 0 && (j.f & (Te | ze)) === 0 && (oe === null ? ms([e]) : oe.push(e)), !n.is_fork && qt.size > 0 && !jr && ss();
  }
  return t;
}
function ss() {
  jr = !1;
  var e = Ye;
  kt(!0);
  const t = Array.from(qt);
  try {
    for (const r of t)
      (r.f & V) !== 0 && K(r, be), ht(r) && ft(r);
  } finally {
    kt(e);
  }
  qt.clear();
}
function it(e) {
  T(e, e.v + 1);
}
function Cr(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, a = 0; a < n; a++) {
      var s = r[a], i = s.f, o = (i & ae) === 0;
      if (o && K(s, t), (i & J) !== 0) {
        var l = (
          /** @type {Derived} */
          s
        );
        ce?.delete(l), (i & Ce) === 0 && (i & he && (s.f |= Ce), Cr(l, be));
      } else o && ((i & De) !== 0 && we !== null && we.add(
        /** @type {Effect} */
        s
      ), He(
        /** @type {Effect} */
        s
      ));
    }
}
function de(e) {
  if (typeof e != "object" || e === null || bt in e)
    return e;
  const t = Sr(e);
  if (t !== yn && t !== wn)
    return e;
  var r = /* @__PURE__ */ new Map(), n = Mr(e), a = /* @__PURE__ */ H(0), s = je, i = (o) => {
    if (je === s)
      return o();
    var l = N, f = je;
    Q(null), dr(s);
    var v = o();
    return Q(l), dr(f), v;
  };
  return n && r.set("length", /* @__PURE__ */ H(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(o, l, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && Rn();
        var v = r.get(l);
        return v === void 0 ? v = i(() => {
          var p = /* @__PURE__ */ H(f.value);
          return r.set(l, p), p;
        }) : T(v, f.value, !0), !0;
      },
      deleteProperty(o, l) {
        var f = r.get(l);
        if (f === void 0) {
          if (l in o) {
            const v = i(() => /* @__PURE__ */ H($));
            r.set(l, v), it(a);
          }
        } else
          T(f, $), it(a);
        return !0;
      },
      get(o, l, f) {
        if (l === bt)
          return e;
        var v = r.get(l), p = l in o;
        if (v === void 0 && (!p || st(o, l)?.writable) && (v = i(() => {
          var _ = de(p ? o[l] : $), x = /* @__PURE__ */ H(_);
          return x;
        }), r.set(l, v)), v !== void 0) {
          var h = u(v);
          return h === $ ? void 0 : h;
        }
        return Reflect.get(o, l, f);
      },
      getOwnPropertyDescriptor(o, l) {
        var f = Reflect.getOwnPropertyDescriptor(o, l);
        if (f && "value" in f) {
          var v = r.get(l);
          v && (f.value = u(v));
        } else if (f === void 0) {
          var p = r.get(l), h = p?.v;
          if (p !== void 0 && h !== $)
            return {
              enumerable: !0,
              configurable: !0,
              value: h,
              writable: !0
            };
        }
        return f;
      },
      has(o, l) {
        if (l === bt)
          return !0;
        var f = r.get(l), v = f !== void 0 && f.v !== $ || Reflect.has(o, l);
        if (f !== void 0 || j !== null && (!v || st(o, l)?.writable)) {
          f === void 0 && (f = i(() => {
            var h = v ? de(o[l]) : $, _ = /* @__PURE__ */ H(h);
            return _;
          }), r.set(l, f));
          var p = u(f);
          if (p === $)
            return !1;
        }
        return v;
      },
      set(o, l, f, v) {
        var p = r.get(l), h = l in o;
        if (n && l === "length")
          for (var _ = f; _ < /** @type {Source<number>} */
          p.v; _ += 1) {
            var x = r.get(_ + "");
            x !== void 0 ? T(x, $) : _ in o && (x = i(() => /* @__PURE__ */ H($)), r.set(_ + "", x));
          }
        if (p === void 0)
          (!h || st(o, l)?.writable) && (p = i(() => /* @__PURE__ */ H(void 0)), T(p, de(f)), r.set(l, p));
        else {
          h = p.v !== $;
          var g = i(() => de(f));
          T(p, g);
        }
        var d = Reflect.getOwnPropertyDescriptor(o, l);
        if (d?.set && d.set.call(v, f), !h) {
          if (n && typeof l == "string") {
            var w = (
              /** @type {Source<number>} */
              r.get("length")
            ), P = Number(l);
            Number.isInteger(P) && P >= w.v && T(w, P + 1);
          }
          it(a);
        }
        return !0;
      },
      ownKeys(o) {
        u(a);
        var l = Reflect.ownKeys(o).filter((p) => {
          var h = r.get(p);
          return h === void 0 || h.v !== $;
        });
        for (var [f, v] of r)
          v.v !== $ && !(f in o) && l.push(f);
        return l;
      },
      setPrototypeOf() {
        Pn();
      }
    }
  );
}
var ur, Hr, Lr, zr;
function as() {
  if (ur === void 0) {
    ur = window, Hr = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    Lr = st(t, "firstChild").get, zr = st(t, "nextSibling").get, ir(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), ir(r) && (r.__t = void 0);
  }
}
function Se(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Mt(e) {
  return (
    /** @type {TemplateNode | null} */
    Lr.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function dt(e) {
  return (
    /** @type {TemplateNode | null} */
    zr.call(e)
  );
}
function M(e, t) {
  return /* @__PURE__ */ Mt(e);
}
function St(e, t = !1) {
  {
    var r = /* @__PURE__ */ Mt(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ dt(r) : r;
  }
}
function A(e, t = 1, r = !1) {
  let n = e;
  for (; t--; )
    n = /** @type {TemplateNode} */
    /* @__PURE__ */ dt(n);
  return n;
}
function is(e) {
  e.textContent = "";
}
function qr() {
  return !1;
}
let cr = !1;
function ls() {
  cr || (cr = !0, document.addEventListener(
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
function Wt(e) {
  var t = N, r = j;
  Q(null), ye(null);
  try {
    return e();
  } finally {
    Q(t), ye(r);
  }
}
function Xr(e, t, r, n = r) {
  e.addEventListener(t, () => Wt(r));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), n(!0);
  } : e.__on_r = () => n(!0), ls();
}
function os(e) {
  j === null && (N === null && Fn(), An()), et && xn();
}
function fs(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function xe(e, t, r) {
  var n = j;
  n !== null && (n.f & se) !== 0 && (e |= se);
  var a = {
    ctx: ie,
    deps: null,
    nodes: null,
    f: e | ae | he,
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
      ft(a), a.f |= $t;
    } catch (o) {
      throw ee(a), o;
    }
  else t !== null && He(a);
  var s = a;
  if (r && s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
  (s.f & Qe) === 0 && (s = s.first, (e & De) !== 0 && (e & Ke) !== 0 && s !== null && (s.f |= Ke)), s !== null && (s.parent = n, n !== null && fs(s, n), N !== null && (N.f & J) !== 0 && (e & ze) === 0)) {
    var i = (
      /** @type {Derived} */
      N
    );
    (i.effects ??= []).push(s);
  }
  return a;
}
function lt() {
  return N !== null && !me;
}
function us(e) {
  const t = xe(Bt, null, !1);
  return K(t, V), t.teardown = e, t;
}
function cs(e) {
  os();
  var t = (
    /** @type {Effect} */
    j.f
  ), r = !N && (t & Te) !== 0 && (t & $t) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      ie
    );
    (n.e ??= []).push(e);
  } else
    return Ur(e);
}
function Ur(e) {
  return xe(Jt | kn, e, !1);
}
function vs(e) {
  pe.ensure();
  const t = xe(ze | Qe, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? Oe(t, () => {
      ee(t), n(void 0);
    }) : (ee(t), n(void 0));
  });
}
function ds(e) {
  return xe(Jt, e, !1);
}
function hs(e) {
  return xe(Vt | Qe, e, !0);
}
function Ft(e, t = 0) {
  return xe(Bt | t, e, !0);
}
function ke(e, t = [], r = [], n = []) {
  Gn(n, t, r, (a) => {
    xe(Bt, () => e(...a.map(u)), !0);
  });
}
function Gt(e, t = 0) {
  var r = xe(De | t, e, !0);
  return r;
}
function ue(e) {
  return xe(Te | Qe, e, !0);
}
function Jr(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = et, n = N;
    vr(!0), Q(null);
    try {
      t.call(null);
    } finally {
      vr(r), Q(n);
    }
  }
}
function Br(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const a = r.ac;
    a !== null && Wt(() => {
      a.abort($e);
    });
    var n = r.next;
    (r.f & ze) !== 0 ? r.parent = null : ee(r, t), r = n;
  }
}
function _s(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & Te) === 0 && ee(t), t = r;
  }
}
function ee(e, t = !0) {
  var r = !1;
  (t || (e.f & Er) !== 0) && e.nodes !== null && e.nodes.end !== null && (ps(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), Br(e, t && !r), Et(e, 0), K(e, Ne);
  var n = e.nodes && e.nodes.t;
  if (n !== null)
    for (const s of n)
      s.stop();
  Jr(e);
  var a = e.parent;
  a !== null && a.first !== null && $r(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function ps(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ dt(e);
    e.remove(), e = r;
  }
}
function $r(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Oe(e, t, r = !0) {
  var n = [];
  Vr(e, n, !0);
  var a = () => {
    r && ee(e), t && t();
  }, s = n.length;
  if (s > 0) {
    var i = () => --s || a();
    for (var o of n)
      o.out(i);
  } else
    a();
}
function Vr(e, t, r) {
  if ((e.f & se) === 0) {
    e.f ^= se;
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const o of n)
        (o.is_global || r) && t.push(o);
    for (var a = e.first; a !== null; ) {
      var s = a.next, i = (a.f & Ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (a.f & Te) !== 0 && (e.f & De) !== 0;
      Vr(a, t, i ? r : !1), a = s;
    }
  }
}
function Qt(e) {
  Kr(e, !0);
}
function Kr(e, t) {
  if ((e.f & se) !== 0) {
    e.f ^= se, (e.f & V) === 0 && (K(e, ae), He(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, a = (r.f & Ke) !== 0 || (r.f & Te) !== 0;
      Kr(r, a ? t : !1), r = n;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const i of s)
        (i.is_global || t) && i.in();
  }
}
function Zr(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end; r !== null; ) {
      var a = r === n ? null : /* @__PURE__ */ dt(r);
      t.append(r), r = a;
    }
}
let Ye = !1;
function kt(e) {
  Ye = e;
}
let et = !1;
function vr(e) {
  et = e;
}
let N = null, me = !1;
function Q(e) {
  N = e;
}
let j = null;
function ye(e) {
  j = e;
}
let Ee = null;
function Wr(e) {
  N !== null && (Ee === null ? Ee = [e] : Ee.push(e));
}
let W = null, ne = 0, oe = null;
function ms(e) {
  oe = e;
}
let Gr = 1, ot = 0, je = ot;
function dr(e) {
  je = e;
}
function Qr() {
  return ++Gr;
}
function ht(e) {
  var t = e.f;
  if ((t & ae) !== 0)
    return !0;
  if (t & J && (e.f &= ~Ce), (t & be) !== 0) {
    var r = e.deps;
    if (r !== null)
      for (var n = r.length, a = 0; a < n; a++) {
        var s = r[a];
        if (ht(
          /** @type {Derived} */
          s
        ) && Yr(
          /** @type {Derived} */
          s
        ), s.wv > e.wv)
          return !0;
      }
    (t & he) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    ce === null && K(e, V);
  }
  return !1;
}
function en(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !Ee?.includes(e))
    for (var a = 0; a < n.length; a++) {
      var s = n[a];
      (s.f & J) !== 0 ? en(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (r ? K(s, ae) : (s.f & V) !== 0 && K(s, be), He(
        /** @type {Effect} */
        s
      ));
    }
}
function tn(e) {
  var t = W, r = ne, n = oe, a = N, s = Ee, i = ie, o = me, l = je, f = e.f;
  W = /** @type {null | Value[]} */
  null, ne = 0, oe = null, N = (f & (Te | ze)) === 0 ? e : null, Ee = null, Ze(e.ctx), me = !1, je = ++ot, e.ac !== null && (Wt(() => {
    e.ac.abort($e);
  }), e.ac = null);
  try {
    e.f |= Lt;
    var v = (
      /** @type {Function} */
      e.fn
    ), p = v(), h = e.deps;
    if (W !== null) {
      var _;
      if (Et(e, ne), h !== null && ne > 0)
        for (h.length = ne + W.length, _ = 0; _ < W.length; _++)
          h[ne + _] = W[_];
      else
        e.deps = h = W;
      if (lt() && (e.f & he) !== 0)
        for (_ = ne; _ < h.length; _++)
          (h[_].reactions ??= []).push(e);
    } else h !== null && ne < h.length && (Et(e, ne), h.length = ne);
    if (Ar() && oe !== null && !me && h !== null && (e.f & (J | be | ae)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      oe.length; _++)
        en(
          oe[_],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (ot++, oe !== null && (n === null ? n = oe : n.push(.../** @type {Source[]} */
    oe))), (e.f & Re) !== 0 && (e.f ^= Re), p;
  } catch (x) {
    return Nr(x);
  } finally {
    e.f ^= Lt, W = t, ne = r, oe = n, N = a, Ee = s, Ze(i), me = o, je = l;
  }
}
function gs(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = mn.call(r, e);
    if (n !== -1) {
      var a = r.length - 1;
      a === 0 ? r = t.reactions = null : (r[n] = r[a], r.pop());
    }
  }
  r === null && (t.f & J) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (W === null || !W.includes(t)) && (K(t, be), (t.f & he) !== 0 && (t.f ^= he, t.f &= ~Ce), Or(
    /** @type {Derived} **/
    t
  ), Et(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Et(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      gs(e, r[n]);
}
function ft(e) {
  var t = e.f;
  if ((t & Ne) === 0) {
    K(e, V);
    var r = j, n = Ye;
    j = e, Ye = !0;
    try {
      (t & (De | Sn)) !== 0 ? _s(e) : Br(e), Jr(e);
      var a = tn(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Gr;
      var s;
    } finally {
      Ye = n, j = r;
    }
  }
}
async function bs() {
  await Promise.resolve(), Bn();
}
function u(e) {
  var t = e.f, r = (t & J) !== 0;
  if (N !== null && !me) {
    var n = j !== null && (j.f & Ne) !== 0;
    if (!n && !Ee?.includes(e)) {
      var a = N.deps;
      if ((N.f & Lt) !== 0)
        e.rv < ot && (e.rv = ot, W === null && a !== null && a[ne] === e ? ne++ : W === null ? W = [e] : W.includes(e) || W.push(e));
      else {
        (N.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [N] : s.includes(N) || s.push(N);
      }
    }
  }
  if (et) {
    if (Pe.has(e))
      return Pe.get(e);
    if (r) {
      var i = (
        /** @type {Derived} */
        e
      ), o = i.v;
      return ((i.f & V) === 0 && i.reactions !== null || nn(i)) && (o = Zt(i)), Pe.set(i, o), o;
    }
  } else r && (!ce?.has(e) || O?.is_fork && !lt()) && (i = /** @type {Derived} */
  e, ht(i) && Yr(i), Ye && lt() && (i.f & he) === 0 && rn(i));
  if (ce?.has(e))
    return ce.get(e);
  if ((e.f & Re) !== 0)
    throw e.v;
  return e.v;
}
function rn(e) {
  if (e.deps !== null) {
    e.f ^= he;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & J) !== 0 && (t.f & he) === 0 && rn(
        /** @type {Derived} */
        t
      );
  }
}
function nn(e) {
  if (e.v === $) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Pe.has(t) || (t.f & J) !== 0 && nn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function _t(e) {
  var t = me;
  try {
    return me = !0, e();
  } finally {
    me = t;
  }
}
const ys = -7169;
function K(e, t) {
  e.f = e.f & ys | t;
}
const ws = ["touchstart", "touchmove"];
function Ms(e) {
  return ws.includes(e);
}
const sn = /* @__PURE__ */ new Set(), Xt = /* @__PURE__ */ new Set();
function Nt(e) {
  for (var t = 0; t < e.length; t++)
    sn.add(e[t]);
  for (var r of Xt)
    r(e);
}
let hr = null;
function mt(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, a = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  hr = e;
  var i = 0, o = hr === e && e.__root;
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
  if (s = /** @type {Element} */
  a[i] || e.target, s !== t) {
    gn(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || r;
      }
    });
    var v = N, p = j;
    Q(null), ye(null);
    try {
      for (var h, _ = []; s !== null; ) {
        var x = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s["__" + n];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (d) {
          h ? _.push(d) : h = d;
        }
        if (e.cancelBubble || x === t || x === null)
          break;
        s = x;
      }
      if (h) {
        for (let d of _)
          queueMicrotask(() => {
            throw d;
          });
        throw h;
      }
    } finally {
      e.__root = t, delete e.currentTarget, Q(v), ye(p);
    }
  }
}
function Ss(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Dt(e, t) {
  var r = (
    /** @type {Effect} */
    j
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Z(e, t) {
  var r = (t & Ln) !== 0, n = (t & zn) !== 0, a, s = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = Ss(s ? e : "<!>" + e), r || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ Mt(a)));
    var i = (
      /** @type {TemplateNode} */
      n || Hr ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Mt(i)
      ), l = (
        /** @type {TemplateNode} */
        i.lastChild
      );
      Dt(o, l);
    } else
      Dt(i, i);
    return i;
  };
}
function ks(e = "") {
  {
    var t = Se(e + "");
    return Dt(t, t), t;
  }
}
function an() {
  var e = document.createDocumentFragment(), t = document.createComment(""), r = Se();
  return e.append(t, r), Dt(t, r), e;
}
function q(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function U(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ??= e.nodeValue) && (e.__t = r, e.nodeValue = r + "");
}
function Es(e, t) {
  return Ds(e, t);
}
const Be = /* @__PURE__ */ new Map();
function Ds(e, { target: t, anchor: r, props: n = {}, events: a, context: s, intro: i = !0 }) {
  as();
  var o = /* @__PURE__ */ new Set(), l = (p) => {
    for (var h = 0; h < p.length; h++) {
      var _ = p[h];
      if (!o.has(_)) {
        o.add(_);
        var x = Ms(_);
        t.addEventListener(_, mt, { passive: x });
        var g = Be.get(_);
        g === void 0 ? (document.addEventListener(_, mt, { passive: x }), Be.set(_, 1)) : Be.set(_, g + 1);
      }
    }
  };
  l(Tt(sn)), Xt.add(l);
  var f = void 0, v = vs(() => {
    var p = r ?? t.appendChild(Se());
    return Zn(
      /** @type {TemplateNode} */
      p,
      {
        pending: () => {
        }
      },
      (h) => {
        if (s) {
          ut({});
          var _ = (
            /** @type {ComponentContext} */
            ie
          );
          _.c = s;
        }
        a && (n.$$events = a), f = e(h, n) || {}, s && ct();
      }
    ), () => {
      for (var h of o) {
        t.removeEventListener(h, mt);
        var _ = (
          /** @type {number} */
          Be.get(h)
        );
        --_ === 0 ? (document.removeEventListener(h, mt), Be.delete(h)) : Be.set(h, _);
      }
      Xt.delete(l), p !== r && p.parentNode?.removeChild(p);
    };
  });
  return Ts.set(f, v), f;
}
let Ts = /* @__PURE__ */ new WeakMap();
class xs {
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
      O
    );
    if (this.#e.has(t)) {
      var r = (
        /** @type {Key} */
        this.#e.get(t)
      ), n = this.#t.get(r);
      if (n)
        Qt(n), this.#r.delete(r);
      else {
        var a = this.#n.get(r);
        a && (this.#t.set(r, a.effect), this.#n.delete(r), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), n = a.effect);
      }
      for (const [s, i] of this.#e) {
        if (this.#e.delete(s), s === t)
          break;
        const o = this.#n.get(i);
        o && (ee(o.effect), this.#n.delete(i));
      }
      for (const [s, i] of this.#t) {
        if (s === r || this.#r.has(s)) continue;
        const o = () => {
          if (Array.from(this.#e.values()).includes(s)) {
            var f = document.createDocumentFragment();
            Zr(i, f), f.append(Se()), this.#n.set(s, { effect: i, fragment: f });
          } else
            ee(i);
          this.#r.delete(s), this.#t.delete(s);
        };
        this.#o || !n ? (this.#r.add(s), Oe(i, o, !1)) : o();
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
      r.includes(n) || (ee(a.effect), this.#n.delete(n));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, r) {
    var n = (
      /** @type {Batch} */
      O
    ), a = qr();
    if (r && !this.#t.has(t) && !this.#n.has(t))
      if (a) {
        var s = document.createDocumentFragment(), i = Se();
        s.append(i), this.#n.set(t, {
          effect: ue(() => r(i)),
          fragment: s
        });
      } else
        this.#t.set(
          t,
          ue(() => r(this.anchor))
        );
    if (this.#e.set(n, t), a) {
      for (const [o, l] of this.#t)
        o === t ? n.skipped_effects.delete(l) : n.skipped_effects.add(l);
      for (const [o, l] of this.#n)
        o === t ? n.skipped_effects.delete(l.effect) : n.skipped_effects.add(l.effect);
      n.oncommit(this.#a), n.ondiscard(this.#s);
    } else
      this.#a();
  }
}
function ge(e, t, r = !1) {
  var n = new xs(e), a = r ? Ke : 0;
  function s(i, o) {
    n.ensure(i, o);
  }
  Gt(() => {
    var i = !1;
    t((o, l = !0) => {
      i = !0, s(l, o);
    }), i || s(!1, null);
  }, a);
}
function er(e, t) {
  return t;
}
function As(e, t, r) {
  for (var n = [], a = t.length, s, i = t.length, o = 0; o < a; o++) {
    let p = t[o];
    Oe(
      p,
      () => {
        if (s) {
          if (s.pending.delete(p), s.done.add(p), s.pending.size === 0) {
            var h = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Ut(Tt(s.done)), h.delete(s), h.size === 0 && (e.outrogroups = null);
          }
        } else
          i -= 1;
      },
      !1
    );
  }
  if (i === 0) {
    var l = n.length === 0 && r !== null;
    if (l) {
      var f = (
        /** @type {Element} */
        r
      ), v = (
        /** @type {Element} */
        f.parentNode
      );
      is(v), v.append(f), e.items.clear();
    }
    Ut(t, !l);
  } else
    s = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(s);
}
function Ut(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    ee(e[r], t);
}
var _r;
function tr(e, t, r, n, a, s = null) {
  var i = e, o = /* @__PURE__ */ new Map(), l = (t & Dr) !== 0;
  if (l) {
    var f = (
      /** @type {Element} */
      e
    );
    i = f.appendChild(Se());
  }
  var v = null, p = /* @__PURE__ */ ts(() => {
    var w = r();
    return Mr(w) ? w : w == null ? [] : Tt(w);
  }), h, _ = !0;
  function x() {
    d.fallback = v, Fs(d, h, i, t, n), v !== null && (h.length === 0 ? (v.f & Me) === 0 ? Qt(v) : (v.f ^= Me, nt(v, null, i)) : Oe(v, () => {
      v = null;
    }));
  }
  var g = Gt(() => {
    h = /** @type {V[]} */
    u(p);
    for (var w = h.length, P = /* @__PURE__ */ new Set(), I = (
      /** @type {Batch} */
      O
    ), k = qr(), E = 0; E < w; E += 1) {
      var z = h[E], L = n(z, E), D = _ ? null : o.get(L);
      D ? (D.v && Ge(D.v, z), D.i && Ge(D.i, E), k && I.skipped_effects.delete(D.e)) : (D = Ns(
        o,
        _ ? i : _r ??= Se(),
        z,
        L,
        E,
        a,
        t,
        r
      ), _ || (D.e.f |= Me), o.set(L, D)), P.add(L);
    }
    if (w === 0 && s && !v && (_ ? v = ue(() => s(i)) : (v = ue(() => s(_r ??= Se())), v.f |= Me)), !_)
      if (k) {
        for (const [R, F] of o)
          P.has(R) || I.skipped_effects.add(F.e);
        I.oncommit(x), I.ondiscard(() => {
        });
      } else
        x();
    u(p);
  }), d = { effect: g, items: o, outrogroups: null, fallback: v };
  _ = !1;
}
function Fs(e, t, r, n, a) {
  var s = (n & Cn) !== 0, i = t.length, o = e.items, l = e.effect.first, f, v = null, p, h = [], _ = [], x, g, d, w;
  if (s)
    for (w = 0; w < i; w += 1)
      x = t[w], g = a(x, w), d = /** @type {EachItem} */
      o.get(g).e, (d.f & Me) === 0 && (d.nodes?.a?.measure(), (p ??= /* @__PURE__ */ new Set()).add(d));
  for (w = 0; w < i; w += 1) {
    if (x = t[w], g = a(x, w), d = /** @type {EachItem} */
    o.get(g).e, e.outrogroups !== null)
      for (const F of e.outrogroups)
        F.pending.delete(d), F.done.delete(d);
    if ((d.f & Me) !== 0)
      if (d.f ^= Me, d === l)
        nt(d, null, r);
      else {
        var P = v ? v.next : l;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), Fe(e, v, d), Fe(e, d, P), nt(d, P, r), v = d, h = [], _ = [], l = v.next;
        continue;
      }
    if ((d.f & se) !== 0 && (Qt(d), s && (d.nodes?.a?.unfix(), (p ??= /* @__PURE__ */ new Set()).delete(d))), d !== l) {
      if (f !== void 0 && f.has(d)) {
        if (h.length < _.length) {
          var I = _[0], k;
          v = I.prev;
          var E = h[0], z = h[h.length - 1];
          for (k = 0; k < h.length; k += 1)
            nt(h[k], I, r);
          for (k = 0; k < _.length; k += 1)
            f.delete(_[k]);
          Fe(e, E.prev, z.next), Fe(e, v, E), Fe(e, z, I), l = I, v = z, w -= 1, h = [], _ = [];
        } else
          f.delete(d), nt(d, l, r), Fe(e, d.prev, d.next), Fe(e, d, v === null ? e.effect.first : v.next), Fe(e, v, d), v = d;
        continue;
      }
      for (h = [], _ = []; l !== null && l !== d; )
        (f ??= /* @__PURE__ */ new Set()).add(l), _.push(l), l = l.next;
      if (l === null)
        continue;
    }
    (d.f & Me) === 0 && h.push(d), v = d, l = d.next;
  }
  if (e.outrogroups !== null) {
    for (const F of e.outrogroups)
      F.pending.size === 0 && (Ut(Tt(F.done)), e.outrogroups?.delete(F));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || f !== void 0) {
    var L = [];
    if (f !== void 0)
      for (d of f)
        (d.f & se) === 0 && L.push(d);
    for (; l !== null; )
      (l.f & se) === 0 && l !== e.fallback && L.push(l), l = l.next;
    var D = L.length;
    if (D > 0) {
      var R = (n & Dr) !== 0 && i === 0 ? r : null;
      if (s) {
        for (w = 0; w < D; w += 1)
          L[w].nodes?.a?.measure();
        for (w = 0; w < D; w += 1)
          L[w].nodes?.a?.fix();
      }
      As(e, L, R);
    }
  }
  s && vt(() => {
    if (p !== void 0)
      for (d of p)
        d.nodes?.a?.apply();
  });
}
function Ns(e, t, r, n, a, s, i, o) {
  var l = (i & Yn) !== 0 ? (i & Hn) === 0 ? /* @__PURE__ */ ns(r, !1, !1) : Le(r) : null, f = (i & jn) !== 0 ? Le(a) : null;
  return {
    v: l,
    i: f,
    e: ue(() => (s(t, l ?? r, f ?? a, o), () => {
      e.delete(n);
    }))
  };
}
function nt(e, t, r) {
  if (e.nodes)
    for (var n = e.nodes.start, a = e.nodes.end, s = t && (t.f & Me) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; n !== null; ) {
      var i = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ dt(n)
      );
      if (s.before(n), n === a)
        return;
      n = i;
    }
}
function Fe(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
const pr = [...` 	
\r\f \v\uFEFF`];
function Rs(e, t, r) {
  var n = e == null ? "" : "" + e;
  if (t && (n = n ? n + " " + t : t), r) {
    for (var a in r)
      if (r[a])
        n = n ? n + " " + a : a;
      else if (n.length)
        for (var s = a.length, i = 0; (i = n.indexOf(a, i)) >= 0; ) {
          var o = i + s;
          (i === 0 || pr.includes(n[i - 1])) && (o === n.length || pr.includes(n[o])) ? n = (i === 0 ? "" : n.substring(0, i)) + n.substring(o + 1) : i = o;
        }
  }
  return n === "" ? null : n;
}
function Ve(e, t, r, n, a, s) {
  var i = e.__className;
  if (i !== r || i === void 0) {
    var o = Rs(r, n, s);
    o == null ? e.removeAttribute("class") : e.className = o, e.__className = r;
  } else if (s && a !== s)
    for (var l in s) {
      var f = !!s[l];
      (a == null || f !== !!a[l]) && e.classList.toggle(l, f);
    }
  return s;
}
const Ps = /* @__PURE__ */ Symbol("is custom element"), Is = /* @__PURE__ */ Symbol("is html");
function ln(e, t, r, n) {
  var a = Os(e);
  a[t] !== (a[t] = r) && (t === "loading" && (e[En] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Ys(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Os(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [Ps]: e.nodeName.includes("-"),
      [Is]: e.namespaceURI === qn
    }
  );
}
var mr = /* @__PURE__ */ new Map();
function Ys(e) {
  var t = e.getAttribute("is") || e.nodeName, r = mr.get(t);
  if (r) return r;
  mr.set(t, r = []);
  for (var n, a = e, s = Element.prototype; s !== a; ) {
    n = bn(a);
    for (var i in n)
      n[i].set && r.push(i);
    a = Sr(a);
  }
  return r;
}
function gr(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet();
  Xr(e, "input", async (a) => {
    var s = a ? e.defaultValue : e.value;
    if (s = Yt(e) ? jt(s) : s, r(s), O !== null && n.add(O), await bs(), s !== (s = t())) {
      var i = e.selectionStart, o = e.selectionEnd, l = e.value.length;
      if (e.value = s ?? "", o !== null) {
        var f = e.value.length;
        i === o && o === l && f > l ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = i, e.selectionEnd = Math.min(o, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  _t(t) == null && e.value && (r(Yt(e) ? jt(e.value) : e.value), O !== null && n.add(O)), Ft(() => {
    var a = t();
    if (e === document.activeElement) {
      var s = (
        /** @type {Batch} */
        yt ?? O
      );
      if (n.has(s))
        return;
    }
    Yt(e) && a === jt(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
function js(e, t, r = t) {
  Xr(e, "change", (n) => {
    var a = n ? e.defaultChecked : e.checked;
    r(a);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  // If defaultChecked is set, then checked == defaultChecked
  _t(t) == null && r(e.checked), Ft(() => {
    var n = t();
    e.checked = !!n;
  });
}
function Yt(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function jt(e) {
  return e === "" ? null : +e;
}
function br(e, t) {
  return e === t || e?.[bt] === t;
}
function gt(e = {}, t, r, n) {
  return ds(() => {
    var a, s;
    return Ft(() => {
      a = s, s = [], _t(() => {
        e !== r(...s) && (t(e, ...s), a && br(r(...a), e) && t(null, ...a));
      });
    }), () => {
      vt(() => {
        s && br(r(...s), e) && t(null, ...s);
      });
    };
  }), e;
}
function yr(e, t, r, n) {
  var a = (
    /** @type {V} */
    n
  ), s = !0, i = () => (s && (s = !1, a = /** @type {V} */
  n), a), o;
  o = /** @type {V} */
  e[t], o === void 0 && n !== void 0 && (o = i());
  var l;
  return l = () => {
    var f = (
      /** @type {V} */
      e[t]
    );
    return f === void 0 ? i() : (s = !0, f);
  }, l;
}
function Rt(e) {
  ie === null && Dn(), cs(() => {
    const t = _t(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Cs = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Cs);
var Hs = /* @__PURE__ */ Z('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Ls = /* @__PURE__ */ Z('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><span> </span></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), zs = /* @__PURE__ */ Z('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), qs = /* @__PURE__ */ Z('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), Xs = /* @__PURE__ */ Z('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4"> </h2> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">前へ</button> <span class="svelte-13s7gu4"> </span> <button class="svelte-13s7gu4">次へ</button></div></div> <div><!></div></div>');
function Us(e, t) {
  ut(t, !0);
  let r = /* @__PURE__ */ H(de([])), n = /* @__PURE__ */ H(0), a = /* @__PURE__ */ H(0), s = 50, i = /* @__PURE__ */ H(!0);
  async function o() {
    T(i, !0);
    try {
      const R = await (await fetch(`/admin/api/entries?limit=${s}&offset=${u(a)}`)).json();
      T(r, R.entries || [], !0), T(n, R.total || 0, !0);
    } catch (D) {
      console.error(D);
    } finally {
      T(i, !1);
    }
  }
  Rt(o);
  function l() {
    u(a) + s < u(n) && (T(a, u(a) + s), o());
  }
  function f() {
    u(a) - s >= 0 && (T(a, u(a) - s), o());
  }
  var v = Xs(), p = M(v), h = M(p), _ = M(h), x = A(h, 2), g = M(x);
  g.__click = f;
  var d = A(g, 2), w = M(d), P = A(d, 2);
  P.__click = l;
  var I = A(p, 2);
  let k;
  var E = M(I);
  {
    var z = (D) => {
      var R = Hs();
      q(D, R);
    }, L = (D) => {
      var R = qs(), F = St(R), y = A(M(F));
      tr(y, 21, () => u(r), er, (c, b) => {
        var Y = Ls(), B = M(Y), ve = M(B), te = A(B), le = M(te), Ae = A(te), G = M(Ae), X = M(G), re = A(Ae), qe = M(re), tt = M(qe), Xe = A(qe, 2), Ue = M(Xe), Pt = M(Ue), Je = A(re), It = M(Je);
        It.__click = () => t.onEdit(u(b).id), ke(() => {
          U(ve, u(b).id), U(le, u(b).date), Ve(G, 1, `status status-${u(b).status ?? ""}`, "svelte-13s7gu4"), U(X, u(b).status), U(tt, u(b).title), ln(Ue, "href", `/${u(b).path ?? ""}`), U(Pt, `/${u(b).path ?? ""}`);
        }), q(c, Y);
      });
      var S = A(F, 2);
      {
        var m = (c) => {
          var b = zs();
          q(c, b);
        };
        ge(S, (c) => {
          u(i) && c(m);
        });
      }
      q(D, R);
    };
    ge(E, (D) => {
      u(i) && u(r).length === 0 ? D(z) : D(L, !1);
    });
  }
  ke(
    (D) => {
      U(_, `エントリ一覧 (${u(n) ?? ""})`), g.disabled = u(a) === 0 || u(i), U(w, `${u(a) + 1} - ${D ?? ""} / ${u(n) ?? ""}`), P.disabled = u(a) + s >= u(n) || u(i), k = Ve(I, 1, "table-container svelte-13s7gu4", null, k, { "is-loading": u(i) });
    },
    [() => Math.min(u(a) + s, u(n))]
  ), q(e, v), ct();
}
Nt(["click"]);
function Js(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Ct = { exports: {} }, wr;
function Bs() {
  return wr || (wr = 1, (function(e) {
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
      function a(g, d, w) {
        var P = g || r, I = d || 0, k = w || !1, E = 0, z;
        function L(F, y) {
          var S;
          if (y) {
            if (S = y.getTime(), k) {
              var c = v(y);
              if (y = new Date(S + c + I), v(y) !== c) {
                var b = v(y);
                y = new Date(S + b + I);
              }
            }
          } else {
            var m = Date.now();
            m > E ? (E = m, z = new Date(E), S = E, k && (z = new Date(E + v(z) + I))) : S = E, y = z;
          }
          return D(F, y, P, S);
        }
        function D(F, y, S, m) {
          for (var c = "", b = null, Y = !1, B = F.length, ve = !1, te = 0; te < B; te++) {
            var le = F.charCodeAt(te);
            if (Y === !0) {
              if (le === 45) {
                b = "";
                continue;
              } else if (le === 95) {
                b = " ";
                continue;
              } else if (le === 48) {
                b = "0";
                continue;
              } else if (le === 58) {
                ve && x("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), ve = !0;
                continue;
              }
              switch (le) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  c += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  c += S.days[y.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  c += S.months[y.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  c += s(Math.floor(y.getFullYear() / 100), b);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  c += D(S.formats.D, y, S, m);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  c += D(S.formats.F, y, S, m);
                  break;
                // '00'
                // case 'H':
                case 72:
                  c += s(y.getHours(), b);
                  break;
                // '12'
                // case 'I':
                case 73:
                  c += s(o(y.getHours()), b);
                  break;
                // '000'
                // case 'L':
                case 76:
                  c += i(Math.floor(m % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  c += s(y.getMinutes(), b);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  c += y.getHours() < 12 ? S.am : S.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  c += D(S.formats.R, y, S, m);
                  break;
                // '00'
                // case 'S':
                case 83:
                  c += s(y.getSeconds(), b);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  c += D(S.formats.T, y, S, m);
                  break;
                // '00'
                // case 'U':
                case 85:
                  c += s(l(y, "sunday"), b);
                  break;
                // '00'
                // case 'W':
                case 87:
                  c += s(l(y, "monday"), b);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  c += D(S.formats.X, y, S, m);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  c += y.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (k && I === 0)
                    c += "GMT";
                  else {
                    var Ae = p(y);
                    c += Ae || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  c += S.shortDays[y.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  c += S.shortMonths[y.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  c += D(S.formats.c, y, S, m);
                  break;
                // '01'
                // case 'd':
                case 100:
                  c += s(y.getDate(), b);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  c += s(y.getDate(), b ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  c += S.shortMonths[y.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var G = new Date(y.getFullYear(), 0, 1), X = Math.ceil((y.getTime() - G.getTime()) / (1e3 * 60 * 60 * 24));
                  c += i(X);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  c += s(y.getHours(), b ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  c += s(o(y.getHours()), b ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  c += s(y.getMonth() + 1, b);
                  break;
                // '\n'
                // case 'n':
                case 110:
                  c += `
`;
                  break;
                // '1st'
                // case 'o':
                case 111:
                  var X = y.getDate();
                  S.ordinalSuffixes ? c += String(X) + (S.ordinalSuffixes[X - 1] || f(X)) : c += String(X) + f(X);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  c += y.getHours() < 12 ? S.AM : S.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  c += D(S.formats.r, y, S, m);
                  break;
                // '0'
                // case 's':
                case 115:
                  c += Math.floor(m / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  c += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var X = y.getDay();
                  c += X === 0 ? 7 : X;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  c += D(S.formats.v, y, S, m);
                  break;
                // '4'
                // case 'w':
                case 119:
                  c += y.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  c += D(S.formats.x, y, S, m);
                  break;
                // '70'
                // case 'y':
                case 121:
                  c += s(y.getFullYear() % 100, b);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (k && I === 0)
                    c += ve ? "+00:00" : "+0000";
                  else {
                    var re;
                    I !== 0 ? re = I / (60 * 1e3) : re = -y.getTimezoneOffset();
                    var qe = re < 0 ? "-" : "+", tt = ve ? ":" : "", Xe = Math.floor(Math.abs(re / 60)), Ue = Math.abs(re % 60);
                    c += qe + s(Xe) + tt + s(Ue);
                  }
                  break;
                default:
                  Y && (c += "%"), c += F[te];
                  break;
              }
              b = null, Y = !1;
              continue;
            }
            if (le === 37) {
              Y = !0;
              continue;
            }
            c += F[te];
          }
          return c;
        }
        var R = L;
        return R.localize = function(F) {
          return new a(F || P, I, k);
        }, R.localizeByIdentifier = function(F) {
          var y = t[F];
          return y ? R.localize(y) : (x('[WARNING] No locale found with identifier "' + F + '".'), R);
        }, R.timezone = function(F) {
          var y = I, S = k, m = typeof F;
          if (m === "number" || m === "string")
            if (S = !0, m === "string") {
              var c = F[0] === "-" ? -1 : 1, b = parseInt(F.slice(1, 3), 10), Y = parseInt(F.slice(3, 5), 10);
              y = c * (60 * b + Y) * 60 * 1e3;
            } else m === "number" && (y = F * 60 * 1e3);
          return new a(P, y, S);
        }, R.utc = function() {
          return new a(P, I, !0);
        }, R;
      }
      function s(g, d) {
        return d === "" || g > 9 ? "" + g : (d == null && (d = "0"), d + g);
      }
      function i(g) {
        return g > 99 ? g : g > 9 ? "0" + g : "00" + g;
      }
      function o(g) {
        return g === 0 ? 12 : g > 12 ? g - 12 : g;
      }
      function l(g, d) {
        d = d || "sunday";
        var w = g.getDay();
        d === "monday" && (w === 0 ? w = 6 : w--);
        var P = Date.UTC(g.getFullYear(), 0, 1), I = Date.UTC(g.getFullYear(), g.getMonth(), g.getDate()), k = Math.floor((I - P) / 864e5), E = (k + 7 - w) / 7;
        return Math.floor(E);
      }
      function f(g) {
        var d = g % 10, w = g % 100;
        if (w >= 11 && w <= 13 || d === 0 || d >= 4)
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
      function v(g) {
        return (g.getTimezoneOffset() || 0) * 6e4;
      }
      function p(g, d) {
        return h() || _(g);
      }
      function h(g, d) {
        return null;
      }
      function _(g) {
        var d = g.toString().match(/\(([\w\s]+)\)/);
        return d && d[1];
      }
      function x(g) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(g);
      }
    })();
  })(Ct)), Ct.exports;
}
var $s = Bs();
const on = /* @__PURE__ */ Js($s);
var Vs = /* @__PURE__ */ Z('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), Ks = /* @__PURE__ */ Z('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), Zs = /* @__PURE__ */ Z('<button id="restore" type="button" class="submit-button svelte-7nstam">復元...</button>'), Ws = /* @__PURE__ */ Z('<div class="tag-item svelte-7nstam"> </div>'), Gs = /* @__PURE__ */ Z('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam">📷 写真</button></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons svelte-7nstam"><div class="options svelte-7nstam"><label class="svelte-7nstam"><input type="checkbox" class="svelte-7nstam"/> 公開を遅延</label></div> <button type="button" class="submit-button svelte-7nstam"> </button> <!></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog>', 1);
function Qs(e, t) {
  ut(t, !0);
  let r = yr(t, "sk", 3, ""), n = yr(t, "id", 3, null), a = /* @__PURE__ */ H(de({ id: null, title: "", body: "", status: null })), s = de({ id: null, title: "", body: "", publishLater: !1 }), i = /* @__PURE__ */ H(!1), o = /* @__PURE__ */ H(!1), l = /* @__PURE__ */ H(""), f = /* @__PURE__ */ H(null), v = /* @__PURE__ */ H(null), p = /* @__PURE__ */ H(null), h = /* @__PURE__ */ H(null), _ = /* @__PURE__ */ H(null);
  async function x(m) {
    T(o, !0);
    try {
      const c = await fetch(`/admin/api/entry/${m}`);
      if (!c.ok) throw new Error("Failed to fetch entry");
      const b = await c.json();
      T(a, b, !0), s.id = b.id, s.title = b.title, s.body = b.body, s.publishLater = b.status === "scheduled", g();
    } catch (c) {
      console.error(c), alert("エントリの取得に失敗しました");
    } finally {
      T(o, !1);
    }
  }
  Rt(() => {
    n() ? x(n()) : (T(a, { id: null, title: "", body: "", status: "public" }, !0), s.id = null, s.title = "", s.body = "", s.publishLater = !1, g());
    const m = setInterval(d, 3e3);
    return () => clearInterval(m);
  });
  function g() {
    if (!u(a).id && u(a).id !== null) return;
    const m = `nogag-backup-${u(a).id || "new"}`, c = localStorage.getItem(m);
    if (c) {
      const b = JSON.parse(c);
      (u(a).title !== b.title || u(a).body !== b.body) && T(f, b, !0);
    }
  }
  function d() {
    if (u(a).title !== s.title || u(a).body !== s.body) {
      const m = `nogag-backup-${u(a).id || "new"}`, c = { title: s.title, body: s.body, time: Date.now() };
      localStorage.setItem(m, JSON.stringify(c)), T(f, null);
    }
  }
  async function w() {
    T(i, !0), T(l, "リクエスト中");
    const m = new FormData();
    if (m.set("id", s.id || ""), m.set("title", s.title), m.set("body", s.body), m.set("sk", r()), s.publishLater) {
      const c = u(a).publish_at_epoch || u(a).publish_at || Math.floor(Date.now() / 1e3) + 2592e3;
      m.set("publish_at", String(c)), m.set("status", "scheduled");
    } else
      m.set("status", "public");
    try {
      const Y = (await (await fetch("/admin/api/edit", {
        method: "POST",
        headers: { "X-Requested-With": "fetch" },
        body: m
      })).json()).session_id;
      if (!Y)
        throw new Error("保存に失敗しました");
      P(Y);
    } catch (c) {
      T(i, !1), alert(c instanceof Error ? c.message : "エラーが発生しました");
    }
  }
  function P(m) {
    const c = new EventSource(`/admin/api/edit/progress?sid=${m}`);
    c.onmessage = (b) => {
      const Y = JSON.parse(b.data);
      switch (Y.type) {
        case "progress":
          T(l, I(Y.message), !0);
          break;
        case "done":
          localStorage.removeItem(`nogag-backup-${u(a).id || "new"}`), T(l, "完了"), T(i, !1), c.close(), t.onSave(Y.location);
          break;
        case "error":
          T(l, "エラー: " + Y.message), T(i, !1), c.close(), alert("保存に失敗しました: " + Y.message);
          break;
      }
    }, c.onerror = () => {
      T(i, !1), c.close(), alert("通信エラーが発生しました");
    };
  }
  function I(m) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[m] || m;
  }
  function k(m) {
    s.title = `[${m}]${s.title}`, u(h).close(), u(v).focus();
  }
  function E() {
    u(f) && (s.title = u(f).title, s.body = u(f).body, u(_).close());
  }
  async function z() {
    const m = document.createElement("input");
    m.type = "file", m.oninput = async () => {
      if (!m.files?.[0]) return;
      const c = new FormData();
      c.append("file", m.files[0]), c.append("sk", r());
      try {
        const Y = await (await fetch("/admin/api/upload/image", {
          method: "POST",
          headers: { "X-Requested-With": "fetch" },
          body: c
        })).json(), B = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${Y.uploaded}" class="picasa" itemprop="url"><img src="${Y.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        L(B, !0);
      } catch {
        alert("アップロードに失敗しました");
      }
    }, m.click();
  }
  function L(m, c = !1) {
    const b = u(p).selectionStart, Y = u(p).selectionEnd, B = u(p).value;
    s.body = B.substring(0, b) + m + B.substring(Y), setTimeout(
      () => {
        typeof c == "boolean" && c ? (u(p).selectionStart = b, u(p).selectionEnd = b + m.length) : typeof c == "number" ? u(p).selectionStart = u(p).selectionEnd = b + c : u(p).selectionStart = u(p).selectionEnd = b + m.length, u(p).focus();
      },
      0
    );
  }
  function D(m) {
    (m.altKey ? "Alt-" : "") + (m.ctrlKey ? "Control-" : "") + (m.metaKey ? "Meta-" : "") + (m.shiftKey ? "Shift-" : "") + m.key === "Control-t" && (L("\\(  \\)", 3), m.preventDefault(), m.stopPropagation());
  }
  var R = an(), F = St(R);
  {
    var y = (m) => {
      var c = Vs();
      q(m, c);
    }, S = (m) => {
      var c = Gs(), b = St(c), Y = M(b), B = M(Y);
      gt(B, (C) => T(v, C), () => u(v));
      var ve = A(B, 2), te = M(ve);
      te.__click = () => u(h).showModal();
      var le = A(te, 2);
      le.__click = z;
      var Ae = A(ve, 2), G = M(Ae);
      G.__keydown = D, gt(G, (C) => T(p, C), () => u(p));
      var X = A(Y, 2), re = M(X);
      {
        var qe = (C) => {
          var _e = Ks();
          q(C, _e);
        };
        ge(re, (C) => {
          u(i) && C(qe);
        });
      }
      var tt = A(re, 2), Xe = M(tt), Ue = M(Xe), Pt = M(Ue), Je = A(Xe, 2);
      Je.__click = w;
      var It = M(Je), fn = A(Je, 2);
      {
        var un = (C) => {
          var _e = Zs();
          _e.__click = () => u(_).showModal(), q(C, _e);
        };
        ge(fn, (C) => {
          u(f) && C(un);
        });
      }
      var Ot = A(b, 2), rr = A(M(Ot), 2);
      tr(
        rr,
        20,
        () => [
          "tech",
          "photo",
          "redeveloped",
          "stablediffusion",
          "photoshopped"
        ],
        er,
        (C, _e) => {
          var rt = Ws();
          rt.__click = () => k(_e);
          var pn = M(rt);
          ke(() => U(pn, _e)), q(C, rt);
        }
      );
      var cn = A(rr, 2);
      cn.__click = () => u(h).close(), gt(Ot, (C) => T(h, C), () => u(h));
      var nr = A(Ot, 2), sr = A(M(nr), 2), vn = M(sr);
      {
        var dn = (C) => {
          var _e = ks();
          ke((rt) => U(_e, rt), [
            () => on("%Y年%m月%d日%H時", new Date(u(f).time))
          ]), q(C, _e);
        };
        ge(vn, (C) => {
          u(f) && C(dn);
        });
      }
      var hn = A(sr, 2), ar = M(hn);
      ar.__click = () => u(_).close();
      var _n = A(ar, 2);
      _n.__click = E, gt(nr, (C) => T(_, C), () => u(_)), ke(() => {
        Je.disabled = u(i), U(It, u(i) ? u(l) || "リクエスト中" : "更新");
      }), gr(B, () => s.title, (C) => s.title = C), gr(G, () => s.body, (C) => s.body = C), js(Pt, () => s.publishLater, (C) => s.publishLater = C), q(m, c);
    };
    ge(F, (m) => {
      u(o) ? m(y) : m(S, !1);
    });
  }
  q(e, R), ct();
}
Nt(["click", "keydown"]);
var ea = /* @__PURE__ */ Z('<div class="loading svelte-1r6codn"></div>'), ta = /* @__PURE__ */ Z('<div class="error-text svelte-1r6codn"> </div>'), ra = /* @__PURE__ */ Z('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><span> </span></td><td class="svelte-1r6codn"> </td><td class="time svelte-1r6codn"> </td><td class="error svelte-1r6codn"><!></td></tr>'), na = /* @__PURE__ */ Z('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), sa = /* @__PURE__ */ Z('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <button class="refresh-btn svelte-1r6codn">更新</button></div> <!></div>');
function aa(e, t) {
  ut(t, !0);
  let r = /* @__PURE__ */ H(de([])), n = /* @__PURE__ */ H(0), a = 0, s = 50, i = /* @__PURE__ */ H(!0);
  async function o() {
    T(i, !0);
    try {
      const P = await (await fetch(`/admin/api/jobs?limit=${s}&offset=${a}`)).json();
      T(r, P.jobs || [], !0), T(n, P.total || 0, !0);
    } catch (w) {
      console.error(w);
    } finally {
      T(i, !1);
    }
  }
  Rt(o);
  function l(w) {
    return on("%Y-%m-%d %H:%M:%S", new Date(w));
  }
  var f = sa(), v = M(f), p = M(v), h = M(p), _ = A(p, 2);
  _.__click = o;
  var x = A(v, 2);
  {
    var g = (w) => {
      var P = ea();
      q(w, P);
    }, d = (w) => {
      var P = na(), I = A(M(P));
      tr(I, 21, () => u(r), er, (k, E) => {
        var z = ra(), L = M(z), D = M(L), R = A(L), F = M(R), y = M(F), S = A(R), m = M(S), c = M(m), b = A(S), Y = M(b), B = A(b), ve = M(B), te = A(B), le = M(te);
        {
          var Ae = (G) => {
            var X = ta(), re = M(X);
            ke(() => {
              ln(X, "title", u(E).error_message), U(re, u(E).error_message);
            }), q(G, X);
          };
          ge(le, (G) => {
            u(E).error_message && G(Ae);
          });
        }
        ke(
          (G) => {
            U(D, u(E).id), U(y, u(E).job_type_name), Ve(m, 1, `status status-${u(E).status ?? ""}`, "svelte-1r6codn"), U(c, u(E).status), U(Y, u(E).retry_count), U(ve, G);
          },
          [() => l(u(E).created_at)]
        ), q(k, z);
      }), q(w, P);
    };
    ge(x, (w) => {
      u(i) ? w(g) : w(d, !1);
    });
  }
  ke(() => U(h, `ジョブ一覧 (${u(n) ?? ""})`)), q(e, f), ct();
}
Nt(["click"]);
var ia = /* @__PURE__ */ Z('<div class="admin-app svelte-1n46o8q"><nav class="sub-nav svelte-1n46o8q"><a href="/admin/">エントリ一覧</a> <a href="/admin/edit">新規作成</a> <a href="/admin/jobs">ジョブ一覧</a></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function la(e, t) {
  ut(t, !0);
  let r = /* @__PURE__ */ H(de(window.location.pathname)), n = /* @__PURE__ */ H(de(new URLSearchParams(window.location.search))), a = /* @__PURE__ */ H("");
  Rt(() => {
    const k = document.querySelector('meta[name="csrf-token"]');
    k && T(a, k.content, !0);
    const E = () => {
      T(r, window.location.pathname, !0), T(n, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", E), () => window.removeEventListener("popstate", E);
  });
  function s(k, E) {
    E && E.preventDefault(), window.history.pushState({}, "", k), T(r, window.location.pathname, !0), T(n, new URLSearchParams(window.location.search), !0);
  }
  const i = /* @__PURE__ */ fr(() => u(r) === "/admin/edit" ? "edit" : u(r) === "/admin/jobs" ? "jobs" : "list"), o = /* @__PURE__ */ fr(() => u(n).get("id"));
  var l = ia(), f = M(l), v = M(f);
  v.__click = (k) => s("/admin/", k);
  let p;
  var h = A(v, 2);
  h.__click = (k) => s("/admin/edit", k);
  let _;
  var x = A(h, 2);
  x.__click = (k) => s("/admin/jobs", k);
  let g;
  var d = A(f, 2), w = M(d);
  {
    var P = (k) => {
      Qs(k, {
        get sk() {
          return u(a);
        },
        get id() {
          return u(o);
        },
        onSave: (E) => window.location.href = E
      });
    }, I = (k) => {
      var E = an(), z = St(E);
      {
        var L = (R) => {
          aa(R, {
            get sk() {
              return u(a);
            }
          });
        }, D = (R) => {
          Us(R, {
            get sk() {
              return u(a);
            },
            onEdit: (F) => s(`/admin/edit?id=${F}`)
          });
        };
        ge(
          z,
          (R) => {
            u(i) === "jobs" ? R(L) : R(D, !1);
          },
          !0
        );
      }
      q(k, E);
    };
    ge(w, (k) => {
      u(i) === "edit" ? k(P) : k(I, !1);
    });
  }
  ke(() => {
    p = Ve(v, 1, "svelte-1n46o8q", null, p, { active: u(i) === "list" }), _ = Ve(h, 1, "svelte-1n46o8q", null, _, { active: u(i) === "edit" && !u(o) }), g = Ve(x, 1, "svelte-1n46o8q", null, g, { active: u(i) === "jobs" });
  }), q(e, l), ct();
}
Nt(["click"]);
const Ht = document.getElementById("admin-root");
Ht && (Ht.innerHTML = "", Es(la, { target: Ht }));
//# sourceMappingURL=admin-front.js.map
