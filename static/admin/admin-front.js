var vr = Array.isArray, Dn = Array.prototype.indexOf, Vt = Array.from, xn = Object.defineProperty, St = Object.getOwnPropertyDescriptor, Tn = Object.getOwnPropertyDescriptors, An = Object.prototype, Fn = Array.prototype, Lr = Object.getPrototypeOf, kr = Object.isExtensible;
function Nn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function zr() {
  var e, t, r = new Promise((s, a) => {
    e = s, t = a;
  });
  return { promise: r, resolve: e, reject: t };
}
const K = 2, dr = 4, hr = 8, Rn = 1 << 24, Oe = 16, Ye = 32, We = 64, Kt = 128, ye = 512, Z = 1024, ue = 2048, Ae = 4096, oe = 8192, ze = 16384, _r = 32768, lt = 65536, Er = 1 << 17, qr = 1 << 18, vt = 1 << 19, In = 1 << 20, Re = 1 << 25, Ke = 32768, lr = 1 << 21, pr = 1 << 22, qe = 1 << 23, it = /* @__PURE__ */ Symbol("$state"), Pn = /* @__PURE__ */ Symbol(""), st = new class extends Error {
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
function Bn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Un() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Xn = 1, Jn = 2, Br = 4, $n = 8, Vn = 16, Kn = 1, Gn = 2, G = /* @__PURE__ */ Symbol(), Zn = "http://www.w3.org/1999/xhtml";
function Wn() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Qn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Ur(e) {
  return e === this.v;
}
function es(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Xr(e) {
  return !es(e, this.v);
}
let fe = null;
function ot(e) {
  fe = e;
}
function dt(e, t = !1, r) {
  fe = {
    p: fe,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function ht(e) {
  var t = (
    /** @type {ComponentContext} */
    fe
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var s of r)
      on(s);
  }
  return t.i = !0, fe = t.p, /** @type {T} */
  {};
}
function Jr() {
  return !0;
}
let Ue = [];
function $r() {
  var e = Ue;
  Ue = [], Nn(e);
}
function Nt(e) {
  if (Ue.length === 0 && !Et) {
    var t = Ue;
    queueMicrotask(() => {
      t === Ue && $r();
    });
  }
  Ue.push(e);
}
function ts() {
  for (; Ue.length > 0; )
    $r();
}
function Vr(e) {
  var t = z;
  if (t === null)
    return Y.f |= qe, e;
  if ((t.f & _r) === 0) {
    if ((t.f & Kt) === 0)
      throw e;
    t.b.error(e);
  } else
    ut(e, t);
}
function ut(e, t) {
  for (; t !== null; ) {
    if ((t.f & Kt) !== 0)
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
const Ht = /* @__PURE__ */ new Set();
let j = null, kt = null, _e = null, de = [], Gt = null, or = !1, Et = !1;
class xe {
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
    de = [], kt = null, this.apply();
    var r = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const s of t)
      this.#i(s, r);
    this.is_fork || this.#f(), this.is_deferred() ? (this.#l(r.effects), this.#l(r.render_effects)) : (kt = this, j = null, Dr(r.render_effects), Dr(r.effects), kt = null, this.#o?.resolve()), _e = null;
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
      var a = s.f, n = (a & (Ye | We)) !== 0, i = n && (a & Z) !== 0, o = i || (a & oe) !== 0 || this.skipped_effects.has(s);
      if ((s.f & Kt) !== 0 && s.b?.is_pending() && (r = {
        parent: r,
        effect: s,
        effects: [],
        render_effects: []
      }), !o && s.fn !== null) {
        n ? s.f ^= Z : (a & dr) !== 0 ? r.effects.push(s) : It(s) && ((s.f & Oe) !== 0 && this.#a.add(s), Ft(s));
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
      (r.f & ue) !== 0 ? this.#a.add(r) : (r.f & Ae) !== 0 && this.#s.add(r), this.#u(r.deps), W(r, Z);
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
    this.previous.has(t) || this.previous.set(t, r), (t.f & qe) === 0 && (this.current.set(t, t.v), _e?.set(t, t.v));
  }
  activate() {
    j = this, this.apply();
  }
  deactivate() {
    j === this && (j = null, _e = null);
  }
  flush() {
    if (this.activate(), de.length > 0) {
      if (Kr(), j !== null && j !== this)
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
    if (Ht.size > 1) {
      this.previous.clear();
      var t = _e, r = !0, s = {
        parent: null,
        effect: null,
        effects: [],
        render_effects: []
      };
      for (const n of Ht) {
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
          var a = de;
          de = [];
          const l = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
          for (const c of i)
            Gr(c, o, l, f);
          if (de.length > 0) {
            j = n, n.apply();
            for (const c of de)
              n.#i(c, s);
            n.deactivate();
          }
          de = a;
        }
      }
      j = null, _e = t;
    }
    this.committed = !0, Ht.delete(this);
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
      this.#s.delete(t), W(t, ue), Ge(t);
    for (const t of this.#s)
      W(t, Ae), Ge(t);
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
    return (this.#o ??= zr()).promise;
  }
  static ensure() {
    if (j === null) {
      const t = j = new xe();
      Ht.add(j), Et || xe.enqueue(() => {
        j === t && t.flush();
      });
    }
    return j;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    Nt(t);
  }
  apply() {
  }
}
function rs(e) {
  var t = Et;
  Et = !0;
  try {
    for (var r; ; ) {
      if (ts(), de.length === 0 && (j?.flush(), de.length === 0))
        return Gt = null, /** @type {T} */
        r;
      Kr();
    }
  } finally {
    Et = t;
  }
}
function Kr() {
  var e = $e;
  or = !0;
  var t = null;
  try {
    var r = 0;
    for (qt(!0); de.length > 0; ) {
      var s = xe.ensure();
      if (r++ > 1e3) {
        var a, n;
        ns();
      }
      s.process(de), Be.clear();
    }
  } finally {
    or = !1, qt(e), Gt = null;
  }
}
function ns() {
  try {
    Ln();
  } catch (e) {
    ut(e, Gt);
  }
}
let Ne = null;
function Dr(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var s = e[r++];
      if ((s.f & (ze | oe)) === 0 && It(s) && (Ne = /* @__PURE__ */ new Set(), Ft(s), s.deps === null && s.first === null && s.nodes === null && (s.teardown === null && s.ac === null ? vn(s) : s.fn = null), Ne?.size > 0)) {
        Be.clear();
        for (const a of Ne) {
          if ((a.f & (ze | oe)) !== 0) continue;
          const n = [a];
          let i = a.parent;
          for (; i !== null; )
            Ne.has(i) && (Ne.delete(i), n.push(i)), i = i.parent;
          for (let o = n.length - 1; o >= 0; o--) {
            const l = n[o];
            (l.f & (ze | oe)) === 0 && Ft(l);
          }
        }
        Ne.clear();
      }
    }
    Ne = null;
  }
}
function Gr(e, t, r, s) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const n = a.f;
      (n & K) !== 0 ? Gr(
        /** @type {Derived} */
        a,
        t,
        r,
        s
      ) : (n & (pr | Oe)) !== 0 && (n & ue) === 0 && Zr(a, t, s) && (W(a, ue), Ge(
        /** @type {Effect} */
        a
      ));
    }
}
function Zr(e, t, r) {
  const s = r.get(e);
  if (s !== void 0) return s;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (t.includes(a))
        return !0;
      if ((a.f & K) !== 0 && Zr(
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
function Ge(e) {
  for (var t = Gt = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (or && t === z && (r & Oe) !== 0 && (r & qr) === 0)
      return;
    if ((r & (We | Ye)) !== 0) {
      if ((r & Z) === 0) return;
      t.f ^= Z;
    }
  }
  de.push(t);
}
function ss(e) {
  let t = 0, r = Ze(0), s;
  return () => {
    Tt() && (u(r), Zt(() => (t === 0 && (s = Pt(() => e(() => Dt(r)))), t += 1, () => {
      Nt(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, Dt(r));
      });
    })));
  };
}
var as = lt | vt | Kt;
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
  #b = ss(() => (this.#d = Ze(this.#c), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, s) {
    this.#t = t, this.#r = r, this.#o = s, this.parent = /** @type {Effect} */
    z.b, this.#e = !!this.#r.pending, this.#a = yr(() => {
      z.b = this;
      {
        var a = this.#m();
        try {
          this.#s = he(() => s(a));
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
  #w() {
    try {
      this.#s = he(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
    this.#e = !1;
  }
  #y() {
    const t = this.#r.pending;
    t && (this.#i = he(() => t(this.#t)), xe.enqueue(() => {
      var r = this.#m();
      this.#s = this.#_(() => (xe.ensure(), he(() => this.#o(r)))), this.#v > 0 ? this.#p() : (Je(
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
    var r = z, s = Y, a = fe;
    Fe(this.#a), se(this.#a), ot(this.#a.ctx);
    try {
      return t();
    } catch (n) {
      return Vr(n), null;
    } finally {
      Fe(r), se(s), ot(a);
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
    ), _n(this.#s, this.#u)), this.#i === null && (this.#i = he(() => t(this.#t)));
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
    this.#v += t, this.#v === 0 && (this.#e = !1, this.#i && Je(this.#i, () => {
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
    this.#g(t), this.#c += t, this.#d && ft(this.#d, this.#c);
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
    this.#s && (ae(this.#s), this.#s = null), this.#i && (ae(this.#i), this.#i = null), this.#l && (ae(this.#l), this.#l = null);
    var a = !1, n = !1;
    const i = () => {
      if (a) {
        Qn();
        return;
      }
      a = !0, n && Un(), xe.ensure(), this.#c = 0, this.#l !== null && Je(this.#l, () => {
        this.#l = null;
      }), this.#e = this.has_pending_snippet(), this.#s = this.#_(() => (this.#h = !1, he(() => this.#o(this.#t)))), this.#v > 0 ? this.#p() : this.#e = !1;
    };
    var o = Y;
    try {
      se(null), n = !0, r?.(t, i), n = !1;
    } catch (l) {
      ut(l, this.#a && this.#a.parent);
    } finally {
      se(o);
    }
    s && Nt(() => {
      this.#l = this.#_(() => {
        xe.ensure(), this.#h = !0;
        try {
          return he(() => {
            s(
              this.#t,
              () => t,
              () => i
            );
          });
        } catch (l) {
          return ut(
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
  const a = mr;
  if (r.length === 0 && e.length === 0) {
    s(t.map(a));
    return;
  }
  var n = j, i = (
    /** @type {Effect} */
    z
  ), o = us();
  function l() {
    Promise.all(r.map((f) => /* @__PURE__ */ fs(f))).then((f) => {
      o();
      try {
        s([...t.map(a), ...f]);
      } catch (c) {
        (i.f & ze) === 0 && ut(c, i);
      }
      n?.deactivate(), Lt();
    }).catch((f) => {
      ut(f, i);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    o();
    try {
      return l();
    } finally {
      n?.deactivate(), Lt();
    }
  }) : l();
}
function us() {
  var e = z, t = Y, r = fe, s = j;
  return function(n = !0) {
    Fe(e), se(t), ot(r), n && s?.activate();
  };
}
function Lt() {
  Fe(null), se(null), ot(null);
}
// @__NO_SIDE_EFFECTS__
function mr(e) {
  var t = K | ue, r = Y !== null && (Y.f & K) !== 0 ? (
    /** @type {Derived} */
    Y
  ) : null;
  return z !== null && (z.f |= vt), {
    ctx: fe,
    deps: null,
    effects: null,
    equals: Ur,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      G
    ),
    wv: 0,
    parent: r ?? z,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function fs(e, t) {
  let r = (
    /** @type {Effect | null} */
    z
  );
  r === null && Yn();
  var s = (
    /** @type {Boundary} */
    r.b
  ), a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), n = Ze(
    /** @type {V} */
    G
  ), i = !Y, o = /* @__PURE__ */ new Map();
  return Ss(() => {
    var l = zr();
    a = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).then(() => {
        f === j && f.committed && f.deactivate(), Lt();
      });
    } catch (h) {
      l.reject(h), Lt();
    }
    var f = (
      /** @type {Batch} */
      j
    );
    if (i) {
      var c = !s.is_pending();
      s.update_pending_count(1), f.increment(c), o.get(f)?.reject(st), o.delete(f), o.set(f, l);
    }
    const p = (h, m = void 0) => {
      if (f.activate(), m)
        m !== st && (n.f |= qe, ft(n, m));
      else {
        (n.f & qe) !== 0 && (n.f ^= qe), ft(n, h);
        for (const [T, M] of o) {
          if (o.delete(T), T === f) break;
          M.reject(st);
        }
      }
      i && (s.update_pending_count(-1), f.decrement(c));
    };
    l.promise.then(p, (h) => p(null, h || "unknown"));
  }), ln(() => {
    for (const l of o.values())
      l.reject(st);
  }), new Promise((l) => {
    function f(c) {
      function p() {
        c === a ? l(n) : f(a);
      }
      c.then(p, p);
    }
    f(a);
  });
}
// @__NO_SIDE_EFFECTS__
function xr(e) {
  const t = /* @__PURE__ */ mr(e);
  return pn(t), t;
}
// @__NO_SIDE_EFFECTS__
function cs(e) {
  const t = /* @__PURE__ */ mr(e);
  return t.equals = Xr, t;
}
function Wr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      ae(
        /** @type {Effect} */
        t[r]
      );
  }
}
function vs(e) {
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
function gr(e) {
  var t, r = z;
  Fe(vs(e));
  try {
    e.f &= ~Ke, Wr(e), t = wn(e);
  } finally {
    Fe(r);
  }
  return t;
}
function Qr(e) {
  var t = gr(e);
  if (e.equals(t) || (j?.is_fork || (e.v = t), e.wv = gn()), !_t)
    if (_e !== null)
      (Tt() || j?.is_fork) && _e.set(e, t);
    else {
      var r = (e.f & ye) === 0 ? Ae : Z;
      W(e, r);
    }
}
let ur = /* @__PURE__ */ new Set();
const Be = /* @__PURE__ */ new Map();
let en = !1;
function Ze(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Ur,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function C(e, t) {
  const r = Ze(e);
  return pn(r), r;
}
// @__NO_SIDE_EFFECTS__
function ds(e, t = !1, r = !0) {
  const s = Ze(e);
  return t || (s.equals = Xr), s;
}
function x(e, t, r = !1) {
  Y !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Te || (Y.f & Er) !== 0) && Jr() && (Y.f & (K | Oe | pr | Er)) !== 0 && !Pe?.includes(e) && Bn();
  let s = r ? be(t) : t;
  return ft(e, s);
}
function ft(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    _t ? Be.set(e, t) : Be.set(e, r), e.v = t;
    var s = xe.ensure();
    s.capture(e, r), (e.f & K) !== 0 && ((e.f & ue) !== 0 && gr(
      /** @type {Derived} */
      e
    ), W(e, (e.f & ye) !== 0 ? Z : Ae)), e.wv = gn(), tn(e, ue), z !== null && (z.f & Z) !== 0 && (z.f & (Ye | We)) === 0 && (ve === null ? Ds([e]) : ve.push(e)), !s.is_fork && ur.size > 0 && !en && hs();
  }
  return t;
}
function hs() {
  en = !1;
  var e = $e;
  qt(!0);
  const t = Array.from(ur);
  try {
    for (const r of t)
      (r.f & Z) !== 0 && W(r, Ae), It(r) && Ft(r);
  } finally {
    qt(e);
  }
  ur.clear();
}
function Dt(e) {
  x(e, e.v + 1);
}
function tn(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, a = 0; a < s; a++) {
      var n = r[a], i = n.f, o = (i & ue) === 0;
      if (o && W(n, t), (i & K) !== 0) {
        var l = (
          /** @type {Derived} */
          n
        );
        _e?.delete(l), (i & Ke) === 0 && (i & ye && (n.f |= Ke), tn(l, Ae));
      } else o && ((i & Oe) !== 0 && Ne !== null && Ne.add(
        /** @type {Effect} */
        n
      ), Ge(
        /** @type {Effect} */
        n
      ));
    }
}
function be(e) {
  if (typeof e != "object" || e === null || it in e)
    return e;
  const t = Lr(e);
  if (t !== An && t !== Fn)
    return e;
  var r = /* @__PURE__ */ new Map(), s = vr(e), a = /* @__PURE__ */ C(0), n = Ve, i = (o) => {
    if (Ve === n)
      return o();
    var l = Y, f = Ve;
    se(null), Rr(n);
    var c = o();
    return se(l), Rr(f), c;
  };
  return s && r.set("length", /* @__PURE__ */ C(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(o, l, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && zn();
        var c = r.get(l);
        return c === void 0 ? c = i(() => {
          var p = /* @__PURE__ */ C(f.value);
          return r.set(l, p), p;
        }) : x(c, f.value, !0), !0;
      },
      deleteProperty(o, l) {
        var f = r.get(l);
        if (f === void 0) {
          if (l in o) {
            const c = i(() => /* @__PURE__ */ C(G));
            r.set(l, c), Dt(a);
          }
        } else
          x(f, G), Dt(a);
        return !0;
      },
      get(o, l, f) {
        if (l === it)
          return e;
        var c = r.get(l), p = l in o;
        if (c === void 0 && (!p || St(o, l)?.writable) && (c = i(() => {
          var m = be(p ? o[l] : G), T = /* @__PURE__ */ C(m);
          return T;
        }), r.set(l, c)), c !== void 0) {
          var h = u(c);
          return h === G ? void 0 : h;
        }
        return Reflect.get(o, l, f);
      },
      getOwnPropertyDescriptor(o, l) {
        var f = Reflect.getOwnPropertyDescriptor(o, l);
        if (f && "value" in f) {
          var c = r.get(l);
          c && (f.value = u(c));
        } else if (f === void 0) {
          var p = r.get(l), h = p?.v;
          if (p !== void 0 && h !== G)
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
        if (l === it)
          return !0;
        var f = r.get(l), c = f !== void 0 && f.v !== G || Reflect.has(o, l);
        if (f !== void 0 || z !== null && (!c || St(o, l)?.writable)) {
          f === void 0 && (f = i(() => {
            var h = c ? be(o[l]) : G, m = /* @__PURE__ */ C(h);
            return m;
          }), r.set(l, f));
          var p = u(f);
          if (p === G)
            return !1;
        }
        return c;
      },
      set(o, l, f, c) {
        var p = r.get(l), h = l in o;
        if (s && l === "length")
          for (var m = f; m < /** @type {Source<number>} */
          p.v; m += 1) {
            var T = r.get(m + "");
            T !== void 0 ? x(T, G) : m in o && (T = i(() => /* @__PURE__ */ C(G)), r.set(m + "", T));
          }
        if (p === void 0)
          (!h || St(o, l)?.writable) && (p = i(() => /* @__PURE__ */ C(void 0)), x(p, be(f)), r.set(l, p));
        else {
          h = p.v !== G;
          var M = i(() => be(f));
          x(p, M);
        }
        var d = Reflect.getOwnPropertyDescriptor(o, l);
        if (d?.set && d.set.call(c, f), !h) {
          if (s && typeof l == "string") {
            var k = (
              /** @type {Source<number>} */
              r.get("length")
            ), q = Number(l);
            Number.isInteger(q) && q >= k.v && x(k, q + 1);
          }
          Dt(a);
        }
        return !0;
      },
      ownKeys(o) {
        u(a);
        var l = Reflect.ownKeys(o).filter((p) => {
          var h = r.get(p);
          return h === void 0 || h.v !== G;
        });
        for (var [f, c] of r)
          c.v !== G && !(f in o) && l.push(f);
        return l;
      },
      setPrototypeOf() {
        qn();
      }
    }
  );
}
function Tr(e) {
  try {
    if (e !== null && typeof e == "object" && it in e)
      return e[it];
  } catch {
  }
  return e;
}
function _s(e, t) {
  return Object.is(Tr(e), Tr(t));
}
var Ar, rn, nn, sn;
function ps() {
  if (Ar === void 0) {
    Ar = window, rn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    nn = St(t, "firstChild").get, sn = St(t, "nextSibling").get, kr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), kr(r) && (r.__t = void 0);
  }
}
function Ie(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function zt(e) {
  return (
    /** @type {TemplateNode | null} */
    nn.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Rt(e) {
  return (
    /** @type {TemplateNode | null} */
    sn.call(e)
  );
}
function _(e, t) {
  return /* @__PURE__ */ zt(e);
}
function ct(e, t = !1) {
  {
    var r = /* @__PURE__ */ zt(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ Rt(r) : r;
  }
}
function w(e, t = 1, r = !1) {
  let s = e;
  for (; t--; )
    s = /** @type {TemplateNode} */
    /* @__PURE__ */ Rt(s);
  return s;
}
function ms(e) {
  e.textContent = "";
}
function an() {
  return !1;
}
let Fr = !1;
function gs() {
  Fr || (Fr = !0, document.addEventListener(
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
function br(e) {
  var t = Y, r = z;
  se(null), Fe(null);
  try {
    return e();
  } finally {
    se(t), Fe(r);
  }
}
function wr(e, t, r, s = r) {
  e.addEventListener(t, () => br(r));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), s(!0);
  } : e.__on_r = () => s(!0), gs();
}
function bs(e) {
  z === null && (Y === null && Cn(), jn()), _t && Hn();
}
function ws(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function He(e, t, r) {
  var s = z;
  s !== null && (s.f & oe) !== 0 && (e |= oe);
  var a = {
    ctx: fe,
    deps: null,
    nodes: null,
    f: e | ue | ye,
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
      Ft(a), a.f |= _r;
    } catch (o) {
      throw ae(a), o;
    }
  else t !== null && Ge(a);
  var n = a;
  if (r && n.deps === null && n.teardown === null && n.nodes === null && n.first === n.last && // either `null`, or a singular child
  (n.f & vt) === 0 && (n = n.first, (e & Oe) !== 0 && (e & lt) !== 0 && n !== null && (n.f |= lt)), n !== null && (n.parent = s, s !== null && ws(n, s), Y !== null && (Y.f & K) !== 0 && (e & We) === 0)) {
    var i = (
      /** @type {Derived} */
      Y
    );
    (i.effects ??= []).push(n);
  }
  return a;
}
function Tt() {
  return Y !== null && !Te;
}
function ln(e) {
  const t = He(hr, null, !1);
  return W(t, Z), t.teardown = e, t;
}
function ys(e) {
  bs();
  var t = (
    /** @type {Effect} */
    z.f
  ), r = !Y && (t & Ye) !== 0 && (t & _r) === 0;
  if (r) {
    var s = (
      /** @type {ComponentContext} */
      fe
    );
    (s.e ??= []).push(e);
  } else
    return on(e);
}
function on(e) {
  return He(dr | In, e, !1);
}
function Ms(e) {
  xe.ensure();
  const t = He(We | vt, e, !0);
  return (r = {}) => new Promise((s) => {
    r.outro ? Je(t, () => {
      ae(t), s(void 0);
    }) : (ae(t), s(void 0));
  });
}
function un(e) {
  return He(dr, e, !1);
}
function Ss(e) {
  return He(pr | vt, e, !0);
}
function Zt(e, t = 0) {
  return He(hr | t, e, !0);
}
function we(e, t = [], r = [], s = []) {
  os(s, t, r, (a) => {
    He(hr, () => e(...a.map(u)), !0);
  });
}
function yr(e, t = 0) {
  var r = He(Oe | t, e, !0);
  return r;
}
function he(e) {
  return He(Ye | vt, e, !0);
}
function fn(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = _t, s = Y;
    Nr(!0), se(null);
    try {
      t.call(null);
    } finally {
      Nr(r), se(s);
    }
  }
}
function cn(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const a = r.ac;
    a !== null && br(() => {
      a.abort(st);
    });
    var s = r.next;
    (r.f & We) !== 0 ? r.parent = null : ae(r, t), r = s;
  }
}
function ks(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & Ye) === 0 && ae(t), t = r;
  }
}
function ae(e, t = !0) {
  var r = !1;
  (t || (e.f & qr) !== 0) && e.nodes !== null && e.nodes.end !== null && (Es(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), cn(e, t && !r), Bt(e, 0), W(e, ze);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const n of s)
      n.stop();
  fn(e);
  var a = e.parent;
  a !== null && a.first !== null && vn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Es(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ Rt(e);
    e.remove(), e = r;
  }
}
function vn(e) {
  var t = e.parent, r = e.prev, s = e.next;
  r !== null && (r.next = s), s !== null && (s.prev = r), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = r));
}
function Je(e, t, r = !0) {
  var s = [];
  dn(e, s, !0);
  var a = () => {
    r && ae(e), t && t();
  }, n = s.length;
  if (n > 0) {
    var i = () => --n || a();
    for (var o of s)
      o.out(i);
  } else
    a();
}
function dn(e, t, r) {
  if ((e.f & oe) === 0) {
    e.f ^= oe;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const o of s)
        (o.is_global || r) && t.push(o);
    for (var a = e.first; a !== null; ) {
      var n = a.next, i = (a.f & lt) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (a.f & Ye) !== 0 && (e.f & Oe) !== 0;
      dn(a, t, i ? r : !1), a = n;
    }
  }
}
function Mr(e) {
  hn(e, !0);
}
function hn(e, t) {
  if ((e.f & oe) !== 0) {
    e.f ^= oe, (e.f & Z) === 0 && (W(e, ue), Ge(e));
    for (var r = e.first; r !== null; ) {
      var s = r.next, a = (r.f & lt) !== 0 || (r.f & Ye) !== 0;
      hn(r, a ? t : !1), r = s;
    }
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const i of n)
        (i.is_global || t) && i.in();
  }
}
function _n(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end; r !== null; ) {
      var a = r === s ? null : /* @__PURE__ */ Rt(r);
      t.append(r), r = a;
    }
}
let $e = !1;
function qt(e) {
  $e = e;
}
let _t = !1;
function Nr(e) {
  _t = e;
}
let Y = null, Te = !1;
function se(e) {
  Y = e;
}
let z = null;
function Fe(e) {
  z = e;
}
let Pe = null;
function pn(e) {
  Y !== null && (Pe === null ? Pe = [e] : Pe.push(e));
}
let re = null, le = 0, ve = null;
function Ds(e) {
  ve = e;
}
let mn = 1, At = 0, Ve = At;
function Rr(e) {
  Ve = e;
}
function gn() {
  return ++mn;
}
function It(e) {
  var t = e.f;
  if ((t & ue) !== 0)
    return !0;
  if (t & K && (e.f &= ~Ke), (t & Ae) !== 0) {
    var r = e.deps;
    if (r !== null)
      for (var s = r.length, a = 0; a < s; a++) {
        var n = r[a];
        if (It(
          /** @type {Derived} */
          n
        ) && Qr(
          /** @type {Derived} */
          n
        ), n.wv > e.wv)
          return !0;
      }
    (t & ye) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    _e === null && W(e, Z);
  }
  return !1;
}
function bn(e, t, r = !0) {
  var s = e.reactions;
  if (s !== null && !Pe?.includes(e))
    for (var a = 0; a < s.length; a++) {
      var n = s[a];
      (n.f & K) !== 0 ? bn(
        /** @type {Derived} */
        n,
        t,
        !1
      ) : t === n && (r ? W(n, ue) : (n.f & Z) !== 0 && W(n, Ae), Ge(
        /** @type {Effect} */
        n
      ));
    }
}
function wn(e) {
  var t = re, r = le, s = ve, a = Y, n = Pe, i = fe, o = Te, l = Ve, f = e.f;
  re = /** @type {null | Value[]} */
  null, le = 0, ve = null, Y = (f & (Ye | We)) === 0 ? e : null, Pe = null, ot(e.ctx), Te = !1, Ve = ++At, e.ac !== null && (br(() => {
    e.ac.abort(st);
  }), e.ac = null);
  try {
    e.f |= lr;
    var c = (
      /** @type {Function} */
      e.fn
    ), p = c(), h = e.deps;
    if (re !== null) {
      var m;
      if (Bt(e, le), h !== null && le > 0)
        for (h.length = le + re.length, m = 0; m < re.length; m++)
          h[le + m] = re[m];
      else
        e.deps = h = re;
      if (Tt() && (e.f & ye) !== 0)
        for (m = le; m < h.length; m++)
          (h[m].reactions ??= []).push(e);
    } else h !== null && le < h.length && (Bt(e, le), h.length = le);
    if (Jr() && ve !== null && !Te && h !== null && (e.f & (K | Ae | ue)) === 0)
      for (m = 0; m < /** @type {Source[]} */
      ve.length; m++)
        bn(
          ve[m],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (At++, ve !== null && (s === null ? s = ve : s.push(.../** @type {Source[]} */
    ve))), (e.f & qe) !== 0 && (e.f ^= qe), p;
  } catch (T) {
    return Vr(T);
  } finally {
    e.f ^= lr, re = t, le = r, ve = s, Y = a, Pe = n, ot(i), Te = o, Ve = l;
  }
}
function xs(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var s = Dn.call(r, e);
    if (s !== -1) {
      var a = r.length - 1;
      a === 0 ? r = t.reactions = null : (r[s] = r[a], r.pop());
    }
  }
  r === null && (t.f & K) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (re === null || !re.includes(t)) && (W(t, Ae), (t.f & ye) !== 0 && (t.f ^= ye, t.f &= ~Ke), Wr(
    /** @type {Derived} **/
    t
  ), Bt(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Bt(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var s = t; s < r.length; s++)
      xs(e, r[s]);
}
function Ft(e) {
  var t = e.f;
  if ((t & ze) === 0) {
    W(e, Z);
    var r = z, s = $e;
    z = e, $e = !0;
    try {
      (t & (Oe | Rn)) !== 0 ? ks(e) : cn(e), fn(e);
      var a = wn(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = mn;
      var n;
    } finally {
      $e = s, z = r;
    }
  }
}
async function Ts() {
  await Promise.resolve(), rs();
}
function u(e) {
  var t = e.f, r = (t & K) !== 0;
  if (Y !== null && !Te) {
    var s = z !== null && (z.f & ze) !== 0;
    if (!s && !Pe?.includes(e)) {
      var a = Y.deps;
      if ((Y.f & lr) !== 0)
        e.rv < At && (e.rv = At, re === null && a !== null && a[le] === e ? le++ : re === null ? re = [e] : re.includes(e) || re.push(e));
      else {
        (Y.deps ??= []).push(e);
        var n = e.reactions;
        n === null ? e.reactions = [Y] : n.includes(Y) || n.push(Y);
      }
    }
  }
  if (_t) {
    if (Be.has(e))
      return Be.get(e);
    if (r) {
      var i = (
        /** @type {Derived} */
        e
      ), o = i.v;
      return ((i.f & Z) === 0 && i.reactions !== null || Mn(i)) && (o = gr(i)), Be.set(i, o), o;
    }
  } else r && (!_e?.has(e) || j?.is_fork && !Tt()) && (i = /** @type {Derived} */
  e, It(i) && Qr(i), $e && Tt() && (i.f & ye) === 0 && yn(i));
  if (_e?.has(e))
    return _e.get(e);
  if ((e.f & qe) !== 0)
    throw e.v;
  return e.v;
}
function yn(e) {
  if (e.deps !== null) {
    e.f ^= ye;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & K) !== 0 && (t.f & ye) === 0 && yn(
        /** @type {Derived} */
        t
      );
  }
}
function Mn(e) {
  if (e.v === G) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Be.has(t) || (t.f & K) !== 0 && Mn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Pt(e) {
  var t = Te;
  try {
    return Te = !0, e();
  } finally {
    Te = t;
  }
}
const As = -7169;
function W(e, t) {
  e.f = e.f & As | t;
}
const Fs = ["touchstart", "touchmove"];
function Ns(e) {
  return Fs.includes(e);
}
const Sn = /* @__PURE__ */ new Set(), fr = /* @__PURE__ */ new Set();
function Wt(e) {
  for (var t = 0; t < e.length; t++)
    Sn.add(e[t]);
  for (var r of fr)
    r(e);
}
let Ir = null;
function jt(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], n = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Ir = e;
  var i = 0, o = Ir === e && e.__root;
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
    xn(e, "currentTarget", {
      configurable: !0,
      get() {
        return n || r;
      }
    });
    var c = Y, p = z;
    se(null), Fe(null);
    try {
      for (var h, m = []; n !== null; ) {
        var T = n.assignedSlot || n.parentNode || /** @type {any} */
        n.host || null;
        try {
          var M = n["__" + s];
          M != null && (!/** @type {any} */
          n.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === n) && M.call(n, e);
        } catch (d) {
          h ? m.push(d) : h = d;
        }
        if (e.cancelBubble || T === t || T === null)
          break;
        n = T;
      }
      if (h) {
        for (let d of m)
          queueMicrotask(() => {
            throw d;
          });
        throw h;
      }
    } finally {
      e.__root = t, delete e.currentTarget, se(c), Fe(p);
    }
  }
}
function Rs(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Ut(e, t) {
  var r = (
    /** @type {Effect} */
    z
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function X(e, t) {
  var r = (t & Kn) !== 0, s = (t & Gn) !== 0, a, n = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = Rs(n ? e : "<!>" + e), r || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ zt(a)));
    var i = (
      /** @type {TemplateNode} */
      s || rn ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ zt(i)
      ), l = (
        /** @type {TemplateNode} */
        i.lastChild
      );
      Ut(o, l);
    } else
      Ut(i, i);
    return i;
  };
}
function Is(e = "") {
  {
    var t = Ie(e + "");
    return Ut(t, t), t;
  }
}
function Xt() {
  var e = document.createDocumentFragment(), t = document.createComment(""), r = Ie();
  return e.append(t, r), Ut(t, r), e;
}
function B(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function P(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ??= e.nodeValue) && (e.__t = r, e.nodeValue = r + "");
}
function Ps(e, t) {
  return Os(e, t);
}
const nt = /* @__PURE__ */ new Map();
function Os(e, { target: t, anchor: r, props: s = {}, events: a, context: n, intro: i = !0 }) {
  ps();
  var o = /* @__PURE__ */ new Set(), l = (p) => {
    for (var h = 0; h < p.length; h++) {
      var m = p[h];
      if (!o.has(m)) {
        o.add(m);
        var T = Ns(m);
        t.addEventListener(m, jt, { passive: T });
        var M = nt.get(m);
        M === void 0 ? (document.addEventListener(m, jt, { passive: T }), nt.set(m, 1)) : nt.set(m, M + 1);
      }
    }
  };
  l(Vt(Sn)), fr.add(l);
  var f = void 0, c = Ms(() => {
    var p = r ?? t.appendChild(Ie());
    return is(
      /** @type {TemplateNode} */
      p,
      {
        pending: () => {
        }
      },
      (h) => {
        if (n) {
          dt({});
          var m = (
            /** @type {ComponentContext} */
            fe
          );
          m.c = n;
        }
        a && (s.$$events = a), f = e(h, s) || {}, n && ht();
      }
    ), () => {
      for (var h of o) {
        t.removeEventListener(h, jt);
        var m = (
          /** @type {number} */
          nt.get(h)
        );
        --m === 0 ? (document.removeEventListener(h, jt), nt.delete(h)) : nt.set(h, m);
      }
      fr.delete(l), p !== r && p.parentNode?.removeChild(p);
    };
  });
  return Ys.set(f, c), f;
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
      j
    );
    if (this.#e.has(t)) {
      var r = (
        /** @type {Key} */
        this.#e.get(t)
      ), s = this.#t.get(r);
      if (s)
        Mr(s), this.#r.delete(r);
      else {
        var a = this.#n.get(r);
        a && (this.#t.set(r, a.effect), this.#n.delete(r), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
      }
      for (const [n, i] of this.#e) {
        if (this.#e.delete(n), n === t)
          break;
        const o = this.#n.get(i);
        o && (ae(o.effect), this.#n.delete(i));
      }
      for (const [n, i] of this.#t) {
        if (n === r || this.#r.has(n)) continue;
        const o = () => {
          if (Array.from(this.#e.values()).includes(n)) {
            var f = document.createDocumentFragment();
            _n(i, f), f.append(Ie()), this.#n.set(n, { effect: i, fragment: f });
          } else
            ae(i);
          this.#r.delete(n), this.#t.delete(n);
        };
        this.#o || !s ? (this.#r.add(n), Je(i, o, !1)) : o();
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
      r.includes(s) || (ae(a.effect), this.#n.delete(s));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, r) {
    var s = (
      /** @type {Batch} */
      j
    ), a = an();
    if (r && !this.#t.has(t) && !this.#n.has(t))
      if (a) {
        var n = document.createDocumentFragment(), i = Ie();
        n.append(i), this.#n.set(t, {
          effect: he(() => r(i)),
          fragment: n
        });
      } else
        this.#t.set(
          t,
          he(() => r(this.anchor))
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
function ne(e, t, r = !1) {
  var s = new Hs(e), a = r ? lt : 0;
  function n(i, o) {
    s.ensure(i, o);
  }
  yr(() => {
    var i = !1;
    t((o, l = !0) => {
      i = !0, n(l, o);
    }), i || n(!1, null);
  }, a);
}
function Jt(e, t) {
  return t;
}
function js(e, t, r) {
  for (var s = [], a = t.length, n, i = t.length, o = 0; o < a; o++) {
    let p = t[o];
    Je(
      p,
      () => {
        if (n) {
          if (n.pending.delete(p), n.done.add(p), n.pending.size === 0) {
            var h = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            cr(Vt(n.done)), h.delete(n), h.size === 0 && (e.outrogroups = null);
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
      ms(c), c.append(f), e.items.clear();
    }
    cr(t, !l);
  } else
    n = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(n);
}
function cr(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    ae(e[r], t);
}
var Pr;
function $t(e, t, r, s, a, n = null) {
  var i = e, o = /* @__PURE__ */ new Map(), l = (t & Br) !== 0;
  if (l) {
    var f = (
      /** @type {Element} */
      e
    );
    i = f.appendChild(Ie());
  }
  var c = null, p = /* @__PURE__ */ cs(() => {
    var k = r();
    return vr(k) ? k : k == null ? [] : Vt(k);
  }), h, m = !0;
  function T() {
    d.fallback = c, Cs(d, h, i, t, s), c !== null && (h.length === 0 ? (c.f & Re) === 0 ? Mr(c) : (c.f ^= Re, Mt(c, null, i)) : Je(c, () => {
      c = null;
    }));
  }
  var M = yr(() => {
    h = /** @type {V[]} */
    u(p);
    for (var k = h.length, q = /* @__PURE__ */ new Set(), R = (
      /** @type {Batch} */
      j
    ), H = an(), L = 0; L < k; L += 1) {
      var N = h[L], O = s(N, L), D = m ? null : o.get(O);
      D ? (D.v && ft(D.v, N), D.i && ft(D.i, L), H && R.skipped_effects.delete(D.e)) : (D = Ls(
        o,
        m ? i : Pr ??= Ie(),
        N,
        O,
        L,
        a,
        t,
        r
      ), m || (D.e.f |= Re), o.set(O, D)), q.add(O);
    }
    if (k === 0 && n && !c && (m ? c = he(() => n(i)) : (c = he(() => n(Pr ??= Ie())), c.f |= Re)), !m)
      if (H) {
        for (const [F, A] of o)
          q.has(F) || R.skipped_effects.add(A.e);
        R.oncommit(T), R.ondiscard(() => {
        });
      } else
        T();
    u(p);
  }), d = { effect: M, items: o, outrogroups: null, fallback: c };
  m = !1;
}
function Cs(e, t, r, s, a) {
  var n = (s & $n) !== 0, i = t.length, o = e.items, l = e.effect.first, f, c = null, p, h = [], m = [], T, M, d, k;
  if (n)
    for (k = 0; k < i; k += 1)
      T = t[k], M = a(T, k), d = /** @type {EachItem} */
      o.get(M).e, (d.f & Re) === 0 && (d.nodes?.a?.measure(), (p ??= /* @__PURE__ */ new Set()).add(d));
  for (k = 0; k < i; k += 1) {
    if (T = t[k], M = a(T, k), d = /** @type {EachItem} */
    o.get(M).e, e.outrogroups !== null)
      for (const A of e.outrogroups)
        A.pending.delete(d), A.done.delete(d);
    if ((d.f & Re) !== 0)
      if (d.f ^= Re, d === l)
        Mt(d, null, r);
      else {
        var q = c ? c.next : l;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), Le(e, c, d), Le(e, d, q), Mt(d, q, r), c = d, h = [], m = [], l = c.next;
        continue;
      }
    if ((d.f & oe) !== 0 && (Mr(d), n && (d.nodes?.a?.unfix(), (p ??= /* @__PURE__ */ new Set()).delete(d))), d !== l) {
      if (f !== void 0 && f.has(d)) {
        if (h.length < m.length) {
          var R = m[0], H;
          c = R.prev;
          var L = h[0], N = h[h.length - 1];
          for (H = 0; H < h.length; H += 1)
            Mt(h[H], R, r);
          for (H = 0; H < m.length; H += 1)
            f.delete(m[H]);
          Le(e, L.prev, N.next), Le(e, c, L), Le(e, N, R), l = R, c = N, k -= 1, h = [], m = [];
        } else
          f.delete(d), Mt(d, l, r), Le(e, d.prev, d.next), Le(e, d, c === null ? e.effect.first : c.next), Le(e, c, d), c = d;
        continue;
      }
      for (h = [], m = []; l !== null && l !== d; )
        (f ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = l.next;
      if (l === null)
        continue;
    }
    (d.f & Re) === 0 && h.push(d), c = d, l = d.next;
  }
  if (e.outrogroups !== null) {
    for (const A of e.outrogroups)
      A.pending.size === 0 && (cr(Vt(A.done)), e.outrogroups?.delete(A));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || f !== void 0) {
    var O = [];
    if (f !== void 0)
      for (d of f)
        (d.f & oe) === 0 && O.push(d);
    for (; l !== null; )
      (l.f & oe) === 0 && l !== e.fallback && O.push(l), l = l.next;
    var D = O.length;
    if (D > 0) {
      var F = (s & Br) !== 0 && i === 0 ? r : null;
      if (n) {
        for (k = 0; k < D; k += 1)
          O[k].nodes?.a?.measure();
        for (k = 0; k < D; k += 1)
          O[k].nodes?.a?.fix();
      }
      js(e, O, F);
    }
  }
  n && Nt(() => {
    if (p !== void 0)
      for (d of p)
        d.nodes?.a?.apply();
  });
}
function Ls(e, t, r, s, a, n, i, o) {
  var l = (i & Xn) !== 0 ? (i & Vn) === 0 ? /* @__PURE__ */ ds(r, !1, !1) : Ze(r) : null, f = (i & Jn) !== 0 ? Ze(a) : null;
  return {
    v: l,
    i: f,
    e: he(() => (n(t, l ?? r, f ?? a, o), () => {
      e.delete(s);
    }))
  };
}
function Mt(e, t, r) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, n = t && (t.f & Re) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; s !== null; ) {
      var i = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Rt(s)
      );
      if (n.before(s), s === a)
        return;
      s = i;
    }
}
function Le(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
const Or = [...` 	
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
          (i === 0 || Or.includes(s[i - 1])) && (o === s.length || Or.includes(s[o])) ? s = (i === 0 ? "" : s.substring(0, i)) + s.substring(o + 1) : i = o;
        }
  }
  return s === "" ? null : s;
}
function Xe(e, t, r, s, a, n) {
  var i = e.__className;
  if (i !== r || i === void 0) {
    var o = zs(r, s, n);
    o == null ? e.removeAttribute("class") : e.className = o, e.__className = r;
  } else if (n && a !== n)
    for (var l in n) {
      var f = !!n[l];
      (a == null || f !== !!a[l]) && e.classList.toggle(l, f);
    }
  return n;
}
function kn(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!vr(t))
      return Wn();
    for (var s of e.options)
      s.selected = t.includes(xt(s));
    return;
  }
  for (s of e.options) {
    var a = xt(s);
    if (_s(a, t)) {
      s.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function qs(e) {
  var t = new MutationObserver(() => {
    kn(e, e.__value);
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
  }), ln(() => {
    t.disconnect();
  });
}
function Bs(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet(), a = !0;
  wr(e, "change", (n) => {
    var i = n ? "[selected]" : ":checked", o;
    if (e.multiple)
      o = [].map.call(e.querySelectorAll(i), xt);
    else {
      var l = e.querySelector(i) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      o = l && xt(l);
    }
    r(o), j !== null && s.add(j);
  }), un(() => {
    var n = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        kt ?? j
      );
      if (s.has(i))
        return;
    }
    if (kn(e, n, a), a && n === void 0) {
      var o = e.querySelector(":checked");
      o !== null && (n = xt(o), r(n));
    }
    e.__value = n, a = !1;
  }), qs(e);
}
function xt(e) {
  return "__value" in e ? e.__value : e.value;
}
const Us = /* @__PURE__ */ Symbol("is custom element"), Xs = /* @__PURE__ */ Symbol("is html");
function En(e, t, r, s) {
  var a = Js(e);
  a[t] !== (a[t] = r) && (t === "loading" && (e[Pn] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && $s(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Js(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [Us]: e.nodeName.includes("-"),
      [Xs]: e.namespaceURI === Zn
    }
  );
}
var Yr = /* @__PURE__ */ new Map();
function $s(e) {
  var t = e.getAttribute("is") || e.nodeName, r = Yr.get(t);
  if (r) return r;
  Yr.set(t, r = []);
  for (var s, a = e, n = Element.prototype; n !== a; ) {
    s = Tn(a);
    for (var i in s)
      s[i].set && r.push(i);
    a = Lr(a);
  }
  return r;
}
function rr(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet();
  wr(e, "input", async (a) => {
    var n = a ? e.defaultValue : e.value;
    if (n = nr(e) ? sr(n) : n, r(n), j !== null && s.add(j), await Ts(), n !== (n = t())) {
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
  Pt(t) == null && e.value && (r(nr(e) ? sr(e.value) : e.value), j !== null && s.add(j)), Zt(() => {
    var a = t();
    if (e === document.activeElement) {
      var n = (
        /** @type {Batch} */
        kt ?? j
      );
      if (s.has(n))
        return;
    }
    nr(e) && a === sr(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
function Vs(e, t, r = t) {
  wr(e, "change", (s) => {
    var a = s ? e.defaultChecked : e.checked;
    r(a);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  // If defaultChecked is set, then checked == defaultChecked
  Pt(t) == null && r(e.checked), Zt(() => {
    var s = t();
    e.checked = !!s;
  });
}
function nr(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function sr(e) {
  return e === "" ? null : +e;
}
function Hr(e, t) {
  return e === t || e?.[it] === t;
}
function Ct(e = {}, t, r, s) {
  return un(() => {
    var a, n;
    return Zt(() => {
      a = n, n = [], Pt(() => {
        e !== r(...n) && (t(e, ...n), a && Hr(r(...a), e) && t(null, ...a));
      });
    }), () => {
      Nt(() => {
        n && Hr(r(...n), e) && t(null, ...n);
      });
    };
  }), e;
}
function jr(e, t, r, s) {
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
function Ot(e) {
  fe === null && On(), ys(() => {
    const t = Pt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Ks = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Ks);
function Gs(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var ar = { exports: {} }, Cr;
function Zs() {
  return Cr || (Cr = 1, (function(e) {
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
      function a(M, d, k) {
        var q = M || r, R = d || 0, H = k || !1, L = 0, N;
        function O(A, b) {
          var S;
          if (b) {
            if (S = b.getTime(), H) {
              var v = c(b);
              if (b = new Date(S + v + R), c(b) !== v) {
                var y = c(b);
                b = new Date(S + y + R);
              }
            }
          } else {
            var g = Date.now();
            g > L ? (L = g, N = new Date(L), S = L, H && (N = new Date(L + c(N) + R))) : S = L, b = N;
          }
          return D(A, b, q, S);
        }
        function D(A, b, S, g) {
          for (var v = "", y = null, E = !1, J = A.length, Q = !1, ee = 0; ee < J; ee++) {
            var $ = A.charCodeAt(ee);
            if (E === !0) {
              if ($ === 45) {
                y = "";
                continue;
              } else if ($ === 95) {
                y = " ";
                continue;
              } else if ($ === 48) {
                y = "0";
                continue;
              } else if ($ === 58) {
                Q && T("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), Q = !0;
                continue;
              }
              switch ($) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  v += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  v += S.days[b.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  v += S.months[b.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  v += n(Math.floor(b.getFullYear() / 100), y);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  v += D(S.formats.D, b, S, g);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  v += D(S.formats.F, b, S, g);
                  break;
                // '00'
                // case 'H':
                case 72:
                  v += n(b.getHours(), y);
                  break;
                // '12'
                // case 'I':
                case 73:
                  v += n(o(b.getHours()), y);
                  break;
                // '000'
                // case 'L':
                case 76:
                  v += i(Math.floor(g % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  v += n(b.getMinutes(), y);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  v += b.getHours() < 12 ? S.am : S.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  v += D(S.formats.R, b, S, g);
                  break;
                // '00'
                // case 'S':
                case 83:
                  v += n(b.getSeconds(), y);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  v += D(S.formats.T, b, S, g);
                  break;
                // '00'
                // case 'U':
                case 85:
                  v += n(l(b, "sunday"), y);
                  break;
                // '00'
                // case 'W':
                case 87:
                  v += n(l(b, "monday"), y);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  v += D(S.formats.X, b, S, g);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  v += b.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (H && R === 0)
                    v += "GMT";
                  else {
                    var pe = p(b);
                    v += pe || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  v += S.shortDays[b.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  v += S.shortMonths[b.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  v += D(S.formats.c, b, S, g);
                  break;
                // '01'
                // case 'd':
                case 100:
                  v += n(b.getDate(), y);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  v += n(b.getDate(), y ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  v += S.shortMonths[b.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var me = new Date(b.getFullYear(), 0, 1), U = Math.ceil((b.getTime() - me.getTime()) / (1e3 * 60 * 60 * 24));
                  v += i(U);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  v += n(b.getHours(), y ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  v += n(o(b.getHours()), y ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  v += n(b.getMonth() + 1, y);
                  break;
                // '\n'
                // case 'n':
                case 110:
                  v += `
`;
                  break;
                // '1st'
                // case 'o':
                case 111:
                  var U = b.getDate();
                  S.ordinalSuffixes ? v += String(U) + (S.ordinalSuffixes[U - 1] || f(U)) : v += String(U) + f(U);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  v += b.getHours() < 12 ? S.AM : S.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  v += D(S.formats.r, b, S, g);
                  break;
                // '0'
                // case 's':
                case 115:
                  v += Math.floor(g / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  v += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var U = b.getDay();
                  v += U === 0 ? 7 : U;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  v += D(S.formats.v, b, S, g);
                  break;
                // '4'
                // case 'w':
                case 119:
                  v += b.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  v += D(S.formats.x, b, S, g);
                  break;
                // '70'
                // case 'y':
                case 121:
                  v += n(b.getFullYear() % 100, y);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (H && R === 0)
                    v += Q ? "+00:00" : "+0000";
                  else {
                    var te;
                    R !== 0 ? te = R / (60 * 1e3) : te = -b.getTimezoneOffset();
                    var ge = te < 0 ? "-" : "+", Me = Q ? ":" : "", Se = Math.floor(Math.abs(te / 60)), ke = Math.abs(te % 60);
                    v += ge + n(Se) + Me + n(ke);
                  }
                  break;
                default:
                  E && (v += "%"), v += A[ee];
                  break;
              }
              y = null, E = !1;
              continue;
            }
            if ($ === 37) {
              E = !0;
              continue;
            }
            v += A[ee];
          }
          return v;
        }
        var F = O;
        return F.localize = function(A) {
          return new a(A || q, R, H);
        }, F.localizeByIdentifier = function(A) {
          var b = t[A];
          return b ? F.localize(b) : (T('[WARNING] No locale found with identifier "' + A + '".'), F);
        }, F.timezone = function(A) {
          var b = R, S = H, g = typeof A;
          if (g === "number" || g === "string")
            if (S = !0, g === "string") {
              var v = A[0] === "-" ? -1 : 1, y = parseInt(A.slice(1, 3), 10), E = parseInt(A.slice(3, 5), 10);
              b = v * (60 * y + E) * 60 * 1e3;
            } else g === "number" && (b = A * 60 * 1e3);
          return new a(q, b, S);
        }, F.utc = function() {
          return new a(q, R, !0);
        }, F;
      }
      function n(M, d) {
        return d === "" || M > 9 ? "" + M : (d == null && (d = "0"), d + M);
      }
      function i(M) {
        return M > 99 ? M : M > 9 ? "0" + M : "00" + M;
      }
      function o(M) {
        return M === 0 ? 12 : M > 12 ? M - 12 : M;
      }
      function l(M, d) {
        d = d || "sunday";
        var k = M.getDay();
        d === "monday" && (k === 0 ? k = 6 : k--);
        var q = Date.UTC(M.getFullYear(), 0, 1), R = Date.UTC(M.getFullYear(), M.getMonth(), M.getDate()), H = Math.floor((R - q) / 864e5), L = (H + 7 - k) / 7;
        return Math.floor(L);
      }
      function f(M) {
        var d = M % 10, k = M % 100;
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
      function c(M) {
        return (M.getTimezoneOffset() || 0) * 6e4;
      }
      function p(M, d) {
        return h() || m(M);
      }
      function h(M, d) {
        return null;
      }
      function m(M) {
        var d = M.toString().match(/\(([\w\s]+)\)/);
        return d && d[1];
      }
      function T(M) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(M);
      }
    })();
  })(ar)), ar.exports;
}
var Ws = Zs();
const at = /* @__PURE__ */ Gs(Ws);
var Qs = /* @__PURE__ */ X('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), ea = /* @__PURE__ */ X('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><span> </span></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), ta = /* @__PURE__ */ X('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), ra = /* @__PURE__ */ X('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), na = /* @__PURE__ */ X('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4"> </h2> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">前へ</button> <span class="svelte-13s7gu4"> </span> <button class="svelte-13s7gu4">次へ</button></div></div> <div><!></div></div>');
function sa(e, t) {
  dt(t, !0);
  let r = /* @__PURE__ */ C(be([])), s = /* @__PURE__ */ C(0), a = /* @__PURE__ */ C(0), n = 50, i = /* @__PURE__ */ C(!0);
  async function o() {
    x(i, !0);
    try {
      const A = await (await fetch(`/admin/api/entries?limit=${n}&offset=${u(a)}`)).json();
      x(r, A.entries || [], !0), x(s, A.total || 0, !0);
    } catch (F) {
      console.error(F);
    } finally {
      x(i, !1);
    }
  }
  Ot(o);
  function l() {
    u(a) + n < u(s) && (x(a, u(a) + n), o());
  }
  function f() {
    u(a) - n >= 0 && (x(a, u(a) - n), o());
  }
  function c(F) {
    return F ? at("%y/%m/%d %H:%M", new Date(F)) : "-";
  }
  var p = na(), h = _(p), m = _(h), T = _(m), M = w(m, 2), d = _(M);
  d.__click = f;
  var k = w(d, 2), q = _(k), R = w(k, 2);
  R.__click = l;
  var H = w(h, 2);
  let L;
  var N = _(H);
  {
    var O = (F) => {
      var A = Qs();
      B(F, A);
    }, D = (F) => {
      var A = ra(), b = ct(A), S = w(_(b));
      $t(S, 21, () => u(r), Jt, (y, E) => {
        var J = ea(), Q = _(J), ee = _(Q), $ = w(Q), pe = _($), me = w($), U = _(me), te = _(U), ge = w(me), Me = _(ge), Se = _(Me), ke = w(Me, 2), ie = _(ke), Ee = _(ie), je = w(ge), pt = _(je), De = w(je), mt = _(De), Qe = w(De), gt = _(Qe), Ce = w(Qe), et = _(Ce), bt = w(Ce), tt = _(bt);
        tt.__click = () => t.onEdit(u(E).id), we(
          (rt, wt, yt) => {
            P(ee, u(E).id), P(pe, u(E).date), Xe(U, 1, `status status-${u(E).status ?? ""}`, "svelte-13s7gu4"), P(te, u(E).status), P(Se, u(E).title), En(ie, "href", `/${u(E).path ?? ""}`), P(Ee, `/${u(E).path ?? ""}`), P(pt, u(E).format), P(mt, rt), P(gt, wt), P(et, yt);
          },
          [
            () => c(u(E).created_at),
            () => c(u(E).modified_at),
            () => u(E).publish_at?.Valid ? c(u(E).publish_at.Time) : "-"
          ]
        ), B(y, J);
      });
      var g = w(b, 2);
      {
        var v = (y) => {
          var E = ta();
          B(y, E);
        };
        ne(g, (y) => {
          u(i) && y(v);
        });
      }
      B(F, A);
    };
    ne(N, (F) => {
      u(i) && u(r).length === 0 ? F(O) : F(D, !1);
    });
  }
  we(
    (F) => {
      P(T, `エントリ一覧 (${u(s) ?? ""})`), d.disabled = u(a) === 0 || u(i), P(q, `${u(a) + 1} - ${F ?? ""} / ${u(s) ?? ""}`), R.disabled = u(a) + n >= u(s) || u(i), L = Xe(H, 1, "table-container svelte-13s7gu4", null, L, { "is-loading": u(i) });
    },
    [() => Math.min(u(a) + n, u(s))]
  ), B(e, p), ht();
}
Wt(["click"]);
var aa = /* @__PURE__ */ X('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), ia = /* @__PURE__ */ X('<option class="svelte-7nstam"> </option>'), la = /* @__PURE__ */ X('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), oa = /* @__PURE__ */ X('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), ua = /* @__PURE__ */ X('<button id="restore" type="button" class="submit-button svelte-7nstam">復元...</button>'), fa = /* @__PURE__ */ X('<div class="tag-item svelte-7nstam"> </div>'), ca = /* @__PURE__ */ X('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam">📷 写真</button> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons svelte-7nstam"><div class="options svelte-7nstam"><label title="チェックを入れると指定した日時に公開されます（公開済みの記事も予約に戻せます）" class="svelte-7nstam"><input type="checkbox" class="svelte-7nstam"/> 公開を遅延</label> <!></div> <button type="button" class="submit-button svelte-7nstam"> </button> <!></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog>', 1);
function va(e, t) {
  dt(t, !0);
  let r = jr(t, "sk", 3, ""), s = jr(t, "id", 3, null), a = /* @__PURE__ */ C(be({ id: null, title: "", body: "", status: null })), n = be({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: "public",
    publishLater: !1,
    publishAt: ""
  }), i = /* @__PURE__ */ C(!1), o = /* @__PURE__ */ C(!1), l = /* @__PURE__ */ C(""), f = /* @__PURE__ */ C(null), c = /* @__PURE__ */ C(null), p = /* @__PURE__ */ C(null), h = /* @__PURE__ */ C(null), m = /* @__PURE__ */ C(null);
  async function T(g) {
    x(o, !0);
    try {
      const v = await fetch(`/admin/api/entry/${g}`);
      if (!v.ok) throw new Error("Failed to fetch entry");
      const y = await v.json();
      x(a, y, !0), n.id = y.id, n.title = y.title, n.body = y.body, n.format = y.format || "Hatena", n.status = y.status, n.publishLater = y.status === "scheduled", y.publish_at?.Valid ? n.publishAt = at("%Y-%m-%dT%H:%M", new Date(y.publish_at.Time)) : n.publishAt = at("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), M();
    } catch (v) {
      console.error(v), alert("エントリの取得に失敗しました");
    } finally {
      x(o, !1);
    }
  }
  Ot(() => {
    s() ? T(s()) : (x(a, { id: null, title: "", body: "", status: "public" }, !0), n.id = null, n.title = "", n.body = "", n.format = "Hatena", n.status = "public", n.publishLater = !1, n.publishAt = at("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), M());
    const g = setInterval(d, 3e3);
    return () => clearInterval(g);
  });
  function M() {
    if (!u(a).id && u(a).id !== null) return;
    const g = `nogag-backup-${u(a).id || "new"}`, v = localStorage.getItem(g);
    if (v) {
      const y = JSON.parse(v);
      (u(a).title !== y.title || u(a).body !== y.body) && x(f, y, !0);
    }
  }
  function d() {
    if (u(a).title !== n.title || u(a).body !== n.body) {
      const g = `nogag-backup-${u(a).id || "new"}`, v = { title: n.title, body: n.body, time: Date.now() };
      localStorage.setItem(g, JSON.stringify(v)), x(f, null);
    }
  }
  async function k() {
    x(i, !0), x(l, "リクエスト中");
    const g = new FormData();
    if (g.set("id", n.id ? String(n.id) : ""), g.set("title", n.title), g.set("body", n.body), g.set("format", n.format), g.set("sk", r()), n.publishLater) {
      const v = new Date(n.publishAt);
      g.set("publish_at", v.toISOString()), g.set("status", "scheduled");
    } else
      g.set("status", "public");
    try {
      const E = (await (await fetch("/admin/api/edit", {
        method: "POST",
        headers: { "X-Requested-With": "fetch" },
        body: g
      })).json()).session_id;
      if (!E)
        throw new Error("保存に失敗しました");
      q(E);
    } catch (v) {
      x(i, !1), alert(v instanceof Error ? v.message : "エラーが発生しました");
    }
  }
  function q(g) {
    const v = new EventSource(`/admin/api/edit/progress?sid=${g}`);
    v.onmessage = (y) => {
      const E = JSON.parse(y.data);
      switch (E.type) {
        case "progress":
          x(l, R(E.message), !0);
          break;
        case "done":
          localStorage.removeItem(`nogag-backup-${u(a).id || "new"}`), x(l, "完了"), x(i, !1), v.close(), t.onSave(E.location);
          break;
        case "error":
          x(l, "エラー: " + E.message), x(i, !1), v.close(), alert("保存に失敗しました: " + E.message);
          break;
      }
    }, v.onerror = () => {
      x(i, !1), v.close(), alert("通信エラーが発生しました");
    };
  }
  function R(g) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[g] || g;
  }
  function H(g) {
    n.title = `[${g}]${n.title}`, u(h).close(), u(c).focus();
  }
  function L() {
    u(f) && (n.title = u(f).title, n.body = u(f).body, u(m).close());
  }
  async function N() {
    const g = document.createElement("input");
    g.type = "file", g.oninput = async () => {
      if (!g.files?.[0]) return;
      const v = new FormData();
      v.append("file", g.files[0]), v.append("sk", r());
      try {
        const E = await (await fetch("/admin/api/upload/image", {
          method: "POST",
          headers: { "X-Requested-With": "fetch" },
          body: v
        })).json(), J = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${E.uploaded}" class="picasa" itemprop="url"><img src="${E.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        O(J, !0);
      } catch {
        alert("アップロードに失敗しました");
      }
    }, g.click();
  }
  function O(g, v = !1) {
    const y = u(p).selectionStart, E = u(p).selectionEnd, J = u(p).value;
    n.body = J.substring(0, y) + g + J.substring(E), setTimeout(
      () => {
        typeof v == "boolean" && v ? (u(p).selectionStart = y, u(p).selectionEnd = y + g.length) : typeof v == "number" ? u(p).selectionStart = u(p).selectionEnd = y + v : u(p).selectionStart = u(p).selectionEnd = y + g.length, u(p).focus();
      },
      0
    );
  }
  function D(g) {
    (g.altKey ? "Alt-" : "") + (g.ctrlKey ? "Control-" : "") + (g.metaKey ? "Meta-" : "") + (g.shiftKey ? "Shift-" : "") + g.key === "Control-t" && (O("\\(  \\)", 3), g.preventDefault(), g.stopPropagation());
  }
  var F = Xt(), A = ct(F);
  {
    var b = (g) => {
      var v = aa();
      B(g, v);
    }, S = (g) => {
      var v = ca(), y = ct(v), E = _(y), J = _(E);
      Ct(J, (I) => x(c, I), () => u(c));
      var Q = w(J, 2), ee = _(Q);
      ee.__click = () => u(h).showModal();
      var $ = w(ee, 2);
      $.__click = N;
      var pe = w($, 2);
      $t(pe, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], Jt, (I, V) => {
        var ce = ia(), tr = _(ce), Sr = {};
        we(() => {
          P(tr, V), Sr !== (Sr = V) && (ce.value = (ce.__value = V) ?? "");
        }), B(I, ce);
      });
      var me = w(Q, 2), U = _(me);
      U.__keydown = D, Ct(U, (I) => x(p, I), () => u(p));
      var te = w(E, 2), ge = _(te);
      {
        var Me = (I) => {
          var V = la();
          B(I, V);
        };
        ne(ge, (I) => {
          u(i) && I(Me);
        });
      }
      var Se = w(ge, 2), ke = _(Se), ie = _(ke), Ee = _(ie), je = w(ie, 2);
      {
        var pt = (I) => {
          var V = oa();
          rr(V, () => n.publishAt, (ce) => n.publishAt = ce), B(I, V);
        };
        ne(je, (I) => {
          n.publishLater && I(pt);
        });
      }
      var De = w(ke, 2);
      De.__click = k;
      var mt = _(De), Qe = w(De, 2);
      {
        var gt = (I) => {
          var V = ua();
          V.__click = () => u(m).showModal(), B(I, V);
        };
        ne(Qe, (I) => {
          u(f) && I(gt);
        });
      }
      var Ce = w(y, 2), et = w(_(Ce), 2);
      $t(
        et,
        20,
        () => [
          "tech",
          "photo",
          "redeveloped",
          "stablediffusion",
          "photoshopped"
        ],
        Jt,
        (I, V) => {
          var ce = fa();
          ce.__click = () => H(V);
          var tr = _(ce);
          we(() => P(tr, V)), B(I, ce);
        }
      );
      var bt = w(et, 2);
      bt.__click = () => u(h).close(), Ct(Ce, (I) => x(h, I), () => u(h));
      var tt = w(Ce, 2), rt = w(_(tt), 2), wt = _(rt);
      {
        var yt = (I) => {
          var V = Is();
          we((ce) => P(V, ce), [
            () => at("%Y年%m月%d日%H時", new Date(u(f).time))
          ]), B(I, V);
        };
        ne(wt, (I) => {
          u(f) && I(yt);
        });
      }
      var Qt = w(rt, 2), Yt = _(Qt);
      Yt.__click = () => u(m).close();
      var er = w(Yt, 2);
      er.__click = L, Ct(tt, (I) => x(m, I), () => u(m)), we(() => {
        De.disabled = u(i), P(mt, u(i) ? u(l) || "リクエスト中" : "更新");
      }), rr(J, () => n.title, (I) => n.title = I), Bs(pe, () => n.format, (I) => n.format = I), rr(U, () => n.body, (I) => n.body = I), Vs(Ee, () => n.publishLater, (I) => n.publishLater = I), B(g, v);
    };
    ne(A, (g) => {
      u(o) ? g(b) : g(S, !1);
    });
  }
  B(e, F), ht();
}
Wt(["click", "keydown"]);
var da = /* @__PURE__ */ X('<div class="loading svelte-1r6codn"></div>'), ha = /* @__PURE__ */ X('<div class="error-text svelte-1r6codn"> </div>'), _a = /* @__PURE__ */ X('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><span> </span></td><td class="svelte-1r6codn"> </td><td class="time svelte-1r6codn"> </td><td class="error svelte-1r6codn"><!></td></tr>'), pa = /* @__PURE__ */ X('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), ma = /* @__PURE__ */ X('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">前へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">次へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function ga(e, t) {
  dt(t, !0);
  let r = /* @__PURE__ */ C(be([])), s = /* @__PURE__ */ C(0), a = /* @__PURE__ */ C(0), n = 50, i = /* @__PURE__ */ C(!0);
  async function o() {
    x(i, !0);
    try {
      const F = await (await fetch(`/admin/api/jobs?limit=${n}&offset=${u(a)}`)).json();
      x(r, F.jobs || [], !0), x(s, F.total || 0, !0);
    } catch (D) {
      console.error(D);
    } finally {
      x(i, !1);
    }
  }
  Ot(o);
  function l() {
    u(a) + n < u(s) && (x(a, u(a) + n), o());
  }
  function f() {
    u(a) - n >= 0 && (x(a, u(a) - n), o());
  }
  function c(D) {
    return at("%Y-%m-%d %H:%M:%S", new Date(D));
  }
  var p = ma(), h = _(p), m = _(h), T = _(m), M = w(m, 2), d = _(M);
  d.__click = f;
  var k = w(d, 2), q = _(k), R = w(k, 2);
  R.__click = l;
  var H = w(R, 2);
  H.__click = o;
  var L = w(h, 2);
  {
    var N = (D) => {
      var F = da();
      B(D, F);
    }, O = (D) => {
      var F = pa(), A = w(_(F));
      $t(A, 21, () => u(r), Jt, (b, S) => {
        var g = _a(), v = _(g), y = _(v), E = w(v), J = _(E), Q = _(J), ee = w(E), $ = _(ee), pe = _($), me = w(ee), U = _(me), te = w(me), ge = _(te), Me = w(te), Se = _(Me);
        {
          var ke = (ie) => {
            var Ee = ha(), je = _(Ee);
            we(() => {
              En(Ee, "title", u(S).error_message.String), P(je, u(S).error_message.String);
            }), B(ie, Ee);
          };
          ne(Se, (ie) => {
            u(S).error_message?.Valid && ie(ke);
          });
        }
        we(
          (ie) => {
            P(y, u(S).id), P(Q, u(S).job_type_name), Xe($, 1, `status status-${u(S).status ?? ""}`, "svelte-1r6codn"), P(pe, u(S).status), P(U, u(S).retry_count), P(ge, ie);
          },
          [() => c(u(S).created_at)]
        ), B(b, g);
      }), B(D, F);
    };
    ne(L, (D) => {
      u(i) ? D(N) : D(O, !1);
    });
  }
  we(
    (D) => {
      P(T, `ジョブ一覧 (${u(s) ?? ""})`), d.disabled = u(a) === 0 || u(i), P(q, `${u(a) + 1} - ${D ?? ""} / ${u(s) ?? ""}`), R.disabled = u(a) + n >= u(s) || u(i);
    },
    [() => Math.min(u(a) + n, u(s))]
  ), B(e, p), ht();
}
Wt(["click"]);
var ba = /* @__PURE__ */ X('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), wa = /* @__PURE__ */ X('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), ya = /* @__PURE__ */ X('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function Ma(e, t) {
  dt(t, !0);
  let r = /* @__PURE__ */ C(null), s = /* @__PURE__ */ C(!0);
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
  Ot(a);
  function n(c) {
    if (c === 0) return "0 B";
    const p = 1024, h = ["B", "KB", "MB", "GB", "TB"], m = Math.floor(Math.log(c) / Math.log(p));
    return parseFloat((c / Math.pow(p, m)).toFixed(2)) + " " + h[m];
  }
  var i = ya(), o = w(_(i), 2);
  {
    var l = (c) => {
      var p = ba();
      B(c, p);
    }, f = (c) => {
      var p = Xt(), h = ct(p);
      {
        var m = (T) => {
          var M = wa(), d = _(M), k = w(_(d), 2), q = _(k), R = _(q), H = _(R), L = w(_(H)), N = _(L), O = w(H), D = w(_(O)), F = _(D), A = _(F), b = w(d, 2), S = w(_(b), 2), g = _(S), v = _(g), y = _(v), E = w(_(y)), J = _(E), Q = w(y), ee = w(_(Q)), $ = _(ee), pe = w(Q), me = w(_(pe)), U = _(me), te = w(pe), ge = w(_(te)), Me = _(ge), Se = w(te), ke = w(_(Se)), ie = _(ke), Ee = w(Se), je = w(_(Ee)), pt = _(je), De = w(Ee), mt = w(_(De)), Qe = _(mt), gt = w(De), Ce = w(_(gt)), et = _(Ce), bt = w(b, 2), tt = w(_(bt), 2), rt = _(tt);
          we(
            (wt, yt, Qt, Yt, er) => {
              P(N, u(r).is_development), P(A, u(r).app_hash), P(J, u(r).debug_info.go_version), P($, u(r).debug_info.num_goroutine), P(U, wt), P(Me, u(r).debug_info.uptime), P(ie, yt), P(pt, Qt), P(Qe, Yt), P(et, u(r).debug_info.num_gc), P(rt, er);
            },
            [
              () => new Date(u(r).debug_info.start_time).toLocaleString(),
              () => n(u(r).debug_info.mem_alloc),
              () => n(u(r).debug_info.mem_total_alloc),
              () => n(u(r).debug_info.mem_sys),
              () => JSON.stringify(u(r).config, null, 2)
            ]
          ), B(T, M);
        };
        ne(
          h,
          (T) => {
            u(r) && T(m);
          },
          !0
        );
      }
      B(c, p);
    };
    ne(o, (c) => {
      u(s) ? c(l) : c(f, !1);
    });
  }
  B(e, i), ht();
}
var Sa = /* @__PURE__ */ X('<div class="admin-app svelte-1n46o8q"><nav class="sub-nav svelte-1n46o8q"><a href="/admin/">エントリ一覧</a> <a href="/admin/edit">新規作成</a> <a href="/admin/jobs">ジョブ一覧</a> <a href="/admin/info">情報</a></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function ka(e, t) {
  dt(t, !0);
  let r = /* @__PURE__ */ C(be(window.location.pathname)), s = /* @__PURE__ */ C(be(new URLSearchParams(window.location.search))), a = /* @__PURE__ */ C("");
  Ot(() => {
    const N = document.querySelector('meta[name="csrf-token"]');
    N && x(a, N.content, !0);
    const O = () => {
      x(r, window.location.pathname, !0), x(s, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", O), () => window.removeEventListener("popstate", O);
  });
  function n(N, O) {
    O && O.preventDefault(), window.history.pushState({}, "", N), x(r, window.location.pathname, !0), x(s, new URLSearchParams(window.location.search), !0);
  }
  const i = /* @__PURE__ */ xr(() => u(r) === "/admin/edit" ? "edit" : u(r) === "/admin/jobs" ? "jobs" : u(r) === "/admin/info" ? "info" : "list"), o = /* @__PURE__ */ xr(() => u(s).get("id"));
  var l = Sa(), f = _(l), c = _(f);
  c.__click = (N) => n("/admin/", N);
  let p;
  var h = w(c, 2);
  h.__click = (N) => n("/admin/edit", N);
  let m;
  var T = w(h, 2);
  T.__click = (N) => n("/admin/jobs", N);
  let M;
  var d = w(T, 2);
  d.__click = (N) => n("/admin/info", N);
  let k;
  var q = w(f, 2), R = _(q);
  {
    var H = (N) => {
      va(N, {
        get sk() {
          return u(a);
        },
        get id() {
          return u(o);
        },
        onSave: (O) => window.location.href = O
      });
    }, L = (N) => {
      var O = Xt(), D = ct(O);
      {
        var F = (b) => {
          ga(b, {
            get sk() {
              return u(a);
            }
          });
        }, A = (b) => {
          var S = Xt(), g = ct(S);
          {
            var v = (E) => {
              Ma(E, {});
            }, y = (E) => {
              sa(E, {
                get sk() {
                  return u(a);
                },
                onEdit: (J) => n(`/admin/edit?id=${J}`)
              });
            };
            ne(
              g,
              (E) => {
                u(i) === "info" ? E(v) : E(y, !1);
              },
              !0
            );
          }
          B(b, S);
        };
        ne(
          D,
          (b) => {
            u(i) === "jobs" ? b(F) : b(A, !1);
          },
          !0
        );
      }
      B(N, O);
    };
    ne(R, (N) => {
      u(i) === "edit" ? N(H) : N(L, !1);
    });
  }
  we(() => {
    p = Xe(c, 1, "svelte-1n46o8q", null, p, { active: u(i) === "list" }), m = Xe(h, 1, "svelte-1n46o8q", null, m, { active: u(i) === "edit" && !u(o) }), M = Xe(T, 1, "svelte-1n46o8q", null, M, { active: u(i) === "jobs" }), k = Xe(d, 1, "svelte-1n46o8q", null, k, { active: u(i) === "info" });
  }), B(e, l), ht();
}
Wt(["click"]);
const ir = document.getElementById("admin-root");
ir && (ir.innerHTML = "", Ps(ka, { target: ir }));
//# sourceMappingURL=admin-front.js.map
