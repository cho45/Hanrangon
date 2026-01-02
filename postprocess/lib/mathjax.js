import MathJax from 'mathjax';

let mathjaxReady = null;

/**
 * MathJax の初期化（一度だけ実行）
 */
async function ensureMathJaxReady() {
  if (!mathjaxReady) {
    mathjaxReady = MathJax.init({
      loader: {load: ['input/tex', 'output/svg']}
    });
  }
  await mathjaxReady;
}

/**
 * MathJax 処理
 * LaTeX 記法 (\\(...\\) と $$...$$) を SVG に変換
 * @param {string} html - 処理対象の HTML
 * @returns {Promise<string>}
 */
export async function processMathJax(html) {
  // 数式記法が含まれていない場合はスキップ
  if (!html.match(/\\\(|\$\$/)) {
    console.error('[mathjax] No math notation found, skipping');
    return html;
  }

  const startTime = Date.now();
  console.error('[mathjax] Processing math notation');

  try {
    await ensureMathJaxReady();
    console.error('[mathjax] MathJax initialized');

    // Display math ($$...$$) を先に処理（inline math との競合を避ける）
    const displayMatches = html.match(/\$\$(.*?)\$\$/gs);
    console.error(`[mathjax] Found ${displayMatches ? displayMatches.length : 0} display math expressions`);
    html = await replaceMath(html, /\$\$(.*?)\$\$/gs, true);

    // Inline math (\\(...\\)) を処理
    const inlineMatches = html.match(/\\\((.*?)\\\)/gs);
    console.error(`[mathjax] Found ${inlineMatches ? inlineMatches.length : 0} inline math expressions`);
    html = await replaceMath(html, /\\\((.*?)\\\)/gs, false);

    console.error(`[mathjax] Completed in ${Date.now() - startTime}ms`);
    return html;
  } catch (err) {
    console.error('[mathjax] Processing failed:', err.message);
    // エラー時は元の HTML を返す
    return html;
  }
}

/**
 * HTML 内の数式を SVG に置換
 * @param {string} html - HTML 文字列
 * @param {RegExp} regex - マッチパターン
 * @param {boolean} display - display mode かどうか
 * @returns {Promise<string>}
 */
async function replaceMath(html, regex, display) {
  const parts = [];
  let lastIndex = 0;

  for (const match of html.matchAll(regex)) {
    // マッチ前のテキストを追加
    parts.push(html.substring(lastIndex, match.index));

    try {
      // TeX を SVG に変換
      const mjxContainer = await MathJax.tex2svgPromise(match[1], {display});

      // mjx-container から SVG 要素のみを抽出
      const adaptor = MathJax.startup.adaptor;
      const svg = adaptor.firstChild(mjxContainer);
      const svgString = adaptor.outerHTML(svg);

      parts.push(svgString);
    } catch (err) {
      console.error(`Failed to convert TeX: ${match[1]}`, err.message);
      // エラー時は元の記法を維持
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  // 残りのテキストを追加
  parts.push(html.substring(lastIndex));

  return parts.join('');
}
