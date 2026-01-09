import { BaseProcessor } from './base.js';

/**
 * MathJaxProcessor
 * LaTeX 記法 (\\(...\\) と $$...$$) を SVG に変換
 */
export class MathJaxProcessor extends BaseProcessor {
  constructor() {
    super();
    this.MathJax = null;
    this.mathjaxReady = null;
  }

  applies(dom) {
    return /\\\(|\$\$/.test(dom.textContent);
  }

  async prepare() {
    const { default: MathJax } = await import('mathjax');
    this.MathJax = MathJax;
    this.mathjaxReady = this.MathJax.init({
      loader: {load: ['input/tex', 'output/svg']}
    });
    await this.mathjaxReady;
  }

  async process(dom, baseURL) {
    // Display math ($$...$$) を先に処理（inline math との競合を避ける）
    await this._processTextNodesWithPattern(dom, /\$\$(.*?)\$\$/gs, true, 'display');

    // Inline math (\\(...\\)) を処理
    await this._processTextNodesWithPattern(dom, /\\\((.*?)\\\)/gs, false, 'inline');
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
  async _processTextNodesWithPattern(dom, regex, display, type) {
    // テキストノードマップを構築
    const nodeMap = this._buildTextNodeMap(dom);

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
        const mjxContainer = await this.MathJax.tex2svgPromise(match[1], {display});
        const adaptor = this.MathJax.startup.adaptor;
        const containerHTML = adaptor.outerHTML(mjxContainer);

        // Range を作成して置換
        const range = this._createRangeFromOffset(nodeMap, startOffset, endOffset);
        this._replaceRangeWithSVG(range, containerHTML);

        const preview = match[1].substring(0, 50);
        console.error(`[mathjax] Converted ${display ? 'display' : 'inline'} math: ${preview}${match[1].length > 50 ? '...' : ''}`);
      } catch (err) {
        console.error(`[mathjax] Failed to convert TeX: ${match[1]}`, err.message);
        // エラー時は元の記法を維持（何もしない）
      }
    }
  }

  /**
   * DOM ツリーから全テキストノードを取得（特定のタグ内は除外）
   * @param {Node} node - ルートノード
   * @returns {Array<Text>} - テキストノードの配列
   */
  _getTextNodes(node) {
    const textNodes = [];
    const doc = node.ownerDocument;
    
    // NodeFilter.SHOW_TEXT = 4
    const walker = doc.createTreeWalker(
      node,
      4,
      {
        acceptNode: (n) => {
          // pre, code, script, style 内のテキストは無視
          let parent = n.parentNode;
          while (parent && parent !== node) {
            const tag = parent.tagName?.toLowerCase();
            if (tag === 'pre' || tag === 'code' || tag === 'script' || tag === 'style') {
              return 2; // NodeFilter.FILTER_REJECT
            }
            parent = parent.parentNode;
          }
          return 1; // NodeFilter.FILTER_ACCEPT
        }
      },
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
  _buildTextNodeMap(dom) {
    const textNodes = this._getTextNodes(dom);
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
  _createRangeFromOffset(nodeMap, startOffset, endOffset) {
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
   * @param {Range} range - 置換対象의 Range
   * @param {string} containerHTML - mjx-container の HTML 文字列
   */
  _replaceRangeWithSVG(range, containerHTML) {
    const doc = range.startContainer.ownerDocument;
    const tempDiv = doc.createElement('div');
    tempDiv.innerHTML = containerHTML;
    const element = tempDiv.firstChild;

    range.deleteContents();
    range.insertNode(element);
  }
}

