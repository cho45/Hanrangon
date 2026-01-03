const st = globalThis, ct = st.ShadowRoot && (st.ShadyCSS === void 0 || st.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ut = /* @__PURE__ */ Symbol(), bt = /* @__PURE__ */ new WeakMap();
let Et = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== ut) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (ct && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = bt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && bt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ft = (r) => new Et(typeof r == "string" ? r : r + "", void 0, ut), Bt = (r, ...t) => {
  const e = r.length === 1 ? r[0] : t.reduce((s, i, o) => s + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + r[o + 1], r[0]);
  return new Et(e, r, ut);
}, Jt = (r, t) => {
  if (ct) r.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = st.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, r.appendChild(s);
  }
}, yt = ct ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return Ft(e);
})(r) : r;
const { is: Lt, defineProperty: Xt, getOwnPropertyDescriptor: qt, getOwnPropertyNames: Zt, getOwnPropertySymbols: Wt, getPrototypeOf: Kt } = Object, ot = globalThis, $t = ot.trustedTypes, Vt = $t ? $t.emptyScript : "", Gt = ot.reactiveElementPolyfillSupport, X = (r, t) => r, rt = { toAttribute(r, t) {
  switch (t) {
    case Boolean:
      r = r ? Vt : null;
      break;
    case Object:
    case Array:
      r = r == null ? r : JSON.stringify(r);
  }
  return r;
}, fromAttribute(r, t) {
  let e = r;
  switch (t) {
    case Boolean:
      e = r !== null;
      break;
    case Number:
      e = r === null ? null : Number(r);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(r);
      } catch {
        e = null;
      }
  }
  return e;
} }, dt = (r, t) => !Lt(r, t), vt = { attribute: !0, type: String, converter: rt, reflect: !1, useDefault: !1, hasChanged: dt };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), ot.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Y = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = vt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = /* @__PURE__ */ Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && Xt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: o } = qt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(n) {
      this[e] = n;
    } };
    return { get: i, set(n) {
      const d = i?.call(this);
      o?.call(this, n), this.requestUpdate(t, d, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? vt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(X("elementProperties"))) return;
    const t = Kt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(X("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(X("properties"))) {
      const e = this.properties, s = [...Zt(e), ...Wt(e)];
      for (const i of s) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, i] of e) this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const i = this._$Eu(e, s);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const i of s) e.unshift(yt(i));
    } else t !== void 0 && e.push(yt(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Jt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    const s = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, s);
    if (i !== void 0 && s.reflect === !0) {
      const o = (s.converter?.toAttribute !== void 0 ? s.converter : rt).toAttribute(e, s.type);
      this._$Em = t, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const o = s.getPropertyOptions(i), n = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : rt;
      this._$Em = i;
      const d = n.fromAttribute(e, o.type);
      this[i] = d ?? this._$Ej?.get(i) ?? d, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, o) {
    if (t !== void 0) {
      const n = this.constructor;
      if (i === !1 && (o = this[t]), s ??= n.getPropertyOptions(t), !((s.hasChanged ?? dt)(o, e) || s.useDefault && s.reflect && o === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: i, wrapped: o }, n) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? e ?? this[t]), o !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [i, o] of this._$Ep) this[i] = o;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [i, o] of s) {
        const { wrapped: n } = o, d = this[i];
        n !== !0 || this._$AL.has(i) || d === void 0 || this.C(i, void 0, o, d);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
Y.elementStyles = [], Y.shadowRootOptions = { mode: "open" }, Y[X("elementProperties")] = /* @__PURE__ */ new Map(), Y[X("finalized")] = /* @__PURE__ */ new Map(), Gt?.({ ReactiveElement: Y }), (ot.reactiveElementVersions ??= []).push("2.1.2");
const pt = globalThis, _t = (r) => r, it = pt.trustedTypes, At = it ? it.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, Tt = "$lit$", P = `lit$${Math.random().toFixed(9).slice(2)}$`, Pt = "?" + P, Qt = `<${Pt}>`, C = document, Z = () => C.createComment(""), W = (r) => r === null || typeof r != "object" && typeof r != "function", ft = Array.isArray, te = (r) => ft(r) || typeof r?.[Symbol.iterator] == "function", ht = `[ 	
\f\r]`, L = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Mt = /-->/g, St = />/g, N = RegExp(`>|${ht}(?:([^\\s"'>=/]+)(${ht}*=${ht}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), xt = /'/g, kt = /"/g, Ot = /^(?:script|style|textarea|title)$/i, ee = (r) => (t, ...e) => ({ _$litType$: r, strings: t, values: e }), et = ee(1), I = /* @__PURE__ */ Symbol.for("lit-noChange"), $ = /* @__PURE__ */ Symbol.for("lit-nothing"), wt = /* @__PURE__ */ new WeakMap(), U = C.createTreeWalker(C, 129);
function Ht(r, t) {
  if (!ft(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return At !== void 0 ? At.createHTML(t) : t;
}
const se = (r, t) => {
  const e = r.length - 1, s = [];
  let i, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = L;
  for (let d = 0; d < e; d++) {
    const l = r[d];
    let m, g, p = -1, S = 0;
    for (; S < l.length && (n.lastIndex = S, g = n.exec(l), g !== null); ) S = n.lastIndex, n === L ? g[1] === "!--" ? n = Mt : g[1] !== void 0 ? n = St : g[2] !== void 0 ? (Ot.test(g[2]) && (i = RegExp("</" + g[2], "g")), n = N) : g[3] !== void 0 && (n = N) : n === N ? g[0] === ">" ? (n = i ?? L, p = -1) : g[1] === void 0 ? p = -2 : (p = n.lastIndex - g[2].length, m = g[1], n = g[3] === void 0 ? N : g[3] === '"' ? kt : xt) : n === kt || n === xt ? n = N : n === Mt || n === St ? n = L : (n = N, i = void 0);
    const x = n === N && r[d + 1].startsWith("/>") ? " " : "";
    o += n === L ? l + Qt : p >= 0 ? (s.push(m), l.slice(0, p) + Tt + l.slice(p) + P + x) : l + P + (p === -2 ? d : x);
  }
  return [Ht(r, o + (r[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class K {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let o = 0, n = 0;
    const d = t.length - 1, l = this.parts, [m, g] = se(t, e);
    if (this.el = K.createElement(m, s), U.currentNode = this.el.content, e === 2 || e === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (i = U.nextNode()) !== null && l.length < d; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const p of i.getAttributeNames()) if (p.endsWith(Tt)) {
          const S = g[n++], x = i.getAttribute(p).split(P), O = /([.?@])?(.*)/.exec(S);
          l.push({ type: 1, index: o, name: O[2], strings: x, ctor: O[1] === "." ? ie : O[1] === "?" ? oe : O[1] === "@" ? ne : nt }), i.removeAttribute(p);
        } else p.startsWith(P) && (l.push({ type: 6, index: o }), i.removeAttribute(p));
        if (Ot.test(i.tagName)) {
          const p = i.textContent.split(P), S = p.length - 1;
          if (S > 0) {
            i.textContent = it ? it.emptyScript : "";
            for (let x = 0; x < S; x++) i.append(p[x], Z()), U.nextNode(), l.push({ type: 2, index: ++o });
            i.append(p[S], Z());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Pt) l.push({ type: 2, index: o });
      else {
        let p = -1;
        for (; (p = i.data.indexOf(P, p + 1)) !== -1; ) l.push({ type: 7, index: o }), p += P.length - 1;
      }
      o++;
    }
  }
  static createElement(t, e) {
    const s = C.createElement("template");
    return s.innerHTML = t, s;
  }
}
function F(r, t, e = r, s) {
  if (t === I) return t;
  let i = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const o = W(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== o && (i?._$AO?.(!1), o === void 0 ? i = void 0 : (i = new o(r), i._$AT(r, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = i : e._$Cl = i), i !== void 0 && (t = F(r, i._$AS(r, t.values), i, s)), t;
}
class re {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: s } = this._$AD, i = (t?.creationScope ?? C).importNode(e, !0);
    U.currentNode = i;
    let o = U.nextNode(), n = 0, d = 0, l = s[0];
    for (; l !== void 0; ) {
      if (n === l.index) {
        let m;
        l.type === 2 ? m = new V(o, o.nextSibling, this, t) : l.type === 1 ? m = new l.ctor(o, l.name, l.strings, this, t) : l.type === 6 && (m = new ae(o, this, t)), this._$AV.push(m), l = s[++d];
      }
      n !== l?.index && (o = U.nextNode(), n++);
    }
    return U.currentNode = C, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class V {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, s, i) {
    this.type = 2, this._$AH = $, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = F(this, t, e), W(t) ? t === $ || t == null || t === "" ? (this._$AH !== $ && this._$AR(), this._$AH = $) : t !== this._$AH && t !== I && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : te(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== $ && W(this._$AH) ? this._$AA.nextSibling.data = t : this.T(C.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = K.createElement(Ht(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const o = new re(i, this), n = o.u(this.options);
      o.p(e), this.T(n), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = wt.get(t.strings);
    return e === void 0 && wt.set(t.strings, e = new K(t)), e;
  }
  k(t) {
    ft(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const o of t) i === e.length ? e.push(s = new V(this.O(Z()), this.O(Z()), this, this.options)) : s = e[i], s._$AI(o), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = _t(t).nextSibling;
      _t(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class nt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, i, o) {
    this.type = 1, this._$AH = $, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = $;
  }
  _$AI(t, e = this, s, i) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) t = F(this, t, e, 0), n = !W(t) || t !== this._$AH && t !== I, n && (this._$AH = t);
    else {
      const d = t;
      let l, m;
      for (t = o[0], l = 0; l < o.length - 1; l++) m = F(this, d[s + l], e, l), m === I && (m = this._$AH[l]), n ||= !W(m) || m !== this._$AH[l], m === $ ? t = $ : t !== $ && (t += (m ?? "") + o[l + 1]), this._$AH[l] = m;
    }
    n && !i && this.j(t);
  }
  j(t) {
    t === $ ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class ie extends nt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === $ ? void 0 : t;
  }
}
class oe extends nt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== $);
  }
}
class ne extends nt {
  constructor(t, e, s, i, o) {
    super(t, e, s, i, o), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = F(this, t, e, 0) ?? $) === I) return;
    const s = this._$AH, i = t === $ && s !== $ || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, o = t !== $ && (s === $ || i);
    i && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class ae {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    F(this, t);
  }
}
const he = pt.litHtmlPolyfillSupport;
he?.(K, V), (pt.litHtmlVersions ??= []).push("3.3.2");
const le = (r, t, e) => {
  const s = e?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const o = e?.renderBefore ?? null;
    s._$litPart$ = i = new V(t.insertBefore(Z(), o), o, void 0, e ?? {});
  }
  return i._$AI(r), i;
};
const mt = globalThis;
class q extends Y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = le(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return I;
  }
}
q._$litElement$ = !0, q.finalized = !0, mt.litElementHydrateSupport?.({ LitElement: q });
const ce = mt.litElementPolyfillSupport;
ce?.({ LitElement: q });
(mt.litElementVersions ??= []).push("4.2.2");
const ue = (r) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(r, t);
  }) : customElements.define(r, t);
};
const de = { attribute: !0, type: String, converter: rt, reflect: !1, hasChanged: dt }, pe = (r = de, t, e) => {
  const { kind: s, metadata: i } = e;
  let o = globalThis.litPropertyMetadata.get(i);
  if (o === void 0 && globalThis.litPropertyMetadata.set(i, o = /* @__PURE__ */ new Map()), s === "setter" && ((r = Object.create(r)).wrapped = !0), o.set(e.name, r), s === "accessor") {
    const { name: n } = e;
    return { set(d) {
      const l = t.get.call(this);
      t.set.call(this, d), this.requestUpdate(n, l, r, !0, d);
    }, init(d) {
      return d !== void 0 && this.C(n, void 0, r, d), d;
    } };
  }
  if (s === "setter") {
    const { name: n } = e;
    return function(d) {
      const l = this[n];
      t.call(this, d), this.requestUpdate(n, l, r, !0, d);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function gt(r) {
  return (t, e) => typeof e == "object" ? pe(r, t, e) : ((s, i, o) => {
    const n = i.hasOwnProperty(o);
    return i.constructor.createProperty(o, s), n ? Object.getOwnPropertyDescriptor(i, o) : void 0;
  })(r, t, e);
}
function G(r) {
  return gt({ ...r, state: !0, attribute: !1 });
}
const fe = (r, t, e) => (e.configurable = !0, e.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(r, t, e), e);
function at(r, t) {
  return (e, s, i) => {
    const o = (n) => n.renderRoot?.querySelector(r) ?? null;
    return fe(e, s, { get() {
      return o(this);
    } });
  };
}
function me(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var lt = { exports: {} }, Dt;
function ge() {
  return Dt || (Dt = 1, (function(r) {
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
      }, e = t.en_US, s = new i(e, 0, !1);
      r.exports = s, typeof Date.now != "function" && (Date.now = function() {
        return +/* @__PURE__ */ new Date();
      });
      function i(u, b, D) {
        var R = u || e, A = b || 0, E = D || !1, T = 0, Q;
        function Nt(v, a) {
          var c;
          if (a) {
            if (c = a.getTime(), E) {
              var h = g(a);
              if (a = new Date(c + h + A), g(a) !== h) {
                var f = g(a);
                a = new Date(c + f + A);
              }
            }
          } else {
            var y = Date.now();
            y > T ? (T = y, Q = new Date(T), c = T, E && (Q = new Date(T + g(Q) + A))) : c = T, a = Q;
          }
          return k(v, a, R, c);
        }
        function k(v, a, c, y) {
          for (var h = "", f = null, j = !1, Ut = v.length, tt = !1, B = 0; B < Ut; B++) {
            var z = v.charCodeAt(B);
            if (j === !0) {
              if (z === 45) {
                f = "";
                continue;
              } else if (z === 95) {
                f = " ";
                continue;
              } else if (z === 48) {
                f = "0";
                continue;
              } else if (z === 58) {
                tt && O("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"), tt = !0;
                continue;
              }
              switch (z) {
                // Examples for new Date(0) in GMT
                // '%'
                // case '%':
                case 37:
                  h += "%";
                  break;
                // 'Thursday'
                // case 'A':
                case 65:
                  h += c.days[a.getDay()];
                  break;
                // 'January'
                // case 'B':
                case 66:
                  h += c.months[a.getMonth()];
                  break;
                // '19'
                // case 'C':
                case 67:
                  h += o(Math.floor(a.getFullYear() / 100), f);
                  break;
                // '01/01/70'
                // case 'D':
                case 68:
                  h += k(c.formats.D, a, c, y);
                  break;
                // '1970-01-01'
                // case 'F':
                case 70:
                  h += k(c.formats.F, a, c, y);
                  break;
                // '00'
                // case 'H':
                case 72:
                  h += o(a.getHours(), f);
                  break;
                // '12'
                // case 'I':
                case 73:
                  h += o(d(a.getHours()), f);
                  break;
                // '000'
                // case 'L':
                case 76:
                  h += n(Math.floor(y % 1e3));
                  break;
                // '00'
                // case 'M':
                case 77:
                  h += o(a.getMinutes(), f);
                  break;
                // 'am'
                // case 'P':
                case 80:
                  h += a.getHours() < 12 ? c.am : c.pm;
                  break;
                // '00:00'
                // case 'R':
                case 82:
                  h += k(c.formats.R, a, c, y);
                  break;
                // '00'
                // case 'S':
                case 83:
                  h += o(a.getSeconds(), f);
                  break;
                // '00:00:00'
                // case 'T':
                case 84:
                  h += k(c.formats.T, a, c, y);
                  break;
                // '00'
                // case 'U':
                case 85:
                  h += o(l(a, "sunday"), f);
                  break;
                // '00'
                // case 'W':
                case 87:
                  h += o(l(a, "monday"), f);
                  break;
                // '16:00:00'
                // case 'X':
                case 88:
                  h += k(c.formats.X, a, c, y);
                  break;
                // '1970'
                // case 'Y':
                case 89:
                  h += a.getFullYear();
                  break;
                // 'GMT'
                // case 'Z':
                case 90:
                  if (E && A === 0)
                    h += "GMT";
                  else {
                    var Ct = p(a);
                    h += Ct || "";
                  }
                  break;
                // 'Thu'
                // case 'a':
                case 97:
                  h += c.shortDays[a.getDay()];
                  break;
                // 'Jan'
                // case 'b':
                case 98:
                  h += c.shortMonths[a.getMonth()];
                  break;
                // ''
                // case 'c':
                case 99:
                  h += k(c.formats.c, a, c, y);
                  break;
                // '01'
                // case 'd':
                case 100:
                  h += o(a.getDate(), f);
                  break;
                // ' 1'
                // case 'e':
                case 101:
                  h += o(a.getDate(), f ?? " ");
                  break;
                // 'Jan'
                // case 'h':
                case 104:
                  h += c.shortMonths[a.getMonth()];
                  break;
                // '000'
                // case 'j':
                case 106:
                  var Rt = new Date(a.getFullYear(), 0, 1), w = Math.ceil((a.getTime() - Rt.getTime()) / (1e3 * 60 * 60 * 24));
                  h += n(w);
                  break;
                // ' 0'
                // case 'k':
                case 107:
                  h += o(a.getHours(), f ?? " ");
                  break;
                // '12'
                // case 'l':
                case 108:
                  h += o(d(a.getHours()), f ?? " ");
                  break;
                // '01'
                // case 'm':
                case 109:
                  h += o(a.getMonth() + 1, f);
                  break;
                // '\n'
                // case 'n':
                case 110:
                  h += `
`;
                  break;
                // '1st'
                // case 'o':
                case 111:
                  var w = a.getDate();
                  c.ordinalSuffixes ? h += String(w) + (c.ordinalSuffixes[w - 1] || m(w)) : h += String(w) + m(w);
                  break;
                // 'AM'
                // case 'p':
                case 112:
                  h += a.getHours() < 12 ? c.AM : c.PM;
                  break;
                // '12:00:00 AM'
                // case 'r':
                case 114:
                  h += k(c.formats.r, a, c, y);
                  break;
                // '0'
                // case 's':
                case 115:
                  h += Math.floor(y / 1e3);
                  break;
                // '\t'
                // case 't':
                case 116:
                  h += "	";
                  break;
                // '4'
                // case 'u':
                case 117:
                  var w = a.getDay();
                  h += w === 0 ? 7 : w;
                  break;
                // 1 - 7, Monday is first day of the week
                // ' 1-Jan-1970'
                // case 'v':
                case 118:
                  h += k(c.formats.v, a, c, y);
                  break;
                // '4'
                // case 'w':
                case 119:
                  h += a.getDay();
                  break;
                // 0 - 6, Sunday is first day of the week
                // '12/31/69'
                // case 'x':
                case 120:
                  h += k(c.formats.x, a, c, y);
                  break;
                // '70'
                // case 'y':
                case 121:
                  h += o(a.getFullYear() % 100, f);
                  break;
                // '+0000'
                // case 'z':
                case 122:
                  if (E && A === 0)
                    h += tt ? "+00:00" : "+0000";
                  else {
                    var J;
                    A !== 0 ? J = A / (60 * 1e3) : J = -a.getTimezoneOffset();
                    var jt = J < 0 ? "-" : "+", zt = tt ? ":" : "", Yt = Math.floor(Math.abs(J / 60)), It = Math.abs(J % 60);
                    h += jt + o(Yt) + zt + o(It);
                  }
                  break;
                default:
                  j && (h += "%"), h += v[B];
                  break;
              }
              f = null, j = !1;
              continue;
            }
            if (z === 37) {
              j = !0;
              continue;
            }
            h += v[B];
          }
          return h;
        }
        var H = Nt;
        return H.localize = function(v) {
          return new i(v || R, A, E);
        }, H.localizeByIdentifier = function(v) {
          var a = t[v];
          return a ? H.localize(a) : (O('[WARNING] No locale found with identifier "' + v + '".'), H);
        }, H.timezone = function(v) {
          var a = A, c = E, y = typeof v;
          if (y === "number" || y === "string")
            if (c = !0, y === "string") {
              var h = v[0] === "-" ? -1 : 1, f = parseInt(v.slice(1, 3), 10), j = parseInt(v.slice(3, 5), 10);
              a = h * (60 * f + j) * 60 * 1e3;
            } else y === "number" && (a = v * 60 * 1e3);
          return new i(R, a, c);
        }, H.utc = function() {
          return new i(R, A, !0);
        }, H;
      }
      function o(u, b) {
        return b === "" || u > 9 ? "" + u : (b == null && (b = "0"), b + u);
      }
      function n(u) {
        return u > 99 ? u : u > 9 ? "0" + u : "00" + u;
      }
      function d(u) {
        return u === 0 ? 12 : u > 12 ? u - 12 : u;
      }
      function l(u, b) {
        b = b || "sunday";
        var D = u.getDay();
        b === "monday" && (D === 0 ? D = 6 : D--);
        var R = Date.UTC(u.getFullYear(), 0, 1), A = Date.UTC(u.getFullYear(), u.getMonth(), u.getDate()), E = Math.floor((A - R) / 864e5), T = (E + 7 - D) / 7;
        return Math.floor(T);
      }
      function m(u) {
        var b = u % 10, D = u % 100;
        if (D >= 11 && D <= 13 || b === 0 || b >= 4)
          return "th";
        switch (b) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
        }
      }
      function g(u) {
        return (u.getTimezoneOffset() || 0) * 6e4;
      }
      function p(u, b) {
        return S() || x(u);
      }
      function S(u, b) {
        return null;
      }
      function x(u) {
        var b = u.toString().match(/\(([\w\s]+)\)/);
        return b && b[1];
      }
      function O(u) {
        typeof console < "u" && typeof console.warn == "function" && console.warn(u);
      }
    })();
  })(lt)), lt.exports;
}
var be = ge();
const ye = /* @__PURE__ */ me(be);
var $e = Object.defineProperty, ve = Object.getOwnPropertyDescriptor, M = (r, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? ve(t, e) : t, o = r.length - 1, n; o >= 0; o--)
    (n = r[o]) && (i = (s ? n(t, e, i) : n(i)) || i);
  return s && i && $e(t, e, i), i;
};
let _ = class extends q {
  constructor() {
    super(...arguments), this.entryJson = "", this.sk = "", this.entry = { id: null, title: "", body: "", status: null }, this.form = { id: null, title: "", body: "", publishLater: !1 }, this.saving = !1, this.progress = "", this.existingBackup = null;
  }
  firstUpdated() {
    const r = document.querySelector(".loading");
    r && r.remove(), this.entryJson && (this.entry = JSON.parse(this.entryJson), this.form = {
      ...this.form,
      id: this.entry.id,
      title: this.entry.title,
      body: this.entry.body,
      publishLater: this.entry.status === "scheduled"
    }), this.checkBackup(), setInterval(() => this.saveBackup(), 3e3), this.bodyTextArea.addEventListener("keydown", (t) => {
      (t.altKey ? "Alt-" : "") + (t.ctrlKey ? "Control-" : "") + (t.metaKey ? "Meta-" : "") + (t.shiftKey ? "Shift-" : "") + t.key === "Control-t" && (this.insertText("\\(  \\)", 3), t.preventDefault(), t.stopPropagation());
    });
  }
  checkBackup() {
    const r = `nogag-backup-${this.entry.id || "new"}`, t = localStorage.getItem(r);
    if (t) {
      const e = JSON.parse(t);
      (this.entry.title !== e.title || this.entry.body !== e.body) && (this.existingBackup = e);
    }
  }
  saveBackup() {
    if (this.entry.title !== this.form.title || this.entry.body !== this.form.body) {
      const r = `nogag-backup-${this.entry.id || "new"}`, t = {
        title: this.form.title,
        body: this.form.body,
        time: Date.now()
      };
      localStorage.setItem(r, JSON.stringify(t)), this.existingBackup = null;
    }
  }
  async saveEntry() {
    this.saving = !0, this.progress = "リクエスト中";
    const r = new FormData();
    if (r.set("id", this.form.id || ""), r.set("title", this.form.title), r.set("body", this.form.body), r.set("sk", this.sk), r.set("post_buffer", this.form.postBuffer ? "1" : ""), this.form.publishLater) {
      const t = this.entry.publish_at_epoch || this.entry.publish_at || Math.floor(Date.now() / 1e3) + 2592e3;
      r.set("publish_at", String(t)), r.set("status", "scheduled");
    } else
      r.set("status", "public");
    try {
      const s = (await (await fetch("/api/edit", {
        method: "POST",
        body: r
      })).json()).session_id;
      if (!s)
        throw new Error("保存に失敗しました");
      this.startSSE(s);
    } catch (t) {
      this.saving = !1, alert(t instanceof Error ? t.message : "エラーが発生しました");
    }
  }
  startSSE(r) {
    const t = new EventSource(`/api/edit/progress?sid=${r}`);
    t.onmessage = (e) => {
      const s = JSON.parse(e.data);
      switch (s.type) {
        case "progress":
          this.progress = this.mapProgressMessage(s.message);
          break;
        case "done":
          localStorage.removeItem(`nogag-backup-${this.entry.id || "new"}`), this.progress = "完了", this.saving = !1, t.close(), location.href = s.location;
          break;
        case "error":
          this.progress = "エラー: " + s.message, this.saving = !1, t.close(), alert("保存に失敗しました: " + s.message);
          break;
      }
    }, t.onerror = () => {
      this.saving = !1, t.close(), alert("通信エラーが発生しました");
    };
  }
  mapProgressMessage(r) {
    return {
      saving: "保存中",
      "update-similar-entries": "関連エントリを構築中",
      "posting-new-job": "ジョブを投入中",
      done: "完了"
    }[r] || r;
  }
  insertTag(r) {
    this.form = { ...this.form, title: `[${r}]${this.form.title}` }, this.tagDialog.close(), this.titleInput.focus();
  }
  restoreBackup() {
    this.existingBackup && (this.form = {
      ...this.form,
      title: this.existingBackup.title,
      body: this.existingBackup.body
    }, this.restoreDialog.close());
  }
  async openUploadDialog() {
    const r = document.createElement("input");
    r.type = "file", r.oninput = async () => {
      if (!r.files?.[0]) return;
      const t = new FormData();
      t.append("file", r.files[0]), t.append("sk", this.sk);
      try {
        const s = await (await fetch("/api/upload/image", {
          method: "POST",
          body: t
        })).json(), i = `<span itemscope itemtype="http://schema.org/Photograph"><a href="${s.uploaded}" class="picasa" itemprop="url"><img src="${s.uploaded}" alt="photo" itemprop="image"/></a></span>
`;
        this.insertText(i, !0);
      } catch {
        alert("アップロードに失敗しました");
      }
    }, r.click();
  }
  insertText(r, t = !1) {
    const e = this.bodyTextArea, s = e.selectionStart, i = e.selectionEnd, o = e.value;
    e.value = o.substring(0, s) + r + o.substring(i), this.form = { ...this.form, body: e.value.replace(/\r\n/g, `
`) }, setTimeout(() => {
      typeof t == "boolean" && t ? (e.selectionStart = s, e.selectionEnd = s + r.length) : typeof t == "number" ? e.selectionStart = e.selectionEnd = s + t : e.selectionStart = e.selectionEnd = s + r.length, e.focus();
    }, 0);
  }
  render() {
    return et`
      <div class="container">
        <div class="main">
          <input
            id="title"
            type="text"
            placeholder="タイトル"
            .value="${this.form.title}"
            @input="${(r) => this.form = { ...this.form, title: r.target.value }}"
          />
          <div class="toolbar">
            <button type="button" @click="${() => this.tagDialog.showModal()}">🏷️ タグ</button>
            <button type="button" @click="${this.openUploadDialog}">📷 写真</button>
          </div>
          <div class="body-container">
            <textarea
              id="body"
              placeholder="本文"
              required
              .value="${this.form.body}"
              @input="${(r) => this.form = { ...this.form, body: r.target.value }}"
            ></textarea>
          </div>
        </div>

        <div class="global-actions">
          ${this.saving ? et`<div class="progress-bar" style="width: 100%"></div>` : ""}
          <div class="buttons">
            <div class="options">
              <label>
                <input type="checkbox" @change="${(r) => this.form = { ...this.form, publishLater: r.target.checked }}" .checked="${this.form.publishLater}">
                公開を遅延
              </label>
            </div>
            <button
              type="button"
              class="submit-button"
              @click="${this.saveEntry}"
              ?disabled="${this.saving}"
            >
              ${this.saving ? this.progress || "リクエスト中" : "更新"}
            </button>
            ${this.existingBackup ? et`
              <button id="restore" type="button" class="submit-button" @click="${() => this.restoreDialog.showModal()}">
                復元...
              </button>
            ` : ""}
          </div>
        </div>
      </div>

      <dialog id="tagDialog">
        <h3>タグを選択</h3>
        <div class="tag-list">
          ${["tech", "photo", "redeveloped", "stablediffusion", "photoshopped"].map((r) => et`
            <div class="tag-item" @click="${() => this.insertTag(r)}">${r}</div>
          `)}
        </div>
        <button type="button" @click="${() => this.tagDialog.close()}" style="margin-top: 16px;">キャンセル</button>
      </dialog>

      <dialog id="restoreDialog">
        <h3>自動バックアップの復元</h3>
        <p>
          ${this.existingBackup ? ye("%Y年%m月%d日%H時", new Date(this.existingBackup.time)) : ""}
          に保存されたバックアップを復元しますか?
        </p>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button type="button" @click="${() => this.restoreDialog.close()}">キャンセル</button>
          <button type="button" class="submit-button" @click="${this.restoreBackup}">復元</button>
        </div>
      </dialog>
    `;
  }
};
_.styles = Bt`
    :host {
      display: block;
      height: 100%;
      width: 100%;
      background: #f7f8f9;
      font-family: sans-serif;
    }

    .container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    .main {
      flex: 1;
      overflow: auto;
      padding: 10px;
      max-width: 40em;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }

    .toolbar {
      padding: 10px 0;
      display: flex;
      gap: 8px;
    }

    .toolbar button {
      background: #fff;
      border: 1px solid #dfe5e7;
      border-radius: 3px;
      padding: 8px;
      cursor: pointer;
    }

    input[type="text"], textarea {
      margin: 0;
      font-family: inherit;
      border: 1px solid #dfe5e7;
      box-sizing: border-box;
      width: 100%;
      padding: 10px;
      border-radius: 3px;
      font-size: 110%;
    }

    .body-container {
      flex: 1;
      min-height: 300px;
    }

    textarea {
      height: 100%;
      resize: none;
    }

    .global-actions {
      background: #fff;
      padding: 14px 10px;
      box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
    }

    .buttons {
      max-width: 40em;
      margin: 0 auto;
    }

    .options {
      padding-bottom: 16px;
      display: flex;
      gap: 16px;
    }

    .submit-button {
      color: #fff;
      background: #00acc1;
      border: none;
      padding: 12px 24px;
      border-radius: 3px;
      font-size: 100%;
      cursor: pointer;
    }

    .submit-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    #restore {
      background: #757575;
      margin-left: 8px;
    }

    dialog {
      border: none;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      padding: 20px;
      max-width: 600px;
      width: 90%;
    }

    dialog::backdrop {
      background: rgba(0,0,0,0.5);
    }

    .tag-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tag-item {
      padding: 12px;
      background: #eee;
      border-radius: 4px;
      cursor: pointer;
    }

    .tag-item:hover {
      background: #ddd;
    }

    .progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      height: 4px;
      background: #00acc1;
      transition: width 0.3s;
    }
  `;
M([
  gt({ type: String, attribute: "entry-json" })
], _.prototype, "entryJson", 2);
M([
  gt({ type: String })
], _.prototype, "sk", 2);
M([
  G()
], _.prototype, "entry", 2);
M([
  G()
], _.prototype, "form", 2);
M([
  G()
], _.prototype, "saving", 2);
M([
  G()
], _.prototype, "progress", 2);
M([
  G()
], _.prototype, "existingBackup", 2);
M([
  at("#title")
], _.prototype, "titleInput", 2);
M([
  at("#body")
], _.prototype, "bodyTextArea", 2);
M([
  at("#tagDialog")
], _.prototype, "tagDialog", 2);
M([
  at("#restoreDialog")
], _.prototype, "restoreDialog", 2);
_ = M([
  ue("app-editor")
], _);
//# sourceMappingURL=admin-front.mjs.map
