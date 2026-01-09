import abcjs from 'abcjs';

/**
 * ABC 記法の処理
 * <pre class="lang-abc"> または <pre class="code lang-abc"> 形式のコードブロックを abcjs で SVG に置換
 * @param {HTMLElement} dom - JSDOM の document.body
 * @returns {Promise<HTMLElement>}
 */
export async function processABC(dom) {
  const codes = dom.querySelectorAll('pre.lang-abc, pre.code.lang-abc');
  
  if (codes.length === 0) {
    console.error('[abc] No ABC blocks found, skipping');
    return dom;
  }

  console.error(`[abc] Found ${codes.length} ABC blocks`);

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
      
      abcjs.renderAbc(container, abcData, {
        responsive: 'resize',
        paddingtop: 0,
        paddingbottom: 0,
        paddingright: 0,
        paddingleft: 0
      });
      
      // <pre> を生成された <div> で置換
      code.parentNode.replaceChild(container, code);
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
  return dom;
}
