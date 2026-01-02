import { describe, it } from 'node:test';
import assert from 'node:assert';
import { processMathJax } from '../lib/mathjax.js';

describe('processMathJax', () => {
  it('should return HTML unchanged if no math notation exists', async () => {
    const html = '<p>This is plain text without math.</p>';
    const result = await processMathJax(html);
    assert.strictEqual(result, html);
  });

  it('should process inline LaTeX notation \\(...\\)', async () => {
    const html = '<p>Inline math: \\(E = mc^2\\)</p>';
    const result = await processMathJax(html);

    // 結果に SVG が含まれているか確認
    assert(result.includes('svg') || result.includes('SVG'), 'Result should contain SVG');
    assert(result.length > html.length, 'Processed HTML should be longer than original');
  });

  it('should process display LaTeX notation $$...$$', async () => {
    const html = '<p>Display math: $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$</p>';
    const result = await processMathJax(html);

    // 結果に SVG が含まれているか確認
    assert(result.includes('svg') || result.includes('SVG'), 'Result should contain SVG');
  });

  it('should handle multiple math expressions', async () => {
    const html = '<p>First: \\(a^2 + b^2 = c^2\\) and second: \\(E = mc^2\\)</p>';
    const result = await processMathJax(html);

    // 結果に SVG が含まれているか確認
    assert(result.includes('svg') || result.includes('SVG'), 'Result should contain SVG');
  });

  it('should handle errors gracefully', async () => {
    // 無効な LaTeX 記法
    const html = '<p>Invalid: \\(\\broken\\math\\)</p>';
    const result = await processMathJax(html);

    // エラーが発生しても何らかの結果が返ることを確認
    assert(typeof result === 'string');
  });
});
