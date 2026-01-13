var Hr = Array.isArray, un = Array.prototype.indexOf, vr = Array.from, cn = Object.defineProperty, dt = Object.getOwnPropertyDescriptor, vn = Object.getOwnPropertyDescriptors, fn = Object.prototype, dn = Array.prototype, cs = Object.getPrototypeOf, Kr = Object.isExtensible;
function Lt(e) {
  return typeof e == "function";
}
const fr = () => {
};
function hn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function vs() {
  var e, t, r = new Promise((s, a) => {
    e = s, t = a;
  });
  return { promise: r, resolve: e, reject: t };
}
function fs(e, t, r = !1) {
  return e === void 0 ? r ? (
    /** @type {() => V} */
    t()
  ) : (
    /** @type {V} */
    t
  ) : e;
}
const ue = 2, Yr = 4, jr = 8, _n = 1 << 24, Ke = 16, We = 32, xt = 64, dr = 128, Ye = 512, fe = 1024, Ee = 2048, Be = 4096, ke = 8192, it = 16384, qr = 32768, mt = 65536, Wr = 1 << 17, ds = 1 << 18, Pt = 1 << 19, pn = 1 << 20, Xe = 1 << 25, bt = 32768, Ir = 1 << 21, $r = 1 << 22, lt = 1 << 23, ht = /* @__PURE__ */ Symbol("$state"), gn = /* @__PURE__ */ Symbol("legacy props"), mn = /* @__PURE__ */ Symbol(""), Et = new class extends Error {
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
const An = 1, Fn = 2, hs = 4, Pn = 8, On = 16, In = 1, Rn = 2, ve = /* @__PURE__ */ Symbol(), Nn = "http://www.w3.org/1999/xhtml";
function Cn() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Ln() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function _s(e) {
  return e === this.v;
}
function Hn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function ps(e) {
  return !Hn(e, this.v);
}
let De = null;
function Tt(e) {
  De = e;
}
function Ze(e, t = !1, r) {
  De = {
    p: De,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function Qe(e) {
  var t = (
    /** @type {ComponentContext} */
    De
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var s of r)
      Os(s);
  }
  return t.i = !0, De = t.p, /** @type {T} */
  {};
}
function gs() {
  return !0;
}
let ft = [];
function ms() {
  var e = ft;
  ft = [], hn(e);
}
function Ot(e) {
  if (ft.length === 0 && !qt) {
    var t = ft;
    queueMicrotask(() => {
      t === ft && ms();
    });
  }
  ft.push(e);
}
function Yn() {
  for (; ft.length > 0; )
    ms();
}
function bs(e) {
  var t = te;
  if (t === null)
    return X.f |= lt, e;
  if ((t.f & qr) === 0) {
    if ((t.f & dr) === 0)
      throw e;
    t.b.error(e);
  } else
    At(e, t);
}
function At(e, t) {
  for (; t !== null; ) {
    if ((t.f & dr) !== 0)
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
const nr = /* @__PURE__ */ new Set();
let W = null, jt = null, Ie = null, Pe = [], hr = null, Rr = !1, qt = !1;
class je {
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
    Pe = [], jt = null, this.apply();
    var r = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const s of t)
      this.#i(s, r);
    this.is_fork || this.#c(), this.is_deferred() ? (this.#l(r.effects), this.#l(r.render_effects)) : (jt = this, W = null, Zr(r.render_effects), Zr(r.effects), jt = null, this.#o?.resolve()), Ie = null;
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
      var a = s.f, n = (a & (We | xt)) !== 0, l = n && (a & fe) !== 0, c = l || (a & ke) !== 0 || this.skipped_effects.has(s);
      if ((s.f & dr) !== 0 && s.b?.is_pending() && (r = {
        parent: r,
        effect: s,
        effects: [],
        render_effects: []
      }), !c && s.fn !== null) {
        n ? s.f ^= fe : (a & Yr) !== 0 ? r.effects.push(s) : Vt(s) && ((s.f & Ke) !== 0 && this.#a.add(s), Xt(s));
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
      (r.f & Ee) !== 0 ? this.#a.add(r) : (r.f & Be) !== 0 && this.#n.add(r), this.#u(r.deps), de(r, fe);
  }
  /**
   * @param {Value[] | null} deps
   */
  #u(t) {
    if (t !== null)
      for (const r of t)
        (r.f & ue) === 0 || (r.f & bt) === 0 || (r.f ^= bt, this.#u(
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
    this.previous.has(t) || this.previous.set(t, r), (t.f & lt) === 0 && (this.current.set(t, t.v), Ie?.set(t, t.v));
  }
  activate() {
    W = this, this.apply();
  }
  deactivate() {
    W === this && (W = null, Ie = null);
  }
  flush() {
    if (this.activate(), Pe.length > 0) {
      if (ws(), W !== null && W !== this)
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
    if (nr.size > 1) {
      this.previous.clear();
      var t = Ie, r = !0, s = {
        parent: null,
        effect: null,
        effects: [],
        render_effects: []
      };
      for (const n of nr) {
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
            ys(d, c, o, f);
          if (Pe.length > 0) {
            W = n, n.apply();
            for (const d of Pe)
              n.#i(d, s);
            n.deactivate();
          }
          Pe = a;
        }
      }
      W = null, Ie = t;
    }
    this.committed = !0, nr.delete(this);
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
      this.#n.delete(t), de(t, Ee), wt(t);
    for (const t of this.#n)
      de(t, Be), wt(t);
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
    return (this.#o ??= vs()).promise;
  }
  static ensure() {
    if (W === null) {
      const t = W = new je();
      nr.add(W), qt || je.enqueue(() => {
        W === t && t.flush();
      });
    }
    return W;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    Ot(t);
  }
  apply() {
  }
}
function jn(e) {
  var t = qt;
  qt = !0;
  try {
    for (var r; ; ) {
      if (Yn(), Pe.length === 0 && (W?.flush(), Pe.length === 0))
        return hr = null, /** @type {T} */
        r;
      ws();
    }
  } finally {
    qt = t;
  }
}
function ws() {
  var e = pt;
  Rr = !0;
  var t = null;
  try {
    var r = 0;
    for (or(!0); Pe.length > 0; ) {
      var s = je.ensure();
      if (r++ > 1e3) {
        var a, n;
        qn();
      }
      s.process(Pe), ot.clear();
    }
  } finally {
    Rr = !1, or(e), hr = null;
  }
}
function qn() {
  try {
    kn();
  } catch (e) {
    At(e, hr);
  }
}
let Je = null;
function Zr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var s = e[r++];
      if ((s.f & (it | ke)) === 0 && Vt(s) && (Je = /* @__PURE__ */ new Set(), Xt(s), s.deps === null && s.first === null && s.nodes === null && (s.teardown === null && s.ac === null ? Cs(s) : s.fn = null), Je?.size > 0)) {
        ot.clear();
        for (const a of Je) {
          if ((a.f & (it | ke)) !== 0) continue;
          const n = [a];
          let l = a.parent;
          for (; l !== null; )
            Je.has(l) && (Je.delete(l), n.push(l)), l = l.parent;
          for (let c = n.length - 1; c >= 0; c--) {
            const o = n[c];
            (o.f & (it | ke)) === 0 && Xt(o);
          }
        }
        Je.clear();
      }
    }
    Je = null;
  }
}
function ys(e, t, r, s) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const n = a.f;
      (n & ue) !== 0 ? ys(
        /** @type {Derived} */
        a,
        t,
        r,
        s
      ) : (n & ($r | Ke)) !== 0 && (n & Ee) === 0 && xs(a, t, s) && (de(a, Ee), wt(
        /** @type {Effect} */
        a
      ));
    }
}
function xs(e, t, r) {
  const s = r.get(e);
  if (s !== void 0) return s;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (t.includes(a))
        return !0;
      if ((a.f & ue) !== 0 && xs(
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
function wt(e) {
  for (var t = hr = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Rr && t === te && (r & Ke) !== 0 && (r & ds) === 0)
      return;
    if ((r & (xt | We)) !== 0) {
      if ((r & fe) === 0) return;
      t.f ^= fe;
    }
  }
  Pe.push(t);
}
function $n(e) {
  let t = 0, r = yt(0), s;
  return () => {
    Ut() && (i(r), pr(() => (t === 0 && (s = Kt(() => e(() => $t(r)))), t += 1, () => {
      Ot(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, $t(r));
      });
    })));
  };
}
var Bn = mt | Pt | dr;
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
  #b = $n(() => (this.#d = yt(this.#v), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, s) {
    this.#t = t, this.#r = r, this.#o = s, this.parent = /** @type {Effect} */
    te.b, this.#e = !!this.#r.pending, this.#a = gr(() => {
      te.b = this;
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
    t && (this.#i = Oe(() => t(this.#t)), je.enqueue(() => {
      var r = this.#g();
      this.#n = this.#_(() => (je.ensure(), Oe(() => this.#o(r)))), this.#f > 0 ? this.#p() : (_t(
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
    return this.#e && (this.#c = Ge(), this.#t.before(this.#c), t = this.#c), t;
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
    var r = te, s = X, a = De;
    ze(this.#a), we(this.#a), Tt(this.#a.ctx);
    try {
      return t();
    } catch (n) {
      return bs(n), null;
    } finally {
      ze(r), we(s), Tt(a);
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
    ), Ys(this.#n, this.#u)), this.#i === null && (this.#i = Oe(() => t(this.#t)));
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
    this.#f += t, this.#f === 0 && (this.#e = !1, this.#i && _t(this.#i, () => {
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
    this.#m(t), this.#v += t, this.#d && Ft(this.#d, this.#v);
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
    this.#n && (ye(this.#n), this.#n = null), this.#i && (ye(this.#i), this.#i = null), this.#l && (ye(this.#l), this.#l = null);
    var a = !1, n = !1;
    const l = () => {
      if (a) {
        Ln();
        return;
      }
      a = !0, n && Tn(), je.ensure(), this.#v = 0, this.#l !== null && _t(this.#l, () => {
        this.#l = null;
      }), this.#e = this.has_pending_snippet(), this.#n = this.#_(() => (this.#h = !1, Oe(() => this.#o(this.#t)))), this.#f > 0 ? this.#p() : this.#e = !1;
    };
    var c = X;
    try {
      we(null), n = !0, r?.(t, l), n = !1;
    } catch (o) {
      At(o, this.#a && this.#a.parent);
    } finally {
      we(c);
    }
    s && Ot(() => {
      this.#l = this.#_(() => {
        je.ensure(), this.#h = !0;
        try {
          return Oe(() => {
            s(
              this.#t,
              () => t,
              () => l
            );
          });
        } catch (o) {
          return At(
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
  const a = Br;
  if (r.length === 0 && e.length === 0) {
    s(t.map(a));
    return;
  }
  var n = W, l = (
    /** @type {Effect} */
    te
  ), c = Xn();
  function o() {
    Promise.all(r.map((f) => /* @__PURE__ */ Gn(f))).then((f) => {
      c();
      try {
        s([...t.map(a), ...f]);
      } catch (d) {
        (l.f & it) === 0 && At(d, l);
      }
      n?.deactivate(), ir();
    }).catch((f) => {
      At(f, l);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    c();
    try {
      return o();
    } finally {
      n?.deactivate(), ir();
    }
  }) : o();
}
function Xn() {
  var e = te, t = X, r = De, s = W;
  return function(n = !0) {
    ze(e), we(t), Tt(r), n && s?.activate();
  };
}
function ir() {
  ze(null), we(null), Tt(null);
}
// @__NO_SIDE_EFFECTS__
function Br(e) {
  var t = ue | Ee, r = X !== null && (X.f & ue) !== 0 ? (
    /** @type {Derived} */
    X
  ) : null;
  return te !== null && (te.f |= Pt), {
    ctx: De,
    deps: null,
    effects: null,
    equals: _s,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ve
    ),
    wv: 0,
    parent: r ?? te,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Gn(e, t) {
  let r = (
    /** @type {Effect | null} */
    te
  );
  r === null && wn();
  var s = (
    /** @type {Boundary} */
    r.b
  ), a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), n = yt(
    /** @type {V} */
    ve
  ), l = !X, c = /* @__PURE__ */ new Map();
  return aa(() => {
    var o = vs();
    a = o.promise;
    try {
      Promise.resolve(e()).then(o.resolve, o.reject).then(() => {
        f === W && f.committed && f.deactivate(), ir();
      });
    } catch (_) {
      o.reject(_), ir();
    }
    var f = (
      /** @type {Batch} */
      W
    );
    if (l) {
      var d = !s.is_pending();
      s.update_pending_count(1), f.increment(d), c.get(f)?.reject(Et), c.delete(f), c.set(f, o);
    }
    const m = (_, p = void 0) => {
      if (f.activate(), p)
        p !== Et && (n.f |= lt, Ft(n, p));
      else {
        (n.f & lt) !== 0 && (n.f ^= lt), Ft(n, _);
        for (const [E, w] of c) {
          if (c.delete(E), E === f) break;
          w.reject(Et);
        }
      }
      l && (s.update_pending_count(-1), f.decrement(d));
    };
    o.promise.then(m, (_) => m(null, _ || "unknown"));
  }), Xr(() => {
    for (const o of c.values())
      o.reject(Et);
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
function at(e) {
  const t = /* @__PURE__ */ Br(e);
  return js(t), t;
}
// @__NO_SIDE_EFFECTS__
function zr(e) {
  const t = /* @__PURE__ */ Br(e);
  return t.equals = ps, t;
}
function Ms(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      ye(
        /** @type {Effect} */
        t[r]
      );
  }
}
function Vn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & ue) === 0)
      return (t.f & it) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ur(e) {
  var t, r = te;
  ze(Vn(e));
  try {
    e.f &= ~bt, Ms(e), t = zs(e);
  } finally {
    ze(r);
  }
  return t;
}
function ks(e) {
  var t = Ur(e);
  if (e.equals(t) || (W?.is_fork || (e.v = t), e.wv = $s()), !It)
    if (Ie !== null)
      (Ut() || W?.is_fork) && Ie.set(e, t);
    else {
      var r = (e.f & Ye) === 0 ? Be : fe;
      de(e, r);
    }
}
let Nr = /* @__PURE__ */ new Set();
const ot = /* @__PURE__ */ new Map();
let Ss = !1;
function yt(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: _s,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function H(e, t) {
  const r = yt(e);
  return js(r), r;
}
// @__NO_SIDE_EFFECTS__
function Kn(e, t = !1, r = !0) {
  const s = yt(e);
  return t || (s.equals = ps), s;
}
function D(e, t, r = !1) {
  X !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!qe || (X.f & Wr) !== 0) && gs() && (X.f & (ue | Ke | $r | Wr)) !== 0 && !Ve?.includes(e) && Dn();
  let s = r ? be(t) : t;
  return Ft(e, s);
}
function Ft(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    It ? ot.set(e, t) : ot.set(e, r), e.v = t;
    var s = je.ensure();
    s.capture(e, r), (e.f & ue) !== 0 && ((e.f & Ee) !== 0 && Ur(
      /** @type {Derived} */
      e
    ), de(e, (e.f & Ye) !== 0 ? fe : Be)), e.wv = $s(), Es(e, Ee), te !== null && (te.f & fe) !== 0 && (te.f & (We | xt)) === 0 && (Fe === null ? oa([e]) : Fe.push(e)), !s.is_fork && Nr.size > 0 && !Ss && Wn();
  }
  return t;
}
function Wn() {
  Ss = !1;
  var e = pt;
  or(!0);
  const t = Array.from(Nr);
  try {
    for (const r of t)
      (r.f & fe) !== 0 && de(r, Be), Vt(r) && Xt(r);
  } finally {
    or(e);
  }
  Nr.clear();
}
function $t(e) {
  D(e, e.v + 1);
}
function Es(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, a = 0; a < s; a++) {
      var n = r[a], l = n.f, c = (l & Ee) === 0;
      if (c && de(n, t), (l & ue) !== 0) {
        var o = (
          /** @type {Derived} */
          n
        );
        Ie?.delete(o), (l & bt) === 0 && (l & Ye && (n.f |= bt), Es(o, Be));
      } else c && ((l & Ke) !== 0 && Je !== null && Je.add(
        /** @type {Effect} */
        n
      ), wt(
        /** @type {Effect} */
        n
      ));
    }
}
function be(e) {
  if (typeof e != "object" || e === null || ht in e)
    return e;
  const t = cs(e);
  if (t !== fn && t !== dn)
    return e;
  var r = /* @__PURE__ */ new Map(), s = Hr(e), a = /* @__PURE__ */ H(0), n = gt, l = (c) => {
    if (gt === n)
      return c();
    var o = X, f = gt;
    we(null), ss(n);
    var d = c();
    return we(o), ss(f), d;
  };
  return s && r.set("length", /* @__PURE__ */ H(
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
          var m = /* @__PURE__ */ H(f.value);
          return r.set(o, m), m;
        }) : D(d, f.value, !0), !0;
      },
      deleteProperty(c, o) {
        var f = r.get(o);
        if (f === void 0) {
          if (o in c) {
            const d = l(() => /* @__PURE__ */ H(ve));
            r.set(o, d), $t(a);
          }
        } else
          D(f, ve), $t(a);
        return !0;
      },
      get(c, o, f) {
        if (o === ht)
          return e;
        var d = r.get(o), m = o in c;
        if (d === void 0 && (!m || dt(c, o)?.writable) && (d = l(() => {
          var p = be(m ? c[o] : ve), E = /* @__PURE__ */ H(p);
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
        if (o === ht)
          return !0;
        var f = r.get(o), d = f !== void 0 && f.v !== ve || Reflect.has(c, o);
        if (f !== void 0 || te !== null && (!d || dt(c, o)?.writable)) {
          f === void 0 && (f = l(() => {
            var _ = d ? be(c[o]) : ve, p = /* @__PURE__ */ H(_);
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
            E !== void 0 ? D(E, ve) : p in c && (E = l(() => /* @__PURE__ */ H(ve)), r.set(p + "", E));
          }
        if (m === void 0)
          (!_ || dt(c, o)?.writable) && (m = l(() => /* @__PURE__ */ H(void 0)), D(m, be(f)), r.set(o, m));
        else {
          _ = m.v !== ve;
          var w = l(() => be(f));
          D(m, w);
        }
        var v = Reflect.getOwnPropertyDescriptor(c, o);
        if (v?.set && v.set.call(d, f), !_) {
          if (s && typeof o == "string") {
            var g = (
              /** @type {Source<number>} */
              r.get("length")
            ), N = Number(o);
            Number.isInteger(N) && N >= g.v && D(g, N + 1);
          }
          $t(a);
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
function Qr(e) {
  try {
    if (e !== null && typeof e == "object" && ht in e)
      return e[ht];
  } catch {
  }
  return e;
}
function Zn(e, t) {
  return Object.is(Qr(e), Qr(t));
}
var es, Ds, Ts, As;
function Qn() {
  if (es === void 0) {
    es = window, Ds = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    Ts = dt(t, "firstChild").get, As = dt(t, "nextSibling").get, Kr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Kr(r) && (r.__t = void 0);
  }
}
function Ge(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function lr(e) {
  return (
    /** @type {TemplateNode | null} */
    Ts.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Gt(e) {
  return (
    /** @type {TemplateNode | null} */
    As.call(e)
  );
}
function u(e, t) {
  return /* @__PURE__ */ lr(e);
}
function ut(e, t = !1) {
  {
    var r = /* @__PURE__ */ lr(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ Gt(r) : r;
  }
}
function h(e, t = 1, r = !1) {
  let s = e;
  for (; t--; )
    s = /** @type {TemplateNode} */
    /* @__PURE__ */ Gt(s);
  return s;
}
function ea(e) {
  e.textContent = "";
}
function Fs() {
  return !1;
}
let ts = !1;
function ta() {
  ts || (ts = !0, document.addEventListener(
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
function _r(e) {
  var t = X, r = te;
  we(null), ze(null);
  try {
    return e();
  } finally {
    we(t), ze(r);
  }
}
function Jr(e, t, r, s = r) {
  e.addEventListener(t, () => _r(r));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), s(!0);
  } : e.__on_r = () => s(!0), ta();
}
function ra(e) {
  te === null && (X === null && Mn(), xn()), It && yn();
}
function sa(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function et(e, t, r) {
  var s = te;
  s !== null && (s.f & ke) !== 0 && (e |= ke);
  var a = {
    ctx: De,
    deps: null,
    nodes: null,
    f: e | Ee | Ye,
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
      Xt(a), a.f |= qr;
    } catch (c) {
      throw ye(a), c;
    }
  else t !== null && wt(a);
  var n = a;
  if (r && n.deps === null && n.teardown === null && n.nodes === null && n.first === n.last && // either `null`, or a singular child
  (n.f & Pt) === 0 && (n = n.first, (e & Ke) !== 0 && (e & mt) !== 0 && n !== null && (n.f |= mt)), n !== null && (n.parent = s, s !== null && sa(n, s), X !== null && (X.f & ue) !== 0 && (e & xt) === 0)) {
    var l = (
      /** @type {Derived} */
      X
    );
    (l.effects ??= []).push(n);
  }
  return a;
}
function Ut() {
  return X !== null && !qe;
}
function Xr(e) {
  const t = et(jr, null, !1);
  return de(t, fe), t.teardown = e, t;
}
function Ps(e) {
  ra();
  var t = (
    /** @type {Effect} */
    te.f
  ), r = !X && (t & We) !== 0 && (t & qr) === 0;
  if (r) {
    var s = (
      /** @type {ComponentContext} */
      De
    );
    (s.e ??= []).push(e);
  } else
    return Os(e);
}
function Os(e) {
  return et(Yr | pn, e, !1);
}
function na(e) {
  je.ensure();
  const t = et(xt | Pt, e, !0);
  return (r = {}) => new Promise((s) => {
    r.outro ? _t(t, () => {
      ye(t), s(void 0);
    }) : (ye(t), s(void 0));
  });
}
function Is(e) {
  return et(Yr, e, !1);
}
function aa(e) {
  return et($r | Pt, e, !0);
}
function pr(e, t = 0) {
  return et(jr | t, e, !0);
}
function Z(e, t = [], r = [], s = []) {
  Jn(s, t, r, (a) => {
    et(jr, () => e(...a.map(i)), !0);
  });
}
function gr(e, t = 0) {
  var r = et(Ke | t, e, !0);
  return r;
}
function Oe(e) {
  return et(We | Pt, e, !0);
}
function Rs(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = It, s = X;
    rs(!0), we(null);
    try {
      t.call(null);
    } finally {
      rs(r), we(s);
    }
  }
}
function Ns(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const a = r.ac;
    a !== null && _r(() => {
      a.abort(Et);
    });
    var s = r.next;
    (r.f & xt) !== 0 ? r.parent = null : ye(r, t), r = s;
  }
}
function ia(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & We) === 0 && ye(t), t = r;
  }
}
function ye(e, t = !0) {
  var r = !1;
  (t || (e.f & ds) !== 0) && e.nodes !== null && e.nodes.end !== null && (la(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), Ns(e, t && !r), ur(e, 0), de(e, it);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const n of s)
      n.stop();
  Rs(e);
  var a = e.parent;
  a !== null && a.first !== null && Cs(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function la(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ Gt(e);
    e.remove(), e = r;
  }
}
function Cs(e) {
  var t = e.parent, r = e.prev, s = e.next;
  r !== null && (r.next = s), s !== null && (s.prev = r), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = r));
}
function _t(e, t, r = !0) {
  var s = [];
  Ls(e, s, !0);
  var a = () => {
    r && ye(e), t && t();
  }, n = s.length;
  if (n > 0) {
    var l = () => --n || a();
    for (var c of s)
      c.out(l);
  } else
    a();
}
function Ls(e, t, r) {
  if ((e.f & ke) === 0) {
    e.f ^= ke;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const c of s)
        (c.is_global || r) && t.push(c);
    for (var a = e.first; a !== null; ) {
      var n = a.next, l = (a.f & mt) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (a.f & We) !== 0 && (e.f & Ke) !== 0;
      Ls(a, t, l ? r : !1), a = n;
    }
  }
}
function Gr(e) {
  Hs(e, !0);
}
function Hs(e, t) {
  if ((e.f & ke) !== 0) {
    e.f ^= ke, (e.f & fe) === 0 && (de(e, Ee), wt(e));
    for (var r = e.first; r !== null; ) {
      var s = r.next, a = (r.f & mt) !== 0 || (r.f & We) !== 0;
      Hs(r, a ? t : !1), r = s;
    }
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const l of n)
        (l.is_global || t) && l.in();
  }
}
function Ys(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end; r !== null; ) {
      var a = r === s ? null : /* @__PURE__ */ Gt(r);
      t.append(r), r = a;
    }
}
let pt = !1;
function or(e) {
  pt = e;
}
let It = !1;
function rs(e) {
  It = e;
}
let X = null, qe = !1;
function we(e) {
  X = e;
}
let te = null;
function ze(e) {
  te = e;
}
let Ve = null;
function js(e) {
  X !== null && (Ve === null ? Ve = [e] : Ve.push(e));
}
let _e = null, Me = 0, Fe = null;
function oa(e) {
  Fe = e;
}
let qs = 1, Jt = 0, gt = Jt;
function ss(e) {
  gt = e;
}
function $s() {
  return ++qs;
}
function Vt(e) {
  var t = e.f;
  if ((t & Ee) !== 0)
    return !0;
  if (t & ue && (e.f &= ~bt), (t & Be) !== 0) {
    var r = e.deps;
    if (r !== null)
      for (var s = r.length, a = 0; a < s; a++) {
        var n = r[a];
        if (Vt(
          /** @type {Derived} */
          n
        ) && ks(
          /** @type {Derived} */
          n
        ), n.wv > e.wv)
          return !0;
      }
    (t & Ye) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ie === null && de(e, fe);
  }
  return !1;
}
function Bs(e, t, r = !0) {
  var s = e.reactions;
  if (s !== null && !Ve?.includes(e))
    for (var a = 0; a < s.length; a++) {
      var n = s[a];
      (n.f & ue) !== 0 ? Bs(
        /** @type {Derived} */
        n,
        t,
        !1
      ) : t === n && (r ? de(n, Ee) : (n.f & fe) !== 0 && de(n, Be), wt(
        /** @type {Effect} */
        n
      ));
    }
}
function zs(e) {
  var t = _e, r = Me, s = Fe, a = X, n = Ve, l = De, c = qe, o = gt, f = e.f;
  _e = /** @type {null | Value[]} */
  null, Me = 0, Fe = null, X = (f & (We | xt)) === 0 ? e : null, Ve = null, Tt(e.ctx), qe = !1, gt = ++Jt, e.ac !== null && (_r(() => {
    e.ac.abort(Et);
  }), e.ac = null);
  try {
    e.f |= Ir;
    var d = (
      /** @type {Function} */
      e.fn
    ), m = d(), _ = e.deps;
    if (_e !== null) {
      var p;
      if (ur(e, Me), _ !== null && Me > 0)
        for (_.length = Me + _e.length, p = 0; p < _e.length; p++)
          _[Me + p] = _e[p];
      else
        e.deps = _ = _e;
      if (Ut() && (e.f & Ye) !== 0)
        for (p = Me; p < _.length; p++)
          (_[p].reactions ??= []).push(e);
    } else _ !== null && Me < _.length && (ur(e, Me), _.length = Me);
    if (gs() && Fe !== null && !qe && _ !== null && (e.f & (ue | Be | Ee)) === 0)
      for (p = 0; p < /** @type {Source[]} */
      Fe.length; p++)
        Bs(
          Fe[p],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (Jt++, Fe !== null && (s === null ? s = Fe : s.push(.../** @type {Source[]} */
    Fe))), (e.f & lt) !== 0 && (e.f ^= lt), m;
  } catch (E) {
    return bs(E);
  } finally {
    e.f ^= Ir, _e = t, Me = r, Fe = s, X = a, Ve = n, Tt(l), qe = c, gt = o;
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
  r === null && (t.f & ue) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (_e === null || !_e.includes(t)) && (de(t, Be), (t.f & Ye) !== 0 && (t.f ^= Ye, t.f &= ~bt), Ms(
    /** @type {Derived} **/
    t
  ), ur(
    /** @type {Derived} **/
    t,
    0
  ));
}
function ur(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var s = t; s < r.length; s++)
      ua(e, r[s]);
}
function Xt(e) {
  var t = e.f;
  if ((t & it) === 0) {
    de(e, fe);
    var r = te, s = pt;
    te = e, pt = !0;
    try {
      (t & (Ke | _n)) !== 0 ? ia(e) : Ns(e), Rs(e);
      var a = zs(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = qs;
      var n;
    } finally {
      pt = s, te = r;
    }
  }
}
async function Us() {
  await Promise.resolve(), jn();
}
function i(e) {
  var t = e.f, r = (t & ue) !== 0;
  if (X !== null && !qe) {
    var s = te !== null && (te.f & it) !== 0;
    if (!s && !Ve?.includes(e)) {
      var a = X.deps;
      if ((X.f & Ir) !== 0)
        e.rv < Jt && (e.rv = Jt, _e === null && a !== null && a[Me] === e ? Me++ : _e === null ? _e = [e] : _e.includes(e) || _e.push(e));
      else {
        (X.deps ??= []).push(e);
        var n = e.reactions;
        n === null ? e.reactions = [X] : n.includes(X) || n.push(X);
      }
    }
  }
  if (It) {
    if (ot.has(e))
      return ot.get(e);
    if (r) {
      var l = (
        /** @type {Derived} */
        e
      ), c = l.v;
      return ((l.f & fe) === 0 && l.reactions !== null || Xs(l)) && (c = Ur(l)), ot.set(l, c), c;
    }
  } else r && (!Ie?.has(e) || W?.is_fork && !Ut()) && (l = /** @type {Derived} */
  e, Vt(l) && ks(l), pt && Ut() && (l.f & Ye) === 0 && Js(l));
  if (Ie?.has(e))
    return Ie.get(e);
  if ((e.f & lt) !== 0)
    throw e.v;
  return e.v;
}
function Js(e) {
  if (e.deps !== null) {
    e.f ^= Ye;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & ue) !== 0 && (t.f & Ye) === 0 && Js(
        /** @type {Derived} */
        t
      );
  }
}
function Xs(e) {
  if (e.v === ve) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (ot.has(t) || (t.f & ue) !== 0 && Xs(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Kt(e) {
  var t = qe;
  try {
    return qe = !0, e();
  } finally {
    qe = t;
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
const Gs = /* @__PURE__ */ new Set(), Cr = /* @__PURE__ */ new Set();
function da(e, t, r, s = {}) {
  function a(n) {
    if (s.capture || Ht.call(t, n), !n.cancelBubble)
      return _r(() => r?.call(this, n));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ot(() => {
    t.addEventListener(e, a, s);
  }) : t.addEventListener(e, a, s), a;
}
function ha(e, t, r, s, a) {
  var n = { capture: s, passive: a }, l = da(e, t, r, n);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Xr(() => {
    t.removeEventListener(e, l, n);
  });
}
function Wt(e) {
  for (var t = 0; t < e.length; t++)
    Gs.add(e[t]);
  for (var r of Cr)
    r(e);
}
let ns = null;
function Ht(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], n = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  ns = e;
  var l = 0, c = ns === e && e.__root;
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
    var d = X, m = te;
    we(null), ze(null);
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
      e.__root = t, delete e.currentTarget, we(d), ze(m);
    }
  }
}
function _a(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function cr(e, t) {
  var r = (
    /** @type {Effect} */
    te
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
  var r = (t & In) !== 0, s = (t & Rn) !== 0, a, n = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = _a(n ? e : "<!>" + e), r || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ lr(a)));
    var l = (
      /** @type {TemplateNode} */
      s || Ds ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ lr(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      cr(c, o);
    } else
      cr(l, l);
    return l;
  };
}
function pa(e = "") {
  {
    var t = Ge(e + "");
    return cr(t, t), t;
  }
}
function mr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), r = Ge();
  return e.append(t, r), cr(t, r), e;
}
function T(e, t) {
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
const St = /* @__PURE__ */ new Map();
function ma(e, { target: t, anchor: r, props: s = {}, events: a, context: n, intro: l = !0 }) {
  Qn();
  var c = /* @__PURE__ */ new Set(), o = (m) => {
    for (var _ = 0; _ < m.length; _++) {
      var p = m[_];
      if (!c.has(p)) {
        c.add(p);
        var E = fa(p);
        t.addEventListener(p, Ht, { passive: E });
        var w = St.get(p);
        w === void 0 ? (document.addEventListener(p, Ht, { passive: E }), St.set(p, 1)) : St.set(p, w + 1);
      }
    }
  };
  o(vr(Gs)), Cr.add(o);
  var f = void 0, d = na(() => {
    var m = r ?? t.appendChild(Ge());
    return zn(
      /** @type {TemplateNode} */
      m,
      {
        pending: () => {
        }
      },
      (_) => {
        if (n) {
          Ze({});
          var p = (
            /** @type {ComponentContext} */
            De
          );
          p.c = n;
        }
        a && (s.$$events = a), f = e(_, s) || {}, n && Qe();
      }
    ), () => {
      for (var _ of c) {
        t.removeEventListener(_, Ht);
        var p = (
          /** @type {number} */
          St.get(_)
        );
        --p === 0 ? (document.removeEventListener(_, Ht), St.delete(_)) : St.set(_, p);
      }
      Cr.delete(o), m !== r && m.parentNode?.removeChild(m);
    };
  });
  return ba.set(f, d), f;
}
let ba = /* @__PURE__ */ new WeakMap();
class Vs {
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
      W
    );
    if (this.#e.has(t)) {
      var r = (
        /** @type {Key} */
        this.#e.get(t)
      ), s = this.#t.get(r);
      if (s)
        Gr(s), this.#r.delete(r);
      else {
        var a = this.#s.get(r);
        a && (this.#t.set(r, a.effect), this.#s.delete(r), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
      }
      for (const [n, l] of this.#e) {
        if (this.#e.delete(n), n === t)
          break;
        const c = this.#s.get(l);
        c && (ye(c.effect), this.#s.delete(l));
      }
      for (const [n, l] of this.#t) {
        if (n === r || this.#r.has(n)) continue;
        const c = () => {
          if (Array.from(this.#e.values()).includes(n)) {
            var f = document.createDocumentFragment();
            Ys(l, f), f.append(Ge()), this.#s.set(n, { effect: l, fragment: f });
          } else
            ye(l);
          this.#r.delete(n), this.#t.delete(n);
        };
        this.#o || !s ? (this.#r.add(n), _t(l, c, !1)) : c();
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
      r.includes(s) || (ye(a.effect), this.#s.delete(s));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, r) {
    var s = (
      /** @type {Batch} */
      W
    ), a = Fs();
    if (r && !this.#t.has(t) && !this.#s.has(t))
      if (a) {
        var n = document.createDocumentFragment(), l = Ge();
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
function le(e, t, r = !1) {
  var s = new Vs(e), a = r ? mt : 0;
  function n(l, c) {
    s.ensure(l, c);
  }
  gr(() => {
    var l = !1;
    t((c, o = !0) => {
      l = !0, n(o, c);
    }), l || n(!1, null);
  }, a);
}
function He(e, t) {
  return t;
}
function wa(e, t, r) {
  for (var s = [], a = t.length, n, l = t.length, c = 0; c < a; c++) {
    let m = t[c];
    _t(
      m,
      () => {
        if (n) {
          if (n.pending.delete(m), n.done.add(m), n.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Lr(vr(n.done)), _.delete(n), _.size === 0 && (e.outrogroups = null);
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
    Lr(t, !o);
  } else
    n = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(n);
}
function Lr(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    ye(e[r], t);
}
var as;
function Se(e, t, r, s, a, n = null) {
  var l = e, c = /* @__PURE__ */ new Map(), o = (t & hs) !== 0;
  if (o) {
    var f = (
      /** @type {Element} */
      e
    );
    l = f.appendChild(Ge());
  }
  var d = null, m = /* @__PURE__ */ zr(() => {
    var g = r();
    return Hr(g) ? g : g == null ? [] : vr(g);
  }), _, p = !0;
  function E() {
    v.fallback = d, ya(v, _, l, t, s), d !== null && (_.length === 0 ? (d.f & Xe) === 0 ? Gr(d) : (d.f ^= Xe, Yt(d, null, l)) : _t(d, () => {
      d = null;
    }));
  }
  var w = gr(() => {
    _ = /** @type {V[]} */
    i(m);
    for (var g = _.length, N = /* @__PURE__ */ new Set(), P = (
      /** @type {Batch} */
      W
    ), C = Fs(), R = 0; R < g; R += 1) {
      var B = _[R], G = s(B, R), A = p ? null : c.get(G);
      A ? (A.v && Ft(A.v, B), A.i && Ft(A.i, R), C && P.skipped_effects.delete(A.e)) : (A = xa(
        c,
        p ? l : as ??= Ge(),
        B,
        G,
        R,
        a,
        t,
        r
      ), p || (A.e.f |= Xe), c.set(G, A)), N.add(G);
    }
    if (g === 0 && n && !d && (p ? d = Oe(() => n(l)) : (d = Oe(() => n(as ??= Ge())), d.f |= Xe)), !p)
      if (C) {
        for (const [V, k] of c)
          N.has(V) || P.skipped_effects.add(k.e);
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
      c.get(w).e, (v.f & Xe) === 0 && (v.nodes?.a?.measure(), (m ??= /* @__PURE__ */ new Set()).add(v));
  for (g = 0; g < l; g += 1) {
    if (E = t[g], w = a(E, g), v = /** @type {EachItem} */
    c.get(w).e, e.outrogroups !== null)
      for (const k of e.outrogroups)
        k.pending.delete(v), k.done.delete(v);
    if ((v.f & Xe) !== 0)
      if (v.f ^= Xe, v === o)
        Yt(v, null, r);
      else {
        var N = d ? d.next : o;
        v === e.effect.last && (e.effect.last = v.prev), v.prev && (v.prev.next = v.next), v.next && (v.next.prev = v.prev), nt(e, d, v), nt(e, v, N), Yt(v, N, r), d = v, _ = [], p = [], o = d.next;
        continue;
      }
    if ((v.f & ke) !== 0 && (Gr(v), n && (v.nodes?.a?.unfix(), (m ??= /* @__PURE__ */ new Set()).delete(v))), v !== o) {
      if (f !== void 0 && f.has(v)) {
        if (_.length < p.length) {
          var P = p[0], C;
          d = P.prev;
          var R = _[0], B = _[_.length - 1];
          for (C = 0; C < _.length; C += 1)
            Yt(_[C], P, r);
          for (C = 0; C < p.length; C += 1)
            f.delete(p[C]);
          nt(e, R.prev, B.next), nt(e, d, R), nt(e, B, P), o = P, d = B, g -= 1, _ = [], p = [];
        } else
          f.delete(v), Yt(v, o, r), nt(e, v.prev, v.next), nt(e, v, d === null ? e.effect.first : d.next), nt(e, d, v), d = v;
        continue;
      }
      for (_ = [], p = []; o !== null && o !== v; )
        (f ??= /* @__PURE__ */ new Set()).add(o), p.push(o), o = o.next;
      if (o === null)
        continue;
    }
    (v.f & Xe) === 0 && _.push(v), d = v, o = v.next;
  }
  if (e.outrogroups !== null) {
    for (const k of e.outrogroups)
      k.pending.size === 0 && (Lr(vr(k.done)), e.outrogroups?.delete(k));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || f !== void 0) {
    var G = [];
    if (f !== void 0)
      for (v of f)
        (v.f & ke) === 0 && G.push(v);
    for (; o !== null; )
      (o.f & ke) === 0 && o !== e.fallback && G.push(o), o = o.next;
    var A = G.length;
    if (A > 0) {
      var V = (s & hs) !== 0 && l === 0 ? r : null;
      if (n) {
        for (g = 0; g < A; g += 1)
          G[g].nodes?.a?.measure();
        for (g = 0; g < A; g += 1)
          G[g].nodes?.a?.fix();
      }
      wa(e, G, V);
    }
  }
  n && Ot(() => {
    if (m !== void 0)
      for (v of m)
        v.nodes?.a?.apply();
  });
}
function xa(e, t, r, s, a, n, l, c) {
  var o = (l & An) !== 0 ? (l & On) === 0 ? /* @__PURE__ */ Kn(r, !1, !1) : yt(r) : null, f = (l & Fn) !== 0 ? yt(a) : null;
  return {
    v: o,
    i: f,
    e: Oe(() => (n(t, o ?? r, f ?? a, c), () => {
      e.delete(s);
    }))
  };
}
function Yt(e, t, r) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, n = t && (t.f & Xe) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; s !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Gt(s)
      );
      if (n.before(s), s === a)
        return;
      s = l;
    }
}
function nt(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
function Ma(e, t, r) {
  var s = new Vs(e);
  gr(() => {
    var a = t() ?? null;
    s.ensure(a, a && ((n) => r(n, a)));
  }, mt);
}
const is = [...` 	
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
          (l === 0 || is.includes(s[l - 1])) && (c === s.length || is.includes(s[c])) ? s = (l === 0 ? "" : s.substring(0, l)) + s.substring(c + 1) : l = c;
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
function Bt(e, t, r, s) {
  var a = e.__style;
  if (a !== t) {
    var n = Sa(t);
    n == null ? e.removeAttribute("style") : e.style.cssText = n, e.__style = t;
  }
  return s;
}
function Ks(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Hr(t))
      return Cn();
    for (var s of e.options)
      s.selected = t.includes(zt(s));
    return;
  }
  for (s of e.options) {
    var a = zt(s);
    if (Zn(a, t)) {
      s.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function Ea(e) {
  var t = new MutationObserver(() => {
    Ks(e, e.__value);
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
  }), Xr(() => {
    t.disconnect();
  });
}
function Da(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet(), a = !0;
  Jr(e, "change", (n) => {
    var l = n ? "[selected]" : ":checked", c;
    if (e.multiple)
      c = [].map.call(e.querySelectorAll(l), zt);
    else {
      var o = e.querySelector(l) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      c = o && zt(o);
    }
    r(c), W !== null && s.add(W);
  }), Is(() => {
    var n = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        jt ?? W
      );
      if (s.has(l))
        return;
    }
    if (Ks(e, n, a), a && n === void 0) {
      var c = e.querySelector(":checked");
      c !== null && (n = zt(c), r(n));
    }
    e.__value = n, a = !1;
  }), Ea(e);
}
function zt(e) {
  return "__value" in e ? e.__value : e.value;
}
const Ta = /* @__PURE__ */ Symbol("is custom element"), Aa = /* @__PURE__ */ Symbol("is html");
function me(e, t, r, s) {
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
var ls = /* @__PURE__ */ new Map();
function Pa(e) {
  var t = e.getAttribute("is") || e.nodeName, r = ls.get(t);
  if (r) return r;
  ls.set(t, r = []);
  for (var s, a = e, n = Element.prototype; n !== a; ) {
    s = vn(a);
    for (var l in s)
      s[l].set && r.push(l);
    a = cs(a);
  }
  return r;
}
function ar(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet();
  Jr(e, "input", async (a) => {
    var n = a ? e.defaultValue : e.value;
    if (n = Dr(e) ? Tr(n) : n, r(n), W !== null && s.add(W), await Us(), n !== (n = t())) {
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
  Kt(t) == null && e.value && (r(Dr(e) ? Tr(e.value) : e.value), W !== null && s.add(W)), pr(() => {
    var a = t();
    if (e === document.activeElement) {
      var n = (
        /** @type {Batch} */
        jt ?? W
      );
      if (s.has(n))
        return;
    }
    Dr(e) && a === Tr(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
function Oa(e, t, r = t) {
  Jr(e, "change", (s) => {
    var a = s ? e.defaultChecked : e.checked;
    r(a);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  // If defaultChecked is set, then checked == defaultChecked
  Kt(t) == null && r(e.checked), pr(() => {
    var s = t();
    e.checked = !!s;
  });
}
function Dr(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function Tr(e) {
  return e === "" ? null : +e;
}
function os(e, t) {
  return e === t || e?.[ht] === t;
}
function vt(e = {}, t, r, s) {
  return Is(() => {
    var a, n;
    return pr(() => {
      a = n, n = [], Kt(() => {
        e !== r(...n) && (t(e, ...n), a && os(r(...a), e) && t(null, ...a));
      });
    }), () => {
      Ot(() => {
        n && os(r(...n), e) && t(null, ...n);
      });
    };
  }), e;
}
const Ia = {
  get(e, t) {
    let r = e.props.length;
    for (; r--; ) {
      let s = e.props[r];
      if (Lt(s) && (s = s()), typeof s == "object" && s !== null && t in s) return s[t];
    }
  },
  set(e, t, r) {
    let s = e.props.length;
    for (; s--; ) {
      let a = e.props[s];
      Lt(a) && (a = a());
      const n = dt(a, t);
      if (n && n.set)
        return n.set(r), !0;
    }
    return !1;
  },
  getOwnPropertyDescriptor(e, t) {
    let r = e.props.length;
    for (; r--; ) {
      let s = e.props[r];
      if (Lt(s) && (s = s()), typeof s == "object" && s !== null && t in s) {
        const a = dt(s, t);
        return a && !a.configurable && (a.configurable = !0), a;
      }
    }
  },
  has(e, t) {
    if (t === ht || t === gn) return !1;
    for (let r of e.props)
      if (Lt(r) && (r = r()), r != null && t in r) return !0;
    return !1;
  },
  ownKeys(e) {
    const t = [];
    for (let r of e.props)
      if (Lt(r) && (r = r()), !!r) {
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
function Ws(e, t, r, s) {
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
function Mt(e) {
  De === null && bn(), Ps(() => {
    const t = Kt(e);
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
var Ar = { exports: {} }, us;
function La() {
  return us || (us = 1, (function(e) {
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
        var N = w || r, P = v || 0, C = g || !1, R = 0, B;
        function G(k, y) {
          var M;
          if (y) {
            if (M = y.getTime(), C) {
              var x = d(y);
              if (y = new Date(M + x + P), d(y) !== x) {
                var q = d(y);
                y = new Date(M + q + P);
              }
            }
          } else {
            var j = Date.now();
            j > R ? (R = j, B = new Date(R), M = R, C && (B = new Date(R + d(B) + P))) : M = R, y = B;
          }
          return A(k, y, N, M);
        }
        function A(k, y, M, j) {
          for (var x = "", q = null, re = !1, b = k.length, S = !1, $ = 0; $ < b; $++) {
            var K = k.charCodeAt($);
            if (re === !0) {
              if (K === 45) {
                q = "";
                continue;
              } else if (K === 95) {
                q = " ";
                continue;
              } else if (K === 48) {
                q = "0";
                continue;
              } else if (K === 58) {
                S && E("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), S = !0;
                continue;
              }
              switch (K) {
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
                  x += n(Math.floor(y.getFullYear() / 100), q);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  x += A(M.formats.D, y, M, j);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  x += A(M.formats.F, y, M, j);
                  break;
                // '00'
                // case 'H':
                case 72:
                  x += n(y.getHours(), q);
                  break;
                // '12'
                // case 'I':
                case 73:
                  x += n(c(y.getHours()), q);
                  break;
                // '000'
                // case 'L':
                case 76:
                  x += l(Math.floor(j % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  x += n(y.getMinutes(), q);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  x += y.getHours() < 12 ? M.am : M.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  x += A(M.formats.R, y, M, j);
                  break;
                // '00'
                // case 'S':
                case 83:
                  x += n(y.getSeconds(), q);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  x += A(M.formats.T, y, M, j);
                  break;
                // '00'
                // case 'U':
                case 85:
                  x += n(o(y, "sunday"), q);
                  break;
                // '00'
                // case 'W':
                case 87:
                  x += n(o(y, "monday"), q);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  x += A(M.formats.X, y, M, j);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  x += y.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (C && P === 0)
                    x += "GMT";
                  else {
                    var O = m(y);
                    x += O || "";
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
                  x += A(M.formats.c, y, M, j);
                  break;
                // '01'
                // case 'd':
                case 100:
                  x += n(y.getDate(), q);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  x += n(y.getDate(), q ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  x += M.shortMonths[y.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var Q = new Date(y.getFullYear(), 0, 1), Y = Math.ceil((y.getTime() - Q.getTime()) / (1e3 * 60 * 60 * 24));
                  x += l(Y);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  x += n(y.getHours(), q ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  x += n(c(y.getHours()), q ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  x += n(y.getMonth() + 1, q);
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
                  var Y = y.getDate();
                  M.ordinalSuffixes ? x += String(Y) + (M.ordinalSuffixes[Y - 1] || f(Y)) : x += String(Y) + f(Y);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  x += y.getHours() < 12 ? M.AM : M.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  x += A(M.formats.r, y, M, j);
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
                  var Y = y.getDay();
                  x += Y === 0 ? 7 : Y;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  x += A(M.formats.v, y, M, j);
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
                  x += A(M.formats.x, y, M, j);
                  break;
                // '70'
                // case 'y':
                case 121:
                  x += n(y.getFullYear() % 100, q);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (C && P === 0)
                    x += S ? "+00:00" : "+0000";
                  else {
                    var U;
                    P !== 0 ? U = P / (60 * 1e3) : U = -y.getTimezoneOffset();
                    var ie = U < 0 ? "-" : "+", ee = S ? ":" : "", J = Math.floor(Math.abs(U / 60)), z = Math.abs(U % 60);
                    x += ie + n(J) + ee + n(z);
                  }
                  break;
                default:
                  re && (x += "%"), x += k[$];
                  break;
              }
              q = null, re = !1;
              continue;
            }
            if (K === 37) {
              re = !0;
              continue;
            }
            x += k[$];
          }
          return x;
        }
        var V = G;
        return V.localize = function(k) {
          return new a(k || N, P, C);
        }, V.localizeByIdentifier = function(k) {
          var y = t[k];
          return y ? V.localize(y) : (E('[WARNING] No locale found with identifier "' + k + '".'), V);
        }, V.timezone = function(k) {
          var y = P, M = C, j = typeof k;
          if (j === "number" || j === "string")
            if (M = !0, j === "string") {
              var x = k[0] === "-" ? -1 : 1, q = parseInt(k.slice(1, 3), 10), re = parseInt(k.slice(3, 5), 10);
              y = x * (60 * q + re) * 60 * 1e3;
            } else j === "number" && (y = k * 60 * 1e3);
          return new a(N, y, M);
        }, V.utc = function() {
          return new a(N, P, !0);
        }, V;
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
        var N = Date.UTC(w.getFullYear(), 0, 1), P = Date.UTC(w.getFullYear(), w.getMonth(), w.getDate()), C = Math.floor((P - N) / 864e5), R = (C + 7 - g) / 7;
        return Math.floor(R);
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
  })(Ar)), Ar.exports;
}
var Ha = La();
const Dt = /* @__PURE__ */ Ca(Ha);
let Fr = /* @__PURE__ */ H(!1);
class Ya {
  constructor(t) {
    if (this.sk = "", this.fetchFn = t || (typeof window < "u" ? fetch.bind(window) : fetch), typeof document < "u") {
      const r = document.querySelector('meta[name="csrf-token"]');
      r && (this.sk = r.content);
    }
  }
  get loading() {
    return i(Fr);
  }
  async request(t, r = {}) {
    D(Fr, !0);
    try {
      const s = new URL(t, window.location.origin);
      r.params && Object.entries(r.params).forEach(([c, o]) => {
        s.searchParams.append(c, String(o));
      });
      const a = new Headers(r.headers || {});
      a.set("X-Requested-With", "fetch");
      let n = r.body;
      r.method && ["POST", "PUT", "PATCH", "DELETE"].includes(r.method.toUpperCase()) && (n instanceof FormData ? n.set("sk", this.sk) : n && typeof n == "object" && !(n instanceof Blob) && !(n instanceof ArrayBuffer) && (a.set("Content-Type", "application/json"), n = JSON.stringify(n)));
      const l = await this.fetchFn(s.toString(), { ...r, headers: a, body: n });
      if (!l.ok)
        throw new Error(`API Error: ${l.status} ${l.statusText}`);
      return await l.json();
    } finally {
      D(Fr, !1);
    }
  }
  get(t, r) {
    return this.request(t, { method: "GET", params: r });
  }
  post(t, r) {
    return this.request(t, { method: "POST", body: r });
  }
  get skValue() {
    return this.sk;
  }
}
const ne = new Ya(), ja = (e, t = fr) => {
  var r = qa(), s = u(r);
  Z(() => {
    $e(r, 1, `status status-${t() ?? ""}`, "svelte-13s7gu4"), F(s, t());
  }), T(e, r);
};
var qa = /* @__PURE__ */ I("<span> </span>"), $a = /* @__PURE__ */ I('<time class="svelte-13s7gu4"> </time>'), Ba = /* @__PURE__ */ I('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), za = /* @__PURE__ */ I('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), Ua = /* @__PURE__ */ I('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Ja = /* @__PURE__ */ I('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), Xa = /* @__PURE__ */ I('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4">エントリ一覧</h2> <div class="search-box svelte-13s7gu4"><input type="text" placeholder="検索..." class="svelte-13s7gu4"/> <button class="svelte-13s7gu4">検索</button></div> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">新しい方へ</button> <button class="svelte-13s7gu4">古い方へ</button></div></div> <div><!></div></div>');
function Ga(e, t) {
  Ze(t, !0);
  const r = (k, y = fr, M) => {
    let j = /* @__PURE__ */ zr(() => fs(M?.(), !0));
    var x = $a(), q = u(x);
    Z(
      (re) => {
        me(x, "datetime", y()), F(q, re);
      },
      [() => i(j) && y() ? _(y()) : "-"]
    ), T(k, x);
  };
  let s = /* @__PURE__ */ H(be([])), a = /* @__PURE__ */ H(!1), n = 50, l = /* @__PURE__ */ H(""), c = /* @__PURE__ */ H(be([]));
  async function o() {
    try {
      const k = i(c)[i(c).length - 1], y = { limit: n };
      i(l) && (y.q = i(l)), k && (y.cursor_id = k);
      const M = await ne.get("/admin/api/entries", y);
      D(s, M.entries || [], !0), D(a, M.has_more || !1, !0);
    } catch (k) {
      console.error(k);
    }
  }
  function f() {
    D(c, [], !0), o();
  }
  Mt(o);
  function d() {
    if (i(a) && i(s).length > 0) {
      const k = i(s)[i(s).length - 1];
      i(c).push(k.id), o();
    }
  }
  function m() {
    i(c).length > 0 && (i(c).pop(), o());
  }
  function _(k) {
    return k ? Dt("%Y-%m-%d %H:%M", new Date(k)) : "-";
  }
  var p = Xa(), E = u(p), w = h(u(E), 2), v = u(w);
  v.__keydown = (k) => k.key === "Enter" && f();
  var g = h(v, 2);
  g.__click = f;
  var N = h(w, 2), P = u(N);
  P.__click = m;
  var C = h(P, 2);
  C.__click = d;
  var R = h(E, 2);
  let B;
  var G = u(R);
  {
    var A = (k) => {
      var y = Ba();
      T(k, y);
    }, V = (k) => {
      var y = Ja(), M = ut(y), j = h(u(M));
      Se(j, 21, () => i(s), He, (re, b) => {
        var S = za(), $ = u(S), K = u($), O = h($), Q = u(O), Y = h(O), U = u(Y);
        ja(U, () => i(b).status);
        var ie = h(Y), ee = u(ie), J = u(ee), z = h(ee, 2), se = u(z), ae = u(se), ce = h(ie), pe = u(ce), he = h(ce), Re = u(he);
        r(Re, () => i(b).created_at);
        var Te = h(he), Ne = u(Te);
        r(Ne, () => i(b).modified_at);
        var xe = h(Te), Ae = u(xe);
        r(Ae, () => i(b).publish_at?.Time, () => i(b).publish_at?.Valid);
        var Ue = h(xe), Ce = u(Ue);
        Ce.__click = () => t.onEdit(i(b).id), Z(() => {
          F(K, i(b).id), F(Q, i(b).date), F(J, i(b).title), me(se, "href", `/${i(b).path ?? ""}`), F(ae, `/${i(b).path ?? ""}`), F(pe, i(b).format);
        }), T(re, S);
      });
      var x = h(M, 2);
      {
        var q = (re) => {
          var b = Ua();
          T(re, b);
        };
        le(x, (re) => {
          ne.loading && re(q);
        });
      }
      T(k, y);
    };
    le(G, (k) => {
      ne.loading && i(s).length === 0 ? k(A) : k(V, !1);
    });
  }
  Z(() => {
    P.disabled = i(c).length === 0 || ne.loading, C.disabled = !i(a) || ne.loading, B = $e(R, 1, "table-container svelte-13s7gu4", null, B, { "is-loading": ne.loading });
  }), ar(v, () => i(l), (k) => D(l, k)), T(e, p), Qe();
}
Wt(["keydown", "click"]);
class Va {
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
var Ka = /* @__PURE__ */ I('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), Wa = /* @__PURE__ */ I('<option class="svelte-7nstam"> </option>'), Za = /* @__PURE__ */ I('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), Qa = /* @__PURE__ */ I('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), ei = /* @__PURE__ */ I('<button id="restore" type="button" class="submit-button svelte-7nstam">復元...</button>'), ti = /* @__PURE__ */ I('<div role="option" tabindex="-1"> </div>'), ri = /* @__PURE__ */ I('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam"> </button> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons svelte-7nstam"><div class="options svelte-7nstam"><label title="チェックを入れると指定した日時に公開されます（公開済みの記事も予約に戻せます）" class="svelte-7nstam"><input type="checkbox" class="svelte-7nstam"/> 公開を遅延</label> <!></div> <button type="button" class="submit-button svelte-7nstam"> </button> <button type="button" class="submit-button preview-button svelte-7nstam">プレビュー</button> <!></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam" role="listbox" aria-label="タグを選択" tabindex="0"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog> <dialog id="previewDialog" class="svelte-7nstam"><div class="preview-header svelte-7nstam"><h3 class="svelte-7nstam">プレビュー</h3> <button type="button" class="close-button svelte-7nstam">閉じる</button></div> <div class="preview-body svelte-7nstam"><iframe name="preview-iframe" title="Preview" class="svelte-7nstam"></iframe></div></dialog>', 1);
function si(e, t) {
  Ze(t, !0);
  let r = Ws(t, "id", 3, null);
  const s = new Va();
  let a = /* @__PURE__ */ H(be({ id: void 0, title: "", body: "", status: "" })), n = be({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: "public",
    publishLater: !1,
    publishAt: ""
  }), l = /* @__PURE__ */ H(!1), c = /* @__PURE__ */ H(""), o = /* @__PURE__ */ H(!1), f = /* @__PURE__ */ H(null), d = /* @__PURE__ */ H(null), m = /* @__PURE__ */ H(null), _ = /* @__PURE__ */ H(null), p = /* @__PURE__ */ H(null), E = /* @__PURE__ */ H(null);
  const w = [
    "tech",
    "photo",
    "redeveloped",
    "stablediffusion",
    "photoshopped"
  ];
  let v = /* @__PURE__ */ H(0);
  async function g(b) {
    try {
      const S = await ne.get(`/admin/api/entry/${b}`);
      D(a, S, !0), n.id = S.id, n.title = S.title, n.body = S.body, n.format = S.format || "Hatena", n.status = S.status, n.publishLater = S.status === "scheduled", S.publish_at?.Valid ? n.publishAt = Dt("%Y-%m-%dT%H:%M", new Date(S.publish_at.Time)) : n.publishAt = Dt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), s.check(i(a).id ?? null, { title: n.title, body: n.body });
    } catch (S) {
      console.error(S), alert("エントリの取得に失敗しました");
    }
  }
  Mt(() => {
    r() ? g(r()) : (D(a, { id: void 0, title: "", body: "", status: "public" }, !0), n.id = null, n.title = "", n.body = "", n.format = "Hatena", n.status = "public", n.publishLater = !1, n.publishAt = Dt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), s.check(null, { title: n.title, body: n.body }));
  }), Ps(() => {
    (i(a).title !== n.title || i(a).body !== n.body) && s.saveDebounced(i(a).id ?? null, { title: n.title, body: n.body });
  });
  async function N() {
    D(l, !0), D(c, "リクエスト中");
    const b = new FormData();
    if (b.set("id", n.id ? String(n.id) : ""), b.set("title", n.title), b.set("body", n.body), b.set("format", n.format), n.publishLater) {
      const S = new Date(n.publishAt);
      b.set("publish_at", S.toISOString()), b.set("status", "scheduled");
    } else
      b.set("status", "public");
    try {
      const $ = (await ne.post("/admin/api/edit", b)).session_id;
      if (!$)
        throw new Error("保存に失敗しました");
      P($);
    } catch (S) {
      D(l, !1), alert(S instanceof Error ? S.message : "エラーが発生しました");
    }
  }
  function P(b) {
    const S = new EventSource(`/admin/api/edit/progress?sid=${b}`);
    S.onmessage = ($) => {
      const K = JSON.parse($.data);
      switch (K.type) {
        case "progress":
          D(c, C(K.message), !0);
          break;
        case "done":
          s.clear(i(a).id ?? null), D(c, "完了"), D(l, !1), S.close(), t.onSave(K.location);
          break;
        case "error":
          D(c, "エラー: " + K.message), D(l, !1), S.close(), alert("保存に失敗しました: " + K.message);
          break;
      }
    }, S.onerror = () => {
      D(l, !1), S.close(), alert("通信エラーが発生しました");
    };
  }
  function C(b) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[b] || b;
  }
  function R() {
    D(v, 0), i(m).showModal(), setTimeout(() => i(E)?.focus(), 0);
  }
  function B(b) {
    b.key === "ArrowDown" ? (b.preventDefault(), D(v, (i(v) + 1) % w.length)) : b.key === "ArrowUp" ? (b.preventDefault(), D(v, (i(v) - 1 + w.length) % w.length)) : b.key === "Enter" || b.key === " " ? (b.preventDefault(), G(w[i(v)])) : b.key === "Escape" && i(m).close();
  }
  function G(b) {
    const S = `[${b}]`;
    n.title.includes(S) ? n.title = n.title.replace(S, "") : n.title = S + n.title, i(m).close(), i(f).focus();
  }
  function A() {
    s.data && (n.title = s.data.title, n.body = s.data.body, s.clear(i(a).id ?? null), i(_).close());
  }
  async function V() {
    const b = document.createElement("input");
    b.type = "file", b.oninput = async () => {
      if (!b.files?.[0]) return;
      const S = new FormData();
      S.append("file", b.files[0]), D(o, !0);
      try {
        const $ = await ne.post("/admin/api/upload/image", S), K = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${$.uploaded}" class="picasa" itemprop="url"><img src="${$.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        k(K, !0);
      } catch {
        alert("アップロードに失敗しました");
      } finally {
        D(o, !1);
      }
    }, b.click();
  }
  function k(b, S = !1) {
    const $ = i(d).selectionStart, K = i(d).selectionEnd, O = i(d).value;
    n.body = O.substring(0, $) + b + O.substring(K), Us().then(() => {
      typeof S == "boolean" && S ? (i(d).selectionStart = $, i(d).selectionEnd = $ + b.length) : typeof S == "number" ? i(d).selectionStart = i(d).selectionEnd = $ + S : i(d).selectionStart = i(d).selectionEnd = $ + b.length, i(d).focus();
    });
  }
  function y(b) {
    (b.altKey ? "Alt-" : "") + (b.ctrlKey ? "Control-" : "") + (b.metaKey ? "Meta-" : "") + (b.shiftKey ? "Shift-" : "") + b.key === "Control-t" && (k("\\(  \\)", 3), b.preventDefault(), b.stopPropagation());
  }
  function M() {
    i(p).showModal();
    const b = document.createElement("form");
    b.method = "POST", b.action = "/admin/api/preview", b.target = "preview-iframe";
    const S = {
      title: n.title,
      body: n.body,
      format: n.format,
      sk: ne.skValue
    };
    for (const [$, K] of Object.entries(S)) {
      const O = document.createElement("input");
      O.type = "hidden", O.name = $, O.value = K, b.appendChild(O);
    }
    document.body.appendChild(b), b.submit(), document.body.removeChild(b);
  }
  var j = mr(), x = ut(j);
  {
    var q = (b) => {
      var S = Ka();
      T(b, S);
    }, re = (b) => {
      var S = ri(), $ = ut(S), K = u($), O = u(K);
      vt(O, (L) => D(f, L), () => i(f));
      var Q = h(O, 2), Y = u(Q);
      Y.__click = R;
      var U = h(Y, 2);
      U.__click = V;
      var ie = u(U), ee = h(U, 2);
      Se(ee, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], He, (L, oe) => {
        var ge = Wa(), Le = u(ge), st = {};
        Z(() => {
          F(Le, oe), st !== (st = oe) && (ge.value = (ge.__value = oe) ?? "");
        }), T(L, ge);
      });
      var J = h(Q, 2), z = u(J);
      z.__keydown = y, vt(z, (L) => D(d, L), () => i(d));
      var se = h(K, 2), ae = u(se);
      {
        var ce = (L) => {
          var oe = Za();
          T(L, oe);
        };
        le(ae, (L) => {
          i(l) && L(ce);
        });
      }
      var pe = h(ae, 2), he = u(pe), Re = u(he), Te = u(Re), Ne = h(Re, 2);
      {
        var xe = (L) => {
          var oe = Qa();
          ar(oe, () => n.publishAt, (ge) => n.publishAt = ge), T(L, oe);
        };
        le(Ne, (L) => {
          n.publishLater && L(xe);
        });
      }
      var Ae = h(he, 2);
      Ae.__click = N;
      var Ue = u(Ae), Ce = h(Ae, 2);
      Ce.__click = M;
      var tt = h(Ce, 2);
      {
        var ct = (L) => {
          var oe = ei();
          oe.__click = () => i(_).showModal(), T(L, oe);
        };
        le(tt, (L) => {
          s.exists && L(ct);
        });
      }
      var rt = h($, 2), kt = h(u(rt), 2);
      kt.__keydown = B, Se(kt, 21, () => w, He, (L, oe, ge) => {
        var Le = ti();
        let st;
        Le.__click = () => G(i(oe)), Le.__keydown = (kr) => kr.key === "Enter" && G(i(oe));
        var Mr = u(Le);
        Z(() => {
          st = $e(Le, 1, "tag-item svelte-7nstam", null, st, { selected: i(v) === ge }), me(Le, "aria-selected", i(v) === ge), F(Mr, i(oe));
        }), ha("mouseenter", Le, () => D(v, ge, !0)), T(L, Le);
      }), vt(kt, (L) => D(E, L), () => i(E));
      var Zt = h(kt, 2);
      Zt.__click = () => i(m).close(), vt(rt, (L) => D(m, L), () => i(m));
      var Rt = h(rt, 2), Qt = h(u(Rt), 2), er = u(Qt);
      {
        var br = (L) => {
          var oe = pa();
          Z((ge) => F(oe, ge), [() => Dt("%Y年%m月%d日%H時", new Date(s.data.time))]), T(L, oe);
        };
        le(er, (L) => {
          s.data?.time && L(br);
        });
      }
      var wr = h(Qt, 2), Nt = u(wr);
      Nt.__click = () => i(_).close();
      var yr = h(Nt, 2);
      yr.__click = A, vt(Rt, (L) => D(_, L), () => i(_));
      var tr = h(Rt, 2), rr = u(tr), xr = h(u(rr), 2);
      xr.__click = () => i(p).close(), vt(tr, (L) => D(p, L), () => i(p)), Z(() => {
        U.disabled = i(o), F(ie, i(o) ? "⌛ アップロード中..." : "📷 写真"), Ae.disabled = i(l), F(Ue, i(l) ? i(c) || "リクエスト中" : r() ? "更新" : "作成"), Ce.disabled = i(l);
      }), ar(O, () => n.title, (L) => n.title = L), Da(ee, () => n.format, (L) => n.format = L), ar(z, () => n.body, (L) => n.body = L), Oa(Te, () => n.publishLater, (L) => n.publishLater = L), T(b, S);
    };
    le(x, (b) => {
      ne.loading && !i(a).id ? b(q) : b(re, !1);
    });
  }
  T(e, j), Qe();
}
Wt(["click", "keydown"]);
const ni = (e, t = fr) => {
  var r = ai(), s = u(r);
  Z(() => {
    $e(r, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), F(s, t());
  }), T(e, r);
};
var ai = /* @__PURE__ */ I("<span> </span>"), ii = /* @__PURE__ */ I('<time class="time svelte-1r6codn"> </time>'), li = /* @__PURE__ */ I('<div class="loading svelte-1r6codn"></div>'), oi = /* @__PURE__ */ I('<div class="error-text svelte-1r6codn"> </div>'), ui = /* @__PURE__ */ I('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><!></td><td class="error svelte-1r6codn"><!></td></tr>'), ci = /* @__PURE__ */ I('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), vi = /* @__PURE__ */ I('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">新しい方へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">古い方へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function fi(e, t) {
  Ze(t, !0);
  const r = (A, V = fr, k) => {
    let y = /* @__PURE__ */ zr(() => fs(k?.(), !0));
    var M = ii(), j = u(M);
    Z(
      (x) => {
        me(M, "datetime", V()), F(j, x);
      },
      [() => i(y) && V() ? d(V()) : "-"]
    ), T(A, M);
  };
  let s = /* @__PURE__ */ H(be([])), a = /* @__PURE__ */ H(0), n = /* @__PURE__ */ H(0), l = 50;
  async function c() {
    try {
      const A = await ne.get("/admin/api/jobs", { limit: l, offset: i(n) });
      D(s, A.jobs || [], !0), D(a, A.total || 0, !0);
    } catch (A) {
      console.error(A);
    }
  }
  Mt(c);
  function o() {
    i(n) + l < i(a) && (D(n, i(n) + l), c());
  }
  function f() {
    i(n) - l >= 0 && (D(n, i(n) - l), c());
  }
  function d(A) {
    return Dt("%Y-%m-%d %H:%M:%S", new Date(A));
  }
  var m = vi(), _ = u(m), p = u(_), E = u(p), w = h(p, 2), v = u(w);
  v.__click = f;
  var g = h(v, 2), N = u(g), P = h(g, 2);
  P.__click = o;
  var C = h(P, 2);
  C.__click = c;
  var R = h(_, 2);
  {
    var B = (A) => {
      var V = li();
      T(A, V);
    }, G = (A) => {
      var V = ci(), k = h(u(V));
      Se(k, 21, () => i(s), He, (y, M) => {
        var j = ui(), x = u(j), q = u(x), re = h(x), b = u(re), S = u(b), $ = h(re), K = u($);
        ni(K, () => i(M).status);
        var O = h($), Q = u(O), Y = h(O), U = u(Y);
        r(U, () => i(M).created_at);
        var ie = h(Y), ee = u(ie);
        {
          var J = (z) => {
            var se = oi(), ae = u(se);
            Z(() => {
              me(se, "title", i(M).error_message.String), F(ae, i(M).error_message.String);
            }), T(z, se);
          };
          le(ee, (z) => {
            i(M).error_message?.Valid && z(J);
          });
        }
        Z(() => {
          F(q, i(M).id), F(S, i(M).job_type_name), F(Q, i(M).retry_count);
        }), T(y, j);
      }), T(A, V);
    };
    le(R, (A) => {
      ne.loading && i(s).length === 0 ? A(B) : A(G, !1);
    });
  }
  Z(
    (A) => {
      F(E, `ジョブ一覧 (${i(a) ?? ""})`), v.disabled = i(n) === 0 || ne.loading, F(N, `${i(n) + 1} - ${A ?? ""} / ${i(a) ?? ""}`), P.disabled = i(n) + l >= i(a) || ne.loading;
    },
    [() => Math.min(i(n) + l, i(a))]
  ), T(e, m), Qe();
}
Wt(["click"]);
var di = /* @__PURE__ */ I('<div class="empty svelte-wpgtu6">No Signature</div>'), hi = /* @__PURE__ */ I("<div></div>"), _i = /* @__PURE__ */ I('<div class="row svelte-wpgtu6"></div>'), pi = /* @__PURE__ */ I('<div class="chroma-section svelte-wpgtu6"></div>'), gi = /* @__PURE__ */ I('<div class="chroma-sections svelte-wpgtu6"></div>'), mi = /* @__PURE__ */ I('<div class="color-bitmask svelte-wpgtu6"><!></div>');
function Pr(e, t) {
  Ze(t, !0);
  let r = Ws(t, "size", 3, 64), s = /* @__PURE__ */ at(() => {
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
    const m = d >> 5 & 1, _ = d >> 4 & 1, p = d >> 3 & 1, E = d >> 2 & 1, w = d >> 1 & 1, v = d & 1, g = _ << 1 | E, N = m << 2 | p << 1 | w, P = v, C = [25, 45, 65, 85][g], R = P === 0 ? 0.01 : 0.15, B = N * 45;
    return `oklch(${C}% ${R} ${B})`;
  }
  function n(d, m, _) {
    const p = d >> 1 & 1, E = d & 1, w = m >> 2 & 1, v = m >> 1 & 1, g = m & 1, N = _ & 1;
    return w << 5 | p << 4 | v << 3 | E << 2 | g << 1 | N;
  }
  var l = mi(), c = u(l);
  {
    var o = (d) => {
      var m = di();
      T(d, m);
    }, f = (d) => {
      var m = gi();
      Se(m, 20, () => [1, 0], He, (_, p) => {
        var E = pi();
        Se(E, 20, () => [3, 2, 1, 0], He, (w, v) => {
          var g = _i();
          Se(g, 20, () => [0, 1, 2, 3, 4, 5, 6, 7], He, (N, P) => {
            const C = /* @__PURE__ */ at(() => n(v, P, p));
            var R = hi();
            let B;
            Z(
              (G) => {
                B = $e(R, 1, "bit svelte-wpgtu6", null, B, { active: i(s)[i(C)] }), Bt(R, `background-color: ${G ?? ""}`), me(R, "title", `L=${v ?? ""} H=${P * 45} C=${p ?? ""}`);
              },
              [() => a(i(C))]
            ), T(N, R);
          }), T(w, g);
        }), Z(() => me(E, "title", p === 1 ? "Vivid Colors" : "Muted Colors")), T(_, E);
      }), T(d, m);
    };
    le(c, (d) => {
      t.sig ? d(f, !1) : d(o);
    });
  }
  Z(() => Bt(l, `--size: ${r() ?? ""}px`)), T(e, l), Qe();
}
var bi = /* @__PURE__ */ I('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), wi = /* @__PURE__ */ I('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class A Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), yi = /* @__PURE__ */ I('<li class="svelte-1w9i976"><span class="action svelte-1w9i976"> </span>: <span class="count svelte-1w9i976"> </span></li>'), xi = /* @__PURE__ */ I('<div class="tooltip svelte-1w9i976"><div class="tooltip-title svelte-1w9i976">Class B Breakdown</div> <ul class="svelte-1w9i976"></ul></div>'), Mi = /* @__PURE__ */ I('<div class="stat-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">Storage (Free: 10GB)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976"> </div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class A (Free: 1M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div> <div class="stat-card has-tooltip svelte-1w9i976"><div class="stat-label svelte-1w9i976">Class B (Free: 10M/mo)</div> <div class="stat-value svelte-1w9i976"> </div> <div class="stat-sub svelte-1w9i976">Operations</div> <div class="stat-progress svelte-1w9i976"><div class="bar svelte-1w9i976"></div></div> <!></div>', 1), ki = /* @__PURE__ */ I('<div class="stat-card error-card svelte-1w9i976"><div class="stat-label svelte-1w9i976">R2 Status</div> <div class="stat-value svelte-1w9i976" style="font-size: 0.9rem; color: #d32f2f;"> </div></div>'), Si = /* @__PURE__ */ I('<div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div> <div class="stat-card skeleton svelte-1w9i976"></div>', 1), Ei = /* @__PURE__ */ I('<div class="r2-stats svelte-1w9i976"><!></div>');
function Di(e, t) {
  Ze(t, !0);
  let r = /* @__PURE__ */ H(null), s = /* @__PURE__ */ H(null);
  async function a() {
    try {
      D(r, await ne.get("/admin/api/r2/usage"), !0);
    } catch (v) {
      console.error("Failed to fetch R2 usage:", v), D(s, "Failed to load R2 usage data");
    }
  }
  Mt(a);
  function n(v) {
    if (v === 0) return "0 B";
    const g = 1024, N = ["B", "KB", "MB", "GB", "TB"], P = Math.floor(Math.log(v) / Math.log(g));
    return parseFloat((v / Math.pow(g, P)).toFixed(2)) + " " + N[P];
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
  ], o = /* @__PURE__ */ at(() => i(r) ? (i(r).operations || []).filter((v) => l.includes(v.action_type)).reduce((v, g) => v + g.requests, 0) : 0), f = /* @__PURE__ */ at(() => i(r) ? (i(r).operations || []).filter((v) => c.includes(v.action_type)).reduce((v, g) => v + g.requests, 0) : 0), d = /* @__PURE__ */ at(() => i(r) ? (i(r).operations || []).filter((v) => l.includes(v.action_type)).sort((v, g) => g.requests - v.requests) : []), m = /* @__PURE__ */ at(() => i(r) ? (i(r).operations || []).filter((v) => c.includes(v.action_type)).sort((v, g) => g.requests - v.requests) : []);
  var _ = Ei(), p = u(_);
  {
    var E = (v) => {
      var g = Mi(), N = ut(g), P = h(u(N), 2), C = u(P), R = h(P, 2), B = u(R), G = h(R, 2), A = u(G), V = h(N, 2), k = h(u(V), 2), y = u(k), M = h(k, 4), j = u(M), x = h(M, 2);
      {
        var q = (Y) => {
          var U = wi(), ie = h(u(U), 2);
          Se(ie, 21, () => i(d), He, (ee, J) => {
            var z = bi(), se = u(z), ae = u(se), ce = h(se, 2), pe = u(ce);
            Z(
              (he) => {
                F(ae, i(J).action_type), F(pe, he);
              },
              [() => (i(J).requests ?? 0).toLocaleString()]
            ), T(ee, z);
          }), T(Y, U);
        };
        le(x, (Y) => {
          i(d).length > 0 && Y(q);
        });
      }
      var re = h(V, 2), b = h(u(re), 2), S = u(b), $ = h(b, 4), K = u($), O = h($, 2);
      {
        var Q = (Y) => {
          var U = xi(), ie = h(u(U), 2);
          Se(ie, 21, () => i(m), He, (ee, J) => {
            var z = yi(), se = u(z), ae = u(se), ce = h(se, 2), pe = u(ce);
            Z(
              (he) => {
                F(ae, i(J).action_type), F(pe, he);
              },
              [() => (i(J).requests ?? 0).toLocaleString()]
            ), T(ee, z);
          }), T(Y, U);
        };
        le(O, (Y) => {
          i(m).length > 0 && Y(Q);
        });
      }
      Z(
        (Y, U, ie, ee, J, z, se) => {
          F(C, Y), F(B, `${U ?? ""} objects`), Bt(A, `width: ${ie ?? ""}%`), F(y, ee), Bt(j, `width: ${J ?? ""}%`), F(S, z), Bt(K, `width: ${se ?? ""}%`);
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
      ), T(v, g);
    }, w = (v) => {
      var g = mr(), N = ut(g);
      {
        var P = (R) => {
          var B = ki(), G = h(u(B), 2), A = u(G);
          Z(() => F(A, i(s))), T(R, B);
        }, C = (R) => {
          var B = Si();
          T(R, B);
        };
        le(
          N,
          (R) => {
            i(s) ? R(P) : R(C, !1);
          },
          !0
        );
      }
      T(v, g);
    };
    le(p, (v) => {
      i(r) ? v(E) : v(w, !1);
    });
  }
  T(e, _), Qe();
}
var Ti = /* @__PURE__ */ I('<div class="loading svelte-xxb0sp">読み込み中...</div>'), Ai = /* @__PURE__ */ I('<button class="indexed-icon svelte-xxb0sp" title="類似画像を検索">🔍</button>'), Fi = /* @__PURE__ */ I('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/> <!></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), Pi = /* @__PURE__ */ I('<div class="overlay svelte-xxb0sp"><div class="loading-spinner svelte-xxb0sp"></div></div>'), Oi = /* @__PURE__ */ I('<div class="grid-container svelte-xxb0sp"><div></div> <!></div>'), Ii = /* @__PURE__ */ I('<div class="selected-compare svelte-xxb0sp"><div class="image-item target svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="svelte-xxb0sp">Selected Image</div></div></div> <div class="arrow svelte-xxb0sp">→</div></div>'), Ri = /* @__PURE__ */ I('<div class="loading svelte-xxb0sp">検索中...</div>'), Ni = /* @__PURE__ */ I('<p class="svelte-xxb0sp">類似画像は見つかりませんでした。</p>'), Ci = /* @__PURE__ */ I('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><!> <div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong class="svelte-xxb0sp"> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), Li = /* @__PURE__ */ I("<div></div>"), Hi = /* @__PURE__ */ I('<div class="image-list svelte-xxb0sp"><div class="header svelte-xxb0sp"><div class="title-area svelte-xxb0sp"><h2 class="svelte-xxb0sp"> </h2> <a href="https://dash.cloudflare.com/d52dc19d3368d36eecf4b48d5eb2dd44/r2/default/buckets/lowreal" target="_blank" rel="noopener noreferrer" class="r2-link svelte-xxb0sp">R2 Dashboard ↗</a></div> <div class="pagination svelte-xxb0sp"><button class="svelte-xxb0sp">前へ</button> <span class="svelte-xxb0sp"> </span> <button class="svelte-xxb0sp">次へ</button></div></div> <!> <!></div> <dialog id="similarDialog" class="svelte-xxb0sp"><div class="dialog-header svelte-xxb0sp"><h3 class="svelte-xxb0sp">類似画像一覧</h3> <button type="button" class="close-btn svelte-xxb0sp">×</button></div> <div class="dialog-content svelte-xxb0sp"><!> <!></div></dialog>', 1);
function Yi(e, t) {
  Ze(t, !0);
  let r = /* @__PURE__ */ H(be([])), s = /* @__PURE__ */ H(0), a = 20, n = /* @__PURE__ */ H(0), l = /* @__PURE__ */ H(be([])), c = /* @__PURE__ */ H(null), o = /* @__PURE__ */ H(null);
  async function f() {
    try {
      const O = await ne.get(`/admin/api/images?limit=${a}&offset=${i(s)}`);
      D(r, O.images || [], !0), D(n, O.total || 0, !0);
    } catch (O) {
      console.error(O);
    }
  }
  async function d(O) {
    D(c, O, !0), D(l, [], !0), i(o).showModal();
    try {
      const Q = await ne.get(`/admin/api/image/${O.id}/similar`);
      D(l, Q.similar || [], !0);
    } catch (Q) {
      console.error(Q);
    }
  }
  Mt(f);
  function m() {
    i(s) + a < i(n) && (D(s, i(s) + a), f());
  }
  function _() {
    i(s) - a >= 0 && (D(s, i(s) - a), f());
  }
  var p = Hi(), E = ut(p), w = u(E), v = u(w), g = u(v), N = u(g), P = h(v, 2), C = u(P);
  C.__click = _;
  var R = h(C, 2), B = u(R), G = h(R, 2);
  G.__click = m;
  var A = h(w, 2);
  Di(A, {});
  var V = h(A, 2);
  {
    var k = (O) => {
      var Q = Ti();
      T(O, Q);
    }, y = (O) => {
      var Q = Oi(), Y = u(Q);
      let U;
      Se(Y, 21, () => i(r), (J) => J.id, (J, z) => {
        var se = Fi(), ae = u(se), ce = u(ae), pe = h(ce, 2);
        {
          var he = (ct) => {
            var rt = Ai();
            rt.__click = () => d(i(z)), T(ct, rt);
          };
          le(pe, (ct) => {
            i(z).sig?.length > 0 && ct(he);
          });
        }
        var Re = h(ae, 2), Te = u(Re);
        Pr(Te, {
          get sig() {
            return i(z).sig;
          }
        });
        var Ne = h(Te, 2), xe = u(Ne), Ae = h(u(xe)), Ue = u(Ae), Ce = h(Ne, 2), tt = u(Ce);
        Z(() => {
          me(ce, "src", i(z).uri), me(xe, "href", `/admin/edit?id=${i(z).entry_id ?? ""}`), F(Ue, i(z).entry_id), F(tt, `ID: ${i(z).id ?? ""}`);
        }), T(J, se);
      });
      var ie = h(Y, 2);
      {
        var ee = (J) => {
          var z = Pi();
          T(J, z);
        };
        le(ie, (J) => {
          ne.loading && J(ee);
        });
      }
      Z(() => U = $e(Y, 1, "grid svelte-xxb0sp", null, U, { "is-loading": ne.loading })), T(O, Q);
    };
    le(V, (O) => {
      ne.loading && i(r).length === 0 ? O(k) : O(y, !1);
    });
  }
  var M = h(E, 2), j = u(M), x = h(u(j), 2);
  x.__click = () => i(o).close();
  var q = h(j, 2), re = u(q);
  {
    var b = (O) => {
      var Q = Ii(), Y = u(Q), U = u(Y), ie = u(U), ee = h(U, 2), J = u(ee);
      Pr(J, {
        get sig() {
          return i(c).sig;
        }
      }), Z(() => me(ie, "src", i(c).uri)), T(O, Q);
    };
    le(re, (O) => {
      i(c) && O(b);
    });
  }
  var S = h(re, 2);
  {
    var $ = (O) => {
      var Q = Ri();
      T(O, Q);
    }, K = (O) => {
      var Q = mr(), Y = ut(Q);
      {
        var U = (ee) => {
          var J = Ni();
          T(ee, J);
        }, ie = (ee) => {
          var J = Li();
          let z;
          Se(J, 21, () => i(l), (se) => se.id, (se, ae) => {
            var ce = Ci(), pe = u(ce), he = u(pe), Re = h(pe, 2), Te = u(Re);
            Pr(Te, {
              get sig() {
                return i(ae).sig;
              }
            });
            var Ne = h(Te, 2), xe = u(Ne);
            xe.__click = () => i(o).close();
            var Ae = h(u(xe)), Ue = u(Ae), Ce = h(Ne, 2), tt = u(Ce);
            Z(() => {
              me(he, "src", i(ae).uri), me(xe, "href", `/admin/edit?id=${i(ae).entry_id ?? ""}`), F(Ue, i(ae).entry_id), F(tt, `ID: ${i(ae).id ?? ""} / Score: ${i(ae).score ?? ""}`);
            }), T(se, ce);
          }), Z(() => z = $e(J, 1, "grid similar-grid svelte-xxb0sp", null, z, { "is-loading": ne.loading })), T(ee, J);
        };
        le(
          Y,
          (ee) => {
            i(l).length === 0 ? ee(U) : ee(ie, !1);
          },
          !0
        );
      }
      T(O, Q);
    };
    le(S, (O) => {
      ne.loading && i(l).length === 0 ? O($) : O(K, !1);
    });
  }
  vt(M, (O) => D(o, O), () => i(o)), Z(
    (O) => {
      F(N, `画像一覧 (${i(n) ?? ""})`), C.disabled = i(s) === 0, F(B, `${i(s) + 1} - ${O ?? ""} / ${i(n) ?? ""}`), G.disabled = i(s) + a >= i(n);
    },
    [() => Math.min(i(s) + a, i(n))]
  ), T(e, p), Qe();
}
Wt(["click"]);
var ji = /* @__PURE__ */ I('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), qi = /* @__PURE__ */ I('<span class="term-badge svelte-6rw159"> </span>'), $i = /* @__PURE__ */ I('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">TF-IDF 統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総語彙数 (Terms)</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">インデックス済みエントリ</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">関連エントリ計算済み</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">総関連ペア数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">平均類似度スコア</th><td class="svelte-6rw159"> </td></tr></tbody></table></div> <div style="margin-top: 10px;" class="svelte-6rw159"><h4 class="svelte-6rw159">頻出単語 (Top 20 DF)</h4> <div class="top-terms svelte-6rw159"></div></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">画像統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総画像数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">未インデックス画像数</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), Bi = /* @__PURE__ */ I('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function zi(e, t) {
  Ze(t, !0);
  let r = /* @__PURE__ */ H(null);
  async function s() {
    try {
      D(r, await ne.get("/admin/api/info"), !0);
    } catch (f) {
      console.error(f);
    }
  }
  Mt(s);
  function a(f) {
    if (f === 0) return "0 B";
    const d = 1024, m = ["B", "KB", "MB", "GB", "TB"], _ = Math.floor(Math.log(f) / Math.log(d));
    return parseFloat((f / Math.pow(d, _)).toFixed(2)) + " " + m[_];
  }
  var n = Bi(), l = h(u(n), 2);
  {
    var c = (f) => {
      var d = ji();
      T(f, d);
    }, o = (f) => {
      var d = mr(), m = ut(d);
      {
        var _ = (p) => {
          var E = $i(), w = u(E), v = h(u(w), 2), g = u(v), N = u(g), P = u(N), C = h(u(P)), R = u(C), B = h(P), G = h(u(B)), A = u(G), V = h(B), k = h(u(V)), y = u(k), M = h(V), j = h(u(M)), x = u(j), q = h(M), re = h(u(q)), b = u(re), S = h(v, 2), $ = h(u(S), 2);
          Se($, 21, () => i(r).tfidf_stats?.top_terms ?? [], He, (Sr, sr) => {
            var Ct = qi(), Er = u(Ct);
            Z(() => {
              me(Ct, "title", `DF: ${i(sr).df ?? ""}`), F(Er, i(sr).term);
            }), T(Sr, Ct);
          });
          var K = h(w, 2), O = h(u(K), 2), Q = u(O), Y = u(Q), U = u(Y), ie = h(u(U)), ee = u(ie), J = h(U), z = h(u(J)), se = u(z), ae = h(K, 2), ce = h(u(ae), 2), pe = u(ce), he = u(pe), Re = u(he), Te = h(u(Re)), Ne = u(Te), xe = h(Re), Ae = h(u(xe)), Ue = u(Ae), Ce = u(Ue), tt = h(ae, 2), ct = h(u(tt), 2), rt = u(ct), kt = u(rt), Zt = u(kt), Rt = h(u(Zt)), Qt = u(Rt), er = h(Zt), br = h(u(er)), wr = u(br), Nt = h(er), yr = h(u(Nt)), tr = u(yr), rr = h(Nt), xr = h(u(rr)), L = u(xr), oe = h(rr), ge = h(u(oe)), Le = u(ge), st = h(oe), Mr = h(u(st)), kr = u(Mr), Vr = h(st), Zs = h(u(Vr)), Qs = u(Zs), en = h(Vr), tn = h(u(en)), rn = u(tn), sn = h(tt, 2), nn = h(u(sn), 2), an = u(nn);
          Z(
            (Sr, sr, Ct, Er, ln, on) => {
              F(R, i(r).tfidf_stats?.total_terms ?? 0), F(A, i(r).tfidf_stats?.indexed_entries ?? 0), F(y, i(r).tfidf_stats?.entries_with_related ?? 0), F(x, i(r).tfidf_stats?.total_related_pairs ?? 0), F(b, Sr), F(ee, i(r).image_stats?.total_images ?? 0), F(se, i(r).image_stats?.unindexed_images ?? 0), F(Ne, i(r).is_development), F(Ce, i(r).app_hash), F(Qt, i(r).debug_info.go_version), F(wr, i(r).debug_info.num_goroutine), F(tr, sr), F(L, i(r).debug_info.uptime), F(Le, Ct), F(kr, Er), F(Qs, ln), F(rn, i(r).debug_info.num_gc), F(an, on);
            },
            [
              () => i(r).tfidf_stats?.avg_score?.toFixed(4) ?? "0.0000",
              () => new Date(i(r).debug_info.start_time).toLocaleString(),
              () => a(i(r).debug_info.mem_alloc),
              () => a(i(r).debug_info.mem_total_alloc),
              () => a(i(r).debug_info.mem_sys),
              () => JSON.stringify(i(r).config, null, 2)
            ]
          ), T(p, E);
        };
        le(
          m,
          (p) => {
            i(r) && p(_);
          },
          !0
        );
      }
      T(f, d);
    };
    le(l, (f) => {
      ne.loading && !i(r) ? f(c) : f(o, !1);
    });
  }
  T(e, n), Qe();
}
var Ui = /* @__PURE__ */ I("<a> </a>"), Ji = /* @__PURE__ */ I('<div class="admin-app svelte-1n46o8q"><header><div class="header-left svelte-1n46o8q"><h1 class="svelte-1n46o8q"><a href="/admin/" class="svelte-1n46o8q"><img src="/images/hanrangen-icon.svg" alt="Hanrangon" class="logo svelte-1n46o8q"/></a></h1> <div class="ci-badge svelte-1n46o8q"><a href="https://github.com/cho45/Hanrangon/actions/workflows/ci.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/ci.yml?branch=main&amp;label=ci&amp;style=flat-square" alt="CI Status" class="svelte-1n46o8q"/></a> <a href="https://github.com/cho45/Hanrangon/actions/workflows/lint.yml" target="_blank" rel="noopener noreferrer" class="svelte-1n46o8q"><img src="https://img.shields.io/github/actions/workflow/status/cho45/Hanrangon/lint.yml?branch=main&amp;label=lint&amp;style=flat-square" alt="Lint Status" class="svelte-1n46o8q"/></a></div></div> <nav class="main-nav svelte-1n46o8q"><ul class="svelte-1n46o8q"><li><a href="/" class="svelte-1n46o8q">サイト確認</a></li> <li><a href="/logout" class="svelte-1n46o8q">ログアウト</a></li></ul></nav></header> <nav></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function Xi(e, t) {
  Ze(t, !0);
  let r = /* @__PURE__ */ H(be(window.location.pathname)), s = /* @__PURE__ */ H(be(new URLSearchParams(window.location.search)));
  Mt(() => {
    const v = () => {
      D(r, window.location.pathname, !0), D(s, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", v), () => window.removeEventListener("popstate", v);
  });
  function a(v, g) {
    g && g.preventDefault(), window.history.pushState({}, "", v), D(r, window.location.pathname, !0), D(s, new URLSearchParams(window.location.search), !0);
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
  ], c = /* @__PURE__ */ at(() => {
    const v = i(s).get("id"), g = n[i(r)] ?? n["/admin/"];
    return {
      ...g,
      props: g.getProps(v),
      isActive: (N) => !(N.page !== g.page || N.exact && v)
    };
  }), o = /* @__PURE__ */ at(() => window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  var f = Ji(), d = u(f);
  let m;
  var _ = h(d, 2);
  let p;
  Se(_, 21, () => l, He, (v, g) => {
    var N = Ui();
    N.__click = (R) => a(i(g).path, R);
    let P;
    var C = u(N);
    Z(
      (R) => {
        me(N, "href", i(g).path), P = $e(N, 1, "svelte-1n46o8q", null, P, R), F(C, i(g).label);
      },
      [() => ({ active: i(c).isActive(i(g)) })]
    ), T(v, N);
  });
  var E = h(_, 2), w = u(E);
  Ma(w, () => i(c).component, (v, g) => {
    g(v, Ra(() => i(c).props));
  }), Z(() => {
    m = $e(d, 1, "svelte-1n46o8q", null, m, { "is-localhost": i(o) }), p = $e(_, 1, "sub-nav svelte-1n46o8q", null, p, { "is-localhost": i(o) });
  }), T(e, f), Qe();
}
Wt(["click"]);
const Or = document.getElementById("admin-root");
Or && (Or.innerHTML = "", ga(Xi, { target: Or }));
//# sourceMappingURL=admin-front.js.map
