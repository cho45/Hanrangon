import { describe, it } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { processMathJax } from '../lib/mathjax.js';

/**
 * HTML 文字列を JSDOM に変換してから processMathJax を実行し、結果の HTML を返す
 */
async function processMathJaxHTML(html) {
  const { window } = new JSDOM(html, {
    features: {
      FetchExternalResources: false,
      ProcessExternalResources: false,
      SkipExternalResources: /./
    }
  });
  const dom = window.document.body;
  await processMathJax(dom);
  const result = dom.innerHTML;
  window.close();
  return result;
}

describe('processMathJax', () => {
  it('should return HTML unchanged if no math notation exists', async () => {
    const html = '<p>This is plain text without math.</p>';
    const result = await processMathJaxHTML(html);
    assert.strictEqual(result, html);
  });

  it('should process inline LaTeX notation \\(...\\)', async () => {
    const html = '<p>Inline math: \\(E = mc^2\\)</p>';
    const result = await processMathJaxHTML(html);

    // 結果に SVG が含まれているか確認
    assert(result.includes('svg') || result.includes('SVG'), 'Result should contain SVG');
    assert(result.length > html.length, 'Processed HTML should be longer than original');
  });

  it('should process display LaTeX notation $$...$$', async () => {
    const html = '<p>Display math: $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$</p>';
    const result = await processMathJaxHTML(html);

    // 結果に SVG が含まれているか確認
    assert(result.includes('svg') || result.includes('SVG'), 'Result should contain SVG');
  });

  it('should handle multiple math expressions', async () => {
    const html = '<p>First: \\(a^2 + b^2 = c^2\\) and second: \\(E = mc^2\\)</p>';
    const result = await processMathJaxHTML(html);

    // 結果に SVG が含まれているか確認
    assert(result.includes('svg') || result.includes('SVG'), 'Result should contain SVG');
  });

  it('should handle errors gracefully', async () => {
    // 無効な LaTeX 記法
    const html = '<p>Invalid: \\(\\broken\\math\\)</p>';
    const result = await processMathJaxHTML(html);

    // エラーが発生しても何らかの結果が返ることを確認
    assert(typeof result === 'string');
  });

  it('should handle math notation across multiple text nodes (with <br>)', async () => {
    const html = '<p>$$<br>\nZ_0 = \\sqrt{ \\frac{ L }{ C } }<br>\n$$</p>';
    const result = await processMathJaxHTML(html);

    // 結果に SVG が含まれているか確認
    assert(result.includes('svg') || result.includes('SVG'), 'Result should contain SVG');
    // 元の $$ が残っていないことを確認
    assert(!result.includes('$$'), 'Should not contain original $$ delimiters');
    // \frac が正しく処理されていることを確認（"frac" という文字列が含まれている）
    // data-latex 属性や SVG の path ID に frac が含まれるはず
    assert(result.includes('frac') || result.includes('\\frac'),
           'Result should contain frac (the fraction command should be processed correctly)');
  });
});
