import { describe, it } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { HighlightProcessor } from '../lib/highlight.js';

describe('HighlightProcessor for Markdown', () => {
  it('applies() should detect markdown code blocks', async () => {
    const processor = new HighlightProcessor();
    assert.strictEqual(processor.applies(new JSDOM('<pre><code class="language-html"></code></pre>').window.document.body), true);
  });

  it('should apply syntax highlighting to markdown code blocks with language-* class', async () => {
    const html = `
      <pre><code class="language-javascript">
function hello() {
  console.log("Hello, World!");
}
      </code></pre>
    `;

    const { window } = new JSDOM(html);
    const dom = window.document.body;

    const processor = new HighlightProcessor();
    await processor.run(dom);

    const code = dom.querySelector('pre code');

    // highlight.js が適用されると hljs クラスが追加される
    assert(code.classList.contains('hljs'), 'Should have hljs class');

    // シンタックスハイライト用の span タグが追加される
    const spans = code.querySelectorAll('span');
    assert(spans.length > 0, 'Should have syntax highlighting spans');
  });
});
