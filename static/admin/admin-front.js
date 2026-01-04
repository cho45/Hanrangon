var or = Array.isArray, Dn = Array.prototype.indexOf, Ct = Array.from, Tn = Object.defineProperty, ft = Object.getOwnPropertyDescriptor, xn = Object.getOwnPropertyDescriptors, An = Object.prototype, Fn = Array.prototype, Hr = Object.getPrototypeOf, wr = Object.isExtensible;
function Nn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function jr() {
  var e, t, r = new Promise((s, a) => {
    e = s, t = a;
  });
  return { promise: r, resolve: e, reject: t };
}
const B = 2, ur = 4, fr = 8, Rn = 1 << 24, Ae = 16, Fe = 32, Ke = 64, Lt = 128, me = 512, K = 1024, ae = 2048, we = 4096, se = 8192, Ye = 16384, cr = 32768, nt = 65536, Mr = 1 << 17, Cr = 1 << 18, lt = 1 << 19, In = 1 << 20, De = 1 << 25, $e = 32768, nr = 1 << 21, vr = 1 << 22, He = 1 << 23, tt = /* @__PURE__ */ Symbol("$state"), Pn = /* @__PURE__ */ Symbol(""), Qe = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function On(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Yn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Hn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function jn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Cn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Ln() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function zn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function qn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Xn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Un() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Jn = 1, $n = 2, Lr = 4, Bn = 8, Vn = 16, Kn = 1, Zn = 2, V = /* @__PURE__ */ Symbol(), Wn = "http://www.w3.org/1999/xhtml";
function Gn() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Qn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function zr(e) {
  return e === this.v;
}
function es(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function qr(e) {
  return !es(e, this.v);
}
let ie = null;
function st(e) {
  ie = e;
}
function gt(e, t = !1, r) {
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
function bt(e) {
  var t = (
    /** @type {ComponentContext} */
    ie
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var s of r)
      sn(s);
  }
  return t.i = !0, ie = t.p, /** @type {T} */
  {};
}
function Xr() {
  return !0;
}
let qe = [];
function Ur() {
  var e = qe;
  qe = [], Nn(e);
}
function yt(e) {
  if (qe.length === 0 && !vt) {
    var t = qe;
    queueMicrotask(() => {
      t === qe && Ur();
    });
  }
  qe.push(e);
}
function ts() {
  for (; qe.length > 0; )
    Ur();
}
function Jr(e) {
  var t = j;
  if (t === null)
    return O.f |= He, e;
  if ((t.f & cr) === 0) {
    if ((t.f & Lt) === 0)
      throw e;
    t.b.error(e);
  } else
    at(e, t);
}
function at(e, t) {
  for (; t !== null; ) {
    if ((t.f & Lt) !== 0)
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
const xt = /* @__PURE__ */ new Set();
let Y = null, ct = null, de = null, ce = [], zt = null, sr = !1, vt = !1;
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
    ce = [], ct = null, this.apply();
    var r = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const s of t)
      this.#i(s, r);
    this.is_fork || this.#f(), this.is_deferred() ? (this.#l(r.effects), this.#l(r.render_effects)) : (ct = this, Y = null, Sr(r.render_effects), Sr(r.effects), ct = null, this.#o?.resolve()), de = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {EffectTarget} target
   */
  #i(t, r) {
    t.f ^= K;
    for (var s = t.first; s !== null; ) {
      var a = s.f, n = (a & (Fe | Ke)) !== 0, i = n && (a & K) !== 0, o = i || (a & se) !== 0 || this.skipped_effects.has(s);
      if ((s.f & Lt) !== 0 && s.b?.is_pending() && (r = {
        parent: r,
        effect: s,
        effects: [],
        render_effects: []
      }), !o && s.fn !== null) {
        n ? s.f ^= K : (a & ur) !== 0 ? r.effects.push(s) : Mt(s) && ((s.f & Ae) !== 0 && this.#a.add(s), mt(s));
        var l = s.first;
        if (l !== null) {
          s = l;
          continue;
        }
      }
      var u = s.parent;
      for (s = s.next; s === null && u !== null; )
        u === r.effect && (this.#l(r.effects), this.#l(r.render_effects), r = /** @type {EffectTarget} */
        r.parent), s = u.next, u = u.parent;
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #l(t) {
    for (const r of t)
      (r.f & ae) !== 0 ? this.#a.add(r) : (r.f & we) !== 0 && this.#s.add(r), this.#u(r.deps), Z(r, K);
  }
  /**
   * @param {Value[] | null} deps
   */
  #u(t) {
    if (t !== null)
      for (const r of t)
        (r.f & B) === 0 || (r.f & $e) === 0 || (r.f ^= $e, this.#u(
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
    this.previous.has(t) || this.previous.set(t, r), (t.f & He) === 0 && (this.current.set(t, t.v), de?.set(t, t.v));
  }
  activate() {
    Y = this, this.apply();
  }
  deactivate() {
    Y === this && (Y = null, de = null);
  }
  flush() {
    if (this.activate(), ce.length > 0) {
      if ($r(), Y !== null && Y !== this)
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
    if (xt.size > 1) {
      this.previous.clear();
      var t = de, r = !0, s = {
        parent: null,
        effect: null,
        effects: [],
        render_effects: []
      };
      for (const n of xt) {
        if (n === this) {
          r = !1;
          continue;
        }
        const i = [];
        for (const [l, u] of this.current) {
          if (n.current.has(l))
            if (r && u !== n.current.get(l))
              n.current.set(l, u);
            else
              continue;
          i.push(l);
        }
        if (i.length === 0)
          continue;
        const o = [...n.current.keys()].filter((l) => !this.current.has(l));
        if (o.length > 0) {
          var a = ce;
          ce = [];
          const l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
          for (const v of i)
            Br(v, o, l, u);
          if (ce.length > 0) {
            Y = n, n.apply();
            for (const v of ce)
              n.#i(v, s);
            n.deactivate();
          }
          ce = a;
        }
      }
      Y = null, de = t;
    }
    this.committed = !0, xt.delete(this);
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
      this.#s.delete(t), Z(t, ae), Be(t);
    for (const t of this.#s)
      Z(t, we), Be(t);
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
    return (this.#o ??= jr()).promise;
  }
  static ensure() {
    if (Y === null) {
      const t = Y = new ge();
      xt.add(Y), vt || ge.enqueue(() => {
        Y === t && t.flush();
      });
    }
    return Y;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    yt(t);
  }
  apply() {
  }
}
function rs(e) {
  var t = vt;
  vt = !0;
  try {
    for (var r; ; ) {
      if (ts(), ce.length === 0 && (Y?.flush(), ce.length === 0))
        return zt = null, /** @type {T} */
        r;
      $r();
    }
  } finally {
    vt = t;
  }
}
function $r() {
  var e = Ue;
  sr = !0;
  var t = null;
  try {
    var r = 0;
    for (Pt(!0); ce.length > 0; ) {
      var s = ge.ensure();
      if (r++ > 1e3) {
        var a, n;
        ns();
      }
      s.process(ce), je.clear();
    }
  } finally {
    sr = !1, Pt(e), zt = null;
  }
}
function ns() {
  try {
    Ln();
  } catch (e) {
    at(e, zt);
  }
}
let Ee = null;
function Sr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var s = e[r++];
      if ((s.f & (Ye | se)) === 0 && Mt(s) && (Ee = /* @__PURE__ */ new Set(), mt(s), s.deps === null && s.first === null && s.nodes === null && (s.teardown === null && s.ac === null ? un(s) : s.fn = null), Ee?.size > 0)) {
        je.clear();
        for (const a of Ee) {
          if ((a.f & (Ye | se)) !== 0) continue;
          const n = [a];
          let i = a.parent;
          for (; i !== null; )
            Ee.has(i) && (Ee.delete(i), n.push(i)), i = i.parent;
          for (let o = n.length - 1; o >= 0; o--) {
            const l = n[o];
            (l.f & (Ye | se)) === 0 && mt(l);
          }
        }
        Ee.clear();
      }
    }
    Ee = null;
  }
}
function Br(e, t, r, s) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const n = a.f;
      (n & B) !== 0 ? Br(
        /** @type {Derived} */
        a,
        t,
        r,
        s
      ) : (n & (vr | Ae)) !== 0 && (n & ae) === 0 && Vr(a, t, s) && (Z(a, ae), Be(
        /** @type {Effect} */
        a
      ));
    }
}
function Vr(e, t, r) {
  const s = r.get(e);
  if (s !== void 0) return s;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (t.includes(a))
        return !0;
      if ((a.f & B) !== 0 && Vr(
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
function Be(e) {
  for (var t = zt = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (sr && t === j && (r & Ae) !== 0 && (r & Cr) === 0)
      return;
    if ((r & (Ke | Fe)) !== 0) {
      if ((r & K) === 0) return;
      t.f ^= K;
    }
  }
  ce.push(t);
}
function ss(e) {
  let t = 0, r = Ve(0), s;
  return () => {
    _t() && (f(r), qt(() => (t === 0 && (s = St(() => e(() => dt(r)))), t += 1, () => {
      yt(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, dt(r));
      });
    })));
  };
}
var as = nt | lt | Lt;
function is(e, t, r) {
  new ls(e, t, r);
}
class ls {
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
  #b = ss(() => (this.#d = Ve(this.#c), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, s) {
    this.#t = t, this.#r = r, this.#o = s, this.parent = /** @type {Effect} */
    j.b, this.#e = !!this.#r.pending, this.#a = mr(() => {
      j.b = this;
      {
        var a = this.#m();
        try {
          this.#s = ve(() => s(a));
        } catch (n) {
          this.error(n);
        }
        this.#v > 0 ? this.#p() : this.#e = !1;
      }
      return () => {
        this.#f?.remove();
      };
    }, as);
  }
  #y() {
    try {
      this.#s = ve(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
    this.#e = !1;
  }
  #w() {
    const t = this.#r.pending;
    t && (this.#i = ve(() => t(this.#t)), ge.enqueue(() => {
      var r = this.#m();
      this.#s = this.#_(() => (ge.ensure(), ve(() => this.#o(r)))), this.#v > 0 ? this.#p() : (Xe(
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
    return this.#e && (this.#f = Te(), this.#t.before(this.#f), t = this.#f), t;
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
    var r = j, s = O, a = ie;
    Me(this.#a), ee(this.#a), st(this.#a.ctx);
    try {
      return t();
    } catch (n) {
      return Jr(n), null;
    } finally {
      Me(r), ee(s), st(a);
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
    ), vn(this.#s, this.#u)), this.#i === null && (this.#i = ve(() => t(this.#t)));
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
    this.#v += t, this.#v === 0 && (this.#e = !1, this.#i && Xe(this.#i, () => {
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
    this.#g(t), this.#c += t, this.#d && it(this.#d, this.#c);
  }
  get_effect_pending() {
    return this.#b(), f(
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
    this.#s && (te(this.#s), this.#s = null), this.#i && (te(this.#i), this.#i = null), this.#l && (te(this.#l), this.#l = null);
    var a = !1, n = !1;
    const i = () => {
      if (a) {
        Qn();
        return;
      }
      a = !0, n && Un(), ge.ensure(), this.#c = 0, this.#l !== null && Xe(this.#l, () => {
        this.#l = null;
      }), this.#e = this.has_pending_snippet(), this.#s = this.#_(() => (this.#h = !1, ve(() => this.#o(this.#t)))), this.#v > 0 ? this.#p() : this.#e = !1;
    };
    var o = O;
    try {
      ee(null), n = !0, r?.(t, i), n = !1;
    } catch (l) {
      at(l, this.#a && this.#a.parent);
    } finally {
      ee(o);
    }
    s && yt(() => {
      this.#l = this.#_(() => {
        ge.ensure(), this.#h = !0;
        try {
          return ve(() => {
            s(
              this.#t,
              () => t,
              () => i
            );
          });
        } catch (l) {
          return at(
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
function os(e, t, r, s) {
  const a = dr;
  if (r.length === 0 && e.length === 0) {
    s(t.map(a));
    return;
  }
  var n = Y, i = (
    /** @type {Effect} */
    j
  ), o = us();
  function l() {
    Promise.all(r.map((u) => /* @__PURE__ */ fs(u))).then((u) => {
      o();
      try {
        s([...t.map(a), ...u]);
      } catch (v) {
        (i.f & Ye) === 0 && at(v, i);
      }
      n?.deactivate(), Nt();
    }).catch((u) => {
      at(u, i);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    o();
    try {
      return l();
    } finally {
      n?.deactivate(), Nt();
    }
  }) : l();
}
function us() {
  var e = j, t = O, r = ie, s = Y;
  return function(n = !0) {
    Me(e), ee(t), st(r), n && s?.activate();
  };
}
function Nt() {
  Me(null), ee(null), st(null);
}
// @__NO_SIDE_EFFECTS__
function dr(e) {
  var t = B | ae, r = O !== null && (O.f & B) !== 0 ? (
    /** @type {Derived} */
    O
  ) : null;
  return j !== null && (j.f |= lt), {
    ctx: ie,
    deps: null,
    effects: null,
    equals: zr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      V
    ),
    wv: 0,
    parent: r ?? j,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function fs(e, t) {
  let r = (
    /** @type {Effect | null} */
    j
  );
  r === null && Yn();
  var s = (
    /** @type {Boundary} */
    r.b
  ), a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), n = Ve(
    /** @type {V} */
    V
  ), i = !O, o = /* @__PURE__ */ new Map();
  return Ss(() => {
    var l = jr();
    a = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).then(() => {
        u === Y && u.committed && u.deactivate(), Nt();
      });
    } catch (h) {
      l.reject(h), Nt();
    }
    var u = (
      /** @type {Batch} */
      Y
    );
    if (i) {
      var v = !s.is_pending();
      s.update_pending_count(1), u.increment(v), o.get(u)?.reject(Qe), o.delete(u), o.set(u, l);
    }
    const p = (h, _ = void 0) => {
      if (u.activate(), _)
        _ !== Qe && (n.f |= He, it(n, _));
      else {
        (n.f & He) !== 0 && (n.f ^= He), it(n, h);
        for (const [N, g] of o) {
          if (o.delete(N), N === u) break;
          g.reject(Qe);
        }
      }
      i && (s.update_pending_count(-1), u.decrement(v));
    };
    l.promise.then(p, (h) => p(null, h || "unknown"));
  }), nn(() => {
    for (const l of o.values())
      l.reject(Qe);
  }), new Promise((l) => {
    function u(v) {
      function p() {
        v === a ? l(n) : u(a);
      }
      v.then(p, p);
    }
    u(a);
  });
}
// @__NO_SIDE_EFFECTS__
function kr(e) {
  const t = /* @__PURE__ */ dr(e);
  return dn(t), t;
}
// @__NO_SIDE_EFFECTS__
function cs(e) {
  const t = /* @__PURE__ */ dr(e);
  return t.equals = qr, t;
}
function Kr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      te(
        /** @type {Effect} */
        t[r]
      );
  }
}
function vs(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & B) === 0)
      return (t.f & Ye) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function hr(e) {
  var t, r = j;
  Me(vs(e));
  try {
    e.f &= ~$e, Kr(e), t = mn(e);
  } finally {
    Me(r);
  }
  return t;
}
function Zr(e) {
  var t = hr(e);
  if (e.equals(t) || (Y?.is_fork || (e.v = t), e.wv = _n()), !ot)
    if (de !== null)
      (_t() || Y?.is_fork) && de.set(e, t);
    else {
      var r = (e.f & me) === 0 ? we : K;
      Z(e, r);
    }
}
let ar = /* @__PURE__ */ new Set();
const je = /* @__PURE__ */ new Map();
let Wr = !1;
function Ve(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: zr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function H(e, t) {
  const r = Ve(e);
  return dn(r), r;
}
// @__NO_SIDE_EFFECTS__
function ds(e, t = !1, r = !0) {
  const s = Ve(e);
  return t || (s.equals = qr), s;
}
function x(e, t, r = !1) {
  O !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!ye || (O.f & Mr) !== 0) && Xr() && (O.f & (B | Ae | vr | Mr)) !== 0 && !xe?.includes(e) && Xn();
  let s = r ? pe(t) : t;
  return it(e, s);
}
function it(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    ot ? je.set(e, t) : je.set(e, r), e.v = t;
    var s = ge.ensure();
    s.capture(e, r), (e.f & B) !== 0 && ((e.f & ae) !== 0 && hr(
      /** @type {Derived} */
      e
    ), Z(e, (e.f & me) !== 0 ? K : we)), e.wv = _n(), Gr(e, ae), j !== null && (j.f & K) !== 0 && (j.f & (Fe | Ke)) === 0 && (fe === null ? Ds([e]) : fe.push(e)), !s.is_fork && ar.size > 0 && !Wr && hs();
  }
  return t;
}
function hs() {
  Wr = !1;
  var e = Ue;
  Pt(!0);
  const t = Array.from(ar);
  try {
    for (const r of t)
      (r.f & K) !== 0 && Z(r, we), Mt(r) && mt(r);
  } finally {
    Pt(e);
  }
  ar.clear();
}
function dt(e) {
  x(e, e.v + 1);
}
function Gr(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, a = 0; a < s; a++) {
      var n = r[a], i = n.f, o = (i & ae) === 0;
      if (o && Z(n, t), (i & B) !== 0) {
        var l = (
          /** @type {Derived} */
          n
        );
        de?.delete(l), (i & $e) === 0 && (i & me && (n.f |= $e), Gr(l, we));
      } else o && ((i & Ae) !== 0 && Ee !== null && Ee.add(
        /** @type {Effect} */
        n
      ), Be(
        /** @type {Effect} */
        n
      ));
    }
}
function pe(e) {
  if (typeof e != "object" || e === null || tt in e)
    return e;
  const t = Hr(e);
  if (t !== An && t !== Fn)
    return e;
  var r = /* @__PURE__ */ new Map(), s = or(e), a = /* @__PURE__ */ H(0), n = Je, i = (o) => {
    if (Je === n)
      return o();
    var l = O, u = Je;
    ee(null), Ar(n);
    var v = o();
    return ee(l), Ar(u), v;
  };
  return s && r.set("length", /* @__PURE__ */ H(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(o, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && zn();
        var v = r.get(l);
        return v === void 0 ? v = i(() => {
          var p = /* @__PURE__ */ H(u.value);
          return r.set(l, p), p;
        }) : x(v, u.value, !0), !0;
      },
      deleteProperty(o, l) {
        var u = r.get(l);
        if (u === void 0) {
          if (l in o) {
            const v = i(() => /* @__PURE__ */ H(V));
            r.set(l, v), dt(a);
          }
        } else
          x(u, V), dt(a);
        return !0;
      },
      get(o, l, u) {
        if (l === tt)
          return e;
        var v = r.get(l), p = l in o;
        if (v === void 0 && (!p || ft(o, l)?.writable) && (v = i(() => {
          var _ = pe(p ? o[l] : V), N = /* @__PURE__ */ H(_);
          return N;
        }), r.set(l, v)), v !== void 0) {
          var h = f(v);
          return h === V ? void 0 : h;
        }
        return Reflect.get(o, l, u);
      },
      getOwnPropertyDescriptor(o, l) {
        var u = Reflect.getOwnPropertyDescriptor(o, l);
        if (u && "value" in u) {
          var v = r.get(l);
          v && (u.value = f(v));
        } else if (u === void 0) {
          var p = r.get(l), h = p?.v;
          if (p !== void 0 && h !== V)
            return {
              enumerable: !0,
              configurable: !0,
              value: h,
              writable: !0
            };
        }
        return u;
      },
      has(o, l) {
        if (l === tt)
          return !0;
        var u = r.get(l), v = u !== void 0 && u.v !== V || Reflect.has(o, l);
        if (u !== void 0 || j !== null && (!v || ft(o, l)?.writable)) {
          u === void 0 && (u = i(() => {
            var h = v ? pe(o[l]) : V, _ = /* @__PURE__ */ H(h);
            return _;
          }), r.set(l, u));
          var p = f(u);
          if (p === V)
            return !1;
        }
        return v;
      },
      set(o, l, u, v) {
        var p = r.get(l), h = l in o;
        if (s && l === "length")
          for (var _ = u; _ < /** @type {Source<number>} */
          p.v; _ += 1) {
            var N = r.get(_ + "");
            N !== void 0 ? x(N, V) : _ in o && (N = i(() => /* @__PURE__ */ H(V)), r.set(_ + "", N));
          }
        if (p === void 0)
          (!h || ft(o, l)?.writable) && (p = i(() => /* @__PURE__ */ H(void 0)), x(p, pe(u)), r.set(l, p));
        else {
          h = p.v !== V;
          var g = i(() => pe(u));
          x(p, g);
        }
        var d = Reflect.getOwnPropertyDescriptor(o, l);
        if (d?.set && d.set.call(v, u), !h) {
          if (s && typeof l == "string") {
            var S = (
              /** @type {Source<number>} */
              r.get("length")
            ), C = Number(l);
            Number.isInteger(C) && C >= S.v && x(S, C + 1);
          }
          dt(a);
        }
        return !0;
      },
      ownKeys(o) {
        f(a);
        var l = Reflect.ownKeys(o).filter((p) => {
          var h = r.get(p);
          return h === void 0 || h.v !== V;
        });
        for (var [u, v] of r)
          v.v !== V && !(u in o) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        qn();
      }
    }
  );
}
function Er(e) {
  try {
    if (e !== null && typeof e == "object" && tt in e)
      return e[tt];
  } catch {
  }
  return e;
}
function _s(e, t) {
  return Object.is(Er(e), Er(t));
}
var Dr, Qr, en, tn;
function ps() {
  if (Dr === void 0) {
    Dr = window, Qr = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    en = ft(t, "firstChild").get, tn = ft(t, "nextSibling").get, wr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), wr(r) && (r.__t = void 0);
  }
}
function Te(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Rt(e) {
  return (
    /** @type {TemplateNode | null} */
    en.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function wt(e) {
  return (
    /** @type {TemplateNode | null} */
    tn.call(e)
  );
}
function w(e, t) {
  return /* @__PURE__ */ Rt(e);
}
function It(e, t = !1) {
  {
    var r = /* @__PURE__ */ Rt(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ wt(r) : r;
  }
}
function E(e, t = 1, r = !1) {
  let s = e;
  for (; t--; )
    s = /** @type {TemplateNode} */
    /* @__PURE__ */ wt(s);
  return s;
}
function ms(e) {
  e.textContent = "";
}
function rn() {
  return !1;
}
let Tr = !1;
function gs() {
  Tr || (Tr = !0, document.addEventListener(
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
  var t = O, r = j;
  ee(null), Me(null);
  try {
    return e();
  } finally {
    ee(t), Me(r);
  }
}
function pr(e, t, r, s = r) {
  e.addEventListener(t, () => _r(r));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), s(!0);
  } : e.__on_r = () => s(!0), gs();
}
function bs(e) {
  j === null && (O === null && Cn(), jn()), ot && Hn();
}
function ys(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function Ne(e, t, r) {
  var s = j;
  s !== null && (s.f & se) !== 0 && (e |= se);
  var a = {
    ctx: ie,
    deps: null,
    nodes: null,
    f: e | ae | me,
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
      mt(a), a.f |= cr;
    } catch (o) {
      throw te(a), o;
    }
  else t !== null && Be(a);
  var n = a;
  if (r && n.deps === null && n.teardown === null && n.nodes === null && n.first === n.last && // either `null`, or a singular child
  (n.f & lt) === 0 && (n = n.first, (e & Ae) !== 0 && (e & nt) !== 0 && n !== null && (n.f |= nt)), n !== null && (n.parent = s, s !== null && ys(n, s), O !== null && (O.f & B) !== 0 && (e & Ke) === 0)) {
    var i = (
      /** @type {Derived} */
      O
    );
    (i.effects ??= []).push(n);
  }
  return a;
}
function _t() {
  return O !== null && !ye;
}
function nn(e) {
  const t = Ne(fr, null, !1);
  return Z(t, K), t.teardown = e, t;
}
function ws(e) {
  bs();
  var t = (
    /** @type {Effect} */
    j.f
  ), r = !O && (t & Fe) !== 0 && (t & cr) === 0;
  if (r) {
    var s = (
      /** @type {ComponentContext} */
      ie
    );
    (s.e ??= []).push(e);
  } else
    return sn(e);
}
function sn(e) {
  return Ne(ur | In, e, !1);
}
function Ms(e) {
  ge.ensure();
  const t = Ne(Ke | lt, e, !0);
  return (r = {}) => new Promise((s) => {
    r.outro ? Xe(t, () => {
      te(t), s(void 0);
    }) : (te(t), s(void 0));
  });
}
function an(e) {
  return Ne(ur, e, !1);
}
function Ss(e) {
  return Ne(vr | lt, e, !0);
}
function qt(e, t = 0) {
  return Ne(fr | t, e, !0);
}
function be(e, t = [], r = [], s = []) {
  os(s, t, r, (a) => {
    Ne(fr, () => e(...a.map(f)), !0);
  });
}
function mr(e, t = 0) {
  var r = Ne(Ae | t, e, !0);
  return r;
}
function ve(e) {
  return Ne(Fe | lt, e, !0);
}
function ln(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = ot, s = O;
    xr(!0), ee(null);
    try {
      t.call(null);
    } finally {
      xr(r), ee(s);
    }
  }
}
function on(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const a = r.ac;
    a !== null && _r(() => {
      a.abort(Qe);
    });
    var s = r.next;
    (r.f & Ke) !== 0 ? r.parent = null : te(r, t), r = s;
  }
}
function ks(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & Fe) === 0 && te(t), t = r;
  }
}
function te(e, t = !0) {
  var r = !1;
  (t || (e.f & Cr) !== 0) && e.nodes !== null && e.nodes.end !== null && (Es(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), on(e, t && !r), Ot(e, 0), Z(e, Ye);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const n of s)
      n.stop();
  ln(e);
  var a = e.parent;
  a !== null && a.first !== null && un(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Es(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ wt(e);
    e.remove(), e = r;
  }
}
function un(e) {
  var t = e.parent, r = e.prev, s = e.next;
  r !== null && (r.next = s), s !== null && (s.prev = r), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = r));
}
function Xe(e, t, r = !0) {
  var s = [];
  fn(e, s, !0);
  var a = () => {
    r && te(e), t && t();
  }, n = s.length;
  if (n > 0) {
    var i = () => --n || a();
    for (var o of s)
      o.out(i);
  } else
    a();
}
function fn(e, t, r) {
  if ((e.f & se) === 0) {
    e.f ^= se;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const o of s)
        (o.is_global || r) && t.push(o);
    for (var a = e.first; a !== null; ) {
      var n = a.next, i = (a.f & nt) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (a.f & Fe) !== 0 && (e.f & Ae) !== 0;
      fn(a, t, i ? r : !1), a = n;
    }
  }
}
function gr(e) {
  cn(e, !0);
}
function cn(e, t) {
  if ((e.f & se) !== 0) {
    e.f ^= se, (e.f & K) === 0 && (Z(e, ae), Be(e));
    for (var r = e.first; r !== null; ) {
      var s = r.next, a = (r.f & nt) !== 0 || (r.f & Fe) !== 0;
      cn(r, a ? t : !1), r = s;
    }
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const i of n)
        (i.is_global || t) && i.in();
  }
}
function vn(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end; r !== null; ) {
      var a = r === s ? null : /* @__PURE__ */ wt(r);
      t.append(r), r = a;
    }
}
let Ue = !1;
function Pt(e) {
  Ue = e;
}
let ot = !1;
function xr(e) {
  ot = e;
}
let O = null, ye = !1;
function ee(e) {
  O = e;
}
let j = null;
function Me(e) {
  j = e;
}
let xe = null;
function dn(e) {
  O !== null && (xe === null ? xe = [e] : xe.push(e));
}
let Q = null, ne = 0, fe = null;
function Ds(e) {
  fe = e;
}
let hn = 1, pt = 0, Je = pt;
function Ar(e) {
  Je = e;
}
function _n() {
  return ++hn;
}
function Mt(e) {
  var t = e.f;
  if ((t & ae) !== 0)
    return !0;
  if (t & B && (e.f &= ~$e), (t & we) !== 0) {
    var r = e.deps;
    if (r !== null)
      for (var s = r.length, a = 0; a < s; a++) {
        var n = r[a];
        if (Mt(
          /** @type {Derived} */
          n
        ) && Zr(
          /** @type {Derived} */
          n
        ), n.wv > e.wv)
          return !0;
      }
    (t & me) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    de === null && Z(e, K);
  }
  return !1;
}
function pn(e, t, r = !0) {
  var s = e.reactions;
  if (s !== null && !xe?.includes(e))
    for (var a = 0; a < s.length; a++) {
      var n = s[a];
      (n.f & B) !== 0 ? pn(
        /** @type {Derived} */
        n,
        t,
        !1
      ) : t === n && (r ? Z(n, ae) : (n.f & K) !== 0 && Z(n, we), Be(
        /** @type {Effect} */
        n
      ));
    }
}
function mn(e) {
  var t = Q, r = ne, s = fe, a = O, n = xe, i = ie, o = ye, l = Je, u = e.f;
  Q = /** @type {null | Value[]} */
  null, ne = 0, fe = null, O = (u & (Fe | Ke)) === 0 ? e : null, xe = null, st(e.ctx), ye = !1, Je = ++pt, e.ac !== null && (_r(() => {
    e.ac.abort(Qe);
  }), e.ac = null);
  try {
    e.f |= nr;
    var v = (
      /** @type {Function} */
      e.fn
    ), p = v(), h = e.deps;
    if (Q !== null) {
      var _;
      if (Ot(e, ne), h !== null && ne > 0)
        for (h.length = ne + Q.length, _ = 0; _ < Q.length; _++)
          h[ne + _] = Q[_];
      else
        e.deps = h = Q;
      if (_t() && (e.f & me) !== 0)
        for (_ = ne; _ < h.length; _++)
          (h[_].reactions ??= []).push(e);
    } else h !== null && ne < h.length && (Ot(e, ne), h.length = ne);
    if (Xr() && fe !== null && !ye && h !== null && (e.f & (B | we | ae)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      fe.length; _++)
        pn(
          fe[_],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (pt++, fe !== null && (s === null ? s = fe : s.push(.../** @type {Source[]} */
    fe))), (e.f & He) !== 0 && (e.f ^= He), p;
  } catch (N) {
    return Jr(N);
  } finally {
    e.f ^= nr, Q = t, ne = r, fe = s, O = a, xe = n, st(i), ye = o, Je = l;
  }
}
function Ts(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var s = Dn.call(r, e);
    if (s !== -1) {
      var a = r.length - 1;
      a === 0 ? r = t.reactions = null : (r[s] = r[a], r.pop());
    }
  }
  r === null && (t.f & B) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (Q === null || !Q.includes(t)) && (Z(t, we), (t.f & me) !== 0 && (t.f ^= me, t.f &= ~$e), Kr(
    /** @type {Derived} **/
    t
  ), Ot(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Ot(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var s = t; s < r.length; s++)
      Ts(e, r[s]);
}
function mt(e) {
  var t = e.f;
  if ((t & Ye) === 0) {
    Z(e, K);
    var r = j, s = Ue;
    j = e, Ue = !0;
    try {
      (t & (Ae | Rn)) !== 0 ? ks(e) : on(e), ln(e);
      var a = mn(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = hn;
      var n;
    } finally {
      Ue = s, j = r;
    }
  }
}
async function xs() {
  await Promise.resolve(), rs();
}
function f(e) {
  var t = e.f, r = (t & B) !== 0;
  if (O !== null && !ye) {
    var s = j !== null && (j.f & Ye) !== 0;
    if (!s && !xe?.includes(e)) {
      var a = O.deps;
      if ((O.f & nr) !== 0)
        e.rv < pt && (e.rv = pt, Q === null && a !== null && a[ne] === e ? ne++ : Q === null ? Q = [e] : Q.includes(e) || Q.push(e));
      else {
        (O.deps ??= []).push(e);
        var n = e.reactions;
        n === null ? e.reactions = [O] : n.includes(O) || n.push(O);
      }
    }
  }
  if (ot) {
    if (je.has(e))
      return je.get(e);
    if (r) {
      var i = (
        /** @type {Derived} */
        e
      ), o = i.v;
      return ((i.f & K) === 0 && i.reactions !== null || bn(i)) && (o = hr(i)), je.set(i, o), o;
    }
  } else r && (!de?.has(e) || Y?.is_fork && !_t()) && (i = /** @type {Derived} */
  e, Mt(i) && Zr(i), Ue && _t() && (i.f & me) === 0 && gn(i));
  if (de?.has(e))
    return de.get(e);
  if ((e.f & He) !== 0)
    throw e.v;
  return e.v;
}
function gn(e) {
  if (e.deps !== null) {
    e.f ^= me;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & B) !== 0 && (t.f & me) === 0 && gn(
        /** @type {Derived} */
        t
      );
  }
}
function bn(e) {
  if (e.v === V) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (je.has(t) || (t.f & B) !== 0 && bn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function St(e) {
  var t = ye;
  try {
    return ye = !0, e();
  } finally {
    ye = t;
  }
}
const As = -7169;
function Z(e, t) {
  e.f = e.f & As | t;
}
const Fs = ["touchstart", "touchmove"];
function Ns(e) {
  return Fs.includes(e);
}
const yn = /* @__PURE__ */ new Set(), ir = /* @__PURE__ */ new Set();
function Xt(e) {
  for (var t = 0; t < e.length; t++)
    yn.add(e[t]);
  for (var r of ir)
    r(e);
}
let Fr = null;
function At(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], n = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Fr = e;
  var i = 0, o = Fr === e && e.__root;
  if (o) {
    var l = a.indexOf(o);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var u = a.indexOf(t);
    if (u === -1)
      return;
    l <= u && (i = l);
  }
  if (n = /** @type {Element} */
  a[i] || e.target, n !== t) {
    Tn(e, "currentTarget", {
      configurable: !0,
      get() {
        return n || r;
      }
    });
    var v = O, p = j;
    ee(null), Me(null);
    try {
      for (var h, _ = []; n !== null; ) {
        var N = n.assignedSlot || n.parentNode || /** @type {any} */
        n.host || null;
        try {
          var g = n["__" + s];
          g != null && (!/** @type {any} */
          n.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === n) && g.call(n, e);
        } catch (d) {
          h ? _.push(d) : h = d;
        }
        if (e.cancelBubble || N === t || N === null)
          break;
        n = N;
      }
      if (h) {
        for (let d of _)
          queueMicrotask(() => {
            throw d;
          });
        throw h;
      }
    } finally {
      e.__root = t, delete e.currentTarget, ee(v), Me(p);
    }
  }
}
function Rs(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Yt(e, t) {
  var r = (
    /** @type {Effect} */
    j
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function J(e, t) {
  var r = (t & Kn) !== 0, s = (t & Zn) !== 0, a, n = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = Rs(n ? e : "<!>" + e), r || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ Rt(a)));
    var i = (
      /** @type {TemplateNode} */
      s || Qr ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Rt(i)
      ), l = (
        /** @type {TemplateNode} */
        i.lastChild
      );
      Yt(o, l);
    } else
      Yt(i, i);
    return i;
  };
}
function Is(e = "") {
  {
    var t = Te(e + "");
    return Yt(t, t), t;
  }
}
function wn() {
  var e = document.createDocumentFragment(), t = document.createComment(""), r = Te();
  return e.append(t, r), Yt(t, r), e;
}
function q(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function L(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ??= e.nodeValue) && (e.__t = r, e.nodeValue = r + "");
}
function Ps(e, t) {
  return Os(e, t);
}
const Ge = /* @__PURE__ */ new Map();
function Os(e, { target: t, anchor: r, props: s = {}, events: a, context: n, intro: i = !0 }) {
  ps();
  var o = /* @__PURE__ */ new Set(), l = (p) => {
    for (var h = 0; h < p.length; h++) {
      var _ = p[h];
      if (!o.has(_)) {
        o.add(_);
        var N = Ns(_);
        t.addEventListener(_, At, { passive: N });
        var g = Ge.get(_);
        g === void 0 ? (document.addEventListener(_, At, { passive: N }), Ge.set(_, 1)) : Ge.set(_, g + 1);
      }
    }
  };
  l(Ct(yn)), ir.add(l);
  var u = void 0, v = Ms(() => {
    var p = r ?? t.appendChild(Te());
    return is(
      /** @type {TemplateNode} */
      p,
      {
        pending: () => {
        }
      },
      (h) => {
        if (n) {
          gt({});
          var _ = (
            /** @type {ComponentContext} */
            ie
          );
          _.c = n;
        }
        a && (s.$$events = a), u = e(h, s) || {}, n && bt();
      }
    ), () => {
      for (var h of o) {
        t.removeEventListener(h, At);
        var _ = (
          /** @type {number} */
          Ge.get(h)
        );
        --_ === 0 ? (document.removeEventListener(h, At), Ge.delete(h)) : Ge.set(h, _);
      }
      ir.delete(l), p !== r && p.parentNode?.removeChild(p);
    };
  });
  return Ys.set(u, v), u;
}
let Ys = /* @__PURE__ */ new WeakMap();
class Hs {
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
        gr(s), this.#r.delete(r);
      else {
        var a = this.#n.get(r);
        a && (this.#t.set(r, a.effect), this.#n.delete(r), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
      }
      for (const [n, i] of this.#e) {
        if (this.#e.delete(n), n === t)
          break;
        const o = this.#n.get(i);
        o && (te(o.effect), this.#n.delete(i));
      }
      for (const [n, i] of this.#t) {
        if (n === r || this.#r.has(n)) continue;
        const o = () => {
          if (Array.from(this.#e.values()).includes(n)) {
            var u = document.createDocumentFragment();
            vn(i, u), u.append(Te()), this.#n.set(n, { effect: i, fragment: u });
          } else
            te(i);
          this.#r.delete(n), this.#t.delete(n);
        };
        this.#o || !s ? (this.#r.add(n), Xe(i, o, !1)) : o();
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
      r.includes(s) || (te(a.effect), this.#n.delete(s));
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
    ), a = rn();
    if (r && !this.#t.has(t) && !this.#n.has(t))
      if (a) {
        var n = document.createDocumentFragment(), i = Te();
        n.append(i), this.#n.set(t, {
          effect: ve(() => r(i)),
          fragment: n
        });
      } else
        this.#t.set(
          t,
          ve(() => r(this.anchor))
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
function _e(e, t, r = !1) {
  var s = new Hs(e), a = r ? nt : 0;
  function n(i, o) {
    s.ensure(i, o);
  }
  mr(() => {
    var i = !1;
    t((o, l = !0) => {
      i = !0, n(l, o);
    }), i || n(!1, null);
  }, a);
}
function Ht(e, t) {
  return t;
}
function js(e, t, r) {
  for (var s = [], a = t.length, n, i = t.length, o = 0; o < a; o++) {
    let p = t[o];
    Xe(
      p,
      () => {
        if (n) {
          if (n.pending.delete(p), n.done.add(p), n.pending.size === 0) {
            var h = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            lr(Ct(n.done)), h.delete(n), h.size === 0 && (e.outrogroups = null);
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
      var u = (
        /** @type {Element} */
        r
      ), v = (
        /** @type {Element} */
        u.parentNode
      );
      ms(v), v.append(u), e.items.clear();
    }
    lr(t, !l);
  } else
    n = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(n);
}
function lr(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    te(e[r], t);
}
var Nr;
function jt(e, t, r, s, a, n = null) {
  var i = e, o = /* @__PURE__ */ new Map(), l = (t & Lr) !== 0;
  if (l) {
    var u = (
      /** @type {Element} */
      e
    );
    i = u.appendChild(Te());
  }
  var v = null, p = /* @__PURE__ */ cs(() => {
    var S = r();
    return or(S) ? S : S == null ? [] : Ct(S);
  }), h, _ = !0;
  function N() {
    d.fallback = v, Cs(d, h, i, t, s), v !== null && (h.length === 0 ? (v.f & De) === 0 ? gr(v) : (v.f ^= De, ut(v, null, i)) : Xe(v, () => {
      v = null;
    }));
  }
  var g = mr(() => {
    h = /** @type {V[]} */
    f(p);
    for (var S = h.length, C = /* @__PURE__ */ new Set(), P = (
      /** @type {Batch} */
      Y
    ), k = rn(), R = 0; R < S; R += 1) {
      var X = h[R], z = s(X, R), D = _ ? null : o.get(z);
      D ? (D.v && it(D.v, X), D.i && it(D.i, R), k && P.skipped_effects.delete(D.e)) : (D = Ls(
        o,
        _ ? i : Nr ??= Te(),
        X,
        z,
        R,
        a,
        t,
        r
      ), _ || (D.e.f |= De), o.set(z, D)), C.add(z);
    }
    if (S === 0 && n && !v && (_ ? v = ve(() => n(i)) : (v = ve(() => n(Nr ??= Te())), v.f |= De)), !_)
      if (k) {
        for (const [T, F] of o)
          C.has(T) || P.skipped_effects.add(F.e);
        P.oncommit(N), P.ondiscard(() => {
        });
      } else
        N();
    f(p);
  }), d = { effect: g, items: o, outrogroups: null, fallback: v };
  _ = !1;
}
function Cs(e, t, r, s, a) {
  var n = (s & Bn) !== 0, i = t.length, o = e.items, l = e.effect.first, u, v = null, p, h = [], _ = [], N, g, d, S;
  if (n)
    for (S = 0; S < i; S += 1)
      N = t[S], g = a(N, S), d = /** @type {EachItem} */
      o.get(g).e, (d.f & De) === 0 && (d.nodes?.a?.measure(), (p ??= /* @__PURE__ */ new Set()).add(d));
  for (S = 0; S < i; S += 1) {
    if (N = t[S], g = a(N, S), d = /** @type {EachItem} */
    o.get(g).e, e.outrogroups !== null)
      for (const F of e.outrogroups)
        F.pending.delete(d), F.done.delete(d);
    if ((d.f & De) !== 0)
      if (d.f ^= De, d === l)
        ut(d, null, r);
      else {
        var C = v ? v.next : l;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), Oe(e, v, d), Oe(e, d, C), ut(d, C, r), v = d, h = [], _ = [], l = v.next;
        continue;
      }
    if ((d.f & se) !== 0 && (gr(d), n && (d.nodes?.a?.unfix(), (p ??= /* @__PURE__ */ new Set()).delete(d))), d !== l) {
      if (u !== void 0 && u.has(d)) {
        if (h.length < _.length) {
          var P = _[0], k;
          v = P.prev;
          var R = h[0], X = h[h.length - 1];
          for (k = 0; k < h.length; k += 1)
            ut(h[k], P, r);
          for (k = 0; k < _.length; k += 1)
            u.delete(_[k]);
          Oe(e, R.prev, X.next), Oe(e, v, R), Oe(e, X, P), l = P, v = X, S -= 1, h = [], _ = [];
        } else
          u.delete(d), ut(d, l, r), Oe(e, d.prev, d.next), Oe(e, d, v === null ? e.effect.first : v.next), Oe(e, v, d), v = d;
        continue;
      }
      for (h = [], _ = []; l !== null && l !== d; )
        (u ??= /* @__PURE__ */ new Set()).add(l), _.push(l), l = l.next;
      if (l === null)
        continue;
    }
    (d.f & De) === 0 && h.push(d), v = d, l = d.next;
  }
  if (e.outrogroups !== null) {
    for (const F of e.outrogroups)
      F.pending.size === 0 && (lr(Ct(F.done)), e.outrogroups?.delete(F));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || u !== void 0) {
    var z = [];
    if (u !== void 0)
      for (d of u)
        (d.f & se) === 0 && z.push(d);
    for (; l !== null; )
      (l.f & se) === 0 && l !== e.fallback && z.push(l), l = l.next;
    var D = z.length;
    if (D > 0) {
      var T = (s & Lr) !== 0 && i === 0 ? r : null;
      if (n) {
        for (S = 0; S < D; S += 1)
          z[S].nodes?.a?.measure();
        for (S = 0; S < D; S += 1)
          z[S].nodes?.a?.fix();
      }
      js(e, z, T);
    }
  }
  n && yt(() => {
    if (p !== void 0)
      for (d of p)
        d.nodes?.a?.apply();
  });
}
function Ls(e, t, r, s, a, n, i, o) {
  var l = (i & Jn) !== 0 ? (i & Vn) === 0 ? /* @__PURE__ */ ds(r, !1, !1) : Ve(r) : null, u = (i & $n) !== 0 ? Ve(a) : null;
  return {
    v: l,
    i: u,
    e: ve(() => (n(t, l ?? r, u ?? a, o), () => {
      e.delete(s);
    }))
  };
}
function ut(e, t, r) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, n = t && (t.f & De) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; s !== null; ) {
      var i = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ wt(s)
      );
      if (n.before(s), s === a)
        return;
      s = i;
    }
}
function Oe(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
const Rr = [...` 	
\r\f \v\uFEFF`];
function zs(e, t, r) {
  var s = e == null ? "" : "" + e;
  if (t && (s = s ? s + " " + t : t), r) {
    for (var a in r)
      if (r[a])
        s = s ? s + " " + a : a;
      else if (s.length)
        for (var n = a.length, i = 0; (i = s.indexOf(a, i)) >= 0; ) {
          var o = i + n;
          (i === 0 || Rr.includes(s[i - 1])) && (o === s.length || Rr.includes(s[o])) ? s = (i === 0 ? "" : s.substring(0, i)) + s.substring(o + 1) : i = o;
        }
  }
  return s === "" ? null : s;
}
function rt(e, t, r, s, a, n) {
  var i = e.__className;
  if (i !== r || i === void 0) {
    var o = zs(r, s, n);
    o == null ? e.removeAttribute("class") : e.className = o, e.__className = r;
  } else if (n && a !== n)
    for (var l in n) {
      var u = !!n[l];
      (a == null || u !== !!a[l]) && e.classList.toggle(l, u);
    }
  return n;
}
function Mn(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!or(t))
      return Gn();
    for (var s of e.options)
      s.selected = t.includes(ht(s));
    return;
  }
  for (s of e.options) {
    var a = ht(s);
    if (_s(a, t)) {
      s.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function qs(e) {
  var t = new MutationObserver(() => {
    Mn(e, e.__value);
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
  }), nn(() => {
    t.disconnect();
  });
}
function Xs(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet(), a = !0;
  pr(e, "change", (n) => {
    var i = n ? "[selected]" : ":checked", o;
    if (e.multiple)
      o = [].map.call(e.querySelectorAll(i), ht);
    else {
      var l = e.querySelector(i) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      o = l && ht(l);
    }
    r(o), Y !== null && s.add(Y);
  }), an(() => {
    var n = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        ct ?? Y
      );
      if (s.has(i))
        return;
    }
    if (Mn(e, n, a), a && n === void 0) {
      var o = e.querySelector(":checked");
      o !== null && (n = ht(o), r(n));
    }
    e.__value = n, a = !1;
  }), qs(e);
}
function ht(e) {
  return "__value" in e ? e.__value : e.value;
}
const Us = /* @__PURE__ */ Symbol("is custom element"), Js = /* @__PURE__ */ Symbol("is html");
function Sn(e, t, r, s) {
  var a = $s(e);
  a[t] !== (a[t] = r) && (t === "loading" && (e[Pn] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Bs(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function $s(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [Us]: e.nodeName.includes("-"),
      [Js]: e.namespaceURI === Wn
    }
  );
}
var Ir = /* @__PURE__ */ new Map();
function Bs(e) {
  var t = e.getAttribute("is") || e.nodeName, r = Ir.get(t);
  if (r) return r;
  Ir.set(t, r = []);
  for (var s, a = e, n = Element.prototype; n !== a; ) {
    s = xn(a);
    for (var i in s)
      s[i].set && r.push(i);
    a = Hr(a);
  }
  return r;
}
function Gt(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet();
  pr(e, "input", async (a) => {
    var n = a ? e.defaultValue : e.value;
    if (n = Qt(e) ? er(n) : n, r(n), Y !== null && s.add(Y), await xs(), n !== (n = t())) {
      var i = e.selectionStart, o = e.selectionEnd, l = e.value.length;
      if (e.value = n ?? "", o !== null) {
        var u = e.value.length;
        i === o && o === l && u > l ? (e.selectionStart = u, e.selectionEnd = u) : (e.selectionStart = i, e.selectionEnd = Math.min(o, u));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  St(t) == null && e.value && (r(Qt(e) ? er(e.value) : e.value), Y !== null && s.add(Y)), qt(() => {
    var a = t();
    if (e === document.activeElement) {
      var n = (
        /** @type {Batch} */
        ct ?? Y
      );
      if (s.has(n))
        return;
    }
    Qt(e) && a === er(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
function Vs(e, t, r = t) {
  pr(e, "change", (s) => {
    var a = s ? e.defaultChecked : e.checked;
    r(a);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  // If defaultChecked is set, then checked == defaultChecked
  St(t) == null && r(e.checked), qt(() => {
    var s = t();
    e.checked = !!s;
  });
}
function Qt(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function er(e) {
  return e === "" ? null : +e;
}
function Pr(e, t) {
  return e === t || e?.[tt] === t;
}
function Ft(e = {}, t, r, s) {
  return an(() => {
    var a, n;
    return qt(() => {
      a = n, n = [], St(() => {
        e !== r(...n) && (t(e, ...n), a && Pr(r(...a), e) && t(null, ...a));
      });
    }), () => {
      yt(() => {
        n && Pr(r(...n), e) && t(null, ...n);
      });
    };
  }), e;
}
function Or(e, t, r, s) {
  var a = (
    /** @type {V} */
    s
  ), n = !0, i = () => (n && (n = !1, a = /** @type {V} */
  s), a), o;
  o = /** @type {V} */
  e[t], o === void 0 && s !== void 0 && (o = i());
  var l;
  return l = () => {
    var u = (
      /** @type {V} */
      e[t]
    );
    return u === void 0 ? i() : (n = !0, u);
  }, l;
}
function Ut(e) {
  ie === null && On(), ws(() => {
    const t = St(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Ks = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Ks);
function Zs(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var tr = { exports: {} }, Yr;
function Ws() {
  return Yr || (Yr = 1, (function(e) {
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
      function a(g, d, S) {
        var C = g || r, P = d || 0, k = S || !1, R = 0, X;
        function z(F, b) {
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
            m > R ? (R = m, X = new Date(R), M = R, k && (X = new Date(R + v(X) + P))) : M = R, b = X;
          }
          return D(F, b, C, M);
        }
        function D(F, b, M, m) {
          for (var c = "", y = null, A = !1, W = F.length, le = !1, re = 0; re < W; re++) {
            var G = F.charCodeAt(re);
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
                  c += n(Math.floor(b.getFullYear() / 100), y);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  c += D(M.formats.D, b, M, m);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  c += D(M.formats.F, b, M, m);
                  break;
                // '00'
                // case 'H':
                case 72:
                  c += n(b.getHours(), y);
                  break;
                // '12'
                // case 'I':
                case 73:
                  c += n(o(b.getHours()), y);
                  break;
                // '000'
                // case 'L':
                case 76:
                  c += i(Math.floor(m % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  c += n(b.getMinutes(), y);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  c += b.getHours() < 12 ? M.am : M.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  c += D(M.formats.R, b, M, m);
                  break;
                // '00'
                // case 'S':
                case 83:
                  c += n(b.getSeconds(), y);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  c += D(M.formats.T, b, M, m);
                  break;
                // '00'
                // case 'U':
                case 85:
                  c += n(l(b, "sunday"), y);
                  break;
                // '00'
                // case 'W':
                case 87:
                  c += n(l(b, "monday"), y);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  c += D(M.formats.X, b, M, m);
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
                    var Re = p(b);
                    c += Re || "";
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
                  c += D(M.formats.c, b, M, m);
                  break;
                // '01'
                // case 'd':
                case 100:
                  c += n(b.getDate(), y);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  c += n(b.getDate(), y ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  c += M.shortMonths[b.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var Se = new Date(b.getFullYear(), 0, 1), U = Math.ceil((b.getTime() - Se.getTime()) / (1e3 * 60 * 60 * 24));
                  c += i(U);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  c += n(b.getHours(), y ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  c += n(o(b.getHours()), y ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  c += n(b.getMonth() + 1, y);
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
                  M.ordinalSuffixes ? c += String(U) + (M.ordinalSuffixes[U - 1] || u(U)) : c += String(U) + u(U);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  c += b.getHours() < 12 ? M.AM : M.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  c += D(M.formats.r, b, M, m);
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
                  c += D(M.formats.v, b, M, m);
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
                  c += D(M.formats.x, b, M, m);
                  break;
                // '70'
                // case 'y':
                case 121:
                  c += n(b.getFullYear() % 100, y);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (k && P === 0)
                    c += le ? "+00:00" : "+0000";
                  else {
                    var oe;
                    P !== 0 ? oe = P / (60 * 1e3) : oe = -b.getTimezoneOffset();
                    var ke = oe < 0 ? "-" : "+", Ie = le ? ":" : "", Ce = Math.floor(Math.abs(oe / 60)), Pe = Math.abs(oe % 60);
                    c += ke + n(Ce) + Ie + n(Pe);
                  }
                  break;
                default:
                  A && (c += "%"), c += F[re];
                  break;
              }
              y = null, A = !1;
              continue;
            }
            if (G === 37) {
              A = !0;
              continue;
            }
            c += F[re];
          }
          return c;
        }
        var T = z;
        return T.localize = function(F) {
          return new a(F || C, P, k);
        }, T.localizeByIdentifier = function(F) {
          var b = t[F];
          return b ? T.localize(b) : (N('[WARNING] No locale found with identifier "' + F + '".'), T);
        }, T.timezone = function(F) {
          var b = P, M = k, m = typeof F;
          if (m === "number" || m === "string")
            if (M = !0, m === "string") {
              var c = F[0] === "-" ? -1 : 1, y = parseInt(F.slice(1, 3), 10), A = parseInt(F.slice(3, 5), 10);
              b = c * (60 * y + A) * 60 * 1e3;
            } else m === "number" && (b = F * 60 * 1e3);
          return new a(C, b, M);
        }, T.utc = function() {
          return new a(C, P, !0);
        }, T;
      }
      function n(g, d) {
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
        var C = Date.UTC(g.getFullYear(), 0, 1), P = Date.UTC(g.getFullYear(), g.getMonth(), g.getDate()), k = Math.floor((P - C) / 864e5), R = (k + 7 - S) / 7;
        return Math.floor(R);
      }
      function u(g) {
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
  })(tr)), tr.exports;
}
var Gs = Ws();
const et = /* @__PURE__ */ Zs(Gs);
var Qs = /* @__PURE__ */ J('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), ea = /* @__PURE__ */ J('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><span> </span></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), ta = /* @__PURE__ */ J('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), ra = /* @__PURE__ */ J('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), na = /* @__PURE__ */ J('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4"> </h2> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">前へ</button> <span class="svelte-13s7gu4"> </span> <button class="svelte-13s7gu4">次へ</button></div></div> <div><!></div></div>');
function sa(e, t) {
  gt(t, !0);
  let r = /* @__PURE__ */ H(pe([])), s = /* @__PURE__ */ H(0), a = /* @__PURE__ */ H(0), n = 50, i = /* @__PURE__ */ H(!0);
  async function o() {
    x(i, !0);
    try {
      const F = await (await fetch(`/admin/api/entries?limit=${n}&offset=${f(a)}`)).json();
      x(r, F.entries || [], !0), x(s, F.total || 0, !0);
    } catch (T) {
      console.error(T);
    } finally {
      x(i, !1);
    }
  }
  Ut(o);
  function l() {
    f(a) + n < f(s) && (x(a, f(a) + n), o());
  }
  function u() {
    f(a) - n >= 0 && (x(a, f(a) - n), o());
  }
  function v(T) {
    return T ? et("%y/%m/%d %H:%M", new Date(T)) : "-";
  }
  var p = na(), h = w(p), _ = w(h), N = w(_), g = E(_, 2), d = w(g);
  d.__click = u;
  var S = E(d, 2), C = w(S), P = E(S, 2);
  P.__click = l;
  var k = E(h, 2);
  let R;
  var X = w(k);
  {
    var z = (T) => {
      var F = Qs();
      q(T, F);
    }, D = (T) => {
      var F = ra(), b = It(F), M = E(w(b));
      jt(M, 21, () => f(r), Ht, (y, A) => {
        var W = ea(), le = w(W), re = w(le), G = E(le), Re = w(G), Se = E(G), U = w(Se), oe = w(U), ke = E(Se), Ie = w(ke), Ce = w(Ie), Pe = E(Ie, 2), he = w(Pe), Le = w(he), Ze = E(ke), Jt = w(Ze), ze = E(Ze), $t = w(ze), kt = E(ze), Bt = w(kt), We = E(kt), Et = w(We), Vt = E(We), Dt = w(Vt);
        Dt.__click = () => t.onEdit(f(A).id), be(
          (Tt, Kt, Zt) => {
            L(re, f(A).id), L(Re, f(A).date), rt(U, 1, `status status-${f(A).status ?? ""}`, "svelte-13s7gu4"), L(oe, f(A).status), L(Ce, f(A).title), Sn(he, "href", `/${f(A).path ?? ""}`), L(Le, `/${f(A).path ?? ""}`), L(Jt, f(A).format), L($t, Tt), L(Bt, Kt), L(Et, Zt);
          },
          [
            () => v(f(A).created_at),
            () => v(f(A).modified_at),
            () => f(A).publish_at?.Valid ? v(f(A).publish_at.Time) : "-"
          ]
        ), q(y, W);
      });
      var m = E(b, 2);
      {
        var c = (y) => {
          var A = ta();
          q(y, A);
        };
        _e(m, (y) => {
          f(i) && y(c);
        });
      }
      q(T, F);
    };
    _e(X, (T) => {
      f(i) && f(r).length === 0 ? T(z) : T(D, !1);
    });
  }
  be(
    (T) => {
      L(N, `エントリ一覧 (${f(s) ?? ""})`), d.disabled = f(a) === 0 || f(i), L(C, `${f(a) + 1} - ${T ?? ""} / ${f(s) ?? ""}`), P.disabled = f(a) + n >= f(s) || f(i), R = rt(k, 1, "table-container svelte-13s7gu4", null, R, { "is-loading": f(i) });
    },
    [() => Math.min(f(a) + n, f(s))]
  ), q(e, p), bt();
}
Xt(["click"]);
var aa = /* @__PURE__ */ J('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), ia = /* @__PURE__ */ J('<option class="svelte-7nstam"> </option>'), la = /* @__PURE__ */ J('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), oa = /* @__PURE__ */ J('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), ua = /* @__PURE__ */ J('<button id="restore" type="button" class="submit-button svelte-7nstam">復元...</button>'), fa = /* @__PURE__ */ J('<div class="tag-item svelte-7nstam"> </div>'), ca = /* @__PURE__ */ J('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam">📷 写真</button> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons svelte-7nstam"><div class="options svelte-7nstam"><label title="チェックを入れると指定した日時に公開されます（公開済みの記事も予約に戻せます）" class="svelte-7nstam"><input type="checkbox" class="svelte-7nstam"/> 公開を遅延</label> <!></div> <button type="button" class="submit-button svelte-7nstam"> </button> <!></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog>', 1);
function va(e, t) {
  gt(t, !0);
  let r = Or(t, "sk", 3, ""), s = Or(t, "id", 3, null), a = /* @__PURE__ */ H(pe({ id: null, title: "", body: "", status: null })), n = pe({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: "public",
    publishLater: !1,
    publishAt: ""
  }), i = /* @__PURE__ */ H(!1), o = /* @__PURE__ */ H(!1), l = /* @__PURE__ */ H(""), u = /* @__PURE__ */ H(null), v = /* @__PURE__ */ H(null), p = /* @__PURE__ */ H(null), h = /* @__PURE__ */ H(null), _ = /* @__PURE__ */ H(null);
  async function N(m) {
    x(o, !0);
    try {
      const c = await fetch(`/admin/api/entry/${m}`);
      if (!c.ok) throw new Error("Failed to fetch entry");
      const y = await c.json();
      x(a, y, !0), n.id = y.id, n.title = y.title, n.body = y.body, n.format = y.format || "Hatena", n.status = y.status, n.publishLater = y.status === "scheduled", y.publish_at?.Valid ? n.publishAt = et("%Y-%m-%dT%H:%M", new Date(y.publish_at.Time)) : n.publishAt = et("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), g();
    } catch (c) {
      console.error(c), alert("エントリの取得に失敗しました");
    } finally {
      x(o, !1);
    }
  }
  Ut(() => {
    s() ? N(s()) : (x(a, { id: null, title: "", body: "", status: "public" }, !0), n.id = null, n.title = "", n.body = "", n.format = "Hatena", n.status = "public", n.publishLater = !1, n.publishAt = et("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), g());
    const m = setInterval(d, 3e3);
    return () => clearInterval(m);
  });
  function g() {
    if (!f(a).id && f(a).id !== null) return;
    const m = `nogag-backup-${f(a).id || "new"}`, c = localStorage.getItem(m);
    if (c) {
      const y = JSON.parse(c);
      (f(a).title !== y.title || f(a).body !== y.body) && x(u, y, !0);
    }
  }
  function d() {
    if (f(a).title !== n.title || f(a).body !== n.body) {
      const m = `nogag-backup-${f(a).id || "new"}`, c = { title: n.title, body: n.body, time: Date.now() };
      localStorage.setItem(m, JSON.stringify(c)), x(u, null);
    }
  }
  async function S() {
    x(i, !0), x(l, "リクエスト中");
    const m = new FormData();
    if (m.set("id", n.id ? String(n.id) : ""), m.set("title", n.title), m.set("body", n.body), m.set("format", n.format), m.set("sk", r()), n.publishLater) {
      const c = new Date(n.publishAt);
      m.set("publish_at", c.toISOString()), m.set("status", "scheduled");
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
      C(A);
    } catch (c) {
      x(i, !1), alert(c instanceof Error ? c.message : "エラーが発生しました");
    }
  }
  function C(m) {
    const c = new EventSource(`/admin/api/edit/progress?sid=${m}`);
    c.onmessage = (y) => {
      const A = JSON.parse(y.data);
      switch (A.type) {
        case "progress":
          x(l, P(A.message), !0);
          break;
        case "done":
          localStorage.removeItem(`nogag-backup-${f(a).id || "new"}`), x(l, "完了"), x(i, !1), c.close(), t.onSave(A.location);
          break;
        case "error":
          x(l, "エラー: " + A.message), x(i, !1), c.close(), alert("保存に失敗しました: " + A.message);
          break;
      }
    }, c.onerror = () => {
      x(i, !1), c.close(), alert("通信エラーが発生しました");
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
    n.title = `[${m}]${n.title}`, f(h).close(), f(v).focus();
  }
  function R() {
    f(u) && (n.title = f(u).title, n.body = f(u).body, f(_).close());
  }
  async function X() {
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
        })).json(), W = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${A.uploaded}" class="picasa" itemprop="url"><img src="${A.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        z(W, !0);
      } catch {
        alert("アップロードに失敗しました");
      }
    }, m.click();
  }
  function z(m, c = !1) {
    const y = f(p).selectionStart, A = f(p).selectionEnd, W = f(p).value;
    n.body = W.substring(0, y) + m + W.substring(A), setTimeout(
      () => {
        typeof c == "boolean" && c ? (f(p).selectionStart = y, f(p).selectionEnd = y + m.length) : typeof c == "number" ? f(p).selectionStart = f(p).selectionEnd = y + c : f(p).selectionStart = f(p).selectionEnd = y + m.length, f(p).focus();
      },
      0
    );
  }
  function D(m) {
    (m.altKey ? "Alt-" : "") + (m.ctrlKey ? "Control-" : "") + (m.metaKey ? "Meta-" : "") + (m.shiftKey ? "Shift-" : "") + m.key === "Control-t" && (z("\\(  \\)", 3), m.preventDefault(), m.stopPropagation());
  }
  var T = wn(), F = It(T);
  {
    var b = (m) => {
      var c = aa();
      q(m, c);
    }, M = (m) => {
      var c = ca(), y = It(c), A = w(y), W = w(A);
      Ft(W, (I) => x(v, I), () => f(v));
      var le = E(W, 2), re = w(le);
      re.__click = () => f(h).showModal();
      var G = E(re, 2);
      G.__click = X;
      var Re = E(G, 2);
      jt(Re, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], Ht, (I, $) => {
        var ue = ia(), Wt = w(ue), yr = {};
        be(() => {
          L(Wt, $), yr !== (yr = $) && (ue.value = (ue.__value = $) ?? "");
        }), q(I, ue);
      });
      var Se = E(le, 2), U = w(Se);
      U.__keydown = D, Ft(U, (I) => x(p, I), () => f(p));
      var oe = E(A, 2), ke = w(oe);
      {
        var Ie = (I) => {
          var $ = la();
          q(I, $);
        };
        _e(ke, (I) => {
          f(i) && I(Ie);
        });
      }
      var Ce = E(ke, 2), Pe = w(Ce), he = w(Pe), Le = w(he), Ze = E(he, 2);
      {
        var Jt = (I) => {
          var $ = oa();
          Gt($, () => n.publishAt, (ue) => n.publishAt = ue), q(I, $);
        };
        _e(Ze, (I) => {
          n.publishLater && I(Jt);
        });
      }
      var ze = E(Pe, 2);
      ze.__click = S;
      var $t = w(ze), kt = E(ze, 2);
      {
        var Bt = (I) => {
          var $ = ua();
          $.__click = () => f(_).showModal(), q(I, $);
        };
        _e(kt, (I) => {
          f(u) && I(Bt);
        });
      }
      var We = E(y, 2), Et = E(w(We), 2);
      jt(
        Et,
        20,
        () => [
          "tech",
          "photo",
          "redeveloped",
          "stablediffusion",
          "photoshopped"
        ],
        Ht,
        (I, $) => {
          var ue = fa();
          ue.__click = () => k($);
          var Wt = w(ue);
          be(() => L(Wt, $)), q(I, ue);
        }
      );
      var Vt = E(Et, 2);
      Vt.__click = () => f(h).close(), Ft(We, (I) => x(h, I), () => f(h));
      var Dt = E(We, 2), Tt = E(w(Dt), 2), Kt = w(Tt);
      {
        var Zt = (I) => {
          var $ = Is();
          be((ue) => L($, ue), [
            () => et("%Y年%m月%d日%H時", new Date(f(u).time))
          ]), q(I, $);
        };
        _e(Kt, (I) => {
          f(u) && I(Zt);
        });
      }
      var kn = E(Tt, 2), br = w(kn);
      br.__click = () => f(_).close();
      var En = E(br, 2);
      En.__click = R, Ft(Dt, (I) => x(_, I), () => f(_)), be(() => {
        ze.disabled = f(i), L($t, f(i) ? f(l) || "リクエスト中" : "更新");
      }), Gt(W, () => n.title, (I) => n.title = I), Xs(Re, () => n.format, (I) => n.format = I), Gt(U, () => n.body, (I) => n.body = I), Vs(Le, () => n.publishLater, (I) => n.publishLater = I), q(m, c);
    };
    _e(F, (m) => {
      f(o) ? m(b) : m(M, !1);
    });
  }
  q(e, T), bt();
}
Xt(["click", "keydown"]);
var da = /* @__PURE__ */ J('<div class="loading svelte-1r6codn"></div>'), ha = /* @__PURE__ */ J('<div class="error-text svelte-1r6codn"> </div>'), _a = /* @__PURE__ */ J('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><span> </span></td><td class="svelte-1r6codn"> </td><td class="time svelte-1r6codn"> </td><td class="error svelte-1r6codn"><!></td></tr>'), pa = /* @__PURE__ */ J('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), ma = /* @__PURE__ */ J('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">前へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">次へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function ga(e, t) {
  gt(t, !0);
  let r = /* @__PURE__ */ H(pe([])), s = /* @__PURE__ */ H(0), a = /* @__PURE__ */ H(0), n = 50, i = /* @__PURE__ */ H(!0);
  async function o() {
    x(i, !0);
    try {
      const T = await (await fetch(`/admin/api/jobs?limit=${n}&offset=${f(a)}`)).json();
      x(r, T.jobs || [], !0), x(s, T.total || 0, !0);
    } catch (D) {
      console.error(D);
    } finally {
      x(i, !1);
    }
  }
  Ut(o);
  function l() {
    f(a) + n < f(s) && (x(a, f(a) + n), o());
  }
  function u() {
    f(a) - n >= 0 && (x(a, f(a) - n), o());
  }
  function v(D) {
    return et("%Y-%m-%d %H:%M:%S", new Date(D));
  }
  var p = ma(), h = w(p), _ = w(h), N = w(_), g = E(_, 2), d = w(g);
  d.__click = u;
  var S = E(d, 2), C = w(S), P = E(S, 2);
  P.__click = l;
  var k = E(P, 2);
  k.__click = o;
  var R = E(h, 2);
  {
    var X = (D) => {
      var T = da();
      q(D, T);
    }, z = (D) => {
      var T = pa(), F = E(w(T));
      jt(F, 21, () => f(r), Ht, (b, M) => {
        var m = _a(), c = w(m), y = w(c), A = E(c), W = w(A), le = w(W), re = E(A), G = w(re), Re = w(G), Se = E(re), U = w(Se), oe = E(Se), ke = w(oe), Ie = E(oe), Ce = w(Ie);
        {
          var Pe = (he) => {
            var Le = ha(), Ze = w(Le);
            be(() => {
              Sn(Le, "title", f(M).error_message.String), L(Ze, f(M).error_message.String);
            }), q(he, Le);
          };
          _e(Ce, (he) => {
            f(M).error_message?.Valid && he(Pe);
          });
        }
        be(
          (he) => {
            L(y, f(M).id), L(le, f(M).job_type_name), rt(G, 1, `status status-${f(M).status ?? ""}`, "svelte-1r6codn"), L(Re, f(M).status), L(U, f(M).retry_count), L(ke, he);
          },
          [() => v(f(M).created_at)]
        ), q(b, m);
      }), q(D, T);
    };
    _e(R, (D) => {
      f(i) ? D(X) : D(z, !1);
    });
  }
  be(
    (D) => {
      L(N, `ジョブ一覧 (${f(s) ?? ""})`), d.disabled = f(a) === 0 || f(i), L(C, `${f(a) + 1} - ${D ?? ""} / ${f(s) ?? ""}`), P.disabled = f(a) + n >= f(s) || f(i);
    },
    [() => Math.min(f(a) + n, f(s))]
  ), q(e, p), bt();
}
Xt(["click"]);
var ba = /* @__PURE__ */ J('<div class="admin-app svelte-1n46o8q"><nav class="sub-nav svelte-1n46o8q"><a href="/admin/">エントリ一覧</a> <a href="/admin/edit">新規作成</a> <a href="/admin/jobs">ジョブ一覧</a></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function ya(e, t) {
  gt(t, !0);
  let r = /* @__PURE__ */ H(pe(window.location.pathname)), s = /* @__PURE__ */ H(pe(new URLSearchParams(window.location.search))), a = /* @__PURE__ */ H("");
  Ut(() => {
    const k = document.querySelector('meta[name="csrf-token"]');
    k && x(a, k.content, !0);
    const R = () => {
      x(r, window.location.pathname, !0), x(s, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", R), () => window.removeEventListener("popstate", R);
  });
  function n(k, R) {
    R && R.preventDefault(), window.history.pushState({}, "", k), x(r, window.location.pathname, !0), x(s, new URLSearchParams(window.location.search), !0);
  }
  const i = /* @__PURE__ */ kr(() => f(r) === "/admin/edit" ? "edit" : f(r) === "/admin/jobs" ? "jobs" : "list"), o = /* @__PURE__ */ kr(() => f(s).get("id"));
  var l = ba(), u = w(l), v = w(u);
  v.__click = (k) => n("/admin/", k);
  let p;
  var h = E(v, 2);
  h.__click = (k) => n("/admin/edit", k);
  let _;
  var N = E(h, 2);
  N.__click = (k) => n("/admin/jobs", k);
  let g;
  var d = E(u, 2), S = w(d);
  {
    var C = (k) => {
      va(k, {
        get sk() {
          return f(a);
        },
        get id() {
          return f(o);
        },
        onSave: (R) => window.location.href = R
      });
    }, P = (k) => {
      var R = wn(), X = It(R);
      {
        var z = (T) => {
          ga(T, {
            get sk() {
              return f(a);
            }
          });
        }, D = (T) => {
          sa(T, {
            get sk() {
              return f(a);
            },
            onEdit: (F) => n(`/admin/edit?id=${F}`)
          });
        };
        _e(
          X,
          (T) => {
            f(i) === "jobs" ? T(z) : T(D, !1);
          },
          !0
        );
      }
      q(k, R);
    };
    _e(S, (k) => {
      f(i) === "edit" ? k(C) : k(P, !1);
    });
  }
  be(() => {
    p = rt(v, 1, "svelte-1n46o8q", null, p, { active: f(i) === "list" }), _ = rt(h, 1, "svelte-1n46o8q", null, _, { active: f(i) === "edit" && !f(o) }), g = rt(N, 1, "svelte-1n46o8q", null, g, { active: f(i) === "jobs" });
  }), q(e, l), bt();
}
Xt(["click"]);
const rr = document.getElementById("admin-root");
rr && (rr.innerHTML = "", Ps(ya, { target: rr }));
//# sourceMappingURL=admin-front.js.map
