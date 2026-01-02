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
 * @param {Document} dom - JSDOM の document.body
 * @returns {Promise<Document>}
 */
export async function processMathJax(dom) {
  // Quick check: もし innerHTML に数式記法が含まれていなければスキップ
  if (!dom.innerHTML.match(/\\\(|\$\$/)) {
    console.error('[mathjax] No math notation found, skipping');
    return dom;
  }

  const startTime = Date.now();
  console.error('[mathjax] Processing math notation');

  try {
    await ensureMathJaxReady();
    console.error('[mathjax] MathJax initialized');

    // Display math ($$...$$) を先に処理（inline math との競合を避ける）
    await processTextNodesWithPattern(dom, /\$\$(.*?)\$\$/gs, true, 'display');

    // Inline math (\\(...\\)) を処理
    await processTextNodesWithPattern(dom, /\\\((.*?)\\\)/gs, false, 'inline');

    console.error(`[mathjax] Completed in ${Date.now() - startTime}ms`);
    return dom;
  } catch (err) {
    console.error('[mathjax] Processing failed:', err.message);
    // エラー時は元の DOM を返す
    return dom;
  }
}

/**
 * DOM ツリーから全テキストノードを取得
 * @param {Node} node - ルートノード
 * @returns {Array<Text>} - テキストノードの配列
 */
function getTextNodes(node) {
  const textNodes = [];
  // NodeFilter.SHOW_TEXT = 4 (use numeric constant for JSDOM compatibility)
  const walker = node.ownerDocument.createTreeWalker(
    node,
    4, // NodeFilter.SHOW_TEXT
    null,
    false
  );

  let currentNode;
  while (currentNode = walker.nextNode()) {
    textNodes.push(currentNode);
  }

  return textNodes;
}

/**
 * テキストノードと文字オフセットのマッピングを構築
 * @param {Node} dom - ルートノード
 * @returns {{map: Array, fullText: string}} - マッピング情報と統合テキスト
 */
function buildTextNodeMap(dom) {
  const textNodes = getTextNodes(dom);
  let offset = 0;
  const map = [];

  for (const node of textNodes) {
    const text = node.nodeValue;
    map.push({
      node,
      startOffset: offset,
      endOffset: offset + text.length,
      text
    });
    offset += text.length;
  }

  return {
    map,
    fullText: map.map(m => m.text).join('')
  };
}

/**
 * 文字オフセットから DOM Range を作成
 * @param {{map: Array}} nodeMap - テキストノードマップ
 * @param {number} startOffset - 開始オフセット
 * @param {number} endOffset - 終了オフセット
 * @returns {Range} - 作成された Range
 */
function createRangeFromOffset(nodeMap, startOffset, endOffset) {
  let startNode = null;
  let startNodeOffset = 0;
  let endNode = null;
  let endNodeOffset = 0;

  for (const entry of nodeMap.map) {
    // 開始位置を見つける
    if (startNode === null && startOffset >= entry.startOffset && startOffset < entry.endOffset) {
      startNode = entry.node;
      startNodeOffset = startOffset - entry.startOffset;
    }

    // 終了位置を見つける
    if (endOffset > entry.startOffset && endOffset <= entry.endOffset) {
      endNode = entry.node;
      endNodeOffset = endOffset - entry.startOffset;
      break;
    }
  }

  if (!startNode || !endNode) {
    throw new Error(`Cannot create range for offset ${startOffset}-${endOffset}`);
  }

  const range = startNode.ownerDocument.createRange();
  range.setStart(startNode, startNodeOffset);
  range.setEnd(endNode, endNodeOffset);
  return range;
}

/**
 * Range を MathJax コンテナ（SVG 含む）に置換
 * @param {Range} range - 置換対象の Range
 * @param {string} containerHTML - mjx-container の HTML 文字列
 */
function replaceRangeWithSVG(range, containerHTML) {
  const doc = range.startContainer.ownerDocument;
  const tempDiv = doc.createElement('div');
  tempDiv.innerHTML = containerHTML;
  const element = tempDiv.firstChild;

  range.deleteContents();
  range.insertNode(element);
}

/**
 * DOM 内のテキストノードを走査して数式を MathJax SVG に置換
 * Range を使って複数のテキストノードにまたがる数式にも対応
 * @param {Document} dom - JSDOM の document.body
 * @param {RegExp} regex - マッチパターン
 * @param {boolean} display - display mode かどうか
 * @param {string} type - 'display' or 'inline' (ログ用)
 * @returns {Promise<void>}
 */
async function processTextNodesWithPattern(dom, regex, display, type) {
  // テキストノードマップを構築
  const nodeMap = buildTextNodeMap(dom);

  // デバッグ: fullText の内容を確認
  console.error(`[mathjax] fullText (${nodeMap.fullText.length} chars):`, JSON.stringify(nodeMap.fullText));

  // 統合テキストに対してマッチング
  const matches = [...nodeMap.fullText.matchAll(regex)];

  if (matches.length === 0) {
    console.error(`[mathjax] Found 0 ${type} math expressions`);
    return;
  }

  console.error(`[mathjax] Found ${matches.length} ${type} math expressions`);

  // 後ろから処理（Range の位置がずれないように）
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const startOffset = match.index;
    const endOffset = match.index + match[0].length;

    try {
      // TeX を mjx-container (SVG 含む) に変換
      const mjxContainer = await MathJax.tex2svgPromise(match[1], {display});
      const adaptor = MathJax.startup.adaptor;
      const containerHTML = adaptor.outerHTML(mjxContainer);

      // Range を作成して置換
      const range = createRangeFromOffset(nodeMap, startOffset, endOffset);
      replaceRangeWithSVG(range, containerHTML);

      const preview = match[1].substring(0, 50);
      console.error(`[mathjax] Converted ${display ? 'display' : 'inline'} math: ${preview}${match[1].length > 50 ? '...' : ''}`);
    } catch (err) {
      console.error(`[mathjax] Failed to convert TeX: ${match[1]}`, err.message);
      // エラー時は元の記法を維持（何もしない）
    }
  }
}

