var Tr = Array.isArray, an = Array.prototype.indexOf, sr = Array.from, ln = Object.defineProperty, rt = Object.getOwnPropertyDescriptor, on = Object.getOwnPropertyDescriptors, un = Object.prototype, fn = Array.prototype, ns = Object.getPrototypeOf, zr = Object.isExtensible;
function It(e) {
  return typeof e == "function";
}
const nr = () => {
};
function cn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function as() {
  var e, t, r = new Promise((s, a) => {
    e = s, t = a;
  });
  return { promise: r, resolve: e, reject: t };
}
function is(e, t, r = !1) {
  return e === void 0 ? r ? (
    /** @type {() => V} */
    t()
  ) : (
    /** @type {V} */
    t
  ) : e;
}
const ae = 2, Ar = 4, Fr = 8, vn = 1 << 24, qe = 16, $e = 32, vt = 64, ar = 128, Pe = 512, le = 1024, ye = 2048, Oe = 4096, we = 8192, Ve = 16384, Pr = 32768, ot = 65536, Ur = 1 << 17, ls = 1 << 18, St = 1 << 19, dn = 1 << 20, He = 1 << 25, ut = 32768, Mr = 1 << 21, Ir = 1 << 22, Ge = 1 << 23, st = /* @__PURE__ */ Symbol("$state"), hn = /* @__PURE__ */ Symbol("legacy props"), _n = /* @__PURE__ */ Symbol(""), gt = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function pn(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function mn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function gn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function bn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function wn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function yn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function xn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Mn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Sn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function kn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const En = 1, Dn = 2, os = 4, Tn = 8, An = 16, Fn = 1, Pn = 2, ie = /* @__PURE__ */ Symbol(), In = "http://www.w3.org/1999/xhtml";
function Nn() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Rn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function us(e) {
  return e === this.v;
}
function On(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function fs(e) {
  return !On(e, this.v);
}
let xe = null;
function wt(e) {
  xe = e;
}
function dt(e, t = !1, r) {
  xe = {
    p: xe,
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
    xe
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var s of r)
      Es(s);
  }
  return t.i = !0, xe = t.p, /** @type {T} */
  {};
}
function cs() {
  return !0;
}
let tt = [];
function vs() {
  var e = tt;
  tt = [], cn(e);
}
function kt(e) {
  if (tt.length === 0 && !Yt) {
    var t = tt;
    queueMicrotask(() => {
      t === tt && vs();
    });
  }
  tt.push(e);
}
function Yn() {
  for (; tt.length > 0; )
    vs();
}
function ds(e) {
  var t = B;
  if (t === null)
    return q.f |= Ge, e;
  if ((t.f & Pr) === 0) {
    if ((t.f & ar) === 0)
      throw e;
    t.b.error(e);
  } else
    yt(e, t);
}
function yt(e, t) {
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
const Kt = /* @__PURE__ */ new Set();
let $ = null, Ot = null, De = null, ke = [], ir = null, Sr = !1, Yt = !1;
class Ne {
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
    ke = [], Ot = null, this.apply();
    var r = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: []
    };
    for (const s of t)
      this.#i(s, r);
    this.is_fork || this.#f(), this.is_deferred() ? (this.#l(r.effects), this.#l(r.render_effects)) : (Ot = this, $ = null, Br(r.render_effects), Br(r.effects), Ot = null, this.#o?.resolve()), De = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {EffectTarget} target
   */
  #i(t, r) {
    t.f ^= le;
    for (var s = t.first; s !== null; ) {
      var a = s.f, n = (a & ($e | vt)) !== 0, l = n && (a & le) !== 0, u = l || (a & we) !== 0 || this.skipped_effects.has(s);
      if ((s.f & ar) !== 0 && s.b?.is_pending() && (r = {
        parent: r,
        effect: s,
        effects: [],
        render_effects: []
      }), !u && s.fn !== null) {
        n ? s.f ^= le : (a & Ar) !== 0 ? r.effects.push(s) : zt(s) && ((s.f & qe) !== 0 && this.#a.add(s), qt(s));
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
      (r.f & ye) !== 0 ? this.#a.add(r) : (r.f & Oe) !== 0 && this.#n.add(r), this.#u(r.deps), oe(r, le);
  }
  /**
   * @param {Value[] | null} deps
   */
  #u(t) {
    if (t !== null)
      for (const r of t)
        (r.f & ae) === 0 || (r.f & ut) === 0 || (r.f ^= ut, this.#u(
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
    this.previous.has(t) || this.previous.set(t, r), (t.f & Ge) === 0 && (this.current.set(t, t.v), De?.set(t, t.v));
  }
  activate() {
    $ = this, this.apply();
  }
  deactivate() {
    $ === this && ($ = null, De = null);
  }
  flush() {
    if (this.activate(), ke.length > 0) {
      if (hs(), $ !== null && $ !== this)
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
      var t = De, r = !0, s = {
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
          var a = ke;
          ke = [];
          const o = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
          for (const d of l)
            _s(d, u, o, f);
          if (ke.length > 0) {
            $ = n, n.apply();
            for (const d of ke)
              n.#i(d, s);
            n.deactivate();
          }
          ke = a;
        }
      }
      $ = null, De = t;
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
      this.#n.delete(t), oe(t, ye), ft(t);
    for (const t of this.#n)
      oe(t, Oe), ft(t);
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
    return (this.#o ??= as()).promise;
  }
  static ensure() {
    if ($ === null) {
      const t = $ = new Ne();
      Kt.add($), Yt || Ne.enqueue(() => {
        $ === t && t.flush();
      });
    }
    return $;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    kt(t);
  }
  apply() {
  }
}
function Ln(e) {
  var t = Yt;
  Yt = !0;
  try {
    for (var r; ; ) {
      if (Yn(), ke.length === 0 && ($?.flush(), ke.length === 0))
        return ir = null, /** @type {T} */
        r;
      hs();
    }
  } finally {
    Yt = t;
  }
}
function hs() {
  var e = at;
  Sr = !0;
  var t = null;
  try {
    var r = 0;
    for (er(!0); ke.length > 0; ) {
      var s = Ne.ensure();
      if (r++ > 1e3) {
        var a, n;
        Hn();
      }
      s.process(ke), Ke.clear();
    }
  } finally {
    Sr = !1, er(e), ir = null;
  }
}
function Hn() {
  try {
    yn();
  } catch (e) {
    yt(e, ir);
  }
}
let Le = null;
function Br(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var s = e[r++];
      if ((s.f & (Ve | we)) === 0 && zt(s) && (Le = /* @__PURE__ */ new Set(), qt(s), s.deps === null && s.first === null && s.nodes === null && (s.teardown === null && s.ac === null ? Fs(s) : s.fn = null), Le?.size > 0)) {
        Ke.clear();
        for (const a of Le) {
          if ((a.f & (Ve | we)) !== 0) continue;
          const n = [a];
          let l = a.parent;
          for (; l !== null; )
            Le.has(l) && (Le.delete(l), n.push(l)), l = l.parent;
          for (let u = n.length - 1; u >= 0; u--) {
            const o = n[u];
            (o.f & (Ve | we)) === 0 && qt(o);
          }
        }
        Le.clear();
      }
    }
    Le = null;
  }
}
function _s(e, t, r, s) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const a of e.reactions) {
      const n = a.f;
      (n & ae) !== 0 ? _s(
        /** @type {Derived} */
        a,
        t,
        r,
        s
      ) : (n & (Ir | qe)) !== 0 && (n & ye) === 0 && ps(a, t, s) && (oe(a, ye), ft(
        /** @type {Effect} */
        a
      ));
    }
}
function ps(e, t, r) {
  const s = r.get(e);
  if (s !== void 0) return s;
  if (e.deps !== null)
    for (const a of e.deps) {
      if (t.includes(a))
        return !0;
      if ((a.f & ae) !== 0 && ps(
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
function ft(e) {
  for (var t = ir = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Sr && t === B && (r & qe) !== 0 && (r & ls) === 0)
      return;
    if ((r & (vt | $e)) !== 0) {
      if ((r & le) === 0) return;
      t.f ^= le;
    }
  }
  ke.push(t);
}
function Cn(e) {
  let t = 0, r = ct(0), s;
  return () => {
    Ct() && (i(r), or(() => (t === 0 && (s = Ut(() => e(() => Lt(r)))), t += 1, () => {
      kt(() => {
        t -= 1, t === 0 && (s?.(), s = void 0, Lt(r));
      });
    })));
  };
}
var jn = ot | St | ar;
function qn(e, t, r) {
  new $n(e, t, r);
}
class $n {
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
  #b = Cn(() => (this.#d = ct(this.#c), () => {
    this.#d = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, s) {
    this.#t = t, this.#r = r, this.#o = s, this.parent = /** @type {Effect} */
    B.b, this.#e = !!this.#r.pending, this.#a = ur(() => {
      B.b = this;
      {
        var a = this.#m();
        try {
          this.#n = Ee(() => s(a));
        } catch (n) {
          this.error(n);
        }
        this.#v > 0 ? this.#p() : this.#e = !1;
      }
      return () => {
        this.#f?.remove();
      };
    }, jn);
  }
  #w() {
    try {
      this.#n = Ee(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
    this.#e = !1;
  }
  #y() {
    const t = this.#r.pending;
    t && (this.#i = Ee(() => t(this.#t)), Ne.enqueue(() => {
      var r = this.#m();
      this.#n = this.#_(() => (Ne.ensure(), Ee(() => this.#o(r)))), this.#v > 0 ? this.#p() : (nt(
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
    return this.#e && (this.#f = Ce(), this.#t.before(this.#f), t = this.#f), t;
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
    var r = B, s = q, a = xe;
    Ye(this.#a), _e(this.#a), wt(this.#a.ctx);
    try {
      return t();
    } catch (n) {
      return ds(n), null;
    } finally {
      Ye(r), _e(s), wt(a);
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
    ), Ns(this.#n, this.#u)), this.#i === null && (this.#i = Ee(() => t(this.#t)));
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
    this.#v += t, this.#v === 0 && (this.#e = !1, this.#i && nt(this.#i, () => {
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
    this.#g(t), this.#c += t, this.#d && xt(this.#d, this.#c);
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
    this.#n && (pe(this.#n), this.#n = null), this.#i && (pe(this.#i), this.#i = null), this.#l && (pe(this.#l), this.#l = null);
    var a = !1, n = !1;
    const l = () => {
      if (a) {
        Rn();
        return;
      }
      a = !0, n && kn(), Ne.ensure(), this.#c = 0, this.#l !== null && nt(this.#l, () => {
        this.#l = null;
      }), this.#e = this.has_pending_snippet(), this.#n = this.#_(() => (this.#h = !1, Ee(() => this.#o(this.#t)))), this.#v > 0 ? this.#p() : this.#e = !1;
    };
    var u = q;
    try {
      _e(null), n = !0, r?.(t, l), n = !1;
    } catch (o) {
      yt(o, this.#a && this.#a.parent);
    } finally {
      _e(u);
    }
    s && kt(() => {
      this.#l = this.#_(() => {
        Ne.ensure(), this.#h = !0;
        try {
          return Ee(() => {
            s(
              this.#t,
              () => t,
              () => l
            );
          });
        } catch (o) {
          return yt(
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
function zn(e, t, r, s) {
  const a = Nr;
  if (r.length === 0 && e.length === 0) {
    s(t.map(a));
    return;
  }
  var n = $, l = (
    /** @type {Effect} */
    B
  ), u = Un();
  function o() {
    Promise.all(r.map((f) => /* @__PURE__ */ Bn(f))).then((f) => {
      u();
      try {
        s([...t.map(a), ...f]);
      } catch (d) {
        (l.f & Ve) === 0 && yt(d, l);
      }
      n?.deactivate(), Zt();
    }).catch((f) => {
      yt(f, l);
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
function Un() {
  var e = B, t = q, r = xe, s = $;
  return function(n = !0) {
    Ye(e), _e(t), wt(r), n && s?.activate();
  };
}
function Zt() {
  Ye(null), _e(null), wt(null);
}
// @__NO_SIDE_EFFECTS__
function Nr(e) {
  var t = ae | ye, r = q !== null && (q.f & ae) !== 0 ? (
    /** @type {Derived} */
    q
  ) : null;
  return B !== null && (B.f |= St), {
    ctx: xe,
    deps: null,
    effects: null,
    equals: us,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ie
    ),
    wv: 0,
    parent: r ?? B,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Bn(e, t) {
  let r = (
    /** @type {Effect | null} */
    B
  );
  r === null && mn();
  var s = (
    /** @type {Boundary} */
    r.b
  ), a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), n = ct(
    /** @type {V} */
    ie
  ), l = !q, u = /* @__PURE__ */ new Map();
  return ra(() => {
    var o = as();
    a = o.promise;
    try {
      Promise.resolve(e()).then(o.resolve, o.reject).then(() => {
        f === $ && f.committed && f.deactivate(), Zt();
      });
    } catch (_) {
      o.reject(_), Zt();
    }
    var f = (
      /** @type {Batch} */
      $
    );
    if (l) {
      var d = !s.is_pending();
      s.update_pending_count(1), f.increment(d), u.get(f)?.reject(gt), u.delete(f), u.set(f, o);
    }
    const w = (_, m = void 0) => {
      if (f.activate(), m)
        m !== gt && (n.f |= Ge, xt(n, m));
      else {
        (n.f & Ge) !== 0 && (n.f ^= Ge), xt(n, _);
        for (const [A, b] of u) {
          if (u.delete(A), A === f) break;
          b.reject(gt);
        }
      }
      l && (s.update_pending_count(-1), f.decrement(d));
    };
    o.promise.then(w, (_) => w(null, _ || "unknown"));
  }), Lr(() => {
    for (const o of u.values())
      o.reject(gt);
  }), new Promise((o) => {
    function f(d) {
      function w() {
        d === a ? o(n) : f(a);
      }
      d.then(w, w);
    }
    f(a);
  });
}
// @__NO_SIDE_EFFECTS__
function Jr(e) {
  const t = /* @__PURE__ */ Nr(e);
  return Rs(t), t;
}
// @__NO_SIDE_EFFECTS__
function Rr(e) {
  const t = /* @__PURE__ */ Nr(e);
  return t.equals = fs, t;
}
function ms(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      pe(
        /** @type {Effect} */
        t[r]
      );
  }
}
function Jn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & ae) === 0)
      return (t.f & Ve) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Or(e) {
  var t, r = B;
  Ye(Jn(e));
  try {
    e.f &= ~ut, ms(e), t = Hs(e);
  } finally {
    Ye(r);
  }
  return t;
}
function gs(e) {
  var t = Or(e);
  if (e.equals(t) || ($?.is_fork || (e.v = t), e.wv = Ys()), !Et)
    if (De !== null)
      (Ct() || $?.is_fork) && De.set(e, t);
    else {
      var r = (e.f & Pe) === 0 ? Oe : le;
      oe(e, r);
    }
}
let kr = /* @__PURE__ */ new Set();
const Ke = /* @__PURE__ */ new Map();
let bs = !1;
function ct(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: us,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function O(e, t) {
  const r = ct(e);
  return Rs(r), r;
}
// @__NO_SIDE_EFFECTS__
function Xn(e, t = !1, r = !0) {
  const s = ct(e);
  return t || (s.equals = fs), s;
}
function D(e, t, r = !1) {
  q !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Re || (q.f & Ur) !== 0) && cs() && (q.f & (ae | qe | Ir | Ur)) !== 0 && !je?.includes(e) && Sn();
  let s = r ? he(t) : t;
  return xt(e, s);
}
function xt(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Et ? Ke.set(e, t) : Ke.set(e, r), e.v = t;
    var s = Ne.ensure();
    s.capture(e, r), (e.f & ae) !== 0 && ((e.f & ye) !== 0 && Or(
      /** @type {Derived} */
      e
    ), oe(e, (e.f & Pe) !== 0 ? le : Oe)), e.wv = Ys(), ws(e, ye), B !== null && (B.f & le) !== 0 && (B.f & ($e | vt)) === 0 && (Se === null ? aa([e]) : Se.push(e)), !s.is_fork && kr.size > 0 && !bs && Vn();
  }
  return t;
}
function Vn() {
  bs = !1;
  var e = at;
  er(!0);
  const t = Array.from(kr);
  try {
    for (const r of t)
      (r.f & le) !== 0 && oe(r, Oe), zt(r) && qt(r);
  } finally {
    er(e);
  }
  kr.clear();
}
function Lt(e) {
  D(e, e.v + 1);
}
function ws(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var s = r.length, a = 0; a < s; a++) {
      var n = r[a], l = n.f, u = (l & ye) === 0;
      if (u && oe(n, t), (l & ae) !== 0) {
        var o = (
          /** @type {Derived} */
          n
        );
        De?.delete(o), (l & ut) === 0 && (l & Pe && (n.f |= ut), ws(o, Oe));
      } else u && ((l & qe) !== 0 && Le !== null && Le.add(
        /** @type {Effect} */
        n
      ), ft(
        /** @type {Effect} */
        n
      ));
    }
}
function he(e) {
  if (typeof e != "object" || e === null || st in e)
    return e;
  const t = ns(e);
  if (t !== un && t !== fn)
    return e;
  var r = /* @__PURE__ */ new Map(), s = Tr(e), a = /* @__PURE__ */ O(0), n = it, l = (u) => {
    if (it === n)
      return u();
    var o = q, f = it;
    _e(null), Wr(n);
    var d = u();
    return _e(o), Wr(f), d;
  };
  return s && r.set("length", /* @__PURE__ */ O(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, o, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && xn();
        var d = r.get(o);
        return d === void 0 ? d = l(() => {
          var w = /* @__PURE__ */ O(f.value);
          return r.set(o, w), w;
        }) : D(d, f.value, !0), !0;
      },
      deleteProperty(u, o) {
        var f = r.get(o);
        if (f === void 0) {
          if (o in u) {
            const d = l(() => /* @__PURE__ */ O(ie));
            r.set(o, d), Lt(a);
          }
        } else
          D(f, ie), Lt(a);
        return !0;
      },
      get(u, o, f) {
        if (o === st)
          return e;
        var d = r.get(o), w = o in u;
        if (d === void 0 && (!w || rt(u, o)?.writable) && (d = l(() => {
          var m = he(w ? u[o] : ie), A = /* @__PURE__ */ O(m);
          return A;
        }), r.set(o, d)), d !== void 0) {
          var _ = i(d);
          return _ === ie ? void 0 : _;
        }
        return Reflect.get(u, o, f);
      },
      getOwnPropertyDescriptor(u, o) {
        var f = Reflect.getOwnPropertyDescriptor(u, o);
        if (f && "value" in f) {
          var d = r.get(o);
          d && (f.value = i(d));
        } else if (f === void 0) {
          var w = r.get(o), _ = w?.v;
          if (w !== void 0 && _ !== ie)
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
        if (o === st)
          return !0;
        var f = r.get(o), d = f !== void 0 && f.v !== ie || Reflect.has(u, o);
        if (f !== void 0 || B !== null && (!d || rt(u, o)?.writable)) {
          f === void 0 && (f = l(() => {
            var _ = d ? he(u[o]) : ie, m = /* @__PURE__ */ O(_);
            return m;
          }), r.set(o, f));
          var w = i(f);
          if (w === ie)
            return !1;
        }
        return d;
      },
      set(u, o, f, d) {
        var w = r.get(o), _ = o in u;
        if (s && o === "length")
          for (var m = f; m < /** @type {Source<number>} */
          w.v; m += 1) {
            var A = r.get(m + "");
            A !== void 0 ? D(A, ie) : m in u && (A = l(() => /* @__PURE__ */ O(ie)), r.set(m + "", A));
          }
        if (w === void 0)
          (!_ || rt(u, o)?.writable) && (w = l(() => /* @__PURE__ */ O(void 0)), D(w, he(f)), r.set(o, w));
        else {
          _ = w.v !== ie;
          var b = l(() => he(f));
          D(w, b);
        }
        var v = Reflect.getOwnPropertyDescriptor(u, o);
        if (v?.set && v.set.call(d, f), !_) {
          if (s && typeof o == "string") {
            var x = (
              /** @type {Source<number>} */
              r.get("length")
            ), L = Number(o);
            Number.isInteger(L) && L >= x.v && D(x, L + 1);
          }
          Lt(a);
        }
        return !0;
      },
      ownKeys(u) {
        i(a);
        var o = Reflect.ownKeys(u).filter((w) => {
          var _ = r.get(w);
          return _ === void 0 || _.v !== ie;
        });
        for (var [f, d] of r)
          d.v !== ie && !(f in u) && o.push(f);
        return o;
      },
      setPrototypeOf() {
        Mn();
      }
    }
  );
}
function Xr(e) {
  try {
    if (e !== null && typeof e == "object" && st in e)
      return e[st];
  } catch {
  }
  return e;
}
function Gn(e, t) {
  return Object.is(Xr(e), Xr(t));
}
var Vr, ys, xs, Ms;
function Kn() {
  if (Vr === void 0) {
    Vr = window, ys = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    xs = rt(t, "firstChild").get, Ms = rt(t, "nextSibling").get, zr(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), zr(r) && (r.__t = void 0);
  }
}
function Ce(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Qt(e) {
  return (
    /** @type {TemplateNode | null} */
    xs.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function $t(e) {
  return (
    /** @type {TemplateNode | null} */
    Ms.call(e)
  );
}
function c(e, t) {
  return /* @__PURE__ */ Qt(e);
}
function Mt(e, t = !1) {
  {
    var r = /* @__PURE__ */ Qt(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ $t(r) : r;
  }
}
function h(e, t = 1, r = !1) {
  let s = e;
  for (; t--; )
    s = /** @type {TemplateNode} */
    /* @__PURE__ */ $t(s);
  return s;
}
function Wn(e) {
  e.textContent = "";
}
function Ss() {
  return !1;
}
let Gr = !1;
function Zn() {
  Gr || (Gr = !0, document.addEventListener(
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
  var t = q, r = B;
  _e(null), Ye(null);
  try {
    return e();
  } finally {
    _e(t), Ye(r);
  }
}
function Yr(e, t, r, s = r) {
  e.addEventListener(t, () => lr(r));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), s(!0);
  } : e.__on_r = () => s(!0), Zn();
}
function Qn(e) {
  B === null && (q === null && wn(), bn()), Et && gn();
}
function ea(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function ze(e, t, r) {
  var s = B;
  s !== null && (s.f & we) !== 0 && (e |= we);
  var a = {
    ctx: xe,
    deps: null,
    nodes: null,
    f: e | ye | Pe,
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
      qt(a), a.f |= Pr;
    } catch (u) {
      throw pe(a), u;
    }
  else t !== null && ft(a);
  var n = a;
  if (r && n.deps === null && n.teardown === null && n.nodes === null && n.first === n.last && // either `null`, or a singular child
  (n.f & St) === 0 && (n = n.first, (e & qe) !== 0 && (e & ot) !== 0 && n !== null && (n.f |= ot)), n !== null && (n.parent = s, s !== null && ea(n, s), q !== null && (q.f & ae) !== 0 && (e & vt) === 0)) {
    var l = (
      /** @type {Derived} */
      q
    );
    (l.effects ??= []).push(n);
  }
  return a;
}
function Ct() {
  return q !== null && !Re;
}
function Lr(e) {
  const t = ze(Fr, null, !1);
  return oe(t, le), t.teardown = e, t;
}
function ks(e) {
  Qn();
  var t = (
    /** @type {Effect} */
    B.f
  ), r = !q && (t & $e) !== 0 && (t & Pr) === 0;
  if (r) {
    var s = (
      /** @type {ComponentContext} */
      xe
    );
    (s.e ??= []).push(e);
  } else
    return Es(e);
}
function Es(e) {
  return ze(Ar | dn, e, !1);
}
function ta(e) {
  Ne.ensure();
  const t = ze(vt | St, e, !0);
  return (r = {}) => new Promise((s) => {
    r.outro ? nt(t, () => {
      pe(t), s(void 0);
    }) : (pe(t), s(void 0));
  });
}
function Ds(e) {
  return ze(Ar, e, !1);
}
function ra(e) {
  return ze(Ir | St, e, !0);
}
function or(e, t = 0) {
  return ze(Fr | t, e, !0);
}
function Q(e, t = [], r = [], s = []) {
  zn(s, t, r, (a) => {
    ze(Fr, () => e(...a.map(i)), !0);
  });
}
function ur(e, t = 0) {
  var r = ze(qe | t, e, !0);
  return r;
}
function Ee(e) {
  return ze($e | St, e, !0);
}
function Ts(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Et, s = q;
    Kr(!0), _e(null);
    try {
      t.call(null);
    } finally {
      Kr(r), _e(s);
    }
  }
}
function As(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const a = r.ac;
    a !== null && lr(() => {
      a.abort(gt);
    });
    var s = r.next;
    (r.f & vt) !== 0 ? r.parent = null : pe(r, t), r = s;
  }
}
function sa(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & $e) === 0 && pe(t), t = r;
  }
}
function pe(e, t = !0) {
  var r = !1;
  (t || (e.f & ls) !== 0) && e.nodes !== null && e.nodes.end !== null && (na(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), As(e, t && !r), tr(e, 0), oe(e, Ve);
  var s = e.nodes && e.nodes.t;
  if (s !== null)
    for (const n of s)
      n.stop();
  Ts(e);
  var a = e.parent;
  a !== null && a.first !== null && Fs(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function na(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ $t(e);
    e.remove(), e = r;
  }
}
function Fs(e) {
  var t = e.parent, r = e.prev, s = e.next;
  r !== null && (r.next = s), s !== null && (s.prev = r), t !== null && (t.first === e && (t.first = s), t.last === e && (t.last = r));
}
function nt(e, t, r = !0) {
  var s = [];
  Ps(e, s, !0);
  var a = () => {
    r && pe(e), t && t();
  }, n = s.length;
  if (n > 0) {
    var l = () => --n || a();
    for (var u of s)
      u.out(l);
  } else
    a();
}
function Ps(e, t, r) {
  if ((e.f & we) === 0) {
    e.f ^= we;
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const u of s)
        (u.is_global || r) && t.push(u);
    for (var a = e.first; a !== null; ) {
      var n = a.next, l = (a.f & ot) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (a.f & $e) !== 0 && (e.f & qe) !== 0;
      Ps(a, t, l ? r : !1), a = n;
    }
  }
}
function Hr(e) {
  Is(e, !0);
}
function Is(e, t) {
  if ((e.f & we) !== 0) {
    e.f ^= we, (e.f & le) === 0 && (oe(e, ye), ft(e));
    for (var r = e.first; r !== null; ) {
      var s = r.next, a = (r.f & ot) !== 0 || (r.f & $e) !== 0;
      Is(r, a ? t : !1), r = s;
    }
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const l of n)
        (l.is_global || t) && l.in();
  }
}
function Ns(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end; r !== null; ) {
      var a = r === s ? null : /* @__PURE__ */ $t(r);
      t.append(r), r = a;
    }
}
let at = !1;
function er(e) {
  at = e;
}
let Et = !1;
function Kr(e) {
  Et = e;
}
let q = null, Re = !1;
function _e(e) {
  q = e;
}
let B = null;
function Ye(e) {
  B = e;
}
let je = null;
function Rs(e) {
  q !== null && (je === null ? je = [e] : je.push(e));
}
let fe = null, be = 0, Se = null;
function aa(e) {
  Se = e;
}
let Os = 1, jt = 0, it = jt;
function Wr(e) {
  it = e;
}
function Ys() {
  return ++Os;
}
function zt(e) {
  var t = e.f;
  if ((t & ye) !== 0)
    return !0;
  if (t & ae && (e.f &= ~ut), (t & Oe) !== 0) {
    var r = e.deps;
    if (r !== null)
      for (var s = r.length, a = 0; a < s; a++) {
        var n = r[a];
        if (zt(
          /** @type {Derived} */
          n
        ) && gs(
          /** @type {Derived} */
          n
        ), n.wv > e.wv)
          return !0;
      }
    (t & Pe) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    De === null && oe(e, le);
  }
  return !1;
}
function Ls(e, t, r = !0) {
  var s = e.reactions;
  if (s !== null && !je?.includes(e))
    for (var a = 0; a < s.length; a++) {
      var n = s[a];
      (n.f & ae) !== 0 ? Ls(
        /** @type {Derived} */
        n,
        t,
        !1
      ) : t === n && (r ? oe(n, ye) : (n.f & le) !== 0 && oe(n, Oe), ft(
        /** @type {Effect} */
        n
      ));
    }
}
function Hs(e) {
  var t = fe, r = be, s = Se, a = q, n = je, l = xe, u = Re, o = it, f = e.f;
  fe = /** @type {null | Value[]} */
  null, be = 0, Se = null, q = (f & ($e | vt)) === 0 ? e : null, je = null, wt(e.ctx), Re = !1, it = ++jt, e.ac !== null && (lr(() => {
    e.ac.abort(gt);
  }), e.ac = null);
  try {
    e.f |= Mr;
    var d = (
      /** @type {Function} */
      e.fn
    ), w = d(), _ = e.deps;
    if (fe !== null) {
      var m;
      if (tr(e, be), _ !== null && be > 0)
        for (_.length = be + fe.length, m = 0; m < fe.length; m++)
          _[be + m] = fe[m];
      else
        e.deps = _ = fe;
      if (Ct() && (e.f & Pe) !== 0)
        for (m = be; m < _.length; m++)
          (_[m].reactions ??= []).push(e);
    } else _ !== null && be < _.length && (tr(e, be), _.length = be);
    if (cs() && Se !== null && !Re && _ !== null && (e.f & (ae | Oe | ye)) === 0)
      for (m = 0; m < /** @type {Source[]} */
      Se.length; m++)
        Ls(
          Se[m],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (jt++, Se !== null && (s === null ? s = Se : s.push(.../** @type {Source[]} */
    Se))), (e.f & Ge) !== 0 && (e.f ^= Ge), w;
  } catch (A) {
    return ds(A);
  } finally {
    e.f ^= Mr, fe = t, be = r, Se = s, q = a, je = n, wt(l), Re = u, it = o;
  }
}
function ia(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var s = an.call(r, e);
    if (s !== -1) {
      var a = r.length - 1;
      a === 0 ? r = t.reactions = null : (r[s] = r[a], r.pop());
    }
  }
  r === null && (t.f & ae) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (fe === null || !fe.includes(t)) && (oe(t, Oe), (t.f & Pe) !== 0 && (t.f ^= Pe, t.f &= ~ut), ms(
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
    for (var s = t; s < r.length; s++)
      ia(e, r[s]);
}
function qt(e) {
  var t = e.f;
  if ((t & Ve) === 0) {
    oe(e, le);
    var r = B, s = at;
    B = e, at = !0;
    try {
      (t & (qe | vn)) !== 0 ? sa(e) : As(e), Ts(e);
      var a = Hs(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = Os;
      var n;
    } finally {
      at = s, B = r;
    }
  }
}
async function Cs() {
  await Promise.resolve(), Ln();
}
function i(e) {
  var t = e.f, r = (t & ae) !== 0;
  if (q !== null && !Re) {
    var s = B !== null && (B.f & Ve) !== 0;
    if (!s && !je?.includes(e)) {
      var a = q.deps;
      if ((q.f & Mr) !== 0)
        e.rv < jt && (e.rv = jt, fe === null && a !== null && a[be] === e ? be++ : fe === null ? fe = [e] : fe.includes(e) || fe.push(e));
      else {
        (q.deps ??= []).push(e);
        var n = e.reactions;
        n === null ? e.reactions = [q] : n.includes(q) || n.push(q);
      }
    }
  }
  if (Et) {
    if (Ke.has(e))
      return Ke.get(e);
    if (r) {
      var l = (
        /** @type {Derived} */
        e
      ), u = l.v;
      return ((l.f & le) === 0 && l.reactions !== null || qs(l)) && (u = Or(l)), Ke.set(l, u), u;
    }
  } else r && (!De?.has(e) || $?.is_fork && !Ct()) && (l = /** @type {Derived} */
  e, zt(l) && gs(l), at && Ct() && (l.f & Pe) === 0 && js(l));
  if (De?.has(e))
    return De.get(e);
  if ((e.f & Ge) !== 0)
    throw e.v;
  return e.v;
}
function js(e) {
  if (e.deps !== null) {
    e.f ^= Pe;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & ae) !== 0 && (t.f & Pe) === 0 && js(
        /** @type {Derived} */
        t
      );
  }
}
function qs(e) {
  if (e.v === ie) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Ke.has(t) || (t.f & ae) !== 0 && qs(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Ut(e) {
  var t = Re;
  try {
    return Re = !0, e();
  } finally {
    Re = t;
  }
}
const la = -7169;
function oe(e, t) {
  e.f = e.f & la | t;
}
const oa = ["touchstart", "touchmove"];
function ua(e) {
  return oa.includes(e);
}
const $s = /* @__PURE__ */ new Set(), Er = /* @__PURE__ */ new Set();
function fa(e, t, r, s = {}) {
  function a(n) {
    if (s.capture || Nt.call(t, n), !n.cancelBubble)
      return lr(() => r?.call(this, n));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? kt(() => {
    t.addEventListener(e, a, s);
  }) : t.addEventListener(e, a, s), a;
}
function ca(e, t, r, s, a) {
  var n = { capture: s, passive: a }, l = fa(e, t, r, n);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Lr(() => {
    t.removeEventListener(e, l, n);
  });
}
function Bt(e) {
  for (var t = 0; t < e.length; t++)
    $s.add(e[t]);
  for (var r of Er)
    r(e);
}
let Zr = null;
function Nt(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), s = e.type, a = e.composedPath?.() || [], n = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Zr = e;
  var l = 0, u = Zr === e && e.__root;
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
    ln(e, "currentTarget", {
      configurable: !0,
      get() {
        return n || r;
      }
    });
    var d = q, w = B;
    _e(null), Ye(null);
    try {
      for (var _, m = []; n !== null; ) {
        var A = n.assignedSlot || n.parentNode || /** @type {any} */
        n.host || null;
        try {
          var b = n["__" + s];
          b != null && (!/** @type {any} */
          n.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === n) && b.call(n, e);
        } catch (v) {
          _ ? m.push(v) : _ = v;
        }
        if (e.cancelBubble || A === t || A === null)
          break;
        n = A;
      }
      if (_) {
        for (let v of m)
          queueMicrotask(() => {
            throw v;
          });
        throw _;
      }
    } finally {
      e.__root = t, delete e.currentTarget, _e(d), Ye(w);
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
    B
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Y(e, t) {
  var r = (t & Fn) !== 0, s = (t & Pn) !== 0, a, n = !e.startsWith("<!>");
  return () => {
    a === void 0 && (a = va(n ? e : "<!>" + e), r || (a = /** @type {TemplateNode} */
    /* @__PURE__ */ Qt(a)));
    var l = (
      /** @type {TemplateNode} */
      s || ys ? document.importNode(a, !0) : a.cloneNode(!0)
    );
    if (r) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Qt(l)
      ), o = (
        /** @type {TemplateNode} */
        l.lastChild
      );
      rr(u, o);
    } else
      rr(l, l);
    return l;
  };
}
function da(e = "") {
  {
    var t = Ce(e + "");
    return rr(t, t), t;
  }
}
function Cr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), r = Ce();
  return e.append(t, r), rr(t, r), e;
}
function I(e, t) {
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
function _a(e, { target: t, anchor: r, props: s = {}, events: a, context: n, intro: l = !0 }) {
  Kn();
  var u = /* @__PURE__ */ new Set(), o = (w) => {
    for (var _ = 0; _ < w.length; _++) {
      var m = w[_];
      if (!u.has(m)) {
        u.add(m);
        var A = ua(m);
        t.addEventListener(m, Nt, { passive: A });
        var b = pt.get(m);
        b === void 0 ? (document.addEventListener(m, Nt, { passive: A }), pt.set(m, 1)) : pt.set(m, b + 1);
      }
    }
  };
  o(sr($s)), Er.add(o);
  var f = void 0, d = ta(() => {
    var w = r ?? t.appendChild(Ce());
    return qn(
      /** @type {TemplateNode} */
      w,
      {
        pending: () => {
        }
      },
      (_) => {
        if (n) {
          dt({});
          var m = (
            /** @type {ComponentContext} */
            xe
          );
          m.c = n;
        }
        a && (s.$$events = a), f = e(_, s) || {}, n && ht();
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
      Er.delete(o), w !== r && w.parentNode?.removeChild(w);
    };
  });
  return pa.set(f, d), f;
}
let pa = /* @__PURE__ */ new WeakMap();
class zs {
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
      $
    );
    if (this.#e.has(t)) {
      var r = (
        /** @type {Key} */
        this.#e.get(t)
      ), s = this.#t.get(r);
      if (s)
        Hr(s), this.#r.delete(r);
      else {
        var a = this.#s.get(r);
        a && (this.#t.set(r, a.effect), this.#s.delete(r), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), s = a.effect);
      }
      for (const [n, l] of this.#e) {
        if (this.#e.delete(n), n === t)
          break;
        const u = this.#s.get(l);
        u && (pe(u.effect), this.#s.delete(l));
      }
      for (const [n, l] of this.#t) {
        if (n === r || this.#r.has(n)) continue;
        const u = () => {
          if (Array.from(this.#e.values()).includes(n)) {
            var f = document.createDocumentFragment();
            Ns(l, f), f.append(Ce()), this.#s.set(n, { effect: l, fragment: f });
          } else
            pe(l);
          this.#r.delete(n), this.#t.delete(n);
        };
        this.#o || !s ? (this.#r.add(n), nt(l, u, !1)) : u();
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
      r.includes(s) || (pe(a.effect), this.#s.delete(s));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, r) {
    var s = (
      /** @type {Batch} */
      $
    ), a = Ss();
    if (r && !this.#t.has(t) && !this.#s.has(t))
      if (a) {
        var n = document.createDocumentFragment(), l = Ce();
        n.append(l), this.#s.set(t, {
          effect: Ee(() => r(l)),
          fragment: n
        });
      } else
        this.#t.set(
          t,
          Ee(() => r(this.anchor))
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
function ce(e, t, r = !1) {
  var s = new zs(e), a = r ? ot : 0;
  function n(l, u) {
    s.ensure(l, u);
  }
  ur(() => {
    var l = !1;
    t((u, o = !0) => {
      l = !0, n(o, u);
    }), l || n(!1, null);
  }, a);
}
function We(e, t) {
  return t;
}
function ma(e, t, r) {
  for (var s = [], a = t.length, n, l = t.length, u = 0; u < a; u++) {
    let w = t[u];
    nt(
      w,
      () => {
        if (n) {
          if (n.pending.delete(w), n.done.add(w), n.pending.size === 0) {
            var _ = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Dr(sr(n.done)), _.delete(n), _.size === 0 && (e.outrogroups = null);
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
      Wn(d), d.append(f), e.items.clear();
    }
    Dr(t, !o);
  } else
    n = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(n);
}
function Dr(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    pe(e[r], t);
}
var Qr;
function Ze(e, t, r, s, a, n = null) {
  var l = e, u = /* @__PURE__ */ new Map(), o = (t & os) !== 0;
  if (o) {
    var f = (
      /** @type {Element} */
      e
    );
    l = f.appendChild(Ce());
  }
  var d = null, w = /* @__PURE__ */ Rr(() => {
    var x = r();
    return Tr(x) ? x : x == null ? [] : sr(x);
  }), _, m = !0;
  function A() {
    v.fallback = d, ga(v, _, l, t, s), d !== null && (_.length === 0 ? (d.f & He) === 0 ? Hr(d) : (d.f ^= He, Rt(d, null, l)) : nt(d, () => {
      d = null;
    }));
  }
  var b = ur(() => {
    _ = /** @type {V[]} */
    i(w);
    for (var x = _.length, L = /* @__PURE__ */ new Set(), P = (
      /** @type {Batch} */
      $
    ), H = Ss(), j = 0; j < x; j += 1) {
      var J = _[j], G = s(J, j), T = m ? null : u.get(G);
      T ? (T.v && xt(T.v, J), T.i && xt(T.i, j), H && P.skipped_effects.delete(T.e)) : (T = ba(
        u,
        m ? l : Qr ??= Ce(),
        J,
        G,
        j,
        a,
        t,
        r
      ), m || (T.e.f |= He), u.set(G, T)), L.add(G);
    }
    if (x === 0 && n && !d && (m ? d = Ee(() => n(l)) : (d = Ee(() => n(Qr ??= Ce())), d.f |= He)), !m)
      if (H) {
        for (const [z, E] of u)
          L.has(z) || P.skipped_effects.add(E.e);
        P.oncommit(A), P.ondiscard(() => {
        });
      } else
        A();
    i(w);
  }), v = { effect: b, items: u, outrogroups: null, fallback: d };
  m = !1;
}
function ga(e, t, r, s, a) {
  var n = (s & Tn) !== 0, l = t.length, u = e.items, o = e.effect.first, f, d = null, w, _ = [], m = [], A, b, v, x;
  if (n)
    for (x = 0; x < l; x += 1)
      A = t[x], b = a(A, x), v = /** @type {EachItem} */
      u.get(b).e, (v.f & He) === 0 && (v.nodes?.a?.measure(), (w ??= /* @__PURE__ */ new Set()).add(v));
  for (x = 0; x < l; x += 1) {
    if (A = t[x], b = a(A, x), v = /** @type {EachItem} */
    u.get(b).e, e.outrogroups !== null)
      for (const E of e.outrogroups)
        E.pending.delete(v), E.done.delete(v);
    if ((v.f & He) !== 0)
      if (v.f ^= He, v === o)
        Rt(v, null, r);
      else {
        var L = d ? d.next : o;
        v === e.effect.last && (e.effect.last = v.prev), v.prev && (v.prev.next = v.next), v.next && (v.next.prev = v.prev), Xe(e, d, v), Xe(e, v, L), Rt(v, L, r), d = v, _ = [], m = [], o = d.next;
        continue;
      }
    if ((v.f & we) !== 0 && (Hr(v), n && (v.nodes?.a?.unfix(), (w ??= /* @__PURE__ */ new Set()).delete(v))), v !== o) {
      if (f !== void 0 && f.has(v)) {
        if (_.length < m.length) {
          var P = m[0], H;
          d = P.prev;
          var j = _[0], J = _[_.length - 1];
          for (H = 0; H < _.length; H += 1)
            Rt(_[H], P, r);
          for (H = 0; H < m.length; H += 1)
            f.delete(m[H]);
          Xe(e, j.prev, J.next), Xe(e, d, j), Xe(e, J, P), o = P, d = J, x -= 1, _ = [], m = [];
        } else
          f.delete(v), Rt(v, o, r), Xe(e, v.prev, v.next), Xe(e, v, d === null ? e.effect.first : d.next), Xe(e, d, v), d = v;
        continue;
      }
      for (_ = [], m = []; o !== null && o !== v; )
        (f ??= /* @__PURE__ */ new Set()).add(o), m.push(o), o = o.next;
      if (o === null)
        continue;
    }
    (v.f & He) === 0 && _.push(v), d = v, o = v.next;
  }
  if (e.outrogroups !== null) {
    for (const E of e.outrogroups)
      E.pending.size === 0 && (Dr(sr(E.done)), e.outrogroups?.delete(E));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || f !== void 0) {
    var G = [];
    if (f !== void 0)
      for (v of f)
        (v.f & we) === 0 && G.push(v);
    for (; o !== null; )
      (o.f & we) === 0 && o !== e.fallback && G.push(o), o = o.next;
    var T = G.length;
    if (T > 0) {
      var z = (s & os) !== 0 && l === 0 ? r : null;
      if (n) {
        for (x = 0; x < T; x += 1)
          G[x].nodes?.a?.measure();
        for (x = 0; x < T; x += 1)
          G[x].nodes?.a?.fix();
      }
      ma(e, G, z);
    }
  }
  n && kt(() => {
    if (w !== void 0)
      for (v of w)
        v.nodes?.a?.apply();
  });
}
function ba(e, t, r, s, a, n, l, u) {
  var o = (l & En) !== 0 ? (l & An) === 0 ? /* @__PURE__ */ Xn(r, !1, !1) : ct(r) : null, f = (l & Dn) !== 0 ? ct(a) : null;
  return {
    v: o,
    i: f,
    e: Ee(() => (n(t, o ?? r, f ?? a, u), () => {
      e.delete(s);
    }))
  };
}
function Rt(e, t, r) {
  if (e.nodes)
    for (var s = e.nodes.start, a = e.nodes.end, n = t && (t.f & He) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; s !== null; ) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ $t(s)
      );
      if (n.before(s), s === a)
        return;
      s = l;
    }
}
function Xe(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
function wa(e, t, r) {
  var s = new zs(e);
  ur(() => {
    var a = t() ?? null;
    s.ensure(a, a && ((n) => r(n, a)));
  }, ot);
}
const es = [...` 	
\r\f \v\uFEFF`];
function ya(e, t, r) {
  var s = e == null ? "" : "" + e;
  if (t && (s = s ? s + " " + t : t), r) {
    for (var a in r)
      if (r[a])
        s = s ? s + " " + a : a;
      else if (s.length)
        for (var n = a.length, l = 0; (l = s.indexOf(a, l)) >= 0; ) {
          var u = l + n;
          (l === 0 || es.includes(s[l - 1])) && (u === s.length || es.includes(s[u])) ? s = (l === 0 ? "" : s.substring(0, l)) + s.substring(u + 1) : l = u;
        }
  }
  return s === "" ? null : s;
}
function lt(e, t, r, s, a, n) {
  var l = e.__className;
  if (l !== r || l === void 0) {
    var u = ya(r, s, n);
    u == null ? e.removeAttribute("class") : e.className = u, e.__className = r;
  } else if (n && a !== n)
    for (var o in n) {
      var f = !!n[o];
      (a == null || f !== !!a[o]) && e.classList.toggle(o, f);
    }
  return n;
}
function Us(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Tr(t))
      return Nn();
    for (var s of e.options)
      s.selected = t.includes(Ht(s));
    return;
  }
  for (s of e.options) {
    var a = Ht(s);
    if (Gn(a, t)) {
      s.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function xa(e) {
  var t = new MutationObserver(() => {
    Us(e, e.__value);
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
function Ma(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet(), a = !0;
  Yr(e, "change", (n) => {
    var l = n ? "[selected]" : ":checked", u;
    if (e.multiple)
      u = [].map.call(e.querySelectorAll(l), Ht);
    else {
      var o = e.querySelector(l) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      u = o && Ht(o);
    }
    r(u), $ !== null && s.add($);
  }), Ds(() => {
    var n = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        Ot ?? $
      );
      if (s.has(l))
        return;
    }
    if (Us(e, n, a), a && n === void 0) {
      var u = e.querySelector(":checked");
      u !== null && (n = Ht(u), r(n));
    }
    e.__value = n, a = !1;
  }), xa(e);
}
function Ht(e) {
  return "__value" in e ? e.__value : e.value;
}
const Sa = /* @__PURE__ */ Symbol("is custom element"), ka = /* @__PURE__ */ Symbol("is html");
function Fe(e, t, r, s) {
  var a = Ea(e);
  a[t] !== (a[t] = r) && (t === "loading" && (e[_n] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Da(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Ea(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [Sa]: e.nodeName.includes("-"),
      [ka]: e.namespaceURI === In
    }
  );
}
var ts = /* @__PURE__ */ new Map();
function Da(e) {
  var t = e.getAttribute("is") || e.nodeName, r = ts.get(t);
  if (r) return r;
  ts.set(t, r = []);
  for (var s, a = e, n = Element.prototype; n !== a; ) {
    s = on(a);
    for (var l in s)
      s[l].set && r.push(l);
    a = ns(a);
  }
  return r;
}
function Wt(e, t, r = t) {
  var s = /* @__PURE__ */ new WeakSet();
  Yr(e, "input", async (a) => {
    var n = a ? e.defaultValue : e.value;
    if (n = gr(e) ? br(n) : n, r(n), $ !== null && s.add($), await Cs(), n !== (n = t())) {
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
  Ut(t) == null && e.value && (r(gr(e) ? br(e.value) : e.value), $ !== null && s.add($)), or(() => {
    var a = t();
    if (e === document.activeElement) {
      var n = (
        /** @type {Batch} */
        Ot ?? $
      );
      if (s.has(n))
        return;
    }
    gr(e) && a === br(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
function Ta(e, t, r = t) {
  Yr(e, "change", (s) => {
    var a = s ? e.defaultChecked : e.checked;
    r(a);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  // If defaultChecked is set, then checked == defaultChecked
  Ut(t) == null && r(e.checked), or(() => {
    var s = t();
    e.checked = !!s;
  });
}
function gr(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function br(e) {
  return e === "" ? null : +e;
}
function rs(e, t) {
  return e === t || e?.[st] === t;
}
function mt(e = {}, t, r, s) {
  return Ds(() => {
    var a, n;
    return or(() => {
      a = n, n = [], Ut(() => {
        e !== r(...n) && (t(e, ...n), a && rs(r(...a), e) && t(null, ...a));
      });
    }), () => {
      kt(() => {
        n && rs(r(...n), e) && t(null, ...n);
      });
    };
  }), e;
}
const Aa = {
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
      const n = rt(a, t);
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
        const a = rt(s, t);
        return a && !a.configurable && (a.configurable = !0), a;
      }
    }
  },
  has(e, t) {
    if (t === st || t === hn) return !1;
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
function Fa(...e) {
  return new Proxy({ props: e }, Aa);
}
function Pa(e, t, r, s) {
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
function Dt(e) {
  xe === null && pn(), ks(() => {
    const t = Ut(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
const Ia = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Ia);
function Na(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var wr = { exports: {} }, ss;
function Ra() {
  return ss || (ss = 1, (function(e) {
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
      function a(b, v, x) {
        var L = b || r, P = v || 0, H = x || !1, j = 0, J;
        function G(E, g) {
          var M;
          if (g) {
            if (M = g.getTime(), H) {
              var y = d(g);
              if (g = new Date(M + y + P), d(g) !== y) {
                var p = d(g);
                g = new Date(M + p + P);
              }
            }
          } else {
            var C = Date.now();
            C > j ? (j = C, J = new Date(j), M = j, H && (J = new Date(j + d(J) + P))) : M = j, g = J;
          }
          return T(E, g, L, M);
        }
        function T(E, g, M, C) {
          for (var y = "", p = null, S = !1, k = E.length, R = !1, V = 0; V < k; V++) {
            var X = E.charCodeAt(V);
            if (S === !0) {
              if (X === 45) {
                p = "";
                continue;
              } else if (X === 95) {
                p = " ";
                continue;
              } else if (X === 48) {
                p = "0";
                continue;
              } else if (X === 58) {
                R && A("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), R = !0;
                continue;
              }
              switch (X) {
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
                  y += n(Math.floor(g.getFullYear() / 100), p);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  y += T(M.formats.D, g, M, C);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  y += T(M.formats.F, g, M, C);
                  break;
                // '00'
                // case 'H':
                case 72:
                  y += n(g.getHours(), p);
                  break;
                // '12'
                // case 'I':
                case 73:
                  y += n(u(g.getHours()), p);
                  break;
                // '000'
                // case 'L':
                case 76:
                  y += l(Math.floor(C % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  y += n(g.getMinutes(), p);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  y += g.getHours() < 12 ? M.am : M.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  y += T(M.formats.R, g, M, C);
                  break;
                // '00'
                // case 'S':
                case 83:
                  y += n(g.getSeconds(), p);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  y += T(M.formats.T, g, M, C);
                  break;
                // '00'
                // case 'U':
                case 85:
                  y += n(o(g, "sunday"), p);
                  break;
                // '00'
                // case 'W':
                case 87:
                  y += n(o(g, "monday"), p);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  y += T(M.formats.X, g, M, C);
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
                    var re = w(g);
                    y += re || "";
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
                  y += T(M.formats.c, g, M, C);
                  break;
                // '01'
                // case 'd':
                case 100:
                  y += n(g.getDate(), p);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  y += n(g.getDate(), p ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  y += M.shortMonths[g.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var K = new Date(g.getFullYear(), 0, 1), U = Math.ceil((g.getTime() - K.getTime()) / (1e3 * 60 * 60 * 24));
                  y += l(U);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  y += n(g.getHours(), p ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  y += n(u(g.getHours()), p ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  y += n(g.getMonth() + 1, p);
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
                  var U = g.getDate();
                  M.ordinalSuffixes ? y += String(U) + (M.ordinalSuffixes[U - 1] || f(U)) : y += String(U) + f(U);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  y += g.getHours() < 12 ? M.AM : M.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  y += T(M.formats.r, g, M, C);
                  break;
                // '0'
                // case 's':
                case 115:
                  y += Math.floor(C / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  y += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var U = g.getDay();
                  y += U === 0 ? 7 : U;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  y += T(M.formats.v, g, M, C);
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
                  y += T(M.formats.x, g, M, C);
                  break;
                // '70'
                // case 'y':
                case 121:
                  y += n(g.getFullYear() % 100, p);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (H && P === 0)
                    y += R ? "+00:00" : "+0000";
                  else {
                    var ee;
                    P !== 0 ? ee = P / (60 * 1e3) : ee = -g.getTimezoneOffset();
                    var te = ee < 0 ? "-" : "+", se = R ? ":" : "", ue = Math.floor(Math.abs(ee / 60)), ne = Math.abs(ee % 60);
                    y += te + n(ue) + se + n(ne);
                  }
                  break;
                default:
                  S && (y += "%"), y += E[V];
                  break;
              }
              p = null, S = !1;
              continue;
            }
            if (X === 37) {
              S = !0;
              continue;
            }
            y += E[V];
          }
          return y;
        }
        var z = G;
        return z.localize = function(E) {
          return new a(E || L, P, H);
        }, z.localizeByIdentifier = function(E) {
          var g = t[E];
          return g ? z.localize(g) : (A('[WARNING] No locale found with identifier "' + E + '".'), z);
        }, z.timezone = function(E) {
          var g = P, M = H, C = typeof E;
          if (C === "number" || C === "string")
            if (M = !0, C === "string") {
              var y = E[0] === "-" ? -1 : 1, p = parseInt(E.slice(1, 3), 10), S = parseInt(E.slice(3, 5), 10);
              g = y * (60 * p + S) * 60 * 1e3;
            } else C === "number" && (g = E * 60 * 1e3);
          return new a(L, g, M);
        }, z.utc = function() {
          return new a(L, P, !0);
        }, z;
      }
      function n(b, v) {
        return v === "" || b > 9 ? "" + b : (v == null && (v = "0"), v + b);
      }
      function l(b) {
        return b > 99 ? b : b > 9 ? "0" + b : "00" + b;
      }
      function u(b) {
        return b === 0 ? 12 : b > 12 ? b - 12 : b;
      }
      function o(b, v) {
        v = v || "sunday";
        var x = b.getDay();
        v === "monday" && (x === 0 ? x = 6 : x--);
        var L = Date.UTC(b.getFullYear(), 0, 1), P = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()), H = Math.floor((P - L) / 864e5), j = (H + 7 - x) / 7;
        return Math.floor(j);
      }
      function f(b) {
        var v = b % 10, x = b % 100;
        if (x >= 11 && x <= 13 || v === 0 || v >= 4)
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
      function d(b) {
        return (b.getTimezoneOffset() || 0) * 6e4;
      }
      function w(b, v) {
        return _() || m(b);
      }
      function _(b, v) {
        return null;
      }
      function m(b) {
        var v = b.toString().match(/\(([\w\s]+)\)/);
        return v && v[1];
      }
      function A(b) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(b);
      }
    })();
  })(wr)), wr.exports;
}
var Oa = Ra();
const bt = /* @__PURE__ */ Na(Oa);
let yr = /* @__PURE__ */ O(!1);
class Ya {
  constructor(t) {
    if (this.sk = "", this.fetchFn = t || (typeof window < "u" ? fetch.bind(window) : fetch), typeof document < "u") {
      const r = document.querySelector('meta[name="csrf-token"]');
      r && (this.sk = r.content);
    }
  }
  get loading() {
    return i(yr);
  }
  async request(t, r = {}) {
    D(yr, !0);
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
const Z = new Ya(), La = (e, t = nr) => {
  var r = Ha(), s = c(r);
  Q(() => {
    lt(r, 1, `status status-${t() ?? ""}`, "svelte-13s7gu4"), F(s, t());
  }), I(e, r);
};
var Ha = /* @__PURE__ */ Y("<span> </span>"), Ca = /* @__PURE__ */ Y('<time class="svelte-13s7gu4"> </time>'), ja = /* @__PURE__ */ Y('<div class="loading-spinner-container svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), qa = /* @__PURE__ */ Y('<tr class="svelte-13s7gu4"><td class="svelte-13s7gu4"> </td><td class="date svelte-13s7gu4"> </td><td class="svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><div class="title svelte-13s7gu4"> </div> <div class="path svelte-13s7gu4"><a target="_blank" class="svelte-13s7gu4"> </a></div></td><td class="small svelte-13s7gu4"> </td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="time svelte-13s7gu4"><!></td><td class="svelte-13s7gu4"><button class="edit-btn svelte-13s7gu4">編集</button></td></tr>'), $a = /* @__PURE__ */ Y('<div class="overlay svelte-13s7gu4"><div class="loading-spinner svelte-13s7gu4"></div></div>'), za = /* @__PURE__ */ Y('<table class="svelte-13s7gu4"><thead class="svelte-13s7gu4"><tr class="svelte-13s7gu4"><th class="svelte-13s7gu4">ID</th><th class="svelte-13s7gu4">日付</th><th class="svelte-13s7gu4">ステータス</th><th class="svelte-13s7gu4">タイトル / パス</th><th class="svelte-13s7gu4">形式</th><th class="svelte-13s7gu4">作成</th><th class="svelte-13s7gu4">更新</th><th class="svelte-13s7gu4">公開</th><th class="svelte-13s7gu4">操作</th></tr></thead><tbody class="svelte-13s7gu4"></tbody></table> <!>', 1), Ua = /* @__PURE__ */ Y('<div class="entry-list svelte-13s7gu4"><div class="header svelte-13s7gu4"><h2 class="svelte-13s7gu4">エントリ一覧</h2> <div class="search-box svelte-13s7gu4"><input type="text" placeholder="検索..." class="svelte-13s7gu4"/> <button class="svelte-13s7gu4">検索</button></div> <div class="pagination svelte-13s7gu4"><button class="svelte-13s7gu4">新しい方へ</button> <button class="svelte-13s7gu4">古い方へ</button></div></div> <div><!></div></div>');
function Ba(e, t) {
  dt(t, !0);
  const r = (E, g = nr, M) => {
    let C = /* @__PURE__ */ Rr(() => is(M?.(), !0));
    var y = Ca(), p = c(y);
    Q(
      (S) => {
        Fe(y, "datetime", g()), F(p, S);
      },
      [() => i(C) && g() ? _(g()) : "-"]
    ), I(E, y);
  };
  let s = /* @__PURE__ */ O(he([])), a = /* @__PURE__ */ O(!1), n = 50, l = /* @__PURE__ */ O(""), u = /* @__PURE__ */ O(he([]));
  async function o() {
    try {
      const E = i(u)[i(u).length - 1], g = { limit: n };
      i(l) && (g.q = i(l)), E && (g.cursor_id = E);
      const M = await Z.get("/admin/api/entries", g);
      D(s, M.entries || [], !0), D(a, M.has_more || !1, !0);
    } catch (E) {
      console.error(E);
    }
  }
  function f() {
    D(u, [], !0), o();
  }
  Dt(o);
  function d() {
    if (i(a) && i(s).length > 0) {
      const E = i(s)[i(s).length - 1];
      i(u).push(E.id), o();
    }
  }
  function w() {
    i(u).length > 0 && (i(u).pop(), o());
  }
  function _(E) {
    return E ? bt("%Y-%m-%d %H:%M", new Date(E)) : "-";
  }
  var m = Ua(), A = c(m), b = h(c(A), 2), v = c(b);
  v.__keydown = (E) => E.key === "Enter" && f();
  var x = h(v, 2);
  x.__click = f;
  var L = h(b, 2), P = c(L);
  P.__click = w;
  var H = h(P, 2);
  H.__click = d;
  var j = h(A, 2);
  let J;
  var G = c(j);
  {
    var T = (E) => {
      var g = ja();
      I(E, g);
    }, z = (E) => {
      var g = za(), M = Mt(g), C = h(c(M));
      Ze(C, 21, () => i(s), We, (S, k) => {
        var R = qa(), V = c(R), X = c(V), re = h(V), K = c(re), U = h(re), ee = c(U);
        La(ee, () => i(k).status);
        var te = h(U), se = c(te), ue = c(se), ne = h(se, 2), ve = c(ne), me = c(ve), ge = h(te), Ie = c(ge), Me = h(ge), Te = c(Me);
        r(Te, () => i(k).created_at);
        var Ue = h(Me), Be = c(Ue);
        r(Be, () => i(k).modified_at);
        var _t = h(Ue), Tt = c(_t);
        r(Tt, () => i(k).publish_at?.Time, () => i(k).publish_at?.Valid);
        var At = h(_t), Qe = c(At);
        Qe.__click = () => t.onEdit(i(k).id), Q(() => {
          F(X, i(k).id), F(K, i(k).date), F(ue, i(k).title), Fe(ve, "href", `/${i(k).path ?? ""}`), F(me, `/${i(k).path ?? ""}`), F(Ie, i(k).format);
        }), I(S, R);
      });
      var y = h(M, 2);
      {
        var p = (S) => {
          var k = $a();
          I(S, k);
        };
        ce(y, (S) => {
          Z.loading && S(p);
        });
      }
      I(E, g);
    };
    ce(G, (E) => {
      Z.loading && i(s).length === 0 ? E(T) : E(z, !1);
    });
  }
  Q(() => {
    P.disabled = i(u).length === 0 || Z.loading, H.disabled = !i(a) || Z.loading, J = lt(j, 1, "table-container svelte-13s7gu4", null, J, { "is-loading": Z.loading });
  }), Wt(v, () => i(l), (E) => D(l, E)), I(e, m), ht();
}
Bt(["keydown", "click"]);
class Ja {
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
    this.storage = t, this.timer = null, this.#e = /* @__PURE__ */ O(!1), this.#t = /* @__PURE__ */ O(null);
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
var Xa = /* @__PURE__ */ Y('<div class="loading-spinner-container svelte-7nstam"><div class="loading-spinner svelte-7nstam"></div></div>'), Va = /* @__PURE__ */ Y('<option class="svelte-7nstam"> </option>'), Ga = /* @__PURE__ */ Y('<div class="progress-bar svelte-7nstam" style="width: 100%"></div>'), Ka = /* @__PURE__ */ Y('<input type="datetime-local" class="datetime-input svelte-7nstam"/>'), Wa = /* @__PURE__ */ Y('<button id="restore" type="button" class="submit-button svelte-7nstam">復元...</button>'), Za = /* @__PURE__ */ Y('<div role="option" tabindex="-1"> </div>'), Qa = /* @__PURE__ */ Y('<div class="container svelte-7nstam"><div class="main svelte-7nstam"><input id="title" type="text" placeholder="タイトル" class="svelte-7nstam"/> <div class="toolbar svelte-7nstam"><button type="button" class="svelte-7nstam">🏷️ タグ</button> <button type="button" class="svelte-7nstam"> </button> <select class="format-select svelte-7nstam"></select></div> <div class="body-container svelte-7nstam"><textarea id="body" placeholder="本文" required class="svelte-7nstam"></textarea></div></div> <div class="global-actions svelte-7nstam"><!> <div class="buttons svelte-7nstam"><div class="options svelte-7nstam"><label title="チェックを入れると指定した日時に公開されます（公開済みの記事も予約に戻せます）" class="svelte-7nstam"><input type="checkbox" class="svelte-7nstam"/> 公開を遅延</label> <!></div> <button type="button" class="submit-button svelte-7nstam"> </button> <!></div></div></div> <dialog id="tagDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">タグを選択</h3> <div class="tag-list svelte-7nstam" role="listbox" aria-label="タグを選択" tabindex="0"></div> <button type="button" style="margin-top: 16px;" class="svelte-7nstam">キャンセル</button></dialog> <dialog id="restoreDialog" class="svelte-7nstam"><h3 class="svelte-7nstam">自動バックアップの復元</h3> <p class="svelte-7nstam"><!> に保存されたバックアップを復元しますか?</p> <div style="display: flex; gap: 8px; justify-content: flex-end;" class="svelte-7nstam"><button type="button" class="svelte-7nstam">キャンセル</button> <button type="button" class="submit-button svelte-7nstam">復元</button></div></dialog>', 1);
function ei(e, t) {
  dt(t, !0);
  let r = Pa(t, "id", 3, null);
  const s = new Ja();
  let a = /* @__PURE__ */ O(he({ id: null, title: "", body: "", status: null })), n = he({
    id: null,
    title: "",
    body: "",
    format: "Hatena",
    status: "public",
    publishLater: !1,
    publishAt: ""
  }), l = /* @__PURE__ */ O(!1), u = /* @__PURE__ */ O(""), o = /* @__PURE__ */ O(!1), f = /* @__PURE__ */ O(null), d = /* @__PURE__ */ O(null), w = /* @__PURE__ */ O(null), _ = /* @__PURE__ */ O(null), m = /* @__PURE__ */ O(null);
  const A = [
    "tech",
    "photo",
    "redeveloped",
    "stablediffusion",
    "photoshopped"
  ];
  let b = /* @__PURE__ */ O(0);
  async function v(p) {
    try {
      const S = await Z.get(`/admin/api/entry/${p}`);
      D(a, S, !0), n.id = S.id, n.title = S.title, n.body = S.body, n.format = S.format || "Hatena", n.status = S.status, n.publishLater = S.status === "scheduled", S.publish_at?.Valid ? n.publishAt = bt("%Y-%m-%dT%H:%M", new Date(S.publish_at.Time)) : n.publishAt = bt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), s.check(i(a).id, { title: n.title, body: n.body });
    } catch (S) {
      console.error(S), alert("エントリの取得に失敗しました");
    }
  }
  Dt(() => {
    r() ? v(r()) : (D(a, { id: null, title: "", body: "", status: "public" }, !0), n.id = null, n.title = "", n.body = "", n.format = "Hatena", n.status = "public", n.publishLater = !1, n.publishAt = bt("%Y-%m-%dT%H:%M", new Date(Date.now() + 86400 * 30 * 1e3)), s.check(null, { title: n.title, body: n.body }));
  }), ks(() => {
    (i(a).title !== n.title || i(a).body !== n.body) && s.saveDebounced(i(a).id, { title: n.title, body: n.body });
  });
  async function x() {
    D(l, !0), D(u, "リクエスト中");
    const p = new FormData();
    if (p.set("id", n.id ? String(n.id) : ""), p.set("title", n.title), p.set("body", n.body), p.set("format", n.format), n.publishLater) {
      const S = new Date(n.publishAt);
      p.set("publish_at", S.toISOString()), p.set("status", "scheduled");
    } else
      p.set("status", "public");
    try {
      const k = (await Z.post("/admin/api/edit", p)).session_id;
      if (!k)
        throw new Error("保存に失敗しました");
      L(k);
    } catch (S) {
      D(l, !1), alert(S instanceof Error ? S.message : "エラーが発生しました");
    }
  }
  function L(p) {
    const S = new EventSource(`/admin/api/edit/progress?sid=${p}`);
    S.onmessage = (k) => {
      const R = JSON.parse(k.data);
      switch (R.type) {
        case "progress":
          D(u, P(R.message), !0);
          break;
        case "done":
          s.clear(i(a).id), D(u, "完了"), D(l, !1), S.close(), t.onSave(R.location);
          break;
        case "error":
          D(u, "エラー: " + R.message), D(l, !1), S.close(), alert("保存に失敗しました: " + R.message);
          break;
      }
    }, S.onerror = () => {
      D(l, !1), S.close(), alert("通信エラーが発生しました");
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
    D(b, 0), i(w).showModal(), setTimeout(() => i(m)?.focus(), 0);
  }
  function j(p) {
    p.key === "ArrowDown" ? (p.preventDefault(), D(b, (i(b) + 1) % A.length)) : p.key === "ArrowUp" ? (p.preventDefault(), D(b, (i(b) - 1 + A.length) % A.length)) : p.key === "Enter" || p.key === " " ? (p.preventDefault(), J(A[i(b)])) : p.key === "Escape" && i(w).close();
  }
  function J(p) {
    const S = `[${p}]`;
    n.title.includes(S) ? n.title = n.title.replace(S, "") : n.title = S + n.title, i(w).close(), i(f).focus();
  }
  function G() {
    s.data && (n.title = s.data.title, n.body = s.data.body, s.clear(i(a).id), i(_).close());
  }
  async function T() {
    const p = document.createElement("input");
    p.type = "file", p.oninput = async () => {
      if (!p.files?.[0]) return;
      const S = new FormData();
      S.append("file", p.files[0]), D(o, !0);
      try {
        const k = await Z.post("/admin/api/upload/image", S), R = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${k.uploaded}" class="picasa" itemprop="url"><img src="${k.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        z(R, !0);
      } catch {
        alert("アップロードに失敗しました");
      } finally {
        D(o, !1);
      }
    }, p.click();
  }
  function z(p, S = !1) {
    const k = i(d).selectionStart, R = i(d).selectionEnd, V = i(d).value;
    n.body = V.substring(0, k) + p + V.substring(R), Cs().then(() => {
      typeof S == "boolean" && S ? (i(d).selectionStart = k, i(d).selectionEnd = k + p.length) : typeof S == "number" ? i(d).selectionStart = i(d).selectionEnd = k + S : i(d).selectionStart = i(d).selectionEnd = k + p.length, i(d).focus();
    });
  }
  function E(p) {
    (p.altKey ? "Alt-" : "") + (p.ctrlKey ? "Control-" : "") + (p.metaKey ? "Meta-" : "") + (p.shiftKey ? "Shift-" : "") + p.key === "Control-t" && (z("\\(  \\)", 3), p.preventDefault(), p.stopPropagation());
  }
  var g = Cr(), M = Mt(g);
  {
    var C = (p) => {
      var S = Xa();
      I(p, S);
    }, y = (p) => {
      var S = Qa(), k = Mt(S), R = c(k), V = c(R);
      mt(V, (N) => D(f, N), () => i(f));
      var X = h(V, 2), re = c(X);
      re.__click = H;
      var K = h(re, 2);
      K.__click = T;
      var U = c(K), ee = h(K, 2);
      Ze(ee, 20, () => ["Hatena", "Markdown", "HTML", "tDiary"], We, (N, W) => {
        var de = Va(), Ae = c(de), Je = {};
        Q(() => {
          F(Ae, W), Je !== (Je = W) && (de.value = (de.__value = W) ?? "");
        }), I(N, de);
      });
      var te = h(X, 2), se = c(te);
      se.__keydown = E, mt(se, (N) => D(d, N), () => i(d));
      var ue = h(R, 2), ne = c(ue);
      {
        var ve = (N) => {
          var W = Ga();
          I(N, W);
        };
        ce(ne, (N) => {
          i(l) && N(ve);
        });
      }
      var me = h(ne, 2), ge = c(me), Ie = c(ge), Me = c(Ie), Te = h(Ie, 2);
      {
        var Ue = (N) => {
          var W = Ka();
          Wt(W, () => n.publishAt, (de) => n.publishAt = de), I(N, W);
        };
        ce(Te, (N) => {
          n.publishLater && N(Ue);
        });
      }
      var Be = h(ge, 2);
      Be.__click = x;
      var _t = c(Be), Tt = h(Be, 2);
      {
        var At = (N) => {
          var W = Wa();
          W.__click = () => i(_).showModal(), I(N, W);
        };
        ce(Tt, (N) => {
          s.exists && N(At);
        });
      }
      var Qe = h(k, 2), et = h(c(Qe), 2);
      et.__keydown = j, Ze(et, 21, () => A, We, (N, W, de) => {
        var Ae = Za();
        let Je;
        Ae.__click = () => J(i(W)), Ae.__keydown = (_r) => _r.key === "Enter" && J(i(W));
        var hr = c(Ae);
        Q(() => {
          Je = lt(Ae, 1, "tag-item svelte-7nstam", null, Je, { selected: i(b) === de }), Fe(Ae, "aria-selected", i(b) === de), F(hr, i(W));
        }), ca("mouseenter", Ae, () => D(b, de, !0)), I(N, Ae);
      }), mt(et, (N) => D(m, N), () => i(m));
      var fr = h(et, 2);
      fr.__click = () => i(w).close(), mt(Qe, (N) => D(w, N), () => i(w));
      var Jt = h(Qe, 2), Xt = h(c(Jt), 2), Vt = c(Xt);
      {
        var cr = (N) => {
          var W = da();
          Q((de) => F(W, de), [() => bt("%Y年%m月%d日%H時", new Date(s.data.time))]), I(N, W);
        };
        ce(Vt, (N) => {
          s.data?.time && N(cr);
        });
      }
      var vr = h(Xt, 2), Ft = c(vr);
      Ft.__click = () => i(_).close();
      var dr = h(Ft, 2);
      dr.__click = G, mt(Jt, (N) => D(_, N), () => i(_)), Q(() => {
        K.disabled = i(o), F(U, i(o) ? "⌛ アップロード中..." : "📷 写真"), Be.disabled = i(l), F(_t, i(l) ? i(u) || "リクエスト中" : r() ? "更新" : "作成");
      }), Wt(V, () => n.title, (N) => n.title = N), Ma(ee, () => n.format, (N) => n.format = N), Wt(se, () => n.body, (N) => n.body = N), Ta(Me, () => n.publishLater, (N) => n.publishLater = N), I(p, S);
    };
    ce(M, (p) => {
      Z.loading && !i(a).id ? p(C) : p(y, !1);
    });
  }
  I(e, g), ht();
}
Bt(["click", "keydown"]);
const ti = (e, t = nr) => {
  var r = ri(), s = c(r);
  Q(() => {
    lt(r, 1, `status status-${t() ?? ""}`, "svelte-1r6codn"), F(s, t());
  }), I(e, r);
};
var ri = /* @__PURE__ */ Y("<span> </span>"), si = /* @__PURE__ */ Y('<time class="time svelte-1r6codn"> </time>'), ni = /* @__PURE__ */ Y('<div class="loading svelte-1r6codn"></div>'), ai = /* @__PURE__ */ Y('<div class="error-text svelte-1r6codn"> </div>'), ii = /* @__PURE__ */ Y('<tr class="svelte-1r6codn"><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><strong class="svelte-1r6codn"> </strong></td><td class="svelte-1r6codn"><!></td><td class="svelte-1r6codn"> </td><td class="svelte-1r6codn"><!></td><td class="error svelte-1r6codn"><!></td></tr>'), li = /* @__PURE__ */ Y('<table class="svelte-1r6codn"><thead class="svelte-1r6codn"><tr class="svelte-1r6codn"><th class="svelte-1r6codn">ID</th><th class="svelte-1r6codn">Type</th><th class="svelte-1r6codn">Status</th><th class="svelte-1r6codn">Retry</th><th class="svelte-1r6codn">Created At</th><th class="svelte-1r6codn">Error</th></tr></thead><tbody class="svelte-1r6codn"></tbody></table>'), oi = /* @__PURE__ */ Y('<div class="job-list svelte-1r6codn"><div class="header svelte-1r6codn"><h2 class="svelte-1r6codn"> </h2> <div class="pagination svelte-1r6codn"><button class="svelte-1r6codn">新しい方へ</button> <span class="svelte-1r6codn"> </span> <button class="svelte-1r6codn">古い方へ</button> <button class="refresh-btn svelte-1r6codn" style="margin-left: 10px;">更新</button></div></div> <!></div>');
function ui(e, t) {
  dt(t, !0);
  const r = (T, z = nr, E) => {
    let g = /* @__PURE__ */ Rr(() => is(E?.(), !0));
    var M = si(), C = c(M);
    Q(
      (y) => {
        Fe(M, "datetime", z()), F(C, y);
      },
      [() => i(g) && z() ? d(z()) : "-"]
    ), I(T, M);
  };
  let s = /* @__PURE__ */ O(he([])), a = /* @__PURE__ */ O(0), n = /* @__PURE__ */ O(0), l = 50;
  async function u() {
    try {
      const T = await Z.get("/admin/api/jobs", { limit: l, offset: i(n) });
      D(s, T.jobs || [], !0), D(a, T.total || 0, !0);
    } catch (T) {
      console.error(T);
    }
  }
  Dt(u);
  function o() {
    i(n) + l < i(a) && (D(n, i(n) + l), u());
  }
  function f() {
    i(n) - l >= 0 && (D(n, i(n) - l), u());
  }
  function d(T) {
    return bt("%Y-%m-%d %H:%M:%S", new Date(T));
  }
  var w = oi(), _ = c(w), m = c(_), A = c(m), b = h(m, 2), v = c(b);
  v.__click = f;
  var x = h(v, 2), L = c(x), P = h(x, 2);
  P.__click = o;
  var H = h(P, 2);
  H.__click = u;
  var j = h(_, 2);
  {
    var J = (T) => {
      var z = ni();
      I(T, z);
    }, G = (T) => {
      var z = li(), E = h(c(z));
      Ze(E, 21, () => i(s), We, (g, M) => {
        var C = ii(), y = c(C), p = c(y), S = h(y), k = c(S), R = c(k), V = h(S), X = c(V);
        ti(X, () => i(M).status);
        var re = h(V), K = c(re), U = h(re), ee = c(U);
        r(ee, () => i(M).created_at);
        var te = h(U), se = c(te);
        {
          var ue = (ne) => {
            var ve = ai(), me = c(ve);
            Q(() => {
              Fe(ve, "title", i(M).error_message.String), F(me, i(M).error_message.String);
            }), I(ne, ve);
          };
          ce(se, (ne) => {
            i(M).error_message?.Valid && ne(ue);
          });
        }
        Q(() => {
          F(p, i(M).id), F(R, i(M).job_type_name), F(K, i(M).retry_count);
        }), I(g, C);
      }), I(T, z);
    };
    ce(j, (T) => {
      Z.loading && i(s).length === 0 ? T(J) : T(G, !1);
    });
  }
  Q(
    (T) => {
      F(A, `ジョブ一覧 (${i(a) ?? ""})`), v.disabled = i(n) === 0 || Z.loading, F(L, `${i(n) + 1} - ${T ?? ""} / ${i(a) ?? ""}`), P.disabled = i(n) + l >= i(a) || Z.loading;
    },
    [() => Math.min(i(n) + l, i(a))]
  ), I(e, w), ht();
}
Bt(["click"]);
var fi = /* @__PURE__ */ Y('<div class="loading svelte-xxb0sp">読み込み中...</div>'), ci = /* @__PURE__ */ Y('<button class="indexed-icon svelte-xxb0sp" title="類似画像を検索">🔍</button>'), vi = /* @__PURE__ */ Y('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/> <!></div> <div class="info svelte-xxb0sp"><div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), di = /* @__PURE__ */ Y('<div class="grid svelte-xxb0sp"></div>'), hi = /* @__PURE__ */ Y('<div class="loading svelte-xxb0sp">検索中...</div>'), _i = /* @__PURE__ */ Y("<p>類似画像は見つかりませんでした。</p>"), pi = /* @__PURE__ */ Y('<div class="image-item svelte-xxb0sp"><div class="img-container svelte-xxb0sp"><img alt="" loading="lazy" class="svelte-xxb0sp"/></div> <div class="info svelte-xxb0sp"><div class="entry-link svelte-xxb0sp"><a class="svelte-xxb0sp">Entry: <strong> </strong></a></div> <div class="id svelte-xxb0sp"> </div></div></div>'), mi = /* @__PURE__ */ Y('<div class="grid similar-grid svelte-xxb0sp"></div>'), gi = /* @__PURE__ */ Y('<div class="image-list svelte-xxb0sp"><div class="header svelte-xxb0sp"><h2> </h2> <div class="pagination svelte-xxb0sp"><button>前へ</button> <span> </span> <button>次へ</button></div></div> <!></div> <dialog id="similarDialog" class="svelte-xxb0sp"><div class="dialog-header svelte-xxb0sp"><h3 class="svelte-xxb0sp">類似画像一覧</h3> <button type="button" class="close-btn svelte-xxb0sp">×</button></div> <div class="dialog-content svelte-xxb0sp"><!></div></dialog>', 1);
function bi(e, t) {
  dt(t, !0);
  let r = /* @__PURE__ */ O(he([])), s = /* @__PURE__ */ O(0), a = 50, n = /* @__PURE__ */ O(0), l = /* @__PURE__ */ O(he([])), u = /* @__PURE__ */ O(null), o = /* @__PURE__ */ O(null);
  async function f() {
    try {
      const k = await Z.get(`/admin/api/images?limit=${a}&offset=${i(n)}`);
      D(r, k.images || [], !0), D(s, k.total || 0, !0);
    } catch (k) {
      console.error(k);
    }
  }
  async function d(k) {
    D(u, k, !0), D(l, [], !0), i(o).showModal();
    try {
      const R = await Z.get(`/admin/api/image/${k.id}/similar`);
      D(l, R.similar || [], !0);
    } catch (R) {
      console.error(R);
    }
  }
  Dt(f);
  function w() {
    i(n) + a < i(s) && (D(n, i(n) + a), f());
  }
  function _() {
    i(n) - a >= 0 && (D(n, i(n) - a), f());
  }
  var m = gi(), A = Mt(m), b = c(A), v = c(b), x = c(v), L = h(v, 2), P = c(L);
  P.__click = _;
  var H = h(P, 2), j = c(H), J = h(H, 2);
  J.__click = w;
  var G = h(b, 2);
  {
    var T = (k) => {
      var R = fi();
      I(k, R);
    }, z = (k) => {
      var R = di();
      Ze(R, 21, () => i(r), We, (V, X) => {
        var re = vi(), K = c(re), U = c(K), ee = h(U, 2);
        {
          var te = (Me) => {
            var Te = ci();
            Te.__click = () => d(i(X)), I(Me, Te);
          };
          ce(ee, (Me) => {
            i(X).sig?.length > 0 && Me(te);
          });
        }
        var se = h(K, 2), ue = c(se), ne = c(ue), ve = h(c(ne)), me = c(ve), ge = h(ue, 2), Ie = c(ge);
        Q(() => {
          Fe(U, "src", i(X).uri), Fe(ne, "href", `/admin/edit?id=${i(X).entry_id ?? ""}`), F(me, i(X).entry_id), F(Ie, `ID: ${i(X).id ?? ""}`);
        }), I(V, re);
      }), I(k, R);
    };
    ce(G, (k) => {
      Z.loading && i(r).length === 0 ? k(T) : k(z, !1);
    });
  }
  var E = h(A, 2), g = c(E), M = h(c(g), 2);
  M.__click = () => i(o).close();
  var C = h(g, 2), y = c(C);
  {
    var p = (k) => {
      var R = hi();
      I(k, R);
    }, S = (k) => {
      var R = Cr(), V = Mt(R);
      {
        var X = (K) => {
          var U = _i();
          I(K, U);
        }, re = (K) => {
          var U = mi();
          Ze(U, 21, () => i(l), We, (ee, te) => {
            var se = pi(), ue = c(se), ne = c(ue), ve = h(ue, 2), me = c(ve), ge = c(me);
            ge.__click = () => i(o).close();
            var Ie = h(c(ge)), Me = c(Ie), Te = h(me, 2), Ue = c(Te);
            Q(() => {
              Fe(ne, "src", i(te).uri), Fe(ge, "href", `/admin/edit?id=${i(te).entry_id ?? ""}`), F(Me, i(te).entry_id), F(Ue, `ID: ${i(te).id ?? ""} / Score: ${i(te).score ?? ""}`);
            }), I(ee, se);
          }), I(K, U);
        };
        ce(
          V,
          (K) => {
            i(l).length === 0 ? K(X) : K(re, !1);
          },
          !0
        );
      }
      I(k, R);
    };
    ce(y, (k) => {
      Z.loading && i(l).length === 0 ? k(p) : k(S, !1);
    });
  }
  mt(E, (k) => D(o, k), () => i(o)), Q(
    (k) => {
      F(x, `画像一覧 (${i(s) ?? ""})`), P.disabled = i(n) === 0, F(j, `${i(n) + 1} - ${k ?? ""} / ${i(s) ?? ""}`), J.disabled = i(n) + a >= i(s);
    },
    [() => Math.min(i(n) + a, i(s))]
  ), I(e, m), ht();
}
Bt(["click"]);
var wi = /* @__PURE__ */ Y('<div class="loading-spinner-container svelte-6rw159"><div class="loading-spinner svelte-6rw159"></div></div>'), yi = /* @__PURE__ */ Y('<span class="term-badge svelte-6rw159"> </span>'), xi = /* @__PURE__ */ Y('<div class="sections svelte-6rw159"><section class="svelte-6rw159"><h3 class="svelte-6rw159">TF-IDF 統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総語彙数 (Terms)</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">インデックス済みエントリ</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">関連エントリ計算済み</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">総関連ペア数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">平均類似度スコア</th><td class="svelte-6rw159"> </td></tr></tbody></table></div> <div style="margin-top: 10px;" class="svelte-6rw159"><h4 class="svelte-6rw159">頻出単語 (Top 20 DF)</h4> <div class="top-terms svelte-6rw159"></div></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">画像統計</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">総画像数</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">未インデックス画像数</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">全般</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">IsDevelopment</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">AppHash</th><td class="svelte-6rw159"><code class="svelte-6rw159"> </code></td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">デバッグ情報</h3> <div class="table-container svelte-6rw159"><table class="svelte-6rw159"><tbody class="svelte-6rw159"><tr class="svelte-6rw159"><th class="svelte-6rw159">Go Version</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Goroutines</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Start Time</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Uptime</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Total Alloc</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Mem Sys</th><td class="svelte-6rw159"> </td></tr><tr class="svelte-6rw159"><th class="svelte-6rw159">Num GC</th><td class="svelte-6rw159"> </td></tr></tbody></table></div></section> <section class="svelte-6rw159"><h3 class="svelte-6rw159">設定 (Config)</h3> <pre class="svelte-6rw159"> </pre></section></div>'), Mi = /* @__PURE__ */ Y('<div class="info-page svelte-6rw159"><div class="header svelte-6rw159"><h2 class="svelte-6rw159">システム情報</h2></div> <!></div>');
function Si(e, t) {
  dt(t, !0);
  let r = /* @__PURE__ */ O(null);
  async function s() {
    try {
      D(r, await Z.get("/admin/api/info"), !0);
    } catch (f) {
      console.error(f);
    }
  }
  Dt(s);
  function a(f) {
    if (f === 0) return "0 B";
    const d = 1024, w = ["B", "KB", "MB", "GB", "TB"], _ = Math.floor(Math.log(f) / Math.log(d));
    return parseFloat((f / Math.pow(d, _)).toFixed(2)) + " " + w[_];
  }
  var n = Mi(), l = h(c(n), 2);
  {
    var u = (f) => {
      var d = wi();
      I(f, d);
    }, o = (f) => {
      var d = Cr(), w = Mt(d);
      {
        var _ = (m) => {
          var A = xi(), b = c(A), v = h(c(b), 2), x = c(v), L = c(x), P = c(L), H = h(c(P)), j = c(H), J = h(P), G = h(c(J)), T = c(G), z = h(J), E = h(c(z)), g = c(E), M = h(z), C = h(c(M)), y = c(C), p = h(M), S = h(c(p)), k = c(S), R = h(v, 2), V = h(c(R), 2);
          Ze(V, 21, () => i(r).tfidf_stats.top_terms, We, (pr, Gt) => {
            var Pt = yi(), mr = c(Pt);
            Q(() => {
              Fe(Pt, "title", `DF: ${i(Gt).df ?? ""}`), F(mr, i(Gt).term);
            }), I(pr, Pt);
          });
          var X = h(b, 2), re = h(c(X), 2), K = c(re), U = c(K), ee = c(U), te = h(c(ee)), se = c(te), ue = h(ee), ne = h(c(ue)), ve = c(ne), me = h(X, 2), ge = h(c(me), 2), Ie = c(ge), Me = c(Ie), Te = c(Me), Ue = h(c(Te)), Be = c(Ue), _t = h(Te), Tt = h(c(_t)), At = c(Tt), Qe = c(At), et = h(me, 2), fr = h(c(et), 2), Jt = c(fr), Xt = c(Jt), Vt = c(Xt), cr = h(c(Vt)), vr = c(cr), Ft = h(Vt), dr = h(c(Ft)), N = c(dr), W = h(Ft), de = h(c(W)), Ae = c(de), Je = h(W), hr = h(c(Je)), _r = c(hr), jr = h(Je), Bs = h(c(jr)), Js = c(Bs), qr = h(jr), Xs = h(c(qr)), Vs = c(Xs), $r = h(qr), Gs = h(c($r)), Ks = c(Gs), Ws = h($r), Zs = h(c(Ws)), Qs = c(Zs), en = h(et, 2), tn = h(c(en), 2), rn = c(tn);
          Q(
            (pr, Gt, Pt, mr, sn, nn) => {
              F(j, i(r).tfidf_stats.total_terms), F(T, i(r).tfidf_stats.indexed_entries), F(g, i(r).tfidf_stats.entries_with_related), F(y, i(r).tfidf_stats.total_related_pairs), F(k, pr), F(se, i(r).image_stats.total_images), F(ve, i(r).image_stats.unindexed_images), F(Be, i(r).is_development), F(Qe, i(r).app_hash), F(vr, i(r).debug_info.go_version), F(N, i(r).debug_info.num_goroutine), F(Ae, Gt), F(_r, i(r).debug_info.uptime), F(Js, Pt), F(Vs, mr), F(Ks, sn), F(Qs, i(r).debug_info.num_gc), F(rn, nn);
            },
            [
              () => i(r).tfidf_stats.avg_score.toFixed(4),
              () => new Date(i(r).debug_info.start_time).toLocaleString(),
              () => a(i(r).debug_info.mem_alloc),
              () => a(i(r).debug_info.mem_total_alloc),
              () => a(i(r).debug_info.mem_sys),
              () => JSON.stringify(i(r).config, null, 2)
            ]
          ), I(m, A);
        };
        ce(
          w,
          (m) => {
            i(r) && m(_);
          },
          !0
        );
      }
      I(f, d);
    };
    ce(l, (f) => {
      Z.loading && !i(r) ? f(u) : f(o, !1);
    });
  }
  I(e, n), ht();
}
var ki = /* @__PURE__ */ Y("<a> </a>"), Ei = /* @__PURE__ */ Y('<div class="admin-app svelte-1n46o8q"><header><h1 class="svelte-1n46o8q"><a href="/admin/" class="svelte-1n46o8q"><img src="/images/hanrangen-icon.svg" alt="Hanrangon" class="logo svelte-1n46o8q"/></a></h1> <nav class="main-nav svelte-1n46o8q"><ul class="svelte-1n46o8q"><li><a href="/" class="svelte-1n46o8q">サイト確認</a></li> <li><a href="/logout" class="svelte-1n46o8q">ログアウト</a></li></ul></nav></header> <nav></nav> <main class="content svelte-1n46o8q"><!></main></div>');
function Di(e, t) {
  dt(t, !0);
  let r = /* @__PURE__ */ O(he(window.location.pathname)), s = /* @__PURE__ */ O(he(new URLSearchParams(window.location.search)));
  Dt(() => {
    const v = () => {
      D(r, window.location.pathname, !0), D(s, new URLSearchParams(window.location.search), !0);
    };
    return window.addEventListener("popstate", v), () => window.removeEventListener("popstate", v);
  });
  function a(v, x) {
    x && x.preventDefault(), window.history.pushState({}, "", v), D(r, window.location.pathname, !0), D(s, new URLSearchParams(window.location.search), !0);
  }
  const n = {
    "/admin/edit": {
      component: ei,
      page: "edit",
      getProps: (v) => ({ id: v, onSave: (x) => window.location.href = x })
    },
    "/admin/jobs": { component: ui, page: "jobs", getProps: () => ({}) },
    "/admin/images": { component: bi, page: "images", getProps: () => ({}) },
    "/admin/info": { component: Si, page: "info", getProps: () => ({}) },
    "/admin/": {
      component: Ba,
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
  ], u = /* @__PURE__ */ Jr(() => {
    const v = i(s).get("id"), x = n[i(r)] ?? n["/admin/"];
    return {
      ...x,
      props: x.getProps(v),
      isActive: (L) => !(L.page !== x.page || L.exact && v)
    };
  }), o = /* @__PURE__ */ Jr(() => window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  var f = Ei(), d = c(f);
  let w;
  var _ = h(d, 2);
  let m;
  Ze(_, 21, () => l, We, (v, x) => {
    var L = ki();
    L.__click = (j) => a(i(x).path, j);
    let P;
    var H = c(L);
    Q(
      (j) => {
        Fe(L, "href", i(x).path), P = lt(L, 1, "svelte-1n46o8q", null, P, j), F(H, i(x).label);
      },
      [() => ({ active: i(u).isActive(i(x)) })]
    ), I(v, L);
  });
  var A = h(_, 2), b = c(A);
  wa(b, () => i(u).component, (v, x) => {
    x(v, Fa(() => i(u).props));
  }), Q(() => {
    w = lt(d, 1, "svelte-1n46o8q", null, w, { "is-localhost": i(o) }), m = lt(_, 1, "sub-nav svelte-1n46o8q", null, m, { "is-localhost": i(o) });
  }), I(e, f), ht();
}
Bt(["click"]);
const xr = document.getElementById("admin-root");
xr && (xr.innerHTML = "", ha(Di, { target: xr }));
//# sourceMappingURL=admin-front.js.map
