import { BaseProcessor } from './base.js';

/**
 * ABCProcessor
 * ABC 記法を楽譜 SVG に変換
 */
export class ABCProcessor extends BaseProcessor {
  static appliesRegexp = /lang-abc/;

  constructor() {
    super();
    this.abcjs = null;
  }

  applies(dom) {
    return !!(dom.querySelector('pre.lang-abc, pre.code.lang-abc') || dom.querySelector('pre > code.language-abc'));
  }

  async prepare() {
    const { default: abcjs } = await import('abcjs');
    this.abcjs = abcjs;
  }

  async process(dom, baseURL) {
    const hatenaCodes = dom.querySelectorAll('pre.lang-abc, pre.code.lang-abc');
    const markdownCodes = dom.querySelectorAll('pre > code.language-abc');
    const codes = [...hatenaCodes, ...markdownCodes];

    console.error(`[abc] Found ${codes.length} ABC blocks (${hatenaCodes.length} Hatena, ${markdownCodes.length} Markdown)`);

    const startTime = Date.now();
    let converted = 0;

    // abcjs は内部でグローバルな window/document/navigator を参照するため、
    // JSDOM のインスタンスからこれらを取得してグローバルに設定する。
    // また、abcjs の Svg.prototype.guessWidth が getBBox() の失敗を
    // catch してフォールバックすることを期待する。
    const doc = dom.ownerDocument;
    const win = doc.defaultView;
    
    const originalWindow = global.window;
    const originalDocument = global.document;
    const originalNavigator = global.navigator;
    
    try {
      global.window = win;
      global.document = doc;
      // global.navigator は読み取り専用の場合があるため Object.defineProperty を使用
      Object.defineProperty(global, 'navigator', {
        value: win.navigator,
        configurable: true,
        writable: true
      });

      for (const code of codes) {
        const abcData = code.textContent.trim();
        if (!abcData) continue;

        // abcjs.renderAbc(target, abcString, params)
        // target に DOM 要素を渡すと、その中に SVG が生成される。
        const container = doc.createElement('div');
        container.className = 'abc-render';
        
        this.abcjs.renderAbc(container, abcData, {
          responsive: 'resize',
          paddingtop: 0,
          paddingbottom: 0,
          paddingright: 0,
          paddingleft: 0
        });
        
        // 置換対象の要素を決定
        // Markdown の場合は pre > code なので pre を置換したい
        let target = code;
        if (code.tagName === 'CODE' && code.parentNode && code.parentNode.tagName === 'PRE') {
          target = code.parentNode;
        }
        
        // 要素を生成された <div> で置換
        target.parentNode.replaceChild(container, target);
        converted++;
      }
    } catch (err) {
      console.error(`[abc] Error during conversion: ${err.message}\n${err.stack}`);
    } finally {
      // グローバル環境を復元
      global.window = originalWindow;
      global.document = originalDocument;
      global.navigator = originalNavigator;
    }

    console.error(`[abc] Completed in ${Date.now() - startTime}ms (converted ${converted}/${codes.length} blocks)`);
  }
}
