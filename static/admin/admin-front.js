var Fr = Array.isArray, mn = Array.prototype.indexOf, Ot = Array.from, gn = Object.defineProperty, ft = Object.getOwnPropertyDescriptor, bn = Object.getOwnPropertyDescriptors, yn = Object.prototype, wn = Array.prototype, Nr = Object.getPrototypeOf, hr = Object.isExtensible;
function Mn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Rr() {
  var e, t, r = new Promise((n, a) => {
    e = n, t = a;
  });
  return { promise: r, resolve: e, reject: t };
}
const J = 2, rr = 4, nr = 8, Sn = 1 << 24, xe = 16, Ae = 32, Be = 64, Yt = 128, he = 512, B = 1024, ae = 2048, we = 4096, se = 8192, Oe = 16384, sr = 32768, Ge = 65536, _r = 1 << 17, Pr = 1 << 18, rt = 1 << 19, kn = 1 << 20, ke = 1 << 25, Ue = 32768, Wt = 1 << 21, ar = 1 << 22, Ye = 1 << 23, Tt = /* @__PURE__ */ Symbol("$state"), En = /* @__PURE__ */ Symbol(""), Ze = new class extends Error {
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
const Yn = 1, jn = 2, Ir = 4, Cn = 8, Hn = 16, Ln = 1, zn = 2, $ = /* @__PURE__ */ Symbol(), qn = "http://www.w3.org/1999/xhtml";
function Xn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Or(e) {
  return e === this.v;
}
function Un(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Yr(e) {
  return !Un(e, this.v);
}
let ie = null;
function Qe(e) {
  ie = e;
}
function _t(e, t = !1, r) {
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
function pt(e) {
  var t = (
    /** @type {ComponentContext} */
    ie
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      Gr(n);
  }
  return t.i = !0, ie = t.p, /** @type {T} */
  {};
}
function jr() {
  return !0;
}
let Le = [];
function Cr() {
  var e = Le;
  Le = [], Mn(e);
}
function mt(e) {
  if (Le.length === 0 && !ut) {
    var t = Le;
    queueMicrotask(() => {
      t === Le && Cr();
    });
  }
  Le.push(e);
}
function Jn() {
  for (; Le.length > 0; )
    Cr();
}
function Hr(e) {
  var t = j;
  if (t === null)
    return I.f |= Ye, e;
  if ((t.f & sr) === 0) {
    if ((t.f & Yt) === 0)
      throw e;
    t.b.error(e);
  } else
    et(e, t);
}
function et(e, t) {
  for (; t !== null; ) {
    if ((t.f & Yt) !== 0)
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
const kt = /* @__PURE__ */ new Set();
let O = null, xt = null, ce = null, fe = [], jt = null, Gt = !1, ut = !1;
class ge {
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
    fe = [], xt = null, this.apply();
    var r = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const n of t)
      this.#i(n, r);
    this.is_fork || this.#u(), this.is_deferred() ? (this.#l(r.effects), this.#l(r.render_effects)) : (xt = this, O = null, pr(r.render_effects), pr(r.effects), xt = null, this.#o?.resolve()), ce = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {EffectTarget} target
   */
  #i(t, r) {
    t.f ^= B;
    for (var n = t.first; n !== null; ) {
      var a = n.f, s = (a & (Ae | Be)) !== 0, i = s && (a & B) !== 0, o = i || (a & se) !== 0 || this.skipped_effects.has(n);
      if ((n.f & Yt) !== 0 && n.b?.is_pending() && (r = {
        parent: r,
        effect: n,
        effects: [],
        render_effects: []
      }), !o && n.fn !== null) {
        s ? n.f ^= B : (a & rr) !== 0 ? r.effects.push(n) : bt(n) && ((n.f & xe) !== 0 && this.#a.add(n), ht(n));
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
      (r.f & ae) !== 0 ? this.#a.add(r) : (r.f & we) !== 0 && this.#s.add(r), this.#f(r.deps), V(r, B);
  }
  /**
   * @param {Value[] | null} deps
   */
  #f(t) {
    if (t !== null)
      for (const r of t)
        (r.f & J) === 0 || (r.f & Ue) === 0 || (r.f ^= Ue, this.#f(
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
    this.previous.has(t) || this.previous.set(t, r), (t.f & Ye) === 0 && (this.current.set(t, t.v), ce?.set(t, t.v));
  }
  activate() {
    O = this, this.apply();
  }
  deactivate() {
    O === this && (O = null, ce = null);
  }
  flush() {
    if (this.activate(), fe.length > 0) {
      if (Lr(), O !== null && O !== this)
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
    if (kt.size > 1) {
      this.previous.clear();
      var t = ce, r = !0, n = {
        parent: null,
        effect: null,
        effects: [],
        render_effects: []
      };
      for (const s of kt) {
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
            zr(v, o, l, f);
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
    this.committed = !0, kt.delete(this);
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
      this.#s.delete(t), V(t, ae), Je(t);
    for (const t of this.#s)
      V(t, we), Je(t);
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
    return (this.#o ??= Rr()).promise;
  }
  static ensure() {
    if (O === null) {
      const t = O = new ge();
      kt.add(O), ut || ge.enqueue(() => {
        O === t && t.flush();
      });
    }
    return O;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    mt(t);
  }
  apply() {
  }
}
function $n(e) {
  var t = ut;
  ut = !0;
  try {
    for (var r; ; ) {
      if (Jn(), fe.length === 0 && (O?.flush(), fe.length === 0))
        return jt = null, /** @type {T} */
        r;
      Lr();
    }
  } finally {
    ut = t;
  }
}
function Lr() {
  var e = qe;
  Gt = !0;
  var t = null;
  try {
    var r = 0;
    for (Rt(!0); fe.length > 0; ) {
      var n = ge.ensure();
      if (r++ > 1e3) {
        var a, s;
        Bn();
      }
      n.process(fe), je.clear();
    }
  } finally {
    Gt = !1, Rt(e), jt = null;
  }
}
function Bn() {
  try {
    Nn();
  } catch (e) {
    et(e, jt);
  }
}
let Se = null;
function pr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (Oe | se)) === 0 && bt(n) && (Se = /* @__PURE__ */ new Set(), ht(n), n.deps === null && n.first === null && n.nodes === null && (n.teardown === null && n.ac === null ? tn(n) : n.fn = null), Se?.size > 0)) {
        je.clear();
        for (const a of Se) {
          if ((a.f & (Oe | se)) !== 0) continue;
          const s = [a];
          let i = a.parent;
          for (; i !== null; )
            Se.has(i) && (Se.delete(i), s.push(i)), i = i.parent;
          for (let o = s.length - 1; o >= 0; o--) {
            const l = s[o];
            (l.f & (Oe | se)) === 0 && ht(l);
          }
        }
        Se.clear();
      }
    }
    Se = null;
  }
}
function zr(e, t, r, n) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const s = a.f;
      (s & J) !== 0 ? zr(
        /** @type {Derived} */
        a,
        t,
        r,
        n
      ) : (s & (ar | xe)) !== 0 && (s & ae) === 0 && qr(a, t, n) && (V(a, ae), Je(
        /** @type {Effect} */
        a
      ));
    }
}
function qr(e, t, r) {
  const n = r.get(e);
  if (n !== void 0) return n;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (t.includes(a))
        return !0;
      if ((a.f & J) !== 0 && qr(
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
function Je(e) {
  for (var t = jt = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Gt && t === j && (r & xe) !== 0 && (r & Pr) === 0)
      return;
    if ((r & (Be | Ae)) !== 0) {
      if ((r & B) === 0) return;
      t.f ^= B;
    }
  }
  fe.push(t);
}
function Vn(e) {
  let t = 0, r = $e(0), n;
  return () => {
    vt() && (u(r), Ct(() => (t === 0 && (n = yt(() => e(() => ct(r)))), t += 1, () => {
      mt(() => {
        t -= 1, t === 0 && (n?.(), n = void 0, ct(r));
      });
    })));
  };
}
var Kn = Ge | rt | Yt;
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
  #b = Vn(() => (this.#d = $e(this.#c), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, n) {
    this.#t = t, this.#r = r, this.#o = n, this.parent = /** @type {Effect} */
    j.b, this.#e = !!this.#r.pending, this.#a = fr(() => {
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
    t && (this.#i = ue(() => t(this.#t)), ge.enqueue(() => {
      var r = this.#m();
      this.#s = this.#_(() => (ge.ensure(), ue(() => this.#o(r)))), this.#v > 0 ? this.#p() : (ze(
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
    return this.#e && (this.#u = Ee(), this.#t.before(this.#u), t = this.#u), t;
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
    var r = j, n = I, a = ie;
    Me(this.#a), Q(this.#a), Qe(this.#a.ctx);
    try {
      return t();
    } catch (s) {
      return Hr(s), null;
    } finally {
      Me(r), Q(n), Qe(a);
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
    ), sn(this.#s, this.#f)), this.#i === null && (this.#i = ue(() => t(this.#t)));
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
    this.#v += t, this.#v === 0 && (this.#e = !1, this.#i && ze(this.#i, () => {
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
    this.#g(t), this.#c += t, this.#d && tt(this.#d, this.#c);
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
      a = !0, s && On(), ge.ensure(), this.#c = 0, this.#l !== null && ze(this.#l, () => {
        this.#l = null;
      }), this.#e = this.has_pending_snippet(), this.#s = this.#_(() => (this.#h = !1, ue(() => this.#o(this.#t)))), this.#v > 0 ? this.#p() : this.#e = !1;
    };
    var o = I;
    try {
      Q(null), s = !0, r?.(t, i), s = !1;
    } catch (l) {
      et(l, this.#a && this.#a.parent);
    } finally {
      Q(o);
    }
    n && mt(() => {
      this.#l = this.#_(() => {
        ge.ensure(), this.#h = !0;
        try {
          return ue(() => {
            n(
              this.#t,
              () => t,
              () => i
            );
          });
        } catch (l) {
          return et(
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
  const a = ir;
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
        (i.f & Oe) === 0 && et(v, i);
      }
      s?.deactivate(), At();
    }).catch((f) => {
      et(f, i);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    o();
    try {
      return l();
    } finally {
      s?.deactivate(), At();
    }
  }) : l();
}
function Qn() {
  var e = j, t = I, r = ie, n = O;
  return function(s = !0) {
    Me(e), Q(t), Qe(r), s && n?.activate();
  };
}
function At() {
  Me(null), Q(null), Qe(null);
}
// @__NO_SIDE_EFFECTS__
function ir(e) {
  var t = J | ae, r = I !== null && (I.f & J) !== 0 ? (
    /** @type {Derived} */
    I
  ) : null;
  return j !== null && (j.f |= rt), {
    ctx: ie,
    deps: null,
    effects: null,
    equals: Or,
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
  ), s = $e(
    /** @type {V} */
    $
  ), i = !I, o = /* @__PURE__ */ new Map();
  return hs(() => {
    var l = Rr();
    a = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).then(() => {
        f === O && f.committed && f.deactivate(), At();
      });
    } catch (h) {
      l.reject(h), At();
    }
    var f = (
      /** @type {Batch} */
      O
    );
    if (i) {
      var v = !n.is_pending();
      n.update_pending_count(1), f.increment(v), o.get(f)?.reject(Ze), o.delete(f), o.set(f, l);
    }
    const p = (h, _ = void 0) => {
      if (f.activate(), _)
        _ !== Ze && (s.f |= Ye, tt(s, _));
      else {
        (s.f & Ye) !== 0 && (s.f ^= Ye), tt(s, h);
        for (const [N, g] of o) {
          if (o.delete(N), N === f) break;
          g.reject(Ze);
        }
      }
      i && (n.update_pending_count(-1), f.decrement(v));
    };
    l.promise.then(p, (h) => p(null, h || "unknown"));
  }), us(() => {
    for (const l of o.values())
      l.reject(Ze);
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
function mr(e) {
  const t = /* @__PURE__ */ ir(e);
  return an(t), t;
}
// @__NO_SIDE_EFFECTS__
function ts(e) {
  const t = /* @__PURE__ */ ir(e);
  return t.equals = Yr, t;
}
function Xr(e) {
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
      return (t.f & Oe) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function lr(e) {
  var t, r = j;
  Me(rs(e));
  try {
    e.f &= ~Ue, Xr(e), t = un(e);
  } finally {
    Me(r);
  }
  return t;
}
function Ur(e) {
  var t = lr(e);
  if (e.equals(t) || (O?.is_fork || (e.v = t), e.wv = on()), !nt)
    if (ce !== null)
      (vt() || O?.is_fork) && ce.set(e, t);
    else {
      var r = (e.f & he) === 0 ? we : B;
      V(e, r);
    }
}
let Qt = /* @__PURE__ */ new Set();
const je = /* @__PURE__ */ new Map();
let Jr = !1;
function $e(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Or,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function Y(e, t) {
  const r = $e(e);
  return an(r), r;
}
// @__NO_SIDE_EFFECTS__
function ns(e, t = !1, r = !0) {
  const n = $e(e);
  return t || (n.equals = Yr), n;
}
function T(e, t, r = !1) {
  I !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!be || (I.f & _r) !== 0) && jr() && (I.f & (J | xe | ar | _r)) !== 0 && !Te?.includes(e) && In();
  let n = r ? de(t) : t;
  return tt(e, n);
}
function tt(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    nt ? je.set(e, t) : je.set(e, r), e.v = t;
    var n = ge.ensure();
    n.capture(e, r), (e.f & J) !== 0 && ((e.f & ae) !== 0 && lr(
      /** @type {Derived} */
      e
    ), V(e, (e.f & he) !== 0 ? B : we)), e.wv = on(), $r(e, ae), j !== null && (j.f & B) !== 0 && (j.f & (Ae | Be)) === 0 && (oe === null ? ms([e]) : oe.push(e)), !n.is_fork && Qt.size > 0 && !Jr && ss();
  }
  return t;
}
function ss() {
  Jr = !1;
  var e = qe;
  Rt(!0);
  const t = Array.from(Qt);
  try {
    for (const r of t)
      (r.f & B) !== 0 && V(r, we), bt(r) && ht(r);
  } finally {
    Rt(e);
  }
  Qt.clear();
}
function ct(e) {
  T(e, e.v + 1);
}
function $r(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, a = 0; a < n; a++) {
      var s = r[a], i = s.f, o = (i & ae) === 0;
      if (o && V(s, t), (i & J) !== 0) {
        var l = (
          /** @type {Derived} */
          s
        );
        ce?.delete(l), (i & Ue) === 0 && (i & he && (s.f |= Ue), $r(l, we));
      } else o && ((i & xe) !== 0 && Se !== null && Se.add(
        /** @type {Effect} */
        s
      ), Je(
        /** @type {Effect} */
        s
      ));
    }
}
function de(e) {
  if (typeof e != "object" || e === null || Tt in e)
    return e;
  const t = Nr(e);
  if (t !== yn && t !== wn)
    return e;
  var r = /* @__PURE__ */ new Map(), n = Fr(e), a = /* @__PURE__ */ Y(0), s = Xe, i = (o) => {
    if (Xe === s)
      return o();
    var l = I, f = Xe;
    Q(null), wr(s);
    var v = o();
    return Q(l), wr(f), v;
  };
  return n && r.set("length", /* @__PURE__ */ Y(
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
          var p = /* @__PURE__ */ Y(f.value);
          return r.set(l, p), p;
        }) : T(v, f.value, !0), !0;
      },
      deleteProperty(o, l) {
        var f = r.get(l);
        if (f === void 0) {
          if (l in o) {
            const v = i(() => /* @__PURE__ */ Y($));
            r.set(l, v), ct(a);
          }
        } else
          T(f, $), ct(a);
        return !0;
      },
      get(o, l, f) {
        if (l === Tt)
          return e;
        var v = r.get(l), p = l in o;
        if (v === void 0 && (!p || ft(o, l)?.writable) && (v = i(() => {
          var _ = de(p ? o[l] : $), N = /* @__PURE__ */ Y(_);
          return N;
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
        if (l === Tt)
          return !0;
        var f = r.get(l), v = f !== void 0 && f.v !== $ || Reflect.has(o, l);
        if (f !== void 0 || j !== null && (!v || ft(o, l)?.writable)) {
          f === void 0 && (f = i(() => {
            var h = v ? de(o[l]) : $, _ = /* @__PURE__ */ Y(h);
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
            var N = r.get(_ + "");
            N !== void 0 ? T(N, $) : _ in o && (N = i(() => /* @__PURE__ */ Y($)), r.set(_ + "", N));
          }
        if (p === void 0)
          (!h || ft(o, l)?.writable) && (p = i(() => /* @__PURE__ */ Y(void 0)), T(p, de(f)), r.set(l, p));
        else {
          h = p.v !== $;
          var g = i(() => de(f));
          T(p, g);
        }
        var d = Reflect.getOwnPropertyDescriptor(o, l);
        if (d?.set && d.set.call(v, f), !h) {
          if (n && typeof l == "string") {
            var S = (
              /** @type {Source<number>} */
              r.get("length")
            ), H = Number(l);
            Number.isInteger(H) && H >= S.v && T(S, H + 1);
          }
          ct(a);
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
var gr, Br, Vr, Kr;
function as() {
  if (gr === void 0) {
    gr = window, Br = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    Vr = ft(t, "firstChild").get, Kr = ft(t, "nextSibling").get, hr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), hr(r) && (r.__t = void 0);
  }
}
function Ee(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ft(e) {
  return (
    /** @type {TemplateNode | null} */
    Vr.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function gt(e) {
  return (
    /** @type {TemplateNode | null} */
    Kr.call(e)
  );
}
function w(e, t) {
  return /* @__PURE__ */ Ft(e);
}
function Nt(e, t = !1) {
  {
    var r = /* @__PURE__ */ Ft(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ gt(r) : r;
  }
}
function x(e, t = 1, r = !1) {
  let n = e;
  for (; t--; )
    n = /** @type {TemplateNode} */
    /* @__PURE__ */ gt(n);
  return n;
}
function is(e) {
  e.textContent = "";
}
function Zr() {
  return !1;
}
let br = !1;
function ls() {
  br || (br = !0, document.addEventListener(
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
  var t = I, r = j;
  Q(null), Me(null);
  try {
    return e();
  } finally {
    Q(t), Me(r);
  }
}
function Wr(e, t, r, n = r) {
  e.addEventListener(t, () => or(r));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), n(!0);
  } : e.__on_r = () => n(!0), ls();
}
function os(e) {
  j === null && (I === null && Fn(), An()), nt && xn();
}
function fs(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function Fe(e, t, r) {
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
      ht(a), a.f |= sr;
    } catch (o) {
      throw ee(a), o;
    }
  else t !== null && Je(a);
  var s = a;
  if (r && s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
  (s.f & rt) === 0 && (s = s.first, (e & xe) !== 0 && (e & Ge) !== 0 && s !== null && (s.f |= Ge)), s !== null && (s.parent = n, n !== null && fs(s, n), I !== null && (I.f & J) !== 0 && (e & Be) === 0)) {
    var i = (
      /** @type {Derived} */
      I
    );
    (i.effects ??= []).push(s);
  }
  return a;
}
function vt() {
  return I !== null && !be;
}
function us(e) {
  const t = Fe(nr, null, !1);
  return V(t, B), t.teardown = e, t;
}
function cs(e) {
  os();
  var t = (
    /** @type {Effect} */
    j.f
  ), r = !I && (t & Ae) !== 0 && (t & sr) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      ie
    );
    (n.e ??= []).push(e);
  } else
    return Gr(e);
}
function Gr(e) {
  return Fe(rr | kn, e, !1);
}
function vs(e) {
  ge.ensure();
  const t = Fe(Be | rt, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? ze(t, () => {
      ee(t), n(void 0);
    }) : (ee(t), n(void 0));
  });
}
function ds(e) {
  return Fe(rr, e, !1);
}
function hs(e) {
  return Fe(ar | rt, e, !0);
}
function Ct(e, t = 0) {
  return Fe(nr | t, e, !0);
}
function De(e, t = [], r = [], n = []) {
  Gn(n, t, r, (a) => {
    Fe(nr, () => e(...a.map(u)), !0);
  });
}
function fr(e, t = 0) {
  var r = Fe(xe | t, e, !0);
  return r;
}
function ue(e) {
  return Fe(Ae | rt, e, !0);
}
function Qr(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = nt, n = I;
    yr(!0), Q(null);
    try {
      t.call(null);
    } finally {
      yr(r), Q(n);
    }
  }
}
function en(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const a = r.ac;
    a !== null && or(() => {
      a.abort(Ze);
    });
    var n = r.next;
    (r.f & Be) !== 0 ? r.parent = null : ee(r, t), r = n;
  }
}
function _s(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & Ae) === 0 && ee(t), t = r;
  }
}
function ee(e, t = !0) {
  var r = !1;
  (t || (e.f & Pr) !== 0) && e.nodes !== null && e.nodes.end !== null && (ps(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), en(e, t && !r), Pt(e, 0), V(e, Oe);
  var n = e.nodes && e.nodes.t;
  if (n !== null)
    for (const s of n)
      s.stop();
  Qr(e);
  var a = e.parent;
  a !== null && a.first !== null && tn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function ps(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ gt(e);
    e.remove(), e = r;
  }
}
function tn(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function ze(e, t, r = !0) {
  var n = [];
  rn(e, n, !0);
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
function rn(e, t, r) {
  if ((e.f & se) === 0) {
    e.f ^= se;
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const o of n)
        (o.is_global || r) && t.push(o);
    for (var a = e.first; a !== null; ) {
      var s = a.next, i = (a.f & Ge) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (a.f & Ae) !== 0 && (e.f & xe) !== 0;
      rn(a, t, i ? r : !1), a = s;
    }
  }
}
function ur(e) {
  nn(e, !0);
}
function nn(e, t) {
  if ((e.f & se) !== 0) {
    e.f ^= se, (e.f & B) === 0 && (V(e, ae), Je(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, a = (r.f & Ge) !== 0 || (r.f & Ae) !== 0;
      nn(r, a ? t : !1), r = n;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const i of s)
        (i.is_global || t) && i.in();
  }
}
function sn(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end; r !== null; ) {
      var a = r === n ? null : /* @__PURE__ */ gt(r);
      t.append(r), r = a;
    }
}
let qe = !1;
function Rt(e) {
  qe = e;
}
let nt = !1;
function yr(e) {
  nt = e;
}
let I = null, be = !1;
function Q(e) {
  I = e;
}
let j = null;
function Me(e) {
  j = e;
}
let Te = null;
function an(e) {
  I !== null && (Te === null ? Te = [e] : Te.push(e));
}
let W = null, ne = 0, oe = null;
function ms(e) {
  oe = e;
}
let ln = 1, dt = 0, Xe = dt;
function wr(e) {
  Xe = e;
}
function on() {
  return ++ln;
}
function bt(e) {
  var t = e.f;
  if ((t & ae) !== 0)
    return !0;
  if (t & J && (e.f &= ~Ue), (t & we) !== 0) {
    var r = e.deps;
    if (r !== null)
      for (var n = r.length, a = 0; a < n; a++) {
        var s = r[a];
        if (bt(
          /** @type {Derived} */
          s
        ) && Ur(
          /** @type {Derived} */
          s
        ), s.wv > e.wv)
          return !0;
      }
    (t & he) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    ce === null && V(e, B);
  }
  return !1;
}
function fn(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !Te?.includes(e))
    for (var a = 0; a < n.length; a++) {
      var s = n[a];
      (s.f & J) !== 0 ? fn(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (r ? V(s, ae) : (s.f & B) !== 0 && V(s, we), Je(
        /** @type {Effect} */
        s
      ));
    }
}
function un(e) {
  var t = W, r = ne, n = oe, a = I, s = Te, i = ie, o = be, l = Xe, f = e.f;
  W = /** @type {null | Value[]} */
  null, ne = 0, oe = null, I = (f & (Ae | Be)) === 0 ? e : null, Te = null, Qe(e.ctx), be = !1, Xe = ++dt, e.ac !== null && (or(() => {
    e.ac.abort(Ze);
  }), e.ac = null);
  try {
    e.f |= Wt;
    var v = (
      /** @type {Function} */
      e.fn
    ), p = v(), h = e.deps;
    if (W !== null) {
      var _;
      if (Pt(e, ne), h !== null && ne > 0)
        for (h.length = ne + W.length, _ = 0; _ < W.length; _++)
          h[ne + _] = W[_];
      else
        e.deps = h = W;
      if (vt() && (e.f & he) !== 0)
        for (_ = ne; _ < h.length; _++)
          (h[_].reactions ??= []).push(e);
    } else h !== null && ne < h.length && (Pt(e, ne), h.length = ne);
    if (jr() && oe !== null && !be && h !== null && (e.f & (J | we | ae)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      oe.length; _++)
        fn(
          oe[_],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (dt++, oe !== null && (n === null ? n = oe : n.push(.../** @type {Source[]} */
    oe))), (e.f & Ye) !== 0 && (e.f ^= Ye), p;
  } catch (N) {
    return Hr(N);
  } finally {
    e.f ^= Wt, W = t, ne = r, oe = n, I = a, Te = s, Qe(i), be = o, Xe = l;
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
  (W === null || !W.includes(t)) && (V(t, we), (t.f & he) !== 0 && (t.f ^= he, t.f &= ~Ue), Xr(
    /** @type {Derived} **/
    t
  ), Pt(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Pt(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      gs(e, r[n]);
}
function ht(e) {
  var t = e.f;
  if ((t & Oe) === 0) {
    V(e, B);
    var r = j, n = qe;
    j = e, qe = !0;
    try {
      (t & (xe | Sn)) !== 0 ? _s(e) : en(e), Qr(e);
      var a = un(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = ln;
      var s;
    } finally {
      qe = n, j = r;
    }
  }
}
async function bs() {
  await Promise.resolve(), $n();
}
function u(e) {
  var t = e.f, r = (t & J) !== 0;
  if (I !== null && !be) {
    var n = j !== null && (j.f & Oe) !== 0;
    if (!n && !Te?.includes(e)) {
      var a = I.deps;
      if ((I.f & Wt) !== 0)
        e.rv < dt && (e.rv = dt, W === null && a !== null && a[ne] === e ? ne++ : W === null ? W = [e] : W.includes(e) || W.push(e));
      else {
        (I.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [I] : s.includes(I) || s.push(I);
      }
    }
  }
  if (nt) {
    if (je.has(e))
      return je.get(e);
    if (r) {
      var i = (
        /** @type {Derived} */
        e
      ), o = i.v;
      return ((i.f & B) === 0 && i.reactions !== null || vn(i)) && (o = lr(i)), je.set(i, o), o;
    }
  } else r && (!ce?.has(e) || O?.is_fork && !vt()) && (i = /** @type {Derived} */
  e, bt(i) && Ur(i), qe && vt() && (i.f & he) === 0 && cn(i));
  if (ce?.has(e))
    return ce.get(e);
  if ((e.f & Ye) !== 0)
    throw e.v;
  return e.v;
}
function cn(e) {
  if (e.deps !== null) {
    e.f ^= he;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & J) !== 0 && (t.f & he) === 0 && cn(
        /** @type {Derived} */
        t
      );
  }
}
function vn(e) {
  if (e.v === $) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (je.has(t) || (t.f & J) !== 0 && vn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function yt(e) {
  var t = be;
  try {
    return be = !0, e();
  } finally {
    be = t;
  }
}
const ys = -7169;
function V(e, t) {
  e.f = e.f & ys | t;
}
const ws = ["touchstart", "touchmove"];
function Ms(e) {
  return ws.includes(e);
}
const dn = /* @__PURE__ */ new Set(), er = /* @__PURE__ */ new Set();
function Ht(e) {
  for (var t = 0; t < e.length; t++)
    dn.add(e[t]);
  for (var r of er)
    r(e);
}
let Mr = null;
function Et(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, a = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Mr = e;
  var i = 0, o = Mr === e && e.__root;
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
    var v = I, p = j;
    Q(null), Me(null);
    try {
      for (var h, _ = []; s !== null; ) {
        var N = s.assignedSlot || s.parentNode || /** @type {any} */
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
        if (e.cancelBubble || N === t || N === null)
          break;
        s = N;
      }
      if (h) {
        for (let d of _)
          queueMicrotask(() => {
            throw d;
          });
        throw h;
      }
    } finally {
      e.__root = t, delete e.currentTarget, Q(v), Me(p);
    }
  }
}
function Ss(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function It(e, t) {
  var r = (
    /** @type {Effect} */
    j
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function K(e, t) {
  var r = (t & Ln) !== 0, n = (t & zn) !== 0, a, s = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = Ss(s ? e : "<!>" + e), r || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ Ft(a)));
    var i = (
      /** @type {TemplateNode} */
      n || Br ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ft(i)
      ), l = (
        /** @type {TemplateNode} */
        i.lastChild
      );
      It(o, l);
    } else
      It(i, i);
    return i;
  };
}
function ks(e = "") {
  {
    var t = Ee(e + "");
    return It(t, t), t;
  }
}
function hn() {
  var e = document.createDocumentFragment(), t = document.createComment(""), r = Ee();
  return e.append(t, r), It(t, r), e;
}
function X(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function z(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ??= e.nodeValue) && (e.__t = r, e.nodeValue = r + "");
}
function Es(e, t) {
  return Ds(e, t);
}
const Ke = /* @__PURE__ */ new Map();
function Ds(e, { target: t, anchor: r, props: n = {}, events: a, context: s, intro: i = !0 }) {
  as();
  var o = /* @__PURE__ */ new Set(), l = (p) => {
    for (var h = 0; h < p.length; h++) {
      var _ = p[h];
      if (!o.has(_)) {
        o.add(_);
        var N = Ms(_);
        t.addEventListener(_, Et, { passive: N });
        var g = Ke.get(_);
        g === void 0 ? (document.addEventListener(_, Et, { passive: N }), Ke.set(_, 1)) : Ke.set(_, g + 1);
      }
    }
  };
  l(Ot(dn)), er.add(l);
  var f = void 0, v = vs(() => {
    var p = r ?? t.appendChild(Ee());
    return Zn(
      /** @type {TemplateNode} */
      p,
      {
        pending: () => {
        }
      },
      (h) => {
        if (s) {
          _t({});
          var _ = (
            /** @type {ComponentContext} */
            ie
          );
          _.c = s;
        }
        a && (n.$$events = a), f = e(h, n) || {}, s && pt();
      }
    ), () => {
      for (var h of o) {
        t.removeEventListener(h, Et);
        var _ = (
          /** @type {number} */
          Ke.get(h)
        );
        --_ === 0 ? (document.removeEventListener(h, Et), Ke.delete(h)) : Ke.set(h, _);
      }
      er.delete(l), p !== r && p.parentNode?.removeChild(p);
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
        ur(n), this.#r.delete(r);
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
            sn(i, f), f.append(Ee()), this.#n.set(s, { effect: i, fragment: f });
          } else
            ee(i);
          this.#r.delete(s), this.#t.delete(s);
        };
        this.#o || !n ? (this.#r.add(s), ze(i, o, !1)) : o();
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
    ), a = Zr();
    if (r && !this.#t.has(t) && !this.#n.has(t))
      if (a) {
        var s = document.createDocumentFragment(), i = Ee();
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
function ye(e, t, r = !1) {
  var n = new xs(e), a = r ? Ge : 0;
  function s(i, o) {
    n.ensure(i, o);
  }
  fr(() => {
    var i = !1;
    t((o, l = !0) => {
      i = !0, s(l, o);
    }), i || s(!1, null);
  }, a);
}
function cr(e, t) {
  return t;
}
function As(e, t, r) {
  for (var n = [], a = t.length, s, i = t.length, o = 0; o < a; o++) {
    let p = t[o];
    ze(
      p,
      () => {
        if (s) {
          if (s.pending.delete(p), s.done.add(p), s.pending.size === 0) {
            var h = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            tr(Ot(s.done)), h.delete(s), h.size === 0 && (e.outrogroups = null);
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
    tr(t, !l);
  } else
    s = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(s);
}
function tr(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    ee(e[r], t);
}
var Sr;
function vr(e, t, r, n, a, s = null) {
  var i = e, o = /* @__PURE__ */ new Map(), l = (t & Ir) !== 0;
  if (l) {
    var f = (
      /** @type {Element} */
      e
    );
    i = f.appendChild(Ee());
  }
  var v = null, p = /* @__PURE__ */ ts(() => {
    var S = r();
    return Fr(S) ? S : S == null ? [] : Ot(S);
  }), h, _ = !0;
  function N() {
    d.fallback = v, Fs(d, h, i, t, n), v !== null && (h.length === 0 ? (v.f & ke) === 0 ? ur(v) : (v.f ^= ke, ot(v, null, i)) : ze(v, () => {
      v = null;
    }));
  }
  var g = fr(() => {
    h = /** @type {V[]} */
    u(p);
    for (var S = h.length, H = /* @__PURE__ */ new Set(), P = (
      /** @type {Batch} */
      O
    ), k = Zr(), R = 0; R < S; R += 1) {
      var q = h[R], L = n(q, R), E = _ ? null : o.get(L);
      E ? (E.v && tt(E.v, q), E.i && tt(E.i, R), k && P.skipped_effects.delete(E.e)) : (E = Ns(
        o,
        _ ? i : Sr ??= Ee(),
        q,
        L,
        R,
        a,
        t,
        r
      ), _ || (E.e.f |= ke), o.set(L, E)), H.add(L);
    }
    if (S === 0 && s && !v && (_ ? v = ue(() => s(i)) : (v = ue(() => s(Sr ??= Ee())), v.f |= ke)), !_)
      if (k) {
        for (const [D, F] of o)
          H.has(D) || P.skipped_effects.add(F.e);
        P.oncommit(N), P.ondiscard(() => {
        });
      } else
        N();
    u(p);
  }), d = { effect: g, items: o, outrogroups: null, fallback: v };
  _ = !1;
}
function Fs(e, t, r, n, a) {
  var s = (n & Cn) !== 0, i = t.length, o = e.items, l = e.effect.first, f, v = null, p, h = [], _ = [], N, g, d, S;
  if (s)
    for (S = 0; S < i; S += 1)
      N = t[S], g = a(N, S), d = /** @type {EachItem} */
      o.get(g).e, (d.f & ke) === 0 && (d.nodes?.a?.measure(), (p ??= /* @__PURE__ */ new Set()).add(d));
  for (S = 0; S < i; S += 1) {
    if (N = t[S], g = a(N, S), d = /** @type {EachItem} */
    o.get(g).e, e.outrogroups !== null)
      for (const F of e.outrogroups)
        F.pending.delete(d), F.done.delete(d);
    if ((d.f & ke) !== 0)
      if (d.f ^= ke, d === l)
        ot(d, null, r);
      else {
        var H = v ? v.next : l;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), Ie(e, v, d), Ie(e, d, H), ot(d, H, r), v = d, h = [], _ = [], l = v.next;
        continue;
      }
    if ((d.f & se) !== 0 && (ur(d), s && (d.nodes?.a?.unfix(), (p ??= /* @__PURE__ */ new Set()).delete(d))), d !== l) {
      if (f !== void 0 && f.has(d)) {
        if (h.length < _.length) {
          var P = _[0], k;
          v = P.prev;
          var R = h[0], q = h[h.length - 1];
          for (k = 0; k < h.length; k += 1)
            ot(h[k], P, r);
          for (k = 0; k < _.length; k += 1)
            f.delete(_[k]);
          Ie(e, R.prev, q.next), Ie(e, v, R), Ie(e, q, P), l = P, v = q, S -= 1, h = [], _ = [];
        } else
          f.delete(d), ot(d, l, r), Ie(e, d.prev, d.next), Ie(e, d, v === null ? e.effect.first : v.next), Ie(e, v, d), v = d;
        continue;
      }
      for (h = [], _ = []; l !== null && l !== d; )
        (f ??= /* @__PURE__ */ new Set()).add(l), _.push(l), l = l.next;
      if (l === null)
        continue;
    }
    (d.f & ke) === 0 && h.push(d), v = d, l = d.next;
  }
  if (e.outrogroups !== null) {
    for (const F of e.outrogroups)
      F.pending.size === 0 && (tr(Ot(F.done)), e.outrogroups?.delete(F));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || f !== void 0) {
    var L = [];
    if (f !== void 0)
      for (d of f)
        (d.f & se) === 0 && L.push(d);
    for (; l !== null; )
      (l.f & se) === 0 && l !== e.fallback && L.push(l), l = l.next;
    var E = L.length;
    if (E > 0) {
      var D = (n & Ir) !== 0 && i === 0 ? r : null;
      if (s) {
        for (S = 0; S < E; S += 1)
          L[S].nodes?.a?.measure();
        for (S = 0; S < E; S += 1)
          L[S].nodes?.a?.fix();
      }
      As(e, L, D);
    }
  }
  s && mt(() => {
    if (p !== void 0)
      for (d of p)
        d.nodes?.a?.apply();
  });
}
function Ns(e, t, r, n, a, s, i, o) {
  var l = (i & Yn) !== 0 ? (i & Hn) === 0 ? /* @__PURE__ */ ns(r, !1, !1) : $e(r) : null, f = (i & jn) !== 0 ? $e(a) : null;
  return {
    v: l,
    i: f,
    e: ue(() => (s(t, l ?? r, f ?? a, o), () => {
      e.delete(n);
    }))
  };
}
function ot(e, t, r) {
  if (e.nodes)
    for (var n = e.nodes.start, a = e.nodes.end, s = t && (t.f & ke) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; n !== null; ) {
      var i = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ gt(n)
      );
      if (s.before(n), n === a)
        return;
      n = i;
    }
}
function Ie(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
const kr = [...` 	
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
          (i === 0 || kr.includes(n[i - 1])) && (o === n.length || kr.includes(n[o])) ? n = (i === 0 ? "" : n.substring(0, i)) + n.substring(o + 1) : i = o;
        }
  }
  return n === "" ? null : n;
}
function We(e, t, r, n, a, s) {
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
function _n(e, t, r, n) {
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
var Er = /* @__PURE__ */ new Map();
function Ys(e) {
  var t = e.getAttribute("is") || e.nodeName, r = Er.get(t);
  if (r) return r;
  Er.set(t, r = []);
  for (var n, a = e, s = Element.prototype; s !== a; ) {
    n = bn(a);
    for (var i in n)
      n[i].set && r.push(i);
    a = Nr(a);
  }
  return r;
}
function Dr(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet();
  Wr(e, "input", async (a) => {
    var s = a ? e.defaultValue : e.value;
    if (s = Bt(e) ? Vt(s) : s, r(s), O !== null && n.add(O), await bs(), s !== (s = t())) {
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
  yt(t) == null && e.value && (r(Bt(e) ? Vt(e.value) : e.value), O !== null && n.add(O)), Ct(() => {
    var a = t();
    if (e === document.activeElement) {
      var s = (
        /** @type {Batch} */
        xt ?? O
      );
      if (n.has(s))
        return;
    }
    Bt(e) && a === Vt(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
function js(e, t, r = t) {
  Wr(e, "change", (n) => {
    var a = n ? e.defaultChecked : e.checked;
    r(a);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  // If defaultChecked is set, then checked == defaultChecked
  yt(t) == null && r(e.checked), Ct(() => {
    var n = t();
    e.checked = !!n;
  });
}
function Bt(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function Vt(e) {
  return e === "" ? null : +e;
}
function Tr(e, t) {
  return e === t || e?.[Tt] === t;
}
function Dt(e = {}, t, r, n) {
  return ds(() => {
    var a, s;
    return Ct(() => {
      a = s, s = [], yt(() => {
        e !== r(...s) && (t(e, ...s), a && Tr(r(...a), e) && t(null, ...a));
      });
    }), () => {
      mt(() => {
        s && Tr(r(...s), e) && t(null, ...s);
      });
    };
  }), e;
}
function xr(e, t, r, n) {
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
function Lt(e) {
  ie === null && Dn(), cs(() => {
    const t = yt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Cs = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Cs);
function Hs(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Kt = { exports: {} }, Ar;
function Ls() {
  return Ar || (Ar = 1, (function(e) {
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
      function a(g, d, S) {
        var H = g || r, P = d || 0, k = S || !1, R = 0, q;
        function L(F, b) {
          var M;
          if (b) {
            if (M = b.getTime(), k) {
              var c = v(b);
              if (b = new Date(M + c + P), v(b) !== c) {
                var y = v(b);
                b = new Date(M + y + P);
              }
            }
          } else {
            var m = Date.now();
            m > R ? (R = m, q = new Date(R), M = R, k && (q = new Date(R + v(q) + P))) : M = R, b = q;
          }
          return E(F, b, H, M);
        }
        function E(F, b, M, m) {
          for (var c = "", y = null, A = !1, Z = F.length, le = !1, te = 0; te < Z; te++) {
            var G = F.charCodeAt(te);
            if (A === !0) {
              if (G === 45) {
                y = "";
                continue;
              } else if (G === 95) {
                y = " ";
                continue;
              } else if (G === 48) {
                y = "0";
                continue;
              } else if (G === 58) {
                le && N("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), le = !0;
                continue;
              }
              switch (G) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  c += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  c += M.days[b.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  c += M.months[b.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  c += s(Math.floor(b.getFullYear() / 100), y);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  c += E(M.formats.D, b, M, m);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  c += E(M.formats.F, b, M, m);
                  break;
                // '00'
                // case 'H':
                case 72:
                  c += s(b.getHours(), y);
                  break;
                // '12'
                // case 'I':
                case 73:
                  c += s(o(b.getHours()), y);
                  break;
                // '000'
                // case 'L':
                case 76:
                  c += i(Math.floor(m % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  c += s(b.getMinutes(), y);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  c += b.getHours() < 12 ? M.am : M.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  c += E(M.formats.R, b, M, m);
                  break;
                // '00'
                // case 'S':
                case 83:
                  c += s(b.getSeconds(), y);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  c += E(M.formats.T, b, M, m);
                  break;
                // '00'
                // case 'U':
                case 85:
                  c += s(l(b, "sunday"), y);
                  break;
                // '00'
                // case 'W':
                case 87:
                  c += s(l(b, "monday"), y);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  c += E(M.formats.X, b, M, m);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  c += b.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (k && P === 0)
                    c += "GMT";
                  else {
                    var Ce = p(b);
                    c += Ce || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  c += M.shortDays[b.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  c += M.shortMonths[b.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  c += E(M.formats.c, b, M, m);
                  break;
                // '01'
                // case 'd':
                case 100:
                  c += s(b.getDate(), y);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  c += s(b.getDate(), y ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  c += M.shortMonths[b.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var ve = new Date(b.getFullYear(), 0, 1), U = Math.ceil((b.getTime() - ve.getTime()) / (1e3 * 60 * 60 * 24));
                  c += i(U);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  c += s(b.getHours(), y ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  c += s(o(b.getHours()), y ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  c += s(b.getMonth() + 1, y);
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
                  var U = b.getDate();
                  M.ordinalSuffixes ? c += String(U) + (M.ordinalSuffixes[U - 1] || f(U)) : c += String(U) + f(U);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  c += b.getHours() < 12 ? M.AM : M.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  c += E(M.formats.r, b, M, m);
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
                  var U = b.getDay();
                  c += U === 0 ? 7 : U;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  c += E(M.formats.v, b, M, m);
                  break;
                // '4'
                // case 'w':
                case 119:
                  c += b.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  c += E(M.formats.x, b, M, m);
                  break;
                // '70'
                // case 'y':
                case 121:
                  c += s(b.getFullYear() % 100, y);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (k && P === 0)
                    c += le ? "+00:00" : "+0000";
                  else {
                    var re;
                    P !== 0 ? re = P / (60 * 1e3) : re = -b.getTimezoneOffset();
                    var Ne = re < 0 ? "-" : "+", Re = le ? ":" : "", Pe = Math.floor(Math.abs(re / 60)), He = Math.abs(re % 60);
                    c += Ne + s(Pe) + Re + s(He);
                  }
                  break;
                default:
                  A && (c += "%"), c += F[te];
                  break;
              }
              y = null, A = !1;
              continue;
            }
            if (G === 37) {
              A = !0;
              continue;
            }
            c += F[te];
          }
          return c;
        }
        var D = L;
        return D.localize = function(F) {
          return new a(F || H, P, k);
        }, D.localizeByIdentifier = function(F) {
          var b = t[F];
          return b ? D.localize(b) : (N('[WARNING] No locale found with identifier "' + F + '".'), D);
        }, D.timezone = function(F) {
          var b = P, M = k, m = typeof F;
          if (m === "number" || m === "string")
            if (M = !0, m === "string") {
              var c = F[0] === "-" ? -1 : 1, y = parseInt(F.slice(1, 3), 10), A = parseInt(F.slice(3, 5), 10);
              b = c * (60 * y + A) * 60 * 1e3;
            } else m === "number" && (b = F * 60 * 1e3);
          return new a(H, b, M);
        }, D.utc = function() {
          return new a(H, P, !0);
        }, D;
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
        var S = g.getDay();
        d === "monday" && (S === 0 ? S = 6 : S--);
        var H = Date.UTC(g.getFullYear(), 0, 1), P = Date.UTC(g.getFullYear(), g.getMonth(), g.getDate()), k = Math.floor((P - H) / 864e5), R = (k + 7 - S) / 7;
        return Math.floor(R);
      }
      function f(g) {
        var d = g % 10, S = g % 100;
        if (S >= 11 && S <= 13 || d === 0 || d >= 4)
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
      function N(g) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(g);
      }
    })();
  })(Kt)), Kt.exports;
}
var zs = Ls();
const dr = /* @__PURE__ */ Hs(zs);
var qs = /* @__PURE__ */ K('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Xs = /* @__PURE__ */ K('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><span> </span></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), Us = /* @__PURE__ */ K('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), Js = /* @__PURE__ */ K('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), $s = /* @__PURE__ */ K('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4"> </h2> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">前へ</button> <span class="svelte-13s7gu4"> </span> <button class="svelte-13s7gu4">次へ</button></div></div> <div><!></div></div>');
function Bs(e, t) {
  _t(t, !0);
  let r = /* @__PURE__ */ Y(de([])), n = /* @__PURE__ */ Y(0), a = /* @__PURE__ */ Y(0), s = 50, i = /* @__PURE__ */ Y(!0);
  async function o() {
    T(i, !0);
    try {
      const F = await (await fetch(`/admin/api/entries?limit=${s}&offset=${u(a)}`)).json();
      T(r, F.entries || [], !0), T(n, F.total || 0, !0);
    } catch (D) {
      console.error(D);
    } finally {
      T(i, !1);
    }
  }
  Lt(o);
  function l() {
    u(a) + s < u(n) && (T(a, u(a) + s), o());
  }
  function f() {
    u(a) - s >= 0 && (T(a, u(a) - s), o());
  }
  function v(D) {
    return D ? dr("%y/%m/%d %H:%M", new Date(D)) : "-";
  }
  var p = $s(), h = w(p), _ = w(h), N = w(_), g = x(_, 2), d = w(g);
  d.__click = f;
  var S = x(d, 2), H = w(S), P = x(S, 2);
  P.__click = l;
  var k = x(h, 2);
  let R;
  var q = w(k);
  {
    var L = (D) => {
      var F = qs();
      X(D, F);
    }, E = (D) => {
      var F = Js(), b = Nt(F), M = x(w(b));
      vr(M, 21, () => u(r), cr, (y, A) => {
        var Z = Xs(), le = w(Z), te = w(le), G = x(le), Ce = w(G), ve = x(G), U = w(ve), re = w(U), Ne = x(ve), Re = w(Ne), Pe = w(Re), He = x(Re, 2), _e = w(He), pe = w(_e), Ve = x(Ne), zt = w(Ve), wt = x(Ve), st = w(wt), at = x(wt), qt = w(at), it = x(at), Mt = w(it), Xt = x(it), Ut = w(Xt);
        Ut.__click = () => t.onEdit(u(A).id), De(
          (Jt, St, $t) => {
            z(te, u(A).id), z(Ce, u(A).date), We(U, 1, `status status-${u(A).status ?? ""}`, "svelte-13s7gu4"), z(re, u(A).status), z(Pe, u(A).title), _n(_e, "href", `/${u(A).path ?? ""}`), z(pe, `/${u(A).path ?? ""}`), z(zt, u(A).format), z(st, Jt), z(qt, St), z(Mt, $t);
          },
          [
            () => v(u(A).created_at),
            () => v(u(A).modified_at),
            () => u(A).publish_at?.Valid ? v(u(A).publish_at.Time) : "-"
          ]
        ), X(y, Z);
      });
      var m = x(b, 2);
      {
        var c = (y) => {
          var A = Us();
          X(y, A);
        };
        ye(m, (y) => {
          u(i) && y(c);
        });
      }
      X(D, F);
    };
    ye(q, (D) => {
      u(i) && u(r).length === 0 ? D(L) : D(E, !1);
    });
  }
  De(
    (D) => {
      z(N, `エントリ一覧 (${u(n) ?? ""})`), d.disabled = u(a) === 0 || u(i), z(H, `${u(a) + 1} - ${D ?? ""} / ${u(n) ?? ""}`), P.disabled = u(a) + s >= u(n) || u(i), R = We(k, 1, "table-container svelte-13s7gu4", null, R, { "is-loading": u(i) });
    },
    [() => Math.min(u(a) + s, u(n))]
  ), X(e, p), pt();
}
Ht(["click"]);
var Vs = /* @__PURE__ */ K('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), Ks = /* @__PURE__ */ K('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), Zs = /* @__PURE__ */ K('<button id="restore" type="button" class="submit-button svelte-7nstam">復元...</button>'), Ws = /* @__PURE__ */ K('<div class="tag-item svelte-7nstam"> </div>'), Gs = /* @__PURE__ */ K('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam">📷 写真</button></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons svelte-7nstam"><div class="options svelte-7nstam"><label class="svelte-7nstam"><input type="checkbox" class="svelte-7nstam"/> 公開を遅延</label></div> <button type="button" class="submit-button svelte-7nstam"> </button> <!></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog>', 1);
function Qs(e, t) {
  _t(t, !0);
  let r = xr(t, "sk", 3, ""), n = xr(t, "id", 3, null), a = /* @__PURE__ */ Y(de({ id: null, title: "", body: "", status: null })), s = de({ id: null, title: "", body: "", publishLater: !1 }), i = /* @__PURE__ */ Y(!1), o = /* @__PURE__ */ Y(!1), l = /* @__PURE__ */ Y(""), f = /* @__PURE__ */ Y(null), v = /* @__PURE__ */ Y(null), p = /* @__PURE__ */ Y(null), h = /* @__PURE__ */ Y(null), _ = /* @__PURE__ */ Y(null);
  async function N(m) {
    T(o, !0);
    try {
      const c = await fetch(`/admin/api/entry/${m}`);
      if (!c.ok) throw new Error("Failed to fetch entry");
      const y = await c.json();
      T(a, y, !0), s.id = y.id, s.title = y.title, s.body = y.body, s.publishLater = y.status === "scheduled", g();
    } catch (c) {
      console.error(c), alert("エントリの取得に失敗しました");
    } finally {
      T(o, !1);
    }
  }
  Lt(() => {
    n() ? N(n()) : (T(a, { id: null, title: "", body: "", status: "public" }, !0), s.id = null, s.title = "", s.body = "", s.publishLater = !1, g());
    const m = setInterval(d, 3e3);
    return () => clearInterval(m);
  });
  function g() {
    if (!u(a).id && u(a).id !== null) return;
    const m = `nogag-backup-${u(a).id || "new"}`, c = localStorage.getItem(m);
    if (c) {
      const y = JSON.parse(c);
      (u(a).title !== y.title || u(a).body !== y.body) && T(f, y, !0);
    }
  }
  function d() {
    if (u(a).title !== s.title || u(a).body !== s.body) {
      const m = `nogag-backup-${u(a).id || "new"}`, c = { title: s.title, body: s.body, time: Date.now() };
      localStorage.setItem(m, JSON.stringify(c)), T(f, null);
    }
  }
  async function S() {
    T(i, !0), T(l, "リクエスト中");
    const m = new FormData();
    if (m.set("id", s.id || ""), m.set("title", s.title), m.set("body", s.body), m.set("sk", r()), s.publishLater) {
      const c = u(a).publish_at_epoch || u(a).publish_at || Math.floor(Date.now() / 1e3) + 2592e3;
      m.set("publish_at", String(c)), m.set("status", "scheduled");
    } else
      m.set("status", "public");
    try {
      const A = (await (await fetch("/admin/api/edit", {
        method: "POST",
        headers: { "X-Requested-With": "fetch" },
        body: m
      })).json()).session_id;
      if (!A)
        throw new Error("保存に失敗しました");
      H(A);
    } catch (c) {
      T(i, !1), alert(c instanceof Error ? c.message : "エラーが発生しました");
    }
  }
  function H(m) {
    const c = new EventSource(`/admin/api/edit/progress?sid=${m}`);
    c.onmessage = (y) => {
      const A = JSON.parse(y.data);
      switch (A.type) {
        case "progress":
          T(l, P(A.message), !0);
          break;
        case "done":
          localStorage.removeItem(`nogag-backup-${u(a).id || "new"}`), T(l, "完了"), T(i, !1), c.close(), t.onSave(A.location);
          break;
        case "error":
          T(l, "エラー: " + A.message), T(i, !1), c.close(), alert("保存に失敗しました: " + A.message);
          break;
      }
    }, c.onerror = () => {
      T(i, !1), c.close(), alert("通信エラーが発生しました");
    };
  }
  function P(m) {
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
  function R() {
    u(f) && (s.title = u(f).title, s.body = u(f).body, u(_).close());
  }
  async function q() {
    const m = document.createElement("input");
    m.type = "file", m.oninput = async () => {
      if (!m.files?.[0]) return;
      const c = new FormData();
      c.append("file", m.files[0]), c.append("sk", r());
      try {
        const A = await (await fetch("/admin/api/upload/image", {
          method: "POST",
          headers: { "X-Requested-With": "fetch" },
          body: c
        })).json(), Z = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${A.uploaded}" class="picasa" itemprop="url"><img src="${A.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        L(Z, !0);
      } catch {
        alert("アップロードに失敗しました");
      }
    }, m.click();
  }
  function L(m, c = !1) {
    const y = u(p).selectionStart, A = u(p).selectionEnd, Z = u(p).value;
    s.body = Z.substring(0, y) + m + Z.substring(A), setTimeout(
      () => {
        typeof c == "boolean" && c ? (u(p).selectionStart = y, u(p).selectionEnd = y + m.length) : typeof c == "number" ? u(p).selectionStart = u(p).selectionEnd = y + c : u(p).selectionStart = u(p).selectionEnd = y + m.length, u(p).focus();
      },
      0
    );
  }
  function E(m) {
    (m.altKey ? "Alt-" : "") + (m.ctrlKey ? "Control-" : "") + (m.metaKey ? "Meta-" : "") + (m.shiftKey ? "Shift-" : "") + m.key === "Control-t" && (L("\\(  \\)", 3), m.preventDefault(), m.stopPropagation());
  }
  var D = hn(), F = Nt(D);
  {
    var b = (m) => {
      var c = Vs();
      X(m, c);
    }, M = (m) => {
      var c = Gs(), y = Nt(c), A = w(y), Z = w(A);
      Dt(Z, (C) => T(v, C), () => u(v));
      var le = x(Z, 2), te = w(le);
      te.__click = () => u(h).showModal();
      var G = x(te, 2);
      G.__click = q;
      var Ce = x(le, 2), ve = w(Ce);
      ve.__keydown = E, Dt(ve, (C) => T(p, C), () => u(p));
      var U = x(A, 2), re = w(U);
      {
        var Ne = (C) => {
          var me = Ks();
          X(C, me);
        };
        ye(re, (C) => {
          u(i) && C(Ne);
        });
      }
      var Re = x(re, 2), Pe = w(Re), He = w(Pe), _e = w(He), pe = x(Pe, 2);
      pe.__click = S;
      var Ve = w(pe), zt = x(pe, 2);
      {
        var wt = (C) => {
          var me = Zs();
          me.__click = () => u(_).showModal(), X(C, me);
        };
        ye(zt, (C) => {
          u(f) && C(wt);
        });
      }
      var st = x(y, 2), at = x(w(st), 2);
      vr(
        at,
        20,
        () => [
          "tech",
          "photo",
          "redeveloped",
          "stablediffusion",
          "photoshopped"
        ],
        cr,
        (C, me) => {
          var lt = Ws();
          lt.__click = () => k(me);
          var pn = w(lt);
          De(() => z(pn, me)), X(C, lt);
        }
      );
      var qt = x(at, 2);
      qt.__click = () => u(h).close(), Dt(st, (C) => T(h, C), () => u(h));
      var it = x(st, 2), Mt = x(w(it), 2), Xt = w(Mt);
      {
        var Ut = (C) => {
          var me = ks();
          De((lt) => z(me, lt), [
            () => dr("%Y年%m月%d日%H時", new Date(u(f).time))
          ]), X(C, me);
        };
        ye(Xt, (C) => {
          u(f) && C(Ut);
        });
      }
      var Jt = x(Mt, 2), St = w(Jt);
      St.__click = () => u(_).close();
      var $t = x(St, 2);
      $t.__click = R, Dt(it, (C) => T(_, C), () => u(_)), De(() => {
        pe.disabled = u(i), z(Ve, u(i) ? u(l) || "リクエスト中" : "更新");
      }), Dr(Z, () => s.title, (C) => s.title = C), Dr(ve, () => s.body, (C) => s.body = C), js(_e, () => s.publishLater, (C) => s.publishLater = C), X(m, c);
    };
    ye(F, (m) => {
      u(o) ? m(b) : m(M, !1);
    });
  }
  X(e, D), pt();
}
Ht(["click", "keydown"]);
var ea = /* @__PURE__ */ K('<div class="loading svelte-1r6codn"></div>'), ta = /* @__PURE__ */ K('<div class="error-text svelte-1r6codn"> </div>'), ra = /* @__PURE__ */ K('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><span> </span></td><td class="svelte-1r6codn"> </td><td class="time svelte-1r6codn"> </td><td class="error svelte-1r6codn"><!></td></tr>'), na = /* @__PURE__ */ K('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), sa = /* @__PURE__ */ K('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">前へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">次へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function aa(e, t) {
  _t(t, !0);
  let r = /* @__PURE__ */ Y(de([])), n = /* @__PURE__ */ Y(0), a = /* @__PURE__ */ Y(0), s = 50, i = /* @__PURE__ */ Y(!0);
  async function o() {
    T(i, !0);
    try {
      const D = await (await fetch(`/admin/api/jobs?limit=${s}&offset=${u(a)}`)).json();
      T(r, D.jobs || [], !0), T(n, D.total || 0, !0);
    } catch (E) {
      console.error(E);
    } finally {
      T(i, !1);
    }
  }
  Lt(o);
  function l() {
    u(a) + s < u(n) && (T(a, u(a) + s), o());
  }
  function f() {
    u(a) - s >= 0 && (T(a, u(a) - s), o());
  }
  function v(E) {
    return dr("%Y-%m-%d %H:%M:%S", new Date(E));
  }
  var p = sa(), h = w(p), _ = w(h), N = w(_), g = x(_, 2), d = w(g);
  d.__click = f;
  var S = x(d, 2), H = w(S), P = x(S, 2);
  P.__click = l;
  var k = x(P, 2);
  k.__click = o;
  var R = x(h, 2);
  {
    var q = (E) => {
      var D = ea();
      X(E, D);
    }, L = (E) => {
      var D = na(), F = x(w(D));
      vr(F, 21, () => u(r), cr, (b, M) => {
        var m = ra(), c = w(m), y = w(c), A = x(c), Z = w(A), le = w(Z), te = x(A), G = w(te), Ce = w(G), ve = x(te), U = w(ve), re = x(ve), Ne = w(re), Re = x(re), Pe = w(Re);
        {
          var He = (_e) => {
            var pe = ta(), Ve = w(pe);
            De(() => {
              _n(pe, "title", u(M).error_message.String), z(Ve, u(M).error_message.String);
            }), X(_e, pe);
          };
          ye(Pe, (_e) => {
            u(M).error_message?.Valid && _e(He);
          });
        }
        De(
          (_e) => {
            z(y, u(M).id), z(le, u(M).job_type_name), We(G, 1, `status status-${u(M).status ?? ""}`, "svelte-1r6codn"), z(Ce, u(M).status), z(U, u(M).retry_count), z(Ne, _e);
          },
          [() => v(u(M).created_at)]
        ), X(b, m);
      }), X(E, D);
    };
    ye(R, (E) => {
      u(i) ? E(q) : E(L, !1);
    });
  }
  De(
    (E) => {
      z(N, `ジョブ一覧 (${u(n) ?? ""})`), d.disabled = u(a) === 0 || u(i), z(H, `${u(a) + 1} - ${E ?? ""} / ${u(n) ?? ""}`), P.disabled = u(a) + s >= u(n) || u(i);
    },
    [() => Math.min(u(a) + s, u(n))]
  ), X(e, p), pt();
}
Ht(["click"]);
var ia = /* @__PURE__ */ K('<div class="admin-app svelte-1n46o8q"><nav class="sub-nav svelte-1n46o8q"><a href="/admin/">エントリ一覧</a> <a href="/admin/edit">新規作成</a> <a href="/admin/jobs">ジョブ一覧</a></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function la(e, t) {
  _t(t, !0);
  let r = /* @__PURE__ */ Y(de(window.location.pathname)), n = /* @__PURE__ */ Y(de(new URLSearchParams(window.location.search))), a = /* @__PURE__ */ Y("");
  Lt(() => {
    const k = document.querySelector('meta[name="csrf-token"]');
    k && T(a, k.content, !0);
    const R = () => {
      T(r, window.location.pathname, !0), T(n, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", R), () => window.removeEventListener("popstate", R);
  });
  function s(k, R) {
    R && R.preventDefault(), window.history.pushState({}, "", k), T(r, window.location.pathname, !0), T(n, new URLSearchParams(window.location.search), !0);
  }
  const i = /* @__PURE__ */ mr(() => u(r) === "/admin/edit" ? "edit" : u(r) === "/admin/jobs" ? "jobs" : "list"), o = /* @__PURE__ */ mr(() => u(n).get("id"));
  var l = ia(), f = w(l), v = w(f);
  v.__click = (k) => s("/admin/", k);
  let p;
  var h = x(v, 2);
  h.__click = (k) => s("/admin/edit", k);
  let _;
  var N = x(h, 2);
  N.__click = (k) => s("/admin/jobs", k);
  let g;
  var d = x(f, 2), S = w(d);
  {
    var H = (k) => {
      Qs(k, {
        get sk() {
          return u(a);
        },
        get id() {
          return u(o);
        },
        onSave: (R) => window.location.href = R
      });
    }, P = (k) => {
      var R = hn(), q = Nt(R);
      {
        var L = (D) => {
          aa(D, {
            get sk() {
              return u(a);
            }
          });
        }, E = (D) => {
          Bs(D, {
            get sk() {
              return u(a);
            },
            onEdit: (F) => s(`/admin/edit?id=${F}`)
          });
        };
        ye(
          q,
          (D) => {
            u(i) === "jobs" ? D(L) : D(E, !1);
          },
          !0
        );
      }
      X(k, R);
    };
    ye(S, (k) => {
      u(i) === "edit" ? k(H) : k(P, !1);
    });
  }
  De(() => {
    p = We(v, 1, "svelte-1n46o8q", null, p, { active: u(i) === "list" }), _ = We(h, 1, "svelte-1n46o8q", null, _, { active: u(i) === "edit" && !u(o) }), g = We(N, 1, "svelte-1n46o8q", null, g, { active: u(i) === "jobs" });
  }), X(e, l), pt();
}
Ht(["click"]);
const Zt = document.getElementById("admin-root");
Zt && (Zt.innerHTML = "", Es(la, { target: Zt }));
//# sourceMappingURL=admin-front.js.map
