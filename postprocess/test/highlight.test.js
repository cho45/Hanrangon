import { describe, it } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { HighlightProcessor } from '../lib/highlight.js';
import { assertHTMLContains } from './helpers/html-diff.js';

describe('HighlightProcessor', () => {
  it('applies() should detect code blocks', async () => {
    const processor = new HighlightProcessor();
    assert.strictEqual(processor.applies(new JSDOM('<pre class="code"></pre>').window.document.body), true);
    assert.strictEqual(processor.applies(new JSDOM('<p>Plain text</p>').window.document.body), false);
  });

  it('should apply syntax highlighting to code blocks with lang-* class', async () => {
    const html = `
      <pre class="code lang-javascript">
function hello() {
  console.log("Hello, World!");
}
      </pre>
    `;

    const { window } = new JSDOM(html);
    const dom = window.document.body;

    const processor = new HighlightProcessor();
    await processor.run(dom);

    const pre = dom.querySelector('pre.code');

    // highlight.js が適用されると hljs クラスが追加される
    assert(pre.classList.contains('hljs'), 'Should have hljs class');

    // シンタックスハイライト用の span タグが追加される
    const spans = pre.querySelectorAll('span');
    assert(spans.length > 0, 'Should have syntax highlighting spans');
  });

  it('should not process code blocks without lang-* class', async () => {
    const html = `
      <pre class="code">
function hello() {
  console.log("Hello, World!");
}
      </pre>
    `;

    const { window } = new JSDOM(html);
    const dom = window.document.body;
    const originalContent = dom.querySelector('pre').textContent;

    const processor = new HighlightProcessor();
    await processor.run(dom);

    const pre = dom.querySelector('pre.code');

    // highlight.js が適用されていないことを確認
    assert(!pre.classList.contains('hljs'), 'Should not have hljs class');
    assert.strictEqual(pre.textContent.trim(), originalContent.trim(), 'Content should not change');
  });

  it('should handle multiple code blocks', async () => {
    const html = `
      <pre class="code lang-python">
def hello():
    print("Hello")
      </pre>
      <pre class="code lang-javascript">
function hello() {
  console.log("Hello");
}
      </pre>
    `;

    const { window } = new JSDOM(html);
    const dom = window.document.body;

    const processor = new HighlightProcessor();
    await processor.run(dom);

    const pres = dom.querySelectorAll('pre.code');
    assert.strictEqual(pres.length, 2, 'Should have 2 code blocks');

    // 両方のコードブロックがハイライトされているか確認
    pres.forEach(pre => {
      assert(pre.classList.contains('hljs'), 'Each block should have hljs class');
    });
  });

  it('should preserve other classes on pre element', async () => {
    const html = `
      <pre class="code lang-ruby custom-class">
puts "Hello"
      </pre>
    `;

    const { window } = new JSDOM(html);
    const dom = window.document.body;

    const processor = new HighlightProcessor();
    await processor.run(dom);

    const pre = dom.querySelector('pre');
    assert(pre.classList.contains('code'), 'Should preserve code class');
    assert(pre.classList.contains('custom-class'), 'Should preserve custom class');
    assert(pre.classList.contains('hljs'), 'Should add hljs class');
  });
});
