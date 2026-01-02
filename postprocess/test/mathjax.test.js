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

  it('should wrap math in mjx-container with class="MathJax"', async () => {
    const html = '<p>Inline: \\(x^2\\) and display: $$y^2$$</p>';
    const result = await processMathJaxHTML(html);

    // mjx-container が含まれているか確認
    assert(result.includes('mjx-container'), 'Result should contain mjx-container element');
    // class="MathJax" が含まれているか確認
    assert(result.includes('class="MathJax"'), 'mjx-container should have class="MathJax"');
  });

  it('should distinguish inline and display math with display attribute', async () => {
    const inlineHTML = '<p>\\(x^2\\)</p>';
    const displayHTML = '<p>$$y^2$$</p>';

    const inlineResult = await processMathJaxHTML(inlineHTML);
    const displayResult = await processMathJaxHTML(displayHTML);

    // inline math は display 属性を持たない
    assert(inlineResult.includes('mjx-container'), 'Inline should have mjx-container');
    assert(!inlineResult.includes('display="true"'), 'Inline should not have display="true"');

    // display math は display="true" 属性を持つ
    assert(displayResult.includes('mjx-container'), 'Display should have mjx-container');
    assert(displayResult.includes('display="true"'), 'Display should have display="true"');
  });

  it('should not process math inside <code> or <pre> tags', async () => {
    const html = '<p>Code: <code>\\(E=mc^2\\)</code> and Pre: <pre>$$x^2$$</pre></p>';
    const result = await processMathJaxHTML(html);

    assert(result.includes('\\(E=mc^2\\)'), 'Should keep LaTeX in code tag');
    assert(result.includes('$$x^2$$'), 'Should keep LaTeX in pre tag');
    assert(!result.includes('svg'), 'Should not contain SVG when math is only in code/pre');
  });
});
