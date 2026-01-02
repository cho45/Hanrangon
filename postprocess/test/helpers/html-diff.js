import { parse, serialize } from 'parse5';
import assert from 'node:assert';

/**
 * HTML を正規化する
 * - 属性をアルファベット順にソート
 * - 空白を正規化
 * - 意味論的に同等な HTML は同じ文字列になる
 */
export function normalizeHTML(html) {
  if (!html || html.trim() === '') {
    return '';
  }

  try {
    // parse5 で HTML をパース
    const fragment = parse(html, { sourceCodeLocationInfo: false });

    // ノードを正規化
    normalizeNode(fragment);

    // シリアライズして文字列に戻す
    let normalized = serialize(fragment);

    // 余分な空白を正規化
    normalized = normalized
      .replace(/\s+/g, ' ')  // 連続する空白を1つに
      .replace(/>\s+</g, '><')  // タグ間の空白を削除
      .trim();

    return normalized;
  } catch (e) {
    // パースエラー時は元の文字列を返す
    console.error('Failed to parse HTML:', e.message);
    return html.replace(/\s+/g, ' ').trim();
  }
}

/**
 * ノードを再帰的に正規化
 */
function normalizeNode(node) {
  if (!node) return;

  // 属性をソート
  if (node.attrs && Array.isArray(node.attrs)) {
    node.attrs.sort((a, b) => a.name.localeCompare(b.name));
  }

  // 子ノードを再帰的に処理
  if (node.childNodes && Array.isArray(node.childNodes)) {
    node.childNodes.forEach(child => normalizeNode(child));
  }

  // content (template タグなど)
  if (node.content) {
    normalizeNode(node.content);
  }
}

/**
 * 2つの HTML が意味論的に等しいかをアサート
 */
export function assertHTMLEqual(actual, expected, message) {
  const normalizedActual = normalizeHTML(actual);
  const normalizedExpected = normalizeHTML(expected);

  try {
    assert.strictEqual(normalizedActual, normalizedExpected, message);
  } catch (e) {
    // エラー時により詳細な情報を表示
    console.error('\n=== HTML Comparison Failed ===');
    console.error('Expected:', normalizedExpected);
    console.error('Actual:  ', normalizedActual);
    console.error('==============================\n');
    throw e;
  }
}

/**
 * HTML に特定の文字列が含まれているかをアサート
 */
export function assertHTMLContains(html, substring, message) {
  const normalized = normalizeHTML(html);
  const normalizedSubstring = normalizeHTML(substring);

  try {
    assert(
      normalized.includes(normalizedSubstring),
      message || `Expected HTML to contain: ${normalizedSubstring}`
    );
  } catch (e) {
    console.error('\n=== HTML Contains Check Failed ===');
    console.error('Looking for:', normalizedSubstring);
    console.error('In:         ', normalized);
    console.error('====================================\n');
    throw e;
  }
}

/**
 * HTML が正規表現にマッチするかをアサート
 */
export function assertHTMLMatches(html, regex, message) {
  const normalized = normalizeHTML(html);

  try {
    assert(
      regex.test(normalized),
      message || `Expected HTML to match: ${regex}`
    );
  } catch (e) {
    console.error('\n=== HTML Regex Match Failed ===');
    console.error('Pattern:', regex);
    console.error('HTML:   ', normalized);
    console.error('=================================\n');
    throw e;
  }
}
