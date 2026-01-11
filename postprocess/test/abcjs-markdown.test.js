import { describe, it } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { ABCProcessor } from '../lib/abcjs.js';

describe('ABCProcessor for Markdown', () => {
  it('applies() should detect markdown ABC blocks', async () => {
    const processor = new ABCProcessor();
    assert.strictEqual(processor.applies(new JSDOM('<pre><code class="language-abc"></code></pre>').window.document.body), true);
  });

  it('should convert markdown pre > code.language-abc to SVG container', async () => {
    const html = `
      <pre><code class="language-abc">
X:1
T:Test
M:4/4
K:C
C D E F | G A B c |
      </code></pre>
    `;

    const { window } = new JSDOM(html);
    const dom = window.document.body;

    const processor = new ABCProcessor();
    await processor.run(dom);

    // pre が div.abc-render に置換されているはず
    const container = dom.querySelector('div.abc-render');
    assert(container, 'Should have abc-render container');
    assert.strictEqual(dom.querySelector('pre'), null, 'Should have removed pre element');

    // SVG が生成されているか確認 (abcjs が正しく動作していれば)
    const svg = container.querySelector('svg');
    assert(svg, 'Should have SVG inside container');
  });
});
