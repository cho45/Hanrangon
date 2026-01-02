import hljs from 'highlight.js';

/**
 * シンタックスハイライト処理
 * <pre class="code lang-xxx"> 形式のコードブロックに highlight.js を適用
 * @param {Document} dom - JSDOM の document.body
 * @returns {Promise<Document>}
 */
export async function processHighlight(dom) {
  const codes = dom.querySelectorAll('pre.code');
  console.error(`[highlight] Found ${codes.length} code blocks`);

  if (codes.length === 0) {
    console.error('[highlight] No code blocks found, skipping');
    return dom;
  }

  const startTime = Date.now();
  let highlighted = 0;

  for (const code of codes) {
    if (/lang-(\S+)/.test(code.className)) {
      const lang = code.className.match(/lang-(\S+)/)[1];
      // highlight.js でハイライトを適用
      // highlightBlock は deprecated なので highlightElement を使用
      hljs.highlightElement(code);
      highlighted++;
      console.error(`[highlight] Highlighted code block (${lang})`);
    }
  }

  console.error(`[highlight] Completed in ${Date.now() - startTime}ms (highlighted ${highlighted}/${codes.length} blocks)`);
  return dom;
}
